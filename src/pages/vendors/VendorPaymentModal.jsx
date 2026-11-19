import { useState } from 'react';
import Modal from '../../components/ui/Modal.jsx';
import { ErrorMessage, Field } from '../../components/ui/ProcurementUI.jsx';
import { recordVendorPayment } from '../../services/vendorService.js';
import { formatCurrency } from '../../utils';
import { clientKey, dateInput, invoiceNumber, PAYMENT_METHODS, recordId, roundMoney, todayInput } from '../../utils/procurement.js';

export default function VendorPaymentModal({ vendor, bills, bill, onClose, onSaved }) {
  const [form, setForm] = useState(() => ({
    billId: recordId(bill), amount: '', paymentDate: todayInput(), paymentType: 'Bank Transfer', transactionReference: '', notes: '', requestId: clientKey(),
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const openBills = bills.filter((entry) => entry.balanceDue > 0);
  const selected = openBills.find((entry) => recordId(entry) === form.billId);
  const limit = Math.min(Number(vendor.outstandingBalance || 0), selected?.balanceDue ?? Infinity);
  const amount = Number(form.amount || 0);
  const field = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await recordVendorPayment(recordId(vendor), form);
      onSaved();
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  }

  return <Modal open title="Record vendor payment" subtitle={vendor.name} onClose={saving ? undefined : onClose} closeOnOverlayClick={!saving} className="proc-modal" size="lg">
    <form className="proc-form" onSubmit={submit}>
      <Field label="Apply payment to">
        <select value={form.billId} onChange={field('billId')}>
          <option value="">Vendor balance · oldest invoices first</option>
          {openBills.map((entry) => <option key={recordId(entry)} value={recordId(entry)}>{invoiceNumber(entry)} · {formatCurrency(entry.balanceDue)} due</option>)}
        </select>
      </Field>
      <div className="proc-fields">
        <Field label="Amount" hint={formatCurrency(limit) + ' available to pay'}><input type="number" min="0.01" max={limit} step="0.01" value={form.amount} onChange={field('amount')} required /></Field>
        <Field label="Payment date"><input type="date" min={dateInput(selected?.billDate)} value={form.paymentDate} onChange={field('paymentDate')} required /></Field>
        <Field label="Payment method"><select value={form.paymentType} onChange={field('paymentType')}>{PAYMENT_METHODS.map((method) => <option key={method}>{method}</option>)}</select></Field>
        <Field label="Transaction reference"><input value={form.transactionReference} onChange={field('transactionReference')} /></Field>
        <Field label="Notes" wide><textarea rows={2} value={form.notes} onChange={field('notes')} /></Field>
      </div>
      {amount > 0 && amount <= limit && <dl className="proc-amounts"><div><dt>Vendor balance after payment</dt><dd>{formatCurrency(roundMoney(vendor.outstandingBalance - amount))}</dd></div></dl>}
      <ErrorMessage error={error} />
      <div className="proc-form-footer">
        <button type="button" className="proc-btn" onClick={onClose} disabled={saving}>Cancel</button>
        <button type="submit" className="proc-btn proc-primary" disabled={saving || amount <= 0 || amount > limit}>{saving ? 'Recording…' : 'Record payment'}</button>
      </div>
    </form>
  </Modal>;
}
