import networkx as nx
from typing import List, Tuple
from models import CandidateProfile

def build_inhibition_graph(candidates: List[CandidateProfile]) -> nx.Graph:
    G = nx.Graph()
    for c in candidates:
        G.add_node(c.id)
        
    for c in candidates:
        for pair in c.inhibition_pairs:
            if G.has_node(pair.id):
                G.add_edge(c.id, pair.id, weight=pair.severity)
                
    return G

def get_inhibition_pairs(team: List[CandidateProfile], graph: nx.Graph) -> List[Tuple[str, str, float]]:
    team_ids = [c.id for c in team]
    subgraph = graph.subgraph(team_ids)
    
    pairs_with_weights = []
    for u, v, data in subgraph.edges(data=True):
        pairs_with_weights.append((u, v, data.get('weight', 1.0)))
        
    return pairs_with_weights

def get_drag_coefficient(pairs: List[Tuple[str, str, float]]) -> float:
    if not pairs: return 0.0
    return 0.08 * sum(p[2] for p in pairs)
