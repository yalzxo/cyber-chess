import {
  Agent,
  NetworkGraph,
  AttackPath,
  RiskScore,
  Guardrail,
  Recommendation,
  GuardrailApplyResult,
  WhatIfResult,
  IncidentHistoryItem
} from '../types';

const API_BASE = '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || `API Error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export const api = {
  getHealth: async () => {
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse<{ status: string; engine: string }>(res);
  },

  getAgent: async (): Promise<Agent> => {
    const res = await fetch(`${API_BASE}/agent`);
    return handleResponse<Agent>(res);
  },

  getNetwork: async (): Promise<NetworkGraph> => {
    const res = await fetch(`${API_BASE}/network`);
    return handleResponse<NetworkGraph>(res);
  },

  getCurrentAttack: async (): Promise<AttackPath> => {
    const res = await fetch(`${API_BASE}/attack/current`);
    return handleResponse<AttackPath>(res);
  },

  startSimulation: async () => {
    const res = await fetch(`${API_BASE}/simulation/start`, { method: 'POST' });
    return handleResponse<any>(res);
  },

  getRisk: async (): Promise<RiskScore> => {
    const res = await fetch(`${API_BASE}/risk`);
    return handleResponse<RiskScore>(res);
  },

  getGuardrails: async (): Promise<Guardrail[]> => {
    const res = await fetch(`${API_BASE}/guardrails`);
    return handleResponse<Guardrail[]>(res);
  },

  getRecommendation: async (): Promise<Recommendation> => {
    const res = await fetch(`${API_BASE}/guardrails/recommend`);
    return handleResponse<Recommendation>(res);
  },

  applyGuardrail: async (guardrail_id: string): Promise<GuardrailApplyResult> => {
    const res = await fetch(`${API_BASE}/guardrails/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guardrail_id }),
    });
    return handleResponse<GuardrailApplyResult>(res);
  },

  resetSimulation: async () => {
    const res = await fetch(`${API_BASE}/simulation/reset`, { method: 'POST' });
    return handleResponse<any>(res);
  },

  getHistory: async (): Promise<IncidentHistoryItem[]> => {
    const res = await fetch(`${API_BASE}/history`);
    return handleResponse<IncidentHistoryItem[]>(res);
  },

  runWhatIf: async (guardrail_id: string): Promise<WhatIfResult> => {
    const res = await fetch(`${API_BASE}/what-if`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guardrail_id }),
    });
    return handleResponse<WhatIfResult>(res);
  },
};
