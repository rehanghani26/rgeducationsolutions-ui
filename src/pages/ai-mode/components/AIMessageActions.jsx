import React, { useState } from "react";
import {
  Copy,
  Check,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Volume2,
  VolumeX,
  AlertCircle,
} from "lucide-react";

/**
 * Message action bar for AI responses:
 * - Copy response
 * - Regenerate response
 * - Like / Dislike feedback
 * - Voice Read Aloud / Stop
 * - Retry failed requests
 * - Timestamp
 */
export default function AIMessageActions({
  content = "",
  timestamp = "",
  isError = false,
  isSpeaking = false,
  onSpeak,
  onStopSpeaking,
  onRegenerate,
  onRetry,
  onFeedback,
  feedback = null, // 'like' | 'dislike' | null
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-1.5 pt-1 text-[#A1A1AA]">
      {/* Timestamp */}
      {timestamp && (
        <span className="text-[11px] text-[#A1A1AA]/80 font-mono select-none mr-1">
          {timestamp}
        </span>
      )}

      {/* If error: Retry button */}
      {isError && onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-all cursor-pointer"
          title="Retry request"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Retry</span>
        </button>
      )}

      {!isError && (
        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          {/* Read Aloud button */}
          {onSpeak && (
            <button
              onClick={isSpeaking ? onStopSpeaking : onSpeak}
              className={`p-1 rounded-md transition-all cursor-pointer ${
                isSpeaking
                  ? "bg-[#FF7900]/20 text-[#FF7900] ring-1 ring-[#FF7900]/40"
                  : "hover:bg-[#1D1D1D] hover:text-[#FFFFFF]"
              }`}
              title={isSpeaking ? "Stop speaking" : "Read response aloud"}
            >
              {isSpeaking ? (
                <div className="flex items-center gap-1 px-1">
                  <div className="flex items-center gap-0.5 h-2.5">
                    <span className="w-0.5 h-2 rounded-full bg-[#FF7900] animate-pulse" />
                    <span className="w-0.5 h-3 rounded-full bg-[#FFA000] animate-bounce" />
                    <span className="w-0.5 h-2 rounded-full bg-[#FF7900] animate-pulse" />
                  </div>
                  <VolumeX className="h-3 w-3 text-[#FF7900]" />
                </div>
              ) : (
                <Volume2 className="h-3.5 w-3.5" />
              )}
            </button>
          )}

          {/* Copy response */}
          <button
            onClick={handleCopy}
            className="p-1 rounded-md hover:bg-[#1D1D1D] hover:text-[#FFFFFF] transition-all cursor-pointer"
            title="Copy response"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>

          {/* Regenerate */}
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              className="p-1 rounded-md hover:bg-[#1D1D1D] hover:text-[#FFFFFF] transition-all cursor-pointer"
              title="Regenerate response"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Like */}
          {onFeedback && (
            <button
              onClick={() => onFeedback(feedback === "like" ? null : "like")}
              className={`p-1 rounded-md transition-all cursor-pointer ${
                feedback === "like"
                  ? "text-[#FF7900] bg-[#FF7900]/15"
                  : "hover:bg-[#1D1D1D] hover:text-[#FFFFFF]"
              }`}
              title="Good response"
            >
              <ThumbsUp className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Dislike */}
          {onFeedback && (
            <button
              onClick={() =>
                onFeedback(feedback === "dislike" ? null : "dislike")
              }
              className={`p-1 rounded-md transition-all cursor-pointer ${
                feedback === "dislike"
                  ? "text-rose-400 bg-rose-500/15"
                  : "hover:bg-[#1D1D1D] hover:text-[#FFFFFF]"
              }`}
              title="Poor response"
            >
              <ThumbsDown className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

