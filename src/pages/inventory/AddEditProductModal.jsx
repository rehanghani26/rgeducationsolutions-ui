import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Check,
  Package,
  Upload,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  File,
  X,
  Calendar,
  Truck,
  Calculator,
  Sparkles,
  ShoppingBag,
  Building2,
  CheckCircle2,
  AlertCircle,
  FolderOpen,
  LayoutGrid,
  Table as TableIcon,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'react-toastify';
import Modal from '../../components/ui/Modal.jsx';
import {
  SCHOOL_PRODUCT_CATALOG,
  INVENTORY_CATEGORIES,
  INVENTORY_CATEGORY_FILTER_OPTIONS,
  INVENTORY_UNIT_OPTIONS,
  GST_RATE_OPTIONS,
  INVOICE_PDF_ACCEPT,
  ADDITIONAL_ATTACHMENT_ACCEPT,
  CATEGORY_FALLBACK_IMAGES,
  getSchoolProductImage,
  createBlankProductItem,
} from '../../constants';
import { formatCurrency, dateOnly } from '../../utils';
import {
  createBulkInventoryItems,
  updateInventoryItem,
  uploadInventoryFiles,
} from '../../services/inventoryService.js';

// Category color & icon mapping
const CATEGORY_META = {
  Stationery: { icon: '✏️', badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800' },
  'Lab Equipment': { icon: '🔬', badge: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800' },
  'Computers & IT': { icon: '💻', badge: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800' },
  'Sports Items': { icon: '⚽', badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' },
  'Uniforms & Badges': { icon: '👔', badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' },
  'Medical & First Aid': { icon: '🩺', badge: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800' },
  Furniture: { icon: '🪑', badge: 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200 dark:border-orange-800' },
  'Books & Publications': { icon: '📚', badge: 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800' },
  'Maintenance & Facilities': { icon: '🧹', badge: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700' },
  General: { icon: '📦', badge: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800' },
};

const formatBytes = (bytes = 0) => {
  if (!bytes) return '0 KB';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const getFileBadge = (name = '') => {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  if (ext === 'pdf') {
    return { label: 'PDF', Icon: FileText, cls: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800' };
  }
  if (['xlsx', 'xls', 'csv'].includes(ext)) {
    return { label: ext.toUpperCase(), Icon: FileSpreadsheet, cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' };
  }
  if (ext === 'psd') {
    return { label: 'PSD', Icon: ImageIcon, cls: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' };
  }
  if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) {
    return { label: ext.toUpperCase(), Icon: ImageIcon, cls: 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800' };
  }
  return { label: ext.toUpperCase() || 'FILE', Icon: File, cls: 'bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-gray-300 border-gray-200 dark:border-neutral-700' };
};

const calcLineTotals = (item) => {
  const qty = Math.max(0, Number(item.quantity) || 0);
  const unitPrice = Math.max(0, Number(item.unitCost) || 0);
  const gstRate = Math.max(0, Number(item.gstRate) || 0);
  const base = qty * unitPrice;
  const gstAmount = (base * gstRate) / 100;
  return {
    base,
    gstAmount,
    total: base + gstAmount,
  };
};

export default function AddEditProductModal({
  isOpen,
  onClose,
  editingItem = null,
  vendorsList = [],
  onSuccess,
}) {
  const isEdit = Boolean(editingItem);

  // Active view tab on the left/main pane: 'catalog' | 'table'
  const [activeViewTab, setActiveViewTab] = useState('catalog');

  // Catalog browser state (Add mode)
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogCategory, setCatalogCategory] = useState('All');

  // Selected / editable product rows
  const [selectedItems, setSelectedItems] = useState([]);

  // Shared procurement & delivery metadata
  const [meta, setMeta] = useState({
    vendorId: '',
    actualPurchaseDate: dateOnly(new Date()),
    expectedDeliveryDate: '',
    shippingCharges: 0,
    otherCharges: 0,
  });

  // Attachments state
  const [invoiceFile, setInvoiceFile] = useState(null);
  const [existingInvoice, setExistingInvoice] = useState(null);
  const [additionalFiles, setAdditionalFiles] = useState([]);
  const [existingAdditional, setExistingAdditional] = useState([]);

  const [submitting, setSubmitting] = useState(false);

  // Initialize modal state on open
  useEffect(() => {
    if (!isOpen) return;

    setCatalogSearch('');
    setCatalogCategory('All');
    setInvoiceFile(null);
    setAdditionalFiles([]);

    if (editingItem) {
      setActiveViewTab('table');
      if (Array.isArray(editingItem.items) && editingItem.items.length > 0) {
        setSelectedItems(
          editingItem.items.map((it) =>
            createBlankProductItem({
              ...it,
              imageUrl: it.imageUrl || getSchoolProductImage(it),
              gstRate: it.gstRate ?? 12,
              vendorId: editingItem.vendorId?._id || editingItem.vendorId?.id || editingItem.vendorId || '',
            })
          )
        );
      } else {
        setSelectedItems([
          createBlankProductItem({
            ...editingItem,
            imageUrl: editingItem.imageUrl || getSchoolProductImage(editingItem),
            gstRate: editingItem.gstRate ?? 12,
            vendorId: editingItem.vendorId?._id || editingItem.vendorId?.id || editingItem.vendorId || '',
          }),
        ]);
      }
      setMeta({
        vendorId: editingItem.vendorId?._id || editingItem.vendorId?.id || editingItem.vendorId || '',
        actualPurchaseDate: dateOnly(editingItem.actualPurchaseDate) || '',
        expectedDeliveryDate: dateOnly(editingItem.expectedDeliveryDate) || '',
        shippingCharges: Number(editingItem.shippingCharges) || 0,
        otherCharges: Number(editingItem.otherCharges) || 0,
      });
      setExistingInvoice(editingItem.invoiceAttachment?.url ? editingItem.invoiceAttachment : null);
      setExistingAdditional(
        Array.isArray(editingItem.additionalAttachments) ? editingItem.additionalAttachments : []
      );
    } else {
      setActiveViewTab('catalog');
      setSelectedItems([]);
      setMeta({
        vendorId: '',
        actualPurchaseDate: dateOnly(new Date()),
        expectedDeliveryDate: '',
        shippingCharges: 0,
        otherCharges: 0,
      });
      setExistingInvoice(null);
      setExistingAdditional([]);
    }
  }, [isOpen, editingItem]);

  // Filtered 117+ school product catalog
  const filteredCatalog = useMemo(() => {
    const q = catalogSearch.trim().toLowerCase();
    return SCHOOL_PRODUCT_CATALOG.filter((p) => {
      const matchCat = catalogCategory === 'All' || p.category === catalogCategory;
      if (!matchCat) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.subcategory.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.skuPrefix.toLowerCase().includes(q)
      );
    });
  }, [catalogSearch, catalogCategory]);

  const selectedCatalogMap = useMemo(() => {
    const map = new Map();
    selectedItems.forEach((item) => {
      if (item.catalogId) map.set(item.catalogId, item);
    });
    return map;
  }, [selectedItems]);

  // Toggle or add item from catalog
  const handleAddFromCatalog = (preset) => {
    const existing = selectedCatalogMap.get(preset.id);
    if (existing) {
      // Increment quantity if already added
      setSelectedItems((prev) =>
        prev.map((item) =>
          item.catalogId === preset.id
            ? { ...item, quantity: Number(item.quantity || 0) + 1 }
            : item
        )
      );
    } else {
      const suffix = Math.random().toString(36).slice(2, 5).toUpperCase();
      setSelectedItems((prev) => [
        ...prev,
        createBlankProductItem({
          catalogId: preset.id,
          name: preset.name,
          sku: `${preset.skuPrefix}-${suffix}`,
          imageUrl: preset.imageUrl || getSchoolProductImage(preset),
          category: preset.category,
          subcategory: preset.subcategory,
          unit: preset.unit,
          description: preset.description,
          quantity: 1,
          unitCost: preset.unitPrice,
          price: preset.unitPrice,
          gstRate: preset.gstRate,
        }),
      ]);
    }
  };

  const handleDecrementCatalog = (presetId) => {
    setSelectedItems((prev) =>
      prev
        .map((item) => {
          if (item.catalogId === presetId) {
            const nextQty = Number(item.quantity || 1) - 1;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const handleAddCustomProduct = () => {
    setSelectedItems((prev) => [...prev, createBlankProductItem()]);
    setActiveViewTab('table');
  };

  const handleUpdateItem = (index, field, value) => {
    setSelectedItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        const updated = { ...item, [field]: value };
        if (field === 'unitCost' && (!item.price || Number(item.price) === Number(item.unitCost))) {
          updated.price = value;
        }
        return updated;
      })
    );
  };

  const handleRemoveItem = (index) => {
    setSelectedItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Order totals calculation
  const totals = useMemo(() => {
    const itemStats = selectedItems.reduce(
      (acc, item) => {
        const { base, gstAmount } = calcLineTotals(item);
        acc.subtotal += base;
        acc.totalGst += gstAmount;
        acc.totalUnits += Math.max(0, Number(item.quantity) || 0);
        return acc;
      },
      { subtotal: 0, totalGst: 0, totalUnits: 0 }
    );
    const shipping = Math.max(0, Number(meta.shippingCharges) || 0);
    const other = Math.max(0, Number(meta.otherCharges) || 0);
    const grandTotal = itemStats.subtotal + itemStats.totalGst + shipping + other;
    return {
      subtotal: itemStats.subtotal,
      totalGst: itemStats.totalGst,
      totalUnits: itemStats.totalUnits,
      shipping,
      other,
      grandTotal,
    };
  }, [selectedItems, meta.shippingCharges, meta.otherCharges]);

  // Category item counts for filter pills
  const categoryCounts = useMemo(() => {
    const counts = { All: SCHOOL_PRODUCT_CATALOG.length };
    SCHOOL_PRODUCT_CATALOG.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, []);

  // Form submission with imageUrl stored in database
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedItems.length === 0) {
      return toast.warn('Please select at least one product or add a custom product.');
    }

    for (let i = 0; i < selectedItems.length; i += 1) {
      const row = selectedItems[i];
      if (!row.name.trim() || !row.sku.trim() || !row.category) {
        return toast.warn(`Product #${i + 1}: Name, SKU, and Category are required.`);
      }
    }

    setSubmitting(true);
    try {
      // Upload invoice PDF if selected
      let uploadedInvoice = existingInvoice;
      if (invoiceFile) {
        const res = await uploadInventoryFiles([invoiceFile]);
        if (res[0]) uploadedInvoice = res[0];
      }

      // Upload additional files (PDF, PSD, Excel, images, docs)
      let uploadedAdditional = [...existingAdditional];
      if (additionalFiles.length > 0) {
        const res = await uploadInventoryFiles(additionalFiles);
        uploadedAdditional = [...uploadedAdditional, ...res];
      }

      const payloadItems = selectedItems.map((row) => {
        const { gstAmount, total } = calcLineTotals(row);
        return {
          name: row.name.trim(),
          sku: row.sku.trim().toUpperCase(),
          imageUrl: row.imageUrl || getSchoolProductImage(row),
          description: (row.description || '').trim(),
          category: row.category,
          subcategory: (row.subcategory || '').trim(),
          unit: row.unit,
          quantity: Number(row.quantity) || 0,
          unitCost: Number(row.unitCost) || 0,
          price: Number(row.price) || Number(row.unitCost) || 0,
          gstRate: Number(row.gstRate) || 0,
          gstAmount,
          totalCostWithTax: total,
          minStockLevel: Number(row.minStockLevel) || 5,
          maxStockLevel: Number(row.maxStockLevel) || 500,
          reorderQuantity: Number(row.reorderQuantity) || 20,
          location: row.location || 'Main Store',
        };
      });

      const totalUnits = payloadItems.reduce((s, it) => s + it.quantity, 0);
      const subtotal = payloadItems.reduce((s, it) => s + it.quantity * it.unitCost, 0);
      const totalGst = payloadItems.reduce((s, it) => s + it.gstAmount, 0);
      const numShipping = Math.max(0, Number(meta.shippingCharges) || 0);
      const numOther = Math.max(0, Number(meta.otherCharges) || 0);
      const grandTotal = subtotal + totalGst + numShipping + numOther;

      const primaryName =
        payloadItems.length === 1
          ? payloadItems[0].name
          : payloadItems.length === 2
          ? `${payloadItems[0].name} & ${payloadItems[1].name}`
          : `${payloadItems[0].name} (+${payloadItems.length - 1} items)`;

      if (isEdit) {
        await updateInventoryItem(editingItem.id || editingItem._id, {
          name: primaryName,
          items: payloadItems,
          itemCount: payloadItems.length,
          quantity: totalUnits,
          totalQuantity: totalUnits,
          subtotal,
          totalGst,
          grandTotal,
          totalCostWithTax: grandTotal,
          unitCost: subtotal,
          price: subtotal,
          shippingCharges: numShipping,
          otherCharges: numOther,
          vendorId: meta.vendorId || undefined,
          actualPurchaseDate: meta.actualPurchaseDate || null,
          expectedDeliveryDate: meta.expectedDeliveryDate || null,
          invoiceAttachment: uploadedInvoice || undefined,
          additionalAttachments: uploadedAdditional,
          imageUrl: payloadItems[0]?.imageUrl || editingItem.imageUrl,
          category: payloadItems[0]?.category || editingItem.category,
        });
      } else {
        await createBulkInventoryItems({
          items: payloadItems,
          vendorId: meta.vendorId || undefined,
          actualPurchaseDate: meta.actualPurchaseDate || null,
          expectedDeliveryDate: meta.expectedDeliveryDate || null,
          shippingCharges: numShipping,
          otherCharges: numOther,
          invoiceAttachment: uploadedInvoice || undefined,
          additionalAttachments: uploadedAdditional,
        });
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Failed to save inventory product(s):', err);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedVendor = useMemo(() => {
    return vendorsList.find((v) => (v.id || v._id) === meta.vendorId) || null;
  }, [vendorsList, meta.vendorId]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      maxWidth="max-w-[99vw] sm:max-w-[98vw] w-[98vw] h-[95vh] sm:h-[94vh]"
      noPadding={true}
      bodyClassName="p-0 overflow-hidden flex flex-col flex-1"
      title={
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              {isEdit ? 'Edit Inventory Product' : 'Add New Inventory Products'}
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <Sparkles className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                Amazon & Flipkart Intake
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Browse 117+ school supplies with real photos, configure multi-product quantities & GST, inspect live billing table & store to DB.
            </p>
          </div>
        </div>
      }
      headerActions={
        <div className="flex items-center gap-2.5">
          <div className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
            <span className="text-slate-500 dark:text-slate-400">Cart Total:</span>
            <span className="font-extrabold text-slate-900 dark:text-white">
              {selectedItems.length} Products ({totals.totalUnits} Units)
            </span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="font-black text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totals.grandTotal)}
            </span>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row h-full overflow-hidden bg-white dark:bg-slate-950">
        {/* ══════════════════════════════════════════════════════════════════════════ */}
        {/* LEFT / MAIN COLUMN: CATALOG BROWSER & SELECTED PRODUCTS TABLE           */}
        {/* ══════════════════════════════════════════════════════════════════════════ */}
        <div className="flex-1 lg:w-7/12 xl:w-7.5/12 flex flex-col h-full overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          {/* ─── 1. TOP VIEW SWITCHER TABS ───────────────────────────────────────── */}
          {!isEdit && (
            <div className="px-4 py-2.5 sm:px-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 flex flex-wrap items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-200/70 dark:bg-slate-800 border border-slate-300/80 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setActiveViewTab('catalog')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeViewTab === 'catalog'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-black'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <LayoutGrid className="h-3.5 w-3.5 text-primary-600 dark:text-primary-400" />
                  <span>Browse School Catalog ({filteredCatalog.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveViewTab('table')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeViewTab === 'table'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-black'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <TableIcon className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Selected Products Table</span>
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                      selectedItems.length > 0
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {selectedItems.length}
                  </span>
                </button>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddCustomProduct}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 shadow-xs transition-all"
                >
                  <Plus className="h-3.5 w-3.5 text-primary-600" />
                  + Custom Product
                </button>

                {selectedItems.length > 0 && activeViewTab === 'catalog' && (
                  <button
                    type="button"
                    onClick={() => setActiveViewTab('table')}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all"
                  >
                    <span>View Table ({selectedItems.length})</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ─── 2. SEARCH & CATEGORY PILLS (ONLY IN CATALOG MODE) ───────────────── */}
          {!isEdit && activeViewTab === 'catalog' && (
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-3 shrink-0">
              {/* Search Bar */}
              <div className="relative">
                <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  placeholder="Search 117+ school supplies (e.g. A4 paper, microscope, football, desk, uniform tie, beaker)..."
                  className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 shadow-xs focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
                {catalogSearch && (
                  <button
                    type="button"
                    onClick={() => setCatalogSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Amazon / Flipkart Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
                {INVENTORY_CATEGORY_FILTER_OPTIONS.map((cat) => {
                  const meta = CATEGORY_META[cat];
                  const isSelected = catalogCategory === cat;
                  const count = categoryCounts[cat] || 0;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCatalogCategory(cat)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-all border shrink-0 text-xs ${
                        isSelected
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/20'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <span>{meta?.icon || '🏷️'}</span>
                      <span>{cat}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Live Selection Notification Strip */}
              {selectedItems.length > 0 && (
                <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 shadow-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-7 w-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <Check className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-black text-slate-900 dark:text-white block truncate">
                        {selectedItems.length} Products in order ({totals.totalUnits} Units) • Subtotal: {formatCurrency(totals.grandTotal)}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                        Switch to table view anytime to inspect per-item billing, GST rates, or add storage locations.
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveViewTab('table')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all shrink-0"
                  >
                    <span>Inspect Table</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ─── 3. SCROLLABLE MAIN CONTENT AREA ─────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* ═══════════════════════════════════════════════════════════════════ */}
            {/* VIEW A: REAL PRODUCT PHOTO CATALOG GRID                             */}
            {/* ═══════════════════════════════════════════════════════════════════ */}
            {!isEdit && activeViewTab === 'catalog' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    School Inventory Catalog ({filteredCatalog.length} products)
                  </h3>
                  {selectedItems.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedItems([])}
                      className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline"
                    >
                      Clear Selection ({selectedItems.length})
                    </button>
                  )}
                </div>

                {filteredCatalog.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/30">
                    No products found matching "{catalogSearch}". Try another search term or click "+ Custom Product".
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3.5">
                    {filteredCatalog.map((preset) => {
                      const selectedItem = selectedCatalogMap.get(preset.id);
                      const isAdded = Boolean(selectedItem);
                      const meta = CATEGORY_META[preset.category];
                      const productImg = preset.imageUrl || getSchoolProductImage(preset);

                      return (
                        <div
                          key={preset.id}
                          className={`group relative rounded-2xl border flex flex-col justify-between overflow-hidden transition-all duration-200 ${
                            isAdded
                              ? 'border-emerald-500/80 bg-emerald-50/30 dark:bg-emerald-950/20 ring-1 ring-emerald-500/40 shadow-sm'
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md'
                          }`}
                        >
                          {/* Real Product Image Header */}
                          <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                            <img
                              src={productImg}
                              alt={preset.name}
                              loading="lazy"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src =
                                  CATEGORY_FALLBACK_IMAGES[preset.category] || CATEGORY_FALLBACK_IMAGES.General;
                              }}
                            />
                            {/* Overlay Subcategory Badge */}
                            <div className="absolute top-2 left-2">
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-md backdrop-blur-md bg-slate-900/80 text-white border border-white/20 shadow-xs">
                                {preset.subcategory || preset.category}
                              </span>
                            </div>

                            {/* In-Cart Badge */}
                            {isAdded && (
                              <div className="absolute top-2 right-2">
                                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-md flex items-center gap-1">
                                  <Check className="h-2.5 w-2.5" /> {selectedItem.quantity} In Order
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Card Info Body */}
                          <div className="p-3.5 flex flex-col justify-between flex-1">
                            <div>
                              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                {preset.name}
                              </h4>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                                {preset.description}
                              </p>
                            </div>

                            {/* Flipkart / Amazon Pricing & Stepper */}
                            <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                              <div>
                                <div className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                                  {formatCurrency(preset.unitPrice)}
                                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 ml-1">
                                    / {preset.unit}
                                  </span>
                                </div>
                                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 block">
                                  GST {preset.gstRate}%
                                </span>
                              </div>

                              {isAdded ? (
                                <div className="flex items-center rounded-xl bg-emerald-600 text-white font-extrabold text-xs shadow-xs overflow-hidden shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => handleDecrementCatalog(preset.id)}
                                    className="px-2 py-1.5 hover:bg-emerald-700 active:bg-emerald-800 transition-colors"
                                    title="Reduce quantity"
                                  >
                                    <Minus className="h-3.5 w-3.5" />
                                  </button>
                                  <span className="px-2 font-mono text-xs font-black min-w-[24px] text-center">
                                    {selectedItem.quantity}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleAddFromCatalog(preset)}
                                    className="px-2 py-1.5 hover:bg-emerald-700 active:bg-emerald-800 transition-colors"
                                    title="Add another"
                                  >
                                    <Plus className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleAddFromCatalog(preset)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-emerald-600 dark:hover:bg-emerald-500 dark:hover:text-white shadow-xs transition-all shrink-0"
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                  Add
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════════ */}
            {/* VIEW B: TOTAL SELECTED PRODUCTS TABLE & LIVE BILLING DETAILS        */}
            {/* ═══════════════════════════════════════════════════════════════════ */}
            {(isEdit || activeViewTab === 'table') && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                      <TableIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                        {isEdit ? 'Product Configuration' : `Total Selected Products in Table (${selectedItems.length})`}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Adjust real item quantities, unit prices, GST slabs, and storage racks.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isEdit && (
                      <button
                        type="button"
                        onClick={() => setActiveViewTab('catalog')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                        <LayoutGrid className="h-3.5 w-3.5 text-primary-600" />
                        + Add From Catalog
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleAddCustomProduct}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5 text-emerald-600" />
                      + Custom Row
                    </button>
                    {selectedItems.length > 0 && !isEdit && (
                      <button
                        type="button"
                        onClick={() => setSelectedItems([])}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Clear all selected products"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Clear All
                      </button>
                    )}
                  </div>
                </div>

                {selectedItems.length === 0 ? (
                  <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-12 text-center space-y-3 bg-slate-50/50 dark:bg-slate-900/30">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                      <ShoppingBag className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        No products added to this order yet
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-0.5">
                        Click "+ Add" on any school catalog product above or click below to enter custom supplies.
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setActiveViewTab('catalog')}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                      >
                        <LayoutGrid className="h-3.5 w-3.5" />
                        Browse 117+ Catalog Items
                      </button>
                      <button
                        type="button"
                        onClick={handleAddCustomProduct}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add Custom Row
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[780px]">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-950/90 border-b border-slate-200 dark:border-slate-800 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            <th className="py-3 px-3.5 w-12 text-center">#</th>
                            <th className="py-3 px-3.5 min-w-[260px]">Product / Real Photo</th>
                            <th className="py-3 px-3 w-28">Unit</th>
                            <th className="py-3 px-3 w-36 text-center">Quantity</th>
                            <th className="py-3 px-3 w-32">Unit Cost (₹)</th>
                            <th className="py-3 px-3 w-28">GST %</th>
                            <th className="py-3 px-3.5 w-36 text-right">Line Total (₹)</th>
                            <th className="py-3 px-2 w-12 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                          {selectedItems.map((item, idx) => {
                            const line = calcLineTotals(item);
                            const catMeta = CATEGORY_META[item.category];
                            const productImg = item.imageUrl || getSchoolProductImage(item);

                            return (
                              <tr
                                key={`${item.catalogId || 'row'}-${idx}`}
                                className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                              >
                                {/* # */}
                                <td className="py-3 px-3.5 text-center font-bold text-slate-400">
                                  {idx + 1}
                                </td>

                                {/* Product Details with Real Image Thumbnail */}
                                <td className="py-3 px-3.5">
                                  <div className="flex items-center gap-3">
                                    <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0 shadow-xs">
                                      <img
                                        src={productImg}
                                        alt={item.name}
                                        loading="lazy"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          e.currentTarget.onerror = null;
                                          e.currentTarget.src =
                                            CATEGORY_FALLBACK_IMAGES[item.category] || CATEGORY_FALLBACK_IMAGES.General;
                                        }}
                                      />
                                    </div>
                                    <div className="min-w-0 flex-1 space-y-1">
                                      <input
                                        type="text"
                                        required
                                        value={item.name}
                                        onChange={(e) => handleUpdateItem(idx, 'name', e.target.value)}
                                        placeholder="Product Name"
                                        className="w-full font-bold text-xs text-slate-900 dark:text-white bg-transparent border-0 border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-emerald-500 focus:ring-0 p-0"
                                      />
                                      <div className="flex flex-wrap items-center gap-1.5">
                                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                          {item.sku}
                                        </span>
                                        <span
                                          className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border ${
                                            catMeta?.badge || 'bg-slate-100 text-slate-700 border-slate-200'
                                          }`}
                                        >
                                          {item.category}
                                        </span>
                                        {item.subcategory && (
                                          <span className="text-[10px] text-slate-400">
                                            • {item.subcategory}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </td>

                                {/* Unit */}
                                <td className="py-3 px-3">
                                  <select
                                    value={item.unit}
                                    onChange={(e) => handleUpdateItem(idx, 'unit', e.target.value)}
                                    className="w-full px-2 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold"
                                  >
                                    {INVENTORY_UNIT_OPTIONS.map((u) => (
                                      <option key={u.value} value={u.value}>
                                        {u.label}
                                      </option>
                                    ))}
                                  </select>
                                </td>

                                {/* Quantity with Stepper */}
                                <td className="py-3 px-3">
                                  <div className="flex items-center rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 overflow-hidden shadow-xs">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleUpdateItem(idx, 'quantity', Math.max(1, (Number(item.quantity) || 1) - 1))
                                      }
                                      className="px-2 py-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                                      title="Decrease quantity"
                                    >
                                      <Minus className="h-3 w-3" />
                                    </button>
                                    <input
                                      type="number"
                                      min="1"
                                      required
                                      value={item.quantity}
                                      onChange={(e) => handleUpdateItem(idx, 'quantity', e.target.value)}
                                      className="w-full text-center px-1 py-1 text-xs bg-transparent border-0 font-black text-slate-900 dark:text-white focus:ring-0"
                                    />
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleUpdateItem(idx, 'quantity', (Number(item.quantity) || 0) + 1)
                                      }
                                      className="px-2 py-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                                      title="Increase quantity"
                                    >
                                      <Plus className="h-3 w-3" />
                                    </button>
                                  </div>
                                </td>

                                {/* Unit Cost */}
                                <td className="py-3 px-3">
                                  <div className="relative">
                                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                                      ₹
                                    </span>
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      required
                                      value={item.unitCost}
                                      onChange={(e) => handleUpdateItem(idx, 'unitCost', e.target.value)}
                                      className="w-full pl-6 pr-2 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-black"
                                    />
                                  </div>
                                </td>

                                {/* GST Rate */}
                                <td className="py-3 px-3">
                                  <select
                                    value={item.gstRate}
                                    onChange={(e) => handleUpdateItem(idx, 'gstRate', Number(e.target.value))}
                                    className="w-full px-2 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-bold"
                                  >
                                    {GST_RATE_OPTIONS.map((g) => (
                                      <option key={g.value} value={g.value}>
                                        {g.label}
                                      </option>
                                    ))}
                                  </select>
                                </td>

                                {/* Line Total */}
                                <td className="py-3 px-3.5 text-right">
                                  <div className="font-black text-sm text-emerald-600 dark:text-emerald-400">
                                    {formatCurrency(line.total)}
                                  </div>
                                  <div className="text-[10px] text-slate-400">
                                    Base: {formatCurrency(line.base)} + GST: {formatCurrency(line.gstAmount)}
                                  </div>
                                </td>

                                {/* Action */}
                                <td className="py-3 px-2 text-center">
                                  {!isEdit && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveItem(idx)}
                                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                                      title="Remove item"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>

                        {/* Table Footer Summary Row */}
                        <tfoot>
                          <tr className="bg-slate-100/90 dark:bg-slate-950 border-t-2 border-slate-200 dark:border-slate-800 text-xs font-black">
                            <td colSpan="3" className="py-3 px-3.5 text-slate-700 dark:text-slate-300">
                              Total Products: <span className="text-emerald-600 dark:text-emerald-400">{selectedItems.length} items</span>
                            </td>
                            <td className="py-3 px-3 text-center text-slate-800 dark:text-slate-200">
                              {totals.totalUnits} Units
                            </td>
                            <td className="py-3 px-3 text-slate-500">
                              Subtotal:
                            </td>
                            <td className="py-3 px-3 text-amber-600 dark:text-amber-400 font-bold">
                              +{formatCurrency(totals.totalGst)}
                            </td>
                            <td className="py-3 px-3.5 text-right text-emerald-600 dark:text-emerald-400 text-base">
                              {formatCurrency(totals.grandTotal)}
                            </td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════════ */}
        {/* RIGHT SIDEBAR: AMAZON / FLIPKART STYLE PROCUREMENT & PRICE SUMMARY      */}
        {/* ══════════════════════════════════════════════════════════════════════════ */}
        <div className="w-full lg:w-5/12 xl:w-4.5/12 flex flex-col h-full bg-slate-50/90 dark:bg-slate-950/70 shrink-0 overflow-y-auto border-t lg:border-t-0">
          <div className="p-4 sm:p-5 space-y-4 flex-1">
            {/* ─── 1. FLIPKART / AMAZON "PRICE DETAILS" CARD ─────────────────────── */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Calculator className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  Price Details ({selectedItems.length} Products)
                </h3>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  {totals.totalUnits} Units
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                  <span>Price (Base Subtotal)</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formatCurrency(totals.subtotal)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    GST Tax Total
                    <span className="text-[10px] text-amber-500 font-bold">●</span>
                  </span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    +{formatCurrency(totals.totalGst)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Truck className="h-3 w-3" /> Delivery / Shipping
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {totals.shipping > 0 ? `+${formatCurrency(totals.shipping)}` : 'FREE'}
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                  <span>Other Handling Charges</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {totals.other > 0 ? `+${formatCurrency(totals.other)}` : '₹0'}
                  </span>
                </div>

                {/* Grand Total Bar */}
                <div className="pt-3 border-t border-dashed border-slate-200 dark:border-slate-700 flex justify-between items-baseline">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white block">
                      Total Order Amount
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                      ✓ Tax Invoice & Ledger Compliant
                    </span>
                  </div>
                  <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(totals.grandTotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* ─── 2. PROCUREMENT & DATES CARD ──────────────────────────────────── */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3.5 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-primary-600 dark:text-primary-400" />
                  Procurement & Vendor
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                {/* Vendor Selector */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Primary Supplier Vendor
                  </label>
                  <select
                    value={meta.vendorId}
                    onChange={(e) => setMeta({ ...meta, vendorId: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="">Select Vendor...</option>
                    {vendorsList.map((v) => (
                      <option key={v.id || v._id} value={v.id || v._id}>
                        {v.name} ({v.vendorCode || 'Vendor'})
                      </option>
                    ))}
                  </select>
                  {selectedVendor && (
                    <div className="mt-1 text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <span>GSTIN: {selectedVendor.taxId || 'N/A'}</span>
                      <span>•</span>
                      <span>{selectedVendor.category || 'General'}</span>
                    </div>
                  )}
                </div>

                {/* Purchase & Expected Delivery Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 flex items-center justify-between">
                      <span>Purchase Date</span>
                      <button
                        type="button"
                        onClick={() => setMeta({ ...meta, actualPurchaseDate: dateOnly(new Date()) })}
                        className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                      >
                        Today
                      </button>
                    </label>
                    <input
                      type="date"
                      value={meta.actualPurchaseDate}
                      onChange={(e) => setMeta({ ...meta, actualPurchaseDate: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                      Expected Delivery
                    </label>
                    <input
                      type="date"
                      value={meta.expectedDeliveryDate}
                      onChange={(e) => setMeta({ ...meta, expectedDeliveryDate: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Shipping & Other Charges Inputs */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                      Shipping / Freight (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={meta.shippingCharges}
                      onChange={(e) => setMeta({ ...meta, shippingCharges: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                      Other Charges (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={meta.otherCharges}
                      onChange={(e) => setMeta({ ...meta, otherCharges: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ─── 3. ATTACH INVOICE (PDF) & SUPPORTING FILES (PSD/XL/DOC) ──────── */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3.5 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-rose-500" />
                  Invoice PDF & Attachments
                </h3>
              </div>

              {/* Invoice PDF Upload Box */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5 text-rose-500" />
                    Vendor Invoice (PDF)
                  </span>
                  <label className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors">
                    <Upload className="h-3 w-3" />
                    Browse PDF
                    <input
                      type="file"
                      accept={INVOICE_PDF_ACCEPT}
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) setInvoiceFile(f);
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>

                {invoiceFile || existingInvoice ? (
                  <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-200">
                        PDF
                      </span>
                      <span className="truncate font-semibold text-slate-800 dark:text-slate-200 text-xs">
                        {invoiceFile ? invoiceFile.name : existingInvoice.originalName || existingInvoice.filename}
                      </span>
                      <span className="text-[10px] text-slate-500 shrink-0">
                        {formatBytes(invoiceFile ? invoiceFile.size : existingInvoice.size)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setInvoiceFile(null);
                        setExistingInvoice(null);
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-[11px] text-slate-400 bg-slate-50 dark:bg-slate-950">
                    No vendor invoice PDF attached.
                  </div>
                )}
              </div>

              {/* Additional Files (PSD, Excel, Docs, Images) */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <FolderOpen className="h-3.5 w-3.5 text-indigo-500" />
                    Additional Files (PSD, XL, Docs, Images)
                  </span>
                  <label className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors">
                    <Plus className="h-3 w-3" />
                    Add Files
                    <input
                      type="file"
                      multiple
                      accept={ADDITIONAL_ATTACHMENT_ACCEPT}
                      className="hidden"
                      onChange={(e) => {
                        const picked = Array.from(e.target.files || []);
                        if (picked.length > 0) {
                          setAdditionalFiles((prev) => [...prev, ...picked]);
                        }
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>

                {additionalFiles.length === 0 && existingAdditional.length === 0 ? (
                  <div className="p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-[11px] text-slate-400 bg-slate-50 dark:bg-slate-950">
                    Supports .pdf, .psd, .xlsx, .xls, .csv, .doc, .docx, images
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {existingAdditional.map((att, i) => {
                      const badge = getFileBadge(att.originalName || att.filename);
                      return (
                        <div
                          key={`existing-${i}`}
                          className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-black border ${badge.cls}`}>
                              {badge.label}
                            </span>
                            <span className="truncate font-medium text-slate-700 dark:text-slate-200 text-xs">
                              {att.originalName || att.filename}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setExistingAdditional((prev) => prev.filter((_, idx) => idx !== i))
                            }
                            className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    })}

                    {additionalFiles.map((file, i) => {
                      const badge = getFileBadge(file.name);
                      return (
                        <div
                          key={`new-${i}`}
                          className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-black border ${badge.cls}`}>
                              {badge.label}
                            </span>
                            <span className="truncate font-semibold text-slate-800 dark:text-slate-200 text-xs">
                              {file.name}
                            </span>
                            <span className="text-[10px] text-slate-500 shrink-0">
                              {formatBytes(file.size)}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setAdditionalFiles((prev) => prev.filter((_, idx) => idx !== i))
                            }
                            className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ─── 4. STICKY SIDEBAR FOOTER (PLACE ORDER / ADD TO INVENTORY BUTTON) ── */}
          <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5 shrink-0">
            <button
              type="submit"
              disabled={submitting || selectedItems.length === 0}
              className="w-full py-3 px-4 rounded-xl text-sm font-black bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 text-white shadow-lg shadow-emerald-600/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              <ShoppingBag className="h-4 w-4" />
              {submitting
                ? 'Processing Inventory Intake...'
                : isEdit
                ? 'Save & Update Product'
                : `Add ${selectedItems.length || ''} Product${selectedItems.length === 1 ? '' : 's'} to Inventory • ${formatCurrency(totals.grandTotal)}`}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 px-3 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel & Exit
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
