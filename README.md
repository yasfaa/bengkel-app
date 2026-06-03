# BengkelKu

Sistem manajemen bengkel motor berbasis Vue 3, Express, Prisma, dan MySQL. Aplikasi ini membantu kasir/admin mencatat servis masuk, mengelola antrean servis, membuat invoice, mencatat stok sparepart, dan memantau mekanik dalam satu alur kerja desktop-first.

## Fitur Utama

- Dashboard ringkas untuk melihat servis aktif, pendapatan, dan status mekanik.
- Modul servis untuk input kendaraan, pelanggan, keluhan, dan penugasan mekanik.
- Modul transaksi untuk invoice dan pencatatan pembayaran.
- Modul stok untuk daftar sparepart dan stok masuk.
- Modul mekanik untuk melihat daftar mekanik dan job yang sedang dikerjakan.
- Master data motor di backend untuk merk, tipe, dan kapasitas mesin.

## Tech Stack

- Frontend: Vue 3 + Vite
- Backend: Express.js
- ORM: Prisma
- Database: MySQL

## Struktur Project

```text
bengkel/
  backend/
  frontend/
  docs/
```

## Prasyarat

- Node.js 18+.
- MySQL yang bisa diakses dari mesin lokal.
- Database dan kredensial sudah disiapkan di file `.env` backend.

## Konfigurasi Environment

Buat atau sesuaikan file `backend/.env` dengan isi seperti berikut:

```env
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/bengkel"
PORT=3333
```

Pastikan database `bengkel` sudah ada dan kredensial MySQL sesuai dengan environment Anda.

## Instalasi

### 1. Backend

```bash
cd backend
npm install
```

### 2. Frontend

```bash
cd frontend
npm install
```

## Menjalankan Aplikasi

### Backend

```bash
cd backend
npm start
```

Backend berjalan di `http://localhost:3333`.

### Frontend

```bash
cd frontend
npm run dev
```

Frontend Vite berjalan di `http://localhost:8080` dan mem-proxy request `/api` ke backend.

## Migrasi Database

Untuk menyinkronkan schema Prisma dan database MySQL:

```bash
cd backend
npx prisma migrate dev --name add_motor_master
```

Perintah ini juga akan menghasilkan Prisma Client baru dan menyiapkan tabel master motor.

## Seed Data Otomatis

Saat backend dijalankan, aplikasi akan otomatis melakukan seed jika tabel master masih kosong:

- Motor brand: Honda, Yamaha, Suzuki, Kawasaki
- Motor type: contoh Beat, Vario, NMAX, Aerox, dan lain-lain
- Engine capacity: 110cc, 125cc, 150cc, 155cc, 160cc, 250cc, 300cc
- Mekanik dasar: Asep, Budi, Cecep, Dedi

## Endpoint API Utama

### Master Data

- `GET /api/master/brands`
- `GET /api/master/types?brandId=...`
- `GET /api/master/capacities`

### Operasional

- `GET /api/mechanics`
- `GET /api/vehicles/search?nopol=...`
- `GET /api/services`
- `POST /api/services`
- `PATCH /api/services/:id/status`

## Catatan Alur Frontend

- `App.vue` hanya berperan sebagai layout wrapper.
- View dipisah ke folder `frontend/src/views/`.
- Modal dipisah ke folder `frontend/src/components/`.
- State dan logic data utama berada di `frontend/src/composables/useBengkelApp.js`.

## Verifikasi Cepat

1. Jalankan backend.
2. Buka `GET /api/master/brands` untuk memastikan data seed muncul.
3. Jalankan frontend dan buka modal servis baru.
4. Pilih merk motor, lalu pastikan tipe motor ter-filter sesuai merk.

## Scope MVP

Dokumen `docs/` menjadi acuan fitur dan batasan aplikasi. MVP ini fokus pada alur servis, transaksi, stok, dan mekanik, tanpa fitur di luar scope seperti pembayaran digital, aplikasi mobile, atau laporan keuntungan otomatis.
