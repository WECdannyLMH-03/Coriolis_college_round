import React, { useState, useEffect } from 'react';
import { Search, X, Users, Globe, Mail, Video, CreditCard, ChevronRight } from 'lucide-react';
import { Contact, Website, Campaign, Webinar, SubscriptionPlan } from '../../types';
import { TabId } from '../layout/Sidebar';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: Contact[];
  websites: Website[];
  campaigns: Campaign[];
  webinars: Webinar[];
  plans: SubscriptionPlan[];
  onNavigate: (tab: TabId, targetId?: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  contacts,
  websites,
  campaigns,
  webinars,
  plans,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle or open handled in parent
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const matchedContacts = q
    ? contacts.filter(c => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.company?.toLowerCase().includes(q))
    : contacts.slice(0, 3);

  const matchedWebsites = q
    ? websites.filter(w => w.title.toLowerCase().includes(q) || w.slug.toLowerCase().includes(q))
    : websites.slice(0, 2);

  const matchedCampaigns = q
    ? campaigns.filter(c => c.name.toLowerCase().includes(q) || c.subject.toLowerCase().includes(q))
    : campaigns.slice(0, 2);

  const matchedWebinars = q
    ? webinars.filter(w => w.title.toLowerCase().includes(q) || w.host.toLowerCase().includes(q))
    : webinars.slice(0, 2);

  const matchedPlans = q
    ? plans.filter(p => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q))
    : plans.slice(0, 2);

  const totalResults = matchedContacts.length + matchedWebsites.length + matchedCampaigns.length + matchedWebinars.length + matchedPlans.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200">
          <Search className="h-5 w-5 text-slate-400 mr-3" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search contacts, websites, campaigns, webinars, plans..."
            className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {totalResults === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400">
              No matching records found for "{query}".
            </div>
          ) : (
            <>
              {/* Contacts */}
              {matchedContacts.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Users className="h-3 w-3 text-emerald-600" />
                    CRM Contacts ({matchedContacts.length})
                  </div>
                  <div className="space-y-1">
                    {matchedContacts.map(c => (
                      <div
                        key={c.id}
                        onClick={() => {
                          onNavigate('crm', c.id);
                          onClose();
                        }}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 transition-colors"
                      >
                        <div>
                          <div className="text-xs font-semibold text-slate-900">{c.name}</div>
                          <div className="text-[11px] text-slate-500">{c.email} • {c.company || 'No Company'}</div>
                        </div>
                        <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {c.leadStage}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Websites */}
              {matchedWebsites.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Globe className="h-3 w-3 text-indigo-600" />
                    Websites & Landing Pages ({matchedWebsites.length})
                  </div>
                  <div className="space-y-1">
                    {matchedWebsites.map(w => (
                      <div
                        key={w.id}
                        onClick={() => {
                          onNavigate('websites', w.id);
                          onClose();
                        }}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 transition-colors"
                      >
                        <div>
                          <div className="text-xs font-semibold text-slate-900">{w.title}</div>
                          <div className="text-[11px] text-slate-500">/{w.slug} • {w.sections.length} sections</div>
                        </div>
                        <span className="text-[10px] font-medium uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                          {w.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Webinars */}
              {matchedWebinars.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Video className="h-3 w-3 text-purple-600" />
                    Webinars ({matchedWebinars.length})
                  </div>
                  <div className="space-y-1">
                    {matchedWebinars.map(wb => (
                      <div
                        key={wb.id}
                        onClick={() => {
                          onNavigate('webinars', wb.id);
                          onClose();
                        }}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 transition-colors"
                      >
                        <div>
                          <div className="text-xs font-semibold text-slate-900">{wb.title}</div>
                          <div className="text-[11px] text-slate-500">Date: {wb.scheduledDate} • Host: {wb.host}</div>
                        </div>
                        <span className="text-[10px] font-medium font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                          {wb.currency}{wb.ticketPrice}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Marketing Campaigns */}
              {matchedCampaigns.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Mail className="h-3 w-3 text-amber-600" />
                    Marketing Campaigns ({matchedCampaigns.length})
                  </div>
                  <div className="space-y-1">
                    {matchedCampaigns.map(cmp => (
                      <div
                        key={cmp.id}
                        onClick={() => {
                          onNavigate('marketing', cmp.id);
                          onClose();
                        }}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 transition-colors"
                      >
                        <div>
                          <div className="text-xs font-semibold text-slate-900">{cmp.name}</div>
                          <div className="text-[11px] text-slate-500">Subject: "{cmp.subject}"</div>
                        </div>
                        <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded uppercase">
                          {cmp.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-400">
          <span>Navigate with click • Press ESC to close</span>
          <span className="font-mono">Nexus Global Search</span>
        </div>
      </div>
    </div>
  );
};
