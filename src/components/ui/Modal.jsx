import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const SIZE_MAP = {
  xs: 'max-w-sm',
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  '2xl': 'max-w-5xl',
  '3xl': 'max-w-6xl',
  '4xl': 'max-w-7xl',
  '5xl': 'max-w-[90rem]',
  full: 'max-w-[96vw] w-[96vw] h-[92vh]',
};

export const Modal = ({
  open,
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = 'lg',
  width,
  maxWidth,
  className = '',
  contentClassName = '',
  bodyClassName = '',
  noPadding = false,
  showCloseButton = true,
  closeButtonAction,
  headerActions = null,
  closeOnOverlayClick = true,
  closeOnEsc = true,
  footer = null,
  zIndex = 'z-50',
}) => {
  const show = Boolean(open !== undefined ? open : isOpen);
  const handleClose = closeButtonAction || onClose;

  // Handle ESC key press
  useEffect(() => {
    if (!show || !closeOnEsc || !handleClose) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [show, closeOnEsc, handleClose]);

  // Compute width/size classes
  const resolvedSizeClass = maxWidth || (width ? '' : (SIZE_MAP[size] || 'max-w-4xl'));
  const inlineStyle = width ? { maxWidth: width, width: '100%' } : undefined;

  return (
    <AnimatePresence>
      {show && (
        <div className={`fixed inset-0 ${zIndex} flex items-center justify-center p-3 sm:p-4 overflow-y-auto`}>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={closeOnOverlayClick ? handleClose : undefined}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            style={inlineStyle}
            className={`relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full ${resolvedSizeClass} max-h-[92vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden my-auto z-10 ${className}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            {(title || showCloseButton || headerActions) && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/80 dark:border-slate-800 sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm z-20 shrink-0">
                <div className="flex-1 min-w-0 pr-4">
                  {typeof title === 'string' ? (
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                      {title}
                    </h3>
                  ) : (
                    title
                  )}
                  {subtitle && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      {subtitle}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {headerActions}
                  {showCloseButton && handleClose && (
                    <button
                      type="button"
                      onClick={handleClose}
                      aria-label="Close modal"
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Body */}
            <div
              className={`flex-1 overflow-y-auto ${
                noPadding ? '' : 'p-6'
              } ${contentClassName} ${bodyClassName}`}
            >
              {typeof children === 'function' ? children() : children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="px-6 py-3.5 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-end gap-3 shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;

