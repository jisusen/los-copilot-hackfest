const id = {
  // Sidebar
  "sidebar.dashboard": "Dasbor",
  "sidebar.audit": "Log Audit",
  "sidebar.settings": "Pengaturan",
  "sidebar.collapse": "Ciutkan",
  "sidebar.close": "Tutup",
  "sidebar.simulation": "MODE SIMULASI",

  // Header
  "header.agent": "Agen",
  "header.real": "Nyata",
  "header.sim": "Sim",
  "header.live": "Langsung",
  "header.on": "HIDUP",
  "header.off": "MATI",

  // Dashboard
  "dash.pipeline": "Pipeline · Triage",
  "dash.in_queue": "DALAM ANTRIAN",
  "dash.running": "BERJALAN",
  "dash.need_decision": "BUTUH KEPUTUSAN",
  "dash.decided_today": "DIPUTUSKAN HARI INI",
  "dash.avg_time": "RATA-RATA WAKTU",
  "dash.of_max": "dari 5 maks",
  "dash.vs_manual": "vs 47 menit manual",
  "dash.selected": "terpilih",
  "dash.run_review": "Jalankan Review",
  "dash.starting": "Memulai…",
  "dash.agents_working": "Copilot Bekerja",
  "dash.agents_sub": "dari 5 maks paralel",
  "dash.cinemas": "Mode Bioskop",
  "dash.select_prompt": "Pilih aplikasi untuk memulai",
  "dash.select_hint": "Cek pinjaman di antrian, lalu klik Jalankan Review",
  "dash.slot_available": "Slot tersedia",
  "dash.auto_take": "Agen akan otomatis mengambil aplikasi dari antrian",
  "dash.results": "Hasil Analisis",

  // Confirmation modal
  // HasilPanel
  "hasil.ready": "Siap",
  "hasil.decided": "Diputuskan",
  "hasil.empty_title": "Tidak ada data",
  "hasil.empty_desc": "Belum ada aplikasi pada tab ini",
  "hasil.ready_label": "SIAP",
  "hasil.approved": "DISETUJUI",
  "hasil.rejected": "DITOLAK",
  "hasil.product": "Produk",
  "hasil.amount": "Jumlah",
  "hasil.risk": "Risiko",
  "hasil.waiting": "Menunggu review",
  "hasil.review": "Review",
  "hasil.see_all": "Lihat semua hasil analisis",
  "hasil.results_ready": "Hasil Analisis tersedia di panel sebelah kanan",

  // Confirmation modal
  "confirm.title": "Konfirmasi Sebelum Review",
  "confirm.desc": "Hasil review dihasilkan oleh AI dan mungkin tidak sepenuhnya akurat. Harap periksa kembali sebelum mengambil keputusan.",
  "confirm.proceed": "Ya, Lanjutkan",
  "confirm.cancel": "Batal",

  // Review page
  "review.back": "Kembali",
  "review.print": "Cetak",
  "review.not_found": "Sesi tidak ditemukan",
  "review.not_found_desc": "Tidak ditemukan sesi untuk",
  "review.back_pipeline": "Kembali ke Pipeline",

  // Audit
  "audit.title": "Log Audit",
  "audit.desc": "Semua aktivitas agen dan analis di seluruh sistem",
  "audit.empty": "Tidak ada entri audit ditemukan",

  // Settings
  "settings.title": "Pengaturan",
  "settings.save": "Simpan perubahan",
  "settings.saved": "Tersimpan",
  "settings.analysis_llm": "LLM Analisis",
  "settings.analysis_llm_desc": "Digunakan untuk ekstraksi data dan pembuatan memo",
  "settings.browsing_llm": "LLM Penjelajahan",
  "settings.browsing_llm_desc": "Model cepat/murah untuk navigasi UI vendor. Kosongkan untuk menggunakan LLM Analisis.",
  "settings.los_connection": "Koneksi LOS",
  "settings.agent": "Copilot",
  "settings.agent_desc": "Perilaku browser dan strategi ekstraksi",
  "settings.skills": "Keahlian",
  "settings.skills_desc": "SOP, Juknis, atau pedoman kustom yang dimasukkan ke agen",
  "settings.provider": "Penyedia",
  "settings.api_key": "Kunci API",
  "settings.model": "Model",
  "settings.base_url": "URL Dasar",
  "settings.same_as_analysis": "Sama dengan LLM Analisis",
  "settings.mock": "Mode agen tiruan (tanpa Python, menggunakan data seed)",
  "settings.memo_sop": "SOP / Juknis Memo (Markdown)",
  "settings.memo_placeholder": "Kosongkan untuk menggunakan SOP bawaan. Tempel Juknis atau panduan memo kredit bank Anda dalam format Markdown.",
  "settings.memo_hint": "Menimpa SOP bawaan jika tidak kosong. Gunakan untuk aturan khusus bank, pemetaan keputusan CRDE, atau pedoman format.",
  "settings.extraction_mode": "Mode ekstraksi",
  "settings.extraction_browser": "Browser (LLM navigasi UI LOS)",
  "settings.extraction_api": "API (panggilan REST langsung — cepat)",
  "settings.test_connection": "Uji Koneksi LOS",
  "settings.testing": "Menguji...",
  "settings.configured": "Terkonfigurasi",
  "settings.incomplete": "Belum Lengkap",
  "settings.not_set": "Belum Diatur",
};

const en: typeof id = {
  // Sidebar
  "sidebar.dashboard": "Dashboard",
  "sidebar.audit": "Audit Log",
  "sidebar.settings": "Settings",
  "sidebar.collapse": "Collapse",
  "sidebar.close": "Close",
  "sidebar.simulation": "SIMULATION MODE",

  // Header
  "header.agent": "Agent",
  "header.real": "Real",
  "header.sim": "Sim",
  "header.live": "Live",
  "header.on": "ON",
  "header.off": "OFF",

  // Dashboard
  "dash.pipeline": "Pipeline · Triage",
  "dash.in_queue": "IN QUEUE",
  "dash.running": "RUNNING",
  "dash.need_decision": "NEED DECISION",
  "dash.decided_today": "DECIDED TODAY",
  "dash.avg_time": "AVG TIME",
  "dash.of_max": "of 5 max",
  "dash.vs_manual": "vs 47 min manual",
  "dash.selected": "selected",
  "dash.run_review": "Run Review",
  "dash.starting": "Starting…",
  "dash.agents_working": "Copilot Working",
  "dash.agents_sub": "of 5 max parallel",
  "dash.cinemas": "Cinemas Mode",
  "dash.select_prompt": "Select applications to begin",
  "dash.select_hint": "Check loans in the queue, then click Run review",
  "dash.slot_available": "Slot available",
  "dash.auto_take": "Agent will automatically pick from queue",
  "dash.results": "Analysis Results",

  // HasilPanel
  "hasil.ready": "Ready",
  "hasil.decided": "Decided",
  "hasil.empty_title": "No data",
  "hasil.empty_desc": "No applications in this tab yet",
  "hasil.ready_label": "READY",
  "hasil.approved": "APPROVED",
  "hasil.rejected": "REJECTED",
  "hasil.product": "Product",
  "hasil.amount": "Amount",
  "hasil.risk": "Risk",
  "hasil.waiting": "Waiting review",
  "hasil.review": "Review",
  "hasil.see_all": "See all analysis results",
  "hasil.results_ready": "Results available in the right panel",

  // Confirmation modal
  "confirm.title": "Confirm Before Review",
  "confirm.desc": "Review results are AI-generated and may not be fully accurate. Please double-check before making any decisions.",
  "confirm.proceed": "Yes, Proceed",
  "confirm.cancel": "Cancel",

  // Review page
  "review.back": "Back",
  "review.print": "Print",
  "review.not_found": "Session not found",
  "review.not_found_desc": "No session was found for",
  "review.back_pipeline": "Back to Pipeline",

  // Audit
  "audit.title": "Audit Log",
  "audit.desc": "All agent and analyst activity across the system",
  "audit.empty": "No audit entries found",

  // Settings
  "settings.title": "Settings",
  "settings.save": "Save changes",
  "settings.saved": "Saved",
  "settings.analysis_llm": "Analysis LLM",
  "settings.analysis_llm_desc": "Used for data extraction and memo generation",
  "settings.browsing_llm": "Browsing LLM",
  "settings.browsing_llm_desc": "Fast/cheap model for vendor UI navigation. Leave empty to reuse Analysis LLM.",
  "settings.los_connection": "LOS Connection",
  "settings.agent": "Agent",
  "settings.agent_desc": "Browser behavior and extraction strategy",
  "settings.skills": "Skills",
  "settings.skills_desc": "Custom SOP, Juknis, or guidelines injected into the agent",
  "settings.provider": "Provider",
  "settings.api_key": "API Key",
  "settings.model": "Model",
  "settings.base_url": "Base URL",
  "settings.same_as_analysis": "Same as Analysis LLM",
  "settings.mock": "Mock agent mode (no Python, uses seeded fixtures)",
  "settings.memo_sop": "Memo SOP / Juknis (Markdown)",
  "settings.memo_placeholder": "Leave empty to use the built-in default SOP. Paste your bank's Juknis or credit memo guidelines here as Markdown.",
  "settings.memo_hint": "Overrides the built-in SOP when non-empty. Use it for bank-specific rules, CRDE decision mappings, or formatting guidelines.",
  "settings.extraction_mode": "Extraction mode",
  "settings.extraction_browser": "Browser (LLM navigates LOS UI)",
  "settings.extraction_api": "API (direct REST calls — fast)",
  "settings.test_connection": "Test LOS Connection",
  "settings.testing": "Testing...",
  "settings.configured": "Configured",
  "settings.incomplete": "Incomplete",
  "settings.not_set": "Not set",
};

export type Locale = "id" | "en";
const locales = { id, en };

export function t(key: keyof typeof id, locale: Locale = "en"): string {
  return locales[locale]?.[key] ?? locales.en[key] ?? key;
}

export function getLocale(): Locale {
  if (typeof localStorage === "undefined") return "en";
  return (localStorage.getItem("locale") as Locale) ?? "en";
}

export function setLocale(locale: Locale) {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("locale", locale);
  }
}
