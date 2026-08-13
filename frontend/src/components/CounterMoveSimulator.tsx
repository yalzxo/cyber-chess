import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, Zap, CheckCircle2, AlertTriangle, TrendingDown, Layers } from 'lucide-react';
import { Guardrail, RiskScore, NetworkGraph } from '../types';
import { AttackGraph } from './AttackGraph';

interface CounterMoveSimulatorProps {
  guardrails: Guardrail[];
  risk: RiskScore;
  network: NetworkGraph;
  onApplyGuardrail: (guardrailId: string) => void;
  onRunWhatIf: (guardrailId: string) => void;
  isLoading: boolean;
}

export const CounterMoveSimulator: React.FC<CounterMoveSimulatorProps> = ({
  guardrails,
  risk,
  network,
  onApplyGuardrail,
  onRunWhatIf,
  isLoading
}) => {
  const [selectedGuardrail, setSelectedGuardrail] = useState<string>('restrict_crm');

  const catalog = [
    {
      id: 'restrict_crm',
      name: 'Restrict CRM Access',
      riskBefore: 82,
      riskAfter: 29,
      reduction: 53,
      effort: 'LOW',
      desc: 'Revokes write access to CRM. Intercepts transition between Customer Support AI and Customer Database.'
    },
    {
      id: 'require_human_approval',
      name: 'Require Human Approval',
      riskBefore: 82,
      riskAfter: 44,
      reduction: 38,
      effort: 'MEDIUM',
      desc: 'Enforces human review for all database queries and external tool invocations.'
    },
    {
      id: 'disable_email',
      name: 'Disable External Email Tool',
      riskBefore: 82,
      riskAfter: 57,
      reduction: 25,
      effort: 'LOW',
      desc: 'Disables outbound email execution capabilities to prevent automated exfiltration.'
    },
    {
      id: 'sandbox_agent',
      name: 'Sandbox Agent',
      riskBefore: 82,
      riskAfter: 37,
      reduction: 45,
      effort: 'HIGH',
      desc: 'Isolates AI agent in a sandboxed read-only runtime with strict rate limits.'
    }
  ];

  const currentDef = catalog.find(c => c.id === selectedGuardrail) || catalog[0];

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-bold">
            DEFENSIVE ANALYTICS
          </span>
          <h1 className="text-xl font-bold font-mono text-slate-100">COUNTER-MOVE SIMULATOR</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Evaluate candidate guardrails and analyze calculated attack path interdictions
        </p>
      </div>

      {/* 4 Defense Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {catalog.map((def) => {
          const isSelected = selectedGuardrail === def.id;

          return (
            <div
              key={def.id}
              onClick={() => {
                setSelectedGuardrail(def.id);
                onRunWhatIf(def.id);
              }}
              className={`p-5 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? 'bg-cyan-950/30 border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.25)] ring-1 ring-cyan-400'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    Effort: {def.effort}
                  </span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                </div>

                <h3 className="text-sm font-bold font-mono text-slate-100 mt-3">{def.name}</h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed line-clamp-3">{def.desc}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Risk Drop</span>
                  <span className="text-xs font-mono font-bold text-cyan-300">
                    {def.riskBefore} → {def.riskAfter}
                  </span>
                </div>
                <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold">
                  -{def.reduction} pts
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Defense Impact Comparison */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Stats */}
        <div className="space-y-4 flex flex-col justify-between">
          <div>
            <div className="text-xs font-mono text-cyan-400 font-bold uppercase">SELECTED GUARDRAIL EVALUATION</div>
            <h2 className="text-lg font-bold text-slate-100 font-mono mt-1">{currentDef.name}</h2>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">{currentDef.desc}</p>
          </div>

          <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">BEFORE Risk Score:</span>
              <span className="text-sm font-mono font-bold text-rose-400">{currentDef.riskBefore} / 100</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">AFTER Guardrail Applied:</span>
              <span className="text-sm font-mono font-bold text-emerald-400">{currentDef.riskAfter} / 100</span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-800 pt-2">
              <span className="text-xs text-slate-400">Net Risk Reduction:</span>
              <span className="text-sm font-mono font-bold text-cyan-300 flex items-center gap-1">
                <TrendingDown className="w-4 h-4" /> {currentDef.reduction} points
              </span>
            </div>
          </div>

          <button
            onClick={() => onApplyGuardrail(currentDef.id)}
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(0,240,255,0.3)] flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" /> COMMIT GUARDRAIL TO ENVIRONMENT
          </button>
        </div>

        {/* Right Graph Preview */}
        <div className="lg:col-span-2 space-y-2">
          <div className="text-xs font-mono text-slate-400 flex items-center justify-between">
            <span>GRAPH PATH INTERACTION PREVIEW</span>
            <span className="text-cyan-400">{currentDef.name} active</span>
          </div>
          <AttackGraph nodesData={network.nodes} edgesData={network.edges} />
        </div>
      </div>
    </div>
  );
};
