/**
 * @file VerifyCertificatePage.jsx
 * @description Public, unauthenticated verification landing page.
 * When anyone scans the QR code on a physical certificate or opens the verification link,
 * this page displays official institutional verification without exposing sensitive personal info.
 */

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Award,
  Calendar,
  Building2,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { verifyCertificate } from './services/documentService.js';

export default function VerifyCertificatePage() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function doVerify() {
      if (!token) {
        setError('No verification token provided');
        setLoading(false);
        return;
      }

      try {
        const res = await verifyCertificate(token);
        setData(res);
      } catch (err) {
        setError(err.response?.data?.message || 'Certificate not found or verification failed');
      } finally {
        setLoading(false);
      }
    }

    doVerify();
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex flex-col justify-between py-10 px-4 sm:px-6">
      <div className="max-w-xl mx-auto w-full">
        {/* Top Institutional Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500/20 to-indigo-500/20 border border-sky-500/30 mb-3 shadow-xl shadow-sky-500/10">
            <ShieldCheck size={32} className="text-sky-400" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Institutional Verification
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Official Credential Authentication System
          </p>
        </div>

        {/* Status Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {loading ? (
            <div className="py-12 text-center space-y-3">
              <Loader2 size={32} className="animate-spin text-sky-400 mx-auto" />
              <p className="text-xs text-slate-400 font-medium">Validating cryptographic token...</p>
            </div>
          ) : error ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-2xl flex items-center justify-center mx-auto">
                <XCircle size={30} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Unverified Document</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">{error}</p>
              </div>
              <div className="p-3.5 bg-rose-500/10 rounded-xl border border-rose-500/20 text-[11px] text-rose-300">
                This certificate token could not be verified in the institution's official database.
                It may be counterfeit or expired.
              </div>
            </div>
          ) : data && data.certificate ? (
            <div className="space-y-6">
              {/* Status Header */}
              {data.certificate.status === 'VALID' ? (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 size={26} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">
                      Status Verified
                    </span>
                    <h3 className="text-sm font-extrabold text-white">
                      Officially Valid & Recognized
                    </h3>
                  </div>
                </div>
              ) : (
                <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle size={26} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold tracking-widest text-rose-400 uppercase">
                      Notice: Revoked
                    </span>
                    <h3 className="text-sm font-extrabold text-white">
                      This Credential Has Been Revoked
                    </h3>
                  </div>
                </div>
              )}

              {/* Revocation notice details if revoked */}
              {data.certificate.status === 'REVOKED' && (
                <div className="p-3.5 bg-rose-950/40 border border-rose-800/60 rounded-xl text-xs text-rose-200">
                  <p>
                    <strong>Reason for Revocation:</strong>{' '}
                    {data.certificate.revocationReason || 'Administrative revocation.'}
                  </p>
                  {data.certificate.revokedAt && (
                    <p className="text-[10px] text-slate-400 mt-1">
                      Revoked date:{' '}
                      {new Date(data.certificate.revokedAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  )}
                </div>
              )}

              {/* Safe Credential Summary */}
              <div className="divide-y divide-slate-800 text-xs">
                <div className="py-3 flex justify-between items-center">
                  <span className="text-slate-400">Certificate Number</span>
                  <span className="font-mono font-bold text-amber-400 text-sm">
                    {data.certificate.certificateNumber}
                  </span>
                </div>

                <div className="py-3 flex justify-between items-center">
                  <span className="text-slate-400">Recipient Name</span>
                  <span className="font-bold text-white text-sm">
                    {data.certificate.recipientName}
                  </span>
                </div>

                <div className="py-3 flex justify-between items-center">
                  <span className="text-slate-400">Credential Type</span>
                  <span className="bg-slate-800 text-slate-200 px-2.5 py-0.5 rounded-full font-medium border border-slate-700">
                    {data.certificate.certificateType}
                  </span>
                </div>

                <div className="py-3 flex justify-between items-center">
                  <span className="text-slate-400">Academic Session</span>
                  <span className="text-slate-200 font-medium">
                    {data.certificate.academicSession || '—'}
                  </span>
                </div>

                <div className="py-3 flex justify-between items-center">
                  <span className="text-slate-400">Date of Issue</span>
                  <span className="text-slate-200 font-medium">
                    {new Date(data.certificate.issuedAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              {/* Institutional Note */}
              <div className="text-center pt-4 border-t border-slate-800 text-[11px] text-slate-500">
                This verification check was performed in real-time against the institution's official
                audit registry. No personally sensitive contact information is disclosed on public verification.
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-8 text-xs text-slate-600">
        &copy; {new Date().getFullYear()} RGES School ERP &bull; Secure Institutional Verification
      </div>
    </div>
  );
}
