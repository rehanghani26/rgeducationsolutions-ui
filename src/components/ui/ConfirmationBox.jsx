import PropTypes from "prop-types";
import { memo, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle } from "lucide-react";

const ConfirmationBox = ({
  confirmationMessage = "Are you sure?",
  confirmationMessageClassName = "",
  className = "w-[420px]",
  parentClassName = "",
  heading = "",
  children,
  leftButtonName = "No",
  rightButtonName = "Yes",
  rightButtonDisabled = false,
  leftButtonDisabled = false,
  onLeftButtonClick = () => {},
  onRightButtonClick = () => {},
}) => {
  const dialog = useRef(null);
  const cancelButton = useRef(null);
  const isSubmittingRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const headingId = useId();
  const messageId = useId();

  useLayoutEffect(() => {
    const element = dialog.current;
    element.showModal();
    cancelButton.current?.focus();
    return () => element.close();
  }, []);

  async function handleRightClick(event) {
    if (isSubmittingRef.current || rightButtonDisabled) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    try {
      await onRightButtonClick(event);
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  function handleCancel(event) {
    event.preventDefault();
    if (!leftButtonDisabled && !isSubmittingRef.current) onLeftButtonClick(event);
  }

  return createPortal(
    <dialog
      ref={dialog}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby={heading ? headingId : undefined}
      aria-label={heading ? undefined : "Confirmation"}
      aria-describedby={confirmationMessage ? messageId : undefined}
      onCancel={handleCancel}
      className={`fixed inset-0 m-0 h-full max-h-none w-full max-w-none items-center justify-center bg-transparent p-4 open:flex backdrop:bg-[#051c2c]/50 backdrop:backdrop-blur-[2px] ${parentClassName}`}
    >
      <div className={`max-h-full max-w-full overflow-y-auto rounded-2xl bg-white shadow-[0_24px_64px_rgba(5,28,44,0.18)] ${className}`}>
        {heading && (
          <div className="flex items-center gap-3 rounded-t-2xl bg-[#051c2c] px-5 py-4">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10">
              <AlertTriangle size={14} className="text-amber-300" aria-hidden="true" />
            </div>
            <h3 id={headingId} className="text-[13px] font-black leading-tight text-white">{heading}</h3>
          </div>
        )}
        <div className="space-y-4 px-5 py-4">
          {confirmationMessage && (
            <p id={messageId} className={`break-words text-sm leading-relaxed text-gray-500 ${confirmationMessageClassName}`}>
              {confirmationMessage}
            </p>
          )}
          {children}
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2.5 rounded-b-2xl border-t border-gray-100 bg-gray-50 px-5 py-3.5">
          <button
            ref={cancelButton}
            type="button"
            onClick={onLeftButtonClick}
            disabled={leftButtonDisabled || isSubmitting}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-[#051c2c] transition-colors hover:border-[#0064E0]/40 hover:bg-[#EEF4FF] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {leftButtonName}
          </button>
          <button
            type="button"
            onClick={handleRightClick}
            disabled={rightButtonDisabled || isSubmitting}
            className="rounded-lg bg-[#0064E0] px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#051c2c] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {rightButtonName}
          </button>
        </div>
      </div>
    </dialog>,
    document.body,
  );
};

ConfirmationBox.propTypes = {
  confirmationMessage: PropTypes.string,
  confirmationMessageClassName: PropTypes.string,
  parentClassName: PropTypes.string,
  className: PropTypes.string,
  heading: PropTypes.string,
  children: PropTypes.node,
  leftButtonName: PropTypes.string,
  rightButtonName: PropTypes.string,
  rightButtonDisabled: PropTypes.bool,
  leftButtonDisabled: PropTypes.bool,
  onLeftButtonClick: PropTypes.func,
  onRightButtonClick: PropTypes.func,
};

export default memo(ConfirmationBox);
