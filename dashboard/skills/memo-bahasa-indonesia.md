---
name: Memo Bahasa Indonesia
description: Keluaran memo dalam Bahasa Indonesia formal (bukan English)
version: 1.0.0
author: Tim Kredit Konsumer
trigger: memo
product: locale
source: manual
---

# Output Memo — Bahasa Indonesia

Skill ini **mengganti bahasa output memo** dari English ke **Bahasa Indonesia formal**.

## Aturan bahasa

- Tulis **seluruh isi** 9 field JSON dalam Bahasa Indonesia formal (naskah analis kredit bank).
- **Nama key JSON tetap English** (`executive_summary`, `section1_profil`, dll.) — jangan diubah.
- Istilah teknis boleh tetap: NIK, NPWP, SLIK, DBR, KTA, KPR, CRDE, PEP, DTTOT, Rp.
- Angka: format Indonesia boleh (`Rp 75.000.000`, `42,1%`) atau standar (`Rp 75,000,000`) — konsisten per memo.
- Gunakan **bold** (`**teks**`) untuk angka penting, keputusan, dan persentase.

## Judul konsep per section (isi dalam ID)

| Key | Gaya penulisan |
|-----|----------------|
| `executive_summary` | Ringkasan Eksekutif — 4 kalimat |
| `section1_profil` | Profil Debitur |
| `section2_permohonan` | Permohonan Kredit |
| `section3_keuangan` | Analisis Keuangan & Kapasitas Bayar |
| `section4_slik` | Hasil SLIK OJK |
| `section5_aml` | Screening AML & Fraud |
| `section6_agunan` | Agunan |
| `section7_crde` | Hasil CRDE |
| `section8_rekomendasi` | Rekomendasi Analis |

## Frasa rekomendasi wajib (section8)

Baris pertama **harus** salah satu:

- `**Rekomendasi: SETUJU**` ← CRDE `APPROVED`
- `**Rekomendasi: RUJUK KOMITE KREDIT**` ← CRDE `COMMITTEE REVIEW`
- `**Rekomendasi: TOLAK**` ← CRDE `REJECTED`

## Contoh kalimat DBR (section3)

`DBR sebesar **42,1%** terhadap batas RAC **40%** — **TIDAK LOLOS**.`

## Larangan

- Jangan campur English dan Indonesia dalam satu section (kecuali istilah teknis di atas).
- Jangan ubah struktur JSON atau tambah field.