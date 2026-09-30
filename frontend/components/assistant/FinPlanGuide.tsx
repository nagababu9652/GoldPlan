"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  MessageCircleQuestion,
  Send,
  Sparkles,
  X,
} from "lucide-react";

import {
  getGuideContext,
  getGuideQuickQuestions,
  matchGuideQuery,
} from "@/lib/assistant";

interface GuideMessage {
  id: number;
  role: "user" | "assistant";
  text: string;
  actions?: Array<{ label: string; route: string }>;
  suggestions?: string[];
  matchedEntryId?: string;
}

const INITIAL_MESSAGE: GuideMessage = {
  id: 1,
  role: "assistant",
  text:
    "Hi — I'm FinPlan Guide. I can explain FinPlan, answer common product questions, help you find features, and give you navigation shortcuts. Everything runs locally in your browser.",
  suggestions: [
    "How do I add a client?",
    "How do households work?",
    "What tools are available?",
    "Where do I upload documents?",
  ],
};

export default function FinPlanGuide() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<GuideMessage[]>([INITIAL_MESSAGE]);
  const [lastMatchedEntryId, setLastMatchedEntryId] = useState<string | undefined>();
  const nextId = useRef(2);
  const scrollRef = useRef<HTMLDivElement>(null);

  const context = useMemo(() => getGuideContext(pathname), [pathname]);
  const quickQuestions = useMemo(() => getGuideQuickQuestions(pathname), [pathname]);

  useEffect(() => {
    if (!open) return;
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, open]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function ask(question: string) {
    const value = question.trim();
    if (!value) return;

    const userMessage: GuideMessage = {
      id: nextId.current++,
      role: "user",
      text: value,
    };

    const result = matchGuideQuery(value, pathname, lastMatchedEntryId);

    const assistantMessage: GuideMessage = {
      id: nextId.current++,
      role: "assistant",
      text: result.answer,
      actions: result.actions,
      suggestions: result.suggestions,
      matchedEntryId: result.matchedEntryId,
    };

    if (result.matchedEntryId) {
      setLastMatchedEntryId(result.matchedEntryId);
    }

    setMessages((current) => [...current, userMessage, assistantMessage].slice(-30));
    setInput("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    ask(input);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full border border-obsidian/10 bg-obsidian px-4 py-3 text-sm font-medium text-bone shadow-xl shadow-obsidian/15 transition hover:-translate-y-0.5 hover:bg-obsidian-soft focus:outline-none focus:ring-2 focus:ring-antique focus:ring-offset-2"
        aria-label="Open FinPlan Guide"
        aria-expanded={open}
      >
        <MessageCircleQuestion size={18} />
        <span className="hidden sm:inline">FinPlan Guide</span>
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close FinPlan Guide"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[60] bg-obsidian/20 backdrop-blur-[1px] md:bg-transparent md:backdrop-blur-none"
          />

          <section
            role="dialog"
            aria-modal="true"
            aria-label="FinPlan Guide"
            className="fixed inset-y-0 right-0 z-[70] flex w-full flex-col border-l border-line bg-bone shadow-2xl md:inset-y-auto md:bottom-5 md:right-5 md:h-[min(700px,calc(100vh-40px))] md:w-[400px] md:rounded-2xl md:border"
          >
            <header className="flex items-center justify-between border-b border-line bg-obsidian px-5 py-4 text-bone md:rounded-t-2xl">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-antique text-obsidian">
                  <Sparkles size={17} />
                </div>
                <div className="min-w-0">
                  <h2 className="truncate font-serif text-lg text-antique-light">
                    FinPlan Guide
                  </h2>
                  <p className="truncate font-mono text-[9px] uppercase tracking-[0.16em] text-ash-light">
                    Offline · model-free · read-only
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-2 text-ash-light transition hover:bg-obsidian-soft hover:text-bone"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </header>

            <div className="border-b border-line bg-bone-deep/70 px-5 py-2.5">
              <p className="text-[11px] text-ash">
                Current context:{" "}
                <span className="font-medium text-obsidian">{context.area}</span>
                {context.clientId ? ` · Client #${context.clientId}` : ""}
                {context.groupId ? ` · Group #${context.groupId}` : ""}
              </p>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={message.role === "user" ? "flex justify-end" : "flex justify-start"}
                >
                  <div
                    className={[
                      "max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-6",
                      message.role === "user"
                        ? "rounded-br-md bg-obsidian text-bone"
                        : "rounded-bl-md border border-line bg-white/70 text-obsidian",
                    ].join(" ")}
                  >
                    <p>{message.text}</p>

                    {message.actions && message.actions.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {message.actions.map((action) => (
                          <Link
                            key={`${message.id}-${action.route}-${action.label}`}
                            href={action.route}
                            onClick={() => setOpen(false)}
                            className="inline-flex items-center gap-1.5 rounded-full border border-obsidian/15 bg-bone px-3 py-1.5 text-[11px] font-medium text-obsidian transition hover:border-antique hover:bg-bone-deep"
                          >
                            {action.label}
                            <ArrowRight size={12} />
                          </Link>
                        ))}
                      </div>
                    )}

                    {message.role === "assistant" &&
                      message.suggestions &&
                      message.suggestions.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5 border-t border-line/70 pt-3">
                          {message.suggestions.slice(0, 4).map((suggestion) => (
                            <button
                              key={`${message.id}-${suggestion}`}
                              type="button"
                              onClick={() => ask(suggestion)}
                              className="rounded-full border border-line bg-bone px-2.5 py-1 text-[10px] leading-4 text-ash transition hover:border-antique hover:text-obsidian"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-line bg-white/50 p-4 md:rounded-b-2xl">
              {messages.length <= 2 && (
                <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
                  {quickQuestions.map((question) => (
                    <button
                      key={question}
                      type="button"
                      onClick={() => ask(question)}
                      className="whitespace-nowrap rounded-full border border-line bg-bone px-3 py-1.5 text-[11px] text-ash transition hover:border-antique hover:text-obsidian"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex items-end gap-2">
                <label className="sr-only" htmlFor="finplan-guide-input">
                  Ask FinPlan Guide
                </label>
                <textarea
                  id="finplan-guide-input"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      ask(input);
                    }
                  }}
                  rows={1}
                  placeholder="Ask about FinPlan..."
                  className="max-h-28 min-h-11 flex-1 resize-none rounded-xl border border-line bg-bone px-3.5 py-3 text-sm text-obsidian outline-none transition placeholder:text-ash-light focus:border-antique"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-obsidian text-bone transition hover:bg-obsidian-soft disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Send question"
                >
                  <Send size={16} />
                </button>
              </form>

              <p className="mt-2 text-center text-[10px] text-ash-light">
                Curated FinPlan help only. No AI model or external assistant calls.
              </p>
            </div>
          </section>
        </>
      )}
    </>
  );
}
