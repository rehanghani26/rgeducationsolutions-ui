/**
 * ResultEntryTable.jsx
 * Dynamic mark entry table: rows = students, columns = subjects.
 * Auto-computes grade, percentage per student as marks are entered.
 */

import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

const calcGrade = (pct) => {
  if (pct >= 91) return 'A+';
  if (pct >= 81) return 'A';
  if (pct >= 71) return 'B+';
  if (pct >= 61) return 'B';
  if (pct >= 51) return 'C+';
  if (pct >= 41) return 'C';
  if (pct >= 33) return 'D';
  return 'F';
};

const gradeColor = (grade) => {
  const map = {
    'A+': 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400',
    'A':  'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400',
    'B+': 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400',
    'B':  'text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400',
    'C+': 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400',
    'C':  'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400',
    'D':  'text-orange-600 bg-orange-50 dark:bg-orange-950/40 dark:text-orange-400',
    'F':  'text-red-600 bg-red-50 dark:bg-red-950/40 dark:text-red-400',
  };
  return map[grade] || 'text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400';
};

const ResultEntryTable = ({ students = [], subjects = [], existingResults = [], onSave, saving = false }) => {
  // marksMap: { studentId: { subjectName: { obtained, maxMarks, passMarks } } }
  const [marksMap, setMarksMap] = useState({});
  const [remarksMap, setRemarksMap] = useState({});
  const [collapsed, setCollapsed] = useState({});

  // Pre-fill from existing results
  useEffect(() => {
    const initial = {};
    const initRemarks = {};

    existingResults.forEach((res) => {
      const sid = res.studentId?.toString();
      if (!sid) return;
      initial[sid] = {};
      initRemarks[sid] = res.remarks || '';
      (res.marks || []).forEach((m) => {
        initial[sid][m.subjectName] = {
          obtained: m.obtained ?? '',
          maxMarks: m.maxMarks ?? 100,
          passMarks: m.passMarks ?? 35,
        };
      });
    });

    setMarksMap(initial);
    setRemarksMap(initRemarks);
  }, [existingResults]);

  const setMark = useCallback((studentId, subjectName, value, maxMarks, passMarks) => {
    setMarksMap((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [subjectName]: { obtained: value, maxMarks, passMarks },
      },
    }));
  }, []);

  const getStudentSummary = (studentId) => {
    const sMarks = marksMap[studentId] || {};
    let total = 0, max = 0, filled = 0;
    subjects.forEach((sub) => {
      const entry = sMarks[sub.subjectName];
      if (entry && entry.obtained !== '' && entry.obtained !== undefined) {
        total += Number(entry.obtained);
        max += Number(entry.maxMarks || sub.maxMarks || 100);
        filled++;
      }
    });
    const pct = max > 0 ? parseFloat(((total / max) * 100).toFixed(1)) : 0;
    return { total, max, pct, grade: filled > 0 ? calcGrade(pct) : '—', filled, complete: filled === subjects.length };
  };

  const handleSave = () => {
    const resultsData = students.map((student) => {
      const sid = student._id || student.id;
      const sMarks = marksMap[sid] || {};
      return {
        studentId: sid,
        studentName: student.name,
        studentEmail: student.email || '',
        admissionNumber: student.admissionNumber,
        rollNumber: student.rollNumber,
        section: student.section || student.sectionName,
        remarks: remarksMap[sid] || '',
        marks: subjects.map((sub) => {
          const entry = sMarks[sub.subjectName] || {};
          return {
            subjectName: sub.subjectName,
            subjectCode: sub.subjectCode || sub.code,
            bookName: sub.bookName || '',
            obtained: Number(entry.obtained) || 0,
            maxMarks: Number(entry.maxMarks || sub.maxMarks || 100),
            passMarks: Number(entry.passMarks || sub.passMarks || 35),
          };
        }),
      };
    });

    onSave?.(resultsData);
  };

  const toggleCollapse = (sid) => setCollapsed((p) => ({ ...p, [sid]: !p[sid] }));

  if (!subjects.length) {
    return (
      <div className="text-center py-12 text-slate-400">
        <AlertCircle size={40} className="mx-auto mb-3 opacity-40 text-amber-500" />
        <p className="text-sm font-semibold">No subjects scheduled for this exam.</p>
        <p className="text-xs text-slate-500 mt-1">Configure subjects for this exam in Exams Management.</p>
      </div>
    );
  }

  if (!students.length) {
    return (
      <div className="text-center py-12 text-slate-400">
        <AlertCircle size={40} className="mx-auto mb-3 opacity-40 text-indigo-500" />
        <p className="text-sm font-semibold">No students found for this class and section.</p>
        <p className="text-xs text-slate-500 mt-1">Try selecting &apos;All Sections&apos; or enroll students in Student Management.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Subject Header Info */}
      <div className="flex flex-wrap gap-2 mb-2">
        {subjects.map((sub) => (
          <span key={sub.subjectName} className="text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5">
            <span>{sub.subjectName}</span>
            {sub.bookName && <span className="opacity-75 font-normal">({sub.bookName})</span>}
            <span className="text-slate-400 font-semibold">[{sub.maxMarks || 100}M]</span>
          </span>
        ))}
      </div>

      {/* Desktop: Horizontal Table */}
      <div className="hidden lg:block overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
              <th className="p-3 text-left font-bold text-slate-500 uppercase tracking-wide sticky left-0 bg-slate-50 dark:bg-slate-800/60 z-10 min-w-[210px]">
                Student (Roll / Name / Email)
              </th>
              {subjects.map((sub) => (
                <th key={sub.subjectName} className="p-3 text-center font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide min-w-[120px]">
                  <span className="block text-[11px] font-extrabold text-slate-800 dark:text-slate-100">{sub.subjectName}</span>
                  {sub.bookName && (
                    <span className="block text-[9px] text-indigo-600 dark:text-indigo-400 font-semibold truncate max-w-[130px] mx-auto" title={sub.bookName}>
                      📖 {sub.bookName}
                    </span>
                  )}
                  <span className="block text-[9px] text-slate-400 font-medium">Max: {sub.maxMarks || 100} · Pass: {sub.passMarks || 35}</span>
                </th>
              ))}
              <th className="p-3 text-center font-bold text-slate-500 uppercase tracking-wide min-w-[80px]">Total %</th>
              <th className="p-3 text-center font-bold text-slate-500 uppercase tracking-wide min-w-[60px]">Grade</th>
              <th className="p-3 text-center font-bold text-slate-500 uppercase tracking-wide min-w-[120px]">Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {students.map((student, idx) => {
              const sid = student._id || student.id;
              const summary = getStudentSummary(sid);
              return (
                <tr key={sid} className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors ${idx % 2 === 0 ? '' : 'bg-slate-50/30 dark:bg-slate-800/10'}`}>
                  {/* Student Info */}
                  <td className="p-3 sticky left-0 bg-white dark:bg-slate-900 z-10 border-r border-slate-100 dark:border-slate-800/60">
                    <p className="font-bold text-slate-800 dark:text-white text-[12px]">{student.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-500">
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">Roll: {student.rollNumber ?? '—'}</span>
                      <span>·</span>
                      <span>{student.admissionNumber}</span>
                    </div>
                    {student.email && (
                      <p className="text-[10px] text-slate-400 truncate max-w-[190px] mt-0.5" title={student.email}>
                        {student.email}
                      </p>
                    )}
                  </td>
                  {/* Subject Mark Inputs */}
                  {subjects.map((sub) => {
                    const sMarks = marksMap[sid] || {};
                    const entry = sMarks[sub.subjectName] || {};
                    const maxM = sub.maxMarks || 100;
                    const passM = sub.passMarks || 35;
                    const val = entry.obtained !== undefined ? entry.obtained : '';
                    const isFail = val !== '' && Number(val) < passM;
                    return (
                      <td key={sub.subjectName} className="p-2 text-center">
                        <input
                          type="number"
                          min={0}
                          max={maxM}
                          value={val}
                          onChange={(e) => setMark(sid, sub.subjectName, e.target.value, maxM, passM)}
                          className={`w-16 text-center py-1.5 px-1 rounded-md text-xs font-bold border transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                            isFail
                              ? 'border-red-400 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400'
                              : val !== ''
                              ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                          }`}
                          placeholder="—"
                        />
                      </td>
                    );
                  })}
                  {/* Summary */}
                  <td className="p-2 text-center">
                    <span className="font-black text-slate-800 dark:text-white text-sm">{summary.filled > 0 ? `${summary.pct}%` : '—'}</span>
                  </td>
                  <td className="p-2 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${gradeColor(summary.grade)}`}>
                      {summary.grade}
                    </span>
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={remarksMap[sid] || ''}
                      onChange={(e) => setRemarksMap((p) => ({ ...p, [sid]: e.target.value }))}
                      className="w-full text-[10px] py-1 px-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      placeholder="Optional..."
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile: Card-based Entry */}
      <div className="lg:hidden space-y-3">
        {students.map((student) => {
          const sid = student._id || student.id;
          const summary = getStudentSummary(sid);
          const isCollapsed = collapsed[sid];
          return (
            <div key={sid} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleCollapse(sid)}
                className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 text-left"
              >
                <div>
                  <p className="font-bold text-slate-800 dark:text-white text-sm">{student.name}</p>
                  <p className="text-[10px] text-slate-400">{student.admissionNumber} · Roll {student.rollNumber || '—'}</p>
                </div>
                <div className="flex items-center gap-3">
                  {summary.filled > 0 && (
                    <>
                      <span className="text-xs font-black text-slate-700 dark:text-slate-200">{summary.pct}%</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${gradeColor(summary.grade)}`}>{summary.grade}</span>
                    </>
                  )}
                  {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                </div>
              </button>
              {!isCollapsed && (
                <div className="p-4 space-y-3">
                  {subjects.map((sub) => {
                    const sMarks = marksMap[sid] || {};
                    const entry = sMarks[sub.subjectName] || {};
                    const maxM = sub.maxMarks || 100;
                    const passM = sub.passMarks || 35;
                    const val = entry.obtained !== undefined ? entry.obtained : '';
                    return (
                      <div key={sub.subjectName} className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{sub.subjectName}</p>
                          <p className="text-[9px] text-slate-400">Max: {maxM} · Pass: {passM}</p>
                        </div>
                        <input
                          type="number"
                          min={0}
                          max={maxM}
                          value={val}
                          onChange={(e) => setMark(sid, sub.subjectName, e.target.value, maxM, passM)}
                          className="w-20 text-center py-1.5 px-2 rounded-lg text-sm font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="0"
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
        <p className="text-xs text-slate-500">
          <CheckCircle size={12} className="inline mr-1 text-emerald-500" />
          Results will be saved as <strong>Draft</strong>. Admin must publish to make visible to students.
        </p>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-xs font-bold py-2.5 px-6 rounded-lg shadow-sm transition-all"
        >
          {saving ? 'Saving...' : 'Save Results as Draft'}
        </button>
      </div>
    </div>
  );
};

export default ResultEntryTable;
