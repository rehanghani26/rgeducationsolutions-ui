import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, PieChart as PieChartIcon, FileSpreadsheet, Download, Award, ShieldCheck } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import { mockReports } from '../../data/mockData.js';

const ReportsManagement = () => {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-12">
      <PageHeader
        title="Reports & ERP Analytics"
        subtitle="Institutional performance metrics, financial growth summaries, and academic analytics"
        breadcrumbs={[{ label: 'Analytics' }, { label: 'Reports' }]}
        actions={<Button icon={<Download size={16} />}>Export Full ERP Audit PDF</Button>}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <BarChart3 className="text-indigo-500" size={24} />
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Attendance Summary</h3>
              <p className="text-xs text-slate-400">{mockReports.attendanceOverview}</p>
            </div>
          </div>
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-emerald-800 dark:text-emerald-300 text-sm font-semibold">
            ✨ Student attendance consistent at 96.4% across all departments this month.
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <TrendingUp className="text-emerald-500" size={24} />
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Finance & Fee Collection</h3>
              <p className="text-xs text-slate-400">{mockReports.feeCollectionOverview}</p>
            </div>
          </div>
          <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-800 dark:text-indigo-300 text-sm font-semibold">
            💳 ₹18,45,000 collected in Q3 session with 89.5% completion rate.
          </div>
        </div>
      </div>

      {/* Top Performers Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6 space-y-4">
        <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <Award className="text-amber-500" size={20} /> Academic Honor Roll & Top Performers
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mockReports.topPerformers.map((st, i) => (
            <div key={st.name} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-600">Rank #{i + 1}</span>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{st.name}</h4>
                <p className="text-xs text-slate-400">{st.grade}</p>
              </div>
              <span className="text-lg font-extrabold text-emerald-600">{st.score}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ReportsManagement;
