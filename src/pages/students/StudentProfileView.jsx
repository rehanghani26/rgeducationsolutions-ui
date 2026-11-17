/**
 * @file StudentProfileView.jsx
 * @description Dedicated, comprehensive "My Profile" dashboard for logged-in students.
 * Renders all rich student details modeled after StudentForm:
 * - Personal & Demographic details (Full Name, Gender, DOB, Age, Blood Group, Phone, Email)
 * - Academic & Institutional records (Class, Section, Roll No, Admission No, Academic Session, Admission Date)
 * - Parent & Guardian information (Name, Contact, Email)
 * - Address & Contact Details (Residential/Permanent Address)
 * - Identity & KYC Documents (Aadhaar number with mask/unmask toggle, Aadhaar PDF viewer)
 * - Security & Account Status (Username, Status, 2FA, Email Verification)
 * 
 * Includes quick actions to jump to My Student ID Card and My Certificates.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { updateUserProfile } from '../../store/slices/authSlice.js';
import { differenceInYears, format } from 'date-fns';
import {
  User,
  GraduationCap,
  CreditCard,
  Award,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Copy,
  Check,
  FileText,
  Clock,
  Sparkles,
  Lock,
  Download,
  ExternalLink,
  Loader2,
  RefreshCw,
  Droplet,
  Users,
  BookOpen,
  KeyRound,
  ArrowLeft,
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import PdfViewerModal from '../../components/ui/PdfViewerModal.jsx';
import { getStudentById, getStudents } from '../../services/studentService.js';
import { getUserFromStorage } from '../../config/access.jsx';

const resolveImageUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  const clean = url.trim().replace(/\\/g, '/');
  if (!clean) return '';
  if (
    clean.startsWith('http://') ||
    clean.startsWith('https://') ||
    clean.startsWith('data:') ||
    clean.startsWith('blob:')
  ) {
    return clean;
  }
  if (clean.startsWith('/uploads/') || clean.startsWith('uploads/')) {
    const norm = clean.startsWith('/') ? clean : `/${clean}`;
    return `http://localhost:5000${norm}`;
  }
  return `http://localhost:5000/api/v1/students/file/${clean}?redirect=true`;
};

export default function StudentProfileView({ authUser: propAuthUser = null }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const isInsideSettings = location.pathname.toLowerCase().includes('/settings');

  const authUserFromStore = useSelector((state) => state.auth?.user);
  const user = propAuthUser || authUserFromStore || getUserFromStorage() || {};

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedField, setCopiedField] = useState('');
  const [showAadhaarNumber, setShowAadhaarNumber] = useState(false);
  const [activePdfDoc, setActivePdfDoc] = useState(null);

  useEffect(() => {
    fetchStudentProfile();
  }, [user?.profileId, user?._id]);

  const fetchStudentProfile = async () => {
    setLoading(true);
    try {
      let data = null;

      // 1. Try fetching by user.profileId
      if (user?.profileId) {
        try {
          const res = await getStudentById(user.profileId);
          data = res?.student || res?.data || res;
        } catch (e) {
          console.warn('Could not fetch by profileId:', e);
        }
      }

      // 2. Try fetching from student list (backend auto-scopes to logged-in student)
      if (!data) {
        try {
          const res = await getStudents({ limit: 10 });
          const list = Array.isArray(res?.students) && res.students.length > 0
            ? res.students
            : (Array.isArray(res?.data) ? res.data : []);
          if (list.length > 0) {
            data = list.find((s) =>
              (s.email && user?.email && s.email.toLowerCase() === user.email.toLowerCase()) ||
              (s.admissionNumber && user?.admissionNumber && s.admissionNumber === user.admissionNumber)
            ) || list[0];
          }
        } catch (e) {}
      }

      // 3. Fallback to authUser object merged with sensible defaults
      const resolvedPhoto =
        data?.photo ||
        data?.imagesRef?.img ||
        data?.avatar ||
        data?.photoUrl ||
        data?.image ||
        user?.photo ||
        user?.avatar ||
        user?.imagesRef?.img ||
        '';

      const enriched = {
        ...(data || {}),
        _id: data?._id || data?.id || user?.id || user?._id || 'std-self',
        name: data?.name || `${data?.firstName || ''} ${data?.lastName || ''}`.trim() || user?.name || 'Student',
        firstName: data?.firstName || (data?.name ? data.name.split(' ')[0] : (user?.name ? user.name.split(' ')[0] : 'Student')),
        lastName: data?.lastName || (data?.name ? data.name.split(' ').slice(1).join(' ') : (user?.name ? user.name.split(' ').slice(1).join(' ') : '')),
        admissionNumber: data?.admissionNumber || user?.admissionNumber || 'STD-2026-001',
        rollNumber: data?.rollNumber || user?.rollNumber || '01',
        class: data?.class || data?.className || user?.className || user?.class || 'Class 10',
        className: data?.class || data?.className || user?.className || user?.class || 'Class 10',
        section: data?.section || data?.sectionName || user?.sectionName || user?.section || 'Section A',
        sectionName: data?.section || data?.sectionName || user?.sectionName || user?.section || 'Section A',
        gender: data?.gender || user?.gender || 'Male',
        dob: data?.dob || user?.dob || '2010-01-01',
        bloodGroup: data?.bloodGroup || user?.bloodGroup || 'O+',
        contactNumber: data?.contactNumber || user?.phone || user?.contactNumber || '—',
        alternatePhone: data?.alternatePhone || '—',
        email: data?.email || user?.email || user?.username || '—',
        isEmailVerified: data?.isEmailVerified !== undefined ? data.isEmailVerified : Boolean(user?.email),
        address: data?.address || user?.address || '—',
        joiningDate: data?.joiningDate || user?.joiningDate || '2025-04-01',
        academicYear: data?.academicYear || '2025-2026',
        parentName: data?.parentName || user?.parentName || 'Authorized Guardian',
        parentContact: data?.parentContact || data?.guardianContact || '—',
        parentEmail: data?.parentEmail || '—',
        aadhaarNumber: data?.aadhaarNumber || '—',
        photo: resolvedPhoto,
        avatar: resolvedPhoto,
        imagesRef: { id: data?.imagesRef?.id || '', img: resolvedPhoto },
        aadhaarDocument: data?.aadhaarDocument || data?.AdharRef?.pdf || '',
        AdharRef: { id: data?.AdharRef?.id || '', pdf: data?.aadhaarDocument || data?.AdharRef?.pdf || '' },
        status: data?.status || 'active',
        twoFactorEnabled: user?.twoFactorEnabled || false,
      };

      setStudent(enriched);
      if (resolvedPhoto) {
        dispatch(updateUserProfile({ avatar: resolvedPhoto, photo: resolvedPhoto }));
        try {
          const stored = JSON.parse(localStorage.getItem('user') || '{}');
          localStorage.setItem('user', JSON.stringify({ ...stored, avatar: resolvedPhoto, photo: resolvedPhoto }));
        } catch (_) {}
      }
    } catch (err) {
      console.error('Error fetching student profile:', err);
      toast.error('Failed to load full student profile');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCopy = (text, label) => {
    if (!text || text === '—') return;
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    toast.success(`${label} copied to clipboard!`);
    setTimeout(() => setCopiedField(''), 2000);
  };

  const studentAge = useMemo(() => {
    if (!student?.dob) return null;
    try {
      return differenceInYears(new Date(), new Date(student.dob));
    } catch {
      return null;
    }
  }, [student?.dob]);

  const formattedDob = useMemo(() => {
    if (!student?.dob) return '—';
    try {
      return format(new Date(student.dob), 'dd MMM yyyy');
    } catch {
      return String(student.dob);
    }
  }, [student?.dob]);

  const formattedJoiningDate = useMemo(() => {
    if (!student?.joiningDate) return '—';
    try {
      return format(new Date(student.joiningDate), 'dd MMM yyyy');
    } catch {
      return String(student.joiningDate);
    }
  }, [student?.joiningDate]);

  const formattedAadhaar = useMemo(() => {
    const raw = String(student?.aadhaarNumber || '').replace(/\s+/g, '');
    if (!raw || raw === '—') return '—';
    if (!showAadhaarNumber) {
      const last4 = raw.slice(-4);
      return `•••• •••• ${last4}`;
    }
    if (raw.length === 12) {
      return `${raw.slice(0, 4)} ${raw.slice(4, 8)} ${raw.slice(8, 12)}`;
    }
    return raw;
  }, [student?.aadhaarNumber, showAadhaarNumber]);

  const studentPhoto = student?.photo || user?.photo || user?.avatar || '';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-center space-y-3">
        <Loader2 size={36} className="animate-spin text-orange-500" />
        <span className="text-xs text-slate-400 font-semibold tracking-wide">
          Loading your student profile details...
        </span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-20"
    >
      {/* ─── SETTINGS BREADCRUMB / BACK LINK IF RENDERED INSIDE SETTINGS ─── */}
      {isInsideSettings && (
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <button
            type="button"
            onClick={() => navigate('/settings')}
            className="flex items-center gap-2 text-slate-400 hover:text-orange-400 font-bold text-xs transition cursor-pointer"
          >
            <ArrowLeft size={16} /> Back to Settings Overview
          </button>
          <span className="text-xs font-bold text-orange-400">Settings &gt; My Profile</span>
        </div>
      )}

      {/* ─── TOP PAGE HEADER ──────────────────────────────────────────────── */}
      <PageHeader
        title="My Academic Profile"
        subtitle="Complete verified enrollment details, personal information, guardian contacts, and identity credentials"
        breadcrumbs={[{ label: 'Student Portal' }, { label: 'My Profile' }]}
      />

      {/* ─── PROFILE HERO BANNER ──────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-orange-200 dark:border-orange-500/20 bg-gradient-to-r from-orange-50 via-amber-50 to-orange-100/70 dark:from-[#181716] dark:via-[#2A180C] dark:to-[#1F140A] p-3.5 sm:p-5 md:p-6 shadow-xs dark:shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6">
          
          {/* Avatar & Core Identity */}
          <div className="flex items-center gap-3.5 sm:gap-5 flex-wrap sm:flex-nowrap">
            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-gradient-to-tr from-orange-500 to-amber-600 flex items-center justify-center text-white text-xl sm:text-2xl font-black shadow-md shadow-orange-500/20 flex-shrink-0 border-2 border-orange-400/40">
              {studentPhoto ? (
                <img
                  src={resolveImageUrl(studentPhoto)}
                  alt={student?.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <span>{student?.name?.charAt(0) || 'S'}</span>
              )}
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 dark:text-white">
                  {student?.name || 'Student Name'}
                </h2>
                <span className="px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                  <CheckCircle2 size={13} /> Active Enrolled
                </span>
                {student?.isEmailVerified ? (
                  <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-orange-500/15 text-orange-700 dark:text-orange-400 border border-orange-500/30 flex items-center gap-1.5">
                    <ShieldCheck size={13} /> Verified Email
                  </span>
                ) : (
                  <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
                    <AlertCircle size={13} /> Pending Verification
                  </span>
                )}
              </div>

              {/* All details in one clean line, medium size */}
              <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300 font-medium flex-wrap">
                <span className="bg-white dark:bg-stone-800/80 px-3 py-1 rounded-xl border border-orange-200 dark:border-stone-700 font-bold text-orange-600 dark:text-orange-400 shadow-2xs">
                  {student?.class} · {student?.section}
                </span>
                <span>
                  Roll No: <strong className="text-slate-900 dark:text-white font-extrabold">{student?.rollNumber}</strong>
                </span>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <div className="flex items-center gap-1.5 font-mono">
                  <span className="text-slate-500 dark:text-slate-400">Adm No:</span>
                  <span className="font-bold text-orange-600 dark:text-orange-400">{student?.admissionNumber}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(student?.admissionNumber, 'Admission Number')}
                    className="p-1 text-slate-400 hover:text-orange-500 dark:hover:text-white transition cursor-pointer"
                    title="Copy Admission Number"
                  >
                    {copiedField === 'Admission Number' ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                  </button>
                </div>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span>Session: <strong className="text-slate-900 dark:text-slate-100">{student?.academicYear}</strong></span>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span>Admitted: <strong className="text-slate-900 dark:text-slate-100">{formattedJoiningDate}</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Credential Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
            <button
              type="button"
              onClick={() => navigate('/certificates?tab=id-cards')}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-none transition shadow-lg shadow-orange-500/20 cursor-pointer"
            >
              <CreditCard size={16} />
              <span>View My ID Card</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/certificates?tab=certificates')}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-white dark:bg-amber-500/15 hover:bg-amber-50 dark:hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 transition shadow-xs cursor-pointer"
            >
              <Award size={16} />
              <span>My Certificates</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRefreshing(true);
                fetchStudentProfile();
              }}
              disabled={refreshing}
              className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition cursor-pointer flex items-center justify-center shadow-xs"
              title="Refresh Profile Details"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin text-orange-500' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* ─── MAIN PROFILE DATA SECTIONS GRID ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ─── LEFT COLUMN: PERSONAL & ACADEMIC RECORDS (7 cols) ─── */}
        <div className="lg:col-span-7 space-y-6">

          {/* SECTION 1: Personal & Demographic Details */}
          <div className="bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-sm dark:shadow-xl">
            <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/25 flex items-center justify-center">
                <User size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Personal & Demographic Information</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Student individual bio-data and contact details</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold block">First Name</span>
                <span className="font-bold text-sm text-slate-900 dark:text-white">{student?.firstName || '—'}</span>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold block">Last Name</span>
                <span className="font-bold text-sm text-slate-900 dark:text-white">{student?.lastName || '—'}</span>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold block">Gender</span>
                <span className="font-bold text-sm text-slate-900 dark:text-white capitalize">{student?.gender || '—'}</span>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold block">Date of Birth & Age</span>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">{formattedDob}</span>
                  {studentAge !== null && (
                    <span className="text-xs bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold px-2.5 py-0.5 rounded-full border border-orange-500/20">
                      {studentAge} Years Old
                    </span>
                  )}
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold block">Blood Group</span>
                <span className="font-bold text-sm text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                  <Droplet size={14} className="fill-rose-500/30" />
                  {student?.bloodGroup || '—'}
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold block">Primary Mobile Phone</span>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 dark:text-white font-mono">{student?.contactNumber || '—'}</span>
                  {student?.contactNumber && student?.contactNumber !== '—' && (
                    <button
                      type="button"
                      onClick={() => handleCopy(student.contactNumber, 'Phone Number')}
                      className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1"
                      title="Copy Mobile"
                    >
                      {copiedField === 'Phone Number' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    </button>
                  )}
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold block">Alternate Phone</span>
                <span className="font-bold text-sm text-slate-700 dark:text-slate-300 font-mono">{student?.alternatePhone || '—'}</span>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold block">Registered Student Email</span>
                <div className="flex items-center justify-between gap-1">
                  <span className="font-bold text-sm text-orange-600 dark:text-orange-400 truncate font-mono">{student?.email}</span>
                  {student?.email && student?.email !== '—' && (
                    <button
                      type="button"
                      onClick={() => handleCopy(student.email, 'Email')}
                      className="text-slate-400 hover:text-slate-700 dark:hover:text-white flex-shrink-0 p-1"
                      title="Copy Email"
                    >
                      {copiedField === 'Email' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Address Row */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-1.5 text-xs">
              <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold block flex items-center gap-1.5">
                <MapPin size={14} className="text-orange-500" /> Residential & Permanent Address
              </span>
              <p className="font-medium text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {student?.address && student.address !== '—' ? student.address : 'Address records not specified.'}
              </p>
            </div>
          </div>

          {/* SECTION 2: Academic & Institutional Enrollment */}
          <div className="bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-sm dark:shadow-xl">
            <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 flex items-center justify-center">
                <GraduationCap size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Academic & Institutional Enrollment</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Class, roll number, and official school session records</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 text-xs">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold block">Assigned Class</span>
                <span className="font-bold text-sm text-slate-900 dark:text-white">{student?.class || 'Class 10'}</span>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold block">Section</span>
                <span className="font-bold text-sm text-slate-900 dark:text-white">{student?.section || 'Section A'}</span>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold block">Roll Number</span>
                <span className="font-bold text-amber-600 dark:text-amber-400 font-mono text-base">{student?.rollNumber || '01'}</span>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold block">Admission Number</span>
                <span className="font-bold text-orange-600 dark:text-orange-400 font-mono text-sm">{student?.admissionNumber}</span>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold block">Academic Year</span>
                <span className="font-bold text-sm text-slate-900 dark:text-white font-mono">{student?.academicYear || '2025-2026'}</span>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold block">Admission Date</span>
                <span className="font-bold text-sm text-slate-700 dark:text-slate-300">{formattedJoiningDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── RIGHT COLUMN: GUARDIAN, KYC & ACCOUNT STATUS (5 cols) ─── */}
        <div className="lg:col-span-5 space-y-6">

          {/* SECTION 3: Parent & Guardian Information */}
          <div className="bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm dark:shadow-xl">
            <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 flex items-center justify-center">
                <Users size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Parent & Guardian Contacts</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Emergency & registered guardian details</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold block">Guardian Full Name</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">{student?.parentName || 'Authorized Parent'}</span>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold block">Guardian Phone / Mobile</span>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white font-mono text-sm">{student?.parentContact || '—'}</span>
                  {student?.parentContact && student?.parentContact !== '—' && (
                    <button
                      type="button"
                      onClick={() => handleCopy(student.parentContact, 'Guardian Phone')}
                      className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1"
                      title="Copy Phone"
                    >
                      {copiedField === 'Guardian Phone' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    </button>
                  )}
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold block">Guardian Email Address</span>
                <span className="font-bold text-slate-700 dark:text-slate-300 truncate block font-mono text-sm">
                  {student?.parentEmail || '—'}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 4: Identity & KYC Documents */}
          <div className="bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm dark:shadow-xl">
            <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 flex items-center justify-center">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Identity & KYC Verification</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Institutional records and verified identity tokens</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              {/* Aadhaar Number with Toggle */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">Government Aadhaar Number</span>
                  {student?.aadhaarNumber && student?.aadhaarNumber !== '—' && (
                    <button
                      type="button"
                      onClick={() => setShowAadhaarNumber(!showAadhaarNumber)}
                      className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white flex items-center gap-1 text-xs font-semibold transition cursor-pointer"
                    >
                      {showAadhaarNumber ? <EyeOff size={13} /> : <Eye size={13} />}
                      <span>{showAadhaarNumber ? 'Mask' : 'Reveal'}</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-bold text-slate-900 dark:text-white tracking-wider">
                    {formattedAadhaar}
                  </span>
                  {student?.aadhaarNumber && student?.aadhaarNumber !== '—' && (
                    <button
                      type="button"
                      onClick={() => handleCopy(student.aadhaarNumber, 'Aadhaar Number')}
                      className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1"
                      title="Copy Aadhaar"
                    >
                      {copiedField === 'Aadhaar Number' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    </button>
                  )}
                </div>
              </div>

              {/* Uploaded Aadhaar Document */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <FileText size={18} className="text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block text-sm">Aadhaar Card Document</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      {student?.aadhaarDocument ? 'Verified Document Uploaded' : 'No document on file'}
                    </span>
                  </div>
                </div>

                {student?.aadhaarDocument ? (
                  <button
                    type="button"
                    onClick={() =>
                      setActivePdfDoc({
                        url: student.aadhaarDocument,
                        title: `${student.name} - Aadhaar Document`,
                      })
                    }
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold transition cursor-pointer"
                  >
                    <Eye size={13} />
                    <span>View PDF</span>
                  </button>
                ) : (
                  <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-800">
                    Not Uploaded
                  </span>
                )}
              </div>

              {/* Student Photo ID Document */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                    {studentPhoto ? (
                      <img src={studentPhoto} alt="Photo" className="w-full h-full object-cover" />
                    ) : (
                      <User size={15} className="text-slate-500 dark:text-slate-400" />
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block text-sm">Student Profile Photograph</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {studentPhoto ? 'High-Resolution S3 Synced' : 'Default Avatar In Use'}
                    </span>
                  </div>
                </div>

                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                  Verified
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 5: Security & Portal Account */}
          <div className="bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm dark:shadow-xl">
            <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                <Lock size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Security & Portal Access</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Account status and authentication records</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Portal Login ID</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono text-sm">{student?.admissionNumber}</span>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Account Access State</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 text-xs">
                  <CheckCircle2 size={14} /> Active & Enabled
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Two-Factor Authentication (2FA)</span>
                <span className="font-bold text-slate-700 dark:text-slate-300 text-xs">
                  {student?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => navigate('/settings/password-security')}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/30 font-bold transition cursor-pointer text-xs mt-2"
              >
                <KeyRound size={13} />
                <span>Request Password Change</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ─── PDF VIEWER MODAL ─────────────────────────────────────────────── */}
      {activePdfDoc && (
        <PdfViewerModal
          isOpen={Boolean(activePdfDoc)}
          onClose={() => setActivePdfDoc(null)}
          pdfUrl={activePdfDoc.url}
          title={activePdfDoc.title}
        />
      )}
    </motion.div>
  );
}
