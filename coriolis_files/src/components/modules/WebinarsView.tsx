import React, { useState } from 'react';
import {
  Video,
  Plus,
  Calendar,
  Clock,
  Users,
  CreditCard,
  Play,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  MessageSquare,
  Volume2,
  Mic,
  Share2,
  Mail,
  X,
  Send,
} from 'lucide-react';
import { Webinar, Contact } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../common/Toast';

interface WebinarsViewProps {
  webinars: Webinar[];
  contacts: Contact[];
  userRole: string;
  onRefresh: () => void;
  onOpenPaymentSimulator?: (webinarId: string) => void;
}

export const WebinarsView: React.FC<WebinarsViewProps> = ({
  webinars,
  contacts,
  userRole,
  onRefresh,
  onOpenPaymentSimulator,
}) => {
  const { showToast } = useToast();
  const [selectedWebinarId, setSelectedWebinarId] = useState<string>(webinars[0]?.id || '');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLiveRoomModal, setShowLiveRoomModal] = useState(false);
  const [liveChatMessages, setLiveChatMessages] = useState<string[]>([
    'Devin Vance: Looking forward to the async benchmarks discussion!',
    'Host (Sarah Jenkins): Welcome everyone! We start in 2 minutes.',
    'Aarav Mehta: Audio and stream resolution look sharp.',
  ]);
  const [chatInput, setChatInput] = useState('');

  // Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [host, setHost] = useState('Sarah Jenkins');
  const [scheduledDate, setScheduledDate] = useState('2026-10-16');
  const [scheduledTime, setScheduledTime] = useState('18:00 IST');
  const [ticketPrice, setTicketPrice] = useState(999);
  const [capacity, setCapacity] = useState(250);

  const currentWebinar = webinars.find(w => w.id === selectedWebinarId) || webinars[0];

  const handleCreateWebinar = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newWb = await api.createWebinar({
        title,
        description,
        host,
        scheduledDate,
        scheduledTime,
        ticketPrice: Number(ticketPrice),
        capacity: Number(capacity),
        currency: '₹',
      });
      setShowCreateModal(false);
      setSelectedWebinarId(newWb.id);
      showToast(`Scheduled webinar: ${newWb.title}`, 'success');
      onRefresh();
    } catch (err: any) {
      showToast(err?.message || 'Failed to schedule webinar', 'error');
    }
  };

  const handleMarkAttended = async (contactId: string) => {
    if (!currentWebinar) return;
    try {
      await api.attendWebinar(currentWebinar.id, contactId);
      showToast('Attendance recorded in CRM', 'success');
      onRefresh();
    } catch (err: any) {
      showToast(err?.message || 'Failed to record attendance', 'error');
    }
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setLiveChatMessages([...liveChatMessages, `You: ${chatInput.trim()}`]);
    setChatInput('');
  };

  if (!currentWebinar) {
    return (
      <div className="p-8 text-center text-slate-400">
        No webinars found. Create your first webinar event.
      </div>
    );
  }

  // Calculate attendees from registered contact IDs
  const registeredContacts = contacts.filter(c => currentWebinar.registeredContactIds.includes(c.id));
  const attendedContacts = contacts.filter(c => currentWebinar.attendedContactIds.includes(c.id));
  const ticketRevenue = currentWebinar.registeredContactIds.length * currentWebinar.ticketPrice;
  const attendanceRate = registeredContacts.length > 0
    ? ((attendedContacts.length / registeredContacts.length) * 100).toFixed(0)
    : '0';

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Live Webinar & Workshop Management</h2>
          <p className="text-xs text-slate-500">Connected to landing page registration and CRM attendee history</p>
        </div>

        <button
          onClick={() => {
            setTitle('Advanced Python & Distributed Systems Masterclass');
            setDescription('Deep-dive masterclass on asyncio, multiprocessing, and FastAPI high-load services.');
            setShowCreateModal(true);
          }}
          className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-700 shadow-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          Schedule Webinar
        </button>
      </div>

      {/* Main Grid: Webinar List & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Webinar List (5 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-bold uppercase text-slate-400 tracking-wider">
            Webinar Events ({webinars.length})
          </div>

          <div className="space-y-2">
            {webinars.map(wb => {
              const isSelected = wb.id === currentWebinar.id;
              return (
                <div
                  key={wb.id}
                  onClick={() => setSelectedWebinarId(wb.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-purple-600 bg-purple-50/30 shadow-xs ring-1 ring-purple-600'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-900 truncate max-w-[200px]">{wb.title}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-purple-100 text-purple-800">
                      {wb.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500 mb-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {wb.scheduledDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {wb.scheduledTime}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-600 font-mono pt-2 border-t border-slate-100">
                    <span className="font-bold text-purple-700">
                      {wb.ticketPrice > 0 ? `${wb.currency}${wb.ticketPrice} Ticket` : 'Free Event'}
                    </span>
                    <span>{wb.registeredContactIds.length} Registered</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Webinar Details, Attendees, and Mock Room (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            {/* Banner preview if available */}
            {currentWebinar.bannerImage && (
              <div className="relative h-44 w-full rounded-xl overflow-hidden mb-4 border border-slate-200">
                <img
                  src={currentWebinar.bannerImage}
                  alt={currentWebinar.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4">
                  <div className="text-white">
                    <span className="text-[10px] font-bold bg-purple-600 px-2 py-0.5 rounded uppercase">
                      Live Workshop Session
                    </span>
                    <h3 className="text-base font-bold mt-1 text-white">{currentWebinar.title}</h3>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-200 gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900">{currentWebinar.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{currentWebinar.description}</p>
                <div className="text-[11px] text-slate-400 font-medium mt-1">
                  Host: <strong className="text-slate-700">{currentWebinar.host}</strong> ({currentWebinar.hostTitle})
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowLiveRoomModal(true)}
                  className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-700 transition-colors shadow-xs"
                >
                  <Play className="h-3.5 w-3.5" />
                  Join Mock Live Room
                </button>
              </div>
            </div>

            {/* Performance KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-center">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Registered Leads</div>
                <div className="text-lg font-bold font-mono text-slate-900 mt-1 tabular-nums">
                  {currentWebinar.registeredContactIds.length} / {currentWebinar.capacity}
                </div>
                <span className="text-[10px] text-slate-500 font-medium">CRM Synced</span>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-center">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Attended Live</div>
                <div className="text-lg font-bold font-mono text-purple-600 mt-1 tabular-nums">
                  {currentWebinar.attendedContactIds.length}
                </div>
                <span className="text-[10px] text-purple-600 font-semibold">{attendanceRate}% rate</span>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-center">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Ticket Price</div>
                <div className="text-lg font-bold font-mono text-slate-900 mt-1 tabular-nums">
                  {currentWebinar.currency}{currentWebinar.ticketPrice}
                </div>
                <span className="text-[10px] text-slate-500">Per attendee</span>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-center">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Gross Ticket Volume</div>
                <div className="text-lg font-bold font-mono text-emerald-600 mt-1 tabular-nums">
                  {currentWebinar.currency}{ticketRevenue.toLocaleString()}
                </div>
                <span className="text-[10px] text-emerald-600 font-semibold">Verified Receipts</span>
              </div>
            </div>

            {/* Registered Attendee Roster (from shared CRM) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-900">
                  Registered Attendees ({registeredContacts.length})
                </span>
                <span className="text-[11px] text-slate-400">
                  Shared identity verified from CRM
                </span>
              </div>

              {registeredContacts.length === 0 ? (
                <div className="p-6 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                  No contacts registered yet. Test registration via the Landing Page or Payment Simulator.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {registeredContacts.map(contact => {
                    const hasAttended = currentWebinar.attendedContactIds.includes(contact.id);
                    return (
                      <div
                        key={contact.id}
                        className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-900">{contact.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {contact.email} • {contact.company || 'Individual'}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              hasAttended
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {hasAttended ? 'Attended' : 'Registered (No-show)'}
                          </span>

                          {!hasAttended && (
                            <button
                              onClick={() => handleMarkAttended(contact.id)}
                              className="px-2.5 py-1 rounded bg-purple-50 text-purple-700 hover:bg-purple-100 text-[11px] font-semibold transition-colors"
                            >
                              Mark Attended
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mock Live Webinar Room Modal */}
      {showLiveRoomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-4xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Room Header */}
            <div className="flex items-center justify-between px-6 py-3.5 bg-slate-950 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <span className="flex h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse" />
                <div>
                  <h3 className="text-sm font-bold text-white">{currentWebinar.title}</h3>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Host: {currentWebinar.host} • 250 Participants Online
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowLiveRoomModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Main Stage & Chat Split */}
            <div className="grid grid-cols-1 md:grid-cols-3 flex-1 overflow-hidden">
              {/* Left: Video Stage (2 cols) */}
              <div className="md:col-span-2 relative bg-black flex items-center justify-center min-h-[340px]">
                {currentWebinar.bannerImage ? (
                  <img
                    src={currentWebinar.bannerImage}
                    alt="Webinar Stage"
                    className="w-full h-full object-cover opacity-85"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="text-slate-500 text-xs font-mono">Simulated Live Video Feed</div>
                )}

                {/* Stage Overlays */}
                <div className="absolute top-3 left-3 bg-slate-950/80 text-white text-[11px] font-mono px-2 py-1 rounded">
                  720p HD Stream (Simulated Room)
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-slate-950/80 backdrop-blur-xs p-2 rounded-xl border border-slate-800 text-white">
                  <div className="flex items-center gap-2 text-xs">
                    <Mic className="h-4 w-4 text-emerald-400" />
                    <Volume2 className="h-4 w-4 text-emerald-400" />
                    <span>Presenter Audio Active</span>
                  </div>
                  <div className="text-xs text-purple-300 font-bold">
                    Advanced Python Concurrency Module 02
                  </div>
                </div>
              </div>

              {/* Right: Live Chat (1 col) */}
              <div className="bg-slate-950 p-4 border-l border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs text-slate-400 font-bold">
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5 text-indigo-400" />
                      Live Chat
                    </span>
                    <span className="text-[10px] text-emerald-400">Connected</span>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto text-xs text-slate-300 pr-1">
                    {liveChatMessages.map((msg, i) => (
                      <div key={i} className="p-2 rounded bg-slate-900 border border-slate-800/80">
                        {msg}
                      </div>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleSendChatMessage} className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    placeholder="Ask a question..."
                    className="flex-1 rounded-lg bg-slate-900 border border-slate-800 px-3 py-1.5 text-xs text-white focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </form>
              </div>
            </div>

            {/* Bottom Modal Actions */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono">
                Mock Webinar Room • Real video providers (Zoom/Whereby) can be bound behind this interface
              </span>
              <button
                onClick={() => setShowLiveRoomModal(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 text-white font-bold hover:bg-slate-700 text-xs"
              >
                Leave Room
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Webinar Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Schedule Live Webinar</h3>
            <p className="text-xs text-slate-500 mb-4">Integrate with landing pages, tickets, and CRM attendance.</p>

            <form onSubmit={handleCreateWebinar} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Webinar Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Advanced Python Masterclass"
                  className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Date</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={e => setScheduledDate(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Time</label>
                  <input
                    type="text"
                    value={scheduledTime}
                    onChange={e => setScheduledTime(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-900 font-mono"
                    placeholder="18:00 IST"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Ticket Price (₹)</label>
                  <input
                    type="number"
                    value={ticketPrice}
                    onChange={e => setTicketPrice(Number(e.target.value))}
                    className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-900 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Capacity (Seats)</label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={e => setCapacity(Number(e.target.value))}
                    className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-900 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Host Name</label>
                <input
                  type="text"
                  value={host}
                  onChange={e => setHost(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-purple-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-purple-700"
                >
                  Confirm Webinar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
