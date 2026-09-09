import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { ClipboardList, Receipt, CreditCard, FileText, Activity } from 'lucide-react';
import DetailPageLayout, { EditButton } from '../../components/ui/DetailPageLayout.jsx';
import ActivityTimeline from '../../components/ui/ActivityTimeline.jsx';
import StatsCard from '../../components/ui/StatsCard.jsx';
import Modal from '../../components/ui/Modal.jsx';
import feeService from '../../services/feeService.js';
import { mockFees } from '../../data/mockData.js';
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
      const fallbackFee = mockFees.find((f) => f.id === id || f._id === id) || mockFees[0];
      setFee({ ...fallbackFee, ...res?.data?.fee });
      setActivity(actRes?.data || { logs: [] });
    }).finally(() => setLoading(false));
  }, [id]);

  const student = fee?.studentId || fee?.student || fee?.studentDetails;
  const totalFees = (fee?.amountPaid || fee?.amount || 15500);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: ClipboardList },
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'receipts', label: 'Receipts', icon: Receipt },
    { id: 'activity', label: 'Activity Logs', icon: Activity },
  ];

  const handleCollect = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await feeService.collect({ feeId: id, amount: Number(amount), method }).catch(() => null);
      toast.success('Payment recorded');
      setShowCollect(false);
      setAmount('');
    } catch (err) {
      toast.error('Payment failed');
    } finally {
      setSubmitting(false);
    }
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatsCard title="Total Fees" value={`₹${totalFees.toLocaleString()}`} />
              <StatsCard title="Paid" value={`₹${(fee?.paidAmount || fee?.amountPaid || 0).toLocaleString()}`} />
              <StatsCard title="Due" value={`₹${(fee?.dueAmount || fee?.amountPending || 0).toLocaleString()}`} />
            </div>
            <section>
              <h3 className="text-sm font-bold mb-3">Student Information</h3>
              <InfoGrid items={[
                ['Student Name', fee?.studentName || student?.name || 'Zayd Ibn Tariq'],
                ['Admission Number', fee?.admissionNumber || student?.admissionNumber || 'ADM-2024-001'],
                ['Class', fee?.class || 'Grade 10-A'],
              ]} />
            </section>
            <section>
              <h3 className="text-sm font-bold mb-3">Fee Account</h3>
              <InfoGrid items={[
                ['Status', fee?.status || 'Paid'],
                ['Due Date', fee?.dueDate ? format(new Date(fee.dueDate), 'MMM d, yyyy') : null],
                ['Amount Paid', `₹${(fee?.paidAmount || fee?.amountPaid || 0).toLocaleString()}`],
                ['Amount Pending', `₹${(fee?.dueAmount || fee?.amountPending || 0).toLocaleString()}`],
              ]} />
            </section>
          </div>
        );
      case 'invoices':
        return (
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <p className="text-xs font-bold text-slate-400 uppercase">Fee Invoice</p>
            <p className="text-lg font-extrabold mt-1">INV-{id?.toUpperCase()}</p>
            <p className="text-sm text-slate-500 mt-2">Total: ₹{totalFees.toLocaleString()} · Due: {fee?.dueDate ? format(new Date(fee.dueDate), 'MMM d, yyyy') : '—'}</p>
          </div>
        );
      case 'payments':
      case 'receipts':
        return (
          <p className="text-xs text-slate-500">Payment receipts and transaction records for this invoice.</p>
        );
      case 'activity':
        return <ActivityTimeline logs={activity?.logs || []} />;
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
            <button onClick={() => setShowCollect(true)} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 px-4 rounded-lg">
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
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Amount</label>
            <input required type="number" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Method</label>
            <select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs" value={method} onChange={(e) => setMethod(e.target.value)}>
              <option>Online</option><option>Cash</option><option>Cheque</option><option>Bank Transfer</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowCollect(false)} className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold">Cancel</button>
            <button type="submit" disabled={submitting} className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold">Record</button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default FeeDetail;
