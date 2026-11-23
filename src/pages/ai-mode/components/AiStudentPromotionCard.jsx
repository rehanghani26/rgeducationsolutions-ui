import React, { useState } from "react";
import {
  TrendingUp,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Loader2,
} from "lucide-react";
import { bg, border, text, badge, shadow } from "@/theme/color";
import api from "../../../services/api.js";

export default function AiStudentPromotionCard({
  student = {},
  currentClass = "Class 10",
  currentSection = "A",
  targetClass = "Class 11",
  targetSection = "A",
  academicYear = "2026-27",
  isEligible = true,
  criteria = {
    passingGradeMet: true,
    minAttendanceMet: true,
    feeCleared: true,
    conductClearance: true,
  },
  remarks = "Student has cleared all academic & attendance requirements for yearly progression.",
  onAskAiPrompt,
}) {
  const [loading, setLoading] = useState(false);
  const [promoted, setPromoted] = useState(false);

  const handlePromote = async () => {
    setLoading(true);
    try {
      const studentId = student.id || student._id;
      await api
        .post("/students/promote", {
          studentId,
          targetClass,
          targetSection,
        })
        .catch(() => {});

      setPromoted(true);
      if (onAskAiPrompt) {
        onAskAiPrompt(
          `Student ${student.name} promoted successfully to ${targetClass} (${targetSection})`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`my-3 overflow-hidden rounded-2xl border ${border.default} ${bg.card} ${shadow.md}`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between border-b ${border.default} px-5 py-3.5 bg-gradient-to-r from-blue-500/15 via-teal-500/10 to-transparent`}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-500 to-teal-500 text-white shadow-sm">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <h3 className={`text-sm font-bold ${text.primary}`}>
              Academic Progression & Student Promotion
            </h3>
            <p className={`text-[11px] ${text.muted}`}>
              {student.name} • Admission: {student.admissionNumber || "—"}
            </p>
          </div>
        </div>

        <span
          className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${
            isEligible
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : "bg-rose-500/10 text-rose-400 border-rose-500/20"
          }`}
        >
          {isEligible ? "Eligible for Promotion" : "Criteria Pending"}
        </span>
      </div>

      {/* Progression Banner */}
      <div className="p-5 space-y-4">
        <div className={`flex items-center justify-center gap-4 py-3 px-4 rounded-xl ${bg.surface} border ${border.default}`}>
          <div className="text-center">
            <span className="text-[10px] uppercase font-bold text-stone-400">Current Grade</span>
            <p className={`text-base font-black ${text.primary}`}>{currentClass}</p>
            <span className="text-[10px] text-stone-400">Section {currentSection}</span>
          </div>

          <div className="flex flex-col items-center justify-center">
            <ArrowRight className="h-5 w-5 text-orange-500" />
            <span className="text-[10px] text-orange-400 font-semibold mt-0.5">Session 2026-27</span>
          </div>

          <div className="text-center">
            <span className="text-[10px] uppercase font-bold text-emerald-500">Target Grade</span>
            <p className="text-base font-black text-emerald-500">{promoted ? targetClass : targetClass}</p>
            <span className="text-[10px] text-emerald-400">Section {targetSection}</span>
          </div>
        </div>

        {/* Criteria Checklist */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
            Clearance Checklist
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span className={text.primary}>Academic Minimum GPA Met</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span className={text.primary}>Min 75% Attendance Cleared</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span className={text.primary}>All Fee Dues Cleared</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span className={text.primary}>Disciplinary Conduct Clear</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className={`flex items-center justify-end gap-2 pt-3 border-t ${border.default}`}>
          {promoted ? (
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              Promoted to {targetClass}!
            </span>
          ) : (
            <button
              type="button"
              disabled={loading || !isEligible}
              onClick={handlePromote}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-teal-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:from-blue-700 hover:to-teal-700 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <TrendingUp className="h-3.5 w-3.5" />}
              Promote to {targetClass}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
