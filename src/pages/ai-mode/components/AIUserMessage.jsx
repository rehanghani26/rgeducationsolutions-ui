import React from "react";
import { User } from "lucide-react";

export default function AIUserMessage({ message }) {
  return (
    <div className="flex items-start justify-end gap-3 sm:gap-3.5 group">
      <div className="flex flex-col items-end max-w-[85%] sm:max-w-[78%]">
        {/* User Bubble */}
        <div className="rounded-2xl rounded-tr-xs bg-gradient-to-r from-[#FF7900] to-[#FFA000] px-4 py-3 text-[#FFFFFF] shadow-md shadow-[#FF7900]/15">
          <p className="text-[13px] leading-relaxed whitespace-pre-wrap font-medium">
            {message.content}
          </p>
        </div>

        {/* Timestamp */}
        {message.timestamp && (
          <span className="mt-1 px-1 text-[10.5px] text-[#A1A1AA] font-mono select-none">
            {message.timestamp}
          </span>
        )}
      </div>

      {/* Avatar */}
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF7900] to-[#FFA000] shadow-sm shadow-[#FF7900]/20 text-white font-bold text-xs">
        <User className="h-4 w-4" />
      </div>
    </div>
  );
}

