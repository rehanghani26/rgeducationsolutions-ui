import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { useAiChat } from "./useAiChat.js";
import { useVoiceAssistant } from "./useVoiceAssistant.js";
import AiSidebar from "./components/AiSidebar.jsx";
import AiHeader from "./components/AiHeader.jsx";
import AiWelcome from "./components/AiWelcome.jsx";
import AiMessages from "./components/AiMessages.jsx";
import AiInput from "./components/AiInput.jsx";
import VoiceAssistantBanner from "./components/VoiceAssistantBanner.jsx";
import { bg, text } from "@/theme/color";

export default function AiMode() {
  const { user } = useSelector((state) => state.auth);
  const [searchParams, setSearchParams] = useSearchParams();
  const promptParam = searchParams.get("prompt");
  const processedPromptRef = useRef(false);

  const [sidebarOpen, setSidebarOpen] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 1100 : true
  );

  // References to keep callbacks current without stale closures
  const speakRef = useRef(null);
  const isVoiceModeRef = useRef(false);

  const {
    filteredSessions,
    activeSessionId,
    setActiveSessionId,
    messages,
    inputPrompt,
    setInputPrompt,
    loading,
    searchQuery,
    setSearchQuery,
    providerName,
    messagesEndRef,
    handleNewChat,
    handleDeleteSession,
    handleSendMessage,
  } = useAiChat({
    onAiResponse: (aiMsg) => {
      // If voice assistant mode is active, automatically read AI response aloud
      if (isVoiceModeRef.current && speakRef.current && aiMsg?.content) {
        speakRef.current(aiMsg.content, aiMsg.id);
      }
    },
  });

  const {
    isSpeechRecSupported,
    isSpeechSynSupported,
    isVoiceMode,
    toggleVoiceMode,
    isListening,
    toggleListening,
    isSpeaking,
    speakingMessageId,
    speak,
    stopSpeaking,
    interimTranscript,
    voiceError,
  } = useVoiceAssistant({
    isLoading: loading,
    onSpeechInput: (text) => {
      // Update the textarea live as user speaks
      setInputPrompt(text);
    },
    onSpeechFinal: (finalText) => {
      // Auto-send query when speech pause is detected
      if (finalText && finalText.trim()) {
        handleSendMessage(finalText.trim());
      }
    },
  });

  // Sync ref values for callbacks
  useEffect(() => {
    speakRef.current = speak;
    isVoiceModeRef.current = isVoiceMode;
  }, [speak, isVoiceMode]);

  // Execute prompt from URL if present
  useEffect(() => {
    if (promptParam && !processedPromptRef.current) {
      processedPromptRef.current = true;
      handleSendMessage(promptParam);
      // Clean query string
      setSearchParams({}, { replace: true });
    }
  }, [promptParam, handleSendMessage, setSearchParams]);

  // Responsive sidebar resize listener
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1100) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSelectSession = (id) => {
    setActiveSessionId(id);
    if (window.innerWidth < 1100) setSidebarOpen(false);
  };

  const handleCreateNewChat = () => {
    handleNewChat();
    if (window.innerWidth < 1100) setSidebarOpen(false);
  };

  const userName = user?.name?.split(" ")[0] || "Admin";

  return (
    <>
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes soundwave {
          0%, 100% { height: 3px; }
          50% { height: 14px; }
        }
        .ai-msg-enter { animation: fadeSlideUp 0.35s cubic-bezier(0.4,0,0.2,1) forwards; }
        .gradient-animated {
          background: linear-gradient(135deg, #f97316, #ea580c, #f59e0b, #f97316);
          background-size: 300% 300%;
          animation: gradientShift 4s ease infinite;
        }
        .animate-soundwave-1 { animation: soundwave 0.7s ease-in-out infinite; }
        .animate-soundwave-2 { animation: soundwave 0.7s ease-in-out infinite 0.18s; }
        .animate-soundwave-3 { animation: soundwave 0.7s ease-in-out infinite 0.36s; }
        .animate-soundwave-4 { animation: soundwave 0.7s ease-in-out infinite 0.12s; }
        .scrollbar-thin::-webkit-scrollbar { width: 4px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(249,115,22,0.3); border-radius: 99px; }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: rgba(249,115,22,0.5); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      <div
        className={`flex h-screen w-screen overflow-hidden ${bg.page} ${text.primary}`}
        style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
      >
        {/* Left Sidebar */}
        <AiSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          sessions={filteredSessions}
          activeSessionId={activeSessionId}
          onSelectSession={handleSelectSession}
          onNewChat={handleCreateNewChat}
          onDeleteSession={handleDeleteSession}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          providerName={providerName}
        />

        {/* Main Chat Area */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <AiHeader
            onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
            isVoiceMode={isVoiceMode}
            onToggleVoiceMode={toggleVoiceMode}
            isListening={isListening}
            isSpeaking={isSpeaking}
          />

          {/* Voice Assistant Status Banner */}
          <VoiceAssistantBanner
            isVoiceMode={isVoiceMode}
            isListening={isListening}
            isSpeaking={isSpeaking}
            isLoading={loading}
            interimTranscript={interimTranscript}
            voiceError={voiceError}
            onStopSpeaking={stopSpeaking}
            onTurnOffVoice={() => toggleVoiceMode(false)}
          />

          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {messages.length === 0 ? (
              <AiWelcome
                userName={userName}
                onSelectPrompt={handleSendMessage}
              />
            ) : (
              <AiMessages
                messages={messages}
                loading={loading}
                messagesEndRef={messagesEndRef}
                isSpeaking={isSpeaking}
                speakingMessageId={speakingMessageId}
                onSpeakMessage={(msgContent, id) => speak(msgContent, id)}
                onStopSpeaking={stopSpeaking}
                onAskAiPrompt={handleSendMessage}
              />
            )}
          </div>

          <AiInput
            inputPrompt={inputPrompt}
            setInputPrompt={setInputPrompt}
            onSendMessage={handleSendMessage}
            loading={loading}
            isListening={isListening}
            onToggleListening={toggleListening}
            isVoiceMode={isVoiceMode}
            interimTranscript={interimTranscript}
            isSpeaking={isSpeaking}
            onStopSpeaking={stopSpeaking}
          />
        </div>
      </div>
    </>
  );
}
