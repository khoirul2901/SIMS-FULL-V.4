import React, { useState, useMemo } from 'react';
import { 
  UserCheck, 
  Users, 
  GraduationCap, 
  Search, 
  Plus, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  BookOpen, 
  HeartHandshake, 
  FileText, 
  Sparkles, 
  Calendar, 
  Printer, 
  Edit3, 
  Trash2, 
  UserPlus, 
  Brain, 
  TrendingUp, 
  Eye, 
  ChevronRight, 
  X, 
  FileCheck,
  Award,
  AlertTriangle,
  Send,
  MoreVertical
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { useAuth } from '../context/AuthContext';
import { GuruWaliAssignment, DiagnostikBK, TindakLanjutWali } from '../types/guruWali';

export const GuruWali: React.FC = () => {
  const { 
    guruWaliAssignments, setGuruWaliAssignments,
    diagnostikBKData, setDiagnostikBKData,
    tindakLanjutWaliData, setTindakLanjutWaliData,
    siswaData, guruData, kelasData, bimbinganData, pelanggaranData, nilaiData
  } = useDatabase();
  const { user } = useAuth();

  // Active Tab State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'alokasi' | 'diagnostik' | 'tindak-lanjut' | 'kartu-binaan'>('dashboard');

  // Filter & Search States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGuru, setFilterGuru] = useState('ALL');
  const [filterKelas, setFilterKelas] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterGayaBelajar, setFilterGayaBelajar] = useState('ALL');

  // Selected Student for Kartu Binaan
  const [selectedSiswaNis, setSelectedSiswaNis] = useState<string>(siswaData[0]?.nis || '');

  // Modals States
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isBulkAssignModalOpen, setIsBulkAssignModalOpen] = useState(false);
  const [isDiagnostikModalOpen, setIsDiagnostikModalOpen] = useState(false);
  const [isTindakLanjutModalOpen, setIsTindakLanjutModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Editing Item States
  const [editingAssignment, setEditingAssignment] = useState<GuruWaliAssignment | null>(null);
  const [editingDiagnostik, setEditingDiagnostik] = useState<DiagnostikBK | null>(null);
  const [editingTindakLanjut, setEditingTindakLanjut] = useState<TindakLanjutWali | null>(null);

  // Form States for Assignment
  const [assignForm, setAssignForm] = useState({
    guruNip: '',
    siswaNis: '',
    catatanAwal: '',
    tahunAjaran: '2026/2027'
  });

  // Bulk Assign Form State
  const [bulkAssignForm, setBulkAssignForm] = useState({
    guruNip: '',
    selectedNisList: [] as string[],
    tahunAjaran: '2026/2027'
  });

  // Form States for Diagnostik BK
  const [diagnostikForm, setDiagnostikForm] = useState<Omit<DiagnostikBK, 'id'>>({
    siswaId: '',
    siswaNis: '',
    siswaNama: '',
    siswaKelas: '',
    tanggalTes: new Date().toISOString().split('T')[0],
    tahunAjaran: '2026/2027',
    gayaBelajar: 'Visual',
    tingkatPemahamanAwal: 'Sedang',
    profilKeluarga: '',
    motivasiBelajar: 'Sangat Tinggi',
    minatBakat: '',
    potensiHambatan: '',
    rekomendasiBK: '',
    konselorNama: user?.name || 'Guru BK',
    statusPenanganan: 'Belum Ditindaklanjuti'
  });

  // Form States for Tindak Lanjut Wali
  const [tindakLanjutForm, setTindakLanjutForm] = useState<Omit<TindakLanjutWali, 'id'>>({
    diagnostikId: '',
    siswaNis: '',
    siswaNama: '',
    siswaKelas: '',
    guruNip: '',
    guruNama: user?.name || '',
    tanggalTindakLanjut: new Date().toISOString().split('T')[0],
    jenisTindakLanjut: 'Konsultasi Belajar',
    deskripsiLaporanBK: '',
    tindakanWali: '',
    hasilBimbingan: '',
    status: 'Dalam Proses Bimbingan',
    jadwalSesiBerikutnya: '',
    catatanKemajuan: ''
  });

  // Computed Stats
  const totalGuruWali = useMemo(() => {
    const uniqueGuru = new Set(guruWaliAssignments.map(a => a.guruNip));
    return uniqueGuru.size;
  }, [guruWaliAssignments]);

  const totalSiswaBinaan = guruWaliAssignments.length;

  const totalSiswaBelumWali = useMemo(() => {
    const assignedNis = new Set(guruWaliAssignments.map(a => a.siswaNis));
    return siswaData.filter(s => !assignedNis.has(s.nis)).length;
  }, [siswaData, guruWaliAssignments]);

  const countBelumTindakLanjut = diagnostikBKData.filter(d => d.statusPenanganan === 'Belum Ditindaklanjuti').length;
  const countDalamProses = tindakLanjutWaliData.filter(t => t.status === 'Dalam Proses Bimbingan').length;
  const countSelesai = tindakLanjutWaliData.filter(t => t.status === 'Selesai / Teratasi').length;

  // Unassigned Students List
  const unassignedStudents = useMemo(() => {
    const assignedNis = new Set(guruWaliAssignments.map(a => a.siswaNis));
    return siswaData.filter(s => !assignedNis.has(s.nis));
  }, [siswaData, guruWaliAssignments]);

  // Handlers for Assignment Modal
  const handleOpenAssignModal = (assignment?: GuruWaliAssignment) => {
    if (assignment) {
      setEditingAssignment(assignment);
      setAssignForm({
        guruNip: assignment.guruNip,
        siswaNis: assignment.siswaNis,
        catatanAwal: assignment.catatanAwal || '',
        tahunAjaran: assignment.tahunAjaran
      });
    } else {
      setEditingAssignment(null);
      setAssignForm({
        guruNip: guruData[0]?.nip || '',
        siswaNis: unassignedStudents[0]?.nis || siswaData[0]?.nis || '',
        catatanAwal: '',
        tahunAjaran: '2026/2027'
      });
    }
    setIsAssignModalOpen(true);
  };

  const handleSaveAssign = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedGuru = guruData.find(g => g.nip === assignForm.guruNip);
    const selectedSiswa = siswaData.find(s => s.nis === assignForm.siswaNis);

    if (!selectedGuru || !selectedSiswa) {
      alert('Pilih Guru dan Siswa yang valid');
      return;
    }

    if (editingAssignment) {
      const updated = guruWaliAssignments.map(a => 
        a.id === editingAssignment.id 
          ? {
              ...a,
              guruId: selectedGuru.id,
              guruNip: selectedGuru.nip,
              guruNama: selectedGuru.nama,
              siswaId: selectedSiswa.id,
              siswaNis: selectedSiswa.nis,
              siswaNama: selectedSiswa.nama,
              siswaKelas: selectedSiswa.kelas,
              catatanAwal: assignForm.catatanAwal,
              tahunAjaran: assignForm.tahunAjaran
            }
          : a
      );
      setGuruWaliAssignments(updated);
    } else {
      const newAssignment: GuruWaliAssignment = {
        id: `GWA${Date.now()}`,
        guruId: selectedGuru.id,
        guruNip: selectedGuru.nip,
        guruNama: selectedGuru.nama,
        siswaId: selectedSiswa.id,
        siswaNis: selectedSiswa.nis,
        siswaNama: selectedSiswa.nama,
        siswaKelas: selectedSiswa.kelas,
        tanggalPenugasan: new Date().toISOString().split('T')[0],
        tahunAjaran: assignForm.tahunAjaran,
        catatanAwal: assignForm.catatanAwal
      };
      setGuruWaliAssignments([...guruWaliAssignments, newAssignment]);
    }
    setIsAssignModalOpen(false);
  };

  const handleDeleteAssignment = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus penugasan Guru Wali ini?')) {
      setGuruWaliAssignments(guruWaliAssignments.filter(a => a.id !== id));
    }
  };

  // Handlers for Bulk Assign Modal
  const handleOpenBulkAssignModal = () => {
    setBulkAssignForm({
      guruNip: guruData[0]?.nip || '',
      selectedNisList: unassignedStudents.map(s => s.nis),
      tahunAjaran: '2026/2027'
    });
    setIsBulkAssignModalOpen(true);
  };

  const handleSaveBulkAssign = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedGuru = guruData.find(g => g.nip === bulkAssignForm.guruNip);
    if (!selectedGuru || bulkAssignForm.selectedNisList.length === 0) {
      alert('Pilih Guru dan minimal 1 siswa');
      return;
    }

    const newAssignments: GuruWaliAssignment[] = bulkAssignForm.selectedNisList.map((nis, idx) => {
      const siswa = siswaData.find(s => s.nis === nis);
      return {
        id: `GWA${Date.now()}_${idx}`,
        guruId: selectedGuru.id,
        guruNip: selectedGuru.nip,
        guruNama: selectedGuru.nama,
        siswaId: siswa?.id || '',
        siswaNis: nis,
        siswaNama: siswa?.nama || '',
        siswaKelas: siswa?.kelas || '',
        tanggalPenugasan: new Date().toISOString().split('T')[0],
        tahunAjaran: bulkAssignForm.tahunAjaran,
        catatanAwal: `Penugasan massal kelompok ${selectedGuru.nama}`
      };
    });

    setGuruWaliAssignments([...guruWaliAssignments, ...newAssignments]);
    setIsBulkAssignModalOpen(false);
  };

  // Handlers for Diagnostik BK Modal
  const handleOpenDiagnostikModal = (diagnostik?: DiagnostikBK) => {
    if (diagnostik) {
      setEditingDiagnostik(diagnostik);
      setDiagnostikForm({ ...diagnostik });
    } else {
      setEditingDiagnostik(null);
      const defaultSiswa = siswaData[0];
      setDiagnostikForm({
        siswaId: defaultSiswa?.id || '',
        siswaNis: defaultSiswa?.nis || '',
        siswaNama: defaultSiswa?.nama || '',
        siswaKelas: defaultSiswa?.kelas || '',
        tanggalTes: new Date().toISOString().split('T')[0],
        tahunAjaran: '2026/2027',
        gayaBelajar: 'Visual',
        tingkatPemahamanAwal: 'Sedang',
        profilKeluarga: 'Keluarga harmonis, perhatian tinggi terhadap pendidikan.',
        motivasiBelajar: 'Sangat Tinggi',
        minatBakat: 'Teknologi dan Sains',
        potensiHambatan: 'Sering merasa cemas pada awal pembelajaran.',
        rekomendasiBK: 'Perlu pendampingan khusus oleh Guru Wali untuk membimbing pola belajar harian.',
        konselorNama: user?.name || 'Siti Rahmawati, S.Pd (Guru BK)',
        statusPenanganan: 'Belum Ditindaklanjuti'
      });
    }
    setIsDiagnostikModalOpen(true);
  };

  const handleSaveDiagnostik = (e: React.FormEvent) => {
    e.preventDefault();
    const siswa = siswaData.find(s => s.nis === diagnostikForm.siswaNis);
    if (!siswa) return;

    const payload = {
      ...diagnostikForm,
      siswaId: siswa.id,
      siswaNama: siswa.nama,
      siswaKelas: siswa.kelas
    };

    if (editingDiagnostik) {
      const updated = diagnostikBKData.map(d => d.id === editingDiagnostik.id ? { ...payload, id: d.id } : d);
      setDiagnostikBKData(updated);
    } else {
      const newDiagnostik: DiagnostikBK = {
        id: `DG${Date.now()}`,
        ...payload
      };
      setDiagnostikBKData([newDiagnostik, ...diagnostikBKData]);
    }
    setIsDiagnostikModalOpen(false);
  };

  // Handlers for Tindak Lanjut Wali Modal
  const handleOpenTindakLanjutFromDiagnostik = (diagnostik: DiagnostikBK) => {
    const assignment = guruWaliAssignments.find(a => a.siswaNis === diagnostik.siswaNis);
    const assignedGuru = guruData.find(g => g.nip === assignment?.guruNip);

    setEditingTindakLanjut(null);
    setTindakLanjutForm({
      diagnostikId: diagnostik.id,
      siswaNis: diagnostik.siswaNis,
      siswaNama: diagnostik.siswaNama,
      siswaKelas: diagnostik.siswaKelas,
      guruNip: assignedGuru?.nip || user?.username || guruData[0]?.nip || '',
      guruNama: assignedGuru?.nama || user?.name || guruData[0]?.nama || '',
      tanggalTindakLanjut: new Date().toISOString().split('T')[0],
      jenisTindakLanjut: 'Konsultasi Belajar',
      deskripsiLaporanBK: diagnostik.rekomendasiBK || diagnostik.potensiHambatan,
      tindakanWali: '',
      hasilBimbingan: '',
      status: 'Dalam Proses Bimbingan',
      jadwalSesiBerikutnya: '',
      catatanKemajuan: ''
    });
    setIsTindakLanjutModalOpen(true);
  };

  const handleOpenTindakLanjutModal = (tindakLanjut?: TindakLanjutWali) => {
    if (tindakLanjut) {
      setEditingTindakLanjut(tindakLanjut);
      setTindakLanjutForm({ ...tindakLanjut });
    } else {
      setEditingTindakLanjut(null);
      const defaultSiswa = siswaData[0];
      const assignment = guruWaliAssignments.find(a => a.siswaNis === defaultSiswa?.nis);
      setTindakLanjutForm({
        diagnostikId: '',
        siswaNis: defaultSiswa?.nis || '',
        siswaNama: defaultSiswa?.nama || '',
        siswaKelas: defaultSiswa?.kelas || '',
        guruNip: assignment?.guruNip || guruData[0]?.nip || '',
        guruNama: assignment?.guruNama || guruData[0]?.nama || '',
        tanggalTindakLanjut: new Date().toISOString().split('T')[0],
        jenisTindakLanjut: 'Konsultasi Belajar',
        deskripsiLaporanBK: 'Catatan rekomendasi pembimbingan dari BK.',
        tindakanWali: '',
        hasilBimbingan: '',
        status: 'Dalam Proses Bimbingan',
        jadwalSesiBerikutnya: '',
        catatanKemajuan: ''
      });
    }
    setIsTindakLanjutModalOpen(true);
  };

  const handleSaveTindakLanjut = (e: React.FormEvent) => {
    e.preventDefault();
    const siswa = siswaData.find(s => s.nis === tindakLanjutForm.siswaNis);
    const guru = guruData.find(g => g.nip === tindakLanjutForm.guruNip);

    if (!siswa) return;

    const payload = {
      ...tindakLanjutForm,
      siswaNama: siswa.nama,
      siswaKelas: siswa.kelas,
      guruNama: guru?.nama || tindakLanjutForm.guruNama
    };

    if (editingTindakLanjut) {
      const updated = tindakLanjutWaliData.map(t => t.id === editingTindakLanjut.id ? { ...payload, id: t.id } : t);
      setTindakLanjutWaliData(updated);
    } else {
      const newTLW: TindakLanjutWali = {
        id: `TLW${Date.now()}`,
        ...payload
      };
      setTindakLanjutWaliData([newTLW, ...tindakLanjutWaliData]);

      // Automatically update Diagnostik BK status if linked
      if (tindakLanjutForm.diagnostikId) {
        setDiagnostikBKData(diagnostikBKData.map(d => 
          d.id === tindakLanjutForm.diagnostikId 
            ? { ...d, statusPenanganan: tindakLanjutForm.status === 'Selesai / Teratasi' ? 'Selesai' : 'Dalam Proses' }
            : d
        ));
      }
    }
    setIsTindakLanjutModalOpen(false);
  };

  // Filtered Datasets
  const filteredAssignments = useMemo(() => {
    return guruWaliAssignments.filter(a => {
      const matchSearch = a.guruNama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          a.siswaNama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          a.siswaNis.includes(searchTerm) ||
                          a.siswaKelas.toLowerCase().includes(searchTerm.toLowerCase());
      const matchGuru = filterGuru === 'ALL' || a.guruNip === filterGuru;
      const matchKelas = filterKelas === 'ALL' || a.siswaKelas === filterKelas;
      return matchSearch && matchGuru && matchKelas;
    });
  }, [guruWaliAssignments, searchTerm, filterGuru, filterKelas]);

  const filteredDiagnostik = useMemo(() => {
    return diagnostikBKData.filter(d => {
      const matchSearch = d.siswaNama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          d.siswaNis.includes(searchTerm) ||
                          d.siswaKelas.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          d.gayaBelajar.toLowerCase().includes(searchTerm.toLowerCase());
      const matchGaya = filterGayaBelajar === 'ALL' || d.gayaBelajar === filterGayaBelajar;
      const matchStatus = filterStatus === 'ALL' || d.statusPenanganan === filterStatus;
      const matchKelas = filterKelas === 'ALL' || d.siswaKelas === filterKelas;
      return matchSearch && matchGaya && matchStatus && matchKelas;
    });
  }, [diagnostikBKData, searchTerm, filterGayaBelajar, filterStatus, filterKelas]);

  const filteredTindakLanjut = useMemo(() => {
    return tindakLanjutWaliData.filter(t => {
      const matchSearch = t.siswaNama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.siswaNis.includes(searchTerm) ||
                          t.guruNama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.jenisTindakLanjut.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = filterStatus === 'ALL' || t.status === filterStatus;
      const matchGuru = filterGuru === 'ALL' || t.guruNip === filterGuru;
      return matchSearch && matchStatus && matchGuru;
    });
  }, [tindakLanjutWaliData, searchTerm, filterStatus, filterGuru]);

  // Selected Student Details for Kartu Binaan
  const currentKartuSiswa = useMemo(() => {
    return siswaData.find(s => s.nis === selectedSiswaNis);
  }, [siswaData, selectedSiswaNis]);

  const currentGuruWali = useMemo(() => {
    const assign = guruWaliAssignments.find(a => a.siswaNis === selectedSiswaNis);
    return assign ? guruData.find(g => g.nip === assign.guruNip) || { nama: assign.guruNama, nip: assign.guruNip } : null;
  }, [guruWaliAssignments, selectedSiswaNis, guruData]);

  const currentDiagnostik = useMemo(() => {
    return diagnostikBKData.find(d => d.siswaNis === selectedSiswaNis);
  }, [diagnostikBKData, selectedSiswaNis]);

  const currentTindakLanjutList = useMemo(() => {
    return tindakLanjutWaliData.filter(t => t.siswaNis === selectedSiswaNis);
  }, [tindakLanjutWaliData, selectedSiswaNis]);

  const currentPelanggaranList = useMemo(() => {
    return pelanggaranData.filter(p => p.nis === selectedSiswaNis);
  }, [pelanggaranData, selectedSiswaNis]);

  const currentBimbinganBKList = useMemo(() => {
    return bimbinganData.filter(b => b.nis === selectedSiswaNis);
  }, [bimbinganData, selectedSiswaNis]);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header Title Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <UserCheck className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Program Guru Wali & Mentoring Siswa</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Tindak Lanjut Terpadu Hasil Laporan Diagnostik Guru BK oleh Guru Wali / Mentor
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl text-sm font-medium transition-colors"
          >
            <Printer className="w-4 h-4" />
            Cetak Laporan
          </button>
          <button
            onClick={handleOpenBulkAssignModal}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium shadow-sm transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Alokasi Massal (&gt;10 Siswa)
          </button>
          <button
            onClick={() => handleOpenAssignModal()}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Tambah Penugasan Wali
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Total Guru Wali</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalGuruWali} Guru</h3>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> Mengampu {totalSiswaBinaan} Siswa
            </p>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Siswa Belum Ada Wali</p>
            <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{totalSiswaBelumWali} Siswa</h3>
            <p className="text-xs text-gray-500 mt-1">Perlu alokasi penugasan</p>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Diagnostik Perlu Tindak Lanjut</p>
            <h3 className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">{countBelumTindakLanjut} Laporan</h3>
            <p className="text-xs text-rose-500 mt-1">Rekomendasi baru dari BK</p>
          </div>
          <div className="p-3 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl">
            <Brain className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Bimbingan Selesai / Teratasi</p>
            <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{countSelesai} Siswa</h3>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Progress positif terbukti
            </p>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-2 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'dashboard'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Ringkasan & Matrix Guru Wali
        </button>

        <button
          onClick={() => setActiveTab('alokasi')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'alokasi'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          Penugasan Siswa ({guruWaliAssignments.length})
        </button>

        <button
          onClick={() => setActiveTab('diagnostik')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'diagnostik'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <Brain className="w-4 h-4" />
          Laporan Tes Diagnostik BK ({diagnostikBKData.length})
        </button>

        <button
          onClick={() => setActiveTab('tindak-lanjut')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'tindak-lanjut'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          Jurnal Tindak Lanjut Wali ({tindakLanjutWaliData.length})
        </button>

        <button
          onClick={() => setActiveTab('kartu-binaan')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'kartu-binaan'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          Kartu Binaan Siswa Terpadu
        </button>
      </div>

      {/* TAB 1: DASHBOARD & MATRIX */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Matrix Card per Guru Wali */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  Daftar Guru Wali & Kelompok Binaan (Bisa &gt; 10 Siswa per Guru)
                </h2>
                <span className="text-xs text-gray-500">{guruData.length} Guru Terdaftar di Sistem</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {guruData.map((guru) => {
                  const binaanList = guruWaliAssignments.filter(a => a.guruNip === guru.nip);
                  const count = binaanList.length;

                  return (
                    <div 
                      key={guru.id} 
                      className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 rounded-md">
                            {guru.mapel}
                          </span>
                          <h3 className="text-base font-bold text-gray-900 dark:text-white mt-1.5">{guru.nama}</h3>
                          <p className="text-xs text-gray-500">NIP: {guru.nip}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{count}</span>
                          <span className="text-xs text-gray-500 block">Siswa Binaan</span>
                        </div>
                      </div>

                      {/* List of Mentored Students Chips */}
                      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Anggota Kelompok Binaan:</p>
                        {count === 0 ? (
                          <p className="text-xs italic text-gray-400">Belum ada siswa yang dialokasikan</p>
                        ) : (
                          <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                            {binaanList.map((b) => (
                              <button
                                key={b.id}
                                onClick={() => {
                                  setSelectedSiswaNis(b.siswaNis);
                                  setActiveTab('kartu-binaan');
                                }}
                                className="text-xs bg-gray-50 dark:bg-gray-700/60 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-gray-700 dark:text-gray-300 hover:text-indigo-600 px-2.5 py-1 rounded-lg border border-gray-200/80 dark:border-gray-600 transition-colors flex items-center gap-1"
                              >
                                <span className="font-medium">{b.siswaNama}</span>
                                <span className="text-[10px] text-gray-400">({b.siswaKelas})</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-2 flex items-center justify-between text-xs">
                        <span className="text-gray-400">Kapasitas: Maksimal 30+ Siswa</span>
                        <button
                          onClick={() => {
                            setFilterGuru(guru.nip);
                            setActiveTab('alokasi');
                          }}
                          className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1"
                        >
                          Kelola Siswa <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right 1 Col: Gaya Belajar & Unassigned Alert */}
            <div className="space-y-6">
              {/* Unassigned Students Notice */}
              {unassignedStudents.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-5">
                  <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    Siswa Belum Memiliki Guru Wali ({unassignedStudents.length})
                  </div>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mt-2">
                    Terdapat {unassignedStudents.length} siswa baru/lama yang belum mendapatkan alokasi pembimbingan dari Guru Wali.
                  </p>
                  <button
                    onClick={handleOpenBulkAssignModal}
                    className="mt-3 w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
                  >
                    Lakukan Alokasi Penugasan Sekarang
                  </button>
                </div>
              )}

              {/* Gaya Belajar Distribution */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-indigo-600" />
                  Distribusi Gaya Belajar (Hasil Diagnostik BK)
                </h3>
                
                <div className="space-y-3">
                  {[
                    { style: 'Visual', color: 'bg-blue-500', count: diagnostikBKData.filter(d => d.gayaBelajar === 'Visual').length },
                    { style: 'Auditori', color: 'bg-emerald-500', count: diagnostikBKData.filter(d => d.gayaBelajar === 'Auditori').length },
                    { style: 'Kinestetik', color: 'bg-amber-500', count: diagnostikBKData.filter(d => d.gayaBelajar === 'Kinestetik').length },
                    { style: 'Campuran', color: 'bg-purple-500', count: diagnostikBKData.filter(d => d.gayaBelajar === 'Campuran').length },
                  ].map((item) => (
                    <div key={item.style} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-gray-700 dark:text-gray-300">{item.style}</span>
                        <span className="text-gray-500">{item.count} Siswa ({Math.round((item.count / (diagnostikBKData.length || 1)) * 100)}%)</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`${item.color} h-full rounded-full transition-all duration-500`} 
                          style={{ width: `${(item.count / (diagnostikBKData.length || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Guide Box */}
              <div className="bg-indigo-900 text-white rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-indigo-200 font-bold text-sm">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  Mekanisme Pembimbingan Wali
                </div>
                <ol className="text-xs text-indigo-100 space-y-2 list-decimal list-inside leading-relaxed">
                  <li><strong>Guru BK</strong> memasukkan hasil Tes Diagnostik Kognitif/Non-Kognitif & Rekomendasi Laporan per siswa.</li>
                  <li><strong>Sistem / Admin</strong> mengalokasikan siswa ke Guru Wali (&gt;10 siswa per guru wali).</li>
                  <li><strong>Guru Wali</strong> membaca laporan diagnostik dan melakukan tindakan bimbingan berkala.</li>
                  <li>Semua catatan jurnal tindak lanjut dapat diakses oleh Kepala Sekolah & Guru BK.</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ALOKASI & PENUGASAN GURU WALI */}
      {activeTab === 'alokasi' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Penugasan & Alokasi Guru Wali</h2>
              <p className="text-xs text-gray-500">Setiap guru terdaftar dapat mengampu lebih dari 10 siswa binaan</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari guru, siswa, kelas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <select
                value={filterGuru}
                onChange={(e) => setFilterGuru(e.target.value)}
                className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-700 dark:text-gray-200"
              >
                <option value="ALL">Semua Guru Wali</option>
                {guruData.map(g => (
                  <option key={g.id} value={g.nip}>{g.nama}</option>
                ))}
              </select>

              <select
                value={filterKelas}
                onChange={(e) => setFilterKelas(e.target.value)}
                className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-700 dark:text-gray-200"
              >
                <option value="ALL">Semua Kelas</option>
                {kelasData.map(k => (
                  <option key={k.id} value={k.namaKelas}>{k.namaKelas}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table Assignments */}
          <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-xl">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 uppercase text-[11px] tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-3">No</th>
                  <th className="px-4 py-3">Guru Wali (Mentor)</th>
                  <th className="px-4 py-3">Siswa Binaan</th>
                  <th className="px-4 py-3">Kelas</th>
                  <th className="px-4 py-3">Tahun Ajaran</th>
                  <th className="px-4 py-3">Catatan Awal Wali</th>
                  <th className="px-4 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredAssignments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-400 italic">
                      Tidak ada data penugasan Guru Wali yang sesuai dengan filter.
                    </td>
                  </tr>
                ) : (
                  filteredAssignments.map((a, idx) => (
                    <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                      <td className="px-4 py-3 text-gray-500 font-medium">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-gray-900 dark:text-white">{a.guruNama}</div>
                        <div className="text-xs text-gray-400">NIP: {a.guruNip}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-800 dark:text-gray-200">{a.siswaNama}</div>
                        <div className="text-xs text-gray-400">NIS: {a.siswaNis}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-semibold">
                          {a.siswaKelas}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300 text-xs">{a.tahunAjaran}</td>
                      <td className="px-4 py-3 text-xs text-gray-500 max-w-xs truncate">
                        {a.catatanAwal || '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedSiswaNis(a.siswaNis);
                              setActiveTab('kartu-binaan');
                            }}
                            title="Lihat Kartu Binaan"
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenAssignModal(a)}
                            title="Edit Penugasan"
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAssignment(a.id)}
                            title="Hapus Penugasan"
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: LAPORAN DIAGNOSTIK BK */}
      {activeTab === 'diagnostik' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-600" />
                Laporan Hasil Tes Diagnostik Siswa (Oleh Guru BK)
              </h2>
              <p className="text-xs text-gray-500">
                Profil belajar, potensi hambatan, dan rekomendasi khusus untuk ditindaklanjuti oleh Guru Wali
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[220px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari siswa/gaya belajar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <select
                value={filterGayaBelajar}
                onChange={(e) => setFilterGayaBelajar(e.target.value)}
                className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-700 dark:text-gray-200"
              >
                <option value="ALL">Semua Gaya Belajar</option>
                <option value="Visual">Visual</option>
                <option value="Auditori">Auditori</option>
                <option value="Kinestetik">Kinestetik</option>
                <option value="Campuran">Campuran</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-700 dark:text-gray-200"
              >
                <option value="ALL">Semua Status Penanganan</option>
                <option value="Belum Ditindaklanjuti">Belum Ditindaklanjuti</option>
                <option value="Dalam Proses">Dalam Proses</option>
                <option value="Selesai">Selesai</option>
              </select>

              <button
                onClick={() => handleOpenDiagnostikModal()}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Input Diagnostik BK Baru
              </button>
            </div>
          </div>

          {/* Cards List for Diagnostik BK */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDiagnostik.length === 0 ? (
              <div className="col-span-2 text-center py-10 text-gray-400 italic">
                Belum ada data laporan diagnostik BK yang cocok.
              </div>
            ) : (
              filteredDiagnostik.map((diag) => {
                const assignedWali = guruWaliAssignments.find(a => a.siswaNis === diag.siswaNis);

                return (
                  <div key={diag.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-base text-gray-900 dark:text-white">{diag.siswaNama}</span>
                          <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded font-medium">
                            {diag.siswaKelas}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">NIS: {diag.siswaNis} • Tanggal Tes: {diag.tanggalTes}</span>
                      </div>

                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                        diag.statusPenanganan === 'Selesai' 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                          : diag.statusPenanganan === 'Dalam Proses'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
                      }`}>
                        {diag.statusPenanganan}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 dark:bg-gray-700/40 p-3 rounded-xl">
                      <div>
                        <span className="text-gray-400 block">Gaya Belajar:</span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">{diag.gayaBelajar}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">Pemahaman Awal:</span>
                        <span className="font-bold text-gray-800 dark:text-gray-200">{diag.tingkatPemahamanAwal}</span>
                      </div>
                      <div className="col-span-2 pt-1">
                        <span className="text-gray-400 block">Minat & Bakat:</span>
                        <span className="text-gray-700 dark:text-gray-300 font-medium">{diag.minatBakat || '-'}</span>
                      </div>
                    </div>

                    <div className="text-xs space-y-1">
                      <p className="font-semibold text-rose-600 dark:text-rose-400">Potensi Hambatan:</p>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{diag.potensiHambatan}</p>
                    </div>

                    <div className="text-xs space-y-1 bg-indigo-50/60 dark:bg-indigo-900/20 p-3 rounded-xl border border-indigo-100 dark:border-indigo-800">
                      <p className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1">
                        <HeartHandshake className="w-3.5 h-3.5" /> Rekomendasi Guru BK:
                      </p>
                      <p className="text-indigo-800 dark:text-indigo-200 leading-relaxed">{diag.rekomendasiBK}</p>
                      <p className="text-[10px] text-indigo-400 pt-1">Oleh Konselor: {diag.konselorNama}</p>
                    </div>

                    <div className="pt-2 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-gray-400">Guru Wali: </span>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                          {assignedWali ? assignedWali.guruNama : '(Belum Ditunjuk)'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenDiagnostikModal(diag)}
                          className="px-2.5 py-1 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleOpenTindakLanjutFromDiagnostik(diag)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-sm transition-colors"
                        >
                          <Send className="w-3 h-3" />
                          Tindak Lanjuti
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 4: JURNAL TINDAK LANJUT WALI */}
      {activeTab === 'tindak-lanjut' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-indigo-600" />
                Jurnal & Histori Tindak Lanjut Guru Wali
              </h2>
              <p className="text-xs text-gray-500">Catatan pelaksanaan bimbingan, komitmen siswa, dan kemajuan penanganan</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[220px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari siswa/guru wali..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-700 dark:text-gray-200"
              >
                <option value="ALL">Semua Status Bimbingan</option>
                <option value="Perlu Tindak Lanjut">Perlu Tindak Lanjut</option>
                <option value="Dalam Proses Bimbingan">Dalam Proses Bimbingan</option>
                <option value="Selesai / Teratasi">Selesai / Teratasi</option>
                <option value="Dirujuk Kembali ke BK">Dirujuk Kembali ke BK</option>
              </select>

              <button
                onClick={() => handleOpenTindakLanjutModal()}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Input Catatan Bimbingan Wali
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-xl">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 uppercase text-[11px] tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">Siswa Binaan</th>
                  <th className="px-4 py-3">Guru Wali</th>
                  <th className="px-4 py-3">Jenis Bimbingan</th>
                  <th className="px-4 py-3">Tindakan Wali</th>
                  <th className="px-4 py-3">Catatan Kemajuan</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredTindakLanjut.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-400 italic">
                      Belum ada catatan jurnal tindak lanjut wali yang sesuai.
                    </td>
                  </tr>
                ) : (
                  filteredTindakLanjut.map((tl) => (
                    <tr key={tl.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{tl.tanggalTindakLanjut}</td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-gray-900 dark:text-white">{tl.siswaNama}</div>
                        <div className="text-xs text-gray-400">{tl.siswaKelas} • {tl.siswaNis}</div>
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold text-gray-800 dark:text-gray-200">
                        {tl.guruNama}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-xs font-medium">
                          {tl.jenisTindakLanjut}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-700 dark:text-gray-300 max-w-xs leading-relaxed">
                        {tl.tindakanWali}
                      </td>
                      <td className="px-4 py-3 text-xs text-emerald-700 dark:text-emerald-400 font-medium max-w-xs">
                        {tl.catatanKemajuan || '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                          tl.status === 'Selesai / Teratasi'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                            : tl.status === 'Dalam Proses Bimbingan'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                        }`}>
                          {tl.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleOpenTindakLanjutModal(tl)}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: KARTU BINAAN SISWA TERPADU */}
      {activeTab === 'kartu-binaan' && (
        <div className="space-y-6">
          {/* Student Selector Bar */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <GraduationCap className="w-6 h-6 text-indigo-600" />
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Pilih Siswa Binaan untuk Melihat Rapor Pembimbingan</h2>
                <p className="text-xs text-gray-500">Rekapitulasi 360-derajat diagnostik BK, tindak lanjut wali, pelanggaran, dan akademik</p>
              </div>
            </div>

            <select
              value={selectedSiswaNis}
              onChange={(e) => setSelectedSiswaNis(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-semibold text-gray-800 dark:text-gray-100 min-w-[280px]"
            >
              {siswaData.map((s) => (
                <option key={s.id} value={s.nis}>
                  {s.nama} ({s.kelas} - {s.nis})
                </option>
              ))}
            </select>
          </div>

          {currentKartuSiswa ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Student Profile & Guru Wali & Diagnostik BK */}
              <div className="space-y-6">
                {/* Profile Box */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-md">
                      {currentKartuSiswa.nama.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{currentKartuSiswa.nama}</h3>
                      <p className="text-xs text-gray-500">NIS: {currentKartuSiswa.nis} • NISN: {currentKartuSiswa.nisn || '-'}</p>
                      <span className="inline-block mt-1 px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 rounded font-semibold text-xs">
                        Kelas {currentKartuSiswa.kelas}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 dark:border-gray-700 text-xs space-y-2 text-gray-600 dark:text-gray-300">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Guru Wali:</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        {currentGuruWali ? currentGuruWali.nama : 'Belum Ditunjuk'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Alamat:</span>
                      <span>{currentKartuSiswa.alamat || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Kontak Orang Tua:</span>
                      <span>{currentKartuSiswa.noHp || '-'} ({currentKartuSiswa.namaAyah || 'Ortu'})</span>
                    </div>
                  </div>
                </div>

                {/* Diagnostic Test Profile */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm space-y-3">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Brain className="w-4 h-4 text-indigo-600" />
                    Profil Diagnostik BK Siswa
                  </h3>

                  {currentDiagnostik ? (
                    <div className="space-y-3 text-xs">
                      <div className="grid grid-cols-2 gap-2 bg-gray-50 dark:bg-gray-700/40 p-3 rounded-xl">
                        <div>
                          <span className="text-gray-400 block">Gaya Belajar:</span>
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">{currentDiagnostik.gayaBelajar}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block">Pemahaman Awal:</span>
                          <span className="font-bold text-gray-800 dark:text-gray-200">{currentDiagnostik.tingkatPemahamanAwal}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-gray-400 font-semibold block mb-0.5">Minat & Bakat:</span>
                        <p className="text-gray-700 dark:text-gray-300">{currentDiagnostik.minatBakat || '-'}</p>
                      </div>

                      <div>
                        <span className="text-rose-600 font-semibold block mb-0.5">Potensi Hambatan:</span>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{currentDiagnostik.potensiHambatan}</p>
                      </div>

                      <div className="p-3 bg-indigo-50/70 dark:bg-indigo-900/30 rounded-xl border border-indigo-100 dark:border-indigo-800">
                        <span className="font-bold text-indigo-900 dark:text-indigo-300 block mb-1">Catatan Rekomendasi Guru BK:</span>
                        <p className="text-indigo-800 dark:text-indigo-200 leading-relaxed">{currentDiagnostik.rekomendasiBK}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400 italic py-4 text-center">
                      Belum ada laporan tes diagnostik BK untuk siswa ini.
                    </div>
                  )}
                </div>
              </div>

              {/* Right 2 Columns: Timeline of Mentoring Actions & Integrated History */}
              <div className="lg:col-span-2 space-y-6">
                {/* Mentoring Log Timeline */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <FileCheck className="w-5 h-5 text-indigo-600" />
                      Histori Tindak Lanjut Pembimbingan Wali ({currentTindakLanjutList.length})
                    </h3>
                    <button
                      onClick={() => handleOpenTindakLanjutModal()}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Input Bimbingan
                    </button>
                  </div>

                  {currentTindakLanjutList.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 italic text-xs">
                      Belum ada histori tindak lanjut bimbingan yang dicatat oleh Guru Wali untuk siswa ini.
                    </div>
                  ) : (
                    <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-indigo-100 dark:before:bg-indigo-900">
                      {currentTindakLanjutList.map((t) => (
                        <div key={t.id} className="relative pl-8 space-y-1">
                          <div className="absolute left-1.5 top-1.5 w-3 h-3 bg-indigo-600 rounded-full border-2 border-white dark:border-gray-800" />
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-900 dark:text-white">{t.tanggalTindakLanjut} • {t.jenisTindakLanjut}</span>
                            <span className="text-[11px] px-2 py-0.5 rounded-md font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                              {t.status}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Tindakan Guru Wali:</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/40 p-3 rounded-xl">{t.tindakanWali}</p>

                          {t.catatanKemajuan && (
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium pt-1">
                              ✓ Kemajuan: {t.catatanKemajuan}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Integrated Records (Pelanggaran & BK) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Pelanggaran Record */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm space-y-3">
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      Catatan Pelanggaran ({currentPelanggaranList.length})
                    </h4>
                    {currentPelanggaranList.length === 0 ? (
                      <p className="text-xs text-emerald-600 font-medium">Siswa tidak memiliki catatan pelanggaran.</p>
                    ) : (
                      <div className="space-y-2 text-xs">
                        {currentPelanggaranList.map((p) => (
                          <div key={p.id} className="p-2.5 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 rounded-xl">
                            <div className="flex justify-between font-bold text-rose-800 dark:text-rose-300">
                              <span>{p.pelanggaran}</span>
                              <span>+{p.poin} Poin</span>
                            </div>
                            <span className="text-[10px] text-gray-500 block mt-0.5">{p.tanggal} • Pelapor: {p.pelapor}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Konseling BK Record */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm space-y-3">
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
                      <HeartHandshake className="w-4 h-4 text-indigo-500" />
                      Layanan Bimbingan BK ({currentBimbinganBKList.length})
                    </h4>
                    {currentBimbinganBKList.length === 0 ? (
                      <p className="text-xs text-gray-400">Belum ada riwayat layanan BK umum.</p>
                    ) : (
                      <div className="space-y-2 text-xs">
                        {currentBimbinganBKList.map((b) => (
                          <div key={b.id} className="p-2.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                            <div className="font-bold text-indigo-900 dark:text-indigo-200">{b.jenisLayanan} ({b.kategori})</div>
                            <p className="text-gray-600 dark:text-gray-300 mt-1">{b.deskripsiMasalah}</p>
                            <span className="text-[10px] text-gray-400 block mt-1">{b.tanggal} • Status: {b.status}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-gray-400">Pilih siswa di atas untuk menampilkan Kartu Binaan.</div>
          )}
        </div>
      )}

      {/* MODAL 1: ASSIGN GURU WALI (INDIVIDUAL) */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 dark:border-gray-700 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                {editingAssignment ? 'Edit Penugasan Guru Wali' : 'Penugasan Guru Wali Baru'}
              </h3>
              <button onClick={() => setIsAssignModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAssign} className="space-y-4 text-sm">
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Guru Wali (Mentor)</label>
                <select
                  value={assignForm.guruNip}
                  onChange={(e) => setAssignForm({ ...assignForm, guruNip: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl"
                  required
                >
                  {guruData.map(g => (
                    <option key={g.id} value={g.nip}>{g.nama} ({g.mapel})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Siswa Binaan</label>
                <select
                  value={assignForm.siswaNis}
                  onChange={(e) => setAssignForm({ ...assignForm, siswaNis: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl"
                  required
                >
                  {siswaData.map(s => (
                    <option key={s.id} value={s.nis}>{s.nama} ({s.kelas} - NIS: {s.nis})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Tahun Ajaran</label>
                <input
                  type="text"
                  value={assignForm.tahunAjaran}
                  onChange={(e) => setAssignForm({ ...assignForm, tahunAjaran: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Catatan Fokus Awal Wali</label>
                <textarea
                  rows={3}
                  placeholder="misal: Fokus adaptasi belajar, pendampingan matematika, dll."
                  value={assignForm.catatanAwal}
                  onChange={(e) => setAssignForm({ ...assignForm, catatanAwal: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-sm"
                >
                  Simpan Penugasan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: BULK ASSIGN (MASSAL >10 SISWA) */}
      {isBulkAssignModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-xl w-full p-6 shadow-xl border border-gray-100 dark:border-gray-700 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-600" />
                Alokasi Massal Guru Wali (&gt;10 Siswa Sekaligus)
              </h3>
              <button onClick={() => setIsBulkAssignModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBulkAssign} className="space-y-4 text-sm">
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Pilih Guru Wali Penanggung Jawab</label>
                <select
                  value={bulkAssignForm.guruNip}
                  onChange={(e) => setBulkAssignForm({ ...bulkAssignForm, guruNip: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl font-semibold text-gray-800 dark:text-gray-100"
                  required
                >
                  {guruData.map(g => {
                    const count = guruWaliAssignments.filter(a => a.guruNip === g.nip).length;
                    return (
                      <option key={g.id} value={g.nip}>
                        {g.nama} (Saat ini mengampu {count} siswa)
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-gray-700 dark:text-gray-300">
                    Pilih Siswa yang Belum Memiliki Wali ({unassignedStudents.length} Tersedia)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (bulkAssignForm.selectedNisList.length === unassignedStudents.length) {
                        setBulkAssignForm({ ...bulkAssignForm, selectedNisList: [] });
                      } else {
                        setBulkAssignForm({ ...bulkAssignForm, selectedNisList: unassignedStudents.map(s => s.nis) });
                      }
                    }}
                    className="text-xs text-indigo-600 font-semibold hover:underline"
                  >
                    {bulkAssignForm.selectedNisList.length === unassignedStudents.length ? 'Batal Semua' : 'Pilih Semua'}
                  </button>
                </div>

                <div className="max-h-52 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-xl p-3 space-y-2 bg-gray-50/50 dark:bg-gray-700/30">
                  {unassignedStudents.length === 0 ? (
                    <p className="text-xs text-emerald-600 font-medium py-2 text-center">
                      Semua siswa sudah berhasil dialokasikan ke Guru Wali!
                    </p>
                  ) : (
                    unassignedStudents.map(s => (
                      <label key={s.id} className="flex items-center gap-2 text-xs text-gray-800 dark:text-gray-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={bulkAssignForm.selectedNisList.includes(s.nis)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setBulkAssignForm({
                                ...bulkAssignForm,
                                selectedNisList: [...bulkAssignForm.selectedNisList, s.nis]
                              });
                            } else {
                              setBulkAssignForm({
                                ...bulkAssignForm,
                                selectedNisList: bulkAssignForm.selectedNisList.filter(n => n !== s.nis)
                              });
                            }
                          }}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="font-bold">{s.nama}</span>
                        <span className="text-gray-400">({s.kelas} - NIS: {s.nis})</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBulkAssignModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={bulkAssignForm.selectedNisList.length === 0}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium shadow-sm disabled:opacity-50"
                >
                  Alokasikan {bulkAssignForm.selectedNisList.length} Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: INPUT DIAGNOSTIK BK */}
      {isDiagnostikModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-100 dark:border-gray-700 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-600" />
                {editingDiagnostik ? 'Edit Diagnostik BK' : 'Input Hasil Tes Diagnostik BK'}
              </h3>
              <button onClick={() => setIsDiagnostikModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDiagnostik} className="space-y-4 text-sm">
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Pilih Siswa Baru / Lama</label>
                <select
                  value={diagnostikForm.siswaNis}
                  onChange={(e) => {
                    const s = siswaData.find(x => x.nis === e.target.value);
                    setDiagnostikForm({
                      ...diagnostikForm,
                      siswaNis: e.target.value,
                      siswaId: s?.id || '',
                      siswaNama: s?.nama || '',
                      siswaKelas: s?.kelas || ''
                    });
                  }}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl"
                  required
                >
                  {siswaData.map(s => (
                    <option key={s.id} value={s.nis}>{s.nama} ({s.kelas} - NIS: {s.nis})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Gaya Belajar</label>
                  <select
                    value={diagnostikForm.gayaBelajar}
                    onChange={(e) => setDiagnostikForm({ ...diagnostikForm, gayaBelajar: e.target.value as any })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl"
                  >
                    <option value="Visual">Visual</option>
                    <option value="Auditori">Auditori</option>
                    <option value="Kinestetik">Kinestetik</option>
                    <option value="Campuran">Campuran</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Pemahaman Awal</label>
                  <select
                    value={diagnostikForm.tingkatPemahamanAwal}
                    onChange={(e) => setDiagnostikForm({ ...diagnostikForm, tingkatPemahamanAwal: e.target.value as any })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl"
                  >
                    <option value="Tinggi">Tinggi</option>
                    <option value="Sedang">Sedang</option>
                    <option value="Perlu Bimbingan Khusus">Perlu Bimbingan Khusus</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Minat & Bakat Siswa</label>
                <input
                  type="text"
                  placeholder="misal: Olahraga Sepak bola, Robotika, Sastra"
                  value={diagnostikForm.minatBakat}
                  onChange={(e) => setDiagnostikForm({ ...diagnostikForm, minatBakat: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Potensi Hambatan / Catatan Khusus</label>
                <textarea
                  rows={2}
                  placeholder="misal: Cemas saat ujian, mudah terdistraksi gawai, sering terlambat"
                  value={diagnostikForm.potensiHambatan}
                  onChange={(e) => setDiagnostikForm({ ...diagnostikForm, potensiHambatan: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Rekomendasi Laporan untuk Guru Wali</label>
                <textarea
                  rows={3}
                  placeholder="Rekomendasi spesifik tindakan pembimbingan oleh Guru Wali..."
                  value={diagnostikForm.rekomendasiBK}
                  onChange={(e) => setDiagnostikForm({ ...diagnostikForm, rekomendasiBK: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDiagnostikModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-sm"
                >
                  Simpan Laporan Diagnostik
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: INPUT TINDAK LANJUT WALI */}
      {isTindakLanjutModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-100 dark:border-gray-700 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-indigo-600" />
                {editingTindakLanjut ? 'Edit Catatan Bimbingan Wali' : 'Input Catatan Bimbingan & Tindak Lanjut Guru Wali'}
              </h3>
              <button onClick={() => setIsTindakLanjutModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTindakLanjut} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Siswa Binaan</label>
                  <select
                    value={tindakLanjutForm.siswaNis}
                    onChange={(e) => {
                      const s = siswaData.find(x => x.nis === e.target.value);
                      const assign = guruWaliAssignments.find(a => a.siswaNis === e.target.value);
                      setTindakLanjutForm({
                        ...tindakLanjutForm,
                        siswaNis: e.target.value,
                        siswaNama: s?.nama || '',
                        siswaKelas: s?.kelas || '',
                        guruNip: assign?.guruNip || tindakLanjutForm.guruNip,
                        guruNama: assign?.guruNama || tindakLanjutForm.guruNama
                      });
                    }}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl"
                    required
                  >
                    {siswaData.map(s => (
                      <option key={s.id} value={s.nis}>{s.nama} ({s.kelas})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Guru Wali (Mentor)</label>
                  <select
                    value={tindakLanjutForm.guruNip}
                    onChange={(e) => {
                      const g = guruData.find(x => x.nip === e.target.value);
                      setTindakLanjutForm({
                        ...tindakLanjutForm,
                        guruNip: e.target.value,
                        guruNama: g?.nama || ''
                      });
                    }}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl"
                    required
                  >
                    {guruData.map(g => (
                      <option key={g.id} value={g.nip}>{g.nama}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Tanggal Pertemuan</label>
                  <input
                    type="date"
                    value={tindakLanjutForm.tanggalTindakLanjut}
                    onChange={(e) => setTindakLanjutForm({ ...tindakLanjutForm, tanggalTindakLanjut: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Jenis Bimbingan</label>
                  <select
                    value={tindakLanjutForm.jenisTindakLanjut}
                    onChange={(e) => setTindakLanjutForm({ ...tindakLanjutForm, jenisTindakLanjut: e.target.value as any })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl"
                  >
                    <option value="Konsultasi Belajar">Konsultasi Belajar</option>
                    <option value="Bimbingan Karakter/Sikap">Bimbingan Karakter/Sikap</option>
                    <option value="Homevisit / Wawancara Ortu">Homevisit / Wawancara Ortu</option>
                    <option value="Remidial/Pengayaan Khusus">Remidial/Pengayaan Khusus</option>
                    <option value="Pembinaan Kedisiplinan">Pembinaan Kedisiplinan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Langkah Realisasi Tindakan Guru Wali</label>
                <textarea
                  rows={3}
                  placeholder="Langkah nyata yang dilakukan Guru Wali kepada siswa (misal: pemberian lembar komitmen, pembuatan kartu belajar, dll.)"
                  value={tindakLanjutForm.tindakanWali}
                  onChange={(e) => setTindakLanjutForm({ ...tindakLanjutForm, tindakanWali: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Catatan Kemajuan / Hasil Bimbingan</label>
                <textarea
                  rows={2}
                  placeholder="Perkembangan positif atau hasil evaluasi..."
                  value={tindakLanjutForm.catatanKemajuan}
                  onChange={(e) => setTindakLanjutForm({ ...tindakLanjutForm, catatanKemajuan: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Status Penanganan</label>
                  <select
                    value={tindakLanjutForm.status}
                    onChange={(e) => setTindakLanjutForm({ ...tindakLanjutForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl"
                  >
                    <option value="Dalam Proses Bimbingan">Dalam Proses Bimbingan</option>
                    <option value="Selesai / Teratasi">Selesai / Teratasi</option>
                    <option value="Perlu Tindak Lanjut">Perlu Tindak Lanjut</option>
                    <option value="Dirujuk Kembali ke BK">Dirujuk Kembali ke BK</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Sesi Evaluasi Berikutnya</label>
                  <input
                    type="date"
                    value={tindakLanjutForm.jadwalSesiBerikutnya || ''}
                    onChange={(e) => setTindakLanjutForm({ ...tindakLanjutForm, jadwalSesiBerikutnya: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTindakLanjutModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-sm"
                >
                  Simpan Jurnal Bimbingan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: CETAK LAPORAN BINAAN */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <Printer className="w-5 h-5 text-indigo-600" />
                Cetak Laporan Pembimbingan Guru Wali
              </h3>
              <button onClick={() => setIsPrintModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 bg-white text-gray-900 border border-gray-300 rounded-xl space-y-4 text-xs" id="print-area">
              <div className="text-center border-b-2 border-gray-800 pb-3">
                <h2 className="text-base font-bold uppercase">Laporan Program Mentoring & Guru Wali</h2>
                <p className="text-xs">Sistem Informasi Manajemen Sekolah (SIMS)</p>
                <p className="text-[10px] text-gray-500">Tahun Ajaran 2026/2027</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div><strong>Total Guru Wali:</strong> {totalGuruWali} Guru</div>
                <div><strong>Total Siswa Binaan:</strong> {totalSiswaBinaan} Siswa</div>
                <div><strong>Selesai Bimbingan:</strong> {countSelesai} Siswa</div>
                <div><strong>Tanggal Cetak:</strong> {new Date().toLocaleDateString('id-ID')}</div>
              </div>

              <table className="w-full border-collapse border border-gray-300 text-[11px] text-left">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-1.5">Guru Wali</th>
                    <th className="border border-gray-300 p-1.5">Siswa Binaan</th>
                    <th className="border border-gray-300 p-1.5">Gaya Belajar</th>
                    <th className="border border-gray-300 p-1.5">Status Bimbingan</th>
                  </tr>
                </thead>
                <tbody>
                  {guruWaliAssignments.map(a => {
                    const diag = diagnostikBKData.find(d => d.siswaNis === a.siswaNis);
                    const tl = tindakLanjutWaliData.find(t => t.siswaNis === a.siswaNis);
                    return (
                      <tr key={a.id}>
                        <td className="border border-gray-300 p-1.5">{a.guruNama}</td>
                        <td className="border border-gray-300 p-1.5">{a.siswaNama} ({a.siswaKelas})</td>
                        <td className="border border-gray-300 p-1.5">{diag?.gayaBelajar || '-'}</td>
                        <td className="border border-gray-300 p-1.5">{tl?.status || 'Belum Bimbingan'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="flex justify-between pt-8 text-[11px]">
                <div className="text-center">
                  <p>Guru BK Konselor,</p>
                  <br /><br />
                  <p className="font-bold underline">Siti Rahmawati, S.Pd</p>
                </div>
                <div className="text-center">
                  <p>Kepala Sekolah,</p>
                  <br /><br />
                  <p className="font-bold underline">H. Drs. M. Yusuf, M.Pd</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsPrintModalOpen(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-sm flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Print PDF / Kertas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
