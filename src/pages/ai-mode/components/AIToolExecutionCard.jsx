import React, { useState } from "react";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Database,
  Users,
  CreditCard,
  DollarSign,
  Calendar,
  Award,
  BookOpen,
  Sliders,
  Sparkles,
} from "lucide-react";

/**
 * Humanized friendly metadata for internal backend tools
 */
const TOOL_FRIENDLY_META = {
  getStudents: {
    loadingText: "Fetching student directory...",
    successText: "Student records retrieved successfully",
    icon: Users,
    getCount: (data) => data?.students?.length ?? data?.total ?? data?.count,
    unit: "students",
  },
  getStudentById: {
    loadingText: "Loading student dossier...",
    successText: "Student record loaded",
    icon: Users,
  },
  getStudentIdCard: {
    loadingText: "Rendering Student ID Card preview...",
    successText: "ID Card generated successfully",
    icon: CreditCard,
  },
  updateStudentIdCardData: {
    loadingText: "Updating Student ID Card record...",
    successText: "ID Card updated successfully",
    icon: CreditCard,
  },
  getStudentLeaves: {
    loadingText: "Querying student leave registry...",
    successText: "Leave records retrieved",
    icon: Calendar,
    getCount: (data) => data?.leaves?.length,
    unit: "records",
  },
  applyStudentLeave: {
    loadingText: "Submitting leave request...",
    successText: "Leave request applied successfully",
    icon: Calendar,
  },
  reviewStudentLeave: {
    loadingText: "Updating leave approval status...",
    successText: "Leave status updated successfully",
    icon: Calendar,
  },
  getStudentComprehensiveReport: {
    loadingText: "Synthesizing comprehensive academic profile...",
    successText: "Comprehensive student report prepared",
    icon: Sparkles,
  },
  getAttendanceByDate: {
    loadingText: "Checking attendance logs...",
    successText: "Attendance records retrieved",
    icon: Calendar,
    getCount: (data) =>
      data?.summary?.totalStudents ?? data?.absentStudents?.length,
    unit: "students checked",
  },
  getAttendanceStats: {
    loadingText: "Calculating attendance analytics...",
    successText: "Attendance analytics compiled",
    icon: Calendar,
  },
  getStudentAttendance: {
    loadingText: "Fetching student attendance history...",
    successText: "Attendance log retrieved",
    icon: Calendar,
  },
  getFeeSummary: {
    loadingText: "Calculating fee collection status...",
    successText: "Fee summary compiled successfully",
    icon: DollarSign,
  },
  getPendingFees: {
    loadingText: "Querying pending fee dues & defaulters...",
    successText: "Pending fee records retrieved",
    icon: DollarSign,
    getCount: (data) => data?.fees?.length ?? data?.count,
    unit: "defaulters",
  },
  getStudentFee: {
    loadingText: "Fetching student fee statement...",
    successText: "Student fee statement retrieved",
    icon: DollarSign,
  },
  collectFee: {
    loadingText: "Recording fee transaction...",
    successText: "Payment recorded successfully",
    icon: DollarSign,
  },
  getClassResults: {
    loadingText: "Analyzing examination results...",
    successText: "Exam results and rankings loaded",
    icon: Award,
    getCount: (data) => data?.results?.length ?? data?.count,
    unit: "scores",
  },
  getStudentMarksheet: {
    loadingText: "Generating student report card...",
    successText: "Marksheet compiled successfully",
    icon: Award,
  },
  getDashboardStats: {
    loadingText: "Aggregating school ERP KPIs...",
    successText: "Executive dashboard analytics compiled",
    icon: Database,
  },
  getTeachers: {
    loadingText: "Fetching teaching faculty roster...",
    successText: "Faculty records retrieved",
    icon: Users,
    getCount: (data) => data?.teachers?.length ?? data?.count,
    unit: "teachers",
  },
  getActiveSession: {
    loadingText: "Querying academic session setup...",
    successText: "Academic session status retrieved",
    icon: Calendar,
  },
};

export default function AIToolExecutionCard({
  toolName = "",
  status = "success", // "loading" | "success" | "error"
  durationMs = null,
  data = null,
  args = null,
}) {
  const [expanded, setExpanded] = useState(false);
  const meta = TOOL_FRIENDLY_META[toolName] || {
    loadingText: `Executing ERP operation...`,
    successText: `Operation executed successfully`,
    icon: Database,
  };

  const Icon = meta.icon || Database;
  const count = meta.getCount ? meta.getCount(data) : null;
  const countLabel =
    count != null ? ` · ${count} ${meta.unit || "records"}` : "";

  const isSuccess = status === "success" || data?.success !== false;
  const isError = status === "error" || data?.success === false;
  const isLoading = status === "loading";

  const titleText = isLoading
    ? meta.loadingText
    : isError
    ? `Failed to execute ERP operation`
    : `${meta.successText}${countLabel}`;

  return (
    <div className="mb-3 rounded-xl border border-[#303030] bg-[#141414] overflow-hidden transition-all shadow-xs">
      <div className="flex items-center justify-between px-3.5 py-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Status icon badge */}
          <div
            className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border ${
              isLoading
                ? "bg-[#FF7900]/10 border-[#FF7900]/30 text-[#FF7900]"
                : isError
                ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
            }`}
          >
            {isLoading ? (
              <Clock className="h-3.5 w-3.5 animate-spin" />
            ) : isError ? (
              <AlertTriangle className="h-3.5 w-3.5" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5" />
            )}
          </div>

          {/* Details */}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-semibold text-[#FFFFFF] truncate">
                {titleText}
              </span>
              {durationMs != null && (
                <span className="text-[10px] text-[#A1A1AA]/70 font-mono">
                  {durationMs}ms
                </span>
              )}
            </div>
            {isError && data?.error && (
              <p className="text-[11px] text-rose-400 mt-0.5 truncate">
                {data.error}
              </p>
            )}
          </div>
        </div>

        {/* Optional expand parameters toggle if user wants to see sanitized details */}
        {args && Object.keys(args).length > 0 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-[11px] text-[#A1A1AA] hover:text-[#FFFFFF] px-2 py-1 rounded-md transition-colors cursor-pointer"
            title="Toggle details"
          >
            <span>{expanded ? "Hide" : "Details"}</span>
            {expanded ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </button>
        )}
      </div>

      {/* Expanded details */}
      {expanded && args && (
        <div className="px-3.5 py-2 border-t border-[#303030] bg-[#111111] text-[11px] text-[#A1A1AA] font-mono">
          <div className="flex flex-wrap gap-2">
            {Object.entries(args).map(([k, v]) => (
              <span
                key={k}
                className="bg-[#1D1D1D] px-2 py-0.5 rounded border border-[#303030]"
              >
                <span className="text-[#FFA000]">{k}:</span>{" "}
                <span className="text-[#FFFFFF]">
                  {typeof v === "object" ? JSON.stringify(v) : String(v)}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

