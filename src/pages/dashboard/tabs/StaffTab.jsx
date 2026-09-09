import React, { useState, useEffect, useMemo } from "react";
import { Users, UserCheck, Clock, Briefcase } from "lucide-react";
import StatCard from "../components/StatCard.jsx";
import SectionCard from "../components/SectionCard.jsx";
import Loader from "../../../components/ui/Loader.jsx";
import api from "../../../services/api.js";
import { recentTeachers as defaultTeachers, leaveRequests } from "../data/dashboardData.js";

const StaffTab = () => {
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState(defaultTeachers);

  const currentMonth = useMemo(() => {
    return new Date().toLocaleDateString("en-US", { month: "short" });
  }, []);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    api.get("/teachers")
      .then((res) => {
        if (isMounted) {
          const list = res.data?.teachers || res.data?.data || [];
          if (list.length > 0) {
            setTeachers(
              list.slice(0, 8).map((t) => ({
                id: t.employeeId || t._id?.slice(-5) || "EMP",
                name: t.name || `${t.firstName || ""} ${t.lastName || ""}`.trim() || "Faculty Member",
                designation: t.designation || "Teacher",
                dept: t.department || "Academic",
              }))
            );
          }
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
        <Loader fullPage size="lg" text="Loading faculty & staff directory..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total Faculty & Staff"
          value="72"
          badge="Full-Time"
          sub="Verified Institutional Staff"
          iconBg="bg-indigo-600/20"
          iconColor="text-indigo-400"
        />
        <StatCard
          icon={UserCheck}
          label="Present Today"
          value="68 / 72"
          badge="94.4%"
          sub="Faculty Campus Presence"
          iconBg="bg-emerald-600/20"
          iconColor="text-emerald-400"
        />
        <StatCard
          icon={Clock}
          label="Faculty On Leave"
          value="4"
          badge="Leaves"
          sub="2 Approved, 2 Pending"
          iconBg="bg-amber-600/20"
          iconColor="text-amber-400"
        />
        <StatCard
          icon={Briefcase}
          label={`Monthly Payroll (${currentMonth})`}
          value="₹18,42,500"
          badge={currentMonth}
          sub="All Departments Disbursed"
          iconBg="bg-cyan-600/20"
          iconColor="text-cyan-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Faculty Directory & Designations">
          <div className="space-y-2 text-xs">
            {teachers.map((t, idx) => (
              <div
                key={t.id || idx}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-800/40"
              >
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{t.name}</p>
                  <p className="text-[10px] text-slate-400">{t.designation} · {t.dept}</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400">
                  {t.id}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Staff Leave Requests & Approvals">
          <div className="space-y-2 text-xs">
            {leaveRequests.map((l, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-800/40"
              >
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{l.name}</p>
                  <p className="text-[10px] text-slate-400">{l.type} · {l.from} - {l.to}</p>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                    l.status === 'approved'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-amber-500/10 text-amber-400'
                  }`}
                >
                  {l.status}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

export default StaffTab;
