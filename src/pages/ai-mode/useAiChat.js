import { useState, useEffect, useRef, useCallback } from "react";
import { STORAGE_KEY_SESSIONS } from "./ai.constants.js";
import { sendAiChatMessage, fetchAiHealth } from "./ai.service.js";

const DEFAULT_SESSION = {
  id: "session-1",
  title: "New Conversation",
  messages: [],
  createdAt: Date.now(),
};

export function useAiChat({ onAiResponse, scope } = {}) {
  const storageKey = scope && STORAGE_KEY_SESSIONS + ':' + scope;
  /* ── Sessions State ── */
  const [sessions, setSessions] = useState(() => {
    try {
      const saved = storageKey && localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [{ ...DEFAULT_SESSION }];
    } catch {
      return [{ ...DEFAULT_SESSION }];
    }
  });

  const [activeSessionId, setActiveSessionId] = useState(
    () => sessions[0]?.id || DEFAULT_SESSION.id
  );

  /* ── Input & Status State ── */
  const [inputPrompt, setInputPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [providerName, setProviderName] = useState("NVIDIA AI");

  /* ── Refs ── */
  const messagesEndRef = useRef(null);

  /* ── Derived State ── */
  const activeSession =
    sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const messages = activeSession?.messages || [];

  const filteredSessions = searchQuery
    ? sessions.filter((s) =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : sessions;

  /* ── Check AI Health & Provider Name ── */
  useEffect(() => {
    let isMounted = true;
    fetchAiHealth()
      .then((res) => {
        if (isMounted && res?.provider) {
          setProviderName(`${res.provider} AI`);
        }
      })
      .catch(() => {
        // Keep fallback "NVIDIA AI"
      });
    return () => {
      isMounted = false;
    };
  }, []);

  /* ── Persist sessions ── */
  useEffect(() => {
    try {
      if (storageKey) localStorage.setItem(storageKey, JSON.stringify(sessions));
    } catch {}
  }, [sessions]);

  /* ── Auto-scroll ── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  /* ── Handlers ── */
  const handleNewChat = useCallback(() => {
    const fresh = {
      id: `session-${Date.now()}`,
      title: "New Conversation",
      messages: [],
      createdAt: Date.now(),
    };
    setSessions((prev) => [fresh, ...prev]);
    setActiveSessionId(fresh.id);
  }, []);

  const handleDeleteSession = useCallback(
    (id, e) => {
      if (e?.stopPropagation) e.stopPropagation();
      const filtered = sessions.filter((s) => s.id !== id);
      if (filtered.length === 0) {
        const fresh = {
          id: `session-${Date.now()}`,
          title: "New Conversation",
          messages: [],
          createdAt: Date.now(),
        };
        setSessions([fresh]);
        setActiveSessionId(fresh.id);
      } else {
        setSessions(filtered);
        if (activeSessionId === id) {
          setActiveSessionId(filtered[0].id);
        }
      }
    },
    [sessions, activeSessionId]
  );

  const handleRenameSession = useCallback((id, newTitle) => {
    if (!newTitle?.trim()) return;
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: newTitle.trim() } : s))
    );
  }, []);

  const handleSendMessage = async (promptToSend) => {
    const prompt = (promptToSend || inputPrompt).trim();
    if (!prompt || loading) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const userMessageId = `msg-user-${Date.now()}`;
    const userMessage = {
      id: userMessageId,
      role: "user",
      content: prompt,
      timestamp: timeStr,
    };
    const updatedMessages = [...messages, userMessage];

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          const title =
            s.messages.length === 0
              ? prompt.slice(0, 40) + (prompt.length > 40 ? "..." : "")
              : s.title;
          return { ...s, title, messages: updatedMessages };
        }
        return s;
      })
    );

    setInputPrompt("");
    setLoading(true);

    try {
      const response = await sendAiChatMessage(
        messages.map((m) => ({ role: m.role, content: m.content })),
        prompt
      );

      const aiMessageId = `msg-ai-${Date.now()}`;
      const aiMessage = {
        id: aiMessageId,
        role: "model",
        content: response.reply,
        actionsExecuted: response.actionsExecuted || [],
        userPrompt: prompt,
        isNew: true,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? { ...s, messages: [...updatedMessages, aiMessage] }
            : s
        )
      );

      if (typeof onAiResponse === "function") {
        onAiResponse(aiMessage);
      }
      return aiMessage;
    } catch (err) {
      const errorMessageId = `msg-err-${Date.now()}`;
      const errorMessage = {
        id: errorMessageId,
        role: "model",
        content: `I am currently experiencing a brief delay connecting to the records. Please try your request again in a moment.`,
        userPrompt: prompt,
        isNew: true,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isError: true,
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? { ...s, messages: [...updatedMessages, errorMessage] }
            : s
        )
      );

      if (typeof onAiResponse === "function") {
        onAiResponse(errorMessage);
      }
      return errorMessage;
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = useCallback(
    (promptToResend) => {
      if (!promptToResend || loading) return;
      handleSendMessage(promptToResend);
    },
    [loading, handleSendMessage]
  );

  /* ── Edit Previous User Message & Regenerate from that point ── */
  const handleEditMessage = useCallback(
    async (messageId, newContent) => {
      const prompt = (newContent || "").trim();
      if (!prompt || loading) return;

      const msgIndex = messages.findIndex((m) => m.id === messageId);
      if (msgIndex === -1) return;

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      // Keep conversation history strictly before this edited message
      const historyBefore = messages.slice(0, msgIndex);
      const updatedUserMessage = {
        ...messages[msgIndex],
        content: prompt,
        isEdited: true,
        timestamp: timeStr,
      };

      const messagesUpToEdited = [...historyBefore, updatedUserMessage];

      // Update state immediately to reflect edited user prompt
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === activeSessionId) {
            const title =
              msgIndex === 0
                ? prompt.slice(0, 40) + (prompt.length > 40 ? "..." : "")
                : s.title;
            return { ...s, title, messages: messagesUpToEdited };
          }
          return s;
        })
      );

      setLoading(true);

      try {
        const historyForApi = historyBefore.map((m) => ({
          role: m.role,
          content: m.content,
        }));
        const response = await sendAiChatMessage(historyForApi, prompt);

        const aiMessageId = `msg-ai-${Date.now()}`;
        const aiMessage = {
          id: aiMessageId,
          role: "model",
          content: response.reply,
          actionsExecuted: response.actionsExecuted || [],
          userPrompt: prompt,
          isNew: true,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeSessionId
              ? { ...s, messages: [...messagesUpToEdited, aiMessage] }
              : s
          )
        );

        if (typeof onAiResponse === "function") {
          onAiResponse(aiMessage);
        }
        return aiMessage;
      } catch (err) {
        const errorMessageId = `msg-err-${Date.now()}`;
        const errorMessage = {
          id: errorMessageId,
          role: "model",
          content: `I am currently experiencing a brief delay connecting to the records. Please try your request again in a moment.`,
          userPrompt: prompt,
          isNew: true,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isError: true,
        };

        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeSessionId
              ? { ...s, messages: [...messagesUpToEdited, errorMessage] }
              : s
          )
        );

        if (typeof onAiResponse === "function") {
          onAiResponse(errorMessage);
        }
        return errorMessage;
      } finally {
        setLoading(false);
      }
    },
    [messages, loading, activeSessionId, onAiResponse]
  );

  return {
    sessions,
    filteredSessions,
    activeSessionId,
    setActiveSessionId,
    activeSession,
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
    handleEditMessage,
  };
}
