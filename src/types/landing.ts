export interface BeritaItem {
  id: string;
  judul: string;
  tanggal: string;
  kategori: string;
  ringkasan: string;
  gambarUrl?: string;
  penulis?: string;
}

export interface PrestasiItem {
  id: string;
  judul: string;
  tingkat: string;
  tahun: string;
  pemenang: string;
  deskripsi: string;
}

export interface FasilitasItem {
  id: string;
  nama: string;
  deskripsi: string;
  iconName: string;
}

export interface EkstrakurikulerItem {
  id: string;
  nama: string;
  pembina: string;
  jadwal: string;
  deskripsi: string;
}

export interface LandingConfig {
  namaSekolah: string;
  tagline: string;
  subTagline: string;
  npsn: string;
  akreditasi: string;
  tahunBerdiri: string;
  alamat: string;
  telepon: string;
  email: string;
  mapsEmbedUrl?: string;
  
  namaKepalaSekolah: string;
  gelarKepalaSekolah: string;
  fotoKepalaSekolah?: string;
  sambutanKepalaSekolah: string;
  
  visi: string;
  misi: string[];
  
  showStatsBar: boolean;
  statSiswaOverride?: number | null;
  statGuruOverride?: number | null;
  statKelasOverride?: number | null;
  statAlumni?: number;
  
  beritaList: BeritaItem[];
  prestasiList: PrestasiItem[];
  fasilitasList: FasilitasItem[];
  ekstrakurikulerList: EkstrakurikulerItem[];
  
  heroBannerUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
}

export const DEFAULT_LANDING_CONFIG: LandingConfig = {
  namaSekolah: 'SMP Al-Hikam',
  tagline: 'Mewujudkan Generasi Unggul, Berkarakter Islami, Berprestasi & Berwawasan Global',
  subTagline: 'Sistem Informasi Manajemen Sekolah Terpadu dengan Kurikulum Merdeka, Pendidikan Karakter, serta Fasilitas Pembelajaran Digital Modern.',
  npsn: '20234567',
  akreditasi: 'A (Unggul)',
  tahunBerdiri: '2010',
  alamat: 'Jl. Raya Pendidikan No. 45, Kecamatan Pesantren, Kota Kediri, Jawa Timur',
  telepon: '(0354) 682190 / +62 812-3456-7890',
  email: 'info@smpalhikam.sch.id',
  mapsEmbedUrl: '',
  
  namaKepalaSekolah: 'Dr. H. Ahmad Fauzi, M.Pd.',
  gelarKepalaSekolah: 'Kepala Sekolah',
  fotoKepalaSekolah: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400',
  sambutanKepalaSekolah: 'Selamat datang di Official Portal Website SMP Al-Hikam. Kami berkomitmen untuk menyajikan pendidikan berkualitas tinggi yang memadukan keunggulan akademik, pembentukan karakter mulia, dan kecakapan teknologi digital. Mari bersama-sama mencetak generasi emas masa depan.',
  
  visi: 'Terwujudnya Lulusan yang Bertaqwa, Cerdas, Berkarakter Islami, Berprestasi Akademik/Non-Akademik, dan Berbudaya Lingkungan.',
  misi: [
    'Menyelenggarakan pembelajaran berbasis Karakter Islami dan Al-Qur\'an.',
    'Menerapkan Kurikulum Merdeka berorientasi teknologi digital dan kecakapan abad 21.',
    'Mengembangkan minat dan bakat siswa melalui program ekstrakurikuler unggulan.',
    'Menjalin kemitraan harmonis antara sekolah, orang tua, masyarakat, dan pemerintah.'
  ],
  
  showStatsBar: true,
  statSiswaOverride: null,
  statGuruOverride: null,
  statKelasOverride: null,
  statAlumni: 1250,
  
  beritaList: [
    {
      id: 'b1',
      judul: 'Penerimaan Peserta Didik Baru (PPDB) Tahun Ajaran 2026/2027 Telah Dibuka',
      tanggal: '2026-07-20',
      kategori: 'Pengumuman',
      ringkasan: 'Pendaftaran siswa baru SMP Al-Hikam dibuka secara online dan offline dengan kuota terbatas. Dapatkan beasiswa prestasi bagi calon siswa berbakat.',
      penulis: 'Humas SMP Al-Hikam',
      gambarUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=600'
    },
    {
      id: 'b2',
      judul: 'Siswa SMP Al-Hikam Raih Juara 1 Olimpiade Sains & Matematika Tingkat Provinsi',
      tanggal: '2026-07-15',
      kategori: 'Prestasi',
      ringkasan: 'Tim olimpiade sekolah berhasil memborong medali emas pada ajang Kompetisi Sains Remaja Provinsi Jawa Timur.',
      penulis: 'Tim Kesiswaan',
      gambarUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=600'
    },
    {
      id: 'b3',
      judul: 'Pelatihan Digital Learning & Literasi Koding untuk Seluruh Siswa Kelas VII-IX',
      tanggal: '2026-07-08',
      kategori: 'Kegiatan',
      ringkasan: 'Program rutin peningkatan kompetensi digital untuk membekali siswa dengan pemikiran komputasional dan pemrograman dasar.',
      penulis: 'Tim IT Sekolah',
      gambarUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=600'
    }
  ],
  
  prestasiList: [
    {
      id: 'p1',
      judul: 'Juara 1 Kompetisi Robotik & IoT Remaja',
      tingkat: 'Nasional',
      tahun: '2025',
      pemenang: 'Ahmad Maulana & Tim Robotik',
      deskripsi: 'Mengembangkan prototipe pemilah sampah otomatis berbasis sensor cerdas.'
    },
    {
      id: 'p2',
      judul: 'Medali Emas MTQ & Tahfidz Al-Qur\'an 3 Juz',
      tingkat: 'Provinsi',
      tahun: '2025',
      pemenang: 'Siti Nurhaliza',
      deskripsi: 'Penampilan hafalan terbaik dan tartil Al-Qur\'an tingkat pelajar Jawa Timur.'
    },
    {
      id: 'p3',
      judul: 'Juara Umum Turnamen Futsal Pelajar SMP',
      tingkat: 'Kabupaten',
      tahun: '2025',
      pemenang: 'Tim Futsal Utama SMP Al-Hikam',
      deskripsi: 'Menjuarai piala Bupati dengan rekor tak terkalahkan sepanjang babak penyisihan.'
    }
  ],
  
  fasilitasList: [
    {
      id: 'f1',
      nama: 'Laboratorium Komputer & Multimedia',
      deskripsi: 'Dilengkapi 40 unit PC modern high-speed internet untuk pembelajaran koding, ANBK, dan desain multimedia.',
      iconName: 'Laptop'
    },
    {
      id: 'f2',
      nama: 'Perpustakaan Digital & Corner Read',
      deskripsi: 'Koleksi ribuan buku fisik, e-book interaktif, serta ruang baca ber-AC yang nyaman.',
      iconName: 'BookOpen'
    },
    {
      id: 'f3',
      nama: 'Smart Classroom & Proyektor Interactive',
      deskripsi: 'Ruang kelas multimedia terkoneksi Wi-Fi fiber optic untuk metode belajar blended learning.',
      iconName: 'Building'
    },
    {
      id: 'f4',
      nama: 'Masjid Utama & Gedung Tahfidz',
      deskripsi: 'Sarana ibadah yang luas dan tenang untuk salat berjamaah, pembinaan karakter, dan setoran hafalan.',
      iconName: 'Sparkles'
    },
    {
      id: 'f5',
      nama: 'Lapangan Olahraga Serbaguna',
      deskripsi: 'Lapangan basket, futsal, dan bulutangkis bertaraf standar dengan pencahayaan malam.',
      iconName: 'Trophy'
    },
    {
      id: 'f6',
      nama: 'Kantin Sehat & Security 24 Jam',
      deskripsi: 'Kantin higienis dengan sistem pembayaran transaksi non-tunai serta pengawasan kamera CCTV.',
      iconName: 'ShieldCheck'
    }
  ],
  
  ekstrakurikulerList: [
    {
      id: 'e1',
      nama: 'Pramuka (Gugus Depan Al-Hikam)',
      pembina: 'Budi Santoso, S.Pd',
      jadwal: 'Setiap Jumat sore (15.00 - 17.00)',
      deskripsi: 'Pembentukan karakter kepemimpinan, kemandirian, kedisiplinan, dan ketangkasan outdoor.'
    },
    {
      id: 'e2',
      nama: 'Koding & Science Club',
      pembina: 'Agus Pratama, S.Kom',
      jadwal: 'Setiap Sabtu pagi (08.00 - 10.00)',
      deskripsi: 'Belajar logika pemrograman, pembuatan web app, eksperimen IPA, dan robotika.'
    },
    {
      id: 'e3',
      nama: 'Tahfidz Al-Qur\'an & Hadits',
      pembina: 'Ahmad Dahlan, S.Ag',
      jadwal: 'Senin - Kamis (06.15 - 07.00)',
      deskripsi: 'Bimbingan intensif hafalan Al-Qur\'an, tajwid, serta pemahaman maknawiyah.'
    },
    {
      id: 'e4',
      nama: 'Futsal & Olahraga Prestasi',
      pembina: 'Rahmat Hidayat, S.Pd',
      jadwal: 'Setiap Selasa & Kamis sore',
      deskripsi: 'Latihan taktik bola, kebugaran, serta persiapan kejuaraan antarsekolah.'
    }
  ],
  
  heroBannerUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=1200',
  facebookUrl: 'https://facebook.com',
  instagramUrl: 'https://instagram.com',
  youtubeUrl: 'https://youtube.com'
};
