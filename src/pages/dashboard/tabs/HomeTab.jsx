import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
} from "recharts";
import {
  Users,
  GraduationCap,
  CreditCard,
  Calendar,
  Clock,
  Sparkles,
  ChevronDown,
  UserPlus,
  CalendarCheck,
  Wallet,
  FileSpreadsheet,
  BarChart3,
  Send,
  FileText,
  Bell,
  CheckCircle2,
  Settings as SettingsIcon,
} from "lucide-react";
import StatCard from "../components/StatCard.jsx";
import SectionCard from "../components/SectionCard.jsx";
import Loader from "../../../components/ui/Loader.jsx";
import api from "../../../services/api.js";
import { ROUTES } from "../../../routes/routes.js";

const HomeTab = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [notices, setNotices] = useState([]);
  const [attendancePeriod, setAttendancePeriod] = useState("This Week");
  const [feeTrendPeriod, setFeeTrendPeriod] = useState("This Month");

  // Fetch real-time dashboard stats
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      api.get("/dashboard/stats").catch(() => null),
      api.get("/dashboard/charts").catch(() => null),
      api.get("/notices").catch(() => null),
    ])
      .then(([statsRes, chartsRes, noticesRes]) => {
        if (isMounted) {
          if (statsRes?.data?.data) {
            setStats(statsRes.data.data);
          } else if (statsRes?.data) {
            setStats(statsRes.data);
          }

          if (chartsRes?.data?.data) {
            setCharts(chartsRes.data.data);
          } else if (chartsRes?.data) {
            setCharts(chartsRes.data);
          }

          const noticeList =
            noticesRes?.data?.notices ||
            noticesRes?.data?.data ||
            (Array.isArray(noticesRes?.data) ? noticesRes.data : []);
          setNotices(noticeList);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Attendance Stacked Bar Data (From Mockup)
  const attendanceData = useMemo(() => {
    return [
      { day: "Mon", present: 45, absent: 15, leave: 10 },
      { day: "Tue", present: 58, absent: 20, leave: 8 },
      { day: "Wed", present: 72, absent: 18, leave: 6 },
      { day: "Thu", present: 88, absent: 22, leave: 10 },
      { day: "Fri", present: 68, absent: 18, leave: 8 },
      { day: "Sat", present: 42, absent: 12, leave: 6 },
      { day: "Sun", present: 56, absent: 14, leave: 8 },
    ];
  }, []);

  // Class distribution donut data (From Mockup)
  const classData = useMemo(() => {
    return [
      { name: "Class 1-5", count: 420, color: "#EA580C" },
      { name: "Class 6-8", count: 380, color: "#F97316" },
      { name: "Class 9-10", count: 300, color: "#FB923C" },
      { name: "Class 11-12", count: 148, color: "#FBBF24" },
    ];
  }, []);

  // Fee collection trend data (From Mockup)
  const feeTrendData = useMemo(() => {
    return [
      { date: "1 Oct", amount: 75 },
      { date: "5 Oct", amount: 180 },
      { date: "10 Oct", amount: 150 },
      { date: "15 Oct", amount: 220 },
      { date: "20 Oct", amount: 250 },
      { date: "25 Oct", amount: 330 },
      { date: "30 Oct", amount: 360 },
    ];
  }, []);

  // Recent activities list (From Mockup)
  const recentActivities = useMemo(() => {
    return [
      {
        id: 1,
        title: "New student admitted",
        time: "2 hours ago",
        icon: UserPlus,
        color: "bg-orange-500/15 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400",
      },
      {
        id: 2,
        title: "Fee payment received",
        time: "4 hours ago",
        icon: Wallet,
        color: "bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
      },
      {
        id: 3,
        title: "Teacher attendance marked",
        time: "5 hours ago",
        icon: Users,
        color: "bg-amber-500/15 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
      },
      {
        id: 4,
        title: "Exam result published",
        time: "1 day ago",
        icon: FileText,
        color: "bg-rose-500/15 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400",
      },
      {
        id: 5,
        title: "Notice added in notice board",
        time: "1 day ago",
        icon: Bell,
        color: "bg-red-500/15 text-red-600 dark:bg-red-500/20 dark:text-red-400",
      },
    ];
  }, []);

  // Upcoming events list (From Mockup)
  const upcomingEvents = useMemo(() => {
    return [
      {
        id: 1,
        month: "OCT",
        date: "5",
        title: "Unit Test - Class 6",
        time: "09:00 AM - 12:00 PM",
        tagColor: "bg-amber-500",
      },
      {
        id: 2,
        month: "OCT",
        date: "10",
        title: "PTM (Parents Meeting)",
        time: "10:00 AM - 01:00 PM",
        tagColor: "bg-rose-500",
      },
      {
        id: 3,
        month: "OCT",
        date: "15",
        title: "Science Exhibition",
        time: "All Day",
        tagColor: "bg-orange-500",
      },
      {
        id: 4,
        month: "OCT",
        date: "20",
        title: "Holiday (Eid Milad-un-Nabi)",
        time: "All Day",
        tagColor: "bg-amber-600",
      },
    ];
  }, []);

  if (loading) {
    return (
      <div className="rounded-3xl border border-[#EFE8DD] bg-white p-10 shadow-xs dark:border-[#2E2C2A] dark:bg-[#1C1B1A]">
        <Loader fullPage size="lg" text="Loading school campus dashboard..." />
      </div>
    );
  }

  const totalStudentsCount = stats?.totalStudents || 1248;
  const totalTeachersCount = stats?.totalTeachers || 86;
  const totalStaffCount = stats?.totalStaff || 48;
  const feeCollectionAmount = stats?.feeCollectionToday ? `₹${stats.feeCollectionToday.toLocaleString()}` : "₹4,52,300";

  return (
    <div className="space-y-6">
      {/* ─── 4 MAIN STAT CARDS (FROM REFERENCE IMAGE) ─────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <StatCard
          icon={Users}
          label="Total Students"
          value={totalStudentsCount.toLocaleString()}
          sub="12% from last month"
          subColor="text-emerald-600 dark:text-emerald-400"
          iconBg="bg-orange-500/15 dark:bg-orange-500/20"
          iconColor="text-orange-600 dark:text-orange-400"
          trend="up"
        />

        {/* Total Teachers */}
        <StatCard
          icon={GraduationCap}
          label="Total Teachers"
          value={totalTeachersCount.toLocaleString()}
          sub="5% from last month"
          subColor="text-emerald-600 dark:text-emerald-400"
          iconBg="bg-orange-500/15 dark:bg-orange-500/20"
          iconColor="text-orange-600 dark:text-orange-400"
          trend="up"
        />

        {/* Total Staff */}
        <StatCard
          icon={Users}
          label="Total Staff"
          value={totalStaffCount.toLocaleString()}
          sub="8% from last month"
          subColor="text-amber-600 dark:text-amber-400"
          iconBg="bg-amber-500/15 dark:bg-amber-500/20"
          iconColor="text-amber-600 dark:text-amber-400"
          trend="up"
        />

        {/* Fee Collection */}
        <StatCard
          icon={CreditCard}
          label="Fee Collection"
          value={feeCollectionAmount}
          sub="15% from last month"
          subColor="text-rose-600 dark:text-rose-400"
          iconBg="bg-rose-500/15 dark:bg-rose-500/20"
          iconColor="text-rose-600 dark:text-rose-400"
          trend="up"
        />
      </div>

      {/* ─── MIDDLE ROW: ATTENDANCE, RECENT ACTIVITIES, UPCOMING EVENTS ──────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Attendance Overview */}
        <div className="rounded-3xl border border-[#EFE8DD] bg-white p-5 shadow-xs dark:border-[#2E2C2A] dark:bg-[#1C1B1A]">
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-orange-500" />
              <h3 className="text-sm font-extrabold text-stone-900 dark:text-stone-100">
                Attendance Overview
              </h3>
            </div>
            <div className="flex items-center gap-1 rounded-xl bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-600 dark:bg-stone-800 dark:text-stone-300">
              <span>{attendancePeriod}</span>
              <ChevronDown size={13} className="text-stone-400" />
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-5 text-xs font-semibold text-stone-500 dark:text-stone-400 mb-3">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#EA580C]" /> Present
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#EF4444]" /> Absent
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#F59E0B]" /> Leave
            </span>
          </div>

          {/* Chart */}
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceData} barSize={16}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EFE8DD" opacity={0.6} />
                <XAxis dataKey="day" stroke="#A8A29E" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#A8A29E"
                  fontSize={10}
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "#1C1B1A",
                    border: "1px solid #3F3C39",
                    borderRadius: "12px",
                    fontSize: "11px",
                    color: "#FAF7F2",
                  }}
                />
                <Bar dataKey="leave" stackId="a" fill="#F59E0B" />
                <Bar dataKey="absent" stackId="a" fill="#EF4444" />
                <Bar dataKey="present" stackId="a" fill="#EA580C" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="rounded-3xl border border-[#EFE8DD] bg-white p-5 shadow-xs dark:border-[#2E2C2A] dark:bg-[#1C1B1A]">
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-orange-500" />
              <h3 className="text-sm font-extrabold text-stone-900 dark:text-stone-100">
                Recent Activities
              </h3>
            </div>
            <button
              onClick={() => navigate(ROUTES.NOTICES)}
              className="text-xs font-bold text-orange-600 hover:text-orange-500 dark:text-orange-400"
            >
              View All
            </button>
          </div>

          <div className="space-y-3.5 mt-2">
            {recentActivities.map((act) => {
              const Icon = act.icon;
              return (
                <div key={act.id} className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${act.color}`}
                  >
                    <Icon size={16} />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-xs font-bold text-stone-800 dark:text-stone-200 truncate">
                      {act.title}
                    </span>
                    <span className="text-[10px] font-medium text-stone-400">
                      {act.time}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="rounded-3xl border border-[#EFE8DD] bg-white p-5 shadow-xs dark:border-[#2E2C2A] dark:bg-[#1C1B1A]">
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-orange-500" />
              <h3 className="text-sm font-extrabold text-stone-900 dark:text-stone-100">
                Upcoming Events
              </h3>
            </div>
            <button
              onClick={() => navigate(ROUTES.CALENDAR || "/calendar")}
              className="text-xs font-bold text-orange-600 hover:text-orange-500 dark:text-orange-400"
            >
              View All
            </button>
          </div>

          <div className="space-y-3.5 mt-2">
            {upcomingEvents.map((ev) => (
              <div key={ev.id} className="flex items-center gap-3">
                {/* Date Badge */}
                <div className="flex flex-col items-center justify-center rounded-xl bg-orange-500/10 px-2.5 py-1 text-center flex-shrink-0 min-w-[42px] dark:bg-orange-500/20">
                  <span className="text-[9px] font-extrabold text-orange-700 dark:text-orange-300 uppercase">
                    {ev.month}
                  </span>
                  <span className="text-sm font-black text-orange-600 dark:text-orange-400 leading-none">
                    {ev.date}
                  </span>
                </div>

                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${ev.tagColor} flex-shrink-0`} />
                    <span className="text-xs font-bold text-stone-800 dark:text-stone-200 truncate">
                      {ev.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-medium text-stone-400 pl-3">
                    {ev.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── BOTTOM ROW: STUDENTS BY CLASS, FEE TREND, QUICK ACTIONS ────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Students by Class */}
        <div className="rounded-3xl border border-[#EFE8DD] bg-white p-5 shadow-xs dark:border-[#2E2C2A] dark:bg-[#1C1B1A]">
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-orange-500" />
              <h3 className="text-sm font-extrabold text-stone-900 dark:text-stone-100">
                Students by Class
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center mt-2">
            {/* Donut Chart with Center Text */}
            <div className="relative h-44 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={classData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={68}
                    paddingAngle={3}
                    dataKey="count"
                  >
                    {classData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#1C1B1A",
                      border: "1px solid #3F3C39",
                      borderRadius: "10px",
                      fontSize: "11px",
                      color: "#FAF7F2",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                <span className="text-base font-black text-stone-900 dark:text-stone-100">
                  {totalStudentsCount.toLocaleString()}
                </span>
                <span className="text-[10px] font-semibold text-stone-400">
                  Students
                </span>
              </div>
            </div>

            {/* Legend & Counts */}
            <div className="space-y-2 text-xs">
              {classData.map((cls) => (
                <div key={cls.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cls.color }}
                    />
                    <span className="font-semibold text-stone-700 dark:text-stone-300">
                      {cls.name}
                    </span>
                  </div>
                  <span className="font-bold text-stone-900 dark:text-stone-100">
                    {cls.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fee Collection Trend */}
        <div className="rounded-3xl border border-[#EFE8DD] bg-white p-5 shadow-xs dark:border-[#2E2C2A] dark:bg-[#1C1B1A]">
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <CreditCard size={16} className="text-orange-500" />
              <h3 className="text-sm font-extrabold text-stone-900 dark:text-stone-100">
                Fee Collection Trend
              </h3>
            </div>
            <div className="flex items-center gap-1 rounded-xl bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-600 dark:bg-stone-800 dark:text-stone-300">
              <span>{feeTrendPeriod}</span>
              <ChevronDown size={13} className="text-stone-400" />
            </div>
          </div>

          <div className="h-44 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={feeTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EFE8DD" opacity={0.6} />
                <XAxis dataKey="date" stroke="#A8A29E" fontSize={10} tickLine={false} />
                <YAxis
                  stroke="#A8A29E"
                  fontSize={10}
                  tickFormatter={(val) => `${val}K`}
                  ticks={[0, 100, 200, 300, 400]}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "#1C1B1A",
                    border: "1px solid #3F3C39",
                    borderRadius: "12px",
                    fontSize: "11px",
                    color: "#FAF7F2",
                  }}
                  formatter={(val) => [`₹${val}k`, "Collected"]}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#EA580C"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#EA580C" }}
                  activeDot={{ r: 6, fill: "#F97316" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions (From Mockup) */}
        <div className="rounded-3xl border border-[#EFE8DD] bg-white p-5 shadow-xs dark:border-[#2E2C2A] dark:bg-[#1C1B1A]">
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-orange-500" />
              <h3 className="text-sm font-extrabold text-stone-900 dark:text-stone-100">
                Quick Actions
              </h3>
            </div>
            <button
              onClick={() => navigate(ROUTES.SETTINGS)}
              className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
              title="Settings"
            >
              <SettingsIcon size={16} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2.5 mt-2">
            {[
              {
                id: "add_student",
                label: "Add Student",
                icon: UserPlus,
                path: ROUTES.STUDENTS.CREATE || "/students",
                color: "bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400",
              },
              {
                id: "attendance",
                label: "Mark Attendance",
                icon: CalendarCheck,
                path: ROUTES.ACADEMICS.ATTENDANCE || "/academics/attendance",
                color: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
              },
              {
                id: "fees",
                label: "Fee Collection",
                icon: Wallet,
                path: ROUTES.FEES || "/finance/fees",
                color: "bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400",
              },
              {
                id: "exams",
                label: "Exam Marks",
                icon: FileSpreadsheet,
                path: "/exams" || ROUTES.ACADEMICS.BASE,
                color: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
              },
              {
                id: "reports",
                label: "Generate Report",
                icon: BarChart3,
                path: ROUTES.REPORTS || "/reports",
                color: "bg-orange-500/15 text-orange-600 dark:bg-orange-500/25 dark:text-orange-400",
              },
              {
                id: "notice",
                label: "Send Notice",
                icon: Send,
                path: ROUTES.NOTICES || "/notices",
                color: "bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400",
              },
            ].map((qa) => {
              const Icon = qa.icon;
              return (
                <button
                  key={qa.id}
                  onClick={() => navigate(qa.path)}
                  className="flex flex-col items-center justify-center rounded-2xl border border-[#EFE8DD] bg-[#FAF7F2] p-2.5 text-center transition-all hover:-translate-y-0.5 hover:border-orange-400 hover:bg-white hover:shadow-xs dark:border-[#2E2C2A] dark:bg-[#242220] dark:hover:border-orange-500/40 dark:hover:bg-[#2A2724] cursor-pointer"
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-xl mb-1.5 ${qa.color}`}
                  >
                    <Icon size={16} />
                  </div>
                  <span className="text-[10px] font-bold text-stone-700 dark:text-stone-300 leading-tight line-clamp-2">
                    {qa.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeTab;
