// ui/src/pages/vendors/VendorManagement.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Truck,
  Plus,
  Search,
  Filter,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  Building,
  CreditCard,
  Eye,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  Star,
  ExternalLink,
  Receipt,
  Warehouse,
  ShoppingBag,
} from 'lucide-react';

import {
  getVendors,
  getVendorById,
  createVendor,
  updateVendor,
  recordVendorPayment,
} from '../../services/vendorService.js';
import {
  getInventoryItems,
  createPurchaseBill,
  getInventorySummary,
} from '../../services/inventoryService.js';
import PageHeader from '../../components/ui/PageHeader.jsx';
import StatsCard from '../../components/ui/StatsCard.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Loader from '../../components/ui/Loader.jsx';
import { ROUTES } from '../../routes/routes.js';

const CATEGORIES = [
  'All',
  'Stationery',
  'Lab Equipment',
  'IT Hardware',
  'Sports',
  'Uniforms',
  'Medical',
  'Furniture',
  'General',
];

const blankVendor = {
  name: '',
  contactPerson: '',
  phone: '',
  altPhone: '',
  email: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  gstin: '',
  pan: '',
  category: 'Stationery',
  paymentTerms: 'Net 30',
  rating: 5,
  status: 'active',
  bankDetails: {
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    branchName: '',
    upiId: '',
  },
  notes: '',
};

export default function VendorManagement() {
  const navigate = useNavigate();

  // Data states
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [vendorForm, setVendorForm] = useState(blankVendor);
  const [submitting, setSubmitting] = useState(false);

  // Detail & Ledger Modal
  const [selectedVendorDetail, setSelectedVendorDetail] = useState(null);
  const [vendorBills, setVendorBills] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Payment Modal
  const [showPayModal, setShowPayModal] = useState(false);
  const [payForm, setPayForm] = useState({
    amount: '',
    paymentType: 'Bank Transfer',
    transactionReference: '',
    notes: '',
    billId: null,
  });

  // Connected Inward Bill Modal
  const [showBillModal, setShowBillModal] = useState(false);
  const [billVendor, setBillVendor] = useState(null);
  const [inventoryCatalog, setInventoryCatalog] = useState([]);
  const [budgetHealth, setBudgetHealth] = useState(null);
  const [billLines, setBillLines] = useState([
    { itemId: '', name: '', sku: '', category: '', quantity: 1, unitCost: 0, totalCost: 0 },
  ]);
  const [billMeta, setBillMeta] = useState({
    billNumber: '',
    billDate: new Date().toISOString().split('T')[0],
    paymentType: 'Bank Transfer',
    amountPaid: '',
    transactionReference: '',
    notes: '',
  });

  // Fetch Vendors
  const loadVendors = async () => {
    setLoading(true);
    try {
      const res = await getVendors({ search, category: selectedCategory, status: selectedStatus });
      const list = res?.vendors || res?.data?.vendors || [];
      setVendors(list);
    } catch (err) {
      console.error('Failed to load vendors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendors();
  }, [search, selectedCategory, selectedStatus]);

  // Load inventory catalog & budget info for connected purchase modal
  const loadCatalogAndBudget = async () => {
    try {
      const [invRes, sumRes] = await Promise.all([
        getInventoryItems({ limit: 200 }),
        getInventorySummary(),
      ]);
      setInventoryCatalog(invRes?.inventory || invRes?.data?.inventory || []);
      if (sumRes?.data?.budgetHealth) {
        setBudgetHealth(sumRes.data.budgetHealth);
      }
    } catch (err) {
      console.error('Failed to load catalog/budget:', err);
    }
  };

  useEffect(() => {
    loadCatalogAndBudget();
  }, []);

  // Summary Metrics
  const totalVendors = vendors.length;
  const totalBilled = vendors.reduce((s, v) => s + (v.totalBilled || 0), 0);
  const totalPaid = vendors.reduce((s, v) => s + (v.totalPaid || 0), 0);
  const outstandingBalance = vendors.reduce((s, v) => s + (v.outstandingBalance || 0), 0);

  // Open Detail & Ledger
  const handleOpenDetail = async (vendor) => {
    setSelectedVendorDetail(vendor);
    setLoadingDetail(true);
    try {
      const res = await getVendorById(vendor.id || vendor._id);
      if (res?.data?.vendor) setSelectedVendorDetail(res.data.vendor);
      setVendorBills(res?.data?.bills || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Open Add/Edit Vendor Modal
  const handleOpenAdd = (vendor = null) => {
    if (vendor) {
      setEditingVendor(vendor);
      setVendorForm({
        ...blankVendor,
        ...vendor,
        bankDetails: { ...blankVendor.bankDetails, ...(vendor.bankDetails || {}) },
      });
    } else {
      setEditingVendor(null);
      setVendorForm(blankVendor);
    }
    setShowAddModal(true);
  };

  const handleSaveVendor = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingVendor) {
        await updateVendor(editingVendor.id || editingVendor._id, vendorForm);
      } else {
        await createVendor(vendorForm);
      }
      setShowAddModal(false);
      loadVendors();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Open Payment Modal
  const handleOpenPayment = (vendor, bill = null) => {
    setSelectedVendorDetail(vendor);
    setPayForm({
      amount: bill ? bill.balanceDue : vendor.outstandingBalance || '',
      paymentType: 'Bank Transfer',
      transactionReference: '',
      notes: bill ? `Payment for Bill #${bill.billNumber}` : 'Account Settlement',
      billId: bill ? bill.id || bill._id : null,
    });
    setShowPayModal(true);
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!selectedVendorDetail) return;
    setSubmitting(true);
    try {
      await recordVendorPayment(selectedVendorDetail.id || selectedVendorDetail._id, payForm);
      setShowPayModal(false);
      loadVendors();
      if (selectedVendorDetail) {
        handleOpenDetail(selectedVendorDetail);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Open Connected Inward Bill Modal for this Vendor
  const handleOpenCreateBill = (vendor) => {
    setBillVendor(vendor);
    setBillLines([
      { itemId: '', name: '', sku: '', category: '', quantity: 1, unitCost: 0, totalCost: 0 },
    ]);
    setBillMeta({
      billNumber: `BILL-${Date.now().toString(36).toUpperCase()}`,
      billDate: new Date().toISOString().split('T')[0],
      paymentType: 'Bank Transfer',
      amountPaid: '',
      transactionReference: '',
      notes: `Procurement from ${vendor.name}`,
    });
    setShowBillModal(true);
  };

  const handleLineChange = (index, field, value) => {
    const updated = [...billLines];
    if (field === 'itemId') {
      const prod = inventoryCatalog.find((p) => (p.id || p._id) === value);
      if (prod) {
        updated[index] = {
          ...updated[index],
          itemId: prod.id || prod._id,
          name: prod.name,
          sku: prod.sku,
          category: prod.category,
          unitCost: prod.unitCost || prod.price || 0,
          totalCost: (updated[index].quantity || 1) * (prod.unitCost || prod.price || 0),
        };
      }
    } else if (field === 'quantity') {
      const q = Math.max(1, Number(value) || 1);
      updated[index].quantity = q;
      updated[index].totalCost = q * (updated[index].unitCost || 0);
    } else if (field === 'unitCost') {
      const c = Math.max(0, Number(value) || 0);
      updated[index].unitCost = c;
      updated[index].totalCost = (updated[index].quantity || 1) * c;
    }
    setBillLines(updated);
  };

  const handleAddBillLine = () => {
    setBillLines([
      ...billLines,
      { itemId: '', name: '', sku: '', category: '', quantity: 1, unitCost: 0, totalCost: 0 },
    ]);
  };

  const handleRemoveBillLine = (index) => {
    if (billLines.length > 1) {
      setBillLines(billLines.filter((_, i) => i !== index));
    }
  };

  const calculatedBillTotal = billLines.reduce((s, it) => s + (Number(it.totalCost) || 0), 0);

  const handleSubmitBill = async (e) => {
    e.preventDefault();
    if (!billVendor) return;

    const validLines = billLines.filter((l) => l.itemId && l.quantity > 0);
    if (validLines.length === 0) {
      return toast.warn('Please select at least one valid inventory product.');
    }

    setSubmitting(true);
    try {
      const payload = {
        vendorId: billVendor.id || billVendor._id,
        billNumber: billMeta.billNumber,
        billDate: billMeta.billDate,
        items: validLines,
        subtotal: calculatedBillTotal,
        grandTotal: calculatedBillTotal,
        paymentType: billMeta.paymentType,
        amountPaid: billMeta.amountPaid !== '' ? Number(billMeta.amountPaid) : calculatedBillTotal,
        transactionReference: billMeta.transactionReference,
        notes: billMeta.notes,
      };

      const res = await createPurchaseBill(payload);
      if (res?.overrun) {
        // Handled by toast in service
        return;
      }

      setShowBillModal(false);
      loadVendors();
      loadCatalogAndBudget();
      if (selectedVendorDetail) {
        handleOpenDetail(selectedVendorDetail);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <Truck className="h-7 w-7 text-primary-600" />
            Vendor Management & Suppliers
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Registered educational suppliers, tax profiles, banking details, and linked purchase ledgers.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => navigate(ROUTES.INVENTORY.LIST)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-300 transition-all shadow-sm"
          >
            <Warehouse className="h-4 w-4" />
            Go to Inventory Hub
          </button>
          <button
            onClick={() => handleOpenAdd()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-500/20 active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4" />
            Onboard New Vendor
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Active Suppliers"
          value={totalVendors}
          icon={Building}
          description="Approved educational vendors"
        />
        <StatsCard
          title="Total Billed"
          value={`₹${totalBilled.toLocaleString('en-IN')}`}
          icon={Receipt}
          description="Lifetime purchase billing"
        />
        <StatsCard
          title="Total Paid"
          value={`₹${totalPaid.toLocaleString('en-IN')}`}
          icon={CheckCircle}
          description="Disbursed accounts payable"
        />
        <StatsCard
          title="Outstanding Due"
          value={`₹${outstandingBalance.toLocaleString('en-IN')}`}
          icon={CreditCard}
          description="Pending vendor settlements"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-white dark:bg-neutral-800 p-4 rounded-2xl border border-gray-200 dark:border-neutral-700 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search vendor, code, GSTIN, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl text-sm bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                Category: {c}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl text-sm bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="All">Status: All</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive</option>
            <option value="blacklisted">Blacklisted</option>
          </select>
        </div>
      </div>

      {/* Vendors Cards Grid */}
      {loading ? (
        <div className="py-16 flex justify-center">
          <Loader />
        </div>
      ) : vendors.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-neutral-800 rounded-2xl border border-gray-200 dark:border-neutral-700">
          <Truck className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">No Vendors Found</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Try adjusting your search criteria or register a new vendor.
          </p>
          <button
            onClick={() => handleOpenAdd()}
            className="mt-4 px-4 py-2 rounded-xl text-sm font-semibold bg-primary-600 hover:bg-primary-700 text-white shadow-sm inline-flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add First Vendor
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {vendors.map((vendor) => {
            const hasDue = (vendor.outstandingBalance || 0) > 0;
            return (
              <div
                key={vendor.id || vendor._id}
                className="bg-white dark:bg-neutral-800 rounded-2xl border border-gray-200 dark:border-neutral-700 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Header Card */}
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-neutral-700 text-gray-600 dark:text-gray-300">
                        {vendor.vendorCode || 'VND-000'}
                      </span>
                      <Link
                        to={`/vendors/${vendor.id || vendor._id}`}
                        className="text-base font-extrabold text-gray-900 dark:text-white mt-1.5 line-clamp-1 hover:text-primary-600 dark:hover:text-primary-400 block"
                      >
                        {vendor.name}
                      </Link>
                      <p className="text-xs text-primary-600 dark:text-primary-400 font-semibold mt-0.5">
                        {vendor.category || 'General Supplies'}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-lg text-xs font-bold">
                      <Star className="h-3 w-3 fill-amber-500" />
                      {vendor.rating || 5}.0
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="mt-4 space-y-1.5 text-xs text-gray-600 dark:text-gray-300">
                    {vendor.contactPerson && (
                      <p className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700 dark:text-gray-200">Contact:</span>
                        {vendor.contactPerson}
                      </p>
                    )}
                    {vendor.phone ? (
                      <p className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-gray-400" />
                        <span>{vendor.phone}</span>
                      </p>
                    ) : null}
                    {vendor.email ? (
                      <p className="flex items-center gap-2 truncate">
                        <Mail className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{vendor.email}</span>
                      </p>
                    ) : null}
                    {vendor.gstin ? (
                      <p className="text-[11px] text-gray-500 font-mono">
                        GSTIN: <span className="font-bold">{vendor.gstin}</span>
                      </p>
                    ) : null}
                  </div>

                  {/* Financial Balance Strip */}
                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-neutral-700/80 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-400 text-[11px] block">Total Billed</span>
                      <span className="font-bold text-gray-800 dark:text-gray-100">
                        ₹{(vendor.totalBilled || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 text-[11px] block">Outstanding Due</span>
                      <span
                        className={`font-black ${
                          hasDue ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        ₹{(vendor.outstandingBalance || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-5 pt-3 border-t border-gray-100 dark:border-neutral-700 flex items-center justify-between gap-2">
                  <Link
                    to={`/vendors/${vendor.id || vendor._id}`}
                    className="flex-1 py-1.5 px-2.5 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-neutral-700 hover:bg-gray-200 dark:hover:bg-neutral-600 text-gray-700 dark:text-gray-200 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Profile & Ledger
                  </Link>

                  <button
                    onClick={() => handleOpenCreateBill(vendor)}
                    className="py-1.5 px-2.5 rounded-xl text-xs font-semibold bg-primary-50 dark:bg-primary-950/40 hover:bg-primary-100 dark:hover:bg-primary-900/40 text-primary-600 dark:text-primary-300 flex items-center gap-1 transition-all"
                    title="Record Inward Bill / Purchase from this Vendor"
                  >
                    <ShoppingBag className="h-3.5 w-3.5" />
                    New Bill
                  </button>

                  {hasDue && (
                    <button
                      onClick={() => handleOpenPayment(vendor)}
                      className="py-1.5 px-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 shadow-sm transition-all"
                      title="Record Payment to Vendor"
                    >
                      <CreditCard className="h-3.5 w-3.5" />
                      Pay
                    </button>
                  )}

                  <button
                    onClick={() => handleOpenAdd(vendor)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-700"
                    title="Edit Vendor Coordinates"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* 1. ONBOARD / EDIT VENDOR MODAL */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={editingVendor ? 'Edit Vendor Profile' : 'Onboard New Vendor Supplier'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveVendor} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Company / Vendor Name *
              </label>
              <input
                type="text"
                required
                value={vendorForm.name}
                onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
                placeholder="e.g. Apex Stationery Mart"
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Primary Category *
              </label>
              <select
                value={vendorForm.category}
                onChange={(e) => setVendorForm({ ...vendorForm, category: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
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
                Contact Person Name
              </label>
              <input
                type="text"
                value={vendorForm.contactPerson}
                onChange={(e) => setVendorForm({ ...vendorForm, contactPerson: e.target.value })}
                placeholder="e.g. Sunil Sharma"
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Phone Number <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={vendorForm.phone}
                onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Email Address <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                type="email"
                value={vendorForm.email}
                onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })}
                placeholder="orders@vendor.com"
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Payment Terms
              </label>
              <select
                value={vendorForm.paymentTerms}
                onChange={(e) => setVendorForm({ ...vendorForm, paymentTerms: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
              >
                <option value="Immediate">Immediate / Cash</option>
                <option value="Net 15">Net 15 Days</option>
                <option value="Net 30">Net 30 Days</option>
                <option value="Net 60">Net 60 Days</option>
                <option value="Advance">Advance Payment Required</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                GSTIN (Tax ID)
              </label>
              <input
                type="text"
                value={vendorForm.gstin}
                onChange={(e) => setVendorForm({ ...vendorForm, gstin: e.target.value.toUpperCase() })}
                placeholder="07AAAAA0000A1Z5"
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                PAN Number
              </label>
              <input
                type="text"
                value={vendorForm.pan}
                onChange={(e) => setVendorForm({ ...vendorForm, pan: e.target.value.toUpperCase() })}
                placeholder="AAAAA0000A"
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white font-mono uppercase"
              />
            </div>
          </div>

          {/* Banking Details Header */}
          <div className="pt-2 border-t border-gray-200 dark:border-neutral-700">
            <h4 className="text-xs font-black uppercase text-gray-500 dark:text-gray-400 mb-2">
              Bank Coordinates for Electronic Settlements
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={vendorForm.bankDetails?.bankName || ''}
                  onChange={(e) =>
                    setVendorForm({
                      ...vendorForm,
                      bankDetails: { ...vendorForm.bankDetails, bankName: e.target.value },
                    })
                  }
                  placeholder="e.g. State Bank of India"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  value={vendorForm.bankDetails?.accountNumber || ''}
                  onChange={(e) =>
                    setVendorForm({
                      ...vendorForm,
                      bankDetails: { ...vendorForm.bankDetails, accountNumber: e.target.value },
                    })
                  }
                  placeholder="30495867123"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  IFSC Code / UPI ID
                </label>
                <input
                  type="text"
                  value={vendorForm.bankDetails?.ifscCode || ''}
                  onChange={(e) =>
                    setVendorForm({
                      ...vendorForm,
                      bankDetails: { ...vendorForm.bankDetails, ifscCode: e.target.value.toUpperCase() },
                    })
                  }
                  placeholder="SBIN0001234"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white font-mono uppercase"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Physical Street Address
            </label>
            <input
              type="text"
              value={vendorForm.address}
              onChange={(e) => setVendorForm({ ...vendorForm, address: e.target.value })}
              placeholder="e.g. 42, Educational Corridor, Daryaganj, New Delhi"
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-200 dark:border-neutral-700">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl text-sm font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-md transition-all"
            >
              {submitting ? 'Saving...' : editingVendor ? 'Update Vendor' : 'Register Vendor'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* 2. VENDOR DETAIL & FINANCIAL LEDGER MODAL */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={Boolean(selectedVendorDetail)}
        onClose={() => setSelectedVendorDetail(null)}
        title={selectedVendorDetail ? `${selectedVendorDetail.name} — Supplier Ledger` : ''}
        maxWidth="max-w-4xl"
      >
        {selectedVendorDetail && (
          <div className="space-y-6">
            {/* Top Vendor Coordinates Strip */}
            <div className="bg-gray-50 dark:bg-neutral-900 p-4 rounded-2xl border border-gray-200 dark:border-neutral-700 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-gray-400 block text-[11px]">Vendor Code & Category</span>
                <span className="font-extrabold text-sm text-gray-900 dark:text-white">
                  {selectedVendorDetail.vendorCode} • {selectedVendorDetail.category}
                </span>
                <p className="mt-1 text-gray-500">Contact: {selectedVendorDetail.contactPerson || 'N/A'}</p>
                <p className="text-gray-500">Phone: {selectedVendorDetail.phone}</p>
              </div>

              <div>
                <span className="text-gray-400 block text-[11px]">Tax & Coordinates</span>
                <p className="font-mono">GSTIN: {selectedVendorDetail.gstin || 'Unregistered'}</p>
                <p className="font-mono">PAN: {selectedVendorDetail.pan || 'N/A'}</p>
                <p className="text-gray-500 truncate mt-1">{selectedVendorDetail.address || 'Address on file'}</p>
              </div>

              <div>
                <span className="text-gray-400 block text-[11px]">Banking Settlements</span>
                <p className="font-semibold">{selectedVendorDetail.bankDetails?.bankName || 'No bank on file'}</p>
                <p className="font-mono">A/C: {selectedVendorDetail.bankDetails?.accountNumber || 'N/A'}</p>
                <p className="font-mono">IFSC: {selectedVendorDetail.bankDetails?.ifscCode || 'N/A'}</p>
              </div>
            </div>

            {/* Financial Ledger Balance Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-blue-50 dark:bg-blue-950/30 p-3.5 rounded-xl border border-blue-100 dark:border-blue-900/40">
                <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">Total Inward Billed</span>
                <p className="text-lg font-black text-blue-900 dark:text-blue-100 mt-0.5">
                  ₹{(selectedVendorDetail.totalBilled || 0).toLocaleString('en-IN')}
                </p>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-950/30 p-3.5 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Total Disbursed</span>
                <p className="text-lg font-black text-emerald-900 dark:text-emerald-100 mt-0.5">
                  ₹{(selectedVendorDetail.totalPaid || 0).toLocaleString('en-IN')}
                </p>
              </div>
              <div className="bg-rose-50 dark:bg-rose-950/30 p-3.5 rounded-xl border border-rose-100 dark:border-rose-900/40">
                <span className="text-xs text-rose-600 dark:text-rose-400 font-semibold">Outstanding Due</span>
                <p className="text-lg font-black text-rose-900 dark:text-rose-100 mt-0.5">
                  ₹{(selectedVendorDetail.outstandingBalance || 0).toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-1.5">
                <Receipt className="h-4 w-4 text-primary-600" />
                Historical Inward Bills & Purchases
              </h4>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenCreateBill(selectedVendorDetail)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white flex items-center gap-1 shadow-sm transition-all"
                >
                  <Plus className="h-3.5 w-3.5" />
                  New Purchase Bill
                </button>
                {(selectedVendorDetail.outstandingBalance || 0) > 0 && (
                  <button
                    onClick={() => handleOpenPayment(selectedVendorDetail)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 shadow-sm transition-all"
                  >
                    <CreditCard className="h-3.5 w-3.5" />
                    Record Settlement
                  </button>
                )}
              </div>
            </div>

            {/* Historical Bills Table */}
            {loadingDetail ? (
              <div className="py-8 flex justify-center">
                <Loader />
              </div>
            ) : vendorBills.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 dark:bg-neutral-900 rounded-xl text-gray-400 text-xs">
                No purchases or inward bills recorded for this vendor yet.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-neutral-700">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-300 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Bill #</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Items Count</th>
                      <th className="p-3">Grand Total</th>
                      <th className="p-3">Paid / Due</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-neutral-700">
                    {vendorBills.map((bill) => (
                      <tr key={bill.id || bill._id} className="hover:bg-gray-50 dark:hover:bg-neutral-750">
                        <td className="p-3 font-mono font-bold text-gray-900 dark:text-white">
                          {bill.billNumber}
                        </td>
                        <td className="p-3 text-gray-500">
                          {new Date(bill.billDate).toLocaleDateString('en-IN')}
                        </td>
                        <td className="p-3 text-gray-700 dark:text-gray-300">
                          {bill.items?.length || 0} line items
                        </td>
                        <td className="p-3 font-bold text-gray-900 dark:text-white">
                          ₹{(bill.grandTotal || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="p-3">
                          <span className="text-emerald-600 font-semibold">
                            ₹{(bill.amountPaid || 0).toLocaleString('en-IN')}
                          </span>{' '}
                          / <span className="text-rose-600 font-bold">₹{(bill.balanceDue || 0).toLocaleString('en-IN')}</span>
                        </td>
                        <td className="p-3">
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
                        <td className="p-3 text-right">
                          {bill.balanceDue > 0 && (
                            <button
                              onClick={() => handleOpenPayment(selectedVendorDetail, bill)}
                              className="px-2 py-1 rounded-lg text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all"
                            >
                              Pay Due
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* 3. RECORD PAYMENT TO VENDOR MODAL */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={showPayModal}
        onClose={() => setShowPayModal(false)}
        title={selectedVendorDetail ? `Record Settlement to ${selectedVendorDetail.name}` : 'Record Payment'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <div className="bg-gray-50 dark:bg-neutral-900 p-3.5 rounded-xl border border-gray-200 dark:border-neutral-700 text-xs">
            <span className="text-gray-400">Total Outstanding Balance:</span>
            <p className="text-base font-black text-rose-600 dark:text-rose-400">
              ₹{(selectedVendorDetail?.outstandingBalance || 0).toLocaleString('en-IN')}
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Payment Amount (₹) *
            </label>
            <input
              type="number"
              required
              min="1"
              value={payForm.amount}
              onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Payment Mode *
            </label>
            <select
              value={payForm.paymentType}
              onChange={(e) => setPayForm({ ...payForm, paymentType: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
            >
              <option value="Bank Transfer">Bank Transfer (NEFT / RTGS)</option>
              <option value="Cheque">Cheque</option>
              <option value="UPI">UPI / QR Code</option>
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
              onChange={(e) => setPayForm({ ...payForm, transactionReference: e.target.value })}
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
              onChange={(e) => setPayForm({ ...payForm, notes: e.target.value })}
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
              {submitting ? 'Recording...' : 'Confirm Disbursement'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* 4. CONNECTED INWARD BILL / PURCHASE MODAL (SELLER FLOW) */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={showBillModal}
        onClose={() => setShowBillModal(false)}
        title={billVendor ? `Record Inward Bill & PO from ${billVendor.name}` : 'New Purchase Bill'}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSubmitBill} className="space-y-4">
          {/* Live Budget Overrun Warning Banner */}
          {budgetHealth && (
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center justify-between text-xs">
              <div>
                <span className="font-extrabold text-blue-900 dark:text-blue-200">
                  Active Session School Requirements Budget:
                </span>{' '}
                <span className="font-bold text-blue-700 dark:text-blue-300">
                  ₹{budgetHealth.remainingBudget.toLocaleString('en-IN')} remaining
                </span>{' '}
                (out of ₹{budgetHealth.schoolRequirementsBudget.toLocaleString('en-IN')})
              </div>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-bold text-[10px]">
                {budgetHealth.percentUsed}% Utilized
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Vendor Bill / Invoice # *
              </label>
              <input
                type="text"
                required
                value={billMeta.billNumber}
                onChange={(e) => setBillMeta({ ...billMeta, billNumber: e.target.value })}
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
                onChange={(e) => setBillMeta({ ...billMeta, billDate: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Payment Method
              </label>
              <select
                value={billMeta.paymentType}
                onChange={(e) => setBillMeta({ ...billMeta, paymentType: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
              >
                <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                <option value="Cheque">Cheque</option>
                <option value="UPI">UPI</option>
                <option value="Cash">Cash</option>
                <option value="Credit / On Account">Deferred Credit / On Account</option>
              </select>
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
                onClick={handleAddBillLine}
                className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Product Row
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
                      onChange={(e) => handleLineChange(idx, 'itemId', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
                    >
                      <option value="">Select Inventory Item...</option>
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
                      onChange={(e) => handleLineChange(idx, 'quantity', e.target.value)}
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
                      onChange={(e) => handleLineChange(idx, 'unitCost', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white font-mono text-right"
                    />
                  </div>

                  <div className="w-28 text-right font-extrabold text-xs text-gray-900 dark:text-white">
                    ₹{(line.totalCost || 0).toLocaleString('en-IN')}
                  </div>

                  {billLines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveBillLine(idx)}
                      className="p-1 text-gray-400 hover:text-rose-600 rounded"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Grand Total & Budget Interceptor Alert */}
          <div className="flex justify-between items-center p-3.5 rounded-xl bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700">
            <span className="text-sm font-extrabold text-gray-800 dark:text-gray-200">
              Total Purchase Value:
            </span>
            <span className="text-lg font-black text-primary-600 dark:text-primary-400">
              ₹{calculatedBillTotal.toLocaleString('en-IN')}
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
              {submitting ? 'Recording Purchase...' : 'Authorize Purchase & Stock In'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

