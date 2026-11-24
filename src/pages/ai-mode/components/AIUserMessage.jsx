import React, { useState } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";

/**
 * Extracts 1-2 uppercase initials from user name or username.
 * e.g. "Fahad Khan" -> "FK", "Fahad" -> "FA", "Super Admin" -> "SA"
 */
function getUserInitials(name = "", username = "") {
  const clean = (name || username || "").trim();
  if (!clean) return "U";

  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
}

export default function AIUserMessage({ message, user: propUser }) {
  const authUser = useSelector((state) => state?.auth?.user);
  const user = propUser || authUser;
  const [imgError, setImgError] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    if (!message.content) return;
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const photo =
    user?.avatar ||
    user?.photo ||
    user?.imagesRef?.img ||
    user?.profileImage ||
    user?.profilePicture ||
    user?.image;

  const initials = getUserInitials(user?.name, user?.username);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex items-start justify-end gap-3 sm:gap-3.5 group"
    >
      <div className="flex flex-col items-end max-w-[85%] sm:max-w-[78%]">
        {/* User Message Bubble */}
        <div className="rounded-2xl rounded-tr-xs bg-gradient-to-r from-[#FF7900] to-[#FFA000] px-4 py-3 text-white shadow-md shadow-[#FF7900]/20">
          <p className="text-[13px] leading-relaxed whitespace-pre-wrap font-medium">
            {message.content}
          </p>
        </div>

        {/* Timestamp & Copy */}
        <div className="mt-1 flex items-center gap-1.5 px-1 text-[#A1A1AA]">
          {message.timestamp && (
            <span className="text-[10.5px] text-[#A1A1AA] font-mono select-none">
              {message.timestamp}
            </span>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 rounded-md px-1 py-0.5 text-[10.5px] text-[#A1A1AA] opacity-0 group-hover:opacity-100 hover:bg-[#1D1D20] hover:text-white transition-all cursor-pointer"
            title="Copy message"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400 text-[10px]">Copied</span>
              </>
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </button>
        </div>
      </div>

      {/* User Avatar: Profile Photo if available, otherwise stylish Initials */}
      <div className="relative flex h-8.5 w-8.5 sm:h-9 sm:w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF7900] to-[#FFA000] p-0.5 shadow-md shadow-[#FF7900]/25 overflow-hidden">
        {photo && !imgError ? (
          <img
            src={photo}
            alt={user?.name || "User"}
            className="h-full w-full rounded-[10px] object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="text-[12px] font-bold text-white tracking-wider select-none">
            {initials}
          </span>
        )}
      </div>
    </motion.div>
  );
}
