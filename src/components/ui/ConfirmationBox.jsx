import PropTypes from "prop-types";
import { memo, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle } from "lucide-react";
import "./procurement.css";

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
      className={`fixed inset-0 m-0 h-full max-h-none w-full max-w-none items-center justify-center bg-transparent p-4 open:flex backdrop:bg-black/50 backdrop:backdrop-blur-[2px] ${parentClassName}`}
    >
      <div className={`max-h-full max-w-full overflow-y-auto rounded-lg border border-[var(--border-color)] bg-[var(--surface-1)] text-[var(--text-primary)] shadow-2xl ${className}`}>
        {heading && (
          <div className="flex items-center gap-3 border-b border-l-[3px] border-[var(--border-color)] border-l-[var(--brand-primary)] bg-[var(--surface-2)] px-5 py-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[var(--proc-accent-bg)] text-[var(--proc-accent)]">
              <AlertTriangle size={17} aria-hidden="true" />
            </div>
            <h3 id={headingId} className="text-sm font-bold leading-tight">{heading}</h3>
          </div>
        )}
        <div className="space-y-4 px-5 py-4">
          {confirmationMessage && (
            <p id={messageId} className={`break-words text-sm leading-relaxed text-[var(--text-secondary)] ${confirmationMessageClassName}`}>
              {confirmationMessage}
            </p>
          )}
          {children}
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-[var(--border-color)] bg-[var(--surface-2)] px-5 py-3">
          <button
            ref={cancelButton}
            type="button"
            onClick={onLeftButtonClick}
            disabled={leftButtonDisabled || isSubmitting}
            className="proc-btn rounded-md"
          >
            {leftButtonName}
          </button>
          <button
            type="button"
            onClick={handleRightClick}
            disabled={rightButtonDisabled || isSubmitting}
            className="proc-btn proc-primary rounded-md"
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
