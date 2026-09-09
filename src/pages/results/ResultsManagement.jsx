import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, BookOpen, Download, Printer, Search, User, FileText, CheckCircle } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import { mockResults } from '../../data/mockData.js';

const ResultsManagement = () => {
  const [selectedStudent, setSelectedStudent] = useState(mockResults[0]);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-12">
      <PageHeader
        title="Examinations & Student Report Cards"
        subtitle="View academic performance, subject marks, GPA, and printable report cards"
        breadcrumbs={[{ label: 'Exams' }, { label: 'Results' }]}
        actions={
          <div className="flex gap-3">
            <Button variant="outline" icon={<Printer size={16} />}>Print Marksheet</Button>
            <Button icon={<Download size={16} />}>Download Report PDF</Button>
          </div>
        }
      />

      {/* Selector & Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Student Result List Selector */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-slate-700 dark:text-slate-200">Select Student Result</h3>
          <div className="space-y-2">
            {mockResults.map((res) => (
              <button
                key={res.id}
                onClick={() => setSelectedStudent(res)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selectedStudent.id === res.id
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40'
                    : 'border-slate-100 dark:border-slate-800 hover:border-slate-200'
                }`}
              >
                <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{res.studentName}</p>
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>{res.class} (Roll: {res.rollNo})</span>
                  <span className="font-bold text-indigo-600">{res.grade}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Detailed Report Card View */}
        <div className="lg:col-span-3 space-y-6">
          {/* Card Header Info */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">{selectedStudent.exam}</span>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">{selectedStudent.studentName}</h2>
                <p className="text-xs text-slate-500">
                  Admission No: {selectedStudent.studentId} | Class: {selectedStudent.class} | Roll: {selectedStudent.rollNo}
                </p>
              </div>

              <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="text-center px-2 border-r border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-400 font-semibold">Overall GPA</p>
                  <p className="text-lg font-extrabold text-indigo-600">{selectedStudent.gpa}</p>
                </div>
                <div className="text-center px-2 border-r border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-400 font-semibold">Overall Grade</p>
                  <p className="text-lg font-extrabold text-emerald-600">{selectedStudent.grade}</p>
                </div>
                <div className="text-center px-2">
                  <p className="text-xs text-slate-400 font-semibold">Class Position</p>
                  <p className="text-lg font-extrabold text-amber-600">{selectedStudent.rank}</p>
                </div>
              </div>
            </div>

            {/* Subject Marks Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 font-bold text-xs uppercase border-b border-slate-200 dark:border-slate-800">
                    <th className="p-3">Code</th>
                    <th className="p-3">Subject Name</th>
                    <th className="p-3 text-center">Max Marks</th>
                    <th className="p-3 text-center">Obtained Marks</th>
                    <th className="p-3 text-center">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {selectedStudent.subjects.map((sub) => (
                    <tr key={sub.code} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="p-3 text-slate-400 text-xs font-mono">{sub.code}</td>
                      <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{sub.subject}</td>
                      <td className="p-3 text-center text-slate-500">{sub.total}</td>
                      <td className="p-3 text-center font-extrabold text-slate-900 dark:text-white">{sub.obtained}</td>
                      <td className="p-3 text-center">
                        <span className="px-2.5 py-1 rounded-md text-xs font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                          {sub.grade}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Principal Signature Note */}
            <div className="flex justify-between items-center pt-6 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
              <div className="flex items-center gap-2 text-emerald-600 font-semibold">
                <CheckCircle size={16} /> Digitally Verified by Academic Controller
              </div>
              <p>Generated on August 5, 2026</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ResultsManagement;
