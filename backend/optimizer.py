import itertools
from typing import List
from models import CandidateProfile, ProjectProfile, TeamCompositionResult
from scoring_engine import score_team

def find_top_teams(candidates: List[CandidateProfile], project: ProjectProfile, inhibition_graph, top_n=3) -> List[TeamCompositionResult]:
    # Beam search for large candidate pools
    if len(candidates) > 15:
        # Score individuals to find the top 8 individual contributors
        individual_scores = []
        for c in candidates:
            res = score_team([c], project, inhibition_graph)
            individual_scores.append((c, res.composite_score))
        
        individual_scores.sort(key=lambda x: x[1], reverse=True)
        candidates = [x[0] for x in individual_scores[:8]]
        
    results = []
    
    # Generate all subsets of required size
    for subset in itertools.combinations(candidates, project.team_size):
        team = list(subset)
        
        # Check required roles are present
        team_roles = [c.role_type for c in team]
        has_all_roles = True
        # For simple literal required roles checking without deep multisets:
        # Just ensure each required role exists at least once, or if you need 2 engineers, ensure counting.
        # We will use counting to be safe since list could have multiples:
        temp_roles = list(team_roles)
        for req in project.required_roles:
            if req in temp_roles:
                temp_roles.remove(req)
            else:
                has_all_roles = False
                break
                
        if not has_all_roles:
            continue
            
        res = score_team(team, project, inhibition_graph)
        results.append(res)
        
    results.sort(key=lambda x: x.composite_score, reverse=True)
    return results[:top_n]
