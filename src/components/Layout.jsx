import React, { useState } from 'react'
import { ArrheniusModal, MLModal } from './AlgorithmModals'

export default function Layout({ active, setActive, onSignOut, children }) {
  const [showArrhenius, setShowArrhenius] = useState(false)
  const [showML, setShowML] = useState(false)

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F5F7FA]">
      <aside className="w-60 flex-shrink-0 bg-[#1A1A2E] text-white flex flex-col h-full">
        <div className="p-6 border-b border-white/6">
          <div className="flex items-center gap-3">
            <div className="text-2xl">⚗️</div>
            <div>
              <div className="font-bold text-lg">ReactStaff</div>
              <div className="text-xs text-white/70">Team Chemistry</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => setActive('compose')}
                className={`w-full text-left px-3 py-2 rounded ${active === 'compose' ? 'bg-[#1A56A0] text-white' : 'text-white/80 hover:bg-white/5'}`}>
                Compose Team
              </button>
            </li>
            <li>
              <button
                onClick={() => setActive('audit')}
                className={`w-full text-left px-3 py-2 rounded ${active === 'audit' ? 'bg-[#1A56A0] text-white' : 'text-white/80 hover:bg-white/5'}`}>
                Audit Team
              </button>
            </li>
          </ul>
        </nav>

        <div className="p-4 border-t border-white/6">
          <button 
            onClick={onSignOut}
            className="w-full text-left px-3 py-2 rounded text-red-400 hover:bg-white/5 hover:text-red-300 transition-colors text-sm font-medium"
          >
            Sign Out
          </button>
        </div>
        <div className="px-4 pb-4 text-xs text-white/60">
          © ReactStaff
        </div>
      </aside>
      <main className="flex-1 h-full overflow-auto p-8 relative">
        <div className="max-w-6xl mx-auto min-w-[1024px]">
          {/* Top header bar inside content area */}
          <div className="mb-6 flex justify-between items-center">
            <div className="bg-[#111827] border border-[#1F2937] text-white rounded-lg p-3 shadow-sm inline-block">
              <div className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-0.5">HACKATHON MODE - AI WITHOUT THE API</div>
              <div className="text-lg font-bold flex items-center gap-2">
                <span>⚗️</span> Team Composition Engine
              </div>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowArrhenius(true)}
                className="px-4 py-2 bg-[#064e3b]/30 text-teal-400 font-mono text-sm rounded-full border border-teal-800 hover:bg-[#064e3b]/50 transition-colors cursor-pointer text-left"
              >
                Arrhenius Kinetics v2
              </button>
              <button 
                onClick={() => setShowML(true)}
                className="px-4 py-2 bg-[#4c1d95]/30 text-purple-400 font-mono text-sm rounded-full border border-purple-800 hover:bg-[#4c1d95]/50 transition-colors cursor-pointer text-left"
              >
                TF-IDF + Decision Tree
              </button>
            </div>
          </div>

          {children}
        </div>
      </main>

      {showArrhenius && <ArrheniusModal onClose={() => setShowArrhenius(false)} />}
      {showML && <MLModal onClose={() => setShowML(false)} />}
    </div>
  )
}
