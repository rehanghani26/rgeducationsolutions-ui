import React, { useState, useEffect } from "react";
import { Plus, Trash2, Megaphone, AlertCircle, CheckCircle } from "lucide-react";
import erpService from "../../services/erpService.js";

const NoticeSettings = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    content: "",
    category: "General",
    icon: "📢",
    priority: "medium",
    targetRoles: ["all"],
  });

  const [msg, setMsg] = useState({ type: "", text: "" });

  const fetchNotices = () => {
    setLoading(true);
    erpService.getNotices()
      .then((res) => {
        const list = res?.notices || res?.data?.notices || (Array.isArray(res) ? res : []);
        setNotices(list);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.content) return;
    setSubmitting(true);
    setMsg({ type: "", text: "" });

    erpService.createNotice(form)
      .then((res) => {
        setMsg({ type: "success", text: "Notice published successfully!" });
        setForm({
          title: "",
          content: "",
          category: "General",
          icon: "📢",
          priority: "medium",
          targetRoles: ["all"],
        });
        fetchNotices();
      })
      .catch((err) => {
        setMsg({ type: "error", text: err.response?.data?.message || err.message || "Failed to create notice." });
      })
      .finally(() => setSubmitting(false));
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to remove this notice?")) return;
    erpService.deleteNotice(id)
      .then(() => {
        setNotices((prev) => prev.filter((n) => (n._id || n.id) !== id));
      })
      .catch((err) => {
        setMsg({ type: "error", text: err.message || "Failed to delete notice." });
      });
  };

  return (
    <div className="space-y-6 text-slate-100">
      <div className="bg-[#111827] border border-slate-800/80 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-extrabold text-white mb-1 flex items-center gap-2">
          <Megaphone className="text-indigo-400" size={20} /> Publish New Notice
        </h3>
        <p className="text-xs text-slate-400 mb-5">
          Notices published here will appear live on the Dashboard for students, teachers, and parents.
        </p>

        {msg.text && (
          <div className={`p-3 rounded-xl text-xs font-bold mb-4 ${msg.type === "success" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"}`}>
            {msg.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-400 mb-1 uppercase text-[10px]">Notice Title</label>
              <input
                required
                type="text"
                placeholder="e.g. School Annual Day Celebration"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-400 mb-1 uppercase text-[10px]">Category & Icon</label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="General">📢 General</option>
                  <option value="Academic">📅 Academic</option>
                  <option value="Event">🎉 Event</option>
                  <option value="Transport">🚌 Transport</option>
                  <option value="Urgent">⚠️ Urgent</option>
                </select>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-400 mb-1 uppercase text-[10px]">Notice Announcement Content</label>
            <textarea
              required
              rows={3}
              placeholder="Provide detailed description of the notice..."
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              disabled={submitting}
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg transition-all flex items-center gap-2"
            >
              <Plus size={16} /> {submitting ? "Publishing..." : "Publish Notice"}
            </button>
          </div>
        </form>
      </div>

      {/* Active Notices List */}
      <div className="bg-[#111827] border border-slate-800/80 rounded-2xl p-6 shadow-sm">
        <h4 className="font-extrabold text-sm text-white mb-4">Active Published Notices</h4>
        {loading ? (
          <div className="text-center py-8 text-slate-400 text-xs font-semibold">
            Loading active notices...
          </div>
        ) : notices.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs font-semibold">
            No active notices published yet.
          </div>
        ) : (
          <div className="space-y-3">
            {notices.map((n) => (
              <div key={n._id || n.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{n.icon || "📢"}</span>
                    <h5 className="font-extrabold text-white text-sm">{n.title}</h5>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-400 uppercase">{n.category}</span>
                  </div>
                  <p className="text-xs text-slate-300">{n.content}</p>
                  <span className="text-[10px] text-slate-500 block">Published by {n.author || "Admin"}</span>
                </div>
                <button
                  onClick={() => handleDelete(n._id || n.id)}
                  className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all flex-shrink-0"
                  title="Delete notice"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NoticeSettings;
