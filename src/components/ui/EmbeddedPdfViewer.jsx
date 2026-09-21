import { useState, useMemo } from 'react';
import {
  FileText,
  ExternalLink,
  Download,
  Maximize2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Eye,
} from 'lucide-react';
import PdfViewerModal, { resolvePdfUrl, getGoogleDocsViewerUrl } from './PdfViewerModal.jsx';

/**
 * EmbeddedPdfViewer — On-page embedded PDF viewer card with dual engine fallback & full-screen modal trigger.
 */
export default function EmbeddedPdfViewer({
  url = '',
  title = 'Aadhaar Identity Document (PDF)',
  subtitle = '',
  refId = '',
  className = '',
  height = '520px',
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [viewerMode, setViewerMode] = useState('native'); // 'native' | 'gdocs'
  const [loadError, setLoadError] = useState(false);

  const safeUrl = useMemo(() => resolvePdfUrl(url), [url]);
  const gdocsUrl = useMemo(() => getGoogleDocsViewerUrl(url), [url]);

  const currentSrc = useMemo(() => {
    if (viewerMode === 'gdocs') {
      return gdocsUrl;
    }
    return safeUrl.includes('#') ? safeUrl : `${safeUrl}#toolbar=1&navpanes=1`;
  }, [viewerMode, gdocsUrl, safeUrl]);

  if (!url) {
    return (
      <div className={`p-8 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-center space-y-2 ${className}`}>
        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-2">
          <FileText size={24} />
        </div>
        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">No PDF Document Attached</p>
        <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
          An Aadhaar PDF document has not been uploaded for this student yet.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm flex flex-col ${className}`}>
        {/* ── Card Header Toolbar ───────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500 dark:text-rose-400 flex-shrink-0">
              <FileText size={18} />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{title}</h4>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                {subtitle && <span>{subtitle}</span>}
                {refId && (
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    ID: {refId}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Engine Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[11px]">
              <button
                type="button"
                onClick={() => {
                  setViewerMode('native');
                  setLoadError(false);
                }}
                className={`px-2 py-0.5 rounded-md font-bold transition ${
                  viewerMode === 'native'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Browser
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewerMode('gdocs');
                  setLoadError(false);
                }}
                className={`px-2 py-0.5 rounded-md font-bold transition ${
                  viewerMode === 'gdocs'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Google Docs Viewer fallback"
              >
                Docs Viewer
              </button>
            </div>

            {/* Expand Modal */}
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="p-1.5 rounded-lg hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
              title="Full Screen Viewer"
            >
              <Maximize2 size={14} />
            </button>

            {/* Download */}
            <a
              href={safeUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition inline-flex items-center"
              title="Download PDF"
            >
              <Download size={14} />
            </a>

            {/* Open Tab */}
            <a
              href={safeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold transition inline-flex items-center gap-1 shadow-xs"
            >
              <span>New Tab</span>
              <ExternalLink size={11} />
            </a>
          </div>
        </div>

        {/* ── Embedded Viewer Frame ──────────────────────────────────────── */}
        <div style={{ height }} className="w-full relative bg-slate-100 dark:bg-slate-950 overflow-hidden">
          {loadError ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-3">
              <AlertCircle size={28} className="text-amber-500" />
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Preview not rendered in current mode
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5 max-w-sm">
                  Switch to Google Docs Viewer engine or open in a full-screen window.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setViewerMode('gdocs');
                    setLoadError(false);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold"
                >
                  Use Docs Viewer
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold"
                >
                  Open Full Screen
                </button>
              </div>
            </div>
          ) : (
            <iframe
              key={currentSrc}
              src={currentSrc}
              title={title}
              className="w-full h-full border-0"
              onError={() => setLoadError(true)}
            />
          )}
        </div>

        {/* ── Card Footer ──────────────────────────────────────────────── */}
        <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={12} className="text-emerald-500" />
            <span>Interactive PDF viewer active</span>
          </span>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Expand to Full View ↗
          </button>
        </div>
      </div>

      {/* Full Screen Modal */}
      <PdfViewerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        url={url}
        title={title}
        subtitle={subtitle}
        refId={refId}
      />
    </>
  );
}
