import { AlertTriangle, Info, Loader2 } from 'lucide-react';
import Modal from './Modal.jsx';
import Button from './Button.jsx';

/**
 * ConfirmDialog — animated confirmation modal with icon, danger styling, and loading state.
 *
 * Props:
 *   open         : boolean
 *   onClose      : fn
 *   onConfirm    : fn
 *   title        : string   (default: 'Confirm Action')
 *   message      : string | ReactNode
 *   confirmLabel : string   (default: 'Confirm')
 *   cancelLabel  : string   (default: 'Cancel')
 *   danger       : boolean  — red styling for destructive actions
 *   loading      : boolean  — shows spinner on confirm button
 */
const ConfirmDialog = ({
  open,
  isOpen,
  onClose,
  onCancel,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmLabel = 'Confirm',
  confirmText,
  cancelLabel = 'Cancel',
  cancelText,
  danger = false,
  type = 'primary',
  loading = false,
}) => {
  const isShow = Boolean(open !== undefined ? open : isOpen);
  if (!isShow) return null;

  const handleCancel = onClose || onCancel;
  const isDanger = danger || type === 'danger' || type === 'warning';
  const cLabel = confirmText || confirmLabel;
  const canLabel = cancelText || cancelLabel;

  const Icon = isDanger ? AlertTriangle : Info;
  const iconBg = isDanger
    ? 'bg-rose-500/10 text-rose-500'
    : 'bg-indigo-500/10 text-indigo-500';

  return (
    <Modal open={isShow} onClose={handleCancel} title={null} size="sm">
      <div className="flex flex-col items-center text-center gap-4 pb-2">
        {/* Icon badge */}
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${iconBg}`}>
          <Icon size={28} strokeWidth={2} />
        </div>

        {/* Title */}
        <div>
          <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100">
            {title}
          </h3>
          {message && (
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
              {message}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 w-full mt-1">
          <Button
            variant="secondary"
            fullWidth
            onClick={handleCancel}
            disabled={loading}
          >
            {canLabel}
          </Button>
          <Button
            variant={isDanger ? 'danger' : 'primary'}
            fullWidth
            onClick={onConfirm}
            loading={loading}
          >
            {loading ? 'Processing...' : cLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
