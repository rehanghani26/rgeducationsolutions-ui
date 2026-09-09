import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Plus, ShieldAlert } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader.jsx";
import DataTable from "../../components/ui/DataTable.jsx";
import SearchFilters from "../../components/ui/SearchFilters.jsx";
import StatsCard from "../../components/ui/StatsCard.jsx";
import Modal from "../../components/ui/Modal.jsx";
import { getInventoryItems, createInventoryItem } from "../../services";
import { mockInventory } from "../../data/mockData.js";
import Loader from "../../components/ui/Loader.jsx";
import { CanButton } from "../../config/buttonAccess.jsx";

const CATEGORIES = [
  "Books & Publications",
  "Lab Equipment",
  "Sports Items",
  "Stationery",
  "Electronics & Computers",
  "Furniture",
];

const blankItem = {
  name: "",
  sku: "",
  category: "Books",
  quantity: 0,
  unit: "pcs",
  minStockLevel: 5,
  price: 0,
  vendorId: "",
};

const InventoryList = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [items, setItems] = useState(mockInventory);
  const [pagination, setPagination] = useState({ total: mockInventory.length, page: 1, pages: 1 });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(blankItem);

  // Direct useEffect API Fetch
  const fetchInventoryData = async () => {
    setLoading(true);
    try {
      const res = await getInventoryItems({ page, limit: 20, search, category });
      if (res?.items && res.items.length > 0) {
        setItems(res.items);
        if (res.pagination) setPagination(res.pagination);
      } else if (res?.data?.items && res.data.items.length > 0) {
        setItems(res.data.items);
        if (res.data.pagination) setPagination(res.data.pagination);
      } else {
        setItems(mockInventory);
      }
    } catch (err) {
      console.error("fetchInventory error:", err);
      setItems(mockInventory);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, [page, search, category]);

  const columns = [
    {
      key: "name",
      label: "Item Name",
      render: (row) => <span className="font-extrabold">{row.name}</span>,
    },
    {
      key: "category",
      label: "Category",
      render: (row) => (
        <span className="font-semibold text-slate-700 dark:text-slate-300">
          {row.category}
        </span>
      ),
    },
    {
      key: "quantity",
      label: "Stock Qty",
      render: (row) => (
        <span
          className={`font-bold ${
            row.quantity <= (row.reorderLevel || 10)
              ? "text-rose-500"
              : "text-emerald-500"
          }`}
        >
          {row.quantity} {row.unit || "Units"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Stock Status",
      render: (row) => (
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
            row.quantity <= (row.reorderLevel || 10)
              ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
              : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
          }`}
        >
          {row.status || (row.quantity <= (row.reorderLevel || 10) ? "Low Stock" : "In Stock")}
        </span>
      ),
    },
    {
      key: "supplier",
      label: "Supplier / Vendor",
      render: (row) => row.supplier || "Al-Huda Islamic Publishers",
    },
  ];

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createInventoryItem(form);
      setShowCreate(false);
      setForm(blankItem);
      fetchInventoryData();
    } catch (err) {
      console.error("Create inventory error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Inventory & Assets"
        subtitle="Track school supplies, textbooks, laboratory equipment, and assets."
        breadcrumbs={[{ label: "Inventory" }]}
        actions={
          <CanButton id="ADD_INVENTORY_ITEM">
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2.5 px-4 rounded-lg shadow-sm transition-all"
            >
              <Plus size={14} /> Add Item
            </button>
          </CanButton>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard title="Total Assets Value" value="₹1,24,000" />
        <StatsCard title="Low Stock Items" value="4 Alert Items" />
        <StatsCard title="Reorder Categories" value="Books & Lab Equip" />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <SearchFilters
          search={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Search items by name, SKU, or supplier..."
          filters={[
            {
              key: "category",
              value: category,
              onChange: (v) => {
                setCategory(v);
                setPage(1);
              },
              options: [
                { value: "", label: "All Categories" },
                ...CATEGORIES.map((c) => ({ value: c, label: c })),
              ],
            },
          ]}
          onClear={() => {
            setSearch("");
            setCategory("");
            setPage(1);
          }}
        />

        {loading ? (
          <Loader fullPage size="lg" text="Fetching inventory assets directly from API..." />
        ) : (
          <DataTable
            columns={columns}
            data={items}
            loading={loading}
            pagination={pagination}
            onPageChange={setPage}
            onRowClick={(row) => navigate(`/inventory/${row.id || row._id}`)}
          />
        )}
      </div>

      {/* Create Modal */}
      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Add Inventory Item"
        size="sm"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-500 uppercase mb-1">
              Item Name
            </label>
            <input
              required
              placeholder="e.g. Smartboard Projectors"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block font-bold text-slate-500 uppercase mb-1">
              Category
            </label>
            <select
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-bold text-slate-500 uppercase mb-1">
              Initial Quantity
            </label>
            <input
              type="number"
              required
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-bold"
            >
              Add Item
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default InventoryList;
