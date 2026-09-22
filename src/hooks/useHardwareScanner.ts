import { useEffect, useRef, useState, useCallback } from 'react';

export interface UseHardwareScannerOptions {
  onScan: (scannedCode: string) => void;
  enabled?: boolean;
  minChars?: number;
  maxKeyIntervalMs?: number;
  cooldownMs?: number;
}

export const useHardwareScanner = ({
  onScan,
  enabled = true,
  minChars = 3,
  maxKeyIntervalMs = 70, // CLABEL and barcode guns fire characters within 20-50ms
  cooldownMs = 1500
}: UseHardwareScannerOptions) => {
  const [lastScanned, setLastScanned] = useState<string>('');
  const [lastScanTime, setLastScanTime] = useState<number>(0);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);

  const bufferRef = useRef<string>('');
  const lastKeyTimeRef = useRef<number>(0);
  const isRapidTypingRef = useRef<boolean>(false);
  const lastScannedRef = useRef<string>('');
  const lastScannedTimeRef = useRef<number>(0);
  const onScanRef = useRef(onScan);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  const processScannedCode = useCallback((codeRaw: string) => {
    const code = codeRaw.trim();
    if (!code || code.length < minChars) return;

    const now = Date.now();
    // Ignore duplicate scan of identical code within cooldown window
    if (code === lastScannedRef.current && (now - lastScannedTimeRef.current) < cooldownMs) {
      return;
    }

    lastScannedRef.current = code;
    lastScannedTimeRef.current = now;
    setLastScanned(code);
    setLastScanTime(now);

    onScanRef.current(code);
  }, [minChars, cooldownMs]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore functional modifier keys (Ctrl, Alt, Meta)
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      const now = Date.now();
      const interval = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      const target = e.target as HTMLElement | null;
      const isInsideInput = target && (
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.tagName === 'SELECT' || 
        target.isContentEditable
      );

      // Check for Enter key (Standard termination of CLABEL / Barcode scanners)
      if (e.key === 'Enter') {
        // If we accumulated characters in buffer
        if (bufferRef.current.length >= minChars) {
          const captured = bufferRef.current;
          bufferRef.current = '';
          isRapidTypingRef.current = false;
          setIsCapturing(false);

          // If inside input but typing was at hardware scanner speed, prevent standard enter
          if (isInsideInput) {
            e.preventDefault();
            e.stopPropagation();
          }

          processScannedCode(captured);
          return;
        }

        // If inside an input that might have received scanner text directly
        if (isInsideInput && target instanceof HTMLInputElement) {
          const inputValue = target.value.trim();
          // If input has a tag like 'data-scanner-input' or user pressed Enter with barcode
          if (target.dataset.scannerInput === 'true' && inputValue.length >= minChars) {
            e.preventDefault();
            target.value = '';
            processScannedCode(inputValue);
            return;
          }
        }

        bufferRef.current = '';
        isRapidTypingRef.current = false;
        setIsCapturing(false);
        return;
      }

      // If printable character (length 1)
      if (e.key.length === 1) {
        // Check if characters are coming in rapid succession (hardware scanner behavior)
        if (interval <= maxKeyIntervalMs) {
          isRapidTypingRef.current = true;
          bufferRef.current += e.key;
          setIsCapturing(true);
        } else {
          // If slow typing:
          // If not inside an input, we treat this as start of new potential scan buffer
          if (!isInsideInput) {
            bufferRef.current = e.key;
            isRapidTypingRef.current = false;
            setIsCapturing(true);
          } else {
            // Inside input and slow typing = human typing, clear buffer
            bufferRef.current = '';
            isRapidTypingRef.current = false;
            setIsCapturing(false);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [enabled, maxKeyIntervalMs, minChars, processScannedCode]);

  return {
    lastScanned,
    lastScanTime,
    isCapturing,
    simulateScan: processScannedCode
  };
};
