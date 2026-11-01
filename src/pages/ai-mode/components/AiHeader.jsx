import React from "react";
import { Menu, ArrowLeft, Mic, MicOff, Volume2, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../routes/routes.js";
import ThemeToggle from "../../../components/ui/ThemeToggle.jsx";
import AIProviderStatus from "./AIProviderStatus.jsx";

export default function AIHeader({
  onToggleSidebar,
  isVoiceMode = false,
  onToggleVoiceMode,
  isListening = false,
  isSpeaking = false,
  providerName = "NVIDIA AI",
}) {
  const navigate = useNavigate();

  return (
    <header className="relative z-10 flex h-14 flex-shrink-0 items-center justify-between border-b border-[#303030] bg-[#141414] px-3.5 backdrop-blur-xl sm:px-5">
      {/* Left side: Sidebar Toggle & Brand */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        <button
          onClick={onToggleSidebar}
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl border border-[#303030] bg-[#1D1D1D] text-[#A1A1AA] hover:text-[#FFFFFF] hover:border-[#FF7900]/40 transition-all active:scale-95 cursor-pointer"
          title="Toggle Sidebar"
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2.5">
          {/* Status Dot */}
          <div className="relative flex items-center justify-center">
            <span className="absolute h-2.5 w-2.5 rounded-full bg-emerald-500/40 animate-ping" />
            <span className="relative h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          </div>

          <div className="flex flex-col leading-tight">
            <span className="text-[13px] font-bold text-[#FFFFFF] tracking-tight">
              RGES ERP AI
            </span>
            <span className="hidden sm:inline text-[10px] text-[#A1A1AA]">
              Enterprise School Intelligence
            </span>
          </div>

          {/* Live Badge */}
          <span className="hidden xs:inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[9.5px] font-bold text-emerald-400">
            Live
          </span>
        </div>
      </div>

      {/* Right side: Provider status, Voice Toggle, Theme, Back to ERP */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Provider badge */}
        <div className="hidden md:flex">
          <AIProviderStatus providerName={providerName} variant="badge" />
        </div>

        {/* Voice Assistant Toggle */}
        <button
          onClick={() => onToggleVoiceMode?.()}
          className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-[11px] font-bold transition-all active:scale-95 cursor-pointer ${
            isVoiceMode
              ? "border-[#FF7900] bg-[#FF7900]/15 text-[#FFA000] shadow-[0_0_12px_rgba(255,121,0,0.15)] ring-1 ring-[#FF7900]/30"
              : "border-[#303030] bg-[#1D1D1D] text-[#A1A1AA] hover:text-[#FFFFFF] hover:border-[#FF7900]/40"
          }`}
          title={
            isVoiceMode
              ? "Voice Assistant is ON (Listening & Speaking). Click to turn off."
              : "Turn ON Voice Assistant"
          }
        >
          {isVoiceMode ? (
            <>
              {isSpeaking ? (
                <Volume2 className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
              ) : (
                <div className="relative flex items-center justify-center">
                  <span className="absolute -inset-0.5 rounded-full bg-[#FF7900]/50 animate-ping" />
                  <Mic className="h-3.5 w-3.5 text-[#FF7900] relative z-10" />
                </div>
              )}
              <span className="hidden sm:inline">Voice:</span>
              <span className="font-bold text-[#FFA000]">
                {isSpeaking ? "Speaking" : isListening ? "Listening" : "ON"}
              </span>
            </>
          ) : (
            <>
              <MicOff className="h-3.5 w-3.5 text-[#A1A1AA]" />
              <span className="hidden sm:inline">Voice:</span>
              <span className="text-[#A1A1AA]">OFF</span>
            </>
          )}
        </button>

        {/* Theme Toggle */}
        <div className="flex items-center">
          <ThemeToggle />
        </div>

        {/* Back to ERP button */}
        <button
          onClick={() => navigate(ROUTES?.DASHBOARD || "/dashboard")}
          className="flex items-center gap-1.5 rounded-xl border border-[#303030] bg-[#1D1D1D] px-2.5 py-1.5 text-[11px] font-semibold text-[#A1A1AA] hover:text-[#FFFFFF] hover:border-[#FF7900]/40 transition-all active:scale-95 cursor-pointer"
          title="Return to ERP Dashboard"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Back to ERP</span>
        </button>
      </div>
    </header>
  );
}
