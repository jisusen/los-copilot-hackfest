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
      icon: (
        <svg viewBox="0 0 36 36" className="w-9 h-9">
          <circle cx="18" cy="18" r="18" fill="#fde8e8" />
          <circle cx="18" cy="18" r="10" fill="none" stroke="#c0392b" strokeWidth="3" />
          <circle cx="18" cy="18" r="5" fill="#c0392b" />
          <circle cx="26" cy="10" r="3" fill="#e74c3c" />
        </svg>
      ),
    },
    {
      label: "Waiting Approval",
      value: data.waitingApproval.toLocaleString(),
      icon: (
        <svg viewBox="0 0 36 36" className="w-9 h-9">
          <circle cx="18" cy="18" r="18" fill="#fde8e8" />
          <circle cx="18" cy="18" r="9" fill="none" stroke="#c0392b" strokeWidth="2.5" />
          <path d="M18 10v8l5 3" stroke="#c0392b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </svg>
      ),
    },
    {
      label: "Approved This Month",
      value: data.approvedThisMonth.toLocaleString(),
      icon: (
        <svg viewBox="0 0 36 36" className="w-9 h-9">
          <circle cx="18" cy="18" r="18" fill="#fde8e8" />
          <circle cx="18" cy="14" r="5" fill="#e67e22" />
          <circle cx="26" cy="12" r="3.5" fill="#27ae60" />
          <path d="M8 28c0-5 4.5-8 10-8s10 3 10 8" fill="#c0392b" />
        </svg>
      ),
    },
    {
      label: "Disbursment Volume",
      value: formatRp(data.disbursementVolume),
      icon: (
        <svg viewBox="0 0 36 36" className="w-9 h-9">
          <circle cx="18" cy="18" r="18" fill="#fde8e8" />
          <rect x="9" y="14" width="18" height="12" rx="2" fill="#7f8c8d" />
          <rect x="9" y="17" width="18" height="3" fill="#95a5a6" />
          <circle cx="14" cy="22" r="2" fill="#bdc3c7" />
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
          <div key={stat.label} className="bg-red-50 border border-red-100 rounded-2xl px-4 py-4 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs text-gray-500 font-medium leading-tight">{stat.label}</p>
              <p className="text-xl sm:text-2xl font-black text-gray-900 mt-1 tabular-nums">{stat.value}</p>
            </div>
            <div className="shrink-0 ml-2">{stat.icon}</div>
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
