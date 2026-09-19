/**
 * ResultHistoryTable.jsx
 * Student's complete result history — all past exams in a single table.
 * Includes PDF download per result.
 */

import { useRef } from 'react';
import { format } from 'date-fns';
import { Download, TrendingUp, TrendingDown, Minus, Award } from 'lucide-react';
import MarksheetPDF, { downloadMarksheetPDF } from '../results/MarksheetPDF.jsx';

const gradeColor = (grade) => {
  const map = {
    'A+': 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300',
    'A':  'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300',
    'B+': 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300',
    'B':  'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300',
    'C+': 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300',
    'C':  'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300',
    'D':  'bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300',
    'F':  'bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300',
  };
  return map[grade] || 'bg-slate-100 dark:bg-slate-800 text-slate-500';
};

const TrendIcon = ({ current, previous }) => {
  if (!previous) return <Minus size={12} className="text-slate-400" />;
  if (current > previous) return <TrendingUp size={12} className="text-emerald-500" />;
  if (current < previous) return <TrendingDown size={12} className="text-red-500" />;
  return <Minus size={12} className="text-slate-400" />;
};

const ResultHistoryTable = ({ results = [], studentName = '', schoolName = 'RGES School' }) => {
  const pdfRefs = useRef({});

  const handleDownload = async (result) => {
    const id = result._id || result.id;
    if (!pdfRefs.current[id]) return;
    await downloadMarksheetPDF(
      { current: pdfRefs.current[id] },
      `Result_${studentName}_${result.examName || 'Exam'}`
    );
  };

  if (!results.length) {
    return (
      <div className="text-center py-16 text-slate-400">
        <Award size={48} className="mx-auto mb-3 opacity-30" />
        <p className="font-semibold text-sm">No published results yet.</p>
        <p className="text-xs mt-1">Results appear here once your teacher publishes them.</p>
      </div>
    );
  }

  // Sort by date descending
  const sorted = [...results].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Exams', value: sorted.length, color: 'text-indigo-600' },
          { label: 'Best Grade', value: sorted.reduce((best, r) => { const order = ['A+','A','B+','B','C+','C','D','F']; return order.indexOf(r.grade) < order.indexOf(best) ? r.grade : best; }, 'F'), color: 'text-emerald-600' },
          { label: 'Avg Percentage', value: `${(sorted.reduce((s, r) => s + (r.percentage || 0), 0) / sorted.length).toFixed(1)}%`, color: 'text-blue-600' },
          { label: 'Pass Rate', value: `${Math.round((sorted.filter((r) => r.isPassed).length / sorted.length) * 100)}%`, color: 'text-amber-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{label}</p>
            <p className={`text-xl font-black mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* History Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">Result History</h3>
          <p className="text-xs text-slate-400 mt-0.5">All published results — click Download for a PDF marksheet</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase border-b border-slate-200 dark:border-slate-800">
                <th className="p-3 text-left">Exam</th>
                <th className="p-3 text-center">Term</th>
                <th className="p-3 text-center">Date</th>
                <th className="p-3 text-center">Marks</th>
                <th className="p-3 text-center">Percentage</th>
                <th className="p-3 text-center">Trend</th>
                <th className="p-3 text-center">Grade</th>
                <th className="p-3 text-center">GPA</th>
                <th className="p-3 text-center">Rank</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {sorted.map((result, idx) => {
                const id = result._id || result.id;
                const prevResult = sorted[idx + 1];
                const examDate = result.examId?.date || result.createdAt;

                return (
                  <tr key={id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">
                    {/* Exam Name */}
                    <td className="p-3">
                      <p className="font-bold text-slate-800 dark:text-white text-xs">
                        {result.examName || result.examId?.name || '—'}
                      </p>
                      <p className="text-[9px] text-slate-400">{result.className} {result.section ? `· ${result.section}` : ''}</p>
                    </td>

                    {/* Term */}
                    <td className="p-3 text-center">
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                        {result.examTerm || result.examId?.term || '—'}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="p-3 text-center text-[10px] text-slate-500 font-medium">
                      {examDate ? format(new Date(examDate), 'MMM d, yyyy') : '—'}
                    </td>

                    {/* Marks */}
                    <td className="p-3 text-center">
                      <span className="text-xs font-extrabold text-slate-800 dark:text-white">
                        {result.totalObtained}/{result.totalMaxMarks}
                      </span>
                    </td>

                    {/* Percentage */}
                    <td className="p-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-sm font-black text-slate-900 dark:text-white">
                          {result.percentage?.toFixed(1)}%
                        </span>
                        {/* Mini progress bar */}
                        <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${result.percentage >= 75 ? 'bg-emerald-500' : result.percentage >= 50 ? 'bg-blue-500' : result.percentage >= 33 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${Math.min(100, result.percentage || 0)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Trend */}
                    <td className="p-3 text-center">
                      <TrendIcon current={result.percentage} previous={prevResult?.percentage} />
                    </td>

                    {/* Grade */}
                    <td className="p-3 text-center">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold ${gradeColor(result.grade)}`}>
                        {result.grade || '—'}
                      </span>
                    </td>

                    {/* GPA */}
                    <td className="p-3 text-center text-xs font-extrabold text-purple-600 dark:text-purple-400">
                      {result.gpa?.toFixed(1) || '—'}
                    </td>

                    {/* Rank */}
                    <td className="p-3 text-center">
                      {result.rank ? (
                        <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400">
                          #{result.rank}
                        </span>
                      ) : '—'}
                    </td>

                    {/* Pass/Fail */}
                    <td className="p-3 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${result.isPassed ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400'}`}>
                        {result.isPassed ? 'PASS' : 'FAIL'}
                      </span>
                    </td>

                    {/* Download */}
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleDownload(result)}
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 px-2.5 py-1.5 rounded-lg transition-colors"
                      >
                        <Download size={11} />
                        PDF
                      </button>

                      {/* Hidden PDF Component for this result */}
                      <MarksheetPDF
                        ref={(el) => { if (el) pdfRefs.current[id] = el; }}
                        result={result}
                        schoolName={schoolName}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ResultHistoryTable;
