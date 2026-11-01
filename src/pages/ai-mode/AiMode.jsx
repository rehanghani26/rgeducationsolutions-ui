import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { useAiChat } from "./useAiChat.js";
import { useVoiceAssistant } from "./useVoiceAssistant.js";
import AIChatLayout from "./components/AIChatLayout.jsx";
import AIWelcomeScreen from "./components/AIWelcomeScreen.jsx";
import AIChatMessages from "./components/AIChatMessages.jsx";

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
    handleRenameSession,
    handleSendMessage,
    handleRegenerate,
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
      setInputPrompt(text);
    },
    onSpeechFinal: (finalText) => {
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

  // Heading user name (defaults to Rehan if not available)
  const userName = user?.name?.split(" ")[0] || "Rehan";

  return (
    <>
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
          40% { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        .animate-fadeSlideUp { animation: fadeSlideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        .scrollbar-thin::-webkit-scrollbar { width: 5px; height: 5px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #303030; border-radius: 99px; }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: #FF7900; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      <AIChatLayout
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        onCloseSidebar={() => setSidebarOpen(false)}
        sessions={filteredSessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleCreateNewChat}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        providerName={providerName}
        isVoiceMode={isVoiceMode}
        onToggleVoiceMode={toggleVoiceMode}
        isListening={isListening}
        onToggleListening={toggleListening}
        isSpeaking={isSpeaking}
        onStopSpeaking={stopSpeaking}
        interimTranscript={interimTranscript}
        voiceError={voiceError}
        loading={loading}
        inputPrompt={inputPrompt}
        setInputPrompt={setInputPrompt}
        onSendMessage={handleSendMessage}
      >
        {messages.length === 0 ? (
          <AIWelcomeScreen
            userName={userName}
            onSelectPrompt={handleSendMessage}
          />
        ) : (
          <AIChatMessages
            messages={messages}
            loading={loading}
            messagesEndRef={messagesEndRef}
            isSpeaking={isSpeaking}
            speakingMessageId={speakingMessageId}
            onSpeakMessage={(msgContent, id) => speak(msgContent, id)}
            onStopSpeaking={stopSpeaking}
            onAskAiPrompt={handleSendMessage}
            onRegenerate={handleRegenerate}
            onRetry={handleRegenerate}
          />
        )}
      </AIChatLayout>
    </>
  );
}
