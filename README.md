# ♟ CYBER CHESS 

> **Tagline:** *"Predict the attack. Make the counter-move."*

**Cyber Chess** is an autonomous cybersecurity platform for securing AI agents. Instead of simply detecting prompt injection, it predicts how a malicious input could propagate through an agent's tools and permissions, identifies the **most probable next attack move**, and recommends the guardrail that best reduces the risk.

---

## 🎯 Key Features

* **Predictive Attack Graphs**
  Models AI-agent tools, permissions, external inputs, databases, and sensitive resources using **NetworkX**.

* **Adversary Next-Move Prediction**
  **Predicts the attacker's most likely next action and assigns a transition probability to it.**
  Example: `CRM Tool Abuse — 81% probability`.

* **Dynamic Defense Recommendation**
  Evaluates available guardrails and ranks them based on their estimated risk reduction.

* **Real-Time Path Interdiction**
  Applying a guardrail changes tool accessibility, rebuilds the attack graph, and recalculates the risk score.

* **What-If Simulator**
  Compare hypothetical defenses without modifying the active simulation.

* **Full-Stack Architecture**
  FastAPI + SQLAlchemy + SQLite backend with a React + React Flow frontend.

---

## 🚀 Quick Start

### Prerequisites

* Python 3.9+
* Node.js 18+
* npm

### Backend

```bash
cd backend

python3 -m venv .venv
source .venv/bin/activate

pip install -r requirements.txt

uvicorn main:app --reload
```

Backend:

```text
API:     http://localhost:8000
Swagger: http://localhost:8000/docs
```

### Frontend

Open a second terminal:

```bash
cd frontend

npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

## 🏛 Architecture

```text
cyber-chess/
│
├── backend/
│   ├── main.py                # FastAPI endpoints & application startup
│   ├── database.py            # SQLite & SQLAlchemy configuration
│   ├── models.py              # Database models
│   ├── schemas.py             # Pydantic schemas
│   ├── graph_engine.py        # NetworkX attack graph engine
│   ├── attack_predictor.py    # Attack prediction
│   ├── risk_engine.py         # Risk calculation
│   ├── defense_engine.py      # Guardrail evaluation
│   ├── simulation_engine.py   # Simulation state management
│   ├── seed_data.py           # Synthetic NovaCare Support data
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/        # React Flow & UI components
│   │   ├── services/          # REST API client
│   │   ├── types/             # TypeScript types
│   │   ├── App.tsx            # Main application
│   │   ├── index.css          # Application styling
│   │   └── main.tsx           # Entry point
│   ├── package.json
│   └── vite.config.ts
│
├── README.md
└── .gitignore
```

---

## 🔄 System Workflow

Cyber Chess follows a predictive defense loop:

```text
Malicious Input
      ↓
AI Agent
      ↓
Attack Graph
      ↓
⭐ NEXT-MOVE PREDICTION
      ↓
Risk Calculation
      ↓
Guardrail Recommendation
      ↓
Apply Defense
      ↓
Recalculate Attack Graph
```

---

## 🧩 Core Components

| Component               | Purpose                                                       |
| ----------------------- | ------------------------------------------------------------- |
| **NetworkX**            | Attack graph construction and path analysis                   |
| **Attack Predictor**    | Predicts the adversary's next move and transition probability |
| **Risk Engine**         | Produces a normalized 0–100 risk score                        |
| **Defense Engine**      | Evaluates and ranks guardrails                                |
| **Simulation Engine**   | Manages simulation state                                      |
| **FastAPI**             | REST API                                                      |
| **SQLAlchemy + SQLite** | Data persistence                                              |
| **React + React Flow**  | Interactive security dashboard                                |
| **Vite**                | Frontend development server                                   |

---

## 🛡️ Guardrails

Cyber Chess can evaluate defenses such as:

* Restrict CRM Access
* Require Human Approval
* Disable External Email Tool
* Sandbox Agent

Each defense is evaluated based on how effectively it disrupts reachable attack paths and reduces overall risk.

---

## 🔌 REST API

The backend provides endpoints for:

* Simulation state
* Attack prediction
* Attack graph generation
* Risk calculation
* Guardrail recommendations
* Guardrail application
* What-if simulations
* Simulation reset

Interactive API documentation:

```text
http://localhost:8000/docs
```

---

## 🎮 Simulation Controls

| Control              | Action                                             |
| -------------------- | -------------------------------------------------- |
| **START ATTACK**     | Activates the simulated attack                     |
| **APPLY GUARDRAIL**  | Applies the selected defense and recalculates risk |
| **WHAT IF?**         | Tests a defense without changing the active state  |
| **RESET SIMULATION** | Restores the initial environment                   |

---

## 🎯 Project Goal

Cyber Chess shifts AI-agent security from **detection to prediction and intervention**.

Instead of stopping at:

> "Prompt injection detected."

it answers:

> **What will the attacker likely do next?**
> **How probable is that move?**
> **What can they reach?**
> **Which defense is most effective?**
> **How does the attack surface change after applying it?**
