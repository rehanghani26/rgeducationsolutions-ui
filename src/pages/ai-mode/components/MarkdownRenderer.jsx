import React from "react";

/**
 * Lightweight, safe markdown renderer tailored for ERP AI responses.
 * Fully styled for both Light and Dark mode.
 */
export default function MarkdownRenderer({ text }) {
  if (!text) return null;

  const lines = text.split("\n");
  const elements = [];
  let inTable = false;
  let tableRows = [];
  let listBuffer = [];

  const flushList = (key) => {
    if (listBuffer.length > 0) {
      elements.push(
        <ul key={`list-${key}`} className="my-2 space-y-1.5 pl-1">
          {listBuffer.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-[13px] leading-relaxed text-stone-800 dark:text-stone-200"
            >
              <span className="mt-[6px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-500" />
              <span
                dangerouslySetInnerHTML={{
                  __html: item
                    .replace(
                      /\*\*(.*?)\*\*/g,
                      "<strong class='text-stone-900 dark:text-white font-bold'>$1</strong>"
                    )
                    .replace(
                      /`(.*?)`/g,
                      "<code class='bg-stone-100 dark:bg-stone-800 text-orange-600 dark:text-orange-400 border border-stone-200/80 dark:border-stone-700 px-1.5 py-0.5 rounded text-[12px] font-mono'>$1</code>"
                    ),
                }}
              />
            </li>
          ))}
        </ul>
      );
      listBuffer = [];
    }
  };

  const flushTable = (key) => {
    if (tableRows.length > 0) {
      const headerRow = tableRows[0];
      const bodyRows = tableRows.slice(1).filter((r) => !r.isDivider);
      elements.push(
        <div
          key={`table-${key}`}
          className="my-3 overflow-x-auto rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm"
        >
          <table className="w-full min-w-full text-left text-[12px]">
            <thead className="border-b border-stone-200 dark:border-stone-800 bg-stone-100/90 dark:bg-stone-800/80">
              <tr>
                {headerRow.cols.map((col, ci) => (
                  <th
                    key={ci}
                    className="px-4 py-2.5 font-bold text-stone-800 dark:text-stone-200 whitespace-nowrap"
                  >
                    {col.trim()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-stone-900/40 divide-y divide-stone-100 dark:divide-stone-800/60">
              {bodyRows.map((row, ri) => (
                <tr
                  key={ri}
                  className="hover:bg-orange-500/5 dark:hover:bg-orange-500/10 transition-colors"
                >
                  {row.cols.map((cell, ci) => (
                    <td key={ci} className="px-4 py-2 text-stone-700 dark:text-stone-300">
                      {cell.trim()}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
      inTable = false;
    }
  };

  lines.forEach((line, index) => {
    // Table detection
    if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
      flushList(index);
      inTable = true;
      const cols = line
        .trim()
        .slice(1, -1)
        .split("|")
        .map((c) => c.trim());
      const isDivider = cols.every((c) => /^[-:]+$/.test(c));
      tableRows.push({ cols, isDivider });
      return;
    } else if (inTable) {
      flushTable(index);
    }

    // List items
    if (
      line.trim().startsWith("- ") ||
      line.trim().startsWith("* ") ||
      /^\d+\.\s/.test(line.trim())
    ) {
      flushTable(index);
      const itemText = line.trim().replace(/^[-*]\s|^\d+\.\s/, "");
      listBuffer.push(itemText);
      return;
    } else {
      flushList(index);
    }

    // Code blocks (simple inline fence markers skip)
    if (line.startsWith("```")) {
      return;
    }

    // Headers
    if (line.startsWith("### ")) {
      elements.push(
        <h4
          key={index}
          className="mt-4 mb-1.5 text-[13px] font-bold text-orange-600 dark:text-orange-400 tracking-wide"
        >
          {line.replace("### ", "")}
        </h4>
      );
      return;
    }
    if (line.startsWith("## ")) {
      elements.push(
        <h3
          key={index}
          className="mt-4 mb-2 text-sm font-bold text-stone-900 dark:text-white tracking-tight border-b border-stone-200 dark:border-stone-800 pb-1"
        >
          {line.replace("## ", "")}
        </h3>
      );
      return;
    }
    if (line.startsWith("# ")) {
      elements.push(
        <h2
          key={index}
          className="mt-4 mb-2 text-base font-extrabold text-stone-900 dark:text-white"
        >
          {line.replace("# ", "")}
        </h2>
      );
      return;
    }

    // Horizontal rule
    if (line.trim() === "---" || line.trim() === "***") {
      elements.push(<hr key={index} className="my-3 border-stone-200 dark:border-stone-800" />);
      return;
    }

    // Blank line
    if (line.trim() === "") {
      elements.push(<div key={index} className="h-1.5" />);
      return;
    }

    // Normal paragraph
    elements.push(
      <p
        key={index}
        className="text-[13px] leading-relaxed text-stone-800 dark:text-stone-200"
        dangerouslySetInnerHTML={{
          __html: line
            .replace(
              /\*\*(.*?)\*\*/g,
              "<strong class='text-stone-900 dark:text-white font-bold'>$1</strong>"
            )
            .replace(/\*(.*?)\*/g, "<em class='text-stone-600 dark:text-stone-300'>$1</em>")
            .replace(
              /`(.*?)`/g,
              "<code class='bg-stone-100 dark:bg-stone-800 text-orange-600 dark:text-orange-400 border border-stone-200/80 dark:border-stone-700 px-1.5 py-0.5 rounded text-[12px] font-mono'>$1</code>"
            ),
        }}
      />
    );
  });

  flushList("final");
  flushTable("final");

  return <div className="space-y-1.5">{elements}</div>;
}
