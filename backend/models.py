from pydantic import BaseModel
from typing import List, Dict, Any, Tuple, Optional

class InhibitionPair(BaseModel):
    id: str
    severity: float

class CandidateProfile(BaseModel):
    id: str
    name: str
    role_type: str
    activation_energy: float
    catalytic_rating: float
    role_valency: int
    thermal_stability: float
    salary: float = 0.0
    inhibition_pairs: List[InhibitionPair]
    
    class Config:
        from_attributes = True

class ProjectProfile(BaseModel):
    id: str
    name: str
    temperature: float
    yield_requirement: float
    reaction_type: str
    required_roles: List[str]
    team_size: int
    budget_max: float = 0.0

    class Config:
        from_attributes = True

class TeamCompositionResult(BaseModel):
    team: List[CandidateProfile]
    reaction_rate: float
    yield_score: float
    stability_score: float
    composite_score: float
    explanation: Dict[str, str]
    math_receipt: str
    team_cost: float = 0.0
    audit_trail: List[Dict[str, Any]] = []
    career_pathways: List[Dict[str, str]] = []
    hiring_blueprint: Optional[Dict[str, Any]] = None
    ml_score: Optional[float] = None


class AuditReport(BaseModel):
    team: List[CandidateProfile]
    current_efficiency: float
    theoretical_maximum: float
    efficiency_gap: float
    bottleneck: Optional[CandidateProfile] = None
    inhibition_pairs_found: List[Tuple[str, str, float]]
    drag_coefficient: float
    swap_recommendation: Dict[str, Any]
    bus_factor_risk: Optional[Dict[str, Any]] = None
    burnout_risk: Optional[Dict[str, Any]] = None
