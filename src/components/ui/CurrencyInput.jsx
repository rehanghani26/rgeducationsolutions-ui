import React, { useState, useEffect, useId, forwardRef } from 'react';
import { IndianRupee, X, AlertCircle, TrendingUp, Sparkles } from 'lucide-react';

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

/**
 * CurrencyInput / RupeesInput Component
 *
 * Props:
 *   - value: number | string
 *   - onChange: function(numericValueOrEvent)
 *   - name: string
 *   - label: string
 *   - helperText: string
 *   - placeholder: string
 *   - required: boolean
 *   - disabled: boolean
 *   - readOnly: boolean
 *   - min: number
 *   - max: number
 *   - step: number
 *   - showWords: boolean (default: true for amounts >= 10,000)
 *   - showCompactBadge: boolean (default: true)
 *   - quickPresets: number[] (optional quick addition chips, e.g. [10000, 50000, 100000])
 *   - size: 'sm' | 'md' | 'lg'
 *   - error: string
 *   - className: string
 */
export const CurrencyInput = forwardRef(({
  value,
  onChange,
  name,
  id,
  label,
  helperText,
  placeholder = '0',
  required = false,
  disabled = false,
  readOnly = false,
  min = 0,
  max,
  step,
  showWords = true,
  showCompactBadge = true,
  quickPresets,
  size = 'md',
  error,
  className = '',
  autoFocus = false,
  ...rest
}, ref) => {
  const inputId = id || useId();
  const [isFocused, setIsFocused] = useState(false);

  // Sync internal display string
  const rawNum = value !== undefined && value !== null ? String(value) : '';
  const displayValue = isFocused ? rawNum : formatIndianNumber(rawNum);

  const numVal = Number(rawNum) || 0;
  const inWords = numVal >= 1000 ? numberToIndianWords(numVal) : '';
  const compactBadge = numVal >= 1000 ? toCompactIndianCurrency(numVal) : null;

  const handleInputChange = (e) => {
    const raw = parseRawNumber(e.target.value);
    const num = raw === '' ? '' : Number(raw);

    // Call onChange with synthetic event or raw value compatible with standard form handlers
    if (onChange) {
      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          name: name || e.target.name,
          value: num,
          rawValue: raw,
        },
      };
      // Handle both event-based `onChange(e)` and direct-value `onChange(num)`
      if (typeof onChange === 'function') {
        onChange(syntheticEvent);
      }
    }
  };

  const handleClear = () => {
    if (disabled || readOnly) return;
    if (onChange) {
      const syntheticEvent = {
        target: {
          name: name || '',
          value: 0,
          rawValue: '0',
        },
      };
      onChange(syntheticEvent);
    }
  };

  const handlePresetClick = (amount) => {
    if (disabled || readOnly) return;
    const current = Number(rawNum) || 0;
    const updated = current + amount;
    if (onChange) {
      const syntheticEvent = {
        target: {
          name: name || '',
          value: updated,
          rawValue: String(updated),
        },
      };
      onChange(syntheticEvent);
    }
  };

  // Size styling maps
  const sizeClasses = {
    sm: 'py-1.5 px-3 text-xs',
    md: 'py-2.5 px-3.5 text-xs',
    lg: 'py-3 px-4 text-sm',
  };

  const prefixPadding = {
    sm: 'pl-8',
    md: 'pl-10',
    lg: 'pl-11',
  };

  const iconSizes = {
    sm: 13,
    md: 15,
    lg: 17,
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Label & Compact Badge */}
      {(label || (showCompactBadge && compactBadge)) && (
        <div className="flex items-center justify-between gap-2">
          {label && (
            <label
              htmlFor={inputId}
              className="block text-xs font-bold text-slate-800 dark:text-slate-200 select-none cursor-pointer"
            >
              {label} {required && <span className="text-rose-500">*</span>}
            </label>
          )}

          {showCompactBadge && compactBadge && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black tracking-wide bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 select-none"
              title="Compact Indian denomination"
            >
              <Sparkles size={10} className="text-emerald-500" />
              <span>{compactBadge}</span>
            </span>
          )}
        </div>
      )}

      {/* Input Box Wrapper */}
      <div className="relative group">
        {/* Rupee Symbol / Icon Prefix Badge */}
        <div
          className={`absolute left-0 top-0 bottom-0 flex items-center justify-center pl-3 pr-2 select-none pointer-events-none transition-colors ${
            isFocused
              ? 'text-orange-500 dark:text-orange-400'
              : error
              ? 'text-rose-500'
              : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
          }`}
        >
          <IndianRupee size={iconSizes[size]} strokeWidth={2.75} />
        </div>

        {/* The Input Element */}
        <input
          ref={ref}
          id={inputId}
          name={name}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder={placeholder}
          value={displayValue}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          autoFocus={autoFocus}
          className={`w-full bg-slate-50 dark:bg-slate-800/90 border rounded-xl font-black transition-all ${
            prefixPadding[size]
          } ${sizeClasses[size]} ${
            numVal > 0
              ? 'text-slate-900 dark:text-white'
              : 'text-slate-400 dark:text-slate-500'
          } ${
            error
              ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500'
              : isFocused
              ? 'border-orange-500 ring-2 ring-orange-500/20 bg-white dark:bg-slate-900'
              : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600'
          } ${
            disabled ? 'opacity-60 cursor-not-allowed bg-slate-100 dark:bg-slate-800/50' : ''
          }`}
          {...rest}
        />

        {/* Clear Button */}
        {!disabled && !readOnly && numVal > 0 && (
          <button
            type="button"
            onClick={handleClear}
            title="Clear amount"
            tabIndex={-1}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Helper text / Spelled-out words in Lakhs & Crores / Error message */}
      <div className="flex flex-col gap-0.5 pt-0.5">
        {error ? (
          <p className="text-[11px] font-bold text-rose-500 flex items-center gap-1">
            <AlertCircle size={11} className="shrink-0" /> {error}
          </p>
        ) : showWords && inWords ? (
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 italic truncate" title={inWords}>
            🗣️ {inWords} only
          </p>
        ) : helperText ? (
          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">{helperText}</p>
        ) : null}

        {/* Quick Increment Preset Chips */}
        {quickPresets && quickPresets.length > 0 && !disabled && !readOnly && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 mr-0.5">
              Quick +
            </span>
            {quickPresets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handlePresetClick(preset)}
                className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 hover:bg-orange-50 dark:bg-slate-800 dark:hover:bg-orange-950/40 text-slate-600 hover:text-orange-600 dark:text-slate-300 dark:hover:text-orange-400 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
              >
                +{toCompactIndianCurrency(preset)}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

CurrencyInput.displayName = 'CurrencyInput';

// Re-export as RupeesInput for convenience and intuitive nomenclature
export const RupeesInput = CurrencyInput;
export default CurrencyInput;

