import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { loginUser, clearError } from "../store/slices/authSlice.js";
import { Lock, Mail, Loader2 } from "lucide-react";
import rgLogo from "../assets/logo/RGLOGO.png";
import api from "../services/api.js";

const Login = () => {
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [localErrors, setLocalErrors] = useState({});
  const [companyLogo, setCompanyLogo] = useState("");

  // Redirect to Dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const loadCompanyProfile = async () => {
      try {
        const res = await api.get("/company/profile");
        setCompanyLogo(res.data.company?.companyLogo || "");
      } catch (err) {
        setCompanyLogo("");
      }
    };

    loadCompanyProfile();
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
      className="min-h-screen flex items-center justify-center font-sans px-4"
      style={{
        background:
          "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
      }}
    >
      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
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
          <p className="text-slate-400 text-xs mt-2 uppercase tracking-widest font-semibold">
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
            <label className="block text-slate-300 text-xs font-semibold mb-2">
              Username / Email
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3.5 top-3.5 text-slate-500"
                size={16}
              />
              <input
                type="text"
                placeholder="superadmin / accountant / student"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-slate-950/40 border border-slate-700/60 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-slate-600"
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
              <label className="block text-slate-300 text-xs font-semibold">
                Password
              </label>
              <a
                href="#"
                className="text-[10px] text-indigo-400 hover:underline"
              >
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <Lock
                className="absolute left-3.5 top-3.5 text-slate-500"
                size={16}
              />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-slate-950/40 border border-slate-700/60 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-slate-600"
              />
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
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl text-sm focus:outline-none flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </div>

        {/* Register Super Admin Link */}
        <div className="mt-8 border-t border-slate-800 pt-6 text-center">
          <p className="text-slate-500 text-xs font-semibold">
            First time here?{" "}
            <Link
              to="/signup"
              className="text-indigo-400 hover:underline font-bold"
            >
              Register Super Admin
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
