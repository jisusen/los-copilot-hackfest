import ProgressBar from "./ProgressBar";

type AgentStep = {
  label: string;
  pct: number;
  done: boolean;
};

type Agent = {
  id: string;
  name: string;
  type: string;
  amount: string;
  progress: number;
  eta: string;
  steps: AgentStep[];
};

export default function AgentCard({ agent }: { agent: Agent }) {
  return (
    <div className="border border-gray-200 rounded-xl bg-white p-3 sm:p-4 mb-3">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-gray-400 font-medium">{agent.id}</span>
          <span className="font-semibold text-sm text-gray-800">{agent.name}</span>
          <span className="text-xs text-gray-400 hidden sm:inline">·</span>
          <span className="text-xs text-gray-500 hidden sm:inline">{agent.type}</span>
          <span className="text-xs text-gray-400 hidden sm:inline">·</span>
          <span className="text-xs text-gray-500 hidden sm:inline">{agent.amount}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-red-500 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full whitespace-nowrap">
            RUNNING · {agent.progress}%
          </span>
          <button className="p-1 rounded hover:bg-gray-100">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" /></svg>
          </button>
          <button className="p-1 rounded hover:bg-gray-100">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" /></svg>
          </button>
        </div>
      </div>
      <div className="flex gap-3">
        <div className="w-20 sm:w-28 h-20 sm:h-24 bg-gray-900 rounded-lg flex items-start justify-start p-2 shrink-0">
          <span className="text-red-400 text-sm font-mono">&gt;_</span>
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          {agent.steps.map((step, i) => (
            <div key={i} className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-xs text-gray-400 w-3 shrink-0">{i + 1}.</span>
              <span className="text-[10px] sm:text-xs text-gray-600 w-28 sm:w-44 shrink-0 truncate">{step.label}</span>
              <ProgressBar pct={step.pct} />
              <div className="w-4 shrink-0 flex justify-center">
                {step.done ? (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" fill="#ef4444" />
                    <path d="M8 12l3 3 5-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
                ) : step.pct > 0 ? (
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-red-400 bg-white" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-200 bg-white" />
                )}
              </div>
            </div>
          ))}
          <div className="flex justify-end">
            <span className="text-xs text-gray-400 flex items-center gap-1">
              ETA {agent.eta}
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth={2} /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" /></svg>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
