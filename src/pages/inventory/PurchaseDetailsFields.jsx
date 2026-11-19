import { CreditCard, ReceiptText, Truck } from 'lucide-react';
import { Input, SelectInput, TextareaInput } from '../../components/ui/FormControls.jsx';
import { Field } from '../../components/ui/ProcurementUI.jsx';
import ProcurementPicker from '../../components/ui/ProcurementPicker.jsx';
import { getVendors } from '../../services/vendorService.js';
import { CREDIT_METHOD, PAYMENT_METHODS, todayInput } from '../../utils/procurement.js';

const loadVendors = async (search) => (await getVendors({ search, limit: 15, sort: 'name', status: 'active' })).data.vendors;

export default function PurchaseDetailsFields({ form, field, vendor, onVendor, dueDate, paid }) {
  return <>
    <section className="proc-panel proc-pad proc-stack">
      <div className="proc-heading"><span className="proc-icon"><ReceiptText size={17} /></span><h2>Vendor and invoice</h2></div>
      <ProcurementPicker label="Vendor" selected={vendor} onSelect={onVendor} getOptions={loadVendors}
        placeholder="Search active vendors" />
      <div className="proc-fields proc-fields-3">
        <Field label="Supplier invoice number"><Input required value={form.supplierBillNumber} onChange={field('supplierBillNumber')} maxLength={100} /></Field>
        <Field label="Invoice date"><Input required type="date" value={form.billDate} onChange={field('billDate')} /></Field>
        <Field label="Purchase order number"><Input value={form.poNumber} onChange={field('poNumber')} /></Field>
        <Field label="Invoice document link" wide><Input type="url" value={form.invoiceAttachmentUrl} onChange={field('invoiceAttachmentUrl')} placeholder="https://" /></Field>
      </div>
    </section>
    <section className="proc-panel proc-pad proc-stack">
      <div className="proc-heading"><span className="proc-icon"><CreditCard size={17} /></span><h2>Charges and payment</h2></div>
      <p className="proc-hint">Record the payment made to your vendor.</p>
      <div className="proc-fields proc-fields-3">
        {[
          ['shippingCharges', 'Shipping'], ['otherCharges', 'Other charges'],
          ['discountAmount', 'Invoice discount'], ['taxAmount', 'Override invoice tax'],
        ].map(([key, label]) => <Field label={label} key={key}>
          <Input type="number" min="0" step="0.01" placeholder={key === 'taxAmount' ? 'Use item GST' : '0'} value={form[key]} onChange={field(key)} />
        </Field>)}
        <Field label="Payment method"><SelectInput value={form.paymentType} onChange={field('paymentType')}
          options={[CREDIT_METHOD, ...PAYMENT_METHODS]} showPlaceholder={false} /></Field>
        <Field label="Payment due date"><Input type="date" min={form.billDate} value={dueDate} onChange={field('dueDate')} /></Field>
        {form.paymentType !== CREDIT_METHOD && <>
          <Field label="Amount already paid" hint="Leave blank for the full invoice amount.">
            <Input type="number" min="0" step="0.01" value={form.amountPaid} onChange={field('amountPaid')} />
          </Field>
          {paid > 0 && <Field label="Payment date"><Input type="date" value={form.paymentDate || form.billDate} onChange={field('paymentDate')} /></Field>}
          <Field label="Payment reference"><Input value={form.transactionReference} onChange={field('transactionReference')} /></Field>
        </>}
      </div>
    </section>
    <section className="proc-panel proc-pad proc-stack">
      <div className="proc-heading"><span className="proc-icon"><Truck size={17} /></span><h2>Delivery and receipt</h2></div>
      <div className="proc-fields proc-fields-3">
        <Field label="Expected delivery"><Input type="date" value={form.expectedDeliveryDate} onChange={field('expectedDeliveryDate')} /></Field>
        <Field label="Received date"><Input required type="date" max={todayInput()} value={form.receivedDate} onChange={field('receivedDate')} /></Field>
        <Field label="Delivery location"><Input value={form.deliveryLocation} onChange={field('deliveryLocation')} /></Field>
        <Field label="Carrier"><Input value={form.deliveryCarrier} onChange={field('deliveryCarrier')} /></Field>
        <Field label="Tracking or delivery reference"><Input value={form.deliveryReference} onChange={field('deliveryReference')} /></Field>
        <Field label="Delivery notes" wide><TextareaInput rows={2} value={form.deliveryNotes} onChange={field('deliveryNotes')} /></Field>
        <Field label="Purchase notes" wide><TextareaInput rows={2} value={form.notes} onChange={field('notes')} /></Field>
      </div>
    </section>
  </>;
}
