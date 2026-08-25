# 🔧 Wrenchly — Smart Workshop Management

**Wrenchly** adalah aplikasi manajemen operasional dan kasir (POS/ERP) modern untuk bengkel sepeda motor. Dirancang untuk merampingkan seluruh alur kerja bengkel—mulai dari penerimaan servis (PKB), penugasan teknisi, permintaan suku cadang, hingga kasir dan rekap performa bisnis eksekutif.

---

## ✨ Fitur Utama

- **Penerimaan & PKB (Work Order)**: Pencatatan kendaraan dengan auto-lookup nopol, checklist inspeksi fisik, dan cetak dokumen PKB standar A4.
- **Manajemen Pit & Antrean**: Alokasi teknisi fleksibel—bisa ditugaskan untuk antre terlebih dahulu atau langsung mulai dikerjakan di pit.
- **Pengajuan Part & Jasa Ekstra**: Mekanik dapat mengajukan suku cadang dan jasa tambahan secara langsung dari pit, lengkap dengan alur persetujuan konsumen (*customer approval*).
- **Kasir & Billing**: Penggabungan tagihan jasa + part, dukungan multi-metode pembayaran (Tunai, Transfer, QRIS), dan pemotongan stok otomatis.
- **Executive Dashboard**: Rekapitulasi omzet harian, rata-rata transaksi, produktivitas teknisi, serta peringatan stok menipis (*Reorder Point*).
- **Keamanan & RBAC Granular**: Pembagian hak akses terisolasi menggunakan dual-token JWT (In-Memory Access Token + HttpOnly Refresh Cookie).

---

## 👥 Hak Akses Pengguna

| Peran | Tanggung Jawab & Akses |
| :--- | :--- |
| **SA / Admin** | Penerimaan servis (PKB), alokasi teknisi, kasir/billing, approval part dengan konsumen, dan kelola stok suku cadang. |
| **Mekanik** | Melihat daftar tugas servis sendiri, mengajukan part/jasa tambahan, menyelesaikan servis, dan cek sisa stok gudang (*view-only*). |
| **Kepala Bengkel** | Akses Executive Dashboard, manajemen akun/user RBAC, kelola data teknisi, serta monitoring antrean dan master data (*view-only*). |

---

## 🛠️ Tech Stack

- **Frontend**: Vue 3 (Composition API), Pinia, Vite, Vanilla CSS Design System, Phosphor Icons, SweetAlert2.
- **Backend**: Node.js, Express.js, Prisma ORM, MySQL (3NF Normalized).
- **Keamanan**: Dual-Token JWT (Access Token 5m + Refresh Token 7d httpOnly Cookie), bcryptjs, CORS, Helmet.
- **Testing**: Vitest, Jest, Supertest, ESLint, Swagger OpenAPI 3.0.

---

## 🚀 Panduan Memulai

### 1. Prasyarat
- Node.js (v18+)
- MySQL Server aktif

### 2. Setup Cepat (Monorepo Root)
```bash
# Install dependencies di root, backend, dan frontend
npm run install:all

# Setup Database Backend (Fresh Migration & Seeding)
npm run db:reset

# Jalankan Backend dan Frontend Sekaligus
npm run dev
```

> **Tips Reset Database Kapan Saja**:
> - `npm run db:reset` : Mengosongkan database & mengisi data master + dummy aktif.
> - `npm run db:reset:master` : Mengosongkan database & hanya mengisi data master (katalog motor, sparepart, dll).

Server API backend akan berjalan di port `3333` dan frontend di port `8080`.
Buka aplikasi di browser melalui **`http://localhost:8080`**.

---

## 🔑 Akun Demo

Gunakan akun berikut untuk mencoba alur sistem berdasarkan peran:

| Peran | Username | Password | Akses Utama |
| :--- | :--- | :--- | :--- |
| **SA / Admin** | `admin` | `admin123` | PKB, Pit Bay, Kasir, Stok Sparepart |
| **Mekanik** | `asep` | `asep123` | Tugas Servis Saya, Input Part/Jasa |
| **Kepala Bengkel** | `kepala` | `kepala123` | Executive Dashboard, User RBAC, Kelola Teknisi |

---

## 📖 Dokumentasi API

Dokumentasi interaktif OpenAPI/Swagger dapat diakses saat server backend berjalan:
👉 **`http://localhost:3333/api-docs`**

---

## 🧪 Menjalankan Pengujian

```bash
# Backend Integration Tests
cd backend && npm test

# Frontend Unit & Component Tests
cd frontend && npm test
```
