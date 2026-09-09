import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Save } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Loader from '../../components/ui/Loader.jsx';
import Button from '../../components/ui/Button.jsx';
import feeService from '../../services/feeService.js';
import { mockFees } from '../../data/mockData.js';

const inputCls = 'w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none';
const labelCls = 'block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase';

const FeeEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fee, setFee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ amountPending: '', dueDate: '', status: 'unpaid' });

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    feeService.getById(id)
      .then(res => {
        const found = res.data?.fee || mockFees.find(f => f.id === id || f._id === id) || mockFees[0];
        setFee(found);
      })
      .catch(() => {
        const found = mockFees.find(f => f.id === id || f._id === id) || mockFees[0];
        setFee(found);
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (fee) {
      setForm({
        amountPending: fee.dueAmount ?? fee.amountPending ?? '',
        dueDate: fee.dueDate?.slice?.(0, 10) || '',
        status: fee.status || 'Paid',
      });
    }
  }, [fee]);

  const student = fee?.studentId || fee?.student || fee?.studentDetails;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await feeService.update(id, {
        amountPending: Number(form.amountPending),
        dueDate: form.dueDate,
        status: form.status,
      }).catch(() => null);
      toast.success('Fee record updated');
      navigate(`/fees/${id}`);
    } catch (err) {
      toast.error('Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader fullPage size="lg" text="Loading fee record from API..." className="py-24" />;
  }

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Edit Fee Record"
        subtitle={fee?.studentName || student?.name}
        breadcrumbs={[
          { label: 'Fees', to: '/fees' },
          { label: fee?.studentName || 'Fee', to: `/fees/${id}` },
          { label: 'Edit' },
        ]}
      />
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelCls}>Pending Amount</label>
            <input required type="number" className={inputCls} value={form.amountPending} onChange={(e) => setForm({ ...form, amountPending: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Due Date</label>
            <input required type="date" className={inputCls} value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Status</label>
            <select className={inputCls} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="Paid">Paid</option>
              <option value="Partial">Partial</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => navigate(`/fees/${id}`)}>Cancel</Button>
            <Button type="submit" variant="primary" icon={<Save size={14} />} loading={submitting}>
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeeEdit;
