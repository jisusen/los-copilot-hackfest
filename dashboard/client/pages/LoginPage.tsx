import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        navigate("/", { replace: true });
      } else {
        setError(data.error || "Login failed");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--paper-2, #f5f5f5)",
      }}
    >
      <div
        style={{
          width: 360,
          padding: "36px 32px",
          background: "#fff",
          borderRadius: "var(--r, 8px)",
          border: "1px solid var(--line, #e0e0e0)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              width: 48,
              height: 48,
              background: "var(--accent, #0066ff)",
              color: "#fff",
              borderRadius: "50%",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-serif, Georgia)",
              fontWeight: 700,
              fontSize: 20,
              marginBottom: 16,
            }}
          >
            B
          </div>
          <h1
            style={{
              margin: "0 0 4px",
              fontFamily: "var(--font-serif, Georgia)",
              fontSize: 22,
              fontWeight: 600,
              color: "var(--ink, #1a1a1a)",
            }}
          >
            Bank Maju Bersama Gibran
          </h1>
          <p
            style={{
              margin: 0,
              fontFamily: "var(--font-mono, monospace)",
              fontSize: 11,
              color: "var(--ink-3, #888)",
              textTransform: "uppercase",
              letterSpacing: ".1em",
            }}
          >
            Credit Analyst Copilot
          </p>
        </div>

        <form onSubmit={submit}>
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: "block",
                fontFamily: "var(--font-mono, monospace)",
                fontSize: 10,
                color: "var(--ink-3, #888)",
                textTransform: "uppercase",
                letterSpacing: ".08em",
                marginBottom: 6,
              }}
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="analyst01"
              autoFocus
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid var(--line, #e0e0e0)",
                borderRadius: "var(--r, 8px)",
                fontFamily: "var(--font-sans, system-ui)",
                fontSize: 14,
                color: "var(--ink, #1a1a1a)",
                background: "#fff",
                outline: "none",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--accent, #0066ff)";
                e.currentTarget.style.boxShadow =
                  "0 0 0 3px var(--accent-soft, rgba(0,102,255,0.1))";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--line, #e0e0e0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                display: "block",
                fontFamily: "var(--font-mono, monospace)",
                fontSize: 10,
                color: "var(--ink-3, #888)",
                textTransform: "uppercase",
                letterSpacing: ".08em",
                marginBottom: 6,
              }}
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid var(--line, #e0e0e0)",
                borderRadius: "var(--r, 8px)",
                fontFamily: "var(--font-sans, system-ui)",
                fontSize: 14,
                color: "var(--ink, #1a1a1a)",
                background: "#fff",
                outline: "none",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--accent, #0066ff)";
                e.currentTarget.style.boxShadow =
                  "0 0 0 3px var(--accent-soft, rgba(0,102,255,0.1))";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--line, #e0e0e0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          {error && (
            <div
              style={{
                padding: "10px 12px",
                background: "var(--red-soft, #ffeaea)",
                border: "1px solid var(--red-line, #ffcfcf)",
                borderRadius: "var(--r, 8px)",
                fontSize: 12,
                color: "var(--red, #d32f2f)",
                marginBottom: 16,
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn primary"
            style={{ width: "100%", padding: "11px 0", fontSize: 14 }}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div
          style={{
            marginTop: 20,
            textAlign: "center",
            fontFamily: "var(--font-mono, monospace)",
            fontSize: 10,
            color: "var(--ink-4, #bbb)",
          }}
        >
          Same credentials as LOS
        </div>
      </div>
    </div>
  );
}
