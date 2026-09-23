import React, { useState } from "react";
import PropTypes from "prop-types";
import { useRouteError } from "react-router-dom";
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp } from "lucide-react";

/**
 * FallbackUI Component
 * Displays a user-friendly error screen when an unhandled runtime error or route error occurs.
 * Supports both props-based errors (from ErrorBoundary) and route errors (from react-router).
 */
function FallbackUI({ error: propError, resetErrorBoundary, compact = false }) {
  let routeError = null;
  try {
    routeError = useRouteError();
  } catch {
    routeError = null;
  }

  const error = propError || routeError;
  const [showDetails, setShowDetails] = useState(false);

  const handleReset = () => {
    if (typeof resetErrorBoundary === "function") {
      resetErrorBoundary();
    } else {
      window.location.href = "/";
    }
  };

  const handleGoHome = () => {
    window.location.href = "/";
  };

  const errorMessage =
    error?.message ||
    error?.statusText ||
    (typeof error === "string" ? error : "An unexpected error occurred.");

  const errorStack = error?.stack;

  return (
    <div
      className={`flex flex-col items-center justify-center p-4 transition-colors ${
        compact
          ? "min-h-[350px] w-full py-12"
          : "min-h-screen w-full bg-slate-50 dark:bg-[#020617] text-slate-800 dark:text-slate-100"
      }`}
      style={{
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 text-center shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none transition-all"
        style={{
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)",
        }}
      >
        {/* Warning Icon Badge */}
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500 ring-8 ring-red-50/50 dark:bg-red-950/30 dark:text-red-400 dark:ring-red-950/20">
          <AlertTriangle className="h-8 w-8 stroke-[2.2]" />
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Oops!
        </h1>

        <p className="mt-2 text-base text-slate-600 dark:text-slate-400 font-medium">
          Something went wrong. Please try again.
        </p>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#000F52] hover:bg-[#001780] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-900/20 transition-all duration-200 hover:shadow-lg active:scale-95"
            style={{ backgroundColor: "#000F52" }}
          >
            <RefreshCw className="h-4 w-4" />
            <span>Try Again</span>
          </button>

          <button
            type="button"
            onClick={handleGoHome}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 active:scale-95"
          >
            <Home className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </button>
        </div>

        {/* Technical Error Details Accordion */}
        {error && (
          <div className="mt-6 border-t border-slate-100 pt-4 text-left dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowDetails((prev) => !prev)}
              className="flex w-full items-center justify-between text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 focus:outline-none"
            >
              <span>{showDetails ? "Hide" : "Show"} Technical Details</span>
              {showDetails ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>

            {showDetails && (
              <div className="mt-2.5 max-h-48 overflow-y-auto rounded-lg bg-slate-100 p-3 text-xs text-red-600 dark:bg-slate-950/70 dark:text-red-400 font-mono">
                <p className="font-bold break-words">{errorMessage}</p>
                {errorStack && (
                  <pre className="mt-2 text-[11px] text-slate-600 dark:text-slate-400 whitespace-pre-wrap overflow-x-auto">
                    {errorStack}
                  </pre>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

FallbackUI.propTypes = {
  error: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  resetErrorBoundary: PropTypes.func,
  compact: PropTypes.bool,
};

export default FallbackUI;
