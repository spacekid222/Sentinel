'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface Shift {
  id: string; guard_id: string; site_id: string
  start_time: string; end_time: string; shift_type: string
  status: string; sites?: { name: string; address: string }
}
interface Guard {
  id: string; name: string; email: string
}

export default function GuardPortal() {
  const [guard, setGuard] = useState<Guard | null>(null)
  const [shifts, setShifts] = useState<Shift[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('shifts')

  // Report form
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null)
  const [reportSummary, setReportSummary] = useState('')
  const [reportObservations, setReportObservations] = useState('')
  const [submittingReport, setSubmittingReport] = useState(false)
  const [reportSuccess, setReportSuccess] = useState(false)

  // Incident form
  const [incidentTitle, setIncidentTitle] = useState('')
  const [incidentDesc, setIncidentDesc] = useState('')
  const [incidentSeverity, setIncidentSeverity] = useState('low')
  const [incidentShiftId, setIncidentShiftId] = useState('')
  const [submittingIncident, setSubmittingIncident] = useState(false)
  const [incidentSuccess, setIncidentSuccess] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { window.location.href = '/guard-login'; return }

      const { data: guardData } = await supabase
        .from('guards').select('*').eq('email', session.user.email).single()

      if (!guardData) { window.location.href = '/guard-login'; return }

      setGuard(guardData)

      const { data: shiftsData } = await supabase
        .from('shifts')
        .select('*, sites(name, address)')
        .eq('guard_id', guardData.id)
        .order('start_time', { ascending: false })

      if (shiftsData) setShifts(shiftsData)
      setLoading(false)
    })
  }, [])

  async function submitReport() {
    if (!selectedShift || !reportSummary.trim()) return
    setSubmittingReport(true)
    const { error } = await supabase.from('activity_reports').insert([{
      shift_id: selectedShift.id,
      guard_id: guard?.id,
      site_id: selectedShift.site_id,
      summary: reportSummary,
      observations: reportObservations,
    }])
    if (!error) {
      setReportSuccess(true)
      setSelectedShift(null)
      setReportSummary('')
      setReportObservations('')
      setTimeout(() => setReportSuccess(false), 3000)
    }
    setSubmittingReport(false)
  }

  async function submitIncident() {
    if (!incidentTitle.trim()) return
    setSubmittingIncident(true)
    const shift = shifts.find(s => s.id === incidentShiftId)
    const { error } = await supabase.from('incidents').insert([{
      title: incidentTitle,
      description: incidentDesc,
      severity: incidentSeverity,
      site_id: shift?.site_id || shifts[0]?.site_id || null,
      guard_id: guard?.id,
      status: 'open'
    }])
    if (!error) {
      setIncidentSuccess(true)
      setIncidentTitle('')
      setIncidentDesc('')
      setIncidentSeverity('low')
      setIncidentShiftId('')
      setTimeout(() => setIncidentSuccess(false), 3000)
    }
    setSubmittingIncident(false)
  }

  const fmtDate = (d: string) => new Date(d).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
  const fmtTime = (d: string) => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  const shiftColors: Record<string, { bg: string; color: string }> = {
    day:   { bg: 'rgba(251,146,60,0.15)', color: '#fb923c' },
    swing: { bg: 'rgba(250,204,21,0.15)', color: '#facc15' },
    night: { bg: 'rgba(167,139,250,0.15)', color: '#a78bfa' },
  }

  const todayShifts = shifts.filter(s => new Date(s.start_time).toDateString() === new Date().toDateString())
  const upcomingShifts = shifts.filter(s => new Date(s.start_time) > new Date()).slice(0, 5)
  const recentShifts = shifts.filter(s => new Date(s.start_time) <= new Date()).slice(0, 10)

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080b12', color: '#475569', fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 14 }}>
      Loading...
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; background: #080b12; color: #e2e8f0; -webkit-font-smoothing: antialiased; }
        textarea, input, select { font-family: 'Plus Jakarta Sans', sans-serif; }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#080b12', maxWidth: 500, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ background: '#141820', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
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
              <div style={{ fontSize: 14, fontWeight: 800, color: '#f1f5f9' }}>Watchpost</div>
              <div style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Guard Portal</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontSize: 12, color: '#475569' }}>{guard?.name}</div>
            <button onClick={async () => { await supabase.auth.signOut(); window.location.href = '/guard-login' }}
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 6, padding: '5px 10px', fontSize: 11, color: '#475569', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Out
            </button>
          </div>
        </div>

        {/* Today banner */}
        {todayShifts.length > 0 && (
          <div style={{ margin: '16px 16px 0', background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.25)', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>On shift today</div>
            {todayShifts.map(s => (
              <div key={s.id}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>{s.sites?.name}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{fmtTime(s.start_time)} – {fmtTime(s.end_time)} · {s.shift_type}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, margin: '16px 16px 0', background: '#141820', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: 4 }}>
          {[
            { id: 'shifts', label: 'My Shifts' },
            { id: 'report', label: 'Submit Report' },
            { id: 'incident', label: 'Log Incident' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ flex: 1, padding: '8px 4px', borderRadius: 7, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'all 0.15s',
                background: activeTab === tab.id ? '#1a1f2e' : 'transparent',
                color: activeTab === tab.id ? '#f1f5f9' : '#475569' }}>
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ padding: '16px' }}>

          {/* MY SHIFTS */}
          {activeTab === 'shifts' && (
            <div>
              {upcomingShifts.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10 }}>Upcoming</div>
                  {upcomingShifts.map(s => (
                    <div key={s.id} style={{ background: '#141820', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '14px 16px', marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>{s.sites?.name}</div>
                        <span style={{ ...shiftColors[s.shift_type], padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{s.shift_type}</span>
                      </div>
                      <div style={{ fontSize: 12, color: '#475569' }}>{fmtDate(s.start_time)}</div>
                      <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 2 }}>{fmtTime(s.start_time)} – {fmtTime(s.end_time)}</div>
                      {s.sites?.address && <div style={{ fontSize: 11, color: '#334155', marginTop: 4 }}>{s.sites.address}</div>}
                    </div>
                  ))}
                </div>
              )}

              {recentShifts.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10 }}>Recent</div>
                  {recentShifts.map(s => (
                    <div key={s.id} style={{ background: '#141820', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '14px 16px', marginBottom: 10, opacity: 0.7 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#94a3b8' }}>{s.sites?.name}</div>
                        <span style={{ ...shiftColors[s.shift_type], padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600 }}>{s.shift_type}</span>
                      </div>
                      <div style={{ fontSize: 12, color: '#334155' }}>{fmtDate(s.start_time)} · {fmtTime(s.start_time)} – {fmtTime(s.end_time)}</div>
                    </div>
                  ))}
                </div>
              )}

              {shifts.length === 0 && (
                <div style={{ textAlign: 'center', padding: '48px 20px', color: '#334155', fontSize: 14 }}>No shifts assigned yet</div>
              )}
            </div>
          )}

          {/* SUBMIT REPORT */}
          {activeTab === 'report' && (
            <div>
              {reportSuccess && (
                <div style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 10, padding: '12px 16px', fontSize: 14, color: '#4ade80', marginBottom: 16, textAlign: 'center', fontWeight: 600 }}>
                  ✓ Report submitted successfully
                </div>
              )}

              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 6 }}>Select Shift *</div>
                <select value={selectedShift?.id || ''} onChange={e => setSelectedShift(shifts.find(s => s.id === e.target.value) || null)}
                  style={{ width: '100%', background: '#141820', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '12px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none' }}>
                  <option value="">Select a shift</option>
                  {shifts.map(s => (
                    <option key={s.id} value={s.id}>{s.sites?.name} — {fmtDate(s.start_time)} {fmtTime(s.start_time)}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 6 }}>Activity Summary *</div>
                <textarea value={reportSummary} onChange={e => setReportSummary(e.target.value)}
                  placeholder="Describe everything that happened during your shift. Include patrols completed, visitors, access control events, anything notable..."
                  style={{ width: '100%', background: '#141820', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '12px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none', resize: 'none', height: 140, lineHeight: 1.6 }} />
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 6 }}>Additional Observations</div>
                <textarea value={reportObservations} onChange={e => setReportObservations(e.target.value)}
                  placeholder="Any maintenance issues, concerns, or other notes..."
                  style={{ width: '100%', background: '#141820', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '12px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none', resize: 'none', height: 90, lineHeight: 1.6 }} />
              </div>

              <button onClick={submitReport} disabled={submittingReport || !selectedShift || !reportSummary.trim()}
                style={{ width: '100%', background: !selectedShift || !reportSummary.trim() ? '#1a1f2e' : 'linear-gradient(135deg, #f97316, #ea580c)', color: !selectedShift || !reportSummary.trim() ? '#334155' : '#fff', border: 'none', borderRadius: 10, padding: 15, fontSize: 15, fontWeight: 700, cursor: !selectedShift || !reportSummary.trim() ? 'not-allowed' : 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'all 0.2s' }}>
                {submittingReport ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          )}

          {/* LOG INCIDENT */}
          {activeTab === 'incident' && (
            <div>
              {incidentSuccess && (
                <div style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 10, padding: '12px 16px', fontSize: 14, color: '#4ade80', marginBottom: 16, textAlign: 'center', fontWeight: 600 }}>
                  ✓ Incident logged successfully
                </div>
              )}

              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 6 }}>Title *</div>
                <input value={incidentTitle} onChange={e => setIncidentTitle(e.target.value)} placeholder="e.g. Unauthorized access attempt"
                  style={{ width: '100%', background: '#141820', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '12px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none' }} />
              </div>

              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 6 }}>Description</div>
                <textarea value={incidentDesc} onChange={e => setIncidentDesc(e.target.value)} placeholder="Describe what happened in detail..."
                  style={{ width: '100%', background: '#141820', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '12px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none', resize: 'none', height: 120, lineHeight: 1.6 }} />
              </div>

              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 6 }}>Severity</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                  {[
                    { val: 'low', label: 'Low', color: '#4ade80', bg: 'rgba(74,222,128,0.1)', border: 'rgba(74,222,128,0.3)' },
                    { val: 'medium', label: 'Medium', color: '#facc15', bg: 'rgba(250,204,21,0.1)', border: 'rgba(250,204,21,0.3)' },
                    { val: 'high', label: 'High', color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.3)' },
                  ].map(opt => (
                    <button key={opt.val} onClick={() => setIncidentSeverity(opt.val)}
                      style={{ padding: '10px 4px', borderRadius: 8, border: incidentSeverity === opt.val ? `1px solid ${opt.border}` : '1px solid rgba(255,255,255,0.07)', background: incidentSeverity === opt.val ? opt.bg : 'transparent', color: incidentSeverity === opt.val ? opt.color : '#475569', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'all 0.15s' }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 6 }}>Related Shift</div>
                <select value={incidentShiftId} onChange={e => setIncidentShiftId(e.target.value)}
                  style={{ width: '100%', background: '#141820', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '12px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none' }}>
                  <option value="">Select shift (optional)</option>
                  {shifts.map(s => (
                    <option key={s.id} value={s.id}>{s.sites?.name} — {fmtDate(s.start_time)}</option>
                  ))}
                </select>
              </div>

              <button onClick={submitIncident} disabled={submittingIncident || !incidentTitle.trim()}
                style={{ width: '100%', background: !incidentTitle.trim() ? '#1a1f2e' : 'linear-gradient(135deg, #f87171, #dc2626)', color: !incidentTitle.trim() ? '#334155' : '#fff', border: 'none', borderRadius: 10, padding: 15, fontSize: 15, fontWeight: 700, cursor: !incidentTitle.trim() ? 'not-allowed' : 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'all 0.2s' }}>
                {submittingIncident ? 'Logging...' : 'Log Incident'}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
