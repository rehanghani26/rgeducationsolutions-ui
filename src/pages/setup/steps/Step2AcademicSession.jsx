import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, ArrowRight, Loader2, Sparkles, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import setupService from '../../../services/setupService.js';
import api from '../../../services/api.js';

export default function Step2AcademicSession({ onComplete, onNext }) {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [existingSessions, setExistingSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);

  const [form, setForm] = useState({
    sessionName: '2026-2027',
    startDate: '2026-04-01',
    endDate: '2027-03-31',
    notes: 'Default primary academic session',
  });

  const loadSessions = async () => {
    try {
      setInitialLoading(true);
      const res = await api.get('/sessions');
      const list = res.data?.data || res.data?.sessions || [];
      setExistingSessions(list);
      const curr = list.find((s) => s.isCurrent);
      if (curr) {
        setActiveSession(curr);
        setForm({
          sessionName: curr.sessionName || '2026-2027',
          startDate: curr.startDate ? curr.startDate.slice(0, 10) : '2026-04-01',
          endDate: curr.endDate ? curr.endDate.slice(0, 10) : '2027-03-31',
          notes: curr.notes || '',
        });
      }
    } catch (err) {
      console.warn('Could not load sessions:', err);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const applyPreset = (name, start, end) => {
    setForm((prev) => ({
      ...prev,
      sessionName: name,
      startDate: start,
      endDate: end,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.sessionName?.trim()) {
      toast.error('Session Name is required (e.g. 2026-2027)');
      return;
    }
    if (!form.startDate || !form.endDate) {
      toast.error('Both start and end dates are required');
      return;
    }
    if (new Date(form.startDate) >= new Date(form.endDate)) {
      toast.error('End date must be after start date');
      return;
    }

    try {
      setLoading(true);
      await setupService.saveAcademicSession(form);
      toast.success(`Academic Session "${form.sessionName}" created and activated!`);
      if (onComplete) await onComplete('academicSession');
      if (onNext) onNext();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to save academic session');
    } finally {
      setLoading(false);
    }
  };

  const handleUseExisting = async () => {
    if (onComplete) await onComplete('academicSession');
    if (onNext) onNext();
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-slate-800/80 dark:to-teal-950/40 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/50">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-md">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              Step 2: Academic Session & Master Calendar
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              The active academic session is the root anchor for student admissions, class enrollment, daily attendance, fee ledgers, and final exams.
            </p>
          </div>
        </div>
      </div>

      {activeSession && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                Active Session Detected: <span className="font-extrabold">{activeSession.sessionName}</span>
              </p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                Duration: {activeSession.startDate?.slice(0, 10)} to {activeSession.endDate?.slice(0, 10)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleUseExisting}
            className="px-3 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-lg hover:bg-emerald-700 transition"
          >
            Keep Active & Next →
          </button>
        </div>
      )}

      {/* Preset Quick Chooser */}
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
          ⚡ Quick Calendar Presets
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => applyPreset('2026-2027', '2026-04-01', '2027-03-31')}
            className={`p-3 text-left rounded-xl border transition ${
              form.sessionName === '2026-2027' && form.startDate === '2026-04-01'
                ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
            }`}
          >
            <div className="font-bold text-xs text-slate-800 dark:text-white">CBSE / Indian Standard</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Apr 2026 – Mar 2027</div>
          </button>

          <button
            type="button"
            onClick={() => applyPreset('2026-2027 (Fall)', '2026-08-01', '2027-05-31')}
            className={`p-3 text-left rounded-xl border transition ${
              form.startDate === '2026-08-01'
                ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
            }`}
          >
            <div className="font-bold text-xs text-slate-800 dark:text-white">Western / International</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Aug 2026 – May 2027</div>
          </button>

          <button
            type="button"
            onClick={() => applyPreset('2026 Calendar', '2026-01-01', '2026-12-31')}
            className={`p-3 text-left rounded-xl border transition ${
              form.startDate === '2026-01-01'
                ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
            }`}
          >
            <div className="font-bold text-xs text-slate-800 dark:text-white">Calendar Year</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Jan 2026 – Dec 2026</div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Session Name / Label <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="sessionName"
            value={form.sessionName}
            onChange={(e) => setForm({ ...form, sessionName: e.target.value })}
            placeholder="e.g. 2026-2027"
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Start Date <span className="text-rose-500">*</span>
          </label>
          <input
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            End Date <span className="text-rose-500">*</span>
          </label>
          <input
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
            required
          />
        </div>

        <div className="md:col-span-3">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Administrative Notes
          </label>
          <input
            type="text"
            name="notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="e.g. Approved by Academic Governing Council on March 2026"
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/30 transition cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Activating Session...
            </>
          ) : (
            <>
              Activate Session & Proceed to Step 3
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
