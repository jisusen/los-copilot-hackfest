---
name: KTA Product Juknis
description: Juknis khusus Kredit Tanpa Agunan (KTA) — Bank Maju Bersama
version: 1.0.0
author: Bank Maju Bersama
trigger: memo
---

# Juknis Produk KTA (Kredit Tanpa Agunan)

**Berlaku jika** `product_type` = `KTA` di data LOS. Jika bukan KTA, abaikan skill ini.

## Karakteristik KTA di BMB

- **Tanpa agunan** — `section6_agunan` wajib: `Produk tanpa agunan — tidak diperlukan jaminan.`
- Plafon tipikal demo: Rp 10 juta – Rp 150 juta
- Tenor umum: 12–60 bulan
- Suku bunga: sesuai field `interest_rate` di LOS

## RAC KTA (Risk Acceptance Criteria)

| Kriteria | Batas | Catatan |
|----------|-------|---------|
| DBR / DTI | ≤ **40%** | Pelanggaran → biasanya `COMMITTEE REVIEW` atau `REJECTED` |
| SLIK Kol | ideal **1** | Kol ≥2 → red flag, jelaskan di section4 |
| SLIK worst 12m | ideal **1** | Kol 3+ → cenderung ditolak |
| AML / fraud | Clear | PEP atau DTTOT → EDD atau tolak |
| Numeric score | ≥700 prefer approve | &lt;500 → tolak; 500–699 → komite |

## Rules CRDE yang sering muncul (KTA)

Contoh dari aplikasi demo BMB — sebutkan jika ada di `rules_triggered`:

- `DTI X% exceeds KTA limit (40%)` — jelaskan dampak pada kapasitas bayar
- `DTI slightly exceeds KTA limit (40%) — within override tolerance` — catat toleransi analis
- `Collectability 2/3` — riwayat kredit buruk, mitigasi atau tolak
- `PEP flag` — wajib EDD di section5 + rujuk komite di section8

## Isi section khusus KTA

### section2_permohonan
Sebutkan eksplisit: **KTA (unsecured personal loan)**, plafon, tenor, tujuan (`loan_purpose`), estimasi angsuran.

### section3_keuangan
Hitung DBR dengan rumus LOS:
`(existing_obligations + requested_installment) / net_income × 100%`
Bandingkan dengan `dti_threshold` (biasanya 0.40 = 40%).
Sebut **sisa penghasilan** (`remaining_income`) setelah total kewajiban.

### section6_agunan
Selalu satu kalimat: produk KTA tidak memerlukan agunan.

### section8_rekomendasi
Sesuaikan dengan CRDE, tambahkan syarat KTA jika disetujui, mis.:
- auto-debit rekening gaji
- asuransi jiwa kredit (jika berlaku di BMB)
- tidak ada restrukturisasi 12 bulan pertama

## Contoh mapping keputusan (KTA)

| CRDE | Rekomendasi baris pertama |
|------|---------------------------|
| `APPROVED` | `**Recommended: APPROVE**` (EN) atau `**Rekomendasi: SETUJU**` (ID) |
| `COMMITTEE REVIEW` | `**Recommended: REFER TO CREDIT COMMITTEE**` atau `**Rekomendasi: RUJUK KOMITE KREDIT**` |
| `REJECTED` | `**Recommended: REJECT**` atau `**Rekomendasi: TOLAK**` |

Gunakan pasangan bahasa sesuai skill **Memo Bahasa Indonesia** jika aktif.