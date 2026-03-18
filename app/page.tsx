'use client'

import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

interface Guard {
  id: string; name: string; email: string; phone: string
  license_number: string; license_expiry: string; status: string
}
interface Site {
  id: string; name: string; address: string
  contact_name: string; contact_phone: string; status: string
}
interface Shift {
  id: string; guard_id: string; site_id: string
  start_time: string; end_time: string; shift_type: string
  pay_rate: number; bill_rate: number; status: string
  guards?: { name: string }; sites?: { name: string }
}
interface Incident {
  id: string; title: string; description: string; severity: string
  status: string; created_at: string; site_id: string; guard_id: string
  sites?: { name: string }
}
interface PostOrder {
  id: string; site_id: string; title: string; content: string
  category: string; order_index: number; created_at: string
}
interface ActivityReport {
  id: string; shift_id: string; guard_id: string; site_id: string
  summary: string; observations: string; status: string; created_at: string
  guards?: { name: string }; sites?: { name: string }
  shifts?: { start_time: string; end_time: string }
}

export default function Home() {
  const [guards, setGuards] = useState<Guard[]>([])
  const [sites, setSites] = useState<Site[]>([])
  const [shifts, setShifts] = useState<Shift[]>([])
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [postOrders, setPostOrders] = useState<PostOrder[]>([])
  const [activityReports, setActivityReports] = useState<ActivityReport[]>([])
  const [activeNav, setActiveNav] = useState('dashboard')
  const [loading, setLoading] = useState(true)
  const [selectedSiteId, setSelectedSiteId] = useState<string>('')

  const [billingStart, setBillingStart] = useState(() => { const d = new Date(); d.setDate(1); return d.toISOString().slice(0,10) })
  const [billingEnd, setBillingEnd] = useState(() => new Date().toISOString().slice(0,10))
  const [billingSiteFilter, setBillingSiteFilter] = useState('all')

  const [showAddGuard, setShowAddGuard] = useState(false)
  const [showAddSite, setShowAddSite] = useState(false)
  const [showAddShift, setShowAddShift] = useState(false)
  const [showAddIncident, setShowAddIncident] = useState(false)
  const [showAddPostOrder, setShowAddPostOrder] = useState(false)
  const [showAddReport, setShowAddReport] = useState(false)
  const [viewingReport, setViewingReport] = useState<ActivityReport | null>(null)

  const [editingGuard, setEditingGuard] = useState<Guard | null>(null)
  const [editingSite, setEditingSite] = useState<Site | null>(null)
  const [editingShift, setEditingShift] = useState<Shift | null>(null)
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null)
  const [editingPostOrder, setEditingPostOrder] = useState<PostOrder | null>(null)

  const [guardForm, setGuardForm] = useState({ name: '', email: '', phone: '', license_number: '', license_expiry: '' })
  const [siteForm, setSiteForm] = useState({ name: '', address: '', contact_name: '', contact_phone: '' })
  const [shiftForm, setShiftForm] = useState({ guard_id: '', site_id: '', start_time: '', end_time: '', shift_type: 'day', pay_rate: '', bill_rate: '' })
  const [incidentForm, setIncidentForm] = useState({ title: '', description: '', severity: 'low', site_id: '', guard_id: '' })
  const [postOrderForm, setPostOrderForm] = useState({ title: '', content: '', category: 'general' })
  const [reportForm, setReportForm] = useState({ shift_id: '', guard_id: '', site_id: '', summary: '', observations: '' })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) window.location.href = '/login'
      else fetchAll()
    })
  }, [])

  async function fetchAll() {
    setLoading(true)
    const [g, s, sh, inc, po, ar] = await Promise.all([
      supabase.from('guards').select('*').order('name'),
      supabase.from('sites').select('*').order('name'),
      supabase.from('shifts').select('*, guards(name), sites(name)').order('start_time'),
      supabase.from('incidents').select('*, sites(name)').order('created_at', { ascending: false }),
      supabase.from('post_orders').select('*').order('order_index'),
      supabase.from('activity_reports').select('*, guards(name), sites(name), shifts(start_time, end_time)').order('created_at', { ascending: false })
    ])
    if (g.data) setGuards(g.data)
    if (s.data) { setSites(s.data); if (!selectedSiteId && s.data.length > 0) setSelectedSiteId(s.data[0].id) }
    if (sh.data) setShifts(sh.data)
    if (inc.data) setIncidents(inc.data)
    if (po.data) setPostOrders(po.data)
    if (ar.data) setActivityReports(ar.data)
    setLoading(false)
  }

  async function addGuard() { const { error } = await supabase.from('guards').insert([guardForm]); if (!error) { setShowAddGuard(false); setGuardForm({ name: '', email: '', phone: '', license_number: '', license_expiry: '' }); fetchAll() } }
  async function addSite() { const { error } = await supabase.from('sites').insert([siteForm]); if (!error) { setShowAddSite(false); setSiteForm({ name: '', address: '', contact_name: '', contact_phone: '' }); fetchAll() } }
  async function addShift() { const { error } = await supabase.from('shifts').insert([{ ...shiftForm, pay_rate: parseFloat(shiftForm.pay_rate), bill_rate: parseFloat(shiftForm.bill_rate) }]); if (!error) { setShowAddShift(false); setShiftForm({ guard_id: '', site_id: '', start_time: '', end_time: '', shift_type: 'day', pay_rate: '', bill_rate: '' }); fetchAll() } }
  async function addIncident() { const { error } = await supabase.from('incidents').insert([incidentForm]); if (!error) { setShowAddIncident(false); setIncidentForm({ title: '', description: '', severity: 'low', site_id: '', guard_id: '' }); fetchAll() } }
  async function addPostOrder() { const { error } = await supabase.from('post_orders').insert([{ ...postOrderForm, site_id: selectedSiteId }]); if (!error) { setShowAddPostOrder(false); setPostOrderForm({ title: '', content: '', category: 'general' }); fetchAll() } }
  async function addReport() {
    const sel = shifts.find(s => s.id === reportForm.shift_id)
    const { error } = await supabase.from('activity_reports').insert([{ ...reportForm, guard_id: sel?.guard_id || '', site_id: sel?.site_id || '' }])
    if (!error) { setShowAddReport(false); setReportForm({ shift_id: '', guard_id: '', site_id: '', summary: '', observations: '' }); fetchAll() }
  }

  async function saveGuard() { if (!editingGuard) return; await supabase.from('guards').update({ name: editingGuard.name, email: editingGuard.email, phone: editingGuard.phone, license_number: editingGuard.license_number, license_expiry: editingGuard.license_expiry }).eq('id', editingGuard.id); setEditingGuard(null); fetchAll() }
  async function saveSite() { if (!editingSite) return; await supabase.from('sites').update({ name: editingSite.name, address: editingSite.address, contact_name: editingSite.contact_name, contact_phone: editingSite.contact_phone }).eq('id', editingSite.id); setEditingSite(null); fetchAll() }
  async function saveShift() { if (!editingShift) return; await supabase.from('shifts').update({ guard_id: editingShift.guard_id, site_id: editingShift.site_id, start_time: editingShift.start_time, end_time: editingShift.end_time, shift_type: editingShift.shift_type, pay_rate: editingShift.pay_rate, bill_rate: editingShift.bill_rate }).eq('id', editingShift.id); setEditingShift(null); fetchAll() }
  async function saveIncident() { if (!editingIncident) return; await supabase.from('incidents').update({ title: editingIncident.title, description: editingIncident.description, severity: editingIncident.severity, status: editingIncident.status }).eq('id', editingIncident.id); setEditingIncident(null); fetchAll() }
  async function savePostOrder() { if (!editingPostOrder) return; await supabase.from('post_orders').update({ title: editingPostOrder.title, content: editingPostOrder.content, category: editingPostOrder.category }).eq('id', editingPostOrder.id); setEditingPostOrder(null); fetchAll() }

  async function deleteGuard(id: string) { if (!confirm('Delete this guard?')) return; await supabase.from('guards').delete().eq('id', id); fetchAll() }
  async function deleteSite(id: string) { if (!confirm('Delete this site?')) return; await supabase.from('sites').delete().eq('id', id); fetchAll() }
  async function deleteShift(id: string) { if (!confirm('Delete this shift?')) return; await supabase.from('shifts').delete().eq('id', id); fetchAll() }
  async function deleteIncident(id: string) { if (!confirm('Delete this incident?')) return; await supabase.from('incidents').delete().eq('id', id); fetchAll() }
  async function deletePostOrder(id: string) { if (!confirm('Delete this post order?')) return; await supabase.from('post_orders').delete().eq('id', id); fetchAll() }
  async function deleteReport(id: string) { if (!confirm('Delete this report?')) return; await supabase.from('activity_reports').delete().eq('id', id); fetchAll() }

  const billingShifts = shifts.filter(shift => {
    const d = new Date(shift.start_time), start = new Date(billingStart), end = new Date(billingEnd)
    end.setHours(23,59,59)
    return d >= start && d <= end && (billingSiteFilter === 'all' || shift.site_id === billingSiteFilter)
  })
  const billingBySite = sites.map(site => {
    const ss = billingShifts.filter(s => s.site_id === site.id)
    const hrs = ss.reduce((a,s) => a + (new Date(s.end_time).getTime()-new Date(s.start_time).getTime())/(1000*60*60), 0)
    const bill = ss.reduce((a,s) => a + ((new Date(s.end_time).getTime()-new Date(s.start_time).getTime())/(1000*60*60))*s.bill_rate, 0)
    const pay = ss.reduce((a,s) => a + ((new Date(s.end_time).getTime()-new Date(s.start_time).getTime())/(1000*60*60))*s.pay_rate, 0)
    return { site, shifts: ss, totalHours: hrs, totalBillable: bill, totalPayroll: pay, margin: bill-pay }
  }).filter(r => r.shifts.length > 0)
  const grandBill = billingBySite.reduce((a,r) => a+r.totalBillable, 0)
  const grandPay = billingBySite.reduce((a,r) => a+r.totalPayroll, 0)
  const grandHrs = billingBySite.reduce((a,r) => a+r.totalHours, 0)

  const today = new Date()
  const todayShifts = shifts.filter(s => new Date(s.start_time).toDateString() === today.toDateString())
  const openIncidents = incidents.filter(i => i.status === 'open')
  const expiringGuards = guards.filter(g => { if (!g.license_expiry) return false; const diff = (new Date(g.license_expiry).getTime()-today.getTime())/(1000*60*60*24); return diff <= 30 })
  const selectedSite = sites.find(s => s.id === selectedSiteId)
  const sitePostOrders = postOrders.filter(po => po.site_id === selectedSiteId)

  const navGroups = [
    { label: 'Overview', items: [{ id: 'dashboard', label: 'Dashboard', icon: '▣' }] },
    { label: 'Operations', items: [
      { id: 'schedule', label: 'Schedule', icon: '⊟' },
      { id: 'guards', label: 'Guards', icon: '⊕' },
      { id: 'sites', label: 'Sites', icon: '⊠' },
      { id: 'postorders', label: 'Post Orders', icon: '≡' },
    ]},
    { label: 'Reporting', items: [
      { id: 'reports', label: 'Activity Reports', icon: '◈' },
      { id: 'incidents', label: 'Incidents', icon: '⚠' },
      { id: 'billing', label: 'Billing', icon: '◆' },
    ]},
  ]

  const shiftPill: Record<string, { bg: string; color: string }> = {
    day:   { bg: 'rgba(251,146,60,0.15)', color: '#fb923c' },
    swing: { bg: 'rgba(250,204,21,0.15)', color: '#facc15' },
    night: { bg: 'rgba(167,139,250,0.15)', color: '#a78bfa' },
  }
  const sevPill: Record<string, { bg: string; color: string }> = {
    low:    { bg: 'rgba(74,222,128,0.12)', color: '#4ade80' },
    medium: { bg: 'rgba(250,204,21,0.12)', color: '#facc15' },
    high:   { bg: 'rgba(248,113,113,0.12)', color: '#f87171' },
  }
  const catPill: Record<string, { bg: string; color: string }> = {
    general:   { bg: 'rgba(96,165,250,0.12)', color: '#60a5fa' },
    access:    { bg: 'rgba(250,204,21,0.12)', color: '#facc15' },
    emergency: { bg: 'rgba(248,113,113,0.12)', color: '#f87171' },
    patrol:    { bg: 'rgba(74,222,128,0.12)', color: '#4ade80' },
    reporting: { bg: 'rgba(167,139,250,0.12)', color: '#a78bfa' },
  }

  const fmt$ = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const fmtDate = (d: string) => new Date(d).toLocaleDateString([], { month: 'short', day: 'numeric' })
  const fmtTime = (d: string) => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const fmtDateTime = (d: string) => new Date(d).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

        :root {
          --bg: #0e1117;
          --bg2: #141820;
          --bg3: #1a1f2e;
          --border: rgba(255,255,255,0.07);
          --border2: rgba(255,255,255,0.12);
          --text: #f1f5f9;
          --text2: #94a3b8;
          --text3: #475569;
          --accent: #f97316;
          --accent2: #ea580c;
          --accent-glow: rgba(249,115,22,0.2);
          --green: #4ade80;
          --red: #f87171;
          --yellow: #facc15;
          --purple: #a78bfa;
          --blue: #60a5fa;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; background: var(--bg); color: var(--text); -webkit-font-smoothing: antialiased; }

        .app { display: flex; height: 100vh; overflow: hidden; }

        /* SIDEBAR */
        .sidebar {
          width: 232px;
          background: var(--bg2);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          position: relative;
        }
        .sidebar::after {
          content: '';
          position: absolute;
          top: 0; right: 0; bottom: 0;
          width: 1px;
          background: linear-gradient(to bottom, transparent, rgba(249,115,22,0.3) 40%, rgba(249,115,22,0.1) 70%, transparent);
          pointer-events: none;
        }

        .sidebar-logo {
          padding: 24px 20px 20px;
          border-bottom: 1px solid var(--border);
        }
        .logo-row { display: flex; align-items: center; gap: 10px; }
        .logo-badge {
          width: 34px; height: 34px;
          background: linear-gradient(135deg, #f97316 0%, #dc2626 100%);
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          font-size: 15px;
          box-shadow: 0 0 20px rgba(249,115,22,0.4), 0 4px 8px rgba(0,0,0,0.3);
          flex-shrink: 0;
        }
        .logo-name { font-size: 16px; font-weight: 800; color: var(--text); letter-spacing: -0.4px; }
        .logo-tagline { font-size: 10px; color: var(--text3); text-transform: uppercase; letter-spacing: 1px; margin-top: 1px; font-weight: 500; }

        .sidebar-nav { flex: 1; overflow-y: auto; padding: 16px 12px; scrollbar-width: none; }
        .sidebar-nav::-webkit-scrollbar { display: none; }

        .nav-group { margin-bottom: 20px; }
        .nav-group-label {
          font-size: 10px;
          font-weight: 700;
          color: var(--text3);
          text-transform: uppercase;
          letter-spacing: 1.2px;
          padding: 0 8px;
          margin-bottom: 6px;
        }
        .nav-btn {
          display: flex; align-items: center; gap: 9px;
          width: 100%; padding: 8px 10px;
          border-radius: 7px; border: none;
          background: transparent; color: var(--text2);
          font-size: 13px; font-weight: 500;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer; text-align: left;
          transition: all 0.15s ease;
          margin-bottom: 1px;
          position: relative;
        }
        .nav-btn:hover { background: rgba(255,255,255,0.05); color: var(--text); }
        .nav-btn.active {
          background: rgba(249,115,22,0.12);
          color: var(--accent);
          font-weight: 600;
        }
        .nav-btn.active::before {
          content: '';
          position: absolute;
          left: 0; top: 20%; bottom: 20%;
          width: 2px;
          background: var(--accent);
          border-radius: 2px;
        }
        .nav-icon { font-size: 13px; opacity: 0.8; width: 16px; text-align: center; }

        .sidebar-bottom {
          padding: 16px 12px;
          border-top: 1px solid var(--border);
        }
        .signout-btn {
          width: 100%; padding: 8px 12px;
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--border);
          border-radius: 7px;
          color: var(--text3); font-size: 12px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer; transition: all 0.15s;
          font-weight: 500;
        }
        .signout-btn:hover { background: rgba(248,113,113,0.08); border-color: rgba(248,113,113,0.2); color: var(--red); }
        .version-tag { font-size: 10px; color: var(--text3); font-family: 'JetBrains Mono', monospace; margin-top: 8px; padding: 0 4px; }

        /* MAIN */
        .main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

        .topbar {
          padding: 0 32px;
          height: 60px;
          background: var(--bg2);
          border-bottom: 1px solid var(--border);
          display: flex; align-items: center; justify-content: space-between;
          flex-shrink: 0;
        }
        .topbar-left { display: flex; align-items: center; gap: 12px; }
        .topbar-title { font-size: 16px; font-weight: 700; color: var(--text); letter-spacing: -0.3px; }
        .topbar-count {
          font-size: 11px; color: var(--text3);
          background: rgba(255,255,255,0.06);
          border: 1px solid var(--border);
          padding: 2px 8px; border-radius: 20px;
          font-family: 'JetBrains Mono', monospace;
        }

        .btn-add {
          display: inline-flex; align-items: center; gap: 6px;
          background: var(--accent);
          color: #fff; border: none; border-radius: 7px;
          padding: 7px 14px; font-size: 12.5px; font-weight: 600;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer; letter-spacing: -0.1px;
          box-shadow: 0 0 16px var(--accent-glow);
          transition: all 0.15s ease;
        }
        .btn-add:hover { background: var(--accent2); transform: translateY(-1px); box-shadow: 0 4px 20px var(--accent-glow); }

        .scroll-area { flex: 1; overflow-y: auto; padding: 28px 32px; scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.1) transparent; }

        /* STAT CARDS */
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 24px; }
        .stat-card {
          background: var(--bg3);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 18px 20px;
          position: relative; overflow: hidden;
          transition: border-color 0.2s;
        }
        .stat-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
        }
        .stat-card:hover { border-color: var(--border2); }
        .stat-card.accent { border-color: rgba(249,115,22,0.25); background: rgba(249,115,22,0.05); }
        .stat-card.danger { border-color: rgba(248,113,113,0.25); background: rgba(248,113,113,0.05); }
        .stat-card.success { border-color: rgba(74,222,128,0.25); background: rgba(74,222,128,0.05); }
        .stat-label { font-size: 10.5px; font-weight: 600; color: var(--text3); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 10px; }
        .stat-num { font-size: 30px; font-weight: 800; color: var(--text); letter-spacing: -1.5px; line-height: 1; font-family: 'JetBrains Mono', monospace; }
        .stat-card.accent .stat-num { color: var(--accent); }
        .stat-card.danger .stat-num { color: var(--red); }
        .stat-card.success .stat-num { color: var(--green); }
        .stat-sub { font-size: 11px; color: var(--text3); margin-top: 6px; }

        /* TABLE */
        .table-wrap {
          background: var(--bg2);
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
        }
        .table-wrap table { width: 100%; border-collapse: collapse; }
        .table-wrap th {
          padding: 11px 20px;
          font-size: 10.5px; font-weight: 600;
          color: var(--text3); text-transform: uppercase; letter-spacing: 0.7px;
          text-align: left;
          background: rgba(255,255,255,0.02);
          border-bottom: 1px solid var(--border);
          white-space: nowrap;
          min-width: 100px;
        }
        .table-wrap td {
          padding: 12px 20px;
          font-size: 13px; color: var(--text2);
          border-bottom: 1px solid var(--border);
          white-space: nowrap;
          min-width: 100px;
        }
        .table-wrap tr:last-child td { border-bottom: none; }
        .table-wrap tr:hover td { background: rgba(255,255,255,0.025); }
        .td-name { font-weight: 600; color: var(--text) !important; }
        .td-mono { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--text3) !important; }
        .td-money { font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 600; color: var(--text) !important; }
        .td-green { font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 600; color: var(--green) !important; }
        .td-warn { color: var(--red) !important; font-weight: 600; }

        .row-actions { display: flex; gap: 5px; opacity: 0; transition: opacity 0.15s; }
        .table-wrap tr:hover .row-actions { opacity: 1; }
        .btn-sm {
          padding: 4px 10px; border-radius: 5px; border: none;
          font-size: 11px; font-weight: 600; cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif; transition: all 0.15s;
        }
        .btn-sm.edit { background: rgba(255,255,255,0.07); color: var(--text2); }
        .btn-sm.edit:hover { background: rgba(255,255,255,0.12); color: var(--text); }
        .btn-sm.del { background: rgba(248,113,113,0.1); color: var(--red); }
        .btn-sm.del:hover { background: rgba(248,113,113,0.2); }
        .btn-sm.view { background: rgba(96,165,250,0.1); color: var(--blue); }
        .btn-sm.view:hover { background: rgba(96,165,250,0.18); }

        /* PILL BADGES */
        .pill {
          display: inline-flex; align-items: center;
          padding: 3px 9px; border-radius: 20px;
          font-size: 11px; font-weight: 600; letter-spacing: 0.2px;
        }

        /* EMPTY STATE */
        .empty {
          padding: 56px 20px;
          text-align: center;
        }
        .empty-icon { font-size: 24px; opacity: 0.15; margin-bottom: 12px; }
        .empty-title { font-size: 14px; font-weight: 600; color: var(--text3); margin-bottom: 4px; }
        .empty-sub { font-size: 12px; color: var(--text3); opacity: 0.6; }

        /* DASHBOARD GRID */
        .dash-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .dash-card {
          background: var(--bg2);
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
        }
        .dash-card-header {
          padding: 14px 18px;
          border-bottom: 1px solid var(--border);
          display: flex; align-items: center; justify-content: space-between;
        }
        .dash-card-title { font-size: 13px; font-weight: 700; color: var(--text); }
        .dash-card-meta { font-size: 11px; color: var(--text3); font-family: 'JetBrains Mono', monospace; }
        .dash-row {
          padding: 12px 18px;
          border-bottom: 1px solid var(--border);
          display: flex; align-items: center; gap: 12px;
        }
        .dash-row:last-child { border-bottom: none; }
        .dash-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        .dash-row-title { font-size: 13px; font-weight: 600; color: var(--text); margin-bottom: 2px; }
        .dash-row-sub { font-size: 11px; color: var(--text3); }
        .overview-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 10px 18px; border-bottom: 1px solid var(--border);
        }
        .overview-row:last-child { border-bottom: none; }
        .overview-label { font-size: 12.5px; color: var(--text2); }
        .overview-val { font-size: 13px; font-weight: 700; color: var(--text); font-family: 'JetBrains Mono', monospace; }

        /* POST ORDERS */
        .po-layout { display: grid; grid-template-columns: 220px 1fr; gap: 16px; height: calc(100vh - 116px); }
        .po-sitelist {
          background: var(--bg2); border: 1px solid var(--border);
          border-radius: 12px; overflow: hidden; display: flex; flex-direction: column;
        }
        .po-sitelist-header { padding: 12px 16px; border-bottom: 1px solid var(--border); font-size: 10.5px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 0.8px; }
        .po-site-item {
          padding: 12px 16px; cursor: pointer; border-bottom: 1px solid var(--border);
          transition: background 0.15s; position: relative;
        }
        .po-site-item:hover { background: rgba(255,255,255,0.03); }
        .po-site-item.active { background: rgba(249,115,22,0.08); }
        .po-site-item.active::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 2px; background: var(--accent); }
        .po-site-name { font-size: 13px; font-weight: 600; color: var(--text); }
        .po-site-count { font-size: 11px; color: var(--text3); margin-top: 2px; }
        .po-panel { background: var(--bg2); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; }
        .po-panel-header { padding: 16px 20px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
        .po-panel-title { font-size: 15px; font-weight: 700; color: var(--text); }
        .po-panel-sub { font-size: 11px; color: var(--text3); margin-top: 2px; }
        .po-body { flex: 1; overflow-y: auto; padding: 16px 20px; }
        .po-card {
          background: var(--bg3); border: 1px solid var(--border);
          border-radius: 9px; padding: 16px 18px; margin-bottom: 12px;
          transition: border-color 0.15s;
        }
        .po-card:hover { border-color: var(--border2); }
        .po-card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
        .po-card-title { font-size: 13.5px; font-weight: 700; color: var(--text); }
        .po-card-actions { display: flex; gap: 5px; opacity: 0; transition: opacity 0.15s; }
        .po-card:hover .po-card-actions { opacity: 1; }
        .po-card-content { font-size: 13px; color: var(--text2); line-height: 1.65; white-space: pre-wrap; }

        /* BILLING */
        .billing-filter-bar {
          background: var(--bg2); border: 1px solid var(--border);
          border-radius: 10px; padding: 16px 20px;
          display: flex; align-items: flex-end; gap: 16px;
          margin-bottom: 20px; flex-wrap: wrap;
        }
        .filter-group { display: flex; flex-direction: column; gap: 5px; }
        .filter-group label { font-size: 10.5px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 0.7px; }
        .filter-group input, .filter-group select {
          background: var(--bg3); border: 1px solid var(--border);
          border-radius: 7px; padding: 7px 12px;
          color: var(--text); font-size: 13px;
          font-family: 'Plus Jakarta Sans', sans-serif; outline: none;
          transition: border-color 0.15s;
        }
        .filter-group input:focus, .filter-group select:focus { border-color: var(--accent); }
        .filter-group select option { background: var(--bg3); }
        .billing-site-block {
          background: var(--bg2); border: 1px solid var(--border);
          border-radius: 12px; overflow: hidden; margin-bottom: 14px;
        }
        .billing-site-block table { width: 100%; border-collapse: collapse; overflow-x: auto; display: block; }
.billing-site-block th { padding: 11px 20px; font-size: 10.5px; font-weight: 600; color: var(--text3); text-transform: uppercase; letter-spacing: 0.7px; text-align: left; background: rgba(255,255,255,0.02); border-bottom: 1px solid var(--border); white-space: nowrap; }
.billing-site-block td { padding: 12px 20px; font-size: 13px; color: var(--text2); border-bottom: 1px solid var(--border); white-space: nowrap; }
        .billing-site-top {
          padding: 14px 20px; background: rgba(255,255,255,0.02);
          border-bottom: 1px solid var(--border);
          display: flex; align-items: center; justify-content: space-between;
        }
        .billing-site-name { font-size: 14px; font-weight: 700; color: var(--text); }
        .billing-site-meta { font-size: 11px; color: var(--text3); margin-top: 2px; }
        .billing-site-nums { display: flex; gap: 28px; }
        .billing-num { text-align: right; }
        .billing-num-label { font-size: 10px; color: var(--text3); text-transform: uppercase; letter-spacing: 0.5px; }
        .billing-num-val { font-size: 15px; font-weight: 700; font-family: 'JetBrains Mono', monospace; color: var(--text); margin-top: 2px; }
        .billing-num-val.green { color: var(--green); }
        .billing-footer {
          background: linear-gradient(135deg, #1a1f2e 0%, #141820 100%);
          border: 1px solid rgba(249,115,22,0.2);
          border-radius: 12px; padding: 18px 24px;
          display: flex; align-items: center; justify-content: space-between;
          margin-top: 20px;
          box-shadow: 0 0 40px rgba(249,115,22,0.05);
        }
        .billing-footer-label { font-size: 13px; font-weight: 600; color: var(--text2); }
        .billing-footer-nums { display: flex; gap: 36px; }
        .billing-footer-num { text-align: right; }
        .billing-footer-num-label { font-size: 10px; color: var(--text3); text-transform: uppercase; letter-spacing: 0.5px; }
        .billing-footer-num-val { font-size: 20px; font-weight: 800; font-family: 'JetBrains Mono', monospace; color: var(--text); margin-top: 3px; }
        .billing-footer-num-val.green { color: var(--green); }

        /* MODAL */
        .modal-bg {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          z-index: 200;
          animation: fIn 0.15s ease;
        }
        @keyframes fIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes sUp { from { opacity: 0; transform: translateY(12px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .modal {
          background: var(--bg2);
          border: 1px solid var(--border2);
          border-radius: 14px;
          padding: 28px;
          width: 480px;
          box-shadow: 0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04);
          animation: sUp 0.2s ease;
        }
        .modal-wide { width: 560px; }
        .modal-title { font-size: 17px; font-weight: 800; color: var(--text); letter-spacing: -0.4px; margin-bottom: 4px; }
        .modal-sub { font-size: 12.5px; color: var(--text3); margin-bottom: 22px; }
        .field { margin-bottom: 13px; }
        .field label { display: block; font-size: 11px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 0.7px; margin-bottom: 6px; }
        .field input, .field select, .field textarea {
          width: 100%;
          background: var(--bg3);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 9px 13px;
          color: var(--text);
          font-size: 13px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .field input:focus, .field select:focus, .field textarea:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(249,115,22,0.1);
        }
        .field select option { background: var(--bg3); }
        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px; }
        .btn-cancel {
          padding: 8px 16px; border-radius: 7px;
          border: 1px solid var(--border); background: transparent;
          color: var(--text2); font-size: 13px; font-weight: 500;
          font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer;
          transition: all 0.15s;
        }
        .btn-cancel:hover { background: rgba(255,255,255,0.05); color: var(--text); }
        .btn-save {
          padding: 8px 18px; border-radius: 7px; border: none;
          background: var(--accent); color: #fff;
          font-size: 13px; font-weight: 600;
          font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer;
          box-shadow: 0 0 16px var(--accent-glow);
          transition: all 0.15s;
        }
        .btn-save:hover { background: var(--accent2); transform: translateY(-1px); }

        .report-block { margin-bottom: 16px; }
        .report-block-label { font-size: 10.5px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 0.7px; margin-bottom: 8px; }
        .report-block-content { background: var(--bg3); border: 1px solid var(--border); border-radius: 8px; padding: 12px 14px; font-size: 13.5px; color: var(--text2); line-height: 1.65; white-space: pre-wrap; }
      `}</style>

      <div className="app">
        {/* SIDEBAR */}
        <div className="sidebar">
          <div className="sidebar-logo">
            <div className="logo-row">
              <div className="logo-badge">⚡</div>
              <div>
                <div className="logo-name">Sentinel</div>
                <div className="logo-tagline">Security Platform</div>
              </div>
            </div>
          </div>

          <nav className="sidebar-nav">
            {navGroups.map(group => (
              <div key={group.label} className="nav-group">
                <div className="nav-group-label">{group.label}</div>
                {group.items.map(item => (
                  <button key={item.id} className={`nav-btn${activeNav === item.id ? ' active' : ''}`} onClick={() => setActiveNav(item.id)}>
                    <span className="nav-icon">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            ))}
          </nav>

          <div className="sidebar-bottom">
            <button className="signout-btn" onClick={async () => { await supabase.auth.signOut(); window.location.href = '/login' }}>
              Sign out
            </button>
            <div className="version-tag">v0.1.0</div>
          </div>
        </div>

        {/* MAIN */}
        <div className="main">
          <div className="topbar">
            <div className="topbar-left">
              <span className="topbar-title">{navGroups.flatMap(g => g.items).find(n => n.id === activeNav)?.label}</span>
              {activeNav === 'schedule' && <span className="topbar-count">{shifts.length}</span>}
              {activeNav === 'guards' && <span className="topbar-count">{guards.length}</span>}
              {activeNav === 'sites' && <span className="topbar-count">{sites.length}</span>}
              {activeNav === 'incidents' && <span className="topbar-count">{incidents.length}</span>}
              {activeNav === 'postorders' && <span className="topbar-count">{postOrders.length}</span>}
              {activeNav === 'reports' && <span className="topbar-count">{activityReports.length}</span>}
            </div>
            {activeNav === 'schedule' && <button className="btn-add" onClick={() => setShowAddShift(true)}>+ Add Shift</button>}
            {activeNav === 'guards' && <button className="btn-add" onClick={() => setShowAddGuard(true)}>+ Add Guard</button>}
            {activeNav === 'sites' && <button className="btn-add" onClick={() => setShowAddSite(true)}>+ Add Site</button>}
            {activeNav === 'incidents' && <button className="btn-add" onClick={() => setShowAddIncident(true)}>+ Log Incident</button>}
            {activeNav === 'postorders' && selectedSiteId && <button className="btn-add" onClick={() => setShowAddPostOrder(true)}>+ Add Order</button>}
            {activeNav === 'reports' && <button className="btn-add" onClick={() => setShowAddReport(true)}>+ Submit Report</button>}
          </div>

          <div className="scroll-area">
            {loading && <div style={{ color: 'var(--text3)', fontSize: 13 }}>Loading...</div>}

            {/* DASHBOARD */}
            {!loading && activeNav === 'dashboard' && (
              <div>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-label">Guards</div>
                    <div className="stat-num">{guards.length}</div>
                    <div className="stat-sub">{guards.filter(g => g.status === 'active').length} active</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Sites</div>
                    <div className="stat-num">{sites.length}</div>
                    <div className="stat-sub">{sites.filter(s => s.status === 'active').length} active</div>
                  </div>
                  <div className={`stat-card${openIncidents.length > 0 ? ' accent' : ''}`}>
                    <div className="stat-label">Open Incidents</div>
                    <div className="stat-num">{openIncidents.length}</div>
                    <div className="stat-sub">Needs attention</div>
                  </div>
                  <div className={`stat-card${expiringGuards.length > 0 ? ' danger' : ''}`}>
                    <div className="stat-label">Expiring Licenses</div>
                    <div className="stat-num">{expiringGuards.length}</div>
                    <div className="stat-sub">Within 30 days</div>
                  </div>
                </div>

                <div className="dash-grid">
                  <div className="dash-card">
                    <div className="dash-card-header">
                      <div className="dash-card-title">Today's Shifts</div>
                      <div className="dash-card-meta">{todayShifts.length} scheduled</div>
                    </div>
                    {todayShifts.length === 0 ? <div className="empty"><div className="empty-icon">⊟</div><div className="empty-title">No shifts today</div></div>
                    : todayShifts.map(s => (
                      <div key={s.id} className="dash-row">
                        <div className="dash-dot" style={{ background: s.shift_type === 'night' ? '#a78bfa' : '#f97316' }} />
                        <div style={{ flex: 1 }}>
                          <div className="dash-row-title">{s.guards?.name || 'Unassigned'}</div>
                          <div className="dash-row-sub">{s.sites?.name} · {fmtTime(s.start_time)} – {fmtTime(s.end_time)}</div>
                        </div>
                        <span className="pill" style={shiftPill[s.shift_type]}>{s.shift_type}</span>
                      </div>
                    ))}
                  </div>

                  <div className="dash-card">
                    <div className="dash-card-header">
                      <div className="dash-card-title">Recent Incidents</div>
                      <div className="dash-card-meta">{openIncidents.length} open</div>
                    </div>
                    {incidents.length === 0 ? <div className="empty"><div className="empty-icon">⚠</div><div className="empty-title">All clear</div></div>
                    : incidents.slice(0,5).map(i => (
                      <div key={i.id} className="dash-row">
                        <div className="dash-dot" style={{ background: i.severity === 'high' ? '#f87171' : i.severity === 'medium' ? '#facc15' : '#4ade80' }} />
                        <div style={{ flex: 1 }}>
                          <div className="dash-row-title">{i.title}</div>
                          <div className="dash-row-sub">{i.sites?.name || 'No site'} · {fmtDate(i.created_at)}</div>
                        </div>
                        <span className="pill" style={sevPill[i.severity]}>{i.severity}</span>
                      </div>
                    ))}
                  </div>

                  <div className="dash-card">
                    <div className="dash-card-header">
                      <div className="dash-card-title">License Alerts</div>
                      <div className="dash-card-meta">{expiringGuards.length} expiring</div>
                    </div>
                    {expiringGuards.length === 0 ? <div className="empty"><div className="empty-icon">⊕</div><div className="empty-title">All licenses valid</div></div>
                    : expiringGuards.map(g => {
                      const diff = Math.ceil((new Date(g.license_expiry).getTime()-today.getTime())/(1000*60*60*24))
                      return (
                        <div key={g.id} className="dash-row">
                          <div className="dash-dot" style={{ background: diff <= 7 ? '#f87171' : '#facc15' }} />
                          <div style={{ flex: 1 }}>
                            <div className="dash-row-title">{g.name}</div>
                            <div className="dash-row-sub">Expires {g.license_expiry}</div>
                          </div>
                          <span className="pill" style={{ background: diff<=7?'rgba(248,113,113,0.12)':'rgba(250,204,21,0.12)', color: diff<=7?'#f87171':'#facc15' }}>
                            {diff <= 0 ? 'Expired' : `${diff}d`}
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  <div className="dash-card">
                    <div className="dash-card-header"><div className="dash-card-title">Overview</div></div>
                    {[
                      { label: 'Total shifts', value: shifts.length },
                      { label: 'Day shifts', value: shifts.filter(s=>s.shift_type==='day').length },
                      { label: 'Night shifts', value: shifts.filter(s=>s.shift_type==='night').length },
                      { label: 'Total incidents', value: incidents.length },
                      { label: 'Activity reports', value: activityReports.length },
                      { label: 'High severity', value: incidents.filter(i=>i.severity==='high').length },
                    ].map(r => (
                      <div key={r.label} className="overview-row">
                        <span className="overview-label">{r.label}</span>
                        <span className="overview-val">{r.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SCHEDULE */}
            {!loading && activeNav === 'schedule' && (
              <>
                <div className="stats-grid" style={{ marginBottom: 20 }}>
                  <div className="stat-card"><div className="stat-label">Total</div><div className="stat-num">{shifts.length}</div></div>
                  <div className="stat-card"><div className="stat-label">Day</div><div className="stat-num">{shifts.filter(s=>s.shift_type==='day').length}</div></div>
                  <div className="stat-card"><div className="stat-label">Night</div><div className="stat-num">{shifts.filter(s=>s.shift_type==='night').length}</div></div>
                  <div className="stat-card"><div className="stat-label">Active Guards</div><div className="stat-num">{guards.filter(g=>g.status==='active').length}</div></div>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead><tr>{['Guard','Site','Type','Start','End','Pay','Bill','Status',''].map(h=><th key={h}>{h}</th>)}</tr></thead>
                    <tbody>
                      {shifts.length===0 && <tr><td colSpan={9}><div className="empty"><div className="empty-icon">⊟</div><div className="empty-title">No shifts yet</div></div></td></tr>}
                      {shifts.map(s=>(
                        <tr key={s.id}>
                          <td className="td-name">{s.guards?.name||'—'}</td>
                          <td>{s.sites?.name||'—'}</td>
                          <td><span className="pill" style={shiftPill[s.shift_type]}>{s.shift_type}</span></td>
                          <td className="td-mono">{fmtDateTime(s.start_time)}</td>
                          <td className="td-mono">{fmtDateTime(s.end_time)}</td>
                          <td className="td-mono">${s.pay_rate}/hr</td>
                          <td className="td-mono">${s.bill_rate}/hr</td>
                          <td><span className="pill" style={{background:'rgba(74,222,128,0.1)',color:'#4ade80'}}>{s.status}</span></td>
                          <td><div className="row-actions"><button className="btn-sm edit" onClick={()=>setEditingShift(s)}>Edit</button><button className="btn-sm del" onClick={()=>deleteShift(s.id)}>Del</button></div></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* GUARDS */}
            {!loading && activeNav === 'guards' && (
              <div className="table-wrap">
                <table>
                  <thead><tr>{['Name','Email','Phone','License #','Expiry','Status',''].map(h=><th key={h}>{h}</th>)}</tr></thead>
                  <tbody>
                    {guards.length===0 && <tr><td colSpan={7}><div className="empty"><div className="empty-icon">⊕</div><div className="empty-title">No guards yet</div></div></td></tr>}
                    {guards.map(g=>{
                      const exp = g.license_expiry && new Date(g.license_expiry)<new Date()
                      return(
                        <tr key={g.id}>
                          <td className="td-name">{g.name}</td>
                          <td className="td-mono">{g.email||'—'}</td>
                          <td className="td-mono">{g.phone||'—'}</td>
                          <td className="td-mono">{g.license_number||'—'}</td>
                          <td className={exp?'td-warn':'td-mono'}>{g.license_expiry||'—'}{exp?' ⚠':''}</td>
                          <td><span className="pill" style={{background:'rgba(74,222,128,0.1)',color:'#4ade80'}}>{g.status}</span></td>
                          <td><div className="row-actions"><button className="btn-sm edit" onClick={()=>setEditingGuard(g)}>Edit</button><button className="btn-sm del" onClick={()=>deleteGuard(g.id)}>Del</button></div></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* SITES */}
            {!loading && activeNav === 'sites' && (
              <div className="table-wrap">
                <table>
                  <thead><tr>{['Name','Address','Contact','Phone','Status',''].map(h=><th key={h}>{h}</th>)}</tr></thead>
                  <tbody>
                    {sites.length===0 && <tr><td colSpan={6}><div className="empty"><div className="empty-icon">⊠</div><div className="empty-title">No sites yet</div></div></td></tr>}
                    {sites.map(s=>(
                      <tr key={s.id}>
                        <td className="td-name">{s.name}</td>
                        <td>{s.address||'—'}</td>
                        <td>{s.contact_name||'—'}</td>
                        <td className="td-mono">{s.contact_phone||'—'}</td>
                        <td><span className="pill" style={{background:'rgba(74,222,128,0.1)',color:'#4ade80'}}>{s.status}</span></td>
                        <td><div className="row-actions"><button className="btn-sm edit" onClick={()=>setEditingSite(s)}>Edit</button><button className="btn-sm del" onClick={()=>deleteSite(s.id)}>Del</button></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* POST ORDERS */}
            {!loading && activeNav === 'postorders' && (
              <div className="po-layout">
                <div className="po-sitelist">
                  <div className="po-sitelist-header">Sites</div>
                  {sites.map(s=>(
                    <div key={s.id} className={`po-site-item${selectedSiteId===s.id?' active':''}`} onClick={()=>setSelectedSiteId(s.id)}>
                      <div className="po-site-name">{s.name}</div>
                      <div className="po-site-count">{postOrders.filter(po=>po.site_id===s.id).length} orders</div>
                    </div>
                  ))}
                </div>
                <div className="po-panel">
                  {!selectedSite ? <div className="empty"><div className="empty-title">Select a site</div></div> : (
                    <>
                      <div className="po-panel-header">
                        <div>
                          <div className="po-panel-title">{selectedSite.name}</div>
                          <div className="po-panel-sub">{sitePostOrders.length} post orders · {selectedSite.address||'No address'}</div>
                        </div>
                      </div>
                      <div className="po-body">
                        {sitePostOrders.length===0 && <div className="empty"><div className="empty-icon">≡</div><div className="empty-title">No orders yet</div><div className="empty-sub">Click + Add Order above</div></div>}
                        {sitePostOrders.map(po=>(
                          <div key={po.id} className="po-card">
                            <div className="po-card-top">
                              <div style={{display:'flex',alignItems:'center',gap:8}}>
                                <div className="po-card-title">{po.title}</div>
                                <span className="pill" style={catPill[po.category]||{background:'rgba(255,255,255,0.08)',color:'var(--text3)'}}>{po.category}</span>
                              </div>
                              <div className="po-card-actions">
                                <button className="btn-sm edit" onClick={()=>setEditingPostOrder(po)}>Edit</button>
                                <button className="btn-sm del" onClick={()=>deletePostOrder(po.id)}>Del</button>
                              </div>
                            </div>
                            <div className="po-card-content">{po.content}</div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* ACTIVITY REPORTS */}
            {!loading && activeNav === 'reports' && (
              <div className="table-wrap">
                <table>
                  <thead><tr>{['Guard','Site','Shift Date','Summary','Submitted',''].map(h=><th key={h}>{h}</th>)}</tr></thead>
                  <tbody>
                    {activityReports.length===0 && <tr><td colSpan={6}><div className="empty"><div className="empty-icon">◈</div><div className="empty-title">No reports yet</div></div></td></tr>}
                    {activityReports.map(r=>(
                      <tr key={r.id}>
                        <td className="td-name">{r.guards?.name||'—'}</td>
                        <td>{r.sites?.name||'—'}</td>
                        <td className="td-mono">{r.shifts?fmtDate(r.shifts.start_time):'—'}</td>
                        <td style={{maxWidth:260}}><div style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.summary}</div></td>
                        <td className="td-mono">{fmtDate(r.created_at)}</td>
                        <td><div className="row-actions"><button className="btn-sm view" onClick={()=>setViewingReport(r)}>View</button><button className="btn-sm del" onClick={()=>deleteReport(r.id)}>Del</button></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* INCIDENTS */}
            {!loading && activeNav === 'incidents' && (
              <div className="table-wrap">
                <table>
                  <thead><tr>{['Title','Site','Severity','Status','Date',''].map(h=><th key={h}>{h}</th>)}</tr></thead>
                  <tbody>
                    {incidents.length===0 && <tr><td colSpan={6}><div className="empty"><div className="empty-icon">⚠</div><div className="empty-title">No incidents</div></div></td></tr>}
                    {incidents.map(i=>(
                      <tr key={i.id}>
                        <td className="td-name">{i.title}</td>
                        <td>{i.sites?.name||'—'}</td>
                        <td><span className="pill" style={sevPill[i.severity]}>{i.severity}</span></td>
                        <td><span className="pill" style={{background:'rgba(249,115,22,0.1)',color:'var(--accent)'}}>{i.status}</span></td>
                        <td className="td-mono">{fmtDate(i.created_at)}</td>
                        <td><div className="row-actions"><button className="btn-sm edit" onClick={()=>setEditingIncident(i)}>Edit</button><button className="btn-sm del" onClick={()=>deleteIncident(i.id)}>Del</button></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* BILLING */}
            {!loading && activeNav === 'billing' && (
              <div>
                <div className="billing-filter-bar">
                  <div className="filter-group"><label>From</label><input type="date" value={billingStart} onChange={e=>setBillingStart(e.target.value)} /></div>
                  <div className="filter-group"><label>To</label><input type="date" value={billingEnd} onChange={e=>setBillingEnd(e.target.value)} /></div>
                  <div className="filter-group"><label>Site</label>
                    <select value={billingSiteFilter} onChange={e=>setBillingSiteFilter(e.target.value)}>
                      <option value="all">All Sites</option>
                      {sites.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div style={{marginLeft:'auto',textAlign:'right'}}>
                    <div style={{fontSize:11,color:'var(--text3)'}}>{billingShifts.length} shifts · {grandHrs.toFixed(1)} hrs</div>
                  </div>
                </div>

                <div className="stats-grid" style={{marginBottom:20}}>
                  <div className="stat-card"><div className="stat-label">Total Billable</div><div className="stat-num" style={{fontSize:20}}>{fmt$(grandBill)}</div><div className="stat-sub">Client invoices</div></div>
                  <div className="stat-card"><div className="stat-label">Total Payroll</div><div className="stat-num" style={{fontSize:20}}>{fmt$(grandPay)}</div><div className="stat-sub">Guard wages</div></div>
                  <div className="stat-card success"><div className="stat-label">Gross Margin</div><div className="stat-num" style={{fontSize:20}}>{fmt$(grandBill-grandPay)}</div><div className="stat-sub">{grandBill>0?((grandBill-grandPay)/grandBill*100).toFixed(1):0}%</div></div>
                  <div className="stat-card"><div className="stat-label">Hours</div><div className="stat-num" style={{fontSize:20}}>{grandHrs.toFixed(1)}</div><div className="stat-sub">Across {billingBySite.length} sites</div></div>
                </div>

                {billingBySite.length===0 && <div className="table-wrap"><div className="empty"><div className="empty-icon">◆</div><div className="empty-title">No shifts in range</div><div className="empty-sub">Adjust the date filters</div></div></div>}
                {billingBySite.map(row=>(
                  <div key={row.site.id} className="billing-site-block">
                    <div className="billing-site-top">
                      <div>
                        <div className="billing-site-name">{row.site.name}</div>
                        <div className="billing-site-meta">{row.shifts.length} shifts · {row.totalHours.toFixed(1)} hrs · {row.site.contact_name||'No contact'}</div>
                      </div>
                      <div className="billing-site-nums">
                        <div className="billing-num"><div className="billing-num-label">Billable</div><div className="billing-num-val">{fmt$(row.totalBillable)}</div></div>
                        <div className="billing-num"><div className="billing-num-label">Payroll</div><div className="billing-num-val">{fmt$(row.totalPayroll)}</div></div>
                        <div className="billing-num"><div className="billing-num-label">Margin</div><div className="billing-num-val green">{fmt$(row.margin)}</div></div>
                      </div>
                    </div>
                    <table>
                      <thead><tr>{['Guard','Date','Type','Hours','Bill Rate','Billable','Pay Rate','Payroll'].map(h=><th key={h}>{h}</th>)}</tr></thead>
                      <tbody>
                        {row.shifts.map(s=>{
                          const hrs=(new Date(s.end_time).getTime()-new Date(s.start_time).getTime())/(1000*60*60)
                          return(
                            <tr key={s.id}>
                              <td className="td-name">{s.guards?.name||'—'}</td>
                              <td className="td-mono">{fmtDate(s.start_time)}</td>
                              <td><span className="pill" style={shiftPill[s.shift_type]}>{s.shift_type}</span></td>
                              <td className="td-mono">{hrs.toFixed(1)}h</td>
                              <td className="td-mono">${s.bill_rate}/hr</td>
                              <td className="td-money">{fmt$(hrs*s.bill_rate)}</td>
                              <td className="td-mono">${s.pay_rate}/hr</td>
                              <td className="td-mono">{fmt$(hrs*s.pay_rate)}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                ))}

                {billingBySite.length>0 && (
                  <div className="billing-footer">
                    <div className="billing-footer-label">Grand Total · {fmtDate(billingStart)} – {new Date(billingEnd).toLocaleDateString([],{month:'short',day:'numeric',year:'numeric'})}</div>
                    <div className="billing-footer-nums">
                      <div className="billing-footer-num"><div className="billing-footer-num-label">Hours</div><div className="billing-footer-num-val">{grandHrs.toFixed(1)}</div></div>
                      <div className="billing-footer-num"><div className="billing-footer-num-label">Payroll</div><div className="billing-footer-num-val">{fmt$(grandPay)}</div></div>
                      <div className="billing-footer-num"><div className="billing-footer-num-label">Billable</div><div className="billing-footer-num-val">{fmt$(grandBill)}</div></div>
                      <div className="billing-footer-num"><div className="billing-footer-num-label">Margin</div><div className="billing-footer-num-val green">{fmt$(grandBill-grandPay)}</div></div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ---- MODALS ---- */}
        {showAddGuard && <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setShowAddGuard(false)}><div className="modal">
          <div className="modal-title">Add Guard</div><div className="modal-sub">Enter guard details</div>
          <div className="field"><label>Full Name *</label><input placeholder="John Smith" value={guardForm.name} onChange={e=>setGuardForm({...guardForm,name:e.target.value})} /></div>
          <div className="field"><label>Email</label><input placeholder="john@example.com" value={guardForm.email} onChange={e=>setGuardForm({...guardForm,email:e.target.value})} /></div>
          <div className="field"><label>Phone</label><input placeholder="(555) 000-0000" value={guardForm.phone} onChange={e=>setGuardForm({...guardForm,phone:e.target.value})} /></div>
          <div className="two-col">
            <div className="field"><label>License #</label><input placeholder="LIC-00000" value={guardForm.license_number} onChange={e=>setGuardForm({...guardForm,license_number:e.target.value})} /></div>
            <div className="field"><label>License Expiry</label><input type="date" value={guardForm.license_expiry} onChange={e=>setGuardForm({...guardForm,license_expiry:e.target.value})} /></div>
          </div>
          <div className="modal-actions"><button className="btn-cancel" onClick={()=>setShowAddGuard(false)}>Cancel</button><button className="btn-save" onClick={addGuard}>Add Guard</button></div>
        </div></div>}

        {showAddSite && <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setShowAddSite(false)}><div className="modal">
          <div className="modal-title">Add Site</div><div className="modal-sub">Enter site information</div>
          <div className="field"><label>Site Name *</label><input placeholder="Downtown Office Tower" value={siteForm.name} onChange={e=>setSiteForm({...siteForm,name:e.target.value})} /></div>
          <div className="field"><label>Address</label><input placeholder="123 Main St, New York, NY" value={siteForm.address} onChange={e=>setSiteForm({...siteForm,address:e.target.value})} /></div>
          <div className="two-col">
            <div className="field"><label>Contact Name</label><input placeholder="Jane Doe" value={siteForm.contact_name} onChange={e=>setSiteForm({...siteForm,contact_name:e.target.value})} /></div>
            <div className="field"><label>Contact Phone</label><input placeholder="(555) 000-0000" value={siteForm.contact_phone} onChange={e=>setSiteForm({...siteForm,contact_phone:e.target.value})} /></div>
          </div>
          <div className="modal-actions"><button className="btn-cancel" onClick={()=>setShowAddSite(false)}>Cancel</button><button className="btn-save" onClick={addSite}>Add Site</button></div>
        </div></div>}

        {showAddShift && <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setShowAddShift(false)}><div className="modal">
          <div className="modal-title">Schedule Shift</div><div className="modal-sub">Assign a guard to a site</div>
          <div className="two-col">
            <div className="field"><label>Guard *</label><select value={shiftForm.guard_id} onChange={e=>setShiftForm({...shiftForm,guard_id:e.target.value})}><option value="">Select guard</option>{guards.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select></div>
            <div className="field"><label>Site *</label><select value={shiftForm.site_id} onChange={e=>setShiftForm({...shiftForm,site_id:e.target.value})}><option value="">Select site</option>{sites.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
          </div>
          <div className="field"><label>Type</label><select value={shiftForm.shift_type} onChange={e=>setShiftForm({...shiftForm,shift_type:e.target.value})}><option value="day">Day</option><option value="swing">Swing</option><option value="night">Night</option></select></div>
          <div className="two-col">
            <div className="field"><label>Start *</label><input type="datetime-local" value={shiftForm.start_time} onChange={e=>setShiftForm({...shiftForm,start_time:e.target.value})} /></div>
            <div className="field"><label>End *</label><input type="datetime-local" value={shiftForm.end_time} onChange={e=>setShiftForm({...shiftForm,end_time:e.target.value})} /></div>
          </div>
          <div className="two-col">
            <div className="field"><label>Pay Rate ($/hr)</label><input placeholder="18.00" value={shiftForm.pay_rate} onChange={e=>setShiftForm({...shiftForm,pay_rate:e.target.value})} /></div>
            <div className="field"><label>Bill Rate ($/hr)</label><input placeholder="32.00" value={shiftForm.bill_rate} onChange={e=>setShiftForm({...shiftForm,bill_rate:e.target.value})} /></div>
          </div>
          <div className="modal-actions"><button className="btn-cancel" onClick={()=>setShowAddShift(false)}>Cancel</button><button className="btn-save" onClick={addShift}>Schedule</button></div>
        </div></div>}

        {showAddIncident && <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setShowAddIncident(false)}><div className="modal">
          <div className="modal-title">Log Incident</div><div className="modal-sub">Document a security event</div>
          <div className="field"><label>Title *</label><input placeholder="Unauthorized access attempt" value={incidentForm.title} onChange={e=>setIncidentForm({...incidentForm,title:e.target.value})} /></div>
          <div className="field"><label>Description</label><textarea style={{height:80,resize:'none'}} placeholder="What happened..." value={incidentForm.description} onChange={e=>setIncidentForm({...incidentForm,description:e.target.value})} /></div>
          <div className="two-col">
            <div className="field"><label>Severity</label><select value={incidentForm.severity} onChange={e=>setIncidentForm({...incidentForm,severity:e.target.value})}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div>
            <div className="field"><label>Site</label><select value={incidentForm.site_id} onChange={e=>setIncidentForm({...incidentForm,site_id:e.target.value})}><option value="">Select site</option>{sites.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
          </div>
          <div className="field"><label>Guard Involved</label><select value={incidentForm.guard_id} onChange={e=>setIncidentForm({...incidentForm,guard_id:e.target.value})}><option value="">Select guard</option>{guards.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select></div>
          <div className="modal-actions"><button className="btn-cancel" onClick={()=>setShowAddIncident(false)}>Cancel</button><button className="btn-save" onClick={addIncident}>Log Incident</button></div>
        </div></div>}

        {showAddPostOrder && <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setShowAddPostOrder(false)}><div className="modal">
          <div className="modal-title">Add Post Order</div><div className="modal-sub">Instructions for guards at {selectedSite?.name}</div>
          <div className="field"><label>Title *</label><input placeholder="Access Control Procedures" value={postOrderForm.title} onChange={e=>setPostOrderForm({...postOrderForm,title:e.target.value})} /></div>
          <div className="field"><label>Category</label><select value={postOrderForm.category} onChange={e=>setPostOrderForm({...postOrderForm,category:e.target.value})}><option value="general">General</option><option value="access">Access Control</option><option value="emergency">Emergency</option><option value="patrol">Patrol</option><option value="reporting">Reporting</option></select></div>
          <div className="field"><label>Instructions *</label><textarea style={{height:140,resize:'vertical'}} placeholder="Detailed instructions for guards..." value={postOrderForm.content} onChange={e=>setPostOrderForm({...postOrderForm,content:e.target.value})} /></div>
          <div className="modal-actions"><button className="btn-cancel" onClick={()=>setShowAddPostOrder(false)}>Cancel</button><button className="btn-save" onClick={addPostOrder}>Add Order</button></div>
        </div></div>}

        {showAddReport && <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setShowAddReport(false)}><div className="modal">
          <div className="modal-title">Submit Activity Report</div><div className="modal-sub">End of shift report</div>
          <div className="field"><label>Shift *</label><select value={reportForm.shift_id} onChange={e=>setReportForm({...reportForm,shift_id:e.target.value})}><option value="">Select shift</option>{shifts.map(s=><option key={s.id} value={s.id}>{s.guards?.name} — {s.sites?.name} ({fmtDate(s.start_time)})</option>)}</select></div>
          <div className="field"><label>Activity Summary *</label><textarea style={{height:100,resize:'vertical'}} placeholder="Describe all activity during the shift..." value={reportForm.summary} onChange={e=>setReportForm({...reportForm,summary:e.target.value})} /></div>
          <div className="field"><label>Additional Observations</label><textarea style={{height:70,resize:'vertical'}} placeholder="Any other notes..." value={reportForm.observations} onChange={e=>setReportForm({...reportForm,observations:e.target.value})} /></div>
          <div className="modal-actions"><button className="btn-cancel" onClick={()=>setShowAddReport(false)}>Cancel</button><button className="btn-save" onClick={addReport}>Submit</button></div>
        </div></div>}

        {viewingReport && <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setViewingReport(null)}><div className="modal modal-wide">
          <div className="modal-title">Activity Report</div>
          <div style={{display:'flex',gap:20,marginBottom:20,flexWrap:'wrap'}}>
            {[['Guard',viewingReport.guards?.name],['Site',viewingReport.sites?.name],['Submitted',new Date(viewingReport.created_at).toLocaleString()]].map(([l,v])=>(
              <div key={l as string} style={{fontSize:12,color:'var(--text3)'}}>{l}: <strong style={{color:'var(--text2)'}}>{v||'—'}</strong></div>
            ))}
          </div>
          <div className="report-block"><div className="report-block-label">Activity Summary</div><div className="report-block-content">{viewingReport.summary}</div></div>
          {viewingReport.observations && <div className="report-block"><div className="report-block-label">Additional Observations</div><div className="report-block-content">{viewingReport.observations}</div></div>}
          <div className="modal-actions"><button className="btn-cancel" onClick={()=>setViewingReport(null)}>Close</button></div>
        </div></div>}

        {editingGuard && <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setEditingGuard(null)}><div className="modal">
          <div className="modal-title">Edit Guard</div><div className="modal-sub">Update guard information</div>
          <div className="field"><label>Full Name *</label><input value={editingGuard.name} onChange={e=>setEditingGuard({...editingGuard,name:e.target.value})} /></div>
          <div className="field"><label>Email</label><input value={editingGuard.email||''} onChange={e=>setEditingGuard({...editingGuard,email:e.target.value})} /></div>
          <div className="field"><label>Phone</label><input value={editingGuard.phone||''} onChange={e=>setEditingGuard({...editingGuard,phone:e.target.value})} /></div>
          <div className="two-col">
            <div className="field"><label>License #</label><input value={editingGuard.license_number||''} onChange={e=>setEditingGuard({...editingGuard,license_number:e.target.value})} /></div>
            <div className="field"><label>License Expiry</label><input type="date" value={editingGuard.license_expiry||''} onChange={e=>setEditingGuard({...editingGuard,license_expiry:e.target.value})} /></div>
          </div>
          <div className="modal-actions"><button className="btn-cancel" onClick={()=>setEditingGuard(null)}>Cancel</button><button className="btn-save" onClick={saveGuard}>Save</button></div>
        </div></div>}

        {editingSite && <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setEditingSite(null)}><div className="modal">
          <div className="modal-title">Edit Site</div><div className="modal-sub">Update site information</div>
          <div className="field"><label>Site Name *</label><input value={editingSite.name} onChange={e=>setEditingSite({...editingSite,name:e.target.value})} /></div>
          <div className="field"><label>Address</label><input value={editingSite.address||''} onChange={e=>setEditingSite({...editingSite,address:e.target.value})} /></div>
          <div className="two-col">
            <div className="field"><label>Contact Name</label><input value={editingSite.contact_name||''} onChange={e=>setEditingSite({...editingSite,contact_name:e.target.value})} /></div>
            <div className="field"><label>Contact Phone</label><input value={editingSite.contact_phone||''} onChange={e=>setEditingSite({...editingSite,contact_phone:e.target.value})} /></div>
          </div>
          <div className="modal-actions"><button className="btn-cancel" onClick={()=>setEditingSite(null)}>Cancel</button><button className="btn-save" onClick={saveSite}>Save</button></div>
        </div></div>}

        {editingShift && <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setEditingShift(null)}><div className="modal">
          <div className="modal-title">Edit Shift</div><div className="modal-sub">Update shift details</div>
          <div className="two-col">
            <div className="field"><label>Guard</label><select value={editingShift.guard_id} onChange={e=>setEditingShift({...editingShift,guard_id:e.target.value})}>{guards.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select></div>
            <div className="field"><label>Site</label><select value={editingShift.site_id} onChange={e=>setEditingShift({...editingShift,site_id:e.target.value})}>{sites.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
          </div>
          <div className="field"><label>Type</label><select value={editingShift.shift_type} onChange={e=>setEditingShift({...editingShift,shift_type:e.target.value})}><option value="day">Day</option><option value="swing">Swing</option><option value="night">Night</option></select></div>
          <div className="two-col">
            <div className="field"><label>Start</label><input type="datetime-local" value={editingShift.start_time?.slice(0,16)} onChange={e=>setEditingShift({...editingShift,start_time:e.target.value})} /></div>
            <div className="field"><label>End</label><input type="datetime-local" value={editingShift.end_time?.slice(0,16)} onChange={e=>setEditingShift({...editingShift,end_time:e.target.value})} /></div>
          </div>
          <div className="two-col">
            <div className="field"><label>Pay Rate</label><input value={editingShift.pay_rate} onChange={e=>setEditingShift({...editingShift,pay_rate:parseFloat(e.target.value)})} /></div>
            <div className="field"><label>Bill Rate</label><input value={editingShift.bill_rate} onChange={e=>setEditingShift({...editingShift,bill_rate:parseFloat(e.target.value)})} /></div>
          </div>
          <div className="modal-actions"><button className="btn-cancel" onClick={()=>setEditingShift(null)}>Cancel</button><button className="btn-save" onClick={saveShift}>Save</button></div>
        </div></div>}

        {editingIncident && <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setEditingIncident(null)}><div className="modal">
          <div className="modal-title">Edit Incident</div><div className="modal-sub">Update incident details</div>
          <div className="field"><label>Title *</label><input value={editingIncident.title} onChange={e=>setEditingIncident({...editingIncident,title:e.target.value})} /></div>
          <div className="field"><label>Description</label><textarea style={{height:80,resize:'none'}} value={editingIncident.description||''} onChange={e=>setEditingIncident({...editingIncident,description:e.target.value})} /></div>
          <div className="two-col">
            <div className="field"><label>Severity</label><select value={editingIncident.severity} onChange={e=>setEditingIncident({...editingIncident,severity:e.target.value})}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div>
            <div className="field"><label>Status</label><select value={editingIncident.status} onChange={e=>setEditingIncident({...editingIncident,status:e.target.value})}><option value="open">Open</option><option value="resolved">Resolved</option><option value="closed">Closed</option></select></div>
          </div>
          <div className="modal-actions"><button className="btn-cancel" onClick={()=>setEditingIncident(null)}>Cancel</button><button className="btn-save" onClick={saveIncident}>Save</button></div>
        </div></div>}

        {editingPostOrder && <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setEditingPostOrder(null)}><div className="modal">
          <div className="modal-title">Edit Post Order</div><div className="modal-sub">Update guard instructions</div>
          <div className="field"><label>Title *</label><input value={editingPostOrder.title} onChange={e=>setEditingPostOrder({...editingPostOrder,title:e.target.value})} /></div>
          <div className="field"><label>Category</label><select value={editingPostOrder.category} onChange={e=>setEditingPostOrder({...editingPostOrder,category:e.target.value})}><option value="general">General</option><option value="access">Access Control</option><option value="emergency">Emergency</option><option value="patrol">Patrol</option><option value="reporting">Reporting</option></select></div>
          <div className="field"><label>Instructions *</label><textarea style={{height:140,resize:'vertical'}} value={editingPostOrder.content} onChange={e=>setEditingPostOrder({...editingPostOrder,content:e.target.value})} /></div>
          <div className="modal-actions"><button className="btn-cancel" onClick={()=>setEditingPostOrder(null)}>Cancel</button><button className="btn-save" onClick={savePostOrder}>Save</button></div>
        </div></div>}
      </div>
    </>
  )
}
