import React, { useState, useRef } from 'react';
import { Plus, Search, Filter, FileSpreadsheet, Edit2, Trash2, IdCard, X, Printer, MoreVertical } from 'lucide-react';
import Swal from 'sweetalert2';
import { useDatabase } from '../context/DatabaseContext';

const INITIAL_DATA = [
  { id: '1', nip: '198001012005011001', nama: 'Budi Santoso, S.Pd', jk: 'L', mapel: 'Matematika', status: 'Aktif', tempatLahir: 'Jakarta', tanggalLahir: '1980-01-01', alamat: 'Jl. Pendidikan No 1', statusPegawai: 'GTY', jabatan: 'Guru Kelas', pendidikan: 'S1', jurusan: 'Pendidikan Matematika', tahunLulus: '2004', noHp: '08123456789', username: 'budisantoso', password: 'password123' },
  { id: '2', nip: '198205122008012003', nama: 'Siti Aminah, M.Pd', jk: 'P', mapel: 'Bahasa Indonesia', status: 'Aktif', tempatLahir: 'Bandung', tanggalLahir: '1982-05-12', alamat: 'Jl. Merdeka No 2', statusPegawai: 'GTY', jabatan: 'Guru Kelas', pendidikan: 'S2', jurusan: 'Pendidikan Bahasa Indonesia', tahunLulus: '2007', noHp: '08987654321', username: 'sitiaminah', password: 'password123' },
];

export const MasterGuru = () => {
  const { guruData: data, setGuruData: setData } = useDatabase();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatusPegawai, setFilterStatusPegawai] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedGuru, setSelectedGuru] = useState<any | null>(null);
  
  const [formData, setFormData] = useState({ 
    id: '', nip: '', nama: '', jk: 'L', mapel: '-', status: 'Aktif', 
    tempatLahir: '', tanggalLahir: '', alamat: '', 
    statusPegawai: 'GTY', jabatan: 'Guru', pendidikan: '', jurusan: '', tahunLulus: '', noHp: '', 
    username: '', password: 'password123' 
  });
  
  const printAreaRef = useRef<HTMLDivElement>(null);

  const filteredData = data.filter(guru => 
    (guru.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
     guru.nip.includes(searchTerm) || 
     guru.mapel.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterStatusPegawai === '' || guru.statusPegawai === filterStatusPegawai)
  );

  const uniqueStatusPegawai = Array.from(new Set(data.map(s => s.statusPegawai).filter((s): s is string => Boolean(s)))).sort();

  const handleOpenModal = (guru?: typeof INITIAL_DATA[0]) => {
    if (guru) {
      setFormData(guru);
    } else {
      setFormData({ 
        id: '', nip: '', nama: '', jk: 'L', mapel: '-', status: 'Aktif', 
        tempatLahir: '', tanggalLahir: '', alamat: '', 
        statusPegawai: 'GTY', jabatan: 'Guru', pendidikan: '', jurusan: '', tahunLulus: '', noHp: '', 
        username: '', password: 'password123' 
      });
    }
    setIsModalOpen(true);
    setIsDetailOpen(false);
  };

  const handleViewDetail = (guru: typeof INITIAL_DATA[0]) => {
    setSelectedGuru(guru);
    setIsDetailOpen(true);
  };

  const generateUsername = (nama: string) => {
    if (!formData.id) { // Only auto-generate if it's a new user
      const un = nama.split(',')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      setFormData(prev => ({ ...prev, nama, username: un }));
    } else {
      setFormData(prev => ({ ...prev, nama }));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.id) {
      setData(data.map(item => item.id === formData.id ? formData : item));
      Swal.fire('Berhasil!', 'Data guru berhasil diupdate.', 'success');
    } else {
      setData([...data, { ...formData, id: Date.now().toString() }]);
      Swal.fire('Berhasil!', 'Data guru berhasil ditambahkan.', 'success');
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, nama: string) => {
    Swal.fire({
      title: 'Apakah Anda yakin?',
      text: `Menghapus data guru ${nama} dari sistem?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        setData(data.filter(item => item.id !== id));
        Swal.fire('Terhapus!', 'Data guru berhasil dihapus.', 'success');
      }
    });
  };

  const getPrintHtml = (guruList: typeof INITIAL_DATA) => {
    return `
      <html>
        <head>
          <title>Print Kartu Guru</title>
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
              background: linear-gradient(to right, #0ea5e9, #2563eb);
              padding: 10px 5px;
              color: #ffffff;
              border-bottom: 3px solid #f59e0b;
            }
            .kartu-header h2 { margin: 0; font-size: 14px; font-weight: bold; letter-spacing: 1px; color: #ffffff; }
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
          ${guruList.map(g => `
            <div class="kartu-container">
              <div class="kartu-header">
                <h2>KARTU PEGAWAI</h2>
                <h3>SMP AL-HIKAM</h3>
              </div>
              <div class="kartu-body">
                <div class="kartu-photo">Foto<br>3x4</div>
                <div class="kartu-info">
                  <table>
                    <tr><td>NIP/NUPTK</td><td>: ${g.nip}</td></tr>
                    <tr><td>Nama</td><td>: <b>${g.nama}</b></td></tr>
                    <tr><td>TTL</td><td>: ${g.tempatLahir || '-'}, ${g.tanggalLahir || '-'}</td></tr>
                    <tr><td>Jabatan</td><td>: ${g.jabatan || g.mapel}</td></tr>
                    <tr><td>Status</td><td>: ${g.statusPegawai}</td></tr>
                  </table>
                </div>
                <div class="kartu-qr">
                  <img src="https://quickchart.io/qr?text=${g.nip || g.id}&size=60&margin=1" alt="QR" style="width: 50px; height: 50px; border: 1px solid #e2e8f0; border-radius: 4px; padding: 2px; background: white;" />
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

  const handlePrintIndividu = (guru: typeof INITIAL_DATA[0]) => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(getPrintHtml([guru]));
      printWindow.document.close();
    }
  };

  const handlePrintBulk = () => {
    if (filteredData.length === 0) {
      Swal.fire('Info', 'Tidak ada data guru untuk dicetak', 'info');
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
          <h1 className="text-2xl font-bold text-slate-800">Master Data Guru & Tendik</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola data Guru dan Tenaga Kependidikan SMP Al-Hikam</p>
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
            Tambah Guru
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari NIP, Nama, atau Mapel..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select 
              value={filterStatusPegawai} 
              onChange={e => setFilterStatusPegawai(e.target.value)}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full sm:w-auto"
            >
              <option value="">Semua Status Pegawai</option>
              {uniqueStatusPegawai.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">No</th>
                <th className="px-6 py-4">NIP/NUPTK</th>
                <th className="px-6 py-4">Nama Lengkap</th>
                <th className="px-6 py-4">L/P</th>
                <th className="px-6 py-4">Jabatan/Tugas</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredData.length > 0 ? (
                filteredData.map((guru, index) => (
                  <tr key={guru.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{index + 1}</td>
                    <td className="px-6 py-4 font-mono text-slate-500">{guru.nip}</td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleViewDetail(guru)} className="font-bold text-blue-600 hover:text-blue-800 text-left transition-colors">
                        {guru.nama}
                      </button>
                    </td>
                    <td className="px-6 py-4">{guru.jk}</td>
                    <td className="px-6 py-4">
                      <div>{guru.jabatan}</div>
                      <div className="text-xs text-slate-400">{guru.statusPegawai}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        guru.status === 'Aktif' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {guru.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handlePrintIndividu(guru)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Download Kartu">
                          <IdCard className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleOpenModal(guru)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(guru.id, guru.nama)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    Tidak ada data guru yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail Guru */}
      {isDetailOpen && selectedGuru && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between shrink-0">
              <h3 className="text-xl font-bold text-slate-800">Detail Guru & Tendik</h3>
              <button onClick={() => setIsDetailOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-sm font-bold text-indigo-600 uppercase mb-4">Identitas Guru</h4>
                  <table className="w-full text-sm text-slate-700">
                    <tbody>
                      <tr><td className="py-2 text-slate-500 w-1/3">NIP / NUPTK</td><td className="py-2 font-medium">{selectedGuru.nip}</td></tr>
                      <tr><td className="py-2 text-slate-500">Nama Lengkap</td><td className="py-2 font-medium">{selectedGuru.nama}</td></tr>
                      <tr><td className="py-2 text-slate-500">Tempat, Tgl Lahir</td><td className="py-2">{selectedGuru.tempatLahir || '-'}, {selectedGuru.tanggalLahir || '-'}</td></tr>
                      <tr><td className="py-2 text-slate-500">Jenis Kelamin</td><td className="py-2">{selectedGuru.jk === 'L' ? 'Laki-laki' : 'Perempuan'}</td></tr>
                      <tr><td className="py-2 text-slate-500">Alamat</td><td className="py-2">{selectedGuru.alamat || '-'}</td></tr>
                      <tr><td className="py-2 text-slate-500">No. HP</td><td className="py-2">{selectedGuru.noHp || '-'}</td></tr>
                      <tr><td className="py-2 text-slate-500">Status</td><td className="py-2"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-xs">{selectedGuru.status}</span></td></tr>
                    </tbody>
                  </table>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-indigo-600 uppercase mb-4">Biodata Kepegawaian & Akun</h4>
                  <table className="w-full text-sm text-slate-700">
                    <tbody>
                      <tr><td className="py-2 text-slate-500 w-1/3">Status Pegawai</td><td className="py-2 font-medium">{selectedGuru.statusPegawai || '-'}</td></tr>
                      <tr><td className="py-2 text-slate-500">Jabatan/Tugas</td><td className="py-2">{selectedGuru.jabatan || '-'}</td></tr>
                      <tr><td className="py-2 text-slate-500">Mata Pelajaran</td><td className="py-2">{selectedGuru.mapel || '-'}</td></tr>
                      <tr><td className="py-2 text-slate-500">Pend. Terakhir</td><td className="py-2">{selectedGuru.pendidikan || '-'}</td></tr>
                      <tr><td className="py-2 text-slate-500">Jurusan</td><td className="py-2">{selectedGuru.jurusan || '-'}</td></tr>
                      <tr><td className="py-2 text-slate-500">Tahun Lulus</td><td className="py-2">{selectedGuru.tahunLulus || '-'}</td></tr>
                      <tr><td colSpan={2}><hr className="my-2 border-slate-200" /></td></tr>
                      <tr><td className="py-2 text-slate-500">Username</td><td className="py-2 font-mono bg-slate-100 px-2 rounded">{selectedGuru.username || '-'}</td></tr>
                      <tr><td className="py-2 text-slate-500">Password</td><td className="py-2 font-mono bg-slate-100 px-2 rounded">{selectedGuru.password || '-'}</td></tr>
                    </tbody>
                  </table>
                  <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-4">
                    <img src={`https://quickchart.io/qr?text=${selectedGuru.nip || selectedGuru.id}&size=100&margin=1`} alt="QR" className="w-16 h-16 bg-white border border-slate-200 rounded p-1" />
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
              <button onClick={() => handleOpenModal(selectedGuru)} className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 font-medium rounded-lg transition-colors">Edit Data</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah/Edit Guru Lengkap */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between shrink-0">
              <h3 className="text-xl font-bold text-slate-800">
                {formData.id ? 'Edit Guru & Tendik' : 'Tambah Guru & Tendik Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <form id="formGuru" onSubmit={handleSave} className="space-y-8">
                {/* Identitas Guru */}
                <div>
                  <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">Identitas Guru & Tendik</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">NIP / NUPTK</label>
                      <input type="text" required value={formData.nip} onChange={e => setFormData({...formData, nip: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap & Gelar</label>
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
                      <label className="block text-sm font-medium text-slate-700 mb-1">No. HP / WhatsApp</label>
                      <input type="text" value={formData.noHp} onChange={e => setFormData({...formData, noHp: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Alamat Lengkap</label>
                      <textarea rows={2} value={formData.alamat} onChange={e => setFormData({...formData, alamat: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
                    </div>
                  </div>
                </div>

                {/* Kepegawaian */}
                <div>
                  <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">Biodata Kepegawaian</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Status Pegawai</label>
                      <select required value={formData.statusPegawai} onChange={e => setFormData({...formData, statusPegawai: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                        <option value="GTY">Guru Tetap Yayasan (GTY)</option>
                        <option value="GTT">Guru Tidak Tetap (GTT)</option>
                        <option value="PTY">Pegawai Tetap Yayasan (PTY)</option>
                        <option value="PTT">Pegawai Tidak Tetap (PTT)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Jabatan / Tugas</label>
                      <input type="text" value={formData.jabatan} onChange={e => setFormData({...formData, jabatan: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Mata Pelajaran <span className="text-xs text-slate-400 font-normal">(Opsional)</span></label>
                      <input type="text" value={formData.mapel} onChange={e => setFormData({...formData, mapel: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Status Keaktifan</label>
                      <select required value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                        <option value="Aktif">Aktif</option>
                        <option value="Cuti">Cuti</option>
                        <option value="Pensiun">Pensiun</option>
                        <option value="Keluar">Keluar</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Pendidikan Terakhir</label>
                      <select value={formData.pendidikan} onChange={e => setFormData({...formData, pendidikan: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                        <option value="">Pilih Pendidikan</option>
                        <option value="SMA/SMK">SMA/SMK</option>
                        <option value="D3">D3</option>
                        <option value="S1">S1</option>
                        <option value="S2">S2</option>
                        <option value="S3">S3</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Jurusan</label>
                      <input type="text" value={formData.jurusan} onChange={e => setFormData({...formData, jurusan: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Tahun Lulus</label>
                      <input type="text" value={formData.tahunLulus} onChange={e => setFormData({...formData, tahunLulus: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
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
              <button type="submit" form="formGuru" className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 font-medium rounded-lg transition-colors">Simpan Data</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
