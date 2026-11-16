import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser, clearError } from "../store/slices/authSlice.js";
import { Lock, Mail, Loader2, Eye, EyeOff, ShieldCheck, KeyRound, CheckCircle2, X } from "lucide-react";
import rgLogo from "../assets/logo/RGLOGO.png";
import api from "../services/api.js";

const Login = () => {
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localErrors, setLocalErrors] = useState({});
  const [checkingSchool, setCheckingSchool] = useState(false);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState("");
  const [forgotError, setForgotError] = useState("");

  // Redirect to Dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const validateForm = () => {
    const errors = {};
    if (!username.trim()) errors.username = "Username or Email is required";
    if (!password.trim()) errors.password = "Password is required";
    setLocalErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!validateForm()) return;
    dispatch(clearError());
    setCheckingSchool(true);

    try {
      // 1. First API call: Check school status, ID, name, and active validity
      const schoolCheck = await api.get(
        `/auth/school-check?identifier=${encodeURIComponent(username.trim())}`
      );

      if (
        schoolCheck.data?.status === "suspended" ||
        schoolCheck.data?.schoolStatus === "suspended"
      ) {
        sessionStorage.setItem(
          "rges_suspended_info",
          JSON.stringify({
            schoolId: schoolCheck.data.schoolId,
            schoolName: schoolCheck.data.schoolName || "Your School",
            message:
              schoolCheck.data.message ||
              `Access to '${schoolCheck.data.schoolName}' has been suspended. Please contact RGES Support.`,
          })
        );
        navigate("/suspended", { replace: true });
        return;
      }

      if (schoolCheck.data?.school) {
        const sc = schoolCheck.data.school;
        localStorage.setItem("rges_school_info", JSON.stringify(sc));
        if (sc.schoolId) {
          localStorage.setItem("rges_school_id", sc.schoolId);
          localStorage.setItem("rges_school_collection", sc.schoolId);
        }
      }
    } catch (err) {
      if (
        err.response?.data?.status === "suspended" ||
        err.response?.data?.schoolStatus === "suspended" ||
        (err.response?.data?.message &&
          typeof err.response.data.message === "string" &&
          err.response.data.message.toLowerCase().includes("suspended"))
      ) {
        sessionStorage.setItem(
          "rges_suspended_info",
          JSON.stringify({
            schoolId: err.response?.data?.schoolId,
            schoolName: err.response?.data?.schoolName || "Your School",
            message: err.response?.data?.message,
          })
        );
        navigate("/suspended", { replace: true });
        return;
      }
      // If identifier is not found yet, proceed to loginUser which returns precise credentials validation
    } finally {
      setCheckingSchool(false);
    }

    // 2. Then hit login user API
    const result = await dispatch(
      loginUser({ username, password, email: username })
    );

    if (result.meta.requestStatus === "fulfilled") {
      navigate("/", { replace: true });
    }
  };

  const handleForgotPasswordReset = async (e) => {
    e.preventDefault();
    setForgotError("");
    setForgotMsg("");

    if (!forgotIdentifier.trim()) {
      setForgotError("Please enter your registered Email or Admission Number");
      return;
    }
    if (!forgotNewPassword || forgotNewPassword.length < 6) {
      setForgotError("New password must be at least 6 characters long");
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError("Passwords do not match");
      return;
    }

    try {
      setForgotLoading(true);
      const res = await api.post("/auth/forgot-password", {
        identifier: forgotIdentifier.trim(),
        newPassword: forgotNewPassword,
      });

      setForgotMsg(
        res.data?.message ||
          "Password reset successfully! You can now sign in with your new password."
      );
      // Auto populate login form
      setUsername(forgotIdentifier.trim());
      setPassword(forgotNewPassword);

      setTimeout(() => {
        setShowForgotModal(false);
        setForgotIdentifier("");
        setForgotNewPassword("");
        setForgotConfirmPassword("");
        setForgotMsg("");
      }, 2000);
    } catch (err) {
      setForgotError(
        err.response?.data?.message || "Failed to reset password. Please check your details."
      );
    } finally {
      setForgotLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleLogin(e);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center font-sans px-4 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #141312 0%, #26160C 50%, #141312 100%)",
      }}
    >
      {/* Warm ambient sunset orbs */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-orange-500/10 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-amber-500/10 blur-[100px]" />

      <div className="relative z-10 w-full max-w-md bg-[#1C1B1A]/85 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/50">
        {/* Header */}
        <div className="text-center mb-8">
          <img
            src={rgLogo}
            alt="RG EduCore Logo"
            style={{ mixBlendMode: "screen" }}
            className="inline-block w-24 h-24 object-contain mb-4"
          />
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            RG EduCore
          </h2>
          <p className="text-orange-400/90 text-xs mt-2 uppercase tracking-widest font-bold">
            The Core of Smarter School Management
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-200 text-xs rounded-xl flex items-center gap-2">
            <span>⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {/* Login Form: ALWAYS visible directly (no self-registration from client ERP) */}
        <div className="space-y-5">
          {/* Username / Email */}
          <div>
            <label className="block text-stone-300 text-xs font-semibold mb-2">
              Username / Official Email
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3.5 top-3.5 text-stone-500"
                size={16}
              />
              <input
                type="text"
                placeholder="e.g. principal@school.edu or student ID"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-[#121214]/60 border border-stone-700/60 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 placeholder-stone-500"
              />
            </div>
            {localErrors.username && (
              <p className="text-red-400 text-[10px] mt-1 font-semibold">
                {localErrors.username}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-stone-300 text-xs font-semibold">
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setForgotIdentifier(username);
                  setShowForgotModal(true);
                }}
                className="text-[11px] text-orange-400 hover:text-orange-300 hover:underline font-semibold cursor-pointer transition-colors"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock
                className="absolute left-3.5 top-3.5 text-stone-500"
                size={16}
              />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-[#121214]/60 border border-stone-700/60 rounded-xl py-3 pl-11 pr-11 text-white text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 placeholder-stone-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-stone-500 hover:text-stone-300 transition-colors focus:outline-none cursor-pointer"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {localErrors.password && (
              <p className="text-red-400 text-[10px] mt-1 font-semibold">
                {localErrors.password}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleLogin}
            disabled={loading || checkingSchool}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-3.5 px-4 rounded-xl text-sm focus:outline-none flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 disabled:opacity-50 cursor-pointer transition-all"
          >
            {loading || checkingSchool ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <span>Sign In to School ERP</span>
            )}
          </button>
        </div>

        {/* Footer info: Institutional Registration is via Admin Panel */}
        <div className="mt-8 pt-5 border-t border-white/5 text-center flex items-center justify-center gap-1.5 text-stone-400 text-[11px]">
          <ShieldCheck size={13} className="text-orange-400 shrink-0" />
          <span>School onboarding is managed via the RGES Admin Portal</span>
        </div>
      </div>

      {/* ── Forgot Password Modal ────────────────────────────────────────── */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md px-4">
          <div className="relative w-full max-w-md bg-[#1C1B1A] border border-orange-500/20 rounded-3xl p-6 shadow-2xl text-left">
            {/* Close button */}
            <button
              type="button"
              onClick={() => {
                setShowForgotModal(false);
                setForgotError("");
                setForgotMsg("");
              }}
              className="absolute top-5 right-5 text-stone-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/25 flex items-center justify-center text-orange-400 shrink-0">
                <KeyRound size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Reset Password
                </h3>
                <p className="text-stone-400 text-xs">
                  For students, faculty, and school staff
                </p>
              </div>
            </div>

            {forgotError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-300 text-xs rounded-xl flex items-center gap-2">
                <span>⚠️</span>
                <p>{forgotError}</p>
              </div>
            )}

            {forgotMsg && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 size={16} className="shrink-0" />
                <p>{forgotMsg}</p>
              </div>
            )}

            <form onSubmit={handleForgotPasswordReset} className="space-y-4">
              <div>
                <label className="block text-stone-300 text-xs font-semibold mb-1.5">
                  Registered Email or Admission/Employee ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. jiya@gmail.com or STD-2026-0001"
                  value={forgotIdentifier}
                  onChange={(e) => setForgotIdentifier(e.target.value)}
                  className="w-full bg-[#121214] border border-stone-700/60 rounded-xl py-2.5 px-3.5 text-white text-sm focus:outline-none focus:border-orange-500 placeholder-stone-500"
                  required
                />
              </div>

              <div>
                <label className="block text-stone-300 text-xs font-semibold mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={forgotNewPassword}
                  onChange={(e) => setForgotNewPassword(e.target.value)}
                  className="w-full bg-[#121214] border border-stone-700/60 rounded-xl py-2.5 px-3.5 text-white text-sm focus:outline-none focus:border-orange-500 placeholder-stone-500"
                  required
                />
              </div>

              <div>
                <label className="block text-stone-300 text-xs font-semibold mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  placeholder="Re-enter new password"
                  value={forgotConfirmPassword}
                  onChange={(e) => setForgotConfirmPassword(e.target.value)}
                  className="w-full bg-[#121214] border border-stone-700/60 rounded-xl py-2.5 px-3.5 text-white text-sm focus:outline-none focus:border-orange-500 placeholder-stone-500"
                  required
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl text-stone-300 hover:text-white border border-stone-700 text-xs font-semibold hover:bg-white/5 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  {forgotLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <span>Set New Password</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
