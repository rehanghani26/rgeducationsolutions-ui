import { useCallback, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Archive, ArrowDownUp, Boxes, ClipboardList, FileText, MapPin, Package, Pencil, ReceiptText, Wallet } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { DataTable, Empty, ErrorMessage, Metric, Pending, Status } from '../../components/ui/ProcurementUI.jsx';
import { useProcurementAccess, useProcurementResource } from '../../hooks/useProcurement.js';
import { deleteInventoryItem, getInventoryById, inventoryAttachmentUrl } from '../../services/inventoryService.js';
import { ROUTES } from '../../routes/routes.js';
import { formatCurrency, formatDate } from '../../utils';
import { recordId, STOCK_LABELS } from '../../utils/procurement.js';
import PurchaseReceipt from '../vendors/PurchaseReceipt.jsx';
import StockAdjustmentModal from './StockAdjustmentModal.jsx';
import { movementColumns, purchaseColumns } from './inventoryTableColumns.jsx';

const tabs = [
  ['overview', 'Overview', ClipboardList], ['movements', 'Movements', ArrowDownUp],
  ['purchases', 'Purchases', ReceiptText], ['usage', 'Usage', Boxes],
];
const componentColumns = [
  { key: 'name', label: 'Item', full: true, render: (line) => <><strong>{line.name}</strong><small>{line.sku}</small></> },
  { key: 'quantity', label: 'Original quantity', render: (line) => line.quantity + ' ' + (line.unit || '') },
  { key: 'cost', label: 'Unit cost', render: (line) => formatCurrency(line.unitCost ?? line.price) },
];

function ItemOverview({ item }) {
  const vendor = typeof item.vendorId === 'object' ? item.vendorId : null;
  const attachments = [item.invoiceAttachment, ...(item.additionalAttachments || [])].filter((entry) => entry?.url);
  const fields = [
    ['SKU', item.sku], ['Category', [item.category, item.subcategory].filter(Boolean).join(' · ')],
    ['Brand', item.brand], ['Barcode', item.barcode], ['Unit', item.unit], ['Default GST', (item.gstRate ?? 0) + '%'],
    ...(item.actualPurchaseDate ? [['Original purchase date', formatDate(item.actualPurchaseDate)]] : []),
    ...(item.expectedDeliveryDate ? [['Original expected delivery', formatDate(item.expectedDeliveryDate)]] : []),
  ];
  const image = inventoryAttachmentUrl(item.imageUrl);

  return <div className="proc-split">
    <section className="proc-panel proc-pad proc-stack">
      <div className="proc-heading">
        {image ? <img src={image} className="proc-item-thumb" alt="" /> : <span className="proc-icon"><Package size={18} /></span>}
        <div><h2>Item details</h2><Status value={item.status} label={STOCK_LABELS[item.status]} /></div>
      </div>
      <dl className="proc-details">{fields.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || '—'}</dd></div>)}</dl>
      {item.description && <p className="proc-hint">{item.description}</p>}
      {item.legacyBundle && <>
        <h3 className="proc-title">Historical bundle contents</h3>
        <DataTable label="Original bundle items" columns={componentColumns} rows={item.items} />
      </>}
    </section>
    <div className="proc-stack">
      <section className="proc-panel proc-pad proc-stack">
        <div className="proc-heading"><span className="proc-icon"><MapPin size={17} /></span><h2>Storage and reorder</h2></div>
        <dl className="proc-details">
          {[
            ['Stock location', item.location], ['Bin or shelf', item.storageBin],
            ['Low-stock threshold', item.minStockLevel], ['Maximum stock', item.maxStockLevel], ['Reorder quantity', item.reorderQuantity],
            ['Preferred vendor', vendor && <Link className="proc-link" to={ROUTES.VENDORS.detail(recordId(vendor))}>{vendor.name}</Link>],
          ].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value ?? '—'}</dd></div>)}
        </dl>
      </section>
      {attachments.length > 0 && <section className="proc-panel proc-pad proc-stack">
        <h2 className="proc-title">Documents</h2>
        {attachments.map((attachment, index) => <a key={attachment.url + index} href={inventoryAttachmentUrl(attachment.url)} target="_blank"
          rel="noopener noreferrer" className="proc-btn justify-start"><FileText size={15} /> {attachment.originalName || attachment.filename || 'Open document'}</a>)}
      </section>}
    </div>
  </div>;
}

function ItemUsage({ item, issuances, consumptionTrend }) {
  const max = Math.max(1, ...consumptionTrend.map((point) => point.quantity));
  const ids = [item._id, item.id].filter(Boolean).map(String);
  const columns = [
    { key: 'recipient', label: 'Recipient', full: true, render: (row) => <><strong>{row.className || row.studentName || row.teacherName || row.recipientType}</strong><small>{row.issuanceNumber}</small></> },
    { key: 'date', label: 'Issue date', render: (row) => formatDate(row.issuanceDate) },
    { key: 'quantity', label: 'Quantity', render: (row) => (row.items || []).reduce((sum, line) => ids.includes(String(line.itemId)) ? sum + Number(line.quantity) : sum, 0) + ' ' + item.unit },
    { key: 'purpose', label: 'Purpose', render: (row) => row.purpose || '—' },
  ];
  return <div className="proc-split">
    <section className="proc-panel proc-pad proc-stack">
      <h2 className="proc-title">Item issues</h2>
      <DataTable label="Item issues" columns={columns} rows={issuances} empty={<Empty title="No issues recorded" />} />
    </section>
    <section className="proc-panel proc-pad proc-stack">
      <h2 className="proc-title">Monthly usage</h2>
      {consumptionTrend.length ? consumptionTrend.map(({ month, quantity }) => <div key={month}>
        <div className="proc-line-title"><span>{month}</span><span>{quantity} {item.unit}</span></div>
        <progress className="proc-progress" max={max} value={quantity} aria-label={'Quantity issued in ' + month} />
      </div>) : <p className="proc-hint">Usage appears as items are issued.</p>}
    </section>
  </div>;
}

export default function InventoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { canManageStock, canArchive } = useProcurementAccess();
  const load = useCallback(async () => (await getInventoryById(id)).data, [id]);
  const resource = useProcurementResource(load);
  const { item, purchases = [], transactions = [], issuances = [], kpis, consumptionTrend = [] } = resource.data || {};
  const [tab, setTab] = useState('overview');
  const [dialog, setDialog] = useState(null);
  const [error, setError] = useState(null);
  const [working, setWorking] = useState(false);
  const hasHistory = Boolean(item?.quantity || purchases.length || transactions.length || issuances.length);

  function complete() {
    setDialog(null);
    resource.refresh();
  }

  async function remove() {
    setWorking(true);
    setError(null);
    try {
      const result = await deleteInventoryItem(id);
      if (result.data?.discontinued) complete();
      else navigate(ROUTES.INVENTORY.LIST);
    } catch (err) {
      setError(err);
    } finally {
      setWorking(false);
    }
  }

  return <main className="proc-page">
    <PageHeader title={item?.name || 'Inventory item'} subtitle={item && item.sku + ' · ' + item.category}
      breadcrumbs={[{ label: 'Inventory', to: ROUTES.INVENTORY.LIST }, { label: item?.sku || 'Item' }]}
      actions={item && <>
        {canArchive && item.status !== 'discontinued' && <button type="button" className="proc-btn" onClick={() => { setError(null); setDialog({ kind: 'archive' }); }}><Archive size={15} /> Archive</button>}
        {canManageStock && <Link className="proc-btn" to={ROUTES.INVENTORY.edit(id)}><Pencil size={15} /> Edit item</Link>}
        {canManageStock && (item.status !== 'discontinued' || item.quantity > 0) &&
          <button className="proc-btn proc-primary" type="button" onClick={() => setDialog({ kind: 'adjust' })}><ArrowDownUp size={15} /> Adjust stock</button>}
      </>}
    />
    {resource.loading && <Pending label="Loading item details" />}
    <ErrorMessage error={resource.error} onRetry={resource.refresh} />
    {item && <>
      <div className="proc-metrics">
        <Metric icon={Package} label="On hand" value={item.quantity + ' ' + item.unit} note={STOCK_LABELS[item.status]} />
        <Metric icon={Wallet} label="Inventory value" value={formatCurrency(kpis.currentValuation)} note={formatCurrency(item.unitCost) + ' per ' + item.unit} />
        <Metric icon={ReceiptText} label="Quantity received" value={kpis.totalProcuredQty + ' ' + item.unit} />
        <Metric icon={Boxes} label="Quantity issued" value={kpis.totalIssuedQty + ' ' + item.unit} />
      </div>
      <nav className="proc-tabs" aria-label="Item sections">{tabs.map(([key, label, Icon]) =>
        <button type="button" key={key} aria-pressed={tab === key} onClick={() => setTab(key)}><Icon size={14} /> {label}</button>)}
      </nav>
      {tab === 'overview' && <ItemOverview item={item} />}
      {tab === 'movements' && <section className="proc-panel proc-pad proc-stack">
        <h2 className="proc-title">Recent stock movements</h2>
        <DataTable label="Item stock movements" columns={movementColumns} rows={transactions} empty={<Empty icon={ArrowDownUp} title="No movements recorded" />} />
      </section>}
      {tab === 'purchases' && <section className="proc-panel proc-pad proc-stack">
        <h2 className="proc-title">Purchase history</h2>
        <DataTable label="Item purchases" columns={purchaseColumns((bill) => setDialog({ kind: 'receipt', bill }))} rows={purchases} empty={<Empty icon={ReceiptText} title="No purchases recorded" />} />
      </section>}
      {tab === 'usage' && <ItemUsage item={item} issuances={issuances} consumptionTrend={consumptionTrend} />}
    </>}
    {dialog?.kind === 'adjust' && <StockAdjustmentModal item={item} onClose={() => setDialog(null)} onSaved={complete} />}
    {dialog?.kind === 'receipt' && <PurchaseReceipt bill={dialog.bill} onClose={() => setDialog(null)} />}
    {dialog?.kind === 'archive' && <Modal open title={hasHistory ? 'Discontinue item' : 'Remove item'} onClose={working ? undefined : () => setDialog(null)} size="sm" className="proc-modal">
      <div className="proc-stack">
        <p className="text-sm">{hasHistory ? 'The item and its stock history will stay in your records. Discontinued items are excluded from new purchases.' : 'Remove this unused item from the catalog?'}</p>
        <ErrorMessage error={error} />
        <div className="proc-form-footer">
          <button className="proc-btn" type="button" disabled={working} onClick={() => setDialog(null)}>Cancel</button>
          <button className="proc-btn proc-primary" type="button" disabled={working} onClick={remove}>{working ? 'Saving…' : hasHistory ? 'Discontinue' : 'Remove item'}</button>
        </div>
      </div>
    </Modal>}
  </main>;
}
