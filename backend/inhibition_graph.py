import networkx as nx
from typing import List, Tuple
from models import CandidateProfile

def build_inhibition_graph(candidates: List[CandidateProfile]) -> nx.Graph:
    """Build an undirected graph of known negative pairings"""
    G = nx.Graph()
    for c in candidates:
        G.add_node(c.id)
        
    for c in candidates:
        for blocked_id in c.inhibition_pairs:
            # Only add if the node exists (to maintain safety)
            if G.has_node(blocked_id):
                G.add_edge(c.id, blocked_id, weight=1.0)
                
    return G

def get_inhibition_pairs(team: List[CandidateProfile], graph: nx.Graph) -> List[Tuple[str, str]]:
    """Return all edges (inhibition pairs) present within the team subset"""
    team_ids = [c.id for c in team]
    # We create a subgraph of the team members
    subgraph = graph.subgraph(team_ids)
    return list(subgraph.edges())

def get_drag_coefficient(pairs: List[Tuple[str, str]]) -> float:
    """Return total yield drag from all inhibitions in the team"""
    return 0.08 * len(pairs)
