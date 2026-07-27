# SIMS SMP AL-HIKAM - Google Apps Script (GAS)

Direktori ini berisi kode untuk deploy aplikasi Sistem Informasi Manajemen Sekolah (SIMS) ke Google Apps Script.

## Struktur File
- `Database.gs`: Fungsi untuk koneksi otomatis ke spreadsheet (`getDb`) dan fitur Inisialisasi Database (`setupDatabase`) yang membuat sheet dan kolom secara otomatis.
- `Auth.gs`: Fungsi backend untuk autentikasi user (berinteraksi dengan spreadsheet `Users`).
- `Dashboard.gs`: Fungsi backend untuk mengambil statistik dashboard (total siswa, guru, dll).
- `Siswa.gs`: Fungsi backend untuk membaca/menyimpan data siswa ke sheet `Master_Siswa`.
- `Guru.gs`: Fungsi backend untuk membaca/menyimpan data guru ke sheet `Master_Guru`.
- `Kelas.gs`: Fungsi backend untuk mengelola data kelas ke sheet `Master_Kelas`.
- `Mapel.gs`: Fungsi backend untuk mengelola data mapel ke sheet `Master_Mapel`.
- `Absensi.gs`: Fungsi backend untuk mengelola data absensi ke sheet `Absensi_Siswa` dan `Absensi_Guru`.
- `Pelanggaran.gs`: Fungsi backend untuk mengelola data ke sheet `Pelanggaran`.
- `Keuangan.gs`: Fungsi backend untuk mengelola data ke sheet `Keuangan`.
- `Administrasi.gs`: Fungsi backend untuk mengelola data ke sheet `Surat_Keluar` dan `Arsip_Digital`.
- `Login.html`: View UI untuk halaman Login.
- `Index.html`: View UI kerangka utama (Sidebar, Topbar, Content Area) yang memuat komponen secara dinamis.
- `Comp_*.html`: View UI komponen-komponen halaman.

## Cara Deploy ke Google Apps Script
1. Buat Spreadsheet baru di Google Drive.
2. Buka Spreadsheet yang baru dibuat.
3. Klik **Ekstensi > Apps Script**.
4. Buat file `.gs` dan `.html` di editor Apps Script sesuai dengan nama dan isi file di folder `gas/` ini.
   * *Catatan: Jangan tambahkan ekstensi file secara manual saat membuat file di editor GAS.*
5. Muat ulang / refresh tab Spreadsheet Anda. Akan muncul menu baru **SIMS Setup** di sebelah kanan menu "Bantuan".
6. Klik **SIMS Setup > Inisialisasi Database (Buat Semua Sheet)**. (Otorisasi script saat diminta, lalu jalankan lagi).
7. Semua Sheet dan format kolom akan otomatis dibuatkan. Akun admin default: `admin` (password: `admin123`).
8. Kembali ke tab Apps Script, klik **Terapkan > Deployment baru**.
9. Pilih jenis deployment: **Aplikasi Web**.
10. Isi Deskripsi, Eksekusi sebagai: **Saya**, Yang memiliki akses: **Siapa saja** (atau sesuai kebutuhan).
11. Klik **Terapkan**.
12. Salin URL Aplikasi Web yang diberikan.

## Menggunakan sebagai Backend API (Untuk Frontend di GitHub Pages)

Jika Anda ingin menjalankan Frontend (React) secara terpisah di GitHub Pages atau hosting statis lainnya:

1. Setelah Anda mendapatkan URL Aplikasi Web dari langkah ke-12 di atas.
2. Buka project React Anda.
3. Di root project, buat atau buka file `.env` (berdasarkan `.env.example`).
4. Tambahkan/ubah variabel `VITE_GAS_URL`:
   ```
   VITE_GAS_URL="https://script.google.com/macros/s/SCRIPT_ID_ANDA/exec"
   ```
5. Build dan deploy aplikasi React ke GitHub Pages.
6. Aplikasi React akan otomatis berkomunikasi dengan Google Apps Script melalui `doPost` sebagai REST API.
