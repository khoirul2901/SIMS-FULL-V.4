// Script untuk mengolah data Kelas dan Rombel

function getKelasList() {
  var ss = getDb();
  var sheet = ss.getSheetByName('Master_Kelas');
  if(!sheet) return [];
  
  var data = sheet.getDataRange().getValues();
  
  // Get data from Master_Siswa to calculate jumlah siswa
  var sheetSiswa = ss.getSheetByName('Master_Siswa');
  var dataSiswa = sheetSiswa ? sheetSiswa.getDataRange().getValues() : [];
  var siswaCountByKelas = {};
  
  if (dataSiswa.length > 1) {
    for (var j = 1; j < dataSiswa.length; j++) {
      var kls = dataSiswa[j][3]; // Kolom D (Kelas)
      if (kls) {
        if (!siswaCountByKelas[kls]) siswaCountByKelas[kls] = 0;
        siswaCountByKelas[kls]++;
      }
    }
  }

  var kelasList = [];
  
  // Asumsi Kolom: A(Kode Kelas), B(Nama Kelas), C(Wali Kelas)
  for (var i = 1; i < data.length; i++) {
    var namaKelas = data[i][1];
    kelasList.push({
      kode: data[i][0],
      nama: namaKelas,
      waliKelas: data[i][2],
      jumlahSiswa: siswaCountByKelas[namaKelas] || 0
    });
  }
  
  return kelasList;
}

function saveKelas(data) {
  var ss = getDb();
  var sheet = ss.getSheetByName('Master_Kelas');
  if(!sheet) {
    sheet = ss.insertSheet('Master_Kelas');
    sheet.appendRow(['Kode Kelas', 'Nama Kelas', 'Wali Kelas']);
  }
  
  var existingData = sheet.getDataRange().getValues();
  for (var i = 1; i < existingData.length; i++) {
    if (existingData[i][0] == data.kode) {
      sheet.getRange(i+1, 2, 1, 2).setValues([[data.nama, data.waliKelas]]);
      return { success: true, message: 'Data berhasil diupdate' };
    }
  }
  
  // Insert Baru
  sheet.appendRow([data.kode, data.nama, data.waliKelas]);
  return { success: true, message: 'Data kelas berhasil ditambahkan' };
}

function deleteKelas(kode) {
  var ss = getDb();
  var sheet = ss.getSheetByName('Master_Kelas');
  if(!sheet) return { success: false, message: 'Data kelas tidak ditemukan' };
  
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] == kode) {
      sheet.deleteRow(i + 1);
      return { success: true, message: 'Data kelas berhasil dihapus' };
    }
  }
  
  return { success: false, message: 'Data kelas tidak ditemukan' };
}
