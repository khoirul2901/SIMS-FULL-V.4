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
  QrCode
} from 'lucide-react';

// Dynamic loader for jsQR to prevent build/bundle errors on server deployment
const loadJsQRDecoder = (): Promise<any> => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as any).jsQR) {
      return resolve((window as any).jsQR);
    }

    if (typeof document === 'undefined') {
      return resolve(null);
    }

    let script = document.getElementById('jsqr-decoder-script') as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.id = 'jsqr-decoder-script';
      script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js';
      script.async = true;
      document.body.appendChild(script);
    }

    const check = setInterval(() => {
      if ((window as any).jsQR) {
        clearInterval(check);
        resolve((window as any).jsQR);
      }
    }, 50);

    setTimeout(() => {
      clearInterval(check);
      resolve((window as any).jsQR || null);
    }, 5000);
  });
};

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
  onScan: (code: string) => { 
    success: boolean; 
    type?: 'success' | 'error' | 'warning';
    title: string; 
    message: string; 
  };
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle = 'Arahkan kamera ke QR Code untuk scan otomatis',
  manualPlaceholder = 'Ketik NIS / NIP manual di sini...',
  onScan,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isTorchOn, setIsTorchOn] = useState<boolean>(false);
  const [hasTorch, setHasTorch] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Manual input state
  const [manualCode, setManualCode] = useState<string>('');

  // Top Non-blocking Notification Toast
  const [notification, setNotification] = useState<ScanResultNotification | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cooldown / Debounce tracking for auto-detection
  const lastScannedCodeRef = useRef<string>('');
  const lastScannedTimeRef = useRef<number>(0);
  const animationFrameIdRef = useRef<number | null>(null);

  // Sound feedback helper using Web Audio API
  const playBeep = useCallback((type: 'success' | 'error' | 'warning') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'warning') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.25);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(280, ctx.currentTime);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (err) {
      // Audio autoplay policy fallback
    }
  }, [soundEnabled]);

  // Show Toast
  const showToast = useCallback((type: 'success' | 'error' | 'warning', title: string, message: string, code?: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }

    const nowStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setNotification({
      id: Date.now().toString(),
      type,
      title,
      message,
      code,
      timestamp: nowStr
    });

    toastTimeoutRef.current = setTimeout(() => {
      setNotification(null);
    }, 3000);
  }, []);

  // Process Scanned Code
  const processCode = useCallback((codeRaw: string) => {
    const code = codeRaw.trim();
    if (!code) return;

    const now = Date.now();
    // Cooldown check: ignore same code scanned within 2.5 seconds or any code within 0.8s
    if (code === lastScannedCodeRef.current && now - lastScannedTimeRef.current < 2500) {
      return;
    }
    if (now - lastScannedTimeRef.current < 800) {
      return;
    }

    lastScannedCodeRef.current = code;
    lastScannedTimeRef.current = now;

    // Execute scan callback from parent
    const result = onScan(code);
    const resultType = result.type || (result.success ? 'success' : 'error');

    playBeep(resultType);
    showToast(resultType, result.title, result.message, code);
  }, [onScan, playBeep, showToast]);

  // Stop Camera Stream
  const stopCamera = useCallback(() => {
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  // Start Camera Stream
  const startCamera = useCallback(async (deviceId?: string) => {
    setCameraError(null);
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Fitur kamera tidak didukung di peramban ini.');
      }

      const constraints: MediaStreamConstraints = {
        video: deviceId 
          ? { deviceId: { exact: deviceId } }
          : { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }

      // Check available cameras
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(d => d.kind === 'videoinput');
      setCameras(videoDevices);

      // Check Torch
      const track = mediaStream.getVideoTracks()[0];
      if (track) {
        const capabilities = (track.getCapabilities?.() || {}) as any;
        setHasTorch(Boolean(capabilities.torch));
      }

    } catch (err: any) {
      console.error('Camera Access Error:', err);
      let msg = 'Gagal mengakses kamera. Mohon izinkan akses kamera di browser Anda.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Izin kamera ditolak. Silakan izinkan akses kamera di pengaturan browser.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = 'Perangkat kamera tidak ditemukan.';
      }
      setCameraError(msg);
    }
  }, [stopCamera]);

  // Toggle Torch
  const toggleTorch = async () => {
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    if (track && hasTorch) {
      try {
        const nextState = !isTorchOn;
        await track.applyConstraints({
          advanced: [{ torch: nextState } as any]
        });
        setIsTorchOn(nextState);
      } catch (e) {
        console.error('Torch toggle error:', e);
      }
    }
  };

  const jsQRDecoderRef = useRef<any>(null);

  // Pre-load jsQR decoder when modal opens
  useEffect(() => {
    if (isOpen) {
      loadJsQRDecoder().then((decoder) => {
        jsQRDecoderRef.current = decoder;
      });
    }
  }, [isOpen]);

  // Canvas Scan Frame Loop
  useEffect(() => {
    if (!isOpen || !stream || cameraError) return;

    let isScanning = true;

    const tick = () => {
      if (!isScanning) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;

          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

          const jsQR = jsQRDecoderRef.current || (typeof window !== 'undefined' && (window as any).jsQR);
          if (jsQR) {
            const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'dontInvert'
            });

            if (qrCode && qrCode.data) {
              processCode(qrCode.data);
            }
          }
        }
      }

      animationFrameIdRef.current = requestAnimationFrame(tick);
    };

    animationFrameIdRef.current = requestAnimationFrame(tick);

    return () => {
      isScanning = false;
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [isOpen, stream, cameraError, processCode]);

  // Open/Close Stream Management
  useEffect(() => {
    if (isOpen) {
      startCamera(selectedCameraId || undefined);
    } else {
      stopCamera();
      setNotification(null);
      setManualCode('');
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    processCode(manualCode);
    setManualCode('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in duration-200 relative">
        
        {/* Header */}
        <div className="p-4 sm:px-6 sm:py-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <QrCode className="w-5 h-5" />
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
              title={soundEnabled ? 'Suara Aktif' : 'Suara Mute'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
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

        {/* Viewport Camera & Live Scan Area */}
        <div className="relative bg-black flex-1 min-h-[320px] max-h-[420px] flex items-center justify-center overflow-hidden">
          
          {/* TOP FLOATING NON-BLOCKING NOTIFICATION TOAST */}
          {notification && (
            <div className="absolute top-3 left-3 right-3 z-30 animate-in slide-in-from-top-4 duration-200">
              <div className={`p-3.5 rounded-2xl shadow-xl backdrop-blur-md border flex items-start gap-3 transition-all ${
                notification.type === 'success' 
                  ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-100' 
                  : notification.type === 'warning'
                  ? 'bg-amber-950/90 border-amber-500/50 text-amber-100'
                  : 'bg-rose-950/90 border-rose-500/50 text-rose-100'
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
                    <div className="mt-1 text-[10px] font-mono opacity-75">ID / QR: {notification.code}</div>
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

          {/* Hidden Canvas for Frame Capture */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Live Video Feed */}
          <video
            ref={videoRef}
            playsInline
            autoPlay
            muted
            className={`w-full h-full object-cover ${cameraError ? 'hidden' : 'block'}`}
          />

          {/* Scanning Box Target & Line Animation */}
          {!cameraError && stream && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              {/* Outer dimmed overlay */}
              <div className="absolute inset-0 bg-black/40" />

              {/* Center Scanner Window */}
              <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-2xl border-2 border-indigo-400/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] z-10 overflow-hidden flex items-center justify-center">
                {/* Corner markers */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-indigo-400 rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-indigo-400 rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-indigo-400 rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-indigo-400 rounded-br-lg" />

                {/* Laser scan line animation */}
                <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-indigo-500 via-emerald-400 to-indigo-500 shadow-[0_0_12px_#3b82f6] animate-pulse rounded-full top-0 animate-[scan_2.2s_ease-in-out_infinite]" />

                <p className="text-[11px] font-medium text-slate-300/80 bg-slate-900/80 px-3 py-1 rounded-full backdrop-blur-sm border border-slate-700/50 mt-auto mb-3 shadow">
                  Posisikan QR Code di Dalam Kotak
                </p>
              </div>
            </div>
          )}

          {/* Camera Error Message */}
          {cameraError && (
            <div className="p-6 text-center max-w-sm space-y-4">
              <div className="w-14 h-14 bg-rose-500/10 text-rose-400 rounded-full flex items-center justify-center mx-auto border border-rose-500/20">
                <Camera className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-rose-300">Akses Kamera Gagal</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{cameraError}</p>
              </div>
              <button
                onClick={() => startCamera(selectedCameraId || undefined)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-lg transition-colors inline-flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Coba Buka Kamera Lagi
              </button>
            </div>
          )}
        </div>

        {/* Camera Controls & Switcher */}
        {!cameraError && (
          <div className="px-4 py-2.5 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between gap-2 text-xs text-slate-300">
            <div className="flex items-center gap-2 min-w-0">
              <Camera className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              {cameras.length > 1 ? (
                <select
                  value={selectedCameraId}
                  onChange={(e) => {
                    setSelectedCameraId(e.target.value);
                    startCamera(e.target.value);
                  }}
                  className="bg-slate-800 text-white text-xs py-1 px-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 truncate max-w-[180px]"
                >
                  {cameras.map((cam, idx) => (
                    <option key={cam.deviceId} value={cam.deviceId}>
                      {cam.label || `Kamera ${idx + 1}`}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-[11px] text-slate-400 truncate">Kamera Aktif & Auto Deteksi</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {hasTorch && (
                <button
                  onClick={toggleTorch}
                  className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
                    isTorchOn 
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                  title="Lampu Kilat"
                >
                  {isTorchOn ? <Zap className="w-3.5 h-3.5" /> : <ZapOff className="w-3.5 h-3.5" />}
                </button>
              )}

              <button
                onClick={() => startCamera(selectedCameraId || undefined)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
                title="Refresh Stream"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Manual Input Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800">
          <form onSubmit={handleManualSubmit} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Keyboard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder={manualPlaceholder}
                className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
              />
            </div>
            <button
              type="submit"
              disabled={!manualCode.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl text-xs shadow transition-colors shrink-0"
            >
              Proses
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
