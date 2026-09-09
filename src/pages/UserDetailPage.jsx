import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  ArrowLeft,
  Shield,
  ShieldAlert,
  ShieldCheck,
  GraduationCap,
  BookOpen,
  Briefcase,
  Award,
  Calendar,
  Wallet,
  Library,
  UserCheck,
  User,
  Phone,
  Mail,
  MapPin,
  Building,
  KeyRound,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Sparkles,
  BookMarked,
  School,
  Clock,
  Lock,
  Layers,
  Save,
  Plus,
  X,
  AlertTriangle
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { userService } from '../services/userService.js';
import Loader from '../components/ui/Loader.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import Modal from '../components/ui/Modal.jsx';
import { ROUTES } from '../routes/routes.js';

const ROLE_CONFIG = {
  'super-admin': {
    label: 'Super Admin (Director)',
    badge: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800',
    avatarBg: 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white',
    icon: ShieldAlert,
    ring: 'ring-purple-400/40',
  },
  'school-admin': {
    label: 'Admin',
    badge: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800',
    avatarBg: 'bg-gradient-to-br from-indigo-500 to-blue-600 text-white',
    icon: ShieldCheck,
    ring: 'ring-indigo-400/40',
  },
  'principal': {
    label: 'Principal',
    badge: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 border-blue-800',
    avatarBg: 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white',
    icon: GraduationCap,
    ring: 'ring-blue-400/40',
  },
  'teacher': {
    label: 'Teacher',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-800',
    avatarBg: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white',
    icon: BookOpen,
    ring: 'ring-emerald-400/40',
  },
  'accountant': {
    label: 'Accountant',
    badge: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 border-amber-800',
    avatarBg: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white',
    icon: Wallet,
    ring: 'ring-amber-400/40',
  },
  'librarian': {
    label: 'Librarian',
    badge: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 border-rose-800',
    avatarBg: 'bg-gradient-to-br from-rose-500 to-pink-600 text-white',
    icon: Library,
    ring: 'ring-rose-400/40',
  },
  'peon': {
    label: 'Peon / Support Staff',
    badge: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950/60 dark:text-orange-300 border-orange-800',
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

const PROMOTION_ROLES = [
  { id: 'school-admin', label: 'Admin', icon: ShieldCheck, desc: 'Grant School Operations Admin Access' },
  { id: 'principal', label: 'Principal', icon: GraduationCap, desc: 'Designate as Institutional Head (Strictly 1 in school)' },
  { id: 'teacher', label: 'Teacher', icon: BookOpen, desc: 'Assign as Faculty / Subject Teacher & manage Class Teacher duties' },
  { id: 'accountant', label: 'Accountant', icon: Wallet, desc: 'Assign to Accounts, Fees & Financial Ledgers' },
  { id: 'librarian', label: 'Librarian', icon: Library, desc: 'Assign to Central Library & Book Cataloging' },
  { id: 'peon', label: 'Peon / Support Staff', icon: UserCheck, desc: 'Assign as Campus Support Staff & Logistics' },
];

const AVAILABLE_CLASSES = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
const AVAILABLE_SECTIONS = ['Section A', 'Section B', 'Section C', 'Section D'];
const AVAILABLE_SUBJECTS = ['Mathematics', 'Science', 'English', 'Social Studies', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Hindi', 'History', 'Physical Education'];

const UserDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useSelector((state) => state.auth);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personal'); // 'personal' | 'academic' | 'role' | 'security'

  // Modals & form state
  const [showEditPersonalModal, setShowEditPersonalModal] = useState(false);
  const [showResetPwdModal, setShowResetPwdModal] = useState(false);
  const [confirmStatusToggle, setConfirmStatusToggle] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [saving, setSaving] = useState(false);

  const [editForm, setEditForm] = useState({});
  const [selectedRole, setSelectedRole] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [editEmail, setEditEmail] = useState('');

  // Academic / Class Teacher state
  const [academicState, setAcademicState] = useState({
    isClassTeacher: false,
    classTeacherOf: '',
    classesAssigned: [],
    sectionsAssigned: [],
    subjectsAssigned: [],
  });
  const [newCustomSubject, setNewCustomSubject] = useState('');

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const res = await userService.getUserById(id);
      if (res.success && res.user) {
        setUser(res.user);
        setSelectedRole(res.user.role || 'teacher');
        setEditEmail(res.user.email || '');
        setEditForm({
          name: res.user.name || '',
          email: res.user.email || '',
          phone: res.user.phone || '',
          alternatePhone: res.user.alternatePhone || '',
          gender: res.user.gender || '',
          dob: res.user.dob ? new Date(res.user.dob).toISOString().slice(0, 10) : '',
          address: res.user.address || '',
          qualification: res.user.qualification || '',
          designation: res.user.designation || '',
          department: res.user.department || '',
          joiningDate: res.user.joiningDate ? new Date(res.user.joiningDate).toISOString().slice(0, 10) : '',
          salary: res.user.salary || '',
          employeeId: res.user.employeeId || '',
        });
        setAcademicState({
          isClassTeacher: Boolean(res.user.isClassTeacher),
          classTeacherOf: res.user.classTeacherOf || '',
          classesAssigned: res.user.classesAssigned || [],
          sectionsAssigned: res.user.sectionsAssigned || [],
          subjectsAssigned: res.user.subjectsAssigned || [],
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load user details');
      navigate(ROUTES.USER_MANAGEMENT);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const roleCfg = ROLE_CONFIG[(user?.role || '').toLowerCase()] || DEFAULT_ROLE_CONFIG;
  const RoleIcon = roleCfg.icon;
  const isCurrentLoggedIn = (currentUser?.id || currentUser?._id) === (user?.id || user?._id);

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const safeDateStr = (val) => {
    if (!val) return '';
    try {
      const d = new Date(val);
      return isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
    } catch {
      return '';
    }
  };

  const openEditPersonalModal = () => {
    if (!user) return;
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      alternatePhone: user.alternatePhone || '',
      gender: user.gender || '',
      dob: safeDateStr(user.dob),
      address: user.address || '',
      qualification: user.qualification || '',
      designation: user.designation || '',
      department: user.department || '',
      joiningDate: safeDateStr(user.joiningDate),
      salary: user.salary || '',
      employeeId: user.employeeId || '',
    });
    setShowEditPersonalModal(true);
  };

  const handleSavePersonal = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await userService.updateUser(user.id || user._id, editForm);
      if (res.success) {
        toast.success('Personal details updated successfully!');
        setShowEditPersonalModal(false);
        fetchUserDetails();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update personal details');
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = async (targetRole) => {
    try {
      setSaving(true);
      const res = await userService.updateUser(user.id || user._id, { role: targetRole });
      if (res.success) {
        toast.success(`User role successfully changed to ${targetRole}!`);
        fetchUserDetails();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user role');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAcademic = async () => {
    try {
      setSaving(true);
      const res = await userService.updateUser(user.id || user._id, {
        isClassTeacher: academicState.isClassTeacher,
        classTeacherOf: academicState.classTeacherOf,
        classesAssigned: academicState.classesAssigned,
        sectionsAssigned: academicState.sectionsAssigned,
        subjectsAssigned: academicState.subjectsAssigned,
      });
      if (res.success) {
        toast.success('Academic and Class Teacher duties saved successfully!');
        fetchUserDetails();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update academic assignments');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      const res = await userService.toggleStatus(user.id || user._id);
      if (res.success) {
        toast.success(res.message || 'Status updated');
        setConfirmStatusToggle(false);
        fetchUserDetails();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editEmail && editEmail.trim() && editEmail.trim() !== user.email) {
        await userService.updateUser(user.id || user._id, { email: editEmail.trim() });
      }
      if (newPassword && newPassword.trim()) {
        if (newPassword.length < 4) {
          toast.error('Password must be at least 4 characters');
          setSaving(false);
          return;
        }
        await userService.resetPassword(user.id || user._id, newPassword, true);
      }
      toast.success('Credentials updated successfully!');
      setShowResetPwdModal(false);
      setNewPassword('');
      fetchUserDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update credentials');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    try {
      const res = await userService.deleteUser(user.id || user._id);
      if (res.success) {
        toast.success('User deleted successfully');
        navigate(ROUTES.USER_MANAGEMENT);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  // Helper to toggle items in array
  const toggleArrayItem = (key, item) => {
    setAcademicState((prev) => {
      const list = prev[key] || [];
      const exists = list.includes(item);
      return {
        ...prev,
        [key]: exists ? list.filter((i) => i !== item) : [...list, item],
      };
    });
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500">User not found.</p>
        <Link to={ROUTES.USER_MANAGEMENT} className="mt-4 inline-block font-bold text-indigo-600">
          Back to User Management
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      {/* ── Breadcrumb & Back Button ────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(ROUTES.USER_MANAGEMENT)}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-indigo-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Users Directory</span>
        </button>
        <span className="text-xs text-slate-400">/</span>
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">User Profile Details</span>
      </div>

      {/* ── Deactivation Alert Banner ────────────────────────────────────────── */}
      {!user.isActive && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-rose-300 bg-rose-50 p-4 text-xs dark:border-rose-900/60 dark:bg-rose-950/40">
          <div className="flex items-center gap-3">
            <XCircle className="h-6 w-6 flex-shrink-0 text-rose-600 dark:text-rose-400" />
            <div>
              <h4 className="font-extrabold text-sm text-rose-900 dark:text-rose-200">
                Account Deactivated (Cannot Login)
              </h4>
              <p className="mt-0.5 text-xs text-rose-700 dark:text-rose-300">
                This staff user is currently disabled by administrative governance. They cannot log in or access any school systems.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setConfirmStatusToggle(true)}
            className="self-start sm:self-auto rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-rose-700 active:scale-95"
          >
            Re-enable Account
          </button>
        </div>
      )}

      {/* ── Profile Header Banner ───────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#0f172a]">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div
              className={`flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl text-2xl font-black shadow-lg ring-4 ${roleCfg.ring} ${roleCfg.avatarBg}`}
            >
              {(user.name || user.username || 'U').charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                  {user.name}
                </h1>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1 text-xs font-bold shadow-xs ${roleCfg.badge}`}
                >
                  <RoleIcon className="h-4 w-4" />
                  <span>{roleCfg.label}</span>
                </span>
                {user.isClassTeacher && (
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                    <GraduationCap className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Class Teacher {user.classTeacherOf ? `(${user.classTeacherOf})` : ''}</span>
                  </span>
                )}
                {isCurrentLoggedIn && (
                  <span className="rounded-lg bg-indigo-100 px-2 py-0.5 text-[10px] font-black text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    CURRENT ADMIN
                  </span>
                )}
              </div>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                @{user.username} {user.employeeId && `• Employee ID: ${user.employeeId}`}{' '}
                {user.designation && `• ${user.designation}`}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  <span>{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    <span>{user.phone}</span>
                  </div>
                )}
                {user.department && (
                  <div className="flex items-center gap-1.5">
                    <Building className="h-3.5 w-3.5 text-slate-400" />
                    <span>{user.department}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <button
              type="button"
              disabled={isCurrentLoggedIn || (user.role || '').toLowerCase() === 'super-admin'}
              onClick={() => setConfirmStatusToggle(true)}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                user.isActive
                  ? 'border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'border border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
              } ${isCurrentLoggedIn || (user.role || '').toLowerCase() === 'super-admin' ? 'cursor-not-allowed opacity-75' : ''}`}
              title={(user.role || '').toLowerCase() === 'super-admin' ? 'Super Admin (Director) account cannot be deactivated' : ''}
            >
              {user.isActive ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              <span>{user.isActive ? 'Active Account' : 'Deactivated'}</span>
            </button>

            <button
              type="button"
              onClick={openEditPersonalModal}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <Edit className="h-3.5 w-3.5 text-indigo-500" />
              <span>Edit Details</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setNewPassword('');
                setShowResetPwdModal(true);
              }}
              className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-800 transition hover:bg-amber-100 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300"
            >
              <KeyRound className="h-3.5 w-3.5" />
              <span>Reset Password</span>
            </button>

            {!isCurrentLoggedIn && (user.role || '').toLowerCase() !== 'super-admin' && (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300"
                title="Delete User"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* ── Navigation Tabs ───────────────────────────────────────────────── */}
        <div className="mt-6 flex gap-2 border-t border-slate-100 pt-4 dark:border-slate-800/80 overflow-x-auto">
          {[
            { id: 'personal', label: 'Personal & Employment', icon: User },
            { id: 'academic', label: 'Teacher & Class Duties', icon: BookOpen },
            { id: 'role', label: 'Role & Promotion', icon: Sparkles },
            { id: 'security', label: 'Credentials & Security', icon: Lock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-xs font-bold transition ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── TAB 1: PERSONAL & EMPLOYMENT DETAILS ────────────────────────────── */}
      {activeTab === 'personal' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#0f172a]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Personal Information
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={openEditPersonalModal}
                  className="text-xs font-bold text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  Edit Information
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Full Name</span>
                  <p className="mt-0.5 font-bold text-slate-900 dark:text-white">{user.name}</p>
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Username</span>
                  <p className="mt-0.5 font-mono text-slate-700 dark:text-slate-300">@{user.username}</p>
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Email Address</span>
                  <div className="mt-0.5 flex items-center gap-2 font-medium text-slate-800 dark:text-slate-200">
                    <span>{user.email}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(user.email, 'email')}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      {copiedField === 'email' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Primary Phone</span>
                  <p className="mt-0.5 font-medium text-slate-800 dark:text-slate-200">{user.phone || 'Not provided'}</p>
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Alternate Phone</span>
                  <p className="mt-0.5 font-medium text-slate-800 dark:text-slate-200">{user.alternatePhone || 'Not provided'}</p>
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Gender</span>
                  <p className="mt-0.5 font-medium text-slate-800 dark:text-slate-200">{user.gender || 'Not specified'}</p>
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Date of Birth</span>
                  <p className="mt-0.5 font-medium text-slate-800 dark:text-slate-200">
                    {user.dob ? new Date(user.dob).toLocaleDateString() : 'Not provided'}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Residential Address</span>
                  <p className="mt-0.5 font-medium text-slate-800 dark:text-slate-200">{user.address || 'Not provided'}</p>
                </div>
              </div>
            </div>

            {/* Employment Details */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#0f172a]">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-4 dark:border-slate-800">
                <Building className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Employment & Institutional Record
                </h3>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Employee ID</span>
                  <p className="mt-0.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">{user.employeeId || 'None'}</p>
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Official Designation</span>
                  <p className="mt-0.5 font-bold text-slate-800 dark:text-slate-200">{user.designation || 'Staff Member'}</p>
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Department</span>
                  <p className="mt-0.5 font-bold text-slate-800 dark:text-slate-200">{user.department || 'General Administration'}</p>
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Highest Qualification</span>
                  <p className="mt-0.5 font-bold text-slate-800 dark:text-slate-200">{user.qualification || 'Not specified'}</p>
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Joining Date</span>
                  <p className="mt-0.5 font-medium text-slate-800 dark:text-slate-200">
                    {user.joiningDate ? new Date(user.joiningDate).toLocaleDateString() : 'Not provided'}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Monthly Compensation</span>
                  <p className="mt-0.5 font-bold text-emerald-600 dark:text-emerald-400">
                    {user.salary ? `$${Number(user.salary).toLocaleString()}/mo` : 'Confidential / Not set'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Side Summary Card */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#0f172a]">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Account Status</h3>
              <div className="mt-4 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 dark:border-slate-800">
                  <span className="text-slate-500">Access Status</span>
                  <span className={`font-bold ${user.isActive ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {user.isActive ? 'Active' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 dark:border-slate-800">
                  <span className="text-slate-500">2FA Security</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 dark:border-slate-800">
                  <span className="text-slate-500">Force Password Reset</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {user.forcePasswordChange ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Last Session Login</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Promotion Box */}
            <div className="rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-6 shadow-sm dark:border-indigo-900/50 dark:from-indigo-950/30 dark:to-[#0f172a]">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Role Management</h3>
              </div>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                You can promote or change this staff member to Principal, Director, Teacher, or Peon under the <strong>Role & Promotion</strong> tab.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('role')}
                className="mt-4 w-full rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/30 transition hover:bg-indigo-700"
              >
                Manage Role & Promotion →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: TEACHER & CLASS TEACHER DUTIES ──────────────────────────── */}
      {activeTab === 'academic' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#0f172a]">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Class Teacher & Academic Management
                  </h3>
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Assign class teacher responsibilities, grade levels, sections, and subjects taught by this staff member.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSaveAcademic}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/30 transition hover:bg-indigo-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? 'Saving...' : 'Save Academic Duties'}</span>
              </button>
            </div>

            <div className="mt-6 space-y-6">
              {/* Class Teacher Section */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      Class Teacher Assignment
                    </span>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Designates this faculty member as the primary class teacher for daily attendance and student oversight.
                    </p>
                  </div>

                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={academicState.isClassTeacher}
                      onChange={(e) =>
                        setAcademicState({ ...academicState, isClassTeacher: e.target.checked })
                      }
                      className="peer sr-only"
                    />
                    <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-indigo-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:border-slate-700 dark:bg-slate-700"></div>
                  </label>
                </div>

                {academicState.isClassTeacher && (
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Assigned Class & Section *
                    </label>
                    <input
                      type="text"
                      value={academicState.classTeacherOf}
                      onChange={(e) =>
                        setAcademicState({ ...academicState, classTeacherOf: e.target.value })
                      }
                      placeholder="e.g. Class 10 - Section A"
                      className="w-full max-w-md rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                    />
                  </div>
                )}
              </div>

              {/* Classes Assigned */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Classes / Grades Assigned
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_CLASSES.map((cls) => {
                    const isSelected = academicState.classesAssigned.includes(cls);
                    return (
                      <button
                        key={cls}
                        type="button"
                        onClick={() => toggleArrayItem('classesAssigned', cls)}
                        className={`rounded-xl border px-3.5 py-2 text-xs font-bold transition ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400'
                        }`}
                      >
                        {cls} {isSelected && '✓'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sections Assigned */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Sections Assigned
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_SECTIONS.map((sec) => {
                    const isSelected = academicState.sectionsAssigned.includes(sec);
                    return (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => toggleArrayItem('sectionsAssigned', sec)}
                        className={`rounded-xl border px-3.5 py-2 text-xs font-bold transition ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400'
                        }`}
                      >
                        {sec} {isSelected && '✓'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Subjects Assigned */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Subjects Taught
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_SUBJECTS.map((subj) => {
                    const isSelected = academicState.subjectsAssigned.includes(subj);
                    return (
                      <button
                        key={subj}
                        type="button"
                        onClick={() => toggleArrayItem('subjectsAssigned', subj)}
                        className={`rounded-xl border px-3.5 py-2 text-xs font-bold transition ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400'
                        }`}
                      >
                        {subj} {isSelected && '✓'}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: ROLE & PROMOTION MANAGEMENT ─────────────────────────────── */}
      {activeTab === 'role' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#0f172a]">
            <div className="border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Role Promotion & Reassignment
                </h3>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Institutional role governance and permitted promotions. (Super Admin is strictly 1 and permanent; Principal is strictly 1; Admin, Teacher, Accountant, Librarian, and Peon allow multiple).
              </p>
            </div>

            {(user.role || '').toLowerCase() === 'super-admin' ? (
              <div className="mt-6 rounded-2xl border border-purple-200 bg-purple-50/80 p-6 text-center dark:border-purple-900/60 dark:bg-purple-950/30">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-600 text-white shadow-lg shadow-purple-600/30">
                  <ShieldAlert className="h-7 w-7" />
                </div>
                <h4 className="mt-3 text-base font-black text-purple-950 dark:text-purple-200">
                  Permanent Master Role: Super Admin (Director)
                </h4>
                <p className="mx-auto mt-2 max-w-lg text-xs leading-relaxed text-purple-800/80 dark:text-purple-300/80">
                  Strictly <strong>1 Super Admin (Director)</strong> is permitted in the institution. As the master governor, this role is permanent and cannot be changed, transferred, or demoted.
                </p>
                <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-purple-100 px-4 py-2 text-xs font-bold text-purple-900 dark:bg-purple-900/60 dark:text-purple-200">
                  <Lock className="h-4 w-4" />
                  <span>Role Locked by Institutional Governance Policy</span>
                </div>
              </div>
            ) : (
              <>
                {(user.role || '').toLowerCase() === 'teacher' && (
                  <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/30">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md">
                          <GraduationCap className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            Class Teacher Duty Status
                          </h4>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            {user.isClassTeacher
                              ? `Currently assigned as Class Teacher for ${user.classTeacherOf || 'assigned class'}.`
                              : 'Currently a Subject Teacher without class teacher duties.'}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab('academic')}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95"
                      >
                        <span>{user.isClassTeacher ? 'Edit Class Assignment' : 'Make Class Teacher'}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {PROMOTION_ROLES.map((r) => {
                  const isCurrent = (user.role || '').toLowerCase() === r.id;
                  const Icon = r.icon;

                  return (
                    <div
                      key={r.id}
                      className={`flex flex-col justify-between rounded-2xl border p-4 transition ${
                        isCurrent
                          ? 'border-indigo-500 bg-indigo-50/70 shadow-sm dark:border-indigo-500/50 dark:bg-indigo-950/40'
                          : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-[#0f172a] dark:hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-xs dark:bg-slate-800">
                            <Icon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                          </span>
                          <div className="flex items-center gap-1.5">
                            {isCurrent && (
                              <span className="rounded-full bg-indigo-600 px-2.5 py-0.5 text-[10px] font-black text-white">
                                CURRENT
                              </span>
                            )}
                          </div>
                        </div>
                        <h4 className="mt-3 text-sm font-bold text-slate-900 dark:text-white">
                          {r.label}
                        </h4>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{r.desc}</p>
                      </div>

                      <button
                        type="button"
                        disabled={isCurrent || saving}
                        onClick={() => handleRoleChange(r.id)}
                        className={`mt-4 w-full rounded-xl py-2 text-xs font-bold transition ${
                          isCurrent
                            ? 'cursor-default bg-indigo-200/60 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300'
                            : 'bg-slate-900 text-white hover:bg-indigo-600 dark:bg-slate-800 dark:hover:bg-indigo-600'
                        }`}
                      >
                        {isCurrent ? 'Active Role' : `Make ${r.label}`}
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
          </div>
        </div>
      )}

      {/* ── TAB 4: CREDENTIALS & SECURITY ─────────────────────────────────── */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#0f172a]">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4 dark:border-slate-800">
              <KeyRound className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Credentials & Administrative Access
              </h3>
            </div>

            <form onSubmit={handleResetPassword} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  disabled
                  value={user.username}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-slate-500 dark:border-slate-800 dark:bg-slate-800/50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 font-medium text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Set New Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setNewPassword(generateSecurePassword())}
                    className="text-[11px] font-bold text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    Auto-Generate Password
                  </button>
                </div>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (leave blank to keep current)"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 font-mono text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                />
              </div>

              {newPassword && (
                <div className="flex items-center justify-between rounded-xl bg-indigo-50/70 p-3 text-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-200">
                  <span className="text-xs">New credentials ready for {user.name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const creds = `Username: ${user.username}\nEmail: ${editEmail}\nPassword: ${newPassword}`;
                      navigator.clipboard.writeText(creds);
                      toast.success('Credentials copied to clipboard!');
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-indigo-600 shadow-xs hover:bg-indigo-50 dark:bg-slate-800 dark:text-indigo-400"
                  >
                    <Copy className="h-3 w-3" />
                    <span>Copy Credentials</span>
                  </button>
                </div>
              )}

              {/* Account Status Toggle */}
              {(user.role || '').toLowerCase() !== 'super-admin' && (
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Login Access Status
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {user.isActive
                          ? 'Account active. User can log in normally.'
                          : 'Account disabled. User is completely blocked from logging in.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setConfirmStatusToggle(true)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-bold transition shadow-xs ${
                        user.isActive
                          ? 'border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                          : 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      {user.isActive ? 'Disable Login Access' : 'Enable Login Access'}
                    </button>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/30 transition hover:bg-indigo-700 disabled:opacity-50"
                >
                  {saving ? 'Updating...' : 'Save Credentials'}
                </button>
              </div>
            </form>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#0f172a]">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4 dark:border-slate-800">
              <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Recent Sign-in Activity
              </h3>
            </div>

            <div className="mt-4 space-y-2 text-xs">
              {user.loginHistory && user.loginHistory.length > 0 ? (
                user.loginHistory.map((entry, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-800/40"
                  >
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">
                        {entry.ip ? `IP: ${entry.ip}` : 'Web Login'}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate max-w-xs">
                        {entry.userAgent || 'Standard Browser'}
                      </p>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      {new Date(entry.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="py-4 text-center text-slate-400">No login history recorded yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT PERSONAL DETAILS MODAL ─────────────────────────────────────── */}
      <Modal
        open={showEditPersonalModal}
        isOpen={showEditPersonalModal}
        onClose={() => setShowEditPersonalModal(false)}
        title="Edit Personal & Staff Details"
      >
        <form onSubmit={handleSavePersonal} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Primary Phone
              </label>
              <input
                type="text"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                placeholder="e.g. +1 555-0199"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Alternate Phone
              </label>
              <input
                type="text"
                value={editForm.alternatePhone}
                onChange={(e) => setEditForm({ ...editForm, alternatePhone: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Gender
              </label>
              <select
                value={editForm.gender}
                onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                value={editForm.dob}
                onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Residential Address
            </label>
            <textarea
              rows={2}
              value={editForm.address}
              onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Designation
              </label>
              <input
                type="text"
                value={editForm.designation}
                onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                placeholder="e.g. Senior Professor"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Department
              </label>
              <input
                type="text"
                value={editForm.department}
                onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                placeholder="e.g. Science / Academics"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Qualification
              </label>
              <input
                type="text"
                value={editForm.qualification}
                onChange={(e) => setEditForm({ ...editForm, qualification: e.target.value })}
                placeholder="e.g. M.Sc., B.Ed."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Monthly Salary
              </label>
              <input
                type="number"
                value={editForm.salary}
                onChange={(e) => setEditForm({ ...editForm, salary: e.target.value })}
                placeholder="e.g. 75000"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowEditPersonalModal(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/30 transition hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Details'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── RESET PASSWORD MODAL ────────────────────────────────────────────── */}
      <Modal
        open={showResetPwdModal}
        isOpen={showResetPwdModal}
        onClose={() => setShowResetPwdModal(false)}
        title="Reset User Password"
      >
        <form onSubmit={handleResetPassword} className="space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Set a new password for <strong>{user.name}</strong> (@{user.username}).
          </p>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              New Password *
            </label>
            <input
              type="text"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowResetPwdModal(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !newPassword}
              className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/30 transition hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── CONFIRM STATUS TOGGLE DIALOG ────────────────────────────────────── */}
      <ConfirmDialog
        isOpen={confirmStatusToggle}
        title={user.isActive ? 'Deactivate User Account?' : 'Activate User Account?'}
        message={
          user.isActive
            ? `Are you sure you want to deactivate ${user.name}? They will immediately lose access to the portal.`
            : `Are you sure you want to activate ${user.name}? They will be able to log in.`
        }
        confirmText={user.isActive ? 'Deactivate' : 'Activate'}
        type={user.isActive ? 'warning' : 'primary'}
        onConfirm={handleToggleStatus}
        onCancel={() => setConfirmStatusToggle(false)}
      />

      {/* ── CONFIRM DELETE USER DIALOG ──────────────────────────────────────── */}
      <ConfirmDialog
        isOpen={confirmDelete}
        title="Delete User Account"
        message={`Are you sure you want to permanently delete the user account for "${user.name}" (@${user.username})? This action cannot be undone.`}
        confirmText="Delete Permanently"
        type="danger"
        onConfirm={handleDeleteUser}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
};

export default UserDetailPage;
