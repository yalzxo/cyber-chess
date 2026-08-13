export interface Permission {
  id: number;
  permission_name: string;
  granted: boolean;
}

export interface Tool {
  id: string;
  name: string;
  risk_level: string; // HIGH, MEDIUM, CRITICAL, LOW
  risk_score?: number;
  accessible: boolean;
  description?: string;
  permissions: Permission[];
}

export interface Agent {
  id: string;
  name: string;
  description?: string;
  status: string;
  tools: Tool[];
}

export interface GraphNode {
  id: string;
  label: string;
  type: string; // entry, agent, tool, asset, target
  risk_level: string; // info, monitored, high, medium, critical
  status: string; // active, blocked, clear, compromised
  accessible: boolean;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  technique: string;
  probability: number;
  enabled: boolean;
  in_attack_path: boolean;
  required_permission?: string;
}

export interface NetworkGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface AttackMove {
  step: number;
  action: string;
  probability: number;
  affected_tool: string;
  risk_level: string;
  is_current: boolean;
  is_critical: boolean;
}

export interface AttackPath {
  current_risk: number;
  next_move: string;
  next_move_probability: number;
  attack_objective: string;
  path: string[];
  moves: AttackMove[];
  critical_move_step: number;
  confidence: number;
  reasoning_factors: string[];
  is_blocked?: boolean;
  blocked_at?: string;
}

export interface RiskScore {
  risk_score: number;
  risk_level: string;
  critical_asset: string;
  attack_objective: string;
  risk_factors: string[];
}

export interface Guardrail {
  id: string;
  guardrail_id: string;
  name: string;
  status: string; // ACTIVE, AVAILABLE, APPLIED
  description?: string;
  target_tool?: string;
  risk_reduction_est: number;
  effort: string;
}

export interface Recommendation {
  recommended_defense: string;
  recommended_guardrail_id: string;
  risk_before: number;
  risk_after: number;
  risk_reduction: number;
  success_probability: number;
  effort: string;
  reasoning: string;
  all_evaluations?: any[];
}

export interface GuardrailApplyResult {
  status: string;
  applied_guardrail: string;
  risk_before: number;
  risk_after: number;
  risk_reduction: number;
  attack_path_interrupted: boolean;
  new_path: string[];
  moves: AttackMove[];
  message: string;
}

export interface WhatIfResult {
  guardrail_id: string;
  guardrail_name: string;
  risk_before: number;
  risk_after: number;
  risk_reduction: number;
  effort: string;
  predicted_path: string[];
  moves: AttackMove[];
  critical_transition: string;
  explanation: string;
}

export interface IncidentHistoryItem {
  id: number;
  timestamp: string;
  scenario: string;
  threat_type: string;
  outcome: string;
  risk_before: number;
  risk_after: number;
  defense_applied: string;
}
