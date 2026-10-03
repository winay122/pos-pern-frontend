import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

interface BarcodeImageProps {
  value: string;
  width?: number;
  height?: number;
  displayValue?: boolean;
  className?: string;
}

export const BarcodeImage: React.FC<BarcodeImageProps> = ({
  value,
  width = 1.8,
  height = 45,
  displayValue = true,
  className = '',
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (svgRef.current && value) {
      try {
        JsBarcode(svgRef.current, value, {
          format: 'CODE128',
          lineColor: '#000000',
          width,
          height,
          displayValue,
          font: 'monospace',
          fontSize: 13,
          textMargin: 2,
          margin: 6,
          background: '#ffffff',
        });
      } catch (err) {
        console.error('Failed to render barcode with JsBarcode:', err);
      }
    }
  }, [value, width, height, displayValue]);

  return <svg ref={svgRef} className={`mx-auto ${className}`} />;
};
