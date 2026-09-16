import React, { useState } from "react";
import {
  Sparkles,
  User as UserIcon,
  Copy,
  Check,
  Zap,
  ExternalLink,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import MarkdownRenderer from "./MarkdownRenderer.jsx";

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 rounded-full bg-gradient-to-tr from-indigo-400 to-purple-400"
          style={{
            animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

export default function AiMessages({ messages, loading, messagesEndRef }) {
  const navigate = useNavigate();
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
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
              className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl shadow-lg ${
                isUser ? "bg-indigo-600" : "gradient-animated"
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
              {/* Tool Execution Cards */}
              {!isUser && msg.actionsExecuted?.length > 0 && (
                <div className="mb-2 w-full space-y-2">
                  {msg.actionsExecuted.map((act, ai) => (
                    <div
                      key={ai}
                      className="rounded-xl border border-emerald-500/25 bg-emerald-950/30 p-3"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-300">
                          <Zap className="h-3 w-3 text-emerald-400" />
                          {act.tool || act.toolName}
                        </span>
                        <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-bold text-emerald-300 uppercase">
                          {act.status || "Executed"}
                        </span>
                      </div>
                      {act.result?.message && (
                        <p className="text-[12px] text-slate-300">
                          {act.result.message}
                        </p>
                      )}
                      {act.result?.actionLink && (
                        <button
                          onClick={() => navigate(act.result.actionLink)}
                          className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-300 hover:text-white transition-colors"
                        >
                          View in ERP <ExternalLink className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Message Content */}
              <div
                className={`rounded-2xl px-4 py-3 shadow-md ${
                  isUser
                    ? "bg-indigo-600 text-white rounded-tr-sm"
                    : `border border-white/8 bg-[#111828] rounded-tl-sm ${
                        msg.isError ? "border-rose-500/30 bg-rose-950/20" : ""
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
                <span className="text-[10px] text-slate-600">
                  {msg.timestamp}
                </span>
                {!isUser && (
                  <button
                    onClick={() => handleCopy(msg.content, idx)}
                    className="rounded p-1 text-slate-600 opacity-0 transition-all hover:text-slate-300 group-hover:opacity-100"
                    title="Copy message"
                  >
                    {copiedIndex === idx ? (
                      <Check className="h-3 w-3 text-emerald-400" />
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
          <div className="gradient-animated flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl shadow-lg">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div className="rounded-2xl rounded-tl-sm border border-white/8 bg-[#111828] px-4 py-3 shadow-md">
            <div className="flex items-center gap-2">
              <TypingDots />
              <span className="text-[11px] text-slate-500">
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
