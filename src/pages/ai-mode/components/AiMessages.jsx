import React, { useState } from "react";
import {
  Sparkles,
  User as UserIcon,
  Copy,
  Check,
} from "lucide-react";
import MarkdownRenderer from "./MarkdownRenderer.jsx";
import { bg, border, text } from "@/theme/color";

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 rounded-full bg-gradient-to-tr from-orange-400 to-amber-400"
          style={{
            animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

export default function AiMessages({ messages, loading, messagesEndRef }) {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleCopy = (textContent, idx) => {
    navigator.clipboard.writeText(textContent);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 space-y-6 sm:px-6">
      {messages.map((msg, idx) => {
        const isUser = msg.role === "user";
        return (
          <div
            key={idx}
            className={`ai-msg-enter flex items-start gap-3 sm:gap-4 ${
              isUser ? "flex-row-reverse" : "flex-row"
            }`}
          >
            {/* Avatar */}
            <div
              className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl shadow-md ${
                isUser ? bg.brandGradient : "gradient-animated"
              }`}
            >
              {isUser ? (
                <UserIcon className="h-4 w-4 text-white" />
              ) : (
                <Sparkles className="h-4 w-4 text-white" />
              )}
            </div>

            {/* Bubble */}
            <div
              className={`group relative max-w-[85%] sm:max-w-[78%] ${
                isUser ? "items-end" : "items-start"
              } flex flex-col gap-1`}
            >

              {/* Message Content */}
              <div
                className={`rounded-2xl px-4 py-3 shadow-sm ${
                  isUser
                    ? `${bg.brandGradient} text-white rounded-tr-sm shadow-orange-500/10`
                    : `border ${border.default} ${bg.card} rounded-tl-sm ${text.primary} ${
                        msg.isError ? "border-rose-500/40 bg-rose-50/80 dark:bg-rose-950/20" : ""
                      }`
                }`}
              >
                {isUser ? (
                  <p className="text-[13px] leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </p>
                ) : (
                  <MarkdownRenderer text={msg.content} />
                )}
              </div>

              {/* Footer (Timestamp + Copy) */}
              <div
                className={`flex items-center gap-2 px-1 ${
                  isUser ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <span className={`text-[10px] ${text.muted}`}>
                  {msg.timestamp}
                </span>
                {!isUser && (
                  <button
                    onClick={() => handleCopy(msg.content, idx)}
                    className="rounded p-1 text-stone-400 hover:text-stone-700 dark:text-stone-500 dark:hover:text-stone-200 opacity-0 transition-all group-hover:opacity-100 cursor-pointer"
                    title="Copy message"
                  >
                    {copiedIndex === idx ? (
                      <Check className="h-3 w-3 text-emerald-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Thinking Indicator */}
      {loading && (
        <div className="ai-msg-enter flex items-start gap-3 sm:gap-4">
          <div className="gradient-animated flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl shadow-md">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div className={`rounded-2xl rounded-tl-sm border ${border.default} ${bg.card} px-4 py-3 shadow-sm`}>
            <div className="flex items-center gap-2">
              <TypingDots />
              <span className={`text-[11px] ${text.secondary}`}>
                RGES ERP AI is thinking...
              </span>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
