import React from "react";
import { ArrowUpRight } from "lucide-react";

export default function AISuggestionCard({ item, onClick }) {
  const Icon = item.icon;

  return (
    <button
      onClick={() => onClick(item.prompt)}
      className="group relative flex flex-col justify-between rounded-xl border border-[#303030] bg-[#1D1D1D] p-3.5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[#FF7900]/50 hover:shadow-[0_0_20px_rgba(255,121,0,0.12)] active:scale-[0.98] cursor-pointer"
    >
      {/* Subtle orange left accent line on hover */}
      <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full bg-gradient-to-b from-[#FF7900] to-[#FFA000] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

      <div>
        {/* Icon & Arrow */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#141414] border border-[#303030] text-[#FFA000] group-hover:border-[#FF7900]/40 group-hover:bg-[#FF7900]/10 transition-colors">
            {Icon && <Icon className="h-4 w-4" />}
          </div>
          <ArrowUpRight className="h-3.5 w-3.5 text-[#A1A1AA] opacity-0 group-hover:opacity-100 group-hover:text-[#FFA000] transition-all transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>

        {/* Title */}
        <h4 className="text-[12.5px] font-bold text-[#FFFFFF] group-hover:text-[#FFA000] transition-colors leading-snug">
          {item.title}
        </h4>

        {/* Description */}
        <p className="mt-1 text-[11px] leading-relaxed text-[#A1A1AA] line-clamp-2">
          {item.description}
        </p>
      </div>
    </button>
  );
}

