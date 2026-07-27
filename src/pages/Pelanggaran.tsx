import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { Plus, Search, AlertTriangle, Settings, Edit, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';

export const Pelanggaran = () => {
  const { pelanggaranData: data, setPelanggaranData: setData, siswaData, kategoriPelanggaranData, setKategoriPelanggaranData } = useDatabase();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'riwayat' | 'kategori'>('riwayat');

  const filteredData = data.filter(item => 
    item.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.nis.includes(searchTerm) ||
    item.kelas.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.pelanggaran.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getKategoriColor = (kategori: string) => {
    switch (kategori.toLowerCase()) {
      case 'ringan': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'sedang': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'berat': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handleAdd = () => {
    const kategoriOptions = kategoriPelanggaranData.map(k => `<option value="${k.id}">${k.kategori} - ${k.jenis} (${k.poin} Poin)</option>`).join('');
    
    // Create datalist for students
    const studentOptions = siswaData.map(s => `<option value="${s.nis}">${s.nama} (${s.kelas})</option>`).join('');

    Swal.fire({
      title: 'Catat Pelanggaran',
      html: `
        <div class="space-y-4 text-left">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Cari Siswa (NIS / Nama)</label>
            <input list="students" id="nis" class="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Ketik NIS atau Nama Siswa">
            <datalist id="students">
              ${studentOptions}
            </datalist>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Jenis Pelanggaran</label>
            <select id="kategori_id" class="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500">
              <option value="">-- Pilih Pelanggaran --</option>
              ${kategoriOptions}
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Catatan Tambahan (Opsional)</label>
            <textarea id="catatan" class="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500" rows="2"></textarea>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Simpan',
      cancelButtonText: 'Batal',
      preConfirm: () => {
        const nis = (document.getElementById('nis') as HTMLInputElement).value;
        const kategoriId = (document.getElementById('kategori_id') as HTMLSelectElement).value;
        const catatan = (document.getElementById('catatan') as HTMLTextAreaElement).value;
        
        if (!nis || !kategoriId) {
          Swal.showValidationMessage('Siswa dan Jenis Pelanggaran harus diisi');
          return false;
        }
        
        return { nis, kategoriId, catatan };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const { nis, kategoriId, catatan } = result.value;
        // Parse the NIS in case they selected from datalist format "Nama (Kelas) - NIS" or something
        // Our datalist value is just NIS.
        const siswa = siswaData.find((s: any) => s.nis === nis);
        const kategori = kategoriPelanggaranData.find(k => k.id === kategoriId);
        
        if (!siswa) {
          Swal.fire('Error', 'Siswa tidak ditemukan dalam database!', 'error');
          return;
        }

        const newPelanggaran = {
          id: Math.random().toString(36).substr(2, 9),
          tanggal: new Date().toISOString().split('T')[0],
          nis,
          nama: siswa.nama,
          kelas: siswa.kelas,
          kategori: kategori.kategori,
          pelanggaran: kategori.jenis + (catatan ? ` - ${catatan}` : ''),
          poin: kategori.poin,
          pelapor: 'Admin / Guru'
        };
        
        setData([...data, newPelanggaran]);
        Swal.fire('Tersimpan', 'Data pelanggaran berhasil dicatat', 'success');
      }
    });
  };

  const handleAddKategori = () => {
    Swal.fire({
      title: 'Tambah Kategori Pelanggaran',
      html: `
        <div class="space-y-4 text-left">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Kategori (Tingkat)</label>
            <select id="kat" class="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500">
              <option value="Ringan">Ringan</option>
              <option value="Sedang">Sedang</option>
              <option value="Berat">Berat</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Jenis Pelanggaran</label>
            <input type="text" id="jenis" class="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Contoh: Terlambat">
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Bobot Poin</label>
            <input type="number" id="poin" class="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="0">
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Simpan',
      preConfirm: () => {
        const kat = (document.getElementById('kat') as HTMLSelectElement).value;
        const jenis = (document.getElementById('jenis') as HTMLInputElement).value;
        const poin = parseInt((document.getElementById('poin') as HTMLInputElement).value) || 0;
        if (!jenis) { Swal.showValidationMessage('Jenis pelanggaran harus diisi'); return false; }
        return { kat, jenis, poin };
      }
    }).then(result => {
      if(result.isConfirmed) {
        const { kat, jenis, poin } = result.value;
        setKategoriPelanggaranData([...kategoriPelanggaranData, {
          id: Math.random().toString(36).substr(2, 9),
          kategori: kat,
          jenis,
          poin
        }]);
        Swal.fire('Berhasil', 'Kategori baru ditambahkan', 'success');
      }
    });
  };

  const handleDeleteKategori = (id: string) => {
    Swal.fire({
      title: 'Hapus Kategori?',
      text: "Anda yakin ingin menghapus kategori pelanggaran ini?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, hapus!'
    }).then((result) => {
      if (result.isConfirmed) {
        setKategoriPelanggaranData(kategoriPelanggaranData.filter(k => k.id !== id));
        Swal.fire('Terhapus!', 'Kategori telah dihapus.', 'success');
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Pelanggaran & Kedisiplinan</h1>
          <p className="text-sm text-slate-500 mt-1">Catat dan pantau kedisiplinan siswa</p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'riwayat' && (
            <button 
              onClick={handleAdd}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 font-medium rounded-lg transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Catat Pelanggaran
            </button>
          )}
          {activeTab === 'kategori' && (
            <button 
              onClick={handleAddKategori}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 font-medium rounded-lg transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Tambah Kategori
            </button>
          )}
        </div>
      </div>

      <div className="flex border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('riwayat')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'riwayat' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Riwayat Pelanggaran
          </div>
        </button>
        <button 
          onClick={() => setActiveTab('kategori')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'kategori' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Pengaturan Kategori
          </div>
        </button>
      </div>

      {activeTab === 'riwayat' ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <div className="relative max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Cari berdasarkan nama, NIS, kelas, atau jenis..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 font-semibold">Tanggal</th>
                  <th className="px-6 py-3 font-semibold">Siswa</th>
                  <th className="px-6 py-3 font-semibold">Kategori & Pelanggaran</th>
                  <th className="px-6 py-3 font-semibold text-center">Poin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">{item.tanggal}</td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-800">{item.nama}</p>
                      <p className="text-xs text-slate-500">Kelas {item.kelas} • NIS: {item.nis}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-800">{item.kategori}</p>
                      <p className="text-xs text-slate-500">{item.pelanggaran}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded border text-xs font-bold ${getKategoriColor(item.kategori)}`}>
                        +{item.poin} Poin
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                      Tidak ada riwayat pelanggaran.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 font-semibold">Tingkat / Kategori</th>
                  <th className="px-6 py-3 font-semibold">Jenis Pelanggaran</th>
                  <th className="px-6 py-3 font-semibold text-center">Bobot Poin</th>
                  <th className="px-6 py-3 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {kategoriPelanggaranData.map((kat) => (
                  <tr key={kat.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded border text-xs font-bold ${getKategoriColor(kat.kategori)}`}>
                        {kat.kategori}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-800">{kat.jenis}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-bold text-slate-700">{kat.poin}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDeleteKategori(kat.id)}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
