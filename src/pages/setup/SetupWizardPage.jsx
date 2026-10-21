import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import SetupWizardModal from './SetupWizardModal.jsx';

export default function SetupWizardPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={() => navigate('/settings')}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold text-xs sm:text-sm transition cursor-pointer"
        >
          <ArrowLeft size={16} /> Back to Settings Overview
        </button>
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400">
          <Sparkles size={14} /> Initial Setup Wizard
        </div>
      </div>

      <SetupWizardModal
        isOpen={true}
        onClose={() => navigate('/settings')}
        onComplete={() => navigate('/settings')}
      />
    </div>
  );
}
