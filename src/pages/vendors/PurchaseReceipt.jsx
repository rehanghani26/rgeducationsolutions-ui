import { FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import Modal from '../../components/ui/Modal.jsx';
import { DataTable, Empty, Status } from '../../components/ui/ProcurementUI.jsx';
import { ROUTES } from '../../routes/routes.js';
import { inventoryAttachmentUrl } from '../../services/inventoryService.js';
import { formatCurrency, formatDate } from '../../utils';
import { invoiceNumber } from '../../utils/procurement.js';

const lineColumns = [
  { key: 'item', label: 'Item', full: true, render: (item) => <>
    {item.itemId ? <Link className="proc-link" to={ROUTES.INVENTORY.detail(item.itemId)}>{item.name}</Link> : <strong>{item.name}</strong>}
    <small>{[item.sku, item.category].filter(Boolean).join(' · ')}</small>
  </> },
  { key: 'quantity', label: 'Quantity', render: (item) => item.quantity + ' ' + (item.unit || '') },
  { key: 'unitCost', label: 'Unit cost', render: (item) => formatCurrency(item.unitCost) },
  { key: 'gstRate', label: 'GST', render: (item) => (item.gstRate ?? 0) + '%' },
  { key: 'totalCost', label: 'Subtotal', render: (item) => formatCurrency(item.totalCost) },
];

export default function PurchaseReceipt({ bill, onClose }) {
  const attachment = inventoryAttachmentUrl(bill.invoiceAttachmentUrl);
  const budget = bill.budgetDeducted;
  return <Modal open title={'Invoice ' + invoiceNumber(bill)} subtitle={bill.vendorName} onClose={onClose} className="proc-modal" size="xl">
    <div className="proc-stack">
      <div className="proc-line-title"><Status value={bill.paymentStatus} />{bill.poNumber && <span>PO {bill.poNumber}</span>}</div>
      <dl className="proc-details">
        <div><dt>Invoice date</dt><dd>{formatDate(bill.billDate)}</dd></div>
        <div><dt>Received on</dt><dd>{formatDate(bill.receivedDate)}</dd></div>
        {bill.expectedDeliveryDate && <div><dt>Expected delivery</dt><dd>{formatDate(bill.expectedDeliveryDate)}</dd></div>}
        {bill.receivedByName && <div><dt>Received by</dt><dd>{bill.receivedByName}</dd></div>}
        {bill.deliveryCarrier && <div><dt>Delivery carrier</dt><dd>{bill.deliveryCarrier}</dd></div>}
        {bill.deliveryReference && <div><dt>Delivery reference</dt><dd>{bill.deliveryReference}</dd></div>}
        {bill.deliveryLocation && <div><dt>Delivered to</dt><dd>{bill.deliveryLocation}</dd></div>}
        {bill.deliveryNotes && <div><dt>Delivery notes</dt><dd>{bill.deliveryNotes}</dd></div>}
        <div><dt>Due date</dt><dd>{formatDate(bill.dueDate)}</dd></div>
        <div><dt>Academic session</dt><dd>{bill.sessionName || 'Unassigned'}</dd></div>
        <div><dt>Payment method at receipt</dt><dd>{bill.paymentType || '—'}</dd></div>
        {bill.initialAmountPaid != null && <div><dt>Amount paid at receipt</dt><dd>{formatCurrency(bill.initialAmountPaid)}</dd></div>}
        {bill.paymentDate && <div><dt>Payment date at receipt</dt><dd>{formatDate(bill.paymentDate)}</dd></div>}
        <div><dt>Payment reference at receipt</dt><dd>{bill.transactionReference || '—'}</dd></div>
      </dl>
      <DataTable columns={lineColumns} rows={bill.items || []} label="Invoice lines" empty={<Empty title="No invoice lines" />} />
      <dl className="proc-amounts">
        <div><dt>Subtotal</dt><dd>{formatCurrency(bill.subtotal)}</dd></div>
        <div><dt>Tax</dt><dd>{formatCurrency(bill.taxAmount)}</dd></div>
        <div><dt>Shipping and other charges</dt><dd>{formatCurrency(Number(bill.shippingCharges || 0) + Number(bill.otherCharges || 0))}</dd></div>
        <div><dt>Discount</dt><dd>{formatCurrency(bill.discountAmount)}</dd></div>
        <div className="proc-total"><dt>Invoice total</dt><dd>{formatCurrency(bill.grandTotal)}</dd></div>
        <div><dt>Paid to date</dt><dd>{formatCurrency(bill.amountPaid)}</dd></div>
        <div><dt>Balance due</dt><dd className={bill.balanceDue > 0 ? 'proc-warn' : ''}>{formatCurrency(bill.balanceDue)}</dd></div>
      </dl>
      {budget?.budgetAllocationId && <section className="proc-stack">
        <h3 className="proc-title">Inventory budget at purchase</h3>
        <dl className="proc-details">
          <div><dt>Charged to inventory</dt><dd>{formatCurrency(budget.amount)}</dd></div>
          <div><dt>Committed before</dt><dd>{formatCurrency(budget.previousSpent)}</dd></div>
          <div><dt>Committed after</dt><dd>{formatCurrency(budget.newSpent)}</dd></div>
          {budget.allocatedAmount != null && <div><dt>Available after purchase</dt><dd>{formatCurrency(budget.allocatedAmount - budget.newSpent)}</dd></div>}
        </dl>
      </section>}
      {bill.notes && <p className="proc-hint">{bill.notes}</p>}
      {attachment && <div className="proc-actions"><a className="proc-btn" href={attachment} target="_blank" rel="noopener noreferrer"><FileText size={15} /> Open invoice document</a></div>}
    </div>
  </Modal>;
}
