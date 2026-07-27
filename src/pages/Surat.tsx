import React, { useState } from 'react';
import { Search, Plus, FileText, Printer, Edit2, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';

const SURAT_DATA = [
  { id: '1', noSurat: '421.3/001/SMP.AH/2023', jenis: 'Surat Keterangan Aktif', tujuan: 'Orang Tua Siswa (Ahmad Maulana)', tanggal: '2023-11-20', status: 'Selesai' },
  { id: '2', noSurat: '421.3/002/SMP.AH/2023', jenis: 'Surat Panggilan Orang Tua', tujuan: 'Orang Tua Siswa (Deni Sumargo)', tanggal: '2023-11-22', status: 'Selesai' },
  { id: '3', noSurat: '421.3/003/SMP.AH/2023', jenis: 'Surat Tugas', tujuan: 'Budi Santoso, S.Pd', tanggal: '2023-11-25', status: 'Draft' },
];

export const Surat = () => {
  const [data, setData] = useState(SURAT_DATA);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = data.filter(item => 
    item.noSurat.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.jenis.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.tujuan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    Swal.fire({
      title: 'Generate Surat',
      text: 'Formulir pembuatan surat dengan penomoran otomatis (Modal)',
      icon: 'info'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Administrasi Surat Menyurat</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola pembuatan dan arsip surat keluar</p>
        </div>
        <button 
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 font-medium rounded-lg transition-colors shadow-sm shadow-blue-600/20 text-sm w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          Buat Surat Baru
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nomor surat, jenis, atau tujuan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <select className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full sm:w-auto">
            <option value="">Semua Jenis Surat</option>
            <option value="Surat Keterangan">Surat Keterangan</option>
            <option value="Surat Panggilan">Surat Panggilan</option>
            <option value="Surat Tugas">Surat Tugas</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">No. Surat</th>
                <th className="px-6 py-4">Jenis Surat</th>
                <th className="px-6 py-4">Tujuan</th>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-slate-800">{item.noSurat}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <span>{item.jenis}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{item.tujuan}</td>
                    <td className="px-6 py-4 text-slate-500">{item.tanggal}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        item.status === 'Selesai' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" title="Print/PDF">
                          <Printer className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    Tidak ada data surat.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
