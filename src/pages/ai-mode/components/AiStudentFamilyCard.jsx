import React from "react";
import {
  Users,
  UserCheck,
  GraduationCap,
  Sparkles,
  Phone,
  Mail,
} from "lucide-react";
import { bg, border, text, badge, shadow } from "@/theme/color";

export default function AiStudentFamilyCard({
  student = {},
  family = {},
  onAskAiPrompt,
}) {
  const { primaryGuardian = {}, siblings = [] } = family;

  return (
    <div
      className={`my-3 overflow-hidden rounded-2xl border ${border.default} ${bg.card} ${shadow.md}`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between border-b ${border.default} px-5 py-3.5 bg-gradient-to-r from-indigo-500/15 via-blue-500/10 to-transparent`}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-blue-500 text-white shadow-sm">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <h3 className={`text-sm font-bold ${text.primary}`}>
              Family Details & Sibling Linkages
            </h3>
            <p className={`text-[11px] ${text.muted}`}>
              {student.name} • Admission: {student.admissionNumber || "—"}
            </p>
          </div>
        </div>

        <span className="rounded-full bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 text-[11px] font-bold text-indigo-400">
          {siblings.length} Enrolled Sibling{siblings.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="p-5 space-y-4">
        {/* Guardian Block */}
        <div className={`p-3.5 rounded-xl border ${border.default} ${bg.surface}`}>
          <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
            Primary Guardian
          </span>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className={`text-xs font-bold ${text.primary}`}>
                {primaryGuardian.name || student.parentName || "Parent / Guardian"} ({primaryGuardian.relation || "Parent"})
              </p>
              <p className={`text-[11px] ${text.muted}`}>{primaryGuardian.address || student.address}</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-mono text-stone-400">{primaryGuardian.phone || student.parentContact}</span>
            </div>
          </div>
        </div>

        {/* Siblings Block */}
        {siblings.length > 0 && (
          <div>
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-2">
              Siblings Enrolled in This Institution
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {siblings.map((sib, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-3 rounded-xl border ${border.default} ${bg.surface}`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                      <GraduationCap className="h-4 w-4" />
                    </div>
                    <div>
                      <span className={`text-xs font-bold ${text.primary} block`}>
                        {sib.name}
                      </span>
                      <span className="text-[10px] text-stone-400">
                        {sib.relation} • {sib.class} ({sib.section}) • Roll: {sib.rollNumber}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onAskAiPrompt?.(
                        `Show comprehensive profile of student ${sib.name}`
                      )
                    }
                    className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition-all"
                  >
                    View Dossier →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
