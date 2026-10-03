import React, { useState, useRef, useEffect } from 'react';
import { Barcode, Search, Camera, CornerDownLeft } from 'lucide-react';
import { Button } from '../common/Button';

interface ScannerInputProps {
  onScan: (barcode: string) => void;
  onSearchChange: (search: string) => void;
  searchQuery: string;
  onOpenCamScanner: () => void;
}

export const ScannerInput: React.FC<ScannerInputProps> = ({
  onScan,
  onSearchChange,
  searchQuery,
  onOpenCamScanner,
}) => {
  const [manualBarcode, setManualBarcode] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep input focused for instant barcode gun scanning
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = manualBarcode.trim();
    if (clean) {
      onScan(clean);
      setManualBarcode('');
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xl flex flex-col sm:flex-row items-center gap-3">
      {/* Fast Barcode Input (Gun scanner + Manual typing) */}
      <form onSubmit={handleBarcodeSubmit} className="flex-1 w-full flex items-center gap-2">
        <div className="relative flex-1">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400">
            <Barcode className="w-5 h-5" />
          </div>
          <input
            ref={inputRef}
            type="text"
            placeholder="Scan Barcode or Type & Press Enter / बारकोड स्कैन करें..."
            value={manualBarcode}
            onChange={(e) => setManualBarcode(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-11 pr-12 py-3 text-slate-100 placeholder-slate-500 text-sm sm:text-base font-mono focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
          <button
            type="submit"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 rounded-lg transition-colors"
            title="Submit Barcode"
          >
            <CornerDownLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Camera fallback button */}
        <Button
          type="button"
          variant="outline"
          onClick={onOpenCamScanner}
          leftIcon={<Camera className="w-4 h-4" />}
          className="h-[46px] px-3.5 whitespace-nowrap text-xs sm:text-sm"
          title="Open camera scanner"
        >
          Camera
        </Button>
      </form>

      {/* Manual Search by Name Filter */}
      <div className="w-full sm:w-64 relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          placeholder="Search by name / नाम से खोजें..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-slate-600"
        />
      </div>
    </div>
  );
};
