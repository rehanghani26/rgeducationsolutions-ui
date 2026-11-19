import { ChevronDown } from 'lucide-react';
import { Field } from '../../components/ui/ProcurementUI.jsx';
import ProcurementPicker from '../../components/ui/ProcurementPicker.jsx';
import { INVENTORY_CATEGORIES, INVENTORY_UNIT_OPTIONS } from '../../constants/inventoryOptions.js';
import { getVendors } from '../../services/vendorService.js';
import { recordId } from '../../utils/procurement.js';
import InventoryProductPhoto from './InventoryProductPhoto.jsx';

const categories = [...INVENTORY_CATEGORIES, 'Books', 'Computers', 'Uniforms', 'Electronics'];
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
  const itemCategories = categories.includes(values.category) ? categories : [...categories, values.category];
  const unitOptions = INVENTORY_UNIT_OPTIONS.some(({ value }) => value === values.unit)
    ? INVENTORY_UNIT_OPTIONS : [...INVENTORY_UNIT_OPTIONS, { value: values.unit, label: values.unit }];

  return <section className="proc-panel inventory-item-editor" aria-labelledby="inventory-item-heading">
    <div className="inventory-item-editor__head">
      <InventoryProductPhoto value={values.imageUrl} priority className="inventory-item-editor__photo" />
      <div>
        <h2 id="inventory-item-heading" tabIndex={-1}>{values.name || 'Custom item'}</h2>
        <p>{row.presetId ? values.category : editing ? 'Item details' : 'New catalog item'}</p>
      </div>
    </div>
    <div className="inventory-item-editor__fields proc-fields proc-fields-3">
      <Field label="Item name" wide><input {...input('name')} required placeholder="Enter the item name" /></Field>
      <Field label="Category"><select {...input('category')}>
        {itemCategories.map((value) => <option key={value}>{value}</option>)}
      </select></Field>
      <Field label="Unit"><select {...input('unit')}>
        {unitOptions.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
      </select></Field>
      <Field label="Unit cost"><input {...input('unitCost')} type="number" min="0" step="0.01" required /></Field>
      {!editing && <Field label="Opening quantity"><input {...input('quantity')} type="number" min="0" step="0.001" required /></Field>}
      <Field label="Stock location"><input {...input('location')} /></Field>
      <Field label="Default GST %"><input {...input('gstRate')} type="number" min="0" max="100" step="0.01" /></Field>
    </div>
    <details className="inventory-item-editor__section">
      <summary>Product details <ChevronDown size={16} aria-hidden="true" /></summary>
      <div className="proc-fields proc-fields-3">
        {productFields.map(([key, label, placeholder]) => <Field label={label} key={key}>
          <input {...input(key)} placeholder={placeholder} />
        </Field>)}
        <Field label="Description" wide><textarea {...input('description')} rows={2} /></Field>
        <Field label="Product image URL" wide><input {...input('imageUrl')} /></Field>
      </div>
    </details>
    <details className="inventory-item-editor__section">
      <summary>Stock rules and vendor <ChevronDown size={16} aria-hidden="true" /></summary>
      <div className="proc-fields proc-fields-3">
        {inventoryNumbers.map(([key, label]) => <Field label={label} key={key}>
          <input {...input(key)} type="number" min="0" step="0.001" required />
        </Field>)}
        <Field label="Bin or shelf"><input {...input('storageBin')} /></Field>
        <div className="proc-wide">
          <ProcurementPicker label="Preferred vendor" selected={row.vendor} getOptions={loadVendors} allowClear
            placeholder="Search active vendors" onSelect={(vendor) => onChange(row.key, { vendorId: recordId(vendor) || null }, vendor)} />
        </div>
        {editing && <label className="proc-checkbox proc-wide">
          <input type="checkbox" checked={values.discontinued} onChange={(event) => onChange(row.key, { discontinued: event.target.checked })} /> Discontinued
        </label>}
      </div>
    </details>
  </section>;
}
