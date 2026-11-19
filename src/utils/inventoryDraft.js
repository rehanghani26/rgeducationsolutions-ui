import { clientKey, dateInput, DEFAULT_ITEM, recordId, roundMoney } from './procurement.js';

export const MAX_CATALOG_ITEMS = 100;
export const MAX_ITEM_DOCUMENTS = 10;

export function makeInventoryDraft(item, presetId) {
  const vendor = typeof item?.vendorId === 'string' && item.vendorId
    ? { _id: item.vendorId, name: 'Linked vendor' }
    : item?.vendorId || null;
  const supplied = Object.keys(DEFAULT_ITEM).filter((field) => item?.[field] != null);
  return {
    key: clientKey(),
    presetId,
    vendor,
    values: {
      ...DEFAULT_ITEM,
      ...Object.fromEntries(supplied.map((field) => [field, item[field]])),
      discontinued: item?.status === 'discontinued',
      unitCost: item?.unitCost ?? item?.price ?? 0,
      actualPurchaseDate: dateInput(item?.actualPurchaseDate),
      vendorId: recordId(vendor) || item?.vendorId || null,
    },
  };
}

const stockNumbers = [
  ['minStockLevel', 'Low-stock threshold'],
  ['maxStockLevel', 'Maximum stock'],
  ['reorderQuantity', 'Reorder quantity'],
];

export function validateInventoryDrafts(rows, editing) {
  const skus = new Set();
  for (const { key, values } of rows) {
    const issue = (field, message) => ({ key, field, message });
    if (!values.name.trim()) return issue('name', 'Enter an item name.');
    const sku = values.sku.trim().toUpperCase();
    if (sku && skus.has(sku)) return issue('sku', 'Each item must have its own SKU.');
    if (sku) skus.add(sku);

    const numericFields = [
      ['unitCost', 'Unit cost'],
      ...(!editing ? [['quantity', 'Opening quantity']] : []),
      ...stockNumbers,
    ];
    for (const [field, label] of numericFields) {
      const number = Number(values[field]);
      if (String(values[field]).trim() === '' || !Number.isFinite(number) || number < 0 || number > 1e12) {
        return issue(field, label + ' must be a valid non-negative amount.');
      }
    }
    const gstRate = Number(values.gstRate);
    if (!Number.isFinite(gstRate) || gstRate < 0 || gstRate > 100) {
      return issue('gstRate', 'Enter a GST rate from 0 to 100.');
    }
    if (Number(values.maxStockLevel) < Number(values.minStockLevel)) {
      return issue('maxStockLevel', 'Maximum stock must be at least the low-stock threshold.');
    }
  }
  return null;
}

export function openingStockValue(rows) {
  return roundMoney(rows.reduce((sum, { values }) => sum +
    (Number(values.quantity) || 0) * (Number(values.unitCost) || 0), 0));
}
