import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { 
  Globe, 
  Save, 
  Plus, 
  Trash2, 
  Edit3, 
  Image, 
  CheckCircle2, 
  PlusCircle, 
  Building2, 
  Trophy, 
  BookOpen, 
  Eye, 
  Info,
  Sparkles,
  Award,
  Layers,
  Phone,
  Mail,
  MapPin,
  X
} from 'lucide-react';
import Swal from 'sweetalert2';
import { LandingConfig, BeritaItem, PrestasiItem, FasilitasItem, EkstrakurikulerItem } from '../types/landing';

export const PengaturanLandingPage: React.FC = () => {
  const { landingConfig, setLandingConfig, siswaData, guruData, kelasData } = useDatabase();
  const [activeTab, setActiveTab] = useState<'profil' | 'sambutan' | 'stats' | 'fasilitas' | 'berita' | 'prestasi'>('profil');

  const [formData, setFormData] = useState<LandingConfig>(landingConfig);

  // Modals for array management
  const [modalFasilitas, setModalFasilitas] = useState<{ open: boolean; data?: FasilitasItem | null }>({ open: false });
  const [modalBerita, setModalBerita] = useState<{ open: boolean; data?: BeritaItem | null }>({ open: false });
  const [modalPrestasi, setModalPrestasi] = useState<{ open: boolean; data?: PrestasiItem | null }>({ open: false });
  const [modalEkskul, setModalEkskul] = useState<{ open: boolean; data?: EkstrakurikulerItem | null }>({ open: false });

  // Misi Input helper
  const [newMisiText, setNewMisiText] = useState('');

  // Handle Save
  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    setLandingConfig(formData);
    Swal.fire({
      icon: 'success',
      title: 'Pengaturan Landing Page Disimpan!',
      text: 'Halaman website utama sekolah telah diperbarui.',
      timer: 1800,
      showConfirmButton: false
    });
  };

  // Misi handlers
  const handleAddMisi = () => {
    if (!newMisiText.trim()) return;
    setFormData({ ...formData, misi: [...formData.misi, newMisiText.trim()] });
    setNewMisiText('');
  };

  const handleRemoveMisi = (index: number) => {
    const updated = formData.misi.filter((_, i) => i !== index);
    setFormData({ ...formData, misi: updated });
  };

  // Fasilitas CRUD
  const handleSaveFasilitas = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const nama = (form.elements.namedItem('nama') as HTMLInputElement).value;
    const deskripsi = (form.elements.namedItem('deskripsi') as HTMLTextAreaElement).value;
    const iconName = (form.elements.namedItem('iconName') as HTMLSelectElement).value;

    const list = [...formData.fasilitasList];
    if (modalFasilitas.data) {
      const idx = list.findIndex(f => f.id === modalFasilitas.data!.id);
      if (idx >= 0) list[idx] = { id: modalFasilitas.data.id, nama, deskripsi, iconName };
    } else {
      list.push({ id: `f_${Date.now()}`, nama, deskripsi, iconName });
    }

    setFormData({ ...formData, fasilitasList: list });
    setModalFasilitas({ open: false });
  };

  const handleDeleteFasilitas = (id: string) => {
    setFormData({ ...formData, fasilitasList: formData.fasilitasList.filter(f => f.id !== id) });
  };

  // Berita CRUD
  const handleSaveBerita = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const judul = (form.elements.namedItem('judul') as HTMLInputElement).value;
    const tanggal = (form.elements.namedItem('tanggal') as HTMLInputElement).value;
    const kategori = (form.elements.namedItem('kategori') as HTMLInputElement).value;
    const ringkasan = (form.elements.namedItem('ringkasan') as HTMLTextAreaElement).value;
    const gambarUrl = (form.elements.namedItem('gambarUrl') as HTMLInputElement).value;
    const penulis = (form.elements.namedItem('penulis') as HTMLInputElement).value;

    const list = [...formData.beritaList];
    if (modalBerita.data) {
      const idx = list.findIndex(b => b.id === modalBerita.data!.id);
      if (idx >= 0) list[idx] = { id: modalBerita.data.id, judul, tanggal, kategori, ringkasan, gambarUrl, penulis };
    } else {
      list.unshift({ id: `b_${Date.now()}`, judul, tanggal, kategori, ringkasan, gambarUrl, penulis });
    }

    setFormData({ ...formData, beritaList: list });
    setModalBerita({ open: false });
  };

  const handleDeleteBerita = (id: string) => {
    setFormData({ ...formData, beritaList: formData.beritaList.filter(b => b.id !== id) });
  };

  // Prestasi CRUD
  const handleSavePrestasi = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const judul = (form.elements.namedItem('judul') as HTMLInputElement).value;
    const tingkat = (form.elements.namedItem('tingkat') as HTMLInputElement).value;
    const tahun = (form.elements.namedItem('tahun') as HTMLInputElement).value;
    const pemenang = (form.elements.namedItem('pemenang') as HTMLInputElement).value;
    const deskripsi = (form.elements.namedItem('deskripsi') as HTMLTextAreaElement).value;

    const list = [...formData.prestasiList];
    if (modalPrestasi.data) {
      const idx = list.findIndex(p => p.id === modalPrestasi.data!.id);
      if (idx >= 0) list[idx] = { id: modalPrestasi.data.id, judul, tingkat, tahun, pemenang, deskripsi };
    } else {
      list.unshift({ id: `p_${Date.now()}`, judul, tingkat, tahun, pemenang, deskripsi });
    }

    setFormData({ ...formData, prestasiList: list });
    setModalPrestasi({ open: false });
  };

  const handleDeletePrestasi = (id: string) => {
    setFormData({ ...formData, prestasiList: formData.prestasiList.filter(p => p.id !== id) });
  };

  // Ekskul CRUD
  const handleSaveEkskul = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const nama = (form.elements.namedItem('nama') as HTMLInputElement).value;
    const pembina = (form.elements.namedItem('pembina') as HTMLInputElement).value;
    const jadwal = (form.elements.namedItem('jadwal') as HTMLInputElement).value;
    const deskripsi = (form.elements.namedItem('deskripsi') as HTMLTextAreaElement).value;

    const list = [...formData.ekstrakurikulerList];
    if (modalEkskul.data) {
      const idx = list.findIndex(e => e.id === modalEkskul.data!.id);
      if (idx >= 0) list[idx] = { id: modalEkskul.data.id, nama, pembina, jadwal, deskripsi };
    } else {
      list.push({ id: `e_${Date.now()}`, nama, pembina, jadwal, deskripsi });
    }

    setFormData({ ...formData, ekstrakurikulerList: list });
    setModalEkskul({ open: false });
  };

  const handleDeleteEkskul = (id: string) => {
    setFormData({ ...formData, ekstrakurikulerList: formData.ekstrakurikulerList.filter(e => e.id !== id) });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-2xl">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Pengaturan Landing Page & Website</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Kelola tampilan website utama sekolah, profil, fasilitas, berita, prestasi, dan representasi data real SIMS.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-xs flex items-center gap-2 transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>Pratinjau Landing Page</span>
          </a>

          <button
            onClick={handleSaveAll}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('profil')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'profil' 
              ? 'bg-indigo-600 text-white shadow-sm' 
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          1. Profil & Identitas Hero
        </button>

        <button
          onClick={() => setActiveTab('sambutan')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'sambutan' 
              ? 'bg-indigo-600 text-white shadow-sm' 
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          2. Sambutan & Visi Misi
        </button>

        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'stats' 
              ? 'bg-indigo-600 text-white shadow-sm' 
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          3. Statistik Data Real SIMS
        </button>

        <button
          onClick={() => setActiveTab('fasilitas')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'fasilitas' 
              ? 'bg-indigo-600 text-white shadow-sm' 
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          4. Fasilitas ({formData.fasilitasList.length})
        </button>

        <button
          onClick={() => setActiveTab('berita')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'berita' 
              ? 'bg-indigo-600 text-white shadow-sm' 
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          5. Berita ({formData.beritaList.length})
        </button>

        <button
          onClick={() => setActiveTab('prestasi')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'prestasi' 
              ? 'bg-indigo-600 text-white shadow-sm' 
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          6. Prestasi & Ekskul
        </button>
      </div>

      {/* TAB CONTENT 1: PROFIL & HERO */}
      {activeTab === 'profil' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <h3 className="font-bold text-slate-800 dark:text-white text-base pb-3 border-b border-slate-100 dark:border-slate-800">
            Identitas Sekolah & Banner Utama (Hero)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Nama Sekolah</label>
              <input 
                type="text" 
                value={formData.namaSekolah}
                onChange={(e) => setFormData({ ...formData, namaSekolah: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Akreditasi</label>
              <input 
                type="text" 
                value={formData.akreditasi}
                onChange={(e) => setFormData({ ...formData, akreditasi: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">NPSN</label>
              <input 
                type="text" 
                value={formData.npsn}
                onChange={(e) => setFormData({ ...formData, npsn: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Tahun Berdiri</label>
              <input 
                type="text" 
                value={formData.tahunBerdiri}
                onChange={(e) => setFormData({ ...formData, tahunBerdiri: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white font-medium"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Tagline Utama (Judul Besar Landing Page)</label>
              <input 
                type="text" 
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white font-medium"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Deskripsi Subtagline</label>
              <textarea 
                rows={2}
                value={formData.subTagline}
                onChange={(e) => setFormData({ ...formData, subTagline: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white font-medium"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">URL Foto Banner Utama (Hero Banner)</label>
              <input 
                type="text" 
                value={formData.heroBannerUrl}
                onChange={(e) => setFormData({ ...formData, heroBannerUrl: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white font-medium"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Alamat Sekolah</label>
              <input 
                type="text" 
                value={formData.alamat}
                onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Telepon / WhatsApp</label>
              <input 
                type="text" 
                value={formData.telepon}
                onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Email Resmi</label>
              <input 
                type="text" 
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white font-medium"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: SAMBUTAN & VISI MISI */}
      {activeTab === 'sambutan' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <h3 className="font-bold text-slate-800 dark:text-white text-base pb-3 border-b border-slate-100 dark:border-slate-800">
            Sambutan Kepala Sekolah & Visi Misi
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Nama Kepala Sekolah</label>
              <input 
                type="text" 
                value={formData.namaKepalaSekolah}
                onChange={(e) => setFormData({ ...formData, namaKepalaSekolah: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Gelar / Jabatan</label>
              <input 
                type="text" 
                value={formData.gelarKepalaSekolah}
                onChange={(e) => setFormData({ ...formData, gelarKepalaSekolah: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white font-medium"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">URL Foto Kepala Sekolah</label>
              <input 
                type="text" 
                value={formData.fotoKepalaSekolah}
                onChange={(e) => setFormData({ ...formData, fotoKepalaSekolah: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white font-medium"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Teks Sambutan Kepala Sekolah</label>
              <textarea 
                rows={4}
                value={formData.sambutanKepalaSekolah}
                onChange={(e) => setFormData({ ...formData, sambutanKepalaSekolah: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white font-medium"
              />
            </div>

            <div className="md:col-span-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-xs font-bold text-slate-800 dark:text-white mb-1">Teks Visi Sekolah</label>
              <textarea 
                rows={2}
                value={formData.visi}
                onChange={(e) => setFormData({ ...formData, visi: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white font-medium"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="block text-xs font-bold text-slate-800 dark:text-white">Daftar Misi Sekolah</label>
              
              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder="Ketik butir misi baru..."
                  value={newMisiText}
                  onChange={(e) => setNewMisiText(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleAddMisi}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Misi</span>
                </button>
              </div>

              <div className="space-y-1.5 pt-2">
                {formData.misi.map((m, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-200">{idx + 1}. {m}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMisi(idx)}
                      className="p-1 text-rose-500 hover:text-rose-700 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB CONTENT 3: STATISTIK */}
      {activeTab === 'stats' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white text-base">Representasi Live Data Real SIMS</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Nilai statistik di landing page diambil langsung dari database SIMS secara otomatis.
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200">Tampilkan Bar Statistik:</label>
              <input 
                type="checkbox"
                checked={formData.showStatsBar}
                onChange={(e) => setFormData({ ...formData, showStatsBar: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="text-xs font-bold text-slate-400">Total Siswa Live</span>
              <h4 className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{siswaData.length} Siswa</h4>
              <label className="block text-[11px] font-medium text-slate-500">Override manual jika perlu:</label>
              <input 
                type="number"
                placeholder="Kosongkan untuk panggil live"
                value={formData.statSiswaOverride ?? ''}
                onChange={(e) => setFormData({ ...formData, statSiswaOverride: e.target.value ? parseInt(e.target.value) : null })}
                className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
              />
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="text-xs font-bold text-slate-400">Total Guru Live</span>
              <h4 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{guruData.length} Guru</h4>
              <label className="block text-[11px] font-medium text-slate-500">Override manual jika perlu:</label>
              <input 
                type="number"
                placeholder="Kosongkan untuk panggil live"
                value={formData.statGuruOverride ?? ''}
                onChange={(e) => setFormData({ ...formData, statGuruOverride: e.target.value ? parseInt(e.target.value) : null })}
                className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
              />
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="text-xs font-bold text-slate-400">Rombel / Kelas Live</span>
              <h4 className="text-2xl font-black text-blue-600 dark:text-blue-400">{kelasData.length} Kelas</h4>
              <label className="block text-[11px] font-medium text-slate-500">Override manual jika perlu:</label>
              <input 
                type="number"
                placeholder="Kosongkan untuk panggil live"
                value={formData.statKelasOverride ?? ''}
                onChange={(e) => setFormData({ ...formData, statKelasOverride: e.target.value ? parseInt(e.target.value) : null })}
                className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
              />
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="text-xs font-bold text-slate-400">Total Alumni</span>
              <h4 className="text-2xl font-black text-purple-600 dark:text-purple-400">{formData.statAlumni}+ Alumni</h4>
              <label className="block text-[11px] font-medium text-slate-500">Angka Alumni:</label>
              <input 
                type="number"
                value={formData.statAlumni || 1200}
                onChange={(e) => setFormData({ ...formData, statAlumni: parseInt(e.target.value) || 0 })}
                className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: FASILITAS */}
      {activeTab === 'fasilitas' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white text-base">Kelola Fasilitas Sekolah</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Daftar sarana prasarana yang ditampilkan di landing page.</p>
            </div>

            <button
              onClick={() => setModalFasilitas({ open: true, data: null })}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Fasilitas</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {formData.fasilitasList.map((item) => (
              <div key={item.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 relative group space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-extrabold rounded">
                    Icon: {item.iconName}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setModalFasilitas({ open: true, data: item })}
                      className="p-1 text-indigo-600 hover:text-indigo-800"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteFasilitas(item.id)}
                      className="p-1 text-rose-500 hover:text-rose-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h4 className="font-bold text-slate-800 dark:text-white text-sm">{item.nama}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{item.deskripsi}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 5: BERITA */}
      {activeTab === 'berita' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white text-base">Kelola Berita & Pengumuman</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Posting agenda, berita kegiatan, dan pengumuman sekolah.</p>
            </div>

            <button
              onClick={() => setModalBerita({ open: true, data: null })}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Berita Baru</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {formData.beritaList.map((berita) => (
              <div key={berita.id} className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  {berita.gambarUrl && (
                    <img src={berita.gambarUrl} alt={berita.judul} className="w-16 h-16 object-cover rounded-xl shrink-0" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded">{berita.kategori}</span>
                      <span className="text-[11px] text-slate-400">🗓 {berita.tanggal}</span>
                    </div>
                    <h4 className="font-bold text-slate-800 dark:text-white text-sm mt-1">{berita.judul}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{berita.ringkasan}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setModalBerita({ open: true, data: berita })}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteBerita(berita.id)}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-semibold"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 6: PRESTASI & EKSKUL */}
      {activeTab === 'prestasi' && (
        <div className="space-y-6">
          {/* Prestasi Box */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-800 dark:text-white text-base">Daftar Prestasi Siswa & Guru</h3>
              <button
                onClick={() => setModalPrestasi({ open: true, data: null })}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Prestasi</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.prestasiList.map((p) => (
                <div key={p.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-extrabold rounded">
                      Tingkat {p.tingkat} • {p.tahun}
                    </span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setModalPrestasi({ open: true, data: p })} className="p-1 text-indigo-600"><Edit3 className="w-4 h-4" /></button>
                      <button onClick={() => handleDeletePrestasi(p.id)} className="p-1 text-rose-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <h4 className="font-bold text-slate-800 dark:text-white text-sm">{p.judul}</h4>
                  <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Pemenang: {p.pemenang}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{p.deskripsi}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Ekskul Box */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-800 dark:text-white text-base">Daftar Ekstrakurikuler</h3>
              <button
                onClick={() => setModalEkskul({ open: true, data: null })}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Ekstrakurikuler</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.ekstrakurikulerList.map((e) => (
                <div key={e.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-600">🗓 {e.jadwal}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setModalEkskul({ open: true, data: e })} className="p-1 text-indigo-600"><Edit3 className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteEkskul(e.id)} className="p-1 text-rose-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <h4 className="font-bold text-slate-800 dark:text-white text-sm">{e.nama}</h4>
                  <p className="text-xs text-slate-500">Pembina: {e.pembina}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{e.deskripsi}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL FASILITAS */}
      {modalFasilitas.open && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-slate-800 dark:text-white text-base">
              {modalFasilitas.data ? 'Edit Fasilitas' : 'Tambah Fasilitas Baru'}
            </h3>
            <form onSubmit={handleSaveFasilitas} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Nama Fasilitas</label>
                <input name="nama" defaultValue={modalFasilitas.data?.nama || ''} required className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Pilih Icon</label>
                <select name="iconName" defaultValue={modalFasilitas.data?.iconName || 'Laptop'} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs">
                  <option value="Laptop">Laptop / Komputer</option>
                  <option value="BookOpen">BookOpen / Perpustakaan</option>
                  <option value="Building">Building / Gedung Kelas</option>
                  <option value="Trophy">Trophy / Olahraga</option>
                  <option value="Sparkles">Sparkles / Masjid</option>
                  <option value="ShieldCheck">ShieldCheck / Kantin & Security</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Deskripsi Singkat</label>
                <textarea name="deskripsi" defaultValue={modalFasilitas.data?.deskripsi || ''} rows={3} required className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs" />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setModalFasilitas({ open: false })} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold">Batal</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL BERITA */}
      {modalBerita.open && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-slate-800 dark:text-white text-base">
              {modalBerita.data ? 'Edit Berita / Pengumuman' : 'Tambah Berita / Pengumuman'}
            </h3>
            <form onSubmit={handleSaveBerita} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Judul Artikel</label>
                <input name="judul" defaultValue={modalBerita.data?.judul || ''} required className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Tanggal</label>
                  <input type="date" name="tanggal" defaultValue={modalBerita.data?.tanggal || new Date().toISOString().split('T')[0]} required className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Kategori</label>
                  <input name="kategori" defaultValue={modalBerita.data?.kategori || 'Pengumuman'} required className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs" placeholder="Pengumuman, Prestasi, Kegiatan..." />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Penulis / Sumber</label>
                <input name="penulis" defaultValue={modalBerita.data?.penulis || 'Humas Sekolah'} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">URL Gambar Cover</label>
                <input name="gambarUrl" defaultValue={modalBerita.data?.gambarUrl || ''} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs" placeholder="https://..." />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Ringkasan / Isi Berita</label>
                <textarea name="ringkasan" defaultValue={modalBerita.data?.ringkasan || ''} rows={4} required className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs" />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setModalBerita({ open: false })} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold">Batal</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold">Simpan Berita</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PRESTASI */}
      {modalPrestasi.open && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-slate-800 dark:text-white text-base">
              {modalPrestasi.data ? 'Edit Prestasi' : 'Tambah Prestasi Baru'}
            </h3>
            <form onSubmit={handleSavePrestasi} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Judul Kejuaraan</label>
                <input name="judul" defaultValue={modalPrestasi.data?.judul || ''} required className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Tingkat</label>
                  <input name="tingkat" defaultValue={modalPrestasi.data?.tingkat || 'Nasional'} required className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Tahun</label>
                  <input name="tahun" defaultValue={modalPrestasi.data?.tahun || '2026'} required className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Nama Pemenang / Tim</label>
                <input name="pemenang" defaultValue={modalPrestasi.data?.pemenang || ''} required className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Deskripsi Singkat</label>
                <textarea name="deskripsi" defaultValue={modalPrestasi.data?.deskripsi || ''} rows={3} required className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs" />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setModalPrestasi({ open: false })} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold">Batal</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EKSKUL */}
      {modalEkskul.open && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-slate-800 dark:text-white text-base">
              {modalEkskul.data ? 'Edit Ekstrakurikuler' : 'Tambah Ekstrakurikuler'}
            </h3>
            <form onSubmit={handleSaveEkskul} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Nama Ekskul</label>
                <input name="nama" defaultValue={modalEkskul.data?.nama || ''} required className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Pembina</label>
                <input name="pembina" defaultValue={modalEkskul.data?.pembina || ''} required className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Jadwal Latihan</label>
                <input name="jadwal" defaultValue={modalEkskul.data?.jadwal || ''} required className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Deskripsi Singkat</label>
                <textarea name="deskripsi" defaultValue={modalEkskul.data?.deskripsi || ''} rows={3} required className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs" />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setModalEkskul({ open: false })} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold">Batal</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
