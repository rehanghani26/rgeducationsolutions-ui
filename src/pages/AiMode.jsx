import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Sparkles,
  Send,
  Plus,
  Trash2,
  Key,
  ChevronDown,
  ArrowLeft,
  Bot,
  User as UserIcon,
  Copy,
  Check,
  ExternalLink,
  Eye,
  EyeOff,
  Zap,
  Users,
  GraduationCap,
  ClipboardList,
  Boxes,
  DollarSign,
  Menu,
  X,
  Settings,
  MessageSquare,
  Search,
  Mic,
  Paperclip,
  MoreHorizontal,
  ChevronRight,
  Star,
  BookOpen,
  BarChart2,
  Calendar,
  RefreshCw,
  Wifi,
  WifiOff,
  Globe,
  Shield,
} from "lucide-react";
import { sendAiChatMessage } from "../services/systemAiService.js";
import { ROUTES } from "../routes/routes.js";

/* ────────────────────────────────────────────────────
   Constants & Data
──────────────────────────────────────────────────── */
const STORAGE_KEY_SESSIONS = "GEMINI_ERP_CHAT_SESSIONS_V2";

const SUGGESTED_PROMPTS = [
  {
    icon: GraduationCap,
    title: "Student List",
    prompt:
      "Show me all enrolled students with their class, section, and roll numbers.",
    gradient: "from-blue-600 to-indigo-600",
    bg: "bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20",
    textColor: "text-blue-300",
  },
  {
    icon: Plus,
    title: "Enroll Student",
    prompt:
      "Enroll a new student named Aarav Sharma in Class 10 Section A, parent: Rajesh Sharma.",
    gradient: "from-emerald-600 to-teal-600",
    bg: "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20",
    textColor: "text-emerald-300",
  },
  {
    icon: Users,
    title: "User Accounts",
    prompt: "List all system user accounts, roles, and their current status.",
    gradient: "from-purple-600 to-pink-600",
    bg: "bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/20",
    textColor: "text-purple-300",
  },
  {
    icon: ClipboardList,
    title: "Attendance",
    prompt: "What is the school's attendance rate today? Show absent students.",
    gradient: "from-amber-600 to-orange-600",
    bg: "bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20",
    textColor: "text-amber-300",
  },
  {
    icon: DollarSign,
    title: "Fee Status",
    prompt: "Give an overview of school fee collections and show pending dues.",
    gradient: "from-rose-600 to-red-600",
    bg: "bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/20",
    textColor: "text-rose-300",
  },
  {
    icon: Boxes,
    title: "Inventory",
    prompt:
      "Show inventory items running low on stock and their current quantities.",
    gradient: "from-cyan-600 to-sky-600",
    bg: "bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/20",
    textColor: "text-cyan-300",
  },
  {
    icon: BarChart2,
    title: "Dashboard Stats",
    prompt:
      "Give me an executive summary of the school's key performance metrics.",
    gradient: "from-violet-600 to-indigo-600",
    bg: "bg-violet-500/10 hover:bg-violet-500/20 border-violet-500/20",
    textColor: "text-violet-300",
  },
  {
    icon: BookOpen,
    title: "Exam Schedule",
    prompt: "Show upcoming exams and assessments scheduled for this month.",
    gradient: "from-fuchsia-600 to-pink-600",
    bg: "bg-fuchsia-500/10 hover:bg-fuchsia-500/20 border-fuchsia-500/20",
    textColor: "text-fuchsia-300",
  },
];

/* ────────────────────────────────────────────────────
   Markdown Renderer
──────────────────────────────────────────────────── */
function MarkdownRenderer({ text }) {
  if (!text) return null;

  const lines = text.split("\n");
  const elements = [];
  let inTable = false;
  let tableRows = [];
  let listBuffer = [];

  const flushList = (key) => {
    if (listBuffer.length > 0) {
      elements.push(
        <ul key={`list-${key}`} className="my-2 space-y-1 pl-1">
          {listBuffer.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-[13px] leading-relaxed text-slate-200"
            >
              <span className="mt-[5px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-400" />
              <span
                dangerouslySetInnerHTML={{
                  __html: item
                    .replace(
                      /\*\*(.*?)\*\*/g,
                      "<strong class='text-white font-semibold'>$1</strong>"
                    )
                    .replace(
                      /`(.*?)`/g,
                      "<code class='bg-slate-700/80 text-indigo-300 px-1 py-0.5 rounded text-[12px] font-mono'>$1</code>"
                    ),
                }}
              />
            </li>
          ))}
        </ul>
      );
      listBuffer = [];
    }
  };

  const flushTable = (key) => {
    if (tableRows.length > 0) {
      const headerRow = tableRows[0];
      const bodyRows = tableRows.slice(1).filter((r) => !r.isDivider);
      elements.push(
        <div
          key={`table-${key}`}
          className="my-3 overflow-x-auto rounded-xl border border-slate-700/50 shadow-lg"
        >
          <table className="w-full min-w-full text-left text-[12px]">
            <thead className="border-b border-slate-700/80 bg-slate-800/80">
              <tr>
                {headerRow.cols.map((col, ci) => (
                  <th
                    key={ci}
                    className="px-4 py-2.5 font-semibold text-slate-200 whitespace-nowrap"
                  >
                    {col.trim()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-slate-900/40">
              {bodyRows.map((row, ri) => (
                <tr
                  key={ri}
                  className="border-b border-slate-800/60 hover:bg-indigo-500/5 transition-colors"
                >
                  {row.cols.map((cell, ci) => (
                    <td key={ci} className="px-4 py-2 text-slate-300">
                      {cell.trim()}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
      inTable = false;
    }
  };

  lines.forEach((line, index) => {
    // Table detection
    if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
      flushList(index);
      inTable = true;
      const cols = line
        .trim()
        .slice(1, -1)
        .split("|")
        .map((c) => c.trim());
      const isDivider = cols.every((c) => /^[-:]+$/.test(c));
      tableRows.push({ cols, isDivider });
      return;
    } else if (inTable) {
      flushTable(index);
    }

    // List items
    if (
      line.trim().startsWith("- ") ||
      line.trim().startsWith("* ") ||
      /^\d+\.\s/.test(line.trim())
    ) {
      flushTable(index);
      const itemText = line.trim().replace(/^[-*]\s|^\d+\.\s/, "");
      listBuffer.push(itemText);
      return;
    } else {
      flushList(index);
    }

    // Code blocks (simple inline)
    if (line.startsWith("```")) {
      return; // skip fence markers
    }

    // Headers
    if (line.startsWith("### ")) {
      elements.push(
        <h4
          key={index}
          className="mt-4 mb-1.5 text-[13px] font-bold text-indigo-300 tracking-wide"
        >
          {line.replace("### ", "")}
        </h4>
      );
      return;
    }
    if (line.startsWith("## ")) {
      elements.push(
        <h3
          key={index}
          className="mt-4 mb-2 text-sm font-bold text-white tracking-tight border-b border-slate-700/50 pb-1"
        >
          {line.replace("## ", "")}
        </h3>
      );
      return;
    }
    if (line.startsWith("# ")) {
      elements.push(
        <h2
          key={index}
          className="mt-4 mb-2 text-base font-extrabold text-white"
        >
          {line.replace("# ", "")}
        </h2>
      );
      return;
    }

    // Horizontal rule
    if (line.trim() === "---" || line.trim() === "***") {
      elements.push(<hr key={index} className="my-3 border-slate-700/50" />);
      return;
    }

    // Blank line
    if (line.trim() === "") {
      elements.push(<div key={index} className="h-1.5" />);
      return;
    }

    // Normal paragraph
    elements.push(
      <p
        key={index}
        className="text-[13px] leading-relaxed text-slate-200"
        dangerouslySetInnerHTML={{
          __html: line
            .replace(
              /\*\*(.*?)\*\*/g,
              "<strong class='text-white font-semibold'>$1</strong>"
            )
            .replace(/\*(.*?)\*/g, "<em class='text-slate-300'>$1</em>")
            .replace(
              /`(.*?)`/g,
              "<code class='bg-slate-700/80 text-indigo-300 px-1 py-0.5 rounded text-[12px] font-mono'>$1</code>"
            ),
        }}
      />
    );
  });

  flushList("final");
  flushTable("final");

  return <div className="space-y-1">{elements}</div>;
}

/* ────────────────────────────────────────────────────
   Typing Dots Animation
──────────────────────────────────────────────────── */
function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 rounded-full bg-gradient-to-tr from-indigo-400 to-purple-400"
          style={{
            animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────────────
   Main Component
──────────────────────────────────────────────────── */
export default function AiMode() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  /* ── Sessions ── */
  const [sessions, setSessions] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SESSIONS);
      return saved
        ? JSON.parse(saved)
        : [
            {
              id: "session-1",
              title: "New Conversation",
              messages: [],
              createdAt: Date.now(),
            },
          ];
    } catch {
      return [
        {
          id: "session-1",
          title: "New Conversation",
          messages: [],
          createdAt: Date.now(),
        },
      ];
    }
  });

  const [activeSessionId, setActiveSessionId] = useState(
    () => sessions[0]?.id || "session-1"
  );

  /* ── UI State ── */
  const [inputPrompt, setInputPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 1100 : true
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  /* ── Refs ── */
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const inputContainerRef = useRef(null);

  const activeSession =
    sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const messages = activeSession?.messages || [];

  const filteredSessions = searchQuery
    ? sessions.filter((s) =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : sessions;

  /* ── Effects ── */
  // Responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1100) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Persist sessions
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
    } catch {}
  }, [sessions]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Textarea auto-resize
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [inputPrompt]);



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
    if (window.innerWidth < 1100) setSidebarOpen(false);
  }, []);

  const handleDeleteSession = useCallback(
    (id, e) => {
      e.stopPropagation();
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
        if (activeSessionId === id) setActiveSessionId(filtered[0].id);
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
        prompt,
        { navigate, user }
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

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };


  /* ── Render ── */
  return (
    <>
      {/* Keyframe styles */}
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
        @keyframes pulseRing {
          0% { box-shadow: 0 0 0 0 rgba(99,102,241,0.4); }
          70% { box-shadow: 0 0 0 10px rgba(99,102,241,0); }
          100% { box-shadow: 0 0 0 0 rgba(99,102,241,0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
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
        {/* ── Mobile Sidebar Overlay ── */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ════════════════════════════════════════
            LEFT SIDEBAR
        ════════════════════════════════════════ */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-50 flex flex-col
            border-r border-white/5
            bg-[#0d1120]/95 backdrop-blur-xl
            transition-all duration-300 ease-in-out
            ${sidebarOpen ? "w-[280px] translate-x-0" : "w-[280px] -translate-x-full"}
            lg:static lg:z-auto lg:flex-shrink-0
            ${sidebarOpen ? "lg:w-[280px] lg:translate-x-0" : "lg:w-0 lg:overflow-hidden"}
          `}
        >
          {/* Sidebar Header */}
          <div className="flex h-16 items-center justify-between border-b border-white/5 px-4">
            <div className="flex items-center gap-2.5">
              <div className="gradient-animated flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl shadow-lg">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="text-[13px] font-bold text-white tracking-tight">
                  RGES ERP AI
                </div>
                <div className="text-[10px] text-slate-400">
                  School ERP Assistant
                </div>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-white lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* New Chat */}
          <div className="p-3">
            <button
              onClick={handleNewChat}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 px-4 py-2.5 text-[12px] font-semibold text-indigo-300 transition-all hover:border-indigo-500/60 hover:from-indigo-600/30 hover:to-purple-600/30 hover:text-white active:scale-95"
            >
              <Plus className="h-3.5 w-3.5" />
              New Conversation
            </button>
          </div>

          {/* Search */}
          <div className="px-3 pb-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg bg-white/5 py-1.5 pl-7 pr-3 text-[11px] text-slate-300 placeholder-slate-500 outline-none focus:ring-1 focus:ring-indigo-500/40"
              />
            </div>
          </div>

          {/* Session List */}
          <div className="flex-1 overflow-y-auto px-3 py-1 scrollbar-thin">
            {filteredSessions.length === 0 ? (
              <div className="py-8 text-center text-[11px] text-slate-500">
                No conversations found
              </div>
            ) : (
              <>
                <div className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Conversations
                </div>
                {filteredSessions.map((sess) => {
                  const isActive = sess.id === activeSessionId;
                  const lastMsg = sess.messages[sess.messages.length - 1];
                  return (
                    <button
                      key={sess.id}
                      onClick={() => {
                        setActiveSessionId(sess.id);
                        if (window.innerWidth < 1100) setSidebarOpen(false);
                      }}
                      className={`group mb-0.5 flex w-full items-start justify-between rounded-xl px-3 py-2.5 text-left transition-all ${
                        isActive
                          ? "bg-indigo-600/20 border border-indigo-500/30 shadow-sm"
                          : "hover:bg-white/5 border border-transparent"
                      }`}
                    >
                      <div className="flex min-w-0 items-start gap-2.5">
                        <div
                          className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md ${isActive ? "bg-indigo-500/30" : "bg-white/5"}`}
                        >
                          <MessageSquare
                            className={`h-2.5 w-2.5 ${isActive ? "text-indigo-300" : "text-slate-500"}`}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div
                            className={`truncate text-[12px] font-medium ${isActive ? "text-white" : "text-slate-300"}`}
                          >
                            {sess.title}
                          </div>
                          {lastMsg && (
                            <div className="mt-0.5 truncate text-[10px] text-slate-500">
                              {lastMsg.content.slice(0, 35)}...
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDeleteSession(sess.id, e)}
                        className="ml-1 flex-shrink-0 rounded p-0.5 text-slate-600 opacity-0 transition-all hover:text-rose-400 group-hover:opacity-100"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </button>
                  );
                })}
              </>
            )}
          </div>

          {/* Sidebar Footer */}
          <div className="border-t border-white/5 p-3 space-y-2">
            {/* System Info */}
            <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2">
              <Zap className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-[10px] text-slate-500">System AI</div>
                <div className="truncate text-[11px] font-medium text-slate-300">
                  Online
                </div>
              </div>
              <div
                className="h-2 w-2 rounded-full flex-shrink-0 bg-emerald-400 animate-pulse"
              />
            </div>
          </div>
        </aside>

        {/* ════════════════════════════════════════
            MAIN CHAT AREA
        ════════════════════════════════════════ */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {/* ── Top Header ── */}
          <header className="relative z-10 flex h-14 flex-shrink-0 items-center justify-between border-b border-white/5 bg-[#0a0e17]/90 px-3 backdrop-blur-xl sm:px-5">
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Menu toggle */}
              <button
                onClick={() => setSidebarOpen((p) => !p)}
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl border border-white/8 bg-white/5 text-slate-400 transition-all hover:bg-white/10 hover:text-white active:scale-95"
              >
                <Menu className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-2">
                <div className="gradient-animated h-2 w-2 rounded-full shadow-lg" />
                <span className="text-[13px] font-semibold text-white">
                  <span className="hidden sm:inline">School ERP </span>AI Agent
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 border border-emerald-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">

              {/* Back */}
              <button
                onClick={() => navigate(ROUTES.DASHBOARD)}
                className="flex items-center gap-1.5 rounded-xl border border-rose-500/25 bg-rose-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-rose-300 transition-all hover:bg-rose-500/20 hover:text-white active:scale-95"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Back to ERP</span>
                <span className="sm:hidden">Exit</span>
              </button>
            </div>
          </header>


          {/* ── Messages Area ── */}
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {messages.length === 0 ? (
              /* ── Welcome / Empty State ── */
              <div className="flex min-h-full flex-col items-center justify-center px-4 py-10 sm:px-8">
                <div className="w-full max-w-2xl">
                  {/* Hero */}
                  <div className="mb-8 flex flex-col items-center text-center sm:mb-10">
                    <div className="relative mb-5">
                      <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-2xl" />
                      <div className="gradient-animated relative flex h-16 w-16 items-center justify-center rounded-2xl shadow-2xl">
                        <Sparkles className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <h1 className="mb-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
                      Hello,{" "}
                      <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                        {user?.name?.split(" ")[0] || "Admin"}
                      </span>
                    </h1>
                    <p className="max-w-md text-[13px] leading-relaxed text-slate-400 sm:text-sm">
                      I'm your intelligent School ERP assistant, powered by
                      Advanced System AI. Ask me anything or command an action across
                      the entire system.
                    </p>
                  </div>

                  {/* Suggestion Cards */}
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {SUGGESTED_PROMPTS.map((sp, idx) => {
                      const Icon = sp.icon;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(sp.prompt)}
                          className={`group flex flex-col gap-2.5 rounded-2xl border p-4 text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${sp.bg}`}
                        >
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br ${sp.gradient} shadow-md`}
                          >
                            <Icon className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <div
                              className={`text-[12px] font-semibold ${sp.textColor}`}
                            >
                              {sp.title}
                            </div>
                            <div className="mt-0.5 text-[11px] leading-snug text-slate-400 line-clamp-2">
                              {sp.prompt}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Features Row */}
                  <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    {[
                      { icon: Shield, label: "ERP Integrated" },
                      { icon: Globe, label: "Real-time Data" },
                      { icon: Zap, label: "Action Execution" },
                    ].map(({ icon: Icon, label }) => (
                      <div
                        key={label}
                        className="flex items-center gap-1.5 rounded-full border border-white/8 bg-white/5 px-3 py-1.5 text-[11px] text-slate-400"
                      >
                        <Icon className="h-3 w-3 text-indigo-400" />
                        {label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* ── Chat Messages ── */
              <div className="mx-auto max-w-3xl px-4 py-6 space-y-6 sm:px-6">
                {messages.map((msg, idx) => {
                  const isUser = msg.role === "user";
                  return (
                    <div
                      key={idx}
                      className={`ai-msg-enter flex items-start gap-3 sm:gap-4 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                    >
                      {/* Avatar */}
                      <div
                        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl shadow-lg ${
                          isUser ? "bg-indigo-600" : "gradient-animated"
                        }`}
                      >
                        {isUser ? (
                          <UserIcon className="h-4 w-4 text-white" />
                        ) : (
                          <Sparkles className="h-4 w-4 text-white" />
                        )}
                      </div>

                      {/* Bubble */}
                      <div
                        className={`group relative max-w-[85%] sm:max-w-[78%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}
                      >
                        {/* Action Cards */}
                        {!isUser && msg.actionsExecuted?.length > 0 && (
                          <div className="mb-2 w-full space-y-2">
                            {msg.actionsExecuted.map((act, ai) => (
                              <div
                                key={ai}
                                className="rounded-xl border border-emerald-500/25 bg-emerald-950/30 p-3"
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-300">
                                    <Zap className="h-3 w-3 text-emerald-400" />
                                    {act.toolName}
                                  </span>
                                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-bold text-emerald-300 uppercase">
                                    Executed
                                  </span>
                                </div>
                                {act.result?.message && (
                                  <p className="text-[12px] text-slate-300">
                                    {act.result.message}
                                  </p>
                                )}
                                {act.result?.actionLink && (
                                  <button
                                    onClick={() =>
                                      navigate(act.result.actionLink)
                                    }
                                    className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-300 hover:text-white transition-colors"
                                  >
                                    View in ERP{" "}
                                    <ExternalLink className="h-3 w-3" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Message Content */}
                        <div
                          className={`rounded-2xl px-4 py-3 shadow-md ${
                            isUser
                              ? "bg-indigo-600 text-white rounded-tr-sm"
                              : `border border-white/8 bg-[#111828] rounded-tl-sm ${msg.isError ? "border-rose-500/30 bg-rose-950/20" : ""}`
                          }`}
                        >
                          {isUser ? (
                            <p className="text-[13px] leading-relaxed whitespace-pre-wrap">
                              {msg.content}
                            </p>
                          ) : (
                            <MarkdownRenderer text={msg.content} />
                          )}
                        </div>

                        {/* Footer */}
                        <div
                          className={`flex items-center gap-2 px-1 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                        >
                          <span className="text-[10px] text-slate-600">
                            {msg.timestamp}
                          </span>
                          {!isUser && (
                            <button
                              onClick={() => handleCopy(msg.content, idx)}
                              className="rounded p-1 text-slate-600 opacity-0 transition-all hover:text-slate-300 group-hover:opacity-100"
                              title="Copy"
                            >
                              {copiedIndex === idx ? (
                                <Check className="h-3 w-3 text-emerald-400" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Loading / Typing indicator */}
                {loading && (
                  <div className="ai-msg-enter flex items-start gap-3 sm:gap-4">
                    <div className="gradient-animated flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl shadow-lg">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div className="rounded-2xl rounded-tl-sm border border-white/8 bg-[#111828] px-4 py-3 shadow-md">
                      <div className="flex items-center gap-2">
                        <TypingDots />
                        <span className="text-[11px] text-slate-500">
                          RGES ERP AI is thinking...
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* ── Bottom Input Area ── */}
          <div className="flex-shrink-0 border-t border-white/5 bg-[#080c14]/90 px-3 pb-4 pt-3 backdrop-blur-xl sm:px-6">
            {/* Quick Chips */}
            <div className="mb-2.5 flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
              {[
                {
                  emoji: "📋",
                  label: "List Students",
                  prompt: "Show me all enrolled students",
                },
                {
                  emoji: "➕",
                  label: "Add Student",
                  prompt: "Enroll a new student in Class 9A",
                },
                {
                  emoji: "👥",
                  label: "Users",
                  prompt: "Show all system user accounts",
                },
                {
                  emoji: "📊",
                  label: "Stats",
                  prompt: "Give me today's attendance overview",
                },
                {
                  emoji: "💰",
                  label: "Fees",
                  prompt: "Show pending fee collections",
                },
                {
                  emoji: "📦",
                  label: "Inventory",
                  prompt: "Show low stock inventory items",
                },
              ].map(({ emoji, label, prompt }) => (
                <button
                  key={label}
                  onClick={() => handleSendMessage(prompt)}
                  className="flex-shrink-0 flex items-center gap-1.5 rounded-full border border-white/8 bg-white/5 px-3 py-1.5 text-[11px] text-slate-300 transition-all hover:border-indigo-500/30 hover:bg-indigo-500/10 hover:text-white active:scale-95 whitespace-nowrap"
                >
                  <span>{emoji}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>

            {/* Input Box */}
            <div
              ref={inputContainerRef}
              className="relative flex items-end gap-2 rounded-2xl border border-white/8 bg-[#111828] p-2 shadow-2xl transition-all focus-within:border-indigo-500/40 focus-within:ring-1 focus-within:ring-indigo-500/20"
            >
              <textarea
                ref={textareaRef}
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything or command an ERP action..."
                rows={1}
                className="max-h-40 min-h-[36px] flex-1 resize-none bg-transparent px-2 py-2 text-[13px] text-white placeholder-slate-500 focus:outline-none leading-relaxed"
              />
              <div className="flex items-center gap-1.5 pb-0.5 flex-shrink-0">
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputPrompt.trim() || loading}
                  className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
                    inputPrompt.trim() && !loading
                      ? "gradient-animated text-white shadow-lg hover:scale-105 active:scale-95"
                      : "bg-white/5 text-slate-600 cursor-not-allowed"
                  }`}
                  title="Send (Enter)"
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="mt-2 text-center text-[10px] text-slate-600">
              Powered by Advanced System AI · Real-time ERP operations · Press Enter
              to send, Shift+Enter for new line
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
