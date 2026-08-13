from sqlalchemy import Column, Integer, String, Float, Boolean, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class AgentModel(Base):
    __tablename__ = "agents"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String, default="MONITORED")
    created_at = Column(DateTime, default=datetime.utcnow)

    tools = relationship("ToolModel", back_populates="agent", cascade="all, delete-orphan")

class ToolModel(Base):
    __tablename__ = "tools"

    id = Column(String, primary_key=True, index=True)
    agent_id = Column(String, ForeignKey("agents.id"))
    name = Column(String, nullable=False)
    risk_level = Column(String, default="MEDIUM") # CRITICAL, HIGH, MEDIUM, LOW
    risk_score = Column(Integer, default=50) # 0-100 score
    accessible = Column(Boolean, default=True)
    description = Column(Text, nullable=True)

    agent = relationship("AgentModel", back_populates="tools")
    permissions = relationship("PermissionModel", back_populates="tool", cascade="all, delete-orphan")

class PermissionModel(Base):
    __tablename__ = "permissions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    tool_id = Column(String, ForeignKey("tools.id"))
    permission_name = Column(String, nullable=False)
    granted = Column(Boolean, default=True)

    tool = relationship("ToolModel", back_populates="permissions")

class AssetModel(Base):
    __tablename__ = "assets"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    criticality = Column(String, default="HIGH") # CRITICAL, HIGH, MEDIUM
    description = Column(Text, nullable=True)

class AttackEdgeModel(Base):
    __tablename__ = "attack_edges"

    id = Column(String, primary_key=True, index=True)
    source_node = Column(String, nullable=False)
    target_node = Column(String, nullable=False)
    technique = Column(String, nullable=False)
    probability = Column(Float, nullable=False)
    risk_contribution = Column(Float, default=10.0)
    required_permission = Column(String, nullable=True)
    enabled = Column(Boolean, default=True)

class GuardrailModel(Base):
    __tablename__ = "guardrails"

    id = Column(String, primary_key=True, index=True)
    guardrail_id = Column(String, unique=True, index=True)
    name = Column(String, nullable=False)
    status = Column(String, default="AVAILABLE") # ACTIVE, AVAILABLE, APPLIED
    description = Column(Text, nullable=True)
    target_tool = Column(String, nullable=True)
    risk_reduction_est = Column(Integer, default=30)
    effort = Column(String, default="LOW") # LOW, MEDIUM, HIGH

class SimulationStateModel(Base):
    __tablename__ = "simulation_state"

    id = Column(Integer, primary_key=True, default=1)
    is_attack_active = Column(Boolean, default=True)
    current_risk_score = Column(Integer, default=82)
    current_risk_level = Column(String, default="HIGH")
    active_attack_path_json = Column(Text, nullable=True)
    next_likely_move = Column(String, default="CRM Tool Abuse")
    recommended_defense = Column(String, default="Restrict CRM Access")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class IncidentHistoryModel(Base):
    __tablename__ = "incident_history"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    scenario = Column(String, nullable=False)
    threat_type = Column(String, nullable=False)
    outcome = Column(String, nullable=False) # BLOCKED, CONTAINED, ACTIVE
    risk_before = Column(Integer, nullable=False)
    risk_after = Column(Integer, nullable=False)
    defense_applied = Column(String, nullable=False)
