import React from 'react';

/**
 * @file Toggle.jsx
 * @description Beautiful, accessible Switch / Toggle component with smooth transitions.
 *
 * Props:
 *   checked     : boolean (true = ON, false = OFF)
 *   onChange    : (checked: boolean) => void
 *   disabled    : boolean (optional)
 *   label       : string | ReactNode (optional label to display next to toggle)
 *   description : string (optional secondary helper text)
 *   size        : 'sm' | 'md' | 'lg' (default: 'md')
 *   color       : 'orange' | 'indigo' | 'emerald' | 'blue' (default: 'orange')
 *   className   : string (optional container styles)
 *   id          : string (optional element id)
 */

const sizeConfig = {
  sm: {
    track: 'w-8 h-4.5 p-0.5',
    knob: 'w-3.5 h-3.5',
    translate: 'translate-x-3.5',
    labelClass: 'text-xs',
  },
  md: {
    track: 'w-11 h-6 p-0.5',
    knob: 'w-5 h-5',
    translate: 'translate-x-5',
    labelClass: 'text-xs',
  },
  lg: {
    track: 'w-14 h-7.5 p-1',
    knob: 'w-5.5 h-5.5',
    translate: 'translate-x-6.5',
    labelClass: 'text-sm',
  },
};

const activeColorMap = {
  orange: 'bg-gradient-to-r from-orange-500 to-amber-500 shadow-orange-500/30',
  indigo: 'bg-gradient-to-r from-indigo-500 to-indigo-600 shadow-indigo-500/30',
  emerald: 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-500/30',
  blue: 'bg-gradient-to-r from-blue-500 to-cyan-600 shadow-blue-500/30',
};

const Toggle = ({
  checked = false,
  onChange,
  disabled = false,
  label = null,
  description = null,
  size = 'md',
  color = 'orange',
  className = '',
  id,
}) => {
  const currentSize = sizeConfig[size] || sizeConfig.md;
  const activeColor = activeColorMap[color] || activeColorMap.orange;

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && onChange) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      if (onChange) onChange(!checked);
    }
  };

  return (
    <div
      className={`inline-flex items-center gap-3 select-none ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${className}`}
      onClick={disabled ? undefined : handleClick}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        id={id}
        onKeyDown={handleKeyDown}
        className={`relative inline-flex flex-shrink-0 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:ring-offset-2 dark:focus:ring-offset-slate-900 shadow-inner ${
          currentSize.track
        } ${
          checked
            ? `${activeColor} shadow-md`
            : 'bg-slate-200 dark:bg-slate-700/80 hover:bg-slate-300 dark:hover:bg-slate-700'
        }`}
      >
        <span
          className={`pointer-events-none inline-block rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
            currentSize.knob
          } ${checked ? currentSize.translate : 'translate-x-0'}`}
        />
      </button>

      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <span
              className={`font-bold text-slate-800 dark:text-slate-200 ${currentSize.labelClass}`}
            >
              {label}
            </span>
          )}
          {description && (
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default Toggle;
