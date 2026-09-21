/**
 * @file TemplateCustomizerModal.jsx
 * @description Visual template customization studio. Allows customizing colors, fonts,
 * and toggling QR/photo components on built-in templates, with instant live preview.
 */

import React, { useState, useMemo } from 'react';
import { X, Palette, Save, Check, Sliders, Eye } from 'lucide-react';
import { ALL_TEMPLATES, getTemplateById } from '../templates/registry.js';
import { createCustomTemplate, updateCustomTemplate } from '../services/documentService.js';
import { renderTemplate, prepareTemplateData } from '../utils/templateRenderer.js';
import { MOCK_STUDENT_DATA, MOCK_CERTIFICATE_DATA } from '../constants/documentConstants.js';

export default function TemplateCustomizerModal({
  isOpen,
  onClose,
  onSuccess,
  editingTemplate = null,
  schoolSettings = {},
}) {
  const initialBase = editingTemplate ? editingTemplate.baseTemplateId : 'student-id-classic';
  const initialConfig = editingTemplate?.configuration || {
    primaryColor: '#1e3a8a',
    secondaryColor: '#3b82f6',
    fontFamily: 'Inter',
    showQRCode: true,
    showPhoto: true,
    showSignature: true,
  };

  const [name, setName] = useState(editingTemplate ? editingTemplate.name : 'Custom Template');
  const [baseTemplateId, setBaseTemplateId] = useState(initialBase);
  const [primaryColor, setPrimaryColor] = useState(initialConfig.primaryColor || '#1e3a8a');
  const [secondaryColor, setSecondaryColor] = useState(initialConfig.secondaryColor || '#3b82f6');
  const [fontFamily, setFontFamily] = useState(initialConfig.fontFamily || 'Inter');
  const [showQRCode, setShowQRCode] = useState(initialConfig.showQRCode !== false);
  const [showPhoto, setShowPhoto] = useState(initialConfig.showPhoto !== false);
  const [showSignature, setShowSignature] = useState(initialConfig.showSignature !== false);
  const [saving, setSaving] = useState(false);

  const selectedBaseTemplate = useMemo(() => {
    return getTemplateById(baseTemplateId);
  }, [baseTemplateId]);

  // Real-time live preview HTML
  const previewHtml = useMemo(() => {
    if (!selectedBaseTemplate) return '';
    const isCert = selectedBaseTemplate.category === 'certificate';
    const sampleData = isCert ? MOCK_CERTIFICATE_DATA : MOCK_STUDENT_DATA;
    const prepared = prepareTemplateData(sampleData, 'student', schoolSettings);
    return renderTemplate(selectedBaseTemplate, prepared, {
      primaryColor,
      secondaryColor,
      fontFamily,
      showQRCode,
      showPhoto,
      showSignature,
    });
  }, [selectedBaseTemplate, primaryColor, secondaryColor, fontFamily, showQRCode, showPhoto, showSignature, schoolSettings]);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a template name');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name,
        baseTemplateId,
        category: selectedBaseTemplate?.category || 'student-id-card',
        configuration: {
          primaryColor,
          secondaryColor,
          fontFamily,
          showQRCode,
          showPhoto,
          showSignature,
        },
      };

      if (editingTemplate && editingTemplate._id) {
        await updateCustomTemplate(editingTemplate._id, payload);
      } else {
        await createCustomTemplate(payload);
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 text-violet-400 border border-violet-500/30 flex items-center justify-center">
              <Palette size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {editingTemplate ? 'Edit Custom Template' : 'Visual Template Studio'}
              </h2>
              <p className="text-xs text-slate-400">Customize styling and components with live preview</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content: 2-column layout (Controls on Left, Live Preview on Right) */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Controls Form */}
          <div className="w-full lg:w-96 border-r border-slate-800 p-6 overflow-y-auto space-y-5 bg-slate-900/50">
            {/* Template Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Custom Template Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Modern Navy 2026"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                required
              />
            </div>

            {/* Base Template */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Base Template Layout</label>
              <select
                value={baseTemplateId}
                onChange={(e) => setBaseTemplateId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
              >
                {ALL_TEMPLATES.map((t) => (
                  <option key={t.id} value={t.id}>
                    [{t.category}] {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Colors */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Sliders size={14} className="text-violet-400" />
                Color Theme
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Primary Color</label>
                  <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-7 h-7 rounded-lg border-0 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-16 bg-transparent text-[11px] font-mono text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Secondary Accent</label>
                  <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-7 h-7 rounded-lg border-0 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-16 bg-transparent text-[11px] font-mono text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Typography */}
            <div className="pt-2 border-t border-slate-800">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Typography Family</label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
              >
                <option value="Inter">Inter (Clean Modern Sans)</option>
                <option value="'Cinzel', serif">Cinzel (Royal & Formal)</option>
                <option value="'Georgia', serif">Georgia (Classic Academic)</option>
                <option value="'Playfair Display', serif">Playfair Display (Editorial)</option>
                <option value="system-ui">System UI</option>
              </select>
            </div>

            {/* Component Toggles */}
            <div className="space-y-2.5 pt-2 border-t border-slate-800">
              <span className="text-xs font-semibold text-slate-300">Elements & Badges</span>

              <label className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80 cursor-pointer hover:bg-slate-950 transition">
                <span className="text-xs text-slate-300">Verification QR Code</span>
                <input
                  type="checkbox"
                  checked={showQRCode}
                  onChange={(e) => setShowQRCode(e.target.checked)}
                  className="w-4 h-4 rounded text-violet-600 bg-slate-900 border-slate-700 focus:ring-0 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80 cursor-pointer hover:bg-slate-950 transition">
                <span className="text-xs text-slate-300">Photo / Avatar Section</span>
                <input
                  type="checkbox"
                  checked={showPhoto}
                  onChange={(e) => setShowPhoto(e.target.checked)}
                  className="w-4 h-4 rounded text-violet-600 bg-slate-900 border-slate-700 focus:ring-0 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80 cursor-pointer hover:bg-slate-950 transition">
                <span className="text-xs text-slate-300">Principal Signature Line</span>
                <input
                  type="checkbox"
                  checked={showSignature}
                  onChange={(e) => setShowSignature(e.target.checked)}
                  className="w-4 h-4 rounded text-violet-600 bg-slate-900 border-slate-700 focus:ring-0 cursor-pointer"
                />
              </label>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg hover:shadow-violet-500/20 transition cursor-pointer disabled:opacity-50"
              >
                <Save size={15} />
                <span>{saving ? 'Saving...' : 'Save Custom Template'}</span>
              </button>
            </div>
          </div>

          {/* Real-time Preview Area */}
          <div className="flex-1 bg-slate-950/80 p-6 flex flex-col justify-between overflow-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 mb-4">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Eye size={14} className="text-violet-400" />
                <span>Real-time Studio Preview</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">Live Render</span>
            </div>

            <div className="flex-1 flex items-center justify-center p-4">
              <div
                style={{
                  transform: selectedBaseTemplate?.category === 'certificate' ? 'scale(0.55)' : 'scale(1)',
                  transformOrigin: 'center center',
                  transition: 'all 0.15s ease',
                }}
                className="shadow-2xl rounded-xl overflow-hidden"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </div>

            <div className="text-[11px] text-slate-500 text-center pt-3 border-t border-slate-800/60">
              Note: Base built-in templates remain untouched. A new reusable template definition is registered.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
