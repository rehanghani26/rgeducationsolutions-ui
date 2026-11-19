import { useState } from 'react';
import { Building2, CreditCard, MapPin } from 'lucide-react';
import Modal from '../../components/ui/Modal.jsx';
import { ErrorMessage, Field } from '../../components/ui/ProcurementUI.jsx';
import { createVendor, updateVendor } from '../../services/vendorService.js';
import { PAYMENT_TERMS, recordId, VENDOR_CATEGORIES, VENDOR_STATUSES } from '../../utils/procurement.js';

const contactFields = [
  ['contactPerson', 'Contact person'], ['phone', 'Phone', 'tel'], ['altPhone', 'Alternate phone', 'tel'],
  ['email', 'Contact email', 'email'], ['billingEmail', 'Billing email', 'email'], ['website', 'Website'],
];
const registrationFields = [['gstin', 'GSTIN'], ['pan', 'PAN']];
const bankFields = [
  ['accountHolderName', 'Account holder'], ['bankName', 'Bank name'], ['accountNumber', 'Account number'],
  ['ifscCode', 'IFSC'], ['branchName', 'Branch'], ['upiId', 'UPI ID'],
];

export default function VendorFormModal({ vendor, onClose, onSaved }) {
  const [form, setForm] = useState(() => {
    const base = { name: '', vendorCode: '', category: 'General', status: 'active', paymentTerms: 'Net 30', rating: 5, ...vendor };
    return { ...base, bankDetails: vendor?.bankDetails || {} };
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const field = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const {
      name, vendorCode, category, status, paymentTerms, rating, address, city, state, pincode,
      gstin, pan, notes, email, billingEmail, contactPerson, phone, altPhone, website, leadTimeDays, bankDetails,
    } = form;
    const data = {
      name, vendorCode, category, status, paymentTerms, rating, address, city, state, pincode,
      gstin, pan, notes, email, billingEmail, contactPerson, phone, altPhone, website, leadTimeDays, bankDetails,
    };
    try {
      if (vendor) await updateVendor(recordId(vendor), data);
      else await createVendor(data);
      onSaved();
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  }

  return <Modal open onClose={saving ? undefined : onClose} closeOnOverlayClick={!saving} className="proc-modal" size="xl" title={vendor ? 'Edit vendor' : 'Register vendor'}>
    <form className="proc-form" onSubmit={submit}>
      <section className="proc-form-section">
        <div className="proc-heading"><span className="proc-icon"><Building2 size={17} /></span><h2>Vendor profile</h2></div>
        <div className="proc-fields proc-fields-3">
          <Field label="Vendor name"><input value={form.name} onChange={field('name')} required /></Field>
          <Field label="Vendor code"><input value={form.vendorCode} onChange={field('vendorCode')} placeholder="Auto-generated" /></Field>
          <Field label="Category"><select value={form.category} onChange={field('category')}>{VENDOR_CATEGORIES.map((name) => <option key={name}>{name}</option>)}</select></Field>
          <Field label="Status"><select value={form.status} onChange={field('status')}>{VENDOR_STATUSES.map((status) => <option key={status} value={status}>{status[0].toUpperCase() + status.slice(1)}</option>)}</select></Field>
          <Field label="Payment terms"><select value={form.paymentTerms} onChange={field('paymentTerms')}>{PAYMENT_TERMS.map((term) => <option key={term}>{term}</option>)}</select></Field>
          <Field label="Lead time (days)"><input type="number" min="0" max="365" step="1" value={form.leadTimeDays ?? ''} onChange={field('leadTimeDays')} /></Field>
        </div>
      </section>
      <section className="proc-form-section">
        <div className="proc-heading"><span className="proc-icon"><MapPin size={17} /></span><h2>Contacts and address</h2></div>
        <div className="proc-fields proc-fields-3">
          {contactFields.map(([key, label, type]) => <Field label={label} key={key}><input type={type || 'text'} value={form[key] || ''} onChange={field(key)} /></Field>)}
          <Field label="Address" wide><textarea rows={2} value={form.address || ''} onChange={field('address')} /></Field>
          {['City', 'State', 'Pincode'].map((label) => {
            const key = label.toLowerCase();
            return <Field label={label} key={key}><input value={form[key] || ''} onChange={field(key)} /></Field>;
          })}
        </div>
      </section>
      <section className="proc-form-section">
        <div className="proc-heading"><span className="proc-icon"><CreditCard size={17} /></span><h2>Tax and payment details</h2></div>
        <div className="proc-fields proc-fields-3">
          {registrationFields.map(([key, label]) => <Field label={label} key={key}><input value={form[key] || ''} onChange={field(key)} autoCapitalize="characters" /></Field>)}
          <Field label="Rating (1–5)"><input type="number" min="1" max="5" step="0.1" value={form.rating} onChange={field('rating')} /></Field>
          {bankFields.map(([key, label]) => <Field label={label} key={key}><input value={form.bankDetails[key] || ''}
            onChange={(event) => setForm((current) => ({ ...current, bankDetails: { ...current.bankDetails, [key]: event.target.value } }))} /></Field>)}
          <Field label="Notes" wide><textarea rows={2} value={form.notes || ''} onChange={field('notes')} /></Field>
        </div>
      </section>
      <ErrorMessage error={error} />
      <div className="proc-form-footer">
        <button className="proc-btn" type="button" onClick={onClose} disabled={saving}>Cancel</button>
        <button className="proc-btn proc-primary" type="submit" disabled={saving}>{saving ? 'Saving…' : vendor ? 'Save vendor' : 'Register vendor'}</button>
      </div>
    </form>
  </Modal>;
}
