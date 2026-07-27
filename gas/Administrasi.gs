// Script untuk mengelola Arsip Digital dan Surat Menyurat

function getSuratList() {
  var ss = getDb();
  var sheet = ss.getSheetByName('Surat_Keluar');
  if(!sheet) return [];
  
  var data = sheet.getDataRange().getValues();
  var result = [];
  
  // Asumsi Kolom: A(No Surat), B(Jenis Surat), C(Tujuan), D(Tanggal), E(Status)
  for (var i = 1; i < data.length; i++) {
    var tglRow = data[i][3];
    if (tglRow instanceof Date) {
      tglRow = Utilities.formatDate(tglRow, Session.getScriptTimeZone(), "yyyy-MM-dd");
    }
    
    result.push({
      noSurat: data[i][0],
      jenis: data[i][1],
      tujuan: data[i][2],
      tanggal: tglRow,
      status: data[i][4]
    });
  }
  
  return result;
}

function getArsipList() {
  var ss = getDb();
  var sheet = ss.getSheetByName('Arsip_Digital');
  if(!sheet) return [];
  
  var data = sheet.getDataRange().getValues();
  var result = [];
  
  // Asumsi Kolom: A(Nama Dokumen), B(Kategori), C(Ukuran), D(Tanggal Upload), E(URL File)
  for (var i = 1; i < data.length; i++) {
    var tglRow = data[i][3];
    if (tglRow instanceof Date) {
      tglRow = Utilities.formatDate(tglRow, Session.getScriptTimeZone(), "dd MMM yyyy");
    }
    
    result.push({
      nama: data[i][0],
      kategori: data[i][1],
      ukuran: data[i][2],
      tanggal: tglRow,
      url: data[i][4]
    });
  }
  
  return result;
}
