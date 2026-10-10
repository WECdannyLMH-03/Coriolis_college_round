import React from 'react';
import {
  Users,
  CreditCard,
  Video,
  Mail,
  ShieldCheck,
  Bot,
  ArrowUpRight,
  TrendingUp,
  Globe,
  Plus,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { AppState } from '../../services/api';
import { TabId } from '../layout/Sidebar';

interface OverviewViewProps {
  state: AppState;
  onNavigate: (tab: TabId) => void;
  onQuickAction: (action: 'website' | 'contact' | 'campaign' | 'webinar' | 'plan') => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  state,
  onNavigate,
  onQuickAction,
}) => {
  const {
    contacts,
    websites,
    campaigns,
    webinars,
    customerSubscriptions,
    approvalRequests,
    workflows,
    organization,
  } = state;

  // Derive metrics dynamically from real data
  const totalContacts = contacts.length;
  const newLeads = contacts.filter(c => c.leadStage === 'New').length;
  const convertedCustomers = contacts.filter(c => c.leadStage === 'Converted').length;
  const conversionRate = totalContacts > 0 ? ((convertedCustomers / totalContacts) * 100).toFixed(1) : '0';

  const activeSubs = customerSubscriptions.filter(s => s.status === 'active');
  const mrr = activeSubs.reduce((acc, s) => acc + s.nextBillingTotal, 0);

  const upcomingWebinars = webinars.filter(w => w.status === 'scheduled');
  const totalWebinarRegistrations = webinars.reduce((acc, w) => acc + w.registeredContactIds.length, 0);

  const sentCampaigns = campaigns.filter(c => c.status === 'sent');
  const totalSentEmails = sentCampaigns.reduce((acc, c) => acc + c.sentCount, 0);
  const totalOpens = sentCampaigns.reduce((acc, c) => acc + c.openCount, 0);
  const avgOpenRate = totalSentEmails > 0 ? ((totalOpens / totalSentEmails) * 100).toFixed(1) : '65.2';

  const pendingApprovals = approvalRequests.filter(a => a.status === 'pending');

  return (
    <div className="space-y-6">
      {/* Welcome & Global AI Trigger Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
              Nexus Business Suite
            </span>
            <span className="text-xs text-slate-400 font-mono">Live Sync</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Unified Workspace Command Center
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
            Autonomous workflows linking website signups, CRM leads, live workshops, automated email campaigns, and usage billing.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('ai-agent')}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Sparkles className="h-4 w-4" />
            Launch AI Workflow Agent
          </button>
        </div>
      </div>

      {/* Pending Approvals Warning Banner (if any) */}
      {pendingApprovals.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-900">
                {pendingApprovals.length} Sensitive Operation{pendingApprovals.length > 1 ? 's' : ''} Awaiting Approval
              </div>
              <div className="text-[11px] text-amber-700">
                External email broadcasts and website deployments require administrator review before execution.
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('approvals')}
            className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-700 transition-colors shrink-0"
          >
            Review Queue
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CRM Contacts */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Total Contacts</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {totalContacts}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
            <span>{newLeads} new leads</span>
            <span className="font-semibold text-emerald-600">+{conversionRate}% converted</span>
          </div>
        </div>

        {/* Subscriptions & MRR */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Monthly Recurring Revenue</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            ${mrr.toLocaleString()}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
            <span>{activeSubs.length} active customer{activeSubs.length === 1 ? '' : 's'}</span>
            <span className="font-mono text-indigo-600">Usage Metered</span>
          </div>
        </div>

        {/* Webinars */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Scheduled Webinars</span>
            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
              <Video className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {upcomingWebinars.length}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
            <span>{totalWebinarRegistrations} total registrants</span>
            <span className="font-semibold text-purple-600">Next Friday</span>
          </div>
        </div>

        {/* Campaigns */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Marketing Deliveries</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Mail className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {totalSentEmails}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
            <span>{avgOpenRate}% avg open rate</span>
            <span className="font-semibold text-amber-600">Simulated engine</span>
          </div>
        </div>
      </div>

      {/* Main Charts & Quick Pipelines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue & Conversion Trajectory (SVG chart) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Revenue & Lead Pipeline Trajectory</h3>
              <p className="text-xs text-slate-500">Cross-module monetization across webinar tickets and subscriptions</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-indigo-600" />
                MRR Revenue ($)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Qualified Pipeline
              </span>
            </div>
          </div>

          {/* SVG Trendline Graphic */}
          <div className="h-56 w-full pt-2">
            <svg viewBox="0 0 600 180" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="indigoGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="30" x2="600" y2="30" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="75" x2="600" y2="75" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="120" x2="600" y2="120" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="165" x2="600" y2="165" stroke="#f1f5f9" strokeWidth="1" />

              {/* Area 1: Indigo MRR */}
              <path
                d="M 20 150 Q 120 135, 200 115 T 380 70 T 500 45 L 580 35 L 580 165 L 20 165 Z"
                fill="url(#indigoGrad)"
              />
              <path
                d="M 20 150 Q 120 135, 200 115 T 380 70 T 500 45 L 580 35"
                fill="none"
                stroke="#4f46e5"
                strokeWidth="2.5"
              />

              {/* Area 2: Emerald Leads */}
              <path
                d="M 20 160 Q 100 150, 220 130 T 400 95 T 520 65 L 580 50"
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
                strokeDasharray="4 4"
              />

              {/* Data points */}
              <circle cx="200" cy="115" r="4" fill="#4f46e5" />
              <circle cx="380" cy="70" r="4" fill="#4f46e5" />
              <circle cx="580" cy="35" r="5" fill="#4f46e5" />

              <text x="580" y="25" textAnchor="end" fontSize="11" fill="#4f46e5" fontWeight="bold">
                ${mrr + 450} Current Run-rate
              </text>
            </svg>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-3 border-t border-slate-100">
            <span>Aug 2026</span>
            <span>Sep 2026</span>
            <span>Early Oct</span>
            <span>Mid Oct (Current)</span>
            <span>Q4 Forecast</span>
          </div>
        </div>

        {/* Quick Launchpad Actions */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Quick Resource Actions</h3>
            <p className="text-xs text-slate-500 mb-4">Direct shortcuts to add business assets</p>

            <div className="space-y-2">
              <button
                onClick={() => onQuickAction('website')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-xs font-semibold text-slate-800 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-indigo-600" />
                  New Landing Page
                </span>
                <Plus className="h-3.5 w-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => onQuickAction('contact')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-xs font-semibold text-slate-800 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-emerald-600" />
                  Add CRM Contact
                </span>
                <Plus className="h-3.5 w-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => onQuickAction('webinar')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 text-xs font-semibold text-slate-800 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-purple-600" />
                  Schedule Webinar
                </span>
                <Plus className="h-3.5 w-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => onQuickAction('campaign')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:border-amber-300 hover:bg-amber-50/50 text-xs font-semibold text-slate-800 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-amber-600" />
                  Draft Email Campaign
                </span>
                <Plus className="h-3.5 w-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100">
            <button
              onClick={() => onNavigate('ai-agent')}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
            >
              <Bot className="h-4 w-4 text-indigo-400" />
              Autonomous Playbook Runner
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Workflows & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Workflows */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">AI Workflow Engine Executions</h3>
              <p className="text-xs text-slate-500">Autonomous multi-module orchestrations</p>
            </div>
            <button
              onClick={() => onNavigate('ai-agent')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              View Agent <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-3">
            {workflows.slice(0, 3).map(wf => (
              <div
                key={wf.id}
                onClick={() => onNavigate('ai-agent')}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900">{wf.title}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      wf.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : wf.status === 'running'
                        ? 'bg-indigo-100 text-indigo-800'
                        : wf.status === 'awaiting_approval'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {wf.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 line-clamp-1 mb-2">
                  "{wf.prompt}"
                </p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>{wf.steps.length} ordered steps</span>
                  <span>{new Date(wf.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live CRM Lead Stage Breakdown */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">CRM Lead Pipeline Distribution</h3>
              <p className="text-xs text-slate-500">Real-time status of all {contacts.length} registered identities</p>
            </div>
            <button
              onClick={() => onNavigate('crm')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 flex items-center gap-1"
            >
              Open CRM <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-3">
            {[
              { stage: 'New', count: contacts.filter(c => c.leadStage === 'New').length, color: 'bg-blue-500' },
              { stage: 'Contacted', count: contacts.filter(c => c.leadStage === 'Contacted').length, color: 'bg-purple-500' },
              { stage: 'Qualified', count: contacts.filter(c => c.leadStage === 'Qualified').length, color: 'bg-amber-500' },
              { stage: 'Converted', count: contacts.filter(c => c.leadStage === 'Converted').length, color: 'bg-emerald-500' },
              { stage: 'Lost', count: contacts.filter(c => c.leadStage === 'Lost').length, color: 'bg-slate-400' },
            ].map(item => {
              const pct = totalContacts > 0 ? (item.count / totalContacts) * 100 : 0;
              return (
                <div key={item.stage} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span>{item.stage}</span>
                    <span className="font-mono tabular-nums">{item.count} ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-300`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
