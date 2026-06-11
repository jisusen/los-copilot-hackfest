import { useState } from "react";

const loanQueue = [
  { id: "APP-110", name: "Yuli Andari", type: "KTA", amount: "Rp 40jt", badge: null, time: "42s" },
  { id: "APP-106", name: "Rina Susanti", type: "KTA", amount: "Rp 25jt", badge: "LOW", badgeColor: "low" },
  { id: "APP-104", name: "Dewi Lestari", type: "KTA", amount: "Rp 75jt", badge: "MEDIUM", badgeColor: "medium" },
  { id: "APP-108", name: "Maya Putri", type: "Multipurpose", amount: "Rp 200jt", badge: "MEDIUM", badgeColor: "medium" },
  { id: "APP-102", name: "Siti Rahayu", type: "KTA", amount: "Rp 25jt", badge: "LOW", badgeColor: "low" },
  { id: "APP-101", name: "Budi Santoso", type: "KTA", amount: "Rp 50jt", badge: "LOW", badgeColor: "low" },
  { id: "APP-105", name: "Ahmad Fauzi", type: "KPR", amount: "Rp 300jt", badge: "LOW", badgeColor: "low" },
  { id: "APP-107", name: "Hendra Wijaya", type: "KTA", amount: "Rp 100jt", badge: "HIGH", badgeColor: "high" },
  { id: "APP-109", name: "Doni Pratama", type: "KPR", amount: "Rp 60jt", badge: "LOW", badgeColor: "low" },
];

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

const hasilAnalisis = [
  { id: "APP-098", name: "Andi Pratama", type: "KTA", amount: "Rp 30jt", score: 812, status: "Disetujui", statusColor: "approved", time: "29 Mei 2026, 09:41" },
  { id: "APP-097", name: "Fitriani", type: "KTA", amount: "Rp 25jt", score: 768, status: "Disetujui", statusColor: "approved", time: "29 Mei 2026, 09:32" },
  { id: "APP-096", name: "Dimas Arya", type: "KPR", amount: "Rp 350jt", score: 845, status: "Disetujui", statusColor: "approved", time: "29 Mei 2026, 09:21" },
  { id: "APP-095", name: "Siti Aisyah", type: "KTA", amount: "Rp 20jt", score: 640, status: "Review Manual", statusColor: "review", time: "29 Mei 2026, 09:10" },
  { id: "APP-094", name: "Bambang Irawan", type: "KTA", amount: "Rp 15jt", score: 412, status: "Ditolak", statusColor: "rejected", time: "29 Mei 2026, 08:59" },
];

function BadgeRisk({ type }: { type: string }) {
  const map: Record<string, string> = {
    LOW: "bg-green-100 text-green-700 border border-green-200",
    MEDIUM: "bg-orange-100 text-orange-600 border border-orange-200",
    HIGH: "bg-red-100 text-red-600 border border-red-200",
  };
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${map[type] || ""}`}>{type}</span>;
}

function StatusBadge({ status, color }: { status: string; color: string }) {
  const map: Record<string, string> = {
    approved: "bg-green-100 text-green-700",
    review: "bg-orange-100 text-orange-600",
    rejected: "bg-red-100 text-red-600",
  };
  return <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${map[color]}`}>{status}</span>;
}

function ProgressBar({ pct }: { pct: number }) {
  if (pct === 0) return <div className="flex-1 h-1.5 bg-gray-100 rounded-full" />;
  return (
    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
      <div className="h-full rounded-full bg-red-500" style={{ width: `${pct}%` }} />
    </div>
  );
}

function AgentCard({ agent }: { agent: typeof agents[0] }) {
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

// Bottom tab nav for mobile
type Tab = "queue" | "agents" | "hasil";
const tabs: { key: Tab; label: string }[] = [
  { key: "queue", label: "Loan Queue" },
  { key: "agents", label: "Agents" },
  { key: "hasil", label: "Hasil" },
];

export  function App() {
  const [selected, setSelected] = useState<string[]>([]);
  const [mobileTab, setMobileTab] = useState<Tab>("agents");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hasilTab, setHasilTab] = useState(0);

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const navLinks = [
    { label: "Dashboard", d: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" },
    { label: "Loan Queue", d: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
    { label: "Agents", d: "M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" },
    { label: "Applications", d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
    { label: "Analytics", d: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
    { label: "Reports", d: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
    { label: "Settings", d: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
  ];

  // ── LOAN QUEUE PANEL ────────────────────────────────────────────────
  const LoanQueuePanel = (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2">
        <h2 className="text-base font-bold text-gray-900">Loan queue</h2>
        <p className="text-xs text-red-500 font-medium">10 pending</p>
      </div>
      <div className="px-3 pb-2 flex gap-2">
        <div className="relative flex-1">
          <svg className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" /></svg>
          <input placeholder="Search by name or APP ID..." className="w-full pl-7 pr-2 py-1.5 text-[11px] border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-400" />
        </div>
        <button className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50">
          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-2">
        {loanQueue.map((item) => (
          <div key={item.id} className="flex items-center gap-2 px-2 py-2.5 rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => toggle(item.id)}>
            <input type="checkbox" checked={selected.includes(item.id)} onChange={() => toggle(item.id)} className="w-3.5 h-3.5 accent-red-500 shrink-0" onClick={(e) => e.stopPropagation()} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-400 font-medium">{item.id}</span>
                {item.badge ? <BadgeRisk type={item.badge} /> : <span className="text-xs font-bold text-red-500">{item.time}</span>}
              </div>
              <div className="text-xs font-semibold text-gray-800 truncate">{item.name}</div>
              <div className="text-[10px] text-gray-400">{item.type} · {item.amount}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="px-3 py-3 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-400">{selected.length} selected</span>
        <button className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
          Run review
        </button>
      </div>
    </div>
  );

  // ── AGENTS PANEL ────────────────────────────────────────────────────
  const AgentsPanel = (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Stats */}
      

      <div className="flex-1 overflow-y-auto">
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
  );

  // ── HASIL PANEL ─────────────────────────────────────────────────────
  const HasilPanel = (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-gray-900 text-sm">Hasil Analisis</h3>
          <p className="text-[11px] text-gray-400">List aplikasi yang berhasil di analyst</p>
        </div>
      </div>
      <div className="flex border-b border-gray-100 overflow-x-auto">
        {["Semua", "Hari ini", "Membutuhkan Keputusan"].map((tab, i) => (
          <button key={tab} onClick={() => setHasilTab(i)} className={`px-3 py-2 text-[11px] font-medium border-b-2 transition-colors whitespace-nowrap ${hasilTab === i ? "border-red-500 text-red-600" : "border-transparent text-gray-500"}`}>
            {tab}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        {hasilAnalisis.map((item) => (
          <div key={item.id} className="border border-gray-100 rounded-xl p-3 hover:border-gray-200 transition-colors">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-[10px] text-gray-400 font-medium shrink-0">{item.id}</span>
                <span className="text-xs font-bold text-gray-800 truncate">{item.name}</span>
              </div>
              <span className="text-xs font-bold text-gray-700 shrink-0 ml-2">Skor {item.score}</span>
            </div>
            <div className="text-[10px] text-gray-400 mb-2">{item.type} · {item.amount}</div>
            <StatusBadge status={item.status} color={item.statusColor} />
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] text-gray-400">Selesai · {item.time}</span>
              <button className="text-[10px] text-red-500 font-medium hover:underline">Lihat ringkasan</button>
            </div>
          </div>
        ))}
      </div>
      <div className="px-3 py-3 border-t border-gray-100">
        <button className="w-full py-2 text-sm font-semibold text-red-500 text-center hover:underline">
          Lihat semua hasil analisis
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── MOBILE SIDEBAR OVERLAY ─────────────────────────── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-56 bg-white shadow-xl flex flex-col z-50">
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">B</span>
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900 leading-tight">Bank Maju Bersama</div>
                  <div className="text-[9px] text-gray-400 uppercase tracking-wide">Credit Analyst Copilot</div>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-1 rounded hover:bg-gray-100">
                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <nav className="flex-1 px-2 py-3 space-y-0.5">
              {navLinks.map((item) => (
                <button key={item.label} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d={item.d} /></svg>
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* ── DESKTOP SIDEBAR ────────────────────────────────── */}
      <aside className="hidden lg:flex w-56 bg-white border-r border-gray-200 flex-col shrink-0">
        <div className="flex items-center gap-2.5 px-4 py-4 border-b border-gray-100">
          <button className="p-1 rounded hover:bg-gray-100">
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">B</span>
          </div>
          <div>
            <div className="text-xs font-bold text-gray-900 leading-tight">Bank Maju Bersama</div>
            <div className="text-[9px] text-gray-400 uppercase tracking-wide font-medium">Credit Analyst Copilot</div>
          </div>
        </div>
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {navLinks.map((item) => (
            <button key={item.label} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${item.label === "Dashboard" ? "bg-red-50 text-red-600 font-semibold" : "text-gray-600 hover:bg-gray-50"}`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d={item.d} /></svg>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="px-3 py-3 border-t border-gray-100">
          <button className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
            Collapse
          </button>
        </div>
      </aside>

      {/* ── MAIN ───────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Header */}
        <header className="h-12 bg-white border-b border-gray-200 flex items-center px-3 sm:px-4 gap-2 sm:gap-3 shrink-0">
          {/* Hamburger (mobile) */}
          <button className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100" onClick={() => setSidebarOpen(true)}>
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <span className="text-sm text-red-600 font-medium hidden sm:inline">Pipeline</span>
          <span className="text-gray-400 hidden sm:inline">/</span>
          <span className="text-sm font-semibold text-gray-700">Triage</span>
          <div className="flex-1" />
          <div className="relative hidden md:block">
            <svg className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" /></svg>
            <input placeholder="Search (Ctrl + K)" className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-1 focus:ring-red-400 w-52" />
          </div>
          <button className="p-1.5 rounded-lg hover:bg-gray-100">
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            <span className="sr-only">3 notif</span>
          </button>
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">A</span>
            </div>
            <div className="hidden sm:block text-right">
              <div className="text-xs font-semibold text-gray-800">analyst01</div>
              <div className="text-[10px] text-gray-400">Credit Analyst</div>
            </div>
          </div>
        </header>

        {/* ── DESKTOP: 3-column layout ──────────────────────── */}
<div className="hidden lg:flex flex-1 h-full overflow-hidden ml-4 mt-4">

  {/* LEFT SIDE */}
  <div className="flex-1 flex flex-col gap-4 min-w-0">

    {/* HEADER AREA */}
    <div className="shrink-0">

      <div className="flex items-center justify-start" style={{ gap: "4rem" }}>

        <div className="shrink-0">
          <h1 className="text-md font-bold text-gray-900">
            Pipeline · Triage
          </h1>

          <div className="flex items-center gap-1 mt-1">
            <svg
              className="w-3.5 h-3.5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>

            <span className="text-xs text-gray-500">
              Jumat, 29 Mei 2026 
            </span>
          </div>
        </div>

        {/* STATUS CARDS */}
        <div className="flex gap-2">
          {[
            { label: "IN QUEUE", value: "10", icon: "clipboard", iconColor: "text-orange-500", bg: "bg-orange-50" },
            { label: "RUNNING", value: "3", sub: "of 5 max", icon: "play", iconColor: "text-green-500", bg: "bg-green-50" },
            { label: "NEED DECISION", value: "0", icon: "hourglass", iconColor: "text-red-400", bg: "bg-red-50" },
            { label: "DECIDED TODAY", value: "0", icon: "check", iconColor: "text-pink-400", bg: "bg-pink-50" },
            { label: "AVG TIME", value: "3:42", sub: "vs 4:17", icon: "clock", iconColor: "text-orange-400", bg: "bg-orange-50" },
          ].map((s) => (
            <div
              key={s.label}
              className="flex items-center gap-2 border border-gray-100 rounded-xl px-3 py-1.5 bg-white shrink-0"
            >
              <div
                className={`w-7 h-7 ${s.bg} rounded-full flex items-center justify-center`}
              >
                {/* icon */}
              </div>

              <div>
                <div className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide">
                  {s.label}
                </div>

                <div className="text-base font-bold text-gray-900">
                  {s.value}
                </div>

                {s.sub && (
                  <div className="text-[9px] text-gray-400">
                    {s.sub}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>

    {/* CONTENT AREA */}
    <div className="flex flex-1 gap-4 overflow-hidden">

      {/* LOAN QUEUE */}
      <div className="w-64 bg-white border border-gray-200 rounded-xl overflow-hidden shrink-0">
        {LoanQueuePanel}
      </div>

      {/* AGENT WORKING */}
      <div className="flex-1 mr-4 min-w-0">
        {AgentsPanel}
      </div>

    </div>

  </div>

  {/* HASIL PANEL */}
  <div className="w-72 bg-white border border-gray-200 rounded-l-xl flex flex-col overflow-hidden shrink-0">
    {HasilPanel}
  </div>

</div>

        {/* ── MOBILE: tab-based layout ──────────────────────── */}
        <div className="flex lg:hidden flex-1 flex-col overflow-hidden">
          {/* Tab content */}
          <div className="flex-1 overflow-hidden bg-white">
            {mobileTab === "queue" && LoanQueuePanel}
            {mobileTab === "agents" && AgentsPanel}
            {mobileTab === "hasil" && HasilPanel}
          </div>

          {/* Bottom tab bar */}
          <div className="bg-white border-t border-gray-200 flex shrink-0">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setMobileTab(t.key)}
                className={`flex-1 py-3 text-xs font-semibold transition-colors ${mobileTab === t.key ? "text-red-600 border-t-2 border-red-500" : "text-gray-500"}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
