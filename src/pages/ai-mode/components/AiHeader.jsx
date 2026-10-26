import React from "react";
import { Menu, ArrowLeft, Mic, MicOff, Volume2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../routes/routes.js";
import { bg, border, text } from "@/theme/color";
import ThemeToggle from "../../../components/ui/ThemeToggle.jsx";

export default function AiHeader({
  onToggleSidebar,
  isVoiceMode = false,
  onToggleVoiceMode,
  isListening = false,
  isSpeaking = false,
}) {
  const navigate = useNavigate();

  return (
    <header className={`relative z-10 flex h-14 flex-shrink-0 items-center justify-between border-b ${border.default} ${bg.header} px-3 backdrop-blur-xl sm:px-5`}>
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Menu toggle */}
        <button
          onClick={onToggleSidebar}
          className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl border ${border.default} ${bg.card} ${text.secondary} hover:${text.primary} transition-all active:scale-95 cursor-pointer`}
          title="Toggle Sidebar"
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2">
          <div className="gradient-animated h-2 w-2 rounded-full shadow-lg" />
          <span className={`text-[13px] font-semibold ${text.primary}`}>
            <span className="hidden sm:inline">School ERP </span>AI Agent
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-300 border border-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Voice Assistant Toggle */}
        <button
          onClick={() => onToggleVoiceMode?.()}
          className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-[11px] font-semibold transition-all active:scale-95 cursor-pointer ${
            isVoiceMode
              ? "border-orange-500/50 bg-gradient-to-r from-orange-500/15 to-amber-500/15 text-orange-600 dark:text-orange-400 shadow-sm shadow-orange-500/10 ring-1 ring-orange-500/30"
              : `border ${border.default} ${bg.card} ${text.secondary} hover:${text.primary} hover:border-stone-400`
          }`}
          title={
            isVoiceMode
              ? "Voice Assistant is ON (Listening & Speaking). Click to turn off."
              : "Turn ON Voice Assistant (Speak and listen to AI responses)"
          }
        >
          {isVoiceMode ? (
            <>
              {isSpeaking ? (
                <Volume2 className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
              ) : (
                <div className="relative flex items-center justify-center">
                  <span className="absolute -inset-0.5 rounded-full bg-orange-500/40 animate-ping" />
                  <Mic className="h-3.5 w-3.5 text-orange-500 relative z-10" />
                </div>
              )}
              <span className="hidden sm:inline">Voice Assistant:</span>
              <span className="font-bold text-orange-600 dark:text-orange-400">
                {isSpeaking ? "Speaking" : isListening ? "Listening" : "ON"}
              </span>
            </>
          ) : (
            <>
              <MicOff className="h-3.5 w-3.5 text-stone-400" />
              <span className="hidden sm:inline">Voice Assistant:</span>
              <span className="text-stone-400">OFF</span>
            </>
          )}
        </button>

        {/* Theme Toggle (supports Light and Dark mode) */}
        <ThemeToggle className="h-8 w-8 p-1.5" />

        {/* Back to ERP */}
        <button
          onClick={() => navigate(ROUTES.DASHBOARD)}
          className="flex items-center gap-1.5 rounded-xl border border-rose-500/25 bg-rose-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-rose-600 dark:text-rose-300 transition-all hover:bg-rose-500/20 active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Back to ERP</span>
          <span className="sm:hidden">Exit</span>
        </button>
      </div>
    </header>
  );
}
