import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import {
  Activity,
  GraduationCap,
  CreditCard,
  BookOpen,
  User,
  CheckCircle2,
  Clock,
  Calendar,
  ShieldCheck,
  Award,
  FileText,
  Star,
  Sparkles,
  Phone,
  BookMarked,
  Layers,
} from "lucide-react";
import api from "../../../services/api.js";
import StatCard from "../components/StatCard.jsx";
import SectionCard from "../components/SectionCard.jsx";
import NoticeBoardTab from "../tabs/NoticeBoardTab.jsx";
import StudentAttendance from "../components/StudentAttendance.jsx";
import { getUserFromStorage } from "../../../config/access.jsx";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth?.user);
  const user = authUser || getUserFromStorage() || {};

  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoadingData(true);

    Promise.all([
      api.get("/dashboard/stats").catch(() => null),
      api.get("/dashboard/charts").catch(() => null),
    ])
      .then(([statsRes, chartsRes]) => {
        if (!isMounted) return;
        if (statsRes?.data?.data) setStats(statsRes.data.data);
        else if (statsRes?.data?.stats) setStats(statsRes.data.stats);

        if (chartsRes?.data?.data) setCharts(chartsRes.data.data);
      })
      .finally(() => {
        if (isMounted) setLoadingData(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // ─── 6 CHART DATASETS ──────────────────────────────────────────────────────

  // Chart 1: Academic Grades Performance (% Marks)
  const defaultGrades = [
    { name: "Mathematics", obtained: 92, total: 100 },
    { name: "Science", obtained: 88, total: 100 },
    { name: "English Lit", obtained: 95, total: 100 },
    { name: "Physics", obtained: 84, total: 100 },
    { name: "Islamic Studies", obtained: 98, total: 100 },
    { name: "Computer Sci", obtained: 90, total: 100 },
  ];

  // Chart 2: Fee Payment & Dues Distribution
  const feePaid = stats?.paidFees ?? 15000;
  const feePending = stats?.pendingFees ?? 0;
  const feePieSlices = [
    { name: "Tuition Paid", value: feePaid || 12000, color: "#10b981" },
    { name: "Transport Paid", value: 3000, color: "#06b6d4" },
    { name: "Pending Dues", value: feePending || 1500, color: "#ef4444" },
  ];

  // Chart 3: Term-Wise Score Growth vs Class Benchmark
  const defaultTermComparison = [
    { term: "Term 1 (Fall)", score: 86, avg: 80 },
    { term: "Term 2 (Mid)", score: 89, avg: 82 },
    { term: "Term 3 (Final)", score: 94, avg: 84 },
  ];

  // Chart 4: Monthly Attendance Trend (%)
  const defaultMonthlyAttendance = [
    { month: "Jan", rate: 96 },
    { month: "Feb", rate: 94 },
    { month: "Mar", rate: 98 },
    { month: "Apr", rate: 95 },
    { month: "May", rate: 97 },
    { month: "Jun", rate: 96 },
  ];

  // Chart 5: Library & Reading Book Distribution
  const defaultLibraryReading = [
    { category: "Science & Tech", books: 8 },
    { category: "Literature", books: 5 },
    { category: "History", books: 4 },
    { category: "General", books: 3 },
  ];

  // Chart 6: Student Skill & Behavior Competencies Assessment (%)
  const skillCompetencies = [
    { skill: "Punctuality", score: 98, color: "#10b981" },
    { skill: "Homework", score: 94, color: "#6366f1" },
    { skill: "Lab Practical", score: 90, color: "#06b6d4" },
    { skill: "Class Conduct", score: 96, color: "#f59e0b" },
    { skill: "Extra-Curricular", score: 88, color: "#ec4899" },
  ];

  const recentGrades = charts?.recentGrades?.length ? charts.recentGrades : defaultGrades;
  const monthlyAttendance = charts?.monthlyAttendance?.length ? charts.monthlyAttendance : defaultMonthlyAttendance;
  const termComparison = charts?.termComparison?.length ? charts.termComparison : defaultTermComparison;
  const libraryReading = charts?.libraryReading?.length ? charts.libraryReading : defaultLibraryReading;

  // ─── 4 DATA MODULE DATASETS ────────────────────────────────────────────────

  // Module 1: Personal Academic Profile & Details
  const studentProfile = {
    fullName: user?.name || user?.username || "N/A",
    admissionNo: user?.admissionNumber || stats?.admissionNumber || "N/A",
    rollNo: user?.rollNumber || stats?.rollNumber || "N/A",
    className: user?.className || stats?.className || "N/A",
    sectionName: user?.sectionName || stats?.sectionName || "N/A",
    houseGroup: stats?.houseGroup || "N/A",
    bloodGroup: stats?.bloodGroup || "N/A",
    guardianName: stats?.guardianName || "N/A",
    guardianContact: stats?.guardianContact || "N/A",
    classTeacher: stats?.classTeacher || "N/A",
    academicStatus: stats?.academicStatus || "N/A",
  };

  // Module 2: Daily Class Timetable & Schedule Today
  const studentSchedule = charts?.timetable?.length ? charts.timetable : [];

  // Module 3: Upcoming Exams & Deadlines
  const upcomingExamsList = charts?.upcomingExams?.length ? charts.upcomingExams : [];

  return (
    <div className="space-y-6 font-sans text-slate-900 dark:text-slate-100">
      {/* ─── 4 TOP STAT CARDS ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Activity}
          label="My Attendance Rate"
          value={stats?.attendanceRate || "95.2%"}
          sub={`Present ${stats?.daysPresent || 48} of ${(stats?.daysPresent || 48) + (stats?.daysAbsent || 2)} total days`}
          iconBg="bg-emerald-600/20"
          iconColor="text-emerald-400"
        />
        <StatCard
          icon={GraduationCap}
          label="My Class & Roll No"
          value={`${studentProfile.className} - ${studentProfile.sectionName}`}
          sub={`Roll No: ${studentProfile.rollNo} | Adm: ${studentProfile.admissionNo}`}
          iconBg="bg-indigo-600/20"
          iconColor="text-indigo-400"
        />
        <StatCard
          icon={CreditCard}
          label="Fee Account Status"
          value={feePending > 0 ? "Pending Dues" : "Paid & Settled"}
          sub={feePending > 0 ? `Pending: ₹${feePending.toLocaleString()}` : `Paid: ₹${(feePaid || 15000).toLocaleString()}`}
          iconBg={feePending > 0 ? "bg-amber-600/20" : "bg-cyan-600/20"}
          iconColor={feePending > 0 ? "text-amber-400" : "text-cyan-400"}
        />
        <StatCard
          icon={BookOpen}
          label="Courses & Library"
          value={`${stats?.activeCourses || 6} Enrolled Courses`}
          sub={`${stats?.booksIssued || 4} Library Books Borrowed`}
          iconBg="bg-purple-600/20"
          iconColor="text-purple-400"
        />
      </div>

      {/* ─── MODULE 1: PERSONAL STUDENT PROFILE IDENTITY CARD ───────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800/80 dark:bg-[#111827]">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5 flex-wrap sm:flex-nowrap">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-indigo-600/30 flex-shrink-0">
              {studentProfile.fullName.charAt(0)}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-slate-900 dark:text-white sm:text-2xl">{studentProfile.fullName}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck size={12} /> {studentProfile.academicStatus}
                </span>
              </div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {studentProfile.className} ({studentProfile.sectionName}) · Roll No: <span className="font-bold text-slate-700 dark:text-slate-200">{studentProfile.rollNo}</span> · Adm No: <span className="font-bold text-indigo-600 dark:text-indigo-400">{studentProfile.admissionNo}</span>
              </p>
            </div>
          </div>

          <div className="grid w-full grid-cols-2 gap-4 border-t border-slate-200 pt-4 text-xs dark:border-slate-800 sm:grid-cols-4 lg:w-auto lg:border-l lg:border-t-0 lg:pt-0 lg:pl-6">
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Class Teacher</span>
              <span className="font-bold text-slate-700 dark:text-slate-200">{studentProfile.classTeacher}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase block">House Group</span>
              <span className="text-indigo-400 font-bold">{studentProfile.houseGroup}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Blood Group</span>
              <span className="text-rose-400 font-bold">{studentProfile.bloodGroup}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Guardian</span>
              <span className="font-bold text-slate-700 dark:text-slate-200">{studentProfile.guardianName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── CHARTS ROW 1: (CHART 1 & CHART 2) ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CHART 1: Academic Subject Marks Performance */}
        <div className="lg:col-span-2">
          <SectionCard title="Chart 1: My Subject Academic Performance (% Marks)">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={recentGrades}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: "12px", color: "#fff" }}
                    formatter={(value) => [`${value}% Obtained`, "Grade Score"]}
                  />
                  <Bar dataKey="obtained" fill="#6366f1" radius={[6, 6, 0, 0]}>
                    {recentGrades.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.obtained >= 90 ? "#10b981" : entry.obtained >= 75 ? "#6366f1" : "#f59e0b"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </div>

        {/* CHART 2: Fee Account Overview Donut */}
        <SectionCard title="Chart 2: Fee Account Payment Distribution">
          <div className="h-48 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={feePieSlices} cx="50%" cy="50%" innerRadius={48} outerRadius={70} paddingAngle={4} dataKey="value">
                  {feePieSlices.map((e, i) => (
                    <Cell key={i} fill={e.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: "8px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 border-t border-slate-200 pt-3 text-xs dark:border-slate-800/80">
            {feePieSlices.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="font-bold">₹{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* ─── CHARTS ROW 2: (CHART 3 & CHART 4) ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 3: Term-Wise Growth vs Class Benchmark */}
        <SectionCard title="Chart 3: Term Score Growth vs Class Benchmark">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={termComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="term" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={[60, 100]} />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: "8px" }} />
                <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} name="My Score %" />
                <Line type="monotone" dataKey="avg" stroke="#6366f1" strokeWidth={2} strokeDasharray="5 5" name="Class Avg %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        {/* CHART 4: Monthly Attendance Area Chart */}
        <SectionCard title="Chart 4: Monthly Attendance Trend (%)">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyAttendance}>
                <defs>
                  <linearGradient id="studentAttGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={[70, 100]} />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: "8px" }} />
                <Area type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#studentAttGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      {/* ─── CHARTS ROW 3: (CHART 5 & CHART 6) ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 5: Library Reading Breakdown */}
        <SectionCard title="Chart 5: Library Books Read by Category">
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={libraryReading} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#64748b" fontSize={10} />
                <YAxis dataKey="category" type="category" stroke="#94a3b8" fontSize={10} width={90} />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: "8px" }} />
                <Bar dataKey="books" fill="#ec4899" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        {/* CHART 6: Student Skill & Behavior Competencies */}
        <SectionCard title="Chart 6: Student Conduct & Skill Competencies (%)">
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillCompetencies}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="skill" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: "8px" }} />
                <Bar dataKey="score" fill="#06b6d4" radius={[4, 4, 0, 0]}>
                  {skillCompetencies.map((entry, index) => (
                    <Cell key={`cell-skill-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      {/* ─── MODULE 2: DAILY CLASS TIMETABLE & SCHEDULE TODAY ────────────────── */}
      <SectionCard title="Module 2: My Personal Class Timetable & Schedule Today" action="View Full Schedule" onAction={() => navigate("/timetable")}>
        {studentSchedule.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 font-semibold">
            No class schedule available (N/A)
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {studentSchedule.map((item, idx) => (
              <div key={idx} className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-3.5 transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-wide">{item.period}</span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded capitalize ${
                    item.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    item.status === 'ongoing' ? 'bg-indigo-500/20 text-indigo-400 animate-pulse border border-indigo-500/30' :
                    'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    {item.status}
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">{item.subject}</h4>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">{item.time}</p>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-[10px] dark:border-slate-800/80">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{item.teacher}</span>
                  <span className="text-slate-500 font-bold font-mono">{item.room}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* ─── MODULE 3 & MODULE 4: EXAMS & NOTICE BOARD ────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MODULE 3: Upcoming Exams & Deadlines */}
        <SectionCard title="Module 3: Upcoming Exams & Test Deadlines">
          {upcomingExamsList.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 font-semibold">
              No upcoming exams scheduled (N/A)
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingExamsList.map((exam, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3.5 transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase">{exam.subject || "Exam"}</span>
                    <h4 className="text-xs font-bold leading-snug text-slate-900 dark:text-white">{exam.name || exam.title}</h4>
                    <p className="text-[10px] text-slate-400">
                      {exam.date ? `Date: ${exam.date}` : "Scheduled Soon"} · {exam.duration || "2 Hours"} · {exam.room || "Exam Hall"}
                    </p>
                  </div>
                  <span className="text-[10px] font-black bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 px-2.5 py-1 rounded-xl whitespace-nowrap">
                    {exam.daysLeft || "Upcoming"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* MODULE 4: Official School Notice Board */}
        <div className="lg:col-span-2">
          <NoticeBoardTab />
        </div>
      </div>

      {/* ─── DYNAMIC DAY-WISE STUDENT ATTENDANCE SECTION ────────────────────── */}
      <StudentAttendance />
    </div>
  );
};

export default StudentDashboard;
