import React, { useState, useRef } from 'react';
import { Plus, Search, Filter, FileSpreadsheet, Edit2, Trash2, IdCard, X, Printer } from 'lucide-react';
import Swal from 'sweetalert2';
import { useDatabase } from '../context/DatabaseContext';

const INITIAL_DATA = [
  { id: '1', nis: '2023001', nisn: '0051234567', nama: 'Ahmad Maulana', jk: 'L', kelas: 'VII-A', status: 'Aktif', tempatLahir: 'Jakarta', tanggalLahir: '2009-05-12', alamat: 'Jl. Merdeka No. 1', namaAyah: 'Budi', namaIbu: 'Siti', noHp: '08123456789', username: 'ahmadmaulana', password: 'password123' },
  { id: '2', nis: '2023002', nisn: '0051234568', nama: 'Siti Nurhaliza', jk: 'P', kelas: 'VII-A', status: 'Aktif', tempatLahir: 'Bandung', tanggalLahir: '2009-08-20', alamat: 'Jl. Sudirman No. 2', namaAyah: 'Andi', namaIbu: 'Rina', noHp: '08987654321', username: 'sitinurhaliza', password: 'password123' },
  { id: '3', nis: '2022001', nisn: '0041234567', nama: 'Bima Sakti', jk: 'L', kelas: 'VIII-B', status: 'Aktif', tempatLahir: 'Surabaya', tanggalLahir: '2008-01-15', alamat: 'Jl. Pahlawan No. 3', namaAyah: 'Cipto', namaIbu: 'Dewi', noHp: '08561234987', username: 'bimasakti', password: 'password123' },
];

export const MasterSiswa = () => {
  const { siswaData: data, setSiswaData: setData, kelasData } = useDatabase();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKelas, setFilterKelas] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedSiswa, setSelectedSiswa] = useState<any | null>(null);
  
  const [formData, setFormData] = useState({ 
    id: '', nis: '', nisn: '', nama: '', jk: 'L', kelas: 'VII-A', status: 'Aktif', 
    tempatLahir: '', tanggalLahir: '', alamat: '', namaAyah: '', namaIbu: '', noHp: '', username: '', password: 'password123' 
  });
  
  const printAreaRef = useRef<HTMLDivElement>(null);

  const filteredData = data.filter(siswa => 
    (siswa.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
     siswa.nis.includes(searchTerm) || 
     siswa.nisn.includes(searchTerm)) &&
    (filterKelas === '' || siswa.kelas === filterKelas)
  );

  const uniqueKelas = Array.from(new Set(kelasData.map(k => k.namaKelas).filter((k): k is string => Boolean(k)))).sort();

  const handleOpenModal = (siswa?: typeof INITIAL_DATA[0]) => {
    if (siswa) {
      setFormData(siswa);
    } else {
      setFormData({ 
        id: '', nis: '', nisn: '', nama: '', jk: 'L', kelas: 'VII-A', status: 'Aktif', 
        tempatLahir: '', tanggalLahir: '', alamat: '', namaAyah: '', namaIbu: '', noHp: '', username: '', password: 'password123' 
      });
    }
    setIsModalOpen(true);
    setIsDetailOpen(false);
  };

  const handleViewDetail = (siswa: typeof INITIAL_DATA[0]) => {
    setSelectedSiswa(siswa);
    setIsDetailOpen(true);
  };

  const generateUsername = (nama: string) => {
    if (!formData.id) { // Only auto-generate if it's a new user
      const un = nama.toLowerCase().replace(/[^a-z0-9]/g, '');
      setFormData(prev => ({ ...prev, nama, username: un }));
    } else {
      setFormData(prev => ({ ...prev, nama }));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.id) {
      setData(data.map(item => item.id === formData.id ? formData : item));
      Swal.fire('Berhasil!', 'Data siswa berhasil diupdate.', 'success');
    } else {
      setData([...data, { ...formData, id: Date.now().toString() }]);
      Swal.fire('Berhasil!', 'Data siswa berhasil ditambahkan.', 'success');
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, nama: string) => {
    Swal.fire({
      title: 'Apakah Anda yakin?',
      text: `Menghapus data siswa ${nama} dari sistem?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        setData(data.filter(item => item.id !== id));
        Swal.fire('Terhapus!', 'Data siswa berhasil dihapus.', 'success');
      }
    });
  };

  const getPrintHtml = (siswaList: typeof INITIAL_DATA) => {
    return `
      <html>
        <head>
          <title>Print Kartu Pelajar</title>
          <style>
            @media print {
              body { margin: 0; padding: 0; }
              .page-break { page-break-after: always; }
            }
            body { font-family: sans-serif; display: flex; flex-wrap: wrap; justify-content: center; background: #fff; }
              .kartu-container {
    width: 8.5cm;
    height: 5.4cm;
    border: 1px solid #cbd5e1;
    border-radius: 12px;
    padding: 0;
    box-sizing: border-box;
    display: inline-block;
    margin: 10px;
    font-family: sans-serif;
    position: relative;
    background: #ffffff;
    background-image: radial-gradient(#e2e8f0 1px, transparent 1px);
    background-size: 10px 10px;
    color: #0f172a;
    overflow: hidden;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  }

  .kartu-header {
    text-align: center;
    background: linear-gradient(to right, #4f46e5, #3b82f6);
    padding: 10px 5px;
    color: #ffffff;
    border-bottom: 3px solid #f59e0b;
  }

  .kartu-header h2 { margin: 0; font-size: 14px; font-weight: bold; letter-spacing: 1px; }

  .kartu-header h3 { margin: 0; font-size: 9px; font-weight: normal; opacity: 0.9; margin-top: 2px; }

  .kartu-body { font-size: 10px; line-height: 1.4; display: flex; padding: 12px; }

  .kartu-photo { 
    width: 55px; height: 75px; 
    border: 2px solid #e2e8f0; 
    border-radius: 6px;
    margin-right: 12px; 
    text-align: center; 
    line-height: 75px; 
    font-size: 8px; 
    color: #94a3b8;
    background: #f8fafc;
  }

  .kartu-info { flex: 1; }

  .kartu-info table { width: 100%; border-collapse: collapse; }

  .kartu-info td { vertical-align: top; padding-bottom: 4px; }

              .kartu-info td:first-child { width: 55px; font-weight: bold; color: #475569; }
            .kartu-qr { margin-left: 8px; display: flex; align-items: flex-end; justify-content: flex-end; }


          </style>
        </head>
        <body>
          ${siswaList.map(s => `
            <div class="kartu-container">
              <div class="kartu-header">
                <h2>KARTU PELAJAR</h2>
                <h3>SMP AL-HIKAM</h3>
              </div>
              <div class="kartu-body">
                <div class="kartu-photo">Foto<br>3x4</div>
                <div class="kartu-info">
                  <table>
                    <tr><td>NIS/NISN</td><td>: ${s.nis} / ${s.nisn}</td></tr>
                    <tr><td>Nama</td><td>: <b>${s.nama}</b></td></tr>
                    <tr><td>TTL</td><td>: ${s.tempatLahir || '-'}, ${s.tanggalLahir || '-'}</td></tr>
                    <tr><td>Kelas</td><td>: ${s.kelas}</td></tr>
                    <tr><td>Alamat</td><td>: ${s.alamat || '-'}</td></tr>
                  </table>
                </div>
                <div class="kartu-qr">
                  <img src="https://quickchart.io/qr?text=${s.nis || s.id}&size=60&margin=1" alt="QR" style="width: 50px; height: 50px; border: 1px solid #e2e8f0; border-radius: 4px; padding: 2px; background: white;" />
                </div>
              </div>
            </div>
          `).join('')}
          <script>
            window.onload = () => { window.print(); setTimeout(window.close, 500); }
          </script>
        </body>
      </html>
    `;
  };

  const handlePrintIndividu = (siswa: typeof INITIAL_DATA[0]) => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(getPrintHtml([siswa]));
      printWindow.document.close();
    }
  };

  const handlePrintBulk = () => {
    if (filteredData.length === 0) {
      Swal.fire('Info', 'Tidak ada data siswa untuk dicetak', 'info');
      return;
    }
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(getPrintHtml(filteredData));
      printWindow.document.close();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Master Data Siswa</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola data peserta didik SMP Al-Hikam</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-4 sm:mt-0">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium rounded-lg transition-colors text-sm">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Import/Export
          </button>
          <button onClick={handlePrintBulk} className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 font-medium rounded-lg transition-colors text-sm">
            <Printer className="w-4 h-4" />
            Print Semua Kartu
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 font-medium rounded-lg transition-colors shadow-sm shadow-blue-600/20 text-sm"
          >
            <Plus className="w-4 h-4" />
            Tambah Siswa
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari NIS, Nama, Kelas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select 
              value={filterKelas} 
              onChange={e => setFilterKelas(e.target.value)}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full sm:w-auto"
            >
              <option value="">Semua Kelas</option>
              {uniqueKelas.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">No</th>
                <th className="px-6 py-4">NIS / NISN</th>
                <th className="px-6 py-4">Nama Lengkap</th>
                <th className="px-6 py-4">L/P</th>
                <th className="px-6 py-4">Kelas</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredData.length > 0 ? (
                filteredData.map((siswa, index) => (
                  <tr key={siswa.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{index + 1}</td>
                    <td className="px-6 py-4 font-mono text-slate-500">
                      <div>{siswa.nis}</div>
                      <div className="text-xs text-slate-400">{siswa.nisn}</div>
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleViewDetail(siswa)} className="font-bold text-blue-600 hover:text-blue-800 text-left transition-colors">
                        {siswa.nama}
                      </button>
                    </td>
                    <td className="px-6 py-4">{siswa.jk}</td>
                    <td className="px-6 py-4">{siswa.kelas}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        siswa.status === 'Aktif' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {siswa.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handlePrintIndividu(siswa)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Download Kartu">
                          <IdCard className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleOpenModal(siswa)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(siswa.id, siswa.nama)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    Tidak ada data siswa yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail Siswa */}
      {isDetailOpen && selectedSiswa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between shrink-0">
              <h3 className="text-xl font-bold text-slate-800">Detail Siswa</h3>
              <button onClick={() => setIsDetailOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-sm font-bold text-indigo-600 uppercase mb-4">Identitas Siswa</h4>
                  <table className="w-full text-sm text-slate-700">
                    <tbody>
                      <tr><td className="py-2 text-slate-500 w-1/3">NIS / NISN</td><td className="py-2 font-medium">{selectedSiswa.nis} / {selectedSiswa.nisn}</td></tr>
                      <tr><td className="py-2 text-slate-500">Nama Lengkap</td><td className="py-2 font-medium">{selectedSiswa.nama}</td></tr>
                      <tr><td className="py-2 text-slate-500">Tempat, Tgl Lahir</td><td className="py-2">{selectedSiswa.tempatLahir || '-'}, {selectedSiswa.tanggalLahir || '-'}</td></tr>
                      <tr><td className="py-2 text-slate-500">Jenis Kelamin</td><td className="py-2">{selectedSiswa.jk === 'L' ? 'Laki-laki' : 'Perempuan'}</td></tr>
                      <tr><td className="py-2 text-slate-500">Kelas</td><td className="py-2 font-medium">{selectedSiswa.kelas}</td></tr>
                      <tr><td className="py-2 text-slate-500">Alamat</td><td className="py-2">{selectedSiswa.alamat || '-'}</td></tr>
                      <tr><td className="py-2 text-slate-500">Status</td><td className="py-2"><span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 text-xs">{selectedSiswa.status}</span></td></tr>
                    </tbody>
                  </table>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-indigo-600 uppercase mb-4">Data Orang Tua & Akun</h4>
                  <table className="w-full text-sm text-slate-700">
                    <tbody>
                      <tr><td className="py-2 text-slate-500 w-1/3">Nama Ayah</td><td className="py-2">{selectedSiswa.namaAyah || '-'}</td></tr>
                      <tr><td className="py-2 text-slate-500">Nama Ibu</td><td className="py-2">{selectedSiswa.namaIbu || '-'}</td></tr>
                      <tr><td className="py-2 text-slate-500">No. HP</td><td className="py-2">{selectedSiswa.noHp || '-'}</td></tr>
                      <tr><td colSpan={2}><hr className="my-2 border-slate-200" /></td></tr>
                      <tr><td className="py-2 text-slate-500">Username</td><td className="py-2 font-mono bg-slate-100 px-2 rounded">{selectedSiswa.username || '-'}</td></tr>
                      <tr><td className="py-2 text-slate-500">Password</td><td className="py-2 font-mono bg-slate-100 px-2 rounded">{selectedSiswa.password || '-'}</td></tr>
                    </tbody>
                  </table>
                  <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-4">
                    <img src={`https://quickchart.io/qr?text=${selectedSiswa.nis || selectedSiswa.id}&size=100&margin=1`} alt="QR" className="w-16 h-16 bg-white border border-slate-200 rounded p-1" />
                    <div>
                      <p className="text-sm font-bold text-slate-700">QR Code Identitas</p>
                      <p className="text-xs text-slate-500">Dapat digunakan untuk scan kehadiran atau id</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3 shrink-0 bg-slate-50">
              <button onClick={() => setIsDetailOpen(false)} className="px-4 py-2 text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 font-medium rounded-lg transition-colors">Tutup</button>
              <button onClick={() => handleOpenModal(selectedSiswa)} className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 font-medium rounded-lg transition-colors">Edit Data</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah/Edit Siswa Lengkap */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between shrink-0">
              <h3 className="text-xl font-bold text-slate-800">
                {formData.id ? 'Edit Siswa' : 'Tambah Siswa Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <form id="formSiswa" onSubmit={handleSave} className="space-y-8">
                {/* Identitas Siswa */}
                <div>
                  <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">Identitas Siswa</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">NIS</label>
                      <input type="text" required value={formData.nis} onChange={e => setFormData({...formData, nis: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">NISN</label>
                      <input type="text" required value={formData.nisn} onChange={e => setFormData({...formData, nisn: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
                      <input type="text" required value={formData.nama} onChange={e => generateUsername(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Tempat Lahir</label>
                      <input type="text" value={formData.tempatLahir} onChange={e => setFormData({...formData, tempatLahir: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Lahir</label>
                      <input type="date" value={formData.tanggalLahir} onChange={e => setFormData({...formData, tanggalLahir: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Jenis Kelamin</label>
                      <select required value={formData.jk} onChange={e => setFormData({...formData, jk: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                        <option value="L">Laki-laki (L)</option>
                        <option value="P">Perempuan (P)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Kelas</label>
                      <select required value={formData.kelas} onChange={e => setFormData({...formData, kelas: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                        {uniqueKelas.map(k => <option key={k} value={k}>{k}</option>)}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Alamat Lengkap</label>
                      <textarea rows={2} value={formData.alamat} onChange={e => setFormData({...formData, alamat: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
                    </div>
                  </div>
                </div>

                {/* Orang Tua */}
                <div>
                  <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">Data Orang Tua / Wali</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Nama Ayah</label>
                      <input type="text" value={formData.namaAyah} onChange={e => setFormData({...formData, namaAyah: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Nama Ibu</label>
                      <input type="text" value={formData.namaIbu} onChange={e => setFormData({...formData, namaIbu: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">No. HP Orang Tua</label>
                      <input type="text" value={formData.noHp} onChange={e => setFormData({...formData, noHp: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Status Keaktifan</label>
                      <select required value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                        <option value="Aktif">Aktif</option>
                        <option value="Lulus">Lulus</option>
                        <option value="Pindah">Pindah</option>
                        <option value="Keluar">Keluar</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Akun */}
                <div>
                  <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">Akun Akses Sistem</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Username <span className="text-xs text-slate-400 font-normal">(Otomatis dari nama)</span></label>
                      <input type="text" required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                      <input type="text" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3 shrink-0 bg-slate-50">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 font-medium rounded-lg transition-colors">Batal</button>
              <button type="submit" form="formSiswa" className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 font-medium rounded-lg transition-colors">Simpan Data</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
