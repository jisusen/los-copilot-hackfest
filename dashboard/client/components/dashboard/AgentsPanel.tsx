import AgentCard from "./AgentCard";
export default function AgentsPanel() {
  
const agents = [
  {
    id: "APP-110", name: "Yuli Andari", type: "KTA", amount: "Rp 40jt", progress: 68, eta: "00:18",
    steps: [
      { label: "Ambil data & validasi identitas", pct: 100, done: true },
      { label: "Cek kredit & riwayat pembayaran", pct: 100, done: true },
      { label: "Analisis kapasitas pembayaran", pct: 60, done: false },
      { label: "Hitung skor & rekomendasi awal", pct: 0, done: false },
      { label: "Siapkan ringkasan untuk keputusan", pct: 0, done: false },
    ],
  },
  {
    id: "APP-106", name: "Rina Susanti", type: "KTA", amount: "Rp 25jt", progress: 35, eta: "00:32",
    steps: [
      { label: "Ambil data & validasi identitas", pct: 100, done: true },
      { label: "Cek kredit & riwayat pembayaran", pct: 80, done: false },
      { label: "Analisis kapasitas pembayaran", pct: 0, done: false },
      { label: "Hitung skor & rekomendasi awal", pct: 0, done: false },
      { label: "Siapkan ringkasan untuk keputusan", pct: 0, done: false },
    ],
  },
  {
    id: "APP-104", name: "Dewi Lestari", type: "KTA", amount: "Rp 75jt", progress: 12, eta: "01:05",
    steps: [
      { label: "Ambil data & validasi identitas", pct: 20, done: false },
      { label: "Cek kredit & riwayat pembayaran", pct: 0, done: false },
      { label: "Analisis kapasitas pembayaran", pct: 0, done: false },
      { label: "Hitung skor & rekomendasi awal", pct: 0, done: false },
      { label: "Siapkan ringkasan untuk keputusan", pct: 0, done: false },
    ],
  },
];
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Stats */}
      <div className="bg-white border-b border-gray-200 px-3 sm:px-4 py-2 overflow-x-auto">
        <div className="flex gap-2 min-w-max sm:min-w-0 sm:flex-wrap">
          {[
            { label: "IN QUEUE", value: "10", icon: "clipboard", iconColor: "text-orange-500", bg: "bg-orange-50" },
            { label: "RUNNING", value: "3", sub: "of 5 max", icon: "play", iconColor: "text-green-500", bg: "bg-green-50" },
            { label: "NEED DECISION", value: "0", icon: "hourglass", iconColor: "text-red-400", bg: "bg-red-50" },
            { label: "DECIDED TODAY", value: "0", icon: "check", iconColor: "text-pink-400", bg: "bg-pink-50" },
            { label: "AVG TIME", value: "3:42", sub: "vs 4:17", icon: "clock", iconColor: "text-orange-400", bg: "bg-orange-50" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-2 border border-gray-100 rounded-xl px-3 py-1.5 bg-white shrink-0">
              <div className={`w-7 h-7 ${s.bg} rounded-full flex items-center justify-center`}>
                <svg className={`w-3.5 h-3.5 ${s.iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  {s.icon === "clipboard" && <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />}
                  {s.icon === "play" && <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />}
                  {s.icon === "hourglass" && <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />}
                  {s.icon === "check" && <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />}
                  {s.icon === "clock" && <><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M12 6v6l4 2" /></>}
                </svg>
              </div>
              <div>
                <div className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide leading-tight">{s.label}</div>
                <div className="text-base font-bold text-gray-900 leading-tight">{s.value}</div>
                {s.sub && <div className="text-[9px] text-gray-400">{s.sub}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 sm:p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-gray-900 text-sm sm:text-base">Agents working</h3>
            <p className="text-xs text-gray-500">3 of 5 max parallel</p>
          </div>
          <div className="flex items-center gap-1.5">
            <button className="hidden sm:flex items-center gap-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-600 hover:bg-gray-50">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4" /></svg>
              Cinemas mode
            </button>
            <button className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50">
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
            </button>
          </div>
        </div>
        {agents.map((agent) => <AgentCard key={agent.id} agent={agent} />)}
        <div className="border border-dashed border-gray-300 rounded-xl p-4 flex items-center gap-3 text-gray-400 hover:border-red-300 hover:text-red-400 cursor-pointer transition-colors">
          <div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center shrink-0">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          </div>
          <div>
            <div className="text-sm font-semibold">Slot tersedia (2/5)</div>
            <div className="text-xs">Agent akan otomatis mengambil aplikasi dari queue</div>
          </div>
        </div>
      </div>
    </div>
  )};