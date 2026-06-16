import React, { useState, useRef, useEffect } from "react";
import { useChat } from "../hooks/useChat";

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*|_[^_]+_)/g);
  return parts.map((seg, i) => {
    if (seg.startsWith("**") && seg.endsWith("**"))
      return (
        <strong key={i} className="text-slate-900 font-semibold">
          {seg.slice(2, -2)}
        </strong>
      );
    if (seg.startsWith("`") && seg.endsWith("`"))
      return (
        <code
          key={i}
          className="bg-slate-100 px-1 py-0.5 rounded text-[0.9em] font-mono text-slate-800"
        >
          {seg.slice(1, -1)}
        </code>
      );
    if (
      (seg.startsWith("*") && seg.endsWith("*")) ||
      (seg.startsWith("_") && seg.endsWith("_"))
    )
      return (
        <em key={i} className="text-slate-600">
          {seg.slice(1, -1)}
        </em>
      );
    return <React.Fragment key={i}>{seg}</React.Fragment>;
  });
}

function MarkdownMessage({ text }: { text: string }) {
  const blocks = text.split(/\n\n+/);
  return (
    <div className="flex flex-col gap-1.5">
      {blocks.map((block, bi) => {
        const lines = block.split("\n");

        // Heading
        if (/^#{1,3} /.test(lines[0])) {
          const level = lines[0].match(/^(#{1,3})/)?.[1].length ?? 1;
          const headText = lines[0].replace(/^#{1,3} /, "");
          const size = level === 1 ? "text-[13px]" : level === 2 ? "text-[12px]" : "text-[11px]";
          return (
            <div key={bi} className={`${size} font-semibold text-slate-900 mb-0.5`}>
              {renderInline(headText)}
            </div>
          );
        }

        // Bullet list
        const isBullet = (l: string) => /^[-•*] /.test(l.trim());
        const isNumbered = (l: string) => /^\d+\. /.test(l.trim());
        if (lines.every(isBullet)) {
          return (
            <ul key={bi} className="m-0 pl-[16px] flex flex-col gap-0">
              {lines.map((l, li) => (
                <li key={li} className="text-[12px] leading-snug text-slate-700">
                  {renderInline(l.trim().replace(/^[-•*] /, ""))}
                </li>
              ))}
            </ul>
          );
        }

        // Numbered list
        if (lines.every(isNumbered)) {
          return (
            <ol key={bi} className="m-0 pl-[16px] flex flex-col gap-0">
              {lines.map((l, li) => (
                <li key={li} className="text-[12px] leading-snug text-slate-700">
                  {renderInline(l.trim().replace(/^\d+\. /, ""))}
                </li>
              ))}
            </ol>
          );
        }

        // Mixed block — render line by line
        return (
          <p key={bi} className="m-0 text-[12px] leading-snug text-slate-700">
            {lines.map((l, li) => (
              <React.Fragment key={li}>
                {renderInline(l)}
                {li < lines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}

const SUGGESTED = [
  "Why did CRDE recommend this decision?",
  "What is the applicant's DBR and how does it compare to the RAC limit?",
  "What are the applicant's existing credit obligations?",
  "Are there any AML flags or fraud indicators?",
  "How is the applicant's payment history in SLIK OJK?",
];

export function CopilotChat({
  appId,
  debtorName,
}: {
  appId: string;
  debtorName: string;
}) {
  const { messages, streaming, streamingText, sendMessage } = useChat(appId);
  const [input, setInput] = useState("");
  const [showSuggested, setShowSuggested] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  function submit() {
    if (!input.trim()) return;
    setShowSuggested(false);
    sendMessage(input);
    setInput("");
  }

  function submitSuggested(q: string) {
    setShowSuggested(false);
    sendMessage(q);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div
      data-testid="chat-panel"
      className="flex flex-col flex-1 min-h-0 bg-white border-l border-slate-200"
    >
      {/* Header */}
      <div className="p-[16px_18px_12px] border-b border-slate-200">
        <div className="flex items-center gap-2 mb-0.5">
          <div className="w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-[10px]">
            C
          </div>
          <h3 className="m-0 text-[13px] font-semibold text-slate-900">
            Copilot Chat
          </h3>
          <div className="flex-1" />
          <span className="font-mono text-[9px] text-slate-400">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1" />
            Connected
          </span>
        </div>
        <div className="font-mono text-[9px] text-slate-400 tracking-wide">
          Scoped to {appId} · grounded in agent-extracted LOS data
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-auto p-[16px_18px] flex flex-col gap-3">
        {/* Suggested questions */}
        {messages.length === 0 && showSuggested && (
          <div>
            <div className="font-mono text-[9px] text-slate-400 uppercase tracking-widest mb-1.5">
              Pertanyaan yang disarankan
            </div>
            <div className="flex flex-col gap-1">
              {SUGGESTED.map((q, i) => (
                <button
                  key={i}
                  data-testid={`suggested-question-${i}`}
                  onClick={() => submitSuggested(q)}
                  className="text-left border border-slate-200 bg-white px-2 py-1.5 rounded-lg text-[11px] text-slate-700 cursor-pointer hover:border-amber-300 hover:bg-amber-50/50 transition-colors"
                >
                  › {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg, i) => (
          <div key={i} data-testid={`chat-message-${i}`}>
            <div className="flex items-baseline gap-1.5 mb-1">
              <span className={`font-mono text-[9px] font-semibold uppercase tracking-widest ${msg.role === "user" ? "text-slate-500" : "text-amber-600"}`}>
                {msg.role === "user" ? "Analyst" : "Copilot"}
              </span>
              <div className="flex-1" />
              {msg.role === "assistant" && (
                <button
                  onClick={() => navigator.clipboard.writeText(msg.content)}
                  className="text-[8px] px-1 py-0.5 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Copy
                </button>
              )}
            </div>
            <div
              className={`text-[13px] leading-relaxed select-text ${
                msg.role === "user"
                  ? "text-slate-900"
                  : "text-slate-700 font-mono p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
              }`}
            >
              {msg.role === "assistant" ? (
                <MarkdownMessage text={msg.content} />
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}

        {/* Streaming */}
        {streaming && streamingText && (
          <div>
            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="font-mono text-[9px] font-semibold uppercase tracking-widest text-amber-600">
                Copilot
              </span>
            </div>
            <div className="text-[13px] leading-relaxed text-slate-700 font-mono p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
              <MarkdownMessage text={streamingText} />
              <span className="text-amber-500 animate-pulse">▌</span>
            </div>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div className="p-[10px_18px] border-t border-slate-200">
        <div className="relative flex gap-2">
          <textarea
            data-testid="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Tanya tentang aplikasi ini…"
            disabled={streaming}
            rows={1}
            className="flex-1 px-2.5 py-2 min-h-[36px] max-h-[100px] border border-slate-200 rounded-lg font-sans text-[13px] text-slate-900 outline-none resize-none transition-colors focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
          />
          <button
            data-testid="chat-submit"
            onClick={submit}
            disabled={streaming || !input.trim()}
            className="self-end px-3 py-1.5 text-[11px] font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
        <div className="font-mono text-[9px] text-slate-400 mt-1">
          Enter — send · Shift+Enter — newline
        </div>
      </div>
    </div>
  );
}
