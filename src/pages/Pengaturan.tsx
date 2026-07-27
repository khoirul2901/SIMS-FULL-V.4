import React from 'react';
import { Save, Building2, Clock, Calendar, Database, ShieldAlert } from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import Swal from 'sweetalert2';

export const Pengaturan = () => {
  const { resetDatabase } = useDatabase();

  const handleSave = () => {
    Swal.fire({
      icon: 'success',
      title: 'Tersimpan',
      text: 'Pengaturan sistem berhasil diperbarui.',
      timer: 1500,
      showConfirmButton: false
    });
  };

  const handleResetDatabase = () => {
    Swal.fire({
      title: 'Apakah Anda yakin?',
      text: 'Seluruh data transaksi, siswa, guru, kelas, absensi, dan pelanggaran akan dikembalikan ke data awal bawaan!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Ya, Reset Semuanya!',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        resetDatabase();
        Swal.fire(
          'Ter-reset!',
          'Database aplikasi berhasil dikembalikan ke pengaturan awal.',
          'success'
        );
      }
    });
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Pengaturan Sistem</h1>
          <p className="text-sm text-slate-500 mt-1">Konfigurasi identitas sekolah dan parameter aplikasi</p>
        </div>
        <button 
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 font-medium rounded-lg transition-colors shadow-sm shadow-blue-600/20 text-sm"
        >
          <Save className="w-4 h-4" />
          Simpan Perubahan
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Identitas Sekolah */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-slate-500" />
              <h3 className="font-bold text-slate-800">Identitas Sekolah</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Nama Sekolah</label>
                  <input type="text" defaultValue="SMP Al-Hikam" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">NPSN</label>
                  <input type="text" defaultValue="20512345" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Alamat Lengkap</label>
                <textarea rows={3} defaultValue="Jl. Pendidikan No. 123, Kec. Sukamaju, Kota Belajar" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"></textarea>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Kepala Sekolah</label>
                  <input type="text" defaultValue="Dr. H. Mulyono, M.Pd" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">NIP Kepala Sekolah</label>
                  <input type="text" defaultValue="197001011995121001" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-slate-500" />
              <h3 className="font-bold text-slate-800">Parameter Akademik</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Tahun Ajaran Aktif</label>
                  <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                    <option>2023/2024</option>
                    <option>2022/2023</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Semester Aktif</label>
                  <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                    <option>Ganjil</option>
                    <option>Genap</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Jam Masuk Default</label>
                  <input type="time" defaultValue="07:00" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Batas Terlambat</label>
                  <input type="time" defaultValue="07:15" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Tools */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
              <Database className="w-5 h-5 text-slate-500" />
              <h3 className="font-bold text-slate-800">Manajemen Database</h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-500 leading-relaxed mb-4">
                Lakukan pencadangan (backup) data secara rutin untuk mencegah kehilangan data. Data akan diunduh dalam format Spreadsheet terkompresi.
              </p>
              <button className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-lg transition-colors text-sm flex items-center justify-center gap-2">
                <Database className="w-4 h-4" />
                Backup Database Sekarang
              </button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-slate-400">atau</span>
                </div>
              </div>
              <button className="w-full py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors text-sm">
                Restore dari Backup
              </button>
            </div>
          </div>

          <div className="bg-red-50 rounded-2xl border border-red-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-red-200 bg-red-100 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-600" />
              <h3 className="font-bold text-red-800">Zona Berbahaya</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-red-700 leading-relaxed mb-4">
                Tindakan di bawah ini tidak dapat dibatalkan dan akan menghapus seluruh data transaksi sistem.
              </p>
              <button 
                onClick={handleResetDatabase}
                className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors text-sm shadow-sm"
              >
                Reset Data Transaksi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
