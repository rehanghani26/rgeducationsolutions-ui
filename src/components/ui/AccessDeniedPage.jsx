import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, ArrowLeft } from "lucide-react";

/**
 * AccessDeniedPage component displayed when user lacks permission
 */
const AccessDeniedPage = ({
  title = "Access Denied",
  message = "You do not have administrative permission to view or modify these system settings.",
}) => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-1">
      <div className="max-w-md w-full text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="size-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-5 border border-rose-200/60 dark:border-rose-900/40">
          <ShieldAlert size={32} />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mb-2">
          {title}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
          {message}
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-xs font-bold transition shadow-sm"
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default AccessDeniedPage;
