# AI Agent Guidelines: BengkelKu

Dokumen ini berisi panduan, instruksi, peran (personas), dan aturan bagi AI Agent yang bekerja dalam repositori **BengkelKu**. Panduan ini dirancang untuk memastikan konsistensi arsitektur, kepatuhan terhadap ruang lingkup (scope) MVP V1, serta penerapan desain _Industrial Minimalism_ yang efisien.

---

## 1. Peran Agent (Agent Personas)

Setiap agen yang memodifikasi repositori ini harus menyelaraskan tindakannya dengan salah satu peran spesifik berikut:

### A. Frontend Developer Agent

- **Tujuan**: Membangun antarmuka pengguna (UI/UX) berbasis **Vue.js** yang cepat, desktop-first (min. 1366px), dan efisien untuk kasir dan pemilik.
- **Prinsip Utama**:
  - Mengikuti pedoman [UI Direction](file:///e:/Yasfa/2.%20PROGRAM/bengkel/docs/ui_direction.md).
  - Menggunakan aksi satu halaman (_single-page actions_) seperti modal atau form inline untuk meminimalkan perpindahan halaman.
  - Menyediakan _empty state_ yang jelas dan validasi _error_ yang spesifik di bawah tiap _field_ input.

### B. Backend Developer Agent

- **Tujuan**: Membangun API yang cepat dan handal dengan **Express.js** dan **Prisma ORM**.
- **Prinsip Utama**:
  - Menulis _endpoint_ RESTful yang terstruktur.
  - Memastikan keamanan data dan validasi input yang ketat pada sisi server sebelum menyimpannya ke database.
  - Mengelola transaksi database dengan aman, khususnya saat pengurangan stok sparepart otomatis setelah transaksi dibayar.

### C. Database Architect Agent

- **Tujuan**: Mengelola skema **MySQL** menggunakan Prisma.
- **Prinsip Utama**:
  - Mematuhi entitas data yang telah didefinisikan pada [Product Skeleton](file:///e:/Yasfa/2.%20PROGRAM/bengkel/docs/product_skeleton.md).
  - Memastikan relasi data (`Customer` -> `Vehicle` -> `Service` -> `Transaction`) terindeks dengan baik untuk mendukung pencarian cepat berdasarkan nomor polisi atau nama pelanggan.

---

## 2. Batasan Scope MVP V1 (Scope Guard)

Agent **DILARANG** menambahkan fitur-fitur di luar scope V1 berikut ini kecuali diinstruksikan secara eksplisit oleh pengguna:

- **Out of Scope**:
  - Fitur alert stok menipis (otomatis).
  - Rekap stok paling sering terjual.
  - Laporan keuntungan otomatis.
  - Aplikasi mobile atau portal pelanggan.
  - Integrasi pembayaran digital (e-wallet/QRIS).

---

## 3. Aturan Desain & Styling (CSS/UI)

- **Palet Warna (Slate & Moss)**:
  - **Primary (sidebar, tombol utama)**: `#3D4F5F` (slate blue gelap)
  - **Secondary (hover, border, teks sekunder)**: `#5F6C7D`
  - **Accent/CTA (tombol aksi penting)**: `#8B9D83` (moss green lembut)
  - **Success (status selesai, konfirmasi)**: `#A3B899` (moss muda)
  - **Background page**: `#F5F7FA` (netral sejuk)
  - **Surface (kartu, form)**: `#FFFFFF`
  - **Teks utama**: `#1A2634`
  - **Teks sekunder**: `#5D6D7E`
  - **Status badges**:
    - Menunggu: latar `#E8E2D2`, teks `#5C4B2A`
    - Dikerjakan: latar `#D6E2E9`, teks `#2A4050`
    - Selesai: latar `#DDE8DC`, teks `#2F4A2E`
  - **Alert/stok menipis**: latar `#F1DFE0`, teks `#7A2E34`
- **Tipografi**:
  - Font utama: "Nunito", fallback sans-serif.
  - Skala: judul halaman 24px bold, judul kartu 16px semi-bold, body 14px regular, label form 13px semi-bold, angka dashboard 28px bold.
- **Bentuk Komponen**:
  - Tombol: bentuk pil (border-radius 24px). Primary: solid `#3D4F5F`, Accent: solid `#8B9D83`, Secondary: outline `#5F6C7D`.
  - Input/select: border-radius 12px, fokus dengan shadow `rgba(61,79,95,0.15)`.
  - Kartu: border-radius 16px, shadow 0 4px 12px rgba(0,0,0,0.04), border kiri 3px solid `#8B9D83` untuk aksen.
- **Sidebar**:
  - Lebar ~260px, background linear-gradient(180deg, #3D4F5F, #5F6C7D), border-radius kanan 20px.
  - Item navigasi dengan ikon Phosphor Icons, padding 12px 20px, border-radius 12px.
  - Item aktif: latar putih transparan (rgba(255,255,255,0.18)).
- **Tabel**:
  - Baris data sebagai kartu kecil: background putih, border-radius 12px, shadow 0 1px 4px rgba(0,0,0,0.03), margin-bottom 4px.
  - Hover baris: latar `#F2F5F8`.
- **Empty & Error State**:
  - Empty state: ilustrasi vektor sederhana + teks panduan + tombol aksi (warna accent).
  - Error form: teks kecil di bawah field, warna `#B3737A`, border input berubah `#E5B5B8`.
  - System error: banner border-radius 12px, latar `#F1DFE0`, tombol "Coba Lagi" outline.

_Semua komponen harus mengikuti panduan di atas untuk menjaga konsistensi dan estetika minimalis elegan._

## 4. Alur Kerja Implementasi & Kode

1. **Prisma Schema**: Sebelum mengubah kode Express/Vue yang berhubungan dengan database, selalu periksa dan sinkronisasikan `schema.prisma`.
2. **REST API endpoints**:
   - POST `/api/services` (Membuat servis masuk baru)
   - PATCH `/api/services/:id` (Mengubah status servis/assign mekanik)
   - POST `/api/transactions` (Membuat invoice dan mencatat pembayaran)
   - GET `/api/vehicles/search?q=...` (Pencarian nopol cepat)
3. **Frontend Views**:
   - Dashboard
   - Modul Servis (Form masuk, planning, riwayat)
   - Modul Transaksi (List invoice & pembayaran)
   - Modul Stok (Stok masuk & list sparepart)
   - Modul Mekanik (List mekanik & assign tugas)

---

## 5. Kriteria Keberhasilan Uji Coba

- **Kecepatan Kasir**: Kasir harus dapat mendaftarkan servis, menugaskan mekanik, dan mencetak invoice dalam waktu kurang dari 2 menit.
- **Empty State**: Halaman dengan data kosong harus menampilkan petunjuk tindakan yang jelas (misal tombol "Buat Servis Baru").
- **Error Handling**: Koneksi database terputus atau server error harus ditangani dengan banner alert yang rapi dan opsi "Coba Lagi".
