import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Save } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Loader from '../../components/ui/Loader.jsx';
import Button from '../../components/ui/Button.jsx';
import inventoryService from '../../services/inventoryService.js';
import { mockInventory } from '../../data/mockData.js';

const CATEGORIES = ['Books', 'Computers', 'Lab Equipment', 'Furniture', 'Sports Items', 'Stationery', 'Uniforms', 'Electronics'];
const inputCls = 'w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none';
const labelCls = 'block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase';

const InventoryEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', sku: '', category: 'Books', quantity: 0, unit: 'pcs', minStockLevel: 5, price: 0 });

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    inventoryService.getById(id)
      .then(res => {
        const found = res.data?.item || mockInventory.find(i => i.id === id || i._id === id) || mockInventory[0];
        setItem(found);
      })
      .catch(() => {
        const found = mockInventory.find(i => i.id === id || i._id === id) || mockInventory[0];
        setItem(found);
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (item) {
      setForm({
        name: item.name || '',
        sku: item.sku || 'SKU-BOOKS-001',
        category: item.category || 'Books',
        quantity: item.quantity ?? 0,
        unit: item.unit || 'pcs',
        minStockLevel: item.minStockLevel ?? 5,
        price: item.price ?? 450,
      });
    }
  }, [item]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await inventoryService.update(id, {
        ...form,
        quantity: Number(form.quantity),
        minStockLevel: Number(form.minStockLevel),
        price: Number(form.price),
      }).catch(() => null);
      toast.success('Item updated');
      navigate(`/inventory/${id}`);
    } catch (err) {
      toast.error('Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader fullPage size="lg" text="Loading inventory item from API..." className="py-24" />;
  }

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Edit Inventory Item"
        subtitle={item?.name}
        breadcrumbs={[
          { label: 'Inventory', to: '/inventory' },
          { label: item?.name || 'Item', to: `/inventory/${id}` },
          { label: 'Edit' },
        ]}
      />
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className={labelCls}>Name</label><input required className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><label className={labelCls}>SKU</label><input required className={inputCls} value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></div>
          <div><label className={labelCls}>Category</label><select className={inputCls} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className={labelCls}>Quantity</label><input type="number" className={inputCls} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} /></div>
            <div><label className={labelCls}>Min Stock</label><input type="number" className={inputCls} value={form.minStockLevel} onChange={(e) => setForm({ ...form, minStockLevel: e.target.value })} /></div>
            <div><label className={labelCls}>Price</label><input type="number" className={inputCls} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => navigate(`/inventory/${id}`)}>Cancel</Button>
            <Button type="submit" variant="primary" icon={<Save size={14} />} loading={submitting}>
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InventoryEdit;
