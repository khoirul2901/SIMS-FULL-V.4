function getDashboardStats() {
  var ss = getDb();
  
  // Contoh mengambil data dari berbagai sheet
  var siswaSheet = ss.getSheetByName('Master_Siswa');
  var guruSheet = ss.getSheetByName('Master_Guru');
  var kelasSheet = ss.getSheetByName('Master_Kelas');
  
  var totalSiswa = siswaSheet ? siswaSheet.getLastRow() - 1 : 0;
  var totalGuru = guruSheet ? guruSheet.getLastRow() - 1 : 0;
  var totalKelas = kelasSheet ? kelasSheet.getLastRow() - 1 : 0;
  
  return {
    totalSiswa: totalSiswa > 0 ? totalSiswa : 0,
    totalGuru: totalGuru > 0 ? totalGuru : 0,
    totalKelas: totalKelas > 0 ? totalKelas : 0,
    totalTendik: 5, // Data dummy, bisa disesuaikan
    hadirHariIni: totalSiswa > 50 ? totalSiswa - 5 : totalSiswa
  };
}
