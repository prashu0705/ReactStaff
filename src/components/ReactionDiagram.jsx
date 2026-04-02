import React from 'react'

export default function ReactionDiagram({ team = [], project = null }) {
  const n = team.length
  if (n === 0) return <div className="text-sm text-gray-500">No team members</div>

  const roleColors = {
    engineer: '#3B82F6', // blue
    designer: '#8B5CF6', // purple
    pm: '#F59E0B', // orange
    analyst: '#10B981', // green
    qa: '#6B7280', // gray
    default: '#64748B'
  }

  // helper: check if two members are inhibited
  function isInhibited(a, b) {
    if (!a || !b) return false
    const ai = a.id || a.name
    const bi = b.id || b.name
    if (!ai || !bi) return false
    const aPairs = a.inhibition_pairs || []
    const bPairs = b.inhibition_pairs || []
    return aPairs.includes(bi) || bPairs.includes(ai)
  }

  // find catalyst (highest catalytic_rating) and bottleneck (highest activation_energy)
  let catalystId = null
  let bottleneckId = null
  if (team.length > 0) {
    catalystId = team.reduce((best, t) => (!best || (Number(t.catalytic_rating) > Number(best.catalytic_rating) || false)) ? t : best, null)?.id
    bottleneckId = team.reduce((best, t) => (!best || (Number(t.activation_energy) > Number(best.activation_energy) || false)) ? t : best, null)?.id
  }

  // render SVG lines and circles; positions in percentages
  const positions = team.map((_, i) => ((i + 0.5) / n) * 100)

  return (
    <div className="w-full">
      <div className="relative" style={{ height: 120 }}>
        <svg width="100%" height="120" viewBox={`0 0 100 ${120}`} preserveAspectRatio="none" className="absolute left-0 top-0">
          {/* lines between adjacent nodes */}
          {team.map((t, i) => {
            if (i === 0) return null
            const x1 = positions[i - 1]
            const x2 = positions[i]
            const inhibited = isInhibited(team[i - 1], team[i])
            return (
              <line key={`line-${i}`} x1={`${x1}`} y1={50} x2={`${x2}`} y2={50}
                stroke={inhibited ? '#ef4444' : '#9ca3af'}
                strokeWidth={inhibited ? 2.5 : 1.5}
                strokeDasharray={inhibited ? '4 4' : '0'}
                vectorEffect="non-scaling-stroke" />
            )
          })}

          {/* circles */}
          {team.map((m, i) => {
            const cx = positions[i]
            const cy = 50
            const r = 7.2 // scaled because viewBox width 100 -> radius 36px approximated
            const role = (m.role_type || '').toLowerCase()
            const fill = roleColors[role] || roleColors.default
            const isCatalyst = (m.id === catalystId)
            const isBottleneck = (m.id === bottleneckId)

            return (
              <g key={`node-${i}`}>
                {/* glowing border for catalyst */}
                {isCatalyst && (
                  <circle cx={`${cx}%`} cy={cy} r={r + 1.2} fill="none" stroke="#eab308" strokeOpacity={0.9} strokeWidth={0.8} />
                )}

                <circle cx={`${cx}%`} cy={cy} r={r} fill={fill} />
                {/* initials */}
                <text x={`${cx}%`} y={cy + 0.6} fontSize="3" fill="#fff" textAnchor="middle" dominantBaseline="middle" style={{ fontWeight: 700 }}>{(m.name || '').split(' ').map(s => s[0]).slice(0,2).join('')}</text>

                {/* bottleneck badge */}
                {isBottleneck && (
                  <text x={`${cx + (r + 2)}%`} y={cy - (r + 2)} fontSize="3" fill="#ef4444" textAnchor="start">⚡</text>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      {/* labels below, aligned in grid */}
      <div className="mt-2 grid" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
        {team.map((m, i) => (
          <div key={`label-${i}`} className="text-center">
            <div className="text-sm font-medium">{m.name}</div>
            <div className="text-xs text-gray-500">Ea: {m.activation_energy ?? '-'}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
