import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  ShieldAlert,
  LogOut,
  Clock,
  Building2,
  Mail,
  AlertTriangle,
} from "lucide-react";
import { logoutUser } from "../store/slices/authSlice.js";
import rgLogo from "../assets/logo/RGLOGO.png";

const COUNTDOWN_SECONDS = 30;

const SuspendedPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [timeLeft, setTimeLeft] = useState(COUNTDOWN_SECONDS);
  const [suspendedInfo, setSuspendedInfo] = useState({
    schoolId: "",
    schoolName: "Your School",
    message: "Access to this institution has been suspended by administration.",
  });

  useEffect(() => {
    // Read cached or session suspension details
    try {
      const raw = sessionStorage.getItem("rges_suspended_info");
      if (raw) {
        const parsed = JSON.parse(raw);
        setSuspendedInfo((prev) => ({ ...prev, ...parsed }));
      } else {
        const storedSchool = localStorage.getItem("rges_school_info");
        const storedId = localStorage.getItem("rges_school_id");
        if (storedSchool) {
          const s = JSON.parse(storedSchool);
          setSuspendedInfo({
            schoolId: s.schoolId || s._id || storedId || "",
            schoolName: s.schoolName || "Your School",
            message: `Access to '${s.schoolName || "this school"}' has been suspended. Please contact RGES Support.`,
          });
        }
      }
    } catch (_e) {
      // ignore
    }
  }, []);

  const handleImmediateLogout = () => {
    dispatch(logoutUser());
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("rges_school_id");
    localStorage.removeItem("rges_school_collection");
    localStorage.removeItem("rges_school_info");
    sessionStorage.removeItem("rges_suspended_info");
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    if (timeLeft <= 0) {
      handleImmediateLogout();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const progressPercent = Math.max(0, ((COUNTDOWN_SECONDS - timeLeft) / COUNTDOWN_SECONDS) * 100);

  return (
    <div
      className="min-h-screen flex items-center justify-center font-sans px-4 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #140d0b 0%, #291209 50%, #120c0a 100%)",
      }}
    >
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -top-28 -right-28 w-96 h-96 rounded-full bg-red-600/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-28 -left-28 w-96 h-96 rounded-full bg-orange-600/10 blur-[120px]" />

      <div className="relative z-10 w-full max-w-lg bg-[#1a1412]/90 backdrop-blur-2xl border border-red-500/20 rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 shadow-2xl shadow-black/80 text-center">
        {/* Header & Logo */}
        <div className="flex flex-col items-center mb-5 sm:mb-6">
          <img
            src={rgLogo}
            alt="RG EduCore"
            style={{ mixBlendMode: "screen" }}
            className="w-16 h-16 sm:w-20 sm:h-20 object-contain mb-3 opacity-90"
          />
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2">
            <AlertTriangle size={13} />
            <span>Institution Suspended</span>
          </div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-tight">
            School Access Suspended
          </h1>
        </div>

        {/* School Identifier Card */}
        <div className="mb-4 sm:mb-6 p-3.5 sm:p-4 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/20 flex items-center justify-center text-red-400">
              <Building2 size={20} />
            </div>
            <div>
              <p className="text-white font-bold text-sm">
                {suspendedInfo.schoolName || "Iqra public school"}
              </p>
              <p className="text-stone-400 text-xs">
                School ID:{" "}
                <span className="font-mono text-orange-400 font-semibold">
                  {suspendedInfo.schoolId || "IQRA_P01001"}
                </span>
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-red-500/20 text-red-300 text-[11px] font-extrabold uppercase tracking-wide">
            Suspended
          </span>
        </div>

        {/* Suspension Notice Details */}
        <div className="mb-6 text-stone-300 text-xs leading-relaxed space-y-2 text-left bg-stone-900/40 border border-white/5 rounded-2xl p-4">
          <div className="flex items-start gap-2 text-stone-200 font-medium">
            <ShieldAlert size={16} className="text-red-400 shrink-0 mt-0.5" />
            <p>
              {suspendedInfo.message ||
                "Access to this school has been suspended by the platform administrator."}
            </p>
          </div>
          <p className="text-stone-400 text-[11px] pl-6">
            All user logins, student/staff portals, and ERP dashboard services for this institution are temporarily disabled until administrative reinstatement.
          </p>
        </div>

        {/* 30-Second Countdown & Progress */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-b from-orange-500/10 to-transparent border border-orange-500/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs text-stone-300 font-semibold">
              <Clock size={14} className="text-orange-400 animate-pulse" />
              <span>Auto-logout countdown</span>
            </div>
            <span className="font-mono text-base font-black text-orange-400">
              {timeLeft}s
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-stone-800/80 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-orange-500 to-red-500 h-full transition-all duration-1000 ease-linear rounded-full"
              style={{ width: `${100 - progressPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-stone-400 mt-2">
            You will be automatically logged out and redirected to login in{" "}
            <strong className="text-white font-bold">{timeLeft} seconds</strong>.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleImmediateLogout}
            className="w-full bg-gradient-to-r from-stone-800 to-stone-700 hover:from-stone-700 hover:to-stone-600 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 border border-white/10 shadow-lg cursor-pointer transition-all"
          >
            <LogOut size={15} />
            <span>Logout Immediately</span>
          </button>

          <div className="pt-2 flex items-center justify-center gap-2 text-stone-400 text-xs">
            <Mail size={13} className="text-orange-400" />
            <span>Need assistance? Contact</span>
            <a
              href="mailto:support@rges.com"
              className="text-orange-400 hover:underline font-semibold"
            >
              support@rges.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuspendedPage;
