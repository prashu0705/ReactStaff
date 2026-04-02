from models import CandidateProfile, ProjectProfile, InhibitionPair
from database import DbCandidate, DbProject

def get_seed_candidates():
    # 4 engineers, 2 designers, 2 PMs, 2 analysts, 2 QA.
    return [
        CandidateProfile(id="c1", name="Alice Enum", role_type="engineer", activation_energy=3.0, catalytic_rating=0.9, role_valency=4, thermal_stability=0.8, inhibition_pairs=[InhibitionPair(id="c2", severity=1.5)]),
        CandidateProfile(id="c2", name="Bob Array", role_type="engineer", activation_energy=7.0, catalytic_rating=0.4, role_valency=2, thermal_stability=0.5, inhibition_pairs=[InhibitionPair(id="c1", severity=1.5), InhibitionPair(id="c3", severity=0.5)]),
        CandidateProfile(id="c3", name="Charlie Hash", role_type="engineer", activation_energy=4.0, catalytic_rating=0.6, role_valency=3, thermal_stability=0.7, inhibition_pairs=[InhibitionPair(id="c2", severity=0.5)]),
        CandidateProfile(id="c4", name="Diana Node", role_type="engineer", activation_energy=2.0, catalytic_rating=0.8, role_valency=5, thermal_stability=0.9, inhibition_pairs=[]),
        CandidateProfile(id="c5", name="Eve Pixel", role_type="designer", activation_energy=5.0, catalytic_rating=0.7, role_valency=3, thermal_stability=0.7, inhibition_pairs=[]),
        CandidateProfile(id="c6", name="Frank Vector", role_type="designer", activation_energy=4.0, catalytic_rating=0.5, role_valency=2, thermal_stability=0.6, inhibition_pairs=[InhibitionPair(id="c7", severity=2.0)]),
        CandidateProfile(id="c7", name="Grace Sprint", role_type="pm", activation_energy=2.5, catalytic_rating=0.9, role_valency=5, thermal_stability=0.8, inhibition_pairs=[InhibitionPair(id="c6", severity=2.0)]),
        CandidateProfile(id="c8", name="Heidi Agile", role_type="pm", activation_energy=6.0, catalytic_rating=0.4, role_valency=4, thermal_stability=0.9, inhibition_pairs=[]),
        CandidateProfile(id="c9", name="Ivan Metric", role_type="analyst", activation_energy=3.0, catalytic_rating=0.6, role_valency=3, thermal_stability=0.7, inhibition_pairs=[]),
        CandidateProfile(id="c10", name="Judy Chart", role_type="analyst", activation_energy=5.0, catalytic_rating=0.5, role_valency=2, thermal_stability=0.8, inhibition_pairs=[]),
        CandidateProfile(id="c11", name="Karl Test", role_type="qa", activation_energy=2.0, catalytic_rating=0.8, role_valency=4, thermal_stability=0.9, inhibition_pairs=[]),
        CandidateProfile(id="c12", name="Laura Bug", role_type="qa", activation_energy=4.5, catalytic_rating=0.6, role_valency=3, thermal_stability=0.8, inhibition_pairs=[])
    ]

def get_seed_projects():
    return [
        ProjectProfile(id="p1", name="Urgent Delivery API", temperature=9.0, yield_requirement=0.85, reaction_type="chain", required_roles=["pm", "engineer", "engineer", "qa"], team_size=4),
        ProjectProfile(id="p2", name="Research Q3 Prototype", temperature=3.0, yield_requirement=0.60, reaction_type="parallel", required_roles=["pm", "designer", "engineer", "analyst"], team_size=4)
    ]

def seed_db_if_empty(db_session):
    if db_session.query(DbCandidate).count() == 0:
        for c in get_seed_candidates():
            db_c = DbCandidate(
                id=c.id, name=c.name, role_type=c.role_type, activation_energy=c.activation_energy,
                catalytic_rating=c.catalytic_rating, role_valency=c.role_valency, thermal_stability=c.thermal_stability,
                inhibition_pairs=[p.dict() for p in c.inhibition_pairs]
            )
            db_session.add(db_c)
        for p in get_seed_projects():
            db_p = DbProject(
                id=p.id, name=p.name, temperature=p.temperature, yield_requirement=p.yield_requirement,
                reaction_type=p.reaction_type, required_roles=p.required_roles, team_size=p.team_size
            )
            db_session.add(db_p)
        db_session.commit()
