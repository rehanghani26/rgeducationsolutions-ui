/**
 * @file TemplatesModule.jsx
 * @description Document Template Manager tab.
 * Browses all 20 built-in templates and admin custom templates,
 * preview them with sample data, and open the visual customizer studio.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Layout,
  Plus,
  Palette,
  Eye,
  Trash2,
  Edit,
  GraduationCap,
  Users,
  Briefcase,
  Award,
  Sparkles,
  X,
} from 'lucide-react';
import { ALL_TEMPLATES, getTemplateById, applyTemplateOverrides } from '../templates/registry.js';
import { getCustomTemplates, deleteCustomTemplate } from '../services/documentService.js';
import TemplateCustomizerModal from './TemplateCustomizerModal.jsx';
import IdCardPreview from './IdCardPreview.jsx';
import CertificatePreview from './CertificatePreview.jsx';
import { MOCK_STUDENT_DATA, MOCK_CERTIFICATE_DATA } from '../constants/documentConstants.js';

export default function TemplatesModule({ schoolSettings = {}, userRole = '' }) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [customTemplates, setCustomTemplates] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals & Preview
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [editingCustomTemplate, setEditingCustomTemplate] = useState(null);
  const [previewingTemplate, setPreviewingTemplate] = useState(null);

  const canManage = ['super-admin', 'school-admin', 'principal', 'director'].includes(userRole);

  useEffect(() => {
    loadCustomTemplates();
  }, []);

  const loadCustomTemplates = async () => {
    setLoading(true);
    try {
      const res = await getCustomTemplates();
      if (res?.templates) setCustomTemplates(res.templates);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCustom = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete custom template "${name}"?`)) {
      try {
        await deleteCustomTemplate(id);
        loadCustomTemplates();
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Combine built-in + custom
  const allDisplayTemplates = useMemo(() => {
    const builtInFormatted = ALL_TEMPLATES.map((t) => ({
      ...t,
      isCustom: false,
    }));

    const customFormatted = customTemplates.map((ct) => {
      const base = ALL_TEMPLATES.find((b) => b.id === ct.baseTemplateId) || ALL_TEMPLATES[0];
      return {
        ...applyTemplateOverrides(base, ct.configuration),
        id: ct._id,
        rawCustomId: ct._id,
        name: ct.name,
        category: ct.category,
        orientation: base.orientation || 'portrait',
        isCustom: true,
        configuration: ct.configuration,
        baseTemplateId: ct.baseTemplateId,
      };
    });

    const combined = [...builtInFormatted, ...customFormatted];

    if (selectedCategory === 'ALL') return combined;
    return combined.filter((t) => t.category === selectedCategory);
  }, [customTemplates, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Layout size={18} className="text-violet-400" />
            Template Gallery & Studio
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            20 professional built-in templates + unlimited custom branded variations
          </p>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={() => {
              setEditingCustomTemplate(null);
              setIsCustomizerOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg hover:shadow-violet-500/20 transition cursor-pointer"
          >
            <Sparkles size={15} />
            <span>Open Customizer Studio</span>
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'ALL', label: 'All Templates', icon: Layout },
          { id: 'student-id-card', label: 'Student ID Cards', icon: GraduationCap },
          { id: 'teacher-id-card', label: 'Teacher ID Cards', icon: Users },
          { id: 'staff-id-card', label: 'Staff ID Cards', icon: Briefcase },
          { id: 'certificate', label: 'Certificates', icon: Award },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = selectedCategory === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedCategory(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                isActive
                  ? 'bg-violet-600 text-white border-violet-500 shadow-md shadow-violet-500/20'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Template Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {allDisplayTemplates.map((template) => {
          const isCert = template.category === 'certificate';
          return (
            <div
              key={template.id}
              className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition shadow-lg group"
            >
              <div>
                {/* Badges row */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                    {template.category.replace(/-/g, ' ')}
                  </span>
                  {template.isCustom ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-violet-500/20 text-violet-300 border border-violet-500/30 flex items-center gap-1">
                      <Sparkles size={10} />
                      Custom
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 font-medium">Built-in</span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-white group-hover:text-violet-400 transition">
                  {template.name}
                </h4>
                <div className="text-[11px] text-slate-400 mt-1 capitalize">
                  Layout: {template.orientation || 'Standard'}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewingTemplate(template)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition cursor-pointer"
                >
                  <Eye size={13} />
                  Preview
                </button>

                <div className="flex items-center gap-1">
                  {canManage && (
                    <button
                      type="button"
                      onClick={() => {
                        if (template.isCustom) {
                          setEditingCustomTemplate(template);
                        } else {
                          setEditingCustomTemplate({
                            name: `${template.name} Branded`,
                            baseTemplateId: template.id,
                            category: template.category,
                            configuration: {
                              primaryColor: '#1e3a8a',
                              secondaryColor: '#3b82f6',
                              fontFamily: 'Inter',
                              showQRCode: true,
                              showPhoto: true,
                              showSignature: true,
                            },
                          });
                        }
                        setIsCustomizerOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-violet-400 hover:bg-slate-800 rounded-lg transition"
                      title="Customize / Clone"
                    >
                      <Palette size={15} />
                    </button>
                  )}

                  {template.isCustom && canManage && (
                    <button
                      type="button"
                      onClick={() => handleDeleteCustom(template.rawCustomId, template.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                      title="Delete Custom Template"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preview Modal */}
      {previewingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl h-[88vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center gap-2 text-xs font-semibold text-white">
                <span>Template Preview: {previewingTemplate.name}</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewingTemplate(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-hidden p-4">
              {previewingTemplate.category === 'certificate' ? (
                <CertificatePreview
                  template={previewingTemplate}
                  certificateData={MOCK_CERTIFICATE_DATA}
                  schoolSettings={schoolSettings}
                  title={previewingTemplate.name}
                />
              ) : (
                <IdCardPreview
                  template={previewingTemplate}
                  recipient={MOCK_STUDENT_DATA}
                  recipientType="student"
                  schoolSettings={schoolSettings}
                  title={previewingTemplate.name}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Visual Customizer Studio Modal */}
      <TemplateCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        onSuccess={loadCustomTemplates}
        editingTemplate={editingCustomTemplate}
        schoolSettings={schoolSettings}
      />
    </div>
  );
}
