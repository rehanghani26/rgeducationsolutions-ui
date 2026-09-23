import React, { useState, useEffect } from "react";
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
} from "recharts";
import { GraduationCap, Activity, UserCheck, Clock } from "lucide-react";
import api from "../../../services/api.js";
import StatCard from "../components/StatCard.jsx";
import SectionCard from "../components/SectionCard.jsx";
import Loader from "../../../components/ui/Loader.jsx";

const StudentsTab = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    api
      .get("/dashboard/students-analytics")
      .then((res) => {
        if (isMounted && res.data?.data) {
          setData(res.data.data);
        }
      })
      .catch(() => null)
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm dark:border-slate-800/80 dark:bg-[#0f172a]">
        <Loader fullPage size="lg" text="Loading student analytics..." />
      </div>
    );
  }

  const total = data?.totalStudents ?? 0;
  const active = data?.activeStudents ?? 0;
  const newAdmissions = data?.newAdmissionsCount ?? 0;
  const genderStats = data?.genderStats || { Male: 0, Female: 0, Other: 0 };

  const genderPieSlices = [
    { name: "Male Students", value: genderStats.Male || 0, color: "#6366f1" },
    {
      name: "Female Students",
      value: genderStats.Female || 0,
      color: "#ec4899",
    },
    { name: "Other", value: genderStats.Other || 0, color: "#a855f7" },
  ].filter((s) => s.value > 0);

  const enrollmentGrowth = data?.enrollmentGrowth || [];
  const classDistribution = data?.classDistribution || [];
  const attendanceByClass = data?.attendanceByClass || [];
  const recentStudents = data?.recentlyAdmittedStudents || [];

  return (
    <div className="space-y-6">
      {/* Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={GraduationCap}
          label="Total Enrolled Students"
          value={total.toLocaleString()}
          sub={`Active: ${active.toLocaleString()} | Inactive: ${(total - active).toLocaleString()}`}
          iconBg="bg-indigo-600/20"
          iconColor="text-indigo-400"
        />
        <StatCard
          icon={Activity}
          label="Daily Attendance Avg"
          value={data?.dailyAttendanceAvg || "N/A"}
          sub="Verified Daily Tracking"
          iconBg="bg-emerald-600/20"
          iconColor="text-emerald-400"
        />
        <StatCard
          icon={UserCheck}
          label="New Admissions (30 Days)"
          value={newAdmissions.toLocaleString()}
          sub="Verified DB Applications"
          iconBg="bg-cyan-600/20"
          iconColor="text-cyan-400"
        />
        <StatCard
          icon={Clock}
          label="Active Student Leaves"
          value={(data?.activeLeavesCount ?? 0).toString()}
          sub="Medical & Family Leaves"
          iconBg="bg-rose-600/20"
          iconColor="text-rose-400"
        />
      </div>

      {/* Row 1: 3 Rich Visual Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graph 1: Enrollment Growth Area Chart */}
        <SectionCard title="Student Enrollment Growth Trend">
          <div className="h-52">
            {enrollmentGrowth.length > 0 &&
            enrollmentGrowth.some((e) => e.enrolled > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={enrollmentGrowth}>
                  <defs>
                    <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      background: "#0f172a",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="enrolled"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#growthGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center gap-1">
                <span className="text-xl font-bold text-slate-500">N/A</span>
                <span className="text-xs text-slate-500">
                  No enrollment trend data
                </span>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Graph 2: Class-Wise Distribution Bar Chart */}
        <SectionCard title="Student Count by Class Level">
          <div className="h-52">
            {classDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      background: "#0f172a",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center gap-1">
                <span className="text-xl font-bold text-slate-500">N/A</span>
                <span className="text-xs text-slate-500">
                  No class distribution data
                </span>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Graph 3: Gender Distribution Donut Chart */}
        <SectionCard title="Student Gender Ratio Breakdown">
          <div className="h-44 flex items-center justify-center">
            {genderPieSlices.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderPieSlices}
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {genderPieSlices.map((e, i) => (
                      <Cell key={i} fill={e.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#0f172a",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center gap-1">
                <span className="text-xl font-bold text-slate-500">N/A</span>
                <span className="text-xs text-slate-500">
                  No gender data available
                </span>
              </div>
            )}
          </div>
          <div className="flex justify-center gap-4 border-t border-slate-200 pt-2 text-xs font-semibold dark:border-slate-800">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
              <span>Male: {genderStats.Male}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
              <span>Female: {genderStats.Female}</span>
            </div>
            {genderStats.Other > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                <span>Other: {genderStats.Other}</span>
              </div>
            )}
          </div>
        </SectionCard>
      </div>

      {/* Row 2: Attendance Rate by Class Level & Recently Admitted Students */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SectionCard title="Attendance Rate by Class Level (%)">
            <div className="h-52">
              {attendanceByClass.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attendanceByClass}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="class" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        background: "#0f172a",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="rate" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center gap-1">
                  <span className="text-xl font-bold text-slate-500">N/A</span>
                  <span className="text-xs text-slate-500">
                    No class attendance logged
                  </span>
                </div>
              )}
            </div>
          </SectionCard>
        </div>

        {/* Recently Admitted Students Widget */}
        <SectionCard title="Recently Admitted Students">
          <div className="space-y-2 text-xs">
            {recentStudents.length > 0 ? (
              recentStudents.map((s, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-2.5 transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {s.name}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {s.admissionNumber || s.roll} · {s.class}{" "}
                      {s.section && s.section !== "N/A" ? `- ${s.section}` : ""}
                    </p>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {s.createdAt
                      ? new Date(s.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      : "Recent"}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-8 flex flex-col items-center justify-center gap-1 text-xs text-slate-500">
                <span className="text-base font-bold text-slate-500">N/A</span>
                <span>No recently admitted students</span>
              </div>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

export default StudentsTab;
