import { useState, useEffect, useRef, useCallback } from "react";
import { STORAGE_KEY_SESSIONS } from "./ai.constants.js";
import { sendAiChatMessage, fetchAiHealth } from "./ai.service.js";

const DEFAULT_SESSION = {
  id: "session-1",
  title: "New Conversation",
  messages: [],
  createdAt: Date.now(),
};

export function useAiChat() {
  /* ── Sessions State ── */
  const [sessions, setSessions] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SESSIONS);
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
  const [providerName, setProviderName] = useState("System AI");

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
        // Keep fallback "System AI"
      });
    return () => {
      isMounted = false;
    };
  }, []);

  /* ── Persist sessions ── */
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
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

  const handleSendMessage = async (promptToSend) => {
    const prompt = (promptToSend || inputPrompt).trim();
    if (!prompt || loading) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const userMessage = { role: "user", content: prompt, timestamp: timeStr };
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

      const aiMessage = {
        role: "model",
        content: response.reply,
        actionsExecuted: response.actionsExecuted || [],
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
    } catch (err) {
      const errorMessage = {
        role: "model",
        content: `⚠️ **Unable to reach System AI**\n\n${err.message}\n\nPlease verify your connection and configuration and try again.`,
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
    } finally {
      setLoading(false);
    }
  };

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
    handleSendMessage,
  };
}
