import json
from datetime import datetime
from typing import Dict, Any, List
from sqlalchemy.orm import Session
import models
from graph_engine import AttackGraphEngine
from risk_engine import RiskEngine
from attack_predictor import AttackPredictor
from defense_engine import DefenseEngine

class SimulationEngine:
    """
    State manager coordinating DB persistence, AttackGraphEngine, and simulation transitions.
    """
    def __init__(self, db: Session):
        self.db = db
        self.graph_engine = AttackGraphEngine()
        self._sync_from_db()

    def _sync_from_db(self):
        tools = self.db.query(models.ToolModel).all()
        tool_acc = {t.name: t.accessible for t in tools}

        applied_guardrails = self.db.query(models.GuardrailModel).filter(
            models.GuardrailModel.status.in_(["ACTIVE", "APPLIED"])
        ).all()
        active_gids = [g.guardrail_id for g in applied_guardrails]

        self.graph_engine.apply_tool_accessibility(tool_acc, active_guardrails=active_gids)

    def get_network_graph(self) -> Dict[str, Any]:
        self._sync_from_db()
        path, _, _ = self.graph_engine.get_most_probable_path("External Content", "Exfiltration Target")
        return self.graph_engine.export_graph_dict(path)

    def get_current_attack(self) -> Dict[str, Any]:
        self._sync_from_db()
        return AttackPredictor.predict_attack(self.graph_engine)

    def get_risk_score(self) -> Dict[str, Any]:
        self._sync_from_db()
        path, prob, is_reachable = self.graph_engine.get_most_probable_path("External Content", "Exfiltration Target")
        return RiskEngine.calculate_risk(self.graph_engine, path, prob, is_reachable)

    def get_recommendation(self) -> Dict[str, Any]:
        self._sync_from_db()
        applied = self.db.query(models.GuardrailModel).filter(
            models.GuardrailModel.status.in_(["ACTIVE", "APPLIED"])
        ).all()
        active_gids = [g.guardrail_id for g in applied]
        return DefenseEngine.evaluate_all_defenses(self.graph_engine, active_guardrails=active_gids)

    def start_simulation(self) -> Dict[str, Any]:
        self._sync_from_db()
        sim_state = self.db.query(models.SimulationStateModel).filter_by(id=1).first()
        if sim_state:
            sim_state.is_attack_active = True
            self.db.commit()

        pred = AttackPredictor.predict_attack(self.graph_engine)
        return {
            "status": "Attack active",
            "is_active": True,
            "scenario": "Indirect Prompt Injection",
            "current_risk": pred["current_risk"],
            "risk_level": "HIGH" if pred["current_risk"] >= 70 else "LOW",
            "predicted_path": pred["path"],
            "moves": pred["moves"],
            "next_move": pred["next_move"],
            "next_move_probability": pred["next_move_probability"],
            "attack_objective": pred["attack_objective"],
            "confidence": pred["confidence"],
            "message": "Indirect prompt injection scenario initiated. NetworkX 7-move path calculated."
        }

    def apply_guardrail(self, guardrail_id: str) -> Dict[str, Any]:
        self._sync_from_db()
        before_pred = AttackPredictor.predict_attack(self.graph_engine)
        risk_before = before_pred["current_risk"]

        guardrail = self.db.query(models.GuardrailModel).filter_by(guardrail_id=guardrail_id).first()
        if not guardrail:
            guardrail = self.db.query(models.GuardrailModel).filter_by(id=guardrail_id).first()

        guardrail_name = guardrail.name if guardrail else guardrail_id

        if guardrail:
            guardrail.status = "APPLIED"

        if guardrail_id == "restrict_crm":
            crm_tool = self.db.query(models.ToolModel).filter_by(id="crm").first()
            if crm_tool:
                crm_tool.accessible = False
                perm = self.db.query(models.PermissionModel).filter_by(tool_id="crm", permission_name="CRM.write").first()
                if perm:
                    perm.granted = False

        elif guardrail_id == "disable_email":
            email_tool = self.db.query(models.ToolModel).filter_by(id="email").first()
            if email_tool:
                email_tool.accessible = False

        self.db.commit()
        self._sync_from_db()

        after_pred = AttackPredictor.predict_attack(self.graph_engine)
        risk_after = after_pred["current_risk"]
        risk_reduction = max(0, risk_before - risk_after)
        is_interrupted = after_pred["is_blocked"]

        history_item = models.IncidentHistoryModel(
            timestamp=datetime.utcnow(),
            scenario="Indirect Prompt Injection Simulation",
            threat_type="Prompt Injection Escalation",
            outcome="CONTAINED" if is_interrupted else "ACTIVE",
            risk_before=risk_before,
            risk_after=risk_after,
            defense_applied=guardrail_name
        )
        self.db.add(history_item)

        sim_state = self.db.query(models.SimulationStateModel).filter_by(id=1).first()
        if sim_state:
            sim_state.current_risk_score = risk_after
            sim_state.current_risk_level = "LOW" if risk_after < 40 else "HIGH"
            sim_state.active_attack_path_json = json.dumps(after_pred["path"])
            sim_state.next_likely_move = after_pred["next_move"]

        self.db.commit()

        return {
            "status": "success",
            "applied_guardrail": guardrail_name,
            "risk_before": risk_before,
            "risk_after": risk_after,
            "risk_reduction": risk_reduction,
            "attack_path_interrupted": is_interrupted,
            "new_path": after_pred["path"],
            "moves": after_pred["moves"],
            "message": f"Applied '{guardrail_name}'. Attacker adapted to secondary path! Risk dropped from {risk_before} to {risk_after}."
        }

    def reset_simulation(self) -> Dict[str, Any]:
        self.db.query(models.GuardrailModel).update({"status": "AVAILABLE"})
        self.db.query(models.ToolModel).update({"accessible": True})
        self.db.query(models.PermissionModel).update({"granted": True})

        sim_state = self.db.query(models.SimulationStateModel).filter_by(id=1).first()
        if sim_state:
            sim_state.is_attack_active = True
            sim_state.current_risk_score = 82
            sim_state.current_risk_level = "HIGH"
            sim_state.active_attack_path_json = json.dumps([
                "External Content", "AI Agent", "CRM", "Customer Database", "Sensitive Customer Data", "Staging Buffer", "Exfiltration Target"
            ])
            sim_state.next_likely_move = "CRM Tool Abuse"
            sim_state.recommended_defense = "Restrict CRM Access"

        self.db.commit()
        self._sync_from_db()

        pred = AttackPredictor.predict_attack(self.graph_engine)

        return {
            "status": "reset",
            "risk_score": 82,
            "risk_level": "HIGH",
            "active_path": pred["path"],
            "moves": pred["moves"],
            "message": "Environment successfully reset. Initial threat state (Risk: 82/100, 7-Move CRM Path) restored."
        }

    def simulate_what_if(self, guardrail_id: str) -> Dict[str, Any]:
        self._sync_from_db()
        applied = self.db.query(models.GuardrailModel).filter(
            models.GuardrailModel.status.in_(["ACTIVE", "APPLIED"])
        ).all()
        active_gids = [g.guardrail_id for g in applied]
        return DefenseEngine.simulate_what_if(self.graph_engine, guardrail_id, active_guardrails=active_gids)
