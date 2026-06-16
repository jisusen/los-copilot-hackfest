---
name: Juknis KTA
description: Panduan analis untuk Kredit Tanpa Agunan — keputusan, batas RAC, dan rekomendasi
version: 2.0.0
author: Tim Kredit Konsumer
trigger: memo
source: PDF
product: KTA
---

# Juknis KTA — Kredit Tanpa Agunan

> **Sumber kebijakan:** Dokumen Juknis KTA resmi bank (PDF) yang di-upload dan dikelola tim kredit.
> Copilot memakai isi ini sebagai acuan saat menulis memo — bukan aturan teknis sistem.

**Berlaku untuk:** permohonan dengan produk **KTA** (tanpa agunan).

---

## Untuk siapa

Analis kredit konsumer yang meninjau aplikasi KTA sebelum menyetujui, menolak, atau merujuk ke komite.

---

## Apa yang harus dicek (checklist analis)

Sebelum menulis rekomendasi, pastikan sudah menilai:

- [ ] **Kapasitas bayar** — penghasilan bersih vs total kewajiban + cicilan baru
- [ ] **DBR** — apakah masih dalam batas kebijakan?
- [ ] **SLIK** — kolektibilitas terkini & riwayat 24 bulan
- [ ] **AML & fraud** — PEP, DTTOT, inkonsistensi data
- [ ] **Tujuan kredit** — masuk akal vs profil debitur
- [ ] **Keputusan CRDE** — setuju dengan mesin atau ada alasan override?

---

## Batas RAC KTA (aturan keputusan)

*Tim kredit dapat mengubah angka di bawah sesuai PDF Juknis terbaru.*

| Kriteria | Batas | Jika melanggar |
|----------|-------|----------------|
| DBR | **maks 40%** | Rujuk komite atau tolak |
| SLIK Kol terkini | ideal **1** | Kol ≥2 → red flag, jelaskan di memo |
| SLIK terburuk 12 bln | ideal **1** | Kol 3+ → cenderung ditolak |
| AML / sanctions | **bersih** | PEP → EDD wajib; DTTOT → tolak |
| Plafon KTA | sesuai kebijakan produk | Plafon di atas wewenang analis → komite |

### Wewenang rekomendasi

| Kondisi | Rekomendasi analis |
|---------|-------------------|
| Semua RAC terpenuhi, CRDE APPROVED | **SETUJU** |
| DBR 40–45% + pekerjaan/mapnas stabil | **RUJUK KOMITE KREDIT** |
| DBR > 45% | **TOLAK** |
| SLIK Kol ≥2 + riwayat buruk | **RUJUK KOMITE** atau **TOLAK** |
| PEP teridentifikasi | **RUJUK KOMITE** (setelah EDD) |
| DTTOT / sanksi UN | **TOLAK** |
| CRDE REJECTED + ≥2 kekhawatiran | **TOLAK** |

---

## Kekhawatiran utama (tulis sebagai bullet)

Jangan satu paragraf panjang. Gunakan daftar:

- DBR **X%** — bandingkan dengan batas 40% dan sisa penghasilan
- SLIK Kol **X** — sebut fasilitas bermasalah jika ada
- AML — jenis flag (PEP, fraud, dll.)
- Setiap aturan CRDE yang terpicu — **satu bullet per aturan**

---

## Rekomendasi akhir (format wajib)

**Baris pertama** harus salah satu:

- `**Rekomendasi: SETUJU**`
- `**Rekomendasi: RUJUK KOMITE KREDIT**`
- `**Rekomendasi: TOLAK**`

Lalu:

1. **Alasan** — 2–3 kalimat, merujuk DBR / SLIK / AML
2. **Kekhawatiran** — bullet jika lebih dari satu poin
3. **Syarat pencairan** (hanya jika SETUJU), contoh:
   - Auto-debit rekening gaji
   - Asuransi jiwa kredit
   - Tidak restrukturisasi 12 bulan pertama

### Contoh — SETUJU

```
**Rekomendasi: SETUJU**

KTA tanpa agunan; DBR **32%**, SLIK Kol 1, AML bersih. Kapasitas bayar memadai.

Syarat:
• Auto-debit rekening gaji
• Asuransi jiwa sesuai plafon
```

### Contoh — RUJUK KOMITE

```
**Rekomendasi: RUJUK KOMITE KREDIT**

DBR **43%** di atas RAC; pekerjaan tetap namun buffer tipis.

Kekhawatiran utama:
• DBR 43% melebihi batas 40%
• SLIK Kol 2 (sudah lancar 14 bulan terakhir)
```

### Contoh — TOLAK

```
**Rekomendasi: TOLAK**

DBR tidak memadai untuk KTA tanpa agunan.

Kekhawatiran utama:
• DBR **52%** jauh di atas batas 40%
• SLIK Kol 3 pada fasilitas aktif
```

---

## Override keputusan CRDE

Boleh hanya jika ada **faktor mitigasi** yang tidak tercermin di data LOS (bonus tetap, pensiun, dll.).

Tulis eksplisit: *"Override CRDE karena …"* + bukti yang diperlukan.

Tanpa mitigasi → **ikuti CRDE**.

---

## Catatan khusus KTA

- Produk **tanpa agunan** — DBR dan SLIK adalah pertahanan utama
- Jangan setujui hanya karena skor CRDE tinggi jika DBR melanggar RAC
- Naskah formal, singkat, untuk arsip internal bank — bukan bahasa marketing