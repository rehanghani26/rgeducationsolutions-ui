import React, { useState, useEffect, useMemo } from "react";
import { CreditCard, AlertTriangle, Wallet, Receipt } from "lucide-react";
import StatCard from "../components/StatCard.jsx";
import SectionCard from "../components/SectionCard.jsx";
import Loader from "../../../components/ui/Loader.jsx";
import api from "../../../services/api.js";
import { recentTransactions, feeOverdueStudents } from "../data/dashboardData.js";

const FinanceTab = () => {
  const [loading, setLoading] = useState(true);

  const currentMonth = useMemo(() => {
    return new Date().toLocaleDateString("en-US", { month: "short" });
  }, []);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      api.get("/finance/fees").catch(() => null),
      api.get("/finance/expenses").catch(() => null),
    ]).finally(() => {
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm dark:border-slate-800/80 dark:bg-[#0f172a]">
        <Loader fullPage size="lg" text="Loading financial analytics & ledger..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={CreditCard}
          label={`Fee Collected (${currentMonth})`}
          value="₹18,45,000"
          badge={currentMonth}
          sub="78% of Monthly Target"
          iconBg="bg-emerald-600/20"
          iconColor="text-emerald-400"
        />
        <StatCard
          icon={AlertTriangle}
          label="Pending Dues"
          value="₹2,15,000"
          badge="Overdue"
          badgeColor="bg-rose-500/10 text-rose-500 border-rose-500/20"
          sub="42 Accounts Outstanding"
          iconBg="bg-rose-600/20"
          iconColor="text-rose-400"
        />
        <StatCard
          icon={Wallet}
          label={`Monthly Expenses (${currentMonth})`}
          value="₹4,50,000"
          badge="Disbursed"
          sub="Salaries & Facilities"
          iconBg="bg-indigo-600/20"
          iconColor="text-indigo-400"
        />
        <StatCard
          icon={Receipt}
          label="Invoices Generated"
          value="1,248"
          badge="Term II"
          sub="Active Student Billing"
          iconBg="bg-cyan-600/20"
          iconColor="text-cyan-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Recent Ledger Transactions">
          <div className="space-y-2 text-xs">
            {recentTransactions.map((t, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-800/40"
              >
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{t.name}</p>
                  <p className="text-[10px] text-slate-400">{t.type} · {t.date}</p>
                </div>
                <span
                  className={`font-black ${
                    t.amount.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {t.amount}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Overdue Fee Accounts">
          <div className="space-y-2 text-xs">
            {feeOverdueStudents.map((s, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-800/40"
              >
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{s.name}</p>
                  <p className="text-[10px] text-slate-400">{s.class} · {s.days} days overdue</p>
                </div>
                <span className="font-black text-rose-400">{s.amount}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

export default FinanceTab;
