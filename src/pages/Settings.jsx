import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import {
  Save,
  Users,
  BookOpen,
  Package,
  Clock,
  FileText,
  Lock,
  Settings as SettingsIcon,
  DollarSign,
  Bell,
  Shield,
  Database,
  GraduationCap,
  ArrowLeft,
  Megaphone,
  Globe,
} from "lucide-react";
import api from "../services/api.js";
import SettingsCard from "./settings/SettingsCard";
import SchoolProfileSettings from "./settings/SchoolProfileSettings";
import TeacherSettings from "./settings/TeacherSettings";
import StudentSettings from "./settings/StudentSettings";
import InventorySettings from "./settings/InventorySettings";
import TimesheetSettings from "./settings/TimesheetSettings";
import PolicySettings from "./settings/PolicySettings";
import AccessSettings from "./settings/AccessSettings";
import AcademicSettings from "./settings/AcademicSettings";
import FinanceSettings from "./settings/FinanceSettings";
import NotificationSettings from "./settings/NotificationSettings";
import SecuritySettings from "./settings/SecuritySettings";
import BackupSettings from "./settings/BackupSettings";
import NoticeSettings from "./settings/NoticeSettings";
import MasterPeriodSettings from "./settings/MasterPeriodSettings";
import SessionManagementSettings from "./settings/SessionManagementSettings";
import PortalManagementSettings from "./settings/PortalManagementSettings";
import { useSchoolBranding } from "../context/SchoolBrandingContext.jsx";

const Settings = () => {
  const { updateBranding } = useSchoolBranding();
  const [selectedTab, setSelectedTab] = useState(null);
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

  const settingsTabs = [
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
      id: "masterperiod",
      label: "Master Period",
      icon: Clock,
      description: "Define daily period structure — Regular & Exam schedules with period types",
      component: MasterPeriodSettings,
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
      id: "academic",
      label: "Academic",
      icon: BookOpen,
      description: "Grade settings, passing percentage, and grade distribution tracking",
      component: AcademicSettings,
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

  const SelectedComponent = selectedTab
    ? settingsTabs.find((t) => t.id === selectedTab)?.component
    : null;

  return (
    <div className="space-y-6 pb-12">
      <ToastContainer position="top-right" theme="colored" />

      {!selectedTab ? (
        <>
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">System Settings</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Manage all ERP configurations, permissions, notices, and preferences.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {settingsTabs.map((tab) => (
              <SettingsCard
                key={tab.id}
                icon={tab.icon}
                title={tab.label}
                description={tab.description}
                onClick={() => setSelectedTab(tab.id)}
              />
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedTab(null)}
              className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-semibold text-sm"
            >
              <ArrowLeft size={18} /> Back to Settings
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="space-y-6">
              <SelectedComponent settings={settings} handleChange={handleChange} />
              {selectedTab !== "notice" && selectedTab !== "masterperiod" && selectedTab !== "session" && selectedTab !== "portal" && (
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
