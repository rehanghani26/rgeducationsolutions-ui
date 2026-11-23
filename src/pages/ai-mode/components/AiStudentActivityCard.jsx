import React from "react";
import {
  History,
  CheckCircle,
  FileText,
  User,
  Clock,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { bg, border, text, badge, shadow } from "@/theme/color";

export default function AiStudentActivityCard({
  student = {},
  timeline = [],
  onAskAiPrompt,
}) {
  return (
    <div
      className={`my-3 overflow-hidden rounded-2xl border ${border.default} ${bg.card} ${shadow.md}`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between border-b ${border.default} px-5 py-3.5 bg-gradient-to-r from-stone-500/15 via-orange-500/10 to-transparent`}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-stone-600 to-stone-500 text-white shadow-sm">
            <History className="h-4 w-4" />
          </div>
          <div>
            <h3 className={`text-sm font-bold ${text.primary}`}>
              Student Activity Log & Audit Trail
            </h3>
            <p className={`text-[11px] ${text.muted}`}>
              {student.name} • Admission: {student.admissionNumber || "—"}
            </p>
          </div>
        </div>
        <span className="text-[11px] font-bold text-stone-400">
          {timeline.length} Recorded Events
        </span>
      </div>

      {/* Timeline Content */}
      <div className="p-5">
        <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200 dark:before:bg-stone-800">
          {timeline.map((item, idx) => (
            <div key={idx} className="relative group">
              <div className="absolute -left-6 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-orange-500 bg-white dark:bg-stone-900 group-hover:scale-125 transition-transform" />
              <div className={`p-3 rounded-xl border ${border.default} ${bg.surface}`}>
                <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                  <span className={`text-xs font-bold ${text.primary}`}>
                    {item.action}
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono">
                    {item.date}
                  </span>
                </div>
                <p className={`text-xs ${text.muted} mb-1`}>{item.details}</p>
                <div className="flex items-center gap-1.5 text-[10px] text-orange-400 font-medium">
                  <User className="h-3 w-3" />
                  Logged by: {item.user || "System"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
