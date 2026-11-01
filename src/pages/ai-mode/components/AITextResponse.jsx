import React, { useState } from "react";
import { Copy, Check, Terminal } from "lucide-react";

/**
 * Sanitizes any raw function calls that might accidentally appear in LLM text output
 * e.g. "getStudents{}", "tool_call: ...", or unparsed function strings
 */
export function sanitizeModelText(rawText = "") {
  if (!rawText) return "";
  let clean = rawText;
  // Remove function call strings like getStudents{} or getFeeSummary{"..."}
  clean = clean.replace(
    /\b[a-zA-Z0-9_]+\s*\{\s*(?:[^{}]*\{[^{}]*\})*[^{}]*\}\s*/g,
    ""
  );
  // Remove tool_call markers
  clean = clean.replace(/tool_calls?:?\s*\[.*?\]/gis, "");
  // Remove empty dangling lines
  clean = clean.replace(/\n{3,}/g, "\n\n").trim();
  return clean;
}

function CodeBlock({ code, language = "" }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 overflow-hidden rounded-xl border border-[#303030] bg-[#141414] shadow-md">
      <div className="flex items-center justify-between border-b border-[#303030] bg-[#1A1A1A] px-3.5 py-1.5 text-[11px] text-[#A1A1AA]">
        <div className="flex items-center gap-1.5 font-mono">
          <Terminal className="h-3.5 w-3.5 text-[#FFA000]" />
          <span>{language || "code"}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] text-[#A1A1AA] hover:text-[#FFFFFF] transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-3.5 text-[12px] font-mono leading-relaxed text-[#FFFFFF] scrollbar-thin">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function AITextResponse({ text = "" }) {
  const sanitized = sanitizeModelText(text);
  if (!sanitized) return null;

  const lines = sanitized.split("\n");
  const elements = [];
  let inCodeBlock = false;
  let codeBuffer = [];
  let codeLanguage = "";
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
              className="flex items-start gap-2.5 text-[13px] leading-relaxed text-[#FFFFFF]"
            >
              <span className="mt-[7px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#FF7900]" />
              <span
                dangerouslySetInnerHTML={{
                  __html: item
                    .replace(
                      /\*\*(.*?)\*\*/g,
                      "<strong class='text-[#FFFFFF] font-bold'>$1</strong>"
                    )
                    .replace(
                      /`([^`]+)`/g,
                      "<code class='rounded bg-[#1D1D1D] px-1.5 py-0.5 text-[12px] font-mono text-[#FFA000] border border-[#303030]'>$1</code>"
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
          className="my-3 overflow-x-auto rounded-xl border border-[#303030] bg-[#1D1D1D] shadow-sm scrollbar-thin"
        >
          <table className="w-full min-w-full text-left text-[12px]">
            <thead className="border-b border-[#303030] bg-[#181818]">
              <tr>
                {headerRow.cols.map((col, ci) => (
                  <th
                    key={ci}
                    className="px-3.5 py-2 font-bold text-[#A1A1AA] whitespace-nowrap"
                  >
                    {col.trim()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262626]">
              {bodyRows.map((row, ri) => (
                <tr
                  key={ri}
                  className="hover:bg-[#252525] transition-colors"
                >
                  {row.cols.map((cell, ci) => (
                    <td
                      key={ci}
                      className="px-3.5 py-2 text-[#FFFFFF]"
                      dangerouslySetInnerHTML={{
                        __html: cell
                          .trim()
                          .replace(
                            /\*\*(.*?)\*\*/g,
                            "<strong class='text-[#FFFFFF] font-bold'>$1</strong>"
                          ),
                      }}
                    />
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
    // Code block toggle ```
    if (line.trim().startsWith("```")) {
      flushList(index);
      flushTable(index);
      if (inCodeBlock) {
        elements.push(
          <CodeBlock
            key={`code-${index}`}
            code={codeBuffer.join("\n")}
            language={codeLanguage}
          />
        );
        codeBuffer = [];
        codeLanguage = "";
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
        codeLanguage = line.trim().slice(3).trim();
      }
      return;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      return;
    }

    // Markdown Table detection | col | col |
    if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
      flushList(index);
      inTable = true;
      const cols = line
        .trim()
        .slice(1, -1)
        .split("|")
        .map((c) => c.trim());
      const isDivider = cols.every((c) => /^:?-+:?$/.test(c));
      tableRows.push({ cols, isDivider });
      return;
    } else if (inTable) {
      flushTable(index);
    }

    // List item (- or * or numbered)
    if (
      line.trim().startsWith("- ") ||
      line.trim().startsWith("* ") ||
      /^\d+\.\s/.test(line.trim())
    ) {
      listBuffer.push(line.trim().replace(/^[-*]|\d+\.\s*/, "").trim());
      return;
    } else {
      flushList(index);
    }

    // Heading 1
    if (line.startsWith("# ")) {
      elements.push(
        <h2
          key={index}
          className="mt-4 mb-2 text-base font-bold text-[#FFFFFF] tracking-tight border-b border-[#303030] pb-1"
        >
          {line.replace("# ", "")}
        </h2>
      );
      return;
    }

    // Heading 2
    if (line.startsWith("## ")) {
      elements.push(
        <h3
          key={index}
          className="mt-3.5 mb-1.5 text-sm font-bold text-[#FFA000]"
        >
          {line.replace("## ", "")}
        </h3>
      );
      return;
    }

    // Heading 3
    if (line.startsWith("### ")) {
      elements.push(
        <h4
          key={index}
          className="mt-3 mb-1 text-[13px] font-semibold text-[#FFFFFF]"
        >
          {line.replace("### ", "")}
        </h4>
      );
      return;
    }

    // Empty line spacer
    if (!line.trim()) {
      elements.push(<div key={index} className="h-1.5" />);
      return;
    }

    // Regular paragraph
    elements.push(
      <p
        key={index}
        className="my-1 text-[13px] leading-relaxed text-[#FFFFFF]"
        dangerouslySetInnerHTML={{
          __html: line
            .replace(
              /\*\*(.*?)\*\*/g,
              "<strong class='text-[#FFFFFF] font-bold'>$1</strong>"
            )
            .replace(
              /`([^`]+)`/g,
              "<code class='rounded bg-[#141414] px-1.5 py-0.5 text-[12px] font-mono text-[#FFA000] border border-[#303030]'>$1</code>"
            ),
        }}
      />
    );
  });

  flushList("end");
  flushTable("end");

  if (inCodeBlock && codeBuffer.length > 0) {
    elements.push(
      <CodeBlock
        key="code-end"
        code={codeBuffer.join("\n")}
        language={codeLanguage}
      />
    );
  }

  return <div className="space-y-1">{elements}</div>;
}

