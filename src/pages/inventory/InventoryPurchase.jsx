import { useCallback, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Boxes, ReceiptText, RefreshCw, Trash2, Wallet } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Input, SelectInput } from '../../components/ui/FormControls.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import ProcurementPicker from '../../components/ui/ProcurementPicker.jsx';
import { Empty, ErrorMessage, Field, Pending } from '../../components/ui/ProcurementUI.jsx';
import { useProcurementAccess, useProcurementResource } from '../../hooks/useProcurement.js';
import { ROUTES } from '../../routes/routes.js';
import { getAcademicSessions, getSessionBudget } from '../../services/budgetService.js';
import { createPurchaseBill, getInventoryItems } from '../../services/inventoryService.js';
import { getVendorById } from '../../services/vendorService.js';
import { formatCurrency } from '../../utils/formatters.js';
import { MAX_CATALOG_ITEMS } from '../../utils/inventoryDraft.js';
import { CREDIT_METHOD, defaultSession, invoiceDueDate, purchaseTotals, recordId, roundMoney, sessionOptions, todayInput } from '../../utils/procurement.js';
import InventoryPresetCatalog from './InventoryPresetCatalog.jsx';
import InventoryProductPhoto from './InventoryProductPhoto.jsx';
import PurchaseDetailsFields from './PurchaseDetailsFields.jsx';
import './inventoryEditor.css';

const loadStock = async (search) => (await getInventoryItems({ search, limit: 15, sort: 'name', available: true })).data.inventory;
const back = ROUTES.INVENTORY.LIST + '?tab=purchases';
const initialInvoice = () => ({
  supplierBillNumber: '', poNumber: '', billDate: todayInput(), receivedDate: todayInput(), dueDate: '',
  expectedDeliveryDate: '', deliveryCarrier: '', deliveryReference: '', deliveryLocation: '', deliveryNotes: '',
  shippingCharges: '', otherCharges: '', discountAmount: '', taxAmount: '', paymentType: CREDIT_METHOD,
  paymentDate: '', amountPaid: '', transactionReference: '', notes: '', invoiceAttachmentUrl: '',
});

function PurchaseBudget({ sessions, sessionId, onSession, budget, amounts, balance, blocked }) {
  const { subtotal, tax, total } = amounts;
  const available = budget.data?.schoolRequirementsRemaining;
  const settingsLink = ROUTES.BUDGET + (sessionId ? '?session=' + encodeURIComponent(sessionId) : '');
  return <section className="proc-panel proc-pad proc-stack">
    <div className="proc-line-title">
      <div className="proc-heading"><span className="proc-icon"><Wallet size={17} /></span><h2>Inventory budget</h2></div>
      <button type="button" className="proc-btn proc-btn-sm" aria-label="Refresh inventory budget" title="Refresh inventory budget"
        disabled={!sessionId || budget.loading} onClick={budget.refresh}><RefreshCw size={14} /></button>
    </div>
    <Field label="Academic session">
      <SelectInput value={sessionId} disabled={sessions.loading} options={sessionOptions(sessions.data || [], true)}
        placeholder={sessions.loading ? 'Loading sessions…' : 'Choose a session'} placeholderDisabled emptyMessage="" onChange={onSession} />
    </Field>
    <ErrorMessage error={sessions.error} onRetry={sessions.refresh} />
    {budget.loading && <Pending label="Checking budget" />}
    <ErrorMessage error={budget.error} onRetry={budget.refresh} />
    <dl className="proc-amounts">
      {budget.data && <>
        <div><dt>Allocated</dt><dd>{formatCurrency(budget.data.schoolRequirementsBudget)}</dd></div>
        <div><dt>Committed</dt><dd>{formatCurrency(budget.data.schoolRequirementsSpent)}</dd></div>
        <div><dt>Available</dt><dd>{formatCurrency(available)}</dd></div>
      </>}
      {subtotal > 0 && <div><dt>Products subtotal</dt><dd>{formatCurrency(subtotal)}</dd></div>}
      {tax > 0 && <div><dt>Invoice tax</dt><dd>{formatCurrency(tax)}</dd></div>}
      <div className="proc-total"><dt>Invoice total</dt><dd>{formatCurrency(total)}</dd></div>
      <div><dt>Balance due to vendor</dt><dd>{formatCurrency(balance)}</dd></div>
      {budget.data && !blocked && <div><dt>Available after purchase</dt><dd>{formatCurrency(roundMoney(available - total))}</dd></div>}
    </dl>
    <ErrorMessage error={blocked} />
    <Link className="proc-link text-xs" to={settingsLink} target="_blank" rel="noopener noreferrer">Budget allocation settings</Link>
  </section>;
}

function PurchaseProducts({ lines, onChange, onRemove }) {
  return <section className="proc-panel proc-pad proc-stack">
    <div className="proc-heading"><span className="proc-icon"><Boxes size={17} /></span><h2>Products received</h2></div>
    <p className="proc-hint">Confirm quantities, unit costs, and GST against the supplier invoice.</p>
    {lines.map((line) => <div className="proc-line" key={line.key}>
      <div className="proc-line-title">
        <div className="proc-heading">
          <InventoryProductPhoto value={line.item.imageUrl} className="inventory-selection__photo" />
          <div>
            <strong>{line.item.name}</strong>
            <p className="proc-hint">{[line.item.category, line.item.subcategory, line.item.sku || line.item.skuPrefix].filter(Boolean).join(' · ')}</p>
          </div>
        </div>
        <button type="button" className="proc-btn proc-btn-sm" aria-label={'Remove ' + line.item.name} onClick={() => onRemove(line.key)}><Trash2 size={14} /></button>
      </div>
      {line.item.description && <p className="proc-hint">{line.item.description}</p>}
      <div className="proc-fields proc-fields-3">
        <Field label={'Quantity (' + line.item.unit + ')'}><Input type="number" min="0.001" step="0.001" required
          value={line.quantity} onChange={(event) => onChange(line.key, 'quantity', event.target.value)} /></Field>
        <Field label="Invoice unit cost"><Input type="number" min="0" step="0.01" required
          value={line.unitCost} onChange={(event) => onChange(line.key, 'unitCost', event.target.value)} /></Field>
        <Field label="GST %"><Input type="number" min="0" max="100" step="0.01"
          value={line.gstRate} onChange={(event) => onChange(line.key, 'gstRate', event.target.value)} /></Field>
      </div>
    </div>)}
  </section>;
}

export default function InventoryPurchase() {
  const { canManageStock } = useProcurementAccess();
  return canManageStock ? <PurchaseWorkspace /> : <Empty title="Your role has read-only inventory access" />;
}

function PurchaseWorkspace() {
  const navigate = useNavigate();
  const workspace = useRef(null);
  const [params] = useSearchParams();
  const vendorId = params.get('vendor');
  const [form, setForm] = useState(initialInvoice);
  const [lines, setLines] = useState([]);
  const [review, setReview] = useState(false);
  const [vendorChoice, setVendor] = useState(null);
  const [selectedSession, setSession] = useState(params.get('session'));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const loadVendor = useCallback(async () => (await getVendorById(vendorId)).data.vendor, [vendorId]);
  const defaultVendor = useProcurementResource(loadVendor, Boolean(vendorId));
  const vendor = vendorChoice || defaultVendor.data || null;
  const sessions = useProcurementResource(getAcademicSessions);
  const sessionId = selectedSession ?? recordId(defaultSession(sessions.data || []));
  const loadBudget = useCallback(() => getSessionBudget(sessionId), [sessionId]);
  const budget = useProcurementResource(loadBudget, Boolean(sessionId));
  const amounts = purchaseTotals(lines, form);
  const credit = form.paymentType === CREDIT_METHOD;
  const paid = credit ? 0 : (form.amountPaid === '' ? amounts.total : Number(form.amountPaid));
  const balance = roundMoney(amounts.total - paid);
  const dueDate = form.dueDate || invoiceDueDate(form.billDate, vendor?.paymentTerms);
  const checking = sessions.loading || budget.loading || sessions.error || budget.error;
  let blocked;
  if (!checking) {
    if (!sessionId) blocked = 'Choose an academic session to check its inventory budget.';
    else if (!budget.data || !(budget.data.schoolRequirementsBudget > 0)) blocked = 'Allocate an inventory budget for this session in Settings.';
    else if (['closed', 'draft'].includes(budget.data.status)) blocked = 'The selected session needs an approved, open inventory budget.';
    else if (amounts.total >= budget.data.schoolRequirementsRemaining) blocked = 'The invoice total must be lower than the available inventory budget.';
  }

  function showReview(next) {
    setReview(next);
    setError(null);
    workspace.current?.scrollIntoView({ block: 'start' });
  }

  function add(item, preset = false) {
    const key = (preset ? 'preset:' : 'stock:') + recordId(item);
    setLines((current) => current.length >= MAX_CATALOG_ITEMS || current.some((line) => line.key === key) ? current : [
      ...current, { key, item, preset, quantity: '1', unitCost: item.unitCost ?? item.unitPrice ?? item.price ?? 0, gstRate: item.gstRate ?? 0 },
    ]);
  }

  function remove(key) {
    if (lines.length === 1) showReview(false);
    setLines((current) => current.filter((line) => line.key !== key));
  }

  function changeLine(key, name, value) {
    setLines((current) => current.map((line) => line.key === key ? { ...line, [name]: value } : line));
  }

  const field = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  async function submit(event) {
    event.preventDefault();
    if (!review || !lines.length || saving || blocked || checking) return;
    setError(null);
    if (!vendor || (vendor.status && vendor.status !== 'active')) return setError('Choose an active vendor.');
    if (!form.supplierBillNumber.trim()) return setError('Enter the supplier invoice number.');
    if (amounts.total < 0 || paid < 0 || paid > amounts.total) return setError('Check the discount and amount paid.');
    setSaving(true);
    try {
      const result = await createPurchaseBill({
        ...form, dueDate, amountPaid: paid, transactionReference: credit ? '' : form.transactionReference,
        vendorId: recordId(vendor), sessionId,
        items: lines.map(({ item, preset, quantity, unitCost, gstRate }) => ({
          ...(preset ? { product: { ...item, catalogId: item.id } } : { itemId: recordId(item) }),
          quantity, unitCost, gstRate,
        })),
      });
      navigate(back + '&session=' + encodeURIComponent(sessionId), { state: { recordedPurchase: result.data?.purchase } });
    } catch (err) {
      const response = err.response;
      const olderPurchaseApi = lines.some((line) => line.preset) && response?.status === 404 &&
        response.data?.message === 'An inventory item on this invoice could not be found.';
      setError(olderPurchaseApi ? 'The connected server needs the inventory update to record purchases from the catalog.' : err);
      budget.refresh();
    } finally {
      setSaving(false);
    }
  }

  const selections = new Map(lines.filter((line) => line.preset).map((line) => [line.item.id, line.key]));
  const action = review ? <button type="submit" className="proc-btn proc-primary" disabled={saving || Boolean(blocked || checking)}>
    <ReceiptText size={15} /> {saving ? 'Recording…' : 'Record purchase'}
  </button> : <button type="button" className="proc-btn proc-primary" disabled={!lines.length} onClick={() => showReview(true)}>
    Review purchase <ArrowRight size={15} />
  </button>;

  return <main ref={workspace} className={'proc-page inventory-workspace inventory-buy' + (lines.length ? ' inventory-workspace--selected' : '')}>
    <PageHeader title="Buy items" subtitle="Record a vendor invoice for items your school has received."
      breadcrumbs={[{ label: 'Inventory', to: ROUTES.INVENTORY.LIST }, { label: 'Buy items' }]}
      actions={review ? <button type="button" className="proc-btn" disabled={saving} onClick={() => showReview(false)}><ArrowLeft size={15} /> Back to products</button>
        : <Link to={back} className="proc-btn">Cancel</Link>} />
    <nav className="proc-tabs inventory-buy__steps" aria-label="Purchase steps">
      <button type="button" aria-current={!review ? 'step' : undefined} aria-pressed={!review} disabled={saving} onClick={() => showReview(false)}>
        <Boxes size={15} /> Products
      </button>
      <button type="button" aria-current={review ? 'step' : undefined} aria-pressed={review} disabled={saving || !lines.length} onClick={() => showReview(true)}>
        <ReceiptText size={15} /> Invoice and delivery
      </button>
    </nav>
    <form onSubmit={submit} onKeyDown={(event) => { if (event.key === 'Enter' && event.target.type === 'search') event.preventDefault(); }}>
      <div className="inventory-workspace__layout inventory-buy__layout">
        <div className="inventory-workspace__main">
          <div hidden={review}>
            <div className="proc-panel proc-pad inventory-buy__stock-picker">
              <ProcurementPicker label="Existing stock item" selected={null} onSelect={add} getOptions={loadStock}
                placeholder="Search existing stock by name, SKU, or barcode" />
            </div>
            <InventoryPresetCatalog selections={selections} full={lines.length >= MAX_CATALOG_ITEMS}
              onAdd={(item) => add(item, true)} onEdit={() => showReview(true)} actionLabel="Select product" />
          </div>
          {review && <fieldset className="inventory-workspace__fields" disabled={saving}>
            <div className="proc-stack">
              <PurchaseProducts lines={lines} onChange={changeLine} onRemove={remove} />
              {defaultVendor.loading && !vendorChoice && <Pending label="Loading vendor" />}
              {!vendorChoice && <ErrorMessage error={defaultVendor.error} onRetry={defaultVendor.refresh} />}
              <PurchaseDetailsFields form={form} field={field} vendor={vendor} onVendor={setVendor} dueDate={dueDate} paid={paid} />
              <ErrorMessage error={error} />
            </div>
          </fieldset>}
        </div>
        <aside className="proc-stack inventory-buy__sidebar">
          <fieldset className="inventory-workspace__fields" disabled={saving}>
            <PurchaseBudget sessions={sessions} sessionId={sessionId} onSession={(event) => setSession(event.target.value)}
              budget={budget} amounts={amounts} balance={balance} blocked={blocked} />
          </fieldset>
          <div className="proc-panel proc-pad proc-stack inventory-buy__checkout">
            <h2 className="proc-title">{lines.length} selected {lines.length === 1 ? 'product' : 'products'}</h2>
            {!review && lines.length > 0 && <ul className="inventory-selection__list">
              {lines.map((line) => <li key={line.key}>
                <div className="proc-line-title">
                  <span>{line.item.name}</span>
                  <button className="proc-btn proc-btn-sm" type="button" aria-label={'Remove ' + line.item.name} onClick={() => remove(line.key)}><Trash2 size={14} /></button>
                </div>
              </li>)}
            </ul>}
            {action}
          </div>
        </aside>
      </div>
      {lines.length > 0 && <div className="inventory-mobile-actions">
        <div><strong>{formatCurrency(amounts.total)}</strong><span>{lines.length} selected · {budget.data ? formatCurrency(budget.data.schoolRequirementsRemaining) + ' available' : 'Budget required'}</span></div>
        {action}
      </div>}
    </form>
  </main>;
}
