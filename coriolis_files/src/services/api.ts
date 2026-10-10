import {
  Website,
  Contact,
  Campaign,
  Webinar,
  SubscriptionPlan,
  CustomerSubscription,
  UsageEvent,
  Invoice,
  ApprovalRequest,
  AuditLog,
  Workflow,
  WorkflowStep,
  User,
  Organization,
  UserRole,
} from '../types';

export interface AppState {
  organization: Organization;
  currentUser: User;
  websites: Website[];
  contacts: Contact[];
  campaigns: Campaign[];
  webinars: Webinar[];
  subscriptionPlans: SubscriptionPlan[];
  customerSubscriptions: CustomerSubscription[];
  usageEvents: UsageEvent[];
  invoices: Invoice[];
  approvalRequests: ApprovalRequest[];
  auditLogs: AuditLog[];
  workflows: Workflow[];
}

export const api = {
  async getState(): Promise<AppState> {
    const res = await fetch('/api/state');
    const data = await res.json();
    return data.data;
  },

  async resetData(): Promise<AppState> {
    const res = await fetch('/api/reset-data', { method: 'POST' });
    const data = await res.json();
    return data.data;
  },

  async switchRole(role: UserRole): Promise<User> {
    const res = await fetch('/api/user/role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    const data = await res.json();
    return data.user;
  },

  // CRM Contacts
  async createContact(contact: Partial<Contact>): Promise<{ contact: Contact; merged: boolean }> {
    const res = await fetch('/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contact),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create contact');
    }
    return res.json();
  },

  async updateContact(id: string, contact: Partial<Contact>): Promise<Contact> {
    const res = await fetch(`/api/contacts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contact),
    });
    const data = await res.json();
    return data.contact;
  },

  async deleteContact(id: string): Promise<void> {
    const res = await fetch(`/api/contacts/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to delete contact');
    }
  },

  async importCsv(csvData: string): Promise<{ imported: number; merged: number }> {
    const res = await fetch('/api/contacts/import-csv', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ csvData }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to import CSV');
    }
    return res.json();
  },

  // Websites
  async createWebsite(site: Partial<Website>): Promise<Website> {
    const res = await fetch('/api/websites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(site),
    });
    const data = await res.json();
    return data.website;
  },

  async updateWebsite(id: string, site: Partial<Website>): Promise<Website> {
    const res = await fetch(`/api/websites/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(site),
    });
    const data = await res.json();
    return data.website;
  },

  async publishWebsite(id: string): Promise<{ pendingApproval?: boolean; message: string; website?: Website }> {
    const res = await fetch(`/api/websites/${id}/publish`, { method: 'POST' });
    return res.json();
  },

  async submitWebsiteForm(websiteId: string, formPayload: { name: string; email: string; phone?: string; company?: string; webinarId?: string }): Promise<{ contact: Contact; message: string }> {
    const res = await fetch(`/api/websites/${websiteId}/submit-form`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formPayload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit form');
    }
    return res.json();
  },

  // Campaigns
  async createCampaign(campaign: Partial<Campaign>): Promise<Campaign> {
    const res = await fetch('/api/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(campaign),
    });
    const data = await res.json();
    return data.campaign;
  },

  async updateCampaign(id: string, campaign: Partial<Campaign>): Promise<Campaign> {
    const res = await fetch(`/api/campaigns/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(campaign),
    });
    const data = await res.json();
    return data.campaign;
  },

  async sendCampaign(id: string): Promise<{ pendingApproval?: boolean; campaign?: Campaign; message: string }> {
    const res = await fetch(`/api/campaigns/${id}/send`, { method: 'POST' });
    return res.json();
  },

  // Webinars
  async createWebinar(webinar: Partial<Webinar>): Promise<Webinar> {
    const res = await fetch('/api/webinars', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(webinar),
    });
    const data = await res.json();
    return data.webinar;
  },

  async updateWebinar(id: string, webinar: Partial<Webinar>): Promise<Webinar> {
    const res = await fetch(`/api/webinars/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(webinar),
    });
    const data = await res.json();
    return data.webinar;
  },

  async attendWebinar(webinarId: string, contactId: string): Promise<Webinar> {
    const res = await fetch(`/api/webinars/${webinarId}/attend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contactId }),
    });
    const data = await res.json();
    return data.webinar;
  },

  // Billing
  async createPlan(plan: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> {
    const res = await fetch('/api/billing/plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(plan),
    });
    const data = await res.json();
    return data.plan;
  },

  async recordUsage(payload: { customerId: string; subscriptionId?: string; eventType: string; quantity: number; unitPrice?: number; idempotentKey: string }): Promise<{ duplicate: boolean; event: UsageEvent }> {
    const res = await fetch('/api/billing/record-usage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async simulateCheckout(payload: { contactId: string; itemType: 'webinar_ticket' | 'subscription_plan'; itemId: string; amount: number; currency?: string; paymentMethod?: string }): Promise<{ invoice: Invoice; contact: Contact }> {
    const res = await fetch('/api/billing/simulate-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to simulate checkout');
    }
    return res.json();
  },

  // Approvals
  async approveRequest(id: string): Promise<ApprovalRequest> {
    const res = await fetch(`/api/approvals/${id}/approve`, { method: 'POST' });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Approval rejected');
    }
    const data = await res.json();
    return data.approval;
  },

  async rejectRequest(id: string, reason?: string): Promise<ApprovalRequest> {
    const res = await fetch(`/api/approvals/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Rejection failed');
    }
    const data = await res.json();
    return data.approval;
  },

  // AI Agent & Copilot
  async planWorkflow(prompt: string): Promise<Workflow> {
    const res = await fetch('/api/ai/plan-workflow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to plan workflow');
    }
    const data = await res.json();
    return data.workflow;
  },

  async executeWorkflowStep(workflowId: string, stepId: string): Promise<{ step: WorkflowStep; workflow: Workflow; awaitingApproval?: boolean }> {
    const res = await fetch('/api/ai/execute-step', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workflowId, stepId }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Step execution failed');
    }
    return res.json();
  },

  async generateCopy(payload: { topic: string; audience?: string; tone?: string; type?: string }): Promise<{ subject: string; preheader: string; body: string }> {
    const res = await fetch('/api/ai/generate-copy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },
};
