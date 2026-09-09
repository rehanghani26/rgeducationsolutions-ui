import React from 'react';
import { motion } from 'framer-motion';
import { Award, FileCheck, Download, Printer, Plus } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import { mockCertificates } from '../../data/mockData.js';

const CertificatesManagement = () => {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-12">
      <PageHeader
        title="Certificates & Official Documentation"
        subtitle="Generate Bonafide, Transfer Certificates (TC), and Hifz Completion Sanad documents"
        breadcrumbs={[{ label: 'Administration' }, { label: 'Certificates' }]}
        actions={<Button icon={<Plus size={16} />}>Generate Certificate</Button>}
      />

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">Issued Certificates Records</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 font-bold text-xs uppercase border-b border-slate-200 dark:border-slate-800">
                <th className="p-3">Certificate No</th>
                <th className="p-3">Student Name</th>
                <th className="p-3">Document Type</th>
                <th className="p-3">Issued Date</th>
                <th className="p-3">Verified Authority</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {mockCertificates.map((cert) => (
                <tr key={cert.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="p-3 text-slate-400 text-xs font-mono">{cert.certNo}</td>
                  <td className="p-3 font-extrabold text-slate-900 dark:text-white">{cert.studentName}</td>
                  <td className="p-3 font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                    <Award size={16} /> {cert.type}
                  </td>
                  <td className="p-3 text-xs text-slate-500">{cert.issueDate}</td>
                  <td className="p-3 text-xs text-slate-600 dark:text-slate-300">{cert.verifiedBy}</td>
                  <td className="p-3 text-center">
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                      {cert.status}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <Button variant="ghost" size="sm" icon={<Printer size={14} />}>Print PDF</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default CertificatesManagement;
