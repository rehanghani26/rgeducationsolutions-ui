/**
 * Converts a number into Indian currency words representation
 * e.g. 1000000 -> "Ten Lakh Rupees"
 */
export const numberToIndianWords = (num) => {
  const n = Math.floor(Number(num) || 0);
  if (n <= 0) return '';
  if (n > 999999999) return 'Value exceeds 99 Crore';

  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convertTwoDigits = (val) => {
    if (val < 10) return units[val];
    if (val >= 10 && val < 20) return teens[val - 10];
    return `${tens[Math.floor(val / 10)]} ${units[val % 10]}`.trim();
  };

  const convertThreeDigits = (val) => {
    const h = Math.floor(val / 100);
    const rest = val % 100;
    const hStr = h > 0 ? `${units[h]} Hundred` : '';
    const restStr = convertTwoDigits(rest);
    if (hStr && restStr) return `${hStr} and ${restStr}`;
    return hStr || restStr;
  };

  const crore = Math.floor(n / 10000000);
  const lakh = Math.floor((n % 10000000) / 100000);
  const thousand = Math.floor((n % 100000) / 1000);
  const hundred = n % 1000;

  const parts = [];
  if (crore > 0) parts.push(`${convertTwoDigits(crore)} Crore`);
  if (lakh > 0) parts.push(`${convertTwoDigits(lakh)} Lakh`);
  if (thousand > 0) parts.push(`${convertTwoDigits(thousand)} Thousand`);
  if (hundred > 0) parts.push(convertThreeDigits(hundred));

  return `${parts.join(' ')} Rupees`.trim();
};

/**
 * Formats a number with Indian thousand/lakh/crore separators
 * e.g. 1000000 -> "10,00,000"
 */
export const formatIndianNumber = (val) => {
  if (val === null || val === undefined || val === '') return '';
  const numStr = String(val).replace(/[^0-9.]/g, '');
  if (!numStr) return '';
  const parts = numStr.split('.');
  let integerPart = parts[0];
  const decimalPart = parts.length > 1 ? `.${parts[1].slice(0, 2)}` : '';

  // Indian currency formatting: last 3 digits, then groups of 2
  if (integerPart.length > 3) {
    const lastThree = integerPart.substring(integerPart.length - 3);
    const otherNumbers = integerPart.substring(0, integerPart.length - 3);
    integerPart = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
  }
  return integerPart + decimalPart;
};

/**
 * Strips commas and non-numeric characters to get pure numeric value
 */
export const parseRawNumber = (formattedStr) => {
  if (!formattedStr && formattedStr !== 0) return '';
  const clean = String(formattedStr).replace(/,/g, '').replace(/[^0-9.]/g, '');
  return clean;
};

/**
 * Compact Indian Lakhs / Crores string
 * e.g. 1500000 -> "₹15 Lakh"
 */
export const toCompactIndianCurrency = (val) => {
  const n = Number(val) || 0;
  if (n <= 0) return null;
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2).replace(/\.00$/, '')} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2).replace(/\.00$/, '')} Lakh`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return `₹${n.toLocaleString('en-IN')}`;
};
