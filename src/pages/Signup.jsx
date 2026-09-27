import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {
  Lock,
  Mail,
  Loader2,
  User,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  RefreshCw,
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { toast } from 'react-toastify';
import rgLogo from '../assets/logo/RGLOGO.png';
import api from '../services/api.js';
import { fetchMe } from '../store/slices/authSlice.js';

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 = Input Details, 2 = Verify OTP, 3 = Success
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [checkingSetup, setCheckingSetup] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [countdown, setCountdown] = useState(60);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [otp, setOtp] = useState('');
  const [localErrors, setLocalErrors] = useState({});

  // Verify whether the system actually requires setup (no existing users)
  useEffect(() => {
    let isMounted = true;
    const verifySetupRequirement = async () => {
      try {
        const res = await api.get('/auth/setup-status');
        if (isMounted) {
          if (!res.data?.isSetupRequired) {
            toast.info('Super Admin already exists. Please log in.');
            navigate('/login', { replace: true });
          }
          setCheckingSetup(false);
        }
      } catch {
        if (isMounted) setCheckingSetup(false);
      }
    };

    verifySetupRequirement();
    return () => {
      isMounted = false;
    };
  }, [navigate]);

  // Resend Countdown Timer
  useEffect(() => {
    if (step !== 2 || countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [step, countdown]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (localErrors[name]) {
      setLocalErrors((prev) => ({ ...prev, [name]: null }));
    }
    setErrorMessage('');
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Super Admin Name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 5) {
      errors.password = 'Password must be at least 5 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setLocalErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Step 1: Send OTP to Email via Resend
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrorMessage('');

    try {
      const res = await api.post('/auth/send-otp', {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      toast.success(res.data?.message || 'Verification code sent to your email!');
      setStep(2);
      setCountdown(60);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to send verification code';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Resend OTP
  const handleResendOtp = async () => {
    if (countdown > 0 || resending) return;
    setResending(true);
    setErrorMessage('');

    try {
      const res = await api.post('/auth/send-otp', {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      toast.success(res.data?.message || 'New verification code sent!');
      setCountdown(60);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to resend code';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setResending(false);
    }
  };

  // Step 2: Verify OTP & Activate Super Admin
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    const cleanOtp = otp.trim();

    if (!cleanOtp || cleanOtp.length < 6) {
      setErrorMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const res = await api.post('/auth/verify-otp', {
        email: formData.email.trim(),
        otp: cleanOtp,
      });

      const data = res.data;
      if (data?.accessToken) {
        localStorage.setItem('token', data.accessToken);
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        dispatch(fetchMe());
      }

      setStep(3);
      toast.success('Super Admin verified and registered successfully!');

      // Smooth transition to setup/dashboard after 1.5 seconds
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 1500);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Invalid verification code';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (checkingSetup) {
    return (
      <div
        className="min-h-screen flex items-center justify-center font-sans px-4"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
        }}
      >
        <div className="flex flex-col items-center gap-3 text-slate-300">
          <Loader2 className="animate-spin text-indigo-400" size={32} />
          <p className="text-xs uppercase tracking-widest font-semibold">Checking system setup status...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center font-sans px-4 py-12"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
      }}
    >
      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl transition-all duration-300">
        {/* Header */}
        <div className="text-center mb-8">
          <img
            src={rgLogo}
            alt="RG EduCore Logo"
            style={{ mixBlendMode: 'screen' }}
            className="inline-block w-20 h-20 object-contain mb-3"
          />
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            RG EduCore
          </h2>
          <p className="text-slate-400 text-xs mt-1 uppercase tracking-widest font-semibold">
            {step === 1 && 'Super Admin Initial Setup'}
            {step === 2 && 'Email OTP Verification'}
            {step === 3 && 'Setup Completed'}
          </p>
        </div>

        {/* Global Error Notice */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-200 text-xs rounded-xl flex items-center gap-2">
            <span>⚠️</span>
            <p>{errorMessage}</p>
          </div>
        )}

        {/* ─── STEP 1: Registration Form ────────────────────────────────────────── */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            {/* Super Admin Name */}
            <div>
              <label className="block text-slate-300 text-xs font-semibold mb-1.5">
                Super Admin Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 text-slate-500" size={16} />
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Dr. Alexander Smith"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-slate-950/40 border border-slate-700/60 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-slate-600"
                />
              </div>
              {localErrors.name && (
                <p className="text-red-400 text-[10px] mt-1 font-semibold">{localErrors.name}</p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-slate-300 text-xs font-semibold mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 text-slate-500" size={16} />
                <input
                  type="email"
                  name="email"
                  placeholder="admin@school.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-slate-950/40 border border-slate-700/60 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-slate-600"
                />
              </div>
              {localErrors.email && (
                <p className="text-red-400 text-[10px] mt-1 font-semibold">{localErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-slate-300 text-xs font-semibold mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 text-slate-500" size={16} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-slate-950/40 border border-slate-700/60 rounded-xl py-3 pl-11 pr-11 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-slate-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 transition-colors focus:outline-none cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {localErrors.password && (
                <p className="text-red-400 text-[10px] mt-1 font-semibold">{localErrors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-slate-300 text-xs font-semibold mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 text-slate-500" size={16} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full bg-slate-950/40 border border-slate-700/60 rounded-xl py-3 pl-11 pr-11 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-slate-600"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 transition-colors focus:outline-none cursor-pointer"
                  tabIndex={-1}
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {localErrors.confirmPassword && (
                <p className="text-red-400 text-[10px] mt-1 font-semibold">
                  {localErrors.confirmPassword}
                </p>
              )}
            </div>

            {/* Continue Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl text-sm focus:outline-none flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  <span>Verify Email with OTP</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            {/* Back to Login */}
            <div className="mt-6 border-t border-slate-800 pt-5 text-center">
              <Link
                to="/login"
                className="text-xs text-slate-400 hover:text-indigo-400 transition-colors inline-flex items-center gap-1.5"
              >
                <ArrowLeft size={14} /> Already have an account? Sign In
              </Link>
            </div>
          </form>
        )}

        {/* ─── STEP 2: OTP Verification ────────────────────────────────────────── */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="text-center p-3 bg-indigo-950/40 border border-indigo-500/20 rounded-2xl">
              <ShieldCheck className="mx-auto text-indigo-400 mb-2" size={32} />
              <p className="text-xs text-slate-300">
                We sent a 6-digit verification code to
              </p>
              <p className="text-sm font-bold text-indigo-300 mt-0.5 break-all">
                {formData.email}
              </p>
            </div>

            <div>
              <label className="block text-slate-300 text-xs font-semibold mb-2 text-center">
                Enter 6-Digit OTP Code
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-3.5 text-slate-500" size={18} />
                <input
                  type="text"
                  maxLength={6}
                  autoFocus
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setOtp(val);
                    setErrorMessage('');
                  }}
                  className="w-full bg-slate-950/40 border border-slate-700/60 rounded-xl py-3 pl-11 pr-4 text-white text-center font-mono text-xl tracking-[0.4em] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-slate-600"
                />
              </div>
            </div>

            {/* Resend Section */}
            <div className="flex items-center justify-between text-xs px-1">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Change Email
              </button>

              <button
                type="button"
                disabled={countdown > 0 || resending}
                onClick={handleResendOtp}
                className="text-indigo-400 hover:text-indigo-300 font-semibold disabled:text-slate-600 transition-colors flex items-center gap-1 cursor-pointer"
              >
                {resending ? (
                  <Loader2 className="animate-spin" size={13} />
                ) : (
                  <RefreshCw size={13} />
                )}
                {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend Code'}
              </button>
            </div>

            {/* Verify & Create Account Button */}
            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl text-sm focus:outline-none flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  <ShieldCheck size={18} />
                  <span>Verify & Create Super Admin</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* ─── STEP 3: Setup Success ───────────────────────────────────────────── */}
        {step === 3 && (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-xl font-black text-white">Super Admin Registered!</h3>
            <p className="text-xs text-slate-300 max-w-xs mx-auto">
              Your account has been verified. Redirecting you to the system dashboard to complete your school setup...
            </p>
            <div className="flex justify-center pt-2">
              <Loader2 className="animate-spin text-indigo-400" size={24} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Signup;
