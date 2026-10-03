import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Product } from '../../types';
import { Printer, Copy, Check } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import { UNIT_LABELS } from '../../utils/unitLabels';
import { useAuthStore } from '../../store/authStore';
import { BarcodeImage } from '../common/BarcodeImage';

interface BarcodePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export const BarcodePrintModal: React.FC<BarcodePrintModalProps> = ({ isOpen, onClose, product }) => {
  const { shop } = useAuthStore();
  const [copyCount, setCopyCount] = useState<number>(4);
  const [copied, setCopied] = useState(false);

  if (!product) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyBarcode = () => {
    navigator.clipboard.writeText(product.barcodeValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Print Barcode Labels / बारकोड प्रिंट करें" maxWidth="lg">
      <div className="space-y-6">
        {/* Controls */}
        <div className="flex items-center justify-between bg-slate-800/60 p-4 rounded-xl border border-slate-700">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Sticker Copies to Print</label>
            <input
              type="number"
              min="1"
              max="24"
              value={copyCount}
              onChange={(e) => setCopyCount(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-center"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyBarcode}
              leftIcon={copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            >
              {copied ? 'Copied' : 'Copy Code'}
            </Button>
            <Button variant="primary" size="sm" onClick={handlePrint} leftIcon={<Printer className="w-4 h-4" />}>
              Print Sheet / प्रिंट करें
            </Button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="print-area bg-white text-black p-4 rounded-xl shadow-inner overflow-hidden">
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: copyCount }).map((_, idx) => (
              <div
                key={idx}
                className="border-2 border-dashed border-gray-400 p-3 rounded-lg flex flex-col items-center text-center justify-center bg-white min-h-[140px]"
              >
                <div className="text-[10px] uppercase tracking-wider font-extrabold text-gray-700">
                  {shop?.shopName || 'ViRa Store'}
                </div>
                <div className="text-xs font-bold text-gray-900 truncate max-w-[150px] mt-0.5">
                  {product.name}
                </div>
                {/* Genuine Scannable CODE128 Barcode */}
                <div className="my-1.5 flex flex-col items-center max-w-[200px]">
                  <BarcodeImage value={product.barcodeValue} width={1.5} height={38} />
                </div>
                <div className="text-sm font-extrabold text-gray-950">
                  {formatCurrency(product.pricePerUnit)} / {UNIT_LABELS[product.unitType]?.short || 'unit'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};
