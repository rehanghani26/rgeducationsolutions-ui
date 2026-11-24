import React from "react";
import { motion } from "framer-motion";
import { QUICK_CHIPS } from "../ai.constants.js";

export default function AIQuickActions({ onSelectAction }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-0.5">
      {QUICK_CHIPS.map((chip, idx) => {
        const Icon = chip.icon;
        return (
          <motion.button
            key={chip.label || idx}
            whileHover={{
              scale: 1.04,
              y: -1,
              transition: { duration: 0.15 },
            }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onSelectAction(chip.prompt)}
            className="flex-shrink-0 flex items-center gap-2 rounded-full border border-white/[0.08] bg-[#1A1A1D] px-3.5 py-1.5 text-[11.5px] font-medium text-[#D4D4D8] hover:text-white hover:border-[#FF7900]/50 hover:bg-[#222227] hover:shadow-[0_4px_16px_rgba(255,121,0,0.18)] transition-all whitespace-nowrap cursor-pointer shadow-xs select-none"
          >
            <div className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#FF7900]/15 text-[#FFA000]">
              {Icon && <Icon className="h-3 w-3" />}
            </div>
            <span>{chip.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
