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
  getStudentEnrollmentForm: {
    loadingText: "Preparing student admission console...",
    successText: "Interactive admission form opened",
    icon: Users,
  },
  getStudentAttendanceRecord: {
    loadingText: "Loading student monthly attendance calendar...",
    successText: "Attendance calendar retrieved",
    icon: Calendar,
  },
  getStudentFeeLedger: {
    loadingText: "Compiling student fee ledger & dues...",
    successText: "Fee statement & receipts retrieved",
    icon: DollarSign,
  },
  getStudentAcademicReport: {
    loadingText: "Generating official exam marksheet...",
    successText: "Academic report card generated",
    icon: Award,
  },
  getStudentCredentials: {
    loadingText: "Retrieving student portal credentials...",
    successText: "Portal credentials loaded securely",
    icon: Sparkles,
  },
  resetStudentPassword: {
    loadingText: "Resetting student password...",
    successText: "New credentials generated",
    icon: Sparkles,
  },
  getStudentPromotion: {
    loadingText: "Checking promotion eligibility...",
    successText: "Promotion status verified",
    icon: Sparkles,
  },
  promoteStudentAction: {
    loadingText: "Executing academic progression...",
    successText: "Student promoted successfully",
    icon: Sparkles,
  },
  getStudentActivityLog: {
    loadingText: "Loading student audit trail...",
    successText: "Activity history retrieved",
    icon: Database,
  },
  getStudentDocuments: {
    loadingText: "Opening digital document vault...",
    successText: "Student documents loaded",
    icon: BookOpen,
  },
  generateStudentCertificate: {
    loadingText: "Generating formal certificate...",
    successText: "Certificate generated successfully",
    icon: Award,
  },
  getStudentMedicalProfile: {
    loadingText: "Retrieving medical and emergency info...",
    successText: "Medical profile loaded",
    icon: Sparkles,
  },
  getStudentFamily: {
    loadingText: "Mapping family and sibling tree...",
    successText: "Family records retrieved",
    icon: Users,
  },
  getStudentTransport: {
    loadingText: "Checking bus route and pickup stop...",
    successText: "Transport allocation retrieved",
    icon: Sliders,
  },
  getStudentHostel: {
    loadingText: "Checking hostel dormitory room...",
    successText: "Hostel allocation retrieved",
    icon: Sliders,
  },
  getStudentLibrary: {
    loadingText: "Checking library issued books...",
    successText: "Library records retrieved",
    icon: BookOpen,
  },
  getStudentDisciplinary: {
    loadingText: "Loading disciplinary record...",
    successText: "Conduct & merit log retrieved",
    icon: Award,
  },
  getStudentHomework: {
    loadingText: "Fetching homework assignments...",
    successText: "Homework list retrieved",
    icon: BookOpen,
  },
  getStudentTimetableSchedule: {
    loadingText: "Loading daily class schedule...",
    successText: "Class timetable retrieved",
    icon: Calendar,
  },
  deactivateStudentStatus: {
    loadingText: "Updating student status...",
    successText: "Student status updated",
    icon: Users,
  },
  reallocateRollNumbers: {
    loadingText: "Sequencing roll numbers alphabetically...",
    successText: "Roll numbers reallocated",
    icon: Users,
  },
  getStudentAnalytics: {
    loadingText: "Computing 360 performance radar...",
    successText: "Performance analytics compiled",
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
  getTeacherById: {
    loadingText: "Loading teacher profile dossier...",
    successText: "Teacher profile loaded",
    icon: Users,
  },
  createTeacher: {
    loadingText: "Registering new teacher profile...",
    successText: "Teacher created successfully",
    icon: Users,
  },
  updateTeacher: {
    loadingText: "Updating teacher record...",
    successText: "Teacher updated successfully",
    icon: Users,
  },
  getClasses: {
    loadingText: "Querying school classes & grades...",
    successText: "Class records retrieved",
    icon: BookOpen,
    getCount: (data) => data?.classes?.length ?? data?.count,
    unit: "classes",
  },
  getSections: {
    loadingText: "Querying class sections...",
    successText: "Section records retrieved",
    icon: BookOpen,
    getCount: (data) => data?.sections?.length ?? data?.count,
    unit: "sections",
  },
  getSubjects: {
    loadingText: "Querying curriculum subjects & courses...",
    successText: "Subject records retrieved",
    icon: BookOpen,
    getCount: (data) => data?.subjects?.length ?? data?.count,
    unit: "subjects",
  },
  getClassStudents: {
    loadingText: "Fetching enrolled students in class...",
    successText: "Class student roster retrieved",
    icon: Users,
    getCount: (data) => data?.students?.length ?? data?.count,
    unit: "students",
  },
  getClassTimetable: {
    loadingText: "Building class timetable schedule...",
    successText: "Class timetable slots retrieved",
    icon: Clock,
    getCount: (data) => data?.timetable?.length,
    unit: "periods",
  },
  getTodayTimetable: {
    loadingText: "Fetching today's class timetable...",
    successText: "Today's timetable schedule loaded",
    icon: Clock,
    getCount: (data) => data?.timetable?.length,
    unit: "periods",
  },
  getSetupWizardStatus: {
    loadingText: "Auditing school ERP setup status...",
    successText: "Setup wizard audit status compiled",
    icon: Sparkles,
  },
  getSchoolSetupOverview: {
    loadingText: "Loading school foundation anchors...",
    successText: "School setup overview retrieved",
    icon: Sparkles,
  },
  runSetupStep1_SchoolProfile: {
    loadingText: "Saving School Profile & Identity...",
    successText: "School Profile configured successfully",
    icon: Database,
  },
  runSetupStep2_AcademicSession: {
    loadingText: "Initializing Academic Session...",
    successText: "Academic session created & activated",
    icon: Calendar,
  },
  runSetupStep3_MasterPeriods: {
    loadingText: "Configuring Master Period & Bell Schedule...",
    successText: "Master bell slots configured",
    icon: Clock,
  },
  runSetupStep4_AcademicRules: {
    loadingText: "Configuring Academic & Grading Rules...",
    successText: "Grading scale & academic rules saved",
    icon: Award,
  },
  runSetupStep5_FinancePolicies: {
    loadingText: "Configuring Finance & Fee Policies...",
    successText: "Fee policies & currency configured",
    icon: DollarSign,
  },
  getAcademicSetupProgress: {
    loadingText: "Checking academic setup progress...",
    successText: "Academic progress compiled",
    icon: Sparkles,
  },
  listAcademicSessions: {
    loadingText: "Listing academic sessions...",
    successText: "Academic sessions retrieved",
    icon: Calendar,
    getCount: (data) => data?.sessions?.length ?? data?.count,
    unit: "sessions",
  },
  getActiveAcademicSession: {
    loadingText: "Checking active academic session...",
    successText: "Active academic session retrieved",
    icon: Calendar,
  },
  getActiveSession: {
    loadingText: "Querying academic session setup...",
    successText: "Academic session status retrieved",
    icon: Calendar,
  },
  activateAcademicSession: {
    loadingText: "Activating academic session...",
    successText: "Academic session activated",
    icon: Calendar,
  },
  getSchoolSettings: {
    loadingText: "Fetching school settings...",
    successText: "School settings loaded",
    icon: Sliders,
  },
  updateSchoolSettings: {
    loadingText: "Updating school settings...",
    successText: "School settings updated",
    icon: Sliders,
  },
  getClassSyllabus: {
    loadingText: "Retrieving class syllabus and textbooks...",
    successText: "Class syllabus loaded",
    icon: BookOpen,
  },
  getAcademicWorkspace: {
    loadingText: "Accessing academic workspace...",
    successText: "Academic workspace loaded",
    icon: BookOpen,
  },
  getMyAcademicPlan: {
    loadingText: "Loading academic plan...",
    successText: "Academic plan retrieved",
    icon: BookOpen,
  },
  getCurrentBudgetAllocation: {
    loadingText: "Fetching session budget allocation...",
    successText: "Session budget allocation retrieved",
    icon: DollarSign,
  },
  getRoleAccess: {
    loadingText: "Checking role permissions...",
    successText: "Role permissions loaded",
    icon: Sliders,
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

