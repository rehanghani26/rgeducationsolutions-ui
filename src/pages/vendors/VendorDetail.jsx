import { useCallback, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Archive, BarChart3, Boxes, Building2, CreditCard, Pencil, ReceiptText, Wallet } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { DataTable, Empty, ErrorMessage, Metric, Pagination, Pending, Status } from '../../components/ui/ProcurementUI.jsx';
import { useProcurementAccess, useProcurementResource } from '../../hooks/useProcurement.js';
import { deleteVendor, getVendorById } from '../../services/vendorService.js';
import { ROUTES } from '../../routes/routes.js';
import { formatCurrency, formatDate } from '../../utils';
import { invoiceNumber, recordId, STOCK_LABELS } from '../../utils/procurement.js';
import VendorFormModal from './VendorFormModal.jsx';
import VendorPaymentModal from './VendorPaymentModal.jsx';
import PurchaseBillModal from './PurchaseBillModal.jsx';
import PurchaseReceipt from './PurchaseReceipt.jsx';

const tabs = [['bills', 'Invoices', ReceiptText], ['profile', 'Profile', Building2], ['products', 'Items supplied', Boxes], ['payments', 'Payments', CreditCard]];
const productsColumns = [
  { key: 'name', label: 'Item', full: true, render: (item) => <>
    <Link className="proc-link" to={ROUTES.INVENTORY.detail(recordId(item))}>{item.name}</Link><small>{item.sku}</small>
  </> },
  { key: 'category', label: 'Category' },
  { key: 'quantity', label: 'Stock', render: (item) => item.quantity + ' ' + item.unit },
  { key: 'status', label: 'Status', render: (item) => <Status value={item.status} label={STOCK_LABELS[item.status]} /> },
];
const paymentColumns = [
  { key: 'date', label: 'Payment', full: true, render: (entry) => <><strong>{formatDate(entry.paymentDate)}</strong><small>{entry.paymentType}</small></> },
  { key: 'amount', label: 'Amount', render: (entry) => formatCurrency(entry.amount) },
  { key: 'reference', label: 'Reference', render: (entry) => entry.transactionReference || '—' },
  { key: 'bills', label: 'Applied to', render: (entry) => entry.appliedBills?.length
    ? entry.appliedBills.map(({ billNumber, amount }) => billNumber + ' (' + formatCurrency(amount) + ')').join(', ') : 'Vendor balance' },
  { key: 'notes', label: 'Notes', render: (entry) => <>{entry.notes || '—'}<small>{entry.recordedByName}</small></> },
];

function VendorProfile({ vendor }) {
  const details = [
    ['Contact person', vendor.contactPerson], ['Phone', vendor.phone], ['Alternate phone', vendor.altPhone],
    ['Contact email', vendor.email], ['Billing email', vendor.billingEmail],
    ['Website', /^https?:\/\//i.test(vendor.website || '') && <a className="proc-link" href={vendor.website} rel="noopener noreferrer" target="_blank">{vendor.website}</a>],
    ['Address', [vendor.address, vendor.city, vendor.state, vendor.pincode].filter(Boolean).join(', ')],
    ['Payment terms', vendor.paymentTerms], ['Lead time', vendor.leadTimeDays == null ? '' : vendor.leadTimeDays + ' days'],
    ['GSTIN', vendor.gstin], ['PAN', vendor.pan], ['Rating', vendor.rating ? vendor.rating + ' / 5' : ''],
  ];
  const bank = vendor.bankDetails;
  return <div className="proc-split">
    <section className="proc-panel proc-pad proc-stack">
      <h2 className="proc-title">Contact and registration</h2>
      <dl className="proc-details">{details.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || '—'}</dd></div>)}</dl>
      {vendor.notes && <p className="proc-hint">{vendor.notes}</p>}
    </section>
    {bank && <section className="proc-panel proc-pad proc-stack">
      <h2 className="proc-title">Payment details</h2>
      <dl className="proc-details">
        {[
          ['Account holder', bank.accountHolderName], ['Bank name', bank.bankName], ['Branch', bank.branchName],
          ['Account number', bank.accountNumber], ['IFSC', bank.ifscCode], ['UPI ID', bank.upiId],
        ].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || '—'}</dd></div>)}
      </dl>
    </section>}
  </div>;
}

function SpendHistory({ history, categories, averageOrderValue }) {
  const months = history.slice(-6);
  const max = Math.max(...months.map((entry) => entry.amount), 1);
  return <aside className="proc-panel proc-pad proc-stack" aria-label="Vendor spend">
    <div className="proc-heading"><span className="proc-icon"><BarChart3 size={17} /></span><div><h2>Monthly invoice totals</h2><p>{formatCurrency(averageOrderValue)} average invoice</p></div></div>
    {months.length ? <div className="proc-stack">
      {months.map(({ month, amount }) => <div key={month}>
        <div className="proc-line-title"><span>{month}</span><span>{formatCurrency(amount)}</span></div>
        <progress className="proc-progress" max={max} value={amount} aria-label={'Invoices in ' + month} />
      </div>)}
    </div> : <p className="proc-hint">Receive a purchase to see spend here.</p>}
    {categories.length > 0 && <div className="proc-form-section border-t pt-3 border-[var(--border-color)]">
      <h3 className="proc-title">Item subtotals by category</h3>
      <dl className="proc-amounts">
        {categories.map(({ category, amount }) => <div key={category}><dt>{category}</dt><dd>{formatCurrency(amount)}</dd></div>)}
      </dl>
    </div>}
  </aside>;
}

export default function VendorDetail() {
  const { id } = useParams();
  const { canArchive, canManageStock } = useProcurementAccess();
  const [tab, setTab] = useState('bills');
  const [page, setPage] = useState(1);
  const [dialog, setDialog] = useState(null);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState(null);
  const load = useCallback(async () => (await getVendorById(id)).data, [id]);
  const resource = useProcurementResource(load);
  const { vendor, bills = [], kpis, spendTrend = [], categoryBreakdown = [], suppliedProducts = [] } = resource.data || {};
  const canPay = canManageStock && vendor?.outstandingBalance > 0;

  function open(kind, bill) {
    setError(null);
    setDialog({ kind, bill });
  }
  function complete() {
    setDialog(null);
    setPage(1);
    resource.refresh();
  }
  async function remove() {
    setError(null);
    setWorking(true);
    try {
      await deleteVendor(id);
      complete();
    } catch (err) {
      setError(err);
    } finally {
      setWorking(false);
    }
  }

  const invoiceColumns = [
    { key: 'billNumber', label: 'Invoice', full: true, render: (bill) => <>
      <button className="proc-link text-left" type="button" onClick={() => open('receipt', bill)}>{invoiceNumber(bill)}</button>
      <small>{formatDate(bill.billDate)}{bill.sessionName ? ' · ' + bill.sessionName : ''}</small>
    </> },
    { key: 'total', label: 'Total', render: (bill) => formatCurrency(bill.grandTotal) },
    { key: 'balance', label: 'Due', render: (bill) => <>{formatCurrency(bill.balanceDue)}{bill.balanceDue > 0 && bill.dueDate && <small>{formatDate(bill.dueDate)}</small>}</> },
    { key: 'status', label: 'Payment', render: (bill) => <Status value={bill.paymentStatus} /> },
    ...(canPay ? [{ key: 'actions', label: 'Actions', render: (bill) => bill.balanceDue > 0 &&
      <button type="button" className="proc-btn proc-btn-sm" onClick={() => open('payment', bill)}>Record payment</button> }] : []),
  ];
  const pageSize = 12;
  const invoicePagination = { page, pages: Math.max(1, Math.ceil(bills.length / pageSize)), total: bills.length, limit: pageSize };

  return <main className="proc-page">
    <PageHeader title={vendor?.name || 'Vendor'} subtitle={vendor && [vendor.vendorCode, vendor.category].filter(Boolean).join(' · ')}
      breadcrumbs={[{ label: 'Vendors', to: ROUTES.VENDORS.LIST }, { label: vendor?.name || 'Details' }]}
      actions={vendor && <>
        {canArchive && vendor.status !== 'inactive' && <button type="button" className="proc-btn" onClick={() => open('archive')}><Archive size={14} /> Archive</button>}
        {canManageStock && <button type="button" className="proc-btn" onClick={() => open('edit')}><Pencil size={14} /> Edit vendor</button>}
        {canPay && <button type="button" className="proc-btn" onClick={() => open('payment')}><CreditCard size={15} /> Record payment</button>}
        {canManageStock && (!vendor.status || vendor.status === 'active') && <button type="button" className="proc-btn proc-primary" onClick={() => open('purchase')}><ReceiptText size={15} /> Receive purchase</button>}
      </>}
    />
    {resource.loading && <Pending label="Loading vendor" />}
    <ErrorMessage error={resource.error} onRetry={resource.refresh} />
    {vendor && <>
      <div className="proc-metrics">
        <Metric icon={ReceiptText} label="Total invoiced" value={formatCurrency(kpis.totalBilled)} note={kpis.totalBillsCount + ' invoices'} />
        <Metric icon={CreditCard} label="Total paid" value={formatCurrency(kpis.totalPaid)} />
        <Metric icon={Wallet} label="Balance due" value={formatCurrency(kpis.outstandingBalance)} tone={kpis.outstandingBalance > 0 ? 'warn' : undefined} />
        <Metric icon={Boxes} label="Items supplied" value={kpis.suppliedProductsCount} note={vendor.status || 'active'} />
      </div>
      <nav className="proc-tabs" aria-label="Vendor sections">
        {tabs.filter(([key]) => key !== 'payments' || vendor.payments).map(([key, label, Icon]) =>
          <button key={key} type="button" aria-pressed={tab === key} onClick={() => { setTab(key); setPage(1); }}><Icon size={14} /> {label}</button>)}
      </nav>
      {tab === 'bills' && <div className="proc-split">
        <section className="proc-panel proc-pad proc-stack">
          <h2 className="proc-title">Purchase invoices</h2>
          <DataTable label="Purchase invoices" columns={invoiceColumns} rows={bills.slice((page - 1) * pageSize, page * pageSize)} empty={<Empty icon={ReceiptText} title="No invoices recorded" />} />
          <Pagination pagination={invoicePagination} onPage={setPage} />
        </section>
        <SpendHistory history={spendTrend} categories={categoryBreakdown} averageOrderValue={kpis.averageOrderValue} />
      </div>}
      {tab === 'profile' && <VendorProfile vendor={vendor} />}
      {tab === 'products' && <section className="proc-panel proc-pad proc-stack">
        <h2 className="proc-title">Items supplied</h2>
        <DataTable label="Items supplied" columns={productsColumns} rows={suppliedProducts} empty={<Empty icon={Boxes} title="No items linked to this vendor" />} />
      </section>}
      {tab === 'payments' && <section className="proc-panel proc-pad proc-stack">
        <h2 className="proc-title">Payment history</h2>
        <DataTable label="Payment history" columns={paymentColumns} rows={vendor.payments || []} empty={<Empty icon={CreditCard} title="No separate payments recorded" description="Payments made at receipt are shown on the purchase invoice." />} />
      </section>}
    </>}
    {dialog?.kind === 'edit' && <VendorFormModal vendor={vendor} onClose={() => setDialog(null)} onSaved={complete} />}
    {dialog?.kind === 'purchase' && <PurchaseBillModal vendor={vendor} onClose={() => setDialog(null)} onSaved={() => { setTab('bills'); complete(); }} />}
    {dialog?.kind === 'payment' && <VendorPaymentModal vendor={vendor} bills={bills} bill={dialog.bill} onClose={() => setDialog(null)} onSaved={complete} />}
    {dialog?.kind === 'receipt' && <PurchaseReceipt bill={dialog.bill} onClose={() => setDialog(null)} />}
    {dialog?.kind === 'archive' && <Modal open title="Deactivate vendor" onClose={working ? undefined : () => setDialog(null)} size="sm" className="proc-modal">
      <div className="proc-stack">
        <p className="text-sm">Deactivation removes the vendor from new purchase forms. Open invoices and payments remain accessible.</p>
        <ErrorMessage error={error} />
        <div className="proc-form-footer">
          <button type="button" className="proc-btn" disabled={working} onClick={() => setDialog(null)}>Cancel</button>
          <button type="button" className="proc-btn proc-primary" disabled={working} onClick={remove}>{working ? 'Saving…' : 'Deactivate'}</button>
        </div>
      </div>
    </Modal>}
  </main>;
}
