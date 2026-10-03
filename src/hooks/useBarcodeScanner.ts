import { useEffect, useRef } from 'react';

interface UseBarcodeScannerOptions {
  onScan: (barcode: string) => void;
  minChars?: number;
  maxIntervalMs?: number;
  disabled?: boolean;
}

/**
 * Listens for rapid sequential keystrokes ending in Enter key (standard HID barcode scanner protocol)
 * Compatible with USB barcode guns and Bluetooth handheld scanners.
 */
export function useBarcodeScanner({
  onScan,
  minChars = 3,
  maxIntervalMs = 50,
  disabled = false,
}: UseBarcodeScannerOptions) {
  const bufferRef = useRef<string>('');
  const lastKeyTimeRef = useRef<number>(0);

  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if active element is a normal text input/textarea and user is typing slowly
      const activeTag = document.activeElement?.tagName.toLowerCase();
      const isInputFocused = activeTag === 'input' || activeTag === 'textarea';

      const now = Date.now();
      const elapsed = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      // If key is Enter, evaluate the scanned buffer
      if (e.key === 'Enter') {
        const scannedText = bufferRef.current.trim();
        bufferRef.current = '';

        if (scannedText.length >= minChars) {
          e.preventDefault();
          onScan(scannedText);
        }
        return;
      }

      // Ignore modifier keys
      if (e.key.length > 1) return;

      // If time interval between keystrokes is too long (human typing speed), reset buffer
      if (elapsed > maxIntervalMs && bufferRef.current.length > 0 && isInputFocused) {
        bufferRef.current = '';
      }

      bufferRef.current += e.key;
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onScan, minChars, maxIntervalMs, disabled]);
}
