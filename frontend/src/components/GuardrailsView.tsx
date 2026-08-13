import React from 'react';
import { ShieldCheck, CheckCircle2, AlertCircle, Lock, Wrench, Shield, ArrowRight } from 'lucide-react';
import { Guardrail } from '../types';

interface GuardrailsViewProps {
  guardrails: Guardrail[];
  onApplyGuardrail: (guardrailId: string) => void;
  isLoading: boolean;
}

export const GuardrailsView: React.FC<GuardrailsViewProps> = ({
  guardrails,
  onApplyGuardrail,
  isLoading
}) => {
  const defaultGuardrails = [
    {
      id: 'g_input',
      guardrail_id: 'input_guardrail',
      name: 'Input Guardrail',
      status: 'ACTIVE',
      description: 'Sanitizes external user inputs and external support tickets for malicious prompt patterns.',
      target_tool: 'External Content',
      risk_reduction_est: 30,
      effort: 'LOW'
    },
    {
      id: 'g_tool_perm',
      guardrail_id: 'restrict_crm',
      name: 'Tool Permission Guardrail',
      status: guardrails.find(g => g.guardrail_id === 'restrict_crm')?.status || 'AVAILABLE',
      description: 'Restricts tool API execution permissions to prevent unauthorized query escalations.',
      target_tool: 'CRM',
      risk_reduction_est: 53,
      effort: 'LOW'
    },
    {
      id: 'g_human_approval',
      guardrail_id: 'require_human_approval',
      name: 'Human Approval',
      status: guardrails.find(g => g.guardrail_id === 'require_human_approval')?.status || 'AVAILABLE',
      description: 'Requires explicit human supervisor approval before agent executes sensitive tool calls.',
      target_tool: 'AI Agent',
      risk_reduction_est: 38,
      effort: 'MEDIUM'
    },
    {
      id: 'g_output',
      guardrail_id: 'output_data_filter',
      name: 'Output Data Filter',
      status: 'ACTIVE',
      description: 'Filters sensitive customer PII (credit cards, SSNs, phone numbers) before returning response.',
      target_tool: 'Sensitive Customer Data',
      risk_reduction_est: 25,
      effort: 'LOW'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold">
            SECURITY CONTROLS
          </span>
          <h1 className="text-xl font-bold font-mono text-slate-100">ACTIVE & AVAILABLE GUARDRAILS</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          NovaCare Support AI Security Guardrail Enforcement Matrix
        </p>
      </div>

      {/* Grid of Guardrails */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {defaultGuardrails.map((g) => {
          const isActive = g.status === 'ACTIVE' || g.status === 'APPLIED';

          return (
            <div
              key={g.id}
              className={`p-6 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                isActive
                  ? 'bg-emerald-950/20 border-emerald-500/40 shadow-[0_0_20px_rgba(0,230,118,0.15)]'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Shield className={`w-5 h-5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <h3 className="text-sm font-bold font-mono text-slate-100">{g.name}</h3>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold border ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}>
                    {isActive ? 'ACTIVE' : 'AVAILABLE'}
                  </span>
                </div>

                <p className="text-xs text-slate-300 mt-3 leading-relaxed">{g.description}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <div className="text-xs font-mono text-slate-400">
                  Target: <span className="text-cyan-300 font-bold">{g.target_tool}</span>
                </div>

                {!isActive && (
                  <button
                    onClick={() => onApplyGuardrail(g.guardrail_id)}
                    disabled={isLoading}
                    className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold uppercase transition-all shadow-[0_0_10px_rgba(0,240,255,0.3)] flex items-center gap-1.5"
                  >
                    ACTIVATE <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
