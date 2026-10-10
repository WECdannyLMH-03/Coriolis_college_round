import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Trash2,
  Edit,
  Download,
  Upload,
  Clock,
  Tag,
  CheckCircle2,
  XCircle,
  Video,
  CreditCard,
  Building2,
  Mail,
  Phone,
  Calendar,
  AlertTriangle,
  Kanban,
  List,
  Eye,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { Contact, LeadStage, LeadSource, ConsentStatus } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../common/Toast';

interface CrmViewProps {
  contacts: Contact[];
  userRole: string;
  onRefresh: () => void;
  onSimulatePaymentForContact?: (contactId: string) => void;
}

export const CrmView: React.FC<CrmViewProps> = ({
  contacts,
  userRole,
  onRefresh,
  onSimulatePaymentForContact,
}) => {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [selectedSegment, setSelectedSegment] = useState<'all' | 'qualified' | 'webinar_attendees' | 'customers' | 'opted_out'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'pipeline'>('table');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);

  // Add/Edit Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    leadStage: 'New' as LeadStage,
    leadSource: 'Website Form' as LeadSource,
    tags: 'Developer, Workshop',
    notes: '',
    consentStatus: 'opted_in' as ConsentStatus,
  });

  // CSV Import State
  const [csvText, setCsvText] = useState(`Name,Email,Company,Stage
Jane Doe,jane.doe@enterprise.com,Enterprise Tech,Qualified
Rohan Roy,rohan.roy@cloudpulse.io,CloudPulse,New
Liam Schmidt,liam@schmidt-labs.de,Schmidt Labs,Contacted`);

  // Filtering
  const filteredContacts = contacts.filter(c => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.company?.toLowerCase().includes(q);
    const matchesStage = selectedStage === 'all' || c.leadStage === selectedStage;

    let matchesSegment = true;
    if (selectedSegment === 'qualified') matchesSegment = ['Qualified', 'Converted'].includes(c.leadStage);
    if (selectedSegment === 'webinar_attendees') matchesSegment = c.webinarIds.length > 0;
    if (selectedSegment === 'customers') matchesSegment = c.leadStage === 'Converted' || !!c.subscriptionId;
    if (selectedSegment === 'opted_out') matchesSegment = c.consentStatus === 'opted_out';

    return matchesSearch && matchesStage && matchesSegment;
  });

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
      const res = await api.createContact({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        leadStage: formData.leadStage,
        leadSource: formData.leadSource,
        tags: tagsArray,
        notes: formData.notes,
        consentStatus: formData.consentStatus,
      });

      if (res.merged) {
        showToast(`Duplicate email detected! Record merged with existing contact for ${formData.email}.`, 'info');
      } else {
        showToast(`Contact saved: ${formData.name}`, 'success');
      }
      setShowAddModal(false);
      onRefresh();
    } catch (err: any) {
      showToast(err?.message || 'Error saving contact', 'error');
    }
  };

  const handleDeleteContact = async () => {
    if (!contactToDelete) return;
    try {
      await api.deleteContact(contactToDelete.id);
      showToast(`Deleted contact: ${contactToDelete.name}`, 'info');
      setContactToDelete(null);
      if (selectedContact?.id === contactToDelete.id) setSelectedContact(null);
      onRefresh();
    } catch (err: any) {
      showToast(err?.message || 'Delete operation rejected', 'error');
    }
  };

  const handleStageChange = async (contactId: string, newStage: LeadStage) => {
    await api.updateContact(contactId, { leadStage: newStage });
    onRefresh();
    if (selectedContact && selectedContact.id === contactId) {
      setSelectedContact({ ...selectedContact, leadStage: newStage });
    }
  };

  const handleImportCsv = async () => {
    try {
      const res = await api.importCsv(csvText);
      showToast(`Import completed: ${res.imported} contacts added, ${res.merged} existing merged.`, 'success');
      setShowImportModal(false);
      onRefresh();
    } catch (err: any) {
      showToast(err?.message || 'CSV Import error', 'error');
    }
  };

  const handleExportCsv = () => {
    const headers = ['Name', 'Email', 'Phone', 'Company', 'LeadStage', 'LeadSource', 'Consent', 'Tags'];
    const rows = filteredContacts.map(c => [
      `"${c.name}"`,
      `"${c.email}"`,
      `"${c.phone || ''}"`,
      `"${c.company || ''}"`,
      `"${c.leadStage}"`,
      `"${c.leadSource}"`,
      `"${c.consentStatus}"`,
      `"${c.tags.join('; ')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `nexus_crm_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const stages: LeadStage[] = ['New', 'Contacted', 'Qualified', 'Converted', 'Lost'];

  return (
    <div className="space-y-6">
      {/* Top Header & Segmentation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        {/* Segment Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-100 rounded-xl">
          {[
            { id: 'all', label: `All Contacts (${contacts.length})` },
            { id: 'qualified', label: 'Qualified Leads' },
            { id: 'webinar_attendees', label: 'Webinar Leads' },
            { id: 'customers', label: 'Converted Customers' },
            { id: 'opted_out', label: 'Opted Out' },
          ].map(seg => (
            <button
              key={seg.id}
              onClick={() => setSelectedSegment(seg.id as any)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                selectedSegment === seg.id
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {seg.label}
            </button>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500'
              }`}
              title="Table View"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('pipeline')}
              className={`p-1.5 rounded-md text-xs ${
                viewMode === 'pipeline' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500'
              }`}
              title="Pipeline Kanban"
            >
              <Kanban className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            title="Export filtered records to CSV"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            Export CSV
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            title="Import contacts from CSV"
          >
            <Upload className="h-3.5 w-3.5 text-slate-500" />
            Import CSV
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Contact
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, company, tags..."
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-slate-400 shrink-0" />
          <select
            value={selectedStage}
            onChange={e => setSelectedStage(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="all">All Stages ({contacts.length})</option>
            {stages.map(s => (
              <option key={s} value={s}>
                Stage: {s} ({contacts.filter(c => c.leadStage === s).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main View: Table OR Kanban Pipeline */}
      {viewMode === 'table' ? (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 font-semibold text-slate-500">
                  <th className="py-3 px-4">Contact Identity</th>
                  <th className="py-3 px-4">Lead Stage</th>
                  <th className="py-3 px-4">Source & Tags</th>
                  <th className="py-3 px-4">Consent</th>
                  <th className="py-3 px-4">Webinars / Sub</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredContacts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No contacts found matching the filters.
                    </td>
                  </tr>
                ) : (
                  filteredContacts.map(contact => (
                    <tr
                      key={contact.id}
                      className="hover:bg-slate-50/60 transition-colors cursor-pointer group"
                      onClick={() => setSelectedContact(contact)}
                    >
                      {/* Name & Email */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {contact.name}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                          {contact.email}
                        </div>
                        {contact.company && (
                          <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Building2 className="h-3 w-3" />
                            {contact.company}
                          </div>
                        )}
                      </td>

                      {/* Stage Dropdown */}
                      <td className="py-3 px-4" onClick={e => e.stopPropagation()}>
                        <select
                          value={contact.leadStage}
                          onChange={e => handleStageChange(contact.id, e.target.value as LeadStage)}
                          className={`rounded-lg px-2 py-1 text-[11px] font-bold border ${
                            contact.leadStage === 'Converted'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : contact.leadStage === 'Qualified'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : contact.leadStage === 'Contacted'
                              ? 'bg-purple-50 text-purple-800 border-purple-200'
                              : contact.leadStage === 'Lost'
                              ? 'bg-slate-100 text-slate-600 border-slate-300'
                              : 'bg-blue-50 text-blue-800 border-blue-200'
                          }`}
                        >
                          {stages.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>

                      {/* Source & Tags */}
                      <td className="py-3 px-4">
                        <div className="text-[11px] text-slate-700 font-medium">
                          {contact.leadSource}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {contact.tags.slice(0, 2).map((t, i) => (
                            <span key={i} className="text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded">
                              {t}
                            </span>
                          ))}
                          {contact.tags.length > 2 && (
                            <span className="text-[10px] text-slate-400">+{contact.tags.length - 2}</span>
                          )}
                        </div>
                      </td>

                      {/* Consent */}
                      <td className="py-3 px-4">
                        {contact.consentStatus === 'opted_in' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                            Opted In
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                            <XCircle className="h-3.5 w-3.5 text-slate-400" />
                            Opted Out
                          </span>
                        )}
                      </td>

                      {/* Webinars / Sub */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {contact.webinarIds.length > 0 && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-purple-700 font-mono bg-purple-50 px-2 py-0.5 rounded">
                              <Video className="h-3 w-3" />
                              {contact.webinarIds.length} Event{contact.webinarIds.length > 1 ? 's' : ''}
                            </span>
                          )}
                          {contact.subscriptionId && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-indigo-700 font-mono bg-indigo-50 px-2 py-0.5 rounded">
                              <CreditCard className="h-3 w-3" />
                              Active Sub
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedContact(contact)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100"
                            title="View Profile Timeline"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setContactToDelete(contact)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100"
                            title="Delete Contact"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Kanban Pipeline View */
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {stages.map(stage => {
            const stageContacts = filteredContacts.filter(c => c.leadStage === stage);
            return (
              <div key={stage} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 flex flex-col">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                  <span className="text-xs font-bold text-slate-800">{stage}</span>
                  <span className="text-[10px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {stageContacts.length}
                  </span>
                </div>

                <div className="space-y-2 flex-1 overflow-y-auto max-h-[600px]">
                  {stageContacts.length === 0 ? (
                    <div className="py-6 text-center text-[11px] text-slate-400">
                      Empty stage
                    </div>
                  ) : (
                    stageContacts.map(contact => (
                      <div
                        key={contact.id}
                        onClick={() => setSelectedContact(contact)}
                        className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs hover:border-indigo-300 hover:shadow-xs transition-all cursor-pointer"
                      >
                        <div className="text-xs font-bold text-slate-900 truncate">{contact.name}</div>
                        <div className="text-[10px] text-slate-500 truncate font-mono">{contact.email}</div>
                        {contact.company && (
                          <div className="text-[10px] text-slate-400 mt-1 truncate">{contact.company}</div>
                        )}
                        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                          <span>{contact.leadSource}</span>
                          {contact.webinarIds.length > 0 && (
                            <span className="text-purple-600 font-bold">Webinar</span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Contact Profile Drawer / Modal */}
      {selectedContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/40 backdrop-blur-2xs">
          <div className="w-full max-w-md h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  Unified Contact Profile
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">{selectedContact.name}</h3>
                <div className="text-xs text-slate-500 font-mono">{selectedContact.email}</div>
              </div>
              <button
                onClick={() => setSelectedContact(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Profile Content & Activity Timeline */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Key Attributes */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Stage</span>
                  <div className="font-bold text-slate-800">{selectedContact.leadStage}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Lead Source</span>
                  <div className="font-bold text-slate-800">{selectedContact.leadSource}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Company</span>
                  <div className="font-bold text-slate-800">{selectedContact.company || 'Not Specified'}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Consent Status</span>
                  <div className="font-bold text-emerald-600 capitalize">{selectedContact.consentStatus.replace('_', ' ')}</div>
                </div>
              </div>

              {/* Tags & Notes */}
              <div>
                <div className="text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-indigo-600" />
                  Assigned Tags
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedContact.tags.map((t, idx) => (
                    <span key={idx} className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {selectedContact.notes && (
                <div>
                  <div className="text-xs font-bold text-slate-900 mb-1">Internal Notes</div>
                  <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-700 leading-relaxed">
                    {selectedContact.notes}
                  </div>
                </div>
              )}

              {/* Shared Identity Timeline */}
              <div>
                <div className="text-xs font-bold text-slate-900 mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-emerald-600" />
                    Activity & Engagement Timeline
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {selectedContact.activityTimeline.length} events
                  </span>
                </div>

                <div className="space-y-3 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-200">
                  {selectedContact.activityTimeline.map((act) => (
                    <div key={act.id} className="relative pl-7 text-xs">
                      <div className="absolute left-1.5 top-1 h-3 w-3 rounded-full bg-indigo-600 ring-4 ring-white" />
                      <div className="font-bold text-slate-900">{act.title}</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">{act.description}</div>
                      <div className="text-[10px] font-mono text-slate-400 mt-1">
                        {new Date(act.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions Drawer Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              {onSimulatePaymentForContact && selectedContact.leadStage !== 'Converted' ? (
                <button
                  onClick={() => {
                    onSimulatePaymentForContact(selectedContact.id);
                    setSelectedContact(null);
                  }}
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition-colors"
                >
                  Test Checkout & Convert
                </button>
              ) : (
                <span className="text-[11px] text-slate-400">Verified Shared Identity</span>
              )}

              <button
                onClick={() => setContactToDelete(selectedContact)}
                className="text-xs font-semibold text-rose-600 hover:text-rose-800"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {contactToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 mb-3 text-rose-600">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-sm font-bold text-slate-900">Confirm Contact Deletion</h3>
            </div>
            <p className="text-xs text-slate-600 mb-4">
              Are you sure you want to delete <strong>{contactToDelete.name}</strong> ({contactToDelete.email})? This action will remove their profile and activity history.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setContactToDelete(null)}
                className="px-3 py-1.5 text-xs text-slate-600 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteContact}
                className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Create CRM Contact Record</h3>
            <p className="text-xs text-slate-500 mb-4">Automatic email normalization and duplicate detection enabled.</p>

            <form onSubmit={handleSaveContact} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Vikram Joshi"
                  className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Email Address (Normalized)</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. vikram.joshi@datapulse.io"
                  className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-900 font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Company</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={e => setFormData({ ...formData, company: e.target.value })}
                    className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Lead Stage</label>
                  <select
                    value={formData.leadStage}
                    onChange={e => setFormData({ ...formData, leadStage: e.target.value as any })}
                    className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                  >
                    {stages.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Lead Source</label>
                  <select
                    value={formData.leadSource}
                    onChange={e => setFormData({ ...formData, leadSource: e.target.value as any })}
                    className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                  >
                    <option value="Website Form">Website Form</option>
                    <option value="Webinar Registration">Webinar Registration</option>
                    <option value="Cold Inbound">Cold Inbound</option>
                    <option value="AI Campaign">AI Campaign</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={e => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Internal Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                  rows={2}
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Batch CSV Import</h3>
            <p className="text-xs text-slate-500 mb-4">Paste comma-separated data. Header row required (Name, Email, Company, Stage).</p>

            <textarea
              value={csvText}
              onChange={e => setCsvText(e.target.value)}
              className="w-full h-40 text-xs font-mono rounded-lg border border-slate-300 p-3 text-slate-800 bg-slate-50 focus:outline-none"
            />

            <div className="pt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImportCsv}
                className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-indigo-700"
              >
                Process Batch Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
