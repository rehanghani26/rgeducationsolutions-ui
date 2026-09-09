import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, GraduationCap, Calendar, Clock, Award, FileText, CheckCircle2,
  Download, ExternalLink, School, User, Sparkles, TrendingUp, BarChart2,
  ArrowRight, Search, FileCheck, BookMarked, Video, Send, CheckCircle,
  HelpCircle, ChevronRight, X
} from 'lucide-react';
import { mockAcademics } from '../../data/mockData.js';
import Modal from '../../components/ui/Modal.jsx';
import curriculumService from '../../services/curriculumService.js';

// ─── Enriched Student Subjects with Syllabus & Progress ──────────────────────
export const ENRICHED_STUDENT_SUBJECTS = [
  {
    id: 'subj-1',
    code: 'MTH-103',
    name: 'Mathematics & Geometry',
    type: 'theory',
    credits: 5,
    teacher: 'Dr. Bilal Siddiqui',
    teacherRole: 'Senior Mathematics Faculty',
    room: 'Block A - Room 101',
    progress: 74,
    color: 'from-blue-600 to-indigo-600',
    accentText: 'text-blue-500',
    accentBg: 'bg-blue-500/10 border-blue-500/20',
    schedule: 'Mon, Wed, Fri (08:00 AM)',
    unitsCount: 6,
    completedUnits: 4,
    currentChapter: 'Unit 4: Quadratic Equations & Parabolas',
    units: [
      { id: 1, title: 'Unit 1: Real Numbers & Set Theory', status: 'completed', duration: '2 weeks' },
      { id: 2, title: 'Unit 2: Polynomials & Factorization', status: 'completed', duration: '3 weeks' },
      { id: 3, title: 'Unit 3: Linear Equations in Two Variables', status: 'completed', duration: '2.5 weeks' },
      { id: 4, title: 'Unit 4: Quadratic Equations & Parabolas', status: 'in-progress', duration: 'Current (Week 8)' },
      { id: 5, title: 'Unit 5: Arithmetic Progressions & Series', status: 'upcoming', duration: 'Next' },
      { id: 6, title: 'Unit 6: Coordinate Geometry & Vectors', status: 'upcoming', duration: '3 weeks' },
    ],
    materials: [
      { name: 'Class 10 Geometry Formula Handbook', type: 'PDF', size: '3.4 MB', date: 'Aug 20, 2026' },
      { name: 'Unit 3 Solved Question Bank with Solutions', type: 'PDF', size: '5.1 MB', date: 'Aug 28, 2026' },
    ],
  },
  {
    id: 'subj-2',
    code: 'PHY-104',
    name: 'Physics & Applied Mechanics',
    type: 'practical',
    credits: 4,
    teacher: 'Prof. Mohammed Zakir',
    teacherRole: 'Physics Department Head',
    room: 'Science Lab 2',
    progress: 68,
    color: 'from-cyan-600 to-blue-600',
    accentText: 'text-cyan-500',
    accentBg: 'bg-cyan-500/10 border-cyan-500/20',
    schedule: 'Tue, Thu (08:55 AM)',
    unitsCount: 5,
    completedUnits: 3,
    currentChapter: 'Unit 3: Electromagnetism & Induced Currents',
    units: [
      { id: 1, title: 'Unit 1: Kinematics & Laws of Motion', status: 'completed', duration: '3 weeks' },
      { id: 2, title: 'Unit 2: Work, Energy, and Gravitational Fields', status: 'completed', duration: '3 weeks' },
      { id: 3, title: 'Unit 3: Electromagnetism & Induced Currents', status: 'in-progress', duration: 'Current (Week 8)' },
      { id: 4, title: 'Unit 4: Optics, Reflection & Refraction', status: 'upcoming', duration: 'Next' },
      { id: 5, title: 'Unit 5: Wave Mechanics & Sound Waves', status: 'upcoming', duration: '2.5 weeks' },
    ],
    materials: [
      { name: 'Physics Laboratory Practical Manual & Safety Guidelines', type: 'PDF', size: '4.8 MB', date: 'Aug 15, 2026' },
      { name: 'Electromagnetism Lecture Slides & Diagrams', type: 'PPTX', size: '8.2 MB', date: 'Sep 02, 2026' },
    ],
  },
  {
    id: 'subj-3',
    code: 'ISL-101',
    name: 'Quranic Sciences & Tajweed',
    type: 'theory',
    credits: 4,
    teacher: 'Sheikh Abdullah Al-Hafiz',
    teacherRole: 'Head of Religious Studies',
    room: 'Main Lecture Hall B',
    progress: 82,
    color: 'from-emerald-600 to-teal-600',
    accentText: 'text-emerald-500',
    accentBg: 'bg-emerald-500/10 border-emerald-500/20',
    schedule: 'Mon, Wed, Thu (11:15 AM)',
    unitsCount: 6,
    completedUnits: 5,
    currentChapter: 'Unit 5: Rules of Noon Sakinah and Tanween in Recitation',
    units: [
      { id: 1, title: 'Unit 1: Introduction to Quranic Sciences (Ulum al-Quran)', status: 'completed', duration: '2 weeks' },
      { id: 2, title: 'Unit 2: Makki and Madani Surahs and Chronology', status: 'completed', duration: '2 weeks' },
      { id: 3, title: 'Unit 3: Makharij al-Huroof (Articulation Points)', status: 'completed', duration: '3 weeks' },
      { id: 4, title: 'Unit 4: Sifaat al-Huroof (Characteristics of Letters)', status: 'completed', duration: '2.5 weeks' },
      { id: 5, title: 'Unit 5: Rules of Noon Sakinah & Tanween', status: 'in-progress', duration: 'Current' },
      { id: 6, title: 'Unit 6: Madd (Elongation) Types and Practical Recitation', status: 'upcoming', duration: '3 weeks' },
    ],
    materials: [
      { name: 'Comprehensive Tajweed Rules Reference Chart', type: 'PDF', size: '2.1 MB', date: 'Aug 10, 2026' },
      { name: 'Recitation Audio Guide & Pronunciation Guide', type: 'ZIP', size: '14.5 MB', date: 'Aug 12, 2026' },
    ],
  },
  {
    id: 'subj-4',
    code: 'ARB-102',
    name: 'Classical & Modern Arabic',
    type: 'theory',
    credits: 4,
    teacher: 'Fatima Az-Zahra',
    teacherRole: 'Faculty of Arabic Linguistics',
    room: 'Block A - Room 102',
    progress: 70,
    color: 'from-amber-600 to-orange-600',
    accentText: 'text-amber-500',
    accentBg: 'bg-amber-500/10 border-amber-500/20',
    schedule: 'Mon, Tue, Thu (09:50 AM)',
    unitsCount: 5,
    completedUnits: 3,
    currentChapter: 'Unit 4: Verb Conjugations & Weak Verb Patterns',
    units: [
      { id: 1, title: 'Unit 1: Arabic Morphology & Word Construction', status: 'completed', duration: '3 weeks' },
      { id: 2, title: 'Unit 2: Nominal Sentences and Predicates', status: 'completed', duration: '2.5 weeks' },
      { id: 3, title: 'Unit 3: Idafa (Possession) and Adjectives', status: 'completed', duration: '2 weeks' },
      { id: 4, title: 'Unit 4: Verb Conjugations & Irregular Verbs', status: 'in-progress', duration: 'Current' },
      { id: 5, title: 'Unit 5: Comprehension, Translation, and Dialogue', status: 'upcoming', duration: '3 weeks' },
    ],
    materials: [
      { name: 'Arabic Grammar Essentials Handbook (Nahw & Sarf)', type: 'PDF', size: '3.9 MB', date: 'Aug 18, 2026' },
      { name: 'Weekly Vocabulary & Conversational Exercises', type: 'PDF', size: '1.7 MB', date: 'Sep 01, 2026' },
    ],
  },
  {
    id: 'subj-5',
    code: 'ENG-105',
    name: 'English Language & Literature',
    type: 'theory',
    credits: 4,
    teacher: 'Sumayya Khan',
    teacherRole: 'Department of Humanities',
    room: 'Block B - Room 204',
    progress: 78,
    color: 'from-purple-600 to-pink-600',
    accentText: 'text-purple-500',
    accentBg: 'bg-purple-500/10 border-purple-500/20',
    schedule: 'Mon, Wed, Fri (12:10 PM)',
    unitsCount: 5,
    completedUnits: 4,
    currentChapter: 'Unit 4: Analytical Essay Writing & Rhetorical Devices',
    units: [
      { id: 1, title: 'Unit 1: Modern Short Stories & Literary Elements', status: 'completed', duration: '3 weeks' },
      { id: 2, title: 'Unit 2: Poetry Analysis & Metaphorical Devices', status: 'completed', duration: '2.5 weeks' },
      { id: 3, title: 'Unit 3: Advanced Grammar, Syntax, and Punctuation', status: 'completed', duration: '2 weeks' },
      { id: 4, title: 'Unit 4: Analytical Essay Writing', status: 'in-progress', duration: 'Current' },
      { id: 5, title: 'Unit 5: Drama: Shakespearean Excerpts & Performance', status: 'upcoming', duration: '3 weeks' },
    ],
    materials: [
      { name: 'Selected Anthology of Prose and Poetry Reader', type: 'PDF', size: '6.2 MB', date: 'Aug 22, 2026' },
      { name: 'Essay Writing Rubric & Model High-Scoring Samples', type: 'PDF', size: '2.4 MB', date: 'Aug 30, 2026' },
    ],
  },
  {
    id: 'subj-6',
    code: 'CHM-107',
    name: 'Chemistry & Experimental Sciences',
    type: 'practical',
    credits: 4,
    teacher: 'Dr. Amina Farooqui',
    teacherRole: 'Senior Chemistry Lecturer',
    room: 'Chemistry Lab 1',
    progress: 62,
    color: 'from-emerald-600 to-cyan-600',
    accentText: 'text-emerald-500',
    accentBg: 'bg-emerald-500/10 border-emerald-500/20',
    schedule: 'Tue, Fri (01:30 PM)',
    unitsCount: 5,
    completedUnits: 3,
    currentChapter: 'Unit 3: Chemical Bonding, Molecular Geometry & Orbitals',
    units: [
      { id: 1, title: 'Unit 1: Atomic Structure and Periodic Trends', status: 'completed', duration: '3 weeks' },
      { id: 2, title: 'Unit 2: Stoichiometry and Solution Concentration', status: 'completed', duration: '2.5 weeks' },
      { id: 3, title: 'Unit 3: Chemical Bonding & Molecular Geometry', status: 'in-progress', duration: 'Current' },
      { id: 4, title: 'Unit 4: Thermochemistry & Reaction Kinetics', status: 'upcoming', duration: 'Next' },
      { id: 5, title: 'Unit 5: Acids, Bases, and Equilibrium Systems', status: 'upcoming', duration: '3 weeks' },
    ],
    materials: [
      { name: 'Periodic Table & Chemical Constants Reference Booklet', type: 'PDF', size: '1.9 MB', date: 'Aug 14, 2026' },
      { name: 'Laboratory Titration & Synthesis Lab Protocols', type: 'PDF', size: '3.8 MB', date: 'Aug 26, 2026' },
    ],
  },
  {
    id: 'subj-7',
    code: 'HIS-106',
    name: 'World Civilizations & Islamic Heritage',
    type: 'theory',
    credits: 3,
    teacher: 'Sheikh Abdullah Al-Hafiz',
    teacherRole: 'Head of Religious Studies',
    room: 'Block A - Room 101',
    progress: 80,
    color: 'from-amber-600 to-yellow-600',
    accentText: 'text-amber-500',
    accentBg: 'bg-amber-500/10 border-amber-500/20',
    schedule: 'Wed, Thu (02:25 PM)',
    unitsCount: 4,
    completedUnits: 3,
    currentChapter: 'Unit 3: The Golden Age of Science and Scholarship (8th–14th Century)',
    units: [
      { id: 1, title: 'Unit 1: Early Civilization Foundations & Near East Empires', status: 'completed', duration: '3 weeks' },
      { id: 2, title: 'Unit 2: The Umayyad and Abbasid Dynasties', status: 'completed', duration: '3 weeks' },
      { id: 3, title: 'Unit 3: The Golden Age of Science and Scholarship', status: 'in-progress', duration: 'Current' },
      { id: 4, title: 'Unit 4: Global Interactions, Trade Routes, and Cultural Exchange', status: 'upcoming', duration: '2.5 weeks' },
    ],
    materials: [
      { name: 'Historical Maps Atlas: Silk Road & Maritime Routes', type: 'PDF', size: '7.1 MB', date: 'Aug 19, 2026' },
      { name: 'Primary Source Documents & Scholarly Articles', type: 'PDF', size: '4.5 MB', date: 'Aug 29, 2026' },
    ],
  },
];

// ─── Weekly Timetable Schedule Data ──────────────────────────────────────────
const TIMETABLE_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const WEEKLY_TIMETABLE = {
  Monday: [
    { period: 1, time: '08:00 – 08:50 AM', subject: 'Mathematics & Geometry', code: 'MTH-103', room: 'Room 101', teacher: 'Dr. Bilal Siddiqui', type: 'Core' },
    { period: 2, time: '08:55 – 09:45 AM', subject: 'Classical & Modern Arabic', code: 'ARB-102', room: 'Room 102', teacher: 'Fatima Az-Zahra', type: 'Core' },
    { period: 3, time: '09:50 – 10:40 AM', subject: 'Physics & Lab Work', code: 'PHY-104', room: 'Science Lab 2', teacher: 'Prof. Mohammed Zakir', type: 'Lab' },
    { period: 0, time: '10:40 – 11:15 AM', subject: 'Mid-Morning Break & Assembly', isBreak: true },
    { period: 4, time: '11:15 – 12:05 PM', subject: 'Quranic Sciences & Tajweed', code: 'ISL-101', room: 'Lecture Hall B', teacher: 'Sheikh Abdullah', type: 'Core' },
    { period: 5, time: '12:10 – 01:00 PM', subject: 'English Language & Literature', code: 'ENG-105', room: 'Room 204', teacher: 'Sumayya Khan', type: 'Core' },
  ],
  Tuesday: [
    { period: 1, time: '08:00 – 08:50 AM', subject: 'Physics & Lab Work', code: 'PHY-104', room: 'Science Lab 2', teacher: 'Prof. Mohammed Zakir', type: 'Lab' },
    { period: 2, time: '08:55 – 09:45 AM', subject: 'Chemistry & Practical Sciences', code: 'CHM-107', room: 'Chem Lab 1', teacher: 'Dr. Amina Farooqui', type: 'Lab' },
    { period: 3, time: '09:50 – 10:40 AM', subject: 'Classical & Modern Arabic', code: 'ARB-102', room: 'Room 102', teacher: 'Fatima Az-Zahra', type: 'Core' },
    { period: 0, time: '10:40 – 11:15 AM', subject: 'Mid-Morning Break & Assembly', isBreak: true },
    { period: 4, time: '11:15 – 12:05 PM', subject: 'Mathematics & Geometry', code: 'MTH-103', room: 'Room 101', teacher: 'Dr. Bilal Siddiqui', type: 'Core' },
    { period: 5, time: '12:10 – 01:00 PM', subject: 'World Civilizations & Heritage', code: 'HIS-106', room: 'Room 101', teacher: 'Sheikh Abdullah', type: 'Core' },
  ],
  Wednesday: [
    { period: 1, time: '08:00 – 08:50 AM', subject: 'Mathematics & Geometry', code: 'MTH-103', room: 'Room 101', teacher: 'Dr. Bilal Siddiqui', type: 'Core' },
    { period: 2, time: '08:55 – 09:45 AM', subject: 'Quranic Sciences & Tajweed', code: 'ISL-101', room: 'Lecture Hall B', teacher: 'Sheikh Abdullah', type: 'Core' },
    { period: 3, time: '09:50 – 10:40 AM', subject: 'English Language & Literature', code: 'ENG-105', room: 'Room 204', teacher: 'Sumayya Khan', type: 'Core' },
    { period: 0, time: '10:40 – 11:15 AM', subject: 'Mid-Morning Break & Assembly', isBreak: true },
    { period: 4, time: '11:15 – 12:05 PM', subject: 'Chemistry & Practical Sciences', code: 'CHM-107', room: 'Chem Lab 1', teacher: 'Dr. Amina Farooqui', type: 'Lab' },
    { period: 5, time: '12:10 – 01:00 PM', subject: 'Library & Guided Study', code: 'LIB-100', room: 'Central Library', teacher: 'Irma Pince', type: 'Study' },
  ],
  Thursday: [
    { period: 1, time: '08:00 – 08:50 AM', subject: 'Classical & Modern Arabic', code: 'ARB-102', room: 'Room 102', teacher: 'Fatima Az-Zahra', type: 'Core' },
    { period: 2, time: '08:55 – 09:45 AM', subject: 'Physics & Applied Mechanics', code: 'PHY-104', room: 'Science Lab 2', teacher: 'Prof. Mohammed Zakir', type: 'Lab' },
    { period: 3, time: '09:50 – 10:40 AM', subject: 'Quranic Sciences & Tajweed', code: 'ISL-101', room: 'Lecture Hall B', teacher: 'Sheikh Abdullah', type: 'Core' },
    { period: 0, time: '10:40 – 11:15 AM', subject: 'Mid-Morning Break & Assembly', isBreak: true },
    { period: 4, time: '11:15 – 12:05 PM', subject: 'World Civilizations & Heritage', code: 'HIS-106', room: 'Room 101', teacher: 'Sheikh Abdullah', type: 'Core' },
    { period: 5, time: '12:10 – 01:00 PM', subject: 'Mathematics Problem Solving', code: 'MTH-103', room: 'Room 101', teacher: 'Dr. Bilal Siddiqui', type: 'Core' },
  ],
  Friday: [
    { period: 1, time: '08:00 – 08:50 AM', subject: 'Mathematics & Geometry', code: 'MTH-103', room: 'Room 101', teacher: 'Dr. Bilal Siddiqui', type: 'Core' },
    { period: 2, time: '08:55 – 09:45 AM', subject: 'English Language & Literature', code: 'ENG-105', room: 'Room 204', teacher: 'Sumayya Khan', type: 'Core' },
    { period: 3, time: '09:50 – 10:40 AM', subject: 'Chemistry Lab & Experiments', code: 'CHM-107', room: 'Chem Lab 1', teacher: 'Dr. Amina Farooqui', type: 'Lab' },
    { period: 0, time: '10:40 – 11:15 AM', subject: 'Friday Assembly & Tahfeez', isBreak: true },
    { period: 4, time: '11:15 – 12:15 PM', subject: 'Islamic Ethics & Community Service', code: 'ETH-108', room: 'Auditorium', teacher: 'Sheikh Abdullah', type: 'Activity' },
  ],
};

// ─── Student Academic Performance Mock Data ──────────────────────────────────
const STUDENT_PERFORMANCE = [
  { subject: 'Quranic Sciences & Tajweed', code: 'ISL-101', midterm: 96, internal: 29, maxInternal: 30, grade: 'A+', remarks: 'Exceptional recitation and mastery of Tajweed rules.' },
  { subject: 'Classical & Modern Arabic', code: 'ARB-102', midterm: 88, internal: 27, maxInternal: 30, grade: 'A', remarks: 'Strong grammatical application; continue practicing oral fluency.' },
  { subject: 'Mathematics & Geometry', code: 'MTH-103', midterm: 94, internal: 28, maxInternal: 30, grade: 'A+', remarks: 'Demonstrates deep analytical clarity in problem-solving.' },
  { subject: 'Physics & Applied Mechanics', code: 'PHY-104', midterm: 86, internal: 26, maxInternal: 30, grade: 'A', remarks: 'Very good lab execution and theoretical understanding.' },
  { subject: 'English Language & Composition', code: 'ENG-105', midterm: 91, internal: 28, maxInternal: 30, grade: 'A', remarks: 'Insightful essay contributions and articulate writing.' },
  { subject: 'Chemistry & Practical Sciences', code: 'CHM-107', midterm: 84, internal: 25, maxInternal: 30, grade: 'B+', remarks: 'Diligent lab work. Pay extra attention to stoichiometry problems.' },
  { subject: 'World Civilizations & Heritage', code: 'HIS-106', midterm: 92, internal: 29, maxInternal: 30, grade: 'A+', remarks: 'Superb historical analysis and thoughtful contributions.' },
];

// ─── Color Palettes for Dynamically Assigned Courses ─────────────────────────
const PALETTES = [
  { color: 'from-blue-600 to-indigo-600', accentText: 'text-blue-500', accentBg: 'bg-blue-500/10 border-blue-500/20' },
  { color: 'from-cyan-600 to-blue-600', accentText: 'text-cyan-500', accentBg: 'bg-cyan-500/10 border-cyan-500/20' },
  { color: 'from-emerald-600 to-teal-600', accentText: 'text-emerald-500', accentBg: 'bg-emerald-500/10 border-emerald-500/20' },
  { color: 'from-amber-600 to-orange-600', accentText: 'text-amber-500', accentBg: 'bg-amber-500/10 border-amber-500/20' },
  { color: 'from-purple-600 to-pink-600', accentText: 'text-purple-500', accentBg: 'bg-purple-500/10 border-purple-500/20' },
  { color: 'from-rose-600 to-pink-600', accentText: 'text-rose-500', accentBg: 'bg-rose-500/10 border-rose-500/20' },
];

const normalizeSubject = (sub, idx = 0) => {
  const pal = PALETTES[idx % PALETTES.length];
  const units = sub.units || [];
  const completedUnits = units.filter((u) => u.status === 'completed').length;
  const progress =
    sub.progress !== undefined && sub.progress !== null
      ? Number(sub.progress)
      : units.length > 0
      ? Math.round((completedUnits / units.length) * 100)
      : 0;

  return {
    ...sub,
    id: sub.id || sub._id || `subj-${idx}`,
    color: sub.color || pal.color,
    accentText: sub.accentText || pal.accentText,
    accentBg: sub.accentBg || pal.accentBg,
    unitsCount: units.length,
    completedUnits: completedUnits,
    progress: progress,
    currentChapter:
      sub.currentChapter ||
      units.find((u) => u.status === 'in-progress')?.title ||
      units[0]?.title ||
      'Standard Curriculum Chapter',
    units: units.map((u, uIdx) => ({
      id: u.id || uIdx + 1,
      title: u.title,
      status: u.status || 'upcoming',
      duration: u.duration || '2 weeks',
    })),
    materials: (sub.materials || []).map((m) => ({
      name: m.name,
      type: m.type || 'PDF',
      size: m.size || '3.2 MB',
      date: m.date || 'Aug 2026',
      url: m.url || '#',
    })),
  };
};

// ─── Dynamic Timetable Builder from Assigned Courses ─────────────────────────
export const buildDynamicTimetable = (coursesList = []) => {
  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const dayPatterns = {
    Monday: /\b(mon|monday)\b/i,
    Tuesday: /\b(tue|tues|tuesday)\b/i,
    Wednesday: /\b(wed|wednesday)\b/i,
    Thursday: /\b(thu|thur|thurs|thursday)\b/i,
    Friday: /\b(fri|friday)\b/i,
  };

  const timetable = {};

  DAYS.forEach((day, dayIndex) => {
    const pattern = dayPatterns[day];
    const matching = (coursesList || []).filter((c) => pattern.test(c.schedule || ''));

    if (matching.length > 0) {
      const slots = [];
      const standardTimes = [
        '08:00 – 08:50 AM',
        '08:55 – 09:45 AM',
        '09:50 – 10:40 AM',
        '11:15 – 12:05 PM',
        '12:10 – 01:00 PM',
        '01:30 – 02:20 PM',
      ];

      matching.forEach((c, idx) => {
        if (idx === 3) {
          slots.push({
            period: 0,
            time: '10:40 – 11:15 AM',
            subject: 'Mid-Morning Break & Assembly',
            isBreak: true,
          });
        }

        const timeMatch = c.schedule && c.schedule.match(/\(([^)]+)\)/);
        const timeStr = timeMatch
          ? timeMatch[1]
          : standardTimes[slots.filter((s) => !s.isBreak).length % standardTimes.length];

        slots.push({
          period: slots.filter((s) => !s.isBreak).length + 1,
          time: timeStr,
          subject: c.name,
          code: c.code,
          room: c.room || 'Room 101',
          teacher: c.teacher || 'Assigned Faculty',
          type: c.type === 'practical' ? 'Lab' : 'Core',
        });
      });

      timetable[day] = slots;
    } else if (coursesList && coursesList.length > 0) {
      const slots = [];
      const times = [
        '08:00 – 08:50 AM',
        '08:55 – 09:45 AM',
        '09:50 – 10:40 AM',
        '11:15 – 12:05 PM',
        '12:10 – 01:00 PM',
      ];

      const offset = dayIndex % coursesList.length;
      const dayCourses = [
        ...coursesList.slice(offset),
        ...coursesList.slice(0, offset),
      ].slice(0, 4);

      dayCourses.forEach((c, idx) => {
        if (idx === 2) {
          slots.push({
            period: 0,
            time: '10:40 – 11:15 AM',
            subject: 'Mid-Morning Break & Assembly',
            isBreak: true,
          });
        }
        slots.push({
          period: slots.filter((s) => !s.isBreak).length + 1,
          time: times[slots.filter((s) => !s.isBreak).length % times.length],
          subject: c.name,
          code: c.code,
          room: c.room || 'Room 101',
          teacher: c.teacher || 'Assigned Faculty',
          type: c.type === 'practical' ? 'Lab' : 'Core',
        });
      });

      timetable[day] = slots;
    } else {
      timetable[day] = WEEKLY_TIMETABLE[day] || [];
    }
  });

  return timetable;
};

// ─── Dynamic Student Academic Performance Builder ────────────────────────────
export const buildDynamicPerformance = (coursesList = []) => {
  if (!coursesList || coursesList.length === 0) {
    return {
      records: STUDENT_PERFORMANCE,
      termAverage: '91.4%',
      grade: 'Grade A',
      gpa: '3.85 / 4.0',
    };
  }

  let totalScore = 0;
  const records = coursesList.map((c) => {
    const existing = STUDENT_PERFORMANCE.find(
      (p) =>
        p.code.toUpperCase() === c.code.toUpperCase() ||
        p.subject.toLowerCase() === c.name.toLowerCase()
    );

    if (existing) {
      totalScore += existing.midterm;
      return existing;
    }

    const progress = c.progress || 72;
    const midterm = Math.min(98, Math.max(65, Math.round(progress * 0.9 + 18)));
    const internal = Math.min(30, Math.max(22, Math.round(midterm * 0.3)));
    totalScore += midterm;

    const grade =
      midterm >= 93 ? 'A+' : midterm >= 85 ? 'A' : midterm >= 78 ? 'B+' : midterm >= 70 ? 'B' : 'C';

    return {
      subject: c.name,
      code: c.code,
      midterm: midterm,
      internal: internal,
      maxInternal: 30,
      grade: grade,
      remarks:
        grade === 'A+'
          ? 'Exceptional mastery of concepts and outstanding coursework submission.'
          : grade === 'A'
          ? 'Strong conceptual understanding and active participation in class.'
          : 'Consistent effort; revise recommended formula sheets and practical manuals.',
    };
  });

  const avg = records.length > 0 ? (totalScore / records.length).toFixed(1) : '90.0';
  const overallGrade = Number(avg) >= 90 ? 'Grade A+' : Number(avg) >= 80 ? 'Grade A' : 'Grade B+';
  const gpa = Math.min(4.0, Number(avg) / 24.5).toFixed(2) + ' / 4.0';

  return {
    records,
    termAverage: `${avg}%`,
    grade: overallGrade,
    gpa,
  };
};

export const StudentAcademicView = ({ currentUser }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('subjects'); // 'subjects', 'timetable', 'syllabus', 'resources', 'performance'
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [selectedSubjectModal, setSelectedSubjectModal] = useState(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [loading, setLoading] = useState(false);

  const studentName = currentUser?.name || 'Harry Potter';
  const className = currentUser?.className || 'Grade 10';
  const sectionName = currentUser?.sectionName || 'Section A';
  const admissionNumber = currentUser?.admissionNumber || 'ADM-2024-001';
  const rollNumber = currentUser?.rollNumber || '1001';

  const [subjects, setSubjects] = useState(() =>
    ENRICHED_STUDENT_SUBJECTS.map((s, i) => normalizeSubject(s, i))
  );

  // Dynamically load assigned curriculum for this class & section
  useEffect(() => {
    let isMounted = true;
    const fetchCurriculum = async () => {
      try {
        setLoading(true);
        const res = await curriculumService.getAll({ className, sectionName });
        if (isMounted && res?.curriculums && res.curriculums.length > 0) {
          const normalized = res.curriculums.map((c, i) => normalizeSubject(c, i));
          setSubjects(normalized);
        }
      } catch (err) {
        console.warn('Using default curriculum fallback:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCurriculum();
    return () => {
      isMounted = false;
    };
  }, [className, sectionName]);

  const classTeacher =
    currentUser?.classTeacher ||
    subjects.find((s) => (s.teacherRole || '').toLowerCase().includes('class teacher'))?.teacher ||
    'Sheikh Abdullah Al-Hafiz';

  const totalCredits = subjects.reduce((sum, s) => sum + (Number(s.credits) || 0), 0);
  const allMaterials = subjects.flatMap((s) =>
    (s.materials || []).map((m) => ({ ...m, subject: s.name, subjectCode: s.code }))
  );

  // Dynamic Timetable & Dynamic Performance
  const dynamicTimetable = buildDynamicTimetable(subjects);
  const performanceData = buildDynamicPerformance(subjects);

  // Filter subjects by search
  const filteredSubjects = subjects.filter(
    (s) =>
      s.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.code.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (s.teacher && s.teacher.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* ─── Hero Academic Student Banner ─────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-700/40">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 bottom-0 w-64 h-64 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-indigo-200 text-xs font-bold tracking-wide border border-white/10">
              <GraduationCap size={14} className="text-indigo-300" />
              <span>Student Academic Hub • Session 2025–2026</span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Academic Curriculum & Courses
              </h1>
              <p className="text-indigo-200/80 text-xs sm:text-sm mt-1 max-w-xl">
                Track your active courses, syllabus progress, weekly lecture schedule, and study materials for <span className="text-white font-semibold">{className} · {sectionName}</span>.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="bg-indigo-950/60 border border-indigo-400/20 px-3 py-1 rounded-lg text-indigo-200 font-semibold">
                👤 Student: <span className="text-white font-bold">{studentName}</span>
              </span>
              <span className="bg-indigo-950/60 border border-indigo-400/20 px-3 py-1 rounded-lg text-indigo-200 font-semibold">
                🏫 Class: <span className="text-white font-bold">{className} ({sectionName})</span>
              </span>
              <span className="bg-indigo-950/60 border border-indigo-400/20 px-3 py-1 rounded-lg text-indigo-200 font-semibold">
                🎫 Roll No: <span className="text-white font-bold">#{rollNumber}</span>
              </span>
            </div>
          </div>

          {/* Class Teacher Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 w-full sm:w-auto min-w-[280px] shadow-lg shrink-0">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-300">
              Assigned Class Teacher
            </p>
            <div className="flex items-center gap-3 mt-2">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-extrabold text-white text-base shadow-md">
                {classTeacher.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-bold text-white">{classTeacher}</p>
                <p className="text-[11px] text-indigo-200">Head of Academic Guidance</p>
                <p className="text-[10px] text-indigo-300/80 mt-0.5">Room 101 • Academic Block A</p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Metric Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
          {[
            { label: 'Enrolled Courses', value: `${subjects.length} Subjects`, icon: BookOpen, color: 'text-blue-300' },
            { label: 'Overall Attendance', value: '96.4%', icon: CheckCircle2, color: 'text-emerald-300' },
            { label: 'Cumulative GPA', value: performanceData.gpa, icon: Award, color: 'text-amber-300' },
            { label: 'Total Term Credits', value: `${totalCredits} Credits`, icon: Sparkles, color: 'text-purple-300' },
          ].map((item) => (
            <div key={item.label} className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <item.icon size={18} className={item.color} />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-black text-white leading-tight">{item.value}</p>
                <p className="text-[10px] text-indigo-200/80 font-medium">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Navigation Tabs for Student ──────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'subjects', label: 'My Subjects', count: subjects.length, icon: BookOpen },
            { id: 'timetable', label: 'Weekly Schedule', icon: Calendar },
            { id: 'syllabus', label: 'Syllabus & Units', icon: BookMarked },
            { id: 'resources', label: 'Study Resources', count: allMaterials.length, icon: FileText },
            { id: 'performance', label: 'Marks & Grades', icon: Award },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 scale-[1.02]'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-white' : 'text-slate-400'} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Portal Jump Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => navigate('/online-classes')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors border border-indigo-200 dark:border-indigo-800/50"
            title="Go to Live Classes"
          >
            <Video size={13} />
            <span>Online Classes</span>
          </button>
          <button
            onClick={() => navigate('/homework')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 hover:bg-purple-100 transition-colors border border-purple-200 dark:border-purple-800/50"
            title="Go to Homework"
          >
            <Send size={13} />
            <span>Homework</span>
          </button>
        </div>
      </div>

      {/* ─── TAB 1: ENROLLED SUBJECTS ─────────────────────────────────────── */}
      {activeTab === 'subjects' && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-sm">
            <div className="flex items-center gap-2 flex-1 px-2">
              <Search size={16} className="text-slate-400" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search enrolled subjects, code, or teacher..."
                className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none"
              />
            </div>
            {searchFilter && (
              <button onClick={() => setSearchFilter('')} className="text-xs text-slate-400 hover:text-slate-600">
                Clear
              </button>
            )}
          </div>

          {/* Subjects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSubjects.map((subject) => (
              <div
                key={subject.id}
                className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-indigo-500/40 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono text-[11px] font-extrabold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {subject.code}
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize border ${
                      subject.type === 'practical'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                    }`}>
                      {subject.type} • {subject.credits} Credits
                    </span>
                  </div>

                  {/* Title & Teacher */}
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {subject.name}
                  </h3>

                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 dark:text-slate-400">
                    <User size={13} className="text-slate-400 shrink-0" />
                    <span>{subject.teacher}</span>
                  </div>

                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                    <School size={13} className="shrink-0" />
                    <span>{subject.room}</span>
                  </div>

                  {/* Syllabus Progress */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-[11px] font-semibold text-slate-500">Syllabus Covered</span>
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{subject.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${subject.progress}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 truncate">
                      Current: {subject.currentChapter}
                    </p>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center gap-2 mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setSelectedSubjectModal(subject)}
                    className="flex-1 py-2 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <BookMarked size={13} />
                    <span>Syllabus Units</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedSubjectModal(subject);
                    }}
                    className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold transition-colors"
                    title="Course Material"
                  >
                    <Download size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 2: WEEKLY TIMETABLE ──────────────────────────────────────── */}
      {activeTab === 'timetable' && (
        <div className="space-y-4">
          {/* Day selection pill tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 shadow-sm">
            {TIMETABLE_DAYS.map((day) => {
              const isSelected = selectedDay === day;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`flex-1 min-w-[100px] py-2.5 rounded-xl text-xs font-bold transition-all text-center ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Daily Schedule List */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  {selectedDay}'s Class Schedule
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  Standard schedule for {className} · {sectionName}
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40">
                Regular Term Session
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {(dynamicTimetable[selectedDay] || []).map((slot, idx) => {
                if (slot.isBreak) {
                  return (
                    <div key={idx} className="py-3 px-4 my-1 bg-amber-50/60 dark:bg-amber-900/10 border border-dashed border-amber-200 dark:border-amber-800/30 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold">
                        <span>☕</span>
                        <span>{slot.subject}</span>
                      </div>
                      <span className="text-amber-600/80 dark:text-amber-500 text-[11px] font-semibold">{slot.time}</span>
                    </div>
                  );
                }

                return (
                  <div key={idx} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/30 px-3 rounded-xl transition-colors">
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200/50 dark:border-indigo-800/30 flex items-center justify-center font-extrabold text-indigo-600 dark:text-indigo-400 text-xs shrink-0">
                        P{slot.period}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                            {slot.subject}
                          </h4>
                          <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                            {slot.code}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                          <span className="flex items-center gap-1"><User size={12} /> {slot.teacher}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><School size={12} /> {slot.room}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <div className="flex items-center gap-1.5 text-slate-500 font-semibold text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
                        <Clock size={12} className="text-indigo-500" />
                        <span>{slot.time}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 3: SYLLABUS & UNITS ──────────────────────────────────────── */}
      {activeTab === 'syllabus' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjects.map((sub) => (
              <div key={sub.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">{sub.name}</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">{sub.code} • {sub.teacher}</p>
                  </div>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-1 rounded-lg">
                    {sub.progress}% Complete
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${sub.progress}%` }} />
                </div>

                {/* Units List */}
                <div className="space-y-2 pt-2 text-xs">
                  {sub.units.map((unit) => (
                    <div key={unit.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        {unit.status === 'completed' ? (
                          <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                        ) : unit.status === 'in-progress' ? (
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin shrink-0" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-600 shrink-0" />
                        )}
                        <span className={`font-semibold ${unit.status === 'completed' ? 'text-slate-700 dark:text-slate-300' : unit.status === 'in-progress' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-400'}`}>
                          {unit.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium shrink-0 ml-2">
                        {unit.duration}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 4: STUDY MATERIALS & RESOURCES ─────────────────────────────── */}
      {activeTab === 'resources' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
              Course Study Materials & Reference Documents
            </h3>
            <p className="text-slate-400 text-xs mt-0.5">
              Official lecture notes, handouts, formula sheets, and reading anthologies for {className}.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {allMaterials.map((mat, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 hover:bg-indigo-50/20 dark:hover:bg-indigo-900/10 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {mat.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {mat.subject} ({mat.subjectCode}) • {mat.size} • Uploaded {mat.date}
                    </p>
                  </div>
                </div>

                <a
                  href="#download"
                  onClick={(e) => { e.preventDefault(); alert(`Downloading: ${mat.name}`); }}
                  className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 transition-colors shrink-0"
                  title="Download Resource"
                >
                  <Download size={15} />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 5: ACADEMIC MARKS & PERFORMANCE ────────────────────────────── */}
      {activeTab === 'performance' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  Term 1 Academic Gradebook & Evaluation
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  Continuous Assessment (CA) and Mid-Term Exam evaluations.
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-400 uppercase">Term Average</p>
                <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">{performanceData.termAverage} • {performanceData.grade}</p>
              </div>
            </div>

            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3">Subject & Code</th>
                    <th className="pb-3 text-center">Midterm (100)</th>
                    <th className="pb-3 text-center">Internal (30)</th>
                    <th className="pb-3 text-center">Grade</th>
                    <th className="pb-3">Teacher Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {performanceData.records.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <span className="text-indigo-500 font-mono text-[11px] font-bold bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded">
                            {row.code}
                          </span>
                          <span>{row.subject}</span>
                        </div>
                      </td>
                      <td className="py-3.5 text-center font-extrabold text-slate-800 dark:text-slate-200">
                        {row.midterm} / 100
                      </td>
                      <td className="py-3.5 text-center font-semibold text-slate-700 dark:text-slate-300">
                        {row.internal} / 30
                      </td>
                      <td className="py-3.5 text-center">
                        <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full ${
                          row.grade.startsWith('A')
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                        }`}>
                          {row.grade}
                        </span>
                      </td>
                      <td className="py-3.5 text-slate-500 text-[11px] font-medium">
                        {row.remarks}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── Detail Modal for Selected Subject Units & Syllabus ──────────── */}
      {selectedSubjectModal && (
        <Modal
          open={!!selectedSubjectModal}
          onClose={() => setSelectedSubjectModal(null)}
          title={`${selectedSubjectModal.name} (${selectedSubjectModal.code})`}
          size="lg"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{selectedSubjectModal.teacher}</p>
                <p className="text-[11px] text-slate-400">{selectedSubjectModal.teacherRole} • {selectedSubjectModal.room}</p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                {selectedSubjectModal.credits} Credit Hours
              </span>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Course Curriculum Outline & Units
              </h4>
              <div className="space-y-2">
                {selectedSubjectModal.units.map((u) => (
                  <div key={u.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      {u.status === 'completed' ? (
                        <CheckCircle size={15} className="text-emerald-500 shrink-0" />
                      ) : u.status === 'in-progress' ? (
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin shrink-0" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-600 shrink-0" />
                      )}
                      <div>
                        <p className={`font-bold ${u.status === 'completed' ? 'text-slate-700 dark:text-slate-300' : u.status === 'in-progress' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>
                          {u.title}
                        </p>
                        <p className="text-[10px] text-slate-400">{u.duration}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                      u.status === 'completed' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' :
                      u.status === 'in-progress' ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400' :
                      'bg-slate-200 dark:bg-slate-700 text-slate-500'
                    }`}>
                      {u.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {selectedSubjectModal.materials?.length > 0 && (
              <div className="pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Linked Study Resources ({selectedSubjectModal.materials.length})
                </h4>
                <div className="space-y-2">
                  {selectedSubjectModal.materials.map((mat, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-700 text-xs">
                      <div className="flex items-center gap-2">
                        <FileText size={14} className="text-indigo-500" />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{mat.name}</span>
                        <span className="text-[10px] text-slate-400">({mat.size})</span>
                      </div>
                      <button
                        onClick={() => alert(`Downloading ${mat.name}`)}
                        className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1"
                      >
                        <Download size={11} /> Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default StudentAcademicView;
