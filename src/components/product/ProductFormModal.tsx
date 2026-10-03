import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { Product, UnitType } from '../../types';
import { UNIT_LABELS } from '../../utils/unitLabels';
import { Sparkles, Camera } from 'lucide-react';
import { CameraScannerModal } from '../billing/CameraScannerModal';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: Product | null;
  isLoading?: boolean;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [unitType, setUnitType] = useState<UnitType>('PIECE');
  const [pricePerUnit, setPricePerUnit] = useState<string>('');
  const [barcodeValue, setBarcodeValue] = useState('');
  const [initialStock, setInitialStock] = useState<string>('0');
  const [lowStockThreshold, setLowStockThreshold] = useState<string>('5');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setCategory(initialData.category || '');
      setUnitType(initialData.unitType);
      setPricePerUnit(initialData.pricePerUnit.toString());
      setBarcodeValue(initialData.barcodeValue);
      setInitialStock(initialData.stock?.quantity?.toString() || '0');
      setLowStockThreshold(initialData.stock?.lowStockThreshold?.toString() || '5');
    } else {
      setName('');
      setCategory('General');
      setUnitType('PIECE');
      setPricePerUnit('');
      setBarcodeValue('');
      setInitialStock('0');
      setLowStockThreshold('5');
    }
    setError('');
  }, [initialData, isOpen]);

  const unitOptions = Object.entries(UNIT_LABELS).map(([key, value]) => ({
    value: key,
    label: value.label,
  }));

  const handleGenerateBarcode = () => {
    const timeSlice = Date.now().toString().slice(-6);
    const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString();
    setBarcodeValue(`89${timeSlice}${randomSuffix}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const price = parseFloat(pricePerUnit);
    if (isNaN(price) || price < 0) {
      setError('Please enter a valid price per unit');
      return;
    }

    try {
      await onSubmit({
        name,
        category: category || 'General',
        unitType,
        pricePerUnit: price,
        barcodeValue: barcodeValue ? barcodeValue.trim() : undefined,
        initialStock: parseFloat(initialStock) || 0,
        lowStockThreshold: parseFloat(lowStockThreshold) || 5,
      });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to save product');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Product / सामान बदलें' : 'Add New Product / नया सामान जोड़ें'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm">
            {error}
          </div>
        )}

        <Input
          label="Product Name / सामान का नाम"
          placeholder="e.g. Fortune Mustard Oil 1L / Parle-G"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Category / श्रेणी"
            placeholder="e.g. Kirana, Oil, Biscuits"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />

          <Select
            label="Unit Type / माप की इकाई"
            options={unitOptions}
            value={unitType}
            onChange={(e) => setUnitType(e.target.value as UnitType)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={`Price per ${UNIT_LABELS[unitType]?.short || 'unit'} (₹)`}
            type="number"
            step="any"
            min="0"
            placeholder="0.00"
            value={pricePerUnit}
            onChange={(e) => setPricePerUnit(e.target.value)}
            required
          />

          {!initialData ? (
            <Input
              label="Initial Stock Quantity (शुरुआती स्टॉक)"
              type="number"
              step="any"
              min="0"
              value={initialStock}
              onChange={(e) => setInitialStock(e.target.value)}
            />
          ) : (
            <Input
              label="Low Stock Warning Limit"
              type="number"
              step="any"
              min="0"
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(e.target.value)}
            />
          )}
        </div>

        {/* Barcode Field with Auto Generator button */}
        <div>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Input
                label="Barcode / Barcode Number (Optional)"
                placeholder="Scan or leave blank to auto-generate"
                value={barcodeValue}
                onChange={(e) => setBarcodeValue(e.target.value)}
                helperText="Leave empty to automatically assign a new 12-digit barcode"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsScannerOpen(true)}
              leftIcon={<Camera className="w-4 h-4 text-emerald-400" />}
              className="h-[48px] px-3 text-xs mb-1"
              title="Scan with Camera"
            >
              Scan
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleGenerateBarcode}
              leftIcon={<Sparkles className="w-4 h-4" />}
              className="h-[48px] px-3 text-xs mb-1"
              title="Auto-generate 12-digit barcode"
            >
              Generate
            </Button>
          </div>
        </div>

        {/* Camera Scanner Modal for Product Form */}
        <CameraScannerModal
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          onScanSuccess={(code) => setBarcodeValue(code)}
        />

        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {initialData ? 'Update Product' : 'Save Product / सुरक्षित करें'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
