import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, CheckCircle2, CircleDollarSign, Package, Plus, ShoppingCart, Wallet } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import { DataTable, Empty, ErrorMessage, Metric, Pagination, Pending, SearchField, Status } from '../../components/ui/ProcurementUI.jsx';
import { useDebouncedSearch, useProcurementAccess, useProcurementResource } from '../../hooks/useProcurement.js';
import { getVendors } from '../../services/vendorService.js';
import { ROUTES } from '../../routes/routes.js';
import { formatCurrency } from '../../utils';
import { recordId, VENDOR_CATEGORIES, VENDOR_STATUS_OPTIONS } from '../../utils/procurement.js';
import VendorFormModal from './VendorFormModal.jsx';
import { SelectInput } from '../../components/ui/FormControls.jsx';

const columns = [
  { key: 'name', label: 'Vendor', full: true, render: (vendor) => <>
    <Link className="proc-link" to={ROUTES.VENDORS.detail(recordId(vendor))}>{vendor.name}</Link>
    <small>{[vendor.vendorCode, vendor.city].filter(Boolean).join(' · ')}</small>
  </> },
  { key: 'category', label: 'Category' },
  { key: 'contact', label: 'Contact', render: (vendor) => <>{vendor.contactPerson || '—'}<small>{vendor.phone || vendor.email}</small></> },
  { key: 'terms', label: 'Payment terms', render: (vendor) => vendor.paymentTerms || '—' },
  { key: 'balance', label: 'Balance due', render: (vendor) => <strong className={vendor.outstandingBalance > 0 ? 'proc-warn' : ''}>{formatCurrency(vendor.outstandingBalance)}</strong> },
  { key: 'status', label: 'Status', render: (vendor) => <Status value={vendor.status || 'active'} /> },
];

async function loadSummary() {
  return (await getVendors({ summary: true, limit: 1 })).data.summary;
}

export default function VendorManagement() {
  const { canManageStock } = useProcurementAccess();
  const [keyword, setKeyword] = useState('');
  const search = useDebouncedSearch(keyword);
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [dialog, setDialog] = useState(null);
  const loadList = useCallback(async () => (await getVendors({ search, category, status, page, limit: 15 })).data, [search, category, status, page]);
  const list = useProcurementResource(loadList);
  const stats = useProcurementResource(loadSummary);
  const summary = stats.data;

  function complete() {
    setDialog(null);
    setPage(1);
    list.refresh();
    stats.refresh();
  }

  return <div className="proc-page">
    <PageHeader title="Vendors" subtitle="Manage suppliers, purchase receipts, and outstanding payments."
      actions={<>
        <Link to={ROUTES.INVENTORY.LIST} className="proc-btn"><Package size={15} /> Inventory</Link>
        {canManageStock && <>
          <Link className="proc-btn" to={ROUTES.INVENTORY.BUY}><ShoppingCart size={15} /> Buy items</Link>
          <button type="button" className="proc-btn proc-primary" onClick={() => setDialog('vendor')}><Plus size={16} /> Add vendor</button>
        </>}
      </>}
    />
    {summary && <div className="proc-metrics">
      <Metric icon={Building2} label="Vendors" value={summary.total} />
      <Metric icon={CheckCircle2} label="Active suppliers" value={summary.active} />
      <Metric icon={CircleDollarSign} label="Total invoiced" value={formatCurrency(summary.billed)} />
      <Metric icon={Wallet} label="Outstanding" value={formatCurrency(summary.outstanding)} tone={summary.outstanding > 0 ? 'warn' : undefined} />
    </div>}
    <ErrorMessage error={stats.error} onRetry={stats.refresh} />
    <section className="proc-panel proc-pad proc-stack" aria-label="Vendor directory">
      <div className="proc-toolbar">
        <SearchField label="Search vendors, contacts, or GSTIN" value={keyword} onChange={(value) => { setKeyword(value); setPage(1); }} />
        <SelectInput className="proc-input" aria-label="Vendor category" value={category} options={VENDOR_CATEGORIES} placeholder="All categories"
          onChange={(event) => { setCategory(event.target.value); setPage(1); }} />
        <SelectInput className="proc-input" aria-label="Vendor status" value={status} options={VENDOR_STATUS_OPTIONS} placeholder="All statuses"
          onChange={(event) => { setStatus(event.target.value); setPage(1); }} />
      </div>
      {list.loading && <Pending label="Loading vendors" />}
      <ErrorMessage error={list.error} onRetry={list.refresh} />
      {list.data && <>
        <DataTable label="Vendors" columns={columns} rows={list.data.vendors} empty={<Empty icon={Building2} title={search || category || status ? 'No matching vendors' : 'No vendors yet'} />} />
        <Pagination pagination={list.data.pagination} onPage={setPage} />
      </>}
    </section>
    {dialog === 'vendor' && <VendorFormModal onClose={() => setDialog(null)} onSaved={complete} />}
  </div>;
}
