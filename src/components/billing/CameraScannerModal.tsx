import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Modal } from '../common/Modal';
import { Camera, AlertCircle, Copy, Check, CheckCircle2, ArrowRight, SwitchCamera, Loader2 } from 'lucide-react';
import { Button } from '../common/Button';

interface CameraScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (barcode: string) => void;
}

const SUPPORTED_BARCODE_FORMATS = [
  Html5QrcodeSupportedFormats.CODE_128,
  Html5QrcodeSupportedFormats.EAN_13,
  Html5QrcodeSupportedFormats.EAN_8,
  Html5QrcodeSupportedFormats.UPC_A,
  Html5QrcodeSupportedFormats.UPC_E,
  Html5QrcodeSupportedFormats.CODE_39,
  Html5QrcodeSupportedFormats.CODE_93,
  Html5QrcodeSupportedFormats.ITF,
  Html5QrcodeSupportedFormats.QR_CODE,
  Html5QrcodeSupportedFormats.DATA_MATRIX,
];

// Audio beep feedback on successful scan
const playScanBeep = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(950, ctx.currentTime);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.16);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.16);
  } catch {
    // AudioContext may be restricted before user gesture
  }
};

// Fallback clipboard function that works even on insecure HTTP contexts on mobile
const copyToClipboard = async (text: string): Promise<boolean> => {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Continue to fallback
    }
  }

  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '-9999px';
    textArea.setAttribute('readonly', '');
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, 99999);
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Fallback copy failed', err);
    return false;
  }
};

export const CameraScannerModal: React.FC<CameraScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isFlagCopied, setIsFlagCopied] = useState(false);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [currentCameraIdx, setCurrentCameraIdx] = useState<number>(0);
  const [isLoadingCamera, setIsLoadingCamera] = useState(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'qr-reader-container';

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://172.16.2.188:5174';
  const flagUrl = 'chrome://flags/#unsafely-treat-insecure-origin-as-secure';

  const handleCopyOrigin = async () => {
    const success = await copyToClipboard(currentOrigin);
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  const handleCopyFlag = async () => {
    const success = await copyToClipboard(flagUrl);
    if (success) {
      setIsFlagCopied(true);
      setTimeout(() => setIsFlagCopied(false), 2500);
    }
  };

  const handleManualSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = manualCode.trim();
    if (!trimmed) return;
    playScanBeep();
    onScanSuccess(trimmed);
    onClose();
  };

  const stopCurrentScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (err) {
        console.warn('Scanner stop error (ignored):', err);
      }
      scannerRef.current = null;
    }
  }, []);

  const startScannerWithCamera = useCallback(
    async (cameraIndexToUse: number, cameraList: Array<{ id: string; label: string }>) => {
      await stopCurrentScanner();

      if (!window.isSecureContext) {
        setError('INSECURE_CONTEXT');
        return;
      }

      const container = document.getElementById(scannerContainerId);
      if (!container) return;

      setIsLoadingCamera(true);
      setError(null);

      try {
        // Standard Html5Qrcode instance without experimental features that cause blank screen
        const html5QrCode = new Html5Qrcode(scannerContainerId, {
          formatsToSupport: SUPPORTED_BARCODE_FORMATS,
          verbose: false,
        });
        scannerRef.current = html5QrCode;

        let hasHandledSuccess = false;

        const qrCodeSuccessCallback = (decodedText: string) => {
          if (hasHandledSuccess) return;
          hasHandledSuccess = true;

          playScanBeep();
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(120);
          }

          setScannedCode(decodedText);

          setTimeout(() => {
            onScanSuccess(decodedText);
            onClose();
          }, 350);
        };

        // Determine camera target: specific ID if camera list available, else { facingMode: 'environment' }
        let cameraConfig: any = { facingMode: 'environment' };
        if (cameraList && cameraList.length > 0) {
          const safeIndex = cameraIndexToUse % cameraList.length;
          cameraConfig = cameraList[safeIndex].id;
        }

        const scanConfig = {
          fps: 12,
          qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
            const minDim = Math.min(viewfinderWidth, viewfinderHeight);
            return {
              width: Math.min(Math.floor(viewfinderWidth * 0.88), 380),
              height: Math.min(Math.floor(minDim * 0.55), 220),
            };
          },
          disableFlip: false,
        };

        await html5QrCode.start(
          cameraConfig,
          scanConfig,
          qrCodeSuccessCallback,
          () => {} // suppress frame-by-frame debug failure
        );

        setIsLoadingCamera(false);
      } catch (err: any) {
        console.error('Camera scanner start error:', err);
        setIsLoadingCamera(false);
        setError(
          err.name === 'NotAllowedError'
            ? 'Camera permission was denied. Please tap the lock icon in the address bar to allow Camera access.'
            : err.message || 'Could not access camera. Please check camera permissions.'
        );
      }
    },
    [onClose, onScanSuccess, stopCurrentScanner]
  );

  const handleSwitchCamera = async () => {
    if (cameras.length <= 1) return;
    const nextIdx = (currentCameraIdx + 1) % cameras.length;
    setCurrentCameraIdx(nextIdx);
    await startScannerWithCamera(nextIdx, cameras);
  };

  useEffect(() => {
    let isMounted = true;

    if (isOpen) {
      setError(null);
      setScannedCode(null);
      setManualCode('');

      const timer = setTimeout(async () => {
        if (!isMounted) return;

        if (!window.isSecureContext) {
          setError('INSECURE_CONTEXT');
          return;
        }

        try {
          // Detect available camera devices
          let discoveredCameras: Array<{ id: string; label: string }> = [];
          try {
            discoveredCameras = await Html5Qrcode.getCameras();
          } catch (e) {
            console.warn('Unable to query camera list, will use facingMode:', e);
          }

          if (isMounted) {
            setCameras(discoveredCameras);

            // Prefer back/rear camera if multiple exist
            let initialIdx = 0;
            if (discoveredCameras.length > 0) {
              const backIdx = discoveredCameras.findIndex((c) =>
                /back|rear|environment/i.test(c.label)
              );
              if (backIdx !== -1) {
                initialIdx = backIdx;
              } else {
                initialIdx = discoveredCameras.length - 1;
              }
            }

            setCurrentCameraIdx(initialIdx);
            await startScannerWithCamera(initialIdx, discoveredCameras);
          }
        } catch (err: any) {
          if (isMounted) {
            console.error('Initial camera load error:', err);
            setError(err.message || 'Could not initialize camera scanner.');
          }
        }
      }, 250);

      return () => {
        isMounted = false;
        clearTimeout(timer);
        stopCurrentScanner();
      };
    } else {
      stopCurrentScanner();
    }
  }, [isOpen, startScannerWithCamera, stopCurrentScanner]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Scan Barcode with Camera / कैमरा स्कैनर" maxWidth="md">
      <div className="space-y-4">
        {error === 'INSECURE_CONTEXT' ? (
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-5 space-y-4 text-left">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl flex-shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-100">
                  Allow Camera on Local IP / कैमरा अनुमति
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Chrome blocks camera on HTTP IP addresses. Tap below to copy, then enable in Chrome:
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-1 text-xs">
              {/* Step 1 */}
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                <div className="font-bold text-emerald-400 flex items-center justify-between">
                  <span>Step 1: Open Chrome Settings Page</span>
                  {isFlagCopied && <span className="text-[11px] text-emerald-400 font-normal">Copied! ✓</span>}
                </div>
                <div
                  onClick={handleCopyFlag}
                  className="flex items-center justify-between bg-slate-900 hover:bg-slate-800/80 cursor-pointer p-2.5 rounded-lg border border-slate-700/60 transition-colors"
                >
                  <input
                    type="text"
                    readOnly
                    value={flagUrl}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.currentTarget.select();
                      handleCopyFlag();
                    }}
                    className="bg-transparent text-[11px] font-mono text-slate-200 w-full focus:outline-none cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyFlag();
                    }}
                    className="ml-2 flex items-center space-x-1 px-2.5 py-1 bg-emerald-600/30 text-emerald-300 rounded-md font-bold hover:bg-emerald-600/50 flex-shrink-0"
                  >
                    {isFlagCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isFlagCopied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Paste into a <strong>new tab</strong> in Chrome and hit Enter.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                <div className="font-bold text-emerald-400 flex items-center justify-between">
                  <span>Step 2: Add your IP to the box</span>
                  {isCopied && <span className="text-[11px] text-emerald-400 font-normal">Copied! ✓</span>}
                </div>
                <div
                  onClick={handleCopyOrigin}
                  className="flex items-center justify-between bg-slate-900 hover:bg-slate-800/80 cursor-pointer p-2.5 rounded-lg border border-slate-700/60 transition-colors"
                >
                  <input
                    type="text"
                    readOnly
                    value={currentOrigin}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.currentTarget.select();
                      handleCopyOrigin();
                    }}
                    className="bg-transparent text-xs font-mono text-slate-200 w-full focus:outline-none cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyOrigin();
                    }}
                    className="ml-2 flex items-center space-x-1 px-2.5 py-1 bg-emerald-600/30 text-emerald-300 rounded-md font-bold hover:bg-emerald-600/50 flex-shrink-0"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Paste this into the box titled <em>&quot;Insecure origins treated as secure&quot;</em>.
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
                <div className="font-bold text-emerald-400">Step 3: Enable & Relaunch Chrome</div>
                <p className="text-[11px] text-slate-300">
                  Select <strong>Enabled</strong> from the dropdown and tap the blue <strong>Relaunch</strong> button at the bottom.
                </p>
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={onClose} className="w-full">
              Close / बंद करें
            </Button>
          </div>
        ) : error ? (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Camera Access Error</p>
              <p className="text-xs mt-0.5">{error}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Viewfinder Frame */}
            <div className="relative rounded-2xl overflow-hidden bg-black border-2 border-emerald-500/50 shadow-lg shadow-emerald-950/30 min-h-[280px]">
              {/* Html5Qrcode Mount Node */}
              <div id={scannerContainerId} className="w-full min-h-[280px]" />

              {/* Loading Spinner */}
              {isLoadingCamera && (
                <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center space-y-2 z-10">
                  <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                  <span className="text-xs text-slate-300">Starting camera / कैमरा चालू हो रहा है...</span>
                </div>
              )}

              {/* Top Action Bar */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-auto">
                <div className="flex items-center space-x-1.5 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-full text-xs text-emerald-400 font-semibold shadow-md">
                  <Camera className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
                  <span>Align barcode inside box</span>
                </div>

                {cameras.length > 1 && (
                  <button
                    type="button"
                    onClick={handleSwitchCamera}
                    className="flex items-center space-x-1 bg-slate-900/90 hover:bg-slate-800 backdrop-blur-md px-3 py-1.5 rounded-full text-xs text-slate-200 border border-slate-700 shadow-md transition-colors"
                    title="Switch camera lens"
                  >
                    <SwitchCamera className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Switch Camera</span>
                  </button>
                )}
              </div>

              {/* Success Overlay */}
              {scannedCode && (
                <div className="absolute inset-0 bg-emerald-950/85 backdrop-blur-sm flex flex-col items-center justify-center text-center p-4 z-20 animate-in fade-in zoom-in-95">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-bounce mb-2" />
                  <span className="text-xs font-bold text-emerald-300 uppercase tracking-widest">
                    Barcode Detected!
                  </span>
                  <span className="text-base font-mono font-extrabold text-white mt-1">
                    {scannedCode}
                  </span>
                </div>
              )}
            </div>

            {/* Manual Code Input Fallback */}
            <div className="pt-2 border-t border-slate-800">
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Or enter barcode manually / या कोड टाइप करें
              </label>
              <form onSubmit={handleManualSubmit} className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="e.g. 890123456789"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <Button
                  type="submit"
                  size="sm"
                  variant="primary"
                  disabled={!manualCode.trim()}
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Enter
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
