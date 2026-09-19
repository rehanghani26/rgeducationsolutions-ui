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
} from "lucide-react";

export const STORAGE_KEY_SESSIONS = "GEMINI_ERP_CHAT_SESSIONS_V2";

export const SUGGESTED_PROMPTS = [
  {
    icon: BookOpen,
    title: "Exam Schedule & Papers",
    prompt:
      "Show all upcoming exams and their subject schedule with prescribed books and timings.",
    gradient: "from-fuchsia-600 to-pink-600",
    bg: "bg-fuchsia-500/10 hover:bg-fuchsia-500/20 border-fuchsia-500/20",
    textColor: "text-fuchsia-300",
  },
  {
    icon: Award,
    title: "Exam Results & Toppers",
    prompt:
      "Show me exam analytics, top rankers, and grade performance for recent exams.",
    gradient: "from-amber-500 to-yellow-600",
    bg: "bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20",
    textColor: "text-amber-300",
  },
  {
    icon: FileSpreadsheet,
    title: "Class Syllabus & Books",
    prompt:
      "What are the prescribed textbooks, authors, and full marks for Class 1 and Class 10?",
    gradient: "from-teal-600 to-emerald-600",
    bg: "bg-teal-500/10 hover:bg-teal-500/20 border-teal-500/20",
    textColor: "text-teal-300",
  },
  {
    icon: Sliders,
    title: "School Settings",
    prompt:
      "View the current school profile, contact details, and academic session settings.",
    gradient: "from-blue-600 to-cyan-600",
    bg: "bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20",
    textColor: "text-blue-300",
  },
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
    icon: ClipboardList,
    title: "Attendance Overview",
    prompt: "What is the school's attendance rate today? Show absent students.",
    gradient: "from-orange-600 to-amber-600",
    bg: "bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/20",
    textColor: "text-orange-300",
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
    icon: BarChart2,
    title: "Dashboard Stats",
    prompt:
      "Give me an executive summary of the school's key performance metrics.",
    gradient: "from-violet-600 to-indigo-600",
    bg: "bg-violet-500/10 hover:bg-violet-500/20 border-violet-500/20",
    textColor: "text-violet-300",
  },
];

export const QUICK_CHIPS = [
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

