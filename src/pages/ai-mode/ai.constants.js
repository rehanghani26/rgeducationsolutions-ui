import {
  GraduationCap,
  Plus,
  Users,
  ClipboardList,
  DollarSign,
  Boxes,
  BarChart2,
  BookOpen,
} from "lucide-react";

export const STORAGE_KEY_SESSIONS = "GEMINI_ERP_CHAT_SESSIONS_V2";

export const SUGGESTED_PROMPTS = [
  {
    icon: GraduationCap,
    title: "Student List",
    prompt:
      "Show me all enrolled students with their class, section, and roll numbers.",
    gradient: "from-blue-600 to-indigo-600",
    bg: "bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20",
    textColor: "text-blue-300",
  },
  {
    icon: Plus,
    title: "Enroll Student",
    prompt:
      "Enroll a new student named Aarav Sharma in Class 10 Section A, parent: Rajesh Sharma.",
    gradient: "from-emerald-600 to-teal-600",
    bg: "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20",
    textColor: "text-emerald-300",
  },
  {
    icon: Users,
    title: "User Accounts",
    prompt: "List all system user accounts, roles, and their current status.",
    gradient: "from-purple-600 to-pink-600",
    bg: "bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/20",
    textColor: "text-purple-300",
  },
  {
    icon: ClipboardList,
    title: "Attendance",
    prompt: "What is the school's attendance rate today? Show absent students.",
    gradient: "from-amber-600 to-orange-600",
    bg: "bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20",
    textColor: "text-amber-300",
  },
  {
    icon: DollarSign,
    title: "Fee Status",
    prompt: "Give an overview of school fee collections and show pending dues.",
    gradient: "from-rose-600 to-red-600",
    bg: "bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/20",
    textColor: "text-rose-300",
  },
  {
    icon: Boxes,
    title: "Inventory",
    prompt:
      "Show inventory items running low on stock and their current quantities.",
    gradient: "from-cyan-600 to-sky-600",
    bg: "bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/20",
    textColor: "text-cyan-300",
  },
  {
    icon: BarChart2,
    title: "Dashboard Stats",
    prompt:
      "Give me an executive summary of the school's key performance metrics.",
    gradient: "from-violet-600 to-indigo-600",
    bg: "bg-violet-500/10 hover:bg-violet-500/20 border-violet-500/20",
    textColor: "text-violet-300",
  },
  {
    icon: BookOpen,
    title: "Exam Schedule",
    prompt: "Show upcoming exams and assessments scheduled for this month.",
    gradient: "from-fuchsia-600 to-pink-600",
    bg: "bg-fuchsia-500/10 hover:bg-fuchsia-500/20 border-fuchsia-500/20",
    textColor: "text-fuchsia-300",
  },
];

export const QUICK_CHIPS = [
  {
    emoji: "📋",
    label: "List Students",
    prompt: "Show me all enrolled students",
  },
  {
    emoji: "➕",
    label: "Add Student",
    prompt: "Enroll a new student in Class 9A",
  },
  {
    emoji: "👥",
    label: "Users",
    prompt: "Show all system user accounts",
  },
  {
    emoji: "📊",
    label: "Stats",
    prompt: "Give me today's attendance overview",
  },
  {
    emoji: "💰",
    label: "Fees",
    prompt: "Show pending fee collections",
  },
  {
    emoji: "📦",
    label: "Inventory",
    prompt: "Show low stock inventory items",
  },
];
