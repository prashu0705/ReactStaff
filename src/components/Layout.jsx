import React from 'react'

export default function Layout({ active, setActive, children }) {
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

        <div className="p-4 text-xs text-white/60 border-t border-white/6">
          © ReactStaff
        </div>
      </aside>
      <main className="flex-1 h-full overflow-auto p-8 relative">
        <div className="max-w-6xl mx-auto min-w-[1024px]">
          {/* Top header bar inside content area */}
          <div className="mb-6">
            <div className="bg-white/80 backdrop-blur-sm rounded p-3 shadow-sm">
              <div className="text-lg font-semibold">ReactStaff — Deterministic Team Intelligence</div>
            </div>
          </div>

          {children}
        </div>
      </main>
    </div>
  )
}
