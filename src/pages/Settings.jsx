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
import { ArrowLeft, Save, Loader2, ChevronRight } from "lucide-react";

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
import SetupWizardPage from "./setup/SetupWizardPage.jsx";

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
        {/* Unified Subpage Header & Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-slate-200/70 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigate("/settings")}
              className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/90 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition shadow-2xs cursor-pointer border border-slate-200/60 dark:border-slate-700/60"
              title="Return to Settings Overview"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Settings</span>
            </button>

            <span className="text-slate-300 dark:text-slate-700 select-none">/</span>

            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => navigate("/settings")}
                className="text-slate-500 dark:text-slate-400 hover:text-orange-500 dark:hover:text-orange-400 font-semibold transition cursor-pointer"
              >
                Settings
              </button>
              <ChevronRight size={12} className="text-slate-300 dark:text-slate-600 shrink-0" />
              <span className="font-extrabold text-slate-900 dark:text-white truncate">
                {title}
              </span>
            </nav>
          </div>
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
              className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-60 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-orange-500/25 text-xs transition cursor-pointer"
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
    path: "wizard",
    Component: SetupWizardPage,
    title: "Initial Setup Wizard",
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
    path: "session",
    Component: withSettingsWrapper(SessionManagementSettings, {
      selfManaged: true,
      title: "Academic Session & Calendar",
    }),
    title: "Academic Session & Calendar",
  },
  {
    path: "master-period",
    Component: withSettingsWrapper(MasterPeriodSettings, {
      selfManaged: true,
      title: "Master Period & Bell Schedule",
    }),
    title: "Master Period & Bell Schedule",
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
    <div className="p-3 sm:p-4 min-h-full bg-[var(--surface-1)] border border-[var(--border-soft)] rounded-xl shadow-xs space-y-4">
      {outlet ? <Outlet context={outletContext} /> : <SettingsOverview />}
    </div>
  );
};

export default memo(Settings);
