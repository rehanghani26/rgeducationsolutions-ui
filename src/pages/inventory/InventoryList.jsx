// ui/src/pages/inventory/InventoryList.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
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
  CheckCircle2,
  PackageCheck,
  Building,
  Clock,
  Layers,
  ExternalLink,
  FileText,
  RefreshCw,
  Boxes,
} from "lucide-react";

import {
  getInventoryItems,
  getInventorySummary,
  deleteInventoryItem,
  adjustStock,
  getInventoryTransactions,
} from "../../services/inventoryService.js";
import { getVendors } from "../../services/vendorService.js";
import PageHeader from "../../components/ui/PageHeader.jsx";
import StatsCard from "../../components/ui/StatsCard.jsx";
import Modal from "../../components/ui/Modal.jsx";
import Loader from "../../components/ui/Loader.jsx";
import AddEditProductModal from "./AddEditProductModal.jsx";
import { ROUTES } from "../../routes/routes.js";
import {
  INVENTORY_CATEGORY_FILTER_OPTIONS as CATEGORIES,
  CATEGORY_FALLBACK_IMAGES,
  getSchoolProductImage,
} from "../../constants";
import { formatCurrency, formatDate, formatDateTime } from "../../utils";

export default function InventoryList() {
  const navigate = useNavigate();

  // Navigation tab
  const [activeTab, setActiveTab] = useState("catalog"); // 'catalog', 'ledger'

  // Data states
  const [inventory, setInventory] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [vendorsList, setVendorsList] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All"); // 'All', 'low-stock', 'out-of-stock', 'in-stock'

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustTarget, setAdjustTarget] = useState(null);
  const [adjustForm, setAdjustForm] = useState({
    type: "in",
    quantity: "",
    reason: "",
  });

  // Connected Vendor Quick View Modal
  const [selectedVendorQuickView, setSelectedVendorQuickView] = useState(null);

  const [submitting, setSubmitting] = useState(false);

  // ─── DATA FETCHING ────────────────────────────────────────────────────────
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [invRes, sumRes, vendRes] = await Promise.all([
        getInventoryItems({
          search,
          category: selectedCategory,
          status: selectedStatus,
        }),
        getInventorySummary(),
        getVendors(),
      ]);

      setInventory(invRes?.inventory || invRes?.data?.inventory || []);
      if (sumRes?.data) setSummary(sumRes.data);
      setVendorsList(vendRes?.vendors || vendRes?.data?.vendors || []);

      if (activeTab === "ledger") {
        const tRes = await getInventoryTransactions({ search });
        setTransactions(tRes?.transactions || tRes?.data?.transactions || []);
      }
    } catch (err) {
      console.error("Failed to load inventory data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [search, selectedCategory, selectedStatus, activeTab]);

  // ─── ADD / EDIT PRODUCT ───────────────────────────────────────────────────
  const handleOpenAddProduct = (item = null) => {
    setEditingItem(item || null);
    setShowAddModal(true);
  };

  const handleDeleteProduct = async (id, name) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${name}" from inventory?`
      )
    )
      return;
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
    setAdjustForm({
      type: "in",
      quantity: "",
      reason: "Physical stock count calibration",
    });
    setShowAdjustModal(true);
  };

  const handleSaveAdjust = async (e) => {
    e.preventDefault();
    if (!adjustTarget) return;
    const qty = Number(adjustForm.quantity);
    if (isNaN(qty) || qty <= 0)
      return toast.warn("Quantity must be greater than zero.");

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
            Real-time stock valuation, inward product intake catalog, and
            Session Budget synchronization.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => handleOpenAddProduct()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-500/20 transition-all"
          >
            <Plus className="h-4 w-4" />
            New Products
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
                <span className="text-gray-400 text-[11px] block">
                  Allocated Budget
                </span>
                <span className="text-base font-black text-gray-900 dark:text-white">
                  {formatCurrency(budget.schoolRequirementsBudget || 0)}
                </span>
              </div>
              <div>
                <span className="text-gray-400 text-[11px] block">
                  Disbursed / Spent
                </span>
                <span className="text-base font-black text-primary-600 dark:text-primary-400">
                  {formatCurrency(budget.schoolRequirementsSpent || 0)}
                </span>
              </div>
              <div>
                <span className="text-gray-400 text-[11px] block">
                  Available Balance
                </span>
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(budget.remainingBudget || 0)}
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
                    ? "bg-rose-500"
                    : budget.percentUsed > 75
                      ? "bg-amber-500"
                      : "bg-emerald-500"
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
          value={formatCurrency(summary?.totalStockValue || 0)}
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
          onClick={() => setActiveTab("catalog")}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === "catalog"
              ? "border-primary-600 text-primary-600 dark:text-primary-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          <Boxes className="h-4 w-4" />
          Product Catalog & Stocks ({inventory.length})
        </button>

        <button
          onClick={() => setActiveTab("ledger")}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === "ledger"
              ? "border-primary-600 text-primary-600 dark:text-primary-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          <Clock className="h-4 w-4" />
          Audit Movement Ledger
        </button>
      </div>

      {/* ─── TAB 1: PRODUCT CATALOG ─────────────────────────────────────────── */}
      {activeTab === "catalog" && (
        <div className="space-y-4">
          {/* Category Pill Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-primary-600 text-white shadow-sm"
                    : "bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-neutral-700 hover:bg-gray-100"
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
                    const isLow =
                      item.quantity <= item.minStockLevel && item.quantity > 0;
                    const isOut = item.quantity <= 0;
                    const vend = item.vendorId || item.vendor;

                    return (
                      <tr
                        key={item.id || item._id}
                        className="hover:bg-gray-50 dark:hover:bg-neutral-700/40"
                      >
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <div className="relative h-11 w-11 rounded-xl overflow-hidden bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 shrink-0">
                              <img
                                src={
                                  item.imageUrl || getSchoolProductImage(item)
                                }
                                alt={item.name}
                                loading="lazy"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src =
                                    CATEGORY_FALLBACK_IMAGES[item.category] ||
                                    CATEGORY_FALLBACK_IMAGES.General;
                                }}
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-gray-100 dark:bg-neutral-700 text-gray-600 dark:text-gray-300">
                                  {item.sku}
                                </span>
                                {Array.isArray(item.items) && item.items.length > 1 && (
                                  <span className="text-[10px] font-black px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                    📦 {item.items.length} Products
                                  </span>
                                )}
                              </div>
                              <Link
                                to={`/inventory/${item.id || item._id}`}
                                className="font-extrabold text-sm text-gray-900 dark:text-white mt-1 hover:text-primary-600 dark:hover:text-primary-400 block truncate"
                              >
                                {item.name}
                              </Link>
                              {item.subcategory && (
                                <span className="text-[11px] text-gray-400 block truncate">
                                  {item.subcategory}
                                </span>
                              )}
                            </div>
                          </div>
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
                                  ? "text-rose-600"
                                  : isLow
                                    ? "text-amber-600"
                                    : "text-gray-900 dark:text-white"
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
                            {formatCurrency(item.unitCost || item.price || 0)}
                          </span>
                          <span className="text-[10px] text-gray-400 block">
                            per {item.unit}
                          </span>
                        </td>

                        <td className="p-3.5 text-gray-600 dark:text-gray-300">
                          {item.location || "Main Store"}
                        </td>

                        <td className="p-3.5">
                          {vend ? (
                            <button
                              onClick={() => setSelectedVendorQuickView(vend)}
                              className="text-left group"
                              title="Click to view Vendor details"
                            >
                              <span className="text-primary-600 dark:text-primary-400 font-bold group-hover:underline flex items-center gap-1">
                                {vend.name || "Vendor"}
                                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </span>
                              <span className="text-[10px] text-gray-400 block font-mono">
                                {vend.vendorCode || ""}
                              </span>
                            </button>
                          ) : (
                            <span className="text-gray-400 italic">
                              Unassigned
                            </span>
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
                              onClick={() =>
                                handleDeleteProduct(
                                  item.id || item._id,
                                  item.name
                                )
                              }
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

      {/* ─── TAB 2: AUDIT LEDGER ─────────────────────────────────────────────── */}
      {activeTab === "ledger" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-neutral-800 p-4 rounded-2xl border border-gray-200 dark:border-neutral-700">
            <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
              Immutable Stock Movement & Transaction Timeline
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Cryptographically ordered audit history for every inward receipt,
              class issuance, and stock adjustment.
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
                      <tr
                        key={tx.id || tx._id}
                        className="hover:bg-gray-50 dark:hover:bg-neutral-700/40"
                      >
                        <td className="p-3.5 text-gray-500 font-mono text-[11px]">
                          {formatDateTime(tx.timestamp)}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              tx.type.includes("IN") || tx.type.includes("ADD")
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                            }`}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className="font-extrabold text-gray-900 dark:text-white">
                            {tx.itemName}
                          </span>
                          <span className="text-[10px] text-gray-400 block font-mono">
                            {tx.sku}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`font-black text-sm ${
                              isPositive ? "text-emerald-600" : "text-rose-600"
                            }`}
                          >
                            {isPositive ? `+${tx.quantity}` : tx.quantity}{" "}
                            {tx.unit}
                          </span>
                        </td>
                        <td className="p-3.5 text-gray-700 dark:text-gray-300">
                          <span className="font-semibold block">
                            {tx.partyName || "School Main"}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">
                            {tx.referenceDocNumber}
                          </span>
                        </td>
                        <td className="p-3.5 font-bold text-gray-900 dark:text-white">
                          {tx.balanceAfter} {tx.unit}
                        </td>
                        <td className="p-3.5 text-gray-500 max-w-xs truncate">
                          {tx.reason || "Movement"}
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
      {/* MODAL 1: ADD / EDIT PRODUCT (110+ SCHOOL CATALOG & MULTI-SELECT) */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      <AddEditProductModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        editingItem={editingItem}
        vendorsList={vendorsList}
        onSuccess={fetchAllData}
      />

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* MODAL 2: QUICK STOCK ADJUSTMENT */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={showAdjustModal}
        onClose={() => setShowAdjustModal(false)}
        title={
          adjustTarget
            ? `Adjust Stock: ${adjustTarget.name}`
            : "Stock Adjustment"
        }
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveAdjust} className="space-y-4">
          <div className="bg-gray-50 dark:bg-neutral-900 p-3.5 rounded-xl border border-gray-200 dark:border-neutral-700 text-xs flex justify-between items-center">
            <div>
              <span className="text-gray-400 block text-[11px]">
                Current Stock in Hand
              </span>
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
                onClick={() => setAdjustForm({ ...adjustForm, type: "in" })}
                className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                  adjustForm.type === "in"
                    ? "bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                    : "border-gray-300 dark:border-neutral-700 text-gray-600 dark:text-gray-400"
                }`}
              >
                <ArrowUpRight className="h-4 w-4" />
                Add Stock (+ In)
              </button>
              <button
                type="button"
                onClick={() => setAdjustForm({ ...adjustForm, type: "out" })}
                className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                  adjustForm.type === "out"
                    ? "bg-rose-50 border-rose-500 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                    : "border-gray-300 dark:border-neutral-700 text-gray-600 dark:text-gray-400"
                }`}
              >
                <ArrowDownRight className="h-4 w-4" />
                Reduce Stock (- Out)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Quantity to {adjustForm.type === "in" ? "Add" : "Deduct"} (
              {adjustTarget?.unit}) *
            </label>
            <input
              type="number"
              min="1"
              required
              value={adjustForm.quantity}
              onChange={(e) =>
                setAdjustForm({ ...adjustForm, quantity: e.target.value })
              }
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
              onChange={(e) =>
                setAdjustForm({ ...adjustForm, reason: e.target.value })
              }
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
              {submitting ? "Applying..." : "Apply Adjustment"}
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
        title={
          selectedVendorQuickView
            ? `${selectedVendorQuickView.name} (Supplier Profile)`
            : ""
        }
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
                <span className="font-semibold text-primary-600">
                  {selectedVendorQuickView.category}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Contact Person:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {selectedVendorQuickView.contactPerson || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Phone:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {selectedVendorQuickView.phone}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Email:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {selectedVendorQuickView.email}
                </span>
              </div>
              {selectedVendorQuickView.gstin && (
                <div className="flex justify-between">
                  <span className="text-gray-400">GSTIN:</span>
                  <span className="font-mono font-bold">
                    {selectedVendorQuickView.gstin}
                  </span>
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
                  <span className="font-semibold">
                    {selectedVendorQuickView.bankDetails.bankName || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">A/C:</span>
                  <span className="font-mono">
                    {selectedVendorQuickView.bankDetails.accountNumber || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">IFSC:</span>
                  <span className="font-mono">
                    {selectedVendorQuickView.bankDetails.ifscCode || "N/A"}
                  </span>
                </div>
              </div>
            )}

            <div className="flex justify-end items-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedVendorQuickView(null);
                  navigate(ROUTES.VENDORS.LIST);
                }}
                className="w-full justify-center px-3.5 py-2 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Truck className="h-3.5 w-3.5" />
                View Full Vendor Ledger
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
