import React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";

/**
 * AIConfirmationCard
 * Types: "confirm" | "success" | "error"
 */
export default function AIConfirmationCard({
  type = "confirm", // "confirm" | "success" | "error"
  title,
  message,
  details = null, // Object with key-value pairs
  onConfirm,
  onCancel,
  confirmLabel = "Confirm Action",
  cancelLabel = "Cancel",
}) {
  if (type === "success") {
    return (
      <div className="my-3 overflow-hidden rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-[13px] font-bold text-emerald-300">
              {title || "Action Executed Successfully"}
            </h4>
            <p className="mt-0.5 text-[12px] leading-relaxed text-emerald-200/90 whitespace-pre-wrap">
              {message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (type === "error") {
    return (
      <div className="my-3 overflow-hidden rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-rose-500/20 text-rose-400">
            <XCircle className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-[13px] font-bold text-rose-300">
              {title || "Operation Failed"}
            </h4>
            <p className="mt-0.5 text-[12px] leading-relaxed text-rose-200/90 whitespace-pre-wrap">
              {message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Pre-action Confirmation Prompt
  return (
    <div className="my-3 overflow-hidden rounded-xl border border-amber-500/30 bg-[#1D1D1D] shadow-lg">
      <div className="flex items-center gap-2 border-b border-[#303030] bg-amber-500/10 px-4 py-2.5">
        <ShieldAlert className="h-4 w-4 text-[#FFA000]" />
        <span className="text-[12.5px] font-bold text-[#FFA000]">
          {title || "Confirmation Required"}
        </span>
      </div>

      <div className="p-4 space-y-3">
        <p className="text-[12.5px] leading-relaxed text-[#FFFFFF]">
          {message ||
            "This action will modify data in your School ERP system. Please review the details below before proceeding:"}
        </p>

        {details && typeof details === "object" && (
          <div className="rounded-lg border border-[#303030] bg-[#141414] p-3 text-[11px] font-mono space-y-1">
            {Object.entries(details).map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between gap-2">
                <span className="text-[#A1A1AA] uppercase tracking-wider">
                  {k}:
                </span>
                <span className="text-[#FFFFFF] font-semibold truncate">
                  {String(v)}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-1">
          {onCancel && (
            <button
              onClick={onCancel}
              className="rounded-lg border border-[#303030] bg-[#141414] px-3 py-1.5 text-[12px] font-medium text-[#A1A1AA] hover:text-[#FFFFFF] hover:bg-[#252525] transition-colors cursor-pointer"
            >
              {cancelLabel}
            </button>
          )}
          {onConfirm && (
            <button
              onClick={onConfirm}
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#FF7900] to-[#FFA000] px-3.5 py-1.5 text-[12px] font-bold text-white shadow-md shadow-[#FF7900]/25 hover:from-[#FFA000] hover:to-[#FF7900] active:scale-95 transition-all cursor-pointer"
            >
              <span>{confirmLabel}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

