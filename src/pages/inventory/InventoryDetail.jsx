// ui/src/pages/inventory/InventoryDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  ArrowLeft,
  Package,
  Boxes,
  Truck,
  Receipt,
  GraduationCap,
  Users,
  UserCheck,
  History,
  ArrowDownRight,
  ArrowUpRight,
  ArrowLeftRight,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  Printer,
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
  createPurchaseBill,
  createMaterialIssuance,
  updateInventoryItem,
} from '../../services/inventoryService.js';
import { getVendors } from '../../services/vendorService.js';
import Modal from '../../components/ui/Modal.jsx';
import Loader from '../../components/ui/Loader.jsx';
import { ROUTES } from '../../routes/routes.js';

export default function InventoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'purchases', 'issuances', 'transactions', 'analytics'

  // Data states
  const [item, setItem] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [issuances, setIssuances] = useState([]);
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

  const [showInwardModal, setShowInwardModal] = useState(false);
  const [inwardForm, setInwardForm] = useState({
    vendorId: '',
    billNumber: '',
    billDate: new Date().toISOString().split('T')[0],
    quantity: 10,
    unitCost: 0,
    paymentType: 'Bank Transfer',
    amountPaid: '',
    transactionReference: '',
    notes: '',
  });

  const [showIssuanceModal, setShowIssuanceModal] = useState(false);
  const [issuanceForm, setIssuanceForm] = useState({
    recipientType: 'Class',
    className: 'Class 10',
    section: 'A',
    studentName: '',
    studentRollNumber: '',
    teacherName: '',
    quantity: 1,
    issuanceDate: new Date().toISOString().split('T')[0],
    purpose: 'Academic Session Distribution',
    notes: '',
  });

  const [selectedBillReceipt, setSelectedBillReceipt] = useState(null);

  // Fetch complete product data
  const fetchProductData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await getInventoryById(id);
      const data = res?.data || res;
      setItem(data.item);
      setPurchases(data.purchases || []);
      setIssuances(data.issuances || []);
      setTransactions(data.transactions || []);
      setKpis(data.kpis || null);
      setConsumptionTrend(data.consumptionTrend || []);

      // Pre-fill inward form unit cost
      if (data.item) {
        setInwardForm((prev) => ({
          ...prev,
          unitCost: data.item.unitCost || data.item.price || 0,
          vendorId: data.item.vendorId?._id || data.item.vendorId?.id || data.item.vendorId || '',
        }));
      }
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

  // ─── HANDLER: INWARD PROCUREMENT (PURCHASE BILL) ─────────────────────────
  const handleOpenInward = () => {
    setInwardForm({
      vendorId: item?.vendorId?._id || item?.vendorId?.id || item?.vendorId || (vendorsList[0]?._id || vendorsList[0]?.id || ''),
      billNumber: `BILL-${Date.now().toString(36).toUpperCase()}`,
      billDate: new Date().toISOString().split('T')[0],
      quantity: 10,
      unitCost: item?.unitCost || item?.price || 0,
      paymentType: 'Bank Transfer',
      amountPaid: '',
      transactionReference: '',
      notes: `Restock procurement for ${item?.name}`,
    });
    setShowInwardModal(true);
  };

  const handleSaveInward = async (e) => {
    e.preventDefault();
    const qty = Number(inwardForm.quantity);
    const cost = Number(inwardForm.unitCost);
    if (!qty || qty <= 0) return toast.warn('Please enter a valid inward quantity.');
    if (cost < 0) return toast.warn('Please enter a valid unit cost.');

    const totalBillAmt = qty * cost;
    setSubmitting(true);
    try {
      const payload = {
        vendorId: inwardForm.vendorId,
        billNumber: inwardForm.billNumber,
        billDate: inwardForm.billDate,
        paymentType: inwardForm.paymentType,
        amountPaid: inwardForm.amountPaid !== '' ? Number(inwardForm.amountPaid) : totalBillAmt,
        transactionReference: inwardForm.transactionReference,
        notes: inwardForm.notes,
        items: [
          {
            itemId: id,
            name: item.name,
            sku: item.sku,
            category: item.category,
            quantity: qty,
            unitCost: cost,
            totalCost: totalBillAmt,
          },
        ],
        subtotal: totalBillAmt,
        grandTotal: totalBillAmt,
      };

      const res = await createPurchaseBill(payload);
      if (res?.overrun) return;

      setShowInwardModal(false);
      fetchProductData();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // ─── HANDLER: OUTWARD ISSUANCE (CLASS / STUDENT) ──────────────────────────
  const handleOpenIssuance = () => {
    setIssuanceForm({
      recipientType: 'Class',
      className: 'Class 10',
      section: 'A',
      studentName: '',
      studentRollNumber: '',
      teacherName: '',
      quantity: 1,
      issuanceDate: new Date().toISOString().split('T')[0],
      purpose: 'Term Session Requisition',
      notes: '',
    });
    setShowIssuanceModal(true);
  };

  const handleSaveIssuance = async (e) => {
    e.preventDefault();
    const qty = Number(issuanceForm.quantity);
    if (!qty || qty <= 0) return toast.warn('Please enter a valid issuance quantity.');
    if (qty > (item?.quantity || 0)) {
      return toast.error(`Insufficient stock! Current stock is only ${item?.quantity || 0} ${item?.unit || 'units'}.`);
    }

    setSubmitting(true);
    try {
      const payload = {
        issuanceNumber: `ISS-${Date.now().toString(36).toUpperCase()}`,
        issuanceDate: issuanceForm.issuanceDate,
        recipientType: issuanceForm.recipientType,
        className: issuanceForm.recipientType === 'Class' ? issuanceForm.className : undefined,
        section: issuanceForm.recipientType === 'Class' ? issuanceForm.section : undefined,
        studentName: issuanceForm.recipientType === 'Student' ? issuanceForm.studentName : undefined,
        studentRollNumber: issuanceForm.recipientType === 'Student' ? issuanceForm.studentRollNumber : undefined,
        teacherName: issuanceForm.recipientType === 'Teacher' ? issuanceForm.teacherName : undefined,
        purpose: issuanceForm.purpose,
        notes: issuanceForm.notes,
        items: [
          {
            itemId: id,
            name: item.name,
            sku: item.sku,
            quantity: qty,
          },
        ],
      };

      await createMaterialIssuance(payload);
      setShowIssuanceModal(false);
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
            onClick={handleOpenInward}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-sm transition-all"
          >
            <Receipt className="h-4 w-4" />
            Stock In (Purchase Bill)
          </button>

          <button
            onClick={handleOpenIssuance}
            disabled={isOutOfStock}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm transition-all ${
              isOutOfStock
                ? 'bg-gray-400 cursor-not-allowed opacity-60'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            <GraduationCap className="h-4 w-4" />
            Issue to Class / Student
          </button>

          <button
            onClick={handleOpenAdjust}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-200 transition-all border border-gray-200 dark:border-neutral-700"
          >
            <ArrowLeftRight className="h-4 w-4 text-gray-500 dark:text-gray-400" />
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
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-primary-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
              <Package className="h-8 w-8" />
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
                  Procurement Cost: <span className="font-bold">₹{unitCostVal.toLocaleString('en-IN')}</span>
                </span>

                {(item.sellingPrice || item.price) && (
                  <span className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-gray-300">
                    <TrendingUp className="h-3.5 w-3.5 text-gray-400" />
                    Standard Price: <span className="font-bold">₹{(item.sellingPrice || item.price).toLocaleString('en-IN')}</span>
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
              ₹{currentValuation.toLocaleString('en-IN')}
            </h3>
            <span className="text-[11px] text-gray-400 block">@ ₹{unitCostVal}/unit cost</span>
          </div>
        </div>

        {/* Total Procured */}
        <div className="bg-white dark:bg-neutral-800 p-5 rounded-2xl border border-gray-200 dark:border-neutral-700 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
            <ArrowDownRight className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-semibold block">Total Procured In</span>
            <h3 className="text-xl font-black text-gray-900 dark:text-white mt-0.5">
              {kpis?.totalProcuredQty ?? purchases.reduce((s, p) => {
                const line = p.items?.find((it) => String(it.itemId) === String(id));
                return s + (line ? Number(line.quantity) || 0 : 0);
              }, 0)}{' '}
              {item.unit || 'Units'}
            </h3>
            <span className="text-[11px] text-gray-400 block">Across {purchases.length} Purchase Bills</span>
          </div>
        </div>

        {/* Total Issued */}
        <div className="bg-white dark:bg-neutral-800 p-5 rounded-2xl border border-gray-200 dark:border-neutral-700 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
            <ArrowUpRight className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-semibold block">Total Issued Out</span>
            <h3 className="text-xl font-black text-gray-900 dark:text-white mt-0.5">
              {kpis?.totalIssuedQty ?? issuances.reduce((s, iss) => {
                const line = iss.items?.find((it) => String(it.itemId) === String(id));
                return s + (line ? Number(line.quantity) || 0 : 0);
              }, 0)}{' '}
              {item.unit || 'Units'}
            </h3>
            <span className="text-[11px] text-gray-400 block">Across {issuances.length} Distributions</span>
          </div>
        </div>
      </div>

      {/* ─── TAB NAVIGATION BAR ─────────────────────────────────────────────── */}
      <div className="flex border-b border-gray-200 dark:border-neutral-700 gap-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Specifications & Vendor', icon: Layers },
          { id: 'purchases', label: `Inward Bills (${purchases.length})`, icon: Receipt },
          { id: 'issuances', label: `Class Distributions (${issuances.length})`, icon: GraduationCap },
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
                    ₹{unitCostVal.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-neutral-700/40">
                  <span className="text-[11px] font-bold text-gray-400 uppercase block">Standard Selling / Issue Price</span>
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-100 mt-0.5 block">
                    ₹{(item.sellingPrice || item.price || 0).toLocaleString('en-IN')}
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
                  <h4 className="text-sm font-black">Budget Safeguard Active</h4>
                  <p className="text-[11px] text-white/70">Automatic School Requirements Check</p>
                </div>
              </div>
              <p className="text-xs text-white/80 leading-relaxed">
                When generating new purchase bills for this item, the total cost will automatically verify against the current academic session budget allocation and deduct in real time.
              </p>
              <button
                onClick={handleOpenInward}
                className="w-full py-2.5 rounded-xl bg-white text-primary-900 font-bold text-xs hover:bg-gray-100 transition-colors shadow"
              >
                Procure More Stock Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: INWARD PROCUREMENT BILLS ────────────────────────────────── */}
      {activeTab === 'purchases' && (
        <div className="bg-white dark:bg-neutral-800 rounded-3xl border border-gray-200 dark:border-neutral-700 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-base font-black text-gray-900 dark:text-white">
                Inward Purchase Bills (Procurement Records)
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                All vendor invoices and inward consignments containing this item.
              </p>
            </div>

            <button
              onClick={handleOpenInward}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-sm"
            >
              <Plus className="h-4 w-4" />
              New Purchase Bill
            </button>
          </div>

          {purchases.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <Receipt className="h-12 w-12 text-gray-400 mx-auto" />
              <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">No Purchase Bills Recorded Yet</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Inward vendor purchase orders and receipts will appear here automatically upon stock-in.
              </p>
              <button
                onClick={handleOpenInward}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-primary-600 text-white"
              >
                Record Initial Purchase Bill
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-neutral-700 text-gray-400 font-bold uppercase text-[10px]">
                    <th className="py-3 px-3">Bill Number</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Vendor / Seller</th>
                    <th className="py-3 px-3 text-right">Qty Procured</th>
                    <th className="py-3 px-3 text-right">Unit Cost</th>
                    <th className="py-3 px-3 text-right">Line Total</th>
                    <th className="py-3 px-3">Payment Method</th>
                    <th className="py-3 px-3">Budget Impact</th>
                    <th className="py-3 px-3 text-center">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-neutral-700">
                  {purchases.map((bill) => {
                    const line = bill.items?.find((it) => String(it.itemId) === String(id));
                    const lineQty = line ? Number(line.quantity) || 0 : 0;
                    const lineCost = line ? Number(line.unitCost) || 0 : 0;
                    const lineTotal = line ? Number(line.totalCost) || lineQty * lineCost : 0;
                    const vName = bill.vendorId?.name || bill.vendorName || 'Vendor';

                    return (
                      <tr key={bill._id || bill.id} className="hover:bg-gray-50 dark:hover:bg-neutral-750 transition-colors">
                        <td className="py-3.5 px-3 font-mono font-bold text-gray-900 dark:text-white">
                          {bill.billNumber}
                        </td>
                        <td className="py-3.5 px-3 text-gray-600 dark:text-gray-300">
                          {new Date(bill.billDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="py-3.5 px-3">
                          {bill.vendorId?._id || bill.vendorId?.id ? (
                            <Link
                              to={`/vendors/${bill.vendorId._id || bill.vendorId.id}`}
                              className="font-bold text-primary-600 dark:text-primary-400 hover:underline"
                            >
                              {vName}
                            </Link>
                          ) : (
                            <span className="font-semibold text-gray-800 dark:text-gray-200">{vName}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-right font-black text-emerald-600 dark:text-emerald-400">
                          +{lineQty} {item.unit || ''}
                        </td>
                        <td className="py-3.5 px-3 text-right font-semibold text-gray-700 dark:text-gray-300">
                          ₹{lineCost.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-3 text-right font-black text-gray-900 dark:text-white">
                          ₹{lineTotal.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-300 font-semibold text-[11px]">
                            {bill.paymentType || 'Bank Transfer'}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Budget Deducted
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <button
                            onClick={() => setSelectedBillReceipt(bill)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-neutral-700"
                            title="View Receipt"
                          >
                            <FileText className="h-4 w-4" />
                          </button>
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

      {/* ─── TAB 3: CLASS & STUDENT DISTRIBUTIONS (ISSUANCES) ──────────────── */}
      {activeTab === 'issuances' && (
        <div className="bg-white dark:bg-neutral-800 rounded-3xl border border-gray-200 dark:border-neutral-700 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-base font-black text-gray-900 dark:text-white">
                Class & Student Outward Distributions (Issuances)
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Every outward allocation to classrooms, individual students, or faculty departments.
              </p>
            </div>

            <button
              onClick={handleOpenIssuance}
              disabled={isOutOfStock}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-sm ${
                isOutOfStock ? 'bg-gray-400 cursor-not-allowed opacity-60' : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              <Plus className="h-4 w-4" />
              Issue to Class / Student
            </button>
          </div>

          {issuances.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <GraduationCap className="h-12 w-12 text-gray-400 mx-auto" />
              <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">No Issuances Recorded Yet</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                When items are handed out to students, classes, or teachers, records will appear here.
              </p>
              <button
                onClick={handleOpenIssuance}
                disabled={isOutOfStock}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white"
              >
                Issue Item Now
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-neutral-700 text-gray-400 font-bold uppercase text-[10px]">
                    <th className="py-3 px-3">Issuance ID</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Recipient Type</th>
                    <th className="py-3 px-3">Target Details</th>
                    <th className="py-3 px-3 text-right">Qty Issued</th>
                    <th className="py-3 px-3">Purpose / Subject</th>
                    <th className="py-3 px-3">Authorized By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-neutral-700">
                  {issuances.map((iss) => {
                    const line = iss.items?.find((it) => String(it.itemId) === String(id));
                    const lineQty = line ? Number(line.quantity) || 0 : 0;

                    let targetInfo = '—';
                    if (iss.recipientType === 'Class') {
                      targetInfo = `${iss.className || 'Class'} (Sec ${iss.section || 'All'})`;
                    } else if (iss.recipientType === 'Student') {
                      targetInfo = `${iss.studentName || 'Student'} ${iss.studentRollNumber ? `(Roll: ${iss.studentRollNumber})` : ''}`;
                    } else if (iss.recipientType === 'Teacher') {
                      targetInfo = iss.teacherName || 'Faculty Staff';
                    }

                    return (
                      <tr key={iss._id || iss.id} className="hover:bg-gray-50 dark:hover:bg-neutral-750 transition-colors">
                        <td className="py-3.5 px-3 font-mono font-bold text-gray-900 dark:text-white">
                          {iss.issuanceNumber}
                        </td>
                        <td className="py-3.5 px-3 text-gray-600 dark:text-gray-300">
                          {new Date(iss.issuanceDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="py-3.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              iss.recipientType === 'Class'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                : iss.recipientType === 'Student'
                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                          >
                            {iss.recipientType}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 font-bold text-gray-800 dark:text-gray-200">
                          {targetInfo}
                        </td>
                        <td className="py-3.5 px-3 text-right font-black text-rose-600 dark:text-rose-400">
                          -{lineQty} {item.unit || ''}
                        </td>
                        <td className="py-3.5 px-3 text-gray-600 dark:text-gray-300">
                          {iss.purpose || 'Regular Allocation'}
                        </td>
                        <td className="py-3.5 px-3 text-gray-500 dark:text-gray-400 text-[11px]">
                          {iss.issuedBy || 'System Admin'}
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

      {/* ─── TAB 4: MOVEMENT AUDIT LEDGER ───────────────────────────────────── */}
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
                          {new Date(tx.timestamp || tx.createdAt).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
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

      {/* ─── MODAL: STOCK IN (PURCHASE BILL) ────────────────────────────────── */}
      <Modal open={showInwardModal} onClose={() => setShowInwardModal(false)} title={`Stock In Bill: ${item.name}`} size="lg">
        <form onSubmit={handleSaveInward} className="space-y-4">
          <div className="p-3.5 rounded-xl bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800/40 text-xs text-primary-900 dark:text-primary-200 flex items-center gap-2.5">
            <Sparkles className="h-4 w-4 text-primary-600 dark:text-primary-400 flex-shrink-0" />
            <span>
              This purchase bill automatically updates on-hand stock and verifies against the School Requirements Budget.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                Vendor / Seller *
              </label>
              <select
                required
                value={inwardForm.vendorId}
                onChange={(e) => setInwardForm((p) => ({ ...p, vendorId: e.target.value }))}
                className="w-full bg-gray-50 dark:bg-neutral-700 border border-gray-200 dark:border-neutral-600 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white"
              >
                <option value="">Select Vendor...</option>
                {vendorsList.map((v) => (
                  <option key={v._id || v.id} value={v._id || v.id}>
                    {v.name} ({v.category || 'General'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                Bill / Invoice Number *
              </label>
              <input
                required
                type="text"
                value={inwardForm.billNumber}
                onChange={(e) => setInwardForm((p) => ({ ...p, billNumber: e.target.value }))}
                className="w-full bg-gray-50 dark:bg-neutral-700 border border-gray-200 dark:border-neutral-600 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                Bill Date *
              </label>
              <input
                required
                type="date"
                value={inwardForm.billDate}
                onChange={(e) => setInwardForm((p) => ({ ...p, billDate: e.target.value }))}
                className="w-full bg-gray-50 dark:bg-neutral-700 border border-gray-200 dark:border-neutral-600 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                Payment Type *
              </label>
              <select
                value={inwardForm.paymentType}
                onChange={(e) => setInwardForm((p) => ({ ...p, paymentType: e.target.value }))}
                className="w-full bg-gray-50 dark:bg-neutral-700 border border-gray-200 dark:border-neutral-600 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white"
              >
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer (NEFT/RTGS/IMPS)</option>
                <option value="Cheque">Cheque</option>
                <option value="UPI">UPI</option>
                <option value="Credit">Credit (Post-Paid Due)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                Inward Quantity ({item.unit || 'Units'}) *
              </label>
              <input
                required
                type="number"
                min="1"
                value={inwardForm.quantity}
                onChange={(e) => setInwardForm((p) => ({ ...p, quantity: e.target.value }))}
                className="w-full bg-gray-50 dark:bg-neutral-700 border border-gray-200 dark:border-neutral-600 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                Unit Cost (₹) *
              </label>
              <input
                required
                type="number"
                min="0"
                step="any"
                value={inwardForm.unitCost}
                onChange={(e) => setInwardForm((p) => ({ ...p, unitCost: e.target.value }))}
                className="w-full bg-gray-50 dark:bg-neutral-700 border border-gray-200 dark:border-neutral-600 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white font-bold"
              />
            </div>
          </div>

          {/* Computed Summary */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-neutral-700/40 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Total Purchase Bill Cost:</span>
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
              ₹{(Number(inwardForm.quantity || 0) * Number(inwardForm.unitCost || 0)).toLocaleString('en-IN')}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                Amount Paid Immediately (₹)
              </label>
              <input
                type="number"
                min="0"
                placeholder="Leave blank for full immediate settlement"
                value={inwardForm.amountPaid}
                onChange={(e) => setInwardForm((p) => ({ ...p, amountPaid: e.target.value }))}
                className="w-full bg-gray-50 dark:bg-neutral-700 border border-gray-200 dark:border-neutral-600 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                UTR / Cheque / Tx Reference #
              </label>
              <input
                type="text"
                placeholder="e.g. UTR-9876543210"
                value={inwardForm.transactionReference}
                onChange={(e) => setInwardForm((p) => ({ ...p, transactionReference: e.target.value }))}
                className="w-full bg-gray-50 dark:bg-neutral-700 border border-gray-200 dark:border-neutral-600 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-neutral-700">
            <button
              type="button"
              onClick={() => setShowInwardModal(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-neutral-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 shadow"
            >
              {submitting ? 'Recording...' : 'Record Inward Bill'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ─── MODAL: ISSUE MATERIAL TO CLASS / STUDENT ───────────────────────── */}
      <Modal open={showIssuanceModal} onClose={() => setShowIssuanceModal(false)} title={`Issue Outward: ${item.name}`} size="lg">
        <form onSubmit={handleSaveIssuance} className="space-y-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Record distribution of <strong className="text-gray-800 dark:text-gray-200">{item.name}</strong> to a specific class, student, or faculty member. Stock is deducted automatically.
          </p>

          <div className="flex gap-2">
            {['Class', 'Student', 'Teacher'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setIssuanceForm((p) => ({ ...p, recipientType: type }))}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  issuanceForm.recipientType === type
                    ? 'bg-primary-600 text-white shadow'
                    : 'bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {type === 'Class' && <GraduationCap className="h-3.5 w-3.5 inline mr-1" />}
                {type === 'Student' && <Users className="h-3.5 w-3.5 inline mr-1" />}
                {type === 'Teacher' && <UserCheck className="h-3.5 w-3.5 inline mr-1" />}
                Issue to {type}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {issuanceForm.recipientType === 'Class' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                    Class Name *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Class 10"
                    value={issuanceForm.className}
                    onChange={(e) => setIssuanceForm((p) => ({ ...p, className: e.target.value }))}
                    className="w-full bg-gray-50 dark:bg-neutral-700 border border-gray-200 dark:border-neutral-600 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                    Section
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. A"
                    value={issuanceForm.section}
                    onChange={(e) => setIssuanceForm((p) => ({ ...p, section: e.target.value }))}
                    className="w-full bg-gray-50 dark:bg-neutral-700 border border-gray-200 dark:border-neutral-600 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white"
                  />
                </div>
              </>
            )}

            {issuanceForm.recipientType === 'Student' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                    Student Full Name *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Aarav Sharma"
                    value={issuanceForm.studentName}
                    onChange={(e) => setIssuanceForm((p) => ({ ...p, studentName: e.target.value }))}
                    className="w-full bg-gray-50 dark:bg-neutral-700 border border-gray-200 dark:border-neutral-600 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                    Roll / Admission #
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2026-STU-042"
                    value={issuanceForm.studentRollNumber}
                    onChange={(e) => setIssuanceForm((p) => ({ ...p, studentRollNumber: e.target.value }))}
                    className="w-full bg-gray-50 dark:bg-neutral-700 border border-gray-200 dark:border-neutral-600 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white font-mono"
                  />
                </div>
              </>
            )}

            {issuanceForm.recipientType === 'Teacher' && (
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                  Teacher / Staff Name *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Prof. Mohammad Zaid"
                  value={issuanceForm.teacherName}
                  onChange={(e) => setIssuanceForm((p) => ({ ...p, teacherName: e.target.value }))}
                  className="w-full bg-gray-50 dark:bg-neutral-700 border border-gray-200 dark:border-neutral-600 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white font-bold"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                Quantity to Issue ({item.unit || 'Units'}) *
              </label>
              <input
                required
                type="number"
                min="1"
                max={item.quantity || 1}
                value={issuanceForm.quantity}
                onChange={(e) => setIssuanceForm((p) => ({ ...p, quantity: e.target.value }))}
                className="w-full bg-gray-50 dark:bg-neutral-700 border border-gray-200 dark:border-neutral-600 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white font-bold"
              />
              <span className="text-[11px] text-gray-400 mt-0.5 block">
                Max available: {item.quantity || 0} {item.unit || 'units'}
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                Issuance Date *
              </label>
              <input
                required
                type="date"
                value={issuanceForm.issuanceDate}
                onChange={(e) => setIssuanceForm((p) => ({ ...p, issuanceDate: e.target.value }))}
                className="w-full bg-gray-50 dark:bg-neutral-700 border border-gray-200 dark:border-neutral-600 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
              Purpose / Academic Requirement
            </label>
            <input
              type="text"
              placeholder="e.g. Science Lab Experiment Practical / Annual Exam Session"
              value={issuanceForm.purpose}
              onChange={(e) => setIssuanceForm((p) => ({ ...p, purpose: e.target.value }))}
              className="w-full bg-gray-50 dark:bg-neutral-700 border border-gray-200 dark:border-neutral-600 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-neutral-700">
            <button
              type="button"
              onClick={() => setShowIssuanceModal(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-neutral-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow"
            >
              {submitting ? 'Issuing...' : 'Confirm Issuance'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ─── MODAL: BILL RECEIPT DETAILS ─────────────────────────────────────── */}
      <Modal open={!!selectedBillReceipt} onClose={() => setSelectedBillReceipt(null)} title="Purchase Order Receipt" size="md">
        {selectedBillReceipt && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-neutral-700/40 border border-gray-200 dark:border-neutral-700 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-mono font-bold text-sm text-gray-900 dark:text-white">
                  {selectedBillReceipt.billNumber}
                </span>
                <span className="font-semibold text-gray-500 dark:text-gray-400">
                  {new Date(selectedBillReceipt.billDate).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                Vendor: <strong>{selectedBillReceipt.vendorId?.name || selectedBillReceipt.vendorName || 'Vendor'}</strong>
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Payment Type: <strong>{selectedBillReceipt.paymentType || 'Bank Transfer'}</strong>
              </p>
            </div>

            <div className="border border-gray-200 dark:border-neutral-700 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-neutral-700/40 font-bold uppercase text-[10px] text-gray-400 border-b border-gray-200 dark:border-neutral-700">
                  <tr>
                    <th className="py-2.5 px-3">Item</th>
                    <th className="py-2.5 px-3 text-right">Qty</th>
                    <th className="py-2.5 px-3 text-right">Rate</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-neutral-700">
                  {(selectedBillReceipt.items || []).map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-3 font-semibold text-gray-800 dark:text-gray-200">{it.name}</td>
                      <td className="py-2 px-3 text-right">{it.quantity}</td>
                      <td className="py-2 px-3 text-right">₹{it.unitCost}</td>
                      <td className="py-2 px-3 text-right font-bold">₹{it.totalCost || it.quantity * it.unitCost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-neutral-600 text-gray-700 dark:text-gray-200 font-bold text-xs"
              >
                <Printer className="h-3.5 w-3.5" />
                Print Voucher
              </button>
              <button
                type="button"
                onClick={() => setSelectedBillReceipt(null)}
                className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-neutral-700 font-bold text-gray-700 dark:text-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
