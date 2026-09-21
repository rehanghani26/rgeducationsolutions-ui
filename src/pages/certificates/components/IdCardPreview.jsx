/**
 * @file IdCardPreview.jsx
 * @description Interactive live preview component for an ID card template.
 * Provides real-time rendering, zoom controls, and instant printing.
 */

import React, { useState } from 'react';
import { Printer, ZoomIn, ZoomOut, RotateCcw, Download } from 'lucide-react';
import { renderTemplate, prepareTemplateData } from '../utils/templateRenderer.js';
import { printDocument } from '../utils/printUtils.js';

export default function IdCardPreview({
  template,
  recipient,
  recipientType = 'student',
  schoolSettings = {},
  customConfig = null,
  title = 'ID Card Preview',
}) {
  const [zoom, setZoom] = useState(1);

  if (!template) {
    return (
      <div className="p-8 text-center text-slate-400 bg-slate-900/30 rounded-xl border border-slate-800">
        No template selected
      </div>
    );
  }

  // Build full merged data
  const data = prepareTemplateData(recipient, recipientType, schoolSettings);
  const html = renderTemplate(template, data, customConfig);

  const handlePrint = () => {
    printDocument(html, {
      orientation: template.orientation || 'portrait',
      title: `${data.name || 'Student'}_ID_Card`,
      pageSize: 'card',
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/60 rounded-2xl border border-slate-800/80 overflow-hidden shadow-xl backdrop-blur-sm">
      {/* Action Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800/60 border-b border-slate-700/60">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">{title}</span>
          <span className="text-[10px] bg-sky-500/20 text-sky-400 font-medium px-2 py-0.5 rounded-full border border-sky-500/30">
            {template.name}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.6, z - 0.1))}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition"
            title="Zoom Out"
          >
            <ZoomOut size={16} />
          </button>
          <span className="text-[11px] font-mono text-slate-400 min-w-[40px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(1.6, z + 0.1))}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition"
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>
          <button
            type="button"
            onClick={() => setZoom(1)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition mr-1"
            title="Reset Zoom"
          >
            <RotateCcw size={15} />
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-semibold rounded-lg shadow-md hover:shadow-sky-500/20 transition cursor-pointer"
          >
            <Printer size={14} />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Preview Viewport */}
      <div className="flex-1 p-6 overflow-auto flex items-center justify-center bg-slate-950/40">
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
            transition: 'transform 0.15s ease-out',
          }}
          className="shadow-2xl rounded-xl overflow-hidden"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>

      <div className="px-4 py-2 bg-slate-900/80 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between items-center">
        <span>Standard CR-80 Dimension (85.6mm × 54mm)</span>
        <span className="text-emerald-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          Runtime Rendered
        </span>
      </div>
    </div>
  );
}
