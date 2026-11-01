import {
  Users,
  CreditCard,
  Palmtree,
  Calendar,
  BookOpen,
  Award,
  FileSpreadsheet,
  Sliders,
  GraduationCap,
  ClipboardList,
  DollarSign,
  BarChart2,
  UserPlus,
  Banknote,
  Wallet,
  BookUser,
  Grid3x3,
  LayoutDashboard,
} from "lucide-react";

export const STORAGE_KEY_SESSIONS = "GEMINI_ERP_CHAT_SESSIONS_V2";

export const SUGGESTED_PROMPTS = [
  {
    icon: Users,
    title: "Student Directory",
    description: "Browse students with smart filters by class, section & status",
    prompt:
      "Show all students with interactive filters for class, section, status, and gender.",
  },
  {
    icon: CreditCard,
    title: "Student ID Card Studio",
    description: "Generate, preview and customize student ID cards",
    prompt:
      "Generate student ID card and allow me to preview styles, switch templates, and update student card information.",
  },
  {
    icon: UserPlus,
    title: "Student Admissions",
    description: "New student admission and enrollment management",
    prompt:
      "Show all student admission applications and pending enrollments.",
  },
  {
    icon: Palmtree,
    title: "Student Leaves",
    description: "Review, approve or apply for student leave requests",
    prompt:
      "Show all student leave requests, pending applications, and let me review or apply for a student leave.",
  },
  {
    icon: Calendar,
    title: "Academic Session Setup",
    description: "Track active session and academic setup progress",
    prompt:
      "What is the active academic session and what is the progress of our academic setup (Session -> Master Period -> Timetables)?",
  },
  {
    icon: BookOpen,
    title: "Exam Schedule",
    description: "Upcoming exams, subjects, timings and prescribed books",
    prompt:
      "Show all upcoming exams and their subject schedule with prescribed books and timings.",
  },
  {
    icon: Award,
    title: "Exam Results & Toppers",
    description: "Analytics, grade performance and top rankers",
    prompt:
      "Show me exam analytics, top rankers, and grade performance for recent exams.",
  },
  {
    icon: FileSpreadsheet,
    title: "Class Syllabus & Books",
    description: "Prescribed textbooks, authors and full marks per class",
    prompt:
      "What are the prescribed textbooks, authors, and full marks for Class 1 and Class 10?",
  },
  {
    icon: Sliders,
    title: "School Settings",
    description: "School profile, contact details and session configuration",
    prompt:
      "View the current school profile, contact details, and academic session settings.",
  },
  {
    icon: GraduationCap,
    title: "Student List",
    description: "All enrolled students with class, section and roll numbers",
    prompt:
      "Show me all enrolled students with their class, section, and roll numbers.",
  },
  {
    icon: ClipboardList,
    title: "Attendance Overview",
    description: "Today's attendance rate and list of absent students",
    prompt: "What is the school's attendance rate today? Show absent students.",
  },
  {
    icon: Banknote,
    title: "Fee Collection",
    description: "Track and manage school fee collections and dues",
    prompt:
      "Show fee collection summary, pending payments, and defaulters list.",
  },
  {
    icon: Wallet,
    title: "Payroll Management",
    description: "Staff salary and payroll processing overview",
    prompt:
      "Show staff payroll summary and pending salary disbursements.",
  },
  {
    icon: BookUser,
    title: "Teacher Management",
    description: "View and manage all teachers and staff assignments",
    prompt:
      "Show all teachers with their class assignments and contact details.",
  },
  {
    icon: Grid3x3,
    title: "Timetable Management",
    description: "School timetable and period schedule for classes",
    prompt:
      "Show the current school timetable and period schedule for all classes.",
  },
  {
    icon: LayoutDashboard,
    title: "Dashboard Analytics",
    description: "Executive summary and school performance snapshot",
    prompt:
      "Give me an executive summary of the school's key performance metrics and analytics.",
  },
];

export const QUICK_CHIPS = [
  {
    label: "Academic Session",
    prompt: "Show the active academic session and setup progress",
  },
  {
    label: "Exams",
    prompt: "Show all exams and subject schedule",
  },
  {
    label: "Results & Toppers",
    prompt: "Show exam results and top rankers",
  },
  {
    label: "Class Syllabus",
    prompt: "Show prescribed books for Class 1 and Class 10",
  },
  {
    label: "Settings",
    prompt: "Show school settings and profile info",
  },
  {
    label: "Students",
    prompt: "Show me all enrolled students",
  },
  {
    label: "Attendance",
    prompt: "Give me today's attendance overview",
  },
  {
    label: "Fees",
    prompt: "Show pending fee collections and defaulters",
  },
  {
    label: "Payroll",
    prompt: "Show payroll summary and pending salaries",
  },
];
