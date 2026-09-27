import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { BookOpen, Users, CalendarCheck, FileText, Clock } from "lucide-react";
import StatCard from "../components/StatCard.jsx";
import SectionCard from "../components/SectionCard.jsx";
import api from "../../../services/api.js";
import { getUserFromStorage } from "../../../config/access.jsx";

const getCurrentDayId = () => {
  const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const todayName = dayNames[new Date().getDay()];
  return todayName === "sunday" ? "monday" : todayName;
};

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth?.user);
  const user = authUser || getUserFromStorage() || {};

  const [timetables, setTimetables] = useState([]);
  const [loadingSchedule, setLoadingSchedule] = useState(true);

  useEffect(() => {
    let isMounted = true;
    api.get("/periods/timetable")
      .then((res) => {
        if (isMounted && res.data?.timetables) {
          setTimetables(res.data.timetables);
        }
      })
      .catch(() => null)
      .finally(() => {
        if (isMounted) setLoadingSchedule(false);
      });

    return () => { isMounted = false; };
  }, []);

  const todayDay = useMemo(() => getCurrentDayId(), []);

  // Filter teacher's allocations for today
  const teacherTodayAllocations = useMemo(() => {
    if (!timetables.length) return [];
    const tId = String(user._id || user.id || user.teacherId || "");
    const tName = (user.name || "").toLowerCase();

    const result = [];
    timetables.forEach((tt) => {
      const clsName = tt.className || tt.classSectionKey || "Class";
      (tt.allocations || []).forEach((alloc) => {
        if (alloc.day === todayDay && alloc.subject) {
          const isMatch =
            (alloc.teacherId && String(alloc.teacherId) === tId) ||
            (alloc.teacherName && alloc.teacherName.toLowerCase() === tName);

          if (isMatch) {
            result.push({
              period: `Slot #${alloc.periodOrder}`,
              time: alloc.startTime && alloc.endTime ? `${alloc.startTime} - ${alloc.endTime}` : "Scheduled",
              class: clsName,
              subject: alloc.subject,
              room: alloc.roomNo || clsName,
              status: "upcoming",
            });
          }
        }
      });
    });

    return result;
  }, [timetables, user, todayDay]);

  const displaySchedule = teacherTodayAllocations;
  const assignedClasses = Array.from(new Set(displaySchedule.map((s) => s.class)));
  const assignedClassesText = assignedClasses.join(", ") || "N/A";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={BookOpen}
          label="Assigned Classes"
          value={assignedClasses.length > 0 ? `${assignedClasses.length} Classes` : "N/A"}
          sub={assignedClassesText}
          iconBg="bg-indigo-600/20"
          iconColor="text-indigo-400"
        />
        <StatCard icon={Users} label="Total Students" value="N/A" sub="Across assigned classes" iconBg="bg-emerald-600/20" iconColor="text-emerald-400" />
        <StatCard icon={CalendarCheck} label="Attendance Status" value="N/A" sub="Daily roll call" iconBg="bg-amber-600/20" iconColor="text-amber-400" />
        <StatCard icon={FileText} label="Pending Assessments" value="N/A" sub="Assessments & Homework" iconBg="bg-rose-600/20" iconColor="text-rose-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <SectionCard title={`Today's Teaching Schedule (${todayDay.toUpperCase()})`} action="View Full Timetable" onAction={() => navigate('/timetable')}>
            {displaySchedule.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 font-semibold">
                No teaching schedule assigned for today (N/A)
              </div>
            ) : (
              <div className="space-y-3">
                {displaySchedule.map((item, idx) => (
                  <div key={idx} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${
                        item.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                        item.status === 'ongoing' ? 'bg-indigo-500/20 text-indigo-400 animate-pulse' : 'bg-slate-700/50 text-slate-400'
                      }`}>
                        {item.period}
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">{item.subject} — <span className="text-indigo-600 dark:text-indigo-400">{item.class}</span></h4>
                        <p className="text-xs text-slate-400">{item.time} · Room: {item.room}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate('/attendance')}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all cursor-pointer"
                    >
                      Mark Attendance
                    </button>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard title="Class Teacher Overview">
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between rounded-lg bg-slate-100 p-2.5 dark:bg-slate-800/40">
                <span className="text-slate-400">Present Today</span>
                <span className="font-bold text-slate-400">N/A</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-100 p-2.5 dark:bg-slate-800/40">
                <span className="text-slate-400">Absent Today</span>
                <span className="font-bold text-slate-400">N/A</span>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
