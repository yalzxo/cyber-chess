from sqlalchemy.orm import Session
import models

def seed_database(db: Session):
    # Delete existing agent if no risk_score column or to re-seed cleanly
    existing_agent = db.query(models.AgentModel).filter_by(id="agent_1").first()
    if existing_agent:
        db.query(models.PermissionModel).delete()
        db.query(models.ToolModel).delete()
        db.query(models.AgentModel).delete()
        db.commit()

    # Create Agent
    agent = models.AgentModel(
        id="agent_1",
        name="Customer Support AI",
        description="NovaCare Support customer-facing AI agent with automated ticket resolution capabilities.",
        status="MONITORED"
    )
    db.add(agent)

    # Create Tools with risk_level and risk_score
    tools_data = [
        {
            "id": "database",
            "name": "Customer Database",
            "risk_level": "CRITICAL",
            "risk_score": 94,
            "accessible": True,
            "description": "Production database containing confidential user accounts and billing records.",
            "permissions": ["Customer Database.read"]
        },
        {
            "id": "crm",
            "name": "CRM",
            "risk_level": "HIGH",
            "risk_score": 82,
            "accessible": True,
            "description": "Customer Relationship Management tool for viewing/modifying customer records.",
            "permissions": ["CRM.read", "CRM.write"]
        },
        {
            "id": "email",
            "name": "Email",
            "risk_level": "MEDIUM",
            "risk_score": 65,
            "accessible": True,
            "description": "Internal and external support email communications tool.",
            "permissions": ["Email.read", "Email.send"]
        },
        {
            "id": "docs",
            "name": "Internal Documents",
            "risk_level": "MEDIUM",
            "risk_score": 45,
            "accessible": True,
            "description": "Internal knowledgebase, support manuals, and policy documentation.",
            "permissions": ["Internal Documents.read"]
        }
    ]

    for t_data in tools_data:
        tool = models.ToolModel(
            id=t_data["id"],
            agent_id=agent.id,
            name=t_data["name"],
            risk_level=t_data["risk_level"],
            risk_score=t_data["risk_score"],
            accessible=t_data["accessible"],
            description=t_data["description"]
        )
        db.add(tool)
        db.flush()

        for p_name in t_data["permissions"]:
            perm = models.PermissionModel(
                tool_id=tool.id,
                permission_name=p_name,
                granted=True
            )
            db.add(perm)

    # Create Assets if empty
    if not db.query(models.AssetModel).first():
        assets_data = [
            {"id": "asset_crm", "name": "CRM System", "criticality": "HIGH", "description": "Customer profiles and interaction history"},
            {"id": "asset_db", "name": "Customer Database", "criticality": "CRITICAL", "description": "Core storage for user PII and credentials"},
            {"id": "asset_data", "name": "Sensitive Customer Data", "criticality": "CRITICAL", "description": "Names, emails, support history, financial metadata"}
        ]
        for a in assets_data:
            db.add(models.AssetModel(**a))

    # Create Guardrails catalog if empty
    if not db.query(models.GuardrailModel).first():
        guardrails_data = [
            {
                "id": "g_restrict_crm",
                "guardrail_id": "restrict_crm",
                "name": "Restrict CRM Access",
                "status": "AVAILABLE",
                "description": "Revoke write permissions to CRM to prevent automated data query escalations.",
                "target_tool": "CRM",
                "risk_reduction_est": 53,
                "effort": "LOW"
            },
            {
                "id": "g_require_approval",
                "guardrail_id": "require_human_approval",
                "name": "Require Human Approval",
                "status": "AVAILABLE",
                "description": "Mandate human review for actions modifying sensitive database records.",
                "target_tool": "AI Agent",
                "risk_reduction_est": 38,
                "effort": "MEDIUM"
            },
            {
                "id": "g_disable_email",
                "guardrail_id": "disable_email",
                "name": "Disable External Email Tool",
                "status": "AVAILABLE",
                "description": "Disable external outbound email transmission tools to halt exfiltration.",
                "target_tool": "Email",
                "risk_reduction_est": 25,
                "effort": "LOW"
            },
            {
                "id": "g_sandbox_agent",
                "guardrail_id": "sandbox_agent",
                "name": "Sandbox Agent",
                "status": "AVAILABLE",
                "description": "Run AI agent in isolated container environment with rate limits.",
                "target_tool": "AI Agent",
                "risk_reduction_est": 45,
                "effort": "HIGH"
            }
        ]
        for g in guardrails_data:
            db.add(models.GuardrailModel(**g))

    # Create initial Simulation State if empty
    if not db.query(models.SimulationStateModel).first():
        sim_state = models.SimulationStateModel(
            id=1,
            is_attack_active=True,
            current_risk_score=82,
            current_risk_level="HIGH",
            active_attack_path_json='["External Content", "AI Agent", "CRM", "Customer Database", "Sensitive Customer Data", "Staging Buffer", "Exfiltration Target"]',
            next_likely_move="CRM Tool Abuse",
            recommended_defense="Restrict CRM Access"
        )
        db.add(sim_state)

    db.commit()
