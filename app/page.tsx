'use client'

import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

interface Guard {
  id: string
  name: string
  email: string
  phone: string
  license_number: string
  license_expiry: string
  status: string
}

interface Site {
  id: string
  name: string
  address: string
  contact_name: string
  contact_phone: string
  status: string
}

interface Shift {
  id: string
  guard_id: string
  site_id: string
  start_time: string
  end_time: string
  shift_type: string
  pay_rate: number
  bill_rate: number
  status: string
  guards?: { name: string }
  sites?: { name: string }
}

interface Incident {
  id: string
  title: string
  description: string
  severity: string
  status: string
  created_at: string
  site_id: string
  guard_id: string
  sites?: { name: string }
}

export default function Home() {
  const [guards, setGuards] = useState<Guard[]>([])
  const [sites, setSites] = useState<Site[]>([])
  const [shifts, setShifts] = useState<Shift[]>([])
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [activeNav, setActiveNav] = useState('schedule')
  const [showAddGuard, setShowAddGuard] = useState(false)
  const [showAddSite, setShowAddSite] = useState(false)
  const [showAddShift, setShowAddShift] = useState(false)
  const [showAddIncident, setShowAddIncident] = useState(false)
  const [loading, setLoading] = useState(true)

  const [guardForm, setGuardForm] = useState({ name: '', email: '', phone: '', license_number: '', license_expiry: '' })
  const [siteForm, setSiteForm] = useState({ name: '', address: '', contact_name: '', contact_phone: '' })
  const [shiftForm, setShiftForm] = useState({ guard_id: '', site_id: '', start_time: '', end_time: '', shift_type: 'day', pay_rate: '', bill_rate: '' })
  const [incidentForm, setIncidentForm] = useState({ title: '', description: '', severity: 'low', site_id: '', guard_id: '' })

  useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (!session) window.location.href = '/login'
    else fetchAll()
  })
}, [])

  async function fetchAll() {
    setLoading(true)
    const [g, s, sh, inc] = await Promise.all([
      supabase.from('guards').select('*').order('name'),
      supabase.from('sites').select('*').order('name'),
      supabase.from('shifts').select('*, guards(name), sites(name)').order('start_time'),
      supabase.from('incidents').select('*, sites(name)').order('created_at', { ascending: false })
    ])
    if (g.data) setGuards(g.data)
    if (s.data) setSites(s.data)
    if (sh.data) setShifts(sh.data)
    if (inc.data) setIncidents(inc.data)
    setLoading(false)
  }

  async function addGuard() {
    const { error } = await supabase.from('guards').insert([guardForm])
    if (!error) { setShowAddGuard(false); setGuardForm({ name: '', email: '', phone: '', license_number: '', license_expiry: '' }); fetchAll() }
  }
  async function addSite() {
    const { error } = await supabase.from('sites').insert([siteForm])
    if (!error) { setShowAddSite(false); setSiteForm({ name: '', address: '', contact_name: '', contact_phone: '' }); fetchAll() }
  }
  async function addShift() {
    const { error } = await supabase.from('shifts').insert([{ ...shiftForm, pay_rate: parseFloat(shiftForm.pay_rate), bill_rate: parseFloat(shiftForm.bill_rate) }])
    if (!error) { setShowAddShift(false); setShiftForm({ guard_id: '', site_id: '', start_time: '', end_time: '', shift_type: 'day', pay_rate: '', bill_rate: '' }); fetchAll() }
  }
  async function addIncident() {
    const { error } = await supabase.from('incidents').insert([incidentForm])
    if (!error) { setShowAddIncident(false); setIncidentForm({ title: '', description: '', severity: 'low', site_id: '', guard_id: '' }); fetchAll() }
  }

  const navItems = [
    { id: 'schedule', label: 'Schedule', icon: '◫' },
    { id: 'guards', label: 'Guards', icon: '◎' },
    { id: 'sites', label: 'Sites', icon: '◈' },
    { id: 'incidents', label: 'Incidents', icon: '◬' },
  ]

  const shiftColors: Record<string, { bg: string; color: string }> = {
    day:   { bg: '#fff3e8', color: '#c2410c' },
    swing: { bg: '#fef3c7', color: '#92400e' },
    night: { bg: '#ede9fe', color: '#5b21b6' },
  }
  const severityColors: Record<string, { bg: string; color: string }> = {
    low:    { bg: '#dcfce7', color: '#15803d' },
    medium: { bg: '#fef3c7', color: '#92400e' },
    high:   { bg: '#fee2e2', color: '#b91c1c' },
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body { background: #fafaf9; font-family: 'Sora', sans-serif; }

        .sentinel-layout { display: flex; height: 100vh; background: #fafaf9; }

        .sidebar {
          width: 240px;
          background: #fff;
          border-right: 1px solid #f0ede8;
          display: flex;
          flex-direction: column;
          padding: 0;
          flex-shrink: 0;
        }

        .sidebar-logo {
          padding: 28px 24px 24px;
          border-bottom: 1px solid #f0ede8;
        }

        .logo-mark {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .logo-icon {
          width: 32px; height: 32px;
          background: linear-gradient(135deg, #f97316, #ea580c);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px;
          box-shadow: 0 2px 8px rgba(249,115,22,0.35);
        }

        .logo-text {
          font-size: 17px;
          font-weight: 700;
          color: #1c1917;
          letter-spacing: -0.3px;
        }

        .logo-sub {
          font-size: 11px;
          color: #a8a29e;
          margin-top: 2px;
          font-weight: 400;
          letter-spacing: 0.3px;
          text-transform: uppercase;
        }

        .sidebar-nav { padding: 16px 12px; flex: 1; }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 13.5px;
          font-weight: 500;
          color: #78716c;
          transition: all 0.15s ease;
          margin-bottom: 2px;
          border: none;
          background: transparent;
          width: 100%;
          text-align: left;
        }

        .nav-item:hover { background: #fafaf9; color: #1c1917; }

        .nav-item.active {
          background: #fff5f0;
          color: #ea580c;
          font-weight: 600;
        }

        .nav-icon {
          width: 20px; height: 20px;
          display: flex; align-items: center; justify-content: center;
          font-size: 14px;
        }

        .sidebar-footer {
          padding: 16px 24px;
          border-top: 1px solid #f0ede8;
          font-size: 11px;
          color: #d6d3d1;
          font-family: 'JetBrains Mono', monospace;
        }

        .main { flex: 1; overflow: auto; }

        .topbar {
          padding: 20px 36px;
          border-bottom: 1px solid #f0ede8;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .page-title {
          font-size: 20px;
          font-weight: 700;
          color: #1c1917;
          letter-spacing: -0.4px;
        }

        .page-count {
          font-size: 13px;
          color: #a8a29e;
          font-weight: 400;
          margin-left: 10px;
        }

        .btn-primary {
          background: linear-gradient(135deg, #f97316, #ea580c);
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 9px 18px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          font-family: 'Sora', sans-serif;
          letter-spacing: -0.1px;
          box-shadow: 0 1px 6px rgba(249,115,22,0.3);
          transition: all 0.15s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(249,115,22,0.35); }

        .content { padding: 32px 36px; }

        .stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 28px;
        }

        .stat-card {
          background: #fff;
          border: 1px solid #f0ede8;
          border-radius: 12px;
          padding: 20px 22px;
        }

        .stat-label { font-size: 11px; color: #a8a29e; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
        .stat-value { font-size: 28px; font-weight: 700; color: #1c1917; letter-spacing: -1px; }
        .stat-sub { font-size: 12px; color: #a8a29e; margin-top: 4px; }

        .table-card {
          background: #fff;
          border: 1px solid #f0ede8;
          border-radius: 14px;
          overflow: hidden;
        }

        table { width: 100%; border-collapse: collapse; }

        thead tr { border-bottom: 1px solid #f5f2ef; }

        th {
          padding: 13px 20px;
          text-align: left;
          font-size: 11px;
          color: #a8a29e;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        td {
          padding: 14px 20px;
          font-size: 13.5px;
          color: #44403c;
          border-bottom: 1px solid #faf9f7;
        }

        tr:last-child td { border-bottom: none; }
        tr:hover td { background: #fdfcfb; }

        .td-primary { font-weight: 600; color: #1c1917; }
        .td-muted { color: #a8a29e; font-size: 13px; }
        .td-mono { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #78716c; }

        .badge {
          display: inline-flex;
          align-items: center;
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 11.5px;
          font-weight: 600;
          letter-spacing: 0.1px;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #c4bfbb;
          font-size: 14px;
        }
        .empty-icon { font-size: 32px; margin-bottom: 12px; opacity: 0.4; }
        .empty-text { font-weight: 500; color: #a8a29e; margin-bottom: 4px; }
        .empty-sub { font-size: 12px; color: #c4bfbb; }

        /* MODAL */
        .modal-overlay {
          position: fixed; inset: 0;
          background: rgba(28,25,23,0.4);
          backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          z-index: 100;
          animation: fadeIn 0.15s ease;
        }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

        .modal-box {
          background: #fff;
          border-radius: 16px;
          padding: 32px;
          width: 460px;
          border: 1px solid #f0ede8;
          box-shadow: 0 20px 60px rgba(28,25,23,0.12);
          animation: slideUp 0.2s ease;
        }

        .modal-title {
          font-size: 18px;
          font-weight: 700;
          color: #1c1917;
          letter-spacing: -0.3px;
          margin-bottom: 6px;
        }

        .modal-sub {
          font-size: 13px;
          color: #a8a29e;
          margin-bottom: 24px;
        }

        .field-label {
          font-size: 12px;
          font-weight: 600;
          color: #78716c;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }

        .field-wrap { margin-bottom: 14px; }

        input, select, textarea {
          width: 100%;
          background: #fafaf9;
          border: 1px solid #e8e3de;
          border-radius: 8px;
          padding: 10px 14px;
          color: #1c1917;
          font-size: 13.5px;
          font-family: 'Sora', sans-serif;
          transition: border-color 0.15s;
          outline: none;
        }

        input:focus, select:focus, textarea:focus {
          border-color: #f97316;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(249,115,22,0.08);
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 20px;
        }

        .btn-secondary {
          background: transparent;
          color: #78716c;
          border: 1px solid #e8e3de;
          border-radius: 8px;
          padding: 9px 18px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          font-family: 'Sora', sans-serif;
          transition: all 0.15s;
        }
        .btn-secondary:hover { background: #fafaf9; }

        .expiry-warn { color: #dc2626; font-weight: 600; }
      `}</style>

      <div className="sentinel-layout">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="sidebar-logo">
            <div className="logo-mark">
              <div className="logo-icon">⚡</div>
              <div>
                <div className="logo-text">Sentinel</div>
              </div>
            </div>
            <div className="logo-sub">Security Management</div>
          </div>

          <nav className="sidebar-nav">
            {navItems.map(item => (
              <button
                key={item.id}
                className={`nav-item${activeNav === item.id ? ' active' : ''}`}
                onClick={() => setActiveNav(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          <div className="sidebar-footer" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
  <button
    onClick={async () => { await supabase.auth.signOut(); window.location.href = '/login' }}
    style={{ background: 'transparent', border: '1px solid #f0ede8', borderRadius: 6, padding: '6px 10px', fontSize: 11, color: '#a8a29e', cursor: 'pointer', fontFamily: 'Sora, sans-serif' }}
  >
    Sign out
  </button>
  <div>v0.1.0 · sentinel.app</div>
</div>
        </div>

        {/* Main */}
        <div className="main">
          <div className="topbar">
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 0 }}>
              <span className="page-title">{navItems.find(n => n.id === activeNav)?.label}</span>
              <span className="page-count">
                {activeNav === 'schedule' && ` · ${shifts.length} shifts`}
                {activeNav === 'guards' && ` · ${guards.length} guards`}
                {activeNav === 'sites' && ` · ${sites.length} sites`}
                {activeNav === 'incidents' && ` · ${incidents.length} incidents`}
              </span>
            </div>
            {activeNav === 'schedule' && <button className="btn-primary" onClick={() => setShowAddShift(true)}>+ Add Shift</button>}
            {activeNav === 'guards' && <button className="btn-primary" onClick={() => setShowAddGuard(true)}>+ Add Guard</button>}
            {activeNav === 'sites' && <button className="btn-primary" onClick={() => setShowAddSite(true)}>+ Add Site</button>}
            {activeNav === 'incidents' && <button className="btn-primary" onClick={() => setShowAddIncident(true)}>+ Log Incident</button>}
          </div>

          <div className="content">
            {loading && <div style={{ color: '#a8a29e', fontSize: 14 }}>Loading...</div>}

            {/* SCHEDULE */}
            {!loading && activeNav === 'schedule' && (
              <>
                <div className="stats-row">
                  <div className="stat-card">
                    <div className="stat-label">Total Shifts</div>
                    <div className="stat-value">{shifts.length}</div>
                    <div className="stat-sub">All time</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Day Shifts</div>
                    <div className="stat-value">{shifts.filter(s => s.shift_type === 'day').length}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Night Shifts</div>
                    <div className="stat-value">{shifts.filter(s => s.shift_type === 'night').length}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Guards Active</div>
                    <div className="stat-value">{guards.filter(g => g.status === 'active').length}</div>
                  </div>
                </div>
                <div className="table-card">
                  <table>
                    <thead>
                      <tr>
                        {['Guard', 'Site', 'Type', 'Start', 'End', 'Pay Rate', 'Bill Rate', 'Status'].map(h => (
                          <th key={h}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {shifts.length === 0 && (
                        <tr><td colSpan={8}>
                          <div className="empty-state">
                            <div className="empty-icon">◫</div>
                            <div className="empty-text">No shifts scheduled yet</div>
                            <div className="empty-sub">Add guards and sites first, then schedule shifts</div>
                          </div>
                        </td></tr>
                      )}
                      {shifts.map(shift => (
                        <tr key={shift.id}>
                          <td className="td-primary">{shift.guards?.name || '—'}</td>
                          <td>{shift.sites?.name || '—'}</td>
                          <td>
                            <span className="badge" style={shiftColors[shift.shift_type] || { bg: '#f5f5f4', color: '#78716c' }}>
                              {shift.shift_type}
                            </span>
                          </td>
                          <td className="td-mono">{new Date(shift.start_time).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                          <td className="td-mono">{new Date(shift.end_time).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                          <td className="td-mono">${shift.pay_rate}/hr</td>
                          <td className="td-mono">${shift.bill_rate}/hr</td>
                          <td><span className="badge" style={{ background: '#dcfce7', color: '#15803d' }}>{shift.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* GUARDS */}
            {!loading && activeNav === 'guards' && (
              <div className="table-card">
                <table>
                  <thead>
                    <tr>
                      {['Name', 'Email', 'Phone', 'License #', 'Expiry', 'Status'].map(h => <th key={h}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {guards.length === 0 && (
                      <tr><td colSpan={6}>
                        <div className="empty-state">
                          <div className="empty-icon">◎</div>
                          <div className="empty-text">No guards added yet</div>
                          <div className="empty-sub">Add your first guard to get started</div>
                        </div>
                      </td></tr>
                    )}
                    {guards.map(guard => {
                      const expired = guard.license_expiry && new Date(guard.license_expiry) < new Date()
                      return (
                        <tr key={guard.id}>
                          <td className="td-primary">{guard.name}</td>
                          <td className="td-muted">{guard.email || '—'}</td>
                          <td className="td-muted">{guard.phone || '—'}</td>
                          <td className="td-mono">{guard.license_number || '—'}</td>
                          <td className={expired ? 'expiry-warn' : 'td-muted'}>{guard.license_expiry || '—'}{expired ? ' ⚠' : ''}</td>
                          <td><span className="badge" style={{ background: '#dcfce7', color: '#15803d' }}>{guard.status}</span></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* SITES */}
            {!loading && activeNav === 'sites' && (
              <div className="table-card">
                <table>
                  <thead>
                    <tr>
                      {['Site Name', 'Address', 'Contact', 'Phone', 'Status'].map(h => <th key={h}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {sites.length === 0 && (
                      <tr><td colSpan={5}>
                        <div className="empty-state">
                          <div className="empty-icon">◈</div>
                          <div className="empty-text">No sites added yet</div>
                          <div className="empty-sub">Add client sites to assign guards and shifts</div>
                        </div>
                      </td></tr>
                    )}
                    {sites.map(site => (
                      <tr key={site.id}>
                        <td className="td-primary">{site.name}</td>
                        <td className="td-muted">{site.address || '—'}</td>
                        <td className="td-muted">{site.contact_name || '—'}</td>
                        <td className="td-muted">{site.contact_phone || '—'}</td>
                        <td><span className="badge" style={{ background: '#dcfce7', color: '#15803d' }}>{site.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* INCIDENTS */}
            {!loading && activeNav === 'incidents' && (
              <div className="table-card">
                <table>
                  <thead>
                    <tr>
                      {['Title', 'Site', 'Severity', 'Status', 'Date'].map(h => <th key={h}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {incidents.length === 0 && (
                      <tr><td colSpan={5}>
                        <div className="empty-state">
                          <div className="empty-icon">◬</div>
                          <div className="empty-text">No incidents logged</div>
                          <div className="empty-sub">Incident reports will appear here</div>
                        </div>
                      </td></tr>
                    )}
                    {incidents.map(incident => (
                      <tr key={incident.id}>
                        <td className="td-primary">{incident.title}</td>
                        <td className="td-muted">{incident.sites?.name || '—'}</td>
                        <td><span className="badge" style={severityColors[incident.severity] || { background: '#f5f5f4', color: '#78716c' }}>{incident.severity}</span></td>
                        <td><span className="badge" style={{ background: '#fff5f0', color: '#ea580c' }}>{incident.status}</span></td>
                        <td className="td-mono">{new Date(incident.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ADD GUARD MODAL */}
        {showAddGuard && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAddGuard(false)}>
            <div className="modal-box">
              <div className="modal-title">Add Guard</div>
              <div className="modal-sub">Enter the guard's details below</div>
              <div className="field-wrap"><div className="field-label">Full Name *</div><input placeholder="John Smith" value={guardForm.name} onChange={e => setGuardForm({...guardForm, name: e.target.value})} /></div>
              <div className="field-wrap"><div className="field-label">Email</div><input placeholder="john@example.com" value={guardForm.email} onChange={e => setGuardForm({...guardForm, email: e.target.value})} /></div>
              <div className="field-wrap"><div className="field-label">Phone</div><input placeholder="(555) 000-0000" value={guardForm.phone} onChange={e => setGuardForm({...guardForm, phone: e.target.value})} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="field-wrap"><div className="field-label">License #</div><input placeholder="LIC-00000" value={guardForm.license_number} onChange={e => setGuardForm({...guardForm, license_number: e.target.value})} /></div>
                <div className="field-wrap"><div className="field-label">License Expiry</div><input type="date" value={guardForm.license_expiry} onChange={e => setGuardForm({...guardForm, license_expiry: e.target.value})} /></div>
              </div>
              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setShowAddGuard(false)}>Cancel</button>
                <button className="btn-primary" onClick={addGuard}>Add Guard</button>
              </div>
            </div>
          </div>
        )}

        {/* ADD SITE MODAL */}
        {showAddSite && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAddSite(false)}>
            <div className="modal-box">
              <div className="modal-title">Add Site</div>
              <div className="modal-sub">Enter client site information</div>
              <div className="field-wrap"><div className="field-label">Site Name *</div><input placeholder="Downtown Office Tower" value={siteForm.name} onChange={e => setSiteForm({...siteForm, name: e.target.value})} /></div>
              <div className="field-wrap"><div className="field-label">Address</div><input placeholder="123 Main St, New York, NY" value={siteForm.address} onChange={e => setSiteForm({...siteForm, address: e.target.value})} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="field-wrap"><div className="field-label">Contact Name</div><input placeholder="Jane Doe" value={siteForm.contact_name} onChange={e => setSiteForm({...siteForm, contact_name: e.target.value})} /></div>
                <div className="field-wrap"><div className="field-label">Contact Phone</div><input placeholder="(555) 000-0000" value={siteForm.contact_phone} onChange={e => setSiteForm({...siteForm, contact_phone: e.target.value})} /></div>
              </div>
              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setShowAddSite(false)}>Cancel</button>
                <button className="btn-primary" onClick={addSite}>Add Site</button>
              </div>
            </div>
          </div>
        )}

        {/* ADD SHIFT MODAL */}
        {showAddShift && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAddShift(false)}>
            <div className="modal-box">
              <div className="modal-title">Schedule Shift</div>
              <div className="modal-sub">Assign a guard to a site and time slot</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="field-wrap"><div className="field-label">Guard *</div>
                  <select value={shiftForm.guard_id} onChange={e => setShiftForm({...shiftForm, guard_id: e.target.value})}>
                    <option value="">Select guard</option>
                    {guards.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>
                <div className="field-wrap"><div className="field-label">Site *</div>
                  <select value={shiftForm.site_id} onChange={e => setShiftForm({...shiftForm, site_id: e.target.value})}>
                    <option value="">Select site</option>
                    {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="field-wrap"><div className="field-label">Shift Type</div>
                <select value={shiftForm.shift_type} onChange={e => setShiftForm({...shiftForm, shift_type: e.target.value})}>
                  <option value="day">Day</option>
                  <option value="swing">Swing</option>
                  <option value="night">Night</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="field-wrap"><div className="field-label">Start Time *</div><input type="datetime-local" value={shiftForm.start_time} onChange={e => setShiftForm({...shiftForm, start_time: e.target.value})} /></div>
                <div className="field-wrap"><div className="field-label">End Time *</div><input type="datetime-local" value={shiftForm.end_time} onChange={e => setShiftForm({...shiftForm, end_time: e.target.value})} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="field-wrap"><div className="field-label">Pay Rate ($/hr)</div><input placeholder="18.00" value={shiftForm.pay_rate} onChange={e => setShiftForm({...shiftForm, pay_rate: e.target.value})} /></div>
                <div className="field-wrap"><div className="field-label">Bill Rate ($/hr)</div><input placeholder="32.00" value={shiftForm.bill_rate} onChange={e => setShiftForm({...shiftForm, bill_rate: e.target.value})} /></div>
              </div>
              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setShowAddShift(false)}>Cancel</button>
                <button className="btn-primary" onClick={addShift}>Schedule Shift</button>
              </div>
            </div>
          </div>
        )}

        {/* ADD INCIDENT MODAL */}
        {showAddIncident && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAddIncident(false)}>
            <div className="modal-box">
              <div className="modal-title">Log Incident</div>
              <div className="modal-sub">Document a security incident or event</div>
              <div className="field-wrap"><div className="field-label">Title *</div><input placeholder="Unauthorized access attempt" value={incidentForm.title} onChange={e => setIncidentForm({...incidentForm, title: e.target.value})} /></div>
              <div className="field-wrap"><div className="field-label">Description</div><textarea style={{ height: 80, resize: 'none' }} placeholder="Describe what happened..." value={incidentForm.description} onChange={e => setIncidentForm({...incidentForm, description: e.target.value})} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="field-wrap"><div className="field-label">Severity</div>
                  <select value={incidentForm.severity} onChange={e => setIncidentForm({...incidentForm, severity: e.target.value})}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="field-wrap"><div className="field-label">Site</div>
                  <select value={incidentForm.site_id} onChange={e => setIncidentForm({...incidentForm, site_id: e.target.value})}>
                    <option value="">Select site</option>
                    {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="field-wrap"><div className="field-label">Guard Involved</div>
                <select value={incidentForm.guard_id} onChange={e => setIncidentForm({...incidentForm, guard_id: e.target.value})}>
                  <option value="">Select guard</option>
                  {guards.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setShowAddIncident(false)}>Cancel</button>
                <button className="btn-primary" onClick={addIncident}>Log Incident</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

