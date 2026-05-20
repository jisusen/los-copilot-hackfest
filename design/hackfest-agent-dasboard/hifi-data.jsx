// Hi-fi sample data: realistic Indonesian banking, BMS-flavored.
// Two stars: APP-006 (running, will become approved) and APP-010 (ready, AI-rejected — needs human review).

const HIFI_LOANS = [
  // READY (need attention) — sorted by risk DESC
  {
    id: "APP-010", name: "Yuli Andari", nik: "3273051508920004",
    prod: "KTA", purpose: "Renovasi Rumah", amt: "Rp 40.000.000", amtShort: "Rp 40jt",
    tenor: "36 bulan", monthly: "Rp 1.380.000",
    risk: "HIGH", crde: "REJECTED", state: "ready",
    score: 298, dti: 73.0, slik: "Kol.2", aml: "Clear", rules: 5,
    flags: ["DTI 73% exceeds RAC limit (40%)", "SLIK Kol.2 — Special Mention", "Address inconsistency"],
    elapsed: "3:42", agentDoneAt: "14:28",
  },
  {
    id: "APP-008", name: "Maya Putri", nik: "3273042008940012",
    prod: "Multiguna", purpose: "Modal Usaha", amt: "Rp 200.000.000", amtShort: "Rp 200jt",
    tenor: "60 bulan", monthly: "Rp 4.850.000",
    risk: "MEDIUM", crde: "REFER", state: "ready",
    score: 624, dti: 42.5, slik: "Kol.1", aml: "Clear", rules: 2,
    flags: ["DTI 42.5% slightly over Multiguna RAC (40%)", "Income verification pending"],
    elapsed: "4:01", agentDoneAt: "14:30",
  },
  {
    id: "APP-004", name: "Dewi Lestari", nik: "3273051203910008",
    prod: "KTA", purpose: "Pendidikan Anak", amt: "Rp 75.000.000", amtShort: "Rp 75jt",
    tenor: "48 bulan", monthly: "Rp 2.180.000",
    risk: "MEDIUM", crde: "REFER", state: "ready",
    score: 678, dti: 38.0, slik: "Kol.1", aml: "Clear", rules: 1,
    flags: ["Recent late payment (single occurrence, March 2025)"],
    elapsed: "3:55", agentDoneAt: "14:31",
  },

  // RUNNING
  {
    id: "APP-006", name: "Rina Susanti", nik: "3273052810950021",
    prod: "KTA", purpose: "Konsolidasi Hutang", amt: "Rp 25.000.000", amtShort: "Rp 25jt",
    tenor: "24 bulan", monthly: "Rp 1.180.000",
    state: "running", pct: 60, currentStep: "Membaca SLIK OJK…", elapsed: "1:13",
  },
  {
    id: "APP-003", name: "Ahmad Fauzi", nik: "3273051506880033",
    prod: "KPR", purpose: "Pembelian Rumah Pertama", amt: "Rp 500.000.000", amtShort: "Rp 500jt",
    tenor: "180 bulan", monthly: "Rp 4.250.000",
    state: "running", pct: 28, currentStep: "Membaca Data Keuangan…", elapsed: "0:42",
  },

  // QUEUED
  { id: "APP-002", name: "Siti Rahayu", prod: "KTA", purpose: "Renovasi Rumah", amt: "Rp 30.000.000", amtShort: "Rp 30jt", state: "queued" },
  { id: "APP-005", name: "Rudi Hartono", prod: "KKB", purpose: "Pembelian Mobil", amt: "Rp 150.000.000", amtShort: "Rp 150jt", state: "queued" },
  { id: "APP-011", name: "Indra Permana", prod: "KTA", purpose: "Liburan Keluarga", amt: "Rp 20.000.000", amtShort: "Rp 20jt", state: "queued" },
  { id: "APP-012", name: "Linda Susilo", prod: "Multiguna", purpose: "Modal Usaha", amt: "Rp 120.000.000", amtShort: "Rp 120jt", state: "queued" },
  { id: "APP-013", name: "Bambang Wijaya", prod: "KPR", purpose: "Renovasi Rumah", amt: "Rp 250.000.000", amtShort: "Rp 250jt", state: "queued" },

  // DECIDED today
  { id: "APP-009", name: "Doni Pratama", prod: "KPR", amt: "Rp 800jt", amtShort: "Rp 800jt", state: "decided", decision: "APPROVED", decidedAt: "13:22", analyst: "analyst01" },
  { id: "APP-001", name: "Budi Santoso", prod: "KTA", amt: "Rp 50jt", amtShort: "Rp 50jt", state: "decided", decision: "APPROVED", decidedAt: "12:15", analyst: "analyst01" },
  { id: "APP-007", name: "Hendra Wijaya", prod: "KTA", amt: "Rp 100jt", amtShort: "Rp 100jt", state: "decided", decision: "REJECTED", decidedAt: "11:48", analyst: "analyst01" },
];

// Agent step timeline — used in running cards + activity log
const AGENT_STEPS = [
  { idx: 1,  pct: 10,  label: "Membuka halaman LOS",                 done: true },
  { idx: 2,  pct: 20,  label: "Login ke sistem",                     done: true },
  { idx: 3,  pct: 30,  label: "Membaca Profil Debitur",              done: true },
  { idx: 4,  pct: 45,  label: "Membaca Data Keuangan — DTI 29%",     done: true },
  { idx: 5,  pct: 60,  label: "Membaca SLIK OJK",                    done: false, current: true },
  { idx: 6,  pct: 70,  label: "Membaca AML & Fraud",                 done: false },
  { idx: 7,  pct: 80,  label: "Membaca Hasil CRDE",                  done: false },
  { idx: 8,  pct: 88,  label: "Membaca Agunan",                      done: false },
  { idx: 9,  pct: 95,  label: "Menyusun nota analisis kredit",       done: false },
  { idx: 10, pct: 100, label: "Selesai",                             done: false },
];

// Activity log lines (with timestamps) — for live agent panel
const ACTIVITY_LOG = [
  { t: "14:32:01", kind: "ok",  msg: "Browser launched · session=ws-006-7a3f" },
  { t: "14:32:03", kind: "ok",  msg: "Navigated to https://los.bms.local/login" },
  { t: "14:32:07", kind: "ok",  msg: "Login successful as analyst01" },
  { t: "14:32:11", kind: "ok",  msg: "Opened APP-006 · /loans/APP-006" },
  { t: "14:32:14", kind: "ok",  msg: "Profil Debitur extracted · 12 fields" },
  { t: "14:32:21", kind: "ok",  msg: "Data Keuangan extracted · DTI 29%, monthly Rp 1.18M" },
  { t: "14:32:24", kind: "now", msg: "Reading SLIK OJK — kolektibilitas history…" },
];

// Memo content for APP-010 (the rejected one)
const MEMO_010 = {
  appId: "APP-010",
  title: "Nota Analisis Kredit Konsumer",
  date: "26 April 2026",
  status: "DRAFT AI — MENUNGGU KEPUTUSAN ANALIS",
  crde: {
    decision: "DITOLAK", risk: "HIGH", score: 298, scoreOut: 1000,
    rules: ["DTI exceeds RAC", "SLIK Kol.2", "Address inconsistency", "Income verification failed", "High-risk purpose"],
  },
  metrics: { dti: "73.0%", slik: "Kol.2", aml: "Clear", score: "298/1000", rules: 5 },
  sections: [
    {
      n: 1, key: "profil", title: "Profil Debitur",
      body: [
        ["Nama Lengkap",        "Yuli Andari"],
        ["NIK",                 "3273051508920004"],
        ["Tempat / Tgl Lahir",  "Jakarta, 15 Agustus 1992"],
        ["Status",              "Belum Menikah"],
        ["Pendidikan",          "S1 Manajemen"],
        ["Pekerjaan",           "Karyawan Swasta — staf admin"],
        ["Lama Bekerja",        "2 tahun 4 bulan"],
        ["Alamat KTP",          "Jl. Mawar No. 14, Bekasi"],
        ["Alamat Tempat Tinggal","Jl. Kenanga No. 22, Jakarta Timur — tidak sesuai KTP"],
      ],
    },
    {
      n: 2, key: "permohonan", title: "Permohonan Kredit",
      body: [
        ["Produk",       "KTA — Kredit Tanpa Agunan"],
        ["Nominal",      "Rp 40.000.000"],
        ["Tenor",        "36 bulan"],
        ["Tujuan",       "Renovasi Rumah"],
        ["Angsuran",     "Rp 1.380.000 / bulan"],
        ["Suku Bunga",   "12.5% efektif p.a."],
      ],
    },
    {
      n: 3, key: "keuangan", title: "Analisis Keuangan & Kemampuan Bayar",
      body: [
        ["Penghasilan / bulan",      "Rp 6.500.000"],
        ["Total Kewajiban Existing", "Rp 3.365.000"],
        ["Angsuran KTA Permohonan",  "Rp 1.380.000"],
        ["Total Kewajiban After",    "Rp 4.745.000"],
        ["DTI Setelah",              "73.0% — melebihi batas RAC KTA (40%)"],
        ["Kapasitas Bayar",          "Tidak memadai"],
      ],
      note: "DTI 73% jauh melebihi batas RAC KTA 40%. Tidak memenuhi minimum standar.",
    },
    {
      n: 4, key: "slik", title: "Hasil SLIK OJK",
      body: [
        ["Kolektibilitas Saat Ini",    "2 (Special Mention)"],
        ["Tunggakan Tertinggi 12 bln", "62 hari"],
        ["Jumlah Fasilitas Aktif",     "3 (KKB, kartu kredit × 2)"],
        ["Total Plafon",               "Rp 285.000.000"],
        ["Riwayat",                    "Late payment ≥ 30 hari sebanyak 4× dalam 12 bulan terakhir"],
      ],
      note: "Kolektibilitas 2 + riwayat tunggakan berulang menunjukkan disiplin pembayaran rendah.",
    },
    {
      n: 5, key: "aml", title: "Screening AML & Deteksi Fraud",
      body: [
        ["Status AML / Sanctions",  "Clear"],
        ["PEP (Politically Exposed)", "Tidak"],
        ["Adverse Media",           "Tidak ditemukan"],
        ["Fraud Flag",              "Income inconsistency — slip gaji vs. mutasi rekening berbeda Rp 1.2jt"],
        ["Address Mismatch",        "Ya — KTP Bekasi, alamat tinggal Jakarta Timur, dokumen pendukung kurang"],
      ],
    },
    {
      n: 7, key: "crde", title: "Keputusan CRDE",
      body: [
        ["Risk Score",          "HIGH"],
        ["Skor Numerik",        "298 / 1000"],
        ["Rekomendasi",         "DITOLAK"],
        ["Rules Terpicu",       "5"],
      ],
      rules: [
        "DTI 73.0% melebihi batas RAC KTA (40%)",
        "Kolektibilitas SLIK 2 — Special Mention",
        "Tunggakan ≥ 30 hari sebanyak 4× dalam 12 bulan",
        "Inkonsistensi alamat KTP vs. tempat tinggal",
        "Inkonsistensi penghasilan slip gaji vs. mutasi",
      ],
    },
    {
      n: 8, key: "rekomendasi", title: "Catatan & Rekomendasi Analis",
      editable: true,
      body: [],
    },
  ],
};

// Suggested questions
const SUGGESTED_QS = [
  "Why did CRDE recommend rejection?",
  "What is the applicant's DTI and how does it compare to the RAC limit?",
  "What are the existing credit obligations?",
  "Are there any AML flags or fraud indicators?",
  "How is the payment history in SLIK OJK?",
];

// Pre-populated chat thread (so the chat panel feels alive in screenshots)
const CHAT_THREAD = [
  {
    role: "analyst", time: "14:31",
    text: "Why did CRDE recommend rejection for this application?",
  },
  {
    role: "copilot", time: "14:31",
    text:
"CRDE recommends REJECTION because 5 rules were triggered, all of them deal-breakers under our RAC for KTA:\n\n" +
"• DTI 73.0% — far exceeds the 40% KTA limit\n" +
"• SLIK collectability 2 (Special Mention) — ineligible for unsecured products\n" +
"• 4 late payments ≥30 days in the past 12 months\n" +
"• Address mismatch between KTP and stated residence, with insufficient supporting documents\n" +
"• Income inconsistency: salary slip vs. bank-statement mutation differ by ~Rp 1.2M\n\n" +
"Numeric score is 298/1000 — well below the 600 cutoff for KTA approval.",
    citations: ["RAC-KTA §3.1", "SLIK OJK", "Profil Debitur"],
  },
  {
    role: "analyst", time: "14:33",
    text: "If we extended the tenor to 48 months, would DTI come within the 40% limit?",
  },
  {
    role: "copilot", time: "14:33",
    text:
"No. At 48 months tenor, the monthly installment drops from Rp 1.38M to ~Rp 1.10M, " +
"reducing DTI from 73.0% to ~68.7% — still well above the 40% RAC limit.\n\n" +
"To get DTI under 40%, the requested amount would need to drop to ~Rp 14M, or the applicant's " +
"monthly income would need to exceed Rp 11.9M. Neither is a small adjustment.",
    citations: ["Data Keuangan"],
  },
];

Object.assign(window, { HIFI_LOANS, AGENT_STEPS, ACTIVITY_LOG, MEMO_010, SUGGESTED_QS, CHAT_THREAD });
