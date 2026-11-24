import React, { useState } from "react";
import {
  Copy,
  Check,
  Terminal,
  Users,
  ClipboardList,
  Banknote,
  Calendar,
  BookUser,
  Award,
  Layers,
  School,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import AiMarkdownTableCard from "./AiMarkdownTableCard.jsx";

/**
 * Maps bullet point content to an appropriate Lucide React icon.
 */
function getBulletIcon(item = "") {
  const text = item.toLowerCase();
  if (
    text.includes("attendance") ||
    text.includes("absent") ||
    text.includes("present") ||
    text.includes("leave")
  ) {
    return ClipboardList;
  }
  if (
    text.includes("student") ||
    text.includes("enroll") ||
    text.includes("admit") ||
    text.includes("admission") ||
    text.includes("roll")
  ) {
    return Users;
  }
  if (
    text.includes("teacher") ||
    text.includes("faculty") ||
    text.includes("staff")
  ) {
    return BookUser;
  }
  if (
    text.includes("fee") ||
    text.includes("payment") ||
    text.includes("dues") ||
    text.includes("finance") ||
    text.includes("salary") ||
    text.includes("budget") ||
    text.includes("defaulter")
  ) {
    return Banknote;
  }
  if (
    text.includes("timetable") ||
    text.includes("period") ||
    text.includes("schedule") ||
    text.includes("routine")
  ) {
    return Calendar;
  }
  if (
    text.includes("exam") ||
    text.includes("result") ||
    text.includes("grade") ||
    text.includes("mark")
  ) {
    return Award;
  }
  if (
    text.includes("subject") ||
    text.includes("syllabus") ||
    text.includes("book") ||
    text.includes("curriculum")
  ) {
    return BookOpen;
  }
  if (text.includes("class") || text.includes("section")) {
    return Layers;
  }
  if (
    text.includes("success") ||
    text.includes("enrolled") ||
    text.includes("completed") ||
    text.includes("done")
  ) {
    return CheckCircle2;
  }
  return ChevronRight;
}

function getBulletIconColor(item = "") {
  const text = item.toLowerCase();
  if (text.includes("attendance")) return "text-amber-400";
  if (
    text.includes("student") ||
    text.includes("enroll") ||
    text.includes("admission")
  )
    return "text-sky-400";
  if (
    text.includes("teacher") ||
    text.includes("faculty") ||
    text.includes("staff")
  )
    return "text-purple-400";
  if (
    text.includes("fee") ||
    text.includes("payment") ||
    text.includes("dues") ||
    text.includes("finance")
  )
    return "text-emerald-400";
  if (
    text.includes("timetable") ||
    text.includes("period") ||
    text.includes("schedule")
  )
    return "text-orange-400";
  if (
    text.includes("exam") ||
    text.includes("result") ||
    text.includes("grade")
  )
    return "text-yellow-400";
  if (text.includes("subject") || text.includes("syllabus"))
    return "text-cyan-400";
  if (
    text.includes("success") ||
    text.includes("enrolled") ||
    text.includes("completed")
  )
    return "text-emerald-400";
  return "text-[#FFA000]";
}

/**
 * Maps heading text to an appropriate Lucide React icon.
 */
function getHeadingIcon(headingText = "") {
  const text = headingText.toLowerCase();
  if (text.includes("attendance"))
    return { icon: ClipboardList, color: "text-amber-400" };
  if (
    text.includes("student") ||
    text.includes("enroll") ||
    text.includes("admission")
  )
    return { icon: Users, color: "text-sky-400" };
  if (
    text.includes("teacher") ||
    text.includes("faculty") ||
    text.includes("staff")
  )
    return { icon: BookUser, color: "text-purple-400" };
  if (
    text.includes("fee") ||
    text.includes("payment") ||
    text.includes("finance") ||
    text.includes("dues")
  )
    return { icon: Banknote, color: "text-emerald-400" };
  if (
    text.includes("timetable") ||
    text.includes("schedule") ||
    text.includes("period")
  )
    return { icon: Calendar, color: "text-orange-400" };
  if (
    text.includes("exam") ||
    text.includes("result") ||
    text.includes("report")
  )
    return { icon: Award, color: "text-yellow-400" };
  if (
    text.includes("school") ||
    text.includes("overview") ||
    text.includes("campus") ||
    text.includes("educore")
  )
    return { icon: School, color: "text-[#FFA000]" };
  if (
    text.includes("class") ||
    text.includes("section") ||
    text.includes("subject")
  )
    return { icon: Layers, color: "text-cyan-400" };
  return { icon: Sparkles, color: "text-[#FFA000]" };
}

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
  // Remove raw tool JSON code blocks or standalone objects: { "tool": "...", "arguments": ... }
  clean = clean.replace(
    /```(?:json)?\s*\{\s*"(?:tool|name|action)"\s*:\s*"[^"]+"\s*,\s*"(?:arguments|parameters)"\s*:\s*\{[^{}]*\}\s*\}\s*```/gis,
    ""
  );
  clean = clean.replace(
    /\{\s*"(?:tool|name|action)"\s*:\s*"[^"]+"\s*,\s*"(?:arguments|parameters)"\s*:\s*\{[^{}]*\}\s*\}/gis,
    ""
  );
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
  let sanitized = sanitizeModelText(text);
  if (!sanitized) {
    if (/\{\s*"(?:tool|name|action)"/i.test(text)) {
      sanitized = "Processing requested school records...";
    } else {
      return null;
    }
  }

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
        <ul key={`list-${key}`} className="my-2 space-y-1.5 pl-0.5">
          {listBuffer.map((item, i) => {
            const BIcon = getBulletIcon(item);
            const iconColor = getBulletIconColor(item);
            return (
              <li
                key={i}
                className="flex items-start gap-2.5 text-[13px] leading-relaxed text-[#FFFFFF]"
              >
                <span className="mt-1 flex-shrink-0">
                  <BIcon className={`h-3.5 w-3.5 ${iconColor}`} />
                </span>
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
            );
          })}
        </ul>
      );
      listBuffer = [];
    }
  };

  const flushTable = (key) => {
    if (tableRows.length > 0) {
      elements.push(
        <AiMarkdownTableCard key={`table-${key}`} tableRows={[...tableRows]} />
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
      listBuffer.push(
        line
          .trim()
          .replace(/^[-*]|\d+\.\s*/, "")
          .trim()
      );
      return;
    } else {
      flushList(index);
    }

    // Heading 1
    if (line.startsWith("# ")) {
      const cleanTitle = line.replace("# ", "").replace(/^[^\w\s]+\s*/, "").trim();
      const meta = getHeadingIcon(cleanTitle);
      const HIcon = meta.icon;
      elements.push(
        <h2
          key={index}
          className="mt-4 mb-2 flex items-center gap-2 text-base font-bold text-[#FFFFFF] tracking-tight border-b border-[#303030] pb-1"
        >
          <HIcon className={`h-4.5 w-4.5 flex-shrink-0 ${meta.color}`} />
          <span>{cleanTitle}</span>
        </h2>
      );
      return;
    }

    // Heading 2
    if (line.startsWith("## ")) {
      const cleanTitle = line.replace("## ", "").replace(/^[^\w\s]+\s*/, "").trim();
      const meta = getHeadingIcon(cleanTitle);
      const HIcon = meta.icon;
      elements.push(
        <h3
          key={index}
          className="mt-3.5 mb-1.5 flex items-center gap-2 text-sm font-bold text-[#FFA000]"
        >
          <HIcon className={`h-4 w-4 flex-shrink-0 ${meta.color}`} />
          <span>{cleanTitle}</span>
        </h3>
      );
      return;
    }

    // Heading 3
    if (line.startsWith("### ")) {
      const cleanTitle = line.replace("### ", "").replace(/^[^\w\s]+\s*/, "").trim();
      const meta = getHeadingIcon(cleanTitle);
      const HIcon = meta.icon;
      elements.push(
        <h4
          key={index}
          className="mt-3 mb-1 flex items-center gap-1.5 text-[13px] font-semibold text-[#FFFFFF]"
        >
          <HIcon className={`h-3.5 w-3.5 flex-shrink-0 ${meta.color}`} />
          <span>{cleanTitle}</span>
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
