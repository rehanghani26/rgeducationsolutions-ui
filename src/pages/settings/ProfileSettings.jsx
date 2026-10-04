import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { updateUserProfile } from "../../store/slices/authSlice.js";
import StudentProfileView from "../students/StudentProfileView.jsx";
import { getUserFromStorage } from "../../config/access.jsx";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Building2,
  GraduationCap,
  KeyRound,
  Eye,
  EyeOff,
  Camera,
  Loader2,
  Lock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  UserCheck,
  Calendar,
  MapPin,
  Hash,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  Clock,
  Upload,
  Image as ImageIcon,
  Trash2,
  Link as LinkIcon,
  Edit3,
  X,
  Save,
} from "lucide-react";
import api from "../../services/api.js";

// Helper to resolve absolute or relative image URLs
const resolveImageUrl = (url) => {
  if (!url) return "";
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:") ||
    url.startsWith("blob:")
  ) {
    return url;
  }
  return `http://localhost:5000${url.startsWith("/") ? "" : "/"}${url}`;
};

// Role configuration matching UserManagement.jsx
const ROLE_CONFIG = {
  "super-admin": {
    label: "Super Admin (Director)",
    badge: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20",
    gradient: "from-purple-600 via-indigo-600 to-blue-600",
  },
  "school-admin": {
    label: "School Administrator",
    badge: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20",
    gradient: "from-indigo-600 to-blue-600",
  },
  admin: {
    label: "Administrator",
    badge: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20",
    gradient: "from-indigo-600 to-blue-600",
  },
  principal: {
    label: "Principal",
    badge: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
    gradient: "from-blue-600 to-cyan-600",
  },
  teacher: {
    label: "Teacher",
    badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
    gradient: "from-emerald-600 to-teal-600",
  },
  "head-teacher": {
    label: "Head Teacher",
    badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
    gradient: "from-emerald-600 to-teal-600",
  },
  hod: {
    label: "Head of Department",
    badge: "bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20",
    gradient: "from-teal-600 to-cyan-600",
  },
  coordinator: {
    label: "Academic Coordinator",
    badge: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/20",
    gradient: "from-cyan-600 to-blue-600",
  },
  accountant: {
    label: "Accountant",
    badge: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
    gradient: "from-amber-600 to-orange-600",
  },
  librarian: {
    label: "Librarian",
    badge: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20",
    gradient: "from-rose-600 to-pink-600",
  },
  peon: {
    label: "Support Staff",
    badge: "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20",
    gradient: "from-orange-600 to-amber-600",
  },
  student: {
    label: "Student",
    badge: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20",
    gradient: "from-sky-600 to-indigo-600",
  },
  parent: {
    label: "Parent / Guardian",
    badge: "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20",
    gradient: "from-violet-600 to-purple-600",
  },
};

const DEFAULT_ROLE = {
  label: "Staff Member",
  badge: "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20",
  gradient: "from-slate-700 to-slate-900",
};

// Masked password viewer
const PasswordDisplay = ({ value }) => {
  const [visible, setVisible] = useState(false);
  if (!value) return <span className="text-slate-400 italic text-xs">Not available</span>;
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-xs text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
        {visible ? value : "••••••••"}
      </span>
      <button
        type="button"
        onClick={() => setVisible(!visible)}
        className="p-1 rounded-md text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        title={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeOff size={13} /> : <Eye size={13} />}
      </button>
    </div>
  );
};

// Info Tile Component
const InfoTile = ({ icon: Icon, label, value, copyable = false }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(String(value));
    setCopied(true);
    toast.success(`${label} copied!`, { autoClose: 1500 });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative flex items-start gap-3 p-3 sm:p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 hover:border-indigo-300 dark:hover:border-indigo-700/70 transition-all duration-200">
      <div className="size-8.5 rounded-lg bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-slate-200/60 dark:border-slate-700/60 shadow-xs group-hover:scale-105 transition-transform">
        <Icon size={15} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {label}
          </p>
          {copyable && value && (
            <button
              type="button"
              onClick={handleCopy}
              className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded cursor-pointer"
              title="Copy to clipboard"
            >
              {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
            </button>
          )}
        </div>
        <div className="text-xs font-bold text-slate-800 dark:text-slate-100 mt-0.5 truncate">
          {value || <span className="text-slate-400 dark:text-slate-500 font-normal italic">Not specified</span>}
        </div>
      </div>
    </div>
  );
};

const ProfileSettings = () => {
  const navigate = useNavigate();
  const { user: authUser } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const userRole = (authUser?.role || getUserFromStorage()?.role || "").toLowerCase().replace(/_/g, '-');
  const isStudent = userRole === 'student';

  if (isStudent) {
    return <StudentProfileView authUser={authUser} />;
  }

  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avatarError, setAvatarError] = useState(false);

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [savingChanges, setSavingChanges] = useState(false);
  const [uploadingS3, setUploadingS3] = useState(false);
  const [showUrlField, setShowUrlField] = useState(false);
  const [resetting, setResetting] = useState(false);

  // Editable Form Data state (holding S3 imagesRef & password)
  const [formData, setFormData] = useState({
    avatar: "",
    imagesRef: { id: "", img: "" },
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPwd, setShowPwd] = useState({ current: false, new: false, confirm: false });

  // Load profile from backend
  const loadProfile = async () => {
    try {
      setLoading(true);
      const userId = authUser?._id || authUser?.id || "me";
      const res = await api.get(`/profile/${userId}`);
      if (res.data?.profile) {
        const prof = res.data.profile;
        const rawImg = prof.imagesRef?.img || prof.avatar || prof.photo || "";
        const rawId = prof.imagesRef?.id || "";
        const resolvedAvatar = resolveImageUrl(rawImg);
        const imagesRefObj = { id: rawId, img: resolvedAvatar };

        setProfile({
          ...prof,
          avatar: resolvedAvatar,
          photo: resolvedAvatar,
          imagesRef: imagesRefObj,
        });

        setFormData((prev) => ({
          ...prev,
          avatar: resolvedAvatar,
          imagesRef: imagesRefObj,
        }));

        if (resolvedAvatar && (!authUser?.avatar || authUser.avatar !== resolvedAvatar)) {
          dispatch(updateUserProfile({ avatar: resolvedAvatar, photo: resolvedAvatar, imagesRef: imagesRefObj }));
        }
      }
    } catch {
      if (authUser) {
        const rawImg = authUser.imagesRef?.img || authUser.avatar || authUser.photo || "";
        const rawId = authUser.imagesRef?.id || "";
        const resolvedAvatar = resolveImageUrl(rawImg);
        const imagesRefObj = { id: rawId, img: resolvedAvatar };

        setProfile({
          ...authUser,
          avatar: resolvedAvatar,
          photo: resolvedAvatar,
          imagesRef: imagesRefObj,
        });

        setFormData((prev) => ({
          ...prev,
          avatar: resolvedAvatar,
          imagesRef: imagesRefObj,
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Enter edit mode
  const handleStartEdit = () => {
    const currentImg = profile?.imagesRef?.img || profile?.avatar || "";
    const currentId = profile?.imagesRef?.id || "";
    setFormData({
      avatar: currentImg,
      imagesRef: { id: currentId, img: currentImg },
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setIsEditing(true);
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    const currentImg = profile?.imagesRef?.img || profile?.avatar || "";
    const currentId = profile?.imagesRef?.id || "";
    setFormData({
      avatar: currentImg,
      imagesRef: { id: currentId, img: currentImg },
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setIsEditing(false);
  };

  // Select and immediately upload photo to S3, then set response URL into formData
  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    // Validate size <= 2MB
    if (file.size > 2 * 1024 * 1024) {
      toast.error(
        `Photo size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds 2MB limit. Please upload an image under 2MB.`
      );
      return;
    }

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, and WEBP images are supported.");
      return;
    }

    try {
      setUploadingS3(true);
      const data = new FormData();
      data.append("file", file);

      // Upload to server/S3
      const res = await api.post("/profile/upload-avatar", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const s3Url = res.data?.avatarUrl || res.data?.url || res.data?.imagesRef?.img;
      const fileId = res.data?.id || res.data?.imagesRef?.id || `img_${Date.now()}`;

      if (s3Url) {
        // Set the uploaded S3 URL and file ID into local formData.imagesRef
        const resolved = resolveImageUrl(s3Url);
        const refObj = { id: fileId, img: resolved };

        setFormData((prev) => ({
          ...prev,
          avatar: resolved,
          imagesRef: refObj,
        }));
        setAvatarError(false);
        toast.success("Photo uploaded to AWS S3 & stored in imagesRef! Click 'Save Profile' to finalize.");
      } else {
        toast.error(res.data?.message || "Failed to upload photo to S3");
      }
    } catch (err) {
      console.error("S3 photo upload error:", err);
      toast.error(err.response?.data?.message || "Failed to upload photo to S3");
    } finally {
      setUploadingS3(false);
    }
  };

  // Remove photo in formData
  const handleRemovePhoto = () => {
    setFormData((prev) => ({
      ...prev,
      avatar: "",
      imagesRef: { id: "", img: "" },
    }));
    toast.info("Photo removed from selection. Click 'Save Profile' to confirm.");
  };

  // Save all changes (Avatar URL and/or Password)
  const handleSaveProfile = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    // 1. Check if password fields are partially filled
    const isChangingPassword =
      Boolean(formData.currentPassword) ||
      Boolean(formData.newPassword) ||
      Boolean(formData.confirmPassword);

    if (isChangingPassword) {
      if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
        toast.error("Please fill all password fields to change your password");
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        toast.error("New password and confirm password do not match");
        return;
      }
      if (formData.newPassword.length < 6) {
        toast.error("New password must be at least 6 characters long");
        return;
      }
      if (formData.newPassword === formData.currentPassword) {
        toast.error("New password cannot be the same as your current password");
        return;
      }
    }

    try {
      setSavingChanges(true);

      // Save imagesRef and avatar in formData if changed
      const currentSavedImg = profile?.imagesRef?.img || profile?.avatar || "";
      if (formData.avatar !== currentSavedImg || formData.imagesRef?.id !== (profile?.imagesRef?.id || "")) {
        const payload = {
          avatarUrl: formData.avatar,
          imagesRef: formData.imagesRef,
        };
        const saveRes = await api.patch("/profile/avatar", payload);
        const finalUrl = resolveImageUrl(saveRes.data?.avatarUrl || saveRes.data?.imagesRef?.img || formData.avatar);
        const finalId = saveRes.data?.imagesRef?.id || formData.imagesRef?.id || "";
        const finalRef = { id: finalId, img: finalUrl };

        setProfile((prev) => ({
          ...prev,
          avatar: finalUrl,
          photo: finalUrl,
          imagesRef: finalRef,
        }));
        dispatch(updateUserProfile({
          avatar: finalUrl,
          photo: finalUrl,
          imagesRef: finalRef,
        }));
      }

      // Save password if provided
      if (isChangingPassword) {
        await api.patch("/profile/change-password", {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        });
        toast.success("Password changed successfully!");
      }

      toast.success("Profile saved successfully!");
      setIsEditing(false);
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (err) {
      console.error("Save profile error:", err);
      toast.error(err.response?.data?.message || "Failed to save profile changes");
    } finally {
      setSavingChanges(false);
    }
  };

  // Request password reset email
  const handleResetRequest = async () => {
    try {
      setResetting(true);
      const res = await api.post("/profile/reset-password-request");
      toast.success(res.data?.message || "Password reset instructions sent to your email!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to dispatch reset email");
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
        <div className="relative size-12 flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-indigo-600 dark:text-indigo-400" />
        </div>
        <p className="text-xs font-bold tracking-wide uppercase text-slate-500">Loading Account Profile...</p>
      </div>
    );
  }

  const p = profile || authUser || {};
  const activeAvatar = isEditing
    ? (formData.imagesRef?.img || formData.avatar)
    : (p.imagesRef?.img || p.avatar || p.photo || "");
  const roleKey = (p.role || "teacher").toLowerCase();
  const roleInfo = ROLE_CONFIG[roleKey] || DEFAULT_ROLE;
  const initials = (p.name || p.username || "User")
    .split(" ")
    .map((n) => n.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");

  // Password score
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: "", color: "bg-slate-200" };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;

    switch (score) {
      case 1:
        return { score: 25, label: "Weak", color: "bg-rose-500" };
      case 2:
        return { score: 50, label: "Fair", color: "bg-amber-500" };
      case 3:
        return { score: 75, label: "Good", color: "bg-blue-500" };
      case 4:
        return { score: 100, label: "Strong", color: "bg-emerald-500" };
      default:
        return { score: 0, label: "", color: "bg-slate-200" };
    }
  };

  const pwdStrength = getPasswordStrength(formData.newPassword);

  return (
    <div className="space-y-4">
      {/* Hidden file input for file uploading directly to S3 like StudentForm.jsx */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoSelect}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
      />

      {/* ── HERO BANNER & IDENTITY CARD ────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 text-white shadow-lg">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 size-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 size-48 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            {/* Left: Avatar & Basic Information */}
            <div className="flex items-center gap-4 sm:gap-5">
              {/* Avatar with Camera Trigger in edit mode */}
              <div className="relative group shrink-0">
                {activeAvatar && !avatarError ? (
                  <img
                    src={resolveImageUrl(activeAvatar)}
                    alt={p.name}
                    className="size-18 sm:size-20 rounded-2xl object-cover ring-3 ring-indigo-400/40 shadow-md transition-transform duration-200"
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <div
                    className={`size-18 sm:size-20 rounded-2xl bg-gradient-to-br ${roleInfo.gradient} flex items-center justify-center text-2xl sm:text-3xl font-black text-white ring-3 ring-indigo-400/30 shadow-md`}
                  >
                    {initials}
                  </div>
                )}

                {/* Online pulse indicator */}
                <span className="absolute -top-1 -right-1 flex size-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full size-3.5 bg-emerald-500 border-2 border-slate-900" />
                </span>

                {/* Camera quick edit badge */}
                <button
                  type="button"
                  onClick={() => {
                    if (!isEditing) setIsEditing(true);
                    setTimeout(() => fileInputRef.current?.click(), 50);
                  }}
                  disabled={uploadingS3}
                  className="absolute -bottom-1.5 -right-1.5 size-7 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer disabled:opacity-60"
                  title="Upload profile photo"
                >
                  {uploadingS3 ? <Loader2 size={13} className="animate-spin" /> : <Camera size={13} />}
                </button>
              </div>

              {/* Title & Metadata */}
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight truncate">
                    {p.name || p.username}
                  </h2>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border uppercase tracking-wider backdrop-blur-xs ${roleInfo.badge} bg-white/10 text-indigo-200 border-indigo-400/30`}
                  >
                    <ShieldCheck size={11} />
                    {roleInfo.label}
                  </span>
                </div>

                <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-300 flex-wrap">
                  <span className="font-semibold text-slate-200 flex items-center gap-1">
                    <Mail size={12} className="text-indigo-400" />
                    {p.email}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-300 flex items-center gap-1 font-mono">
                    <Hash size={12} className="text-indigo-400" />
                    {p.username}
                  </span>
                  {p.employeeId && (
                    <>
                      <span className="text-slate-500">•</span>
                      <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px] font-bold text-indigo-300">
                        ID: {p.employeeId}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right: EDIT PROFILE / ACTION BUTTONS */}
            <div className="flex items-center gap-2 shrink-0 self-start sm:self-center flex-wrap">
              <button
                type="button"
                onClick={() => navigate('/settings/password-security')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs transition cursor-pointer"
                title="Send password change request to Super Admin & view history"
              >
                <KeyRound size={13} className="text-amber-400" />
                <span>Password & Security</span>
              </button>
              {!isEditing ? (
                <button
                  type="button"
                  onClick={handleStartEdit}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md shadow-indigo-600/30 transition-transform active:scale-95 cursor-pointer"
                >
                  <Edit3 size={14} />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={savingChanges || uploadingS3}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs font-bold transition cursor-pointer backdrop-blur-xs disabled:opacity-50"
                  >
                    <X size={14} />
                    <span>Cancel</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={savingChanges || uploadingS3}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-600/30 transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    {savingChanges ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save size={14} />
                        <span>Save Profile</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={loadProfile}
                disabled={loading || savingChanges}
                title="Refresh profile data"
                className="p-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-slate-300 hover:text-white transition cursor-pointer"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>
        </div>

        {/* Edit mode active banner */}
        {isEditing && (
          <div className="px-4 sm:px-5 py-2.5 bg-indigo-900/60 border-t border-indigo-500/30 flex items-center justify-between text-xs text-indigo-200">
            <span className="flex items-center gap-1.5 font-bold">
              <Sparkles size={14} className="text-indigo-400" />
              <span>Editing Mode Active: You can upload your profile photo and update your password.</span>
            </span>
            <span className="text-[11px] text-indigo-300/80">Remember to click &quot;Save Profile&quot; when finished</span>
          </div>
        )}
      </div>

      {/* ── EDIT MODE VIEW (When isEditing === true) ─────────────────────────── */}
      {isEditing && (
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Profile Photo Upload Studio (Like StudentForm.jsx) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="size-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Camera size={14} />
                  </div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                    1. Profile Photo (Upload to S3)
                  </h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50">
                  Max 2 MB
                </span>
              </div>

              {/* Photo Upload & Preview Component matching StudentForm.jsx */}
              {formData.avatar ? (
                <div className="flex flex-col sm:flex-row items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80">
                  <div className="relative size-22 rounded-xl overflow-hidden border-2 border-indigo-500/40 shadow-md shrink-0 bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                    <img
                      src={resolveImageUrl(formData.avatar)}
                      alt="Selected Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                  <div className="space-y-1.5 flex-1 min-w-0 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 size={13} />
                      <span>Ready in FormData (Saved on S3 & imagesRef)</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xs font-mono">
                      {formData.imagesRef?.id ? `ID: ${formData.imagesRef.id}` : formData.avatar.split("/").pop()}
                    </p>
                    <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingS3}
                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                      >
                        Change Photo
                      </button>
                      <span className="text-slate-300 dark:text-slate-600">•</span>
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        disabled={uploadingS3}
                        className="text-xs font-semibold text-rose-500 hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => !uploadingS3 && fileInputRef.current?.click()}
                  className="p-6 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 hover:border-indigo-500 dark:hover:border-indigo-400 transition flex flex-col items-center justify-center text-center cursor-pointer min-h-[130px]"
                >
                  {uploadingS3 ? (
                    <div className="flex flex-col items-center gap-2 py-2">
                      <Loader2 size={26} className="animate-spin text-indigo-600 dark:text-indigo-400" />
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                        Uploading file to S3...
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="size-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-1.5 shadow-xs">
                        <ImageIcon size={22} />
                      </div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        Select Photo from Device
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5">
                        JPG, PNG, or WEBP (Uploads to S3 immediately)
                      </span>
                    </>
                  )}
                </div>
              )}

              {/* Direct image URL option */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUrlField(!showUrlField)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  <LinkIcon size={12} />
                  <span>{showUrlField ? "Hide direct URL input" : "Or paste a direct image URL"}</span>
                </button>

                {showUrlField && (
                  <div className="mt-2 space-y-1.5">
                    <input
                      type="url"
                      value={formData.avatar}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          avatar: val,
                          imagesRef: { id: val ? `url_${Date.now()}` : "", img: val },
                        }));
                      }}
                      placeholder="https://images.unsplash.com/... or web URL"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60 px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 2. Change Password Studio */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="size-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <KeyRound size={14} />
                  </div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                    2. Change Password (Optional)
                  </h3>
                </div>
                <span className="text-[10px] text-slate-400">Leave blank to keep current</span>
              </div>

              {/* Current Password */}
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPwd.current ? "text" : "password"}
                    autoComplete="current-password"
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                    placeholder="Enter current password"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60 px-3 py-2 text-xs text-slate-800 dark:text-slate-100 pr-9 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd({ ...showPwd, current: !showPwd.current })}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 cursor-pointer"
                  >
                    {showPwd.current ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPwd.new ? "text" : "password"}
                    autoComplete="new-password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    placeholder="Min. 6 characters"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60 px-3 py-2 text-xs text-slate-800 dark:text-slate-100 pr-9 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd({ ...showPwd, new: !showPwd.new })}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 cursor-pointer"
                  >
                    {showPwd.new ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>

                {formData.newPassword && (
                  <div className="mt-1.5 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className="text-slate-400">Strength:</span>
                      <span className={pwdStrength.score >= 75 ? "text-emerald-500" : "text-amber-500"}>
                        {pwdStrength.label}
                      </span>
                    </div>
                    <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 rounded-full ${pwdStrength.color}`}
                        style={{ width: `${pwdStrength.score}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPwd.confirm ? "text" : "password"}
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Re-enter new password"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60 px-3 py-2 text-xs text-slate-800 dark:text-slate-100 pr-9 focus:outline-none focus:ring-2 focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd({ ...showPwd, confirm: !showPwd.confirm })}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 cursor-pointer"
                  >
                    {showPwd.confirm ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </div>

              {/* Email reset fallback */}
              <div className="pt-1 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleResetRequest}
                  disabled={resetting}
                  className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer disabled:opacity-50"
                >
                  {resetting ? "Sending reset email..." : "Forgot password? Send email link"}
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Save / Cancel action strip */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleCancelEdit}
              disabled={savingChanges || uploadingS3}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingChanges || uploadingS3}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-600/30 transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {savingChanges ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save size={14} />
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* ── VIEW MODE (When isEditing === false) ─────────────────────────────── */}
      {!isEditing && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Identity & Contact Details Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="size-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <User size={14} />
                  </div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                    Identity &amp; Contact Information
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-slate-400">Institutional Record</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <InfoTile icon={User} label="Full Name" value={p.name} />
                <InfoTile icon={Hash} label="Username" value={`@${p.username}`} copyable />
                <InfoTile icon={Mail} label="Email Address" value={p.email} copyable />
                <InfoTile icon={Phone} label="Contact Phone" value={p.phone} copyable />
                <div className="sm:col-span-2">
                  <InfoTile icon={MapPin} label="Residential Address" value={p.address} />
                </div>
              </div>
            </div>

            {/* Employment & Department Details Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="size-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Briefcase size={14} />
                  </div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                    Employment &amp; Institutional Role
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-slate-400">Verified</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <InfoTile icon={UserCheck} label="Employee ID" value={p.employeeId} copyable />
                <InfoTile icon={Briefcase} label="Designation" value={p.designation} />
                <InfoTile icon={Building2} label="Department" value={p.department} />
                <InfoTile icon={GraduationCap} label="Qualification" value={p.qualification} />
                <div className="sm:col-span-2">
                  <InfoTile
                    icon={Calendar}
                    label="Date of Joining"
                    value={
                      p.joiningDate
                        ? new Date(p.joiningDate).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : null
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Account Status & Security Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Status card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
              <div
                className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${
                  p.isActive !== false
                    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
                    : "bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400"
                }`}
              >
                <ShieldCheck size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Account Status</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`size-2 rounded-full ${p.isActive !== false ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`}
                  />
                  <p className="text-xs font-black text-slate-800 dark:text-slate-100">
                    {p.isActive !== false ? "Active & Authorized" : "Account Disabled"}
                  </p>
                </div>
              </div>
            </div>

            {/* Last login card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
              <div className="size-10 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Clock size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Last Session Login</p>
                <p className="text-xs font-black text-slate-800 dark:text-slate-100 mt-0.5 truncate">
                  {p.lastLogin ? new Date(p.lastLogin).toLocaleString("en-IN") : "Current Session"}
                </p>
              </div>
            </div>

            {/* Initial Stored Password */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
              <div className="size-10 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400 flex items-center justify-center shrink-0">
                <Lock size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Default Password</p>
                <div className="mt-0.5">
                  <PasswordDisplay value={p.tempPassword} />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Edit Guidance Note */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <Sparkles size={16} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Want to change your profile picture or update your password?
              </p>
            </div>
            <button
              type="button"
              onClick={handleStartEdit}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition cursor-pointer"
            >
              <Edit3 size={13} />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSettings;
