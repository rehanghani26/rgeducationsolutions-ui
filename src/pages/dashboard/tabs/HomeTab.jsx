import React, { useState, useMemo, useEffect } from "react";
import {
  AreaChart,
  Area,
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
  Line,
} from "recharts";
import {
  Users,
  UserCheck,
  GraduationCap,
  Activity,
  CreditCard,
  AlertTriangle,
  Calendar,
  Clock,
  Sparkles,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  RefreshCw,
  Eye,
  BarChart3,
  PieChart as PieIcon,
} from "lucide-react";
import StatCard from "../components/StatCard.jsx";
import SectionCard from "../components/SectionCard.jsx";
import Loader from "../../../components/ui/Loader.jsx";
import api from "../../../services/api.js";

const HomeTab = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [notices, setNotices] = useState([]);
  const [timeframe, setTimeframe] = useState("month"); // "today" | "week" | "month" | "session"
  const [activeKpi, setActiveKpi] = useState(null);
  const [attendanceView, setAttendanceView] = useState("both"); // "thisWeek" | "lastWeek" | "both"
  const [activeFeeSlice, setActiveFeeSlice] = useState(null);
  const [classChartType, setClassChartType] = useState("donut"); // "donut" | "bar"
  const [announcementFilter, setAnnouncementFilter] = useState("all");
  const [currentTime, setCurrentTime] = useState("");

  // Live real-time clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

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

  // Dynamic Date & Month calculations
  const dateInfo = useMemo(() => {
    const now = new Date();
    const monthLong = now.toLocaleDateString("en-US", { month: "long" });
    const monthShort = now.toLocaleDateString("en-US", { month: "short" });
    const year = now.getFullYear();
    const dayNum = now.getDate();
    const weekday = now.toLocaleDateString("en-US", { weekday: "short" });
    const todayFormatted = `${weekday}, ${monthShort} ${dayNum}`;

    return {
      monthLong,
      monthShort,
      year,
      todayFormatted,
    };
  }, []);

  const filteredAnnouncements = useMemo(() => {
    if (announcementFilter === "all") return notices;
    return notices.filter((a) => a.category === announcementFilter);
  }, [announcementFilter, notices]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm dark:border-slate-800/80 dark:bg-[#0f172a]">
        <Loader fullPage size="lg" text="Loading real-time campus dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ─── GOD-MODE INTERACTIVE TOOLBAR ─────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white/90 px-4 py-2.5 shadow-sm dark:border-slate-800/80 dark:bg-[#0f172a]/90 backdrop-blur">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Campus Feed
          </span>
          {currentTime && (
            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-mono font-medium text-slate-500 dark:text-slate-400">
              <Clock size={12} className="text-slate-400" />
              {currentTime}
            </span>
          )}
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800/80">
          {[
            { id: "today", label: `Today (${dateInfo.todayFormatted})` },
            { id: "week", label: "This Week" },
            { id: "month", label: `This Month (${dateInfo.monthShort})` },
            { id: "session", label: "Session 2026-27" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTimeframe(tab.id)}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                timeframe === tab.id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── DYNAMIC KPI CARDS ROW (MONTH & DATE AWARE) ───────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5">
        <StatCard
          icon={Users}
          label="Total Students"
          value={stats?.totalStudents ? stats.totalStudents.toLocaleString() : "N/A"}
          badge="Enrolled"
          sub={stats?.totalStudents ? `Enrolled in ${dateInfo.monthShort}` : "N/A"}
          subColor="text-emerald-500 dark:text-emerald-400"
          iconBg="bg-indigo-600/15 dark:bg-indigo-500/20"
          iconColor="text-indigo-600 dark:text-indigo-400"
          trend="up"
          progress={stats?.totalStudents ? 100 : 0}
          active={activeKpi === "students"}
          onClick={() => setActiveKpi(activeKpi === "students" ? null : "students")}
        />

        <StatCard
          icon={GraduationCap}
          label="Total Teachers"
          value={stats?.totalTeachers ? stats.totalTeachers.toLocaleString() : "N/A"}
          badge="Faculty"
          sub={stats?.totalTeachers ? `Faculty in ${dateInfo.monthShort}` : "N/A"}
          subColor="text-emerald-500 dark:text-emerald-400"
          iconBg="bg-emerald-600/15 dark:bg-emerald-500/20"
          iconColor="text-emerald-600 dark:text-emerald-400"
          trend="up"
          progress={stats?.totalTeachers ? 100 : 0}
          active={activeKpi === "teachers"}
          onClick={() => setActiveKpi(activeKpi === "teachers" ? null : "teachers")}
        />

        <StatCard
          icon={UserCheck}
          label="Total Staff"
          value={stats?.totalStaff ? stats.totalStaff.toLocaleString() : "N/A"}
          badge="Support"
          sub={stats?.totalStaff ? `Support in ${dateInfo.monthShort}` : "N/A"}
          subColor="text-amber-500 dark:text-amber-400"
          iconBg="bg-amber-600/15 dark:bg-amber-500/20"
          iconColor="text-amber-600 dark:text-amber-400"
          trend="up"
          progress={stats?.totalStaff ? 100 : 0}
          active={activeKpi === "staff"}
          onClick={() => setActiveKpi(activeKpi === "staff" ? null : "staff")}
        />

        <StatCard
          icon={Activity}
          label="Attendance Today"
          value={stats?.todayAttendance != null ? `${stats.todayAttendance}%` : "N/A"}
          badge={dateInfo.todayFormatted}
          badgeColor="bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 border-cyan-500/20"
          sub="N/A"
          subColor="text-cyan-600 dark:text-cyan-400"
          iconBg="bg-cyan-600/15 dark:bg-cyan-500/20"
          iconColor="text-cyan-600 dark:text-cyan-400"
          trend="up"
          progress={stats?.todayAttendance || 0}
          active={activeKpi === "attendance"}
          onClick={() => setActiveKpi(activeKpi === "attendance" ? null : "attendance")}
        />

        <StatCard
          icon={CreditCard}
          label={`Fee Collection (${dateInfo.monthShort})`}
          value={stats?.feeCollectionToday ? `₹${stats.feeCollectionToday.toLocaleString()}` : "N/A"}
          badge={`${dateInfo.monthShort} ${dateInfo.year}`}
          sub="N/A"
          subColor="text-indigo-600 dark:text-indigo-400"
          iconBg="bg-blue-600/15 dark:bg-blue-500/20"
          iconColor="text-blue-600 dark:text-blue-400"
          progress={0}
          active={activeKpi === "fees"}
          onClick={() => setActiveKpi(activeKpi === "fees" ? null : "fees")}
        />

        <StatCard
          icon={AlertTriangle}
          label="Outstanding Fees"
          value={stats?.feePending ? `₹${stats.feePending.toLocaleString()}` : "N/A"}
          badge={`Due ${dateInfo.monthShort}`}
          badgeColor="bg-rose-500/10 text-rose-600 dark:text-rose-300 border-rose-500/20"
          sub="N/A"
          subColor="text-rose-500 dark:text-rose-400"
          iconBg="bg-rose-600/15 dark:bg-rose-500/20"
          iconColor="text-rose-600 dark:text-rose-400"
          trend="down"
          progress={0}
          active={activeKpi === "outstanding"}
          onClick={() => setActiveKpi(activeKpi === "outstanding" ? null : "outstanding")}
        />
      </div>

      {/* ─── CHARTS ROW ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Trend with Interactive View Toggle */}
        <SectionCard
          title="Attendance Trend"
          action={
            <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-0.5 text-[10px] dark:bg-slate-800">
              <button
                onClick={() => setAttendanceView("both")}
                className={`rounded px-1.5 py-0.5 font-bold transition-all ${
                  attendanceView === "both"
                    ? "bg-white text-indigo-600 shadow-xs dark:bg-slate-700 dark:text-white"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setAttendanceView("thisWeek")}
                className={`rounded px-1.5 py-0.5 font-bold transition-all ${
                  attendanceView === "thisWeek"
                    ? "bg-white text-indigo-600 shadow-xs dark:bg-slate-700 dark:text-white"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                This Week
              </button>
            </div>
          }
        >
          {charts?.attendanceTrend && charts.attendanceTrend.length > 0 ? (
            <>
              <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 mb-2">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-1 bg-indigo-500 rounded-full" /> This Week
                  </span>
                  {(attendanceView === "both" || attendanceView === "lastWeek") && (
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-1 border-b-2 border-dashed border-cyan-400" /> Last Week
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-semibold text-emerald-500">
                  Avg: {stats?.todayAttendance != null ? `${stats.todayAttendance}%` : "N/A"}
                </span>
              </div>

              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={charts.attendanceTrend}>
                    <defs>
                      <linearGradient id="gradAtt" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                    <XAxis dataKey="day" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis
                      stroke="#64748b"
                      fontSize={10}
                      domain={[0, 100]}
                      tickFormatter={(v) => `${v}%`}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#0f172a",
                        border: "1px solid #334155",
                        borderRadius: "12px",
                        fontSize: "11px",
                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
                      }}
                      formatter={(val, name) => [
                        `${val}%`,
                        name === "thisWeek" ? "This Week" : "Last Week",
                      ]}
                    />
                    {(attendanceView === "both" || attendanceView === "thisWeek") && (
                      <Area
                        type="monotone"
                        dataKey="thisWeek"
                        stroke="#6366f1"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#gradAtt)"
                      />
                    )}
                    {(attendanceView === "both" || attendanceView === "lastWeek") && (
                      <Line
                        type="monotone"
                        dataKey="lastWeek"
                        stroke="#06b6d4"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        dot={false}
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400 text-xs">
              No attendance records (N/A)
            </div>
          )}
        </SectionCard>

        {/* Fee Donut with Interactive Slice Hover */}
        <SectionCard
          title={`Fee Collection (${dateInfo.monthLong})`}
          action={
            <span className="text-[10px] font-bold text-slate-400">
              Target: N/A
            </span>
          }
        >
          {charts?.feeDonut && charts.feeDonut.length > 0 && charts.feeDonut.some((d) => d.value > 0) ? (
            <>
              <div className="relative h-44 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={charts.feeDonut}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                      onMouseEnter={(_, index) => setActiveFeeSlice(charts.feeDonut[index])}
                    >
                      {charts.feeDonut.map((e, i) => (
                        <Cell
                          key={i}
                          fill={e.color || "#6366f1"}
                          stroke={activeFeeSlice?.name === e.name ? "#ffffff" : "none"}
                          strokeWidth={2}
                          className="transition-all cursor-pointer"
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {activeFeeSlice && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                    <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                      ₹{activeFeeSlice.value.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {activeFeeSlice.name}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-1.5 border-t border-slate-200 pt-3 text-xs dark:border-slate-800/80">
                {charts.feeDonut.map((slice) => {
                  const isSelected = activeFeeSlice?.name === slice.name;
                  return (
                    <div
                      key={slice.name}
                      onClick={() => setActiveFeeSlice(slice)}
                      className={`flex items-center justify-between p-1 rounded-lg cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-slate-100 dark:bg-slate-800/80 font-bold text-slate-900 dark:text-white"
                          : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/40"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: slice.color || "#6366f1" }}
                        />
                        {slice.name}
                      </span>
                      <span className="font-semibold">
                        ₹{slice.value.toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="h-44 flex items-center justify-center text-slate-400 text-xs">
              No fee data recorded (N/A)
            </div>
          )}
        </SectionCard>

        {/* Students by Class with Interactive View Switcher */}
        <SectionCard
          title="Students by Class"
          action={
            <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-0.5 text-[10px] dark:bg-slate-800">
              <button
                onClick={() => setClassChartType("donut")}
                className={`rounded p-1 transition-all ${
                  classChartType === "donut"
                    ? "bg-white text-indigo-600 shadow-xs dark:bg-slate-700 dark:text-white"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
                title="Donut View"
              >
                <PieIcon size={12} />
              </button>
              <button
                onClick={() => setClassChartType("bar")}
                className={`rounded p-1 transition-all ${
                  classChartType === "bar"
                    ? "bg-white text-indigo-600 shadow-xs dark:bg-slate-700 dark:text-white"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
                title="Bar Chart View"
              >
                <BarChart3 size={12} />
              </button>
            </div>
          }
        >
          {charts?.classDistribution && charts.classDistribution.length > 0 ? (
            classChartType === "donut" ? (
              <div className="grid grid-cols-2 gap-4 items-center">
                <div className="space-y-1.5 text-xs">
                  {charts.classDistribution.map((cls) => (
                    <div key={cls.class} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: cls.color || "#6366f1" }}
                        />
                        <span className="truncate font-medium text-slate-700 dark:text-slate-300">
                          {cls.class}
                        </span>
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {cls.count}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="relative h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={charts.classDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={48}
                        outerRadius={68}
                        paddingAngle={3}
                        dataKey="count"
                      >
                        {charts.classDistribution.map((e, i) => (
                          <Cell key={i} fill={e.color || "#6366f1"} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "#0f172a",
                          border: "1px solid #334155",
                          borderRadius: "10px",
                          fontSize: "11px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.classDistribution} layout="vertical">
                    <XAxis type="number" stroke="#64748b" fontSize={9} hide />
                    <YAxis
                      dataKey="class"
                      type="category"
                      stroke="#64748b"
                      fontSize={10}
                      tickLine={false}
                      width={55}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#0f172a",
                        border: "1px solid #334155",
                        borderRadius: "10px",
                        fontSize: "11px",
                      }}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                      {charts.classDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || "#6366f1"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )
          ) : (
            <div className="h-44 flex items-center justify-center text-slate-400 text-xs">
              No class distribution records (N/A)
            </div>
          )}
        </SectionCard>
      </div>

      {/* ─── QUICK STATS ACCORDION BAR ────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          { e: "🏫", l: "Active Classes", v: "N/A", s: "N/A", sc: "text-slate-500", bg: "bg-emerald-500/10" },
          { e: "📋", l: "Today's Classes", v: "N/A", s: "N/A", sc: "text-slate-500 dark:text-slate-400", bg: "bg-blue-500/10" },
          { e: "📅", l: "Upcoming Exams", v: "N/A", s: "N/A", sc: "text-slate-500", bg: "bg-purple-500/10" },
          { e: "📝", l: "Assignments", v: "N/A", s: "N/A", sc: "text-slate-500", bg: "bg-pink-500/10" },
          { e: "📖", l: "Library Issued", v: "N/A", s: "N/A", sc: "text-slate-500 dark:text-slate-400", bg: "bg-amber-500/10" },
          { e: "🚌", l: "Transport Trips", v: "N/A", s: "N/A", sc: "text-slate-500", bg: "bg-indigo-500/10" },
          { e: "🏢", l: "Hostel Beds", v: "N/A", s: "N/A", sc: "text-slate-500", bg: "bg-emerald-500/10" },
          { e: "🏅", l: "Certificates", v: "N/A", s: "N/A", sc: "text-slate-500 dark:text-slate-400", bg: "bg-rose-500/10" },
        ].map(({ e, l, v, s, sc, bg }) => (
          <div
            key={l}
            className="group relative space-y-1 rounded-2xl border border-slate-200/90 bg-white p-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-400 hover:shadow-md dark:border-slate-800/80 dark:bg-[#0f172a]"
          >
            <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center text-xs transition-transform duration-200 group-hover:scale-110`}>
              {e}
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block truncate">
              {l}
            </span>
            <h4 className="text-lg font-black text-slate-900 dark:text-white">
              {v}
            </h4>
            <span className={`text-[9px] font-bold block truncate ${sc}`}>
              {s}
            </span>
          </div>
        ))}
      </div>

      {/* ─── INCOME VS EXPENSES & ANNOUNCEMENTS ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SectionCard
            title={`Income & Expense Flow (${dateInfo.monthShort} ${dateInfo.year})`}
            action={
              <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                Net Surplus: N/A
              </span>
            }
          >
            {charts?.incomeExpense && charts.incomeExpense.length > 0 ? (
              <>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={charts.incomeExpense}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                      <XAxis dataKey="month" stroke="#64748b" fontSize={10} tickLine={false} />
                      <YAxis
                        stroke="#64748b"
                        fontSize={10}
                        tickLine={false}
                        tickFormatter={(v) => `₹${v / 1000}k`}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "#0f172a",
                          border: "1px solid #334155",
                          borderRadius: "12px",
                          fontSize: "11px",
                        }}
                        formatter={(val) => [`₹${val.toLocaleString()}`, ""]}
                      />
                      <Bar
                        dataKey="income"
                        name="Income"
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="expense"
                        name="Expense"
                        fill="#ef4444"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-end gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Income
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Expense
                  </span>
                </div>
              </>
            ) : (
              <div className="h-56 flex items-center justify-center text-slate-400 text-xs">
                No financial records recorded (N/A)
              </div>
            )}
          </SectionCard>
        </div>

        <SectionCard
          title="Announcements & Notices"
          action={
            <div className="flex items-center gap-1">
              {["all", "academic", "campus"].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setAnnouncementFilter(tag)}
                  className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase transition-all ${
                    announcementFilter === tag
                      ? "bg-indigo-600 text-white"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          }
        >
          {filteredAnnouncements.length > 0 ? (
            <div className="space-y-2.5 text-xs">
              {filteredAnnouncements.map((a, i) => (
                <div
                  key={a._id || a.id || i}
                  className="group flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 transition-all hover:bg-slate-100 hover:border-indigo-300 dark:border-slate-800/60 dark:bg-slate-800/30 dark:hover:bg-slate-800/70"
                >
                  <div
                    className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-sm flex-shrink-0 transition-transform group-hover:scale-105"
                  >
                    {a.icon || "📢"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-slate-900 dark:text-white truncate">
                      {a.title}
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      {a.desc || a.content || ""}
                    </p>
                    <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 mt-1 block">
                      {a.date || (a.createdAt ? new Date(a.createdAt).toLocaleDateString() : "N/A")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-44 flex items-center justify-center text-slate-400 text-xs">
              No notices or bulletins published (N/A)
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
};

export default HomeTab;
