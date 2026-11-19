import { useCallback, useState } from 'react';
import { Boxes, Plus, ReceiptText, Trash2 } from 'lucide-react';
import Modal from '../../components/ui/Modal.jsx';
import { ErrorMessage, Field, Pending } from '../../components/ui/ProcurementUI.jsx';
import ProcurementPicker from '../../components/ui/ProcurementPicker.jsx';
import { useProcurementResource } from '../../hooks/useProcurement.js';
import { getAcademicSessions, getSessionBudget } from '../../services/budgetService.js';
import { createPurchaseBill, getInventoryItems } from '../../services/inventoryService.js';
import { getVendors } from '../../services/vendorService.js';
import { formatCurrency } from '../../utils';
import {
  clientKey, CREDIT_METHOD, defaultSession, invoiceDueDate, PAYMENT_METHODS, purchaseTotals, recordId, roundMoney, todayInput,
} from '../../utils/procurement.js';

const blankLine = () => ({ key: clientKey(), item: null, quantity: '1', unitCost: '', gstRate: '0' });
const loadItems = async (search) => (await getInventoryItems({ search, limit: 15, sort: 'name', available: true })).data.inventory;
const loadVendors = async (search) => (await getVendors({ search, limit: 15, sort: 'name', status: 'active' })).data.vendors;
const initialBill = () => ({
  supplierBillNumber: '', poNumber: '', billDate: todayInput(), receivedDate: todayInput(), dueDate: '', expectedDeliveryDate: '',
  shippingCharges: '', otherCharges: '', discountAmount: '', taxAmount: '', paymentType: CREDIT_METHOD,
  amountPaid: '', transactionReference: '', notes: '', invoiceAttachmentUrl: '',
});

export default function PurchaseBillModal({ vendor: fixedVendor, session: initialSession, onClose, onSaved }) {
  const [form, setForm] = useState(initialBill);
  const [lines, setLines] = useState(() => [blankLine()]);
  const [vendor, setVendor] = useState(fixedVendor || null);
  const [selectedSession, setSelectedSession] = useState(initialSession || null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const sessions = useProcurementResource(getAcademicSessions);
  const sessionList = sessions.data || [];
  const sessionId = selectedSession ?? recordId(defaultSession(sessionList));
  const loadBudget = useCallback(() => getSessionBudget(sessionId), [sessionId]);
  const budget = useProcurementResource(loadBudget, Boolean(sessionId));
  const amounts = purchaseTotals(lines, form);
  const dueDate = form.dueDate || invoiceDueDate(form.billDate, vendor?.paymentTerms);
  const credit = form.paymentType === CREDIT_METHOD;
  const paid = credit ? 0 : (form.amountPaid === '' ? amounts.total : Number(form.amountPaid));
  const balance = roundMoney(amounts.total - paid);
  const overBudget = Boolean(budget.data && amounts.total > Math.max(0, budget.data.schoolRequirementsRemaining));
  const closedBudget = budget.data?.status === 'closed';

  const field = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
  const updateLine = (key, change) => setLines((current) => current.map((line) => line.key === key ? { ...line, ...change } : line));

  async function submit(event) {
    event.preventDefault();
    setError(null);
    if (!vendor) return setError('Choose an active vendor.');
    if (!form.supplierBillNumber.trim()) return setError('Enter the supplier invoice number.');
    if (lines.some(({ item }) => !item)) return setError('Choose an inventory item on each line.');
    if (new Set(lines.map((line) => recordId(line.item))).size !== lines.length) return setError('Combine repeated SKUs into one line.');
    if (amounts.total < 0 || paid < 0 || paid > amounts.total) return setError('Check the discount and amount paid.');
    setSaving(true);
    try {
      await createPurchaseBill({
        ...form, dueDate, amountPaid: paid, vendorId: recordId(vendor),
        sessionId: sessionId || undefined,
        items: lines.map(({ item, quantity, unitCost, gstRate }) => ({ itemId: recordId(item), quantity, unitCost, gstRate })),
      });
      onSaved();
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  }

  return <Modal open onClose={saving ? undefined : onClose} closeOnOverlayClick={!saving} size="xl" className="proc-modal" title="Receive purchase">
    <form className="proc-form" onSubmit={submit}>
      <div className="proc-split">
        <div className="proc-stack">
          <section className="proc-form-section">
            <div className="proc-heading"><span className="proc-icon"><ReceiptText size={18} /></span><div><h2>Invoice details</h2><p>Post one receipt against the supplier invoice.</p></div></div>
            {fixedVendor ? <div><span className="proc-label">Vendor</span><strong>{fixedVendor.name}</strong></div> :
              <ProcurementPicker label="Vendor" selected={vendor} onSelect={setVendor} getOptions={loadVendors} placeholder="Search active vendors" />}
            <div className="proc-fields">
              <Field label="Supplier invoice number"><input required value={form.supplierBillNumber} onChange={field('supplierBillNumber')} maxLength={100} /></Field>
              <Field label="Purchase order number"><input value={form.poNumber} onChange={field('poNumber')} /></Field>
              <Field label="Invoice date"><input required type="date" value={form.billDate} onChange={field('billDate')} /></Field>
              <Field label="Received date"><input required type="date" value={form.receivedDate} onChange={field('receivedDate')} /></Field>
              <Field label="Expected delivery date"><input type="date" value={form.expectedDeliveryDate} onChange={field('expectedDeliveryDate')} /></Field>
              <Field label="Payment due date"><input type="date" min={form.billDate} value={dueDate} onChange={field('dueDate')} /></Field>
              <Field label="Academic session">
                <select value={sessionId} onChange={(event) => setSelectedSession(event.target.value)} disabled={sessions.loading}>
                  <option value="" disabled={Boolean(defaultSession(sessionList))}>{sessions.loading ? 'Loading sessions…' : 'No active session'}</option>
                  {sessionList.map((session) => <option key={recordId(session)} value={recordId(session)}>{session.sessionName}{session.isCurrent ? ' (current)' : ''}</option>)}
                </select>
              </Field>
              <Field label="Invoice document link" wide><input type="url" value={form.invoiceAttachmentUrl} onChange={field('invoiceAttachmentUrl')} placeholder="https://" /></Field>
            </div>
            <ErrorMessage error={sessions.error} onRetry={sessions.refresh} />
          </section>
          <section className="proc-form-section">
            <div className="proc-line-title"><div className="proc-heading"><span className="proc-icon"><Boxes size={17} /></span><h2>Received items</h2></div>
              <button type="button" className="proc-btn proc-btn-sm" disabled={lines.length >= 100} onClick={() => setLines([...lines, blankLine()])}><Plus size={14} /> Add item</button>
            </div>
            {lines.map((line, index) => <div className="proc-line" key={line.key}>
              {lines.length > 1 && <div className="proc-line-title">
                <span>Line {index + 1}</span><button type="button" className="proc-btn proc-btn-sm" aria-label={'Remove line ' + (index + 1)} onClick={() => setLines(lines.filter((entry) => entry.key !== line.key))}><Trash2 size={14} /></button>
              </div>}
              <ProcurementPicker label="Inventory item" selected={line.item} getOptions={loadItems} placeholder="Search by name, SKU, or barcode"
                onSelect={(item) => updateLine(line.key, { item, unitCost: item.unitCost ?? item.price ?? 0, gstRate: item.gstRate ?? 0 })} />
              <div className="proc-fields proc-fields-3">
                <Field label={line.item?.unit ? 'Quantity (' + line.item.unit + ')' : 'Quantity'}><input type="number" min="0.001" step="0.001" value={line.quantity} onChange={(event) => updateLine(line.key, { quantity: event.target.value })} required /></Field>
                <Field label="Unit cost"><input type="number" min="0" step="0.01" value={line.unitCost} onChange={(event) => updateLine(line.key, { unitCost: event.target.value })} required /></Field>
                <Field label="GST %"><input type="number" min="0" max="100" step="0.01" value={line.gstRate} onChange={(event) => updateLine(line.key, { gstRate: event.target.value })} /></Field>
              </div>
            </div>)}
          </section>
        </div>
        <div className="proc-stack">
          <section className="proc-panel proc-pad proc-form-section">
            <h2 className="proc-title">Charges and payment</h2>
            <div className="proc-fields">
              {[
                ['shippingCharges', 'Shipping'], ['otherCharges', 'Other charges'], ['discountAmount', 'Invoice discount'], ['taxAmount', 'Override invoice tax'],
              ].map(([key, label]) => <Field label={label} key={key}><input type="number" min="0" step="0.01" placeholder={key === 'taxAmount' ? 'Use item GST' : '0'} value={form[key]} onChange={field(key)} /></Field>)}
              <Field label="Payment method" wide><select value={form.paymentType} onChange={field('paymentType')}>
                {[CREDIT_METHOD, ...PAYMENT_METHODS].map((method) => <option key={method}>{method}</option>)}
              </select></Field>
              {!credit && <>
                <Field label="Amount already paid" hint="Leave blank for the full invoice amount."><input type="number" min="0" step="0.01" value={form.amountPaid} onChange={field('amountPaid')} /></Field>
                <Field label="Payment reference"><input value={form.transactionReference} onChange={field('transactionReference')} /></Field>
              </>}
              <Field label="Notes" wide><textarea rows={2} value={form.notes} onChange={field('notes')} /></Field>
            </div>
          </section>
          <section className="proc-panel proc-pad proc-stack">
            <h2 className="proc-title">Receipt summary</h2>
            <dl className="proc-amounts">
              <div><dt>Items subtotal</dt><dd>{formatCurrency(amounts.subtotal)}</dd></div>
              <div><dt>Invoice tax</dt><dd>{formatCurrency(amounts.tax)}</dd></div>
              <div className="proc-total"><dt>Invoice total</dt><dd>{formatCurrency(amounts.total)}</dd></div>
              <div><dt>Balance due</dt><dd className={balance > 0 ? 'proc-warn' : ''}>{formatCurrency(balance)}</dd></div>
            </dl>
            {budget.loading && <Pending label="Checking the session budget" />}
            <ErrorMessage error={budget.error} onRetry={budget.refresh} />
            {budget.data ? <>
              <dl className="proc-amounts"><div><dt>Inventory budget available</dt><dd>{formatCurrency(budget.data.schoolRequirementsRemaining)}</dd></div></dl>
              {closedBudget ? <ErrorMessage error="The selected session’s budget is closed." /> : overBudget ?
                <ErrorMessage error="This invoice exceeds the available inventory budget." /> :
                <p className="proc-hint">{formatCurrency(roundMoney(budget.data.schoolRequirementsRemaining - amounts.total))} available after posting.</p>}
            </> : !budget.loading && !budget.error && <p className="proc-hint">{sessionId ? 'This session has no approved allocation.' : 'This receipt will be saved without a session.'}</p>}
          </section>
        </div>
      </div>
      <ErrorMessage error={error} />
      <div className="proc-form-footer">
        <button type="button" className="proc-btn" onClick={onClose} disabled={saving}>Cancel</button>
        <button type="submit" className="proc-btn proc-primary" disabled={saving || overBudget || closedBudget || budget.loading || Boolean(budget.error) || sessions.loading || Boolean(sessions.error)}>
          <ReceiptText size={15} /> {saving ? 'Posting receipt…' : 'Post receipt'}
        </button>
      </div>
    </form>
  </Modal>;
}
