from typing import List, Dict, Any
from graph_engine import AttackGraphEngine
from risk_engine import RiskEngine
from attack_predictor import AttackPredictor

class DefenseEngine:
    """
    Evaluates defensive guardrails by cloning graph states, simulating candidate defenses,
    calculating risk deltas, and ranking optimal counter-moves.
    """
    GUARDRAIL_CATALOG = [
        {
            "id": "guardrail_1",
            "guardrail_id": "restrict_crm",
            "name": "Restrict CRM Access",
            "description": "Revoke CRM write permissions for Customer Support AI, forcing adversary to adapt to lower probability paths.",
            "target_tool": "CRM",
            "effort": "LOW",
            "reasoning": "Restricting CRM access breaks the highest-probability path because CRM is the critical transition between the manipulated agent and the customer database."
        },
        {
            "id": "guardrail_2",
            "guardrail_id": "require_human_approval",
            "name": "Require Human Approval",
            "description": "Enforce mandatory human-in-the-loop verification before executing database queries.",
            "target_tool": "AI Agent",
            "effort": "MEDIUM",
            "reasoning": "Human approval introduces a verification check on tool calls, reducing attack path probability across all tools."
        },
        {
            "id": "guardrail_3",
            "guardrail_id": "disable_email",
            "name": "Disable External Email Tool",
            "description": "Temporarily disable email sending capabilities to prevent exfiltration attempts.",
            "target_tool": "Email",
            "effort": "LOW",
            "reasoning": "Disabling email eliminates secondary exfiltration vectors, though direct database access remains vulnerable if CRM is unmitigated."
        },
        {
            "id": "guardrail_4",
            "guardrail_id": "sandbox_agent",
            "name": "Sandbox Agent",
            "description": "Isolate agent execution inside a restricted read-only container with rate limits.",
            "target_tool": "AI Agent",
            "effort": "HIGH",
            "reasoning": "Sandboxing reduces overall tool exploitation probabilities significantly but requires high implementation effort."
        }
    ]

    @classmethod
    def evaluate_all_defenses(
        cls,
        current_graph: AttackGraphEngine,
        active_guardrails: List[str] = None
    ) -> Dict[str, Any]:
        if active_guardrails is None:
            active_guardrails = []

        current_prediction = AttackPredictor.predict_attack(current_graph)
        risk_before = current_prediction["current_risk"]

        evaluations = []

        for g in cls.GUARDRAIL_CATALOG:
            gid = g["guardrail_id"]
            if gid in active_guardrails:
                continue

            sim_graph = current_graph.clone()
            sim_active = active_guardrails + [gid]
            sim_graph.apply_tool_accessibility({}, active_guardrails=sim_active)

            sim_prediction = AttackPredictor.predict_attack(sim_graph)
            risk_after = sim_prediction["current_risk"]
            risk_reduction = max(0, risk_before - risk_after)

            evaluations.append({
                "guardrail": g,
                "risk_before": risk_before,
                "risk_after": risk_after,
                "risk_reduction": risk_reduction,
                "success_probability": 0.84 if gid == "restrict_crm" else 0.72,
                "predicted_path": sim_prediction["path"],
                "moves": sim_prediction["moves"],
                "effort": g["effort"],
                "reasoning": g["reasoning"]
            })

        effort_rank = {"LOW": 1, "MEDIUM": 2, "HIGH": 3}
        evaluations.sort(key=lambda x: (x["risk_reduction"], -effort_rank[x["effort"]]), reverse=True)

        if evaluations:
            top = evaluations[0]
            recommendation = {
                "recommended_defense": top["guardrail"]["name"],
                "recommended_guardrail_id": top["guardrail"]["guardrail_id"],
                "risk_before": top["risk_before"],
                "risk_after": top["risk_after"],
                "risk_reduction": top["risk_reduction"],
                "success_probability": top["success_probability"],
                "effort": top["effort"],
                "reasoning": top["reasoning"],
                "all_evaluations": evaluations
            }
        else:
            recommendation = {
                "recommended_defense": "No additional defense needed",
                "recommended_guardrail_id": "",
                "risk_before": risk_before,
                "risk_after": risk_before,
                "risk_reduction": 0,
                "success_probability": 1.0,
                "effort": "NONE",
                "reasoning": "All critical guardrails have been applied.",
                "all_evaluations": []
            }

        return recommendation

    @classmethod
    def simulate_what_if(
        cls,
        current_graph: AttackGraphEngine,
        guardrail_id: str,
        active_guardrails: List[str] = None
    ) -> Dict[str, Any]:
        if active_guardrails is None:
            active_guardrails = []

        g_info = next((g for g in cls.GUARDRAIL_CATALOG if g["guardrail_id"] == guardrail_id), None)
        if not g_info:
            g_info = {
                "guardrail_id": guardrail_id,
                "name": guardrail_id.replace("_", " ").title(),
                "effort": "MEDIUM",
                "reasoning": "Custom guardrail simulation."
            }

        current_pred = AttackPredictor.predict_attack(current_graph)
        risk_before = current_pred["current_risk"]

        sim_graph = current_graph.clone()
        sim_active = list(set(active_guardrails + [guardrail_id]))
        sim_graph.apply_tool_accessibility({}, active_guardrails=sim_active)

        sim_pred = AttackPredictor.predict_attack(sim_graph)
        risk_after = sim_pred["current_risk"]
        risk_reduction = max(0, risk_before - risk_after)

        critical_transition = "CRM -> Customer Database" if guardrail_id == "restrict_crm" else "AI Agent -> Email"

        return {
            "guardrail_id": guardrail_id,
            "guardrail_name": g_info["name"],
            "risk_before": risk_before,
            "risk_after": risk_after,
            "risk_reduction": risk_reduction,
            "effort": g_info["effort"],
            "predicted_path": sim_pred["path"],
            "moves": sim_pred["moves"],
            "critical_transition": critical_transition,
            "explanation": f"If '{g_info['name']}' is applied, the risk changes from {risk_before} to {risk_after} (a reduction of {risk_reduction} points). Attacker adapts to secondary vector."
        }
