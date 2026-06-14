---
name: CreditMemoJuknis
description: Juknis Nota Analisis Kredit Konsumen — Bank Maju Bersama
version: 1.1.0
author: Bank Maju Bersama
trigger: memo
---

# Juknis Nota Analisis Kredit Konsumen (Credit Memo SOP)

Bank **Maju Bersama (BMB)** — digunakan oleh Copilot AI saat menghasilkan memo analisis kredit.
Memo ditampilkan di halaman Review (`CreditMemo.tsx`) dan harus mengisi **9 field JSON** persis.

## Output wajib (JSON keys)

Jangan ubah nama key. Isi semua 9 field:

| Key | Label di UI | Isi |
|-----|-------------|-----|
| `executive_summary` | Executive Summary | 4 kalimat ringkas |
| `section1_profil` | Debtor Profile | Profil debitur |
| `section2_permohonan` | Loan Application | Data permohonan |
| `section3_keuangan` | Financial Analysis | Kapasitas bayar + DTI/DBR |
| `section4_slik` | SLIK OJK Results | Riwayat kredit bureau |
| `section5_aml` | AML & Fraud Screening | Hasil screening |
| `section6_agunan` | Collateral | Agunan (jika ada) |
| `section7_crde` | CRDE Decision | Keputusan mesin + skor |
| `section8_rekomendasi` | Notes & Analyst Recommendations | Rekomendasi akhir |

- Bahasa default: **formal English** — jika skill **Memo Bahasa Indonesia** aktif, tulis semua section dalam Bahasa Indonesia
- Format: plain text per section; gunakan `**bold**` untuk angka Rp, %, skor, keputusan
- Gunakan `•` untuk daftar rules / red flags
- Maks **150 kata** per section (kecuali executive_summary: tepat 4 kalimat)
- Field kosong di data LOS: tulis `Not available.`

## Pemetaan data LOS

Gunakan nilai dari ekstraksi agent (tab Data Summary / API), jangan mengarang:

- **Produk**: `KTA` | `KPR` | `KKB` | `Multiguna`
- **DTI / DBR**: rasio desimal di LOS (mis. `0.421` = **42.1%**); batas RAC umumnya **40%**
- **SLIK kolektibilitas**: 1=Lancar, 2=Dalam Perhatian Khusus, 3+=macet
- **CRDE decision** (nilai di LOS seed/demo):
  - `APPROVED` → rekomendasi setujui
  - `COMMITTEE REVIEW` → rujuk komite kredit
  - `REJECTED` → rekomendasi tolak
- **Risk score**: `LOW` | `MEDIUM` | `HIGH`
- **Numeric score**: 0–1000 (UI menampilkan `Score X/1000`)
- **Rules triggered**: daftar string dari CRDE — satu rule per baris `•`

## Aturan per section

### executive_summary (4 kalimat)
1. Siapa pemohon + produk + nominal pinjaman
2. 1–2 faktor risiko utama (DTI, SLIK, AML, rules)
3. Keputusan CRDE + numeric score
4. Apa yang analis harus verifikasi / putuskan

### section1_profil
Nama lengkap, pekerjaan (tipe + perusahaan + jabatan + masa kerja), kota domisili, status verifikasi NIK/NPWP.

### section2_permohonan
Produk, **jumlah** pinjaman (Rp), tenor (bulan), suku bunga, tujuan kredit, estimasi angsuran bulanan.

### section3_keuangan
Penghasilan bersih, kewajiban existing, angsuran baru, total beban.
Wajib ada kalimat: `DBR of **X%** against a RAC threshold of **40%** — **PASS/FAIL**.`
Sisa penghasilan setelah semua kewajiban. Bold semua angka Rp dan %.

### section4_slik
Kolektibilitas terkini, riwayat 24 bulan, worst 12 bulan, fasilitas aktif, status blacklist.

### section5_aml
DTTOT, UN Sanctions, PEP, konsistensi penghasilan, flag alamat, sinyal fraud.
Jika bersih: `All AML/fraud screenings returned clear.`

### section6_agunan
- **KTA / tanpa agunan**: `Unsecured product — no collateral required.`
- **KPR / KKB / Multiguna beragun**: jenis, nilai pasar, nilai likuidasi, LTV vs batas RAC, status legal.

### section7_crde
Decision, risk classification, numeric score/1000.
Interpretasi skor: HIGH &lt;500, MEDIUM 500–749, LOW ≥750.
List setiap `rules_triggered` dengan `•`. Jika kosong: `No rules triggered — all RAC criteria passed.`

### section8_rekomendasi
Baris pertama **wajib** salah satu:
- `**Recommended: APPROVE**` ← jika CRDE `APPROVED`
- `**Recommended: REFER TO CREDIT COMMITTEE**` ← jika `COMMITTEE REVIEW`
- `**Recommended: REJECT**` ← jika `REJECTED`

Lalu 2–3 kalimat alasan spesifik merujuk pelanggaran RAC / mitigasi.

## Produk khusus

| Produk | Agunan | Perhatian |
|--------|--------|-----------|
| KTA | Tidak | DTI ketat ≤40%, SLIK Kol 1 ideal |
| KPR | Rumah | LTV, appraisal, legalitas sertifikat |
| KKB | Kendaraan | BPKB, nilai likuidasi kendaraan |
| Multiguna | Opsional | Cek apakah secured atau unsecured |

## Larangan

- Jangan keluarkan markdown fence atau teks di luar JSON
- Jangan bahasa selain English
- Jangan reasoning / chain-of-thought — hanya isi memo final
- Jangan kontradiksi keputusan CRDE tanpa menyebutkan alasan di section8