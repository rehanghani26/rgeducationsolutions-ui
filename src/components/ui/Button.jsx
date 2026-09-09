import { Loader2 } from 'lucide-react';

/**
 * Reusable Button component — use this everywhere instead of a bare <button>.
 *
 * Props:
 *   variant   : 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'  (default: 'primary')
 *   size      : 'sm' | 'md' | 'lg'                                          (default: 'md')
 *   icon      : ReactNode — rendered to the left of children
 *   iconRight : ReactNode — rendered to the right of children
 *   loading   : boolean — shows spinner + disables the button
 *   disabled  : boolean
 *   type      : 'button' | 'submit' | 'reset'                               (default: 'button')
 *   fullWidth : boolean — makes the button block-level
 *   onClick   : fn
 *   className : string — appended extra classes
 */

const variantMap = {
  primary:
    'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-sm shadow-indigo-600/20',
  secondary:
    'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200',
  danger:
    'bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white shadow-sm shadow-rose-600/20',
  ghost:
    'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300',
  outline:
    'bg-transparent border border-indigo-500/40 hover:border-indigo-500 text-indigo-500 hover:bg-indigo-500/5',
  'outline-danger':
    'bg-transparent border border-rose-500/40 hover:border-rose-500 text-rose-500 hover:bg-rose-500/5',
};

const sizeMap = {
  xs: 'px-2.5 py-1.5 text-[10px] gap-1',
  sm: 'px-3 py-2 text-xs gap-1.5',
  md: 'px-4 py-2.5 text-xs gap-2',
  lg: 'px-5 py-3 text-sm gap-2',
};

const iconSizeMap = {
  xs: 12,
  sm: 13,
  md: 14,
  lg: 16,
};

const Button = ({
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading = false,
  disabled = false,
  type = 'button',
  fullWidth = false,
  onClick,
  className = '',
  children,
  ...rest
}) => {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={[
        'inline-flex items-center justify-center rounded-lg font-bold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 select-none',
        variantMap[variant] || variantMap.primary,
        sizeMap[size] || sizeMap.md,
        isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {loading ? (
        <Loader2 size={iconSizeMap[size] || 14} className="animate-spin shrink-0" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      {children && <span>{children}</span>}
      {iconRight && !loading && <span className="shrink-0">{iconRight}</span>}
    </button>
  );
};

export default Button;
