import React, { useState, useRef, useEffect } from "react";
import { useChat } from "../hooks/useChat";

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*|_[^_]+_)/g);
  return parts.map((seg, i) => {
    if (seg.startsWith("**") && seg.endsWith("**")) return <strong key={i} style={{ color: "var(--ink)", fontWeight: 600 }}>{seg.slice(2, -2)}</strong>;
    if (seg.startsWith("`") && seg.endsWith("`")) return <code key={i} style={{ background: "var(--paper-3, #e8e8e8)", padding: "1px 5px", borderRadius: 3, fontSize: "0.9em", fontFamily: "var(--font-mono)" }}>{seg.slice(1, -1)}</code>;
    if ((seg.startsWith("*") && seg.endsWith("*")) || (seg.startsWith("_") && seg.endsWith("_"))) return <em key={i} style={{ color: "var(--ink-2)" }}>{seg.slice(1, -1)}</em>;
    return <React.Fragment key={i}>{seg}</React.Fragment>;
  });
}

function MarkdownMessage({ text }: { text: string }) {
  const blocks = text.split(/\n\n+/);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {blocks.map((block, bi) => {
        const lines = block.split("\n");

        // Heading
        if (/^#{1,3} /.test(lines[0])) {
          const level = (lines[0].match(/^(#{1,3})/)?.[1].length ?? 1);
          const headText = lines[0].replace(/^#{1,3} /, "");
          return (
            <div key={bi} style={{ fontFamily: "var(--font-serif)", fontSize: level === 1 ? 16 : level === 2 ? 14 : 13, fontWeight: 600, color: "var(--ink)", marginBottom: 2 }}>
              {renderInline(headText)}
            </div>
          );
        }

        // Bullet list
        const isBullet = (l: string) => /^[-•*] /.test(l.trim());
        const isNumbered = (l: string) => /^\d+\. /.test(l.trim());
        if (lines.every(isBullet)) {
          return (
            <ul key={bi} style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 3 }}>
              {lines.map((l, li) => (
                <li key={li} style={{ fontSize: 13, lineHeight: 1.6, color: "var(--ink-2)" }}>
                  {renderInline(l.trim().replace(/^[-•*] /, ""))}
                </li>
              ))}
            </ul>
          );
        }

        // Numbered list
        if (lines.every(isNumbered)) {
          return (
            <ol key={bi} style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 3 }}>
              {lines.map((l, li) => (
                <li key={li} style={{ fontSize: 13, lineHeight: 1.6, color: "var(--ink-2)" }}>
                  {renderInline(l.trim().replace(/^\d+\. /, ""))}
                </li>
              ))}
            </ol>
          );
        }

        // Mixed block — render line by line
        return (
          <p key={bi} style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: "var(--ink-2)" }}>
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
  "Kenapa CRDE merekomendasikan keputusan ini?",
  "Berapa DTI debitur ini dan dibandingkan batas RAC?",
  "Apa saja kewajiban kredit existing-nya?",
  "Ada flag AML atau indikator fraud?",
  "Bagaimana riwayat pembayaran di SLIK OJK?",
];

export function CopilotChat({ appId, debtorName }: { appId: string; debtorName: string }) {
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
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
  }

  return (
    <div
      data-testid="chat-panel"
      style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, background: "#fff", borderLeft: "1px solid var(--line)" }}
    >
      {/* Header */}
      <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid var(--line)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <div style={{ width: 24, height: 24, background: "var(--accent)", color: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: 12 }}>C</div>
          <h3 style={{ margin: 0, fontFamily: "var(--font-serif)", fontSize: 15, fontWeight: 600, color: "var(--ink)" }}>Copilot Chat</h3>
          <div style={{ flex: 1 }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-4)" }}>
            <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "var(--green)", marginRight: 4 }} />
            Connected
          </span>
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-3)", letterSpacing: ".02em" }}>
          Scoped to {appId} · grounded in agent-extracted LOS data
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflow: "auto", padding: "18px 20px", display: "flex", flexDirection: "column", gap: 18 }}>
        {/* Suggested questions */}
        {messages.length === 0 && showSuggested && (
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>
              Pertanyaan yang disarankan
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {SUGGESTED.map((q, i) => (
                <button
                  key={i}
                  data-testid={`suggested-question-${i}`}
                  onClick={() => submitSuggested(q)}
                  style={{
                    textAlign: "left", border: "1px solid var(--line)", background: "#fff",
                    padding: "8px 10px", borderRadius: "var(--r)",
                    fontSize: 12, color: "var(--ink-2)", cursor: "pointer",
                    fontFamily: "var(--font-sans)",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent-line)"; e.currentTarget.style.background = "var(--accent-soft)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.background = "#fff"; }}
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
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, color: msg.role === "user" ? "var(--ink-2)" : "var(--accent)", textTransform: "uppercase", letterSpacing: ".08em" }}>
                {msg.role === "user" ? "Analis" : "Copilot"}
              </span>
            </div>
            <div style={{
              fontSize: 13, lineHeight: 1.6,
              color: msg.role === "user" ? "var(--ink)" : "var(--ink-2)",
              fontFamily: msg.role === "user" ? "var(--font-sans)" : "var(--font-mono)",
              padding: msg.role === "assistant" ? "12px 14px" : 0,
              background: msg.role === "assistant" ? "var(--paper-2)" : "transparent",
              border: msg.role === "assistant" ? "1px solid var(--line)" : "none",
              borderRadius: msg.role === "assistant" ? "var(--r)" : 0,
            }}>
              {msg.role === "assistant" ? <MarkdownMessage text={msg.content} /> : msg.content}
            </div>
          </div>
        ))}

        {/* Streaming */}
        {streaming && streamingText && (
          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, color: "var(--accent)", textTransform: "uppercase", letterSpacing: ".08em" }}>Copilot</span>
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.6, color: "var(--ink-2)", fontFamily: "var(--font-mono)", padding: "12px 14px", background: "var(--paper-2)", border: "1px solid var(--line)", borderRadius: "var(--r)" }}>
              <MarkdownMessage text={streamingText} /><span className="blink" style={{ color: "var(--accent)" }}>▌</span>
            </div>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div style={{ padding: "12px 20px", borderTop: "1px solid var(--line)" }}>
        <div style={{ position: "relative", display: "flex", gap: 8 }}>
          <textarea
            data-testid="chat-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Tanya tentang aplikasi ini…"
            disabled={streaming}
            rows={1}
            style={{
              flex: 1, padding: "10px 12px", minHeight: 42, maxHeight: 120,
              border: "1px solid var(--line)", borderRadius: "var(--r)",
              fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink)",
              outline: "none", resize: "none",
            }}
            onFocus={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.boxShadow = "0 0 0 3px var(--accent-soft)"; }}
            onBlur={e => { e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.boxShadow = "none"; }}
          />
          <button
            data-testid="chat-submit"
            className="btn primary"
            onClick={submit}
            disabled={streaming || !input.trim()}
            style={{ padding: "8px 14px", alignSelf: "flex-end" }}
          >
            Send
          </button>
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-4)", marginTop: 6 }}>
          Enter — send · Shift+Enter — newline
        </div>
      </div>
    </div>
  );
}
