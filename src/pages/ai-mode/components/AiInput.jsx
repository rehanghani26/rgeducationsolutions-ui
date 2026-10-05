import React, { useRef, useEffect } from "react";
import { Send, RefreshCw } from "lucide-react";
import { QUICK_CHIPS } from "../ai.constants.js";
import { bg, border, text } from "@/theme/color";

export default function AiInput({
  inputPrompt,
  setInputPrompt,
  onSendMessage,
  loading,
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

      {/* Input Box */}
      <div className={`relative flex items-end gap-2 rounded-2xl border ${border.default} ${bg.card} p-2 shadow-lg transition-all focus-within:border-orange-500/60 focus-within:ring-2 focus-within:ring-orange-500/20`}>
        <textarea
          ref={textareaRef}
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything or command an ERP action..."
          rows={1}
          className={`max-h-40 min-h-[36px] flex-1 resize-none bg-transparent px-2 py-2 text-[13px] ${text.primary} placeholder:text-stone-400 focus:outline-none leading-relaxed`}
        />
        <div className="flex items-center gap-1.5 pb-0.5 flex-shrink-0">
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

      <div className={`mt-2 text-center text-[10px] ${text.muted}`}>
        Powered by Advanced System AI · Real-time ERP operations · Press Enter
        to send, Shift+Enter for new line
      </div>
    </div>
  );
}
