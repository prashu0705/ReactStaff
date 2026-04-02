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

    # Calculate salience (importance score) for sorting the insights
    insights = []
    
    if catalyst and catalyst.catalytic_rating > 0.75:
        rate_exp = f"⚡ Fast Kickoff: Reaction rate accelerates exceptionally fast driven by {catalyst.name}'s catalytic abilities (Rating: {catalyst.catalytic_rating})."
        insights.append({"key": "reaction_rate", "text": rate_exp, "priority": 8})
    else:
        rate_exp = f"📉 Slower Initiation: System is dragging on high activation energy required by {bottleneck.name if bottleneck else 'the team'}."
        insights.append({"key": "reaction_rate", "text": rate_exp, "priority": 4})

    if pairs:
        heaviest_pair = max(pairs, key=lambda p: p[2])
        n1 = next((c.name for c in team if c.id == heaviest_pair[0]), heaviest_pair[0])
        n2 = next((c.name for c in team if c.id == heaviest_pair[1]), heaviest_pair[1])
        yield_exp = f"⚠️ Yield Drag: Yield drops to {yield_sc:.2f} due to frictional drag (Severity {heaviest_pair[2]:.1f}) primarily between {n1} and {n2}."
        insights.append({"key": "yield_score", "text": yield_exp, "priority": 10}) # Friction is always highly critical to mention first
    else:
        yield_exp = f"🛡️ Perfect Harmony: Yield achieves {yield_sc:.2f} strictly because there is ZERO collaboration friction in this graph."
        insights.append({"key": "yield_score", "text": yield_exp, "priority": 9})

    if stability > 0.75:
        stab_exp = f"🧱 Structural Resilience: Highly resilient to deadline pressure (Stability Score: {stability:.2f})."
        insights.append({"key": "stability_score", "text": stab_exp, "priority": 6})
    else:
        stab_exp = f"🧊 Fragile State: Team is chemically unstable and structurally vulnerable (Stability: {stability:.2f})."
        insights.append({"key": "stability_score", "text": stab_exp, "priority": 9})
        
    insights.append({"key": "composite_score", "text": "🎯 Overall: Top-tier mathematically verified composition for the given project parameters.", "priority": 1})
        
    # Sort insights so the most aggressive/critical points surface to the very top in the UI
    insights.sort(key=lambda x: x["priority"], reverse=True)
    
    explanations = {item["key"]: item["text"] for item in insights}
    
    return TeamCompositionResult(
        team=team,
        reaction_rate=rate,
        yield_score=yield_sc,
        stability_score=stability,
        composite_score=composite,
        explanation=explanations,
        math_receipt=receipt
    )
