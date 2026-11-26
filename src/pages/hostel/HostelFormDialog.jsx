import { useState } from 'react';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { hostelError } from '../../services/hostelService.js';
import { text } from '../../theme/color.js';

export default function HostelFormDialog({ title, submitLabel = 'Save', onClose, onSave, submit, disabled = false, children }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    if (saving || disabled) return;
    setSaving(true);
    setError(null);
    try {
      const message = await submit();
      onSave(message);
    } catch (cause) {
      setError(cause);
    } finally {
      setSaving(false);
    }
  }

  return <Modal open title={title} size="md" onClose={saving ? undefined : onClose} showCloseButton={!saving}>
    <form onSubmit={handleSubmit} className="space-y-4">
      {children}
      {error && <p role="alert" className={`text-sm ${text.danger}`}>{hostelError(error)}</p>}
      <div className="flex justify-end gap-2">
        <Button variant="secondary" disabled={saving} onClick={onClose}>Cancel</Button>
        <Button type="submit" loading={saving} disabled={disabled}>{submitLabel}</Button>
      </div>
    </form>
  </Modal>;
}
