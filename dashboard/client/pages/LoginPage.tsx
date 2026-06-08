import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { useAuth } from "../App";
import { Eye, EyeOff, AlertCircle, Sparkles } from "lucide-react";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password.trim()) return;

    setLoading(true);
    try {
      const data = await apiFetch<{ ok: boolean; username: string }>(
        "/api/auth/login",
        {
          method: "POST",
          body: JSON.stringify({ username, password }),
        },
      );
      if (data.ok) {
        login(data.username);
        navigate("/", { replace: true });
      } else {
        setError("Login failed");
      }
    } catch (err: any) {
      setError(
        err.message === "API 401" ? "Invalid credentials" : "Network error",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900 p-4">
      <div
        className="flex flex-col lg:flex-row max-w-4xl w-full bg-white rounded-2xl overflow-hidden"
        style={{ boxShadow: "-1px 6px 20px #000000" }}
      >
        {/* ===== LEFT — Form ===== */}
        <div className="flex-1 p-6 sm:p-8">
          <div className="mb-6">
            {/* Line 1: Logo & Teks JOKI AI sejajar */}
            <div className="flex items-center gap-2 mb-2">
              <img src="/img/logo-login.png" alt="Logo" className="w-10 h-10" />
              <span className="text-xl font-bold text-red-600 tracking-tight">
                JOKI</span>  <span className="text-xl font-bold text-zinc-900 tracking-tight">AI
              </span>
            </div>

            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
              Hello Again!
            </h1>

            <p className="text-zinc-500 text-sm mt-1">
              Let's get started with me
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500">User</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="analyst01"
                autoFocus
                className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-all focus:border-red-600 focus:ring-1 focus:ring-red-600/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 pr-11 bg-zinc-50 border border-zinc-300 rounded-xl text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-all focus:border-red-600 focus:ring-1 focus:ring-red-600/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  {showPw ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 text-sm font-bold rounded-xl bg-red-600 text-white hover:bg-red-700 transition-all shadow-lg shadow-red-600/25 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        {/* ===== RIGHT — Image ===== */}
        <div
          className="hidden lg:flex flex-1 bg-zinc-50 items-center justify-center"
          style={{ margin: "2px" }}
        >
          <img
            src="/img/login3.webp"
            alt="Bank Maju Bersama"
            className="max-w-full max-h-full object-contain rounded-xl"
            style={{ boxShadow: "rgb(0 0 0 / 47%) -1px 6px 20px" }}
          />
        </div>
      </div>
    </div>
  );
}
