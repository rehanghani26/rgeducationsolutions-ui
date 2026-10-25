import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Calendar,
  CheckCircle2,
  X,
  Sparkles,
  Layers,
  ArrowRight,
  ArrowLeft,
  PartyPopper,
  ShieldCheck,
  Bot,
} from 'lucide-react';
import useSetupWizard from '../../hooks/useSetupWizard.js';
import Step1SchoolProfile from './steps/Step1SchoolProfile.jsx';
import Step2AcademicSession from './steps/Step2AcademicSession.jsx';
import SetupWizardAI from './SetupWizardAI.jsx';
import Modal from '../../components/ui/Modal.jsx';

const STEPS_META = [
  { id: 1, key: 'schoolProfile', title: 'School Profile', icon: Building2, color: 'text-indigo-500' },
  { id: 2, key: 'academicSession', title: 'Academic Session', icon: Calendar, color: 'text-emerald-500' },
];

export default function SetupWizardModal({ isOpen, onClose, onComplete, initialMode = 'manual' }) {
  const {
    status,
    loading,
    refreshStatus,
    markStepComplete,
    dismiss,
    steps,
  } = useSetupWizard(true);

  const [activeStep, setActiveStep] = useState(1);
  const [mode, setMode] = useState(initialMode); // 'manual' | 'ai'
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode || 'manual');
    }
  }, [isOpen, initialMode]);

  const isStepCompleteByKey = (key) => {
    const s = steps.find((item) => item.key === key);
    return s ? s.complete : false;
  };

  const completedCount = STEPS_META.filter((step) => isStepCompleteByKey(step.key)).length;
  const percentComplete = Math.round((completedCount / STEPS_META.length) * 100);

  useEffect(() => {
    if (steps && steps.length > 0) {
      const step1Done = isStepCompleteByKey('schoolProfile');
      const step2Done = isStepCompleteByKey('academicSession');
      if (!step1Done) {
        setActiveStep(1);
      } else if (!step2Done) {
        setActiveStep(2);
      }
    }
  }, [steps]);

  if (!isOpen) return null;

  const handleStepComplete = async (stepKey) => {
    await markStepComplete(stepKey);
    await refreshStatus();
  };

  const handleNextStep = () => {
    if (activeStep < STEPS_META.length) {
      setActiveStep((prev) => prev + 1);
    } else {
      setShowCelebration(true);
    }
  };

  const handlePrevStep = () => {
    if (activeStep > 1) {
      setActiveStep((prev) => prev - 1);
    }
  };

  const handleDismiss = async () => {
    await dismiss();
    if (onClose) onClose();
  };

  return (
    <Modal
      open={true}
      onClose={handleDismiss}
      size="xl"
      noPadding
      showCloseButton={false}
      className="border-indigo-900/50"
    >
      <div className="relative w-full bg-white dark:bg-slate-900 overflow-hidden">
        {/* Top Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-indigo-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/30">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold tracking-tight">
                  School ERP Initial Setup Wizard
                </h2>
                <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  {percentComplete}% Complete ({completedCount}/2 Steps)
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Configure the 2 core anchors that initialize all ERP student, academic & billing operations.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Switcher */}
            <div className="p-1 bg-slate-800/80 rounded-xl border border-slate-700/80 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setMode('manual')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                  mode === 'manual'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Manual Form
              </button>
              <button
                type="button"
                onClick={() => setMode('ai')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                  mode === 'ai'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Bot className="w-3.5 h-3.5" />
                ✨ AI Setup Mode
              </button>
            </div>

            <button
              type="button"
              onClick={handleDismiss}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
              title="Close / Configure Later"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${percentComplete}%` }}
          />
        </div>

        {/* 2-Step Navigation Pills */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between gap-3 max-w-xl mx-auto">
            {STEPS_META.map((step) => {
              const Icon = step.icon;
              const isDone = isStepCompleteByKey(step.key);
              const isActive = activeStep === step.id && mode === 'manual';

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => {
                    setActiveStep(step.id);
                    setMode('manual');
                  }}
                  className={`flex-1 flex items-center gap-2.5 p-2.5 rounded-xl transition border text-left cursor-pointer ${
                    isActive
                      ? 'border-indigo-500 bg-white dark:bg-slate-800 shadow-sm'
                      : isDone
                      ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20'
                      : 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-800/60 opacity-80'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isDone
                        ? 'bg-emerald-500 text-white'
                        : isActive
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Step {step.id} of 2
                    </div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {step.title}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[62vh] overflow-y-auto">
          {showCelebration ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-3xl flex items-center justify-center shadow-xl shadow-emerald-500/30">
                <PartyPopper className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Initial 2-Step Setup Completed! 🎉
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                Your school profile and active academic calendar are locked in.
                Next priority configurations like <strong>Bell Schedule (Priority 3)</strong>, <strong>Class Timetables (Priority 4)</strong>, <strong>Academic Rules (Priority 5)</strong>, and <strong>Finance Policies (Priority 6)</strong> are all directly accessible in the Settings tabs.
              </p>
              <div className="pt-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (onComplete) onComplete();
                    if (onClose) onClose();
                  }}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs rounded-xl shadow-lg hover:from-emerald-700 hover:to-teal-700 transition cursor-pointer"
                >
                  Enter School ERP Dashboard →
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onClose) onClose();
                  }}
                  className="px-4 py-2.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold transition cursor-pointer"
                >
                  Go to Settings Tabs
                </button>
              </div>
            </div>
          ) : mode === 'ai' ? (
            <SetupWizardAI
              status={status}
              onStatusRefresh={refreshStatus}
              onStepCompleted={handleStepComplete}
            />
          ) : (
            <div>
              {activeStep === 1 && (
                <Step1SchoolProfile
                  onComplete={handleStepComplete}
                  onNext={handleNextStep}
                />
              )}
              {activeStep === 2 && (
                <Step2AcademicSession
                  onComplete={handleStepComplete}
                  onNext={() => {
                    handleStepComplete('academicSession');
                    setShowCelebration(true);
                  }}
                />
              )}

              {/* Navigation Back & Skip */}
              <div className="mt-4 pt-3 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  disabled={activeStep === 1}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition font-bold cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Previous Step
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 font-bold cursor-pointer"
                  >
                    {activeStep === 1 ? 'Skip to Step 2 →' : 'Finish Setup →'}
                  </button>
                  <button
                    type="button"
                    onClick={handleDismiss}
                    className="text-slate-400 hover:text-rose-500 font-bold cursor-pointer"
                  >
                    Configure later
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
