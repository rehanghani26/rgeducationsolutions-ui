import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, FileText, Download, CheckCircle2, UserCheck, Calendar, ShieldCheck } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import { mockPayroll } from '../../data/mockData.js';

const PayrollManagement = () => {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-12">
      <PageHeader
        title="Payroll & Staff Salary Management"
        subtitle="Staff monthly salary slips, basic pay breakdown, allowances, and disburser tracking"
        breadcrumbs={[{ label: 'Finance' }, { label: 'Payroll' }]}
        actions={
          <div className="flex gap-3">
            <Button variant="outline" icon={<Download size={16} />}>Export Payroll Summary</Button>
            <Button icon={<CheckCircle2 size={16} />}>Process Monthly Disbursement</Button>
          </div>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-2">
          <p className="text-xs font-semibold text-slate-400">Current Payroll Month</p>
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar size={22} className="text-indigo-500" /> {mockPayroll.month}
          </h3>
          <p className="text-xs text-emerald-600 font-medium">Status: Disbursement Completed</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-2">
          <p className="text-xs font-semibold text-slate-400">Total Monthly Disbursed Amount</p>
          <h3 className="text-2xl font-extrabold text-emerald-600 flex items-center gap-2">
            <DollarSign size={22} /> {mockPayroll.totalDisbursed}
          </h3>
          <p className="text-xs text-slate-500">Across {mockPayroll.totalEmployees} Faculty & Support Staff</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-2">
          <p className="text-xs font-semibold text-slate-400">Payslips Generated</p>
          <h3 className="text-2xl font-extrabold text-indigo-600 flex items-center gap-2">
            <ShieldCheck size={22} /> {mockPayroll.totalEmployees} / {mockPayroll.totalEmployees}
          </h3>
          <p className="text-xs text-slate-500">100% Tax & PF Compliance Verified</p>
        </div>
      </div>

      {/* Staff Salary Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">Staff Salary Statement List</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 font-bold text-xs uppercase border-b border-slate-200 dark:border-slate-800">
                <th className="p-3">Emp ID</th>
                <th className="p-3">Staff Member</th>
                <th className="p-3">Designation</th>
                <th className="p-3 text-right">Basic Pay</th>
                <th className="p-3 text-right">Allowances</th>
                <th className="p-3 text-right">Deductions</th>
                <th className="p-3 text-right">Net Salary</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {mockPayroll.salaries.map((sal) => (
                <tr key={sal.empId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="p-3 text-slate-400 text-xs font-mono">{sal.empId}</td>
                  <td className="p-3 font-extrabold text-slate-900 dark:text-white">{sal.name}</td>
                  <td className="p-3 text-xs text-slate-500">{sal.role}</td>
                  <td className="p-3 text-right">₹{sal.basicPay.toLocaleString()}</td>
                  <td className="p-3 text-right text-emerald-600">+₹{sal.allowance.toLocaleString()}</td>
                  <td className="p-3 text-right text-rose-500">-₹{sal.deductions.toLocaleString()}</td>
                  <td className="p-3 text-right font-extrabold text-slate-900 dark:text-white">
                    ₹{sal.netPay.toLocaleString()}
                  </td>
                  <td className="p-3 text-center">
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                      {sal.status}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <Button variant="ghost" size="sm" icon={<FileText size={14} />}>Payslip</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default PayrollManagement;
