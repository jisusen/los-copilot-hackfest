import { getDb } from './client';

const USERS: Record<string, string> = {
  analyst01: 'analyst',
  analyst02: 'analyst',
  supervisor: 'supervisor',
};

type SeedApp = {
  id: string;
  debtor_name: string;
  nik: string;
  npwp: string;
  dob: string;
  marital: string;
  dependents: number;
  emp_type: string;
  employer: string;
  job_title: string;
  years_employed: number;
  city: string;
  address: string;
  phone: string;
  email: string;
  product: string;
  amount: number;
  tenor: number;
  rate: number;
  purpose: string;
  branch: string;
  mo: string;
  status: string;
  created_at: string;
  gross: number;
  net: number;
  existing_oblig: number;
  installment: number;
  dti: number;
  dti_threshold: number;
  verified_docs: string;
  slik_kol: number;
  slik_kol_label: string;
  slik_worst_12m: number;
  slik_history_24m: string;
  slik_bank: string;
  slik_facility: string;
  slik_amount: number;
  slik_notes: string;
  aml_pep: number;
  aml_pep_detail: string;
  aml_dttot: number;
  aml_un: number;
  aml_income_consistent: number;
  aml_address_flag: number;
  aml_fraud_signals: string;
  aml_notes: string;
  crde_risk: string;
  crde_decision: string;
  crde_score: number;
  crde_rules: string[];
  crde_notes: string;
  collateral_required: number;
  collateral_type: string | null;
  collateral_desc: string | null;
  collateral_market: number | null;
  collateral_liquid: number | null;
  collateral_appraisal: string | null;
  collateral_ltv: number | null;
  collateral_ltv_threshold: number | null;
  collateral_cert: string | null;
  collateral_legal: string | null;
  collateral_notes: string | null;
};

const APPS: SeedApp[] = [
  {
    id: 'APP-001',
    debtor_name: 'Budi Santoso',
    nik: '3174051203850003',
    npwp: '12.345.678.9-012.000',
    dob: '1985-03-12',
    marital: 'Married',
    dependents: 2,
    emp_type: 'Private Employee',
    employer: 'PT Astra International Tbk',
    job_title: 'Senior Engineer',
    years_employed: 8.25,
    city: 'Jakarta Selatan, DKI Jakarta',
    address: 'Jl. Kebagusan Raya No. 12, RT 003/RW 005, Pasar Minggu',
    phone: '0812-3456-7890',
    email: 'budi.santoso@email.com',
    product: 'KTA',
    amount: 50_000_000,
    tenor: 24,
    rate: 10.5,
    purpose: 'Home renovation',
    branch: 'Jakarta Selatan Branch',
    mo: 'Ahmad Riyadi — MO-047',
    status: 'Under Review',
    created_at: '2025-04-15T08:30:00',
    gross: 18_500_000,
    net: 14_800_000,
    existing_oblig: 2_100_000,
    installment: 2_310_000,
    dti: 0.298,
    dti_threshold: 0.40,
    verified_docs: 'Payslip + 3-Month Bank Statement',
    slik_kol: 1,
    slik_kol_label: 'Current',
    slik_worst_12m: 1,
    slik_history_24m: 'Good — no late payments in 24 months',
    slik_bank: 'Bank Central Asia',
    slik_facility: 'Unsecured Loan',
    slik_amount: 15_000_000,
    slik_notes: 'Debtor has excellent credit history over the past 24 months.',
    aml_pep: 0,
    aml_pep_detail: '',
    aml_dttot: 0,
    aml_un: 0,
    aml_income_consistent: 1,
    aml_address_flag: 0,
    aml_fraud_signals: '',
    aml_notes: 'AML screening passed. No risk indicators found.',
    crde_risk: 'LOW',
    crde_decision: 'APPROVED',
    crde_score: 847,
    crde_rules: [],
    crde_notes: 'Application meets all RAC criteria. DTI within limit, good collectability, no AML flags.',
    collateral_required: 0,
    collateral_type: null,
    collateral_desc: null,
    collateral_market: null,
    collateral_liquid: null,
    collateral_appraisal: null,
    collateral_ltv: null,
    collateral_ltv_threshold: null,
    collateral_cert: null,
    collateral_legal: null,
    collateral_notes: null,
  },
  {
    id: 'APP-002',
    debtor_name: 'Siti Rahayu',
    nik: '3275014505900021',
    npwp: '98.765.432.1-017.000',
    dob: '1990-05-05',
    marital: 'Married',
    dependents: 1,
    emp_type: 'Private Employee',
    employer: 'PT Unilever Indonesia Tbk',
    job_title: 'Marketing Executive',
    years_employed: 5.0,
    city: 'Tangerang, Banten',
    address: 'Jl. Gading Serpong Utama Blok A2 No. 7, Tangerang',
    phone: '0821-5678-9012',
    email: 'siti.rahayu@email.com',
    product: 'KTA',
    amount: 30_000_000,
    tenor: 12,
    rate: 10.5,
    purpose: 'Children education',
    branch: 'Tangerang Branch',
    mo: 'Budi Setiawan — MO-023',
    status: 'Under Review',
    created_at: '2025-04-16T09:15:00',
    gross: 10_000_000,
    net: 8_200_000,
    existing_oblig: 650_000,
    installment: 2_795_000,
    dti: 0.421,
    dti_threshold: 0.40,
    verified_docs: '3-Month Payslip + Annual Tax Return',
    slik_kol: 1,
    slik_kol_label: 'Current',
    slik_worst_12m: 1,
    slik_history_24m: 'Good — no late payments',
    slik_bank: 'Bank Mandiri',
    slik_facility: 'Credit Card',
    slik_amount: 5_000_000,
    slik_notes: 'Debtor consistently pays credit card installments on time over the past 24 months.',
    aml_pep: 0,
    aml_pep_detail: '',
    aml_dttot: 0,
    aml_un: 0,
    aml_income_consistent: 1,
    aml_address_flag: 0,
    aml_fraud_signals: '',
    aml_notes: 'AML screening passed. No risk indicators found.',
    crde_risk: 'LOW',
    crde_decision: 'APPROVED',
    crde_score: 791,
    crde_rules: ['DTI 42.1% slightly exceeds KTA limit (40%) — within override tolerance'],
    crde_notes: 'DTI slightly above threshold but within tolerance. Good collectability. Approved with notes.',
    collateral_required: 0,
    collateral_type: null,
    collateral_desc: null,
    collateral_market: null,
    collateral_liquid: null,
    collateral_appraisal: null,
    collateral_ltv: null,
    collateral_ltv_threshold: null,
    collateral_cert: null,
    collateral_legal: null,
    collateral_notes: null,
  },
  {
    id: 'APP-003',
    debtor_name: 'Ahmad Fauzi',
    nik: '3578021507800045',
    npwp: '55.123.456.7-031.000',
    dob: '1980-07-15',
    marital: 'Married',
    dependents: 3,
    emp_type: 'Civil Servant',
    employer: 'Kementerian Keuangan RI',
    job_title: 'Kepala Seksi Anggaran',
    years_employed: 18.5,
    city: 'Jakarta Pusat, DKI Jakarta',
    address: 'Jl. Cikini Raya No. 45, RT 001/RW 003, Cikini',
    phone: '0813-9012-3456',
    email: 'ahmad.fauzi@email.com',
    product: 'KPR',
    amount: 500_000_000,
    tenor: 180,
    rate: 9.5,
    purpose: 'Home purchase',
    branch: 'Jakarta Pusat Branch',
    mo: 'Rina Dewi — MO-031',
    status: 'Under Review',
    created_at: '2025-04-14T11:00:00',
    gross: 25_000_000,
    net: 20_000_000,
    existing_oblig: 2_000_000,
    installment: 5_210_000,
    dti: 0.361,
    dti_threshold: 0.40,
    verified_docs: 'Civil Servant Appointment Decree + Payslip + Salary Certificate',
    slik_kol: 1,
    slik_kol_label: 'Current',
    slik_worst_12m: 1,
    slik_history_24m: 'Excellent — no late payments in 24 months',
    slik_bank: 'Bank BNI',
    slik_facility: 'Mortgage',
    slik_amount: 250_000_000,
    slik_notes: 'Excellent credit history. Existing mortgage payments on time.',
    aml_pep: 0,
    aml_pep_detail: '',
    aml_dttot: 0,
    aml_un: 0,
    aml_income_consistent: 1,
    aml_address_flag: 0,
    aml_fraud_signals: '',
    aml_notes: 'AML screening passed. Civil servant profile — not a PEP, no risk indicators.',
    crde_risk: 'LOW',
    crde_decision: 'APPROVED',
    crde_score: 823,
    crde_rules: [],
    crde_notes: 'Civil servant with stable income. DTI within limit, excellent collectability, no AML/fraud flags.',
    collateral_required: 1,
    collateral_type: 'SHM',
    collateral_desc: '2-storey residential house, land 120m², building 200m², prime location Jakarta Pusat',
    collateral_market: 1_200_000_000,
    collateral_liquid: 960_000_000,
    collateral_appraisal: '2025-04-10',
    collateral_ltv: 0.417,
    collateral_ltv_threshold: 0.80,
    collateral_cert: 'SHM-78901/JKT-PST',
    collateral_legal: 'Clear',
    collateral_notes: 'Collateral in excellent condition, marketable, prime location. LTV well below limit.',
  },
  {
    id: 'APP-004',
    debtor_name: 'Dewi Lestari',
    nik: '3273025806880034',
    npwp: '77.654.321.0-027.000',
    dob: '1988-06-18',
    marital: 'Married',
    dependents: 2,
    emp_type: 'Private Employee',
    employer: 'PT Indofood Sukses Makmur Tbk',
    job_title: 'Finance Manager',
    years_employed: 6.5,
    city: 'Bandung, Jawa Barat',
    address: 'Jl. Dago Pakar No. 23, Cibeunying Kaler, Bandung',
    phone: '0857-2345-6789',
    email: 'dewi.lestari@email.com',
    product: 'KTA',
    amount: 75_000_000,
    tenor: 36,
    rate: 10.5,
    purpose: 'Side business capital',
    branch: 'Bandung Dago Branch',
    mo: 'Haris Maulana — MO-058',
    status: 'Under Review',
    created_at: '2025-04-17T10:30:00',
    gross: 12_000_000,
    net: 9_800_000,
    existing_oblig: 2_570_000,
    installment: 2_430_000,
    dti: 0.510,
    dti_threshold: 0.40,
    verified_docs: 'Payslip + 3-Month Bank Statement',
    slik_kol: 2,
    slik_kol_label: 'Special Mention',
    slik_worst_12m: 2,
    slik_history_24m: '2 late payments in last 12 months (< 30 days)',
    slik_bank: 'Bank CIMB Niaga',
    slik_facility: 'Unsecured Loan',
    slik_amount: 40_000_000,
    slik_notes: 'Debtor has a history of late payments. Collectability 2 (Special Mention).',
    aml_pep: 0,
    aml_pep_detail: '',
    aml_dttot: 0,
    aml_un: 0,
    aml_income_consistent: 1,
    aml_address_flag: 0,
    aml_fraud_signals: '',
    aml_notes: 'Basic AML screening passed. No AML/fraud risk indicators.',
    crde_risk: 'MEDIUM',
    crde_decision: 'COMMITTEE REVIEW',
    crde_score: 612,
    crde_rules: [
      'DTI 51.0% exceeds KTA limit (40%) — committee review required',
      'Collectability 2 (Special Mention) — history of late payments',
    ],
    crde_notes: 'Two risk factors identified: DTI above threshold and Special Mention collectability. Credit committee review required for final decision.',
    collateral_required: 0,
    collateral_type: null,
    collateral_desc: null,
    collateral_market: null,
    collateral_liquid: null,
    collateral_appraisal: null,
    collateral_ltv: null,
    collateral_ltv_threshold: null,
    collateral_cert: null,
    collateral_legal: null,
    collateral_notes: null,
  },
  {
    id: 'APP-005',
    debtor_name: 'Rudi Hartono',
    nik: '3374031012790012',
    npwp: '44.876.543.2-033.000',
    dob: '1979-10-30',
    marital: 'Married',
    dependents: 3,
    emp_type: 'Private Employee',
    employer: 'PT Toyota Astra Motor',
    job_title: 'Production Supervisor',
    years_employed: 14.0,
    city: 'Karawang, Jawa Barat',
    address: 'Perumahan Karawang Baru Blok D5 No. 12, Karawang',
    phone: '0818-7890-1234',
    email: 'rudi.hartono@email.com',
    product: 'KKB',
    amount: 150_000_000,
    tenor: 48,
    rate: 11.0,
    purpose: 'Family vehicle purchase',
    branch: 'Karawang Branch',
    mo: 'Sari Indah — MO-062',
    status: 'Under Review',
    created_at: '2025-04-13T14:00:00',
    gross: 20_000_000,
    net: 16_500_000,
    existing_oblig: 2_420_000,
    installment: 3_850_000,
    dti: 0.380,
    dti_threshold: 0.40,
    verified_docs: 'Payslip + Employment Certificate + Vehicle Title',
    slik_kol: 1,
    slik_kol_label: 'Current',
    slik_worst_12m: 1,
    slik_history_24m: 'Good — payments always on time',
    slik_bank: 'Bank BRI',
    slik_facility: 'Vehicle Loan',
    slik_amount: 80_000_000,
    slik_notes: 'Excellent vehicle loan payment history over 24 months.',
    aml_pep: 0,
    aml_pep_detail: '',
    aml_dttot: 0,
    aml_un: 0,
    aml_income_consistent: 1,
    aml_address_flag: 0,
    aml_fraud_signals: '',
    aml_notes: 'AML screening passed. No risk indicators found.',
    crde_risk: 'LOW',
    crde_decision: 'APPROVED',
    crde_score: 808,
    crde_rules: [],
    crde_notes: 'Senior employee with long tenure. DTI within limit, good collectability, low risk profile.',
    collateral_required: 1,
    collateral_type: 'BPKB',
    collateral_desc: '4-wheel motor vehicle — Toyota Fortuner 2024, white',
    collateral_market: 150_000_000,
    collateral_liquid: 120_000_000,
    collateral_appraisal: '2025-04-12',
    collateral_ltv: 0.80,
    collateral_ltv_threshold: 0.85,
    collateral_cert: 'BPKB-B1234XYZ',
    collateral_legal: 'Clear',
    collateral_notes: 'Brand new 2024 vehicle, excellent condition. LTV consistent with KKB RAC.',
  },
  {
    id: 'APP-006',
    debtor_name: 'Rina Susanti',
    nik: '3471046109920056',
    npwp: '33.567.890.1-041.000',
    dob: '1992-09-21',
    marital: 'Single',
    dependents: 0,
    emp_type: 'Private Employee',
    employer: 'PT Gojek Indonesia',
    job_title: 'Product Manager',
    years_employed: 3.5,
    city: 'Yogyakarta, DI Yogyakarta',
    address: 'Jl. Seturan Raya No. 8, Sleman, Yogyakarta',
    phone: '0851-3456-7890',
    email: 'rina.susanti@email.com',
    product: 'KTA',
    amount: 25_000_000,
    tenor: 12,
    rate: 10.5,
    purpose: 'Holiday and wedding preparation',
    branch: 'Yogyakarta Branch',
    mo: 'Dimas Prasetyo — MO-075',
    status: 'Under Review',
    created_at: '2025-04-18T09:00:00',
    gross: 9_500_000,
    net: 7_600_000,
    existing_oblig: 0,
    installment: 2_207_000,
    dti: 0.290,
    dti_threshold: 0.40,
    verified_docs: '3-Month Payslip + Bank Statement',
    slik_kol: 1,
    slik_kol_label: 'Current',
    slik_worst_12m: 1,
    slik_history_24m: 'Good — no late payments, no existing credit',
    slik_bank: '-',
    slik_facility: '-',
    slik_amount: 0,
    slik_notes: 'First-time borrower. No previous credit history.',
    aml_pep: 0,
    aml_pep_detail: '',
    aml_dttot: 0,
    aml_un: 0,
    aml_income_consistent: 1,
    aml_address_flag: 0,
    aml_fraud_signals: '',
    aml_notes: 'AML screening passed. Clean profile, no risk indicators found.',
    crde_risk: 'LOW',
    crde_decision: 'APPROVED',
    crde_score: 861,
    crde_rules: [],
    crde_notes: 'Excellent risk profile. Low DTI, no existing obligations, good collectability. Approved.',
    collateral_required: 0,
    collateral_type: null,
    collateral_desc: null,
    collateral_market: null,
    collateral_liquid: null,
    collateral_appraisal: null,
    collateral_ltv: null,
    collateral_ltv_threshold: null,
    collateral_cert: null,
    collateral_legal: null,
    collateral_notes: null,
  },
  {
    id: 'APP-007',
    debtor_name: 'Hendra Wijaya',
    nik: '3175040805820027',
    npwp: '66.432.109.8-015.000',
    dob: '1982-05-08',
    marital: 'Married',
    dependents: 4,
    emp_type: 'Private Employee',
    employer: 'PT Cipaganti Citra Graha',
    job_title: 'Area Sales Manager',
    years_employed: 9.0,
    city: 'Jakarta Barat, DKI Jakarta',
    address: 'Jl. Puri Kencana No. 34, Kembangan, Jakarta Barat',
    phone: '0822-4567-8901',
    email: 'hendra.wijaya@email.com',
    product: 'KTA',
    amount: 100_000_000,
    tenor: 36,
    rate: 10.5,
    purpose: 'Debt consolidation and working capital',
    branch: 'Jakarta Barat Branch',
    mo: 'Wahyu Santoso — MO-019',
    status: 'Under Review',
    created_at: '2025-04-12T13:30:00',
    gross: 15_000_000,
    net: 12_000_000,
    existing_oblig: 4_800_000,
    installment: 3_238_000,
    dti: 0.670,
    dti_threshold: 0.40,
    verified_docs: 'Payslip + 6-Month Bank Statement',
    slik_kol: 3,
    slik_kol_label: 'Substandard',
    slik_worst_12m: 3,
    slik_history_24m: 'Poor — over 90-day delays on 2 credit facilities',
    slik_bank: 'Bank Danamon + Bank Mega',
    slik_facility: 'Unsecured Loan + Credit Card',
    slik_amount: 120_000_000,
    slik_notes: 'Collectability 3 (Substandard). Significant late payment history. High default risk.',
    aml_pep: 0,
    aml_pep_detail: '',
    aml_dttot: 0,
    aml_un: 0,
    aml_income_consistent: 1,
    aml_address_flag: 0,
    aml_fraud_signals: '',
    aml_notes: 'AML screening passed. No AML risk indicators.',
    crde_risk: 'HIGH',
    crde_decision: 'REJECTED',
    crde_score: 341,
    crde_rules: [
      'DTI 67.0% far exceeds KTA limit (40%) — does not qualify',
      'Collectability 3 (Substandard) — high default risk',
      'Total existing obligations IDR 120,000,000 — very high debt burden',
    ],
    crde_notes: 'Very high risk profile. DTI 67% far exceeds threshold. Collectability 3 indicates repeated defaults. Application rejected.',
    collateral_required: 0,
    collateral_type: null,
    collateral_desc: null,
    collateral_market: null,
    collateral_liquid: null,
    collateral_appraisal: null,
    collateral_ltv: null,
    collateral_ltv_threshold: null,
    collateral_cert: null,
    collateral_legal: null,
    collateral_notes: null,
  },
  {
    id: 'APP-008',
    debtor_name: 'Maya Putri',
    nik: '3274015204870041',
    npwp: '88.901.234.5-022.000',
    dob: '1987-04-12',
    marital: 'Married',
    dependents: 1,
    emp_type: 'Self-Employed',
    employer: 'CV Maju Bersama (Direktur)',
    job_title: 'Direktur Utama',
    years_employed: 7.0,
    city: 'Jakarta Selatan, DKI Jakarta',
    address: 'Jl. Kemang Raya No. 88, Kemang, Jakarta Selatan',
    phone: '0815-6789-0123',
    email: 'maya.putri@email.com',
    product: 'Multiguna',
    amount: 200_000_000,
    tenor: 60,
    rate: 11.0,
    purpose: 'Business development and expansion',
    branch: 'Jakarta Selatan Premium Branch',
    mo: 'Irfan Hakim — MO-011',
    status: 'Under Review',
    created_at: '2025-04-16T15:00:00',
    gross: 22_000_000,
    net: 18_000_000,
    existing_oblig: 3_634_000,
    installment: 4_286_000,
    dti: 0.440,
    dti_threshold: 0.40,
    verified_docs: '2-Year Financial Statements + 6-Month Bank Statement + Business License + Company Deed',
    slik_kol: 2,
    slik_kol_label: 'Special Mention',
    slik_worst_12m: 2,
    slik_history_24m: '1 late payment (< 30 days) in last 12 months',
    slik_bank: 'Bank BCA + Bank Mandiri',
    slik_facility: 'Working Capital Loan + Credit Card',
    slik_amount: 150_000_000,
    slik_notes: 'Collectability 2 (Special Mention). Self-employed with variable cash flow.',
    aml_pep: 1,
    aml_pep_detail: "Debtor's husband (Mr. Kurniawan Saputra) is a former Eselon II official at Ministry of SOEs, 2018-2022",
    aml_dttot: 0,
    aml_un: 0,
    aml_income_consistent: 1,
    aml_address_flag: 0,
    aml_fraud_signals: '',
    aml_notes: 'ALERT: Debtor identified as PEP (Politically Exposed Person) through family connection. Manual review required per PPATK regulations.',
    crde_risk: 'MEDIUM',
    crde_decision: 'COMMITTEE REVIEW',
    crde_score: 589,
    crde_rules: [
      'DTI 44.0% exceeds Multiguna limit (40%) — committee review required',
      'Collectability 2 (Special Mention) — history of late payments',
      'PEP Flag — debtor related to public official — enhanced due diligence required',
    ],
    crde_notes: 'Three risk factors: DTI above threshold, Special Mention collectability, and PEP flag. Enhanced Due Diligence required before final decision.',
    collateral_required: 1,
    collateral_type: 'SHM',
    collateral_desc: '3-storey shophouse in Kemang area, land 60m², building 180m²',
    collateral_market: 3_500_000_000,
    collateral_liquid: 2_800_000_000,
    collateral_appraisal: '2025-04-14',
    collateral_ltv: 0.057,
    collateral_ltv_threshold: 0.70,
    collateral_cert: 'SHM-34567/JKT-SEL',
    collateral_legal: 'Clear',
    collateral_notes: 'Premium commercial property in Kemang. Market value far exceeds loan amount. Very low LTV.',
  },
  {
    id: 'APP-009',
    debtor_name: 'Doni Pratama',
    nik: '3578090109750089',
    npwp: '22.345.678.9-037.000',
    dob: '1975-01-09',
    marital: 'Married',
    dependents: 3,
    emp_type: 'Civil Servant',
    employer: 'Pemerintah Kota Surabaya',
    job_title: 'Kepala Dinas Perizinan',
    years_employed: 22.0,
    city: 'Surabaya, Jawa Timur',
    address: 'Jl. Darmo Permai III No. 15, Surabaya',
    phone: '0819-8901-2345',
    email: 'doni.pratama@email.com',
    product: 'KPR',
    amount: 800_000_000,
    tenor: 240,
    rate: 9.5,
    purpose: 'Luxury home purchase',
    branch: 'Surabaya Darmo Branch',
    mo: 'Lina Kusuma — MO-089',
    status: 'Under Review',
    created_at: '2025-04-11T10:00:00',
    gross: 40_000_000,
    net: 32_000_000,
    existing_oblig: 2_794_000,
    installment: 7_446_000,
    dti: 0.320,
    dti_threshold: 0.40,
    verified_docs: 'Civil Servant Decree + Payslip + Salary Declaration + 3-Month Bank Statement',
    slik_kol: 1,
    slik_kol_label: 'Current',
    slik_worst_12m: 1,
    slik_history_24m: 'Excellent — no late payments, 20-year credit track record',
    slik_bank: 'Bank BNI + Bank BTN',
    slik_facility: 'Mortgage + Vehicle Loan',
    slik_amount: 350_000_000,
    slik_notes: 'Excellent 20-year credit track record. Always pays on time.',
    aml_pep: 0,
    aml_pep_detail: '',
    aml_dttot: 0,
    aml_un: 0,
    aml_income_consistent: 1,
    aml_address_flag: 0,
    aml_fraud_signals: '',
    aml_notes: 'AML screening passed. Senior civil servant, not identified as high-level PEP. No risk indicators.',
    crde_risk: 'LOW',
    crde_decision: 'APPROVED',
    crde_score: 835,
    crde_rules: [],
    crde_notes: 'Senior civil servant with 20-year credit track record. Stable income, good DTI, excellent collectability. Approved.',
    collateral_required: 1,
    collateral_type: 'SHM',
    collateral_desc: '2-storey luxury house, land 400m², building 500m², premium location Darmo Surabaya',
    collateral_market: 4_000_000_000,
    collateral_liquid: 3_200_000_000,
    collateral_appraisal: '2025-04-08',
    collateral_ltv: 0.20,
    collateral_ltv_threshold: 0.80,
    collateral_cert: 'SHM-56789/SBY',
    collateral_legal: 'Clear',
    collateral_notes: 'Premium property in Darmo area. Collateral value far exceeds loan amount. Very low LTV, minimal risk.',
  },
  {
    id: 'APP-010',
    debtor_name: 'Yuli Andari',
    nik: '3275024506930067',
    npwp: '11.678.901.2-044.000',
    dob: '1993-06-05',
    marital: 'Married',
    dependents: 1,
    emp_type: 'Private Employee',
    employer: 'PT Kreatif Digital Nusantara',
    job_title: 'Digital Marketing Specialist',
    years_employed: 2.5,
    city: 'Depok, Jawa Barat',
    address: 'Jl. Margonda Raya No. 456, Depok',
    phone: '0856-4567-8901',
    email: 'yuli.andari@email.com',
    product: 'KTA',
    amount: 40_000_000,
    tenor: 24,
    rate: 10.5,
    purpose: 'Cryptocurrency investment and business capital',
    branch: 'Depok Branch',
    mo: 'Teguh Prasetyo — MO-093',
    status: 'Under Review',
    created_at: '2025-04-18T16:00:00',
    gross: 8_000_000,
    net: 6_500_000,
    existing_oblig: 2_891_000,
    installment: 1_854_000,
    dti: 0.730,
    dti_threshold: 0.40,
    verified_docs: '1-Month Payslip (incomplete)',
    slik_kol: 2,
    slik_kol_label: 'Special Mention',
    slik_worst_12m: 2,
    slik_history_24m: '3 late payments in last 24 months',
    slik_bank: 'Bank OCBC + Akulaku',
    slik_facility: 'Unsecured Loan + PayLater',
    slik_amount: 35_000_000,
    slik_notes: 'Collectability 2 (Special Mention). Multiple credit lines with repeated late payments.',
    aml_pep: 0,
    aml_pep_detail: '',
    aml_dttot: 0,
    aml_un: 0,
    aml_income_consistent: 0,
    aml_address_flag: 1,
    aml_fraud_signals: 'Income inconsistency: payslip shows IDR 8,000,000 but bank transaction patterns are inconsistent; Loan purpose for crypto investment — high risk category',
    aml_notes: 'ALERT: Fraud signals detected. Inconsistency between payslip and bank transaction patterns. Reported income does not match transaction evidence. High-risk loan purpose.',
    crde_risk: 'HIGH',
    crde_decision: 'REJECTED',
    crde_score: 298,
    crde_rules: [
      'DTI 73.0% far exceeds KTA limit (40%) — does not qualify',
      'Collectability 2 (Special Mention) — repeated late payment history',
      'Fraud flag: income inconsistency detected — mandatory review',
      'Address flag: address data inconsistent with supporting documents',
      'Loan purpose is high-risk category (speculative investment)',
    ],
    crde_notes: 'Very high risk profile. Five risk factors identified. DTI 73%, Special Mention collectability, and income fraud signals. Application rejected.',
    collateral_required: 0,
    collateral_type: null,
    collateral_desc: null,
    collateral_market: null,
    collateral_liquid: null,
    collateral_appraisal: null,
    collateral_ltv: null,
    collateral_ltv_threshold: null,
    collateral_cert: null,
    collateral_legal: null,
    collateral_notes: null,
  },
];

function formatDate(iso: string): string {
  return iso.replace('T', ' ').substring(0, 16) + ' WIB';
}

export function resetAndSeed(reset = false) {
  const db = getDb();

  if (reset) {
    console.log('🗑️  Resetting database...');
    db.exec(`
      DELETE FROM sessions;
      DELETE FROM audit_logs;
      DELETE FROM collaterals;
      DELETE FROM crde_results;
      DELETE FROM aml_fraud;
      DELETE FROM slik_ojk;
      DELETE FROM financials;
      DELETE FROM debtors;
      DELETE FROM loan_applications;
    `);
  }

  const existing = db.query('SELECT COUNT(*) as c FROM loan_applications').get() as { c: number };
  if (!reset && existing.c > 0) {
    console.log(`ℹ️  Database already has ${existing.c} applications. Skipping seed. Use --reset to reseed.`);
    return;
  }

  console.log('🌱 Seeding loan applications...');

  const insertApp = db.prepare(`
    INSERT INTO loan_applications (id, status, created_at, product_type, amount_requested, tenor_months, loan_purpose, branch, marketing_officer, interest_rate)
    VALUES ($id, $status, $created_at, $product_type, $amount_requested, $tenor_months, $loan_purpose, $branch, $marketing_officer, $interest_rate)
  `);

  const insertDebtor = db.prepare(`
    INSERT INTO debtors (id, loan_id, full_name, nik, npwp, date_of_birth, marital_status, dependents, employment_type, employer_name, job_title, years_employed, domicile_city, domicile_address, phone, email)
    VALUES ($id, $loan_id, $full_name, $nik, $npwp, $dob, $marital_status, $dependents, $employment_type, $employer_name, $job_title, $years_employed, $domicile_city, $domicile_address, $phone, $email)
  `);

  const insertFinancial = db.prepare(`
    INSERT INTO financials (id, loan_id, gross_income, net_income, existing_obligations, requested_installment, total_obligations, dti_ratio, dti_threshold, remaining_income, income_verified, verification_docs)
    VALUES ($id, $loan_id, $gross, $net, $existing, $installment, $total, $dti, $dti_threshold, $remaining, $verified, $docs)
  `);

  const insertSlik = db.prepare(`
    INSERT INTO slik_ojk (id, loan_id, check_date, kolektibilitas, kolektibilitas_label, worst_kol_12m, payment_history_24m, existing_bank, existing_facility, existing_amount, total_obligations_slik, blacklist_status, notes)
    VALUES ($id, $loan_id, $check_date, $kol, $kol_label, $worst, $history, $bank, $facility, $amount, $total, $blacklist, $notes)
  `);

  const insertAml = db.prepare(`
    INSERT INTO aml_fraud (id, loan_id, screening_date, dttot_match, un_sanctions_match, pep_status, pep_edd_required, pep_detail, income_consistent, address_flag, fraud_signals, notes, engine_version)
    VALUES ($id, $loan_id, $date, $dttot, $un, $pep, $pep_edd, $pep_detail, $income, $addr, $fraud, $notes, 'BMS AML Engine v2.3')
  `);

  const insertCrde = db.prepare(`
    INSERT INTO crde_results (id, loan_id, processed_at, risk_score, decision, numeric_score, dti_actual, dti_threshold, dti_passed, kol_value, kol_passed, aml_passed, fraud_passed, rules_triggered, notes, engine_version)
    VALUES ($id, $loan_id, $processed_at, $risk, $decision, $score, $dti_actual, $dti_threshold, $dti_passed, $kol, $kol_passed, $aml_passed, $fraud_passed, $rules, $notes, 'BMS CRDE v3.1.0')
  `);

  const insertCollateral = db.prepare(`
    INSERT INTO collaterals (id, loan_id, required, collateral_type, asset_description, market_value, liquidation_value, appraisal_date, ltv_ratio, ltv_threshold, certificate_number, legal_status, notes)
    VALUES ($id, $loan_id, $required, $collateral_type, $desc, $market, $liquid, $appraisal, $ltv, $ltv_threshold, $cert, $legal, $notes)
  `);

  const insertAudit = db.prepare(`
    INSERT INTO audit_logs (app_id, actor, action, detail, created_at)
    VALUES ($app_id, $actor, $action, $detail, $created_at)
  `);

  const SCREENING_DATE = '2025-04-18';

  for (const app of APPS) {
    const total_oblig = app.existing_oblig + app.installment;
    const remaining = app.net - total_oblig;
    const aml_passed = app.aml_dttot === 0 && app.aml_un === 0 ? 1 : 0;
    const fraud_passed = app.aml_income_consistent === 1 && app.aml_address_flag === 0 ? 1 : 0;
    const dti_passed = app.dti <= app.dti_threshold ? 1 : 0;
    const kol_passed = app.slik_kol === 1 ? 1 : 0;

    insertApp.run({
      $id: app.id,
      $status: app.status,
      $created_at: app.created_at,
      $product_type: app.product,
      $amount_requested: app.amount,
      $tenor_months: app.tenor,
      $loan_purpose: app.purpose,
      $branch: app.branch,
      $marketing_officer: app.mo,
      $interest_rate: app.rate,
    });

    insertDebtor.run({
      $id: `DEB-${app.id}`,
      $loan_id: app.id,
      $full_name: app.debtor_name,
      $nik: app.nik,
      $npwp: app.npwp,
      $dob: app.dob,
      $marital_status: app.marital,
      $dependents: app.dependents,
      $employment_type: app.emp_type,
      $employer_name: app.employer,
      $job_title: app.job_title,
      $years_employed: app.years_employed,
      $domicile_city: app.city,
      $domicile_address: app.address,
      $phone: app.phone,
      $email: app.email,
    });

    insertFinancial.run({
      $id: `FIN-${app.id}`,
      $loan_id: app.id,
      $gross: app.gross,
      $net: app.net,
      $existing: app.existing_oblig,
      $installment: app.installment,
      $total: total_oblig,
      $dti: app.dti,
      $dti_threshold: app.dti_threshold,
      $remaining: remaining,
      $verified: 1,
      $docs: app.verified_docs,
    });

    insertSlik.run({
      $id: `SLIK-${app.id}`,
      $loan_id: app.id,
      $check_date: SCREENING_DATE,
      $kol: app.slik_kol,
      $kol_label: app.slik_kol_label,
      $worst: app.slik_worst_12m,
      $history: app.slik_history_24m,
      $bank: app.slik_bank,
      $facility: app.slik_facility,
      $amount: app.slik_amount,
      $total: app.existing_oblig + app.installment,
      $blacklist: 0,
      $notes: app.slik_notes,
    });

    insertAml.run({
      $id: `AML-${app.id}`,
      $loan_id: app.id,
      $date: SCREENING_DATE,
      $dttot: app.aml_dttot,
      $un: app.aml_un,
      $pep: app.aml_pep,
      $pep_edd: app.aml_pep,
      $pep_detail: app.aml_pep_detail,
      $income: app.aml_income_consistent,
      $addr: app.aml_address_flag,
      $fraud: app.aml_fraud_signals,
      $notes: app.aml_notes,
    });

    const processed_at = app.created_at.substring(0, 10) + 'T09:14:00';
    insertCrde.run({
      $id: `CRDE-${app.id}`,
      $loan_id: app.id,
      $processed_at: processed_at,
      $risk: app.crde_risk,
      $decision: app.crde_decision,
      $score: app.crde_score,
      $dti_actual: app.dti,
      $dti_threshold: app.dti_threshold,
      $dti_passed: dti_passed,
      $kol: app.slik_kol,
      $kol_passed: kol_passed,
      $aml_passed: aml_passed,
      $fraud_passed: fraud_passed,
      $rules: JSON.stringify(app.crde_rules),
      $notes: app.crde_notes,
    });

    insertCollateral.run({
      $id: `COL-${app.id}`,
      $loan_id: app.id,
      $required: app.collateral_required,
      $collateral_type: app.collateral_type,
      $desc: app.collateral_desc,
      $market: app.collateral_market,
      $liquid: app.collateral_liquid,
      $appraisal: app.collateral_appraisal,
      $ltv: app.collateral_ltv,
      $ltv_threshold: app.collateral_ltv_threshold,
      $cert: app.collateral_cert,
      $legal: app.collateral_legal,
      $notes: app.collateral_notes,
    });

    // Seed audit trail for each application
    insertAudit.run({
      $app_id: app.id,
      $actor: app.mo,
      $action: 'APPLICATION_SUBMITTED',
      $detail: `Application submitted via ${app.branch}`,
      $created_at: app.created_at,
    });
    insertAudit.run({
      $app_id: app.id,
      $actor: 'system',
      $action: 'CRDE_EVALUATED',
      $detail: `CRDE ${app.crde_decision} — Score ${app.crde_score}/1000`,
      $created_at: app.created_at.substring(0, 10) + 'T09:14:00',
    });
    insertAudit.run({
      $app_id: app.id,
      $actor: 'system',
      $action: 'AML_SCREENED',
      $detail: app.aml_pep ? 'PEP flag identified — enhanced due diligence required' : 'AML screening passed',
      $created_at: app.created_at.substring(0, 10) + 'T09:15:00',
    });
    if (app.status !== 'Under Review') {
      insertAudit.run({
        $app_id: app.id,
        $actor: 'analyst01',
        $action: `DECISION_${app.status.toUpperCase().replace(' ', '_')}`,
        $detail: `Manual review completed. Decision: ${app.status}`,
        $created_at: app.created_at.substring(0, 10) + 'T14:30:00',
      });
    }

    console.log(`  ✅ ${app.id} — ${app.debtor_name} (${app.product} ${formatRp(app.amount)}) → ${app.crde_decision}`);
  }

  console.log(`\n✨ Seeded ${APPS.length} applications successfully.`);
}

function formatRp(n: number): string {
  return 'Rp ' + n.toLocaleString('id-ID');
}

const isReset = process.argv.includes('--reset');
resetAndSeed(isReset);
