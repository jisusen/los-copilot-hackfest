export type User = { username: string; role: string };

let _user: User | null = null;

export function getUser(): User | null {
  return _user;
}

export function setUser(u: User | null) {
  _user = u;
}

export async function checkSession(): Promise<User | null> {
  try {
    const res = await fetch('/api/auth/me');
    if (!res.ok) { _user = null; return null; }
    const data = await res.json() as { user: User };
    _user = data.user;
    return _user;
  } catch {
    _user = null;
    return null;
  }
}

export async function login(username: string, password: string): Promise<{ ok: boolean; error?: string; user?: User }> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json() as { ok: boolean; error?: string; user?: User };
  if (data.ok && data.user) _user = data.user;
  return data;
}

export async function logout(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST' });
  _user = null;
}
