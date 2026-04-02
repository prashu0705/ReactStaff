import React, { useEffect, useState, useRef } from 'react'
import { getProjects, addProject } from '../api'

const ROLE_COLORS = {
  engineer: '#3B82F6',
  designer: '#8B5CF6',
  pm: '#F59E0B',
  analyst: '#10B981',
  qa: '#6B7280',
  default: '#64748B'
}

function ReactionBadge({ type }) {
  const map = {
    Parallel: '#10B981',
    Chain: '#F59E0B',
    'Catalytic Cycle': '#3B82F6'
  }
  const color = map[type] || '#64748B'
  return <span className="text-xs text-white px-2 py-0.5 rounded" style={{ background: color }}>{type}</span>
}

export default function ProjectConfig({ selectedProjectId, onSelectProject }) {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', temperature: 5, yield_requirement: 80, reaction_type: 'Parallel', budget_max: 500000 })
  const modalRef = useRef(null)

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') setShowModal(false)
    }
    if (showModal) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showModal])

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await getProjects()
      setProjects(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || String(err))
    } finally {
      setLoading(false)
    }
  }

  async function handleAdd(e) {
    e.preventDefault()
    const payload = {
      id: 'p' + Date.now().toString().slice(-6),
      name: form.name,
      temperature: Number(form.temperature),
      yield_requirement: Number(form.yield_requirement) / 100, // Map 0-100 UI to 0-1 schema
      reaction_type: form.reaction_type,
      required_roles: ["engineer", "designer"], // Defaults because they exist in backend schema
      team_size: 4,
      budget_max: Number(form.budget_max)
    }

    try {
      const created = await addProject(payload)
      await load()
      setShowModal(false)
      // auto-select new project if returned id
      if (created && created.id && onSelectProject) onSelectProject(created.id)
    } catch (err) {
      alert('Error creating project: ' + (err.message || err))
    }
  }

  return (
    <div className="bg-white rounded shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium">Projects</h3>
        <button onClick={() => setShowModal(true)} className="px-3 py-1 bg-[#1A56A0] text-white rounded text-sm">Add Project</button>
      </div>

      {loading && <div className="text-sm text-gray-500">Loading...</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}

      <div className="space-y-3">
        {projects.length === 0 && !loading && <div className="text-sm text-gray-500">No projects yet.</div>}

        <div className="grid grid-cols-1 gap-3 max-h-[40vh] overflow-auto">
          {projects.map(p => (
            <div key={p.id} onClick={() => onSelectProject && onSelectProject(p.id)}
              className={`p-3 rounded border cursor-pointer ${selectedProjectId === p.id ? 'border-[#1A56A0] ring-1 ring-[#1A56A0]/30' : 'border-gray-200 hover:shadow'} `}>

              <div className="flex items-center justify-between">
                <div className="font-medium">{p.name}</div>
                <ReactionBadge type={p.reaction_type || 'Parallel'} />
              </div>

              <div className="mt-2 flex items-center gap-3 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <span role="img" aria-label="thermometer">🌡️</span>
                  <div>{p.temperature ?? '-'}</div>
                </div>
                <div className="flex items-center gap-1">
                  <span role="img" aria-label="money">💰</span>
                  <div>${p.budget_max ? (p.budget_max / 1000).toFixed(0) + 'k' : '0'}</div>
                </div>

                <div className="flex-1">
                  <div className="text-xs text-gray-500">Yield Requirement</div>
                  <div className="w-full bg-gray-200 h-2 rounded">
                    <div className="h-2 rounded" style={{ width: `${p.yield_requirement ?? 0}%`, background: '#1A56A0' }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <div className="fixed inset-0 bg-black/60" />
          <div ref={modalRef} className="bg-white rounded shadow max-w-md w-full p-5 z-50">
            <h4 className="text-lg font-semibold mb-3">Add Project</h4>
            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="block text-sm">Name</label>
                <input required className="w-full border px-2 py-1 rounded" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>

              <div>
                <label className="block text-sm">Temperature (1-10)</label>
                <input type="range" min="1" max="10" value={form.temperature} onChange={e => setForm({ ...form, temperature: e.target.value })} />
                <div className="text-xs text-gray-500">{form.temperature}</div>
              </div>

              <div>
                <label className="block text-sm">Yield Requirement (%)</label>
                <input type="range" min="0" max="100" value={form.yield_requirement} onChange={e => setForm({ ...form, yield_requirement: e.target.value })} />
                <div className="text-xs text-gray-500">{form.yield_requirement}%</div>
              </div>

              <div>
                <label className="block text-sm">Reaction Type</label>
                <select className="w-full border px-2 py-1 rounded" value={form.reaction_type} onChange={e => setForm({ ...form, reaction_type: e.target.value })}>
                  <option>Parallel</option>
                  <option>Chain</option>
                  <option>Catalytic Cycle</option>
                </select>
              </div>

              <div>
                <label className="block text-sm">Budget Max ($)</label>
                <input type="number" min="0" step="10000" className="w-full border px-2 py-1 rounded" value={form.budget_max} onChange={e => setForm({ ...form, budget_max: e.target.value })} />
              </div>

              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-3 py-1 border rounded">Cancel</button>
                <button type="submit" className="px-3 py-1 bg-[#1A56A0] text-white rounded">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
