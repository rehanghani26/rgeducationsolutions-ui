import React, { useState } from "react";
import { Table as TableIcon, Copy, Check, LayoutGrid, List } from "lucide-react";

export default function AiMarkdownTableCard({ tableRows = [] }) {
  const [viewMode, setViewMode] = useState("table");
  const [copied, setCopied] = useState(false);

  if (!tableRows || tableRows.length === 0) return null;

  const headerRow = tableRows[0];
  const bodyRows = tableRows.slice(1).filter((r) => !r.isDivider);

  const handleCopy = () => {
    const tsv = tableRows
      .filter((r) => !r.isDivider)
      .map((r) => r.cols.join("\t"))
      .join("\n");
    navigator.clipboard.writeText(tsv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatText = (raw = "") => {
    return raw
      .replace(/\*\*(.*?)\*\*/g, "<strong class='text-white font-bold'>$1</strong>")
      .replace(
        /`([^`]+)`/g,
        "<code class='rounded bg-[#202020] px-1 py-0.5 text-[11px] font-mono text-[#FFA000] border border-[#303030]'>$1</code>"
      );
  };

  return (
    <div className="my-3 overflow-hidden rounded-2xl border border-[#303030] bg-[#161616] shadow-md transition-all">
      {/* ── Table Top Bar ── */}
      <div className="flex items-center justify-between border-b border-[#2A2A2A] bg-[#1C1C1C] px-3.5 py-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#2A2A2A] text-[#FFA000]">
            <TableIcon className="h-3.5 w-3.5" />
          </div>
          <span className="font-semibold text-white">Summary Table</span>
          <span className="rounded-full bg-[#2A2A2A] px-2 py-0.5 text-[10px] font-mono text-[#A1A1AA]">
            {bodyRows.length} {bodyRows.length === 1 ? "row" : "rows"}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="flex items-center rounded-lg border border-[#333333] bg-[#141414] p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`p-1 rounded transition cursor-pointer ${
                viewMode === "table" ? "bg-[#2A2A2A] text-white" : "text-[#71717A] hover:text-white"
              }`}
              title="Table view"
            >
              <List className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              className={`p-1 rounded transition cursor-pointer ${
                viewMode === "cards" ? "bg-[#2A2A2A] text-white" : "text-[#71717A] hover:text-white"
              }`}
              title="Card view"
            >
              <LayoutGrid className="h-3 w-3" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 rounded-lg border border-[#333333] bg-[#181818] px-2 py-1 text-[10px] text-[#A1A1AA] hover:text-white transition cursor-pointer"
            title="Copy as TSV / Spreadsheet"
          >
            {copied ? (
              <>
                <Check className="h-2.5 w-2.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-2.5 w-2.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Table or Cards ── */}
      {viewMode === "table" ? (
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#2A2A2A] bg-[#191919] text-[11px] font-bold uppercase tracking-wider text-[#A1A1AA]">
                {headerRow.cols.map((col, idx) => (
                  <th key={idx} className="py-2 px-3 whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222222]">
              {bodyRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-[#1F1F1F] transition-colors">
                  {row.cols.map((cell, cIdx) => (
                    <td
                      key={cIdx}
                      className="py-2 px-3 text-xs text-[#E4E4E7] leading-relaxed align-middle"
                      dangerouslySetInnerHTML={{ __html: formatText(cell) }}
                    />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-3 grid gap-2 sm:grid-cols-2">
          {bodyRows.map((row, rIdx) => (
            <div
              key={rIdx}
              className="rounded-xl border border-[#2B2B2B] bg-[#1A1A1A] p-2.5 space-y-1.5"
            >
              {headerRow.cols.map((header, cIdx) => (
                <div
                  key={cIdx}
                  className="flex items-baseline justify-between gap-2 border-b border-[#262626] pb-1 last:border-0 last:pb-0 text-xs"
                >
                  <span className="text-[11px] text-[#A1A1AA] font-medium">
                    {header}:
                  </span>
                  <span
                    className="text-right text-white font-semibold"
                    dangerouslySetInnerHTML={{
                      __html: formatText(row.cols[cIdx] || "—"),
                    }}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
