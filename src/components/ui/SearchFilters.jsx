import { useState } from 'react';
import { Search, X, Filter } from 'lucide-react';

const SearchFilters = ({
  search,
  onSearchChange,
  filters = [],
  onClear,
  placeholder = 'Search...',
}) => {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const activeFiltersCount = filters.filter((f) => Boolean(f.value)).length;

  return (
    <div className="flex flex-col md:flex-row gap-3 mb-4">
      {/* Search Input Row with Mobile Filter Button */}
      <div className="flex items-center gap-2 flex-1">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
          <input
            type="text"
            placeholder={placeholder}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
          />
        </div>

        {/* Mobile Filter Toggle Icon Button - Visible only on mobile (< md), hidden on md: */}
        {filters.length > 0 && (
          <button
            type="button"
            onClick={() => setShowMobileFilters((prev) => !prev)}
            className={`md:hidden flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border text-xs font-bold transition-all shadow-sm ${
              showMobileFilters || activeFiltersCount > 0
                ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            aria-label="Toggle Filters"
            title="Toggle Filters"
          >
            <Filter size={15} />
            <span className="text-xs">Filters</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-orange-600 text-white text-[10px] font-bold flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Filter Selects & Clear:
          - Desktop (md:): ALWAYS visible inline side-by-side with search (md:flex md:flex-row)
          - Mobile (< md): Collapsed by default, expanded when showMobileFilters is true
      */}
      {filters.length > 0 && (
        <div
          className={`${
            showMobileFilters ? 'flex flex-col md:flex-row' : 'hidden md:flex md:flex-row'
          } gap-3`}
        >
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
              className="flex items-center justify-center gap-1 px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X size={14} /> Clear
            </button>
          )}
        </div>
      )}

      {/* When no filters exist but clear is needed on desktop */}
      {filters.length === 0 && onClear && search && (
        <button
          type="button"
          onClick={onClear}
          className="flex items-center justify-center gap-1 px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X size={14} /> Clear
        </button>
      )}
    </div>
  );
};

export default SearchFilters;
