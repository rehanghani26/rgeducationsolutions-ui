import React from "react";

const InventorySettings = ({ settings, handleChange }) => {
  return (
    <div className="space-y-4">
      <h3 className="font-extrabold text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
        Add Inventory Settings
      </h3>

      <div className="space-y-3">
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-850 p-4 rounded-xl">
          <input
            type="checkbox"
            name="enableInventoryTracking"
            checked={settings.enableInventoryTracking}
            onChange={handleChange}
            id="trackInventory"
            className="w-4 h-4 rounded text-indigo-600"
          />
          <label
            htmlFor="trackInventory"
            className="cursor-pointer select-none"
          >
            <strong>Enable Inventory Tracking</strong>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Track inventory movements and stock levels
            </p>
          </label>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-850 p-4 rounded-xl">
          <input
            type="checkbox"
            name="lowStockAlert"
            checked={settings.lowStockAlert}
            onChange={handleChange}
            id="lowStockAlert"
            className="w-4 h-4 rounded text-indigo-600"
          />
          <label htmlFor="lowStockAlert" className="cursor-pointer select-none">
            <strong>Low Stock Alerts</strong>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Get notified when items fall below threshold
            </p>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              Low Stock Threshold
            </label>
            <input
              type="number"
              name="lowStockThreshold"
              value={settings.lowStockThreshold}
              onChange={handleChange}
              min="1"
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-850 p-4 rounded-xl">
            <input
              type="checkbox"
              name="enableBarcode"
              checked={settings.enableBarcode}
              onChange={handleChange}
              id="enableBarcode"
              className="w-4 h-4 rounded text-indigo-600"
            />
            <label
              htmlFor="enableBarcode"
              className="cursor-pointer select-none"
            >
              <strong>Enable Barcode</strong>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Use barcodes for inventory items
              </p>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventorySettings;
