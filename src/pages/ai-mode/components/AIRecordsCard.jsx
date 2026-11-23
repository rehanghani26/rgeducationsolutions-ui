import React from "react";
import AiTableDataCard from "./AiTableDataCard.jsx";
import { ShieldCheck, Database, Layers } from "lucide-react";

export default function AIRecordsCard({ tool = "", data = {} }) {
  if (!data) return null;

  // Role Access & Permissions
  if (tool === "getRoleAccess" && Array.isArray(data.modules)) {
    return (
      <div className="my-3 overflow-hidden rounded-2xl border border-[#303030] bg-[#161616] shadow-lg">
        <div className="flex items-center gap-2.5 border-b border-[#2A2A2A] bg-[#1D1D1D] px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-[#FF7900] to-[#FFA000] text-white">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <span className="text-xs sm:text-sm font-bold text-white">
              Effective Role Access · {data.role}
            </span>
            <p className="text-[11px] text-[#A1A1AA]">
              View scope:{" "}
              <strong className="text-[#FFA000]">
                {data.viewScope?.replaceAll("_", " ") ||
                  "All Institutional Records"}
              </strong>
            </p>
          </div>
        </div>
        <div className="p-3.5 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#A1A1AA]">
            Accessible ERP Modules ({data.modules.length}):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {data.modules.map((m) => (
              <span
                key={m}
                className="px-2.5 py-1 rounded-lg border border-[#333333] bg-[#222222] text-xs font-medium text-white shadow-xs"
              >
                {m === "*" ? "★ Superadmin / All Modules Unrestricted" : m}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Find array in data
  let targetArray = null;
  let title = "ERP Data Records";
  const arrayKey = Object.keys(data).find((k) => Array.isArray(data[k]));

  if (arrayKey && Array.isArray(data[arrayKey])) {
    targetArray = data[arrayKey];
    title = arrayKey.replace(/([A-Z])/g, " $1");
    title = title.charAt(0).toUpperCase() + title.slice(1);
  }

  if (targetArray && targetArray.length > 0) {
    return <AiTableDataCard title={title} data={targetArray} icon={Layers} />;
  }

  // Single record object display
  const entries = Object.entries(data).filter(
    ([k]) => !["success", "message", "__v", "_id"].includes(k)
  );

  if (entries.length > 0) {
    return (
      <div className="my-3 overflow-hidden rounded-2xl border border-[#303030] bg-[#161616] p-4 shadow-lg">
        <h4 className="text-xs font-bold text-white mb-2.5 pb-2 border-b border-[#2A2A2A] flex items-center gap-2">
          <Database className="h-3.5 w-3.5 text-[#FFA000]" />
          <span>Record Information</span>
        </h4>
        <dl className="grid gap-2 sm:grid-cols-2 text-xs">
          {entries.map(([k, v]) => (
            <div
              key={k}
              className="rounded-lg border border-[#2B2B2B] bg-[#1E1E1E] p-2.5 flex items-baseline justify-between gap-2"
            >
              <dt className="text-[11px] text-[#A1A1AA] uppercase tracking-wider">
                {k.replace(/([A-Z])/g, " $1")}:
              </dt>
              <dd className="font-semibold text-white truncate max-w-[60%]">
                {typeof v === "object" ? JSON.stringify(v) : String(v ?? "—")}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    );
  }

  return null;
}
