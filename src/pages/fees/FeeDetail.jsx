import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { ClipboardList, Receipt, CreditCard, FileText, Activity } from 'lucide-react';
import DetailPageLayout, { EditButton } from '../../components/ui/DetailPageLayout.jsx';
import ActivityTimeline from '../../components/ui/ActivityTimeline.jsx';
import StatsCard from '../../components/ui/StatsCard.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { CurrencyInput } from '../../components/ui/CurrencyInput.jsx';
import feeService from '../../services/feeService.js';
import Loader from '../../components/ui/Loader.jsx';

const InfoGrid = ({ items }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {items.map(([label, value]) => (
      <div key={label} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
        <p className="text-[10px] font-bold text-slate-400 uppercase">{label}</p>
        <p className="text-sm font-semibold mt-0.5">{value || '—'}</p>
      </div>
    ))}
  </div>
);

const FeeDetail = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [showCollect, setShowCollect] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Online');

  const [fee, setFee] = useState(null);
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Direct useEffect API Fetch
  useEffect(() => {
    if (!id) return;
    setLoading(true);

    Promise.all([
      feeService.getById(id).catch(() => null),
      feeService.getActivity(id).catch(() => null),
    ]).then(([res, actRes]) => {
      const realFee = res?.fee || res?.data?.fee || (res?._id || res?.id ? res : null);
      setFee(realFee || null);
      setActivity(actRes?.data || { logs: [] });
    }).finally(() => setLoading(false));
  }, [id]);

  const student = fee?.studentId || fee?.student || fee?.studentDetails;
  const totalFees = fee?.amountPaid || fee?.amount || 0;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: ClipboardList },
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'receipts', label: 'Receipts', icon: Receipt },
    { id: 'activity', label: 'Activity Logs', icon: Activity },
  ];

  const handleCollect = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await feeService.collectPayment(id, { amount: Number(amount), method });
      toast.success('Payment recorded successfully');
      setShowCollect(false);
      setAmount('');
      // refresh fee data
      const res = await feeService.getById(id).catch(() => null);
      if (res?.data?.fee) setFee((prev) => ({ ...prev, ...res.data.fee }));
    } catch (err) {
      console.error('Payment error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatsCard title="Total Fee Assigned" value={`₹${Number(fee?.totalAmount || fee?.amount || 0).toLocaleString()}`} />
              <StatsCard title="Total Paid" value={`₹${Number(fee?.paidAmount || 0).toLocaleString()}`} />
              <StatsCard title="Outstanding Due" value={`₹${Number(fee?.dueAmount || 0).toLocaleString()}`} />
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fee Account Details</h4>
              <InfoGrid
                items={[
                  ['Invoice No.', fee?.invoiceNo || fee?.id || '—'],
                  ['Student Name', fee?.studentName || student?.name || '—'],
                  ['Admission Number', fee?.admissionNumber || student?.admissionNumber || '—'],
                  ['Class & Section', `${fee?.class || student?.class || '—'} ${fee?.section ? `(${fee.section})` : ''}`],
                  ['Fee Plan / Term', fee?.feeType || fee?.term || 'Academic Session 2026-27'],
                  ['Due Date', fee?.dueDate ? format(new Date(fee.dueDate), 'dd MMM yyyy') : '—'],
                  ['Last Paid Date', fee?.paymentDate ? format(new Date(fee.paymentDate), 'dd MMM yyyy') : '—'],
                  ['Account Status', fee?.status || 'Active'],
                ]}
              />
            </div>
          </div>
        );

      case 'invoices':
        return (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Generated Invoices</h4>
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold font-mono text-indigo-500">{fee?.invoiceNo || 'INV-2026-001'}</p>
                <p className="text-slate-500">{fee?.feeType || 'Tuition & Academic Term'}</p>
              </div>
              <div className="text-right">
                <p className="font-extrabold text-sm text-slate-900 dark:text-white">₹{Number(fee?.amount || 0).toLocaleString()}</p>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">{fee?.status || 'Active'}</span>
              </div>
            </div>
          </div>
        );

      case 'payments':
      case 'receipts':
        return (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Payment Records & Receipts</h4>
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">Payment via {fee?.paymentMethod || 'Online Transfer'}</p>
                <p className="text-slate-500 font-mono text-[11px]">{fee?.paymentDate ? format(new Date(fee.paymentDate), 'dd MMM yyyy, hh:mm a') : 'Recent payment'}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">₹{Number(fee?.paidAmount || fee?.amount || 0).toLocaleString()}</p>
                <span className="text-[10px] text-slate-400 font-mono">TXN: #8920194</span>
              </div>
            </div>
          </div>
        );

      case 'activity':
        return (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <ActivityTimeline logs={activity?.logs || []} />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <DetailPageLayout
        loading={loading}
        backTo="/fees"
        title={fee?.studentName || student?.name || 'Fee Account'}
        subtitle={`${fee?.admissionNumber || ''} · ${fee?.status || ''} · Due ₹${(fee?.dueAmount || 0).toLocaleString()}`}
        status={fee?.status}
        avatar={fee?.studentName?.charAt(0) || '₹'}
        actions={
          <>
            <button
              onClick={() => setShowCollect(true)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 px-4 rounded-lg transition cursor-pointer"
            >
              Collect Payment
            </button>
            <EditButton to={`/fees/${id}/edit`} />
          </>
        }
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      >
        {renderTab()}
      </DetailPageLayout>

      <Modal open={showCollect} onClose={() => setShowCollect(false)} title="Collect Payment" size="sm">
        <form onSubmit={handleCollect} className="space-y-4">
          <CurrencyInput
            label="Payment Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            placeholder="0"
            quickPresets={[1000, 2500, 5000, 10000]}
          />
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Payment Method</label>
            <select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs" value={method} onChange={(e) => setMethod(e.target.value)}>
              <option>Online</option><option>Cash</option><option>Cheque</option><option>Bank Transfer</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowCollect(false)} className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold cursor-pointer">Cancel</button>
            <button type="submit" disabled={submitting} className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer">Record</button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default FeeDetail;
