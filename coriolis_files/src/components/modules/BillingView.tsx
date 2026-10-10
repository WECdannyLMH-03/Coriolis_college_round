import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  Zap,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  TrendingUp,
  Receipt,
  RotateCw,
  XCircle,
  ShieldCheck,
  Activity,
  Layers,
} from 'lucide-react';
import {
  SubscriptionPlan,
  CustomerSubscription,
  UsageEvent,
  Invoice,
  Contact,
} from '../../types';
import { api } from '../../services/api';
import { useToast } from '../common/Toast';

interface BillingViewProps {
  plans: SubscriptionPlan[];
  subscriptions: CustomerSubscription[];
  usageEvents: UsageEvent[];
  invoices: Invoice[];
  contacts: Contact[];
  userRole: string;
  onRefresh: () => void;
  onOpenPaymentSimulator: () => void;
}

export const BillingView: React.FC<BillingViewProps> = ({
  plans,
  subscriptions,
  usageEvents,
  invoices,
  contacts,
  userRole,
  onRefresh,
  onOpenPaymentSimulator,
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'plans' | 'subscriptions' | 'usage' | 'invoices'>('subscriptions');

  // Modals
  const [showCreatePlanModal, setShowCreatePlanModal] = useState(false);
  const [showUsageModal, setShowUsageModal] = useState(false);

  // Plan Form
  const [planName, setPlanName] = useState('');
  const [planCode, setPlanCode] = useState('');
  const [planPrice, setPlanPrice] = useState(79);
  const [pricingModel, setPricingModel] = useState<'fixed' | 'hybrid_usage'>('fixed');
  const [usageRate, setUsageRate] = useState(0.05);
  const [usageMetric, setUsageMetric] = useState('API Ingestion Units');

  // Usage Ingestion Form (Idempotency test)
  const [usageCustomerId, setUsageCustomerId] = useState(contacts[0]?.id || '');
  const [usageQuantity, setUsageQuantity] = useState(100);
  const [idempotentKey, setIdempotentKey] = useState(`idemp_evt_${Date.now()}`);
  const [usageNotice, setUsageNotice] = useState<string | null>(null);

  // Totals
  const totalMrr = subscriptions
    .filter(s => s.status === 'active')
    .reduce((acc, s) => acc + s.nextBillingTotal, 0);

  const totalInvoiced = invoices
    .filter(i => i.status === 'paid')
    .reduce((acc, i) => acc + i.amount, 0);

  const totalUsageEventsCount = usageEvents.length;

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createPlan({
        name: planName,
        code: planCode || `PLAN-${Date.now().toString(36).toUpperCase()}`,
        basePrice: Number(planPrice),
        pricingModel,
        usageUnitPrice: pricingModel === 'hybrid_usage' ? Number(usageRate) : undefined,
        usageMetricName: pricingModel === 'hybrid_usage' ? usageMetric : undefined,
        billingInterval: 'month',
        currency: '$',
        trialDays: 14,
        features: ['Full Multi-Module Access', 'Standard API Telemetry', 'Unlimited Contacts'],
      });
      setShowCreatePlanModal(false);
      showToast(`Created subscription tier: ${planName}`, 'success');
      onRefresh();
    } catch (err: any) {
      showToast(err?.message || 'Plan creation failed', 'error');
    }
  };

  const handleRecordUsage = async (e: React.FormEvent) => {
    e.preventDefault();
    setUsageNotice(null);
    try {
      const res = await api.recordUsage({
        customerId: usageCustomerId,
        quantity: Number(usageQuantity),
        unitPrice: 0.05,
        eventType: 'api_request',
        idempotentKey,
      });

      if (res.duplicate) {
        setUsageNotice('Idempotency Handled: Duplicate key detected. Skipped duplicate charging.');
        showToast('Duplicate key detected (idempotent skip)', 'info');
      } else {
        setUsageNotice(`Usage Ingested: Recorded ${usageQuantity} units. Added to next billing cycle.`);
        showToast(`Ingested ${usageQuantity} usage units`, 'success');
        setIdempotentKey(`idemp_evt_${Date.now()}`);
      }
      onRefresh();
    } catch (err: any) {
      showToast(err?.message || 'Usage ingestion failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Subscription & Usage Billing Operations</h2>
          <p className="text-xs text-slate-500">Recurring SaaS subscriptions, idempotent usage metering, and invoice ledgers</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowUsageModal(true)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Activity className="h-3.5 w-3.5 text-indigo-600" />
            Ingest Usage Event
          </button>

          <button
            onClick={onOpenPaymentSimulator}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs"
          >
            <CreditCard className="h-3.5 w-3.5" />
            Launch Payment Simulator
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Active Base MRR</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            ${totalMrr.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100 flex justify-between">
            <span>{subscriptions.filter(s => s.status === 'active').length} active subscriptions</span>
            <span className="text-indigo-600 font-semibold">Next Cycle Ready</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Invoiced & Collected</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            ${totalInvoiced.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100 flex justify-between">
            <span>{invoices.length} paid invoices</span>
            <span className="text-emerald-600 font-semibold">Zero Churn</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Usage Events Metered</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Zap className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {totalUsageEventsCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100 flex justify-between">
            <span>Idempotent dedup active</span>
            <span className="font-mono text-blue-600">$0.05/unit base</span>
          </div>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-1 border-b border-slate-200 pb-2">
        {[
          { id: 'subscriptions', label: `Customer Subscriptions (${subscriptions.length})` },
          { id: 'plans', label: `Pricing Plans (${plans.length})` },
          { id: 'usage', label: `Usage Logs (${usageEvents.length})` },
          { id: 'invoices', label: `Invoices (${invoices.length})` },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notice Banner */}
      {usageNotice && (
        <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/80 text-xs text-indigo-900 flex items-center justify-between font-mono">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-indigo-700 shrink-0" />
            <span>{usageNotice}</span>
          </div>
          <button onClick={() => setUsageNotice(null)} className="text-[11px] underline font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Subscriptions Tab */}
      {activeTab === 'subscriptions' && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold">
                  <th className="py-3 px-4">Customer & Account</th>
                  <th className="py-3 px-4">Plan & Model</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Usage This Period</th>
                  <th className="py-3 px-4">Next Invoice Total</th>
                  <th className="py-3 px-4">Billing Period</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No active customer subscriptions. Test checkout with the Payment Simulator.
                    </td>
                  </tr>
                ) : (
                  subscriptions.map(sub => (
                    <tr key={sub.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{sub.contactName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{sub.contactEmail}</div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {sub.planName}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                          {sub.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        <span className="font-bold text-slate-900 tabular-nums">{sub.currentUsage} units</span>
                        {sub.accumulatedUsageCharge > 0 && (
                          <div className="text-[10px] text-blue-600 font-semibold">
                            +${sub.accumulatedUsageCharge.toFixed(2)} metered
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 tabular-nums">
                        ${sub.nextBillingTotal.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        Monthly ({new Date(sub.currentPeriodEnd).toLocaleDateString()})
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pricing Plans Tab */}
      {activeTab === 'plans' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowCreatePlanModal(true)}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-indigo-700"
            >
              <Plus className="h-3.5 w-3.5" />
              Create Pricing Tier
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map(p => (
              <div
                key={p.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-slate-400 font-bold">{p.code}</span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {p.pricingModel.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{p.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 min-h-[32px]">{p.description}</p>

                  <div className="my-4 pt-4 border-t border-slate-100">
                    <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                      {p.currency}{p.basePrice}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">/{p.billingInterval}</span>

                    {p.usageUnitPrice && (
                      <div className="text-[11px] font-semibold text-indigo-600 mt-1 font-mono">
                        + ${p.usageUnitPrice}/unit for {p.usageMetricName || 'Usage'}
                      </div>
                    )}
                  </div>

                  <ul className="space-y-2 text-xs text-slate-600 mb-6">
                    {p.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={onOpenPaymentSimulator}
                  className="w-full py-2 rounded-xl bg-slate-100 text-slate-800 hover:bg-slate-200 text-xs font-bold transition-colors"
                >
                  Simulate Subscribe
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Usage Logs Tab (Demonstrates Idempotency) */}
      {activeTab === 'usage' && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800">
              Raw Metered Usage Events Ledger ({usageEvents.length})
            </span>
            <span className="font-mono text-slate-500">
              Enforces Unique idempotentKey to prevent duplicate charges
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-white text-slate-500 font-semibold">
                  <th className="py-3 px-4">Event ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Metric Type</th>
                  <th className="py-3 px-4">Units</th>
                  <th className="py-3 px-4">Calculated Amount</th>
                  <th className="py-3 px-4">Idempotency Key</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usageEvents.map(evt => (
                  <tr key={evt.id} className="hover:bg-slate-50 font-mono text-[11px]">
                    <td className="py-3 px-4 text-slate-600">{evt.id}</td>
                    <td className="py-3 px-4 text-slate-900 font-bold">{evt.customerId}</td>
                    <td className="py-3 px-4 text-indigo-600 uppercase">{evt.eventType}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 tabular-nums">{evt.quantity}</td>
                    <td className="py-3 px-4 text-emerald-600 font-bold tabular-nums">${evt.totalAmount.toFixed(2)}</td>
                    <td className="py-3 px-4 text-slate-400 max-w-[140px] truncate">{evt.idempotentKey}</td>
                    <td className="py-3 px-4 text-slate-500">{new Date(evt.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Issued Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{inv.invoiceNumber}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{inv.customerName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{inv.customerEmail}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 tabular-nums">
                      {inv.currency}{inv.amount}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {inv.lineItems[0]?.description || 'Platform Service'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px] font-mono">
                      {new Date(inv.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Ingest Usage Event */}
      {showUsageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Ingest Billable Usage Event</h3>
            <p className="text-xs text-slate-500 mb-4">Demonstrates idempotent deduplication and metered billing calculation.</p>

            <form onSubmit={handleRecordUsage} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Select Customer</label>
                <select
                  value={usageCustomerId}
                  onChange={e => setUsageCustomerId(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                >
                  {contacts.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Units Consumed (e.g. API Calls)</label>
                <input
                  type="number"
                  value={usageQuantity}
                  onChange={e => setUsageQuantity(Number(e.target.value))}
                  className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-900 font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Unique Idempotency Key</label>
                <input
                  type="text"
                  value={idempotentKey}
                  onChange={e => setIdempotentKey(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-900 font-mono"
                  required
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Tip: Submitting twice with the same key will be safely ignored without double-charging.
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUsageModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-indigo-700"
                >
                  Ingest Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Plan */}
      {showCreatePlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Create Subscription Plan</h3>
            <p className="text-xs text-slate-500 mb-4">Define fixed base fees or hybrid metered rates.</p>

            <form onSubmit={handleCreatePlan} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Plan Name</label>
                <input
                  type="text"
                  value={planName}
                  onChange={e => setPlanName(e.target.value)}
                  placeholder="e.g. Enterprise Acceleration"
                  className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Base Price ($)</label>
                  <input
                    type="number"
                    value={planPrice}
                    onChange={e => setPlanPrice(Number(e.target.value))}
                    className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-900 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Pricing Model</label>
                  <select
                    value={pricingModel}
                    onChange={e => setPricingModel(e.target.value as any)}
                    className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                  >
                    <option value="fixed">Fixed Recurring</option>
                    <option value="hybrid_usage">Hybrid Usage-Based</option>
                  </select>
                </div>
              </div>

              {pricingModel === 'hybrid_usage' && (
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Metric Name</label>
                    <input
                      type="text"
                      value={usageMetric}
                      onChange={e => setUsageMetric(e.target.value)}
                      className="w-full text-xs rounded border border-slate-300 px-2 py-1 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Rate / Unit ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={usageRate}
                      onChange={e => setUsageRate(Number(e.target.value))}
                      className="w-full text-xs rounded border border-slate-300 px-2 py-1 text-slate-900 font-mono"
                    />
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreatePlanModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-indigo-700"
                >
                  Save Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
