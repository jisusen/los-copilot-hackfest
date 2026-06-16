import { getDecision, saveDecision, addAuditLog, saveLoanNote, saveAgentSession, getAgentSession } from '../db/dashboardDb';

export type LosData = {
  profilDebitur: Record<string, string>;
  dataKeuangan: Record<string, string | number>;
  slikOjk: Record<string, string | number>;
  amlFraud: Record<string, boolean | string>;
  hasilCrde: {
    riskScore: string;
    decision: string;
    numericScore: number;
    rulesTriggered: string[];
    [key: string]: unknown;
  };
  agunan?: Record<string, string | number> | null;
  permohonanKredit: Record<string, string | number>;
};

export type MemoDraft = {
  executive_summary: string;
  section1_profil: string;
  section2_permohonan: string;
  section3_keuangan: string;
  section4_slik: string;
  section5_aml: string;
  section6_agunan: string;
  section7_crde: string;
  section8_rekomendasi: string;
};

export type ReviewSession = {
  appId: string;
  completedAt: Date;
  losData: LosData;
  memoDraft: MemoDraft;
  decision?: { decision: string; note: string; analystId: string; decidedAt: string };
};

class SessionStore {
  private store = new Map<string, ReviewSession>();

  set(appId: string, session: ReviewSession) {
    this.store.set(appId, session);
    // Persist to SQLite so it survives server restart
    try {
      saveAgentSession(appId, session.losData, session.memoDraft, session.completedAt.toISOString());
    } catch (e) {
      console.error('[sessionStore] Failed to persist session to SQLite:', e);
    }
    // Persist AI memo to shared DB so LOS can display it
    try {
      const crde = session.losData.hasilCrde;
      const summary = session.memoDraft.executive_summary?.trim();
      const content = summary || session.memoDraft.section8_rekomendasi?.trim() || 'Copilot analysis complete.';
      saveLoanNote(appId, 'Copilot Analyst', 'agent', content, JSON.stringify(session.memoDraft));
      addAuditLog(appId, 'agent', 'AGENT_COMPLETED', `Memo draft saved. CRDE: ${crde.decision}, Risk: ${crde.riskScore}`);
    } catch (e) {
      console.error('[sessionStore] Failed to persist AI memo:', e);
    }
    // If a persisted decision exists, hydrate it into the session
    const persisted = getDecision(appId);
    if (persisted) {
      session.decision = {
        decision: persisted.decision,
        note: persisted.note,
        analystId: persisted.analyst_id,
        decidedAt: persisted.decided_at,
      };
    }
  }

  get(appId: string): ReviewSession | undefined {
    let session = this.store.get(appId);
    if (!session) {
      // Fallback to SQLite (survives server restart)
      const persisted = getAgentSession(appId);
      if (persisted) {
        session = {
          appId,
          completedAt: new Date(persisted.completedAt),
          losData: persisted.losData as LosData,
          memoDraft: persisted.memoDraft as MemoDraft,
        };
        this.store.set(appId, session);
      }
    }
    if (session && !session.decision) {
      // Hydrate from DB on demand
      const persisted = getDecision(appId);
      if (persisted) {
        session.decision = {
          decision: persisted.decision,
          note: persisted.note,
          analystId: persisted.analyst_id,
          decidedAt: persisted.decided_at,
        };
      }
    }
    return session;
  }

  setDecision(appId: string, decision: { decision: string; note: string; analystId: string; decidedAt: string }) {
    const session = this.store.get(appId);
    if (session) session.decision = decision;
    // Persist to SQLite
    saveDecision(
      `${appId}-${Date.now()}`,
      appId,
      decision.decision,
      decision.note,
      decision.analystId,
      decision.decidedAt
    );
    // Add audit log
    addAuditLog(appId, decision.analystId, `DECISION_${decision.decision.toUpperCase()}`, decision.note);
    // Persist analyst note to shared DB
    if (decision.note?.trim()) {
      try {
        saveLoanNote(appId, decision.analystId, 'manual', decision.note.trim());
      } catch (e) {
        console.error('[sessionStore] Failed to persist analyst note:', e);
      }
    }
  }

  getChatContext(appId: string): string {
    const session = this.store.get(appId);
    if (!session) return '';
    const { losData } = session;
    return `LOAN APPLICATION DATA (extracted directly from the LOS System):

=== DEBTOR PROFILE ===
${JSON.stringify(losData.profilDebitur, null, 2)}

=== FINANCIAL DATA ===
${JSON.stringify(losData.dataKeuangan, null, 2)}

=== SLIK OJK ===
${JSON.stringify(losData.slikOjk, null, 2)}

=== AML & FRAUD SCREENING ===
${JSON.stringify(losData.amlFraud, null, 2)}

=== CRDE RESULT ===
${JSON.stringify(losData.hasilCrde, null, 2)}

=== COLLATERAL ===
${losData.agunan ? JSON.stringify(losData.agunan, null, 2) : 'Not required (unsecured loan)'}

=== LOAN APPLICATION ===
${JSON.stringify(losData.permohonanKredit, null, 2)}`;
  }

  list(): string[] {
    return Array.from(this.store.keys());
  }

  delete(appId: string) {
    this.store.delete(appId);
    try {
      const { deleteAgentSession } = require('../db/dashboardDb');
      deleteAgentSession(appId);
    } catch (e) {
      console.error('[sessionStore] Failed to delete agent session:', e);
    }
  }
}

export const sessionStore = new SessionStore();
