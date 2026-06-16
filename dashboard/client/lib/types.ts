export type LoanSummary = {
  id: string;
  debtor_name: string;
  product_type: string;
  amount_requested: number;
  tenor_months: number;
  status: string;
  crde_decision: string;
  risk_score: string;
  numeric_score: number;
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

export type AgentResult = {
  riskScore: string;
  crdeDecision: string;
  dtiActual: number;
  slikKol: number;
  amlClear: boolean;
  numericScore: number;
  rulesTriggered: string[];
  memoDraft: MemoDraft;
};

export type AgentState =
  | { status: 'running'; logs: string[]; pct: number; elapsedMs: number; startedAt: number; currentStep?: string; stepIndex?: number; totalSteps?: number }
  | { status: 'ready'; result: AgentResult; elapsedMs: number }
  | { status: 'decided'; decision: string; analystId: string; decidedAt: string; result?: AgentResult }
  | { status: 'error'; error: string; retryable: boolean };

export type WsMessage =
  | { type: 'agent:progress'; appId: string; step: string; stepIndex: number; totalSteps: number; pct: number; elapsedMs: number }
  | { type: 'agent:complete'; appId: string; result: AgentResult; elapsedMs: number }
  | { type: 'agent:error'; appId: string; error: string; retryable: boolean }
  | { type: 'agent:decided'; appId: string; decision: string; analystId: string; decidedAt: string }
  | { type: 'agent:screenshot'; appId: string; screenshot: string }
  | { type: 'agent:reset'; appId: string }
  | { type: 'pong' };

export type Decision = 'approve' | 'reject' | 'cancel';
export type Message = { role: 'user' | 'assistant'; content: string };
