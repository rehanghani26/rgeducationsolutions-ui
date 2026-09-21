/**
 * @file VerifyModule.jsx
 * @description In-app Certificate Verification portal.
 * Allows entering a cryptographic token or certificate number to inspect validity,
 * revocation status, and view the public credential verification badge.
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Copy,
  Check,
  Calendar,
  Award,
  Loader2,
} from 'lucide-react';
import { verifyCertificate } from '../services/documentService.js';
import { getVerificationUrl } from '../utils/qrUtils.js';

export default function VerifyModule() {
  const [tokenInput, setTokenInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await verifyCertificate(tokenInput.trim());
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Certificate verification failed or record not found.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = (token) => {
    const url = getVerificationUrl(token);
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Verification Card Header */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 text-center shadow-xl backdrop-blur-sm">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/10">
          <ShieldCheck size={28} />
        </div>
        <h3 className="text-lg font-bold text-white">Cryptographic Certificate Verification</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
          Validate institutional certificates, check active validity, and verify revocation status
          against tamper-proof audit records.
        </p>

        {/* Input Form */}
        <form onSubmit={handleVerify} className="mt-6 flex gap-2 max-w-xl mx-auto">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Paste verification token or certificate token..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs font-bold rounded-xl shadow-lg hover:shadow-emerald-500/20 transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <ShieldCheck size={15} />}
            <span>Verify</span>
          </button>
        </form>
      </div>

      {/* Error / Not Found Message */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-5 flex items-center gap-3 text-rose-300 text-xs animate-fadeIn">
          <XCircle size={20} className="text-rose-400 flex-shrink-0" />
          <div>
            <div className="font-bold">Invalid or Unrecognized Token</div>
            <div>{error}</div>
          </div>
        </div>
      )}

      {/* Verification Result Card */}
      {result && result.certificate && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6 animate-fadeIn">
          {/* Validity Badge */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
            <div>
              <div className="text-xs text-slate-400">Institutional Credential</div>
              <div className="text-xl font-extrabold text-white mt-0.5 font-mono">
                {result.certificate.certificateNumber}
              </div>
            </div>

            {result.certificate.status === 'VALID' ? (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                <CheckCircle2 size={18} />
                <span className="text-xs font-extrabold tracking-wider">OFFICIALLY VALID</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400">
                <XCircle size={18} />
                <span className="text-xs font-extrabold tracking-wider">REVOKED CREDENTIAL</span>
              </div>
            )}
          </div>

          {/* Revocation Alert if Revoked */}
          {result.certificate.status === 'REVOKED' && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl space-y-1 text-xs">
              <div className="font-bold text-rose-300 flex items-center gap-1.5">
                <AlertTriangle size={15} />
                This certificate was revoked by the institution.
              </div>
              {result.certificate.revocationReason && (
                <div className="text-rose-200">
                  <strong>Reason:</strong> {result.certificate.revocationReason}
                </div>
              )}
              {result.certificate.revokedAt && (
                <div className="text-slate-400 text-[11px]">
                  Revoked on {new Date(result.certificate.revokedAt).toLocaleString()}
                </div>
              )}
            </div>
          )}

          {/* Safe Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
              <div className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider">
                Recipient Name
              </div>
              <div className="text-white font-bold text-sm mt-1">
                {result.certificate.recipientName}
              </div>
            </div>

            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
              <div className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider">
                Certificate Type
              </div>
              <div className="text-amber-400 font-bold text-sm mt-1">
                {result.certificate.certificateType}
              </div>
            </div>

            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
              <div className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider">
                Academic Session
              </div>
              <div className="text-white font-medium text-xs mt-1">
                {result.certificate.academicSession || '—'}
              </div>
            </div>

            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
              <div className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider">
                Date Issued
              </div>
              <div className="text-white font-medium text-xs mt-1">
                {new Date(result.certificate.issuedAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </div>
            </div>
          </div>

          {/* Public Verification Link */}
          <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="text-[11px] text-slate-400">
              Shareable link for external public verification:
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleCopyLink(result.certificate.verificationToken)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition cursor-pointer"
              >
                {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>

              <a
                href={getVerificationUrl(result.certificate.verificationToken)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 rounded-lg transition"
              >
                <ExternalLink size={13} />
                <span>Open Public Page</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
