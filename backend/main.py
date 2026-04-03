from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from sqlalchemy.orm import Session
import hashlib

from models import CandidateProfile, ProjectProfile, TeamCompositionResult, AuditReport, InhibitionPair
from database import SessionLocal, DbCandidate, DbProject, DbUser
import inhibition_graph as ig
import optimizer
import audit_engine
from seed_data import seed_db_if_empty

class LoginRequest(BaseModel):
    email: str
    password: str

app = FastAPI(title="ReactStaff Intelligence Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def parse_candidate(db_c: DbCandidate) -> CandidateProfile:
    pairs = [InhibitionPair(**p) for p in db_c.inhibition_pairs] if db_c.inhibition_pairs else []
    return CandidateProfile(
        id=db_c.id, name=db_c.name, role_type=db_c.role_type,
        activation_energy=db_c.activation_energy, catalytic_rating=db_c.catalytic_rating,
        role_valency=db_c.role_valency, thermal_stability=db_c.thermal_stability,
        salary=db_c.salary, inhibition_pairs=pairs
    )

def parse_project(db_p: DbProject) -> ProjectProfile:
    return ProjectProfile(
        id=db_p.id, name=db_p.name, temperature=db_p.temperature,
        yield_requirement=db_p.yield_requirement, reaction_type=db_p.reaction_type,
        required_roles=db_p.required_roles or [], team_size=db_p.team_size,
        budget_max=db_p.budget_max
    )

@app.on_event("startup")
def startup_event():
    db = SessionLocal()
    seed_db_if_empty(db)
    db.close()

class ComposeRequest(BaseModel):
    project_id: str

class AuditRequest(BaseModel):
    project_id: str
    team_ids: List[str]

@app.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    db_user = db.query(DbUser).filter(DbUser.email == request.email).first()
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    pw_hash = hashlib.sha256(request.password.encode()).hexdigest()
    if db_user.password_hash != pw_hash:
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    return {"token": "simulated_token_xyz_reactstaff", "email": db_user.email}

@app.post("/register")
def register(request: LoginRequest, db: Session = Depends(get_db)):
    db_user = db.query(DbUser).filter(DbUser.email == request.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="User already exists")
    
    pw_hash = hashlib.sha256(request.password.encode()).hexdigest()
    new_user = DbUser(email=request.email, password_hash=pw_hash)
    db.add(new_user)
    db.commit()
    
    return {"token": "simulated_token_xyz_reactstaff", "email": new_user.email}

@app.post("/candidates", response_model=CandidateProfile)
def add_candidate(candidate: CandidateProfile, db: Session = Depends(get_db)):
    db_c = DbCandidate(
        id=candidate.id, name=candidate.name, role_type=candidate.role_type,
        activation_energy=candidate.activation_energy, catalytic_rating=candidate.catalytic_rating,
        role_valency=candidate.role_valency, thermal_stability=candidate.thermal_stability,
        salary=candidate.salary, inhibition_pairs=[p.dict() for p in candidate.inhibition_pairs]
    )
    db.add(db_c)
    db.commit()
    return candidate

@app.get("/candidates", response_model=List[CandidateProfile])
def get_candidates(db: Session = Depends(get_db)):
    return [parse_candidate(c) for c in db.query(DbCandidate).all()]

@app.delete("/candidates/{c_id}")
def delete_candidate(c_id: str, db: Session = Depends(get_db)):
    db_c = db.query(DbCandidate).filter(DbCandidate.id == c_id).first()
    if db_c:
        db.delete(db_c)
        db.commit()
        return {"status": "deleted"}
    raise HTTPException(status_code=404, detail="Candidate not found")

@app.post("/projects", response_model=ProjectProfile)
def add_project(project: ProjectProfile, db: Session = Depends(get_db)):
    db_p = DbProject(
        id=project.id, name=project.name, temperature=project.temperature,
        yield_requirement=project.yield_requirement, reaction_type=project.reaction_type,
        required_roles=project.required_roles, team_size=project.team_size,
        budget_max=project.budget_max
    )
    db.add(db_p)
    db.commit()
    return project

@app.get("/projects", response_model=List[ProjectProfile])
def get_projects(db: Session = Depends(get_db)):
    return [parse_project(p) for p in db.query(DbProject).all()]

@app.post("/compose", response_model=List[TeamCompositionResult])
def compose_team(request: ComposeRequest, db: Session = Depends(get_db)):
    db_p = db.query(DbProject).filter(DbProject.id == request.project_id).first()
    if not db_p: raise HTTPException(status_code=404, detail="Project not found")
    
    project = parse_project(db_p)
    all_candidates = [parse_candidate(c) for c in db.query(DbCandidate).all()]
    graph = ig.build_inhibition_graph(all_candidates)
    
    return optimizer.find_top_teams(all_candidates, project, graph, top_n=3)

@app.post("/audit", response_model=AuditReport)
def audit(request: AuditRequest, db: Session = Depends(get_db)):
    db_p = db.query(DbProject).filter(DbProject.id == request.project_id).first()
    if not db_p: raise HTTPException(status_code=404, detail="Project not found")
    project = parse_project(db_p)
    
    all_candidates = [parse_candidate(c) for c in db.query(DbCandidate).all()]
    all_candidates_dict = {c.id: c for c in all_candidates}
    
    team = []
    for c_id in request.team_ids:
        if c_id not in all_candidates_dict:
            raise HTTPException(status_code=400, detail=f"Team member {c_id} not found in pool")
        team.append(all_candidates_dict[c_id])
    
    graph = ig.build_inhibition_graph(all_candidates)
    return audit_engine.audit_team(team, project, all_candidates, graph)
