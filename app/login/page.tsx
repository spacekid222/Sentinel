'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    setLoading(true)
    setError('')
    const { error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    else window.location.href = '/'
    setLoading(false)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Sora', sans-serif; background: #fafaf9; }
        input { font-family: 'Sora', sans-serif; }
      `}</style>
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafaf9' }}>
        <div style={{ width: 400, background: '#fff', border: '1px solid #f0ede8', borderRadius: 16, padding: 40, boxShadow: '0 4px 24px rgba(28,25,23,0.06)' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
            <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #f97316, #ea580c)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, boxShadow: '0 2px 8px rgba(249,115,22,0.3)' }}>⚡</div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#1c1917', letterSpacing: '-0.3px' }}>Sentinel</div>
              <div style={{ fontSize: 11, color: '#a8a29e', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Security Management</div>
            </div>
          </div>

          <div style={{ fontSize: 20, fontWeight: 700, color: '#1c1917', letterSpacing: '-0.3px', marginBottom: 6 }}>
            {isSignUp ? 'Create account' : 'Welcome back'}
          </div>
          <div style={{ fontSize: 13, color: '#a8a29e', marginBottom: 28 }}>
            {isSignUp ? 'Set up your Sentinel account' : 'Sign in to your dashboard'}
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 6 }}>Email</div>
            <input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={{ width: '100%', background: '#fafaf9', border: '1px solid #e8e3de', borderRadius: 8, padding: '10px 14px', color: '#1c1917', fontSize: 13.5, outline: 'none' }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 6 }}>Password</div>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={{ width: '100%', background: '#fafaf9', border: '1px solid #e8e3de', borderRadius: 8, padding: '10px 14px', color: '#1c1917', fontSize: 13.5, outline: 'none' }}
            />
          </div>

          {error && (
            <div style={{ background: '#fee2e2', color: '#b91c1c', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ width: '100%', background: 'linear-gradient(135deg, #f97316, #ea580c)', color: '#fff', border: 'none', borderRadius: 8, padding: '11px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Sora, sans-serif', letterSpacing: '-0.1px', boxShadow: '0 1px 6px rgba(249,115,22,0.3)' }}
          >
            {loading ? 'Please wait...' : isSignUp ? 'Create account' : 'Sign in'}
          </button>

          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#a8a29e' }}>
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <span onClick={() => setIsSignUp(!isSignUp)} style={{ color: '#ea580c', fontWeight: 600, cursor: 'pointer' }}>
              {isSignUp ? 'Sign in' : 'Sign up'}
            </span>
          </div>
        </div>
      </div>
    </>
  )
}