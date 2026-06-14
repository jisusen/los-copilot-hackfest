import { join } from "path";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { wsManager } from "./services/wsManager";
import { handleLoans } from "./routes/loans";
import { handleBatch } from "./routes/batch";
import { handleChat } from "./routes/chat";
import { handleDecisions, handleSessions } from "./routes/decisions";
import { handleInternal } from "./routes/internal";
import { handleSettings } from "./routes/settings";
import { handleSkills } from "./routes/skills";
import { handleAuth } from "./routes/auth";
import { handleAudit } from "./routes/audit";
import { handleNotes } from "./routes/notes";
import autoprefixer from 'autoprefixer';
import cssLoader from 'bun-css-loader';
import tailwindcss from 'tailwindcss';

const PORT = parseInt(process.env.PORT ?? "3003");
const ROOT = join(import.meta.dir, "..");
const DIST = join(ROOT, "dist");
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "*";

function withCors(res: Response, req: Request): Response {
  const origin =
    CORS_ORIGIN === "*" ? (req.headers.get("origin") ?? "*") : CORS_ORIGIN;
  res.headers.set("Access-Control-Allow-Origin", origin);
  res.headers.set("Access-Control-Allow-Credentials", "true");
  res.headers.set("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Cookie");
  return res;
}

// Build client bundle at startup
async function buildClient() {
  console.log("📦 Building client bundle...");
  const result = await Bun.build({
    entrypoints: [join(ROOT, "client/main.tsx")],
    outdir: DIST,
    target: "browser",
    define: {
      "process.env.NODE_ENV": JSON.stringify(
        process.env.NODE_ENV ?? "development",
      ),
    },
    plugins: [
      cssLoader({
        postCssPlugins: [tailwindcss, autoprefixer],
      }),
    ],
  });
  if (!result.success) {
    console.error("Build failed:", result.logs);
    process.exit(1);
  }
  const html = readFileSync(join(ROOT, "client/index.html"), "utf-8");
  writeFileSync(join(DIST, "index.html"), html);
  console.log("✅ Client bundle ready.");
}

await buildClient();

const MIME: Record<string, string> = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function serveFile(path: string): Response | null {
  if (!existsSync(path)) return null;
  const ext = path.substring(path.lastIndexOf("."));
  return new Response(Bun.file(path), {
    headers: {
      "Content-Type": MIME[ext] ?? "application/octet-stream",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}

async function handleRequest(req: Request): Promise<Response> {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return withCors(new Response(null, { status: 204 }), req);
  }

  const url = new URL(req.url);
  const pathname = url.pathname;

  // Auth routes (public)
  if (pathname.startsWith("/api/auth/")) {
    const res = await handleAuth(req, pathname);
    if (res) return withCors(res, req);
  }

  // Internal agent callbacks (no auth)
  if (pathname.startsWith("/api/internal/")) {
    const res = await handleInternal(req, pathname);
    if (res) return withCors(res, req);
  }

  // ── Auth check (disabled for demo) ──
  // const session = getSession(req);
  // const isProtected =
  //   pathname.startsWith("/api/") &&
  //   !pathname.startsWith("/api/auth/") &&
  //   !pathname.startsWith("/api/internal/");
  // if (isProtected && !session) {
  //   return withCors(
  //     Response.json({ error: "Unauthorized" }, { status: 401 }),
  //     req,
  //   );
  // }

  // Public API routes
  if (pathname === "/api/loans" && req.method === "GET") {
    const res = handleLoans(req, url);
    if (res) {
      res.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
      return withCors(res, req);
    }
    return withCors(
      Response.json({ error: "Not found" }, { status: 404 }),
      req,
    );
  }

  if (pathname === "/api/batch" && req.method === "POST") {
    return withCors(await handleBatch(req), req);
  }

  if (pathname === "/api/chat" && req.method === "POST") {
    return withCors(await handleChat(req), req);
  }

  if (pathname === "/api/decisions" && req.method === "GET") {
    const res = await handleDecisions(req, pathname);
    if (res) return withCors(res, req);
  }

  if (pathname.startsWith("/api/decisions/")) {
    const res = await handleDecisions(req, pathname);
    if (res) return withCors(res, req);
  }

  if (pathname.startsWith("/api/sessions/")) {
    const res = await handleSessions(req, pathname);
    if (res) return withCors(res, req);
  }

  if (pathname === "/api/settings") {
    const res = await handleSettings(req);
    if (res) return withCors(res, req);
  }

  if (pathname.startsWith("/api/skills")) {
    const res = await handleSkills(req);
    if (res) return withCors(res, req);
  }

  if (pathname === "/api/audit") {
    const res = await handleAudit(req, url);
    if (res) return withCors(res, req);
  }

  if (pathname.startsWith("/api/notes/") && req.method === "POST") {
    const res = await handleNotes(req, pathname);
    if (res) return withCors(res, req);
  }

  if (pathname.startsWith("/api/")) {
    return withCors(
      Response.json({ error: "Not found" }, { status: 404 }),
      req,
    );
  }

  if (pathname.startsWith("/img/")) {
    const file = serveFile(join(ROOT, pathname));
    if (file) return file;
  }

  // Static files
  if (pathname !== "/" && pathname.includes(".")) {
    const file = serveFile(join(DIST, pathname));
    if (file) return file;
  }

  // SPA fallback
  return (
    serveFile(join(DIST, "index.html")) ??
    new Response("Not found", { status: 404 })
  );
}

const server = Bun.serve({
  port: PORT,
  idleTimeout: 120,
  fetch(req, server) {
    if (req.headers.get("upgrade") === "websocket") {
      server.upgrade(req);
      return;
    }
    return handleRequest(req);
  },
  websocket: {
    open(ws) {
      wsManager.add(ws);
    },
    message(ws, msg) {
      try {
        const data = JSON.parse(String(msg));
        if (data.type === "ping") ws.send(JSON.stringify({ type: "pong" }));
      } catch {}
    },
    close(ws) {
      wsManager.remove(ws);
    },
    // Ping every 30s to detect dead connections
    pingInterval: 30_000,
  },
});

console.log(`\n🤖 Credit Analyst Copilot — Dashboard`);
console.log(`🚀 Server: http://localhost:${PORT}`);
console.log(`🏦 Demo LOS: ${process.env.LOS_URL ?? "http://localhost:3333"}`);
console.log(
  `🔧 Agent mode: ${process.env.MOCK_AGENT === "true" ? "MOCK" : "REAL (Python)"}\n`,
);
