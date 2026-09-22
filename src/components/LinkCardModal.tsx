import React, { useState } from 'react';
import { IdCard, CheckCircle2, X, Search, UserCheck } from 'lucide-react';

interface LinkCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  scannedCode: string;
  siswaData: any[];
  onSaveAndAttend: (studentId: string, cardCode: string) => void;
}

export const LinkCardModal: React.FC<LinkCardModalProps> = ({
  isOpen,
  onClose,
  scannedCode,
  siswaData,
  onSaveAndAttend
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');

  if (!isOpen) return null;

  const filteredStudents = siswaData.filter(s => 
    s.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.nis && s.nis.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (s.kelas && s.kelas.toLowerCase().includes(searchTerm.toLowerCase()))
  ).slice(0, 10);

  const selectedStudent = siswaData.find(s => s.id === selectedStudentId);

  const handleConfirm = () => {
    if (!selectedStudentId) return;
    onSaveAndAttend(selectedStudentId, scannedCode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs">
              <IdCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">Tautkan Kartu ke Siswa</h3>
              <p className="text-xs text-blue-100">Hubungkan barcode kartu lama ke profil siswa</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Card Info Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-amber-800 uppercase tracking-wide">Kode Barcode Terbaca</span>
              <p className="font-mono font-bold text-slate-800 text-base mt-0.5 tracking-wider">
                {scannedCode}
              </p>
            </div>
            <span className="px-2.5 py-1 bg-amber-200 text-amber-900 text-xs font-medium rounded-full">
              Belum Terdaftar
            </span>
          </div>

          {/* Search student */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Pilih Siswa Pemilik Kartu Ini
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                placeholder="Cari nama siswa, NIS, atau kelas..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Student list */}
          <div className="max-h-52 overflow-y-auto space-y-1.5 border border-slate-100 rounded-xl p-1 bg-slate-50/50">
            {filteredStudents.length > 0 ? (
              filteredStudents.map(s => {
                const isSelected = s.id === selectedStudentId;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedStudentId(s.id)}
                    className={`w-full text-left p-2.5 rounded-lg flex items-center justify-between transition-all ${
                      isSelected 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-100'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-sm leading-snug">{s.nama}</div>
                      <div className={`text-xs ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                        NIS: {s.nis || '-'} • Kelas {s.kelas}
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                Tidak ada siswa yang cocok dengan "{searchTerm}"
              </div>
            )}
          </div>

          {/* Summary */}
          {selectedStudent && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center gap-2.5">
              <UserCheck className="w-5 h-5 text-blue-600 shrink-0" />
              <div>
                Kartu <b>{scannedCode}</b> akan ditautkan ke <b>{selectedStudent.nama}</b> (Kelas {selectedStudent.kelas}) dan langsung diabsenkan Hadir.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={!selectedStudentId}
            onClick={handleConfirm}
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-sm shadow-blue-600/20 transition-all flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Simpan & Absenkan
          </button>
        </div>
      </div>
    </div>
  );
};
