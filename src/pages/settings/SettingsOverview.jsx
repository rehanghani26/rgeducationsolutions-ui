import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Search, User, KeyRound, Camera, ChevronRight, CheckCircle2, ArrowRight, Clock, Sparkles, Bot, ShieldCheck } from "lucide-react";
import api from "../../services/api.js";
import { updateUserProfile } from "../../store/slices/authSlice.js";
import { getUserFromStorage } from "../../config/access.jsx";
import { getStudents, getStudentById } from "../../services/studentService.js";
import useSetupWizard from "../../hooks/useSetupWizard.js";
import SetupWizardModal from "../setup/SetupWizardModal.jsx";
import SettingsCard from "./SettingsCard";
import {
  schoolSVG,
  periodSVG,
  timetableSVG,
  sessionSVG,
  syllabusSVG,
  academicSVG,
  studentSVG,
  teacherSVG,
  financeSVG,
  portalSVG,
  noticeSVG,
  policySVG,
  inventorySVG,
  securitySVG,
  notificationSVG,
  backupSVG,
  profileSVG,
} from "./settingIcons";

// Helper to resolve absolute or relative image URLs
const resolveImageUrl = (url) => {
  if (!url || typeof url !== "string") return "";
  const clean = url.trim().replace(/\\/g, "/");
  if (!clean) return "";

  if (
    clean.startsWith("http://") ||
    clean.startsWith("https://") ||
    clean.startsWith("data:") ||
    clean.startsWith("blob:")
  ) {
    return clean;
  }

  if (clean.startsWith("/uploads/") || clean.startsWith("uploads/")) {
    const norm = clean.startsWith("/") ? clean : `/${clean}`;
    return `http://localhost:5000${norm}`;
  }

  // S3 key or file ID redirect through backend stream/presign endpoint
  return `http://localhost:5000/api/v1/students/file/${clean}?redirect=true`;
};

export const SETTINGS_ITEMS = [
  {
    path: "profile",
    priority: 1,
    category: "institution",
    label: "School Profile & Identity",
    icon: () => schoolSVG,
    badge: "Core Setup",
    description:
      "Institutional identity, contact information, postal address, affiliation numbers, logos, and banners.",
  },
  {
    path: "session",
    priority: 2,
    category: "academic",
    label: "Academic Session & Calendar",
    icon: () => sessionSVG,
    stepBadge: "Core Setup",
    stepNum: 1,
    description:
      "Set academic year start/end dates, activate the current session, and run bulk whole-school class promotions.",
  },
  {
    path: "master-period",
    priority: 3,
    category: "academic",
    label: "Master Period & Bell Schedule",
    icon: () => periodSVG,
    stepBadge: "Period Slots",
    stepNum: 2,
    description:
      "Define daily period structure — school timings, bell intervals, Regular & Exam timetable slots inherited by all classes.",
  },
  {
    path: "class-timetable",
    priority: 4,
    category: "academic",
    label: "Class Timetable Builder",
    icon: () => timetableSVG,
    stepBadge: "Timetable",
    stepNum: 3,
    description:
      "Assign subjects and teachers to each class period slot per class-section — with real-time teacher conflict detection.",
  },
  {
    path: "academic",
    priority: 5,
    category: "academic",
    label: "Academic & Grading Rules",
    icon: () => academicSVG,
    badge: "Grading Scale",
    description:
      "Default passing percentage, GPA grading scale (4.0/10.0), and examination grade distribution analytics.",
  },
  {
    path: "finance",
    priority: 6,
    category: "operations",
    label: "Finance & Fee Policies",
    icon: () => financeSVG,
    badge: "Fee Engine",
    description:
      "Active currency symbol, tuition installment options, late payment fines, and automated invoice reminders.",
  },
  {
    path: "teacher",
    priority: 7,
    category: "operations",
    label: "Faculty & Staff",
    icon: () => teacherSVG,
    description:
      "Automated teacher employee ID series, prefix rules, and class staffing allocation limits.",
  },
  {
    path: "syllabus",
    priority: 8,
    category: "academic",
    label: "Class Syllabus & Books",
    badge: "Curriculum Core",
    icon: () => syllabusSVG,
    description:
      "Define class-wise curriculum, subjects, prescribed textbooks, full marks, and pass marks.",
  },
  {
    path: "policy",
    priority: 9,
    category: "operations",
    label: "Staff & HR Policies",
    icon: () => policySVG,
    description:
      "Staff timesheet cycles, overtime multipliers, minimum attendance requirement, and annual leave quotas.",
  },
  {
    path: "inventory",
    priority: 10,
    category: "operations",
    label: "Inventory Control",
    icon: () => inventorySVG,
    description:
      "Stock movements tracking, low stock reorder alerts, threshold counts, and barcode scanning support.",
  },
  {
    path: "portal",
    priority: 11,
    category: "portal",
    label: "Public School Portal",
    icon: () => portalSVG,
    badge: "Public Website",
    description:
      "Standalone school website builder, hero banners, director/principal messages, facilities, and contact details.",
  },
  {
    path: "notice",
    priority: 12,
    category: "portal",
    label: "Notice Board & Bulletins",
    icon: () => noticeSVG,
    description:
      "Publish official school notices, news announcements, urgent circulars, and institutional bulletins.",
  },
  {
    path: "security",
    priority: 13,
    category: "system",
    label: "Security & Access",
    icon: () => securitySVG,
    description:
      "Data encryption at rest, audit trails, two-factor authentication (2FA), session timeout, and password expiry.",
  },
  {
    path: "notifications",
    priority: 14,
    category: "system",
    label: "Notifications & Alerts",
    icon: () => notificationSVG,
    description:
      "Multi-channel institutional messaging: SMTP email alerts, SMS gateway integration, and browser push notices.",
  },
  {
    path: "backup",
    priority: 15,
    category: "system",
    label: "System Backup & Data",
    icon: () => backupSVG,
    description:
      "Automated cloud database snapshots, backup frequency schedules, and disaster recovery configurations.",
  },
  {
    path: "my-profile",
    priority: 16,
    category: "account",
    label: "My Profile & Credentials",
    icon: () => profileSVG,
    badge: "Personal",
    description:
      "View your user profile details, employee identification, update profile picture, and change or reset password.",
  },
  {
    path: "password-security",
    priority: 17,
    category: "account",
    label: "My Password & Security",
    icon: () => securitySVG,
    badge: "Security",
    description:
      "Send password change requests to the Super Admin, write notes, track approval status, and inspect security history.",
  },
];

export const CATEGORIES = [
  { id: "all", label: "All Settings" },
  { id: "account", label: "My Account" },
  { id: "institution", label: "School Identity" },
  { id: "academic", label: "Academic & Schedules" },
  { id: "operations", label: "Operations & HR" },
  { id: "portal", label: "Portal & Notices" },
  { id: "system", label: "Security & System" },
];

const SettingsOverview = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user: authUser } = useSelector((state) => state.auth);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("all");
  const userRole = (authUser?.role || getUserFromStorage()?.role || "").toLowerCase().replace(/_/g, '-');
  const isStudent = userRole === 'student';
  const wizard = useSetupWizard(!isStudent);
  const [wizardModalOpen, setWizardModalOpen] = useState(false);
  const [wizardModalMode, setWizardModalMode] = useState('manual');

  // ── Academic Setup live state (for the progress banner) ──
  const [activeSession, setActiveSession] = useState(null);
  const [setupLoading, setSetupLoading] = useState(true);

  useEffect(() => {
    const fetchSetupState = async () => {
      try {
        // Try the fast /active endpoint first, fall back to full list
        const res = await api.get('/sessions/active').catch(() => null)
          || await api.get('/sessions').catch(() => null);
        const session = res?.data?.session
          || (res?.data?.sessions || []).find((s) => s.isCurrent)
          || (res?.data?.sessions || [])[0]
          || null;
        setActiveSession(session);
      } catch (_) {
        // non-critical — banner is cosmetic
      } finally {
        setSetupLoading(false);
      }
    };
    if (!isStudent) fetchSetupState();
    else setSetupLoading(false);
  }, [isStudent]);

  // Derive step completion from active session metadata
  const step1Done = !!activeSession;
  const step2Done = !!activeSession?.hasMasterSchedule;
  const step3Done = (activeSession?.timetableCount || 0) > 0;

  const userFromStorage = getUserFromStorage();
  const initialPhoto =
    authUser?.photo ||
    authUser?.avatar ||
    authUser?.imagesRef?.img ||
    authUser?.photoUrl ||
    userFromStorage?.photo ||
    userFromStorage?.avatar ||
    userFromStorage?.imagesRef?.img ||
    "";

  const [userPhoto, setUserPhoto] = useState(initialPhoto);
  const [photoError, setPhotoError] = useState(false);

  useEffect(() => {
    const current =
      authUser?.photo ||
      authUser?.avatar ||
      authUser?.imagesRef?.img ||
      "";
    if (current) {
      setUserPhoto(current);
      setPhotoError(false);
    }
  }, [authUser?.photo, authUser?.avatar, authUser?.imagesRef?.img]);

  useEffect(() => {
    let active = true;
    const fetchFreshPhoto = async () => {
      try {
        let resolved = "";

        // 1. Fetch by profile me / userId (works for all roles including student)
        try {
          const res = await api.get(`/profile/${authUser?._id || authUser?.id || "me"}`);
          const p = res.data?.profile;
          resolved = p?.avatar || p?.photo || p?.imagesRef?.img || "";
        } catch (e) {}

        // 2. If student and has profileId, fetch student by id
        const targetProfileId = authUser?.profileId || userFromStorage?.profileId;
        if (!resolved && isStudent && targetProfileId) {
          try {
            const sRes = await getStudentById(targetProfileId);
            const std = sRes?.student || sRes?.data || sRes;
            resolved = std?.photo || std?.imagesRef?.img || std?.avatar || (std?.imagesRef?.id ? std.imagesRef.id : "");
          } catch (e) {}
        }

        // 3. Fallback: getStudents (scoped to student by backend)
        if (!resolved && isStudent) {
          try {
            const sRes = await getStudents({ limit: 10 });
            const list = Array.isArray(sRes?.students) && sRes.students.length > 0
              ? sRes.students
              : (Array.isArray(sRes?.data) ? sRes.data : []);
            
            const matched = list.find((s) =>
              (s.email && authUser?.email && s.email.toLowerCase() === authUser.email.toLowerCase()) ||
              (s.admissionNumber && authUser?.admissionNumber && s.admissionNumber === authUser.admissionNumber)
            ) || list[0];

            if (matched) {
              resolved = matched.photo || matched.imagesRef?.img || matched.avatar || (matched.imagesRef?.id ? matched.imagesRef.id : "");
            }
          } catch (e) {}
        }

        if (resolved && active) {
          setUserPhoto(resolved);
          setPhotoError(false);
          dispatch(updateUserProfile({ avatar: resolved, photo: resolved }));
          try {
            const stored = JSON.parse(localStorage.getItem('user') || '{}');
            localStorage.setItem('user', JSON.stringify({ ...stored, avatar: resolved, photo: resolved }));
          } catch (_) {}
        }
      } catch (e) {
        console.warn("Could not fetch fresh user photo:", e);
      }
    };

    fetchFreshPhoto();
    return () => { active = false; };
  }, [authUser?._id, authUser?.profileId, authUser?.email, isStudent]);

  const studentAllowedPaths = ["profile", "password-security", "my-profile"];

  const filteredItems = SETTINGS_ITEMS.filter((item) => {
    if (isStudent && !studentAllowedPaths.includes(item.path)) {
      return false;
    }
    if (
      activeCategoryFilter !== "all" &&
      item.category !== activeCategoryFilter
    ) {
      return false;
    }
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.label.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      (item.badge && item.badge.toLowerCase().includes(query)) ||
      (item.stepBadge && item.stepBadge.toLowerCase().includes(query)) ||
      `priority ${item.priority}`.includes(query) ||
      `p${item.priority}`.includes(query) ||
      item.path.toLowerCase().includes(query)
    );
  }).sort((a, b) => (a.priority || 99) - (b.priority || 99));

  // Determine stepDone per item from live session and wizard state
  const profileDone = wizard.steps.find((s) => s.key === 'schoolProfile')?.complete;
  const academicRulesDone = wizard.steps.find((s) => s.key === 'academicRules')?.complete;
  const financePoliciesDone = wizard.steps.find((s) => s.key === 'financePolicies')?.complete;

  const getStepDone = (item) => {
    if (item.path === 'profile') return profileDone;
    if (item.path === 'session') return step1Done;
    if (item.path === 'master-period') return step2Done;
    if (item.path === 'class-timetable') return step3Done;
    if (item.path === 'academic') return academicRulesDone;
    if (item.path === 'finance') return financePoliciesDone;
    return false;
  };

  // Determine next incomplete step for CTA
  const nextStep = !step1Done
    ? { label: 'Set up Academic Session', path: '/settings/session', num: 1 }
    : !step2Done
    ? { label: 'Configure Master Bell Schedule', path: '/settings/master-period', num: 2 }
    : !step3Done
    ? { label: 'Build Class Timetables', path: '/settings/class-timetable', num: 3 }
    : null;

  // Show academic banner when academic category is visible
  const showAcademicBanner =
    !isStudent &&
    !setupLoading &&
    (activeCategoryFilter === 'all' || activeCategoryFilter === 'academic') &&
    !searchQuery.trim();

  return (
    <div className="space-y-4">
      {/* My Profile Quick-Access Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#181716] via-[#2A180C] to-[#1F140A] p-4 sm:p-5 text-white shadow-md border border-orange-500/20">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {userPhoto && !photoError ? (
              <img
                key={userPhoto}
                src={resolveImageUrl(userPhoto)}
                alt={authUser?.name || "User"}
                className="size-12 sm:size-14 rounded-2xl object-cover ring-2 ring-orange-400/50 shadow-md"
                onError={() => setPhotoError(true)}
              />
            ) : (
              <div className="size-12 sm:size-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-lg font-black text-white ring-2 ring-orange-400/30 shadow-md">
                {(authUser?.name || authUser?.username || "U")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                  {authUser?.name || authUser?.username || "User Account"}
                </h3>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-300 border border-orange-400/30">
                  {authUser?.role || "Staff"}
                </span>
              </div>
              <p className="text-xs text-stone-300 mt-0.5 truncate max-w-xs sm:max-w-md">
                {authUser?.email ||
                  "Manage your personal profile, credentials and picture"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/settings/my-profile")}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-sm shadow-orange-500/25 transition cursor-pointer"
            >
              <User size={13} />
              <span>My Profile</span>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            System Settings
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
            Configure school profile, academic grading standards, curricula, fee
            policies, and security controls.
          </p>
        </div>

        {/* Quick Search */}
        <div className="relative min-w-[280px]">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search settings (e.g. syllabus, fees, 2FA, Priority 3)..."
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 shadow-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Category Filter Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategoryFilter(cat.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap border cursor-pointer ${
              activeCategoryFilter === cat.id
                ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white border-transparent shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/80 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 2-Step Foundational Initial Setup & Priority Hub */}
      {!isStudent && !searchQuery.trim() && (
        <div className="rounded-2xl border border-indigo-200/80 dark:border-indigo-800/60 bg-gradient-to-r from-indigo-50/90 via-purple-50/50 to-slate-50 dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-slate-900 p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-indigo-600 text-white shadow-xs">
                  Initial Setup Wizard
                </span>
                <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
                  2 Core Steps • Priority Settings Indexed Below
                </span>
              </div>
              <p className="text-sm font-black text-slate-900 dark:text-white">
                Configure School Profile (P1) & Academic Year (P2) via the wizard, or manage all Priority 1–6 settings below.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setWizardModalMode('ai');
                  setWizardModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition cursor-pointer"
              >
                <Bot size={14} />
                <span>✨ AI Setup Mode</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setWizardModalMode('manual');
                  setWizardModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
              >
                <Sparkles size={14} />
                <span>2-Step Wizard</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>

          {/* Priority setup quick-access pills */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-6 gap-2">
            {[
              { num: 1, key: 'profile', label: '1. School Profile', path: '/settings/profile' },
              { num: 2, key: 'session', label: '2. Academic Year', path: '/settings/session' },
              { num: 3, key: 'master-period', label: '3. Bell Schedule', path: '/settings/master-period' },
              { num: 4, key: 'class-timetable', label: '4. Timetables', path: '/settings/class-timetable' },
              { num: 5, key: 'academic', label: '5. Academic Rules', path: '/settings/academic' },
              { num: 6, key: 'finance', label: '6. Fee Policies', path: '/settings/finance' },
            ].map((s) => {
              const isDone =
                s.key === 'profile'
                  ? profileDone
                  : s.key === 'session'
                  ? step1Done
                  : s.key === 'master-period'
                  ? step2Done
                  : s.key === 'class-timetable'
                  ? step3Done
                  : s.key === 'academic'
                  ? academicRulesDone
                  : financePoliciesDone;

              return (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => navigate(s.path)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isDone
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 hover:border-emerald-400'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                    isDone ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}>
                    {isDone ? '✓' : `P${s.num}`}
                  </div>
                  <span className={`text-[11px] font-bold truncate ${
                    isDone ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-700 dark:text-slate-300'
                  }`}>
                    {s.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => {
          let label = item.label;
          let description = item.description;
          let badge = item.badge;

          if (!isStudent && item.path === "password-security") {
            label = "Password Requests & Security";
            description =
              "Review, approve or reject student password change requests, execute direct password resets, and maintain permanent audit records.";
            badge = "Authority";
          }

          const stepDone = getStepDone(item);

          return (
            <SettingsCard
              key={item.path}
              icon={item.icon}
              title={label}
              badge={badge}
              stepBadge={item.stepBadge}
              stepDone={stepDone}
              priority={item.priority}
              description={description}
              category={item.category}
              onClick={() => navigate(`/settings/${item.path}`)}
            />
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <p className="font-semibold text-sm text-slate-500 dark:text-slate-400">
            No settings found matching &quot;{searchQuery}&quot;
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setActiveCategoryFilter("all");
            }}
            className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
          >
            Reset search & filters
          </button>
        </div>
      )}

      {/* ── Initial ERP Setup Wizard Modal ── */}
      <SetupWizardModal
        isOpen={wizardModalOpen}
        initialMode={wizardModalMode}
        onClose={() => setWizardModalOpen(false)}
        onComplete={() => {
          setWizardModalOpen(false);
          wizard.refreshStatus();
        }}
      />
    </div>
  );
};

export default SettingsOverview;
