import React, { useState } from 'react';
import {
  ShieldAlert,
  Bot,
  Flame,
  ArrowRight,
  TrendingDown,
  CheckCircle,
  Zap,
  Lock,
  Layers,
  ChevronRight,
  Shield,
  Activity
} from 'lucide-react';
import { AttackGraph } from './AttackGraph';
import { NetworkGraph, AttackPath, RiskScore, Recommendation, AttackMove } from '../types';

interface CommandCenterProps {
  network: NetworkGraph;
  attack: AttackPath;
  risk: RiskScore;
  recommendation: Recommendation;
  onApplyGuardrail: (guardrailId: string) => void;
  onOpenWhatIf: () => void;
  isLoading: boolean;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
  network,
  attack,
  risk,
  recommendation,
  onApplyGuardrail,
  onOpenWhatIf,
  isLoading
}) => {
  const [highlightedTool, setHighlightedTool] = useState<string | null>(null);

  const isHighRisk = risk.risk_score >= 70;
  const isBlocked = attack.is_blocked;

  const defaultMoves: AttackMove[] = [
    { step: 1, action: "Prompt Injection", probability: 0.96, affected_tool: "External Content", risk_level: "info", is_current: true, is_critical: false },
    { step: 2, action: "Instruction Hijacking", probability: 0.89, affected_tool: "AI Agent", risk_level: "monitored", is_current: false, is_critical: false },
    { step: 3, action: "CRM Tool Abuse", probability: 0.81, affected_tool: "CRM", risk_level: "high", is_current: false, is_critical: true },
    { step: 4, action: "Customer Database Access", probability: 0.72, affected_tool: "Customer Database", risk_level: "critical", is_current: false, is_critical: false },
    { step: 5, action: "Sensitive Data Retrieval", probability: 0.68, affected_tool: "Sensitive Customer Data", risk_level: "critical", is_current: false, is_critical: false },
    { step: 6, action: "Data Aggregation", probability: 0.54, affected_tool: "Staging Buffer", risk_level: "high", is_current: false, is_critical: false },
    { step: 7, action: "Data Exfiltration Attempt", probability: 0.43, affected_tool: "Exfiltration Target", risk_level: "critical", is_current: false, is_critical: false },
  ];

  const movesList = attack.moves && attack.moves.length > 0 ? attack.moves : defaultMoves;

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'high': return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'medium': return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'monitored': return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      default: return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top KPI Header Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* KPI 1: Cyber Risk */}
        <div className={`p-4 rounded-2xl border transition-all duration-300 ${
          isHighRisk
            ? 'bg-rose-950/20 border-rose-500/40 shadow-[0_0_20px_rgba(255,42,95,0.15)]'
            : 'bg-emerald-950/20 border-emerald-500/40 shadow-[0_0_20px_rgba(0,230,118,0.15)]'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold tracking-wider text-slate-400 uppercase">Cyber Risk</span>
            <Flame className={`w-4 h-4 ${isHighRisk ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`} />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-3xl font-extrabold font-mono ${isHighRisk ? 'text-rose-400' : 'text-emerald-400'}`}>
              {risk.risk_score}
            </span>
            <span className="text-xs font-mono text-slate-400">/ 100</span>
            <span className={`ml-auto px-2 py-0.5 text-[10px] font-mono font-bold rounded border ${
              isHighRisk ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            }`}>
              {risk.risk_level}
            </span>
          </div>
          <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isHighRisk ? 'bg-gradient-to-r from-amber-500 to-rose-500' : 'bg-gradient-to-r from-teal-400 to-emerald-400'
              }`}
              style={{ width: `${risk.risk_score}%` }}
            />
          </div>
        </div>

        {/* KPI 2: AI Agent Status */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold tracking-wider text-slate-400 uppercase">AI Agent</span>
            <Bot className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-1">
            <div className="text-base font-bold text-slate-100 font-mono">Customer Support AI</div>
            <div className="text-[11px] text-slate-400">NovaCare Support</div>
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-[10px] font-mono font-bold text-cyan-300 uppercase">● MONITORED</span>
          </div>
        </div>

        {/* KPI 3: Attack Adaptation */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold tracking-wider text-slate-400 uppercase">Adversary Status</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-1">
            <div className="text-sm font-bold text-amber-400 font-mono">
              {isBlocked ? 'ATTACKER ADAPTED' : 'PRIMARY CRM VECTOR'}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {isBlocked ? 'Rerouted to Secondary Path' : 'Direct Database Trajectory'}
            </div>
          </div>
          <div className="mt-2 text-[10px] font-mono text-cyan-400 font-bold">
            Predicted Chain: 7 Moves
          </div>
        </div>

        {/* KPI 4: Risk Reduction Delta */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold tracking-wider text-slate-400 uppercase">Risk Reduction</span>
            <TrendingDown className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-1">
            <div className="text-2xl font-extrabold font-mono text-emerald-400">
              {isBlocked ? `-${recommendation.risk_reduction} Pts` : '0 Pts'}
            </div>
            <div className="text-[11px] text-slate-400">
              Path Disrupted: <span className="text-cyan-300 font-bold">{isBlocked ? '64.6%' : '0%'}</span>
            </div>
          </div>
          <div className="mt-2 text-[10px] font-mono text-slate-400">
            {isBlocked ? 'CRM Write Revoked' : 'CRM Access Unmitigated'}
          </div>
        </div>
      </div>

      {/* Main Grid: Attack Graph + Next 7 Moves */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Center Panel A: Attack Graph Centerpiece */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <div>
              <h2 className="text-base font-bold text-slate-100 font-mono flex items-center gap-2">
                <Zap className="w-5 h-5 text-cyan-400" /> ATTACK GRAPH VISUALIZATION
              </h2>
              <p className="text-xs text-slate-400">NetworkX probabilistic attack graph traversal engine</p>
            </div>
            {isBlocked && (
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-xs font-bold font-mono flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> ATTACKER REROUTED
              </span>
            )}
          </div>
          
          <AttackGraph
            nodesData={network.nodes}
            edgesData={network.edges}
            highlightedTool={highlightedTool}
          />
        </div>

        {/* Right Sidebar: AI Analysis & Best Counter-Move */}
        <div className="space-y-6">
          {/* AI Analysis Box */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-400 font-mono flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" /> AI Adversary Analysis
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                Conf: {Math.round(attack.confidence * 100)}%
              </span>
            </div>

            {/* Next Likely Move */}
            <div>
              <span className="text-xs text-slate-400 uppercase font-semibold font-mono">Next Likely Move</span>
              <div className="mt-1.5 flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-mono text-sm font-bold text-rose-400">
                  {attack.next_move}
                </span>
                <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-mono font-bold">
                  {Math.round(attack.next_move_probability * 100)}%
                </span>
              </div>
            </div>

            {/* Critical Transition Explanation */}
            <div>
              <span className="text-xs text-slate-400 uppercase font-semibold font-mono flex items-center gap-1 text-purple-300">
                <Zap className="w-3.5 h-3.5 text-purple-400" /> Critical Transition
              </span>
              <p className="mt-1.5 text-xs text-slate-300 leading-relaxed bg-purple-950/20 p-3 rounded-xl border border-purple-500/30">
                "{attack.reasoning_factors[1] || attack.reasoning_factors[0] || 'Unmitigated agent permissions enable the highest-probability path transition.'}"
              </p>
            </div>
          </div>

          {/* Best Counter-Move Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-b from-cyan-950/40 to-slate-900/90 border border-cyan-500/40 space-y-4 shadow-[0_0_25px_rgba(0,240,255,0.15)]">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
              <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-300 font-mono flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-cyan-400" /> Best Counter-Move
              </span>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-mono font-bold">
                RECOMMENDED
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-100 font-mono">
                {recommendation.recommended_defense}
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                {recommendation.reasoning}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Risk Drop</span>
                <div className="text-sm font-bold font-mono text-cyan-400 mt-0.5">
                  {recommendation.risk_before} → {recommendation.risk_after}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Reduction</span>
                <div className="text-sm font-bold font-mono text-emerald-400 mt-0.5 flex items-center justify-center gap-1">
                  <TrendingDown className="w-4 h-4" /> -{recommendation.risk_reduction} pts
                </div>
              </div>
            </div>

            <button
              onClick={() => onApplyGuardrail(recommendation.recommended_guardrail_id || 'restrict_crm')}
              disabled={isLoading || isBlocked}
              className={`w-full py-3 px-4 rounded-xl font-bold font-mono text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-lg ${
                isBlocked
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 border border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.4)] active:scale-95'
              }`}
            >
              {isLoading ? (
                'Recalculating 7 Moves...'
              ) : isBlocked ? (
                'Guardrail Applied — Attacker Adapted'
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" /> APPLY GUARDRAIL
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Feature Panel B: ATTACKER'S NEXT 7 MOVES */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-mono font-bold">
                MAIN PREDICTIVE FEATURE
              </span>
              <h2 className="text-lg font-bold font-mono text-slate-100 tracking-wider">
                ATTACKER'S NEXT 7 MOVES
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Probabilistic 7-step sequential attack trajectory computed by backend NetworkX graph
            </p>
          </div>

          <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
            <span>Critical Transition:</span>
            <span className="px-2.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold">
              Step 03 — {movesList.find(m => m.is_critical)?.action || 'CRM Tool Abuse'}
            </span>
          </div>
        </div>

        {/* 7 Moves Horizontal Flow List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          {movesList.map((move, idx) => {
            const stepStr = move.step < 10 ? `0${move.step}` : `${move.step}`;
            const isHovered = highlightedTool === move.affected_tool;

            return (
              <div
                key={move.step}
                onMouseEnter={() => setHighlightedTool(move.affected_tool)}
                onMouseLeave={() => setHighlightedTool(null)}
                className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between relative ${
                  move.is_critical
                    ? 'bg-purple-950/40 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.3)] ring-1 ring-purple-400'
                    : move.is_current
                    ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.25)]'
                    : isHovered
                    ? 'bg-slate-800 border-slate-700'
                    : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Header: Step + Probability */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold font-mono text-slate-400">
                    {stepStr}
                  </span>
                  <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                    move.probability >= 0.8 ? 'bg-rose-500/20 text-rose-300' :
                    move.probability >= 0.5 ? 'bg-amber-500/20 text-amber-300' :
                    'bg-cyan-500/20 text-cyan-300'
                  }`}>
                    {Math.round(move.probability * 100)}%
                  </span>
                </div>

                {/* Body: Action / Technique */}
                <div className="mt-3">
                  <div className="text-xs font-bold font-mono text-slate-100 leading-tight">
                    {move.action}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-1 flex items-center gap-1">
                    <Layers className="w-3 h-3 text-slate-500 shrink-0" />
                    <span className="truncate">{move.affected_tool}</span>
                  </div>
                </div>

                {/* Footer: Critical Badge or Risk Badge */}
                <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between">
                  {move.is_critical ? (
                    <span className="text-[9px] uppercase font-mono font-extrabold px-1.5 py-0.5 rounded bg-purple-500/30 text-purple-200 border border-purple-400/50 animate-pulse">
                      CRITICAL TRANSITION
                    </span>
                  ) : (
                    <span className={`text-[9px] uppercase font-mono font-bold px-1.5 py-0.5 rounded border ${getRiskBadgeColor(move.risk_level)}`}>
                      {move.risk_level}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
