from sqlalchemy import create_engine, Column, String, Float, Integer, JSON
from sqlalchemy.orm import declarative_base, sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./reactstaff.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class DbCandidate(Base):
    __tablename__ = "candidates"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    role_type = Column(String)
    activation_energy = Column(Float)
    catalytic_rating = Column(Float)
    role_valency = Column(Integer)
    thermal_stability = Column(Float)
    salary = Column(Float, default=0.0)
    inhibition_pairs = Column(JSON) # List of dicts

class DbProject(Base):
    __tablename__ = "projects"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    temperature = Column(Float)
    yield_requirement = Column(Float)
    reaction_type = Column(String)
    required_roles = Column(JSON)
    team_size = Column(Integer)
    budget_max = Column(Float, default=0.0)

Base.metadata.create_all(bind=engine)
