import React from 'react';
import {
  LayoutDashboard,
  Globe,
  Users,
  Mail,
  Video,
  CreditCard,
  Bot,
  BarChart3,
  ShieldCheck,
  Settings,
  X,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { UserRole } from '../../types';

export type TabId = 
  | 'overview' 
  | 'websites' 
  | 'crm' 
  | 'marketing' 
  | 'webinars' 
  | 'billing' 
  | 'ai-agent' 
  | 'analytics' 
  | 'approvals' 
  | 'settings';

interface SidebarProps {
  currentTab: TabId;
  onSelectTab: (tab: TabId) => void;
  pendingApprovalsCount: number;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

const navItems: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'websites', label: 'Websites', icon: Globe },
  { id: 'crm', label: 'CRM Contacts', icon: Users },
  { id: 'marketing', label: 'Marketing', icon: Mail },
  { id: 'webinars', label: 'Webinars', icon: Video },
  { id: 'billing', label: 'Subscriptions', icon: CreditCard },
  { id: 'ai-agent', label: 'AI Agent', icon: Bot },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'approvals', label: 'Approvals & Audit', icon: ShieldCheck },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  pendingApprovalsCount,
  currentRole,
  onRoleChange,
  isMobileOpen,
  onCloseMobile,
}) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col bg-[#0B132B] text-slate-300 transition-transform duration-200 lg:static lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Lockup */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-lg shadow-sm">
              N
            </div>
            <div>
              <div className="font-bold tracking-tight text-white text-base">Nexus</div>
              <div className="text-[11px] font-medium text-slate-400">Autonomous SaaS Suite</div>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-1 rounded-md text-slate-400 hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Organization Switcher Bar */}
        <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1 font-medium">
            <span>Organization</span>
            <span className="text-[10px] text-emerald-400 bg-emerald-950/50 border border-emerald-800/50 px-1.5 py-0.2 rounded">Production</span>
          </div>
          <div className="text-sm font-semibold text-slate-200 truncate">
            Nexus Technologies Ltd.
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.id === 'approvals' && pendingApprovalsCount > 0 && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-500 px-1.5 text-[11px] font-bold text-slate-950">
                    {pendingApprovalsCount}
                  </span>
                )}
                {item.id === 'ai-agent' && (
                  <span className="flex h-5 items-center justify-center rounded px-1.5 text-[10px] font-bold tracking-wide uppercase bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                    Engine
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Role-Based Access Control Switcher */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="flex items-center gap-1 font-medium">
              <ShieldAlert className="h-3.5 w-3.5 text-indigo-400" />
              Active Role (RBAC)
            </span>
          </div>
          <select
            value={currentRole}
            onChange={e => onRoleChange(e.target.value as UserRole)}
            className="w-full bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="admin">Administrator (Full Access)</option>
            <option value="manager">Operations Manager</option>
            <option value="marketing">Marketing Specialist</option>
            <option value="viewer">Read-Only Viewer</option>
          </select>
          <div className="mt-2 text-[11px] text-slate-400 leading-tight">
            {currentRole === 'admin' && 'Can execute, approve sensitive tasks & delete.'}
            {currentRole === 'manager' && 'Can approve campaigns & websites.'}
            {currentRole === 'marketing' && 'Requires admin approval for sends & publishing.'}
            {currentRole === 'viewer' && 'View-only access to records and metrics.'}
          </div>
        </div>
      </aside>
    </>
  );
};
