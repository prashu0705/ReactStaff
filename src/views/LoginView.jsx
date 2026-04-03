import React, { useState } from 'react'
import { login, register } from '../api/client'

export default function LoginView({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email || !password) return setErrorMsg(isRegistering ? 'Please fill out all fields.' : 'Please enter credentials to sign in.')
    
    setLoading(true)
    setErrorMsg('')
    try {
      let data;
      if (isRegistering) {
        data = await register(email, password)
      } else {
        data = await login(email, password)
      }
      localStorage.setItem('rs_token', data.token)
      onLogin()
    } catch (err) {
      setErrorMsg(err.message || 'Error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Abstract pattern for the left side
  const abstractCSS = {
    backgroundColor: '#1A1A2E',
    backgroundImage: `radial-gradient(circle at 15% 50%, rgba(26, 86, 160, 0.4), transparent 25%),
                      radial-gradient(circle at 85% 30%, rgba(139, 92, 246, 0.3), transparent 25%),
                      url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
  }

  return (
    <div className="flex w-screen h-screen overflow-hidden bg-white">
      
      {/* Left Splash Panel */}
      <div className="hidden lg:flex lg:flex-1 flex-col justify-center px-20 relative overflow-hidden" style={abstractCSS}>
        <div className="relative z-10 text-white max-w-md animate-fade-in-up">
          <div className="flex items-center gap-4 mb-6">
            <div className="text-5xl drop-shadow-lg opacity-90">⚗️</div>
            <div className="text-4xl font-extrabold tracking-tight">ReactStaff</div>
          </div>
          <p className="text-xl font-light text-white/80 leading-relaxed">
            Deterministic Team Intelligence. 
            <br />
            Optimizing team chemistry before the reaction begins.
          </p>
        </div>
        
        {/* Decorative glass overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A2E]/80 to-transparent pointer-events-none" />
      </div>

      {/* Right Login Form Panel */}
      <div className="flex-1 flex items-center justify-center bg-[#F5F7FA] relative">
        <div className="w-full max-w-md p-8 md:p-12 animate-fade-in">
          
          <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
            <div className="text-3xl">⚗️</div>
            <div className="text-2xl font-bold text-gray-900">ReactStaff</div>
          </div>

          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {isRegistering ? 'Create an account' : 'Welcome back'}
            </h2>
            <p className="text-gray-500">
              {isRegistering ? 'Join the ReactStaff laboratory.' : 'Sign in to your laboratory.'}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded text-sm text-center animate-fade-in">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 block">Email address</label>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="chemist@reactstaff.io"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#1A56A0] focus:ring-2 focus:ring-[#1A56A0]/20 outline-none transition duration-200 bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 block">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#1A56A0] focus:ring-2 focus:ring-[#1A56A0]/20 outline-none transition duration-200 bg-white"
              />
            </div>

            {!isRegistering && (
              <div className="flex items-center justify-between">
                <label className="flex items-center text-sm text-gray-600 gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#1A56A0] focus:ring-[#1A56A0]" />
                  Remember me
                </label>
                <a href="#" className="text-sm text-[#1A56A0] font-medium hover:underline">Forgot password?</a>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3.5 px-4 bg-[#1A56A0] hover:bg-[#123F75] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-70 flex justify-center items-center"
            >
              {loading ? (
                <div className="w-5 h-5 rounded-full border-2 border-t-transparent border-white animate-spin" />
              ) : (
                isRegistering ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-500">
            {isRegistering ? (
              <>Already have an account? <button onClick={() => {setIsRegistering(false); setErrorMsg('')}} className="text-[#1A56A0] font-medium hover:underline" type="button">Sign In</button></>
            ) : (
              <>Don't have an account? <button onClick={() => {setIsRegistering(true); setErrorMsg('')}} className="text-[#1A56A0] font-medium hover:underline" type="button">Register here</button></>
            )}
          </div>
        </div>
      </div>
      
    </div>
  )
}
