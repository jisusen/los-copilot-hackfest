import { randomUUID } from "crypto";
import {
  spawnAgent,
  spawnMockAgent,
  createTask,
} from "../services/agentManager";
import { wsManager } from "../services/wsManager";

const ENV_MOCK = process.env.MOCK_AGENT === "true";

export async function handleBatch(req: Request): Promise<Response> {
  const body = (await req.json()) as {
    appIds?: string[];
    mock?: boolean;
    locale?: "en" | "id";
  };
  const appIds = body.appIds ?? [];
  const useMock = body.mock ?? ENV_MOCK;
  const locale = body.locale === "id" ? "id" : "en";

  if (!Array.isArray(appIds) || appIds.length === 0) {
    return Response.json({ error: "appIds is required" }, { status: 400 });
  }
  if (appIds.length > 5) {
    return Response.json(
      { error: "Maximum 5 applications per batch" },
      { status: 400 },
    );
  }

  const batchId = randomUUID();
  const tasks = appIds.map((appId) => createTask(appId, locale));

  // Immediately broadcast that agents are starting
  for (const task of tasks) {
    wsManager.broadcast({
      type: "agent:progress",
      appId: task.appId,
      step: useMock
        ? "Starting agent (simulation mode)..."
        : "Starting AI agent...",
      stepIndex: 0,
      totalSteps: 10,
      pct: 0,
      elapsedMs: 0,
    });
  }

  // Spawn agents (don't await — let them run in background)
  for (const task of tasks) {
    if (useMock) {
      spawnMockAgent(task);
    } else {
      spawnAgent(task).catch((err) => {
        console.error(`Failed to spawn agent for ${task.appId}:`, err);
        wsManager.broadcast({
          type: "agent:error",
          appId: task.appId,
          error: String(err),
          retryable: true,
        });
      });
    }
  }

  return Response.json({
    ok: true,
    batchId,
    mode: useMock ? "mock" : "real",
    tasks: tasks.map((t) => ({ appId: t.appId, taskId: t.taskId })),
  });
}
