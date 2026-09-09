import { forwardRef, memo } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * FormSelect — Standard labeled select/dropdown component.
 *
 * Props:
 *   id           : string
 *   name         : string
 *   label        : string
 *   value        : string | number
 *   onChange     : fn(e)
 *   options      : Array<{ value, label }> | Array<string>
 *   placeholder  : string  (default option text)
 *   errorMessage : string
 *   required     : boolean
 *   disabled     : boolean
 *   readOnly     : boolean
 *   className    : string — wrapper class
 *   selectClassName : string
 */
const FormSelect = forwardRef(
  (
    {
      id = '',
      name = '',
      label = '',
      value = '',
      onChange = () => {},
      options = [],
      placeholder = '',
      errorMessage = '',
      required = false,
      disabled = false,
      readOnly = false,
      className = '',
      selectClassName = '',
    },
    ref
  ) => {
    const hasError = !!errorMessage;

    const baseBorder = hasError
      ? 'border border-rose-500 focus:ring-rose-500/20'
      : 'border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20';

    const placeholderText =
      placeholder || (label ? `Select ${label.toLowerCase()}` : 'Select...');

    return (
      <div className={`space-y-1 ${className}`} ref={ref}>
        {label && (
          <label
            htmlFor={id || name}
            className="block text-xs font-semibold text-slate-600 dark:text-slate-300"
          >
            {label}
            {required && <span className="text-rose-500 ml-0.5">*</span>}
          </label>
        )}

        <div className="relative">
          {readOnly ? (
            <div
              className={`${baseBorder} rounded-lg px-4 py-2.5 text-xs bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400`}
            >
              {value || 'Not specified'}
            </div>
          ) : (
            <>
              <select
                id={id || name}
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                disabled={disabled}
                className={[
                  'w-full appearance-none bg-slate-50 dark:bg-slate-800/60',
                  'text-slate-900 dark:text-slate-100 rounded-lg text-xs px-4 py-2.5 pr-9',
                  'outline-none transition-all duration-150 focus:ring-2',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  baseBorder,
                  selectClassName,
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <option value="" disabled>
                  {placeholderText}
                </option>
                {options.map((opt, idx) => {
                  const val = typeof opt === 'object' ? opt.value : opt;
                  const lbl = typeof opt === 'object' ? opt.label : opt;
                  return (
                    <option key={idx} value={val}>
                      {lbl}
                    </option>
                  );
                })}
                {options.length === 0 && (
                  <option disabled>No options available</option>
                )}
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </>
          )}
        </div>

        {hasError && (
          <p className="text-[10px] text-rose-500 font-semibold">{errorMessage}</p>
        )}
      </div>
    );
  }
);

FormSelect.displayName = 'FormSelect';

export default memo(FormSelect);
