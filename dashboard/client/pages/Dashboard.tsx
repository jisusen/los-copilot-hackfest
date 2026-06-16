import { useEffect, useState, useMemo, useRef } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { Layout } from '../components/Layout';
import { apiFetch, formatRp } from '../lib/api';

type TrendEntry = { month: string; [key: string]: string | number };
type WeeklyEntry = { day: string; apps: number };

type DashboardData = {
  total: number;
  waitingApproval: number;
  approvedThisMonth: number;
  disbursementVolume: number;
  trendData: TrendEntry[];
  weeklyData: WeeklyEntry[];
};

const PRODUCT_LABELS: Record<string, string> = {
  kta: "KTA",
  kpr: "KPR",
  kkb: "KKB",
  multiguna: "Multiguna",
};

const ALL_PRODUCTS_LABEL = "ALL PRODUCTS";

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [noticeVisible, setNoticeVisible] = useState(true);
  const [noticePage, setNoticePage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  useEffect(() => {
    apiFetch<DashboardData>('/api/dashboard').then(res => {
      setData(res);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const trendData = data?.trendData ?? [];
  const weeklyData = data?.weeklyData ?? [];
  const products = useMemo(() => {
    if (trendData.length === 0) return [];
    return Object.keys(trendData[0]).filter(k => k !== 'month');
  }, [trendData]);

  const filteredTrendData = useMemo(() => {
    if (!selectedProduct) return trendData;
    return trendData.map(entry => ({
      month: entry.month,
      [selectedProduct]: entry[selectedProduct] ?? 0,
    }));
  }, [trendData, selectedProduct]);

  const stats = data ? [
    {
      label: "Total Applications",
      value: data.total.toLocaleString(),
      iconBg: "#FEE2E2",
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      label: "Waiting Approval",
      value: data.waitingApproval.toLocaleString(),
      iconBg: "#FEF3C7",
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12,6 12,12 16,14" />
        </svg>
      ),
    },
    {
      label: "Approved This Month",
      value: data.approvedThisMonth.toLocaleString(),
      iconBg: "#D1FAE5",
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: "Disbursement Volume",
      value: formatRp(data.disbursementVolume),
      iconBg: "#E0E7FF",
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
        </svg>
      ),
    },
  ] : [];

  const colors = ['#c0392b', '#7b1a1a', '#e67e22', '#27ae60'];

  const displayProducts = useMemo(() => {
    if (selectedProduct) return [selectedProduct];
    return products;
  }, [products, selectedProduct]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3 text-gray-400">
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm">Loading dashboard...</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
    <div className="min-h-screen font-sans" style={{ fontFamily: "'Open Sans', sans-serif" }}>
      {/* Title */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-1 h-7 bg-red-700 rounded-full" />
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
      </div>

      {/* Notice & Alert — image banner with text beside octopus */}
      {noticeVisible && (
        <div className="relative rounded-2xl overflow-hidden mb-5">
          <img src="/img/dashboard1.png" alt="Notice" className="w-full h-auto block" />
          <div className="absolute inset-0 flex items-center p-3 sm:p-5 md:p-6 lg:p-8">
            <div className="ml-[30%] sm:ml-[25%] md:ml-[22%] lg:ml-[18%] xl:ml-[15%]">
              <p className="text-black font-bold text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl leading-tight">Notices & Alert</p>
              <p className="text-black/80 text-[10px] sm:text-xs md:text-sm mt-0.5 leading-snug max-w-md">
                Bank Maju Bersama is available 7 days a week
              </p>
              <div className="flex items-center gap-1.5 mt-1 sm:mt-2">
                {[1, 2, 3].map((d) => (
                  <button key={d} onClick={() => setNoticePage(d)}
                    className={`rounded-full transition-all ${noticePage === d ? "w-3 sm:w-4 h-1.5 sm:h-2 bg-gray-700" : "w-1.5 sm:w-2 h-1.5 sm:h-2 bg-gray-400"}`} />
                ))}
              </div>
            </div>
            <button onClick={() => setNoticeVisible(false)}
              className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center shrink-0 ml-auto self-start">
              <svg className="w-2.5 sm:w-3.5 h-2.5 sm:h-3.5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white border border-gray-200 rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: stat.iconBg }}>
              {stat.icon}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider leading-tight truncate">{stat.label}</p>
              <p className="text-xl sm:text-2xl font-black text-gray-900 mt-0.5 tabular-nums leading-tight">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Loan Application Trend */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm p-5 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Loan Application Trend 2026</h2>
              <p className="text-[11px] text-gray-400 mt-0.5">Application volume per product (YTD)</p>
            </div>
            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setDropdownOpen((o) => !o)}
                className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 min-w-36 transition-all shadow-sm">
                <svg className="w-3.5 h-3.5 text-red-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                <span className="flex-1 text-left uppercase tracking-wide">{selectedProduct ? (PRODUCT_LABELS[selectedProduct] || selectedProduct) : ALL_PRODUCTS_LABEL}</span>
                {selectedProduct && (
                  <span onClick={(e) => { e.stopPropagation(); setSelectedProduct(""); }}
                    className="text-gray-400 hover:text-red-600 transition-colors ml-0.5">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </span>
                )}
                <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl z-10 min-w-48 py-1.5 animate-in fade-in duration-100">
                  <button onClick={() => { setSelectedProduct(""); setDropdownOpen(false); }}
                    className={`w-full text-left px-3.5 py-2.5 text-xs font-semibold tracking-wide uppercase hover:bg-gray-50 transition-colors flex items-center gap-2 ${!selectedProduct ? 'text-red-700 bg-red-50' : 'text-gray-600'}`}>
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
                    {ALL_PRODUCTS_LABEL}
                  </button>
                  <div className="mx-2 my-1 border-t border-gray-100" />
                  {products.map((p) => (
                    <button key={p} onClick={() => { setSelectedProduct(p); setDropdownOpen(false); }}
                      className={`w-full text-left px-3.5 py-2.5 text-xs font-semibold tracking-wide hover:bg-gray-50 transition-colors flex items-center gap-2 ${selectedProduct === p ? 'text-red-700 bg-red-50' : 'text-gray-600'}`}>
                      <span className={`w-2 h-2 rounded-full shrink-0 ${selectedProduct === p ? 'bg-red-600' : 'bg-gray-300'}`} />
                      {PRODUCT_LABELS[p] || p}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={filteredTrendData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                {displayProducts.map((p, i) => (
                  <linearGradient key={p} id={`grad${p}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors[i % colors.length]} stopOpacity={0.7} />
                    <stop offset="95%" stopColor={colors[i % colors.length]} stopOpacity={0.1} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                labelStyle={{ fontWeight: 700, color: "#111" }}
                formatter={(value: number, name: string) => [value, PRODUCT_LABELS[name] || name]}
              />
              {displayProducts.map((p, i) => (
                <Area key={p} type="monotone" dataKey={p} name={p}
                  stroke={colors[i % colors.length]} strokeWidth={2} fill={`url(#grad${p})`} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Applications */}
        <div className="w-full lg:w-64 bg-white rounded-2xl border border-gray-200 shadow-sm p-5 shrink-0">
          <h2 className="text-sm font-bold text-gray-900">Weekly Applications</h2>
          <p className="text-[11px] text-gray-400 mt-0.5 mb-4">Last 7 days activity</p>

          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={weeklyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                labelStyle={{ fontWeight: 700, color: "#111" }}
                cursor={{ fill: "#fde8e8" }}
              />
              <Bar dataKey="apps" name="Applications" fill="#c0392b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
    </Layout>
  );
}
