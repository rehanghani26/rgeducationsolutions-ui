import React, { useState, useMemo } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowUpDown,
  Download,
} from "lucide-react";

/**
 * Reusable dark-themed ERP Data Table
 */
export default function AIDataTable({
  title = "Records",
  columns = [], // Array<{ key, label, render?, sortable? }>
  data = [], // Array<Object>
  totalCount = null,
  initialSearch = "",
  actions = [], // Array<{ label, icon, onClick, variant }>
  pageSize = 6,
}) {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  // Filtering
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase();
    return data.filter((row) =>
      columns.some((col) => {
        const val = row[col.key];
        if (val == null) return false;
        return String(val).toLowerCase().includes(term);
      })
    );
  }, [data, searchTerm, columns]);

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      if (valA == null) return 1;
      if (valB == null) return -1;
      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortKey, sortDirection]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  return (
    <div className="my-3 overflow-hidden rounded-xl border border-[#303030] bg-[#1D1D1D] shadow-md">
      {/* Table Header toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 border-b border-[#303030] bg-[#191919] px-3.5 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-[12.5px] font-bold text-[#FFFFFF]">
            {title}
          </span>
          <span className="rounded-full bg-[#FF7900]/15 border border-[#FF7900]/30 px-2 py-0.5 text-[10px] font-semibold text-[#FFA000]">
            {totalCount != null ? totalCount : data.length} Total
          </span>
        </div>

        {/* Search */}
        <div className="relative min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#A1A1AA]" />
          <input
            type="text"
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-lg border border-[#303030] bg-[#141414] py-1.5 pl-8 pr-3 text-[11px] text-[#FFFFFF] placeholder-[#A1A1AA] outline-none focus:border-[#FF7900] focus:ring-1 focus:ring-[#FF7900]"
          />
        </div>
      </div>

      {/* Table Container with responsive scroll */}
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-full text-left text-[12px]">
          <thead className="border-b border-[#303030] bg-[#161616]">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                  className={`px-3.5 py-2.5 font-semibold text-[#A1A1AA] whitespace-nowrap ${
                    col.sortable !== false
                      ? "cursor-pointer hover:text-[#FFFFFF] transition-colors"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.label}</span>
                    {col.sortable !== false && (
                      <ArrowUpDown className="h-3 w-3 opacity-60" />
                    )}
                  </div>
                </th>
              ))}
              {actions && actions.length > 0 && (
                <th className="px-3.5 py-2.5 font-semibold text-[#A1A1AA] text-right">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#262626] bg-[#1D1D1D]">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
                  className="px-3.5 py-8 text-center text-[12px] text-[#A1A1AA]"
                >
                  No matching records found.
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => (
                <tr
                  key={row._id || row.id || idx}
                  className="hover:bg-[#242424] transition-colors group"
                >
                  {columns.map((col) => {
                    const val = row[col.key];
                    return (
                      <td
                        key={col.key}
                        className="px-3.5 py-2.5 text-[#FFFFFF] whitespace-nowrap"
                      >
                        {col.render ? col.render(val, row) : val ?? "—"}
                      </td>
                    );
                  })}
                  {actions && actions.length > 0 && (
                    <td className="px-3.5 py-2.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        {actions.map((act, actIdx) => {
                          const Icon = act.icon;
                          return (
                            <button
                              key={actIdx}
                              onClick={() => act.onClick(row)}
                              className="p-1 rounded-md text-[#A1A1AA] hover:text-[#FFA000] hover:bg-[#282828] transition-all cursor-pointer"
                              title={act.label}
                            >
                              <Icon className="h-3.5 w-3.5" />
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-[#303030] bg-[#191919] px-3.5 py-2 text-[11px] text-[#A1A1AA]">
          <span>
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, sortedData.length)} of{" "}
            {sortedData.length} records
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded hover:bg-[#262626] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2 font-mono text-[#FFFFFF]">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded hover:bg-[#262626] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

