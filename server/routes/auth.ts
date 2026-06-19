import { getDb } from '../db/client';
import { randomUUID } from 'crypto';

const USERS: Record<string, { password: string; role: string }> = {
  analyst01: { password: 'bms2025', role: 'analyst' },
  analyst02: { password: 'bms2025', role: 'analyst' },
  analyst03: { password: 'bms2025', role: 'analyst' },
  analyst04: { password: 'bms2025', role: 'analyst' },
  analyst05: { password: 'bms2025', role: 'analyst' },
  supervisor: { password: 'bms2025', role: 'supervisor' },
};

const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

export function getSessionUser(req: Request): { username: string; role: string } | null {
  const cookie = req.headers.get('cookie') ?? '';
  const match = cookie.match(/bms_session=([^;]+)/);
  if (!match) return null;

  const sessionId = match[1];
  const db = getDb();
  const session = db.query('SELECT username, role, expires_at FROM sessions WHERE id = ?').get(sessionId) as {
    username: string;
    role: string;
    expires_at: string;
  } | null;

  if (!session) return null;
  if (new Date(session.expires_at) < new Date()) {
    db.run('DELETE FROM sessions WHERE id = ?', [sessionId]);
    return null;
  }

  return { username: session.username, role: session.role };
}

export async function handleAuth(req: Request, pathname: string): Promise<Response | null> {
  if (pathname === '/api/auth/login' && req.method === 'POST') {
    const body = await req.json() as { username?: string; password?: string };
    const user = USERS[body.username ?? ''];

    if (!user || user.password !== body.password) {
      return Response.json({ ok: false, error: 'Username atau password salah' }, { status: 401 });
    }

    const sessionId = randomUUID();
    const now = new Date();
    const expires = new Date(now.getTime() + SESSION_TTL_MS);
    const db = getDb();
    db.run('INSERT INTO sessions (id, username, role, created_at, expires_at) VALUES (?, ?, ?, ?, ?)', [
      sessionId,
      body.username!,
      user.role,
      now.toISOString(),
      expires.toISOString(),
    ]);

    return new Response(
      JSON.stringify({ ok: true, user: { username: body.username, role: user.role } }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': `bms_session=${sessionId}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${SESSION_TTL_MS / 1000}`,
        },
      }
    );
  }

  if (pathname === '/api/auth/logout' && req.method === 'POST') {
    const cookie = req.headers.get('cookie') ?? '';
    const match = cookie.match(/bms_session=([^;]+)/);
    if (match) {
      getDb().run('DELETE FROM sessions WHERE id = ?', [match[1]]);
    }
    return new Response(
      JSON.stringify({ ok: true }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': 'bms_session=; HttpOnly; Path=/; Max-Age=0',
        },
      }
    );
  }

  if (pathname === '/api/auth/me' && req.method === 'GET') {
    const user = getSessionUser(req);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    return Response.json({ user });
  }

  return null;
}
