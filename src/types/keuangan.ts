export type TipePembayaran = 'Bulanan' | 'Bebas' | 'Semesteran';

export interface JenisPembayaran {
  id: string;
  pos: string;
  nama: string;
  nominal: number;
  tipe: TipePembayaran;
  tingkat: string; // 'Semua', 'VII', 'VIII', 'IX'
  tahunAjaran: string;
  status: 'Aktif' | 'Non-Aktif';
  keterangan?: string;
}

export interface RiwayatPembayaran {
  id: string;
  tanggal: string;
  jumlah: number;
  metode: 'Tunai' | 'Transfer Bank' | 'QRIS';
  penerima: string;
  noKwitansi: string;
  catatan?: string;
}

export interface TagihanSiswa {
  id: string;
  nis: string;
  nama: string;
  kelas: string;
  jenisPembayaranId: string;
  namaTagihan: string;
  tipe: TipePembayaran;
  bulan?: string; // Juli, Agustus, September, etc.
  nominal: number;
  terbayar: number;
  status: 'Belum Bayar' | 'Cicilan' | 'Lunas';
  tanggalJatuhTempo?: string;
  riwayatPembayaran: RiwayatPembayaran[];
}

export interface PengeluaranKas {
  id: string;
  noTransaksi: string;
  tanggal: string;
  kategori: 'Operasional Sekolah' | 'Gaji & Honor' | 'Maintenance & Perbaikan' | 'ATK & Cetak' | 'Sarana & Laboratorium' | 'Kegiatan Siswa' | 'Lain-lain';
  deskripsi: string;
  nominal: number;
  sumberDana: 'Kas Tunai Utama' | 'Bank BRI Sekolah' | 'Bank Mandiri Sekolah' | 'Bank BNI Sekolah';
  penanggungJawab: string;
  penerima?: string;
  buktiNota?: string;
}

export interface SlipGaji {
  id: string;
  bulan: string; // "Juli 2026"
  tahun: number;
  guruId: string;
  namaGuru: string;
  nip: string;
  jabatan: string;
  statusPegawai: string;
  gajiPokok: number;
  tunjanganJabatan: number;
  honorJam: number;
  jumlahJam: number;
  bonusInsentif: number;
  potonganAbsen: number;
  potonganBPJS: number;
  potonganPinjaman: number;
  totalDiterima: number;
  tanggalBayar: string;
  metode: 'Transfer Bank' | 'Tunai';
  status: 'Lunas' | 'Pending';
  noSlip: string;
  catatan?: string;
}
