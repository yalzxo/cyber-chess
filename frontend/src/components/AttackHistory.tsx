import React from 'react';
import { History, ShieldCheck, AlertOctagon, CheckCircle2, ArrowDownRight } from 'lucide-react';
import { IncidentHistoryItem } from '../types';

interface AttackHistoryProps {
  history: IncidentHistoryItem[];
}

export const AttackHistory: React.FC<AttackHistoryProps> = ({ history }) => {
  const defaultHistory: IncidentHistoryItem[] = [
    {
      id: 1,
      timestamp: '2026-08-13 14:30:12',
      scenario: 'Indirect Prompt Injection',
      threat_type: 'Prompt Injection',
      outcome: 'BLOCKED',
      risk_before: 82,
      risk_after: 29,
      defense_applied: 'Restrict CRM Access'
    },
    {
      id: 2,
      timestamp: '2026-08-13 13:15:00',
      scenario: 'CRM Tool Abuse Escalation',
      threat_type: 'Tool Abuse',
      outcome: 'CONTAINED',
      risk_before: 75,
      risk_after: 30,
      defense_applied: 'Sandbox Agent'
    },
    {
      id: 3,
      timestamp: '2026-08-13 11:45:22',
      scenario: 'Sensitive Data Request',
      threat_type: 'Data Exfiltration',
      outcome: 'BLOCKED',
      risk_before: 68,
      risk_after: 22,
      defense_applied: 'Disable External Email Tool'
    }
  ];

  const items = history.length > 0 ? history : defaultHistory;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-mono font-bold">
            AUDIT LOG
          </span>
          <h1 className="text-xl font-bold font-mono text-slate-100">SIMULATED INCIDENT HISTORY</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Historical log of attack escalation simulations and defensive counter-moves recorded in SQLite database
        </p>
      </div>

      {/* History Table */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 overflow-x-auto shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-xs font-mono text-slate-400 uppercase">
              <th className="pb-3 px-3">Timestamp</th>
              <th className="pb-3 px-3">Scenario</th>
              <th className="pb-3 px-3">Threat Type</th>
              <th className="pb-3 px-3">Outcome</th>
              <th className="pb-3 px-3">Risk Delta</th>
              <th className="pb-3 px-3">Defense Applied</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3.5 px-3 text-slate-400">{item.timestamp}</td>
                <td className="py-3.5 px-3 font-bold text-slate-200">{item.scenario}</td>
                <td className="py-3.5 px-3 text-cyan-300">{item.threat_type}</td>
                <td className="py-3.5 px-3">
                  <span className={`px-2.5 py-0.5 rounded font-bold border ${
                    item.outcome === 'BLOCKED'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  }`}>
                    {item.outcome}
                  </span>
                </td>
                <td className="py-3.5 px-3 text-slate-300">
                  <span className="text-rose-400">{item.risk_before}</span> → <span className="text-emerald-400 font-bold">{item.risk_after}</span>
                </td>
                <td className="py-3.5 px-3 text-purple-300 font-semibold">{item.defense_applied}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
