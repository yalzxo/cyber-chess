import React, { useState, useMemo } from 'react';
import { Bot, Server, Mail, FileText, Database, Check, X, ShieldAlert, Filter, Activity, Key } from 'lucide-react';
import { Agent, Tool } from '../types';

interface AgentSecurityProps {
  agent: Agent | null;
}

export const AgentSecurity: React.FC<AgentSecurityProps> = ({ agent }) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');

  const rawTools: Tool[] = agent?.tools && agent.tools.length > 0 ? agent.tools : [
    {
      id: 'database',
      name: 'Customer Database',
      risk_level: 'CRITICAL',
      risk_score: 94,
      accessible: true,
      description: 'Production database containing confidential user accounts and billing records.',
      permissions: [
        { id: 6, permission_name: 'Customer Database.read', granted: true }
      ]
    },
    {
      id: 'crm',
      name: 'CRM',
      risk_level: 'HIGH',
      risk_score: 82,
      accessible: true,
      description: 'Customer Relationship Management tool for viewing/modifying customer records.',
      permissions: [
        { id: 1, permission_name: 'CRM.read', granted: true },
        { id: 2, permission_name: 'CRM.write', granted: true }
      ]
    },
    {
      id: 'email',
      name: 'Email',
      risk_level: 'MEDIUM',
      risk_score: 65,
      accessible: true,
      description: 'Internal and external support email communications tool.',
      permissions: [
        { id: 3, permission_name: 'Email.read', granted: true },
        { id: 4, permission_name: 'Email.send', granted: true }
      ]
    },
    {
      id: 'docs',
      name: 'Internal Documents',
      risk_level: 'MEDIUM',
      risk_score: 45,
      accessible: true,
      description: 'Internal knowledgebase, support manuals, and policy documentation.',
      permissions: [
        { id: 5, permission_name: 'Internal Documents.read', granted: true }
      ]
    }
  ];

  // Risk Level Rank Weight
  const riskRank: Record<string, number> = {
    'CRITICAL': 4,
    'HIGH': 3,
    'MEDIUM': 2,
    'LOW': 1
  };

  // Sorted Tools: Highest Risk -> Lowest Risk
  const sortedTools = useMemo(() => {
    return [...rawTools].sort((a, b) => {
      const rankA = riskRank[a.risk_level.toUpperCase()] || 0;
      const rankB = riskRank[b.risk_level.toUpperCase()] || 0;
      if (rankB !== rankA) {
        return rankB - rankA; // Highest rank first
      }
      // Numerical risk score tie breaker
      const scoreA = a.risk_score ?? 50;
      const scoreB = b.risk_score ?? 50;
      return scoreB - scoreA;
    });
  }, [rawTools]);

  // Filtered Tools based on active filter button
  const filteredTools = useMemo(() => {
    if (selectedFilter === 'ALL') return sortedTools;
    return sortedTools.filter(t => t.risk_level.toUpperCase() === selectedFilter.toUpperCase());
  }, [sortedTools, selectedFilter]);

  const filterOptions = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

  const getRiskBadgeStyle = (level: string) => {
    switch (level.toUpperCase()) {
      case 'CRITICAL': return 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-[0_0_10px_rgba(255,42,95,0.2)]';
      case 'HIGH': return 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(255,184,0,0.2)]';
      case 'MEDIUM': return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'LOW': return 'bg-teal-500/20 text-teal-300 border-teal-500/40';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getToolIcon = (name: string) => {
    if (name.includes('Database') || name.includes('DB')) return <Database className="w-5 h-5 text-rose-400" />;
    if (name.includes('CRM')) return <Server className="w-5 h-5 text-indigo-400" />;
    if (name.includes('Email')) return <Mail className="w-5 h-5 text-sky-400" />;
    return <FileText className="w-5 h-5 text-purple-400" />;
  };

  const getAccessLabel = (permissions: { permission_name: string }[]) => {
    const names = permissions.map(p => p.permission_name.toLowerCase());
    const hasRead = names.some(n => n.includes('read'));
    const hasWrite = names.some(n => n.includes('write') || n.includes('send'));
    if (hasRead && hasWrite) return 'READ / WRITE';
    if (hasWrite) return 'WRITE';
    return 'READ';
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <Bot className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-mono text-slate-100">{agent?.name || 'CUSTOMER SUPPORT AI'}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-bold">
                MONITORED
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              CYBER CHESS Agent Asset Risk Matrix & Tool Permissions
            </p>
          </div>
        </div>

        {/* Risk Filter Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 bg-slate-950/80 p-2 rounded-xl border border-slate-800">
          <span className="text-xs font-mono font-bold text-slate-400 flex items-center gap-1.5 px-2">
            <Filter className="w-3.5 h-3.5 text-cyan-400" /> FILTER BY RISK:
          </span>
          <div className="flex items-center gap-1">
            {filterOptions.map((opt) => {
              const isSelected = selectedFilter === opt;
              return (
                <button
                  key={opt}
                  onClick={() => setSelectedFilter(opt)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all duration-150 ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(0,240,255,0.4)] border border-cyan-400'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sorted & Filtered Tool Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTools.length > 0 ? (
          filteredTools.map((tool) => {
            const score = tool.risk_score ?? (tool.risk_level === 'CRITICAL' ? 94 : tool.risk_level === 'HIGH' ? 82 : tool.risk_level === 'MEDIUM' ? 65 : 30);
            const access = getAccessLabel(tool.permissions);

            return (
              <div key={tool.id} className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4 shadow-xl relative overflow-hidden">
                {/* Header: Title & Risk Level */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700">
                      {getToolIcon(tool.name)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold font-mono text-slate-100">{tool.name}</h3>
                      <div className="text-[11px] font-mono mt-0.5 flex items-center gap-1.5">
                        <span className="text-slate-400">STATUS:</span>
                        {tool.accessible ? (
                          <span className="text-rose-400 font-bold flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" /> EXPOSED
                          </span>
                        ) : (
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> RESTRICTED
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className={`px-3 py-1 text-xs font-mono font-bold rounded-lg border ${getRiskBadgeStyle(tool.risk_level)}`}>
                    {tool.risk_level}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{tool.description}</p>

                {/* Key Metrics Grid: Risk Score & Access */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Risk Score</span>
                    <span className="text-sm font-mono font-bold text-rose-400 mt-0.5 block">
                      {score} / 100
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Permission Access</span>
                    <span className="text-xs font-mono font-bold text-cyan-300 mt-1 block">
                      {access}
                    </span>
                  </div>
                </div>

                {/* Permissions Matrix List */}
                <div className="space-y-2 pt-1">
                  <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold flex items-center gap-1">
                    <Key className="w-3.5 h-3.5 text-cyan-400" /> Granted Permissions
                  </span>
                  <div className="space-y-1.5">
                    {tool.permissions.map((perm) => (
                      <div key={perm.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                        <span className="text-xs font-mono text-slate-200">{perm.permission_name}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-1 ${
                          perm.granted ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30 line-through'
                        }`}>
                          {perm.granted ? <><Check className="w-3 h-3" /> GRANTED</> : <><X className="w-3 h-3" /> REVOKED</>}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-2 py-12 text-center text-xs font-mono text-slate-400 bg-slate-900/40 rounded-2xl border border-slate-800">
            No agent tools match the selected filter criteria <span className="text-cyan-400 font-bold">"{selectedFilter}"</span>.
          </div>
        )}
      </div>
    </div>
  );
};
