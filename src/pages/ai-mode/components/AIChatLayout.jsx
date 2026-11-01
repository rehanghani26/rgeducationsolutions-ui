import React from "react";
import AISidebar from "./AISidebar.jsx";
import AIHeader from "./AIHeader.jsx";
import VoiceAssistantBanner from "./VoiceAssistantBanner.jsx";
import AIMessageComposer from "./AIMessageComposer.jsx";

export default function AIChatLayout({
  sidebarOpen,
  onToggleSidebar,
  onCloseSidebar,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onRenameSession,
  searchQuery,
  onSearchChange,
  providerName,
  isVoiceMode,
  onToggleVoiceMode,
  isListening,
  onToggleListening,
  isSpeaking,
  onStopSpeaking,
  interimTranscript,
  voiceError,
  loading,
  inputPrompt,
  setInputPrompt,
  onSendMessage,
  children,
}) {
  return (
    <div
      className="flex h-screen w-screen overflow-hidden bg-[#111111] text-[#FFFFFF]"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Left Sidebar */}
      <AISidebar
        isOpen={sidebarOpen}
        onClose={onCloseSidebar}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={onSelectSession}
        onNewChat={onNewChat}
        onDeleteSession={onDeleteSession}
        onRenameSession={onRenameSession}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        providerName={providerName}
      />

      {/* Main Chat Area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#111111]">
        {/* Top Header */}
        <AIHeader
          onToggleSidebar={onToggleSidebar}
          isVoiceMode={isVoiceMode}
          onToggleVoiceMode={onToggleVoiceMode}
          isListening={isListening}
          isSpeaking={isSpeaking}
          providerName={providerName}
        />

        {/* Voice Assistant Status Banner */}
        <VoiceAssistantBanner
          isVoiceMode={isVoiceMode}
          isListening={isListening}
          isSpeaking={isSpeaking}
          isLoading={loading}
          interimTranscript={interimTranscript}
          voiceError={voiceError}
          onStopSpeaking={onStopSpeaking}
          onTurnOffVoice={() => onToggleVoiceMode(false)}
        />

        {/* Scrollable Center Content */}
        <div className="relative flex-1 overflow-y-auto scrollbar-thin">
          {children}
        </div>

        {/* Fixed Bottom Message Composer */}
        <AIMessageComposer
          inputPrompt={inputPrompt}
          setInputPrompt={setInputPrompt}
          onSendMessage={onSendMessage}
          loading={loading}
          isListening={isListening}
          onToggleListening={onToggleListening}
          isVoiceMode={isVoiceMode}
          interimTranscript={interimTranscript}
          isSpeaking={isSpeaking}
          onStopSpeaking={onStopSpeaking}
        />
      </div>
    </div>
  );
}

