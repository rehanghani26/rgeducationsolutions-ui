/**
 * @file CertificatesManagement.jsx
 * @description Main Document & Credential Command Center for the School ERP.
 * Features 4 distinct workflow modules:
 * 1. ID Cards — Student, Teacher, and Staff ID generation & batch printing
 * 2. Certificates — Official certificate issuance, registry, revocation, and print
 * 3. Templates & Studio — 20 built-in templates + custom visual styling studio
 * 4. Verification — In-app validation of cryptographic verification tokens
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  Award,
  Palette,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import { useSchoolBranding } from '../../context/SchoolBrandingContext.jsx';

import IdCardsModule from './components/IdCardsModule.jsx';
import CertificatesModule from './components/CertificatesModule.jsx';
import TemplatesModule from './components/TemplatesModule.jsx';
import VerifyModule from './components/VerifyModule.jsx';
import StudentPageCertification from './StudentPageCertification.jsx';

const TABS = [
  {
    id: 'id-cards',
    label: 'ID Cards',
    icon: CreditCard,
    badge: 'Students • Faculty • Staff',
    color: 'sky',
  },
  {
    id: 'certificates',
    label: 'Certificates',
    icon: Award,
    badge: 'Official Credentials',
    color: 'amber',
  },
  {
    id: 'templates',
    label: 'Templates & Studio',
    icon: Palette,
    badge: '20 Designs',
    color: 'violet',
  },
  {
    id: 'verify',
    label: 'Verification',
    icon: ShieldCheck,
    badge: 'Tamper-Proof Audit',
    color: 'emerald',
  },
];

export default function CertificatesManagement() {
  const [searchParams] = useSearchParams();
  const urlTab = searchParams.get('tab');
  const authUser = useSelector((state) => state.auth?.user);
  const schoolBranding = useSchoolBranding();

  const userRole = (authUser?.role || 'student').toLowerCase();
  const isStudent = userRole === 'student';
  const isParent = userRole === 'parent';
  const isTeacher = ['teacher', 'faculty', 'instructor', 'head-teacher', 'hod', 'coordinator'].includes(userRole);
  const isAdmin = ['super-admin', 'school-admin', 'principal', 'director', 'admin', 'superadmin'].includes(userRole);

  const visibleTabs = useMemo(() => {
    const list = [
      {
        id: 'id-cards',
        label: isStudent ? 'My ID Card' : isParent ? 'Child ID Cards' : isTeacher ? 'ID Cards' : 'ID Cards',
        icon: CreditCard,
        badge: isStudent ? 'Student Identity' : isParent ? 'Official ID' : isTeacher ? 'Faculty & Students' : 'Students • Faculty • Staff',
        color: 'sky',
      },
      {
        id: 'certificates',
        label: isStudent ? 'My Certificates' : isParent ? 'Child Certificates' : 'Certificates',
        icon: Award,
        badge: isStudent ? 'My Credentials' : isParent ? 'Academic Credentials' : 'Official Credentials',
        color: 'amber',
      },
    ];

    if (isAdmin) {
      list.push({
        id: 'templates',
        label: 'Templates & Studio',
        icon: Palette,
        badge: '20 Designs',
        color: 'violet',
      });
    }

    list.push({
      id: 'verify',
      label: 'Verification',
      icon: ShieldCheck,
      badge: 'Audit & QR Validator',
      color: 'emerald',
    });

    return list;
  }, [isStudent, isParent, isTeacher, isAdmin]);

  const [activeTab, setActiveTab] = useState(() => {
    if (urlTab && visibleTabs.some((t) => t.id === urlTab)) return urlTab;
    return 'id-cards';
  });

  useEffect(() => {
    if (urlTab && visibleTabs.some((t) => t.id === urlTab)) {
      setActiveTab(urlTab);
    } else if (!visibleTabs.some((t) => t.id === activeTab)) {
      setActiveTab('id-cards');
    }
  }, [urlTab, visibleTabs, activeTab]);

  if (isStudent) {
    return <StudentPageCertification authUser={authUser} schoolSettings={schoolBranding} />;
  }

  const headerTitle = isParent
    ? 'Child ID Cards & Verified Credentials'
    : isTeacher
    ? 'Faculty & Student Credentials Portal'
    : 'ID Cards & Certificate Management';

  const headerSubtitle = isStudent
    ? 'Instant access to your institutional student identity card with front/back preview and tamper-proof official certificates.'
    : isParent
    ? "Review and print authorized student identity cards and verifiable credentials issued for your child."
    : isTeacher
    ? "Generate your faculty identity card and inspect/print certified records for your students."
    : 'Runtime dynamic rendering engine for institutional ID cards, verifiable certificates, and credential audit';

  const breadcrumbs = isStudent
    ? [{ label: 'Student Portal' }, { label: 'My ID & Certificates' }]
    : isParent
    ? [{ label: 'Parent Portal' }, { label: 'Child Credentials' }]
    : [{ label: 'Administration' }, { label: 'ID Cards & Certificates' }];

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-16"
    >
      {/* Top Header */}
      <PageHeader
        title={headerTitle}
        subtitle={headerSubtitle}
        breadcrumbs={breadcrumbs}
      />

      {/* Modern Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-900/70 border border-slate-800 rounded-2xl backdrop-blur-md shadow-lg">
        {visibleTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer relative ${
                isActive
                  ? 'bg-slate-800 text-white shadow-md border border-slate-700/80'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Icon
                size={16}
                className={
                  isActive
                    ? tab.color === 'sky'
                      ? 'text-sky-400'
                      : tab.color === 'amber'
                      ? 'text-amber-400'
                      : tab.color === 'violet'
                      ? 'text-violet-400'
                      : 'text-emerald-400'
                    : 'text-slate-400'
                }
              />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] font-normal px-2 py-0.5 rounded-full ${
                  isActive
                    ? 'bg-slate-900/80 text-slate-300 border border-slate-700'
                    : 'bg-slate-950/40 text-slate-500'
                }`}
              >
                {tab.badge}
              </span>

              {isActive && (
                <motion.div
                  layoutId="activeTabPill"
                  className="absolute bottom-0 left-3 right-3 h-[2px] bg-gradient-to-r from-sky-400 via-indigo-400 to-amber-400 rounded-full"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
        >
          {activeTab === 'id-cards' && (
            <IdCardsModule
              schoolSettings={schoolBranding}
              userRole={userRole}
              authUser={authUser}
            />
          )}

          {activeTab === 'certificates' && (
            <CertificatesModule
              schoolSettings={schoolBranding}
              userRole={userRole}
              authUser={authUser}
            />
          )}

          {activeTab === 'templates' && isAdmin && (
            <TemplatesModule
              schoolSettings={schoolBranding}
              userRole={userRole}
            />
          )}

          {activeTab === 'verify' && <VerifyModule />}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
