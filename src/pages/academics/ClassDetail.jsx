import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  School, GraduationCap, Calendar, Clock, ArrowLeft,
  UserCheck, Trash2, AlertCircle, UserPlus,
  ExternalLink, X, ArrowUpRight
} from 'lucide-react';
import Loader from '../../components/ui/Loader.jsx';
import Modal from '../../components/ui/Modal.jsx';
import api from '../../services/api.js';
import {
  getClassRoomById,
  assignClassTeacher,
  removeClassTeacher,
  getClassTeacherHistory,
  enrollStudents,
  removeStudentFromClass,
  getClassStudents,
  assignTimetableToClass,
  getClassTimetable,
  promoteClassStudents,
} from '../../services/classService.js';
import { getTeachers } from '../../services/teacherService.js';
import { getStudents } from '../../services/studentService.js';

const ClassDetail = () => {
  const { classId } = useParams();
  const navigate = useNavigate();

  // Core Data State
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Teacher History State
  const [teacherHistory, setTeacherHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Enrolled Students State
  const [studentsList, setStudentsList] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);

  // Timetable State
  const [timetableData, setTimetableData] = useState(null);
  const [timetableLoading, setTimetableLoading] = useState(false);

  // Modal: Assign Teacher
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [teachersList, setTeachersList] = useState([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [teacherNotes, setTeacherNotes] = useState('');
  const [assignTeacherSubmitting, setAssignTeacherSubmitting] = useState(false);

  // Modal: Enroll Students
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedEnrollIds, setSelectedEnrollIds] = useState([]);
  const [enrollSubmitting, setEnrollSubmitting] = useState(false);

  // Modal: Assign Timetable (3 modes: link_existing, clone, from_master_periods)
  const [isTimetableModalOpen, setIsTimetableModalOpen] = useState(false);
  const [existingTimetables, setExistingTimetables] = useState([]);
  const [timetableMode, setTimetableMode] = useState('link_existing'); // 'link_existing' | 'clone' | 'from_master_periods'
  const [selectedTimetableId, setSelectedTimetableId] = useState('');
  const [cloneFromId, setCloneFromId] = useState('');
  const [timetableSubmitting, setTimetableSubmitting] = useState(false);

  // Modal: Promote Students
  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [targetSessionId, setTargetSessionId] = useState('');
  const [targetClassId, setTargetClassId] = useState('');
  const [targetSectionId, setTargetSectionId] = useState('A');
  const [promoteStudentIds, setPromoteStudentIds] = useState([]);
  const [promoteSubmitting, setPromoteSubmitting] = useState(false);

  // 1. Fetch ClassRoom Detail
  const fetchClassRoom = useCallback(async () => {
    if (!classId) return;
    setLoading(true);
    try {
      const res = await getClassRoomById(classId);
      const cls = res?.classRoom || res?.data?.classRoom || null;
      setClassData(cls);
      if (cls?.students) {
        setStudentsList(cls.students);
      }
    } catch (err) {
      console.error('Error loading classroom detail:', err);
    } finally {
      setLoading(false);
    }
  }, [classId]);

  // 2. Fetch Teacher History
  const fetchTeacherHistory = useCallback(async () => {
    if (!classId) return;
    setHistoryLoading(true);
    try {
      const res = await getClassTeacherHistory(classId).catch(() => null);
      setTeacherHistory(res?.history || res?.data?.history || []);
    } catch (err) {
      console.warn('Could not load teacher history:', err);
    } finally {
      setHistoryLoading(false);
    }
  }, [classId]);

  // 3. Fetch Enrolled Students
  const fetchStudents = useCallback(async () => {
    if (!classId) return;
    setStudentsLoading(true);
    try {
      const res = await getClassStudents(classId).catch(() => null);
      if (res?.students) {
        setStudentsList(res.students);
      } else {
        // Fallback fetch
        const fbRes = await api.get(`/students?classId=${classId}&limit=100`).catch(() => null);
        setStudentsList(fbRes?.data?.students || []);
      }
    } catch (err) {
      console.warn('Could not load students:', err);
    } finally {
      setStudentsLoading(false);
    }
  }, [classId]);

  // 4. Fetch Timetable
  const fetchTimetable = useCallback(async () => {
    if (!classId) return;
    setTimetableLoading(true);
    try {
      const res = await getClassTimetable(classId).catch(() => null);
      setTimetableData(res?.timetable || res?.data?.timetable || null);
    } catch (err) {
      console.warn('Could not load timetable:', err);
    } finally {
      setTimetableLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    fetchClassRoom();
  }, [fetchClassRoom]);

  useEffect(() => {
    if (activeTab === 'teachers') fetchTeacherHistory();
    if (activeTab === 'students') fetchStudents();
    if (activeTab === 'timetable') fetchTimetable();
  }, [activeTab, fetchTeacherHistory, fetchStudents, fetchTimetable]);

  // Load teacher list on demand
  const handleOpenTeacherModal = async () => {
    setIsTeacherModalOpen(true);
    try {
      const res = await getTeachers({ limit: 200 }).catch(() => null);
      setTeachersList(res?.teachers || res?.data?.teachers || []);
      setSelectedTeacherId(classData?.currentClassTeacher?.teacherId || '');
    } catch (err) {
      console.warn('Could not load teachers:', err);
    }
  };

  // Submit Teacher Assignment
  const handleAssignTeacher = async (e) => {
    e.preventDefault();
    if (!selectedTeacherId) return;
    setAssignTeacherSubmitting(true);
    try {
      await assignClassTeacher(classId, {
        teacherId: selectedTeacherId,
        notes: teacherNotes,
      });
      setIsTeacherModalOpen(false);
      fetchClassRoom();
      fetchTeacherHistory();
    } catch (err) {
      console.error('Error assigning teacher:', err);
    } finally {
      setAssignTeacherSubmitting(false);
    }
  };

  // Submit Remove Teacher
  const handleRemoveTeacher = async () => {
    if (!window.confirm('Are you sure you want to remove the current class teacher?')) return;
    try {
      await removeClassTeacher(classId, { reason: 'Unassigned by administrator' });
      fetchClassRoom();
      fetchTeacherHistory();
    } catch (err) {
      console.error('Error removing teacher:', err);
    }
  };

  // Open Enroll modal
  const handleOpenEnrollModal = async () => {
    setIsEnrollModalOpen(true);
    setSelectedEnrollIds([]);
    try {
      const res = await getStudents({ limit: 300 }).catch(() => null);
      const all = res?.students || res?.data?.students || [];
      const alreadyIds = new Set(
        (studentsList || []).map((s) => String(s.studentId?._id || s.studentId || s._id || s.id))
      );
      setAvailableStudents(all.filter((s) => !alreadyIds.has(String(s._id || s.id))));
    } catch (err) {
      console.warn('Could not load students:', err);
    }
  };

  // Submit Enroll Students
  const handleEnrollSubmit = async (e) => {
    e.preventDefault();
    if (selectedEnrollIds.length === 0) return;
    setEnrollSubmitting(true);
    try {
      await enrollStudents(classId, { studentIds: selectedEnrollIds });
      setIsEnrollModalOpen(false);
      setSelectedEnrollIds([]);
      fetchClassRoom();
      fetchStudents();
    } catch (err) {
      console.error('Error enrolling students:', err);
    } finally {
      setEnrollSubmitting(false);
    }
  };

  // Remove Student from class
  const handleRemoveStudent = async (studentId, studentName) => {
    if (!window.confirm(`Remove ${studentName || 'student'} from this classroom?`)) return;
    try {
      await removeStudentFromClass(classId, studentId);
      fetchClassRoom();
      fetchStudents();
    } catch (err) {
      console.error('Error removing student:', err);
    }
  };

  // Open Timetable Assignment Modal
  const handleOpenTimetableModal = async () => {
    setIsTimetableModalOpen(true);
    try {
      const res = await api.get('/periods/timetable').catch(() => null);
      setExistingTimetables(res?.data?.timetables || []);
    } catch (err) {
      console.warn('Could not load timetables:', err);
    }
  };

  // Submit Timetable Assignment
  const handleTimetableSubmit = async (e) => {
    e.preventDefault();
    setTimetableSubmitting(true);
    try {
      await assignTimetableToClass(classId, {
        mode: timetableMode,
        timetableId: timetableMode === 'link_existing' ? selectedTimetableId : undefined,
        cloneFromId: timetableMode === 'clone' ? cloneFromId : undefined,
      });
      setIsTimetableModalOpen(false);
      fetchClassRoom();
      fetchTimetable();
    } catch (err) {
      console.error('Error assigning timetable:', err);
    } finally {
      setTimetableSubmitting(false);
    }
  };

  // Open Promote Modal
  const handleOpenPromoteModal = async () => {
    setIsPromoteModalOpen(true);
    setPromoteStudentIds(
      studentsList.map((s) => s.studentId?._id || s.studentId || s._id || s.id)
    );
    try {
      const res = await api.get('/sessions').catch(() => null);
      const list = res?.data?.data || res?.data?.sessions || [];
      setSessions(list);
      if (list.length > 0) {
        setTargetSessionId(list[0]._id || list[0].id);
      }
    } catch (err) {
      console.warn('Could not load sessions for promotion:', err);
    }
  };

  // Submit Promotion
  const handlePromoteSubmit = async (e) => {
    e.preventDefault();
    if (!targetSessionId || promoteStudentIds.length === 0) return;
    setPromoteSubmitting(true);
    try {
      await promoteClassStudents(classId, {
        targetSessionId,
        targetClassId: targetClassId || classData?.className || 'Class 11',
        targetSectionId: targetSectionId || 'A',
        studentIds: promoteStudentIds,
      });
      setIsPromoteModalOpen(false);
      fetchClassRoom();
      fetchStudents();
    } catch (err) {
      console.error('Error promoting students:', err);
    } finally {
      setPromoteSubmitting(false);
    }
  };

  const tabs = [
    { id: 'overview',  label: 'Overview',              icon: User },
    { id: 'teachers',  label: 'Class Teacher & Logs',   icon: UserCheck },
    { id: 'students',  label: `Enrolled Students (${studentsList.length})`, icon: GraduationCap },
    { id: 'timetable', label: 'Class Timetable',       icon: Calendar },
  ];

  const currentTeacher = classData?.currentClassTeacher;
  const enrolledCount = studentsList.length || classData?.students?.length || 0;
  const cap = classData?.capacity || 40;
  const capPct = Math.min(100, Math.round((enrolledCount / cap) * 100));

  return (
    <div className="space-y-6 pb-16">
      {/* ── Top Navigation & Hero ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <Link
          to="/academics/classes"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
        >
          <ArrowLeft size={14} />
          <span>Back to All ClassRooms</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenTeacherModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:border-indigo-500 transition shadow-xs"
          >
            <UserCheck size={14} className="text-indigo-600" />
            <span>{currentTeacher?.teacherName ? 'Change Teacher' : 'Assign Teacher'}</span>
          </button>
          <button
            onClick={handleOpenEnrollModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-md shadow-indigo-500/20"
          >
            <UserPlus size={14} />
            <span>+ Enroll Students</span>
          </button>
        </div>
      </div>

      {/* ── Hero Banner ───────────────────────────────────────────────────── */}
      <div className="rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white p-6 sm:p-8 border border-indigo-700/30 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                Session: {classData?.sessionName || 'Academic Year'}
              </span>
              <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-white/10 text-white border border-white/20">
                {classData?.room || 'Room N/A'}
              </span>
              <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                {enrolledCount} / {cap} Enrolled ({capPct}%)
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {classData?.displayName || `${classData?.className || 'Class'} · ${classData?.sectionName || 'Section'}`}
            </h1>
            <p className="text-xs text-indigo-200/80 font-mono">
              Class Code: {classData?.classCode || 'CLS'}-{classData?.sectionCode || 'SEC'} · ID: {classId}
            </p>
          </div>

          {/* Current Class Teacher Quick Pill */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center gap-3.5 max-w-sm">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-extrabold flex items-center justify-center text-sm shadow-md shrink-0">
              {currentTeacher?.teacherName?.slice(0, 2).toUpperCase() || 'CT'}
            </div>
            <div className="space-y-0.5 min-w-0">
              <span className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider">
                Class Teacher
              </span>
              <p className="font-extrabold text-sm text-white truncate">
                {currentTeacher?.teacherName || 'Not Assigned Yet'}
              </p>
              <p className="text-[11px] text-indigo-200/70 truncate">
                {currentTeacher?.teacherEmail || currentTeacher?.teacherPhone || 'Click to assign from faculty'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Navigation Tabs ──────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center gap-1 p-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* ── TAB 1: OVERVIEW ──────────────────────────────────────────── */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Highlight Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Students</span>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">{enrolledCount}</p>
                  <p className="text-[11px] text-slate-500">Capacity of {cap} students</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Class Teacher</span>
                  <p className="text-base font-extrabold text-indigo-600 dark:text-indigo-400 truncate">
                    {currentTeacher?.teacherName || 'Unassigned'}
                  </p>
                  <p className="text-[11px] text-slate-500">From Teacher Module</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Timetable Status</span>
                  <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 truncate">
                    {classData?.timetableTitle || (classData?.timetableId ? 'Configured' : 'Not Linked')}
                  </p>
                  <p className="text-[11px] text-slate-500">Weekly period allocation</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Session Scoping</span>
                  <p className="text-base font-extrabold text-slate-900 dark:text-white truncate">
                    {classData?.sessionName || 'Active'}
                  </p>
                  <p className="text-[11px] text-slate-500">Unique classroom entity</p>
                </div>
              </div>

              {/* Classroom Details Breakdown */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Class Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Class Level</span>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{classData?.className}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Section</span>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{classData?.sectionName}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Assigned Lecture Hall</span>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{classData?.room || '—'}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Maximum Capacity</span>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{classData?.capacity || 40} seats</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-50 to-amber-50 dark:from-indigo-950/30 dark:to-amber-950/30 border border-indigo-100 dark:border-indigo-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h5 className="font-extrabold text-sm text-slate-900 dark:text-white">Need to Promote Students to Next Academic Session?</h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Promote all or selected students to the subsequent session classroom. History records will be created automatically.
                  </p>
                </div>
                <button
                  onClick={handleOpenPromoteModal}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-xs font-bold transition shadow-md shadow-indigo-500/20 shrink-0"
                >
                  Promote to Next Session
                </button>
              </div>
            </div>
          )}

          {/* ── TAB 2: CLASS TEACHER & TIMELINE ─────────────────────────── */}
          {activeTab === 'teachers' && (
            <div className="space-y-6">
              {/* Current Teacher Section */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <UserCheck size={16} className="text-indigo-600" />
                    <span>Current Active Class Teacher</span>
                  </h4>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleOpenTeacherModal}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 hover:underline"
                    >
                      {currentTeacher?.teacherName ? 'Reassign Teacher' : '+ Assign Teacher'}
                    </button>
                    {currentTeacher?.teacherName && (
                      <button
                        onClick={handleRemoveTeacher}
                        className="text-xs font-bold text-rose-500 hover:text-rose-600 hover:underline ml-2"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                {currentTeacher?.teacherName ? (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-extrabold flex items-center justify-center text-lg shadow-sm">
                        {currentTeacher.teacherName.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="space-y-0.5">
                        <h5 className="font-extrabold text-base text-slate-900 dark:text-white">
                          {currentTeacher.teacherName}
                        </h5>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                          ID: {currentTeacher.teacherId} · Contact: {currentTeacher.teacherPhone || currentTeacher.teacherEmail || 'N/A'}
                        </p>
                        {currentTeacher.assignedAt && (
                          <p className="text-[11px] text-slate-400">
                            Assigned on: {new Date(currentTeacher.assignedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>

                    <Link
                      to={`/teachers/${currentTeacher.teacherId}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition"
                    >
                      <span>Teacher Profile</span>
                      <ExternalLink size={13} />
                    </Link>
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                    <AlertCircle size={28} className="mx-auto text-amber-500" />
                    <p className="font-bold text-slate-700 dark:text-slate-300">No Class Teacher Currently Assigned</p>
                    <p>Assign a teacher from the Teacher module to take charge of attendance, syllabus tracking, and class mentorship.</p>
                  </div>
                )}
              </div>

              {/* Historical Timeline */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Clock size={16} className="text-indigo-600" />
                  <span>Teacher Assignment History & Tenure Log</span>
                </h4>

                {historyLoading ? (
                  <Loader size="md" text="Loading assignment history..." />
                ) : teacherHistory.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No past teacher change records logged for this classroom yet.
                  </div>
                ) : (
                  <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-indigo-200 dark:before:bg-indigo-900">
                    {teacherHistory.map((h, idx) => (
                      <div key={idx} className="relative group">
                        <div
                          className={`absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 ${
                            h.isCurrent ? 'bg-emerald-500' : 'bg-slate-400'
                          }`}
                        />
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                              {h.teacherName}
                            </span>
                            <span
                              className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${
                                h.isCurrent
                                  ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              {h.isCurrent ? 'Active Now' : 'Past Assignment'}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                            <span>
                              From: <strong>{new Date(h.startDate).toLocaleDateString()}</strong>
                            </span>
                            {h.endDate && (
                              <span>
                                To: <strong>{new Date(h.endDate).toLocaleDateString()}</strong>
                              </span>
                            )}
                          </div>

                          {h.reasonForRemoval && (
                            <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-100 dark:border-slate-700">
                              Reason: {h.reasonForRemoval}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── TAB 3: ENROLLED STUDENTS ─────────────────────────────────── */}
          {activeTab === 'students' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Class Roster ({studentsList.length} Students)
                  </h4>
                  <p className="text-xs text-slate-400">
                    Enrolled into {classData?.displayName} for {classData?.sessionName}.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleOpenPromoteModal}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-300/50 text-xs font-bold transition"
                  >
                    <span>Promote Roster</span>
                  </button>
                  <button
                    onClick={handleOpenEnrollModal}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm"
                  >
                    <UserPlus size={14} />
                    <span>+ Add Students</span>
                  </button>
                </div>
              </div>

              {studentsLoading ? (
                <Loader size="md" text="Loading classroom students..." />
              ) : studentsList.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-400 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                  <GraduationCap size={32} className="mx-auto text-slate-300 dark:text-slate-600" />
                  <p className="font-bold text-slate-700 dark:text-slate-300">No Students Enrolled Yet</p>
                  <p>Click &quot;+ Add Students&quot; to enroll active students into this classroom session.</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="py-3 px-4">Roll #</th>
                        <th className="py-3 px-4">Student Name</th>
                        <th className="py-3 px-4">Admission No</th>
                        <th className="py-3 px-4">Gender</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {studentsList.map((st, idx) => {
                        const sid = st.studentId?._id || st.studentId || st._id || st.id;
                        const name = st.name || st.studentId?.name || 'Student';
                        const adm = st.admissionNumber || st.studentId?.admissionNumber || 'ADM-N/A';
                        const roll = st.rollNumber != null ? st.rollNumber : idx + 1;
                        return (
                          <tr key={sid || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                            <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                              #{roll}
                            </td>
                            <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                              <Link to={`/students/${sid}`} className="hover:underline flex items-center gap-1.5">
                                <span>{name}</span>
                                <ExternalLink size={11} className="opacity-40" />
                              </Link>
                            </td>
                            <td className="py-3 px-4 font-mono text-slate-500">{adm}</td>
                            <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{st.gender || '—'}</td>
                            <td className="py-3 px-4">
                              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                {st.status || 'Active'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => handleRemoveStudent(sid, name)}
                                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                                title="Remove from this classroom"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── TAB 4: TIMETABLE ─────────────────────────────────────────── */}
          {activeTab === 'timetable' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Class Weekly Schedule Timetable
                  </h4>
                  <p className="text-xs text-slate-400">
                    Linked schedule: {classData?.timetableTitle || 'None Linked'}
                  </p>
                </div>
                <button
                  onClick={handleOpenTimetableModal}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm"
                >
                  <Calendar size={14} />
                  <span>Assign / Replace Timetable</span>
                </button>
              </div>

              {timetableLoading ? (
                <Loader size="md" text="Loading timetable schedule..." />
              ) : !timetableData && !classData?.timetableId ? (
                <div className="p-12 text-center text-xs text-slate-400 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                  <Calendar size={32} className="mx-auto text-slate-300 dark:text-slate-600" />
                  <p className="font-bold text-slate-700 dark:text-slate-300">No Timetable Currently Linked</p>
                  <p>You can link an existing timetable, clone one from another class, or generate a fresh schedule from master periods.</p>
                  <button
                    onClick={handleOpenTimetableModal}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold"
                  >
                    + Assign Timetable
                  </button>
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <h5 className="font-black text-sm text-slate-900 dark:text-white">
                        {timetableData?.title || classData?.timetableTitle || 'Class Schedule'}
                      </h5>
                      <p className="text-[11px] text-slate-400">
                        {timetableData?.allocations?.length || 0} period allocations configured
                      </p>
                    </div>
                  </div>

                  {/* Day cards or periods list */}
                  {timetableData?.allocations?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => {
                        const daySlots = (timetableData.allocations || []).filter(
                          (a) => (a.day || '').toLowerCase() === day.toLowerCase()
                        );
                        return (
                          <div key={day} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 space-y-2">
                            <span className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center justify-between">
                              <span>{day}</span>
                              <span className="text-[10px] font-mono text-indigo-500 font-bold">{daySlots.length} Slots</span>
                            </span>
                            {daySlots.length === 0 ? (
                              <p className="text-[11px] text-slate-400 italic">No periods assigned</p>
                            ) : (
                              <div className="space-y-1.5">
                                {daySlots.map((slot, sIdx) => (
                                  <div key={sIdx} className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 text-[11px]">
                                    <div className="flex items-center justify-between font-bold">
                                      <span className="text-slate-800 dark:text-slate-200">{slot.subject || 'Subject'}</span>
                                      <span className="text-[10px] font-mono text-slate-400">{slot.time || slot.startTime || ''}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 truncate">{slot.teacherName || 'Teacher'}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 py-6 text-center">
                      Timetable is linked. Open the Timetable Builder to configure subject period allocations.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── MODAL 1: Assign Teacher ────────────────────────────────────────── */}
      <Modal
        open={isTeacherModalOpen}
        onClose={() => setIsTeacherModalOpen(false)}
        size="sm"
        title={
          <div className="flex items-center gap-2">
            <UserCheck size={18} className="text-indigo-600" />
            <span>Assign Class Teacher</span>
          </div>
        }
      >
        <div className="space-y-4">

            <form onSubmit={handleAssignTeacher} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">
                  Select Faculty Teacher *
                </label>
                <select
                  required
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="">-- Choose faculty member --</option>
                  {teachersList.map((t) => (
                    <option key={t._id || t.id} value={t._id || t.id}>
                      {t.name} · {t.employeeId || t.email || 'Teacher'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">
                  Assignment Note / Directives
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Primary academic mentor for session 2025-26"
                  value={teacherNotes}
                  onChange={(e) => setTeacherNotes(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsTeacherModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assignTeacherSubmitting || !selectedTeacherId}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-2 shadow-md shadow-indigo-500/20"
                >
                  {assignTeacherSubmitting && <Loader size="sm" />}
                  <span>{assignTeacherSubmitting ? 'Saving...' : 'Confirm'}</span>
                </button>
              </div>
            </form>
        </div>
      </Modal>

      {/* ── MODAL 2: Enroll Students ────────────────────────────────────────── */}
      <Modal
        open={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        size="lg"
        title={
          <div className="flex items-center gap-2">
            <UserPlus size={18} className="text-indigo-600" />
            <span>Enroll Students into ClassRoom</span>
          </div>
        }
      >
        <div className="space-y-4">

            <form onSubmit={handleEnrollSubmit} className="space-y-4 text-xs font-medium flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400 font-bold">
                  Select Students ({selectedEnrollIds.length} selected)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedEnrollIds.length === availableStudents.length) {
                      setSelectedEnrollIds([]);
                    } else {
                      setSelectedEnrollIds(availableStudents.map((s) => s._id || s.id));
                    }
                  }}
                  className="text-indigo-600 hover:underline font-bold"
                >
                  {selectedEnrollIds.length === availableStudents.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              {availableStudents.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No unassigned students found.
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-2xl p-2 space-y-1.5 max-h-72">
                  {availableStudents.map((st) => {
                    const sid = st._id || st.id;
                    const isChecked = selectedEnrollIds.includes(sid);
                    return (
                      <label
                        key={sid}
                        className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition ${
                          isChecked
                            ? 'bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedEnrollIds((prev) => [...prev, sid]);
                              else setSelectedEnrollIds((prev) => prev.filter((id) => id !== sid));
                            }}
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{st.name}</p>
                            <p className="text-[11px] text-slate-400 font-mono">
                              Adm: {st.admissionNumber || 'N/A'} · Roll #{st.rollNumber || '—'}
                            </p>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEnrollModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={enrollSubmitting || selectedEnrollIds.length === 0}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-2 shadow-md shadow-indigo-500/20"
                >
                  {enrollSubmitting && <Loader size="sm" />}
                  <span>{enrollSubmitting ? 'Enrolling...' : `Enroll (${selectedEnrollIds.length}) Students`}</span>
                </button>
              </div>
            </form>
        </div>
      </Modal>

      {/* ── MODAL 3: Assign Timetable (3 Modes) ─────────────────────────────── */}
      <Modal
        open={isTimetableModalOpen}
        onClose={() => setIsTimetableModalOpen(false)}
        size="md"
        title={
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-indigo-600" />
            <span>Assign Timetable to ClassRoom</span>
          </div>
        }
      >
        <div className="space-y-4">

            <form onSubmit={handleTimetableSubmit} className="space-y-4 text-xs font-medium">
              {/* Mode Selector */}
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">Assignment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'link_existing', label: 'Link Existing' },
                    { id: 'clone', label: 'Clone from Class' },
                    { id: 'from_master_periods', label: 'From Periods' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setTimetableMode(m.id)}
                      className={`p-2.5 rounded-xl font-bold border transition text-center ${
                        timetableMode === m.id
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {timetableMode === 'link_existing' && (
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">
                    Select Existing Timetable *
                  </label>
                  <select
                    required
                    value={selectedTimetableId}
                    onChange={(e) => setSelectedTimetableId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="">-- Choose timetable --</option>
                    {existingTimetables.map((tt) => (
                      <option key={tt._id || tt.id} value={tt._id || tt.id}>
                        {tt.title || tt.className} ({tt.sessionName || 'Default'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {timetableMode === 'clone' && (
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">
                    Template Timetable to Clone From *
                  </label>
                  <select
                    required
                    value={cloneFromId}
                    onChange={(e) => setCloneFromId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="">-- Choose source timetable --</option>
                    {existingTimetables.map((tt) => (
                      <option key={tt._id || tt.id} value={tt._id || tt.id}>
                        {tt.title || tt.className}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {timetableMode === 'from_master_periods' && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  <p className="font-bold">Master Period Skeleton Generation</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    A blank timetable matching your institution&apos;s active bell schedule and master period slots will be generated and linked directly to this classroom.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsTimetableModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={timetableSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-2 shadow-md shadow-indigo-500/20"
                >
                  {timetableSubmitting && <Loader size="sm" />}
                  <span>{timetableSubmitting ? 'Linking...' : 'Assign Timetable'}</span>
                </button>
              </div>
            </form>
        </div>
      </Modal>

      {/* ── MODAL 4: Promote Students to Next Session ────────────────────────── */}
      <Modal
        open={isPromoteModalOpen}
        onClose={() => setIsPromoteModalOpen(false)}
        size="md"
        title={
          <div className="flex items-center gap-2">
            <ArrowUpRight size={18} className="text-indigo-600" />
            <span>Promote Students to Next Session</span>
          </div>
        }
      >
        <div className="space-y-4">

            <form onSubmit={handlePromoteSubmit} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">Target Academic Session *</label>
                <select
                  required
                  value={targetSessionId}
                  onChange={(e) => setTargetSessionId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                >
                  {sessions.map((s) => (
                    <option key={s._id || s.id} value={s._id || s.id}>
                      {s.name} {s.isCurrent ? '(Active)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">Target Class Level *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Class 11"
                    value={targetClassId}
                    onChange={(e) => setTargetClassId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">Target Section</label>
                  <input
                    type="text"
                    value={targetSectionId}
                    onChange={(e) => setTargetSectionId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <p className="text-[11px] text-slate-400">
                Selected {promoteStudentIds.length} students will be marked as Promoted and StudentSessionHistory will be archived automatically.
              </p>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPromoteModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={promoteSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-2"
                >
                  {promoteSubmitting && <Loader size="sm" />}
                  <span>{promoteSubmitting ? 'Promoting...' : 'Confirm Promotion'}</span>
                </button>
              </div>
            </form>
        </div>
      </Modal>
    </div>
  );
};

export default ClassDetail;
