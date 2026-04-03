import React, { useState } from 'react'
import CandidatePool from '../components/CandidatePool'
import ProjectConfig from '../components/ProjectConfig'
import ReactionDiagram from '../components/ReactionDiagram'
import { composeTeam } from '../api'

function Spinner({ className }) {
  return (
    <div className={`flex items-center gap-3 ${className || ''}`}>
      <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#1A56A0' }} />
      <div className="text-sm text-gray-600">Running reaction kinetics...</div>
    </div>
  )
}

function MemberNode({ member }) {
  const initials = (member && member.name ? member.name.split(' ').map(s => s[0]).slice(0,2).join('') : '??')
  return (
    <div className="flex items-center gap-2">
      <div className="w-10 h-10 rounded-full bg-[#1A56A0] text-white flex items-center justify-center font-semibold">{initials}</div>
      <div className="text-sm">
        <div className="font-medium">{member.name}</div>
        <div className="text-xs text-gray-500">{member.role_type}</div>
      </div>
    </div>
  )
}

function ScoreGauge({ label, value, percent }) {
  const [w, setW] = React.useState(0)
  React.useEffect(() => {
    // animate from 0 to percent over 800ms
    const t = setTimeout(() => setW(percent || 0), 30)
    return () => clearTimeout(t)
  }, [percent])

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-gray-600">
        <div>{label}</div>
        <div className="font-medium">{typeof value === 'number' ? (Number(value).toFixed(2)) : value}</div>
      </div>
      <div className="w-full bg-gray-200 h-2 rounded overflow-hidden">
        <div className="h-2 rounded transition-all duration-700" style={{ width: `${w}%`, background: '#1A56A0' }} />
      </div>
    </div>
  )
}

function AuditMatrix({ trail }) {
  const [open, setOpen] = React.useState(false);
  if (!trail || trail.length === 0) return null;
  
  return (
    <div className="mt-5 border border-gray-200 rounded-lg overflow-hidden">
      <button 
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="font-semibold text-sm flex items-center gap-2 text-[#1A56A0]">
          <span>🔍 Inspect Processing Matrix (Audit Trail)</span>
        </div>
        <span className="text-gray-500 text-xs bg-white px-2 py-1 rounded shadow-sm border">{open ? 'Collapse Pipeline' : 'Expand Pipeline'}</span>
      </button>
      
      {open && (
        <div className="p-4 bg-white space-y-2">
          {trail.map((step, idx) => (
            <div key={idx} className="flex gap-4 relative">
              {idx !== trail.length - 1 && <div className="absolute left-[11px] top-6 bottom-[-16px] w-[2px] bg-blue-100"></div>}
              <div className="relative z-10 w-6 h-6 rounded-full bg-blue-50 border-2 border-[#1A56A0] flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 bg-[#1A56A0] rounded-full"></div>
              </div>
              <div className="pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-sm text-gray-800">{step.step}</span>
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-[#1A56A0] text-xs font-mono font-bold border border-blue-200">{step.value}</span>
                </div>
                <div className="text-xs text-gray-600 mt-1">{step.description}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CareerPathways({ pathways }) {
  if (!pathways || pathways.length === 0) return null;
  
  return (
    <div className="mt-4 bg-amber-50/50 border border-amber-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-amber-700 font-bold text-sm tracking-wide uppercase flex items-center gap-2">
          <span>📈</span> Deterministic Career Pathway
        </span>
      </div>
      <div className="space-y-3">
        {pathways.map((path, idx) => (
          <div key={idx} className="bg-white p-3 rounded shadow-sm border border-amber-100">
            <div className="flex justify-between items-start mb-1.5">
              <span className="font-bold text-sm text-gray-900">{path.employee}</span>
              <span className="text-[10px] uppercase font-bold tracking-wider bg-red-100 text-red-700 px-2 py-0.5 rounded border border-red-200">Coaching Required</span>
            </div>
            <div className="text-xs text-red-600 mb-2 font-medium bg-red-50 inline-block px-2 py-1 rounded">{path.diagnosis}</div>
            <div className="text-sm font-medium text-amber-800 bg-amber-50 p-2.5 rounded border border-amber-200/50">
              💡 {path.deterministic_path}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HiringBlueprint({ bp }) {
  if (!bp) return null;
  return (
    <div className="mt-4 bg-indigo-50 border border-indigo-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-indigo-700 font-bold text-sm tracking-wide uppercase flex items-center gap-2">
          <span>🔍</span> Reverse-Engineered Hiring Blueprint
        </span>
      </div>
      <div className="bg-white p-3 rounded shadow-sm border border-indigo-100 space-y-2">
        <div className="text-sm font-medium text-indigo-900 border-b pb-2 mb-2">Team capacity capped. Optimal replacement hire required:</div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-gray-50 p-2 rounded border border-gray-100">
             <span className="text-gray-500 text-xs block">Target Role</span>
             <span className="font-bold">{bp.missing_role}</span>
          </div>
          <div className="bg-gray-50 p-2 rounded border border-gray-100">
             <span className="text-gray-500 text-xs block">Max Activation Energy</span>
             <span className="font-bold text-red-600">{bp.target_ea}</span>
          </div>
          <div className="bg-gray-50 p-2 rounded border border-gray-100">
             <span className="text-gray-500 text-xs block">Min Thermal Stability</span>
             <span className="font-bold text-green-600">{bp.target_stability}</span>
          </div>
          <div className="bg-gray-50 p-2 rounded border border-gray-100">
             <span className="text-gray-500 text-xs block">Crucial: Avoid Friction With</span>
             <span className="font-bold text-red-600">{bp.avoid_friction_with}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ComposeView() {
  const [selectedProjectId, setSelectedProjectId] = useState(null)
  const [running, setRunning] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)

  async function runReaction() {
    if (!selectedProjectId) {
      alert('Please select a project first')
      return
    }
    setRunning(true)
    setError(null)
    setResults(null)
    try {
      const res = await composeTeam(selectedProjectId)
      // Expect res to be an array of top compositions
      setResults(Array.isArray(res) ? res.slice(0,3) : [])
    } catch (err) {
      setError(err.message || String(err))
    } finally {
      setRunning(false)
    }
  }

  // Helper to compute percent bars for scores across results
  function computePercents(items, key) {
    if (!items || items.length === 0) return []
    const vals = items.map(it => (it && it[key] != null) ? Number(it[key]) : 0)
    const min = Math.min(...vals)
    const max = Math.max(...vals)
    if (max === min) return vals.map(v => 60)
    return vals.map(v => Math.round(((v - min) / (max - min)) * 100))
  }

  const reactionPercents = computePercents(results || [], 'reaction_rate')
  const yieldPercents = computePercents(results || [], 'yield_score')
  const stabilityPercents = computePercents(results || [], 'stability_score')

  const medals = ['🥇 Optimal Composition', '🥈 Second Option', '🥉 Third Option']

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Compose Team</h2>

      <div className="flex gap-6">
        <div className="w-[35%] space-y-4">
          <CandidatePool />
          <ProjectConfig selectedProjectId={selectedProjectId} onSelectProject={setSelectedProjectId} />
        </div>

        <div className="flex-1">
          <div className="p-4 bg-white rounded shadow mb-4 flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Selected Project ID: <span className="font-medium">{selectedProjectId ?? 'None'}</span></div>
            </div>
            <div>
              <button onClick={runReaction} className="px-4 py-2 bg-[#1A56A0] text-white rounded">Run Reaction ⚗️</button>
            </div>
          </div>

          <div className="p-4 bg-white rounded shadow min-h-[60vh]">
            {running && <Spinner />}
            {error && <div className="text-sm text-red-600">{error}</div>}

            {!running && !results && (
              <div className="text-gray-700">Select a project and click "Run Reaction ⚗️" to compute top team compositions.</div>
            )}

            {!running && results && results.length === 0 && (
              <div className="text-gray-700">No compositions returned.</div>
            )}

            {!running && results && results.length > 0 && (
              <div className="space-y-4">
                {results.map((r, i) => (
                  <div key={i} className="p-4 border rounded">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-lg font-semibold">{medals[i] || `Option ${i+1}`}</div>
                        <div className="text-[11px] text-gray-500 uppercase tracking-widest mt-1">Composite Match (Arrhenius)</div>
                        <div className="flex items-end gap-3 mb-2">
                          <div className="text-3xl font-black text-[#1A56A0] leading-none">{r.composite_score ? r.composite_score.toFixed(3) : '—'}</div>
                          {r.ml_score != null && (
                            <div className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded border border-purple-200" title="Calculated via Backend Machine Learning API">
                              TF-IDF Score: <span className="font-bold">{r.ml_score.toFixed(3)}</span>
                            </div>
                          )}
                        </div>
                        <div className="inline-block px-3 py-1 bg-green-50 text-green-800 font-medium rounded-full text-sm border border-green-200">
                          Total Burn: <span className="font-bold">${r.team_cost ? r.team_cost.toLocaleString() : '0'}</span>
                        </div>
                      </div>

                      <div className="space-y-2 w-1/3">
                        <ScoreGauge label="Reaction Rate" value={r.reaction_rate} percent={reactionPercents[i] ?? 50} />
                        <ScoreGauge label="Yield" value={r.yield_score} percent={yieldPercents[i] ?? 50} />
                        <ScoreGauge label="Stability" value={r.stability_score} percent={stabilityPercents[i] ?? 50} />
                      </div>
                    </div>

                    <div className="mt-3">
                      <ReactionDiagram team={r.team || []} project={null} />
                    </div>

                    <div className="mt-4">
                      <div className="font-semibold mb-2">Why This Team?</div>
                      <ul className="list-disc list-inside text-sm text-gray-700">
                        {r.explanation && Object.values(r.explanation).map((line, idx) => (<li key={idx}>{line}</li>))}
                      </ul>
                      
                      <CareerPathways pathways={r.career_pathways} />
                      <HiringBlueprint bp={r.hiring_blueprint} />
                      <AuditMatrix trail={r.audit_trail} />
                      
                      {r.math_receipt && (
                        <div className="mt-3 p-3 bg-gray-50 border border-gray-300 rounded font-mono text-xs text-gray-500 truncate" title={r.math_receipt}>
                          {r.math_receipt}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
