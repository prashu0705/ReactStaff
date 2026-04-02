from typing import List, Dict, Any
from models import CandidateProfile, ProjectProfile, AuditReport
from scoring_engine import score_team
from optimizer import find_top_teams
import inhibition_graph as ig

def audit_team(team: List[CandidateProfile], project: ProjectProfile, all_candidates: List[CandidateProfile], inhibition_graph) -> AuditReport:
    current_team_score = score_team(team, project, inhibition_graph)
    current_efficiency = current_team_score.composite_score
    
    top_teams = find_top_teams(all_candidates, project, inhibition_graph, top_n=1)
    theoretical_maximum = top_teams[0].composite_score if top_teams else current_efficiency
    
    efficiency_gap = theoretical_maximum - current_efficiency
    
    bottleneck_person = ""
    if team:
        bottleneck_person = max(team, key=lambda c: c.activation_energy).name
        
    pairs_found = ig.get_inhibition_pairs(team, inhibition_graph)
    
    id_to_name = {c.id: c.name for c in all_candidates}
    named_pairs = [(id_to_name.get(p[0], p[0]), id_to_name.get(p[1], p[1]), float(p[2])) for p in pairs_found]
    
    drag = ig.get_drag_coefficient(pairs_found)
    if project.reaction_type == 'chain': drag *= 1.5
    
    best_swap = {
        "remove": None,
        "add": None,
        "score_delta": 0.0,
        "reason": "No single swap improves the team."
    }
    
    best_improvement = 0.0
    team_ids = {c.id for c in team}
    non_team_candidates = [c for c in all_candidates if c.id not in team_ids]
    
    for current_member in team:
        for alternate in non_team_candidates:
            new_team = [c for c in team if c.id != current_member.id] + [alternate]
            
            # Simple check for role coverage completeness
            team_roles = [c.role_type for c in new_team]
            temp_roles = list(team_roles)
            has_all = True
            for req in project.required_roles:
                if req in temp_roles:
                    temp_roles.remove(req)
                else:
                    has_all = False
                    break
                    
            if not has_all:
                continue
                
            new_score = score_team(new_team, project, inhibition_graph)
            delta = new_score.composite_score - current_efficiency
            
            if delta > best_improvement:
                best_improvement = delta
                reason = "Improves overall score."
                if alternate.catalytic_rating > current_member.catalytic_rating:
                    reason = "Brings higher catalytic acceleration."
                elif alternate.activation_energy < current_member.activation_energy:
                    reason = "Produces lower team activation energy (faster onboarding)."
                elif alternate.thermal_stability > current_member.thermal_stability:
                    reason = "Improves thermal stability score."
                    
                best_swap = {
                    "remove": current_member.name,
                    "add": alternate.name,
                    "score_delta": delta,
                    "reason": reason
                }
                
    return AuditReport(
        team=team,
        current_efficiency=current_efficiency,
        theoretical_maximum=theoretical_maximum,
        efficiency_gap=efficiency_gap,
        bottleneck_person=bottleneck_person,
        inhibition_pairs_found=named_pairs,
        drag_coefficient=drag,
        swap_recommendation=best_swap
    )
