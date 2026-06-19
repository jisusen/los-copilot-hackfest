import {
  getUsageSummary,
  getUsageByApp,
  getDailyUsage,
  getTotalUsage,
  clearUsageData,
  getModelPricing,
} from '../db/dashboardDb';

export async function handleUsage(req: Request, pathname: string): Promise<Response | null> {
  // GET /api/usage — total usage summary
  if (pathname === '/api/usage' && req.method === 'GET') {
    const total = getTotalUsage();
    const summary = getUsageSummary();
    const daily = getDailyUsage(30);

    return Response.json({
      total,
      summary,
      daily,
      pricing: {
        'gemini-2.0-flash': getModelPricing('gemini-2.0-flash'),
        'gemini-2.5-flash': getModelPricing('gemini-2.5-flash'),
        'gemini-2.5-pro': getModelPricing('gemini-2.5-pro'),
      },
    });
  }

  // GET /api/usage/:appId — usage for specific app
  if (pathname.startsWith('/api/usage/') && req.method === 'GET') {
    const appId = pathname.split('/api/usage/')[1];
    if (!appId) return Response.json({ error: 'appId required' }, { status: 400 });

    const usage = getUsageByApp(appId);
    return Response.json({ appId, usage });
  }

  // DELETE /api/usage — clear all usage data
  if (pathname === '/api/usage' && req.method === 'DELETE') {
    clearUsageData();
    return Response.json({ ok: true, message: 'Usage data cleared' });
  }

  return null;
}
