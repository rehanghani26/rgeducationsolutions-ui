import React, { useState } from "react";
import {
  ListOrdered,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Loader2,
} from "lucide-react";
import { bg, border, text, badge, shadow } from "@/theme/color";

export default function AiStudentRollAllocationCard({
  class: className = "Class 10",
  section = "A",
  totalCount = 0,
  reallocated = [],
  onAskAiPrompt,
}) {
  return (
    <div
      className={`my-3 overflow-hidden rounded-2xl border ${border.default} ${bg.card} ${shadow.md}`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between border-b ${border.default} px-5 py-3.5 bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-transparent`}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white shadow-sm">
            <ListOrdered className="h-4 w-4" />
          </div>
          <div>
            <h3 className={`text-sm font-bold ${text.primary}`}>
              Alphabetical Roll Number Allocation
            </h3>
            <p className={`text-[11px] ${text.muted}`}>
              {className} • Section {section} • {totalCount || reallocated.length} Students Sequenced
            </p>
          </div>
        </div>

        <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Reallocated Sequentially
        </span>
      </div>

      <div className="p-5 overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-stone-200 dark:border-stone-800 text-[11px] font-bold text-stone-400 uppercase">
              <th className="py-2 px-3">New Roll</th>
              <th className="py-2 px-3">Old Roll</th>
              <th className="py-2 px-3">Student Full Name</th>
              <th className="py-2 px-3">Admission Number</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
            {reallocated.map((s, idx) => (
              <tr key={idx} className="hover:bg-stone-50/50 dark:hover:bg-stone-900/30">
                <td className="py-2 px-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500/10 font-bold font-mono text-orange-400 text-xs">
                    {s.newRoll}
                  </span>
                </td>
                <td className="py-2 px-3 text-stone-400 font-mono">{s.oldRoll}</td>
                <td className={`py-2 px-3 font-semibold ${text.primary}`}>{s.name}</td>
                <td className="py-2 px-3 font-mono text-stone-400">{s.admissionNumber}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
