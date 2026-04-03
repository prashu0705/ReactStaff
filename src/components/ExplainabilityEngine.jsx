import React, { useState, useEffect } from 'react'

export default function ExplainabilityEngine() {
  const [ea, setEa] = useState(5.0)
  const [t, setT] = useState(5.0)
  const [a, setA] = useState(0.8)
  const [r, setR] = useState(0.8)

  const [exponent, setExponent] = useState(0)
  const [rawRate, setRawRate] = useState(0)
  const [finalRate, setFinalRate] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    fetch('/api/arrhenius_trace', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ea, t, a, r })
    })
    .then(r => r.json())
    .then(data => {
      if(active) {
        setExponent(data.exponent || 0)
        setRawRate(data.raw_rate || 0)
        setFinalRate(data.final_rate || 0)
        setLoading(false)
      }
    })
    .catch(err => {
      if(active) setLoading(false)
      console.error(err)
    })
    
    return () => { active = false }
  }, [ea, t, a, r])

  return (
    <div className="mt-8 bg-[#1A1A2E] text-white rounded-xl border border-[#2D3748] p-6 shadow-2xl font-sans">
      <div className="flex justify-between items-center mb-6 border-b border-[#2D3748] pb-4">
        <div className="flex items-center gap-3">
          <div className="text-teal-400 text-2xl">⚙️</div>
          <div>
            <h3 className="text-lg font-bold text-teal-400 tracking-wide">Determinism Explainability Engine</h3>
            <p className="text-xs text-gray-400">Live Arrhenius Kinetics — Local Sandbox</p>
          </div>
        </div>
        <div className="px-3 py-1 bg-green-900/30 text-green-400 text-xs font-mono border border-green-800 rounded-full animate-pulse transition-all">
          Live API Connection · {loading ? 'Computing...' : '100% Deterministic'}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Activation Energy (Ea)</span>
              <span className="text-red-400 font-mono">{ea.toFixed(1)}</span>
            </div>
            <input type="range" min="1" max="10" step="0.1" value={ea} onChange={e => setEa(Number(e.target.value))} className="w-full accent-blue-500" />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Environment Temp (T)</span>
              <span className="text-orange-400 font-mono">{t.toFixed(1)}</span>
            </div>
            <input type="range" min="1" max="10" step="0.1" value={t} onChange={e => setT(Number(e.target.value))} className="w-full accent-blue-500" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Catalyst Rating (A)</span>
              <span className="text-purple-400 font-mono">{a.toFixed(1)}</span>
            </div>
            <input type="range" min="0" max="2" step="0.1" value={a} onChange={e => setA(Number(e.target.value))} className="w-full accent-blue-500" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Role Coverage (R)</span>
              <span className="text-blue-400 font-mono">{r.toFixed(1)}</span>
            </div>
            <input type="range" min="0.1" max="1" step="0.1" value={r} onChange={e => setR(Number(e.target.value))} className="w-full accent-blue-500" />
          </div>
        </div>

        <div className="bg-[#111827] rounded-lg p-5 border border-[#1F2937]">
          <h4 className="text-xs font-bold text-gray-500 tracking-widest mb-4">LIVE ARRHENIUS TRACE</h4>
          
          <div className="space-y-3">
            <div className="bg-[#1F2937] p-3 rounded text-sm flex gap-3 items-center">
              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">1</div>
              <div>
                <div className="font-bold text-gray-300">Exponent</div>
                <div className="font-mono text-xs text-gray-400 mt-1">
                  -{ea.toFixed(1)} / ({r.toFixed(1)} × {t.toFixed(1)}) = {exponent.toFixed(3)}
                </div>
              </div>
            </div>

            <div className="bg-[#1F2937] p-3 rounded text-sm flex gap-3 items-center">
              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">2</div>
              <div>
                <div className="font-bold text-gray-300">Raw Rate</div>
                <div className="font-mono text-xs text-gray-400 mt-1">
                  {a.toFixed(1)} × e^({exponent.toFixed(3)}) = {rawRate.toFixed(4)}
                </div>
              </div>
            </div>

            <div className="bg-[#1F2937] p-3 rounded text-sm flex gap-3 items-center">
              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">3</div>
              <div>
                <div className="font-bold text-gray-300">Sigmoid</div>
                <div className="font-mono text-xs text-gray-400 mt-1">
                  1 / (1 + e^-({rawRate.toFixed(4)}))
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 border border-[#374151] bg-[#111827] p-4 rounded text-center shadow-[0_0_15px_rgba(59,130,246,0.15)] relative overflow-hidden">
            <div className="absolute inset-0 bg-blue-500/5 filter blur-xl"></div>
            <div className="relative z-10">
              <div className="text-[10px] font-bold text-gray-500 tracking-[0.2em] mb-1">FINAL PROJECTED RATE</div>
              <div className="text-4xl font-black text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]">
                {finalRate.toFixed(4)}
              </div>
              <div className="text-xs text-yellow-500 mt-2 flex items-center justify-center gap-1">
                <span>🟡</span> Moderate reaction rate
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
