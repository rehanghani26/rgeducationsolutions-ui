import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
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
  Sparkles,
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
import NoticeSettings from "./settings/NoticeSettings";
import MasterPeriodSettings from "./settings/MasterPeriodSettings";
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

  const [settings, setSettings] = useState({
    schoolName: "",
    schoolCode: "",
    registrationNumber: "",
    affiliationNumber: "",
    schoolType: "",
    establishedYear: "",
    academicYear: "",
    contactEmail: "",
    schoolPhone: "",
    alternatePhone: "",
    websiteUrl: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    companyLogo: "",
    schoolLogo: "",
    currencySymbol: "$",
    autoGenerateTeacherID: true,
    teacherIDPrefix: "T",
    autoGenerateAdmissionNumber: true,
    admissionNumberPrefix: "STU",
  });

  useEffect(() => {
    if (tabFromUrl) {
      setSelectedTab(tabFromUrl === "class-syllabus" ? "syllabus" : tabFromUrl);
    }
  }, [tabFromUrl]);

  useEffect(() => {
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
      .catch(() => {});
  }, [updateBranding]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    api
      .put("/erp/settings", settings)
      .then(() => {
        toast.success("Settings saved successfully!");
        updateBranding({
          schoolName: settings.schoolName,
          schoolLogo: settings.companyLogo || settings.schoolLogo || "",
          schoolMotto: settings.schoolMotto,
        });
      })
      .catch((err) =>
        toast.error(err.response?.data?.message || "Failed to save settings.")
      );
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
    {
      id: "syllabus",
      label: "Class Syllabus",
      badge: "Curriculum & Books",
      icon: BookOpen,
      description:
        "Prescribed textbooks (e.g. Our English, Math Magic), subjects, full marks, and pass marks for all grades",
      component: ClassSyllabusSettings,
    },
    {
      id: "academic",
      label: "Academic Settings",
      icon: GraduationCap,
      description: "Passing criteria, grading scale, GPA, and grade distribution tracking",
      component: AcademicSettings,
    },
    {
      id: "masterperiod",
      label: "Master Period",
      icon: Clock,
      description: "Define daily period structure — Regular & Exam schedules with period types",
      component: MasterPeriodSettings,
    },
    {
      id: "portal",
      label: "Portal Management",
      icon: Globe,
      description: "Manage standalone public school website, hero banner, facilities, and contact details",
      component: PortalManagementSettings,
    },
    {
      id: "session",
      label: "Session Management & Student Upgrade",
      icon: GraduationCap,
      description: "Set session start & end dates, bulk upgrade whole school, promote/demote students",
      component: SessionManagementSettings,
    },
    {
      id: "notice",
      label: "Notice Board",
      icon: Megaphone,
      description: "Publish school notices, announcements, and bulletins",
      component: NoticeSettings,
    },
    {
      id: "profile",
      label: "School Profile",
      icon: SettingsIcon,
      description: "Configure school identity, contact details, and logos",
      component: SchoolProfileSettings,
    },
    {
      id: "teacher",
      label: "Add Teacher",
      icon: Users,
      description: "Manage teacher settings, ID generation, and class assignments",
      component: TeacherSettings,
    },
    {
      id: "student",
      label: "Add Student",
      icon: GraduationCap,
      description: "Configure student settings, admission numbers, and enrollment limits",
      component: StudentSettings,
    },
    {
      id: "inventory",
      label: "Add Inventory",
      icon: Package,
      description: "Inventory tracking, stock alerts, and barcode management",
      component: InventorySettings,
    },
    {
      id: "finance",
      label: "Finance",
      icon: DollarSign,
      description: "Currency settings, fee collection frequency, and tax rules",
      component: FinanceSettings,
    },
    {
      id: "security",
      label: "Security",
      icon: Shield,
      description: "Data encryption and audit logging for security compliance",
      component: SecuritySettings,
    },
  ];

  const filteredTabs = settingsTabs.filter((tab) => {
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
      <ToastContainer position="top-right" theme="colored" />

      {/* Top Category Navigation Pills (Always visible for quick switching) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => handleSelectTab(null)}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
            !selectedTab
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <SettingsIcon size={14} /> All Settings
        </button>

        <button
          type="button"
          onClick={() => handleSelectTab("syllabus")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
            selectedTab === "syllabus"
              ? "bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-300 dark:ring-indigo-800"
              : "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 border border-indigo-200/80 dark:border-indigo-800/80"
          }`}
        >
          <BookOpen size={14} className="text-indigo-600 dark:text-indigo-400" />
          Class Syllabus & Books
          <span className="px-1.5 py-0.2 text-[9px] font-black uppercase rounded-full bg-amber-400 text-slate-950">
            Core
          </span>
        </button>

        {settingsTabs
          .filter((t) => t.id !== "syllabus")
          .map((tab) => {
            const Icon = tab.icon;
            const isActive = selectedTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSelectTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
      </div>

      {!selectedTab ? (
        <>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                System Settings
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Manage all school configurations, curriculum syllabuses, permissions, and preferences.
              </p>
            </div>

            {/* Quick Search */}
            <div className="relative min-w-[260px]">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search settings (e.g. syllabus, books)..."
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Featured Highlight Banner: Class Syllabus */}
          <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-2xl p-5 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-indigo-700/50">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-amber-300 shrink-0 border border-white/20 shadow-inner">
                <BookOpen size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-400 text-indigo-950 px-2 py-0.5 rounded-full shadow-sm">
                    Featured Curriculum Tool
                  </span>
                  <h3 className="font-extrabold text-base text-white">
                    Class Syllabus & Prescribed Textbooks
                  </h3>
                </div>
                <p className="text-xs text-indigo-200 mt-0.5 max-w-2xl">
                  Configure grade-wise textbooks (e.g. <em>Our English</em>, <em>Math Magic</em>), subjects, full marks & passing marks. Auto-fills during exam scheduling & result entry.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleSelectTab("syllabus")}
              className="px-4 py-2.5 bg-white text-indigo-900 hover:bg-indigo-50 font-extrabold text-xs rounded-xl shadow transition shrink-0 flex items-center justify-center gap-1.5 self-start sm:self-auto"
            >
              Open Class Syllabus &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTabs.map((tab) => (
              <SettingsCard
                key={tab.id}
                icon={tab.icon}
                title={tab.label}
                badge={tab.badge}
                description={tab.description}
                onClick={() => handleSelectTab(tab.id)}
              />
            ))}
          </div>

          {filteredTabs.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <p className="font-semibold text-sm">No settings found matching &quot;{searchQuery}&quot;</p>
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="mt-2 text-xs text-indigo-600 font-bold hover:underline"
              >
                Clear search
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => handleSelectTab(null)}
              className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-semibold text-sm transition"
            >
              <ArrowLeft size={18} /> Back to Overview
            </button>
            {selectedTabObj && (
              <span className="text-xs font-bold text-slate-400">
                Settings &gt; {selectedTabObj.label}
              </span>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="space-y-6">
              <SelectedComponent settings={settings} handleChange={handleChange} />
              {selectedTab !== "notice" &&
                selectedTab !== "masterperiod" &&
                selectedTab !== "session" &&
                selectedTab !== "portal" &&
                selectedTab !== "syllabus" && (
                  <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={handleSubmit}
                      type="button"
                      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg text-xs"
                    >
                      <Save size={14} /> Save Changes
                    </button>
                  </div>
                )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Settings;
