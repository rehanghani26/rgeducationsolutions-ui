import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, ArrowRight, Loader2, Sparkles, Plus, Trash2, ListOrdered } from 'lucide-react';
import { toast } from 'react-toastify';
import setupService from '../../../services/setupService.js';
import api from '../../../services/api.js';

const STANDARD_8_PERIODS = [
  { periodNumber: 1, name: 'Period 1', startTime: '08:00', endTime: '08:45', isBreak: false },
  { periodNumber: 2, name: 'Period 2', startTime: '08:45', endTime: '09:30', isBreak: false },
  { periodNumber: 3, name: 'Period 3', startTime: '09:30', endTime: '10:15', isBreak: false },
  { periodNumber: 4, name: 'Period 4', startTime: '10:15', endTime: '11:00', isBreak: false },
  { periodNumber: 5, name: 'Recess / Lunch', startTime: '11:00', endTime: '11:35', isBreak: true },
  { periodNumber: 6, name: 'Period 5', startTime: '11:35', endTime: '12:20', isBreak: false },
  { periodNumber: 7, name: 'Period 6', startTime: '12:20', endTime: '13:05', isBreak: false },
  { periodNumber: 8, name: 'Period 7', startTime: '13:05', endTime: '13:50', isBreak: false },
  { periodNumber: 9, name: 'Period 8', startTime: '13:50', endTime: '14:30', isBreak: false },
];

export default function Step3MasterPeriods({ onComplete, onNext }) {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [existingPeriods, setExistingPeriods] = useState([]);

  const [scheduleName, setScheduleName] = useState('Standard Daily Bell Schedule');
  const [schoolStartTime, setSchoolStartTime] = useState('08:00');
  const [schoolEndTime, setSchoolEndTime] = useState('14:30');
  const [periods, setPeriods] = useState(STANDARD_8_PERIODS);

  const loadExisting = async () => {
    try {
      setInitialLoading(true);
      const res = await api.get('/erp/master-periods');
      const list = res.data?.data || res.data?.periods || [];
      setExistingPeriods(list);
      if (list.length > 0) {
        const active = list.find((p) => p.isActive) || list[0];
        if (active) {
          setScheduleName(active.scheduleName || 'Standard Daily Bell Schedule');
          setSchoolStartTime(active.schoolStartTime || '08:00');
          setSchoolEndTime(active.schoolEndTime || '14:30');
          if (Array.isArray(active.periods) && active.periods.length > 0) {
            setPeriods(active.periods);
          }
        }
      }
    } catch (err) {
      console.warn('Could not load master periods:', err);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    loadExisting();
  }, []);

  const handlePeriodChange = (index, field, value) => {
    setPeriods((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const addPeriod = () => {
    setPeriods((prev) => [
      ...prev,
      {
        periodNumber: prev.length + 1,
        name: `Period ${prev.length + 1}`,
        startTime: '14:30',
        endTime: '15:15',
        isBreak: false,
      },
    ]);
  };

  const removePeriod = (index) => {
    setPeriods((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!scheduleName.trim()) {
      toast.error('Schedule Name is required');
      return;
    }
    if (periods.length === 0) {
      toast.error('At least one period slot is required');
      return;
    }

    try {
      setLoading(true);
      await setupService.saveMasterPeriods({
        scheduleName,
        schoolStartTime,
        schoolEndTime,
        periods,
      });
      toast.success('Master Period bell schedule created successfully!');
      if (onComplete) await onComplete('masterPeriods');
      if (onNext) onNext();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to save master periods');
    } finally {
      setLoading(false);
    }
  };

  const handleUseExisting = async () => {
    if (onComplete) await onComplete('masterPeriods');
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
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-slate-800/80 dark:to-orange-950/40 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/50">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-600 text-white rounded-xl shadow-md">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              Step 3: Master Periods & Bell Schedule
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Defines standard school hours and daily period intervals. Every Class Timetable inherits from this schedule.
            </p>
          </div>
        </div>
      </div>

      {existingPeriods.length > 0 && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                Found {existingPeriods.length} Existing Master Period Schedule(s)
              </p>
              <p className="text-[11px] text-amber-700 dark:text-amber-400">
                Active schedule is ready for timetable assignments.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleUseExisting}
            className="px-3 py-1.5 bg-amber-600 text-white font-bold text-xs rounded-lg hover:bg-amber-700 transition"
          >
            Use Existing & Next →
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Bell Schedule Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={scheduleName}
            onChange={(e) => setScheduleName(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            School Gate Opening Time
          </label>
          <input
            type="time"
            value={schoolStartTime}
            onChange={(e) => setSchoolStartTime(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            School Gate Dispersal Time
          </label>
          <input
            type="time"
            value={schoolEndTime}
            onChange={(e) => setSchoolEndTime(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
          />
        </div>
      </div>

      {/* Period Slots Table */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Daily Period Slots ({periods.length} configured)
          </label>
          <button
            type="button"
            onClick={addPeriod}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200 rounded-lg hover:bg-amber-200 transition"
          >
            <Plus className="w-3.5 h-3.5" /> Add Slot
          </button>
        </div>

        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-2.5 w-12 text-center">#</th>
                <th className="p-2.5">Slot Label</th>
                <th className="p-2.5 w-28">Start</th>
                <th className="p-2.5 w-28">End</th>
                <th className="p-2.5 w-24 text-center">Recess?</th>
                <th className="p-2.5 w-12 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {periods.map((p, idx) => (
                <tr key={idx} className={p.isBreak ? 'bg-amber-50/40 dark:bg-amber-950/20' : 'bg-white dark:bg-slate-900'}>
                  <td className="p-2 text-center font-bold text-slate-500">{idx + 1}</td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={p.name}
                      onChange={(e) => handlePeriodChange(idx, 'name', e.target.value)}
                      className="w-full px-2 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="time"
                      value={p.startTime}
                      onChange={(e) => handlePeriodChange(idx, 'startTime', e.target.value)}
                      className="w-full px-2 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="time"
                      value={p.endTime}
                      onChange={(e) => handlePeriodChange(idx, 'endTime', e.target.value)}
                      className="w-full px-2 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </td>
                  <td className="p-2 text-center">
                    <input
                      type="checkbox"
                      checked={!!p.isBreak}
                      onChange={(e) => handlePeriodChange(idx, 'isBreak', e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                  </td>
                  <td className="p-2 text-center">
                    <button
                      type="button"
                      onClick={() => removePeriod(idx)}
                      disabled={periods.length <= 1}
                      className="text-rose-500 hover:text-rose-700 disabled:opacity-30"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 bg-amber-600 hover:bg-amber-700 active:scale-95 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg shadow-amber-600/30 transition cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving Bell Schedule...
            </>
          ) : (
            <>
              Save Schedule & Proceed to Step 4
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
