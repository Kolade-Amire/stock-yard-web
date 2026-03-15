"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { LoaderCircle, MessageSquarePlus, Send, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { stockYardClient } from "@/lib/stock-yard/client";

type ChatTurn = {
  role: "user" | "assistant";
  content: string;
};

type ChatPanelProps = {
  symbol: string;
};

export function ChatPanel({ symbol }: ChatPanelProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [conversation, setConversation] = useState<ChatTurn[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setOpen(false);
    setDraft("");
    setSessionId(undefined);
    setConversation([]);
    setErrorMessage(null);
  }, [symbol]);

  async function sendMessage() {
    const message = draft.trim();

    if (!message || isSubmitting) {
      return;
    }

    const nextConversation = [...conversation, { role: "user" as const, content: message }];

    setDraft("");
    setErrorMessage(null);
    setConversation(nextConversation);
    setIsSubmitting(true);

    try {
      const response = await stockYardClient.sendChatMessage({
        symbol,
        sessionId,
        message,
        conversation,
      });

      setSessionId(response.sessionId);
      setConversation((current) => [...current, { role: "assistant", content: response.answer }]);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to send message.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <div className="hidden xl:block">
        <ChatSurface
          symbol={symbol}
          conversation={conversation}
          draft={draft}
          setDraft={setDraft}
          isSubmitting={isSubmitting}
          errorMessage={errorMessage}
          onSend={sendMessage}
        />
      </div>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger asChild>
          <Button className="fixed bottom-4 right-4 z-30 xl:hidden">
            <MessageSquarePlus className="mr-2 size-4" />
            Chat
          </Button>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-[color:rgba(24,18,14,0.44)]" />
          <Dialog.Content className="fixed inset-x-0 bottom-0 z-50 rounded-t-[32px] border border-(--line) bg-(--surface) p-4 shadow-[0_-24px_60px_rgba(56,44,18,0.22)]">
            <div className="mb-4 flex items-center justify-between">
              <Dialog.Title className="font-(family-name:--font-display) text-2xl text-(--ink)">Ticker chat</Dialog.Title>
              <Dialog.Close asChild>
                <button type="button" className="rounded-full border border-(--line) p-2 text-(--ink-muted)">
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
  errorMessage: string | null;
  onSend: () => void;
  mobile?: boolean;
};

function ChatSurface({ symbol, conversation, draft, setDraft, isSubmitting, errorMessage, onSend, mobile = false }: ChatSurfaceProps) {
  return (
    <Card className={mobile ? "px-0 py-0 shadow-none" : "sticky top-24 px-5 py-5"}>
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-(--ink-soft)">Embedded chat</p>
        <h2 className="mt-2 font-(family-name:--font-display) text-3xl text-(--ink)">{symbol} discussion</h2>
        <p className="mt-2 text-sm text-(--ink-muted)">Ticker-scoped grounded chat. Sessions reset when the active symbol changes.</p>
      </div>
      <div className="space-y-3">
        <div className="max-h-[420px] space-y-3 overflow-auto pr-1">
          {conversation.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-(--line-strong) px-4 py-6 text-sm text-(--ink-muted)">
              Ask about near-term risks, earnings setup, analyst tone, ownership signals, or recent headline context.
            </div>
          ) : (
            conversation.map((turn, index) => (
              <div
                key={`${turn.role}-${index}`}
                className={turn.role === "assistant" ? "rounded-[24px] border border-(--line) bg-(--surface-strong) px-4 py-4" : "ml-auto max-w-[85%] rounded-[24px] bg-(--ink) px-4 py-4 text-(--surface)"}
              >
                <p className="mb-2 text-xs uppercase tracking-[0.22em] opacity-70">{turn.role}</p>
                <p className="text-sm leading-6">{turn.content}</p>
              </div>
            ))
          )}
          {isSubmitting ? (
            <div className="flex items-center gap-2 rounded-[24px] border border-(--line) bg-(--surface-strong) px-4 py-4 text-sm text-(--ink-muted)">
              <LoaderCircle className="size-4 animate-spin" />
              Thinking…
            </div>
          ) : null}
        </div>
        <div className="rounded-[24px] border border-(--line) bg-(--surface-strong) p-3">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={`Ask about ${symbol}`}
            className="min-h-28 w-full resize-none bg-transparent text-sm text-(--ink) outline-none placeholder:text-(--ink-soft)"
          />
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-xs text-(--ink-soft)">Grounded to the active ticker only.</p>
            <Button type="button" onClick={onSend} disabled={isSubmitting || !draft.trim()}>
              <Send className="mr-2 size-4" />
              Send
            </Button>
          </div>
        </div>
        {errorMessage ? <p className="text-sm text-(--negative)">{errorMessage}</p> : null}
      </div>
    </Card>
  );
}
