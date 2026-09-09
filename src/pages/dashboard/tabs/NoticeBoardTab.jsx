import React, { useState, useEffect } from "react";
import { Megaphone } from "lucide-react";
import erpService from "../../../services/erpService.js";
import Loader from "../../../components/ui/Loader.jsx";

const NoticeBoardTab = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    erpService.getNotices()
      .then((res) => {
        const list = res?.notices || res?.data?.notices || (Array.isArray(res) ? res : []);
        setNotices(list);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-[#111827]">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h3 className="flex items-center gap-2 text-xl font-extrabold text-slate-900 dark:text-white">
              <Megaphone className="text-indigo-400" size={24} /> School Official Notice Board
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Official announcements, exam schedules, transport alerts, and event notifications.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            {notices.length} Published Bulletins
          </span>
        </div>

        {loading ? (
          <Loader fullPage size="lg" text="Fetching notice board announcements..." />
        ) : notices.length === 0 ? (
          <div className="py-12 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
            No official announcements or notices published at this time.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notices.map((n, idx) => (
              <div
                key={n._id || n.id || idx}
                className="flex flex-col justify-between space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 transition-all hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{n.icon || "📢"}</span>
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">{n.title}</h4>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        n.priority === "high"
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          : n.priority === "medium"
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : "bg-slate-700/50 text-slate-400"
                      }`}
                    >
                      {n.category || "General"}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">{n.content || n.desc}</p>
                </div>

                <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-[10px] font-semibold text-slate-500 dark:border-slate-800/80">
                  <span>Published by {n.author || "Administration"}</span>
                  <span>{new Date(n.createdAt || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NoticeBoardTab;
