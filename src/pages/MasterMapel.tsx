import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, BookOpen, X, ListPlus, CheckCircle2, Layers } from 'lucide-react';
import Swal from 'sweetalert2';
import { useDatabase } from '../context/DatabaseContext';

export const MasterMapel = () => {
  const { mapelData, setMapelData, kelasData } = useDatabase();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKelas, setFilterKelas] = useState('');

  const filteredData = mapelData.filter(mapel => {
    const matchesSearch = mapel.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          mapel.kode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesKelas = !filterKelas || mapel.kelas === filterKelas || mapel.kelas === 'Semua Kelas';
    return matchesSearch && matchesKelas;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    kode: '',
    nama: '',
    kelompok: 'Wajib A',
    kkm: 75,
    kelas: 'Semua Kelas',
    capaian: [] as string[]
  });

  const [newCapaianInput, setNewCapaianInput] = useState('');

  const handleOpenModal = (mapel?: typeof mapelData[0]) => {
    if (mapel) {
      setFormData({
        id: mapel.id || '',
        kode: mapel.kode || '',
        nama: mapel.nama || '',
        kelompok: mapel.kelompok || 'Wajib A',
        kkm: mapel.kkm || 75,
        kelas: mapel.kelas || 'Semua Kelas',
        capaian: Array.isArray(mapel.capaian) ? [...mapel.capaian] : []
      });
    } else {
      setFormData({
        id: '',
        kode: '',
        nama: '',
        kelompok: 'Wajib A',
        kkm: 75,
        kelas: 'Semua Kelas',
        capaian: []
      });
    }
    setNewCapaianInput('');
    setIsModalOpen(true);
  };

  const handleAddCapaian = () => {
    if (!newCapaianInput.trim()) return;
    setFormData(prev => ({
      ...prev,
      capaian: [...prev.capaian, newCapaianInput.trim()]
    }));
    setNewCapaianInput('');
  };

  const handleRemoveCapaian = (index: number) => {
    setFormData(prev => ({
      ...prev,
      capaian: prev.capaian.filter((_, i) => i !== index)
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.id) {
      setMapelData(mapelData.map(item => item.id === formData.id ? formData : item));
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Data mata pelajaran & capaian berhasil diupdate.',
        timer: 1800,
        showConfirmButton: false
      });
    } else {
      setMapelData([...mapelData, { ...formData, id: Date.now().toString() }]);
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Data mata pelajaran baru berhasil ditambahkan.',
        timer: 1800,
        showConfirmButton: false
      });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, nama: string) => {
    Swal.fire({
      title: 'Apakah Anda yakin?',
      text: `Menghapus mata pelajaran ${nama}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        setMapelData(mapelData.filter(item => item.id !== id));
        Swal.fire('Terhapus!', 'Mata pelajaran berhasil dihapus.', 'success');
      }
    });
  };

  // Build unique class list for options
  const classOptions = Array.from(
    new Set([
      'Semua Kelas',
      'VII',
      'VIII',
      'IX',
      ...kelasData.map(k => k.namaKelas)
    ])
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Data Mata Pelajaran</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Kelola daftar mata pelajaran, alokasi kelas, dan indikator capaian pembelajaran
          </p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all shadow-md shadow-indigo-600/20 text-sm w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          Tambah Mapel Baru
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari kode atau nama mata pelajaran..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0">Filter Kelas:</label>
            <select
              value={filterKelas}
              onChange={e => setFilterKelas(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Semua Tingkat/Kelas</option>
              {classOptions.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4 w-12">No</th>
                <th className="px-6 py-4 w-28">Kode</th>
                <th className="px-6 py-4">Mata Pelajaran</th>
                <th className="px-6 py-4 w-32">Tingkat / Kelas</th>
                <th className="px-6 py-4 w-28">Kelompok</th>
                <th className="px-6 py-4 w-20 text-center">KKM</th>
                <th className="px-6 py-4">Capaian Pembelajaran (KD/TP)</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredData.length > 0 ? (
                filteredData.map((mapel, index) => {
                  const capaianList: string[] = Array.isArray(mapel.capaian) ? mapel.capaian : [];
                  return (
                    <tr key={mapel.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{index + 1}</td>
                      <td className="px-6 py-4 font-mono text-slate-500 text-xs">{mapel.kode}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center border border-indigo-100 dark:border-indigo-900 shrink-0">
                            <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <span className="font-semibold text-slate-800 dark:text-white">{mapel.nama}</span>
                        </div>
                      </td>
                      {/* Kolom Kelas */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600">
                          <Layers className="w-3.5 h-3.5 text-indigo-500" />
                          {mapel.kelas || 'Semua Kelas'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                          mapel.kelompok === 'Wajib A' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-100 dark:border-indigo-900' : 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-100 dark:border-purple-900'
                        }`}>
                          {mapel.kelompok}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-center text-slate-800 dark:text-slate-200">{mapel.kkm || 75}</td>
                      
                      {/* Kolom Capaian */}
                      <td className="px-6 py-4 max-w-xs">
                        {capaianList.length > 0 ? (
                          <div className="space-y-1">
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              {capaianList.length} Capaian Dikonfigurasi
                            </span>
                            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside line-clamp-2">
                              {capaianList.slice(0, 2).map((cp, idx) => (
                                <li key={idx} className="truncate">{cp}</li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Belum ada capaian diset</span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleOpenModal(mapel)} 
                            className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors" 
                            title="Edit Mapel & Capaian"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(mapel.id, mapel.nama)}
                            className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors" 
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    Tidak ada data mata pelajaran yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Edit / Tambah Mapel & Capaian */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-xl my-8 overflow-hidden border border-slate-200 dark:border-slate-700">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                  {formData.id ? 'Edit Mata Pelajaran & Capaian' : 'Tambah Mata Pelajaran Baru'}
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kode Mapel
                  </label>
                  <input 
                    type="text" 
                    required 
                    value={formData.kode} 
                    onChange={e => setFormData({...formData, kode: e.target.value})}
                    placeholder="Contoh: MP001"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    KKM
                  </label>
                  <input 
                    type="number" 
                    required 
                    min="0" max="100"
                    value={formData.kkm} 
                    onChange={e => setFormData({...formData, kkm: parseInt(e.target.value) || 0})}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Mata Pelajaran
                </label>
                <input 
                  type="text" 
                  required 
                  value={formData.nama} 
                  onChange={e => setFormData({...formData, nama: e.target.value})}
                  placeholder="Contoh: Matematika"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kelompok
                  </label>
                  <select 
                    required 
                    value={formData.kelompok} 
                    onChange={e => setFormData({...formData, kelompok: e.target.value})}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-200"
                  >
                    <option value="Wajib A">Wajib A</option>
                    <option value="Wajib B">Wajib B</option>
                    <option value="Peminatan">Peminatan</option>
                    <option value="Muatan Lokal">Muatan Lokal</option>
                  </select>
                </div>

                {/* Dropdown Kelas */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Alokasi Kelas
                  </label>
                  <select 
                    required 
                    value={formData.kelas} 
                    onChange={e => setFormData({...formData, kelas: e.target.value})}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-200"
                  >
                    {classOptions.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Multi Input Capaian Pembelajaran */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Daftar Capaian Pembelajaran (Kompetensi/TP)
                  </label>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    {formData.capaian.length} Indikator
                  </span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCapaianInput}
                    onChange={e => setNewCapaianInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCapaian();
                      }
                    }}
                    placeholder="Tambah indikator/capaian pembelajaran..."
                    className="flex-1 px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-200"
                  />
                  <button
                    type="button"
                    onClick={handleAddCapaian}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0"
                  >
                    <ListPlus className="w-4 h-4" />
                    Tambah
                  </button>
                </div>

                {/* List Capaian Item */}
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {formData.capaian.length === 0 ? (
                    <div className="text-center py-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                      <p className="text-xs text-slate-400 italic">Belum ada indikator capaian. Tambahkan indikator untuk mempermudah penilaian akhir di Rapor.</p>
                    </div>
                  ) : (
                    formData.capaian.map((cp, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-start justify-between gap-2 p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200"
                      >
                        <div className="flex items-start gap-2 pt-0.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{cp}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveCapaian(idx)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors shrink-0"
                          title="Hapus Capaian"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-4 py-2 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-xs font-semibold rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-md shadow-indigo-600/20"
                >
                  Simpan Mapel & Capaian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

