import React from "react";
import {
  BookMarked,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import { bg, border, text, badge, shadow } from "@/theme/color";

export default function AiStudentHomeworkCard({
  student = {},
  summary = { total: 3, submitted: 2, pending: 1 },
  homeworkList = [],
  onAskAiPrompt,
}) {
  return (
    <div
      className={`my-3 overflow-hidden rounded-2xl border ${border.default} ${bg.card} ${shadow.md}`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between border-b ${border.default} px-5 py-3.5 bg-gradient-to-r from-purple-500/15 via-indigo-500/10 to-transparent`}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500 text-white shadow-sm">
            <BookMarked className="h-4 w-4" />
          </div>
          <div>
            <h3 className={`text-sm font-bold ${text.primary}`}>
              Homework & Daily Assignments
            </h3>
            <p className={`text-[11px] ${text.muted}`}>
              {student.name} • Class {student.class || "10"} ({student.section || "A"})
            </p>
          </div>
        </div>

        <span className="rounded-full bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 text-[11px] font-bold text-purple-400">
          {summary.submitted} of {summary.total} Completed
        </span>
      </div>

      <div className="p-5 space-y-2.5">
        {homeworkList.map((hw, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-xl border ${border.default} ${bg.surface} space-y-1.5`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className={`text-xs font-bold ${text.primary}`}>{hw.title}</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  hw.status === "Submitted" || hw.status === "Graded"
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-amber-500/10 text-amber-400"
                }`}
              >
                {hw.status} {hw.grade !== "—" && `(${hw.grade})`}
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-between text-[11px] text-stone-400">
              <span>Subject: <strong className={text.primary}>{hw.subject}</strong></span>
              <span>Due: <strong className="text-amber-400">{hw.dueDate}</strong></span>
            </div>
            {hw.teacherNotes && (
              <p className="text-[10px] text-stone-400 italic">"{hw.teacherNotes}"</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
