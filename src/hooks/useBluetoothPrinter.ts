import { useState, useCallback } from 'react';
import { Sale } from '../types';
import { formatCurrency, formatDate } from '../utils/formatCurrency';

export function useBluetoothPrinter() {
  const [device, setDevice] = useState<any>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isBluetoothSupported = typeof navigator !== 'undefined' && 'bluetooth' in navigator;

  /**
   * Connect to a Bluetooth thermal printer
   */
  const connectPrinter = useCallback(async () => {
    if (!isBluetoothSupported) {
      setError('Web Bluetooth is not supported on this browser or platform.');
      return false;
    }

    try {
      setError(null);
      // Standard Bluetooth Thermal Printer service UUIDs
      const selectedDevice = await (navigator as any).bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          '000018f0-0000-1000-8000-00805f9b34fb', // Standard Printer service
          'e7810a71-73ae-499d-8c15-faa9aef0c3f2', // PosBank / ESC/POS
          '49535343-fe7d-4ae5-8fa9-9fafd205e455', // ISSC
        ],
      });

      await selectedDevice.gatt.connect();
      setDevice(selectedDevice);
      setIsConnected(true);

      selectedDevice.addEventListener('gattserverdisconnected', () => {
        setIsConnected(false);
        setDevice(null);
      });

      return true;
    } catch (err: any) {
      console.warn('Bluetooth connection cancelled or failed:', err);
      setError(err.message || 'Failed to connect Bluetooth printer');
      return false;
    }
  }, [isBluetoothSupported]);

  /**
   * Generate ESC/POS byte sequence for a receipt
   */
  const generateEscPosData = (sale: Sale, shopName: string, shopPhone: string): Uint8Array => {
    const encoder = new TextEncoder();
    const bytes: number[] = [];

    // ESC/POS Commands
    const ESC = 0x1b;
    const GS = 0x1d;

    // 1. Initialize printer: ESC @
    bytes.push(ESC, 0x40);

    // 2. Center align: ESC a 1
    bytes.push(ESC, 0x61, 0x01);

    // 3. Double height & width bold header for Shop Name
    bytes.push(ESC, 0x45, 0x01); // Bold ON
    bytes.push(GS, 0x21, 0x11); // Double size
    bytes.push(...encoder.encode(`${shopName}\n`));
    bytes.push(GS, 0x21, 0x00); // Normal size
    bytes.push(ESC, 0x45, 0x00); // Bold OFF

    if (shopPhone) {
      bytes.push(...encoder.encode(`Phone: ${shopPhone}\n`));
    }
    bytes.push(...encoder.encode(`Date: ${formatDate(sale.createdAt || new Date())}\n`));
    bytes.push(...encoder.encode(`Bill #: ${sale.clientGeneratedId.slice(-8).toUpperCase()}\n`));
    bytes.push(...encoder.encode('--------------------------------\n'));

    // 4. Left align for items: ESC a 0
    bytes.push(ESC, 0x61, 0x00);
    bytes.push(...encoder.encode('Item             Qty   Price   Total\n'));
    bytes.push(...encoder.encode('--------------------------------\n'));

    for (const item of sale.saleItems) {
      const name = (item.product?.name || 'Item').slice(0, 14).padEnd(14, ' ');
      const qty = `${item.quantity}`.padStart(4, ' ');
      const price = `${item.unitPriceAtSale}`.padStart(6, ' ');
      const subtotal = `${item.subtotal}`.padStart(6, ' ');
      bytes.push(...encoder.encode(`${name} ${qty} ${price} ${subtotal}\n`));
    }

    bytes.push(...encoder.encode('--------------------------------\n'));

    // 5. Right align for totals: ESC a 2
    bytes.push(ESC, 0x61, 0x02);
    bytes.push(ESC, 0x45, 0x01); // Bold ON
    bytes.push(...encoder.encode(`TOTAL: ${formatCurrency(sale.totalAmount)}\n`));
    bytes.push(ESC, 0x45, 0x00); // Bold OFF
    bytes.push(...encoder.encode(`Mode: ${sale.paymentMode}\n`));
    bytes.push(...encoder.encode('--------------------------------\n'));

    // 6. Center align footer: ESC a 1
    bytes.push(ESC, 0x61, 0x01);
    bytes.push(...encoder.encode('Thank You! Visit Again!\n'));
    bytes.push(...encoder.encode('धन्यवाद! फिर पधारें!\n\n\n'));

    // 7. Paper cut: GS V 66 0
    bytes.push(GS, 0x56, 0x42, 0x00);

    return new Uint8Array(bytes);
  };

  /**
   * Print receipt over Bluetooth, or trigger fallback browser print
   */
  const printReceipt = useCallback(
    async (sale: Sale, shopName: string = 'ViRa POS Store', shopPhone: string = '') => {
      setIsPrinting(true);
      setError(null);

      // If Bluetooth device is connected, stream raw ESC/POS commands
      if (device && isConnected && device.gatt?.connected) {
        try {
          const service = await device.gatt.getPrimaryServices();
          if (service.length > 0) {
            const characteristics = await service[0].getCharacteristics();
            const writableChar = characteristics.find((c: any) => c.properties.write || c.properties.writeWithoutResponse);

            if (writableChar) {
              const data = generateEscPosData(sale, shopName, shopPhone);
              // Send chunks of 512 bytes for reliable BLE transfer
              const chunkSize = 512;
              for (let i = 0; i < data.length; i += chunkSize) {
                const chunk = data.slice(i, i + chunkSize);
                if (writableChar.properties.writeWithoutResponse) {
                  await writableChar.writeValueWithoutResponse(chunk);
                } else {
                  await writableChar.writeValue(chunk);
                }
              }
              setIsPrinting(false);
              return true;
            }
          }
        } catch (err: any) {
          console.error('Bluetooth write failed:', err);
          setError(err.message || 'Failed to send data to Bluetooth printer');
        }
      }

      // Graceful degradation: Fallback to standard window.print() or on-screen receipt
      setIsPrinting(false);
      window.print();
      return true;
    },
    [device, isConnected]
  );

  return {
    isBluetoothSupported,
    isConnected,
    isPrinting,
    error,
    connectPrinter,
    printReceipt,
  };
}
