import React from "react";
import {
  BookOpen,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import { bg, border, text, badge, shadow } from "@/theme/color";

export default function AiStudentLibraryCard({
  student = {},
  library = { cardNumber: "LIB-001", borrowLimit: 4, currentlyBorrowed: 2, totalFines: 0, books: [] },
  onAskAiPrompt,
}) {
  const { books = [] } = library;

  return (
    <div
      className={`my-3 overflow-hidden rounded-2xl border ${border.default} ${bg.card} ${shadow.md}`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between border-b ${border.default} px-5 py-3.5 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent`}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white shadow-sm">
            <BookOpen className="h-4 w-4" />
          </div>
          <div>
            <h3 className={`text-sm font-bold ${text.primary}`}>
              Library Books & Borrowing Ledger
            </h3>
            <p className={`text-[11px] ${text.muted}`}>
              {student.name} • Card: <span className="font-mono">{library.cardNumber}</span>
            </p>
          </div>
        </div>

        <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400">
          {library.currentlyBorrowed || books.length} / {library.borrowLimit || 4} Books Issued
        </span>
      </div>

      <div className="p-5 space-y-3">
        {books.map((b, idx) => (
          <div
            key={idx}
            className={`flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl border ${border.default} ${bg.surface}`}
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <BookOpen className="h-4 w-4" />
              </div>
              <div>
                <span className={`text-xs font-bold ${text.primary} block`}>
                  {b.title}
                </span>
                <span className="text-[10px] text-stone-400">
                  By {b.author} • Accession: <span className="font-mono">{b.accessionNo}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] text-stone-400 block">Due Date</span>
                <span className="text-xs font-bold font-mono text-amber-400">{b.dueDate}</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400">
                {b.status || "Borrowed"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
