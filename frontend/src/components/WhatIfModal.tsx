import React, { useState } from 'react';
import { X, HelpCircle, ArrowRight, TrendingDown, ShieldCheck, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { WhatIfResult } from '../types';

interface WhatIfModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WhatIfModal: React.FC<WhatIfModalProps> = ({ isOpen, onClose }) => {
  const [selectedGuardrail, setSelectedGuardrail] = useState<string>('restrict_crm');
  const [result, setResult] = useState<WhatIfResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const scenarios = [
    { id: 'restrict_crm', label: 'What if CRM access is restricted?' },
    { id: 'require_human_approval', label: 'What if Human Approval is required?' },
    { id: 'disable_email', label: 'What if External Email Tool is disabled?' },
    { id: 'sandbox_agent', label: 'What if Customer Support AI is sandboxed?' },
  ];

  const handleRunAnalysis = async (gid: string) => {
    setSelectedGuardrail(gid);
    setIsLoading(true);
    try {
      const res = await api.runWhatIf(gid);
      setResult(res);
    } catch (err) {
      console.error('What-If simulation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0b132b] border border-purple-500/40 rounded-2xl w-full max-w-2xl overflow-hidden shadow-[0_0_40px_rgba(168,85,247,0.25)] space-y-6 p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-mono text-slate-100 flex items-center gap-2">
              WHAT IF? <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">SANDBOX SIMULATOR</span>
            </h2>
            <p className="text-xs text-slate-400">Simulate hypothetical guardrail counter-moves without modifying live state</p>
          </div>
        </div>

        {/* Scenario Selection Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {scenarios.map((sc) => (
            <button
              key={sc.id}
              onClick={() => handleRunAnalysis(sc.id)}
              className={`p-3 rounded-xl border text-left text-xs font-mono transition-all ${
                selectedGuardrail === sc.id
                  ? 'bg-purple-950/40 border-purple-500 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                  : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/60'
              }`}
            >
              {sc.label}
            </button>
          ))}
        </div>

        {/* Analysis Output */}
        {isLoading ? (
          <div className="py-8 text-center space-y-2">
            <RefreshCw className="w-6 h-6 text-purple-400 animate-spin mx-auto" />
            <p className="text-xs font-mono text-slate-400">Running NetworkX graph calculation...</p>
          </div>
        ) : result ? (
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-purple-400 uppercase">{result.guardrail_name}</span>
              <span className="text-xs font-mono text-slate-400">Effort: <span className="text-slate-200 font-bold">{result.effort}</span></span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Risk Before</span>
                <span className="text-sm font-mono font-bold text-rose-400">{result.risk_before}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Risk After</span>
                <span className="text-sm font-mono font-bold text-emerald-400">{result.risk_after}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Reduction</span>
                <span className="text-sm font-mono font-bold text-cyan-300 flex items-center justify-center gap-0.5">
                  <TrendingDown className="w-3.5 h-3.5" /> -{result.risk_reduction}
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs font-mono text-slate-400 uppercase">Predicted Attack Chain:</span>
              <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs font-mono text-cyan-300">
                {result.predicted_path.map((node, idx) => (
                  <React.Fragment key={idx}>
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">{node}</span>
                    {idx < result.predicted_path.length - 1 && <ArrowRight className="w-3 h-3 text-slate-500" />}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-purple-950/20 p-3 rounded-lg border border-purple-500/20">
              {result.explanation}
            </p>
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-slate-500 font-mono">
            Select a hypothetical scenario above to simulate attack path changes.
          </div>
        )}
      </div>
    </div>
  );
};
