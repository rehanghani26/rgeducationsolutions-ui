import React from "react";
import { motion } from "framer-motion";
import AITextResponse from "./AITextResponse.jsx";
import AiTypewriterResponse from "./AiTypewriterResponse.jsx";
import AIRecordsCard from "./AIRecordsCard.jsx";
import AIStatsGrid from "./AIStatsGrid.jsx";
import AIAttendanceCard from "./AIAttendanceCard.jsx";
import AIFeeSummary from "./AIFeeSummary.jsx";
import AIExamResultsCard from "./AIExamResultsCard.jsx";
import AIConfirmationCard from "./AIConfirmationCard.jsx";
import AiStudentListCard from "./AiStudentListCard.jsx";
import AiStudentIdCard from "./AiStudentIdCard.jsx";
import AiStudentLeaveCard from "./AiStudentLeaveCard.jsx";
import AiStudentProfileCard from "./AiStudentProfileCard.jsx";
import AiTeacherListCard from "./AiTeacherListCard.jsx";
import AiClassSectionListCard from "./AiClassSectionListCard.jsx";
import AiTimetableCard from "./AiTimetableCard.jsx";
import AiSetupWizardCard from "./AiSetupWizardCard.jsx";
import AiTableDataCard from "./AiTableDataCard.jsx";

// ── Specialized Student Module ERP Components (25+ Cases) ──
import AiStudentEnrollCard from "./AiStudentEnrollCard.jsx";
import AiStudentAttendanceCard from "./AiStudentAttendanceCard.jsx";
import AiStudentFeeCard from "./AiStudentFeeCard.jsx";
import AiStudentMarksheetCard from "./AiStudentMarksheetCard.jsx";
import AiStudentCredentialsCard from "./AiStudentCredentialsCard.jsx";
import AiStudentPromotionCard from "./AiStudentPromotionCard.jsx";
import AiStudentActivityCard from "./AiStudentActivityCard.jsx";
import AiStudentDocumentsCard from "./AiStudentDocumentsCard.jsx";
import AiStudentCertificateCard from "./AiStudentCertificateCard.jsx";
import AiStudentMedicalCard from "./AiStudentMedicalCard.jsx";
import AiStudentFamilyCard from "./AiStudentFamilyCard.jsx";
import AiStudentTransportCard from "./AiStudentTransportCard.jsx";
import AiStudentHostelCard from "./AiStudentHostelCard.jsx";
import AiStudentLibraryCard from "./AiStudentLibraryCard.jsx";
import AiStudentDisciplineCard from "./AiStudentDisciplineCard.jsx";
import AiStudentHomeworkCard from "./AiStudentHomeworkCard.jsx";
import AiStudentAnalyticsCard from "./AiStudentAnalyticsCard.jsx";
import AiStudentRollAllocationCard from "./AiStudentRollAllocationCard.jsx";
import AiStudentStatusCard from "./AiStudentStatusCard.jsx";

function shouldRenderSpecializedComponent(toolName, userPrompt = "", data = {}) {
  // 1. Visual ID Card Graphic Preview (cannot be displayed purely as text)
  if (toolName === "getStudentIdCard" || toolName === "updateStudentIdCardData") {
    return true;
  }

  // 2. Critical Action Confirmation Dialog
  if (data?.requiresConfirmation || (data?.success && data?.message && data?.action)) {
    return true;
  }

  // 3. Render heavy card ONLY if user explicitly commanded an interactive UI widget / form
  const p = (userPrompt || "").toLowerCase();
  const explicitlyRequestedUiWidget =
    p.includes("open form") ||
    p.includes("show form") ||
    p.includes("admission form") ||
    p.includes("open component") ||
    p.includes("show card") ||
    p.includes("interactive card") ||
    p.includes("launch wizard") ||
    p.includes("open wizard") ||
    p.includes("show widget") ||
    p.includes("open studio");

  return explicitlyRequestedUiWidget;
}

export default function AIResponseRenderer({
  message,
  userPrompt = "",
  onAskAiPrompt,
  onOpenEditStudent,
  onSelectStudentForIdCard,
  onSelectStudentForLeaves,
  onSelectStudentForReport,
}) {
  const { content, actionsExecuted = [], isError } = message;
  const promptContext = userPrompt || message?.userPrompt || "";

  if (isError) {
    const cleanError = (content || "")
      .replace(/^⚠️\s*\*\*Unable to reach AI Provider\*\*\s*/i, "")
      .replace(/^AI Assistant Notice:\s*/i, "")
      .replace(/Please update the API key in the server \.env file\./i, "Please try again shortly.")
      .trim();

    return (
      <div className="text-[13px] leading-relaxed text-[#D4D4D8]">
        {cleanError || "I am currently unable to complete that request right now. Please try again in a moment."}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* 1. Primary Markdown Text Commentary & Tables (Chat-First with Dynamic Typewriter) */}
      {content && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <AiTypewriterResponse
            text={content}
            messageId={message?.id}
            isNew={Boolean(message?.isNew)}
          />
        </motion.div>
      )}

      {/* 2. Visual Cards (Chat-First: Only in last-case / strictly necessary scenarios) */}
      {actionsExecuted.map((act, idx) => {
        const toolCard = (() => {
          const toolName = act.tool;
          const data = act.data || act.result || {};

          // Enforce Chat-First: Keep enroll student, add student, counts & lists in chat!
          if (!shouldRenderSpecializedComponent(toolName, promptContext, data)) {
            return null;
          }

        // ── 2.1. Student Directory / Filter List
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

        // ── 2.2. Faculty & Teachers Directory
        if (
          (toolName === "getTeachers" ||
            toolName === "getTeacherById" ||
            toolName === "createTeacher" ||
            toolName === "updateTeacher") &&
          (data.teachers || data.teacher)
        ) {
          const teacherList =
            data.teachers || (data.teacher ? [data.teacher] : []);
          return (
            <div key={`resp-teachers-${idx}`} className="pt-2">
              <AiTeacherListCard
                teachers={teacherList}
                total={data.total || data.count || teacherList.length}
                initialFilters={act.args || {}}
                onAskAiPrompt={onAskAiPrompt}
              />
            </div>
          );
        }

        // ── 3.3. Classes, Sections, Subjects, Curriculum & Class Students
        if (
          toolName === "getClasses" ||
          toolName === "getSections" ||
          toolName === "getSubjects" ||
          toolName === "getClassStudents" ||
          toolName === "getClassSyllabus" ||
          toolName === "getAcademicWorkspace" ||
          toolName === "getMyAcademicPlan"
        ) {
          const classList =
            data.classes ||
            (data.rooms
              ? data.rooms.map((r) => ({
                  name: r.className,
                  code: r.sectionName,
                  capacity: r.studentCount || "—",
                }))
              : []);
          const sectionList = data.sections || [];
          const subjectList = data.subjects || [];

          return (
            <div key={`resp-academics-${idx}`} className="pt-2">
              <AiClassSectionListCard
                classes={classList}
                sections={sectionList}
                subjects={subjectList}
                syllabus={
                  data.syllabus ||
                  (toolName === "getClassSyllabus" ? data : null)
                }
                classStudents={toolName === "getClassStudents" ? data : null}
                onAskAiPrompt={onAskAiPrompt}
                onSelectStudentForIdCard={onSelectStudentForIdCard}
                onSelectStudentForReport={onSelectStudentForReport}
              />
            </div>
          );
        }

        // ── 3.4. Class Timetable with Live Conflict Detection
        if (
          (toolName === "getClassTimetable" ||
            toolName === "getTodayTimetable") &&
          (data.timetable || Array.isArray(data.schedule))
        ) {
          return (
            <div key={`resp-timetable-${idx}`} className="pt-2">
              <AiTimetableCard
                timetable={data.timetable || data.schedule || []}
                className={data.class || act.args?.class || ""}
                section={data.section || act.args?.section || ""}
                onAskAiPrompt={onAskAiPrompt}
              />
            </div>
          );
        }

        // ── 3.5. Core Setup & 5 Foundation Anchors (P1 - P5)
        if (
          toolName === "getSetupWizardStatus" ||
          toolName === "getSchoolSetupOverview" ||
          toolName === "getAcademicSetupProgress" ||
          toolName.startsWith("runSetupStep") ||
          toolName === "getSchoolSettings" ||
          toolName === "updateSchoolSettings" ||
          toolName === "getActiveAcademicSession" ||
          toolName === "listAcademicSessions" ||
          data.steps ||
          data.percentComplete !== undefined
        ) {
          return (
            <div key={`resp-setup-${idx}`} className="pt-2">
              <AiSetupWizardCard
                setupStatus={data}
                onAskAiPrompt={onAskAiPrompt}
              />
            </div>
          );
        }

        // ── 3.6. Student ID Card
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

        // ── 3.7. Student Leaves
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

        // ── 3.8. Student Comprehensive Dossier
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

        // ── 3.8.1. Interactive Student Enrollment Form
        if (
          toolName === "getStudentEnrollmentForm" ||
          (toolName === "createStudent" && (data.formType || !data.success))
        ) {
          return (
            <div key={`resp-enroll-${idx}`} className="pt-2">
              <AiStudentEnrollCard
                defaultValues={data.defaultValues || act.args || {}}
                availableClasses={data.availableClasses}
                availableSections={data.availableSections}
                onStudentEnrolled={(newStudent) =>
                  onAskAiPrompt &&
                  onAskAiPrompt(
                    `Student ${newStudent.name} enrolled with ID ${newStudent.admissionNumber}. Show updated student profile.`
                  )
                }
                onAskAiPrompt={onAskAiPrompt}
              />
            </div>
          );
        }

        if (toolName === "createStudent" && data.success && data.student) {
          return (
            <div key={`resp-created-student-${idx}`} className="pt-2">
              <AiStudentProfileCard
                student={data.student}
                attendance={{ percentage: 100, present: 1, absent: 0, late: 0 }}
                leavesSummary={{ total: 0, pending: 0, approved: 0 }}
                fee={{ amountPaid: 0, amountPending: 0, status: "Current" }}
                onSelectStudentForIdCard={onSelectStudentForIdCard}
                onSelectStudentForLeaves={onSelectStudentForLeaves}
                onSelectStudentForEdit={onOpenEditStudent}
                onAskAiPrompt={onAskAiPrompt}
              />
            </div>
          );
        }

        // ── 3.8.2. Student Detailed Monthly Attendance Calendar
        if (toolName === "getStudentAttendanceRecord" && data.student) {
          return (
            <div key={`resp-stu-att-${idx}`} className="pt-2">
              <AiStudentAttendanceCard
                student={data.student}
                month={data.month}
                stats={data.stats}
                streak={data.streak}
                records={data.records}
                onAskAiPrompt={onAskAiPrompt}
              />
            </div>
          );
        }

        // ── 3.8.3. Student Fee Ledger & Dues Breakdown
        if (toolName === "getStudentFeeLedger" && data.student) {
          return (
            <div key={`resp-stu-fee-${idx}`} className="pt-2">
              <AiStudentFeeCard
                student={data.student}
                summary={data.summary}
                feeHeads={data.feeHeads}
                paymentsHistory={data.paymentsHistory}
                onAskAiPrompt={onAskAiPrompt}
              />
            </div>
          );
        }

        // ── 3.8.4. Student Exam Marksheet & Academic Report Card
        if (toolName === "getStudentAcademicReport" && data.student) {
          return (
            <div key={`resp-stu-marksheet-${idx}`} className="pt-2">
              <AiStudentMarksheetCard
                student={data.student}
                examName={data.examName}
                academicYear={data.academicYear}
                totalObtained={data.totalObtained}
                totalMax={data.totalMax}
                percentage={data.percentage}
                overallGrade={data.overallGrade}
                rank={data.rank}
                totalStudentsInClass={data.totalStudentsInClass}
                resultStatus={data.resultStatus}
                subjects={data.subjects}
                remarks={data.remarks}
                onAskAiPrompt={onAskAiPrompt}
              />
            </div>
          );
        }

        // ── 3.8.5. Student Portal Credentials & Password Reset
        if (
          (toolName === "getStudentCredentials" ||
            toolName === "resetStudentPassword") &&
          data.credentials
        ) {
          return (
            <div key={`resp-stu-creds-${idx}`} className="pt-2">
              <AiStudentCredentialsCard
                student={data.student}
                credentials={data.credentials}
                onAskAiPrompt={onAskAiPrompt}
              />
            </div>
          );
        }

        // ── 3.8.6. Academic Progression & Promotion
        if (
          (toolName === "getStudentPromotion" ||
            toolName === "promoteStudentAction") &&
          data.student
        ) {
          return (
            <div key={`resp-stu-promote-${idx}`} className="pt-2">
              <AiStudentPromotionCard
                student={data.student}
                currentClass={data.currentClass || data.previousClass}
                currentSection={data.currentSection}
                targetClass={data.targetClass || data.newClass}
                targetSection={data.targetSection || data.newSection}
                academicYear={data.academicYear}
                isEligible={data.isEligible}
                criteria={data.criteria}
                remarks={data.remarks}
                onAskAiPrompt={onAskAiPrompt}
              />
            </div>
          );
        }

        // ── 3.8.7. Student Activity Log & Audit Trail
        if (toolName === "getStudentActivityLog" && data.timeline) {
          return (
            <div key={`resp-stu-activity-${idx}`} className="pt-2">
              <AiStudentActivityCard
                student={data.student}
                timeline={data.timeline}
                onAskAiPrompt={onAskAiPrompt}
              />
            </div>
          );
        }

        // ── 3.8.8. Digital Document & Certificate Vault
        if (toolName === "getStudentDocuments" && data.documents) {
          return (
            <div key={`resp-stu-docs-${idx}`} className="pt-2">
              <AiStudentDocumentsCard
                student={data.student}
                totalDocuments={data.totalDocuments}
                documents={data.documents}
                onAskAiPrompt={onAskAiPrompt}
              />
            </div>
          );
        }

        // ── 3.8.9. Transfer Certificate (TC) & Bonafide Generator
        if (toolName === "generateStudentCertificate" && data.certificate) {
          return (
            <div key={`resp-stu-cert-${idx}`} className="pt-2">
              <AiStudentCertificateCard
                certificate={data.certificate}
                onAskAiPrompt={onAskAiPrompt}
              />
            </div>
          );
        }

        // ── 3.8.10. Medical Profile & Emergency Contacts
        if (toolName === "getStudentMedicalProfile" && data.medical) {
          return (
            <div key={`resp-stu-med-${idx}`} className="pt-2">
              <AiStudentMedicalCard
                student={data.student}
                medical={data.medical}
                onAskAiPrompt={onAskAiPrompt}
              />
            </div>
          );
        }

        // ── 3.8.11. Family Tree & Sibling Linkages
        if (toolName === "getStudentFamily" && data.family) {
          return (
            <div key={`resp-stu-fam-${idx}`} className="pt-2">
              <AiStudentFamilyCard
                student={data.student}
                family={data.family}
                onAskAiPrompt={onAskAiPrompt}
              />
            </div>
          );
        }

        // ── 3.8.12. School Bus & Transport Allocation
        if (toolName === "getStudentTransport" && data.transport) {
          return (
            <div key={`resp-stu-trans-${idx}`} className="pt-2">
              <AiStudentTransportCard
                student={data.student}
                transport={data.transport}
                onAskAiPrompt={onAskAiPrompt}
              />
            </div>
          );
        }

        // ── 3.8.13. Hostel Dormitory Allocation
        if (toolName === "getStudentHostel" && data.hostel) {
          return (
            <div key={`resp-stu-hostel-${idx}`} className="pt-2">
              <AiStudentHostelCard
                student={data.student}
                hostel={data.hostel}
                onAskAiPrompt={onAskAiPrompt}
              />
            </div>
          );
        }

        // ── 3.8.14. Library Borrowed Books & Fines
        if (toolName === "getStudentLibrary" && data.library) {
          return (
            <div key={`resp-stu-lib-${idx}`} className="pt-2">
              <AiStudentLibraryCard
                student={data.student}
                library={data.library}
                onAskAiPrompt={onAskAiPrompt}
              />
            </div>
          );
        }

        // ── 3.8.15. Disciplinary Merits & Conduct
        if (toolName === "getStudentDisciplinary" && data.disciplinary) {
          return (
            <div key={`resp-stu-disc-${idx}`} className="pt-2">
              <AiStudentDisciplineCard
                student={data.student}
                disciplinary={data.disciplinary}
                onAskAiPrompt={onAskAiPrompt}
              />
            </div>
          );
        }

        // ── 3.8.16. Daily Homework & Assignments
        if (toolName === "getStudentHomework" && data.homeworkList) {
          return (
            <div key={`resp-stu-hw-${idx}`} className="pt-2">
              <AiStudentHomeworkCard
                student={data.student}
                summary={data.summary}
                homeworkList={data.homeworkList}
                onAskAiPrompt={onAskAiPrompt}
              />
            </div>
          );
        }

        // ── 3.8.17. Performance Analytics & Subject Radar
        if (toolName === "getStudentAnalytics" && data.analytics) {
          return (
            <div key={`resp-stu-analytics-${idx}`} className="pt-2">
              <AiStudentAnalyticsCard
                student={data.student}
                analytics={data.analytics}
                onAskAiPrompt={onAskAiPrompt}
              />
            </div>
          );
        }

        // ── 3.8.18. Alphabetical Roll Number Reallocation
        if (toolName === "reallocateRollNumbers" && data.reallocated) {
          return (
            <div key={`resp-stu-realloc-${idx}`} className="pt-2">
              <AiStudentRollAllocationCard
                class={data.class}
                section={data.section}
                totalCount={data.totalCount}
                reallocated={data.reallocated}
                onAskAiPrompt={onAskAiPrompt}
              />
            </div>
          );
        }

        // ── 3.8.19. Student Status Change
        if (toolName === "deactivateStudentStatus" && data.statusChange) {
          return (
            <div key={`resp-stu-status-${idx}`} className="pt-2">
              <AiStudentStatusCard
                student={data.student}
                statusChange={data.statusChange}
                onAskAiPrompt={onAskAiPrompt}
              />
            </div>
          );
        }

        // ── 3.9. Attendance Response
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

        // ── 3.10. Fee Management Response
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

        // ── 3.11. Exam Results & Rankings
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

        // ── 3.12. Executive Dashboard Stats
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

        // ── 3.13. Action confirmation or write execution card
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

        // ── 2.14. Universal Table / Records Fallback Card
        return act.status === "error" ? null : (
          <AIRecordsCard key={idx} tool={toolName} data={data} />
        );
      })();

      if (!toolCard) return null;

      return (
        <motion.div
          key={`animated-visual-card-${act.tool}-${idx}`}
          initial={{ opacity: 0, y: 14, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          {toolCard}
        </motion.div>
      );
    })}
    </div>
  );
}
