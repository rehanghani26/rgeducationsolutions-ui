import React, { memo } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import AIResponseRenderer from "./AIResponseRenderer.jsx";
import AIMessageActions from "./AIMessageActions.jsx";

/* ── Clean, Elegant & Animated AI Avatar Badge (No Blinking Dots, Apple-Grade Luxury Sheen) ── */
export const AnimatedAiAvatar = memo(function AnimatedAiAvatar({
  isSpeaking = false,
  isThinking = false,
}) {
  const active = isSpeaking || isThinking;

  return (
    <div className="relative flex h-8.5 w-8.5 sm:h-9 sm:w-9 flex-shrink-0 items-center justify-center">
      {/* Soft Ambient Sunset Glow (Smooth, Non-Flickering) */}
      <motion.div
        animate={{
          scale: active ? [1, 1.14, 1] : [1, 1.06, 1],
          opacity: active ? [0.45, 0.7, 0.45] : 0.35,
        }}
        transition={{
          duration: active ? 1.6 : 3.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -inset-0.5 rounded-xl bg-gradient-to-tr from-[#FF7900] to-[#FFA000] blur-[4px] -z-10 pointer-events-none"
      />

      {/* Vibrant High-Contrast Sunset Badge */}
      <div className="relative flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-[#FF7900] via-[#FF8500] to-[#FFA000] border border-white/30 shadow-md shadow-[#FF7900]/25 overflow-hidden">
        {/* Upper glass gloss sheen */}
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent pointer-events-none" />

        {/* Diagonal luxury shimmer sweep across the badge (smooth, premium feel) */}
        <motion.div
          animate={{ x: ["-120%", "220%"] }}
          transition={{
            duration: 3.2,
            repeat: Infinity,
            ease: "easeInOut",
            repeatDelay: 1.2,
          }}
          className="absolute inset-0 w-2/3 -skew-x-20 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none"
        />

        {/* Floating Crisp Solid White Sparkles Icon */}
        <motion.div
          animate={{
            scale: active ? [1, 1.12, 1] : [1, 1.05, 1],
            rotate: active ? [0, 6, -6, 0] : [0, 3, -3, 0],
          }}
          transition={{
            duration: active ? 1.6 : 3.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="flex items-center justify-center relative z-10 text-white"
        >
          <Sparkles className="h-4.5 w-4.5 text-white fill-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]" />
        </motion.div>
      </div>
    </div>
  );
});

export default function AIAssistantMessage({
  message,
  idx,
  userPrompt = "",
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
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex items-start gap-3 sm:gap-3.5 group"
    >
      {/* Animated AI Avatar Badge */}
      <AnimatedAiAvatar isSpeaking={isSpeaking} />

      {/* Main Message Content Container */}
      <div className="flex flex-col items-start w-full min-w-0 max-w-[98%] sm:max-w-[94%]">
        <div
          className={`w-full rounded-2xl rounded-tl-xs border bg-[#1A1A1E] p-4 text-white shadow-md transition-all duration-200 ${
            isSpeaking
              ? "ring-2 ring-[#FF7900]/50 border-[#FF7900]/60 shadow-[0_0_24px_rgba(255,121,0,0.22)]"
              : "border-white/[0.08] hover:border-white/[0.12]"
          }`}
        >
          <AIResponseRenderer
            message={message}
            userPrompt={userPrompt || message?.userPrompt || ""}
            onAskAiPrompt={onAskAiPrompt}
            onOpenEditStudent={onOpenEditStudent}
            onSelectStudentForIdCard={onSelectStudentForIdCard}
            onSelectStudentForLeaves={onSelectStudentForLeaves}
            onSelectStudentForReport={onSelectStudentForReport}
          />
        </div>

        {/* Message Actions */}
        <div className="mt-1.5 px-1">
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
    </motion.div>
  );
}
