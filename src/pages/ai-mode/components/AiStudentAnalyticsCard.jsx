import React from "react";
import {
  BarChart3,
  TrendingUp,
  Award,
  AlertCircle,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { bg, border, text, badge, shadow } from "@/theme/color";

export default function AiStudentAnalyticsCard({
  student = {},
  analytics = {
    gpa: 3.82,
    rankPercentile: 92,
    classRank: 3,
    totalInClass: 38,
    strongSubjects: [],
    focusSubjects: [],
    subjectRadar: [],
    teacherAssessment: "",
  },
  onAskAiPrompt,
}) {
  return (
    <div
      className={`my-3 overflow-hidden rounded-2xl border ${border.default} ${bg.card} ${shadow.lg}`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between border-b ${border.default} px-5 py-3.5 bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-transparent`}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white shadow-sm">
            <BarChart3 className="h-4 w-4" />
          </div>
          <div>
            <h3 className={`text-sm font-bold ${text.primary}`}>
              Performance Analytics & Subject Radar
            </h3>
            <p className={`text-[11px] ${text.muted}`}>
              {student.name} • Class {student.class || "10"} ({student.section || "A"})
            </p>
          </div>
        </div>

        <span className="rounded-full bg-orange-500/10 border border-orange-500/20 px-2.5 py-0.5 text-[11px] font-bold text-orange-400">
          Rank #{analytics.classRank || 3} of {analytics.totalInClass || 38} ({analytics.rankPercentile || 92}th Percentile)
        </span>
      </div>

      <div className="p-5 space-y-4">
        {/* GPA & Strengths Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Strengths */}
          <div className={`p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5`}>
            <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">
              Top Performing Subjects
            </span>
            <div className="space-y-1.5">
              {analytics.strongSubjects?.map((s, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className={`font-medium ${text.primary}`}>{s.name}</span>
                  <span className="font-bold text-emerald-400">{s.score}% ({s.grade})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Focus Areas */}
          <div className={`p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5`}>
            <span className="text-[10px] uppercase font-bold text-amber-400 block mb-1">
              Recommended Focus Areas
            </span>
            <div className="space-y-1.5">
              {analytics.focusSubjects?.map((s, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className={`font-medium ${text.primary}`}>{s.name}</span>
                  <span className="font-bold text-amber-400">{s.score}% ({s.grade})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Subject Score Bars */}
        {analytics.subjectRadar?.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">
              Curriculum Mastery Breakdown
            </span>
            <div className="space-y-2">
              {analytics.subjectRadar.map((sub, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className={text.primary}>{sub.subject}</span>
                    <span className="font-mono text-orange-400">{sub.score}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500"
                      style={{ width: `${sub.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Teacher Assessment */}
        {analytics.teacherAssessment && (
          <div className={`p-3 rounded-xl border ${border.default} ${bg.surface} text-xs text-stone-400 italic`}>
            <strong>Academic Assessment:</strong> "{analytics.teacherAssessment}"
          </div>
        )}
      </div>
    </div>
  );
}
