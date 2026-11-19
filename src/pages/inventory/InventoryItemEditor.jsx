import { ChevronDown } from 'lucide-react';
import { Field } from '../../components/ui/ProcurementUI.jsx';
import ProcurementPicker from '../../components/ui/ProcurementPicker.jsx';
import { INVENTORY_ITEM_CATEGORIES, INVENTORY_UNIT_OPTIONS } from '../../constants/inventoryOptions.js';
import { getVendors } from '../../services/vendorService.js';
import { recordId } from '../../utils/procurement.js';
import InventoryProductPhoto from './InventoryProductPhoto.jsx';
import { Input, SelectInput, SwitchInput, TextareaInput } from '../../components/ui/FormControls.jsx';

const inventoryNumbers = [
  ['minStockLevel', 'Low-stock threshold'], ['maxStockLevel', 'Maximum stock'], ['reorderQuantity', 'Reorder quantity'],
];
const productFields = [
  ['sku', 'SKU', 'Auto-generated'], ['brand', 'Brand'], ['barcode', 'Barcode'], ['subcategory', 'Subcategory'],
];
const loadVendors = async (search) =>
  (await getVendors({ search, sort: 'name', status: 'active', limit: 15 })).data.vendors;

export default function InventoryItemEditor({ row, editing, issue, onChange }) {
  const values = row.values;
  const update = (key) => (event) => onChange(row.key, { [key]: event.target.value });
  const input = (key) => ({
    value: values[key],
    onChange: update(key),
    'data-inventory-field': key,
    'aria-invalid': issue?.field === key || undefined,
  });

  return <section className="proc-panel inventory-item-editor" aria-labelledby="inventory-item-heading">
    <div className="inventory-item-editor__head">
      <InventoryProductPhoto value={values.imageUrl} priority className="inventory-item-editor__photo" />
      <div>
        <h2 id="inventory-item-heading" tabIndex={-1}>{values.name || 'Custom item'}</h2>
        <p>{row.presetId ? values.category : editing ? 'Item details' : 'New catalog item'}</p>
      </div>
    </div>
    <div className="inventory-item-editor__fields proc-fields proc-fields-3">
      <Field label="Item name" wide><Input {...input('name')} required placeholder="Enter the item name" /></Field>
      <Field label="Category"><SelectInput {...input('category')} options={INVENTORY_ITEM_CATEGORIES} showPlaceholder={false} preserveValue /></Field>
      <Field label="Unit"><SelectInput {...input('unit')} options={INVENTORY_UNIT_OPTIONS} showPlaceholder={false} preserveValue /></Field>
      <Field label="Unit cost"><Input {...input('unitCost')} type="number" min="0" step="0.01" required /></Field>
      {!editing && <Field label="Opening quantity"><Input {...input('quantity')} type="number" min="0" step="0.001" required /></Field>}
      <Field label="Stock location"><Input {...input('location')} /></Field>
      <Field label="Original purchase date"><Input {...input('actualPurchaseDate')} type="date" /></Field>
      <Field label="Default GST %"><Input {...input('gstRate')} type="number" min="0" max="100" step="0.01" /></Field>
      <div className="proc-wide">
        <ProcurementPicker label="Preferred vendor" selected={row.vendor} getOptions={loadVendors} allowClear
          placeholder="Search active vendors" onSelect={(vendor) => onChange(row.key, { vendorId: recordId(vendor) || null }, vendor)} />
      </div>
    </div>
    <details className="inventory-item-editor__section">
      <summary>Product details <ChevronDown size={16} aria-hidden="true" /></summary>
      <div className="proc-fields proc-fields-3">
        {productFields.map(([key, label, placeholder]) => <Field label={label} key={key}>
          <Input {...input(key)} placeholder={placeholder} />
        </Field>)}
        <Field label="Description" wide><TextareaInput {...input('description')} rows={2} /></Field>
        <Field label="Product image URL" wide><Input {...input('imageUrl')} /></Field>
      </div>
    </details>
    <details className="inventory-item-editor__section">
      <summary>Stock rules <ChevronDown size={16} aria-hidden="true" /></summary>
      <div className="proc-fields proc-fields-3">
        {inventoryNumbers.map(([key, label]) => <Field label={label} key={key}>
          <Input {...input(key)} type="number" min="0" step="0.001" required />
        </Field>)}
        <Field label="Bin or shelf"><Input {...input('storageBin')} /></Field>
        {editing && <SwitchInput className="proc-wide" label="Discontinued" checked={values.discontinued}
          onChange={(event) => onChange(row.key, { discontinued: event.target.checked })} />}
      </div>
    </details>
  </section>;
}
