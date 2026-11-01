import React from "react";
import { Zap, Radio } from "lucide-react";

export default function AIProviderStatus({
  providerName = "NVIDIA AI",
  variant = "badge", // "badge" | "footer"
}) {
  if (variant === "badge") {
    return (
      <div className="flex items-center gap-1.5 rounded-full border border-[#303030] bg-[#1D1D1D] px-2.5 py-1 text-[11px] font-semibold text-[#FFA000]">
        <Zap className="h-3 w-3 text-[#FF7900]" />
        <span>{providerName}</span>
      </div>
    );
  }

  // Footer card variant (inside sidebar)
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-[#303030] bg-[#141414] px-3 py-2.5 shadow-sm">
      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#FF7900] to-[#FFA000] text-white shadow-sm">
        <Zap className="h-3.5 w-3.5" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-[10px] uppercase font-bold tracking-wider text-[#A1A1AA]">
          AI Engine
        </div>
        <div className="truncate text-[11.5px] font-bold text-[#FFFFFF]">
          {providerName}
        </div>
      </div>

      <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
        </span>
        <span className="text-[9.5px] font-semibold text-emerald-400">Live</span>
      </div>
    </div>
  );
}

