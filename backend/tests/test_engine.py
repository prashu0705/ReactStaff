import pytest
from models import CandidateProfile, ProjectProfile, InhibitionPair
from scoring_engine import calculate_reaction_rate, score_team
import inhibition_graph as ig

@pytest.fixture
def mock_candidates():
    return [
        CandidateProfile(id="t1", name="Test Eng 1", role_type="engineer", activation_energy=2.0, catalytic_rating=0.9, role_valency=3, thermal_stability=0.8, inhibition_pairs=[InhibitionPair(id="t2", severity=1.0)]),
        CandidateProfile(id="t2", name="Test Eng 2", role_type="engineer", activation_energy=4.0, catalytic_rating=0.5, role_valency=3, thermal_stability=0.6, inhibition_pairs=[]),
        CandidateProfile(id="t3", name="Test PM 1", role_type="pm", activation_energy=1.0, catalytic_rating=0.9, role_valency=5, thermal_stability=0.9, inhibition_pairs=[InhibitionPair(id="t1", severity=0.5)])
    ]
    
@pytest.fixture
def mock_project():
    return ProjectProfile(id="p1", name="Test Project", temperature=5.0, yield_requirement=0.8, reaction_type="parallel", required_roles=["engineer", "pm"], team_size=2)

def test_arrhenius_boundaries(mock_candidates, mock_project):
    team = [mock_candidates[0], mock_candidates[2]]
    graph = ig.build_inhibition_graph(mock_candidates)
    
    res = score_team(team, mock_project, graph)
    assert 0.0 <= res.reaction_rate <= 1.0, "Reaction rate breached Sigmoid bounds."
    assert 0.0 <= res.yield_score <= 1.0, "Yield score mathematically invalid."
    assert 0.0 <= res.stability_score <= 1.0, "Stability constrained bounds failed."
    assert 0.0 <= res.composite_score <= 1.0, "Composite score weighted distribution breached."

def test_math_receipt_generated(mock_candidates, mock_project):
    team = [mock_candidates[0], mock_candidates[2]]
    graph = ig.build_inhibition_graph(mock_candidates)
    
    res = score_team(team, mock_project, graph)
    assert "Rate = sigmoid" in res.math_receipt, "Missing Arrhenius explicit definition."
    assert "Composite =" in res.math_receipt, "Missing weighted distribution trace."

def test_graph_severity_weights(mock_candidates):
    graph = ig.build_inhibition_graph(mock_candidates)
    
    pairs_t1_t2 = ig.get_inhibition_pairs([mock_candidates[0], mock_candidates[1]], graph)
    drag_1 = ig.get_drag_coefficient(pairs_t1_t2)
    assert pytest.approx(drag_1) == 0.08, "Severity weight 1.0 failed scalar multiplier."
    
    pairs_t1_t3 = ig.get_inhibition_pairs([mock_candidates[0], mock_candidates[2]], graph)
    drag_2 = ig.get_drag_coefficient(pairs_t1_t3)
    assert pytest.approx(drag_2) == 0.04, "Severity weight 0.5 failed scalar multiplier."
