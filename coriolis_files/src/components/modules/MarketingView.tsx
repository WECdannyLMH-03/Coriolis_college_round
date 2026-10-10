import React, { useState } from 'react';
import {
  Mail,
  Plus,
  Send,
  Sparkles,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  MousePointer,
  UserX,
  ShieldCheck,
  Loader2,
  RotateCcw,
} from 'lucide-react';
import { Campaign, Webinar } from '../../types';
import { api, AppState } from '../../services/api';
import { useToast } from '../common/Toast';

interface MarketingViewProps {
  campaigns: Campaign[];
  webinars: Webinar[];
  userRole: string;
  onRefresh: () => void;
  onOpenApprovals?: () => void;
}

export const MarketingView: React.FC<MarketingViewProps> = ({
  campaigns,
  webinars,
  userRole,
  onRefresh,
  onOpenApprovals,
}) => {
  const { showToast } = useToast();
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(campaigns[0]?.id || '');
  const [showComposer, setShowComposer] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendResultNotice, setSendResultNotice] = useState<string | null>(null);

  // Composer Form
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [preheader, setPreheader] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [audienceSegment, setAudienceSegment] = useState<'all' | 'qualified_leads' | 'webinar_registrants' | 'active_customers'>('qualified_leads');
  const [associatedWebinarId, setAssociatedWebinarId] = useState<string>('');

  const currentCampaign = campaigns.find(c => c.id === selectedCampaignId) || campaigns[0];

  const handleAiCopywriter = async () => {
    setIsGeneratingAi(true);
    try {
      const topic = associatedWebinarId
        ? webinars.find(w => w.id === associatedWebinarId)?.title || 'Live Workshop'
        : (name || 'New SaaS Platform Release');

      const res = await api.generateCopy({
        topic,
        audience: audienceSegment,
        type: 'email campaign',
      });

      if (res.subject) setSubject(res.subject);
      if (res.preheader) setPreheader(res.preheader);
      if (res.body) setBodyText(res.body);
      showToast('AI Copy generated successfully', 'success');
    } catch (err: any) {
      showToast('AI copywriting generation error: ' + err?.message, 'error');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newCmp = await api.createCampaign({
        name,
        subject,
        preheader,
        bodyText,
        audienceSegment,
        associatedWebinarId: associatedWebinarId || undefined,
      });
      setShowComposer(false);
      setSelectedCampaignId(newCmp.id);
      showToast(`Campaign draft created: ${newCmp.name}`, 'success');
      onRefresh();
    } catch (err: any) {
      showToast(err?.message || 'Failed to create campaign', 'error');
    }
  };

  const handleDispatchCampaign = async (campaignId: string) => {
    setIsSending(true);
    setSendResultNotice(null);
    try {
      const res = await api.sendCampaign(campaignId);
      if (res.pendingApproval) {
        setSendResultNotice('Gated by Security Policy: Campaign submitted to Approvals Queue for Administrator review before external sending.');
        showToast('Approval request queued for administrator review', 'info');
      } else {
        setSendResultNotice(res.message);
        showToast(res.message, 'success');
      }
      onRefresh();
    } catch (err: any) {
      showToast(err?.message || 'Campaign dispatch failed', 'error');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Email Marketing & Automated Broadcasts</h2>
          <p className="text-xs text-slate-500">Consent-enforced targeting with AI copywriting and simulated telemetry</p>
        </div>

        <button
          onClick={() => {
            setName('Workshop Masterclass Outbound Broadcast');
            setSubject('Exclusive Invitation: Advanced Python & Concurrency Masterclass');
            setPreheader('Learn distributed systems patterns next Friday.');
            setBodyText(`Hi {{name}},\n\nWe are hosting an intensive masterclass next Friday on high-throughput asynchronous architectures.\n\nTicket Price: ₹999\nIncludes: Live coding benchmarks, architectural blueprints, and interactive Q&A.\n\nReserve your seat today before capacity is reached.`);
            setShowComposer(true);
          }}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 shadow-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          Draft New Campaign
        </button>
      </div>

      {/* Notice Alert if Send Triggered */}
      {sendResultNotice && (
        <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/70 text-xs text-indigo-900 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-indigo-700 shrink-0" />
            <span>{sendResultNotice}</span>
          </div>
          {onOpenApprovals && sendResultNotice.includes('Approvals Queue') && (
            <button
              onClick={onOpenApprovals}
              className="font-bold underline text-indigo-800 shrink-0 ml-4"
            >
              Go to Approvals Queue
            </button>
          )}
        </div>
      )}

      {/* Campaign List & Performance Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Campaign List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-bold uppercase text-slate-400 tracking-wider">
            All Campaigns ({campaigns.length})
          </div>

          <div className="space-y-2">
            {campaigns.map(cmp => {
              const isSelected = cmp.id === currentCampaign?.id;
              return (
                <div
                  key={cmp.id}
                  onClick={() => setSelectedCampaignId(cmp.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/30 shadow-xs ring-1 ring-indigo-600'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-900 truncate max-w-[200px]">{cmp.name}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        cmp.status === 'sent'
                          ? 'bg-emerald-100 text-emerald-800'
                          : cmp.status === 'pending_approval'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {cmp.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 line-clamp-1 mb-2 font-medium">
                    "{cmp.subject}"
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-2 border-t border-slate-100">
                    <span>Segment: {cmp.audienceSegment}</span>
                    <span>{cmp.sentCount > 0 ? `${cmp.sentCount} sent` : `${cmp.targetCount} targets`}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Campaign Inspector & Delivery Metrics (7 cols) */}
        {currentCampaign && (
          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-200 gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Campaign Details & Delivery Engine
                  </span>
                  <h3 className="text-base font-bold text-slate-900">{currentCampaign.name}</h3>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">
                    Audience: {currentCampaign.audienceSegment} • Consent Checked
                  </div>
                </div>

                {currentCampaign.status !== 'sent' && (
                  <button
                    onClick={() => handleDispatchCampaign(currentCampaign.id)}
                    disabled={isSending}
                    className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-xs"
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Evaluating Rules...
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        Send Broadcast
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Delivery Analytics Tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-center">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Target Audience</div>
                  <div className="text-lg font-bold font-mono text-slate-900 mt-1 tabular-nums">
                    {currentCampaign.targetCount}
                  </div>
                  <span className="text-[10px] text-emerald-600 font-semibold">100% Opted-In</span>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-center">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Delivered</div>
                  <div className="text-lg font-bold font-mono text-slate-900 mt-1 tabular-nums">
                    {currentCampaign.deliveredCount}
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {currentCampaign.sentCount > 0
                      ? `${((currentCampaign.deliveredCount / currentCampaign.sentCount) * 100).toFixed(0)}% delivery`
                      : 'Pending'}
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-center">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Opened</div>
                  <div className="text-lg font-bold font-mono text-indigo-600 mt-1 tabular-nums">
                    {currentCampaign.openCount}
                  </div>
                  <span className="text-[10px] text-indigo-600 font-semibold">
                    {currentCampaign.deliveredCount > 0
                      ? `${((currentCampaign.openCount / currentCampaign.deliveredCount) * 100).toFixed(1)}% rate`
                      : '0%'}
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-center">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Clicked CTA</div>
                  <div className="text-lg font-bold font-mono text-emerald-600 mt-1 tabular-nums">
                    {currentCampaign.clickCount}
                  </div>
                  <span className="text-[10px] text-emerald-600 font-semibold">
                    {currentCampaign.openCount > 0
                      ? `${((currentCampaign.clickCount / currentCampaign.openCount) * 100).toFixed(1)}% CTR`
                      : '0%'}
                  </span>
                </div>
              </div>

              {/* Simulated Delivery Transparency Disclosure */}
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 text-[11px] text-slate-500 mb-6 flex items-start gap-2 font-mono">
                <AlertCircle className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Transparency Note:</strong> When external email relay (e.g. SES/SendGrid) is not connected, delivery, opens, and clicks are generated via the integrated simulation engine.
                </span>
              </div>

              {/* Email Content Preview */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-800">Email Envelope & Body Preview</span>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                  <div className="text-xs text-slate-600">
                    <strong className="text-slate-800">Subject:</strong> {currentCampaign.subject}
                  </div>
                  {currentCampaign.preheader && (
                    <div className="text-[11px] text-slate-500 font-mono">
                      <strong>Snippet:</strong> {currentCampaign.preheader}
                    </div>
                  )}
                  <div className="mt-4 pt-3 border-t border-slate-200 font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                    {currentCampaign.bodyText}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Composer Modal */}
      {showComposer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Compose Marketing Campaign</h3>
                <p className="text-xs text-slate-500">Requires administrator approval before external dispatch.</p>
              </div>
              <button
                type="button"
                onClick={handleAiCopywriter}
                disabled={isGeneratingAi}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100"
              >
                {isGeneratingAi ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Generating with Gemini...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3 w-3 text-indigo-600" />
                    AI Copywriter Assistant
                  </>
                )}
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Internal Campaign Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. October Python Workshop Invitation"
                  className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Email Subject Line</label>
                <input
                  type="text"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="e.g. Master Distributed Systems with Python next Friday"
                  className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-900 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Preheader Snippet</label>
                <input
                  type="text"
                  value={preheader}
                  onChange={e => setPreheader(e.target.value)}
                  placeholder="Preview text shown in email clients"
                  className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Target Segment</label>
                  <select
                    value={audienceSegment}
                    onChange={e => setAudienceSegment(e.target.value as any)}
                    className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                  >
                    <option value="qualified_leads">Qualified Leads Only</option>
                    <option value="all">All Opted-In Contacts</option>
                    <option value="webinar_registrants">Webinar Registrants</option>
                    <option value="active_customers">Active Customers</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Associated Webinar</label>
                  <select
                    value={associatedWebinarId}
                    onChange={e => setAssociatedWebinarId(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                  >
                    <option value="">None (Standard Broadcast)</option>
                    {webinars.map(w => (
                      <option key={w.id} value={w.id}>
                        {w.title} ({w.currency}{w.ticketPrice})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Email Body (Markdown / Plaintext)</label>
                <textarea
                  value={bodyText}
                  onChange={e => setBodyText(e.target.value)}
                  className="w-full h-32 text-xs font-mono rounded-lg border border-slate-300 p-3 text-slate-800"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowComposer(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-indigo-700"
                >
                  Save Campaign Draft
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
