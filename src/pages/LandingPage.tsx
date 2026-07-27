import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDatabase } from '../context/DatabaseContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  Building2, 
  Trophy, 
  Sparkles, 
  ArrowRight, 
  LogIn, 
  Phone, 
  Mail, 
  MapPin, 
  CheckCircle2, 
  Calendar, 
  Tag, 
  ChevronRight, 
  Laptop, 
  Building, 
  ShieldCheck, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  Award, 
  ExternalLink,
  MessageSquareQuote,
  Star,
  Activity,
  UserCheck,
  Facebook,
  Instagram,
  Youtube
} from 'lucide-react';
import { BeritaItem } from '../types/landing';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { 
    landingConfig, 
    siswaData, 
    guruData, 
    kelasData, 
    mapelData 
  } = useDatabase();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedBerita, setSelectedBerita] = useState<BeritaItem | null>(null);
  const [activeTabFasilitas, setActiveTabFasilitas] = useState<'all' | 'akademik' | 'non-akademik'>('all');

  // Stats calculation (Live from SIMS database or manually overridden)
  const stats = {
    siswa: landingConfig.statSiswaOverride !== null && landingConfig.statSiswaOverride !== undefined
      ? landingConfig.statSiswaOverride 
      : siswaData.length,
    guru: landingConfig.statGuruOverride !== null && landingConfig.statGuruOverride !== undefined
      ? landingConfig.statGuruOverride 
      : guruData.length,
    kelas: landingConfig.statKelasOverride !== null && landingConfig.statKelasOverride !== undefined
      ? landingConfig.statKelasOverride 
      : kelasData.length,
    mapel: mapelData.length,
    alumni: landingConfig.statAlumni || 1200
  };

  // Helper render facility icon dynamically
  const renderFacilityIcon = (iconName: string) => {
    switch (iconName) {
      case 'Laptop': return <Laptop className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />;
      case 'BookOpen': return <BookOpen className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />;
      case 'Building': return <Building className="w-6 h-6 text-blue-600 dark:text-blue-400" />;
      case 'Trophy': return <Trophy className="w-6 h-6 text-amber-600 dark:text-amber-400" />;
      case 'Sparkles': return <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />;
      case 'ShieldCheck': return <ShieldCheck className="w-6 h-6 text-teal-600 dark:text-teal-400" />;
      default: return <Building2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-300">
      
      {/* 1. PUBLIC NAVBAR */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo & School Name */}
          <Link to="/" className="flex items-center gap-3.5 group">
            <div className="w-11 h-11 bg-gradient-to-tr from-indigo-600 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {landingConfig.namaSekolah}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-extrabold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-md border border-indigo-200 dark:border-indigo-800">
                  Akreditasi {landingConfig.akreditasi}
                </span>
              </div>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                NPSN: {landingConfig.npsn} • Berkarakter & Unggul
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-bold text-slate-600 dark:text-slate-300">
            <a href="#profil" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Profil</a>
            <a href="#statistik" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Statistik</a>
            <a href="#fasilitas" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Fasilitas</a>
            <a href="#berita" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Berita</a>
            <a href="#prestasi" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Prestasi</a>
            <a href="#ekskul" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Ekstrakurikuler</a>
            <a href="#kontak" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Kontak</a>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              title="Ganti Mode Gelap/Terang"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>

            {isAuthenticated ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02]"
              >
                <UserCheck className="w-4 h-4" />
                <span>Buka Dashboard ({user?.name.split(' ')[0]})</span>
              </button>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02]"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk SIMS</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Nav */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
              <a href="#profil" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">Profil Sekolah</a>
              <a href="#statistik" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">Statistik Data</a>
              <a href="#fasilitas" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">Fasilitas</a>
              <a href="#berita" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">Berita & Pengumuman</a>
              <a href="#prestasi" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">Prestasi</a>
              <a href="#ekskul" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">Ekstrakurikuler</a>
              <a href="#kontak" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">Kontak</a>
            </nav>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              {isAuthenticated ? (
                <button
                  onClick={() => { setMobileMenuOpen(false); navigate('/dashboard'); }}
                  className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Buka Dashboard SIMS</span>
                </button>
              ) : (
                <button
                  onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}
                  className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Masuk Portal SIMS</span>
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden py-16 md:py-24 bg-gradient-to-b from-indigo-50/50 via-slate-50 to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-950">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column Text */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100/80 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-200 dark:border-indigo-800/60">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Selamat Datang di Official Website {landingConfig.namaSekolah}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white leading-[1.15] tracking-tight">
                {landingConfig.tagline}
              </h1>

              <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base leading-relaxed max-w-2xl mx-auto lg:mx-0">
                {landingConfig.subTagline}
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
                  className="px-7 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-sm flex items-center gap-2.5 shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
                >
                  <span>{isAuthenticated ? 'Buka Dashboard SIMS' : 'Masuk Portal SIMS'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <a
                  href="#profil"
                  className="px-7 py-3.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold rounded-2xl text-sm border border-slate-200 dark:border-slate-700 transition-all shadow-sm"
                >
                  Jelajahi Profil
                </a>
              </div>

              {/* Quick Info Badges */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap justify-center lg:justify-start items-center gap-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Kurikulum Merdeka Belajar</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Pembinaan Tahfidz & Karakter</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Digital Smart Campus</span>
                </div>
              </div>
            </div>

            {/* Right Column Image Banner */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-3xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                <div className="relative bg-white dark:bg-slate-900 p-2.5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
                  <img 
                    src={landingConfig.heroBannerUrl} 
                    alt="Gedung Sekolah" 
                    className="w-full h-80 sm:h-96 object-cover rounded-2xl"
                  />
                  <div className="absolute bottom-6 left-6 right-6 p-4 bg-slate-900/80 backdrop-blur-md text-white rounded-2xl border border-white/10 shadow-lg">
                    <p className="text-xs font-bold flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-indigo-400" />
                      <span>{landingConfig.namaSekolah}</span>
                    </p>
                    <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-1">
                      {landingConfig.alamat}
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. LIVE STATS SECTION (Representasi Real Data SIMS) */}
      {landingConfig.showStatsBar && (
        <section id="statistik" className="py-12 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                Aplikasi SIMS Terintegrasi
              </span>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                Data Real-Time Sekolah Kami
              </h2>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              
              {/* Stat Card 1: Siswa */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-center hover:shadow-md transition-all">
                <div className="w-10 h-10 mx-auto mb-3 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">{stats.siswa}</h3>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">Siswa Aktif</p>
              </div>

              {/* Stat Card 2: Guru */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-center hover:shadow-md transition-all">
                <div className="w-10 h-10 mx-auto mb-3 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center font-bold">
                  <UserCheck className="w-5 h-5" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">{stats.guru}</h3>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">Guru & Tenaga Pendidik</p>
              </div>

              {/* Stat Card 3: Rombel / Kelas */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-center hover:shadow-md transition-all">
                <div className="w-10 h-10 mx-auto mb-3 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">{stats.kelas}</h3>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">Rombongan Belajar</p>
              </div>

              {/* Stat Card 4: Mata Pelajaran */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-center hover:shadow-md transition-all">
                <div className="w-10 h-10 mx-auto mb-3 bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center font-bold">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">{stats.mapel}</h3>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">Mata Pelajaran</p>
              </div>

              {/* Stat Card 5: Alumni */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-center col-span-2 lg:col-span-1 hover:shadow-md transition-all">
                <div className="w-10 h-10 mx-auto mb-3 bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center font-bold">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">{stats.alumni}+</h3>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">Alumni Tersebar</p>
              </div>

            </div>
          </div>
        </section>
      )}

      {/* 4. SAMBUTAN KEPALA SEKOLAH & PROFIL */}
      <section id="profil" className="py-20 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Foto Kepala Sekolah */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-sm">
                <div className="absolute -inset-2 bg-gradient-to-tr from-indigo-600 to-indigo-400 rounded-3xl blur-lg opacity-30"></div>
                <div className="relative bg-white dark:bg-slate-900 p-3 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
                  <img 
                    src={landingConfig.fotoKepalaSekolah} 
                    alt={landingConfig.namaKepalaSekolah}
                    className="w-full h-80 object-cover rounded-2xl" 
                  />
                  <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base">{landingConfig.namaKepalaSekolah}</h3>
                    <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{landingConfig.gelarKepalaSekolah}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Teks Sambutan & Visi Misi */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
                <MessageSquareQuote className="w-4 h-4" />
                <span>Sambutan Kepala Sekolah</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Mendidik dengan Hati, Membentuk Generasi Berilmu & Berakhlak Mulia
              </h2>

              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed italic border-l-4 border-indigo-600 pl-4 py-1">
                "{landingConfig.sambutanKepalaSekolah}"
              </p>

              {/* Visi & Misi Box */}
              <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                  <h4 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Visi Sekolah
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {landingConfig.visi}
                  </p>
                </div>

                <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                  <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Misi Utama
                  </h4>
                  <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5 list-disc pl-4 font-medium">
                    {landingConfig.misi.slice(0, 3).map((m, idx) => (
                      <li key={idx}>{m}</li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 5. FASILITAS UNGGULAN */}
      <section id="fasilitas" className="py-20 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              Sarana & Prasarana
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Fasilitas Pembelajaran Modern
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Dukungan infrastruktur lengkap untuk menunjang potensi akademik dan non-akademik peserta didik.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {landingConfig.fasilitasList.map((fasilitas) => (
              <div 
                key={fasilitas.id} 
                className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 hover:shadow-lg transition-all hover:-translate-y-1 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {renderFacilityIcon(fasilitas.iconName)}
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">
                  {fasilitas.nama}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {fasilitas.deskripsi}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. BERITA & PENGUMUMAN TERBARU */}
      <section id="berita" className="py-20 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                Informasi Terkini
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                Berita & Pengumuman Sekolah
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
              Update kegiatan harian, agenda pengumuman resmi, serta kabar prestasi sekolah.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {landingConfig.beritaList.map((berita) => (
              <div 
                key={berita.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-all"
              >
                {berita.gambarUrl && (
                  <img 
                    src={berita.gambarUrl} 
                    alt={berita.judul} 
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="px-2.5 py-0.5 rounded-md font-extrabold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                        {berita.kategori}
                      </span>
                      <span className="text-slate-400 font-medium flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {berita.tanggal}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-2 hover:text-indigo-600 transition-colors">
                      {berita.judul}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                      {berita.ringkasan}
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedBerita(berita)}
                    className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1"
                  >
                    <span>Baca Selengkapnya</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. PRESTASI & EKSTRAKURIKULER */}
      <section id="prestasi" className="py-20 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          {/* Prestasi */}
          <div>
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                Ajang Kebanggaan
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                Prestasi Terbaru Siswa & Guru
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {landingConfig.prestasiList.map((p) => (
                <div key={p.id} className="p-6 bg-gradient-to-b from-amber-50/50 to-white dark:from-slate-800/40 dark:to-slate-900 rounded-2xl border border-amber-200/80 dark:border-slate-700 shadow-sm relative overflow-hidden">
                  <div className="absolute top-3 right-3 p-2 bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 rounded-xl">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 text-[10px] font-extrabold bg-amber-200/80 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200 rounded">
                    Tingkat {p.tingkat} • {p.tahun}
                  </span>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base mt-2">{p.judul}</h3>
                  <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-1">Oleh: {p.pemenang}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">{p.deskripsi}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Ekstrakurikuler */}
          <div id="ekskul" className="pt-10 border-t border-slate-100 dark:border-slate-800">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                Pengembangan Bakat
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                Ekstrakurikuler Unggulan
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {landingConfig.ekstrakurikulerList.map((e) => (
                <div key={e.id} className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 hover:border-indigo-300 transition-all">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">{e.nama}</h4>
                  <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold mt-1">Pembina: {e.pembina}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">🗓 {e.jadwal}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2.5 line-clamp-2">{e.deskripsi}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 8. KONTAK & LOKASI */}
      <section id="kontak" className="py-20 bg-slate-900 text-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Contact Info */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-400">
                  Hubungi Kami
                </span>
                <h2 className="text-3xl font-extrabold text-white mt-1">
                  Pusat Informasi & Sekretariat
                </h2>
                <p className="text-xs text-slate-400 mt-2">
                  Siap memberikan pelayanan terbaik untuk konsultasi pendaftaran siswa baru maupun informasi akademik.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3.5 p-4 bg-slate-800/80 rounded-2xl border border-slate-700/60">
                  <MapPin className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white text-sm">Alamat Lengkap</h4>
                    <p className="text-slate-300 mt-0.5">{landingConfig.alamat}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-4 bg-slate-800/80 rounded-2xl border border-slate-700/60">
                  <Phone className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white text-sm">Telepon & WhatsApp</h4>
                    <p className="text-slate-300 mt-0.5">{landingConfig.telepon}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-4 bg-slate-800/80 rounded-2xl border border-slate-700/60">
                  <Mail className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white text-sm">Email Resmi</h4>
                    <p className="text-slate-300 mt-0.5">{landingConfig.email}</p>
                  </div>
                </div>
              </div>

              {/* Social Media Buttons */}
              <div className="flex items-center gap-3 pt-2">
                {landingConfig.facebookUrl && (
                  <a href={landingConfig.facebookUrl} target="_blank" rel="noreferrer" className="p-3 bg-slate-800 hover:bg-indigo-600 rounded-xl text-slate-300 hover:text-white transition-colors">
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
                {landingConfig.instagramUrl && (
                  <a href={landingConfig.instagramUrl} target="_blank" rel="noreferrer" className="p-3 bg-slate-800 hover:bg-pink-600 rounded-xl text-slate-300 hover:text-white transition-colors">
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {landingConfig.youtubeUrl && (
                  <a href={landingConfig.youtubeUrl} target="_blank" rel="noreferrer" className="p-3 bg-slate-800 hover:bg-red-600 rounded-xl text-slate-300 hover:text-white transition-colors">
                    <Youtube className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>

            {/* Right Quick Portal Card */}
            <div className="lg:col-span-6 bg-gradient-to-br from-indigo-900/90 to-slate-800/90 p-8 rounded-3xl border border-indigo-500/30 shadow-2xl text-center space-y-6">
              <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/40">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>

              <div>
                <h3 className="text-2xl font-black text-white">Sistem Informasi Manajemen Sekolah (SIMS)</h3>
                <p className="text-xs text-indigo-200 mt-2 max-w-md mx-auto">
                  Akses modul data guru, absensi QR code, nilai siswa, e-pelanggaran, jadwal pelajaran, keuangan & e-surat dalam satu aplikasi terpadu.
                </p>
              </div>

              {isAuthenticated ? (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full py-4 bg-white hover:bg-slate-100 text-indigo-950 font-extrabold rounded-2xl text-sm shadow-xl transition-all"
                >
                  Ke Dashboard Aplikasi SIMS
                </button>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-2xl text-sm shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <LogIn className="w-5 h-5" />
                  <span>Login Pengguna SIMS</span>
                </button>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* 9. PUBLIC FOOTER */}
      <footer className="py-8 bg-slate-950 text-slate-400 text-xs border-t border-slate-800 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} {landingConfig.namaSekolah}. Hak Cipta Dilindungi Undang-Undang.</p>
          <div className="flex items-center gap-4 text-slate-500 font-semibold">
            <span>NPSN: {landingConfig.npsn}</span>
            <span>•</span>
            <span>SIMS Modern App</span>
          </div>
        </div>
      </footer>

      {/* MODAL BERITA PREVIEW */}
      {selectedBerita && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-6 space-y-4 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setSelectedBerita(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            {selectedBerita.gambarUrl && (
              <img src={selectedBerita.gambarUrl} alt={selectedBerita.judul} className="w-full h-60 object-cover rounded-2xl" />
            )}

            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-0.5 rounded font-bold bg-indigo-100 text-indigo-700">
                {selectedBerita.kategori}
              </span>
              <span className="text-slate-400 font-medium">🗓 {selectedBerita.tanggal}</span>
              {selectedBerita.penulis && <span className="text-slate-500 font-semibold">• oleh {selectedBerita.penulis}</span>}
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-snug">{selectedBerita.judul}</h3>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {selectedBerita.ringkasan}
            </p>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedBerita(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
