import { AlertCircle, ChevronLeft, ChevronRight, Loader2, Search } from 'lucide-react';
import { apiMessage, recordId } from '../../utils/procurement.js';
import './procurement.css';

export function Field({ label, hint, wide, children }) {
  return <label className={'proc-field' + (wide ? ' proc-wide' : '')}>
    <span>{label}</span>
    {children}
    {hint && <small>{hint}</small>}
  </label>;
}

export function Metric({ icon: Icon, label, value, note, tone }) {
  return <div className="proc-metric">
    <span className="proc-icon" aria-hidden="true"><Icon size={18} /></span>
    <div>
      <span className="proc-label">{label}</span>
      <strong className={tone ? 'proc-' + tone : undefined}>{value}</strong>
      {note && <small>{note}</small>}
    </div>
  </div>;
}

const statusTones = {
  active: 'good', Paid: 'good', 'in-stock': 'good', Partial: 'warn', 'low-stock': 'warn',
  Unpaid: 'danger', blacklisted: 'danger', 'out-of-stock': 'danger', revised: 'warn',
};

export function Status({ value, label }) {
  return <span className={'proc-status proc-' + (statusTones[value] || 'neutral')}>{label || value}</span>;
}

export function ErrorMessage({ error, onRetry }) {
  if (!error) return null;
  return <div className="proc-message proc-danger" role="alert">
    <AlertCircle size={17} /> <span>{typeof error === 'string' ? error : apiMessage(error)}</span>
    {onRetry && <button className="proc-btn proc-btn-sm" type="button" onClick={onRetry}>Retry</button>}
  </div>;
}

export function Pending({ label = 'Loading records' }) {
  return <div className="proc-empty" role="status"><Loader2 size={17} className="animate-spin" /> {label}</div>;
}

export function SearchField({ value, onChange, label }) {
  return <label className="proc-search">
    <Search size={15} aria-hidden="true" />
    <input className="proc-input" type="search" value={value} aria-label={label} placeholder={label} onChange={(event) => onChange(event.target.value)} />
  </label>;
}

export function Empty({ icon: Icon, title, description, children }) {
  return <div className="proc-empty">
    {Icon && <span className="proc-icon"><Icon size={19} /></span>}
    <strong>{title}</strong>
    {description && <span>{description}</span>}
    {children}
  </div>;
}

export function DataTable({ columns, rows, id = recordId, label, empty }) {
  if (!rows.length) return empty;
  return <div className="proc-table-wrap">
    <table className="proc-table" aria-label={label} role="table">
      <thead role="rowgroup"><tr role="row">{columns.map((column) =>
        <th key={column.key} scope="col" role="columnheader">{column.label}</th>)}</tr></thead>
      <tbody role="rowgroup">{rows.map((row, index) => <tr key={id(row) || index} role="row">
        {columns.map((column) => <td key={column.key} role="cell" className={column.full ? 'proc-table-wide' : undefined}>
          {!column.full && <span className="proc-mobile-label" aria-hidden="true">{column.label}</span>}
          {column.render ? column.render(row) : row[column.key]}
        </td>)}
      </tr>)}</tbody>
    </table>
  </div>;
}

export function Pagination({ pagination, onPage }) {
  if (!pagination || pagination.pages <= 1) return null;
  const { page, pages, limit, total } = pagination;
  return <nav className="proc-pagination" aria-label="Results pages">
    <span>{(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}</span>
    <div>
      <button className="proc-btn proc-btn-sm" type="button" aria-label="Previous page" disabled={page <= 1} onClick={() => onPage(page - 1)}><ChevronLeft size={15} /></button>
      <span>{page} / {pages}</span>
      <button className="proc-btn proc-btn-sm" type="button" aria-label="Next page" disabled={page >= pages} onClick={() => onPage(page + 1)}><ChevronRight size={15} /></button>
    </div>
  </nav>;
}
