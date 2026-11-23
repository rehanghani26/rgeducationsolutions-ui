import React from "react";
import {
  ShieldAlert,
  Award,
  AlertTriangle,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import { bg, border, text, badge, shadow } from "@/theme/color";

export default function AiStudentDisciplineCard({
  student = {},
  disciplinary = { meritPoints: 40, demeritPoints: 0, overallConduct: "Exemplary", disciplinaryStatus: "Clear", records: [] },
  onAskAiPrompt,
}) {
  const { records = [] } = disciplinary;

  return (
    <div
      className={`my-3 overflow-hidden rounded-2xl border ${border.default} ${bg.card} ${shadow.md}`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between border-b ${border.default} px-5 py-3.5 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent`}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-sm">
            <Award className="h-4 w-4" />
          </div>
          <div>
            <h3 className={`text-sm font-bold ${text.primary}`}>
              Disciplinary Record & Behavioral Merits
            </h3>
            <p className={`text-[11px] ${text.muted}`}>
              {student.name} • Class {student.class || "10"} ({student.section || "A"})
            </p>
          </div>
        </div>

        <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400">
          Conduct: {disciplinary.overallConduct || "Exemplary"}
        </span>
      </div>

      <div className="p-5 space-y-4">
        {/* Points Row */}
        <div className="grid grid-cols-2 gap-3">
          <div className={`p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-center`}>
            <span className="text-[10px] uppercase font-bold text-emerald-400">Merit Points</span>
            <p className="text-lg font-black text-emerald-400">+{disciplinary.meritPoints || 40}</p>
          </div>
          <div className={`p-3 rounded-xl border border-rose-500/20 bg-rose-500/10 text-center`}>
            <span className="text-[10px] uppercase font-bold text-rose-400">Demerit Infractions</span>
            <p className="text-lg font-black text-rose-400">{disciplinary.demeritPoints || 0}</p>
          </div>
        </div>

        {/* Records */}
        <div className="space-y-2">
          {records.map((r, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border ${border.default} ${bg.surface}`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className={`text-xs font-bold ${text.primary}`}>{r.title}</span>
                <span className="text-xs font-bold text-emerald-400">{r.points}</span>
              </div>
              <p className={`text-[11px] ${text.muted}`}>{r.details}</p>
              <span className="text-[10px] text-stone-400 block mt-1">
                Awarded by {r.awardedBy} on {r.date}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
