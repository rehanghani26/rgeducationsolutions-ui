import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchInventory, changeStock, fetchVendors } from '../store/slices/erpSlice.js';
import { toast, ToastContainer } from 'react-toastify';
import { 
  Search, ShieldAlert, Plus, Warehouse, RefreshCw, 
  ArrowUpRight, ArrowDownRight, Tag, Truck, Coins
} from 'lucide-react';
import api from '../services/api.js';

const InventoryManagement = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTab, setActiveTab] = useState('items'); // 'items', 'vendors'
  
  // Stock Adjustment modal status
  const [adjustingItem, setAdjustingItem] = useState(null); // item object
  const [adjustType, setAdjustType] = useState('in'); // 'in' or 'out'
  const [adjustQty, setAdjustQty] = useState('');

  const { inventory, vendors, loading } = useSelector((state) => state.erp);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchInventory());
    dispatch(fetchVendors());
  }, [dispatch]);

  const handleAdjustSubmit = (e) => {
    e.preventDefault();
    const qty = Number(adjustQty);
    if (isNaN(qty) || qty <= 0) {
      return toast.warn('Please provide a valid quantity.');
    }

    const payload = {
      id: adjustingItem.id || adjustingItem._id,
      type: adjustType,
      quantity: qty
    };

    dispatch(changeStock(payload)).then((res) => {
      if (res.meta.requestStatus === 'fulfilled') {
        toast.success(`Successfully adjusted stock: ${adjustType.toUpperCase()} ${qty} units`);
        setAdjustingItem(null);
        setAdjustQty('');
        dispatch(fetchInventory());
      } else {
        toast.error(res.payload || 'Stock adjustment failed.');
      }
    });
  };

  const categories = ['All', 'Books', 'Computers', 'Lab Equipment', 'Furniture', 'Sports Items', 'Stationery', 'Uniforms', 'Electronics'];

  // Low stock items lookup
  const lowStockItems = inventory.filter(item => item.quantity <= item.minStockLevel);

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Inventory & Assets</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Audit school stocks, log adjustments, trigger alerts, and register suppliers.</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 text-xs font-bold gap-1 shadow-sm">
          <button 
            onClick={() => setActiveTab('items')}
            className={`py-2 px-4 rounded-lg transition-colors ${
              activeTab === 'items' 
                ? 'bg-indigo-600 text-white' 
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Stocks Inventory
          </button>
          <button 
            onClick={() => setActiveTab('vendors')}
            className={`py-2 px-4 rounded-lg transition-colors ${
              activeTab === 'vendors' 
                ? 'bg-indigo-600 text-white' 
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Vendors & Suppliers
          </button>
        </div>
      </div>

      {/* Low stock warning message bar */}
      {lowStockItems.length > 0 && activeTab === 'items' && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-300 p-4 rounded-2xl flex items-center gap-3 text-xs animate-pulse-slow">
          <ShieldAlert size={18} className="flex-shrink-0" />
          <div>
            <strong className="font-extrabold">Reorder Alert:</strong> There are <strong className="underline">{lowStockItems.length} items</strong> currently below minimum stock levels (Desktops, Notebooks, balls, etc.). Please submit Purchase Orders.
          </div>
        </div>
      )}

      {activeTab === 'items' && (
        <>
          {/* Categories select tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scroll-smooth text-xs font-bold">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`py-2 px-4 rounded-full border transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Table list and Search */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div className="max-w-md mb-6">
              <div className="relative">
                <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Search by product name or SKU code..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-2.5 pl-10 pr-4 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 text-xs font-semibold">Updating inventory index...</p>
              </div>
            ) : filteredInventory.length === 0 ? (
              <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                <span className="text-3xl">📦</span>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mt-2">No products match specified filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="pb-3">Product Item</th>
                      <th className="pb-3">SKU</th>
                      <th className="pb-3">Category</th>
                      <th className="pb-3">Stock Quantity</th>
                      <th className="pb-3">Unit Cost</th>
                      <th className="pb-3">Vendor Supplier</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredInventory.map((item) => {
                      const isLowStock = item.quantity <= item.minStockLevel;
                      return (
                        <tr key={item.id || item._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-4 font-bold flex items-center gap-2">
                            <span className="text-lg">🏷️</span>
                            <span>{item.name}</span>
                          </td>
                          <td className="py-4 font-medium text-slate-500 dark:text-slate-400">{item.sku}</td>
                          <td className="py-4">
                            <span className="bg-slate-100 dark:bg-slate-850 px-2.5 py-1 rounded-md text-[10px] font-semibold flex items-center gap-1 w-max border border-slate-200 dark:border-slate-800">
                              <Tag size={10} className="text-slate-400" /> {item.category}
                            </span>
                          </td>
                          <td className="py-4">
                            <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                              isLowStock 
                                ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                                : 'text-slate-700 dark:text-slate-300'
                            }`}>
                              {item.quantity} {item.unit} {isLowStock && '(Low Stock)'}
                            </span>
                          </td>
                          <td className="py-4 font-semibold">${item.price.toLocaleString()}</td>
                          <td className="py-4 text-slate-500">{item.vendor?.name || 'Spud & Sons Supplies'}</td>
                          <td className="py-4 text-right">
                            <button
                              onClick={() => setAdjustingItem(item)}
                              className="inline-flex items-center gap-1 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 py-1.5 px-3 rounded-lg text-[10px] font-bold transition-all shadow-sm"
                            >
                              <RefreshCw size={10} /> Adjust Stock
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
        </>
      )}

      {activeTab === 'vendors' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vendors.map((v) => (
            <div key={v.id || v._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
                    <Truck size={20} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm">{v.name}</h3>
                    <p className="text-[10px] text-slate-400 font-semibold">{v.contactPerson}</p>
                  </div>
                </div>
                
                <div className="text-xs text-slate-500 dark:text-slate-400 space-y-2">
                  <p className="flex justify-between"><span>Phone:</span> <strong className="text-slate-700 dark:text-slate-300">{v.phone}</strong></p>
                  <p className="flex justify-between"><span>Email:</span> <strong className="text-slate-700 dark:text-slate-300 truncate">{v.email}</strong></p>
                  <p className="flex justify-between"><span>Address:</span> <strong className="text-slate-700 dark:text-slate-300">{v.address}</strong></p>
                </div>
              </div>
              
              <div className="border-t border-slate-100 dark:border-slate-800 mt-5 pt-4 flex justify-between items-center text-xs">
                <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1"><Coins size={12} /> Supplier contract</span>
                <span className="text-emerald-500 font-bold">Verified</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Adjust Stock Dialog */}
      {adjustingItem && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-sm rounded-2xl shadow-2xl p-6 relative">
            <h3 className="text-lg font-bold mb-4">Adjust Stock Level</h3>
            <p className="text-xs text-slate-400 mb-4">Product: <strong className="text-slate-700 dark:text-slate-300">{adjustingItem.name}</strong> (SKU: {adjustingItem.sku})</p>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustType('in')}
                  className={`py-3 rounded-xl font-bold flex items-center justify-center gap-1.5 text-xs transition-colors ${
                    adjustType === 'in'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  <ArrowUpRight size={14} /> Stock In
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType('out')}
                  className={`py-3 rounded-xl font-bold flex items-center justify-center gap-1.5 text-xs transition-colors ${
                    adjustType === 'out'
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  <ArrowDownRight size={14} /> Stock Out
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Adjustment Quantity</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 15"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl p-3 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setAdjustingItem(null)}
                  className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold py-2 px-4 rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAdjustSubmit}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-5 rounded-xl text-xs shadow-lg"
                >
                  Adjust Qty
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default InventoryManagement;
