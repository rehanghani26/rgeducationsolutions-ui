import { Search, X } from 'lucide-react';

const SearchFilters = ({
  search,
  onSearchChange,
  filters = [],
  onClear,
  placeholder = 'Search...',
}) => (
  <div className="flex flex-col sm:flex-row gap-3 mb-4">
    <div className="relative flex-1">
      <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
      <input
        type="text"
        placeholder={placeholder}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
      />
    </div>
    {filters.map((filter) => (
      <select
        key={filter.key}
        value={filter.value}
        onChange={(e) => filter.onChange(e.target.value)}
        className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-xs font-semibold min-w-[140px]"
      >
        {filter.options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    ))}
    {onClear && (search || filters.some((f) => f.value)) && (
      <button
        type="button"
        onClick={onClear}
        className="flex items-center gap-1 px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500"
      >
        <X size={14} /> Clear
      </button>
    )}
  </div>
);

export default SearchFilters;
