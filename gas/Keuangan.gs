// Script untuk mengelola data Pembayaran Keuangan

function getKeuanganList() {
  var ss = getDb();
  var sheet = ss.getSheetByName('Keuangan');
  if(!sheet) return [];
  
  var data = sheet.getDataRange().getValues();
  var result = [];
  
  // Asumsi Kolom: A(Tanggal), B(No Transaksi), C(Nama Siswa), D(Kelas), E(Jenis Pembayaran), F(Jumlah), G(Status)
  for (var i = 1; i < data.length; i++) {
    var tglRow = data[i][0];
    if (tglRow instanceof Date) {
      tglRow = Utilities.formatDate(tglRow, Session.getScriptTimeZone(), "dd MMM yyyy");
    }
    
    result.push({
      tanggal: tglRow,
      noTransaksi: data[i][1],
      nama: data[i][2],
      kelas: data[i][3],
      jenis: data[i][4],
      jumlah: data[i][5],
      status: data[i][6]
    });
  }
  
  return result;
}
