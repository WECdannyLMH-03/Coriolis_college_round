import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  UserCheck,
  FileText,
  Search,
  Filter,
  Eye,
  Check,
  X,
  ShieldAlert,
} from 'lucide-react';
import { ApprovalRequest, AuditLog } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../common/Toast';

interface ApprovalsViewProps {
  approvals: ApprovalRequest[];
  auditLogs: AuditLog[];
  userRole: string;
  onRefresh: () => void;
}

export const ApprovalsView: React.FC<ApprovalsViewProps> = ({
  approvals,
  auditLogs,
  userRole,
  onRefresh,
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'queue' | 'audit'>('queue');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [auditSearch, setAuditSearch] = useState('');

  const pendingApprovals = approvals.filter(a => a.status === 'pending');
  const pastApprovals = approvals.filter(a => a.status !== 'pending');

  const handleApprove = async (id: string) => {
    try {
      await api.approveRequest(id);
      showToast('Approved request successfully', 'success');
      onRefresh();
    } catch (err: any) {
      showToast(err?.message || 'Approval failed', 'error');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.rejectRequest(id, rejectReason || 'Declined by reviewer');
      setRejectingId(null);
      setRejectReason('');
      showToast('Rejected request', 'info');
      onRefresh();
    } catch (err: any) {
      showToast(err?.message || 'Rejection failed', 'error');
    }
  };

  const filteredLogs = auditLogs.filter(log => {
    const q = auditSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      log.action.toLowerCase().includes(q) ||
      log.actor.toLowerCase().includes(q) ||
      log.resourceType.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Governance, Approvals & Immutable Audit Trail</h2>
          <p className="text-xs text-slate-500">Security gates for sensitive operations (email dispatches, site publishing, refunds)</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5">
            <button
              onClick={() => setActiveTab('queue')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                activeTab === 'queue' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Approval Queue ({pendingApprovals.length})
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                activeTab === 'audit' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Audit Log ({auditLogs.length})
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'queue' ? (
        <div className="space-y-6">
          {/* Pending Queue Section */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-600" />
                Action Pending Review ({pendingApprovals.length})
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">
                Current Role: <strong className="text-slate-800 uppercase">{userRole}</strong>
              </span>
            </div>

            {pendingApprovals.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                <div className="font-bold text-slate-700">Approval Queue is Clear</div>
                <p className="max-w-md">No pending requests. Trigger a marketing campaign send or publish a site to test authorization gating.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingApprovals.map(req => (
                  <div
                    key={req.id}
                    className="p-5 rounded-xl border border-amber-200 bg-amber-50/40 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded uppercase">
                          {req.type.replace('_', ' ')}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 mt-1">{req.title}</h4>
                        <p className="text-xs text-slate-600 mt-0.5">{req.description}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {userRole === 'admin' || userRole === 'manager' ? (
                          <>
                            <button
                              onClick={() => handleApprove(req.id)}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-xs"
                            >
                              <Check className="h-3.5 w-3.5" />
                              Approve
                            </button>
                            <button
                              onClick={() => setRejectingId(req.id)}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 shadow-xs"
                            >
                              <X className="h-3.5 w-3.5" />
                              Reject
                            </button>
                          </>
                        ) : (
                          <span className="text-[11px] text-amber-800 font-bold bg-amber-100/80 px-2.5 py-1 rounded">
                            Requires Admin/Manager Role to Approve
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Exact proposed payload inspector */}
                    <div className="text-[11px] font-mono text-slate-700 bg-white p-3 rounded-lg border border-amber-200/80 space-y-1">
                      <div className="font-bold text-slate-900 mb-1">Bound Action Parameters:</div>
                      {Object.entries(req.payload).map(([k, v]) => (
                        <div key={k} className="flex gap-2">
                          <span className="text-slate-400">{k}:</span>
                          <span className="text-slate-800 font-semibold">{String(v)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Rejection input box */}
                    {rejectingId === req.id && (
                      <div className="mt-3 p-3 bg-white rounded-lg border border-rose-200 space-y-2 animate-in fade-in">
                        <label className="text-xs font-semibold text-rose-700">Reason for Rejection</label>
                        <input
                          type="text"
                          value={rejectReason}
                          onChange={e => setRejectReason(e.target.value)}
                          placeholder="e.g. Needs pricing adjustment before sending"
                          className="w-full text-xs rounded border border-slate-300 px-3 py-1.5"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setRejectingId(null)}
                            className="px-3 py-1 text-xs text-slate-600"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleReject(req.id)}
                            className="px-3 py-1 text-xs font-bold text-white bg-rose-600 rounded"
                          >
                            Confirm Rejection
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past Resolved Approvals */}
          {pastApprovals.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Resolved Decisions History ({pastApprovals.length})
              </h3>
              <div className="divide-y divide-slate-100">
                {pastApprovals.map(a => (
                  <div key={a.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{a.title}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        Reviewed by {a.reviewedBy || 'Admin'} at {new Date(a.reviewedAt || a.createdAt).toLocaleString()}
                        {a.rejectionReason && ` • Reason: "${a.rejectionReason}"`}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        a.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {a.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Audit Trail Table */
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden space-y-4 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Compliance Audit Trail</h3>
              <p className="text-xs text-slate-500">Immutable ledger of business mutations, approvals, and AI tool operations</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={auditSearch}
                onChange={e => setAuditSearch(e.target.value)}
                placeholder="Filter logs by actor, action..."
                className="w-full text-xs rounded-xl border border-slate-300 pl-8 pr-3 py-1.5 focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actor & Role</th>
                  <th className="py-3 px-4">Action Type</th>
                  <th className="py-3 px-4">Resource Target</th>
                  <th className="py-3 px-4">Outcome</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900">{log.actor}</span>{' '}
                      <span className="text-[10px] text-slate-400 uppercase">({log.role})</span>
                    </td>
                    <td className="py-3 px-4 font-bold text-indigo-700">{log.action}</td>
                    <td className="py-3 px-4 text-slate-600">{log.resourceType}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          log.outcome === 'success'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {log.outcome}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-sans text-xs max-w-xs truncate">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
