import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setAllRolePermissions } from '../../store/slices/roleAccessSlice.js';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  GraduationCap,
  BookOpen,
  Wallet,
  Library,
  UserCheck,
  User,
  Users,
  Search,
  RotateCcw,
  Save,
  CheckCircle2,
  Lock,
  ChevronDown,
  ChevronUp,
  Eye,
  Sparkles,
  Info,
  CalendarCheck,
  Palmtree,
  HelpCircle,
  Edit3,
  X,
  Sliders,
  CheckSquare,
  Square,
  LayoutDashboard,
  FileText,
  Award,
  BookMarked,
  Video,
  NotebookPen,
  CreditCard,
  Briefcase,
  Warehouse,
  Truck,
  Bus,
  Building2,
  BadgeCheck,
  Bell,
  BarChart3,
  UserCog,
  Settings as SettingsIcon,
  Filter,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { roleAccessService } from '../../services/roleAccessService.js';
import Loader from '../../components/ui/Loader.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import Toggle from '../../components/ui/Toggle.jsx';
import { setCustomRolePermissions, getUserRole } from '../../config/access.jsx';
import { ROLES } from '../../constants/roles.js';
import { Input } from '../../components/ui/FormControls.jsx';
import { notifyApiError } from '../../services/apiErrors.js';

// Module Icon Registry
const MODULE_ICON_MAP = {
  dashboard: LayoutDashboard,
  students: GraduationCap,
  teachers: Users,
  academics: BookOpen,
  attendance: CalendarCheck,
  leave: Palmtree,
  exams: FileText,
  results: Award,
  syllabus: BookMarked,
  'online-classes': Video,
  homework: NotebookPen,
  fees: CreditCard,
  budget: Wallet,
  payroll: Briefcase,
  inventory: Warehouse,
  vendors: Truck,
  library: Library,
  transport: Bus,
  hostel: Building2,
  certificates: BadgeCheck,
  notifications: Bell,
  reports: BarChart3,
  'user-management': UserCog,
  'audit-logs': Shield,
  profile: User,
  settings: SettingsIcon,
};

// Visual configuration for each role
const ROLE_CONFIG = {
  'super-admin': {
    label: 'Super Admin (Director)',
    badge: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300 dark:border-purple-800',
    icon: ShieldAlert,
    category: 'Executive & Master Governance',
    description: 'Master institutional governor & Director. Possesses permanent wildcard access across all modules, buttons, and settings (immutable).',
    isMaster: true,
  },
  'school-admin': {
    label: 'Admin (School Admin)',
    badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800',
    icon: ShieldCheck,
    category: 'Operational Administration',
    description: 'Institutional management, staff credentials, curriculum schedules, budget allocations, and comprehensive oversight.',
  },
  principal: {
    label: 'Principal',
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-800',
    icon: GraduationCap,
    category: 'Institutional Leadership',
    description: 'Academic dean and campus head. Manages staff evaluations, syllabus compliance, budget revisions, and master leave approvals.',
  },
  director: {
    label: 'Director',
    badge: 'bg-violet-100 text-violet-800 dark:bg-violet-950/60 dark:text-violet-300 border-violet-300 dark:border-violet-800',
    icon: Shield,
    category: 'Executive Board',
    description: 'Executive trustee oversight, strategic budgeting, institutional policy, and broad oversight.',
  },
  teacher: {
    label: 'Teacher / Faculty',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
    icon: BookOpen,
    category: 'Academic Faculty',
    description: 'Classroom instructors. Manages attendance, lesson syllabus, student marks, homework, and Class Teacher leave approvals.',
  },
  'head-teacher': {
    label: 'Head Teacher',
    badge: 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border-teal-300 dark:border-teal-800',
    icon: BookOpen,
    category: 'Senior Faculty',
    description: 'Senior department instructor with curriculum scheduling and teacher observation permissions.',
  },
  hod: {
    label: 'Head of Dept (HOD)',
    badge: 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border-teal-300 dark:border-teal-800',
    icon: BookOpen,
    category: 'Senior Faculty',
    description: 'Subject department head with academic curriculum design and examination vetting rights.',
  },
  coordinator: {
    label: 'Academic Coordinator',
    badge: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800',
    icon: BookOpen,
    category: 'Academic Operations',
    description: 'Academic program coordinator overseeing scheduling and syllabus milestones.',
  },
  accountant: {
    label: 'Accountant',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800',
    icon: Wallet,
    category: 'Finance & Treasury',
    description: 'Fee collection desk, financial ledgers, salary payroll disbursements, and institutional asset procurement.',
  },
  librarian: {
    label: 'Librarian',
    badge: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 dark:border-rose-800',
    icon: Library,
    category: 'Campus Facilities',
    description: 'Central library cataloging, book lending records, inventory barcode scanning, and student returns.',
  },
  peon: {
    label: 'Peon / Support Staff',
    badge: 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border-orange-300 dark:border-orange-800',
    icon: UserCheck,
    category: 'Support Staff',
    description: 'Campus maintenance, facility logistics, self-service leave applications, and monthly salary slips.',
  },
  student: {
    label: 'Student Portal',
    badge: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border-sky-300 dark:border-sky-800',
    icon: User,
    category: 'Student Portal',
    description: 'Personalized student access: view attendance, timetable, exam marks, homework submission, and personal leave requests.',
  },
  parent: {
    label: 'Parent Portal',
    badge: 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-950/60 dark:text-fuchsia-300 border-fuchsia-300 dark:border-fuchsia-800',
    icon: Users,
    category: 'Parent Portal',
    description: 'Ward academic monitor: track child attendance, view report cards, pay tuition fees, and file student leave applications.',
  },
};

// Logical grouping of roles for the dropdown
const ROLE_GROUPS = [
  {
    title: 'Executive & Administration',
    roles: ['super-admin', 'school-admin', 'principal', 'director'],
  },
  {
    title: 'Academic Faculty',
    roles: ['teacher', 'head-teacher', 'hod', 'coordinator'],
  },
  {
    title: 'Support & Operations',
    roles: ['accountant', 'librarian', 'peon'],
  },
  {
    title: 'Portals (Students & Parents)',
    roles: ['student', 'parent'],
  },
];

const RoleAndAccessSettings = () => {
  const dispatch = useDispatch();
  const authUser = useSelector((state) => state.auth?.user);
  const currentRole = getUserRole(authUser);
  const isSuperAdmin = currentRole === ROLES.SUPER_ADMIN || currentRole === 'superadmin';

  // Core Data State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rolesData, setRolesData] = useState([]);
  const [allModules, setAllModules] = useState([]);
  const [allButtons, setAllButtons] = useState([]);
  const [activeRoleKey, setActiveRoleKey] = useState('teacher');

  // Dropdown Open State
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const roleDropdownRef = useRef(null);
  const categoryDropdownRef = useRef(null);

  // Mode: View vs Edit
  const [isEditing, setIsEditing] = useState(false);

  // Active configuration being edited/viewed
  const [editingRoleConfig, setEditingRoleConfig] = useState(null);
  const [backupRoleConfig, setBackupRoleConfig] = useState(null);

  // Accordion Expand/Collapse State per module: { [moduleId]: boolean }
  const [expandedModules, setExpandedModules] = useState({});

  // Search & Category Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Confirm Dialog
  const [confirmResetRole, setConfirmResetRole] = useState(null);

  // Close dropdowns on outside click or Escape key
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(e.target)) {
        setRoleDropdownOpen(false);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target)) {
        setCategoryDropdownOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setRoleDropdownOpen(false);
        setCategoryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Load all role permissions from backend (initial load or explicit refresh)
  const loadRolePermissions = useCallback(async (targetRoleKey) => {
    try {
      setLoading(true);
      const data = await roleAccessService.getRolePermissions();
      if (data?.roles) {
        setRolesData(data.roles);
        setAllModules(data.allModules || []);
        setAllButtons(data.allButtons || []);
        dispatch(
          setAllRolePermissions({
            roles: data.roles,
            allModules: data.allModules || [],
            allButtons: data.allButtons || [],
          })
        );

        const roleToSelect = targetRoleKey || activeRoleKey;
        const initialRole = data.roles.find((r) => r.role === roleToSelect) || data.roles[0];
        if (initialRole) {
          const cloned = JSON.parse(JSON.stringify(initialRole));
          setEditingRoleConfig(cloned);
          setBackupRoleConfig(JSON.parse(JSON.stringify(cloned)));
        }
      }
    } catch (err) {
      console.error('Failed to load role permissions:', err);
      notifyApiError(err, 'Failed to load role permissions from server');
    } finally {
      setLoading(false);
    }
  }, []); // Run once without dependency-induced flickering

  useEffect(() => {
    loadRolePermissions();
  }, [loadRolePermissions]);

  // Handle switching active role from dropdown (instant switch, no spinner)
  const handleSelectRole = (roleKey) => {
    if (isEditing) {
      if (!window.confirm('You have unsaved edits for this role. Discard and switch roles?')) {
        return;
      }
    }
    setActiveRoleKey(roleKey);
    setIsEditing(false);
    setRoleDropdownOpen(false);
    const target = rolesData.find((r) => r.role === roleKey);
    if (target) {
      const cloned = JSON.parse(JSON.stringify(target));
      setEditingRoleConfig(cloned);
      setBackupRoleConfig(JSON.parse(JSON.stringify(cloned)));
    }
  };

  const currentRoleCfg = ROLE_CONFIG[activeRoleKey] || {
    label: activeRoleKey,
    badge: 'bg-slate-100 text-slate-800',
    icon: User,
    category: 'General',
    description: 'System user role',
  };
  const RoleIcon = currentRoleCfg.icon;
  const isLockedMaster = activeRoleKey === 'super-admin';

  // Toggle Module Expand/Collapse
  const toggleModuleAccordion = (moduleId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  // Expand All / Collapse All
  const handleToggleAllAccordions = (expand = true) => {
    const nextState = {};
    allModules.forEach((m) => {
      nextState[m.id] = expand;
    });
    setExpandedModules(nextState);
  };

  // Toggle Module in Sidebar (On / Off)
  const handleToggleModuleAccess = (moduleId, enabled) => {
    if (!isEditing || isLockedMaster) return;
    setEditingRoleConfig((prev) => {
      const current = prev.modules || [];
      let updated = [];
      if (current.includes('*')) {
        updated = allModules.map((m) => m.id);
      } else {
        updated = [...current];
      }

      if (enabled) {
        if (!updated.includes(moduleId)) updated.push(moduleId);
      } else {
        updated = updated.filter((id) => id !== moduleId);
      }

      return { ...prev, modules: updated, isCustomized: true };
    });
  };

  // Toggle Specific Action Button (On / Off)
  const handleToggleActionButton = (buttonId, enabled) => {
    if (!isEditing || isLockedMaster) return;
    setEditingRoleConfig((prev) => {
      const current = prev.buttons || [];
      let updated = [];
      if (current.includes('*')) {
        updated = allButtons.map((b) => b.id);
      } else {
        updated = [...current];
      }

      if (enabled) {
        if (!updated.includes(buttonId)) updated.push(buttonId);
      } else {
        updated = updated.filter((id) => id !== buttonId);
      }

      return { ...prev, buttons: updated, isCustomized: true };
    });
  };

  // Toggle All Action Buttons for a specific Module
  const handleToggleAllModuleButtons = (moduleId, enableAll = true) => {
    if (!isEditing || isLockedMaster) return;
    const moduleButtonIds = allButtons.filter((b) => b.module === moduleId).map((b) => b.id);
    setEditingRoleConfig((prev) => {
      const current = prev.buttons?.includes('*') ? allButtons.map((b) => b.id) : [...(prev.buttons || [])];
      let updated = [];
      if (enableAll) {
        updated = Array.from(new Set([...current, ...moduleButtonIds]));
      } else {
        updated = current.filter((id) => !moduleButtonIds.includes(id));
      }
      return { ...prev, buttons: updated, isCustomized: true };
    });
  };

  // Toggle Workflow Parameter
  const handleToggleWorkflow = (key, val) => {
    if (!isEditing || isLockedMaster) return;
    setEditingRoleConfig((prev) => ({
      ...prev,
      workflowSettings: {
        ...(prev.workflowSettings || {}),
        [key]: val !== undefined ? val : !prev.workflowSettings?.[key],
      },
      isCustomized: true,
    }));
  };

  // Start Editing
  const handleStartEdit = () => {
    if (isLockedMaster) {
      toast.info('Super Admin (Director) master role has permanent permissions and cannot be modified.');
      return;
    }
    setBackupRoleConfig(JSON.parse(JSON.stringify(editingRoleConfig)));
    setIsEditing(true);
  };

  // Cancel Editing
  const handleCancelEdit = () => {
    if (backupRoleConfig) {
      setEditingRoleConfig(JSON.parse(JSON.stringify(backupRoleConfig)));
    }
    setIsEditing(false);
  };

  // Save changes
  const handleSaveRole = async () => {
    if (isLockedMaster) return;
    try {
      setSaving(true);
      await roleAccessService.updateRolePermissions(activeRoleKey, {
        modules: editingRoleConfig.modules,
        buttons: editingRoleConfig.buttons,
        viewScope: editingRoleConfig.viewScope,
        workflowSettings: editingRoleConfig.workflowSettings,
      });

      const updatedList = rolesData.map((r) =>
        r.role === activeRoleKey ? { ...editingRoleConfig, isCustomized: true } : r
      );
      setRolesData(updatedList);
      setCustomRolePermissions(updatedList);
      dispatch(
        setAllRolePermissions({
          roles: updatedList,
          allModules,
          allButtons,
        })
      );
      setBackupRoleConfig(JSON.parse(JSON.stringify(editingRoleConfig)));
      setIsEditing(false);

      toast.success(`Permissions for role '${currentRoleCfg.label}' saved successfully!`);
    } catch (err) {
      console.error('Failed to update role permissions:', err);
      notifyApiError(err, 'Failed to update role permissions');
    } finally {
      setSaving(false);
    }
  };

  // Reset to default
  const handleResetToDefault = async () => {
    try {
      setSaving(true);
      await roleAccessService.resetRolePermissions(activeRoleKey);
      await loadRolePermissions(activeRoleKey);
      setConfirmResetRole(null);
      setIsEditing(false);
      toast.success(`Role '${currentRoleCfg.label}' reset to factory defaults!`);
    } catch (err) {
      notifyApiError(err, 'Failed to reset role permissions');
    } finally {
      setSaving(false);
    }
  };

  // Filter Categories
  const categoriesList = useMemo(() => {
    const cats = new Set(allModules.map((m) => m.category));
    return ['all', ...Array.from(cats)];
  }, [allModules]);

  // Calculate module count per category
  const categoryModuleCounts = useMemo(() => {
    const counts = { all: allModules.length };
    allModules.forEach((m) => {
      counts[m.category] = (counts[m.category] || 0) + 1;
    });
    return counts;
  }, [allModules]);

  // Filtered modules based on search and category
  const filteredModules = useMemo(() => {
    let list = allModules;
    if (selectedCategory !== 'all') {
      list = list.filter((m) => m.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.id.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q) ||
          allButtons.some((b) => b.module === m.id && (b.label.toLowerCase().includes(q) || b.id.toLowerCase().includes(q)))
      );
    }
    return list;
  }, [allModules, allButtons, searchQuery, selectedCategory]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader size="lg" text="Loading institutional role and access matrix..." />
      </div>
    );
  }

  const roleModules = editingRoleConfig?.modules || [];
  const roleButtons = editingRoleConfig?.buttons || [];
  const wf = editingRoleConfig?.workflowSettings || {};

  // Count active stats
  const activeModuleCount = roleModules.includes('*') ? allModules.length : roleModules.length;
  const activeButtonCount = roleButtons.includes('*') ? allButtons.length : roleButtons.length;

  return (
    <div className="w-full space-y-4 font-sans text-slate-800 dark:text-slate-100">
      {/* ── Top Header Bar with Mode and Actions ─────────────────────────── */}
      <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 sm:p-2 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
              <Shield size={20} />
            </span>
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                Role & Permission Governance Hub
                {isEditing ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                    Editing Mode
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    View Mode
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Manage all institutional access role-wise in a unified view. Toggle modules, action buttons, and approval workflows.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons: View mode vs Edit mode */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {!isLockedMaster && !isEditing && (
            <button
              type="button"
              onClick={handleStartEdit}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs shadow-md shadow-orange-500/25 transition cursor-pointer"
            >
              <Edit3 size={14} />
              <span>Edit Permissions</span>
            </button>
          )}

          {isEditing && (
            <>
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={saving}
                className="inline-flex items-center gap-1 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer"
              >
                <X size={14} />
                <span>Cancel</span>
              </button>

              <button
                type="button"
                onClick={handleSaveRole}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 sm:px-5 sm:py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs shadow-md shadow-orange-500/25 transition cursor-pointer disabled:opacity-50"
              >
                <Save size={14} />
                <span>{saving ? 'Saving...' : 'Save Role Configuration'}</span>
              </button>
            </>
          )}

          {!isLockedMaster && (
            <button
              type="button"
              onClick={() => setConfirmResetRole(activeRoleKey)}
              disabled={saving}
              title="Restore system defaults for this role"
              className="inline-flex items-center gap-1 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs transition cursor-pointer"
            >
              <RotateCcw size={13} />
              <span className="hidden sm:inline">Reset Defaults</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Active Role Control Bar with ROLE DROPDOWN ─────────────────────── */}
      <div className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1C1B1A] p-3.5 sm:p-4 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Left: Prominent Custom Role Selector Dropdown */}
          <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
            <div className="relative" ref={roleDropdownRef}>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                Selected Role to Configure:
              </label>

              <button
                type="button"
                onClick={() => {
                  setRoleDropdownOpen((prev) => !prev);
                  setCategoryDropdownOpen(false);
                }}
                className="flex items-center justify-between gap-4 px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80 hover:border-orange-500 dark:hover:border-orange-500 transition shadow-xs cursor-pointer min-w-[280px] sm:min-w-[340px]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800/80 shadow-2xs">
                    <RoleIcon size={18} />
                  </div>
                  <div className="text-left">
                    <span className="block text-xs font-black text-slate-900 dark:text-white leading-tight">
                      {currentRoleCfg.label}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 block">
                      {currentRoleCfg.category}
                    </span>
                  </div>
                </div>

                <ChevronDown
                  size={16}
                  className={`text-slate-400 transition-transform duration-200 ${
                    roleDropdownOpen ? 'rotate-180 text-orange-500' : ''
                  }`}
                />
              </button>

              {/* Custom Animated Role Dropdown Menu */}
              {roleDropdownOpen && (
                <div className="absolute left-0 top-full mt-2 z-50 w-80 sm:w-96 max-h-[460px] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-2.5 space-y-3.5 scrollbar-thin">
                  {ROLE_GROUPS.map((group) => (
                    <div key={group.title} className="space-y-1">
                      <span className="px-2.5 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block pt-1">
                        {group.title}
                      </span>

                      {group.roles.map((rKey) => {
                        const cfg = ROLE_CONFIG[rKey] || { label: rKey, icon: User };
                        const Icon = cfg.icon;
                        const isSelected = activeRoleKey === rKey;
                        const targetRoleData = rolesData.find((r) => r.role === rKey);
                        const modCount = targetRoleData?.modules?.includes('*')
                          ? allModules.length
                          : (targetRoleData?.modules?.length || 0);

                        return (
                          <button
                            key={rKey}
                            type="button"
                            onClick={() => handleSelectRole(rKey)}
                            className={`w-full flex items-center justify-between p-2.5 rounded-xl transition cursor-pointer text-left ${
                              isSelected
                                ? 'bg-orange-50 dark:bg-orange-950/50 text-orange-950 dark:text-orange-200 border border-orange-200 dark:border-orange-900/60 font-bold'
                                : 'hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className={`p-2 rounded-xl flex-shrink-0 ${
                                  isSelected
                                    ? 'bg-orange-500 text-white shadow-xs shadow-orange-500/30'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                                }`}
                              >
                                <Icon size={15} />
                              </span>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold block">{cfg.label}</span>
                                  {targetRoleData?.isCustomized && (
                                    <span
                                      className="w-2 h-2 rounded-full bg-emerald-500"
                                      title="Customized role"
                                    />
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
                                  {cfg.category} • {modCount} modules
                                </span>
                              </div>
                            </div>

                            {isSelected && (
                              <CheckCircle2 size={16} className="text-orange-500 flex-shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Role Details and Badges */}
            <div className="pt-4 sm:pt-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${currentRoleCfg.badge}`}
                >
                  {currentRoleCfg.category}
                </span>

                {editingRoleConfig?.isCustomized && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    Customized for School
                  </span>
                )}

                {isLockedMaster && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1">
                    <Lock size={10} /> Permanent Master
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                {currentRoleCfg.description}
              </p>
            </div>
          </div>

          {/* Right: Quick Metrics */}
          <div className="flex items-center gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800 flex-shrink-0">
            <div className="px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center min-w-[110px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Modules
              </span>
              <span className="text-base font-black text-slate-900 dark:text-white">
                {activeModuleCount} / {allModules.length}
              </span>
            </div>

            <div className="px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center min-w-[110px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Buttons
              </span>
              <span className="text-base font-black text-slate-900 dark:text-white">
                {activeButtonCount} / {allButtons.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Search & Filter Bar with CATEGORY DROPDOWN ────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Category Dropdown */}
        <div className="flex items-center gap-2">
          <div className="relative" ref={categoryDropdownRef}>
            <button
              type="button"
              onClick={() => {
                setCategoryDropdownOpen((prev) => !prev);
                setRoleDropdownOpen(false);
              }}
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-2xs cursor-pointer min-w-[200px] justify-between"
            >
              <div className="flex items-center gap-2">
                <Filter size={13} className="text-orange-500 flex-shrink-0" />
                <span className="capitalize">
                  {selectedCategory === 'all' ? 'All Categories' : selectedCategory}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                  {categoryModuleCounts[selectedCategory] || allModules.length}
                </span>
              </div>
              <ChevronDown
                size={14}
                className={`text-slate-400 transition-transform ${categoryDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {categoryDropdownOpen && (
              <div className="absolute left-0 top-full mt-1.5 z-40 w-64 max-h-72 overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-1.5 space-y-0.5 scrollbar-thin">
                {categoriesList.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat);
                      setCategoryDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold capitalize text-left transition cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{cat === 'all' ? 'All Categories' : cat}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                        {categoryModuleCounts[cat] || 0}
                      </span>
                    </div>
                    {selectedCategory === cat && (
                      <CheckCircle2 size={14} className="text-orange-500 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Search Input & Expand/Collapse Controls */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <div className="relative min-w-[240px] flex-1 sm:flex-initial">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Search module or button..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-2xs"
            />
          </div>

          <button
            type="button"
            onClick={() => handleToggleAllAccordions(true)}
            className="px-3.5 py-2.5 rounded-2xl text-xs font-bold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer whitespace-nowrap shadow-2xs"
          >
            Expand All
          </button>

          <button
            type="button"
            onClick={() => handleToggleAllAccordions(false)}
            className="px-3.5 py-2.5 rounded-2xl text-xs font-bold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer whitespace-nowrap shadow-2xs"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* ── UNIFIED MODULE-WISE ACCORDION LIST ─────────────────────────────── */}
      <div className="space-y-3.5">
        {filteredModules.map((module) => {
          const ModuleIcon = MODULE_ICON_MAP[module.id] || BookOpen;
          const isModuleEnabled = roleModules.includes('*') || roleModules.includes(module.id);
          const isExpanded = Boolean(expandedModules[module.id]);

          // Get action buttons belonging to this module
          const moduleButtons = allButtons.filter((b) => b.module === module.id);
          const enabledButtonsCount = moduleButtons.filter(
            (b) => roleButtons.includes('*') || roleButtons.includes(b.id)
          ).length;

          // Check if this module has special workflows
          const hasLeaveWorkflow = module.id === 'leave';
          const hasBudgetWorkflow = module.id === 'budget';

          return (
            <div
              key={module.id}
              className={`w-full rounded-3xl border transition-all duration-200 bg-white dark:bg-[#1C1B1A] shadow-xs ${
                isModuleEnabled
                  ? 'border-slate-200 dark:border-slate-800'
                  : 'border-slate-200/60 dark:border-slate-800/60 opacity-80'
              }`}
            >
              {/* Module Row Header */}
              <div
                className={`p-4 sm:p-4.5 flex items-center justify-between gap-4 select-none ${
                  isExpanded ? 'border-b border-slate-100 dark:border-slate-800' : ''
                }`}
              >
                {/* Left: Icon & Title (Click to toggle accordion) */}
                <div
                  onClick={() => toggleModuleAccordion(module.id)}
                  className="flex items-center gap-3.5 cursor-pointer flex-1 min-w-0"
                >
                  <div
                    className={`p-2.5 rounded-2xl border flex-shrink-0 ${
                      isModuleEnabled
                        ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-900/60'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <ModuleIcon size={18} />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 transition truncate">
                        {module.name}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                        {module.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex-wrap">
                      {isModuleEnabled ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 size={12} />
                          Sidebar & Route Active
                        </span>
                      ) : (
                        <span className="text-slate-400 font-semibold">Hidden from Navigation & Blocked</span>
                      )}

                      {moduleButtons.length > 0 && (
                        <span>
                          • Buttons: <strong className="text-slate-700 dark:text-slate-300">{enabledButtonsCount}/{moduleButtons.length}</strong> active
                        </span>
                      )}

                      {hasLeaveWorkflow && (
                        <span>
                          • Approval: <strong className="text-indigo-600 dark:text-indigo-400">{wf.canApproveLeaves ? wf.leaveApprovalScope?.replace('_', ' ') : 'None'}</strong>
                        </span>
                      )}

                      {hasBudgetWorkflow && (
                        <span>
                          • Budget Access: <strong className={wf.canViewBudget ? 'text-amber-600' : 'text-slate-400'}>{wf.canViewBudget ? 'Visible' : 'Hidden'}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Main Module Toggle + Expand Chevron */}
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-500 hidden sm:inline">
                      {isModuleEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <Toggle
                      aria-label={module.name + ' access'}
                      checked={isModuleEnabled}
                      disabled={!isEditing || isLockedMaster}
                      onChange={(checked) => handleToggleModuleAccess(module.id, checked)}
                      size="md"
                      color="orange"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleModuleAccordion(module.id)}
                    className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                    title={isExpanded ? 'Collapse' : 'Expand'}
                  >
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>
              </div>

              {/* Expanded Accordion Body */}
              {isExpanded && (
                <div className="p-5 space-y-5 bg-slate-50/50 dark:bg-slate-900/20 rounded-b-3xl">
                  {/* 1. Action Buttons Table */}
                  {moduleButtons.length > 0 ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <Sliders size={14} className="text-orange-500" />
                          <span>Action Buttons & Capabilities</span>
                        </span>

                        {isEditing && !isLockedMaster && (
                          <div className="flex items-center gap-2 text-xs">
                            <button
                              type="button"
                              onClick={() => handleToggleAllModuleButtons(module.id, true)}
                              className="text-orange-600 dark:text-orange-400 font-bold hover:underline cursor-pointer"
                            >
                              Enable All
                            </button>
                            <span className="text-slate-300 dark:text-slate-700">|</span>
                            <button
                              type="button"
                              onClick={() => handleToggleAllModuleButtons(module.id, false)}
                              className="text-slate-500 hover:underline cursor-pointer"
                            >
                              Disable All
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Buttons Grid/List */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {moduleButtons.map((btn) => {
                          const isBtnAllowed = roleButtons.includes('*') || roleButtons.includes(btn.id);
                          return (
                            <div
                              key={btn.id}
                              className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition ${
                                isBtnAllowed
                                  ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs'
                                  : 'bg-slate-100/60 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 opacity-60'
                              }`}
                            >
                              <div className="space-y-0.5 min-w-0">
                                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">
                                  {btn.label}
                                </span>
                                <span className="text-[10px] font-mono text-slate-400 block truncate">
                                  {btn.id}
                                </span>
                              </div>

                              <Toggle
                                aria-label={btn.label}
                                checked={isBtnAllowed}
                                disabled={!isEditing || isLockedMaster}
                                onChange={(checked) => handleToggleActionButton(btn.id, checked)}
                                size="sm"
                                color="orange"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 italic">
                      No standalone action buttons configured for this view. Access is governed via module navigation.
                    </div>
                  )}

                  {/* 2. Specialized Workflow Controls for Leave Hub */}
                  {hasLeaveWorkflow && (
                    <div className="p-4.5 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/50 to-white dark:from-indigo-950/20 dark:to-slate-900 space-y-4">
                      <div className="flex items-center gap-2">
                        <Palmtree size={18} className="text-indigo-600 dark:text-indigo-400" />
                        <h5 className="text-xs font-extrabold uppercase tracking-wider text-indigo-950 dark:text-indigo-200">
                          Leave Hub Workflow & Approval Governance
                        </h5>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-slate-900 dark:text-white block">Apply for Self</span>
                            <span className="text-[10px] text-slate-400">Personal leave requests</span>
                          </div>
                          <Toggle
                            aria-label="Apply for personal leave"
                            checked={Boolean(wf.canApplyLeaveSelf)}
                            disabled={!isEditing || isLockedMaster}
                            onChange={(val) => handleToggleWorkflow('canApplyLeaveSelf', val)}
                            size="sm"
                            color="indigo"
                          />
                        </div>

                        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-slate-900 dark:text-white block">Apply On-Behalf</span>
                            <span className="text-[10px] text-slate-400">File for students or staff</span>
                          </div>
                          <Toggle
                            aria-label="Apply for leave on behalf of others"
                            checked={Boolean(wf.canApplyLeaveOnBehalf)}
                            disabled={!isEditing || isLockedMaster}
                            onChange={(val) => handleToggleWorkflow('canApplyLeaveOnBehalf', val)}
                            size="sm"
                            color="indigo"
                          />
                        </div>

                        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-slate-900 dark:text-white block">Review & Approve</span>
                            <span className="text-[10px] text-slate-400">Sync with attendance</span>
                          </div>
                          <Toggle
                            aria-label="Approve leave requests"
                            checked={Boolean(wf.canApproveLeaves)}
                            disabled={!isEditing || isLockedMaster}
                            onChange={(val) => handleToggleWorkflow('canApproveLeaves', val)}
                            size="sm"
                            color="indigo"
                          />
                        </div>
                      </div>

                      {wf.canApproveLeaves && (
                        <div className="space-y-2 pt-2 border-t border-indigo-100 dark:border-indigo-900/40">
                          <label className="block text-xs font-extrabold text-indigo-950 dark:text-indigo-200">
                            Approval Jurisdiction Scope:
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                            {[
                              { id: 'class_students', label: 'Class Students Only (Class Teacher)' },
                              { id: 'all_students', label: 'All Students in School' },
                              { id: 'staff_and_teachers', label: 'Faculty & Support Staff' },
                              { id: 'all', label: 'Institutional Master (All)' },
                            ].map((sc) => (
                              <button
                                key={sc.id}
                                type="button"
                                disabled={!isEditing || isLockedMaster}
                                onClick={() => handleToggleWorkflow('leaveApprovalScope', sc.id)}
                                className={`p-2.5 rounded-xl border text-xs font-bold text-left transition ${
                                  wf.leaveApprovalScope === sc.id
                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                                } ${!isEditing ? 'cursor-default' : 'cursor-pointer'}`}
                              >
                                {sc.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 3. Specialized Workflow Controls for Budget Allocation */}
                  {hasBudgetWorkflow && (
                    <div className="p-4.5 rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-gradient-to-br from-amber-50/50 to-white dark:from-amber-950/20 dark:to-slate-900 space-y-4">
                      <div className="flex items-center gap-2">
                        <Wallet size={18} className="text-amber-600 dark:text-amber-400" />
                        <h5 className="text-xs font-extrabold uppercase tracking-wider text-amber-950 dark:text-amber-200">
                          Budget Allocation Isolation & Revisions
                        </h5>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-slate-900 dark:text-white block">View Session Budget</span>
                            <span className="text-[10px] text-slate-400">See expenditure progress & balances</span>
                          </div>
                          <Toggle
                            aria-label="View budget"
                            checked={Boolean(wf.canViewBudget)}
                            disabled={!isEditing || isLockedMaster}
                            onChange={(val) => handleToggleWorkflow('canViewBudget', val)}
                            size="sm"
                            color="orange"
                          />
                        </div>

                        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-slate-900 dark:text-white block">Perform Budget Revisions</span>
                            <span className="text-[10px] text-slate-400">Inject funds or adjust categories</span>
                          </div>
                          <Toggle
                            aria-label="Revise budget"
                            checked={Boolean(wf.canReviseBudget)}
                            disabled={!isEditing || isLockedMaster}
                            onChange={(val) => handleToggleWorkflow('canReviseBudget', val)}
                            size="sm"
                            color="orange"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Confirm Reset Dialog ─────────────────────────────────────────── */}
      {confirmResetRole && (
        <ConfirmDialog
          isOpen={Boolean(confirmResetRole)}
          title="Reset Role Permissions to Factory Default?"
          message={`Are you sure you want to restore default permissions for '${currentRoleCfg.label}'? All custom module visibility, action buttons, and approval workflows will be restored.`}
          confirmText="Yes, Reset to Defaults"
          confirmVariant="danger"
          onConfirm={handleResetToDefault}
          onClose={() => setConfirmResetRole(null)}
        />
      )}
    </div>
  );
};

export default RoleAndAccessSettings;
