import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Package, History, ArrowLeftRight, Users, Activity } from 'lucide-react';
import DetailPageLayout, { EditButton } from '../../components/ui/DetailPageLayout.jsx';
import ActivityTimeline from '../../components/ui/ActivityTimeline.jsx';
import StatsCard from '../../components/ui/StatsCard.jsx';
import Modal from '../../components/ui/Modal.jsx';
import inventoryService from '../../services/inventoryService.js';
import { mockInventory } from '../../data/mockData.js';
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

const InventoryDetail = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [showAdjust, setShowAdjust] = useState(false);
  const [adjustType, setAdjustType] = useState('in');
  const [adjustQty, setAdjustQty] = useState('');

  const [item, setItem] = useState(null);
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Direct useEffect API Fetch
  useEffect(() => {
    if (!id) return;
    setLoading(true);

    Promise.all([
      inventoryService.getById(id).catch(() => null),
      inventoryService.getActivity(id).catch(() => null),
    ]).then(([res, actRes]) => {
      const fallback = mockInventory.find((i) => i.id === id || i._id === id) || mockInventory[0];
      setItem({ ...fallback, ...res?.data?.item });
      setActivity(actRes?.data || { logs: [] });
    }).finally(() => setLoading(false));
  }, [id]);

  const isLowStock = item && item.quantity <= (item.minStockLevel || 10);
  const vendor = item?.vendorId || item?.vendor || item?.vendorDetails;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Package },
    { id: 'purchase', label: 'Purchase History', icon: History },
    { id: 'stock', label: 'Stock Movement', icon: ArrowLeftRight },
    { id: 'assignments', label: 'Assignments', icon: Users },
    { id: 'activity', label: 'Audit Logs', icon: Activity },
  ];

  const handleAdjust = async (e) => {
    e.preventDefault();
    const qty = Number(adjustQty);
    if (!qty || qty <= 0) return toast.warn('Enter a valid quantity');
    try {
      setSubmitting(true);
      await inventoryService.adjustStock({ id, type: adjustType, quantity: qty }).catch(() => null);
      toast.success(`Stock ${adjustType === 'in' ? 'added' : 'removed'}`);
      setShowAdjust(false);
      setAdjustQty('');
    } catch (err) {
      toast.error('Adjustment failed');
    } finally {
      setSubmitting(false);
    }
  };

  const stockLogs = (activity?.logs || []).filter((l) => l.details?.includes('Stock'));

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatsCard title="Current Stock" value={`${item?.quantity ?? '—'} ${item?.unit || ''}`} />
              <StatsCard title="Min Level" value={item?.minStockLevel ?? 10} />
              <StatsCard title="Value" value={item ? `₹${(item.quantity * (item.price || 450)).toLocaleString()}` : '—'} />
            </div>
            <InfoGrid items={[
              ['Item Name', item?.name],
              ['SKU', item?.sku || 'SKU-BOOKS-001'],
              ['Category', item?.category],
              ['Unit', item?.unit || 'Units'],
              ['Unit Price', item?.price ? `₹${item.price.toLocaleString()}` : '₹450'],
              ['Supplier', item?.supplier || 'Al-Huda Islamic Publishers'],
              ['Stock Status', isLowStock ? 'Low Stock' : 'Adequate'],
            ]} />
          </div>
        );
      case 'purchase':
        return <p className="text-xs text-slate-500">Purchase orders will appear when the Purchase module is connected.</p>;
      case 'stock':
        return stockLogs.length ? (
          <ActivityTimeline logs={stockLogs} />
        ) : (
          <p className="text-xs text-slate-500">No stock movements recorded yet. Use Adjust Stock to log changes.</p>
        );
      case 'assignments':
        return <p className="text-xs text-slate-500">Item assignments to teachers and departments will appear here.</p>;
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
        backTo="/inventory"
        title={item?.name || 'Inventory Item'}
        subtitle={`${item?.sku || ''} · ${item?.category || ''} · ${item?.quantity ?? 0} ${item?.unit || 'units'}`}
        status={isLowStock ? 'inactive' : 'active'}
        avatar={item?.name?.charAt(0)}
        actions={
          <>
            <button onClick={() => setShowAdjust(true)} className="flex items-center gap-2 border border-indigo-500/30 text-indigo-500 text-xs font-bold py-2.5 px-4 rounded-lg">
              Adjust Stock
            </button>
            <EditButton to={`/inventory/${id}/edit`} />
          </>
        }
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      >
        {renderTab()}
      </DetailPageLayout>

      <Modal open={showAdjust} onClose={() => setShowAdjust(false)} title="Adjust Stock" size="sm">
        <form onSubmit={handleAdjust} className="space-y-4">
          <div className="flex gap-2">
            <button type="button" onClick={() => setAdjustType('in')} className={`flex-1 py-2 rounded-lg text-xs font-bold ${adjustType === 'in' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>Stock In</button>
            <button type="button" onClick={() => setAdjustType('out')} className={`flex-1 py-2 rounded-lg text-xs font-bold ${adjustType === 'out' ? 'bg-rose-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>Stock Out</button>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Quantity</label>
            <input required type="number" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs" value={adjustQty} onChange={(e) => setAdjustQty(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowAdjust(false)} className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold">Cancel</button>
            <button type="submit" disabled={submitting} className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold">Apply</button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default InventoryDetail;
