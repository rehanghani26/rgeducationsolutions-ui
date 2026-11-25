import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { toast } from "react-toastify";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Edit3,
  Eye,
  GraduationCap,
  Info,
  Loader2,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import {
  createAttendance,
  getAttendanceStatus,
  getStudents,
  getTeachers,
  updateAttendance,
} from "../../../services";
import { getActiveLeavesOnDate } from "../../../services/leaveService.js";
import { DEPARTMENT_OPTIONS, SECTION_OPTIONS } from "../../../constants";
import { SelectInput } from "../../../components/ui/FormControls.jsx";
import {
  ATTENDANCE_STATUS_CHOICES,
  REMARK_PRESETS,
  attendanceDateKeyOf,
  downloadRosterCsv,
  initialsOf,
  normalizeStatusLabel,
  rateTone,
  statusConfig,
  summarizeRoster,
} from "./attendanceHelpers.js";

const TakeAttendanceForm = ({
  user,
  classOptions,
  activeSession,
  readOnly,
  initialTarget,
  onCancel,
  onSaved,
  onViewExisting,
}) => {
  const editRecord = initialTarget?.editRecord || null;
  const [editingRecord, setEditingRecord] = useState(editRecord);
  const isEditing = Boolean(editingRecord);

  const localToday = new Date().toLocaleDateString("en-CA");
  const [attendeeType, setAttendeeType] = useState(
    editRecord?.type || initialTarget?.type || "student"
  );
  const [attDate, setAttDate] = useState(
    (editRecord && attendanceDateKeyOf(editRecord)) || initialTarget?.date || localToday
  );
  const [attClass, setAttClass] = useState(
    editRecord?.className || initialTarget?.className || ""
  );
  const [attSection, setAttSection] = useState(
    editRecord?.sectionName || initialTarget?.sectionName || ""
  );
  const [attDepartment, setAttDepartment] = useState(
    editRecord?.type === "teacher"
      ? editRecord.sectionName || "All Departments"
      : initialTarget?.department || "All Departments"
  );
  const [attTakenBy, setAttTakenBy] = useState(
    (typeof editRecord?.takenBy === "object" ? editRecord?.takenBy?.name : editRecord?.takenBy) ||
      user?.name ||
      user?.username ||
      ""
  );

  const [roster, setRoster] = useState(() => {
    if (!editRecord) return [];
    const list = editRecord.students || editRecord.records || editRecord.attendance || [];
    return list.map((item, idx) => ({
      id: String(item.studentId || item.memberId || item.id || item._id || idx),
      roll: item.rollNo ?? item.roll ?? "",
      name: item.name || `Member #${idx + 1}`,
      classSection:
        editRecord.classSection ||
        [editRecord.className, editRecord.sectionName].filter(Boolean).join(" - "),
      status: normalizeStatusLabel(item.status),
      remarks: item.remarks || "",
      isOnLeave: normalizeStatusLabel(item.status) === "Leave",
    }));
  });

  const [rosterLoading, setRosterLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [protectApprovedLeaves, setProtectApprovedLeaves] = useState(true);
  const [rosterSearch, setRosterSearch] = useState("");
  const [rosterStatusFilter, setRosterStatusFilter] = useState("all");

  const [statusInfo, setStatusInfo] = useState({
    today: localToday,
    isFuture: false,
    isSunday: false,
    outsideSession: false,
    classSections: [],
    departments: [],
    exists: false,
    existingRecord: null,
  });
  const [statusLoading, setStatusLoading] = useState(false);
  const [teacherDepartments, setTeacherDepartments] = useState([]);

  const loadSeqRef = useRef(0);

  // Sync when initialTarget changes (e.g. clicking a Pending chip or Edit button)
  useEffect(() => {
    const rec = initialTarget?.editRecord || null;
    setEditingRecord(rec);
    if (rec) {
      setAttendeeType(rec.type || "student");
      setAttDate(attendanceDateKeyOf(rec) || localToday);
      setAttClass(rec.className || "");
      setAttSection(rec.sectionName || "");
      setAttDepartment(rec.type === "teacher" ? rec.sectionName || "All Departments" : "All Departments");
      const list = rec.students || rec.records || rec.attendance || [];
      setRoster(
        list.map((item, idx) => ({
          id: String(item.studentId || item.memberId || item.id || item._id || idx),
          roll: item.rollNo ?? item.roll ?? "",
          name: item.name || `Member #${idx + 1}`,
          classSection:
            rec.classSection || [rec.className, rec.sectionName].filter(Boolean).join(" - "),
          status: normalizeStatusLabel(item.status),
          remarks: item.remarks || "",
          isOnLeave: normalizeStatusLabel(item.status) === "Leave",
        }))
      );
    } else if (initialTarget) {
      if (initialTarget.type) setAttendeeType(initialTarget.type);
      if (initialTarget.date) setAttDate(initialTarget.date);
      if (initialTarget.className !== undefined) setAttClass(initialTarget.className);
      if (initialTarget.sectionName !== undefined) setAttSection(initialTarget.sectionName);
      if (initialTarget.department !== undefined) setAttDepartment(initialTarget.department);
    }
    setFormError("");
  }, [initialTarget]);

  // Fetch dynamic status overview + duplicate check whenever selection changes
  useEffect(() => {
    let active = true;
    setStatusLoading(true);
    const params = {
      date: attDate || localToday,
      type: attendeeType,
      ...(attendeeType === "student" && attClass ? { class: attClass } : {}),
      ...(attendeeType === "student" && attSection ? { section: attSection } : {}),
      ...(attendeeType === "teacher" && attDepartment ? { department: attDepartment } : {}),
    };
    getAttendanceStatus(params)
      .then((res) => {
        if (!active) return;
        const payload = res?.data && !res?.classSections ? res.data : res;
        setStatusInfo({
          today: payload?.today || localToday,
          sessionStartDate: payload?.sessionStartDate || null,
          sessionEndDate: payload?.sessionEndDate || null,
          isFuture: Boolean(payload?.isFuture),
          isSunday: Boolean(payload?.isSunday),
          outsideSession: Boolean(payload?.outsideSession),
          classSections: payload?.classSections || [],
          departments: payload?.departments || [],
          exists: Boolean(payload?.exists),
          existingRecord: payload?.existingRecord || null,
        });
      })
      .catch(() => {})
      .finally(() => {
        if (active) setStatusLoading(false);
      });
    return () => {
      active = false;
    };
  }, [attDate, attendeeType, attClass, attSection, attDepartment, localToday]);

  // Load dynamic teacher departments once when teacher mode is opened
  useEffect(() => {
    if (attendeeType !== "teacher") return;
    let active = true;
    getTeachers({ limit: 500, status: "active" })
      .then((res) => {
        if (!active) return;
        const list = res?.teachers || res?.data?.teachers || res?.data || [];
        const depts = Array.from(
          new Set(list.map((t) => String(t.department || "").trim()).filter(Boolean))
        ).sort();
        setTeacherDepartments(depts);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [attendeeType]);

  // Build dynamic section dropdown options for the chosen class
  const sectionChoices = useMemo(() => {
    const classMatch = (statusInfo.classSections || []).filter(
      (cs) => !attClass || cs.className.toLowerCase() === attClass.toLowerCase()
    );
    const byName = new Map();
    classMatch.forEach((cs) => {
      byName.set(cs.sectionName, {
        id: cs.sectionId,
        name: cs.sectionName,
        studentCount: cs.studentCount,
        taken: cs.taken,
        configured: true,
      });
    });
    SECTION_OPTIONS.forEach((sec) => {
      if (!byName.has(sec.name)) {
        byName.set(sec.name, {
          id: sec.id,
          name: sec.name,
          studentCount: null,
          taken: false,
          configured: false,
        });
      }
    });
    return Array.from(byName.values());
  }, [statusInfo.classSections, attClass]);

  const departmentChoices = useMemo(() => {
    const fromOverview = (statusInfo.departments || [])
      .map((d) => d.department)
      .filter((d) => d && d !== "All Departments");
    const fromConstants = DEPARTMENT_OPTIONS.map((d) => d.value || d.label || d);
    return ["All Departments", ...Array.from(new Set([...fromOverview, ...teacherDepartments, ...fromConstants])).sort()];
  }, [statusInfo.departments, teacherDepartments]);

  const loadRoster = useCallback(
    async ({ silent = false, preserveCurrent = false } = {}) => {
      if (attendeeType === "student" && (!attClass || !attSection)) {
        if (!silent) toast.warning("Please select both Class and Section first.");
        return;
      }
      const seq = ++loadSeqRef.current;
      setRosterLoading(true);
      setFormError("");
      try {
        if (attendeeType === "student") {
          const [studentsRes, leavesRes] = await Promise.all([
            getStudents({ class: attClass, section: attSection, limit: 300 }),
            getActiveLeavesOnDate({
              date: attDate,
              className: attClass,
              sectionName: attSection,
              role: "student",
            }).catch(() => null),
          ]);
          if (seq !== loadSeqRef.current) return;

          const rawStudents = (studentsRes?.students || studentsRes?.data?.students || []).filter(
            (s) => s.status !== "inactive" && s.status !== "Passout"
          );
          const activeLeaves =
            leavesRes?.leaves ||
            leavesRes?.data?.leaves ||
            (Array.isArray(leavesRes?.data) ? leavesRes.data : []) ||
            [];

          const existingById = new Map(
            (preserveCurrent ? roster : []).map((r) => [String(r.id), r])
          );

          const mapped = rawStudents.map((s) => {
            const sid = String(s._id || s.id || "");
            const adm = String(s.admissionNumber || "");
            const rollStr = String(s.rollNumber ?? "");
            const prev = existingById.get(sid);

            const matchingLeave = activeLeaves.find(
              (l) =>
                (l.applicantId && String(l.applicantId) === sid) ||
                (adm && l.admissionNumber && String(l.admissionNumber) === adm) ||
                (rollStr && l.rollNumber && String(l.rollNumber) === rollStr)
            );

            const fullName =
              `${s.firstName || ""} ${s.lastName || ""}`.trim() || s.name || "Unknown Student";

            if (prev) return prev;
            if (matchingLeave) {
              return {
                id: sid,
                roll: s.rollNumber || s.admissionNumber || sid,
                name: fullName,
                classSection: `${s.className || s.class || attClass} - ${s.sectionName || s.section || attSection}`,
                status: matchingLeave.isHalfDay ? "Half Day" : "Leave",
                remarks: `Approved Leave: ${matchingLeave.category}${matchingLeave.isHalfDay ? ` (${matchingLeave.halfDaySession || "1st"})` : ""}${matchingLeave.reason ? ` — ${matchingLeave.reason}` : ""}`,
                isOnLeave: true,
                leaveCategory: matchingLeave.category,
                leaveRef: matchingLeave.leaveCode,
              };
            }
            return {
              id: sid,
              roll: s.rollNumber || s.admissionNumber || sid,
              name: fullName,
              classSection: `${s.className || s.class || attClass} - ${s.sectionName || s.section || attSection}`,
              status: "Present",
              remarks: "",
              isOnLeave: false,
            };
          });

          mapped.sort((a, b) => {
            const na = Number(a.roll);
            const nb = Number(b.roll);
            if (Number.isFinite(na) && Number.isFinite(nb) && na !== nb) return na - nb;
            return a.name.localeCompare(b.name);
          });

          setRoster(mapped);
          if (!silent) {
            if (mapped.length === 0) {
              toast.info(`No active students found for ${attClass} - ${attSection}`);
            } else if (activeLeaves.length > 0) {
              toast.success(`Loaded ${mapped.length} students (${activeLeaves.length} on approved leave)`);
            } else {
              toast.success(`Loaded ${mapped.length} students for ${attClass} - ${attSection}`);
            }
          }
        } else {
          const [teachersRes, leavesRes] = await Promise.all([
            getTeachers({ limit: 500, status: "active" }),
            getActiveLeavesOnDate({ date: attDate, role: "teacher" }).catch(() => null),
          ]);
          if (seq !== loadSeqRef.current) return;

          const allTeachers = (
            teachersRes?.teachers ||
            teachersRes?.data?.teachers ||
            teachersRes?.data ||
            []
          ).filter((t) => t.status !== "inactive");

          const filteredTeachers =
            !attDepartment || attDepartment === "All Departments"
              ? allTeachers
              : allTeachers.filter(
                  (t) =>
                    String(t.department || "").trim().toLowerCase() ===
                    attDepartment.trim().toLowerCase()
                );

          const activeLeaves =
            leavesRes?.leaves ||
            leavesRes?.data?.leaves ||
            (Array.isArray(leavesRes?.data) ? leavesRes.data : []) ||
            [];

          const existingById = new Map(
            (preserveCurrent ? roster : []).map((r) => [String(r.id), r])
          );

          const mapped = filteredTeachers.map((t) => {
            const tid = String(t._id || t.id || "");
            const empId = String(t.employeeId || "");
            const prev = existingById.get(tid);
            const matchingLeave = activeLeaves.find(
              (l) =>
                (l.applicantId && String(l.applicantId) === tid) ||
                (empId && l.employeeId && String(l.employeeId) === empId)
            );
            const fullName =
              t.name || `${t.firstName || ""} ${t.lastName || ""}`.trim() || "Staff Member";

            if (prev) return prev;
            if (matchingLeave) {
              return {
                id: tid,
                roll: empId || tid,
                name: fullName,
                classSection: t.department || attDepartment || "Teaching Staff",
                status: matchingLeave.isHalfDay ? "Half Day" : "Leave",
                remarks: `Approved Leave: ${matchingLeave.category}${matchingLeave.reason ? ` — ${matchingLeave.reason}` : ""}`,
                isOnLeave: true,
                leaveCategory: matchingLeave.category,
              };
            }
            return {
              id: tid,
              roll: empId || tid,
              name: fullName,
              classSection: t.department || attDepartment || "Teaching Staff",
              status: "Present",
              remarks: "",
              isOnLeave: false,
            };
          });

          mapped.sort((a, b) => a.name.localeCompare(b.name));
          setRoster(mapped);
          if (!silent && mapped.length === 0) {
            toast.info(`No active staff found for ${attDepartment || "All Departments"}`);
          }
        }
      } catch (err) {
        if (seq !== loadSeqRef.current) return;
        setFormError(err?.response?.data?.message || err?.message || "Failed to load roster.");
        if (!preserveCurrent) setRoster([]);
      } finally {
        if (seq === loadSeqRef.current) setRosterLoading(false);
      }
    },
    [attendeeType, attClass, attSection, attDepartment, attDate, roster]
  );

  // Auto-load students/staff whenever selection is ready (when not editing an existing snapshot)
  useEffect(() => {
    if (isEditing) return;
    if (attendeeType === "student") {
      if (attClass && attSection) {
        loadRoster({ silent: true });
      } else {
        setRoster([]);
      }
    } else {
      loadRoster({ silent: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attendeeType, attClass, attSection, attDepartment, attDate, isEditing]);

  const handleAttendeeTypeChange = (newType) => {
    if (isEditing) return;
    setAttendeeType(newType);
    setRoster([]);
    setAttClass("");
    setAttSection("");
    setAttDepartment("All Departments");
    setFormError("");
    setRosterSearch("");
    setRosterStatusFilter("all");
  };

  const handleMarkAllStatus = (targetStatus) => {
    setRoster((prev) =>
      prev.map((item) =>
        protectApprovedLeaves && item.isOnLeave ? item : { ...item, status: targetStatus }
      )
    );
  };

  const handleStatusChange = (id, newStatus) => {
    setRoster((prev) =>
      prev.map((item) => (String(item.id) === String(id) ? { ...item, status: newStatus } : item))
    );
  };

  const handleRemarksChange = (id, text) => {
    setRoster((prev) =>
      prev.map((item) => (String(item.id) === String(id) ? { ...item, remarks: text } : item))
    );
  };

  const switchToEditExisting = (existing) => {
    if (!existing) return;
    setEditingRecord(existing);
    setAttendeeType(existing.type || "student");
    setAttDate(attendanceDateKeyOf(existing) || attDate);
    if (existing.type === "teacher") {
      setAttDepartment(existing.sectionName || "All Departments");
    } else {
      setAttClass(existing.className || attClass);
      setAttSection(existing.sectionName || attSection);
    }
    const list = existing.students || existing.records || existing.attendance || [];
    setRoster(
      list.map((item, idx) => ({
        id: String(item.studentId || item.memberId || item.id || item._id || idx),
        roll: item.rollNo ?? item.roll ?? "",
        name: item.name || `Member #${idx + 1}`,
        classSection:
          existing.classSection ||
          [existing.className, existing.sectionName].filter(Boolean).join(" - "),
        status: normalizeStatusLabel(item.status),
        remarks: item.remarks || "",
        isOnLeave: normalizeStatusLabel(item.status) === "Leave",
      }))
    );
    setFormError("");
  };

  const counts = useMemo(() => summarizeRoster(roster), [roster]);

  const filteredRoster = useMemo(
    () =>
      roster.filter((item) => {
        const matchesSearch =
          !rosterSearch ||
          String(item.name || "").toLowerCase().includes(rosterSearch.toLowerCase()) ||
          String(item.roll || "").toLowerCase().includes(rosterSearch.toLowerCase());
        const matchesStatus =
          rosterStatusFilter === "all" || item.status === rosterStatusFilter;
        return matchesSearch && matchesStatus;
      }),
    [roster, rosterSearch, rosterStatusFilter]
  );

  const duplicateBlocked = !isEditing && statusInfo.exists && Boolean(statusInfo.existingRecord);

  const validateBeforeSubmit = () => {
    if (readOnly) return "This academic session is read-only. Select the active session.";
    if (!attDate) return "Please select an attendance date.";
    if (statusInfo.isFuture || attDate > (statusInfo.today || localToday)) {
      return "Attendance cannot be marked for a future date.";
    }
    if (statusInfo.outsideSession) {
      return "The selected date is outside the active academic session.";
    }
    if (attendeeType === "student") {
      if (!attClass) return "Please select a Class Level.";
      if (!attSection) return "Please select a Section.";
    }
    if (duplicateBlocked) {
      return `Attendance for ${attendeeType === "teacher" ? attDepartment : `${attClass} - ${attSection}`} on ${attDate} has already been recorded.`;
    }
    if (roster.length === 0) {
      return attendeeType === "student"
        ? "No students loaded for this class and section."
        : "No staff members loaded for this department.";
    }
    if (!attTakenBy.trim()) {
      return "Please specify who is taking this attendance.";
    }
    return "";
  };

  const handleSaveAttendance = async (e) => {
    e.preventDefault();
    const validationMessage = validateBeforeSubmit();
    if (validationMessage) {
      setFormError(validationMessage);
      toast.warning(validationMessage);
      return;
    }

    setFormError("");
    setSubmitting(true);

    const selectedClassObj =
      attendeeType === "student"
        ? classOptions.find((cls) => cls.name === attClass || cls.id === attClass)
        : null;
    const selectedSectionObj =
      attendeeType === "student"
        ? sectionChoices.find((sec) => sec.name === attSection || sec.id === attSection) ||
          SECTION_OPTIONS.find((sec) => sec.name === attSection || sec.id === attSection)
        : null;
    const resolvedClassName =
      attendeeType === "student" ? selectedClassObj?.name || attClass : "Teaching Staff";
    const resolvedSectionName =
      attendeeType === "student"
        ? selectedSectionObj?.name || attSection
        : attDepartment || "All Departments";

    const payload = {
      date: attDate,
      attendanceDate: attDate,
      attendanceTakenDate: new Date().toISOString(),
      type: attendeeType,
      classId: attendeeType === "student" ? selectedClassObj?.id || attClass : undefined,
      sectionId: attendeeType === "student" ? selectedSectionObj?.id || attSection : undefined,
      className: resolvedClassName,
      sectionName: resolvedSectionName,
      classSection:
        attendeeType === "student"
          ? `${resolvedClassName} - ${resolvedSectionName}`
          : `Staff - ${resolvedSectionName}`,
      takenBy: {
        userId: user?.id || user?._id || "",
        name: attTakenBy.trim(),
      },
      total: counts.total,
      present: counts.present,
      absent: counts.absent,
      late: counts.late,
      halfDay: counts.halfDay,
      leaveCount: counts.leave,
      students: roster.map((item) => ({
        studentId: item.id,
        name: item.name,
        rollNo: item.roll ?? "",
        status: statusConfig(item.status).apiValue,
        remarks: (item.remarks || "").trim(),
      })),
    };

    try {
      const res = isEditing
        ? await updateAttendance(editingRecord._id || editingRecord.id, payload)
        : await createAttendance(payload);
      const savedRecord =
        res?.data?.data?.record ||
        res?.data?.record ||
        res?.data?.attendance ||
        res?.data ||
        payload;
      onSaved(savedRecord, isEditing);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Could not save attendance. Please check the entries and try again.";
      setFormError(msg);
      if (err?.response?.status === 409) {
        getAttendanceStatus({
          date: attDate,
          type: attendeeType,
          ...(attendeeType === "student" ? { class: attClass, section: attSection } : { department: attDepartment }),
        })
          .then((statusRes) => {
            const p = statusRes?.data && !statusRes?.classSections ? statusRes.data : statusRes;
            if (p?.existingRecord) {
              setStatusInfo((prev) => ({ ...prev, exists: true, existingRecord: p.existingRecord }));
            }
          })
          .catch(() => {});
      }
    } finally {
      setSubmitting(false);
    }
  };

  const maxDate =
    statusInfo.sessionEndDate && statusInfo.sessionEndDate < (statusInfo.today || localToday)
      ? statusInfo.sessionEndDate
      : statusInfo.today || localToday;
  const isPastDate = attDate && attDate < (statusInfo.today || localToday);
  const overallTone = rateTone(counts.percentage);
  const segPct = (n) => (counts.total > 0 ? `${(n / counts.total) * 100}%` : "0%");

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${
              attendeeType === "student"
                ? "bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800/50 text-indigo-600 dark:text-indigo-400"
                : "bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20 text-purple-600 dark:text-purple-400"
            }`}
          >
            {attendeeType === "student" ? <GraduationCap size={20} /> : <Users size={20} />}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                {isEditing ? "Edit" : "Take"}{" "}
                {attendeeType === "student" ? "Student" : "Teacher & Staff"} Attendance
              </h3>
              <span
                className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                  isEditing
                    ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/25"
                    : "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800/50"
                }`}
              >
                {isEditing ? "Editing Mode" : "Daily Register"}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {activeSession?.sessionName ? (
                <>
                  Session <strong className="text-slate-700 dark:text-slate-200">{activeSession.sessionName}</strong> ·{" "}
                </>
              ) : null}
              {isEditing
                ? "Updating saved attendance entries"
                : "Auto-loads active roster & approved leaves · One register per class-section per day"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold w-full sm:w-auto shrink-0">
          <button
            type="button"
            disabled={isEditing}
            onClick={() => handleAttendeeTypeChange("student")}
            className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg transition-all ${
              attendeeType === "student"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            } ${isEditing ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <GraduationCap size={14} /> Student
          </button>
          <button
            type="button"
            disabled={isEditing}
            onClick={() => handleAttendeeTypeChange("teacher")}
            className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg transition-all ${
              attendeeType === "teacher"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            } ${isEditing ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <Users size={14} /> Teacher &amp; Staff
          </button>
        </div>
      </div>

      <form onSubmit={handleSaveAttendance} className="space-y-4">
        {/* Balanced 4-Column Selection Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 p-4 rounded-xl bg-slate-50/90 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 text-xs">
          <div>
            <div className="flex items-center justify-between gap-1 mb-1">
              <label className="font-bold text-slate-600 dark:text-slate-400 uppercase text-[10px]">
                Attendance Date
              </label>
              <div className="flex items-center gap-1">
                {statusInfo.isSunday ? (
                  <span className="text-[9px] font-extrabold text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-800/40">
                    Sunday
                  </span>
                ) : null}
                {isPastDate ? (
                  <span className="text-[9px] font-extrabold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800/40">
                    Past Date
                  </span>
                ) : null}
              </div>
            </div>
            <input
              type="date"
              required
              disabled={isEditing}
              min={statusInfo.sessionStartDate || undefined}
              max={maxDate}
              value={attDate}
              onChange={(e) => {
                setAttDate(e.target.value);
                setFormError("");
              }}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
            />
          </div>

          {attendeeType === "student" ? (
            <>
              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 uppercase text-[10px] mb-1">
                  Class Level
                </label>
                <SelectInput
                  disabled={isEditing}
                  value={attClass}
                  onChange={(e) => {
                    setAttClass(e.target.value);
                    setAttSection("");
                    setRoster([]);
                    setFormError("");
                  }}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                >
                  <option value="">-- Select Class --</option>
                  {classOptions.map((cls) => (
                    <option key={cls.id || cls.name} value={cls.name}>
                      {cls.name}
                    </option>
                  ))}
                </SelectInput>
              </div>
              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 uppercase text-[10px] mb-1">
                  Section
                </label>
                <SelectInput
                  disabled={isEditing || !attClass}
                  value={attSection}
                  onChange={(e) => {
                    setAttSection(e.target.value);
                    setFormError("");
                  }}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                >
                  <option value="">-- Select Section --</option>
                  {sectionChoices.map((sec) => (
                    <option key={sec.id || sec.name} value={sec.name}>
                      {sec.name}
                      {sec.configured
                        ? ` (${sec.studentCount ?? 0} students · ${sec.taken ? "Taken" : "Pending"})`
                        : ""}
                    </option>
                  ))}
                </SelectInput>
              </div>
            </>
          ) : (
            <div className="lg:col-span-2">
              <label className="block font-bold text-slate-600 dark:text-slate-400 uppercase text-[10px] mb-1">
                Department
              </label>
              <SelectInput
                disabled={isEditing}
                value={attDepartment}
                onChange={(e) => {
                  setAttDepartment(e.target.value);
                  setFormError("");
                }}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-60"
              >
                {departmentChoices.map((dept) => {
                  const info = (statusInfo.departments || []).find((d) => d.department === dept);
                  return (
                    <option key={dept} value={dept}>
                      {dept}
                      {info ? ` (${info.staffCount} staff · ${info.taken ? "Taken" : "Pending"})` : ""}
                    </option>
                  );
                })}
              </SelectInput>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-600 dark:text-slate-400 uppercase text-[10px] mb-1">
              Taken By
            </label>
            <input
              type="text"
              required
              value={attTakenBy}
              onChange={(e) => setAttTakenBy(e.target.value)}
              placeholder="Staff / Teacher Name"
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Date / Session / Sunday Warnings */}
        {statusInfo.isFuture ? (
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 text-xs font-semibold text-rose-700 dark:text-rose-300">
            <AlertTriangle size={16} className="shrink-0" />
            <span>Future dates cannot be marked. Choose today ({statusInfo.today}) or an earlier date in this session.</span>
          </div>
        ) : statusInfo.outsideSession ? (
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 text-xs font-semibold text-rose-700 dark:text-rose-300">
            <AlertTriangle size={16} className="shrink-0" />
            <span>
              The date {attDate} is outside the active academic session ({statusInfo.sessionStartDate} to {statusInfo.sessionEndDate}).
            </span>
          </div>
        ) : statusInfo.isSunday ? (
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-xs font-semibold text-amber-700 dark:text-amber-300">
            <Info size={16} className="shrink-0" />
            <span>Selected date ({attDate}) is a Sunday (weekly off). Confirm only if a special session was held.</span>
          </div>
        ) : null}

        {/* Duplicate Same-Day Protection Banner */}
        {duplicateBlocked ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700/60 text-xs">
            <div className="flex items-start gap-2.5 text-amber-900 dark:text-amber-200">
              <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold text-sm">
                  Attendance already taken for{" "}
                  {attendeeType === "teacher" ? attDepartment : `${attClass} - ${attSection}`} on{" "}
                  {attDate}
                </p>
                <p className="text-amber-800/90 dark:text-amber-300/90 mt-0.5">
                  Recorded by{" "}
                  <strong>{statusInfo.existingRecord?.takenBy?.name || "Staff"}</strong> ·{" "}
                  Present: {statusInfo.existingRecord?.present ?? 0}, Absent:{" "}
                  {statusInfo.existingRecord?.absent ?? 0}, Late:{" "}
                  {statusInfo.existingRecord?.late ?? 0}. Duplicate attendance cannot be taken twice
                  for the same {attendeeType === "teacher" ? "department" : "class and section"} on
                  the same day.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onViewExisting(statusInfo.existingRecord)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 font-bold hover:bg-amber-100/60 cursor-pointer"
              >
                <Eye size={13} /> View Record
              </button>
              {!readOnly ? (
                <button
                  type="button"
                  onClick={() => switchToEditExisting(statusInfo.existingRecord)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-xs cursor-pointer"
                >
                  <Edit3 size={13} /> Edit Existing
                </button>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* Roster Load Status & Live Clock Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-indigo-50/70 dark:bg-slate-800/80 border border-indigo-100 dark:border-slate-700 rounded-xl px-4 py-3">
          <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2.5 flex-wrap">
            {statusLoading || rosterLoading ? (
              <Loader2 size={15} className="animate-spin text-indigo-500" />
            ) : roster.length > 0 ? (
              <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <Calendar size={15} className="text-indigo-500 shrink-0" />
            )}
            {roster.length > 0 ? (
              <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                {roster.length} {attendeeType === "student" ? "students" : "staff members"} ready for{" "}
                <span className="text-slate-900 dark:text-white font-extrabold">
                  {attendeeType === "student" ? `${attClass} – ${attSection}` : attDepartment}
                </span>
              </span>
            ) : (
              <span className="font-medium">
                {attendeeType === "student"
                  ? "Select Class and Section above to load students automatically."
                  : "Select Department above to load active staff members."}
              </span>
            )}
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-white/80 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 tabular-nums">
              <Clock size={11} className="text-emerald-500" />
              {format(new Date(), "MMM d, h:mm a")}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {roster.length > 0 ? (
              <button
                type="button"
                onClick={() =>
                  downloadRosterCsv({
                    filename: `attendance-draft-${attDate}.csv`,
                    title: attendeeType === "student" ? `${attClass} - ${attSection}` : attDepartment,
                    dateKey: attDate,
                    rows: roster,
                  })
                }
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-100 cursor-pointer"
              >
                <Download size={13} /> Export CSV
              </button>
            ) : null}
            <button
              type="button"
              disabled={(attendeeType === "student" && (!attClass || !attSection)) || rosterLoading}
              onClick={() => loadRoster({ silent: false, preserveCurrent: isEditing })}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              {rosterLoading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
              <span>{rosterLoading ? "Loading..." : isEditing ? "Sync New Members" : "Reload Roster"}</span>
            </button>
          </div>
        </div>

        {/* Inline Error Banner */}
        {formError ? (
          <div role="alert" className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-bold text-rose-700 dark:text-rose-300">
            <AlertTriangle size={16} className="shrink-0" />
            <span>{formError}</span>
          </div>
        ) : null}

        {/* Quick Mark + Distribution Meter + Search + Filter + Live Counts */}
        {roster.length > 0 ? (
          <div className="space-y-3 bg-slate-50/90 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            {/* Stacked Real-Time Breakdown Bar */}
            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex">
              {counts.present > 0 ? (
                <div className="bg-emerald-500 h-full transition-all" style={{ width: segPct(counts.present) }} />
              ) : null}
              {counts.late > 0 ? (
                <div className="bg-amber-500 h-full transition-all" style={{ width: segPct(counts.late) }} />
              ) : null}
              {counts.halfDay > 0 ? (
                <div className="bg-teal-500 h-full transition-all" style={{ width: segPct(counts.halfDay) }} />
              ) : null}
              {counts.leave > 0 ? (
                <div className="bg-purple-500 h-full transition-all" style={{ width: segPct(counts.leave) }} />
              ) : null}
              {counts.absent > 0 ? (
                <div className="bg-rose-500 h-full transition-all" style={{ width: segPct(counts.absent) }} />
              ) : null}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Quick Mark All:
                </span>
                {ATTENDANCE_STATUS_CHOICES.filter((c) => c.value !== "Leave").map((choice) => (
                  <button
                    key={choice.value}
                    type="button"
                    onClick={() => handleMarkAllStatus(choice.value)}
                    className={`px-2.5 py-1 rounded-lg border text-xs font-bold transition-colors cursor-pointer bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-indigo-400 ${choice.textClass}`}
                  >
                    {choice.value}
                  </button>
                ))}
                <label className="inline-flex items-center gap-1.5 ml-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={protectApprovedLeaves}
                    onChange={(e) => setProtectApprovedLeaves(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <ShieldCheck size={13} className="text-purple-500" />
                  Protect approved leaves
                </label>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] font-bold flex-wrap tabular-nums">
                <span className="bg-slate-200/80 dark:bg-slate-900 text-slate-700 dark:text-slate-200 px-2.5 py-1 rounded-lg">
                  Total: {counts.total}
                </span>
                <span className="text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-500/30">
                  Present: {counts.present}
                </span>
                <span className="text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-500/30">
                  Absent: {counts.absent}
                </span>
                <span className="text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-500/30">
                  Late: {counts.late}
                </span>
                <span className="text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-500/10 px-2.5 py-1 rounded-lg border border-teal-200 dark:border-teal-500/30">
                  Half Day: {counts.halfDay}
                </span>
                <span className="text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-200 dark:border-purple-500/30">
                  Leave: {counts.leave}
                </span>
                <span className={`px-2.5 py-1 rounded-lg border font-extrabold ${overallTone.pillClass}`}>
                  Rate: {counts.percentage}%
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2.5 border-t border-slate-200/80 dark:border-slate-700/80">
              <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-bold">
                {["all", ...ATTENDANCE_STATUS_CHOICES.map((c) => c.value)].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setRosterStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                      rosterStatusFilter === st
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {st === "all" ? `All (${roster.length})` : st}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search size={13} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={rosterSearch}
                  onChange={(e) => setRosterSearch(e.target.value)}
                  placeholder="Filter roster by name or roll..."
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        ) : null}

        {/* Roster Table */}
        {rosterLoading ? (
          <div className="flex items-center justify-center py-14 gap-3 text-slate-400">
            <Loader2 size={22} className="animate-spin text-indigo-500" />
            <span className="text-sm font-semibold">
              Loading {attendeeType === "student" ? `${attClass} – ${attSection}` : attDepartment} roster...
            </span>
          </div>
        ) : roster.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-2.5 text-slate-400 dark:text-slate-500 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
            <GraduationCap size={34} className="text-slate-400 dark:text-slate-600" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {attendeeType === "student" && attClass && attSection
                ? `No active students found in ${attClass} – ${attSection}`
                : attendeeType === "teacher"
                  ? `No active staff members found for ${attDepartment}`
                  : "No roster loaded yet"}
            </p>
            <p className="text-xs text-slate-500 text-center max-w-md">
              {attendeeType === "student"
                ? "Choose a class and section above; enrolled students and any approved leaves for the selected date will appear here automatically."
                : "Choose a department above to load active faculty and staff."}
            </p>
          </div>
        ) : (
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">{attendeeType === "student" ? "Roll / Adm No" : "Emp ID"}</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredRoster.map((item, idx) => {
                  const cfg = statusConfig(item.status);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 text-slate-400 font-semibold tabular-nums">{idx + 1}</td>
                      <td className="py-3 px-4 font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap tabular-nums">
                        {item.roll || "—"}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/70 dark:border-indigo-800/50 text-[11px] font-extrabold text-indigo-700 dark:text-indigo-300 flex items-center justify-center shrink-0">
                            {initialsOf(item.name)}
                          </span>
                          <div>
                            <div className="font-extrabold text-slate-900 dark:text-white">{item.name}</div>
                            {attendeeType === "teacher" && item.classSection ? (
                              <div className="text-[10px] font-medium text-slate-400">{item.classSection}</div>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="inline-flex bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] font-bold">
                            {ATTENDANCE_STATUS_CHOICES.map((choice) => (
                              <button
                                key={choice.value}
                                type="button"
                                title={choice.value}
                                onClick={() => handleStatusChange(item.id, choice.value)}
                                className={`min-w-[32px] px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                                  item.status === choice.value
                                    ? choice.activeClass
                                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                }`}
                              >
                                {choice.short}
                              </button>
                            ))}
                          </div>
                          {item.isOnLeave ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                              Approved Leave{item.leaveCategory ? ` (${item.leaveCategory})` : ""}
                            </span>
                          ) : (
                            <span className={`text-[11px] font-bold ${cfg.textClass}`}>
                              {item.status}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 min-w-[220px]">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            maxLength={500}
                            placeholder="Optional notes..."
                            value={item.remarks}
                            onChange={(e) => handleRemarksChange(item.id, e.target.value)}
                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                          <select
                            aria-label="Quick remark preset"
                            value=""
                            onChange={(e) => {
                              if (e.target.value) handleRemarksChange(item.id, e.target.value);
                            }}
                            className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-1.5 py-1.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300 cursor-pointer"
                          >
                            <option value="">+Note</option>
                            {REMARK_PRESETS.map((preset) => (
                              <option key={preset} value={preset}>
                                {preset}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold tabular-nums">
            {roster.length > 0 ? (
              <span>
                Summary: <strong className="text-slate-800 dark:text-slate-200">{counts.total}</strong>{" "}
                members · {counts.present} Present, {counts.absent} Absent
                {counts.late > 0 ? `, ${counts.late} Late` : ""}
                {counts.halfDay > 0 ? `, ${counts.halfDay} Half Day` : ""}
                {counts.leave > 0 ? `, ${counts.leave} Leave` : ""} ({counts.percentage}%)
              </span>
            ) : (
              <span>Select a target class/section or department to begin.</span>
            )}
          </div>
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2.5">
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors text-center cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || duplicateBlocked || statusInfo.isFuture || statusInfo.outsideSession || readOnly || roster.length === 0}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
            >
              {submitting ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              <span>
                {submitting
                  ? "Saving..."
                  : isEditing
                    ? "Update Attendance Record"
                    : "Save & Submit Record"}
              </span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TakeAttendanceForm;
