import React, { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../store/slices/authSlice.js";
import { filterNavForUser, isNavActive } from "../config/navigation.js";
import ThemeToggle from "../components/ui/ThemeToggle.jsx";
import ErrorBoundary from "../components/ui/ErrorBoundary.jsx";
import { THEME_MODES, useTheme } from "../theme/ThemeContext.jsx";
import { bg, border, shadow, text, button, badge, input, COLOR } from "../theme/color.js";
import {
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Menu,
  LayoutDashboard,
  Megaphone,
  GraduationCap,
  Users,
  Wallet,
  Sparkles,
  Bell,
  Maximize2,
  Minimize2,
  Calendar,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";
import { ROUTES } from "../routes/routes.js";
import { ROLES, ADMIN_ROLES } from "../constants/roles.js";
import rgLogo from "../assets/logo/RGLOGO.png";
import { useSchoolBranding } from "../context/SchoolBrandingContext.jsx";
import api from "../services/api.js";
import MandatorySchoolProfileModal, {
  checkIsSchoolProfileIncomplete,
} from "../components/modals/MandatorySchoolProfileModal.jsx";
import SetupWizardModal from "../pages/setup/SetupWizardModal.jsx";
import useSetupWizard from "../hooks/useSetupWizard.js";

const HEADER_TABS = [
  { id: "home", label: "Home", icon: LayoutDashboard },
  { id: "notices", label: "Notice Board", icon: Megaphone },
  { id: "students", label: "Students", icon: GraduationCap },
  { id: "staff", label: "Teachers & Staff", icon: Users },
  { id: "finance", label: "Finance", icon: Wallet },
];

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeDashboardTab, setActiveDashboardTab] = useState("home");
  const [collapsedSections, setCollapsedSections] = useState({});
  const [settingsData, setSettingsData] = useState(null);
  const [showMandatoryModal, setShowMandatoryModal] = useState(false);
  const [wizardModalOpen, setWizardModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const { schoolLogo, schoolName, refreshBranding } = useSchoolBranding();

  const userRole = (user?.role || "").toLowerCase().replace(/_/g, "-");
  const canManageSettings =
    userRole === ROLES.SUPER_ADMIN ||
    userRole === "superadmin" ||
    userRole === ROLES.SCHOOL_ADMIN ||
    userRole === "admin" ||
    userRole === ROLES.PRINCIPAL;

  const wizard = useSetupWizard(canManageSettings);

  React.useEffect(() => {
    refreshBranding();
  }, [refreshBranding]);

  // Check mandatory school fields just after login
  React.useEffect(() => {
    if (!canManageSettings) return;

    let isMounted = true;
    api
      .get("/erp/settings")
      .then((res) => {
        if (!isMounted) return;
        const currentSettings = res.data?.settings || {};
        setSettingsData(currentSettings);
        if (checkIsSchoolProfileIncomplete(currentSettings)) {
          setShowMandatoryModal(true);
        } else {
          setShowMandatoryModal(false);
        }
      })
      .catch((err) => {
        console.error("Failed to check school settings:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [canManageSettings]);

  const handleProfileComplete = (savedSettings) => {
    setSettingsData(savedSettings);
    setShowMandatoryModal(false);
    refreshBranding();
  };

  const navSections = filterNavForUser(user);

  const handleLogout = () => {
    dispatch(logoutUser()).then(() => navigate("/login"));
  };

  const toggleSection = (sectionId) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const handleHeaderTabClick = (tabId) => {
    setActiveDashboardTab(tabId);
    if (location.pathname !== ROUTES.DASHBOARD) {
      navigate(ROUTES.DASHBOARD);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  const userInitials = (user?.name || user?.username || "RG")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const formattedRole = (user?.role || "Super Admin")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const canSeeHeaderTabs =
    user?.role &&
    user.role !== ROLES.STUDENT &&
    user.role !== ROLES.PARENT &&
    (ADMIN_ROLES.includes(user.role) || user.role === "superadmin");

  return (
    <div className={`flex h-screen overflow-hidden ${bg.page} font-sans ${text.primary}`}>
      {/* ── Left Sidebar ─────────────────────────────────────────────────── */}
      <aside
        className={`fixed z-30 flex h-full flex-col border-r ${border.default} ${bg.sidebar} ${text.secondary} transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        {/* Brand / Logo Header */}
        <div className={`flex h-16 items-center justify-between border-b ${border.default} px-4`}>
          <div className="flex items-center gap-3 overflow-hidden min-w-0">
            <div
              className={`flex-shrink-0 flex items-center justify-center rounded-xl overflow-hidden transition-all duration-300 ${
                sidebarOpen ? "h-10 w-10" : "h-9 w-9"
              } ${bg.active} p-1 border ${border.brand}`}
            >
              <img
                src={schoolLogo || rgLogo}
                alt={schoolName || "Iqra Public School"}
                style={
                  !schoolLogo && theme === THEME_MODES.DARK
                    ? { mixBlendMode: "screen" }
                    : undefined
                }
                className="h-full w-full object-contain"
                onError={(e) => {
                  if (e.currentTarget.src !== rgLogo) {
                    e.currentTarget.src = rgLogo;
                  }
                }}
              />
            </div>
            {sidebarOpen && (
              <div className="flex flex-col min-w-0">
                <span
                  className="truncate text-sm font-extrabold tracking-tight text-stone-900 dark:text-stone-100"
                  title={schoolName || "Iqra Public School"}
                >
                  {schoolName || "Iqra Public School"}
                </span>
                <span className="text-[10px] font-semibold text-stone-400 dark:text-stone-500 truncate">
                  Campus Management
                </span>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-900 dark:hover:bg-stone-800 dark:hover:text-stone-100"
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarOpen ? (
              <ChevronLeft size={18} />
            ) : (
              <ChevronRight size={18} />
            )}
          </button>
        </div>

        {/* Navigation items list */}
        <nav className="flex-1 space-y-3 overflow-y-auto px-3 py-3 scrollbar-none">
          {navSections.map((section) => (
            <div key={section.id} className="space-y-1">
              {sidebarOpen && (
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className="flex w-full items-center justify-between px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-stone-400 hover:text-stone-700 dark:text-stone-500 dark:hover:text-stone-300"
                >
                  <span>{section.label}</span>
                  <ChevronDown
                    size={11}
                    className={`transition-transform duration-200 ${
                      collapsedSections[section.id] ? "-rotate-90" : ""
                    }`}
                  />
                </button>
              )}
              {(!collapsedSections[section.id] || !sidebarOpen) && (
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const active = isNavActive(location.pathname, item.path);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-150 ${
                          active
                            ? `${bg.brandGradient} text-white shadow-md ${shadow.brand} font-bold`
                            : `${text.secondary} ${bg.hover} hover:${text.primary}`
                        }`}
                      >
                        <Icon
                          size={16}
                          className={`flex-shrink-0 transition-colors ${
                            active
                              ? "text-white"
                              : `${text.brand} group-hover:${text.brand}`
                          }`}
                        />
                        {sidebarOpen && (
                          <span className="truncate">{item.name}</span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer: Academic Year Pill & Logout */}
        <div className="border-t border-[#EFE8DD] p-2.5 space-y-2 dark:border-[#2E2C2A]">
          {sidebarOpen && (
            <div className="flex items-center justify-between rounded-xl bg-orange-500/10 p-2.5 border border-orange-500/20 text-stone-800 dark:text-stone-200">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-orange-500 text-white shadow-xs">
                  <GraduationCap size={15} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-orange-700 dark:text-orange-300">
                    Academic Year
                  </span>
                  <span className="text-xs font-bold truncate">2026 - 2027</span>
                </div>
              </div>
              <ChevronRightIcon size={14} className="text-orange-400 flex-shrink-0" />
            </div>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-stone-500 transition-colors hover:bg-rose-500/10 hover:text-rose-600 dark:text-stone-400 dark:hover:text-rose-400"
          >
            <LogOut size={16} className="flex-shrink-0" />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* ── Main Container (Header + Content) ────────────────────────────── */}
      <div
        className={`flex h-screen min-w-0 min-h-0 flex-1 flex-col overflow-hidden transition-all duration-300 ${
          sidebarOpen ? "pl-64" : "pl-20"
        }`}
      >
        {/* Top Header */}
        <header className={`sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-3 border-b ${border.default} ${bg.header} px-3 sm:px-5`}>
          {/* Left: Sidebar toggle + Global Search bar */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`rounded-lg ${button.ghost} shrink-0`}
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              <Menu size={18} />
            </button>


            {/* Header Tabs if on dashboard */}
            {canSeeHeaderTabs && (
              <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
                {HEADER_TABS.map((tab) => {
                  const isActive =
                    location.pathname === ROUTES.DASHBOARD &&
                    activeDashboardTab === tab.id;
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => handleHeaderTabClick(tab.id)}
                      className={`flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-bold transition-all duration-150 ${
                        isActive
                          ? `${bg.brandGradient} text-white shadow-xs`
                          : `border ${border.default} ${bg.input} ${text.secondary} hover:border-orange-300 hover:${bg.card} hover:${text.primary}`
                      }`}
                    >
                      <Icon size={14} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* AI Mode Button (Warm gradient) */}
            <button
              type="button"
              onClick={() => navigate(ROUTES.AI_MODE)}
              className="group relative flex items-center gap-1.5 sm:gap-2 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 p-[1px] shadow-sm shadow-orange-500/20 transition-all duration-300 hover:scale-105 active:scale-95 flex-shrink-0"
              title="Open Full-Page AI Mode"
            >
              <div className="flex items-center gap-1.5 sm:gap-2 rounded-[11px] bg-white px-2.5 sm:px-3 py-1.5 transition-colors dark:bg-[#1C1B1A]">
                <Sparkles className="h-3.5 w-3.5 text-orange-500 transition-transform group-hover:rotate-12 animate-pulse dark:text-orange-400 flex-shrink-0" />
                <span className="text-[11px] sm:text-xs font-extrabold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent dark:from-orange-400 dark:to-amber-300">
                  AI Mode
                </span>
              </div>
            </button>

            {/* Notification Bell with Badge */}
            <button
              type="button"
              className={`relative rounded-xl p-2 ${button.ghost}`}
              title="Notifications"
            >
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white shadow-xs">
                3
              </span>
            </button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className={`rounded-xl p-2 ${button.ghost} hidden sm:inline-flex`}
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
            </button>

            {/* User Profile Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className={`flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl ${bg.hover} transition-colors`}
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-full ${bg.brandGradient} text-white font-black text-xs shadow-xs`}>
                  {userInitials}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className={`text-xs font-bold ${text.primary} leading-tight`}>
                    {user?.name || user?.username || "Rehan Ghani"}
                  </span>
                  <span className={`text-[10px] font-semibold ${text.muted} leading-none mt-0.5`}>
                    {formattedRole}
                  </span>
                </div>
                <ChevronDown size={14} className={`${text.muted} ml-0.5`} />
              </button>

              {userDropdownOpen && (
                <div className={`absolute right-0 mt-2 w-48 rounded-2xl ${bg.card} p-1.5 shadow-xl border ${border.default} z-50`}>
                  <div className={`px-3 py-2 border-b ${border.default}`}>
                    <p className={`text-xs font-bold ${text.primary} truncate`}>
                      {user?.name || user?.username || "Rehan Ghani"}
                    </p>
                    <p className={`text-[10px] ${text.muted} truncate`}>
                      {user?.email || "admin@school.com"}
                    </p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setUserDropdownOpen(false)}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ${text.secondary} ${bg.hover} hover:${text.primary}`}
                  >
                    Profile Settings
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      handleLogout();
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                  >
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Viewport */}
        <main className="flex-1 min-h-0 overflow-y-auto bg-[#FAF7F2] p-3 sm:p-5 md:p-6 text-stone-900 dark:bg-[#121214] dark:text-[#FAF7F2]">
          <ErrorBoundary compact>
            <Outlet context={{ activeDashboardTab, setActiveDashboardTab }} />
          </ErrorBoundary>
        </main>
      </div>

      {/* ── Initial ERP Setup Wizard Modal ── */}
      <SetupWizardModal
        isOpen={wizardModalOpen}
        onClose={() => setWizardModalOpen(false)}
        onComplete={() => {
          setWizardModalOpen(false);
          wizard.refreshStatus();
        }}
      />

      {/* ── Mandatory School Profile Modal (Shown immediately after login if mandatory details are missing) ── */}
      {showMandatoryModal && (
        <MandatorySchoolProfileModal
          isOpen={showMandatoryModal}
          initialSettings={settingsData || {}}
          onComplete={handleProfileComplete}
        />
      )}
    </div>
  );
};

export default DashboardLayout;
