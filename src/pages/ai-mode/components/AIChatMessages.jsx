import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AIUserMessage from "./AIUserMessage.jsx";
import AIAssistantMessage, { AnimatedAiAvatar } from "./AIAssistantMessage.jsx";
import AiStudentEditModal from "./AiStudentEditModal.jsx";

function ThinkingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.96 }}
      transition={{ duration: 0.25 }}
      className="flex items-start gap-3 sm:gap-3.5"
    >
      {/* Unified Elegant AI Avatar in Thinking State */}
      <AnimatedAiAvatar isThinking={true} />

      <div className="rounded-2xl rounded-tl-xs border border-white/[0.08] bg-[#1A1A1E] px-4 py-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <motion.span
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
              className="h-2 w-2 rounded-full bg-[#FF7900]"
            />
            <motion.span
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
              className="h-2 w-2 rounded-full bg-[#FFA000]"
            />
            <motion.span
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
              className="h-2 w-2 rounded-full bg-amber-300"
            />
          </div>
          <span className="text-[12.5px] font-medium text-[#D4D4D8]">
            AI is thinking, please wait for response...
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function AIChatMessages({
  messages = [],
  user,
  loading = false,
  messagesEndRef,
  isSpeaking = false,
  speakingMessageId = null,
  onSpeakMessage,
  onStopSpeaking,
  onAskAiPrompt,
  onRegenerate,
  onRetry,
}) {
  const [editingStudent, setEditingStudent] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [feedbacks, setFeedbacks] = useState({});

  const handleFeedback = (msgId, rating) => {
    setFeedbacks((prev) => ({ ...prev, [msgId]: rating }));
  };

  const handleOpenEdit = (student) => {
    setEditingStudent(student);
    setIsEditModalOpen(true);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3.5 sm:px-6 py-6 space-y-6">
      <AnimatePresence initial={false}>
        {messages.map((msg, idx) => {
          const isUser = msg.role === "user";
          const isCurrentSpeaking =
            isSpeaking &&
            (speakingMessageId === msg.id || speakingMessageId === `msg-${idx}`);

          if (isUser) {
            return (
              <AIUserMessage
                key={msg.id || `msg-user-${idx}`}
                message={msg}
                user={user}
              />
            );
          }

          const prevUserMsg = messages
            .slice(0, idx)
            .reverse()
            .find((m) => m.role === "user");

          return (
            <AIAssistantMessage
              key={msg.id || `msg-ai-${idx}`}
              message={msg}
              idx={idx}
              userPrompt={msg.userPrompt || prevUserMsg?.content || ""}
              isSpeaking={isCurrentSpeaking}
              onSpeak={() => onSpeakMessage?.(msg.content, msg.id || `msg-${idx}`)}
              onStopSpeaking={onStopSpeaking}
              onRegenerate={
                onRegenerate
                  ? () => {
                      const prevUserMsg = messages
                        .slice(0, idx)
                        .reverse()
                        .find((m) => m.role === "user");
                      if (prevUserMsg) onRegenerate(prevUserMsg.content);
                    }
                  : undefined
              }
              onRetry={
                onRetry && msg.isError
                  ? () => {
                      const prevUserMsg = messages
                        .slice(0, idx)
                        .reverse()
                        .find((m) => m.role === "user");
                      if (prevUserMsg) onRetry(prevUserMsg.content);
                    }
                  : undefined
              }
              onFeedback={(rating) => handleFeedback(msg.id || `msg-${idx}`, rating)}
              feedback={feedbacks[msg.id || `msg-${idx}`]}
              onAskAiPrompt={onAskAiPrompt}
              onOpenEditStudent={handleOpenEdit}
              onSelectStudentForIdCard={(student) => {
                onAskAiPrompt?.(
                  `Show student ID card and studio preview for ${
                    student.name || student.studentId
                  }`
                );
              }}
              onSelectStudentForLeaves={(student) => {
                onAskAiPrompt?.(
                  `Show leaves and leave applications for student ${
                    student.name || student.studentId
                  }`
                );
              }}
              onSelectStudentForReport={(student) => {
                onAskAiPrompt?.(
                  `Show full comprehensive 360-degree report for ${
                    student.name || student.studentId
                  }`
                );
              }}
            />
          );
        })}
      </AnimatePresence>

      {/* Thinking / Loading Indicator */}
      <AnimatePresence>{loading && <ThinkingIndicator />}</AnimatePresence>

      {/* Auto-scroll target anchor */}
      <div ref={messagesEndRef} id="ai-chat-messages-end" className="h-4" />

      {/* Edit Student Modal */}
      {editingStudent && (
        <AiStudentEditModal
          isOpen={isEditModalOpen}
          student={editingStudent}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingStudent(null);
          }}
          onSuccess={(updated) => {
            setIsEditModalOpen(false);
            setEditingStudent(null);
            onAskAiPrompt?.(
              `Student ${updated?.name || "record"} has been updated. Show refreshed student details.`
            );
          }}
        />
      )}
    </div>
  );
}
