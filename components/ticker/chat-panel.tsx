"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { ChevronDown, ChevronUp, LoaderCircle, MessageSquarePlus, Send, X } from "lucide-react";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { stockYardClient } from "@/lib/stock-yard/client";

type ChatTurn = {
  id: string;
  role: "user" | "assistant";
  content: string;
  status: "final" | "revealing";
};

type ChatPanelProps = {
  symbol: string;
};

const REVEAL_BASE_DELAY_MS = 18;

function getRevealStep(totalLength: number, revealedLength: number) {
  if (totalLength <= 80) {
    return 4;
  }

  if (totalLength <= 180) {
    return revealedLength < 48 ? 6 : 10;
  }

  return revealedLength < 72 ? 8 : 14;
}

function getRevealDelay(totalLength: number) {
  if (totalLength > 260) {
    return 12;
  }

  if (totalLength > 120) {
    return 15;
  }

  return REVEAL_BASE_DELAY_MS;
}

function toRequestConversation(conversation: ChatTurn[]) {
  return conversation
    .filter((turn) => turn.status === "final")
    .map(({ role, content }) => ({ role, content }));
}

export function ChatPanel({ symbol }: ChatPanelProps) {
  const [open, setOpen] = useState(false);
  const [desktopExpanded, setDesktopExpanded] = useState(true);
  const [draft, setDraft] = useState("");
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [conversation, setConversation] = useState<ChatTurn[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const revealTimerRef = useRef<number | null>(null);
  const mountedRef = useRef(false);
  const turnIdRef = useRef(0);

  const isRevealing = conversation.some((turn) => turn.status === "revealing");
  const isBusy = isSubmitting || isRevealing;

  function nextTurnId() {
    turnIdRef.current += 1;
    return `chat-turn-${turnIdRef.current}`;
  }

  function clearRevealTimer() {
    if (revealTimerRef.current !== null) {
      window.clearTimeout(revealTimerRef.current);
      revealTimerRef.current = null;
    }
  }

  function revealAssistantAnswer(turnId: string, answer: string, revealedLength = 0) {
    if (!mountedRef.current) {
      clearRevealTimer();
      return;
    }

    const nextLength = Math.min(answer.length, revealedLength + getRevealStep(answer.length, revealedLength));
    const nextContent = answer.slice(0, nextLength);
    const nextStatus = nextLength >= answer.length ? "final" : "revealing";

    setConversation((current) =>
      current.map((turn) =>
        turn.id === turnId
          ? {
              ...turn,
              content: nextContent,
              status: nextStatus,
            }
          : turn,
      ),
    );

    if (nextStatus === "final") {
      clearRevealTimer();
      return;
    }

    revealTimerRef.current = window.setTimeout(() => {
      revealAssistantAnswer(turnId, answer, nextLength);
    }, getRevealDelay(answer.length));
  }

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      clearRevealTimer();
    };
  }, []);

  async function sendMessage() {
    const message = draft.trim();

    if (!message || isBusy) {
      return;
    }

    const userTurn: ChatTurn = {
      id: nextTurnId(),
      role: "user",
      content: message,
      status: "final",
    };
    const requestConversation = [
      ...toRequestConversation(conversation),
      { role: "user" as const, content: message },
    ];

    setDraft("");
    setErrorMessage(null);
    setConversation((current) => [...current, userTurn]);
    setIsSubmitting(true);

    try {
      const response = await stockYardClient.sendChatMessage({
        symbol,
        sessionId,
        message,
        conversation: requestConversation,
      });

      if (!mountedRef.current) {
        return;
      }

      const assistantTurnId = nextTurnId();
      setSessionId(response.sessionId);
      setConversation((current) => [
        ...current,
        {
          id: assistantTurnId,
          role: "assistant",
          content: "",
          status: "revealing",
        },
      ]);
      setIsSubmitting(false);
      revealAssistantAnswer(assistantTurnId, response.answer);
    } catch (error) {
      if (!mountedRef.current) {
        return;
      }

      setErrorMessage(error instanceof Error ? error.message : "Unable to send message.");
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <div className="hidden xl:block">
        {desktopExpanded ? (
          <ChatSurface
            symbol={symbol}
            conversation={conversation}
            draft={draft}
            setDraft={setDraft}
            isSubmitting={isSubmitting}
            isBusy={isBusy}
            errorMessage={errorMessage}
            onSend={sendMessage}
            onToggleCollapse={() => setDesktopExpanded(false)}
          />
        ) : (
          <Card variant="rail" material="glass" className="sticky top-24 px-4 py-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-(--ink-soft)">AI Chat</p>
                  <h2 className="mt-0.5 text-base font-semibold text-(--ink-strong)">{symbol} discussion</h2>
                </div>
                <Button type="button" variant="ghost" size="compact" onClick={() => setDesktopExpanded(true)}>
                  <ChevronDown className="size-4" />
                  Open
                </Button>
              </div>
              <p className="text-sm text-(--ink-muted)">Grounded Q&A on this symbol.</p>
            </div>
          </Card>
        )}
      </div>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger asChild>
          <Button className="fixed bottom-4 right-4 z-30 shadow-[var(--shadow-fab)] xl:hidden">
            <MessageSquarePlus className="mr-2 size-4" />
            Chat
          </Button>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-(--overlay)" />
          <Dialog.Content className="glass-drawer fixed inset-x-0 bottom-0 z-50 rounded-t-2xl p-4">
            <div className="mb-4 flex items-center justify-between">
              <Dialog.Title className="text-lg font-bold text-(--ink-strong)">AI Chat</Dialog.Title>
              <Dialog.Close asChild>
                <button type="button" className="glass-control rounded-lg p-2 text-(--ink-muted)">
                  <X className="size-4" />
                </button>
              </Dialog.Close>
            </div>
            <ChatSurface
              symbol={symbol}
              conversation={conversation}
              draft={draft}
              setDraft={setDraft}
              isSubmitting={isSubmitting}
              isBusy={isBusy}
              errorMessage={errorMessage}
              onSend={sendMessage}
              mobile
            />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}

type ChatSurfaceProps = {
  symbol: string;
  conversation: ChatTurn[];
  draft: string;
  setDraft: (value: string) => void;
  isSubmitting: boolean;
  isBusy: boolean;
  errorMessage: string | null;
  onSend: () => void;
  onToggleCollapse?: () => void;
  mobile?: boolean;
};

function ChatSurface({ symbol, conversation, draft, setDraft, isSubmitting, isBusy, errorMessage, onSend, onToggleCollapse, mobile = false }: ChatSurfaceProps) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = scrollContainerRef.current;

    if (!container) {
      return;
    }

    if (typeof container.scrollTo === "function") {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
      return;
    }

    container.scrollTop = container.scrollHeight;
  }, [conversation, isSubmitting]);

  function handleTextareaKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.nativeEvent.isComposing || event.shiftKey) {
      return;
    }

    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    onSend();
  }

  return (
    <Card
      variant="rail"
      material={mobile ? "default" : "glass"}
      className={mobile ? "border-transparent bg-transparent px-0 py-0 shadow-none backdrop-blur-0" : "sticky top-24 px-4 py-4"}
    >
      <div className="mb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-(--ink-soft)">AI Chat</p>
            <h2 className="mt-1 text-base font-semibold text-(--ink-strong)">{symbol} discussion</h2>
          </div>
          {!mobile && onToggleCollapse ? (
            <Button type="button" variant="ghost" size="compact" onClick={onToggleCollapse}>
              <ChevronUp className="size-4" />
              Hide
            </Button>
          ) : null}
        </div>
        <p className="mt-1 text-sm text-(--ink-muted)">Ticker-scoped chat. Sessions reset when the symbol changes.</p>
      </div>
      <div className="space-y-2">
        <div ref={scrollContainerRef} className="max-h-[420px] space-y-2 overflow-auto pr-1">
          {conversation.length === 0 ? (
            <div className="rounded-lg border border-dashed border-(--line-strong) bg-(--surface) px-4 py-5 text-sm text-(--ink-muted)">
              Ask about risks, earnings, analyst tone, ownership, or recent headlines.
            </div>
          ) : (
            conversation.map((turn) => (
              <div
                key={turn.id}
                className={turn.role === "assistant" ? "rounded-lg border border-(--line) bg-(--surface) px-4 py-3" : "ml-auto max-w-[85%] rounded-lg bg-(--accent) px-4 py-3 text-(--accent-contrast)"}
              >
                <p className="mb-1 text-[11px] font-medium uppercase tracking-wider opacity-60">{turn.role}</p>
                <p className="text-sm leading-relaxed">
                  {turn.content}
                  {turn.status === "revealing" ? <span className="inline-block w-2 animate-pulse text-(--ink-soft)">|</span> : null}
                </p>
              </div>
            ))
          )}
          {isSubmitting ? (
            <div className="flex items-center gap-2 rounded-lg border border-(--line) bg-(--surface) px-4 py-3 text-sm text-(--ink-muted)">
              <LoaderCircle className="size-4 animate-spin" />
              Thinking…
            </div>
          ) : null}
        </div>
        <div className="glass-subcard glass-input-shell rounded-xl p-3">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleTextareaKeyDown}
            placeholder={`Ask about ${symbol}…`}
            className="min-h-24 w-full resize-none bg-transparent text-sm text-(--ink) outline-none placeholder:text-(--ink-soft)"
          />
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="text-xs text-(--ink-soft)">Enter to send • Shift+Enter for newline</p>
            <button
              type="button"
              onClick={onSend}
              disabled={isBusy || !draft.trim()}
              aria-label="Send message"
              title="Send message"
              className="inline-flex size-8 items-center justify-center rounded-md bg-transparent p-0 text-(--accent) transition-opacity hover:opacity-75 disabled:pointer-events-none disabled:opacity-35"
            >
              <Send className="size-4" />
            </button>
          </div>
        </div>
        {errorMessage ? <p className="text-sm text-(--negative)">{errorMessage}</p> : null}
      </div>
    </Card>
  );
}
