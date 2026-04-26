'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

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
interface Availability {
  id: string; guard_id: string; date: string; reason: string
  guards?: { name: string }
}
interface Client {
  id: string; name: string; email: string; site_id: string
}
interface Checkpoint {
  id: string; site_id: string; name: string; location: string
  sites?: { name: string }
}
interface CheckpointScan {
  id: string; checkpoint_id: string; guard_id: string; shift_id: string; scanned_at: string
  checkpoints?: { name: string; sites?: { name: string } }
  guards?: { name: string }
}

export default function Home() {
  const [guards, setGuards] = useState<Guard[]>([])
  const [sites, setSites] = useState<Site[]>([])
  const [shifts, setShifts] = useState<Shift[]>([])
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [postOrders, setPostOrders] = useState<PostOrder[]>([])
  const [activityReports, setActivityReports] = useState<ActivityReport[]>([])
  const [availability, setAvailability] = useState<Availability[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([])
  const [checkpointScans, setCheckpointScans] = useState<CheckpointScan[]>([])
  const [orgId, setOrgId] = useState<string | null>(null)
  const [activeNav, setActiveNav] = useState('dashboard')
  const [loading, setLoading] = useState(true)
  const [selectedSiteId, setSelectedSiteId] = useState<string>('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [billingStart, setBillingStart] = useState(() => { const d = new Date(); d.setDate(1); return d.toISOString().slice(0,10) })
  const [billingEnd, setBillingEnd] = useState(() => new Date().toISOString().slice(0,10))
  const [billingSiteFilter, setBillingSiteFilter] = useState('all')

  const [showAddGuard, setShowAddGuard] = useState(false)
  const [showAddSite, setShowAddSite] = useState(false)
  const [showAddShift, setShowAddShift] = useState(false)
  const [showAddIncident, setShowAddIncident] = useState(false)
  const [showAddPostOrder, setShowAddPostOrder] = useState(false)
  const [showAddReport, setShowAddReport] = useState(false)
  const [showAddAvailability, setShowAddAvailability] = useState(false)
  const [showAddCheckpoint, setShowAddCheckpoint] = useState(false)
  const [showAddClient, setShowAddClient] = useState(false)
  const [viewingReport, setViewingReport] = useState<ActivityReport | null>(null)

  const [editingGuard, setEditingGuard] = useState<Guard | null>(null)
  const [editingSite, setEditingSite] = useState<Site | null>(null)
  const [editingShift, setEditingShift] = useState<Shift | null>(null)
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null)
  const [editingPostOrder, setEditingPostOrder] = useState<PostOrder | null>(null)

  const [guardForm, setGuardForm] = useState({ name: '', email: '', phone: '', license_number: '', license_expiry: '' })
  const [siteForm, setSiteForm] = useState({ name: '', address: '', contact_name: '', contact_phone: '' })
  const [shiftForm, setShiftForm] = useState({ guard_id: '', site_id: '', start_time: '', end_time: '', shift_type: 'day', pay_rate: '', bill_rate: '' })
const [recurringDays, setRecurringDays] = useState<number[]>([])
const [recurringWeeks, setRecurringWeeks] = useState(1)
const [isRecurring, setIsRecurring] = useState(false)
  const [incidentForm, setIncidentForm] = useState({ title: '', description: '', severity: 'low', site_id: '', guard_id: '' })
  const [postOrderForm, setPostOrderForm] = useState({ title: '', content: '', category: 'general' })
  const [reportForm, setReportForm] = useState({ shift_id: '', guard_id: '', site_id: '', summary: '', observations: '' })
  const [availabilityForm, setAvailabilityForm] = useState({ guard_id: '', date: '', reason: '' })
  const [checkpointForm, setCheckpointForm] = useState({ name: '', location: '', site_id: '' })
  const [clientForm, setClientForm] = useState({ name: '', email: '', site_id: '' })

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { window.location.href = '/login'; return }
      const params = new URLSearchParams(window.location.search)
      const tab = params.get('tab')
      if (tab) setActiveNav(tab)
      const { data: orgData } = await supabase.from('user_organizations').select('organization_id').eq('user_id', session.user.id).single()
      if (orgData) setOrgId(orgData.organization_id)
      fetchAll()
    })
  }, [])

  function navigate(tab: string) {
    setActiveNav(tab)
    window.history.pushState({}, '', `?tab=${tab}`)
    setSidebarOpen(false)
  }

  async function fetchAll() {
    setLoading(true)
    const [g, s, sh, inc, po, ar, av, cl, cp, cs] = await Promise.all([
      supabase.from('guards').select('*').order('name'),
      supabase.from('sites').select('*').order('name'),
      supabase.from('shifts').select('*, guards(name), sites(name)').order('start_time'),
      supabase.from('incidents').select('*, sites(name)').order('created_at', { ascending: false }),
      supabase.from('post_orders').select('*').order('order_index'),
      supabase.from('activity_reports').select('*, guards(name), sites(name), shifts(start_time, end_time)').order('created_at', { ascending: false }),
      supabase.from('guard_availability').select('*, guards(name)').order('date'),
      supabase.from('clients').select('*').order('name'),
      supabase.from('checkpoints').select('*, sites(name)').order('name'),
      supabase.from('checkpoint_scans').select('*, checkpoints(name, sites(name)), guards(name)').order('scanned_at', { ascending: false })
    ])
    if (g.data) setGuards(g.data)
    if (s.data) { setSites(s.data); if (!selectedSiteId && s.data.length > 0) setSelectedSiteId(s.data[0].id) }
    if (sh.data) setShifts(sh.data)
    if (inc.data) setIncidents(inc.data)
    if (po.data) setPostOrders(po.data)
    if (ar.data) setActivityReports(ar.data)
    if (av.data) setAvailability(av.data)
    if (cl.data) setClients(cl.data)
    if (cp.data) setCheckpoints(cp.data)
    if (cs.data) setCheckpointScans(cs.data)
    setLoading(false)
  }

  async function addGuard() { const { error } = await supabase.from('guards').insert([{...guardForm, organization_id: orgId}]); if (!error) { setShowAddGuard(false); setGuardForm({ name: '', email: '', phone: '', license_number: '', license_expiry: '' }); fetchAll() } }
  async function addSite() { const { error } = await supabase.from('sites').insert([{...siteForm, organization_id: orgId}]); if (!error) { setShowAddSite(false); setSiteForm({ name: '', address: '', contact_name: '', contact_phone: '' }); fetchAll() } }
  async function addShift() {
    const guard = guards.find(g => g.id === shiftForm.guard_id)
    const shiftDate = shiftForm.start_time.slice(0, 10)
    const isUnavailable = availability.some(a => a.guard_id === shiftForm.guard_id && a.date === shiftDate)
    if (isUnavailable) {
      const reason = availability.find(a => a.guard_id === shiftForm.guard_id && a.date === shiftDate)?.reason
      if (!confirm(`⚠️ ${guard?.name} is marked unavailable on this date${reason ? ` (${reason})` : ''}. Schedule anyway?`)) return
    }
    if (!isRecurring || recurringDays.length === 0) {
      const { error } = await supabase.from('shifts').insert([{ ...shiftForm, pay_rate: parseFloat(shiftForm.pay_rate), bill_rate: parseFloat(shiftForm.bill_rate), organization_id: orgId }])
      if (!error) { setShowAddShift(false); setShiftForm({ guard_id: '', site_id: '', start_time: '', end_time: '', shift_type: 'day', pay_rate: '', bill_rate: '' }); setIsRecurring(false); setRecurringDays([]); setRecurringWeeks(1); fetchAll() }
      return
    }
    const baseStart = new Date(shiftForm.start_time)
    const baseEnd = new Date(shiftForm.end_time)
    const durationMs = baseEnd.getTime() - baseStart.getTime()
    const shiftsToInsert = []
    for (let week = 0; week < recurringWeeks; week++) {
      for (const dayOfWeek of recurringDays) {
        const shiftStart = new Date(baseStart)
        shiftStart.setDate(baseStart.getDate() + (week * 7) + ((dayOfWeek - baseStart.getDay() + 7) % 7) + (week === 0 && dayOfWeek < baseStart.getDay() ? 7 : 0))
        shiftStart.setHours(baseStart.getHours(), baseStart.getMinutes(), 0, 0)
        const shiftEnd = new Date(shiftStart.getTime() + durationMs)
        shiftsToInsert.push({ guard_id: shiftForm.guard_id, site_id: shiftForm.site_id, shift_type: shiftForm.shift_type, pay_rate: parseFloat(shiftForm.pay_rate), bill_rate: parseFloat(shiftForm.bill_rate), status: 'scheduled', organization_id: orgId, start_time: shiftStart.toISOString(), end_time: shiftEnd.toISOString() })
      }
    }
    const { error } = await supabase.from('shifts').insert(shiftsToInsert)
    if (!error) { setShowAddShift(false); setShiftForm({ guard_id: '', site_id: '', start_time: '', end_time: '', shift_type: 'day', pay_rate: '', bill_rate: '' }); setIsRecurring(false); setRecurringDays([]); setRecurringWeeks(1); fetchAll() }
    else { alert('Error creating shifts: ' + error.message) }
  }
  async function addIncident() { const { error } = await supabase.from('incidents').insert([{...incidentForm, organization_id: orgId}]); if (!error) { setShowAddIncident(false); setIncidentForm({ title: '', description: '', severity: 'low', site_id: '', guard_id: '' }); fetchAll() } }
  async function addPostOrder() { const { error } = await supabase.from('post_orders').insert([{ ...postOrderForm, site_id: selectedSiteId, organization_id: orgId }]); if (!error) { setShowAddPostOrder(false); setPostOrderForm({ title: '', content: '', category: 'general' }); fetchAll() } }
  async function addReport() {
    const sel = shifts.find(s => s.id === reportForm.shift_id)
    const { error } = await supabase.from('activity_reports').insert([{ ...reportForm, guard_id: sel?.guard_id || '', site_id: sel?.site_id || '', organization_id: orgId }])
    if (!error) { setShowAddReport(false); setReportForm({ shift_id: '', guard_id: '', site_id: '', summary: '', observations: '' }); fetchAll() }
  }
  async function addAvailability() { const { error } = await supabase.from('guard_availability').insert([{...availabilityForm, organization_id: orgId}]); if (!error) { setShowAddAvailability(false); setAvailabilityForm({ guard_id: '', date: '', reason: '' }); fetchAll() } }
  async function addCheckpoint() { const { error } = await supabase.from('checkpoints').insert([{...checkpointForm, organization_id: orgId}]); if (!error) { setShowAddCheckpoint(false); setCheckpointForm({ name: '', location: '', site_id: '' }); fetchAll() } }
  async function addClient() { const { error } = await supabase.from('clients').insert([{ name: clientForm.name, email: clientForm.email, site_id: clientForm.site_id, organization_id: orgId }]); if (!error) { setShowAddClient(false); setClientForm({ name: '', email: '', site_id: '' }); fetchAll() } }

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
  async function deleteAvailability(id: string) { if (!confirm('Remove this unavailability?')) return; await supabase.from('guard_availability').delete().eq('id', id); fetchAll() }

  function exportPayroll() {
    const rows = guards.map(guard => {
      const guardShifts = billingShifts.filter(s => s.guard_id === guard.id)
      const totalHrs = guardShifts.reduce((a, s) => a + (new Date(s.end_time).getTime() - new Date(s.start_time).getTime()) / (1000 * 60 * 60), 0)
      const totalPay = guardShifts.reduce((a, s) => { const hrs = (new Date(s.end_time).getTime() - new Date(s.start_time).getTime()) / (1000 * 60 * 60); return a + hrs * s.pay_rate }, 0)
      return `${guard.name},${guard.email||''},${totalHrs.toFixed(2)},${totalPay.toFixed(2)}`
    }).filter(r => !r.endsWith(',0.00,0.00'))
    const csv = ['Name,Email,Hours,Total Pay', ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `watchpost-payroll-${billingStart}-to-${billingEnd}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

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
  const overtimeGuards = guards.map(g => {
    const weekStart = new Date(today); weekStart.setDate(today.getDate() - today.getDay())
    const weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 7)
    const weekShifts = shifts.filter(s => s.guard_id === g.id && new Date(s.start_time) >= weekStart && new Date(s.start_time) < weekEnd)
    const totalHrs = weekShifts.reduce((a, s) => a + (new Date(s.end_time).getTime() - new Date(s.start_time).getTime()) / (1000 * 60 * 60), 0)
    return { guard: g, hours: totalHrs }
  }).filter(r => r.hours > 40)
  const selectedSite = sites.find(s => s.id === selectedSiteId)
  const sitePostOrders = postOrders.filter(po => po.site_id === selectedSiteId)
  const shiftDateStr = shiftForm.start_time.slice(0, 10)
  const selectedGuardUnavailable = shiftForm.guard_id && shiftDateStr ? availability.some(a => a.guard_id === shiftForm.guard_id && a.date === shiftDateStr) : false

  const navGroups = [
    { label: 'Overview', items: [{ id: 'dashboard', label: 'Dashboard', icon: '▣' }] },
    { label: 'Operations', items: [
      { id: 'schedule', label: 'Schedule', icon: '⊟' },
      { id: 'guards', label: 'Guards', icon: '⊕' },
      { id: 'availability', label: 'Availability', icon: '◷' },
      { id: 'clients', label: 'Clients', icon: '◉' },
      { id: 'checkpoints', label: 'Checkpoints', icon: '⊗' },
      { id: 'sites', label: 'Sites', icon: '⊠' },
      { id: 'postorders', label: 'Post Orders', icon: '≡' },
    ]},
    { label: 'Reporting', items: [
      { id: 'reports', label: 'Activity Reports', icon: '◈' },
      { id: 'incidents', label: 'Incidents', icon: '⚠' },
      { id: 'billing', label: 'Billing', icon: '◆' },
    ]},
  ]

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
  const catPill: Record<string, { background: string; color: string }> = {
    general:   { background: 'rgba(96,165,250,0.12)', color: '#60a5fa' },
    access:    { background: 'rgba(250,204,21,0.12)', color: '#facc15' },
    emergency: { background: 'rgba(248,113,113,0.12)', color: '#f87171' },
    patrol:    { background: 'rgba(74,222,128,0.12)', color: '#4ade80' },
    reporting: { background: 'rgba(167,139,250,0.12)', color: '#a78bfa' },
  }

  const fmt$ = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const fmtDate = (d: string) => new Date(d).toLocaleDateString([], { month: 'short', day: 'numeric' })
  const fmtTime = (d: string) => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const fmtDateTime = (d: string) => new Date(d).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

  const allNavItems = navGroups.flatMap(g => g.items)
  const currentLabel = allNavItems.find(n => n.id === activeNav)?.label || ''

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        :root {
          --bg: #0e1117; --bg2: #141820; --bg3: #1a1f2e;
          --border: rgba(255,255,255,0.07); --border2: rgba(255,255,255,0.12);
          --text: #f1f5f9; --text2: #94a3b8; --text3: #475569;
          --accent: #f97316; --accent2: #ea580c; --accent-glow: rgba(249,115,22,0.2);
          --green: #4ade80; --red: #f87171; --yellow: #facc15; --purple: #a78bfa; --blue: #60a5fa;
        }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; background: var(--bg); color: var(--text); -webkit-font-smoothing: antialiased; }

        .app { display: flex; height: 100vh; overflow: hidden; }

        /* SIDEBAR */
        .sidebar {
          width: 232px; background: var(--bg2); border-right: 1px solid var(--border);
          display: flex; flex-direction: column; flex-shrink: 0; position: relative; z-index: 50;
          transition: transform 0.25s ease;
        }
        .sidebar::after { content: ''; position: absolute; top: 0; right: 0; bottom: 0; width: 1px; background: linear-gradient(to bottom, transparent, rgba(249,115,22,0.3) 40%, rgba(249,115,22,0.1) 70%, transparent); pointer-events: none; }

        @media (max-width: 768px) {
          .sidebar {
            position: fixed; top: 0; left: 0; bottom: 0;
            transform: translateX(-100%);
            z-index: 200;
            box-shadow: 4px 0 24px rgba(0,0,0,0.4);
          }
          .sidebar.open { transform: translateX(0); }
          .sidebar-overlay { display: block !important; }
        }

        .sidebar-overlay {
          display: none;
          position: fixed; inset: 0; background: rgba(0,0,0,0.5);
          z-index: 199; backdrop-filter: blur(2px);
        }

        .sidebar-logo { padding: 20px 18px 18px; border-bottom: 1px solid var(--border); }
        .logo-row { display: flex; align-items: center; gap: 10px; }
        .logo-name { font-size: 15px; font-weight: 800; color: var(--text); letter-spacing: -0.4px; }
        .logo-tagline { font-size: 10px; color: var(--text3); text-transform: uppercase; letter-spacing: 1px; margin-top: 1px; }

        .sidebar-nav { flex: 1; overflow-y: auto; padding: 14px 10px; scrollbar-width: none; }
        .sidebar-nav::-webkit-scrollbar { display: none; }
        .nav-group { margin-bottom: 18px; }
        .nav-group-label { font-size: 10px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 1.2px; padding: 0 8px; margin-bottom: 5px; }
        .nav-btn { display: flex; align-items: center; gap: 9px; width: 100%; padding: 8px 10px; border-radius: 7px; border: none; background: transparent; color: var(--text2); font-size: 13px; font-weight: 500; font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; text-align: left; transition: all 0.15s ease; margin-bottom: 1px; position: relative; }
        .nav-btn:hover { background: rgba(255,255,255,0.05); color: var(--text); }
        .nav-btn.active { background: rgba(249,115,22,0.12); color: var(--accent); font-weight: 600; }
        .nav-btn.active::before { content: ''; position: absolute; left: 0; top: 20%; bottom: 20%; width: 2px; background: var(--accent); border-radius: 2px; }
        .nav-icon { font-size: 13px; opacity: 0.8; width: 16px; text-align: center; }

        .sidebar-bottom { padding: 14px 10px; border-top: 1px solid var(--border); }
        .signout-btn { width: 100%; padding: 8px 12px; background: rgba(255,255,255,0.04); border: 1px solid var(--border); border-radius: 7px; color: var(--text3); font-size: 12px; font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; transition: all 0.15s; font-weight: 500; margin-bottom: 6px; }
        .signout-btn:hover { background: rgba(248,113,113,0.08); border-color: rgba(248,113,113,0.2); color: var(--red); }
        .version-tag { font-size: 10px; color: var(--text3); font-family: 'JetBrains Mono', monospace; padding: 0 4px; }

        /* MAIN */
        .main { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }

        .topbar {
          padding: 0 20px; height: 56px; background: var(--bg2); border-bottom: 1px solid var(--border);
          display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; gap: 12px;
        }
        .topbar-left { display: flex; align-items: center; gap: 12px; min-width: 0; }
        .hamburger { display: none; flex-direction: column; gap: 4px; background: transparent; border: none; cursor: pointer; padding: 4px; flex-shrink: 0; }
        .hamburger span { display: block; width: 20px; height: 2px; background: var(--text2); border-radius: 2px; }
        @media (max-width: 768px) { .hamburger { display: flex; } }
        .topbar-title { font-size: 15px; font-weight: 700; color: var(--text); letter-spacing: -0.3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .topbar-count { font-size: 11px; color: var(--text3); background: rgba(255,255,255,0.06); border: 1px solid var(--border); padding: 2px 8px; border-radius: 20px; font-family: 'JetBrains Mono', monospace; flex-shrink: 0; }
        .btn-add { display: inline-flex; align-items: center; gap: 5px; background: var(--accent); color: #fff; border: none; border-radius: 7px; padding: 7px 13px; font-size: 12px; font-weight: 600; font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; box-shadow: 0 0 16px var(--accent-glow); transition: all 0.15s ease; white-space: nowrap; flex-shrink: 0; }
        .btn-add:hover { background: var(--accent2); transform: translateY(-1px); }

        .scroll-area { flex: 1; overflow-y: auto; padding: 20px; scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.1) transparent; }
        @media (min-width: 769px) { .scroll-area { padding: 28px 32px; } }

        /* STAT CARDS */
        .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 20px; }
        @media (min-width: 640px) { .stats-grid { grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 24px; } }
        .stat-card { background: var(--bg3); border: 1px solid var(--border); border-radius: 12px; padding: 14px 16px; position: relative; overflow: hidden; }
        .stat-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent); }
        .stat-card.accent { border-color: rgba(249,115,22,0.25); background: rgba(249,115,22,0.05); }
        .stat-card.danger { border-color: rgba(248,113,113,0.25); background: rgba(248,113,113,0.05); }
        .stat-card.success { border-color: rgba(74,222,128,0.25); background: rgba(74,222,128,0.05); }
        .stat-label { font-size: 10px; font-weight: 600; color: var(--text3); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px; }
        .stat-num { font-size: 26px; font-weight: 800; color: var(--text); letter-spacing: -1.5px; line-height: 1; font-family: 'JetBrains Mono', monospace; }
        .stat-card.accent .stat-num { color: var(--accent); }
        .stat-card.danger .stat-num { color: var(--red); }
        .stat-card.success .stat-num { color: var(--green); }
        .stat-sub { font-size: 11px; color: var(--text3); margin-top: 5px; }

        /* TABLE */
        .table-wrap { background: var(--bg2); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
        .table-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .table-wrap table { width: 100%; border-collapse: collapse; min-width: 500px; }
        .table-wrap th { padding: 11px 16px; font-size: 10.5px; font-weight: 600; color: var(--text3); text-transform: uppercase; letter-spacing: 0.7px; text-align: left; background: rgba(255,255,255,0.02); border-bottom: 1px solid var(--border); white-space: nowrap; }
        .table-wrap td { padding: 11px 16px; font-size: 13px; color: var(--text2); border-bottom: 1px solid var(--border); white-space: nowrap; }
        .table-wrap tr:last-child td { border-bottom: none; }
        .table-wrap tr:hover td { background: rgba(255,255,255,0.025); }
        .td-name { font-weight: 600; color: var(--text) !important; }
        .td-mono { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--text3) !important; }
        .td-money { font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 600; color: var(--text) !important; }
        .td-green { font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 600; color: var(--green) !important; }
        .td-warn { color: var(--red) !important; font-weight: 600; }
        .row-actions { display: flex; gap: 5px; opacity: 0; transition: opacity 0.15s; }
        .table-wrap tr:hover .row-actions { opacity: 1; }
        @media (max-width: 768px) { .row-actions { opacity: 1; } }
        .btn-sm { padding: 4px 9px; border-radius: 5px; border: none; font-size: 11px; font-weight: 600; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; transition: all 0.15s; }
        .btn-sm.edit { background: rgba(255,255,255,0.07); color: var(--text2); }
        .btn-sm.edit:hover { background: rgba(255,255,255,0.12); color: var(--text); }
        .btn-sm.del { background: rgba(248,113,113,0.1); color: var(--red); }
        .btn-sm.del:hover { background: rgba(248,113,113,0.2); }
        .btn-sm.view { background: rgba(96,165,250,0.1); color: var(--blue); }
        .btn-sm.view:hover { background: rgba(96,165,250,0.18); }

        .pill { display: inline-flex; align-items: center; padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 600; }

        .empty { padding: 48px 20px; text-align: center; }
        .empty-icon { font-size: 24px; opacity: 0.15; margin-bottom: 10px; }
        .empty-title { font-size: 14px; font-weight: 600; color: var(--text3); margin-bottom: 4px; }
        .empty-sub { font-size: 12px; color: var(--text3); opacity: 0.6; }

        /* DASHBOARD GRID */
        .dash-grid { display: grid; grid-template-columns: 1fr; gap: 14px; }
        @media (min-width: 768px) { .dash-grid { grid-template-columns: 1fr 1fr; gap: 16px; } }
        .dash-card { background: var(--bg2); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
        .dash-card-header { padding: 13px 16px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
        .dash-card-title { font-size: 13px; font-weight: 700; color: var(--text); }
        .dash-card-meta { font-size: 11px; color: var(--text3); font-family: 'JetBrains Mono', monospace; }
        .dash-row { padding: 11px 16px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 12px; }
        .dash-row:last-child { border-bottom: none; }
        .dash-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        .dash-row-title { font-size: 13px; font-weight: 600; color: var(--text); margin-bottom: 2px; }
        .dash-row-sub { font-size: 11px; color: var(--text3); }
        .overview-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 16px; border-bottom: 1px solid var(--border); }
        .overview-row:last-child { border-bottom: none; }
        .overview-label { font-size: 12.5px; color: var(--text2); }
        .overview-val { font-size: 13px; font-weight: 700; color: var(--text); font-family: 'JetBrains Mono', monospace; }

        /* POST ORDERS */
        .po-layout { display: grid; grid-template-columns: 1fr; gap: 14px; }
        @media (min-width: 640px) { .po-layout { grid-template-columns: 200px 1fr; height: calc(100vh - 116px); } }
        .po-sitelist { background: var(--bg2); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; }
        .po-sitelist-header { padding: 11px 14px; border-bottom: 1px solid var(--border); font-size: 10.5px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 0.8px; }
        .po-site-item { padding: 11px 14px; cursor: pointer; border-bottom: 1px solid var(--border); transition: background 0.15s; position: relative; }
        .po-site-item:hover { background: rgba(255,255,255,0.03); }
        .po-site-item.active { background: rgba(249,115,22,0.08); }
        .po-site-item.active::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 2px; background: var(--accent); }
        .po-site-name { font-size: 13px; font-weight: 600; color: var(--text); }
        .po-site-count { font-size: 11px; color: var(--text3); margin-top: 2px; }
        .po-panel { background: var(--bg2); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; }
        .po-panel-header { padding: 14px 18px; border-bottom: 1px solid var(--border); }
        .po-panel-title { font-size: 14px; font-weight: 700; color: var(--text); }
        .po-panel-sub { font-size: 11px; color: var(--text3); margin-top: 2px; }
        .po-body { flex: 1; overflow-y: auto; padding: 14px 18px; }
        .po-card { background: var(--bg3); border: 1px solid var(--border); border-radius: 9px; padding: 14px 16px; margin-bottom: 12px; }
        .po-card:hover { border-color: var(--border2); }
        .po-card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; flex-wrap: wrap; gap: 8px; }
        .po-card-title { font-size: 13px; font-weight: 700; color: var(--text); }
        .po-card-actions { display: flex; gap: 5px; }
        .po-card-content { font-size: 13px; color: var(--text2); line-height: 1.65; white-space: pre-wrap; }

        /* BILLING */
        .billing-filter-bar { background: var(--bg2); border: 1px solid var(--border); border-radius: 10px; padding: 14px 16px; display: flex; align-items: flex-end; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
        .filter-group { display: flex; flex-direction: column; gap: 5px; }
        .filter-group label { font-size: 10.5px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 0.7px; }
        .filter-group input, .filter-group select { background: var(--bg3); border: 1px solid var(--border); border-radius: 7px; padding: 7px 10px; color: var(--text); font-size: 13px; font-family: 'Plus Jakarta Sans', sans-serif; outline: none; }
        .filter-group input:focus, .filter-group select:focus { border-color: var(--accent); }
        .filter-group select option { background: var(--bg3); }
        .billing-site-block { background: var(--bg2); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; margin-bottom: 12px; }
        .billing-site-block th { padding: 10px 16px; font-size: 10.5px; font-weight: 600; color: var(--text3); text-transform: uppercase; letter-spacing: 0.7px; text-align: left; background: rgba(255,255,255,0.02); border-bottom: 1px solid var(--border); white-space: nowrap; }
        .billing-site-block td { padding: 11px 16px; font-size: 13px; color: var(--text2); border-bottom: 1px solid var(--border); white-space: nowrap; }
        .billing-site-block tr:last-child td { border-bottom: none; }
        .billing-site-block tr:hover td { background: rgba(255,255,255,0.025); }
        .billing-site-top { padding: 13px 16px; background: rgba(255,255,255,0.02); border-bottom: 1px solid var(--border); display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
        .billing-site-name { font-size: 14px; font-weight: 700; color: var(--text); }
        .billing-site-meta { font-size: 11px; color: var(--text3); margin-top: 2px; }
        .billing-site-nums { display: flex; gap: 20px; flex-wrap: wrap; }
        .billing-num { text-align: right; }
        .billing-num-label { font-size: 10px; color: var(--text3); text-transform: uppercase; letter-spacing: 0.5px; }
        .billing-num-val { font-size: 14px; font-weight: 700; font-family: 'JetBrains Mono', monospace; color: var(--text); margin-top: 2px; }
        .billing-num-val.green { color: var(--green); }
        .billing-footer { background: linear-gradient(135deg, #1a1f2e 0%, #141820 100%); border: 1px solid rgba(249,115,22,0.2); border-radius: 12px; padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; margin-top: 16px; }
        .billing-footer-label { font-size: 13px; font-weight: 600; color: var(--text2); }
        .billing-footer-nums { display: flex; gap: 24px; flex-wrap: wrap; }
        .billing-footer-num { text-align: right; }
        .billing-footer-num-label { font-size: 10px; color: var(--text3); text-transform: uppercase; letter-spacing: 0.5px; }
        .billing-footer-num-val { font-size: 18px; font-weight: 800; font-family: 'JetBrains Mono', monospace; color: var(--text); margin-top: 2px; }
        .billing-footer-num-val.green { color: var(--green); }

        .avail-warn { background: rgba(248,113,113,0.1); border: 1px solid rgba(248,113,113,0.2); border-radius: 7px; padding: 8px 12px; font-size: 12px; color: var(--red); margin-bottom: 12px; }

        /* MODAL */
        .modal-bg { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(6px); display: flex; align-items: flex-end; justify-content: center; z-index: 300; animation: fIn 0.15s ease; }
        @media (min-width: 640px) { .modal-bg { align-items: center; } }
        @keyframes fIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes sUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .modal { background: var(--bg2); border: 1px solid var(--border2); border-radius: 16px 16px 0 0; padding: 24px 20px; width: 100%; max-height: 90vh; overflow-y: auto; box-shadow: 0 24px 80px rgba(0,0,0,0.5); animation: sUp 0.2s ease; }
        @media (min-width: 640px) { .modal { border-radius: 14px; width: 480px; max-height: unset; } }
        .modal-wide { width: 100%; }
        @media (min-width: 640px) { .modal-wide { width: 540px; } }
        .modal-title { font-size: 17px; font-weight: 800; color: var(--text); letter-spacing: -0.4px; margin-bottom: 4px; }
        .modal-sub { font-size: 12.5px; color: var(--text3); margin-bottom: 20px; }
        .field { margin-bottom: 13px; }
        .field label { display: block; font-size: 11px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 0.7px; margin-bottom: 6px; }
        .field input, .field select, .field textarea { width: 100%; background: var(--bg3); border: 1px solid var(--border); border-radius: 8px; padding: 10px 13px; color: var(--text); font-size: 16px; font-family: 'Plus Jakarta Sans', sans-serif; outline: none; transition: border-color 0.15s; }
        @media (min-width: 640px) { .field input, .field select, .field textarea { font-size: 13px; } }
        .field input:focus, .field select:focus, .field textarea:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(249,115,22,0.1); }
        .field select option { background: var(--bg3); }
        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px; }
        .btn-cancel { padding: 10px 16px; border-radius: 7px; border: 1px solid var(--border); background: transparent; color: var(--text2); font-size: 13px; font-weight: 500; font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; }
        .btn-cancel:hover { background: rgba(255,255,255,0.05); }
        .btn-save { padding: 10px 18px; border-radius: 7px; border: none; background: var(--accent); color: #fff; font-size: 13px; font-weight: 600; font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; box-shadow: 0 0 16px var(--accent-glow); }
        .btn-save:hover { background: var(--accent2); }
        .report-block { margin-bottom: 14px; }
        .report-block-label { font-size: 10.5px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 0.7px; margin-bottom: 8px; }
        .report-block-content { background: var(--bg3); border: 1px solid var(--border); border-radius: 8px; padding: 12px 14px; font-size: 13.5px; color: var(--text2); line-height: 1.65; white-space: pre-wrap; }
        @media print {
  .sidebar, .topbar, .btn-add, .row-actions, .billing-filter-bar button, .modal-bg { display: none !important; }
  .main { overflow: visible !important; }
  .scroll-area { overflow: visible !important; height: auto !important; }
  body { background: white !important; color: black !important; }
  .stat-card, .billing-site-block, .table-wrap, .dash-card { border: 1px solid #ddd !important; background: white !important; break-inside: avoid; }
  .stat-num, .td-name, .topbar-title { color: black !important; }
  .td-mono, .stat-label, .billing-site-name { color: #333 !important; }
  .td-money, .td-green, .billing-num-val { color: #1a1a1a !important; }
  .billing-footer { background: #f5f5f5 !important; border: 1px solid #ddd !important; }
  .billing-footer-num-val, .billing-footer-label { color: black !important; }
  .pill { border: 1px solid #ddd !important; color: #333 !important; background: #f5f5f5 !important; }
  .print-header { display: block !important; }
}
.print-header { display: none; padding: 0 0 20px; }
.print-header h1 { font-size: 20px; font-weight: 700; color: black; margin-bottom: 4px; }
.print-header p { font-size: 12px; color: #666; }
      `}</style>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <div className="app">
        {/* SIDEBAR */}
        <div className={`sidebar${sidebarOpen ? ' open' : ''}`}>
          <div className="sidebar-logo">
            <div className="logo-row">
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
              <div>
                <div className="logo-name">Watchpost</div>
                <div className="logo-tagline">Security Platform</div>
              </div>
            </div>
          </div>
          <nav className="sidebar-nav">
            {navGroups.map(group => (
              <div key={group.label} className="nav-group">
                <div className="nav-group-label">{group.label}</div>
                {group.items.map(item => (
                  <button key={item.id} className={`nav-btn${activeNav === item.id ? ' active' : ''}`} onClick={() => navigate(item.id)}>
                    <span className="nav-icon">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            ))}
          </nav>
          <div className="sidebar-bottom">
            <button className="signout-btn" onClick={async () => { await supabase.auth.signOut(); window.location.href = '/login' }}>Sign out</button>
            <div className="version-tag">v0.1.0</div>
          </div>
        </div>

        {/* MAIN */}
        <div className="main">
          <div className="topbar">
            <div className="topbar-left">
              <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Menu">
                <span /><span /><span />
              </button>
              <span className="topbar-title">{currentLabel}</span>
              {activeNav === 'schedule' && <span className="topbar-count">{shifts.length}</span>}
              {activeNav === 'guards' && <span className="topbar-count">{guards.length}</span>}
              {activeNav === 'sites' && <span className="topbar-count">{sites.length}</span>}
              {activeNav === 'incidents' && <span className="topbar-count">{incidents.length}</span>}
              {activeNav === 'postorders' && <span className="topbar-count">{postOrders.length}</span>}
              {activeNav === 'reports' && <span className="topbar-count">{activityReports.length}</span>}
              {activeNav === 'availability' && <span className="topbar-count">{availability.length}</span>}
              {activeNav === 'clients' && <span className="topbar-count">{clients.length}</span>}
              {activeNav === 'checkpoints' && <span className="topbar-count">{checkpoints.length}</span>}
            </div>
            {activeNav === 'schedule' && <button className="btn-add" onClick={() => setShowAddShift(true)}>+ Shift</button>}
            {activeNav === 'guards' && <button className="btn-add" onClick={() => setShowAddGuard(true)}>+ Guard</button>}
            {activeNav === 'sites' && <button className="btn-add" onClick={() => setShowAddSite(true)}>+ Site</button>}
            {activeNav === 'incidents' && <button className="btn-add" onClick={() => setShowAddIncident(true)}>+ Incident</button>}
            {activeNav === 'postorders' && selectedSiteId && <button className="btn-add" onClick={() => setShowAddPostOrder(true)}>+ Order</button>}
            {activeNav === 'reports' && <><button className="btn-add" onClick={() => setShowAddReport(true)}>+ Report</button><button className="btn-add" onClick={() => window.print()} style={{background:'var(--bg3)',border:'1px solid var(--border)',boxShadow:'none'}}>↓ PDF</button></>}
            {activeNav === 'availability' && <button className="btn-add" onClick={() => setShowAddAvailability(true)}>+ Unavailable</button>}
            {activeNav === 'checkpoints' && <button className="btn-add" onClick={() => setShowAddCheckpoint(true)}>+ Checkpoint</button>}
            {activeNav === 'clients' && <button className="btn-add" onClick={() => setShowAddClient(true)}>+ Client</button>}
          </div>

          <div className="scroll-area">
            {loading && <div style={{ color: 'var(--text3)', fontSize: 13 }}>Loading...</div>}

            {/* DASHBOARD */}
            {!loading && activeNav === 'dashboard' && (
              <div>
                <div className="stats-grid">
                  <div className="stat-card"><div className="stat-label">Guards</div><div className="stat-num">{guards.length}</div><div className="stat-sub">{guards.filter(g=>g.status==='active').length} active</div></div>
                  <div className="stat-card"><div className="stat-label">Sites</div><div className="stat-num">{sites.length}</div><div className="stat-sub">{sites.filter(s=>s.status==='active').length} active</div></div>
                  <div className={`stat-card${openIncidents.length>0?' accent':''}`}><div className="stat-label">Open Incidents</div><div className="stat-num">{openIncidents.length}</div><div className="stat-sub">Needs attention</div></div>
                  <div className={`stat-card${expiringGuards.length>0?' danger':''}`}><div className="stat-label">Expiring</div><div className="stat-num">{expiringGuards.length}</div><div className="stat-sub">Within 30 days</div></div>
                </div>
                <div className="dash-grid">
                  <div className="dash-card">
                    <div className="dash-card-header"><div className="dash-card-title">Today's Shifts</div><div className="dash-card-meta">{todayShifts.length} scheduled</div></div>
                    {todayShifts.length===0?<div className="empty"><div className="empty-icon">⊟</div><div className="empty-title">No shifts today</div></div>
                    :todayShifts.map(s=>(
                      <div key={s.id} className="dash-row">
                        <div className="dash-dot" style={{background:s.shift_type==='night'?'#a78bfa':'#f97316'}}/>
                        <div style={{flex:1}}><div className="dash-row-title">{s.guards?.name||'Unassigned'}</div><div className="dash-row-sub">{s.sites?.name} · {fmtTime(s.start_time)} – {fmtTime(s.end_time)}</div></div>
                        <span className="pill" style={shiftPill[s.shift_type]}>{s.shift_type}</span>
                      </div>
                    ))}
                  </div>
                  <div className="dash-card">
                    <div className="dash-card-header"><div className="dash-card-title">Recent Incidents</div><div className="dash-card-meta">{openIncidents.length} open</div></div>
                    {incidents.length===0?<div className="empty"><div className="empty-icon">⚠</div><div className="empty-title">All clear</div></div>
                    :incidents.slice(0,5).map(i=>(
                      <div key={i.id} className="dash-row">
                        <div className="dash-dot" style={{background:i.severity==='high'?'#f87171':i.severity==='medium'?'#facc15':'#4ade80'}}/>
                        <div style={{flex:1}}><div className="dash-row-title">{i.title}</div><div className="dash-row-sub">{i.sites?.name||'No site'} · {fmtDate(i.created_at)}</div></div>
                        <span className="pill" style={sevPill[i.severity]}>{i.severity}</span>
                      </div>
                    ))}
                  </div>
                  <div className="dash-card">
                    <div className="dash-card-header"><div className="dash-card-title">License Alerts</div><div className="dash-card-meta">{expiringGuards.length} expiring</div></div>
                    {expiringGuards.length===0?<div className="empty"><div className="empty-icon">⊕</div><div className="empty-title">All licenses valid</div></div>
                    :expiringGuards.map(g=>{
                      const diff=Math.ceil((new Date(g.license_expiry).getTime()-today.getTime())/(1000*60*60*24))
                      return(
                        <div key={g.id} className="dash-row">
                          <div className="dash-dot" style={{background:diff<=7?'#f87171':'#facc15'}}/>
                          <div style={{flex:1}}><div className="dash-row-title">{g.name}</div><div className="dash-row-sub">Expires {g.license_expiry}</div></div>
                          <span className="pill" style={{background:diff<=7?'rgba(248,113,113,0.12)':'rgba(250,204,21,0.12)',color:diff<=7?'#f87171':'#facc15'}}>{diff<=0?'Expired':`${diff}d`}</span>
                        </div>
                      )
                    })}
                  </div>
                  <div className="dash-card">
                    <div className="dash-card-header"><div className="dash-card-title">Overview</div></div>
                    {[
                      {label:'Total shifts',value:shifts.length},
                      {label:'Day shifts',value:shifts.filter(s=>s.shift_type==='day').length},
                      {label:'Night shifts',value:shifts.filter(s=>s.shift_type==='night').length},
                      {label:'Total incidents',value:incidents.length},
                      {label:'Activity reports',value:activityReports.length},
                      {label:'Overtime guards',value:overtimeGuards.length},
                    ].map(r=>(
                      <div key={r.label} className="overview-row"><span className="overview-label">{r.label}</span><span className="overview-val">{r.value}</span></div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SCHEDULE */}
            {!loading && activeNav==='schedule' && (
              <>
                <div className="stats-grid" style={{marginBottom:16}}>
                  <div className="stat-card"><div className="stat-label">Total</div><div className="stat-num">{shifts.length}</div></div>
                  <div className="stat-card"><div className="stat-label">Day</div><div className="stat-num">{shifts.filter(s=>s.shift_type==='day').length}</div></div>
                  <div className="stat-card"><div className="stat-label">Night</div><div className="stat-num">{shifts.filter(s=>s.shift_type==='night').length}</div></div>
                  <div className="stat-card"><div className="stat-label">Active Guards</div><div className="stat-num">{guards.filter(g=>g.status==='active').length}</div></div>
                </div>
                <div className="table-wrap"><div className="table-scroll">
                  <table>
                    <thead><tr>{['Guard','Site','Type','Start','End','Pay','Bill','Status',''].map(h=><th key={h}>{h}</th>)}</tr></thead>
                    <tbody>
                      {shifts.length===0&&<tr><td colSpan={9}><div className="empty"><div className="empty-icon">⊟</div><div className="empty-title">No shifts yet</div></div></td></tr>}
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
                </div></div>
              </>
            )}

            {/* GUARDS */}
            {!loading && activeNav==='guards' && (
              <div className="table-wrap"><div className="table-scroll">
                <table>
                  <thead><tr>{['Name','Email','Phone','License #','Expiry','Status',''].map(h=><th key={h}>{h}</th>)}</tr></thead>
                  <tbody>
                    {guards.length===0&&<tr><td colSpan={7}><div className="empty"><div className="empty-icon">⊕</div><div className="empty-title">No guards yet</div></div></td></tr>}
                    {guards.map(g=>{
                      const exp=g.license_expiry&&new Date(g.license_expiry)<new Date()
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
              </div></div>
            )}

            {/* AVAILABILITY */}
            {!loading && activeNav==='availability' && (
              <div className="table-wrap"><div className="table-scroll">
                <table>
                  <thead><tr>{['Guard','Date','Reason',''].map(h=><th key={h}>{h}</th>)}</tr></thead>
                  <tbody>
                    {availability.length===0&&<tr><td colSpan={4}><div className="empty"><div className="empty-icon">◷</div><div className="empty-title">No unavailability records</div></div></td></tr>}
                    {availability.map(a=>(
                      <tr key={a.id}>
                        <td className="td-name">{a.guards?.name||'—'}</td>
                        <td className="td-mono">{new Date(a.date).toLocaleDateString([],{weekday:'short',month:'short',day:'numeric',year:'numeric'})}</td>
                        <td>{a.reason||<span style={{color:'var(--text3)'}}>No reason</span>}</td>
                        <td><div className="row-actions"><button className="btn-sm del" onClick={()=>deleteAvailability(a.id)}>Remove</button></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div></div>
            )}

            {/* CLIENTS */}
            {!loading && activeNav==='clients' && (
              <div className="table-wrap"><div className="table-scroll">
                <table>
                  <thead><tr>{['Name','Email','Site','Portal URL',''].map(h=><th key={h}>{h}</th>)}</tr></thead>
                  <tbody>
                    {clients.length===0&&<tr><td colSpan={5}><div className="empty"><div className="empty-icon">◉</div><div className="empty-title">No clients yet</div></div></td></tr>}
                    {clients.map(c=>(
                      <tr key={c.id}>
                        <td className="td-name">{c.name}</td>
                        <td className="td-mono">{c.email}</td>
                        <td>{sites.find(s=>s.id===c.site_id)?.name||'—'}</td>
                        <td className="td-mono" style={{color:'var(--accent)'}}>/client-login</td>
                        <td><div className="row-actions"><button className="btn-sm del" onClick={async()=>{if(!confirm('Delete?'))return;await supabase.from('clients').delete().eq('id',c.id);fetchAll()}}>Del</button></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div></div>
            )}

            {/* CHECKPOINTS */}
            {!loading && activeNav==='checkpoints' && (
              <div>
                <div className="table-wrap" style={{marginBottom:16}}><div className="table-scroll">
                  <table>
                    <thead><tr>{['Checkpoint','Site','Location','QR URL',''].map(h=><th key={h}>{h}</th>)}</tr></thead>
                    <tbody>
                      {checkpoints.length===0&&<tr><td colSpan={5}><div className="empty"><div className="empty-icon">⊗</div><div className="empty-title">No checkpoints yet</div></div></td></tr>}
                      {checkpoints.map(cp=>(
                        <tr key={cp.id}>
                          <td className="td-name">{cp.name}</td>
                          <td>{cp.sites?.name||'—'}</td>
                          <td>{cp.location||'—'}</td>
                          <td className="td-mono" style={{color:'var(--accent)'}}>/scan/{cp.id.slice(0,8)}...</td>
                          <td><div className="row-actions">
                            <button className="btn-sm view" onClick={()=>{const url=`${window.location.origin}/scan/${cp.id}`;window.open(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`,'_blank')}}>QR</button>
                            <button className="btn-sm del" onClick={async()=>{if(!confirm('Delete?'))return;await supabase.from('checkpoints').delete().eq('id',cp.id);fetchAll()}}>Del</button>
                          </div></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div></div>
                <div style={{fontSize:13,fontWeight:700,color:'var(--text)',marginBottom:10}}>Recent Patrol Scans</div>
                <div className="table-wrap"><div className="table-scroll">
                  <table>
                    <thead><tr>{['Guard','Checkpoint','Site','Scanned At'].map(h=><th key={h}>{h}</th>)}</tr></thead>
                    <tbody>
                      {checkpointScans.length===0&&<tr><td colSpan={4}><div className="empty"><div className="empty-icon">⊗</div><div className="empty-title">No scans yet</div></div></td></tr>}
                      {checkpointScans.slice(0,50).map(scan=>(
                        <tr key={scan.id}>
                          <td className="td-name">{scan.guards?.name||'—'}</td>
                          <td>{scan.checkpoints?.name||'—'}</td>
                          <td>{scan.checkpoints?.sites?.name||'—'}</td>
                          <td className="td-mono">{new Date(scan.scanned_at).toLocaleString([],{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div></div>
              </div>
            )}

            {/* SITES */}
            {!loading && activeNav==='sites' && (
              <div className="table-wrap"><div className="table-scroll">
                <table>
                  <thead><tr>{['Name','Address','Contact','Phone','Status',''].map(h=><th key={h}>{h}</th>)}</tr></thead>
                  <tbody>
                    {sites.length===0&&<tr><td colSpan={6}><div className="empty"><div className="empty-icon">⊠</div><div className="empty-title">No sites yet</div></div></td></tr>}
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
              </div></div>
            )}

            {/* POST ORDERS */}
            {!loading && activeNav==='postorders' && (
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
                  {!selectedSite?<div className="empty"><div className="empty-title">Select a site</div></div>:(
                    <>
                      <div className="po-panel-header">
                        <div className="po-panel-title">{selectedSite.name}</div>
                        <div className="po-panel-sub">{sitePostOrders.length} post orders</div>
                      </div>
                      <div className="po-body">
                        {sitePostOrders.length===0&&<div className="empty"><div className="empty-icon">≡</div><div className="empty-title">No orders yet</div></div>}
                        {sitePostOrders.map(po=>(
                          <div key={po.id} className="po-card">
                            <div className="po-card-top">
                              <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
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
            {!loading && activeNav==='reports' && (
              <div className="table-wrap"><div className="table-scroll">
                <table>
                  <thead><tr>{['Guard','Site','Shift','Summary','Date',''].map(h=><th key={h}>{h}</th>)}</tr></thead>
                  <tbody>
                    {activityReports.length===0&&<tr><td colSpan={6}><div className="empty"><div className="empty-icon">◈</div><div className="empty-title">No reports yet</div></div></td></tr>}
                    {activityReports.map(r=>(
                      <tr key={r.id}>
                        <td className="td-name">{r.guards?.name||'—'}</td>
                        <td>{r.sites?.name||'—'}</td>
                        <td className="td-mono">{r.shifts?fmtDate(r.shifts.start_time):'—'}</td>
                        <td style={{maxWidth:200}}><div style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.summary}</div></td>
                        <td className="td-mono">{fmtDate(r.created_at)}</td>
                        <td><div className="row-actions"><button className="btn-sm view" onClick={()=>setViewingReport(r)}>View</button><button className="btn-sm del" onClick={()=>deleteReport(r.id)}>Del</button></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div></div>
            )}

            {/* INCIDENTS */}
            {!loading && activeNav==='incidents' && (
              <div className="table-wrap"><div className="table-scroll">
                <table>
                  <thead><tr>{['Title','Site','Severity','Status','Date',''].map(h=><th key={h}>{h}</th>)}</tr></thead>
                  <tbody>
                    {incidents.length===0&&<tr><td colSpan={6}><div className="empty"><div className="empty-icon">⚠</div><div className="empty-title">No incidents</div></div></td></tr>}
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
              </div></div>
            )}

            {/* BILLING */}
            {!loading && activeNav==='billing' && (
              <div>
                <div className="print-header">
                  <h1>Billing Report — Watchpost</h1>
                  <p>{new Date(billingStart).toLocaleDateString()} – {new Date(billingEnd).toLocaleDateString()} · Generated {new Date().toLocaleString()}</p>
                </div>
                <div className="billing-filter-bar">
                  <div className="filter-group"><label>From</label><input type="date" value={billingStart} onChange={e=>setBillingStart(e.target.value)}/></div>
                  <div className="filter-group"><label>To</label><input type="date" value={billingEnd} onChange={e=>setBillingEnd(e.target.value)}/></div>
                  <div className="filter-group"><label>Site</label>
                    <select value={billingSiteFilter} onChange={e=>setBillingSiteFilter(e.target.value)}>
                      <option value="all">All Sites</option>
                      {sites.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <button className="btn-add" onClick={exportPayroll} style={{alignSelf:'flex-end'}}>↓ Payroll CSV</button>
<button className="btn-add" onClick={() => window.print()} style={{alignSelf:'flex-end',background:'var(--bg3)',border:'1px solid var(--border)',boxShadow:'none'}}>↓ PDF</button>
                </div>
                <div className="stats-grid" style={{marginBottom:16}}>
                  <div className="stat-card"><div className="stat-label">Billable</div><div className="stat-num" style={{fontSize:18}}>{fmt$(grandBill)}</div></div>
                  <div className="stat-card"><div className="stat-label">Payroll</div><div className="stat-num" style={{fontSize:18}}>{fmt$(grandPay)}</div></div>
                  <div className="stat-card success"><div className="stat-label">Margin</div><div className="stat-num" style={{fontSize:18}}>{fmt$(grandBill-grandPay)}</div></div>
                  <div className="stat-card"><div className="stat-label">Hours</div><div className="stat-num" style={{fontSize:18}}>{grandHrs.toFixed(1)}</div></div>
                </div>
                {billingBySite.length===0&&<div className="table-wrap"><div className="empty"><div className="empty-icon">◆</div><div className="empty-title">No shifts in range</div></div></div>}
                {billingBySite.map(row=>(
                  <div key={row.site.id} className="billing-site-block">
                    <div className="billing-site-top">
                      <div><div className="billing-site-name">{row.site.name}</div><div className="billing-site-meta">{row.shifts.length} shifts · {row.totalHours.toFixed(1)} hrs</div></div>
                      <div className="billing-site-nums">
                        <div className="billing-num"><div className="billing-num-label">Billable</div><div className="billing-num-val">{fmt$(row.totalBillable)}</div></div>
                        <div className="billing-num"><div className="billing-num-label">Payroll</div><div className="billing-num-val">{fmt$(row.totalPayroll)}</div></div>
                        <div className="billing-num"><div className="billing-num-label">Margin</div><div className="billing-num-val green">{fmt$(row.margin)}</div></div>
                      </div>
                    </div>
                    <div style={{overflowX:'auto'}}>
                      <table style={{minWidth:500}}>
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
                  </div>
                ))}
                {billingBySite.length>0&&(
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

        {/* MODALS */}
        {showAddGuard&&<div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setShowAddGuard(false)}><div className="modal">
          <div className="modal-title">Add Guard</div><div className="modal-sub">Enter guard details</div>
          <div className="field"><label>Full Name *</label><input placeholder="John Smith" value={guardForm.name} onChange={e=>setGuardForm({...guardForm,name:e.target.value})}/></div>
          <div className="field"><label>Email</label><input placeholder="john@example.com" value={guardForm.email} onChange={e=>setGuardForm({...guardForm,email:e.target.value})}/></div>
          <div className="field"><label>Phone</label><input placeholder="(555) 000-0000" value={guardForm.phone} onChange={e=>setGuardForm({...guardForm,phone:e.target.value})}/></div>
          <div className="two-col">
            <div className="field"><label>License #</label><input placeholder="LIC-00000" value={guardForm.license_number} onChange={e=>setGuardForm({...guardForm,license_number:e.target.value})}/></div>
            <div className="field"><label>Expiry</label><input type="date" value={guardForm.license_expiry} onChange={e=>setGuardForm({...guardForm,license_expiry:e.target.value})}/></div>
          </div>
          <div className="modal-actions"><button className="btn-cancel" onClick={()=>setShowAddGuard(false)}>Cancel</button><button className="btn-save" onClick={addGuard}>Add Guard</button></div>
        </div></div>}

        {showAddSite&&<div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setShowAddSite(false)}><div className="modal">
          <div className="modal-title">Add Site</div><div className="modal-sub">Enter site information</div>
          <div className="field"><label>Site Name *</label><input placeholder="Downtown Office Tower" value={siteForm.name} onChange={e=>setSiteForm({...siteForm,name:e.target.value})}/></div>
          <div className="field"><label>Address</label><input placeholder="123 Main St" value={siteForm.address} onChange={e=>setSiteForm({...siteForm,address:e.target.value})}/></div>
          <div className="two-col">
            <div className="field"><label>Contact Name</label><input placeholder="Jane Doe" value={siteForm.contact_name} onChange={e=>setSiteForm({...siteForm,contact_name:e.target.value})}/></div>
            <div className="field"><label>Contact Phone</label><input placeholder="(555) 000-0000" value={siteForm.contact_phone} onChange={e=>setSiteForm({...siteForm,contact_phone:e.target.value})}/></div>
          </div>
          <div className="modal-actions"><button className="btn-cancel" onClick={()=>setShowAddSite(false)}>Cancel</button><button className="btn-save" onClick={addSite}>Add Site</button></div>
        </div></div>}

        {showAddShift&&<div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setShowAddShift(false)}><div className="modal">
          <div className="modal-title">Schedule Shift</div><div className="modal-sub">Assign a guard to a site</div>
          {selectedGuardUnavailable&&<div className="avail-warn">⚠️ This guard is marked unavailable on this date.</div>}
          <div className="two-col">
            <div className="field"><label>Guard *</label><select value={shiftForm.guard_id} onChange={e=>setShiftForm({...shiftForm,guard_id:e.target.value})}><option value="">Select guard</option>{guards.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select></div>
            <div className="field"><label>Site *</label><select value={shiftForm.site_id} onChange={e=>setShiftForm({...shiftForm,site_id:e.target.value})}><option value="">Select site</option>{sites.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
          </div>
          <div className="field"><label>Type</label><select value={shiftForm.shift_type} onChange={e=>setShiftForm({...shiftForm,shift_type:e.target.value})}><option value="day">Day</option><option value="swing">Swing</option><option value="night">Night</option></select></div>
          <div className="two-col">
            <div className="field"><label>Start *</label><input type="datetime-local" value={shiftForm.start_time} onChange={e=>setShiftForm({...shiftForm,start_time:e.target.value})}/></div>
            <div className="field"><label>End *</label><input type="datetime-local" value={shiftForm.end_time} onChange={e=>setShiftForm({...shiftForm,end_time:e.target.value})}/></div>
          </div>
          <div className="two-col">
            <div className="field"><label>Pay Rate ($/hr)</label><input placeholder="18.00" value={shiftForm.pay_rate} onChange={e=>setShiftForm({...shiftForm,pay_rate:e.target.value})}/></div>
            <div className="field"><label>Bill Rate ($/hr)</label><input placeholder="32.00" value={shiftForm.bill_rate} onChange={e=>setShiftForm({...shiftForm,bill_rate:e.target.value})}/></div>
          </div>
          <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:8,padding:'12px 14px',marginBottom:13}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:isRecurring?12:0}}>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:'var(--text)',marginBottom:2}}>Repeat weekly</div>
                <div style={{fontSize:11,color:'var(--text3)'}}>Create this shift on multiple days</div>
              </div>
              <button onClick={()=>setIsRecurring(!isRecurring)} style={{width:40,height:22,borderRadius:11,border:'none',cursor:'pointer',background:isRecurring?'var(--accent)':'rgba(255,255,255,0.1)',position:'relative',transition:'background 0.2s'}}>
                <span style={{position:'absolute',top:2,left:isRecurring?20:2,width:18,height:18,borderRadius:'50%',background:'#fff',transition:'left 0.2s',display:'block'}}/>
              </button>
            </div>
            {isRecurring&&<>
              <div style={{marginBottom:10}}>
                <div style={{fontSize:11,fontWeight:700,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'0.7px',marginBottom:8}}>Days of week</div>
                <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                  {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((day,i)=>(
                    <button key={i} onClick={()=>setRecurringDays(prev=>prev.includes(i)?prev.filter(d=>d!==i):[...prev,i].sort())}
                      style={{padding:'6px 10px',borderRadius:6,border:'1px solid',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'Plus Jakarta Sans, sans-serif',transition:'all 0.15s',background:recurringDays.includes(i)?'rgba(249,115,22,0.15)':'transparent',color:recurringDays.includes(i)?'var(--accent)':'var(--text3)',borderColor:recurringDays.includes(i)?'rgba(249,115,22,0.4)':'rgba(255,255,255,0.07)'}}>
                      {day}
                    </button>
                  ))}
                </div>
              </div>
              <div className="field" style={{marginBottom:0}}>
                <label>Repeat for</label>
                <select value={recurringWeeks} onChange={e=>setRecurringWeeks(parseInt(e.target.value))}>
                  <option value={1}>1 week</option>
                  <option value={2}>2 weeks</option>
                  <option value={4}>4 weeks</option>
                  <option value={8}>8 weeks</option>
                  <option value={12}>12 weeks</option>
                </select>
              </div>
              {recurringDays.length>0&&<div style={{fontSize:11,color:'var(--text3)',marginTop:8}}>Will create {recurringDays.length*recurringWeeks} shifts total</div>}
            </>}
          </div>
          <div className="modal-actions"><button className="btn-cancel" onClick={()=>setShowAddShift(false)}>Cancel</button><button className="btn-save" onClick={addShift}>{isRecurring&&recurringDays.length>0?`Schedule ${recurringDays.length*recurringWeeks} Shifts`:'Schedule'}</button></div>
        </div></div>}

        {showAddIncident&&<div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setShowAddIncident(false)}><div className="modal">
          <div className="modal-title">Log Incident</div><div className="modal-sub">Document a security event</div>
          <div className="field"><label>Title *</label><input placeholder="Unauthorized access attempt" value={incidentForm.title} onChange={e=>setIncidentForm({...incidentForm,title:e.target.value})}/></div>
          <div className="field"><label>Description</label><textarea style={{height:80,resize:'none'}} placeholder="What happened..." value={incidentForm.description} onChange={e=>setIncidentForm({...incidentForm,description:e.target.value})}/></div>
          <div className="two-col">
            <div className="field"><label>Severity</label><select value={incidentForm.severity} onChange={e=>setIncidentForm({...incidentForm,severity:e.target.value})}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div>
            <div className="field"><label>Site</label><select value={incidentForm.site_id} onChange={e=>setIncidentForm({...incidentForm,site_id:e.target.value})}><option value="">Select site</option>{sites.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
          </div>
          <div className="field"><label>Guard Involved</label><select value={incidentForm.guard_id} onChange={e=>setIncidentForm({...incidentForm,guard_id:e.target.value})}><option value="">Select guard</option>{guards.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select></div>
          <div className="modal-actions"><button className="btn-cancel" onClick={()=>setShowAddIncident(false)}>Cancel</button><button className="btn-save" onClick={addIncident}>Log Incident</button></div>
        </div></div>}

        {showAddPostOrder&&<div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setShowAddPostOrder(false)}><div className="modal">
          <div className="modal-title">Add Post Order</div><div className="modal-sub">Instructions for guards at {selectedSite?.name}</div>
          <div className="field"><label>Title *</label><input placeholder="Access Control Procedures" value={postOrderForm.title} onChange={e=>setPostOrderForm({...postOrderForm,title:e.target.value})}/></div>
          <div className="field"><label>Category</label><select value={postOrderForm.category} onChange={e=>setPostOrderForm({...postOrderForm,category:e.target.value})}><option value="general">General</option><option value="access">Access Control</option><option value="emergency">Emergency</option><option value="patrol">Patrol</option><option value="reporting">Reporting</option></select></div>
          <div className="field"><label>Instructions *</label><textarea style={{height:120,resize:'vertical'}} placeholder="Detailed instructions..." value={postOrderForm.content} onChange={e=>setPostOrderForm({...postOrderForm,content:e.target.value})}/></div>
          <div className="modal-actions"><button className="btn-cancel" onClick={()=>setShowAddPostOrder(false)}>Cancel</button><button className="btn-save" onClick={addPostOrder}>Add Order</button></div>
        </div></div>}

        {showAddReport&&<div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setShowAddReport(false)}><div className="modal">
          <div className="modal-title">Submit Activity Report</div><div className="modal-sub">End of shift report</div>
          <div className="field"><label>Shift *</label><select value={reportForm.shift_id} onChange={e=>setReportForm({...reportForm,shift_id:e.target.value})}><option value="">Select shift</option>{shifts.map(s=><option key={s.id} value={s.id}>{s.guards?.name} — {s.sites?.name} ({fmtDate(s.start_time)})</option>)}</select></div>
          <div className="field"><label>Activity Summary *</label><textarea style={{height:100,resize:'vertical'}} placeholder="Describe all activity during the shift..." value={reportForm.summary} onChange={e=>setReportForm({...reportForm,summary:e.target.value})}/></div>
          <div className="field"><label>Additional Observations</label><textarea style={{height:70,resize:'vertical'}} placeholder="Any other notes..." value={reportForm.observations} onChange={e=>setReportForm({...reportForm,observations:e.target.value})}/></div>
          <div className="modal-actions"><button className="btn-cancel" onClick={()=>setShowAddReport(false)}>Cancel</button><button className="btn-save" onClick={addReport}>Submit</button></div>
        </div></div>}

        {showAddAvailability&&<div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setShowAddAvailability(false)}><div className="modal">
          <div className="modal-title">Mark Unavailable</div><div className="modal-sub">Block a guard from being scheduled on a date</div>
          <div className="field"><label>Guard *</label><select value={availabilityForm.guard_id} onChange={e=>setAvailabilityForm({...availabilityForm,guard_id:e.target.value})}><option value="">Select guard</option>{guards.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select></div>
          <div className="field"><label>Date *</label><input type="date" value={availabilityForm.date} onChange={e=>setAvailabilityForm({...availabilityForm,date:e.target.value})}/></div>
          <div className="field"><label>Reason</label><input placeholder="Vacation, sick leave..." value={availabilityForm.reason} onChange={e=>setAvailabilityForm({...availabilityForm,reason:e.target.value})}/></div>
          <div className="modal-actions"><button className="btn-cancel" onClick={()=>setShowAddAvailability(false)}>Cancel</button><button className="btn-save" onClick={addAvailability}>Mark Unavailable</button></div>
        </div></div>}

        {showAddCheckpoint&&<div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setShowAddCheckpoint(false)}><div className="modal">
          <div className="modal-title">Add Checkpoint</div><div className="modal-sub">Create a patrol checkpoint and generate a QR code</div>
          <div className="field"><label>Checkpoint Name *</label><input placeholder="Loading Dock, Main Entrance..." value={checkpointForm.name} onChange={e=>setCheckpointForm({...checkpointForm,name:e.target.value})}/></div>
          <div className="field"><label>Site *</label><select value={checkpointForm.site_id} onChange={e=>setCheckpointForm({...checkpointForm,site_id:e.target.value})}><option value="">Select site</option>{sites.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
          <div className="field"><label>Location Description</label><input placeholder="Floor 3, east stairwell" value={checkpointForm.location} onChange={e=>setCheckpointForm({...checkpointForm,location:e.target.value})}/></div>
          <div className="modal-actions"><button className="btn-cancel" onClick={()=>setShowAddCheckpoint(false)}>Cancel</button><button className="btn-save" onClick={addCheckpoint}>Create Checkpoint</button></div>
        </div></div>}

        {showAddClient&&<div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setShowAddClient(false)}><div className="modal">
          <div className="modal-title">Add Client</div><div className="modal-sub">Create a client portal account linked to a site</div>
          <div className="field"><label>Client Name *</label><input placeholder="Acme Corp" value={clientForm.name} onChange={e=>setClientForm({...clientForm,name:e.target.value})}/></div>
          <div className="field"><label>Email *</label><input placeholder="client@acmecorp.com" value={clientForm.email} onChange={e=>setClientForm({...clientForm,email:e.target.value})}/></div>
          <div className="field"><label>Site *</label><select value={clientForm.site_id} onChange={e=>setClientForm({...clientForm,site_id:e.target.value})}><option value="">Select site</option>{sites.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
          <div className="modal-actions"><button className="btn-cancel" onClick={()=>setShowAddClient(false)}>Cancel</button><button className="btn-save" onClick={addClient}>Create Client</button></div>
        </div></div>}

        {viewingReport&&<div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setViewingReport(null)}><div className="modal modal-wide">
          <div className="modal-title">Activity Report</div>
          <div style={{display:'flex',gap:16,marginBottom:18,flexWrap:'wrap'}}>
            {[['Guard',viewingReport.guards?.name],['Site',viewingReport.sites?.name],['Submitted',new Date(viewingReport.created_at).toLocaleString()]].map(([l,v])=>(
              <div key={l as string} style={{fontSize:12,color:'var(--text3)'}}>{l}: <strong style={{color:'var(--text2)'}}>{v||'—'}</strong></div>
            ))}
          </div>
          <div className="report-block"><div className="report-block-label">Activity Summary</div><div className="report-block-content">{viewingReport.summary}</div></div>
          {viewingReport.observations&&<div className="report-block"><div className="report-block-label">Observations</div><div className="report-block-content">{viewingReport.observations}</div></div>}
          <div className="modal-actions"><button className="btn-cancel" onClick={()=>setViewingReport(null)}>Close</button></div>
        </div></div>}

        {editingGuard&&<div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setEditingGuard(null)}><div className="modal">
          <div className="modal-title">Edit Guard</div><div className="modal-sub">Update guard information</div>
          <div className="field"><label>Full Name *</label><input value={editingGuard.name} onChange={e=>setEditingGuard({...editingGuard,name:e.target.value})}/></div>
          <div className="field"><label>Email</label><input value={editingGuard.email||''} onChange={e=>setEditingGuard({...editingGuard,email:e.target.value})}/></div>
          <div className="field"><label>Phone</label><input value={editingGuard.phone||''} onChange={e=>setEditingGuard({...editingGuard,phone:e.target.value})}/></div>
          <div className="two-col">
            <div className="field"><label>License #</label><input value={editingGuard.license_number||''} onChange={e=>setEditingGuard({...editingGuard,license_number:e.target.value})}/></div>
            <div className="field"><label>Expiry</label><input type="date" value={editingGuard.license_expiry||''} onChange={e=>setEditingGuard({...editingGuard,license_expiry:e.target.value})}/></div>
          </div>
          <div className="modal-actions"><button className="btn-cancel" onClick={()=>setEditingGuard(null)}>Cancel</button><button className="btn-save" onClick={saveGuard}>Save</button></div>
        </div></div>}

        {editingSite&&<div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setEditingSite(null)}><div className="modal">
          <div className="modal-title">Edit Site</div><div className="modal-sub">Update site information</div>
          <div className="field"><label>Site Name *</label><input value={editingSite.name} onChange={e=>setEditingSite({...editingSite,name:e.target.value})}/></div>
          <div className="field"><label>Address</label><input value={editingSite.address||''} onChange={e=>setEditingSite({...editingSite,address:e.target.value})}/></div>
          <div className="two-col">
            <div className="field"><label>Contact Name</label><input value={editingSite.contact_name||''} onChange={e=>setEditingSite({...editingSite,contact_name:e.target.value})}/></div>
            <div className="field"><label>Contact Phone</label><input value={editingSite.contact_phone||''} onChange={e=>setEditingSite({...editingSite,contact_phone:e.target.value})}/></div>
          </div>
          <div className="modal-actions"><button className="btn-cancel" onClick={()=>setEditingSite(null)}>Cancel</button><button className="btn-save" onClick={saveSite}>Save</button></div>
        </div></div>}

        {editingShift&&<div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setEditingShift(null)}><div className="modal">
          <div className="modal-title">Edit Shift</div><div className="modal-sub">Update shift details</div>
          <div className="two-col">
            <div className="field"><label>Guard</label><select value={editingShift.guard_id} onChange={e=>setEditingShift({...editingShift,guard_id:e.target.value})}>{guards.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select></div>
            <div className="field"><label>Site</label><select value={editingShift.site_id} onChange={e=>setEditingShift({...editingShift,site_id:e.target.value})}>{sites.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
          </div>
          <div className="field"><label>Type</label><select value={editingShift.shift_type} onChange={e=>setEditingShift({...editingShift,shift_type:e.target.value})}><option value="day">Day</option><option value="swing">Swing</option><option value="night">Night</option></select></div>
          <div className="two-col">
            <div className="field"><label>Start</label><input type="datetime-local" value={editingShift.start_time?.slice(0,16)} onChange={e=>setEditingShift({...editingShift,start_time:e.target.value})}/></div>
            <div className="field"><label>End</label><input type="datetime-local" value={editingShift.end_time?.slice(0,16)} onChange={e=>setEditingShift({...editingShift,end_time:e.target.value})}/></div>
          </div>
          <div className="two-col">
            <div className="field"><label>Pay Rate</label><input value={editingShift.pay_rate} onChange={e=>setEditingShift({...editingShift,pay_rate:parseFloat(e.target.value)})}/></div>
            <div className="field"><label>Bill Rate</label><input value={editingShift.bill_rate} onChange={e=>setEditingShift({...editingShift,bill_rate:parseFloat(e.target.value)})}/></div>
          </div>
          <div className="modal-actions"><button className="btn-cancel" onClick={()=>setEditingShift(null)}>Cancel</button><button className="btn-save" onClick={saveShift}>Save</button></div>
        </div></div>}

        {editingIncident&&<div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setEditingIncident(null)}><div className="modal">
          <div className="modal-title">Edit Incident</div><div className="modal-sub">Update incident details</div>
          <div className="field"><label>Title *</label><input value={editingIncident.title} onChange={e=>setEditingIncident({...editingIncident,title:e.target.value})}/></div>
          <div className="field"><label>Description</label><textarea style={{height:80,resize:'none'}} value={editingIncident.description||''} onChange={e=>setEditingIncident({...editingIncident,description:e.target.value})}/></div>
          <div className="two-col">
            <div className="field"><label>Severity</label><select value={editingIncident.severity} onChange={e=>setEditingIncident({...editingIncident,severity:e.target.value})}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div>
            <div className="field"><label>Status</label><select value={editingIncident.status} onChange={e=>setEditingIncident({...editingIncident,status:e.target.value})}><option value="open">Open</option><option value="resolved">Resolved</option><option value="closed">Closed</option></select></div>
          </div>
          <div className="modal-actions"><button className="btn-cancel" onClick={()=>setEditingIncident(null)}>Cancel</button><button className="btn-save" onClick={saveIncident}>Save</button></div>
        </div></div>}

        {editingPostOrder&&<div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setEditingPostOrder(null)}><div className="modal">
          <div className="modal-title">Edit Post Order</div><div className="modal-sub">Update guard instructions</div>
          <div className="field"><label>Title *</label><input value={editingPostOrder.title} onChange={e=>setEditingPostOrder({...editingPostOrder,title:e.target.value})}/></div>
          <div className="field"><label>Category</label><select value={editingPostOrder.category} onChange={e=>setEditingPostOrder({...editingPostOrder,category:e.target.value})}><option value="general">General</option><option value="access">Access Control</option><option value="emergency">Emergency</option><option value="patrol">Patrol</option><option value="reporting">Reporting</option></select></div>
          <div className="field"><label>Instructions *</label><textarea style={{height:120,resize:'vertical'}} value={editingPostOrder.content} onChange={e=>setEditingPostOrder({...editingPostOrder,content:e.target.value})}/></div>
          <div className="modal-actions"><button className="btn-cancel" onClick={()=>setEditingPostOrder(null)}>Cancel</button><button className="btn-save" onClick={savePostOrder}>Save</button></div>
        </div></div>}
      </div>
    </>
  )
}
