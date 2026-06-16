import { sessionStore } from '../services/sessionStore';
import { wsManager } from '../services/wsManager';
import { getElapsedMs } from '../services/agentManager';
import { addAuditLog } from '../db/dashboardDb';
import type { LosData, MemoDraft } from '../services/sessionStore';

export async function handleInternal(req: Request, pathname: string): Promise<Response | null> {
  if (req.method !== 'POST') return null;

  if (pathname === '/api/internal/progress') {
    const body = await req.json() as {
      taskId: string; appId: string; step: string;
      stepIndex: number; totalSteps: number; pct: number;
    };

    wsManager.broadcast({
      type: 'agent:progress',
      appId: body.appId,
      step: body.step,
      stepIndex: body.stepIndex,
      totalSteps: body.totalSteps,
      pct: body.pct,
      elapsedMs: getElapsedMs(body.taskId),
    });

    if (body.pct === 0) {
      try {
        addAuditLog(body.appId, 'agent', 'AGENT_RUNNING', `Agent started: ${body.step}`);
      } catch {}
    }

    return Response.json({ ok: true });
  }

  if (pathname === '/api/internal/complete') {
    const body = await req.json() as {
      taskId: string; appId: string;
      losData: LosData; memoDraft: MemoDraft; status: string;
    };

    sessionStore.set(body.appId, {
      appId: body.appId,
      completedAt: new Date(),
      losData: body.losData,
      memoDraft: body.memoDraft,
    });

    // Log audit
    const crdeDecision = body.losData.hasilCrde?.decision ?? 'UNKNOWN';
    const riskScore = body.losData.hasilCrde?.riskScore ?? 'UNKNOWN';
    try {
      addAuditLog(body.appId, 'agent', 'AGENT_COMPLETED', `Agent finished. CRDE: ${crdeDecision}, Risk: ${riskScore}, DBR: ${body.losData.dataKeuangan?.dtiRatio ?? 'N/A'}`);
    } catch {}

    // Extract summary from losData for the card
    const crde = body.losData.hasilCrde;
    const keuangan = body.losData.dataKeuangan;
    const slik = body.losData.slikOjk;
    const aml = body.losData.amlFraud;

    // Parse DBR — could be string "35%" or number 0.35
    let dtiActual = 0;
    const dtiRaw = keuangan.dtiRatio ?? keuangan.dti_ratio ?? 0;
    if (typeof dtiRaw === 'string') {
      const parsed = parseFloat(dtiRaw.replace('%', ''));
      if (!isNaN(parsed)) dtiActual = parsed > 1 ? parsed / 100 : parsed;
    } else {
      dtiActual = Number(dtiRaw) > 1 ? Number(dtiRaw) / 100 : Number(dtiRaw);
    }

    wsManager.broadcast({
      type: 'agent:complete',
      appId: body.appId,
      result: {
        riskScore: crde.riskScore ?? 'UNKNOWN',
        crdeDecision: crde.decision ?? 'UNKNOWN',
        dtiActual,
        slikKol: Number(slik.kolektibilitas ?? slik.collectibility ?? 1),
        amlClear: !(aml.pepStatus || aml.pep_status || aml.dttotMatch || aml.dttot_match),
        numericScore: Number(crde.numericScore ?? 0),
        rulesTriggered: (crde.rulesTriggered as string[]) ?? [],
        memoDraft: body.memoDraft,
      },
      elapsedMs: getElapsedMs(body.taskId),
    });

    return Response.json({ ok: true });
  }

  if (pathname === '/api/internal/screenshot') {
    const body = await req.json() as { taskId: string; appId: string; tabId?: string; screenshot: string };
    wsManager.broadcast({
      type: 'agent:screenshot',
      appId: body.appId,
      tabId: body.tabId ?? '',
      screenshot: body.screenshot,
    });
    return Response.json({ ok: true });
  }

  if (pathname === '/api/internal/error') {
    const body = await req.json() as { taskId: string; appId: string; error: string; retryable: boolean };

    try {
      addAuditLog(body.appId, 'agent', 'AGENT_ERROR', `Error: ${body.error} (retryable: ${body.retryable})`);
    } catch {}

    wsManager.broadcast({
      type: 'agent:error',
      appId: body.appId,
      error: body.error,
      retryable: body.retryable,
    });

    return Response.json({ ok: true });
  }

  return null;
}
