// File ini menangani koneksi database dan inisialisasi sheet otomatis

function getDb() {
  // Secara otomatis mengambil dari spreadsheet tempat script ini berada (bound script)
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  if (!ss) {
    // Fallback jika dijalankan sebagai standalone web app tanpa bind ke spreadsheet
    // (Bisa diisi ID manual jika dibutuhkan)
    ss = SpreadsheetApp.openById('YOUR_SPREADSHEET_ID_HERE'); 
  }
  return ss;
}

// Menambahkan menu khusus di Spreadsheet saat dibuka
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('SIMS Setup')
    .addItem('Inisialisasi Database (Buat Semua Sheet)', 'setupDatabase')
    .addItem('Isi Data Contoh (Seed Data)', 'seedDatabase')
    .addToUi();
}

// Fungsi untuk membuat semua sheet dan kolom secara otomatis
function setupDatabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error('Jalankan fungsi ini langsung dari editor Apps Script yang terikat dengan Spreadsheet.');
  }
  
  var sheetsDef = [
    { name: 'Users', columns: ['ID', 'Username', 'Password', 'Role', 'Nama Lengkap'] },
    { name: 'Master_Siswa', columns: ['NIS', 'NISN', 'Nama Siswa', 'Kelas', 'L/P', 'Status', 'Tempat Lahir', 'Tanggal Lahir', 'Alamat', 'Nama Ayah', 'Nama Ibu', 'No HP Ortu', 'Username', 'Password'] },
    { name: 'Master_Guru', columns: ['NIP', 'Nama Lengkap', 'Jenis Kelamin', 'Mata Pelajaran', 'Status', 'Tempat Lahir', 'Tanggal Lahir', 'Alamat', 'Status Pegawai', 'Jabatan', 'Pendidikan', 'Jurusan', 'Tahun Lulus', 'No HP', 'Username', 'Password'] },
    { name: 'Master_Kelas', columns: ['Kode Kelas', 'Nama Kelas', 'Wali Kelas', 'Jumlah Siswa'] },
    { name: 'Master_Mapel', columns: ['Kode Mapel', 'Nama Mapel', 'Kelompok'] },
    { name: 'Absensi_Siswa', columns: ['Tanggal', 'NIS', 'Nama Siswa', 'Kelas', 'Jenis', 'Waktu', 'Status'] },
    { name: 'Absensi_Guru', columns: ['Tanggal', 'NIP', 'Nama Guru', 'Mata Pelajaran', 'Jenis', 'Waktu', 'Status'] },
    { name: 'Pelanggaran', columns: ['Tanggal', 'NIS', 'Nama Siswa', 'Kelas', 'Kategori', 'Pelanggaran', 'Poin', 'Pelapor'] },
    { name: 'Kategori_Pelanggaran', columns: ['ID', 'Kategori', 'Jenis', 'Poin'] },
    { name: 'Keuangan', columns: ['Tanggal', 'No Transaksi', 'Nama Siswa', 'Kelas', 'Jenis Pembayaran', 'Jumlah', 'Status'] },
    { name: 'Surat_Keluar', columns: ['No Surat', 'Jenis Surat', 'Tujuan', 'Tanggal', 'Status'] },
    { name: 'Arsip_Digital', columns: ['Nama Dokumen', 'Kategori', 'Ukuran', 'Tanggal Upload', 'URL File'] }
  ];
  
  
  sheetsDef.forEach(function(def) {
    var sheet = ss.getSheetByName(def.name);
    if (!sheet) {
      sheet = ss.insertSheet(def.name);
    }
    
    // Selalu update baris pertama (header) sesuai definisi terbaru
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(def.columns);
    } else {
      // Jika sudah ada isinya, timpa baris 1
      sheet.getRange(1, 1, 1, def.columns.length).setValues([def.columns]);
    }
    
    // Format header menjadi tebal dan berwarna hijau
    sheet.getRange(1, 1, 1, def.columns.length)
         .setFontWeight('bold')
         .setBackground('#10b981')
         .setFontColor('white');
    // Freeze baris pertama agar header selalu terlihat
    sheet.setFrozenRows(1);
  });

  
  // Membuat akun admin default jika sheet Users baru dibuat / kosong
  var usersSheet = ss.getSheetByName('Users');
  if (usersSheet && usersSheet.getLastRow() <= 1) {
    usersSheet.appendRow(['1', 'admin', 'admin123', 'Admin', 'Administrator Utama']);
  }
  
  // Jika ada Sheet1 default yang kosong, hapus saja agar bersih
  var sheet1 = ss.getSheetByName('Sheet1');
  if (sheet1 && ss.getSheets().length > 1) {
    ss.deleteSheet(sheet1);
  }
  
  ss.toast('Inisialisasi berhasil! Semua sheet dan kolom sudah disiapkan.', 'Sukses', 5);
}

// Fungsi untuk mengisi database dengan data contoh (seeding)
function seedDatabase() {
  var ss = getDb();
  if (!ss) return;
  
  // Pastikan sheet sudah terbuat terlebih dahulu
  setupDatabase();
  
  // 1. Seed Master_Kelas
  var sheetKelas = ss.getSheetByName('Master_Kelas');
  if (sheetKelas && sheetKelas.getLastRow() <= 1) {
    var initialKelas = [
      ['VII-A', 'VII-A', 'Budi Santoso, S.Pd', 32],
      ['VII-B', 'VII-B', 'Siti Aminah, M.Pd', 30],
      ['VIII-A', 'VIII-A', 'Ahmad Dahlan, S.Ag', 34],
      ['VIII-B', 'VIII-B', 'Rina Rahmawati, S.Psi', 33],
      ['IX-A', 'IX-A', 'Agus Pratama, S.Kom', 35]
    ];
    sheetKelas.getRange(2, 1, initialKelas.length, 4).setValues(initialKelas);
  }
  
  // 2. Seed Master_Siswa
  var sheetSiswa = ss.getSheetByName('Master_Siswa');
  if (sheetSiswa && sheetSiswa.getLastRow() <= 1) {
    var initialSiswa = [
      ['2023001', '0051234567', 'Ahmad Maulana', 'VII-A', 'L', 'Aktif', 'Jakarta', '2009-05-12', 'Jl. Merdeka No. 1', 'Budi', 'Siti', '08123456789', 'ahmadmaulana', 'password123'],
      ['2023002', '0051234568', 'Siti Nurhaliza', 'VII-A', 'P', 'Aktif', 'Bandung', '2009-08-20', 'Jl. Sudirman No. 2', 'Andi', 'Rina', '08987654321', 'sitinurhaliza', 'password123'],
      ['2023003', '0051234569', 'Budi Santoso', 'VII-B', 'L', 'Aktif', 'Surabaya', '2009-03-10', 'Jl. Pahlawan No. 3', 'Cipto', 'Dewi', '08561234987', 'budisantoso', 'password123'],
      ['2023004', '0051234570', 'Citra Kirana', 'VII-B', 'P', 'Aktif', 'Malang', '2009-06-15', 'Jl. Diponegoro No. 4', 'Dharma', 'Yanti', '08123456000', 'citrakirana', 'password123'],
      ['2023005', '0051234571', 'Deni Sumargo', 'VIII-A', 'L', 'Aktif', 'Makassar', '2008-11-25', 'Jl. Veteran No. 5', 'Edi', 'Lina', '08123456111', 'denisumargo', 'password123'],
      ['2022001', '0041234567', 'Bima Sakti', 'VIII-B', 'L', 'Aktif', 'Surabaya', '2008-01-15', 'Jl. Pahlawan No. 3', 'Cipto', 'Dewi', '08561234987', 'bimasakti', 'password123']
    ];
    sheetSiswa.getRange(2, 1, initialSiswa.length, 14).setValues(initialSiswa);
  }
  
  // 3. Seed Master_Guru
  var sheetGuru = ss.getSheetByName('Master_Guru');
  if (sheetGuru && sheetGuru.getLastRow() <= 1) {
    var initialGuru = [
      ['198001012005011001', 'Budi Santoso, S.Pd', 'L', 'Matematika', 'Aktif', 'Jakarta', '1980-01-01', 'Jl. Pendidikan No 1', 'GTY', 'Guru Kelas', 'S1', 'Pendidikan Matematika', '2004', '08123456789', 'budisantoso', 'password123'],
      ['198205122008012003', 'Siti Aminah, M.Pd', 'P', 'Bahasa Indonesia', 'Aktif', 'Bandung', '1982-05-12', 'Jl. Merdeka No 2', 'GTY', 'Guru Kelas', 'S2', 'Pendidikan Bahasa Indonesia', '2007', '08987654321', 'sitiaminah', 'password123'],
      ['199003032015011003', 'Ahmad Dahlan, S.Ag', 'L', 'Pendidikan Agama Islam', 'Aktif', 'Yogyakarta', '1990-03-03', 'Jl. KH Ahmad Dahlan No. 3', 'GTY', 'Guru Kelas', 'S1', 'Pendidikan Agama Islam', '2012', '08123456780', 'ahmaddahlan', 'password123']
    ];
    sheetGuru.getRange(2, 1, initialGuru.length, 16).setValues(initialGuru);
  }
  
  // 4. Seed Kategori_Pelanggaran
  var sheetKategori = ss.getSheetByName('Kategori_Pelanggaran');
  if (sheetKategori && sheetKategori.getLastRow() <= 1) {
    var initialKategori = [
      ['1', 'Keterlambatan', 'Terlambat Masuk', 10],
      ['2', 'Kerapian', 'Rambut Panjang', 5],
      ['3', 'Perilaku', 'Berkelahi', 50]
    ];
    sheetKategori.getRange(2, 1, initialKategori.length, 4).setValues(initialKategori);
  }
  
  ss.toast('Pengisian data contoh berhasil!', 'Sukses', 5);
}
