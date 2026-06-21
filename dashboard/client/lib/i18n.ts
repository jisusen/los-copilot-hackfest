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
  "dash.select_prompt": "Pilih pinjaman di daftar tugas",
  "dash.select_hint": "Centang pinjaman di Task List, lalu klik Run Review",
  "dash.slot_available": "Slot tersedia",
  "dash.auto_take": "Agen akan otomatis mengambil aplikasi dari antrian",
  "dash.results": "Hasil Analisis",
  "dash.tip_1": "Centang pinjaman di Task List",
  "dash.tip_2": "Lalu klik Run Review",
  "dash.tip_3": "Hasil muncul di panel kanan",
  "dash.joki_greeting": "Siap bantu!",
  "dash.joki_subtitle": "Pilih hingga 5 aplikasi, lalu jalankan review",
  "dash.joki_memo_lang": "Memo akan ditulis dalam Bahasa Indonesia",
  "dash.agents_idle": "Copilot siap — menunggu tugas",

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
  "confirm.desc":
    "Hasil review dihasilkan oleh AI dan mungkin tidak sepenuhnya akurat. Harap periksa kembali sebelum mengambil keputusan.",
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
  "settings.memo_llm": "LLM Memo",
  "settings.memo_llm_desc": "Menulis memo analisis kredit",
  "settings.browsing_llm": "LLM Penjelajahan",
  "settings.browsing_llm_desc":
    "Menavigasi UI LOS di browser (Gemini atau Claude — bukan mimo)",
  "settings.los_connection": "Koneksi LOS",
  "settings.agent": "Copilot",
  "settings.agent_desc": "Perilaku browser dan strategi ekstraksi",
  "settings.skills": "Keahlian",
  "settings.skills_desc":
    "SOP, Juknis, atau pedoman kustom yang dimasukkan ke agen",
  "settings.provider": "Penyedia",
  "settings.api_key": "Kunci API",
  "settings.model": "Model",
  "settings.base_url": "URL Dasar",
  "settings.same_as_analysis": "Sama dengan LLM Analisis",
  "settings.mock": "Mode agen tiruan (tanpa Python, menggunakan data seed)",
  "settings.memo_sop": "SOP / Juknis Memo (Markdown)",
  "settings.memo_placeholder":
    "Kosongkan untuk menggunakan SOP bawaan. Tempel Juknis atau panduan memo kredit bank Anda dalam format Markdown.",
  "settings.memo_hint":
    "Menimpa SOP bawaan jika tidak kosong. Gunakan untuk aturan khusus bank, pemetaan keputusan CRDE, atau pedoman format.",
  "settings.extraction_mode": "Mode ekstraksi",
  "settings.extraction_browser": "Browser (LLM navigasi UI LOS)",
  "settings.extraction_api": "API (panggilan REST langsung — cepat)",
  "settings.test_connection": "Uji Koneksi LOS",
  "settings.testing": "Menguji...",
  "settings.configured": "Terkonfigurasi",
  "settings.incomplete": "Belum Lengkap",
  "settings.not_set": "Belum Diatur",

  // Driver Tour
  "tour.welcome_title": "👋 Selamat Datang di JOKI AI",
  "tour.welcome_desc": "Dashboard ini membantu Anda menjalankan AI Agent untuk menganalisis aplikasi kredit secara otomatis. Ikuti tur singkat ini untuk mengenal fitur-fitur utama.",
  "tour.task_list_title": "📋 Task List",
  "tour.task_list_desc": "Daftar aplikasi kredit yang menunggu untuk diproses. Centang aplikasi yang ingin dianalisis oleh AI Agent (maksimal 5).",
  "tour.run_review_title": "▶️ Run Review",
  "tour.run_review_desc": "Setelah memilih aplikasi, klik tombol ini untuk menjalankan AI Agent. Agent akan secara otomatis membuka LOS, mengekstrak data, dan memberikan rekomendasi kredit.",
  "tour.agents_title": "🤖 Agents Working",
  "tour.agents_desc": "Lihat progress AI Agent secara real-time. Anda bisa melihat screenshot langsung dari browser agent saat sedang bekerja.",
  "tour.hasil_title": "📊 Hasil Panel",
  "tour.hasil_desc": "Setelah agent selesai, hasil analisis akan muncul di panel ini. Ada 2 tab: 'Ready' (menunggu keputusan Anda) dan 'Decided' (yang sudah diputuskan).",
  "tour.status_title": "📈 Status Cards",
  "tour.status_desc": "Ringkasan jumlah aplikasi yang antri, sedang diproses, menunggu keputusan, dan sudah diputuskan hari ini.",
  "tour.end_title": "🎉 Tur Selesai!",
  "tour.end_desc": "Anda siap menggunakan JOKI AI! Pilih aplikasi, klik Run Review, dan biarkan AI bekerja. Gunakan menu Audit Log untuk melihat riwayat aktivitas.",
  "tour.progress": "Langkah {{current}} dari {{total}}",
  "tour.next": "Selanjutnya",
  "tour.prev": "Sebelumnya",
  "tour.done": "Selesai",
  "tour.skip": "Skip",
  "tour.help": "Panduan Dashboard",
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
  "dash.select_prompt": "Select applications to begin",
  "dash.select_hint": "Check loans in Task List, then click Run Review",
  "dash.slot_available": "Slot available",
  "dash.auto_take": "Agent will automatically pick from queue",
  "dash.results": "Analysis Results",
  "dash.tip_1": "Check loans in Task List",
  "dash.tip_2": "Then click Run Review",
  "dash.tip_3": "Results appear on the right panel",
  "dash.joki_greeting": "Here to help!",
  "dash.joki_subtitle": "Select up to 5 applications, then run review",
  "dash.joki_memo_lang": "Memos will be written in English",
  "dash.agents_idle": "Copilot ready — waiting for tasks",

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
  "confirm.desc":
    "Review results are AI-generated and may not be fully accurate. Please double-check before making any decisions.",
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
  "settings.memo_llm": "Memo LLM",
  "settings.memo_llm_desc": "Writes the credit analysis memo",
  "settings.browsing_llm": "Browsing LLM",
  "settings.browsing_llm_desc":
    "Navigates the LOS UI in the browser (Gemini or Claude — not mimo)",
  "settings.los_connection": "LOS Connection",
  "settings.agent": "Agent",
  "settings.agent_desc": "Browser behavior and extraction strategy",
  "settings.skills": "Skills",
  "settings.skills_desc":
    "Custom SOP, Juknis, or guidelines injected into the agent",
  "settings.provider": "Provider",
  "settings.api_key": "API Key",
  "settings.model": "Model",
  "settings.base_url": "Base URL",
  "settings.same_as_analysis": "Same as Analysis LLM",
  "settings.mock": "Mock agent mode (no Python, uses seeded fixtures)",
  "settings.memo_sop": "Memo SOP / Juknis (Markdown)",
  "settings.memo_placeholder":
    "Leave empty to use the built-in default SOP. Paste your bank's Juknis or credit memo guidelines here as Markdown.",
  "settings.memo_hint":
    "Overrides the built-in SOP when non-empty. Use it for bank-specific rules, CRDE decision mappings, or formatting guidelines.",
  "settings.extraction_mode": "Extraction mode",
  "settings.extraction_browser": "Browser (LLM navigates LOS UI)",
  "settings.extraction_api": "API (direct REST calls — fast)",
  "settings.test_connection": "Test LOS Connection",
  "settings.testing": "Testing...",
  "settings.configured": "Configured",
  "settings.incomplete": "Incomplete",
  "settings.not_set": "Not set",

  // Driver Tour
  "tour.welcome_title": "👋 Welcome to JOKI AI",
  "tour.welcome_desc": "This dashboard helps you run AI Agents to analyze credit applications automatically. Take this quick tour to learn about the key features.",
  "tour.task_list_title": "📋 Task List",
  "tour.task_list_desc": "List of credit applications waiting to be processed. Check the applications you want the AI Agent to analyze (max 5).",
  "tour.run_review_title": "▶️ Run Review",
  "tour.run_review_desc": "After selecting applications, click this button to launch the AI Agent. The agent will automatically open LOS, extract data, and provide credit recommendations.",
  "tour.agents_title": "🤖 Agents Working",
  "tour.agents_desc": "See AI Agent progress in real-time. You can view live screenshots from the agent's browser as it works.",
  "tour.hasil_title": "📊 Results Panel",
  "tour.hasil_desc": "After the agent finishes, analysis results appear in this panel. There are 2 tabs: 'Ready' (awaiting your decision) and 'Decided' (already decided).",
  "tour.status_title": "📈 Status Cards",
  "tour.status_desc": "Summary of queued, processing, pending decision, and today's decided applications.",
  "tour.end_title": "🎉 Tour Complete!",
  "tour.end_desc": "You're ready to use JOKI AI! Select applications, click Run Review, and let AI work. Use the Audit Log menu to view activity history.",
  "tour.progress": "Step {{current}} of {{total}}",
  "tour.next": "Next",
  "tour.prev": "Previous",
  "tour.done": "Finish",
  "tour.skip": "Skip",
  "tour.help": "Dashboard Guide",
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
