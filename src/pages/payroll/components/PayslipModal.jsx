import React, { useRef } from 'react';
import { Printer, Download, CheckCircle, ShieldCheck, Calendar } from 'lucide-react';
import Modal from '../../../components/ui/Modal.jsx';
import { useSchoolBranding } from '../../../context/SchoolBrandingContext.jsx';

const formatCurrency = (val) => {
  const n = Number(val) || 0;
  return `₹${n.toLocaleString('en-IN')}`;
};

const PayslipModal = ({ isOpen, onClose, staff, month, year }) => {
  const { schoolName, schoolLogo } = useSchoolBranding();
  const printAreaRef = useRef(null);

  if (!staff) return null;

  const struct = staff.salaryStructure || {};
  const disb = staff.disbursementDetails || {};
  const att = staff.attendanceMetrics || {};

  // Financial values
  const basic = Number(disb.basicPay ?? struct.basicPay ?? 0);
  const allowances = Number(disb.allowances ?? ((struct.hra || 0) + (struct.da || 0) + (struct.specialAllowance || 0)));
  const statutoryDeductions = Number(disb.statutoryDeductions ?? ((struct.pfDeduction || 0) + (struct.taxDeduction || 0) + (struct.otherDeductions || 0)));
  const lopDeduction = Number(disb.lopDeduction ?? att.lopDeduction ?? 0);
  const totalDeductions = Number(disb.deductions ?? (statutoryDeductions + lopDeduction));
  const net = Number(disb.netPay ?? struct.netPay ?? (basic + allowances - totalDeductions));

  // Attendance metrics
  const workingDays = disb.workingDays ?? att.standardWorkingDays ?? 26;
  const presentDays = disb.presentDays ?? att.presentDays ?? 26;
  const paidLeaves = disb.paidLeaveDays ?? att.paidLeaveDays ?? 0;
  const lopDays = disb.lopDays ?? att.lopDays ?? 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Salary Slip: ${staff.name} (${month} ${year})`}
      size="lg"
    >
      <div className="space-y-4">
        {/* Printable Card Area */}
        <div
          ref={printAreaRef}
          className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-5 text-slate-900 dark:text-slate-100"
        >
          {/* Institutional Header */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              {schoolLogo ? (
                <img src={schoolLogo} alt="Logo" className="w-12 h-12 object-contain rounded-lg" />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-orange-500 text-white font-black flex items-center justify-center text-lg">
                  {schoolName ? schoolName.charAt(0) : 'R'}
                </div>
              )}
              <div>
                <h2 className="text-base font-black tracking-tight">{schoolName || 'Raj Global Educational System (RGES)'}</h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Institutional Faculty & Staff Monthly Salary Slip</p>
              </div>
            </div>
            <div className="text-right">
              <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 inline-flex items-center gap-1">
                <CheckCircle size={12} /> Disbursed
              </span>
              <p className="text-[10px] font-mono text-slate-400 mt-1">
                REF: {disb.transactionReference || `TXN-${String(staff._id).slice(-6)}`}
              </p>
            </div>
          </div>

          {/* Employee Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Employee ID</span>
              <strong className="text-slate-800 dark:text-slate-200">{staff.employeeId}</strong>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Staff Name</span>
              <strong className="text-slate-800 dark:text-slate-200">{staff.name}</strong>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Role / Designation</span>
              <span className="text-slate-700 dark:text-slate-300 capitalize">{staff.designation || staff.role}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Salary Period</span>
              <strong className="text-slate-800 dark:text-slate-200">{month} {year}</strong>
            </div>
          </div>

          {/* Attendance & Leave Summary Banner */}
          <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900 rounded-xl text-xs flex flex-wrap items-center justify-between gap-3">
            <span className="font-extrabold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
              <Calendar size={13} className="text-indigo-600" />
              Monthly Attendance Ledger:
            </span>
            <div className="flex flex-wrap items-center gap-4 text-[11px]">
              <span>Working Days: <strong>{workingDays}</strong></span>
              <span>Present: <strong className="text-emerald-600 dark:text-emerald-400">{presentDays}</strong></span>
              <span>Approved Paid Leaves: <strong className="text-indigo-600 dark:text-indigo-400">{paidLeaves}</strong></span>
              <span>Unpaid / LOP: <strong className={lopDays > 0 ? 'text-rose-600' : 'text-slate-500'}>{lopDays} Days</strong></span>
            </div>
          </div>

          {/* Earnings & Deductions Tables */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Earnings */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <div className="bg-slate-50 dark:bg-slate-800 px-3.5 py-2 border-b border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-black uppercase text-slate-700 dark:text-slate-300">
                  Earnings & Allowances
                </span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs p-3 space-y-2">
                <div className="flex justify-between pt-1">
                  <span className="text-slate-600 dark:text-slate-400">Basic Pay</span>
                  <span className="font-bold">{formatCurrency(basic)}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-slate-600 dark:text-slate-400">House Rent Allowance (HRA)</span>
                  <span className="font-bold">{formatCurrency(struct.hra || 0)}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-slate-600 dark:text-slate-400">Dearness Allowance (DA)</span>
                  <span className="font-bold">{formatCurrency(struct.da || 0)}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-slate-600 dark:text-slate-400">Special Allowance</span>
                  <span className="font-bold">{formatCurrency(struct.specialAllowance || 0)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700 font-extrabold text-emerald-600 dark:text-emerald-400">
                  <span>Gross Earnings</span>
                  <span>{formatCurrency(basic + allowances)}</span>
                </div>
              </div>
            </div>

            {/* Deductions */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <div className="bg-slate-50 dark:bg-slate-800 px-3.5 py-2 border-b border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-black uppercase text-slate-700 dark:text-slate-300">
                  Deductions & Withholdings
                </span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs p-3 space-y-2">
                <div className="flex justify-between pt-1">
                  <span className="text-slate-600 dark:text-slate-400">Provident Fund (PF)</span>
                  <span className="font-bold text-rose-500">-{formatCurrency(struct.pfDeduction || 0)}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-slate-600 dark:text-slate-400">TDS / Professional Tax</span>
                  <span className="font-bold text-rose-500">-{formatCurrency(struct.taxDeduction || 0)}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-slate-600 dark:text-slate-400">Other Policy Deductions</span>
                  <span className="font-bold text-rose-500">-{formatCurrency(struct.otherDeductions || 0)}</span>
                </div>
                {/* LOP Attendance Deduction */}
                <div className="flex justify-between pt-2 bg-rose-50/50 dark:bg-rose-950/20 px-2 py-1 rounded">
                  <span className="text-rose-700 dark:text-rose-300 font-bold">
                    Attendance LOP ({lopDays} days)
                  </span>
                  <span className="font-extrabold text-rose-600">-{formatCurrency(lopDeduction)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700 font-extrabold text-rose-600 dark:text-rose-400">
                  <span>Total Deductions</span>
                  <span>-{formatCurrency(totalDeductions)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Net Pay Banner */}
          <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 flex items-center justify-between text-xs">
            <div>
              <span className="text-[11px] font-bold text-orange-800 dark:text-orange-300 uppercase block">
                Net Take-Home Pay (After Attendance Deductions)
              </span>
              <span className="text-[10px] text-orange-600 dark:text-orange-400">
                Mode: {disb.paymentMethod || struct.paymentMode || 'Bank Transfer'}
              </span>
            </div>
            <span className="text-2xl font-black text-orange-600 dark:text-orange-400">
              {formatCurrency(net)}
            </span>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 pt-6 text-[11px] text-slate-400 border-t border-slate-200 dark:border-slate-800">
            <div>
              <span className="block border-b border-dashed border-slate-300 dark:border-slate-700 w-36 mb-1"></span>
              <span>Employee Signature</span>
            </div>
            <div className="text-right flex flex-col items-end">
              <span className="block border-b border-dashed border-slate-300 dark:border-slate-700 w-36 mb-1"></span>
              <span>Authorised School Bursar / Accountant</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-extrabold text-xs shadow-sm transition cursor-pointer"
          >
            <Printer size={14} /> Print Payslip
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PayslipModal;
