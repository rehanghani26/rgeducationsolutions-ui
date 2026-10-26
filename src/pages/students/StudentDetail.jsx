import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSelector } from "react-redux";
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
import { format, differenceInYears } from "date-fns";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { getUserFromStorage } from "../../config/access.jsx";
import { ROLES } from "../../constants/roles.js";
import {
  User,
  CalendarCheck,
  ClipboardList,
  FileText,
  BadgeCheck,
  Activity,
  DollarSign,
  Lock,
  ShieldCheck,
  ExternalLink,
  Phone,
  Mail,
  MapPin,
  Edit3,
  Copy,
  Check,
  Eye,
  EyeOff,
  Sparkles,
  Download,
  AlertCircle,
  Cake,
  Droplet,
  CreditCard,
  Printer,
  ChevronRight,
  ArrowLeft,
  X,
  FileDown,
  Hash,
  School,
  CheckCircle2,
  Calendar,
  Clock,
  Filter,
  RefreshCw,
  RotateCcw,
  Award,
  Star,
  Plus,
  MoreHorizontal,
} from "lucide-react";
import PermissionMatrix from "../../components/ui/PermissionMatrix.jsx";
import ActivityTimeline from "../../components/ui/ActivityTimeline.jsx";
import StatusBadge from "../../components/ui/StatusBadge.jsx";
import Modal from "../../components/ui/Modal.jsx";
import Button from "../../components/ui/Button.jsx";
import Loader from "../../components/ui/Loader.jsx";
import EmbeddedPdfViewer from "../../components/ui/EmbeddedPdfViewer.jsx";
import PdfViewerModal from "../../components/ui/PdfViewerModal.jsx";
import { permissionOptions } from "./StudentForm.jsx";
import {
  getStudentById,
  getStudentActivity,
  getStudentCredentials,
  getStudentAttendance,
  getStudentSessionHistory,
} from "../../services";
import { getApplicantLeaveProfile } from "../../services/leaveService.js";
import { useSchoolBranding } from "../../context/SchoolBrandingContext.jsx";
import IdCardPreview from "../certificates/components/IdCardPreview.jsx";
import CertificatePreview from "../certificates/components/CertificatePreview.jsx";
import IssueModal from "../certificates/components/IssueModal.jsx";
import { getDefaultTemplate, getIssuedCertificates } from "../certificates/services/documentService.js";
import { getTemplateById } from "../certificates/templates/registry.js";
import { MOCK_STUDENT_DATA } from "../certificates/constants/documentConstants.js";
import { getVerificationUrl } from "../certificates/utils/qrUtils.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (val) => (val && val !== "null" && val !== "undefined" ? val : "—");

const formatAadhaar = (val) => {
  if (!val) return "—";
  const clean = String(val).replace(/\s+/g, "");
  if (clean.length === 12) {
    return `${clean.slice(0, 4)} ${clean.slice(4, 8)} ${clean.slice(8, 12)}`;
  }
  return val;
};

const MONTH_NAMES = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const currentYearNum = new Date().getFullYear();
const YEAR_OPTIONS = [
  currentYearNum + 1,
  currentYearNum,
  currentYearNum - 1,
  currentYearNum - 2,
  currentYearNum - 3,
];

// ─── StudentDetail Component ──────────────────────────────────────────────────

const StudentDetail = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth?.user);
  const user = authUser || getUserFromStorage() || { role: "super-admin" };
  const userRole = user?.role || "";

  const isSuperAdmin = [ROLES.SUPER_ADMIN, "superadmin"].includes(userRole);
  const canSeeCredentials = isSuperAdmin || userRole === ROLES.STUDENT;

  const [searchParams] = useSearchParams();
  const urlTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(urlTab || "overview");
  const schoolBranding = useSchoolBranding();

  useEffect(() => {
    if (urlTab) {
      setActiveTab(urlTab);
    }
  }, [urlTab]);

  const canManage = [ROLES.SUPER_ADMIN, "superadmin", "school-admin", "admin", "principal", "director"].includes(
    String(userRole || "").toLowerCase()
  );

  const [student, setStudent] = useState(null);
  const [activity, setActivity] = useState({ logs: [], loginHistory: [] });
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState("");
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);

  // Credentials Modal State
  const [activeCredentialsModal, setActiveCredentialsModal] = useState(null);
  const [showPasswordText, setShowPasswordText] = useState(false);

  // Mobile navigation menus state
  const [mobileTabsMenuOpen, setMobileTabsMenuOpen] = useState(false);
  const [mobileActionsOpen, setMobileActionsOpen] = useState(false);
  const mobileTabsRef = useRef(null);
  const mobileActionsRef = useRef(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (mobileTabsRef.current && !mobileTabsRef.current.contains(e.target)) {
        setMobileTabsMenuOpen(false);
      }
      if (mobileActionsRef.current && !mobileActionsRef.current.contains(e.target)) {
        setMobileActionsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Student ID Card Tab State (Finalized School Format)
  const [defaultIdTemplate, setDefaultIdTemplate] = useState(null);
  const [idTemplateLoading, setIdTemplateLoading] = useState(false);
  const [idCardDummyMode, setIdCardDummyMode] = useState(false);

  // Certificates Tab State (Student Issued Credentials)
  const [studentCertificates, setStudentCertificates] = useState([]);
  const [certsLoading, setCertsLoading] = useState(false);
  const [activeCertPreview, setActiveCertPreview] = useState(null);
  const [isCertIssueModalOpen, setIsCertIssueModalOpen] = useState(false);

  // Student Attendance State
  const [attendanceData, setAttendanceData] = useState({
    summary: { totalDays: 0, presentCount: 0, absentCount: 0, lateCount: 0, halfDayCount: 0, percentage: "0%" },
    logs: [],
  });
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceFilterType, setAttendanceFilterType] = useState("all"); // "all" | "date" | "range" | "month_year"
  const [attSpecificDate, setAttSpecificDate] = useState("");
  const [attStartDate, setAttStartDate] = useState("");
  const [attEndDate, setAttEndDate] = useState("");
  const [attYear, setAttYear] = useState(new Date().getFullYear().toString());
  const [attMonth, setAttMonth] = useState((new Date().getMonth() + 1).toString());
  const [attStatusFilter, setAttStatusFilter] = useState("all");

  // Student Academic Session History
  const [sessionHistoryData, setSessionHistoryData] = useState(null);
  const [sessionHistoryLoading, setSessionHistoryLoading] = useState(false);

  // Student Leave Management State
  const [leaveData, setLeaveData] = useState({
    profile: null,
    summary: { totalApplications: 0, approvedDays: 0, pendingCount: 0, rejectedCount: 0 },
    activeLeave: null,
    requests: [],
  });
  const [leaveLoading, setLeaveLoading] = useState(false);

  // Fetch Student Leave Profile and Records (View Only by ID)
  const fetchStudentLeaves = useCallback(async () => {
    const targetId = student?._id || student?.id || studentId || student?.admissionNumber;
    if (!targetId) return;
    setLeaveLoading(true);
    try {
      const res = await getApplicantLeaveProfile(targetId);
      const payload = res?.data || res;
      if (payload && (payload.success || payload.summary)) {
        setLeaveData({
          profile: payload.applicant || null,
          summary: payload.summary || { totalApplications: 0, approvedDays: 0, pendingCount: 0, rejectedCount: 0 },
          activeLeave: payload.activeLeave || payload.activeLeaveNow || null,
          requests: payload.requests || payload.records || [
            ...(payload.pendingRequests || []),
            ...(payload.history || []),
          ],
        });
      }
    } catch (e) {
      console.error("Failed to load student leave profile:", e);
    } finally {
      setLeaveLoading(false);
    }
  }, [student, studentId]);

  useEffect(() => {
    if (activeTab === "leaves" && (student || studentId)) {
      fetchStudentLeaves();
    }
  }, [activeTab, student, studentId, fetchStudentLeaves]);

  // Fetch Institutional Finalized Default ID Template
  const fetchDefaultIdTemplate = useCallback(async () => {
    setIdTemplateLoading(true);
    try {
      const res = await getDefaultTemplate("student-id-card");
      if (res?.defaultTemplate) {
        setDefaultIdTemplate(res.defaultTemplate);
      }
    } catch (e) {
      console.error("Error loading default ID template:", e);
    } finally {
      setIdTemplateLoading(false);
    }
  }, []);

  // Fetch Certificates Issued to this Student
  const fetchStudentCertificates = useCallback(async () => {
    const targetId = student?._id || student?.id || studentId;
    if (!targetId) return;
    setCertsLoading(true);
    try {
      const res = await getIssuedCertificates({
        recipientType: "student",
        search: student?.admissionNumber || student?.name || "",
      });
      const list = res?.certificates || res?.data?.certificates || [];
      const matched = list.filter(
        (c) =>
          c.recipientId === String(student?._id) ||
          c.recipientId === String(student?.id) ||
          c.recipientId === String(studentId) ||
          (student?.admissionNumber && c.recipientIdSnapshot === student.admissionNumber)
      );
      setStudentCertificates(matched);
      if (matched.length > 0) {
        setActiveCertPreview((prev) => {
          if (!prev) return matched[0];
          return matched.find((c) => c._id === prev._id) || matched[0];
        });
      }
    } catch (e) {
      console.error("Error loading student certificates:", e);
    } finally {
      setCertsLoading(false);
    }
  }, [student, studentId]);

  const resolvedIdTemplate = useMemo(() => {
    const templateId = defaultIdTemplate?.templateId || "student-id-classic";
    return getTemplateById(templateId);
  }, [defaultIdTemplate]);

  useEffect(() => {
    if (activeTab === "id-card" && !defaultIdTemplate) {
      fetchDefaultIdTemplate();
    } else if (activeTab === "certificates") {
      fetchStudentCertificates();
    }
  }, [activeTab, fetchDefaultIdTemplate, fetchStudentCertificates, defaultIdTemplate]);

  const handleCertIssuedSuccess = (newCert) => {
    fetchStudentCertificates();
    if (newCert && (newCert.certificateNumber || newCert._id)) {
      setActiveCertPreview(newCert);
      toast.success(
        `Certificate ${newCert.certificateNumber || ""} issued and ready in profile!`
      );
    }
  };

  const fetchAttendance = useCallback(async () => {
    const targetId = student?._id || student?.id || studentId || student?.admissionNumber;
    if (!targetId) return;

    setAttendanceLoading(true);
    try {
      const params = {};
      if (attStatusFilter && attStatusFilter !== "all") {
        params.status = attStatusFilter;
      }

      if (attendanceFilterType === "date" && attSpecificDate) {
        params.date = attSpecificDate;
      } else if (attendanceFilterType === "range") {
        if (attStartDate) params.startDate = attStartDate;
        if (attEndDate) params.endDate = attEndDate;
      } else if (attendanceFilterType === "month_year") {
        if (attYear) params.year = attYear;
        if (attMonth) params.month = attMonth;
      }

      const res = await getStudentAttendance(targetId, params);
      if (res?.summary || res?.data?.summary) {
        setAttendanceData({
          summary: res.summary || res.data?.summary || {
            totalDays: 0,
            presentCount: 0,
            absentCount: 0,
            lateCount: 0,
            halfDayCount: 0,
            percentage: "0%",
          },
          logs: res.logs || res.data?.logs || [],
        });
      } else {
        setAttendanceData({
          summary: { totalDays: 0, presentCount: 0, absentCount: 0, lateCount: 0, halfDayCount: 0, percentage: "0%" },
          logs: [],
        });
      }
    } catch (err) {
      console.error("Error loading student attendance:", err);
    } finally {
      setAttendanceLoading(false);
    }
  }, [
    studentId,
    student?._id,
    student?.id,
    student?.admissionNumber,
    attendanceFilterType,
    attSpecificDate,
    attStartDate,
    attEndDate,
    attYear,
    attMonth,
    attStatusFilter,
  ]);

  // When user selects attendance tab or filters change, call the API
  useEffect(() => {
    if (activeTab === "attendance") {
      fetchAttendance();
    }
  }, [activeTab, fetchAttendance]);

  // Fetch Student Academic Session History
  const fetchSessionHistory = useCallback(async () => {
    const targetId = student?._id || student?.id || studentId || student?.admissionNumber;
    if (!targetId) return;
    setSessionHistoryLoading(true);
    try {
      const res = await getStudentSessionHistory(targetId);
      setSessionHistoryData(res);
    } catch (err) {
      console.warn("Could not load student session history:", err);
    } finally {
      setSessionHistoryLoading(false);
    }
  }, [student, studentId]);

  useEffect(() => {
    if (activeTab === "academic") {
      fetchSessionHistory();
    }
  }, [activeTab, fetchSessionHistory]);

  const handleResetAttendanceFilters = () => {
    setAttendanceFilterType("all");
    setAttSpecificDate("");
    setAttStartDate("");
    setAttEndDate("");
    setAttYear(new Date().getFullYear().toString());
    setAttMonth((new Date().getMonth() + 1).toString());
    setAttStatusFilter("all");
  };

  useEffect(() => {
    if (!studentId) return;
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const [studentRes, actRes] = await Promise.all([
          getStudentById(studentId).catch(() => null),
          getStudentActivity(studentId).catch(() => null),
        ]);

        let s = studentRes?.student || studentRes?.data?.student || null;
        if (!s) {
          const { mockStudents } = await import("../../data/mockData.js");
          s =
            mockStudents?.find(
              (m) =>
                String(m.id) === String(studentId) ||
                String(m._id) === String(studentId)
            ) || null;
        }

        setStudent(s);
        setActivity(actRes?.data || actRes || { logs: [], loginHistory: [] });
      } catch (err) {
        console.error("Error loading student detail:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [studentId]);

  const handleCopy = (text, field) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`${field} copied to clipboard!`);
    setTimeout(() => setCopiedField(""), 2000);
  };

  const handleFetchCredentials = async () => {
    setShowPasswordText(false);
    try {
      const targetId = student._id || student.id || student.admissionNumber;
      const res = await getStudentCredentials(targetId).catch(() => null);
      const creds = res?.credentials ||
        res?.data?.credentials || {
          username: student.admissionNumber || "STD-001",
          email:
            student.email ||
            `${(student.admissionNumber || "std").toLowerCase()}@school.local`,
          password: student.password || student.tempPassword || "Std@2026!pass",
          name: student.name,
        };
      setActiveCredentialsModal(creds);
    } catch (err) {
      console.error("Credentials error:", err);
      toast.error("Failed to load credentials");
    }
  };

  // Resolved class / section / photo info
  const rawCls =
    student?.className || student?.classDetails?.name || student?.class;
  const rawSec =
    student?.sectionName || student?.sectionDetails?.name || student?.section;
  const className =
    rawCls && rawCls !== "null" && rawCls !== "undefined" ? rawCls : null;
  const sectionName =
    rawSec && rawSec !== "null" && rawSec !== "undefined" ? rawSec : null;
  const classSection =
    [className, sectionName].filter(Boolean).join(" – ") || "Unassigned";

  const photoUrl = student?.photo || student?.imagesRef?.img || "";
  const photoId = student?.imagesRef?.id || student?.photoId || "";
  const aadhaarPdfUrl =
    student?.aadhaarDocument ||
    student?.AdharRef?.pdf ||
    student?.aadhaarPdf ||
    "";
  const aadhaarPdfId = student?.AdharRef?.id || student?.aadhaarDocId || "";

  const studentAge = student?.dob
    ? (() => {
        try {
          return differenceInYears(new Date(), new Date(student.dob));
        } catch {
          return null;
        }
      })()
    : null;

  const tabs = [
    { id: "overview", label: "Overview", shortLabel: "Overview", icon: User },
    { id: "academic", label: "Academic & Enrollment", shortLabel: "Academic", icon: ClipboardList },
    { id: "id-card", label: "Student ID Card", shortLabel: "ID Card", icon: CreditCard },
    { id: "certificates", label: "Certificates", shortLabel: "Certificates", icon: Award },
    { id: "documents", label: "Identity & Documents", shortLabel: "Documents", icon: ShieldCheck },
    { id: "parent", label: "Guardian & Family", shortLabel: "Family", icon: FileText },
    { id: "attendance", label: "Attendance", shortLabel: "Attendance", icon: CalendarCheck },
    { id: "leaves", label: "Leave History", shortLabel: "Leaves", icon: Calendar },
    { id: "fees", label: "Fee & Dues", shortLabel: "Fees", icon: DollarSign },
    { id: "permissions", label: "Portal Access", shortLabel: "Access", icon: Lock },
    { id: "activity", label: "Audit Timeline", shortLabel: "Timeline", icon: Activity },
  ];

  const primaryTabs = tabs.slice(0, 2);
  const overflowTabs = tabs.slice(2);
  const isOverflowTabActive = overflowTabs.some((t) => t.id === activeTab);
  const activeOverflowTab = overflowTabs.find((t) => t.id === activeTab);

  if (loading) {
    return (
      <Loader
        fullPage
        size="lg"
        text="Loading student profile..."
        className="py-24"
      />
    );
  }

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
          <AlertCircle size={32} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Student Record Not Found
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            This student could not be located. The record may have been archived
            or removed.
          </p>
        </div>
        <Link
          to="/students"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold hover:from-orange-600 hover:to-amber-600 transition shadow-md shadow-orange-500/20"
        >
          <ArrowLeft size={14} /> Back to Students
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* ── Top Navigation Bar ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 min-w-0">
          <Link
            to="/students"
            className="hover:text-orange-500 dark:hover:text-orange-400 flex items-center gap-1 transition shrink-0"
          >
            <ArrowLeft size={14} />
            <span>Students</span>
          </Link>
          <ChevronRight size={12} className="text-slate-400 shrink-0" />
          <span className="text-slate-900 dark:text-slate-200 font-bold truncate max-w-[120px] sm:max-w-none">
            {student.name}
          </span>
        </div>

        {/* Desktop Actions */}
        <div className="hidden sm:flex items-center gap-2">
          {canSeeCredentials && (
            <button
              onClick={handleFetchCredentials}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition shadow-sm"
              title="View Student Database Password"
            >
              <Eye size={13} />
              <span>DB Credentials</span>
            </button>
          )}
          <Link
            to={`/id-cards?studentId=${studentId}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-orange-400 hover:text-orange-600 dark:hover:text-orange-400 transition shadow-sm"
          >
            <CreditCard size={14} className="text-orange-500" />
            <span>ID Card</span>
          </Link>
          <Link
            to={`/students/${studentId}/edit`}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:from-orange-700 active:to-amber-700 transition shadow-md shadow-orange-500/25"
          >
            <Edit3 size={13} />
            <span>Edit Profile</span>
          </Link>
        </div>

        {/* Mobile Actions: Edit Profile + Three-dot dropdown for DB Credentials & ID Card */}
        <div className="flex sm:hidden items-center gap-1.5 shrink-0" ref={mobileActionsRef}>
          <Link
            to={`/students/${studentId}/edit`}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 transition shadow-sm"
          >
            <Edit3 size={12} />
            <span>Edit</span>
          </Link>

          <div className="relative">
            <button
              type="button"
              onClick={() => setMobileActionsOpen((prev) => !prev)}
              className={`p-1.5 rounded-lg transition border ${
                mobileActionsOpen
                  ? "border-orange-400 bg-orange-500/10 text-orange-600 dark:text-orange-400"
                  : "text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
              }`}
              aria-label="More actions"
            >
              <MoreHorizontal size={16} />
            </button>

            {mobileActionsOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-48 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 p-1 space-y-1 animate-in fade-in zoom-in-95">
                {canSeeCredentials && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileActionsOpen(false);
                      handleFetchCredentials();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-left transition"
                  >
                    <Eye size={14} />
                    <span>DB Credentials</span>
                  </button>
                )}
                <Link
                  to={`/id-cards?studentId=${studentId}`}
                  onClick={() => setMobileActionsOpen(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition"
                >
                  <CreditCard size={14} className="text-orange-500" />
                  <span>ID Card</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Modern Profile Hero Banner ────────────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        {/* Decorative Header Gradient Banner */}
        <div className="h-20 sm:h-44 w-full bg-gradient-to-r from-[#181716] via-[#2A180C] to-[#1F140A] relative overflow-hidden border-b border-orange-500/20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(249,115,22,0.25),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(245,158,11,0.18),transparent_50%)]" />
          <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />

          {/* Quick Corner Tag — Desktop only */}
          <div className="hidden sm:flex absolute top-4 right-4 items-center gap-2">
            <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-white/90 border border-white/10 flex items-center gap-1.5">
              <School size={12} className="text-orange-400" />
              <span>{student.academicYear || "Academic Year 2025-26"}</span>
            </span>
          </div>
        </div>

        {/* Profile Details overlapping the banner */}
        <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-0 relative flex flex-col md:flex-row items-start md:items-end justify-between gap-4 -mt-10 sm:-mt-20">
          <div className="flex items-center sm:items-end gap-3.5 sm:gap-5 w-full md:w-auto">
            {/* Avatar with Click-to-Zoom */}
            <div
              onClick={() => photoUrl && setPhotoModalOpen(true)}
              className={`relative w-16 h-16 sm:w-32 sm:h-32 rounded-xl sm:rounded-2xl overflow-hidden border-2 sm:border-4 border-white dark:border-slate-900 shadow-xl sm:shadow-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex-shrink-0 ${
                photoUrl ? "cursor-pointer group" : ""
              }`}
            >
              {photoUrl ? (
                <>
                  <img
                    src={photoUrl}
                    alt={student.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold gap-1">
                    <Eye size={16} />
                    <span>View</span>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-white">
                  <User size={24} className="sm:hidden text-white/80" />
                  <User size={40} className="hidden sm:block text-white/80 mb-1" />
                  <span className="font-extrabold text-[10px] sm:text-xs uppercase tracking-wider">
                    {student.name?.slice(0, 2) || "ST"}
                  </span>
                </div>
              )}

              {/* Status Dot — Desktop only */}
              <div
                className={`hidden sm:block absolute bottom-2 right-2 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${
                  student.status === "active"
                    ? "bg-emerald-500"
                    : student.status === "Passout"
                      ? "bg-amber-500"
                      : "bg-slate-400"
                }`}
                title={`Status: ${student.status || "Active"}`}
              />
            </div>

            {/* Student Name & Meta */}
            <div className="space-y-1 sm:space-y-2 mb-0.5 sm:mb-1 min-w-0 flex-1 sm:flex-initial">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight truncate sm:whitespace-normal">
                  {student.name}
                </h1>
                <div className="hidden sm:inline-flex">
                  <StatusBadge status={student.status || "active"} />
                </div>
                {student.aadhaarNumber && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 size={12} />
                    <span>Aadhaar Verified</span>
                  </span>
                )}
              </div>

              {/* Mobile-only small class tag */}
              <div className="flex sm:hidden items-center gap-1.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[11px] font-bold border border-orange-500/20">
                  <School size={11} className="text-orange-500" />
                  <span>{classSection}</span>
                </span>
              </div>

              {/* Desktop Badges Row */}
              <div className="hidden sm:flex flex-wrap items-center gap-2 text-xs">
                {/* Admission No with Copy */}
                <div
                  onClick={() =>
                    handleCopy(student.admissionNumber, "Admission No")
                  }
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 dark:bg-orange-950/60 border border-orange-200/70 dark:border-orange-800/40 text-orange-700 dark:text-orange-300 font-mono font-bold cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-900/40 transition"
                  title="Click to copy admission number"
                >
                  <Hash size={12} className="text-orange-500" />
                  <span>{student.admissionNumber || "ADM-N/A"}</span>
                  {copiedField === "Admission No" ? (
                    <Check size={11} className="text-emerald-500" />
                  ) : (
                    <Copy size={11} className="opacity-60" />
                  )}
                </div>

                {/* Class & Section Pill */}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold">
                  <School size={13} className="text-orange-500" />
                  <span>{classSection}</span>
                </span>

                {/* Roll Number */}
                {student.rollNumber != null && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-bold">
                    <span className="text-[10px] text-slate-400 uppercase">
                      Roll:
                    </span>
                    <span>#{student.rollNumber}</span>
                  </span>
                )}

                {/* Gender */}
                {student.gender && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                    {student.gender}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Contact Chips — Desktop only */}
          <div className="hidden sm:flex flex-wrap items-center gap-2 self-stretch md:self-end pt-2 md:pt-0">
            {student.contactNumber && (
              <a
                href={`tel:${student.contactNumber}`}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-orange-950/60 text-slate-700 dark:text-slate-200 hover:text-orange-600 dark:hover:text-orange-400 text-xs font-bold transition border border-slate-200/80 dark:border-slate-700"
              >
                <Phone size={13} className="text-orange-500" />
                <span>{student.contactNumber}</span>
              </a>
            )}
            {student.email && (
              <div className="flex items-center gap-1.5">
                <a
                  href={`mailto:${student.email}`}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-orange-950/60 text-slate-700 dark:text-slate-200 hover:text-orange-600 dark:hover:text-orange-400 text-xs font-bold transition border border-slate-200/80 dark:border-slate-700"
                >
                  <Mail size={13} className="text-orange-500" />
                  <span className="truncate max-w-[150px]">{student.email}</span>
                </a>
                {student.isEmailVerified ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold shadow-xs" title="Student email is verified">
                    <CheckCircle2 size={13} />
                    <span>Verified</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold shadow-xs" title="Student email is not verified">
                    <AlertCircle size={13} />
                    <span>Not Verified</span>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Key Highlights Strip ────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 divide-x divide-slate-200/80 dark:divide-slate-800 text-xs">
          <div className="p-3.5 sm:px-6">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Class &amp; Section
            </p>
            <p className="font-extrabold text-slate-800 dark:text-slate-100 mt-0.5 truncate">
              {classSection}
            </p>
          </div>
          <div className="p-3.5 sm:px-6">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Roll Number
            </p>
            <p className="font-extrabold font-mono text-slate-800 dark:text-slate-100 mt-0.5">
              {student.rollNumber != null ? `#${student.rollNumber}` : "—"}
            </p>
          </div>
          <div className="p-3.5 sm:px-6">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              UIDAI Aadhaar
            </p>
            <p className="font-extrabold text-slate-800 dark:text-slate-100 mt-0.5 truncate">
              {student.aadhaarNumber
                ? `•••• ${student.aadhaarNumber.slice(-4)}`
                : "Not Attached"}
            </p>
          </div>
          <div className="p-3.5 sm:px-6">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Blood Group
            </p>
            <div className="flex items-center gap-1 font-extrabold text-rose-600 dark:text-rose-400 mt-0.5">
              <Droplet size={12} className="fill-current" />
              <span>{student.bloodGroup || "—"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Navigation Tabs ──────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm">
        {/* Desktop Tab Row: all tabs visible & scrollable */}
        <div className="hidden sm:flex items-center gap-1 p-2 border-b border-slate-200/80 dark:border-slate-800 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  isActive
                    ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Mobile Tab Row with Three-Dot Overflow */}
        <div className="flex sm:hidden items-center justify-between gap-1.5 p-2 border-b border-slate-200/80 dark:border-slate-800 relative" ref={mobileTabsRef}>
          {/* Visible primary tabs (Overview & Academic) */}
          <div className="flex items-center gap-1 flex-1 min-w-0">
            {primaryTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMobileTabsMenuOpen(false);
                  }}
                  className={`flex-1 min-w-0 flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-bold transition truncate ${
                    isActive
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon size={14} className="shrink-0" />
                  <span className="truncate">{tab.shortLabel || tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Three-Dot Menu button */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setMobileTabsMenuOpen((prev) => !prev)}
              className={`flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition ${
                isOverflowTabActive
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25 ring-1 ring-orange-500/40"
                  : mobileTabsMenuOpen
                  ? "bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-300 dark:border-orange-800"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50"
              }`}
              aria-expanded={mobileTabsMenuOpen}
              aria-label="More tabs"
            >
              {isOverflowTabActive && activeOverflowTab ? (
                <>
                  <activeOverflowTab.icon size={14} className="shrink-0" />
                  <span className="max-w-[70px] truncate">{activeOverflowTab.shortLabel || activeOverflowTab.label}</span>
                  <MoreHorizontal size={13} className="shrink-0 opacity-80" />
                </>
              ) : (
                <>
                  <MoreHorizontal size={15} className="shrink-0" />
                  <span className="text-[11px] font-bold">More</span>
                </>
              )}
            </button>

            {/* Dropdown Menu */}
            {mobileTabsMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 max-h-80 overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 p-1.5 space-y-1 animate-in fade-in zoom-in-95 scrollbar-thin">
                <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-slate-100 dark:border-slate-800 mb-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    More Modules
                  </span>
                  <span className="text-[9px] font-bold text-orange-600 dark:text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded-full">
                    {overflowTabs.length} tabs
                  </span>
                </div>
                {overflowTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setMobileTabsMenuOpen(false);
                      }}
                      className={`flex w-full items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                        isActive
                          ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold shadow-xs"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                            isActive ? "bg-white/20 text-white" : "bg-orange-500/10 text-orange-600 dark:text-orange-400"
                          }`}
                        >
                          <Icon size={13} />
                        </div>
                        <span className="truncate">{tab.label}</span>
                      </div>
                      {isActive && <Check size={14} className="text-white shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Tab Content Area */}
        <div className="p-6">
          {/* ── 1. OVERVIEW TAB ──────────────────────────────────────────── */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Government & Identity Proof Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-orange-50/70 via-stone-50 to-amber-50/40 dark:from-stone-800/80 dark:via-stone-900 dark:to-orange-950/40 border border-orange-100 dark:border-orange-900/50 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-orange-100/80 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        Government Identity Verification (UIDAI)
                        {student.aadhaarNumber && (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            Verified
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Official student identity documents stored securely on
                        Cloudinary.
                      </p>
                    </div>
                  </div>

                  {aadhaarPdfUrl && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPdfModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold shadow-md shadow-orange-500/25 transition cursor-pointer"
                      >
                        <Eye size={14} />
                        <span>Preview PDF</span>
                      </button>
                      <a
                        href={aadhaarPdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition"
                      >
                        <ExternalLink size={13} />
                        <span>Browser View</span>
                      </a>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Aadhaar Number */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/80 space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      12-Digit Aadhaar Number
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-mono font-extrabold text-slate-800 dark:text-slate-100">
                        {formatAadhaar(student.aadhaarNumber)}
                      </p>
                      {student.aadhaarNumber && (
                        <button
                          onClick={() =>
                            handleCopy(student.aadhaarNumber, "Aadhaar Number")
                          }
                          className="p-1 text-slate-400 hover:text-orange-500 transition"
                          title="Copy Aadhaar Number"
                        >
                          {copiedField === "Aadhaar Number" ? (
                            <Check size={14} className="text-emerald-500" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Photo Cloudinary Ref */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/80 space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Photo Reference ID
                    </p>
                    <div className="flex items-center justify-between">
                      <p
                        className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 truncate max-w-[150px]"
                        title={photoId}
                      >
                        {photoId || (photoUrl ? "Linked" : "Not attached")}
                      </p>
                      {photoUrl && (
                        <button
                          onClick={() => setPhotoModalOpen(true)}
                          className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
                        >
                          Preview
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Aadhaar PDF Cloudinary Ref */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/80 space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Aadhaar PDF Ref ID
                    </p>
                    <div className="flex items-center justify-between">
                      <p
                        className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 truncate max-w-[150px]"
                        title={aadhaarPdfId}
                      >
                        {aadhaarPdfId ||
                          (aadhaarPdfUrl ? "Linked" : "Not uploaded")}
                      </p>
                      {aadhaarPdfUrl && (
                        <button
                          type="button"
                          onClick={() => setPdfModalOpen(true)}
                          className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                        >
                          <span>Preview</span>
                          <Eye size={11} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal & Academic Details Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-4">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <User size={15} className="text-orange-500" />
                    <span>Personal Information</span>
                  </h4>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        First Name
                      </span>
                      <p className="font-bold text-slate-800 dark:text-slate-100">
                        {student.firstName ||
                          student.name?.split(" ")[0] ||
                          "—"}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        Last Name
                      </span>
                      <p className="font-bold text-slate-800 dark:text-slate-100">
                        {student.lastName ||
                          student.name?.split(" ").slice(1).join(" ") ||
                          "—"}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        Date of Birth
                      </span>
                      <p className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                        <Cake size={13} className="text-orange-500" />
                        <span>
                          {student.dob
                            ? format(new Date(student.dob), "dd MMM yyyy")
                            : "—"}
                          {studentAge != null && ` (${studentAge} yrs)`}
                        </span>
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        Gender
                      </span>
                      <p className="font-bold text-slate-800 dark:text-slate-100">
                        {student.gender || "—"}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        Blood Group
                      </span>
                      <p className="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                        <Droplet size={13} className="fill-current" />
                        <span>{student.bloodGroup || "—"}</span>
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        Admission Date
                      </span>
                      <p className="font-bold text-slate-800 dark:text-slate-100">
                        {student.joiningDate
                          ? format(new Date(student.joiningDate), "dd MMM yyyy")
                          : "—"}
                      </p>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 space-y-1 text-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                      <MapPin size={12} className="text-orange-500" />
                      <span>Residential Address</span>
                    </span>
                    <p className="font-semibold text-slate-700 dark:text-slate-200">
                      {typeof student.address === "object"
                        ? student.address?.street ||
                          student.address?.city ||
                          "—"
                        : student.address || "No address specified"}
                    </p>
                  </div>
                </div>

                {/* Guardian & Contact Information */}
                <div className="p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-4">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <FileText size={15} className="text-orange-500" />
                    <span>Parent &amp; Guardian Information</span>
                  </h4>

                  <div className="space-y-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          Guardian / Parent Name
                        </span>
                        <p className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                          {student.parentName || student.parentId?.name || "—"}
                        </p>
                      </div>
                      <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold">
                        <User size={18} />
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          Primary Contact
                        </span>
                        <p className="font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                          {student.parentContact ||
                            student.parentId?.phone ||
                            student.contactNumber ||
                            "—"}
                        </p>
                      </div>
                      {(student.parentContact || student.contactNumber) && (
                        <a
                          href={`tel:${student.parentContact || student.contactNumber}`}
                          className="px-3 py-1.5 rounded-lg bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/40 text-xs font-bold flex items-center gap-1 transition"
                        >
                          <Phone size={12} />
                          <span>Call</span>
                        </a>
                      )}
                    </div>

                    <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          Parent Email
                        </span>
                        <p className="font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                          {student.parentEmail ||
                            student.parentId?.email ||
                            "—"}
                        </p>
                      </div>
                      {student.parentEmail && (
                        <a
                          href={`mailto:${student.parentEmail}`}
                          className="px-3 py-1.5 rounded-lg bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/40 text-xs font-bold flex items-center gap-1 transition"
                        >
                          <Mail size={12} />
                          <span>Email</span>
                        </a>
                      )}
                    </div>

                    <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          Student Portal Login
                        </span>
                        <p className="font-mono font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                          {student.email || "student@school.local"}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        {student.status === "active"
                          ? "Active Account"
                          : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── 2. ACADEMIC TAB ─────────────────────────────────────────── */}
          {activeTab === "academic" && (
            <div className="space-y-6">
              {/* Enrolled Class & Section Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Enrolled Class
                  </span>
                  <p className="text-base font-extrabold text-slate-900 dark:text-white">
                    {className || sessionHistoryData?.student?.className || "Not Assigned"}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Assigned Section
                  </span>
                  <p className="text-base font-extrabold text-slate-900 dark:text-white">
                    {sectionName || sessionHistoryData?.student?.sectionName || "Not Assigned"}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Roll Number
                  </span>
                  <p className="text-base font-mono font-extrabold text-orange-600 dark:text-orange-400">
                    {student.rollNumber != null
                      ? `#${student.rollNumber}`
                      : "—"}
                  </p>
                </div>
              </div>

              {/* Current Class Teacher & Session Card */}
              {sessionHistoryData?.currentClassTeacher && (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent border border-orange-200/70 dark:border-orange-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white font-extrabold flex items-center justify-center text-sm shadow-md shrink-0">
                      {sessionHistoryData.currentClassTeacher.name?.slice(0, 2).toUpperCase() || "CT"}
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-orange-600 dark:text-orange-400 tracking-wider">
                        Assigned Class Teacher
                      </span>
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {sessionHistoryData.currentClassTeacher.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {sessionHistoryData.currentClassTeacher.email || sessionHistoryData.currentClassTeacher.phone || "Faculty Mentor"}
                      </p>
                    </div>
                  </div>

                  {sessionHistoryData.currentClassRoom?._id && (
                    <Link
                      to={`/academics/classes/${sessionHistoryData.currentClassRoom._id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:border-orange-500 transition shadow-xs"
                    >
                      <School size={14} className="text-orange-500" />
                      <span>View ClassRoom Hub</span>
                    </Link>
                  )}
                </div>
              )}

              {/* Session Progression Journey Timeline */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Clock size={15} className="text-orange-500" />
                    <span>Academic Session Progression Journey</span>
                  </h4>
                  {sessionHistoryLoading && <Loader size="sm" />}
                </div>

                {sessionHistoryData?.history?.length > 0 ? (
                  <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-orange-200 dark:before:bg-orange-950">
                    {sessionHistoryData.history.map((h, idx) => (
                      <div key={idx} className="relative group">
                        <div className="absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full bg-orange-500 border-2 border-white dark:border-slate-900 shadow-xs" />
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                              {h.className} · {h.sectionName}
                            </span>
                            <span className="font-mono font-bold text-[11px] px-2.5 py-0.5 rounded-lg bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                              {h.sessionName}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                            <span>Roll Number: <strong className="text-slate-700 dark:text-slate-300">#{h.rollNumber || "—"}</strong></span>
                            <span>Status: <strong className="text-emerald-600 dark:text-emerald-400">{h.status || "Enrolled"}</strong></span>
                          </div>
                          {h.promotedTo && (
                            <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold pt-1 border-t border-slate-100 dark:border-slate-700">
                              ↗ Promoted to: {h.promotedTo.className} ({h.promotedTo.sessionName})
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-slate-400">
                    No multi-session promotion history recorded yet. Current active session is active.
                  </div>
                )}
              </div>

              {/* Prior Academic History Timeline */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Prior School Admission Records
                </h4>

                {student.academicHistory?.length > 0 ? (
                  <div className="space-y-3">
                    {student.academicHistory.map((entry, idx) => (
                      <div
                        key={idx}
                        className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs"
                      >
                        <div className="space-y-0.5">
                          <p className="font-extrabold text-slate-900 dark:text-white">
                            {entry.school || "Previous Institution"}
                          </p>
                          <p className="text-slate-500">
                            Class:{" "}
                            <span className="font-bold text-slate-700 dark:text-slate-300">
                              {entry.class}
                            </span>{" "}
                            · Year: {entry.year}
                          </p>
                        </div>
                        {entry.percentage && (
                          <span className="font-mono font-extrabold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                            {entry.percentage}%
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-slate-400">
                    <School
                      size={28}
                      className="mx-auto mb-2 text-slate-300 dark:text-slate-600"
                    />
                    <p>No prior school history recorded.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── 3. STUDENT ID CARD TAB (FINALIZED INSTITUTION FORMAT) ──── */}
          {activeTab === "id-card" && (
            <div className="space-y-6">
              {/* Header card with layout info and action buttons */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-orange-50/70 via-stone-50 to-amber-50/40 dark:from-stone-800/80 dark:via-stone-900 dark:to-orange-950/40 border border-orange-100 dark:border-orange-900/50 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3 min-w-0">
                  <div className="p-2.5 sm:p-3 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20 shrink-0">
                    <CreditCard size={20} className="sm:w-[22px] sm:h-[22px]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white leading-tight">
                        Student Identity Card
                      </h4>
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 whitespace-nowrap shrink-0">
                        <Star size={10} className="fill-emerald-500 shrink-0" />
                        <span>Finalized Layout</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                      Active layout:{" "}
                      <strong className="text-slate-700 dark:text-slate-200 font-semibold">
                        {defaultIdTemplate?.name || resolvedIdTemplate?.name || "Classic Student Card"}
                      </strong>{" "}
                      <span className="text-slate-400">({resolvedIdTemplate?.orientation || "portrait"})</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Toggle Dummy Data vs Real Student Data */}
                  <button
                    type="button"
                    onClick={() => setIdCardDummyMode((prev) => !prev)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      idCardDummyMode
                        ? "bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400"
                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                    }`}
                    title="Toggle between PDF dummy layout preview and real student data"
                  >
                    <FileText size={14} />
                    <span>{idCardDummyMode ? "Showing PDF Dummy Data" : "Showing Student Real Data"}</span>
                  </button>

                  {/* Admin link to customize or change the finalized layout */}
                  {canManage && (
                    <Link
                      to="/certificates?tab=id-cards"
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-50 dark:bg-orange-950/60 hover:bg-orange-100 dark:hover:bg-orange-900/60 text-orange-600 dark:text-orange-400 border border-orange-200/60 dark:border-orange-800/40 text-xs font-bold transition shadow-sm"
                    >
                      <Sparkles size={14} />
                      <span>Edit School Layout in Studio</span>
                    </Link>
                  )}
                </div>
              </div>

              {/* ID Card Display Card */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/80">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    <span>
                      {idCardDummyMode
                        ? "Previewing Finalized Format with Institutional Sample Data"
                        : `Live ID Card for ${student.name} (${student.admissionNumber || "STD"})`}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    Format: {defaultIdTemplate?.templateId || "student-id-classic"}
                  </span>
                </div>

                <div className="flex justify-center p-4 bg-slate-950/10 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800 min-h-[480px]">
                  <IdCardPreview
                    template={resolvedIdTemplate}
                    recipient={
                      idCardDummyMode
                        ? MOCK_STUDENT_DATA
                        : {
                            ...student,
                            id: student._id || student.id || student.admissionNumber,
                            admissionNumber: student.admissionNumber || "STD-2026-001",
                            name: student.name || `${student.firstName || ""} ${student.lastName || ""}`.trim(),
                            class: className || "Class 10",
                            section: sectionName || "A",
                            bloodGroup: student.bloodGroup || "O+",
                            dob: student.dob || "2010-01-01",
                            rollNumber: student.rollNumber || "01",
                            photo: photoUrl || "",
                            parentName: student.parentName || "",
                            contactNumber: student.contactNumber || student.phone || "",
                          }
                    }
                    recipientType="student"
                    schoolSettings={schoolBranding}
                    customConfig={defaultIdTemplate?.configuration || null}
                    title={`${student.name} — ID Card`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── 4. CERTIFICATES TAB (STUDENT ISSUED CREDENTIALS) ─────────── */}
          {activeTab === "certificates" && (
            <div className="space-y-6">
              {/* Header card with Issue Certificate button */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50/70 via-slate-50 to-orange-50/40 dark:from-slate-800/80 dark:via-slate-900 dark:to-amber-950/40 border border-amber-100 dark:border-amber-900/50 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/20">
                    <Award size={22} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
                        Institutional Certificates
                      </h4>
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 whitespace-nowrap shrink-0">
                        {studentCertificates.length} Issued
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Cryptographically verifiable institutional credentials issued to {student.name}.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={fetchStudentCertificates}
                    disabled={certsLoading}
                    className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
                    title="Refresh Certificates"
                  >
                    <RefreshCw size={15} className={certsLoading ? "animate-spin" : ""} />
                  </button>

                  {canManage && (
                    <button
                      type="button"
                      onClick={() => setIsCertIssueModalOpen(true)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 transition cursor-pointer"
                    >
                      <Plus size={15} strokeWidth={2.5} />
                      <span>Issue Certificate for this Student</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Certificates List & Live Preview Split */}
              {certsLoading ? (
                <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <RefreshCw size={18} className="animate-spin text-amber-500" />
                  <span>Loading issued certificate credentials...</span>
                </div>
              ) : studentCertificates.length === 0 ? (
                <div className="py-16 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <Award size={42} className="mx-auto text-amber-400/50" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                      No Certificates Issued Yet
                    </p>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Official credentials like Bonafide, Character, or Transfer certificates will appear here once issued.
                    </p>
                  </div>
                  {canManage && (
                    <button
                      type="button"
                      onClick={() => setIsCertIssueModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition cursor-pointer shadow-md"
                    >
                      <Plus size={14} />
                      <span>Issue First Certificate</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: List of Certificates */}
                  <div className="lg:col-span-5 space-y-3">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                      Issued Records ({studentCertificates.length})
                    </div>
                    {studentCertificates.map((cert) => {
                      const isSelected = activeCertPreview?._id === cert._id;
                      const isValid = cert.status === "VALID";

                      return (
                        <div
                          key={cert._id}
                          onClick={() => setActiveCertPreview(cert)}
                          className={`p-4 rounded-2xl border transition cursor-pointer space-y-2.5 ${
                            isSelected
                              ? "bg-amber-500/10 border-amber-500/50 shadow-md ring-1 ring-amber-500/30"
                              : "bg-white dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-extrabold text-amber-500">
                              {cert.certificateNumber}
                            </span>
                            <span
                              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                                isValid
                                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                                  : "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30"
                              }`}
                            >
                              {cert.status}
                            </span>
                          </div>

                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                              {cert.certificateType} Certificate
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              Session: {cert.academicSession || "2025-2026"} • Issued on{" "}
                              {new Date(cert.issuedAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                            {cert.purposeNote && (
                              <p className="text-[11px] text-slate-400 italic mt-1 line-clamp-1">
                                "{cert.purposeNote}"
                              </p>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700 text-xs">
                            <span className="text-[10px] text-slate-400 font-medium">
                              Issued by: {cert.issuedBy?.name || "School Authority"}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {cert.verificationToken && (
                                <a
                                  href={getVerificationUrl(cert.verificationToken)}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="p-1 rounded-lg text-slate-400 hover:text-orange-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                                  title="Public Verification QR Link"
                                >
                                  <ExternalLink size={13} />
                                </a>
                              )}
                              <span
                                className={`text-[11px] font-bold ${
                                  isSelected ? "text-amber-500" : "text-slate-400"
                                }`}
                              >
                                {isSelected ? "Viewing" : "Click to View"}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Right Column: Live Rendered Certificate */}
                  <div className="lg:col-span-7">
                    {activeCertPreview ? (
                      <div className="sticky top-6">
                        <CertificatePreview
                          template={getTemplateById(activeCertPreview.templateId || "certificate-classic")}
                          certificateData={activeCertPreview}
                          schoolSettings={schoolBranding}
                          title={`${activeCertPreview.certificateNumber} — ${activeCertPreview.certificateType}`}
                        />
                      </div>
                    ) : (
                      <div className="p-8 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                        Select a certificate from the left to view and print.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── 5. IDENTITY & DOCUMENTS TAB ─────────────────────────────── */}
          {activeTab === "documents" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Student Official Photograph */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
                        <User size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                          Student Photograph
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          Uploaded for ID cards and ERP records
                        </p>
                      </div>
                    </div>
                    {photoId && (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        ID: {photoId}
                      </span>
                    )}
                  </div>

                  {photoUrl ? (
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div
                        onClick={() => setPhotoModalOpen(true)}
                        className="w-32 h-32 rounded-xl overflow-hidden border-2 border-orange-500/30 shadow-md cursor-pointer group relative flex-shrink-0"
                      >
                        <img
                          src={photoUrl}
                          alt={student.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold">
                          <Eye size={16} />
                        </div>
                      </div>
                      <div className="space-y-2 flex-1 text-xs">
                        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                          <CheckCircle2 size={14} />
                          <span>Stored on Cloudinary CDN</span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                          Used dynamically across Vertical ID cards, Modern Amber
                          ID cards, and official certificates.
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => setPhotoModalOpen(true)}
                            className="px-3 py-1.5 rounded-lg bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/40 text-xs font-bold transition"
                          >
                            Enlarge View
                          </button>
                          <a
                            href={photoUrl}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition inline-flex items-center gap-1"
                          >
                            <Download size={12} />
                            <span>Download</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-10 text-center text-xs text-slate-400">
                      <User
                        size={36}
                        className="mx-auto mb-2 text-slate-300 dark:text-slate-600"
                      />
                      <p>No student photograph uploaded yet.</p>
                      <Link
                        to={`/students/${studentId}/edit`}
                        className="text-orange-600 dark:text-orange-400 font-bold hover:underline mt-1 inline-block"
                      >
                        Upload in Student Edit
                      </Link>
                    </div>
                  )}
                </div>

                {/* 2. Aadhaar Document (PDF) */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600">
                        <FileText size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                          UIDAI Aadhaar Document (PDF)
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          Government identity verification file
                        </p>
                      </div>
                    </div>
                    {aadhaarPdfId && (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        ID: {aadhaarPdfId}
                      </span>
                    )}
                  </div>

                  {aadhaarPdfUrl ? (
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-black">
                          <FileText size={22} />
                        </div>
                        <div className="min-w-0 flex-1 text-xs">
                          <p className="font-extrabold text-slate-900 dark:text-white truncate">
                            Student_Aadhaar_Verification.pdf
                          </p>
                          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                            <CheckCircle2 size={12} />
                            <span>Cloudinary PDF Asset</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setPdfModalOpen(true)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold transition shadow-sm shadow-orange-500/25 cursor-pointer"
                          >
                            <Eye size={13} />
                            <span>Preview</span>
                          </button>
                          <a
                            href={aadhaarPdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold transition shadow-sm"
                          >
                            <ExternalLink size={13} />
                            <span>Browser Tab</span>
                          </a>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">
                          Aadhaar: {formatAadhaar(student.aadhaarNumber)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-10 text-center text-xs text-slate-400">
                      <ShieldCheck
                        size={36}
                        className="mx-auto mb-2 text-slate-300 dark:text-slate-600"
                      />
                      <p>No Aadhaar PDF document uploaded.</p>
                      <Link
                        to={`/students/${studentId}/edit`}
                        className="text-orange-600 dark:text-orange-400 font-bold hover:underline mt-1 inline-block"
                      >
                        Upload in Student Edit
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Interactive Embedded PDF Document Viewer */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
                      <FileText size={16} />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                        Embedded Aadhaar Document Viewer
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Interactive PDF rendering directly inside the school
                        portal
                      </p>
                    </div>
                  </div>
                  {aadhaarPdfUrl && (
                    <button
                      type="button"
                      onClick={() => setPdfModalOpen(true)}
                      className="px-3 py-1.5 rounded-lg bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/40 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye size={13} />
                      <span>Full Window View</span>
                    </button>
                  )}
                </div>

                <EmbeddedPdfViewer
                  url={aadhaarPdfUrl}
                  title={`${student.name} — Aadhaar Identity Card (PDF)`}
                  subtitle={`UIDAI: ${formatAadhaar(student.aadhaarNumber)}`}
                  refId={aadhaarPdfId}
                  height="640px"
                />
              </div>
            </div>
          )}

          {/* ── 4. GUARDIAN / PARENT TAB ─────────────────────────────────── */}
          {activeTab === "parent" && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Primary Guardian Profile
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      Guardian Name
                    </span>
                    <p className="font-extrabold text-slate-900 dark:text-white text-sm">
                      {student.parentName || "—"}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      Contact Number
                    </span>
                    <p className="font-extrabold text-slate-900 dark:text-white text-sm">
                      {student.parentContact || "—"}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      Email Address
                    </span>
                    <p className="font-extrabold text-slate-900 dark:text-white text-sm">
                      {student.parentEmail || "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── 5. ATTENDANCE TAB ────────────────────────────────────────── */}
          {activeTab === "attendance" && (
            <div className="space-y-6">
              {/* Header & Controls */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-700/80">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold">
                      <CalendarCheck size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                        Student Attendance Records
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Filter by specific date, date range, or month &amp; year
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={fetchAttendance}
                      disabled={attendanceLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                      title="Refresh Attendance"
                    >
                      <RefreshCw size={13} className={attendanceLoading ? "animate-spin text-orange-500" : ""} />
                      <span>Refresh</span>
                    </button>
                    {(attendanceFilterType !== "all" || attStatusFilter !== "all") && (
                      <button
                        type="button"
                        onClick={handleResetAttendanceFilters}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-800/50 bg-rose-50/50 dark:bg-rose-950/30 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100/50 transition"
                      >
                        <RotateCcw size={13} />
                        <span>Reset Filters</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Filter Mode Selector */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                      Filter Mode:
                    </span>
                    {[
                      { id: "all", label: "All Sessions" },
                      { id: "date", label: "Specific Date" },
                      { id: "range", label: "Date Range" },
                      { id: "month_year", label: "Month & Year" },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setAttendanceFilterType(mode.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                          attendanceFilterType === mode.id
                            ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm shadow-orange-500/25"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>

                  {/* Filter Inputs Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                    {/* Specific Date */}
                    {attendanceFilterType === "date" && (
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                          Select Date
                        </label>
                        <input
                          type="date"
                          value={attSpecificDate}
                          onChange={(e) => setAttSpecificDate(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    )}

                    {/* Date Range */}
                    {attendanceFilterType === "range" && (
                      <>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                            Start Date
                          </label>
                          <input
                            type="date"
                            value={attStartDate}
                            onChange={(e) => setAttStartDate(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                            End Date
                          </label>
                          <input
                            type="date"
                            value={attEndDate}
                            onChange={(e) => setAttEndDate(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                      </>
                    )}

                    {/* Month & Year */}
                    {attendanceFilterType === "month_year" && (
                      <>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                            Month
                          </label>
                          <select
                            value={attMonth}
                            onChange={(e) => setAttMonth(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                          >
                            <option value="">All Months</option>
                            {MONTH_NAMES.map((m) => (
                              <option key={m.value} value={m.value}>
                                {m.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                            Year
                          </label>
                          <select
                            value={attYear}
                            onChange={(e) => setAttYear(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                          >
                            {YEAR_OPTIONS.map((y) => (
                              <option key={y} value={y.toString()}>
                                {y}
                              </option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}

                    {/* Status Filter */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                        Attendance Status
                      </label>
                      <select
                        value={attStatusFilter}
                        onChange={(e) => setAttStatusFilter(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="all">All Statuses</option>
                        <option value="present">Present Only</option>
                        <option value="absent">Absent Only</option>
                        <option value="late">Late Only</option>
                        <option value="half day">Half Day Only</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* KPI Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-4 rounded-2xl bg-orange-50/80 dark:bg-orange-950/30 border border-orange-200/80 dark:border-orange-800/40 text-center shadow-xs">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-orange-700 dark:text-orange-300">
                    Attendance Rate
                  </p>
                  <p className="text-2xl font-black text-orange-600 dark:text-orange-400 mt-1">
                    {attendanceData.summary?.percentage || "0%"}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-center shadow-xs">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Total Sessions
                  </p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {attendanceData.summary?.totalDays || 0}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/40 text-center shadow-xs">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                    Present Days
                  </p>
                  <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
                    {attendanceData.summary?.presentCount || 0}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-800/40 text-center shadow-xs">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300">
                    Absent Days
                  </p>
                  <p className="text-2xl font-black text-rose-700 dark:text-rose-400 mt-1">
                    {attendanceData.summary?.absentCount || 0}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40 text-center shadow-xs">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                    Late / Half Day
                  </p>
                  <p className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-1">
                    {(attendanceData.summary?.lateCount || 0) + (attendanceData.summary?.halfDayCount || 0)}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-purple-50/80 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/40 text-center shadow-xs">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                    Approved Leave
                  </p>
                  <p className="text-2xl font-black text-purple-700 dark:text-purple-400 mt-1">
                    {attendanceData.summary?.leaveCount || 0}
                  </p>
                </div>
              </div>

              {/* Records Table View */}
              {attendanceLoading ? (
                <div className="p-12 text-center">
                  <Loader size="md" text="Loading student attendance..." />
                </div>
              ) : attendanceData.logs.length === 0 ? (
                <div className="py-16 text-center text-xs text-slate-400 space-y-3 bg-white dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                  <CalendarCheck size={36} className="mx-auto text-slate-300 dark:text-slate-600" />
                  <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">
                    No Attendance Records Found
                  </p>
                  <p className="max-w-xs mx-auto text-slate-500">
                    No attendance logs match your selected filter criteria.
                  </p>
                  {(attendanceFilterType !== "all" || attStatusFilter !== "all") && (
                    <button
                      type="button"
                      onClick={handleResetAttendanceFilters}
                      className="px-4 py-2 rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400 font-bold text-xs hover:bg-orange-100 dark:hover:bg-orange-900/40 transition"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                  <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-600 dark:text-slate-400">
                      Showing {attendanceData.logs.length} session{attendanceData.logs.length === 1 ? "" : "s"}
                    </span>
                  </div>

                  <div className="overflow-x-auto text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 dark:bg-slate-800/60 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="py-3 px-4">Session Date</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4">Recorded / Taken At</th>
                          <th className="py-3 px-4">Class &amp; Section</th>
                          <th className="py-3 px-4">Remarks / Notes</th>
                          <th className="py-3 px-4">Marked By</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                        {attendanceData.logs.map((log, idx) => (
                          <tr
                            key={log.id || idx}
                            className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100">
                                <Calendar size={13} className="text-orange-500" />
                                <span>
                                  {log.date ? format(new Date(log.date), "dd MMM yyyy") : "—"}
                                </span>
                                <span className="text-[11px] font-normal text-slate-400">
                                  ({log.dayName || "School Day"})
                                </span>
                                {log.isPastDate && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                    Past Date
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2.5 py-1 rounded text-[10px] font-extrabold uppercase ${
                                  log.status === "Present"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                                    : log.status === "Absent"
                                      ? "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
                                      : log.status === "Half Day"
                                        ? "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                                        : "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                                }`}
                              >
                                {log.status}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                <Clock size={12} className="text-slate-400" />
                                <span>
                                  {log.attendanceTakenDate
                                    ? format(new Date(log.attendanceTakenDate), "dd MMM yyyy, hh:mm a")
                                    : "—"}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                              {log.classSection || classSection}
                            </td>
                            <td className="py-3 px-4 text-slate-500 dark:text-slate-400 italic">
                              {log.remarks && log.remarks !== "—" ? log.remarks : "No notes"}
                            </td>
                            <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-medium">
                              {log.markedBy || "Administration"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── 6. FEES TAB ──────────────────────────────────────────────── */}
          {activeTab === "fees" && (
            <div className="py-12 text-center text-xs text-slate-400 space-y-2">
              <DollarSign
                size={36}
                className="mx-auto text-slate-300 dark:text-slate-600"
              />
              <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">
                Fee &amp; Payment Ledger
              </p>
              <p>
                Invoices, receipts, and fee status will appear here once
                connected to fees.
              </p>
            </div>
          )}

          {/* ── 7. PERMISSIONS / SECURITY TAB ────────────────────────────── */}
          {activeTab === "permissions" && (
            <div className="space-y-4">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Student Account Access Control Matrix
              </h4>
              <PermissionMatrix
                options={permissionOptions}
                permissions={student.permissions || []}
                readOnly
              />
            </div>
          )}

          {/* ── 8. ACTIVITY TIMELINE TAB ─────────────────────────────────── */}
          {activeTab === "activity" && (
            <div className="space-y-4">
              {activity?.logs?.length > 0 ||
              activity?.loginHistory?.length > 0 ? (
                <ActivityTimeline
                  logs={activity.logs}
                  loginHistory={activity.loginHistory}
                />
              ) : (
                <div className="py-12 text-center text-xs text-slate-400 space-y-2">
                  <Activity
                    size={36}
                    className="mx-auto text-slate-300 dark:text-slate-600"
                  />
                  <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">
                    No Activity Logs
                  </p>
                  <p>
                    Account changes and login audit entries will be recorded
                    here.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── 9. LEAVE HISTORY TAB ─────────────────────────────────────── */}
          {activeTab === "leaves" && (
            <div className="space-y-6">
              {/* Active Leave Notification Banner */}
              {leaveData.activeLeave && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/15 via-indigo-500/10 to-amber-500/10 border border-purple-500/30 flex items-center justify-between gap-4 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-md">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-purple-700 dark:text-purple-300">
                        Currently On Approved Leave
                      </p>
                      <p className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
                        {leaveData.activeLeave.category} &bull; {leaveData.activeLeave.startDate} to {leaveData.activeLeave.endDate} ({leaveData.activeLeave.totalDays} day{leaveData.activeLeave.totalDays > 1 ? "s" : ""})
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-purple-600 text-white shadow-sm">
                    Active
                  </span>
                </div>
              )}

              {/* Header Card & Actions */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      Leave History &amp; Applications
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Complete verified leave applications, approval records, and institutional attendance sync.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={fetchStudentLeaves}
                    disabled={leaveLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                  >
                    <RefreshCw size={13} className={leaveLoading ? "animate-spin text-purple-600" : ""} />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Leave Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-center shadow-xs">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Total Applications
                  </p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {leaveData.summary?.totalApplications || 0}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/40 text-center shadow-xs">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                    Approved Leave Days
                  </p>
                  <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
                    {leaveData.summary?.approvedDays || 0}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40 text-center shadow-xs">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                    Pending Requests
                  </p>
                  <p className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-1">
                    {leaveData.summary?.pendingCount || 0}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-800/40 text-center shadow-xs">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300">
                    Rejected Requests
                  </p>
                  <p className="text-2xl font-black text-rose-700 dark:text-rose-400 mt-1">
                    {leaveData.summary?.rejectedCount || 0}
                  </p>
                </div>
              </div>

              {/* Leave Applications Table */}
              {leaveLoading ? (
                <div className="p-12 text-center">
                  <Loader size="md" text="Loading student leave records..." />
                </div>
              ) : (leaveData.requests || []).length === 0 ? (
                <div className="py-16 text-center text-xs text-slate-400 space-y-3 bg-white dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                  <Calendar size={36} className="mx-auto text-slate-300 dark:text-slate-600" />
                  <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">
                    No Leave Applications Recorded
                  </p>
                  <p className="max-w-xs mx-auto text-slate-500">
                    This student does not have any pending or historical leave applications on file.
                  </p>
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <tr>
                          <th className="py-3 px-4">Ref Code</th>
                          <th className="py-3 px-4">Category</th>
                          <th className="py-3 px-4">Duration &amp; Dates</th>
                          <th className="py-3 px-4">Reason</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4">Attendance Sync</th>
                          <th className="py-3 px-4">Reviewer Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                        {leaveData.requests.map((req) => (
                          <tr key={req._id || req.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                            <td className="py-3 px-4 font-mono font-bold text-purple-600 dark:text-purple-400">
                              {req.leaveCode || req._id?.slice(-6) || "—"}
                            </td>
                            <td className="py-3 px-4 font-extrabold text-slate-900 dark:text-white">
                              {req.category}
                              {req.isHalfDay && (
                                <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                                  Half Day ({req.halfDaySession || "1st"})
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <p className="font-semibold text-slate-700 dark:text-slate-200">
                                {req.startDate} {req.endDate && req.endDate !== req.startDate ? `to ${req.endDate}` : ""}
                              </p>
                              <p className="text-[10px] font-bold text-slate-400">
                                {req.totalDays} working day{req.totalDays > 1 ? "s" : ""}
                              </p>
                            </td>
                            <td className="py-3 px-4 max-w-[200px] truncate text-slate-600 dark:text-slate-300" title={req.reason}>
                              {req.reason || "—"}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                  req.status === "approved"
                                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                    : req.status === "pending"
                                    ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                    : req.status === "rejected"
                                    ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                                    : "bg-slate-500/10 text-slate-600 border-slate-500/20"
                                }`}
                              >
                                {req.status}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {req.status === "approved" ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                  <CheckCircle2 size={13} />
                                  <span>{req.attendanceSync?.isSynced ? "Synced to Roster" : "Pending Sync"}</span>
                                </span>
                              ) : (
                                <span className="text-[11px] text-slate-400">—</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                              {req.reviewRemarks ? (
                                <span>
                                  <strong className="text-slate-700 dark:text-slate-300">{req.reviewedBy?.name || "Admin"}:</strong> {req.reviewRemarks}
                                </span>
                              ) : (
                                "—"
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Photo Enlarge Modal ──────────────────────────────────────────── */}
      <Modal
        open={Boolean(photoModalOpen && photoUrl)}
        onClose={() => setPhotoModalOpen(false)}
        size="md"
        title={student.name}
        subtitle={`Admission No: ${student.admissionNumber}`}
      >
        <div className="space-y-3">
          <div className="w-full max-h-[70vh] rounded-xl overflow-hidden bg-black flex items-center justify-center">
            <img
              src={photoUrl}
              alt={student.name}
              className="max-w-full max-h-[65vh] object-contain"
            />
          </div>
          {photoId && (
            <p className="text-[11px] font-mono text-slate-400 text-center">
              Cloudinary Asset ID: {photoId}
            </p>
          )}
        </div>
      </Modal>

      {/* ── Super Admin DB Credentials Modal ─────────────────────────────── */}
      {activeCredentialsModal && (
        <Modal
          open={Boolean(activeCredentialsModal)}
          onClose={() => setActiveCredentialsModal(null)}
          title="Student DB Account Credentials"
        >
          <div className="space-y-4 text-xs font-sans">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  Student Name
                </p>
                <p className="text-sm font-extrabold text-white">
                  {activeCredentialsModal.name}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">
                    Login Username / Admission No.
                  </p>
                  <p className="text-sm font-mono font-bold text-orange-400">
                    {activeCredentialsModal.username}
                  </p>
                </div>
                <button
                  onClick={() =>
                    handleCopy(activeCredentialsModal.username, "Username")
                  }
                  className="flex items-center gap-1 text-[11px] font-semibold text-orange-400 hover:text-orange-300 bg-orange-500/10 border border-orange-500/20 px-2 py-1 rounded-md"
                >
                  {copiedField === "Username" ? (
                    <Check size={12} />
                  ) : (
                    <Copy size={12} />
                  )}
                  <span>{copiedField === "Username" ? "Copied" : "Copy"}</span>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">
                    Login Email Address
                  </p>
                  <p className="text-sm font-mono text-slate-200">
                    {activeCredentialsModal.email}
                  </p>
                </div>
                <button
                  onClick={() =>
                    handleCopy(activeCredentialsModal.email, "Email")
                  }
                  className="flex items-center gap-1 text-[11px] font-semibold text-orange-400 hover:text-orange-300 bg-orange-500/10 border border-orange-500/20 px-2 py-1 rounded-md"
                >
                  {copiedField === "Email" ? (
                    <Check size={12} />
                  ) : (
                    <Copy size={12} />
                  )}
                  <span>{copiedField === "Email" ? "Copied" : "Copy"}</span>
                </button>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] font-bold text-emerald-400 uppercase">
                    Actual Password from Database
                  </p>
                  <button
                    onClick={() => setShowPasswordText(!showPasswordText)}
                    className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-white"
                  >
                    {showPasswordText ? (
                      <EyeOff size={13} />
                    ) : (
                      <Eye size={13} />
                    )}
                    <span>{showPasswordText ? "Hide" : "Reveal"}</span>
                  </button>
                </div>

                <div className="text-sm font-mono font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-lg select-all flex items-center justify-between">
                  <span>
                    {showPasswordText
                      ? activeCredentialsModal.password
                      : `•••••••••••• (${activeCredentialsModal.password ? "Protected" : "Hidden"})`}
                  </span>
                  <button
                    onClick={() =>
                      handleCopy(activeCredentialsModal.password, "Password")
                    }
                    className="flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/20 px-2.5 py-1 rounded"
                  >
                    {copiedField === "Password" ? (
                      <Check size={13} />
                    ) : (
                      <Copy size={13} />
                    )}
                    <span>
                      {copiedField === "Password" ? "Copied!" : "Copy"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* PDF Viewer Full Screen Modal */}
      <PdfViewerModal
        open={pdfModalOpen}
        onClose={() => setPdfModalOpen(false)}
        url={aadhaarPdfUrl}
        title={`${student.name} — Aadhaar Document`}
        subtitle={`Aadhaar: ${formatAadhaar(student.aadhaarNumber)}`}
        refId={aadhaarPdfId}
      />

      {/* Issue Certificate Modal */}
      {isCertIssueModalOpen && (
        <IssueModal
          isOpen={isCertIssueModalOpen}
          onClose={() => setIsCertIssueModalOpen(false)}
          onSuccess={handleCertIssuedSuccess}
          initialRecipientType="student"
          initialRecipientId={student?._id || student?.id || studentId}
        />
      )}
    </div>
  );
};


export default StudentDetail;
