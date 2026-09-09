import { forwardRef, memo } from 'react';

/**
 * FormInput — Standard labeled text input component.
 *
 * Props:
 *   id           : string
 *   name         : string
 *   label        : string
 *   type         : 'text' | 'email' | 'password' | 'number' | 'date' | 'tel' (default: 'text')
 *   value        : string | number
 *   onChange     : fn(e)
 *   placeholder  : string
 *   errorMessage : string
 *   required     : boolean
 *   disabled     : boolean
 *   readOnly     : boolean
 *   icon         : ReactNode — left icon inside input
 *   iconRight    : ReactNode — right icon inside input
 *   limit        : number — character limit, shows counter
 *   className    : string — wrapper class
 *   inputClassName : string — input element class
 */
const FormInput = forwardRef(
  (
    {
      id = '',
      name = '',
      label = '',
      type = 'text',
      value = '',
      onChange = () => {},
      onKeyDown = () => {},
      onBlur = () => {},
      placeholder = '',
      errorMessage = '',
      required = false,
      disabled = false,
      readOnly = false,
      icon = null,
      iconRight = null,
      limit,
      className = '',
      inputClassName = '',
      autoComplete = 'off',
      min,
      max,
      step,
      rows,
    },
    ref
  ) => {
    const hasError = !!errorMessage;
    const remaining = limit ? Math.max(0, limit - String(value || '').length) : null;

    const baseBorder = hasError
      ? 'border border-rose-500 focus:ring-rose-500/20'
      : 'border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20';

    const baseInput = [
      'w-full bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100',
      'rounded-lg text-xs py-2.5 outline-none transition-all duration-150',
      'focus:ring-2 placeholder:text-slate-400 dark:placeholder:text-slate-500',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      baseBorder,
      icon ? 'pl-10 pr-4' : 'px-4',
      iconRight ? 'pr-10' : '',
      inputClassName,
    ]
      .filter(Boolean)
      .join(' ');

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
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
              {icon}
            </span>
          )}

          {readOnly ? (
            <div
              className={`${baseBorder} rounded-lg px-4 py-2.5 text-xs bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400`}
            >
              {value || 'Not specified'}
            </div>
          ) : (
            <input
              ref={null}
              id={id || name}
              name={name}
              type={type}
              value={value}
              onChange={onChange}
              onKeyDown={onKeyDown}
              onBlur={onBlur}
              placeholder={placeholder}
              required={required}
              disabled={disabled}
              readOnly={readOnly}
              autoComplete={autoComplete}
              min={min}
              max={max}
              step={step}
              className={baseInput}
            />
          )}

          {iconRight && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
              {iconRight}
            </span>
          )}
        </div>

        {/* Error Message */}
        {hasError && (
          <p className="text-[10px] text-rose-500 font-semibold">{errorMessage}</p>
        )}

        {/* Character Counter */}
        {!hasError && limit !== undefined && remaining !== null && (
          <p className="text-[10px] text-slate-400">
            {remaining} character{remaining !== 1 ? 's' : ''} left
          </p>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';

export default memo(FormInput);
