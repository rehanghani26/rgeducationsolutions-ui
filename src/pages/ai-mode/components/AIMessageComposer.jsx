import React, { useRef, useEffect } from "react";
import { Send, RefreshCw, Mic, Volume2, Square, Sparkles } from "lucide-react";
import AIQuickActions from "./AIQuickActions.jsx";

export default function AIMessageComposer({
  inputPrompt = "",
  setInputPrompt,
  onSendMessage,
  loading = false,
  isListening = false,
  onToggleListening,
  isVoiceMode = false,
  interimTranscript = "",
  isSpeaking = false,
  onStopSpeaking,
}) {
  const textareaRef = useRef(null);

  // Auto-resize textarea dynamically
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        180
      )}px`;
    }
  }, [inputPrompt]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (inputPrompt.trim() && !loading) {
        onSendMessage();
      }
    }
  };

  const canSend = inputPrompt.trim() && !loading;

  return (
    <div className="flex-shrink-0 border-t border-[#303030] bg-[#141414]/95 px-3.5 pb-4 pt-2.5 backdrop-blur-xl sm:px-6">
      <div className="max-w-4xl mx-auto space-y-2">
        {/* Quick Actions Chips */}
        <AIQuickActions onSelectAction={onSendMessage} />

        {/* Live Voice Status Pill when active */}
        {(isSpeaking || (isListening && interimTranscript)) && (
          <div className="flex items-center justify-between rounded-xl border border-[#FF7900]/30 bg-[#FF7900]/10 px-3 py-1.5 text-[11px] text-[#FFA000] shadow-sm animate-fadeSlideUp">
            <div className="flex items-center gap-2 truncate">
              {isSpeaking ? (
                <>
                  <Volume2 className="h-3.5 w-3.5 flex-shrink-0 text-emerald-400 animate-pulse" />
                  <span className="truncate">Reading response in voice...</span>
                </>
              ) : (
                <>
                  <Mic className="h-3.5 w-3.5 flex-shrink-0 text-[#FF7900] animate-pulse" />
                  <span className="truncate italic">
                    Hearing: &ldquo;{interimTranscript}&rdquo;
                  </span>
                </>
              )}
            </div>
            {isSpeaking && onStopSpeaking && (
              <button
                onClick={onStopSpeaking}
                className="ml-2 flex items-center gap-1 rounded-md bg-rose-500/20 px-2 py-0.5 text-[10px] font-semibold text-rose-300 hover:bg-rose-500/30 active:scale-95 cursor-pointer"
              >
                <Square className="h-2.5 w-2.5 fill-current" />
                Stop
              </button>
            )}
          </div>
        )}

        {/* Large Rounded Input Container */}
        <div
          className={`group relative flex items-end gap-2 rounded-2xl border border-[#303030] bg-[#1D1D1D] p-2.5 shadow-xl transition-all duration-200 focus-within:border-[#FF7900] focus-within:ring-2 focus-within:ring-[#FF7900]/25 focus-within:shadow-[0_0_20px_rgba(255,121,0,0.12)] ${
            isListening
              ? "border-[#FF7900] ring-2 ring-[#FF7900]/30 shadow-[0_0_20px_rgba(255,121,0,0.2)]"
              : ""
          }`}
        >
          {/* Subtle Sparkle Indicator */}
          <div className="hidden sm:flex pl-1.5 pb-2 text-[#A1A1AA] group-focus-within:text-[#FFA000] transition-colors">
            <Sparkles className="h-4 w-4" />
          </div>

          {/* Multiline Textarea */}
          <textarea
            ref={textareaRef}
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isListening
                ? "Listening... Speak now or type anytime..."
                : "Ask anything or command an ERP action (e.g. 'Show Class 10 attendance', 'Show pending fees')..."
            }
            rows={1}
            disabled={loading}
            className="max-h-44 min-h-[36px] flex-1 resize-none bg-transparent px-1.5 py-1 text-[13px] leading-relaxed text-[#FFFFFF] placeholder-[#A1A1AA] focus:outline-none disabled:opacity-50"
          />

          {/* Controls: Mic & Send Button */}
          <div className="flex items-center gap-1.5 pb-0.5 flex-shrink-0">
            {/* Microphone button */}
            <button
              onClick={() => onToggleListening?.()}
              className={`relative flex h-9 w-9 items-center justify-center rounded-xl transition-all cursor-pointer ${
                isListening
                  ? "bg-rose-500 text-white shadow-lg shadow-rose-500/40 hover:bg-rose-600"
                  : isVoiceMode
                  ? "bg-[#FF7900]/20 text-[#FFA000] border border-[#FF7900]/40 hover:bg-[#FF7900]/30"
                  : "border border-[#303030] bg-[#141414] text-[#A1A1AA] hover:text-[#FFFFFF] hover:border-[#FF7900]/40"
              }`}
              title={
                isListening
                  ? "Stop listening"
                  : isVoiceMode
                  ? "Voice mode active (Click to mute)"
                  : "Speak query (Speech-to-text)"
              }
            >
              {isListening ? (
                <>
                  <span className="absolute -inset-1 rounded-xl bg-rose-500/40 animate-ping opacity-75" />
                  <Mic className="h-4 w-4 relative z-10" />
                </>
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </button>

            {/* Send button */}
            <button
              onClick={() => onSendMessage()}
              disabled={!canSend}
              className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 ${
                canSend
                  ? "bg-gradient-to-r from-[#FF7900] to-[#FFA000] text-white shadow-md shadow-[#FF7900]/30 hover:scale-105 active:scale-95 cursor-pointer"
                  : "border border-[#303030] bg-[#141414] text-[#A1A1AA]/40 cursor-not-allowed"
              }`}
              title="Send message (Enter)"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin text-[#FFA000]" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Small Helper Text */}
        <div className="flex items-center justify-between px-1 text-[11px] text-[#A1A1AA]">
          <span>Type a message or use voice to control your ERP.</span>
          <span className="hidden sm:inline font-mono text-[10px]">
            Enter to send · Shift + Enter for new line
          </span>
        </div>
      </div>
    </div>
  );
}

