import React, { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  Node,
  Edge,
  MarkerType,
  Handle,
  Position
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Globe, Bot, Database, Lock, ShieldAlert, Server, Mail, FileText, CheckCircle2, XCircle, Layers, Send } from 'lucide-react';
import { GraphNode, GraphEdge } from '../types';

interface AttackGraphProps {
  nodesData: GraphNode[];
  edgesData: GraphEdge[];
  highlightedTool?: string | null;
  onNodeClick?: (nodeId: string) => void;
}

const CustomGraphNode = ({ data }: any) => {
  const { label, type, risk_level, status, accessible, isHighlighted } = data;

  const getIcon = () => {
    switch (type) {
      case 'entry':
        return <Globe className="w-5 h-5 text-cyan-400" />;
      case 'agent':
        return <Bot className="w-5 h-5 text-cyan-300" />;
      case 'asset':
        if (label.includes('Staging')) return <Layers className="w-5 h-5 text-amber-400" />;
        return <Database className="w-5 h-5 text-amber-400" />;
      case 'target':
        if (label.includes('Exfiltration')) return <Send className="w-5 h-5 text-rose-500" />;
        return <Lock className="w-5 h-5 text-rose-400" />;
      default:
        if (label.includes('Email')) return <Mail className="w-5 h-5 text-sky-400" />;
        if (label.includes('Doc')) return <FileText className="w-5 h-5 text-purple-400" />;
        return <Server className="w-5 h-5 text-indigo-400" />;
    }
  };

  const getBadgeColor = () => {
    switch (risk_level) {
      case 'critical': return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'high': return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'medium': return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'monitored': return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      default: return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  const getBorderColor = () => {
    if (isHighlighted) {
      return 'border-purple-400 bg-purple-950/40 shadow-[0_0_25px_rgba(168,85,247,0.5)] ring-2 ring-purple-400';
    }
    if (!accessible || status === 'blocked') {
      return 'border-rose-600/60 bg-slate-900/90 opacity-60 line-through';
    }
    if (status === 'compromised') {
      return 'border-rose-500 bg-rose-950/40 shadow-[0_0_20px_rgba(255,42,95,0.4)] animate-pulse';
    }
    if (status === 'active') {
      return 'border-cyan-400 bg-cyan-950/30 shadow-[0_0_15px_rgba(0,240,255,0.3)]';
    }
    return 'border-slate-800 bg-slate-900/80';
  };

  return (
    <div className={`px-4 py-3 rounded-xl border-2 min-w-[170px] transition-all duration-300 relative ${getBorderColor()}`}>
      <Handle type="target" position={Position.Left} className="w-3 h-3 !bg-cyan-400 !border-2 !border-slate-900" />
      
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700">
          {getIcon()}
        </div>
        <div>
          <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
            {label}
            {!accessible || status === 'blocked' ? (
              <XCircle className="w-3.5 h-3.5 text-rose-500 inline" />
            ) : status === 'compromised' ? (
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400 inline" />
            ) : null}
          </div>
          <span className={`inline-block mt-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${getBadgeColor()}`}>
            {!accessible || status === 'blocked' ? 'BLOCKED' : risk_level}
          </span>
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="w-3 h-3 !bg-cyan-400 !border-2 !border-slate-900" />
    </div>
  );
};

export const AttackGraph: React.FC<AttackGraphProps> = ({
  nodesData,
  edgesData,
  highlightedTool,
  onNodeClick
}) => {
  const nodeTypes = useMemo(() => ({ customNode: CustomGraphNode }), []);

  const nodePositions: Record<string, { x: number; y: number }> = {
    "External Content": { x: 30, y: 150 },
    "AI Agent": { x: 260, y: 150 },
    "CRM": { x: 500, y: 40 },
    "Email": { x: 500, y: 160 },
    "Internal Documents": { x: 500, y: 280 },
    "Customer Database": { x: 740, y: 40 },
    "Sensitive Customer Data": { x: 980, y: 150 },
    "Staging Buffer": { x: 1220, y: 150 },
    "Exfiltration Target": { x: 1460, y: 150 }
  };

  const nodes: Node[] = useMemo(() => {
    return nodesData.map((node) => ({
      id: node.id,
      type: 'customNode',
      position: nodePositions[node.id] || { x: 100, y: 100 },
      data: {
        ...node,
        isHighlighted: highlightedTool === node.id || highlightedTool === node.label
      }
    }));
  }, [nodesData, highlightedTool]);

  const edges: Edge[] = useMemo(() => {
    return edgesData.map((edge) => {
      const isPath = edge.in_attack_path;
      const isEnabled = edge.enabled;

      return {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        animated: isPath && isEnabled,
        style: {
          stroke: !isEnabled ? '#ef4444' : isPath ? '#00f0ff' : '#334155',
          strokeWidth: isPath ? 3 : 1.5,
          strokeDasharray: !isEnabled ? '5 5' : undefined,
          opacity: !isEnabled ? 0.4 : 1
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: !isEnabled ? '#ef4444' : isPath ? '#00f0ff' : '#334155',
          width: 15,
          height: 15
        },
        label: `${edge.technique} (${Math.round(edge.probability * 100)}%)`,
        labelStyle: {
          fill: isPath ? '#00f0ff' : '#94a3b8',
          fontWeight: isPath ? 700 : 500,
          fontSize: 10,
          fontFamily: 'JetBrains Mono, monospace'
        },
        labelBgStyle: {
          fill: '#070b14',
          fillOpacity: 0.9,
          rx: 4,
          ry: 4,
        },
        labelBgPadding: [6, 4]
      };
    });
  }, [edgesData]);

  return (
    <div className="w-full h-[520px] bg-[#070b14] rounded-2xl border border-slate-800 relative overflow-hidden shadow-2xl">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={(_, node) => onNodeClick && onNodeClick(node.id)}
        fitView
        minZoom={0.5}
        maxZoom={1.5}
      >
        <Background color="#1e293b" gap={24} size={1} />
        <Controls />
      </ReactFlow>
      <div className="absolute top-4 left-4 pointer-events-none flex items-center gap-3 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-lg text-[11px] text-slate-300">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 bg-cyan-400 rounded" /> Active 7-Move Chain</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 bg-red-500 rounded border-dashed" /> Blocked Transition</span>
      </div>
    </div>
  );
};
