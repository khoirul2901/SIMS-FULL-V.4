import React, { useState, useMemo } from 'react';
import { 
  Award, 
  Search, 
  Printer, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen, 
  FileSpreadsheet, 
  User, 
  BarChart2, 
  Sparkles,
  FileText,
  Filter,
  Check,
  RefreshCw,
  Eye,
  X
} from 'lucide-react';
import Swal from 'sweetalert2';
import { useDatabase } from '../context/DatabaseContext';

export const Nilai = () => {
  const { 
    siswaData, 
    kelasData, 
    mapelData, 
    nilaiData, 
    setNilaiData,
    absensiData,
    pelanggaranData
  } = useDatabase();

  // Filter States
  const [activeTab, setActiveTab] = useState<'input' | 'leger' | 'rapor'>('input');
  const [selectedTahun, setSelectedTahun] = useState('2023/2024');
  const [selectedSemester, setSelectedSemester] = useState<'Ganjil' | 'Genap'>('Ganjil');
  const [selectedKelas, setSelectedKelas] = useState(kelasData[0]?.namaKelas || 'VII-A');
  const [selectedMapel, setSelectedMapel] = useState(mapelData[0]?.nama || 'Matematika');
  const [selectedSiswaNis, setSelectedSiswaNis] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Local state for batch editing grades in 'input' mode
  const [inputGrades, setInputGrades] = useState<{ [nis: string]: { tugas: number; uh: number; uts: number; uas: number; catatan: string; selectedCapaian: string[] } }>({});

  // Capaian Modal State
  const [capaianModalStudent, setCapaianModalStudent] = useState<{ nis: string; nama: string } | null>(null);
  const [tempSelectedCapaian, setTempSelectedCapaian] = useState<string[]>([]);

  // Get active mapel object
  const currentMapelObj = useMemo(() => {
    return mapelData.find(m => m.nama === selectedMapel) || { kkm: 75, nama: selectedMapel, capaian: [] };
  }, [mapelData, selectedMapel]);

  // Students in selected class
  const classStudents = useMemo(() => {
    return siswaData.filter(s => s.kelas === selectedKelas && s.status === 'Aktif');
  }, [siswaData, selectedKelas]);

  // Initialize/Sync local inputGrades whenever class, mapel, tahun, semester changes
  React.useEffect(() => {
    const map: { [nis: string]: { tugas: number; uh: number; uts: number; uas: number; catatan: string; selectedCapaian: string[] } } = {};
    classStudents.forEach(siswa => {
      const existing = nilaiData.find(
        n => n.nis === siswa.nis && 
             n.kelas === selectedKelas && 
             n.mapel === selectedMapel && 
             n.tahunAjaran === selectedTahun && 
             n.semester === selectedSemester
      );
      if (existing) {
        map[siswa.nis] = {
          tugas: existing.tugas ?? 0,
          uh: existing.uh ?? 0,
          uts: existing.uts ?? 0,
          uas: existing.uas ?? 0,
          catatan: existing.catatan || '',
          selectedCapaian: Array.isArray(existing.selectedCapaian) ? existing.selectedCapaian : []
        };
      } else {
        map[siswa.nis] = { tugas: 80, uh: 80, uts: 80, uas: 80, catatan: '', selectedCapaian: [] };
      }
    });
    setInputGrades(map);
  }, [classStudents, selectedKelas, selectedMapel, selectedTahun, selectedSemester, nilaiData]);

  // Helper calculation for grade
  const calculateGrade = (tugas: number, uh: number, uts: number, uas: number) => {
    const na = Math.round((tugas * 0.2) + (uh * 0.2) + (uts * 0.3) + (uas * 0.3));
    let predikat = 'D';
    if (na >= 88) predikat = 'A';
    else if (na >= 78) predikat = 'B';
    else if (na >= 68) predikat = 'C';
    
    const isTuntas = na >= (currentMapelObj.kkm || 70);
    return { na, predikat, isTuntas };
  };

  // Handle grade change
  const handleInputChange = (nis: string, field: 'tugas' | 'uh' | 'uts' | 'uas' | 'catatan', val: any) => {
    setInputGrades(prev => ({
      ...prev,
      [nis]: {
        ...prev[nis],
        [field]: field === 'catatan' ? val : Math.min(100, Math.max(0, Number(val) || 0))
      }
    }));
  };

  // Open Capaian Modal for a student
  const handleOpenCapaianModal = (nis: string, nama: string) => {
    const currentStudentGrade = inputGrades[nis];
    const currentSelected = currentStudentGrade?.selectedCapaian || [];
    setCapaianModalStudent({ nis, nama });
    setTempSelectedCapaian([...currentSelected]);
  };

  // Toggle single capaian item in modal
  const handleToggleCapaianItem = (capaianText: string) => {
    setTempSelectedCapaian(prev => 
      prev.includes(capaianText) 
        ? prev.filter(c => c !== capaianText)
        : [...prev, capaianText]
    );
  };

  // Select all or clear all capaian
  const handleSelectAllCapaian = (allCapaian: string[]) => {
    if (tempSelectedCapaian.length === allCapaian.length) {
      setTempSelectedCapaian([]);
    } else {
      setTempSelectedCapaian([...allCapaian]);
    }
  };

  // Save capaian selection for student
  const handleSaveCapaianModal = () => {
    if (!capaianModalStudent) return;
    const nis = capaianModalStudent.nis;
    
    // Auto-generate catatan from selected capaian
    const generatedCatatan = tempSelectedCapaian.length > 0
      ? `Terampil dalam: ${tempSelectedCapaian.join('; ')}.`
      : '';

    setInputGrades(prev => ({
      ...prev,
      [nis]: {
        ...(prev[nis] || { tugas: 80, uh: 80, uts: 80, uas: 80, catatan: '', selectedCapaian: [] }),
        selectedCapaian: tempSelectedCapaian,
        catatan: generatedCatatan || prev[nis]?.catatan || ''
      }
    }));

    setCapaianModalStudent(null);
  };

  // Save batch input
  const handleSaveGrades = () => {
    const newNilaiData = [...nilaiData];

    classStudents.forEach(siswa => {
      const g = inputGrades[siswa.nis] || { tugas: 0, uh: 0, uts: 0, uas: 0, catatan: '', selectedCapaian: [] };
      const { na, predikat, isTuntas } = calculateGrade(g.tugas, g.uh, g.uts, g.uas);

      const existingIndex = newNilaiData.findIndex(
        n => n.nis === siswa.nis && 
             n.kelas === selectedKelas && 
             n.mapel === selectedMapel && 
             n.tahunAjaran === selectedTahun && 
             n.semester === selectedSemester
      );

      const record = {
        id: existingIndex >= 0 ? newNilaiData[existingIndex].id : Date.now().toString() + '_' + siswa.nis,
        nis: siswa.nis,
        nama: siswa.nama,
        kelas: selectedKelas,
        tahunAjaran: selectedTahun,
        semester: selectedSemester,
        mapel: selectedMapel,
        tugas: g.tugas,
        uh: g.uh,
        uts: g.uts,
        uas: g.uas,
        nilaiAkhir: na,
        predikat,
        keterangan: isTuntas ? 'Tuntas' : 'Remidial',
        catatan: g.catatan,
        selectedCapaian: g.selectedCapaian || []
      };

      if (existingIndex >= 0) {
        newNilaiData[existingIndex] = record;
      } else {
        newNilaiData.push(record);
      }
    });

    setNilaiData(newNilaiData);

    Swal.fire({
      icon: 'success',
      title: 'Nilai Berhasil Disimpan!',
      text: `Nilai ${selectedMapel} untuk kelas ${selectedKelas} (${selectedSemester} ${selectedTahun}) telah diperbarui.`,
      timer: 2000,
      showConfirmButton: false
    });
  };

  // LEGER DATA COMPUTATION (Matrix of all subjects per student)
  const legerMatrix = useMemo(() => {
    return classStudents.map(siswa => {
      const studentGrades = nilaiData.filter(
        n => n.nis === siswa.nis && 
             n.kelas === selectedKelas && 
             n.tahunAjaran === selectedTahun && 
             n.semester === selectedSemester
      );

      let totalScore = 0;
      let count = 0;
      let tuntasCount = 0;

      const subjectMap: { [mapelName: string]: { score: number; predikat: string; tuntas: boolean } } = {};

      mapelData.forEach(m => {
        const match = studentGrades.find(g => g.mapel === m.nama);
        if (match) {
          const score = match.nilaiAkhir ?? 0;
          totalScore += score;
          count++;
          const tuntas = score >= (m.kkm || 70);
          if (tuntas) tuntasCount++;
          subjectMap[m.nama] = { score, predikat: match.predikat, tuntas };
        } else {
          subjectMap[m.nama] = { score: 0, predikat: '-', tuntas: false };
        }
      });

      const avg = count > 0 ? Number((totalScore / count).toFixed(1)) : 0;

      return {
        nis: siswa.nis,
        nama: siswa.nama,
        subjectMap,
        totalScore,
        avg,
        tuntasCount,
        totalSubject: mapelData.length
      };
    }).sort((a, b) => b.avg - a.avg); // Sort for ranking
  }, [classStudents, nilaiData, selectedKelas, selectedTahun, selectedSemester, mapelData]);

  // Selected student for Rapor
  const activeSiswaForRapor = useMemo(() => {
    if (!selectedSiswaNis && classStudents.length > 0) {
      return classStudents[0];
    }
    return classStudents.find(s => s.nis === selectedSiswaNis) || classStudents[0];
  }, [classStudents, selectedSiswaNis]);

  // Rapor Detail Computation
  const raporDetails = useMemo(() => {
    if (!activeSiswaForRapor) return null;

    const studentGrades = nilaiData.filter(
      n => n.nis === activeSiswaForRapor.nis && 
           n.kelas === selectedKelas && 
           n.tahunAjaran === selectedTahun && 
           n.semester === selectedSemester
    );

    const mapelList = mapelData.map(m => {
      const match = studentGrades.find(g => g.mapel === m.nama);
      return {
        kode: m.kode,
        nama: m.nama,
        kelompok: m.kelompok,
        kkm: m.kkm || 75,
        tugas: match?.tugas ?? '-',
        uh: match?.uh ?? '-',
        uts: match?.uts ?? '-',
        uas: match?.uas ?? '-',
        nilaiAkhir: match?.nilaiAkhir ?? '-',
        predikat: match?.predikat ?? '-',
        keterangan: match?.keterangan ?? 'Belum ada nilai',
        catatan: match?.catatan || '-'
      };
    });

    // Attendance stats
    const studentAbsensi = absensiData.filter(a => a.nis === activeSiswaForRapor.nis);
    const sakit = studentAbsensi.filter(a => a.status === 'Sakit').length;
    const izin = studentAbsensi.filter(a => a.status === 'Izin').length;
    const alfa = studentAbsensi.filter(a => a.status === 'Alfa').length;

    // Violations stats
    const studentPelanggaran = pelanggaranData.filter(p => p.nis === activeSiswaForRapor.nis);
    const totalPoin = studentPelanggaran.reduce((acc, curr) => acc + (Number(curr.poin) || 0), 0);

    // Calculate ranking in class
    const rankIndex = legerMatrix.findIndex(l => l.nis === activeSiswaForRapor.nis);
    const rank = rankIndex >= 0 ? rankIndex + 1 : '-';

    return {
      siswa: activeSiswaForRapor,
      mapelList,
      absensi: { sakit, izin, alfa },
      poinPelanggaran: totalPoin,
      rank,
      totalSiswa: classStudents.length
    };
  }, [activeSiswaForRapor, nilaiData, mapelData, absensiData, pelanggaranData, legerMatrix, classStudents, selectedKelas, selectedTahun, selectedSemester]);

  // Print Rapor / Leger trigger
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Hide controls on Print */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
            font-size: 11pt;
          }
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          .print-page {
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
          }
          @page {
            size: A4 portrait;
            margin: 15mm;
          }
        }
        @media screen {
          .print-only {
            display: none !important;
          }
        }
      `}</style>

      {/* Screen Header & Navigation (Hidden when printing) */}
      <div className="no-print space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Pengolahan Nilai & Rapor Siswa</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Manajemen nilai akademik, leger kelas, dan pencetakan rapor resmi SMP AL-HIKAM
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('input')}
              className={`px-4 py-2.5 text-sm font-medium rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'input' 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Input Nilai Mapel
            </button>
            <button
              onClick={() => setActiveTab('leger')}
              className={`px-4 py-2.5 text-sm font-medium rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'leger' 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              Leger Nilai Kelas
            </button>
            <button
              onClick={() => setActiveTab('rapor')}
              className={`px-4 py-2.5 text-sm font-medium rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'rapor' 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              <Printer className="w-4 h-4" />
              Cetak Rapor Digital
            </button>
          </div>
        </div>

        {/* Global Filter Bar */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Tahun Ajaran
            </label>
            <select
              value={selectedTahun}
              onChange={e => setSelectedTahun(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="2023/2024">2023/2024</option>
              <option value="2022/2023">2022/2023</option>
              <option value="2024/2025">2024/2025</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Semester
            </label>
            <select
              value={selectedSemester}
              onChange={e => setSelectedSemester(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Ganjil">Semester Ganjil</option>
              <option value="Genap">Semester Genap</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Kelas
            </label>
            <select
              value={selectedKelas}
              onChange={e => setSelectedKelas(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {kelasData.map(k => (
                <option key={k.namaKelas} value={k.namaKelas}>
                  Kelas {k.namaKelas}
                </option>
              ))}
            </select>
          </div>

          {activeTab === 'input' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Mata Pelajaran
              </label>
              <select
                value={selectedMapel}
                onChange={e => setSelectedMapel(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {mapelData.map(m => (
                  <option key={m.id} value={m.nama}>
                    {m.nama} (KKM: {m.kkm || 75})
                  </option>
                ))}
              </select>
            </div>
          )}

          {activeTab === 'rapor' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Pilih Siswa untuk Rapor
              </label>
              <select
                value={activeSiswaForRapor?.nis || ''}
                onChange={e => setSelectedSiswaNis(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {classStudents.map(s => (
                  <option key={s.nis} value={s.nis}>
                    {s.nis} - {s.nama}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* ================= TAB 1: INPUT NILAI MATA PELAJARAN ================= */}
      {activeTab === 'input' && (
        <div className="no-print bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden space-y-4">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
                <span>Pengisian Nilai Mata Pelajaran</span>
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                {selectedMapel} - Kelas {selectedKelas}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Bobot Nilai: Tugas (20%), UH (20%), UTS (30%), UAS (30%) | KKM: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{currentMapelObj.kkm || 75}</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSaveGrades}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all active:scale-95"
              >
                <Save className="w-4 h-4" />
                Simpan Semua Nilai
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs uppercase text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3 w-12 text-center">No</th>
                  <th className="px-4 py-3 w-28">NIS</th>
                  <th className="px-4 py-3">Nama Siswa</th>
                  <th className="px-3 py-3 w-24 text-center">Tugas (20%)</th>
                  <th className="px-3 py-3 w-24 text-center">UH (20%)</th>
                  <th className="px-3 py-3 w-24 text-center">UTS (30%)</th>
                  <th className="px-3 py-3 w-24 text-center">UAS (30%)</th>
                  <th className="px-3 py-3 w-24 text-center font-bold text-indigo-600 dark:text-indigo-400">Nilai Akhir</th>
                  <th className="px-3 py-3 w-20 text-center">Predikat</th>
                  <th className="px-3 py-3 w-28 text-center">Status</th>
                  <th className="px-3 py-3 w-36 text-center">Aksi Capaian</th>
                  <th className="px-4 py-3">Catatan Guru</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {classStudents.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="text-center py-12 text-slate-500 dark:text-slate-400">
                      Tidak ada siswa di kelas {selectedKelas}
                    </td>
                  </tr>
                ) : (
                  classStudents.map((siswa, idx) => {
                    const g = inputGrades[siswa.nis] || { tugas: 0, uh: 0, uts: 0, uas: 0, catatan: '', selectedCapaian: [] };
                    const { na, predikat, isTuntas } = calculateGrade(g.tugas, g.uh, g.uts, g.uas);

                    return (
                      <tr key={siswa.nis} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-4 py-3 text-center text-slate-500 font-mono text-xs">{idx + 1}</td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">{siswa.nis}</td>
                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{siswa.nama}</td>
                        
                        {/* Inputs */}
                        <td className="px-2 py-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={g.tugas}
                            onChange={e => handleInputChange(siswa.nis, 'tugas', e.target.value)}
                            className="w-full px-2 py-1.5 text-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={g.uh}
                            onChange={e => handleInputChange(siswa.nis, 'uh', e.target.value)}
                            className="w-full px-2 py-1.5 text-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={g.uts}
                            onChange={e => handleInputChange(siswa.nis, 'uts', e.target.value)}
                            className="w-full px-2 py-1.5 text-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={g.uas}
                            onChange={e => handleInputChange(siswa.nis, 'uas', e.target.value)}
                            className="w-full px-2 py-1.5 text-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold"
                          />
                        </td>

                        {/* Calculated NA */}
                        <td className="px-3 py-3 text-center font-bold text-base text-indigo-600 dark:text-indigo-400">
                          {na}
                        </td>

                        {/* Predikat */}
                        <td className="px-3 py-3 text-center font-bold text-slate-800 dark:text-slate-200">
                          <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold ${
                            predikat === 'A' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' :
                            predikat === 'B' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400' :
                            predikat === 'C' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400' :
                            'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                          }`}>
                            {predikat}
                          </span>
                        </td>

                        {/* Status Tuntas */}
                        <td className="px-3 py-3 text-center">
                          {isTuntas ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Tuntas
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2.5 py-1 rounded-full border border-rose-200 dark:border-rose-800">
                              <AlertCircle className="w-3.5 h-3.5" /> Remedial
                            </span>
                          )}
                        </td>

                        {/* Kolom Aksi Capaian */}
                        <td className="px-3 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleOpenCapaianModal(siswa.nis, siswa.nama)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                              (g.selectedCapaian?.length || 0) > 0
                                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                                : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100'
                            }`}
                            title="Ceklis Capaian Pembelajaran"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{(g.selectedCapaian?.length || 0) > 0 ? `${g.selectedCapaian.length} Capaian` : 'Ceklis Capaian'}</span>
                          </button>
                        </td>

                        {/* Catatan */}
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            placeholder="Catatan perkembangan..."
                            value={g.catatan}
                            onChange={e => handleInputChange(siswa.nis, 'catatan', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 2: LEGER NILAI KELAS ================= */}
      {activeTab === 'leger' && (
        <div className="no-print bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden space-y-4 p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-700 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                Leger Rekap Nilai Kelas {selectedKelas}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Matriks perolehan nilai akhir semua mata pelajaran - Semester {selectedSemester} {selectedTahun}
              </p>
            </div>

            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-all"
            >
              <Printer className="w-4 h-4" />
              Cetak Leger Kelas
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300 border-collapse">
              <thead className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold uppercase">
                <tr>
                  <th className="p-2 border border-slate-300 dark:border-slate-700 text-center w-8">Rank</th>
                  <th className="p-2 border border-slate-300 dark:border-slate-700 w-20">NIS</th>
                  <th className="p-2 border border-slate-300 dark:border-slate-700 min-w-[140px]">Nama Siswa</th>
                  {mapelData.map(m => (
                    <th key={m.id} className="p-2 border border-slate-300 dark:border-slate-700 text-center min-w-[70px]">
                      {m.nama.length > 12 ? m.nama.substring(0, 10) + '...' : m.nama}
                    </th>
                  ))}
                  <th className="p-2 border border-slate-300 dark:border-slate-700 text-center bg-indigo-50 dark:bg-indigo-950/50 font-bold">Total</th>
                  <th className="p-2 border border-slate-300 dark:border-slate-700 text-center bg-indigo-100 dark:bg-indigo-900/50 font-bold text-indigo-700 dark:text-indigo-300">Rata2</th>
                </tr>
              </thead>
              <tbody>
                {legerMatrix.map((row, rank) => (
                  <tr key={row.nis} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                    <td className="p-2 border border-slate-300 dark:border-slate-700 text-center font-bold text-slate-600 dark:text-slate-400">
                      {rank === 0 ? '🥇 1' : rank === 1 ? '🥈 2' : rank === 2 ? '🥉 3' : rank + 1}
                    </td>
                    <td className="p-2 border border-slate-300 dark:border-slate-700 font-mono text-slate-500">{row.nis}</td>
                    <td className="p-2 border border-slate-300 dark:border-slate-700 font-semibold text-slate-900 dark:text-white">{row.nama}</td>
                    {mapelData.map(m => {
                      const item = row.subjectMap[m.nama];
                      return (
                        <td key={m.id} className={`p-2 border border-slate-300 dark:border-slate-700 text-center font-mono ${
                          item.score === 0 ? 'text-slate-300 dark:text-slate-600' :
                          !item.tuntas ? 'text-rose-600 font-bold bg-rose-50 dark:bg-rose-950/30' : 'text-slate-800 dark:text-slate-200'
                        }`}>
                          {item.score > 0 ? item.score : '-'}
                        </td>
                      );
                    })}
                    <td className="p-2 border border-slate-300 dark:border-slate-700 text-center font-bold bg-indigo-50/50 dark:bg-indigo-950/30">
                      {row.totalScore}
                    </td>
                    <td className="p-2 border border-slate-300 dark:border-slate-700 text-center font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-100/50 dark:bg-indigo-900/30">
                      {row.avg}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 3: CETAK RAPOR DIGITAL SISWA ================= */}
      {activeTab === 'rapor' && (
        <div className="space-y-6">
          {/* Action Bar for Screen view */}
          <div className="no-print bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">
                Pratinjau Rapor Digital Resmi untuk <span className="font-bold">{activeSiswaForRapor?.nama}</span>. Klik tombol cetak untuk mencetak atau menyimpan sebagai PDF.
              </p>
            </div>
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-md flex items-center gap-2 transition-all"
            >
              <Printer className="w-4 h-4" />
              Cetak Rapor Siswa
            </button>
          </div>

          {/* PRINTABLE RAPOR SHEET */}
          <div className="print-page bg-white text-slate-900 p-8 rounded-2xl border border-slate-200 shadow-xl max-w-4xl mx-auto space-y-6">
            
            {/* Kop Surat Resmi SMP AL-HIKAM */}
            <div className="border-b-4 border-double border-slate-900 pb-4 text-center relative">
              <div className="flex items-center justify-center gap-4">
                <div className="w-16 h-16 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold text-xl shrink-0">
                  AH
                </div>
                <div>
                  <h2 className="text-xl font-extrabold uppercase tracking-wide">YAYASAN AL-HIKAM MALANG</h2>
                  <h1 className="text-2xl font-black uppercase tracking-wider text-indigo-900">SMP AL-HIKAM</h1>
                  <p className="text-xs text-slate-600">
                    Jl. Cengger Ayam No. 25, Lowokwaru, Kota Malang, Jawa Timur | Telp: (0341) 491234
                  </p>
                  <p className="text-xs text-slate-500 font-mono">
                    NPSN: 20512345 | Akreditasi A | Email: info@smpalhikam.sch.id
                  </p>
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold uppercase underline tracking-wider">RAPOR HASIL BELAJAR SISWA</h3>
              <p className="text-xs font-semibold text-slate-600">
                Semester {selectedSemester} - Tahun Ajaran {selectedTahun}
              </p>
            </div>

            {/* Identitas Siswa */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs border border-slate-300 p-4 rounded-lg bg-slate-50/50">
              <div className="flex">
                <span className="w-32 font-semibold">Nama Siswa</span>
                <span className="font-bold text-slate-900">: {raporDetails?.siswa.nama}</span>
              </div>
              <div className="flex">
                <span className="w-32 font-semibold">Kelas</span>
                <span>: {selectedKelas}</span>
              </div>
              <div className="flex">
                <span className="w-32 font-semibold">NIS / NISN</span>
                <span className="font-mono">: {raporDetails?.siswa.nis} / {raporDetails?.siswa.nisn || '-'}</span>
              </div>
              <div className="flex">
                <span className="w-32 font-semibold">Peringkat Kelas</span>
                <span className="font-bold text-indigo-900">: Ke-{raporDetails?.rank} dari {raporDetails?.totalSiswa} Siswa</span>
              </div>
            </div>

            {/* Tabel Capaian Hasil Belajar */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">A. CAPAIAN AKADEMIK MATA PELAJARAN</h4>
              <table className="w-full text-xs text-left border-collapse border border-slate-400">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold">
                    <th className="border border-slate-400 px-2 py-1.5 text-center w-8">No</th>
                    <th className="border border-slate-400 px-2 py-1.5">Mata Pelajaran</th>
                    <th className="border border-slate-400 px-2 py-1.5 text-center w-12">KKM</th>
                    <th className="border border-slate-400 px-2 py-1.5 text-center w-14">Nilai</th>
                    <th className="border border-slate-400 px-2 py-1.5 text-center w-12">Predikat</th>
                    <th className="border border-slate-400 px-2 py-1.5">Capaian & Catatan Kompetensi</th>
                  </tr>
                </thead>
                <tbody>
                  {raporDetails?.mapelList.map((m, idx) => (
                    <tr key={m.kode}>
                      <td className="border border-slate-400 px-2 py-1.5 text-center">{idx + 1}</td>
                      <td className="border border-slate-400 px-2 py-1.5 font-medium">{m.nama}</td>
                      <td className="border border-slate-400 px-2 py-1.5 text-center font-mono">{m.kkm}</td>
                      <td className="border border-slate-400 px-2 py-1.5 text-center font-bold font-mono text-indigo-900">{m.nilaiAkhir}</td>
                      <td className="border border-slate-400 px-2 py-1.5 text-center font-bold">{m.predikat}</td>
                      <td className="border border-slate-400 px-2 py-1.5 text-slate-700 italic">{m.catatan}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Non-Academic & Attendance Section */}
            <div className="grid grid-cols-2 gap-6 text-xs">
              {/* Ketidakhadiran */}
              <div className="space-y-1">
                <h4 className="font-bold uppercase tracking-wider text-slate-800">B. KETIDAKHADIRAN</h4>
                <table className="w-full border-collapse border border-slate-400">
                  <tbody>
                    <tr>
                      <td className="border border-slate-400 px-3 py-1 font-medium">Sakit</td>
                      <td className="border border-slate-400 px-3 py-1 text-center font-mono">{raporDetails?.absensi.sakit} hari</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-400 px-3 py-1 font-medium">Izin</td>
                      <td className="border border-slate-400 px-3 py-1 text-center font-mono">{raporDetails?.absensi.izin} hari</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-400 px-3 py-1 font-medium">Tanpa Keterangan (Alfa)</td>
                      <td className="border border-slate-400 px-3 py-1 text-center font-mono">{raporDetails?.absensi.alfa} hari</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Kedisiplinan & Sikap */}
              <div className="space-y-1">
                <h4 className="font-bold uppercase tracking-wider text-slate-800">C. KEDISIPLINAN & KEPRIBADIAN</h4>
                <table className="w-full border-collapse border border-slate-400">
                  <tbody>
                    <tr>
                      <td className="border border-slate-400 px-3 py-1 font-medium">Kelakuan / Sikap</td>
                      <td className="border border-slate-400 px-3 py-1 text-center font-bold">Baik (A)</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-400 px-3 py-1 font-medium">Kerajinan & Kehadiran</td>
                      <td className="border border-slate-400 px-3 py-1 text-center font-bold">Baik (A)</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-400 px-3 py-1 font-medium">Poin Pelanggaran Siswa</td>
                      <td className="border border-slate-400 px-3 py-1 text-center font-bold text-rose-700 font-mono">
                        {raporDetails?.poinPelanggaran || 0} Poin
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Catatan Wali Kelas */}
            <div className="space-y-1 text-xs">
              <h4 className="font-bold uppercase tracking-wider text-slate-800">D. CATATAN WALI KELAS</h4>
              <div className="border border-slate-400 p-3 rounded text-slate-800 italic min-h-[50px] bg-slate-50/50">
                Ananda {raporDetails?.siswa.nama} telah menunjukkan prestasi belajar yang konsisten dan berakhlak mulia. Pertahankan ketekunan dan keaktifan dalam kegiatan ekstrakurikuler sekolah.
              </div>
            </div>

            {/* Tanda Tangan Official Signatures */}
            <div className="pt-8 grid grid-cols-3 text-center text-xs gap-4">
              <div>
                <p>Orang Tua / Wali Siswa,</p>
                <div className="h-16"></div>
                <p className="font-bold underline text-slate-900">( ............................................ )</p>
              </div>

              <div>
                <p>Malang, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p>Wali Kelas {selectedKelas},</p>
                <div className="h-16"></div>
                <p className="font-bold underline text-slate-900">Budi Santoso, S.Pd</p>
                <p className="text-[10px] text-slate-500">NIP. 19800101 200501 1 001</p>
              </div>

              <div>
                <p>Mengetahui,</p>
                <p>Kepala SMP AL-HIKAM</p>
                <div className="h-16"></div>
                <p className="font-bold underline text-slate-900">Dr. H. Ahmad Fauzi, M.Pd</p>
                <p className="text-[10px] text-slate-500">NIP. 19750815 200003 1 002</p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Modal Ceklis Capaian Pembelajaran */}
      {capaianModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto no-print">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg my-8 border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div>
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-xs uppercase tracking-wider">
                  <Award className="w-4 h-4" />
                  <span>Penilaian Capaian Pembelajaran</span>
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white mt-0.5">
                  {capaianModalStudent.nama} ({capaianModalStudent.nis})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Mata Pelajaran: <span className="font-semibold text-slate-700 dark:text-slate-200">{selectedMapel}</span> | Kelas: {selectedKelas}
                </p>
              </div>
              <button
                onClick={() => setCapaianModalStudent(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {(!currentMapelObj.capaian || currentMapelObj.capaian.length === 0) ? (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl text-center space-y-2">
                  <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 mx-auto" />
                  <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">
                    Belum ada indikator capaian yang dikonfigurasi untuk mata pelajaran <strong>{selectedMapel}</strong>.
                  </p>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400">
                    Silakan tambahkan indikator capaian terlebih dahulu di menu <strong>Master Mata Pelajaran</strong>.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Ceklis Capaian yang Dikuasai Siswa:
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSelectAllCapaian(currentMapelObj.capaian || [])}
                      className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      {tempSelectedCapaian.length === currentMapelObj.capaian.length ? 'Batal Semua' : 'Pilih Semua'}
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {currentMapelObj.capaian.map((cp: string, idx: number) => {
                      const isChecked = tempSelectedCapaian.includes(cp);
                      return (
                        <div
                          key={idx}
                          onClick={() => handleToggleCapaianItem(cp)}
                          className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                            isChecked
                              ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 shadow-sm'
                              : 'bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}} // handled by parent onClick
                            className="mt-0.5 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                          />
                          <span className={`text-xs leading-relaxed ${isChecked ? 'font-semibold text-indigo-950 dark:text-indigo-200' : 'text-slate-700 dark:text-slate-300'}`}>
                            {cp}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Generated preview text */}
                  <div className="pt-2">
                    <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      Pratinjau Catatan/Deskripsi Rapor Auto-Generated:
                    </label>
                    <div className="p-3 bg-slate-100 dark:bg-slate-900 rounded-xl text-xs text-slate-700 dark:text-slate-300 italic border border-slate-200 dark:border-slate-700">
                      {tempSelectedCapaian.length > 0 
                        ? `Terampil dalam: ${tempSelectedCapaian.join('; ')}.`
                        : 'Belum ada capaian yang dicentang.'
                      }
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2 bg-slate-50/50 dark:bg-slate-900/50">
              <button
                type="button"
                onClick={() => setCapaianModalStudent(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveCapaianModal}
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition-all"
              >
                Simpan Capaian & Catatan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
