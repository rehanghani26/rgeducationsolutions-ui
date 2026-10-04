import { memo, useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  Outlet,
  useLocation,
  useNavigate,
  useSearchParams,
  useOutlet,
  useOutletContext,
} from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

import { checkVisibility } from "../utils";
import { AccessDeniedPage, Breadcrumb } from "../components";
import { useSchoolBranding } from "../context/SchoolBrandingContext.jsx";
import api from "../services/api.js";

import {
  SchoolProfileSettings,
  MasterPeriodSettings,
  ClassTimetableSettings,
  SessionManagementSettings,
  ClassSyllabusSettings,
  AcademicSettings,
  FinanceSettings,
  PortalManagementSettings,
  NoticeSettings,
  PolicySettings,
  InventorySettings,
  SecuritySettings,
  NotificationSettings,
  BackupSettings,
  AccessSettings,
  TimesheetSettings,
  SettingsOverview,
  ProfileSettings,
  PasswordSecuritySettings,
} from "./settings/pages";

import StudentProfileView from "./students/StudentProfileView.jsx";
import { getUserFromStorage } from "../config/access.jsx";

// Re-export all SVG icons following requested pattern
export * from "./settings/settingIcons";

const MyProfileSettingRoute = (props) => {
  const authUser = useSelector((state) => state.auth?.user);
  const userRole = (authUser?.role || getUserFromStorage()?.role || "").toLowerCase().replace(/_/g, '-');
  if (userRole === 'student') {
    return <StudentProfileView authUser={authUser} />;
  }
  return <ProfileSettings {...props} />;
};

/**
 * Higher-order component wrapping individual setting page components
 * to inject shared settings state, props, and standard bottom save action.
 */
const withSettingsWrapper = (
  Component,
  { selfManaged = false, title = "" } = {}
) => {
  const WrappedSettingPage = (props) => {
    const context = useOutletContext() || {};
    const navigate = useNavigate();
    const mergedProps = { ...context, ...props };
    const authUser = useSelector((state) => state.auth?.user);
    const userRole = (authUser?.role || "").toLowerCase().replace(/_/g, '-');
    const isStudent = userRole === 'student';

    return (
      <div className="space-y-6">
        {/* Subpage Header with Navigation Back to Overview */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => navigate("/settings")}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold text-xs sm:text-sm transition cursor-pointer"
          >
            <ArrowLeft size={16} /> Back to Settings Overview
          </button>
          {title && (
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
              {title}
            </span>
          )}
        </div>

        {/* Setting Page Component Body */}
        <Component
          {...mergedProps}
          onNavigateToSyllabus={() => navigate("/settings/syllabus")}
        />

        {/* Standardized Bottom Save Bar for Non-Self-Managed Forms (Hidden for students) */}
        {!selfManaged && !isStudent && (
          <div className="flex justify-end pt-5 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={mergedProps.handleSubmit}
              type="button"
              disabled={mergedProps.saving}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-indigo-500/20 text-xs transition cursor-pointer"
            >
              {mergedProps.saving ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Saving
                  Changes...
                </>
              ) : (
                <>
                  <Save size={14} /> Save Configuration
                </>
              )}
            </button>
          </div>
        )}
      </div>
    );
  };

  WrappedSettingPage.displayName = `SettingPage(${Component.displayName || Component.name || "Component"})`;
  return WrappedSettingPage;
};

/**
 * settingPageRoutes array matching requested architecture
 */
export const settingPageRoutes = [
  {
    path: "",
    index: true,
    Component: SettingsOverview,
    title: "Overview",
  },
  {
    path: "my-profile",
    Component: MyProfileSettingRoute,
    title: "My Profile",
  },
  {
    path: "password-security",
    Component: withSettingsWrapper(PasswordSecuritySettings, {
      selfManaged: true,
      title: "Password & Security",
    }),
    title: "Password & Security",
  },
  {
    path: "security-requests",
    Component: withSettingsWrapper(PasswordSecuritySettings, {
      selfManaged: true,
      title: "Password & Security",
    }),
    title: "Password & Security",
  },
  {
    path: "profile",
    Component: withSettingsWrapper(SchoolProfileSettings, {
      selfManaged: false,
      title: "School Profile & Identity",
    }),
    title: "School Profile & Identity",
  },
  {
    path: "school-profile",
    Component: withSettingsWrapper(SchoolProfileSettings, {
      selfManaged: false,
      title: "School Profile & Identity",
    }),
    title: "School Profile & Identity",
  },
  {
    path: "master-period",
    Component: withSettingsWrapper(MasterPeriodSettings, {
      selfManaged: true,
      title: "Master Period & Timetable",
    }),
    title: "Master Period & Timetable",
  },
  {
    path: "class-timetable",
    Component: withSettingsWrapper(ClassTimetableSettings, {
      selfManaged: true,
      title: "Class Timetable Builder",
    }),
    title: "Class Timetable Builder",
  },
  {
    path: "session",
    Component: withSettingsWrapper(SessionManagementSettings, {
      selfManaged: true,
      title: "Session & Student Upgrade",
    }),
    title: "Session & Student Upgrade",
  },
  {
    path: "syllabus",
    Component: withSettingsWrapper(ClassSyllabusSettings, {
      selfManaged: true,
      title: "Class Syllabus & Books",
    }),
    title: "Class Syllabus & Books",
  },
  {
    path: "academic",
    Component: withSettingsWrapper(AcademicSettings, {
      selfManaged: false,
      title: "Academic & Grading Rules",
    }),
    title: "Academic & Grading Rules",
  },

  {
    path: "finance",
    Component: withSettingsWrapper(FinanceSettings, {
      selfManaged: false,
      title: "Finance & Fee Policies",
    }),
    title: "Finance & Fee Policies",
  },
  {
    path: "portal",
    Component: withSettingsWrapper(PortalManagementSettings, {
      selfManaged: true,
      title: "Public School Portal",
    }),
    title: "Public School Portal",
  },
  {
    path: "notice",
    Component: withSettingsWrapper(NoticeSettings, {
      selfManaged: true,
      title: "Notice Board & Bulletins",
    }),
    title: "Notice Board & Bulletins",
  },
  {
    path: "policy",
    Component: withSettingsWrapper(PolicySettings, {
      selfManaged: false,
      title: "Staff & HR Policies",
    }),
    title: "Staff & HR Policies",
  },
  {
    path: "hr",
    Component: withSettingsWrapper(PolicySettings, {
      selfManaged: false,
      title: "Staff & HR Policies",
    }),
    title: "Staff & HR Policies",
  },
  {
    path: "inventory",
    Component: withSettingsWrapper(InventorySettings, {
      selfManaged: false,
      title: "Inventory Control",
    }),
    title: "Inventory Control",
  },
  {
    path: "security",
    Component: withSettingsWrapper(SecuritySettings, {
      selfManaged: false,
      title: "Security & Access",
    }),
    title: "Security & Access",
  },
  {
    path: "notifications",
    Component: withSettingsWrapper(NotificationSettings, {
      selfManaged: false,
      title: "Notifications & Alerts",
    }),
    title: "Notifications & Alerts",
  },
  {
    path: "backup",
    Component: withSettingsWrapper(BackupSettings, {
      selfManaged: false,
      title: "System Backup & Data",
    }),
    title: "System Backup & Data",
  },
  {
    path: "access",
    Component: withSettingsWrapper(AccessSettings, {
      selfManaged: false,
      title: "Access Control",
    }),
    title: "Access Control",
  },
  {
    path: "timesheet",
    Component: withSettingsWrapper(TimesheetSettings, {
      selfManaged: false,
      title: "Staff Timesheets",
    }),
    title: "Staff Timesheets",
  },
];

/**
 * Settings Main Layout Component
 */
const Settings = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const outlet = useOutlet();
  const { updateBranding } = useSchoolBranding();

  const pages = useSelector((state) => state.access?.pages);
  const settingsPage = pages?.SETTING_PAGE;
  const authUser = useSelector((state) => state.auth?.user);
  const userRole = (authUser?.role || "").toLowerCase().replace(/_/g, '-');
  const isStudent = userRole === 'student';

  const hasSettingsPermission = checkVisibility(
    "main",
    "View Setting",
    settingsPage
  ) || isStudent;
  const isMyProfileRoute = location.pathname
    .toLowerCase()
    .includes("/my-profile") || location.pathname.toLowerCase().includes("/password-security");
  const isPermittedUser = hasSettingsPermission || isMyProfileRoute || isStudent;

  // If a user lacks full settings permission, redirect them smoothly to their personal profile
  useEffect(() => {
    const normalizedPath = location.pathname.toLowerCase().replace(/\/+$/, "");
    if (!hasSettingsPermission && !isStudent && normalizedPath === "/settings") {
      navigate("/settings/my-profile", { replace: true });
    }
  }, [hasSettingsPermission, isStudent, location.pathname, navigate]);

  const [settings, setSettings] = useState({});
  const [saving, setSaving] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Backward compatibility: redirect query param ?tab=XYZ to sub-route /settings/XYZ
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl) {
      const targetPath =
        tabFromUrl === "class-syllabus" ? "syllabus" : tabFromUrl;
      navigate(`/settings/${targetPath}`, { replace: true });
    }
  }, [searchParams, navigate]);

  // Load initial settings and synchronize school branding
  const refreshSettings = useCallback(() => {
    setLoadingInitial(true);
    api
      .get("/erp/settings")
      .then((res) => {
        if (res.data?.settings) {
          setSettings((prev) => ({ ...prev, ...res.data.settings }));
          const s = res.data.settings;
          updateBranding({
            schoolName: s.schoolName,
            schoolLogo: s.companyLogo || s.schoolLogo || "",
            schoolMotto: s.schoolMotto,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoadingInitial(false));
  }, [updateBranding]);

  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  // Global change handler for input controls
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }, []);

  // Global submit handler for standard configuration subpages
  const handleSubmit = useCallback(
    async (e) => {
      if (e && e.preventDefault) e.preventDefault();

      const pathname = location.pathname.toLowerCase();
      if (
        pathname.includes("/profile") ||
        pathname.includes("/school-profile")
      ) {
        const missing = [];
        if (!settings.schoolName?.trim()) missing.push("School Name");
        if (!settings.contactEmail?.trim()) missing.push("Email Address");
        if (!settings.schoolPhone?.trim()) missing.push("Phone Number");
        if (!settings.addressLine1?.trim()) missing.push("Address Line 1");
        if (!settings.city?.trim()) missing.push("City");
        if (!settings.state?.trim()) missing.push("State/Province");
        if (!settings.country?.trim()) missing.push("Country");
        if (!settings.postalCode?.trim()) missing.push("Postal Code");

        if (missing.length > 0) {
          toast.error(
            `Please fill mandatory fields: ${missing.slice(0, 3).join(", ")}${
              missing.length > 3 ? ` (+${missing.length - 3} more)` : ""
            }`
          );
          return;
        }
      }

      setSaving(true);
      try {
        const {
          _id,
          __v,
          createdAt,
          updatedAt,
          portalSettings,
          defaultDocumentTemplates,
          ...cleanSettings
        } = settings;

        const res = await api.put("/erp/settings", cleanSettings);
        toast.success("Settings saved successfully!");

        if (res.data?.settings) {
          setSettings((prev) => ({ ...prev, ...res.data.settings }));
          updateBranding({
            schoolName: res.data.settings.schoolName,
            schoolLogo:
              res.data.settings.companyLogo ||
              res.data.settings.schoolLogo ||
              "",
            schoolMotto: res.data.settings.schoolMotto,
          });
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to save settings.");
      } finally {
        setSaving(false);
      }
    },
    [location.pathname, settings, updateBranding]
  );

  // Derive dynamic breadcrumbs based on active sub-route
  const breadcrumbData = useMemo(() => {
    const currentSubPath = location.pathname
      .replace(/^\/settings\/?/, "")
      .toLowerCase();
    if (!currentSubPath) {
      return ["Settings"];
    }

    const matchedRoute = settingPageRoutes.find(
      (r) => r.path && r.path.toLowerCase() === currentSubPath
    );

    const subTitle =
      matchedRoute?.title ||
      currentSubPath
        .split("-")
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(" ");

    return [{ label: "Settings", path: "/settings" }, subTitle];
  }, [location.pathname]);

  if (!isPermittedUser) {
    return <AccessDeniedPage />;
  }

  const outletContext = {
    settings,
    setSettings,
    handleChange,
    handleSubmit,
    saving,
    loadingInitial,
    refreshSettings,
  };

  return (
    <>
      <Breadcrumb data={breadcrumbData} />
      <div className="p-3 sm:p-4 min-h-full bg-[var(--surface-1)] border border-[var(--border-soft)] rounded-xl shadow-xs space-y-4">
        {outlet ? <Outlet context={outletContext} /> : <SettingsOverview />}
      </div>
    </>
  );
};

export default memo(Settings);
