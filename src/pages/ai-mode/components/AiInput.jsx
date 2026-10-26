import React, { useRef, useEffect } from "react";
import { Send, RefreshCw, Mic, MicOff, Volume2, Square } from "lucide-react";
import { QUICK_CHIPS } from "../ai.constants.js";
import { bg, border, text } from "@/theme/color";

export default function AiInput({
  inputPrompt,
  setInputPrompt,
  onSendMessage,
  loading,
  isListening = false,
  onToggleListening,
  isVoiceMode = false,
  interimTranscript = "",
  isSpeaking = false,
  onStopSpeaking,
}) {
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        160
      )}px`;
    }
  }, [inputPrompt]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <div className={`flex-shrink-0 border-t ${border.default} ${bg.header} px-3 pb-4 pt-3 backdrop-blur-xl sm:px-6`}>
      {/* Quick Chips */}
      <div className="mb-2.5 flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
        {QUICK_CHIPS.map(({ emoji, label, prompt }) => (
          <button
            key={label}
            onClick={() => onSendMessage(prompt)}
            className={`flex-shrink-0 flex items-center gap-1.5 rounded-full border ${border.default} ${bg.card} px-3 py-1.5 text-[11px] ${text.secondary} transition-all hover:border-orange-500/40 hover:${bg.hover} hover:${text.brand} active:scale-95 whitespace-nowrap shadow-2xs cursor-pointer`}
          >
            <span>{emoji}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Floating Status Pill (Speech Recognition or Speech Synthesis) */}
      {(isSpeaking || (isListening && interimTranscript)) && (
        <div className="mb-2 flex items-center justify-between rounded-xl border border-orange-500/30 bg-orange-500/10 px-3 py-1.5 text-[11px] text-orange-700 dark:text-orange-300 shadow-sm animate-fadeSlideUp">
          <div className="flex items-center gap-2 truncate">
            {isSpeaking ? (
              <>
                <Volume2 className="h-3.5 w-3.5 flex-shrink-0 text-emerald-500 animate-pulse" />
                <span className="truncate">Reading response in voice...</span>
              </>
            ) : (
              <>
                <Mic className="h-3.5 w-3.5 flex-shrink-0 text-orange-500 animate-pulse" />
                <span className="truncate italic">
                  Hearing: &ldquo;{interimTranscript}&rdquo;
                </span>
              </>
            )}
          </div>
          {isSpeaking && (
            <button
              onClick={onStopSpeaking}
              className="ml-2 flex items-center gap-1 rounded-md bg-rose-500/20 px-2 py-0.5 text-[10px] font-semibold text-rose-600 dark:text-rose-300 hover:bg-rose-500/30 active:scale-95 cursor-pointer"
            >
              <Square className="h-2.5 w-2.5 fill-current" />
              Stop
            </button>
          )}
        </div>
      )}

      {/* Input Box */}
      <div className={`relative flex items-end gap-2 rounded-2xl border ${border.default} ${bg.card} p-2 shadow-lg transition-all focus-within:border-orange-500/60 focus-within:ring-2 focus-within:ring-orange-500/20 ${
        isListening ? "ring-2 ring-orange-500/30 border-orange-500/50" : ""
      }`}>
        <textarea
          ref={textareaRef}
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isListening
              ? "Listening to your voice... Speak or type anytime..."
              : "Ask anything or command an ERP action (Type or click Mic)..."
          }
          rows={1}
          className={`max-h-40 min-h-[36px] flex-1 resize-none bg-transparent px-2 py-2 text-[13px] ${text.primary} placeholder:text-stone-400 focus:outline-none leading-relaxed`}
        />

        <div className="flex items-center gap-1.5 pb-0.5 flex-shrink-0">
          {/* Microphone button (Voice Input / Dictation) */}
          <button
            onClick={() => onToggleListening?.()}
            className={`relative flex h-9 w-9 items-center justify-center rounded-xl transition-all cursor-pointer ${
              isListening
                ? "bg-rose-500 text-white shadow-md shadow-rose-500/30 hover:bg-rose-600 animate-pulse"
                : isVoiceMode
                ? "bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30 hover:bg-orange-500/25"
                : `${bg.surface} ${text.secondary} hover:${text.primary} border ${border.default} hover:border-orange-500/40`
            }`}
            title={
              isListening
                ? "Stop listening"
                : isVoiceMode
                ? "Voice mode active (Click to pause mic)"
                : "Speak query (Speech-to-text)"
            }
          >
            {isListening ? (
              <>
                <span className="absolute -inset-1 rounded-xl bg-rose-500/40 animate-ping opacity-60" />
                <Mic className="h-4 w-4 relative z-10" />
              </>
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </button>

          {/* Send Button */}
          <button
            onClick={() => onSendMessage()}
            disabled={!inputPrompt.trim() || loading}
            className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
              inputPrompt.trim() && !loading
                ? "gradient-animated text-white shadow-md hover:scale-105 active:scale-95 cursor-pointer"
                : `${bg.surface} ${text.muted} cursor-not-allowed border ${border.subtle}`
            }`}
            title="Send (Enter)"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin text-orange-500" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <div className={`mt-2 flex items-center justify-between px-1 text-[10px] ${text.muted}`}>
        <span>
          {isVoiceMode ? "🎙️ Voice Assistant ON · Speak or type freely" : "Type prompt or click 🎙️ Mic to speak"}
        </span>
        <span className="hidden sm:inline">
          Enter to send · Shift+Enter for new line
        </span>
      </div>
    </div>
  );
}
