import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  ShieldAlert,
  ArrowUpRight,
  ExternalLink,
} from 'lucide-react';
import { formatCurrency } from '../payrollUtils.js';

const BudgetHealthWidget = ({ summary, canReviseBudget = true, onRefresh }) => {
  const navigate = useNavigate();

  if (!summary) return null;

  const {
    sessionName,
    salaryBudget = 0,
    salarySpent = 0,
    salaryRemaining = 0,
    isBudgetExceeded,
    deficit = 0,
    budgetStatus,
  } = summary;

  const percent = salaryBudget > 0 ? Math.min(100, Math.round((salarySpent / salaryBudget) * 100)) : 0;

  return (
    <div className={`rounded-2xl p-5 border shadow-xs transition-all ${
      isBudgetExceeded
        ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/60'
        : percent > 85
        ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-900/60'
        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
    }`}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left side: Status badge & Title */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              Session {sessionName || 'Active'}
            </span>
            {isBudgetExceeded ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 flex items-center gap-1">
                <ShieldAlert size={12} /> Exceeded by {formatCurrency(deficit)}
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                <CheckCircle2 size={12} /> Within Budget
              </span>
            )}
          </div>

          <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Wallet className="text-orange-500" size={16} />
            Academic Session Salary Expenditure Guard
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Real-time validation against approved session payroll allocation. Salary disbursements automatically debit this pool.
          </p>
        </div>

        {/* Center: Financial Counters */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-3 sm:gap-5 w-full lg:w-auto">
          <div className="bg-slate-50 dark:bg-slate-800/50 sm:bg-transparent sm:dark:bg-transparent p-2.5 sm:p-0 rounded-xl sm:rounded-none">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Approved Salary Budget
            </span>
            <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              {formatCurrency(salaryBudget)}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 sm:bg-transparent sm:dark:bg-transparent p-2.5 sm:p-0 rounded-xl sm:rounded-none sm:border-l sm:border-slate-200 sm:dark:border-slate-700 sm:pl-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Disbursed
            </span>
            <span className="text-base sm:text-lg font-black text-slate-700 dark:text-slate-200">
              {formatCurrency(salarySpent)}
            </span>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-slate-50 dark:bg-slate-800/50 sm:bg-transparent sm:dark:bg-transparent p-2.5 sm:p-0 rounded-xl sm:rounded-none sm:border-l sm:border-slate-200 sm:dark:border-slate-700 sm:pl-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Available Remaining
            </span>
            <span className={`text-base sm:text-lg font-black ${
              isBudgetExceeded ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
            }`}>
              {isBudgetExceeded ? `- ${formatCurrency(deficit)}` : formatCurrency(salaryRemaining)}
            </span>
          </div>

          {/* Action to Settings Budget Allocation */}
          {canReviseBudget && (
            <button
              onClick={() => navigate('/settings/budget-allocation')}
              className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-xs transition cursor-pointer w-full sm:w-auto"
            >
              <span>{isBudgetExceeded ? 'Revise Budget Now' : 'Manage Budget'}</span>
              <ExternalLink size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-3 space-y-1">
        <div className="flex flex-col sm:flex-row justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400 gap-0.5">
          <span>{percent}% of salary pool utilized</span>
          <span>{formatCurrency(salaryRemaining)} remaining for future disbursements</span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              isBudgetExceeded || percent > 95
                ? 'bg-rose-500'
                : percent > 75
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(100, percent)}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default BudgetHealthWidget;

