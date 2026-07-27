import React from 'react';
import { FileText, Download, Filter, Printer } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const DATA_LAPORAN = [
  { bln: 'Jul', spp: 100, gedung: 80, daftarUlang: 90 },
  { bln: 'Aug', spp: 110, gedung: 50, daftarUlang: 20 },
  { bln: 'Sep', spp: 95, gedung: 10, daftarUlang: 5 },
  { bln: 'Oct', spp: 105, gedung: 5, daftarUlang: 0 },
];

export const Laporan = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Pusat Laporan</h1>
          <p className="text-sm text-slate-500 mt-1">Generate dan unduh laporan sistem secara komprehensif</p>
        </div>
      </div>

      {/* Report Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Laporan Keuangan', desc: 'Rekapitulasi kas masuk, keluar, dan tunggakan', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
          { title: 'Laporan Akademik', desc: 'Rekapitulasi absensi siswa dan guru per semester', color: 'bg-blue-50 border-blue-200 text-blue-700' },
          { title: 'Laporan Pelanggaran', desc: 'Statistik kedisiplinan dan poin siswa', color: 'bg-red-50 border-red-200 text-red-700' },
          { title: 'Data Master', desc: 'Export data guru, siswa, kelas, dan mapel', color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
        ].map((item, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow cursor-pointer group">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center border mb-4 ${item.color}`}>
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{item.title}</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">{item.desc}</p>
            <div className="flex items-center gap-2">
              <button className="flex-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 py-1.5 rounded transition-colors flex items-center justify-center gap-1.5">
                <Download className="w-3.5 h-3.5" /> PDF
              </button>
              <button className="flex-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 py-1.5 rounded transition-colors flex items-center justify-center gap-1.5">
                <Download className="w-3.5 h-3.5" /> Excel
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="font-bold text-slate-800">Preview: Laporan Pembayaran SPP</h3>
          <div className="flex gap-2">
            <button className="p-1.5 bg-white border border-slate-200 rounded text-slate-600 hover:bg-slate-50 transition-colors" title="Filter Parameter">
              <Filter className="w-4 h-4" />
            </button>
            <button className="p-1.5 bg-white border border-slate-200 rounded text-slate-600 hover:bg-slate-50 transition-colors" title="Print Laporan">
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DATA_LAPORAN} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="bln" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="spp" name="SPP Bulanan" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="gedung" name="Uang Gedung" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
