import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  MessageSquare,
  Trash2,
  Edit2,
  Check,
  X,
  Sparkles,
  Wrench,
  Cpu,
  ChevronRight,
  Calendar,
  Users,
  Banknote,
  CheckCircle2,
  Zap,
  TrendingUp,
  Clock,
  Layers,
  BookOpen,
  BookUser,
  ClipboardList,
  Award,
  ShieldCheck,
  FileText,
  Settings,
  Terminal,
} from "lucide-react";
import AIProviderStatus from "./AIProviderStatus.jsx";
import rgLogo from "../../../assets/logo/RGLOGO.png";

function getDateGroup(dateVal) {
  if (!dateVal) return "Previous";

  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return "Previous";

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const sessionDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  if (sessionDay.getTime() === today.getTime()) return "Today";
  if (sessionDay.getTime() === yesterday.getTime()) return "Yesterday";
  return "Previous";
}

function groupSessions(sessions) {
  const groups = { Today: [], Yesterday: [], Previous: [] };

  for (const sess of sessions) {
    const group = getDateGroup(sess.createdAt);
    if (!groups[group]) groups[group] = [];
    groups[group].push(sess);
  }

  return [
    { label: "Today", items: groups.Today },
    { label: "Yesterday", items: groups.Yesterday },
    { label: "Previous", items: groups.Previous },
  ].filter((g) => g.items && g.items.length > 0);
}

const SIDEBAR_TABS = [
  { id: "insights", label: "Insights", icon: Sparkles },
  { id: "tools", label: "Tools", icon: Wrench },
  { id: "diagnostics", label: "Diagnostics", icon: Cpu },
];

const PROACTIVE_RECOMMENDATIONS = [
  {
    title: "Morning Operations Briefing",
    desc: "Attendance rates, teacher schedules & alerts",
    prompt: "Give me a complete morning briefing: today's attendance rate, scheduled timetable, and pending alerts.",
    icon: Zap,
  },
  {
    title: "Scan Timetable Clashes",
    desc: "Verify rooms and teacher allocations",
    prompt: "Scan class timetable for teacher double-booking, empty slots, and room conflicts.",
    icon: Calendar,
  },
  {
    title: "Audit Fee Defaulters",
    desc: "Overdue student dues and pending fees",
    prompt: "Show fee collection summary, pending fee balances, and defaulters list for this term.",
    icon: Banknote,
  },
  {
    title: "School Setup Completion",
    desc: "Verify academic session & grading policies",
    prompt: "Show school setup wizard progress and report any incomplete steps.",
    icon: Settings,
  },
];

const REGISTERED_TOOLS = [
  { name: "getClassTimetable", module: "Academics", desc: "Retrieve weekly timetable and periods", icon: Calendar, prompt: "Show class timetable for Class 10 section A." },
  { name: "getClasses", module: "Academics", desc: "List all active classes and sections", icon: Layers, prompt: "Show all classes and sections." },
  { name: "getClassSyllabus", module: "Academics", desc: "Books, chapters and marks breakdown", icon: BookOpen, prompt: "Show syllabus and prescribed books for Class 10." },
  { name: "getTeachers", module: "Faculty", desc: "Faculty directory and subject assignments", icon: BookUser, prompt: "Show all teachers and their subject assignments." },
  { name: "getPayrollSummary", module: "Faculty", desc: "Staff monthly payroll & disbursements", icon: Banknote, prompt: "Show staff payroll summary and pending disbursements." },
  { name: "getFeeSummary", module: "Finance", desc: "Total collected & pending fee dues", icon: Banknote, prompt: "Show fee collection summary and pending dues." },
  { name: "getCurrentBudgetAllocation", module: "Finance", desc: "Session budget spending allocations", icon: TrendingUp, prompt: "Show the current academic session budget allocation and spending." },
  { name: "getStudentFeeLedger", module: "Finance", desc: "Student breakdown, dues & receipts", icon: FileText, prompt: "Show student fee ledger for admission ADM-2024-001." },
  { name: "getAttendanceByDate", module: "Attendance", desc: "Daily present/absent student records", icon: ClipboardList, prompt: "What is the school attendance rate today? Show absent students." },
  { name: "getStudentLeaves", module: "Attendance", desc: "Review student leave applications", icon: Clock, prompt: "Show all pending student leave applications." },
  { name: "getExamSchedule", module: "Exams", desc: "Exam calendar, dates & paper timings", icon: Award, prompt: "Show upcoming examination schedules and subject dates." },
  { name: "getExamAnalytics", module: "Exams", desc: "Marks statistics and top rankers", icon: Award, prompt: "Show exam performance analytics and top rankers." },
  { name: "getStudents", module: "Students", desc: "Filter students by class & section", icon: Users, prompt: "Show all students in Class 10." },
  { name: "getStudentIdCard", module: "Students", desc: "Preview and print student ID cards", icon: Users, prompt: "Generate student ID card and studio preview." },
  { name: "getSetupWizardStatus", module: "Admin", desc: "Check 5-step configuration wizard", icon: Settings, prompt: "What is our school setup wizard progress?" },
  { name: "getRoleAccess", module: "Admin", desc: "Inspect permission policies & scopes", icon: ShieldCheck, prompt: "Which modules and actions can my role access?" },
];

export default function AISidebar({
  isOpen,
  onClose,
  sessions = [],
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onRenameSession,
  searchQuery = "",
  onSearchChange,
  providerName = "NVIDIA AI",
  onAskAiPrompt,
  userRole = "Administrator",
  userName = "User",
  messageCount = 0,
}) {
  const grouped = useMemo(() => groupSessions(sessions), [sessions]);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  // AI Hub section state
  const [activeBottomTab, setActiveBottomTab] = useState("insights");
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

  const handleStartRename = (e, sess) => {
    e.stopPropagation();
    setEditingId(sess.id);
    setEditTitle(sess.title);
  };

  const handleSaveRename = (e, id) => {
    e.stopPropagation();
    if (editTitle.trim() && onRenameSession) {
      onRenameSession(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleCancelRename = (e) => {
    e.stopPropagation();
    setEditingId(null);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col
          border-r border-[#2C2C30] bg-[#141416] text-[#FFFFFF]
          transition-all duration-300 ease-in-out
          ${isOpen ? "w-[295px] sm:w-[310px] translate-x-0" : "w-[295px] sm:w-[310px] -translate-x-full"}
          lg:static lg:z-auto lg:flex-shrink-0
          ${isOpen ? "lg:w-[295px] lg:translate-x-0" : "lg:w-0 lg:overflow-hidden"}
        `}
      >
        {/* ======================================================== */}
        {/* PART 1: TOP SECTION (CONVERSATIONS & HISTORY)           */}
        {/* ======================================================== */}
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Header / Brand */}
          <div className="flex h-14 items-center justify-between border-b border-[#2C2C30] px-4 bg-[#111113] flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div
                className="relative flex flex-shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-[#1D1D20] p-1 shadow-sm overflow-hidden"
                style={{
                  width: "34px",
                  height: "34px",
                  minWidth: "34px",
                  minHeight: "34px",
                }}
              >
                <img
                  src={rgLogo}
                  alt="RGES Logo"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    mixBlendMode: "screen",
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    const fallback = e.currentTarget.nextSibling;
                    if (fallback) fallback.style.display = "flex";
                  }}
                />
                <div
                  style={{ display: "none" }}
                  className="h-full w-full items-center justify-center text-[#FFA000]"
                >
                  <Sparkles className="h-4 w-4" />
                </div>
              </div>
              <div>
                <div className="text-[12.5px] font-bold text-[#FFFFFF] tracking-tight leading-tight">
                  RGES ERP AI
                </div>
                <div className="text-[9.5px] text-[#A1A1AA] leading-tight">
                  School Assistant
                </div>
              </div>
            </div>

            {/* Close (mobile only) */}
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[#A1A1AA] hover:bg-white/[0.06] hover:text-[#FFFFFF] lg:hidden cursor-pointer"
              title="Close sidebar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* New Conversation Button */}
          <div className="p-3 pb-2 flex-shrink-0">
            <motion.button
              whileHover={{ scale: 1.02, brightness: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={onNewChat}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7900] to-[#FFA000] px-3.5 py-2 text-[12.5px] font-bold text-white shadow-md shadow-[#FF7900]/25 transition-all duration-200 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>New Conversation</span>
            </motion.button>
          </div>

          {/* Search input */}
          <div className="px-3 pb-2 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#71717A] pointer-events-none" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full rounded-xl border border-white/[0.08] bg-[#1A1A1E] py-1.5 pl-8 pr-3 text-[11.5px] text-[#FFFFFF] placeholder-[#71717A] outline-none transition-all focus:border-[#FF7900] focus:ring-1 focus:ring-[#FF7900]"
              />
            </div>
          </div>

          {/* Conversation History Grouped List */}
          <div className="flex-1 min-h-[120px] overflow-y-auto px-2 py-1 scrollbar-thin">
            {sessions.length === 0 ? (
              <div className="py-6 text-center text-[11px] text-[#71717A]">
                <MessageSquare className="mx-auto mb-1.5 h-5 w-5 opacity-30" />
                No conversations yet
              </div>
            ) : (
              grouped.map(({ label, items }) => (
                <div key={label} className="mb-2.5">
                  {/* Group label: Today, Yesterday, Previous */}
                  <div className="mb-1 px-2.5 text-[9.5px] font-bold uppercase tracking-wider text-[#71717A]">
                    {label}
                  </div>

                  {/* Items */}
                  <div className="space-y-0.5">
                    {items.map((sess) => {
                      const isActive = sess.id === activeSessionId;
                      const isEditing = editingId === sess.id;

                      return (
                        <div
                          key={sess.id}
                          onClick={() => !isEditing && onSelectSession(sess.id)}
                          className={`group relative flex items-center justify-between rounded-xl px-2.5 py-1.5 text-left transition-all duration-150 cursor-pointer ${
                            isActive
                              ? "bg-[#222226] border border-[#FF7900]/50 text-[#FFFFFF] shadow-xs"
                              : "hover:bg-[#1C1C20] border border-transparent text-[#A1A1AA] hover:text-[#FFFFFF]"
                          }`}
                        >
                          {/* Active indicator bar */}
                          {isActive && (
                            <div className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-md bg-gradient-to-b from-[#FF7900] to-[#FFA000]" />
                          )}

                          <div className="flex min-w-0 items-center gap-2 flex-1">
                            <MessageSquare
                              className={`h-3.5 w-3.5 flex-shrink-0 ${
                                isActive ? "text-[#FFA000]" : "text-[#71717A]"
                              }`}
                            />

                            {isEditing ? (
                              <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleSaveRename(e, sess.id);
                                  if (e.key === "Escape") handleCancelRename(e);
                                }}
                                autoFocus
                                className="w-full rounded bg-[#141416] px-1.5 py-0.5 text-[11.5px] text-white border border-[#FF7900] outline-none"
                              />
                            ) : (
                              <span
                                className={`truncate text-[11.5px] ${
                                  isActive
                                    ? "font-semibold text-white"
                                    : "font-normal"
                                }`}
                              >
                                {sess.title || "Conversation"}
                              </span>
                            )}
                          </div>

                          {/* Actions: Rename & Delete */}
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={(e) => handleSaveRename(e, sess.id)}
                                  className="p-1 rounded text-emerald-400 hover:bg-white/[0.06]"
                                  title="Save"
                                >
                                  <Check className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={handleCancelRename}
                                  className="p-1 rounded text-[#A1A1AA] hover:bg-white/[0.06]"
                                  title="Cancel"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={(e) => handleStartRename(e, sess)}
                                  className="p-1 rounded text-[#A1A1AA] hover:text-[#FFA000] hover:bg-white/[0.06] transition-colors"
                                  title="Rename conversation"
                                >
                                  <Edit2 className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={(e) => onDeleteSession(sess.id, e)}
                                  className="p-1 rounded text-[#A1A1AA] hover:text-rose-400 hover:bg-white/[0.06] transition-colors"
                                  title="Delete conversation"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* PART 2: BOTTOM SECTION (AI HUB, TELEMETRY & TOOLS)       */}
        {/* ======================================================== */}
        <div className="flex flex-col border-t border-[#2C2C30] bg-[#111113] flex-shrink-0">
          {/* AI Hub Header & Navigation Pills */}
          <div className="px-3 pt-2.5 pb-2 border-b border-white/[0.06]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#FFA000]" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-white">
                  AI Copilot Hub
                </span>
              </div>
              <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            </div>

            {/* Sub-tabs: Insights | Tools | Diagnostics */}
            <div className="grid grid-cols-3 gap-1 rounded-xl bg-[#1A1A1E] p-1 border border-white/[0.06]">
              {SIDEBAR_TABS.map((tab) => {
                const isSelected = activeBottomTab === tab.id;
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveBottomTab(tab.id)}
                    className={`relative flex items-center justify-center gap-1 rounded-lg py-1 text-[10.5px] font-bold transition-all cursor-pointer ${
                      isSelected
                        ? "text-white shadow-xs"
                        : "text-[#A1A1AA] hover:text-white"
                    }`}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="activeSidebarBottomTab"
                        transition={{ type: "spring", stiffness: 450, damping: 32 }}
                        className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#FF7900] to-[#FFA000] shadow-[0_2px_8px_rgba(255,121,0,0.3)] -z-10"
                      />
                    )}
                    <TabIcon className="h-3 w-3" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* AI Hub Content Area (Fixed Height Scrollable) */}
          <div className="h-[250px] sm:h-[270px] overflow-y-auto p-2.5 space-y-2.5 scrollbar-thin">
            {/* SUB-TAB 1: INSIGHTS & TELEMETRY */}
            {activeBottomTab === "insights" && (
              <div className="space-y-2.5">
                {/* Engine Status Card */}
                <div className="rounded-xl border border-white/[0.06] bg-[#18181C] p-2.5 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-[#A1A1AA] font-bold uppercase tracking-wider">
                      Engine
                    </span>
                    <span className="flex items-center gap-1 text-emerald-400 font-mono font-bold">
                      <CheckCircle2 className="h-2.5 w-2.5" />
                      Online
                    </span>
                  </div>

                  <div className="flex items-center gap-2 rounded-lg bg-[#202024] p-1.5 border border-white/[0.04]">
                    <div className="flex h-6 w-6 items-center justify-center rounded bg-[#FF7900]/15 text-[#FFA000] font-bold text-[10px]">
                      AI
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11.5px] font-bold text-white truncate">
                        {providerName}
                      </div>
                      <div className="text-[9.5px] text-[#A1A1AA] truncate">
                        Llama 3.3 70B &bull; Native Function Call
                      </div>
                    </div>
                  </div>
                </div>

                {/* Telemetry Anchor Grid */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#71717A] px-0.5">
                    Live ERP Anchors
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="rounded-lg bg-[#18181C] p-2 border border-white/[0.05] flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-sky-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="text-[9px] text-[#71717A] block truncate">Directory</span>
                        <span className="text-[11px] font-bold text-white">Active</span>
                      </div>
                    </div>
                    <div className="rounded-lg bg-[#18181C] p-2 border border-white/[0.05] flex items-center gap-1.5">
                      <ClipboardList className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="text-[9px] text-[#71717A] block truncate">Attendance</span>
                        <span className="text-[11px] font-bold text-white">Monitored</span>
                      </div>
                    </div>
                    <div className="rounded-lg bg-[#18181C] p-2 border border-white/[0.05] flex items-center gap-1.5">
                      <Banknote className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="text-[9px] text-[#71717A] block truncate">Finance</span>
                        <span className="text-[11px] font-bold text-white">Collections</span>
                      </div>
                    </div>
                    <div className="rounded-lg bg-[#18181C] p-2 border border-white/[0.05] flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-indigo-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="text-[9px] text-[#71717A] block truncate">Session</span>
                        <span className="text-[11px] font-bold text-white">2026-27</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Proactive Actions */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#71717A] px-0.5 flex items-center gap-1">
                    <Zap className="h-2.5 w-2.5 text-[#FFA000]" />
                    Quick Actions
                  </span>
                  <div className="space-y-1">
                    {PROACTIVE_RECOMMENDATIONS.map((rec, idx) => {
                      const RecIcon = rec.icon;
                      return (
                        <button
                          key={idx}
                          onClick={() => onAskAiPrompt?.(rec.prompt)}
                          className="w-full flex items-center gap-2 rounded-lg border border-white/[0.05] bg-[#18181C] p-2 text-left hover:border-[#FF7900]/40 hover:bg-[#202024] transition-all cursor-pointer group"
                        >
                          <div className="flex h-5 w-5 items-center justify-center rounded bg-[#222226] text-[#FFA000] group-hover:text-[#FF7900] flex-shrink-0">
                            <RecIcon className="h-3 w-3" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-[11px] font-semibold text-white group-hover:text-[#FFA000] truncate">
                              {rec.title}
                            </div>
                          </div>
                          <ChevronRight className="h-3 w-3 text-[#71717A] group-hover:text-[#FFA000] flex-shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 2: TOOL VAULT */}
            {activeBottomTab === "tools" && (
              <div className="space-y-2">
                {/* Search box */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-[#71717A] pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search tools..."
                    value={toolSearch}
                    onChange={(e) => setToolSearch(e.target.value)}
                    className="w-full rounded-lg border border-white/[0.06] bg-[#18181C] py-1 pl-7 pr-2.5 text-[11px] text-white placeholder-[#71717A] outline-none focus:border-[#FF7900]"
                  />
                </div>

                {/* Module filter chips */}
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-0.5">
                  {modules.map((m) => (
                    <button
                      key={m}
                      onClick={() => setSelectedToolModule(m)}
                      className={`rounded-md px-2 py-0.5 text-[9.5px] font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                        selectedToolModule === m
                          ? "bg-[#FF7900] text-white"
                          : "bg-[#202024] text-[#A1A1AA] hover:text-white"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>

                {/* Tools List */}
                <div className="space-y-1">
                  {filteredTools.map((t, idx) => {
                    const ToolIcon = t.icon;
                    return (
                      <div
                        key={idx}
                        className="rounded-lg border border-white/[0.05] bg-[#18181C] p-2 space-y-1 hover:border-[#FF7900]/30 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <ToolIcon className="h-3 w-3 text-[#FFA000] flex-shrink-0" />
                            <code className="text-[10.5px] font-mono font-bold text-white truncate">
                              {t.name}
                            </code>
                          </div>
                          <span className="rounded bg-white/[0.05] px-1.5 py-0.2 text-[8.5px] font-semibold text-[#A1A1AA]">
                            {t.module}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#A1A1AA] line-clamp-1">
                          {t.desc}
                        </p>
                        <div className="flex justify-end pt-1 border-t border-white/[0.03]">
                          <button
                            onClick={() => onAskAiPrompt?.(t.prompt)}
                            className="flex items-center gap-1 rounded bg-[#FF7900]/15 border border-[#FF7900]/30 px-2 py-0.5 text-[9.5px] font-bold text-[#FFA000] hover:bg-[#FF7900]/25 transition-colors cursor-pointer"
                          >
                            <span>Run</span>
                            <ChevronRight className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SUB-TAB 3: DIAGNOSTICS & TELEMETRY */}
            {activeBottomTab === "diagnostics" && (
              <div className="space-y-2">
                <div className="rounded-xl border border-white/[0.06] bg-[#18181C] p-2.5 space-y-1.5 text-[10.5px]">
                  <span className="text-[9.5px] font-bold uppercase tracking-wider text-[#A1A1AA] block">
                    Session Telemetry
                  </span>
                  <div className="flex items-center justify-between py-0.5 border-b border-white/[0.04]">
                    <span className="text-[#71717A]">User</span>
                    <span className="font-semibold text-white">{userName}</span>
                  </div>
                  <div className="flex items-center justify-between py-0.5 border-b border-white/[0.04]">
                    <span className="text-[#71717A]">Role</span>
                    <span className="font-semibold text-[#FFA000]">{userRole}</span>
                  </div>
                  <div className="flex items-center justify-between py-0.5 border-b border-white/[0.04]">
                    <span className="text-[#71717A]">Messages</span>
                    <span className="font-mono text-white">{messageCount}</span>
                  </div>
                  <div className="flex items-center justify-between py-0.5">
                    <span className="text-[#71717A]">Security</span>
                    <span className="text-emerald-400 font-medium">RBAC Guard Active</span>
                  </div>
                </div>

                <div className="rounded-xl border border-white/[0.06] bg-[#18181C] p-2.5 space-y-1 text-[10.5px]">
                  <span className="text-[9.5px] font-bold uppercase tracking-wider text-[#A1A1AA] flex items-center gap-1">
                    <Terminal className="h-3 w-3 text-[#FFA000]" />
                    Agentic Architecture
                  </span>
                  <p className="text-[10px] text-[#A1A1AA] leading-relaxed">
                    Max 6 iterative tool execution cycles with automatic schema validation and fallback engine support.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Footer: AI Provider Status */}
          <div className="border-t border-[#2C2C30] p-2.5 bg-[#141416]">
            <AIProviderStatus providerName={providerName} variant="footer" />
          </div>
        </div>
      </aside>
    </>
  );
}
