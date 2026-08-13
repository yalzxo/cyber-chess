import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { CommandCenter } from './components/CommandCenter';
import { CounterMoveSimulator } from './components/CounterMoveSimulator';
import { AgentSecurity } from './components/AgentSecurity';
import { GuardrailsView } from './components/GuardrailsView';
import { AttackHistory } from './components/AttackHistory';
import { WhatIfModal } from './components/WhatIfModal';

import { api } from './services/api';
import {
  NetworkGraph,
  AttackPath,
  RiskScore,
  Agent,
  Guardrail,
  Recommendation,
  IncidentHistoryItem
} from './types';

export function App() {
  const [activeScreen, setActiveScreen] = useState<string>('command-center');
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(true);
  const [isWhatIfOpen, setIsWhatIfOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Core Data States
  const [network, setNetwork] = useState<NetworkGraph>({ nodes: [], edges: [] });
  const [attack, setAttack] = useState<AttackPath>({
    current_risk: 82,
    next_move: 'CRM Tool Abuse',
    next_move_probability: 0.81,
    attack_objective: 'Sensitive Customer Data',
    path: ['External Content', 'AI Agent', 'CRM', 'Customer Database', 'Sensitive Customer Data', 'Staging Buffer', 'Exfiltration Target'],
    moves: [
      { step: 1, action: "Prompt Injection", probability: 0.96, affected_tool: "External Content", risk_level: "info", is_current: true, is_critical: false },
      { step: 2, action: "Instruction Hijacking", probability: 0.89, affected_tool: "AI Agent", risk_level: "monitored", is_current: false, is_critical: false },
      { step: 3, action: "CRM Tool Abuse", probability: 0.81, affected_tool: "CRM", risk_level: "high", is_current: false, is_critical: true },
      { step: 4, action: "Customer Database Access", probability: 0.72, affected_tool: "Customer Database", risk_level: "critical", is_current: false, is_critical: false },
      { step: 5, action: "Sensitive Data Retrieval", probability: 0.68, affected_tool: "Sensitive Customer Data", risk_level: "critical", is_current: false, is_critical: false },
      { step: 6, action: "Data Aggregation", probability: 0.54, affected_tool: "Staging Buffer", risk_level: "high", is_current: false, is_critical: false },
      { step: 7, action: "Data Exfiltration Attempt", probability: 0.43, affected_tool: "Exfiltration Target", risk_level: "critical", is_current: false, is_critical: false },
    ],
    critical_move_step: 3,
    confidence: 0.91,
    reasoning_factors: [
      'Unmitigated permissions allow CRM access.',
      'Step 03 (CRM Tool Abuse) is identified as the CRITICAL TRANSITION bridging agent execution to sensitive data assets.'
    ]
  });

  const [risk, setRisk] = useState<RiskScore>({
    risk_score: 82,
    risk_level: 'HIGH',
    critical_asset: 'Customer Database',
    attack_objective: 'Sensitive Customer Data',
    risk_factors: []
  });

  const [agent, setAgent] = useState<Agent | null>(null);
  const [guardrails, setGuardrails] = useState<Guardrail[]>([]);
  const [recommendation, setRecommendation] = useState<Recommendation>({
    recommended_defense: 'Restrict CRM Access',
    recommended_guardrail_id: 'restrict_crm',
    risk_before: 82,
    risk_after: 29,
    risk_reduction: 53,
    success_probability: 0.84,
    effort: 'LOW',
    reasoning: 'Restricting CRM access breaks the highest-probability path because CRM is the critical transition.'
  });
  const [history, setHistory] = useState<IncidentHistoryItem[]>([]);

  // Fetch complete state from backend
  const fetchState = async () => {
    try {
      const [netData, attackData, riskData, agentData, gData, recData, histData] = await Promise.all([
        api.getNetwork(),
        api.getCurrentAttack(),
        api.getRisk(),
        api.getAgent().catch(() => null),
        api.getGuardrails().catch(() => []),
        api.getRecommendation().catch(() => recommendation),
        api.getHistory().catch(() => [])
      ]);

      setNetwork(netData);
      setAttack(attackData);
      setRisk(riskData);
      if (agentData) setAgent(agentData);
      if (gData.length > 0) setGuardrails(gData);
      setRecommendation(recData);
      setHistory(histData);
      setIsBackendConnected(true);
    } catch (err) {
      console.warn('Backend API unavailable, using local calculation mode:', err);
      setIsBackendConnected(false);
    }
  };

  useEffect(() => {
    fetchState();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleApplyGuardrail = async (guardrailId: string) => {
    setIsLoading(true);
    try {
      const res = await api.applyGuardrail(guardrailId);
      showToast(res.message, 'success');
      await fetchState();
    } catch (err: any) {
      showToast(`Failed to apply guardrail: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSimulation = async () => {
    setIsLoading(true);
    try {
      const res = await api.resetSimulation();
      showToast(res.message, 'info');
      await fetchState();
    } catch (err: any) {
      showToast(`Failed to reset environment: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunWhatIf = async (guardrailId: string) => {
    try {
      await api.runWhatIf(guardrailId);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans">
      {/* Navbar Header */}
      <Navbar
        activeScreen={activeScreen}
        setActiveScreen={setActiveScreen}
        onReset={handleResetSimulation}
        onOpenWhatIf={() => setIsWhatIfOpen(true)}
        isBackendConnected={isBackendConnected}
      />

      {/* Global Notification Banner */}
      {notification && (
        <div className={`px-4 py-2.5 text-xs font-mono font-bold text-center border-b ${
          notification.type === 'success' ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40' :
          notification.type === 'error' ? 'bg-rose-950/80 text-rose-300 border-rose-500/40' :
          'bg-cyan-950/80 text-cyan-300 border-cyan-500/40'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6">
        {activeScreen === 'command-center' && (
          <CommandCenter
            network={network}
            attack={attack}
            risk={risk}
            recommendation={recommendation}
            onApplyGuardrail={handleApplyGuardrail}
            onOpenWhatIf={() => setIsWhatIfOpen(true)}
            isLoading={isLoading}
          />
        )}

        {activeScreen === 'counter-move' && (
          <CounterMoveSimulator
            guardrails={guardrails}
            risk={risk}
            network={network}
            onApplyGuardrail={handleApplyGuardrail}
            onRunWhatIf={handleRunWhatIf}
            isLoading={isLoading}
          />
        )}

        {activeScreen === 'agent-security' && (
          <AgentSecurity agent={agent} />
        )}

        {activeScreen === 'guardrails' && (
          <GuardrailsView
            guardrails={guardrails}
            onApplyGuardrail={handleApplyGuardrail}
            isLoading={isLoading}
          />
        )}

        {activeScreen === 'history' && (
          <AttackHistory history={history} />
        )}
      </main>

      {/* What-If Modal */}
      <WhatIfModal
        isOpen={isWhatIfOpen}
        onClose={() => setIsWhatIfOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 px-6 text-center text-xs text-slate-500 font-mono">
        CYBER CHESS — Predictive AI Agent Security Platform • Attacker 7-Move Trajectory Engine
      </footer>
    </div>
  );
}
