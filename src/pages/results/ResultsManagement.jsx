/**
 * ResultsManagement.jsx
 * Full dynamic Result Management page.
 *
 * Role-based views:
 * - Admin / Principal / Head-Teacher:
 *     Tab 1: Enter Results (select exam → class → mark entry table)
 *     Tab 2: Class Result Sheet (view, publish, bulk PDF)
 *     Tab 3: Analytics (toppers, grade dist, pass/fail)
 *     Tab 4: Student View (search any student)
 *
 * - Teacher:
 *     Tab 1: Enter Results
 *     Tab 2: Class Result Sheet
 *
 * - Student / Parent:
 *     Tab 1: My Result (select exam → marksheet)
 *     Tab 2: Result History
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award, BookOpen, Download, Printer, Search, ClipboardList,
  CheckCircle, BarChart2, Users, FileText, RefreshCw, ChevronRight,
  AlertCircle, Eye, TrendingUp, Star, Lock, Sparkles,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import Loader from '../../components/ui/Loader.jsx';
import Modal from '../../components/ui/Modal.jsx';
import ResultEntryTable from '../../components/results/ResultEntryTable.jsx';
import ResultHistoryTable from '../../components/results/ResultHistoryTable.jsx';
import MarksheetPDF, { downloadMarksheetPDF, getPdfLibs, printElement } from '../../components/results/MarksheetPDF.jsx';
import examService from '../../services/examService.js';
import resultService from '../../services/resultService.js';
import { getStudents } from '../../services/studentService.js';
import { mockResults, mockExams } from '../../data/mockData.js';
import { SECTION_OPTIONS } from '../../constants/academicOptions.js';

// ─── Helpers ────────────────────────────────────────────────────────────────
const useAuth = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return { user, role: user?.role || 'student' };
  } catch {
    return { user: {}, role: 'student' };
  }
};

const isAdminOrTeacher = (role) =>
  ['super-admin', 'school-admin', 'admin', 'principal', 'head-teacher', 'teacher'].includes(role?.toLowerCase());

const isStudentOrParent = (role) => ['student', 'parent'].includes(role?.toLowerCase());

const gradeColor = (grade) => {
  const map = { 'A+': 'text-emerald-600', 'A': 'text-emerald-600', 'B+': 'text-blue-600', 'B': 'text-blue-600', 'C+': 'text-amber-600', 'C': 'text-amber-600', 'D': 'text-orange-600', 'F': 'text-red-600' };
  return map[grade] || 'text-slate-500';
};

const gradeBg = (grade) => {
  const map = { 'A+': 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300', 'A': 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300', 'B+': 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300', 'B': 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300', 'C+': 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300', 'C': 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300', 'D': 'bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300', 'F': 'bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300' };
  return map[grade] || 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400';
};

// ─── SubComponents ────────────────────────────────────────────────────────────

const SelectField = ({ label, value, onChange, options, placeholder = 'Select...', disabled }) => (
  <div>
    {label && <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 tracking-wide">{label}</label>}
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  </div>
);

// ─── View: Enter Results (Admin/Teacher) ──────────────────────────────────────
const EnterResultsView = ({ exams, loading }) => {
  const [selectedExamId, setSelectedExamId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedClassName, setSelectedClassName] = useState('');
  const [selectedSection, setSelectedSection] = useState('All');
  const [classData, setClassData] = useState(null);
  const [loadingClass, setLoadingClass] = useState(false);
  const [saving, setSaving] = useState(false);

  const selectedExam = exams.find((e) => (e._id || e.id) === selectedExamId);
  const classOptions = selectedExam?.classIds?.length
    ? selectedExam.classIds.map((id, i) => ({ value: id, label: selectedExam.classNames?.[i] || id }))
    : selectedExam?.classes?.map((c) => ({ value: c, label: c })) || [];

  const subjects = selectedExam?.subjectSchedule?.length
    ? selectedExam.subjectSchedule
    : (selectedExam?.subjects || []).map((s) => ({ subjectName: typeof s === 'string' ? s : s.name, maxMarks: 100, passMarks: 35 }));

  useEffect(() => {
    if (!selectedExamId || !selectedClassId) { setClassData(null); return; }
    setLoadingClass(true);

    const parts = (selectedClassName || selectedClassId).split(/\s*[-–—|]\s*/);
    const baseClass = parts[0]?.trim() || selectedClassId;
    const currentSection = selectedSection && selectedSection !== 'All' ? selectedSection : '';

    const studentQueryParams = {
      className: baseClass,
      limit: 200,
    };
    if (currentSection) {
      studentQueryParams.sectionName = currentSection;
    }

    const resultQueryParams = {};
    if (currentSection) {
      resultQueryParams.section = currentSection;
    }

    Promise.allSettled([
      getStudents(studentQueryParams),
      resultService.getClassResults(selectedExamId, selectedClassId, resultQueryParams),
    ]).then(([studentsRes, resultsRes]) => {
      const studentList = studentsRes.status === 'fulfilled'
        ? (studentsRes.value?.students || studentsRes.value?.data || [])
        : [];
      const resultData = resultsRes.status === 'fulfilled'
        ? resultsRes.value
        : { results: [], allStudents: [] };

      // Map real students from student module
      const rawStudents = studentList.length > 0 ? studentList : (resultData?.allStudents || []);
      const mappedStudents = rawStudents.map((s) => ({
        _id: s._id || s.id,
        name: s.name || `${s.firstName || ''} ${s.lastName || ''}`.trim() || 'Student',
        rollNumber: s.rollNumber ?? '',
        admissionNumber: s.admissionNumber || s._id || s.id,
        email: s.email || '',
        section: s.section || s.sectionName || currentSection || 'Section A',
      }));

      setClassData({
        ...resultData,
        allStudents: mappedStudents,
        results: resultData?.results || [],
      });
    }).finally(() => {
      setLoadingClass(false);
    });
  }, [selectedExamId, selectedClassId, selectedClassName, selectedSection]);

  const handleSave = async (resultsData) => {
    if (!selectedExamId || !selectedClassId) { toast.warning('Please select exam and class'); return; }
    setSaving(true);
    try {
      await resultService.bulkUpsert({
        examId: selectedExamId,
        classId: selectedClassId,
        className: selectedClassName,
        section: selectedSection !== 'All' ? selectedSection : '',
        resultsData,
      });
      const params = {};
      if (selectedSection && selectedSection !== 'All') params.section = selectedSection;
      const refreshed = await resultService.getClassResults(selectedExamId, selectedClassId, params);
      if (refreshed) {
        setClassData((prev) => ({
          ...prev,
          ...refreshed,
          allStudents: prev?.allStudents?.length ? prev.allStudents : refreshed.allStudents,
        }));
      }
    } catch (_) {}
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      {/* Selectors */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <h3 className="font-extrabold text-sm text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <ClipboardList size={16} className="text-indigo-500" /> Select Exam, Class & Section
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SelectField
            label="Examination"
            value={selectedExamId}
            onChange={(v) => { setSelectedExamId(v); setSelectedClassId(''); setSelectedSection('All'); setClassData(null); }}
            options={exams.map((e) => ({ value: e._id || e.id, label: `${e.name} (${e.term})` }))}
            placeholder="— Select Exam —"
          />
          <SelectField
            label="Class"
            value={selectedClassId}
            onChange={(v) => {
              setSelectedClassId(v);
              const label = classOptions.find((c) => c.value === v)?.label || v;
              setSelectedClassName(label);
              if (label.includes('-')) {
                const secPart = label.split(/\s*[-–—|]\s*/)[1]?.trim();
                if (secPart && (selectedSection === 'All' || !selectedSection)) {
                  setSelectedSection(secPart);
                }
              }
            }}
            options={classOptions}
            placeholder="— Select Class —"
            disabled={!selectedExamId}
          />
          <SelectField
            label="Section"
            value={selectedSection}
            onChange={(v) => setSelectedSection(v)}
            options={[
              { value: 'All', label: 'All Sections' },
              ...SECTION_OPTIONS.map((s) => ({ value: s.name, label: s.name })),
            ]}
            disabled={!selectedClassId}
          />
        </div>

        {selectedExam && (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full font-bold border border-indigo-200 dark:border-indigo-800">
              {selectedExam.session || '2025-26'}
            </span>
            <span className={`text-[10px] px-3 py-1 rounded-full font-bold border ${selectedExam.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : selectedExam.status === 'ongoing' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
              {selectedExam.status?.toUpperCase()}
            </span>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full font-bold border border-slate-200 dark:border-slate-700">
              {subjects.length} Subject{subjects.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Entry Table */}
      {loadingClass ? (
        <Loader text="Loading class students..." />
      ) : classData ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">
                Mark Entry — {selectedClassName}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {classData.allStudents?.length || 0} students · {subjects.length} subjects
              </p>
            </div>
            {classData.results?.some((r) => r.status === 'published') && (
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                ✓ Results Published
              </span>
            )}
          </div>
          <ResultEntryTable
            students={classData.allStudents || []}
            subjects={subjects}
            existingResults={classData.results || []}
            onSave={handleSave}
            saving={saving}
          />
        </div>
      ) : selectedExamId && selectedClassId ? (
        <div className="text-center py-12 text-slate-400">
          <AlertCircle size={40} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">No data found. Ensure students are enrolled in this class.</p>
        </div>
      ) : (
        <div className="text-center py-16 text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
          <ClipboardList size={48} className="mx-auto mb-3 opacity-30" />
          <p className="font-semibold">Select an Exam and Class to begin entering results</p>
          <p className="text-xs mt-1">Marks can be entered for all students at once</p>
        </div>
      )}
    </div>
  );
};

// ─── View: Class Result Sheet ─────────────────────────────────────────────────
const ClassResultsView = ({ exams, role }) => {
  const [selectedExamId, setSelectedExamId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedClassName, setSelectedClassName] = useState('');
  const [selectedSection, setSelectedSection] = useState('All');
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const pdfRef = useRef(null);

  const selectedExam = exams.find((e) => (e._id || e.id) === selectedExamId);
  const classOptions = selectedExam?.classIds?.length
    ? selectedExam.classIds.map((id, i) => ({ value: id, label: selectedExam.classNames?.[i] || id }))
    : selectedExam?.classes?.map((c) => ({ value: c, label: c })) || [];

  const fetchClassResults = useCallback(() => {
    if (!selectedExamId || !selectedClassId) { setClassData(null); return; }
    setLoading(true);

    const parts = (selectedClassName || selectedClassId).split(/\s*[-–—|]\s*/);
    const baseClass = parts[0]?.trim() || selectedClassId;
    const currentSection = selectedSection && selectedSection !== 'All' ? selectedSection : '';

    const studentQueryParams = {
      className: baseClass,
      limit: 200,
    };
    if (currentSection) {
      studentQueryParams.sectionName = currentSection;
    }

    const resultQueryParams = {};
    if (currentSection) {
      resultQueryParams.section = currentSection;
    }

    Promise.allSettled([
      getStudents(studentQueryParams),
      resultService.getClassResults(selectedExamId, selectedClassId, resultQueryParams),
    ]).then(([studentsRes, resultsRes]) => {
      const studentList = studentsRes.status === 'fulfilled'
        ? (studentsRes.value?.students || studentsRes.value?.data || [])
        : [];
      const resultData = resultsRes.status === 'fulfilled'
        ? resultsRes.value
        : { results: [], allStudents: [] };

      const rawStudents = studentList.length > 0 ? studentList : (resultData?.allStudents || []);
      const mappedStudents = rawStudents.map((s) => ({
        _id: s._id || s.id,
        name: s.name || `${s.firstName || ''} ${s.lastName || ''}`.trim() || 'Student',
        rollNumber: s.rollNumber ?? '',
        admissionNumber: s.admissionNumber || s._id || s.id,
        email: s.email || '',
        section: s.section || s.sectionName || currentSection || 'Section A',
      }));

      setClassData({
        ...resultData,
        allStudents: mappedStudents,
        results: resultData?.results || [],
      });
    }).finally(() => {
      setLoading(false);
    });
  }, [selectedExamId, selectedClassId, selectedClassName, selectedSection]);

  useEffect(() => { fetchClassResults(); }, [fetchClassResults]);

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const params = {};
      if (selectedSection && selectedSection !== 'All') params.section = selectedSection;
      await resultService.publish(selectedExamId, selectedClassId, params);
      fetchClassResults();
    } catch (_) {}
    finally { setPublishing(false); }
  };

  const handleDownloadSingle = async (result) => {
    setSelectedResult(result);
    await new Promise((r) => setTimeout(r, 200));
    await downloadMarksheetPDF(pdfRef, `Result_${result.studentName}_${result.examName}`);
    setSelectedResult(null);
  };

  const handleBulkPDF = async () => {
    if (!classData?.results?.length) return;
    setDownloadingAll(true);
    toast.info('Generating bulk PDFs... this may take a moment');
    try {
      const libs = await getPdfLibs();
      if (!libs) {
        toast.warning('PDF generator could not be loaded. Please use the print option.');
        if (pdfRef.current) printElement(pdfRef.current, `Results_${selectedClassName}`);
        setDownloadingAll(false);
        return;
      }

      const { jsPDF, html2canvas } = libs;
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      let isFirst = true;

      for (const result of classData.results) {
        setSelectedResult(result);
        await new Promise((r) => setTimeout(r, 200));

        if (!pdfRef.current) continue;
        pdfRef.current.style.display = 'block';
        await new Promise((r) => setTimeout(r, 80));

        const canvas = await html2canvas(pdfRef.current, { scale: 2, backgroundColor: '#ffffff', logging: false });
        pdfRef.current.style.display = 'none';

        const imgData = canvas.toDataURL('image/png');
        const pdfW = pdf.internal.pageSize.getWidth();
        const pdfH = (canvas.height * pdfW) / canvas.width;

        if (!isFirst) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, 0, pdfW, pdfH);
        isFirst = false;
      }

      pdf.save(`Results_${selectedClassName}_${selectedSection !== 'All' ? selectedSection : ''}_${selectedExam?.name || 'Exam'}.pdf`);
      setSelectedResult(null);
      toast.success('Bulk PDF downloaded successfully!');
    } catch (err) {
      console.error('Bulk PDF error:', err);
      toast.error('Bulk PDF generation failed.');
    } finally {
      if (pdfRef.current) pdfRef.current.style.display = 'none';
      setDownloadingAll(false);
    }
  };

  const results = classData?.results || [];
  const draftCount = results.filter((r) => r.status === 'draft').length;
  const publishedCount = results.filter((r) => r.status === 'published').length;
  const canPublish = !role || ['super-admin', 'school-admin', 'admin', 'principal', 'head-teacher', 'teacher'].includes(role?.toLowerCase());

  return (
    <div className="space-y-6">
      {/* Selectors */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SelectField label="Examination" value={selectedExamId} onChange={(v) => { setSelectedExamId(v); setSelectedClassId(''); setSelectedSection('All'); }} options={exams.map((e) => ({ value: e._id || e.id, label: `${e.name} (${e.term})` }))} placeholder="— Select Exam —" />
          <SelectField
            label="Class"
            value={selectedClassId}
            onChange={(v) => {
              setSelectedClassId(v);
              const label = classOptions.find((c) => c.value === v)?.label || v;
              setSelectedClassName(label);
              if (label.includes('-')) {
                const secPart = label.split(/\s*[-–—|]\s*/)[1]?.trim();
                if (secPart && (selectedSection === 'All' || !selectedSection)) {
                  setSelectedSection(secPart);
                }
              }
            }}
            options={classOptions}
            placeholder="— Select Class —"
            disabled={!selectedExamId}
          />
          <SelectField
            label="Section"
            value={selectedSection}
            onChange={(v) => setSelectedSection(v)}
            options={[
              { value: 'All', label: 'All Sections' },
              ...SECTION_OPTIONS.map((s) => ({ value: s.name, label: s.name })),
            ]}
            disabled={!selectedClassId}
          />
        </div>
      </div>

      {loading ? <Loader text="Fetching class results..." /> : classData ? (
        <>
          {/* Actions bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                {results.length} Students {selectedSection !== 'All' ? `(${selectedSection})` : ''}
              </span>
              {draftCount > 0 && <span className="text-[10px] font-bold text-amber-700 bg-amber-100 dark:bg-amber-950/40 px-3 py-1.5 rounded-full">{draftCount} Draft</span>}
              {publishedCount > 0 && <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950/40 px-3 py-1.5 rounded-full">{publishedCount} Published</span>}
            </div>
            <div className="flex gap-2">
              {canPublish && draftCount > 0 && (
                <button onClick={handlePublish} disabled={publishing} className="flex items-center gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg disabled:opacity-60 transition-all">
                  <CheckCircle size={13} /> {publishing ? 'Publishing...' : `Declare / Publish ${draftCount} Results`}
                </button>
              )}
              {results.length > 0 && (
                <button onClick={handleBulkPDF} disabled={downloadingAll} className="flex items-center gap-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg disabled:opacity-60 transition-all">
                  <Download size={13} /> {downloadingAll ? 'Generating...' : 'Bulk PDF'}
                </button>
              )}
            </div>
          </div>

          {/* Result Table */}
          {results.length > 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-bold uppercase text-slate-500 border-b border-slate-200 dark:border-slate-800">
                      <th className="p-3 text-center w-12">Rank</th>
                      <th className="p-3 text-left min-w-[200px]">Student (Roll / Name / Email)</th>
                      <th className="p-3 text-left min-w-[220px]">Subject Earned Marks & Books</th>
                      <th className="p-3 text-center">Marks</th>
                      <th className="p-3 text-center">Percentage</th>
                      <th className="p-3 text-center">Grade</th>
                      <th className="p-3 text-center">GPA</th>
                      <th className="p-3 text-center">Result</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-center">Marksheet</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {results.map((result, idx) => (
                      <tr key={result._id || idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="p-3 text-center">
                          <span className={`text-xs font-black ${idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-slate-400' : idx === 2 ? 'text-amber-700' : 'text-slate-500'}`}>
                            {result.rank ? `#${result.rank}` : '—'}
                          </span>
                        </td>
                        <td className="p-3">
                          <p className="font-bold text-slate-800 dark:text-white text-xs">{result.studentName}</p>
                          <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-500">
                            <span className="font-semibold text-indigo-600 dark:text-indigo-400">Roll: {result.rollNumber ?? '—'}</span>
                            <span>·</span>
                            <span>{result.admissionNumber}</span>
                            {result.section && (
                              <span className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold px-1.5 py-0.2 rounded text-[9px]">
                                {result.section}
                              </span>
                            )}
                          </div>
                          {result.studentEmail && (
                            <p className="text-[10px] text-slate-400 truncate max-w-[190px] mt-0.5" title={result.studentEmail}>
                              {result.studentEmail}
                            </p>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1 max-w-[260px]">
                            {(result.marks || []).map((m, mIdx) => (
                              <span
                                key={mIdx}
                                title={`${m.subjectName}${m.bookName ? ` (${m.bookName})` : ''}: ${m.obtained}/${m.maxMarks} (Pass: ${m.passMarks})`}
                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded border inline-flex items-center gap-1 ${
                                  m.isPassed
                                    ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                    : 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                                }`}
                              >
                                <span>{m.subjectCode || m.subjectName?.slice(0, 5)}:</span>
                                <strong>{m.obtained}</strong>/{m.maxMarks}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-3 text-center text-xs font-extrabold text-slate-800 dark:text-white">{result.totalObtained}/{result.totalMaxMarks}</td>
                        <td className="p-3 text-center">
                          <span className="text-sm font-black text-slate-900 dark:text-white">{result.percentage?.toFixed(1)}%</span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-md ${gradeBg(result.grade)}`}>{result.grade}</span>
                        </td>
                        <td className="p-3 text-center text-xs font-bold text-purple-600 dark:text-purple-400">{result.gpa?.toFixed(1)}</td>
                        <td className="p-3 text-center">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${result.isPassed ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400'}`}>
                            {result.isPassed ? 'PASS' : 'FAIL'}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${result.status === 'published' ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'}`}>
                            {result.status}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <button onClick={() => handleDownloadSingle(result)} className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 px-2 py-1 rounded-lg transition-colors">
                            <Download size={11} /> PDF
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
              <FileText size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-semibold">No results entered yet.</p>
              <p className="text-xs mt-1">Go to "Enter Results" tab to upload marks for this class.</p>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
          <Eye size={48} className="mx-auto mb-3 opacity-30" />
          <p className="font-semibold">Select an Exam and Class to view results</p>
        </div>
      )}

      {/* Hidden PDF for single/bulk */}
      <MarksheetPDF ref={pdfRef} result={selectedResult} />
    </div>
  );
};

// ─── View: Analytics ─────────────────────────────────────────────────────────
const AnalyticsView = ({ exams }) => {
  const [selectedExamId, setSelectedExamId] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedExamId) { setStats(null); return; }
    setLoading(true);
    resultService.getExamStats(selectedExamId)
      .then((d) => setStats(d.stats))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, [selectedExamId]);

  const gradeOrder = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <SelectField label="Select Exam for Analytics" value={selectedExamId} onChange={setSelectedExamId} options={exams.map((e) => ({ value: e._id || e.id, label: `${e.name} (${e.term})` }))} placeholder="— Select Exam —" />
      </div>

      {loading ? <Loader text="Computing analytics..." /> : stats ? (
        <div className="space-y-5">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Students', value: stats.total || 0, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/30', icon: <Users size={18} /> },
              { label: 'Pass Rate', value: `${stats.passPercentage || 0}%`, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30', icon: <CheckCircle size={18} /> },
              { label: 'Class Average', value: `${stats.avgPercentage || 0}%`, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30', icon: <BarChart2 size={18} /> },
              { label: 'Failed', value: stats.failed || 0, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950/30', icon: <AlertCircle size={18} /> },
            ].map(({ label, value, color, bg, icon }) => (
              <div key={label} className={`${bg} border border-slate-200 dark:border-slate-700 rounded-xl p-4`}>
                <div className={`${color} mb-2`}>{icon}</div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">{label}</p>
                <p className={`text-2xl font-black ${color} mt-1`}>{value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Toppers */}
            {stats.toppers?.length > 0 && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <Star size={15} className="text-amber-500" />
                  <h4 className="font-extrabold text-sm text-slate-800 dark:text-white">Top Performers</h4>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {stats.toppers.map((t, i) => (
                    <div key={i} className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-black w-7 h-7 flex items-center justify-center rounded-full ${i === 0 ? 'bg-amber-100 text-amber-600' : i === 1 ? 'bg-slate-100 text-slate-500' : i === 2 ? 'bg-orange-100 text-orange-600' : 'bg-slate-50 text-slate-400'}`}>
                          {i + 1}
                        </span>
                        <div>
                          <p className="font-bold text-xs text-slate-800 dark:text-white">{t.studentName}</p>
                          <p className="text-[9px] text-slate-400">{t.admissionNumber}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-sm text-indigo-600">{t.percentage}%</p>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${gradeBg(t.grade)}`}>{t.grade}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Grade Distribution */}
            {stats.gradeDistribution && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-4">
                <h4 className="font-extrabold text-sm text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <BarChart2 size={15} className="text-blue-500" /> Grade Distribution
                </h4>
                <div className="space-y-3">
                  {gradeOrder.map((grade) => {
                    const count = stats.gradeDistribution[grade] || 0;
                    const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
                    if (!count) return null;
                    return (
                      <div key={grade} className="flex items-center gap-3">
                        <span className={`text-[10px] font-extrabold w-7 text-center px-1 py-0.5 rounded ${gradeBg(grade)}`}>{grade}</span>
                        <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${grade === 'F' ? 'bg-red-500' : grade.startsWith('A') ? 'bg-emerald-500' : grade.startsWith('B') ? 'bg-blue-500' : grade.startsWith('C') ? 'bg-amber-500' : 'bg-orange-500'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 w-16 text-right">{count} ({pct.toFixed(0)}%)</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Pass/Fail visual */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <h4 className="font-extrabold text-sm text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp size={15} className="text-emerald-500" /> Pass / Fail Analysis
            </h4>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                  <div className="h-full bg-emerald-500 transition-all duration-700 rounded-l-full" style={{ width: `${stats.passPercentage || 0}%` }} />
                  <div className="h-full bg-red-400" style={{ width: `${100 - (stats.passPercentage || 0)}%` }} />
                </div>
                <div className="flex justify-between mt-2 text-[10px] font-bold">
                  <span className="text-emerald-600">✓ Pass: {stats.passed || 0}</span>
                  <span className="text-red-600">✗ Fail: {stats.failed || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : selectedExamId ? (
        <div className="text-center py-12 text-slate-400">
          <BarChart2 size={40} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">No published results yet for analytics.</p>
        </div>
      ) : (
        <div className="text-center py-16 text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
          <BarChart2 size={48} className="mx-auto mb-3 opacity-30" />
          <p className="font-semibold">Select an exam to view analytics</p>
        </div>
      )}
    </div>
  );
};

// ─── View: Student's My Result ────────────────────────────────────────────────
const StudentResultView = ({ studentId, studentName, exams }) => {
  const [selectedExamId, setSelectedExamId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const pdfRef = useRef(null);

  useEffect(() => {
    if (!selectedExamId || !studentId) { setResult(null); return; }
    setLoading(true);
    resultService.getStudentExamResult(selectedExamId, studentId)
      .then((d) => setResult(d.result))
      .catch(() => setResult(null))
      .finally(() => setLoading(false));
  }, [selectedExamId, studentId]);

  const handleDownload = async () => {
    await downloadMarksheetPDF(pdfRef, `Result_${studentName}_${result?.examName || 'Exam'}`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <SelectField
          label="Select Examination"
          value={selectedExamId}
          onChange={setSelectedExamId}
          options={exams.map((e) => ({ value: e._id || e.id, label: `${e.name} — ${e.term} (${e.session || '2025-26'})` }))}
          placeholder="— Choose Exam —"
        />
      </div>

      {loading ? <Loader text="Fetching your result..." /> : result ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase text-indigo-500 tracking-wider">{result.examName}</span>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">{result.studentName}</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Admission: {result.admissionNumber} · Class: {result.className} {result.section} · Roll: {result.rollNumber || '—'}
                </p>
              </div>
              <button onClick={handleDownload} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-all">
                <Download size={14} /> Download PDF
              </button>
            </div>

            {/* Summary Stats */}
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Total', value: `${result.totalObtained}/${result.totalMaxMarks}` },
                { label: 'Percentage', value: `${result.percentage?.toFixed(1)}%` },
                { label: 'Grade', value: result.grade, extra: gradeColor(result.grade) },
                { label: 'Rank', value: result.rank ? `#${result.rank}` : '—' },
              ].map(({ label, value, extra }) => (
                <div key={label} className="bg-white/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-center">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">{label}</p>
                  <p className={`text-lg font-black mt-1 ${extra || 'text-slate-800 dark:text-white'}`}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Subject Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-bold uppercase text-slate-500 border-b border-slate-200 dark:border-slate-800">
                  <th className="p-3 text-left">Subject</th>
                  <th className="p-3 text-center">Code</th>
                  <th className="p-3 text-center">Max Marks</th>
                  <th className="p-3 text-center">Obtained</th>
                  <th className="p-3 text-center">Grade</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {(result.marks || []).map((sub, i) => (
                  <tr key={i} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-3 font-bold text-slate-800 dark:text-white text-xs">{sub.subjectName}</td>
                    <td className="p-3 text-center font-mono text-[10px] text-slate-400">{sub.subjectCode || '—'}</td>
                    <td className="p-3 text-center text-xs text-slate-500">{sub.maxMarks}</td>
                    <td className="p-3 text-center text-sm font-black text-slate-900 dark:text-white">{sub.obtained}</td>
                    <td className="p-3 text-center">
                      <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-md ${gradeBg(sub.grade)}`}>{sub.grade || '—'}</span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`text-[10px] font-bold ${sub.isPassed ? 'text-emerald-600' : 'text-red-600'}`}>
                        {sub.isPassed ? '✓ Pass' : '✗ Fail'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <div className={`flex items-center gap-2 font-bold ${result.isPassed ? 'text-emerald-600' : 'text-red-600'}`}>
              {result.isPassed ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
              {result.isPassed ? 'PASSED' : `FAILED — ${result.failedSubjects?.join(', ')}`}
            </div>
            {result.publishedAt && (
              <p className="text-slate-400">Published {format(new Date(result.publishedAt), 'MMM d, yyyy')}</p>
            )}
          </div>
        </div>
      ) : selectedExamId ? (
        <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
          <Lock size={40} className="mx-auto mb-3 opacity-40" />
          <p className="font-semibold text-sm">Result not available yet</p>
          <p className="text-xs mt-1">Your teacher may not have uploaded or published results for this exam.</p>
        </div>
      ) : (
        <div className="text-center py-16 text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
          <Award size={48} className="mx-auto mb-3 opacity-30" />
          <p className="font-semibold">Select an exam to view your result</p>
        </div>
      )}

      {/* Hidden PDF */}
      <MarksheetPDF ref={pdfRef} result={result} />
    </div>
  );
};

// ─── View: Student History ────────────────────────────────────────────────────
const StudentHistoryView = ({ studentId, studentName, schoolName }) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;
    resultService.getStudentHistory(studentId, { status: 'published' })
      .then((d) => setResults(d.results || []))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [studentId]);

  if (loading) return <Loader text="Fetching your result history..." />;

  return <ResultHistoryTable results={results} studentName={studentName} schoolName={schoolName} />;
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const ResultsManagement = () => {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const isStaff = isAdminOrTeacher(role);
  const isStudent = isStudentOrParent(role);

  const [exams, setExams] = useState([]);
  const [examsLoading, setExamsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(isStudent ? 'my-result' : 'enter');

  // Tabs by role
  const tabs = isStaff ? [
    { id: 'enter', label: 'Enter Results', icon: ClipboardList },
    { id: 'class-results', label: 'Class Results', icon: Eye },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  ] : [
    { id: 'my-result', label: 'My Result', icon: Award },
    { id: 'history', label: 'Result History', icon: FileText },
  ];

  useEffect(() => {
    examService.getAll({ limit: 100 })
      .then((d) => {
        const list = Array.isArray(d?.exams) ? d.exams : Array.isArray(d?.data) ? d.data : Array.isArray(d) ? d : [];
        setExams(list.length ? list : mockExams);
      })
      .catch(() => setExams(mockExams))
      .finally(() => setExamsLoading(false));
  }, []);

  const studentId = user?._id || user?.id || user?.studentId;
  const studentName = user?.name || user?.fullName || 'Student';

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-12">
      <PageHeader
        title={isStaff ? 'Results Management' : 'My Academic Results'}
        subtitle={isStaff ? 'Enter, publish, and analyze student results for all classes' : 'View your marksheets and result history'}
        breadcrumbs={[{ label: 'Exams' }, { label: 'Results' }]}
        actions={
          <button
            onClick={() => navigate('/ai-mode?prompt=' + encodeURIComponent('Show exam results analytics, toppers, and pass rates.'))}
            className="flex items-center gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold py-2 px-3.5 rounded-lg shadow-sm transition-all"
            title="Ask RGES AI for Results & Performance Analytics"
          >
            <Sparkles size={13} className="text-amber-300" />
            <span>AI Analytics</span>
          </button>
        }
      />

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl w-fit">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === id
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {examsLoading ? (
            <Loader text="Loading examinations..." />
          ) : (
            <>
              {activeTab === 'enter'       && <EnterResultsView  exams={exams} loading={examsLoading} />}
              {activeTab === 'class-results' && <ClassResultsView exams={exams} role={role} />}
              {activeTab === 'analytics'   && <AnalyticsView     exams={exams} />}
              {activeTab === 'my-result'   && <StudentResultView studentId={studentId} studentName={studentName} exams={exams} />}
              {activeTab === 'history'     && <StudentHistoryView studentId={studentId} studentName={studentName} schoolName="RGES School" />}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default ResultsManagement;
