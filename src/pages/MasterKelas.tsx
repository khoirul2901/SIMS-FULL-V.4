import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { Plus, Search, Edit2, Trash2, Users, X } from 'lucide-react';
import Swal from 'sweetalert2';

export const INITIAL_KELAS_DATA = [
  { id: '1', tingkat: 'VII', namaKelas: 'VII-A', waliKelas: 'Budi Santoso, S.Pd', jumlahSiswa: 32 },
  { id: '2', tingkat: 'VII', namaKelas: 'VII-B', waliKelas: 'Siti Aminah, M.Pd', jumlahSiswa: 30 },
  { id: '3', tingkat: 'VIII', namaKelas: 'VIII-A', waliKelas: 'Ahmad Dahlan, S.Ag', jumlahSiswa: 34 },
  { id: '4', tingkat: 'VIII', namaKelas: 'VIII-B', waliKelas: 'Rina Rahmawati, S.Psi', jumlahSiswa: 33 },
  { id: '5', tingkat: 'IX', namaKelas: 'IX-A', waliKelas: 'Agus Pratama, S.Kom', jumlahSiswa: 35 },
];

export const MasterKelas = () => {
  const { kelasData: data, setKelasData: setData, guruData } = useDatabase();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = data.filter(kelas => 
    kelas.namaKelas.toLowerCase().includes(searchTerm.toLowerCase()) || 
    kelas.waliKelas.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: '', tingkat: 'VII', namaKelas: '', waliKelas: '' });
  
  const handleOpenModal = (kelas?: typeof INITIAL_KELAS_DATA[0]) => {
    if (kelas) {
      setFormData({ id: kelas.id, tingkat: kelas.tingkat, namaKelas: kelas.namaKelas, waliKelas: kelas.waliKelas });
    } else {
      setFormData({ id: '', tingkat: 'VII', namaKelas: '', waliKelas: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.id) {
      setData(data.map(item => item.id === formData.id ? { ...item, ...formData } : item));
      Swal.fire('Berhasil!', 'Data kelas berhasil diupdate.', 'success');
    } else {
      setData([...data, { ...formData, id: Date.now().toString(), jumlahSiswa: 0 }]);
      Swal.fire('Berhasil!', 'Data kelas berhasil ditambahkan.', 'success');
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, nama: string) => {
    Swal.fire({
      title: 'Apakah Anda yakin?',
      text: `Menghapus data kelas ${nama}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        setData(data.filter(item => item.id !== id));
        Swal.fire('Terhapus!', 'Data kelas berhasil dihapus.', 'success');
      }
    });
  };



  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Data Master Kelas</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola data kelas dan wali kelas</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 font-medium rounded-lg transition-colors shadow-sm shadow-blue-600/20 text-sm w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          Tambah Kelas
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari kelas atau wali kelas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">No</th>
                <th className="px-6 py-4">Tingkat</th>
                <th className="px-6 py-4">Nama Kelas</th>
                <th className="px-6 py-4">Wali Kelas</th>
                <th className="px-6 py-4">Jumlah Siswa</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredData.length > 0 ? (
                filteredData.map((kelas, index) => (
                  <tr key={kelas.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{index + 1}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">{kelas.tingkat}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-semibold border border-blue-100">
                        {kelas.namaKelas}
                      </span>
                    </td>
                    <td className="px-6 py-4">{kelas.waliKelas}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span>{kelas.jumlahSiswa} Siswa</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleOpenModal(kelas)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(kelas.id, kelas.namaKelas)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    Tidak ada data kelas yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">
                {formData.id ? 'Edit Kelas' : 'Tambah Kelas Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tingkat</label>
                <select 
                  required 
                  value={formData.tingkat} 
                  onChange={e => setFormData({...formData, tingkat: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="VII">VII</option>
                  <option value="VIII">VIII</option>
                  <option value="IX">IX</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Kelas</label>
                <input 
                  type="text" 
                  required 
                  value={formData.namaKelas} 
                  onChange={e => setFormData({...formData, namaKelas: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Wali Kelas</label>
                <select 
                  required 
                  value={formData.waliKelas} 
                  onChange={e => setFormData({...formData, waliKelas: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-800"
                >
                  <option value="">-- Pilih Wali Kelas --</option>
                  {guruData && guruData.map((guru: any) => (
                    <option key={guru.id || guru.nip || guru.nama} value={guru.nama}>
                      {guru.nama} {guru.nip ? `(NIP: ${guru.nip})` : ''}
                    </option>
                  ))}
                  {/* Fallback if existing waliKelas value is not in guruData */}
                  {formData.waliKelas && guruData && !guruData.some((g: any) => g.nama === formData.waliKelas) && (
                    <option value={formData.waliKelas}>{formData.waliKelas}</option>
                  )}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 font-medium rounded-lg transition-colors">Batal</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 font-medium rounded-lg transition-colors">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

};
