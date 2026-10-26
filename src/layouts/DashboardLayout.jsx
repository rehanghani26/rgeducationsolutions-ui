import React, { useState, useEffect, useRef } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../store/slices/authSlice.js";
import { filterNavForUser, isNavActive } from "../config/navigation.js";
import ThemeToggle from "../components/ui/ThemeToggle.jsx";
import ErrorBoundary from "../components/ui/ErrorBoundary.jsx";
import { THEME_MODES, useTheme } from "../theme/ThemeContext.jsx";
import {
  bg,
  border,
  shadow,
  text,
  button,
  badge,
  input,
  COLOR,
} from "../theme/color.js";
import {
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
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
  Settings,
  User,
  MoreHorizontal,
  Check,
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
  { id: "home", label: "Home", shortLabel: "Home", icon: LayoutDashboard },
  {
    id: "notices",
    label: "Notice Board",
    shortLabel: "Notices",
    icon: Megaphone,
  },
  {
    id: "students",
    label: "Students",
    shortLabel: "Students",
    icon: GraduationCap,
  },
  { id: "staff", label: "Teachers & Staff", shortLabel: "Staff", icon: Users },
  { id: "finance", label: "Finance", shortLabel: "Finance", icon: Wallet },
];

const resolveUserImageUrl = (userObj) => {
  const raw =
    userObj?.avatar ||
    userObj?.photo ||
    userObj?.profileImage ||
    userObj?.imagesRef?.img ||
    userObj?.image ||
    "";
  if (!raw || typeof raw !== "string") return "";
  const trimmed = raw.trim();
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:")
  ) {
    return trimmed;
  }
};

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [activeDashboardTab, setActiveDashboardTab] = useState("home");
  const [collapsedSections, setCollapsedSections] = useState({});
  const [settingsData, setSettingsData] = useState(null);
  const [showMandatoryModal, setShowMandatoryModal] = useState(false);
  const [wizardModalOpen, setWizardModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [moreTabsOpen, setMoreTabsOpen] = useState(false);
  const [avatarImgError, setAvatarImgError] = useState(false);

  const dropdownRef = useRef(null);
  const moreTabsRef = useRef(null);

  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const { schoolLogo, schoolName, refreshBranding } = useSchoolBranding();

  const userAvatarUrl = resolveUserImageUrl(user);

  useEffect(() => {
    setAvatarImgError(false);
  }, [userAvatarUrl]);

  // Close mobile drawer and menus on route change
  useEffect(() => {
    setMobileDrawerOpen(false);
    setUserDropdownOpen(false);
    setMoreTabsOpen(false);
  }, [location.pathname]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
      if (moreTabsRef.current && !moreTabsRef.current.contains(e.target)) {
        setMoreTabsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

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

  const userInitials = (() => {
    const name =
      user?.name ||
      user?.fullName ||
      user?.username ||
      (user?.email ? user.email.split("@")[0] : "") ||
      "RG";
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    if (parts.length === 1 && parts[0].length >= 2) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return (parts[0] || "U").toUpperCase();
  })();

  const formattedRole = (user?.role || "Super Admin")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const canSeeHeaderTabs =
    user?.role &&
    user.role !== ROLES.STUDENT &&
    user.role !== ROLES.PARENT &&
    (ADMIN_ROLES.includes(user.role) || user.role === "superadmin");

  return (
    <div
      className={`flex h-screen overflow-hidden ${bg.page} font-sans ${text.primary}`}
    >
      {/* ── Mobile Drawer Backdrop (always in DOM, CSS controls visibility) ── */}
      <div
        aria-hidden="true"
        className={`md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          mobileDrawerOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileDrawerOpen(false)}
      />

      {/* ── Mobile Drawer Panel (always in DOM, slides in/out via CSS) ──────── */}
      <aside
        aria-label="Mobile navigation"
        className={`md:hidden fixed left-0 top-0 z-50 flex h-full w-72 flex-col border-r ${
          border.default
        } ${bg.sidebar} ${text.secondary} transition-transform duration-300 ease-in-out ${
          mobileDrawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer Brand / Logo Header */}
        <div
          className={`flex h-16 items-center justify-between border-b ${border.default} px-4`}
        >
          <div className="flex items-center gap-3 overflow-hidden min-w-0">
            <div
              className={`flex-shrink-0 flex items-center justify-center rounded-xl overflow-hidden h-10 w-10 ${bg.active} p-1 border ${border.brand}`}
            >
              <img
                src={schoolLogo || rgLogo}
                alt={schoolName || "RGES School"}
                style={
                  !schoolLogo && theme === THEME_MODES.DARK
                    ? { mixBlendMode: "screen" }
                    : undefined
                }
                className="h-full w-full object-contain"
                onError={(e) => {
                  if (e.currentTarget.src !== rgLogo)
                    e.currentTarget.src = rgLogo;
                }}
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span
                className="truncate text-sm font-extrabold tracking-tight text-stone-900 dark:text-stone-100"
                title={schoolName || "RGES School"}
              >
                {schoolName || "RGES School"}
              </span>
              <span className="text-[10px] font-semibold text-stone-400 dark:text-stone-500 truncate">
                Campus Management
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(false)}
            className="rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-900 dark:hover:bg-stone-800 dark:hover:text-stone-100"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Navigation */}
        <nav className="flex-1 space-y-3 overflow-y-auto px-3 py-3 scrollbar-none">
          {navSections.map((section) => (
            <div key={section.id} className="space-y-1">
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                className="flex w-full items-center justify-between px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-stone-400 hover:text-stone-700 dark:text-stone-500 dark:hover:text-stone-300"
              >
                <span>{section.label}</span>
                <ChevronDown
                  size={11}
                  className={`transition-transform duration-200 ${collapsedSections[section.id] ? "-rotate-90" : ""}`}
                />
              </button>
              {!collapsedSections[section.id] && (
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const active = isNavActive(location.pathname, item.path);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileDrawerOpen(false)}
                        className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-150 ${
                          active
                            ? `${bg.brandGradient} text-white shadow-md ${shadow.brand} font-bold`
                            : `${text.secondary} ${bg.hover} hover:${text.primary}`
                        }`}
                      >
                        <Icon
                          size={16}
                          className={`flex-shrink-0 transition-colors ${active ? "text-white" : `${text.brand} group-hover:${text.brand}`}`}
                        />
                        <span className="truncate">{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Drawer Footer */}
        <div className="border-t border-[#EFE8DD] p-2.5 space-y-2 dark:border-[#2E2C2A]">
          {/* User Quick Info in Mobile Drawer */}
          <div className="flex items-center gap-2.5 rounded-xl bg-stone-100/80 dark:bg-stone-800/60 p-2 border border-stone-200/60 dark:border-stone-700/60">
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full overflow-hidden">
              {userAvatarUrl && !avatarImgError ? (
                <img
                  src={userAvatarUrl}
                  alt={user?.name || "User"}
                  onError={() => setAvatarImgError(true)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div
                  className={`h-full w-full flex items-center justify-center ${bg.brandGradient} text-white font-extrabold text-[11px]`}
                >
                  {userInitials}
                </div>
              )}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                {user?.name || user?.username || "Rehan Ghani"}
              </span>
              <span className="text-[10px] text-stone-500 dark:text-stone-400 truncate">
                {formattedRole}
              </span>
            </div>
          </div>

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
            <ChevronRightIcon
              size={14}
              className="text-orange-400 flex-shrink-0"
            />
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-stone-500 transition-colors hover:bg-rose-500/10 hover:text-rose-600 dark:text-stone-400 dark:hover:text-rose-400"
          >
            <LogOut size={16} className="flex-shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Desktop Left Sidebar (always in DOM, CSS hides on mobile) ────────── */}
      <aside
        aria-label="Desktop navigation"
        className={`hidden md:flex flex-col shrink-0 h-full border-r ${border.default} ${bg.sidebar} ${text.secondary} transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        {/* Brand / Logo Header */}
        <div
          className={`flex h-16 items-center ${sidebarOpen ? "justify-between px-4" : "justify-center px-2"} border-b ${border.default}`}
        >
          {sidebarOpen ? (
            <>
              <div className="flex items-center gap-3 overflow-hidden min-w-0">
                <div
                  className={`flex-shrink-0 flex items-center justify-center rounded-xl overflow-hidden transition-all duration-300 h-10 w-10 ${bg.active} p-1 border ${border.brand}`}
                >
                  <img
                    src={schoolLogo || rgLogo}
                    alt={schoolName || "RGES School"}
                    style={
                      !schoolLogo && theme === THEME_MODES.DARK
                        ? { mixBlendMode: "screen" }
                        : undefined
                    }
                    className="h-full w-full object-contain"
                    onError={(e) => {
                      if (e.currentTarget.src !== rgLogo)
                        e.currentTarget.src = rgLogo;
                    }}
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <span
                    className="truncate text-sm font-extrabold tracking-tight text-stone-900 dark:text-stone-100"
                    title={schoolName || "RGES School"}
                  >
                    {schoolName || "RGES School"}
                  </span>
                  <span className="text-[10px] font-semibold text-stone-400 dark:text-stone-500 truncate">
                    Campus Management
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-900 dark:hover:bg-stone-800 dark:hover:text-stone-100 flex-shrink-0"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft size={18} />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex items-center justify-center rounded-xl p-1 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              title="Expand sidebar"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden ${bg.active} p-1 border ${border.brand}`}
              >
                <img
                  src={schoolLogo || rgLogo}
                  alt={schoolName || "RGES School"}
                  style={
                    !schoolLogo && theme === THEME_MODES.DARK
                      ? { mixBlendMode: "screen" }
                      : undefined
                  }
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    if (e.currentTarget.src !== rgLogo)
                      e.currentTarget.src = rgLogo;
                  }}
                />
              </div>
            </button>
          )}
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
                    className={`transition-transform duration-200 ${collapsedSections[section.id] ? "-rotate-90" : ""}`}
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
                        className={`group flex items-center ${sidebarOpen ? "gap-3 px-3" : "justify-center px-2"} rounded-xl py-2 text-xs font-semibold transition-all duration-150 ${
                          active
                            ? `${bg.brandGradient} text-white shadow-md ${shadow.brand} font-bold`
                            : `${text.secondary} ${bg.hover} hover:${text.primary}`
                        }`}
                        title={!sidebarOpen ? item.name : undefined}
                      >
                        <Icon
                          size={16}
                          className={`flex-shrink-0 transition-colors ${active ? "text-white" : `${text.brand} group-hover:${text.brand}`}`}
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

        {/* Sidebar Footer */}
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
                  <span className="text-xs font-bold truncate">
                    2026 - 2027
                  </span>
                </div>
              </div>
              <ChevronRightIcon
                size={14}
                className="text-orange-400 flex-shrink-0"
              />
            </div>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className={`flex w-full items-center ${sidebarOpen ? "gap-3 px-3" : "justify-center px-2"} rounded-xl py-2 text-xs font-semibold text-stone-500 transition-colors hover:bg-rose-500/10 hover:text-rose-600 dark:text-stone-400 dark:hover:text-rose-400`}
            title={!sidebarOpen ? "Sign Out" : undefined}
          >
            <LogOut size={16} className="flex-shrink-0" />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* ── Main Container (Header + Content) ──────────────────────────────── */}
      <div className="flex h-screen min-w-0 min-h-0 flex-1 flex-col overflow-hidden">
        {/* ── Top Header ───────────────────────────────────────────────────── */}
        <header
          className={`sticky top-0 z-20 shrink-0 border-b ${border.default} ${bg.header}`}
        >
          {/* Main header row */}
          <div className="flex h-16 items-center justify-between gap-2 px-3 sm:px-5">
            {/* LEFT: mobile hamburger + school branding (hidden on desktop) */}
            <div className="flex md:hidden items-center gap-2 min-w-0">
              {/* Mobile open-drawer button */}
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(true)}
                className={`rounded-xl p-2 ${button.ghost} shrink-0`}
                aria-label="Open sidebar"
              >
                <Menu size={20} />
              </button>

              {/* Mobile: school logo + name shown in header instead of sidebar */}
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg overflow-hidden ${bg.active} p-1 border ${border.brand}`}
                >
                  <img
                    src={schoolLogo || rgLogo}
                    alt={schoolName || "RGES"}
                    style={
                      !schoolLogo && theme === THEME_MODES.DARK
                        ? { mixBlendMode: "screen" }
                        : undefined
                    }
                    className="h-full w-full object-contain"
                    onError={(e) => {
                      if (e.currentTarget.src !== rgLogo)
                        e.currentTarget.src = rgLogo;
                    }}
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="truncate text-xs font-extrabold text-stone-900 dark:text-stone-100 leading-tight max-w-[120px]">
                    {schoolName || "RGES School"}
                  </span>
                  <span className="text-[9px] font-semibold text-stone-400 dark:text-stone-500">
                    Campus Management
                  </span>
                </div>
              </div>
            </div>

            {/* CENTER: Header tabs — desktop only, hidden on mobile */}
            {canSeeHeaderTabs && (
              <div className="hidden md:flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none flex-1 px-2">
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

            {/* RIGHT: Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* AI Mode Button */}
              <button
                type="button"
                onClick={() => navigate(ROUTES.AI_MODE)}
                className="group relative flex items-center gap-1 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 p-[1.5px] shadow-sm shadow-orange-500/20 transition-all duration-300 hover:scale-105 active:scale-95 flex-shrink-0"
                title="Open Full-Page AI Mode"
              >
                <div className="flex items-center gap-1 rounded-[10px] bg-white px-2 py-1.5 transition-colors dark:bg-[#1C1B1A]">
                  <Sparkles className="h-3.5 w-3.5 text-orange-500 transition-transform group-hover:rotate-12 animate-pulse dark:text-orange-400 flex-shrink-0" />
                  <span className="hidden sm:inline text-[11px] font-extrabold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent dark:from-orange-400 dark:to-amber-300">
                    AI Mode
                  </span>
                </div>
              </button>

              {/* Notification Bell */}
              <button
                type="button"
                className={`relative rounded-xl p-2 ${button.ghost}`}
                title="Notifications"
              >
                <Bell size={18} />
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white">
                  3
                </span>
              </button>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Fullscreen — desktop only */}
              <button
                type="button"
                onClick={toggleFullscreen}
                className={`hidden md:inline-flex rounded-xl p-2 ${button.ghost}`}
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? (
                  <Minimize2 size={17} />
                ) : (
                  <Maximize2 size={17} />
                )}
              </button>

              {/* User Profile Pill */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className={`flex items-center gap-1.5 rounded-full sm:rounded-xl ${bg.hover} p-0.5 sm:px-1.5 sm:py-1 transition-all duration-150 focus:outline-none`}
                  aria-expanded={userDropdownOpen}
                  aria-label="User profile menu"
                >
                  {/* Avatar with online dot */}
                  <div className="relative flex h-8 w-8 sm:h-8.5 sm:w-8.5 shrink-0 items-center justify-center rounded-full">
                    <div
                      className={`h-full w-full rounded-full overflow-hidden flex items-center justify-center ${bg.brandGradient} text-white font-extrabold text-xs shadow-xs ring-1 ring-orange-500/20`}
                    >
                      {userAvatarUrl && !avatarImgError ? (
                        <img
                          src={userAvatarUrl}
                          alt={user?.name || "User"}
                          onError={() => setAvatarImgError(true)}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span>{userInitials}</span>
                      )}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#1C1B1A]" />
                  </div>
                  {/* Name + role — large screens only */}
                  <div className="hidden lg:flex flex-col text-left">
                    <span
                      className={`text-xs font-bold ${text.primary} leading-tight`}
                    >
                      {user?.name || user?.username || "Rehan Ghani"}
                    </span>
                    <span
                      className={`text-[10px] font-semibold ${text.muted} leading-none mt-0.5`}
                    >
                      {formattedRole}
                    </span>
                  </div>
                  <ChevronDown
                    size={13}
                    className={`hidden sm:block ${text.muted} transition-transform duration-200 ${userDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Dropdown */}
                {userDropdownOpen && (
                  <div
                    className={`absolute right-0 top-full mt-2 w-56 rounded-2xl ${bg.card} shadow-2xl border ${border.default} z-50 overflow-hidden animate-in fade-in zoom-in-95`}
                  >
                    <div
                      className={`px-4 py-3 border-b ${border.default} bg-gradient-to-br from-orange-500/5 to-amber-500/5`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                          <div
                            className={`h-full w-full rounded-full overflow-hidden flex items-center justify-center ${bg.brandGradient} text-white font-black text-sm shadow-sm ring-2 ring-orange-500/20`}
                          >
                            {userAvatarUrl && !avatarImgError ? (
                              <img
                                src={userAvatarUrl}
                                alt={user?.name || "User"}
                                onError={() => setAvatarImgError(true)}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span>{userInitials}</span>
                            )}
                          </div>
                          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white dark:border-[#1C1B1A]" />
                        </div>
                        <div className="min-w-0">
                          <p
                            className={`text-xs font-bold ${text.primary} truncate`}
                          >
                            {user?.name || user?.username || "Rehan Ghani"}
                          </p>
                          <p
                            className={`text-[10px] ${text.muted} truncate mt-0.5`}
                          >
                            {user?.email || "admin@school.com"}
                          </p>
                          <span className="inline-flex items-center rounded-full bg-orange-500/10 px-1.5 py-0.5 text-[9px] font-bold text-orange-600 dark:text-orange-400 mt-1">
                            {formattedRole}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="p-1.5 space-y-0.5">
                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold ${text.secondary} ${bg.hover} hover:${text.primary} transition-colors`}
                      >
                        <User
                          size={14}
                          className="flex-shrink-0 text-stone-400"
                        />
                        Profile Settings
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setUserDropdownOpen(false)}
                        className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold ${text.secondary} ${bg.hover} hover:${text.primary} transition-colors`}
                      >
                        <Settings
                          size={14}
                          className="flex-shrink-0 text-stone-400"
                        />
                        System Settings
                      </Link>
                    </div>
                    <div className={`border-t ${border.default} p-1.5`}>
                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          handleLogout();
                        }}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      >
                        <LogOut size={14} className="flex-shrink-0" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Mobile tab row — visible only on mobile (CSS, not JS conditional) */}
          {canSeeHeaderTabs &&
            (() => {
              const PRIMARY_MOBILE_COUNT = 3;
              const primaryTabs = HEADER_TABS.slice(0, PRIMARY_MOBILE_COUNT);
              const overflowTabs = HEADER_TABS.slice(PRIMARY_MOBILE_COUNT);
              const isOverflowActive =
                location.pathname === ROUTES.DASHBOARD &&
                overflowTabs.some((t) => t.id === activeDashboardTab);
              const activeOverflowTab = overflowTabs.find(
                (t) => t.id === activeDashboardTab
              );

              return (
                <div
                  className={`md:hidden relative border-t ${border.default} bg-stone-50/70 dark:bg-stone-900/60 backdrop-blur-md px-2.5 sm:px-3 py-1.5`}
                >
                  <div className="flex items-center justify-between gap-1.5">
                    {/* Primary 3 tabs */}
                    <div className="flex items-center gap-1 sm:gap-1.5 flex-1 min-w-0">
                      {primaryTabs.map((tab) => {
                        const isActive =
                          location.pathname === ROUTES.DASHBOARD &&
                          activeDashboardTab === tab.id;
                        const Icon = tab.icon;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => handleHeaderTabClick(tab.id)}
                            className={`flex-1 min-w-0 flex items-center justify-center gap-1 sm:gap-1.5 rounded-xl py-1.5 px-2 text-[11px] font-bold transition-all duration-150 ${
                              isActive
                                ? `${bg.brandGradient} text-white shadow-xs`
                                : `border ${border.default} ${bg.input} ${text.secondary} hover:border-orange-300 hover:${text.primary}`
                            }`}
                          >
                            <Icon size={13} className="shrink-0" />
                            <span className="truncate">
                              {tab.shortLabel || tab.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Three-dot menu button for overflow tabs */}
                    {overflowTabs.length > 0 && (
                      <div className="relative shrink-0" ref={moreTabsRef}>
                        <button
                          type="button"
                          onClick={() => setMoreTabsOpen((prev) => !prev)}
                          className={`flex items-center justify-center gap-1 rounded-xl px-2.5 py-1.5 text-[11px] font-bold transition-all duration-150 ${
                            isOverflowActive
                              ? `${bg.brandGradient} text-white shadow-xs ring-1 ring-orange-500/30`
                              : moreTabsOpen
                                ? `border border-orange-400 bg-orange-500/10 text-orange-600 dark:text-orange-400`
                                : `border ${border.default} ${bg.input} ${text.secondary} hover:border-orange-300 hover:${text.primary}`
                          }`}
                          title={
                            isOverflowActive
                              ? `Active: ${activeOverflowTab?.label}`
                              : "More tabs"
                          }
                          aria-expanded={moreTabsOpen}
                          aria-label="More navigation tabs"
                        >
                          {isOverflowActive && activeOverflowTab ? (
                            <>
                              <activeOverflowTab.icon
                                size={13}
                                className="shrink-0"
                              />
                              <span className="max-w-[65px] truncate">
                                {activeOverflowTab.shortLabel ||
                                  activeOverflowTab.label}
                              </span>
                              <MoreHorizontal
                                size={13}
                                className="shrink-0 opacity-80"
                              />
                            </>
                          ) : (
                            <>
                              <MoreHorizontal size={15} className="shrink-0" />
                              <span className="text-[10px] uppercase tracking-wider font-extrabold hidden min-[360px]:inline">
                                More
                              </span>
                            </>
                          )}
                        </button>

                        {/* Dropdown Menu */}
                        {moreTabsOpen && (
                          <div
                            className={`absolute right-0 top-full mt-2 w-52 rounded-2xl ${bg.card} shadow-2xl border ${border.default} z-50 p-1.5 space-y-1 animate-in fade-in zoom-in-95 backdrop-blur-md`}
                          >
                            <div className="flex items-center justify-between px-2.5 py-1 border-b border-stone-200/50 dark:border-stone-800 mb-1">
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                                More Modules
                              </span>
                              <span className="text-[9px] font-bold text-orange-500 bg-orange-500/10 px-1.5 py-0.5 rounded-full">
                                {overflowTabs.length} tabs
                              </span>
                            </div>
                            {overflowTabs.map((tab) => {
                              const isActive =
                                location.pathname === ROUTES.DASHBOARD &&
                                activeDashboardTab === tab.id;
                              const Icon = tab.icon;
                              return (
                                <button
                                  key={tab.id}
                                  type="button"
                                  onClick={() => {
                                    setMoreTabsOpen(false);
                                    handleHeaderTabClick(tab.id);
                                  }}
                                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                                    isActive
                                      ? `${bg.brandGradient} text-white shadow-xs font-bold`
                                      : `${text.secondary} ${bg.hover} hover:${text.primary}`
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div
                                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${
                                        isActive
                                          ? "bg-white/20 text-white"
                                          : "bg-orange-500/10 text-orange-600 dark:text-orange-400"
                                      }`}
                                    >
                                      <Icon size={13} />
                                    </div>
                                    <span className="truncate">
                                      {tab.label}
                                    </span>
                                  </div>
                                  {isActive && (
                                    <Check
                                      size={14}
                                      className="text-white shrink-0"
                                    />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
        </header>

        {/* Main Content Viewport */}
        <main className="flex-1 min-h-0 overflow-y-auto bg-[#FAF7F2] p-3 sm:p-5 md:p-6 text-stone-900 dark:bg-[#121214] dark:text-[#FAF7F2]">
          <ErrorBoundary compact>
            <Outlet context={{ activeDashboardTab, setActiveDashboardTab }} />
          </ErrorBoundary>
        </main>
      </div>

      {/* ── Setup Wizard Modal ── */}
      <SetupWizardModal
        isOpen={wizardModalOpen}
        onClose={() => setWizardModalOpen(false)}
        onComplete={() => {
          setWizardModalOpen(false);
          wizard.refreshStatus();
        }}
      />

      {/* ── Mandatory School Profile Modal ── */}
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
