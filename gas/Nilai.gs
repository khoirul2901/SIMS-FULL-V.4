// Script untuk mengolah data Nilai & Rapor Siswa

function getNilaiData() {
  var ss = getDb();
  var sheet = ss.getSheetByName('Nilai_Siswa');
  var result = [];
  if (sheet) {
    var data = sheet.getDataRange().getValues();
    // Header: ID, NIS, Nama, Kelas, TahunAjaran, Semester, Mapel, Tugas, UH, UTS, UAS, NilaiAkhir, Predikat, Keterangan, Catatan
    for (var i = 1; i < data.length; i++) {
      if (!data[i][0]) continue;
      result.push({
        id: data[i][0],
        nis: data[i][1],
        nama: data[i][2],
        kelas: data[i][3],
        tahunAjaran: data[i][4],
        semester: data[i][5],
        mapel: data[i][6],
        tugas: data[i][7],
        uh: data[i][8],
        uts: data[i][9],
        uas: data[i][10],
        nilaiAkhir: data[i][11],
        predikat: data[i][12],
        keterangan: data[i][13],
        catatan: data[i][14]
      });
    }
  }
  return result;
}

function simpanNilaiBatch(nilaiList) {
  var ss = getDb();
  var sheet = ss.getSheetByName('Nilai_Siswa');
  if (!sheet) {
    sheet = ss.insertSheet('Nilai_Siswa');
    sheet.appendRow(['ID', 'NIS', 'Nama', 'Kelas', 'TahunAjaran', 'Semester', 'Mapel', 'Tugas', 'UH', 'UTS', 'UAS', 'NilaiAkhir', 'Predikat', 'Keterangan', 'Catatan']);
  }
  
  var existingData = sheet.getDataRange().getValues();
  var existingMap = {};
  for (var i = 1; i < existingData.length; i++) {
    existingMap[existingData[i][0]] = i + 1; // row index
  }

  nilaiList.forEach(function(item) {
    var row = existingMap[item.id];
    var rowData = [
      item.id,
      item.nis,
      item.nama,
      item.kelas,
      item.tahunAjaran,
      item.semester,
      item.mapel,
      item.tugas,
      item.uh,
      item.uts,
      item.uas,
      item.nilaiAkhir,
      item.predikat,
      item.keterangan,
      item.catatan
    ];

    if (row) {
      sheet.getRange(row, 1, 1, rowData.length).setValues([rowData]);
    } else {
      sheet.appendRow(rowData);
    }
  });

  return { status: 'success', message: 'Nilai berhasil disimpan di Google Spreadsheet' };
}
