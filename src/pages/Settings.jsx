import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Save,
  Users,
  BookOpen,
  Package,
  Clock,
  Settings as SettingsIcon,
  DollarSign,
  Shield,
  GraduationCap,
  ArrowLeft,
  Megaphone,
  Globe,
  Search,
  Bell,
  Database,
  UserCheck,
  CheckCircle,
  Layers,
  Sparkles,
  Loader2,
  Calendar,
} from "lucide-react";
import api from "../services/api.js";
import SettingsCard from "./settings/SettingsCard";
import SchoolProfileSettings from "./settings/SchoolProfileSettings";
import TeacherSettings from "./settings/TeacherSettings";
import StudentSettings from "./settings/StudentSettings";
import InventorySettings from "./settings/InventorySettings";
import AcademicSettings from "./settings/AcademicSettings";
import FinanceSettings from "./settings/FinanceSettings";
import SecuritySettings from "./settings/SecuritySettings";
import NotificationSettings from "./settings/NotificationSettings";
import PolicySettings from "./settings/PolicySettings";
import BackupSettings from "./settings/BackupSettings";
import NoticeSettings from "./settings/NoticeSettings";
import MasterPeriodSettings from "./settings/MasterPeriodSettings";
import ClassTimetableSettings from "./settings/ClassTimetableSettings";
import SessionManagementSettings from "./settings/SessionManagementSettings";
import PortalManagementSettings from "./settings/PortalManagementSettings";
import ClassSyllabusSettings from "./settings/ClassSyllabusSettings";
import { useSchoolBranding } from "../context/SchoolBrandingContext.jsx";

const Settings = () => {
  const { updateBranding } = useSchoolBranding();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab");

  const [selectedTab, setSelectedTab] = useState(
    tabFromUrl === "class-syllabus" ? "syllabus" : tabFromUrl || null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("all");
  const [saving, setSaving] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);

  const [settings, setSettings] = useState({});

  useEffect(() => {
    if (tabFromUrl) {
      setSelectedTab(tabFromUrl === "class-syllabus" ? "syllabus" : tabFromUrl);
    }
  }, [tabFromUrl]);

  useEffect(() => {
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (selectedTab === "profile") {
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
      // Exclude heavy sub-documents and system metadata fields from general settings PUT
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
            res.data.settings.companyLogo || res.data.settings.schoolLogo || "",
          schoolMotto: res.data.settings.schoolMotto,
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleSelectTab = (tabId) => {
    setSelectedTab(tabId);
    if (tabId) {
      setSearchParams({ tab: tabId });
    } else {
      setSearchParams({});
    }
  };

  const settingsTabs = [
    // 1. School Settings (First)
    {
      id: "profile",
      category: "institution",
      label: "School Profile & Identity",
      icon: SettingsIcon,
      badge: "Primary",
      description:
        "Institutional identity, contact information, postal address, affiliation numbers, logos, and banners.",
      component: SchoolProfileSettings,
      selfManagedSave: false,
    },

    // 2. Master Period Timetable (Second)
    {
      id: "masterperiod",
      category: "academic",
      label: "Master Period & Timetable",
      icon: Clock,
      badge: "Daily Schedule",
      description:
        "Define daily period structure — Regular & Exam timetable schedules with period types and timings.",
      component: MasterPeriodSettings,
      selfManagedSave: true,
    },

    // 3. Class Timetable Builder (per class + section)
    {
      id: "classtimetable",
      category: "academic",
      label: "Class Timetable Builder",
      icon: Calendar,
      badge: "Per Class & Section",
      description:
        "Assign subjects and teachers to each class period slot for every class-section combination. Built on top of the Master Period structure.",
      component: ClassTimetableSettings,
      selfManagedSave: true,
    },

    // 4. Academic Sessions & Upgrades
    {
      id: "session",
      category: "academic",
      label: "Session & Student Upgrade",
      icon: GraduationCap,
      description:
        "Academic year session start/end dates, bulk whole-school class progression, and student promotion.",
      component: SessionManagementSettings,
      selfManagedSave: true,
    },

    // 4. Class Syllabus & Prescribed Books
    {
      id: "syllabus",
      category: "academic",
      label: "Class Syllabus & Books",
      badge: "Curriculum Core",
      icon: BookOpen,
      description:
        "Define class-wise curriculum, subjects, prescribed textbooks, full marks, and pass marks.",
      component: ClassSyllabusSettings,
      selfManagedSave: true,
    },

    // 5. Academic Grading & Passing Criteria
    {
      id: "academic",
      category: "academic",
      label: "Academic & Grading Rules",
      icon: GraduationCap,
      description:
        "Default passing percentage, GPA grading scale (4.0/10.0), and examination grade distribution analytics.",
      component: AcademicSettings,
      selfManagedSave: false,
    },

    // 6. Students & Admissions
    {
      id: "student",
      category: "operations",
      label: "Students & Admissions",
      icon: GraduationCap,
      description:
        "Automated student admission number series, prefix formatting, default portal passwords, and section capacity.",
      component: StudentSettings,
      selfManagedSave: false,
    },

    // 7. Faculty & Staff
    {
      id: "teacher",
      category: "operations",
      label: "Faculty & Staff",
      icon: Users,
      description:
        "Automated teacher employee ID series, prefix rules, and class staffing allocation limits.",
      component: TeacherSettings,
      selfManagedSave: false,
    },

    // 8. Finance & Fee Policies
    {
      id: "finance",
      category: "operations",
      label: "Finance & Fee Policies",
      icon: DollarSign,
      description:
        "Active currency symbol, tuition installment options, late payment fines, and automated invoice reminders.",
      component: FinanceSettings,
      selfManagedSave: false,
    },

    // 9. Public School Website Portal
    {
      id: "portal",
      category: "portal",
      label: "Public School Portal",
      icon: Globe,
      badge: "Public Website",
      description:
        "Standalone school website builder, hero banners, director/principal messages, facilities, and contact details.",
      component: PortalManagementSettings,
      selfManagedSave: true,
    },

    // 10. Notice Board & Bulletins
    {
      id: "notice",
      category: "portal",
      label: "Notice Board & Bulletins",
      icon: Megaphone,
      description:
        "Publish official school notices, news announcements, urgent circulars, and institutional bulletins.",
      component: NoticeSettings,
      selfManagedSave: true,
    },

    // 11. Staff, Attendance & HR Policies
    {
      id: "hr",
      category: "operations",
      label: "Staff & HR Policies",
      icon: UserCheck,
      description:
        "Staff timesheet cycles, overtime multipliers, minimum attendance requirement, and annual leave quotas.",
      component: PolicySettings,
      selfManagedSave: false,
    },

    // 12. Inventory Control
    {
      id: "inventory",
      category: "operations",
      label: "Inventory Control",
      icon: Package,
      description:
        "Stock movements tracking, low stock reorder alerts, threshold counts, and barcode scanning support.",
      component: InventorySettings,
      selfManagedSave: false,
    },

    // 13. Security & Access
    {
      id: "security",
      category: "system",
      label: "Security & Access",
      icon: Shield,
      description:
        "Data encryption at rest, audit trails, two-factor authentication (2FA), session timeout, and password expiry.",
      component: SecuritySettings,
      selfManagedSave: false,
    },

    // 14. Notifications & Alerts
    {
      id: "notifications",
      category: "system",
      label: "Notifications & Alerts",
      icon: Bell,
      description:
        "Multi-channel institutional messaging: SMTP email alerts, SMS gateway integration, and browser push notices.",
      component: NotificationSettings,
      selfManagedSave: false,
    },

    // 15. System Backup & Data
    {
      id: "backup",
      category: "system",
      label: "System Backup & Data",
      icon: Database,
      description:
        "Automated cloud database snapshots, backup frequency schedules, and disaster recovery configurations.",
      component: BackupSettings,
      selfManagedSave: false,
    },
  ];

  const categories = [
    { id: "all", label: "All Settings" },
    { id: "institution", label: "School Identity" },
    { id: "academic", label: "Academic & Schedules" },
    { id: "operations", label: "Operations & HR" },
    { id: "portal", label: "Portal & Notices" },
    { id: "system", label: "Security & System" },
  ];

  const filteredTabs = settingsTabs.filter((tab) => {
    // Category filter
    if (activeCategoryFilter !== "all" && tab.category !== activeCategoryFilter) {
      return false;
    }
    // Search query filter
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      tab.label.toLowerCase().includes(query) ||
      tab.description.toLowerCase().includes(query) ||
      (tab.badge && tab.badge.toLowerCase().includes(query)) ||
      tab.id.toLowerCase().includes(query)
    );
  });

  const selectedTabObj = settingsTabs.find((t) => t.id === selectedTab);
  const SelectedComponent = selectedTabObj?.component || null;

  return (
    <div className="space-y-6 pb-12">


      {!selectedTab ? (
        <>
          {/* Header & Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                System Settings
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
                Configure school profile, academic grading standards, curricula, fee policies, and security controls.
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
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>


          {/* Category Filter Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategoryFilter(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap border ${
                  activeCategoryFilter === cat.id
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/80 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Settings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTabs.map((tab) => (
              <SettingsCard
                key={tab.id}
                icon={tab.icon}
                title={tab.label}
                badge={tab.badge}
                description={tab.description}
                category={tab.category}
                onClick={() => handleSelectTab(tab.id)}
              />
            ))}
          </div>

          {filteredTabs.length === 0 && (
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
        </>
      ) : (
        <>
          {/* Subpage Breadcrumb Header */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => handleSelectTab(null)}
              className="flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-bold text-xs sm:text-sm transition"
            >
              <ArrowLeft size={16} /> Back to Settings Overview
            </button>
            {selectedTabObj && (
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <span className="capitalize">{selectedTabObj.category}</span>
                <span>&gt;</span>
                <span className="text-indigo-600 dark:text-indigo-400">
                  {selectedTabObj.label}
                </span>
              </span>
            )}
          </div>

          {/* Settings Detail Container */}
          {selectedTabObj?.selfManagedSave ? (
            <div className="w-full space-y-6">
              {SelectedComponent && (
                <SelectedComponent
                  settings={settings}
                  handleChange={handleChange}
                  onNavigateToSyllabus={() => handleSelectTab("syllabus")}
                />
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="space-y-6">
                {SelectedComponent && (
                  <SelectedComponent
                    settings={settings}
                    handleChange={handleChange}
                    onNavigateToSyllabus={() => handleSelectTab("syllabus")}
                  />
                )}

                {/* Bottom Save Bar for standard configuration modules */}
                <div className="flex justify-end pt-5 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={handleSubmit}
                    type="button"
                    disabled={saving}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-indigo-500/20 text-xs transition"
                  >
                    {saving ? (
                      <>
                        <Loader2 size={14} className="animate-spin" /> Saving Changes...
                      </>
                    ) : (
                      <>
                        <Save size={14} /> Save Configuration
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Settings;
