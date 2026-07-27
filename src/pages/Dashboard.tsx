import React from 'react';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  AlertTriangle,
  TrendingUp,
  Clock,
  Lightbulb
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useDatabase } from '../context/DatabaseContext';

const MOCK_STATS = {
  totalGuru: 45,
  totalSiswa: 850,
  totalKelas: 24,
  absensiHariIni: 98, // percentage
  pelanggaranBulanIni: 12,
  jumlahArsip: 1240,
  jumlahSurat: 350
};

const ATTENDANCE_DATA = [
  { name: 'Sen', hadir: 98, izin: 1, sakit: 1 },
  { name: 'Sel', hadir: 95, izin: 3, sakit: 2 },
  { name: 'Rab', hadir: 97, izin: 2, sakit: 1 },
  { name: 'Kam', hadir: 99, izin: 1, sakit: 0 },
  { name: 'Jum', hadir: 96, izin: 2, sakit: 2 },
];

const VIOLATION_DATA = [
  { month: 'Jan', count: 15 },
  { month: 'Feb', count: 20 },
  { month: 'Mar', count: 12 },
  { month: 'Apr', count: 8 },
  { month: 'Mei', count: 5 },
  { month: 'Jun', count: 12 },
];



export const Dashboard = () => {
  const { siswaData, guruData, kelasData, pelanggaranData } = useDatabase();

  const stats = {
    totalGuru: guruData.length,
    totalSiswa: siswaData.length,
    totalKelas: kelasData.length,
    absensiHariIni: 98,
    pelanggaranBulanIni: pelanggaranData.length,
    jumlahArsip: 1240,
  };

  const STAT_CARDS = [
    { title: 'Total Siswa', value: stats.totalSiswa, icon: GraduationCap, color: 'bg-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-500/10', text: 'text-indigo-600 dark:text-indigo-400' },
    { title: 'Total Guru', value: stats.totalGuru, icon: Users, color: 'bg-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400' },
    { title: 'Total Kelas', value: stats.totalKelas, icon: BookOpen, color: 'bg-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400' },
    { title: 'Kehadiran (%)', value: stats.absensiHariIni, icon: TrendingUp, color: 'bg-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400' },
  ];
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Selamat datang kembali, {user?.name}. Berikut adalah ringkasan hari ini.</p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
          <Clock className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STAT_CARDS.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-start justify-between hover:shadow-md transition-shadow">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">{stat.title}</p>
                <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{stat.value}</h3>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                <Icon className={`w-6 h-6 ${stat.text}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Interpretasi Data (Data Insights) */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/30 p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl text-indigo-600 dark:text-indigo-400 shrink-0">
            <Lightbulb className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-100 mb-2">Interpretasi & Insight Hari Ini</h3>
            <ul className="space-y-2 text-sm text-indigo-800 dark:text-indigo-200">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></div>
                <p>Tingkat kehadiran siswa stabil di angka <strong>98%</strong>, menunjukkan partisipasi yang sangat baik minggu ini.</p>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></div>
                <p>Tren pelanggaran mengalami <strong>penurunan signifikan</strong> sejak bulan Februari (dari 20 menjadi 12 kasus pada Juni).</p>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></div>
                <p>Rasio guru dan siswa berada pada <strong>1:19</strong>, kondisi ideal untuk efektivitas pembelajaran di kelas.</p>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Statistik Kehadiran (Minggu Ini)</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ATTENDANCE_DATA} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#1e293b', color: '#f8fafc' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Bar dataKey="hadir" name="Hadir" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="izin" name="Izin" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="sakit" name="Sakit" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Violations Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Tren Pelanggaran (Semester Ini)</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={VIOLATION_DATA} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#1e293b', color: '#f8fafc' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Line type="monotone" dataKey="count" name="Jumlah" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Aktivitas Terkini</h3>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {[
            { action: 'Input Nilai Ujian UTS Matematika', user: 'Budi Santoso, S.Pd', time: '10 menit yang lalu', icon: BookOpen, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
            { action: 'Mencatat Pelanggaran (Terlambat)', user: 'Rina Rahmawati, S.Psi', time: '45 menit yang lalu', icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-500/10' },
            { action: 'Membayar SPP Bulan Maret', user: 'Siswa: Ahmad Dahlan', time: '2 jam yang lalu', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
          ].map((activity, idx) => {
            const Icon = activity.icon;
            return (
              <div key={idx} className="p-4 sm:px-6 flex items-start gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${activity.bg}`}>
                  <Icon className={`w-5 h-5 ${activity.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{activity.action}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{activity.user}</p>
                </div>
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500">{activity.time}</span>
              </div>
            );
          })}
        </div>
        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 text-center border-t border-slate-100 dark:border-slate-800">
          <button className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">Lihat Semua Aktivitas</button>
        </div>
      </div>
    </div>
  );
};
