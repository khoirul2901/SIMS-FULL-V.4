import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { SlipGaji } from '../types/keuangan';
import { Plus, Search, Filter, Printer, Trash2, Banknote, Calendar, CheckCircle, FileText, UserCheck, FileSpreadsheet } from 'lucide-react';
import Swal from 'sweetalert2';

export const Penggajian = () => {
  const { payrollData, setPayrollData, guruData } = useDatabase();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBulan, setFilterBulan] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlip, setSelectedSlip] = useState<SlipGaji | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<SlipGaji>>({
    bulan: 'Juli 2025',
    tahun: 2025,
    guruId: '',
    namaGuru: '',
    nip: '',
    jabatan: 'Guru Mata Pelajaran',
    statusPegawai: 'GTY',
    gajiPokok: 3000000,
    tunjanganJabatan: 400000,
    honorJam: 1000000,
    jumlahJam: 20,
    bonusInsentif: 200000,
    potonganAbsen: 0,
    potonganBPJS: 100000,
    potonganPinjaman: 0,
    metode: 'Transfer Bank',
    status: 'Lunas'
  });

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka);
  };

  const filteredData = payrollData.filter(item => {
    const matchSearch = item.namaGuru.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.nip.includes(searchTerm) ||
                        item.noSlip.toLowerCase().includes(searchTerm.toLowerCase());
    const matchBulan = filterBulan === '' || item.bulan === filterBulan;
    return matchSearch && matchBulan;
  });

  const totalPayroll = payrollData.reduce((acc, curr) => acc + curr.totalDiterima, 0);

  const handleSelectGuru = (guruId: string) => {
    const guru = guruData.find(g => g.id === guruId);
    if (guru) {
      setFormData({
        ...formData,
        guruId: guru.id,
        namaGuru: guru.nama,
        nip: guru.nip || '198501012010011001',
        jabatan: guru.jabatan || 'Guru Mata Pelajaran',
        statusPegawai: guru.status || 'GTY',
        gajiPokok: guru.jabatan?.includes('Wali') ? 3500000 : 3000000,
        tunjanganJabatan: guru.jabatan?.includes('Wali') ? 600000 : 400000,
      });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaGuru) {
      Swal.fire('Peringatan', 'Pilih guru / pegawai terlebih dahulu!', 'warning');
      return;
    }

    const totalPenerimaan = Number(formData.gajiPokok || 0) + 
                            Number(formData.tunjanganJabatan || 0) + 
                            Number(formData.honorJam || 0) + 
                            Number(formData.bonusInsentif || 0);

    const totalPotongan = Number(formData.potonganAbsen || 0) + 
                          Number(formData.potonganBPJS || 0) + 
                          Number(formData.potonganPinjaman || 0);

    const totalNet = totalPenerimaan - totalPotongan;

    const newNo = `SLIP/${new Date().getFullYear()}/${String(payrollData.length + 1).padStart(3, '0')}`;

    const newSlip: SlipGaji = {
      id: `PAY-${Date.now()}`,
      bulan: formData.bulan || 'Juli 2025',
      tahun: Number(formData.tahun) || 2025,
      guruId: formData.guruId || '1',
      namaGuru: formData.namaGuru || '',
      nip: formData.nip || '-',
      jabatan: formData.jabatan || 'Guru Mata Pelajaran',
      statusPegawai: formData.statusPegawai || 'GTY',
      gajiPokok: Number(formData.gajiPokok || 0),
      tunjanganJabatan: Number(formData.tunjanganJabatan || 0),
      honorJam: Number(formData.honorJam || 0),
      jumlahJam: Number(formData.jumlahJam || 0),
      bonusInsentif: Number(formData.bonusInsentif || 0),
      potonganAbsen: Number(formData.potonganAbsen || 0),
      potonganBPJS: Number(formData.potonganBPJS || 0),
      potonganPinjaman: Number(formData.potonganPinjaman || 0),
      totalDiterima: totalNet,
      tanggalBayar: new Date().toISOString().split('T')[0],
      metode: formData.metode as any || 'Transfer Bank',
      status: 'Lunas',
      noSlip: newNo
    };

    setPayrollData([newSlip, ...payrollData]);
    setIsModalOpen(false);

    Swal.fire({
      title: 'Slip Gaji Berhasil Dibuat!',
      text: `Slip gaji atas nama ${newSlip.namaGuru} sejumlah ${formatRupiah(newSlip.totalDiterima)} telah diproses.`,
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    });
  };

  const handleDelete = (id: string, nama: string) => {
    Swal.fire({
      title: 'Hapus Slip Gaji?',
      text: `Anda yakin ingin menghapus slip gaji ${nama}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        setPayrollData(payrollData.filter(item => item.id !== id));
        Swal.fire('Terhapus', 'Slip gaji berhasil dihapus.', 'success');
      }
    });
  };

  const handleExportCSV = () => {
    const headers = ['No Slip', 'Bulan', 'Nama Guru', 'NIP', 'Jabatan', 'Gaji Pokok', 'Tunjangan', 'Honor Jam', 'Total Potongan', 'Gaji Bersih (Net)'];
    const rows = filteredData.map(item => [
      item.noSlip,
      item.bulan,
      `"${item.namaGuru}"`,
      item.nip,
      item.jabatan,
      item.gajiPokok,
      item.tunjanganJabatan,
      item.honorJam,
      item.potonganAbsen + item.potonganBPJS + item.potonganPinjaman,
      item.totalDiterima
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Payroll_Gaji_Guru_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Banknote className="w-7 h-7 text-indigo-600" /> Penggajian & Slip Gaji Guru / Staf
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Pengelolaan gaji pokok, tunjangan, honor mengajar jam, insentif & pencetakan slip gaji resmi
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 rounded-xl text-xs font-semibold transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" /> Hitung & Buat Slip Gaji
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm border-l-4 border-l-indigo-600">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Anggaran Payroll</p>
          <h3 className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">{formatRupiah(totalPayroll)}</h3>
          <p className="text-xs text-slate-500 mt-1">{payrollData.length} Slip Gaji Terbit</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm border-l-4 border-l-emerald-500">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Status Pencairan Gaji</p>
          <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1.5">
            <CheckCircle className="w-5 h-5" /> 100% Terbayar
          </h3>
          <p className="text-xs text-slate-500 mt-1">Selesai via Transfer Bank</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rata-rata Gaji Per Guru</p>
          <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white mt-1">
            {formatRupiah(payrollData.length > 0 ? totalPayroll / payrollData.length : 0)}
          </h3>
          <p className="text-xs text-slate-500 mt-1">Inklud Tunjangan & Honor Jam</p>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Filter bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama guru, NIP, no slip..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={filterBulan}
              onChange={(e) => setFilterBulan(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">Semua Periode Bulan</option>
              <option value="Juli 2025">Juli 2025</option>
              <option value="Agustus 2025">Agustus 2025</option>
              <option value="September 2025">September 2025</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 uppercase font-bold tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Guru / Pegawai</th>
                <th className="px-5 py-3.5">Bulan & No. Slip</th>
                <th className="px-5 py-3.5">Gaji Pokok</th>
                <th className="px-5 py-3.5">Tunjangan & Honor</th>
                <th className="px-5 py-3.5">Total Potongan</th>
                <th className="px-5 py-3.5 text-right">Gaji Bersih (Net)</th>
                <th className="px-5 py-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredData.length > 0 ? (
                filteredData.map((item) => {
                  const totalTunjangan = item.tunjanganJabatan + item.honorJam + item.bonusInsentif;
                  const totalPotongan = item.potonganAbsen + item.potonganBPJS + item.potonganPinjaman;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="font-bold text-slate-800 dark:text-slate-100">{item.namaGuru}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">NIP: {item.nip} • {item.jabatan}</div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="font-semibold text-indigo-600 dark:text-indigo-400">{item.bulan}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{item.noSlip}</div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap font-medium text-slate-700 dark:text-slate-300">
                        {formatRupiah(item.gajiPokok)}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap font-medium text-emerald-600 dark:text-emerald-400">
                        +{formatRupiah(totalTunjangan)}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap font-medium text-red-500">
                        -{formatRupiah(totalPotongan)}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-right font-extrabold text-slate-900 dark:text-white text-sm">
                        {formatRupiah(item.totalDiterima)}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedSlip(item)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 rounded-lg transition-colors font-semibold"
                            title="Cetak Slip Gaji"
                          >
                            <Printer className="w-3.5 h-3.5" /> Slip
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.namaGuru)}
                            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors"
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
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    Tidak ada data slip gaji yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Hitung & Buat Slip Gaji */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Banknote className="w-5 h-5 text-indigo-600" /> Form Hitung & Buat Slip Gaji
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Pilih Guru / Staf *
                  </label>
                  <select
                    required
                    onChange={(e) => handleSelectGuru(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="">-- Pilih Guru --</option>
                    {guruData.map((guru) => (
                      <option key={guru.id} value={guru.id}>
                        {guru.nama} ({guru.jabatan || 'Guru'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Periode Bulan Gaji
                  </label>
                  <select
                    value={formData.bulan}
                    onChange={(e) => setFormData({ ...formData, bulan: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="Juli 2025">Juli 2025</option>
                    <option value="Agustus 2025">Agustus 2025</option>
                    <option value="September 2025">September 2025</option>
                    <option value="Oktober 2025">Oktober 2025</option>
                  </select>
                </div>
              </div>

              {/* Rincian Penerimaan */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <h4 className="text-xs font-extrabold text-indigo-600 uppercase tracking-wider">A. Rincian Penerimaan (Komponen Gaji)</h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Gaji Pokok (Rp)</label>
                    <input
                      type="number"
                      value={formData.gajiPokok || 0}
                      onChange={(e) => setFormData({ ...formData, gajiPokok: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Tunjangan Jabatan (Rp)</label>
                    <input
                      type="number"
                      value={formData.tunjanganJabatan || 0}
                      onChange={(e) => setFormData({ ...formData, tunjanganJabatan: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Honor Mengajar Jam (Rp)</label>
                    <input
                      type="number"
                      value={formData.honorJam || 0}
                      onChange={(e) => setFormData({ ...formData, honorJam: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Bonus Insentif (Rp)</label>
                    <input
                      type="number"
                      value={formData.bonusInsentif || 0}
                      onChange={(e) => setFormData({ ...formData, bonusInsentif: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Rincian Potongan */}
              <div className="bg-red-50/50 dark:bg-red-950/20 p-4 rounded-2xl border border-red-200/60 dark:border-red-900/40 space-y-3">
                <h4 className="text-xs font-extrabold text-red-600 uppercase tracking-wider">B. Rincian Potongan</h4>
                
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">BPJS (Rp)</label>
                    <input
                      type="number"
                      value={formData.potonganBPJS || 0}
                      onChange={(e) => setFormData({ ...formData, potonganBPJS: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-red-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Potongan Absen (Rp)</label>
                    <input
                      type="number"
                      value={formData.potonganAbsen || 0}
                      onChange={(e) => setFormData({ ...formData, potonganAbsen: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-red-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Pinjaman / Kasbon (Rp)</label>
                    <input
                      type="number"
                      value={formData.potonganPinjaman || 0}
                      onChange={(e) => setFormData({ ...formData, potonganPinjaman: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-red-600"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all"
                >
                  Simpan & Terbitkan Slip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Preview Slip Gaji */}
      {selectedSlip && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl relative text-slate-800 animate-in zoom-in-95 duration-200 border border-slate-200">
            <button
              onClick={() => setSelectedSlip(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold"
            >
              ✕
            </button>

            {/* Kop Surat */}
            <div className="text-center pb-4 border-b-2 border-slate-800 mb-6">
              <h2 className="text-lg font-black uppercase tracking-wider text-slate-900">SMP AL-HIKAM</h2>
              <p className="text-[11px] text-slate-600">Jl. Pendidikan No. 45, Kecamatan Sukajaya • Telp: (021) 7890123</p>
              <div className="inline-block px-3 py-0.5 bg-indigo-600 text-white text-[10px] font-bold rounded-full uppercase mt-2">
                SLIP GAJI RESMI • {selectedSlip.bulan}
              </div>
            </div>

            {/* Identitas Guru */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs mb-4 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Nama Guru / Pegawai:</span>
                <span className="font-bold text-slate-900">{selectedSlip.namaGuru}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">NIP / NUPTK:</span>
                <span className="font-semibold text-slate-800">{selectedSlip.nip}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Jabatan:</span>
                <span className="font-semibold text-slate-800">{selectedSlip.jabatan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">No. Slip:</span>
                <span className="font-extrabold text-indigo-600">{selectedSlip.noSlip}</span>
              </div>
            </div>

            {/* Tabel Rincian */}
            <div className="grid grid-cols-2 gap-4 text-xs mb-6">
              <div className="space-y-2">
                <p className="font-extrabold text-emerald-700 border-b pb-1">PENERIMAAN</p>
                <div className="flex justify-between">
                  <span>Gaji Pokok:</span>
                  <span className="font-semibold">{formatRupiah(selectedSlip.gajiPokok)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tunj. Jabatan:</span>
                  <span className="font-semibold">{formatRupiah(selectedSlip.tunjanganJabatan)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Honor Mengajar:</span>
                  <span className="font-semibold">{formatRupiah(selectedSlip.honorJam)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Bonus / Insentif:</span>
                  <span className="font-semibold">{formatRupiah(selectedSlip.bonusInsentif)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-extrabold text-red-700 border-b pb-1">POTONGAN</p>
                <div className="flex justify-between text-red-600">
                  <span>BPJS:</span>
                  <span className="font-semibold">{formatRupiah(selectedSlip.potonganBPJS)}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Potongan Absen:</span>
                  <span className="font-semibold">{formatRupiah(selectedSlip.potonganAbsen)}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Kasbon / Pinjaman:</span>
                  <span className="font-semibold">{formatRupiah(selectedSlip.potonganPinjaman)}</span>
                </div>
              </div>
            </div>

            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-emerald-900 block">TOTAL GAJI BERSIH (NET):</span>
                <span className="text-[10px] text-emerald-700">Metode: {selectedSlip.metode}</span>
              </div>
              <span className="text-xl font-black text-emerald-700">{formatRupiah(selectedSlip.totalDiterima)}</span>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-4 text-center text-[10px] text-slate-600 mt-6 pt-4 border-t border-slate-200">
              <div>
                <p className="mb-10 font-semibold">Penerima</p>
                <p className="font-bold underline text-slate-800">{selectedSlip.namaGuru}</p>
              </div>
              <div>
                <p className="mb-10 font-semibold">Bendahara Sekolah</p>
                <p className="font-bold underline text-slate-800">Budi Santoso, S.Pd</p>
              </div>
            </div>

            {/* Action */}
            <div className="mt-6 flex justify-end gap-3 print:hidden">
              <button
                onClick={() => window.print()}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg"
              >
                <Printer className="w-4 h-4" /> Cetak Slip Gaji Resmi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
