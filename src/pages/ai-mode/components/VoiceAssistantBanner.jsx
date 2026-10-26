import React from "react";
import { Mic, Volume2, Square, X, Sparkles, AlertCircle } from "lucide-react";
import { bg, border, text } from "@/theme/color";

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
      {voiceError ? (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-[12px] text-amber-700 dark:text-amber-300 backdrop-blur-md shadow-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0 text-amber-500" />
            <span>{voiceError}</span>
          </div>
          <button
            onClick={onTurnOffVoice}
            className="flex-shrink-0 rounded-lg p-1 hover:bg-amber-500/20 text-amber-700 dark:text-amber-200 transition-colors"
            title="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-2xl border ${border.default} ${bg.card} px-4 py-2.5 shadow-md backdrop-blur-xl transition-all`}
        >
          {/* Status info */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Visual Indicator */}
            {isSpeaking ? (
              <div className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-md">
                <Volume2 className="h-4 w-4 animate-pulse" />
              </div>
            ) : isListening ? (
              <div className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl gradient-animated text-white shadow-md">
                <span className="absolute -inset-1 rounded-xl bg-orange-500/30 animate-ping opacity-60" />
                <Mic className="h-4 w-4 relative z-10" />
              </div>
            ) : (
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-stone-500/20 text-stone-600 dark:text-stone-300">
                <Sparkles className="h-4 w-4 animate-spin text-orange-500" />
              </div>
            )}

            {/* Status text & sound wave */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className={`text-[12px] font-bold ${text.primary}`}>
                  {isSpeaking
                    ? "Voice Assistant: Speaking..."
                    : isLoading
                    ? "Processing request..."
                    : isListening
                    ? "Voice Assistant: Listening..."
                    : "Voice Assistant Ready"}
                </span>

                {/* Animated sound wave bars when speaking or listening */}
                {(isSpeaking || isListening) && (
                  <div className="flex items-center gap-0.5 h-3">
                    <span className="w-0.5 rounded-full bg-orange-500 animate-soundwave-1" />
                    <span className="w-0.5 rounded-full bg-amber-500 animate-soundwave-2" />
                    <span className="w-0.5 rounded-full bg-orange-400 animate-soundwave-3" />
                    <span className="w-0.5 rounded-full bg-emerald-500 animate-soundwave-4" />
                  </div>
                )}
              </div>

              {/* Subtitle / Live speech transcript */}
              <div className={`text-[11px] truncate ${text.secondary}`}>
                {interimTranscript ? (
                  <span className="italic text-orange-600 dark:text-orange-400 font-medium">
                    &ldquo;{interimTranscript}&rdquo;
                  </span>
                ) : isSpeaking ? (
                  "Reading AI response aloud · Click stop to interrupt"
                ) : isLoading ? (
                  "RGES AI is generating response..."
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
                className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-[11px] font-semibold text-rose-600 dark:text-rose-300 hover:bg-rose-500/20 transition-all active:scale-95 cursor-pointer"
                title="Stop speaking"
              >
                <Square className="h-3 w-3 fill-current" />
                <span>Stop Voice</span>
              </button>
            )}

            <button
              onClick={onTurnOffVoice}
              className={`flex items-center gap-1 rounded-xl border ${border.default} ${bg.hover} px-2.5 py-1 text-[11px] ${text.secondary} hover:${text.primary} transition-all active:scale-95 cursor-pointer`}
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
