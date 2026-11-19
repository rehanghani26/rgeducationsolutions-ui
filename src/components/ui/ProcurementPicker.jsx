import { useCallback, useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { Empty, ErrorMessage, Field, Pending } from './ProcurementUI.jsx';
import { useProcurementResource } from '../../hooks/useProcurement.js';
import { recordId } from '../../utils/procurement.js';

export default function ProcurementPicker({ label, selected, onSelect, getOptions, placeholder, allowClear = false }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  useEffect(() => {
    const timeout = setTimeout(() => setQuery(search.trim()), 200);
    return () => clearTimeout(timeout);
  }, [search]);
  const load = useCallback(() => getOptions(query), [getOptions, query]);
  const options = useProcurementResource(load, open);
  const choose = (record) => {
    onSelect(record);
    setOpen(false);
    setSearch('');
    setQuery('');
  };

  return <div className="proc-picker">
    <span className="proc-label font-semibold">{label}</span>
    <div className="proc-picker-chosen">
      {selected && <div className="min-w-0 text-sm font-semibold break-words">{selected.name}<small className="proc-label">{selected.sku || selected.vendorCode}</small></div>}
      <div className="proc-actions">
        <button type="button" className="proc-btn proc-btn-sm" aria-expanded={open} onClick={() => setOpen(!open)}>
          <Search size={14} /> {open ? 'Close search' : selected ? 'Change' : 'Choose ' + label.toLowerCase()}
        </button>
        {selected && allowClear && <button className="proc-btn proc-btn-sm" type="button" onClick={() => choose(null)}>Clear</button>}
      </div>
    </div>
    {open && <>
      <Field label={placeholder}><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} autoFocus /></Field>
      <div className="proc-picker-results">
        {(options.loading || search.trim() !== query) && <Pending label="Searching" />}
        <ErrorMessage error={options.error} onRetry={options.refresh} />
        {options.data && search.trim() === query &&
          (options.data.length ? options.data.map((record) => <button type="button" key={recordId(record)} onClick={() => choose(record)}>
            <strong>{record.name}</strong>
            <small>{[record.sku || record.vendorCode, record.unit || record.city].filter(Boolean).join(' · ')}</small>
          </button>) : <Empty title="No matches" />)}
      </div>
    </>}
  </div>;
}
