# ♟ AI CHESS (AI Guardrail Chess)

> **Tagline:** *"Predict the attack. Make the counter-move."*

**AI Chess** is an autonomous cybersecurity platform designed for AI-agent security. Instead of simply alerting that a prompt injection was detected, AI Chess mathematically predicts how an indirect prompt injection or malicious input will escalate through an AI agent's available tools and permissions using a **NetworkX probabilistic attack graph engine**.

---

## 🎯 Key Features & Core Loop

1. **Predictive Attack Graphs**: Computes transition probabilities across agent tool boundaries using NetworkX Dijkstra log-weight path calculation.
2. **Adversary Next-Move Prediction**: Answers *what is the most probable next attack move?* (e.g., `CRM Tool Abuse` at **81%** transition probability).
3. **Dynamic Defense Recommendation**: Evaluates all candidate guardrails (*Restrict CRM Access*, *Require Human Approval*, *Disable External Email Tool*, *Sandbox Agent*), ranks them by risk reduction, and recommends the optimal counter-move.
4. **Real-Time Path Interdiction**: Applying a guardrail immediately alters agent tool accessibility, rebuilds the NetworkX attack graph, and recalculates risk in real time (e.g. Risk drops from **82 → 29** / 100 and marks the target database as **UNREACHABLE**).
5. **Interactive "What-If?" Simulator**: Test hypothetical guardrail scenarios without modifying live state.
6. **Full-Stack REST Architecture**: Real FastAPI + SQLAlchemy (SQLite) backend connected to a high-performance React + React Flow frontend.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python 3.9+**
- **Node.js 18+** & **npm**

---

### 1. Start the Backend

```bash
cd backend

# Create & activate Python virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server with live reload
uvicorn main:app --reload
```

The backend server will run at:
- **API URL:** `http://localhost:8000`
- **Swagger Docs:** `http://localhost:8000/docs`

---

### 2. Start the Frontend

In a separate terminal window:

```bash
cd frontend

# Install Node dependencies
npm install

# Start Vite development server
npm run dev
```

The frontend application will open at:
- **Web App URL:** `http://localhost:5173`

---

## 🏛 Architecture & Project Structure

```
ai-guardrail-chess/
│
├── backend/
│   ├── main.py                # FastAPI REST Endpoints & Lifespan Seeding
│   ├── database.py            # SQLite database & SQLAlchemy configuration
│   ├── models.py              # SQLAlchemy DB models
│   ├── schemas.py             # Pydantic request/response schemas
│   ├── graph_engine.py        # NetworkX attack graph traversal engine
│   ├── attack_predictor.py    # Attack chain & next-move predictor
│   ├── risk_engine.py         # 0-100 Normalized risk calculation engine
│   ├── defense_engine.py      # Guardrail simulation & ranking engine
│   ├── simulation_engine.py   # State coordinator & persistent state manager
│   ├── seed_data.py           # Synthetic NovaCare Support data seeder
│   └── requirements.txt       # Python backend dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/        # React Flow AttackGraph, CommandCenter, etc.
│   │   ├── services/          # REST API fetch service client
│   │   ├── types/             # TypeScript model definitions
│   │   ├── App.tsx            # Main application layout & global state
│   │   ├── index.css          # Cyberpunk dark theme styles
│   │   └── main.tsx           # React entry point
│   ├── package.json           # Frontend dependencies
│   └── vite.config.ts         # Vite proxy setup for local API
│
├── README.md                  # Instructions and project documentation
└── .gitignore                 # Version control exclusions
```

---

## 🎬 60–90 Second Hackathon Demo Script

1. **Open Command Center** (`http://localhost:5173`)
   - Show Customer Support AI agent monitored in synthetic company *NovaCare Support*.
   - Point out initial **Cyber Risk: 82 / 100 (HIGH)**.

2. **Click "START ATTACK"**
   - Watch the **Attack Graph** highlight the active attack path:
     `External Content` → `AI Agent` → `CRM` → `Customer Database` → `Sensitive Customer Data`

3. **Inspect AI Adversary Analysis**
   - Next Likely Move: **CRM Tool Abuse (81%)**
   - Best Counter-Move: **Restrict CRM Access** (Risk Reduction: **53 points**).

4. **Click "APPLY GUARDRAIL"**
   - Observe real backend execution (`POST /api/guardrails/apply`).
   - The backend revokes CRM write permission and rebuilds the attack graph.
   - The attack path is **INTERRUPTED**, Customer Database becomes **UNREACHABLE**, and Cyber Risk drops to **29 / 100 (LOW)**.

5. **Test "WHAT IF?" Mode**
   - Open the **WHAT IF?** modal to test hypothetical guardrails like *Sandbox Agent* or *Disable External Email Tool* and view comparative risk deltas.

6. **Reset Environment**
   - Click **RESET SIMULATION** (`POST /api/simulation/reset`) to restore initial conditions.
