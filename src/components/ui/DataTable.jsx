import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Layers,
  Inbox,
} from 'lucide-react';
import EmptyState from './EmptyState.jsx';
import Button from './Button.jsx';

/**
 * DataTable — Universal, highly-reusable data table with built-in:
 * - Search filter (client-side automatic or controlled via props)
 * - Column sorting (asc/desc with indicators)
 * - Automatic client-side or server-side pagination
 * - Skeleton loading state with customizable rows
 * - Selectable rows with batch select-all
 * - Header toolbar with title, subtitle, badge, and custom actions
 * - Custom cell renders, alignments, and widths
 * - Empty states with custom actions
 */
const DataTable = ({
  // Core Data
  columns = [],
  data = [],
  keyField = '_id',

  // Header & Toolbar
  title = '',
  subtitle = '',
  icon: TitleIcon = null,
  badge = null,
  headerActions = null,
  filters = null,

  // Search
  searchable = false,
  searchPlaceholder = 'Search records...',
  searchValue = undefined, // controlled
  onSearchChange = undefined, // controlled callback
  searchFields = [], // specific keys to search in; defaults to all text values

  // Sorting
  defaultSortKey = '',
  defaultSortDirection = 'asc', // 'asc' | 'desc'

  // Loading & Empty
  loading = false,
  skeletonRows = 6,
  emptyTitle = 'No records found',
  emptyDescription = 'There are no records matching your criteria.',
  emptyIcon = null,
  emptyAction = null,

  // Selection
  selectable = false,
  selectedIds = [],
  onSelectChange = () => {},
  onSelectAll = () => {},

  // Interactivity
  onRowClick = undefined,
  hoverable = true,
  striped = false,
  compact = false,
  className = '',
  tableClassName = '',

  // Pagination (boolean for client-side auto-pagination, or object for server pagination)
  pagination = false,
  pageSize = 10,
  pageSizeOptions = [5, 10, 25, 50],
  onPageChange = undefined,
}) => {
  // ─── Local State for Uncontrolled Search, Sort & Pagination ─────────────────
  const [internalSearch, setInternalSearch] = useState('');
  const [sortKey, setSortKey] = useState(defaultSortKey);
  const [sortDir, setSortDir] = useState(defaultSortDirection);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(pageSize);

  const activeSearch = searchValue !== undefined ? searchValue : internalSearch;

  const handleSearchInput = (val) => {
    if (onSearchChange) {
      onSearchChange(val);
    } else {
      setInternalSearch(val);
      setCurrentPage(1); // reset to first page on search
    }
  };

  // ─── Sort Handler ─────────────────────────────────────────────────────────
  const handleSort = (key) => {
    if (!key) return;
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  // ─── Filter & Sort Data (Client-Side) ─────────────────────────────────────
  const processedData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    let list = [...data];

    // If uncontrolled search is active, filter client-side
    if (searchable && onSearchChange === undefined && activeSearch.trim()) {
      const q = activeSearch.trim().toLowerCase();
      list = list.filter((row) => {
        if (!row) return false;
        if (searchFields.length > 0) {
          return searchFields.some((f) => {
            const val = row[f];
            return val !== undefined && val !== null && String(val).toLowerCase().includes(q);
          });
        }
        // Default: test all string / number fields
        return Object.values(row).some((val) => {
          if (val === undefined || val === null) return false;
          if (typeof val === 'object') {
            try {
              return JSON.stringify(val).toLowerCase().includes(q);
            } catch {
              return false;
            }
          }
          return String(val).toLowerCase().includes(q);
        });
      });
    }

    // Sort client-side
    if (sortKey) {
      list.sort((a, b) => {
        const aVal = a?.[sortKey];
        const bVal = b?.[sortKey];
        if (aVal === bVal) return 0;
        if (aVal === undefined || aVal === null) return 1;
        if (bVal === undefined || bVal === null) return -1;

        let res = 0;
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          res = aVal - bVal;
        } else {
          res = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
        }
        return sortDir === 'asc' ? res : -res;
      });
    }

    return list;
  }, [data, searchable, onSearchChange, activeSearch, searchFields, sortKey, sortDir]);

  // ─── Determine Pagination Model ───────────────────────────────────────────
  const isServerPagination = typeof pagination === 'object' && pagination !== null;
  const isClientPagination = pagination === true;

  // Sliced data for display
  const displayData = useMemo(() => {
    if (isClientPagination) {
      const start = (currentPage - 1) * perPage;
      return processedData.slice(start, start + perPage);
    }
    return processedData;
  }, [processedData, isClientPagination, currentPage, perPage]);

  // Total pages and range calculations
  const totalCount = isServerPagination
    ? pagination.total || 0
    : processedData.length;
  const effectivePage = isServerPagination ? pagination.page || 1 : currentPage;
  const effectivePages = isServerPagination
    ? pagination.pages || Math.ceil((pagination.total || 1) / (pagination.limit || perPage))
    : Math.ceil(totalCount / perPage) || 1;
  const effectiveLimit = isServerPagination ? pagination.limit || perPage : perPage;

  const handlePageSelect = (page) => {
    const valid = Math.max(1, Math.min(page, effectivePages));
    if (isServerPagination && onPageChange) {
      onPageChange(valid);
    } else {
      setCurrentPage(valid);
    }
  };

  const handlePerPageChange = (newSize) => {
    setPerPage(newSize);
    setCurrentPage(1);
  };

  // Selection helpers
  const allCurrentSelected =
    displayData.length > 0 &&
    displayData.every((row) => selectedIds.includes(row[keyField] || row.id || row._id));

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs overflow-hidden font-sans ${className}`}
    >
      {/* ── Optional Header Toolbar ────────────────────────────────────────── */}
      {(title || subtitle || searchable || filters || headerActions) && (
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Title & Badge */}
            {(title || subtitle) && (
              <div className="flex items-center gap-3">
                {TitleIcon && (
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-200/60 dark:border-indigo-800/60">
                    <TitleIcon size={20} />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {title && (
                      <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                        {title}
                      </h3>
                    )}
                    {badge !== null && badge !== undefined && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        {badge}
                      </span>
                    )}
                  </div>
                  {subtitle && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Actions Toolbar */}
            <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto ml-auto">
              {filters}
              {headerActions}
            </div>
          </div>

          {/* Search Box & Controls */}
          {searchable && (
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  type="text"
                  value={activeSearch}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-9 pr-8 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition"
                />
                {activeSearch && (
                  <button
                    type="button"
                    onClick={() => handleSearchInput('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Table Container ────────────────────────────────────────────────── */}
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
        <table className={`w-full text-left text-xs ${tableClassName}`}>
          {/* Table Head */}
          <thead className="bg-slate-50/80 dark:bg-slate-950/40 text-slate-600 dark:text-slate-400 uppercase tracking-wider text-[11px] font-extrabold border-b border-slate-200 dark:border-slate-800 select-none">
            <tr>
              {selectable && (
                <th className="py-3 px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={allCurrentSelected}
                    onChange={(e) => onSelectAll?.(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                  />
                </th>
              )}

              {columns.map((col, idx) => {
                const isSortActive = sortKey === col.key;
                const canSort = col.sortable !== false;
                const alignClass =
                  col.align === 'right'
                    ? 'text-right'
                    : col.align === 'center'
                    ? 'text-center'
                    : 'text-left';

                return (
                  <th
                    key={col.key || idx}
                    style={{ width: col.width }}
                    onClick={() => canSort && handleSort(col.key)}
                    className={`py-3.5 px-4 ${alignClass} ${col.className || ''} ${
                      canSort ? 'cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400' : ''
                    } transition-colors`}
                  >
                    <div
                      className={`inline-flex items-center gap-1.5 ${
                        col.align === 'right'
                          ? 'justify-end'
                          : col.align === 'center'
                          ? 'justify-center'
                          : 'justify-start'
                      }`}
                    >
                      <span>{col.label}</span>
                      {canSort && (
                        <span className="text-slate-400">
                          {isSortActive ? (
                            sortDir === 'asc' ? (
                              <ArrowUp size={13} className="text-indigo-600 dark:text-indigo-400" />
                            ) : (
                              <ArrowDown size={13} className="text-indigo-600 dark:text-indigo-400" />
                            )
                          ) : (
                            <ArrowUpDown size={12} className="opacity-40" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Table Body: Skeleton Loading State */}
          {loading ? (
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 animate-pulse">
              {Array.from({ length: skeletonRows }).map((_, rIdx) => (
                <tr key={rIdx} className="bg-white dark:bg-slate-900">
                  {selectable && (
                    <td className="py-4 px-4 text-center">
                      <div className="w-4 h-4 mx-auto rounded bg-slate-200 dark:bg-slate-800" />
                    </td>
                  )}
                  {columns.map((col, cIdx) => (
                    <td key={col.key || cIdx} className="py-4 px-4">
                      <div
                        className="h-3 rounded bg-slate-200 dark:bg-slate-800"
                        style={{ width: `${Math.max(35, (cIdx * 25 + 40) % 90)}%` }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          ) : displayData.length === 0 ? (
            /* Table Body: Empty State */
            <tbody>
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="py-12 px-4 text-center"
                >
                  <div className="max-w-md mx-auto space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                      {emptyIcon || <Inbox size={24} />}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        {emptyTitle}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {emptyDescription}
                      </p>
                    </div>
                    {emptyAction && <div className="pt-1">{emptyAction}</div>}
                  </div>
                </td>
              </tr>
            </tbody>
          ) : (
            /* Table Body: Data Rows */
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {displayData.map((row, rIdx) => {
                const rowId = row[keyField] || row.id || row._id || `row-${rIdx}`;
                const isSelected = selectable && selectedIds.includes(rowId);

                return (
                  <tr
                    key={rowId}
                    onClick={() => onRowClick?.(row)}
                    className={[
                      onRowClick ? 'cursor-pointer' : '',
                      isSelected
                        ? 'bg-indigo-50/70 dark:bg-indigo-950/40'
                        : striped && rIdx % 2 === 1
                        ? 'bg-slate-50/40 dark:bg-slate-900/40'
                        : 'bg-white dark:bg-slate-900',
                      hoverable ? 'hover:bg-indigo-50/40 dark:hover:bg-slate-800/60' : '',
                      'transition-colors duration-100',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {selectable && (
                      <td
                        className={`py-3.5 px-4 text-center ${compact ? 'py-2.5' : ''}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => onSelectChange?.(rowId, e.target.checked)}
                          className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>
                    )}

                    {columns.map((col, cIdx) => {
                      const alignClass =
                        col.align === 'right'
                          ? 'text-right'
                          : col.align === 'center'
                          ? 'text-center'
                          : 'text-left';

                      return (
                        <td
                          key={col.key || cIdx}
                          className={`py-3.5 px-4 ${compact ? 'py-2.5' : ''} ${alignClass} ${
                            col.className || ''
                          } text-slate-700 dark:text-slate-300`}
                        >
                          {col.render ? col.render(row, rIdx) : (row[col.key] ?? '—')}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          )}
        </table>
      </div>

      {/* ── Pagination Footer ──────────────────────────────────────────────── */}
      {(isClientPagination || isServerPagination) && !loading && displayData.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3.5 bg-slate-50/80 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800 text-xs">
          {/* Showing Count */}
          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 font-medium">
            <span>
              Showing{' '}
              <strong className="text-slate-800 dark:text-slate-200">
                {totalCount === 0 ? 0 : (effectivePage - 1) * effectiveLimit + 1}
              </strong>{' '}
              to{' '}
              <strong className="text-slate-800 dark:text-slate-200">
                {Math.min(effectivePage * effectiveLimit, totalCount)}
              </strong>{' '}
              of{' '}
              <strong className="text-slate-800 dark:text-slate-200">{totalCount}</strong>{' '}
              entries
            </span>

            {/* Client-side Rows Per Page Selector */}
            {isClientPagination && (
              <div className="hidden sm:flex items-center gap-1.5 ml-2">
                <span className="text-[11px]">Rows:</span>
                <select
                  value={perPage}
                  onChange={(e) => handlePerPageChange(Number(e.target.value))}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-0.5 text-[11px] font-bold text-slate-700 dark:text-slate-300 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {pageSizeOptions.map((sz) => (
                    <option key={sz} value={sz}>
                      {sz}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Page Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={effectivePage <= 1}
              onClick={() => handlePageSelect(effectivePage - 1)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft size={14} />
            </button>

            <span className="px-2.5 py-1 text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
              {effectivePage} / {effectivePages}
            </span>

            <button
              type="button"
              disabled={effectivePage >= effectivePages}
              onClick={() => handlePageSelect(effectivePage + 1)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              title="Next Page"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

DataTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      label: PropTypes.node.isRequired,
      render: PropTypes.func,
      sortable: PropTypes.bool,
      align: PropTypes.oneOf(['left', 'center', 'right']),
      className: PropTypes.string,
      width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    })
  ).isRequired,
  data: PropTypes.array,
  keyField: PropTypes.string,
  title: PropTypes.node,
  subtitle: PropTypes.node,
  icon: PropTypes.elementType,
  badge: PropTypes.node,
  headerActions: PropTypes.node,
  filters: PropTypes.node,
  searchable: PropTypes.bool,
  searchPlaceholder: PropTypes.string,
  searchValue: PropTypes.string,
  onSearchChange: PropTypes.func,
  searchFields: PropTypes.arrayOf(PropTypes.string),
  defaultSortKey: PropTypes.string,
  defaultSortDirection: PropTypes.oneOf(['asc', 'desc']),
  loading: PropTypes.bool,
  skeletonRows: PropTypes.number,
  emptyTitle: PropTypes.node,
  emptyDescription: PropTypes.node,
  emptyIcon: PropTypes.node,
  emptyAction: PropTypes.node,
  selectable: PropTypes.bool,
  selectedIds: PropTypes.array,
  onSelectChange: PropTypes.func,
  onSelectAll: PropTypes.func,
  onRowClick: PropTypes.func,
  hoverable: PropTypes.bool,
  striped: PropTypes.bool,
  compact: PropTypes.bool,
  className: PropTypes.string,
  tableClassName: PropTypes.string,
  pagination: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.shape({
      page: PropTypes.number,
      pages: PropTypes.number,
      total: PropTypes.number,
      limit: PropTypes.number,
    }),
  ]),
  pageSize: PropTypes.number,
  pageSizeOptions: PropTypes.arrayOf(PropTypes.number),
  onPageChange: PropTypes.func,
};

export default DataTable;
