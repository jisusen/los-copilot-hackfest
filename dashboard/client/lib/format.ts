export function formatRpShort(amount: number): string {
  if (amount >= 1_000_000_000) return `Rp ${(amount / 1_000_000_000).toFixed(1)}M`;
  if (amount >= 1_000_000) return `Rp ${Math.round(amount / 1_000_000)}jt`;
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

export function formatRp(amount: number): string {
  return 'Rp ' + Math.round(amount).toLocaleString('id-ID');
}

export function formatElapsed(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

/** Color mapping for CRDE decisions — supports both Indonesian and English keys. */
export const CRDE_COLOR: Record<string, string> = {
  // Indonesian (LOS system values)
  DISETUJUI: '#0d6e3f',
  'PERLU REVIEW KOMITE': '#8a5a08',
  DITOLAK: '#9b1c2c',
  // English aliases (dashboard internal)
  APPROVED: '#0d6e3f',
  APPROVE: '#0d6e3f',
  'COMMITTEE REVIEW': '#8a5a08',
  'REFER TO COMMITTEE': '#8a5a08',
  REFER: '#8a5a08',
  REJECTED: '#9b1c2c',
  REJECT: '#9b1c2c',
  CANCEL: '#5a6270',
  CANCELLED: '#5a6270',
};

export const CRDE_SOFT: Record<string, string> = {
  DISETUJUI: '#e3f0e9', APPROVED: '#e3f0e9', APPROVE: '#e3f0e9',
  'PERLU REVIEW KOMITE': '#fbeed0', 'COMMITTEE REVIEW': '#fbeed0', 'REFER TO COMMITTEE': '#fbeed0', REFER: '#fbeed0',
  DITOLAK: '#fbe5e7', REJECTED: '#fbe5e7', REJECT: '#fbe5e7',
};

export const CRDE_BORDER: Record<string, string> = {
  DISETUJUI: '#b6d6c4', APPROVED: '#b6d6c4', APPROVE: '#b6d6c4',
  'PERLU REVIEW KOMITE': '#ecd28a', 'COMMITTEE REVIEW': '#ecd28a', 'REFER TO COMMITTEE': '#ecd28a', REFER: '#ecd28a',
  DITOLAK: '#efb2b8', REJECTED: '#efb2b8', REJECT: '#efb2b8',
};

/** CSS tag class suffix for a CRDE decision */
export function crdeCls(v: string): string {
  const u = v.toUpperCase();
  if (u.includes('SETUJ') || u.includes('APPROV')) return 'green';
  if (u.includes('TOLAK') || u.includes('REJECT')) return 'red';
  return 'amber';
}

export const RISK_COLOR: Record<string, string> = {
  LOW: '#0d6e3f',
  MEDIUM: '#8a5a08',
  HIGH: '#9b1c2c',
};

/** Map a decision string to a semantic color token. */
export function decisionColor(decision: string): string {
  const d = decision.toLowerCase();
  if (d.includes('approve') || d === 'approved') return '#0d6e3f';
  if (d.includes('reject') || d === 'rejected') return '#9b1c2c';
  if (d.includes('cancel') || d === 'cancelled') return '#5a6270';
  if (d.includes('refer') || d.includes('committee')) return '#8a5a08';
  return '#1a3d6e';
}

/** Map a decision string to a soft background color. */
export function decisionBg(decision: string): string {
  const d = decision.toLowerCase();
  if (d.includes('approve') || d === 'approved') return '#e3f0e9';
  if (d.includes('reject') || d === 'rejected') return '#fbe5e7';
  if (d.includes('cancel') || d === 'cancelled') return '#f3f3ee';
  if (d.includes('refer') || d.includes('committee')) return '#fbeed0';
  return '#e6edf6';
}
