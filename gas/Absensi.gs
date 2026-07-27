// Script Absensi
function getSiswaAndAbsensi(kelas, tanggal, jenis) {
  var ss = getDb();
  var sheetSiswa = ss.getSheetByName('Master_Siswa');
  if(!sheetSiswa) return { siswa: [], absensi: [] };
  
  var dataSiswa = sheetSiswa.getDataRange().getValues();
  var resultSiswa = [];
  
  // Ambil semua siswa di kelas ini
  for(var i=1; i<dataSiswa.length; i++) {
    if(dataSiswa[i][3] == kelas) { // Kolom D: Kelas
      resultSiswa.push({
        nis: dataSiswa[i][0],
        nama: dataSiswa[i][2],
        jk: dataSiswa[i][4]
      });
    }
  }
  
  var sheetAbsen = ss.getSheetByName('Absensi_Siswa');
  var resultAbsensi = [];
  if(sheetAbsen) {
    var dataAbsen = sheetAbsen.getDataRange().getValues();
    // Cari absensi di tanggal dan jenis yang sama
    for(var j=1; j<dataAbsen.length; j++) {
      var tglRow = dataAbsen[j][0];
      var tglString = (tglRow instanceof Date) ? Utilities.formatDate(tglRow, Session.getScriptTimeZone(), 'yyyy-MM-dd') : (tglRow ? tglRow.toString() : '');
      // columns: ['Tanggal', 'NIS', 'Nama Siswa', 'Kelas', 'Jenis', 'Waktu', 'Status']
      // index 0: Tanggal, index 1: NIS, index 4: Jenis, index 6: Status
      if(tglString == tanggal && dataAbsen[j][4] == jenis) {
        resultAbsensi.push({
          nis: dataAbsen[j][1],
          status: dataAbsen[j][6] // index 6: Status
        });
      }
    }
  }
  
  return { siswa: resultSiswa, absensi: resultAbsensi };
}

function saveAbsensi(nis, kelas, tanggal, jenis, status) {
  var ss = getDb();
  var sheet = ss.getSheetByName('Absensi_Siswa');
  if(!sheet) {
    sheet = ss.insertSheet('Absensi_Siswa');
    sheet.appendRow(['Tanggal', 'NIS', 'Nama Siswa', 'Kelas', 'Jenis', 'Waktu', 'Status']);
  }
  
  // Ambil nama siswa dari Master_Siswa
  var namaSiswa = '';
  var sheetSiswa = ss.getSheetByName('Master_Siswa');
  if (sheetSiswa) {
    var dataSiswa = sheetSiswa.getDataRange().getValues();
    for (var k = 1; k < dataSiswa.length; k++) {
      if (dataSiswa[k][0] == nis) {
        namaSiswa = dataSiswa[k][2];
        break;
      }
    }
  }
  
  var existingData = sheet.getDataRange().getValues();
  var waktu = new Date().toLocaleTimeString();
  
  // Update jika sudah ada
  for(var i=1; i<existingData.length; i++) {
    var tglRow = existingData[i][0];
    var tglString = (tglRow instanceof Date) ? Utilities.formatDate(tglRow, Session.getScriptTimeZone(), 'yyyy-MM-dd') : (tglRow ? tglRow.toString() : '');
    // index 0: Tanggal, index 1: NIS, index 4: Jenis
    if(tglString == tanggal && existingData[i][1] == nis && existingData[i][4] == jenis) {
      sheet.getRange(i+1, 6, 1, 2).setValues([[waktu, status]]); // index 5: Waktu, index 6: Status
      return { success: true };
    }
  }
  
  // Insert baru
  // columns: ['Tanggal', 'NIS', 'Nama Siswa', 'Kelas', 'Jenis', 'Waktu', 'Status']
  sheet.appendRow([tanggal, nis, namaSiswa, kelas, jenis, waktu, status]);
  return { success: true };
}

function getGuruAndAbsensi(tanggal, jenis) {
  var ss = getDb();
  var sheetGuru = ss.getSheetByName('Master_Guru');
  if(!sheetGuru) return { guru: [], absensi: [] };
  
  var dataGuru = sheetGuru.getDataRange().getValues();
  var resultGuru = [];
  
  // Ambil semua guru
  for(var i=1; i<dataGuru.length; i++) {
    resultGuru.push({
      nip: dataGuru[i][0],
      nama: dataGuru[i][1],
      mapel: dataGuru[i][3] // index 3: Mata Pelajaran
    });
  }
  
  var sheetAbsen = ss.getSheetByName('Absensi_Guru');
  var resultAbsensi = [];
  if(sheetAbsen) {
    var dataAbsen = sheetAbsen.getDataRange().getValues();
    for(var j=1; j<dataAbsen.length; j++) {
      var tglRow = dataAbsen[j][0];
      var tglString = (tglRow instanceof Date) ? Utilities.formatDate(tglRow, Session.getScriptTimeZone(), 'yyyy-MM-dd') : (tglRow ? tglRow.toString() : '');
      // columns: ['Tanggal', 'NIP', 'Nama Guru', 'Mata Pelajaran', 'Jenis', 'Waktu', 'Status']
      // index 0: Tanggal, index 1: NIP, index 4: Jenis, index 6: Status
      if(tglString == tanggal && dataAbsen[j][4] == jenis) {
        resultAbsensi.push({
          nip: dataAbsen[j][1],
          status: dataAbsen[j][6] // index 6: Status
        });
      }
    }
  }
  
  return { guru: resultGuru, absensi: resultAbsensi };
}

function saveAbsensiGuru(nip, tanggal, jenis, status) {
  var ss = getDb();
  var sheet = ss.getSheetByName('Absensi_Guru');
  if(!sheet) {
    sheet = ss.insertSheet('Absensi_Guru');
    sheet.appendRow(['Tanggal', 'NIP', 'Nama Guru', 'Mata Pelajaran', 'Jenis', 'Waktu', 'Status']);
  }
  
  // Ambil nama dan mapel dari Master_Guru
  var namaGuru = '';
  var mapel = '';
  var sheetGuru = ss.getSheetByName('Master_Guru');
  if (sheetGuru) {
    var dataGuru = sheetGuru.getDataRange().getValues();
    for (var k = 1; k < dataGuru.length; k++) {
      if (dataGuru[k][0] == nip) {
        namaGuru = dataGuru[k][1];
        mapel = dataGuru[k][3];
        break;
      }
    }
  }
  
  var existingData = sheet.getDataRange().getValues();
  var waktu = new Date().toLocaleTimeString();
  
  for(var i=1; i<existingData.length; i++) {
    var tglRow = existingData[i][0];
    var tglString = (tglRow instanceof Date) ? Utilities.formatDate(tglRow, Session.getScriptTimeZone(), 'yyyy-MM-dd') : (tglRow ? tglRow.toString() : '');
    // index 0: Tanggal, index 1: NIP, index 4: Jenis
    if(tglString == tanggal && existingData[i][1] == nip && existingData[i][4] == jenis) {
      sheet.getRange(i+1, 6, 1, 2).setValues([[waktu, status]]); // index 5: Waktu, index 6: Status
      return { success: true };
    }
  }
  
  // Insert baru
  // columns: ['Tanggal', 'NIP', 'Nama Guru', 'Mata Pelajaran', 'Jenis', 'Waktu', 'Status']
  sheet.appendRow([tanggal, nip, namaGuru, mapel, jenis, waktu, status]);
  return { success: true };
}
