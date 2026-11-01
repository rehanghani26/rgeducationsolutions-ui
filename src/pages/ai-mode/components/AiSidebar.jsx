import React, { useMemo, useState } from "react";
import {
  Plus,
  Search,
  MessageSquare,
  Trash2,
  Edit2,
  Check,
  X,
  Sparkles,
} from "lucide-react";
import AIProviderStatus from "./AIProviderStatus.jsx";
import rgLogo from "../../../assets/logo/RGLOGO.png";

function getDateGroup(dateVal) {
  if (!dateVal) return "Previous";

  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return "Previous";

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const sessionDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  if (sessionDay.getTime() === today.getTime()) return "Today";
  if (sessionDay.getTime() === yesterday.getTime()) return "Yesterday";
  return "Previous";
}

function groupSessions(sessions) {
  const groups = { Today: [], Yesterday: [], Previous: [] };

  for (const sess of sessions) {
    const group = getDateGroup(sess.createdAt);
    if (!groups[group]) groups[group] = [];
    groups[group].push(sess);
  }

  return [
    { label: "Today", items: groups.Today },
    { label: "Yesterday", items: groups.Yesterday },
    { label: "Previous", items: groups.Previous },
  ].filter((g) => g.items && g.items.length > 0);
}

export default function AISidebar({
  isOpen,
  onClose,
  sessions = [],
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onRenameSession,
  searchQuery = "",
  onSearchChange,
  providerName = "NVIDIA AI",
}) {
  const grouped = useMemo(() => groupSessions(sessions), [sessions]);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  const handleStartRename = (e, sess) => {
    e.stopPropagation();
    setEditingId(sess.id);
    setEditTitle(sess.title);
  };

  const handleSaveRename = (e, id) => {
    e.stopPropagation();
    if (editTitle.trim() && onRenameSession) {
      onRenameSession(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleCancelRename = (e) => {
    e.stopPropagation();
    setEditingId(null);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col
          border-r border-[#303030] bg-[#191919] text-[#FFFFFF]
          transition-all duration-300 ease-in-out
          ${isOpen ? "w-[280px] translate-x-0" : "w-[280px] -translate-x-full"}
          lg:static lg:z-auto lg:flex-shrink-0
          ${isOpen ? "lg:w-[280px] lg:translate-x-0" : "lg:w-0 lg:overflow-hidden"}
        `}
      >
        {/* Header / Brand */}
        <div className="flex h-16 items-center justify-between border-b border-[#303030] px-4 bg-[#161616]">
          <div className="flex items-center gap-2.5">
            <div
              className="relative flex flex-shrink-0 items-center justify-center rounded-xl border border-[#303030] bg-[#1F1F1F] p-1 shadow-md overflow-hidden"
              style={{
                width: "36px",
                height: "36px",
                minWidth: "36px",
                minHeight: "36px",
                maxWidth: "36px",
                maxHeight: "36px",
              }}
            >
              <img
                src={rgLogo}
                alt="RGES Logo"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  mixBlendMode: "screen",
                }}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const fallback = e.currentTarget.nextSibling;
                  if (fallback) fallback.style.display = "flex";
                }}
              />
              <div
                style={{ display: "none" }}
                className="h-full w-full items-center justify-center text-[#FFA000]"
              >
                <Sparkles className="h-4 w-4" />
              </div>
            </div>
            <div>
              <div className="text-[13px] font-bold text-[#FFFFFF] tracking-tight leading-tight">
                RGES ERP AI
              </div>
              <div className="text-[10px] text-[#A1A1AA] leading-tight">
                School Assistant
              </div>
            </div>
          </div>

          {/* Close (mobile only) */}
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#A1A1AA] hover:bg-[#252525] hover:text-[#FFFFFF] lg:hidden cursor-pointer"
            title="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* New Conversation Button */}
        <div className="p-3 pb-2">
          <button
            onClick={onNewChat}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7900] to-[#FFA000] px-4 py-2.5 text-[13px] font-bold text-white shadow-md shadow-[#FF7900]/25 transition-all duration-200 hover:shadow-[#FF7900]/40 hover:brightness-105 active:scale-98 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>New Conversation</span>
          </button>
        </div>

        {/* Search input */}
        <div className="px-3 pb-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#A1A1AA] pointer-events-none" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-xl border border-[#303030] bg-[#141414] py-2 pl-8 pr-3 text-[12px] text-[#FFFFFF] placeholder-[#A1A1AA] outline-none transition-all focus:border-[#FF7900] focus:ring-1 focus:ring-[#FF7900]"
            />
          </div>
        </div>

        {/* Conversation History Grouped */}
        <div className="flex-1 overflow-y-auto px-2 py-1 scrollbar-thin">
          {sessions.length === 0 ? (
            <div className="py-10 text-center text-[11px] text-[#A1A1AA]">
              <MessageSquare className="mx-auto mb-2 h-6 w-6 opacity-30" />
              No conversations yet
            </div>
          ) : (
            grouped.map(({ label, items }) => (
              <div key={label} className="mb-3">
                {/* Group label: Today, Yesterday, Previous */}
                <div className="mb-1 px-2.5 text-[10px] font-bold uppercase tracking-wider text-[#A1A1AA]/80">
                  {label}
                </div>

                {/* Items */}
                <div className="space-y-0.5">
                  {items.map((sess) => {
                    const isActive = sess.id === activeSessionId;
                    const isEditing = editingId === sess.id;

                    return (
                      <div
                        key={sess.id}
                        onClick={() => !isEditing && onSelectSession(sess.id)}
                        className={`group relative flex items-center justify-between rounded-xl px-3 py-2 text-left transition-all duration-150 cursor-pointer ${
                          isActive
                            ? "bg-[#252525] border border-[#FF7900]/50 text-[#FFFFFF] shadow-sm"
                            : "hover:bg-[#202020] border border-transparent text-[#A1A1AA] hover:text-[#FFFFFF]"
                        }`}
                      >
                        {/* Active indicator bar */}
                        {isActive && (
                          <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-md bg-gradient-to-b from-[#FF7900] to-[#FFA000]" />
                        )}

                        <div className="flex min-w-0 items-center gap-2 flex-1">
                          <MessageSquare
                            className={`h-3.5 w-3.5 flex-shrink-0 ${
                              isActive ? "text-[#FFA000]" : "text-[#A1A1AA]"
                            }`}
                          />

                          {isEditing ? (
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSaveRename(e, sess.id);
                                if (e.key === "Escape") handleCancelRename(e);
                              }}
                              autoFocus
                              className="w-full rounded bg-[#141414] px-1.5 py-0.5 text-[12px] text-white border border-[#FF7900] outline-none"
                            />
                          ) : (
                            <span
                              className={`truncate text-[12px] ${
                                isActive
                                  ? "font-semibold text-white"
                                  : "font-normal"
                              }`}
                            >
                              {sess.title || "Conversation"}
                            </span>
                          )}
                        </div>

                        {/* Actions: Rename & Delete */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {isEditing ? (
                            <>
                              <button
                                onClick={(e) => handleSaveRename(e, sess.id)}
                                className="p-1 rounded text-emerald-400 hover:bg-[#141414]"
                                title="Save"
                              >
                                <Check className="h-3 w-3" />
                              </button>
                              <button
                                onClick={handleCancelRename}
                                className="p-1 rounded text-[#A1A1AA] hover:bg-[#141414]"
                                title="Cancel"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={(e) => handleStartRename(e, sess)}
                                className="p-1 rounded text-[#A1A1AA] hover:text-[#FFA000] hover:bg-[#191919] transition-colors"
                                title="Rename conversation"
                              >
                                <Edit2 className="h-3 w-3" />
                              </button>
                              <button
                                onClick={(e) => onDeleteSession(sess.id, e)}
                                className="p-1 rounded text-[#A1A1AA] hover:text-rose-400 hover:bg-[#191919] transition-colors"
                                title="Delete conversation"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer: AI Provider Connection Status */}
        <div className="border-t border-[#303030] p-3 bg-[#161616]">
          <AIProviderStatus providerName={providerName} variant="footer" />
        </div>
      </aside>
    </>
  );
}
