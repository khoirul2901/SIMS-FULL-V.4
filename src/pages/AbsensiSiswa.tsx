import React, { useState, useEffect } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { QrCode, Search, Calendar, CheckSquare } from 'lucide-react';
import { QRScannerModal } from '../components/QRScannerModal';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Hadir':
      return 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100';
    case 'Izin':
      return 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100';
    case 'Sakit':
      return 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100';
    case 'Alfa':
      return 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100';
    case 'Terlambat':
      return 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100';
    default:
      return 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100';
  }
};

export const AbsensiSiswa = () => {
  const { siswaData, kelasData, absensiData, setAbsensiData } = useDatabase();
  const [selectedKelas, setSelectedKelas] = useState('VII-A');
  const [jenisAbsen, setJenisAbsen] = useState('Masuk');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const uniqueKelas = Array.from(new Set(kelasData.map(k => k.namaKelas).filter((k): k is string => Boolean(k)))).sort();
  
  useEffect(() => {
    if (uniqueKelas.length > 0 && (!selectedKelas || !uniqueKelas.includes(selectedKelas))) {
      setSelectedKelas(uniqueKelas[0]);
    }
  }, [uniqueKelas, selectedKelas]);

  // Get all students for the selected class, merged with current absensi status
  const studentsInClass = siswaData.filter(s => s.kelas === selectedKelas);
  
  const filteredData = studentsInClass.map(siswa => {
    const existing = absensiData.find(a => a.nis === siswa.nis && a.tanggal === date && a.jenis === jenisAbsen);
    return {
      ...siswa,
      status: existing ? existing.status : 'Belum diabsen'
    };
  }).filter(siswa => 
    siswa.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
    siswa.nis.includes(searchTerm)
  );

  const handleStatusChange = (nis: string, status: string) => {
    const existingIdx = absensiData.findIndex(a => a.nis === nis && a.tanggal === date && a.jenis === jenisAbsen);
    if (existingIdx >= 0) {
      const newAbsensi = [...absensiData];
      newAbsensi[existingIdx].status = status;
      setAbsensiData(newAbsensi);
    } else {
      setAbsensiData([...absensiData, {
        id: Math.random().toString(36).substr(2, 9),
        tanggal: date,
        nis,
        kelas: selectedKelas,
        jenis: jenisAbsen,
        status
      }]);
    }
  };

  const handleScanStudentQR = (rawCode: string) => {
    const cleanCode = rawCode.trim();
    // Search student by NIS or ID or NISN
    const student = siswaData.find(s => 
      s.nis === cleanCode || 
      (s.nisn && s.nisn === cleanCode) ||
      (s.id && s.id === cleanCode)
    );

    if (!student) {
      return {
        success: false,
        type: 'error' as const,
        title: 'Siswa Tidak Ditemukan',
        message: `NIS "${cleanCode}" tidak terdaftar pada data siswa.`
      };
    }

    // Check existing status
    const existing = absensiData.find(a => a.nis === student.nis && a.tanggal === date && a.jenis === jenisAbsen);
    if (existing && existing.status === 'Hadir') {
      return {
        success: true,
        type: 'warning' as const,
        title: 'Sudah Absen Hadir',
        message: `${student.nama} (${student.nis}) - Kelas ${student.kelas} sudah tercatat Hadir.`
      };
    }

    // Record Hadir
    handleStatusChange(student.nis, 'Hadir');

    return {
      success: true,
      type: 'success' as const,
      title: `Absen ${jenisAbsen} Berhasil!`,
      message: `${student.nama} (${student.nis}) • Kelas ${student.kelas}`
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Absensi Siswa</h1>
          <p className="text-sm text-slate-500 mt-1">Input data kehadiran siswa per kelas & scan QR otomatis</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsScannerOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 font-semibold rounded-xl transition-all shadow-md hover:shadow-indigo-200 text-sm"
          >
            <QrCode className="w-4 h-4" />
            Scan QR (Auto Detect)
          </button>
        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Filters Panel */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm md:col-span-1 h-fit">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-blue-600" />
            Parameter Absensi
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Jenis Absensi</label>
              <select 
                value={jenisAbsen}
                onChange={(e) => setJenisAbsen(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value="Masuk">Masuk</option>
                <option value="Pulang">Pulang</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Pilih Kelas</label>
              <select 
                value={selectedKelas}
                onChange={(e) => setSelectedKelas(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                {uniqueKelas.map(k => <option key={k} value={k}>Kelas {k}</option>)}
              </select>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-blue-800 font-medium mb-1">Ringkasan {jenisAbsen} ({selectedKelas})</p>
                <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                  <div className="flex justify-between"><span className="text-slate-500">Hadir:</span> <span className="font-semibold text-emerald-600">{filteredData.filter(s => s.status === 'Hadir').length}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Izin:</span> <span className="font-semibold text-blue-600">{filteredData.filter(s => s.status === 'Izin').length}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Sakit:</span> <span className="font-semibold text-amber-600">{filteredData.filter(s => s.status === 'Sakit').length}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Alfa:</span> <span className="font-semibold text-red-600">{filteredData.filter(s => s.status === 'Alfa').length}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm md:col-span-2 overflow-hidden flex flex-col h-[600px]">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama atau NIS siswa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="divide-y divide-slate-100">
              {filteredData.length > 0 ? (
                filteredData.map((siswa) => (
                  <div key={siswa.nis} className="p-4 sm:px-6 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-500 shrink-0">
                        {siswa.nama.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{siswa.nama}</p>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">{siswa.nis} • {siswa.jk}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2">
                      <select 
                        value={siswa.status}
                        onChange={(e) => handleStatusChange(siswa.nis, e.target.value)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border appearance-none text-center cursor-pointer min-w-[120px] transition-colors focus:outline-none ${getStatusColor(siswa.status)}`}
                      >
                        <option value="Belum diabsen">Belum diabsen</option>
                        <option value="Hadir">Hadir</option>
                        <option value="Izin">Izin</option>
                        <option value="Sakit">Sakit</option>
                        <option value="Alfa">Alfa</option>
                        <option value="Terlambat">Terlambat</option>
                      </select>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-slate-500">
                  Tidak ada siswa yang ditemukan.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        title={`Scan QR Code Absensi Siswa (${jenisAbsen})`}
        subtitle="Sistem otomatis mendeteksi QR Code dan mencatat kehadiran tanpa menutup kamera"
        manualPlaceholder="Atau ketik NIS siswa di sini..."
        onScan={handleScanStudentQR}
      />
    </div>
  );
};
