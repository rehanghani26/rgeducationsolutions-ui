import React from "react";
import {
  Award,
  Printer,
  Sparkles,
  BookOpen,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import { bg, border, text, badge, shadow } from "@/theme/color";

export default function AiStudentMarksheetCard({
  student = {},
  examName = "Term Assessment 2026",
  academicYear = "2026-27",
  totalObtained = 515,
  totalMax = 600,
  percentage = 85.8,
  overallGrade = "A",
  rank = 3,
  totalStudentsInClass = 36,
  resultStatus = "Passed with Distinction",
  subjects = [],
  remarks = "",
  onAskAiPrompt,
}) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className={`my-3 overflow-hidden rounded-2xl border ${border.default} ${bg.card} ${shadow.lg}`}
    >
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 p-4 text-white">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-xs text-white shadow-sm">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                {examName} — Official Marksheet
              </h3>
              <p className="text-xs text-white/80 font-medium">
                {student.name} • Adm: <span className="font-mono">{student.admissionNumber}</span> • Class {student.class || "10"} ({student.section || "A"}) • Roll: {student.rollNumber || "—"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-white/20 backdrop-blur-xs px-2.5 py-0.5 text-xs font-bold text-white">
              Grade {overallGrade} ({percentage}%)
            </span>
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl bg-white text-blue-600 px-3 py-1.5 text-xs font-bold shadow-sm hover:bg-white/90 transition-all"
            >
              <Printer className="h-3.5 w-3.5" />
              Print
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className={`grid grid-cols-2 sm:grid-cols-4 border-b ${border.default} divide-x divide-stone-100 dark:divide-stone-800/80 bg-stone-50/60 dark:bg-stone-900/40 text-center p-3`}>
        <div>
          <span className="text-[10px] uppercase font-bold text-stone-400">Total Marks</span>
          <p className={`text-base font-black ${text.primary}`}>
            {totalObtained} / {totalMax}
          </p>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-blue-500">Percentage</span>
          <p className="text-base font-black text-blue-500">{percentage}%</p>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-amber-500">Class Rank</span>
          <p className="text-base font-black text-amber-500">
            #{rank} <span className="text-xs text-stone-400 font-normal">of {totalStudentsInClass}</span>
          </p>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-emerald-500">Result</span>
          <p className="text-xs font-bold text-emerald-500 mt-1">{resultStatus}</p>
        </div>
      </div>

      {/* Subject Table */}
      {subjects.length > 0 && (
        <div className="p-4 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-stone-200 dark:border-stone-800 text-[11px] font-bold text-stone-400 uppercase">
                <th className="py-2 px-3">Subject</th>
                <th className="py-2 px-3 text-center">Max</th>
                <th className="py-2 px-3 text-center">Pass</th>
                <th className="py-2 px-3 text-center">Obtained</th>
                <th className="py-2 px-3 text-center">Grade</th>
                <th className="py-2 px-3">Teacher Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
              {subjects.map((sub, idx) => (
                <tr key={idx} className="hover:bg-stone-50/50 dark:hover:bg-stone-900/30">
                  <td className={`py-2 px-3 font-semibold ${text.primary}`}>
                    {sub.subject}
                  </td>
                  <td className="py-2 px-3 text-center text-stone-400">{sub.maxMarks}</td>
                  <td className="py-2 px-3 text-center text-stone-400">{sub.passMarks}</td>
                  <td className={`py-2 px-3 text-center font-bold ${text.primary}`}>
                    {sub.obtained}
                  </td>
                  <td className="py-2 px-3 text-center">
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 font-bold text-blue-400 text-[10px]">
                      {sub.grade}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-stone-400 text-[11px]">{sub.remarks || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Remarks */}
      {remarks && (
        <div className={`p-3.5 border-t ${border.default} bg-stone-50/40 dark:bg-stone-900/20 text-xs text-stone-400 italic`}>
          <strong>Teacher Remarks:</strong> "{remarks}"
        </div>
      )}
    </div>
  );
}
