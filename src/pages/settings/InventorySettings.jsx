import React from "react";
import { Package } from "lucide-react";

const InventorySettings = ({ settings = {}, handleChange }) => {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
        <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Package size={18} className="text-indigo-600 dark:text-indigo-400" />
          Inventory & Asset Control
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Configure stock movement tracking, threshold alert limits, and barcode scanner integration.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80">
          <input
            type="checkbox"
            name="enableInventoryTracking"
            checked={Boolean(settings?.enableInventoryTracking)}
            onChange={handleChange}
            id="trackInventory"
            className="w-4 h-4 mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
          />
          <label htmlFor="trackInventory" className="cursor-pointer select-none">
            <strong className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Enable Real-Time Inventory Tracking
            </strong>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
              Maintain audit trails for stock movements, vendor dispatches, and departmental issues.
            </p>
          </label>
        </div>

        <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80">
          <input
            type="checkbox"
            name="lowStockAlert"
            checked={Boolean(settings?.lowStockAlert)}
            onChange={handleChange}
            id="lowStockAlert"
            className="w-4 h-4 mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
          />
          <label htmlFor="lowStockAlert" className="cursor-pointer select-none">
            <strong className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Automated Low Stock Alerts
            </strong>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
              Trigger administrative dashboard warnings when stock counts fall below minimum threshold.
            </p>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <label className="block font-bold text-xs text-slate-900 dark:text-slate-200 mb-1">
              Low Stock Alert Threshold
            </label>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
              Items at or below this count will show reorder warnings.
            </p>
            <input
              type="number"
              name="lowStockThreshold"
              value={settings?.lowStockThreshold ?? ""}
              onChange={handleChange}
              min="1"
              placeholder="e.g. 10"
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-bold text-sm"
            />
          </div>

          <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <input
              type="checkbox"
              name="enableBarcode"
              checked={Boolean(settings?.enableBarcode)}
              onChange={handleChange}
              id="enableBarcode"
              className="w-4 h-4 mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
            />
            <label htmlFor="enableBarcode" className="cursor-pointer select-none">
              <strong className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Enable Barcode / QR Scanning
              </strong>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                Support handheld barcode scanners during stock check-in and dispensing.
              </p>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventorySettings;
