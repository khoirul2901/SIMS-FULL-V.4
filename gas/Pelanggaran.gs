// Script untuk mengolah data Pelanggaran Siswa

function getPelanggaranData() {
  var ss = getDb();
  
  // 1. Get Riwayat
  var sheet = ss.getSheetByName('Pelanggaran');
  var riwayat = [];
  if(sheet) {
    var data = sheet.getDataRange().getValues();
    // Kolom: Tanggal, NIS, Nama Siswa, Kelas, Kategori, Pelanggaran, Poin, Pelapor
    for (var i = 1; i < data.length; i++) {
      var tglRow = data[i][0];
      if (tglRow instanceof Date) {
        tglRow = Utilities.formatDate(tglRow, Session.getScriptTimeZone(), "dd MMM yyyy");
      }
      riwayat.push({
        tanggal: tglRow,
        nis: data[i][1],
        nama: data[i][2],
        kelas: data[i][3],
        kategori: data[i][4],
        pelanggaran: data[i][5],
        poin: data[i][6],
        pelapor: data[i][7]
      });
    }
  }
  
  // 2. Get Kategori
  var sheetKat = ss.getSheetByName('Kategori_Pelanggaran');
  var kategori = [];
  if(sheetKat) {
    var dataKat = sheetKat.getDataRange().getValues();
    for (var j = 1; j < dataKat.length; j++) {
      kategori.push({
        id: dataKat[j][0],
        kategori: dataKat[j][1],
        jenis: dataKat[j][2],
        poin: dataKat[j][3]
      });
    }
  } else {
    // Default categories if sheet doesn't exist
    kategori = [
      { id: '1', kategori: 'Keterlambatan', jenis: 'Terlambat Masuk', poin: 10 },
      { id: '2', kategori: 'Kerapian', jenis: 'Rambut Panjang', poin: 5 },
      { id: '3', kategori: 'Perilaku', jenis: 'Berkelahi', poin: 50 },
    ];
  }

  // 3. Get Siswa for Dropdown
  var sheetSiswa = ss.getSheetByName('Master_Siswa');
  var siswaList = [];
  if (sheetSiswa) {
    var dataSiswa = sheetSiswa.getDataRange().getValues();
    for(var k=1; k<dataSiswa.length; k++) {
      siswaList.push({
        nis: dataSiswa[k][0],
        nama: dataSiswa[k][2],
        kelas: dataSiswa[k][3]
      });
    }
  }

  return {
    riwayat: riwayat,
    kategori: kategori,
    siswa: siswaList
  };
}

function savePelanggaran(data) {
  var ss = getDb();
  var sheet = ss.getSheetByName('Pelanggaran');
  if(!sheet) {
    sheet = ss.insertSheet('Pelanggaran');
    sheet.appendRow(['Tanggal', 'NIS', 'Nama Siswa', 'Kelas', 'Kategori', 'Pelanggaran', 'Poin', 'Pelapor']);
  }
  
  var tgl = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
  sheet.appendRow([tgl, data.nis, data.nama, data.kelas, data.kategori, data.pelanggaran, data.poin, data.pelapor]);
  return { success: true, message: 'Data pelanggaran berhasil dicatat' };
}

function saveKategoriPelanggaran(data) {
  var ss = getDb();
  var sheet = ss.getSheetByName('Kategori_Pelanggaran');
  if(!sheet) {
    sheet = ss.insertSheet('Kategori_Pelanggaran');
    sheet.appendRow(['ID', 'Kategori', 'Jenis', 'Poin']);
  }
  
  var newId = new Date().getTime().toString();
  sheet.appendRow([newId, data.kategori, data.jenis, data.poin]);
  return { success: true, id: newId };
}

function deleteKategoriPelanggaran(id) {
  var ss = getDb();
  var sheet = ss.getSheetByName('Kategori_Pelanggaran');
  if(!sheet) return { success: false };
  
  var data = sheet.getDataRange().getValues();
  for(var i=1; i<data.length; i++) {
    if(data[i][0] == id) {
      sheet.deleteRow(i+1);
      return { success: true };
    }
  }
  return { success: false };
}
