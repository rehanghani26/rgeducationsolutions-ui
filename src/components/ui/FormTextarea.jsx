import { forwardRef, memo } from 'react';

/**
 * FormTextarea — Standard labeled textarea component.
 *
 * Props:
 *   id           : string
 *   name         : string
 *   label        : string
 *   value        : string
 *   onChange     : fn(e)
 *   placeholder  : string
 *   errorMessage : string
 *   required     : boolean
 *   disabled     : boolean
 *   readOnly     : boolean
 *   rows         : number (default: 4)
 *   limit        : number — character limit, shows counter
 *   className    : string — wrapper class
 */
const FormTextarea = forwardRef(
  (
    {
      id = '',
      name = '',
      label = '',
      value = '',
      onChange = () => {},
      placeholder = '',
      errorMessage = '',
      required = false,
      disabled = false,
      readOnly = false,
      rows = 4,
      limit,
      className = '',
      textareaClassName = '',
    },
    ref
  ) => {
    const hasError = !!errorMessage;
    const remaining = limit ? Math.max(0, limit - String(value || '').length) : null;

    const baseBorder = hasError
      ? 'border border-rose-500 focus:ring-rose-500/20'
      : 'border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20';

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

        {readOnly ? (
          <div
            className={`${baseBorder} rounded-lg px-4 py-2.5 text-xs bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 whitespace-pre-wrap`}
          >
            {value || 'Not specified'}
          </div>
        ) : (
          <textarea
            id={id || name}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            readOnly={readOnly}
            rows={rows}
            className={[
              'w-full resize-none bg-slate-50 dark:bg-slate-800/60',
              'text-slate-900 dark:text-slate-100 rounded-lg text-xs px-4 py-2.5',
              'outline-none transition-all duration-150 focus:ring-2',
              'placeholder:text-slate-400 dark:placeholder:text-slate-500',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              baseBorder,
              textareaClassName,
            ]
              .filter(Boolean)
              .join(' ')}
          />
        )}

        {hasError && (
          <p className="text-[10px] text-rose-500 font-semibold">{errorMessage}</p>
        )}

        {!hasError && limit !== undefined && remaining !== null && (
          <p className="text-[10px] text-slate-400">
            {remaining} character{remaining !== 1 ? 's' : ''} left
          </p>
        )}
      </div>
    );
  }
);

FormTextarea.displayName = 'FormTextarea';

export default memo(FormTextarea);
