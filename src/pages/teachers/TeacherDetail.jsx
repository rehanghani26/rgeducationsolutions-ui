import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "react-toastify";
import {
  User,
  BookOpen,
  CalendarCheck,
  DollarSign,
  Lock,
  Activity,
  FileText,
  School,
  Clock,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
  Check,
  X,
  Calendar,
} from "lucide-react";
import DetailPageLayout, {
  EditButton,
} from "../../components/ui/DetailPageLayout.jsx";
import PermissionMatrix from "../../components/ui/PermissionMatrix.jsx";
import ActivityTimeline from "../../components/ui/ActivityTimeline.jsx";
import StatsCard from "../../components/ui/StatsCard.jsx";
import Modal from "../../components/ui/Modal.jsx";
import { permissionOptions } from "./TeacherForm.jsx";
import { getTeacherById, getTeacherActivity, getTeacherClassHistory } from "../../services";
import { getApplicantLeaveProfile, reviewLeave, requestLeave } from "../../services/leaveService.js";
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
  const canReview = [ROLES.SUPER_ADMIN, "superadmin", "school-admin", "admin", "principal", "director"].includes(
    String(userRole || "").toLowerCase()
  );

  const [activeTab, setActiveTab] = useState("overview");
  const [teacher, setTeacher] = useState(null);
  const [activity, setActivity] = useState(null);
  const [timetables, setTimetables] = useState([]);
  const [classHistory, setClassHistory] = useState({ currentClassRoom: null, history: [] });
  const [loading, setLoading] = useState(false);

  // Live Teacher Leave Management State
  const [leaveData, setLeaveData] = useState({
    profile: null,
    summary: { totalApplications: 0, approvedDays: 0, pendingCount: 0, rejectedCount: 0 },
    activeLeave: null,
    requests: [],
  });
  const [leaveLoading, setLeaveLoading] = useState(false);

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedLeaveForReview, setSelectedLeaveForReview] = useState(null);
  const [reviewAction, setReviewAction] = useState("approved"); // "approved" | "rejected"
  const [reviewRemarks, setReviewRemarks] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Apply Leave Modal State
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [applySubmitting, setApplySubmitting] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    category: "Casual Leave",
    startDate: "",
    endDate: "",
    isHalfDay: false,
    halfDaySession: "first-half",
    reason: "",
  });

  // Fetch Teacher Leave Profile
  const fetchTeacherLeaves = useCallback(async () => {
    if (!teacherId) return;
    setLeaveLoading(true);
    try {
      const res = await getApplicantLeaveProfile(teacherId);
      const payload = res?.data || res;
      if (payload && (payload.success || payload.summary)) {
        setLeaveData({
          profile: payload.applicant || null,
          summary: payload.summary || { totalApplications: 0, approvedDays: 0, pendingCount: 0, rejectedCount: 0 },
          activeLeave: payload.activeLeave || payload.activeLeaveNow || null,
          requests: payload.requests || payload.records || [
            ...(payload.pendingRequests || []),
            ...(payload.history || []),
          ],
        });
      }
    } catch (e) {
      console.error("Failed to load teacher leave data:", e);
    } finally {
      setLeaveLoading(false);
    }
  }, [teacherId]);

  // Direct useEffect API Fetch
  useEffect(() => {
    if (!teacherId) return;
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const [res, actRes, ttRes, chRes, leaveRes] = await Promise.all([
          getTeacherById(teacherId).catch(() => null),
          getTeacherActivity(teacherId).catch(() => null),
          api.get('/periods/timetable').catch(() => null),
          getTeacherClassHistory(teacherId).catch(() => null),
          getApplicantLeaveProfile(teacherId).catch(() => null),
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
        if (chRes) {
          setClassHistory(chRes);
        }
        const lPayload = leaveRes?.data || leaveRes;
        if (lPayload && (lPayload.success || lPayload.summary)) {
          setLeaveData({
            profile: lPayload.applicant || null,
            summary: lPayload.summary || { totalApplications: 0, approvedDays: 0, pendingCount: 0, rejectedCount: 0 },
            activeLeave: lPayload.activeLeave || lPayload.activeLeaveNow || null,
            requests: lPayload.requests || lPayload.records || [
              ...(lPayload.pendingRequests || []),
              ...(lPayload.history || []),
            ],
          });
        }
      } catch (err) {
        console.error("Error loading teacher detail:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [teacherId]);

  // Handle Review Leave Request (Approve / Reject)
  const handleReviewLeave = async (e) => {
    e.preventDefault();
    if (!selectedLeaveForReview) return;
    setReviewSubmitting(true);
    try {
      const leaveId = selectedLeaveForReview._id || selectedLeaveForReview.id;
      const res = await reviewLeave(leaveId, {
        status: reviewAction,
        remarks: reviewRemarks,
      });
      if (res && res.success) {
        toast.success(`Leave request ${reviewAction} successfully! Attendance synced.`);
        setReviewModalOpen(false);
        setSelectedLeaveForReview(null);
        setReviewRemarks("");
        fetchTeacherLeaves();
      } else {
        toast.error(res?.message || `Failed to ${reviewAction} leave request.`);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error processing leave review.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Handle Apply Leave on Behalf of Faculty
  const handleApplyLeave = async (e) => {
    e.preventDefault();
    if (!leaveForm.startDate || !leaveForm.endDate) {
      toast.error("Please provide both start and end date.");
      return;
    }
    setApplySubmitting(true);
    try {
      const payload = {
        applicantId: teacher?._id || teacher?.id || teacherId,
        applicantModel: "Teacher",
        applicantName: teacher?.name,
        role: "teacher",
        employeeId: teacher?.teacherId || teacher?.employeeId,
        department: teacher?.department,
        category: leaveForm.category,
        startDate: leaveForm.startDate,
        endDate: leaveForm.endDate,
        isHalfDay: leaveForm.isHalfDay,
        halfDaySession: leaveForm.isHalfDay ? leaveForm.halfDaySession : undefined,
        reason: leaveForm.reason,
      };
      const res = await requestLeave(payload);
      if (res && res.success) {
        toast.success("Teacher leave submitted successfully!");
        setApplyModalOpen(false);
        setLeaveForm({
          category: "Casual Leave",
          startDate: "",
          endDate: "",
          isHalfDay: false,
          halfDaySession: "first-half",
          reason: "",
        });
        fetchTeacherLeaves();
      } else {
        toast.error(res?.message || "Failed to submit teacher leave.");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error submitting leave request.");
    } finally {
      setApplySubmitting(false);
    }
  };

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

            {/* Class Teacher Appointment & History */}
            <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-2">
                    <School size={16} className="text-indigo-500" />
                    Class Teacher Appointments & History
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Class mentor assignments tracked per academic session
                  </p>
                </div>
              </div>

              {/* Current Classroom */}
              {classHistory?.currentClassRoom ? (
                <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-extrabold flex items-center justify-center">
                      <School size={20} />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">
                        Current Class Teacher Appointment
                      </span>
                      <h5 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {classHistory.currentClassRoom.displayName || `${classHistory.currentClassRoom.className} - ${classHistory.currentClassRoom.sectionName}`}
                      </h5>
                      <p className="text-[11px] text-slate-400">
                        Session: {classHistory.currentClassRoom.sessionName} · Room: {classHistory.currentClassRoom.room || '—'}
                      </p>
                    </div>
                  </div>
                  <a
                    href={`/academics/classes/${classHistory.currentClassRoom._id || classHistory.currentClassRoom.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1.5 rounded-lg"
                  >
                    <span>View Class</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 text-xs text-slate-500">
                  Not currently appointed as active class teacher for any session classroom.
                </div>
              )}

              {/* Past Class Teacher History Log */}
              {classHistory?.history?.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-700">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Clock size={12} className="text-indigo-500" />
                    <span>Past Class Teacher History ({classHistory.history.length})</span>
                  </span>
                  <div className="space-y-1.5">
                    {classHistory.history.map((h, hIdx) => (
                      <div
                        key={hIdx}
                        className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200">
                            {h.className} · {h.sectionName} ({h.sessionName})
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Tenure: {new Date(h.startDate).toLocaleDateString()} — {h.endDate ? new Date(h.endDate).toLocaleDateString() : 'Present'}
                          </p>
                        </div>
                        {h.reasonForRemoval && (
                          <span className="text-[10px] text-slate-500 italic max-w-xs truncate">
                            {h.reasonForRemoval}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

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
            {/* Active Leave Notification Banner */}
            {leaveData.activeLeave && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/15 via-indigo-500/10 to-amber-500/10 border border-purple-500/30 flex items-center justify-between gap-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-md">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-purple-700 dark:text-purple-300">
                      Currently On Approved Leave
                    </p>
                    <p className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
                      {leaveData.activeLeave.category} &bull; {leaveData.activeLeave.startDate} to {leaveData.activeLeave.endDate} ({leaveData.activeLeave.totalDays} day{leaveData.activeLeave.totalDays > 1 ? "s" : ""})
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-purple-600 text-white shadow-sm">
                  Active On Leave
                </span>
              </div>
            )}

            {/* Header & Quick Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-extrabold flex items-center justify-center">
                  <CalendarCheck size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Faculty Leave &amp; Attendance Records
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Verified leave requests with idempotent institutional attendance synchronization.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={fetchTeacherLeaves}
                  disabled={leaveLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                >
                  <RefreshCw size={13} className={leaveLoading ? "animate-spin text-indigo-500" : ""} />
                  <span>Refresh</span>
                </button>
                <button
                  type="button"
                  onClick={() => setApplyModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Apply Leave</span>
                </button>
              </div>
            </div>

            {/* Live Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatsCard title="Total Applications" value={leaveData.summary?.totalApplications || 0} />
              <StatsCard title="Approved Leave Days" value={leaveData.summary?.approvedDays || 0} />
              <StatsCard title="Pending Approval" value={leaveData.summary?.pendingCount || 0} />
              <StatsCard title="Rejected Requests" value={leaveData.summary?.rejectedCount || 0} />
            </div>

            {/* Leave Applications Table */}
            {leaveLoading ? (
              <div className="p-12 text-center">
                <Loader size="md" text="Loading faculty leave records..." />
              </div>
            ) : (leaveData.requests || []).length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 space-y-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                <Calendar size={32} className="mx-auto text-slate-300 dark:text-slate-600" />
                <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">
                  No Leave Records Found
                </p>
                <p>This teacher does not have any recorded leave applications.</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Ref Code</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Duration &amp; Dates</th>
                        <th className="py-3 px-4">Reason</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Attendance Sync</th>
                        <th className="py-3 px-4">Reviewer Remarks</th>
                        {canReview && <th className="py-3 px-4 text-right">Actions</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/80">
                      {leaveData.requests.map((req) => (
                        <tr key={req._id || req.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-850 transition">
                          <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            {req.leaveCode || req._id?.slice(-6) || "—"}
                          </td>
                          <td className="py-3 px-4 font-extrabold text-slate-900 dark:text-white">
                            {req.category}
                            {req.isHalfDay && (
                              <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                                Half Day ({req.halfDaySession || "1st"})
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-semibold text-slate-700 dark:text-slate-200">
                              {req.startDate} {req.endDate && req.endDate !== req.startDate ? `to ${req.endDate}` : ""}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400">
                              {req.totalDays} working day{req.totalDays > 1 ? "s" : ""}
                            </p>
                          </td>
                          <td className="py-3 px-4 max-w-[180px] truncate text-slate-600 dark:text-slate-300" title={req.reason}>
                            {req.reason || "—"}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                req.status === "approved"
                                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                  : req.status === "pending"
                                  ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                  : req.status === "rejected"
                                  ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                                  : "bg-slate-500/10 text-slate-600 border-slate-500/20"
                              }`}
                            >
                              {req.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {req.status === "approved" ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 size={13} />
                                <span>{req.attendanceSync?.isSynced ? "Synced" : "Pending"}</span>
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-400">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                            {req.reviewRemarks ? (
                              <span>
                                <strong className="text-slate-700 dark:text-slate-300">{req.reviewedBy?.name || "Admin"}:</strong> {req.reviewRemarks}
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>
                          {canReview && (
                            <td className="py-3 px-4 text-right">
                              {req.status === "pending" ? (
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedLeaveForReview(req);
                                      setReviewAction("approved");
                                      setReviewRemarks("");
                                      setReviewModalOpen(true);
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold transition cursor-pointer"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedLeaveForReview(req);
                                      setReviewAction("rejected");
                                      setReviewRemarks("");
                                      setReviewModalOpen(true);
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-[11px] font-bold transition cursor-pointer"
                                  >
                                    Reject
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[11px] text-slate-400 font-semibold">Reviewed</span>
                              )}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
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

      {/* Review Modal */}
      <Modal
        open={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title={reviewAction === "approved" ? "Approve Faculty Leave Request" : "Reject Faculty Leave Request"}
        subtitle={`Applicant: ${teacher?.name} &bull; Code: ${selectedLeaveForReview?.leaveCode || ""}`}
        size="md"
      >
        <form onSubmit={handleReviewLeave} className="space-y-4 text-xs font-sans">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
            <p className="text-[10px] uppercase font-bold text-slate-400">Leave Duration</p>
            <p className="font-extrabold text-slate-800 dark:text-slate-100">
              {selectedLeaveForReview?.category} &bull; {selectedLeaveForReview?.startDate} to {selectedLeaveForReview?.endDate} ({selectedLeaveForReview?.totalDays} working day{selectedLeaveForReview?.totalDays > 1 ? "s" : ""})
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] pt-1">
              <strong>Reason:</strong> {selectedLeaveForReview?.reason || "—"}
            </p>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Reviewer Remarks / Decision Note *
            </label>
            <textarea
              required
              rows={3}
              value={reviewRemarks}
              onChange={(e) => setReviewRemarks(e.target.value)}
              placeholder={reviewAction === "approved" ? "E.g. Approved as per academic calendar. Substitute teacher scheduled." : "E.g. Rejected due to scheduled examination duty."}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setReviewModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={reviewSubmitting}
              className={`px-5 py-2 rounded-xl text-white font-bold transition shadow-md flex items-center gap-1.5 ${
                reviewAction === "approved"
                  ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25"
                  : "bg-rose-600 hover:bg-rose-700 shadow-rose-600/25"
              }`}
            >
              {reviewSubmitting ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
              <span>{reviewSubmitting ? "Processing..." : `Confirm ${reviewAction === "approved" ? "Approval" : "Rejection"}`}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Apply Leave Modal */}
      <Modal
        open={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        title={`Apply Leave — ${teacher?.name || "Teacher"}`}
        subtitle={`Emp ID: ${teacher?.teacherId || teacher?.employeeId || "—"} &bull; Dept: ${teacher?.department || "Academic"}`}
        size="md"
      >
        <form onSubmit={handleApplyLeave} className="space-y-4 text-xs font-sans">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Leave Category *
            </label>
            <select
              required
              value={leaveForm.category}
              onChange={(e) => setLeaveForm({ ...leaveForm, category: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Casual Leave">Casual Leave</option>
              <option value="Medical Leave">Medical Leave</option>
              <option value="Emergency Leave">Emergency Leave</option>
              <option value="Academic Duty / Olympiad">Academic Duty / Olympiad</option>
              <option value="Family / Personal Event">Family / Personal Event</option>
              <option value="Maternity / Paternity">Maternity / Paternity</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={leaveForm.startDate}
                onChange={(e) => {
                  const s = e.target.value;
                  setLeaveForm({
                    ...leaveForm,
                    startDate: s,
                    endDate: leaveForm.endDate && leaveForm.endDate < s ? s : leaveForm.endDate,
                  });
                }}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                End Date *
              </label>
              <input
                type="date"
                required
                min={leaveForm.startDate}
                value={leaveForm.endDate}
                onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Half Day Check */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 dark:text-slate-200">
              <input
                type="checkbox"
                checked={leaveForm.isHalfDay}
                onChange={(e) => setLeaveForm({ ...leaveForm, isHalfDay: e.target.checked })}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Apply as Half-Day Leave (0.5 day)</span>
            </label>
            {leaveForm.isHalfDay && (
              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 dark:text-slate-300">
                  <input
                    type="radio"
                    name="halfDaySession"
                    value="first-half"
                    checked={leaveForm.halfDaySession === "first-half"}
                    onChange={(e) => setLeaveForm({ ...leaveForm, halfDaySession: e.target.value })}
                  />
                  <span>First Half</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 dark:text-slate-300">
                  <input
                    type="radio"
                    name="halfDaySession"
                    value="second-half"
                    checked={leaveForm.halfDaySession === "second-half"}
                    onChange={(e) => setLeaveForm({ ...leaveForm, halfDaySession: e.target.value })}
                  />
                  <span>Second Half</span>
                </label>
              </div>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Reason *
            </label>
            <textarea
              required
              rows={3}
              value={leaveForm.reason}
              onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
              placeholder="State reason for faculty leave application..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setApplyModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={applySubmitting}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold transition shadow-md shadow-indigo-600/25 flex items-center gap-1.5"
            >
              {applySubmitting ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
              <span>{applySubmitting ? "Submitting..." : "Submit Application"}</span>
            </button>
          </div>
        </form>
      </Modal>
    </DetailPageLayout>
  );
};

export default TeacherDetail;
