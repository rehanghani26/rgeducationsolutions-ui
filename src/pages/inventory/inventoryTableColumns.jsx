import { Link } from 'react-router-dom';
import { Status } from '../../components/ui/ProcurementUI.jsx';
import { ROUTES } from '../../routes/routes.js';
import { formatCurrency, formatDate, formatDateTime } from '../../utils';
import { invoiceNumber, MOVEMENT_LABELS } from '../../utils/procurement.js';

export const movementColumns = [
  { key: 'item', label: 'Movement', full: true, render: (row) => <>
    <Link className="proc-link" to={ROUTES.INVENTORY.detail(row.itemId)}>{row.itemName || row.sku}</Link>
    <small>{MOVEMENT_LABELS[row.type] || row.type} · {formatDateTime(row.timestamp)}</small>
  </> },
  { key: 'quantity', label: 'Quantity', render: (row) => <strong className={row.quantity > 0 ? 'proc-good' : 'proc-danger'}>
    {row.quantity > 0 ? '+' : ''}{row.quantity} {row.unit}
  </strong> },
  { key: 'balanceAfter', label: 'Stock after', render: (row) => row.balanceAfter + ' ' + (row.unit || '') },
  { key: 'reference', label: 'Reference', render: (row) => <>{row.referenceDocNumber || row.transactionNumber}<small>{row.partyName}</small></> },
  { key: 'reason', label: 'Reason', render: (row) => <>{row.reason || '—'}<small>{row.performedByName}</small></> },
];

export function purchaseColumns(openReceipt) {
  return [
    { key: 'billNumber', label: 'Invoice', full: true, render: (bill) => <>
      <button className="proc-link text-left" type="button" onClick={() => openReceipt(bill)}>{invoiceNumber(bill)}</button>
      <small>{bill.vendorName || 'Vendor'}{bill.poNumber ? ' · PO ' + bill.poNumber : ''}</small>
    </> },
    { key: 'billDate', label: 'Invoice date', render: (bill) => <>{formatDate(bill.billDate)}<small>{bill.sessionName || 'Unassigned'}</small></> },
    { key: 'receivedDate', label: 'Received', render: (bill) => formatDate(bill.receivedDate) },
    { key: 'total', label: 'Total', render: (bill) => formatCurrency(bill.grandTotal) },
    { key: 'due', label: 'Balance due', render: (bill) => <>{formatCurrency(bill.balanceDue)}{bill.balanceDue > 0 && bill.dueDate && <small>{formatDate(bill.dueDate)}</small>}</> },
    { key: 'status', label: 'Payment', render: (bill) => <Status value={bill.paymentStatus} /> },
  ];
}
