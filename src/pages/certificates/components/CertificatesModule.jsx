/**
 * @file CertificatesModule.jsx
 * @description Official Certificate Management & Registry Module.
 * Displays issued records, filter by type/status, revoke with reason,
 * issue modal trigger, and real-time live preview & printing.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Award,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  Printer,
  Ban,
  ExternalLink,
  ShieldCheck,
  Calendar,
  User,
  Loader2,
  X,
} from 'lucide-react';
import IssueModal from './IssueModal.jsx';
import CertificatePreview from './CertificatePreview.jsx';
import { getIssuedCertificates, revokeCertificate } from '../services/documentService.js';
import { getTemplateById } from '../templates/registry.js';
import { CERTIFICATE_TYPES } from '../constants/documentConstants.js';
import { getVerificationUrl } from '../utils/qrUtils.js';

export default function CertificatesModule({ schoolSettings = {}, userRole = '' }) {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modals & Preview State
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [activePreviewCert, setActivePreviewCert] = useState(null);
  const [revokingCert, setRevokingCert] = useState(null);
  const [revocationReason, setRevocationReason] = useState('');
  const [submittingRevocation, setSubmittingRevocation] = useState(false);

  const canIssue = ['super-admin', 'school-admin', 'principal', 'director'].includes(userRole);

  useEffect(() => {
    loadCertificates();
  }, [selectedType, selectedStatus]);

  const loadCertificates = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedType !== 'ALL') params.certificateType = selectedType;
      if (selectedStatus !== 'ALL') params.status = selectedStatus;
      const res = await getIssuedCertificates(params);
      const list = res?.certificates || res?.data?.certificates || [];
      setCertificates(list);
      if (list.length > 0 && !activePreviewCert) {
        setActivePreviewCert(list[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeConfirm = async (e) => {
    e.preventDefault();
    if (!revokingCert) return;

    setSubmittingRevocation(true);
    try {
      await revokeCertificate(revokingCert._id, revocationReason);
      setRevokingCert(null);
      setRevocationReason('');
      loadCertificates();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingRevocation(false);
    }
  };

  const filteredCertificates = useMemo(() => {
    return certificates.filter((c) => {
      const q = searchQuery.toLowerCase();
      const num = (c.certificateNumber || '').toLowerCase();
      const name = (c.recipientNameSnapshot || '').toLowerCase();
      const recId = (c.recipientIdSnapshot || '').toLowerCase();
      return num.includes(q) || name.includes(q) || recId.includes(q);
    });
  }, [certificates, searchQuery]);

  // Count stats
  const stats = useMemo(() => {
    const total = certificates.length;
    const valid = certificates.filter((c) => c.status === 'VALID').length;
    const revoked = certificates.filter((c) => c.status === 'REVOKED').length;
    return { total, valid, revoked };
  }, [certificates]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="sm:col-span-1 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
              Total Issued
            </div>
            <div className="text-2xl font-bold text-white mt-1">{stats.total}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
            <Award size={20} />
          </div>
        </div>

        <div className="sm:col-span-1 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-emerald-400 font-semibold uppercase tracking-wider">
              Active Valid
            </div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{stats.valid}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className="sm:col-span-1 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-rose-400 font-semibold uppercase tracking-wider">
              Revoked
            </div>
            <div className="text-2xl font-bold text-rose-400 mt-1">{stats.revoked}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
            <XCircle size={20} />
          </div>
        </div>

        <div className="sm:col-span-1 bg-slate-900/60 p-3 rounded-2xl border border-slate-800 flex items-center justify-center">
          {canIssue ? (
            <button
              type="button"
              onClick={() => setIsIssueModalOpen(true)}
              className="w-full h-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold rounded-xl shadow-lg hover:shadow-amber-500/20 transition cursor-pointer"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Issue New Certificate</span>
            </button>
          ) : (
            <div className="text-xs text-slate-500 text-center">
              Student / Read-Only View
            </div>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        <div className="flex-1 w-full relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Certificate #, Student Name, or Admission ID..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">All Types</option>
            {Object.entries(CERTIFICATE_TYPES).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="VALID">Valid</option>
            <option value="REVOKED">Revoked</option>
          </select>
        </div>
      </div>

      {/* Table & Live Preview Split (or Table view) */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Certificate Number</th>
                <th className="px-4 py-3">Recipient Details</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Academic Session</th>
                <th className="px-4 py-3">Date Issued</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 size={16} className="animate-spin text-amber-400" />
                      Loading certificate registry...
                    </div>
                  </td>
                </tr>
              ) : filteredCertificates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No certificate records found. Click "Issue New Certificate" to create one.
                  </td>
                </tr>
              ) : (
                filteredCertificates.map((cert) => {
                  const isValid = cert.status === 'VALID';
                  return (
                    <tr
                      key={cert._id}
                      className="hover:bg-slate-800/40 transition group cursor-pointer"
                      onClick={() => setActivePreviewCert(cert)}
                    >
                      <td className="px-4 py-3 font-mono font-bold text-amber-400">
                        {cert.certificateNumber}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-white">
                          {cert.recipientNameSnapshot}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {cert.recipientIdSnapshot}
                          {cert.additionalSnapshot?.class ? ` • ${cert.additionalSnapshot.class}` : ''}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full text-[10px] font-medium border border-slate-700">
                          {cert.certificateType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        {cert.academicSession || '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        {new Date(cert.issuedAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3">
                        {isValid ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            VALID
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                            REVOKED
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div
                          className="flex items-center justify-end gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Preview / Print */}
                          <button
                            type="button"
                            onClick={() => setActivePreviewCert(cert)}
                            className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition"
                            title="Preview & Print"
                          >
                            <Eye size={15} />
                          </button>

                          {/* Public Verify URL */}
                          {cert.verificationToken && (
                            <a
                              href={getVerificationUrl(cert.verificationToken)}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded-lg transition"
                              title="Public Verification Link"
                            >
                              <ExternalLink size={15} />
                            </a>
                          )}

                          {/* Revoke (admin only) */}
                          {canIssue && isValid && (
                            <button
                              type="button"
                              onClick={() => setRevokingCert(cert)}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                              title="Revoke Certificate"
                            >
                              <Ban size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Preview Drawer / Modal */}
      {activePreviewCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl h-[88vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center gap-2 text-xs font-semibold text-white">
                <ShieldCheck size={16} className="text-amber-400" />
                <span>Certificate Live Render — {activePreviewCert.certificateNumber}</span>
              </div>
              <button
                type="button"
                onClick={() => setActivePreviewCert(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-hidden p-4">
              <CertificatePreview
                template={getTemplateById(activePreviewCert.templateId || 'certificate-classic')}
                certificateData={activePreviewCert}
                schoolSettings={schoolSettings}
                title={activePreviewCert.certificateNumber}
              />
            </div>
          </div>
        </div>
      )}

      {/* Revocation Reason Prompt Modal */}
      {revokingCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <Ban size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Revoke Certificate</h3>
                <p className="text-xs text-slate-400 font-mono">
                  {revokingCert.certificateNumber}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              Are you sure you want to revoke this certificate for{' '}
              <strong className="text-white">{revokingCert.recipientNameSnapshot}</strong>? Once revoked, the
              public verification page will immediately show <strong>REVOKED</strong>. This action cannot be undone.
            </p>

            <form onSubmit={handleRevokeConfirm} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Revocation Reason (Audit Log)
                </label>
                <input
                  type="text"
                  value={revocationReason}
                  onChange={(e) => setRevocationReason(e.target.value)}
                  placeholder="e.g. Disciplinary action / Error in issuance / Expired"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRevokingCert(null)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRevocation}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg transition cursor-pointer disabled:opacity-50"
                >
                  {submittingRevocation ? 'Revoking...' : 'Confirm Revocation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Issue Modal */}
      <IssueModal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        onSuccess={loadCertificates}
      />
    </div>
  );
}
