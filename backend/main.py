from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

from models import CandidateProfile, ProjectProfile, TeamCompositionResult, AuditReport
from seed_data import get_seed_candidates, get_seed_projects
import inhibition_graph as ig
import optimizer
import audit_engine

app = FastAPI(title="ReactStaff Intelligence Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage
candidates_db = {}
projects_db = {}

graph_cache = None

def get_graph():
    global graph_cache
    if not graph_cache:
        graph_cache = ig.build_inhibition_graph(list(candidates_db.values()))
    return graph_cache

def rebuild_graph():
    global graph_cache
    graph_cache = ig.build_inhibition_graph(list(candidates_db.values()))

@app.on_event("startup")
async def startup_event():
    for c in get_seed_candidates():
        candidates_db[c.id] = c
    for p in get_seed_projects():
        projects_db[p.id] = p
    rebuild_graph()

# Models for request bodies
class ComposeRequest(BaseModel):
    project_id: str

class AuditRequest(BaseModel):
    project_id: str
    team_ids: List[str]

@app.post("/candidates")
def add_candidate(candidate: CandidateProfile):
    candidates_db[candidate.id] = candidate
    rebuild_graph()
    return {"status": "success", "candidate": candidate}

@app.get("/candidates", response_model=List[CandidateProfile])
def get_candidates():
    return list(candidates_db.values())

@app.delete("/candidates/{c_id}")
def delete_candidate(c_id: str):
    if c_id in candidates_db:
        del candidates_db[c_id]
        rebuild_graph()
        return {"status": "deleted"}
    raise HTTPException(status_code=404, detail="Candidate not found")

@app.post("/projects")
def add_project(project: ProjectProfile):
    projects_db[project.id] = project
    return {"status": "success", "project": project}

@app.get("/projects", response_model=List[ProjectProfile])
def get_projects():
    return list(projects_db.values())

@app.post("/compose", response_model=List[TeamCompositionResult])
def compose_team(request: ComposeRequest):
    if request.project_id not in projects_db:
        raise HTTPException(status_code=404, detail="Project not found")
        
    project = projects_db[request.project_id]
    all_candidates = list(candidates_db.values())
    top_teams = optimizer.find_top_teams(all_candidates, project, get_graph(), top_n=3)
    return top_teams

@app.post("/audit", response_model=AuditReport)
def audit(request: AuditRequest):
    if request.project_id not in projects_db:
        raise HTTPException(status_code=404, detail="Project not found")
        
    project = projects_db[request.project_id]
    team = [candidates_db[c_id] for c_id in request.team_ids if c_id in candidates_db]
    
    if len(team) != len(request.team_ids):
        raise HTTPException(status_code=400, detail="Some team members not found in candidate pool")
        
    all_candidates = list(candidates_db.values())
    return audit_engine.audit_team(team, project, all_candidates, get_graph())
