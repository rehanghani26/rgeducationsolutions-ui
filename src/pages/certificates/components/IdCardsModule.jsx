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
} from 'lucide-react';
import IdCardPreview from './IdCardPreview.jsx';
import { getTemplatesByCategory, applyTemplateOverrides } from '../templates/registry.js';
import { renderTemplate, prepareTemplateData } from '../utils/templateRenderer.js';
import { printBatchDocuments } from '../utils/printUtils.js';
import { getStudents } from '../../../services/studentService.js';
import { getTeachers } from '../../../services/teacherService.js';
import { getClasses } from '../../../services/erpService.js';
import { getCustomTemplates } from '../services/documentService.js';
import { MOCK_STUDENT_DATA, MOCK_TEACHER_DATA, MOCK_STAFF_DATA } from '../constants/documentConstants.js';

export default function IdCardsModule({ schoolSettings = {} }) {
  const [recipientType, setRecipientType] = useState('student'); // 'student' | 'teacher' | 'staff'
  const [selectedTemplateId, setSelectedTemplateId] = useState('student-id-classic');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('');

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

  // Update default template when recipient type changes
  useEffect(() => {
    if (recipientType === 'student') setSelectedTemplateId('student-id-classic');
    else if (recipientType === 'teacher') setSelectedTemplateId('teacher-id-professional');
    else setSelectedTemplateId('staff-id-corporate');

    setCheckedIds([]);
    setSelectedRecipient(null);
    loadRecipients();
  }, [recipientType, selectedClass]);

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

        {/* Batch Print Action */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBatchPrint}
            disabled={checkedIds.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg hover:shadow-sky-500/25 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Printer size={15} />
            <span>Batch Print A4 Sheet ({checkedIds.length})</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left side Table, Right side Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Filter & Recipient Table (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Template Carousel Selector */}
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
              Select ID Card Template ({categoryTemplates.length} Available)
            </label>
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {categoryTemplates.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTemplateId(t.id)}
                  className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold transition border ${
                    selectedTemplateId === t.id
                      ? 'bg-sky-500/20 text-sky-300 border-sky-500 shadow-sm'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {t.name}
                  <span className="block text-[10px] font-normal text-slate-500 mt-0.5">
                    {t.orientation}
                  </span>
                </button>
              ))}
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
            recipient={selectedRecipient || MOCK_STUDENT_DATA}
            recipientType={recipientType}
            schoolSettings={schoolSettings}
            title={`${recipientType.toUpperCase()} ID CARD`}
          />
        </div>
      </div>
    </div>
  );
}
