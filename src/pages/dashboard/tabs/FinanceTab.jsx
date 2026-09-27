import React, { useState, useEffect, useMemo } from "react";
import { CreditCard, AlertTriangle, Wallet, Receipt } from "lucide-react";
import StatCard from "../components/StatCard.jsx";
import SectionCard from "../components/SectionCard.jsx";
import Loader from "../../../components/ui/Loader.jsx";
import api from "../../../services/api.js";

const FinanceTab = () => {
  const [loading, setLoading] = useState(true);
  const [financeData, setFinanceData] = useState(null);

  const currentMonth = useMemo(() => {
    return new Date().toLocaleDateString("en-US", { month: "short" });
  }, []);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      api.get("/finance/fees").catch(() => null),
      api.get("/finance/expenses").catch(() => null),
    ])
      .then(([feesRes, expRes]) => {
        if (isMounted) {
          setFinanceData({
            fees: feesRes?.data || null,
            expenses: expRes?.data || null,
          });
        }
      })
      .finally(() => {
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

  const transactions = financeData?.fees?.transactions || [];
  const overdueList = financeData?.fees?.overdue || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={CreditCard}
          label={`Fee Collected (${currentMonth})`}
          value={financeData?.fees?.collected ? `₹${financeData.fees.collected.toLocaleString()}` : "N/A"}
          badge={currentMonth}
          sub="N/A"
          iconBg="bg-emerald-600/20"
          iconColor="text-emerald-400"
        />
        <StatCard
          icon={AlertTriangle}
          label="Pending Dues"
          value={financeData?.fees?.pending ? `₹${financeData.fees.pending.toLocaleString()}` : "N/A"}
          badge="Overdue"
          badgeColor="bg-rose-500/10 text-rose-500 border-rose-500/20"
          sub="N/A"
          iconBg="bg-rose-600/20"
          iconColor="text-rose-400"
        />
        <StatCard
          icon={Wallet}
          label={`Monthly Expenses (${currentMonth})`}
          value={financeData?.expenses?.total ? `₹${financeData.expenses.total.toLocaleString()}` : "N/A"}
          badge="Disbursed"
          sub="N/A"
          iconBg="bg-indigo-600/20"
          iconColor="text-indigo-400"
        />
        <StatCard
          icon={Receipt}
          label="Invoices Generated"
          value={financeData?.fees?.invoicesCount ? financeData.fees.invoicesCount.toLocaleString() : "N/A"}
          badge="Term II"
          sub="N/A"
          iconBg="bg-cyan-600/20"
          iconColor="text-cyan-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Recent Ledger Transactions">
          {transactions.length > 0 ? (
            <div className="space-y-2 text-xs">
              {transactions.map((t, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-800/40"
                >
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{t.name || "Transaction"}</p>
                    <p className="text-[10px] text-slate-400">{t.type || "General"} · {t.date || "N/A"}</p>
                  </div>
                  <span
                    className={`font-black ${
                      String(t.amount || "").startsWith('+') ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {t.amount || "N/A"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs">
              No recent ledger transactions (N/A)
            </div>
          )}
        </SectionCard>

        <SectionCard title="Overdue Fee Accounts">
          {overdueList.length > 0 ? (
            <div className="space-y-2 text-xs">
              {overdueList.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-800/40"
                >
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{s.name || "Student"}</p>
                    <p className="text-[10px] text-slate-400">{s.class || "Class"} · {s.days || 0} days overdue</p>
                  </div>
                  <span className="font-black text-rose-400">{s.amount || "N/A"}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs">
              No overdue fee accounts (N/A)
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
};

export default FinanceTab;
