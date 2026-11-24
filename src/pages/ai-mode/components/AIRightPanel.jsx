import React, { useState, useMemo } from "react";
import {
  Sparkles,
  X,
  Activity,
  Wrench,
  Cpu,
  ChevronRight,
  Calendar,
  Users,
  Banknote,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Search,
  FileText,
  Layers,
  BookOpen,
  BookUser,
  ClipboardList,
  Award,
  ShieldCheck,
  Copy,
  ExternalLink,
  RefreshCw,
  Sliders,
  Settings,
  Zap,
  TrendingUp,
  Clock,
  Terminal,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TABS = [
  { id: "insights", label: "AI Insights", icon: Sparkles },
  { id: "tools", label: "Tool Vault", icon: Wrench },
  { id: "diagnostics", label: "Diagnostics", icon: Cpu },
];

const PROACTIVE_RECOMMENDATIONS = [
  {
    title: "Morning Operations Briefing",
    desc: "Attendance rates, teacher schedules & daily alerts",
    prompt: "Give me a complete morning briefing: today's attendance rate, scheduled timetable, and pending alerts.",
    icon: Zap,
    color: "from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30",
  },
  {
    title: "Scan Timetable Clashes",
    desc: "Verify classroom room maps and teacher allocations",
    prompt: "Scan class timetable for teacher double-booking, empty slots, and room conflicts.",
    icon: Calendar,
    color: "from-sky-500/20 to-blue-500/20 text-sky-400 border-sky-500/30",
  },
  {
    title: "Audit Fee Defaulters",
    desc: "Students with overdue dues and pending invoices",
    prompt: "Show fee collection summary, pending fee balances, and defaulters list for this term.",
    icon: Banknote,
    color: "from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30",
  },
  {
    title: "School Setup Completion",
    desc: "Check academic year, bell schedule & grading policies",
    prompt: "Show school setup wizard progress and report any incomplete steps.",
    icon: Settings,
    color: "from-orange-500/20 to-red-500/20 text-orange-400 border-orange-500/30",
  },
];

const REGISTERED_TOOLS = [
  // Academics
  { name: "getClassTimetable", module: "Academics", desc: "Retrieve weekly timetable, periods and room allocations", icon: Calendar, prompt: "Show class timetable for Class 10 section A." },
  { name: "getClasses", module: "Academics", desc: "List all active classes, sections and student counts", icon: Layers, prompt: "Show all classes and sections." },
  { name: "getClassSyllabus", module: "Academics", desc: "Prescribed books, chapters and marks breakdown", icon: BookOpen, prompt: "Show syllabus and prescribed books for Class 10." },
  { name: "getAcademicWorkspace", module: "Academics", desc: "Assigned classrooms, curriculum & room courses", icon: Layers, prompt: "Show the academic workspace and my assigned classrooms." },

  // Faculty & Staff
  { name: "getTeachers", module: "Faculty", desc: "Faculty directory, subject assignments & contact info", icon: BookUser, prompt: "Show all teachers and their subject assignments." },
  { name: "getPayrollSummary", module: "Faculty", desc: "Staff salary vouchers, monthly payroll & disbursements", icon: Banknote, prompt: "Show staff payroll summary and pending disbursements." },

  // Finance
  { name: "getFeeSummary", module: "Finance", desc: "Total collected, pending dues & collection rate", icon: Banknote, prompt: "Show fee collection summary and pending dues." },
  { name: "getCurrentBudgetAllocation", module: "Finance", desc: "Session budget spending across salaries & procurement", icon: TrendingUp, prompt: "Show the current academic session budget allocation and spending." },
  { name: "getStudentFeeLedger", module: "Finance", desc: "Individual student fee breakdown, dues & receipts", icon: FileText, prompt: "Show student fee ledger for admission ADM-2024-001." },

  // Attendance
  { name: "getAttendanceByDate", module: "Attendance", desc: "Daily present/absent student records & percentages", icon: ClipboardList, prompt: "What is the school attendance rate today? Show absent students." },
  { name: "getStudentLeaves", module: "Attendance", desc: "Review student leave requests & approve applications", icon: Clock, prompt: "Show all pending student leave applications." },

  // Exams
  { name: "getExamSchedule", module: "Exams", desc: "Upcoming examination calendar, dates & paper timings", icon: Award, prompt: "Show upcoming examination schedules and subject dates." },
  { name: "getExamAnalytics", module: "Exams", desc: "Grade distributions, rank toppers & marks statistics", icon: Award, prompt: "Show exam performance analytics and top rankers." },

  // Students
  { name: "getStudents", module: "Students", desc: "Filter students by class, section, status & blood group", icon: Users, prompt: "Show all students in Class 10." },
  { name: "getStudentIdCard", module: "Students", desc: "Preview and print branded student ID cards", icon: Users, prompt: "Generate student ID card and studio preview." },
  { name: "getStudentComprehensiveReport", module: "Students", desc: "360-degree student profile, attendance, grades & fees", icon: Sparkles, prompt: "Show complete 360-degree comprehensive report for student." },

  // Setup
  { name: "getSetupWizardStatus", module: "Admin", desc: "Check completion of 5-step school configuration wizard", icon: Settings, prompt: "What is our school setup wizard progress?" },
  { name: "getRoleAccess", module: "Admin", desc: "Inspect permission policies, module rights & view scopes", icon: ShieldCheck, prompt: "Which modules and actions can my role access?" },
];

export default function AIRightPanel({
  isOpen,
  onClose,
  onAskAiPrompt,
  providerName = "NVIDIA AI",
  userRole = "Administrator",
  userName = "User",
  messageCount = 0,
}) {
  const [activeTab, setActiveTab] = useState("insights");
  const [toolSearch, setToolSearch] = useState("");
  const [selectedToolModule, setSelectedToolModule] = useState("All");

  const modules = ["All", "Academics", "Faculty", "Finance", "Attendance", "Exams", "Students", "Admin"];

  const filteredTools = useMemo(() => {
    return REGISTERED_TOOLS.filter((t) => {
      const matchesSearch =
        t.name.toLowerCase().includes(toolSearch.toLowerCase()) ||
        t.desc.toLowerCase().includes(toolSearch.toLowerCase()) ||
        t.module.toLowerCase().includes(toolSearch.toLowerCase());
      const matchesModule = selectedToolModule === "All" || t.module === selectedToolModule;
      return matchesSearch && matchesModule;
    });
  }, [toolSearch, selectedToolModule]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Mobile Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs xl:hidden"
            onClick={onClose}
          />

          {/* Side Panel Drawer */}
          <motion.aside
            initial={{ x: "100%", opacity: 0.8 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0.8 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="fixed inset-y-0 right-0 z-50 flex w-[340px] sm:w-[380px] flex-col border-l border-white/[0.08] bg-[#161619] text-white shadow-2xl xl:static xl:z-auto xl:flex-shrink-0"
          >
            {/* Header */}
            <div className="flex h-14 flex-shrink-0 items-center justify-between border-b border-white/[0.08] px-4 bg-[#141416]/95">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#FF7900] to-[#FFA000] text-white shadow-sm shadow-[#FF7900]/30">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-[13px] font-bold text-white tracking-tight leading-tight">
                    AI Copilot Hub
                  </h3>
                  <p className="text-[10px] text-[#A1A1AA] leading-tight">
                    Telemetry, Tools & Insights
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[9.5px] font-bold text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active
                </span>
                <button
                  onClick={onClose}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-[#A1A1AA] hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer"
                  title="Close panel"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Tab Navigation Pill Bar */}
            <div className="flex items-center border-b border-white/[0.08] px-3 pt-2 pb-1.5 bg-[#141416]/60 gap-1">
              {TABS.map((tab) => {
                const isSelected = activeTab === tab.id;
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex flex-1 items-center justify-center gap-1.5 rounded-xl py-1.5 text-[11px] font-bold transition-all cursor-pointer select-none ${
                      isSelected
                        ? "text-white"
                        : "text-[#A1A1AA] hover:text-white hover:bg-white/[0.03]"
                    }`}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="activeRightTab"
                        transition={{ type: "spring", stiffness: 450, damping: 32 }}
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#FF7900] to-[#FFA000] shadow-[0_2px_10px_rgba(255,121,0,0.3)] -z-10"
                      />
                    )}
                    <TabIcon className="h-3.5 w-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
              {/* TAB 1: AI INSIGHTS */}
              {activeTab === "insights" && (
                <div className="space-y-4">
                  {/* AI Provider & Engine Status Card */}
                  <div className="rounded-2xl border border-white/[0.08] bg-[#1A1A1E] p-3.5 shadow-md space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#A1A1AA]">
                        Active Intelligence Engine
                      </span>
                      <span className="flex items-center gap-1 text-[10.5px] font-mono text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" />
                        Online
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 rounded-xl bg-[#222226] p-2.5 border border-white/[0.06]">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF7900]/15 text-[#FFA000] border border-[#FF7900]/30 font-bold text-xs">
                        AI
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[12.5px] font-bold text-white truncate">
                          {providerName}
                        </div>
                        <div className="text-[10px] text-[#A1A1AA] truncate">
                          Llama 3.3 70B &middot; Function Calling
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                      <div className="rounded-lg bg-[#141416] p-2 border border-white/[0.04]">
                        <span className="text-[#71717A] block">Failover Engine</span>
                        <span className="text-[#D4D4D8] font-semibold truncate block">Gemini 2.0 Flash</span>
                      </div>
                      <div className="rounded-lg bg-[#141416] p-2 border border-white/[0.04]">
                        <span className="text-[#71717A] block">Tool Execution</span>
                        <span className="text-emerald-400 font-semibold block">Full Native + Text</span>
                      </div>
                    </div>
                  </div>

                  {/* School Operations Telemetry Snapshot */}
                  <div className="rounded-2xl border border-white/[0.08] bg-[#1A1A1E] p-3.5 shadow-md space-y-2.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#A1A1AA] flex items-center justify-between">
                      <span>ERP Telemetry Anchor</span>
                      <span className="text-[10px] text-[#FF7900] font-mono lowercase">live</span>
                    </span>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-xl bg-[#222226] p-2.5 border border-white/[0.06] flex items-center gap-2">
                        <Users className="h-4 w-4 text-sky-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <span className="text-[10px] text-[#71717A] block truncate">Directory</span>
                          <span className="text-[12px] font-bold text-white">Full Active</span>
                        </div>
                      </div>

                      <div className="rounded-xl bg-[#222226] p-2.5 border border-white/[0.06] flex items-center gap-2">
                        <ClipboardList className="h-4 w-4 text-amber-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <span className="text-[10px] text-[#71717A] block truncate">Attendance</span>
                          <span className="text-[12px] font-bold text-white">Monitored</span>
                        </div>
                      </div>

                      <div className="rounded-xl bg-[#222226] p-2.5 border border-white/[0.06] flex items-center gap-2">
                        <Banknote className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <span className="text-[10px] text-[#71717A] block truncate">Finance</span>
                          <span className="text-[12px] font-bold text-white">Collections</span>
                        </div>
                      </div>

                      <div className="rounded-xl bg-[#222226] p-2.5 border border-white/[0.06] flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <span className="text-[10px] text-[#71717A] block truncate">Session</span>
                          <span className="text-[12px] font-bold text-white">2026-2027</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Proactive Copilot Recommendations */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-0.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#A1A1AA] flex items-center gap-1.5">
                        <Zap className="h-3.5 w-3.5 text-[#FFA000]" />
                        Suggested ERP Actions
                      </span>
                      <span className="text-[10px] text-[#71717A]">One-click run</span>
                    </div>

                    <div className="space-y-2">
                      {PROACTIVE_RECOMMENDATIONS.map((rec, idx) => {
                        const RecIcon = rec.icon;
                        return (
                          <motion.button
                            key={idx}
                            whileHover={{ scale: 1.015, x: 2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onAskAiPrompt(rec.prompt)}
                            className="w-full flex items-start gap-2.5 rounded-xl border border-white/[0.08] bg-[#1A1A1E] p-3 text-left hover:border-[#FF7900]/50 hover:bg-[#222226] transition-all cursor-pointer group shadow-sm"
                          >
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#222226] border border-white/[0.08] text-[#FFA000] group-hover:border-[#FF7900]/40 group-hover:bg-[#FF7900]/15 flex-shrink-0">
                              <RecIcon className="h-3.5 w-3.5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between">
                                <span className="text-[12px] font-bold text-white group-hover:text-[#FFA000] transition-colors leading-snug">
                                  {rec.title}
                                </span>
                                <ArrowRight className="h-3 w-3 text-[#71717A] group-hover:text-[#FFA000] transform transition-transform group-hover:translate-x-0.5" />
                              </div>
                              <p className="mt-0.5 text-[11px] text-[#A1A1AA] leading-relaxed line-clamp-1">
                                {rec.desc}
                              </p>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: TOOL VAULT */}
              {activeTab === "tools" && (
                <div className="space-y-3">
                  {/* Search box */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#71717A] pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search 30+ ERP tools..."
                      value={toolSearch}
                      onChange={(e) => setToolSearch(e.target.value)}
                      className="w-full rounded-xl border border-white/[0.08] bg-[#1A1A1E] py-2 pl-8 pr-3 text-[12px] text-white placeholder-[#71717A] outline-none focus:border-[#FF7900] focus:ring-1 focus:ring-[#FF7900]"
                    />
                  </div>

                  {/* Module pills */}
                  <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1">
                    {modules.map((m) => (
                      <button
                        key={m}
                        onClick={() => setSelectedToolModule(m)}
                        className={`rounded-full px-2.5 py-1 text-[10.5px] font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                          selectedToolModule === m
                            ? "bg-[#FF7900] text-white shadow-xs"
                            : "bg-[#222226] text-[#A1A1AA] hover:text-white border border-white/[0.04]"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>

                  {/* Tool Cards */}
                  <div className="space-y-2">
                    {filteredTools.map((t, idx) => {
                      const ToolIcon = t.icon;
                      return (
                        <div
                          key={idx}
                          className="rounded-xl border border-white/[0.08] bg-[#1A1A1E] p-3 space-y-2 hover:border-[#FF7900]/40 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#222226] text-[#FFA000] border border-white/[0.06] flex-shrink-0">
                                <ToolIcon className="h-3 w-3" />
                              </div>
                              <code className="text-[11.5px] font-mono font-bold text-white truncate">
                                {t.name}
                              </code>
                            </div>
                            <span className="rounded-full bg-white/[0.06] border border-white/[0.08] px-2 py-0.5 text-[9.5px] font-bold text-[#A1A1AA]">
                              {t.module}
                            </span>
                          </div>

                          <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
                            {t.desc}
                          </p>

                          <div className="flex justify-end pt-1 border-t border-white/[0.04]">
                            <motion.button
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => onAskAiPrompt(t.prompt)}
                              className="flex items-center gap-1 rounded-lg bg-[#FF7900]/15 border border-[#FF7900]/30 px-2.5 py-1 text-[10.5px] font-bold text-[#FFA000] hover:bg-[#FF7900]/25 transition-colors cursor-pointer"
                            >
                              <span>Run Tool</span>
                              <ChevronRight className="h-3 w-3" />
                            </motion.button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: DIAGNOSTICS & CONTEXT */}
              {activeTab === "diagnostics" && (
                <div className="space-y-4">
                  {/* Session Context */}
                  <div className="rounded-2xl border border-white/[0.08] bg-[#1A1A1E] p-3.5 space-y-2.5 shadow-md">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#A1A1AA]">
                      Conversation Telemetry
                    </span>

                    <div className="space-y-2 text-[11px]">
                      <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
                        <span className="text-[#71717A]">User Identity</span>
                        <span className="font-semibold text-white">{userName}</span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
                        <span className="text-[#71717A]">Assigned Role</span>
                        <span className="font-semibold text-[#FFA000]">{userRole}</span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
                        <span className="text-[#71717A]">Session Messages</span>
                        <span className="font-mono text-white">{messageCount}</span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
                        <span className="text-[#71717A]">Security Policy</span>
                        <span className="text-emerald-400 font-medium">RBAC Guard Active</span>
                      </div>
                    </div>
                  </div>

                  {/* System Architecture */}
                  <div className="rounded-2xl border border-white/[0.08] bg-[#1A1A1E] p-3.5 space-y-2 shadow-md">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#A1A1AA] flex items-center gap-1.5">
                      <Terminal className="h-3.5 w-3.5 text-[#FFA000]" />
                      Model Orchestration
                    </span>
                    <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
                      RGES AI operates in an agentic loop with maximum 6 iterative tool cycles. Tool executions automatically validate schema definitions against the central registry before running on the secure MongoDB layer.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-white/[0.08] px-4 py-3 bg-[#141416]/95 text-center">
              <span className="text-[10px] text-[#71717A]">
                RG EduCore &middot; Enterprise AI Intelligence v2.0
              </span>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
