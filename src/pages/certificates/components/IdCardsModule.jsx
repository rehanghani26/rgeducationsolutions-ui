/**
 * @file IdCardsModule.jsx
 * @description ID Card Generation & Printing Module.
 * Allows filtering Students, Teachers, and Staff, selecting templates,
 * previewing cards with live data, and printing individual or batch cards.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  CreditCard,
  Search,
  Filter,
  Printer,
  CheckSquare,
  Square,
  UserCheck,
  GraduationCap,
  Briefcase,
  Users,
  Eye,
  Loader2,
  CheckCircle2,
  BookmarkCheck,
  Sparkles,
  FileText,
  Star,
} from 'lucide-react';
import IdCardPreview from './IdCardPreview.jsx';
import { getTemplatesByCategory, applyTemplateOverrides } from '../templates/registry.js';
import { renderTemplate, prepareTemplateData } from '../utils/templateRenderer.js';
import { printBatchDocuments } from '../utils/printUtils.js';
import { getStudents } from '../../../services/studentService.js';
import { getTeachers } from '../../../services/teacherService.js';
import { getClasses } from '../../../services/erpService.js';
import { getCustomTemplates, getDefaultTemplate, setDefaultTemplate } from '../services/documentService.js';
import { MOCK_STUDENT_DATA, MOCK_TEACHER_DATA, MOCK_STAFF_DATA } from '../constants/documentConstants.js';

export default function IdCardsModule({ schoolSettings = {}, userRole = '' }) {
  const [recipientType, setRecipientType] = useState('student'); // 'student' | 'teacher' | 'staff'
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

  // Fetch classes & custom templates on mount
  useEffect(() => {
    loadClasses();
    loadCustomTemplates();
  }, []);

  // Update default template and recipients when recipient type changes
  useEffect(() => {
    setCheckedIds([]);
    setSelectedRecipient(null);
    loadDefaultTemplate(recipientType);
    loadRecipients();
  }, [recipientType, selectedClass]);

  const loadDefaultTemplate = async (type = recipientType) => {
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
      if (recipientType === 'student') {
        const params = { limit: 150 };
        if (selectedClass) params.class = selectedClass;
        const res = await getStudents(params);
        const list = Array.isArray(res?.data) ? res.data : (res?.data?.students || res?.students || []);
        setRecipients(list.length > 0 ? list : [MOCK_STUDENT_DATA]);
        setSelectedRecipient(list.length > 0 ? list[0] : MOCK_STUDENT_DATA);
      } else if (recipientType === 'teacher') {
        const res = await getTeachers({ limit: 100 });
        const list = Array.isArray(res?.data) ? res.data : (res?.data?.teachers || res?.teachers || []);
        setRecipients(list.length > 0 ? list : [MOCK_TEACHER_DATA]);
        setSelectedRecipient(list.length > 0 ? list[0] : MOCK_TEACHER_DATA);
      } else {
        // Staff
        setRecipients([MOCK_STAFF_DATA]);
        setSelectedRecipient(MOCK_STAFF_DATA);
      }
    } catch (err) {
      console.error(err);
      // Fallback to sample data so UI is always interactive
      if (recipientType === 'student') setSelectedRecipient(MOCK_STUDENT_DATA);
      else if (recipientType === 'teacher') setSelectedRecipient(MOCK_TEACHER_DATA);
      else setSelectedRecipient(MOCK_STAFF_DATA);
    } finally {
      setLoading(false);
    }
  };

  // Get available templates for category
  const categoryTemplates = useMemo(() => {
    const cat = `${recipientType}-id-card`;
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
  }, [recipientType, customTemplates]);

  const activeTemplate = useMemo(() => {
    return categoryTemplates.find((t) => t.id === selectedTemplateId) || categoryTemplates[0];
  }, [categoryTemplates, selectedTemplateId]);

  // Filtered recipients
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

  const canManage = ['super-admin', 'school-admin', 'principal', 'director', 'admin', 'superadmin'].includes(
    String(userRole || '').toLowerCase()
  );

  const handleFinalizeDefault = async () => {
    if (!activeTemplate) return;
    setIsFinalizing(true);
    try {
      const payload = {
        category: `${recipientType}-id-card`,
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
      const data = prepareTemplateData(item, recipientType, schoolSettings);
      return renderTemplate(activeTemplate, data);
    });

    printBatchDocuments(htmlList, {
      type: 'id-card',
      title: `Batch_${recipientType.toUpperCase()}_ID_Cards`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Controls & Category Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        {/* Recipient Category Tabs */}
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

        {/* Action Buttons: Finalize Default & Batch Print */}
        <div className="flex flex-wrap items-center gap-2.5">
          {canManage && (
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
                  : 'Save this layout so all students automatically inherit it'
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

          <button
            type="button"
            onClick={handleBatchPrint}
            disabled={checkedIds.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg hover:shadow-sky-500/25 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Printer size={15} />
            <span>Batch Print A4 ({checkedIds.length})</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left side Table, Right side Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Filter & Recipient Table (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Template Carousel Selector */}
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Select {recipientType.toUpperCase()} ID Card Layout ({categoryTemplates.length} Available)
                </label>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Choose a format to preview or finalize as institutional standard
                </p>
              </div>

              {/* Dummy Data Preview Toggle */}
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
            </div>

            {/* Finalized Banner if currently active */}
            {isCurrentlyFinalized && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300">
                <div className="flex items-center gap-2">
                  <Star size={14} className="text-emerald-400 fill-emerald-400" />
                  <span>
                    <strong>{activeTemplate?.name}</strong> is currently the <strong>Active Finalized Format</strong>. All student ID cards inherit this layout.
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

          {/* Search & Class Filter */}
          <div className="flex items-center gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <div className="flex-1 relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${recipientType} by name or ID...`}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            {recipientType === 'student' && (
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
                  {filteredRecipients.length} {recipientType}(s) Found
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
                  Loading {recipientType} records...
                </div>
              ) : filteredRecipients.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No {recipientType} records found matching the criteria.
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
        </div>

        {/* Right Column: Live Card Preview (5 cols) */}
        <div className="lg:col-span-5 min-h-[500px]">
          <IdCardPreview
            template={activeTemplate}
            recipient={previewWithDummy ? MOCK_STUDENT_DATA : (selectedRecipient || MOCK_STUDENT_DATA)}
            recipientType={recipientType}
            schoolSettings={schoolSettings}
            customConfig={activeTemplate?.configuration || null}
            title={
              previewWithDummy
                ? `${recipientType.toUpperCase()} ID CARD (PDF DUMMY PREVIEW)`
                : `${recipientType.toUpperCase()} ID CARD`
            }
          />
        </div>
      </div>
    </div>
  );
}
