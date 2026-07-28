import React, { useState, useMemo } from 'react';
import { useDatabase, INITIAL_TIME_SLOTS_DATA } from '../context/DatabaseContext';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Printer, 
  AlertTriangle, 
  User, 
  BookOpen, 
  MapPin, 
  CheckCircle2, 
  X, 
  Copy,
  Layers,
  Sparkles,
  Download,
  Check,
  RotateCcw,
  Sliders
} from 'lucide-react';

const HARI_LIST = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

const MAPEL_COLORS: Record<string, string> = {
  'Matematika': 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
  'Bahasa Indonesia': 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
  'Bahasa Inggris': 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
  'Ilmu Pengetahuan Alam (IPA)': 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100',
  'Pendidikan Agama Islam': 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
  'Seni Budaya': 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100',
  'PJOK': 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100',
  'Istirahat': 'bg-slate-100 text-slate-600 border-slate-200',
};

const DEFAULT_COLOR = 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100';

interface JadwalFormState {
  id?: string;
  hari: string;
  jamKe: number;
  waktuMulai: string;
  waktuSelesai: string;
  kelas: string;
  mapel: string;
  guru: string;
  ruangan: string;
  keterangan: string;
}

export const JadwalPelajaran: React.FC = () => {
  const { user } = useAuth();
  const { 
    jadwalData, 
    setJadwalData, 
    mapelData, 
    guruData, 
    kelasData, 
    timeSlotsData, 
    setTimeSlotsData 
  } = useDatabase();

  const isAdminOrKurikulum = ['Admin', 'Kepala Sekolah'].includes(user?.role || '');

  // Sorted Time Slots from DatabaseContext
  const timeSlots = useMemo(() => {
    const list = timeSlotsData && timeSlotsData.length > 0 ? timeSlotsData : INITIAL_TIME_SLOTS_DATA;
    return [...list].sort((a, b) => Number(a.jamKe) - Number(b.jamKe));
  }, [timeSlotsData]);

  // View modes: 'grid-kelas' | 'grid-guru' | 'tabel' | 'pengaturan-jam' | 'deteksi-bentrok'
  const [viewMode, setViewMode] = useState<'grid-kelas' | 'grid-guru' | 'tabel' | 'pengaturan-jam' | 'deteksi-bentrok'>('grid-kelas');
  
  // Filters
  const [selectedKelas, setSelectedKelas] = useState<string>(kelasData[0]?.namaKelas || 'VII-A');
  const [selectedGuru, setSelectedGuru] = useState<string>(guruData[0]?.nama || '');
  const [selectedHari, setSelectedHari] = useState<string>('Semua');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modals for Schedule
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJadwal, setEditingJadwal] = useState<JadwalFormState | null>(null);
  const [formData, setFormData] = useState<JadwalFormState>({
    hari: 'Senin',
    jamKe: 1,
    waktuMulai: '07:00',
    waktuSelesai: '07:40',
    kelas: kelasData[0]?.namaKelas || 'VII-A',
    mapel: mapelData[0]?.nama || '',
    guru: guruData[0]?.nama || '',
    ruangan: 'Ruang 7A',
    keterangan: ''
  });

  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [copySourceKelas, setCopySourceKelas] = useState(kelasData[0]?.namaKelas || 'VII-A');
  const [copyTargetKelas, setCopyTargetKelas] = useState('');
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  // Modals for Time Slot Settings
  const [isTimeSlotModalOpen, setIsTimeSlotModalOpen] = useState(false);
  const [editingTimeSlot, setEditingTimeSlot] = useState<any | null>(null);
  const [timeSlotForm, setTimeSlotForm] = useState({
    id: '',
    jamKe: 1,
    mulai: '07:00',
    selesai: '07:40',
    label: 'Jam Ke-1'
  });

  // Time slot handlers
  const handleOpenTimeSlotModal = (slot?: any) => {
    if (slot) {
      setEditingTimeSlot(slot);
      setTimeSlotForm({
        id: slot.id || `TS_${slot.jamKe}`,
        jamKe: Number(slot.jamKe),
        mulai: slot.mulai || '07:00',
        selesai: slot.selesai || '07:40',
        label: slot.label || `Jam Ke-${slot.jamKe}`
      });
    } else {
      setEditingTimeSlot(null);
      const maxJam = timeSlots.length > 0 ? Math.max(...timeSlots.map(s => Number(s.jamKe))) + 1 : 1;
      setTimeSlotForm({
        id: '',
        jamKe: maxJam,
        mulai: '07:00',
        selesai: '07:40',
        label: `Jam Ke-${maxJam}`
      });
    }
    setIsTimeSlotModalOpen(true);
  };

  const handleSaveTimeSlot = (e: React.FormEvent) => {
    e.preventDefault();
    const currentList = timeSlotsData && timeSlotsData.length > 0 ? timeSlotsData : INITIAL_TIME_SLOTS_DATA;
    if (editingTimeSlot) {
      const updated = currentList.map(s => (s.id === editingTimeSlot.id || s.jamKe === editingTimeSlot.jamKe) ? { ...timeSlotForm, id: editingTimeSlot.id || `TS_${timeSlotForm.jamKe}` } : s);
      setTimeSlotsData(updated);
    } else {
      const newSlot = {
        ...timeSlotForm,
        id: `TS_${Date.now()}`
      };
      setTimeSlotsData([...currentList, newSlot]);
    }
    setIsTimeSlotModalOpen(false);
    setEditingTimeSlot(null);
  };

  const handleDeleteTimeSlot = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus pengaturan jam pelajaran ini?')) {
      const currentList = timeSlotsData && timeSlotsData.length > 0 ? timeSlotsData : INITIAL_TIME_SLOTS_DATA;
      setTimeSlotsData(currentList.filter(s => s.id !== id));
    }
  };

  const handleResetTimeSlots = () => {
    if (confirm('Apakah Anda yakin ingin mengembalikan jam pelajaran ke waktu standar (8 Jam Pelajaran)?')) {
      setTimeSlotsData(INITIAL_TIME_SLOTS_DATA);
    }
  };

  // Auto set waktu when jamKe changes
  const handleJamKeChange = (jamKe: number) => {
    const slot = timeSlots.find(s => Number(s.jamKe) === Number(jamKe));
    if (slot) {
      setFormData(prev => ({
        ...prev,
        jamKe: Number(jamKe),
        waktuMulai: slot.mulai,
        waktuSelesai: slot.selesai
      }));
    } else {
      setFormData(prev => ({ ...prev, jamKe: Number(jamKe) }));
    }
  };

  // Sync teacher automatically when subject is picked if available
  const handleMapelChange = (mapelNama: string) => {
    const matchedGuru = guruData.find(g => g.mapel?.toLowerCase() === mapelNama.toLowerCase());
    setFormData(prev => ({
      ...prev,
      mapel: mapelNama,
      guru: matchedGuru ? matchedGuru.nama : prev.guru
    }));
  };

  // Conflict Detection Algorithm
  const conflicts = useMemo(() => {
    const conflictList: { type: 'guru' | 'ruangan' | 'kelas'; item1: any; item2: any; message: string }[] = [];
    
    for (let i = 0; i < jadwalData.length; i++) {
      for (let j = i + 1; j < jadwalData.length; j++) {
        const a = jadwalData[i];
        const b = jadwalData[j];

        if (a.hari === b.hari && Number(a.jamKe) === Number(b.jamKe)) {
          // Check Guru bentrok
          if (a.guru && b.guru && a.guru === b.guru && a.kelas !== b.kelas) {
            conflictList.push({
              type: 'guru',
              item1: a,
              item2: b,
              message: `Guru ${a.guru} mengajar di 2 kelas bersamaan (${a.kelas} & ${b.kelas}) pada ${a.hari} Jam ke-${a.jamKe}.`
            });
          }
          // Check Ruangan bentrok
          if (a.ruangan && b.ruangan && a.ruangan === b.ruangan && a.kelas !== b.kelas && a.ruangan !== 'Lapangan Olahraga') {
            conflictList.push({
              type: 'ruangan',
              item1: a,
              item2: b,
              message: `Ruangan ${a.ruangan} digunakan oleh 2 kelas bersamaan (${a.kelas} & ${b.kelas}) pada ${a.hari} Jam ke-${a.jamKe}.`
            });
          }
          // Check Kelas bentrok (2 mapel di kelas & jam yang sama)
          if (a.kelas === b.kelas && a.id !== b.id) {
            conflictList.push({
              type: 'kelas',
              item1: a,
              item2: b,
              message: `Kelas ${a.kelas} memiliki 2 mata pelajaran (${a.mapel} & ${b.mapel}) pada ${a.hari} Jam ke-${a.jamKe}.`
            });
          }
        }
      }
    }
    return conflictList;
  }, [jadwalData]);

  // Form Validation Conflict Check
  const currentFormConflict = useMemo(() => {
    if (!formData.hari || !formData.jamKe) return null;

    const existingGuru = jadwalData.find(item => 
      item.id !== formData.id &&
      item.hari === formData.hari &&
      Number(item.jamKe) === Number(formData.jamKe) &&
      item.guru === formData.guru &&
      item.kelas !== formData.kelas
    );

    if (existingGuru) {
      return `Peringatan: Guru ${formData.guru} sudah memiliki jadwal mengajar di kelas ${existingGuru.kelas} pada ${formData.hari} Jam ke-${formData.jamKe}!`;
    }

    const existingRuangan = jadwalData.find(item => 
      item.id !== formData.id &&
      item.hari === formData.hari &&
      Number(item.jamKe) === Number(formData.jamKe) &&
      item.ruangan === formData.ruangan &&
      item.ruangan !== 'Lapangan Olahraga' &&
      item.kelas !== formData.kelas
    );

    if (existingRuangan) {
      return `Peringatan: Ruangan ${formData.ruangan} sedang dipakai oleh kelas ${existingRuangan.kelas} pada ${formData.hari} Jam ke-${formData.jamKe}!`;
    }

    return null;
  }, [formData, jadwalData]);

  // Handle Submit Create / Edit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingJadwal) {
      const updated = jadwalData.map(item => item.id === editingJadwal.id ? { ...formData, id: editingJadwal.id } : item);
      setJadwalData(updated);
    } else {
      const newEntry = {
        ...formData,
        id: `JDW_${Date.now()}`
      };
      setJadwalData([...jadwalData, newEntry]);
    }

    setIsModalOpen(false);
    setEditingJadwal(null);
  };

  const handleEdit = (item: any) => {
    setEditingJadwal(item);
    setFormData({
      id: item.id,
      hari: item.hari,
      jamKe: Number(item.jamKe),
      waktuMulai: item.waktuMulai || '07:00',
      waktuSelesai: item.waktuSelesai || '07:40',
      kelas: item.kelas,
      mapel: item.mapel,
      guru: item.guru,
      ruangan: item.ruangan || 'Ruang Kelas',
      keterangan: item.keterangan || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) {
      setJadwalData(jadwalData.filter(item => item.id !== id));
    }
  };

  // Handle Copy Schedule from Class to Class
  const handleCopySchedule = () => {
    if (!copySourceKelas || !copyTargetKelas) return;
    if (copySourceKelas === copyTargetKelas) {
      setCopyStatus('Kelas sumber dan tujuan tidak boleh sama.');
      return;
    }

    const sourceSchedules = jadwalData.filter(j => j.kelas === copySourceKelas);
    if (sourceSchedules.length === 0) {
      setCopyStatus(`Tidak ada jadwal ditemukan pada kelas ${copySourceKelas}.`);
      return;
    }

    // Remove existing target class schedule and copy
    const otherSchedules = jadwalData.filter(j => j.kelas !== copyTargetKelas);
    const newCopied = sourceSchedules.map((item, idx) => ({
      ...item,
      id: `JDW_CP_${Date.now()}_${idx}`,
      kelas: copyTargetKelas
    }));

    setJadwalData([...otherSchedules, ...newCopied]);
    setCopyStatus(`Berhasil menyalin ${newCopied.length} sesi jadwal dari ${copySourceKelas} ke ${copyTargetKelas}!`);
    setTimeout(() => {
      setIsCopyModalOpen(false);
      setCopyStatus(null);
    }, 1500);
  };

  // Filtered Table Data
  const filteredTableData = useMemo(() => {
    return jadwalData.filter(item => {
      const matchSearch = 
        item.mapel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.guru?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.kelas?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.ruangan?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchKelas = selectedKelas === 'Semua' || item.kelas === selectedKelas;
      const matchHari = selectedHari === 'Semua' || item.hari === selectedHari;

      return matchSearch && matchKelas && matchHari;
    });
  }, [jadwalData, searchTerm, selectedKelas, selectedHari]);

  // Helper for rendering matrix cell
  const getCellSchedule = (hari: string, jamKe: number, filterType: 'kelas' | 'guru', filterVal: string) => {
    return jadwalData.filter(item => {
      if (item.hari !== hari || Number(item.jamKe) !== jamKe) return false;
      if (filterType === 'kelas') return item.kelas === filterVal;
      if (filterType === 'guru') return item.guru === filterVal;
      return false;
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Jadwal Pelajaran</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Kelola jadwal KBM harian, deteksi jadwal bentrok, serta sinkronisasi guru & mata pelajaran.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {conflicts.length > 0 && (
            <button
              onClick={() => setViewMode('deteksi-bentrok')}
              className="px-3 py-2 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold flex items-center gap-2 hover:bg-rose-100 transition-colors"
            >
              <AlertTriangle className="w-4 h-4 text-rose-600 animate-pulse" />
              <span>{conflicts.length} Bentrok Ditemukan!</span>
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Jadwal</span>
          </button>

          {isAdminOrKurikulum && (
            <>
              <button
                onClick={() => setViewMode('pengaturan-jam')}
                className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors border border-amber-200"
              >
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Pengaturan Jam Ke / Waktu</span>
              </button>

              <button
                onClick={() => setIsCopyModalOpen(true)}
                className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors border border-indigo-200"
              >
                <Copy className="w-4 h-4" />
                <span>Salin Jadwal Kelas</span>
              </button>

              <button
                onClick={() => {
                  setEditingJadwal(null);
                  setFormData({
                    hari: 'Senin',
                    jamKe: 1,
                    waktuMulai: '07:00',
                    waktuSelesai: '07:40',
                    kelas: selectedKelas !== 'Semua' ? selectedKelas : (kelasData[0]?.namaKelas || 'VII-A'),
                    mapel: mapelData[0]?.nama || '',
                    guru: guruData[0]?.nama || '',
                    ruangan: 'Ruang Kelas',
                    keterangan: ''
                  });
                  setIsModalOpen(true);
                }}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Jadwal</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Sesi Terjadwal</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{jadwalData.length} Sesi</h3>
            <p className="text-xs text-slate-500 mt-1">Sesuai KBM Aktif</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Guru Bertugas</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">
              {new Set(jadwalData.map(j => j.guru).filter(Boolean)).size} Guru
            </h3>
            <p className="text-xs text-slate-500 mt-1">Dari Total {guruData.length} Guru</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <User className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Kelas Aktif</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">
              {new Set(jadwalData.map(j => j.kelas).filter(Boolean)).size} Kelas
            </h3>
            <p className="text-xs text-slate-500 mt-1">Dari Total {kelasData.length} Rombel</p>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Status Bentrok</p>
            <h3 className={`text-2xl font-bold mt-1 ${conflicts.length > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {conflicts.length > 0 ? `${conflicts.length} Konflik` : 'Aman (0)'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {conflicts.length > 0 ? 'Perlu penyesuaian' : 'Tidak ada bentrok'}
            </p>
          </div>
          <div className={`p-3 rounded-xl ${conflicts.length > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Navigation View Modes & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('grid-kelas')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'grid-kelas' 
                ? 'bg-white text-indigo-600 shadow-sm font-semibold' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Grid Per Kelas
          </button>

          <button
            onClick={() => setViewMode('grid-guru')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'grid-guru' 
                ? 'bg-white text-indigo-600 shadow-sm font-semibold' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Grid Per Guru
          </button>

          <button
            onClick={() => setViewMode('tabel')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'tabel' 
                ? 'bg-white text-indigo-600 shadow-sm font-semibold' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Daftar Tabel
          </button>

          <button
            onClick={() => setViewMode('pengaturan-jam')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'pengaturan-jam' 
                ? 'bg-white text-amber-700 shadow-sm font-semibold' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pengaturan Jam
          </button>

          <button
            onClick={() => setViewMode('deteksi-bentrok')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all relative ${
              viewMode === 'deteksi-bentrok' 
                ? 'bg-white text-rose-600 shadow-sm font-semibold' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Detektor Bentrok
            {conflicts.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-rose-500 text-white rounded-full text-[10px]">
                {conflicts.length}
              </span>
            )}
          </button>
        </div>

        {/* Dynamic filters based on view mode */}
        <div className="flex flex-wrap items-center gap-3">
          {viewMode === 'grid-kelas' && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Pilih Kelas:</span>
              <select
                value={selectedKelas}
                onChange={(e) => setSelectedKelas(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {kelasData.map(k => (
                  <option key={k.id} value={k.namaKelas}>{k.namaKelas}</option>
                ))}
              </select>
            </div>
          )}

          {viewMode === 'grid-guru' && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Pilih Guru:</span>
              <select
                value={selectedGuru}
                onChange={(e) => setSelectedGuru(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 max-w-[220px]"
              >
                {guruData.map(g => (
                  <option key={g.id} value={g.nama}>{g.nama} ({g.mapel})</option>
                ))}
              </select>
            </div>
          )}

          {viewMode === 'tabel' && (
            <>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari mapel, guru, kelas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48"
                />
              </div>

              <select
                value={selectedKelas}
                onChange={(e) => setSelectedKelas(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Semua">Semua Kelas</option>
                {kelasData.map(k => (
                  <option key={k.id} value={k.namaKelas}>{k.namaKelas}</option>
                ))}
              </select>

              <select
                value={selectedHari}
                onChange={(e) => setSelectedHari(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Semua">Semua Hari</option>
                {HARI_LIST.map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </>
          )}
        </div>
      </div>

      {/* VIEW 1: GRID PER KELAS */}
      {viewMode === 'grid-kelas' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-4">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span>Jadwal Pelajaran Kelas:</span>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-xl text-sm font-extrabold">{selectedKelas}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Wali Kelas: {kelasData.find(k => k.namaKelas === selectedKelas)?.waliKelas || '-'}
              </p>
            </div>
            <div className="text-xs text-slate-400 font-medium">
              *Klik slot untuk melihat detail atau mengedit
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-3 px-2 border-r border-slate-200 text-center w-28">Jam Ke / Waktu</th>
                  {HARI_LIST.map(hari => (
                    <th key={hari} className="py-3 px-3 border-r border-slate-200 text-center font-bold">
                      {hari}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map(slot => (
                  <tr key={slot.jamKe} className="border-b border-slate-100">
                    {/* Waktu Cell */}
                    <td className="py-3 px-2 bg-slate-50/50 border-r border-slate-200 text-center font-medium text-slate-600">
                      <div className="font-bold text-indigo-600 text-xs">{slot.label || `Jam ${slot.jamKe}`}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{slot.mulai} - {slot.selesai}</div>
                    </td>

                    {/* Hari Cells */}
                    {HARI_LIST.map(hari => {
                      const slots = getCellSchedule(hari, slot.jamKe, 'kelas', selectedKelas);
                      
                      return (
                        <td key={hari} className="py-2 px-2 border-r border-slate-200 align-top h-24 w-1/6 bg-slate-50/20">
                          {slots.length === 0 ? (
                            <div 
                              onClick={() => {
                                if (!isAdminOrKurikulum) return;
                                setEditingJadwal(null);
                                setFormData({
                                  hari,
                                  jamKe: slot.jamKe,
                                  waktuMulai: slot.mulai,
                                  waktuSelesai: slot.selesai,
                                  kelas: selectedKelas,
                                  mapel: mapelData[0]?.nama || '',
                                  guru: guruData[0]?.nama || '',
                                  ruangan: 'Ruang Kelas',
                                  keterangan: ''
                                });
                                setIsModalOpen(true);
                              }}
                              className={`h-full w-full border border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-300 text-[11px] ${isAdminOrKurikulum ? 'hover:border-indigo-300 hover:text-indigo-500 cursor-pointer transition-colors group' : ''}`}
                            >
                              {isAdminOrKurikulum ? (
                                <span className="opacity-0 group-hover:opacity-100 font-medium flex items-center gap-1">
                                  <Plus className="w-3 h-3" /> Isi Slot
                                </span>
                              ) : (
                                <span>- Kosong -</span>
                              )}
                            </div>
                          ) : (
                            slots.map(s => {
                              const colorClass = MAPEL_COLORS[s.mapel] || DEFAULT_COLOR;
                              return (
                                <div
                                  key={s.id}
                                  onClick={() => isAdminOrKurikulum && handleEdit(s)}
                                  className={`p-2 rounded-xl border transition-all ${colorClass} ${isAdminOrKurikulum ? 'cursor-pointer hover:shadow-md' : ''} h-full flex flex-col justify-between`}
                                >
                                  <div>
                                    <div className="font-bold text-xs line-clamp-1">{s.mapel}</div>
                                    <div className="flex items-center gap-1 text-[11px] opacity-90 mt-1 font-medium">
                                      <User className="w-3 h-3 shrink-0" />
                                      <span className="truncate">{s.guru || '-'}</span>
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between text-[10px] opacity-80 mt-2 pt-1 border-t border-current/10">
                                    <span className="flex items-center gap-0.5">
                                      <MapPin className="w-2.5 h-2.5" /> {s.ruangan}
                                    </span>
                                    {s.keterangan && <span className="italic truncate max-w-[60px]">{s.keterangan}</span>}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: GRID PER GURU */}
      {viewMode === 'grid-guru' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-4">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span>Jadwal Mengajar Guru:</span>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-xl text-sm font-extrabold">{selectedGuru}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Mata Pelajaran Utama: {guruData.find(g => g.nama === selectedGuru)?.mapel || '-'}
              </p>
            </div>
            <div className="text-xs text-slate-400 font-medium">
              *Membantu memantau jam mengajar dan menghindari bentrok
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-3 px-2 border-r border-slate-200 text-center w-28">Jam Ke / Waktu</th>
                  {HARI_LIST.map(hari => (
                    <th key={hari} className="py-3 px-3 border-r border-slate-200 text-center font-bold">
                      {hari}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map(slot => (
                  <tr key={slot.jamKe} className="border-b border-slate-100">
                    <td className="py-3 px-2 bg-slate-50/50 border-r border-slate-200 text-center font-medium text-slate-600">
                      <div className="font-bold text-emerald-700 text-xs">{slot.label || `Jam ${slot.jamKe}`}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{slot.mulai} - {slot.selesai}</div>
                    </td>

                    {HARI_LIST.map(hari => {
                      const slots = getCellSchedule(hari, slot.jamKe, 'guru', selectedGuru);

                      return (
                        <td key={hari} className="py-2 px-2 border-r border-slate-200 align-top h-24 w-1/6 bg-slate-50/20">
                          {slots.length === 0 ? (
                            <div className="h-full w-full border border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-300 text-[11px]">
                              - Tidak Ada Jam -
                            </div>
                          ) : (
                            slots.map(s => (
                              <div
                                key={s.id}
                                onClick={() => isAdminOrKurikulum && handleEdit(s)}
                                className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 h-full flex flex-col justify-between cursor-pointer hover:bg-emerald-100 transition-colors"
                              >
                                <div>
                                  <div className="font-extrabold text-xs text-emerald-900">{s.kelas}</div>
                                  <div className="text-[11px] font-semibold text-emerald-700 mt-0.5">{s.mapel}</div>
                                </div>
                                <div className="flex items-center justify-between text-[10px] text-emerald-600 pt-1 border-t border-emerald-200/50">
                                  <span className="flex items-center gap-0.5">
                                    <MapPin className="w-2.5 h-2.5" /> {s.ruangan}
                                  </span>
                                </div>
                              </div>
                            ))
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: TABEL DATA LIST */}
      {viewMode === 'tabel' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800">Daftar Jadwal ({filteredTableData.length} Data)</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider">
                  <th className="py-3 px-4">Hari & Jam</th>
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-4">Kelas</th>
                  <th className="py-3 px-4">Mata Pelajaran</th>
                  <th className="py-3 px-4">Guru Pengampu</th>
                  <th className="py-3 px-4">Ruangan</th>
                  <th className="py-3 px-4">Keterangan</th>
                  {isAdminOrKurikulum && <th className="py-3 px-4 text-center">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTableData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      Tidak ada data jadwal yang sesuai filter.
                    </td>
                  </tr>
                ) : (
                  filteredTableData.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-800">
                        {item.hari} <span className="text-slate-400 font-normal">(Jam ke-{item.jamKe})</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {item.waktuMulai} - {item.waktuSelesai}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg font-bold">
                          {item.kelas}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{item.mapel}</td>
                      <td className="py-3 px-4 text-slate-600">{item.guru || '-'}</td>
                      <td className="py-3 px-4 text-slate-500">{item.ruangan || '-'}</td>
                      <td className="py-3 px-4 text-slate-400 italic">{item.keterangan || '-'}</td>
                      {isAdminOrKurikulum && (
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleEdit(item)}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 4: DETEKTOR BENTROK */}
      {viewMode === 'deteksi-bentrok' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl ${conflicts.length > 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Pendeteksi Konflik Jadwal (Anti-Bentrok)</h2>
              <p className="text-xs text-slate-500">
                Sistem secara otomatis mengecek jadwal ganda untuk Guru, Ruangan, atau Kelas pada jam dan hari yang bersamaan.
              </p>
            </div>
          </div>

          {conflicts.length === 0 ? (
            <div className="p-8 text-center bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="text-base font-bold text-emerald-900">Seluruh Jadwal Terverifikasi Aman!</h3>
              <p className="text-xs text-emerald-700 max-w-md mx-auto">
                Tidak ditemukan bentrok jadwal guru mengajar ganda atau bentrok ruangan berbarengan.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {conflicts.map((c, index) => (
                <div key={index} className="p-4 bg-rose-50 rounded-2xl border border-rose-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-rose-200 text-rose-800 rounded-lg text-[10px] font-extrabold uppercase">
                        Konflik {c.type}
                      </span>
                      <span className="text-xs font-bold text-rose-900">{c.item1.hari} (Jam ke-{c.item1.jamKe})</span>
                    </div>
                    <p className="text-xs font-medium text-rose-800">{c.message}</p>
                    <div className="flex items-center gap-4 text-[11px] text-rose-700 pt-1">
                      <span>📌 Sesi 1: {c.item1.kelas} - {c.item1.mapel} ({c.item1.guru})</span>
                      <span>📌 Sesi 2: {c.item2.kelas} - {c.item2.mapel} ({c.item2.guru})</span>
                    </div>
                  </div>

                  {isAdminOrKurikulum && (
                    <button
                      onClick={() => handleEdit(c.item2)}
                      className="px-3 py-1.5 bg-white hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-xl text-xs font-semibold shrink-0 transition-colors"
                    >
                      Ubah Sesi 2
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 5: PENGATURAN JAM KE / WAKTU */}
      {viewMode === 'pengaturan-jam' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-50 text-amber-700 rounded-2xl">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Pengaturan Jam Pelajaran & Waktu KBM</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Atur daftar Jam Ke (Jam ke-1, Jam ke-2, dst) beserta durasi waktu mulai dan selesai untuk seluruh jadwal.
                </p>
              </div>
            </div>

            {isAdminOrKurikulum && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetTimeSlots}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset Default
                </button>
                <button
                  onClick={() => handleOpenTimeSlotModal()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Jam Ke Baru
                </button>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-3 px-4 w-24">Urutan</th>
                  <th className="py-3 px-4">Nama / Label Sesi</th>
                  <th className="py-3 px-4">Waktu Mulai</th>
                  <th className="py-3 px-4">Waktu Selesai</th>
                  <th className="py-3 px-4">Durasi Sesi</th>
                  {isAdminOrKurikulum && <th className="py-3 px-4 text-center w-28">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {timeSlots.map((s) => {
                  const [mH, mM] = (s.mulai || '07:00').split(':').map(Number);
                  const [sH, sM] = (s.selesai || '07:40').split(':').map(Number);
                  const durasi = (sH * 60 + sM) - (mH * 60 + mM);

                  return (
                    <tr key={s.id || s.jamKe} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 rounded-lg font-extrabold text-xs">
                          Jam {s.jamKe}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">
                        {s.label || `Jam Ke-${s.jamKe}`}
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-semibold">{s.mulai} WIB</td>
                      <td className="py-3 px-4 text-slate-700 font-semibold">{s.selesai} WIB</td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[11px] font-medium">
                          {durasi > 0 ? `${durasi} Menit` : '-'}
                        </span>
                      </td>
                      {isAdminOrKurikulum && (
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleOpenTimeSlotModal(s)}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Edit Jam Ke"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteTimeSlot(s.id || `TS_${s.jamKe}`)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH / EDIT JADWAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-base">
                {editingJadwal ? 'Edit Jam Pelajaran' : 'Tambah Jam Pelajaran Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Conflict Alert in Modal */}
              {currentFormConflict && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>{currentFormConflict}</div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Hari</label>
                  <select
                    value={formData.hari}
                    onChange={(e) => setFormData({ ...formData, hari: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    {HARI_LIST.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Jam Ke</label>
                  <select
                    value={formData.jamKe}
                    onChange={(e) => handleJamKeChange(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    {timeSlots.map(s => (
                      <option key={s.jamKe} value={s.jamKe}>{s.label || `Jam ${s.jamKe}`} ({s.mulai}-{s.selesai})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Waktu Mulai</label>
                  <input
                    type="time"
                    value={formData.waktuMulai}
                    onChange={(e) => setFormData({ ...formData, waktuMulai: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Waktu Selesai</label>
                  <input
                    type="time"
                    value={formData.waktuSelesai}
                    onChange={(e) => setFormData({ ...formData, waktuSelesai: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Kelas Target</label>
                <select
                  value={formData.kelas}
                  onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  {kelasData.map(k => (
                    <option key={k.id} value={k.namaKelas}>{k.namaKelas}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Mata Pelajaran (Sinkron)</label>
                <select
                  value={formData.mapel}
                  onChange={(e) => handleMapelChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  {mapelData.map(m => (
                    <option key={m.id} value={m.nama}>{m.nama} ({m.kelompok})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Guru Pengampu (Sinkron)</label>
                <select
                  value={formData.guru}
                  onChange={(e) => setFormData({ ...formData, guru: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  {guruData.map(g => (
                    <option key={g.id} value={g.nama}>{g.nama} - {g.mapel || 'Guru'}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Ruangan</label>
                  <input
                    type="text"
                    value={formData.ruangan}
                    onChange={(e) => setFormData({ ...formData, ruangan: e.target.value })}
                    placeholder="Contoh: Ruang 7A / Lab IPA"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Catatan/Keterangan</label>
                  <input
                    type="text"
                    value={formData.keterangan}
                    onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                    placeholder="Opsional (Praktikum, dll)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
                >
                  {editingJadwal ? 'Simpan Perubahan' : 'Tambah Jadwal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SALIN JADWAL KELAS */}
      {isCopyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Copy className="w-4 h-4 text-indigo-600" /> Salin Template Jadwal Kelas
              </h3>
              <button
                onClick={() => {
                  setIsCopyModalOpen(false);
                  setCopyStatus(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-500">
                Fitur ini mempercepat pembuatan jadwal dengan menyalin seluruh sesi dari kelas sumber ke kelas tujuan.
              </p>

              {copyStatus && (
                <div className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-xl text-xs font-medium">
                  {copyStatus}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Kelas Sumber (Salin Dari)</label>
                <select
                  value={copySourceKelas}
                  onChange={(e) => setCopySourceKelas(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                >
                  {kelasData.map(k => (
                    <option key={k.id} value={k.namaKelas}>{k.namaKelas}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Kelas Tujuan (Terapkan Ke)</label>
                <select
                  value={copyTargetKelas}
                  onChange={(e) => setCopyTargetKelas(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Pilih Kelas Tujuan --</option>
                  {kelasData.map(k => (
                    <option key={k.id} value={k.namaKelas}>{k.namaKelas}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCopyModalOpen(false);
                    setCopyStatus(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleCopySchedule}
                  disabled={!copyTargetKelas}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
                >
                  Proses Salin Jadwal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PENGATURAN JAM KE / WAKTU */}
      {isTimeSlotModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                {editingTimeSlot ? 'Edit Pengaturan Jam Pelajaran' : 'Tambah Jam Pelajaran Baru'}
              </h3>
              <button
                onClick={() => setIsTimeSlotModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTimeSlot} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Urutan Jam Ke- (Angka)</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={timeSlotForm.jamKe}
                  onChange={(e) => setTimeSlotForm({ ...timeSlotForm, jamKe: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nama / Label Sesi</label>
                <input
                  type="text"
                  placeholder="Contoh: Jam Ke-1 / Istirahat Pertama"
                  value={timeSlotForm.label}
                  onChange={(e) => setTimeSlotForm({ ...timeSlotForm, label: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Waktu Mulai</label>
                  <input
                    type="time"
                    value={timeSlotForm.mulai}
                    onChange={(e) => setTimeSlotForm({ ...timeSlotForm, mulai: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Waktu Selesai</label>
                  <input
                    type="time"
                    value={timeSlotForm.selesai}
                    onChange={(e) => setTimeSlotForm({ ...timeSlotForm, selesai: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTimeSlotModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
                >
                  Simpan Jam Pelajaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
