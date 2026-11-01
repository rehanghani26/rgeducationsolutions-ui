import React from "react";
import {
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
} from "lucide-react";

export default function AIFeeSummary({
  summary = {},
  fees = [],
  onAskAiPrompt,
}) {
  const totalAmount = summary.totalAmount || summary.total || 0;
  const totalPaid = summary.totalPaid || summary.collected || 0;
  const totalPending = summary.totalPending || summary.pending || 0;
  const collectionRate =
    summary.collectionRate ||
    (totalAmount > 0
      ? `${Math.round((Number(totalPaid) / Number(totalAmount)) * 100)}%`
      : "0%");

  const formatCurrency = (val) => {
    if (typeof val === "string" && val.startsWith("₹")) return val;
    return `₹${Number(val || 0).toLocaleString("en-IN")}`;
  };

  return (
    <div className="my-3 overflow-hidden rounded-xl border border-[#303030] bg-[#1D1D1D] shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#303030] bg-[#191919] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-[#FFA000]" />
          <span className="text-[12.5px] font-bold text-[#FFFFFF]">
            Fee Collection Summary
          </span>
        </div>
        <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
          {collectionRate} Collected
        </span>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3">
        {/* Total Expected */}
        <div className="rounded-xl border border-[#303030] bg-[#141414] p-2.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10.5px] text-[#A1A1AA]">Total Fees</span>
            <DollarSign className="h-3.5 w-3.5 text-[#FFA000]" />
          </div>
          <span className="text-lg font-bold text-[#FFFFFF] tracking-tight">
            {formatCurrency(totalAmount)}
          </span>
        </div>

        {/* Collected */}
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-2.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10.5px] text-emerald-300">Collected</span>
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <span className="text-lg font-bold text-emerald-400 tracking-tight">
            {formatCurrency(totalPaid)}
          </span>
        </div>

        {/* Pending */}
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-2.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10.5px] text-rose-300">Pending</span>
            <AlertCircle className="h-3.5 w-3.5 text-rose-400" />
          </div>
          <span className="text-lg font-bold text-rose-400 tracking-tight">
            {formatCurrency(totalPending)}
          </span>
        </div>

        {/* Collection % */}
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-2.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10.5px] text-amber-300">Recovery Rate</span>
            <TrendingUp className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <span className="text-lg font-bold text-amber-400 tracking-tight">
            {collectionRate}
          </span>
        </div>
      </div>

      {/* Clean Fee Records / Transactions Table */}
      {fees && fees.length > 0 && (
        <div className="border-t border-[#303030] bg-[#171717] px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#FFFFFF]">
              Pending Fee Defaulters / Statements ({fees.length})
            </span>
          </div>

          <div className="max-h-52 overflow-y-auto scrollbar-thin rounded-lg border border-[#303030] bg-[#141414]">
            <table className="w-full text-left text-[11px]">
              <thead className="bg-[#1C1C1C] text-[#A1A1AA] border-b border-[#303030]">
                <tr>
                  <th className="px-3 py-1.5 font-semibold">Student Name</th>
                  <th className="px-3 py-1.5 font-semibold">Class</th>
                  <th className="px-3 py-1.5 font-semibold">Due Amount</th>
                  <th className="px-3 py-1.5 font-semibold">Due Date</th>
                  <th className="px-3 py-1.5 font-semibold text-right">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {fees.map((f, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-[#202020] transition-colors"
                  >
                    <td className="px-3 py-1.5 text-[#FFFFFF] font-medium">
                      {f.studentName || f.studentId?.name || "Student"}
                    </td>
                    <td className="px-3 py-1.5 text-[#A1A1AA]">
                      {f.class || f.studentId?.class || "—"}
                    </td>
                    <td className="px-3 py-1.5 font-bold text-rose-400 font-mono">
                      {f.amountPending || formatCurrency(f.pending || 0)}
                    </td>
                    <td className="px-3 py-1.5 text-[#A1A1AA] font-mono text-[10px]">
                      {f.dueDate || "—"}
                    </td>
                    <td className="px-3 py-1.5 text-right">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[9.5px] font-semibold border ${
                          f.status === "paid"
                            ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                            : f.status === "partial"
                            ? "bg-amber-500/15 border-amber-500/30 text-amber-400"
                            : "bg-rose-500/15 border-rose-500/30 text-rose-400"
                        }`}
                      >
                        {f.status || "unpaid"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

