import {
  GraduationCap,
  Plus,
  Users,
  ClipboardList,
  DollarSign,
  Boxes,
  BarChart2,
  BookOpen,
  Award,
  Sliders,
  FileSpreadsheet,
  Calendar,
} from "lucide-react";

export const STORAGE_KEY_SESSIONS = "GEMINI_ERP_CHAT_SESSIONS_V2";

export const SUGGESTED_PROMPTS = [
  {
    icon: Calendar,
    title: "Academic Session & Setup",
    prompt:
      "What is the active academic session and what is the progress of our 3-step academic setup (Session -> Master Period -> Timetables)?",
    gradient: "from-indigo-600 to-violet-600",
    bg: "bg-white/90 dark:bg-[#1c1b1a] hover:bg-indigo-500/5 dark:hover:bg-indigo-950/20 border-stone-200/90 dark:border-stone-800 shadow-xs hover:border-indigo-500/40",
    textColor: "text-indigo-700 dark:text-indigo-300",
  },
  {
    icon: BookOpen,
    title: "Exam Schedule & Papers",
    prompt:
      "Show all upcoming exams and their subject schedule with prescribed books and timings.",
    gradient: "from-fuchsia-600 to-pink-600",
    bg: "bg-white/90 dark:bg-[#1c1b1a] hover:bg-fuchsia-500/5 dark:hover:bg-fuchsia-950/20 border-stone-200/90 dark:border-stone-800 shadow-xs hover:border-fuchsia-500/40",
    textColor: "text-fuchsia-700 dark:text-fuchsia-300",
  },
  {
    icon: Award,
    title: "Exam Results & Toppers",
    prompt:
      "Show me exam analytics, top rankers, and grade performance for recent exams.",
    gradient: "from-amber-500 to-yellow-600",
    bg: "bg-white/90 dark:bg-[#1c1b1a] hover:bg-amber-500/5 dark:hover:bg-amber-950/20 border-stone-200/90 dark:border-stone-800 shadow-xs hover:border-amber-500/40",
    textColor: "text-amber-700 dark:text-amber-300",
  },
  {
    icon: FileSpreadsheet,
    title: "Class Syllabus & Books",
    prompt:
      "What are the prescribed textbooks, authors, and full marks for Class 1 and Class 10?",
    gradient: "from-teal-600 to-emerald-600",
    bg: "bg-white/90 dark:bg-[#1c1b1a] hover:bg-teal-500/5 dark:hover:bg-teal-950/20 border-stone-200/90 dark:border-stone-800 shadow-xs hover:border-teal-500/40",
    textColor: "text-teal-700 dark:text-teal-300",
  },
  {
    icon: Sliders,
    title: "School Settings",
    prompt:
      "View the current school profile, contact details, and academic session settings.",
    gradient: "from-orange-500 to-amber-600",
    bg: "bg-white/90 dark:bg-[#1c1b1a] hover:bg-orange-500/5 dark:hover:bg-orange-950/20 border-stone-200/90 dark:border-stone-800 shadow-xs hover:border-orange-500/40",
    textColor: "text-orange-700 dark:text-orange-400",
  },
  {
    icon: GraduationCap,
    title: "Student List",
    prompt:
      "Show me all enrolled students with their class, section, and roll numbers.",
    gradient: "from-amber-500 to-orange-600",
    bg: "bg-white/90 dark:bg-[#1c1b1a] hover:bg-amber-500/5 dark:hover:bg-amber-950/20 border-stone-200/90 dark:border-stone-800 shadow-xs hover:border-amber-500/40",
    textColor: "text-amber-700 dark:text-amber-400",
  },
  {
    icon: ClipboardList,
    title: "Attendance Overview",
    prompt: "What is the school's attendance rate today? Show absent students.",
    gradient: "from-orange-600 to-amber-600",
    bg: "bg-white/90 dark:bg-[#1c1b1a] hover:bg-orange-500/5 dark:hover:bg-orange-950/20 border-stone-200/90 dark:border-stone-800 shadow-xs hover:border-orange-500/40",
    textColor: "text-orange-700 dark:text-orange-300",
  },
  {
    icon: DollarSign,
    title: "Fee Status",
    prompt: "Give an overview of school fee collections and show pending dues.",
    gradient: "from-rose-600 to-red-600",
    bg: "bg-white/90 dark:bg-[#1c1b1a] hover:bg-rose-500/5 dark:hover:bg-rose-950/20 border-stone-200/90 dark:border-stone-800 shadow-xs hover:border-rose-500/40",
    textColor: "text-rose-700 dark:text-rose-300",
  },
  {
    icon: BarChart2,
    title: "Dashboard Stats",
    prompt:
      "Give me an executive summary of the school's key performance metrics.",
    gradient: "from-orange-600 to-amber-500",
    bg: "bg-white/90 dark:bg-[#1c1b1a] hover:bg-orange-500/5 dark:hover:bg-orange-950/20 border-stone-200/90 dark:border-stone-800 shadow-xs hover:border-orange-500/40",
    textColor: "text-orange-700 dark:text-orange-400",
  },
];

export const QUICK_CHIPS = [
  {
    emoji: "🗓️",
    label: "Academic Session",
    prompt: "Show the active academic session and 3-step setup progress",
  },
  {
    emoji: "📝",
    label: "Exams",
    prompt: "Show all exams and subject schedule",
  },
  {
    emoji: "🏆",
    label: "Results & Toppers",
    prompt: "Show exam results and top rankers",
  },
  {
    emoji: "📚",
    label: "Class Syllabus",
    prompt: "Show prescribed books for Class 1",
  },
  {
    emoji: "⚙️",
    label: "Settings",
    prompt: "Show school settings and profile info",
  },
  {
    emoji: "📋",
    label: "Students",
    prompt: "Show me all enrolled students",
  },
  {
    emoji: "📊",
    label: "Attendance",
    prompt: "Give me today's attendance overview",
  },
  {
    emoji: "💰",
    label: "Fees",
    prompt: "Show pending fee collections",
  },
];
