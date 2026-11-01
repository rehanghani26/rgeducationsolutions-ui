import React, { useState } from "react";
import AISuggestionCard from "./AISuggestionCard.jsx";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function AISuggestionGrid({ items = [], onSelectPrompt }) {
  const [showAll, setShowAll] = useState(false);
  const initialCount = 8;

  const visibleItems = showAll ? items : items.slice(0, initialCount);
  const remainingCount = Math.max(0, items.length - initialCount);

  return (
    <div className="w-full space-y-4">
      {/* Responsive Grid: 4 cols desktop, 3 cols tablet, 2 cols mobile, 1 col xs */}
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {visibleItems.map((item, idx) => (
          <AISuggestionCard
            key={idx}
            item={item}
            onClick={onSelectPrompt}
          />
        ))}
      </div>

      {/* Show More / Show Less Button */}
      {items.length > initialCount && (
        <div className="flex justify-center pt-1">
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-1.5 rounded-full border border-[#303030] bg-[#1D1D1D] px-4 py-1.5 text-[11.5px] font-semibold text-[#A1A1AA] hover:text-[#FFFFFF] hover:border-[#FF7900]/40 transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <span>
              {showAll
                ? "Show Less"
                : `Explore More Modules (${remainingCount} more)`}
            </span>
            {showAll ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}

