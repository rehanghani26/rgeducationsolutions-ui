import { memo, useState } from 'react';
import { Search, SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * FilterBar — Combined search + filter dropdown component.
 * Mirrors EODSrc Filter/Filter.jsx pattern adapted for dark UI theme.
 *
 * Props:
 *   search         : string
 *   onSearchChange : fn(value)
 *   placeholder    : string
 *   filters        : Array<{ key, value, onChange, options: [{value, label}], placeholder }>
 *                    Simple inline selects rendered alongside the search bar
 *   filterGroups   : object — { sectionName: [{value, label}] }
 *                    Advanced grouped filter panel (like EODSrc Filter.jsx)
 *   onFilterChange : fn(filters) — called when filterGroups panel is applied
 *   onClear        : fn — clears all filters and search
 *   className      : string
 */
const FilterBar = ({
  search = '',
  onSearchChange,
  placeholder = 'Search...',
  filters = [],
  filterGroups = null,
  onFilterChange,
  onClear,
  className = '',
}) => {
  const [panelOpen, setPanelOpen] = useState(false);
  const [openSections, setOpenSections] = useState(
    filterGroups
      ? Object.keys(filterGroups).reduce((acc, k) => ({ ...acc, [k]: true }), {})
      : {}
  );
  const [selectedGroupFilters, setSelectedGroupFilters] = useState(
    filterGroups
      ? Object.keys(filterGroups).reduce((acc, k) => ({ ...acc, [k]: '' }), {})
      : {}
  );

  const activeGroupCount = Object.values(selectedGroupFilters).filter(Boolean).length;
  const hasActiveFilter = !!search || filters.some((f) => f.value) || activeGroupCount > 0;

  const handleGroupSelect = (section, optionValue) => {
    setSelectedGroupFilters((prev) => ({
      ...prev,
      [section]: prev[section] === optionValue ? '' : optionValue,
    }));
  };

  const handleApply = () => {
    onFilterChange?.(selectedGroupFilters);
    setPanelOpen(false);
  };

  const handleClearGroups = (e) => {
    e.stopPropagation();
    const cleared = Object.keys(filterGroups || {}).reduce(
      (acc, k) => ({ ...acc, [k]: '' }),
      {}
    );
    setSelectedGroupFilters(cleared);
    onFilterChange?.(cleared);
    setPanelOpen(false);
  };

  const handleClearAll = () => {
    handleClearGroups({ stopPropagation: () => {} });
    onClear?.();
  };

  return (
    <div className={`flex flex-col sm:flex-row gap-3 mb-4 ${className}`}>
      {/* Search Input */}
      <div className="relative flex-1">
        <Search
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          placeholder={placeholder}
          value={search}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
        />
      </div>

      {/* Inline Select Filters */}
      {filters.map((filter) => (
        <div key={filter.key} className="relative">
          <select
            value={filter.value}
            onChange={(e) => filter.onChange(e.target.value)}
            className="appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 pr-8 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 min-w-[140px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {filter.placeholder && (
              <option value="">{filter.placeholder}</option>
            )}
            {filter.options?.map((opt) => (
              <option key={opt.value ?? opt} value={opt.value ?? opt}>
                {opt.label ?? opt}
              </option>
            ))}
          </select>
          <ChevronDown
            size={13}
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
        </div>
      ))}

      {/* Advanced Filter Panel Toggle */}
      {filterGroups && (
        <div className="relative">
          <button
            type="button"
            onClick={() => setPanelOpen(!panelOpen)}
            className={[
              'flex items-center gap-2 px-4 py-2.5 rounded-lg border text-xs font-semibold transition-all',
              panelOpen || activeGroupCount > 0
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
            ].join(' ')}
          >
            <SlidersHorizontal size={14} />
            <span>Filter</span>
            {activeGroupCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center">
                {activeGroupCount}
              </span>
            )}
            {activeGroupCount > 0 ? (
              <X
                size={13}
                className="text-rose-500"
                onClick={handleClearGroups}
              />
            ) : panelOpen ? (
              <ChevronUp size={13} />
            ) : (
              <ChevronDown size={13} />
            )}
          </button>

          {panelOpen && (
            <div className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-30 p-4">
              <div className="space-y-4">
                {Object.entries(filterGroups).map(([section, options]) => (
                  <div key={section}>
                    <button
                      type="button"
                      className="w-full flex items-center justify-between mb-2 pb-1.5 border-b border-slate-100 dark:border-slate-800"
                      onClick={() =>
                        setOpenSections((prev) => ({
                          ...prev,
                          [section]: !prev[section],
                        }))
                      }
                    >
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 capitalize">
                        {section.replace(/_/g, ' ')}
                      </span>
                      {openSections[section] ? (
                        <ChevronUp size={13} className="text-slate-400" />
                      ) : (
                        <ChevronDown size={13} className="text-slate-400" />
                      )}
                    </button>

                    {openSections[section] && (
                      <div className="grid grid-cols-2 gap-1.5">
                        {options.map((opt) => {
                          const val = typeof opt === 'object' ? opt.value : opt;
                          const lbl = typeof opt === 'object' ? opt.label : opt;
                          const isActive = selectedGroupFilters[section] === val;
                          return (
                            <button
                              type="button"
                              key={val}
                              onClick={() => handleGroupSelect(section, val)}
                              className={[
                                'text-[11px] px-2 py-1.5 rounded-lg border text-center transition-all duration-150 font-semibold',
                                isActive
                                  ? 'bg-indigo-600 border-indigo-600 text-white'
                                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400',
                              ].join(' ')}
                            >
                              {lbl}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleClearGroups}
                  className="flex-1 text-xs font-bold py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  Clear All
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  className="flex-1 text-xs font-bold py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Global Clear Button */}
      {onClear && hasActiveFilter && (
        <button
          type="button"
          onClick={handleClearAll}
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-rose-500 hover:border-rose-400 transition-all"
        >
          <X size={13} /> Clear
        </button>
      )}
    </div>
  );
};

export default memo(FilterBar);
