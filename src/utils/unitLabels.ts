import { UnitType, ShopCategory } from '../types';

export const UNIT_LABELS: Record<UnitType, { label: string; short: string; step: number }> = {
  PIECE: { label: 'Piece / नग', short: 'pc', step: 1 },
  KG: { label: 'Kilogram / किलो', short: 'kg', step: 0.1 },
  GRAM: { label: 'Gram / ग्राम', short: 'gm', step: 50 },
  LITER: { label: 'Liter / लीटर', short: 'L', step: 0.5 },
  ML: { label: 'Milliliter / मिलीलीटर', short: 'ml', step: 50 },
  DOZEN: { label: 'Dozen / दर्जन', short: 'dz', step: 1 },
  LOT: { label: 'Lot / लॉट', short: 'lot', step: 1 },
  QUINTAL: { label: 'Quintal / क्विंटल', short: 'qtl', step: 1 },
  BAG: { label: 'Bag / बोरी', short: 'bag', step: 1 },
  TEN_PIECE: { label: '10 Pieces / 10 नग', short: '10pc', step: 1 },
};

export const SHOP_CATEGORY_LABELS: Record<ShopCategory, string> = {
  GENERAL_STORE: 'General Store / किराना दुकान',
  CLOTH: 'Cloth & Garments / कपड़ा दुकान',
  COSMETICS: 'Cosmetics & Beauty / सौंदर्य प्रसाधन',
  OTHER: 'Other Retail / अन्य दुकान',
};
