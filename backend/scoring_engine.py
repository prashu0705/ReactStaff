import math
import numpy as np
from typing import List
from models import CandidateProfile, ProjectProfile, TeamCompositionResult

def calculate_activation_energy(team: List[CandidateProfile]) -> float:
    if not team: return 0.0
    return float(np.mean([c.activation_energy for c in team]))

def calculate_catalytic_coefficient(team: List[CandidateProfile]) -> float:
    if not team: return 0.0
    base = float(np.mean([c.catalytic_rating for c in team]))
    boost = sum(0.1 for c in team if c.catalytic_rating > 0.8)
    return base + boost

def calculate_role_complementarity(team: List[CandidateProfile], required_roles: List[str]) -> float:
    if not required_roles: return 1.0
    covered_roles = [c.role_type for c in team]
    covered_copy = list(covered_roles)
    coverage_count = 0
    for req in required_roles:
        if req in covered_copy:
            coverage_count += 1
            covered_copy.remove(req)
    score = coverage_count / len(required_roles)
    required_relationships = len(team) - 1
    penalty = sum(0.05 for c in team if c.role_valency < required_relationships)
    score -= penalty
    return max(0.0, min(1.0, score))

def calculate_yield_score(team: List[CandidateProfile], project: ProjectProfile, inhibition_graph) -> float:
    import inhibition_graph as ig
    target = project.yield_requirement
    pairs = ig.get_inhibition_pairs(team, inhibition_graph)
    drag = ig.get_drag_coefficient(pairs)
    if project.reaction_type == 'chain':
        drag *= 1.5
    score = target - drag
    return max(0.0, min(1.0, score))

def calculate_stability_score(team: List[CandidateProfile], project: ProjectProfile) -> float:
    if not team: return 0.0
    return float(np.mean([c.thermal_stability for c in team]))

def sigmoid(x):
    return 1 / (1 + math.exp(-x))

def score_team(team: List[CandidateProfile], project: ProjectProfile, inhibition_graph) -> TeamCompositionResult:
    A = calculate_catalytic_coefficient(team)
    Ea = calculate_activation_energy(team)
    R = calculate_role_complementarity(team, project.required_roles)
    T = project.temperature
    
    if R == 0 or T == 0:
        rate = 0.0
        receipt = f"Rate = 0.0 (Invalid Constraints)"
    else:
        exponent = -Ea / (R * T)
        raw_rate = A * math.exp(exponent)
        rate = sigmoid(raw_rate)
        receipt = f"Rate = sigmoid({A:.2f} * exp(-{Ea:.2f} / ({R:.2f} * {T}))) = {rate:.4f}"
        
    yield_sc = calculate_yield_score(team, project, inhibition_graph)
    stability = calculate_stability_score(team, project)
    
    composite = 0.4 * rate + 0.35 * yield_sc + 0.25 * stability
    receipt += f" | Composite = 0.4*({rate:.4f}) + 0.35*({yield_sc:.4f}) + 0.25*({stability:.4f}) = {composite:.4f}"
    
    import inhibition_graph as ig
    pairs = ig.get_inhibition_pairs(team, inhibition_graph)
    
    # Identify key actors
    bottleneck = max(team, key=lambda c: c.activation_energy) if team else None
    catalyst = max(team, key=lambda c: c.catalytic_rating) if team else None

    audit_trail = [
        {"step": "Catalytic Initialization", "value": f"A={A:.2f}", "description": f"Base group catalytic multiplier evaluated" + (f" with a boost off {catalyst.name}" if catalyst and catalyst.catalytic_rating > 0.8 else "")},
        {"step": "Activation Energy Drag", "value": f"Ea={Ea:.2f}", "description": f"Averaged metabolic drag across all members" + (f", burdened heavily by {bottleneck.name}" if bottleneck and bottleneck.activation_energy > 5 else "")},
        {"step": "Role Complementarity", "value": f"R={R:.2f}", "description": f"Verified coverage of required project sequences: {', '.join(project.required_roles)}"},
        {"step": "Temperature Factor", "value": f"T={T:.1f}", "description": "Applied core project thermal multiplier."},
        {"step": "Arrhenius Transformation", "value": f"Rate={rate:.3f}", "description": "Passed coefficients through sigmoid activation limit."},
        {"step": "Network Friction Analysis", "value": f"Yield={yield_sc:.3f}", "description": f"Reduced structural yield ceiling ({project.yield_requirement}) by calculated graph pair conflicts."}
    ]
    
    career_pathways = []
    # Identify limiting metric to assign growth trajectory
    metrics = {
        "Kinetic Reaction Rate": rate,
        "Structural Yield": yield_sc,
        "Thermal Stability": stability,
        "Role Coverage": R
    }
    worst_metric_name = sorted(metrics.items(), key=lambda x: x[1])[0][0]
    
    if worst_metric_name == "Thermal Stability":
        weakest = min(team, key=lambda c: c.thermal_stability) if team else None
        strongest = max(team, key=lambda c: c.thermal_stability) if team else None
        if weakest:
            mentorship = f" under {strongest.name}" if strongest and strongest.id != weakest.id else ""
            career_pathways.append({
                "employee": weakest.name,
                "diagnosis": f"Critical Structural Frailty (Stability: {weakest.thermal_stability})",
                "deterministic_path": f"Assign to an extensive peer-mentorship track{mentorship} to build operational latency tolerance."
            })
    elif worst_metric_name == "Kinetic Reaction Rate" and bottleneck:
        career_pathways.append({
            "employee": bottleneck.name,
            "diagnosis": f"High Systemic Activation Requirement (Ea: {bottleneck.activation_energy})",
            "deterministic_path": f"Enroll in rapid-kickoff acceleration courses to reduce drag before next major deployment cycle."
        })
    elif worst_metric_name == "Structural Yield" and pairs:
        heaviest_pair = max(pairs, key=lambda p: p[2])
        n1 = next((c for c in team if c.id == heaviest_pair[0]), None)
        n2 = next((c for c in team if c.id == heaviest_pair[1]), None)
        if n1 and n2:
            career_pathways.append({
                "employee": f"{n1.name} & {n2.name}",
                "diagnosis": f"Relational Graph Friction (Severity: {heaviest_pair[2]:.1f})",
                "deterministic_path": f"Mandatory cross-functional mediation to resolve bottlenecked yield dynamics between these specific nodes."
            })
    
    explanations = {}
    
    return TeamCompositionResult(
        team=team,
        reaction_rate=rate,
        yield_score=yield_sc,
        stability_score=stability,
        composite_score=composite,
        explanation=explanations,
        math_receipt=receipt,
        audit_trail=audit_trail,
        career_pathways=career_pathways
    )
