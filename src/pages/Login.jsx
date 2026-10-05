import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { loginUser, clearError } from "../store/slices/authSlice.js";
import { Lock, Mail, Loader2, Eye, EyeOff } from "lucide-react";
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
  const [isSetupRequired, setIsSetupRequired] = useState(false);

  // Redirect to Dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Check if system requires initial Super Admin setup (no users in DB)
  useEffect(() => {
    let isMounted = true;
    const checkSetup = async () => {
      try {
        const res = await api.get("/auth/setup-status");
        if (isMounted) {
          setIsSetupRequired(Boolean(res.data?.isSetupRequired));
        }
      } catch {
        if (isMounted) {
          setIsSetupRequired(false);
        }
      }
    };

    checkSetup();
    return () => {
      isMounted = false;
    };
  }, []);

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
    const result = await dispatch(loginUser({ username, password, email: username }));
    if (result.meta.requestStatus === "fulfilled") {
      navigate("/", { replace: true });
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
            style={{ mixBlendMode: 'screen' }}
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

        {/* Form Container */}
        <div className="space-y-5">
          {/* Username */}
          <div>
            <label className="block text-stone-300 text-xs font-semibold mb-2">
              Username / Email
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3.5 top-3.5 text-stone-500"
                size={16}
              />
              <input
                type="text"
                placeholder="superadmin / accountant / student"
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
              <a
                href="#"
                className="text-[10px] text-orange-400 hover:underline font-medium"
              >
                Forgot password?
              </a>
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
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-3.5 px-4 rounded-xl text-sm focus:outline-none flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 disabled:opacity-50 cursor-pointer transition-all"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </div>

        {/* Register Super Admin Link - Only visible when NO users exist in DB */}
        {isSetupRequired && (
          <div className="mt-8 border-t border-stone-800 pt-6 text-center">
            <p className="text-stone-400 text-xs font-semibold">
              First time here?{" "}
              <Link
                to="/signup"
                className="text-orange-400 hover:underline font-bold"
              >
                Register Super Admin
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
