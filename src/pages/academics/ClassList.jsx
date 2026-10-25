import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  School, Plus, X, Search, UserCheck, Calendar, Users, Clock,
  ArrowRight, UserPlus, GraduationCap, AlertCircle, Trash2
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Loader from '../../components/ui/Loader.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { Can, CanButton } from '../../config/access.jsx';
import api from '../../services/api.js';
import {
  getClassRooms,
  createClassRoom,
  deleteClassRoom,
  assignClassTeacher,
  removeClassTeacher,
  enrollStudents,
  getStudentSessionHistory,
} from '../../services/classService.js';
import { getTeachers } from '../../services/teacherService.js';
import { getStudents } from '../../services/studentService.js';
import { CLASS_OPTIONS, SECTION_OPTIONS } from '../../constants/academicOptions.js';

const ClassList = () => {
  // State
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [classRooms, setClassRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Teacher list for assigning
  const [teachers, setTeachers] = useState([]);

  // Student history modal
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [studentSearchInput, setStudentSearchInput] = useState('');
  const [studentHistoryData, setStudentHistoryData] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');

  // Create classroom modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createForm, setCreateForm] = useState({
    sessionId: '',
    className: 'Class 10',
    classCode: 'CLS-10',
    sectionName: 'Section A',
    sectionCode: 'SEC-A',
    room: 'Room 101',
    capacity: 40,
    classTeacherId: '',
  });

  // Assign teacher modal
  const [teacherModalOpen, setTeacherModalOpen] = useState(false);
  const [selectedClassRoom, setSelectedClassRoom] = useState(null);
  const [assignTeacherId, setAssignTeacherId] = useState('');
  const [assignNotes, setAssignNotes] = useState('');
  const [assignSubmitting, setAssignSubmitting] = useState(false);

  // Quick enroll modal
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [allStudents, setAllStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [enrollSubmitting, setEnrollSubmitting] = useState(false);

  // 1. Fetch Sessions
  const fetchSessions = useCallback(async () => {
    try {
      const res = await api.get('/sessions').catch(() => null);
      const list = res?.data?.data || res?.data?.sessions || [];
      setSessions(list);
      if (list.length > 0) {
        const active = list.find((s) => s.isCurrent) || list[0];
        const activeId = active._id || active.id;
        setSelectedSessionId((prev) => prev || activeId);
        setCreateForm((f) => ({ ...f, sessionId: f.sessionId || activeId }));
      }
    } catch (err) {
      console.warn('Could not load sessions:', err);
    }
  }, []);

  // 2. Fetch ClassRooms for selected session
  const fetchClassRooms = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedSessionId) params.sessionId = selectedSessionId;
      const res = await getClassRooms(params);
      setClassRooms(res?.classRooms || res?.data?.classRooms || []);
    } catch (err) {
      console.error('Error fetching classrooms:', err);
      setClassRooms([]);
    } finally {
      setLoading(false);
    }
  }, [selectedSessionId]);

  // 3. Fetch Teachers list
  const fetchTeachers = useCallback(async () => {
    try {
      const res = await getTeachers({ limit: 200 }).catch(() => null);
      const list = res?.teachers || res?.data?.teachers || [];
      setTeachers(list);
    } catch (err) {
      console.warn('Could not load teachers:', err);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
    fetchTeachers();
  }, [fetchSessions, fetchTeachers]);

  useEffect(() => {
    fetchClassRooms();
  }, [fetchClassRooms]);

  // Create classroom handler
  const handleCreateClassRoom = async (e) => {
    e.preventDefault();
    setCreateSubmitting(true);
    setCreateError('');
    try {
      await createClassRoom(createForm);
      setIsCreateModalOpen(false);
      setCreateForm((f) => ({
        ...f,
        className: 'Class 10',
        classCode: 'CLS-10',
        sectionName: 'Section A',
        sectionCode: 'SEC-A',
        room: 'Room 101',
        capacity: 40,
        classTeacherId: '',
      }));
      fetchClassRooms();
    } catch (err) {
      setCreateError(err?.response?.data?.message || err.message || 'Failed to create classroom');
    } finally {
      setCreateSubmitting(false);
    }
  };

  // Assign class teacher
  const handleAssignTeacherSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClassRoom || !assignTeacherId) return;
    setAssignSubmitting(true);
    try {
      const classRoomId = selectedClassRoom._id || selectedClassRoom.id;
      await assignClassTeacher(classRoomId, {
        teacherId: assignTeacherId,
        notes: assignNotes,
      });
      setTeacherModalOpen(false);
      setSelectedClassRoom(null);
      setAssignTeacherId('');
      setAssignNotes('');
      fetchClassRooms();
    } catch (err) {
      console.error('Error assigning teacher:', err);
    } finally {
      setAssignSubmitting(false);
    }
  };

  // Remove teacher
  const handleRemoveTeacher = async (classRoom) => {
    if (!window.confirm(`Remove class teacher from ${classRoom.displayName}?`)) return;
    try {
      const classRoomId = classRoom._id || classRoom.id;
      await removeClassTeacher(classRoomId, { reason: 'Unassigned by administrator' });
      fetchClassRooms();
    } catch (err) {
      console.error('Error removing teacher:', err);
    }
  };

  // Open Quick Enroll modal
  const handleOpenEnrollModal = async (classRoom) => {
    setSelectedClassRoom(classRoom);
    setSelectedStudentIds([]);
    setEnrollModalOpen(true);
    setStudentsLoading(true);
    try {
      const res = await getStudents({ limit: 300 }).catch(() => null);
      const list = res?.students || res?.data?.students || [];
      // Filter out students already enrolled in this classroom
      const alreadyIds = new Set(
        (classRoom.students || []).map((s) => String(s.studentId?._id || s.studentId || s))
      );
      setAllStudents(list.filter((s) => !alreadyIds.has(String(s._id || s.id))));
    } catch (err) {
      console.warn('Could not load students:', err);
    } finally {
      setStudentsLoading(false);
    }
  };

  // Submit Enroll Students
  const handleEnrollSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClassRoom || selectedStudentIds.length === 0) return;
    setEnrollSubmitting(true);
    try {
      const classRoomId = selectedClassRoom._id || selectedClassRoom.id;
      await enrollStudents(classRoomId, { studentIds: selectedStudentIds });
      setEnrollModalOpen(false);
      setSelectedClassRoom(null);
      setSelectedStudentIds([]);
      fetchClassRooms();
    } catch (err) {
      console.error('Error enrolling students:', err);
    } finally {
      setEnrollSubmitting(false);
    }
  };

  // Delete classroom
  const handleDeleteClassRoom = async (classRoom) => {
    if (
      !window.confirm(
        `Are you sure you want to delete classroom "${classRoom.displayName}"? This cannot be undone.`
      )
    ) {
      return;
    }
    try {
      await deleteClassRoom(classRoom._id || classRoom.id);
      fetchClassRooms();
    } catch (err) {
      console.error('Error deleting classroom:', err);
    }
  };

  // Lookup Student Session Journey
  const handleLookupStudentHistory = async (e) => {
    if (e) e.preventDefault();
    if (!studentSearchInput.trim()) return;
    setHistoryLoading(true);
    setHistoryError('');
    setStudentHistoryData(null);
    try {
      const res = await getStudentSessionHistory(studentSearchInput.trim());
      setStudentHistoryData(res);
      setHistoryModalOpen(true);
    } catch (err) {
      setHistoryError(
        err?.response?.data?.message || 'Could not find student history with this ID or Admission Number.'
      );
      setHistoryModalOpen(true);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Filter classrooms by search query
  const filteredClassRooms = useMemo(() => {
    return classRooms.filter((c) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        c.displayName?.toLowerCase().includes(q) ||
        c.className?.toLowerCase().includes(q) ||
        c.sectionName?.toLowerCase().includes(q) ||
        c.room?.toLowerCase().includes(q) ||
        c.currentClassTeacher?.teacherName?.toLowerCase().includes(q)
      );
    });
  }, [classRooms, search]);

  const activeSessionObj = sessions.find((s) => (s._id || s.id) === selectedSessionId);

  return (
    <div className="space-y-6 pb-16">
      {/* ── Top Header ────────────────────────────────────────────────────────── */}
      <PageHeader
        title="Classroom & Session Management"
        subtitle="Manage session-scoped classrooms, assign class teachers from the Teacher module, configure timetables, and track student enrollment progression."
        breadcrumbs={[
          { label: 'Academics', to: '/academics' },
          { label: 'Classes & Rooms' },
        ]}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setStudentSearchInput('');
                setStudentHistoryData(null);
                setHistoryError('');
                setHistoryModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-bold border border-amber-500/30 transition shadow-xs"
              title="Lookup student enrollment and progression history across sessions"
            >
              <GraduationCap size={16} className="text-amber-600 dark:text-amber-400" />
              <span>Student History Journey</span>
            </button>

            <Can module="academics" action="create">
              <CanButton id="CREATE_CLASSROOM">
                <button
                  onClick={() => {
                    setCreateError('');
                    setIsCreateModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md shadow-indigo-500/20 transition-all"
                >
                  <Plus size={16} />
                  <span>New ClassRoom</span>
                </button>
              </CanButton>
            </Can>
          </div>
        }
      />

      {/* ── Session Switcher & Quick Search Banner ────────────────────────────── */}
      <div className="bg-gradient-to-br from-indigo-900/90 via-slate-900 to-slate-950 text-white rounded-3xl p-5 sm:p-6 border border-indigo-700/30 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-white/10 backdrop-blur-md text-indigo-300 text-sm">
                <School size={18} />
              </span>
              <h3 className="text-lg font-black tracking-tight text-white">
                Academic Session: {activeSessionObj?.name || 'Active Session'}
              </h3>
              {activeSessionObj?.isCurrent && (
                <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Current Active
                </span>
              )}
            </div>
            <p className="text-xs text-indigo-200/80">
              Each classroom is scoped per session (e.g., Class 10-A in 2025-26). Assigning a Class Teacher records an immutable assignment timeline and links timetables cleanly.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Session Dropdown */}
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-3.5 py-2 rounded-xl text-xs">
              <Calendar size={14} className="text-indigo-300 shrink-0" />
              <span className="text-indigo-200 font-semibold shrink-0">Session:</span>
              <select
                value={selectedSessionId}
                onChange={(e) => setSelectedSessionId(e.target.value)}
                className="bg-transparent font-extrabold text-white focus:outline-none cursor-pointer pr-4"
              >
                {sessions.map((sess) => (
                  <option
                    key={sess._id || sess.id}
                    value={sess._id || sess.id}
                    className="bg-slate-900 text-white"
                  >
                    {sess.name} {sess.isCurrent ? '★ (Active)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Student History Search Bar */}
            <form onSubmit={handleLookupStudentHistory} className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl px-2 py-1">
              <input
                type="text"
                placeholder="Student ID / Adm No..."
                value={studentSearchInput}
                onChange={(e) => setStudentSearchInput(e.target.value)}
                className="bg-transparent text-xs text-white placeholder:text-slate-400 px-2 py-1 focus:outline-none w-36 sm:w-44"
              />
              <button
                type="submit"
                disabled={historyLoading}
                className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1"
                title="Lookup Student History"
              >
                {historyLoading ? <Loader size="sm" /> : <Search size={13} />}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ── Filter Bar & View Toggle ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by class, section, room, or teacher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-slate-500 font-semibold">
            {filteredClassRooms.length} {filteredClassRooms.length === 1 ? 'ClassRoom' : 'ClassRooms'}
          </span>
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {/* ── Content Area: Cards or Table ─────────────────────────────────────── */}
      {loading ? (
        <Loader fullPage size="lg" text="Loading classrooms for session..." />
      ) : filteredClassRooms.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-500 flex items-center justify-center mx-auto">
            <School size={32} />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              No ClassRooms in this Session
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
              Create your first session-scoped classroom (e.g. Class 10 - Section A for {activeSessionObj?.name || 'this session'}) to assign a class teacher, timetable, and enroll students.
            </p>
          </div>
          <button
            onClick={() => {
              setCreateError('');
              setIsCreateModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-md shadow-indigo-500/20"
          >
            <Plus size={15} /> Create ClassRoom
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClassRooms.map((cls) => {
            const classId = cls._id || cls.id;
            const teacher = cls.currentClassTeacher;
            const enrolledCount = cls.students?.length || 0;
            const cap = cls.capacity || 40;
            const pct = Math.min(100, Math.round((enrolledCount / cap) * 100));

            return (
              <div
                key={classId}
                className="group relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 p-5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Top Row: Class & Section + Room Pill */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <h4 className="text-base font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                          {cls.displayName || `${cls.className} · ${cls.sectionName}`}
                        </h4>
                      </div>
                      <p className="text-[11px] font-mono text-slate-400 font-semibold">
                        Code: {cls.classCode || 'N/A'}-{cls.sectionCode || 'A'} · {cls.sessionName}
                      </p>
                    </div>

                    <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700 shrink-0">
                      {cls.room || 'Room N/A'}
                    </span>
                  </div>

                  {/* Class Teacher Card */}
                  <div className="mt-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      <span className="flex items-center gap-1">
                        <UserCheck size={12} className="text-indigo-500" />
                        <span>Class Teacher</span>
                      </span>
                      {teacher?.teacherName ? (
                        <button
                          onClick={() => handleRemoveTeacher(cls)}
                          className="text-rose-500 hover:text-rose-600 transition"
                          title="Unassign class teacher"
                        >
                          Remove
                        </button>
                      ) : null}
                    </div>

                    {teacher?.teacherName ? (
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-bold flex items-center justify-center text-xs shadow-sm shrink-0">
                          {teacher.teacherName.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {teacher.teacherName}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {teacher.teacherEmail || teacher.teacherPhone || 'Staff Teacher'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold italic flex items-center gap-1">
                          <AlertCircle size={13} /> Unassigned
                        </span>
                        <button
                          onClick={() => {
                            setSelectedClassRoom(cls);
                            setAssignTeacherId('');
                            setAssignNotes('');
                            setTeacherModalOpen(true);
                          }}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 hover:underline"
                        >
                          + Assign Teacher
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Enrollment Progress Bar */}
                  <div className="mt-4 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-slate-500 flex items-center gap-1 text-[11px]">
                        <Users size={12} /> Enrollment Capacity
                      </span>
                      <span className="text-slate-900 dark:text-white font-mono text-[11px]">
                        {enrolledCount} / {cap} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          pct >= 95
                            ? 'bg-rose-500'
                            : pct >= 75
                            ? 'bg-amber-500'
                            : 'bg-indigo-600'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Timetable Indicator */}
                  <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Clock size={12} className="text-indigo-500" />
                      <span>Timetable:</span>
                    </span>
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate max-w-[150px]">
                      {cls.timetableTitle || (cls.timetableId ? 'Linked' : 'Not Configured')}
                    </span>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEnrollModal(cls)}
                      className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 transition"
                      title="Quick Enroll Students"
                    >
                      <UserPlus size={15} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedClassRoom(cls);
                        setAssignTeacherId(cls.currentClassTeacher?.teacherId || '');
                        setAssignNotes('');
                        setTeacherModalOpen(true);
                      }}
                      className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 transition"
                      title="Change Class Teacher"
                    >
                      <UserCheck size={15} />
                    </button>
                    <button
                      onClick={() => handleDeleteClassRoom(cls)}
                      className="p-2 rounded-xl text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-600 transition"
                      title="Delete ClassRoom"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <Link
                    to={`/academics/classes/${classId}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition group-hover:bg-indigo-600 group-hover:text-white"
                  >
                    <span>Manage</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">ClassRoom</th>
                  <th className="py-3.5 px-4">Session</th>
                  <th className="py-3.5 px-4">Room</th>
                  <th className="py-3.5 px-4">Class Teacher</th>
                  <th className="py-3.5 px-4">Enrollment</th>
                  <th className="py-3.5 px-4">Timetable</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredClassRooms.map((cls) => {
                  const classId = cls._id || cls.id;
                  const teacher = cls.currentClassTeacher;
                  const enrolledCount = cls.students?.length || 0;
                  return (
                    <tr
                      key={classId}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        <Link
                          to={`/academics/classes/${classId}`}
                          className="hover:text-indigo-600 dark:hover:text-indigo-400"
                        >
                          {cls.displayName || `${cls.className} · ${cls.sectionName}`}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono">
                        {cls.sessionName}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        {cls.room || '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        {teacher?.teacherName ? (
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {teacher.teacherName}
                            </span>
                          </div>
                        ) : (
                          <span className="text-amber-500 font-semibold italic text-[11px]">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold">
                        {enrolledCount} / {cls.capacity || 40}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 truncate max-w-[150px]">
                        {cls.timetableTitle || (cls.timetableId ? 'Linked' : '—')}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEnrollModal(cls)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Enroll Students"
                          >
                            <UserPlus size={14} />
                          </button>
                          <Link
                            to={`/academics/classes/${classId}`}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="View Class"
                          >
                            <ArrowRight size={14} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── MODAL 1: Create ClassRoom ────────────────────────────────────────── */}
      <Modal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        size="md"
        title={
          <div className="flex items-center gap-2">
            <School size={18} className="text-indigo-600" />
            <span>Create Session ClassRoom</span>
          </div>
        }
        subtitle="Defines a class and section instance scoped to an academic year."
      >
        <div className="space-y-4">

            {createError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateClassRoom} className="space-y-4 text-xs font-medium">
              {/* Session Select */}
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">
                  Academic Session *
                </label>
                <select
                  required
                  value={createForm.sessionId}
                  onChange={(e) => setCreateForm({ ...createForm, sessionId: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {sessions.map((s) => (
                    <option key={s._id || s.id} value={s._id || s.id}>
                      {s.name} {s.isCurrent ? '★ (Current Session)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Class & Section Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">
                    Class Level *
                  </label>
                  <select
                    value={createForm.className}
                    onChange={(e) => {
                      const val = e.target.value;
                      const opt = CLASS_OPTIONS.find((c) => c.name === val);
                      setCreateForm({
                        ...createForm,
                        className: val,
                        classCode: opt?.code || val.toUpperCase().replace(/\s+/g, '-'),
                      });
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {CLASS_OPTIONS.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">
                    Section *
                  </label>
                  <select
                    value={createForm.sectionName}
                    onChange={(e) => {
                      const val = e.target.value;
                      const opt = SECTION_OPTIONS.find((s) => s.name === val);
                      setCreateForm({
                        ...createForm,
                        sectionName: val,
                        sectionCode: opt?.code || val.replace(/Section\s*/i, 'SEC-'),
                      });
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {SECTION_OPTIONS.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Class Teacher from Teacher module */}
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">
                  Class Teacher (Assigned from Teacher Module)
                </label>
                <select
                  value={createForm.classTeacherId}
                  onChange={(e) => setCreateForm({ ...createForm, classTeacherId: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="">-- No Class Teacher (Assign Later) --</option>
                  {teachers.map((t) => (
                    <option key={t._id || t.id} value={t._id || t.id}>
                      {t.name} · {t.employeeId || t.email || 'Teacher'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Room & Capacity */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">
                    Lecture Room
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Room 204"
                    value={createForm.room}
                    onChange={(e) => setCreateForm({ ...createForm, room: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">
                    Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="150"
                    value={createForm.capacity}
                    onChange={(e) => setCreateForm({ ...createForm, capacity: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-2 shadow-md shadow-indigo-500/20"
                >
                  {createSubmitting && <Loader size="sm" />}
                  <span>{createSubmitting ? 'Creating...' : 'Create ClassRoom'}</span>
                </button>
              </div>
            </form>
        </div>
      </Modal>

      {/* ── MODAL 2: Assign / Change Class Teacher ───────────────────────────── */}
      <Modal
        open={Boolean(teacherModalOpen && selectedClassRoom)}
        onClose={() => setTeacherModalOpen(false)}
        size="sm"
        title={
          <div className="flex items-center gap-2">
            <UserCheck size={18} className="text-indigo-600" />
            <span>Assign Class Teacher</span>
          </div>
        }
        subtitle={selectedClassRoom ? `Target: ${selectedClassRoom.displayName}` : ''}
      >
        <div className="space-y-4">

            <form onSubmit={handleAssignTeacherSubmit} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">
                  Select Teacher from Faculty Module *
                </label>
                <select
                  required
                  value={assignTeacherId}
                  onChange={(e) => setAssignTeacherId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="">-- Choose a teacher --</option>
                  {teachers.map((t) => (
                    <option key={t._id || t.id} value={t._id || t.id}>
                      {t.name} · {t.employeeId || t.email || 'Faculty'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">
                  Assignment Notes / Responsibility Remarks
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Appointed primary class mentor for session 2025-26"
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setTeacherModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assignSubmitting || !assignTeacherId}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-2 shadow-md shadow-indigo-500/20"
                >
                  {assignSubmitting && <Loader size="sm" />}
                  <span>{assignSubmitting ? 'Assigning...' : 'Confirm Assignment'}</span>
                </button>
              </div>
            </form>
        </div>
      </Modal>

      {/* ── MODAL 3: Quick Enroll Students ───────────────────────────────────── */}
      <Modal
        open={Boolean(enrollModalOpen && selectedClassRoom)}
        onClose={() => setEnrollModalOpen(false)}
        size="lg"
        title={
          <div className="flex items-center gap-2">
            <UserPlus size={18} className="text-indigo-600" />
            <span>Enroll Students into ClassRoom</span>
          </div>
        }
        subtitle={selectedClassRoom ? `Target: ${selectedClassRoom.displayName}` : ''}
      >
        <div className="space-y-4">

            <form onSubmit={handleEnrollSubmit} className="space-y-4 text-xs font-medium flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400 font-bold">
                  Select Students ({selectedStudentIds.length} selected)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedStudentIds.length === allStudents.length) {
                      setSelectedStudentIds([]);
                    } else {
                      setSelectedStudentIds(allStudents.map((s) => s._id || s.id));
                    }
                  }}
                  className="text-indigo-600 hover:underline font-bold"
                >
                  {selectedStudentIds.length === allStudents.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              {studentsLoading ? (
                <div className="py-8 text-center"><Loader size="md" text="Loading eligible students..." /></div>
              ) : allStudents.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  All active students are already enrolled in this classroom or none found.
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-2xl p-2 space-y-1.5 max-h-72">
                  {allStudents.map((st) => {
                    const sid = st._id || st.id;
                    const isChecked = selectedStudentIds.includes(sid);
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
                              if (e.target.checked) {
                                setSelectedStudentIds((prev) => [...prev, sid]);
                              } else {
                                setSelectedStudentIds((prev) => prev.filter((id) => id !== sid));
                              }
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
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {st.status || 'Active'}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEnrollModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={enrollSubmitting || selectedStudentIds.length === 0}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-2 shadow-md shadow-indigo-500/20"
                >
                  {enrollSubmitting && <Loader size="sm" />}
                  <span>{enrollSubmitting ? 'Enrolling...' : `Enroll (${selectedStudentIds.length}) Students`}</span>
                </button>
              </div>
            </form>
        </div>
      </Modal>

      {/* ── MODAL 4: Student Session Journey Timeline ────────────────────────── */}
      <Modal
        open={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        size="xl"
        title={
          <div className="flex items-center gap-2">
            <GraduationCap size={20} className="text-amber-500" />
            <span>Student Session Enrollment Journey</span>
          </div>
        }
        subtitle="Track full academic trajectory, class teacher history, and promotions across sessions."
      >
        <div className="space-y-4">

            {/* Quick search input within modal */}
            <form onSubmit={handleLookupStudentHistory} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Student ID or Admission No (e.g. ADM-2025-001)..."
                value={studentSearchInput}
                onChange={(e) => setStudentSearchInput(e.target.value)}
                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={historyLoading}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                {historyLoading ? <Loader size="sm" /> : <Search size={14} />}
                <span>Lookup</span>
              </button>
            </form>

            {historyError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{historyError}</span>
              </div>
            )}

            {studentHistoryData && (
              <div className="space-y-4 pt-2">
                {/* Student Profile Snapshot */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-50 to-indigo-500/10 dark:from-amber-950/20 dark:via-slate-800 dark:to-indigo-950/20 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{studentHistoryData.student?.name}</span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold">
                        {studentHistoryData.student?.admissionNumber || 'ADM-N/A'}
                      </span>
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Current: <span className="font-bold text-slate-700 dark:text-slate-200">{studentHistoryData.currentClassRoom?.displayName || `${studentHistoryData.student?.className} - ${studentHistoryData.student?.sectionName}` || 'Unassigned'}</span>
                      {' · '}Roll #{studentHistoryData.student?.rollNumber || '—'}
                    </p>
                  </div>

                  {studentHistoryData.currentClassTeacher && (
                    <div className="text-xs text-slate-600 dark:text-slate-300 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-200/60 dark:border-slate-700 space-y-0.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Class Teacher</span>
                      <p className="font-extrabold text-slate-900 dark:text-white">
                        {studentHistoryData.currentClassTeacher.name}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {studentHistoryData.currentClassTeacher.email || studentHistoryData.currentClassTeacher.phone || 'Faculty'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Session Timeline */}
                <div className="space-y-3">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Clock size={13} className="text-indigo-500" />
                    <span>Academic Progression Timeline ({studentHistoryData.history?.length || 0} Sessions)</span>
                  </h5>

                  {(!studentHistoryData.history || studentHistoryData.history.length === 0) ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No historical session records found for this student.
                    </div>
                  ) : (
                    <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-indigo-200 dark:before:bg-indigo-900">
                      {studentHistoryData.history.map((h, idx) => (
                        <div key={idx} className="relative group">
                          {/* Dot */}
                          <div className="absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full bg-indigo-600 border-2 border-white dark:border-slate-900 shadow-xs" />
                          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-1 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                                {h.className} · {h.sectionName}
                              </span>
                              <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                {h.sessionName}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                              <span>Roll Number: <strong className="text-slate-700 dark:text-slate-300">#{h.rollNumber || '—'}</strong></span>
                              <span>Status: <strong className="text-emerald-600 dark:text-emerald-400">{h.status || 'Enrolled'}</strong></span>
                            </div>
                            {h.promotedTo && (
                              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold pt-1 border-t border-slate-100 dark:border-slate-700/60">
                                ↗ Promoted to: {h.promotedTo.className} ({h.promotedTo.sessionName})
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
        </div>
      </Modal>
    </div>
  );
};

export default ClassList;
