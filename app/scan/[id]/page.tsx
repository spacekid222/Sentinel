'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useParams } from 'next/navigation'

interface Checkpoint {
  id: string; name: string; location: string
  sites?: { name: string }
}

export default function ScanPage() {
  const params = useParams()
  const checkpointId = params.id as string

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'login'>('loading')
  const [checkpoint, setCheckpoint] = useState<Checkpoint | null>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function handleScan() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setStatus('login'); return }

      // Get checkpoint info
      const { data: cpData } = await supabase
        .from('checkpoints')
        .select('*, sites(name)')
        .eq('id', checkpointId)
        .single()

      if (!cpData) { setStatus('error'); setMessage('Checkpoint not found.'); return }
      setCheckpoint(cpData)

      // Get guard info
      const { data: guardData } = await supabase
        .from('guards')
        .select('id')
        .eq('email', session.user.email)
        .single()

      if (!guardData) { setStatus('error'); setMessage('Guard account not found.'); return }

      // Find active shift for this guard at this site
      const now = new Date().toISOString()
      const { data: shiftData } = await supabase
        .from('shifts')
        .select('id')
        .eq('guard_id', guardData.id)
        .eq('site_id', cpData.site_id)
        .lte('start_time', now)
        .gte('end_time', now)
        .single()

      // Log the scan
      const { error } = await supabase.from('checkpoint_scans').insert([{
        checkpoint_id: checkpointId,
        guard_id: guardData.id,
        shift_id: shiftData?.id || null,
      }])

      if (error) { setStatus('error'); setMessage('Failed to log scan. Try again.'); return }
      setStatus('success')
    }

    handleScan()
  }, [checkpointId])

  const now = new Date()
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const dateStr = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; background: #080b12; color: #f1f5f9; -webkit-font-smoothing: antialiased; }
      `}</style>

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#080b12', padding: '24px 20px', textAlign: 'center' }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 48 }}>
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
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
          <div style={{ fontSize: 15, fontWeight: 800, color: '#f1f5f9' }}>Watchpost</div>
        </div>

        {status === 'loading' && (
          <div style={{ color: '#475569', fontSize: 15 }}>Logging checkpoint scan...</div>
        )}

        {status === 'login' && (
          <div style={{ maxWidth: 320 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#f1f5f9', marginBottom: 8 }}>Sign in required</div>
            <div style={{ fontSize: 14, color: '#475569', marginBottom: 28 }}>You need to be signed in to log a checkpoint scan.</div>
            <a href={`/guard-login?redirect=/scan/${checkpointId}`}
              style={{ display: 'block', background: 'linear-gradient(135deg, #f97316, #ea580c)', color: '#fff', borderRadius: 10, padding: '14px 24px', fontSize: 15, fontWeight: 700, textDecoration: 'none', boxShadow: '0 0 20px rgba(249,115,22,0.3)' }}>
              Sign in to continue
            </a>
          </div>
        )}

        {status === 'success' && (
          <div style={{ maxWidth: 320 }}>
            <div style={{ width: 80, height: 80, background: 'rgba(74,222,128,0.1)', border: '2px solid rgba(74,222,128,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 36 }}>✓</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#4ade80', marginBottom: 8, letterSpacing: '-0.5px' }}>Checkpoint logged</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>{checkpoint?.name}</div>
            <div style={{ fontSize: 14, color: '#475569', marginBottom: 4 }}>{checkpoint?.sites?.name}</div>
            {checkpoint?.location && <div style={{ fontSize: 13, color: '#334155', marginBottom: 16 }}>{checkpoint.location}</div>}
            <div style={{ background: '#141820', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '16px 20px', marginTop: 20 }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#f1f5f9', fontFamily: 'monospace', letterSpacing: '-1px' }}>{timeStr}</div>
              <div style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>{dateStr}</div>
            </div>
            <a href="/guard" style={{ display: 'block', marginTop: 20, color: '#475569', fontSize: 13, textDecoration: 'none' }}>← Back to portal</a>
          </div>
        )}

        {status === 'error' && (
          <div style={{ maxWidth: 320 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#f87171', marginBottom: 8 }}>Something went wrong</div>
            <div style={{ fontSize: 14, color: '#475569', marginBottom: 24 }}>{message}</div>
            <a href="/guard" style={{ color: '#f97316', fontSize: 13, textDecoration: 'none' }}>← Back to portal</a>
          </div>
        )}
      </div>
    </>
  )
}
