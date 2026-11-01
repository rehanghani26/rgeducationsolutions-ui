import React from "react";
import { Sparkles } from "lucide-react";
import AIResponseRenderer from "./AIResponseRenderer.jsx";
import AIMessageActions from "./AIMessageActions.jsx";

export default function AIAssistantMessage({
  message,
  idx,
  isSpeaking = false,
  onSpeak,
  onStopSpeaking,
  onRegenerate,
  onRetry,
  onFeedback,
  feedback = null,
  onAskAiPrompt,
  onOpenEditStudent,
  onSelectStudentForIdCard,
  onSelectStudentForLeaves,
  onSelectStudentForReport,
}) {
  return (
    <div className="flex items-start gap-3 sm:gap-3.5 group">
      {/* AI Glowing Avatar */}
      <div className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF7900] to-[#FFA000] shadow-md shadow-[#FF7900]/25">
        <Sparkles className="h-4 w-4 text-white" />
      </div>

      {/* Main Message Content Container */}
      <div className="flex flex-col items-start w-full min-w-0 max-w-[96%] sm:max-w-[92%]">
        <div
          className={`w-full rounded-2xl rounded-tl-xs border border-[#303030] bg-[#1D1D1D] p-4 text-[#FFFFFF] shadow-sm transition-all duration-200 ${
            isSpeaking
              ? "ring-2 ring-[#FF7900]/40 border-[#FF7900]/50 shadow-[0_0_20px_rgba(255,121,0,0.15)]"
              : ""
          }`}
        >
          <AIResponseRenderer
            message={message}
            onAskAiPrompt={onAskAiPrompt}
            onOpenEditStudent={onOpenEditStudent}
            onSelectStudentForIdCard={onSelectStudentForIdCard}
            onSelectStudentForLeaves={onSelectStudentForLeaves}
            onSelectStudentForReport={onSelectStudentForReport}
          />
        </div>

        {/* Message Actions */}
        <div className="mt-1 px-1">
          <AIMessageActions
            content={message.content}
            timestamp={message.timestamp}
            isError={message.isError}
            isSpeaking={isSpeaking}
            onSpeak={onSpeak}
            onStopSpeaking={onStopSpeaking}
            onRegenerate={onRegenerate}
            onRetry={onRetry}
            onFeedback={onFeedback}
            feedback={feedback}
          />
        </div>
      </div>
    </div>
  );
}

