from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class PermissionSchema(BaseModel):
    id: int
    permission_name: str
    granted: bool

    class Config:
        from_attributes = True

class ToolSchema(BaseModel):
    id: str
    name: str
    risk_level: str
    risk_score: int = 50
    accessible: bool
    description: Optional[str] = None
    permissions: List[PermissionSchema] = []

    class Config:
        from_attributes = True

class AgentSchema(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    status: str
    tools: List[ToolSchema] = []

    class Config:
        from_attributes = True

class GraphNodeSchema(BaseModel):
    id: str
    label: str
    type: str # entry, agent, tool, asset, target
    risk_level: str # info, monitored, high, medium, critical
    status: str # active, blocked, clear, compromised
    accessible: bool = True

class GraphEdgeSchema(BaseModel):
    id: str
    source: str
    target: str
    technique: str
    probability: float
    enabled: bool
    in_attack_path: bool = False
    required_permission: Optional[str] = None

class NetworkGraphSchema(BaseModel):
    nodes: List[GraphNodeSchema]
    edges: List[GraphEdgeSchema]

class AttackMoveSchema(BaseModel):
    step: int
    action: str
    probability: float
    affected_tool: str
    risk_level: str
    is_current: bool = False
    is_critical: bool = False

class AttackPathSchema(BaseModel):
    current_risk: int
    next_move: str
    next_move_probability: float
    attack_objective: str
    path: List[str]
    moves: List[AttackMoveSchema] = []
    critical_move_step: int = 3
    confidence: float
    reasoning_factors: List[str]
    is_blocked: bool = False
    blocked_at: Optional[str] = None

class RiskScoreSchema(BaseModel):
    risk_score: int
    risk_level: str
    critical_asset: str
    attack_objective: str
    risk_factors: List[str]

class GuardrailSchema(BaseModel):
    id: str
    guardrail_id: str
    name: str
    status: str # ACTIVE, AVAILABLE, APPLIED
    description: Optional[str] = None
    target_tool: Optional[str] = None
    risk_reduction_est: int
    effort: str

    class Config:
        from_attributes = True

class GuardrailRecommendationSchema(BaseModel):
    recommended_defense: str
    recommended_guardrail_id: str
    risk_before: int
    risk_after: int
    risk_reduction: int
    success_probability: float
    effort: str
    reasoning: str

class GuardrailApplyRequest(BaseModel):
    guardrail_id: str

class GuardrailApplyResponse(BaseModel):
    status: str
    applied_guardrail: str
    risk_before: int
    risk_after: int
    risk_reduction: int
    attack_path_interrupted: bool
    new_path: List[str]
    moves: List[AttackMoveSchema] = []
    message: str

class WhatIfRequest(BaseModel):
    guardrail_id: str

class WhatIfResponse(BaseModel):
    guardrail_id: str
    guardrail_name: str
    risk_before: int
    risk_after: int
    risk_reduction: int
    effort: str
    predicted_path: List[str]
    moves: List[AttackMoveSchema] = []
    critical_transition: str
    explanation: str

class IncidentHistorySchema(BaseModel):
    id: int
    timestamp: str
    scenario: str
    threat_type: str
    outcome: str
    risk_before: int
    risk_after: int
    defense_applied: str

    class Config:
        from_attributes = True
