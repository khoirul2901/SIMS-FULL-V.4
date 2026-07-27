import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { PengeluaranKas as IPengeluaranKas } from '../types/keuangan';
import { Plus, Search, Filter, Printer, Trash2, TrendingDown, DollarSign, Calendar, FileText, CheckCircle, ArrowUpRight, FileSpreadsheet } from 'lucide-react';
import Swal from 'sweetalert2';

export const PengeluaranKas = () => {
  const { pengeluaranKasData, setPengeluaranKasData } = useDatabase();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKategori, setFilterKategori] = useState('');
  const [filterSumber, setFilterSumber] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<IPengeluaranKas | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<IPengeluaranKas>>({
    tanggal: new Date().toISOString().split('T')[0],
    kategori: 'Operasional Sekolah',
    deskripsi: '',
    nominal: 0,
    sumberDana: 'Kas Tunai Utama',
    penanggungJawab: '',
    penerima: ''
  });

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka);
  };

  const filteredData = pengeluaranKasData.filter(item => {
    const matchSearch = item.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.noTransaksi.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (item.penanggungJawab && item.penanggungJawab.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchKategori = filterKategori === '' || item.kategori === filterKategori;
    const matchSumber = filterSumber === '' || item.sumberDana === filterSumber;
    return matchSearch && matchKategori && matchSumber;
  });

  const totalPengeluaran = pengeluaranKasData.reduce((acc, curr) => acc + curr.nominal, 0);
  const totalBulanIni = pengeluaranKasData.reduce((acc, curr) => {
    const currentMonth = new Date().getMonth();
    const itemMonth = new Date(curr.tanggal).getMonth();
    return currentMonth === itemMonth ? acc + curr.nominal : acc;
  }, 0);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.deskripsi || !formData.nominal || formData.nominal <= 0) {
      Swal.fire('Peringatan', 'Deskripsi dan nominal pengeluaran wajib diisi!', 'warning');
      return;
    }

    const newNo = `KAS-OUT/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(pengeluaranKasData.length + 1).padStart(3, '0')}`;
    
    const newItem: IPengeluaranKas = {
      id: `OUT-${Date.now()}`,
      noTransaksi: newNo,
      tanggal: formData.tanggal || new Date().toISOString().split('T')[0],
      kategori: formData.kategori as any || 'Operasional Sekolah',
      deskripsi: formData.deskripsi || '',
      nominal: Number(formData.nominal),
      sumberDana: formData.sumberDana as any || 'Kas Tunai Utama',
      penanggungJawab: formData.penanggungJawab || 'Bendahara Sekolah',
      penerima: formData.penerima || 'Pihak Ketiga'
    };

    setPengeluaranKasData([newItem, ...pengeluaranKasData]);
    setIsModalOpen(false);
    setFormData({
      tanggal: new Date().toISOString().split('T')[0],
      kategori: 'Operasional Sekolah',
      deskripsi: '',
      nominal: 0,
      sumberDana: 'Kas Tunai Utama',
      penanggungJawab: '',
      penerima: ''
    });

    Swal.fire({
      title: 'Berhasil Catat Pengeluaran!',
      text: `Pengeluaran sebesar ${formatRupiah(newItem.nominal)} telah dicatat ke Jurnal Kas Keluar.`,
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    });
  };

  const handleDelete = (id: string, noTx: string) => {
    Swal.fire({
      title: 'Hapus Catatan Pengeluaran?',
      text: `Anda yakin ingin menghapus pengeluaran ${noTx}? Tindakan ini tidak dapat dibatalkan.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        setPengeluaranKasData(pengeluaranKasData.filter(item => item.id !== id));
        Swal.fire('Terhapus', 'Catatan pengeluaran berhasil dihapus.', 'success');
      }
    });
  };

  const handleExportCSV = () => {
    const headers = ['No Transaksi', 'Tanggal', 'Kategori', 'Deskripsi', 'Nominal (Rp)', 'Sumber Dana', 'Penanggung Jawab', 'Penerima'];
    const rows = filteredData.map(item => [
      item.noTransaksi,
      item.tanggal,
      item.kategori,
      `"${item.deskripsi.replace(/"/g, '""')}"`,
      item.nominal,
      item.sumberDana,
      item.penanggungJawab,
      item.penerima || '-'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Pengeluaran_Kas_Sekolah_${new Date().toISOString().split('T')[0]}.csv`);
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
            <TrendingDown className="w-7 h-7 text-red-500" /> Jurnal Pengeluaran Kas Sekolah
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Pencatatan kas keluar operasional, maintenance, ATK, dan keperluan sekolah
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
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-xs shadow-md shadow-red-600/20 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" /> Catat Kas Keluar
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Kas Keluar (Akumulasi)</p>
          <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white mt-1">{formatRupiah(totalPengeluaran)}</h3>
          <p className="text-xs text-slate-500 mt-1">{pengeluaranKasData.length} Transaksi Tercatat</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm border-l-4 border-l-red-500">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Kas Keluar Bulan Ini</p>
          <h3 className="text-2xl font-extrabold text-red-600 mt-1">{formatRupiah(totalBulanIni)}</h3>
          <p className="text-xs text-slate-500 mt-1">Operasional & Pembelian</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm border-l-4 border-l-indigo-500">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sumber Dana Terbanyak</p>
          <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">Kas Tunai & Bank BRI</h3>
          <p className="text-xs text-slate-500 mt-1">Terintegrasi Keuangan</p>
        </div>
      </div>

      {/* Filter and Table Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Filter bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari deskripsi, no tx, penanggung jawab..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={filterKategori}
              onChange={(e) => setFilterKategori(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20"
            >
              <option value="">Semua Kategori</option>
              <option value="Operasional Sekolah">Operasional Sekolah</option>
              <option value="Gaji & Honor">Gaji & Honor</option>
              <option value="Maintenance & Perbaikan">Maintenance & Perbaikan</option>
              <option value="ATK & Cetak">ATK & Cetak</option>
              <option value="Sarana & Laboratorium">Sarana & Laboratorium</option>
              <option value="Kegiatan Siswa">Kegiatan Siswa</option>
            </select>

            <select
              value={filterSumber}
              onChange={(e) => setFilterSumber(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20"
            >
              <option value="">Semua Sumber Dana</option>
              <option value="Kas Tunai Utama">Kas Tunai Utama</option>
              <option value="Bank BRI Sekolah">Bank BRI Sekolah</option>
              <option value="Bank Mandiri Sekolah">Bank Mandiri Sekolah</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 uppercase font-bold tracking-wider">
              <tr>
                <th className="px-5 py-3.5">No. Transaksi / Tgl</th>
                <th className="px-5 py-3.5">Kategori</th>
                <th className="px-5 py-3.5">Deskripsi Pengeluaran</th>
                <th className="px-5 py-3.5">Sumber Dana</th>
                <th className="px-5 py-3.5">Penanggung Jawab</th>
                <th className="px-5 py-3.5 text-right">Nominal</th>
                <th className="px-5 py-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="font-bold text-slate-800 dark:text-slate-100">{item.noTransaksi}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {item.tanggal}
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200/60 dark:border-red-800/60 text-[11px] font-bold">
                        {item.kategori}
                      </span>
                    </td>
                    <td className="px-5 py-4 max-w-xs">
                      <div className="font-medium text-slate-800 dark:text-slate-200 line-clamp-2">{item.deskripsi}</div>
                      {item.penerima && (
                        <div className="text-[11px] text-slate-400 mt-0.5">Penerima: {item.penerima}</div>
                      )}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap font-medium text-slate-700 dark:text-slate-300">
                      {item.sumberDana}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap font-medium text-slate-700 dark:text-slate-300">
                      {item.penanggungJawab}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-right font-extrabold text-red-600 dark:text-red-400 text-sm">
                      {formatRupiah(item.nominal)}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedVoucher(item)}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors"
                          title="Cetak Voucher Kas Keluar"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.noTransaksi)}
                          className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors"
                          title="Hapus Transaksi"
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
                    Tidak ditemukan data pengeluaran kas yang sesuai.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Input Kas Keluar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-red-500" /> Catat Pengeluaran Kas Baru
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
                    Tanggal Transaksi
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.tanggal}
                    onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Kategori Pengeluaran
                  </label>
                  <select
                    value={formData.kategori}
                    onChange={(e) => setFormData({ ...formData, kategori: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  >
                    <option value="Operasional Sekolah">Operasional Sekolah</option>
                    <option value="Gaji & Honor">Gaji & Honor</option>
                    <option value="Maintenance & Perbaikan">Maintenance & Perbaikan</option>
                    <option value="ATK & Cetak">ATK & Cetak</option>
                    <option value="Sarana & Laboratorium">Sarana & Laboratorium</option>
                    <option value="Kegiatan Siswa">Kegiatan Siswa</option>
                    <option value="Lain-lain">Lain-lain</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Deskripsi / Keperluan Pengeluaran *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Contoh: Pembelian ATK Ujian PAS & Tinta Printer Kantor"
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Nominal (Rp) *
                  </label>
                  <input
                    type="number"
                    min="1000"
                    required
                    placeholder="1500000"
                    value={formData.nominal || ''}
                    onChange={(e) => setFormData({ ...formData, nominal: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Sumber Dana / Akun Kas
                  </label>
                  <select
                    value={formData.sumberDana}
                    onChange={(e) => setFormData({ ...formData, sumberDana: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  >
                    <option value="Kas Tunai Utama">Kas Tunai Utama</option>
                    <option value="Bank BRI Sekolah">Bank BRI Sekolah</option>
                    <option value="Bank Mandiri Sekolah">Bank Mandiri Sekolah</option>
                    <option value="Bank BNI Sekolah">Bank BNI Sekolah</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Penanggung Jawab / Pemohon
                  </label>
                  <input
                    type="text"
                    placeholder="Nama Staf / Bendahara"
                    value={formData.penanggungJawab}
                    onChange={(e) => setFormData({ ...formData, penanggungJawab: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Penerima Dana / Toko
                  </label>
                  <input
                    type="text"
                    placeholder="Nama Vendor / Penerima"
                    value={formData.penerima}
                    onChange={(e) => setFormData({ ...formData, penerima: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  />
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
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md transition-all"
                >
                  Simpan Pengeluaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Voucher Kas Keluar */}
      {selectedVoucher && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl relative text-slate-800 animate-in zoom-in-95 duration-200 border border-slate-200">
            <button
              onClick={() => setSelectedVoucher(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold"
            >
              ✕
            </button>

            {/* Kop Surat */}
            <div className="text-center pb-4 border-b-2 border-slate-800 mb-6">
              <h2 className="text-lg font-black uppercase tracking-wider text-slate-900">SMP AL-HIKAM</h2>
              <p className="text-[11px] text-slate-600">Jl. Pendidikan No. 45, Kecamatan Sukajaya • Telp: (021) 7890123</p>
              <div className="inline-block px-3 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded-full uppercase mt-2">
                Voucher Kas Keluar Official
              </div>
            </div>

            {/* Voucher Details */}
            <div className="space-y-3 text-xs mb-6">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-medium">No. Transaksi:</span>
                <span className="font-extrabold text-slate-900">{selectedVoucher.noTransaksi}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-medium">Tanggal:</span>
                <span className="font-semibold text-slate-800">{selectedVoucher.tanggal}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-medium">Kategori:</span>
                <span className="font-semibold text-slate-800">{selectedVoucher.kategori}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-medium">Sumber Dana:</span>
                <span className="font-semibold text-slate-800">{selectedVoucher.sumberDana}</span>
              </div>
              <div className="border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-medium block mb-1">Keperluan:</span>
                <p className="font-semibold text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                  {selectedVoucher.deskripsi}
                </p>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-medium">Penerima Dana:</span>
                <span className="font-semibold text-slate-800">{selectedVoucher.penerima || '-'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-medium">Penanggung Jawab:</span>
                <span className="font-semibold text-slate-800">{selectedVoucher.penanggungJawab}</span>
              </div>

              <div className="bg-red-50 p-4 rounded-2xl border border-red-200 flex items-center justify-between mt-4">
                <span className="font-bold text-red-900 text-xs">Jumlah Dibayarkan:</span>
                <span className="text-xl font-black text-red-600">{formatRupiah(selectedVoucher.nominal)}</span>
              </div>
            </div>

            {/* Signature Box */}
            <div className="grid grid-cols-2 gap-4 text-center text-[10px] text-slate-600 mt-6 pt-4 border-t border-slate-200">
              <div>
                <p className="mb-10 font-semibold">Penanggung Jawab / Pemohon</p>
                <p className="font-bold underline text-slate-800">{selectedVoucher.penanggungJawab}</p>
              </div>
              <div>
                <p className="mb-10 font-semibold">Bendahara Sekolah</p>
                <p className="font-bold underline text-slate-800">Budi Santoso, S.Pd</p>
              </div>
            </div>

            {/* Print Action */}
            <div className="mt-6 flex justify-end gap-3 print:hidden">
              <button
                onClick={() => window.print()}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg"
              >
                <Printer className="w-4 h-4" /> Cetak Voucher Kas Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
