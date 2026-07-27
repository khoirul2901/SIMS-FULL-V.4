import React, { useState, useMemo } from 'react';
import { 
  HeartHandshake, 
  Search, 
  Plus, 
  Filter, 
  UserCheck, 
  AlertTriangle, 
  FileText, 
  Printer, 
  Edit2, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  X, 
  Calendar, 
  User, 
  MessageSquare, 
  PhoneCall, 
  ShieldAlert, 
  ChevronRight,
  Sparkles,
  TrendingUp,
  Award,
  Clock
} from 'lucide-react';
import Swal from 'sweetalert2';
import { useDatabase } from '../context/DatabaseContext';

export const BimbinganKonseling = () => {
  const { 
    bimbinganData, 
    setBimbinganData, 
    siswaData, 
    pelanggaranData, 
    kelasData,
    guruData 
  } = useDatabase();

  const [activeTab, setActiveTab] = useState<'sesi' | 'monitoring' | 'surat' | 'laporan'>('sesi');
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKelas, setFilterKelas] = useState('');
  const [filterKategori, setFilterKategori] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Sesi BK Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    tanggal: new Date().toISOString().split('T')[0],
    nis: '',
    nama: '',
    kelas: '',
    kategori: 'Belajar',
    jenisLayanan: 'Konseling Individual',
    deskripsiMasalah: '',
    solusi: '',
    tindakLanjut: '',
    konselor: 'Siti Rahmawati, S.Pd (Guru BK)',
    status: 'Dalam Proses',
    statusOrtu: 'Belum Dipanggil'
  });

  // Modal Student Detail History
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<{ nis: string; nama: string; kelas: string } | null>(null);

  // Modal Print Sesi / Surat Panggilan State
  const [printLetterData, setPrintLetterData] = useState<{
    nomorSurat: string;
    tanggalSurat: string;
    hariTanggal: string;
    waktu: string;
    tempat: string;
    nis: string;
    namaSiswa: string;
    kelas: string;
    namaOrtu: string;
    alasan: string;
    konselor: string;
    kepalaSekolah: string;
  } | null>(null);

  // Filtered Sesi Data
  const filteredBimbingan = useMemo(() => {
    return bimbinganData.filter(item => {
      const matchSearch = item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.nis.includes(searchTerm) ||
                          item.deskripsiMasalah.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.solusi.toLowerCase().includes(searchTerm.toLowerCase());
      const matchKelas = !filterKelas || item.kelas === filterKelas;
      const matchKategori = !filterKategori || item.kategori === filterKategori;
      const matchStatus = !filterStatus || item.status === filterStatus;

      return matchSearch && matchKelas && matchKategori && matchStatus;
    });
  }, [bimbinganData, searchTerm, filterKelas, filterKategori, filterStatus]);

  // Point Monitoring per Student
  const studentMonitoringList = useMemo(() => {
    return siswaData.map(siswa => {
      // Calculate total violation points
      const studentViolations = pelanggaranData.filter(p => p.nis === siswa.nis);
      const totalPoin = studentViolations.reduce((sum, item) => sum + (Number(item.poin) || 0), 0);

      // Get counseling history
      const studentCounseling = bimbinganData.filter(b => b.nis === siswa.nis);
      const totalSesi = studentCounseling.length;
      const lastSession = studentCounseling.length > 0 ? studentCounseling[studentCounseling.length - 1] : null;

      // Status level based on violation points
      let statusLevel = { level: 'Aman', color: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300', sp: '-' };
      if (totalPoin >= 76) {
        statusLevel = { level: 'SP3 / Skorsing', color: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300 font-bold', sp: 'SP 3' };
      } else if (totalPoin >= 51) {
        statusLevel = { level: 'SP2 / Pemanggilan Ortuj', color: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-300 font-bold', sp: 'SP 2' };
      } else if (totalPoin >= 31) {
        statusLevel = { level: 'SP1 / Konseling Intensif', color: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300', sp: 'SP 1' };
      } else if (totalPoin >= 16) {
        statusLevel = { level: 'Peringatan Lisan', color: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-950 dark:text-yellow-300', sp: 'Lisan' };
      }

      return {
        nis: siswa.nis,
        nama: siswa.nama,
        kelas: siswa.kelas || '-',
        jenisKelamin: siswa.jenisKelamin || 'L',
        totalPoin,
        totalSesi,
        lastSession,
        statusLevel,
        violations: studentViolations,
        counselings: studentCounseling
      };
    }).filter(s => {
      const matchSearch = s.nama.toLowerCase().includes(searchTerm.toLowerCase()) || s.nis.includes(searchTerm);
      const matchKelas = !filterKelas || s.kelas === filterKelas;
      return matchSearch && matchKelas;
    }).sort((a, b) => b.totalPoin - a.totalPoin);
  }, [siswaData, pelanggaranData, bimbinganData, searchTerm, filterKelas]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const totalSesiBulanIni = bimbinganData.length;
    const butuhOrtuCount = bimbinganData.filter(b => b.status === 'Perlu Pemanggilan Ortuj' || b.statusOrtu === 'Surat Dikirim').length;
    const selesaiCount = bimbinganData.filter(b => b.status === 'Selesai').length;
    const siswaRisikoTinggi = studentMonitoringList.filter(s => s.totalPoin >= 31).length;

    return { totalSesiBulanIni, butuhOrtuCount, selesaiCount, siswaRisikoTinggi };
  }, [bimbinganData, studentMonitoringList]);

  // Open Add / Edit Modal
  const handleOpenModal = (bimbingan?: typeof bimbinganData[0], prefilledSiswa?: { nis: string; nama: string; kelas: string }) => {
    if (bimbingan) {
      setFormData({
        id: bimbingan.id || '',
        tanggal: bimbingan.tanggal || new Date().toISOString().split('T')[0],
        nis: bimbingan.nis || '',
        nama: bimbingan.nama || '',
        kelas: bimbingan.kelas || '',
        kategori: bimbingan.kategori || 'Belajar',
        jenisLayanan: bimbingan.jenisLayanan || 'Konseling Individual',
        deskripsiMasalah: bimbingan.deskripsiMasalah || '',
        solusi: bimbingan.solusi || '',
        tindakLanjut: bimbingan.tindakLanjut || '',
        konselor: bimbingan.konselor || 'Siti Rahmawati, S.Pd (Guru BK)',
        status: bimbingan.status || 'Dalam Proses',
        statusOrtu: bimbingan.statusOrtu || 'Belum Dipanggil'
      });
    } else if (prefilledSiswa) {
      setFormData({
        id: '',
        tanggal: new Date().toISOString().split('T')[0],
        nis: prefilledSiswa.nis,
        nama: prefilledSiswa.nama,
        kelas: prefilledSiswa.kelas,
        kategori: 'Kedisiplinan',
        jenisLayanan: 'Konseling Individual',
        deskripsiMasalah: '',
        solusi: '',
        tindakLanjut: '',
        konselor: 'Siti Rahmawati, S.Pd (Guru BK)',
        status: 'Dalam Proses',
        statusOrtu: 'Belum Dipanggil'
      });
    } else {
      setFormData({
        id: '',
        tanggal: new Date().toISOString().split('T')[0],
        nis: '',
        nama: '',
        kelas: '',
        kategori: 'Belajar',
        jenisLayanan: 'Konseling Individual',
        deskripsiMasalah: '',
        solusi: '',
        tindakLanjut: '',
        konselor: 'Siti Rahmawati, S.Pd (Guru BK)',
        status: 'Dalam Proses',
        statusOrtu: 'Belum Dipanggil'
      });
    }
    setIsModalOpen(true);
  };

  // Handle Select Student in Form
  const handleSelectSiswaInForm = (nis: string) => {
    const s = siswaData.find(item => item.nis === nis);
    if (s) {
      setFormData(prev => ({
        ...prev,
        nis: s.nis,
        nama: s.nama,
        kelas: s.kelas || ''
      }));
    }
  };

  // Save Sesi BK
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nis || !formData.nama) {
      Swal.fire('Error', 'Pilih siswa terlebih dahulu', 'error');
      return;
    }

    if (formData.id) {
      setBimbinganData(bimbinganData.map(b => b.id === formData.id ? formData : b));
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Data sesi bimbingan konseling berhasil diperbarui.',
        timer: 1800,
        showConfirmButton: false
      });
    } else {
      const newRecord = {
        ...formData,
        id: 'BK' + Date.now().toString().slice(-6)
      };
      setBimbinganData([newRecord, ...bimbinganData]);
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Sesi bimbingan konseling baru berhasil dicatat.',
        timer: 1800,
        showConfirmButton: false
      });
    }
    setIsModalOpen(false);
  };

  // Delete Sesi BK
  const handleDelete = (id: string, nama: string) => {
    Swal.fire({
      title: 'Hapus Sesi BK?',
      text: `Apakah Anda yakin ingin menghapus catatan bimbingan untuk ${nama}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        setBimbinganData(bimbinganData.filter(b => b.id !== id));
        Swal.fire('Terhapus!', 'Catatan bimbingan berhasil dihapus.', 'success');
      }
    });
  };

  // Prepare Surat Panggilan Orang Tua
  const handleOpenSuratPanggilan = (siswa: { nis: string; nama: string; kelas: string; totalPoin?: number }) => {
    setActiveTab('surat');
    setPrintLetterData({
      nomorSurat: `421.3/BK-SP/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
      tanggalSurat: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      hariTanggal: 'Senin, 30 Juli 2026',
      waktu: '09.00 WIB',
      tempat: 'Ruang Bimbingan Konseling (BK)',
      nis: siswa.nis,
      namaSiswa: siswa.nama,
      kelas: siswa.kelas,
      namaOrtu: `Orang Tua / Wali dari ${siswa.nama}`,
      alasan: `Konsultasi Perkembangan Disiplin dan Akumulasi Poin Pelanggaran Siswa (${siswa.totalPoin || 0} Poin).`,
      konselor: 'Siti Rahmawati, S.Pd',
      kepalaSekolah: 'Drs. H. Ahmad Dahlan, M.Pd'
    });
  };

  // Print Action
  const handlePrint = () => {
    window.print();
  };

  const classOptions = Array.from(new Set(['VII-A', 'VII-B', 'VIII-A', 'VIII-B', 'IX-A', 'IX-B', ...kelasData.map(k => k.namaKelas)]));

  return (
    <div className="space-y-6 pb-12">
      {/* Header Page */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-xs uppercase tracking-wider">
            <HeartHandshake className="w-4 h-4" />
            <span>Layanan Bimbingan & Konseling</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">Bimbingan Konseling (BK)</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manajemen konseling siswa, penanganan pelanggaran, dan monitoring tumbuh kembang karakter siswa
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all shadow-md shadow-indigo-600/20 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Sesi BK</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 no-print">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Sesi BK</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{metrics.totalSesiBulanIni} Sesi</h3>
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> {metrics.selesaiCount} Selesai Teratasi
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <HeartHandshake className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Panggilan Orang Tua</p>
            <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{metrics.butuhOrtuCount} Kasus</h3>
            <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-1">
              <PhoneCall className="w-3.5 h-3.5" /> Tindak Lanjut Wali/Ortu
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-100 dark:border-amber-900 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <PhoneCall className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Siswa Risiko Tinggi</p>
            <h3 className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">{metrics.siswaRisikoTinggi} Siswa</h3>
            <span className="inline-flex items-center gap-1 text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-1">
              <ShieldAlert className="w-3.5 h-3.5" /> Akumulasi Poin {'>'} 30
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-100 dark:border-rose-900 flex items-center justify-center text-rose-600 dark:text-rose-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Layanan Aktif</p>
            <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">5 Jenis</h3>
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
              <Sparkles className="w-3.5 h-3.5" /> Konseling & Home Visit
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-2 shadow-sm flex flex-wrap gap-1 no-print">
        <button
          onClick={() => setActiveTab('sesi')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all ${
            activeTab === 'sesi'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Sesi Bimbingan & Konseling</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-bold">
            {bimbinganData.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('monitoring')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all ${
            activeTab === 'monitoring'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Monitoring Poin & Perkembangan Siswa</span>
        </button>

        <button
          onClick={() => setActiveTab('surat')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all ${
            activeTab === 'surat'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Cetak Surat Panggilan Orang Tua</span>
        </button>

        <button
          onClick={() => setActiveTab('laporan')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all ${
            activeTab === 'laporan'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          <Printer className="w-4 h-4" />
          <span>Rekap & Laporan BK</span>
        </button>
      </div>

      {/* TAB 1: Sesi Bimbingan & Konseling */}
      {activeTab === 'sesi' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden no-print space-y-0">
          {/* Filters Bar */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col lg:flex-row gap-3 justify-between items-center">
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama siswa, NIS, atau masalah..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              <select
                value={filterKelas}
                onChange={e => setFilterKelas(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Semua Kelas</option>
                {classOptions.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              <select
                value={filterKategori}
                onChange={e => setFilterKategori(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Semua Kategori</option>
                <option value="Belajar">Belajar</option>
                <option value="Kedisiplinan">Kedisiplinan</option>
                <option value="Pribadi">Pribadi</option>
                <option value="Sosial">Sosial</option>
                <option value="Karir">Karir</option>
              </select>

              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Semua Status</option>
                <option value="Dalam Proses">Dalam Proses</option>
                <option value="Perlu Pemanggilan Ortuj">Perlu Pemanggilan Ortuj</option>
                <option value="Selesai">Selesai</option>
              </select>
            </div>
          </div>

          {/* Table Sesi BK */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 uppercase text-[11px] font-bold">
                <tr>
                  <th className="px-5 py-3.5 w-12">No</th>
                  <th className="px-5 py-3.5 w-28">Tanggal</th>
                  <th className="px-5 py-3.5">Nama Siswa / NIS</th>
                  <th className="px-5 py-3.5 w-24">Kelas</th>
                  <th className="px-5 py-3.5 w-28">Kategori</th>
                  <th className="px-5 py-3.5">Deskripsi Masalah & Solusi</th>
                  <th className="px-5 py-3.5 w-32">Status Konseling</th>
                  <th className="px-5 py-3.5 w-28 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredBimbingan.length > 0 ? (
                  filteredBimbingan.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-5 py-4 font-medium text-slate-900 dark:text-slate-100">{index + 1}</td>
                      <td className="px-5 py-4 font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">{item.tanggal}</td>
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-800 dark:text-white">{item.nama}</div>
                        <div className="text-[11px] font-mono text-slate-400">NIS: {item.nis}</div>
                      </td>
                      <td className="px-5 py-4 font-medium">{item.kelas}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                          item.kategori === 'Kedisiplinan' ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300' :
                          item.kategori === 'Belajar' ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300' :
                          item.kategori === 'Pribadi' ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300' :
                          'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}>
                          {item.kategori}
                        </span>
                      </td>
                      <td className="px-5 py-4 max-w-sm">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">{item.deskripsiMasalah}</div>
                        <div className="text-slate-500 dark:text-slate-400 line-clamp-1 text-[11px] italic mt-0.5">
                          Solusi: {item.solusi || '-'}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                          item.status === 'Selesai' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300' :
                          item.status === 'Perlu Pemanggilan Ortuj' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300' :
                          'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenModal(item)}
                            className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors"
                            title="Edit Sesi BK"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.nama)}
                            className="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                            title="Hapus Sesi"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                      Tidak ada catatan sesi bimbingan konseling yang cocok dengan filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Monitoring Perkembangan & Akumulasi Poin Pelanggaran */}
      {activeTab === 'monitoring' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden no-print space-y-0">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row gap-3 justify-between items-center">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari siswa untuk monitoring poin..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Filter Kelas:</label>
              <select
                value={filterKelas}
                onChange={e => setFilterKelas(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Semua Kelas</option>
                {classOptions.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 uppercase text-[11px] font-bold">
                <tr>
                  <th className="px-5 py-3.5 w-12">No</th>
                  <th className="px-5 py-3.5">Nama Siswa / NIS</th>
                  <th className="px-5 py-3.5 w-24">Kelas</th>
                  <th className="px-5 py-3.5 w-28 text-center">Poin Pelanggaran</th>
                  <th className="px-5 py-3.5 w-28 text-center">Sesi BK Recorded</th>
                  <th className="px-5 py-3.5 w-44">Tingkat Penanganan (SP)</th>
                  <th className="px-5 py-3.5 text-right">Aksi Cepat BK</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {studentMonitoringList.length > 0 ? (
                  studentMonitoringList.map((s, index) => (
                    <tr key={s.nis} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-5 py-4 font-medium text-slate-900 dark:text-slate-100">{index + 1}</td>
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-800 dark:text-white">{s.nama}</div>
                        <div className="text-[11px] font-mono text-slate-400">NIS: {s.nis}</div>
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300">{s.kelas}</td>
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-block px-3 py-1 rounded-xl text-xs font-bold ${
                          s.totalPoin >= 51 ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300' :
                          s.totalPoin >= 31 ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300' :
                          s.totalPoin > 0 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300 border border-yellow-300' :
                          'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200'
                        }`}>
                          {s.totalPoin} Poin
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center font-bold text-slate-800 dark:text-slate-200">
                        {s.totalSesi} Sesi
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] border ${s.statusLevel.color}`}>
                          {s.statusLevel.level}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenModal(undefined, { nis: s.nis, nama: s.nama, kelas: s.kelas })}
                            className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 font-semibold rounded-xl text-xs flex items-center gap-1 border border-indigo-200 dark:border-indigo-800 transition-all"
                            title="Buat Sesi Bimbingan"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Bimbingan BK</span>
                          </button>

                          <button
                            onClick={() => handleOpenSuratPanggilan(s)}
                            className="px-3 py-1.5 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 text-amber-700 dark:text-amber-300 font-semibold rounded-xl text-xs flex items-center gap-1 border border-amber-200 dark:border-amber-800 transition-all"
                            title="Cetak Surat Panggilan"
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                            <span>Surat Ortuj</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                      Tidak ada data siswa ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Cetak Surat Panggilan Orang Tua */}
      {activeTab === 'surat' && (
        <div className="space-y-6">
          {/* Controls Bar for Surat */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm no-print space-y-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Pengaturan Surat Panggilan Orang Tua / Wali Siswa</span>
            </h3>

            {printLetterData ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Nomor Surat</label>
                  <input
                    type="text"
                    value={printLetterData.nomorSurat}
                    onChange={e => setPrintLetterData({ ...printLetterData, nomorSurat: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Hari & Tanggal Pertemuan</label>
                  <input
                    type="text"
                    value={printLetterData.hariTanggal}
                    onChange={e => setPrintLetterData({ ...printLetterData, hariTanggal: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Waktu Pertemuan</label>
                  <input
                    type="text"
                    value={printLetterData.waktu}
                    onChange={e => setPrintLetterData({ ...printLetterData, waktu: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Tempat Pertemuan</label>
                  <input
                    type="text"
                    value={printLetterData.tempat}
                    onChange={e => setPrintLetterData({ ...printLetterData, tempat: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Alasan Pemanggilan</label>
                  <input
                    type="text"
                    value={printLetterData.alasan}
                    onChange={e => setPrintLetterData({ ...printLetterData, alasan: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>
            ) : (
              <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs text-indigo-900 dark:text-indigo-300">
                Pilih siswa dari tab <strong>Monitoring Poin & Perkembangan Siswa</strong> atau buat sesi di tab Sesi Bimbingan untuk mencetak Surat Panggilan Orang Tua secara otomatis.
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handlePrint}
                disabled={!printLetterData}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all flex items-center gap-2 shadow-md shadow-indigo-600/20"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak / Download PDF Surat</span>
              </button>
            </div>
          </div>

          {/* Document Preview Printable Area */}
          {printLetterData && (
            <div className="bg-white text-slate-900 p-8 sm:p-12 rounded-2xl shadow-xl max-w-3xl mx-auto border border-slate-200 print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none">
              {/* Kop Surat */}
              <div className="border-b-4 border-double border-slate-900 pb-4 text-center mb-6">
                <h3 className="font-serif text-lg uppercase tracking-wider font-bold">PEMERINTAH KABUPATEN / KOTA</h3>
                <h2 className="font-serif text-2xl uppercase font-black">SEKOLAH MENENGAH PERTAMA (SMP) NEGERI 1</h2>
                <p className="text-xs text-slate-600">Jl. Pendidikan No. 45, Kecamatan Kota, Telp. (021) 555-0192</p>
                <p className="text-xs text-slate-600 italic">Website: www.smpn1contoh.sch.id | Email: bk@smpn1contoh.sch.id</p>
              </div>

              {/* Header Letter */}
              <div className="flex justify-between text-xs mb-6 font-serif">
                <div>
                  <table className="space-y-1">
                    <tbody>
                      <tr>
                        <td className="pr-4 font-semibold">Nomor</td>
                        <td>: {printLetterData.nomorSurat}</td>
                      </tr>
                      <tr>
                        <td className="pr-4 font-semibold">Lampiran</td>
                        <td>: -</td>
                      </tr>
                      <tr>
                        <td className="pr-4 font-semibold">Hal</td>
                        <td>: <strong>Panggilan Orang Tua / Wali Siswa</strong></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="text-right">
                  <p>{printLetterData.tanggalSurat}</p>
                </div>
              </div>

              {/* Recipient */}
              <div className="text-xs font-serif space-y-1 mb-6">
                <p>Kepada Yth.</p>
                <p className="font-bold">{printLetterData.namaOrtu}</p>
                <p>Siswa: <strong>{printLetterData.namaSiswa}</strong> (Kelas {printLetterData.kelas})</p>
                <p>Di Tempat</p>
              </div>

              {/* Body Letter */}
              <div className="text-xs font-serif leading-relaxed space-y-3 mb-8">
                <p>Dengan hormat,</p>
                <p>
                  Sehubungan dengan kegiatan bimbingan dan pembinaan perkembangan siswa di sekolah, kami mengharapkan kehadiran Bapak/Ibu Orang Tua / Wali dari siswa yang bersangkutan pada:
                </p>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 my-4 font-mono">
                  <table className="space-y-1.5 text-xs">
                    <tbody>
                      <tr>
                        <td className="w-32 font-bold">Hari / Tanggal</td>
                        <td>: {printLetterData.hariTanggal}</td>
                      </tr>
                      <tr>
                        <td className="font-bold">Waktu</td>
                        <td>: {printLetterData.waktu}</td>
                      </tr>
                      <tr>
                        <td className="font-bold">Tempat</td>
                        <td>: {printLetterData.tempat}</td>
                      </tr>
                      <tr>
                        <td className="font-bold">Keperluan</td>
                        <td>: {printLetterData.alasan}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p>
                  Demikian surat panggilan ini kami sampaikan. Mengingat pentingnya hal tersebut demi kebaikan dan keberhasilan pendidikan putra/putri Bapak/Ibu, kehadiran tepat pada waktunya sangat kami harapkan.
                </p>
                <p>Atas perhatian dan kerja sama Bapak/Ibu, kami ucapkan terima kasih.</p>
              </div>

              {/* Signatures Area */}
              <div className="grid grid-cols-2 text-xs font-serif text-center pt-8 gap-8">
                <div>
                  <p className="mb-16">Guru Bimbingan Konseling,</p>
                  <p className="font-bold underline">{printLetterData.konselor}</p>
                  <p className="text-[10px] text-slate-500">NIP. 19820412 200801 2 004</p>
                </div>

                <div>
                  <p className="mb-16">Mengetahui,<br/>Kepala Sekolah</p>
                  <p className="font-bold underline">{printLetterData.kepalaSekolah}</p>
                  <p className="text-[10px] text-slate-500">NIP. 19710315 199602 1 001</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Rekapitulasi & Laporan BK */}
      {activeTab === 'laporan' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm no-print space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-700 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">Laporan Rekapitulasi Bimbingan Konseling</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Laporan bulanan/semester penanganan konseling dan bimbingan karakter siswa</p>
            </div>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-all flex items-center gap-2 shadow-md shadow-indigo-600/20"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Laporan Rekap BK</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Ringkasan Berdasarkan Kategori Kasus
              </h4>
              <div className="space-y-2">
                {['Belajar', 'Kedisiplinan', 'Pribadi', 'Sosial', 'Karir'].map(kat => {
                  const count = bimbinganData.filter(b => b.kategori === kat).length;
                  const pct = bimbinganData.length > 0 ? Math.round((count / bimbinganData.length) * 100) : 0;
                  return (
                    <div key={kat} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                        <span>{kat}</span>
                        <span className="font-bold">{count} Sesi ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Ringkasan Status Penanganan Konseling
              </h4>
              <div className="space-y-2">
                {[
                  { status: 'Selesai', color: 'bg-emerald-500' },
                  { status: 'Dalam Proses', color: 'bg-sky-500' },
                  { status: 'Perlu Pemanggilan Ortuj', color: 'bg-amber-500' }
                ].map(st => {
                  const count = bimbinganData.filter(b => b.status === st.status).length;
                  const pct = bimbinganData.length > 0 ? Math.round((count / bimbinganData.length) * 100) : 0;
                  return (
                    <div key={st.status} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                        <span>{st.status}</span>
                        <span className="font-bold">{count} Sesi ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className={`${st.color} h-2 rounded-full`} style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah / Edit Sesi BK */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto no-print">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl my-8 border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                  {formData.id ? 'Edit Catatan Sesi BK' : 'Tambah Sesi Bimbingan Konseling'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Pilih Siswa</label>
                  <select
                    required
                    value={formData.nis}
                    onChange={e => handleSelectSiswaInForm(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="">-- Pilih Siswa --</option>
                    {siswaData.map(s => (
                      <option key={s.nis} value={s.nis}>{s.nama} ({s.kelas}) - NIS: {s.nis}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggal Konseling</label>
                  <input
                    type="date"
                    required
                    value={formData.tanggal}
                    onChange={e => setFormData({ ...formData, tanggal: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Kategori Bimbingan</label>
                  <select
                    value={formData.kategori}
                    onChange={e => setFormData({ ...formData, kategori: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="Belajar">Belajar / Akademik</option>
                    <option value="Kedisiplinan">Kedisiplinan & Tata Tertib</option>
                    <option value="Pribadi">Pribadi / Emosi</option>
                    <option value="Sosial">Sosial / Pergaulan</option>
                    <option value="Karir">Karir & Minat Bakat</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Jenis Layanan</label>
                  <select
                    value={formData.jenisLayanan}
                    onChange={e => setFormData({ ...formData, jenisLayanan: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="Konseling Individual">Konseling Individual</option>
                    <option value="Konseling Kelompok">Konseling Kelompok</option>
                    <option value="Bimbingan Kelompok">Bimbingan Kelompok</option>
                    <option value="Konferensi Kasus">Konferensi Kasus</option>
                    <option value="Home Visit">Home Visit (Kunjungan Rumah)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Deskripsi Permasalahan Siswa</label>
                <textarea
                  required
                  rows={3}
                  value={formData.deskripsiMasalah}
                  onChange={e => setFormData({ ...formData, deskripsiMasalah: e.target.value })}
                  placeholder="Jelaskan detail permasalahan yang dialami atau dilakukan siswa..."
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Solusi & Komitmen Siswa</label>
                <textarea
                  rows={2}
                  value={formData.solusi}
                  onChange={e => setFormData({ ...formData, solusi: e.target.value })}
                  placeholder="Hasil kesepakatan solusi atau komitmen siswa..."
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Rencana Tindak Lanjut Evaluasi</label>
                <input
                  type="text"
                  value={formData.tindakLanjut}
                  onChange={e => setFormData({ ...formData, tindakLanjut: e.target.value })}
                  placeholder="Contoh: Evaluasi perkembangan 1 minggu mendatang..."
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Status Hasil Konseling</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="Dalam Proses">Dalam Proses Bimbingan</option>
                    <option value="Perlu Pemanggilan Ortuj">Perlu Pemanggilan Orang Tua</option>
                    <option value="Selesai">Selesai / Teratasi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Guru Konselor BK</label>
                  <input
                    type="text"
                    value={formData.konselor}
                    onChange={e => setFormData({ ...formData, konselor: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-xs font-semibold rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-indigo-600/20"
                >
                  Simpan Sesi BK
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
