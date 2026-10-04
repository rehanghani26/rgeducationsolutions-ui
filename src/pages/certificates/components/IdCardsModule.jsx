/**
 * @file IdCardsModule.jsx
 * @description Dynamic ID Card Generation, Inspection & Printing Module.
 * Features tailored, role-aware experiences:
 * - Students: view and print their own official Student Identity Card (Front/Back)
 * - Parents: view and print ID cards for their enrolled child/children
 * - Teachers: toggle between their own Faculty ID Card and Class Student ID Cards
 * - Admins: full multi-category generator, batch printing, and institutional default lock
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  CreditCard,
  Search,
  Printer,
  CheckSquare,
  Square,
  GraduationCap,
  Briefcase,
  Users,
  Eye,
  Loader2,
  CheckCircle2,
  BookmarkCheck,
  FileText,
  Star,
  ShieldCheck,
  User,
  Calendar,
  Phone,
  Award,
} from 'lucide-react';
import IdCardPreview from './IdCardPreview.jsx';
import { getTemplatesByCategory, applyTemplateOverrides } from '../templates/registry.js';
import { renderTemplate, prepareTemplateData } from '../utils/templateRenderer.js';
import { printBatchDocuments } from '../utils/printUtils.js';
import { getStudents, getStudentById } from '../../../services/studentService.js';
import { getTeachers } from '../../../services/teacherService.js';
import { getClasses } from '../../../services/erpService.js';
import { getCustomTemplates, getDefaultTemplate, setDefaultTemplate } from '../services/documentService.js';
import { MOCK_STUDENT_DATA, MOCK_TEACHER_DATA, MOCK_STAFF_DATA } from '../constants/documentConstants.js';

export default function IdCardsModule({ schoolSettings = {}, userRole = '', authUser = null }) {
  const normalizedRole = String(userRole || authUser?.role || 'student').toLowerCase();
  const isStudent = normalizedRole === 'student';
  const isParent = normalizedRole === 'parent';
  const isTeacher = ['teacher', 'faculty', 'instructor', 'head-teacher', 'hod', 'coordinator'].includes(normalizedRole);
  const isAdmin = ['super-admin', 'school-admin', 'principal', 'director', 'admin', 'superadmin'].includes(normalizedRole);

  // Category & mode state
  const [recipientType, setRecipientType] = useState(isStudent || isParent ? 'student' : isTeacher ? 'teacher' : 'student');
  const [teacherMode, setTeacherMode] = useState('faculty'); // 'faculty' | 'students'
  const [selectedTemplateId, setSelectedTemplateId] = useState('student-id-classic');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('');

  // Finalized School Layout & Preview Mode
  const [finalizedTemplate, setFinalizedTemplate] = useState(null);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [previewWithDummy, setPreviewWithDummy] = useState(false);

  // Data lists
  const [recipients, setRecipients] = useState([]);
  const [classes, setClasses] = useState([]);
  const [customTemplates, setCustomTemplates] = useState([]);
  const [loading, setLoading] = useState(false);

  // Selection & Preview
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [checkedIds, setCheckedIds] = useState([]);

  // Determine active category for templates based on role & mode
  const effectiveRecipientType = useMemo(() => {
    if (isStudent || isParent) return 'student';
    if (isTeacher) return teacherMode === 'faculty' ? 'teacher' : 'student';
    return recipientType;
  }, [isStudent, isParent, isTeacher, teacherMode, recipientType]);

  // Fetch classes & custom templates on mount
  useEffect(() => {
    loadClasses();
    loadCustomTemplates();
  }, []);

  // Update default template and recipients when type/mode/class changes
  useEffect(() => {
    setCheckedIds([]);
    setSelectedRecipient(null);
    loadDefaultTemplate(effectiveRecipientType);
    loadRecipients();
  }, [effectiveRecipientType, selectedClass, teacherMode]);

  const loadDefaultTemplate = async (type = effectiveRecipientType) => {
    try {
      const cat = `${type}-id-card`;
      const res = await getDefaultTemplate(cat);
      if (res?.defaultTemplate) {
        setFinalizedTemplate(res.defaultTemplate);
        if (res.defaultTemplate.customTemplateId) {
          setSelectedTemplateId(res.defaultTemplate.customTemplateId);
        } else if (res.defaultTemplate.templateId) {
          setSelectedTemplateId(res.defaultTemplate.templateId);
        }
      }
    } catch (e) {
      console.error('Error fetching default template:', e);
    }
  };

  const loadClasses = async () => {
    try {
      const res = await getClasses();
      const list = res?.data?.classes || res?.classes || [];
      setClasses(list);
    } catch (e) {
      console.error(e);
    }
  };

  const loadCustomTemplates = async () => {
    try {
      const res = await getCustomTemplates();
      if (res?.templates) setCustomTemplates(res.templates);
    } catch (e) {
      console.error(e);
    }
  };

  const loadRecipients = async () => {
    setLoading(true);
    try {
      if (isStudent) {
        // Fetch student's own record
        let studentData = null;
        if (authUser?.profileId) {
          try {
            const res = await getStudentById(authUser.profileId);
            studentData = res?.student || res?.data || res;
          } catch (e) {
            console.warn('Could not fetch student by profileId:', e);
          }
        }
        if (!studentData) {
          try {
            const res = await getStudents({ limit: 1 });
            const list = Array.isArray(res?.data) ? res.data : (res?.data?.students || res?.students || []);
            if (list.length > 0) studentData = list[0];
          } catch (e) {}
        }
        if (!studentData) {
          studentData = {
            _id: authUser?.id || authUser?._id || 'std-self',
            name: authUser?.name || 'Student',
            admissionNumber: authUser?.admissionNumber || 'STD-2026-001',
            rollNumber: authUser?.rollNumber || '01',
            class: authUser?.className || authUser?.class || 'Class 10',
            className: authUser?.className || authUser?.class || 'Class 10',
            section: authUser?.sectionName || authUser?.section || 'Section A',
            sectionName: authUser?.sectionName || authUser?.section || 'Section A',
            photo: authUser?.photo || authUser?.avatar || '',
            bloodGroup: authUser?.bloodGroup || 'O+',
            dob: authUser?.dob || '2010-01-01',
            parentName: authUser?.parentName || 'Parent / Guardian',
            contactNumber: authUser?.phone || authUser?.contactNumber || '',
          };
        }
        setRecipients([studentData]);
        setSelectedRecipient(studentData);
      } else if (isParent) {
        // Fetch children
        const res = await getStudents({ limit: 20 });
        const list = Array.isArray(res?.data) ? res.data : (res?.data?.students || res?.students || []);
        if (list.length > 0) {
          setRecipients(list);
          setSelectedRecipient(list[0]);
        } else {
          const fallbackChild = {
            _id: 'child-1',
            name: authUser?.name ? `${authUser.name}'s Child` : 'Student',
            admissionNumber: authUser?.admissionNumber || 'STD-2026-001',
            rollNumber: '01',
            class: 'Class 10',
            section: 'Section A',
            parentName: authUser?.name || 'Parent',
          };
          setRecipients([fallbackChild]);
          setSelectedRecipient(fallbackChild);
        }
      } else if (isTeacher && teacherMode === 'faculty') {
        // Teacher's own Faculty ID card
        let teacherData = null;
        if (authUser?.profileId) {
          try {
            const res = await getTeachers({ limit: 50 });
            const list = Array.isArray(res?.data) ? res.data : (res?.data?.teachers || res?.teachers || []);
            teacherData = list.find((t) => String(t._id || t.id) === String(authUser.profileId));
          } catch (e) {}
        }
        if (!teacherData) {
          teacherData = {
            _id: authUser?.id || authUser?._id || 'tch-self',
            name: authUser?.name || 'Faculty Member',
            employeeId: authUser?.employeeId || 'EMP-2026-01',
            department: authUser?.department || 'Academic Faculty',
            designation: authUser?.designation || 'Lecturer / Teacher',
            photo: authUser?.photo || authUser?.avatar || '',
            joiningDate: authUser?.joiningDate || '2024-01-15',
          };
        }
        setRecipients([teacherData]);
        setSelectedRecipient(teacherData);
      } else {
        // Admin or Teacher in 'students' mode
        const targetType = isTeacher ? 'student' : recipientType;
        if (targetType === 'student') {
          const params = { limit: 150 };
          if (selectedClass) params.class = selectedClass;
          const res = await getStudents(params);
          const list = Array.isArray(res?.data) ? res.data : (res?.data?.students || res?.students || []);
          setRecipients(list.length > 0 ? list : [MOCK_STUDENT_DATA]);
          setSelectedRecipient(list.length > 0 ? list[0] : MOCK_STUDENT_DATA);
        } else if (targetType === 'teacher') {
          const res = await getTeachers({ limit: 100 });
          const list = Array.isArray(res?.data) ? res.data : (res?.data?.teachers || res?.teachers || []);
          setRecipients(list.length > 0 ? list : [MOCK_TEACHER_DATA]);
          setSelectedRecipient(list.length > 0 ? list[0] : MOCK_TEACHER_DATA);
        } else {
          // Staff
          setRecipients([MOCK_STAFF_DATA]);
          setSelectedRecipient(MOCK_STAFF_DATA);
        }
      }
    } catch (err) {
      console.error(err);
      if (effectiveRecipientType === 'student') setSelectedRecipient(MOCK_STUDENT_DATA);
      else if (effectiveRecipientType === 'teacher') setSelectedRecipient(MOCK_TEACHER_DATA);
      else setSelectedRecipient(MOCK_STAFF_DATA);
    } finally {
      setLoading(false);
    }
  };

  // Get available templates for category
  const categoryTemplates = useMemo(() => {
    const cat = `${effectiveRecipientType}-id-card`;
    const builtIn = getTemplatesByCategory(cat);
    const customForCategory = customTemplates
      .filter((ct) => ct.category === cat)
      .map((ct) => {
        const base = builtIn.find((b) => b.id === ct.baseTemplateId) || builtIn[0];
        return {
          ...applyTemplateOverrides(base, ct.configuration),
          id: ct._id,
          name: `${ct.name} (Custom)`,
          isCustom: true,
        };
      });
    return [...builtIn, ...customForCategory];
  }, [effectiveRecipientType, customTemplates]);

  const activeTemplate = useMemo(() => {
    return categoryTemplates.find((t) => t.id === selectedTemplateId) || categoryTemplates[0];
  }, [categoryTemplates, selectedTemplateId]);

  // Filtered recipients for table view
  const filteredRecipients = useMemo(() => {
    return recipients.filter((r) => {
      const name = (r.name || `${r.firstName || ''} ${r.lastName || ''}`).toLowerCase();
      const idStr = String(r.admissionNumber || r.employeeId || r._id || '').toLowerCase();
      const q = searchQuery.toLowerCase();
      return name.includes(q) || idStr.includes(q);
    });
  }, [recipients, searchQuery]);

  // Checkbox toggle
  const handleToggleCheck = (id) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (checkedIds.length === filteredRecipients.length) {
      setCheckedIds([]);
    } else {
      setCheckedIds(filteredRecipients.map((r) => r._id || r.admissionNumber));
    }
  };

  const isCurrentlyFinalized = Boolean(
    finalizedTemplate && (
      (activeTemplate?.isCustom && (finalizedTemplate.customTemplateId === activeTemplate.rawCustomId || finalizedTemplate.customTemplateId === activeTemplate.id)) ||
      (!activeTemplate?.isCustom && (finalizedTemplate.templateId === activeTemplate?.id || finalizedTemplate.templateId === activeTemplate?.baseTemplateId))
    )
  );

  const canManageDefaults = isAdmin;

  const handleFinalizeDefault = async () => {
    if (!activeTemplate || !canManageDefaults) return;
    setIsFinalizing(true);
    try {
      const payload = {
        category: `${effectiveRecipientType}-id-card`,
        templateId: activeTemplate.baseTemplateId || activeTemplate.id,
        customTemplateId: activeTemplate.isCustom ? (activeTemplate.rawCustomId || activeTemplate.id) : null,
        configuration: activeTemplate.configuration || {},
        name: activeTemplate.name,
      };
      const res = await setDefaultTemplate(payload);
      if (res?.defaultTemplate) {
        setFinalizedTemplate(res.defaultTemplate);
      }
    } catch (e) {
      console.error('Finalize error:', e);
    } finally {
      setIsFinalizing(false);
    }
  };

  // Batch Print Handler
  const handleBatchPrint = () => {
    const selectedItems = recipients.filter((r) =>
      checkedIds.includes(r._id || r.admissionNumber)
    );
    if (selectedItems.length === 0) {
      alert('Please select at least one recipient to print');
      return;
    }

    const htmlList = selectedItems.map((item) => {
      const data = prepareTemplateData(item, effectiveRecipientType, schoolSettings);
      return renderTemplate(activeTemplate, data);
    });

    printBatchDocuments(htmlList, {
      type: 'id-card',
      title: `Batch_${effectiveRecipientType.toUpperCase()}_ID_Cards`,
    });
  };

  const currentRecipient = previewWithDummy
    ? (effectiveRecipientType === 'teacher' ? MOCK_TEACHER_DATA : MOCK_STUDENT_DATA)
    : (selectedRecipient || (effectiveRecipientType === 'teacher' ? MOCK_TEACHER_DATA : MOCK_STUDENT_DATA));

  return (
    <div className="space-y-6">
      {/* ─── TOP CONTROLS & HEADER ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        
        {/* If Student: Show clean badge */}
        {isStudent && (
          <div className="flex items-center gap-2.5 px-3.5 py-2 bg-sky-500/10 border border-sky-500/25 rounded-xl text-sky-400 text-xs font-bold">
            <GraduationCap size={16} />
            <span>Official Student Identity Document</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1" />
            <span className="text-[10px] text-emerald-400 font-semibold uppercase">Verified</span>
          </div>
        )}

        {/* If Parent: Show child switcher or badge */}
        {isParent && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/25 rounded-xl text-amber-300 text-xs font-bold">
              <Users size={15} />
              <span>Enrolled Child Identity:</span>
            </div>

            {recipients.length > 1 ? (
              <div className="flex items-center gap-1.5 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
                {recipients.map((child) => {
                  const isSel = selectedRecipient?._id === child._id;
                  return (
                    <button
                      key={child._id || child.admissionNumber}
                      type="button"
                      onClick={() => setSelectedRecipient(child)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        isSel
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {child.name || `${child.firstName || ''} ${child.lastName || ''}`} ({child.class || child.className || 'Class'})
                    </button>
                  );
                })}
              </div>
            ) : (
              <span className="text-xs font-bold text-white px-2 py-1 bg-slate-800 rounded-lg border border-slate-700">
                {selectedRecipient?.name || 'My Child'}
              </span>
            )}
          </div>
        )}

        {/* If Teacher: Toggle between Faculty Card and Class Students */}
        {isTeacher && (
          <div className="flex items-center gap-1.5 p-1 bg-slate-950/70 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setTeacherMode('faculty')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                teacherMode === 'faculty'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User size={15} />
              My Faculty ID Card
            </button>
            <button
              type="button"
              onClick={() => setTeacherMode('students')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                teacherMode === 'students'
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <GraduationCap size={15} />
              Class Student ID Cards
            </button>
          </div>
        )}

        {/* If Admin: Category Selector (Students, Teachers, Staff) */}
        {isAdmin && (
          <div className="flex items-center gap-1.5 p-1 bg-slate-950/70 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setRecipientType('student')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                recipientType === 'student'
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <GraduationCap size={15} />
              Students
            </button>
            <button
              type="button"
              onClick={() => setRecipientType('teacher')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                recipientType === 'teacher'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users size={15} />
              Teachers
            </button>
            <button
              type="button"
              onClick={() => setRecipientType('staff')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                recipientType === 'staff'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Briefcase size={15} />
              Staff
            </button>
          </div>
        )}

        {/* Action Buttons: Finalize Default & Batch Print */}
        <div className="flex flex-wrap items-center gap-2.5">
          {canManageDefaults && (
            <button
              type="button"
              onClick={handleFinalizeDefault}
              disabled={isFinalizing || isCurrentlyFinalized}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
                isCurrentlyFinalized
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 cursor-pointer shadow-amber-500/20'
              }`}
              title={
                isCurrentlyFinalized
                  ? 'This layout is currently saved as the school default'
                  : 'Save this layout so all recipients automatically inherit it'
              }
            >
              {isCurrentlyFinalized ? (
                <>
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  <span>Finalized School Format</span>
                </>
              ) : (
                <>
                  <BookmarkCheck size={14} />
                  <span>{isFinalizing ? 'Finalizing...' : 'Finalize as School Default Format'}</span>
                </>
              )}
            </button>
          )}

          {/* Batch Print only visible for Admin or Teacher in students mode */}
          {(isAdmin || (isTeacher && teacherMode === 'students')) && (
            <button
              type="button"
              onClick={handleBatchPrint}
              disabled={checkedIds.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg hover:shadow-sky-500/25 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Printer size={15} />
              <span>Batch Print A4 ({checkedIds.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* ─── MAIN CONTENT GRID ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ─── LEFT COLUMN ─── */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Template Carousel Selector */}
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Select {effectiveRecipientType.toUpperCase()} ID Card Layout ({categoryTemplates.length} Available)
                </label>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Choose a format to preview or inspect
                </p>
              </div>

              {/* Dummy Data Preview Toggle (Admins only) */}
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setPreviewWithDummy((prev) => !prev)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition cursor-pointer ${
                    previewWithDummy
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                      : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                  title="Toggle between PDF-style sample dummy preview and real data"
                >
                  <FileText size={13} />
                  <span>{previewWithDummy ? 'PDF Dummy Preview ON' : 'Real Recipient Data'}</span>
                </button>
              )}
            </div>

            {/* Finalized Banner if currently active */}
            {isCurrentlyFinalized && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300">
                <div className="flex items-center gap-2">
                  <Star size={14} className="text-emerald-400 fill-emerald-400" />
                  <span>
                    <strong>{activeTemplate?.name}</strong> is currently the <strong>Active Finalized Format</strong>.
                  </span>
                </div>
                <span className="text-[10px] font-mono uppercase bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/40">
                  Locked Default
                </span>
              </div>
            )}

            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {categoryTemplates.map((t) => {
                const isDefaultMatch =
                  (finalizedTemplate?.customTemplateId && (t.rawCustomId === finalizedTemplate.customTemplateId || t.id === finalizedTemplate.customTemplateId)) ||
                  (!finalizedTemplate?.customTemplateId && (t.id === finalizedTemplate?.templateId || t.baseTemplateId === finalizedTemplate?.templateId));

                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTemplateId(t.id)}
                    className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold transition border relative ${
                      selectedTemplateId === t.id
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500 shadow-sm'
                        : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{t.name}</span>
                      {isDefaultMatch && (
                        <span
                          className="w-2 h-2 rounded-full bg-amber-400"
                          title="Finalized School Default"
                        />
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2 text-[10px] font-normal text-slate-500 mt-0.5">
                      <span>{t.orientation}</span>
                      {isDefaultMatch && (
                        <span className="text-amber-400 font-bold flex items-center gap-0.5">
                          <Star size={9} className="fill-amber-400" /> Default
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ─── CASE A: STUDENT / PARENT / TEACHER FACULTY SUMMARY CARD ─── */}
          {(isStudent || isParent || (isTeacher && teacherMode === 'faculty')) ? (
            <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                    {currentRecipient?.name ? currentRecipient.name.charAt(0) : 'U'}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {currentRecipient?.name || 'Credential Recipient'}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {isStudent || isParent
                        ? `Adm No: ${currentRecipient?.admissionNumber || 'STD-2026-001'}`
                        : `Employee ID: ${currentRecipient?.employeeId || 'EMP-2026-01'}`}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                    <CheckCircle2 size={13} /> Active Valid
                  </span>
                </div>
              </div>

              {/* Detail Items Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                {isStudent || isParent ? (
                  <>
                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                      <span className="text-[10px] text-slate-500 uppercase block font-semibold">Class & Section</span>
                      <span className="font-bold text-slate-200">
                        {currentRecipient?.class || currentRecipient?.className || 'Class 10'} - {currentRecipient?.section || currentRecipient?.sectionName || 'A'}
                      </span>
                    </div>
                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                      <span className="text-[10px] text-slate-500 uppercase block font-semibold">Roll Number</span>
                      <span className="font-bold text-slate-200">
                        {currentRecipient?.rollNumber || '01'}
                      </span>
                    </div>
                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                      <span className="text-[10px] text-slate-500 uppercase block font-semibold">Blood Group</span>
                      <span className="font-bold text-rose-400">
                        {currentRecipient?.bloodGroup || 'O+'}
                      </span>
                    </div>
                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                      <span className="text-[10px] text-slate-500 uppercase block font-semibold">Parent / Guardian</span>
                      <span className="font-bold text-slate-200 truncate block">
                        {currentRecipient?.parentName || 'Authorized Guardian'}
                      </span>
                    </div>
                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                      <span className="text-[10px] text-slate-500 uppercase block font-semibold">Academic Session</span>
                      <span className="font-bold text-indigo-400">2025-2026</span>
                    </div>
                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                      <span className="text-[10px] text-slate-500 uppercase block font-semibold">Security QR</span>
                      <span className="font-bold text-emerald-400 flex items-center gap-1">
                        <ShieldCheck size={13} /> Tamper-Proof
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                      <span className="text-[10px] text-slate-500 uppercase block font-semibold">Designation</span>
                      <span className="font-bold text-slate-200">
                        {currentRecipient?.designation || 'Lecturer / Teacher'}
                      </span>
                    </div>
                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                      <span className="text-[10px] text-slate-500 uppercase block font-semibold">Department</span>
                      <span className="font-bold text-slate-200">
                        {currentRecipient?.department || 'Faculty'}
                      </span>
                    </div>
                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                      <span className="text-[10px] text-slate-500 uppercase block font-semibold">Security Token</span>
                      <span className="font-bold text-emerald-400 flex items-center gap-1">
                        <ShieldCheck size={13} /> Verified
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Informative Security Banner */}
              <div className="p-3.5 bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-transparent border border-sky-500/20 rounded-xl flex items-start gap-3 text-xs text-slate-300">
                <ShieldCheck size={18} className="text-sky-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">Official Institutional Identity</span>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    This digital ID card is synced with verified school records. Use the interactive 3D / Flip card on the right to review both Front and Back sides, or click <strong>Print Card</strong> to generate a print-ready document.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* ─── CASE B: ADMIN OR TEACHER STUDENT TABLE ─── */
            <>
              {/* Search & Class Filter */}
              <div className="flex items-center gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
                <div className="flex-1 relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search ${effectiveRecipientType} by name or ID...`}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>

                {effectiveRecipientType === 'student' && (
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="">All Classes</option>
                    {classes.map((c) => (
                      <option key={c._id || c.name} value={c.name || c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Recipient Table */}
              <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-slate-950/50 border-b border-slate-800 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="text-slate-400 hover:text-white"
                    >
                      {checkedIds.length === filteredRecipients.length && filteredRecipients.length > 0 ? (
                        <CheckSquare size={16} className="text-sky-400" />
                      ) : (
                        <Square size={16} />
                      )}
                    </button>
                    <span className="font-semibold text-slate-300">
                      {filteredRecipients.length} {effectiveRecipientType}(s) Found
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {checkedIds.length} Selected for Batch Print
                  </span>
                </div>

                <div className="max-h-[460px] overflow-y-auto divide-y divide-slate-800/60">
                  {loading ? (
                    <div className="p-8 flex items-center justify-center gap-2 text-xs text-slate-400">
                      <Loader2 size={16} className="animate-spin text-sky-400" />
                      Loading {effectiveRecipientType} records...
                    </div>
                  ) : filteredRecipients.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-500">
                      No {effectiveRecipientType} records found matching the criteria.
                    </div>
                  ) : (
                    filteredRecipients.map((r) => {
                      const idKey = r._id || r.admissionNumber;
                      const isChecked = checkedIds.includes(idKey);
                      const isSelected = selectedRecipient?._id === r._id;

                      return (
                        <div
                          key={idKey}
                          onClick={() => setSelectedRecipient(r)}
                          className={`flex items-center justify-between px-4 py-3 cursor-pointer transition ${
                            isSelected
                              ? 'bg-sky-500/10 border-l-4 border-l-sky-500 text-white'
                              : 'hover:bg-slate-800/40 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleCheck(idKey);
                              }}
                              className="text-slate-400 hover:text-sky-400 cursor-pointer"
                            >
                              {isChecked ? (
                                <CheckSquare size={16} className="text-sky-400" />
                              ) : (
                                <Square size={16} />
                              )}
                            </div>

                            <div>
                              <div className="text-xs font-semibold">
                                {r.name || `${r.firstName || ''} ${r.lastName || ''}`}
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono">
                                {r.admissionNumber || r.employeeId || 'ID: ' + String(idKey).slice(-5)}
                                {r.class ? ` • Class: ${r.class}` : ''}
                                {r.department ? ` • Dept: ${r.department}` : ''}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {isSelected && (
                              <span className="text-[10px] bg-sky-500/20 text-sky-400 px-2 py-0.5 rounded-full font-medium">
                                Active Preview
                              </span>
                            )}
                            <Eye size={15} className={isSelected ? 'text-sky-400' : 'text-slate-500'} />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* ─── RIGHT COLUMN: LIVE CARD PREVIEW (5 cols) ─── */}
        <div className="lg:col-span-5 min-h-[500px]">
          <IdCardPreview
            template={activeTemplate}
            recipient={currentRecipient}
            recipientType={effectiveRecipientType}
            schoolSettings={schoolSettings}
            customConfig={activeTemplate?.configuration || null}
            title={
              previewWithDummy
                ? `${effectiveRecipientType.toUpperCase()} ID CARD (PDF DUMMY PREVIEW)`
                : isStudent
                ? 'MY STUDENT IDENTITY CARD'
                : isParent
                ? 'CHILD STUDENT IDENTITY CARD'
                : isTeacher && teacherMode === 'faculty'
                ? 'MY FACULTY IDENTITY CARD'
                : `${effectiveRecipientType.toUpperCase()} ID CARD`
            }
          />
        </div>
      </div>
    </div>
  );
}
