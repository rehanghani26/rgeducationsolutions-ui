import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Send, Plus, Trash2, ArrowLeft, Copy, Check, Sparkles,
  GraduationCap, Users, ClipboardList, DollarSign, Boxes,
  BarChart2, BookOpen, MessageSquare, Zap, Brain, Database,
  Shield, X, Menu, Pencil, Clock, Search, Download, RefreshCw,
  ChevronRight, AlertCircle, Hash, Star, Calendar, BookMarked,
  Layers, Bus, Bell, Monitor, ChevronDown,
} from "lucide-react";
import { sendAiChatMessage } from "../services/systemAiService.js";
import { ROUTES } from "../routes/routes.js";

/* ─────────────────────────────────────────────────────────
   Constants
───────────────────────────────────────────────────────── */
const STORAGE_KEY = "RGES_CHAT_SESSIONS_V2";
const AGENT_NAME = "RGES AI";
const AGENT_TAGLINE = "RG EduCore School Management";

const SUGGESTED_PROMPTS = [
  { icon: GraduationCap, label: "Students",     prompt: "Show me all enrolled students with their class, section, and roll numbers.", color: "#6366f1", bg: "rgba(99,102,241,0.08)",   border: "rgba(99,102,241,0.2)" },
  { icon: Users,         label: "Teachers",     prompt: "List all teachers with their departments and subjects.", color: "#8b5cf6",                                                   bg: "rgba(139,92,246,0.08)",  border: "rgba(139,92,246,0.2)" },
  { icon: ClipboardList, label: "Attendance",   prompt: "What is today's attendance rate? Show me all absent students.", color: "#f59e0b",                                           bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.2)" },
  { icon: DollarSign,    label: "Fee Status",   prompt: "Give an overview of fee collections and show all pending dues.", color: "#10b981",                                          bg: "rgba(16,185,129,0.08)",  border: "rgba(16,185,129,0.2)" },
  { icon: Boxes,         label: "Inventory",    prompt: "Show inventory items running low on stock with their current quantities.", color: "#06b6d4",                                bg: "rgba(6,182,212,0.08)",   border: "rgba(6,182,212,0.2)" },
  { icon: BarChart2,     label: "Dashboard",    prompt: "Give me an executive summary of the school's key performance metrics.", color: "#ec4899",                                   bg: "rgba(236,72,153,0.08)",  border: "rgba(236,72,153,0.2)" },
  { icon: BookOpen,      label: "Exams",        prompt: "Show upcoming exams and assessments scheduled for this month.", color: "#f97316",                                           bg: "rgba(249,115,22,0.08)",  border: "rgba(249,115,22,0.2)" },
  { icon: Bell,          label: "Notices",      prompt: "Show me the latest school notices and announcements.", color: "#14b8a6",                                                    bg: "rgba(20,184,166,0.08)",  border: "rgba(20,184,166,0.2)" },
  { icon: BookMarked,    label: "Library",      prompt: "Show all books currently issued from the library and their borrowers.", color: "#a78bfa",                                  bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.2)" },
  { icon: Bus,           label: "Transport",    prompt: "List all school transport routes, vehicles, and driver contacts.", color: "#34d399",                                        bg: "rgba(52,211,153,0.08)",  border: "rgba(52,211,153,0.2)" },
  { icon: Monitor,       label: "Online Classes",prompt: "Show upcoming online classes and virtual sessions.", color: "#60a5fa",                                                    bg: "rgba(96,165,250,0.08)",  border: "rgba(96,165,250,0.2)" },
  { icon: Layers,        label: "Timetable",    prompt: "Show the timetable for Class 10. What classes are scheduled today?", color: "#fb7185",                                     bg: "rgba(251,113,133,0.08)", border: "rgba(251,113,133,0.2)" },
];

const FOLLOW_UP_SUGGESTIONS = {
  students:    ["How many students are in each class?", "Show students with pending fees", "Check low attendance students"],
  teachers:    ["Show teachers by department", "Which teacher has the most classes?", "List staff contact numbers"],
  attendance:  ["Show attendance trend this week", "Which class has lowest attendance?", "List students absent 3+ times"],
  fees:        ["Show top defaulters by amount", "Collect fee for a student", "Fee summary by class"],
  inventory:   ["Create a new inventory item", "Show all inventory categories", "What items need restocking?"],
  dashboard:   ["Show student enrollment trend", "Compare this month vs last month", "What needs immediate attention?"],
  exams:       ["Create a new exam schedule", "Show exam results summary", "Which classes have exams this week?"],
  library:     ["Show overdue books", "Search for a specific book", "How many books are in the library?"],
};

/* ─────────────────────────────────────────────────────────
   Markdown Renderer
───────────────────────────────────────────────────────── */
function MarkdownRenderer({ text }) {
  if (!text) return null;
  const lines = text.split("\n");
  const elements = [];
  let tableRows = [], listItems = [], codeLines = [];
  let inTable = false, inCode = false;

  const renderInline = (str) =>
    str
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`(.*?)`/g, "<code class='rges-inline-code'>$1</code>");

  const flushList = (k) => {
    if (!listItems.length) return;
    elements.push(
      <ul key={`l${k}`} className="rges-list">
        {listItems.map((item, i) => (
          <li key={i} className="rges-list-item">
            <span className="rges-bullet" />
            <span dangerouslySetInnerHTML={{ __html: renderInline(item) }} />
          </li>
        ))}
      </ul>
    );
    listItems = [];
  };

  const flushTable = (k) => {
    if (!tableRows.length) return;
    const header = tableRows[0];
    const body = tableRows.slice(1).filter((r) => !r.isDivider);
    elements.push(
      <div key={`t${k}`} className="rges-table-wrap">
        <table className="rges-table">
          <thead><tr>{header.cols.map((c, i) => <th key={i}>{c.trim()}</th>)}</tr></thead>
          <tbody>{body.map((row, ri) => (
            <tr key={ri}>{row.cols.map((cell, ci) => <td key={ci}>{cell.trim()}</td>)}</tr>
          ))}</tbody>
        </table>
      </div>
    );
    tableRows = []; inTable = false;
  };

  const flushCode = (k) => {
    if (!codeLines.length) return;
    elements.push(<pre key={`c${k}`} className="rges-code"><code>{codeLines.join("\n")}</code></pre>);
    codeLines = []; inCode = false;
  };

  lines.forEach((line, idx) => {
    if (line.startsWith("```")) {
      inCode ? flushCode(idx) : (() => { flushList(idx); flushTable(idx); inCode = true; })();
      return;
    }
    if (inCode) { codeLines.push(line); return; }
    if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
      flushList(idx); inTable = true;
      const cols = line.trim().slice(1, -1).split("|").map((c) => c.trim());
      tableRows.push({ cols, isDivider: cols.every((c) => /^[-:]+$/.test(c)) });
      return;
    } else if (inTable) flushTable(idx);
    if (/^(\s*[-*]|\s*\d+\.)\s/.test(line)) {
      flushTable(idx);
      listItems.push(line.trim().replace(/^[-*\d.]+\s+/, ""));
      return;
    } else flushList(idx);
    if (/^#{1,4}\s/.test(line)) {
      const level = line.match(/^(#+)/)[1].length;
      const content = line.replace(/^#+\s/, "");
      const cls = ["rges-h1","rges-h2","rges-h3","rges-h4"][level - 1] || "rges-h4";
      elements.push(<div key={idx} className={cls} dangerouslySetInnerHTML={{ __html: renderInline(content) }} />);
      return;
    }
    if (/^---+$/.test(line.trim())) { elements.push(<hr key={idx} className="rges-hr" />); return; }
    if (!line.trim()) { elements.push(<div key={idx} className="rges-spacer" />); return; }
    elements.push(<p key={idx} className="rges-p" dangerouslySetInnerHTML={{ __html: renderInline(line) }} />);
  });
  flushList("end"); flushTable("end"); flushCode("end");
  return <div className="rges-markdown">{elements}</div>;
}

/* ─────────────────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────────────────── */
function TypingIndicator() {
  return (
    <div className="rges-typing">
      <span /><span /><span />
    </div>
  );
}

function ToolBadge({ tools }) {
  if (!tools?.length) return null;
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="rges-tools" onClick={() => setExpanded(e => !e)} style={{ cursor: "pointer" }}>
      <Zap size={11} />
      <span>{tools.length} tool{tools.length > 1 ? "s" : ""} used</span>
      <ChevronDown size={10} style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "0.2s" }} />
      {expanded && (
        <span className="rges-tools-list">
          {tools.map((t, i) => (
            <span key={i} className={`rges-tool-chip ${t.status === "error" ? "error" : t.status === "success" ? "success" : ""}`}>
              {t.status === "success" ? "✓" : t.status === "error" ? "✗" : "•"} {t.tool}
            </span>
          ))}
        </span>
      )}
    </div>
  );
}

function FollowUpSuggestions({ onSelect }) {
  const keys = Object.keys(FOLLOW_UP_SUGGESTIONS);
  const picks = useMemo(() => {
    const key = keys[Math.floor(Math.random() * keys.length)];
    return FOLLOW_UP_SUGGESTIONS[key].slice(0, 3);
  }, []);
  return (
    <div className="rges-followups">
      {picks.map((p, i) => (
        <button key={i} className="rges-followup-btn" onClick={() => onSelect(p)}>
          <ChevronRight size={11} />
          {p}
        </button>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Main Page
───────────────────────────────────────────────────────── */
export default function AiMode() {
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth?.user);

  const [sessions, setSessions] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (saved.length) return saved;
    } catch {}
    return [{ id: `s-${Date.now()}`, title: "New Chat", messages: [], createdAt: Date.now() }];
  });
  const [activeId, setActiveId] = useState(() => sessions[0]?.id);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [searchSidebar, setSearchSidebar] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [starredMsgs, setStarredMsgs] = useState({});

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const searchRef = useRef(null);

  const activeSession = sessions.find((s) => s.id === activeId) || sessions[0];
  const allMessages = activeSession?.messages || [];

  // Filtered messages for search
  const messages = useMemo(() => {
    if (!searchQuery.trim()) return allMessages;
    const q = searchQuery.toLowerCase();
    return allMessages.filter((m) => m.content?.toLowerCase().includes(q));
  }, [allMessages, searchQuery]);

  // Filtered sessions for sidebar search
  const filteredSessions = useMemo(() => {
    if (!searchSidebar.trim()) return sessions;
    const q = searchSidebar.toLowerCase();
    return sessions.filter((s) =>
      s.title.toLowerCase().includes(q) ||
      s.messages.some((m) => m.content?.toLowerCase().includes(q))
    );
  }, [sessions, searchSidebar]);

  const isEmpty = allMessages.length === 0;
  const wordCount = input.trim().split(/\s+/).filter(Boolean).length;

  // Stats
  const stats = useMemo(() => ({
    total: sessions.reduce((a, s) => a + s.messages.length, 0),
    sessions: sessions.length,
    today: sessions.reduce((a, s) => a + s.messages.filter((m) => {
      const d = new Date(); return m.timestamp && true; // simplified
    }).length, 0),
  }), [sessions]);

  /* Effects */
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions)); } catch {}
  }, [sessions]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages, loading]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) { ta.style.height = "auto"; ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`; }
  }, [input]);

  useEffect(() => {
    const onResize = () => setSidebarOpen(window.innerWidth >= 1024);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (showSearch) searchRef.current?.focus();
  }, [showSearch]);

  /* Handlers */
  const newChat = useCallback(() => {
    const s = { id: `s-${Date.now()}`, title: "New Chat", messages: [], createdAt: Date.now() };
    setSessions((p) => [s, ...p]);
    setActiveId(s.id);
    if (window.innerWidth < 1024) setSidebarOpen(false);
  }, []);

  const deleteSession = useCallback((id, e) => {
    e.stopPropagation();
    setSessions((prev) => {
      const next = prev.filter((s) => s.id !== id);
      if (!next.length) {
        const fresh = { id: `s-${Date.now()}`, title: "New Chat", messages: [], createdAt: Date.now() };
        setActiveId(fresh.id);
        return [fresh];
      }
      if (id === activeId) setActiveId(next[0].id);
      return next;
    });
  }, [activeId]);

  const clearChat = () => {
    setSessions((prev) => prev.map((s) => s.id === activeId ? { ...s, messages: [] } : s));
    setShowClearConfirm(false);
  };

  const exportChat = () => {
    const lines = allMessages.map((m) =>
      `[${m.timestamp || ""}] ${m.role === "user" ? user?.name || "You" : "RGES AI"}\n${m.content}\n`
    ).join("\n---\n\n");
    const blob = new Blob([`RGES AI — ${activeSession?.title}\nExported: ${new Date().toLocaleString()}\n\n${lines}`], { type: "text/plain" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `rges-chat-${activeSession?.title?.replace(/\s+/g, "-").slice(0, 30)}.txt`;
    a.click();
  };

  const sendMessage = useCallback(async (promptOverride) => {
    const prompt = (promptOverride ?? input).trim();
    if (!prompt || loading) return;
    const ts = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg = { role: "user", content: prompt, timestamp: ts };
    const updated = [...allMessages, userMsg];
    setSessions((prev) => prev.map((s) => {
      if (s.id !== activeId) return s;
      const title = s.messages.length === 0 ? prompt.slice(0, 45) + (prompt.length > 45 ? "…" : "") : s.title;
      return { ...s, title, messages: updated };
    }));
    setInput("");
    setLoading(true);
    try {
      const res = await sendAiChatMessage(
        allMessages.map((m) => ({ role: m.role, content: m.content })),
        prompt, {}
      );
      const aiMsg = {
        role: "model",
        content: res.reply,
        tools: res.actionsExecuted || [],
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        showFollowUp: res.actionsExecuted?.length > 0,
      };
      setSessions((prev) => prev.map((s) => s.id === activeId ? { ...s, messages: [...updated, aiMsg] } : s));
    } catch (err) {
      setSessions((prev) => prev.map((s) => s.id === activeId ? {
        ...s,
        messages: [...updated, {
          role: "model",
          content: `**Error:** ${err.message}\n\nPlease check your connection and try again.`,
          isError: true,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }]
      } : s));
    } finally {
      setLoading(false);
    }
  }, [input, loading, allMessages, activeId]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    if (e.key === "Escape" && showSearch) setShowSearch(false);
  };

  const copyText = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const toggleStar = (idx) => {
    setStarredMsgs((p) => ({ ...p, [idx]: !p[idx] }));
  };

  const saveEdit = (id) => {
    setSessions((prev) => prev.map((s) => s.id === id ? { ...s, title: editTitle || s.title } : s));
    setEditingId(null);
  };

  const groupSessionsByDate = (sessions) => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    const groups = { Today: [], Yesterday: [], Older: [] };
    sessions.forEach((s) => {
      const d = new Date(s.createdAt); d.setHours(0, 0, 0, 0);
      if (d.getTime() === today.getTime()) groups.Today.push(s);
      else if (d.getTime() === yesterday.getTime()) groups.Yesterday.push(s);
      else groups.Older.push(s);
    });
    return groups;
  };
  const groupedSessions = useMemo(() => groupSessionsByDate(filteredSessions), [filteredSessions]);

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "U";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

        .rges-root {
          display: flex; height: 100vh; width: 100vw; overflow: hidden;
          background: #07090f; color: #e2e8f0;
          font-family: 'Inter', system-ui, sans-serif;
        }

        /* ── SIDEBAR ── */
        .rges-sidebar {
          width: 272px; min-width: 272px; height: 100%;
          background: #0b0f18;
          border-right: 1px solid rgba(255,255,255,0.055);
          display: flex; flex-direction: column;
          transition: transform 0.28s cubic-bezier(0.4,0,0.2,1);
          z-index: 50;
        }
        .rges-sidebar.closed { transform: translateX(-100%); position: absolute; }
        .rges-sidebar-top {
          padding: 18px 14px 14px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          flex-shrink: 0;
        }
        .rges-logo-row {
          display: flex; align-items: center; gap: 10px; margin-bottom: 14px;
        }
        .rges-logo-icon {
          width: 36px; height: 36px; border-radius: 10px;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 18px rgba(99,102,241,0.45);
          flex-shrink: 0;
        }
        .rges-logo-name { font-size: 14px; font-weight: 700; color: #fff; line-height: 1; }
        .rges-logo-sub  { font-size: 10px; color: #475569; margin-top: 1px; }
        .rges-new-chat-btn {
          width: 100%; display: flex; align-items: center; gap: 7px;
          padding: 9px 12px;
          background: linear-gradient(135deg, rgba(99,102,241,0.14), rgba(139,92,246,0.14));
          border: 1px solid rgba(99,102,241,0.22);
          border-radius: 9px; color: #a5b4fc;
          font-size: 12.5px; font-weight: 500; cursor: pointer; transition: all 0.18s;
        }
        .rges-new-chat-btn:hover {
          background: linear-gradient(135deg, rgba(99,102,241,0.24), rgba(139,92,246,0.24));
          border-color: rgba(99,102,241,0.42); color: #c7d2fe;
        }
        .rges-sidebar-search {
          display: flex; align-items: center; gap: 7px;
          background: rgba(255,255,255,0.035); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 8px; padding: 7px 10px; margin-top: 10px;
        }
        .rges-sidebar-search input {
          background: none; border: none; outline: none;
          color: #94a3b8; font-size: 12px; width: 100%;
        }
        .rges-sidebar-search input::placeholder { color: #2d3748; }

        /* Session list */
        .rges-sessions { flex: 1; overflow-y: auto; padding: 6px 8px;
          scrollbar-width: thin; scrollbar-color: rgba(99,102,241,0.15) transparent; }
        .rges-sessions::-webkit-scrollbar { width: 3px; }
        .rges-sessions::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.2); border-radius: 4px; }
        .rges-group-label {
          font-size: 9.5px; font-weight: 600; color: #334155;
          text-transform: uppercase; letter-spacing: 0.09em;
          padding: 10px 8px 4px;
        }
        .rges-session-item {
          display: flex; align-items: center; gap: 8px;
          padding: 8px 9px; border-radius: 8px; cursor: pointer;
          transition: background 0.13s; margin-bottom: 1px; position: relative;
        }
        .rges-session-item:hover  { background: rgba(255,255,255,0.04); }
        .rges-session-item.active { background: rgba(99,102,241,0.11); }
        .rges-session-icon { color: #334155; flex-shrink: 0; }
        .rges-session-item.active .rges-session-icon { color: #6366f1; }
        .rges-session-title {
          flex: 1; font-size: 12px; color: #64748b;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .rges-session-item.active .rges-session-title { color: #a5b4fc; }
        .rges-session-actions { display: none; gap: 2px; }
        .rges-session-item:hover .rges-session-actions { display: flex; }
        .rges-session-edit-input {
          flex: 1; background: rgba(99,102,241,0.1);
          border: 1px solid rgba(99,102,241,0.28); border-radius: 4px;
          color: #c7d2fe; font-size: 11.5px; padding: 2px 6px; outline: none;
        }
        .rges-icon-btn {
          padding: 4px; border-radius: 5px; background: none; border: none;
          color: #334155; cursor: pointer; transition: all 0.13s; display: flex;
        }
        .rges-icon-btn:hover { background: rgba(255,255,255,0.07); color: #64748b; }
        .rges-icon-btn.danger:hover { background: rgba(239,68,68,0.1); color: #f87171; }

        /* Stats */
        .rges-stats-row {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 6px; padding: 10px 8px 6px; flex-shrink: 0;
        }
        .rges-stat-card {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05);
          border-radius: 8px; padding: 8px 10px;
        }
        .rges-stat-value { font-size: 16px; font-weight: 700; color: #6366f1; line-height: 1; }
        .rges-stat-label { font-size: 9.5px; color: #334155; margin-top: 2px; text-transform: uppercase; letter-spacing: 0.05em; }

        /* Sidebar footer */
        .rges-sidebar-footer {
          padding: 10px 8px 14px;
          border-top: 1px solid rgba(255,255,255,0.05); flex-shrink: 0;
        }
        .rges-caps {
          background: rgba(99,102,241,0.04); border: 1px solid rgba(99,102,241,0.1);
          border-radius: 9px; padding: 10px 12px; margin-bottom: 8px;
        }
        .rges-caps-label {
          font-size: 9.5px; font-weight: 600; color: #334155;
          text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 7px;
        }
        .rges-cap-item {
          display: flex; align-items: center; gap: 7px; margin-bottom: 5px;
          font-size: 11px; color: #2d3748;
        }
        .rges-back-btn {
          display: flex; align-items: center; gap: 8px; width: 100%;
          padding: 8px 10px; border-radius: 8px; background: none; border: none;
          color: #334155; font-size: 12px; cursor: pointer; transition: all 0.13s;
        }
        .rges-back-btn:hover { background: rgba(255,255,255,0.04); color: #64748b; }

        /* ── MAIN ── */
        .rges-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

        /* Topbar */
        .rges-topbar {
          display: flex; align-items: center; gap: 10px;
          padding: 0 18px; height: 58px;
          background: rgba(7,9,15,0.92); backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(255,255,255,0.05); flex-shrink: 0;
        }
        .rges-topbar-title {
          flex: 1; font-size: 13.5px; font-weight: 500; color: #94a3b8;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .rges-topbar-actions { display: flex; align-items: center; gap: 6px; }
        .rges-status-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #10b981; box-shadow: 0 0 6px rgba(16,185,129,0.6);
          animation: rges-pulse 2s infinite;
        }
        @keyframes rges-pulse { 0%,100%{opacity:1} 50%{opacity:.45} }

        /* Search bar (in-chat) */
        .rges-search-bar {
          display: flex; align-items: center; gap: 8px;
          padding: 8px 18px; background: rgba(99,102,241,0.06);
          border-bottom: 1px solid rgba(99,102,241,0.15); flex-shrink: 0;
        }
        .rges-search-bar input {
          flex: 1; background: none; border: none; outline: none;
          color: #a5b4fc; font-size: 13px;
        }
        .rges-search-bar input::placeholder { color: #334155; }
        .rges-search-count { font-size: 11px; color: #475569; white-space: nowrap; }

        /* Messages */
        .rges-messages { flex: 1; overflow-y: auto; padding: 0;
          scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.06) transparent; }
        .rges-messages::-webkit-scrollbar { width: 4px; }
        .rges-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 4px; }
        .rges-messages-inner {
          max-width: 820px; margin: 0 auto;
          padding: 28px 20px 12px; display: flex; flex-direction: column; gap: 2px;
        }

        /* Welcome */
        .rges-welcome {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; min-height: calc(100vh - 180px);
          padding: 40px 20px; text-align: center;
        }
        .rges-orb {
          position: relative; width: 82px; height: 82px; margin-bottom: 22px;
        }
        .rges-orb-glow {
          position: absolute; inset: -16px; border-radius: 50%;
          background: radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%);
          animation: rges-breathe 3s ease-in-out infinite;
        }
        @keyframes rges-breathe { 0%,100%{transform:scale(1);opacity:.5} 50%{transform:scale(1.2);opacity:1} }
        .rges-orb-icon {
          width: 82px; height: 82px; border-radius: 22px;
          background: linear-gradient(135deg, #4338ca, #6d28d9);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 40px rgba(99,102,241,0.4), 0 0 80px rgba(99,102,241,0.1);
          position: relative;
        }
        .rges-welcome-name {
          font-size: 34px; font-weight: 800;
          background: linear-gradient(135deg, #e2e8f0, #a5b4fc, #c084fc);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          margin-bottom: 6px;
        }
        .rges-welcome-sub  { font-size: 13px; color: #475569; margin-bottom: 4px; }
        .rges-welcome-desc { font-size: 12.5px; color: #334155; max-width: 420px; line-height: 1.65; margin-bottom: 32px; }
        .rges-feature-pills { display: flex; flex-wrap: wrap; gap: 7px; justify-content: center; margin-bottom: 36px; }
        .rges-pill {
          display: flex; align-items: center; gap: 5px;
          padding: 4px 10px; border-radius: 99px;
          font-size: 11px; color: #475569;
          border: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.025);
        }
        .rges-prompts-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(145px, 1fr));
          gap: 8px; width: 100%; max-width: 740px;
        }
        .rges-prompt-card {
          padding: 13px 13px; border-radius: 11px; cursor: pointer;
          border: 1px solid; transition: all 0.2s cubic-bezier(0.4,0,0.2,1);
          text-align: left; background: none; display: flex; flex-direction: column; gap: 7px;
        }
        .rges-prompt-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.35); }
        .rges-prompt-card-icon {
          width: 28px; height: 28px; border-radius: 7px;
          display: flex; align-items: center; justify-content: center;
        }
        .rges-prompt-card-label { font-size: 11.5px; font-weight: 600; }

        /* Message rows */
        .rges-msg-row {
          display: flex; gap: 11px; padding: 10px 0;
          animation: rges-slide-up 0.28s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes rges-slide-up { from{opacity:0;transform:translateY(9px)} to{opacity:1;transform:translateY(0)} }
        .rges-msg-row.user { flex-direction: row-reverse; }
        .rges-avatar {
          width: 30px; height: 30px; border-radius: 9px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          margin-top: 2px; font-size: 11px; font-weight: 700;
        }
        .rges-avatar.ai   { background: linear-gradient(135deg, #4338ca, #6d28d9); box-shadow: 0 0 12px rgba(99,102,241,0.3); }
        .rges-avatar.user { background: #0f172a; border: 1px solid rgba(255,255,255,0.09); color: #64748b; }

        .rges-bubble-col {
          display: flex; flex-direction: column; gap: 5px;
          max-width: calc(100% - 46px);
        }
        .rges-msg-row.user .rges-bubble-col { align-items: flex-end; }

        .rges-bubble {
          padding: 11px 15px; border-radius: 13px;
          font-size: 13.5px; line-height: 1.62; position: relative;
        }
        .rges-bubble.ai {
          background: rgba(255,255,255,0.038); border: 1px solid rgba(255,255,255,0.06);
          border-radius: 3px 13px 13px 13px; color: #cbd5e1;
        }
        .rges-bubble.ai.error { background: rgba(239,68,68,0.05); border-color: rgba(239,68,68,0.14); }
        .rges-bubble.ai.starred { border-color: rgba(245,158,11,0.3); background: rgba(245,158,11,0.04); }
        .rges-bubble.user {
          background: linear-gradient(135deg, #3730a3, #5b21b6);
          color: #e0e7ff; border-radius: 13px 3px 13px 13px;
          box-shadow: 0 4px 14px rgba(99,102,241,0.22);
        }
        .rges-msg-meta {
          display: flex; align-items: center; gap: 8px; padding: 0 2px; flex-wrap: wrap;
        }
        .rges-msg-time { font-size: 10px; color: #1e293b; display: flex; align-items: center; gap: 3px; }
        .rges-meta-btn {
          display: flex; align-items: center; gap: 3px;
          font-size: 10px; color: #1e293b; cursor: pointer;
          background: none; border: none; padding: 2px 5px; border-radius: 4px; transition: all 0.13s;
        }
        .rges-meta-btn:hover { background: rgba(255,255,255,0.05); color: #64748b; }
        .rges-meta-btn.starred { color: #f59e0b; }

        /* Typing */
        .rges-typing {
          display: flex; align-items: center; gap: 4px;
          padding: 11px 15px; background: rgba(255,255,255,0.038);
          border: 1px solid rgba(255,255,255,0.06); border-radius: 3px 13px 13px 13px; width: fit-content;
        }
        .rges-typing span {
          width: 6px; height: 6px; border-radius: 50%; background: #6366f1;
          display: block; animation: rges-bounce 1.2s ease-in-out infinite;
        }
        .rges-typing span:nth-child(2){animation-delay:.18s} .rges-typing span:nth-child(3){animation-delay:.36s}
        @keyframes rges-bounce { 0%,60%,100%{transform:translateY(0);opacity:.35} 30%{transform:translateY(-6px);opacity:1} }

        /* Tools */
        .rges-tools {
          display: flex; align-items: center; gap: 5px;
          font-size: 10px; color: #334155; padding: 0 2px;
          flex-wrap: wrap; user-select: none;
        }
        .rges-tools-list { display: flex; gap: 4px; flex-wrap: wrap; }
        .rges-tool-chip {
          padding: 2px 7px; border-radius: 99px;
          background: rgba(99,102,241,0.07); border: 1px solid rgba(99,102,241,0.18);
          color: #6366f1; font-size: 9.5px; font-weight: 500;
        }
        .rges-tool-chip.success { background: rgba(16,185,129,0.07); border-color: rgba(16,185,129,0.2); color: #10b981; }
        .rges-tool-chip.error   { background: rgba(239,68,68,0.07); border-color: rgba(239,68,68,0.2);  color: #ef4444; }

        /* Follow-up suggestions */
        .rges-followups {
          display: flex; flex-wrap: wrap; gap: 6px; padding: 2px 2px 0;
        }
        .rges-followup-btn {
          display: flex; align-items: center; gap: 4px;
          padding: 5px 10px; border-radius: 99px;
          background: rgba(99,102,241,0.07); border: 1px solid rgba(99,102,241,0.18);
          color: #6366f1; font-size: 11px; cursor: pointer; transition: all 0.18s;
        }
        .rges-followup-btn:hover { background: rgba(99,102,241,0.15); color: #818cf8; transform: translateY(-1px); }

        /* Date separator */
        .rges-date-sep {
          display: flex; align-items: center; gap: 10px;
          margin: 12px 0 4px; font-size: 10px; color: #1e293b;
        }
        .rges-date-sep::before,.rges-date-sep::after {
          content:""; flex: 1; height: 1px; background: rgba(255,255,255,0.05);
        }

        /* Clear confirm */
        .rges-confirm-bar {
          display: flex; align-items: center; justify-content: center; gap: 10px;
          padding: 8px 18px; background: rgba(239,68,68,0.07);
          border-bottom: 1px solid rgba(239,68,68,0.15); font-size: 12px; color: #94a3b8;
          flex-shrink: 0;
        }
        .rges-confirm-yes {
          padding: 4px 12px; border-radius: 6px; background: rgba(239,68,68,0.15);
          border: 1px solid rgba(239,68,68,0.3); color: #f87171;
          font-size: 11.5px; cursor: pointer; transition: all 0.15s;
        }
        .rges-confirm-yes:hover { background: rgba(239,68,68,0.25); }
        .rges-confirm-no {
          padding: 4px 12px; border-radius: 6px; background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08); color: #64748b;
          font-size: 11.5px; cursor: pointer; transition: all 0.15s;
        }
        .rges-confirm-no:hover { background: rgba(255,255,255,0.08); }

        /* Input */
        .rges-input-area {
          padding: 14px 20px 18px; flex-shrink: 0;
          background: rgba(7,9,15,0.96); backdrop-filter: blur(20px);
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .rges-input-wrap { max-width: 820px; margin: 0 auto; }
        .rges-input-box {
          display: flex; align-items: flex-end; gap: 10px;
          background: rgba(255,255,255,0.038); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px; padding: 11px 13px; transition: all 0.2s;
        }
        .rges-input-box:focus-within {
          border-color: rgba(99,102,241,0.38);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.07), 0 0 20px rgba(99,102,241,0.06);
        }
        .rges-textarea {
          flex: 1; background: none; border: none; outline: none;
          color: #e2e8f0; font-size: 13.5px; line-height: 1.6;
          resize: none; max-height: 160px; font-family: inherit;
        }
        .rges-textarea::placeholder { color: #1e293b; }
        .rges-send-btn {
          width: 34px; height: 34px; border-radius: 9px; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
          background: linear-gradient(135deg, #4338ca, #6d28d9);
          color: #fff; box-shadow: 0 4px 12px rgba(99,102,241,0.32); transition: all 0.18s;
        }
        .rges-send-btn:hover:not(:disabled) { transform: scale(1.06); box-shadow: 0 6px 16px rgba(99,102,241,0.45); }
        .rges-send-btn:disabled { background: rgba(255,255,255,0.04); color: #1e293b; box-shadow: none; cursor: not-allowed; }
        .rges-input-footer {
          display: flex; align-items: center; justify-content: space-between;
          margin-top: 8px; padding: 0 2px;
        }
        .rges-input-hint  { font-size: 10px; color: #1e293b; }
        .rges-word-count  { font-size: 10px; color: #1e293b; }

        /* Markdown */
        .rges-markdown  { color: #94a3b8; }
        .rges-h1 { font-size: 15px; font-weight: 700; color: #e2e8f0; margin: 12px 0 5px; }
        .rges-h2 { font-size: 13.5px; font-weight: 600; color: #cbd5e1; margin: 10px 0 4px; }
        .rges-h3 { font-size: 12.5px; font-weight: 600; color: #94a3b8; margin: 8px 0 3px; }
        .rges-h4 { font-size: 12px; font-weight: 600; color: #64748b; margin: 6px 0 3px; }
        .rges-p  { font-size: 13.5px; line-height: 1.65; color: #94a3b8; margin: 2px 0; }
        .rges-p strong { color: #e2e8f0; }
        .rges-hr { border: none; border-top: 1px solid rgba(255,255,255,0.06); margin: 9px 0; }
        .rges-spacer { height: 3px; }
        .rges-list { margin: 5px 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 4px; }
        .rges-list-item { display: flex; gap: 8px; align-items: flex-start; font-size: 13px; color: #64748b; line-height: 1.6; }
        .rges-list-item strong { color: #e2e8f0; }
        .rges-bullet { width: 5px; height: 5px; border-radius: 50%; background: #6366f1; flex-shrink: 0; margin-top: 7px; }
        .rges-code { background: rgba(0,0,0,0.45); border: 1px solid rgba(255,255,255,0.07); border-radius: 9px; padding: 13px 15px; font-family: 'JetBrains Mono','Fira Code',monospace; font-size: 12px; color: #a5b4fc; overflow-x: auto; margin: 7px 0; line-height: 1.7; }
        .rges-inline-code { background: rgba(99,102,241,0.1); color: #a5b4fc; padding: 1px 5px; border-radius: 4px; font-family: monospace; font-size: 12px; }
        .rges-table-wrap { overflow-x: auto; border-radius: 9px; border: 1px solid rgba(255,255,255,0.07); margin: 7px 0; }
        .rges-table { width: 100%; border-collapse: collapse; font-size: 12px; }
        .rges-table thead { background: rgba(99,102,241,0.07); }
        .rges-table th { padding: 9px 13px; text-align: left; font-weight: 600; color: #64748b; border-bottom: 1px solid rgba(255,255,255,0.07); white-space: nowrap; }
        .rges-table td { padding: 8px 13px; color: #475569; border-bottom: 1px solid rgba(255,255,255,0.04); }
        .rges-table tr:last-child td { border-bottom: none; }
        .rges-table tr:hover td { background: rgba(99,102,241,0.04); }

        /* Overlay */
        .rges-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.55); z-index: 40; backdrop-filter: blur(2px); }
        @media (max-width: 1023px) {
          .rges-sidebar { position: fixed; top: 0; left: 0; height: 100%; }
          .rges-overlay.on { display: block; }
        }
      `}</style>

      <div className="rges-root">
        {/* Mobile overlay */}
        <div className={`rges-overlay ${sidebarOpen && window.innerWidth < 1024 ? "on" : ""}`}
          onClick={() => setSidebarOpen(false)} />

        {/* ── SIDEBAR ── */}
        <aside className={`rges-sidebar ${sidebarOpen ? "" : "closed"}`}>
          <div className="rges-sidebar-top">
            <div className="rges-logo-row">
              <div className="rges-logo-icon">
                <Brain size={18} color="#fff" />
              </div>
              <div>
                <div className="rges-logo-name">{AGENT_NAME}</div>
                <div className="rges-logo-sub">{AGENT_TAGLINE}</div>
              </div>
            </div>
            <button className="rges-new-chat-btn" onClick={newChat}>
              <Plus size={13} /> New Chat
            </button>
            <div className="rges-sidebar-search">
              <Search size={12} color="#2d3748" />
              <input placeholder="Search chats…" value={searchSidebar} onChange={(e) => setSearchSidebar(e.target.value)} />
              {searchSidebar && <button className="rges-icon-btn" onClick={() => setSearchSidebar("")}><X size={10} /></button>}
            </div>
          </div>

          {/* Session list */}
          <div className="rges-sessions">
            {Object.entries(groupedSessions).map(([group, list]) =>
              list.length > 0 && (
                <div key={group}>
                  <div className="rges-group-label">{group}</div>
                  {list.map((s) => (
                    <div key={s.id}
                      className={`rges-session-item ${s.id === activeId ? "active" : ""}`}
                      onClick={() => { setActiveId(s.id); if (window.innerWidth < 1024) setSidebarOpen(false); }}
                    >
                      <MessageSquare size={12} className="rges-session-icon" />
                      {editingId === s.id ? (
                        <input className="rges-session-edit-input" value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onBlur={() => saveEdit(s.id)}
                          onKeyDown={(e) => { if (e.key === "Enter") saveEdit(s.id); e.stopPropagation(); }}
                          onClick={(e) => e.stopPropagation()} autoFocus />
                      ) : (
                        <span className="rges-session-title">{s.title}</span>
                      )}
                      <div className="rges-session-actions">
                        <button className="rges-icon-btn" onClick={(e) => { e.stopPropagation(); setEditingId(s.id); setEditTitle(s.title); }} title="Rename">
                          <Pencil size={10} />
                        </button>
                        <button className="rges-icon-btn danger" onClick={(e) => deleteSession(s.id, e)} title="Delete">
                          <Trash2 size={10} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>

          {/* Stats */}
          <div className="rges-stats-row">
            <div className="rges-stat-card">
              <div className="rges-stat-value">{stats.sessions}</div>
              <div className="rges-stat-label">Chats</div>
            </div>
            <div className="rges-stat-card">
              <div className="rges-stat-value">{stats.total}</div>
              <div className="rges-stat-label">Messages</div>
            </div>
          </div>

          <div className="rges-sidebar-footer">
            <div className="rges-caps">
              <div className="rges-caps-label">Capabilities</div>
              {[
                { icon: Database, label: "14 live school modules" },
                { icon: Zap, label: "Agentic tool execution" },
                { icon: Shield, label: "Secure & authenticated" },
                { icon: Brain, label: "Context-aware responses" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="rges-cap-item">
                  <Icon size={10} color="#334155" />{label}
                </div>
              ))}
            </div>
            <button className="rges-back-btn" onClick={() => navigate(ROUTES.DASHBOARD)}>
              <ArrowLeft size={13} /> Back to Dashboard
            </button>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main className="rges-main">
          {/* Topbar */}
          <div className="rges-topbar">
            <button className="rges-icon-btn" onClick={() => setSidebarOpen((p) => !p)}>
              {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
            <div className="rges-topbar-title">
              {isEmpty ? `${AGENT_NAME} — ${AGENT_TAGLINE}` : activeSession?.title}
            </div>
            <div className="rges-topbar-actions">
              {!isEmpty && (
                <>
                  <button className="rges-icon-btn" title="Search in chat" onClick={() => setShowSearch((p) => !p)}>
                    <Search size={15} />
                  </button>
                  <button className="rges-icon-btn" title="Export chat" onClick={exportChat}>
                    <Download size={15} />
                  </button>
                  <button className="rges-icon-btn danger" title="Clear chat" onClick={() => setShowClearConfirm(true)}>
                    <RefreshCw size={15} />
                  </button>
                </>
              )}
              <div className="rges-status-dot" title="Connected" />
            </div>
          </div>

          {/* In-chat search bar */}
          {showSearch && (
            <div className="rges-search-bar">
              <Search size={13} color="#6366f1" />
              <input ref={searchRef} placeholder="Search messages…" value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Escape") { setShowSearch(false); setSearchQuery(""); } }}
              />
              {searchQuery && (
                <span className="rges-search-count">
                  {messages.length} result{messages.length !== 1 ? "s" : ""}
                </span>
              )}
              <button className="rges-icon-btn" onClick={() => { setShowSearch(false); setSearchQuery(""); }}>
                <X size={13} />
              </button>
            </div>
          )}

          {/* Clear confirm */}
          {showClearConfirm && (
            <div className="rges-confirm-bar">
              <AlertCircle size={13} color="#f87171" />
              <span>Clear all messages in this chat?</span>
              <button className="rges-confirm-yes" onClick={clearChat}>Clear</button>
              <button className="rges-confirm-no" onClick={() => setShowClearConfirm(false)}>Cancel</button>
            </div>
          )}

          {/* Messages */}
          <div className="rges-messages">
            <div className="rges-messages-inner">
              {isEmpty ? (
                /* Welcome */
                <div className="rges-welcome">
                  <div className="rges-orb">
                    <div className="rges-orb-glow" />
                    <div className="rges-orb-icon">
                      <Sparkles size={38} color="#c7d2fe" />
                    </div>
                  </div>
                  <div className="rges-welcome-name">{AGENT_NAME}</div>
                  <div className="rges-welcome-sub">{AGENT_TAGLINE}</div>
                  <div className="rges-welcome-desc">
                    Your intelligent school management assistant. Ask me about students, attendance, fees, teachers, exams, inventory, and more — in plain English.
                  </div>
                  <div className="rges-feature-pills">
                    {[
                      { icon: Database, label: "14 modules" },
                      { icon: Zap,      label: "Real-time data" },
                      { icon: Brain,    label: "AI reasoning" },
                      { icon: Shield,   label: "Secure" },
                      { icon: Calendar, label: "Date-aware" },
                    ].map(({ icon: Icon, label }) => (
                      <div key={label} className="rges-pill"><Icon size={11} />{label}</div>
                    ))}
                  </div>
                  <div className="rges-prompts-grid">
                    {SUGGESTED_PROMPTS.map((p) => (
                      <button key={p.label} className="rges-prompt-card"
                        style={{ background: p.bg, borderColor: p.border }}
                        onClick={() => sendMessage(p.prompt)}
                      >
                        <div className="rges-prompt-card-icon" style={{ background: `${p.color}16` }}>
                          <p.icon size={14} color={p.color} />
                        </div>
                        <div className="rges-prompt-card-label" style={{ color: p.color }}>{p.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isUser = msg.role === "user";
                  const isStarred = starredMsgs[idx];
                  return (
                    <div key={idx} className={`rges-msg-row ${isUser ? "user" : ""}`}>
                      <div className={`rges-avatar ${isUser ? "user" : "ai"}`}>
                        {isUser ? initials : <Brain size={14} color="#c7d2fe" />}
                      </div>
                      <div className="rges-bubble-col">
                        <div className={`rges-bubble ${isUser ? "user" : `ai${msg.isError ? " error" : ""}${isStarred ? " starred" : ""}`}`}>
                          {isUser
                            ? <span style={{ whiteSpace: "pre-wrap" }}>{msg.content}</span>
                            : <MarkdownRenderer text={msg.content} />
                          }
                        </div>
                        <div className="rges-msg-meta">
                          <span className="rges-msg-time">
                            <Clock size={9} />{msg.timestamp}
                          </span>
                          {!isUser && (
                            <>
                              <button className="rges-meta-btn" onClick={() => copyText(msg.content, idx)}>
                                {copiedIdx === idx ? <Check size={9} /> : <Copy size={9} />}
                                {copiedIdx === idx ? "Copied" : "Copy"}
                              </button>
                              <button className={`rges-meta-btn ${isStarred ? "starred" : ""}`} onClick={() => toggleStar(idx)} title="Star message">
                                <Star size={9} fill={isStarred ? "currentColor" : "none"} />
                                {isStarred ? "Starred" : "Star"}
                              </button>
                            </>
                          )}
                        </div>
                        {!isUser && msg.tools?.length > 0 && <ToolBadge tools={msg.tools} />}
                        {!isUser && !msg.isError && idx === messages.length - 1 && !loading && (
                          <FollowUpSuggestions onSelect={sendMessage} />
                        )}
                      </div>
                    </div>
                  );
                })
              )}

              {loading && (
                <div className="rges-msg-row">
                  <div className="rges-avatar ai"><Brain size={14} color="#c7d2fe" /></div>
                  <div className="rges-bubble-col">
                    <TypingIndicator />
                    <span style={{ fontSize: 10, color: "#1e293b", paddingLeft: 2, marginTop: 2 }}>
                      {AGENT_NAME} is thinking…
                    </span>
                  </div>
                </div>
              )}

              {searchQuery && messages.length === 0 && (
                <div style={{ textAlign: "center", padding: "60px 20px", color: "#334155", fontSize: 13 }}>
                  <Search size={28} color="#1e293b" style={{ margin: "0 auto 12px" }} />
                  <div>No messages match "<strong style={{ color: "#475569" }}>{searchQuery}</strong>"</div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <div className="rges-input-area">
            <div className="rges-input-wrap">
              <div className="rges-input-box">
                <textarea ref={textareaRef} className="rges-textarea" rows={1}
                  placeholder={`Ask ${AGENT_NAME} anything about your school…`}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                />
                <button className="rges-send-btn" onClick={() => sendMessage()}
                  disabled={!input.trim() || loading} title="Send (Enter)">
                  <Send size={14} />
                </button>
              </div>
              <div className="rges-input-footer">
                <div className="rges-input-hint">Enter to send · Shift+Enter for newline · Esc to close search</div>
                {input.trim() && (
                  <div className="rges-word-count">{wordCount} word{wordCount !== 1 ? "s" : ""}</div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
