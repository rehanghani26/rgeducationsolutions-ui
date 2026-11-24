import React from "react";
import { Mic, Volume2, Square, X, Sparkles, AlertCircle } from "lucide-react";

export default function VoiceAssistantBanner({
  isVoiceMode,
  isListening,
  isSpeaking,
  isLoading,
  interimTranscript,
  voiceError,
  onStopSpeaking,
  onTurnOffVoice,
}) {
  if (!isVoiceMode && !voiceError) return null;

  return (
    <div className="relative mx-auto w-full max-w-3xl px-3 pt-3">
      <style>{`
        @keyframes soundwave {
          0%, 100% { height: 4px; }
          50% { height: 14px; }
        }
        .animate-soundwave-1 { animation: soundwave 0.8s ease-in-out infinite 0.1s; }
        .animate-soundwave-2 { animation: soundwave 0.8s ease-in-out infinite 0.25s; }
        .animate-soundwave-3 { animation: soundwave 0.8s ease-in-out infinite 0.4s; }
        .animate-soundwave-4 { animation: soundwave 0.8s ease-in-out infinite 0.55s; }
      `}</style>

      {voiceError ? (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-[12px] text-amber-300 backdrop-blur-md shadow-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0 text-amber-400" />
            <span>{voiceError}</span>
          </div>
          <button
            onClick={onTurnOffVoice}
            className="flex-shrink-0 rounded-lg p-1 hover:bg-amber-500/20 text-amber-200 transition-colors cursor-pointer"
            title="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-2xl border border-white/[0.08] bg-[#18181C]/95 px-4 py-2.5 shadow-xl backdrop-blur-xl transition-all"
        >
          {/* Status info */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Visual Indicator */}
            {isLoading ? (
              <div className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#FF7900] to-[#FFA000] text-white shadow-md shadow-[#FF7900]/30">
                <span className="absolute -inset-1 rounded-xl bg-[#FF7900]/30 animate-ping opacity-60" />
                <Sparkles className="h-4 w-4 relative z-10 animate-spin" />
              </div>
            ) : isSpeaking ? (
              <div className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-md shadow-emerald-500/20">
                <Volume2 className="h-4 w-4 animate-pulse" />
              </div>
            ) : isListening ? (
              <div className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-[#FF7900] to-[#FFA000] text-white shadow-md shadow-[#FF7900]/25">
                <span className="absolute -inset-1 rounded-xl bg-[#FF7900]/30 animate-ping opacity-60" />
                <Mic className="h-4 w-4 relative z-10" />
              </div>
            ) : (
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-[#222226] text-[#FFA000] border border-white/[0.08]">
                <Sparkles className="h-4 w-4" />
              </div>
            )}

            {/* Status text & sound wave */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-bold text-white tracking-tight">
                  {isLoading
                    ? "AI is thinking, please wait for response..."
                    : isSpeaking
                    ? "Voice Assistant: Speaking..."
                    : isListening
                    ? "Voice Assistant: Listening..."
                    : "Voice Assistant Ready"}
                </span>

                {/* Animated sound wave bars when speaking, listening, or thinking */}
                {(isSpeaking || isListening || isLoading) && (
                  <div className="flex items-center gap-0.5 h-3">
                    <span className="w-0.5 rounded-full bg-[#FF7900] animate-soundwave-1" />
                    <span className="w-0.5 rounded-full bg-[#FFA000] animate-soundwave-2" />
                    <span className="w-0.5 rounded-full bg-amber-400 animate-soundwave-3" />
                    <span className="w-0.5 rounded-full bg-emerald-400 animate-soundwave-4" />
                  </div>
                )}
              </div>

              {/* Subtitle / Live speech transcript / Thinking status */}
              <div className="text-[11px] truncate text-[#A1A1AA]">
                {isLoading ? (
                  <span className="text-[#FFA000] font-medium flex items-center gap-1.5">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#FF7900] animate-ping" />
                    Querying school ERP tools & synthesizing answer...
                  </span>
                ) : interimTranscript ? (
                  <span className="italic text-[#FFA000] font-medium">
                    &ldquo;{interimTranscript}&rdquo;
                  </span>
                ) : isSpeaking ? (
                  "Reading AI response aloud · Click stop to interrupt"
                ) : (
                  "Speak freely or type below · Pauses will auto-send query"
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
            {isSpeaking && (
              <button
                onClick={onStopSpeaking}
                className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-[11px] font-semibold text-rose-300 hover:bg-rose-500/20 transition-all active:scale-95 cursor-pointer"
                title="Stop speaking"
              >
                <Square className="h-3 w-3 fill-current" />
                <span>Stop Voice</span>
              </button>
            )}

            <button
              onClick={onTurnOffVoice}
              className="flex items-center gap-1 rounded-xl border border-white/[0.08] bg-[#222226] hover:bg-[#2A2A30] px-2.5 py-1 text-[11px] text-[#A1A1AA] hover:text-white transition-all active:scale-95 cursor-pointer"
              title="Turn off voice assistant"
            >
              <span>Turn Off</span>
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
