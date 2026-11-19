import { ArrowRight, Pencil, Save, ShoppingBasket, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';
import InventoryProductPhoto from './InventoryProductPhoto.jsx';

const nameFor = (row) => row.values.name || 'Custom item';

function SelectionButton({ reviewing, editing, saving, count, onReview }) {
  if (!reviewing) return <button type="button" className="proc-btn proc-primary" onClick={onReview} disabled={!count}>
    Review items <ArrowRight size={15} aria-hidden="true" />
  </button>;
  const action = editing ? 'Save item' : count === 1 ? 'Create item' : 'Create ' + count + ' items';
  return <button type="submit" className="proc-btn proc-primary" disabled={saving || !count}>
    <Save size={15} aria-hidden="true" /> {saving ? 'Saving…' : action}
  </button>;
}

export default function InventorySelection({ rows, activeKey, reviewing, editing, saving, value, onReview, onSelect, onRemove, onQuantity }) {
  return <aside className={'proc-panel inventory-selection' + (reviewing ? '' : ' inventory-selection--browse')} aria-labelledby="inventory-selection-heading">
      <header className="inventory-selection__header">
        <span className="proc-icon"><ShoppingBasket size={18} aria-hidden="true" /></span>
        <h2 id="inventory-selection-heading">{editing ? 'Item summary' : 'Selected items'}</h2>
        {!editing && <span className="inventory-selection__count" aria-label={rows.length + ' items selected'}>{rows.length}</span>}
      </header>
      {!rows.length ? <div className="inventory-selection__empty">
        <strong>Your list is empty</strong>
        <p>Add a catalog preset or create a custom item.</p>
      </div> : <>
        <ul className="inventory-selection__list">
          {rows.map((row) => <li className={reviewing && row.key === activeKey ? 'inventory-selection__row--active' : ''} key={row.key}>
            <div className="inventory-selection__product">
              <InventoryProductPhoto value={row.values.imageUrl} className="inventory-selection__photo" />
              <div className="inventory-selection__name">
                <strong title={nameFor(row)}>{nameFor(row)}</strong>
                <span>{formatCurrency(row.values.unitCost)} / {row.values.unit}</span>
              </div>
            </div>
            {!editing && <div className="inventory-selection__controls">
              <label>
                <span>Opening qty</span>
                <input className="proc-input" type="number" min="0" step="0.001" value={row.values.quantity} disabled={saving}
                  aria-label={'Opening quantity for ' + nameFor(row)} onChange={(event) => onQuantity(row.key, event.target.value)} />
              </label>
              <button type="button" className="proc-btn proc-btn-sm" aria-label={'Edit ' + nameFor(row)} disabled={saving} onClick={() => onSelect(row.key)}>
                <Pencil size={14} aria-hidden="true" />
              </button>
              <button type="button" className="proc-btn proc-btn-sm" aria-label={'Remove ' + nameFor(row)} disabled={saving} onClick={() => onRemove(row.key)}>
                <Trash2 size={14} aria-hidden="true" />
              </button>
            </div>}
          </li>)}
        </ul>
        <div className="inventory-selection__footer">
          {!editing && <dl className="inventory-selection__total">
            <div><dt>Opening stock value</dt><dd>{formatCurrency(value)}</dd></div>
          </dl>}
          <SelectionButton reviewing={reviewing} editing={editing} saving={saving} count={rows.length} onReview={onReview} />
        </div>
      </>}
  </aside>;
}

export function InventoryMobileSelection({ count, editing, reviewing, saving, value, onReview }) {
  if (!count) return null;
  return <div className="inventory-mobile-actions">
      <div aria-live="polite">
        <strong>{editing ? 'Item details' : count + (count === 1 ? ' item selected' : ' items selected')}</strong>
        {!editing && <span>{formatCurrency(value)} opening stock</span>}
      </div>
      <SelectionButton reviewing={reviewing} editing={editing} saving={saving} count={count} onReview={onReview} />
  </div>;
}
