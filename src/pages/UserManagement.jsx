import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Users,
  UserPlus,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Search,
  RefreshCw,
  MoreVertical,
  CheckCircle2,
  XCircle,
  KeyRound,
  Trash2,
  Edit,
  Eye,
  Lock,
  GraduationCap,
  BookOpen,
  Wallet,
  Library,
  Briefcase,
  Award,
  Calendar,
  UserCheck,
  User,
  Copy,
  Check,
  Sparkles,
  Phone,
  Building,
  ArrowRight
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { userService } from '../services/userService.js';
import Loader from '../components/ui/Loader.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import Modal from '../components/ui/Modal.jsx';
import { ROUTES } from '../routes/routes.js';

// Role Badge & Color Mapping (Excludes students and parents)
const ROLE_CONFIG = {
  'super-admin': {
    label: 'Super Admin (Director)',
    badge: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800/60',
    avatarBg: 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white',
    icon: ShieldAlert,
    ring: 'ring-purple-400/40',
  },
  'school-admin': {
    label: 'Admin',
    badge: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800/60',
    avatarBg: 'bg-gradient-to-br from-indigo-500 to-blue-600 text-white',
    icon: ShieldCheck,
    ring: 'ring-indigo-400/40',
  },
  'principal': {
    label: 'Principal',
    badge: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/60',
    avatarBg: 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white',
    icon: GraduationCap,
    ring: 'ring-blue-400/40',
  },
  'teacher': {
    label: 'Teacher',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60',
    avatarBg: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white',
    icon: BookOpen,
    ring: 'ring-emerald-400/40',
  },
  'accountant': {
    label: 'Accountant',
    badge: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60',
    avatarBg: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white',
    icon: Wallet,
    ring: 'ring-amber-400/40',
  },
  'librarian': {
    label: 'Librarian',
    badge: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/60',
    avatarBg: 'bg-gradient-to-br from-rose-500 to-pink-600 text-white',
    icon: Library,
    ring: 'ring-rose-400/40',
  },
  'peon': {
    label: 'Peon / Support Staff',
    badge: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800/60',
    avatarBg: 'bg-gradient-to-br from-orange-500 to-amber-600 text-white',
    icon: UserCheck,
    ring: 'ring-orange-400/40',
  },
};

const DEFAULT_ROLE_CONFIG = {
  label: 'Staff Member',
  badge: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  avatarBg: 'bg-gradient-to-br from-slate-500 to-slate-700 text-white',
  icon: User,
  ring: 'ring-slate-400/40',
};

// Initial state for user creation (NO super-admin, NO student)
const initialFormData = {
  name: '',
  username: '',
  email: '',
  password: '',
  role: 'teacher',
  employeeId: '',
  phone: '',
  designation: '',
  department: '',
  qualification: '',
  gender: '',
  salary: '',
  isActive: true,
  isClassTeacher: false,
  classTeacherOf: '',
};

const generateSecurePassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
  let password = '';
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

const UserManagement = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useSelector((state) => state.auth);

  // Data state
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & UI state
  const [search, setSearch] = useState('');
  const [selectedRoleTab, setSelectedRoleTab] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [copiedId, setCopiedId] = useState(null);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResetPwdModal, setShowResetPwdModal] = useState(false);
  const [showRolesDirectory, setShowRolesDirectory] = useState(false);

  // Active item in action
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [newPassword, setNewPassword] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editStatus, setEditStatus] = useState(true);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Confirm dialogs
  const [confirmStatusChange, setConfirmStatusChange] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Load users and roles (excluding students and parents)
  const loadData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const [usersRes, rolesRes] = await Promise.all([
        userService.getUsers({ limit: 100 }),
        userService.getRoles(),
      ]);

      if (usersRes.success) {
        // Double check no students or parents slip through
        const staffOnly = (usersRes.users || []).filter(
          (u) => !['student', 'parent'].includes((u.role || '').toLowerCase())
        );
        setUsers(staffOnly);
      }

      if (rolesRes.success) {
        setRoles(rolesRes.roles || []);
      }
    } catch (err) {
      console.error('Failed to load user management data:', err);
      toast.error(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered users list
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Exclude students
      if (['student', 'parent'].includes((u.role || '').toLowerCase())) return false;

      // Search term
      const query = search.toLowerCase().trim();
      const matchesSearch =
        !query ||
        [u.name, u.username, u.email, u.employeeId, u.phone, u.designation, u.department, u.role]
          .filter(Boolean)
          .some((val) => val.toLowerCase().includes(query));

      // Role tab
      const userRole = (u.role || '').toLowerCase();
      let matchesRole = true;
      if (selectedRoleTab === 'super-admin') {
        matchesRole = userRole === 'super-admin';
      } else if (selectedRoleTab === 'admin') {
        matchesRole = userRole === 'school-admin' || userRole === 'admin';
      } else if (selectedRoleTab === 'principal') {
        matchesRole = userRole === 'principal';
      } else if (selectedRoleTab === 'teacher') {
        matchesRole = userRole === 'teacher';
      } else if (selectedRoleTab === 'class-teacher') {
        matchesRole = userRole === 'teacher' && Boolean(u.isClassTeacher);
      } else if (selectedRoleTab === 'accountant') {
        matchesRole = userRole === 'accountant';
      } else if (selectedRoleTab === 'librarian') {
        matchesRole = userRole === 'librarian';
      } else if (selectedRoleTab === 'peon') {
        matchesRole = userRole === 'peon';
      } else if (selectedRoleTab !== 'all') {
        matchesRole = userRole === selectedRoleTab.toLowerCase();
      }

      // Status filter
      let matchesStatus = true;
      if (statusFilter === 'active') matchesStatus = u.isActive === true;
      if (statusFilter === 'inactive') matchesStatus = u.isActive === false;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, selectedRoleTab, statusFilter]);

  // Statistics across company staff
  const stats = useMemo(() => {
    const total = users.length;
    const superAdminCount = users.filter((u) => (u.role || '').toLowerCase() === 'super-admin').length;
    const adminCount = users.filter((u) => ['school-admin', 'admin'].includes((u.role || '').toLowerCase())).length;
    const principalCount = users.filter((u) => (u.role || '').toLowerCase() === 'principal').length;
    const teacherCount = users.filter((u) => (u.role || '').toLowerCase() === 'teacher').length;
    const classTeacherCount = users.filter((u) => (u.role || '').toLowerCase() === 'teacher' && Boolean(u.isClassTeacher)).length;
    const accountantCount = users.filter((u) => (u.role || '').toLowerCase() === 'accountant').length;
    const librarianCount = users.filter((u) => (u.role || '').toLowerCase() === 'librarian').length;
    const peonCount = users.filter((u) => (u.role || '').toLowerCase() === 'peon').length;
    const activeCount = users.filter((u) => u.isActive).length;

    return {
      total,
      superAdminCount,
      adminCount,
      principalCount,
      teacherCount,
      classTeacherCount,
      accountantCount,
      librarianCount,
      peonCount,
      activeCount,
      activeRate: total > 0 ? Math.round((activeCount / total) * 100) : 100,
    };
  }, [users]);

  // Handle Create User Submit (Super Admin blocked)
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.username || !formData.email || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.role === 'super-admin') {
      toast.error('Super Admin accounts cannot be created here. Please select School Admin or another role.');
      return;
    }

    try {
      setFormSubmitting(true);
      const res = await userService.createUser(formData);
      if (res.success) {
        toast.success(res.message || 'User created successfully!');
        setShowCreateModal(false);
        setFormData(initialFormData);
        loadData(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle Credentials (Email & Password) Update Submit
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      setFormSubmitting(true);
      const updates = {};
      if (editEmail && editEmail.trim() && editEmail.trim() !== selectedUser.email) {
        updates.email = editEmail.trim();
      }
      if (
        editStatus !== selectedUser.isActive &&
        (selectedUser.role || '').toLowerCase() !== 'super-admin'
      ) {
        updates.isActive = editStatus;
      }

      if (Object.keys(updates).length > 0) {
        await userService.updateUser(selectedUser.id || selectedUser._id, updates);
      }

      if (newPassword && newPassword.trim()) {
        await userService.resetPassword(
          selectedUser.id || selectedUser._id,
          newPassword,
          true
        );
      }

      toast.success(`Credentials & access updated for ${selectedUser.name}!`);
      setShowResetPwdModal(false);
      setNewPassword('');
      setEditEmail('');
      setSelectedUser(null);
      loadData(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update credentials');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle Status Toggle
  const handleToggleStatus = async () => {
    if (!confirmStatusChange) return;
    try {
      const res = await userService.toggleStatus(confirmStatusChange.id || confirmStatusChange._id);
      if (res.success) {
        toast.success(res.message || 'User status updated');
        setConfirmStatusChange(null);
        loadData(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  // Handle Delete User
  const handleDeleteUser = async () => {
    if (!confirmDelete) return;
    try {
      const res = await userService.deleteUser(confirmDelete.id || confirmDelete._id);
      if (res.success) {
        toast.success(res.message || 'User deleted successfully');
        setConfirmDelete(null);
        loadData(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  // Copy helper
  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Open Reset Credentials Modal
  const openResetPwdModal = (user) => {
    setSelectedUser(user);
    setEditEmail(user.email || '');
    setEditStatus(user.isActive !== false);
    setNewPassword(generateSecurePassword());
    setShowResetPwdModal(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
              <Shield className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Company User Management
            </h1>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300/40">
              Admin Exclusive
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Manage company staff, leadership, faculty, support staff, credentials, and class teacher duties. (Students excluded)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowRolesDirectory(true)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/70"
          >
            <Sparkles className="h-4 w-4 text-indigo-500" />
            <span>Roles Directory ({roles.length})</span>
          </button>

          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700/70"
            title="Refresh Data"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-indigo-600' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => {
              setFormData({ ...initialFormData, password: generateSecurePassword() });
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-700 active:scale-95"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add New Staff</span>
          </button>
        </div>
      </div>



      {/* ── Quick Role Filter Tabs ───────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm dark:border-slate-800 dark:bg-[#0f172a]">
        {[
          { id: 'all', label: 'All Staff', count: stats.total },
          { id: 'super-admin', label: 'Super Admin (Director)', count: stats.superAdminCount },
          { id: 'admin', label: 'Admins', count: stats.adminCount },
          { id: 'principal', label: 'Principal (1 Only)', count: stats.principalCount },
          { id: 'teacher', label: 'Teachers', count: stats.teacherCount },
          { id: 'class-teacher', label: 'Class Teachers', count: stats.classTeacherCount },
          { id: 'accountant', label: 'Accountants', count: stats.accountantCount },
          { id: 'librarian', label: 'Librarians', count: stats.librarianCount },
          { id: 'peon', label: 'Peons & Support', count: stats.peonCount },
        ].map((tab) => {
          const isActive = selectedRoleTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedRoleTab(tab.id)}
              className={`flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Filters & Search Toolbar ────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search staff by name, email, username, phone, employee ID..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs text-slate-800 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-[#0f172a] dark:text-slate-200"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-[#0f172a] dark:text-slate-300"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Showing <strong className="text-slate-900 dark:text-white">{filteredUsers.length}</strong> of{' '}
            {users.length} staff
          </span>
        </div>
      </div>

      {/* ── Content View (Table or Grid) ────────────────────────────────────── */}
      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#0f172a]">
          <Loader />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center dark:border-slate-800 dark:bg-[#0f172a]">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-400">
            <Users className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">No Staff Members Found</h3>
          <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
            {search || selectedRoleTab !== 'all' || statusFilter !== 'all'
              ? 'No staff match your active filter criteria.'
              : 'There are no company staff registered yet.'}
          </p>
        </div>
      ) : (
        /* ── TABLE VIEW ──────────────────────────────────────────────────────── */
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#0f172a]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800/80 dark:bg-slate-800/50 dark:text-slate-400">
                <tr>
                  <th className="px-5 py-3.5">Staff User</th>
                  <th className="px-4 py-3.5">Assigned Role</th>
                  <th className="px-4 py-3.5">Email Address</th>
                  <th className="px-4 py-3.5">Account Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {filteredUsers.map((u) => {
                  const roleKey = (u.role || '').toLowerCase();
                  const roleCfg = ROLE_CONFIG[roleKey] || DEFAULT_ROLE_CONFIG;
                  const RoleIcon = roleCfg.icon;
                  const isCurrent = (currentUser?.id || currentUser?._id) === (u.id || u._id);

                  return (
                    <tr
                      key={u.id || u._id}
                      className={`transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40 ${
                        !u.isActive ? 'bg-slate-50/50 opacity-70 dark:bg-slate-900/40' : ''
                      }`}
                    >
                      {/* User Info */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl font-bold shadow-sm ring-2 ${roleCfg.ring} ${roleCfg.avatarBg}`}
                          >
                            {(u.name || u.username || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <Link
                                to={`/user-management/${u.id || u._id}`}
                                className="truncate font-bold text-slate-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400"
                              >
                                {u.name || u.username}
                              </Link>
                              {isCurrent && (
                                <span className="rounded-md bg-indigo-50 px-1.5 py-0.2 text-[9px] font-extrabold text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                                  YOU
                                </span>
                              )}
                            </div>
                            <span className="truncate text-[11px] text-slate-400">
                              @{u.username} {u.employeeId && `• ID: ${u.employeeId}`}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="px-4 py-3.5">
                        {roleKey === 'teacher' && u.isClassTeacher ? (
                          <div className="flex flex-col gap-1 items-start">
                            <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-800 shadow-xs dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                              <GraduationCap className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                              <span>Class Teacher</span>
                            </span>
                            <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 pl-0.5">
                              {u.classTeacherOf || 'Class Assigned'}
                            </span>
                          </div>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-bold shadow-xs ${roleCfg.badge}`}
                          >
                            <RoleIcon className="h-3.5 w-3.5" />
                            <span>{roleCfg.label}</span>
                          </span>
                        )}
                      </td>

                      {/* Email Address */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 text-xs font-mono text-slate-600 dark:text-slate-300">
                          <span className="truncate max-w-[200px]">{u.email}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(u.email, `email-${u.id || u._id}`)}
                            className="rounded p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                            title="Copy email"
                          >
                            {copiedId === `email-${u.id || u._id}` ? (
                              <Check className="h-3 w-3 text-emerald-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <button
                          type="button"
                          disabled={isCurrent || roleKey === 'super-admin'}
                          onClick={() => setConfirmStatusChange(u)}
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold transition shadow-xs ${
                            u.isActive
                              ? 'border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : 'border border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
                          } ${isCurrent || roleKey === 'super-admin' ? 'cursor-not-allowed opacity-75' : 'cursor-pointer active:scale-95'}`}
                          title={
                            roleKey === 'super-admin'
                              ? 'Super Admin (Director) account cannot be deactivated'
                              : isCurrent
                              ? 'Cannot deactivate self'
                              : u.isActive
                              ? 'Click to disable user (cannot login)'
                              : 'Click to enable user login'
                          }
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${
                              u.isActive ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          <span>{u.isActive ? 'Active' : 'Disabled (Cannot Login)'}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/user-management/${u.id || u._id}`}
                            className="flex items-center gap-1.5 rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300"
                            title="View Full Profile Details"
                          >
                            <span>Details</span>
                            <ArrowRight className="h-3 w-3" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => openResetPwdModal(u)}
                            className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-amber-950/40"
                            title="Manage Email & Password"
                          >
                            <KeyRound className="h-3.5 w-3.5 text-amber-500" />
                            <span>Security</span>
                          </button>

                          {!isCurrent && roleKey !== 'super-admin' && (
                            <button
                              type="button"
                              onClick={() => setConfirmDelete(u)}
                              className="rounded-xl p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                              title="Delete User"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── CREATE USER MODAL (NO super-admin, NO student) ──────────────────── */}
      <Modal
        open={showCreateModal}
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add New Company Staff User"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Create staff credentials and personal details. Super Admin and Student accounts cannot be created here.
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Eleanor Vance"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Username *
              </label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="e.g. evance"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. evance@school.edu"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Primary Phone
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g. +1 555-0199"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Assigned Role *
              </label>
              <select
                required
                value={
                  formData.role === 'teacher'
                    ? formData.isClassTeacher
                      ? 'class-teacher'
                      : 'teacher'
                    : formData.role
                }
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'class-teacher') {
                    setFormData({
                      ...formData,
                      role: 'teacher',
                      isClassTeacher: true,
                      designation: formData.designation || 'Class Teacher',
                    });
                  } else if (val === 'teacher') {
                    setFormData({
                      ...formData,
                      role: 'teacher',
                      isClassTeacher: false,
                      designation: formData.designation === 'Class Teacher' ? '' : formData.designation,
                    });
                  } else {
                    setFormData({
                      ...formData,
                      role: val,
                      isClassTeacher: false,
                      classTeacherOf: '',
                    });
                  }
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="school-admin">Admin (Multiple)</option>
                <option value="principal" disabled={stats.principalCount >= 1}>
                  Principal {stats.principalCount >= 1 ? '— (1 Only, Already Assigned)' : '— (Strictly 1 in School)'}
                </option>
                <option value="teacher">Teacher (Subject Teacher)</option>
                <option value="class-teacher">Class Teacher (Teacher with class assignment)</option>
                <option value="accountant">Accountant (Multiple)</option>
                <option value="librarian">Librarian (Multiple)</option>
                <option value="peon">Peon / Support Staff (Multiple)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Employee ID
              </label>
              <input
                type="text"
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                placeholder="e.g. EMP201"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          {formData.role === 'teacher' && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3.5 dark:border-emerald-900/40 dark:bg-emerald-950/20">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Assign as Class Teacher?
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Designate this teacher as the primary class teacher.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(formData.isClassTeacher)}
                  onChange={(e) => setFormData({ ...formData, isClassTeacher: e.target.checked })}
                  className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
              </div>

              {formData.isClassTeacher && (
                <div className="mt-3">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Class & Section (e.g. Class 10 - Section A) *
                  </label>
                  <input
                    type="text"
                    value={formData.classTeacherOf || ''}
                    onChange={(e) => setFormData({ ...formData, classTeacherOf: e.target.value })}
                    placeholder="e.g. Class 10 - Section A"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  />
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Designation
              </label>
              <input
                type="text"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                placeholder="e.g. Senior Professor / Caretaker"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Department
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="e.g. Science / Operations"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Initial Password *
              </label>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, password: generateSecurePassword() })}
                className="text-[11px] font-bold text-indigo-600 hover:underline dark:text-indigo-400"
              >
                Auto-Generate Strong Password
              </button>
            </div>
            <input
              type="text"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Active Account</span>
              <p className="text-[11px] text-slate-400">User will be able to log in immediately</p>
            </div>
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formSubmitting}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/30 transition hover:bg-indigo-700 disabled:opacity-50"
            >
              {formSubmitting ? 'Creating...' : 'Create Staff User'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── USER CREDENTIALS & SECURITY MODAL ────────────────────────────── */}
      <Modal
        open={showResetPwdModal}
        isOpen={showResetPwdModal}
        onClose={() => setShowResetPwdModal(false)}
        title="Manage User Credentials & Access"
      >
        <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-indigo-100 bg-indigo-50/60 p-3 text-xs dark:border-indigo-900/40 dark:bg-indigo-950/30">
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200">
                {selectedUser?.name}{' '}
                <span className="font-normal text-slate-500">(@{selectedUser?.username})</span>
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Role: <strong className="capitalize font-semibold">{selectedUser?.role}</strong>
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const creds = `Username: ${selectedUser?.username}\nEmail: ${editEmail}\nPassword: ${newPassword}`;
                navigator.clipboard.writeText(creds);
                toast.success('Credentials copied to clipboard!');
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-xs font-bold text-indigo-600 shadow-xs hover:bg-indigo-50 dark:bg-slate-800 dark:text-indigo-400"
              title="Copy username, email, and password"
            >
              <Copy className="h-3.5 w-3.5" />
              <span>Copy Credentials</span>
            </button>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                New Password *
              </label>
              <button
                type="button"
                onClick={() => setNewPassword(generateSecurePassword())}
                className="text-[11px] font-bold text-indigo-600 hover:underline dark:text-indigo-400"
              >
                Auto-Generate Strong Password
              </button>
            </div>
            <input
              type="text"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            />
          </div>

          {/* Enable / Disable User Account */}
          {(selectedUser?.role || '').toLowerCase() !== 'super-admin' && (
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Account Status
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {editStatus
                      ? 'User is active and able to log in to all assigned portals.'
                      : 'User is disabled. They will be immediately blocked from logging in.'}
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={editStatus}
                    onChange={(e) => setEditStatus(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-600 peer-checked:after:translate-x-full peer-checked:after:border-white dark:border-slate-700 dark:bg-slate-700"></div>
                </label>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowResetPwdModal(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formSubmitting}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/30 transition hover:bg-indigo-700 disabled:opacity-50"
            >
              {formSubmitting ? 'Saving...' : 'Save Credentials & Access'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── ROLES DIRECTORY MODAL ───────────────────────────────────────────── */}
      <Modal
        open={showRolesDirectory}
        isOpen={showRolesDirectory}
        onClose={() => setShowRolesDirectory(false)}
        title="System Roles & Staff Hierarchy"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Overview of company staff and leadership roles available in the institution.
          </p>

          <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
            {roles.map((r) => {
              const cfg = ROLE_CONFIG[r.id] || DEFAULT_ROLE_CONFIG;
              const Icon = cfg.icon;

              return (
                <div
                  key={r.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#0f172a]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-xs ${cfg.avatarBg}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 dark:text-white">{r.name}</h4>
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            {r.category}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{r.description}</p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="block text-lg font-black text-indigo-600 dark:text-indigo-400">
                        {r.userCount}
                      </span>
                      <span className="text-[10px] text-slate-400">staff</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setShowRolesDirectory(false)}
              className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* ── CONFIRM STATUS TOGGLE DIALOG ────────────────────────────────────── */}
      <ConfirmDialog
        isOpen={Boolean(confirmStatusChange)}
        title={confirmStatusChange?.isActive ? 'Deactivate Staff Account?' : 'Activate Staff Account?'}
        message={
          confirmStatusChange?.isActive
            ? `Are you sure you want to deactivate ${confirmStatusChange?.name}? They will immediately lose access to the system.`
            : `Are you sure you want to activate ${confirmStatusChange?.name}? They will be able to log in.`
        }
        confirmText={confirmStatusChange?.isActive ? 'Deactivate' : 'Activate'}
        type={confirmStatusChange?.isActive ? 'warning' : 'primary'}
        onConfirm={handleToggleStatus}
        onCancel={() => setConfirmStatusChange(null)}
      />

      {/* ── CONFIRM DELETE USER DIALOG ──────────────────────────────────────── */}
      <ConfirmDialog
        isOpen={Boolean(confirmDelete)}
        title="Delete Staff Account"
        message={`Are you sure you want to permanently delete "${confirmDelete?.name}" (@${confirmDelete?.username})? This action cannot be undone.`}
        confirmText="Delete Permanently"
        type="danger"
        onConfirm={handleDeleteUser}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
};

export default UserManagement;
