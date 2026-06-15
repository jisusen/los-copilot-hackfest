import { addAuditLog, saveLoanNote, getLoanNotes } from '../db/dashboardDb';

export async function handleNotes(req: Request, pathname: string): Promise<Response | null> {
  if (req.method !== 'POST') return null;

  const match = pathname.match(/^\/api\/notes\/(APP-\d{3})$/);
  if (!match) return null;

  const appId = match[1];
  const body = await req.json() as {
    content: string;
    author?: string;
    authorType?: 'agent' | 'manual';
    category?: string;
  };

  if (!body.content?.trim()) {
    return Response.json({ error: 'Content is required' }, { status: 400 });
  }

  const author = body.author ?? 'analyst01';
  const authorType = body.authorType ?? 'manual';
  const category = body.category ?? 'General';

  saveLoanNote(appId, author, authorType, body.content.trim(), undefined);

  addAuditLog(
    appId,
    author,
    authorType === 'agent' ? 'NOTE_ADDED' : 'NOTE_ADDED',
    `Note added: ${body.content.trim().substring(0, 100)}${body.content.trim().length > 100 ? '...' : ''}`
  );

  const notes = getLoanNotes(appId);
  return Response.json({ ok: true, notes });
}
