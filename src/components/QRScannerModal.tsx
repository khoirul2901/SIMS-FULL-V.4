import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  X, 
  Camera, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Zap, 
  ZapOff,
  Volume2,
  VolumeX,
  Keyboard,
  QrCode,
  Barcode,
  Upload,
  Sparkles,
  Volume1,
  IdCard
} from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { scannerFeedback } from '../utils/scannerFeedback';
import { useHardwareScanner } from '../hooks/useHardwareScanner';

export interface ScanResultNotification {
  id: string;
  type: 'success' | 'error' | 'warning';
  title: string;
  message: string;
  code?: string;
  timestamp: string;
}

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  manualPlaceholder?: string;
  onLinkCard?: (code: string) => void;
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

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle = 'Arahkan kamera ke QR Code atau tembak dengan scanner CLABEL',
  manualPlaceholder = 'Ketik NIS / NIP manual atau tembak scanner...',
  onLinkCard,
  onScan,
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'hardScanner'>('camera');
  
  // Camera state
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const manualInputRef = useRef<HTMLInputElement | null>(null);
  const scannerInstanceRef = useRef<Html5Qrcode | null>(null);
  const isStartingRef = useRef<boolean>(false);

  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraLoading, setCameraLoading] = useState<boolean>(false);
  const [isTorchOn, setIsTorchOn] = useState<boolean>(false);
  const [hasTorch, setHasTorch] = useState<boolean>(false);
  
  // Audio & Voice feedback states
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(false);

  // Manual input state
  const [manualCode, setManualCode] = useState<string>('');

  // Top Non-blocking Notification Toast & Last Scanned Card
  const [notification, setNotification] = useState<ScanResultNotification | null>(null);
  const [lastScannedLog, setLastScannedLog] = useState<ScanResultNotification[]>([]);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cooldown / Debounce tracking for auto-detection
  const lastScannedCodeRef = useRef<string>('');
  const lastScannedTimeRef = useRef<number>(0);

  // Sync sound settings with scannerFeedback
  useEffect(() => {
    scannerFeedback.soundEnabled = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    scannerFeedback.voiceEnabled = voiceEnabled;
  }, [voiceEnabled]);

  // Show Toast
  const showToast = useCallback((type: 'success' | 'error' | 'warning', titleText: string, messageText: string, code?: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }

    const nowStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const newNotif: ScanResultNotification = {
      id: Date.now().toString(),
      type,
      title: titleText,
      message: messageText,
      code,
      timestamp: nowStr
    };

    setNotification(newNotif);
    setLastScannedLog(prev => [newNotif, ...prev.slice(0, 9)]);

    toastTimeoutRef.current = setTimeout(() => {
      setNotification(null);
    }, 3500);
  }, []);

  // Process Scanned Code (from Camera, Hardware Scanner, or Manual Input)
  const processCode = useCallback((codeRaw: string) => {
    const code = codeRaw.trim();
    if (!code) return;

    const now = Date.now();
    // Cooldown: ignore same code scanned within 2.0 seconds or any code within 600ms
    if (code === lastScannedCodeRef.current && now - lastScannedTimeRef.current < 2000) {
      return;
    }
    if (now - lastScannedTimeRef.current < 600) {
      return;
    }

    lastScannedCodeRef.current = code;
    lastScannedTimeRef.current = now;

    // Execute scan callback from parent
    const result = onScan(code);
    const resultType = result.type || (result.success ? 'success' : 'error');

    scannerFeedback.playSound(resultType);
    if (result.success && voiceEnabled) {
      scannerFeedback.speak(result.personName ? `${result.personName}, Hadir` : result.title);
    }

    showToast(resultType, result.title, result.message, code);
  }, [onScan, showToast, voiceEnabled]);

  // Connect Hardware Scanner (CLABEL, Barcode Gun, RFID)
  useHardwareScanner({
    onScan: processCode,
    enabled: isOpen,
    minChars: 3,
    cooldownMs: 1500
  });

  // Stop Camera Scanner Cleanly
  const stopCamera = useCallback(async () => {
    if (scannerInstanceRef.current) {
      const scanner = scannerInstanceRef.current;
      scannerInstanceRef.current = null;
      try {
        if (scanner.isScanning) {
          await scanner.stop();
        }
        scanner.clear();
      } catch (err) {
        console.warn('Error stopping scanner:', err);
      }
    }
    setIsTorchOn(false);
    setHasTorch(false);
  }, []);

  // Start Camera with Html5Qrcode
  const startCamera = useCallback(async (deviceId?: string) => {
    if (isStartingRef.current) return;
    isStartingRef.current = true;
    setCameraLoading(true);
    setCameraError(null);

    await stopCamera();

    try {
      const readerElem = document.getElementById('html5-qr-reader');
      if (!readerElem) {
        setCameraLoading(false);
        isStartingRef.current = false;
        return;
      }

      // Enumerate available video input devices
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          setCameras(devices);
        }
      } catch (enumErr) {
        console.warn('Could not enumerate cameras:', enumErr);
      }

      const html5QrCode = new Html5Qrcode('html5-qr-reader', {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.CODE_93,
          Html5QrcodeSupportedFormats.CODABAR,
          Html5QrcodeSupportedFormats.ITF,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.DATA_MATRIX,
          Html5QrcodeSupportedFormats.PDF_417,
          Html5QrcodeSupportedFormats.AZTEC
        ],
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true
        },
        verbose: false
      });
      scannerInstanceRef.current = html5QrCode;

      const cameraConfig = deviceId 
        ? { deviceId: { exact: deviceId } } 
        : { facingMode: 'environment' };

      await html5QrCode.start(
        cameraConfig,
        {
          fps: 15,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const edge = Math.floor(Math.min(viewfinderWidth, viewfinderHeight) * 0.72);
            return { width: edge, height: edge };
          },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          processCode(decodedText);
        },
        () => {
          // Frame decode error (normal for empty frames)
        }
      );

      // Check torch capability
      try {
        const capabilities = html5QrCode.getRunningTrackCameraCapabilities();
        if (capabilities && typeof (capabilities as any).torchFeature === 'function') {
          const tf = (capabilities as any).torchFeature();
          setHasTorch(Boolean(tf && tf.isSupported && tf.isSupported()));
        } else {
          setHasTorch(false);
        }
      } catch {
        setHasTorch(false);
      }

      setCameraLoading(false);
    } catch (err: any) {
      console.error('Camera Access Error:', err);
      let msg = 'Gagal mengakses kamera. Mohon izinkan izin kamera di browser Anda.';
      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError' || String(err).includes('Permission')) {
        msg = 'Izin kamera ditolak. Silakan klik ikon gembok/kamera di address bar browser dan ubah menjadi "Izinkan" (Allow).';
      } else if (err?.name === 'NotFoundError' || String(err).includes('NotFound')) {
        msg = 'Perangkat kamera tidak terdeteksi pada perangkat ini.';
      } else if (err?.name === 'NotReadableError' || String(err).includes('NotReadable')) {
        msg = 'Kamera sedang digunakan oleh aplikasi lain. Tutup aplikasi lain lalu coba lagi.';
      } else if (typeof err === 'string') {
        msg = err;
      }
      setCameraError(msg);
      setCameraLoading(false);
    } finally {
      isStartingRef.current = false;
    }
  }, [stopCamera, processCode]);

  // Toggle Flashlight Torch
  const toggleTorch = async () => {
    if (!scannerInstanceRef.current || !hasTorch) return;
    try {
      const nextTorch = !isTorchOn;
      await scannerInstanceRef.current.applyVideoConstraints({
        advanced: [{ torch: nextTorch } as any]
      });
      setIsTorchOn(nextTorch);
    } catch (e) {
      console.error('Torch toggle error:', e);
    }
  };

  // Decode Image File uploaded by user
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const tempId = 'qr-file-decoder-temp';
      let tempElem = document.getElementById(tempId);
      if (!tempElem) {
        tempElem = document.createElement('div');
        tempElem.id = tempId;
        tempElem.style.display = 'none';
        document.body.appendChild(tempElem);
      }

      const fileScanner = new Html5Qrcode(tempId, {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.CODE_93,
          Html5QrcodeSupportedFormats.CODABAR,
          Html5QrcodeSupportedFormats.ITF,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.DATA_MATRIX,
          Html5QrcodeSupportedFormats.PDF_417,
          Html5QrcodeSupportedFormats.AZTEC
        ],
        verbose: false
      });
      const decodedText = await fileScanner.scanFile(file, false);
      fileScanner.clear();

      if (decodedText) {
        processCode(decodedText);
      } else {
        showToast('error', 'QR Tidak Terdeteksi', 'Pastikan foto QR / Barcode jelas, terang, dan tidak buram.');
      }
    } catch (err) {
      console.warn('File decode error:', err);
      showToast('error', 'QR Tidak Terdeteksi', 'Pastikan foto QR / Barcode jelas, terang, dan tidak buram.');
    } finally {
      e.target.value = '';
    }
  };

  // Lifecycle management
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isOpen) {
      if (activeTab === 'camera') {
        // Small delay to ensure container element is mounted in DOM
        timeoutId = setTimeout(() => {
          startCamera(selectedCameraId || undefined);
        }, 80);
      } else {
        stopCamera();
        timeoutId = setTimeout(() => {
          manualInputRef.current?.focus();
        }, 100);
      }
    } else {
      stopCamera();
      setNotification(null);
      setManualCode('');
    }

    return () => {
      clearTimeout(timeoutId);
      stopCamera();
    };
  }, [isOpen, activeTab, selectedCameraId, startCamera, stopCamera]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    processCode(manualCode);
    setManualCode('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[94vh] animate-in fade-in zoom-in duration-200 relative">
        
        {/* Header */}
        <div className="p-4 sm:px-6 sm:py-3.5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/95 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              {activeTab === 'camera' ? <QrCode className="w-5 h-5" /> : <Barcode className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg text-white leading-tight">{title}</h2>
              <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-xl text-xs transition-colors ${soundEnabled ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-500 bg-slate-800'}`}
              title={soundEnabled ? 'Suara Beep Aktif' : 'Suara Mute'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={`p-2 rounded-xl text-xs transition-colors ${voiceEnabled ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-500 bg-slate-800'}`}
              title={voiceEnabled ? 'Suara Vokal Aktif (Sebut Nama)' : 'Suara Vokal Nonaktif'}
            >
              <Volume1 className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher: Kamera vs Hard Scanner (CLABEL) */}
        <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 p-1 bg-slate-800/80 rounded-xl border border-slate-700/60 text-xs">
            <button
              onClick={() => setActiveTab('camera')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'camera'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              Kamera Web / HP
            </button>
            <button
              onClick={() => setActiveTab('hardScanner')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'hardScanner'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Barcode className="w-3.5 h-3.5" />
              Hard Scanner (CLABEL / Gun)
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Auto Scan Siap
            </span>
          </div>
        </div>

        {/* Main View Area */}
        {activeTab === 'camera' ? (
          /* Viewport Camera & Live Scan Area */
          <div className="relative bg-black flex-1 min-h-[300px] max-h-[380px] flex items-center justify-center overflow-hidden">
            
            {/* Html5Qrcode Reader Mount Target */}
            <div 
              id="html5-qr-reader" 
              className={`w-full h-full flex items-center justify-center overflow-hidden [&_video]:w-full [&_video]:h-full [&_video]:object-cover ${cameraError ? 'hidden' : 'block'}`}
            />

            {/* Scanning Box Target & Reticle Overlay */}
            {!cameraError && !cameraLoading && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-2xl border-2 border-indigo-400/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)] z-10 overflow-hidden flex items-center justify-center">
                  {/* Corner markers */}
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-indigo-400 rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-indigo-400 rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-indigo-400 rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-indigo-400 rounded-br-lg" />

                  {/* Laser scan line animation */}
                  <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-indigo-500 via-emerald-400 to-indigo-500 shadow-[0_0_12px_#3b82f6] animate-pulse rounded-full top-0 animate-[scan_2.2s_ease-in-out_infinite]" />

                  <p className="text-[11px] font-medium text-slate-200 bg-slate-900/90 px-3 py-1 rounded-full backdrop-blur-sm border border-slate-700/60 mt-auto mb-3 shadow">
                    Posisikan Barcode / QR di Dalam Kotak
                  </p>
                </div>
              </div>
            )}

            {/* Loading Spinner */}
            {cameraLoading && (
              <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center gap-3 z-20">
                <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
                <p className="text-xs text-slate-300">Menghubungkan ke kamera...</p>
              </div>
            )}

            {/* Camera Error Message */}
            {cameraError && !cameraLoading && (
              <div className="p-6 text-center max-w-sm space-y-4 z-20">
                <div className="w-14 h-14 bg-rose-500/10 text-rose-400 rounded-full flex items-center justify-center mx-auto border border-rose-500/20">
                  <Camera className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-rose-300">Kamera Belum Dapat Digunakan</h3>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{cameraError}</p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
                  <button
                    onClick={() => startCamera(selectedCameraId || undefined)}
                    className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow transition-colors inline-flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Coba Lagi
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition-colors inline-flex items-center justify-center gap-2"
                  >
                    <Upload className="w-3.5 h-3.5 text-indigo-400" />
                    Pilih File Foto
                  </button>
                </div>

                <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800/80">
                  Tip: Anda juga dapat menggunakan <strong>Hard Scanner CLABEL</strong> tanpa kamera!
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Dedicated Hard Scanner (CLABEL / Barcode Gun / RFID) Station Mode */
          <div className="bg-slate-950 p-6 flex-1 min-h-[300px] flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-radial from-emerald-500/10 via-transparent to-transparent pointer-events-none" />

            <div className="relative z-10 max-w-md w-full space-y-4">
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
                <Barcode className="w-8 h-8" />
              </div>

              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Hard Scanner Siaga (CLABEL / USB / Bluetooth)
                </span>
                <h3 className="font-bold text-lg text-white">Mode Scanner Otomatis</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Tembakkan scanner barcode/QR CLABEL, USB Gun, atau tap kartu RFID. Sistem akan langsung mencatat absensi tanpa perlu menekan tombol apapun.
                </p>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-left space-y-2.5 shadow-inner">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-medium text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Panduan Koneksi Scanner:
                  </span>
                  <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-emerald-400 border border-slate-700 font-mono">
                    Plug & Play
                  </span>
                </div>
                <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
                  <li>Hubungkan dongle wireless 2.4G atau kabel USB scanner CLABEL ke PC/Laptop.</li>
                  <li>Arahkan laser scanner ke barcode / QR Code pada kartu siswa atau guru.</li>
                  <li>Tarik pelatuk scanner (BEEP) ➔ Kehadiran langsung tercatat otomatis!</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TOP FLOATING NON-BLOCKING NOTIFICATION TOAST */}
        {notification && (
          <div className="absolute top-16 left-3 right-3 z-40 animate-in slide-in-from-top-4 duration-200">
            <div className={`p-3.5 rounded-2xl shadow-2xl backdrop-blur-md border flex items-start gap-3 transition-all ${
              notification.type === 'success' 
                ? 'bg-emerald-950/95 border-emerald-500/60 text-emerald-100 shadow-emerald-950/50' 
                : notification.type === 'warning'
                ? 'bg-amber-950/95 border-amber-500/60 text-amber-100 shadow-amber-950/50'
                : 'bg-rose-950/95 border-rose-500/60 text-rose-100 shadow-rose-950/50'
            }`}>
              <div className="shrink-0 mt-0.5">
                {notification.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                {notification.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
                {notification.type === 'error' && <XCircle className="w-5 h-5 text-rose-400" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-xs sm:text-sm truncate">{notification.title}</h4>
                  <span className="text-[10px] opacity-75 shrink-0 font-mono">{notification.timestamp}</span>
                </div>
                <p className="text-xs mt-0.5 opacity-90 leading-snug">{notification.message}</p>
                {notification.code && (
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-mono opacity-80 bg-black/30 px-2 py-0.5 rounded">
                      ID / Barcode: {notification.code}
                    </span>
                    {notification.type === 'error' && onLinkCard && (
                      <button
                        type="button"
                        onClick={() => {
                          const c = notification.code!;
                          setNotification(null);
                          onLinkCard(c);
                        }}
                        className="text-[11px] font-semibold bg-white text-rose-900 hover:bg-rose-100 px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <IdCard className="w-3.5 h-3.5 text-rose-700" />
                        Tautkan Kartu Ini ke Siswa
                      </button>
                    )}
                  </div>
                )}
              </div>

              <button 
                onClick={() => setNotification(null)}
                className="p-1 opacity-60 hover:opacity-100 transition-opacity"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Camera Controls & Switcher (Only when on Camera tab) */}
        {activeTab === 'camera' && !cameraError && (
          <div className="px-4 py-2 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between gap-2 text-xs text-slate-300 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <Camera className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              {cameras.length > 1 ? (
                <select
                  value={selectedCameraId}
                  onChange={(e) => {
                    setSelectedCameraId(e.target.value);
                  }}
                  className="bg-slate-800 text-white text-xs py-1 px-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 truncate max-w-[180px]"
                >
                  {cameras.map((cam, idx) => (
                    <option key={cam.id} value={cam.id}>
                      {cam.label || `Kamera ${idx + 1}`}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-[11px] text-slate-400 truncate">Kamera Aktif & Auto Deteksi</span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {hasTorch && (
                <button
                  onClick={toggleTorch}
                  className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
                    isTorchOn 
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                  title="Lampu Flash"
                >
                  {isTorchOn ? <Zap className="w-3.5 h-3.5" /> : <ZapOff className="w-3.5 h-3.5" />}
                </button>
              )}

              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
                title="Unggah Gambar QR"
              >
                <Upload className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => startCamera(selectedCameraId || undefined)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
                title="Refresh Stream Kamera"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Hidden File Input for Image QR Upload */}
        <input 
          type="file" 
          ref={fileInputRef} 
          accept="image/*" 
          className="hidden" 
          onChange={handleFileUpload} 
        />

        {/* Manual Input / Hardware Scanner Fallback Input */}
        <div className="p-3.5 sm:p-4 bg-slate-900 border-t border-slate-800 shrink-0">
          <form onSubmit={handleManualSubmit} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Keyboard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                ref={manualInputRef}
                type="text"
                data-scanner-input="true"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder={manualPlaceholder}
                className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={!manualCode.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl text-xs shadow transition-colors shrink-0"
            >
              Absenkan
            </button>
          </form>

          {/* Quick Recent Log Strip (Shows last 3 scans) */}
          {lastScannedLog.length > 0 && (
            <div className="mt-2.5 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-slate-500 shrink-0">Terakhir:</span>
                <span className="font-semibold text-slate-200 truncate">{lastScannedLog[0].title}</span>
                <span className="text-emerald-400 font-mono shrink-0">({lastScannedLog[0].timestamp})</span>
              </div>
              <span className="text-[10px] text-slate-500 shrink-0 font-mono">{lastScannedLog.length} terdata</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
