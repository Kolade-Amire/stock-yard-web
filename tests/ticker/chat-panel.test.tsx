import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ChatPanel } from "@/components/ticker/chat-panel";
import { stockYardClient } from "@/lib/stock-yard/client";

vi.mock("@/lib/stock-yard/client", () => ({
  stockYardClient: {
    sendChatMessage: vi.fn(),
  },
}));

function buildChatResponse(answer: string) {
  return {
    symbol: "AAPL",
    sessionId: "session-1",
    answer,
    highlights: [],
    usedTools: [],
    limitations: [],
  };
}

async function flushAsyncWork() {
  await act(async () => {
    await Promise.resolve();
  });
}

describe("ChatPanel", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it("sends the draft when Enter is pressed", async () => {
    const sendChatMessage = vi.mocked(stockYardClient.sendChatMessage);
    sendChatMessage.mockResolvedValue(buildChatResponse("Solid momentum."));

    render(<ChatPanel symbol="AAPL" />);

    const textarea = screen.getByPlaceholderText("Ask about AAPL…");
    fireEvent.change(textarea, { target: { value: "What changed this week?" } });
    fireEvent.keyDown(textarea, { key: "Enter" });

    await waitFor(() => {
      expect(sendChatMessage).toHaveBeenCalledWith({
        symbol: "AAPL",
        sessionId: undefined,
        message: "What changed this week?",
        conversation: [{ role: "user", content: "What changed this week?" }],
      });
    });
  });

  it("does not send when Shift+Enter is pressed", () => {
    const sendChatMessage = vi.mocked(stockYardClient.sendChatMessage);

    render(<ChatPanel symbol="AAPL" />);

    const textarea = screen.getByPlaceholderText("Ask about AAPL…");
    fireEvent.change(textarea, { target: { value: "Line one" } });
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: true });

    expect(sendChatMessage).not.toHaveBeenCalled();
    expect(screen.getByDisplayValue("Line one")).toBeInTheDocument();
  });

  it("reveals assistant responses progressively and disables send during reveal", async () => {
    vi.useFakeTimers();

    const sendChatMessage = vi.mocked(stockYardClient.sendChatMessage);
    sendChatMessage.mockResolvedValue({
      ...buildChatResponse("abcdefghij"),
    });

    render(<ChatPanel symbol="AAPL" />);

    const textarea = screen.getByPlaceholderText("Ask about AAPL…");
    fireEvent.change(textarea, { target: { value: "Give me the short version." } });
    fireEvent.click(screen.getAllByRole("button", { name: /send/i })[0]);

    await flushAsyncWork();

    expect(sendChatMessage).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/^abcd/)).toBeInTheDocument();

    expect(screen.queryByText("abcdefghij")).not.toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /send/i })[0]).toBeDisabled();

    await act(async () => {
      vi.advanceTimersByTime(18);
    });

    expect(screen.getByText(/^abcdefgh/)).toBeInTheDocument();

    await act(async () => {
      vi.runAllTimers();
    });

    await flushAsyncWork();

    expect(screen.getByText("abcdefghij")).toBeInTheDocument();
    fireEvent.change(textarea, { target: { value: "Follow up question" } });
    expect(screen.getAllByRole("button", { name: /send/i })[0]).not.toBeDisabled();
  });

  it("keeps the user turn and shows an error when the request fails", async () => {
    const sendChatMessage = vi.mocked(stockYardClient.sendChatMessage);
    sendChatMessage.mockRejectedValue(new Error("Backend unavailable"));

    render(<ChatPanel symbol="AAPL" />);

    const textarea = screen.getByPlaceholderText("Ask about AAPL…");
    fireEvent.change(textarea, { target: { value: "Summarize risks." } });
    fireEvent.click(screen.getAllByRole("button", { name: /send/i })[0]);

    await waitFor(() => {
      expect(screen.getByText("Summarize risks.")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText("Backend unavailable")).toBeInTheDocument();
    });

    expect(screen.queryByText(/^assistant$/i)).not.toBeInTheDocument();
  });

  it("resets the conversation and cancels reveal timers when the symbol changes", async () => {
    vi.useFakeTimers();

    const sendChatMessage = vi.mocked(stockYardClient.sendChatMessage);
    sendChatMessage.mockResolvedValue(buildChatResponse("abcdefghij"));

    const { rerender } = render(<ChatPanel key="AAPL" symbol="AAPL" />);

    const textarea = screen.getByPlaceholderText("Ask about AAPL…");
    fireEvent.change(textarea, { target: { value: "Summarize the chart." } });
    fireEvent.click(screen.getAllByRole("button", { name: /send/i })[0]);

    await flushAsyncWork();

    expect(screen.getByText(/^abcd/)).toBeInTheDocument();

    rerender(<ChatPanel key="MSFT" symbol="MSFT" />);

    expect(screen.getByPlaceholderText("Ask about MSFT…")).toBeInTheDocument();
    expect(screen.queryByText("Summarize the chart.")).not.toBeInTheDocument();
    expect(screen.queryByText(/^abcd/)).not.toBeInTheDocument();

    await act(async () => {
      vi.runAllTimers();
    });

    expect(screen.queryByText("abcdefghij")).not.toBeInTheDocument();
  });
});
