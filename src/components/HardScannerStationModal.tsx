import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Barcode, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Volume2, 
  VolumeX, 
  Volume1, 
  Clock, 
  Users, 
  UserCheck, 
  Sparkles, 
  Maximize2, 
  Minimize2,
  Camera,
  RefreshCw
} from 'lucide-react';
import { scannerFeedback } from '../utils/scannerFeedback';
import { useHardwareScanner } from '../hooks/useHardwareScanner';

export interface StationScannedRecord {
  id: string;
  name: string;
  code: string;
  subInfo: string;
  status: string;
  time: string;
  type: 'success' | 'warning' | 'error';
  jenis: 'Masuk' | 'Pulang';
}

interface HardScannerStationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  targetType: 'siswa' | 'guru';
  jenisAbsen: 'Masuk' | 'Pulang';
  onJenisAbsenChange?: (jenis: 'Masuk' | 'Pulang') => void;
  summaryStats: {
    hadir: number;
    terlambat?: number;
    izin: number;
    sakit: number;
    alfa: number;
    total: number;
  };
  onScan: (code: string) => {
    success: boolean;
    type?: 'success' | 'error' | 'warning';
    title: string;
    message: string;
    personName?: string;
    personSub?: string;
    statusBadge?: string;
  };
}

export const HardScannerStationModal: React.FC<HardScannerStationModalProps> = ({
  isOpen,
  onClose,
  title,
  targetType,
  jenisAbsen,
  onJenisAbsenChange,
  summaryStats,
  onScan,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [testCode, setTestCode] = useState('');
  
  const [recentRecords, setRecentRecords] = useState<StationScannedRecord[]>([]);
  const [latestRecord, setLatestRecord] = useState<StationScannedRecord | null>(null);
  
  const hiddenInputRef = useRef<HTMLInputElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);

  // Sync sounds
  useEffect(() => {
    scannerFeedback.soundEnabled = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    scannerFeedback.voiceEnabled = voiceEnabled;
  }, [voiceEnabled]);

  // Keep hidden input focused for 100% hardware scanner compatibility
  useEffect(() => {
    if (!isOpen) return;

    const focusInput = () => {
      hiddenInputRef.current?.focus();
    };

    focusInput();
    const interval = setInterval(focusInput, 1500);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Execute scan
  const handleProcessCode = (code: string) => {
    const cleanCode = code.trim();
    if (!cleanCode) return;

    const result = onScan(cleanCode);
    const resultType = result.type || (result.success ? 'success' : 'error');
    const nowTimeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    scannerFeedback.playSound(resultType);
    if (result.success && voiceEnabled && result.personName) {
      scannerFeedback.speak(`${result.personName}, Hadir ${jenisAbsen}`);
    } else if (result.success && voiceEnabled) {
      scannerFeedback.speak(result.title);
    }

    const record: StationScannedRecord = {
      id: Date.now().toString(),
      name: result.personName || result.title,
      code: cleanCode,
      subInfo: result.personSub || result.message,
      status: result.statusBadge || (result.success ? 'Hadir' : 'Gagal'),
      time: nowTimeStr,
      type: resultType,
      jenis: jenisAbsen
    };

    setLatestRecord(record);
    setRecentRecords(prev => [record, ...prev.slice(0, 19)]);
  };

  // Hardware Scanner Hook
  useHardwareScanner({
    onScan: handleProcessCode,
    enabled: isOpen,
    minChars: 3
  });

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      modalRef.current?.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div 
        ref={modalRef}
        className="bg-slate-900 border border-slate-800 text-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col h-[92vh] max-h-[850px] animate-in fade-in zoom-in duration-200 relative"
      >
        {/* Hidden persistent input to guarantee capturing USB/Bluetooth scanner keystrokes */}
        <input 
          ref={hiddenInputRef} 
          type="text" 
          data-scanner-input="true" 
          className="opacity-0 absolute -top-96 left-0 pointer-events-none" 
          tabIndex={-1} 
        />

        {/* Header Station */}
        <div className="p-4 sm:px-6 py-3.5 border-b border-slate-800 bg-slate-900/95 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <Barcode className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-lg text-white leading-tight">{title}</h2>
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Hard Scanner Siap
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Mendukung Scanner CLABEL, Barcode Gun USB, Wireless 2.4G & RFID Card
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {onJenisAbsenChange && (
              <div className="bg-slate-800 p-1 rounded-xl border border-slate-700 flex text-xs font-semibold">
                <button
                  onClick={() => onJenisAbsenChange('Masuk')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    jenisAbsen === 'Masuk'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Masuk
                </button>
                <button
                  onClick={() => onJenisAbsenChange('Pulang')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    jenisAbsen === 'Pulang'
                      ? 'bg-amber-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Pulang
                </button>
              </div>
            )}

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-xl text-xs transition-colors border ${
                soundEnabled 
                  ? 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' 
                  : 'text-slate-500 bg-slate-800 border-slate-700'
              }`}
              title={soundEnabled ? 'Suara Beep Aktif' : 'Mute'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={`p-2 rounded-xl text-xs transition-colors border ${
                voiceEnabled 
                  ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' 
                  : 'text-slate-500 bg-slate-800 border-slate-700'
              }`}
              title={voiceEnabled ? 'Suara Vokal Aktif (Sebut Nama)' : 'Vokal Nonaktif'}
            >
              <Volume1 className="w-4 h-4" />
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors hidden sm:block"
              title="Layar Penuh"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Counter Summary Strip */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 p-3 bg-slate-950/60 border-b border-slate-800 text-center shrink-0 text-xs">
          <div className="bg-slate-900/90 border border-slate-800/80 p-2 rounded-xl">
            <span className="text-slate-400 text-[11px] block">Total Terdata</span>
            <span className="text-base font-bold text-white">{summaryStats.total}</span>
          </div>
          <div className="bg-emerald-950/40 border border-emerald-500/30 p-2 rounded-xl">
            <span className="text-emerald-400 text-[11px] block">Hadir</span>
            <span className="text-base font-bold text-emerald-400">{summaryStats.hadir}</span>
          </div>
          {summaryStats.terlambat !== undefined && (
            <div className="bg-purple-950/40 border border-purple-500/30 p-2 rounded-xl">
              <span className="text-purple-400 text-[11px] block">Terlambat</span>
              <span className="text-base font-bold text-purple-400">{summaryStats.terlambat}</span>
            </div>
          )}
          <div className="bg-blue-950/40 border border-blue-500/30 p-2 rounded-xl">
            <span className="text-blue-400 text-[11px] block">Izin</span>
            <span className="text-base font-bold text-blue-400">{summaryStats.izin}</span>
          </div>
          <div className="bg-amber-950/40 border border-amber-500/30 p-2 rounded-xl">
            <span className="text-amber-400 text-[11px] block">Sakit</span>
            <span className="text-base font-bold text-amber-400">{summaryStats.sakit}</span>
          </div>
        </div>

        {/* Main Body */}
        <div className="flex-1 p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 overflow-hidden">
          
          {/* Left Column: Big Scanner Hero Display (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-4">
            
            {/* Real-time Big Result Card */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-5 sm:p-7 flex-1 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-xl">
              <div className="absolute inset-0 bg-radial from-emerald-500/5 via-transparent to-transparent pointer-events-none" />

              {latestRecord ? (
                <div className="space-y-4 w-full animate-in fade-in zoom-in-95 duration-200">
                  {/* Status Badge */}
                  <div className="flex items-center justify-center">
                    <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold border shadow-lg ${
                      latestRecord.type === 'success'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                        : latestRecord.type === 'warning'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                    }`}>
                      {latestRecord.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      {latestRecord.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                      {latestRecord.type === 'error' && <XCircle className="w-4 h-4 text-rose-400" />}
                      {latestRecord.status} • {latestRecord.jenis}
                    </span>
                  </div>

                  {/* Avatar / Photo Initial */}
                  <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-3xl mx-auto flex items-center justify-center font-extrabold text-3xl sm:text-4xl border-2 shadow-2xl transition-all ${
                    latestRecord.type === 'success'
                      ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40 shadow-emerald-500/10'
                      : latestRecord.type === 'warning'
                      ? 'bg-amber-600/20 text-amber-300 border-amber-500/40 shadow-amber-500/10'
                      : 'bg-rose-600/20 text-rose-300 border-rose-500/40 shadow-rose-500/10'
                  }`}>
                    {latestRecord.name.charAt(0)}
                  </div>

                  {/* Name & Sub details */}
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      {latestRecord.name}
                    </h3>
                    <p className="text-sm font-medium text-slate-300 mt-1">
                      {latestRecord.subInfo}
                    </p>
                    <div className="flex items-center justify-center gap-3 mt-2.5 text-xs text-slate-400 font-mono">
                      <span className="bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60">
                        ID: {latestRecord.code}
                      </span>
                      <span className="bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {latestRecord.time} WIB
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Standby Waiting State */
                <div className="space-y-4 max-w-sm">
                  <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-600 shadow-inner">
                    <Barcode className="w-10 h-10 text-emerald-400 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Menunggu Scan {targetType === 'siswa' ? 'Siswa' : 'Guru'}</h3>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                      Arahkan barcode / QR Code kartu pada scanner CLABEL. Data kehadiran langsung tercatat seketika.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 text-[11px] text-slate-400 text-left space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                      <Sparkles className="w-3.5 h-3.5" />
                      Tips Pemakaian Hard Scanner:
                    </div>
                    <p>• Scanner CLABEL langsung bekerja secara otomatis tanpa klik.</p>
                    <p>• Pastikan jarak tembak scanner sekitar 5 - 15 cm dari kartu.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Test or Manual Entry Field */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!testCode.trim()) return;
                handleProcessCode(testCode);
                setTestCode('');
              }}
              className="flex items-center gap-2 bg-slate-900 p-2 rounded-2xl border border-slate-800 shadow-sm"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  value={testCode}
                  onChange={(e) => setTestCode(e.target.value)}
                  placeholder={`Ketik ${targetType === 'siswa' ? 'NIS' : 'NIP'} atau tembak scanner manual...`}
                  className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={!testCode.trim()}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold rounded-xl text-xs shadow transition-colors shrink-0"
              >
                Scan Manual
              </button>
            </form>
          </div>

          {/* Right Column: Live Feed Activity Log (5 Cols) */}
          <div className="lg:col-span-5 bg-slate-950/60 border border-slate-800 rounded-3xl p-4 flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-2 shrink-0">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-400" />
                <h4 className="font-bold text-xs sm:text-sm text-slate-200">Riwayat Scan Sesi Ini</h4>
              </div>
              <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded-full text-slate-400 font-mono">
                {recentRecords.length} scan
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {recentRecords.length > 0 ? (
                recentRecords.map((item) => (
                  <div 
                    key={item.id}
                    className="p-3 bg-slate-900/80 hover:bg-slate-900 border border-slate-800/80 rounded-2xl flex items-center justify-between gap-3 transition-colors text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        item.type === 'success' 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                          : item.type === 'warning'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {item.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-white truncate">{item.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{item.subInfo}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.type === 'success' 
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40' 
                          : item.type === 'warning'
                          ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                          : 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                      }`}>
                        {item.status}
                      </span>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">{item.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
                  <Clock className="w-8 h-8 text-slate-600" />
                  <p className="text-xs">Belum ada aktivitas scan pada sesi ini.</p>
                  <p className="text-[11px] text-slate-600">Scan akan langsung masuk ke daftar ini secara real-time.</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
