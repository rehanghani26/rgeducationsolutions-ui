import React from "react";
import {
  Home,
  Bed,
  Clock,
  Phone,
  User,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { bg, border, text, badge, shadow } from "@/theme/color";

export default function AiStudentHostelCard({
  student = {},
  hostel = {},
  onAskAiPrompt,
}) {
  return (
    <div
      className={`my-3 overflow-hidden rounded-2xl border ${border.default} ${bg.card} ${shadow.md}`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between border-b ${border.default} px-5 py-3.5 bg-gradient-to-r from-blue-500/15 via-indigo-500/10 to-transparent`}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500 text-white shadow-sm">
            <Home className="h-4 w-4" />
          </div>
          <div>
            <h3 className={`text-sm font-bold ${text.primary}`}>
              Hostel & Residential Room Allocation
            </h3>
            <p className={`text-[11px] ${text.muted}`}>
              {student.name} • Class {student.class || "10"} ({student.section || "A"})
            </p>
          </div>
        </div>

        <span className="rounded-full bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 text-[11px] font-bold text-blue-400">
          Room {hostel.roomNumber || "A-204"}
        </span>
      </div>

      <div className="p-5 space-y-4">
        {/* Block & Room Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className={`p-3 rounded-xl border ${border.default} ${bg.surface}`}>
            <span className="text-[10px] uppercase font-bold text-stone-400">Hostel Block</span>
            <p className={`text-xs font-bold ${text.primary} mt-0.5`}>
              {hostel.blockName || "Scholars Hall (Block A)"}
            </p>
          </div>
          <div className={`p-3 rounded-xl border ${border.default} ${bg.surface}`}>
            <span className="text-[10px] uppercase font-bold text-stone-400">Bed Allocation</span>
            <p className={`text-xs font-bold text-blue-400 mt-0.5`}>
              {hostel.bedNumber || "Bed 02"} ({hostel.roomType || "Twin Sharing AC"})
            </p>
          </div>
          <div className={`p-3 rounded-xl border ${border.default} ${bg.surface}`}>
            <span className="text-[10px] uppercase font-bold text-stone-400">Evening Curfew</span>
            <p className="text-xs font-bold text-amber-400 mt-0.5">
              {hostel.curfewTime || "08:30 PM"}
            </p>
          </div>
        </div>

        {/* Warden Contact */}
        <div className={`flex items-center justify-between p-3.5 rounded-xl border ${border.default} ${bg.surface}`}>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
              <User className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400">Resident Warden</span>
              <p className={`text-xs font-bold ${text.primary}`}>{hostel.wardenName || "Prof. Ramesh Narayan"}</p>
              <p className="text-[11px] font-mono text-stone-400">{hostel.wardenContact || "9876540099"}</p>
            </div>
          </div>
          <a
            href={`tel:${hostel.wardenContact || "9876540099"}`}
            className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
          >
            <Phone className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
