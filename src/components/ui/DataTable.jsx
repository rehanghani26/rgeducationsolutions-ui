import { ChevronLeft, ChevronRight } from 'lucide-react';
import EmptyState from './EmptyState.jsx';
import Button from './Button.jsx';

/**
 * DataTable — enhanced table with skeleton loading rows, selectable rows, and pagination.
 *
 * Props: (API unchanged from previous version)
 *   columns          : { key, label, render?, className? }[]
 *   data             : object[]
 *   loading          : boolean  — shows skeleton rows
 *   skeletonRows     : number   — number of skeleton rows shown while loading (default: 8)
 *   pagination       : { page, pages, total, limit }
 *   onPageChange     : fn(page)
 *   onRowClick       : fn(row)
 *   selectable       : boolean
 *   selectedIds      : string[]
 *   onSelectChange   : fn(id, checked)
 *   onSelectAll      : fn(checked)
 *   emptyTitle       : string
 *   emptyDescription : string
 */
const DataTable = ({
  columns,
  data = [],
  loading = false,
  skeletonRows = 8,
  pagination,
  onPageChange,
  onRowClick,
  selectable = false,
  selectedIds = [],
  onSelectChange,
  onSelectAll,
  emptyTitle = 'No records found',
  emptyDescription,
}) => {
  const allSelected =
    data.length > 0 && data.every((row) => selectedIds.includes(row.id || row._id));

  /* ---- Skeleton loading state ---- */
  if (loading) {
    return (
      <div className="overflow-x-auto animate-pulse">
        <table className="w-full text-left text-xs">
          <thead className="text-slate-500 dark:text-slate-400 uppercase">
            <tr className="border-b border-slate-100 dark:border-slate-800">
              {selectable && (
                <th className="pb-3 pr-3 w-8">
                  <div className="h-3 w-3 rounded bg-slate-200 dark:bg-slate-700" />
                </th>
              )}
              {columns.map((col) => (
                <th key={col.key} className={`pb-3 ${col.className || ''}`}>
                  <div className="h-2.5 rounded bg-slate-200 dark:bg-slate-700 w-20" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {Array.from({ length: skeletonRows }).map((_, i) => (
              <tr key={i}>
                {selectable && (
                  <td className="py-3.5 pr-3">
                    <div className="h-3 w-3 rounded bg-slate-200 dark:bg-slate-700" />
                  </td>
                )}
                {columns.map((col) => (
                  <td key={col.key} className={`py-3.5 ${col.className || ''}`}>
                    <div className="h-2.5 rounded bg-slate-200 dark:bg-slate-700 w-24" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  /* ---- Empty state ---- */
  if (!data.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  /* ---- Table ---- */
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="text-slate-500 dark:text-slate-400 uppercase">
            <tr className="border-b border-slate-100 dark:border-slate-800">
              {selectable && (
                <th className="pb-3 pr-3 w-8">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => onSelectAll?.(e.target.checked)}
                    className="rounded border-slate-300 dark:border-slate-600 accent-indigo-600"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th key={col.key} className={`pb-3 font-bold tracking-wide ${col.className || ''}`}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.map((row) => {
              const rowId = row.id || row._id;
              const isSelected = selectable && selectedIds.includes(rowId);
              return (
                <tr
                  key={rowId}
                  onClick={() => onRowClick?.(row)}
                  className={[
                    onRowClick ? 'cursor-pointer' : '',
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/30'
                      : onRowClick
                      ? 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      : '',
                    'transition-colors',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {selectable && (
                    <td className="py-3.5 pr-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => onSelectChange?.(rowId, e.target.checked)}
                        className="rounded border-slate-300 dark:border-slate-600 accent-indigo-600"
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} className={`py-3.5 ${col.className || ''}`}>
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[11px] text-slate-500 font-semibold">
            Showing{' '}
            {((pagination.page - 1) * pagination.limit) + 1}–
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="xs"
              icon={<ChevronLeft size={14} />}
              disabled={pagination.page <= 1}
              onClick={() => onPageChange?.(pagination.page - 1)}
            />
            <span className="text-xs font-bold px-1 tabular-nums">
              {pagination.page} / {pagination.pages}
            </span>
            <Button
              variant="secondary"
              size="xs"
              icon={<ChevronRight size={14} />}
              disabled={pagination.page >= pagination.pages}
              onClick={() => onPageChange?.(pagination.page + 1)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
