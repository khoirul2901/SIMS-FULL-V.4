import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { JenisPembayaran as IJenisPembayaran, TagihanSiswa } from '../types/keuangan';
import { Plus, Search, Edit2, Trash2, Wallet, Users, Zap, CheckCircle, RefreshCw } from 'lucide-react';
import Swal from 'sweetalert2';

export const JenisPembayaran = () => {
  const { jenisPembayaranData, setJenisPembayaranData, siswaData, tagihanSiswaData, setTagihanSiswaData, kelasData } = useDatabase();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<IJenisPembayaran | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<IJenisPembayaran>>({
    pos: 'SPP',
    nama: '',
    nominal: 0,
    tipe: 'Bulanan',
    tingkat: 'Semua',
    tahunAjaran: '2025/2026',
    status: 'Aktif',
    keterangan: ''
  });

  // Generate Massal State
  const [generateConfig, setGenerateConfig] = useState({
    jenisPembayaranId: '',
    targetKelas: 'Semua',
    bulan: 'Agustus 2025',
    jatuhTempo: '2025-08-10'
  });

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka);
  };

  const filteredData = jenisPembayaranData.filter(item => 
    item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.pos.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      pos: 'SPP',
      nama: '',
      nominal: 150000,
      tipe: 'Bulanan',
      tingkat: 'Semua',
      tahunAjaran: '2025/2026',
      status: 'Aktif',
      keterangan: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: IJenisPembayaran) => {
    setEditingItem(item);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama || !formData.nominal || formData.nominal <= 0) {
      Swal.fire('Peringatan', 'Nama tagihan dan nominal wajib diisi!', 'warning');
      return;
    }

    if (editingItem) {
      // Edit
      const updated = jenisPembayaranData.map(item => item.id === editingItem.id ? { ...item, ...formData } as IJenisPembayaran : item);
      setJenisPembayaranData(updated);
      Swal.fire('Berhasil', 'Jenis pembayaran berhasil diperbarui!', 'success');
    } else {
      // Add
      const newItem: IJenisPembayaran = {
        id: String(Date.now()),
        pos: formData.pos || 'SPP',
        nama: formData.nama || '',
        nominal: Number(formData.nominal),
        tipe: formData.tipe as any || 'Bulanan',
        tingkat: formData.tingkat || 'Semua',
        tahunAjaran: formData.tahunAjaran || '2025/2026',
        status: formData.status as any || 'Aktif',
        keterangan: formData.keterangan || ''
      };
      setJenisPembayaranData([...jenisPembayaranData, newItem]);
      Swal.fire('Berhasil', 'Jenis pembayaran baru berhasil ditambahkan!', 'success');
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, nama: string) => {
    Swal.fire({
      title: 'Hapus Jenis Pembayaran?',
      text: `Anda yakin ingin menghapus master tagihan "${nama}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        setJenisPembayaranData(jenisPembayaranData.filter(item => item.id !== id));
        Swal.fire('Terhapus', 'Jenis pembayaran berhasil dihapus.', 'success');
      }
    });
  };

  // Generate Tagihan Massal Function
  const handleGenerateTagihanMassal = (e: React.FormEvent) => {
    e.preventDefault();
    const jenis = jenisPembayaranData.find(j => j.id === generateConfig.jenisPembayaranId);
    if (!jenis) {
      Swal.fire('Peringatan', 'Pilih jenis tagihan terlebih dahulu!', 'warning');
      return;
    }

    // Filter siswa target
    const targetSiswa = siswaData.filter(s => {
      if (s.status !== 'Aktif') return false;
      if (generateConfig.targetKelas !== 'Semua' && s.kelas !== generateConfig.targetKelas) return false;
      return true;
    });

    if (targetSiswa.length === 0) {
      Swal.fire('Informasi', 'Tidak ditemukan siswa aktif pada kelas/kriteria yang dipilih.', 'info');
      return;
    }

    // Create new tagihan items
    const newTagihanList: TagihanSiswa[] = [];
    let countCreated = 0;

    targetSiswa.forEach(s => {
      const namaTagihanFull = jenis.tipe === 'Bulanan' 
        ? `${jenis.nama} (${generateConfig.bulan})`
        : jenis.nama;

      // Check if tagihan already exists for this student & month
      const exists = tagihanSiswaData.some(t => 
        t.nis === s.nis && 
        t.jenisPembayaranId === jenis.id && 
        (jenis.tipe === 'Bulanan' ? t.bulan === generateConfig.bulan : true)
      );

      if (!exists) {
        newTagihanList.push({
          id: `TG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          nis: s.nis,
          nama: s.nama,
          kelas: s.kelas,
          jenisPembayaranId: jenis.id,
          namaTagihan: namaTagihanFull,
          tipe: jenis.tipe,
          bulan: jenis.tipe === 'Bulanan' ? generateConfig.bulan : undefined,
          nominal: jenis.nominal,
          terbayar: 0,
          status: 'Belum Bayar',
          tanggalJatuhTempo: generateConfig.jatuhTempo,
          riwayatPembayaran: []
        });
        countCreated++;
      }
    });

    if (countCreated > 0) {
      setTagihanSiswaData([...newTagihanList, ...tagihanSiswaData]);
      setIsGenerateModalOpen(false);
      Swal.fire({
        title: 'Berhasil Generate Tagihan!',
        text: `Telah dibuat ${countCreated} tagihan ${jenis.nama} secara massal untuk siswa kelas ${generateConfig.targetKelas}.`,
        icon: 'success'
      });
    } else {
      Swal.fire('Informasi', 'Seluruh siswa di kelas yang dipilih sudah memiliki tagihan untuk periode ini.', 'info');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Wallet className="w-7 h-7 text-blue-600" /> Master Jenis & Tarif Pembayaran
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Pengaturan POS tagihan sekolah (SPP, Uang Gedung, Seragam, dll) & pembuat tagihan massal
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsGenerateModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl text-xs shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02]"
          >
            <Zap className="w-4 h-4" /> Generate Tagihan Massal
          </button>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs shadow-md shadow-blue-600/20 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" /> Tambah Master Tagihan
          </button>
        </div>
      </div>

      {/* Table Box */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari POS atau nama tagihan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 uppercase font-bold tracking-wider">
              <tr>
                <th className="px-5 py-3.5">POS</th>
                <th className="px-5 py-3.5">Nama Tagihan</th>
                <th className="px-5 py-3.5">Tipe Pembayaran</th>
                <th className="px-5 py-3.5">Beban Tingkat</th>
                <th className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">Nominal Tarif</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-4 font-extrabold text-blue-600 dark:text-blue-400">
                      {item.pos}
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-800 dark:text-slate-100">
                      {item.nama}
                      {item.keterangan && <div className="text-[11px] font-normal text-slate-400">{item.keterangan}</div>}
                    </td>
                    <td className="px-5 py-4 font-medium">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border text-slate-700 dark:text-slate-300">
                        {item.tipe}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-medium">{item.tingkat}</td>
                    <td className="px-5 py-4 font-black text-slate-900 dark:text-white text-sm">
                      {formatRupiah(item.nominal)}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        item.status === 'Aktif' 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors"
                          title="Edit Master Tagihan"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.nama)}
                          className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors"
                          title="Hapus Master Tagihan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    Belum ada master jenis pembayaran.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah / Edit Master Tagihan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Wallet className="w-5 h-5 text-blue-600" />
                {editingItem ? 'Edit Jenis Pembayaran' : 'Tambah Jenis Pembayaran Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    POS Pembayaran *
                  </label>
                  <select
                    value={formData.pos}
                    onChange={(e) => setFormData({ ...formData, pos: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100"
                  >
                    <option value="SPP">SPP</option>
                    <option value="Gedung">Gedung / Pangkal</option>
                    <option value="Seragam">Seragam</option>
                    <option value="Buku">Buku & LKS</option>
                    <option value="Ujian">Ujian / Asesmen</option>
                    <option value="Ekskul">Ekstrakurikuler</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Tipe Pembayaran *
                  </label>
                  <select
                    value={formData.tipe}
                    onChange={(e) => setFormData({ ...formData, tipe: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100"
                  >
                    <option value="Bulanan">Bulanan (Rutinitas)</option>
                    <option value="Bebas">Bebas / Sekali Bayar</option>
                    <option value="Semesteran">Semesteran</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Nama Tagihan Resmi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: SPP Bulanan 2025/2026"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Nominal Tarif (Rp) *
                  </label>
                  <input
                    type="number"
                    min="1000"
                    required
                    placeholder="150000"
                    value={formData.nominal || ''}
                    onChange={(e) => setFormData({ ...formData, nominal: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Beban Tingkat Kelas
                  </label>
                  <select
                    value={formData.tingkat}
                    onChange={(e) => setFormData({ ...formData, tingkat: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100"
                  >
                    <option value="Semua">Semua Tingkat</option>
                    <option value="VII">Hanya Tingkat VII</option>
                    <option value="VIII">Hanya Tingkat VIII</option>
                    <option value="IX">Hanya Tingkat IX</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Keterangan Tambahan
                </label>
                <input
                  type="text"
                  placeholder="Catatan kecil / instruksi pembayaran"
                  value={formData.keterangan || ''}
                  onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Simpan Master Tagihan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Generate Tagihan Massal */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" /> Generate Tagihan Massal
              </h3>
              <button onClick={() => setIsGenerateModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerateTagihanMassal} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Pilih Master Tagihan *
                </label>
                <select
                  required
                  value={generateConfig.jenisPembayaranId}
                  onChange={(e) => setGenerateConfig({ ...generateConfig, jenisPembayaranId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100"
                >
                  <option value="">-- Pilih Master Tagihan --</option>
                  {jenisPembayaranData.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.nama} - {formatRupiah(j.nominal)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Target Kelas Siswa *
                </label>
                <select
                  value={generateConfig.targetKelas}
                  onChange={(e) => setGenerateConfig({ ...generateConfig, targetKelas: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 font-semibold"
                >
                  <option value="Semua">Semua Kelas ({siswaData.length} Siswa)</option>
                  {kelasData.map((k) => (
                    <option key={k.id} value={k.namaKelas}>Kelas {k.namaKelas}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Periode Bulan (jika SPP)
                  </label>
                  <select
                    value={generateConfig.bulan}
                    onChange={(e) => setGenerateConfig({ ...generateConfig, bulan: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100"
                  >
                    <option value="Juli 2025">Juli 2025</option>
                    <option value="Agustus 2025">Agustus 2025</option>
                    <option value="September 2025">September 2025</option>
                    <option value="Oktober 2025">Oktober 2025</option>
                    <option value="November 2025">November 2025</option>
                    <option value="Desember 2025">Desember 2025</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Tanggal Jatuh Tempo
                  </label>
                  <input
                    type="date"
                    value={generateConfig.jatuhTempo}
                    onChange={(e) => setGenerateConfig({ ...generateConfig, jatuhTempo: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Terbitkan Tagihan Massal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
