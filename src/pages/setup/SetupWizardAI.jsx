import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Loader2,
  Bot,
  User,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  Zap,
} from 'lucide-react';
import api from '../../services/api.js';

const QUICK_PROMPTS = [
  '🧙 Check setup status and tell me what to do next',
  '🏫 Setup School: Apex Global Academy, 12 Park Street, Mumbai, Maharashtra, India',
  '🗓️ Create and activate Academic Session 2026-2027 from April 1 to March 31',
  '⏰ Configure a standard 8-period daily bell schedule from 8 AM to 2:30 PM',
  '💰 Set currency as Indian Rupee (₹) with monthly billing and 7 days grace',
];

export default function SetupWizardAI({ onStepCompleted, onStatusRefresh, status }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "👋 Hello Administrator! I am your **AI Setup Assistant**.\n\nI can configure your entire school ERP foundation for you — just tell me your school details, or click any prompt below to get started!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending]);

  const handleSend = async (messageText) => {
    const textToSend = (messageText || input).trim();
    if (!textToSend || sending) return;

    setInput('');
    const userMsg = {
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setSending(true);

    try {
      const res = await api.post('/ai/chat', { message: textToSend });
      const reply =
        res.data?.reply ||
        res.data?.message ||
        res.data?.data?.reply ||
        'I have processed your request. Let me check the updated setup status.';

      const botMsg = {
        role: 'assistant',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);

      // If tools were executed, trigger status refresh
      if (onStatusRefresh) {
        setTimeout(async () => {
          await onStatusRefresh();
        }, 800);
      }
    } catch (err) {
      const errorReply =
        err?.response?.data?.message ||
        err?.message ||
        'Sorry, I encountered an issue executing this setup step. You can also configure this manually via the tabs above.';
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ ${errorReply}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[520px] bg-slate-900 rounded-2xl border border-indigo-900/40 text-slate-100 overflow-hidden shadow-2xl">
      {/* AI Header */}
      <div className="px-5 py-3.5 bg-gradient-to-r from-indigo-950/80 via-slate-900 to-indigo-950/80 border-b border-indigo-800/40 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/25">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-white tracking-wide">
                AI Onboarding Copilot
              </h4>
              <span className="px-2 py-0.5 text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Tools Armed
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Direct database write access to all 5 foundational setup modules
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setMessages([
              {
                role: 'assistant',
                content: 'Chat reset. What would you like to set up next?',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ]);
          }}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          title="Clear Chat"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Messages Thread */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${
              m.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                m.role === 'user'
                  ? 'bg-gradient-to-br from-indigo-600 to-blue-600 text-white'
                  : 'bg-gradient-to-br from-purple-600 to-indigo-700 text-white shadow-md'
              }`}
            >
              {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                m.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none'
                  : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-tl-none whitespace-pre-wrap'
              }`}
            >
              {m.content}
              <div
                className={`text-[9px] mt-1.5 ${
                  m.role === 'user' ? 'text-indigo-200' : 'text-slate-400'
                }`}
              >
                {m.timestamp}
              </div>
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-xl bg-purple-600 text-white flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-slate-800 text-xs text-slate-400 flex items-center gap-2 border border-slate-700">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
              Executing setup tools & verifying database state...
            </div>
          </div>
        )}
      </div>

      {/* Quick Prompts Bar */}
      <div className="px-4 py-2 bg-slate-950/70 border-t border-slate-800/80 overflow-x-auto">
        <div className="flex items-center gap-2 whitespace-nowrap">
          <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" /> Quick actions:
          </span>
          {QUICK_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              type="button"
              disabled={sending}
              onClick={() => handleSend(prompt)}
              className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-800 hover:bg-indigo-600/30 hover:border-indigo-500 border border-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <div className="p-3 bg-slate-950 border-t border-slate-800/80">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={sending}
            placeholder="Ask AI to setup anything (e.g. 'Set our school name to Delhi Public School')..."
            className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="p-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:scale-95 disabled:opacity-40 text-white rounded-xl shadow-lg transition cursor-pointer"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}
