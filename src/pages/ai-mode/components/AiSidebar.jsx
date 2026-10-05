import React from "react";
import {
  Sparkles,
  Plus,
  Search,
  MessageSquare,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import { bg, border, text } from "@/theme/color";

export default function AiSidebar({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  searchQuery,
  onSearchChange,
  providerName = "System AI",
}) {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col
          border-r ${border.default}
          ${bg.sidebar} backdrop-blur-xl
          transition-all duration-300 ease-in-out
          ${isOpen ? "w-[280px] translate-x-0" : "w-[280px] -translate-x-full"}
          lg:static lg:z-auto lg:flex-shrink-0
          ${isOpen ? "lg:w-[280px] lg:translate-x-0" : "lg:w-0 lg:overflow-hidden"}
        `}
      >
        {/* Header */}
        <div className={`flex h-16 items-center justify-between border-b ${border.default} px-4`}>
          <div className="flex items-center gap-2.5">
            <div className="gradient-animated flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl shadow-lg">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className={`text-[13px] font-bold ${text.primary} tracking-tight`}>
                RGES ERP AI
              </div>
              <div className={`text-[10px] ${text.muted}`}>
                School ERP Assistant
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`flex h-7 w-7 items-center justify-center rounded-lg ${text.muted} hover:${bg.hover} hover:${text.primary} lg:hidden`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={onNewChat}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-orange-500/30 bg-gradient-to-r from-orange-500/15 to-amber-500/15 px-4 py-2.5 text-[12px] font-semibold text-orange-600 dark:text-orange-400 transition-all hover:border-orange-500/60 hover:from-orange-500/25 hover:to-amber-500/25 active:scale-95 cursor-pointer shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            New Conversation
          </button>
        </div>

        {/* Search */}
        <div className="px-3 pb-2">
          <div className="relative">
            <Search className={`absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 ${text.muted}`} />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className={`w-full rounded-lg ${bg.input} py-1.5 pl-7 pr-3 text-[11px] ${text.primary} placeholder:text-stone-400 border ${border.subtle} outline-none focus:ring-1 focus:ring-orange-500/40`}
            />
          </div>
        </div>

        {/* Session List */}
        <div className="flex-1 overflow-y-auto px-3 py-1 scrollbar-thin">
          {sessions.length === 0 ? (
            <div className={`py-8 text-center text-[11px] ${text.muted}`}>
              No conversations found
            </div>
          ) : (
            <>
              <div className={`mb-1.5 px-2 text-[10px] font-bold uppercase tracking-widest ${text.muted}`}>
                Conversations
              </div>
              {sessions.map((sess) => {
                const isActive = sess.id === activeSessionId;
                const lastMsg = sess.messages[sess.messages.length - 1];
                return (
                  <button
                    key={sess.id}
                    onClick={() => onSelectSession(sess.id)}
                    className={`group mb-1 flex w-full items-start justify-between rounded-xl px-3 py-2.5 text-left transition-all cursor-pointer ${
                      isActive
                        ? "bg-orange-500/15 border border-orange-500/30 shadow-xs"
                        : `hover:${bg.hover} border border-transparent`
                    }`}
                  >
                    <div className="flex min-w-0 items-start gap-2.5">
                      <div
                        className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md ${
                          isActive
                            ? "bg-orange-500/25"
                            : "bg-stone-200/70 dark:bg-stone-800"
                        }`}
                      >
                        <MessageSquare
                          className={`h-2.5 w-2.5 ${
                            isActive ? "text-orange-500 dark:text-orange-400" : "text-stone-500"
                          }`}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div
                          className={`truncate text-[12px] ${
                            isActive
                              ? "font-bold text-orange-600 dark:text-orange-300"
                              : `font-medium ${text.primary}`
                          }`}
                        >
                          {sess.title}
                        </div>
                        {lastMsg && (
                          <div className={`mt-0.5 truncate text-[10px] ${text.muted}`}>
                            {lastMsg.content.slice(0, 35)}...
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => onDeleteSession(sess.id, e)}
                      className="ml-1 flex-shrink-0 rounded p-0.5 text-stone-400 opacity-0 transition-all hover:text-rose-500 group-hover:opacity-100"
                      title="Delete Conversation"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </button>
                );
              })}
            </>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className={`border-t ${border.default} p-3 space-y-2`}>
          <div className={`flex items-center gap-2 rounded-xl ${bg.card} border ${border.default} px-3 py-2 shadow-2xs`}>
            <Zap className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <div className={`text-[10px] ${text.muted}`}>{providerName}</div>
              <div className={`truncate text-[11px] font-medium ${text.primary}`}>
                Online
              </div>
            </div>
            <div className="h-2 w-2 rounded-full flex-shrink-0 bg-emerald-500 animate-pulse" />
          </div>
        </div>
      </aside>
    </>
  );
}
