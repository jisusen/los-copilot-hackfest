export async function apiFetch<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(opts?.headers ?? {}) },
  });
  if (res.status === 401) {
    window.location.href = '/login';
    return Promise.reject(new Error('Unauthorized'));
  }
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json() as Promise<T>;
}

export function formatRp(amount: number): string {
  return 'Rp ' + Math.round(amount).toLocaleString('id-ID');
}

export function formatPercent(ratio: number): string {
  return (ratio * 100).toFixed(1) + '%';
}

export function formatDate(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDateTime(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${formatDate(iso)}, ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')} WIB`;
}

export function formatYears(y: number): string {
  const yrs = Math.floor(y);
  const months = Math.round((y - yrs) * 12);
  if (months === 0) return `${yrs} year${yrs !== 1 ? 's' : ''}`;
  return `${yrs} year${yrs !== 1 ? 's' : ''} ${months} month${months !== 1 ? 's' : ''}`;
}
