import { getSettings } from './settings';

const SESSION_COOKIE = 'dash_session';
const SESSION_MAX_AGE = 8 * 60 * 60; // 8 hours

// Simple in-memory session store (sufficient for single-instance demo)
const sessions = new Map<string, { username: string; expires: number }>();

function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function pruneExpired() {
  const now = Date.now();
  for (const [token, data] of sessions) {
    if (data.expires < now) sessions.delete(token);
  }
}

export function getSession(req: Request): { username: string } | null {
  pruneExpired();
  const cookie = req.headers.get('cookie') ?? '';
  const match = cookie.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
  if (!match) return null;
  const data = sessions.get(match[1]);
  if (!data || data.expires < Date.now()) return null;
  return { username: data.username };
}

export async function handleAuth(req: Request, pathname: string): Promise<Response | null> {
  // POST /api/auth/login
  if (pathname === '/api/auth/login' && req.method === 'POST') {
    const body = await req.json() as { username?: string; password?: string };
    const { username, password } = body;

    const settings = getSettings();
    const validUser = settings.losUsername ?? 'analyst01';
    const validPass = settings.losPassword ?? 'bms2025';

    if (username === validUser && password === validPass) {
      const token = generateToken();
      sessions.set(token, {
        username,
        expires: Date.now() + SESSION_MAX_AGE * 1000,
      });
      return Response.json(
        { ok: true, username },
        {
          headers: {
            'Set-Cookie': `${SESSION_COOKIE}=${token}; HttpOnly; Path=/; Max-Age=${SESSION_MAX_AGE}; SameSite=Lax`,
          },
        },
      );
    }

    return Response.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  // POST /api/auth/logout
  if (pathname === '/api/auth/logout' && req.method === 'POST') {
    const cookie = req.headers.get('cookie') ?? '';
    const match = cookie.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
    if (match) sessions.delete(match[1]);
    return Response.json(
      { ok: true },
      {
        headers: {
          'Set-Cookie': `${SESSION_COOKIE}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`,
        },
      },
    );
  }

  // GET /api/auth/me
  if (pathname === '/api/auth/me' && req.method === 'GET') {
    const session = getSession(req);
    if (!session) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 });
    }
    return Response.json({ username: session.username });
  }

  return null;
}
