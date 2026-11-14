// ui/src/pages/vendors/VendorDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Truck,
  Building,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Receipt,
  CheckCircle2,
  AlertTriangle,
  Boxes,
  Plus,
  Eye,
  Edit2,
  Trash2,
  DollarSign,
  Calendar,
  Clock,
  Printer,
  Copy,
  Check,
  Star,
  ExternalLink,
  ShoppingBag,
  FileText,
  BarChart3,
  TrendingUp,
} from "lucide-react";

import {
  getVendorById,
  updateVendor,
  recordVendorPayment,
} from "../../services/vendorService.js";
import {
  createPurchaseBill,
  getInventoryItems,
} from "../../services/inventoryService.js";
import Modal from "../../components/ui/Modal.jsx";
import Loader from "../../components/ui/Loader.jsx";
import { ROUTES } from "../../routes/routes.js";
import { formatCurrency, formatDate } from "../../utils";

export default function VendorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview"); // 'overview', 'bills', 'products', 'ledger'
  const [vendor, setVendor] = useState(null);
  const [bills, setBills] = useState([]);
  const [suppliedProducts, setSuppliedProducts] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [spendTrend, setSpendTrend] = useState([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showPayModal, setShowPayModal] = useState(false);
  const [payTargetBill, setPayTargetBill] = useState(null);
  const [payForm, setPayForm] = useState({
    amount: "",
    paymentType: "Bank Transfer",
    transactionReference: "",
    notes: "",
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});

  const [showBillModal, setShowBillModal] = useState(false);
  const [inventoryCatalog, setInventoryCatalog] = useState([]);
  const [billLines, setBillLines] = useState([
    {
      itemId: "",
      name: "",
      sku: "",
      category: "",
      quantity: 1,
      unitCost: 0,
      totalCost: 0,
    },
  ]);
  const [billMeta, setBillMeta] = useState({
    billNumber: "",
    billDate: new Date().toISOString().split("T")[0],
    paymentType: "Bank Transfer",
    amountPaid: "",
    transactionReference: "",
    notes: "",
  });

  const [printBill, setPrintBill] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [copiedField, setCopiedField] = useState("");

  // Fetch Vendor Details & Ledger
  const fetchVendorDetails = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await getVendorById(id);
      const data = res?.data || res;
      setVendor(data.vendor);
      setBills(data.bills || []);
      setSuppliedProducts(data.suppliedProducts || []);
      setKpis(data.kpis);
      setSpendTrend(data.spendTrend || []);
      setCategoryBreakdown(data.categoryBreakdown || []);
      setEditForm(data.vendor || {});
    } catch (err) {
      console.error("Failed to load vendor details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorDetails();
  }, [id]);

  // Load Catalog for New Bill Modal
  useEffect(() => {
    getInventoryItems({ limit: 300 }).then((res) => {
      setInventoryCatalog(res?.inventory || res?.data?.inventory || []);
    });
  }, []);

  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(""), 2000);
    toast.info(`Copied ${fieldName} to clipboard`);
  };

  // ─── RECORD PAYMENT ───────────────────────────────────────────────────────
  const handleOpenPay = (bill = null) => {
    setPayTargetBill(bill);
    setPayForm({
      amount: bill ? bill.balanceDue : vendor?.outstandingBalance || "",
      paymentType: "Bank Transfer",
      transactionReference: "",
      notes: bill
        ? `Payment for Bill #${bill.billNumber}`
        : "Account settlement",
    });
    setShowPayModal(true);
  };

  const handleSavePayment = async (e) => {
    e.preventDefault();
    const amt = Number(payForm.amount);
    if (!amt || amt <= 0)
      return toast.warn("Please enter a valid payment amount.");

    setSubmitting(true);
    try {
      await recordVendorPayment(id, {
        amount: amt,
        paymentType: payForm.paymentType,
        transactionReference: payForm.transactionReference,
        notes: payForm.notes,
        billId: payTargetBill?.id || payTargetBill?._id || null,
      });
      setShowPayModal(false);
      fetchVendorDetails();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // ─── EDIT VENDOR ──────────────────────────────────────────────────────────
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await updateVendor(id, editForm);
      setShowEditModal(false);
      fetchVendorDetails();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // ─── NEW PURCHASE BILL ────────────────────────────────────────────────────
  const handleOpenNewBill = () => {
    setBillLines([
      {
        itemId: "",
        name: "",
        sku: "",
        category: "",
        quantity: 1,
        unitCost: 0,
        totalCost: 0,
      },
    ]);
    setBillMeta({
      billNumber: `BILL-${Date.now().toString(36).toUpperCase()}`,
      billDate: new Date().toISOString().split("T")[0],
      paymentType: "Bank Transfer",
      amountPaid: "",
      transactionReference: "",
      notes: `Purchase from ${vendor?.name}`,
    });
    setShowBillModal(true);
  };

  const handleBillLineChange = (idx, field, value) => {
    const updated = [...billLines];
    if (field === "itemId") {
      const prod = inventoryCatalog.find((p) => (p.id || p._id) === value);
      if (prod) {
        updated[idx] = {
          ...updated[idx],
          itemId: prod.id || prod._id,
          name: prod.name,
          sku: prod.sku,
          category: prod.category,
          unitCost: prod.unitCost || prod.price || 0,
          totalCost:
            (updated[idx].quantity || 1) * (prod.unitCost || prod.price || 0),
        };
      }
    } else if (field === "quantity") {
      const q = Math.max(1, Number(value) || 1);
      updated[idx].quantity = q;
      updated[idx].totalCost = q * (updated[idx].unitCost || 0);
    } else if (field === "unitCost") {
      const c = Math.max(0, Number(value) || 0);
      updated[idx].unitCost = c;
      updated[idx].totalCost = (updated[idx].quantity || 1) * c;
    }
    setBillLines(updated);
  };

  const calculatedBillTotal = billLines.reduce(
    (s, it) => s + (Number(it.totalCost) || 0),
    0
  );

  const handleSaveBill = async (e) => {
    e.preventDefault();
    const validLines = billLines.filter((l) => l.itemId && l.quantity > 0);
    if (validLines.length === 0)
      return toast.warn("Please add at least one valid inventory item.");

    setSubmitting(true);
    try {
      const payload = {
        vendorId: id,
        billNumber: billMeta.billNumber,
        billDate: billMeta.billDate,
        items: validLines,
        subtotal: calculatedBillTotal,
        grandTotal: calculatedBillTotal,
        paymentType: billMeta.paymentType,
        amountPaid:
          billMeta.amountPaid !== ""
            ? Number(billMeta.amountPaid)
            : calculatedBillTotal,
        transactionReference: billMeta.transactionReference,
        notes: billMeta.notes,
      };

      const res = await createPurchaseBill(payload);
      if (res?.overrun) return;

      setShowBillModal(false);
      fetchVendorDetails();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <Loader />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="text-center py-24 space-y-4">
        <Truck className="h-12 w-12 text-gray-400 mx-auto" />
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
          Vendor Not Found
        </h2>
        <Link
          to={ROUTES.VENDORS.LIST}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 text-white font-semibold"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Vendor Directory
        </Link>
      </div>
    );
  }

  const hasDue = (vendor.outstandingBalance || 0) > 0;

  return (
    <div className="space-y-6 pb-16">
      {/* ─── BREADCRUMB & BACK ACTION ────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <Link
          to={ROUTES.VENDORS.LIST}
          className="inline-flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Vendor Suppliers
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenNewBill()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-sm transition-all"
          >
            <ShoppingBag className="h-4 w-4" />
            New Purchase Bill
          </button>
          {hasDue && (
            <button
              onClick={() => handleOpenPay()}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
            >
              <CreditCard className="h-4 w-4" />
              Record Settlement
            </button>
          )}
          <button
            onClick={() => setShowEditModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-200 transition-all"
          >
            <Edit2 className="h-4 w-4" />
            Edit Profile
          </button>
        </div>
      </div>

      {/* ─── VENDOR HERO HEADER CARD ─────────────────────────────────────────── */}
      <div className="bg-white dark:bg-neutral-800 rounded-3xl border border-gray-200 dark:border-neutral-700 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
              <Truck className="h-8 w-8" />
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="font-mono text-xs font-extrabold px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-300">
                  {vendor.vendorCode || "VND-000"}
                </span>
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-300">
                  {vendor.category || "General"}
                </span>
                <span
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                    vendor.status === "active"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                      : "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                  }`}
                >
                  {vendor.status === "active" ? "Active Approved" : "Inactive"}
                </span>
                <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-lg text-xs font-bold">
                  <Star className="h-3.5 w-3.5 fill-amber-500" />
                  {vendor.rating || 5}.0
                </div>
              </div>

              <h1 className="text-2xl font-black text-gray-900 dark:text-white mt-1.5">
                {vendor.name}
              </h1>

              {/* Coordinates line */}
              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-2 flex-wrap">
                {vendor.contactPerson && (
                  <span className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-gray-300">
                    <Building className="h-3.5 w-3.5 text-gray-400" />
                    {vendor.contactPerson}
                  </span>
                )}
                {vendor.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-gray-400" />
                    {vendor.phone}
                  </span>
                )}
                {vendor.email && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-gray-400" />
                    {vendor.email}
                  </span>
                )}
                {(vendor.city || vendor.state) && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-gray-400" />
                    {[vendor.city, vendor.state].filter(Boolean).join(", ")}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Outstanding Balance Banner */}
          <div className="bg-gray-50 dark:bg-neutral-900/80 p-4 rounded-2xl border border-gray-200 dark:border-neutral-700 text-right min-w-[200px]">
            <span className="text-xs text-gray-400 block font-semibold">
              Outstanding Due Balance
            </span>
            <span
              className={`text-2xl font-black block mt-0.5 ${
                hasDue
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {formatCurrency(vendor.outstandingBalance || 0)}
            </span>
            <span className="text-[11px] text-gray-400 mt-1 block">
              Terms: {vendor.paymentTerms || "Net 30 Days"}
            </span>
          </div>
        </div>
      </div>

      {/* ─── 4 DYNAMIC KPI CARDS ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-neutral-800 p-5 rounded-2xl border border-gray-200 dark:border-neutral-700 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
            <Receipt className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-semibold block">
              Total Inward Billed
            </span>
            <h3 className="text-lg font-black text-gray-900 dark:text-white mt-0.5">
              {formatCurrency(kpis?.totalBilled || vendor.totalBilled || 0)}
            </h3>
            <span className="text-[11px] text-gray-400 block">
              From {bills.length} Purchase Bills
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 p-5 rounded-2xl border border-gray-200 dark:border-neutral-700 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-semibold block">
              Total Disbursed
            </span>
            <h3 className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
              {formatCurrency(kpis?.totalPaid || vendor.totalPaid || 0)}
            </h3>
            <span className="text-[11px] text-gray-400 block">
              Settled to Vendor
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 p-5 rounded-2xl border border-gray-200 dark:border-neutral-700 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
            <Boxes className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-semibold block">
              Supplied Products
            </span>
            <h3 className="text-lg font-black text-gray-900 dark:text-white mt-0.5">
              {suppliedProducts.length} SKUs
            </h3>
            <span className="text-[11px] text-gray-400 block">
              Active catalog lines
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 p-5 rounded-2xl border border-gray-200 dark:border-neutral-700 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-semibold block">
              Avg Purchase Order
            </span>
            <h3 className="text-lg font-black text-gray-900 dark:text-white mt-0.5">
              {formatCurrency(kpis?.averageOrderValue || 0)}
            </h3>
            <span className="text-[11px] text-gray-400 block">
              Per procurement batch
            </span>
          </div>
        </div>
      </div>

      {/* ─── TAB NAVIGATION ─────────────────────────────────────────────────── */}
      <div className="flex border-b border-gray-200 dark:border-neutral-700 space-x-6 text-sm font-bold">
        <button
          onClick={() => setActiveTab("overview")}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === "overview"
              ? "border-primary-600 text-primary-600 dark:text-primary-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          <Building className="h-4 w-4" />
          Overview & Spend Analytics
        </button>

        <button
          onClick={() => setActiveTab("bills")}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === "bills"
              ? "border-primary-600 text-primary-600 dark:text-primary-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          <Receipt className="h-4 w-4" />
          Purchase Invoices & Bills ({bills.length})
        </button>

        <button
          onClick={() => setActiveTab("products")}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === "products"
              ? "border-primary-600 text-primary-600 dark:text-primary-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          <Boxes className="h-4 w-4" />
          Supplied Products ({suppliedProducts.length})
        </button>
      </div>

      {/* ─── TAB 1: OVERVIEW & SPEND ANALYTICS ────────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Visual Analytics & Breakdown */}
          <div className="lg:col-span-2 space-y-6">
            {/* Monthly Spend Chart Card */}
            <div className="bg-white dark:bg-neutral-800 p-5 rounded-2xl border border-gray-200 dark:border-neutral-700 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary-600" />
                    Procurement Spend Trend
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Monthly billing history with this supplier
                  </p>
                </div>
                <span className="text-xs font-bold text-primary-600 dark:text-primary-400">
                  Total {formatCurrency(kpis?.totalBilled || 0)}
                </span>
              </div>

              {spendTrend.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-400">
                  No monthly spend records available yet.
                </div>
              ) : (
                <div className="space-y-3 pt-2">
                  {spendTrend.map((st, i) => {
                    const maxVal = Math.max(
                      ...spendTrend.map((x) => x.amount || 1)
                    );
                    const pct = Math.min(
                      100,
                      Math.round((st.amount / maxVal) * 100)
                    );
                    return (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-gray-700 dark:text-gray-300">
                            {st.month}
                          </span>
                          <span className="text-gray-900 dark:text-white">
                            {formatCurrency(st.amount)}
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-gray-100 dark:bg-neutral-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary-600 dark:bg-primary-500 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Category Breakdown Card */}
            {categoryBreakdown.length > 0 && (
              <div className="bg-white dark:bg-neutral-800 p-5 rounded-2xl border border-gray-200 dark:border-neutral-700 shadow-sm">
                <h3 className="text-base font-extrabold text-gray-900 dark:text-white mb-3">
                  Procured Category Allocation
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {categoryBreakdown.map((cat, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-gray-50 dark:bg-neutral-900/60 border border-gray-200 dark:border-neutral-700 text-xs"
                    >
                      <span className="text-gray-500 dark:text-gray-400 block truncate">
                        {cat.category}
                      </span>
                      <span className="font-extrabold text-sm text-gray-900 dark:text-white block mt-0.5">
                        {formatCurrency(cat.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Bank Details & Compliance Profile */}
          <div className="space-y-6">
            {/* Electronic Banking Coordinates */}
            <div className="bg-white dark:bg-neutral-800 p-5 rounded-2xl border border-gray-200 dark:border-neutral-700 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-emerald-600" />
                  Banking Coordinates
                </h3>
                <span className="text-[10px] font-bold uppercase text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                  Electronic NEFT / RTGS
                </span>
              </div>

              <div className="space-y-2 text-xs bg-gray-50 dark:bg-neutral-900 p-3.5 rounded-xl border border-gray-200 dark:border-neutral-700">
                <div className="flex justify-between">
                  <span className="text-gray-400">Bank Name:</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {vendor.bankDetails?.bankName || "Not Provided"}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Account #:</span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-gray-900 dark:text-white">
                    <span>{vendor.bankDetails?.accountNumber || "—"}</span>
                    {vendor.bankDetails?.accountNumber && (
                      <button
                        onClick={() =>
                          handleCopy(
                            vendor.bankDetails.accountNumber,
                            "Account #"
                          )
                        }
                        className="text-gray-400 hover:text-primary-600"
                        title="Copy Account Number"
                      >
                        {copiedField === "Account #" ? (
                          <Check className="h-3 w-3 text-emerald-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400">IFSC Code:</span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-gray-900 dark:text-white">
                    <span>{vendor.bankDetails?.ifscCode || "—"}</span>
                    {vendor.bankDetails?.ifscCode && (
                      <button
                        onClick={() =>
                          handleCopy(vendor.bankDetails.ifscCode, "IFSC Code")
                        }
                        className="text-gray-400 hover:text-primary-600"
                      >
                        {copiedField === "IFSC Code" ? (
                          <Check className="h-3 w-3 text-emerald-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {vendor.bankDetails?.upiId && (
                  <div className="flex justify-between items-center pt-1 border-t border-gray-200 dark:border-neutral-700">
                    <span className="text-gray-400">UPI ID:</span>
                    <span className="font-mono font-bold text-primary-600">
                      {vendor.bankDetails.upiId}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Tax & Compliance Profile */}
            <div className="bg-white dark:bg-neutral-800 p-5 rounded-2xl border border-gray-200 dark:border-neutral-700 shadow-sm space-y-3">
              <h3 className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                Tax & Statutory Compliance
              </h3>

              <div className="space-y-2 text-xs bg-gray-50 dark:bg-neutral-900 p-3.5 rounded-xl border border-gray-200 dark:border-neutral-700">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">GSTIN:</span>
                  <span className="font-mono font-bold text-gray-900 dark:text-white">
                    {vendor.gstin || "Unregistered / Exempt"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">PAN Number:</span>
                  <span className="font-mono font-bold text-gray-900 dark:text-white">
                    {vendor.pan || "—"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Payment Terms:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {vendor.paymentTerms || "Net 30"}
                  </span>
                </div>
              </div>

              {vendor.notes && (
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-neutral-900 text-xs text-gray-600 dark:text-gray-300">
                  <span className="font-bold block text-gray-700 dark:text-gray-200 mb-0.5">
                    Notes:
                  </span>
                  {vendor.notes}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: INVOICES & BILLS ─────────────────────────────────────────── */}
      {activeTab === "bills" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white dark:bg-neutral-800 p-4 rounded-2xl border border-gray-200 dark:border-neutral-700">
            <div>
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                Inward Purchase Invoices & Payment Ledger
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Every procurement invoice, item count, disbursed payment, and
                pending balance.
              </p>
            </div>
            <button
              onClick={() => handleOpenNewBill()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-sm transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              New Purchase Bill
            </button>
          </div>

          {bills.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-neutral-800 rounded-2xl border border-gray-200 dark:border-neutral-700 text-gray-400 text-xs">
              No purchase bills recorded for this vendor yet.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-sm">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 dark:bg-neutral-900 text-gray-600 dark:text-gray-300 font-bold uppercase text-[10px] border-b border-gray-200 dark:border-neutral-700">
                  <tr>
                    <th className="p-3.5">Bill Number</th>
                    <th className="p-3.5">Bill Date</th>
                    <th className="p-3.5">Purchased Lines</th>
                    <th className="p-3.5">Grand Total</th>
                    <th className="p-3.5">Disbursed</th>
                    <th className="p-3.5">Balance Due</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-neutral-700">
                  {bills.map((bill) => (
                    <tr
                      key={bill.id || bill._id}
                      className="hover:bg-gray-50 dark:hover:bg-neutral-750"
                    >
                      <td className="p-3.5 font-mono font-bold text-gray-900 dark:text-white">
                        {bill.billNumber}
                      </td>
                      <td className="p-3.5 text-gray-500">
                        {formatDate(bill.billDate)}
                      </td>
                      <td className="p-3.5 text-gray-700 dark:text-gray-300">
                        {bill.items?.length || 0} product lines
                      </td>
                      <td className="p-3.5 font-black text-gray-900 dark:text-white">
                        {formatCurrency(bill.grandTotal || 0)}
                      </td>
                      <td className="p-3.5 text-emerald-600 font-bold">
                        {formatCurrency(bill.amountPaid || 0)}
                      </td>
                      <td className="p-3.5 font-black text-rose-600">
                        {formatCurrency(bill.balanceDue || 0)}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            bill.paymentStatus === "Paid"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                              : bill.paymentStatus === "Partial"
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                                : "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                          }`}
                        >
                          {bill.paymentStatus}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {bill.balanceDue > 0 && (
                            <button
                              onClick={() => handleOpenPay(bill)}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all"
                            >
                              Settle Due
                            </button>
                          )}
                          <button
                            onClick={() => setPrintBill(bill)}
                            className="p-1 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded"
                            title="Print Invoice"
                          >
                            <Printer className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 3: SUPPLIED PRODUCTS CATALOG ───────────────────────────────── */}
      {activeTab === "products" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white dark:bg-neutral-800 p-4 rounded-2xl border border-gray-200 dark:border-neutral-700">
            <div>
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                Supplied Inventory Products Catalog ({suppliedProducts.length})
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                School inventory items sourced directly from this registered
                vendor.
              </p>
            </div>
            <button
              onClick={() => handleOpenNewBill()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-sm transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              Reorder from Vendor
            </button>
          </div>

          {suppliedProducts.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-neutral-800 rounded-2xl border border-gray-200 dark:border-neutral-700 text-gray-400 text-xs">
              No products mapped to this vendor yet.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-sm">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 dark:bg-neutral-900 text-gray-600 dark:text-gray-300 font-bold uppercase text-[10px] border-b border-gray-200 dark:border-neutral-700">
                  <tr>
                    <th className="p-3.5">SKU & Product Name</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Stock in Hand</th>
                    <th className="p-3.5">Purchase Unit Cost</th>
                    <th className="p-3.5">Storage Location</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-neutral-700">
                  {suppliedProducts.map((prod) => (
                    <tr
                      key={prod.id || prod._id}
                      className="hover:bg-gray-50 dark:hover:bg-neutral-750"
                    >
                      <td className="p-3.5">
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 dark:bg-neutral-700 text-gray-600 dark:text-gray-300">
                          {prod.sku}
                        </span>
                        <h4 className="font-extrabold text-sm text-gray-900 dark:text-white mt-1">
                          {prod.name}
                        </h4>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-300">
                          {prod.category}
                        </span>
                      </td>
                      <td className="p-3.5 font-extrabold text-gray-900 dark:text-white">
                        {prod.quantity} {prod.unit}
                      </td>
                      <td className="p-3.5 font-bold text-gray-900 dark:text-white">
                        {formatCurrency(prod.unitCost || prod.price || 0)}
                      </td>
                      <td className="p-3.5 text-gray-500">
                        {prod.location || "Main Store"}
                      </td>
                      <td className="p-3.5 text-right">
                        <Link
                          to={`/inventory/${prod.id || prod._id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-gray-100 dark:bg-neutral-700 hover:bg-primary-50 dark:hover:bg-primary-950/40 hover:text-primary-600 text-gray-700 dark:text-gray-200 transition-all"
                        >
                          <Eye className="h-3 w-3" />
                          Product Record
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* MODAL 1: RECORD SETTLEMENT / PAYMENT */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={showPayModal}
        onClose={() => setShowPayModal(false)}
        title={
          payTargetBill
            ? `Settle Bill #${payTargetBill.billNumber}`
            : `Record Payment to ${vendor?.name}`
        }
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSavePayment} className="space-y-4">
          <div className="bg-gray-50 dark:bg-neutral-900 p-3.5 rounded-xl border border-gray-200 dark:border-neutral-700 text-xs">
            <span className="text-gray-400">Total Outstanding Balance:</span>
            <p className="text-base font-black text-rose-600 dark:text-rose-400">
              {formatCurrency(
                payTargetBill
                  ? payTargetBill.balanceDue
                  : vendor?.outstandingBalance || 0
              )}
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Disbursement Amount (₹) *
            </label>
            <input
              type="number"
              required
              min="1"
              value={payForm.amount}
              onChange={(e) =>
                setPayForm({ ...payForm, amount: e.target.value })
              }
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Payment Mode *
            </label>
            <select
              value={payForm.paymentType}
              onChange={(e) =>
                setPayForm({ ...payForm, paymentType: e.target.value })
              }
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
            >
              <option value="Bank Transfer">Bank Transfer (NEFT / RTGS)</option>
              <option value="Cheque">Cheque</option>
              <option value="UPI">UPI</option>
              <option value="Cash">Cash</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Transaction Reference / UTR / Cheque #
            </label>
            <input
              type="text"
              value={payForm.transactionReference}
              onChange={(e) =>
                setPayForm({ ...payForm, transactionReference: e.target.value })
              }
              placeholder="e.g. UTR123456789 or Cheque #49201"
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Payment Remarks
            </label>
            <input
              type="text"
              value={payForm.notes}
              onChange={(e) =>
                setPayForm({ ...payForm, notes: e.target.value })
              }
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-200 dark:border-neutral-700">
            <button
              type="button"
              onClick={() => setShowPayModal(false)}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all"
            >
              {submitting ? "Recording..." : "Confirm Disbursement"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* MODAL 2: EDIT VENDOR PROFILE */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Vendor Coordinates & Banking Profile"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Company Name *
              </label>
              <input
                type="text"
                required
                value={editForm.name || ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Category *
              </label>
              <input
                type="text"
                value={editForm.category || ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, category: e.target.value })
                }
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Contact Person
              </label>
              <input
                type="text"
                value={editForm.contactPerson || ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, contactPerson: e.target.value })
                }
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={editForm.phone || ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, phone: e.target.value })
                }
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={editForm.email || ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, email: e.target.value })
                }
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                GSTIN (Tax ID)
              </label>
              <input
                type="text"
                value={editForm.gstin || ""}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    gstin: e.target.value.toUpperCase(),
                  })
                }
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white font-mono uppercase"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-gray-200 dark:border-neutral-700">
            <h4 className="text-xs font-black uppercase text-gray-400 mb-2">
              Banking Coordinates
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={editForm.bankDetails?.bankName || ""}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      bankDetails: {
                        ...editForm.bankDetails,
                        bankName: e.target.value,
                      },
                    })
                  }
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                  Account #
                </label>
                <input
                  type="text"
                  value={editForm.bankDetails?.accountNumber || ""}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      bankDetails: {
                        ...editForm.bankDetails,
                        accountNumber: e.target.value,
                      },
                    })
                  }
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                  IFSC Code
                </label>
                <input
                  type="text"
                  value={editForm.bankDetails?.ifscCode || ""}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      bankDetails: {
                        ...editForm.bankDetails,
                        ifscCode: e.target.value.toUpperCase(),
                      },
                    })
                  }
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white font-mono uppercase"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-200 dark:border-neutral-700">
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl text-sm font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-md transition-all"
            >
              {submitting ? "Saving..." : "Update Vendor"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* MODAL 3: NEW PURCHASE BILL FROM THIS VENDOR */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={showBillModal}
        onClose={() => setShowBillModal(false)}
        title={`New Purchase Bill from ${vendor?.name}`}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSaveBill} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Vendor Bill / Invoice # *
              </label>
              <input
                type="text"
                required
                value={billMeta.billNumber}
                onChange={(e) =>
                  setBillMeta({ ...billMeta, billNumber: e.target.value })
                }
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
                value={billMeta.billDate}
                onChange={(e) =>
                  setBillMeta({ ...billMeta, billDate: e.target.value })
                }
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Payment Method
              </label>
              <select
                value={billMeta.paymentType}
                onChange={(e) =>
                  setBillMeta({ ...billMeta, paymentType: e.target.value })
                }
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
              >
                <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                <option value="Cheque">Cheque</option>
                <option value="UPI">UPI</option>
                <option value="Cash">Cash</option>
                <option value="Credit / On Account">
                  Deferred Credit / On Account
                </option>
              </select>
            </div>
          </div>

          {/* Dynamic Lines */}
          <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-neutral-700">
            <div className="flex justify-between items-center">
              <label className="text-xs font-black uppercase text-gray-700 dark:text-gray-300">
                Purchased Products
              </label>
              <button
                type="button"
                onClick={() =>
                  setBillLines([
                    ...billLines,
                    {
                      itemId: "",
                      name: "",
                      sku: "",
                      category: "",
                      quantity: 1,
                      unitCost: 0,
                      totalCost: 0,
                    },
                  ])
                }
                className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Line Item
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto p-1">
              {billLines.map((line, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-gray-50 dark:bg-neutral-900 p-2.5 rounded-xl border border-gray-200 dark:border-neutral-700"
                >
                  <div className="flex-1">
                    <select
                      required
                      value={line.itemId}
                      onChange={(e) =>
                        handleBillLineChange(idx, "itemId", e.target.value)
                      }
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
                    >
                      <option value="">Select Inventory Product...</option>
                      {inventoryCatalog.map((p) => (
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
                      onChange={(e) =>
                        handleBillLineChange(idx, "quantity", e.target.value)
                      }
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
                      onChange={(e) =>
                        handleBillLineChange(idx, "unitCost", e.target.value)
                      }
                      className="w-full px-2 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white font-mono text-right"
                    />
                  </div>

                  <div className="w-28 text-right font-extrabold text-xs text-gray-900 dark:text-white">
                    {formatCurrency(line.totalCost || 0)}
                  </div>

                  {billLines.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setBillLines(billLines.filter((_, i) => i !== idx))
                      }
                      className="p-1 text-gray-400 hover:text-rose-600 rounded"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center p-3.5 rounded-xl bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700">
            <span className="text-sm font-extrabold text-gray-800 dark:text-gray-200">
              Total Bill Value:
            </span>
            <span className="text-lg font-black text-primary-600 dark:text-primary-400">
              {formatCurrency(calculatedBillTotal)}
            </span>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowBillModal(false)}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || calculatedBillTotal <= 0}
              className="px-5 py-2 rounded-xl text-sm font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-md transition-all"
            >
              {submitting ? "Recording..." : "Authorize Purchase & Stock In"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* MODAL 4: PRINT INVOICE */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={Boolean(printBill)}
        onClose={() => setPrintBill(null)}
        title="Vendor Purchase Invoice"
        maxWidth="max-w-2xl"
      >
        {printBill && (
          <div className="space-y-4 text-xs font-sans print:p-0">
            <div className="border-b-2 border-gray-900 pb-3 text-center">
              <h2 className="text-base font-black tracking-wide uppercase">
                RAJ GLOBAL EDUCATIONAL SYSTEM (RGES)
              </h2>
              <p className="text-[11px] text-gray-500">
                Inward Procurement Voucher
              </p>
              <div className="mt-2 inline-block px-3 py-1 bg-gray-100 rounded font-mono font-bold text-xs">
                INVOICE #{printBill.billNumber}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-400 text-[10px] block">
                  Invoice Date:
                </span>
                <span className="font-bold">
                  {formatDate(printBill.billDate)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-gray-400 text-[10px] block">
                  Vendor Supplier:
                </span>
                <span className="font-bold text-sm">{vendor?.name}</span>
                <span className="text-[10px] text-gray-400 block font-mono">
                  {vendor?.vendorCode}
                </span>
              </div>
            </div>

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
                {printBill.items?.map((it, idx) => (
                  <tr key={idx}>
                    <td className="p-2">
                      <span className="font-bold block">{it.name}</span>
                      <span className="text-[10px] font-mono text-gray-500">
                        {it.sku}
                      </span>
                    </td>
                    <td className="p-2 text-center font-bold">
                      {it.quantity} {it.unit || "pcs"}
                    </td>
                    <td className="p-2 text-right font-mono">
                      {formatCurrency(it.unitCost || 0)}
                    </td>
                    <td className="p-2 text-right font-bold font-mono">
                      {formatCurrency(it.totalCost || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-gray-900 bg-gray-50 font-black">
                <tr>
                  <td colSpan="3" className="p-2 text-right uppercase text-xs">
                    Grand Total:
                  </td>
                  <td className="p-2 text-right font-mono text-sm">
                    {formatCurrency(printBill.grandTotal || 0)}
                  </td>
                </tr>
              </tfoot>
            </table>

            <div className="flex justify-end pt-3 print:hidden">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white flex items-center gap-1.5 shadow-sm"
              >
                <Printer className="h-3.5 w-3.5" />
                Print Voucher
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
