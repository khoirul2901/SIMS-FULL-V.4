import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  BookOpen, 
  Calendar,
  CheckSquare,
  AlertTriangle,
  Wallet,
  FileText,
  Mail,
  Archive,
  BarChart3,
  Settings,
  ChevronDown,
  Award,
  HeartHandshake,
  UserCheck,
  Globe,
  ExternalLink,
  Receipt,
  TrendingDown,
  Banknote,
  FileSpreadsheet,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Role, MenuItem } from '../types';
import { cn } from '../lib/utils';

const ALL_ROLES: Role[] = ['Admin', 'Kepala Sekolah', 'Guru', 'Wali Kelas', 'BK', 'Tata Usaha', 'Bendahara'];

const MENU_ITEMS: MenuItem[] = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
    roles: ALL_ROLES,
  },
  {
    title: 'Master Data',
    path: '/master',
    icon: Users,
    roles: ['Admin'],
    children: [
      { title: 'Guru', path: '/master/guru', icon: Users, roles: ['Admin', 'Kepala Sekolah'] },
      { title: 'Siswa', path: '/master/siswa', icon: GraduationCap, roles: ['Admin'] },
      { title: 'Kelas', path: '/master/kelas', icon: BookOpen, roles: ['Admin', 'Kepala Sekolah', 'Wali Kelas'] },
      { title: 'Mata Pelajaran', path: '/master/mapel', icon: BookOpen, roles: ['Admin'] },
    ]
  },
  {
    title: 'Akademik',
    path: '/akademik',
    icon: GraduationCap,
    roles: ['Admin', 'Guru', 'Wali Kelas', 'BK'],
    children: [
      { title: 'Jadwal Pelajaran', path: '/akademik/jadwal-pelajaran', icon: Calendar, roles: ['Admin', 'Kepala Sekolah', 'Guru', 'Wali Kelas', 'BK', 'Tata Usaha'] },
      { title: 'Absensi Guru', path: '/akademik/absensi-guru', icon: CheckSquare, roles: ['Admin', 'Kepala Sekolah'] },
      { title: 'Absensi Siswa', path: '/akademik/absensi-siswa', icon: CheckSquare, roles: ['Admin', 'Guru', 'Wali Kelas', 'BK'] },
      { title: 'Nilai & Rapor', path: '/akademik/nilai', icon: Award, roles: ['Admin', 'Kepala Sekolah', 'Guru', 'Wali Kelas'] },
      { title: 'Pelanggaran', path: '/akademik/pelanggaran', icon: AlertTriangle, roles: ['Admin', 'Guru', 'Wali Kelas', 'BK'] },
      { title: 'Bimbingan Konseling', path: '/akademik/bimbingan-konseling', icon: HeartHandshake, roles: ['Admin', 'Guru', 'Wali Kelas', 'BK'] },
      { title: 'Guru Wali', path: '/akademik/guru-wali', icon: UserCheck, roles: ['Admin', 'Kepala Sekolah', 'Guru', 'Wali Kelas', 'BK'] },
    ]
  },
  {
    title: 'Keuangan',
    path: '/keuangan',
    icon: Wallet,
    roles: ['Admin', 'Kepala Sekolah', 'Bendahara', 'Tata Usaha'],
    children: [
      { title: 'Dashboard Keuangan', path: '/keuangan/dashboard', icon: BarChart3, roles: ['Admin', 'Kepala Sekolah', 'Bendahara', 'Tata Usaha'] },
      { title: 'Jenis & Tarif Tagihan', path: '/keuangan/jenis', icon: Wallet, roles: ['Admin', 'Bendahara'] },
      { title: 'Pembayaran Siswa', path: '/keuangan/pembayaran', icon: Receipt, roles: ['Admin', 'Bendahara', 'Tata Usaha'] },
      { title: 'Pengeluaran Kas', path: '/keuangan/pengeluaran', icon: TrendingDown, roles: ['Admin', 'Bendahara'] },
      { title: 'Penggajian / Payroll', path: '/keuangan/payroll', icon: Banknote, roles: ['Admin', 'Bendahara'] },
      { title: 'Laporan Keuangan', path: '/keuangan/laporan', icon: FileSpreadsheet, roles: ['Admin', 'Kepala Sekolah', 'Bendahara'] },
    ]
  },
  {
    title: 'Administrasi',
    path: '/admin',
    icon: FileText,
    roles: ['Admin', 'Tata Usaha', 'Guru', 'Wali Kelas', 'BK'],
    children: [
      { title: 'Arsip Digital', path: '/admin/arsip', icon: Archive, roles: ALL_ROLES },
      { title: 'Surat Menyurat', path: '/admin/surat', icon: Mail, roles: ['Admin', 'Tata Usaha'] },
    ]
  },
  {
    title: 'Laporan',
    path: '/laporan',
    icon: BarChart3,
    roles: ['Admin', 'Kepala Sekolah', 'BK', 'Tata Usaha', 'Bendahara'],
  },
  {
    title: 'Website Sekolah',
    path: '/pengaturan-landing',
    icon: Globe,
    roles: ['Admin', 'Kepala Sekolah', 'Tata Usaha'],
  },
  {
    title: 'Pengaturan',
    path: '/pengaturan',
    icon: Settings,
    roles: ['Admin'],
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();

  // State for expanded dropdown menus
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    MENU_ITEMS.forEach(item => {
      if (item.children?.some(child => location.pathname === child.path || (child.path !== '/' && location.pathname.startsWith(child.path)))) {
        initial[item.title] = true;
      }
    });
    return initial;
  });

  // Keep parent menu expanded if active route matches a child
  useEffect(() => {
    MENU_ITEMS.forEach(item => {
      if (item.children?.some(child => location.pathname === child.path || (child.path !== '/' && location.pathname.startsWith(child.path)))) {
        setOpenMenus(prev => ({ ...prev, [item.title]: true }));
      }
    });
  }, [location.pathname]);

  if (!user) return null;

  const toggleMenu = (title: string) => {
    setOpenMenus(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const renderMenuItem = (item: MenuItem) => {
    if (!item.roles.includes(user.role)) return null;

    const Icon = item.icon;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = !!openMenus[item.title];

    return (
      <div key={item.path} className="mb-1">
        {hasChildren ? (
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => toggleMenu(item.title)}
              className={cn(
                "w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition-all group",
                isExpanded && "text-white bg-slate-800/60"
              )}
            >
              <Icon className="w-5 h-5 mr-3 text-slate-400 group-hover:text-indigo-400 transition-colors" />
              <span className="flex-1 text-left font-medium">{item.title}</span>
              <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform duration-200", isExpanded && "rotate-180 text-indigo-400")} />
            </button>
            
            {isExpanded && (
              <div className="pl-9 space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
                {item.children!.map((child) => {
                  if (!child.roles.includes(user.role)) return null;
                  const ChildIcon = child.icon;
                  return (
                    <NavLink
                      key={child.path}
                      to={child.path}
                      onClick={onClose}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center px-3.5 py-2 text-xs font-semibold rounded-xl transition-all",
                          isActive
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                            : "text-slate-400 hover:bg-slate-800/80 hover:text-white"
                        )
                      }
                    >
                      {ChildIcon && <ChildIcon className="w-4 h-4 mr-2.5 shrink-0 opacity-80" />}
                      <span className="truncate">{child.title}</span>
                    </NavLink>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <NavLink
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                "flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all group",
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )
            }
          >
            <Icon className={cn("w-5 h-5 mr-3 transition-colors", location.pathname === item.path ? "text-white" : "text-slate-400 group-hover:text-indigo-400")} />
            {item.title}
          </NavLink>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Sidebar Drawer */}
      <aside 
        className={cn(
          "fixed md:static inset-y-0 left-0 z-50 flex flex-col w-64 h-full bg-slate-900 border-r border-slate-800 shrink-0 shadow-2xl md:shadow-xl transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">SIMS</h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">SMP Al-Hikam</p>
            </div>
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg md:hidden transition-colors"
            title="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
          <div className="space-y-1">
            {MENU_ITEMS.map(renderMenuItem)}
          </div>
        </div>

        {/* Quick Link to Landing Page */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-xs text-slate-300 hover:text-white transition-all border border-slate-700/50 group"
          >
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-400" />
              <span className="font-semibold">Buka Website Sekolah</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
          </a>
        </div>
      </aside>
    </>
  );
};

