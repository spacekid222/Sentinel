'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface Shift {
  id: string; guard_id: string; site_id: string
  start_time: string; end_time: string; shift_type: string
  status: string; guards?: { name: string }
}
interface Incident {
  id: string; title: string; description: string
  severity: string; status: string; created_at: string
}
interface ActivityReport {
  id: string; summary: string; observations: string
  created_at: string; guards?: { name: string }
  shifts?: { start_time: string; end_time: string }
}
interface Site {
  id: string; name: string; address: string
  contact_name: string; contact_phone: string
}
interface Client {
  id: string; name: string; email: string; site_id: string
}

export default function ClientPortal() {
  const [client, setClient] = useState<Client | null>(null)
  const [site, setSite] = useState<Site | null>(null)
  const [shifts, setShifts] = useState<Shift[]>([])
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [reports, setReports] = useState<ActivityReport[]>([])
  const [activeTab, setActiveTab] = useState('schedule')
  const [loading, setLoading] = useState(true)
  const [viewingReport, setViewingReport] = useState<ActivityReport | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { window.location.href = '/client-login'; return }

      const { data: clientData } = await supabase
        .from('clients').select('*').eq('email', session.user.email).single()

      if (!clientData) { window.location.href = '/client-login'; return }

      setClient(clientData)

      const [siteRes, shiftsRes, incidentsRes, reportsRes] = await Promise.all([
        supabase.from('sites').select('*').eq('id', clientData.site_id).single(),
        supabase.from('shifts').select('*, guards(name)').eq('site_id', clientData.site_id).order('start_time', { ascending: false }),
        supabase.from('incidents').select('*').eq('site_id', clientData.site_id).order('created_at', { ascending: false }),
        supabase.from('activity_reports').select('*, guards(name), shifts(start_time, end_time)').eq('site_id', clientData.site_id).order('created_at', { ascending: false })
      ])

      if (siteRes.data) setSite(siteRes.data)
      if (shiftsRes.data) setShifts(shiftsRes.data)
      if (incidentsRes.data) setIncidents(incidentsRes.data)
      if (reportsRes.data) setReports(reportsRes.data)
      setLoading(false)
    })
  }, [])

  const shiftPill: Record<string, { background: string; color: string }> = {
    day:   { background: 'rgba(251,146,60,0.15)', color: '#fb923c' },
    swing: { background: 'rgba(250,204,21,0.15)', color: '#facc15' },
    night: { background: 'rgba(167,139,250,0.15)', color: '#a78bfa' },
  }
  const sevPill: Record<string, { background: string; color: string }> = {
    low:    { background: 'rgba(74,222,128,0.12)', color: '#4ade80' },
    medium: { background: 'rgba(250,204,21,0.12)', color: '#facc15' },
    high:   { background: 'rgba(248,113,113,0.12)', color: '#f87171' },
  }

  const fmtDate = (d: string) => new Date(d).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
  const fmtDateTime = (d: string) => new Date(d).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

  const tabs = [
    { id: 'schedule', label: 'Schedule' },
    { id: 'incidents', label: 'Incidents' },
    { id: 'reports', label: 'Activity Reports' },
  ]

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080b12', color: '#475569', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      Loading...
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; background: #080b12; color: #e2e8f0; -webkit-font-smoothing: antialiased; }
        :root {
          --bg: #080b12; --bg2: #0e1117; --bg3: #141820; --bg4: #1a1f2e;
          --border: rgba(255,255,255,0.07); --border2: rgba(255,255,255,0.12);
          --text: #f1f5f9; --text2: #94a3b8; --text3: #475569;
          --accent: #f97316;
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        {/* Header */}
        <div style={{ background: 'var(--bg3)', borderBottom: '1px solid var(--border)', padding: '0 40px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
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
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.3px' }}>Watchpost</div>
              <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px' }}>Client Portal</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: 13, color: 'var(--text3)' }}>{client?.name}</div>
            <button onClick={async () => { await supabase.auth.signOut(); window.location.href = '/client-login' }}
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 7, padding: '6px 12px', fontSize: 12, color: 'var(--text3)', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Sign out
            </button>
          </div>
        </div>

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 40px' }}>
          {/* Site info */}
          <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 14, padding: '24px 28px', marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>Your Site</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.5px' }}>{site?.name}</div>
              <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 4 }}>{site?.address || 'No address on file'}</div>
            </div>
            <div style={{ display: 'flex', gap: 32 }}>
              {[
                { label: 'Total Shifts', value: shifts.length },
                { label: 'Open Incidents', value: incidents.filter(i => i.status === 'open').length },
                { label: 'Reports', value: reports.length },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: s.label === 'Open Incidents' && s.value > 0 ? '#f97316' : 'var(--text)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '-1px' }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, padding: 4, width: 'fit-content' }}>
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{ padding: '7px 16px', borderRadius: 7, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'all 0.15s',
                  background: activeTab === tab.id ? 'var(--bg4)' : 'transparent',
                  color: activeTab === tab.id ? 'var(--text)' : 'var(--text3)' }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* SCHEDULE TAB */}
          {activeTab === 'schedule' && (
            <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                    {['Guard', 'Type', 'Start', 'End', 'Status'].map(h => (
                      <th key={h} style={{ padding: '11px 20px', textAlign: 'left', fontSize: 10.5, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.7px', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {shifts.length === 0 && (
                    <tr><td colSpan={5} style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text3)', fontSize: 14 }}>No shifts scheduled</td></tr>
                  )}
                  {shifts.map(s => (
                    <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 20px', fontSize: 13, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap' }}>{s.guards?.name || '—'}</td>
                      <td style={{ padding: '12px 20px', whiteSpace: 'nowrap' }}><span style={{ ...shiftPill[s.shift_type], padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{s.shift_type}</span></td>
                      <td style={{ padding: '12px 20px', fontSize: 12, color: 'var(--text3)', fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'nowrap' }}>{fmtDateTime(s.start_time)}</td>
                      <td style={{ padding: '12px 20px', fontSize: 12, color: 'var(--text3)', fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'nowrap' }}>{fmtDateTime(s.end_time)}</td>
                      <td style={{ padding: '12px 20px', whiteSpace: 'nowrap' }}><span style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80', padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{s.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* INCIDENTS TAB */}
          {activeTab === 'incidents' && (
            <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                    {['Title', 'Severity', 'Status', 'Date'].map(h => (
                      <th key={h} style={{ padding: '11px 20px', textAlign: 'left', fontSize: 10.5, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.7px', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {incidents.length === 0 && (
                    <tr><td colSpan={4} style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text3)', fontSize: 14 }}>No incidents logged</td></tr>
                  )}
                  {incidents.map(i => (
                    <tr key={i.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 20px', fontSize: 13, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap' }}>{i.title}</td>
                      <td style={{ padding: '12px 20px', whiteSpace: 'nowrap' }}><span style={{ ...sevPill[i.severity], padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{i.severity}</span></td>
                      <td style={{ padding: '12px 20px', whiteSpace: 'nowrap' }}><span style={{ background: 'rgba(249,115,22,0.1)', color: '#f97316', padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{i.status}</span></td>
                      <td style={{ padding: '12px 20px', fontSize: 12, color: 'var(--text3)', fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'nowrap' }}>{fmtDate(i.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* REPORTS TAB */}
          {activeTab === 'reports' && (
            <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                    {['Guard', 'Shift Date', 'Summary', 'Submitted', ''].map(h => (
                      <th key={h} style={{ padding: '11px 20px', textAlign: 'left', fontSize: 10.5, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.7px', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reports.length === 0 && (
                    <tr><td colSpan={5} style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text3)', fontSize: 14 }}>No activity reports yet</td></tr>
                  )}
                  {reports.map(r => (
                    <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 20px', fontSize: 13, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap' }}>{r.guards?.name || '—'}</td>
                      <td style={{ padding: '12px 20px', fontSize: 12, color: 'var(--text3)', fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'nowrap' }}>{r.shifts ? fmtDate(r.shifts.start_time) : '—'}</td>
                      <td style={{ padding: '12px 20px', maxWidth: 280 }}><div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13, color: 'var(--text2)' }}>{r.summary}</div></td>
                      <td style={{ padding: '12px 20px', fontSize: 12, color: 'var(--text3)', fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'nowrap' }}>{fmtDate(r.created_at)}</td>
                      <td style={{ padding: '12px 20px', whiteSpace: 'nowrap' }}>
                        <button onClick={() => setViewingReport(r)}
                          style={{ background: 'rgba(96,165,250,0.1)', color: '#60a5fa', border: 'none', borderRadius: 5, padding: '4px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* VIEW REPORT MODAL */}
      {viewingReport && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
          onClick={e => e.target === e.currentTarget && setViewingReport(null)}>
          <div style={{ background: 'var(--bg3)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, padding: 28, width: 520, boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>Activity Report</div>
            <div style={{ display: 'flex', gap: 20, marginBottom: 20, flexWrap: 'wrap' }}>
              {[['Guard', viewingReport.guards?.name], ['Submitted', new Date(viewingReport.created_at).toLocaleString()]].map(([l, v]) => (
                <div key={l as string} style={{ fontSize: 12, color: 'var(--text3)' }}>{l}: <strong style={{ color: 'var(--text2)' }}>{v || '—'}</strong></div>
              ))}
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 8 }}>Activity Summary</div>
              <div style={{ background: '#1a1f2e', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px', fontSize: 13.5, color: 'var(--text2)', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{viewingReport.summary}</div>
            </div>
            {viewingReport.observations && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 8 }}>Additional Observations</div>
                <div style={{ background: '#1a1f2e', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px', fontSize: 13.5, color: 'var(--text2)', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{viewingReport.observations}</div>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
              <button onClick={() => setViewingReport(null)}
                style={{ padding: '8px 16px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
