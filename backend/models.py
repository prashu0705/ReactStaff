from pydantic import BaseModel
from typing import List, Dict, Any, Tuple

class CandidateProfile(BaseModel):
    id: str
    name: str
    role_type: str
    activation_energy: float
    catalytic_rating: float
    role_valency: int
    thermal_stability: float
    inhibition_pairs: List[str]

class ProjectProfile(BaseModel):
    id: str
    name: str
    temperature: float
    yield_requirement: float
    reaction_type: str
    required_roles: List[str]
    team_size: int

class TeamCompositionResult(BaseModel):
    team: List[CandidateProfile]
    reaction_rate: float
    yield_score: float
    stability_score: float
    composite_score: float
    explanation: Dict[str, str]

class AuditReport(BaseModel):
    team: List[CandidateProfile]
    current_efficiency: float
    theoretical_maximum: float
    efficiency_gap: float
    bottleneck_person: str
    inhibition_pairs_found: List[Tuple[str, str]]
    drag_coefficient: float
    swap_recommendation: Dict[str, Any]
