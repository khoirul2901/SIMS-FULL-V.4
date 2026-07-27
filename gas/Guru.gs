// Script untuk mengolah data Guru dan Tendik

function getGuruList() {
  var ss = getDb();
  var sheet = ss.getSheetByName('Master_Guru');
  if(!sheet) return [];
  
  var data = sheet.getDataRange().getValues();
  var guruList = [];
  
  // Asumsi Kolom: A(NIP), B(Nama Lengkap), C(Mata Pelajaran), D(Status Pegawai), E(No HP)
  for (var i = 1; i < data.length; i++) {
    guruList.push({
      nip: data[i][0] || '',
      nama: data[i][1] || '',
      jk: data[i][2] || 'L',
      mapel: data[i][3] || '',
      status: data[i][4] || 'Aktif',
      tempatLahir: data[i][5] || '',
      tanggalLahir: data[i][6] ? (data[i][6] instanceof Date ? data[i][6].toISOString().split('T')[0] : data[i][6]) : '',
      alamat: data[i][7] || '',
      statusPegawai: data[i][8] || '',
      jabatan: data[i][9] || '',
      pendidikan: data[i][10] || '',
      jurusan: data[i][11] || '',
      tahunLulus: data[i][12] || '',
      noHp: data[i][13] || '',
      username: data[i][14] || '',
      password: data[i][15] || ''
    });
  }
  
  return guruList;
}

function saveGuru(data) {
  var ss = getDb();
  var sheet = ss.getSheetByName('Master_Guru');
  if(!sheet) {
    sheet = ss.insertSheet('Master_Guru');
    sheet.appendRow(['NIP', 'Nama Lengkap', 'Jenis Kelamin', 'Mata Pelajaran', 'Status', 'Tempat Lahir', 'Tanggal Lahir', 'Alamat', 'Status Pegawai', 'Jabatan', 'Pendidikan', 'Jurusan', 'Tahun Lulus', 'No HP', 'Username', 'Password']);
  }
  
  // Logic Cek Update / Insert
  var existingData = sheet.getDataRange().getValues();
  for (var i = 1; i < existingData.length; i++) {
    if (existingData[i][0] == data.nip) {
      sheet.getRange(i+1, 2, 1, 15).setValues([[data.nama, data.jk, data.mapel, data.status, data.tempatLahir || '', data.tanggalLahir || '', data.alamat || '', data.statusPegawai || '', data.jabatan || '', data.pendidikan || '', data.jurusan || '', data.tahunLulus || '', data.noHp || '', data.username || '', data.password || '']]);
      return { success: true, message: 'Data guru berhasil diupdate' };
    }
  }
  
  // Insert Baru
  sheet.appendRow([data.nip, data.nama, data.jk || 'L', data.mapel || '', data.status || 'Aktif', data.tempatLahir || '', data.tanggalLahir || '', data.alamat || '', data.statusPegawai || '', data.jabatan || '', data.pendidikan || '', data.jurusan || '', data.tahunLulus || '', data.noHp || '', data.username || '', data.password || '']);
  return { success: true, message: 'Data guru berhasil ditambahkan' };
}

function deleteGuru(nip) {
  var ss = getDb();
  var sheet = ss.getSheetByName('Master_Guru');
  if(!sheet) return { success: false, message: 'Sheet tidak ditemukan' };
  
  var existingData = sheet.getDataRange().getValues();
  for (var i = 1; i < existingData.length; i++) {
    if (existingData[i][0] == nip) {
      sheet.deleteRow(i + 1);
      return { success: true, message: 'Data berhasil dihapus' };
    }
  }
  return { success: false, message: 'Data tidak ditemukan' };
}
