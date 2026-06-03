# Project Brief: Sistem Manajemen Bengkel Motor

## Project Name
BengkelKu (nama sementara)

## Goal
Digitalisasi operasional bengkel motor dalam 3–6 bulan pertama, mencakup transaksi servis, riwayat kendaraan, pencatatan stok, dan penugasan mekanik—agar kasir/admin dan pemilik tidak lagi bergantung pada pencatatan manual.

## Users
- **V1:** Kasir/Admin (utama) & Pemilik Bengkel (monitoring)
- **Mendatang:** Pelanggan (reservasi mandiri, cek status servis)

## Main Problems
1. Reservasi dan riwayat servis dicatat manual di buku, sulit dilacak.
2. Transaksi dan stok masuk terpisah, perhitungan keuntungan masih manual.
3. Penugasan mekanik ke motor pelanggan tidak tercatat, sehingga produktivitas, KPI, dan rasio komplain tidak bisa di-track.

## V1 Scope
- **Catat servis masuk** – input data pelanggan dan kendaraan saat servis masuk.
- **Planning servis** – mengelola reservasi yang sudah dibuat.
- **Invoice & pencatatan transaksi** – generate invoice dan catat pembayaran (jasa + sparepart).
- **Stok & penjualan sparepart** – catat stok masuk, penjualan sparepart dan jasa yang diambil pelanggan.
- **Assign mekanik** – menugaskan mekanik ke motor pelanggan.
- **Riwayat servis pelanggan** – menampilkan riwayat servis per kendaraan, termasuk mekanik yang mengerjakan.

## Out of Scope
- Alert stok menipis
- Rekap stok paling sering terjual
- Laporan keuntungan otomatis
- Aplikasi mobile (mobile web/app)
- Portal pelanggan
- Manajemen KPI mekanik (rasio komplain, produktivitas detail)
- Integrasi pembayaran digital

## Main Data
- **Pelanggan:** nama, nomor telepon
- **Kendaraan:** nomor polisi, tipe motor, merk, kapasitas mesin, jenis (matic/bebek/sport)
- **Mekanik:** nama, waktu kerja, tanggal lahir
- **Sparepart:** nama, stok, harga beli, harga jual, tanggal masuk, supplier

## UI Direction
- Web application (desktop-focused untuk kasir/admin dan pemilik)
- Antar muka cepat untuk input transaksi dan pencarian
- Dashboard ringkas untuk pemilik melihat ringkasan harian
- Mobile app ditunda hingga beberapa iterasi ke depan

## Tech Stack
- **Frontend:** Vue.js
- **Backend:** Express.js (Node.js)
- **ORM:** Prisma
- **Database:** MySQL
- **Hosting:** Self-hosted (on-premise atau VPS internal) sebelum dirilis ke publik/pelanggan

## Success Criteria
- Kasir dapat mencatat servis, membuat invoice, dan menyelesaikan transaksi dalam waktu < 2 menit.
- Pemilik dapat melihat seluruh transaksi dan stok terkini tanpa perlu bertanya ke kasir.
- 6 fitur V1 berfungsi stabil dan digunakan di 1 bengkel tanpa error kritis selama 1 minggu berturut-turut.

## Open Questions
- Apakah akan ada multi-cabang bengkel dalam waktu dekat? (berdampak pada desain database)
- Kapan target V1 mulai dipakai di bengkel pertama?
- Apakah perlu login dengan role berbeda (kasir vs pemilik) di V1, atau satu akses dulu?