# ReactStaff ⚗️

ReactStaff is an advanced team chemistry and composition engine. It models software engineering teams as thermodynamic chemical reactions to optimize yields using algorithmic models that analyze team interactions.

## Key Features

- **Arrhenius Kinetics v2 Engine**: A deterministic scoring function that measures how effectively a team can overcome operational "activation energy" given the structural "temperature" under which they operate.
- **Machine Learning Fallback**: Evaluates team summaries and candidate resumes using a classical Term Frequency-Inverse Document Frequency (TF-IDF) semantic search mapped into a Decision Tree regressor.
- **Deterministic Explainability**: Transparency interface allowing users to sandbox metrics (Activation Energy, Environment Temp, Catalyst Rating, Role Coverage) locally.
- **Team Composition Audit**: Identify network friction, bottleneck alerts, swap recommendations, burnout predictability, and bus-factor risk on an operational team.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Python, FastAPI, SQLite

## Setup Instructions

### Backend Start:

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```
(*Backend runs on port 8000*)

### Frontend Start:

```bash
# In the root repository directory
npm install
npm run dev
```
(*Frontend runs on port 5173*)

---

*Hackathon Mode: AI Without the API — 100% Deterministic.*
