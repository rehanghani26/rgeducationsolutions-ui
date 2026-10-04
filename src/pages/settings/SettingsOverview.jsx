import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Search, User, KeyRound, Camera, ChevronRight } from "lucide-react";
import api from "../../services/api.js";
import { updateUserProfile } from "../../store/slices/authSlice.js";
import { getUserFromStorage } from "../../config/access.jsx";
import { getStudents, getStudentById } from "../../services/studentService.js";
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
    path: "my-profile",
    category: "account",
    label: "My Profile & Credentials",
    icon: () => profileSVG,
    badge: "Personal",
    description:
      "View your user profile details, employee identification, update profile picture, and change or reset password.",
  },
  {
    path: "password-security",
    category: "account",
    label: "My Password & Security",
    icon: () => securitySVG,
    badge: "Security",
    description:
      "Send password change requests to the Super Admin, write notes, track approval status, and inspect security history.",
  },
  {
    path: "profile",
    category: "institution",
    label: "School Profile & Identity",
    icon: () => schoolSVG,
    badge: "Primary",
    description:
      "Institutional identity, contact information, postal address, affiliation numbers, logos, and banners.",
  },
  {
    path: "master-period",
    category: "academic",
    label: "Master Period & Timetable",
    icon: () => periodSVG,
    badge: "Daily Schedule",
    description:
      "Define daily period structure — Regular & Exam timetable schedules with period types and timings.",
  },
  {
    path: "class-timetable",
    category: "academic",
    label: "Class Timetable Builder",
    icon: () => timetableSVG,
    badge: "Per Class & Section",
    description:
      "Assign subjects and teachers to each class period slot for every class-section combination.",
  },
  {
    path: "session",
    category: "academic",
    label: "Session & Student Upgrade",
    icon: () => sessionSVG,
    description:
      "Academic year session start/end dates, bulk whole-school class progression, and student promotion.",
  },
  {
    path: "syllabus",
    category: "academic",
    label: "Class Syllabus & Books",
    badge: "Curriculum Core",
    icon: () => syllabusSVG,
    description:
      "Define class-wise curriculum, subjects, prescribed textbooks, full marks, and pass marks.",
  },
  {
    path: "academic",
    category: "academic",
    label: "Academic & Grading Rules",
    icon: () => academicSVG,
    description:
      "Default passing percentage, GPA grading scale (4.0/10.0), and examination grade distribution analytics.",
  },

  {
    path: "teacher",
    category: "operations",
    label: "Faculty & Staff",
    icon: () => teacherSVG,
    description:
      "Automated teacher employee ID series, prefix rules, and class staffing allocation limits.",
  },
  {
    path: "finance",
    category: "operations",
    label: "Finance & Fee Policies",
    icon: () => financeSVG,
    description:
      "Active currency symbol, tuition installment options, late payment fines, and automated invoice reminders.",
  },
  {
    path: "portal",
    category: "portal",
    label: "Public School Portal",
    icon: () => portalSVG,
    badge: "Public Website",
    description:
      "Standalone school website builder, hero banners, director/principal messages, facilities, and contact details.",
  },
  {
    path: "notice",
    category: "portal",
    label: "Notice Board & Bulletins",
    icon: () => noticeSVG,
    description:
      "Publish official school notices, news announcements, urgent circulars, and institutional bulletins.",
  },
  {
    path: "policy",
    category: "operations",
    label: "Staff & HR Policies",
    icon: () => policySVG,
    description:
      "Staff timesheet cycles, overtime multipliers, minimum attendance requirement, and annual leave quotas.",
  },
  {
    path: "inventory",
    category: "operations",
    label: "Inventory Control",
    icon: () => inventorySVG,
    description:
      "Stock movements tracking, low stock reorder alerts, threshold counts, and barcode scanning support.",
  },
  {
    path: "security",
    category: "system",
    label: "Security & Access",
    icon: () => securitySVG,
    description:
      "Data encryption at rest, audit trails, two-factor authentication (2FA), session timeout, and password expiry.",
  },
  {
    path: "notifications",
    category: "system",
    label: "Notifications & Alerts",
    icon: () => notificationSVG,
    description:
      "Multi-channel institutional messaging: SMTP email alerts, SMS gateway integration, and browser push notices.",
  },
  {
    path: "backup",
    category: "system",
    label: "System Backup & Data",
    icon: () => backupSVG,
    description:
      "Automated cloud database snapshots, backup frequency schedules, and disaster recovery configurations.",
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
      item.path.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-4">
      {/* My Profile Quick-Access Banner (Always visible to all users) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 p-4 sm:p-5 text-white shadow-md border border-indigo-800/40">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {userPhoto && !photoError ? (
              <img
                key={userPhoto}
                src={resolveImageUrl(userPhoto)}
                alt={authUser?.name || "User"}
                className="size-12 sm:size-14 rounded-2xl object-cover ring-2 ring-indigo-400/50 shadow-md"
                onError={() => setPhotoError(true)}
              />
            ) : (
              <div className="size-12 sm:size-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-lg font-black text-white ring-2 ring-indigo-400/30 shadow-md">
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
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  {authUser?.role || "Staff"}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 truncate max-w-xs sm:max-w-md">
                {authUser?.email ||
                  "Manage your personal profile, credentials and picture"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/settings/my-profile")}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-sm transition cursor-pointer"
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
            placeholder="Search settings (e.g. syllabus, fees, 2FA)..."
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 shadow-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap border ${
              activeCategoryFilter === cat.id
                ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/80 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

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

          return (
            <SettingsCard
              key={item.path}
              icon={item.icon}
              title={label}
              badge={badge}
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
    </div>
  );
};

export default SettingsOverview;
