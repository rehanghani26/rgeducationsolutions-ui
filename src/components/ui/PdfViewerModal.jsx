import { useState, useMemo } from 'react';
import {
  X,
  ExternalLink,
  Download,
  Printer,
  Maximize2,
  FileText,
  RefreshCw,
  AlertCircle,
  Eye,
  CheckCircle2,
} from 'lucide-react';

/**
 * Normalizes a PDF URL so it renders cleanly in iframes:
 * 1. Handles objects like { id, pdf } or strings.
 * 2. Upgrades http to https for Cloudinary to avoid mixed content block.
 * 3. If Cloudinary: injects `fl_inline` so Cloudinary doesn't force `attachment` download.
 * 4. If relative `/uploads/...`: prefixes backend origin (http://localhost:5000).
 */
export function resolvePdfUrl(url) {
  if (!url) return '';
  if (typeof url === 'object') {
    url = url.pdf || url.url || url.secure_url || '';
  }
  let str = String(url).trim();
  if (!str) return '';

  // Upgrade insecure http to https for Cloudinary
  if (str.startsWith('http://res.cloudinary.com')) {
    str = str.replace('http://res.cloudinary.com', 'https://res.cloudinary.com');
  }

  // Relative backend upload path
  if (str.startsWith('/uploads/')) {
    const backendOrigin =
      typeof window !== 'undefined' && window.location.hostname === 'localhost'
        ? 'http://localhost:5000'
        : '';
    str = `${backendOrigin}${str}`;
  }

  // Cloudinary URL: inject `fl_inline` if not already present
  if (str.includes('res.cloudinary.com') && str.includes('/upload/')) {
    if (!str.includes('fl_inline') && !str.includes('fl_attachment')) {
      str = str.replace('/upload/', '/upload/fl_inline/');
    }
  }

  return str;
}

/**
 * Returns Google Docs Viewer URL as an infallible fallback for embedded iframes.
 */
export function getGoogleDocsViewerUrl(url) {
  const resolved = resolvePdfUrl(url);
  if (!resolved) return '';
  // Google Docs viewer requires a publicly accessible http(s) URL
  if (!resolved.startsWith('http')) return resolved;
  return `https://docs.google.com/viewer?url=${encodeURIComponent(resolved)}&embedded=true`;
}

/**
 * PdfViewerModal — Full-screen or modal PDF viewer supporting:
 * - Native Browser Iframe / Object
 * - Google Docs Viewer fallback
 * - New Tab opening
 * - Direct download
 */
export default function PdfViewerModal({
  open = false,
  onClose = () => {},
  url = '',
  title = 'Document PDF Viewer',
  subtitle = '',
  refId = '',
}) {
  const [viewerMode, setViewerMode] = useState('native'); // 'native' | 'gdocs'
  const [loadError, setLoadError] = useState(false);

  const safeUrl = useMemo(() => resolvePdfUrl(url), [url]);
  const gdocsUrl = useMemo(() => getGoogleDocsViewerUrl(url), [url]);

  const currentIframeSrc = useMemo(() => {
    if (viewerMode === 'gdocs') {
      return gdocsUrl;
    }
    return safeUrl.includes('#') ? safeUrl : `${safeUrl}#toolbar=1&navpanes=1`;
  }, [viewerMode, gdocsUrl, safeUrl]);

  if (!open || !url) return null;

  const handlePrint = () => {
    const printWindow = window.open(safeUrl, '_blank');
    if (printWindow) {
      printWindow.focus();
      setTimeout(() => {
        try {
          printWindow.print();
        } catch {
          // ignore
        }
      }, 1000);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl h-[92vh] max-h-[92vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-white"
      >
        {/* ── Top Header Toolbar ────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex-shrink-0">
              <FileText size={20} />
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-sm text-white truncate">{title}</h3>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                {subtitle && <span className="text-slate-300">{subtitle}</span>}
                {refId && (
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                    Ref: {refId}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Viewer Mode & Actions */}
          <div className="flex items-center gap-2">
            {/* Viewer Mode Switcher */}
            <div className="flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => {
                  setViewerMode('native');
                  setLoadError(false);
                }}
                className={`px-2.5 py-1 rounded-md font-bold transition ${
                  viewerMode === 'native'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Browser PDF
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewerMode('gdocs');
                  setLoadError(false);
                }}
                className={`px-2.5 py-1 rounded-md font-bold transition ${
                  viewerMode === 'gdocs'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Google Docs embedded viewer fallback"
              >
                Docs Viewer
              </button>
            </div>

            {/* Print */}
            <button
              type="button"
              onClick={handlePrint}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              title="Print Document"
            >
              <Printer size={15} />
            </button>

            {/* Direct Download */}
            <a
              href={safeUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition inline-flex items-center"
              title="Download PDF File"
            >
              <Download size={15} />
            </a>

            {/* Open in new browser tab */}
            <a
              href={safeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition inline-flex items-center gap-1.5 shadow-sm"
            >
              <span>New Tab</span>
              <ExternalLink size={13} />
            </a>

            {/* Close modal */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition ml-1"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Main Iframe Container ─────────────────────────────────────── */}
        <div className="flex-1 w-full h-full bg-slate-950 relative overflow-hidden">
          {loadError ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <AlertCircle size={32} />
              </div>
              <div>
                <p className="font-bold text-sm text-white">Browser Blocked Direct PDF Embedding</p>
                <p className="text-xs text-slate-400 mt-1 max-w-md">
                  Some browser security settings or extensions block direct iframe rendering. Switch to Google Docs Viewer mode or open in a new tab.
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setViewerMode('gdocs');
                    setLoadError(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5"
                >
                  <RefreshCw size={13} />
                  <span>Switch to Google Docs Viewer</span>
                </button>
                <a
                  href={safeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition flex items-center gap-1.5"
                >
                  <ExternalLink size={13} />
                  <span>Open in Dedicated Tab</span>
                </a>
              </div>
            </div>
          ) : (
            <iframe
              key={currentIframeSrc}
              src={currentIframeSrc}
              title={title}
              className="w-full h-full border-0 bg-slate-900"
              onError={() => setLoadError(true)}
            />
          )}
        </div>

        {/* ── Bottom Status Bar ─────────────────────────────────────────── */}
        <div className="px-5 py-2.5 border-t border-slate-800/80 bg-slate-950/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-300">
              Viewing via {viewerMode === 'gdocs' ? 'Google Docs Viewer Engine' : 'Native Browser PDF Plugin'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setViewerMode(viewerMode === 'native' ? 'gdocs' : 'native');
                setLoadError(false);
              }}
              className="text-indigo-400 hover:underline font-bold"
            >
              Not loading? Switch to {viewerMode === 'native' ? 'Google Docs Viewer' : 'Native Viewer'}
            </button>
            <span className="text-slate-600">•</span>
            <a
              href={safeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-300 hover:text-white font-semibold"
            >
              Open Full Screen ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
