/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { DatabaseProvider } from './context/DatabaseContext';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { PengaturanLandingPage } from './pages/PengaturanLandingPage';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { MasterGuru } from './pages/MasterGuru';
import { MasterSiswa } from './pages/MasterSiswa';
import { MasterKelas } from './pages/MasterKelas';
import { MasterMapel } from './pages/MasterMapel';
import { AbsensiSiswa } from './pages/AbsensiSiswa';
import { AbsensiGuru } from './pages/AbsensiGuru';
import { Pelanggaran } from './pages/Pelanggaran';
import { BimbinganKonseling } from './pages/BimbinganKonseling';
import { GuruWali } from './pages/GuruWali';
import { JadwalPelajaran } from './pages/JadwalPelajaran';
import { Nilai } from './pages/Nilai';
import { KeuanganDashboard } from './pages/KeuanganDashboard';
import { JenisPembayaran } from './pages/JenisPembayaran';
import { Pembayaran } from './pages/Pembayaran';
import { PengeluaranKas } from './pages/PengeluaranKas';
import { Penggajian } from './pages/Penggajian';
import { LaporanKeuangan } from './pages/LaporanKeuangan';
import { Arsip } from './pages/Arsip';
import { Surat } from './pages/Surat';
import { Laporan } from './pages/Laporan';
import { Pengaturan } from './pages/Pengaturan';

export default function App() {
  return (
    <ThemeProvider>
      <DatabaseProvider>
        <AuthProvider>
          <HashRouter>
            <Routes>
              {/* Public Landing Page */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              
              {/* Protected App Routes */}
              <Route path="/" element={<Layout />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="pengaturan-landing" element={<PengaturanLandingPage />} />
                
                {/* Master Data */}
                <Route path="master/guru" element={<MasterGuru />} />
                <Route path="master/siswa" element={<MasterSiswa />} />
                <Route path="master/kelas" element={<MasterKelas />} />
                <Route path="master/mapel" element={<MasterMapel />} />
                
                {/* Akademik */}
                <Route path="akademik/jadwal-pelajaran" element={<JadwalPelajaran />} />
                <Route path="akademik/absensi-siswa" element={<AbsensiSiswa />} />
                <Route path="akademik/absensi-guru" element={<AbsensiGuru />} />
                <Route path="akademik/nilai" element={<Nilai />} />
                <Route path="akademik/pelanggaran" element={<Pelanggaran />} />
                <Route path="akademik/bimbingan-konseling" element={<BimbinganKonseling />} />
                <Route path="akademik/guru-wali" element={<GuruWali />} />
                
                {/* Keuangan */}
                <Route path="keuangan/dashboard" element={<KeuanganDashboard />} />
                <Route path="keuangan/jenis" element={<JenisPembayaran />} />
                <Route path="keuangan/pembayaran" element={<Pembayaran />} />
                <Route path="keuangan/pengeluaran" element={<PengeluaranKas />} />
                <Route path="keuangan/payroll" element={<Penggajian />} />
                <Route path="keuangan/laporan" element={<LaporanKeuangan />} />
                
                {/* Administrasi */}
                <Route path="admin/arsip" element={<Arsip />} />
                <Route path="admin/surat" element={<Surat />} />
                
                {/* Laporan & Pengaturan */}
                <Route path="laporan" element={<Laporan />} />
                <Route path="pengaturan" element={<Pengaturan />} />
                
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </HashRouter>
        </AuthProvider>
      </DatabaseProvider>
    </ThemeProvider>
  );
}
