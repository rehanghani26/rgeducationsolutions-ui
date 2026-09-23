/**
 * @file CertificatePreview.jsx
 * @description Interactive live preview component for Certificates.
 * Provides scaled-down responsive viewport, zoom controls, and instant A4 printing.
 */

import React, { useState } from 'react';
import { Printer, ZoomIn, ZoomOut, RotateCcw, ShieldCheck, ExternalLink } from 'lucide-react';
import { renderTemplate, prepareTemplateData } from '../utils/templateRenderer.js';
import { printDocument, openDocumentInNewTab } from '../utils/printUtils.js';

export default function CertificatePreview({
  template,
  certificateData = {},
  schoolSettings = {},
  customConfig = null,
  title = 'Certificate Preview',
}) {
  // Default scale is 0.55 to fit a 280mm A4 landscape into normal viewport
  const [zoom, setZoom] = useState(0.55);

  if (!template) {
    return (
      <div className="p-8 text-center text-slate-400 bg-slate-900/30 rounded-xl border border-slate-800">
        No certificate template selected
      </div>
    );
  }

  const data = prepareTemplateData(
    certificateData,
    certificateData.recipientType || 'student',
    schoolSettings,
    certificateData
  );

  const html = renderTemplate(template, data, customConfig);

  const handlePrint = () => {
    printDocument(html, {
      orientation: template.orientation || 'landscape',
      title: `${data.name || 'Student'}_${data.certificateType || 'Certificate'}`,
      pageSize: 'a4',
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/60 rounded-2xl border border-slate-800/80 overflow-hidden shadow-xl backdrop-blur-sm">
      {/* Action Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800/60 border-b border-slate-700/60">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-amber-400" />
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">{title}</span>
          <span className="text-[10px] bg-amber-500/20 text-amber-300 font-medium px-2 py-0.5 rounded-full border border-amber-500/30">
            {template.name} ({template.orientation})
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.3, z - 0.05))}
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
            onClick={() => setZoom((z) => Math.min(1.2, z + 0.05))}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition"
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>
          <button
            type="button"
            onClick={() => setZoom(0.55)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition mr-1"
            title="Fit to Screen"
          >
            <RotateCcw size={15} />
          </button>

          <button
            type="button"
            onClick={() => {
              openDocumentInNewTab(html, {
                orientation: template.orientation || 'landscape',
                title: `${data.name || 'Student'}_${data.certificateType || 'Certificate'}`,
                pageSize: 'a4',
              });
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition cursor-pointer"
            title="Open standalone document in new browser tab"
          >
            <ExternalLink size={13} />
            <span>New Tab</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold rounded-lg shadow-md hover:shadow-amber-500/20 transition cursor-pointer"
          >
            <Printer size={14} />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Scaled Preview Viewport */}
      <div className="flex-1 p-6 overflow-auto flex items-center justify-center bg-slate-950/60 min-h-[380px]">
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
            transition: 'transform 0.15s ease-out',
            flexShrink: 0,
          }}
          className="shadow-2xl rounded-sm overflow-hidden"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2 bg-slate-900/80 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between items-center">
        <span>Standard ISO 216 A4 Landscape (297mm × 210mm)</span>
        <span className="text-amber-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          Verification QR Enabled
        </span>
      </div>
    </div>
  );
}
