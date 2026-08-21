# Product Skeleton: BengkelKu (MVP)

## Halaman Utama & Navigasi
- **Dashboard** – Ringkasan transaksi hari ini, servis aktif, stok menipis (jika ada data nanti).
- **Servis** – Manajemen servis masuk, planning, dan riwayat.
- **Transaksi** – Invoice dan pencatatan pembayaran.
- **Stok** – Manajemen sparepart dan stok.
- **Mekanik** – Data mekanik dan penugasan.
- **Laporan** (read-only, minimal) – Nanti setelah transaksi berjalan.
- Navigasi: sidebar kiri (desktop), topbar dengan judul halaman & info user.

## Modul & Deskripsi Singkat
1. **Modul Servis**
   - Form servis masuk: pilih/tambah pelanggan, pilih/tambah kendaraan, keluhan, assign mekanik.
   - Planning servis: daftar reservasi yang akan datang, bisa ubah status.
   - Riwayat servis per kendaraan: cari berdasarkan nopol atau nama pelanggan.
2. **Modul Transaksi**
   - Buat invoice dari servis yang sudah selesai.
   - Tambahkan sparepart/jasa, hitung total otomatis, catat pembayaran.
3. **Modul Stok**
   - List sparepart dengan stok terkini.
   - Form stok masuk: nama barang, jumlah, harga beli/jual, supplier, tanggal.
   - Riwayat stok masuk.
4. **Modul Mekanik**
   - List mekanik beserta data diri dan status kerja.
   - Assignment: lihat servis yang dikerjakan per mekanik.
5. **Modul Laporan** (minimal V1)
   - Ringkasan transaksi harian: total servis, total pendapatan, sparepart terjual.

## User Flow Utama
1. **Servis Masuk & Pembayaran**
   - Kasir buka "Servis" → klik "Servis Baru" → pilih pelanggan (atau tambah baru) → pilih kendaraan (atau tambah baru) → isi keluhan → pilih mekanik → simpan.
   - Setelah servis selesai, mekanik/kasir update status selesai.
   - Kasir buka "Transaksi" → buat invoice dari servis tersebut → tambahkan sparepart (opsional) → simpan invoice & catat pembayaran.
   - Stok sparepart otomatis berkurang jika ada penjualan.
2. **Stok Masuk**
   - Kasir/admin buka "Stok" → "Stok Masuk" → isi form → simpan → stok bertambah.
3. **Cek Riwayat Servis**
   - Kasir buka "Servis" → "Riwayat" → cari berdasarkan nopol → tampilkan daftar servis beserta mekanik yang mengerjakan.

## Data Entity Utama
- **Customer** (id, nama, telepon)
- **Vehicle** (id, customer_id, nopol, merk, tipe, kapasitas_mesin, jenis)
- **Mechanic** (id, nama, tgl_lahir, waktu_kerja)
- **Service** (id, vehicle_id, mechanic_id, keluhan, status, tgl_masuk, tgl_selesai)
- **Service_Item** (id, service_id, item_type[sparepart/jasa], sparepart_id, quantity, harga_saat_ini)
- **Sparepart** (id, nama, stok, harga_beli, harga_jual, supplier)
- **Stock_In** (id, sparepart_id, jumlah, tgl_masuk, supplier)
- **Transaction** (id, service_id, total, tgl_bayar, metode_bayar) – sebagai bukti pembayaran, berkait dengan service.

## Role Access & Authentication (RBAC)
- **ADMIN (SA / Frontdesk / Admin Gudang / Kasir)**:
  - CRUD Servis, PKB, Part Requisition, Transaksi Kasir, Stok Masuk/Keluar, view Mekanik, assign mekanik.
- **MEKANIK**:
  - Filter tugas pengerjaan motor khusus untuk mekanik yang sedang login (*data scoping*).
  - Permintaan suku cadang gudang untuk servis miliknya.
  - Cek stok gudang (*read-only*).
- **KEPALA BENGKEL**:
  - Executive Dashboard & Rekap Bisnis (Omzet harian/bulanan, performa kerja teknisi mekanik).
  - CRUD Akun Pengguna / User Management (Admin, Mekanik, Kepala Bengkel).
  - CRUD Data Mekanik & Aturan Komisi.
  - Read-only data transaksi dan katalog master.

## Komponen UI yang Dibutuhkan
- **Layout**: Sidebar navigasi, header (user info, logout).
- **Table** (reusable): untuk daftar servis, pelanggan, mekanik, stok, transaksi.
- **Form Builder**: untuk input servis, pelanggan, kendaraan, stok masuk.
- **Search & Autocomplete**: untuk mencari pelanggan/kendaraan/nopol.
- **Modal/Dialog**: untuk quick add (tambah pelanggan/kendaraan tanpa pindah halaman).
- **Status Badge**: indikator status servis (menunggu, dikerjakan, selesai).
- **Dashboard Cards**: ringkasan angka (servis hari ini, pendapatan, stok menipis).
- **Date Picker**: untuk planning servis/tanggal servis.
- **Dropdown Select**: untuk memilih mekanik, jenis kendaraan, dsb.