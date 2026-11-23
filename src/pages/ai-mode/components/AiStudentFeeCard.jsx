import React from "react";
import {
  Banknote,
  CheckCircle2,
  AlertCircle,
  FileText,
  CreditCard,
  Clock,
  Sparkles,
} from "lucide-react";
import { bg, border, text, badge, shadow } from "@/theme/color";

export default function AiStudentFeeCard({
  student = {},
  summary = { totalFee: 45000, paidAmount: 35000, pendingAmount: 10000, status: "Partially Paid", dueDate: "2026-06-30", currency: "₹" },
  feeHeads = [],
  paymentsHistory = [],
  onAskAiPrompt,
}) {
  const isFullyPaid = (summary.pendingAmount || 0) <= 0;

  return (
    <div
      className={`my-3 overflow-hidden rounded-2xl border ${border.default} ${bg.card} ${shadow.md}`}
    >
      {/* Header Banner */}
      <div
        className={`flex flex-wrap items-center justify-between gap-3 border-b ${border.default} px-5 py-3.5 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent`}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-sm">
            <Banknote className="h-4 w-4" />
          </div>
          <div>
            <h3 className={`text-sm font-bold ${text.primary}`}>
              Fee Ledger & Dues Breakdown
            </h3>
            <p className={`text-[11px] ${text.muted}`}>
              {student.name} • Admission: {student.admissionNumber || "—"} • Class {student.class || "10"} ({student.section || "A"})
            </p>
          </div>
        </div>

        <span
          className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${
            isFullyPaid
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
          }`}
        >
          {summary.status || "Pending Balance"}
        </span>
      </div>

      {/* 3 KPI Row */}
      <div className={`grid grid-cols-3 border-b ${border.default} divide-x divide-stone-100 dark:divide-stone-800/80 bg-stone-50/60 dark:bg-stone-900/40 text-center p-3`}>
        <div>
          <span className="text-[10px] uppercase font-bold text-stone-400">Total Billed</span>
          <p className={`text-base font-black ${text.primary}`}>
            {summary.currency || "₹"}{summary.totalFee?.toLocaleString()}
          </p>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-emerald-500">Amount Paid</span>
          <p className="text-base font-black text-emerald-500">
            {summary.currency || "₹"}{summary.paidAmount?.toLocaleString()}
          </p>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-rose-400">Pending Dues</span>
          <p className="text-base font-black text-rose-400">
            {summary.currency || "₹"}{summary.pendingAmount?.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Fee Heads Breakdown */}
      {feeHeads.length > 0 && (
        <div className="p-4 border-b border-stone-200 dark:border-stone-800/60">
          <h4 className={`text-xs font-bold ${text.muted} uppercase tracking-wider mb-2.5`}>
            Fee Heads Breakdown
          </h4>
          <div className="space-y-1.5">
            {feeHeads.map((h, i) => (
              <div
                key={i}
                className={`flex items-center justify-between text-xs py-1.5 px-3 rounded-lg ${
                  i % 2 === 0 ? "bg-stone-50/50 dark:bg-stone-900/30" : ""
                }`}
              >
                <span className={`font-medium ${text.primary}`}>{h.name}</span>
                <div className="flex items-center gap-3">
                  <span className={`font-mono text-stone-400`}>
                    ₹{h.paid} / ₹{h.amount}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      h.status === "Paid"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-amber-500/10 text-amber-400"
                    }`}
                  >
                    {h.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Receipts History */}
      {paymentsHistory.length > 0 && (
        <div className="p-4 space-y-2">
          <h4 className={`text-xs font-bold ${text.muted} uppercase tracking-wider mb-2`}>
            Payment Receipts History
          </h4>
          <div className="space-y-2">
            {paymentsHistory.map((p, idx) => (
              <div
                key={idx}
                className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border ${border.default} p-2.5 ${bg.surface}`}
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-orange-500" />
                  <div>
                    <span className={`text-xs font-bold ${text.primary}`}>
                      {p.receiptNo} • ₹{p.amount?.toLocaleString()}
                    </span>
                    <p className={`text-[10px] ${text.muted}`}>
                      {p.date} via {p.method} ({p.transactionId})
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onAskAiPrompt?.(
                      `Print receipt ${p.receiptNo} for student ${student.name}`
                    )
                  }
                  className="rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 px-2.5 py-1 text-[11px] font-semibold transition-all"
                >
                  Download Receipt
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
