'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Signup() {
  const [step, setStep] = useState<'account' | 'company'>('account')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [companyName, setCompanyName] = useState('')

  async function handleCreateAccount() {
    if (!email || !password) { setError('Please fill in all fields'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signUp({ email, password })
    if (error) { setError(error.message); setLoading(false); return }

    setStep('company')
    setLoading(false)
  }

  async function handleCreateCompany() {
    if (!companyName) { setError('Please enter your company name'); return }
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Something went wrong. Please try again.'); setLoading(false); return }

    // Create the organization
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .insert([{ name: companyName, owner_id: user.id }])
      .select()
      .single()

    if (orgError) { setError(orgError.message); setLoading(false); return }

    // Link the user to the organization
    const { error: linkError } = await supabase
      .from('user_organizations')
      .insert([{ user_id: user.id, organization_id: orgData.id, role: 'manager' }])

    if (linkError) { setError(linkError.message); setLoading(false); return }

    window.location.href = '/dashboard'
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; background: #080b12; color: #f1f5f9; -webkit-font-smoothing: antialiased; }
        input { font-family: 'Plus Jakarta Sans', sans-serif; }
      `}</style>

      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080b12', position: 'relative', overflow: 'hidden', padding: '24px 20px' }}>
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, background: 'radial-gradient(circle, rgba(249,115,22,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40, justifyContent: 'center' }}>
            <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#0f172a"/>
              <path d="M16 8 L6 14 L7.5 16 L16 11 Z" fill="#f97316" fillOpacity="0.2"/>
              <path d="M16 8 L26 14 L24.5 16 L16 11 Z" fill="#f97316" fillOpacity="0.2"/>
              <polygon points="16,3 11,8 21,8" fill="#f97316"/>
              <rect x="11" y="8" width="10" height="6" rx="1" fill="#f97316"/>
              <rect x="10" y="14" width="12" height="2" rx="1" fill="#f97316"/>
              <path d="M13 16 L11.5 27 L20.5 27 L19 16 Z" fill="#f97316" fillOpacity="0.85"/>
              <path d="M12.8 20 L12.5 23 L19.5 23 L19.2 20 Z" fill="#f97316"/>
              <rect x="10" y="27" width="12" height="3" rx="1.5" fill="#f97316"/>
              <path d="M14.5 27 L14.5 23.5 Q16 22 17.5 23.5 L17.5 27 Z" fill="#0f172a" fillOpacity="0.5"/>
              <circle cx="16" cy="11" r="2" fill="#fef08a"/>
            </svg>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.4px' }}>Watchpost</div>
              <div style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 500 }}>Security Platform</div>
            </div>
          </div>

          {/* Progress */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
            {['Create account', 'Your company'].map((label, i) => (
              <div key={label} style={{ flex: 1 }}>
                <div style={{ height: 3, borderRadius: 2, background: i === 0 || step === 'company' ? '#f97316' : 'rgba(255,255,255,0.08)', marginBottom: 6, transition: 'background 0.3s' }} />
                <div style={{ fontSize: 11, color: i === 0 || step === 'company' ? '#f97316' : '#334155', fontWeight: 600, transition: 'color 0.3s' }}>{label}</div>
              </div>
            ))}
          </div>

          <div style={{ background: '#141820', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 32, boxShadow: '0 24px 80px rgba(0,0,0,0.4)' }}>

            {step === 'account' && (
              <>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.4px', marginBottom: 4 }}>Create your account</div>
                <div style={{ fontSize: 13, color: '#475569', marginBottom: 28 }}>Get started with Watchpost in minutes</div>

                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 6 }}>Work Email</div>
                  <input type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCreateAccount()}
                    style={{ width: '100%', background: '#1a1f2e', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '10px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none' }}
                    onFocus={e => e.target.style.borderColor = '#f97316'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.07)'} />
                </div>

                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 6 }}>Password</div>
                  <input type="password" placeholder="At least 6 characters" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCreateAccount()}
                    style={{ width: '100%', background: '#1a1f2e', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '10px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none' }}
                    onFocus={e => e.target.style.borderColor = '#f97316'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.07)'} />
                </div>

                {error && <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>{error}</div>}

                <button onClick={handleCreateAccount} disabled={loading}
                  style={{ width: '100%', background: 'linear-gradient(135deg, #f97316, #ea580c)', color: '#fff', border: 'none', borderRadius: 8, padding: 11, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', boxShadow: '0 0 20px rgba(249,115,22,0.3)' }}>
                  {loading ? 'Creating account...' : 'Continue →'}
                </button>

                <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#475569' }}>
                  Already have an account? <a href="/login" style={{ color: '#f97316', fontWeight: 600, textDecoration: 'none' }}>Sign in</a>
                </div>
              </>
            )}

            {step === 'company' && (
              <>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.4px', marginBottom: 4 }}>Name your company</div>
                <div style={{ fontSize: 13, color: '#475569', marginBottom: 28 }}>This is how your company will appear in Watchpost</div>

                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 6 }}>Company Name</div>
                  <input type="text" placeholder="Acme Security Services" value={companyName} onChange={e => setCompanyName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCreateCompany()}
                    style={{ width: '100%', background: '#1a1f2e', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '10px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none' }}
                    onFocus={e => e.target.style.borderColor = '#f97316'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.07)'} />
                </div>

                {error && <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>{error}</div>}

                <button onClick={handleCreateCompany} disabled={loading}
                  style={{ width: '100%', background: 'linear-gradient(135deg, #f97316, #ea580c)', color: '#fff', border: 'none', borderRadius: 8, padding: 11, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', boxShadow: '0 0 20px rgba(249,115,22,0.3)' }}>
                  {loading ? 'Setting up...' : 'Launch Watchpost →'}
                </button>

                <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: '#334155' }}>
                  By continuing you agree to our terms of service
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
