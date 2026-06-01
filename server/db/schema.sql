CREATE TABLE IF NOT EXISTS loan_applications (
    id TEXT PRIMARY KEY,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL,
    analyst_id TEXT,
    assigned_at TEXT,
    decided_at TEXT,
    product_type TEXT NOT NULL,
    amount_requested REAL NOT NULL,
    tenor_months INTEGER NOT NULL,
    loan_purpose TEXT,
    branch TEXT,
    marketing_officer TEXT,
    interest_rate REAL
);

CREATE TABLE IF NOT EXISTS debtors (
    id TEXT PRIMARY KEY,
    loan_id TEXT NOT NULL REFERENCES loan_applications(id),
    full_name TEXT NOT NULL,
    nik TEXT NOT NULL,
    npwp TEXT,
    date_of_birth TEXT,
    marital_status TEXT,
    dependents INTEGER DEFAULT 0,
    employment_type TEXT,
    employer_name TEXT,
    job_title TEXT,
    years_employed REAL,
    domicile_city TEXT,
    domicile_address TEXT,
    phone TEXT,
    email TEXT
);

CREATE TABLE IF NOT EXISTS financials (
    id TEXT PRIMARY KEY,
    loan_id TEXT NOT NULL REFERENCES loan_applications(id),
    gross_income REAL,
    net_income REAL,
    existing_obligations REAL DEFAULT 0,
    requested_installment REAL,
    total_obligations REAL,
    dti_ratio REAL,
    dti_threshold REAL,
    remaining_income REAL,
    income_verified INTEGER DEFAULT 0,
    verification_docs TEXT
);

CREATE TABLE IF NOT EXISTS slik_ojk (
    id TEXT PRIMARY KEY,
    loan_id TEXT NOT NULL REFERENCES loan_applications(id),
    check_date TEXT,
    kolektibilitas INTEGER,
    kolektibilitas_label TEXT,
    worst_kol_12m INTEGER,
    payment_history_24m TEXT,
    existing_bank TEXT,
    existing_facility TEXT,
    existing_amount REAL DEFAULT 0,
    total_obligations_slik REAL DEFAULT 0,
    blacklist_status INTEGER DEFAULT 0,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS aml_fraud (
    id TEXT PRIMARY KEY,
    loan_id TEXT NOT NULL REFERENCES loan_applications(id),
    screening_date TEXT,
    dttot_match INTEGER DEFAULT 0,
    un_sanctions_match INTEGER DEFAULT 0,
    pep_status INTEGER DEFAULT 0,
    pep_edd_required INTEGER DEFAULT 0,
    pep_detail TEXT,
    income_consistent INTEGER DEFAULT 1,
    address_flag INTEGER DEFAULT 0,
    fraud_signals TEXT,
    notes TEXT,
    engine_version TEXT DEFAULT 'BMS AML Engine v2.3'
);

CREATE TABLE IF NOT EXISTS crde_results (
    id TEXT PRIMARY KEY,
    loan_id TEXT NOT NULL REFERENCES loan_applications(id),
    processed_at TEXT,
    risk_score TEXT NOT NULL,
    decision TEXT NOT NULL,
    numeric_score INTEGER,
    dti_actual REAL,
    dti_threshold REAL,
    dti_passed INTEGER,
    kol_value INTEGER,
    kol_passed INTEGER,
    aml_passed INTEGER,
    fraud_passed INTEGER,
    rules_triggered TEXT,
    notes TEXT,
    engine_version TEXT DEFAULT 'BMS CRDE v3.1.0'
);

CREATE TABLE IF NOT EXISTS collaterals (
    id TEXT PRIMARY KEY,
    loan_id TEXT NOT NULL REFERENCES loan_applications(id),
    required INTEGER DEFAULT 0,
    collateral_type TEXT,
    asset_description TEXT,
    market_value REAL,
    liquidation_value REAL,
    appraisal_date TEXT,
    ltv_ratio REAL,
    ltv_threshold REAL,
    certificate_number TEXT,
    legal_status TEXT,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'analyst',
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    app_id TEXT NOT NULL REFERENCES loan_applications(id),
    actor TEXT NOT NULL,
    action TEXT NOT NULL,
    detail TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS loan_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    app_id TEXT NOT NULL,
    author TEXT NOT NULL,
    author_type TEXT NOT NULL DEFAULT 'manual',
    content TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'General',
    memo_json TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_loan_notes_app_id ON loan_notes(app_id);
