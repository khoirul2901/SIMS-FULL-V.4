import React, { useState, useEffect } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { 
  QrCode, 
  Search, 
  Calendar, 
  UserCheck, 
  Settings, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  FileText, 
  Filter, 
  Check, 
  BookOpen,
  Info,
  ShieldCheck,
  Edit3
} from 'lucide-react';
import Swal from 'sweetalert2';
import { QRScannerModal } from '../components/QRScannerModal';

interface PengaturanScan {
  jamMasukMulai: string;
  jamMasukBatas: string;
  jamMasukAkhir: string;
  jamPulangMulai: string;
  jamPulangBatas: string;
  toleransiMenit: number;
  wajibJadwalHariIni: boolean;
  izinkanScanLuarJam: boolean;
}

const DEFAULT_PENGATURAN_SCAN: PengaturanScan = {
  jamMasukMulai: '06:30',
  jamMasukBatas: '07:30',
  jamMasukAkhir: '10:00',
  jamPulangMulai: '13:00',
  jamPulangBatas: '17:00',
  toleransiMenit: 15,
  wajibJadwalHariIni: true,
  izinkanScanLuarJam: false
};

export const AbsensiGuru = () => {
  const { guruData, absensiGuruData, setAbsensiGuruData, jadwalData } = useDatabase();
  const [jenisAbsen, setJenisAbsen] = useState<'Masuk' | 'Pulang'>('Masuk');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('Semua');

  // Pengaturan Operasional Scan & Jadwal
  const [pengaturan, setPengaturan] = useState<PengaturanScan>(() => {
    const saved = localStorage.getItem('sims_pengaturan_scan_guru');
    return saved ? JSON.parse(saved) : DEFAULT_PENGATURAN_SCAN;
  });

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [tempPengaturan, setTempPengaturan] = useState<PengaturanScan>(pengaturan);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Helper mendapatkan nama hari Indonesia
  const getNamaHari = (dateString: string) => {
    const d = new Date(dateString);
    const hariArr = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return hariArr[d.getDay()];
  };

  const hariIni = getNamaHari(date);

  // Simpan Pengaturan
  const handleSavePengaturan = (e: React.FormEvent) => {
    e.preventDefault();
    setPengaturan(tempPengaturan);
    localStorage.setItem('sims_pengaturan_scan_guru', JSON.stringify(tempPengaturan));
    setIsSettingsModalOpen(false);
    
    Swal.fire({
      icon: 'success',
      title: 'Pengaturan Disimpan',
      text: 'Aturan jadwal dan jam operasional scan QR guru telah diperbarui.',
      timer: 1800,
      showConfirmButton: false
    });
  };

  // Combine Guru Data with Absensi & Jadwal for selected date
  const processedGuruData = guruData.map(guru => {
    const existing = absensiGuruData.find(a => a.nip === guru.nip && a.tanggal === date && a.jenis === jenisAbsen);
    
    // Get schedule for this teacher on selected day
    const jadwalHari = jadwalData.filter(j => j.guru === guru.nama && j.hari === hariIni);

    return {
      ...guru,
      status: existing ? existing.status : 'Belum diabsen',
      waktu: existing ? existing.waktu : '-',
      keterangan: existing ? (existing.keterangan || '') : '',
      metode: existing ? (existing.metode || 'Manual') : '-',
      jadwalHari,
      adaJadwalHariIni: jadwalHari.length > 0
    };
  });

  const filteredData = processedGuruData.filter(guru => {
    const matchSearch = guru.nama.toLowerCase().includes(searchTerm.toLowerCase()) || guru.nip.includes(searchTerm);
    const matchStatus = filterStatus === 'Semua' || guru.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // Handle Manual Status & Keterangan Change
  const handleStatusChange = (nip: string, newStatus: string, customKeterangan?: string) => {
    const existingIdx = absensiGuruData.findIndex(a => a.nip === nip && a.tanggal === date && a.jenis === jenisAbsen);
    const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const waktu = ['Hadir', 'Terlambat'].includes(newStatus) ? nowTime : '-';

    const currentRecord = existingIdx >= 0 ? absensiGuruData[existingIdx] : null;
    const defaultKet = customKeterangan !== undefined 
      ? customKeterangan 
      : (currentRecord?.keterangan || (newStatus === 'Terlambat' ? 'Diabsen manual (Terlambat)' : 'Diabsen manual oleh admin'));

    const updatedEntry = {
      id: currentRecord ? currentRecord.id : `ABSG_${Date.now()}_${nip}`,
      tanggal: date,
      nip,
      jenis: jenisAbsen,
      status: newStatus,
      waktu,
      keterangan: defaultKet,
      metode: 'Manual'
    };

    if (existingIdx >= 0) {
      const newAbsensi = [...absensiGuruData];
      newAbsensi[existingIdx] = updatedEntry;
      setAbsensiGuruData(newAbsensi);
    } else {
      setAbsensiGuruData([...absensiGuruData, updatedEntry]);
    }
  };

  // Update Keterangan Manual Inline
  const handleKeteranganChange = (nip: string, text: string) => {
    const existingIdx = absensiGuruData.findIndex(a => a.nip === nip && a.tanggal === date && a.jenis === jenisAbsen);
    
    if (existingIdx >= 0) {
      const newAbsensi = [...absensiGuruData];
      newAbsensi[existingIdx] = {
        ...newAbsensi[existingIdx],
        keterangan: text
      };
      setAbsensiGuruData(newAbsensi);
    } else {
      // Create new record with status 'Hadir' or 'Izin' if setting note directly
      setAbsensiGuruData([...absensiGuruData, {
        id: `ABSG_${Date.now()}_${nip}`,
        tanggal: date,
        nip,
        jenis: jenisAbsen,
        status: 'Belum diabsen',
        waktu: '-',
        keterangan: text,
        metode: 'Manual'
      }]);
    }
  };

  // Automatic Evaluation for QR Code Scan via QRScannerModal
  const handleScanGuruQR = (rawCode: string) => {
    const cleanCode = rawCode.trim();
    const guru = guruData.find(g => g.nip === cleanCode || (g.id && g.id === cleanCode));
    if (!guru) {
      return {
        success: false,
        type: 'error' as const,
        title: 'Guru Tidak Ditemukan',
        message: `NIP "${cleanCode}" tidak terdaftar dalam data guru.`
      };
    }

    // 1. Check Schedule Constraint
    const jadwalHari = jadwalData.filter(j => j.guru === guru.nama && j.hari === hariIni);
    const adaJadwal = jadwalHari.length > 0;
    let keteranganTambahan = '';

    if (pengaturan.wajibJadwalHariIni && !adaJadwal) {
      keteranganTambahan = ' (Luar Jadwal Mengajar)';
    }

    // 2. Check Scan Operating Hours
    const now = new Date();
    const currentHM = now.toTimeString().slice(0, 5); // "HH:MM"
    const nowTimeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    let calculatedStatus = 'Hadir';
    let autoKeterangan = '';

    if (jenisAbsen === 'Masuk') {
      if (!pengaturan.izinkanScanLuarJam && (currentHM < pengaturan.jamMasukMulai || currentHM > pengaturan.jamMasukAkhir)) {
        return {
          success: false,
          type: 'error' as const,
          title: 'Luar Jam Operasional Scan',
          message: `Jam masuk saat ini (${currentHM}) di luar jam operasional (${pengaturan.jamMasukMulai} - ${pengaturan.jamMasukAkhir}).`
        };
      }

      if (currentHM <= pengaturan.jamMasukBatas) {
        calculatedStatus = 'Hadir';
        autoKeterangan = `Scan QR Masuk (${currentHM})${keteranganTambahan}`;
      } else {
        calculatedStatus = 'Terlambat';
        autoKeterangan = `Terlambat via Scan QR (${currentHM})${keteranganTambahan}`;
      }
    } else {
      // Pulang
      if (!pengaturan.izinkanScanLuarJam && (currentHM < pengaturan.jamPulangMulai || currentHM > pengaturan.jamPulangBatas)) {
        return {
          success: false,
          type: 'error' as const,
          title: 'Belum Waktu Scan Pulang',
          message: `Waktu scan pulang (${currentHM}) di luar jam (${pengaturan.jamPulangMulai} - ${pengaturan.jamPulangBatas}).`
        };
      }
      calculatedStatus = 'Hadir';
      autoKeterangan = `Scan QR Pulang (${currentHM})${keteranganTambahan}`;
    }

    // Record attendance
    const existingIdx = absensiGuruData.findIndex(a => a.nip === guru.nip && a.tanggal === date && a.jenis === jenisAbsen);
    const newEntry = {
      id: existingIdx >= 0 ? absensiGuruData[existingIdx].id : `ABSG_QR_${Date.now()}_${guru.nip}`,
      tanggal: date,
      nip: guru.nip,
      jenis: jenisAbsen,
      status: calculatedStatus,
      waktu: nowTimeStr,
      keterangan: autoKeterangan,
      metode: 'Scan QR'
    };

    if (existingIdx >= 0) {
      const updated = [...absensiGuruData];
      updated[existingIdx] = newEntry;
      setAbsensiGuruData(updated);
    } else {
      setAbsensiGuruData([...absensiGuruData, newEntry]);
    }

    const isTerlambat = calculatedStatus === 'Terlambat';
    const isLuarJadwal = pengaturan.wajibJadwalHariIni && !adaJadwal;

    return {
      success: true,
      type: (isTerlambat || isLuarJadwal) ? 'warning' as const : 'success' as const,
      title: `Absen ${jenisAbsen} ${calculatedStatus}`,
      message: `${guru.nama} (${guru.nip}) • Mapel: ${guru.mapel || '-'} • Waktu: ${nowTimeStr}`
    };
  };


  // Stats calculation
  const stats = {
    total: guruData.length,
    hadir: processedGuruData.filter(g => g.status === 'Hadir').length,
    terlambat: processedGuruData.filter(g => g.status === 'Terlambat').length,
    izin: processedGuruData.filter(g => g.status === 'Izin').length,
    sakit: processedGuruData.filter(g => g.status === 'Sakit').length,
    alpa: processedGuruData.filter(g => g.status === 'Alpa').length,
    belum: processedGuruData.filter(g => g.status === 'Belum diabsen').length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Absensi Guru & Pendidik</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Kelola kehadiran guru via Scan QR otomatis berpatokan jadwal mengajar atau input manual.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setTempPengaturan(pengaturan);
              setIsSettingsModalOpen(true);
            }}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors border border-slate-200"
          >
            <Settings className="w-4 h-4 text-slate-600" />
            <span>Pengaturan Jam Scan</span>
          </button>

          <button 
            onClick={() => setIsScannerOpen(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm flex items-center gap-2 shadow-sm transition-colors"
          >
            <QrCode className="w-4 h-4" />
            <span>Scan QR Code Guru</span>
          </button>
        </div>
      </div>

      {/* Operational Scan Rules Info Banner */}
      <div className="bg-indigo-50/70 border border-indigo-200/80 p-4 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-indigo-900">
        <div className="flex items-start gap-2.5">
          <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-indigo-950">Aturan Jam Scan Aktif ({jenisAbsen}):</span>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-indigo-800">
              <span>⏰ Buka Scan: <strong>{jenisAbsen === 'Masuk' ? pengaturan.jamMasukMulai : pengaturan.jamPulangMulai}</strong></span>
              <span>⚠️ Batas Terlambat: <strong>{jenisAbsen === 'Masuk' ? pengaturan.jamMasukBatas : pengaturan.jamPulangBatas}</strong></span>
              <span>📅 Validasi Jadwal Mengajar: <strong>{pengaturan.wajibJadwalHariIni ? 'Wajib Mengajar Hari Ini' : 'Bebas Semua Guru'}</strong></span>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setTempPengaturan(pengaturan);
            setIsSettingsModalOpen(true);
          }}
          className="text-indigo-700 hover:text-indigo-900 font-bold underline shrink-0"
        >
          Ubah Jam & Toleransi
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div 
          onClick={() => setFilterStatus('Semua')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${filterStatus === 'Semua' ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
        >
          <p className="text-[11px] font-semibold text-slate-400 uppercase">Total Guru</p>
          <h3 className="text-xl font-bold text-slate-800 mt-1">{stats.total}</h3>
        </div>

        <div 
          onClick={() => setFilterStatus('Hadir')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${filterStatus === 'Hadir' ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
        >
          <p className="text-[11px] font-semibold text-emerald-600 uppercase">Hadir (Tepat)</p>
          <h3 className="text-xl font-bold text-emerald-700 mt-1">{stats.hadir}</h3>
        </div>

        <div 
          onClick={() => setFilterStatus('Terlambat')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${filterStatus === 'Terlambat' ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-500/20' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
        >
          <p className="text-[11px] font-semibold text-amber-600 uppercase">Terlambat</p>
          <h3 className="text-xl font-bold text-amber-700 mt-1">{stats.terlambat}</h3>
        </div>

        <div 
          onClick={() => setFilterStatus('Izin')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${filterStatus === 'Izin' ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-500/20' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
        >
          <p className="text-[11px] font-semibold text-blue-600 uppercase">Izin</p>
          <h3 className="text-xl font-bold text-blue-700 mt-1">{stats.izin}</h3>
        </div>

        <div 
          onClick={() => setFilterStatus('Sakit')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${filterStatus === 'Sakit' ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-500/20' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
        >
          <p className="text-[11px] font-semibold text-purple-600 uppercase">Sakit</p>
          <h3 className="text-xl font-bold text-purple-700 mt-1">{stats.sakit}</h3>
        </div>

        <div 
          onClick={() => setFilterStatus('Alpa')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${filterStatus === 'Alpa' ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-500/20' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
        >
          <p className="text-[11px] font-semibold text-rose-600 uppercase">Alpa</p>
          <h3 className="text-xl font-bold text-rose-700 mt-1">{stats.alpa}</h3>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Controls */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 pb-3 border-b border-slate-100">
              <Calendar className="w-4 h-4 text-indigo-600" />
              Filter & Periode Absensi
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Tanggal Absensi</label>
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs font-medium bg-slate-50"
              />
              <p className="text-[11px] text-indigo-600 font-semibold mt-1">Hari: {hariIni}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Jenis Absensi</label>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  type="button"
                  onClick={() => setJenisAbsen('Masuk')}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${jenisAbsen === 'Masuk' ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  Absen Masuk
                </button>
                <button 
                  type="button"
                  onClick={() => setJenisAbsen('Pulang')}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${jenisAbsen === 'Pulang' ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  Absen Pulang
                </button>
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Filter Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
              >
                <option value="Semua">Semua Status</option>
                <option value="Hadir">Hadir</option>
                <option value="Terlambat">Terlambat</option>
                <option value="Izin">Izin</option>
                <option value="Sakit">Sakit</option>
                <option value="Alpa">Alpa</option>
                <option value="Belum diabsen">Belum diabsen</option>
              </select>
            </div>

            <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1.5">
              <div className="flex justify-between">
                <span>Guru Mengajar Hari Ini:</span>
                <span className="font-bold text-slate-800">
                  {processedGuruData.filter(g => g.adaJadwalHariIni).length} Guru
                </span>
              </div>
              <div className="flex justify-between">
                <span>Sudah Diabsen:</span>
                <span className="font-bold text-emerald-600">
                  {processedGuruData.filter(g => g.status !== 'Belum diabsen').length} / {processedGuruData.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Attendance Table */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Search and Table Header */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Cari guru berdasarkan nama, NIP, atau mapel..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5 shrink-0 self-center">
                <span>Metode:</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">QR Scan (Auto)</span>
                <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded font-bold text-[10px]">Manual</span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider">
                    <th className="py-3 px-4">Guru / Pendidik</th>
                    <th className="py-3 px-4">Jadwal Mengajar ({hariIni})</th>
                    <th className="py-3 px-4">Waktu & Metode</th>
                    <th className="py-3 px-4 text-center">Status Kehadiran</th>
                    <th className="py-3 px-4">Keterangan / Catatan Manual</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        Tidak ada data guru yang ditemukan.
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((guru) => (
                      <tr key={guru.nip} className="hover:bg-slate-50/80 transition-colors">
                        {/* Guru Info */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0">
                              {guru.nama.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 line-clamp-1">{guru.nama}</p>
                              <p className="text-[11px] text-slate-500">{guru.nip} • {guru.mapel || 'Guru'}</p>
                            </div>
                          </div>
                        </td>

                        {/* Jadwal Hari Ini */}
                        <td className="py-3 px-4">
                          {guru.adaJadwalHariIni ? (
                            <div className="space-y-1">
                              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded font-semibold text-[11px] inline-flex items-center gap-1">
                                <BookOpen className="w-3 h-3" /> {guru.jadwalHari.length} Jam Mengajar
                              </span>
                              <p className="text-[10px] text-slate-500 line-clamp-1">
                                {guru.jadwalHari.map(j => `${j.kelas}: ${j.mapel}`).join(', ')}
                              </p>
                            </div>
                          ) : (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded font-medium text-[11px]">
                              Tidak Ada Jadwal
                            </span>
                          )}
                        </td>

                        {/* Waktu & Metode */}
                        <td className="py-3 px-4">
                          <div className="space-y-0.5">
                            <p className="font-semibold text-slate-800">{guru.waktu}</p>
                            {guru.metode !== '-' && (
                              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold inline-block ${
                                guru.metode === 'Scan QR' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}>
                                {guru.metode}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Status Buttons */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button 
                              onClick={() => handleStatusChange(guru.nip, 'Hadir')}
                              className={`px-2.5 py-1 rounded-lg font-extrabold text-[11px] transition-all ${
                                guru.status === 'Hadir' ? 'bg-emerald-500 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                              }`}
                              title="Hadir Tepat Waktu"
                            >
                              Hadir
                            </button>
                            <button 
                              onClick={() => handleStatusChange(guru.nip, 'Terlambat')}
                              className={`px-2.5 py-1 rounded-lg font-extrabold text-[11px] transition-all ${
                                guru.status === 'Terlambat' ? 'bg-amber-500 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                              }`}
                              title="Terlambat"
                            >
                              Telat
                            </button>
                            <button 
                              onClick={() => handleStatusChange(guru.nip, 'Izin')}
                              className={`px-2 py-1 rounded-lg font-extrabold text-[11px] transition-all ${
                                guru.status === 'Izin' ? 'bg-blue-500 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                              }`}
                              title="Izin"
                            >
                              Izin
                            </button>
                            <button 
                              onClick={() => handleStatusChange(guru.nip, 'Sakit')}
                              className={`px-2 py-1 rounded-lg font-extrabold text-[11px] transition-all ${
                                guru.status === 'Sakit' ? 'bg-purple-500 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                              }`}
                              title="Sakit"
                            >
                              Sakit
                            </button>
                            <button 
                              onClick={() => handleStatusChange(guru.nip, 'Alpa')}
                              className={`px-2 py-1 rounded-lg font-extrabold text-[11px] transition-all ${
                                guru.status === 'Alpa' ? 'bg-rose-500 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                              }`}
                              title="Alpa / Tanpa Keterangan"
                            >
                              Alpa
                            </button>
                          </div>
                        </td>

                        {/* Keterangan Column */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={guru.keterangan}
                              onChange={(e) => handleKeteranganChange(guru.nip, e.target.value)}
                              placeholder="Tambah keterangan/alasan..."
                              className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                            />
                            {guru.status !== 'Belum diabsen' && guru.status !== 'Hadir' && (
                              <div className="flex gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleKeteranganChange(guru.nip, 'Dinas Luar')}
                                  className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] rounded font-medium"
                                  title="Isi 'Dinas Luar'"
                                >
                                  Dinas
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleKeteranganChange(guru.nip, 'Surat Dokter')}
                                  className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] rounded font-medium"
                                  title="Isi 'Surat Dokter'"
                                >
                                  Dokter
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: PENGATURAN JAM SCAN & ATURAN JADWAL */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-600" />
                Pengaturan Operasional Scan QR Guru
              </h3>
              <button
                onClick={() => setIsSettingsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePengaturan} className="p-6 space-y-4">
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-800 flex items-start gap-2">
                <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  Fitur ini mengatur jendela waktu validasi scan QR guru dan sinkronisasi otomatis dengan jadwal mengajar harian.
                </div>
              </div>

              {/* Switch Validasi Jadwal Mengajar */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-slate-800 block">
                    Validasi Wajib Sesuai Jadwal Mengajar Hari Ini
                  </label>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Guru hanya diperbolehkan scan QR jika terdaftar mengajar pada hari ini ({hariIni}).
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={tempPengaturan.wajibJadwalHariIni}
                  onChange={(e) => setTempPengaturan({ ...tempPengaturan, wajibJadwalHariIni: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 rounded"
                />
              </div>

              {/* Jam Absen Masuk */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Jam Scan Absen Masuk</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Jam Buka Scan</label>
                    <input
                      type="time"
                      value={tempPengaturan.jamMasukMulai}
                      onChange={(e) => setTempPengaturan({ ...tempPengaturan, jamMasukMulai: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Batas Tepat Waktu</label>
                    <input
                      type="time"
                      value={tempPengaturan.jamMasukBatas}
                      onChange={(e) => setTempPengaturan({ ...tempPengaturan, jamMasukBatas: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Batas Maksimal</label>
                    <input
                      type="time"
                      value={tempPengaturan.jamMasukAkhir}
                      onChange={(e) => setTempPengaturan({ ...tempPengaturan, jamMasukAkhir: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Jam Absen Pulang */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Jam Scan Absen Pulang</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Jam Buka Pulang</label>
                    <input
                      type="time"
                      value={tempPengaturan.jamPulangMulai}
                      onChange={(e) => setTempPengaturan({ ...tempPengaturan, jamPulangMulai: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Jam Tutup Pulang</label>
                    <input
                      type="time"
                      value={tempPengaturan.jamPulangBatas}
                      onChange={(e) => setTempPengaturan({ ...tempPengaturan, jamPulangBatas: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Switch Scan Luar Jam */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-slate-800 block">
                    Izinkan Scan di Luar Jam Operasional
                  </label>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Jika diaktifkan, scan di luar jam diperbolehkan dan akan dicatat dengan status 'Terlambat'.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={tempPengaturan.izinkanScanLuarJam}
                  onChange={(e) => setTempPengaturan({ ...tempPengaturan, izinkanScanLuarJam: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 rounded"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
                >
                  Simpan Pengaturan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Scanner Modal for Guru */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        title={`Scan QR Code Absensi Guru (${jenisAbsen})`}
        subtitle="Otomatis mendeteksi QR Code dan mengevaluasi jam kerja & jadwal mengajar"
        manualPlaceholder="Atau ketik NIP guru di sini..."
        onScan={handleScanGuruQR}
      />
    </div>
  );
};
