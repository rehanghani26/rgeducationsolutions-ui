import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import {
  User,
  BookOpen,
  CalendarCheck,
  DollarSign,
  Lock,
  Activity,
  FileText
} from "lucide-react";
import DetailPageLayout, {
  EditButton,
} from "../../components/ui/DetailPageLayout.jsx";
import PermissionMatrix from "../../components/ui/PermissionMatrix.jsx";
import ActivityTimeline from "../../components/ui/ActivityTimeline.jsx";
import StatsCard from "../../components/ui/StatsCard.jsx";
import { permissionOptions } from "./TeacherForm.jsx";
import { getTeacherById, getTeacherActivity } from "../../services";
import api from "../../services/api.js";
import { mockTeachers } from "../../data/mockData.js";
import Loader from "../../components/ui/Loader.jsx";

const InfoGrid = ({ items }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {items.map(([label, value]) => (
      <div
        key={label}
        className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-800"
      >
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-semibold mt-0.5 text-slate-800 dark:text-slate-100">{value || "—"}</p>
      </div>
    ))}
  </div>
);

import { useSelector } from "react-redux";
import { getUserFromStorage, getUserRole } from "../../config/access.jsx";
import { ROLES } from "../../constants/roles.js";

const TeacherDetail = () => {
  const { teacherId } = useParams();
  const authUser = useSelector((state) => state.auth?.user);
  const user = authUser || getUserFromStorage() || { role: "super-admin" };
  const userRole = user?.role || (getUserFromStorage()?.role) || "";

  const canSeeCredentials = [ROLES.SUPER_ADMIN, "superadmin", ROLES.STUDENT].includes(userRole);

  const [activeTab, setActiveTab] = useState("overview");
  const [teacher, setTeacher] = useState(null);
  const [activity, setActivity] = useState(null);
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(false);

  // Direct useEffect API Fetch
  useEffect(() => {
    if (!teacherId) return;
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const [res, actRes, ttRes] = await Promise.all([
          getTeacherById(teacherId).catch(() => null),
          getTeacherActivity(teacherId).catch(() => null),
          api.get('/periods/timetable').catch(() => null),
        ]);
        const foundTeacher =
          res?.teacher ||
          res?.data?.teacher ||
          mockTeachers.find((t) => t.id === teacherId || t._id === teacherId) ||
          mockTeachers[0];
        setTeacher(foundTeacher);
        setActivity(actRes?.data || actRes || { logs: [], loginHistory: [] });
        if (ttRes?.data?.timetables) {
          setTimetables(ttRes.data.timetables);
        }
      } catch (err) {
        console.error("Error loading teacher detail:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [teacherId]);

  // Derive dynamic teacher allocations from Class Timetables
  const teacherAllocations = useMemo(() => {
    if (!teacher) return [];
    const tId = String(teacher._id || teacher.id || teacher.teacherId || '');
    const tName = (teacher.name || '').toLowerCase();

    const matches = [];
    timetables.forEach((tt) => {
      const clsName = tt.className || tt.classSectionKey || 'Class';
      (tt.allocations || []).forEach((alloc) => {
        const isTeacherMatch =
          (alloc.teacherId && String(alloc.teacherId) === tId) ||
          (alloc.teacherName && alloc.teacherName.toLowerCase() === tName);

        if (isTeacherMatch && alloc.subject) {
          matches.push({
            day: alloc.day,
            periodOrder: alloc.periodOrder,
            subject: alloc.subject,
            className: clsName,
            roomNo: alloc.roomNo || clsName,
            startTime: alloc.startTime,
            endTime: alloc.endTime,
          });
        }
      });
    });

    return matches;
  }, [teacher, timetables]);

  // Group allocations into unique Courses & Curriculum
  const groupedCourses = useMemo(() => {
    if (!teacherAllocations.length) return [];

    const map = {};
    teacherAllocations.forEach((item) => {
      const groupKey = `${item.subject}__${item.className}`;
      if (!map[groupKey]) {
        const subPrefix = item.subject
          .substring(0, 4)
          .toUpperCase()
          .replace(/[^A-Z]/g, '');
        const clsNum = item.className.replace(/[^0-9]/g, '') || '10';
        const courseCode = `${subPrefix || 'CRS'}-${clsNum}`;

        map[groupKey] = {
          key: groupKey,
          courseCode,
          subject: item.subject,
          className: item.className,
          roomNo: item.roomNo,
          slotsCount: 0,
          daysSet: new Set(),
        };
      }
      map[groupKey].slotsCount += 1;
      if (item.day) {
        map[groupKey].daysSet.add(item.day.substring(0, 3).toUpperCase());
      }
    });

    return Object.values(map).map((c) => ({
      ...c,
      daysList: Array.from(c.daysSet).join(', '),
    }));
  }, [teacherAllocations]);

  const classesTaughtText = useMemo(() => {
    if (groupedCourses.length > 0) {
      const uniqueClasses = Array.from(new Set(groupedCourses.map((c) => c.className)));
      return uniqueClasses.join(', ');
    }
    return teacher?.classesAssignedText || teacher?.classesTaught || "Not Allocated Yet";
  }, [groupedCourses, teacher]);

  const totalWeeklyLecturesText = useMemo(() => {
    if (teacherAllocations.length > 0) {
      return `${teacherAllocations.length} Period Slots / Week`;
    }
    return teacher?.weeklyLectures || "0 Period Hours";
  }, [teacherAllocations, teacher]);

  const tabs = [
    { id: "overview", label: "Overview", icon: User },
    { id: "academic", label: "Academic & Classes", icon: BookOpen },
    { id: "permissions", label: "Permissions", icon: Lock },
    { id: "payroll", label: "Payroll & Salary", icon: DollarSign },
    { id: "attendance", label: "Attendance & Leaves", icon: CalendarCheck },
    { id: "activity", label: "Activity Logs", icon: Activity },
  ];

  const renderTab = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatsCard
                title="Employee ID"
                value={teacher?.teacherId || teacher?.employeeId || "TCH-001"}
              />
              <StatsCard
                title="Designation"
                value={teacher?.designation || "HOD"}
              />
              <StatsCard
                title="Experience"
                value={teacher?.experience || "14 Years"}
              />
              <StatsCard
                title="Class Teacher"
                value={teacher?.classTeacher || "Grade 10-A"}
              />
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Faculty Information</h3>
              <InfoGrid
                items={[
                  ["Full Name", teacher?.name],
                  ["Email Address", canSeeCredentials ? (teacher?.email || "teacher@school.local") : "••••••••@school.local"],
                  ["Account Password", canSeeCredentials ? (teacher?.password || teacher?.tempPassword || "Tch@2026!pass") : "•••••••• (Restricted to Super Admin & Student)"],
                  ["Phone Number", teacher?.phone],
                  ["Alternate Contact", teacher?.alternatePhone || "+91 98111 99999"],
                  ["Subject Specialization", teacher?.subject],
                  ["Qualification", teacher?.qualification],
                  ["Department", teacher?.department || "Islamic Theology"],
                  [
                    "Date of Joining",
                    teacher?.joiningDate
                      ? format(new Date(teacher.joiningDate), "MMM d, yyyy")
                      : "Jul 15, 2012",
                  ],
                  ["Residential Address", teacher?.address || "Civil Lines, Main Campus Road, City"],
                ]}
              />
            </div>
          </div>
        );
      case "academic":
        return (
          <div className="space-y-6">
            <InfoGrid
              items={[
                [
                  "Assigned Department",
                  teacher?.department || "Academic Faculty",
                ],
                ["Primary Subject", teacher?.subject || "All Subjects"],
                [
                  "Class Teacher Of",
                  teacher?.classTeacherOf || teacher?.classTeacher || "None Assigned",
                ],
                [
                  "Classes Taught (Timetable)",
                  classesTaughtText,
                ],
                ["Weekly Lectures Allocated", totalWeeklyLecturesText],
              ]}
            />

            <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-2">
                    <BookOpen size={16} className="text-indigo-500" />
                    Allocated Courses & Curriculum (Live Timetable)
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Dynamically calculated from saved class schedule timetables
                  </p>
                </div>
                <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {groupedCourses.length} Dynamic Course{groupedCourses.length === 1 ? '' : 's'} Allocated
                </span>
              </div>

              {groupedCourses.length === 0 ? (
                <div className="bg-amber-50/60 dark:bg-amber-950/30 p-5 rounded-xl border border-amber-200 dark:border-amber-900/50 text-center space-y-2">
                  <p className="text-xs font-bold text-amber-800 dark:text-amber-300">
                    No Timetable Allocations Assigned for {teacher?.name || 'this Teacher'} Yet
                  </p>
                  <p className="text-[11px] text-amber-600 dark:text-amber-400">
                    Assign subjects and periods to this teacher in Timetable Management to automatically populate dynamic course allocations.
                  </p>
                  <a
                    href="/timetable"
                    className="inline-flex items-center gap-1.5 text-xs font-extrabold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2 rounded-xl shadow-xs hover:bg-slate-50 transition-all"
                  >
                    <BookOpen size={14} /> Open Timetable Management
                  </a>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                  {groupedCourses.map((course) => (
                    <div
                      key={course.key}
                      className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-2.5 hover:border-indigo-400 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900/50 px-2.5 py-0.5 rounded-md">
                          {course.courseCode}
                        </span>
                        <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 px-2 py-0.5 rounded-md">
                          {course.slotsCount} Period Slot{course.slotsCount > 1 ? 's' : ''}/wk
                        </span>
                      </div>
                      <div>
                        <h5 className="font-extrabold text-sm text-slate-900 dark:text-white leading-snug">
                          {course.subject}
                        </h5>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                          {course.className} • Room {course.roomNo}
                        </p>
                      </div>
                      <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex justify-between items-center">
                        <span>Active Days: <strong className="text-slate-700 dark:text-slate-200">{course.daysList}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      case "permissions":
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Faculty Module Access Control</h3>
            <PermissionMatrix
              options={permissionOptions}
              permissions={teacher?.permissions || ["dashboard", "attendance", "exam", "marks", "homework"]}
              readOnly
            />
          </div>
        );
      case "payroll":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatsCard title="Monthly Basic Salary" value={`₹${Number(teacher?.salary || 68000).toLocaleString()}`} />
              <StatsCard title="Allowances" value="₹8,500" />
              <StatsCard title="Net Take-Home" value={`₹${Number((teacher?.salary || 68000) + 8500).toLocaleString()}`} />
            </div>

            <InfoGrid
              items={[
                [
                  "Monthly Base Salary",
                  teacher?.salary
                    ? `₹${Number(teacher.salary).toLocaleString()}`
                    : "₹68,000",
                ],
                ["Employment Status", teacher?.status || "Active"],
                ["Bank Account Linked", "HDFC Bank (A/C: ****5592)"],
                ["Provident Fund (PF)", "PF-IN-889104"],
              ]}
            />
          </div>
        );
      case "attendance":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatsCard title="Working Days" value="24 Days / Mo" />
              <StatsCard title="Present Days" value="23 Days" />
              <StatsCard title="Approved Leaves" value="1 Day" />
            </div>
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
              ✅ Faculty Attendance Rate: 96% (Fully Compliant)
            </div>
          </div>
        );
      case "activity":
        return (
          <ActivityTimeline
            logs={activity?.logs || []}
            loginHistory={activity?.loginHistory || []}
          />
        );
      default:
        return null;
    }
  };

  return (
    <DetailPageLayout
      loading={loading}
      backTo="/teachers"
      title={teacher?.name || "Teacher"}
      subtitle={`${teacher?.teacherId || teacher?.employeeId || ""} · ${teacher?.designation || ""} · ${teacher?.subject || ""}`}
      status={teacher?.status}
      avatar={teacher?.name?.charAt(0)}
      actions={<EditButton to={`/teachers/${teacherId}/edit`} />}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {renderTab()}
    </DetailPageLayout>
  );
};

export default TeacherDetail;
