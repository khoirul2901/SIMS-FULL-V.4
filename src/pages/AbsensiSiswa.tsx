import React, { useState, useEffect, useCallback } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { 
  QrCode, 
  Search, 
  Calendar, 
  CheckSquare, 
  Barcode, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  X,
  Volume2,
  Clock,
  IdCard
} from 'lucide-react';
import { QRScannerModal } from '../components/QRScannerModal';
import { HardScannerStationModal } from '../components/HardScannerStationModal';
import { LinkCardModal } from '../components/LinkCardModal';
import { useHardwareScanner } from '../hooks/useHardwareScanner';
import { scannerFeedback } from '../utils/scannerFeedback';
import { findStudentByScannedCode, normalizeScannedCode } from '../utils/studentLookup';

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
  const { siswaData, setSiswaData, kelasData, absensiData, setAbsensiData } = useDatabase();
  const [selectedKelas, setSelectedKelas] = useState('VII-A');
  const [jenisAbsen, setJenisAbsen] = useState<'Masuk' | 'Pulang'>('Masuk');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isStationOpen, setIsStationOpen] = useState(false);
  const [linkCardModal, setLinkCardModal] = useState<{ isOpen: boolean; code: string }>({ isOpen: false, code: '' });

  // Background floating notification when hard scanner fires on the main page
  const [bgNotification, setBgNotification] = useState<{
    type: 'success' | 'warning' | 'error';
    title: string;
    message: string;
    code: string;
    time: string;
  } | null>(null);

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

  const handleStatusChange = (nis: string, status: string, targetKelas?: string) => {
    const existingIdx = absensiData.findIndex(a => a.nis === nis && a.tanggal === date && a.jenis === jenisAbsen);
    const resolvedKelas = targetKelas || selectedKelas;

    if (existingIdx >= 0) {
      const newAbsensi = [...absensiData];
      newAbsensi[existingIdx] = {
        ...newAbsensi[existingIdx],
        status,
        kelas: resolvedKelas
      };
      setAbsensiData(newAbsensi);
    } else {
      setAbsensiData([...absensiData, {
        id: Math.random().toString(36).substr(2, 9),
        tanggal: date,
        nis,
        kelas: resolvedKelas,
        jenis: jenisAbsen,
        status
      }]);
    }
  };

  const handleScanStudentQR = useCallback((rawCode: string) => {
    const cleanCode = normalizeScannedCode(rawCode);
    // Intelligent lookup supporting idKartu, barcode, NIS, NISN, leading zeros, AIM symbology
    const match = findStudentByScannedCode(siswaData, rawCode);

    if (!match) {
      return {
        success: false,
        type: 'error' as const,
        title: 'Siswa Tidak Ditemukan',
        message: `Barcode / ID "${cleanCode}" tidak terdaftar pada siswa mana pun.`,
        statusBadge: 'Gagal'
      };
    }

    const student = match.student;

    // Check existing status
    const existing = absensiData.find(a => a.nis === student.nis && a.tanggal === date && a.jenis === jenisAbsen);
    if (existing && existing.status === 'Hadir') {
      return {
        success: true,
        type: 'warning' as const,
        title: 'Sudah Absen Hadir',
        message: `${student.nama} (${student.nis}) - Kelas ${student.kelas} sudah tercatat Hadir.`,
        personName: student.nama,
        personSub: `Kelas ${student.kelas} • NIS: ${student.nis}`,
        statusBadge: 'Sudah Hadir'
      };
    }

    // Record Hadir with student's actual class
    handleStatusChange(student.nis, 'Hadir', student.kelas);

    // If student is from a different class, switch class to let operator see them
    if (student.kelas && student.kelas !== selectedKelas) {
      setSelectedKelas(student.kelas);
    }

    return {
      success: true,
      type: 'success' as const,
      title: `Absen ${jenisAbsen} Hadir!`,
      message: `${student.nama} (${student.nis}) • Kelas ${student.kelas}`,
      personName: student.nama,
      personSub: `Kelas ${student.kelas} • NIS: ${student.nis}`,
      statusBadge: 'Hadir'
    };
  }, [siswaData, absensiData, date, jenisAbsen, selectedKelas]);

  // Handler when user links an unrecognized barcode to a student
  const handleSaveAndAttendLink = useCallback((studentId: string, cardCode: string) => {
    const targetStudent = siswaData.find(s => s.id === studentId);
    if (!targetStudent) return;

    // Persist card code onto student record (both as idKartu and barcode)
    const updatedSiswaList = siswaData.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          idKartu: cardCode,
          barcode: cardCode
        };
      }
      return s;
    });

    setSiswaData(updatedSiswaList);

    // Record Hadir attendance
    handleStatusChange(targetStudent.nis, 'Hadir', targetStudent.kelas);
    if (targetStudent.kelas && targetStudent.kelas !== selectedKelas) {
      setSelectedKelas(targetStudent.kelas);
    }

    scannerFeedback.playSound('success');
    scannerFeedback.speak(`${targetStudent.nama}, Hadir ${jenisAbsen}`);

    setBgNotification({
      type: 'success',
      title: `Kartu Berhasil Ditautkan!`,
      message: `${targetStudent.nama} (${targetStudent.nis}) • Kelas ${targetStudent.kelas} tercatat Hadir.`,
      code: cardCode,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    });
  }, [siswaData, setSiswaData, jenisAbsen, selectedKelas]);

  // Global Hardware Scanner Listener right on the page (even without opening modals!)
  const handlePageHardwareScan = useCallback((code: string) => {
    // Only handle if modals are NOT open (since modals handle their own scans)
    if (isScannerOpen || isStationOpen) return;

    const result = handleScanStudentQR(code);
    const resultType = result.type || (result.success ? 'success' : 'error');
    const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    scannerFeedback.playSound(resultType);
    if (result.success && result.personName) {
      scannerFeedback.speak(`${result.personName}, Hadir ${jenisAbsen}`);
    }

    setBgNotification({
      type: resultType,
      title: result.title,
      message: result.message,
      code,
      time: nowTime
    });

    setTimeout(() => {
      setBgNotification(null);
    }, 4000);
  }, [isScannerOpen, isStationOpen, handleScanStudentQR, jenisAbsen]);

  useHardwareScanner({
    onScan: handlePageHardwareScan,
    enabled: !isScannerOpen && !isStationOpen,
    minChars: 3
  });

  // Calculate stats for current class & date
  const summaryStats = {
    total: studentsInClass.length,
    hadir: filteredData.filter(s => s.status === 'Hadir').length,
    terlambat: filteredData.filter(s => s.status === 'Terlambat').length,
    izin: filteredData.filter(s => s.status === 'Izin').length,
    sakit: filteredData.filter(s => s.status === 'Sakit').length,
    alfa: filteredData.filter(s => s.status === 'Alfa').length,
  };

  return (
    <div className="space-y-6 relative">
      
      {/* Floating Background Scan Notification (Triggered when using CLABEL gun directly on page) */}
      {bgNotification && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-in slide-in-from-bottom-5 duration-200">
          <div className={`p-4 rounded-2xl shadow-2xl border flex items-start gap-3 backdrop-blur-md ${
            bgNotification.type === 'success'
              ? 'bg-emerald-950/95 border-emerald-500/60 text-emerald-100'
              : bgNotification.type === 'warning'
              ? 'bg-amber-950/95 border-amber-500/60 text-amber-100'
              : 'bg-rose-950/95 border-rose-500/60 text-rose-100'
          }`}>
            <div className="shrink-0 mt-0.5">
              {bgNotification.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {bgNotification.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
              {bgNotification.type === 'error' && <XCircle className="w-5 h-5 text-rose-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-bold text-sm truncate">{bgNotification.title}</h4>
                <span className="text-[11px] opacity-80 font-mono">{bgNotification.time}</span>
              </div>
              <p className="text-xs mt-1 opacity-90">{bgNotification.message}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="text-[10px] opacity-75 font-mono">
                  Barcode: {bgNotification.code}
                </span>
                {bgNotification.type === 'error' && (
                  <button
                    type="button"
                    onClick={() => {
                      const codeToLink = bgNotification.code;
                      setBgNotification(null);
                      setLinkCardModal({ isOpen: true, code: codeToLink });
                    }}
                    className="text-[11px] font-semibold bg-white text-rose-900 hover:bg-rose-100 px-2 py-0.5 rounded shadow-sm flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <IdCard className="w-3 h-3 text-rose-700" />
                    Tautkan Kartu ke Siswa
                  </button>
                )}
              </div>
            </div>
            <button 
              onClick={() => setBgNotification(null)}
              className="p-1 opacity-60 hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-800">Absensi Siswa</h1>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Hard Scanner (CLABEL) Siap
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Input kehadiran siswa, scan kamera QR, atau tembak langsung dengan scanner barcode CLABEL / USB Gun
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button 
            onClick={() => setIsStationOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-emerald-200 text-sm"
          >
            <Barcode className="w-4 h-4" />
            Station Scanner (CLABEL)
          </button>

          <button 
            onClick={() => setIsScannerOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-indigo-200 text-sm"
          >
            <QrCode className="w-4 h-4" />
            Scan Kamera
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Filters Panel */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm md:col-span-1 h-fit space-y-4">
          <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-blue-600" />
            Parameter Absensi
          </h3>
          
          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Tanggal</label>
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
              <label className="block text-xs font-medium text-slate-700 mb-1">Jenis Absensi</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setJenisAbsen('Masuk')}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                    jenisAbsen === 'Masuk'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Absen Masuk
                </button>
                <button
                  type="button"
                  onClick={() => setJenisAbsen('Pulang')}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                    jenisAbsen === 'Pulang'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Absen Pulang
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Pilih Kelas</label>
              <select 
                value={selectedKelas}
                onChange={(e) => setSelectedKelas(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
              >
                {uniqueKelas.map(k => <option key={k} value={k}>Kelas {k}</option>)}
              </select>
            </div>

            {/* Quick Status Box */}
            <div className="pt-3 border-t border-slate-100">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                <p className="text-xs text-slate-700 font-semibold mb-2">Ringkasan {jenisAbsen} ({selectedKelas})</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between bg-white p-1.5 rounded border border-slate-100">
                    <span className="text-slate-500">Hadir:</span> 
                    <span className="font-bold text-emerald-600">{summaryStats.hadir}</span>
                  </div>
                  <div className="flex justify-between bg-white p-1.5 rounded border border-slate-100">
                    <span className="text-slate-500">Terlambat:</span> 
                    <span className="font-bold text-purple-600">{summaryStats.terlambat}</span>
                  </div>
                  <div className="flex justify-between bg-white p-1.5 rounded border border-slate-100">
                    <span className="text-slate-500">Izin:</span> 
                    <span className="font-bold text-blue-600">{summaryStats.izin}</span>
                  </div>
                  <div className="flex justify-between bg-white p-1.5 rounded border border-slate-100">
                    <span className="text-slate-500">Sakit:</span> 
                    <span className="font-bold text-amber-600">{summaryStats.sakit}</span>
                  </div>
                  <div className="flex justify-between bg-white p-1.5 rounded border border-slate-100 col-span-2">
                    <span className="text-slate-500">Alfa:</span> 
                    <span className="font-bold text-red-600">{summaryStats.alfa}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Hard scanner info badge */}
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Scanner CLABEL Aktif Langsung</p>
                <p className="text-[11px] text-emerald-700 mt-0.5 leading-snug">
                  Cukup tembak barcode pada kartu siswa kapan saja di layar ini untuk otomatis absen.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm md:col-span-2 overflow-hidden flex flex-col h-[600px]">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama atau NIS siswa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Menampilkan {filteredData.length} siswa
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
                        onChange={(e) => handleStatusChange(siswa.nis, e.target.value, siswa.kelas)}
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

      {/* QR & Barcode Camera Modal */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        title={`Scan Kamera Absensi Siswa (${jenisAbsen})`}
        subtitle="Dapat menggunakan Kamera Web/HP atau scanner barcode CLABEL"
        manualPlaceholder="Ketik NIS siswa atau tembak scanner..."
        onLinkCard={(code) => setLinkCardModal({ isOpen: true, code })}
        onScan={handleScanStudentQR}
      />

      {/* Dedicated Kiosk / Station Hard Scanner (CLABEL) Modal */}
      <HardScannerStationModal
        isOpen={isStationOpen}
        onClose={() => setIsStationOpen(false)}
        title={`Station Absensi Siswa (${jenisAbsen})`}
        targetType="siswa"
        jenisAbsen={jenisAbsen}
        onJenisAbsenChange={(jenis) => setJenisAbsen(jenis)}
        onLinkCard={(code) => setLinkCardModal({ isOpen: true, code })}
        summaryStats={summaryStats}
        onScan={handleScanStudentQR}
      />

      {/* Modal Tautkan Barcode Kartu Fisik ke Siswa */}
      <LinkCardModal
        isOpen={linkCardModal.isOpen}
        onClose={() => setLinkCardModal({ isOpen: false, code: '' })}
        cardCode={linkCardModal.code}
        students={siswaData}
        onLinkAndAttend={(studentId, code) => handleSaveAndAttendLink(studentId, code)}
      />
    </div>
  );
};
