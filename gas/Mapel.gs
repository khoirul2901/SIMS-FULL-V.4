// Script untuk mengolah data Mata Pelajaran

function getMapelList() {
  var ss = getDb();
  var sheet = ss.getSheetByName('Master_Mapel');
  if(!sheet) return [];
  
  var data = sheet.getDataRange().getValues();
  var mapelList = [];
  
  // Asumsi Kolom: A(Kode Mapel), B(Nama Mapel), C(Kelompok)
  for (var i = 1; i < data.length; i++) {
    mapelList.push({
      kode: data[i][0],
      nama: data[i][1],
      kelompok: data[i][2]
    });
  }
  
  return mapelList;
}

function saveMapel(data) {
  var ss = getDb();
  var sheet = ss.getSheetByName('Master_Mapel');
  if(!sheet) {
    sheet = ss.insertSheet('Master_Mapel');
    sheet.appendRow(['Kode Mapel', 'Nama Mapel', 'Kelompok']);
  }
  
  var existingData = sheet.getDataRange().getValues();
  for (var i = 1; i < existingData.length; i++) {
    if (existingData[i][0] == data.kode) {
      sheet.getRange(i+1, 2, 1, 2).setValues([[data.nama, data.kelompok]]);
      return { success: true, message: 'Data berhasil diupdate' };
    }
  }
  
  // Insert Baru
  sheet.appendRow([data.kode, data.nama, data.kelompok]);
  return { success: true, message: 'Data mata pelajaran berhasil ditambahkan' };
}
