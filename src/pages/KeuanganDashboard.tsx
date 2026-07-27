import React from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { Wallet, TrendingUp, TrendingDown, CreditCard, Receipt, Banknote, ArrowRight, CheckCircle, AlertTriangle, FileSpreadsheet } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const KeuanganDashboard = () => {
  const { tagihanSiswaData, pengeluaranKasData, payrollData } = useDatabase();

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka);
  };

  // Real Financial Calculations
  const totalKasMasuk = tagihanSiswaData.reduce((acc, t) => acc + t.terbayar, 0);
  
  const totalKasKeluar = pengeluaranKasData.reduce((acc, p) => acc + p.nominal, 0) +
                         payrollData.reduce((acc, g) => acc + g.totalDiterima, 0);

  const saldoKas = totalKasMasuk - totalKasKeluar;

  const totalTunggakan = tagihanSiswaData.reduce((acc, t) => acc + (t.nominal - t.terbayar), 0);

  // Status Pie Chart Data
  const lunasCount = tagihanSiswaData.filter(t => t.status === 'Lunas').length;
  const cicilanCount = tagihanSiswaData.filter(t => t.status === 'Cicilan').length;
  const belumBayarCount = tagihanSiswaData.filter(t => t.status === 'Belum Bayar').length;
  const totalTagihanCount = tagihanSiswaData.length || 1;

  const paymentStatusPie = [
    { name: 'Lunas', value: Math.round((lunasCount / totalTagihanCount) * 100), color: '#10b981' },
    { name: 'Cicilan', value: Math.round((cicilanCount / totalTagihanCount) * 100), color: '#f59e0b' },
    { name: 'Belum Bayar', value: Math.round((belumBayarCount / totalTagihanCount) * 100), color: '#ef4444' },
  ];

  // Monthly Bar Chart Data (Sample dynamic projection)
  const revenueChartData = [
    { name: 'Jul', masuk: 12500000, keluar: 4500000 },
    { name: 'Agt', masuk: 18200000, keluar: 6200000 },
    { name: 'Sep', masuk: 15400000, keluar: 3800000 },
    { name: 'Okt', masuk: 19800000, keluar: 5100000 },
    { name: 'Nov', masuk: 16500000, keluar: 4200000 },
    { name: 'Des', masuk: totalKasMasuk, keluar: totalKasKeluar },
  ];

  // Recent Transactions
  const recentTransactions = tagihanSiswaData.flatMap(t => 
    t.riwayatPembayaran.map(r => ({
      id: r.id,
      siswa: t.nama,
      kelas: t.kelas,
      tagihan: t.namaTagihan,
      jumlah: r.jumlah,
      tanggal: r.tanggal,
      metode: r.metode,
      noTx: r.noKwitansi
    }))
  ).sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Wallet className="w-7 h-7 text-blue-600" /> Executive Dashboard Keuangan
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Ringkasan ketersediaan kas, rekapitulasi penerimaan SPP & pengeluaran operasional sekolah
          </p>
        </div>

        {/* Quick Links */}
        <div className="flex items-center gap-2">
          <NavLink
            to="/keuangan/pembayaran"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-600/20 transition-all"
          >
            <Receipt className="w-4 h-4" /> Bayar SPP
          </NavLink>
          <NavLink
            to="/keuangan/pengeluaran"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-md shadow-red-600/20 transition-all"
          >
            <TrendingDown className="w-4 h-4" /> Catat Kas Keluar
          </NavLink>
          <NavLink
            to="/keuangan/payroll"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-600/20 transition-all"
          >
            <Banknote className="w-4 h-4" /> Slip Gaji
          </NavLink>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Wallet className="w-20 h-20 text-blue-600" />
          </div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Saldo Kas Sekolah</p>
          <h3 className={`text-2xl font-black mt-1 ${saldoKas >= 0 ? 'text-slate-900 dark:text-white' : 'text-red-600'}`}>
            {formatRupiah(saldoKas)}
          </h3>
          <p className="text-[11px] font-semibold text-emerald-600 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Arus Kas Surplus & Terkendali
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden border-l-4 border-l-emerald-500">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <TrendingUp className="w-20 h-20 text-emerald-500" />
          </div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Kas Masuk (Penerimaan)</p>
          <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{formatRupiah(totalKasMasuk)}</h3>
          <p className="text-[11px] text-slate-500 mt-2">Penerimaan Tagihan Siswa & SPP</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden border-l-4 border-l-red-500">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <TrendingDown className="w-20 h-20 text-red-500" />
          </div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Kas Keluar (Pengeluaran)</p>
          <h3 className="text-2xl font-black text-red-600 dark:text-red-400 mt-1">{formatRupiah(totalKasKeluar)}</h3>
          <p className="text-[11px] text-slate-500 mt-2">Operasional + Payroll Gaji Guru</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden border-l-4 border-l-amber-500">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <AlertTriangle className="w-20 h-20 text-amber-500" />
          </div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Piutang / Tunggakan Siswa</p>
          <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{formatRupiah(totalTunggakan)}</h3>
          <p className="text-[11px] text-slate-500 mt-2">{belumBayarCount + cicilanCount} Tagihan Belum Pelunasan</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Arus Kas Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-2">
          <h3 className="text-base font-bold text-slate-800 dark:text-white mb-6">Proyeksi Arus Kas Masuk vs Keluar</h3>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueChartData} margin={{ top: 5, right: 0, left: 15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 11 }} 
                  tickFormatter={(value) => `Rp${value / 1000000}M`}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => formatRupiah(value)}
                />
                <Bar dataKey="masuk" name="Kas Masuk" fill="#10b981" radius={[4, 4, 0, 0]} barSize={22} />
                <Bar dataKey="keluar" name="Kas Keluar" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status SPP Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">Status Pembayaran Siswa</h3>
          <p className="text-xs text-slate-500 mb-4">Persentase kelancaran penerimaan tagihan</p>
          <div className="h-[200px] w-full flex flex-col items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentStatusPie}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {paymentStatusPie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => `${value}%`}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-2xl font-extrabold text-slate-800 dark:text-white">{paymentStatusPie[0].value}%</span>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Lunas</span>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {paymentStatusPie.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-slate-600 dark:text-slate-300 font-medium">{item.name}</span>
                </div>
                <span className="font-extrabold text-slate-800 dark:text-white">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white">Transaksi Penerimaan Terbaru</h3>
            <p className="text-xs text-slate-500">Log pembayaran kasir sekolah paling mutakhir</p>
          </div>
          <NavLink
            to="/keuangan/laporan"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
          >
            Lihat Laporan Lengkap <ArrowRight className="w-3.5 h-3.5" />
          </NavLink>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 uppercase font-bold">
              <tr>
                <th className="px-4 py-3">No. Kwitansi / Tgl</th>
                <th className="px-4 py-3">Siswa & Kelas</th>
                <th className="px-4 py-3">Keperluan Tagihan</th>
                <th className="px-4 py-3">Metode</th>
                <th className="px-4 py-3 text-right">Nominal Terbayar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-bold text-slate-800 dark:text-slate-100">{tx.noTx}</div>
                      <div className="text-[10px] text-slate-400">{tx.tanggal}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-bold text-slate-800 dark:text-slate-100">{tx.siswa}</div>
                      <div className="text-[10px] text-slate-400">Kelas {tx.kelas}</div>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">
                      {tx.tagihan}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-[10px]">
                        {tx.metode}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                      +{formatRupiah(tx.jumlah)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    Belum ada riwayat transaksi penerimaan.
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
