// ui/src/pages/inventory/InventoryDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  ArrowLeft,
  Package,
  Boxes,
  Truck,
  History,
  ArrowDownRight,
  ArrowUpRight,
  ArrowLeftRight,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  Edit2,
  Plus,
  DollarSign,
  TrendingUp,
  MapPin,
  Layers,
  FileText,
  BarChart3,
  ExternalLink,
  ShieldCheck,
  Tag,
  Sparkles,
  Info,
} from 'lucide-react';

import {
  getInventoryById,
  adjustStock,
  updateInventoryItem,
} from '../../services/inventoryService.js';
import { getVendors } from '../../services/vendorService.js';
import Modal from '../../components/ui/Modal.jsx';
import Loader from '../../components/ui/Loader.jsx';
import { ROUTES } from '../../routes/routes.js';
import { formatDate, formatDateTime, formatCurrency } from '../../utils';
import { CATEGORY_FALLBACK_IMAGES, getSchoolProductImage } from '../../constants';

export default function InventoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'transactions', 'analytics'

  // Data states
  const [item, setItem] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [consumptionTrend, setConsumptionTrend] = useState([]);
  const [vendorsList, setVendorsList] = useState([]);

  // Modals
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustForm, setAdjustForm] = useState({
    type: 'in', // 'in' or 'out'
    quantity: '',
    reason: 'Physical Audit Count Correction',
    notes: '',
  });

  // Fetch complete product data
  const fetchProductData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await getInventoryById(id);
      const data = res?.data || res;
      setItem(data.item);
      setTransactions(data.transactions || []);
      setKpis(data.kpis || null);
      setConsumptionTrend(data.consumptionTrend || []);
    } catch (err) {
      console.error('Failed to load inventory item details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductData();
  }, [id]);

  useEffect(() => {
    getVendors().then((res) => {
      setVendorsList(res?.vendors || res?.data?.vendors || res?.data || []);
    });
  }, []);

  // ─── HANDLER: ADJUST STOCK ───────────────────────────────────────────────
  const handleOpenAdjust = () => {
    setAdjustForm({
      type: 'in',
      quantity: '',
      reason: 'Physical Stock Count Audit',
      notes: '',
    });
    setShowAdjustModal(true);
  };

  const handleSaveAdjust = async (e) => {
    e.preventDefault();
    const qty = Number(adjustForm.quantity);
    if (!qty || qty <= 0) return toast.warn('Please enter a valid adjustment quantity.');

    setSubmitting(true);
    try {
      await adjustStock({
        id,
        type: adjustForm.type,
        quantity: qty,
        reason: adjustForm.reason,
        notes: adjustForm.notes,
      });
      setShowAdjustModal(false);
      fetchProductData();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };



  if (loading) {
    return (
      <div className="py-28 flex justify-center items-center">
        <Loader />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center py-24 space-y-4">
        <Package className="h-14 w-14 text-gray-400 mx-auto" />
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Product Item Not Found</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">The requested inventory item could not be retrieved.</p>
        <Link
          to={ROUTES.INVENTORY.LIST}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 text-white font-semibold shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Inventory Catalog
        </Link>
      </div>
    );
  }

  // Stock status calculations
  const minThreshold = item.minStockLevel || 10;
  const isOutOfStock = (item.quantity || 0) <= 0;
  const isLowStock = !isOutOfStock && (item.quantity || 0) <= minThreshold;
  const unitCostVal = item.unitCost || item.price || 0;
  const currentValuation = (item.quantity || 0) * unitCostVal;

  const vendorObj = typeof item.vendorId === 'object' && item.vendorId !== null ? item.vendorId : null;
  const vendorName = vendorObj?.name || item.supplier || 'Unassigned / Direct Purchase';

  return (
    <div className="space-y-6 pb-20">
      {/* ─── BREADCRUMB & PRIMARY ACTION HEADER ────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Link
          to={ROUTES.INVENTORY.LIST}
          className="inline-flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Inventory Hub
        </Link>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={handleOpenAdjust}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white transition-all shadow-sm"
          >
            <ArrowLeftRight className="h-4 w-4" />
            Adjust Stock
          </button>

          <Link
            to={`/inventory/${id}/edit`}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-200 transition-all border border-gray-200 dark:border-neutral-700"
          >
            <Edit2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            Edit Item
          </Link>
        </div>
      </div>

      {/* ─── PRODUCT HERO BANNER ────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-neutral-800 rounded-3xl border border-gray-200 dark:border-neutral-700 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-2xl overflow-hidden bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 flex-shrink-0 shadow-md">
              <img
                src={item.imageUrl || getSchoolProductImage(item)}
                alt={item.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src =
                    CATEGORY_FALLBACK_IMAGES[item.category] || CATEGORY_FALLBACK_IMAGES.General;
                }}
              />
            </div>

            <div>
              {/* Badges line */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-extrabold px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-300">
                  {item.sku || 'SKU-GEN-001'}
                </span>
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-300">
                  {item.category || 'General'}
                </span>
                {item.subCategory && (
                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-neutral-700 text-gray-600 dark:text-gray-300">
                    {item.subCategory}
                  </span>
                )}
                <span
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                    isOutOfStock
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      : isLowStock
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}
                >
                  {isOutOfStock ? '● Out of Stock' : isLowStock ? '▲ Low Stock Warning' : '✓ In Stock & Available'}
                </span>
              </div>

              <h1 className="text-2xl font-black text-gray-900 dark:text-white mt-2">
                {item.name}
              </h1>

              {/* Coordinates line */}
              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-2 flex-wrap">
                <span className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-gray-300">
                  <Tag className="h-3.5 w-3.5 text-gray-400" />
                  Unit: <span className="font-bold">{item.unit || 'units'}</span>
                </span>

                <span className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-gray-300">
                  <DollarSign className="h-3.5 w-3.5 text-gray-400" />
                  Procurement Cost: <span className="font-bold">{formatCurrency(unitCostVal)}</span>
                </span>

                {(item.sellingPrice || item.price) && (
                  <span className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-gray-300">
                    <TrendingUp className="h-3.5 w-3.5 text-gray-400" />
                    Standard Price: <span className="font-bold">{formatCurrency(item.sellingPrice || item.price)}</span>
                  </span>
                )}

                {(item.rackNumber || item.shelfNumber || item.roomNumber) && (
                  <span className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-gray-300">
                    <MapPin className="h-3.5 w-3.5 text-gray-400" />
                    Location:{' '}
                    {[
                      item.roomNumber ? `Room ${item.roomNumber}` : null,
                      item.rackNumber ? `Rack ${item.rackNumber}` : null,
                      item.shelfNumber ? `Shelf ${item.shelfNumber}` : null,
                    ]
                      .filter(Boolean)
                      .join(' / ')}
                  </span>
                )}

                <span className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-gray-300">
                  <Truck className="h-3.5 w-3.5 text-gray-400" />
                  Primary Vendor:{' '}
                  {vendorObj ? (
                    <Link
                      to={`/vendors/${vendorObj._id || vendorObj.id}`}
                      className="text-primary-600 dark:text-primary-400 underline font-bold"
                    >
                      {vendorName}
                    </Link>
                  ) : (
                    <span className="font-medium">{vendorName}</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Current Stock Counter & Threshold Progress */}
          <div className="bg-gray-50 dark:bg-neutral-900/80 p-5 rounded-2xl border border-gray-200 dark:border-neutral-700 min-w-[240px] text-right">
            <span className="text-xs text-gray-400 font-semibold block">Available Stock on Hand</span>
            <div className="flex items-baseline justify-end gap-1.5 mt-0.5">
              <span
                className={`text-3xl font-black ${
                  isOutOfStock
                    ? 'text-rose-600 dark:text-rose-400'
                    : isLowStock
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-gray-900 dark:text-white'
                }`}
              >
                {item.quantity ?? 0}
              </span>
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{item.unit || 'units'}</span>
            </div>

            {/* Threshold Gauge Bar */}
            <div className="mt-2.5 space-y-1">
              <div className="flex justify-between text-[11px] font-semibold text-gray-400">
                <span>Threshold: {minThreshold}</span>
                <span>
                  {Math.round(((item.quantity || 0) / Math.max(minThreshold * 2, 1)) * 100)}% Health
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-neutral-700 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isOutOfStock
                      ? 'bg-rose-500 w-0'
                      : isLowStock
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{
                    width: `${Math.min(100, Math.max(8, ((item.quantity || 0) / (minThreshold * 2)) * 100))}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 4 DYNAMIC KPI CARDS ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current Stock */}
        <div className="bg-white dark:bg-neutral-800 p-5 rounded-2xl border border-gray-200 dark:border-neutral-700 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
            <Boxes className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-semibold block">Current On Hand</span>
            <h3 className="text-xl font-black text-gray-900 dark:text-white mt-0.5">
              {item.quantity ?? 0} {item.unit || 'Units'}
            </h3>
            <span className="text-[11px] text-gray-400 block">Min Alert: {minThreshold} units</span>
          </div>
        </div>

        {/* Valuation */}
        <div className="bg-white dark:bg-neutral-800 p-5 rounded-2xl border border-gray-200 dark:border-neutral-700 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-semibold block">Inventory Asset Value</span>
            <h3 className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
              {formatCurrency(currentValuation)}
            </h3>
            <span className="text-[11px] text-gray-400 block">@ ₹{unitCostVal}/unit cost</span>
          </div>
        </div>

        {/* Minimum Threshold */}
        <div className="bg-white dark:bg-neutral-800 p-5 rounded-2xl border border-gray-200 dark:border-neutral-700 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-semibold block">Min Reorder Threshold</span>
            <h3 className="text-xl font-black text-gray-900 dark:text-white mt-0.5">
              {minThreshold} {item.unit || 'Units'}
            </h3>
            <span className="text-[11px] text-gray-400 block">
              {item.quantity <= minThreshold ? '⚠️ Low stock triggered' : '✅ Stock is above threshold'}
            </span>
          </div>
        </div>

        {/* Movement Ledger Count */}
        <div className="bg-white dark:bg-neutral-800 p-5 rounded-2xl border border-gray-200 dark:border-neutral-700 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
            <History className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-semibold block">Audit Movement Logs</span>
            <h3 className="text-xl font-black text-gray-900 dark:text-white mt-0.5">
              {transactions.length} Movements
            </h3>
            <span className="text-[11px] text-gray-400 block">Historical adjustments & transfers</span>
          </div>
        </div>
      </div>

      {/* ─── TAB NAVIGATION BAR ─────────────────────────────────────────────── */}
      <div className="flex border-b border-gray-200 dark:border-neutral-700 gap-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Specifications & Vendor', icon: Layers },
          { id: 'transactions', label: `Movement Ledger (${transactions.length})`, icon: History },
          { id: 'analytics', label: 'Consumption Trends', icon: BarChart3 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-all ${
                isActive
                  ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-300'
                  : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ─── TAB 1: SPECIFICATIONS & VENDOR ─────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Products Table if multiple items in record */}
            {Array.isArray(item.items) && item.items.length > 1 && (
              <div className="bg-white dark:bg-neutral-800 rounded-3xl border border-gray-200 dark:border-neutral-700 p-6 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-700 pb-3">
                  <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Boxes className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    Items Included in this Procurement Record ({item.items.length})
                  </h3>
                  <span className="text-xs font-bold text-gray-500">
                    Total {item.quantity} Units
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-neutral-700 text-gray-500 font-bold uppercase text-[10px]">
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-3">Product</th>
                        <th className="py-2.5 px-3 text-center">Qty</th>
                        <th className="py-2.5 px-3 text-right">Unit Price</th>
                        <th className="py-2.5 px-3 text-center">GST %</th>
                        <th className="py-2.5 px-3 text-right">Line Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-neutral-700">
                      {item.items.map((it, idx) => (
                        <tr key={it._id || idx} className="hover:bg-gray-50 dark:hover:bg-neutral-700/30">
                          <td className="py-2.5 px-3 text-gray-400 font-bold">{idx + 1}</td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2.5">
                              {it.imageUrl && (
                                <img
                                  src={it.imageUrl}
                                  alt={it.name}
                                  className="h-8 w-8 rounded-lg object-cover border border-gray-200 dark:border-neutral-700"
                                />
                              )}
                              <div>
                                <span className="font-bold text-gray-900 dark:text-white block">{it.name}</span>
                                <span className="text-[10px] text-gray-400 font-mono">{it.sku}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold text-gray-800 dark:text-gray-200">
                            {it.quantity} {it.unit || 'pcs'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-medium text-gray-700 dark:text-gray-300">
                            {formatCurrency(it.unitCost || it.price || 0)}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold text-amber-600">
                            {it.gstRate || 0}%
                          </td>
                          <td className="py-2.5 px-3 text-right font-black text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(it.totalCostWithTax || (it.quantity * (it.unitCost || it.price || 0)))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Detailed Spec Grid */}
            <div className="bg-white dark:bg-neutral-800 rounded-3xl border border-gray-200 dark:border-neutral-700 p-6 shadow-sm">
              <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                Product Specifications
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-neutral-700/40">
                  <span className="text-[11px] font-bold text-gray-400 uppercase block">SKU Code</span>
                  <span className="text-sm font-mono font-bold text-gray-800 dark:text-gray-100 mt-0.5 block">
                    {item.sku || '—'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-neutral-700/40">
                  <span className="text-[11px] font-bold text-gray-400 uppercase block">Item Name</span>
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-100 mt-0.5 block">
                    {item.name || '—'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-neutral-700/40">
                  <span className="text-[11px] font-bold text-gray-400 uppercase block">Category / Domain</span>
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-100 mt-0.5 block">
                    {item.category || 'General'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-neutral-700/40">
                  <span className="text-[11px] font-bold text-gray-400 uppercase block">Sub-Category</span>
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-100 mt-0.5 block">
                    {item.subCategory || 'Standard'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-neutral-700/40">
                  <span className="text-[11px] font-bold text-gray-400 uppercase block">Unit of Measurement</span>
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-100 mt-0.5 block">
                    {item.unit || 'Units'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-neutral-700/40">
                  <span className="text-[11px] font-bold text-gray-400 uppercase block">Unit Procurement Cost</span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                    {formatCurrency(unitCostVal)}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-neutral-700/40">
                  <span className="text-[11px] font-bold text-gray-400 uppercase block">Standard Selling / Issue Price</span>
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-100 mt-0.5 block">
                    {formatCurrency(item.sellingPrice || item.price || 0)}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-neutral-700/40">
                  <span className="text-[11px] font-bold text-gray-400 uppercase block">Minimum Stock Threshold</span>
                  <span className="text-sm font-bold text-amber-600 dark:text-amber-400 mt-0.5 block">
                    {minThreshold} {item.unit || 'units'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-neutral-700/40">
                  <span className="text-[11px] font-bold text-gray-400 uppercase block">Max Stock Capacity</span>
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-100 mt-0.5 block">
                    {item.maxStockLevel ? `${item.maxStockLevel} ${item.unit || 'units'}` : 'Unlimited / Flexible'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-neutral-700/40">
                  <span className="text-[11px] font-bold text-gray-400 uppercase block">Barcode / Serial</span>
                  <span className="text-sm font-mono font-bold text-gray-800 dark:text-gray-100 mt-0.5 block">
                    {item.barcode || item.serialNumber || '—'}
                  </span>
                </div>
              </div>

              {item.description && (
                <div className="mt-4 p-4 rounded-xl bg-gray-50 dark:bg-neutral-700/40 border border-gray-100 dark:border-neutral-700">
                  <span className="text-[11px] font-bold text-gray-400 uppercase block mb-1">Description & Usage Notes</span>
                  <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{item.description}</p>
                </div>
              )}
            </div>

            {/* Storage Coordinates */}
            <div className="bg-white dark:bg-neutral-800 rounded-3xl border border-gray-200 dark:border-neutral-700 p-6 shadow-sm">
              <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                Physical Storage Coordinates
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-neutral-700/40 border border-gray-100 dark:border-neutral-700">
                  <span className="text-[11px] font-bold text-gray-400 uppercase block">Room / Warehouse</span>
                  <h4 className="text-lg font-black text-gray-900 dark:text-white mt-1">
                    {item.roomNumber || item.warehouseLocation || 'Main Store'}
                  </h4>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-neutral-700/40 border border-gray-100 dark:border-neutral-700">
                  <span className="text-[11px] font-bold text-gray-400 uppercase block">Rack Identifier</span>
                  <h4 className="text-lg font-black text-gray-900 dark:text-white mt-1">
                    {item.rackNumber ? `Rack ${item.rackNumber}` : '—'}
                  </h4>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-neutral-700/40 border border-gray-100 dark:border-neutral-700">
                  <span className="text-[11px] font-bold text-gray-400 uppercase block">Shelf Tier</span>
                  <h4 className="text-lg font-black text-gray-900 dark:text-white mt-1">
                    {item.shelfNumber ? `Shelf ${item.shelfNumber}` : '—'}
                  </h4>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Vendor Profile Card */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-neutral-800 rounded-3xl border border-gray-200 dark:border-neutral-700 p-6 shadow-sm">
              <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                Primary Supplier / Vendor
              </h3>

              {vendorObj ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-neutral-700/40 border border-gray-100 dark:border-neutral-700 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-gray-200 dark:bg-neutral-700 text-gray-700 dark:text-gray-300">
                        {vendorObj.vendorCode || 'VND-001'}
                      </span>
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        ● Approved Supplier
                      </span>
                    </div>

                    <h4 className="text-base font-black text-gray-900 dark:text-white">
                      {vendorObj.name}
                    </h4>

                    <div className="space-y-2 text-xs text-gray-600 dark:text-gray-300 pt-1">
                      {vendorObj.category && (
                        <p className="flex items-center gap-2">
                          <Tag className="h-3.5 w-3.5 text-gray-400" />
                          Category: <span className="font-semibold">{vendorObj.category}</span>
                        </p>
                      )}
                      {vendorObj.contactPerson && (
                        <p className="flex items-center gap-2">
                          <Users className="h-3.5 w-3.5 text-gray-400" />
                          Contact: <span className="font-semibold">{vendorObj.contactPerson}</span>
                        </p>
                      )}
                      {vendorObj.phone && (
                        <p className="flex items-center gap-2">
                          <Info className="h-3.5 w-3.5 text-gray-400" />
                          Phone: <span className="font-semibold">{vendorObj.phone}</span>
                        </p>
                      )}
                      {vendorObj.email && (
                        <p className="flex items-center gap-2">
                          <Info className="h-3.5 w-3.5 text-gray-400" />
                          Email: <span className="font-semibold">{vendorObj.email}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <Link
                    to={`/vendors/${vendorObj._id || vendorObj.id}`}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold bg-primary-50 hover:bg-primary-100 dark:bg-primary-950/40 dark:hover:bg-primary-900/60 text-primary-600 dark:text-primary-300 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open Vendor Dossier & Ledger
                  </Link>
                </div>
              ) : (
                <div className="text-center py-6 space-y-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    No primary vendor profile is currently linked to this SKU.
                  </p>
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Supplier: {item.supplier || 'Direct Local Market'}
                  </p>
                  <Link
                    to={ROUTES.VENDORS.LIST}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 dark:text-primary-400 underline"
                  >
                    Browse & Assign Approved Vendor
                  </Link>
                </div>
              )}
            </div>

            {/* Quick Actions Card */}
            <div className="bg-gradient-to-br from-primary-900 to-indigo-900 rounded-3xl p-6 text-white shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-amber-300" />
                </div>
                <div>
                  <h4 className="text-sm font-black">Stock Calibration</h4>
                  <p className="text-[11px] text-white/70">Physical audit reconciliation</p>
                </div>
              </div>
              <p className="text-xs text-white/80 leading-relaxed">
                Adjust stock count up or down with physical count audits, damage reports, or returns with automated transaction logging.
              </p>
              <button
                onClick={handleOpenAdjust}
                className="w-full py-2.5 rounded-xl bg-white text-primary-900 font-bold text-xs hover:bg-gray-100 transition-colors shadow"
              >
                Calibrate Stock Count
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: MOVEMENT AUDIT LEDGER ───────────────────────────────────── */}
      {activeTab === 'transactions' && (
        <div className="bg-white dark:bg-neutral-800 rounded-3xl border border-gray-200 dark:border-neutral-700 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-base font-black text-gray-900 dark:text-white">
                Immutable Stock Movement Ledger
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Complete chronological audit log of inward restocks, issuances, count adjustments, and returns.
              </p>
            </div>
            <button
              onClick={handleOpenAdjust}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-gray-100 dark:bg-neutral-700 hover:bg-gray-200 dark:hover:bg-neutral-600 text-gray-800 dark:text-gray-200"
            >
              <ArrowLeftRight className="h-4 w-4" />
              Stock Count Adjustment
            </button>
          </div>

          {transactions.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <History className="h-12 w-12 text-gray-400 mx-auto" />
              <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">No Movement Records Found</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Any future purchases, issuances, or manual adjustments will log here chronologically.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-neutral-700 text-gray-400 font-bold uppercase text-[10px]">
                    <th className="py-3 px-3">Timestamp</th>
                    <th className="py-3 px-3">Movement Type</th>
                    <th className="py-3 px-3 text-right">Delta Qty</th>
                    <th className="py-3 px-3 text-right">Balance Qty</th>
                    <th className="py-3 px-3">Reference / Doc</th>
                    <th className="py-3 px-3">Operator Remarks / Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-neutral-700">
                  {transactions.map((tx) => {
                    const isPlus = tx.type === 'INWARD' || (tx.type === 'ADJUSTMENT' && tx.quantity > 0);
                    return (
                      <tr key={tx._id || tx.id} className="hover:bg-gray-50 dark:hover:bg-neutral-750 transition-colors">
                        <td className="py-3.5 px-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {formatDateTime(tx.timestamp || tx.createdAt)}
                        </td>
                        <td className="py-3.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              tx.type === 'INWARD'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                : tx.type === 'OUTWARD'
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                : tx.type === 'ADJUSTMENT'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                            }`}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td
                          className={`py-3.5 px-3 text-right font-black ${
                            isPlus
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {isPlus ? `+${Math.abs(tx.quantity)}` : `-${Math.abs(tx.quantity)}`}{' '}
                          {item.unit || ''}
                        </td>
                        <td className="py-3.5 px-3 text-right font-bold text-gray-900 dark:text-white">
                          {tx.newQuantity !== undefined ? tx.newQuantity : '—'}
                        </td>
                        <td className="py-3.5 px-3 font-mono font-semibold text-gray-700 dark:text-gray-300">
                          {tx.referenceNumber || tx.referenceType || 'Direct Adjustment'}
                        </td>
                        <td className="py-3.5 px-3 text-gray-600 dark:text-gray-300 max-w-xs truncate">
                          {tx.notes || tx.reason || 'Standard transaction'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 5: CONSUMPTION TRENDS & ANALYTICS ──────────────────────────── */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-neutral-800 rounded-3xl border border-gray-200 dark:border-neutral-700 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              Monthly Consumption Trend
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Units issued to classes and students over recent months.
            </p>

            {consumptionTrend.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-400">
                No monthly consumption data recorded yet.
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                {consumptionTrend.map((ct) => {
                  const maxUsage = Math.max(...consumptionTrend.map((c) => c.quantity || 1), 1);
                  const pct = Math.round(((ct.quantity || 0) / maxUsage) * 100);
                  return (
                    <div key={ct.month} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
                        <span>{ct.month}</span>
                        <span>
                          {ct.quantity} {item.unit || 'units'}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-neutral-700 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-primary-600 dark:bg-primary-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(5, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-3xl border border-gray-200 dark:border-neutral-700 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              Class vs Department Allocation Ratio
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Breakdown of total issued volume by recipient category.
            </p>

            <div className="grid grid-cols-3 gap-3 pt-4">
              {['Class', 'Student', 'Teacher'].map((recType) => {
                const totalTypeQty = issuances
                  .filter((i) => i.recipientType === recType)
                  .reduce((sum, iss) => {
                    const line = iss.items?.find((it) => String(it.itemId) === String(id));
                    return sum + (line ? Number(line.quantity) || 0 : 0);
                  }, 0);

                return (
                  <div
                    key={recType}
                    className="p-4 rounded-2xl bg-gray-50 dark:bg-neutral-700/40 border border-gray-100 dark:border-neutral-700 text-center"
                  >
                    <span className="text-[11px] font-bold text-gray-400 uppercase block">{recType}</span>
                    <h4 className="text-xl font-black text-gray-900 dark:text-white mt-1">
                      {totalTypeQty}
                    </h4>
                    <span className="text-[10px] text-gray-400 block mt-0.5">{item.unit || 'units'}</span>
                  </div>
                );
              })}
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-800 dark:text-amber-200 space-y-1">
              <div className="flex items-center gap-2 font-bold">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Optimal Reorder Calculation
              </div>
              <p className="text-[11px] leading-relaxed text-amber-700 dark:text-amber-300">
                Based on current consumption trends and the minimum safety threshold of {minThreshold} {item.unit || 'units'}, recommended reorder batch is at least {minThreshold * 2} units.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: ADJUST STOCK ────────────────────────────────────────────── */}
      <Modal open={showAdjustModal} onClose={() => setShowAdjustModal(false)} title="Adjust Stock Balance" size="md">
        <form onSubmit={handleSaveAdjust} className="space-y-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Manually update the on-hand physical stock for <strong className="text-gray-800 dark:text-gray-200">{item.name}</strong>. An immutable audit record will be logged.
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setAdjustForm((p) => ({ ...p, type: 'in' }))}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                adjustForm.type === 'in'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              + Stock In (Add Units)
            </button>
            <button
              type="button"
              onClick={() => setAdjustForm((p) => ({ ...p, type: 'out' }))}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                adjustForm.type === 'out'
                  ? 'bg-rose-600 text-white shadow'
                  : 'bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              - Stock Out (Deduct Units)
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
              Quantity to {adjustForm.type === 'in' ? 'Add' : 'Deduct'} ({item.unit || 'Units'}) *
            </label>
            <input
              type="number"
              min="1"
              required
              value={adjustForm.quantity}
              onChange={(e) => setAdjustForm((p) => ({ ...p, quantity: e.target.value }))}
              placeholder="e.g. 15"
              className="w-full bg-gray-50 dark:bg-neutral-700 border border-gray-200 dark:border-neutral-600 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
              Reason for Adjustment
            </label>
            <select
              value={adjustForm.reason}
              onChange={(e) => setAdjustForm((p) => ({ ...p, reason: e.target.value }))}
              className="w-full bg-gray-50 dark:bg-neutral-700 border border-gray-200 dark:border-neutral-600 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white"
            >
              <option value="Physical Stock Count Audit">Physical Stock Count Audit</option>
              <option value="Damaged / Broken Goods">Damaged / Broken Goods</option>
              <option value="Expired / Obsolete Material">Expired / Obsolete Material</option>
              <option value="Returned from Student / Teacher">Returned from Student / Teacher</option>
              <option value="Found Unrecorded Stock">Found Unrecorded Stock</option>
              <option value="Other Discrepancy">Other Discrepancy</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
              Operator Notes / Remarks
            </label>
            <textarea
              rows="2"
              value={adjustForm.notes}
              onChange={(e) => setAdjustForm((p) => ({ ...p, notes: e.target.value }))}
              placeholder="Provide context or authorization details..."
              className="w-full bg-gray-50 dark:bg-neutral-700 border border-gray-200 dark:border-neutral-600 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-neutral-700">
            <button
              type="button"
              onClick={() => setShowAdjustModal(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-neutral-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 shadow"
            >
              {submitting ? 'Applying...' : 'Apply Adjustment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
