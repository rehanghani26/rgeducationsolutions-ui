import React from "react";
import {
  Calendar,
  BookOpen,
  Award,
  FileSpreadsheet,
  Sliders,
  Users,
  ClipboardList,
  DollarSign,
  Wallet,
} from "lucide-react";
import { QUICK_CHIPS } from "../ai.constants.js";

const CHIP_ICON_MAP = {
  "Academic Session": Calendar,
  Exams: BookOpen,
  "Results & Toppers": Award,
  "Class Syllabus": FileSpreadsheet,
  Settings: Sliders,
  Students: Users,
  Attendance: ClipboardList,
  Fees: DollarSign,
  Payroll: Wallet,
};

export default function AIQuickActions({ onSelectAction }) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
      {QUICK_CHIPS.map((chip, idx) => {
        const Icon = CHIP_ICON_MAP[chip.label] || Calendar;
        return (
          <button
            key={idx}
            onClick={() => onSelectAction(chip.prompt)}
            className="flex-shrink-0 flex items-center gap-1.5 rounded-full border border-[#303030] bg-[#191919] px-3 py-1.5 text-[11px] font-medium text-[#A1A1AA] hover:text-[#FFFFFF] hover:border-[#FF7900]/50 hover:bg-[#202020] active:scale-95 transition-all whitespace-nowrap cursor-pointer shadow-xs"
          >
            <Icon className="h-3 w-3 text-[#FFA000]" />
            <span>{chip.label}</span>
          </button>
        );
      })}
    </div>
  );
}

