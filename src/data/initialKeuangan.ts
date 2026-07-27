import { JenisPembayaran, TagihanSiswa, PengeluaranKas, SlipGaji } from '../types/keuangan';

export const INITIAL_JENIS_PEMBAYARAN: JenisPembayaran[] = [
  { id: '1', pos: 'SPP', nama: 'SPP Bulanan (Tahun Ajaran 2025/2026)', nominal: 150000, tipe: 'Bulanan', tingkat: 'Semua', tahunAjaran: '2025/2026', status: 'Aktif', keterangan: 'Tagihan rutin bulanan Juli - Juni' },
  { id: '2', pos: 'Gedung', nama: 'Uang Gedung / Infaq Pembangunan', nominal: 2500000, tipe: 'Bebas', tingkat: 'VII', tahunAjaran: '2025/2026', status: 'Aktif', keterangan: 'Wajib untuk siswa baru kelas VII' },
  { id: '3', pos: 'Seragam', nama: 'Paket Seragam & Atribut Sekolah', nominal: 850000, tipe: 'Bebas', tingkat: 'VII', tahunAjaran: '2025/2026', status: 'Aktif', keterangan: 'Termasuk seragam batik, olahraga & jas almamater' },
  { id: '4', pos: 'Buku', nama: 'Paket LKS & Modul Semester Ganjil', nominal: 180000, tipe: 'Semesteran', tingkat: 'Semua', tahunAjaran: '2025/2026', status: 'Aktif', keterangan: '10 Buku LKS mata pelajaran utama' },
  { id: '5', pos: 'Ujian', nama: 'Infaq Ujian PAS / Asesmen Semester', nominal: 120000, tipe: 'Semesteran', tingkat: 'Semua', tahunAjaran: '2025/2026', status: 'Aktif', keterangan: 'Pelaksanaan ujian berbasis komputer (CBT)' },
  { id: '6', pos: 'Ekskul', nama: 'Iuran Wajib Ekstrakurikuler & Pramuka', nominal: 35000, tipe: 'Bulanan', tingkat: 'Semua', tahunAjaran: '2025/2026', status: 'Aktif', keterangan: 'Kegiatan pengembangan bakat & kepramukaan' },
];

export const BULAN_LIST = [
  'Juli 2025', 'Agustus 2025', 'September 2025', 'Oktober 2025',
  'November 2025', 'Desember 2025', 'Januari 2026', 'Februari 2026',
  'Maret 2026', 'April 2026', 'Mei 2026', 'Juni 2026'
];

export const INITIAL_TAGIHAN_SISWA: TagihanSiswa[] = [
  // Ahmad Maulana (2023001)
  {
    id: 'TG001',
    nis: '2023001',
    nama: 'Ahmad Maulana',
    kelas: 'VII-A',
    jenisPembayaranId: '1',
    namaTagihan: 'SPP Bulan Juli 2025',
    tipe: 'Bulanan',
    bulan: 'Juli 2025',
    nominal: 150000,
    terbayar: 150000,
    status: 'Lunas',
    tanggalJatuhTempo: '2025-07-10',
    riwayatPembayaran: [
      { id: 'KW-001', tanggal: '2025-07-05', jumlah: 150000, metode: 'Tunai', penerima: 'Bendahara Sekolah', noKwitansi: 'KW/2025/07/001', catatan: 'Pembayaran SPP Juli' }
    ]
  },
  {
    id: 'TG002',
    nis: '2023001',
    nama: 'Ahmad Maulana',
    kelas: 'VII-A',
    jenisPembayaranId: '1',
    namaTagihan: 'SPP Bulan Agustus 2025',
    tipe: 'Bulanan',
    bulan: 'Agustus 2025',
    nominal: 150000,
    terbayar: 150000,
    status: 'Lunas',
    tanggalJatuhTempo: '2025-08-10',
    riwayatPembayaran: [
      { id: 'KW-015', tanggal: '2025-08-08', jumlah: 150000, metode: 'Transfer Bank', penerima: 'Bendahara Sekolah', noKwitansi: 'KW/2025/08/015', catatan: 'Transfer via BRI' }
    ]
  },
  {
    id: 'TG003',
    nis: '2023001',
    nama: 'Ahmad Maulana',
    kelas: 'VII-A',
    jenisPembayaranId: '1',
    namaTagihan: 'SPP Bulan September 2025',
    tipe: 'Bulanan',
    bulan: 'September 2025',
    nominal: 150000,
    terbayar: 0,
    status: 'Belum Bayar',
    tanggalJatuhTempo: '2025-09-10',
    riwayatPembayaran: []
  },
  {
    id: 'TG004',
    nis: '2023001',
    nama: 'Ahmad Maulana',
    kelas: 'VII-A',
    jenisPembayaranId: '2',
    namaTagihan: 'Uang Gedung / Infaq Pembangunan',
    tipe: 'Bebas',
    nominal: 2500000,
    terbayar: 1500000,
    status: 'Cicilan',
    tanggalJatuhTempo: '2025-12-31',
    riwayatPembayaran: [
      { id: 'KW-002', tanggal: '2025-07-05', jumlah: 1000000, metode: 'Transfer Bank', penerima: 'Bendahara Sekolah', noKwitansi: 'KW/2025/07/002', catatan: 'DP Uang Gedung Tahap 1' },
      { id: 'KW-040', tanggal: '2025-08-15', jumlah: 500000, metode: 'Tunai', penerima: 'Bendahara Sekolah', noKwitansi: 'KW/2025/08/040', catatan: 'Cicilan Uang Gedung Tahap 2' }
    ]
  },
  {
    id: 'TG005',
    nis: '2023001',
    nama: 'Ahmad Maulana',
    kelas: 'VII-A',
    jenisPembayaranId: '3',
    namaTagihan: 'Paket Seragam & Atribut Sekolah',
    tipe: 'Bebas',
    nominal: 850000,
    terbayar: 850000,
    status: 'Lunas',
    tanggalJatuhTempo: '2025-07-20',
    riwayatPembayaran: [
      { id: 'KW-003', tanggal: '2025-07-05', jumlah: 850000, metode: 'Tunai', penerima: 'Bendahara Sekolah', noKwitansi: 'KW/2025/07/003', catatan: 'Pelunasan Seragam' }
    ]
  },

  // Siti Nurhaliza (2023002)
  {
    id: 'TG006',
    nis: '2023002',
    nama: 'Siti Nurhaliza',
    kelas: 'VII-A',
    jenisPembayaranId: '1',
    namaTagihan: 'SPP Bulan Juli 2025',
    tipe: 'Bulanan',
    bulan: 'Juli 2025',
    nominal: 150000,
    terbayar: 150000,
    status: 'Lunas',
    tanggalJatuhTempo: '2025-07-10',
    riwayatPembayaran: [
      { id: 'KW-004', tanggal: '2025-07-06', jumlah: 150000, metode: 'QRIS', penerima: 'Bendahara Sekolah', noKwitansi: 'KW/2025/07/004', catatan: 'QRIS EduPay' }
    ]
  },
  {
    id: 'TG007',
    nis: '2023002',
    nama: 'Siti Nurhaliza',
    kelas: 'VII-A',
    jenisPembayaranId: '1',
    namaTagihan: 'SPP Bulan Agustus 2025',
    tipe: 'Bulanan',
    bulan: 'Agustus 2025',
    nominal: 150000,
    terbayar: 150000,
    status: 'Lunas',
    tanggalJatuhTempo: '2025-08-10',
    riwayatPembayaran: [
      { id: 'KW-020', tanggal: '2025-08-09', jumlah: 150000, metode: 'QRIS', penerima: 'Bendahara Sekolah', noKwitansi: 'KW/2025/08/020', catatan: 'QRIS EduPay' }
    ]
  },
  {
    id: 'TG008',
    nis: '2023002',
    nama: 'Siti Nurhaliza',
    kelas: 'VII-A',
    jenisPembayaranId: '2',
    namaTagihan: 'Uang Gedung / Infaq Pembangunan',
    tipe: 'Bebas',
    nominal: 2500000,
    terbayar: 2500000,
    status: 'Lunas',
    tanggalJatuhTempo: '2025-12-31',
    riwayatPembayaran: [
      { id: 'KW-005', tanggal: '2025-07-06', jumlah: 2500000, metode: 'Transfer Bank', penerima: 'Bendahara Sekolah', noKwitansi: 'KW/2025/07/005', catatan: 'Lunas Cash Back Transfer' }
    ]
  },

  // Budi Santoso (2023003)
  {
    id: 'TG009',
    nis: '2023003',
    nama: 'Budi Santoso',
    kelas: 'VII-B',
    jenisPembayaranId: '1',
    namaTagihan: 'SPP Bulan Juli 2025',
    tipe: 'Bulanan',
    bulan: 'Juli 2025',
    nominal: 150000,
    terbayar: 150000,
    status: 'Lunas',
    tanggalJatuhTempo: '2025-07-10',
    riwayatPembayaran: [
      { id: 'KW-008', tanggal: '2025-07-07', jumlah: 150000, metode: 'Tunai', penerima: 'Bendahara Sekolah', noKwitansi: 'KW/2025/07/008', catatan: 'Bayar Tunai di Kasir' }
    ]
  },
  {
    id: 'TG010',
    nis: '2023003',
    nama: 'Budi Santoso',
    kelas: 'VII-B',
    jenisPembayaranId: '1',
    namaTagihan: 'SPP Bulan Agustus 2025',
    tipe: 'Bulanan',
    bulan: 'Agustus 2025',
    nominal: 150000,
    terbayar: 0,
    status: 'Belum Bayar',
    tanggalJatuhTempo: '2025-08-10',
    riwayatPembayaran: []
  },
  {
    id: 'TG011',
    nis: '2023003',
    nama: 'Budi Santoso',
    kelas: 'VII-B',
    jenisPembayaranId: '4',
    namaTagihan: 'Paket LKS & Modul Semester Ganjil',
    tipe: 'Semesteran',
    nominal: 180000,
    terbayar: 100000,
    status: 'Cicilan',
    tanggalJatuhTempo: '2025-09-01',
    riwayatPembayaran: [
      { id: 'KW-022', tanggal: '2025-08-10', jumlah: 100000, metode: 'Tunai', penerima: 'Bendahara Sekolah', noKwitansi: 'KW/2025/08/022', catatan: 'DP LKS' }
    ]
  },

  // Citra Kirana (2023004)
  {
    id: 'TG012',
    nis: '2023004',
    nama: 'Citra Kirana',
    kelas: 'VII-B',
    jenisPembayaranId: '1',
    namaTagihan: 'SPP Bulan Juli 2025',
    tipe: 'Bulanan',
    bulan: 'Juli 2025',
    nominal: 150000,
    terbayar: 150000,
    status: 'Lunas',
    tanggalJatuhTempo: '2025-07-10',
    riwayatPembayaran: [
      { id: 'KW-010', tanggal: '2025-07-08', jumlah: 150000, metode: 'Transfer Bank', penerima: 'Bendahara Sekolah', noKwitansi: 'KW/2025/07/010', catatan: 'Transfer BNI' }
    ]
  },
  {
    id: 'TG013',
    nis: '2023004',
    nama: 'Citra Kirana',
    kelas: 'VII-B',
    jenisPembayaranId: '2',
    namaTagihan: 'Uang Gedung / Infaq Pembangunan',
    tipe: 'Bebas',
    nominal: 2500000,
    terbayar: 1000000,
    status: 'Cicilan',
    tanggalJatuhTempo: '2025-12-31',
    riwayatPembayaran: [
      { id: 'KW-011', tanggal: '2025-07-08', jumlah: 1000000, metode: 'Transfer Bank', penerima: 'Bendahara Sekolah', noKwitansi: 'KW/2025/07/011', catatan: 'Cicilan 1' }
    ]
  },

  // Deni Sumargo (2023005)
  {
    id: 'TG014',
    nis: '2023005',
    nama: 'Deni Sumargo',
    kelas: 'VIII-A',
    jenisPembayaranId: '1',
    namaTagihan: 'SPP Bulan Juli 2025',
    tipe: 'Bulanan',
    bulan: 'Juli 2025',
    nominal: 150000,
    terbayar: 0,
    status: 'Belum Bayar',
    tanggalJatuhTempo: '2025-07-10',
    riwayatPembayaran: []
  },
  {
    id: 'TG015',
    nis: '2023005',
    nama: 'Deni Sumargo',
    kelas: 'VIII-A',
    jenisPembayaranId: '1',
    namaTagihan: 'SPP Bulan Agustus 2025',
    tipe: 'Bulanan',
    bulan: 'Agustus 2025',
    nominal: 150000,
    terbayar: 0,
    status: 'Belum Bayar',
    tanggalJatuhTempo: '2025-08-10',
    riwayatPembayaran: []
  }
];

export const INITIAL_PENGELUARAN_KAS: PengeluaranKas[] = [
  {
    id: 'OUT-001',
    noTransaksi: 'KAS-OUT/2025/07/001',
    tanggal: '2025-07-02',
    kategori: 'ATK & Cetak',
    deskripsi: 'Pembelian Kertas HVS A4, Tinta Printer & Map Arsip Kantor',
    nominal: 1250000,
    sumberDana: 'Kas Tunai Utama',
    penanggungJawab: 'Rina Rahmawati, S.Psi',
    penerima: 'Toko ATK Jaya Abadi'
  },
  {
    id: 'OUT-002',
    noTransaksi: 'KAS-OUT/2025/07/002',
    tanggal: '2025-07-05',
    kategori: 'Operasional Sekolah',
    deskripsi: 'Pembayaran Tagihan Listrik PLN & Air PDAM Bulan Juni',
    nominal: 3450000,
    sumberDana: 'Bank BRI Sekolah',
    penanggungJawab: 'Budi Santoso (Bendahara)',
    penerima: 'PT PLN & PDAM Kota'
  },
  {
    id: 'OUT-003',
    noTransaksi: 'KAS-OUT/2025/07/003',
    tanggal: '2025-07-12',
    kategori: 'Maintenance & Perbaikan',
    deskripsi: 'Servis Rutin AC Ruang Lab Komputer & Pergantian Lampu Kelas',
    nominal: 2100000,
    sumberDana: 'Kas Tunai Utama',
    penanggungJawab: 'Agus Pratama, S.Kom',
    penerima: 'Sinar Teknik Servis'
  },
  {
    id: 'OUT-004',
    noTransaksi: 'KAS-OUT/2025/07/004',
    tanggal: '2025-07-20',
    kategori: 'Kegiatan Siswa',
    deskripsi: 'Konsumsi & Biaya Transport Kegiatan Masa Pengenalan Lingkungan Sekolah (MPLS)',
    nominal: 4800000,
    sumberDana: 'Bank BRI Sekolah',
    penanggungJawab: 'Siti Aminah, M.Pd',
    penerima: 'Panitia MPLS & Catering Barokah'
  },
  {
    id: 'OUT-005',
    noTransaksi: 'KAS-OUT/2025/07/005',
    tanggal: '2025-07-28',
    kategori: 'Gaji & Honor',
    deskripsi: 'Pencairan Gaji & Honor Guru Honorer Bulan Juli 2025',
    nominal: 14500000,
    sumberDana: 'Bank Mandiri Sekolah',
    penanggungJawab: 'Budi Santoso (Bendahara)',
    penerima: 'Seluruh Guru & Staf Honorer'
  }
];

export const INITIAL_SLIP_GAJI: SlipGaji[] = [
  {
    id: 'PAY-2025-07-01',
    bulan: 'Juli 2025',
    tahun: 2025,
    guruId: '1',
    namaGuru: 'Budi Santoso, S.Pd',
    nip: '198001012005011001',
    jabatan: 'Wali Kelas & Guru Matematika',
    statusPegawai: 'GTY',
    gajiPokok: 3200000,
    tunjanganJabatan: 500000,
    honorJam: 1200000, // 24 jam x 50.000
    jumlahJam: 24,
    bonusInsentif: 300000,
    potonganAbsen: 0,
    potonganBPJS: 120000,
    potonganPinjaman: 0,
    totalDiterima: 5080000,
    tanggalBayar: '2025-07-28',
    metode: 'Transfer Bank',
    status: 'Lunas',
    noSlip: 'SLIP/2025/07/001'
  },
  {
    id: 'PAY-2025-07-02',
    bulan: 'Juli 2025',
    tahun: 2025,
    guruId: '2',
    namaGuru: 'Siti Aminah, M.Pd',
    nip: '198205122008012003',
    jabatan: 'Guru Bahasa Indonesia',
    statusPegawai: 'GTY',
    gajiPokok: 3000000,
    tunjanganJabatan: 400000,
    honorJam: 1000000, // 20 jam x 50.000
    jumlahJam: 20,
    bonusInsentif: 250000,
    potonganAbsen: 50000,
    potonganBPJS: 110000,
    potonganPinjaman: 200000,
    totalDiterima: 4290000,
    tanggalBayar: '2025-07-28',
    metode: 'Transfer Bank',
    status: 'Lunas',
    noSlip: 'SLIP/2025/07/002'
  },
  {
    id: 'PAY-2025-07-03',
    bulan: 'Juli 2025',
    tahun: 2025,
    guruId: '3',
    namaGuru: 'Ahmad Dahlan, S.Ag',
    nip: '199003032015011003',
    jabatan: 'Guru PAI & Pembina Kerohanian',
    statusPegawai: 'GTT / Honorer',
    gajiPokok: 2200000,
    tunjanganJabatan: 300000,
    honorJam: 900000,
    jumlahJam: 18,
    bonusInsentif: 200000,
    potonganAbsen: 0,
    potonganBPJS: 80000,
    potonganPinjaman: 0,
    totalDiterima: 3520000,
    tanggalBayar: '2025-07-28',
    metode: 'Transfer Bank',
    status: 'Lunas',
    noSlip: 'SLIP/2025/07/003'
  }
];
