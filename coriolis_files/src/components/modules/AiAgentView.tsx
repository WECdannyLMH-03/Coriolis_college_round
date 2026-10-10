import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  RotateCw,
  ArrowRight,
  Loader2,
  ChevronRight,
  ListOrdered,
  FileCheck2,
  ShieldAlert,
  Terminal,
  Database,
  Layers,
} from 'lucide-react';
import { Workflow, WorkflowStep } from '../../types';
import { api, AppState } from '../../services/api';
import { useToast } from '../common/Toast';

interface AiAgentViewProps {
  workflows: Workflow[];
  userRole: string;
  onRefresh: () => void;
  onOpenApprovals?: () => void;
}

export const AiAgentView: React.FC<AiAgentViewProps> = ({
  workflows,
  userRole,
  onRefresh,
  onOpenApprovals,
}) => {
  const { showToast } = useToast();
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>(workflows[0]?.id || '');
  const [instructionPrompt, setInstructionPrompt] = useState('');
  const [isPlanning, setIsPlanning] = useState(false);
  const [isExecutingStepId, setIsExecutingStepId] = useState<string | null>(null);
  const [planError, setPlanError] = useState<string | null>(null);

  const samplePrompts = [
    'Launch a paid Python workshop next Friday. Create a landing page, create a webinar with a ticket price of ₹999, capture registrations in the CRM, prepare a marketing campaign for eligible leads, and schedule reminders for registered attendees.',
    'Deploy a Pro Tier subscription plan at $79/mo and draft an outbound announcement email for qualified leads.',
    'Perform a CRM audit on all contacts, segment opted-in developers, and schedule a re-engagement campaign.',
  ];

  const currentWorkflow = workflows.find(w => w.id === selectedWorkflowId) || workflows[0];

  const handlePlanWorkflow = async (promptToUse?: string) => {
    const text = promptToUse || instructionPrompt;
    if (!text.trim()) return;

    setIsPlanning(true);
    setPlanError(null);
    try {
      const planned = await api.planWorkflow(text.trim());
      setSelectedWorkflowId(planned.id);
      setInstructionPrompt('');
      showToast('Generated controlled workflow plan', 'success');
      onRefresh();
    } catch (err: any) {
      setPlanError(err?.message || 'Failed to generate workflow plan');
      showToast(err?.message || 'Failed to plan workflow', 'error');
    } finally {
      setIsPlanning(false);
    }
  };

  const handleExecuteStep = async (stepId: string) => {
    if (!currentWorkflow) return;
    setIsExecutingStepId(stepId);
    try {
      const res = await api.executeWorkflowStep(currentWorkflow.id, stepId);
      if (res.awaitingApproval) {
        showToast('Security Gate: Step requires administrator approval. Request queued.', 'info');
      } else {
        showToast(`Executed step: ${res.step.title}`, 'success');
      }
      onRefresh();
    } catch (err: any) {
      showToast(err?.message || 'Step execution encountered an error', 'error');
    } finally {
      setIsExecutingStepId(null);
    }
  };

  const handleRunAllSteps = async () => {
    if (!currentWorkflow) return;
    for (const step of currentWorkflow.steps) {
      if (step.status === 'pending') {
        setIsExecutingStepId(step.id);
        try {
          const res = await api.executeWorkflowStep(currentWorkflow.id, step.id);
          if (res.awaitingApproval) {
            showToast(`Workflow paused at "${step.title}": Awaiting Approval.`, 'info');
            onRefresh();
            break;
          }
        } catch (err: any) {
          showToast(`Step error: ${err?.message}`, 'error');
          onRefresh();
          break;
        }
      }
    }
    setIsExecutingStepId(null);
    onRefresh();
  };

  const handleApproveStepInline = async (step: WorkflowStep) => {
    if (!step.approvalId) return;
    try {
      await api.approveRequest(step.approvalId);
      showToast(`Approved step: ${step.title}`, 'success');
      // Now re-run step
      await api.executeWorkflowStep(currentWorkflow.id, step.id);
      onRefresh();
    } catch (err: any) {
      showToast('Approval failed: ' + err?.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Agent Header & Command Input Box */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded flex items-center gap-1">
                <Bot className="h-3.5 w-3.5 text-indigo-600" />
                Gemini 3.8 Flash Powered Engine
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Autonomous Execution Engine</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Autonomous Cross-Module AI Business Agent
            </h2>
            <p className="text-xs text-slate-500">
              Accepts high-level business goals, generates dependency-ordered plans, enforces human-in-the-loop security gates, and mutates shared business state.
            </p>
          </div>
        </div>

        {/* Input Bar */}
        <div className="relative">
          <textarea
            value={instructionPrompt}
            onChange={e => setInstructionPrompt(e.target.value)}
            placeholder="Instruct the agent: e.g. Launch a paid Python workshop next Friday. Create a landing page, create a webinar with a ticket price of ₹999, capture registrations in the CRM..."
            className="w-full rounded-xl border border-slate-300 p-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner font-sans min-h-[80px]"
          />

          <div className="mt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
              <span className="font-semibold text-slate-400">Try Prompt:</span>
              <button
                onClick={() => {
                  setInstructionPrompt(samplePrompts[0]);
                  handlePlanWorkflow(samplePrompts[0]);
                }}
                className="rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 px-2.5 py-1 text-[11px] font-medium text-slate-700 transition-colors text-left"
              >
                Python Workshop Complete Flow (₹999)
              </button>
              <button
                onClick={() => {
                  setInstructionPrompt(samplePrompts[1]);
                  handlePlanWorkflow(samplePrompts[1]);
                }}
                className="rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 px-2.5 py-1 text-[11px] font-medium text-slate-700 transition-colors text-left"
              >
                Launch Pro Subscription Plan
              </button>
            </div>

            <button
              onClick={() => handlePlanWorkflow()}
              disabled={isPlanning || !instructionPrompt.trim()}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 transition-colors shadow-xs disabled:opacity-50 shrink-0"
            >
              {isPlanning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating Controlled Plan...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Workflow Plan
                </>
              )}
            </button>
          </div>

          {planError && (
            <div className="mt-2 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {planError}
            </div>
          )}
        </div>
      </div>

      {/* Main Workflow View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Workflow History List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-bold uppercase text-slate-400 tracking-wider">
            Workflow Run History ({workflows.length})
          </div>

          <div className="space-y-2">
            {workflows.map(wf => {
              const isSelected = wf.id === currentWorkflow?.id;
              const completedCount = wf.steps.filter(s => s.status === 'completed').length;
              return (
                <div
                  key={wf.id}
                  onClick={() => setSelectedWorkflowId(wf.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/40 shadow-xs ring-1 ring-indigo-600'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-900 truncate max-w-[190px]">{wf.title}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        wf.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : wf.status === 'running'
                          ? 'bg-indigo-100 text-indigo-800'
                          : wf.status === 'awaiting_approval'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {wf.status.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 line-clamp-1 mb-2 font-medium">
                    "{wf.prompt}"
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-2 border-t border-slate-100">
                    <span>{completedCount} / {wf.steps.length} steps executed</span>
                    <span>{new Date(wf.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Step-by-Step Execution Plan (8 cols) */}
        {currentWorkflow && (
          <div className="lg:col-span-8 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-200 gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                    Execution Plan & Dependencies
                  </span>
                  <h3 className="text-base font-bold text-slate-900">{currentWorkflow.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{currentWorkflow.outcomeSummary}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRunAllSteps}
                    disabled={isExecutingStepId !== null || currentWorkflow.status === 'completed'}
                    className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition-colors shadow-xs disabled:opacity-50"
                  >
                    <Play className="h-3.5 w-3.5" />
                    Run All Steps
                  </button>
                </div>
              </div>

              {/* Security Policy Banner */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-600 mb-6 flex items-start gap-2.5">
                <ShieldCheck className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="text-slate-900">Governance & Approval Enforcement:</strong> Actions marked with{' '}
                  <span className="text-amber-700 font-semibold">Sensitive Approval</span> (e.g. sending outbound marketing blasts or modifying billing plans) cannot proceed automatically without human review.
                </div>
              </div>

              {/* Step Sequence Cards */}
              <div className="space-y-3">
                {currentWorkflow.steps.map((step, idx) => {
                  const isRunning = isExecutingStepId === step.id;
                  const isCompleted = step.status === 'completed';
                  const isAwaitingApproval = step.status === 'awaiting_approval';
                  const isFailed = step.status === 'failed';

                  return (
                    <div
                      key={step.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isRunning
                          ? 'border-indigo-500 bg-indigo-50/40'
                          : isCompleted
                          ? 'border-emerald-200 bg-emerald-50/20'
                          : isAwaitingApproval
                          ? 'border-amber-300 bg-amber-50/40'
                          : isFailed
                          ? 'border-rose-300 bg-rose-50/30'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex h-7 w-7 items-center justify-center rounded-lg font-mono text-xs font-bold shrink-0 mt-0.5 ${
                              isCompleted
                                ? 'bg-emerald-600 text-white'
                                : isRunning
                                ? 'bg-indigo-600 text-white animate-pulse'
                                : isAwaitingApproval
                                ? 'bg-amber-500 text-white'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : step.order}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900">{step.title}</span>
                              <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded uppercase">
                                tool: {step.toolName}
                              </span>
                              {step.requiresApproval && (
                                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded flex items-center gap-1">
                                  <ShieldAlert className="h-3 w-3 text-amber-700" />
                                  Requires Approval
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                              {step.description}
                            </p>

                            {/* Parameters & Result Drawer */}
                            <div className="mt-2 text-[11px] font-mono text-slate-500 bg-slate-100/70 p-2 rounded-lg space-y-1">
                              <div>Input Params: {JSON.stringify(step.inputParams)}</div>
                              {step.outputResult && (
                                <div className="text-emerald-700 font-semibold">
                                  Output Result: {JSON.stringify(step.outputResult)}
                                </div>
                              )}
                              {step.error && (
                                <div className="text-rose-700 font-semibold">
                                  Error: {step.error}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Step Execution Action Buttons */}
                        <div className="shrink-0 flex items-center gap-2">
                          {isAwaitingApproval ? (
                            <div className="flex items-center gap-1.5">
                              {userRole === 'admin' || userRole === 'manager' ? (
                                <button
                                  onClick={() => handleApproveStepInline(step)}
                                  className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 shadow-2xs"
                                >
                                  Approve & Continue
                                </button>
                              ) : (
                                <button
                                  onClick={onOpenApprovals}
                                  className="px-3 py-1.5 rounded-lg bg-amber-100 text-amber-900 text-xs font-bold hover:bg-amber-200"
                                >
                                  Queue Approval
                                </button>
                              )}
                            </div>
                          ) : (
                            <button
                              onClick={() => handleExecuteStep(step.id)}
                              disabled={isRunning || isCompleted}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                isCompleted
                                  ? 'bg-emerald-50 text-emerald-700 cursor-default'
                                  : 'bg-slate-900 text-white hover:bg-slate-800'
                              }`}
                            >
                              {isRunning ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : isCompleted ? (
                                'Done'
                              ) : (
                                'Execute Step'
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Completed Summary Report */}
              {currentWorkflow.status === 'completed' && (
                <div className="mt-6 p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-xs text-emerald-900 flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold text-emerald-950">Workflow Execution Complete:</strong>
                    <p className="mt-0.5 text-emerald-800">
                      All steps executed through controlled backend tools. Shared records updated in CRM, Webinars, Websites, and Marketing.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
