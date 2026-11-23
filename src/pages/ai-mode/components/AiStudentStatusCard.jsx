import React, { useState } from "react";
import {
  UserCheck,
  UserX,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { bg, border, text, badge, shadow } from "@/theme/color";

export default function AiStudentStatusCard({
  student = {},
  statusChange = {},
  onAskAiPrompt,
}) {
  const isNowActive = (statusChange.newStatus || "").toLowerCase() === "active";

  return (
    <div
      className={`my-3 overflow-hidden rounded-2xl border ${border.default} ${bg.card} ${shadow.md}`}
    >
      <div
        className={`flex items-center justify-between border-b ${border.default} px-5 py-3.5 bg-gradient-to-r ${
          isNowActive ? "from-emerald-500/15" : "from-rose-500/15"
        } via-stone-500/10 to-transparent`}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-xl text-white shadow-sm ${
              isNowActive ? "bg-emerald-500" : "bg-rose-500"
            }`}
          >
            {isNowActive ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
          </div>
          <div>
            <h3 className={`text-sm font-bold ${text.primary}`}>
              Student Status Updated
            </h3>
            <p className={`text-[11px] ${text.muted}`}>
              {student.name} ({student.admissionNumber || "STD-0001"})
            </p>
          </div>
        </div>

        <span
          className={`capitalize px-2.5 py-0.5 rounded-full text-xs font-bold border ${
            isNowActive
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : "bg-rose-500/10 text-rose-400 border-rose-500/20"
          }`}
        >
          Status: {statusChange.newStatus || "Updated"}
        </span>
      </div>

      <div className="p-5 space-y-2 text-xs">
        <p className={text.primary}>
          Student status changed from <strong>{statusChange.previousStatus || "Previous"}</strong> to{" "}
          <strong className="capitalize text-orange-400">{statusChange.newStatus}</strong>.
        </p>
        {statusChange.reason && (
          <p className="text-stone-400">
            <strong>Reason:</strong> {statusChange.reason}
          </p>
        )}
      </div>
    </div>
  );
}
