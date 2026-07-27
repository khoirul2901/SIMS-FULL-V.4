function loginUser(username, password) {
  try {
    var ss = getDb();
    var sheet = ss.getSheetByName('Users');
    var data = sheet.getDataRange().getValues();
    
    // Header = baris pertama
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      if (row[1] == username && row[2] == password) { // Asumsi Username kolom B, Password kolom C
        return {
          success: true,
          user: {
            id: row[0],
            username: row[1],
            role: row[3], // Asumsi Role kolom D
            name: row[4]  // Asumsi Nama kolom E
          }
        };
      }
    }
    
    return { success: false, message: 'Username atau password salah!' };
  } catch (e) {
    return { success: false, message: 'Gagal terhubung ke database: ' + e.toString() };
  }
}
