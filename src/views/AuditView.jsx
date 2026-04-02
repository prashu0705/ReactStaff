import React, { useEffect, useState } from 'react'
import ProjectConfig from '../components/ProjectConfig'
import ReactionDiagram from '../components/ReactionDiagram'
import { getCandidates, auditTeam } from '../api'

function Spinner({ className, text }) {
  return (
    <div className={`flex items-center gap-3 ${className || ''}`}>
      <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#1A56A0' }} />
      <div className="text-sm text-gray-600">{text}</div>
    </div>
  )
}

export default function AuditView() {
  const [projectsSelected, setProjectsSelected] = useState(null)
  const [candidates, setCandidates] = useState([])
  const [selectedIds, setSelectedIds] = useState([])
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadCandidates()
  }, [])

  async function loadCandidates() {
    try {
      const data = await getCandidates()
      setCandidates(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
    }
  }

  function toggle(id) {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  async function runAudit() {
    if (!projectsSelected) return alert('Please select a project first')
    if (!selectedIds.length) return alert('Please select at least one team member')

    setLoading(true)
    setError(null)
    setReport(null)
    try {
      const res = await auditTeam(projectsSelected, selectedIds)
      setReport(res)
    } catch (err) {
      setError(err.message || String(err))
    } finally {
      setLoading(false)
    }
  }

  const selectedMembers = candidates.filter(c => selectedIds.includes(c.id))

  // helper to render efficiency meter
  function EfficiencyMeter({ current, theoretical }) {
    const cur = Number(current || 0)
    const theo = Number(theoretical || 1)
    const pct = theo > 0 ? Math.round((cur / theo) * 100) : 0
    const gap = Math.abs(theo - cur)
    return (
      <div className="p-4 border rounded">
        <div className="text-sm text-gray-600">Efficiency</div>
        <div className="text-3xl font-bold">{(pct)}%</div>
        <div className="w-full bg-gray-200 h-3 rounded mt-2 overflow-hidden">
          <div className="h-3 rounded transition-all duration-700" style={{ width: `${pct}%`, background: '#1A56A0' }} />
        </div>
        {gap > 0.15 && (
          <div className="mt-2 text-sm text-red-600">Efficiency gap: {(gap * 100).toFixed(1)}% (below theoretical)</div>
        )}
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Audit Team</h2>

      <div className="flex gap-6">
        <div className="w-[35%] space-y-4">
          <ProjectConfig selectedProjectId={projectsSelected} onSelectProject={setProjectsSelected} />

          <div className="bg-white rounded shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Build Your Team</h3>
              <div className="text-xs text-gray-500">{selectedIds.length} selected</div>
            </div>

            <div className="max-h-[50vh] overflow-auto">
              {candidates.map(c => (
                <label key={c.id} className="flex items-center gap-3 p-2 border-b last:border-b-0">
                  <input type="checkbox" checked={selectedIds.includes(c.id)} onChange={() => toggle(c.id)} />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{c.name}</div>
                    <div className="text-xs text-gray-500">{c.role_type} — Ea: {c.activation_energy}</div>
                  </div>
                </label>
              ))}
            </div>

            <div className="mt-3 flex justify-end">
              <button onClick={runAudit} className="px-4 py-2 bg-[#1A56A0] text-white rounded">Run Audit ⚗️</button>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="p-4 bg-white rounded shadow mb-4">
            {loading && <Spinner text="Analyzing reaction chemistry..." />}
            {!loading && !report && <div className="text-gray-700">Build a team on the left and click Run Audit to analyze chemical risk.</div>}
            {error && <div className="text-sm text-red-600">{error}</div>}
          </div>

          {report && (
            <div className="space-y-4">
              {/* Reaction Diagram */}
              <div className="p-4 bg-white rounded shadow">
                <div className="font-semibold mb-2">Reaction Diagram</div>
                <ReactionDiagram team={report.team || selectedMembers} project={report.project || null} />
              </div>

              {/* Efficiency Meter and Bottleneck */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <EfficiencyMeter current={report.current_efficiency} theoretical={report.theoretical_maximum} />
                </div>

                <div className="col-span-2">
                  {report.bottleneck && (
                    <div className="p-4 bg-red-50 border-l-4 border-red-500">
                      <div className="font-semibold text-red-700">Bottleneck Alert</div>
                      <div className="text-sm text-red-700">Highest Activation Energy: {report.bottleneck.name} (Ea: {report.bottleneck.activation_energy}). This person is the primary drag on time-to-productivity.</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Inhibition Report */}
              {report.inhibition_pairs_found && report.inhibition_pairs_found.length > 0 && (
                <div className="p-4 bg-white rounded shadow">
                  <div className="font-semibold mb-2">Inhibition Report</div>
                  <div className="space-y-2">
                    {report.inhibition_pairs_found.map((p, idx) => (
                      <div key={idx} className="p-3 bg-red-50 border border-red-200 rounded">
                        <div className="font-medium">{p.a_name} ↔ {p.b_name}</div>
                        <div className="text-sm">Known friction pair. Yield drag: {p.yield_drag ?? p.drag ?? '—'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Swap Recommendation */}
              {report.swap_recommendation && (
                <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                  <div className="font-semibold">Swap Recommendation</div>
                  <div className="text-sm">Recommended Swap: Remove {report.swap_recommendation.remove_name} , Add {report.swap_recommendation.add_name}. Score improvement: +{report.swap_recommendation.delta ?? report.swap_recommendation.score_delta}. Reason: {report.swap_recommendation.reason}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
