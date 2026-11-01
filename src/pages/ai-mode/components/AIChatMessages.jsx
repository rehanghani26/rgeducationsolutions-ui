import React, { useState } from "react";
import AIUserMessage from "./AIUserMessage.jsx";
import AIAssistantMessage from "./AIAssistantMessage.jsx";
import AiStudentEditModal from "./AiStudentEditModal.jsx";
import { Sparkles } from "lucide-react";

function ThinkingIndicator() {
  return (
    <div className="flex items-start gap-3 sm:gap-3.5">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF7900] to-[#FFA000] shadow-md shadow-[#FF7900]/25">
        <Sparkles className="h-4 w-4 text-white" />
      </div>
      <div className="rounded-2xl rounded-tl-xs border border-[#303030] bg-[#1D1D1D] px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#FF7900] animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="h-2 w-2 rounded-full bg-[#FFA000] animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="h-2 w-2 rounded-full bg-[#FF7900] animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
          <span className="text-[12px] font-medium text-[#A1A1AA]">
            RGES AI is processing your ERP request...
          </span>
        </div>
      </div>
    </div>
  );
}

export default function AIChatMessages({
  messages = [],
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
      {messages.map((msg, idx) => {
        const isUser = msg.role === "user";
        const isCurrentSpeaking =
          isSpeaking &&
          (speakingMessageId === msg.id || speakingMessageId === `msg-${idx}`);

        if (isUser) {
          return (
            <AIUserMessage key={msg.id || `msg-user-${idx}`} message={msg} />
          );
        }

        return (
          <AIAssistantMessage
            key={msg.id || `msg-ai-${idx}`}
            message={msg}
            idx={idx}
            isSpeaking={isCurrentSpeaking}
            onSpeak={() => onSpeakMessage?.(msg.content, msg.id || `msg-${idx}`)}
            onStopSpeaking={onStopSpeaking}
            onRegenerate={
              onRegenerate
                ? () => {
                    // Find preceding user message to regenerate
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
            onSelectStudentForIdCard={(stu) =>
              onAskAiPrompt?.(
                `Show student ID card for ${stu.name} (${stu.admissionNumber})`
              )
            }
            onSelectStudentForLeaves={(stu) =>
              onAskAiPrompt?.(
                `Show leaves for student ${stu.name} (${stu.admissionNumber})`
              )
            }
            onSelectStudentForReport={(stu) =>
              onAskAiPrompt?.(
                `Get comprehensive academic dossier for student ${stu.name} (${stu.admissionNumber})`
              )
            }
          />
        );
      })}

      {/* Loading state indicator */}
      {loading && <ThinkingIndicator />}

      {/* Edit modal */}
      <AiStudentEditModal
        isOpen={isEditModalOpen}
        student={editingStudent}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingStudent(null);
        }}
        onStudentUpdated={(updated) => {
          if (onAskAiPrompt) {
            onAskAiPrompt(
              `Updated record for student ${updated.name}. Please confirm and display updated details.`
            );
          }
        }}
      />

      <div ref={messagesEndRef} />
    </div>
  );
}

