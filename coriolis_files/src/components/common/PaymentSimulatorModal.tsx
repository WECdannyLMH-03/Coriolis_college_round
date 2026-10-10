import React, { useState } from 'react';
import { CreditCard, CheckCircle2, ShieldCheck, AlertCircle, X, ArrowRight, Loader2 } from 'lucide-react';
import { Contact, Webinar, SubscriptionPlan } from '../../types';

interface PaymentSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: Contact[];
  webinars: Webinar[];
  plans: SubscriptionPlan[];
  preselectedContactId?: string;
  preselectedItemType?: 'webinar_ticket' | 'subscription_plan';
  preselectedItemId?: string;
  onPaymentSuccess: (result: { invoice: any; contact: any }) => void;
}

export const PaymentSimulatorModal: React.FC<PaymentSimulatorModalProps> = ({
  isOpen,
  onClose,
  contacts,
  webinars,
  plans,
  preselectedContactId,
  preselectedItemType,
  preselectedItemId,
  onPaymentSuccess,
}) => {
  const [selectedContactId, setSelectedContactId] = useState(preselectedContactId || contacts[0]?.id || '');
  const [itemType, setItemType] = useState<'webinar_ticket' | 'subscription_plan'>(preselectedItemType || 'webinar_ticket');
  const [selectedItemId, setSelectedItemId] = useState(preselectedItemId || (webinars[0]?.id || ''));
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'netbanking'>('card');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('888');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Compute amount
  let amount = 0;
  let currency = '₹';
  let itemTitle = '';

  if (itemType === 'webinar_ticket') {
    const w = webinars.find(wb => wb.id === selectedItemId);
    amount = w ? w.ticketPrice : 999;
    currency = w ? w.currency : '₹';
    itemTitle = w ? w.title : 'Live Workshop Seat';
  } else {
    const p = plans.find(pl => pl.id === selectedItemId);
    amount = p ? p.basePrice : 79;
    currency = p ? p.currency : '$';
    itemTitle = p ? `${p.name} Subscription` : 'SaaS Plan';
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContactId) {
      setError('Please select a contact to complete payment.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const res = await fetch('/api/billing/simulate-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactId: selectedContactId,
          itemType,
          itemId: selectedItemId,
          amount,
          currency,
          paymentMethod: `Simulated ${paymentMethod.toUpperCase()}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Payment processing failed');
      }

      onPaymentSuccess(data);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Payment simulation failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <CreditCard className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Payment Simulator (Demo Gateway)</h2>
              <p className="text-[11px] text-amber-700 font-medium">Clearly Labelled Simulated Sandbox</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Notice Banner */}
        <div className="px-6 py-2.5 bg-amber-50/80 border-b border-amber-200/60 text-[11px] text-amber-900 flex items-start gap-2">
          <ShieldCheck className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
          <span>
            <strong>Sandbox Guarantee:</strong> No actual monetary charges occur. This simulates the verified checkout webhook to trigger CRM stage conversion, ticket issuance, and subscription activation.
          </span>
        </div>

        {/* Checkout Form */}
        <form onSubmit={handleCheckout} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Customer Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Paying Customer (CRM Record)
            </label>
            <select
              value={selectedContactId}
              onChange={e => setSelectedContactId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {contacts.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.email}) — Current Stage: {c.leadStage}
                </option>
              ))}
            </select>
          </div>

          {/* Item Type Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => {
                setItemType('webinar_ticket');
                if (webinars[0]) setSelectedItemId(webinars[0].id);
              }}
              className={`py-1.5 text-xs font-semibold rounded-md transition-colors ${
                itemType === 'webinar_ticket'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Webinar Seat Ticket
            </button>
            <button
              type="button"
              onClick={() => {
                setItemType('subscription_plan');
                if (plans[0]) setSelectedItemId(plans[0].id);
              }}
              className={`py-1.5 text-xs font-semibold rounded-md transition-colors ${
                itemType === 'subscription_plan'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              SaaS Subscription Plan
            </button>
          </div>

          {/* Target Item Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {itemType === 'webinar_ticket' ? 'Select Webinar Event' : 'Select Subscription Tier'}
            </label>
            {itemType === 'webinar_ticket' ? (
              <select
                value={selectedItemId}
                onChange={e => setSelectedItemId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {webinars.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.title} — {w.currency}{w.ticketPrice}
                  </option>
                ))}
              </select>
            ) : (
              <select
                value={selectedItemId}
                onChange={e => setSelectedItemId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {plans.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.currency}{p.basePrice}/{p.billingInterval}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Amount Summary */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-500 font-medium">Total Billable Amount</span>
              <div className="text-xs font-bold text-slate-900 truncate max-w-[240px]">{itemTitle}</div>
            </div>
            <div className="text-lg font-bold font-mono text-emerald-600 tabular-nums">
              {currency}{amount}
            </div>
          </div>

          {/* Mock Card Input */}
          <div className="space-y-2 pt-1 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Payment Credentials (Sandbox)
            </span>
            <div className="relative">
              <input
                type="text"
                value={cardNumber}
                onChange={e => setCardNumber(e.target.value)}
                className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 font-mono text-xs text-slate-800"
              />
              <CreditCard className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={expiry}
                onChange={e => setExpiry(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 font-mono text-xs text-slate-800"
                placeholder="MM/YY"
              />
              <input
                type="text"
                value={cvv}
                onChange={e => setCvv(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 font-mono text-xs text-slate-800"
                placeholder="CVV"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-xs disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Verifying Transaction...
                </>
              ) : (
                <>
                  Confirm Simulated Checkout ({currency}{amount})
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
