// Script untuk mengolah data siswa

function getSiswaList() {
  var ss = getDb();
  var sheet = ss.getSheetByName('Master_Siswa');
  if(!sheet) return [];
  
  var data = sheet.getDataRange().getValues();
  var siswaList = [];
  
  // Asumsi Kolom: A(NIS), B(NISN), C(Nama), D(Kelas), E(L/P), F(Status)
  for (var i = 1; i < data.length; i++) {
    siswaList.push({
      nis: data[i][0] || '',
      nisn: data[i][1] || '',
      nama: data[i][2] || '',
      kelas: data[i][3] || '',
      jk: data[i][4] || '',
      status: data[i][5] || '',
      tempatLahir: data[i][6] || '',
      tanggalLahir: data[i][7] ? (data[i][7] instanceof Date ? data[i][7].toISOString().split('T')[0] : data[i][7]) : '',
      alamat: data[i][8] || '',
      namaAyah: data[i][9] || '',
      namaIbu: data[i][10] || '',
      noHp: data[i][11] || '',
      username: data[i][12] || '',
      password: data[i][13] || ''
    });
  }
  
  return siswaList;
}

function saveSiswa(data) {
  var ss = getDb();
  var sheet = ss.getSheetByName('Master_Siswa');
  if(!sheet) {
    sheet = ss.insertSheet('Master_Siswa');
    sheet.appendRow(['NIS', 'NISN', 'Nama Siswa', 'Kelas', 'L/P', 'Status', 'Tempat Lahir', 'Tanggal Lahir', 'Alamat', 'Nama Ayah', 'Nama Ibu', 'No HP Ortu', 'Username', 'Password']);
  }
  
  // Logic Cek Update / Insert (Sederhana via NIS)
  var existingData = sheet.getDataRange().getValues();
  for (var i = 1; i < existingData.length; i++) {
    if (existingData[i][0] == data.nis) {
      sheet.getRange(i+1, 2, 1, 13).setValues([[data.nisn, data.nama, data.kelas, data.jk, data.status, data.tempatLahir || '', data.tanggalLahir || '', data.alamat || '', data.namaAyah || '', data.namaIbu || '', data.noHp || '', data.username || '', data.password || '']]);
      return { success: true, message: 'Data berhasil diupdate' };
    }
  }
  
  // Insert Baru
  sheet.appendRow([data.nis, data.nisn, data.nama, data.kelas, data.jk, data.status, data.tempatLahir || '', data.tanggalLahir || '', data.alamat || '', data.namaAyah || '', data.namaIbu || '', data.noHp || '', data.username || '', data.password || '']);
  return { success: true, message: 'Data berhasil ditambahkan' };
}

function getExportUrl(sheetName) {
  var ss = getDb();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return '';
  
  var ssId = ss.getId();
  var sheetId = sheet.getSheetId();
  
  return 'https://docs.google.com/spreadsheets/d/' + ssId + '/export?format=csv&gid=' + sheetId;
}

function importSiswaCsv(base64Data, filename) {
  try {
    var decoded = Utilities.base64Decode(base64Data);
    var csvString = Utilities.newBlob(decoded).getDataAsString();
    
    var data = Utilities.parseCsv(csvString);
    if (!data || data.length < 2) {
      return { success: false, message: 'File CSV kosong atau tidak valid.' };
    }
    
    var ss = getDb();
    var sheet = ss.getSheetByName('Master_Siswa');
    if (!sheet) {
      sheet = ss.insertSheet('Master_Siswa');
      sheet.appendRow(['NIS', 'NISN', 'Nama Siswa', 'Kelas', 'L/P', 'Status', 'Tempat Lahir', 'Tanggal Lahir', 'Alamat', 'Nama Ayah', 'Nama Ibu', 'No HP Ortu', 'Username', 'Password']);
    }
    
    // Asumsi baris 1 adalah header, mulai dari index 1
    var numRows = data.length - 1;
    var currentData = sheet.getDataRange().getValues();
    var currentNisMap = {};
    for (var i = 1; i < currentData.length; i++) {
      currentNisMap[currentData[i][0]] = i + 1; // row index
    }
    
    var newRows = [];
    var updated = 0;
    
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      if (row.length < 6) continue;
      
      var nis = row[0];
      if (!nis) continue;
      
      if (currentNisMap[nis]) {
        // Update
        var rowIndex = currentNisMap[nis];
        sheet.getRange(rowIndex, 2, 1, 5).setValues([[row[1], row[2], row[3], row[4], row[5]]]);
        updated++;
      } else {
        // Insert
        newRows.push([row[0], row[1], row[2], row[3], row[4], row[5]]);
      }
    }
    
    if (newRows.length > 0) {
      sheet.getRange(sheet.getLastRow() + 1, 1, newRows.length, 6).setValues(newRows);
    }
    
    return { success: true, message: 'Berhasil import ' + newRows.length + ' data baru dan update ' + updated + ' data lama.' };
  } catch (e) {
    return { success: false, message: 'Error import: ' + e.message };
  }
}

function deleteSiswa(nis) {
  var ss = getDb();
  var sheet = ss.getSheetByName('Master_Siswa');
  if(!sheet) return { success: false, message: 'Sheet tidak ditemukan' };
  
  var existingData = sheet.getDataRange().getValues();
  for (var i = 1; i < existingData.length; i++) {
    if (existingData[i][0] == nis) {
      sheet.deleteRow(i + 1);
      return { success: true, message: 'Data berhasil dihapus' };
    }
  }
  return { success: false, message: 'Data tidak ditemukan' };
}
