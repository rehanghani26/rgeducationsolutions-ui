import React from "react";
import AIToolExecutionCard from "./AIToolExecutionCard.jsx";
import AITextResponse from "./AITextResponse.jsx";
import AIStatsGrid from "./AIStatsGrid.jsx";
import AIAttendanceCard from "./AIAttendanceCard.jsx";
import AIFeeSummary from "./AIFeeSummary.jsx";
import AIExamResultsCard from "./AIExamResultsCard.jsx";
import AIConfirmationCard from "./AIConfirmationCard.jsx";
import AiStudentListCard from "./AiStudentListCard.jsx";
import AiStudentIdCard from "./AiStudentIdCard.jsx";
import AiStudentLeaveCard from "./AiStudentLeaveCard.jsx";
import AiStudentProfileCard from "./AiStudentProfileCard.jsx";
import { Users, GraduationCap, DollarSign, Calendar, BookOpen, AlertCircle } from "lucide-react";

export default function AIResponseRenderer({
  message,
  onAskAiPrompt,
  onOpenEditStudent,
  onSelectStudentForIdCard,
  onSelectStudentForLeaves,
  onSelectStudentForReport,
}) {
  const { content, actionsExecuted = [], isError } = message;

  if (isError) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5">
        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-rose-400" />
        <div className="space-y-1 min-w-0">
          <p className="text-[12px] font-bold text-rose-300 uppercase tracking-wider">
            System Notice
          </p>
          <div className="text-[13px] leading-relaxed text-rose-200/90 whitespace-pre-wrap">
            {content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* 1. Tool execution badges (humanized, friendly, no raw JSON or function names) */}
      {actionsExecuted.length > 0 && (
        <div className="space-y-2">
          {actionsExecuted.map((act, idx) => (
            <AIToolExecutionCard
              key={`tool-exec-${idx}`}
              toolName={act.tool}
              status={act.status || "success"}
              durationMs={act.durationMs}
              data={act.data || act.result}
              args={act.args}
            />
          ))}
        </div>
      )}

      {/* 2. Primary Markdown Text Commentary */}
      {content && <AITextResponse text={content} />}

      {/* 3. Dynamic ERP Visual Response Cards driven by backend data */}
      {actionsExecuted.map((act, idx) => {
        const toolName = act.tool;
        const data = act.data || act.result || {};

        // Student Directory / Filter List
        if (
          toolName === "getStudents" &&
          data.students &&
          Array.isArray(data.students) &&
          data.students.length > 0
        ) {
          return (
            <div key={`resp-students-${idx}`} className="pt-2">
              <AiStudentListCard
                students={data.students}
                total={data.total || data.count || data.students.length}
                initialFilters={act.args || {}}
                onSelectStudentForIdCard={onSelectStudentForIdCard}
                onSelectStudentForLeaves={onSelectStudentForLeaves}
                onSelectStudentForEdit={onOpenEditStudent}
                onSelectStudentForReport={onSelectStudentForReport}
                onAskAiPrompt={onAskAiPrompt}
              />
            </div>
          );
        }

        // Student ID Card
        if (
          (toolName === "getStudentIdCard" ||
            toolName === "updateStudentIdCardData") &&
          data.cardData
        ) {
          return (
            <div key={`resp-idcard-${idx}`} className="pt-2">
              <AiStudentIdCard
                student={data.student || {}}
                cardData={data.cardData || {}}
                schoolInfo={data.schoolInfo || {}}
                availableTemplates={data.availableTemplates}
                selectedTemplateId={
                  data.selectedTemplateId || "student-id-classic"
                }
                onAskAiPrompt={onAskAiPrompt}
              />
            </div>
          );
        }

        // Student Leaves
        if (
          (toolName === "getStudentLeaves" ||
            toolName === "applyStudentLeave" ||
            toolName === "reviewStudentLeave") &&
          data.leaves &&
          Array.isArray(data.leaves)
        ) {
          return (
            <div key={`resp-leaves-${idx}`} className="pt-2">
              <AiStudentLeaveCard
                leaves={data.leaves}
                summary={data.summary || {}}
                student={data.student}
                onAskAiPrompt={onAskAiPrompt}
              />
            </div>
          );
        }

        // Student Comprehensive Dossier
        if (toolName === "getStudentComprehensiveReport" && data.student) {
          return (
            <div key={`resp-report-${idx}`} className="pt-2">
              <AiStudentProfileCard
                student={data.student}
                attendance={data.attendance}
                leavesSummary={data.leavesSummary}
                fee={data.fee}
                onSelectStudentForIdCard={onSelectStudentForIdCard}
                onSelectStudentForLeaves={onSelectStudentForLeaves}
                onSelectStudentForEdit={onOpenEditStudent}
                onAskAiPrompt={onAskAiPrompt}
              />
            </div>
          );
        }

        // Attendance Response
        if (
          (toolName === "getAttendanceByDate" ||
            toolName === "getAttendanceStats" ||
            toolName === "getStudentAttendance") &&
          (data.summary || data.absentStudents || data.records)
        ) {
          return (
            <div key={`resp-att-${idx}`} className="pt-2">
              <AIAttendanceCard
                date={data.date || act.args?.date}
                summary={data.summary || {}}
                absentStudents={data.absentStudents || []}
                records={data.records || []}
                onAskAiPrompt={onAskAiPrompt}
              />
            </div>
          );
        }

        // Fee Management Response
        if (
          (toolName === "getFeeSummary" ||
            toolName === "getPendingFees" ||
            toolName === "getStudentFee") &&
          (data.summary || data.fees || data.fee)
        ) {
          return (
            <div key={`resp-fees-${idx}`} className="pt-2">
              <AIFeeSummary
                summary={data.summary || {}}
                fees={data.fees || (data.fee ? [data.fee] : [])}
                onAskAiPrompt={onAskAiPrompt}
              />
            </div>
          );
        }

        // Exam Results & Rankings
        if (
          (toolName === "getClassResults" ||
            toolName === "getExamStats" ||
            toolName === "getStudentMarksheet") &&
          (data.results || data.toppers || data.summary)
        ) {
          return (
            <div key={`resp-exams-${idx}`} className="pt-2">
              <AIExamResultsCard
                examName={data.examName || "Examination Results"}
                results={data.results || []}
                toppers={data.toppers || []}
                stats={data.summary || {}}
                onAskAiPrompt={onAskAiPrompt}
              />
            </div>
          );
        }

        // Executive Dashboard Stats
        if (toolName === "getDashboardStats" && data.stats) {
          const s = data.stats;
          const kpis = [
            {
              label: "Total Students",
              value: s.totalStudents ?? 0,
              icon: Users,
              iconColor: "text-[#FF7900]",
              change: "+Active: " + (s.activeStudents ?? 0),
            },
            {
              label: "Teaching Staff",
              value: s.totalTeachers ?? 0,
              icon: GraduationCap,
              iconColor: "text-[#FFA000]",
              change: (s.activeTeachers ?? 0) + " Active",
            },
            {
              label: "Active Classes",
              value: s.totalClasses ?? 0,
              icon: BookOpen,
              iconColor: "text-emerald-400",
            },
            {
              label: "Pending Fees",
              value: s.totalPendingFees ?? "₹0",
              icon: DollarSign,
              iconColor: "text-rose-400",
            },
          ];

          return (
            <div key={`resp-dashboard-${idx}`} className="pt-2">
              <AIStatsGrid title="Executive ERP Summary" items={kpis} />
            </div>
          );
        }

        // Action confirmation or write execution card
        if (
          data.requiresConfirmation ||
          (data.success && data.message && act.args?.action)
        ) {
          return (
            <div key={`resp-confirm-${idx}`} className="pt-2">
              <AIConfirmationCard
                type={data.success ? "success" : "confirm"}
                title={data.title}
                message={data.message}
                details={act.args}
                onConfirm={() =>
                  onAskAiPrompt &&
                  onAskAiPrompt(`Confirm execution: ${act.tool}`)
                }
                onCancel={() =>
                  onAskAiPrompt &&
                  onAskAiPrompt(`Cancel operation: ${act.tool}`)
                }
              />
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

