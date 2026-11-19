import { useCallback, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertTriangle, ArrowDownUp, Boxes, Building2, CircleDollarSign, Package, PackageX, Plus, ReceiptText, Wallet } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import { DataTable, Empty, ErrorMessage, Metric, Pagination, Pending, SearchField, Status } from '../../components/ui/ProcurementUI.jsx';
import { useDebouncedSearch, useProcurementAccess, useProcurementResource } from '../../hooks/useProcurement.js';
import { getAcademicSessions } from '../../services/budgetService.js';
import { getInventoryItems, getInventorySummary, getInventoryTransactions, getPurchases, inventoryAttachmentUrl } from '../../services/inventoryService.js';
import { INVENTORY_CATEGORIES } from '../../constants/inventoryOptions.js';
import { ROUTES } from '../../routes/routes.js';
import { formatCurrency } from '../../utils';
import { MOVEMENT_LABELS, recordId, STOCK_LABELS } from '../../utils/procurement.js';
import PurchaseBillModal from '../vendors/PurchaseBillModal.jsx';
import PurchaseReceipt from '../vendors/PurchaseReceipt.jsx';
import StockAdjustmentModal from './StockAdjustmentModal.jsx';
import { movementColumns, purchaseColumns } from './inventoryTableColumns.jsx';

const tabs = [['catalog', 'Stock catalog', Boxes], ['purchases', 'Purchases', ReceiptText], ['ledger', 'Movements', ArrowDownUp]];
const searches = { catalog: 'Search items, SKUs, or barcodes', purchases: 'Search invoices or vendors', ledger: 'Search movements or references' };
const listReaders = { catalog: getInventoryItems, purchases: getPurchases, ledger: getInventoryTransactions };
const listKeys = { catalog: 'inventory', purchases: 'purchases', ledger: 'transactions' };

function BudgetStrip({ summary, canReadBudget }) {
  const { budgetHealth: budget, session } = summary;
  return <section className="proc-panel proc-pad proc-stock-budget">
    <div className="proc-heading"><span className="proc-icon"><Wallet size={18} /></span><div>
      <h2>Inventory budget</h2>
      <p>{session?.sessionName || 'No active academic session'}{budget?.allocationStatus === 'closed' ? ' · Closed' : ''}</p>
    </div></div>
    {budget ? <dl className="proc-details">
      <div><dt>Allocated</dt><dd>{formatCurrency(budget.schoolRequirementsBudget)}</dd></div>
      <div><dt>Committed</dt><dd>{formatCurrency(budget.schoolRequirementsSpent)}</dd></div>
      <div><dt>{budget.remainingBudget < 0 ? 'Over budget' : 'Available'}</dt><dd className={budget.remainingBudget < 0 ? 'proc-danger font-bold' : 'font-bold'}>{formatCurrency(Math.abs(budget.remainingBudget))}</dd></div>
    </dl> : <p className="proc-hint">No approved inventory allocation.</p>}
    {canReadBudget && <Link className="proc-btn" to={ROUTES.BUDGET + (session ? '?session=' + encodeURIComponent(recordId(session)) : '')}>Budget details</Link>}
  </section>;
}

export default function InventoryList() {
  const { canManageStock, canReadBudget } = useProcurementAccess();
  const [params, setParams] = useSearchParams();
  const tab = tabs.some(([key]) => key === params.get('tab')) ? params.get('tab') : 'catalog';
  const sessionId = params.get('session') || '';
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [dialog, setDialog] = useState(null);
  const search = useDebouncedSearch(keyword);
  const sessions = useProcurementResource(getAcademicSessions, tab === 'purchases');

  const loadSummary = useCallback(async () => (await getInventorySummary({ sessionId })).data, [sessionId]);
  const summary = useProcurementResource(loadSummary);
  const loadRows = useCallback(async () => {
    const filters = tab === 'catalog' ? { category, status: filter } :
      tab === 'purchases' ? { sessionId, status: filter } : { type: filter };
    return (await listReaders[tab]({ page, limit: 16, search, ...filters })).data;
  }, [tab, category, sessionId, filter, page, search]);
  const rows = useProcurementResource(loadRows);

  function changeTab(key) {
    setKeyword('');
    setFilter('');
    setPage(1);
    setParams(key === 'catalog' ? {} : { tab: key, ...(key === 'purchases' && sessionId ? { session: sessionId } : {}) });
  }

  function saved(toPurchases = false) {
    setDialog(null);
    setPage(1);
    if (toPurchases) changeTab('purchases');
    rows.refresh();
    summary.refresh();
  }

  const catalogColumns = [
    { key: 'item', label: 'Item', full: true, render: (item) => {
      const image = inventoryAttachmentUrl(item.imageUrl);
      return <div className="proc-heading">
        {image ? <img className="proc-item-thumb" src={image} alt="" loading="lazy" /> : <span className="proc-icon"><Package size={16} /></span>}
        <div className="min-w-0">
          <Link className="proc-link" to={ROUTES.INVENTORY.detail(recordId(item))}>{item.name}</Link>
          <small>{item.sku} · {item.category}{item.legacyBundle ? ' · Historical bundle' : ''}</small>
        </div>
      </div>;
    } },
    { key: 'stock', label: 'Stock', render: (item) => <><strong>{item.quantity} {item.unit}</strong><small>Min {item.minStockLevel ?? 0}</small></> },
    { key: 'stockValue', label: 'Stock value', render: (item) => formatCurrency(item.stockValue) },
    { key: 'location', label: 'Location', render: (item) => <>{item.location || '—'}<small>{item.storageBin}</small></> },
    { key: 'status', label: 'Status', render: (item) => <Status value={item.status} label={STOCK_LABELS[item.status]} /> },
    ...(canManageStock ? [{ key: 'adjust', label: 'Actions', render: (item) => (item.status !== 'discontinued' || item.quantity > 0) &&
      <button className="proc-btn proc-btn-sm" type="button" onClick={() => setDialog({ kind: 'adjust', item })}>Adjust stock</button> }] : []),
  ];
  const columns = tab === 'catalog' ? catalogColumns :
    tab === 'purchases' ? purchaseColumns((bill) => setDialog({ kind: 'receipt', bill })) : movementColumns;
  const data = summary.data;

  return <main className="proc-page">
    <PageHeader title="Inventory" subtitle="Track catalog items, vendor receipts, and stock movements."
      actions={<>
        <Link className="proc-btn" to={ROUTES.VENDORS.LIST}><Building2 size={15} /> Vendors</Link>
        {canManageStock && <>
          <button type="button" className="proc-btn" onClick={() => setDialog({ kind: 'purchase' })}><ReceiptText size={15} /> Receive purchase</button>
          <Link className="proc-btn proc-primary" to={ROUTES.INVENTORY.CREATE}><Plus size={16} /> Add items</Link>
        </>}
      </>}
    />
    {data && <>
      <div className="proc-metrics">
        <Metric icon={Boxes} label="Catalog items" value={data.totalItems} note={data.discontinuedCount ? data.discontinuedCount + ' discontinued' : undefined} />
        <Metric icon={CircleDollarSign} label="Stock value" value={formatCurrency(data.totalStockValue)} />
        <Metric icon={AlertTriangle} label="Low stock" value={data.lowStockCount} tone={data.lowStockCount ? 'warn' : undefined} />
        <Metric icon={PackageX} label="Out of stock" value={data.outOfStockCount} tone={data.outOfStockCount ? 'danger' : undefined} />
      </div>
      <BudgetStrip summary={data} canReadBudget={canReadBudget} />
    </>}
    <ErrorMessage error={summary.error} onRetry={summary.refresh} />
    <nav className="proc-tabs" aria-label="Inventory sections">
      {tabs.map(([key, label, Icon]) => <button type="button" key={key} aria-pressed={tab === key} onClick={() => changeTab(key)}><Icon size={14} /> {label}</button>)}
    </nav>
    <section className="proc-panel proc-pad proc-stack" aria-label={tabs.find(([key]) => key === tab)[1]}>
      <div className="proc-toolbar">
        <SearchField label={searches[tab]} value={keyword} onChange={(value) => { setKeyword(value); setPage(1); }} />
        {tab === 'catalog' && <select className="proc-input" aria-label="Item category" value={category} onChange={(event) => { setCategory(event.target.value); setPage(1); }}>
          <option value="">All categories</option>
          {[...INVENTORY_CATEGORIES, 'Books', 'Computers', 'Uniforms', 'Electronics'].map((entry) => <option key={entry}>{entry}</option>)}
        </select>}
        {tab === 'purchases' && <select className="proc-input" aria-label="Purchase session" value={sessionId} onChange={(event) => {
          const session = event.target.value;
          setPage(1);
          setParams({ tab, ...(session ? { session } : {}) });
        }}>
          <option value="">All sessions</option>
          {(sessions.data || []).map((session) => <option key={recordId(session)} value={recordId(session)}>{session.sessionName}</option>)}
        </select>}
        <select className="proc-input" aria-label={tab === 'ledger' ? 'Movement type' : 'Status'} value={filter} onChange={(event) => { setFilter(event.target.value); setPage(1); }}>
          <option value="">All {tab === 'ledger' ? 'movements' : 'statuses'}</option>
          {Object.entries(tab === 'catalog' ? STOCK_LABELS : tab === 'ledger' ? MOVEMENT_LABELS : { Paid: 'Paid', Partial: 'Partial', Unpaid: 'Unpaid' }).map(([key, label]) =>
            <option value={key} key={key}>{label}</option>)}
        </select>
      </div>
      {tab === 'purchases' && <ErrorMessage error={sessions.error} onRetry={sessions.refresh} />}
      {rows.loading && <Pending label={tab === 'catalog' ? 'Loading stock' : tab === 'purchases' ? 'Loading purchases' : 'Loading movements'} />}
      <ErrorMessage error={rows.error} onRetry={rows.refresh} />
      {rows.data && <>
        <DataTable columns={columns} rows={rows.data[listKeys[tab]]} label={tabs.find(([key]) => key === tab)[1]}
          empty={<Empty icon={tab === 'purchases' ? ReceiptText : Boxes} title={search || filter || (tab === 'catalog' && category) ? 'No matching records' : 'No records yet'} />} />
        <Pagination pagination={rows.data.pagination} onPage={setPage} />
      </>}
    </section>
    {dialog?.kind === 'purchase' && <PurchaseBillModal session={sessionId} onClose={() => setDialog(null)} onSaved={() => saved(true)} />}
    {dialog?.kind === 'adjust' && <StockAdjustmentModal item={dialog.item} onClose={() => setDialog(null)} onSaved={() => saved()} />}
    {dialog?.kind === 'receipt' && <PurchaseReceipt bill={dialog.bill} onClose={() => setDialog(null)} />}
  </main>;
}
