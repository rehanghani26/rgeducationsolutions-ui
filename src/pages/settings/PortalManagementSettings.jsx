import React, { useState, useEffect } from 'react';
import {
  Globe,
  ExternalLink,
  Save,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Mail,
  Users,
  BookOpen,
  Trophy,
  Plus,
  Trash2,
  RefreshCw,
  Sparkles,
  Inbox,
  Building2,
  Image as ImageIcon,
  HelpCircle,
  FileText,
  Calendar,
  Compass,
  Tag,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api.js';

const PORTAL_URL = 'http://localhost:5174';

const DEFAULT_PORTAL_CONFIG = {
  enabled: true,
  schoolName: 'Apex International Academy',
  affiliation: 'Affiliated to Central Board & Cambridge Curriculum',
  affiliationCode: 'SCH-2026-CBSE-9912',
  tagline: 'Quality Education for a Better Future',
  heroImage:
    'https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=1600&auto=format&fit=crop',
  heroSubtitle:
    'Nurturing young minds towards excellence, character, and lifelong curiosity in a world-class environment.',
  admissionBadge: 'Admissions Open for Academic Year 2026-2027',
  aboutTitle: 'About Our School',
  aboutDescription:
    'Our school provides quality education in a safe and friendly environment with experienced teachers and modern learning facilities.',
  principalName: 'Dr. Eleanor Vance, Ph.D.',
  principalRole: 'Principal & Head of School',
  principalMessage:
    'Education is not merely the transmission of facts, but the ignition of curiosity, compassion, and leadership in every young mind that walks through our gates.',
  principalImage:
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop',
  metrics: [
    { label: 'Happy Students', value: '1,500+' },
    { label: 'Board Exam Distinction', value: '98.8%' },
    { label: 'Experienced Teachers', value: '50+' },
    { label: 'Sports & Clubs', value: '25+' },
  ],
  notices: [
    {
      title: 'Admissions Open for Academic Year 2026-2027 (Limited Seats Available)',
      date: 'Sep 05, 2026',
      tag: 'Admissions',
      urgent: true,
    },
    {
      title: 'Annual Inter-School Robotics & STEM Innovation Fair Next Friday',
      date: 'Sep 12, 2026',
      tag: 'Events',
      urgent: false,
    },
    {
      title: 'Term 1 Comprehensive Assessment Schedule & Parent-Teacher Meeting',
      date: 'Sep 20, 2026',
      tag: 'Academic',
      urgent: false,
    },
  ],
  academicWings: [
    {
      title: 'Pre-Primary Wing (Early Years)',
      grades: 'Playgroup to Kindergarten (Ages 3 – 5)',
      tag: 'Play & Discovery',
      description: 'A safe, sensory-rich play-based curriculum focusing on social skills, phonics, and motor coordination.',
      subjects: ['Phonics & Pre-Reading', 'Sensory Play & Art', 'Numbers & Shapes', 'Music & Movement'],
    },
    {
      title: 'Primary School Wing',
      grades: 'Grades 1 to 5 (Ages 6 – 10)',
      tag: 'Foundations & Inquiry',
      description: 'Building strong conceptual understanding in mathematics, languages, science, and collaborative projects.',
      subjects: ['Core Mathematics', 'English Language Arts', 'General Science', 'Social Studies'],
    },
    {
      title: 'Middle School Wing',
      grades: 'Grades 6 to 8 (Ages 11 – 13)',
      tag: 'Exploration & Analysis',
      description: 'Transitioning into independent analytical thinking, hands-on scientific experiments, and computer coding.',
      subjects: ['Physics, Chemistry, Biology', 'Advanced Algebra', 'Python & Digital Skills', 'Debate & World Cultures'],
    },
    {
      title: 'Senior Secondary Wing',
      grades: 'Grades 9 to 12 (Ages 14 – 18)',
      tag: 'Career & College Prep',
      description: 'Pre-university streams (Science, Commerce, Humanities) guided by experienced board educators.',
      subjects: ['Science: PCM / PCB', 'Commerce & Accountancy', 'Humanities & Social Sciences', 'SAT / College Counseling'],
    },
  ],
  facilities: [
    {
      title: 'Experienced Teachers',
      badge: 'Experienced',
      description: 'Passionate, certified faculty committed to student mentorship and academic success.',
      icon: 'teachers',
      gradient: 'from-blue-500 to-indigo-600',
    },
    {
      title: 'Good Classrooms',
      badge: 'Modern',
      description: 'Spacious, climate-controlled, smart interactive digital board learning spaces.',
      icon: 'classrooms',
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      title: 'Sports & Activities',
      badge: 'Sports & Events',
      description: 'Olympic-standard sports courts, football turf, performing arts, and annual fest.',
      icon: 'activities',
      gradient: 'from-amber-500 to-orange-600',
    },
  ],
  extendedFacilities: [
    {
      title: 'AI & Robotics Laboratories',
      desc: 'Coding, AI literacy, 3D printing and STEM robotics workstations.',
      icon: 'compass',
    },
    {
      title: 'Central Media Library',
      desc: 'Over 15,000 physical volumes and digital academic research journals.',
      icon: 'book',
    },
    {
      title: 'GPS-Tracked Safe Transport',
      desc: 'Climate-controlled bus fleet with real-time GPS tracking and trained attendants.',
      icon: 'bus',
    },
  ],
  admissionSteps: [
    {
      step: '01',
      title: 'Submit Online Inquiry',
      subtitle: 'Quick & Transparent',
      description: 'Fill out the simple admission inquiry form online. Our academic counselors will contact you within 24 hours.',
      badge: 'Step 1: Get Started',
    },
    {
      step: '02',
      title: 'Campus Tour & Assessment',
      subtitle: 'Discover & Interact',
      description: 'Experience our classrooms, sports complex, and labs. Students participate in a friendly, age-appropriate conversation.',
      badge: 'Step 2: Experience',
    },
    {
      step: '03',
      title: 'Enrollment & Welcome',
      subtitle: 'Join the Family',
      description: 'Finalize document verification, receive your ERP parent credentials, uniform kit, and attend orientation!',
      badge: 'Step 3: Welcome',
    },
  ],
  ageCriteria: [
    { grade: 'Pre-Nursery / Playgroup', age: '2.5 – 3 Years', cutoff: 'As of March 31, 2026' },
    { grade: 'Kindergarten 1 (LKG)', age: '3.5 – 4 Years', cutoff: 'As of March 31, 2026' },
    { grade: 'Kindergarten 2 (UKG)', age: '4.5 – 5 Years', cutoff: 'As of March 31, 2026' },
    { grade: 'Grade 1', age: '5.5 – 6.5 Years', cutoff: 'As of March 31, 2026' },
    { grade: 'Grade 2 to Grade 5', age: 'Age appropriate + Report card', cutoff: 'Subject to seat availability' },
    { grade: 'Grade 6 to Grade 10', age: 'Diagnostic assessment & interview', cutoff: 'Subject to seat availability' },
  ],
  documents: [
    'Child’s Official Birth Certificate (Municipal copy)',
    'Recent passport-sized color photographs of student (4 copies)',
    'Photographs of Parents / Guardians (2 copies each)',
    'Academic progress report card from previous school',
    'Original Transfer Certificate (TC)',
    'Proof of residential address',
    'Immunization medical record',
  ],
  galleryItems: [
    {
      id: 1,
      title: 'Smart Digital Classrooms',
      category: 'classrooms',
      tag: 'Interactive Tech',
      img: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 2,
      title: 'Advanced Science & Robotics Lab',
      category: 'academics',
      tag: 'Innovation & STEM',
      img: 'https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 3,
      title: 'Annual Athletics & Football Field',
      category: 'sports',
      tag: 'Sports Complex',
      img: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 4,
      title: 'Creative Performing Arts Center',
      category: 'cultural',
      tag: 'Music & Drama',
      img: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=800&auto=format&fit=crop',
    },
  ],
  faqs: [
    {
      q: 'What curriculum and accreditation does the school follow?',
      a: 'Our school follows a globally benchmarked dual curriculum combining high academic standards with STEM, humanities, and practical project-based learning.',
      tag: 'Curriculum',
    },
    {
      q: 'How does the school ensure student safety and campus security?',
      a: 'We maintain 24/7 CCTV surveillance, biometric security gates, verified background checks for all faculty, and GPS-tracked school transport.',
      tag: 'Safety & Security',
    },
    {
      q: 'What is the teacher-to-student ratio in classrooms?',
      a: 'We maintain an optimal ratio of 1:18 to ensure every child receives personalized attention, guidance, and emotional support.',
      tag: 'Faculty & Mentorship',
    },
    {
      q: 'What sports and extracurricular activities are offered?',
      a: 'Students can participate in football, swimming, cricket, robotics, music, drama, debate, chess, and international Model UN conferences.',
      tag: 'Sports & Arts',
    },
  ],
  milestones: [
    { year: '2004', title: 'Campus Founded', desc: 'Started with 120 students and a vision for holistic schooling.' },
    { year: '2012', title: 'STEM & Robotics Hub', desc: 'Introduced 3D printing and coding for middle schoolers.' },
    { year: '2018', title: 'National Sports Award', desc: 'Recognized for top sporting infrastructure in the state.' },
    { year: '2026', title: 'Global Dual Accreditation', desc: 'Now serving over 1,500 students with 100% board distinctions.' },
  ],
  departments: [
    {
      title: 'Admissions & Campus Tours',
      phone: '+1 (555) 234-5678',
      email: 'admissions@apexschool.edu',
      hours: 'Mon – Sat: 8:00 AM – 4:00 PM',
    },
    {
      title: 'Principal & Academic Office',
      phone: '+1 (555) 234-5680',
      email: 'principal@apexschool.edu',
      hours: 'By prior appointment only',
    },
    {
      title: 'Transport & Safety Helpline',
      phone: '+1 (555) 234-5699',
      email: 'transport@apexschool.edu',
      hours: '6:30 AM – 6:00 PM on school days',
    },
  ],
  contact: {
    address: '124 Academic Enclave, Knowledge Park, City Center',
    phone: '+1 (555) 234-5678',
    email: 'admissions@apexschool.edu',
    timing: 'Monday – Friday: 08:00 AM – 03:30 PM | Saturday: 08:30 AM – 12:30 PM',
  },
};

const PortalManagementSettings = ({ settings, handleChange }) => {
  const [activeSubTab, setActiveSubTab] = useState('hero');
  const [inquiries, setInquiries] = useState([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);
  const [saving, setSaving] = useState(false);
  const [portal, setPortal] = useState(DEFAULT_PORTAL_CONFIG);

  // Sync settings when loaded or fetch live from /portal/public
  useEffect(() => {
    if (settings?.portalSettings && Object.keys(settings.portalSettings).length > 0) {
      setPortal((prev) => ({
        ...prev,
        ...settings.portalSettings,
        contact: { ...prev.contact, ...(settings.portalSettings.contact || {}) },
      }));
    } else {
      api
        .get('/portal/public')
        .then((res) => {
          const payload = res.data?.portal || res.data?.data;
          if (payload) {
            setPortal((prev) => ({
              ...prev,
              ...payload,
              contact: { ...prev.contact, ...(payload.contact || {}) },
            }));
          }
        })
        .catch(() => {});
    }
  }, [settings]);

  // Fetch inquiries from backend
  const fetchInquiries = () => {
    setLoadingInquiries(true);
    api
      .get('/portal/inquiries')
      .then((res) => {
        if (res.data?.inquiries) {
          setInquiries(res.data.inquiries);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingInquiries(false));
  };

  useEffect(() => {
    if (activeSubTab === 'inquiries') {
      fetchInquiries();
    }
  }, [activeSubTab]);

  const handleFieldChange = (field, value) => {
    setPortal((prev) => ({ ...prev, [field]: value }));
  };

  const handleContactChange = (field, value) => {
    setPortal((prev) => ({
      ...prev,
      contact: {
        ...prev.contact,
        [field]: value,
      },
    }));
  };

  // Facility Handlers
  const handleFacilityChange = (index, key, value) => {
    setPortal((prev) => {
      const updated = [...prev.facilities];
      updated[index] = { ...updated[index], [key]: value };
      return { ...prev, facilities: updated };
    });
  };

  const handleAddFacility = () => {
    setPortal((prev) => ({
      ...prev,
      facilities: [
        ...prev.facilities,
        {
          title: 'Specialty Resource Wing',
          badge: 'New Facility',
          description: 'Custom learning infrastructure with interactive technology.',
          icon: 'classrooms',
          gradient: 'from-purple-500 to-indigo-600',
        },
      ],
    }));
  };

  const handleRemoveFacility = (index) => {
    setPortal((prev) => ({
      ...prev,
      facilities: prev.facilities.filter((_, i) => i !== index),
    }));
  };

  // Notice Handlers
  const handleNoticeChange = (index, key, value) => {
    setPortal((prev) => {
      const updated = [...prev.notices];
      updated[index] = { ...updated[index], [key]: value };
      return { ...prev, notices: updated };
    });
  };

  const handleAddNotice = () => {
    setPortal((prev) => ({
      ...prev,
      notices: [
        {
          title: 'New Announcement / Important Circular',
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          tag: 'General',
          urgent: false,
        },
        ...prev.notices,
      ],
    }));
  };

  const handleRemoveNotice = (index) => {
    setPortal((prev) => ({
      ...prev,
      notices: prev.notices.filter((_, i) => i !== index),
    }));
  };

  // FAQ Handlers
  const handleFaqChange = (index, key, value) => {
    setPortal((prev) => {
      const updated = [...prev.faqs];
      updated[index] = { ...updated[index], [key]: value };
      return { ...prev, faqs: updated };
    });
  };

  const handleAddFaq = () => {
    setPortal((prev) => ({
      ...prev,
      faqs: [
        ...prev.faqs,
        {
          q: 'Frequently asked parent question title here?',
          a: 'Comprehensive answer detailing school policy, timing, or criteria.',
          tag: 'General',
        },
      ],
    }));
  };

  const handleRemoveFaq = (index) => {
    setPortal((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index),
    }));
  };

  // Gallery Handlers
  const handleGalleryChange = (index, key, value) => {
    setPortal((prev) => {
      const updated = [...prev.galleryItems];
      updated[index] = { ...updated[index], [key]: value };
      return { ...prev, galleryItems: updated };
    });
  };

  const handleAddGalleryItem = () => {
    setPortal((prev) => ({
      ...prev,
      galleryItems: [
        ...prev.galleryItems,
        {
          id: Date.now(),
          title: 'Campus Life Milestone',
          category: 'classrooms',
          tag: 'Campus Moment',
          img: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?q=80&w=800&auto=format&fit=crop',
        },
      ],
    }));
  };

  const handleRemoveGalleryItem = (index) => {
    setPortal((prev) => ({
      ...prev,
      galleryItems: prev.galleryItems.filter((_, i) => i !== index),
    }));
  };

  // Metric Handlers
  const handleMetricChange = (index, key, value) => {
    setPortal((prev) => {
      const updated = [...prev.metrics];
      updated[index] = { ...updated[index], [key]: value };
      return { ...prev, metrics: updated };
    });
  };

  // Academic Wing Handlers
  const handleWingChange = (index, key, value) => {
    setPortal((prev) => {
      const updated = [...prev.academicWings];
      updated[index] = { ...updated[index], [key]: value };
      return { ...prev, academicWings: updated };
    });
  };

  // Save Settings to Backend
  const handleSavePortal = async () => {
    setSaving(true);
    try {
      // Save directly to portal endpoint
      await api.put('/portal/settings', portal);
      toast.success('Public School Portal settings successfully saved and synced!');
    } catch (err) {
      // Fallback via /erp/settings
      try {
        await api.put('/erp/settings', {
          ...settings,
          portalSettings: portal,
        });
        toast.success('Public School Portal settings saved successfully!');
      } catch (innerErr) {
        toast.error('Failed to save portal settings.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateInquiryStatus = async (id, newStatus) => {
    try {
      await api.patch(`/portal/inquiries/${id}`, { status: newStatus });
      setInquiries((prev) =>
        prev.map((inq) => (inq._id === id ? { ...inq, status: newStatus } : inq))
      );
      toast.success(`Inquiry marked as ${newStatus.toUpperCase()}`);
    } catch (err) {
      toast.error('Failed to update inquiry status');
    }
  };

  const handleDeleteInquiry = async (id) => {
    if (!window.confirm('Are you sure you want to delete this inquiry?')) return;
    try {
      await api.delete(`/portal/inquiries/${id}`);
      setInquiries((prev) => prev.filter((inq) => inq._id !== id));
      toast.success('Inquiry deleted successfully');
    } catch (err) {
      toast.error('Failed to delete inquiry');
    }
  };

  return (
    <div className="space-y-6">
      {/* ── TOP HEADER BANNER WITH DIRECT PORTAL LAUNCH ── */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
            <Globe className="text-indigo-200" size={24} />
            <h3 className="font-heading font-black text-xl">Public School Portal Control CMS</h3>
            <span className="bg-emerald-500 text-white text-[10px] font-black uppercase px-3 py-0.5 rounded-full shadow-xs">
              Live &amp; Synced
            </span>
          </div>
          <p className="text-xs text-indigo-100 max-w-2xl leading-relaxed">
            All text, hero images, notices, 3 facilities, academic wings, admission requirements, gallery photos, and contact info are controlled directly from this server management desk and sync with <strong className="underline text-white">{PORTAL_URL}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0 flex-wrap">
          <a
            href={PORTAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-indigo-700 font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all hover:scale-105"
          >
            <ExternalLink size={15} /> Open Live Portal
          </a>
          <button
            type="button"
            onClick={handleSavePortal}
            disabled={saving}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-md transition-all hover:scale-105 disabled:opacity-60"
          >
            <Save size={15} /> {saving ? 'Saving...' : 'Save All Settings'}
          </button>
        </div>
      </div>

      {/* ── NAVIGATION TABS (9 SUB-TABS) ── */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto text-xs font-bold scrollbar-thin">
        {[
          { id: 'hero', label: '1. Identity & Hero', icon: ImageIcon },
          { id: 'notices', label: `2. Notices (${portal.notices?.length || 0})`, icon: Sparkles },
          { id: 'about', label: '3. About & Leadership', icon: Building2 },
          { id: 'wings', label: '4. Academic Wings', icon: BookOpen },
          { id: 'facilities', label: '5. Facilities (3 Cards)', icon: Trophy },
          { id: 'admissions', label: '6. Admissions & Criteria', icon: Calendar },
          { id: 'gallery', label: `7. Photo Gallery (${portal.galleryItems?.length || 0})`, icon: ImageIcon },
          { id: 'faqs', label: `8. FAQs (${portal.faqs?.length || 0})`, icon: HelpCircle },
          { id: 'contact', label: '9. Contact & Timings', icon: Phone },
          { id: 'inquiries', label: `10. Inquiries Inbox (${inquiries.length})`, icon: Inbox },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Icon size={14} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* 1. TAB: HERO & IDENTITY                                            */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'hero' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="text-indigo-600" size={16} /> School Identity &amp; Headline
              </h4>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                  School Name *
                </label>
                <input
                  type="text"
                  value={portal.schoolName}
                  onChange={(e) => handleFieldChange('schoolName', e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                  Tagline (One Short Line) *
                </label>
                <input
                  type="text"
                  value={portal.tagline}
                  onChange={(e) => handleFieldChange('tagline', e.target.value)}
                  placeholder="Quality Education for a Better Future"
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                  Affiliation / Accreditation Note
                </label>
                <input
                  type="text"
                  value={portal.affiliation}
                  onChange={(e) => handleFieldChange('affiliation', e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                  Affiliation Code (Shown in Footer)
                </label>
                <input
                  type="text"
                  value={portal.affiliationCode || 'SCH-2026-CBSE-9912'}
                  onChange={(e) => handleFieldChange('affiliationCode', e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                  Admission Ribbon Badge (Top Banner)
                </label>
                <input
                  type="text"
                  value={portal.admissionBadge}
                  onChange={(e) => handleFieldChange('admissionBadge', e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-4 bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <ImageIcon className="text-purple-600" size={16} /> Hero Visual &amp; Subtitle
              </h4>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                  Big Hero Background Image URL *
                </label>
                <input
                  type="text"
                  value={portal.heroImage}
                  onChange={(e) => handleFieldChange('heroImage', e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
                <div className="mt-2 h-36 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-900 relative">
                  <img
                    src={portal.heroImage}
                    alt="Hero Preview"
                    className="w-full h-full object-cover opacity-80"
                    onError={(e) => {
                      e.target.src =
                        'https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=1600&auto=format&fit=crop';
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white font-extrabold text-xs">
                    Hero Preview Banner
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                  Hero Paragraph / Subtitle
                </label>
                <textarea
                  rows={3}
                  value={portal.heroSubtitle}
                  onChange={(e) => handleFieldChange('heroSubtitle', e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* 4 Metric Counters */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="text-amber-500" size={16} /> 4 Hero Key Metrics
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {portal.metrics.map((metric, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2"
                >
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase">
                    Counter {idx + 1}
                  </label>
                  <input
                    type="text"
                    value={metric.value}
                    onChange={(e) => handleMetricChange(idx, 'value', e.target.value)}
                    placeholder="e.g. 1,500+"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-black text-indigo-600 focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="text"
                    value={metric.label}
                    onChange={(e) => handleMetricChange(idx, 'label', e.target.value)}
                    placeholder="e.g. Happy Students"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* 2. TAB: NOTICES TICKER                                             */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'notices' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Live Notice Board &amp; Bulletin Ticker
              </h4>
              <p className="text-xs text-slate-500">
                These notices cycle through the top bulletin ticker on the school portal in real time.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddNotice}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-xs"
            >
              <Plus size={14} /> Add Notice
            </button>
          </div>

          <div className="space-y-3">
            {portal.notices.map((notice, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 w-full">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Notice Title / Announcement
                    </label>
                    <input
                      type="text"
                      value={notice.title}
                      onChange={(e) => handleNoticeChange(idx, 'title', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                        Category Tag
                      </label>
                      <input
                        type="text"
                        value={notice.tag}
                        onChange={(e) => handleNoticeChange(idx, 'tag', e.target.value)}
                        placeholder="Admissions"
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                        Date Display
                      </label>
                      <input
                        type="text"
                        value={notice.date}
                        onChange={(e) => handleNoticeChange(idx, 'date', e.target.value)}
                        placeholder="Sep 05, 2026"
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-center">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notice.urgent}
                      onChange={(e) => handleNoticeChange(idx, 'urgent', e.target.checked)}
                      className="rounded text-rose-600 focus:ring-rose-500"
                    />
                    <span className={notice.urgent ? 'text-rose-600 font-extrabold' : ''}>Urgent</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleRemoveNotice(idx)}
                    className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* 3. TAB: ABOUT OUR SCHOOL & LEADERSHIP                              */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'about' && (
        <div className="space-y-6">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="text-indigo-600" size={16} /> About School Information
            </h4>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                Section Heading
              </label>
              <input
                type="text"
                value={portal.aboutTitle}
                onChange={(e) => handleFieldChange('aboutTitle', e.target.value)}
                placeholder="About Our School"
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                About Description (Exact Short Paragraph) *
              </label>
              <textarea
                rows={3}
                value={portal.aboutDescription}
                onChange={(e) => handleFieldChange('aboutDescription', e.target.value)}
                placeholder="Our school provides quality education in a safe and friendly environment with experienced teachers and modern learning facilities."
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 leading-relaxed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="text-purple-600" size={16} /> Principal &amp; Academic Director Message
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                    Principal Name
                  </label>
                  <input
                    type="text"
                    value={portal.principalName}
                    onChange={(e) => handleFieldChange('principalName', e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                    Role Title
                  </label>
                  <input
                    type="text"
                    value={portal.principalRole || 'Principal & Head of School'}
                    onChange={(e) => handleFieldChange('principalRole', e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                  Principal Photo URL
                </label>
                <input
                  type="text"
                  value={portal.principalImage || ''}
                  onChange={(e) => handleFieldChange('principalImage', e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                  Director's Quotation / Welcome Note
                </label>
                <textarea
                  rows={4}
                  value={portal.principalMessage}
                  onChange={(e) => handleFieldChange('principalMessage', e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 dark:text-white leading-relaxed"
                />
              </div>
            </div>

            {/* Milestones */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Trophy className="text-amber-500" size={16} /> Key School Milestones
              </h4>
              <div className="space-y-3">
                {portal.milestones?.map((m, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                    <span className="font-heading font-black text-indigo-600 text-sm">{m.year}</span>
                    <div className="flex-1">
                      <div className="font-bold text-xs text-slate-900 dark:text-white">{m.title}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">{m.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* 4. TAB: ACADEMIC WINGS                                             */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'wings' && (
        <div className="space-y-6">
          <div>
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
              Academic Wings &amp; Curricula
            </h4>
            <p className="text-xs text-slate-500">
              Manage details, grade spans, and subject matrices across the 4 school divisions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {portal.academicWings?.map((wing, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={wing.title}
                    onChange={(e) => handleWingChange(idx, 'title', e.target.value)}
                    className="font-heading font-black text-sm text-slate-900 dark:text-white bg-transparent border-b border-transparent focus:border-indigo-500 focus:outline-none"
                  />
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                    {wing.tag}
                  </span>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Grade Span &amp; Age
                  </label>
                  <input
                    type="text"
                    value={wing.grades}
                    onChange={(e) => handleWingChange(idx, 'grades', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Wing Pedagogical Overview
                  </label>
                  <textarea
                    rows={2}
                    value={wing.description}
                    onChange={(e) => handleWingChange(idx, 'description', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* 5. TAB: FACILITIES (THE REQUESTED 3 + EXTENDED)                    */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'facilities' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Our Facilities (3 Core Cards + Extended)
              </h4>
              <p className="text-xs text-slate-500">
                Configure the 3 primary facility cards: <strong>Experienced Teachers</strong>, <strong>Good Classrooms</strong>, and <strong>Sports &amp; Activities</strong>.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddFacility}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-xs"
            >
              <Plus size={14} /> Add Facility
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {portal.facilities.map((fac, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    Card #{idx + 1}
                  </span>
                  {portal.facilities.length > 3 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveFacility(idx)}
                      className="text-rose-500 hover:text-rose-700 text-xs font-bold"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Facility Title *
                  </label>
                  <input
                    type="text"
                    value={fac.title}
                    onChange={(e) => handleFacilityChange(idx, 'title', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Badge Label *
                  </label>
                  <input
                    type="text"
                    value={fac.badge}
                    onChange={(e) => handleFacilityChange(idx, 'badge', e.target.value)}
                    placeholder="Experienced / Modern / Sports & Events"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Description *
                  </label>
                  <textarea
                    rows={3}
                    value={fac.description}
                    onChange={(e) => handleFacilityChange(idx, 'description', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* 6. TAB: ADMISSIONS & CRITERIA                                      */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'admissions' && (
        <div className="space-y-6">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="text-emerald-500" size={16} /> 3-Step Admissions Roadmap
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {portal.admissionSteps?.map((step, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                    {step.step}
                  </span>
                  <div className="font-bold text-xs text-slate-900 dark:text-white">{step.title}</div>
                  <div className="text-[11px] text-slate-500 leading-relaxed">{step.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Age Criteria Table */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
              Age Criteria Table
            </h4>
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {portal.ageCriteria?.map((crit, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">{crit.grade}</span>
                  <span className="text-indigo-600 font-extrabold">{crit.age}</span>
                  <span className="text-slate-400 text-[11px]">{crit.cutoff}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* 7. TAB: PHOTO GALLERY                                              */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'gallery' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Campus Life Photo Showcase
              </h4>
              <p className="text-xs text-slate-500">
                Add and manage high-resolution photos displayed in the interactive filterable gallery.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddGalleryItem}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-xs"
            >
              <Plus size={14} /> Add Photo
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {portal.galleryItems.map((item, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs space-y-2 p-3"
              >
                <div className="h-32 rounded-xl overflow-hidden bg-slate-100 relative">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src =
                        'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=800&auto=format&fit=crop';
                    }}
                  />
                  <span className="absolute top-2 left-2 bg-black/60 text-white text-[9px] font-bold px-2 py-0.5 rounded">
                    {item.category}
                  </span>
                </div>

                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => handleGalleryChange(idx, 'title', e.target.value)}
                  placeholder="Photo Title"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-900 dark:text-white"
                />

                <input
                  type="text"
                  value={item.img}
                  onChange={(e) => handleGalleryChange(idx, 'img', e.target.value)}
                  placeholder="Image URL"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-[11px] text-slate-500 font-mono"
                />

                <div className="flex items-center justify-between pt-1">
                  <select
                    value={item.category}
                    onChange={(e) => handleGalleryChange(idx, 'category', e.target.value)}
                    className="bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-[10px] font-bold px-2 py-1 rounded border border-slate-200 dark:border-slate-700"
                  >
                    <option value="classrooms">Classrooms</option>
                    <option value="academics">Academics</option>
                    <option value="sports">Sports</option>
                    <option value="cultural">Cultural</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => handleRemoveGalleryItem(idx)}
                    className="text-rose-500 hover:text-rose-700 text-xs p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* 8. TAB: FAQS                                                       */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'faqs' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Frequently Asked Questions (Accordion)
              </h4>
              <p className="text-xs text-slate-500">
                Common answers for prospective parents displayed on Home and Admissions pages.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddFaq}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-xs"
            >
              <Plus size={14} /> Add FAQ
            </button>
          </div>

          <div className="space-y-3">
            {portal.faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <input
                    type="text"
                    value={faq.q}
                    onChange={(e) => handleFaqChange(idx, 'q', e.target.value)}
                    placeholder="Question Title"
                    className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    value={faq.tag || 'General'}
                    onChange={(e) => handleFaqChange(idx, 'tag', e.target.value)}
                    placeholder="Category"
                    className="w-28 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-bold text-indigo-600"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveFaq(idx)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={faq.a}
                  onChange={(e) => handleFaqChange(idx, 'a', e.target.value)}
                  placeholder="Answer explanation..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* 9. TAB: CONTACT & SCHOOL TIMINGS                                   */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'contact' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="text-indigo-600" size={16} /> Campus Location &amp; Contact
              </h4>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                  School Physical Address *
                </label>
                <textarea
                  rows={2}
                  value={portal.contact.address}
                  onChange={(e) => handleContactChange('address', e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                  Admissions Phone Number *
                </label>
                <input
                  type="text"
                  value={portal.contact.phone}
                  onChange={(e) => handleContactChange('phone', e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                  Admissions Email *
                </label>
                <input
                  type="email"
                  value={portal.contact.email}
                  onChange={(e) => handleContactChange('email', e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="text-amber-500" size={16} /> Official School Timings
              </h4>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                  School Timing Schedule *
                </label>
                <input
                  type="text"
                  value={portal.contact.timing}
                  onChange={(e) => handleContactChange('timing', e.target.value)}
                  placeholder="Monday – Friday: 08:00 AM – 03:30 PM | Saturday: 08:30 AM – 12:30 PM"
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white leading-relaxed"
                />
              </div>

              {/* Department Contact Lines */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-3">
                <h5 className="font-extrabold text-xs text-slate-500 uppercase">
                  Department Directories
                </h5>
                {portal.departments?.map((dep, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                    <div className="font-bold text-slate-900 dark:text-white">{dep.title}</div>
                    <div className="text-[11px] text-slate-500 flex items-center justify-between">
                      <span>{dep.phone}</span>
                      <span>{dep.hours}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* 10. TAB: VISITOR & ADMISSION INQUIRIES INBOX                       */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'inquiries' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Public Portal Admission Leads ({inquiries.length})
              </h4>
              <p className="text-xs text-slate-500">
                Inquiries submitted by parents through the public website.
              </p>
            </div>
            <button
              type="button"
              onClick={fetchInquiries}
              disabled={loadingInquiries}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
            >
              <RefreshCw size={12} className={loadingInquiries ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>

          {inquiries.length === 0 ? (
            <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
              <Inbox size={32} className="mx-auto text-slate-400 mb-2" />
              <h5 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                No Inquiries Received Yet
              </h5>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                When visitors or parents submit an admission inquiry on the public website, they will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {inquiries.map((inq) => (
                <div
                  key={inq._id}
                  className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="font-extrabold text-sm text-slate-900 dark:text-white">
                          {inq.name}
                        </h5>
                        <span
                          className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                            inq.status === 'new'
                              ? 'bg-rose-100 text-rose-700'
                              : inq.status === 'contacted'
                              ? 'bg-amber-100 text-amber-700'
                              : inq.status === 'admitted'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {inq.status || 'NEW'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Received: {new Date(inq.createdAt).toLocaleString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={inq.status || 'new'}
                        onChange={(e) => handleUpdateInquiryStatus(inq._id, e.target.value)}
                        className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 dark:text-slate-200"
                      >
                        <option value="new">Mark New</option>
                        <option value="contacted">Mark Contacted</option>
                        <option value="admitted">Mark Enrolled / Admitted</option>
                        <option value="closed">Mark Closed</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => handleDeleteInquiry(inq._id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">
                        Phone Number
                      </span>
                      <a href={`tel:${inq.phone}`} className="text-indigo-600 font-bold hover:underline">
                        {inq.phone}
                      </a>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">
                        Email Address
                      </span>
                      <a href={`mailto:${inq.email}`} className="text-indigo-600 font-bold hover:underline">
                        {inq.email}
                      </a>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">
                        Student / Grade Applying
                      </span>
                      <span className="text-slate-800 dark:text-slate-200 font-bold">
                        {inq.studentName ? `${inq.studentName} — ` : ''}
                        {inq.gradeApplyingFor || 'Grade 1'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-700 dark:text-slate-300">
                    <span className="font-bold text-slate-500 block mb-0.5 text-[10px] uppercase">
                      Inquiry Message:
                    </span>
                    {inq.message}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PortalManagementSettings;
