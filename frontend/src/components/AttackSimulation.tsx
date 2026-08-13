import React, { useState } from 'react';
import { Play, ShieldAlert, CheckCircle2, ArrowRight, Zap, RefreshCw, Cpu, Database, Lock, Globe } from 'lucide-react';
import { AttackPath, NetworkGraph } from '../types';
import { AttackGraph } from './AttackGraph';

interface AttackSimulationProps {
  attack: AttackPath;
  network: NetworkGraph;
  onStartAttack: () => void;
  isLoading: boolean;
}

export const AttackSimulation: React.FC<AttackSimulationProps> = ({
  attack,
  network,
  onStartAttack,
  isLoading
}) => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const simulationSteps = [
    { title: "Prompt Injection", desc: "Untrusted prompt consumed via customer email ticket", icon: Globe, color: "text-cyan-400" },
    { title: "Instruction Hijacking", desc: "Agent context overridden by indirect payload", icon: Cpu, color: "text-purple-400" },
    { title: "CRM Tool Abuse", desc: "Agent issues unauthorized CRM API queries", icon: Zap, color: "text-amber-400" },
    { title: "Customer Database Access", desc: "Escalated database read query executed", icon: Database, color: "text-rose-400" },
    { title: "Sensitive Data Exposure", desc: "Customer PII records returned to adversary context", icon: Lock, color: "text-rose-500" }
  ];

  const handleStartAnimation = async () => {
    onStartAttack();
    setIsAnimating(true);
    setActiveStep(0);

    for (let i = 0; i < simulationSteps.length; i++) {
      setActiveStep(i);
      await new Promise(resolve => setTimeout(resolve, 800));
    }
    setIsAnimating(false);
  };

  return (
    <div className="space-y-6">
      {/* Title & Controller Bar */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-mono font-bold">
              SCENARIO SIMULATOR
            </span>
            <h1 className="text-xl font-bold font-mono text-slate-100">ATTACK SIMULATION</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulated scenario: <span className="text-cyan-300 font-semibold">Indirect Prompt Injection</span>
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-xs text-slate-400">Prediction Confidence</div>
            <div className="text-base font-bold font-mono text-cyan-400">{Math.round(attack.confidence * 100)}%</div>
          </div>

          <button
            onClick={handleStartAnimation}
            disabled={isLoading || isAnimating}
            className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(255,42,95,0.4)] transition-all active:scale-95"
          >
            {isAnimating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> SIMULATING CHAIN...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" /> START ATTACK
              </>
            )}
          </button>
        </div>
      </div>

      {/* Step Progress Visualizer */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {simulationSteps.map((step, idx) => {
          const StepIcon = step.icon;
          const isActive = idx === activeStep;
          const isPassed = idx < activeStep;

          return (
            <div
              key={idx}
              className={`p-4 rounded-xl border transition-all duration-300 ${
                isActive
                  ? 'bg-rose-950/40 border-rose-500 shadow-[0_0_15px_rgba(255,42,95,0.3)]'
                  : isPassed
                  ? 'bg-slate-900 border-slate-700 opacity-80'
                  : 'bg-slate-950/60 border-slate-800 opacity-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-slate-500">STEP 0{idx + 1}</span>
                <StepIcon className={`w-4 h-4 ${step.color}`} />
              </div>
              <div className="text-xs font-bold text-slate-200 font-mono">{step.title}</div>
              <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">{step.desc}</div>
            </div>
          );
        })}
      </div>

      {/* Main Attack Graph Panel */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span>REAL-TIME ATTACK PATH ANALYSIS</span>
          <span>Target Objective: <span className="text-rose-400 font-bold">{attack.attack_objective}</span></span>
        </div>
        <AttackGraph nodesData={network.nodes} edgesData={network.edges} />
      </div>
    </div>
  );
};
