import React, { useState, useEffect, useMemo } from "react";
import { Users, UserCheck, Clock, Briefcase } from "lucide-react";
import StatCard from "../components/StatCard.jsx";
import SectionCard from "../components/SectionCard.jsx";
import Loader from "../../../components/ui/Loader.jsx";
import api from "../../../services/api.js";
const StaffTab = () => {
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);

  const currentMonth = useMemo(() => {
    return new Date().toLocaleDateString("en-US", { month: "short" });
  }, []);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      api.get("/teachers").catch(() => null),
      api.get("/leaves").catch(() => null),
    ])
      .then(([teachRes, leaveRes]) => {
        if (isMounted) {
          const list = teachRes?.data?.teachers || teachRes?.data?.data || [];
          if (Array.isArray(list)) {
            setTeachers(
              list.map((t) => ({
                id: t.employeeId || t._id?.slice(-5) || "EMP",
                name: t.name || `${t.firstName || ""} ${t.lastName || ""}`.trim() || "Faculty Member",
                designation: t.designation || "Teacher",
                dept: t.department || "Academic",
              }))
            );
          }

          const leaves = leaveRes?.data?.leaves || leaveRes?.data?.data || [];
          if (Array.isArray(leaves)) {
            setLeaveRequests(leaves);
          }
        }
      })
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
          value={teachers.length > 0 ? teachers.length.toString() : "N/A"}
          badge="Full-Time"
          sub={teachers.length > 0 ? "Institutional Staff" : "N/A"}
          iconBg="bg-indigo-600/20"
          iconColor="text-indigo-400"
        />
        <StatCard
          icon={UserCheck}
          label="Present Today"
          value="N/A"
          badge="Attendance"
          sub="N/A"
          iconBg="bg-emerald-600/20"
          iconColor="text-emerald-400"
        />
        <StatCard
          icon={Clock}
          label="Faculty On Leave"
          value={leaveRequests.length > 0 ? leaveRequests.length.toString() : "N/A"}
          badge="Leaves"
          sub="N/A"
          iconBg="bg-amber-600/20"
          iconColor="text-amber-400"
        />
        <StatCard
          icon={Briefcase}
          label={`Monthly Payroll (${currentMonth})`}
          value="N/A"
          badge={currentMonth}
          sub="N/A"
          iconBg="bg-cyan-600/20"
          iconColor="text-cyan-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Faculty Directory & Designations">
          {teachers.length > 0 ? (
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
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs">
              No faculty members found (N/A)
            </div>
          )}
        </SectionCard>

        <SectionCard title="Staff Leave Requests & Approvals">
          {leaveRequests.length > 0 ? (
            <div className="space-y-2 text-xs">
              {leaveRequests.map((l, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-800/40"
                >
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{l.name || "Staff Member"}</p>
                    <p className="text-[10px] text-slate-400">{l.type || "Leave"} · {l.from || "N/A"} - {l.to || "N/A"}</p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                      l.status === 'approved'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-amber-500/10 text-amber-400'
                    }`}
                  >
                    {l.status || "Pending"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs">
              No staff leave requests (N/A)
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
};

export default StaffTab;
