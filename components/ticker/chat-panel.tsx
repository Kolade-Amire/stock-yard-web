"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { ChevronDown, ChevronUp, LoaderCircle, MessageSquarePlus, Send, X } from "lucide-react";
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
  const [desktopExpanded, setDesktopExpanded] = useState(true);
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
        {desktopExpanded ? (
          <ChatSurface
            symbol={symbol}
            conversation={conversation}
            draft={draft}
            setDraft={setDraft}
            isSubmitting={isSubmitting}
            errorMessage={errorMessage}
            onSend={sendMessage}
            onToggleCollapse={() => setDesktopExpanded(false)}
          />
        ) : (
          <Card variant="rail" className="sticky top-24 px-4 py-4">
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
          <Dialog.Content className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border border-(--line) bg-(--surface-overlay) p-4 shadow-[var(--shadow-drawer)]">
            <div className="mb-4 flex items-center justify-between">
              <Dialog.Title className="text-lg font-bold text-(--ink-strong)">AI Chat</Dialog.Title>
              <Dialog.Close asChild>
                <button type="button" className="rounded-lg border border-(--line) p-2 text-(--ink-muted) hover:bg-(--surface)">
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
  onToggleCollapse?: () => void;
  mobile?: boolean;
};

function ChatSurface({ symbol, conversation, draft, setDraft, isSubmitting, errorMessage, onSend, onToggleCollapse, mobile = false }: ChatSurfaceProps) {
  return (
    <Card variant="rail" className={mobile ? "px-0 py-0 shadow-none" : "sticky top-24 px-4 py-4"}>
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
        <div className="max-h-[420px] space-y-2 overflow-auto pr-1">
          {conversation.length === 0 ? (
            <div className="rounded-lg border border-dashed border-(--line-strong) bg-(--surface) px-4 py-5 text-sm text-(--ink-muted)">
              Ask about risks, earnings, analyst tone, ownership, or recent headlines.
            </div>
          ) : (
            conversation.map((turn, index) => (
              <div
                key={`${turn.role}-${index}`}
                className={turn.role === "assistant" ? "rounded-lg border border-(--line) bg-(--surface) px-4 py-3" : "ml-auto max-w-[85%] rounded-lg bg-(--accent) px-4 py-3 text-white"}
              >
                <p className="mb-1 text-[11px] font-medium uppercase tracking-wider opacity-60">{turn.role}</p>
                <p className="text-sm leading-relaxed">{turn.content}</p>
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
        <div className="rounded-lg border border-(--line) bg-(--surface) p-3">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={`Ask about ${symbol}…`}
            className="min-h-24 w-full resize-none bg-transparent text-sm text-(--ink) outline-none placeholder:text-(--ink-soft)"
          />
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="text-xs text-(--ink-soft)">Grounded to the active ticker.</p>
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
