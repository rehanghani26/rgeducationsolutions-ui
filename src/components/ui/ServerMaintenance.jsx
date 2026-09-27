import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw,
  Clock,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  Wifi,
  WifiOff,
  Settings,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
} from "lucide-react";
import { useSchoolBranding } from "../../context/SchoolBrandingContext.jsx";
import { useTheme } from "../../theme/ThemeContext.jsx";
import axios from "axios";

const BACKEND_URL = "http://localhost:5000";

// ── Animated gear SVG ──────────────────────────────────────────
function GearIcon({ size = 24, className = "", style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path d="M19.622 10.395l-1.097-2.65L20 6l-2-2-1.735 1.483-2.707-1.113L12.935 2h-1.954l-.632 2.401-2.645 1.115L6 4 4 6l1.453 1.789-1.08 2.657L2 11v2l2.401.655 1.117 2.699L4 18l2 2 1.791-1.46 2.606 1.072L11 22h2l.604-2.401 2.651-1.108L18 20l2-2-1.46-1.803 1.072-2.606L22 13v-2l-2.378-.605Z" />
    </svg>
  );
}

// ── Orbit animation dots ──────────────────────────────────────
function OrbitDot({ angle, delay, color }) {
  return (
    <motion.div
      className={`absolute w-2 h-2 rounded-full ${color}`}
      style={{
        top: "50%",
        left: "50%",
        marginTop: -4,
        marginLeft: -4,
        transformOrigin: "4px 4px",
      }}
      animate={{
        rotate: [angle, angle + 360],
        x: [Math.cos((angle * Math.PI) / 180) * 52, Math.cos(((angle + 360) * Math.PI) / 180) * 52],
        y: [Math.sin((angle * Math.PI) / 180) * 52, Math.sin(((angle + 360) * Math.PI) / 180) * 52],
      }}
      transition={{ duration: 6, repeat: Infinity, ease: "linear", delay }}
    />
  );
}

export default function ServerMaintenance({ errorInfo = null, onRetry = null }) {
  const { schoolLogo, schoolName } = useSchoolBranding();
  const { isDark } = useTheme();

  const [isChecking, setIsChecking] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [copied, setCopied] = useState(false);
  const [showDiag, setShowDiag] = useState(false);
  const [checkResult, setCheckResult] = useState(null);
  const [pingTime, setPingTime] = useState(null);

  const handleCheckConnection = useCallback(async () => {
    setIsChecking(true);
    setCheckResult(null);
    const start = Date.now();

    try {
      if (typeof onRetry === "function") {
        const ok = await onRetry();
        if (ok) {
          setCheckResult("online");
          setPingTime(Date.now() - start);
          setTimeout(() => window.location.reload(), 800);
          return;
        }
      }

      const res = await axios
        .get(`${BACKEND_URL}/api/health`, { timeout: 4000 })
        .catch(async () =>
          axios.get(`${BACKEND_URL}/api/v1/company/profile`, { timeout: 4000 })
        );

      if (res?.status >= 200 && res?.status < 400) {
        setCheckResult("online");
        setPingTime(Date.now() - start);
        setTimeout(() => window.location.reload(), 800);
        return;
      }
      setCheckResult("offline");
    } catch {
      setCheckResult("offline");
    } finally {
      setIsChecking(false);
      setCountdown(30);
    }
  }, [onRetry]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          handleCheckConnection();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [handleCheckConnection]);

  const handleCopyDiag = () => {
    navigator.clipboard
      .writeText(
        JSON.stringify(
          {
            timestamp: new Date().toISOString(),
            url: window.location.href,
            backendUrl: BACKEND_URL,
            error: errorInfo?.message || "ERR_CONNECTION_REFUSED",
            status: errorInfo?.status || 0,
            userAgent: navigator.userAgent,
          },
          null,
          2
        )
      )
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
  };

  // Progress ring for countdown
  const progress = ((30 - countdown) / 30) * 100;
  const circumference = 2 * Math.PI * 18;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div
      className={`fixed inset-0 z-[9999] overflow-y-auto flex flex-col ${
        isDark
          ? "bg-[#080c14] text-white"
          : "bg-[#f0f4ff] text-slate-900"
      }`}
    >
      {/* ── Premium Background ─────────────────────────────────── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Grid */}
        <div
          className={`absolute inset-0 ${
            isDark
              ? "bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)]"
              : "bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)]"
          } bg-[size:40px_40px]`}
        />
        {/* Radial glow spots */}
        <div
          className={`absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full blur-[120px] ${
            isDark ? "bg-violet-600/20" : "bg-violet-400/20"
          }`}
        />
        <div
          className={`absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[100px] ${
            isDark ? "bg-blue-600/15" : "bg-blue-400/15"
          }`}
        />
        <div
          className={`absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[90px] ${
            isDark ? "bg-amber-600/10" : "bg-amber-400/10"
          }`}
        />
      </div>

      {/* ── Top Header Bar ─────────────────────────────────────── */}
      <header className="relative z-10 w-full max-w-6xl mx-auto flex items-center justify-between px-6 pt-6 pb-2">
        {/* Logo + School Name */}
        <div className="flex items-center gap-3">
          {schoolLogo ? (
            <div
              className={`w-10 h-10 rounded-2xl overflow-hidden border ${
                isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"
              } p-1 shadow-lg`}
            >
              <img src={schoolLogo} alt="Logo" className="w-full h-full object-contain" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-violet-500/30">
              RG
            </div>
          )}
          <div>
            <div className={`font-bold text-sm leading-tight ${isDark ? "text-white" : "text-slate-900"}`}>
              {schoolName || "RG EduCore ERP"}
            </div>
            <div className={`text-[11px] font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Campus Management System
            </div>
          </div>
        </div>

        {/* Live status pill */}
        <div
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border backdrop-blur-sm ${
            isDark
              ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
              : "bg-amber-50 border-amber-300 text-amber-700"
          }`}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
          </span>
          Maintenance Mode
        </div>
      </header>

      {/* ── Main Content ───────────────────────────────────────── */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-3xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
            {/* LEFT — Main message */}
            <div className="space-y-7">
              {/* Hero illustration */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center justify-center lg:justify-start"
              >
                <div className="relative w-36 h-36">
                  {/* Outer orbit ring */}
                  <div
                    className={`absolute inset-0 rounded-full border-2 border-dashed opacity-30 animate-spin ${
                      isDark ? "border-violet-400" : "border-violet-600"
                    }`}
                    style={{ animationDuration: "12s" }}
                  />

                  {/* Orbit dots */}
                  <OrbitDot angle={0} delay={0} color={isDark ? "bg-violet-400" : "bg-violet-600"} />
                  <OrbitDot angle={120} delay={2} color={isDark ? "bg-amber-400" : "bg-amber-500"} />
                  <OrbitDot angle={240} delay={4} color={isDark ? "bg-blue-400" : "bg-blue-600"} />

                  {/* Inner glowing circle */}
                  <div className="absolute inset-6">
                    <div
                      className={`w-full h-full rounded-full flex items-center justify-center border-2 shadow-2xl ${
                        isDark
                          ? "bg-gradient-to-br from-slate-800 to-slate-900 border-violet-500/40 shadow-violet-500/20"
                          : "bg-gradient-to-br from-white to-slate-100 border-violet-300/60 shadow-violet-300/30"
                      }`}
                    >
                      {/* Animated gear */}
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                      >
                        <GearIcon
                          size={36}
                          className={isDark ? "text-violet-400" : "text-violet-600"}
                        />
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Text block */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="space-y-4 text-center lg:text-left"
              >
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${
                    isDark
                      ? "bg-violet-500/10 border-violet-500/30 text-violet-400"
                      : "bg-violet-100 border-violet-300 text-violet-700"
                  }`}
                >
                  <WifiOff size={12} />
                  Backend Server Offline
                </div>

                <h1
                  className={`text-3xl sm:text-5xl font-black leading-tight tracking-tight ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  We&apos;re Under{" "}
                  <span
                    className={`bg-clip-text text-transparent bg-gradient-to-r ${
                      isDark
                        ? "from-violet-400 via-purple-400 to-blue-400"
                        : "from-violet-600 via-purple-600 to-blue-600"
                    }`}
                  >
                    Maintenance
                  </span>
                </h1>

                <p
                  className={`text-base leading-relaxed max-w-md mx-auto lg:mx-0 ${
                    isDark ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  Our backend server is currently offline or undergoing a scheduled upgrade. We&apos;re working to restore services as quickly as possible.
                </p>

                {/* Status grid */}
                <div className="grid grid-cols-2 gap-3 pt-2 max-w-sm mx-auto lg:mx-0">
                  {[
                    { label: "API Server", status: "offline", icon: WifiOff },
                    { label: "Database", status: "checking", icon: Settings },
                    { label: "Front-end", status: "online", icon: Wifi },
                    { label: "Auth Service", status: "offline", icon: WifiOff },
                  ].map(({ label, status, icon: Icon }) => (
                    <div
                      key={label}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-xs font-semibold ${
                        isDark
                          ? "bg-white/5 border-white/10 text-slate-300"
                          : "bg-white/80 border-slate-200 text-slate-600"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          status === "online"
                            ? "bg-emerald-500"
                            : status === "checking"
                            ? "bg-amber-500 animate-pulse"
                            : "bg-red-500"
                        }`}
                      />
                      <Icon size={12} className={isDark ? "text-slate-400" : "text-slate-500"} />
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* RIGHT — Reconnect card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="space-y-4"
            >
              {/* Auto-reconnect card */}
              <div
                className={`rounded-3xl border p-5 space-y-5 shadow-2xl ${
                  isDark
                    ? "bg-white/[0.04] border-white/10 backdrop-blur-xl shadow-black/30"
                    : "bg-white border-slate-200 backdrop-blur-xl shadow-slate-200/80"
                }`}
              >
                {/* Countdown ring */}
                <div className="flex items-center gap-4">
                  <div className="relative w-[52px] h-[52px] flex-shrink-0">
                    <svg
                      className="absolute inset-0 w-full h-full -rotate-90"
                      viewBox="0 0 40 40"
                    >
                      <circle
                        cx="20" cy="20" r="18"
                        fill="none"
                        stroke={isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}
                        strokeWidth="3"
                      />
                      <circle
                        cx="20" cy="20" r="18"
                        fill="none"
                        stroke={isDark ? "#8b5cf6" : "#7c3aed"}
                        strokeWidth="3"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        style={{ transition: "stroke-dashoffset 1s linear" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`text-sm font-black ${isDark ? "text-violet-400" : "text-violet-600"}`}>
                        {countdown}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className={`font-bold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>
                      Auto-reconnecting
                    </div>
                    <div className={`text-xs ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                      Checking server every 30s
                    </div>
                  </div>
                </div>

                {/* Status feedback */}
                <AnimatePresence mode="wait">
                  {checkResult && (
                    <motion.div
                      key={checkResult}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className={`flex items-center gap-2.5 p-3 rounded-2xl text-xs font-semibold border ${
                        checkResult === "online"
                          ? isDark
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : "bg-emerald-50 border-emerald-200 text-emerald-700"
                          : isDark
                          ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                          : "bg-amber-50 border-amber-200 text-amber-700"
                      }`}
                    >
                      {checkResult === "online" ? (
                        <>
                          <CheckCircle2 size={15} className="flex-shrink-0" />
                          <span>
                            Server is back online!{pingTime && ` (${pingTime}ms)`} Reloading…
                          </span>
                        </>
                      ) : (
                        <>
                          <AlertCircle size={15} className="flex-shrink-0" />
                          <span>Still unreachable. Retrying in {countdown}s…</span>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Retry button */}
                <button
                  type="button"
                  onClick={handleCheckConnection}
                  disabled={isChecking}
                  className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm py-3 px-6 rounded-2xl transition-all shadow-lg shadow-violet-600/30 cursor-pointer select-none"
                >
                  <RefreshCw size={15} className={isChecking ? "animate-spin" : ""} />
                  {isChecking ? "Pinging Server…" : "Retry Connection Now"}
                </button>

                {/* Divider */}
                <div
                  className={`border-t ${isDark ? "border-white/8" : "border-slate-100"}`}
                />

                {/* Collapsible diagnostics */}
                <div>
                  <button
                    type="button"
                    onClick={() => setShowDiag(!showDiag)}
                    className={`w-full flex items-center justify-between text-[11px] font-semibold py-0.5 transition-colors cursor-pointer ${
                      isDark
                        ? "text-slate-500 hover:text-slate-300"
                        : "text-slate-400 hover:text-slate-700"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Settings size={11} />
                      Error diagnostics
                    </span>
                    {showDiag ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>

                  <AnimatePresence>
                    {showDiag && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-3 space-y-2">
                          <div
                            className={`rounded-xl p-3 font-mono text-[10.5px] leading-relaxed border space-y-1 ${
                              isDark
                                ? "bg-black/60 border-white/8 text-slate-400"
                                : "bg-slate-900 border-slate-700 text-slate-300"
                            }`}
                          >
                            <div className={isDark ? "text-slate-600" : "text-slate-500"}>
                              # {BACKEND_URL}/api/v1
                            </div>
                            <div className="text-amber-400">
                              {errorInfo?.message || "ERR_CONNECTION_REFUSED — No response from server."}
                            </div>
                            <div className={isDark ? "text-slate-600" : "text-slate-500"}>
                              @ {new Date().toLocaleTimeString()}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleCopyDiag}
                            className={`inline-flex items-center gap-1.5 text-[11px] font-bold transition-colors cursor-pointer ${
                              copied
                                ? "text-emerald-400"
                                : isDark
                                ? "text-violet-400 hover:text-violet-300"
                                : "text-violet-600 hover:text-violet-700"
                            }`}
                          >
                            {copied ? (
                              <><Check size={11} /> Copied!</>
                            ) : (
                              <><Copy size={11} /> Copy report</>
                            )}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Contact support card */}
              <div
                className={`rounded-2xl border p-4 space-y-3 ${
                  isDark
                    ? "bg-white/[0.03] border-white/8"
                    : "bg-white/60 border-slate-200"
                }`}
              >
                <div
                  className={`text-[11px] font-bold uppercase tracking-widest ${
                    isDark ? "text-slate-500" : "text-slate-400"
                  }`}
                >
                  Need urgent help?
                </div>
                <div className="space-y-2">
                  <a
                    href="tel:+919431426252"
                    className={`flex items-center gap-2.5 text-xs font-semibold group transition-colors ${
                      isDark
                        ? "text-slate-300 hover:text-white"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isDark ? "bg-violet-500/15 text-violet-400" : "bg-violet-100 text-violet-600"
                      }`}
                    >
                      <Phone size={13} />
                    </div>
                    +91 94314 26252
                  </a>
                  <a
                    href="mailto:admin@school.com"
                    className={`flex items-center gap-2.5 text-xs font-semibold group transition-colors ${
                      isDark
                        ? "text-slate-300 hover:text-white"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isDark ? "bg-blue-500/15 text-blue-400" : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      <Mail size={13} />
                    </div>
                    admin@school.com
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer
        className={`relative z-10 w-full max-w-6xl mx-auto px-6 py-4 flex items-center justify-between text-[11px] font-medium border-t ${
          isDark
            ? "border-white/8 text-slate-600"
            : "border-slate-200/70 text-slate-400"
        }`}
      >
        <span>
          &copy; {new Date().getFullYear()} {schoolName || "RG EduCore"} &mdash; Campus ERP
        </span>
        <div className="flex items-center gap-1.5">
          <Clock size={11} />
          <span>Checking server every 30s</span>
        </div>
      </footer>
    </div>
  );
}
