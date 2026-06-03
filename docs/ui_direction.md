# UI Direction: BengkelKu (MVP)

## Design Style
- **Minimalis Elegan** – Ruang putih luas, tipografi bersih, palet sejuk alami. Terasa tenang, bersih, dan presisi—seperti bengkel modern yang rapi.
- **Functional Zen** – Estetika tinggi tanpa mengorbankan kecepatan baca dan input data. Setiap elemen punya tujuan jelas.
- **Desktop-first** – Dioptimalkan untuk layar ≥1366px, layout lapang yang nyaman digunakan seharian oleh kasir/admin.

## Layout Priority
- **Sidebar elegan di kiri** – Lebar ~260px, sisi kanan melengkung (border-radius 0 20px 20px 0). Background gradasi vertikal dari `#3D4F5F` ke `#5F6C7D`. Teks putih, item aktif dengan latar putih transparan (rgba(255,255,255,0.18)) dan border-radius 12px.
- **Topbar transparan** – Tidak ada topbar solid; breadcrumb dan info user berada di area konten utama, menjaga fokus pada data.
- **Content area** – Latar `#F5F7FA`, padding 32px, konten terpusat maksimal 1200px.

## Color Direction
- **Primary**: `#3D4F5F` (slate blue gelap) – sidebar, tombol utama, teks judul.
- **Secondary**: `#5F6C7D` (slate medium) – hover, border, teks sekunder.
- **Accent/CTA**: `#8B9D83` (moss green lembut) – tombol aksi penting, link, highlight aktif. Memberi sentuhan segar tanpa mencolok.
- **Success**: `#A3B899` (moss muda) – status selesai, konfirmasi.
- **Background page**: `#F5F7FA` – netral sejuk.
- **Surface (cards)**: `#FFFFFF` – bersih, kontras lembut dengan latar.
- **Text primary**: `#1A2634` – kontras tinggi, nyaman dibaca.
- **Text secondary**: `#5D6D7E` – untuk label, keterangan.
- **Status tambahan**:
  - Menunggu: latar `#E8E2D2` (beige hangat), teks `#5C4B2A`
  - Dikerjakan: latar `#D6E2E9` (slate muda), teks `#2A4050`
  - Selesai: latar `#DDE8DC` (moss pastel), teks `#2F4A2E`
- **Alert/Stok menipis**: latar `#F1DFE0` (rose mud), teks `#7A2E34`

## Typography
- **Font utama**: "Nunito", fallback ke sans-serif. Memberi kesan santai namun tetap profesional dan mudah dibaca.
- **Skala**:
  - Judul halaman: 24px, bold, `#1A2634`
  - Judul kartu: 16px, semi-bold
  - Body: 14px, regular
  - Label form: 13px, semi-bold, `#5D6D7E`
  - Data angka (dashboard): 28px, bold, `#3D4F5F`

## Component Style
- **Sidebar**:
  - Background linear-gradient(180deg, #3D4F5F, #5F6C7D), border-radius kanan 20px.
  - Item navigasi: ikon + teks, padding 12px 20px, border-radius 12px, transisi 0.2s.
  - Item aktif: latar rgba(255,255,255,0.18), teks tebal.
  - Logo "BengkelKu" dengan ikon kunci pas minimalis di atas, font Nunito bold putih.
- **Buttons**:
  - Bentuk pil (border-radius 24px).
  - Primary: `#3D4F5F` solid, teks putih, hover lebih terang (`#4D6173`).
  - Accent (CTA utama): `#8B9D83` solid, teks putih, hover `#7A8E73`.
  - Secondary: outline `#5F6C7D`, teks `#5F6C7D`.
  - Danger: outline `#B3737A`.
- **Cards**:
  - Border-radius 16px, shadow 0 4px 12px rgba(0,0,0,0.04).
  - Border kiri 3px solid `#8B9D83` sebagai aksen, terutama di dashboard.
  - Hover: scale 1.01, shadow meningkat sedikit.
- **Icons** – "Phosphor Icons", set bulat ringan yang cocok dengan font Nunito.

## Form Style
- **Input field** – Border-radius 12px, border 1px solid `#D1D5DB`, padding 10px 16px, tinggi 44px. Fokus: border `#3D4F5F`, shadow 0 0 0 3px rgba(61,79,95,0.15).
- **Label** – Di atas input, 13px `#5D6D7E`, jarak 4px.
- **Select & Autocomplete** – Dropdown border-radius 12px, shadow, opsi hover `#EDF1F5`.
- **Form layout** – Grup field dalam card putih, padding 24px, border-radius 16px.

## Table / Card Style
- **Tabel**:
  - Header transparan, teks `#5D6D7E` uppercase 11px.
  - Baris data: latar `#FFFFFF`, border-radius 12px, shadow 0 1px 4px rgba(0,0,0,0.03), padding 12px 16px, margin-bottom 4px.
  - Hover baris: latar `#F2F5F8`.
  - Status badge: pil kecil dengan warna latar status dan teks gelap sesuai palet.
- **Card grid** – Alternatif untuk daftar servis/stok, dengan radius dan shadow yang sama.

## Empty State
- Ilustrasi vektor flat sederhana (motor minimalis, warna slate & moss), teks "Belum ada data servis hari ini", tombol aksi pil "Catat Servis Baru" dengan warna accent moss.
- Posisi di tengah halaman, tidak ada tabel kosong.

## Error State
- **Form error**: teks kecil merah `#B3737A` di bawah field, input border berubah `#E5B5B8`.
- **System error**: Banner border-radius 12px, latar `#F1DFE0`, ikon peringatan, teks `#7A2E34`, tombol "Coba Lagi" outline.
- **404/Data tidak ditemukan**: Ilustrasi kecil, teks "Data tidak ditemukan", saran periksa kembali.

## Mobile Notes
- MVP desktop-only. Struktur modular memudahkan adaptasi nanti: sidebar bisa jadi bottom nav, card tetap radius besar, tabel bisa horizontal scroll.