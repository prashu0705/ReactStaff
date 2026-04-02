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
                        <div className="text-sm text-gray-500">Composite Score: <span className="font-bold text-2xl">{r.composite_score ?? r.score ?? '—'}</span></div>
                      </div>

                      <div className="space-y-2 w-1/3">
                        <ScoreGauge label="Reaction Rate" value={r.reaction_rate} percent={reactionPercents[i] ?? 50} />
                        <ScoreGauge label="Yield" value={r.yield_score} percent={yieldPercents[i] ?? 50} />
                        <ScoreGauge label="Stability" value={r.stability_score} percent={stabilityPercents[i] ?? 50} />
                      </div>
                    </div>

                    <div className="mt-3">
                      <ReactionDiagram team={r.members || []} project={null} />
                    </div>

                    <div className="mt-4">
                      <div className="font-semibold mb-2">Why This Team?</div>
                      <ul className="list-disc list-inside text-sm text-gray-700">
                        {Array.isArray(r.explanation) ? r.explanation.map((line, idx) => (<li key={idx}>{line}</li>)) : (<li>{String(r.explanation)}</li>)}
                      </ul>
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
