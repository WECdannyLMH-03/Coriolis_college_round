export type UserRole = 'admin' | 'manager' | 'marketing' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
  organizationId: string;
}

export interface Organization {
  id: string;
  name: string;
  domain: string;
  currency: string;
}

export type SectionType = 
  | 'hero' 
  | 'features' 
  | 'webinar_form' 
  | 'pricing' 
  | 'testimonials' 
  | 'faq' 
  | 'cta' 
  | 'footer';

export interface WebsiteSection {
  id: string;
  type: SectionType;
  title: string;
  subtitle?: string;
  content: {
    heading?: string;
    subheading?: string;
    description?: string;
    primaryCtaText?: string;
    primaryCtaLink?: string;
    badgeText?: string;
    features?: { icon: string; title: string; desc: string }[];
    webinarId?: string;
    formTitle?: string;
    formButtonText?: string;
    pricingItems?: { name: string; price: string; period: string; features: string[]; popular?: boolean }[];
    testimonials?: { quote: string; author: string; role: string; avatar?: string }[];
    faqs?: { q: string; a: string }[];
    backgroundColor?: string;
    accentColor?: string;
  };
  visible: boolean;
}

export interface Website {
  id: string;
  title: string;
  slug: string;
  description: string;
  status: 'draft' | 'pending_approval' | 'published';
  theme: 'navy' | 'indigo' | 'emerald' | 'slate';
  sections: WebsiteSection[];
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  visits: number;
  submissions: number;
  associatedWebinarId?: string;
}

export type LeadStage = 'New' | 'Contacted' | 'Qualified' | 'Converted' | 'Lost';
export type LeadSource = 'Website Form' | 'Webinar Registration' | 'Cold Inbound' | 'Referral' | 'AI Campaign' | 'Imported CSV';
export type ConsentStatus = 'opted_in' | 'opted_out';

export interface ActivityEvent {
  id: string;
  type: 
    | 'form_submission' 
    | 'webinar_registered' 
    | 'webinar_attended' 
    | 'campaign_sent' 
    | 'campaign_opened' 
    | 'subscription_created' 
    | 'payment_received' 
    | 'stage_changed' 
    | 'note_added';
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  leadStage: LeadStage;
  leadSource: LeadSource;
  assignedOwner: string;
  tags: string[];
  notes: string;
  consentStatus: ConsentStatus;
  webinarIds: string[];
  subscriptionId?: string;
  createdAt: string;
  updatedAt: string;
  activityTimeline: ActivityEvent[];
}

export type CampaignStatus = 'draft' | 'pending_approval' | 'scheduled' | 'sending' | 'sent' | 'failed';

export interface Campaign {
  id: string;
  name: string;
  subject: string;
  preheader: string;
  bodyText: string;
  audienceSegment: 'all' | 'qualified_leads' | 'webinar_registrants' | 'active_customers' | 'converted';
  status: CampaignStatus;
  scheduledAt?: string;
  sentAt?: string;
  targetCount: number;
  sentCount: number;
  deliveredCount: number;
  openCount: number;
  clickCount: number;
  unsubscribeCount: number;
  isSimulated: boolean;
  approvalId?: string;
  associatedWebinarId?: string;
}

export type WebinarStatus = 'draft' | 'scheduled' | 'live' | 'completed' | 'cancelled';

export interface Webinar {
  id: string;
  title: string;
  description: string;
  host: string;
  hostTitle: string;
  scheduledDate: string;
  scheduledTime: string;
  durationMinutes: number;
  capacity: number;
  ticketPrice: number;
  currency: string;
  status: WebinarStatus;
  registeredContactIds: string[];
  attendedContactIds: string[];
  bannerImage?: string;
  landingPageId?: string;
  remindersScheduled?: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  code: string;
  description: string;
  billingInterval: 'month' | 'year';
  pricingModel: 'fixed' | 'hybrid_usage';
  basePrice: number;
  currency: string;
  usageMetricName?: string;
  usageUnitPrice?: number;
  trialDays: number;
  features: string[];
}

export interface CustomerSubscription {
  id: string;
  contactId: string;
  contactName: string;
  contactEmail: string;
  planId: string;
  planName: string;
  status: 'trialing' | 'active' | 'past_due' | 'canceled';
  billingInterval: 'month' | 'year';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  currentUsage: number;
  accumulatedUsageCharge: number;
  nextBillingTotal: number;
  cancelAtPeriodEnd: boolean;
}

export interface UsageEvent {
  id: string;
  customerId: string;
  subscriptionId: string;
  eventType: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  timestamp: string;
  idempotentKey: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  lineItems: { description: string; amount: number; quantity: number }[];
  createdAt: string;
  paidAt?: string;
}

export interface ApprovalRequest {
  id: string;
  type: 'website_publish' | 'campaign_send' | 'subscription_cancel' | 'payment_refund' | 'price_change';
  title: string;
  description: string;
  requester: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  payload: Record<string, any>;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  role: UserRole;
  action: string;
  resourceType: string;
  resourceId: string;
  outcome: 'success' | 'failure' | 'rejected';
  details: string;
}

export type StepStatus = 'pending' | 'running' | 'awaiting_approval' | 'completed' | 'failed' | 'skipped';

export interface WorkflowStep {
  id: string;
  order: number;
  toolName: string;
  title: string;
  description: string;
  status: StepStatus;
  requiresApproval: boolean;
  approvalId?: string;
  inputParams: Record<string, any>;
  outputResult?: Record<string, any>;
  error?: string;
  startedAt?: string;
  finishedAt?: string;
}

export interface Workflow {
  id: string;
  prompt: string;
  title: string;
  status: 'pending' | 'planning' | 'running' | 'awaiting_approval' | 'completed' | 'failed' | 'cancelled';
  steps: WorkflowStep[];
  createdAt: string;
  completedAt?: string;
  currentStepIndex: number;
  outcomeSummary?: string;
}
