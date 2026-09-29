import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchFees, fetchExpenses, recordFeePayment, recordExpense } from '../store/slices/erpSlice.js';
import { toast, ToastContainer } from 'react-toastify';
import {
  Search, Banknote, Landmark, Wallet, Receipt, Plus,
} from 'lucide-react';
import Button from '../components/ui/Button.jsx';
import Loader from '../components/ui/Loader.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import Modal from '../components/ui/Modal.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';

const inputCls = 'w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl p-3 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none';
const labelCls = 'block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1';

const FeesManagement = () => {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('fees');

  const [showCollectModal, setShowCollectModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [collectForm, setCollectForm] = useState({ studentId: 's1', amount: '', method: 'Online', reference: '' });
  const [expenseForm, setExpenseForm] = useState({ title: '', amount: '', category: 'Utilities', date: '', refInvoice: '' });

  // Confirmation state for submit actions
  const [confirmCollect, setConfirmCollect] = useState(false);
  const [confirmExpense, setConfirmExpense] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { fees, expenses, loading } = useSelector((state) => state.erp);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchFees());
    dispatch(fetchExpenses());
  }, [dispatch]);

  const handleCollectSubmit = async () => {
    setSubmitting(true);
    const res = await dispatch(recordFeePayment({
      studentId: collectForm.studentId,
      amount: Number(collectForm.amount),
      method: collectForm.method,
      reference: collectForm.reference,
    }));
    setSubmitting(false);
    if (res.meta.requestStatus === 'fulfilled') {
      toast.success('Fee receipt issued.');
      setShowCollectModal(false);
      setConfirmCollect(false);
      setCollectForm({ studentId: 's1', amount: '', method: 'Online', reference: '' });
      dispatch(fetchFees());
    } else {
      toast.error(res.payload || 'Failed to collect fee.');
      setConfirmCollect(false);
    }
  };

  const handleExpenseSubmit = async () => {
    setSubmitting(true);
    const res = await dispatch(recordExpense({
      title: expenseForm.title,
      amount: Number(expenseForm.amount),
      category: expenseForm.category,
      date: expenseForm.date,
      refInvoice: expenseForm.refInvoice,
    }));
    setSubmitting(false);
    if (res.meta.requestStatus === 'fulfilled') {
      toast.success('Expenditure ledger logged.');
      setShowExpenseModal(false);
      setConfirmExpense(false);
      setExpenseForm({ title: '', amount: '', category: 'Utilities', date: '', refInvoice: '' });
      dispatch(fetchExpenses());
    } else {
      toast.error(res.payload || 'Failed to record expense.');
      setConfirmExpense(false);
    }
  };

  const totalCollectedFees = fees.reduce((acc, f) => acc + f.amountPaid, 0);
  const totalPendingFees = fees.reduce((acc, f) => acc + f.amountPending, 0);
  const totalExpenditures = expenses.reduce((acc, e) => acc + e.amount, 0);
  const netOperatingIncome = totalCollectedFees - totalExpenditures;

  const filteredFees = fees.filter(f =>
    f.student?.name.toLowerCase().includes(search.toLowerCase()) ||
    f.studentId?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredExpenses = expenses.filter(e =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.category.toLowerCase().includes(search.toLowerCase())
  );

  /* ---- Table column definitions ---- */
  const feeColumns = [
    {
      key: 'student',
      label: 'Student Billing',
      render: (row) => (
        <div className="flex items-center gap-2 font-bold">
          <div className="w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold text-[10px]">
            {row.student?.name ? row.student.name.charAt(0) : 'S'}
          </div>
          <span>{row.student?.name || 'Harry Potter'}</span>
        </div>
      ),
    },
    { key: 'amountPaid', label: 'Total Paid', render: (row) => <span className="font-semibold text-emerald-500">${row.amountPaid.toLocaleString()}</span> },
    { key: 'amountPending', label: 'Outstanding', render: (row) => <span className="font-semibold text-rose-500">${row.amountPending.toLocaleString()}</span> },
    { key: 'dueDate', label: 'Due Date', render: (row) => <span className="text-slate-500">{row.dueDate ? row.dueDate.split('T')[0] : '2026-06-15'}</span> },
    {
      key: 'status',
      label: 'Invoice Status',
      render: (row) => (
        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
          row.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
          : row.status === 'partial' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
          : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
        }`}>
          {row.status.toUpperCase()}
        </span>
      ),
    },
  ];

  const expenseColumns = [
    {
      key: 'title',
      label: 'Expenditure Title',
      render: (row) => (
        <div className="flex items-center gap-2 font-bold">
          <span className="text-base">🧾</span>
          <span>{row.title}</span>
        </div>
      ),
    },
    { key: 'category', label: 'Billing Category', render: (row) => <span className="font-semibold text-slate-500">{row.category}</span> },
    { key: 'amount', label: 'Bill Amount', render: (row) => <span className="font-bold text-rose-500">${row.amount.toLocaleString()}</span> },
    { key: 'date', label: 'Logging Date', render: (row) => <span className="text-slate-500">{row.date.split('T')[0]}</span> },
    { key: 'refInvoice', label: 'Invoice Ref', className: 'text-right', render: (row) => <span className="font-medium text-indigo-500">{row.refInvoice || 'N/A'}</span> },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Financial Accounts</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Audit fee collections, track outstanding invoices, and log operations expenses.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary" icon={<Plus size={14} />} onClick={() => setShowCollectModal(true)}>
            Collect Fee
          </Button>
          <Button variant="secondary" icon={<Plus size={14} />} onClick={() => setShowExpenseModal(true)}>
            Log Expense
          </Button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Fees Collected', value: `$${totalCollectedFees.toLocaleString()}`, icon: <Banknote size={18} />, color: 'emerald' },
          { label: 'Pending Receivables', value: `$${totalPendingFees.toLocaleString()}`, icon: <Landmark size={18} />, color: 'rose' },
          { label: 'Total Expenditures', value: `$${totalExpenditures.toLocaleString()}`, icon: <Receipt size={18} />, color: 'amber' },
          { label: 'Operating Balance', value: `$${netOperatingIncome.toLocaleString()}`, icon: <Wallet size={18} />, color: netOperatingIncome >= 0 ? 'emerald' : 'rose' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">{label}</span>
            <div className="flex items-center justify-between mt-2">
              <span className={`text-2xl font-extrabold tracking-tight ${color === 'rose' && netOperatingIncome < 0 && label === 'Operating Balance' ? 'text-rose-500' : ''}`}>{value}</span>
              <div className={`p-2.5 rounded-xl bg-${color}-500/10 text-${color}-500`}>{icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Ledger */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-5 mb-6">
          <div className="flex bg-slate-50 dark:bg-slate-800/60 rounded-xl p-1 text-xs font-bold gap-1 w-full md:w-max">
            <button
              onClick={() => { setActiveTab('fees'); setSearch(''); }}
              className={`py-2 px-4 rounded-lg transition-colors ${activeTab === 'fees' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
            >
              Fee Accounts Directory
            </button>
            <button
              onClick={() => { setActiveTab('expenses'); setSearch(''); }}
              className={`py-2 px-4 rounded-lg transition-colors ${activeTab === 'expenses' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
            >
              Expenditure Register
            </button>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={14} />
            <input
              type="text"
              placeholder={activeTab === 'fees' ? 'Search by student name...' : 'Search by bill title/category...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-2.5 pl-10 pr-4 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {loading ? (
          <Loader fullPage size="md" text="Decrypting ledger databases..." />
        ) : activeTab === 'fees' ? (
          <DataTable columns={feeColumns} data={filteredFees} emptyTitle="No fee records found" />
        ) : (
          <DataTable columns={expenseColumns} data={filteredExpenses} emptyTitle="No expense records found" />
        )}
      </div>

      {/* Collect Fee Modal */}
      <Modal open={showCollectModal} onClose={() => setShowCollectModal(false)} title="Record Fee Collection" size="sm">
        <div className="space-y-4 text-xs">
          <div>
            <label className={labelCls}>Select Student billing record</label>
            <select className={inputCls} value={collectForm.studentId} onChange={(e) => setCollectForm({ ...collectForm, studentId: e.target.value })}>
              <option value="s1">Harry Potter (Roll: 101)</option>
              <option value="s2">Hermione Granger (Roll: 102)</option>
              <option value="s3">Ron Weasley (Roll: 103)</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Receipt Collected Amount ($)</label>
            <input type="number" placeholder="e.g. 5000" className={inputCls} value={collectForm.amount} onChange={(e) => setCollectForm({ ...collectForm, amount: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Payment Method Mode</label>
            <select className={inputCls} value={collectForm.method} onChange={(e) => setCollectForm({ ...collectForm, method: e.target.value })}>
              <option value="Online">Online Gateway</option>
              <option value="Cash">Cash Receipt</option>
              <option value="Bank Transfer">Bank Wire Transfer</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Reference Voucher ID</label>
            <input placeholder="e.g. TXN987654" className={inputCls} value={collectForm.reference} onChange={(e) => setCollectForm({ ...collectForm, reference: e.target.value })} />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="secondary" onClick={() => setShowCollectModal(false)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => setConfirmCollect(true)}
              disabled={!collectForm.amount}
            >
              Submit Collection
            </Button>
          </div>
        </div>
      </Modal>

      {/* Log Expense Modal */}
      <Modal open={showExpenseModal} onClose={() => setShowExpenseModal(false)} title="Log Operations Expenditure" size="sm">
        <div className="space-y-4 text-xs">
          <div>
            <label className={labelCls}>Expense Title description</label>
            <input placeholder="e.g. Monthly Lab Reagents restock" className={inputCls} value={expenseForm.title} onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelCls}>Amount ($)</label>
              <input type="number" placeholder="12500" className={inputCls} value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Invoice Reference ID</label>
              <input placeholder="e.g. INV-CHEM-90" className={inputCls} value={expenseForm.refInvoice} onChange={(e) => setExpenseForm({ ...expenseForm, refInvoice: e.target.value })} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Billing Category</label>
            <select className={inputCls} value={expenseForm.category} onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}>
              <option value="Utilities">Utilities</option>
              <option value="Payroll">Payroll</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Academic Supplies">Academic Supplies</option>
              <option value="Transport">Transport</option>
              <option value="Others">Others</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Expenditure Date</label>
            <input type="date" className={inputCls} value={expenseForm.date} onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })} />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="secondary" onClick={() => setShowExpenseModal(false)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => setConfirmExpense(true)}
              disabled={!expenseForm.title || !expenseForm.amount}
            >
              Log Bill
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirm: Collect Fee */}
      <ConfirmDialog
        open={confirmCollect}
        onClose={() => setConfirmCollect(false)}
        onConfirm={handleCollectSubmit}
        title="Confirm Fee Collection"
        message={`Record a fee payment of $${collectForm.amount || 0} via ${collectForm.method}?`}
        confirmLabel="Submit Collection"
        loading={submitting}
      />

      {/* Confirm: Log Expense */}
      <ConfirmDialog
        open={confirmExpense}
        onClose={() => setConfirmExpense(false)}
        onConfirm={handleExpenseSubmit}
        title="Confirm Expense Entry"
        message={`Log "${expenseForm.title}" for $${expenseForm.amount || 0} under ${expenseForm.category}?`}
        confirmLabel="Log Bill"
        loading={submitting}
      />
    </div>
  );
};

export default FeesManagement;
