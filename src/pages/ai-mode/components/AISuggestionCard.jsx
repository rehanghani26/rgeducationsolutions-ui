import React from "react";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

export default function AISuggestionCard({ item, onClick }) {
  const Icon = item.icon;

  return (
    <motion.button
      onClick={() => onClick(item.prompt)}
      variants={{
        hidden: { opacity: 0, y: 12, scale: 0.98 },
        visible: { opacity: 1, y: 0, scale: 1 },
      }}
      whileHover={{
        y: -3,
        scale: 1.012,
        transition: { duration: 0.18, ease: "easeOut" },
      }}
      whileTap={{ scale: 0.98 }}
      className="group relative flex flex-col justify-between rounded-xl sm:rounded-2xl border border-white/[0.08] bg-[#161619]/90 p-3 sm:p-3.5 text-left transition-colors duration-200 hover:border-[#FF7900]/50 hover:bg-[#1A1A1E] hover:shadow-[0_10px_28px_-8px_rgba(255,121,0,0.18)] cursor-pointer overflow-hidden"
    >
      {/* Ambient background hover flare */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-[#FF7900]/0 blur-2xl transition-all duration-300 group-hover:bg-[#FF7900]/15" />

      {/* Top section: Icon, Category tag, Arrow */}
      <div>
        <div className="flex items-center justify-between mb-2 sm:mb-2.5">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="flex h-7.5 w-7.5 sm:h-8 sm:w-8 items-center justify-center rounded-lg sm:rounded-xl bg-[#202024] border border-white/[0.08] text-[#FFA000] group-hover:border-[#FF7900]/40 group-hover:bg-[#FF7900]/15 group-hover:text-[#FF7900] transition-all duration-200 shadow-xs flex-shrink-0">
              {Icon && <Icon className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />}
            </div>
            {item.tag && (
              <span
                className={`inline-flex items-center rounded-full border px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[9.5px] font-bold uppercase tracking-wider backdrop-blur-xs ${
                  item.color || "border-[#FF7900]/30 bg-[#FF7900]/10 text-[#FFA000]"
                }`}
              >
                {item.tag}
              </span>
            )}
          </div>

          <div className="flex h-5 w-5 sm:h-5.5 sm:w-5.5 items-center justify-center rounded-full bg-white/[0.04] text-[#71717A] opacity-60 group-hover:opacity-100 group-hover:bg-[#FF7900]/15 group-hover:text-[#FFA000] transition-all duration-200">
            <ArrowUpRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 transform transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>

        {/* Title */}
        <h4 className="text-[12px] sm:text-[12.5px] font-bold text-white group-hover:text-[#FFA000] transition-colors leading-snug tracking-tight">
          {item.title}
        </h4>

        {/* Description */}
        <p className="mt-1 text-[10.5px] sm:text-[11px] leading-relaxed text-[#A1A1AA] line-clamp-2">
          {item.description}
        </p>
      </div>

      {/* Bottom accent row */}
      <div className="mt-2.5 sm:mt-3 flex items-center justify-between pt-1.5 sm:pt-2 border-t border-white/[0.04]">
        <span className="text-[9.5px] sm:text-[10px] font-medium text-[#71717A] group-hover:text-[#A1A1AA] transition-colors">
          Click to query module &rarr;
        </span>
        <div className="h-1.5 w-1.5 rounded-full bg-white/20 group-hover:bg-[#FF7900] group-hover:shadow-[0_0_8px_#FF7900] transition-all" />
      </div>
    </motion.button>
  );
}
