export interface GuruWaliAssignment {
  id: string;
  guruId: string;
  guruNip: string;
  guruNama: string;
  siswaId: string;
  siswaNis: string;
  siswaNama: string;
  siswaKelas: string;
  tanggalPenugasan: string;
  tahunAjaran: string;
  catatanAwal?: string;
}

export interface DiagnostikBK {
  id: string;
  siswaId: string;
  siswaNis: string;
  siswaNama: string;
  siswaKelas: string;
  tanggalTes: string;
  tahunAjaran: string;
  gayaBelajar: 'Visual' | 'Auditori' | 'Kinestetik' | 'Campuran';
  tingkatPemahamanAwal: 'Tinggi' | 'Sedang' | 'Perlu Bimbingan Khusus';
  profilKeluarga: string;
  motivasiBelajar: 'Sangat Tinggi' | 'Sedang' | 'Kurang Motivasional';
  minatBakat: string;
  potensiHambatan: string;
  rekomendasiBK: string;
  konselorNama: string;
  statusPenanganan: 'Belum Ditindaklanjuti' | 'Dalam Proses' | 'Selesai';
}

export interface TindakLanjutWali {
  id: string;
  diagnostikId?: string;
  siswaNis: string;
  siswaNama: string;
  siswaKelas: string;
  guruNip: string;
  guruNama: string;
  tanggalTindakLanjut: string;
  jenisTindakLanjut: 'Konsultasi Belajar' | 'Bimbingan Karakter/Sikap' | 'Homevisit / Wawancara Ortu' | 'Remidial/Pengayaan Khusus' | 'Pembinaan Kedisiplinan';
  deskripsiLaporanBK: string;
  tindakanWali: string;
  hasilBimbingan: string;
  status: 'Perlu Tindak Lanjut' | 'Dalam Proses Bimbingan' | 'Selesai / Teratasi' | 'Dirujuk Kembali ke BK';
  jadwalSesiBerikutnya?: string;
  catatanKemajuan: string;
}
