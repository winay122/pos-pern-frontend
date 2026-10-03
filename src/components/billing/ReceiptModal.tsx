import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Sale } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatCurrency';
import { useAuthStore } from '../../store/authStore';
import { useBluetoothPrinter } from '../../hooks/useBluetoothPrinter';
import { Printer, Bluetooth, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, sale }) => {
  const { shop } = useAuthStore();
  const {
    isBluetoothSupported,
    isConnected,
    isPrinting,
    error,
    connectPrinter,
    printReceipt,
  } = useBluetoothPrinter();

  if (!sale) return null;

  const handlePrint = async () => {
    await printReceipt(sale, shop?.shopName || 'ViRa POS Retail', shop?.phoneNumber || '');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Receipt / बिल रसीद" maxWidth="md">
      <div className="space-y-4">
        {/* Success Alert */}
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3.5 flex items-center space-x-2 text-emerald-400">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-bold">Sale Completed Successfully! (बिल पूर्ण हुआ)</span>
        </div>

        {error && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-amber-400 text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Thermal Receipt Visual Preview */}
        <div className="bg-white text-slate-950 p-5 rounded-2xl font-mono text-xs shadow-inner border border-slate-300">
          <div className="text-center space-y-0.5">
            <h3 className="text-base font-black uppercase tracking-wide">
              {shop?.shopName || 'ViRa POS Store'}
            </h3>
            <p className="text-[11px] text-gray-600 font-semibold">{shop?.ownerName}</p>
            {shop?.phoneNumber && <p className="text-[10px] text-gray-500">Phone: {shop.phoneNumber}</p>}
            <p className="text-[10px] text-gray-500">Date: {formatDate(sale.createdAt || new Date())}</p>
            <p className="text-[10px] text-gray-500">
              Bill ID: {sale.clientGeneratedId.slice(-8).toUpperCase()}
            </p>
          </div>

          <div className="border-b-2 border-dashed border-gray-400 my-3" />

          <div className="space-y-1.5">
            <div className="flex justify-between font-bold text-gray-700 text-[11px]">
              <span>Item</span>
              <span>Qty x Price = Subtotal</span>
            </div>
            {sale.saleItems.map((item, idx) => (
              <div key={idx} className="flex justify-between text-gray-900">
                <span className="font-semibold truncate max-w-[140px]">{item.product?.name || 'Item'}</span>
                <span>
                  {item.quantity} x {item.unitPriceAtSale} = {formatCurrency(item.subtotal)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-b-2 border-dashed border-gray-400 my-3" />

          <div className="space-y-1">
            <div className="flex justify-between text-sm font-black text-gray-950">
              <span>TOTAL AMOUNT</span>
              <span>{formatCurrency(sale.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-[11px] font-bold text-gray-700">
              <span>Payment Mode</span>
              <span>{sale.paymentMode}</span>
            </div>
          </div>

          <div className="border-b-2 border-dashed border-gray-400 my-3" />

          <div className="text-center text-[10px] text-gray-600 font-bold space-y-0.5">
            <p>Thank You! Visit Again!</p>
            <p>धन्यवाद! फिर पधारें!</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          {/* Bluetooth Connect / Status */}
          {isBluetoothSupported && (
            <Button
              variant={isConnected ? 'success' : 'outline'}
              size="md"
              onClick={connectPrinter}
              leftIcon={<Bluetooth className="w-4 h-4" />}
              className="flex-1 text-xs"
            >
              {isConnected ? 'Printer Connected' : 'Pair BT Thermal Printer'}
            </Button>
          )}

          {/* Print Button */}
          <Button
            variant="primary"
            size="md"
            isLoading={isPrinting}
            onClick={handlePrint}
            leftIcon={<Printer className="w-4 h-4" />}
            className="flex-1 text-sm font-bold"
          >
            Print Receipt / प्रिंट करें
          </Button>
        </div>

        <Button
          variant="secondary"
          size="md"
          onClick={onClose}
          leftIcon={<Sparkles className="w-4 h-4" />}
          className="w-full"
        >
          New Bill / अगला बिल बनाएं
        </Button>
      </div>
    </Modal>
  );
};
