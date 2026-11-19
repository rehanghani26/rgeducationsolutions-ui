import React, { useState, useId, forwardRef } from 'react';
import { IndianRupee, X, AlertCircle, TrendingUp, Sparkles } from 'lucide-react';
import { Input } from './FormControls.jsx';

import { formatIndianNumber, numberToIndianWords, parseRawNumber, toCompactIndianCurrency } from '../../utils/currency.js';

export { formatIndianNumber, numberToIndianWords, parseRawNumber, toCompactIndianCurrency } from '../../utils/currency.js';

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
  const generatedId = useId();
  const inputId = id || generatedId;
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
        <Input
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

