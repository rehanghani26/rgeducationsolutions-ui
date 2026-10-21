import React, { useState, useEffect } from 'react';
import { GraduationCap, CheckCircle2, ArrowRight, Loader2, Sparkles, Percent, BookOpen } from 'lucide-react';
import { toast } from 'react-toastify';
import setupService from '../../../services/setupService.js';
import api from '../../../services/api.js';

export default function Step4AcademicRules({ onComplete, onNext }) {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [form, setForm] = useState({
    defaultPassingPercentage: 40,
    gradePointScale: '10.0',
    minAttendancePercentage: 75,
    examTermsCount: '3',
    rankGeneration: 'Class & Section',
  });

  useEffect(() => {
    let mounted = true;
    api.get('/erp/settings')
      .then((res) => {
        if (!mounted) return;
        const s = res.data?.settings || {};
        setForm((prev) => ({
          ...prev,
          defaultPassingPercentage: s.defaultPassingPercentage || 40,
          gradePointScale: s.gradePointScale || '10.0',
          minAttendancePercentage: s.minAttendancePercentage || 75,
        }));
      })
      .catch((err) => console.warn('Could not load academic rules:', err))
      .finally(() => {
        if (mounted) setInitialLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const passing = Number(form.defaultPassingPercentage);
    if (isNaN(passing) || passing < 10 || passing > 100) {
      toast.error('Passing percentage must be between 10% and 100%');
      return;
    }

    try {
      setLoading(true);
      await setupService.saveAcademicRules(form);
      toast.success('Academic & Grading rules saved successfully!');
      if (onComplete) await onComplete('academicRules');
      if (onNext) onNext();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to save academic rules');
    } finally {
      setLoading(false);
    }
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
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-slate-800/80 dark:to-purple-950/40 p-4 rounded-2xl border border-purple-100 dark:border-purple-900/50">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-purple-600 text-white rounded-xl shadow-md">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              Step 4: Academic Policies & Grading Rules
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              These baseline rules govern Exam mark entry, pass/fail status calculation, GPA points, and student promotion criteria.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Minimum Passing Percentage (%) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Percent className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="number"
              min="20"
              max="100"
              value={form.defaultPassingPercentage}
              onChange={(e) => setForm({ ...form, defaultPassingPercentage: Number(e.target.value) })}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
              required
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Standard: 33% for CBSE/ICSE, 40% for College/Univ.</p>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Grading Point Scale
          </label>
          <select
            value={form.gradePointScale}
            onChange={(e) => setForm({ ...form, gradePointScale: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
          >
            <option value="10.0">10.0 GPA Scale (CBSE Standard / Indian Universities)</option>
            <option value="4.0">4.0 GPA Scale (US / International Standard)</option>
            <option value="percentage">Pure Percentage Only (No GPA)</option>
            <option value="letter">Letter Grades (A+, A, B, C, D, F)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Minimum Attendance for Exam Eligibility (%)
          </label>
          <div className="relative">
            <Percent className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="number"
              min="50"
              max="100"
              value={form.minAttendancePercentage}
              onChange={(e) => setForm({ ...form, minAttendancePercentage: Number(e.target.value) })}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Students below this threshold trigger attendance alerts.</p>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Annual Evaluation Framework
          </label>
          <select
            value={form.examTermsCount}
            onChange={(e) => setForm({ ...form, examTermsCount: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
          >
            <option value="2">2 Terms (Term 1 Mid-Year & Term 2 Final)</option>
            <option value="3">3 Terms (Quarterly, Half-Yearly, Annual)</option>
            <option value="4">4 Quarters (Periodic Assessments Q1–Q4)</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 active:scale-95 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg shadow-purple-600/30 transition cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving Academic Rules...
            </>
          ) : (
            <>
              Save Rules & Proceed to Step 5
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
