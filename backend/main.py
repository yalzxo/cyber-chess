import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from database import engine, Base, get_db
import models
import schemas
from seed_data import seed_database
from simulation_engine import SimulationEngine

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables
    Base.metadata.create_all(bind=engine)
    # Seed initial data
    db = next(get_db())
    try:
        seed_database(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title="CYBER CHESS API",
    description="Predictive AI Agent Security Simulation Backend",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow local React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health", tags=["System"])
def health_check():
    return {
        "status": "online",
        "engine": "NetworkX Probabilistic Attack Graph Engine",
        "company": "NovaCare Support",
        "agent": "Customer Support AI"
    }

@app.get("/api/agent", response_model=schemas.AgentSchema, tags=["Agent"])
def get_agent_details(db: Session = Depends(get_db)):
    agent = db.query(models.AgentModel).filter_by(id="agent_1").first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent

@app.get("/api/network", response_model=schemas.NetworkGraphSchema, tags=["Graph"])
def get_network_graph(db: Session = Depends(get_db)):
    engine_inst = SimulationEngine(db)
    return engine_inst.get_network_graph()

@app.get("/api/attack/current", response_model=schemas.AttackPathSchema, tags=["Attack"])
def get_current_attack_prediction(db: Session = Depends(get_db)):
    engine_inst = SimulationEngine(db)
    return engine_inst.get_current_attack()

@app.post("/api/simulation/start", tags=["Simulation"])
def start_simulation(db: Session = Depends(get_db)):
    engine_inst = SimulationEngine(db)
    return engine_inst.start_simulation()

@app.get("/api/risk", response_model=schemas.RiskScoreSchema, tags=["Risk"])
def get_risk_score(db: Session = Depends(get_db)):
    engine_inst = SimulationEngine(db)
    return engine_inst.get_risk_score()

@app.get("/api/guardrails", response_model=List[schemas.GuardrailSchema], tags=["Guardrails"])
def get_all_guardrails(db: Session = Depends(get_db)):
    return db.query(models.GuardrailModel).all()

@app.get("/api/guardrails/recommend", tags=["Guardrails"])
def get_recommended_guardrail(db: Session = Depends(get_db)):
    engine_inst = SimulationEngine(db)
    return engine_inst.get_recommendation()

@app.post("/api/guardrails/apply", response_model=schemas.GuardrailApplyResponse, tags=["Guardrails"])
def apply_guardrail(payload: schemas.GuardrailApplyRequest, db: Session = Depends(get_db)):
    engine_inst = SimulationEngine(db)
    try:
        return engine_inst.apply_guardrail(payload.guardrail_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/simulation/reset", tags=["Simulation"])
def reset_simulation(db: Session = Depends(get_db)):
    engine_inst = SimulationEngine(db)
    return engine_inst.reset_simulation()

@app.get("/api/history", response_model=List[schemas.IncidentHistorySchema], tags=["History"])
def get_attack_history(db: Session = Depends(get_db)):
    history = db.query(models.IncidentHistoryModel).order_by(models.IncidentHistoryModel.id.desc()).all()
    formatted = []
    for item in history:
        formatted.append({
            "id": item.id,
            "timestamp": item.timestamp.strftime("%Y-%m-%d %H:%M:%S") if item.timestamp else "",
            "scenario": item.scenario,
            "threat_type": item.threat_type,
            "outcome": item.outcome,
            "risk_before": item.risk_before,
            "risk_after": item.risk_after,
            "defense_applied": item.defense_applied
        })
    return formatted

@app.post("/api/what-if", response_model=schemas.WhatIfResponse, tags=["What-If"])
def run_what_if_analysis(payload: schemas.WhatIfRequest, db: Session = Depends(get_db)):
    engine_inst = SimulationEngine(db)
    return engine_inst.simulate_what_if(payload.guardrail_id)
