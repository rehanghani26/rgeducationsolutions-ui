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

// ─── HOME TAB DEMO DATA ───────────────────────────────────────────────────────
export const attendanceTrendData = [
  { day: "Mon", thisWeek: 88, lastWeek: 74 },
  { day: "Tue", thisWeek: 91, lastWeek: 78 },
  { day: "Wed", thisWeek: 94, lastWeek: 80 },
  { day: "Thu", thisWeek: 92, lastWeek: 82 },
  { day: "Fri", thisWeek: 96, lastWeek: 76 },
  { day: "Sat", thisWeek: 85, lastWeek: 70 },
];
export const feeDonutData = [
  { name: "Collected", value: 48750, color: "#10b981" },
  { name: "Pending", value: 12350, color: "#f59e0b" },
  { name: "Overdue", value: 2900, color: "#ef4444" },
];
export const classDistributionData = [
  { class: "Class 10", count: 212, color: "#6366f1" },
  { class: "Class 9", count: 198, color: "#06b6d4" },
  { class: "Class 8", count: 205, color: "#10b981" },
  { class: "Class 7", count: 210, color: "#ef4444" },
  { class: "Class 6", count: 185, color: "#f59e0b" },
  { class: "Others", count: 238, color: "#94a3b8" },
];
export const classDonutSlices = [
  { name: "Class 10", value: 212, color: "#6366f1" },
  { name: "Class 9", value: 198, color: "#06b6d4" },
  { name: "Class 8", value: 205, color: "#10b981" },
  { name: "Class 7", value: 210, color: "#ef4444" },
  { name: "Class 6", value: 185, color: "#f59e0b" },
  { name: "Others", value: 238, color: "#94a3b8" },
];
export const incomeExpenseData = [
  { month: "Jan", income: 75000, expense: 38000 },
  { month: "Feb", income: 80000, expense: 42000 },
  { month: "Mar", income: 78000, expense: 41000 },
  { month: "Apr", income: 82000, expense: 40000 },
  { month: "May", income: 79000, expense: 45000 },
];
export const examSchedules = [
  { day: "17", title: "Final Exam — Mathematics", class: "Class 10" },
  { day: "19", title: "Science Practical", class: "Class 9" },
  { day: "20", title: "English Comprehension", class: "Class 8" },
  { day: "22", title: "Social Studies Test", class: "Class 7" },
];
export const announcements = [
  { icon: "📢", title: "School Annual Day", date: "May 25, 2025", desc: "All are requested to join the Annual Day celebration.", color: "text-emerald-400 bg-emerald-500/10" },
  { icon: "🚌", title: "Transport Route Change", date: "May 14, 2025", desc: "Route 3 timing changed from next week.", color: "text-cyan-400 bg-cyan-500/10" },
  { icon: "📅", title: "PTM Schedule", date: "May 13, 2025", desc: "Parent-Teacher meeting on May 24.", color: "text-indigo-400 bg-indigo-500/10" },
  { icon: "📚", title: "Library New Books", date: "May 12, 2025", desc: "New collection of 120 books added.", color: "text-amber-400 bg-amber-500/10" },
];

// ─── STUDENT TAB DATA ────────────────────────────────────────────────────────
export const studentEnrollmentData = [
  { month: "Aug", enrolled: 1180 }, { month: "Sep", enrolled: 1200 }, { month: "Oct", enrolled: 1215 },
  { month: "Nov", enrolled: 1220 }, { month: "Dec", enrolled: 1218 }, { month: "Jan", enrolled: 1230 },
  { month: "Feb", enrolled: 1238 }, { month: "Mar", enrolled: 1242 }, { month: "Apr", enrolled: 1245 },
  { month: "May", enrolled: 1248 },
];
export const studentAttendanceByClass = [
  { class: "Class 6", pct: 94.2, color: "#f59e0b" },
  { class: "Class 7", pct: 91.8, color: "#ef4444" },
  { class: "Class 8", pct: 93.5, color: "#10b981" },
  { class: "Class 9", pct: 92.4, color: "#06b6d4" },
  { class: "Class 10", pct: 95.1, color: "#6366f1" },
];
export const recentStudents = [
  { name: "Ahmed Al-Rashidi", roll: "STU-1248", class: "Class 10-A", status: "active", joined: "May 1" },
  { name: "Fatima Al-Zahra", roll: "STU-1247", class: "Class 9-B", status: "active", joined: "Apr 28" },
  { name: "Ibrahim Al-Sayed", roll: "STU-1246", class: "Class 10-B", status: "active", joined: "Apr 25" },
  { name: "Khadija Al-Nouri", roll: "STU-1245", class: "Class 8-A", status: "inactive", joined: "Apr 20" },
  { name: "Yusuf Al-Mansoor", roll: "STU-1244", class: "Class 7-C", status: "active", joined: "Apr 18" },
];
export const genderData = [
  { name: "Male", value: 668, color: "#6366f1" },
  { name: "Female", value: 580, color: "#ec4899" },
];
export const topPerformers = [
  { name: "Layla Al-Hashimi", class: "Class 10-A", score: "98.4%", icon: "🥇" },
  { name: "Omar Al-Farouqi", class: "Class 10-B", score: "97.1%", icon: "🥈" },
  { name: "Nour Al-Deen", class: "Class 9-A", score: "96.8%", icon: "🥉" },
  { name: "Zainab Al-Saidi", class: "Class 10-A", score: "95.5%", icon: "⭐" },
];
export const leaveStats = [
  { type: "Medical Leave", count: 8, color: "text-rose-400 bg-rose-500/10" },
  { type: "Family Leave", count: 5, color: "text-amber-400 bg-amber-500/10" },
  { type: "Other", count: 3, color: "text-slate-400 bg-slate-500/10" },
];

// ─── STAFF TAB DATA ──────────────────────────────────────────────────────────
export const staffDeptData = [
  { dept: "Sciences", count: 14, color: "#6366f1" },
  { dept: "Mathematics", count: 11, color: "#10b981" },
  { dept: "Languages", count: 13, color: "#06b6d4" },
  { dept: "Social Studies", count: 9, color: "#f59e0b" },
  { dept: "Arts & PE", count: 7, color: "#ec4899" },
  { dept: "Administration", count: 18, color: "#94a3b8" },
];
export const teacherAttendanceData = [
  { day: "Mon", present: 68, absent: 4 },
  { day: "Tue", present: 70, absent: 2 },
  { day: "Wed", present: 65, absent: 7 },
  { day: "Thu", present: 71, absent: 1 },
  { day: "Fri", present: 69, absent: 3 },
];
export const recentTeachers = [
  { name: "Dr. Tariq Al-Hassan", id: "EMP-072", dept: "Sciences", designation: "HOD Sciences", status: "active" },
  { name: "Mrs. Amina Al-Khatib", id: "EMP-071", dept: "Mathematics", designation: "Sr. Teacher", status: "active" },
  { name: "Mr. Bilal Al-Rashid", id: "EMP-070", dept: "Languages", designation: "Arabic Teacher", status: "active" },
  { name: "Ms. Sara Al-Osman", id: "EMP-069", dept: "Sciences", designation: "Biology Teacher", status: "on-leave" },
  { name: "Mr. Hassan Al-Farisi", id: "EMP-068", dept: "Social", designation: "Class Teacher", status: "active" },
];
export const leaveRequests = [
  { name: "Ms. Sara Al-Osman", type: "Medical", from: "May 12", to: "May 16", status: "approved" },
  { name: "Mr. Khalid Al-Ansari", type: "Family", from: "May 18", to: "May 19", status: "pending" },
  { name: "Mrs. Hana Al-Nouri", type: "Emergency", from: "May 13", to: "May 13", status: "approved" },
  { name: "Mr. Faisal Al-Turki", type: "Annual", from: "May 22", to: "May 26", status: "pending" },
];
export const payrollSummary = [
  { label: "Total Payroll (May)", value: "₹18,42,500", color: "text-emerald-400", icon: "💼" },
  { label: "Avg. Teacher Salary", value: "₹38,500", color: "text-indigo-400", icon: "👨‍🏫" },
  { label: "Avg. Staff Salary", value: "₹22,200", color: "text-cyan-400", icon: "👷" },
  { label: "Pending Disbursements", value: "3", color: "text-amber-400", icon: "⏳" },
];

// ─── FINANCE TAB DATA ────────────────────────────────────────────────────────
export const monthlyRevenueData = [
  { month: "Aug", fees: 58000, expenses: 32000, payroll: 18000 },
  { month: "Sep", fees: 72000, expenses: 35000, payroll: 18425 },
  { month: "Oct", fees: 68000, expenses: 34000, payroll: 18425 },
  { month: "Nov", fees: 71000, expenses: 36000, payroll: 18425 },
  { month: "Dec", fees: 65000, expenses: 33000, payroll: 18425 },
  { month: "Jan", fees: 75000, expenses: 38000, payroll: 18425 },
  { month: "Feb", fees: 80000, expenses: 42000, payroll: 18425 },
  { month: "Mar", fees: 78000, expenses: 41000, payroll: 18425 },
  { month: "Apr", fees: 82000, expenses: 40000, payroll: 18425 },
  { month: "May", fees: 79000, expenses: 45000, payroll: 18425 },
];
export const feeCollectionByClass = [
  { class: "Class 10", collected: 95, pending: 5, amount: "₹1,42,500" },
  { class: "Class 9", collected: 88, pending: 12, amount: "₹1,18,800" },
  { class: "Class 8", collected: 91, pending: 9, amount: "₹1,24,950" },
  { class: "Class 7", collected: 84, pending: 16, amount: "₹1,10,880" },
  { class: "Class 6", collected: 79, pending: 21, amount: "₹97,650" },
];
export const expenseBreakdown = [
  { name: "Salaries", value: 18425, color: "#6366f1" },
  { name: "Maintenance", value: 4200, color: "#f59e0b" },
  { name: "Utilities", value: 3800, color: "#06b6d4" },
  { name: "Supplies", value: 2900, color: "#10b981" },
  { name: "Events", value: 1950, color: "#ec4899" },
  { name: "Other", value: 1125, color: "#94a3b8" },
];
export const recentTransactions = [
  { name: "Ahmed Al-Rashidi", type: "Fee Payment", amount: "+₹12,500", date: "May 15", status: "success" },
  { name: "Fatima Al-Zahra", type: "Fee Payment", amount: "+₹8,500", date: "May 14", status: "success" },
  { name: "Salary Disbursement", type: "Payroll", amount: "-₹1,84,250", date: "May 14", status: "success" },
  { name: "Electricity Bill", type: "Utility", amount: "-₹3,800", date: "May 13", status: "success" },
  { name: "Ibrahim Al-Sayed", type: "Fee Payment", amount: "+₹12,500", date: "May 12", status: "success" },
  { name: "Library Books", type: "Purchase", amount: "-₹2,400", date: "May 11", status: "success" },
];
export const feeOverdueStudents = [
  { name: "Zaid Al-Bukhari", class: "Class 9-A", amount: "₹12,500", days: 18 },
  { name: "Lina Al-Shami", class: "Class 8-B", amount: "₹8,500", days: 12 },
  { name: "Karim Al-Hosseini", class: "Class 10-A", amount: "₹12,500", days: 9 },
  { name: "Rania Al-Masri", class: "Class 7-C", amount: "₹7,500", days: 7 },
];
