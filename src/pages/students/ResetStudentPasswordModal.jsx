import React, { useState } from "react";
import {
  KeyRound,
  Wand2,
  Eye,
  EyeOff,
  Copy,
  Check,
  ShieldCheck,
  Lock,
  User,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { toast } from "react-toastify";
import Modal from "../../components/ui/Modal.jsx";
import Button from "../../components/ui/Button.jsx";
import { resetStudentPassword } from "../../services/studentService.js";

const generateSecurePassword = () => {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let rand = "";
  for (let i = 0; i < 6; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const digits = Math.floor(100 + Math.random() * 900);
  return `Std@${rand}${digits}`;
};

export const ResetStudentPasswordModal = ({
  open,
  student,
  onClose,
  onSuccess,
}) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [forcePasswordChange, setForcePasswordChange] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState("");
  const [resetResult, setResetResult] = useState(null);

  // Initialize or reset form when opening
  React.useEffect(() => {
    if (open) {
      setPassword(generateSecurePassword());
      setShowPassword(true);
      setForcePasswordChange(false);
      setResetResult(null);
      setCopiedField("");
    }
  }, [open, student]);

  if (!student) return null;

  const targetId = student._id || student.id || student.admissionNumber;

  const handleGenerateRandom = () => {
    setPassword(generateSecurePassword());
    setShowPassword(true);
  };

  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`Copied ${fieldName} to clipboard!`);
    setTimeout(() => setCopiedField(""), 2000);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!password || password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    try {
      const res = await resetStudentPassword(targetId, {
        password,
        newPassword: password,
        forcePasswordChange,
      });

      setResetResult({
        admissionNumber: res?.account?.admissionNumber || student.admissionNumber,
        username: res?.account?.username || student.admissionNumber?.toLowerCase(),
        email: res?.account?.email || student.email,
        password: password,
      });

      if (onSuccess) {
        onSuccess(res);
      }
    } catch (err) {
      console.error("Reset password error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Reset Student Password"
      subtitle={`Configure new login credentials for ${student.name || "Student"}`}
      size="md"
    >
      <div className="space-y-5">
        {/* Student Context Card */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-sm shrink-0 border border-orange-200 dark:border-orange-800/60">
              {student.name?.charAt(0)?.toUpperCase() || "S"}
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {student.name}
              </h4>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                Adm: <span className="font-mono text-orange-600 dark:text-orange-400">{student.admissionNumber}</span>
                {student.class && ` • ${student.class}`}
                {student.section && ` (${student.section})`}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
              <ShieldCheck size={11} /> Active
            </span>
          </div>
        </div>

        {/* Success Card when Reset Done */}
        {resetResult ? (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200 font-extrabold text-xs">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>Password Reset Successfully!</span>
              </div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                The student account is now active with no expiry restrictions. Provide the student with these login credentials:
              </p>

              <div className="space-y-2 pt-1 font-mono text-xs">
                {/* Username / Admission Number */}
                <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-sans">
                      Username / Admission ID
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white select-all">
                      {resetResult.admissionNumber}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(resetResult.admissionNumber, "Admission No")}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-800 transition cursor-pointer"
                    title="Copy Admission No"
                  >
                    {copiedField === "Admission No" ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  </button>
                </div>

                {/* Email (if any) */}
                {resetResult.email && (
                  <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-sans">
                        Student Email
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white select-all">
                        {resetResult.email}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(resetResult.email, "Email")}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-800 transition cursor-pointer"
                      title="Copy Email"
                    >
                      {copiedField === "Email" ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    </button>
                  </div>
                )}

                {/* New Password */}
                <div className="flex items-center justify-between p-2.5 bg-emerald-100/60 dark:bg-emerald-900/30 rounded-xl border border-emerald-300 dark:border-emerald-700/80">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block font-sans">
                      New Password
                    </span>
                    <span className="font-extrabold text-emerald-950 dark:text-emerald-200 select-all tracking-wider text-sm">
                      {resetResult.password}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(resetResult.password, "Password")}
                    className="p-1.5 rounded-lg text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-800/50 transition cursor-pointer"
                    title="Copy Password"
                  >
                    {copiedField === "Password" ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={onClose} variant="primary">
                Done
              </Button>
            </div>
          </div>
        ) : (
          /* Password Configuration Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                  New Password <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleGenerateRandom}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-600 hover:text-orange-700 dark:text-orange-400 transition cursor-pointer"
                >
                  <Wand2 size={12} />
                  <span>Auto-generate</span>
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter min. 6 characters"
                  required
                  minLength={6}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-3.5 pr-20 py-2.5 text-xs font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopy(password, "Password")}
                    className="p-1 rounded-lg text-slate-400 hover:text-orange-600 transition"
                    title="Copy to clipboard"
                  >
                    {copiedField === "Password" ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Options */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-2.5">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300 select-none">
                <input
                  type="checkbox"
                  checked={forcePasswordChange}
                  onChange={(e) => setForcePasswordChange(e.target.checked)}
                  className="rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="font-semibold">
                  Prompt student to change password upon next login
                </span>
              </label>

              <div className="flex items-center gap-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                <CheckCircle2 size={13} className="shrink-0" />
                <span>Account will be unblocked and expiry date permanently removed</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                icon={<KeyRound size={14} />}
              >
                Reset Password
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};

export default ResetStudentPasswordModal;

