import {
  Home,
  Megaphone,
  GraduationCap,
  Users,
  Wallet,
} from "lucide-react";

// ─── GREETING HELPER ────────────────────────────────────────────────────────
export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return { text: "Good Morning", icon: "🌅" };
  if (hour < 17) return { text: "Good Afternoon", icon: "☀️" };
  return { text: "Good Evening", icon: "🌙" };
};

// ─── TAB DEFINITIONS (FOR ADMIN) ─────────────────────────────────────────────
export const TABS = [
  { id: "home", label: "Home", subtitle: "Overview", icon: Home },
  { id: "notices", label: "Notice Board", subtitle: "Official Bulletins", icon: Megaphone },
  { id: "students", label: "Students", subtitle: "Student Management", icon: GraduationCap },
  { id: "staff", label: "Teachers & Staff", subtitle: "HR & Staff Management", icon: Users },
  { id: "finance", label: "Finance", subtitle: "Financial Overview", icon: Wallet },
];

// ─── HOME TAB EMPTY DEFAULTS ──────────────────────────────────────────────────
export const attendanceTrendData = [];
export const feeDonutData = [];
export const classDistributionData = [];
export const classDonutSlices = [];
export const incomeExpenseData = [];
export const examSchedules = [];
export const announcements = [];

// ─── STUDENT TAB EMPTY DEFAULTS ───────────────────────────────────────────────
export const studentEnrollmentData = [];
export const studentAttendanceByClass = [];
export const recentStudents = [];
export const genderData = [];
export const topPerformers = [];
export const leaveStats = [];

// ─── STAFF TAB EMPTY DEFAULTS ─────────────────────────────────────────────────
export const staffDeptData = [];
export const teacherAttendanceData = [];
export const recentTeachers = [];
export const leaveRequests = [];
export const payrollSummary = [];

// ─── FINANCE TAB EMPTY DEFAULTS ───────────────────────────────────────────────
export const monthlyRevenueData = [];
export const feeCollectionByClass = [];
export const expenseBreakdown = [];
export const recentTransactions = [];
export const feeOverdueStudents = [];
