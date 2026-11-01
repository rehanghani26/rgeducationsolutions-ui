import React from "react";
import {
  Award,
  Trophy,
  CheckCircle,
  XCircle,
  TrendingUp,
  Percent,
} from "lucide-react";

export default function AIExamResultsCard({
  examName = "Examination Results",
  results = [],
  toppers = [],
  stats = {},
  onAskAiPrompt,
}) {
  const total = results.length || stats.totalStudents || 0;
  const passed =
    stats.passed ??
    results.filter(
      (r) =>
        r.status === "passed" ||
        r.resultStatus === "Pass" ||
        Number(r.percentage || 0) >= 40
    ).length;
  const failed =
    stats.failed ??
    results.filter(
      (r) =>
        r.status === "failed" ||
        r.resultStatus === "Fail" ||
        Number(r.percentage || 0) < 40
    ).length;
  const passRate =
    stats.passPercentage ||
    (total > 0 ? `${Math.round((passed / total) * 100)}%` : "0%");

  // Top ranker (rank 1 or highest percentage)
  const topRanker =
    toppers?.[0] ||
    [...results].sort(
      (a, b) => Number(b.percentage || 0) - Number(a.percentage || 0)
    )[0];

  return (
    <div className="my-3 overflow-hidden rounded-xl border border-[#303030] bg-[#1D1D1D] shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#303030] bg-[#191919] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-[#FFA000]" />
          <span className="text-[12.5px] font-bold text-[#FFFFFF]">
            {examName}
          </span>
        </div>
        <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
          {passRate} Pass Rate
        </span>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3">
        {/* Total Appeared */}
        <div className="rounded-xl border border-[#303030] bg-[#141414] p-2.5">
          <span className="text-[10.5px] text-[#A1A1AA]">Total Appeared</span>
          <div className="text-lg font-bold text-[#FFFFFF] mt-1">{total}</div>
        </div>

        {/* Passed */}
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] text-emerald-300">Passed</span>
            <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-emerald-400 mt-1">{passed}</div>
        </div>

        {/* Failed */}
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] text-rose-300">Failed</span>
            <XCircle className="h-3.5 w-3.5 text-rose-400" />
          </div>
          <div className="text-lg font-bold text-rose-400 mt-1">{failed}</div>
        </div>

        {/* Pass % */}
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] text-amber-300">Pass Rate</span>
            <Percent className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <div className="text-lg font-bold text-amber-400 mt-1">{passRate}</div>
        </div>
      </div>

      {/* Topper Spotlight Card if available */}
      {topRanker && (
        <div className="mx-3 mb-3 flex items-center justify-between rounded-xl border border-[#FFA000]/30 bg-gradient-to-r from-[#FF7900]/10 via-[#FFA000]/10 to-transparent p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#FFA000] to-[#FF7900] shadow-md shadow-[#FF7900]/20">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#FFA000]">
                  Exam Topper · Rank #1
                </span>
              </div>
              <div className="text-[13px] font-bold text-[#FFFFFF]">
                {topRanker.studentName || topRanker.name || "Student"}
              </div>
              <div className="text-[10.5px] text-[#A1A1AA]">
                Class: {topRanker.className || topRanker.class || "—"} · Roll:{" "}
                {topRanker.rollNumber || "—"}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-[#FFA000]">
              {topRanker.percentage != null ? `${topRanker.percentage}%` : "Top Score"}
            </div>
            <div className="text-[10px] text-[#A1A1AA]">
              Grade: {topRanker.grade || "A+"}
            </div>
          </div>
        </div>
      )}

      {/* Results Ranking Table */}
      {results && results.length > 0 && (
        <div className="border-t border-[#303030] bg-[#171717] px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#FFFFFF]">
              Rankings & Marks Breakdown ({results.length})
            </span>
          </div>

          <div className="max-h-56 overflow-y-auto scrollbar-thin rounded-lg border border-[#303030] bg-[#141414]">
            <table className="w-full text-left text-[11px]">
              <thead className="bg-[#1C1C1C] text-[#A1A1AA] border-b border-[#303030]">
                <tr>
                  <th className="px-3 py-1.5 font-semibold">Rank</th>
                  <th className="px-3 py-1.5 font-semibold">Student Name</th>
                  <th className="px-3 py-1.5 font-semibold">Class</th>
                  <th className="px-3 py-1.5 font-semibold">Score / Total</th>
                  <th className="px-3 py-1.5 font-semibold">Percentage</th>
                  <th className="px-3 py-1.5 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {results.slice(0, 15).map((r, idx) => {
                  const rank = r.rank || idx + 1;
                  const isPass =
                    r.status === "passed" ||
                    r.resultStatus === "Pass" ||
                    Number(r.percentage || 0) >= 40;

                  return (
                    <tr
                      key={idx}
                      className="hover:bg-[#202020] transition-colors"
                    >
                      <td className="px-3 py-1.5 font-bold font-mono">
                        {rank === 1 ? (
                          <span className="text-amber-400">🥇 1</span>
                        ) : rank === 2 ? (
                          <span className="text-stone-300">🥈 2</span>
                        ) : rank === 3 ? (
                          <span className="text-amber-600">🥉 3</span>
                        ) : (
                          <span className="text-[#A1A1AA]">#{rank}</span>
                        )}
                      </td>
                      <td className="px-3 py-1.5 text-[#FFFFFF] font-medium">
                        {r.studentName || r.name || "Student"}
                      </td>
                      <td className="px-3 py-1.5 text-[#A1A1AA]">
                        {r.className || r.class || "—"}
                      </td>
                      <td className="px-3 py-1.5 text-[#FFFFFF] font-mono">
                        {r.obtainedMarks != null
                          ? `${r.obtainedMarks} / ${r.totalMarks || 500}`
                          : "—"}
                      </td>
                      <td className="px-3 py-1.5 font-bold text-[#FFA000] font-mono">
                        {r.percentage != null ? `${r.percentage}%` : "—"}
                      </td>
                      <td className="px-3 py-1.5 text-right">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[9.5px] font-semibold border ${
                            isPass
                              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                              : "bg-rose-500/15 border-rose-500/30 text-rose-400"
                          }`}
                        >
                          {isPass ? "Passed" : "Failed"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

