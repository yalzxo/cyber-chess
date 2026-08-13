import math
import networkx as nx
from typing import List, Dict, Any, Tuple, Optional

class AttackGraphEngine:
    """
    NetworkX-backed probabilistic attack graph engine for AI Guardrail Chess.
    Calculates path probabilities using log-weight shortest path traversal.
    """
    def __init__(self):
        self.G = nx.DiGraph()
        self.nodes_data: Dict[str, Dict[str, Any]] = {}
        self._initialize_default_graph()

    def _initialize_default_graph(self):
        self.nodes_data = {
            "External Content": {"id": "External Content", "label": "External Content", "type": "entry", "risk_level": "info", "accessible": True},
            "AI Agent": {"id": "AI Agent", "label": "Customer Support AI", "type": "agent", "risk_level": "monitored", "accessible": True},
            "CRM": {"id": "CRM", "label": "CRM System", "type": "tool", "risk_level": "high", "accessible": True},
            "Email": {"id": "Email", "label": "Email Service", "type": "tool", "risk_level": "medium", "accessible": True},
            "Internal Documents": {"id": "Internal Documents", "label": "Internal Docs", "type": "tool", "risk_level": "medium", "accessible": True},
            "Customer Database": {"id": "Customer Database", "label": "Customer DB", "type": "asset", "risk_level": "critical", "accessible": True},
            "Sensitive Customer Data": {"id": "Sensitive Customer Data", "label": "Sensitive Customer Data", "type": "target", "risk_level": "critical", "accessible": True},
            "Staging Buffer": {"id": "Staging Buffer", "label": "Staging Buffer", "type": "asset", "risk_level": "high", "accessible": True},
            "Exfiltration Target": {"id": "Exfiltration Target", "label": "Exfiltration Channel", "type": "target", "risk_level": "critical", "accessible": True},
        }

        for node_id, attrs in self.nodes_data.items():
            self.G.add_node(node_id, **attrs)

        # Default edges & probabilities for 7-move chain sequences
        self.default_edges = [
            # Entry to Agent
            {
                "id": "e_ext_agent",
                "source": "External Content",
                "target": "AI Agent",
                "technique": "Prompt Injection",
                "probability": 0.96,
                "required_permission": None,
                "enabled": True
            },
            # Agent to CRM (Primary Vector)
            {
                "id": "e_agent_crm",
                "source": "AI Agent",
                "target": "CRM",
                "technique": "Instruction Hijacking",
                "probability": 0.89,
                "required_permission": None,
                "enabled": True
            },
            # CRM to Customer DB
            {
                "id": "e_crm_db",
                "source": "CRM",
                "target": "Customer Database",
                "technique": "CRM Tool Abuse",
                "probability": 0.81,
                "required_permission": "CRM.write",
                "enabled": True
            },
            # Customer DB to Sensitive Data
            {
                "id": "e_db_data",
                "source": "Customer Database",
                "target": "Sensitive Customer Data",
                "technique": "Customer Database Access",
                "probability": 0.72,
                "required_permission": None,
                "enabled": True
            },
            # Sensitive Data to Staging Buffer
            {
                "id": "e_data_staging",
                "source": "Sensitive Customer Data",
                "target": "Staging Buffer",
                "technique": "Sensitive Data Retrieval",
                "probability": 0.68,
                "required_permission": None,
                "enabled": True
            },
            # Staging Buffer to Exfiltration Target
            {
                "id": "e_staging_exfil",
                "source": "Staging Buffer",
                "target": "Exfiltration Target",
                "technique": "Data Aggregation",
                "probability": 0.54,
                "required_permission": None,
                "enabled": True
            },
            # Final Step
            {
                "id": "e_exfil_done",
                "source": "Exfiltration Target",
                "target": "Exfiltration Target",
                "technique": "Data Exfiltration Attempt",
                "probability": 0.43,
                "required_permission": None,
                "enabled": True
            },

            # Alternative Adapted Vector (when CRM is blocked)
            {
                "id": "e_agent_email",
                "source": "AI Agent",
                "target": "Email",
                "technique": "Instruction Hijacking",
                "probability": 0.89,
                "required_permission": None,
                "enabled": True
            },
            {
                "id": "e_email_docs",
                "source": "Email",
                "target": "Internal Documents",
                "technique": "Email Tool Abuse",
                "probability": 0.65,
                "required_permission": "Email.send",
                "enabled": True
            },
            {
                "id": "e_docs_data",
                "source": "Internal Documents",
                "target": "Sensitive Customer Data",
                "technique": "Internal Document Access",
                "probability": 0.55,
                "required_permission": None,
                "enabled": True
            }
        ]

        for edge in self.default_edges:
            if edge["source"] != edge["target"]:
                weight = -math.log(max(edge["probability"], 0.001))
                self.G.add_edge(
                    edge["source"],
                    edge["target"],
                    id=edge["id"],
                    technique=edge["technique"],
                    probability=edge["probability"],
                    required_permission=edge["required_permission"],
                    enabled=edge["enabled"],
                    weight=weight
                )

    def apply_tool_accessibility(self, tool_accessibility: Dict[str, bool], active_guardrails: List[str] = None):
        """
        Updates node accessibility and edge availability based on tools and active guardrails.
        """
        if active_guardrails is None:
            active_guardrails = []

        # Reset accessibility
        for node_id in self.nodes_data:
            self.nodes_data[node_id]["accessible"] = True

        # Apply tool overrides
        for tool_name, is_accessible in tool_accessibility.items():
            if tool_name in self.nodes_data:
                self.nodes_data[tool_name]["accessible"] = is_accessible

        # Explicit guardrail effects
        if "restrict_crm" in active_guardrails:
            self.nodes_data["CRM"]["accessible"] = False
        if "disable_email" in active_guardrails:
            self.nodes_data["Email"]["accessible"] = False
        
        # Update graph nodes
        for node_id, attrs in self.nodes_data.items():
            self.G.nodes[node_id]["accessible"] = attrs["accessible"]

        # Update edges
        for u, v, data in self.G.edges(data=True):
            u_acc = self.G.nodes[u].get("accessible", True)
            v_acc = self.G.nodes[v].get("accessible", True)

            is_enabled = u_acc and v_acc

            if "sandbox_agent" in active_guardrails:
                prob = data["probability"] * 0.5
                data["probability"] = prob
                data["weight"] = -math.log(max(prob, 0.001))
            elif "require_human_approval" in active_guardrails and u == "AI Agent":
                prob = data["probability"] * 0.4
                data["probability"] = prob
                data["weight"] = -math.log(max(prob, 0.001))

            data["enabled"] = is_enabled

    def get_most_probable_path(self, source: str = "External Content", target: str = "Exfiltration Target") -> Tuple[List[str], float, bool]:
        """
        Calculates the highest probability path using Dijkstra on -log(prob).
        Returns (path_nodes, path_probability, is_target_reachable).
        """
        enabled_edges = [(u, v, d) for u, v, d in self.G.edges(data=True) if d.get("enabled", True)]
        H = nx.DiGraph()
        H.add_nodes_from(self.G.nodes(data=True))
        for u, v, d in enabled_edges:
            H.add_edge(u, v, **d)

        try:
            if nx.has_path(H, source, target):
                path = nx.shortest_path(H, source=source, target=target, weight="weight")
                prob = 1.0
                for i in range(len(path) - 1):
                    u, v = path[i], path[i+1]
                    edge_prob = H[u][v].get("probability", 1.0)
                    prob *= edge_prob
                return path, round(prob, 4), True
            else:
                # Find path to Sensitive Customer Data if Exfiltration Target unreachable
                if nx.has_path(H, source, "Sensitive Customer Data"):
                    path = nx.shortest_path(H, source=source, target="Sensitive Customer Data", weight="weight")
                    prob = 1.0
                    for i in range(len(path) - 1):
                        u, v = path[i], path[i+1]
                        prob *= H[u][v].get("probability", 1.0)
                    return path, round(prob, 4), True

                reachable = list(nx.single_source_shortest_path(H, source).values())
                longest_path = max(reachable, key=len) if reachable else [source]
                return longest_path, 0.0, False
        except Exception:
            return [source], 0.0, False

    def export_graph_dict(self, active_path: List[str]) -> Dict[str, Any]:
        """
        Exports graph nodes and edges for API and React Flow consumption.
        """
        nodes_res = []
        for n, d in self.G.nodes(data=True):
            status = "active" if n in active_path else ("blocked" if not d.get("accessible", True) else "clear")
            if n in ["Sensitive Customer Data", "Exfiltration Target"] and n in active_path:
                status = "compromised"
            
            nodes_res.append({
                "id": n,
                "label": d.get("label", n),
                "type": d.get("type", "tool"),
                "risk_level": d.get("risk_level", "medium"),
                "status": status,
                "accessible": d.get("accessible", True)
            })

        edges_res = []
        path_pairs = set(zip(active_path[:-1], active_path[1:])) if len(active_path) > 1 else set()

        for u, v, d in self.G.edges(data=True):
            in_path = (u, v) in path_pairs
            edges_res.append({
                "id": d.get("id", f"e_{u}_{v}"),
                "source": u,
                "target": v,
                "technique": d.get("technique", "Transition"),
                "probability": round(d.get("probability", 0.5), 2),
                "enabled": d.get("enabled", True),
                "in_attack_path": in_path,
                "required_permission": d.get("required_permission")
            })

        return {"nodes": nodes_res, "edges": edges_res}

    def clone(self) -> 'AttackGraphEngine':
        cloned = AttackGraphEngine()
        cloned.G = self.G.copy()
        cloned.nodes_data = {k: v.copy() for k, v in self.nodes_data.items()}
        return cloned
