import React, { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../store/slices/authSlice.js";
import { filterNavForUser, isNavActive } from "../config/navigation.js";
import ThemeToggle from "../components/ui/ThemeToggle.jsx";
import ErrorBoundary from "../components/ui/ErrorBoundary.jsx";
import { THEME_MODES, useTheme } from "../theme/ThemeContext.jsx";
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
} from "lucide-react";
import { ROUTES } from "../routes/routes.js";
import { ROLES, ADMIN_ROLES } from "../constants/roles.js";
import rgLogo from "../assets/logo/RGLOGO.png";
import { useSchoolBranding } from "../context/SchoolBrandingContext.jsx";

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

  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const { schoolLogo, schoolName } = useSchoolBranding();

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

  const canSeeHeaderTabs =
    user?.role &&
    user.role !== ROLES.STUDENT &&
    user.role !== ROLES.PARENT &&
    (ADMIN_ROLES.includes(user.role) || user.role === "superadmin");

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans text-slate-900 dark:bg-[#080c14] dark:text-slate-100">
      <aside
        className={`fixed z-30 flex h-full flex-col border-r border-slate-200 bg-white text-slate-500 transition-all duration-300 dark:border-slate-800/80 dark:bg-[#0f172a] dark:text-slate-400 ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4 dark:border-slate-800/80">
          <div className="flex items-center gap-3 overflow-hidden min-w-0">
            <div
              className={`flex-shrink-0 flex items-center justify-center rounded-xl overflow-hidden transition-all duration-300 ${
                sidebarOpen ? "h-10 w-10" : "h-9 w-9"
              } ${
                schoolLogo
                  ? "bg-white dark:bg-slate-800/90 shadow-sm ring-1 ring-slate-200/80 dark:ring-slate-700/60 p-1"
                  : ""
              }`}
            >
              <img
                src={schoolLogo || rgLogo}
                alt={schoolName || "School Logo"}
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
              <span
                className="truncate text-sm font-extrabold tracking-tight text-slate-950 dark:text-white"
                title={schoolName || "RG EduCore"}
              >
                {schoolName || "RG EduCore"}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarOpen ? (
              <ChevronLeft size={18} />
            ) : (
              <ChevronRight size={18} />
            )}
          </button>
        </div>

        <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-4">
          {navSections.map((section) => (
            <div key={section.id}>
              {sidebarOpen && (
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className="flex w-full items-center justify-between px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
                >
                  {section.label}
                  <ChevronDown
                    size={12}
                    className={`transition-transform ${
                      collapsedSections[section.id] ? "-rotate-90" : ""
                    }`}
                  />
                </button>
              )}
              {(!collapsedSections[section.id] || !sidebarOpen) && (
                <div className="mt-1 space-y-1">
                  {section.items.map((item) => {
                    const active = isNavActive(location.pathname, item.path);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                          active
                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                            : "text-slate-500 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-slate-100"
                        }`}
                      >
                        <Icon size={16} className="flex-shrink-0" />
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

        <div className="border-t border-slate-200 p-3 dark:border-slate-800/80">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-500 transition-colors hover:bg-rose-500/10 hover:text-rose-500 dark:text-slate-400 dark:hover:text-rose-400"
          >
            <LogOut size={16} className="flex-shrink-0" />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      <div
        className={`flex min-w-0 flex-1 flex-col transition-all duration-300 ${
          sidebarOpen ? "pl-64" : "pl-20"
        }`}
      >
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 dark:border-slate-800/80 dark:bg-[#0f172a]">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              <Menu size={20} />
            </button>
          </div>

          {canSeeHeaderTabs && (
            <div className="flex max-w-full items-center gap-2 overflow-x-auto py-1">
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
                    className={`flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-bold transition-all duration-200 ${
                      isActive
                        ? "border border-indigo-500/50 bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                        : "border border-slate-200 bg-slate-100 text-slate-600 hover:border-slate-300 hover:bg-white hover:text-slate-950 dark:border-slate-700/60 dark:bg-slate-800/60 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    <Icon size={15} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Full-Page AI Mode Button */}
            <button
              type="button"
              onClick={() => navigate(ROUTES.AI_MODE)}
              className="group relative flex items-center gap-1.5 sm:gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-[1px] shadow-md shadow-indigo-500/20 transition-all duration-300 hover:scale-105 hover:shadow-indigo-500/40 active:scale-95 flex-shrink-0"
              title="Open Full-Page AI Mode"
            >
              <div className="flex items-center gap-1.5 sm:gap-2 rounded-[11px] bg-white px-2.5 sm:px-3.5 py-1.5 transition-colors group-hover:bg-opacity-90 dark:bg-slate-900/90 dark:group-hover:bg-slate-900/70">
                <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-500 transition-transform group-hover:rotate-12 animate-pulse dark:text-indigo-400 flex-shrink-0" />
                <span className="text-[11px] sm:text-xs font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent dark:from-indigo-400 dark:via-purple-300 dark:to-pink-400">
                  AI Mode
                </span>
                <span className="hidden sm:inline-flex rounded-full bg-indigo-500/10 px-1.5 py-0.2 text-[9px] font-bold text-indigo-600 dark:bg-indigo-400/20 dark:text-indigo-300">
                  NVIDIA
                </span>
              </div>
            </button>

            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-100 p-6 text-slate-900 dark:bg-[#090d16] dark:text-slate-100">
          <ErrorBoundary compact>
            <Outlet context={{ activeDashboardTab, setActiveDashboardTab }} />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
