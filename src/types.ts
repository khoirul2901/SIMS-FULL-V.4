export type Role =
  | 'Admin'
  | 'Kepala Sekolah'
  | 'Guru'
  | 'Wali Kelas'
  | 'BK'
  | 'Tata Usaha'
  | 'Bendahara';

export interface User {
  id: string;
  username: string;
  name: string;
  role: Role;
  avatar?: string;
}

export interface MenuItem {
  title: string;
  path: string;
  icon: any; // Lucide icon component
  roles: Role[];
  children?: MenuItem[];
}

export interface DashboardStats {
  totalGuru: number;
  totalSiswa: number;
  totalKelas: number;
  absensiHariIni: number;
  pelanggaranBulanIni: number;
  jumlahArsip: number;
  jumlahSurat: number;
}
