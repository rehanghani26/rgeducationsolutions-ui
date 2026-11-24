import React, { useState } from "react";
import AISuggestionCard from "./AISuggestionCard.jsx";
import { ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AISuggestionGrid({ items = [], onSelectPrompt }) {
  const [showAll, setShowAll] = useState(false);
  const initialCount = 8;

  const visibleItems = showAll ? items : items.slice(0, initialCount);
  const remainingCount = Math.max(0, items.length - initialCount);

  return (
    <div className="w-full space-y-3.5">
      {/* Responsive Grid with Framer Motion entrance */}
      <motion.div
        layout
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.035,
              delayChildren: 0.04,
            },
          },
        }}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3"
      >
        <AnimatePresence mode="popLayout">
          {visibleItems.map((item, idx) => (
            <AISuggestionCard
              key={item.title || idx}
              item={item}
              onClick={onSelectPrompt}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Show More / Show Less Button */}
      {items.length > initialCount && (
        <div className="flex justify-center pt-1.5">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-[#1A1A1E] px-3.5 py-1.5 text-[11.5px] font-semibold text-[#A1A1AA] hover:text-white hover:border-[#FF7900]/50 hover:bg-[#222226] hover:shadow-[0_4px_16px_rgba(255,121,0,0.15)] transition-all cursor-pointer shadow-xs"
          >
            <span>
              {showAll
                ? "Show Fewer Modules"
                : `Explore More Modules (${remainingCount} more)`}
            </span>
            {showAll ? (
              <ChevronUp className="h-3.5 w-3.5 text-[#FFA000]" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 text-[#FFA000]" />
            )}
          </motion.button>
        </div>
      )}
    </div>
  );
}
