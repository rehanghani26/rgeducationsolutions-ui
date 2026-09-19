import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { useAiChat } from "./useAiChat.js";
import AiSidebar from "./components/AiSidebar.jsx";
import AiHeader from "./components/AiHeader.jsx";
import AiWelcome from "./components/AiWelcome.jsx";
import AiMessages from "./components/AiMessages.jsx";
import AiInput from "./components/AiInput.jsx";

export default function AiMode() {
  const { user } = useSelector((state) => state.auth);
  const [searchParams, setSearchParams] = useSearchParams();
  const promptParam = searchParams.get("prompt");
  const processedPromptRef = useRef(false);

  const [sidebarOpen, setSidebarOpen] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 1100 : true
  );

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
  } = useAiChat();

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
        .ai-msg-enter { animation: fadeSlideUp 0.35s cubic-bezier(0.4,0,0.2,1) forwards; }
        .gradient-animated {
          background: linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899, #6366f1);
          background-size: 300% 300%;
          animation: gradientShift 4s ease infinite;
        }
        .scrollbar-thin::-webkit-scrollbar { width: 4px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.3); border-radius: 99px; }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: rgba(99,102,241,0.5); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      <div
        className="flex h-screen w-screen overflow-hidden bg-[#080c14] text-slate-100"
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
          <AiHeader onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

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
              />
            )}
          </div>

          <AiInput
            inputPrompt={inputPrompt}
            setInputPrompt={setInputPrompt}
            onSendMessage={handleSendMessage}
            loading={loading}
          />
        </div>
      </div>
    </>
  );
}
