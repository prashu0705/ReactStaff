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
    top_results = results[:top_n]
    
    if not top_results:
        return []
        
    optimal = top_results[0]
    optimal.explanation = {
        "intro": "🥇 The Optimal Choice: This combination mathematically yields the highest overall Composite Score.",
        "yield": f"🏆 Yield Advantage: Achieves {optimal.yield_score*100:.1f}% efficiency metric.",
        "rate": f"⚡ Dominant Speed: Sustains an operational reaction rate of {optimal.reaction_rate:.2f}.",
    }
    
    def compare_metrics(ref, tgt, ref_name):
        diffs = {
            "Reaction Velocity": (ref.reaction_rate - tgt.reaction_rate, tgt.reaction_rate),
            "Structural Yield": (ref.yield_score - tgt.yield_score, tgt.yield_score),
            "Thermal Stability": (ref.stability_score - tgt.stability_score, tgt.stability_score)
        }
        lost = {k: v for k, v in diffs.items() if v[0] > 0.001}
        won = {k: v for k, v in diffs.items() if v[0] < -0.001}
        
        loss_str = ""
        if lost:
            k = max(lost, key=lambda x: lost[x][0])
            loss_str = f"Trades away {lost[k][0]*100:.1f}% capability in {k} vs {ref_name}."
            
        win_str = ""
        if won:
            k = min(won, key=lambda x: won[x][0])
            win_str = f"Outperforms {ref_name} by {abs(won[k][0])*100:.1f}% in {k}."
            
        return loss_str, win_str

    for idx, res in enumerate(top_results[1:], start=1):
        rank = idx + 1
        intro_str = "🥈 Alternative Option 2" if rank == 2 else "🥉 Alternative Option 3"
        exp = {
            "intro": f"{intro_str}: Secured a composite score of {res.composite_score:.3f} but fell short of the optimal configuration."
        }
        
        # Compare with Option 1
        l1, w1 = compare_metrics(optimal, res, "Option 1")
        parts1 = [p for p in (l1, w1) if p]
        exp["vs_opt1"] = f"🔴 Comparison to Option 1 (Optimal): {' '.join(parts1)}" if parts1 else "⚖️ Comparison to Option 1: Statistically identical aggregate performance."
        
        # Compare with Option 2 if this is Option 3
        if rank == 3:
            l2, w2 = compare_metrics(top_results[1], res, "Option 2")
            parts2 = [p for p in (l2, w2) if p]
            exp["vs_opt2"] = f"📉 Comparison to Option 2: {' '.join(parts2)}" if parts2 else "⚖️ Comparison to Option 2: Interchangeable variant with no major metric deviations."
            
        # Find members uniquely swapped from optimal
        opt_members = {m.id for m in optimal.team}
        res_members = {m.id for m in res.team}
        unique_to_res = res_members - opt_members
        unique_to_opt = opt_members - res_members
        
        if unique_to_res and unique_to_opt:
            swap_in = next((m.name for m in res.team if m.id in unique_to_res), "Alternative")
            swap_out = next((m.name for m in optimal.team if m.id in unique_to_opt), "Optimal Member")
            exp["composition"] = f"🔄 Roster Engine Shift: Swaps {swap_out} out for {swap_in}."
            
        res.explanation = exp
        
    return top_results
