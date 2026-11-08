// ui/src/pages/inventory/InventoryList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Warehouse,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Receipt,
  Truck,
  ArrowDownRight,
  ArrowUpRight,
  Eye,
  Edit2,
  Trash2,
  Printer,
  CheckCircle2,
  PackageCheck,
  Building,
  Clock,
  Layers,
  ExternalLink,
  FileText,
  RefreshCw,
  ShoppingBag,
  Send,
  Boxes,
} from 'lucide-react';

import {
  getInventoryItems,
  getInventorySummary,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  adjustStock,
  createPurchaseBill,
  getPurchases,
  createMaterialIssuance,
  getIssuances,
  getInventoryTransactions,
} from '../../services/inventoryService.js';
import { getVendors } from '../../services/vendorService.js';
import PageHeader from '../../components/ui/PageHeader.jsx';
import StatsCard from '../../components/ui/StatsCard.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Loader from '../../components/ui/Loader.jsx';
import { ROUTES } from '../../routes/routes.js';

const CATEGORIES = [
  'All',
  'Stationery',
  'Lab Equipment',
  'Computers & IT',
  'Sports Items',
  'Uniforms & Badges',
  'Medical & First Aid',
  'Furniture',
];

const blankProduct = {
  name: '',
  sku: '',
  description: '',
  category: 'Stationery',
  subcategory: '',
  quantity: 0,
  unit: 'pcs',
  minStockLevel: 5,
  maxStockLevel: 500,
  reorderQuantity: 20,
  unitCost: 0,
  price: 0,
  location: 'Main Store',
  vendorId: '',
};

export default function InventoryList() {
  const navigate = useNavigate();

  // Navigation tab
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog', 'purchases', 'issuances', 'ledger'

  // Data states
  const [inventory, setInventory] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [issuances, setIssuances] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [vendorsList, setVendorsList] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All'); // 'All', 'low-stock', 'out-of-stock', 'in-stock'

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [productForm, setProductForm] = useState(blankProduct);

  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustTarget, setAdjustTarget] = useState(null);
  const [adjustForm, setAdjustForm] = useState({ type: 'in', quantity: '', reason: '' });

  // Inward Purchase Bill Modal
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseVendorId, setPurchaseVendorId] = useState('');
  const [purchaseBillMeta, setPurchaseBillMeta] = useState({
    billNumber: '',
    billDate: new Date().toISOString().split('T')[0],
    paymentType: 'Bank Transfer',
    amountPaid: '',
    transactionReference: '',
    notes: '',
  });
  const [purchaseLines, setPurchaseLines] = useState([
    { itemId: '', name: '', sku: '', category: '', quantity: 1, unitCost: 0, totalCost: 0 },
  ]);

  // Outward Class Issuance Modal
  const [showIssuanceModal, setShowIssuanceModal] = useState(false);
  const [issuanceMeta, setIssuanceMeta] = useState({
    recipientType: 'class',
    className: 'Class 10 - Section A',
    studentName: '',
    studentRollNo: '',
    teacherName: '',
    department: '',
    issuanceDate: new Date().toISOString().split('T')[0],
    billingType: 'complimentary',
    purpose: '',
    acknowledgedBy: '',
  });
  const [issuanceLines, setIssuanceLines] = useState([
    { itemId: '', name: '', sku: '', quantity: 1, unitPrice: 0, totalAmount: 0 },
  ]);

  // Connected Vendor Quick View Modal
  const [selectedVendorQuickView, setSelectedVendorQuickView] = useState(null);

  // Printable Voucher Modal
  const [printDoc, setPrintDoc] = useState(null);

  const [submitting, setSubmitting] = useState(false);

  // ─── DATA FETCHING ────────────────────────────────────────────────────────
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [invRes, sumRes, vendRes] = await Promise.all([
        getInventoryItems({ search, category: selectedCategory, status: selectedStatus }),
        getInventorySummary(),
        getVendors(),
      ]);

      setInventory(invRes?.inventory || invRes?.data?.inventory || []);
      if (sumRes?.data) setSummary(sumRes.data);
      setVendorsList(vendRes?.vendors || vendRes?.data?.vendors || []);

      if (activeTab === 'purchases') {
        const pRes = await getPurchases({ search });
        setPurchases(pRes?.purchases || pRes?.data?.purchases || []);
      } else if (activeTab === 'issuances') {
        const iRes = await getIssuances({ search });
        setIssuances(iRes?.issuances || iRes?.data?.issuances || []);
      } else if (activeTab === 'ledger') {
        const tRes = await getInventoryTransactions({ search });
        setTransactions(tRes?.transactions || tRes?.data?.transactions || []);
      }
    } catch (err) {
      console.error('Failed to load inventory data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [search, selectedCategory, selectedStatus, activeTab]);

  // ─── ADD / EDIT PRODUCT ───────────────────────────────────────────────────
  const handleOpenAddProduct = (item = null) => {
    if (item) {
      setEditingItem(item);
      setProductForm({
        ...blankProduct,
        ...item,
        vendorId: item.vendorId?._id || item.vendorId?.id || item.vendorId || '',
      });
    } else {
      setEditingItem(null);
      setProductForm({
        ...blankProduct,
        sku: `SKU-${Date.now().toString(36).toUpperCase()}`,
      });
    }
    setShowAddModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingItem) {
        await updateInventoryItem(editingItem.id || editingItem._id, productForm);
      } else {
        await createInventoryItem(productForm);
      }
      setShowAddModal(false);
      fetchAllData();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" from inventory?`)) return;
    try {
      await deleteInventoryItem(id);
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // ─── QUICK STOCK ADJUSTMENT ───────────────────────────────────────────────
  const handleOpenAdjust = (item) => {
    setAdjustTarget(item);
    setAdjustForm({ type: 'in', quantity: '', reason: 'Physical stock count calibration' });
    setShowAdjustModal(true);
  };

  const handleSaveAdjust = async (e) => {
    e.preventDefault();
    if (!adjustTarget) return;
    const qty = Number(adjustForm.quantity);
    if (isNaN(qty) || qty <= 0) return toast.warn('Quantity must be greater than zero.');

    setSubmitting(true);
    try {
      await adjustStock({
        id: adjustTarget.id || adjustTarget._id,
        type: adjustForm.type,
        quantity: qty,
        reason: adjustForm.reason,
      });
      setShowAdjustModal(false);
      fetchAllData();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // ─── INWARD PURCHASE BILL (SELLER FLOW) ────────────────────────────────────
  const handleOpenPurchase = (presetVendorId = null) => {
    setPurchaseVendorId(presetVendorId || (vendorsList[0]?.id || vendorsList[0]?._id || ''));
    setPurchaseBillMeta({
      billNumber: `BILL-${Date.now().toString(36).toUpperCase()}`,
      billDate: new Date().toISOString().split('T')[0],
      paymentType: 'Bank Transfer',
      amountPaid: '',
      transactionReference: '',
      notes: '',
    });
    setPurchaseLines([
      { itemId: '', name: '', sku: '', category: '', quantity: 1, unitCost: 0, totalCost: 0 },
    ]);
    setShowPurchaseModal(true);
  };

  const handlePurchaseLineChange = (idx, field, value) => {
    const updated = [...purchaseLines];
    if (field === 'itemId') {
      const prod = inventory.find((p) => (p.id || p._id) === value);
      if (prod) {
        updated[idx] = {
          ...updated[idx],
          itemId: prod.id || prod._id,
          name: prod.name,
          sku: prod.sku,
          category: prod.category,
          unitCost: prod.unitCost || prod.price || 0,
          totalCost: (updated[idx].quantity || 1) * (prod.unitCost || prod.price || 0),
        };
      }
    } else if (field === 'quantity') {
      const q = Math.max(1, Number(value) || 1);
      updated[idx].quantity = q;
      updated[idx].totalCost = q * (updated[idx].unitCost || 0);
    } else if (field === 'unitCost') {
      const c = Math.max(0, Number(value) || 0);
      updated[idx].unitCost = c;
      updated[idx].totalCost = (updated[idx].quantity || 1) * c;
    }
    setPurchaseLines(updated);
  };

  const totalPurchaseBill = purchaseLines.reduce((s, it) => s + (Number(it.totalCost) || 0), 0);

  const handleSavePurchase = async (e) => {
    e.preventDefault();
    if (!purchaseVendorId) return toast.warn('Please select a supplier vendor.');

    const validLines = purchaseLines.filter((l) => l.itemId && l.quantity > 0);
    if (validLines.length === 0) return toast.warn('Please add at least one valid inventory item.');

    setSubmitting(true);
    try {
      const payload = {
        vendorId: purchaseVendorId,
        billNumber: purchaseBillMeta.billNumber,
        billDate: purchaseBillMeta.billDate,
        items: validLines,
        subtotal: totalPurchaseBill,
        grandTotal: totalPurchaseBill,
        paymentType: purchaseBillMeta.paymentType,
        amountPaid: purchaseBillMeta.amountPaid !== '' ? Number(purchaseBillMeta.amountPaid) : totalPurchaseBill,
        transactionReference: purchaseBillMeta.transactionReference,
        notes: purchaseBillMeta.notes,
      };

      const res = await createPurchaseBill(payload);
      if (res?.overrun) return;

      setShowPurchaseModal(false);
      fetchAllData();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // ─── OUTWARD CLASS ISSUANCE (BUYER FLOW) ──────────────────────────────────
  const handleOpenIssuance = () => {
    setIssuanceMeta({
      recipientType: 'class',
      className: 'Class 10 - Section A',
      studentName: '',
      studentRollNo: '',
      teacherName: '',
      department: '',
      issuanceDate: new Date().toISOString().split('T')[0],
      billingType: 'complimentary',
      purpose: 'Classroom academic materials distribution',
      acknowledgedBy: '',
    });
    setIssuanceLines([
      { itemId: '', name: '', sku: '', quantity: 1, unitPrice: 0, totalAmount: 0 },
    ]);
    setShowIssuanceModal(true);
  };

  const handleIssuanceLineChange = (idx, field, value) => {
    const updated = [...issuanceLines];
    if (field === 'itemId') {
      const prod = inventory.find((p) => (p.id || p._id) === value);
      if (prod) {
        updated[idx] = {
          ...updated[idx],
          itemId: prod.id || prod._id,
          name: prod.name,
          sku: prod.sku,
          unitPrice: prod.price || prod.unitCost || 0,
          totalAmount: (updated[idx].quantity || 1) * (prod.price || prod.unitCost || 0),
          availableStock: prod.quantity,
          unit: prod.unit,
        };
      }
    } else if (field === 'quantity') {
      const q = Math.max(1, Number(value) || 1);
      updated[idx].quantity = q;
      updated[idx].totalAmount = q * (updated[idx].unitPrice || 0);
    }
    setIssuanceLines(updated);
  };

  const totalIssuanceAmount = issuanceLines.reduce((s, it) => s + (Number(it.totalAmount) || 0), 0);

  const handleSaveIssuance = async (e) => {
    e.preventDefault();
    const validLines = issuanceLines.filter((l) => l.itemId && l.quantity > 0);
    if (validLines.length === 0) return toast.warn('Please select at least one item to issue.');

    setSubmitting(true);
    try {
      await createMaterialIssuance({
        ...issuanceMeta,
        items: validLines,
        totalAmount: totalIssuanceAmount,
      });
      setShowIssuanceModal(false);
      fetchAllData();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────
  const budget = summary?.budgetHealth;

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <Warehouse className="h-7 w-7 text-primary-600" />
            Dynamic School Inventory Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real-time stock valuation, vendor inward procurement, class-wise distribution, and Session Budget synchronization.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => navigate(ROUTES.VENDORS.LIST)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-300 transition-all shadow-sm"
          >
            <Truck className="h-4 w-4" />
            Vendors Hub ({vendorsList.length})
          </button>

          <button
            onClick={handleOpenIssuance}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition-all"
          >
            <Send className="h-4 w-4" />
            Class Requisition (Out)
          </button>

          <button
            onClick={() => handleOpenPurchase()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
          >
            <ShoppingBag className="h-4 w-4" />
            Record Vendor Bill (In)
          </button>

          <button
            onClick={() => handleOpenAddProduct()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-500/20 transition-all"
          >
            <Plus className="h-4 w-4" />
            New Product
          </button>
        </div>
      </div>

      {/* ─── LIVE BUDGET HEALTH & OVERRUN SAFEGUARD GAUGE ─────────────────────── */}
      {budget && (
        <div className="bg-gradient-to-r from-blue-500/10 via-primary-500/10 to-indigo-500/10 p-5 rounded-2xl border border-primary-200 dark:border-primary-900/50 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="text-xs font-black uppercase text-primary-600 dark:text-primary-400 tracking-wider">
                Active Session Budget Linkage • {budget.sessionName}
              </span>
              <h3 className="text-lg font-black text-gray-900 dark:text-white mt-0.5">
                School Requirements & Inventory Budget
              </h3>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div>
                <span className="text-gray-400 text-[11px] block">Allocated Budget</span>
                <span className="text-base font-black text-gray-900 dark:text-white">
                  ₹{(budget.schoolRequirementsBudget || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-gray-400 text-[11px] block">Disbursed / Spent</span>
                <span className="text-base font-black text-primary-600 dark:text-primary-400">
                  ₹{(budget.schoolRequirementsSpent || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-gray-400 text-[11px] block">Available Balance</span>
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                  ₹{(budget.remainingBudget || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Progress Gauge */}
          <div className="mt-4">
            <div className="flex justify-between text-[11px] font-bold mb-1 text-gray-600 dark:text-gray-400">
              <span>Budget Consumption</span>
              <span>{budget.percentUsed}% Utilized</span>
            </div>
            <div className="w-full h-3 bg-gray-200 dark:bg-neutral-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  budget.percentUsed > 90
                    ? 'bg-rose-500'
                    : budget.percentUsed > 75
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, budget.percentUsed)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Inventory Value"
          value={`₹${(summary?.totalStockValue || 0).toLocaleString('en-IN')}`}
          icon={Receipt}
          description="Total asset valuation in stock"
        />
        <StatsCard
          title="Total SKUs Cataloged"
          value={summary?.totalItems || inventory.length}
          icon={Boxes}
          description="Active school product lines"
        />
        <StatsCard
          title="Low Stock Alerts"
          value={summary?.lowStockCount || 0}
          icon={AlertTriangle}
          description="Items below reorder threshold"
        />
        <StatsCard
          title="Out of Stock"
          value={summary?.outOfStockCount || 0}
          icon={ArrowDownRight}
          description="Immediate replenishment needed"
        />
      </div>

      {/* ─── TAB NAVIGATION ─────────────────────────────────────────────────── */}
      <div className="flex border-b border-gray-200 dark:border-neutral-700 space-x-6 text-sm font-bold">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'catalog'
              ? 'border-primary-600 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <Boxes className="h-4 w-4" />
          Product Catalog & Stocks ({inventory.length})
        </button>

        <button
          onClick={() => setActiveTab('purchases')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'purchases'
              ? 'border-primary-600 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <ShoppingBag className="h-4 w-4" />
          Inward Vendor Bills (Stock In)
        </button>

        <button
          onClick={() => setActiveTab('issuances')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'issuances'
              ? 'border-primary-600 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <Send className="h-4 w-4" />
          Class & Student Issuances (Stock Out)
        </button>

        <button
          onClick={() => setActiveTab('ledger')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'ledger'
              ? 'border-primary-600 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <Clock className="h-4 w-4" />
          Audit Movement Ledger
        </button>
      </div>

      {/* ─── TAB 1: PRODUCT CATALOG ─────────────────────────────────────────── */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          {/* Category Pill Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-neutral-700 hover:bg-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search & Stock Status Filters */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-white dark:bg-neutral-800 p-4 rounded-2xl border border-gray-200 dark:border-neutral-700">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search product, SKU, room..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-sm bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 rounded-xl text-sm bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="All">All Stock Levels</option>
                <option value="low-stock">⚠️ Low Stock Alerts</option>
                <option value="out-of-stock">🚫 Out of Stock</option>
                <option value="in-stock">✅ Well Stocked</option>
              </select>
            </div>
          </div>

          {/* Products Table */}
          {loading ? (
            <div className="py-16 flex justify-center">
              <Loader />
            </div>
          ) : inventory.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-neutral-800 rounded-2xl border border-gray-200 dark:border-neutral-700 text-gray-400 text-sm">
              No products found matching your filter criteria.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-sm">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 dark:bg-neutral-900 text-gray-600 dark:text-gray-300 font-bold uppercase text-[10px] border-b border-gray-200 dark:border-neutral-700">
                  <tr>
                    <th className="p-3.5">SKU & Product Name</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Stock in Hand</th>
                    <th className="p-3.5">Unit Cost / Price</th>
                    <th className="p-3.5">Storage Location</th>
                    <th className="p-3.5">Assigned Vendor</th>
                    <th className="p-3.5 text-right">Stock Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-neutral-700">
                  {inventory.map((item) => {
                    const isLow = item.quantity <= item.minStockLevel && item.quantity > 0;
                    const isOut = item.quantity <= 0;
                    const vend = item.vendorId || item.vendor;

                    return (
                      <tr key={item.id || item._id} className="hover:bg-gray-50 dark:hover:bg-neutral-700/40">
                        <td className="p-3.5">
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-gray-100 dark:bg-neutral-700 text-gray-600 dark:text-gray-300">
                            {item.sku}
                          </span>
                          <Link
                            to={`/inventory/${item.id || item._id}`}
                            className="font-extrabold text-sm text-gray-900 dark:text-white mt-1 hover:text-primary-600 dark:hover:text-primary-400 block"
                          >
                            {item.name}
                          </Link>
                          {item.subcategory && (
                            <span className="text-[11px] text-gray-400 block">{item.subcategory}</span>
                          )}
                        </td>

                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-300">
                            {item.category}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm font-black ${
                                isOut
                                  ? 'text-rose-600'
                                  : isLow
                                  ? 'text-amber-600'
                                  : 'text-gray-900 dark:text-white'
                              }`}
                            >
                              {item.quantity} {item.unit}
                            </span>
                            {isOut ? (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                                Out
                              </span>
                            ) : isLow ? (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700">
                                Low
                              </span>
                            ) : null}
                          </div>
                          <span className="text-[10px] text-gray-400 block">
                            Min Alert: {item.minStockLevel} {item.unit}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <span className="font-extrabold text-gray-900 dark:text-white">
                            ₹{(item.unitCost || item.price || 0).toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] text-gray-400 block">per {item.unit}</span>
                        </td>

                        <td className="p-3.5 text-gray-600 dark:text-gray-300">
                          {item.location || 'Main Store'}
                        </td>

                        <td className="p-3.5">
                          {vend ? (
                            <button
                              onClick={() => setSelectedVendorQuickView(vend)}
                              className="text-left group"
                              title="Click to view Vendor details"
                            >
                              <span className="text-primary-600 dark:text-primary-400 font-bold group-hover:underline flex items-center gap-1">
                                {vend.name || 'Vendor'}
                                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </span>
                              <span className="text-[10px] text-gray-400 block font-mono">
                                {vend.vendorCode || ''}
                              </span>
                            </button>
                          ) : (
                            <span className="text-gray-400 italic">Unassigned</span>
                          )}
                        </td>

                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              to={`/inventory/${item.id || item._id}`}
                              className="p-1 text-gray-400 hover:text-primary-600 rounded"
                              title="View Product Record & History"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Link>
                            <button
                              onClick={() => handleOpenAdjust(item)}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-gray-100 dark:bg-neutral-700 hover:bg-primary-50 dark:hover:bg-primary-950/40 hover:text-primary-600 text-gray-700 dark:text-gray-200 transition-all"
                              title="Quick Stock Adjustment"
                            >
                              Adjust ±
                            </button>
                            <button
                              onClick={() => handleOpenAddProduct(item)}
                              className="p-1 text-gray-400 hover:text-primary-600 rounded"
                              title="Edit Product"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(item.id || item._id, item.name)}
                              className="p-1 text-gray-400 hover:text-rose-600 rounded"
                              title="Delete Product"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
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

      {/* ─── TAB 2: INWARD PURCHASES & VENDOR BILLS ──────────────────────────── */}
      {activeTab === 'purchases' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white dark:bg-neutral-800 p-4 rounded-2xl border border-gray-200 dark:border-neutral-700">
            <div>
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                Inward Purchases & Vendor Bills Ledger
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Every inward procurement automatically updates stock and is validated against the active session budget.
              </p>
            </div>
            <button
              onClick={() => handleOpenPurchase()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              Record Inward Bill
            </button>
          </div>

          {loading ? (
            <div className="py-16 flex justify-center">
              <Loader />
            </div>
          ) : purchases.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-neutral-800 rounded-2xl border border-gray-200 dark:border-neutral-700 text-gray-400 text-sm">
              No purchase bills recorded yet. Click "Record Inward Bill" to create one.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-sm">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 dark:bg-neutral-900 text-gray-600 dark:text-gray-300 font-bold uppercase text-[10px] border-b border-gray-200 dark:border-neutral-700">
                  <tr>
                    <th className="p-3.5">Bill Number</th>
                    <th className="p-3.5">Supplier / Vendor</th>
                    <th className="p-3.5">Bill Date</th>
                    <th className="p-3.5">Items Purchased</th>
                    <th className="p-3.5">Grand Total</th>
                    <th className="p-3.5">Payment Mode</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-neutral-700">
                  {purchases.map((bill) => {
                    const vend = bill.vendorId || {};
                    return (
                      <tr key={bill.id || bill._id} className="hover:bg-gray-50 dark:hover:bg-neutral-700/40">
                        <td className="p-3.5 font-mono font-bold text-gray-900 dark:text-white">
                          {bill.billNumber}
                        </td>
                        <td className="p-3.5">
                          <button
                            onClick={() => setSelectedVendorQuickView(vend)}
                            className="font-bold text-primary-600 dark:text-primary-400 hover:underline text-left block"
                          >
                            {vend.name || 'Vendor'}
                          </button>
                          <span className="text-[10px] text-gray-400 font-mono">{vend.vendorCode}</span>
                        </td>
                        <td className="p-3.5 text-gray-500">
                          {new Date(bill.billDate).toLocaleDateString('en-IN')}
                        </td>
                        <td className="p-3.5 text-gray-700 dark:text-gray-300">
                          {bill.items?.length || 0} product lines
                        </td>
                        <td className="p-3.5 font-black text-gray-900 dark:text-white">
                          ₹{(bill.grandTotal || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="p-3.5 text-gray-600 dark:text-gray-300">
                          {bill.paymentType || 'Bank Transfer'}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              bill.paymentStatus === 'Paid'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                : bill.paymentStatus === 'Partial'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            }`}
                          >
                            {bill.paymentStatus}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => setPrintDoc({ type: 'purchase', data: bill })}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-700"
                            title="Print Vendor Purchase Invoice"
                          >
                            <Printer className="h-4 w-4" />
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

      {/* ─── TAB 3: CLASS & STUDENT ISSUANCES ───────────────────────────────── */}
      {activeTab === 'issuances' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white dark:bg-neutral-800 p-4 rounded-2xl border border-gray-200 dark:border-neutral-700">
            <div>
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                Class, Student & Department Material Requisitions
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Outward stock distribution ledger with live stock deduction and delivery voucher generation.
              </p>
            </div>
            <button
              onClick={handleOpenIssuance}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition-all"
            >
              <Send className="h-3.5 w-3.5" />
              New Material Requisition
            </button>
          </div>

          {loading ? (
            <div className="py-16 flex justify-center">
              <Loader />
            </div>
          ) : issuances.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-neutral-800 rounded-2xl border border-gray-200 dark:border-neutral-700 text-gray-400 text-sm">
              No outward material requisitions recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-sm">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 dark:bg-neutral-900 text-gray-600 dark:text-gray-300 font-bold uppercase text-[10px] border-b border-gray-200 dark:border-neutral-700">
                  <tr>
                    <th className="p-3.5">Voucher #</th>
                    <th className="p-3.5">Recipient Party</th>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5">Purpose</th>
                    <th className="p-3.5">Items Count</th>
                    <th className="p-3.5">Billing Type</th>
                    <th className="p-3.5">Value</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-neutral-700">
                  {issuances.map((iss) => (
                    <tr key={iss.id || iss._id} className="hover:bg-gray-50 dark:hover:bg-neutral-700/40">
                      <td className="p-3.5 font-mono font-bold text-gray-900 dark:text-white">
                        {iss.issuanceNumber}
                      </td>
                      <td className="p-3.5 font-bold text-gray-900 dark:text-white">
                        {iss.className || iss.studentName || iss.teacherName || iss.department || 'Class Requisition'}
                        <span className="text-[10px] text-gray-400 block uppercase font-mono">
                          {iss.recipientType}
                        </span>
                      </td>
                      <td className="p-3.5 text-gray-500">
                        {new Date(iss.issuanceDate).toLocaleDateString('en-IN')}
                      </td>
                      <td className="p-3.5 text-gray-700 dark:text-gray-300 line-clamp-1 max-w-xs">
                        {iss.purpose || 'Material Distribution'}
                      </td>
                      <td className="p-3.5 text-gray-700 dark:text-gray-300">
                        {iss.items?.length || 0} items
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            iss.billingType === 'complimentary'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}
                        >
                          {iss.billingType}
                        </span>
                      </td>
                      <td className="p-3.5 font-black text-gray-900 dark:text-white">
                        ₹{(iss.totalAmount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => setPrintDoc({ type: 'issuance', data: iss })}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-700"
                          title="Print Delivery Voucher"
                        >
                          <Printer className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 4: AUDIT LEDGER ─────────────────────────────────────────────── */}
      {activeTab === 'ledger' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-neutral-800 p-4 rounded-2xl border border-gray-200 dark:border-neutral-700">
            <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
              Immutable Stock Movement & Transaction Timeline
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Cryptographically ordered audit history for every inward receipt, class issuance, and stock adjustment.
            </p>
          </div>

          {loading ? (
            <div className="py-16 flex justify-center">
              <Loader />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-neutral-800 rounded-2xl border border-gray-200 dark:border-neutral-700 text-gray-400 text-sm">
              No transactions logged yet.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-sm">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 dark:bg-neutral-900 text-gray-600 dark:text-gray-300 font-bold uppercase text-[10px] border-b border-gray-200 dark:border-neutral-700">
                  <tr>
                    <th className="p-3.5">Timestamp</th>
                    <th className="p-3.5">Movement Type</th>
                    <th className="p-3.5">Item & SKU</th>
                    <th className="p-3.5">Delta Qty</th>
                    <th className="p-3.5">Party / Reference</th>
                    <th className="p-3.5">Balance After</th>
                    <th className="p-3.5">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-neutral-700">
                  {transactions.map((tx) => {
                    const isPositive = tx.quantity > 0;
                    return (
                      <tr key={tx.id || tx._id} className="hover:bg-gray-50 dark:hover:bg-neutral-700/40">
                        <td className="p-3.5 text-gray-500 font-mono text-[11px]">
                          {new Date(tx.timestamp).toLocaleString('en-IN')}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              tx.type.includes('IN') || tx.type.includes('ADD')
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className="font-extrabold text-gray-900 dark:text-white">{tx.itemName}</span>
                          <span className="text-[10px] text-gray-400 block font-mono">{tx.sku}</span>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`font-black text-sm ${
                              isPositive ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            {isPositive ? `+${tx.quantity}` : tx.quantity} {tx.unit}
                          </span>
                        </td>
                        <td className="p-3.5 text-gray-700 dark:text-gray-300">
                          <span className="font-semibold block">{tx.partyName || 'School Main'}</span>
                          <span className="text-[10px] text-gray-400 font-mono">{tx.referenceDocNumber}</span>
                        </td>
                        <td className="p-3.5 font-bold text-gray-900 dark:text-white">
                          {tx.balanceAfter} {tx.unit}
                        </td>
                        <td className="p-3.5 text-gray-500 max-w-xs truncate">
                          {tx.reason || 'Movement'}
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

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* MODAL 1: ADD / EDIT PRODUCT */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={editingItem ? 'Edit Inventory Product' : 'Add New Inventory Product'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                placeholder="e.g. A4 Paper Rim 75 GSM"
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                SKU / Barcode *
              </label>
              <input
                type="text"
                required
                value={productForm.sku}
                onChange={(e) => setProductForm({ ...productForm, sku: e.target.value.toUpperCase() })}
                placeholder="STA-A4-001"
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Category *
              </label>
              <select
                value={productForm.category}
                onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
              >
                {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Subcategory
              </label>
              <input
                type="text"
                value={productForm.subcategory}
                onChange={(e) => setProductForm({ ...productForm, subcategory: e.target.value })}
                placeholder="e.g. Biology Lab, Paper, Writing"
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Unit of Measurement
              </label>
              <select
                value={productForm.unit}
                onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
              >
                <option value="pcs">Pieces (pcs)</option>
                <option value="rim">Rims (rim)</option>
                <option value="box">Boxes (box)</option>
                <option value="set">Sets (set)</option>
                <option value="pack">Packs (pack)</option>
                <option value="roll">Rolls (roll)</option>
                <option value="pair">Pairs (pair)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Current Stock Quantity
              </label>
              <input
                type="number"
                min="0"
                value={productForm.quantity}
                onChange={(e) => setProductForm({ ...productForm, quantity: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Unit Cost (₹ Purchase) *
              </label>
              <input
                type="number"
                min="0"
                required
                value={productForm.unitCost}
                onChange={(e) => setProductForm({ ...productForm, unitCost: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Billing Price (₹ Chargeable)
              </label>
              <input
                type="number"
                min="0"
                value={productForm.price}
                onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Low Stock Alert Threshold
              </label>
              <input
                type="number"
                min="1"
                value={productForm.minStockLevel}
                onChange={(e) => setProductForm({ ...productForm, minStockLevel: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Shelf / Storage Location
              </label>
              <input
                type="text"
                value={productForm.location}
                onChange={(e) => setProductForm({ ...productForm, location: e.target.value })}
                placeholder="e.g. Main Store Rack A-1, Chemistry Lab"
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Primary Supplier Vendor
            </label>
            <select
              value={productForm.vendorId}
              onChange={(e) => setProductForm({ ...productForm, vendorId: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
            >
              <option value="">Select Vendor...</option>
              {vendorsList.map((v) => (
                <option key={v.id || v._id} value={v.id || v._id}>
                  {v.name} ({v.vendorCode})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-200 dark:border-neutral-700">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl text-sm font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-md transition-all"
            >
              {submitting ? 'Saving...' : editingItem ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* MODAL 2: QUICK STOCK ADJUSTMENT */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={showAdjustModal}
        onClose={() => setShowAdjustModal(false)}
        title={adjustTarget ? `Adjust Stock: ${adjustTarget.name}` : 'Stock Adjustment'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveAdjust} className="space-y-4">
          <div className="bg-gray-50 dark:bg-neutral-900 p-3.5 rounded-xl border border-gray-200 dark:border-neutral-700 text-xs flex justify-between items-center">
            <div>
              <span className="text-gray-400 block text-[11px]">Current Stock in Hand</span>
              <span className="text-lg font-black text-gray-900 dark:text-white">
                {adjustTarget?.quantity} {adjustTarget?.unit}
              </span>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-gray-200 dark:bg-neutral-800 text-gray-700 dark:text-gray-300">
              {adjustTarget?.sku}
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Adjustment Type *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAdjustForm({ ...adjustForm, type: 'in' })}
                className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                  adjustForm.type === 'in'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                    : 'border-gray-300 dark:border-neutral-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                <ArrowUpRight className="h-4 w-4" />
                Add Stock (+ In)
              </button>
              <button
                type="button"
                onClick={() => setAdjustForm({ ...adjustForm, type: 'out' })}
                className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                  adjustForm.type === 'out'
                    ? 'bg-rose-50 border-rose-500 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                    : 'border-gray-300 dark:border-neutral-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                <ArrowDownRight className="h-4 w-4" />
                Reduce Stock (- Out)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Quantity to {adjustForm.type === 'in' ? 'Add' : 'Deduct'} ({adjustTarget?.unit}) *
            </label>
            <input
              type="number"
              min="1"
              required
              value={adjustForm.quantity}
              onChange={(e) => setAdjustForm({ ...adjustForm, quantity: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Adjustment Audit Justification *
            </label>
            <input
              type="text"
              required
              value={adjustForm.reason}
              onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
              placeholder="e.g. Broken during lab session, Recount correction"
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-200 dark:border-neutral-700">
            <button
              type="button"
              onClick={() => setShowAdjustModal(false)}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl text-sm font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-md transition-all"
            >
              {submitting ? 'Applying...' : 'Apply Adjustment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* MODAL 3: INWARD PURCHASE BILL (SELLER FLOW) */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        title="Record Inward Vendor Purchase Bill"
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSavePurchase} className="space-y-4">
          {/* Live Budget Overrun Warning Banner */}
          {budget && (
            <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs flex items-center justify-between">
              <div>
                <span className="font-extrabold text-blue-900 dark:text-blue-200">
                  Active Session Requirements Budget:
                </span>{' '}
                <span className="font-bold text-blue-700 dark:text-blue-300">
                  ₹{budget.remainingBudget.toLocaleString('en-IN')} remaining
                </span>{' '}
                (Cap: ₹{budget.schoolRequirementsBudget.toLocaleString('en-IN')})
              </div>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-bold text-[10px]">
                {budget.percentUsed}% Utilized
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Select Supplier Vendor *
              </label>
              <select
                required
                value={purchaseVendorId}
                onChange={(e) => setPurchaseVendorId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
              >
                <option value="">Select Vendor...</option>
                {vendorsList.map((v) => (
                  <option key={v.id || v._id} value={v.id || v._id}>
                    {v.name} ({v.vendorCode})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Vendor Bill / Invoice # *
              </label>
              <input
                type="text"
                required
                value={purchaseBillMeta.billNumber}
                onChange={(e) => setPurchaseBillMeta({ ...purchaseBillMeta, billNumber: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Bill Date *
              </label>
              <input
                type="date"
                required
                value={purchaseBillMeta.billDate}
                onChange={(e) => setPurchaseBillMeta({ ...purchaseBillMeta, billDate: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Dynamic Line Items */}
          <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-neutral-700">
            <div className="flex justify-between items-center">
              <label className="text-xs font-black uppercase text-gray-700 dark:text-gray-300">
                Purchased Inventory Products (Stock In)
              </label>
              <button
                type="button"
                onClick={() =>
                  setPurchaseLines([
                    ...purchaseLines,
                    { itemId: '', name: '', sku: '', category: '', quantity: 1, unitCost: 0, totalCost: 0 },
                  ])
                }
                className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Line Item
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto p-1">
              {purchaseLines.map((line, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-gray-50 dark:bg-neutral-900 p-2.5 rounded-xl border border-gray-200 dark:border-neutral-700"
                >
                  <div className="flex-1">
                    <select
                      required
                      value={line.itemId}
                      onChange={(e) => handlePurchaseLineChange(idx, 'itemId', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
                    >
                      <option value="">Select Inventory Product...</option>
                      {inventory.map((p) => (
                        <option key={p.id || p._id} value={p.id || p._id}>
                          {p.name} ({p.sku}) — Stock: {p.quantity} {p.unit}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-20">
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="Qty"
                      value={line.quantity}
                      onChange={(e) => handlePurchaseLineChange(idx, 'quantity', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white font-bold text-center"
                    />
                  </div>

                  <div className="w-24">
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="Unit Cost"
                      value={line.unitCost}
                      onChange={(e) => handlePurchaseLineChange(idx, 'unitCost', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white font-mono text-right"
                    />
                  </div>

                  <div className="w-28 text-right font-extrabold text-xs text-gray-900 dark:text-white">
                    ₹{(line.totalCost || 0).toLocaleString('en-IN')}
                  </div>

                  {purchaseLines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setPurchaseLines(purchaseLines.filter((_, i) => i !== idx))}
                      className="p-1 text-gray-400 hover:text-rose-600 rounded"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Payment Method
              </label>
              <select
                value={purchaseBillMeta.paymentType}
                onChange={(e) => setPurchaseBillMeta({ ...purchaseBillMeta, paymentType: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
              >
                <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                <option value="Cheque">Cheque</option>
                <option value="UPI">UPI</option>
                <option value="Cash">Cash</option>
                <option value="Credit / On Account">Deferred Credit / On Account</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Amount Paid Now (₹)
              </label>
              <input
                type="number"
                min="0"
                placeholder={`Default: Full ₹${totalPurchaseBill}`}
                value={purchaseBillMeta.amountPaid}
                onChange={(e) => setPurchaseBillMeta({ ...purchaseBillMeta, amountPaid: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Grand Total Bar */}
          <div className="flex justify-between items-center p-3.5 rounded-xl bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700">
            <span className="text-sm font-extrabold text-gray-800 dark:text-gray-200">
              Grand Total Purchase Bill:
            </span>
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
              ₹{totalPurchaseBill.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowPurchaseModal(false)}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || totalPurchaseBill <= 0}
              className="px-5 py-2 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all"
            >
              {submitting ? 'Recording...' : 'Authorize Purchase & Stock In'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* MODAL 4: OUTWARD CLASS ISSUANCE (BUYER FLOW) */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={showIssuanceModal}
        onClose={() => setShowIssuanceModal(false)}
        title="Class, Student & Department Material Requisition"
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSaveIssuance} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Recipient Category *
              </label>
              <select
                value={issuanceMeta.recipientType}
                onChange={(e) => setIssuanceMeta({ ...issuanceMeta, recipientType: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
              >
                <option value="class">Class / Section</option>
                <option value="student">Student</option>
                <option value="teacher">Teacher / Faculty</option>
                <option value="department">Laboratory / Department</option>
              </select>
            </div>

            {issuanceMeta.recipientType === 'class' && (
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Class & Section *
                </label>
                <input
                  type="text"
                  required
                  value={issuanceMeta.className}
                  onChange={(e) => setIssuanceMeta({ ...issuanceMeta, className: e.target.value })}
                  placeholder="e.g. Class 10 - Section A"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
                />
              </div>
            )}

            {issuanceMeta.recipientType === 'student' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Student Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={issuanceMeta.studentName}
                    onChange={(e) => setIssuanceMeta({ ...issuanceMeta, studentName: e.target.value })}
                    placeholder="e.g. Rahul Verma"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Student Roll No
                  </label>
                  <input
                    type="text"
                    value={issuanceMeta.studentRollNo}
                    onChange={(e) => setIssuanceMeta({ ...issuanceMeta, studentRollNo: e.target.value })}
                    placeholder="e.g. 1045"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
                  />
                </div>
              </>
            )}

            {issuanceMeta.recipientType === 'teacher' && (
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Teacher Name *
                </label>
                <input
                  type="text"
                  required
                  value={issuanceMeta.teacherName}
                  onChange={(e) => setIssuanceMeta({ ...issuanceMeta, teacherName: e.target.value })}
                  placeholder="e.g. Mrs. Anjali Sharma"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
                />
              </div>
            )}

            {issuanceMeta.recipientType === 'department' && (
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Department / Lab Room *
                </label>
                <input
                  type="text"
                  required
                  value={issuanceMeta.department}
                  onChange={(e) => setIssuanceMeta({ ...issuanceMeta, department: e.target.value })}
                  placeholder="e.g. Physics Lab 2"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Billing Model *
              </label>
              <select
                value={issuanceMeta.billingType}
                onChange={(e) => setIssuanceMeta({ ...issuanceMeta, billingType: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
              >
                <option value="complimentary">Complimentary (School Expense)</option>
                <option value="billable">Billable (Student / Class Fee Ledger)</option>
              </select>
            </div>
          </div>

          {/* Dynamic Requisition Lines */}
          <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-neutral-700">
            <div className="flex justify-between items-center">
              <label className="text-xs font-black uppercase text-gray-700 dark:text-gray-300">
                Requisitioned Inventory Items
              </label>
              <button
                type="button"
                onClick={() =>
                  setIssuanceLines([
                    ...issuanceLines,
                    { itemId: '', name: '', sku: '', quantity: 1, unitPrice: 0, totalAmount: 0 },
                  ])
                }
                className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Item
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto p-1">
              {issuanceLines.map((line, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-gray-50 dark:bg-neutral-900 p-2.5 rounded-xl border border-gray-200 dark:border-neutral-700"
                >
                  <div className="flex-1">
                    <select
                      required
                      value={line.itemId}
                      onChange={(e) => handleIssuanceLineChange(idx, 'itemId', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
                    >
                      <option value="">Select Item from Stock...</option>
                      {inventory.map((p) => (
                        <option
                          key={p.id || p._id}
                          value={p.id || p._id}
                          disabled={p.quantity <= 0}
                        >
                          {p.name} ({p.sku}) — Available: {p.quantity} {p.unit}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-24">
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="Qty"
                      value={line.quantity}
                      onChange={(e) => handleIssuanceLineChange(idx, 'quantity', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white font-bold text-center"
                    />
                  </div>

                  <div className="w-28 text-right font-extrabold text-xs text-gray-900 dark:text-white">
                    ₹{(line.totalAmount || 0).toLocaleString('en-IN')}
                  </div>

                  {issuanceLines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setIssuanceLines(issuanceLines.filter((_, i) => i !== idx))}
                      className="p-1 text-gray-400 hover:text-rose-600 rounded"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Purpose / Justification
            </label>
            <input
              type="text"
              value={issuanceMeta.purpose}
              onChange={(e) => setIssuanceMeta({ ...issuanceMeta, purpose: e.target.value })}
              placeholder="e.g. Annual science project reagents, Semester examination answer sheets"
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex justify-between items-center p-3.5 rounded-xl bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700">
            <span className="text-sm font-extrabold text-gray-800 dark:text-gray-200">
              Total Material Value:
            </span>
            <span className="text-lg font-black text-amber-600 dark:text-amber-400">
              ₹{totalIssuanceAmount.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowIssuanceModal(false)}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || totalIssuanceAmount <= 0}
              className="px-5 py-2 rounded-xl text-sm font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-md transition-all"
            >
              {submitting ? 'Issuing...' : 'Confirm Issuance & Deduct Stock'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* MODAL 5: CONNECTED VENDOR QUICK VIEW */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={Boolean(selectedVendorQuickView)}
        onClose={() => setSelectedVendorQuickView(null)}
        title={selectedVendorQuickView ? `${selectedVendorQuickView.name} (Supplier Profile)` : ''}
        maxWidth="max-w-lg"
      >
        {selectedVendorQuickView && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Vendor Code:</span>
                <span className="font-mono font-bold text-gray-900 dark:text-white">
                  {selectedVendorQuickView.vendorCode}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Category:</span>
                <span className="font-semibold text-primary-600">{selectedVendorQuickView.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Contact Person:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {selectedVendorQuickView.contactPerson || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Phone:</span>
                <span className="font-medium text-gray-900 dark:text-white">{selectedVendorQuickView.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Email:</span>
                <span className="font-medium text-gray-900 dark:text-white">{selectedVendorQuickView.email}</span>
              </div>
              {selectedVendorQuickView.gstin && (
                <div className="flex justify-between">
                  <span className="text-gray-400">GSTIN:</span>
                  <span className="font-mono font-bold">{selectedVendorQuickView.gstin}</span>
                </div>
              )}
            </div>

            {/* Banking Coordinates */}
            {selectedVendorQuickView.bankDetails && (
              <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 space-y-1.5">
                <span className="text-[11px] font-bold text-blue-800 dark:text-blue-300 uppercase block">
                  Bank Coordinates
                </span>
                <div className="flex justify-between">
                  <span className="text-gray-500">Bank:</span>
                  <span className="font-semibold">{selectedVendorQuickView.bankDetails.bankName || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">A/C:</span>
                  <span className="font-mono">{selectedVendorQuickView.bankDetails.accountNumber || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">IFSC:</span>
                  <span className="font-mono">{selectedVendorQuickView.bankDetails.ifscCode || 'N/A'}</span>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => {
                  const vend = selectedVendorQuickView;
                  setSelectedVendorQuickView(null);
                  handleOpenPurchase(vend.id || vend._id);
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white flex items-center gap-1.5 shadow-sm"
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                Create Purchase Bill
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedVendorQuickView(null);
                  navigate(ROUTES.VENDORS.LIST);
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 flex items-center gap-1.5"
              >
                <Truck className="h-3.5 w-3.5" />
                View Full Vendor Ledger
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* MODAL 6: PRINTABLE VOUCHER / INVOICE */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={Boolean(printDoc)}
        onClose={() => setPrintDoc(null)}
        title={printDoc?.type === 'purchase' ? 'Vendor Purchase Invoice' : 'Material Delivery Voucher'}
        maxWidth="max-w-2xl"
      >
        {printDoc && (
          <div className="space-y-4 text-xs font-sans print:p-0">
            {/* Voucher Header */}
            <div className="border-b-2 border-gray-900 pb-3 text-center">
              <h2 className="text-base font-black tracking-wide uppercase">
                RAJ GLOBAL EDUCATIONAL SYSTEM (RGES)
              </h2>
              <p className="text-[11px] text-gray-500">
                Central Inventory Depot & Procurement Directorate
              </p>
              <div className="mt-2 inline-block px-3 py-1 bg-gray-100 rounded font-mono font-bold text-xs uppercase">
                {printDoc.type === 'purchase'
                  ? `PURCHASE INVOICE: ${printDoc.data.billNumber}`
                  : `MATERIAL DELIVERY VOUCHER: ${printDoc.data.issuanceNumber}`}
              </div>
            </div>

            {/* Document Info */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-gray-400 block text-[10px]">Date of Record:</span>
                <span className="font-bold">
                  {new Date(
                    printDoc.type === 'purchase' ? printDoc.data.billDate : printDoc.data.issuanceDate
                  ).toLocaleDateString('en-IN')}
                </span>
              </div>
              <div className="text-right">
                <span className="text-gray-400 block text-[10px]">
                  {printDoc.type === 'purchase' ? 'Supplier Vendor:' : 'Recipient Party:'}
                </span>
                <span className="font-extrabold text-sm">
                  {printDoc.type === 'purchase'
                    ? printDoc.data.vendorId?.name || 'Vendor'
                    : printDoc.data.className || printDoc.data.studentName || printDoc.data.department}
                </span>
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full text-xs text-left border border-gray-300 mt-2">
              <thead className="bg-gray-100 border-b border-gray-300 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-2">Item Name & SKU</th>
                  <th className="p-2 text-center">Qty</th>
                  <th className="p-2 text-right">Unit Rate (₹)</th>
                  <th className="p-2 text-right">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {printDoc.data.items?.map((it, idx) => (
                  <tr key={idx}>
                    <td className="p-2">
                      <span className="font-bold block">{it.name}</span>
                      <span className="text-[10px] font-mono text-gray-500">{it.sku}</span>
                    </td>
                    <td className="p-2 text-center font-bold">
                      {it.quantity} {it.unit || 'pcs'}
                    </td>
                    <td className="p-2 text-right font-mono">
                      ₹{(it.unitCost || it.unitPrice || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="p-2 text-right font-bold font-mono">
                      ₹{(it.totalCost || it.totalAmount || 0).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-gray-900 bg-gray-50 font-black">
                <tr>
                  <td colSpan="3" className="p-2 text-right uppercase text-xs">
                    Grand Total Amount:
                  </td>
                  <td className="p-2 text-right font-mono text-sm">
                    ₹
                    {(
                      printDoc.data.grandTotal ||
                      printDoc.data.totalAmount ||
                      0
                    ).toLocaleString('en-IN')}
                  </td>
                </tr>
              </tfoot>
            </table>

            {/* Signatures */}
            <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs">
              <div className="border-t border-gray-400 pt-1">
                <span className="text-gray-500">Store In-Charge Signature</span>
              </div>
              <div className="border-t border-gray-400 pt-1">
                <span className="text-gray-500">Authorized Recipient / Receiver</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t print:hidden">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white flex items-center gap-1.5 shadow-sm"
              >
                <Printer className="h-3.5 w-3.5" />
                Print Document
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
