// Entry point untuk Google Apps Script Web App API
function doPost(e) {
  var result = {
    status: 'error',
    message: 'Unknown action'
  };

  try {
    var requestData;
    if (e.postData && e.postData.contents) {
      requestData = JSON.parse(e.postData.contents);
    } else {
      // Fallback for form data
      requestData = e.parameter;
    }

    var action = requestData.action;

    switch (action) {
      case 'getSemuaData':
        result = getSemuaData();
        break;
      case 'syncAllData':
        result = syncAllData(requestData.payload);
        break;
      case 'resetDatabase':
        seedDatabase();
        result = { status: 'success', message: 'Database reset and seeded' };
        break;
      // ... existing cases ...
      case 'saveSiswa':
        result = saveSiswa(requestData.data);
        break;
      case 'deleteSiswa':
        result = deleteSiswa(requestData.nis);
        break;
      case 'saveGuru':
        result = saveGuru(requestData.data);
        break;
      case 'deleteGuru':
        result = deleteGuru(requestData.nip);
        break;
      case 'saveKelas':
        result = saveKelas(requestData.data);
        break;
      case 'deleteKelas':
        result = deleteKelas(requestData.kode);
        break;
      case 'savePelanggaran':
        result = savePelanggaran(requestData.nis, requestData.katId, requestData.catatan, requestData.pelapor);
        break;
      case 'saveAbsensi':
        result = saveAbsensi(requestData.nis, requestData.kelas, requestData.tanggal, requestData.jenis, requestData.status);
        break;
      case 'saveAbsensiGuru':
        result = saveAbsensiGuru(requestData.nip, requestData.tanggal, requestData.jenis, requestData.status);
        break;
      default:
        result = { status: 'error', message: 'Unknown action: ' + action };
    }
  } catch (err) {
    result = { status: 'error', message: err.toString() };
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'API is running' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Function to fetch all data to initialize the React frontend state
function getSemuaData() {
  var ss = getDb();
  
  return {
    status: 'success',
    data: {
      siswa: getSheetDataAsObjects(ss.getSheetByName('Master_Siswa')),
      guru: getSheetDataAsObjects(ss.getSheetByName('Master_Guru')),
      kelas: getSheetDataAsObjects(ss.getSheetByName('Master_Kelas')),
      pelanggaran: getSheetDataAsObjects(ss.getSheetByName('Pelanggaran')),
      absensiSiswa: getSheetDataAsObjects(ss.getSheetByName('Absensi_Siswa')),
      absensiGuru: getSheetDataAsObjects(ss.getSheetByName('Absensi_Guru')),
      kategoriPelanggaran: getSheetDataAsObjects(ss.getSheetByName('Kategori_Pelanggaran'))
    }
  };
}

function getSheetDataAsObjects(sheet) {
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  
  var headers = data[0];
  var result = [];
  
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      // Map common headers to the expected frontend keys
      var key = mapHeaderToKey(headers[j]);
      var value = row[j];
      
      // Handle Date objects
      if (value instanceof Date) {
        value = Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
      }
      
      obj[key] = value;
    }
    // ensure every object has an 'id' for React lists
    if (!obj.id) obj.id = Utilities.getUuid ? Utilities.getUuid() : i.toString();
    result.push(obj);
  }
  return result;
}

function mapHeaderToKey(header) {
  var headerMap = {
    'NIS': 'nis',
    'NISN': 'nisn',
    'Nama Siswa': 'nama',
    'Kelas': 'kelas',
    'L/P': 'jk',
    'Status': 'status',
    'Tempat Lahir': 'tempatLahir',
    'Tanggal Lahir': 'tanggalLahir',
    'Alamat': 'alamat',
    'Nama Ayah': 'namaAyah',
    'Nama Ibu': 'namaIbu',
    'No HP Ortu': 'noHp',
    'Username': 'username',
    'Password': 'password',
    'NIP': 'nip',
    'Nama Lengkap': 'nama',
    'Nama Guru': 'nama',
    'Jenis Kelamin': 'jk',
    'Mata Pelajaran': 'mapel',
    'Status Pegawai': 'statusPegawai',
    'Jabatan': 'jabatan',
    'Pendidikan': 'pendidikan',
    'Jurusan': 'jurusan',
    'Tahun Lulus': 'tahunLulus',
    'No HP': 'noHp',
    'Kode Kelas': 'tingkat',
    'Nama Kelas': 'namaKelas',
    'Wali Kelas': 'waliKelas',
    'Jumlah Siswa': 'jumlahSiswa',
    'Kategori': 'kategori',
    'Jenis': 'jenis',
    'Poin': 'poin',
    'Pelanggaran': 'pelanggaran',
    'Pelapor': 'pelapor',
    'Tanggal': 'tanggal',
    'Waktu': 'waktu'
  };
  return headerMap[header] || header.toLowerCase().replace(/\s+/g, '_');
}

function syncAllData(payload) {
  var ss = getDb();
  var typeToSheet = {
    'siswa': 'Master_Siswa',
    'guru': 'Master_Guru',
    'kelas': 'Master_Kelas',
    'pelanggaran': 'Pelanggaran',
    'absensiSiswa': 'Absensi_Siswa',
    'absensiGuru': 'Absensi_Guru',
    'kategoriPelanggaran': 'Kategori_Pelanggaran'
  };

  var sheetName = typeToSheet[payload.type];
  if (!sheetName) return { status: 'error', message: 'Unknown type ' + payload.type };

  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return { status: 'error', message: 'Sheet not found' };

  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var data = payload.data || [];
  
  // Clear existing data (except header)
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clearContent();
  }

  if (data.length > 0) {
    var rows = data.map(function(obj) {
      return headers.map(function(header) {
        var key = mapHeaderToKey(header);
        return obj[key] !== undefined ? obj[key] : '';
      });
    });
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }

  return { status: 'success', message: 'Synced ' + payload.type };
}
