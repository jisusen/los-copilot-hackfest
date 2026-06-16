import { useReducer, useCallback } from "react";
import type { AgentState, WsMessage } from "../lib/types";

type SessionsMap = Map<string, AgentState>;

type Action =
  | {
      type: "PROGRESS";
      appId: string;
      step: string;
      pct: number;
      elapsedMs: number;
      stepIndex: number;
      totalSteps: number;
    }
  | {
      type: "COMPLETE";
      appId: string;
      result: AgentState & { status: "ready" };
      elapsedMs: number;
    }
  | { type: "ERROR"; appId: string; error: string; retryable: boolean }
  | {
      type: "DECIDED";
      appId: string;
      decision: string;
      analystId: string;
      decidedAt: string;
    }
  | { type: "RESET"; appId: string };

function reducer(state: SessionsMap, action: Action): SessionsMap {
  const next = new Map(state);

  switch (action.type) {
    case "PROGRESS": {
      const existing = state.get(action.appId);
      const logs =
        existing?.status === "running"
          ? [...existing.logs, action.step]
          : [action.step];
      next.set(action.appId, {
        status: "running",
        logs,
        pct: action.pct,
        elapsedMs: action.elapsedMs,
        startedAt:
          existing?.status === "running" ? existing.startedAt : Date.now(),
        currentStep: action.step,
        stepIndex: action.stepIndex,
        totalSteps: action.totalSteps,
      });
      break;
    }
    case "COMPLETE": {
      const existing = state.get(action.appId);
      next.set(action.appId, {
        status: "ready",
        result: action.result.result,
        elapsedMs: action.elapsedMs,
      });
      break;
    }
    case "ERROR": {
      next.set(action.appId, {
        status: "error",
        error: action.error,
        retryable: action.retryable,
      });
      break;
    }
    case "DECIDED": {
      const existing = state.get(action.appId);
      next.set(action.appId, {
        status: "decided",
        decision: action.decision,
        analystId: action.analystId,
        decidedAt: action.decidedAt,
        result: existing?.status === "ready" ? existing.result : undefined,
      });
      break;
    }
    case "RESET": {
      next.delete(action.appId);
      break;
    }
  }

  return next;
}

export function useAgentSessions() {
  const [sessions, dispatch] = useReducer(
    reducer,
    new Map<string, AgentState>(),
  );

  const handleWsMessage = useCallback((msg: WsMessage) => {
    if (msg.type === "agent:progress") {
      dispatch({
        type: "PROGRESS",
        appId: msg.appId,
        step: msg.step,
        pct: msg.pct,
        elapsedMs: msg.elapsedMs,
        stepIndex: msg.stepIndex,
        totalSteps: msg.totalSteps,
      });
    } else if (msg.type === "agent:complete") {
      dispatch({
        type: "COMPLETE",
        appId: msg.appId,
        result: {
          status: "ready",
          result: msg.result,
          elapsedMs: msg.elapsedMs,
        },
        elapsedMs: msg.elapsedMs,
      });
    } else if (msg.type === "agent:error") {
      dispatch({
        type: "ERROR",
        appId: msg.appId,
        error: msg.error,
        retryable: msg.retryable,
      });
    } else if (msg.type === "agent:decided") {
      dispatch({
        type: "DECIDED",
        appId: msg.appId,
        decision: msg.decision,
        analystId: msg.analystId,
        decidedAt: msg.decidedAt,
      });
    } else if (msg.type === "agent:reset") {
      dispatch({ type: "RESET", appId: msg.appId });
    }
  }, []);

  return { sessions, handleWsMessage, dispatch };
}
