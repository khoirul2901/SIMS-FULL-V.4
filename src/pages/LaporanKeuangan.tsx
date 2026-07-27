import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { FileSpreadsheet, Printer, Search, Filter, ArrowUpRight, TrendingDown, Wallet, Calendar, AlertTriangle, Send, FileText, CheckCircle } from 'lucide-react';
import Swal from 'sweetalert2';

export const LaporanKeuangan = () => {
  const { tagihanSiswaData, pengeluaranKasData, payrollData, kelasData } = useDatabase();
  const [activeTab, setActiveTab] = useState<'bku' | 'tunggakan' | 'pos'>('bku');
  
  const [filterKelas, setFilterKelas] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka);
  };

  // Compute Buku Kas Umum (BKU) Chronological Entries
  const kasMasukEntries = tagihanSiswaData.flatMap(tagihan => 
    tagihan.riwayatPembayaran.map(p => ({
      id: p.id,
      tanggal: p.tanggal,
      jenis: 'MASUK' as const,
      noTx: p.noKwitansi,
      keterangan: `Pembayaran ${tagihan.namaTagihan} - ${tagihan.nama} (${tagihan.kelas})`,
      masuk: p.jumlah,
      keluar: 0,
      kategori: 'Penerimaan Tagihan Siswa',
      penerima: p.penerima
    }))
  );

  const kasKeluarPengeluaran = pengeluaranKasData.map(p => ({
    id: p.id,
    tanggal: p.tanggal,
    jenis: 'KELUAR' as const,
    noTx: p.noTransaksi,
    keterangan: `${p.kategori}: ${p.deskripsi}`,
    masuk: 0,
    keluar: p.nominal,
    kategori: p.kategori,
    penerima: p.penerima || p.penanggungJawab
  }));

  const kasKeluarPayroll = payrollData.map(p => ({
    id: p.id,
    tanggal: p.tanggalBayar,
    jenis: 'KELUAR' as const,
    noTx: p.noSlip,
    keterangan: `Penggajian ${p.bulan}: ${p.namaGuru} (${p.jabatan})`,
    masuk: 0,
    keluar: p.totalDiterima,
    kategori: 'Payroll Gaji Guru',
    penerima: p.namaGuru
  }));

  const allBkuEntries = [...kasMasukEntries, ...kasKeluarPengeluaran, ...kasKeluarPayroll].sort((a, b) => 
    new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()
  );

  // Compute Totals
  const totalPenerimaan = kasMasukEntries.reduce((acc, curr) => acc + curr.masuk, 0);
  const totalPengeluaran = kasKeluarPengeluaran.reduce((acc, curr) => acc + curr.keluar, 0) + 
                           kasKeluarPayroll.reduce((acc, curr) => acc + curr.keluar, 0);
  const saldoKas = totalPenerimaan - totalPengeluaran;

  // Tunggakan Computation
  const tunggakanData = tagihanSiswaData.filter(t => t.status !== 'Lunas');
  const filteredTunggakan = tunggakanData.filter(item => {
    const matchKelas = filterKelas === '' || item.kelas === filterKelas;
    const matchSearch = item.nama.toLowerCase().includes(searchTerm.toLowerCase()) || item.nis.includes(searchTerm);
    return matchKelas && matchSearch;
  });

  const totalTunggakan = tunggakanData.reduce((acc, curr) => acc + (curr.nominal - curr.terbayar), 0);

  const handleKirimWA = (item: any) => {
    const sisa = item.nominal - item.terbayar;
    const pesan = `Assalamu'alaikum Bapak/Ibu Orang Tua/Wali dari *${item.nama}* (Kelas ${item.kelas}).%0A%0AMemberitahukan mengenai kewajiban pembayaran sekolah:%0A- *Tagihan:* ${item.namaTagihan}%0A- *Total Tagihan:* ${formatRupiah(item.nominal)}%0A- *Sudah Dibayar:* ${formatRupiah(item.terbayar)}%0A- *Sisa Tunggakan:* *${formatRupiah(sisa)}*%0A%0AMohon untuk dapat melakukan pelunasan melalui Bendahara Sekolah atau Transfer Bank BRI/Mandiri Sekolah. Terima kasih.%0A_SMP AL-HIKAM_`;
    window.open(`https://wa.me/?text=${pesan}`, '_blank');
  };

  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: any[] = [];

    if (activeTab === 'bku') {
      headers = ['Tanggal', 'Jenis', 'No Transaksi', 'Keterangan', 'Kas Masuk (Rp)', 'Kas Keluar (Rp)'];
      rows = allBkuEntries.map(e => [e.tanggal, e.jenis, e.noTx, `"${e.keterangan.replace(/"/g, '""')}"`, e.masuk, e.keluar]);
    } else if (activeTab === 'tunggakan') {
      headers = ['NIS', 'Nama Siswa', 'Kelas', 'Tagihan', 'Nominal Tagihan', 'Terbayar', 'Sisa Tunggakan', 'Status'];
      rows = filteredTunggakan.map(e => [e.nis, `"${e.nama}"`, e.kelas, `"${e.namaTagihan}"`, e.nominal, e.terbayar, e.nominal - e.terbayar, e.status]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_${activeTab.toUpperCase()}_${new Date().toISOString().split('T')[0]}.csv`);
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
            <FileSpreadsheet className="w-7 h-7 text-blue-600" /> Laporan Keuangan & Buku Kas Umum
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Rekapitulasi arus kas masuk, pengeluaran operasional, rekap tunggakan siswa & laporan neraca
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Printer className="w-4 h-4" /> Cetak Laporan Resmi
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Financial Summary Widget */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm border-l-4 border-l-emerald-500">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Kas Masuk</p>
          <h3 className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{formatRupiah(totalPenerimaan)}</h3>
          <p className="text-xs text-slate-500 mt-1">Dari SPP & Tagihan Siswa</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm border-l-4 border-l-red-500">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Kas Keluar</p>
          <h3 className="text-xl font-extrabold text-red-600 dark:text-red-400 mt-1">{formatRupiah(totalPengeluaran)}</h3>
          <p className="text-xs text-slate-500 mt-1">Operasional + Payroll Gaji</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm border-l-4 border-l-blue-600">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Saldo Kas Bersih</p>
          <h3 className={`text-xl font-extrabold mt-1 ${saldoKas >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600'}`}>
            {formatRupiah(saldoKas)}
          </h3>
          <p className="text-xs text-slate-500 mt-1">Kas & Rekening Sekolah</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm border-l-4 border-l-amber-500">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Tunggakan Siswa</p>
          <h3 className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">{formatRupiah(totalTunggakan)}</h3>
          <p className="text-xs text-slate-500 mt-1">{tunggakanData.length} Item Belum Lunas</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('bku')}
          className={`px-5 py-3 text-xs font-extrabold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'bku'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Wallet className="w-4 h-4" /> Buku Kas Umum (BKU)
        </button>

        <button
          onClick={() => setActiveTab('tunggakan')}
          className={`px-5 py-3 text-xs font-extrabold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'tunggakan'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/30'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <AlertTriangle className="w-4 h-4" /> Laporan Tunggakan Siswa ({tunggakanData.length})
        </button>
      </div>

      {/* TAB 1: BUKU KAS UMUM */}
      {activeTab === 'bku' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">
              Jurnal Kronologis Transaksi Kas Sekolah
            </h3>
            <span className="text-xs text-slate-500 font-semibold">{allBkuEntries.length} Baris Transaksi</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-100/80 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 uppercase font-bold text-slate-700 dark:text-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Tanggal / No Tx</th>
                  <th className="px-5 py-3.5">Jenis & Kategori</th>
                  <th className="px-5 py-3.5">Uraian / Keterangan</th>
                  <th className="px-5 py-3.5 text-right text-emerald-700 dark:text-emerald-400">Kas Masuk (Debit)</th>
                  <th className="px-5 py-3.5 text-right text-red-700 dark:text-red-400">Kas Keluar (Kredit)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {allBkuEntries.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="font-bold text-slate-800 dark:text-slate-100">{item.tanggal}</div>
                      <div className="text-[11px] text-slate-400">{item.noTx}</div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        item.jenis === 'MASUK' 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                          : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                      }`}>
                        {item.jenis}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 text-[11px] block mt-0.5">{item.kategori}</span>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-800 dark:text-slate-200">
                      {item.keterangan}
                    </td>
                    <td className="px-5 py-3.5 text-right font-extrabold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      {item.masuk > 0 ? formatRupiah(item.masuk) : '-'}
                    </td>
                    <td className="px-5 py-3.5 text-right font-extrabold text-red-600 dark:text-red-400 whitespace-nowrap">
                      {item.keluar > 0 ? formatRupiah(item.keluar) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: LAPORAN TUNGGAKAN */}
      {activeTab === 'tunggakan' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-3 justify-between items-center">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama siswa atau NIS..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <select
              value={filterKelas}
              onChange={(e) => setFilterKelas(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-200"
            >
              <option value="">Semua Kelas</option>
              {kelasData.map((k) => (
                <option key={k.id} value={k.namaKelas}>{k.namaKelas}</option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-100/80 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 uppercase font-bold text-slate-700 dark:text-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Siswa & Kelas</th>
                  <th className="px-5 py-3.5">Uraian Tagihan</th>
                  <th className="px-5 py-3.5">Nominal Tagihan</th>
                  <th className="px-5 py-3.5">Sudah Terbayar</th>
                  <th className="px-5 py-3.5 text-right text-red-600">Sisa Tunggakan</th>
                  <th className="px-5 py-3.5 text-center">Aksi / Tagih WA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredTunggakan.length > 0 ? (
                  filteredTunggakan.map((item) => {
                    const sisa = item.nominal - item.terbayar;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="font-bold text-slate-800 dark:text-slate-100">{item.nama}</div>
                          <div className="text-[11px] text-slate-400">NIS: {item.nis} • Kelas {item.kelas}</div>
                        </td>
                        <td className="px-5 py-4 font-semibold text-slate-800 dark:text-slate-200">
                          {item.namaTagihan}
                        </td>
                        <td className="px-5 py-4 font-medium text-slate-700 dark:text-slate-300">
                          {formatRupiah(item.nominal)}
                        </td>
                        <td className="px-5 py-4 font-medium text-emerald-600">
                          {formatRupiah(item.terbayar)}
                        </td>
                        <td className="px-5 py-4 text-right font-extrabold text-red-600 text-sm whitespace-nowrap">
                          {formatRupiah(sisa)}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => handleKirimWA(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                          >
                            <Send className="w-3.5 h-3.5" /> Kirim Pengingat WA
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      Tidak ada tunggakan pembayaran siswa. Semua pembayaran lunas!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
