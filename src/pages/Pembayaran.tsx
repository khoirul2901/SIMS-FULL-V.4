import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { TagihanSiswa, RiwayatPembayaran } from '../types/keuangan';
import { Search, Filter, Receipt, Printer, CheckCircle, Send, Wallet, CreditCard, Calendar, QrCode, DollarSign } from 'lucide-react';
import Swal from 'sweetalert2';

export const Pembayaran = () => {
  const { tagihanSiswaData, setTagihanSiswaData, kelasData, siswaData } = useDatabase();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKelas, setFilterKelas] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [activeTab, setActiveTab] = useState<'transaksi' | 'kartu'>('transaksi');

  // Selected Item for Payment Modal
  const [selectedTagihan, setSelectedTagihan] = useState<TagihanSiswa | null>(null);
  const [bayarForm, setBayarForm] = useState({
    nominalBayar: 0,
    metode: 'Tunai' as 'Tunai' | 'Transfer Bank' | 'QRIS',
    catatan: 'Pembayaran kasir sekolah'
  });

  // Selected Kwitansi Modal
  const [selectedKwitansi, setSelectedKwitansi] = useState<{ tagihan: TagihanSiswa; riwayat: RiwayatPembayaran } | null>(null);

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka);
  };

  const filteredData = tagihanSiswaData.filter(item => {
    const matchSearch = item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.nis.includes(searchTerm) ||
                        item.namaTagihan.toLowerCase().includes(searchTerm.toLowerCase());
    const matchKelas = filterKelas === '' || item.kelas === filterKelas;
    const matchStatus = filterStatus === '' || item.status === filterStatus;
    return matchSearch && matchKelas && matchStatus;
  });

  const handleOpenBayarModal = (item: TagihanSiswa) => {
    const sisa = item.nominal - item.terbayar;
    setSelectedTagihan(item);
    setBayarForm({
      nominalBayar: sisa,
      metode: 'Tunai',
      catatan: `Pembayaran ${item.namaTagihan}`
    });
  };

  const handleProsesBayarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTagihan) return;

    if (bayarForm.nominalBayar <= 0) {
      Swal.fire('Peringatan', 'Masukkan nominal bayar yang valid!', 'warning');
      return;
    }

    const sisaTagihan = selectedTagihan.nominal - selectedTagihan.terbayar;
    if (bayarForm.nominalBayar > sisaTagihan) {
      Swal.fire('Peringatan', `Nominal bayar melebihi sisa tagihan (${formatRupiah(sisaTagihan)})!`, 'warning');
      return;
    }

    const newTerbayar = selectedTagihan.terbayar + Number(bayarForm.nominalBayar);
    const newStatus: 'Belum Bayar' | 'Cicilan' | 'Lunas' = newTerbayar >= selectedTagihan.nominal ? 'Lunas' : 'Cicilan';

    const noKwitansiNew = `KW/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(Math.floor(Math.random() * 9000) + 1000)}`;

    const newRiwayat: RiwayatPembayaran = {
      id: `RW-${Date.now()}`,
      tanggal: new Date().toISOString().split('T')[0],
      jumlah: Number(bayarForm.nominalBayar),
      metode: bayarForm.metode,
      penerima: 'Bendahara Sekolah',
      noKwitansi: noKwitansiNew,
      catatan: bayarForm.catatan
    };

    const updatedTagihan = tagihanSiswaData.map(t => {
      if (t.id === selectedTagihan.id) {
        return {
          ...t,
          terbayar: newTerbayar,
          status: newStatus,
          riwayatPembayaran: [...t.riwayatPembayaran, newRiwayat]
        };
      }
      return t;
    });

    setTagihanSiswaData(updatedTagihan);
    setSelectedTagihan(null);

    // Open Kwitansi Preview automatically!
    setSelectedKwitansi({
      tagihan: { ...selectedTagihan, terbayar: newTerbayar, status: newStatus },
      riwayat: newRiwayat
    });

    Swal.fire({
      title: 'Pembayaran Berhasil!',
      text: `Pembayaran sebesar ${formatRupiah(bayarForm.nominalBayar)} telah berhasil dicatat.`,
      icon: 'success',
      timer: 1800,
      showConfirmButton: false
    });
  };

  const handleKirimWA = (item: TagihanSiswa) => {
    const sisa = item.nominal - item.terbayar;
    const pesan = `Assalamu'alaikum Bapak/Ibu Orang Tua dari *${item.nama}* (Kelas ${item.kelas}).%0A%0AInformasi tagihan sekolah:%0A- *Tagihan:* ${item.namaTagihan}%0A- *Total Tagihan:* ${formatRupiah(item.nominal)}%0A- *Sisa Tunggakan:* *${formatRupiah(sisa)}*%0A%0AMohon untuk dapat melakukan pembayaran di Kasir Sekolah atau Transfer Bank Sekolah. Terima kasih.%0A_SMP AL-HIKAM_`;
    window.open(`https://wa.me/?text=${pesan}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Receipt className="w-7 h-7 text-blue-600" /> Transaksi Pembayaran Siswa
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Kasir penerimaan SPP, tagihan siswa, cetak kuitansi resmi & kartu pembayaran digital
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('transaksi')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'transaksi'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Kasir Pembayaran
          </button>
          <button
            onClick={() => setActiveTab('kartu')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'kartu'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Kartu SPP Siswa
          </button>
        </div>
      </div>

      {activeTab === 'transaksi' ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {/* Filters */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex flex-col md:flex-row gap-3 justify-between items-center">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari NIS, Nama Siswa, atau Tagihan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={filterKelas}
                onChange={(e) => setFilterKelas(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-200"
              >
                <option value="">Semua Kelas</option>
                {kelasData.map((k) => (
                  <option key={k.id} value={k.namaKelas}>Kelas {k.namaKelas}</option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-200"
              >
                <option value="">Semua Status</option>
                <option value="Belum Bayar">Belum Bayar</option>
                <option value="Cicilan">Cicilan</option>
                <option value="Lunas">Lunas</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Siswa</th>
                  <th className="px-5 py-3.5">Tagihan</th>
                  <th className="px-5 py-3.5">Total Tagihan</th>
                  <th className="px-5 py-3.5">Terbayar</th>
                  <th className="px-5 py-3.5">Sisa Tagihan</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-center">Aksi / Kwitansi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredData.length > 0 ? (
                  filteredData.map((item) => {
                    const sisa = item.nominal - item.terbayar;
                    const isLunas = item.status === 'Lunas';
                    const lastRiwayat = item.riwayatPembayaran[item.riwayatPembayaran.length - 1];

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
                        <td className="px-5 py-4 font-extrabold text-slate-900 dark:text-white">
                          <span className={sisa > 0 ? 'text-red-600' : 'text-emerald-600'}>
                            {isLunas ? 'Rp0' : formatRupiah(sisa)}
                          </span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                            isLunas 
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                              : item.status === 'Cicilan' 
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' 
                              : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            {!isLunas ? (
                              <>
                                <button
                                  onClick={() => handleOpenBayarModal(item)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow-sm transition-all"
                                >
                                  <Receipt className="w-3.5 h-3.5" /> Proses Bayar
                                </button>
                                <button
                                  onClick={() => handleKirimWA(item)}
                                  className="p-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                                  title="Kirim Tagihan via WA"
                                >
                                  <Send className="w-3.5 h-3.5" />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => lastRiwayat && setSelectedKwitansi({ tagihan: item, riwayat: lastRiwayat })}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 font-bold rounded-lg text-xs transition-all border border-slate-200 dark:border-slate-700"
                              >
                                <Printer className="w-3.5 h-3.5" /> Cetak Kwitansi
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                      Tidak ada tagihan siswa yang ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* KARTU SPP DIGITAL MATRIKS */
        <div className="space-y-4">
          {siswaData.map((siswa) => {
            const sppTagihanSiswa = tagihanSiswaData.filter(t => t.nis === siswa.nis && t.tipe === 'Bulanan');

            return (
              <div key={siswa.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-2">
                  <div>
                    <h3 className="font-extrabold text-slate-800 dark:text-white text-base">{siswa.nama}</h3>
                    <p className="text-xs text-slate-500">NIS: {siswa.nis} • Kelas {siswa.kelas}</p>
                  </div>
                  <span className="px-3 py-1 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold self-start sm:self-auto">
                    Kartu SPP T.A 2025/2026
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 pt-1">
                  {[
                    'Juli 2025', 'Agustus 2025', 'September 2025', 'Oktober 2025',
                    'November 2025', 'Desember 2025', 'Januari 2026', 'Februari 2026',
                    'Maret 2026', 'April 2026', 'Mei 2026', 'Juni 2026'
                  ].map((bln) => {
                    const tagihanBulan = sppTagihanSiswa.find(t => t.bulan === bln);
                    const isPaid = tagihanBulan?.status === 'Lunas';

                    return (
                      <div
                        key={bln}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          isPaid
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
                            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <span className="text-[10px] font-bold text-slate-500 block uppercase">{bln.split(' ')[0]}</span>
                        <span className={`text-xs font-extrabold block mt-0.5 ${isPaid ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {isPaid ? 'LUNAS' : 'BELUM'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Input Transaksi Pembayaran */}
      {selectedTagihan && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-blue-600" /> Form Pembayaran Kasir
              </h3>
              <button onClick={() => setSelectedTagihan(null)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleProsesBayarSubmit} className="space-y-4 mt-4">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">{selectedTagihan.nama} ({selectedTagihan.nis})</p>
                <p className="text-slate-500">Kelas: {selectedTagihan.kelas}</p>
                <p className="text-slate-700 dark:text-slate-200 font-semibold">Tagihan: {selectedTagihan.namaTagihan}</p>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500">Sisa Tagihan:</span>
                  <span className="text-sm font-black text-red-600">
                    {formatRupiah(selectedTagihan.nominal - selectedTagihan.terbayar)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Nominal Bayar (Rp) *
                </label>
                <input
                  type="number"
                  min="1000"
                  required
                  value={bayarForm.nominalBayar}
                  onChange={(e) => setBayarForm({ ...bayarForm, nominalBayar: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-extrabold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Metode Pembayaran
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Tunai', 'Transfer Bank', 'QRIS'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setBayarForm({ ...bayarForm, metode: m as any })}
                      className={`py-2 rounded-xl text-xs font-extrabold border transition-all ${
                        bayarForm.metode === m
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Catatan Transaksi
                </label>
                <input
                  type="text"
                  value={bayarForm.catatan}
                  onChange={(e) => setBayarForm({ ...bayarForm, catatan: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedTagihan(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all"
                >
                  Simpan & Cetak Kwitansi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Preview Kwitansi Resmi */}
      {selectedKwitansi && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl relative text-slate-800 animate-in zoom-in-95 duration-200 border border-slate-200">
            <button
              onClick={() => setSelectedKwitansi(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold"
            >
              ✕
            </button>

            {/* Kop Surat */}
            <div className="text-center pb-4 border-b-2 border-slate-800 mb-6">
              <h2 className="text-lg font-black uppercase tracking-wider text-slate-900">SMP AL-HIKAM</h2>
              <p className="text-[11px] text-slate-600">Jl. Pendidikan No. 45, Kecamatan Sukajaya • Telp: (021) 7890123</p>
              <div className="inline-block px-3 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded-full uppercase mt-2">
                KUITANSI BUKTI PEMBAYARAN RESMI
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3 text-xs mb-6">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-medium">No. Kwitansi:</span>
                <span className="font-extrabold text-blue-600">{selectedKwitansi.riwayat.noKwitansi}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-medium">Tanggal Transaksi:</span>
                <span className="font-semibold text-slate-800">{selectedKwitansi.riwayat.tanggal}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-medium">Siswa:</span>
                <span className="font-bold text-slate-900">{selectedKwitansi.tagihan.nama} ({selectedKwitansi.tagihan.nis})</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-medium">Kelas:</span>
                <span className="font-semibold text-slate-800">{selectedKwitansi.tagihan.kelas}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-medium">Untuk Pembayaran:</span>
                <span className="font-bold text-slate-800">{selectedKwitansi.tagihan.namaTagihan}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-medium">Metode Pembayaran:</span>
                <span className="font-semibold text-slate-800">{selectedKwitansi.riwayat.metode}</span>
              </div>

              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 flex items-center justify-between mt-4">
                <span className="font-bold text-emerald-900 text-xs">Jumlah Diterima:</span>
                <span className="text-2xl font-black text-emerald-600">{formatRupiah(selectedKwitansi.riwayat.jumlah)}</span>
              </div>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-4 text-center text-[10px] text-slate-600 mt-6 pt-4 border-t border-slate-200">
              <div>
                <p className="mb-10 font-semibold">Penyetor / Siswa</p>
                <p className="font-bold underline text-slate-800">{selectedKwitansi.tagihan.nama}</p>
              </div>
              <div>
                <p className="mb-10 font-semibold">Bendahara / Kasir Sekolah</p>
                <p className="font-bold underline text-slate-800">{selectedKwitansi.riwayat.penerima}</p>
              </div>
            </div>

            {/* Print Action */}
            <div className="mt-6 flex justify-end gap-3 print:hidden">
              <button
                onClick={() => window.print()}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg"
              >
                <Printer className="w-4 h-4" /> Cetak Kwitansi Resmi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
