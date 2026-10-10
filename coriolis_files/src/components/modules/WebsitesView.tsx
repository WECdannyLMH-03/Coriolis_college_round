import React, { useState } from 'react';
import {
  Globe,
  Plus,
  Eye,
  Smartphone,
  Monitor,
  CheckCircle2,
  Trash2,
  MoveUp,
  MoveDown,
  Layers,
  Sparkles,
  Send,
  AlertCircle,
  ExternalLink,
  Edit3,
  Loader2,
  Check,
} from 'lucide-react';
import { Website, WebsiteSection, SectionType, Webinar } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../common/Toast';

interface WebsitesViewProps {
  websites: Website[];
  webinars: Webinar[];
  userRole: string;
  onRefresh: () => void;
}

export const WebsitesView: React.FC<WebsitesViewProps> = ({
  websites,
  webinars,
  userRole,
  onRefresh,
}) => {
  const { showToast } = useToast();
  const [selectedSiteId, setSelectedSiteId] = useState<string>(websites[0]?.id || '');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [isEditingSection, setIsEditingSection] = useState<string | null>(null);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [formSuccessMessage, setFormSuccessMessage] = useState<string | null>(null);

  // Lead capture form state in preview
  const [visitorName, setVisitorName] = useState('Alex Rivers');
  const [visitorEmail, setVisitorEmail] = useState('alex.rivers@cloudsystems.com');
  const [visitorCompany, setVisitorCompany] = useState('CloudSystems Corp');

  // New site modal state
  const [showNewSiteModal, setShowNewSiteModal] = useState(false);
  const [newSiteTitle, setNewSiteTitle] = useState('');
  const [newSiteSlug, setNewSiteSlug] = useState('');
  const [newSiteTheme, setNewSiteTheme] = useState<'navy' | 'indigo' | 'emerald' | 'slate'>('navy');
  const [newSiteWebinarId, setNewSiteWebinarId] = useState<string>('');

  const currentSite = websites.find(w => w.id === selectedSiteId) || websites[0];

  const handlePublish = async () => {
    if (!currentSite) return;
    try {
      const res = await api.publishWebsite(currentSite.id);
      showToast(res.message, res.pendingApproval ? 'info' : 'success');
      onRefresh();
    } catch (err: any) {
      showToast(err?.message || 'Publishing failed', 'error');
    }
  };

  const handleAddSection = async (type: SectionType) => {
    if (!currentSite) return;
    const newSection: WebsiteSection = {
      id: `sec_${Date.now()}`,
      type,
      title: type.replace('_', ' ').toUpperCase(),
      visible: true,
      content: {
        heading: `New ${type.replace('_', ' ')} Heading`,
        subheading: 'Engaging subheader describing the key benefits.',
        primaryCtaText: 'Get Started',
        features: [
          { icon: 'Zap', title: 'High Performance', desc: 'Engineered for sub-millisecond response rates.' },
          { icon: 'ShieldCheck', title: 'Enterprise Security', desc: 'Role-based access controls and SOC-2 compliance.' },
        ],
      },
    };

    const updatedSections = [...currentSite.sections, newSection];
    await api.updateWebsite(currentSite.id, { sections: updatedSections });
    onRefresh();
  };

  const handleMoveSection = async (index: number, direction: 'up' | 'down') => {
    if (!currentSite) return;
    const newSections = [...currentSite.sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSections.length) return;

    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;

    await api.updateWebsite(currentSite.id, { sections: newSections });
    onRefresh();
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!currentSite) return;
    const updatedSections = currentSite.sections.filter(s => s.id !== sectionId);
    await api.updateWebsite(currentSite.id, { sections: updatedSections });
    onRefresh();
  };

  const handleUpdateSectionContent = async (sectionId: string, updatedContent: any) => {
    if (!currentSite) return;
    const updatedSections = currentSite.sections.map(s => {
      if (s.id === sectionId) {
        return { ...s, content: { ...s.content, ...updatedContent } };
      }
      return s;
    });
    await api.updateWebsite(currentSite.id, { sections: updatedSections });
    onRefresh();
    setIsEditingSection(null);
  };

  const handleCreateSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSiteTitle) return;

    const site = await api.createWebsite({
      title: newSiteTitle,
      slug: newSiteSlug || newSiteTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      theme: newSiteTheme,
      associatedWebinarId: newSiteWebinarId || undefined,
    });
    setShowNewSiteModal(false);
    setSelectedSiteId(site.id);
    onRefresh();
  };

  // Submit test registration directly from interactive preview into shared CRM!
  const handleTestFormSubmit = async (e: React.FormEvent, webinarId?: string) => {
    e.preventDefault();
    if (!currentSite) return;

    setIsSubmittingForm(true);
    setFormSuccessMessage(null);
    try {
      const res = await api.submitWebsiteForm(currentSite.id, {
        name: visitorName,
        email: visitorEmail,
        company: visitorCompany,
        webinarId: webinarId || currentSite.associatedWebinarId,
      });
      setFormSuccessMessage(`Success! Record created in CRM for ${res.contact.name}.`);
      showToast(`Success! Record created in CRM for ${res.contact.name}.`, 'success');
      onRefresh();
    } catch (err: any) {
      showToast(err?.message || 'Form submission failed', 'error');
    } finally {
      setIsSubmittingForm(false);
    }
  };

  if (!currentSite) {
    return (
      <div className="p-8 text-center text-slate-500">
        No websites created yet. Click "+ Create Website" to build a landing page.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Bar Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <select
            value={currentSite.id}
            onChange={e => setSelectedSiteId(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {websites.map(w => (
              <option key={w.id} value={w.id}>
                {w.title} ({w.status.toUpperCase()})
              </option>
            ))}
          </select>

          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
              currentSite.status === 'published'
                ? 'bg-emerald-100 text-emerald-800'
                : currentSite.status === 'pending_approval'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-slate-200 text-slate-700'
            }`}
          >
            {currentSite.status.replace('_', ' ')}
          </span>

          <span className="text-xs text-slate-400 font-mono hidden md:inline">
            /{currentSite.slug} • {currentSite.visits} visits • {currentSite.submissions} leads
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Device viewport toggle */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5">
            <button
              onClick={() => setPreviewDevice('desktop')}
              className={`p-1.5 rounded-md text-xs transition-colors ${
                previewDevice === 'desktop' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500'
              }`}
              title="Desktop View (1440px)"
            >
              <Monitor className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPreviewDevice('mobile')}
              className={`p-1.5 rounded-md text-xs transition-colors ${
                previewDevice === 'mobile' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500'
              }`}
              title="Mobile View (375px)"
            >
              <Smartphone className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={() => setShowNewSiteModal(true)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Plus className="h-3.5 w-3.5" />
            New Page
          </button>

          <button
            onClick={handlePublish}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-bold text-white transition-colors shadow-xs ${
              currentSite.status === 'published'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            <Send className="h-3.5 w-3.5" />
            {currentSite.status === 'published' ? 'Update & Re-Publish' : 'Publish Website'}
          </button>
        </div>
      </div>

      {/* Editor & Live Preview Split Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Section Block Manager (5 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-indigo-600" />
                Active Sections ({currentSite.sections.length})
              </h3>
              <span className="text-[10px] text-slate-400">Drag/reorder blocks</span>
            </div>

            <div className="space-y-2">
              {currentSite.sections.map((sec, idx) => (
                <div
                  key={sec.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900">{sec.title}</span>
                      <span className="text-[10px] text-slate-400 ml-2 font-mono uppercase">{sec.type}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMoveSection(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20"
                        title="Move Up"
                      >
                        <MoveUp className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleMoveSection(idx, 'down')}
                        disabled={idx === currentSite.sections.length - 1}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20"
                        title="Move Down"
                      >
                        <MoveDown className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => setIsEditingSection(isEditingSection === sec.id ? null : sec.id)}
                        className="p-1 rounded text-indigo-600 hover:bg-indigo-50"
                        title="Edit Content"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteSection(sec.id)}
                        className="p-1 rounded text-rose-500 hover:bg-rose-50"
                        title="Delete Section"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Inline Section Content Quick Editor */}
                  {isEditingSection === sec.id && (
                    <div className="mt-3 pt-3 border-t border-slate-200 space-y-2 animate-in fade-in">
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500">Heading</label>
                        <input
                          type="text"
                          defaultValue={sec.content.heading || ''}
                          onBlur={e => handleUpdateSectionContent(sec.id, { heading: e.target.value })}
                          className="w-full text-xs rounded border border-slate-300 px-2 py-1 bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500">Subheading / Description</label>
                        <textarea
                          defaultValue={sec.content.subheading || sec.content.description || ''}
                          onBlur={e => handleUpdateSectionContent(sec.id, { subheading: e.target.value })}
                          className="w-full text-xs rounded border border-slate-300 px-2 py-1 bg-white"
                          rows={2}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500">Primary CTA Label</label>
                        <input
                          type="text"
                          defaultValue={sec.content.primaryCtaText || ''}
                          onBlur={e => handleUpdateSectionContent(sec.id, { primaryCtaText: e.target.value })}
                          className="w-full text-xs rounded border border-slate-300 px-2 py-1 bg-white"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add Section Buttons */}
            <div className="mt-4 pt-4 border-t border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 mb-2 block">
                Add Section Block
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleAddSection('hero')}
                  className="p-2 rounded-lg border border-slate-200 text-slate-700 text-[11px] font-medium hover:bg-slate-50 text-left"
                >
                  + Hero Block
                </button>
                <button
                  onClick={() => handleAddSection('webinar_form')}
                  className="p-2 rounded-lg border border-slate-200 text-slate-700 text-[11px] font-medium hover:bg-slate-50 text-left"
                >
                  + Webinar Form
                </button>
                <button
                  onClick={() => handleAddSection('features')}
                  className="p-2 rounded-lg border border-slate-200 text-slate-700 text-[11px] font-medium hover:bg-slate-50 text-left"
                >
                  + Features Grid
                </button>
                <button
                  onClick={() => handleAddSection('testimonials')}
                  className="p-2 rounded-lg border border-slate-200 text-slate-700 text-[11px] font-medium hover:bg-slate-50 text-left"
                >
                  + Testimonials
                </button>
                <button
                  onClick={() => handleAddSection('pricing')}
                  className="p-2 rounded-lg border border-slate-200 text-slate-700 text-[11px] font-medium hover:bg-slate-50 text-left"
                >
                  + Pricing Table
                </button>
                <button
                  onClick={() => handleAddSection('faq')}
                  className="p-2 rounded-lg border border-slate-200 text-slate-700 text-[11px] font-medium hover:bg-slate-50 text-left"
                >
                  + FAQ Accordion
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live Interactive Visual Preview (7 cols) */}
        <div className="lg:col-span-8">
          <div className="rounded-2xl border border-slate-200 bg-slate-100 p-4 shadow-inner flex flex-col items-center">
            {/* Viewport Frame */}
            <div
              className={`bg-white rounded-xl shadow-lg border border-slate-300 transition-all duration-300 overflow-hidden ${
                previewDevice === 'mobile' ? 'w-[375px] min-h-[667px]' : 'w-full min-h-[700px]'
              }`}
            >
              {/* Browser chrome header bar */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 text-slate-300 text-xs border-b border-slate-800">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <div className="font-mono text-[11px] text-slate-400 bg-slate-800 px-3 py-0.5 rounded-full max-w-[260px] truncate">
                  https://nexusops.io/{currentSite.slug}
                </div>
                <div className="text-[10px] text-slate-400 font-medium">LIVE PREVIEW</div>
              </div>

              {/* Rendered Website Sections */}
              <div className="divide-y divide-slate-100 text-slate-900">
                {currentSite.sections.map(section => {
                  if (!section.visible) return null;

                  if (section.type === 'hero') {
                    return (
                      <div
                        key={section.id}
                        className={`p-8 md:p-12 text-center ${
                          currentSite.theme === 'navy'
                            ? 'bg-[#0B132B] text-white'
                            : currentSite.theme === 'indigo'
                            ? 'bg-indigo-950 text-white'
                            : 'bg-slate-900 text-white'
                        }`}
                      >
                        {section.content.badgeText && (
                          <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 mb-4">
                            {section.content.badgeText}
                          </span>
                        )}
                        <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight max-w-2xl mx-auto leading-tight">
                          {section.content.heading}
                        </h1>
                        <p className="mt-3 text-sm md:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
                          {section.content.subheading || section.content.description}
                        </p>
                        {section.content.primaryCtaText && (
                          <div className="mt-6 flex justify-center">
                            <a
                              href={section.content.primaryCtaLink || '#register'}
                              className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-500 transition-colors shadow-sm"
                            >
                              {section.content.primaryCtaText}
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  }

                  if (section.type === 'webinar_form') {
                    const linkedWebinar = webinars.find(w => w.id === (section.content.webinarId || currentSite.associatedWebinarId));
                    return (
                      <div key={section.id} id="register" className="p-8 bg-slate-50 border-t border-slate-200">
                        <div className="max-w-md mx-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
                          <div className="text-center mb-4">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                              CRM Integrated Registration
                            </span>
                            <h3 className="text-base font-bold text-slate-900 mt-1">
                              {section.content.formTitle || 'Reserve Your Masterclass Seat'}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">
                              {section.content.subheading || 'Instant CRM lead sync & calendar invite'}
                            </p>
                            {linkedWebinar && (
                              <div className="mt-2 text-xs font-semibold font-mono text-purple-700 bg-purple-50/70 p-2 rounded-lg">
                                Event Ticket: {linkedWebinar.currency}{linkedWebinar.ticketPrice} • Date: {linkedWebinar.scheduledDate}
                              </div>
                            )}
                          </div>

                          {formSuccessMessage ? (
                            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                              <CheckCircle2 className="h-6 w-6 text-emerald-600 mx-auto" />
                              <div className="text-xs font-bold text-emerald-900">{formSuccessMessage}</div>
                              <p className="text-[11px] text-emerald-700">Check the CRM Contacts tab to see your normalized record & timeline activity.</p>
                              <button
                                onClick={() => setFormSuccessMessage(null)}
                                className="text-[11px] text-emerald-800 underline font-semibold mt-2"
                              >
                                Test Another Registration
                              </button>
                            </div>
                          ) : (
                            <form onSubmit={e => handleTestFormSubmit(e, linkedWebinar?.id)} className="space-y-3">
                              <div>
                                <label className="text-[11px] font-semibold text-slate-700">Full Name</label>
                                <input
                                  type="text"
                                  value={visitorName}
                                  onChange={e => setVisitorName(e.target.value)}
                                  className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  required
                                />
                              </div>
                              <div>
                                <label className="text-[11px] font-semibold text-slate-700">Work Email (Deduplicated in CRM)</label>
                                <input
                                  type="email"
                                  value={visitorEmail}
                                  onChange={e => setVisitorEmail(e.target.value)}
                                  className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  required
                                />
                              </div>
                              <div>
                                <label className="text-[11px] font-semibold text-slate-700">Company</label>
                                <input
                                  type="text"
                                  value={visitorCompany}
                                  onChange={e => setVisitorCompany(e.target.value)}
                                  className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                              </div>
                              <button
                                type="submit"
                                disabled={isSubmittingForm}
                                className="w-full rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 transition-colors shadow-xs flex items-center justify-center gap-2"
                              >
                                {isSubmittingForm ? (
                                  <>
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    Synchronizing with CRM...
                                  </>
                                ) : (
                                  section.content.formButtonText || 'Confirm Registration'
                                )}
                              </button>
                            </form>
                          )}
                        </div>
                      </div>
                    );
                  }

                  if (section.type === 'features') {
                    return (
                      <div key={section.id} className="p-8 md:p-12">
                        <div className="text-center max-w-xl mx-auto mb-8">
                          <h2 className="text-xl md:text-2xl font-bold text-slate-900">{section.content.heading}</h2>
                          <p className="text-xs text-slate-500 mt-1">{section.content.subheading}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {(section.content.features || [
                            { title: 'Feature 1', desc: 'Powerful capabilities out of the box.' },
                            { title: 'Feature 2', desc: 'Integrated directly into your workflows.' },
                            { title: 'Feature 3', desc: 'Enterprise reliability and support.' },
                          ]).map((f, i) => (
                            <div key={i} className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
                              <h3 className="text-sm font-bold text-slate-900">{f.title}</h3>
                              <p className="text-xs text-slate-500 mt-1">{f.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  if (section.type === 'testimonials') {
                    return (
                      <div key={section.id} className="p-8 bg-slate-50">
                        <h2 className="text-center text-lg font-bold text-slate-900 mb-6">{section.content.heading}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                          {(section.content.testimonials || []).map((t, idx) => (
                            <div key={idx} className="p-4 rounded-xl bg-white border border-slate-200">
                              <p className="text-xs italic text-slate-700">"{t.quote}"</p>
                              <div className="mt-3 text-xs font-bold text-slate-900">{t.author}</div>
                              <div className="text-[10px] text-slate-500">{t.role}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={section.id} className="p-6 text-center text-xs text-slate-500">
                      [{section.title} Section Preview]
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="p-6 bg-slate-900 text-slate-400 text-center text-xs border-t border-slate-800">
                © 2026 Nexus Platform • Hosted on Global Edge
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: New Website */}
      {showNewSiteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Create New Landing Page</h3>
            <p className="text-xs text-slate-500 mb-4">Visual block-based builder with automatic CRM synchronization.</p>

            <form onSubmit={handleCreateSite} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Page Title</label>
                <input
                  type="text"
                  value={newSiteTitle}
                  onChange={e => setNewSiteTitle(e.target.value)}
                  placeholder="e.g. AI Workshop 2026"
                  className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">URL Slug</label>
                <input
                  type="text"
                  value={newSiteSlug}
                  onChange={e => setNewSiteSlug(e.target.value)}
                  placeholder="e.g. ai-workshop-2026"
                  className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Visual Theme</label>
                <select
                  value={newSiteTheme}
                  onChange={e => setNewSiteTheme(e.target.value as any)}
                  className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                >
                  <option value="navy">Midnight Navy (Default)</option>
                  <option value="indigo">Modern Indigo</option>
                  <option value="emerald">Emerald Growth</option>
                  <option value="slate">Slate Minimal</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Connect to Webinar (Optional)</label>
                <select
                  value={newSiteWebinarId}
                  onChange={e => setNewSiteWebinarId(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                >
                  <option value="">None (Standard Lead Capture)</option>
                  {webinars.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.title} ({w.currency}{w.ticketPrice})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewSiteModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-indigo-700"
                >
                  Create Page
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
