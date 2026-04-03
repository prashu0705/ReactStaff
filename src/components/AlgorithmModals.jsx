import React, { useState, useEffect } from 'react'
import ExplainabilityEngine from './ExplainabilityEngine'

export function ArrheniusModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in overflow-y-auto">
      <div className="bg-[#111827] border border-teal-800 rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden relative my-auto">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-blue-500"></div>
        <div className="p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-teal-400 flex items-center gap-2">
              <span>⚗️</span> Arrhenius Kinetics v2
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors text-xl">×</button>
          </div>
          
          <div className="space-y-4 text-gray-300 text-sm mb-6">
            <p>
              The <strong>Arrhenius Kinetics v2</strong> engine is an entirely deterministic scoring function that measures how effectively a team can overcome operational "activation energy" given the structural "temperature" under which they operate.
            </p>
            
            <div className="bg-[#1F2937] p-4 rounded-lg font-mono text-xs border border-[#374151]">
              <span className="text-purple-400">Rate</span> <span className="text-gray-500">=</span> <span className="text-blue-400">A</span> <span className="text-gray-500">* e^(</span><span className="text-red-400">-Ea</span> <span className="text-gray-500">/ (</span><span className="text-green-400">R</span> <span className="text-gray-500">*</span> <span className="text-orange-400">T</span><span className="text-gray-500">))</span>
            </div>
          </div>

          <ExplainabilityEngine />
        </div>
      </div>
    </div>
  )
}

export function MLModal({ onClose }) {
  const [resume, setResume] = useState('Fullstack Engineer backend scalable python react architecture agile')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const runSimulation = () => {
    setLoading(true)
    fetch('/api/ml_trace', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resume })
    })
    .then(r => r.json())
    .then(data => {
      setResult(data)
      setLoading(false)
    })
    .catch(err => {
      console.error(err)
      setLoading(false)
    })
  }

  useEffect(() => {
    runSimulation()
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in overflow-y-auto">
      <div className="bg-[#111827] border border-purple-800 rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden relative my-auto">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-pink-500"></div>
        <div className="p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-purple-400 flex items-center gap-2">
              <span>🧠</span> TF-IDF + Decision Tree Pipeline
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors text-xl">×</button>
          </div>
          
          <div className="space-y-4 text-gray-300 text-sm mb-6">
            <p>
              This fallback model runs a classical Machine Learning approach, evaluating team summaries and candidate resumes using <strong>Term Frequency-Inverse Document Frequency (TF-IDF)</strong> semantic search mapped into a Random Forest implementation.
            </p>
          </div>

          <div className="mt-8 bg-[#1A1A2E] text-white rounded-xl border border-[#2D3748] p-6 shadow-2xl font-sans">
             <div className="flex justify-between items-center mb-6 border-b border-[#2D3748] pb-4">
              <div className="flex items-center gap-3">
                <div className="text-purple-400 text-2xl">⚡</div>
                <div>
                  <h3 className="text-lg font-bold text-purple-400 tracking-wide">Live Feature Extraction Sandbox</h3>
                  <p className="text-xs text-gray-400">TF-IDF & Decision Tree Inference Viewer</p>
                </div>
              </div>
              <div className="px-3 py-1 bg-green-900/30 text-green-400 text-xs font-mono border border-green-800 rounded-full transition-all">
                {loading ? <span className="animate-pulse">Computing...</span> : 'Ready'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                 <div>
                    <label className="block text-xs font-bold text-gray-500 tracking-widest mb-2">RAW INPUT VECTOR (RESUME)</label>
                    <textarea 
                      className="w-full bg-[#111827] border border-[#374151] rounded p-3 text-sm font-mono text-gray-300 h-32 focus:border-purple-500 focus:outline-none"
                      value={resume}
                      onChange={e => setResume(e.target.value)}
                    />
                 </div>
                 <button 
                  onClick={runSimulation}
                  className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded shadow transition-colors cursor-pointer"
                 >
                    Execute Pipeline
                 </button>
              </div>

              <div className="bg-[#111827] rounded-lg p-5 border border-[#1F2937]">
                <h4 className="text-xs font-bold text-gray-500 tracking-widest mb-4">ML TRACE OUTPUT</h4>
                
                {result ? (
                  <div className="space-y-4">
                     <div className="bg-[#1F2937] p-3 rounded text-sm">
                        <div className="font-bold text-gray-300 mb-2">Dominant TF-IDF Activations</div>
                        {result.top_features && result.top_features.length > 0 ? (
                           <div className="space-y-1">
                              {result.top_features.slice(0, 5).map(f => (
                                <div key={f.feature} className="flex justify-between text-xs font-mono">
                                  <span className="text-pink-400">{f.feature}</span>
                                  <span className="text-gray-400">{f.weight.toFixed(4)}</span>
                                </div>
                              ))}
                           </div>
                        ) : (
                           <div className="text-xs text-gray-500 italic">No significant features extracted.</div>
                        )}
                     </div>

                     <div className="mt-4 border border-[#374151] bg-[#111827] p-4 rounded text-center shadow-[0_0_15px_rgba(168,85,247,0.15)] relative overflow-hidden">
                        <div className="absolute inset-0 bg-purple-500/5 filter blur-xl"></div>
                        <div className="relative z-10">
                          <div className="text-[10px] font-bold text-gray-500 tracking-[0.2em] mb-1">DECISION TREE INFERENCE</div>
                          <div className="text-4xl font-black text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.8)]">
                            {result.score.toFixed(4)}
                          </div>
                        </div>
                     </div>
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm">Run pipeline to see results...</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
