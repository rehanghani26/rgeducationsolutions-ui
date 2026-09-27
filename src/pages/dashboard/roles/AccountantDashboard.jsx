import React, { useState, useEffect } from "react";
import { CreditCard, AlertTriangle, Wallet, Receipt } from "lucide-react";
import StatCard from "../components/StatCard.jsx";
import api from "../../../services/api.js";

const AccountantDashboard = () => {
  const [finance, setFinance] = useState(null);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      api.get("/finance/fees").catch(() => null),
      api.get("/finance/expenses").catch(() => null),
    ]).then(([fRes, eRes]) => {
      if (isMounted) {
        setFinance({
          fees: fRes?.data || null,
          expenses: eRes?.data || null,
        });
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={CreditCard}
          label="Fee Collected (Month)"
          value={finance?.fees?.collected ? `₹${finance.fees.collected.toLocaleString()}` : "N/A"}
          sub="N/A"
          iconBg="bg-emerald-600/20"
          iconColor="text-emerald-400"
        />
        <StatCard
          icon={AlertTriangle}
          label="Pending Student Dues"
          value={finance?.fees?.pending ? `₹${finance.fees.pending.toLocaleString()}` : "N/A"}
          sub="N/A"
          iconBg="bg-rose-600/20"
          iconColor="text-rose-400"
        />
        <StatCard
          icon={Wallet}
          label="Monthly Expenses"
          value={finance?.expenses?.total ? `₹${finance.expenses.total.toLocaleString()}` : "N/A"}
          sub="N/A"
          iconBg="bg-indigo-600/20"
          iconColor="text-indigo-400"
        />
        <StatCard
          icon={Receipt}
          label="Invoices Issued"
          value={finance?.fees?.invoicesCount ? finance.fees.invoicesCount.toLocaleString() : "N/A"}
          sub="N/A"
          iconBg="bg-cyan-600/20"
          iconColor="text-cyan-400"
        />
      </div>
    </div>
  );
};

export default AccountantDashboard;
