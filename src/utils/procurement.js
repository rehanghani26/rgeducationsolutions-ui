import { optionsFromValues } from './formOptions.js';

export const recordId = (record) => record?._id || record?.id || '';
export const apiMessage = (error) => error.response?.data?.message || error.message || 'Please try again.';
export const invoiceNumber = (bill) => bill.supplierBillNumber || bill.billNumber;
export const VENDOR_CATEGORIES = ['Stationery', 'Lab Equipment', 'IT Hardware', 'Sports', 'Uniforms', 'Medical', 'Furniture', 'General'];
export const VENDOR_STATUSES = ['active', 'inactive', 'blacklisted'];
export const VENDOR_STATUS_OPTIONS = optionsFromValues(VENDOR_STATUSES, (status) => status[0].toUpperCase() + status.slice(1));
export const PAYMENT_TERMS = ['Immediate', 'Net 15', 'Net 30', 'Net 60', 'Advance'];
export const PAYMENT_METHODS = ['Bank Transfer', 'UPI', 'Cash', 'Cheque'];
export const CREDIT_METHOD = 'Credit / On Account';
export const roundMoney = (amount) => Math.round((amount + Number.EPSILON) * 100) / 100;
export const clientKey = () => globalThis.crypto?.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).slice(2);

export const STOCK_LABELS = {
  'in-stock': 'In stock',
  'low-stock': 'Low stock',
  'out-of-stock': 'Out of stock',
  discontinued: 'Discontinued',
};

export const MOVEMENT_LABELS = {
  STOCK_OPENING: 'Opening stock',
  STOCK_IN_PURCHASE: 'Vendor receipt',
  STOCK_ADJUST_ADD: 'Stock added',
  STOCK_ADJUST_REMOVE: 'Stock removed',
  STOCK_OUT_CLASS: 'Class issue',
  STOCK_OUT_STUDENT: 'Student issue',
  STOCK_OUT_TEACHER: 'Staff issue',
  RETURN_TO_VENDOR: 'Returned to vendor',
  RETURN_FROM_CLASS: 'Returned from class',
};

export const DEFAULT_ITEM = {
  name: '', sku: '', category: 'General', subcategory: '', brand: '', barcode: '',
  unit: 'pcs', unitCost: 0, gstRate: 0, quantity: 0, location: 'Main Store', storageBin: '',
  minStockLevel: 5, maxStockLevel: 1000, reorderQuantity: 20, description: '', imageUrl: '',
  discontinued: false,
};

export function todayInput() {
  const date = new Date();
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export const dateInput = (value) => value ? String(value).slice(0, 10) : '';

export function defaultSession(sessions) {
  return sessions.find((session) => session.isCurrent) || sessions.find((session) => session.status === 'active');
}

export const sessionOptions = (sessions, showCurrent = false) => sessions.map((session) => ({
  value: recordId(session),
  label: session.sessionName + (showCurrent && session.isCurrent ? ' (current)' : ''),
}));

export function invoiceDueDate(dateStr, terms) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  date.setUTCDate(date.getUTCDate() + ({ 'Net 15': 15, 'Net 30': 30, 'Net 60': 60 }[terms] || 0));
  return date.toISOString().slice(0, 10);
}

export function purchaseTotals(lines, details) {
  const subtotal = roundMoney(lines.reduce((sum, line) => sum + roundMoney(Number(line.quantity) * Number(line.unitCost)), 0));
  const calculatedTax = roundMoney(lines.reduce((sum, line) => {
    const cost = roundMoney(Number(line.quantity) * Number(line.unitCost));
    return sum + roundMoney(cost * Number(line.gstRate) / 100);
  }, 0));
  const tax = details.taxAmount === '' ? calculatedTax : Number(details.taxAmount);
  const total = roundMoney(subtotal + tax + Number(details.shippingCharges) + Number(details.otherCharges) - Number(details.discountAmount));
  return { subtotal, tax, total };
}
