import React, { createContext, useContext, useState, useEffect } from 'react';
import { gasApiCall } from '../utils/gasApi';
import { LandingConfig, DEFAULT_LANDING_CONFIG } from '../types/landing';
import { JenisPembayaran, TagihanSiswa, PengeluaranKas, SlipGaji } from '../types/keuangan';
import {
  INITIAL_JENIS_PEMBAYARAN,
  INITIAL_TAGIHAN_SISWA,
  INITIAL_PENGELUARAN_KAS,
  INITIAL_SLIP_GAJI
} from '../data/initialKeuangan';

// Shared initial data
export const INITIAL_KELAS_DATA = [
  { id: '1', tingkat: 'VII', namaKelas: 'VII-A', waliKelas: 'Budi Santoso, S.Pd', jumlahSiswa: 32 },
  { id: '2', tingkat: 'VII', namaKelas: 'VII-B', waliKelas: 'Siti Aminah, M.Pd', jumlahSiswa: 30 },
  { id: '3', tingkat: 'VIII', namaKelas: 'VIII-A', waliKelas: 'Ahmad Dahlan, S.Ag', jumlahSiswa: 34 },
  { id: '4', tingkat: 'VIII', namaKelas: 'VIII-B', waliKelas: 'Rina Rahmawati, S.Psi', jumlahSiswa: 33 },
  { id: '5', tingkat: 'IX', namaKelas: 'IX-A', waliKelas: 'Agus Pratama, S.Kom', jumlahSiswa: 35 },
];

export const INITIAL_SISWA_DATA = [
  { id: '1', nis: '2023001', nisn: '0051234567', nama: 'Ahmad Maulana', jk: 'L', kelas: 'VII-A', status: 'Aktif', tempatLahir: 'Jakarta', tanggalLahir: '2009-05-12', alamat: 'Jl. Merdeka No. 1', namaAyah: 'Budi', namaIbu: 'Siti', noHp: '08123456789', username: 'ahmadmaulana', password: 'password123' },
  { id: '2', nis: '2023002', nisn: '0051234568', nama: 'Siti Nurhaliza', jk: 'P', kelas: 'VII-A', status: 'Aktif', tempatLahir: 'Bandung', tanggalLahir: '2009-08-20', alamat: 'Jl. Sudirman No. 2', namaAyah: 'Andi', namaIbu: 'Rina', noHp: '08987654321', username: 'sitinurhaliza', password: 'password123' },
  { id: '3', nis: '2023003', nisn: '0051234569', nama: 'Budi Santoso', jk: 'L', kelas: 'VII-B', status: 'Aktif', tempatLahir: 'Surabaya', tanggalLahir: '2009-03-10', alamat: 'Jl. Pahlawan No. 3', namaAyah: 'Cipto', namaIbu: 'Dewi', noHp: '08561234987', username: 'budisantoso', password: 'password123' },
  { id: '4', nis: '2023004', nisn: '0051234570', nama: 'Citra Kirana', jk: 'P', kelas: 'VII-B', status: 'Aktif', tempatLahir: 'Malang', tanggalLahir: '2009-06-15', alamat: 'Jl. Diponegoro No. 4', namaAyah: 'Dharma', namaIbu: 'Yanti', noHp: '08123456000', username: 'citrakirana', password: 'password123' },
  { id: '5', nis: '2023005', nisn: '0051234571', nama: 'Deni Sumargo', jk: 'L', kelas: 'VIII-A', status: 'Aktif', tempatLahir: 'Makassar', tanggalLahir: '2008-11-25', alamat: 'Jl. Veteran No. 5', namaAyah: 'Edi', namaIbu: 'Lina', noHp: '08123456111', username: 'denisumargo', password: 'password123' },
  { id: '6', nis: '2022001', nisn: '0041234567', nama: 'Bima Sakti', jk: 'L', kelas: 'VIII-B', status: 'Aktif', tempatLahir: 'Surabaya', tanggalLahir: '2008-01-15', alamat: 'Jl. Pahlawan No. 3', namaAyah: 'Cipto', namaIbu: 'Dewi', noHp: '08561234987', username: 'bimasakti', password: 'password123' }
];

export const INITIAL_GURU_DATA = [
  { id: '1', nip: '198001012005011001', nama: 'Budi Santoso, S.Pd', jk: 'L', mapel: 'Matematika', status: 'Aktif', tempatLahir: 'Jakarta', tanggalLahir: '1980-01-01', alamat: 'Jl. Pendidikan No 1', statusPegawai: 'GTY', jabatan: 'Guru Kelas', pendidikan: 'S1', jurusan: 'Pendidikan Matematika', tahunLulus: '2004', noHp: '08123456789', username: 'budisantoso', password: 'password123' },
  { id: '2', nip: '198205122008012003', nama: 'Siti Aminah, M.Pd', jk: 'P', mapel: 'Bahasa Indonesia', status: 'Aktif', tempatLahir: 'Bandung', tanggalLahir: '1982-05-12', alamat: 'Jl. Merdeka No 2', statusPegawai: 'GTY', jabatan: 'Guru Kelas', pendidikan: 'S2', jurusan: 'Pendidikan Bahasa Indonesia', tahunLulus: '2007', noHp: '08987654321', username: 'sitiaminah', password: 'password123' },
  { id: '3', nip: '199003032015011003', nama: 'Ahmad Dahlan, S.Ag', jk: 'L', mapel: 'Pendidikan Agama Islam', status: 'Aktif', tempatLahir: 'Yogyakarta', tanggalLahir: '1990-03-03', alamat: 'Jl. KH Ahmad Dahlan No. 3', statusPegawai: 'GTY', jabatan: 'Guru Kelas', pendidikan: 'S1', jurusan: 'Pendidikan Agama Islam', tahunLulus: '2012', noHp: '08123456780', username: 'ahmaddahlan', password: 'password123' }
];

export const INITIAL_PELANGGARAN_DATA = [
  { id: '1', tanggal: '2023-10-25', nis: '2023001', nama: 'Ahmad Maulana', kelas: 'VII-A', kategori: 'Ringan', pelanggaran: 'Terlambat masuk kelas', poin: 5, pelapor: 'Budi Santoso, S.Pd' },
  { id: '2', tanggal: '2023-10-24', nis: '2023005', nama: 'Deni Sumargo', kelas: 'IX-C', kategori: 'Sedang', pelanggaran: 'Rambut gondrong/tidak rapi', poin: 10, pelapor: 'Rina Rahmawati, S.Psi' },
];

export const INITIAL_MAPEL_DATA = [
  { 
    id: '1', 
    kode: 'MP001', 
    nama: 'Pendidikan Agama Islam', 
    kelompok: 'Wajib A', 
    kkm: 75, 
    kelas: 'Semua Kelas',
    capaian: [
      'Menunjukkan pemahaman terhadap bacaan Al-Qur\'an dan Tajwid',
      'Memahami ketentuan ibadah dan akhlak terpuji',
      'Mengaplikasikan keteladanan kisah para Nabi dalam kehidupan sehari-hari'
    ]
  },
  { 
    id: '2', 
    kode: 'MP002', 
    nama: 'Bahasa Indonesia', 
    kelompok: 'Wajib A', 
    kkm: 75, 
    kelas: 'Semua Kelas',
    capaian: [
      'Mampu menganalisis gagasan utama dalam teks deskripsi dan narasi',
      'Menyajikan hasil analisis puisi dan cerita pendek dengan struktur yang baik',
      'Menggunakan tata bahasa dan ejaan Bahasa Indonesia dengan benar'
    ]
  },
  { 
    id: '3', 
    kode: 'MP003', 
    nama: 'Matematika', 
    kelompok: 'Wajib A', 
    kkm: 70, 
    kelas: 'Semua Kelas',
    capaian: [
      'Mampu menyelesaikan operasi hitung bilangan bulat dan pecahan',
      'Memahami dan menyelesaikan bentuk aljabar dan persamaan linear',
      'Menganalisis hubungan antar sudut dan konsep aritmetika sosial'
    ]
  },
  { 
    id: '4', 
    kode: 'MP004', 
    nama: 'Ilmu Pengetahuan Alam (IPA)', 
    kelompok: 'Wajib A', 
    kkm: 70, 
    kelas: 'Semua Kelas',
    capaian: [
      'Menganalisis objek IPA dan pengamatannya serta besaran dan satuan',
      'Memahami klasifikasi makhluk hidup dan materi',
      'Menganalisis konsep suhu, kalor, dan pemuaian'
    ]
  },
  { 
    id: '5', 
    kode: 'MP005', 
    nama: 'Bahasa Inggris', 
    kelompok: 'Wajib A', 
    kkm: 70, 
    kelas: 'Semua Kelas',
    capaian: [
      'Mengidentifikasi ungkapan sapaan, pamitan, dan ucapan terima kasih',
      'Menyusun teks deskriptif lisan dan tulis sederhana',
      'Menggunakan kata kerja (verbs) dan tenses dasar secara tepat'
    ]
  },
  { 
    id: '6', 
    kode: 'MP006', 
    nama: 'Seni Budaya', 
    kelompok: 'Wajib B', 
    kkm: 78, 
    kelas: 'Semua Kelas',
    capaian: [
      'Memahami teknik dan ragam hias seni rupa daerah',
      'Menyanyikan lagu daerah dengan artikulasi dan nada yang benar'
    ]
  },
  { 
    id: '7', 
    kode: 'MP007', 
    nama: 'PJOK', 
    kelompok: 'Wajib B', 
    kkm: 78, 
    kelas: 'Semua Kelas',
    capaian: [
      'Mempraktikkan variasi dan kombinasi gerak spesifik permainan bola besar',
      'Memahami konsep kebugaran jasmani dan pengukuran derajat kebugaran'
    ]
  }
];

export const INITIAL_NILAI_DATA = [
  {
    id: '1',
    nis: '2023001',
    nama: 'Ahmad Maulana',
    kelas: 'VII-A',
    tahunAjaran: '2023/2024',
    semester: 'Ganjil',
    mapel: 'Matematika',
    tugas: 85,
    uh: 80,
    uts: 88,
    uas: 90,
    nilaiAkhir: 86,
    predikat: 'A',
    keterangan: 'Tuntas',
    catatan: 'Sangat giat belajar matematika.'
  },
  {
    id: '2',
    nis: '2023001',
    nama: 'Ahmad Maulana',
    kelas: 'VII-A',
    tahunAjaran: '2023/2024',
    semester: 'Ganjil',
    mapel: 'Bahasa Indonesia',
    tugas: 90,
    uh: 88,
    uts: 85,
    uas: 89,
    nilaiAkhir: 88,
    predikat: 'A',
    keterangan: 'Tuntas',
    catatan: 'Kemampuan tata bahasa sangat baik.'
  },
  {
    id: '3',
    nis: '2023001',
    nama: 'Ahmad Maulana',
    kelas: 'VII-A',
    tahunAjaran: '2023/2024',
    semester: 'Ganjil',
    mapel: 'Pendidikan Agama Islam',
    tugas: 92,
    uh: 90,
    uts: 95,
    uas: 92,
    nilaiAkhir: 92,
    predikat: 'A',
    keterangan: 'Tuntas',
    catatan: 'Sangat baik dalam pemahaman mufrodat & Al-Qur\'an.'
  },
  {
    id: '4',
    nis: '2023002',
    nama: 'Siti Nurhaliza',
    kelas: 'VII-A',
    tahunAjaran: '2023/2024',
    semester: 'Ganjil',
    mapel: 'Matematika',
    tugas: 78,
    uh: 75,
    uts: 72,
    uas: 76,
    nilaiAkhir: 75,
    predikat: 'B',
    keterangan: 'Tuntas',
    catatan: 'Perlu latihan lebih pada soal cerita.'
  },
  {
    id: '5',
    nis: '2023002',
    nama: 'Siti Nurhaliza',
    kelas: 'VII-A',
    tahunAjaran: '2023/2024',
    semester: 'Ganjil',
    mapel: 'Bahasa Indonesia',
    tugas: 95,
    uh: 92,
    uts: 90,
    uas: 94,
    nilaiAkhir: 92,
    predikat: 'A',
    keterangan: 'Tuntas',
    catatan: 'Bakat sastra dan penulisan sangat menonjol.'
  },
  {
    id: '6',
    nis: '2023001',
    nama: 'Ahmad Maulana',
    kelas: 'VII-A',
    tahunAjaran: '2023/2024',
    semester: 'Ganjil',
    mapel: 'Ilmu Pengetahuan Alam (IPA)',
    tugas: 82,
    uh: 85,
    uts: 80,
    uas: 84,
    nilaiAkhir: 83,
    predikat: 'B',
    keterangan: 'Tuntas',
    catatan: 'Pemahaman konsep IPA cukup baik.'
  },
  {
    id: '7',
    nis: '2023001',
    nama: 'Ahmad Maulana',
    kelas: 'VII-A',
    tahunAjaran: '2023/2024',
    semester: 'Ganjil',
    mapel: 'Bahasa Inggris',
    tugas: 88,
    uh: 84,
    uts: 86,
    uas: 90,
    nilaiAkhir: 87,
    predikat: 'A',
    keterangan: 'Tuntas',
    catatan: 'Vocabulary dan grammar teratur.'
  }
];

export const INITIAL_BIMBINGAN_DATA = [
  {
    id: 'BK001',
    tanggal: '2026-07-20',
    nis: '2023001',
    nama: 'Ahmad Maulana',
    kelas: 'VII-A',
    kategori: 'Belajar',
    jenisLayanan: 'Konseling Individual',
    deskripsiMasalah: 'Menurunnya konsentrasi saat pelajaran matematika dan tampak sering mengantuk.',
    solusi: 'Penyusunan jadwal belajar rumah dan pengaturan jam tidur malam.',
    tindakLanjut: 'Evaluasi mingguan perkembangan jam tidur dan kehadiran kelas.',
    konselor: 'Siti Rahmawati, S.Pd (Guru BK)',
    status: 'Selesai',
    statusOrtu: 'Selesai'
  },
  {
    id: 'BK002',
    tanggal: '2026-07-24',
    nis: '2023005',
    nama: 'Budi Santoso',
    kelas: 'VII-B',
    kategori: 'Kedisiplinan',
    jenisLayanan: 'Konseling Individual',
    deskripsiMasalah: 'Keterlambatan berturut-turut lebih dari 3 kali dalam seminggu dan akumulasi poin pelanggaran mencapai 35 poin.',
    solusi: 'Memberikan pengarahan pentingnya kedisiplinan dan membuat kesepakatan tata tertib.',
    tindakLanjut: 'Pemanggilan orang tua/wali siswa ke sekolah untuk penandatanganan komitmen tertulis.',
    konselor: 'Siti Rahmawati, S.Pd (Guru BK)',
    status: 'Perlu Pemanggilan Ortuj',
    statusOrtu: 'Surat Dikirim'
  }
];

export const INITIAL_JADWAL_DATA = [
  { id: 'JDW001', hari: 'Senin', jamKe: 1, waktuMulai: '07:00', waktuSelesai: '07:40', kelas: 'VII-A', mapel: 'Pendidikan Agama Islam', guru: 'Ahmad Dahlan, S.Ag', ruangan: 'Ruang 7A', keterangan: 'Pertemuan Rutin' },
  { id: 'JDW002', hari: 'Senin', jamKe: 2, waktuMulai: '07:40', waktuSelesai: '08:20', kelas: 'VII-A', mapel: 'Pendidikan Agama Islam', guru: 'Ahmad Dahlan, S.Ag', ruangan: 'Ruang 7A', keterangan: '' },
  { id: 'JDW003', hari: 'Senin', jamKe: 3, waktuMulai: '08:20', waktuSelesai: '09:00', kelas: 'VII-A', mapel: 'Matematika', guru: 'Budi Santoso, S.Pd', ruangan: 'Ruang 7A', keterangan: '' },
  { id: 'JDW004', hari: 'Senin', jamKe: 4, waktuMulai: '09:00', waktuSelesai: '09:40', kelas: 'VII-A', mapel: 'Matematika', guru: 'Budi Santoso, S.Pd', ruangan: 'Ruang 7A', keterangan: '' },
  { id: 'JDW005', hari: 'Senin', jamKe: 5, waktuMulai: '10:00', waktuSelesai: '10:40', kelas: 'VII-A', mapel: 'Bahasa Indonesia', guru: 'Siti Aminah, M.Pd', ruangan: 'Ruang 7A', keterangan: '' },
  { id: 'JDW006', hari: 'Senin', jamKe: 6, waktuMulai: '10:40', waktuSelesai: '11:20', kelas: 'VII-A', mapel: 'Bahasa Indonesia', guru: 'Siti Aminah, M.Pd', ruangan: 'Ruang 7A', keterangan: '' },
  { id: 'JDW007', hari: 'Selasa', jamKe: 1, waktuMulai: '07:00', waktuSelesai: '07:40', kelas: 'VII-A', mapel: 'Bahasa Inggris', guru: 'Rina Rahmawati, S.Psi', ruangan: 'Lab Bahasa', keterangan: 'Praktik Listening' },
  { id: 'JDW008', hari: 'Selasa', jamKe: 2, waktuMulai: '07:40', waktuSelesai: '08:20', kelas: 'VII-A', mapel: 'Bahasa Inggris', guru: 'Rina Rahmawati, S.Psi', ruangan: 'Lab Bahasa', keterangan: '' },
  { id: 'JDW009', hari: 'Selasa', jamKe: 3, waktuMulai: '08:20', waktuSelesai: '09:00', kelas: 'VII-A', mapel: 'Ilmu Pengetahuan Alam (IPA)', guru: 'Agus Pratama, S.Kom', ruangan: 'Lab IPA', keterangan: 'Praktikum Mikroskop' },
  { id: 'JDW010', hari: 'Selasa', jamKe: 4, waktuMulai: '09:00', waktuSelesai: '09:40', kelas: 'VII-A', mapel: 'Ilmu Pengetahuan Alam (IPA)', guru: 'Agus Pratama, S.Kom', ruangan: 'Lab IPA', keterangan: '' },
  { id: 'JDW011', hari: 'Senin', jamKe: 1, waktuMulai: '07:00', waktuSelesai: '07:40', kelas: 'VII-B', mapel: 'Bahasa Indonesia', guru: 'Siti Aminah, M.Pd', ruangan: 'Ruang 7B', keterangan: '' },
  { id: 'JDW012', hari: 'Senin', jamKe: 2, waktuMulai: '07:40', waktuSelesai: '08:20', kelas: 'VII-B', mapel: 'Bahasa Indonesia', guru: 'Siti Aminah, M.Pd', ruangan: 'Ruang 7B', keterangan: '' },
  { id: 'JDW013', hari: 'Senin', jamKe: 3, waktuMulai: '08:20', waktuSelesai: '09:00', kelas: 'VII-B', mapel: 'Pendidikan Agama Islam', guru: 'Ahmad Dahlan, S.Ag', ruangan: 'Ruang 7B', keterangan: '' },
  { id: 'JDW014', hari: 'Senin', jamKe: 4, waktuMulai: '09:00', waktuSelesai: '09:40', kelas: 'VII-B', mapel: 'Matematika', guru: 'Budi Santoso, S.Pd', ruangan: 'Ruang 7B', keterangan: '' },
  { id: 'JDW015', hari: 'Rabu', jamKe: 1, waktuMulai: '07:00', waktuSelesai: '07:40', kelas: 'VII-A', mapel: 'PJOK', guru: 'Budi Santoso, S.Pd', ruangan: 'Lapangan Olahraga', keterangan: 'Baju Olahraga' },
  { id: 'JDW016', hari: 'Rabu', jamKe: 2, waktuMulai: '07:40', waktuSelesai: '08:20', kelas: 'VII-A', mapel: 'PJOK', guru: 'Budi Santoso, S.Pd', ruangan: 'Lapangan Olahraga', keterangan: '' },
  { id: 'JDW017', hari: 'Rabu', jamKe: 3, waktuMulai: '08:20', waktuSelesai: '09:00', kelas: 'VII-A', mapel: 'Seni Budaya', guru: 'Siti Aminah, M.Pd', ruangan: 'Ruang Kesenian', keterangan: '' }
];

type DatabaseContextType = {
  siswaData: any[];
  setSiswaData: (data: any[]) => void;
  guruData: any[];
  setGuruData: (data: any[]) => void;
  kelasData: any[];
  setKelasData: (data: any[]) => void;
  pelanggaranData: any[];
  setPelanggaranData: (data: any[]) => void;
  absensiData: any[];
  setAbsensiData: (data: any[]) => void;
  absensiGuruData: any[];
  setAbsensiGuruData: (data: any[]) => void;
  kategoriPelanggaranData: any[];
  setKategoriPelanggaranData: (data: any[]) => void;
  mapelData: any[];
  setMapelData: (data: any[]) => void;
  nilaiData: any[];
  setNilaiData: (data: any[]) => void;
  bimbinganData: any[];
  setBimbinganData: (data: any[]) => void;
  jadwalData: any[];
  setJadwalData: (data: any[]) => void;
  // Finance Data
  jenisPembayaranData: JenisPembayaran[];
  setJenisPembayaranData: (data: JenisPembayaran[]) => void;
  tagihanSiswaData: TagihanSiswa[];
  setTagihanSiswaData: (data: TagihanSiswa[]) => void;
  pengeluaranKasData: PengeluaranKas[];
  setPengeluaranKasData: (data: PengeluaranKas[]) => void;
  payrollData: SlipGaji[];
  setPayrollData: (data: SlipGaji[]) => void;
  landingConfig: LandingConfig;
  setLandingConfig: (config: LandingConfig) => void;
  resetDatabase: () => void;
  isLoading: boolean;
};

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const DatabaseProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);

  const [landingConfig, _setLandingConfig] = useState<LandingConfig>(() => {
    const saved = localStorage.getItem('sims_landing_config');
    return saved ? { ...DEFAULT_LANDING_CONFIG, ...JSON.parse(saved) } : DEFAULT_LANDING_CONFIG;
  });
  
  const [siswaData, _setSiswaData] = useState<any[]>(() => {
    const saved = localStorage.getItem('sims_siswa');
    return saved ? JSON.parse(saved) : INITIAL_SISWA_DATA;
  });
  
  const [guruData, _setGuruData] = useState<any[]>(() => {
    const saved = localStorage.getItem('sims_guru');
    return saved ? JSON.parse(saved) : INITIAL_GURU_DATA;
  });
  
  const [kelasData, _setKelasData] = useState<any[]>(() => {
    const saved = localStorage.getItem('sims_kelas');
    return saved ? JSON.parse(saved) : INITIAL_KELAS_DATA;
  });
  
  const [pelanggaranData, _setPelanggaranData] = useState<any[]>(() => {
    const saved = localStorage.getItem('sims_pelanggaran');
    return saved ? JSON.parse(saved) : INITIAL_PELANGGARAN_DATA;
  });
  
  const [absensiData, _setAbsensiData] = useState<any[]>(() => {
    const saved = localStorage.getItem('sims_absensi');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [absensiGuruData, _setAbsensiGuruData] = useState<any[]>(() => {
    const saved = localStorage.getItem('sims_absensi_guru');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [kategoriPelanggaranData, _setKategoriPelanggaranData] = useState<any[]>(() => {
    const saved = localStorage.getItem('sims_kategori_pelanggaran');
    return saved ? JSON.parse(saved) : [
      { id: '1', kategori: 'Keterlambatan', jenis: 'Terlambat Masuk', poin: 10 },
      { id: '2', kategori: 'Kerapian', jenis: 'Rambut Panjang', poin: 5 },
      { id: '3', kategori: 'Perilaku', jenis: 'Berkelahi', poin: 50 },
    ];
  });

  const [mapelData, _setMapelData] = useState<any[]>(() => {
    const saved = localStorage.getItem('sims_mapel');
    return saved ? JSON.parse(saved) : INITIAL_MAPEL_DATA;
  });

  const [nilaiData, _setNilaiData] = useState<any[]>(() => {
    const saved = localStorage.getItem('sims_nilai');
    return saved ? JSON.parse(saved) : INITIAL_NILAI_DATA;
  });

  const [bimbinganData, _setBimbinganData] = useState<any[]>(() => {
    const saved = localStorage.getItem('sims_bimbingan');
    return saved ? JSON.parse(saved) : INITIAL_BIMBINGAN_DATA;
  });

  const [jadwalData, _setJadwalData] = useState<any[]>(() => {
    const saved = localStorage.getItem('sims_jadwal');
    return saved ? JSON.parse(saved) : INITIAL_JADWAL_DATA;
  });

  const [jenisPembayaranData, _setJenisPembayaranData] = useState<JenisPembayaran[]>(() => {
    const saved = localStorage.getItem('sims_jenis_pembayaran');
    return saved ? JSON.parse(saved) : INITIAL_JENIS_PEMBAYARAN;
  });

  const [tagihanSiswaData, _setTagihanSiswaData] = useState<TagihanSiswa[]>(() => {
    const saved = localStorage.getItem('sims_tagihan_siswa');
    return saved ? JSON.parse(saved) : INITIAL_TAGIHAN_SISWA;
  });

  const [pengeluaranKasData, _setPengeluaranKasData] = useState<PengeluaranKas[]>(() => {
    const saved = localStorage.getItem('sims_pengeluaran_kas');
    return saved ? JSON.parse(saved) : INITIAL_PENGELUARAN_KAS;
  });

  const [payrollData, _setPayrollData] = useState<SlipGaji[]>(() => {
    const saved = localStorage.getItem('sims_payroll');
    return saved ? JSON.parse(saved) : INITIAL_SLIP_GAJI;
  });

  // Load from GAS on mount
  useEffect(() => {
    const loadFromGas = async () => {
      setIsLoading(true);
      const res = await gasApiCall('getSemuaData');
      if (res && res.status === 'success' && res.data) {
        if (res.data.siswa?.length) _setSiswaData(res.data.siswa);
        if (res.data.guru?.length) _setGuruData(res.data.guru);
        if (res.data.kelas?.length) _setKelasData(res.data.kelas);
        if (res.data.pelanggaran?.length) _setPelanggaranData(res.data.pelanggaran);
        if (res.data.absensiSiswa?.length) _setAbsensiData(res.data.absensiSiswa);
        if (res.data.absensiGuru?.length) _setAbsensiData(res.data.absensiGuru);
        if (res.data.kategoriPelanggaran?.length) _setKategoriPelanggaranData(res.data.kategoriPelanggaran);
        if (res.data.mapel?.length) _setMapelData(res.data.mapel);
        if (res.data.nilai?.length) _setNilaiData(res.data.nilai);
        if (res.data.bimbingan?.length) _setBimbinganData(res.data.bimbingan);
        if (res.data.jadwal?.length) _setJadwalData(res.data.jadwal);
        if (res.data.jenisPembayaran?.length) _setJenisPembayaranData(res.data.jenisPembayaran);
        if (res.data.tagihanSiswa?.length) _setTagihanSiswaData(res.data.tagihanSiswa);
        if (res.data.pengeluaranKas?.length) _setPengeluaranKasData(res.data.pengeluaranKas);
        if (res.data.payroll?.length) _setPayrollData(res.data.payroll);
      }
      setIsLoading(false);
    };
    loadFromGas();
  }, []);

  // Wrappers to update local state, localStorage, and sync to GAS
  const setSiswaData = (data: any[]) => {
    _setSiswaData(data);
    localStorage.setItem('sims_siswa', JSON.stringify(data));
    gasApiCall('syncAllData', { payload: { type: 'siswa', data } });
  };

  const setGuruData = (data: any[]) => {
    _setGuruData(data);
    localStorage.setItem('sims_guru', JSON.stringify(data));
    gasApiCall('syncAllData', { payload: { type: 'guru', data } });
  };

  const setKelasData = (data: any[]) => {
    _setKelasData(data);
    localStorage.setItem('sims_kelas', JSON.stringify(data));
    gasApiCall('syncAllData', { payload: { type: 'kelas', data } });
  };

  const setPelanggaranData = (data: any[]) => {
    _setPelanggaranData(data);
    localStorage.setItem('sims_pelanggaran', JSON.stringify(data));
    gasApiCall('syncAllData', { payload: { type: 'pelanggaran', data } });
  };

  const setAbsensiData = (data: any[]) => {
    _setAbsensiData(data);
    localStorage.setItem('sims_absensi', JSON.stringify(data));
    gasApiCall('syncAllData', { payload: { type: 'absensiSiswa', data } });
  };

  const setAbsensiGuruData = (data: any[]) => {
    _setAbsensiGuruData(data);
    localStorage.setItem('sims_absensi_guru', JSON.stringify(data));
    gasApiCall('syncAllData', { payload: { type: 'absensiGuru', data } });
  };

  const setKategoriPelanggaranData = (data: any[]) => {
    _setKategoriPelanggaranData(data);
    localStorage.setItem('sims_kategori_pelanggaran', JSON.stringify(data));
    gasApiCall('syncAllData', { payload: { type: 'kategoriPelanggaran', data } });
  };

  const setMapelData = (data: any[]) => {
    _setMapelData(data);
    localStorage.setItem('sims_mapel', JSON.stringify(data));
    gasApiCall('syncAllData', { payload: { type: 'mapel', data } });
  };

  const setNilaiData = (data: any[]) => {
    _setNilaiData(data);
    localStorage.setItem('sims_nilai', JSON.stringify(data));
    gasApiCall('syncAllData', { payload: { type: 'nilai', data } });
  };

  const setBimbinganData = (data: any[]) => {
    _setBimbinganData(data);
    localStorage.setItem('sims_bimbingan', JSON.stringify(data));
    gasApiCall('syncAllData', { payload: { type: 'bimbingan', data } });
  };

  const setJadwalData = (data: any[]) => {
    _setJadwalData(data);
    localStorage.setItem('sims_jadwal', JSON.stringify(data));
    gasApiCall('syncAllData', { payload: { type: 'jadwal', data } });
  };

  const setJenisPembayaranData = (data: JenisPembayaran[]) => {
    _setJenisPembayaranData(data);
    localStorage.setItem('sims_jenis_pembayaran', JSON.stringify(data));
    gasApiCall('syncAllData', { payload: { type: 'jenisPembayaran', data } });
  };

  const setTagihanSiswaData = (data: TagihanSiswa[]) => {
    _setTagihanSiswaData(data);
    localStorage.setItem('sims_tagihan_siswa', JSON.stringify(data));
    gasApiCall('syncAllData', { payload: { type: 'tagihanSiswa', data } });
  };

  const setPengeluaranKasData = (data: PengeluaranKas[]) => {
    _setPengeluaranKasData(data);
    localStorage.setItem('sims_pengeluaran_kas', JSON.stringify(data));
    gasApiCall('syncAllData', { payload: { type: 'pengeluaranKas', data } });
  };

  const setPayrollData = (data: SlipGaji[]) => {
    _setPayrollData(data);
    localStorage.setItem('sims_payroll', JSON.stringify(data));
    gasApiCall('syncAllData', { payload: { type: 'payroll', data } });
  };

  const setLandingConfig = (config: LandingConfig) => {
    _setLandingConfig(config);
    localStorage.setItem('sims_landing_config', JSON.stringify(config));
    gasApiCall('syncAllData', { payload: { type: 'landingConfig', data: config } });
  };

  const resetDatabase = async () => {
    setSiswaData(INITIAL_SISWA_DATA);
    setGuruData(INITIAL_GURU_DATA);
    setKelasData(INITIAL_KELAS_DATA);
    setAbsensiData([]);
    setAbsensiGuruData([]);
    setPelanggaranData([]);
    setMapelData(INITIAL_MAPEL_DATA);
    setNilaiData(INITIAL_NILAI_DATA);
    setBimbinganData(INITIAL_BIMBINGAN_DATA);
    setJadwalData(INITIAL_JADWAL_DATA);
    setJenisPembayaranData(INITIAL_JENIS_PEMBAYARAN);
    setTagihanSiswaData(INITIAL_TAGIHAN_SISWA);
    setPengeluaranKasData(INITIAL_PENGELUARAN_KAS);
    setPayrollData(INITIAL_SLIP_GAJI);
    await gasApiCall('resetDatabase');
  };

  return (
    <DatabaseContext.Provider value={{
      siswaData, setSiswaData,
      guruData, setGuruData,
      kelasData, setKelasData,
      pelanggaranData, setPelanggaranData,
      absensiData, setAbsensiData, 
      absensiGuruData, setAbsensiGuruData, 
      kategoriPelanggaranData, setKategoriPelanggaranData,
      mapelData, setMapelData,
      nilaiData, setNilaiData,
      bimbinganData, setBimbinganData,
      jadwalData, setJadwalData,
      jenisPembayaranData, setJenisPembayaranData,
      tagihanSiswaData, setTagihanSiswaData,
      pengeluaranKasData, setPengeluaranKasData,
      payrollData, setPayrollData,
      landingConfig, setLandingConfig,
      resetDatabase,
      isLoading
    }}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) throw new Error('useDatabase must be used within a DatabaseProvider');
  return context;
};

