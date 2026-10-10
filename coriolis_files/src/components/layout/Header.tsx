import React, { useState } from 'react';
import {
  Menu,
  Search,
  Plus,
  Bell,
  Sparkles,
  ChevronDown,
  Globe,
  Users,
  Mail,
  Video,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { User, ApprovalRequest } from '../../types';
import { TabId } from './Sidebar';

interface HeaderProps {
  currentTab: TabId;
  currentUser: User;
  onOpenMobileMenu: () => void;
  onOpenGlobalSearch: () => void;
  onOpenAiCommand: () => void;
  pendingApprovals: ApprovalRequest[];
  onSelectTab: (tab: TabId) => void;
  onQuickAction: (action: 'website' | 'contact' | 'campaign' | 'webinar' | 'plan') => void;
}

const tabTitles: Record<TabId, { title: string; subtitle: string }> = {
  overview: { title: 'Overview Dashboard', subtitle: 'Live business performance and active operations' },
  websites: { title: 'Visual Website Builder', subtitle: 'Create, preview, and publish responsive landing pages' },
  crm: { title: 'Intelligent CRM', subtitle: 'Unified contact identity, lead stages, and activity timelines' },
  marketing: { title: 'Marketing Automation', subtitle: 'AI email copywriting, audience segmentation, and delivery' },
  webinars: { title: 'Webinar Management', subtitle: 'Schedule live sessions, track attendees, and host mock rooms' },
  billing: { title: 'Subscriptions & Usage Billing', subtitle: 'Recurring plans, idempotent usage metering, and invoices' },
  'ai-agent': { title: 'AI Business Agent', subtitle: 'Autonomous cross-module workflow planner and execution engine' },
  analytics: { title: 'Integrated Analytics', subtitle: 'Cross-functional funnel metrics and derived telemetry' },
  approvals: { title: 'Approvals & Audit Trail', subtitle: 'Security gates for sensitive operations and compliance log' },
  settings: { title: 'Workspace Settings', subtitle: 'Organization configuration, team roles, and system parameters' },
};

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  currentUser,
  onOpenMobileMenu,
  onOpenGlobalSearch,
  onOpenAiCommand,
  pendingApprovals,
  onSelectTab,
  onQuickAction,
}) => {
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const { title } = tabTitles[currentTab];

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 shadow-xs">
      {/* Left: Mobile hamburger & Breadcrumb Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 lg:hidden"
          aria-label="Open sidebar menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:inline">
            Nexus
          </span>
          <span className="text-slate-300 hidden sm:inline">/</span>
          <h1 className="text-base font-bold text-slate-900 whitespace-nowrap">
            {title}
          </h1>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Global Search Button */}
        <button
          onClick={onOpenGlobalSearch}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-500 hover:border-slate-300 hover:bg-slate-100 transition-colors"
        >
          <Search className="h-3.5 w-3.5 text-slate-400" />
          <span className="hidden md:inline">Search contacts, sites, webinars...</span>
          <span className="inline md:hidden">Search</span>
          <kbd className="hidden lg:inline-flex h-4 items-center rounded border border-slate-200 bg-white px-1 font-mono text-[10px] text-slate-400">
            ⌘K
          </kbd>
        </button>

        {/* AI Copilot Fast Action */}
        <button
          onClick={onOpenAiCommand}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-50 border border-indigo-200/80 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors shadow-2xs whitespace-nowrap"
        >
          <Sparkles className="h-3.5 w-3.5 text-indigo-600 animate-pulse" />
          <span className="hidden sm:inline">AI Agent Command</span>
          <span className="inline sm:hidden">AI</span>
        </button>

        {/* Quick Action Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowQuickMenu(!showQuickMenu)}
            className="flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 transition-colors shadow-2xs whitespace-nowrap"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Create</span>
            <ChevronDown className="h-3 w-3 text-slate-300" />
          </button>

          {showQuickMenu && (
            <div
              className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg z-50 animate-in fade-in zoom-in-95"
              onMouseLeave={() => setShowQuickMenu(false)}
            >
              <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Create Resource
              </div>
              <button
                onClick={() => {
                  onQuickAction('website');
                  setShowQuickMenu(false);
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                <Globe className="h-3.5 w-3.5 text-indigo-600" />
                Landing Page / Website
              </button>
              <button
                onClick={() => {
                  onQuickAction('contact');
                  setShowQuickMenu(false);
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                <Users className="h-3.5 w-3.5 text-emerald-600" />
                CRM Contact Record
              </button>
              <button
                onClick={() => {
                  onQuickAction('campaign');
                  setShowQuickMenu(false);
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                <Mail className="h-3.5 w-3.5 text-amber-600" />
                Marketing Campaign
              </button>
              <button
                onClick={() => {
                  onQuickAction('webinar');
                  setShowQuickMenu(false);
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                <Video className="h-3.5 w-3.5 text-purple-600" />
                Live Webinar Event
              </button>
              <button
                onClick={() => {
                  onQuickAction('plan');
                  setShowQuickMenu(false);
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                <CreditCard className="h-3.5 w-3.5 text-blue-600" />
                Subscription Pricing Plan
              </button>
            </div>
          )}
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
            aria-label="View notifications"
          >
            <Bell className="h-4 w-4" />
            {pendingApprovals.length > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-white" />
            )}
          </button>

          {showNotifications && (
            <div
              className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-xl z-50 animate-in fade-in"
              onMouseLeave={() => setShowNotifications(false)}
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                <span className="text-xs font-bold text-slate-900">Notifications & Approvals</span>
                <span className="text-[11px] text-slate-400 font-mono">{pendingApprovals.length} pending</span>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {pendingApprovals.length === 0 ? (
                  <div className="py-4 text-center text-xs text-slate-400 flex flex-col items-center gap-1">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    All approvals and operations are up to date.
                  </div>
                ) : (
                  pendingApprovals.map(a => (
                    <div
                      key={a.id}
                      onClick={() => {
                        onSelectTab('approvals');
                        setShowNotifications(false);
                      }}
                      className="p-2.5 rounded-lg border border-amber-200 bg-amber-50/60 hover:bg-amber-100/60 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3 text-amber-600" />
                          Pending Approval
                        </span>
                        <span className="text-[10px] text-amber-700">Review</span>
                      </div>
                      <div className="text-xs font-semibold text-slate-900 line-clamp-1">{a.title}</div>
                      <div className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">{a.description}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative pl-1">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 rounded-lg p-1 hover:bg-slate-100 transition-colors"
          >
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="h-8 w-8 rounded-full object-cover border border-slate-200"
              referrerPolicy="no-referrer"
            />
            <div className="hidden xl:block text-left">
              <div className="text-xs font-bold text-slate-900 leading-none">{currentUser.name}</div>
              <div className="text-[10px] font-medium text-slate-500 uppercase mt-0.5">{currentUser.role}</div>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
