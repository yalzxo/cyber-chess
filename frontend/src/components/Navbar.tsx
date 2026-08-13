import React from 'react';
import { Shield, RotateCcw, HelpCircle } from 'lucide-react';

interface NavbarProps {
  activeScreen: string;
  setActiveScreen: (screen: string) => void;
  onReset: () => void;
  onOpenWhatIf: () => void;
  isBackendConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeScreen,
  setActiveScreen,
  onReset,
  onOpenWhatIf,
  isBackendConnected
}) => {
  const screens = [
    { id: 'command-center', label: 'Command Center' },
    { id: 'counter-move', label: 'Counter-Move Simulator' },
    { id: 'agent-security', label: 'Agent Security' },
    { id: 'guardrails', label: 'Guardrails' },
    { id: 'history', label: 'Attack History' },
  ];

  return (
    <header className="bg-[#070b14]/90 backdrop-blur border-b border-slate-800 sticky top-0 z-50 px-4 lg:px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Tagline */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveScreen('command-center')}>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.25)]">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-wider text-slate-100 font-mono">
                ♟ CYBER CHESS
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Predictive Defense
              </span>
            </div>
            <p className="text-xs text-slate-400">Predict the attack. Make the counter-move.</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800 overflow-x-auto max-w-full">
          {screens.map((screen) => (
            <button
              key={screen.id}
              onClick={() => setActiveScreen(screen.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all duration-150 ${
                activeScreen === screen.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {screen.label}
            </button>
          ))}
        </nav>

        {/* Status & Quick Actions */}
        <div className="flex items-center gap-3">
          {/* Status Indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs">
            <span className={`w-2 h-2 rounded-full ${isBackendConnected ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_#00e676]' : 'bg-red-500'}`} />
            <span className="text-slate-300 font-mono text-[11px]">
              {isBackendConnected ? 'AI ENGINE ONLINE' : 'OFFLINE'}
            </span>
          </div>

          {/* What-If Button */}
          <button
            onClick={onOpenWhatIf}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/30 hover:bg-purple-500/20 transition-all shadow-[0_0_10px_rgba(168,85,247,0.15)]"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            WHAT IF?
          </button>

          {/* Reset Button */}
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white transition-all"
            title="Reset Simulation State"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            RESET
          </button>
        </div>
      </div>
    </header>
  );
};
