/**
 * @file IssueModal.jsx
 * @description Modal dialog for issuing official certificates (Single or Bulk).
 */

import React, { useState, useEffect } from 'react';
import { X, Award, Users, User, Check, AlertCircle, Loader2 } from 'lucide-react';
import { CERTIFICATE_TYPES } from '../constants/documentConstants.js';
import { getTemplatesByCategory } from '../templates/registry.js';
import { issueCertificate, bulkIssueCertificates } from '../services/documentService.js';
import { getStudents } from '../../../services/studentService.js';
import { getTeachers } from '../../../services/teacherService.js';
import { getClasses } from '../../../services/erpService.js';

export default function IssueModal({ isOpen, onClose, onSuccess }) {
  const [mode, setMode] = useState('single'); // 'single' | 'bulk'
  const [recipientType, setRecipientType] = useState('student');
  const [certificateType, setCertificateType] = useState('BONAFIDE');
  const [templateId, setTemplateId] = useState('certificate-classic');
  const [academicSession, setAcademicSession] = useState('2025-2026');
  const [purposeNote, setPurposeNote] = useState('');

  // Filtering & data
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [recipientsList, setRecipientsList] = useState([]);
  const [selectedRecipientId, setSelectedRecipientId] = useState('');
  const [selectedBulkIds, setSelectedBulkIds] = useState([]);
  const [loadingRecipients, setLoadingRecipients] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const certTemplates = getTemplatesByCategory('certificate');

  useEffect(() => {
    if (isOpen) {
      loadClasses();
      loadRecipients();
    }
  }, [isOpen, recipientType, selectedClass]);

  const loadClasses = async () => {
    try {
      const res = await getClasses();
      const list = res?.data?.classes || res?.classes || [];
      setClasses(list);
    } catch (e) {
      console.error(e);
    }
  };

  const loadRecipients = async () => {
    setLoadingRecipients(true);
    try {
      if (recipientType === 'student') {
        const params = { limit: 100 };
        if (selectedClass) params.class = selectedClass;
        const list = Array.isArray(res?.data) ? res.data : (res?.data?.students || res?.students || []);
        setRecipientsList(list);
        if (list.length > 0 && !selectedRecipientId) {
          setSelectedRecipientId(list[0]._id || list[0].id);
        }
      } else if (recipientType === 'teacher') {
        const res = await getTeachers({ limit: 100 });
        const list = Array.isArray(res?.data) ? res.data : (res?.data?.teachers || res?.teachers || []);
        setRecipientsList(list);
        if (list.length > 0 && !selectedRecipientId) {
          setSelectedRecipientId(list[0]._id || list[0].id);
        }
      } else {
        // Staff
        setRecipientsList([]);
      }
    } catch (err) {
      console.error('Error fetching recipients:', err);
    } finally {
      setLoadingRecipients(false);
    }
  };

  if (!isOpen) return null;

  const handleBulkToggle = (id) => {
    setSelectedBulkIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllBulk = () => {
    if (selectedBulkIds.length === recipientsList.length) {
      setSelectedBulkIds([]);
    } else {
      setSelectedBulkIds(recipientsList.map((r) => r._id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (mode === 'single') {
        if (!selectedRecipientId) {
          alert('Please select a recipient');
          setSubmitting(false);
          return;
        }

        await issueCertificate({
          recipientType,
          recipientId: selectedRecipientId,
          certificateType,
          templateId,
          academicSession,
          purposeNote,
        });
      } else {
        // Bulk mode
        if (selectedBulkIds.length === 0) {
          alert('Please select at least one recipient for bulk issue');
          setSubmitting(false);
          return;
        }

        const recipients = selectedBulkIds.map((id) => ({
          recipientType,
          recipientId: id,
          purposeNote,
        }));

        await bulkIssueCertificates({
          recipients,
          certificateType,
          templateId,
          academicSession,
        });
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Award size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Issue Official Certificate</h2>
              <p className="text-xs text-slate-400">Generate verifiable institutional certificate</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 pt-3">
          <button
            type="button"
            onClick={() => setMode('single')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-lg transition border-b-2 ${
              mode === 'single'
                ? 'border-amber-500 text-amber-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User size={14} />
            Single Recipient
          </button>
          <button
            type="button"
            onClick={() => setMode('bulk')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-lg transition border-b-2 ${
              mode === 'bulk'
                ? 'border-amber-500 text-amber-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users size={14} />
            Bulk Issue (Class / Group)
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Row 1: Recipient Type & Certificate Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Recipient Category</label>
              <select
                value={recipientType}
                onChange={(e) => {
                  setRecipientType(e.target.value);
                  setSelectedRecipientId('');
                  setSelectedBulkIds([]);
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher / Faculty</option>
                <option value="staff">Staff Member</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Certificate Type</label>
              <select
                value={certificateType}
                onChange={(e) => setCertificateType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                {Object.entries(CERTIFICATE_TYPES).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Template Selection & Academic Session */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Certificate Template</label>
              <select
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                {certTemplates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Academic Session</label>
              <input
                type="text"
                value={academicSession}
                onChange={(e) => setAcademicSession(e.target.value)}
                placeholder="2025-2026"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Recipient Filter / Selection */}
          {recipientType === 'student' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Filter by Class</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="">All Classes</option>
                {classes.map((c) => (
                  <option key={c._id || c.name} value={c.name || c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Single Recipient Picker */}
          {mode === 'single' ? (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Select Recipient ({recipientsList.length} available)
              </label>
              {loadingRecipients ? (
                <div className="flex items-center gap-2 text-xs text-slate-400 py-3">
                  <Loader2 size={14} className="animate-spin text-amber-400" />
                  Loading recipients...
                </div>
              ) : (
                <select
                  value={selectedRecipientId}
                  onChange={(e) => setSelectedRecipientId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  required
                >
                  <option value="">-- Choose Recipient --</option>
                  {recipientsList.map((r) => {
                    const idVal = r._id || r.id;
                    return (
                      <option key={idVal} value={idVal}>
                        {r.name || `${r.firstName || ''} ${r.lastName || ''}`} (
                        {r.admissionNumber || r.employeeId || 'ID: ' + String(idVal).slice(-4)}
                        {r.class ? ` • ${r.class}` : ''})
                      </option>
                    );
                  })}
                </select>
              )}
            </div>
          ) : (
            /* Bulk Recipient Checkbox List */
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Select Recipients ({selectedBulkIds.length} of {recipientsList.length} selected)
                </label>
                <button
                  type="button"
                  onClick={handleSelectAllBulk}
                  className="text-[11px] text-amber-400 hover:underline"
                >
                  {selectedBulkIds.length === recipientsList.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              <div className="max-h-48 overflow-y-auto border border-slate-800 rounded-xl bg-slate-950/60 p-2 space-y-1">
                {loadingRecipients ? (
                  <div className="p-4 text-center text-xs text-slate-400">Loading...</div>
                ) : recipientsList.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">No recipients found</div>
                ) : (
                  recipientsList.map((r) => {
                    const idVal = r._id || r.id;
                    const isSelected = selectedBulkIds.includes(idVal);
                    return (
                      <div
                        key={idVal}
                        onClick={() => handleBulkToggle(idVal)}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs transition ${
                          isSelected
                            ? 'bg-amber-500/15 border border-amber-500/30 text-amber-200'
                            : 'hover:bg-slate-800/60 text-slate-300 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-4 h-4 rounded flex items-center justify-center border ${
                              isSelected
                                ? 'bg-amber-500 border-amber-500 text-slate-950'
                                : 'border-slate-600 bg-slate-900'
                            }`}
                          >
                            {isSelected && <Check size={12} strokeWidth={3} />}
                          </div>
                          <span className="font-medium">
                            {r.name || `${r.firstName || ''} ${r.lastName || ''}`}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {r.admissionNumber || r.employeeId || ''} {r.class ? `• ${r.class}` : ''}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Purpose / Remarks */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Purpose / Reason Note (Optional)
            </label>
            <input
              type="text"
              value={purposeNote}
              onChange={(e) => setPurposeNote(e.target.value)}
              placeholder="e.g. For Passport Application / Higher Studies / Annual Award"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2.5 text-[11px] text-amber-200/90">
            <AlertCircle size={15} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <span>
              Generated certificates are assigned a unique sequence number and cryptographic QR token.
              The HTML/PDF is rendered dynamically on-demand and is <strong>never stored</strong> in the database.
            </span>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold rounded-xl shadow-lg hover:shadow-amber-500/20 transition disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Issuing...</span>
                </>
              ) : (
                <>
                  <Award size={14} />
                  <span>
                    {mode === 'single' ? 'Issue Certificate' : `Bulk Issue (${selectedBulkIds.length})`}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
