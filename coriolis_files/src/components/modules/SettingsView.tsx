import React from 'react';
import {
  Settings,
  Building2,
  ShieldCheck,
  Key,
  RotateCcw,
  CheckCircle2,
  UserCheck,
  AlertTriangle,
} from 'lucide-react';
import { AppState } from '../../services/api';
import { UserRole } from '../../types';

interface SettingsViewProps {
  state: AppState;
  onRoleChange: (role: UserRole) => void;
  onResetData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  state,
  onRoleChange,
  onResetData,
}) => {
  const { organization, currentUser } = state;
  const [showConfirmReset, setShowConfirmReset] = React.useState(false);

  return (
    <div className="space-y-6">
      {/* Settings Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Workspace & Organization Configuration</h2>
          <p className="text-xs text-slate-500">Security permissions, active profile, and system recovery</p>
        </div>

        <button
          onClick={() => setShowConfirmReset(true)}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5 text-rose-500" />
          Reset to Seed Baseline
        </button>
      </div>

      {showConfirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 mb-3 text-rose-600">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-sm font-bold text-slate-900">Confirm System Reset</h3>
            </div>
            <p className="text-xs text-slate-600 mb-4">
              Are you sure you want to restore all CRM contacts, websites, webinars, and subscription databases back to default baseline?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="px-3 py-1.5 text-xs text-slate-600 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowConfirmReset(false);
                  onResetData();
                }}
                className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
              >
                Reset Database
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Organization Info */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
            <Building2 className="h-4 w-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Organization Profile</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 font-semibold uppercase text-[10px]">Organization Name</label>
              <div className="font-bold text-slate-800 text-sm">{organization.name}</div>
            </div>
            <div>
              <label className="text-slate-400 font-semibold uppercase text-[10px]">Domain & Host</label>
              <div className="font-mono text-slate-800">{organization.domain}</div>
            </div>
            <div>
              <label className="text-slate-400 font-semibold uppercase text-[10px]">Base Currency</label>
              <div className="font-mono font-bold text-slate-800">{organization.currency} (Indian Rupee / Global)</div>
            </div>
          </div>
        </div>

        {/* Current User & Role Switcher */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
            <UserCheck className="h-4 w-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Active Operator Profile (RBAC)</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-3">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="h-10 w-10 rounded-full object-cover border border-slate-200"
                referrerPolicy="no-referrer"
              />
              <div>
                <div className="font-bold text-slate-900">{currentUser.name}</div>
                <div className="text-slate-500 font-mono text-[11px]">{currentUser.email}</div>
              </div>
            </div>

            <div>
              <label className="text-slate-500 font-semibold mb-1 block">Switch Active Role for Testing</label>
              <select
                value={currentUser.role}
                onChange={e => onRoleChange(e.target.value as UserRole)}
                className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-slate-50 text-slate-900 font-bold"
              >
                <option value="admin">Administrator (Can publish, send emails, delete, approve)</option>
                <option value="manager">Operations Manager (Can approve campaigns & webinars)</option>
                <option value="marketing">Marketing Specialist (Sensitive sends require approval)</option>
                <option value="viewer">Read-Only Viewer (Cannot modify business records)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Role Permission Matrix */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
          <ShieldCheck className="h-4 w-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">Role-Based Permission Matrix (RBAC)</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold">
                <th className="py-2.5 px-3">Business Operation</th>
                <th className="py-2.5 px-3 text-center">Administrator</th>
                <th className="py-2.5 px-3 text-center">Manager</th>
                <th className="py-2.5 px-3 text-center">Marketing</th>
                <th className="py-2.5 px-3 text-center">Viewer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-800">Publish Website Landing Page</td>
                <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">Direct</td>
                <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">Direct</td>
                <td className="py-2.5 px-3 text-center text-amber-600 font-bold">Needs Approval</td>
                <td className="py-2.5 px-3 text-center text-slate-400">Denied</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-800">Dispatch Outbound Email Broadcast</td>
                <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">Direct</td>
                <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">Direct</td>
                <td className="py-2.5 px-3 text-center text-amber-600 font-bold">Needs Approval</td>
                <td className="py-2.5 px-3 text-center text-slate-400">Denied</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-800">Delete CRM Contact Records</td>
                <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">Allowed</td>
                <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">Allowed</td>
                <td className="py-2.5 px-3 text-center text-slate-400">Denied</td>
                <td className="py-2.5 px-3 text-center text-slate-400">Denied</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-800">Execute Autonomous AI Workflows</td>
                <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">Full</td>
                <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">Full</td>
                <td className="py-2.5 px-3 text-center text-indigo-600 font-bold">Gated</td>
                <td className="py-2.5 px-3 text-center text-slate-400">Denied</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-800">Grant Approval in Sensitive Queue</td>
                <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">Authorized</td>
                <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">Authorized</td>
                <td className="py-2.5 px-3 text-center text-slate-400">Denied</td>
                <td className="py-2.5 px-3 text-center text-slate-400">Denied</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Credentials & Environment Configuration Notice */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Key className="h-4 w-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">AI Model Credentials & Secrets</h3>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          We've updated your app's Gemini API calls to our recommended server-side approach for full-stack applications. Your API key can be found in the <strong>Settings &gt; Secrets</strong> panel of AI Studio and is injected automatically via <code className="font-mono text-indigo-600">process.env.GEMINI_API_KEY</code> on the backend.
        </p>
      </div>
    </div>
  );
};
