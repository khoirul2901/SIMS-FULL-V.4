import React, { useState } from 'react';
import { Search, FolderOpen, UploadCloud, Download, Eye, Trash2, Filter } from 'lucide-react';

const ARSIP_DATA = [
  { id: '1', namaFile: 'SK_Mengajar_Genap_2023.pdf', kategori: 'Dokumen', pemilik: 'Budi Santoso, S.Pd', ukuran: '1.2 MB', tanggal: '2023-11-20' },
  { id: '2', namaFile: 'Sertifikat_Akreditasi.pdf', kategori: 'Sekolah', pemilik: 'Admin', ukuran: '3.5 MB', tanggal: '2023-01-15' },
  { id: '3', namaFile: 'Surat_Peringatan_Deni.pdf', kategori: 'Surat', pemilik: 'BK', ukuran: '0.8 MB', tanggal: '2023-10-24' },
  { id: '4', namaFile: 'KTP_Siti_Aminah.jpg', kategori: 'Guru', pemilik: 'Siti Aminah, M.Pd', ukuran: '2.1 MB', tanggal: '2022-07-10' },
  { id: '5', namaFile: 'Ijazah_Ahmad_Maulana.pdf', kategori: 'Siswa', pemilik: 'Admin', ukuran: '1.5 MB', tanggal: '2023-07-01' },
];

export const Arsip = () => {
  const [data, setData] = useState(ARSIP_DATA);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = data.filter(item => 
    item.namaFile.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.kategori.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.pemilik.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Arsip Digital</h1>
          <p className="text-sm text-slate-500 mt-1">Penyimpanan dokumen terintegrasi Google Drive</p>
        </div>
        <button 
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 font-medium rounded-lg transition-colors shadow-sm shadow-blue-600/20 text-sm w-full sm:w-auto justify-center"
        >
          <UploadCloud className="w-4 h-4" />
          Upload Dokumen
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {['Semua', 'Guru', 'Siswa', 'Surat', 'Dokumen'].map((kat) => (
          <div key={kat} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-colors">
            <FolderOpen className="w-8 h-8 text-blue-500" />
            <span className="text-sm font-medium text-slate-700">{kat}</span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama file, kategori, atau pemilik..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors text-sm font-medium w-full sm:w-auto">
            <Filter className="w-4 h-4" />
            Filter Data
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Nama File</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4">Pemilik / Tag</th>
                <th className="px-6 py-4">Ukuran</th>
                <th className="px-6 py-4">Tgl Upload</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800 flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold uppercase">{item.namaFile.split('.').pop()}</span>
                      </div>
                      <span className="truncate max-w-[200px]" title={item.namaFile}>{item.namaFile}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium border border-slate-200">
                        {item.kategori}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{item.pemilik}</td>
                    <td className="px-6 py-4 font-mono text-slate-500 text-xs">{item.ukuran}</td>
                    <td className="px-6 py-4 text-slate-500">{item.tanggal}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Preview">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Download">
                          <Download className="w-4 h-4" />
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
                    Tidak ada arsip dokumen.
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
