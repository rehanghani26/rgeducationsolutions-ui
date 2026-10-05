/**
 * @file IdCardPreview.jsx
 * @description Interactive live preview component for an ID card template.
 * Provides real-time rendering, zoom controls, and instant printing.
 */

import React, { useState } from 'react';
import { Printer, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { renderTemplate, prepareTemplateData } from '../utils/templateRenderer.js';
import { printDocument } from '../utils/printUtils.js';
import { COLOR, bg, border, shadow, text, button, badge } from '@/theme/color';

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
      <div className={`p-8 text-center ${text.muted} ${bg.surface} rounded-xl border ${border.default}`}>
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
    <div className={`flex flex-col h-full ${bg.card} rounded-2xl border ${border.default} overflow-hidden ${shadow.lg} backdrop-blur-sm`}>
      {/* Action Bar */}
      <div className={`flex items-center justify-between px-4 py-3 ${bg.surface} border-b ${border.default}`}>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold ${text.secondary} uppercase tracking-wider`}>{title}</span>
          <span className={`text-[10px] ${badge.primary} px-2 py-0.5`}>
            {template.name}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.6, z - 0.1))}
            className={`p-1.5 ${button.ghost}`}
            title="Zoom Out"
          >
            <ZoomOut size={16} />
          </button>
          <span className={`text-[11px] font-mono ${text.muted} min-w-[40px] text-center`}>
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(1.6, z + 0.1))}
            className={`p-1.5 ${button.ghost}`}
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>
          <button
            type="button"
            onClick={() => setZoom(1)}
            className={`p-1.5 ${button.ghost} mr-1`}
            title="Reset Zoom"
          >
            <RotateCcw size={15} />
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className={`flex items-center gap-1.5 px-3 py-1.5 ${button.primary} text-xs`}
          >
            <Printer size={14} />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Preview Viewport */}
      <div className={`flex-1 p-6 overflow-auto flex items-center justify-center ${bg.page}`}>
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
            transition: 'transform 0.15s ease-out',
          }}
          className={`${shadow.xl} rounded-xl overflow-hidden`}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>

      <div className={`px-4 py-2 ${bg.surface} border-t ${border.default} text-[11px] ${text.muted} flex justify-between items-center`}>
        <span>Standard CR-80 Dimension (85.6mm × 54mm)</span>
        <span className="text-emerald-500 dark:text-emerald-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Runtime Rendered
        </span>
      </div>
    </div>
  );
}
