import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import {
  Calendar,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  Trash2,
  Edit,
  ShieldAlert,
  Users,
  GraduationCap,
  Layers,
  Search,
  Filter,
} from 'lucide-react';
import api from '../../services/api.js';
import { CLASS_OPTIONS } from '../../constants/academicOptions.js';

const SessionManagementSettings = () => {
  const [sessions, setSessions] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // New session form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);
  const [notes, setNotes] = useState('');

  // Promotion state
  const [selectedClass, setSelectedClass] = useState('All Classes');
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [targetSession, setTargetSession] = useState('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [submittingUpgrade, setSubmittingUpgrade] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [canRollback, setCanRollback] = useState(false);

  // Progress Bar Overlay state
  const [isPromoting, setIsPromoting] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressStatusText, setProgressStatusText] = useState('');
  const [promotionTitle, setPromotionTitle] = useState('');

  const runWithProgress = async (title, apiCallFn) => {
    setIsPromoting(true);
    setPromotionTitle(title);
    setProgressPercent(15);
    setProgressStatusText('Initializing student promotion sequence...');

    const timer = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev >= 92) return 92;
        const step = Math.floor(Math.random() * 12) + 5;
        const nextVal = Math.min(prev + step, 92);
        if (nextVal > 30 && nextVal <= 60) {
          setProgressStatusText('Updating student records & passout marks in DB...');
        } else if (nextVal > 60 && nextVal <= 85) {
          setProgressStatusText('Synchronizing academic progression...');
        } else if (nextVal > 85) {
          setProgressStatusText('Finalizing database transaction...');
        }
        return nextVal;
      });
    }, 250);

    try {
      const res = await apiCallFn();
      clearInterval(timer);
      setProgressPercent(100);
      setProgressStatusText('Completed successfully!');
      await new Promise((r) => setTimeout(r, 450));
      return res;
    } catch (err) {
      clearInterval(timer);
      throw err;
    } finally {
      clearInterval(timer);
      setIsPromoting(false);
    }
  };

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [sessRes, studRes, promoRes] = await Promise.all([
        api.get('/sessions').catch(() => null),
        api.get('/students').catch(() => null),
        api.get('/students/promotion-status').catch(() => null),
      ]);

      if (sessRes?.data?.sessions) {
        setSessions(sessRes.data.sessions);
        const activeSess = sessRes.data.sessions.find((s) => s.isCurrent);
        if (activeSess) setTargetSession(activeSess.sessionName);
      }

      if (studRes?.data?.students || Array.isArray(studRes?.data)) {
        const list = studRes.data.students || studRes.data;
        setStudents(list);
      }

      const hasLocalTimestamp = (() => {
        const ts = localStorage.getItem('lastPromotionTimestamp');
        if (!ts) return false;
        const diffHours = (Date.now() - Number(ts)) / (1000 * 60 * 60);
        return diffHours < 24;
      })();

      if (promoRes?.data?.canRollback || hasLocalTimestamp) {
        setCanRollback(true);
      } else {
        setCanRollback(false);
      }
    } catch (err) {
      console.error('Error loading session data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const activeSession = useMemo(
    () => sessions.find((s) => s.isCurrent) || sessions[0],
    [sessions]
  );

  // Class & search filtered students
  const filteredStudents = useMemo(() => {
    if (!students.length) return [];
    const normalizedSel = (selectedClass || '').split(' - ')[0].trim().toLowerCase();
    return students.filter((s) => {
      const clsName = String(s.className || s.class || '').split(' - ')[0].trim().toLowerCase();
      const matchClass = !selectedClass || selectedClass === 'All Classes' || clsName === normalizedSel;
      const matchSearch =
        !searchTerm ||
        (s.name && s.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.admissionNumber && s.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchClass && matchSearch;
    });
  }, [students, selectedClass, searchTerm]);

  const safeToast = (type, message) => {
    try {
      if (toast && typeof toast[type] === 'function') {
        toast[type](message);
      }
    } catch (err) {
      console.warn('Toast display suppressed:', err);
    }
  };

  // Handle Add Session Submit
  const handleCreateSession = async (e) => {
    e.preventDefault();
    if (!newSessionName || !startDate || !endDate) {
      safeToast('error', 'Please enter session name, start date, and end date.');
      return;
    }
    try {
      const res = await api.post('/sessions', {
        sessionName: newSessionName,
        startDate,
        endDate,
        isCurrent,
        notes,
      });
      if (res.data?.success) {
        safeToast('success', `Academic Session ${newSessionName} created!`);
        setNewSessionName('');
        setStartDate('');
        setEndDate('');
        setIsCurrent(false);
        setNotes('');
        setShowAddModal(false);
        fetchInitialData();
      }
    } catch (err) {
      safeToast('error', err.response?.data?.message || 'Failed to create session');
    }
  };

  // Handle Activate Session
  const handleActivateSession = async (id, name) => {
    try {
      const res = await api.patch(`/sessions/${id}/activate`);
      if (res.data?.success) {
        safeToast('success', `Academic Session "${name}" is now active!`);
        fetchInitialData();
      }
    } catch (err) {
      safeToast('error', err.response?.data?.message || 'Failed to activate session');
    }
  };

  // Handle Whole-School Bulk Upgrade
  const handleWholeSchoolUpgrade = async () => {
    setSubmittingUpgrade(true);
    try {
      const res = await runWithProgress('⚡ Upgrading Whole School Session...', () =>
        api.post('/students/promote', {
          mode: 'whole_school',
          action: 'promote',
          targetSession: targetSession || activeSession?.sessionName || '2026-2027',
        })
      );
      if (res.data?.success) {
        safeToast('success', `⚡ Whole School Session Upgrade Complete! ${res.data.updatedCount} students promoted!`);
        setShowUpgradeModal(false);
        localStorage.setItem('lastPromotionTimestamp', String(Date.now()));
        setCanRollback(true);
        fetchInitialData();
      }
    } catch (err) {
      safeToast('error', err.response?.data?.message || 'Bulk promotion failed');
    } finally {
      setSubmittingUpgrade(false);
    }
  };

  // Handle Class-Wise or Individual Student Promote/Demote
  const handlePromoteDemote = async (action, mode = 'individual') => {
    const isPromote = action === 'promote';
    if (mode === 'individual' && selectedStudentIds.length === 0) {
      safeToast('error', 'Please select at least one student to process.');
      return;
    }

    const titleText = `${isPromote ? 'Promoting' : 'Demoting'} ${selectedStudentIds.length} Student(s)...`;

    try {
      const res = await runWithProgress(titleText, () =>
        api.post('/students/promote', {
          mode,
          action,
          sourceClass: selectedClass,
          studentIds: selectedStudentIds,
          targetSession: targetSession || activeSession?.sessionName || '',
        })
      );

      if (res.data?.success) {
        safeToast(
          'success',
          `Successfully ${isPromote ? 'promoted' : 'demoted'} ${res.data.updatedCount} student(s)!`
        );
        setSelectedStudentIds([]);
        if (isPromote) {
          localStorage.setItem('lastPromotionTimestamp', String(Date.now()));
          setCanRollback(true);
        } else {
          localStorage.removeItem('lastPromotionTimestamp');
          setCanRollback(false);
        }
        fetchInitialData();
      }
    } catch (err) {
      safeToast('error', err.response?.data?.message || `${action} action failed`);
    }
  };

  // Handle Rollback Promotion within 24 Hours
  const handleRollbackPromotion = async () => {
    try {
      const res = await runWithProgress('⏪ Rolling Back Last Promotion (24h Window)...', () =>
        api.post('/students/rollback-promotion', { maxHours: 24 })
      );

      if (res.data?.success) {
        if (res.data.revertedCount > 0) {
          safeToast('success', `⏪ Successfully rolled back promotion for ${res.data.revertedCount} student(s) back to previous state!`);
          localStorage.removeItem('lastPromotionTimestamp');
          setCanRollback(false);
          fetchInitialData();
        } else {
          safeToast('info', 'No student promotions found within the last 24 hours to rollback.');
          localStorage.removeItem('lastPromotionTimestamp');
          setCanRollback(false);
        }
      }
    } catch (err) {
      safeToast('error', err.response?.data?.message || 'Rollback failed');
    }
  };

  const toggleSelectAll = () => {
    if (selectedStudentIds.length === filteredStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredStudents.map((s) => s.id || s._id));
    }
  };

  const toggleStudentSelect = (id) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-8 pb-10">
      {/* ── HEADER BANNER ── */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-indigo-500/20">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
              <Sparkles size={14} className="animate-spin-slow" /> Academic Session Management & Student Upgrade
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Academic Session & Class Promotion Engine
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
              Configure school academic years, define start & end dates, run single-click whole school session upgrades, and promote or demote specific classes and students.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-extrabold text-xs text-white shadow-lg transition-all"
            >
              <Plus size={16} /> New Session
            </button>

            {canRollback && (
              <button
                onClick={handleRollbackPromotion}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-900/80 hover:bg-purple-800 text-purple-200 font-extrabold text-xs border border-purple-500/50 shadow-lg transition-all animate-pulse"
                title="Rollback recent promotions performed within the last 24 hours"
              >
                ⏪ Undo Upgrade (24h)
              </button>
            )}

            <button
              onClick={() => setShowUpgradeModal(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 font-black text-xs text-slate-950 shadow-xl transition-all"
            >
              ⚡ Upgrade Whole School Session
            </button>
          </div>
        </div>

        {/* Current Active Session Badge Bar */}
        {activeSession && (
          <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="flex items-center gap-3 bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
              <Clock className="text-indigo-400" size={18} />
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Active Academic Session</p>
                <p className="font-black text-white text-sm">{activeSession.sessionName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
              <Calendar className="text-emerald-400" size={18} />
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Session Start & End Date</p>
                <p className="font-extrabold text-slate-200">
                  {new Date(activeSession.startDate).toLocaleDateString()} — {new Date(activeSession.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
              <Users className="text-amber-400" size={18} />
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Total Enrolled Students</p>
                <p className="font-black text-white text-sm">{students.length} Active Records</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── SECTION 1: ACADEMIC SESSIONS LIST & CONFIGURATION ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar size={18} className="text-indigo-600" /> Academic Session Configuration & Dates
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage school session timelines. Set start date, end date, and mark active session.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
                <th className="py-3 px-4">Session Name</th>
                <th className="py-3 px-4">Start Date</th>
                <th className="py-3 px-4">End Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sessions.map((sess) => (
                <tr key={sess._id || sess.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-black text-slate-900 dark:text-white flex items-center gap-2">
                    {sess.sessionName}
                    {sess.isCurrent && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                        ACTIVE CURRENT
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-600 dark:text-slate-300">
                    {new Date(sess.startDate).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-600 dark:text-slate-300">
                    {new Date(sess.endDate).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                        sess.isCurrent
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {sess.status || (sess.isCurrent ? 'active' : 'upcoming')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {!sess.isCurrent && (
                      <button
                        onClick={() => handleActivateSession(sess._id || sess.id, sess.sessionName)}
                        className="px-3 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-extrabold text-[11px] border border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800 transition-all"
                      >
                        Set Active
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── SECTION 2: INDIVIDUAL STUDENT PROMOTION / DEMOTION TOOL ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <GraduationCap size={18} className="text-indigo-600" /> Individual Student Progression & Promotion
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select specific student(s) to promote to the next class level (or mark Passout for Class 12) or demote back.
            </p>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Filter Class:</label>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setSelectedStudentIds([]);
              }}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
            >
              <option value="All Classes">All Classes (Entire School)</option>
              {CLASS_OPTIONS.map((cls) => (
                <option key={cls.value} value={cls.label}>
                  {cls.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Target Academic Session:</label>
            <select
              value={targetSession}
              onChange={(e) => setTargetSession(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
            >
              {sessions.map((s) => (
                <option key={s._id || s.id} value={s.sessionName}>
                  Session {s.sessionName} {s.isCurrent ? '(Active)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Search Student:</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search name or roll no..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              />
            </div>
          </div>
        </div>

        {/* Selected Actions Bar */}
        {selectedStudentIds.length > 0 && (
          <div className="bg-indigo-50 dark:bg-indigo-950/60 p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-800 flex items-center justify-between flex-wrap gap-3">
            <span className="text-xs font-black text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-indigo-600" />
              {selectedStudentIds.length} Student(s) Selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePromoteDemote('promote', 'individual')}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-xs flex items-center gap-1 transition-all"
              >
                <ArrowUpRight size={14} /> Promote Selected
              </button>
              <button
                onClick={() => handlePromoteDemote('demote', 'individual')}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-xs flex items-center gap-1 transition-all"
              >
                <ArrowDownRight size={14} /> Demote Selected
              </button>
            </div>
          </div>
        )}

        {/* Students Table */}
        <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase font-bold text-[10px] border-b border-slate-200 dark:border-slate-700">
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={filteredStudents.length > 0 && selectedStudentIds.length === filteredStudents.length}
                    onChange={toggleSelectAll}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Admission No.</th>
                <th className="py-3 px-4">Current Class</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Individual Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                    No students found in {selectedClass}.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((stud) => {
                  const sId = stud.id || stud._id;
                  const isSelected = selectedStudentIds.includes(sId);
                  const isPassout = stud.status === 'Passout' || stud.className === 'Passout';

                  return (
                    <tr key={sId} className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 ${isSelected ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''}`}>
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleStudentSelect(sId)}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="py-3 px-4 font-black text-slate-900 dark:text-white">
                        {stud.name}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-500">
                        {stud.admissionNumber || 'ADM-001'}
                      </td>
                      <td className="py-3 px-4 font-bold text-indigo-600 dark:text-indigo-400">
                        {stud.className || stud.class || selectedClass}
                      </td>
                      <td className="py-3 px-4">
                        {isPassout ? (
                          <span className="px-2.5 py-0.5 rounded-full font-black text-[9px] uppercase bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-300">
                            🎓 PASSOUT
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                            ACTIVE
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            setSelectedStudentIds([sId]);
                            handlePromoteDemote('promote', 'individual');
                          }}
                          className="px-2.5 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-black text-[10px] border border-emerald-200 transition-all"
                        >
                          ⬆️ Promote
                        </button>
                        <button
                          onClick={() => {
                            setSelectedStudentIds([sId]);
                            handlePromoteDemote('demote', 'individual');
                          }}
                          className="px-2.5 py-1 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 font-black text-[10px] border border-rose-200 transition-all"
                        >
                          ⬇️ Demote
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODAL: CREATE ACADEMIC SESSION ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="text-indigo-600" /> Create New Academic Session
            </h3>

            <form onSubmit={handleCreateSession} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Session Name (e.g. 2026-2027):</label>
                <input
                  type="text"
                  placeholder="2026-2027"
                  value={newSessionName}
                  onChange={(e) => setNewSessionName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Start Date:</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">End Date:</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isCurrentCheck"
                  checked={isCurrent}
                  onChange={(e) => setIsCurrent(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <label htmlFor="isCurrentCheck" className="font-extrabold text-slate-800 dark:text-slate-200">
                  Set as Active Current Session
                </label>
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Notes / Description:</label>
                <textarea
                  rows={2}
                  placeholder="Optional session details..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black shadow-lg"
                >
                  Save Academic Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: BULK WHOLE SCHOOL SESSION UPGRADE ── */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-amber-500/30 shadow-2xl space-y-6">
            <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center font-black text-xl">
                ⚡
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Confirm Whole School Session Upgrade
                </h3>
                <p className="text-xs text-slate-500">Bulk promote all students across all classes</p>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/40 p-4 rounded-2xl border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-2">
              <p className="font-extrabold flex items-center gap-1.5">
                <AlertTriangle size={16} className="text-amber-600" /> Progression Rules:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-1 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                <li>Every student will be automatically promoted to the next logical class level (e.g. Class 1 → Class 2, Class 9 → Class 10).</li>
                <li><strong>Class 12 Students:</strong> Will pass out and be marked with <span className="font-black text-purple-600 dark:text-purple-300">🎓 Passout</span> status tag!</li>
                <li>Target Academic Session: <strong>{targetSession || activeSession?.sessionName}</strong>.</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowUpgradeModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submittingUpgrade || isPromoting}
                onClick={handleWholeSchoolUpgrade}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-xl transition-all"
              >
                {submittingUpgrade || isPromoting ? 'Promoting All Students...' : '⚡ Upgrade Whole School Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DYNAMIC PROMOTION PROGRESS BAR OVERLAY ── */}
      {isPromoting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 rounded-3xl p-8 max-w-md w-full border border-indigo-500/30 shadow-2xl space-y-6 text-white text-center relative overflow-hidden">
            <div className="absolute -right-12 -top-12 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -left-12 -bottom-12 w-40 h-40 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center mx-auto text-indigo-400">
                <Sparkles className="animate-spin text-indigo-400" size={32} />
              </div>

              <div>
                <h3 className="text-lg font-black text-white tracking-tight">
                  {promotionTitle || 'Processing Student Promotion...'}
                </h3>
                <p className="text-xs text-slate-400 mt-1 font-medium">
                  Communicating with backend database. Please do not close or refresh.
                </p>
              </div>

              {/* Progress Bar Container */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center text-xs font-extrabold text-slate-300">
                  <span className="text-[11px] text-indigo-300 font-semibold">{progressStatusText}</span>
                  <span className="text-indigo-400 font-black">{progressPercent}%</span>
                </div>
                <div className="w-full h-3.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-400 rounded-full transition-all duration-300 shadow-md"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-[10px] text-slate-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                API Query Active & Syncing Database...
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionManagementSettings;
