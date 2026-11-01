import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Wallet,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Plus,
  History,
  Save,
  Loader2,
  RefreshCw,
  Building,
  GraduationCap,
  ShieldAlert,
  ArrowUpRight,
} from "lucide-react";
import { toast } from "react-toastify";
import api from "../../services/api.js";
import Modal from "../../components/ui/Modal.jsx";
import { CurrencyInput } from "../../components/ui/CurrencyInput.jsx";

const formatCurrency = (val) => {
  const n = Number(val) || 0;
  return `₹${n.toLocaleString("en-IN")}`;
};

const BudgetAllocationSettings = () => {
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingBudget, setLoadingBudget] = useState(false);
  const [savingBudget, setSavingBudget] = useState(false);

  const [budgetData, setBudgetData] = useState(null);
  const [formData, setFormData] = useState({
    salaryBudget: "",
    schoolRequirementsBudget: "",
    operationalBufferBudget: "",
    notes: "",
  });

  // Revised Budget Modal state
  const [revisionModalOpen, setRevisionModalOpen] = useState(false);
  const [revising, setRevising] = useState(false);
  const [revisionForm, setRevisionForm] = useState({
    category: "salary",
    additionalAmount: "",
    reason: "",
  });

  // Fetch academic sessions
  const fetchSessions = useCallback(async () => {
    try {
      setLoadingSessions(true);
      const res = await api.get("/sessions");
      const list = res.data?.sessions || [];
      setSessions(list);
      if (list.length > 0) {
        const active = list.find((s) => s.isCurrent) || list[0];
        setSelectedSessionId(String(active._id));
      }
    } catch (err) {
      console.error("Failed to load academic sessions:", err);
      toast.error("Unable to fetch academic sessions");
    } finally {
      setLoadingSessions(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Fetch budget allocation for the selected session
  const fetchBudgetForSession = useCallback(async (sessId) => {
    if (!sessId) return;
    try {
      setLoadingBudget(true);
      const res = await api.get(`/budget/session/${sessId}`);
      if (res.data?.success && res.data.budget) {
        const b = res.data.budget;
        setBudgetData(b);
        setFormData({
          salaryBudget: b.salaryBudget || "",
          schoolRequirementsBudget: b.schoolRequirementsBudget || "",
          operationalBufferBudget: b.operationalBufferBudget || "",
          notes: b.notes || "",
        });
      } else {
        setBudgetData(null);
        setFormData({
          salaryBudget: "",
          schoolRequirementsBudget: "",
          operationalBufferBudget: "",
          notes: "",
        });
      }
    } catch (err) {
      console.error("Failed to fetch session budget:", err);
    } finally {
      setLoadingBudget(false);
    }
  }, []);

  useEffect(() => {
    if (selectedSessionId) {
      fetchBudgetForSession(selectedSessionId);
    }
  }, [selectedSessionId, fetchBudgetForSession]);

  const selectedSession = useMemo(() => {
    return sessions.find((s) => String(s._id) === String(selectedSessionId));
  }, [sessions, selectedSessionId]);

  // Handle input change in allocation form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Compute live totals
  const computedTotal = useMemo(() => {
    const sal = Number(formData.salaryBudget) || 0;
    const req = Number(formData.schoolRequirementsBudget) || 0;
    const buf = Number(formData.operationalBufferBudget) || 0;
    return sal + req + buf;
  }, [
    formData.salaryBudget,
    formData.schoolRequirementsBudget,
    formData.operationalBufferBudget,
  ]);

  // Save or update budget allocation
  const handleSaveBudget = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!selectedSessionId) {
      toast.error("Please select an Academic Session");
      return;
    }

    setSavingBudget(true);
    try {
      const payload = {
        sessionId: selectedSessionId,
        sessionName: selectedSession ? selectedSession.sessionName : "",
        salaryBudget: Number(formData.salaryBudget) || 0,
        schoolRequirementsBudget:
          Number(formData.schoolRequirementsBudget) || 0,
        operationalBufferBudget: Number(formData.operationalBufferBudget) || 0,
        totalBudget: computedTotal,
        notes: formData.notes,
      };

      const res = await api.post("/budget", payload);
      if (res.data?.success) {
        toast.success(
          res.data.message || "Budget allocation saved successfully!"
        );
        fetchBudgetForSession(selectedSessionId);
      }
    } catch (err) {
      console.error("Error saving budget:", err);
      toast.error(
        err.response?.data?.message || "Failed to save budget allocation"
      );
    } finally {
      setSavingBudget(false);
    }
  };

  // Submit Revised Budget
  const handleReviseBudget = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const amount = Number(revisionForm.additionalAmount);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid positive revision amount");
      return;
    }
    if (!revisionForm.reason.trim()) {
      toast.error("Please provide a justification reason for budget revision");
      return;
    }

    setRevising(true);
    try {
      const res = await api.post(
        `/budget/session/${selectedSessionId}/revise`,
        {
          category: revisionForm.category,
          additionalAmount: amount,
          reason: revisionForm.reason,
        }
      );

      if (res.data?.success) {
        toast.success("Revised budget committed and logged successfully!");
        setRevisionModalOpen(false);
        setRevisionForm({
          category: "salary",
          additionalAmount: "",
          reason: "",
        });
        fetchBudgetForSession(selectedSessionId);
      }
    } catch (err) {
      console.error("Error revising budget:", err);
      toast.error(err.response?.data?.message || "Failed to revise budget");
    } finally {
      setRevising(false);
    }
  };

  // Salary budget progress calculation
  const salaryPercent = useMemo(() => {
    if (!budgetData || !budgetData.salaryBudget) return 0;
    return Math.min(
      100,
      Math.round(
        ((budgetData.salarySpent || 0) / budgetData.salaryBudget) * 100
      )
    );
  }, [budgetData]);

  const isSalaryOverBudget = useMemo(() => {
    if (!budgetData) return false;
    return (budgetData.salarySpent || 0) > (budgetData.salaryBudget || 0);
  }, [budgetData]);

  return (
    <div className="space-y-4">
      {/* Header and Session Selector */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Wallet className="text-orange-500" size={22} />
              Session Budget Allocation & Expenditure Controls
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Allocate session-wise operational funds for staff salaries, school
              supplies, and infrastructure. Real-time budget tracking safeguards
              against over-disbursement.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <Calendar size={14} className="text-indigo-500" /> Academic
              Session:
            </span>
            <select
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
              disabled={loadingSessions}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:outline-none cursor-pointer"
            >
              {sessions.map((sess) => (
                <option key={sess._id} value={sess._id}>
                  {sess.sessionName} {sess.isCurrent ? "★ (Active)" : ""}
                </option>
              ))}
            </select>

            <button
              onClick={() => fetchBudgetForSession(selectedSessionId)}
              title="Refresh Budget Metrics"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
            >
              <RefreshCw
                size={14}
                className={loadingBudget ? "animate-spin" : ""}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Budget Status Overview Cards */}
      {budgetData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Budget */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-bold">Total Session Budget</span>
              <DollarSign size={16} className="text-indigo-500" />
            </div>
            <p className="text-xl font-black text-slate-900 dark:text-white">
              {formatCurrency(budgetData.totalBudget)}
            </p>
            <div className="flex items-center justify-between mt-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              <span>Spent: {formatCurrency(budgetData.totalSpent)}</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                Rem: {formatCurrency(budgetData.totalRemaining)}
              </span>
            </div>
          </div>

          {/* Salary Budget (Highlighted) */}
          <div
            className={`border rounded-2xl p-4 shadow-xs ${
              isSalaryOverBudget
                ? "bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/60"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            }`}
          >
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-bold flex items-center gap-1.5">
                <GraduationCap size={15} className="text-orange-500" />
                Staff Salary Budget
              </span>
              {isSalaryOverBudget ? (
                <ShieldAlert size={16} className="text-rose-500" />
              ) : (
                <CheckCircle2 size={16} className="text-emerald-500" />
              )}
            </div>
            <p className="text-xl font-black text-slate-900 dark:text-white">
              {formatCurrency(budgetData.salaryBudget)}
            </p>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-[11px] font-semibold">
                <span className="text-slate-500 dark:text-slate-400">
                  Disbursed: {formatCurrency(budgetData.salarySpent)}
                </span>
                <span
                  className={
                    isSalaryOverBudget
                      ? "text-rose-600 font-extrabold"
                      : "text-emerald-600 dark:text-emerald-400 font-bold"
                  }
                >
                  {isSalaryOverBudget
                    ? `Over by ${formatCurrency((budgetData.salarySpent || 0) - (budgetData.salaryBudget || 0))}`
                    : `Rem: ${formatCurrency(budgetData.salaryRemaining)}`}
                </span>
              </div>
              {/* Progress meter */}
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-1.5 rounded-full transition-all ${
                    salaryPercent > 95
                      ? "bg-rose-500"
                      : salaryPercent > 75
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                  }`}
                  style={{ width: `${salaryPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* School Requirements */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-bold flex items-center gap-1.5">
                <Building size={15} className="text-blue-500" />
                School Requirements
              </span>
              <TrendingUp size={16} className="text-blue-500" />
            </div>
            <p className="text-xl font-black text-slate-900 dark:text-white">
              {formatCurrency(budgetData.schoolRequirementsBudget)}
            </p>
            <div className="flex items-center justify-between mt-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              <span>
                Spent: {formatCurrency(budgetData.schoolRequirementsSpent)}
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                Rem: {formatCurrency(budgetData.schoolRequirementsRemaining)}
              </span>
            </div>
          </div>

          {/* Operational Buffer */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-bold">Contingency Buffer</span>
              <ShieldAlert size={16} className="text-amber-500" />
            </div>
            <p className="text-xl font-black text-slate-900 dark:text-white">
              {formatCurrency(budgetData.operationalBufferBudget)}
            </p>
            <div className="flex items-center justify-between mt-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              <span>
                Spent: {formatCurrency(budgetData.operationalBufferSpent)}
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                Rem: {formatCurrency(budgetData.operationalBufferRemaining)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Warning banner if Salary Budget Exceeded */}
      {isSalaryOverBudget && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-rose-800 dark:text-rose-200 text-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle size={18} className="text-rose-600 shrink-0" />
            <div>
              <strong className="font-extrabold">
                Salary Budget Exceeded!
              </strong>
              <p className="text-[11px] text-rose-700 dark:text-rose-300 mt-0.5">
                Staff salary disbursements have surpassed the approved session
                budget by{" "}
                {formatCurrency(
                  (budgetData?.salarySpent || 0) -
                    (budgetData?.salaryBudget || 0)
                )}
                . Allocate a Revised Budget below to restore institutional
                compliance.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setRevisionForm({
                category: "salary",
                additionalAmount: "",
                reason: "",
              });
              setRevisionModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-xs transition cursor-pointer shrink-0"
          >
            + Allocate Revised Budget
          </button>
        </div>
      )}

      {/* Main Budget Allocation Form */}
      <form
        onSubmit={handleSaveBudget}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              {budgetData
                ? "Update Approved Budget Heads"
                : "Initial Budget Allocation"}{" "}
              ({selectedSession?.sessionName || "Selected Session"})
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Configure initial approved budget heads for this academic year.
            </p>
          </div>

          {budgetData && (
            <button
              type="button"
              onClick={() => setRevisionModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/40 dark:hover:bg-orange-900/50 text-orange-700 dark:text-orange-300 text-xs font-bold border border-orange-200 dark:border-orange-800/60 transition cursor-pointer"
            >
              <Plus size={14} /> Add Revised Budget
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Staff Salary Budget */}
          <CurrencyInput
            label="Staff Salary & Payroll"
            helperText="Reserved for faculty, accountants, peons, and non-teaching staff salaries."
            name="salaryBudget"
            value={formData.salaryBudget}
            onChange={handleInputChange}
            required
            quickPresets={[50000, 100000, 500000]}
            placeholder="e.g. 10,00,000"
          />

          {/* School Requirements */}
          <CurrencyInput
            label="School Requirements & Labs"
            helperText="Stationery, laboratory apparatus, sports kits, library, and repairs."
            name="schoolRequirementsBudget"
            value={formData.schoolRequirementsBudget}
            onChange={handleInputChange}
            required
            quickPresets={[25000, 50000, 100000]}
            placeholder="e.g. 2,00,000"
          />

          {/* Operational Buffer */}
          <CurrencyInput
            label="Operational Buffer / Contingency"
            helperText="Unplanned emergency maintenance, fuel hikes, and annual events."
            name="operationalBufferBudget"
            value={formData.operationalBufferBudget}
            onChange={handleInputChange}
            quickPresets={[25000, 50000, 100000]}
            placeholder="e.g. 2,00,000"
          />
        </div>

        {/* Notes & Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
              Allocation Notes / Trustee Resolution
            </label>
            <textarea
              name="notes"
              rows={2}
              placeholder="e.g. Approved in Annual General Finance Committee Meeting #14..."
              value={formData.notes}
              onChange={handleInputChange}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-center">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              Calculated Total Annual Session Budget:
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {formatCurrency(computedTotal)}
            </span>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="submit"
            disabled={savingBudget}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-60 text-white font-extrabold py-2.5 px-6 rounded-xl shadow-md text-xs transition cursor-pointer"
          >
            {savingBudget ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Saving Budget...
              </>
            ) : (
              <>
                <Save size={14} /> Save Session Budget Allocation
              </>
            )}
          </button>
        </div>
      </form>

      {/* Revision History Logs Table */}
      {budgetData?.revisionLogs && budgetData.revisionLogs.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <History size={16} className="text-orange-500" />
              Budget Revision History Logs ({budgetData.revisionLogs.length})
            </h3>
            <span className="text-xs font-bold text-slate-500">
              Academic Session: {budgetData.sessionName}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-extrabold uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Category Head</th>
                  <th className="p-3 text-right">Previous Cap</th>
                  <th className="p-3 text-right">Added Delta</th>
                  <th className="p-3 text-right">New Approved Cap</th>
                  <th className="p-3">Justification Reason</th>
                  <th className="p-3">Approved By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {budgetData.revisionLogs.map((rev, idx) => (
                  <tr
                    key={rev._id || idx}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40"
                  >
                    <td className="p-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {new Date(rev.revisedAt).toLocaleDateString("en-GB")}
                    </td>
                    <td className="p-3 font-extrabold text-slate-800 dark:text-slate-200 uppercase">
                      {rev.category}
                    </td>
                    <td className="p-3 text-right text-slate-500">
                      {formatCurrency(rev.previousAmount)}
                    </td>
                    <td className="p-3 text-right font-black text-emerald-600 dark:text-emerald-400">
                      +{formatCurrency(rev.deltaAmount)}
                    </td>
                    <td className="p-3 text-right font-black text-slate-900 dark:text-white">
                      {formatCurrency(rev.newAmount)}
                    </td>
                    <td
                      className="p-3 text-slate-600 dark:text-slate-300 max-w-xs truncate"
                      title={rev.reason}
                    >
                      {rev.reason}
                    </td>
                    <td className="p-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {rev.revisedByName || "Admin"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Revised Budget Modal */}
      <Modal
        isOpen={revisionModalOpen}
        onClose={() => setRevisionModalOpen(false)}
        title="Allocate Revised Budget (Supplementary Grant)"
        size="md"
      >
        <form onSubmit={handleReviseBudget} className="space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Allocate supplementary funds to a budget head when expenditures
            exceed initial estimates. All adjustments are logged into the
            institutional audit ledger.
          </p>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
              Budget Category to Increase
            </label>
            <select
              value={revisionForm.category}
              onChange={(e) =>
                setRevisionForm((prev) => ({
                  ...prev,
                  category: e.target.value,
                }))
              }
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
            >
              <option value="salary">Staff Salary & Payroll</option>
              <option value="schoolRequirements">
                School Requirements & Labs
              </option>
              <option value="operationalBuffer">
                Operational Buffer / Contingency
              </option>
              <option value="total">Overall Total Budget</option>
            </select>
          </div>

          <CurrencyInput
            label="Additional Supplementary Amount"
            name="additionalAmount"
            placeholder="e.g. 5,00,000"
            value={revisionForm.additionalAmount}
            onChange={(e) =>
              setRevisionForm((prev) => ({
                ...prev,
                additionalAmount: e.target.value,
              }))
            }
            required
            quickPresets={[25000, 50000, 100000, 500000]}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
              Justification & Approval Reason{" "}
              <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Additional faculty recruitment for Class 11-12 Science Stream and DA revision..."
              value={revisionForm.reason}
              onChange={(e) =>
                setRevisionForm((prev) => ({ ...prev, reason: e.target.value }))
              }
              required
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setRevisionModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={revising}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white font-extrabold px-5 py-2 rounded-xl text-xs shadow-md transition cursor-pointer disabled:opacity-60"
            >
              {revising ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}
              Commit Revised Budget
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BudgetAllocationSettings;
