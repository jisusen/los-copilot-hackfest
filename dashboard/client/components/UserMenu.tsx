import React, { useState, useRef, useEffect } from "react";

export function UserMenu({ username = "analyst01" }: { username?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div
        className="user-pill"
        style={{ cursor: "pointer" }}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{username}</span>
        <span className="avatar">{username[0]?.toUpperCase() ?? "A"}</span>
        <svg
          viewBox="0 0 24 24"
          width="12"
          height="12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{
            marginLeft: 4,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.15s ease",
            opacity: 0.5,
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            minWidth: 160,
            background: "#fff",
            border: "1px solid var(--line)",
            borderRadius: "var(--r)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
            zIndex: 100,
            padding: "6px",
          }}
        >
          <div
            style={{
              padding: "8px 10px",
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "var(--ink-3)",
              textTransform: "uppercase",
              letterSpacing: ".06em",
              borderBottom: "1px solid var(--line)",
              marginBottom: 4,
            }}
          >
            Signed in as <strong style={{ color: "var(--ink)" }}>{username}</strong>
          </div>
          <button
            onClick={logout}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 10px",
              border: "none",
              borderRadius: "var(--r)",
              background: "transparent",
              cursor: "pointer",
              fontFamily: "var(--font-sans)",
              fontSize: 13,
              color: "var(--red)",
              textAlign: "left",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--red-soft)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <svg
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
