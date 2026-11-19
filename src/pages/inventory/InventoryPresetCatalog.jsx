import { useState } from 'react';
import { Check, ChevronDown, PackageSearch, Plus } from 'lucide-react';
import { Empty, SearchField } from '../../components/ui/ProcurementUI.jsx';
import { INVENTORY_CATEGORIES, SCHOOL_PRODUCT_CATALOG, SCHOOL_PRODUCT_PHOTOS } from '../../constants/inventoryOptions.js';
import { formatCurrency } from '../../utils/formatters.js';
import InventoryProductPhoto from './InventoryProductPhoto.jsx';

const pageSize = 12;
const categories = INVENTORY_CATEGORIES.filter((category) => SCHOOL_PRODUCT_CATALOG.some((item) => item.category === category));
const presetsById = new Map(SCHOOL_PRODUCT_CATALOG.map((item) => [item.id, item]));
const suggested = [
  ...Object.keys(SCHOOL_PRODUCT_PHOTOS).map((id) => presetsById.get(id)).filter(Boolean),
  ...SCHOOL_PRODUCT_CATALOG.filter((item) => !Object.hasOwn(SCHOOL_PRODUCT_PHOTOS, item.id)),
];

const sorts = {
  suggested: null,
  name: (a, b) => a.name.localeCompare(b.name),
  'price-asc': (a, b) => a.unitPrice - b.unitPrice,
  'price-desc': (a, b) => b.unitPrice - a.unitPrice,
};

function PresetCard({ item, added, full, priority, onAdd, onEdit }) {
  return <article className="inventory-preset-card">
    <InventoryProductPhoto value={item.imageUrl} priority={priority} className="inventory-preset-card__photo" />
    <div className="inventory-preset-card__body">
      <span className="inventory-preset-card__category">{item.category}</span>
      <h3 title={item.name}>{item.name}</h3>
      <div className="inventory-preset-card__price">
        <strong>{formatCurrency(item.unitPrice)}</strong>
        <span> / {item.unit}</span>
      </div>
      <button
        className={'proc-btn inventory-preset-card__action' + (added ? ' inventory-preset-card__action--added' : '')}
        type="button"
        disabled={full && !added}
        aria-label={(added ? 'Edit selected ' : 'Add ') + item.name}
        onClick={added ? onEdit : onAdd}
      >
        {added ? <><Check aria-hidden="true" /> Added · Edit</> : <><Plus aria-hidden="true" /> Add item</>}
      </button>
    </div>
  </article>;
}

export default function InventoryPresetCatalog({ selections, full, onAdd, onEdit }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('suggested');
  const [limit, setLimit] = useState(pageSize);
  const update = (setter) => (value) => { setter(value); setLimit(pageSize); };
  const keywords = search.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const matches = suggested.filter((item) => {
    if (category && item.category !== category) return false;
    const searchable = [item.name, item.skuPrefix, item.category, item.subcategory].join(' ').toLowerCase();
    return keywords.every((keyword) => searchable.includes(keyword));
  });
  if (sorts[sort]) matches.sort(sorts[sort]);

  return <section className="inventory-catalog" aria-labelledby="inventory-catalog-title">
    <div className="inventory-catalog__toolbar proc-panel">
      <div className="inventory-catalog__title">
        <h2 id="inventory-catalog-title">School supply catalog</h2>
        <span aria-live="polite">{matches.length} {matches.length === 1 ? 'preset' : 'presets'}</span>
      </div>
      <div className="inventory-catalog__controls">
        <SearchField label="Search name, SKU, or category" value={search} onChange={update(setSearch)} />
        <select className="proc-input inventory-catalog__category" aria-label="Filter by category" value={category} onChange={(event) => update(setCategory)(event.target.value)}>
          <option value="">All categories</option>
          {categories.map((name) => <option key={name}>{name}</option>)}
        </select>
        <select className="proc-input" aria-label="Sort presets" value={sort} onChange={(event) => update(setSort)(event.target.value)}>
          <option value="suggested">Featured first</option>
          <option value="name">Name A–Z</option>
          <option value="price-asc">Lowest unit cost</option>
          <option value="price-desc">Highest unit cost</option>
        </select>
      </div>
      <div className="inventory-catalog__categories" aria-label="Filter presets by category" role="group">
        {['', ...categories].map((name) => <button type="button" key={name} aria-pressed={category === name} onClick={() => update(setCategory)(name)}>
          {name || 'All categories'}
        </button>)}
      </div>
    </div>
    {matches.length ? <div className="inventory-catalog__grid">
      {matches.slice(0, limit).map((item, index) => {
        const selectedKey = selections.get(item.id);
        return <PresetCard key={item.id} item={item} added={Boolean(selectedKey)} full={full} priority={index < 4}
          onAdd={() => onAdd(item)} onEdit={() => onEdit(selectedKey)} />;
      })}
    </div> : <div className="proc-panel">
      <Empty icon={PackageSearch} title="No matching presets">
        <button type="button" className="proc-btn" onClick={() => { setSearch(''); setCategory(''); setLimit(pageSize); }}>Clear filters</button>
      </Empty>
    </div>}
    {limit < matches.length && <div className="inventory-catalog__more">
      <span>{Math.min(limit, matches.length)} of {matches.length} presets shown</span>
      <button className="proc-btn" type="button" onClick={() => setLimit((current) => current + pageSize)}>
        Show more <ChevronDown size={15} aria-hidden="true" />
      </button>
    </div>}
  </section>;
}
