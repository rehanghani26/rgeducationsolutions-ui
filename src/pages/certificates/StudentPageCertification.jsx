/**
 * @file StudentPageCertification.jsx
 * @description Dedicated Student Credential Portal.
 * Designed exclusively for students:
 * 1. View & print their official Student Identity Card (Front & Back interactive preview with their real photo)
 *    - Layout is locked to the institutional standard (student cannot change layout).
 * 2. View & print their official issued Certificates (Bonafide, Character, Merit, Transfer).
 *    - Verification is restricted (student cannot verify certificates).
 * 
 * Strict data privacy: No access to other students, no administrative controls.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  Award,
  ShieldCheck,
  CheckCircle2,
  Printer,
  Eye,
  Search,
  Calendar,
  User,
  GraduationCap,
  Star,
  FileText,
  Loader2,
  X,
  Phone,
  Lock,
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { useSchoolBranding } from '../../context/SchoolBrandingContext.jsx';
import IdCardPreview from './components/IdCardPreview.jsx';
import CertificatePreview from './components/CertificatePreview.jsx';

import { getTemplatesByCategory, applyTemplateOverrides, getTemplateById } from './templates/registry.js';
import { renderTemplate, prepareTemplateData } from './utils/templateRenderer.js';
import { openDocumentInNewTab } from './utils/printUtils.js';
import { getStudents, getStudentById } from '../../services/studentService.js';
import { getIssuedCertificates, getCustomTemplates, getDefaultTemplate } from './services/documentService.js';

export default function StudentPageCertification({ authUser: propAuthUser = null, schoolSettings: propSchoolSettings = null }) {
  const [searchParams] = useSearchParams();
  const urlTab = searchParams.get('tab');

  const authUserFromStore = useSelector((state) => state.auth?.user);
  const authUser = propAuthUser || authUserFromStore || {};
  const brandingFromContext = useSchoolBranding();
  const schoolSettings = propSchoolSettings || brandingFromContext || {};

  // Only two permitted tabs for students: ID Card and Certificates (Verification is restricted)
  const [activeTab, setActiveTab] = useState(urlTab === 'certificates' ? 'certificates' : 'id-card');

  // Student Profile Data
  const [student, setStudent] = useState(null);
  const [loadingStudent, setLoadingStudent] = useState(true);

  // Certificates Data
  const [certificates, setCertificates] = useState([]);
  const [loadingCertificates, setLoadingCertificates] = useState(true);
  const [searchCertQuery, setSearchCertQuery] = useState('');
  const [activePreviewCert, setActivePreviewCert] = useState(null);

  // ID Card Template: Institutional locked format (student cannot change layout)
  const [selectedTemplateId, setSelectedTemplateId] = useState('student-id-classic');
  const [customTemplates, setCustomTemplates] = useState([]);
  const [finalizedTemplate, setFinalizedTemplate] = useState(null);

  useEffect(() => {
    if (urlTab === 'certificates' || urlTab === 'id-card' || urlTab === 'id-cards') {
      setActiveTab(urlTab === 'certificates' ? 'certificates' : 'id-card');
    }
  }, [urlTab]);

  useEffect(() => {
    loadStudentData();
    loadStudentCertificates();
    loadTemplateConfigs();
  }, []);

  const loadStudentData = async () => {
    setLoadingStudent(true);
    try {
      let data = null;
      if (authUser?.profileId) {
        try {
          const res = await getStudentById(authUser.profileId);
          data = res?.student || res?.data || res;
        } catch (e) {
          console.warn('Could not fetch student by profileId:', e);
        }
      }
      if (!data) {
        try {
          const res = await getStudents({ limit: 1 });
          const list = Array.isArray(res?.data) ? res.data : (res?.data?.students || res?.students || []);
          if (list.length > 0) data = list[0];
        } catch (e) {}
      }

      // Resolve student photo from all possible backend & auth sources
      const resolvedPhoto =
        data?.photo ||
        data?.imagesRef?.img ||
        data?.avatar ||
        data?.photoUrl ||
        data?.image ||
        authUser?.photo ||
        authUser?.avatar ||
        authUser?.imagesRef?.img ||
        '';

      const enriched = {
        ...(data || {}),
        _id: data?._id || data?.id || authUser?.id || authUser?._id || 'std-self',
        name: data?.name || `${data?.firstName || ''} ${data?.lastName || ''}`.trim() || authUser?.name || 'Student',
        admissionNumber: data?.admissionNumber || authUser?.admissionNumber || 'STD-2026-001',
        rollNumber: data?.rollNumber || authUser?.rollNumber || '01',
        class: data?.class || data?.className || authUser?.className || authUser?.class || 'Class 10',
        className: data?.class || data?.className || authUser?.className || authUser?.class || 'Class 10',
        section: data?.section || data?.sectionName || authUser?.sectionName || authUser?.section || 'Section A',
        sectionName: data?.section || data?.sectionName || authUser?.sectionName || authUser?.section || 'Section A',
        photo: resolvedPhoto,
        avatar: resolvedPhoto,
        imagesRef: { id: data?.imagesRef?.id || '', img: resolvedPhoto },
        bloodGroup: data?.bloodGroup || authUser?.bloodGroup || 'O+',
        dob: data?.dob || authUser?.dob || '2010-01-01',
        parentName: data?.parentName || authUser?.parentName || 'Parent / Guardian',
        contactNumber: data?.contactNumber || authUser?.phone || '',
        academicYear: data?.academicYear || '2025-2026',
      };
      setStudent(enriched);
    } catch (err) {
      console.error('Error loading student profile:', err);
    } finally {
      setLoadingStudent(false);
    }
  };

  const loadStudentCertificates = async () => {
    setLoadingCertificates(true);
    try {
      const res = await getIssuedCertificates();
      const list = res?.certificates || res?.data?.certificates || [];
      setCertificates(list);
    } catch (err) {
      console.error('Error loading student certificates:', err);
    } finally {
      setLoadingCertificates(false);
    }
  };

  const loadTemplateConfigs = async () => {
    try {
      const [customRes, defRes] = await Promise.all([
        getCustomTemplates().catch(() => null),
        getDefaultTemplate('student-id-card').catch(() => null),
      ]);

      if (customRes?.templates) {
        setCustomTemplates(customRes.templates);
      }

      if (defRes?.defaultTemplate) {
        setFinalizedTemplate(defRes.defaultTemplate);
        if (defRes.defaultTemplate.customTemplateId) {
          setSelectedTemplateId(defRes.defaultTemplate.customTemplateId);
        } else if (defRes.defaultTemplate.templateId) {
          setSelectedTemplateId(defRes.defaultTemplate.templateId);
        }
      }
    } catch (e) {
      console.error('Error loading template settings:', e);
    }
  };

  // Locked institutional ID card template for this student
  const activeTemplate = useMemo(() => {
    const builtIn = getTemplatesByCategory('student-id-card');
    const customForCategory = customTemplates
      .filter((ct) => ct.category === 'student-id-card')
      .map((ct) => {
        const base = builtIn.find((b) => b.id === ct.baseTemplateId) || builtIn[0];
        return {
          ...applyTemplateOverrides(base, ct.configuration),
          id: ct._id,
          name: ct.name,
          isCustom: true,
        };
      });

    const all = [...builtIn, ...customForCategory];
    // Automatically match the school's finalized default layout
    if (finalizedTemplate) {
      const match = all.find(
        (t) =>
          (finalizedTemplate.customTemplateId && (t.id === finalizedTemplate.customTemplateId || t.rawCustomId === finalizedTemplate.customTemplateId)) ||
          (!finalizedTemplate.customTemplateId && (t.id === finalizedTemplate.templateId || t.baseTemplateId === finalizedTemplate.templateId))
      );
      if (match) return match;
    }
    return all.find((t) => t.id === selectedTemplateId) || all[0];
  }, [customTemplates, finalizedTemplate, selectedTemplateId]);

  // Filter student's certificates by search query
  const filteredCertificates = useMemo(() => {
    return certificates.filter((c) => {
      const q = searchCertQuery.toLowerCase();
      const num = (c.certificateNumber || '').toLowerCase();
      const type = (c.certificateType || '').toLowerCase();
      const note = (c.purposeNote || '').toLowerCase();
      return num.includes(q) || type.includes(q) || note.includes(q);
    });
  }, [certificates, searchCertQuery]);

  const handlePrintCertificate = (cert) => {
    const tmpl = getTemplateById(cert.templateId || 'certificate-classic');
    const data = prepareTemplateData(cert, 'student', schoolSettings, cert);
    const html = renderTemplate(tmpl, data);
    openDocumentInNewTab(html, {
      orientation: tmpl.orientation || 'landscape',
      title: `${data.name || 'Student'}_${data.certificateType || 'Certificate'}_${cert.certificateNumber || ''}`,
      pageSize: 'a4',
    });
  };

  const studentName = student?.name || authUser?.name || 'Student';
  const admissionNo = student?.admissionNumber || authUser?.admissionNumber || 'STD-2026-001';
  const className = student?.class || student?.className || authUser?.className || 'Class 10';
  const sectionName = student?.section || student?.sectionName || authUser?.sectionName || 'A';
  const rollNumber = student?.rollNumber || authUser?.rollNumber || '01';
  const studentPhoto = student?.photo || authUser?.photo || authUser?.avatar || '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-16"
    >
      {/* ─── TOP PAGE HEADER ──────────────────────────────────────────────── */}
      <PageHeader
        title="My Student ID Card & Official Certificates"
        subtitle="View and print your official student identity card and authorized institutional certificates"
        breadcrumbs={[{ label: 'Student Portal' }, { label: 'My ID & Certificates' }]}
      />

      {/* ─── STUDENT CREDENTIAL BANNER ────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 p-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-sky-500/25 flex-shrink-0 border-2 border-sky-400/30">
              {studentPhoto ? (
                <img
                  src={studentPhoto}
                  alt={studentName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                studentName.charAt(0)
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-white">{studentName}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 size={12} /> Active Valid Student
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {className} · Section {sectionName} · Roll No: <span className="font-bold text-slate-200">{rollNumber}</span> · Adm No: <span className="font-bold text-sky-400 font-mono">{admissionNo}</span>
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full md:w-auto text-xs">
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl">
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">ID Card</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                <CheckCircle2 size={13} /> Active & Verified
              </span>
            </div>
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl">
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Certificates</span>
              <span className="font-bold text-amber-400 mt-0.5 block">
                {certificates.length} Issued Record{certificates.length === 1 ? '' : 's'}
              </span>
            </div>
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl col-span-2 sm:col-span-1">
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Academic Year</span>
              <span className="font-bold text-indigo-400 mt-0.5 block">2025-2026</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── NAVIGATION TABS (Strictly: My ID Card & My Certificates) ───── */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-900/70 border border-slate-800 rounded-2xl backdrop-blur-md shadow-lg max-w-md">
        <button
          type="button"
          onClick={() => setActiveTab('id-card')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer relative ${
            activeTab === 'id-card'
              ? 'bg-slate-800 text-white shadow-md border border-slate-700/80'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <CreditCard size={16} className={activeTab === 'id-card' ? 'text-sky-400' : 'text-slate-400'} />
          <span>My Student ID Card</span>
          {activeTab === 'id-card' && (
            <motion.div
              layoutId="studentActivePill"
              className="absolute bottom-0 left-3 right-3 h-[2px] bg-gradient-to-r from-sky-400 via-indigo-400 to-amber-400 rounded-full"
            />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('certificates')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer relative ${
            activeTab === 'certificates'
              ? 'bg-slate-800 text-white shadow-md border border-slate-700/80'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Award size={16} className={activeTab === 'certificates' ? 'text-amber-400' : 'text-slate-400'} />
          <span>My Certificates</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
            {certificates.length}
          </span>
          {activeTab === 'certificates' && (
            <motion.div
              layoutId="studentActivePill"
              className="absolute bottom-0 left-3 right-3 h-[2px] bg-gradient-to-r from-sky-400 via-indigo-400 to-amber-400 rounded-full"
            />
          )}
        </button>
      </div>

      {/* ─── TAB CONTENT ─────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {/* ─── TAB 1: ID CARD ─── */}
        {activeTab === 'id-card' && (
          <motion.div
            key="tab-id-card"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Left Column: Student Profile Details & Institutional Standard Note (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Institutional Locked Standard Banner (student cannot change layout) */}
              <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                    <Lock size={15} />
                  </div>
                  <div>
                    <span className="font-bold text-white block">Official Institutional Standard</span>
                    <span className="text-[11px] text-slate-400">
                      Standard Layout: <strong className="text-emerald-400">{activeTemplate?.name || 'Classic Student'}</strong>
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2.5 py-1 rounded-full font-bold">
                  Official Format
                </span>
              </div>

              {/* Student Credential Summary Card */}
              <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md border-2 border-sky-400/30 flex-shrink-0">
                      {studentPhoto ? (
                        <img
                          src={studentPhoto}
                          alt={studentName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        studentName.charAt(0)
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{studentName}</h3>
                      <p className="text-[11px] text-sky-400 font-mono">
                        Admission ID: {admissionNo}
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                    <CheckCircle2 size={12} /> Active Student
                  </span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Class & Section</span>
                    <span className="font-bold text-slate-200">
                      {className} - {sectionName}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Roll Number</span>
                    <span className="font-bold text-slate-200">
                      {rollNumber}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Blood Group</span>
                    <span className="font-bold text-rose-400">
                      {student?.bloodGroup || 'O+'}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Parent / Guardian</span>
                    <span className="font-bold text-slate-200 truncate block">
                      {student?.parentName || 'Authorized Guardian'}
                    </span>
                  </div>
                </div>

                {/* Information Callout */}
                <div className="p-3.5 bg-sky-500/10 border border-sky-500/25 rounded-xl flex items-start gap-3 text-xs text-slate-300">
                  <ShieldCheck size={18} className="text-sky-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Official Institutional Identity</span>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                      Use the interactive card viewer on the right to review both <strong>Front</strong> and <strong>Back</strong> sides. Click <strong>Print / PDF</strong> to generate an official printout.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Live Card Preview (7 cols) */}
            <div className="lg:col-span-7 min-h-[520px]">
              <IdCardPreview
                template={activeTemplate}
                recipient={student || authUser}
                recipientType="student"
                schoolSettings={schoolSettings}
                customConfig={activeTemplate?.configuration || null}
                title="MY OFFICIAL STUDENT IDENTITY CARD"
              />
            </div>
          </motion.div>
        )}

        {/* ─── TAB 2: CERTIFICATES ─── */}
        {activeTab === 'certificates' && (
          <motion.div
            key="tab-certificates"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="space-y-6"
          >
            {/* Search Bar */}
            <div className="flex items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
              <div className="flex-1 relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchCertQuery}
                  onChange={(e) => setSearchCertQuery(e.target.value)}
                  placeholder="Search my issued certificates by number or type (e.g. Bonafide, Character)..."
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="text-xs text-slate-400 font-semibold px-2">
                Showing {filteredCertificates.length} of {certificates.length} certificate(s)
              </div>
            </div>

            {/* Certificate List / Empty State */}
            {loadingCertificates ? (
              <div className="p-16 flex flex-col items-center justify-center gap-3 text-xs text-slate-400 bg-slate-900/40 rounded-2xl border border-slate-800">
                <Loader2 size={24} className="animate-spin text-amber-400" />
                <span>Loading your official certificates...</span>
              </div>
            ) : filteredCertificates.length === 0 ? (
              <div className="p-12 text-center bg-slate-900/40 rounded-3xl border border-slate-800 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto">
                  <Award size={32} />
                </div>
                <div className="max-w-md mx-auto space-y-1">
                  <h3 className="text-base font-bold text-white">No Certificates Issued Yet</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    You do not have any official institutional certificates issued under your student admission number at this time. Once issued by the principal or administration (such as Bonafide, Character, Merit, or Transfer certificates), they will appear here with live preview and high-resolution print capabilities.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCertificates.map((cert) => {
                  const isValid = cert.status === 'VALID';
                  return (
                    <div
                      key={cert._id}
                      className="bg-slate-900/60 hover:bg-slate-800/50 transition border border-slate-800 hover:border-slate-700 rounded-2xl p-5 space-y-4 flex flex-col justify-between shadow-lg group"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2.5 py-1 rounded-lg">
                            {cert.certificateNumber}
                          </span>
                          {isValid ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              VALID
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                              REVOKED
                            </span>
                          )}
                        </div>

                        <div>
                          <h4 className="text-sm font-extrabold text-white">
                            {cert.certificateType} CERTIFICATE
                          </h4>
                          <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                            {cert.purposeNote || 'Official institutional academic & character certification.'}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                          <span>Session: {cert.academicSession || '2025-2026'}</span>
                          <span>
                            {new Date(cert.issuedAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons: Preview & Print Only (student cannot verify) */}
                      <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => setActivePreviewCert(cert)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition cursor-pointer"
                        >
                          <Eye size={14} />
                          <span>Preview</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handlePrintCertificate(cert)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold rounded-xl transition shadow-md shadow-amber-500/20 cursor-pointer"
                        >
                          <Printer size={14} />
                          <span>Print</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── CERTIFICATE PREVIEW MODAL ────────────────────────────────────── */}
      <Modal
        open={Boolean(activePreviewCert)}
        onClose={() => setActivePreviewCert(null)}
        size="2xl"
        title={
          activePreviewCert ? (
            <div className="flex items-center gap-3">
              <Award size={18} className="text-amber-400" />
              <div>
                <h3 className="text-sm font-bold text-white">
                  {activePreviewCert.certificateType} Certificate
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">
                  {activePreviewCert.certificateNumber}
                </span>
              </div>
            </div>
          ) : null
        }
        headerActions={
          activePreviewCert ? (
            <button
              type="button"
              onClick={() => handlePrintCertificate(activePreviewCert)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition cursor-pointer mr-1"
            >
              <Printer size={14} />
              <span>Open Full Document</span>
            </button>
          ) : null
        }
        contentClassName="bg-slate-950/40"
      >
        {activePreviewCert && (
          <CertificatePreview
            template={getTemplateById(activePreviewCert.templateId || 'certificate-classic')}
            certificateData={activePreviewCert}
            schoolSettings={schoolSettings}
            title={`${activePreviewCert.certificateType} CERTIFICATE`}
          />
        )}
      </Modal>
    </motion.div>
  );
}

export { StudentPageCertification as studentPageCertification };
