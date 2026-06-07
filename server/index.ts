import { join } from 'path';
import { existsSync, copyFileSync, readFileSync, writeFileSync } from 'fs';
import { getDb } from './db/client';
import { handleAuth, getSessionUser } from './routes/auth';
import { handleLoans } from './routes/loans';
import { resetAndSeed } from './db/seed';

const PORT = parseInt(process.env.PORT ?? '3333');
const ROOT = join(import.meta.dir, '..');
const DIST = join(ROOT, 'dist');
const IS_DEV = process.env.NODE_ENV !== 'production';
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? '*';

function withCors(res: Response, req: Request): Response {
  const origin = CORS_ORIGIN === '*' ? req.headers.get('origin') ?? '*' : CORS_ORIGIN;
  res.headers.set('Access-Control-Allow-Origin', origin);
  res.headers.set('Access-Control-Allow-Credentials', 'true');
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Cookie');
  return res;
}

// Ensure DB is initialized
getDb();

// Build client bundle at startup
async function buildClient() {
  console.log('📦 Building client bundle...');
  const result = await Bun.build({
    entrypoints: [join(ROOT, 'client/main.tsx')],
    outdir: DIST,
    target: 'browser',
    define: {
      'process.env.NODE_ENV': JSON.stringify(IS_DEV ? 'development' : 'production'),
    },
  });
  if (!result.success) {
    console.error('Build errors:', result.logs);
    process.exit(1);
  }
  // Copy index.html to dist, injecting the correct script name
  const html = readFileSync(join(ROOT, 'client/index.html'), 'utf-8')
    .replace('/main.js', '/main.js');
  writeFileSync(join(DIST, 'index.html'), html);
  console.log('✅ Client bundle ready.');
}

await buildClient();

const MIME: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.map': 'application/json',
};

function mime(path: string): string {
  const ext = path.substring(path.lastIndexOf('.'));
  return MIME[ext] ?? 'application/octet-stream';
}

function serveFile(filePath: string): Response | null {
  if (!existsSync(filePath)) return null;
  const file = Bun.file(filePath);
  return new Response(file, { headers: { 'Content-Type': mime(filePath) } });
}

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    // CORS preflight
    if (req.method === 'OPTIONS') {
      return withCors(new Response(null, { status: 204 }), req);
    }

    const url = new URL(req.url);
    const pathname = url.pathname;

    // Auth routes (no session required)
    if (pathname.startsWith('/api/auth/')) {
      const res = await handleAuth(req, pathname);
      if (res) return withCors(res, req);
    }

    // Protected API routes
    if (pathname.startsWith('/api/')) {
      const user = getSessionUser(req);
      if (!user) return withCors(Response.json({ error: 'Unauthorized' }, { status: 401 }), req);

      // Admin / dev routes
      if (pathname === '/api/admin/seed' && req.method === 'POST' && IS_DEV) {
        resetAndSeed(true);
        return withCors(Response.json({ ok: true, count: 10 }), req);
      }

      // Loans
      if (pathname.startsWith('/api/loans')) {
        const res = await handleLoans(req, pathname, url);
        if (res) return withCors(res, req);
      }

      return withCors(Response.json({ error: 'Not found' }, { status: 404 }), req);
    }

    // Static files from dist/
    if (pathname !== '/' && pathname.includes('.')) {
      const filePath = join(DIST, pathname);
      const res = serveFile(filePath);
      if (res) return res;
    }

    // SPA fallback — serve index.html for all other routes
    const indexPath = join(DIST, 'index.html');
    const res = serveFile(indexPath);
    if (res) return res;

    return new Response('Not found', { status: 404 });
  },
});

console.log(`\n🏦 Bank Maju Bersama — JOKI AI LOS`);
console.log(`🚀 Server running at http://localhost:${PORT}`);
console.log(`\nCredentials: analyst01 / analyst02 / supervisor — password: bms2025\n`);
