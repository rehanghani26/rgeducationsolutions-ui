import { useState } from 'react';
import Modal from '../../components/ui/Modal.jsx';
import { ErrorMessage, Field } from '../../components/ui/ProcurementUI.jsx';
import { adjustStock } from '../../services/inventoryService.js';
import { clientKey, recordId } from '../../utils/procurement.js';

export default function StockAdjustmentModal({ item, onClose, onSaved }) {
  const [form, setForm] = useState(() => ({ type: item.status === 'discontinued' ? 'out' : 'in', quantity: '', reason: '', notes: '', requestId: clientKey() }));
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const field = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
  const previous = Number(item.quantity || 0);
  const signed = Number(form.quantity || 0) * (form.type === 'out' ? -1 : 1);
  const remaining = Math.round((previous + signed) * 1000) / 1000;

  async function submit(event) {
    event.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await adjustStock({ itemId: recordId(item), ...form });
      onSaved();
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  }

  return <Modal open title="Adjust stock" subtitle={item.name} onClose={saving ? undefined : onClose} closeOnOverlayClick={!saving} className="proc-modal" size="sm">
    <form className="proc-form" onSubmit={submit}>
      <p className="proc-hint">Use adjustments to correct a physical stock count.</p>
      <div className="proc-fields">
        <Field label="Direction"><select value={form.type} onChange={field('type')}>
          {item.status !== 'discontinued' && <option value="in">Add stock</option>}
          <option value="out">Remove stock</option>
        </select></Field>
        <Field label={'Quantity (' + item.unit + ')'}>
          <input type="number" required min="0.001" max={form.type === 'out' ? previous : undefined} step="0.001" value={form.quantity} onChange={field('quantity')} />
        </Field>
        <Field label="Reason" wide><input value={form.reason} onChange={field('reason')} required placeholder="Stock count, breakage, or transfer" /></Field>
        <Field label="Notes" wide><textarea value={form.notes} onChange={field('notes')} rows={2} /></Field>
      </div>
      <dl className="proc-amounts">
        <div><dt>Current stock</dt><dd>{previous} {item.unit}</dd></div>
        <div><dt>After adjustment</dt><dd className={remaining < 0 ? 'proc-danger' : ''}>{remaining} {item.unit}</dd></div>
      </dl>
      <ErrorMessage error={remaining < 0 ? 'The removal exceeds the quantity available.' : error} />
      <div className="proc-form-footer">
        <button className="proc-btn" type="button" onClick={onClose} disabled={saving}>Cancel</button>
        <button className="proc-btn proc-primary" type="submit" disabled={saving || signed === 0 || remaining < 0}>{saving ? 'Saving…' : 'Save adjustment'}</button>
      </div>
    </form>
  </Modal>;
}
