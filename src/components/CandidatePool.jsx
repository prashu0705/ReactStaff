import React, { useEffect, useState, useRef } from 'react'
import { getCandidates, addCandidate, deleteCandidate } from '../api'

// Helper to safely compute percent assuming values are 0-10 (clamped)
function toPercent(value) {
  const v = Number(value)
  if (!isFinite(v)) return 0
  const clamped = Math.max(0, Math.min(10, v))
  return Math.round((clamped / 10) * 100)
}

const ROLE_COLORS = {
  engineer: '#3B82F6',
  designer: '#8B5CF6',
  pm: '#F59E0B',
  analyst: '#10B981',
  qa: '#6B7280',
  default: '#64748B'
}

function RoleBadge({ role }) {
  const color = ROLE_COLORS[(role || '').toLowerCase()] || ROLE_COLORS.default
  return <span className="text-xs text-white px-2 py-0.5 rounded" style={{ background: color }}>{role || 'Unknown'}</span>
}

export default function CandidatePool() {
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    name: '',
    role_type: '',
    activation_energy: 5,
    catalytic_rating: 5,
    thermal_stability: 5,
    role_valency: 3,
    inhibition_pairs: ''
  })

  // modal ref for outside-click detection
  const modalRef = useRef(null)

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') setShowModal(false)
    }
    if (showModal) {
      window.addEventListener('keydown', onKey)
    }
    return () => window.removeEventListener('keydown', onKey)
  }, [showModal])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await getCandidates()
      setCandidates(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || String(err))
    } finally {
      setLoading(false)
    }
  }

  async function handleAdd(e) {
    e.preventDefault()
    const payload = {
      name: form.name,
      role_type: form.role_type,
      activation_energy: Number(form.activation_energy),
      catalytic_rating: Number(form.catalytic_rating),
      thermal_stability: Number(form.thermal_stability),
      role_valency: Number(form.role_valency),
      inhibition_pairs: form.inhibition_pairs
        ? form.inhibition_pairs.split(',').map(s => s.trim()).filter(Boolean)
        : []
    }

    try {
      await addCandidate(payload)
      setShowModal(false)
      setForm({ name: '', role_type: '', activation_energy: 5, catalytic_rating: 5, thermal_stability: 5, role_valency: 3, inhibition_pairs: '' })
      await load()
    } catch (err) {
      alert('Error adding candidate: ' + (err.message || err))
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete candidate?')) return
    try {
      await deleteCandidate(id)
      await load()
    } catch (err) {
      alert('Error deleting candidate: ' + (err.message || err))
    }
  }

  return (
    <div className="bg-white rounded shadow p-4 h-[70vh] flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium">Candidate Pool</h3>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowModal(true)} className="px-3 py-1 bg-[#1A56A0] text-white rounded text-sm">Add Candidate</button>
        </div>
      </div>

      {loading && <div className="text-sm text-gray-500">Loading...</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}

      <div className="overflow-auto mt-2 space-y-3">
        {candidates.length === 0 && !loading && (
          <div className="text-sm text-gray-500">
            No candidates in pool. Add your first candidate to begin.
            <div className="mt-2">
              <button onClick={() => setShowModal(true)} className="px-3 py-1 bg-[#1A56A0] text-white rounded text-sm">Add Candidate</button>
            </div>
          </div>
        )}

        {candidates.map(c => (
          <div key={c.id || c.name} className="bg-gray-50 p-3 rounded border relative">
            <button onClick={() => handleDelete(c.id)} className="absolute right-2 top-2 text-gray-400 hover:text-red-600">×</button>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="text-sm font-semibold">{c.name}</div>
                  <RoleBadge role={c.role_type} />
                  {c.inhibition_pairs && c.inhibition_pairs.length > 0 && (
                    <div className="text-xs text-yellow-800 bg-yellow-100 px-2 py-0.5 rounded">⚠ Inhibitions</div>
                  )}
                </div>
                <div className="text-xs text-gray-500">ID: {c.id || '—'}</div>
              </div>
            </div>

            <div className="mt-3 space-y-2">
              <PropertyBar label={`Activation Energy (Ea)`} value={toPercent(c.activation_energy)} positive={false} color="red" />
              <PropertyBar label={`Catalytic Rating`} value={toPercent(c.catalytic_rating)} positive={true} color="green" />
              <PropertyBar label={`Thermal Stability`} value={toPercent(c.thermal_stability)} positive={true} color="blue" />
              <PropertyBar label={`Role Valency`} value={toPercent(c.role_valency)} positive={true} color="purple" />
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <div className="fixed inset-0 bg-black/60" />
          <div ref={modalRef} className="bg-white rounded shadow max-w-md w-full p-5 z-50">
            <h4 className="text-lg font-semibold mb-3">Add Candidate</h4>
            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="block text-sm">Name</label>
                <input required className="w-full border px-2 py-1 rounded" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>

              <div>
                <label className="block text-sm">Role Type</label>
                <input className="w-full border px-2 py-1 rounded" value={form.role_type} onChange={e => setForm({ ...form, role_type: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm">Activation Energy (0-10)</label>
                  <input type="number" min="0" max="10" step="0.1" className="w-full border px-2 py-1 rounded" value={form.activation_energy} onChange={e => setForm({ ...form, activation_energy: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm">Catalytic Rating (0-10)</label>
                  <input type="number" min="0" max="10" step="0.1" className="w-full border px-2 py-1 rounded" value={form.catalytic_rating} onChange={e => setForm({ ...form, catalytic_rating: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm">Thermal Stability (0-10)</label>
                  <input type="number" min="0" max="10" step="0.1" className="w-full border px-2 py-1 rounded" value={form.thermal_stability} onChange={e => setForm({ ...form, thermal_stability: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm">Role Valency (0-10)</label>
                  <input type="number" min="0" max="10" step="1" className="w-full border px-2 py-1 rounded" value={form.role_valency} onChange={e => setForm({ ...form, role_valency: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="block text-sm">Inhibition Pairs (comma-separated IDs)</label>
                <input className="w-full border px-2 py-1 rounded" value={form.inhibition_pairs} onChange={e => setForm({ ...form, inhibition_pairs: e.target.value })} />
              </div>

              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-3 py-1 border rounded">Cancel</button>
                <button type="submit" className="px-3 py-1 bg-[#1A56A0] text-white rounded">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function PropertyBar({ label, value = 0, positive = true, color = 'green' }) {
  // value is percent 0-100
  const bg = value > 0 ? `bg-${color}-400` : 'bg-gray-300'
  // Since using Tailwind classes built dynamically won't be compiled
  // choose inline styles for width and color fallback
  const colorMap = {
    red: '#ef4444',
    green: '#10b981',
    blue: '#3b82f6',
    purple: '#8b5cf6'
  }
  const barColor = colorMap[color] || '#10b981'

  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <div className="text-gray-600">{label}</div>
        <div className="text-gray-500">{value}%</div>
      </div>
      <div className="w-full bg-gray-200 h-2 rounded">
        <div className="h-2 rounded" style={{ width: `${value}%`, background: barColor }} />
      </div>
    </div>
  )
}
