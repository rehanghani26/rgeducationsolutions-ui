import React, { useState, useMemo } from "react";
import {
  Table as TableIcon,
  Search,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  LayoutGrid,
  List,
  Copy,
  Check,
  Download,
} from "lucide-react";

/**
 * Humanizes property names (e.g. "studentName" -> "Student Name")
 */
function humanizeKey(key = "") {
  if (!key) return "";
  const spaced = key.replace(/([A-Z])/g, " $1").replace(/_/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1).trim();
}

/**
 * Format cell content based on value type
 */
function formatCellValue(value) {
  if (value === null || value === undefined || value === "") {
    return <span className="text-[#71717A] italic">—</span>;
  }
  if (typeof value === "boolean") {
    return value ? (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
        ✓ Configured
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
        Pending
      </span>
    );
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-[#71717A]">—</span>;
    return (
      <div className="flex flex-wrap gap-1 max-w-xs">
        {value.slice(0, 3).map((item, idx) => (
          <span
            key={idx}
            className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#262626] text-[#D4D4D8] border border-[#3A3A3A]"
          >
            {typeof item === "object" ? JSON.stringify(item) : String(item)}
          </span>
        ))}
        {value.length > 3 && (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#262626] text-[#A1A1AA]">
            +{value.length - 3}
          </span>
        )}
      </div>
    );
  }
  if (typeof value === "object") {
    return (
      <span className="text-[11px] font-mono text-[#A1A1AA] truncate max-w-[150px] inline-block">
        {JSON.stringify(value)}
      </span>
    );
  }

  const str = String(value);
  const lower = str.toLowerCase();
  if (["active", "success", "passed", "present", "linked"].includes(lower)) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
        {str}
      </span>
    );
  }
  if (["inactive", "failed", "absent", "suspended", "expired"].includes(lower)) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
        {str}
      </span>
    );
  }
  if (["pending", "upcoming", "partial", "draft", "leave"].includes(lower)) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
        {str}
      </span>
    );
  }

  return <span className="text-[#FFFFFF]">{str}</span>;
}

export default function AiTableDataCard({
  title = "Data Records",
  data = [],
  icon: Icon = TableIcon,
  columns = null, // optional explicit column list
  pageSize = 6,
  onRowClick = null,
  emptyMessage = "No records found.",
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState("table"); // "table" | "grid"
  const [copied, setCopied] = useState(false);

  // Normalize data array
  const rows = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (typeof data === "object") {
      const arrayKey = Object.keys(data).find((k) => Array.isArray(data[k]));
      if (arrayKey) return data[arrayKey];
      return [data];
    }
    return [];
  }, [data]);

  // Discover columns dynamically if not provided
  const inferredColumns = useMemo(() => {
    if (columns && columns.length > 0) return columns;
    if (rows.length === 0) return [];

    const keys = new Set();
    rows.slice(0, 15).forEach((row) => {
      if (row && typeof row === "object") {
        Object.keys(row).forEach((k) => {
          if (!["_id", "__v", "password", "hash", "salt"].includes(k)) {
            keys.add(k);
          }
        });
      }
    });

    return Array.from(keys);
  }, [columns, rows]);

  // Filter rows by search term
  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return rows;
    const term = searchTerm.toLowerCase();
    return rows.filter((row) => {
      if (!row || typeof row !== "object") return String(row).toLowerCase().includes(term);
      return Object.values(row).some((val) =>
        String(val ?? "").toLowerCase().includes(term)
      );
    });
  }, [rows, searchTerm]);

  const totalPages = Math.ceil(filteredRows.length / pageSize) || 1;
  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, page, pageSize]);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(rows, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!rows || rows.length === 0) {
    return null;
  }

  return (
    <div className="my-3 overflow-hidden rounded-2xl border border-[#303030] bg-[#161616] shadow-lg transition-all">
      {/* ── Card Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2A2A2A] bg-[#1D1D1D] px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-[#FF7900] to-[#FFA000] text-white shadow-sm shadow-[#FF7900]/20">
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-[#FFFFFF]">
                {title}
              </span>
              <span className="rounded-full bg-[#FF7900]/15 px-2 py-0.5 text-[11px] font-semibold text-[#FFA000] border border-[#FF7900]/30">
                {filteredRows.length} {filteredRows.length === 1 ? "record" : "records"}
              </span>
            </div>
          </div>
        </div>

        {/* View toggle & Actions */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center rounded-lg border border-[#333333] bg-[#141414] p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-md transition cursor-pointer ${
                viewMode === "table"
                  ? "bg-[#2A2A2A] text-white shadow-xs"
                  : "text-[#A1A1AA] hover:text-white"
              }`}
              title="Table view"
            >
              <List className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition cursor-pointer ${
                viewMode === "grid"
                  ? "bg-[#2A2A2A] text-white shadow-xs"
                  : "text-[#A1A1AA] hover:text-white"
              }`}
              title="Card grid view"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopyJson}
            className="flex items-center gap-1 rounded-lg border border-[#333333] bg-[#1A1A1A] px-2 py-1.5 text-[11px] font-medium text-[#A1A1AA] hover:text-white hover:bg-[#252525] transition cursor-pointer"
            title="Copy as JSON"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span>JSON</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Search Filter Bar ── */}
      {rows.length > 3 && (
        <div className="border-b border-[#2A2A2A] bg-[#141414] px-4 py-2.5 flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-[#71717A]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              placeholder={`Search in ${title.toLowerCase()}...`}
              className="w-full rounded-lg border border-[#303030] bg-[#1A1A1A] pl-8 pr-3 py-1 text-xs text-[#FFFFFF] placeholder:text-[#71717A] focus:outline-none focus:border-[#FF7900] transition"
            />
          </div>

          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="flex items-center gap-1 text-[11px] text-[#A1A1AA] hover:text-white"
            >
              <RotateCcw className="h-3 w-3" />
              Clear
            </button>
          )}
        </div>
      )}

      {/* ── Body Content ── */}
      {filteredRows.length === 0 ? (
        <div className="px-6 py-8 text-center text-xs text-[#A1A1AA]">
          {emptyMessage}
        </div>
      ) : viewMode === "table" ? (
        /* Table Layout */
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#2A2A2A] bg-[#181818] text-[11px] font-bold uppercase tracking-wider text-[#A1A1AA]">
                <th className="py-2.5 px-3.5 w-8 text-center">#</th>
                {inferredColumns.map((col) => (
                  <th key={col} className="py-2.5 px-3.5 whitespace-nowrap">
                    {humanizeKey(col)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222222]">
              {paginatedRows.map((row, idx) => {
                const globalIndex = (page - 1) * pageSize + idx + 1;
                return (
                  <tr
                    key={row.id || row._id || idx}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={`transition-colors hover:bg-[#202020] ${
                      onRowClick ? "cursor-pointer" : ""
                    }`}
                  >
                    <td className="py-2.5 px-3.5 text-center text-[11px] font-mono text-[#71717A]">
                      {globalIndex}
                    </td>
                    {inferredColumns.map((col) => (
                      <td
                        key={col}
                        className="py-2.5 px-3.5 align-middle leading-normal text-xs text-[#E4E4E7]"
                      >
                        {formatCellValue(row[col])}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Grid Cards Layout */
        <div className="p-3.5 grid gap-2.5 sm:grid-cols-2">
          {paginatedRows.map((row, idx) => (
            <div
              key={row.id || row._id || idx}
              onClick={() => onRowClick && onRowClick(row)}
              className={`rounded-xl border border-[#2B2B2B] bg-[#1B1B1B] p-3 transition hover:border-[#FF7900]/40 ${
                onRowClick ? "cursor-pointer" : ""
              }`}
            >
              <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-2 mb-2">
                <span className="text-xs font-bold text-white truncate">
                  {row.name || row.title || row.className || row.subject || `Item #${(page - 1) * pageSize + idx + 1}`}
                </span>
                {row.status && (
                  <span className="text-[10px]">
                    {formatCellValue(row.status)}
                  </span>
                )}
              </div>
              <div className="space-y-1.5 text-xs">
                {inferredColumns
                  .filter((c) => !["name", "title", "className", "subject", "status"].includes(c))
                  .slice(0, 5)
                  .map((col) => (
                    <div
                      key={col}
                      className="flex items-baseline justify-between gap-2"
                    >
                      <span className="text-[11px] text-[#A1A1AA] capitalize">
                        {humanizeKey(col)}:
                      </span>
                      <div className="text-right truncate max-w-[65%]">
                        {formatCellValue(row[col])}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Pagination Footer ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-[#2A2A2A] bg-[#141414] px-4 py-2.5 text-xs text-[#A1A1AA]">
          <span>
            Page <strong className="text-white">{page}</strong> of{" "}
            <strong className="text-white">{totalPages}</strong>
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="flex items-center gap-1 rounded-lg border border-[#333333] bg-[#1C1C1C] px-2.5 py-1 text-xs text-[#A1A1AA] hover:text-white disabled:opacity-40 transition cursor-pointer"
            >
              <ChevronLeft className="h-3 w-3" />
              Prev
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="flex items-center gap-1 rounded-lg border border-[#333333] bg-[#1C1C1C] px-2.5 py-1 text-xs text-[#A1A1AA] hover:text-white disabled:opacity-40 transition cursor-pointer"
            >
              Next
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
