import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar, TabId } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { OverviewView } from './components/modules/OverviewView';
import { WebsitesView } from './components/modules/WebsitesView';
import { CrmView } from './components/modules/CrmView';
import { MarketingView } from './components/modules/MarketingView';
import { WebinarsView } from './components/modules/WebinarsView';
import { BillingView } from './components/modules/BillingView';
import { AiAgentView } from './components/modules/AiAgentView';
import { AnalyticsView } from './components/modules/AnalyticsView';
import { ApprovalsView } from './components/modules/ApprovalsView';
import { SettingsView } from './components/modules/SettingsView';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { PaymentSimulatorModal } from './components/common/PaymentSimulatorModal';
import { api, AppState } from './services/api';
import { UserRole } from './types';
import { Loader2 } from 'lucide-react';

import { ToastProvider, useToast } from './components/common/Toast';

function AppContent() {
  const [state, setState] = useState<AppState | null>(null);
  const [currentTab, setCurrentTab] = useState<TabId>('overview');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isPaymentSimOpen, setIsPaymentSimOpen] = useState(false);
  const [paymentPreselectContactId, setPaymentPreselectContactId] = useState<string | undefined>(undefined);
  const [paymentPreselectWebinarId, setPaymentPreselectWebinarId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  const fetchState = useCallback(async () => {
    try {
      const data = await api.getState();
      setState(data);
    } catch (err) {
      console.error('Failed to fetch application state:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  // Global Keyboard Shortcut ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleRoleChange = async (role: UserRole) => {
    try {
      await api.switchRole(role);
      showToast(`Switched active role to ${role}`, 'info');
      fetchState();
    } catch (err) {
      console.error('Failed to change role:', err);
      showToast('Failed to change role', 'error');
    }
  };

  const handleResetData = async () => {
    try {
      const fresh = await api.resetData();
      setState(fresh);
      showToast('System baseline data restored successfully.', 'success');
    } catch (err) {
      console.error('Reset failed:', err);
      showToast('Reset failed', 'error');
    }
  };

  const handleQuickAction = (action: 'website' | 'contact' | 'campaign' | 'webinar' | 'plan') => {
    if (action === 'website') setCurrentTab('websites');
    if (action === 'contact') setCurrentTab('crm');
    if (action === 'campaign') setCurrentTab('marketing');
    if (action === 'webinar') setCurrentTab('webinars');
    if (action === 'plan') setCurrentTab('billing');
  };

  const handleOpenPaymentSimulator = (contactId?: string, webinarId?: string) => {
    setPaymentPreselectContactId(contactId);
    setPaymentPreselectWebinarId(webinarId);
    setIsPaymentSimOpen(true);
  };

  if (isLoading || !state) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
          <div className="text-sm font-bold tracking-tight">Initializing Nexus SaaS Suite...</div>
        </div>
      </div>
    );
  }

  const pendingApprovals = state.approvalRequests.filter(a => a.status === 'pending');

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans text-slate-900">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        pendingApprovalsCount={pendingApprovals.length}
        currentRole={state.currentUser.role}
        onRoleChange={handleRoleChange}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main View Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <Header
          currentTab={currentTab}
          currentUser={state.currentUser}
          onOpenMobileMenu={() => setIsMobileOpen(true)}
          onOpenGlobalSearch={() => setIsSearchOpen(true)}
          onOpenAiCommand={() => setCurrentTab('ai-agent')}
          pendingApprovals={pendingApprovals}
          onSelectTab={setCurrentTab}
          onQuickAction={handleQuickAction}
        />

        {/* View Content Port */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {currentTab === 'overview' && (
              <OverviewView
                state={state}
                onNavigate={setCurrentTab}
                onQuickAction={handleQuickAction}
              />
            )}

            {currentTab === 'websites' && (
              <WebsitesView
                websites={state.websites}
                webinars={state.webinars}
                userRole={state.currentUser.role}
                onRefresh={fetchState}
              />
            )}

            {currentTab === 'crm' && (
              <CrmView
                contacts={state.contacts}
                userRole={state.currentUser.role}
                onRefresh={fetchState}
                onSimulatePaymentForContact={contactId => handleOpenPaymentSimulator(contactId)}
              />
            )}

            {currentTab === 'marketing' && (
              <MarketingView
                campaigns={state.campaigns}
                webinars={state.webinars}
                userRole={state.currentUser.role}
                onRefresh={fetchState}
                onOpenApprovals={() => setCurrentTab('approvals')}
              />
            )}

            {currentTab === 'webinars' && (
              <WebinarsView
                webinars={state.webinars}
                contacts={state.contacts}
                userRole={state.currentUser.role}
                onRefresh={fetchState}
                onOpenPaymentSimulator={webinarId => handleOpenPaymentSimulator(undefined, webinarId)}
              />
            )}

            {currentTab === 'billing' && (
              <BillingView
                plans={state.subscriptionPlans}
                subscriptions={state.customerSubscriptions}
                usageEvents={state.usageEvents}
                invoices={state.invoices}
                contacts={state.contacts}
                userRole={state.currentUser.role}
                onRefresh={fetchState}
                onOpenPaymentSimulator={() => handleOpenPaymentSimulator()}
              />
            )}

            {currentTab === 'ai-agent' && (
              <AiAgentView
                workflows={state.workflows}
                userRole={state.currentUser.role}
                onRefresh={fetchState}
                onOpenApprovals={() => setCurrentTab('approvals')}
              />
            )}

            {currentTab === 'analytics' && (
              <AnalyticsView state={state} />
            )}

            {currentTab === 'approvals' && (
              <ApprovalsView
                approvals={state.approvalRequests}
                auditLogs={state.auditLogs}
                userRole={state.currentUser.role}
                onRefresh={fetchState}
              />
            )}

            {currentTab === 'settings' && (
              <SettingsView
                state={state}
                onRoleChange={handleRoleChange}
                onResetData={handleResetData}
              />
            )}
          </div>
        </main>
      </div>

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        contacts={state.contacts}
        websites={state.websites}
        campaigns={state.campaigns}
        webinars={state.webinars}
        plans={state.subscriptionPlans}
        onNavigate={(tab, targetId) => {
          setCurrentTab(tab);
        }}
      />

      {/* Payment Simulator Modal */}
      <PaymentSimulatorModal
        isOpen={isPaymentSimOpen}
        onClose={() => setIsPaymentSimOpen(false)}
        contacts={state.contacts}
        webinars={state.webinars}
        plans={state.subscriptionPlans}
        preselectedContactId={paymentPreselectContactId}
        preselectedItemId={paymentPreselectWebinarId}
        onPaymentSuccess={() => {
          fetchState();
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
