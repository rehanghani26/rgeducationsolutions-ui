import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { Plus, FolderDown, Banknote } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader.jsx";
import DataTable from "../../components/ui/DataTable.jsx";
import SearchFilters from "../../components/ui/SearchFilters.jsx";
import StatusBadge from "../../components/ui/StatusBadge.jsx";
import StatsCard from "../../components/ui/StatsCard.jsx";
import Modal from "../../components/ui/Modal.jsx";
import { getFees, collectFee, createExpense } from "../../services";
import { mockFees } from "../../data/mockData.js";
import Loader from "../../components/ui/Loader.jsx";
import { CanButton } from "../../config/buttonAccess.jsx";

const FeeList = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [fees, setFees] = useState(mockFees);
  const [pagination, setPagination] = useState({ total: mockFees.length, page: 1, pages: 1 });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [showCollect, setShowCollect] = useState(false);
  const [showExpense, setShowExpense] = useState(false);
  const [collectForm, setCollectForm] = useState({
    feeId: "",
    studentId: "",
    amount: "",
    method: "Online",
    reference: "",
  });
  const [expenseForm, setExpenseForm] = useState({
    title: "",
    amount: "",
    category: "Operations",
    date: new Date().toISOString().slice(0, 10),
    refInvoice: "",
  });

  // Direct useEffect API Fetch
  const fetchFeesData = async () => {
    setLoading(true);
    try {
      const res = await getFees({ page, limit: 20, search, status });
      if (res?.fees && res.fees.length > 0) {
        setFees(res.fees);
        if (res.pagination) setPagination(res.pagination);
      } else if (res?.data?.fees && res.data.fees.length > 0) {
        setFees(res.data.fees);
        if (res.data.pagination) setPagination(res.data.pagination);
      } else {
        setFees(mockFees);
      }
    } catch (err) {
      console.error("fetchFees error:", err);
      setFees(mockFees);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeesData();
  }, [page, search, status]);

  const handleCollectSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await collectFee(collectForm);
      setShowCollect(false);
      fetchFeesData();
    } catch (err) {
      console.error("Collect fee error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createExpense(expenseForm);
      setShowExpense(false);
      setExpenseForm({ title: "", amount: "", category: "Operations", date: new Date().toISOString().slice(0, 10), refInvoice: "" });
    } catch (err) {
      console.error("Create expense error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      key: "invoiceNo",
      label: "Invoice No.",
      render: (row) => (
        <span className="font-mono text-indigo-500 font-bold">
          {row.invoiceNo || row.id || "INV-2026-001"}
        </span>
      ),
    },
    {
      key: "studentName",
      label: "Student Name",
      render: (row) => (
        <div>
          <p className="font-extrabold">{row.studentName}</p>
          <p className="text-slate-400">{row.class || "Grade 10-A"}</p>
        </div>
      ),
    },
    {
      key: "feeType",
      label: "Fee Type",
      render: (row) => row.feeType || "Tuition & Hifz Fee",
    },
    {
      key: "amount",
      label: "Total Amount",
      render: (row) => `₹${Number(row.amount || 0).toLocaleString()}`,
    },
    {
      key: "paidAmount",
      label: "Paid",
      render: (row) => (
        <span className="font-bold text-emerald-600 dark:text-emerald-400">
          ₹${Number(row.paidAmount || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: "dueAmount",
      label: "Due Balance",
      render: (row) => (
        <span className="font-bold text-rose-600 dark:text-rose-400">
          ₹${Number(row.dueAmount || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Finance & Fees"
        subtitle="Fee collection, student invoices, balance dues, and school expenses."
        breadcrumbs={[{ label: "Finance" }]}
        actions={
          <div className="flex gap-2 flex-wrap">
            <CanButton id="ADD_EXPENSE">
              <button
                onClick={() => setShowExpense(true)}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-2.5 px-4 rounded-lg border border-slate-700 transition-all"
              >
                <Banknote size={14} /> Add Expense
              </button>
            </CanButton>
            <CanButton id="COLLECT_FEE">
              <button
                onClick={() => setShowCollect(true)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2.5 px-4 rounded-lg shadow-sm transition-all"
              >
                <Plus size={14} /> Collect Fee
              </button>
            </CanButton>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard title="Fee Collection (Month)" value="₹18,45,000" />
        <StatsCard title="Pending Dues" value="₹2,15,000" />
        <StatsCard title="Collection Rate" value="89.5%" />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <SearchFilters
          search={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Search invoice, student name, admission number..."
          filters={[
            {
              key: "status",
              value: status,
              onChange: (v) => {
                setStatus(v);
                setPage(1);
              },
              options: [
                { value: "", label: "All Status" },
                { value: "Paid", label: "Paid" },
                { value: "Partial", label: "Partial" },
                { value: "Overdue", label: "Overdue" },
              ],
            },
          ]}
          onClear={() => {
            setSearch("");
            setStatus("");
            setPage(1);
          }}
        />

        {loading ? (
          <Loader fullPage size="lg" text="Fetching finance records directly from API..." />
        ) : (
          <DataTable
            columns={columns}
            data={fees}
            loading={loading}
            pagination={pagination}
            onPageChange={setPage}
            onRowClick={(row) => navigate(`/finance/fees/${row.id || row._id}`)}
          />
        )}
      </div>

      {/* Collect Fee Modal */}
      <Modal
        open={showCollect}
        onClose={() => setShowCollect(false)}
        title="Collect Fee Payment"
        size="sm"
      >
        <form onSubmit={handleCollectSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-500 uppercase mb-1">
              Select Fee Invoice ID
            </label>
            <input
              required
              placeholder="e.g. INV-2026-8801"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white"
              value={collectForm.feeId}
              onChange={(e) => setCollectForm({ ...collectForm, feeId: e.target.value })}
            />
          </div>
          <div>
            <label className="block font-bold text-slate-500 uppercase mb-1">
              Payment Amount (₹)
            </label>
            <input
              required
              type="number"
              placeholder="e.g. 15500"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white"
              value={collectForm.amount}
              onChange={(e) => setCollectForm({ ...collectForm, amount: e.target.value })}
            />
          </div>
          <div>
            <label className="block font-bold text-slate-500 uppercase mb-1">
              Payment Method
            </label>
            <select
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white"
              value={collectForm.method}
              onChange={(e) => setCollectForm({ ...collectForm, method: e.target.value })}
            >
              <option>Online Bank Transfer</option>
              <option>UPI / QR Code</option>
              <option>Cash Deposit</option>
              <option>Cheque</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowCollect(false)}
              className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-bold"
            >
              Record Payment
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Expense Modal */}
      <Modal
        open={showExpense}
        onClose={() => setShowExpense(false)}
        title="Record School Expense"
        size="sm"
      >
        <form onSubmit={handleExpenseSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-500 uppercase mb-1">
              Expense Title / Item
            </label>
            <input
              required
              placeholder="e.g. Science Lab Equipment Purchase"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white"
              value={expenseForm.title}
              onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
            />
          </div>
          <div>
            <label className="block font-bold text-slate-500 uppercase mb-1">
              Amount (₹)
            </label>
            <input
              required
              type="number"
              placeholder="e.g. 45000"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white"
              value={expenseForm.amount}
              onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowExpense(false)}
              className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-slate-800 text-white font-bold"
            >
              Save Expense
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FeeList;
