import React, { useState, useEffect } from 'react';
import { Building2, Mail, Phone, MapPin, Globe, Award, Sparkles, Check, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import setupService from '../../../services/setupService.js';
import api from '../../../services/api.js';

export default function Step1SchoolProfile({ onComplete, onNext }) {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [form, setForm] = useState({
    schoolName: '',
    contactEmail: '',
    schoolPhone: '',
    addressLine1: '',
    city: '',
    state: '',
    country: 'India',
    postalCode: '',
    affiliationNumber: '',
    board: 'CBSE',
    motto: '',
  });

  useEffect(() => {
    let mounted = true;
    api.get('/erp/settings')
      .then((res) => {
        if (!mounted) return;
        const s = res.data?.settings || {};
        setForm((prev) => ({
          ...prev,
          schoolName: s.schoolName || '',
          contactEmail: s.contactEmail || '',
          schoolPhone: s.schoolPhone || '',
          addressLine1: s.addressLine1 || '',
          city: s.city || '',
          state: s.state || '',
          country: s.country || 'India',
          postalCode: s.postalCode || '',
          affiliationNumber: s.affiliationNumber || '',
          board: s.board || 'CBSE',
          motto: s.motto || '',
        }));
      })
      .catch((err) => console.warn('Could not fetch existing profile settings:', err))
      .finally(() => {
        if (mounted) setInitialLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.schoolName?.trim()) {
      toast.error('School name is required');
      return;
    }
    if (!form.contactEmail?.trim()) {
      toast.error('Official contact email is required');
      return;
    }
    if (!form.schoolPhone?.trim()) {
      toast.error('Contact phone number is required');
      return;
    }
    if (!form.addressLine1?.trim() || !form.city?.trim() || !form.state?.trim()) {
      toast.error('Address, City, and State are required');
      return;
    }

    try {
      setLoading(true);
      await setupService.saveSchoolProfile(form);
      toast.success('School profile saved successfully!');
      if (onComplete) await onComplete('schoolProfile');
      if (onNext) onNext();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to save school profile');
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
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-slate-800/80 dark:to-indigo-950/40 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/50">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-md">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              Step 1: School Identity & Official Contact
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              This information powers student ID cards, report cards, fee receipts, portal headers, and certificate watermarks.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            School Full Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              name="schoolName"
              value={form.schoolName}
              onChange={handleChange}
              placeholder="e.g. Greenwood International Public School"
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Official Email Address <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="email"
              name="contactEmail"
              value={form.contactEmail}
              onChange={handleChange}
              placeholder="principal@school.edu"
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Office Contact Phone <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              name="schoolPhone"
              value={form.schoolPhone}
              onChange={handleChange}
              placeholder="+91 98765 43210"
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Campus Street Address <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              name="addressLine1"
              value={form.addressLine1}
              onChange={handleChange}
              placeholder="Plot No. 42, Knowledge Park III"
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            City <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="city"
            value={form.city}
            onChange={handleChange}
            placeholder="New Delhi"
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            State / Province <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="state"
            value={form.state}
            onChange={handleChange}
            placeholder="Delhi NCR"
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Country <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="country"
            value={form.country}
            onChange={handleChange}
            placeholder="India"
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Postal / PIN Code
          </label>
          <input
            type="text"
            name="postalCode"
            value={form.postalCode}
            onChange={handleChange}
            placeholder="110001"
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Education Board / Affiliation
          </label>
          <select
            name="board"
            value={form.board}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="CBSE">CBSE (Central Board)</option>
            <option value="ICSE">ICSE / ISC</option>
            <option value="State Board">State Secondary Board</option>
            <option value="IB">International Baccalaureate (IB)</option>
            <option value="Cambridge">Cambridge IGCSE</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Affiliation / Registration No.
          </label>
          <input
            type="text"
            name="affiliationNumber"
            value={form.affiliationNumber}
            onChange={handleChange}
            placeholder="e.g. CBSE/AFF/2026/9981"
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            School Motto / Vision Line
          </label>
          <input
            type="text"
            name="motto"
            value={form.motto}
            onChange={handleChange}
            placeholder="e.g. Inspiring Excellence, Cultivating Character"
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving Profile...
            </>
          ) : (
            <>
              Save & Proceed to Step 2
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
