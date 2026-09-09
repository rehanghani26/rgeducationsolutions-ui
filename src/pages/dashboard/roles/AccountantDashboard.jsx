import React from "react";
import { CreditCard, AlertTriangle, Wallet, Receipt } from "lucide-react";
import StatCard from "../components/StatCard.jsx";

const AccountantDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={CreditCard} label="Fee Collected (Month)" value="₹18,45,000" sub="78% Collected" iconBg="bg-emerald-600/20" iconColor="text-emerald-400" />
        <StatCard icon={AlertTriangle} label="Pending Student Dues" value="₹2,15,000" sub="42 Accounts" iconBg="bg-rose-600/20" iconColor="text-rose-400" />
        <StatCard icon={Wallet} label="Monthly Expenses" value="₹4,50,000" sub="Salaries & Utilities" iconBg="bg-indigo-600/20" iconColor="text-indigo-400" />
        <StatCard icon={Receipt} label="Invoices Issued" value="1,248" sub="Term II Billing" iconBg="bg-cyan-600/20" iconColor="text-cyan-400" />
      </div>
    </div>
  );
};

export default AccountantDashboard;
