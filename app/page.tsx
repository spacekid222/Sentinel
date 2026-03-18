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

interface PostOrder {
  id: string
  site_id: string
  title: string
  content: string
  category: string
  order_index: number
  created_at: string
}

interface ActivityReport {
  id: string
  shift_id: string
  guard_id: string
  site_id: string
  summary: string
  observations: string
  status: string
  created_at: string
  guards?: { name: string }
  sites?: { name: string }
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

  // Billing filters
  const [billingStart, setBillingStart] = useState(() => {
    const d = new Date()
    d.setDate(1)
    return d.toISOString().slice(0, 10)
  })
  const [billingEnd, setBillingEnd] = useState(() => new Date().toISOString().slice(0, 10))
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
  const [postOrderForm, setPostOrderForm] = useState({ title: '', content: '', category: 'general', site_id: '' })
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
  async function addPostOrder() {
    const { error } = await supabase.from('post_orders').insert([{ ...postOrderForm, site_id: selectedSiteId }])
    if (!error) { setShowAddPostOrder(false); setPostOrderForm({ title: '', content: '', category: 'general', site_id: '' }); fetchAll() }
  }
  async function addReport() {
    const selectedShift = shifts.find(s => s.id === reportForm.shift_id)
    const { error } = await supabase.from('activity_reports').insert([{
      ...reportForm,
      guard_id: selectedShift?.guard_id || reportForm.guard_id,
      site_id: selectedShift?.site_id || reportForm.site_id,
    }])
    if (!error) { setShowAddReport(false); setReportForm({ shift_id: '', guard_id: '', site_id: '', summary: '', observations: '' }); fetchAll() }
  }

  async function saveGuard() {
    if (!editingGuard) return
    await supabase.from('guards').update({ name: editingGuard.name, email: editingGuard.email, phone: editingGuard.phone, license_number: editingGuard.license_number, license_expiry: editingGuard.license_expiry }).eq('id', editingGuard.id)
    setEditingGuard(null); fetchAll()
  }
  async function saveSite() {
    if (!editingSite) return
    await supabase.from('sites').update({ name: editingSite.name, address: editingSite.address, contact_name: editingSite.contact_name, contact_phone: editingSite.contact_phone }).eq('id', editingSite.id)
    setEditingSite(null); fetchAll()
  }
  async function saveShift() {
    if (!editingShift) return
    await supabase.from('shifts').update({ guard_id: editingShift.guard_id, site_id: editingShift.site_id, start_time: editingShift.start_time, end_time: editingShift.end_time, shift_type: editingShift.shift_type, pay_rate: editingShift.pay_rate, bill_rate: editingShift.bill_rate }).eq('id', editingShift.id)
    setEditingShift(null); fetchAll()
  }
  async function saveIncident() {
    if (!editingIncident) return
    await supabase.from('incidents').update({ title: editingIncident.title, description: editingIncident.description, severity: editingIncident.severity, status: editingIncident.status }).eq('id', editingIncident.id)
    setEditingIncident(null); fetchAll()
  }
  async function savePostOrder() {
    if (!editingPostOrder) return
    await supabase.from('post_orders').update({ title: editingPostOrder.title, content: editingPostOrder.content, category: editingPostOrder.category }).eq('id', editingPostOrder.id)
    setEditingPostOrder(null); fetchAll()
  }

  async function deleteGuard(id: string) { if (!confirm('Delete this guard?')) return; await supabase.from('guards').delete().eq('id', id); fetchAll() }
  async function deleteSite(id: string) { if (!confirm('Delete this site?')) return; await supabase.from('sites').delete().eq('id', id); fetchAll() }
  async function deleteShift(id: string) { if (!confirm('Delete this shift?')) return; await supabase.from('shifts').delete().eq('id', id); fetchAll() }
  async function deleteIncident(id: string) { if (!confirm('Delete this incident?')) return; await supabase.from('incidents').delete().eq('id', id); fetchAll() }
  async function deletePostOrder(id: string) { if (!confirm('Delete this post order?')) return; await supabase.from('post_orders').delete().eq('id', id); fetchAll() }
  async function deleteReport(id: string) { if (!confirm('Delete this report?')) return; await supabase.from('activity_reports').delete().eq('id', id); fetchAll() }

  // Billing calculations
  const billingShifts = shifts.filter(shift => {
    const shiftDate = new Date(shift.start_time)
    const start = new Date(billingStart)
    const end = new Date(billingEnd)
    end.setHours(23, 59, 59)
    const siteMatch = billingSiteFilter === 'all' || shift.site_id === billingSiteFilter
    return shiftDate >= start && shiftDate <= end && siteMatch
  })

  const billingBySite = sites.map(site => {
    const siteShifts = billingShifts.filter(s => s.site_id === site.id)
    const totalHours = siteShifts.reduce((acc, s) => {
      const hrs = (new Date(s.end_time).getTime() - new Date(s.start_time).getTime()) / (1000 * 60 * 60)
      return acc + hrs
    }, 0)
    const totalBillable = siteShifts.reduce((acc, s) => {
      const hrs = (new Date(s.end_time).getTime() - new Date(s.start_time).getTime()) / (1000 * 60 * 60)
      return acc + (hrs * s.bill_rate)
    }, 0)
    const totalPayroll = siteShifts.reduce((acc, s) => {
      const hrs = (new Date(s.end_time).getTime() - new Date(s.start_time).getTime()) / (1000 * 60 * 60)
      return acc + (hrs * s.pay_rate)
    }, 0)
    return { site, shifts: siteShifts, totalHours, totalBillable, totalPayroll, margin: totalBillable - totalPayroll }
  }).filter(row => row.shifts.length > 0)

  const grandTotalBillable = billingBySite.reduce((acc, r) => acc + r.totalBillable, 0)
  const grandTotalPayroll = billingBySite.reduce((acc, r) => acc + r.totalPayroll, 0)
  const grandTotalHours = billingBySite.reduce((acc, r) => acc + r.totalHours, 0)
  const grandMargin = grandTotalBillable - grandTotalPayroll

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '⊞' },
    { id: 'schedule', label: 'Schedule', icon: '◫' },
    { id: 'guards', label: 'Guards', icon: '◎' },
    { id: 'sites', label: 'Sites', icon: '◈' },
    { id: 'postorders', label: 'Post Orders', icon: '☰' },
    { id: 'reports', label: 'Activity Reports', icon: '◉' },
    { id: 'incidents', label: 'Incidents', icon: '◬' },
    { id: 'billing', label: 'Billing', icon: '◇' },
  ]

  const shiftColors: Record<string, { background: string; color: string }> = {
    day:   { background: '#fff3e8', color: '#c2410c' },
    swing: { background: '#fef3c7', color: '#92400e' },
    night: { background: '#ede9fe', color: '#5b21b6' },
  }
  const severityColors: Record<string, { background: string; color: string }> = {
    low:    { background: '#dcfce7', color: '#15803d' },
    medium: { background: '#fef3c7', color: '#92400e' },
    high:   { background: '#fee2e2', color: '#b91c1c' },
  }
  const categoryColors: Record<string, { background: string; color: string }> = {
    general:   { background: '#f0f9ff', color: '#0369a1' },
    access:    { background: '#fef3c7', color: '#92400e' },
    emergency: { background: '#fee2e2', color: '#b91c1c' },
    patrol:    { background: '#f0fdf4', color: '#15803d' },
    reporting: { background: '#f5f3ff', color: '#6d28d9' },
  }

  const today = new Date()
  const todayStr = today.toDateString()
  const todayShifts = shifts.filter(s => new Date(s.start_time).toDateString() === todayStr)
  const openIncidents = incidents.filter(i => i.status === 'open')
  const expiringGuards = guards.filter(g => {
    if (!g.license_expiry) return false
    const exp = new Date(g.license_expiry)
    const diff = (exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    return diff <= 30
  })
  const recentIncidents = incidents.slice(0, 5)
  const selectedSite = sites.find(s => s.id === selectedSiteId)
  const sitePostOrders = postOrders.filter(po => po.site_id === selectedSiteId)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Sora', sans-serif; background: #fafaf9; }
        .sentinel-layout { display: flex; height: 100vh; background: #fafaf9; }
        .sidebar { width: 240px; background: #fff; border-right: 1px solid #f0ede8; display: flex; flex-direction: column; flex-shrink: 0; }
        .sidebar-logo { padding: 28px 24px 24px; border-bottom: 1px solid #f0ede8; }
        .logo-mark { display: flex; align-items: center; gap: 10px; }
        .logo-icon { width: 32px; height: 32px; background: linear-gradient(135deg, #f97316, #ea580c); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px; box-shadow: 0 2px 8px rgba(249,115,22,0.35); }
        .logo-text { font-size: 17px; font-weight: 700; color: #1c1917; letter-spacing: -0.3px; }
        .logo-sub { font-size: 11px; color: #a8a29e; margin-top: 2px; font-weight: 400; letter-spacing: 0.3px; text-transform: uppercase; }
        .sidebar-nav { padding: 16px 12px; flex: 1; overflow-y: auto; }
        .nav-item { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 8px; cursor: pointer; font-size: 13.5px; font-weight: 500; color: #78716c; transition: all 0.15s ease; margin-bottom: 2px; border: none; background: transparent; width: 100%; text-align: left; font-family: 'Sora', sans-serif; }
        .nav-item:hover { background: #fafaf9; color: #1c1917; }
        .nav-item.active { background: #fff5f0; color: #ea580c; font-weight: 600; }
        .nav-icon { width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 14px; }
        .sidebar-footer { padding: 16px 24px; border-top: 1px solid #f0ede8; font-size: 11px; color: #d6d3d1; font-family: 'JetBrains Mono', monospace; }
        .main { flex: 1; overflow: auto; }
        .topbar { padding: 20px 36px; border-bottom: 1px solid #f0ede8; background: #fff; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 10; }
        .page-title { font-size: 20px; font-weight: 700; color: #1c1917; letter-spacing: -0.4px; }
        .page-count { font-size: 13px; color: #a8a29e; font-weight: 400; margin-left: 10px; }
        .btn-primary { background: linear-gradient(135deg, #f97316, #ea580c); color: #fff; border: none; border-radius: 8px; padding: 9px 18px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'Sora', sans-serif; letter-spacing: -0.1px; box-shadow: 0 1px 6px rgba(249,115,22,0.3); transition: all 0.15s ease; display: inline-flex; align-items: center; gap: 6px; }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(249,115,22,0.35); }
        .content { padding: 32px 36px; }
        .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
        .stat-card { background: #fff; border: 1px solid #f0ede8; border-radius: 12px; padding: 20px 22px; }
        .stat-label { font-size: 11px; color: #a8a29e; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
        .stat-value { font-size: 28px; font-weight: 700; color: #1c1917; letter-spacing: -1px; }
        .stat-sub { font-size: 12px; color: #a8a29e; margin-top: 4px; }
        .stat-card.orange { border-color: #fed7aa; background: #fff7f0; }
        .stat-card.orange .stat-value { color: #ea580c; }
        .stat-card.red { border-color: #fecaca; background: #fff5f5; }
        .stat-card.red .stat-value { color: #dc2626; }
        .stat-card.green { border-color: #bbf7d0; background: #f0fdf4; }
        .stat-card.green .stat-value { color: #15803d; }
        .table-card { background: #fff; border: 1px solid #f0ede8; border-radius: 14px; overflow: hidden; }
        table { width: 100%; border-collapse: collapse; }
        thead tr { border-bottom: 1px solid #f5f2ef; }
        th { padding: 13px 20px; text-align: left; font-size: 11px; color: #a8a29e; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
        td { padding: 12px 20px; font-size: 13.5px; color: #44403c; border-bottom: 1px solid #faf9f7; }
        tr:last-child td { border-bottom: none; }
        tr:hover td { background: #fdfcfb; }
        .td-primary { font-weight: 600; color: #1c1917; }
        .td-muted { color: #a8a29e; font-size: 13px; }
        .td-mono { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #78716c; }
        .td-money { font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 600; color: #1c1917; }
        .td-green { font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 600; color: #15803d; }
        .badge { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 20px; font-size: 11.5px; font-weight: 600; }
        .empty-state { text-align: center; padding: 48px 20px; }
        .empty-icon { font-size: 28px; margin-bottom: 10px; opacity: 0.3; }
        .empty-text { font-weight: 500; color: #a8a29e; margin-bottom: 4px; font-size: 14px; }
        .empty-sub { font-size: 12px; color: #c4bfbb; }
        .dashboard-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 28px; }
        .alert-card { background: #fff; border: 1px solid #f0ede8; border-radius: 14px; overflow: hidden; }
        .alert-header { padding: 18px 20px 14px; border-bottom: 1px solid #f5f2ef; display: flex; align-items: center; justify-content: space-between; }
        .alert-title { font-size: 14px; font-weight: 700; color: #1c1917; }
        .alert-count { font-size: 12px; color: #a8a29e; }
        .alert-item { padding: 14px 20px; border-bottom: 1px solid #faf9f7; display: flex; align-items: flex-start; gap: 12px; }
        .alert-item:last-child { border-bottom: none; }
        .alert-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 5px; }
        .alert-item-title { font-size: 13.5px; font-weight: 600; color: #1c1917; margin-bottom: 2px; }
        .alert-item-sub { font-size: 12px; color: #a8a29e; }
        .row-actions { display: flex; gap: 6px; opacity: 0; transition: opacity 0.15s; }
        tr:hover .row-actions { opacity: 1; }
        .btn-edit { background: #f5f2ef; border: none; border-radius: 6px; padding: 5px 10px; font-size: 12px; color: #78716c; cursor: pointer; font-family: 'Sora', sans-serif; font-weight: 500; transition: all 0.15s; }
        .btn-edit:hover { background: #ede9e3; color: #1c1917; }
        .btn-delete { background: #fee2e2; border: none; border-radius: 6px; padding: 5px 10px; font-size: 12px; color: #dc2626; cursor: pointer; font-family: 'Sora', sans-serif; font-weight: 500; transition: all 0.15s; }
        .btn-delete:hover { background: #fecaca; }
        .btn-view { background: #eff6ff; border: none; border-radius: 6px; padding: 5px 10px; font-size: 12px; color: #2563eb; cursor: pointer; font-family: 'Sora', sans-serif; font-weight: 500; transition: all 0.15s; }
        .btn-view:hover { background: #dbeafe; }
        .post-order-layout { display: grid; grid-template-columns: 260px 1fr; gap: 24px; height: calc(100vh - 140px); }
        .site-list { background: #fff; border: 1px solid #f0ede8; border-radius: 14px; overflow: hidden; display: flex; flex-direction: column; }
        .site-list-header { padding: 16px 20px; border-bottom: 1px solid #f5f2ef; font-size: 12px; font-weight: 600; color: #a8a29e; text-transform: uppercase; letter-spacing: 0.5px; }
        .site-list-item { padding: 14px 20px; cursor: pointer; border-bottom: 1px solid #faf9f7; transition: all 0.15s; }
        .site-list-item:hover { background: #fafaf9; }
        .site-list-item.active { background: #fff5f0; border-left: 3px solid #f97316; }
        .site-list-item-name { font-size: 13.5px; font-weight: 600; color: #1c1917; }
        .site-list-item-count { font-size: 12px; color: #a8a29e; margin-top: 2px; }
        .post-orders-panel { background: #fff; border: 1px solid #f0ede8; border-radius: 14px; overflow: hidden; display: flex; flex-direction: column; }
        .post-orders-header { padding: 18px 24px; border-bottom: 1px solid #f5f2ef; display: flex; align-items: center; justify-content: space-between; }
        .post-orders-header-left { font-size: 16px; font-weight: 700; color: #1c1917; }
        .post-orders-header-sub { font-size: 12px; color: #a8a29e; margin-top: 2px; }
        .post-orders-body { flex: 1; overflow: auto; padding: 20px 24px; }
        .post-order-card { background: #fafaf9; border: 1px solid #f0ede8; border-radius: 10px; padding: 18px 20px; margin-bottom: 14px; transition: all 0.15s; }
        .post-order-card:hover { border-color: #e8e3de; }
        .post-order-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
        .post-order-card-title { font-size: 14px; font-weight: 700; color: #1c1917; }
        .post-order-card-actions { display: flex; gap: 6px; opacity: 0; transition: opacity 0.15s; }
        .post-order-card:hover .post-order-card-actions { opacity: 1; }
        .post-order-card-content { font-size: 13.5px; color: #44403c; line-height: 1.6; white-space: pre-wrap; }
        .billing-filters { background: #fff; border: 1px solid #f0ede8; border-radius: 12px; padding: 20px 24px; margin-bottom: 24px; display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
        .filter-label { font-size: 12px; font-weight: 600; color: #78716c; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 6px; }
        .filter-field { display: flex; flex-direction: column; }
        .filter-input { background: #fafaf9; border: 1px solid #e8e3de; border-radius: 8px; padding: 8px 12px; color: #1c1917; font-size: 13px; font-family: 'Sora', sans-serif; outline: none; }
        .filter-input:focus { border-color: #f97316; }
        .billing-totals { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
        .billing-site-row { background: #fff; border: 1px solid #f0ede8; border-radius: 12px; margin-bottom: 16px; overflow: hidden; }
        .billing-site-header { padding: 16px 20px; background: #fafaf9; border-bottom: 1px solid #f0ede8; display: flex; align-items: center; justify-content: space-between; }
        .billing-site-name { font-size: 15px; font-weight: 700; color: #1c1917; }
        .billing-site-meta { font-size: 12px; color: #a8a29e; margin-top: 2px; }
        .billing-site-totals { display: flex; gap: 32px; }
        .billing-site-total-item { text-align: right; }
        .billing-site-total-label { font-size: 11px; color: #a8a29e; text-transform: uppercase; letter-spacing: 0.4px; }
        .billing-site-total-value { font-size: 16px; font-weight: 700; font-family: 'JetBrains Mono', monospace; color: #1c1917; margin-top: 2px; }
        .billing-site-total-value.green { color: #15803d; }
        .billing-grand-total { background: #1c1917; border-radius: 12px; padding: 20px 24px; display: flex; align-items: center; justify-content: space-between; margin-top: 24px; }
        .billing-grand-label { font-size: 14px; font-weight: 600; color: #a8a29e; }
        .billing-grand-values { display: flex; gap: 40px; }
        .billing-grand-item { text-align: right; }
        .billing-grand-item-label { font-size: 11px; color: #78716c; text-transform: uppercase; letter-spacing: 0.4px; }
        .billing-grand-item-value { font-size: 20px; font-weight: 700; font-family: 'JetBrains Mono', monospace; color: #fff; margin-top: 2px; }
        .billing-grand-item-value.green { color: #4ade80; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(28,25,23,0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 100; animation: fadeIn 0.15s ease; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .modal-box { background: #fff; border-radius: 16px; padding: 32px; width: 520px; border: 1px solid #f0ede8; box-shadow: 0 20px 60px rgba(28,25,23,0.12); animation: slideUp 0.2s ease; }
        .modal-title { font-size: 18px; font-weight: 700; color: #1c1917; letter-spacing: -0.3px; margin-bottom: 6px; }
        .modal-sub { font-size: 13px; color: #a8a29e; margin-bottom: 24px; }
        .field-label { font-size: 12px; font-weight: 600; color: #78716c; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.4px; }
        .field-wrap { margin-bottom: 14px; }
        input, select, textarea { width: 100%; background: #fafaf9; border: 1px solid #e8e3de; border-radius: 8px; padding: 10px 14px; color: #1c1917; font-size: 13.5px; font-family: 'Sora', sans-serif; transition: border-color 0.15s; outline: none; }
        input:focus, select:focus, textarea:focus { border-color: #f97316; background: #fff; box-shadow: 0 0 0 3px rgba(249,115,22,0.08); }
        .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
        .btn-secondary { background: transparent; color: #78716c; border: 1px solid #e8e3de; border-radius: 8px; padding: 9px 18px; font-size: 13px; font-weight: 500; cursor: pointer; font-family: 'Sora', sans-serif; transition: all 0.15s; }
        .btn-secondary:hover { background: #fafaf9; }
        .expiry-warn { color: #dc2626; font-weight: 600; }
        .sign-out-btn { background: transparent; border: 1px solid #f0ede8; border-radius: 6px; padding: 6px 10px; font-size: 11px; color: #a8a29e; cursor: pointer; font-family: 'Sora', sans-serif; width: 100%; margin-bottom: 8px; transition: all 0.15s; }
        .sign-out-btn:hover { background: #fafaf9; color: #78716c; }
      `}</style>

      <div className="sentinel-layout">
        <div className="sidebar">
          <div className="sidebar-logo">
            <div className="logo-mark">
              <div className="logo-icon">⚡</div>
              <div><div className="logo-text">Sentinel</div></div>
            </div>
            <div className="logo-sub">Security Management</div>
          </div>
          <nav className="sidebar-nav">
            {navItems.map(item => (
              <button key={item.id} className={`nav-item${activeNav === item.id ? ' active' : ''}`} onClick={() => setActiveNav(item.id)}>
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
          <div className="sidebar-footer">
            <button className="sign-out-btn" onClick={async () => { await supabase.auth.signOut(); window.location.href = '/login' }}>Sign out</button>
            <div>v0.1.0 · sentinel.app</div>
          </div>
        </div>

        <div className="main">
          <div className="topbar">
            <div style={{ display: 'flex', alignItems: 'baseline' }}>
              <span className="page-title">{navItems.find(n => n.id === activeNav)?.label}</span>
              <span className="page-count">
                {activeNav === 'schedule' && ` · ${shifts.length} shifts`}
                {activeNav === 'guards' && ` · ${guards.length} guards`}
                {activeNav === 'sites' && ` · ${sites.length} sites`}
                {activeNav === 'incidents' && ` · ${incidents.length} incidents`}
                {activeNav === 'postorders' && ` · ${postOrders.length} orders`}
                {activeNav === 'reports' && ` · ${activityReports.length} reports`}
              </span>
            </div>
            {activeNav === 'schedule' && <button className="btn-primary" onClick={() => setShowAddShift(true)}>+ Add Shift</button>}
            {activeNav === 'guards' && <button className="btn-primary" onClick={() => setShowAddGuard(true)}>+ Add Guard</button>}
            {activeNav === 'sites' && <button className="btn-primary" onClick={() => setShowAddSite(true)}>+ Add Site</button>}
            {activeNav === 'incidents' && <button className="btn-primary" onClick={() => setShowAddIncident(true)}>+ Log Incident</button>}
            {activeNav === 'postorders' && selectedSiteId && <button className="btn-primary" onClick={() => setShowAddPostOrder(true)}>+ Add Order</button>}
            {activeNav === 'reports' && <button className="btn-primary" onClick={() => setShowAddReport(true)}>+ Submit Report</button>}
          </div>

          <div className="content">
            {loading && <div style={{ color: '#a8a29e', fontSize: 14 }}>Loading...</div>}

            {/* DASHBOARD */}
            {!loading && activeNav === 'dashboard' && (
              <div>
                <div className="stats-row">
                  <div className="stat-card">
                    <div className="stat-label">Total Guards</div>
                    <div className="stat-value">{guards.length}</div>
                    <div className="stat-sub">{guards.filter(g => g.status === 'active').length} active</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Sites</div>
                    <div className="stat-value">{sites.length}</div>
                    <div className="stat-sub">{sites.filter(s => s.status === 'active').length} active</div>
                  </div>
                  <div className={`stat-card${openIncidents.length > 0 ? ' orange' : ''}`}>
                    <div className="stat-label">Open Incidents</div>
                    <div className="stat-value">{openIncidents.length}</div>
                    <div className="stat-sub">Needs attention</div>
                  </div>
                  <div className={`stat-card${expiringGuards.length > 0 ? ' red' : ''}`}>
                    <div className="stat-label">Expiring Licenses</div>
                    <div className="stat-value">{expiringGuards.length}</div>
                    <div className="stat-sub">Within 30 days</div>
                  </div>
                </div>
                <div className="dashboard-grid">
                  <div className="alert-card">
                    <div className="alert-header">
                      <div className="alert-title">Today's Shifts</div>
                      <div className="alert-count">{todayShifts.length} scheduled</div>
                    </div>
                    {todayShifts.length === 0 ? (
                      <div className="empty-state"><div className="empty-icon">◫</div><div className="empty-text">No shifts today</div></div>
                    ) : todayShifts.map(shift => (
                      <div key={shift.id} className="alert-item">
                        <div className="alert-dot" style={{ background: shift.shift_type === 'night' ? '#7c3aed' : '#f97316' }} />
                        <div>
                          <div className="alert-item-title">{shift.guards?.name || 'Unassigned'}</div>
                          <div className="alert-item-sub">{shift.sites?.name} · {new Date(shift.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {new Date(shift.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                        <span className="badge" style={{ marginLeft: 'auto', ...shiftColors[shift.shift_type] }}>{shift.shift_type}</span>
                      </div>
                    ))}
                  </div>
                  <div className="alert-card">
                    <div className="alert-header">
                      <div className="alert-title">Recent Incidents</div>
                      <div className="alert-count">{openIncidents.length} open</div>
                    </div>
                    {recentIncidents.length === 0 ? (
                      <div className="empty-state"><div className="empty-icon">◬</div><div className="empty-text">No incidents logged</div><div className="empty-sub">All clear</div></div>
                    ) : recentIncidents.map(incident => (
                      <div key={incident.id} className="alert-item">
                        <div className="alert-dot" style={{ background: incident.severity === 'high' ? '#dc2626' : incident.severity === 'medium' ? '#f59e0b' : '#22c55e' }} />
                        <div>
                          <div className="alert-item-title">{incident.title}</div>
                          <div className="alert-item-sub">{incident.sites?.name || 'No site'} · {new Date(incident.created_at).toLocaleDateString()}</div>
                        </div>
                        <span className="badge" style={{ marginLeft: 'auto', ...severityColors[incident.severity] }}>{incident.severity}</span>
                      </div>
                    ))}
                  </div>
                  <div className="alert-card">
                    <div className="alert-header">
                      <div className="alert-title">License Alerts</div>
                      <div className="alert-count">{expiringGuards.length} expiring soon</div>
                    </div>
                    {expiringGuards.length === 0 ? (
                      <div className="empty-state"><div className="empty-icon">◎</div><div className="empty-text">All licenses valid</div><div className="empty-sub">No expirations in the next 30 days</div></div>
                    ) : expiringGuards.map(guard => {
                      const exp = new Date(guard.license_expiry)
                      const diff = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                      return (
                        <div key={guard.id} className="alert-item">
                          <div className="alert-dot" style={{ background: diff <= 7 ? '#dc2626' : '#f59e0b' }} />
                          <div>
                            <div className="alert-item-title">{guard.name}</div>
                            <div className="alert-item-sub">Expires {guard.license_expiry}</div>
                          </div>
                          <span className="badge" style={{ marginLeft: 'auto', background: diff <= 7 ? '#fee2e2' : '#fef3c7', color: diff <= 7 ? '#b91c1c' : '#92400e' }}>
                            {diff <= 0 ? 'Expired' : `${diff}d left`}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                  <div className="alert-card">
                    <div className="alert-header"><div className="alert-title">Overview</div></div>
                    <div style={{ padding: '8px 0' }}>
                      {[
                        { label: 'Total shifts scheduled', value: shifts.length },
                        { label: 'Day shifts', value: shifts.filter(s => s.shift_type === 'day').length },
                        { label: 'Night shifts', value: shifts.filter(s => s.shift_type === 'night').length },
                        { label: 'Total incidents', value: incidents.length },
                        { label: 'Activity reports', value: activityReports.length },
                        { label: 'High severity incidents', value: incidents.filter(i => i.severity === 'high').length },
                      ].map(row => (
                        <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 20px', borderBottom: '1px solid #faf9f7' }}>
                          <span style={{ fontSize: 13.5, color: '#78716c' }}>{row.label}</span>
                          <span style={{ fontSize: 14, fontWeight: 700, color: '#1c1917', fontFamily: 'JetBrains Mono, monospace' }}>{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SCHEDULE */}
            {!loading && activeNav === 'schedule' && (
              <>
                <div className="stats-row">
                  <div className="stat-card"><div className="stat-label">Total Shifts</div><div className="stat-value">{shifts.length}</div></div>
                  <div className="stat-card"><div className="stat-label">Day Shifts</div><div className="stat-value">{shifts.filter(s => s.shift_type === 'day').length}</div></div>
                  <div className="stat-card"><div className="stat-label">Night Shifts</div><div className="stat-value">{shifts.filter(s => s.shift_type === 'night').length}</div></div>
                  <div className="stat-card"><div className="stat-label">Guards Active</div><div className="stat-value">{guards.filter(g => g.status === 'active').length}</div></div>
                </div>
                <div className="table-card">
                  <table>
                    <thead><tr>{['Guard', 'Site', 'Type', 'Start', 'End', 'Pay Rate', 'Bill Rate', 'Status', ''].map(h => <th key={h}>{h}</th>)}</tr></thead>
                    <tbody>
                      {shifts.length === 0 && <tr><td colSpan={9}><div className="empty-state"><div className="empty-icon">◫</div><div className="empty-text">No shifts scheduled yet</div></div></td></tr>}
                      {shifts.map(shift => (
                        <tr key={shift.id}>
                          <td className="td-primary">{shift.guards?.name || '—'}</td>
                          <td>{shift.sites?.name || '—'}</td>
                          <td><span className="badge" style={shiftColors[shift.shift_type]}>{shift.shift_type}</span></td>
                          <td className="td-mono">{new Date(shift.start_time).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                          <td className="td-mono">{new Date(shift.end_time).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                          <td className="td-mono">${shift.pay_rate}/hr</td>
                          <td className="td-mono">${shift.bill_rate}/hr</td>
                          <td><span className="badge" style={{ background: '#dcfce7', color: '#15803d' }}>{shift.status}</span></td>
                          <td><div className="row-actions"><button className="btn-edit" onClick={() => setEditingShift(shift)}>Edit</button><button className="btn-delete" onClick={() => deleteShift(shift.id)}>Delete</button></div></td>
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
                  <thead><tr>{['Name', 'Email', 'Phone', 'License #', 'Expiry', 'Status', ''].map(h => <th key={h}>{h}</th>)}</tr></thead>
                  <tbody>
                    {guards.length === 0 && <tr><td colSpan={7}><div className="empty-state"><div className="empty-icon">◎</div><div className="empty-text">No guards added yet</div></div></td></tr>}
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
                          <td><div className="row-actions"><button className="btn-edit" onClick={() => setEditingGuard(guard)}>Edit</button><button className="btn-delete" onClick={() => deleteGuard(guard.id)}>Delete</button></div></td>
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
                  <thead><tr>{['Site Name', 'Address', 'Contact', 'Phone', 'Status', ''].map(h => <th key={h}>{h}</th>)}</tr></thead>
                  <tbody>
                    {sites.length === 0 && <tr><td colSpan={6}><div className="empty-state"><div className="empty-icon">◈</div><div className="empty-text">No sites added yet</div></div></td></tr>}
                    {sites.map(site => (
                      <tr key={site.id}>
                        <td className="td-primary">{site.name}</td>
                        <td className="td-muted">{site.address || '—'}</td>
                        <td className="td-muted">{site.contact_name || '—'}</td>
                        <td className="td-muted">{site.contact_phone || '—'}</td>
                        <td><span className="badge" style={{ background: '#dcfce7', color: '#15803d' }}>{site.status}</span></td>
                        <td><div className="row-actions"><button className="btn-edit" onClick={() => setEditingSite(site)}>Edit</button><button className="btn-delete" onClick={() => deleteSite(site.id)}>Delete</button></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* POST ORDERS */}
            {!loading && activeNav === 'postorders' && (
              <div className="post-order-layout">
                <div className="site-list">
                  <div className="site-list-header">Sites</div>
                  {sites.length === 0 && <div className="empty-state"><div className="empty-text">No sites yet</div></div>}
                  {sites.map(site => (
                    <div key={site.id} className={`site-list-item${selectedSiteId === site.id ? ' active' : ''}`} onClick={() => setSelectedSiteId(site.id)}>
                      <div className="site-list-item-name">{site.name}</div>
                      <div className="site-list-item-count">{postOrders.filter(po => po.site_id === site.id).length} orders</div>
                    </div>
                  ))}
                </div>
                <div className="post-orders-panel">
                  {!selectedSite ? (
                    <div className="empty-state"><div className="empty-text">Select a site to view post orders</div></div>
                  ) : (
                    <>
                      <div className="post-orders-header">
                        <div>
                          <div className="post-orders-header-left">{selectedSite.name}</div>
                          <div className="post-orders-header-sub">{sitePostOrders.length} post orders · {selectedSite.address || 'No address'}</div>
                        </div>
                      </div>
                      <div className="post-orders-body">
                        {sitePostOrders.length === 0 && (
                          <div className="empty-state"><div className="empty-icon">☰</div><div className="empty-text">No post orders for this site</div><div className="empty-sub">Click "+ Add Order" to add instructions for guards</div></div>
                        )}
                        {sitePostOrders.map(po => (
                          <div key={po.id} className="post-order-card">
                            <div className="post-order-card-header">
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div className="post-order-card-title">{po.title}</div>
                                <span className="badge" style={categoryColors[po.category] || { background: '#f5f5f4', color: '#78716c' }}>{po.category}</span>
                              </div>
                              <div className="post-order-card-actions">
                                <button className="btn-edit" onClick={() => setEditingPostOrder(po)}>Edit</button>
                                <button className="btn-delete" onClick={() => deletePostOrder(po.id)}>Delete</button>
                              </div>
                            </div>
                            <div className="post-order-card-content">{po.content}</div>
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
              <div className="table-card">
                <table>
                  <thead><tr>{['Guard', 'Site', 'Shift', 'Summary', 'Submitted', ''].map(h => <th key={h}>{h}</th>)}</tr></thead>
                  <tbody>
                    {activityReports.length === 0 && (
                      <tr><td colSpan={6}><div className="empty-state"><div className="empty-icon">◉</div><div className="empty-text">No activity reports yet</div><div className="empty-sub">Guards submit reports at the end of each shift</div></div></td></tr>
                    )}
                    {activityReports.map(report => (
                      <tr key={report.id}>
                        <td className="td-primary">{report.guards?.name || '—'}</td>
                        <td>{report.sites?.name || '—'}</td>
                        <td className="td-mono">{report.shifts ? new Date(report.shifts.start_time).toLocaleDateString([], { month: 'short', day: 'numeric' }) : '—'}</td>
                        <td style={{ maxWidth: 280 }}><div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13.5, color: '#44403c' }}>{report.summary}</div></td>
                        <td className="td-mono">{new Date(report.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                        <td><div className="row-actions"><button className="btn-view" onClick={() => setViewingReport(report)}>View</button><button className="btn-delete" onClick={() => deleteReport(report.id)}>Delete</button></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* BILLING */}
            {!loading && activeNav === 'billing' && (
              <div>
                <div className="billing-filters">
                  <div className="filter-field">
                    <div className="filter-label">From</div>
                    <input type="date" className="filter-input" value={billingStart} onChange={e => setBillingStart(e.target.value)} />
                  </div>
                  <div className="filter-field">
                    <div className="filter-label">To</div>
                    <input type="date" className="filter-input" value={billingEnd} onChange={e => setBillingEnd(e.target.value)} />
                  </div>
                  <div className="filter-field">
                    <div className="filter-label">Site</div>
                    <select className="filter-input" value={billingSiteFilter} onChange={e => setBillingSiteFilter(e.target.value)}>
                      <option value="all">All Sites</option>
                      {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                    <div style={{ fontSize: 12, color: '#a8a29e', marginBottom: 4 }}>{billingShifts.length} shifts in range</div>
                    <div style={{ fontSize: 12, color: '#a8a29e' }}>{grandTotalHours.toFixed(1)} total hours</div>
                  </div>
                </div>

                <div className="billing-totals">
                  <div className="stat-card">
                    <div className="stat-label">Total Billable</div>
                    <div className="stat-value" style={{ fontSize: 22 }}>${grandTotalBillable.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    <div className="stat-sub">Client invoices</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Total Payroll</div>
                    <div className="stat-value" style={{ fontSize: 22 }}>${grandTotalPayroll.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    <div className="stat-sub">Guard wages</div>
                  </div>
                  <div className="stat-card green">
                    <div className="stat-label">Gross Margin</div>
                    <div className="stat-value" style={{ fontSize: 22 }}>${grandMargin.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    <div className="stat-sub">{grandTotalBillable > 0 ? ((grandMargin / grandTotalBillable) * 100).toFixed(1) : 0}% margin</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Total Hours</div>
                    <div className="stat-value" style={{ fontSize: 22 }}>{grandTotalHours.toFixed(1)}</div>
                    <div className="stat-sub">Across {billingBySite.length} sites</div>
                  </div>
                </div>

                {billingBySite.length === 0 ? (
                  <div className="table-card"><div className="empty-state"><div className="empty-icon">◇</div><div className="empty-text">No shifts in this date range</div><div className="empty-sub">Adjust the filters above</div></div></div>
                ) : billingBySite.map(row => (
                  <div key={row.site.id} className="billing-site-row">
                    <div className="billing-site-header">
                      <div>
                        <div className="billing-site-name">{row.site.name}</div>
                        <div className="billing-site-meta">{row.shifts.length} shifts · {row.totalHours.toFixed(1)} hours · {row.site.contact_name || 'No contact'}</div>
                      </div>
                      <div className="billing-site-totals">
                        <div className="billing-site-total-item">
                          <div className="billing-site-total-label">Billable</div>
                          <div className="billing-site-total-value">${row.totalBillable.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        </div>
                        <div className="billing-site-total-item">
                          <div className="billing-site-total-label">Payroll</div>
                          <div className="billing-site-total-value">${row.totalPayroll.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        </div>
                        <div className="billing-site-total-item">
                          <div className="billing-site-total-label">Margin</div>
                          <div className="billing-site-total-value green">${row.margin.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        </div>
                      </div>
                    </div>
                    <table>
                      <thead><tr>{['Guard', 'Date', 'Type', 'Hours', 'Bill Rate', 'Billable', 'Pay Rate', 'Payroll'].map(h => <th key={h}>{h}</th>)}</tr></thead>
                      <tbody>
                        {row.shifts.map(shift => {
                          const hrs = (new Date(shift.end_time).getTime() - new Date(shift.start_time).getTime()) / (1000 * 60 * 60)
                          return (
                            <tr key={shift.id}>
                              <td className="td-primary">{shift.guards?.name || '—'}</td>
                              <td className="td-mono">{new Date(shift.start_time).toLocaleDateString([], { month: 'short', day: 'numeric' })}</td>
                              <td><span className="badge" style={shiftColors[shift.shift_type]}>{shift.shift_type}</span></td>
                              <td className="td-mono">{hrs.toFixed(1)}h</td>
                              <td className="td-mono">${shift.bill_rate}/hr</td>
                              <td className="td-money">${(hrs * shift.bill_rate).toFixed(2)}</td>
                              <td className="td-mono">${shift.pay_rate}/hr</td>
                              <td className="td-mono">${(hrs * shift.pay_rate).toFixed(2)}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                ))}

                {billingBySite.length > 0 && (
                  <div className="billing-grand-total">
                    <div className="billing-grand-label">Grand Total · {new Date(billingStart).toLocaleDateString([], { month: 'short', day: 'numeric' })} – {new Date(billingEnd).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                    <div className="billing-grand-values">
                      <div className="billing-grand-item">
                        <div className="billing-grand-item-label">Hours</div>
                        <div className="billing-grand-item-value">{grandTotalHours.toFixed(1)}</div>
                      </div>
                      <div className="billing-grand-item">
                        <div className="billing-grand-item-label">Payroll</div>
                        <div className="billing-grand-item-value">${grandTotalPayroll.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                      </div>
                      <div className="billing-grand-item">
                        <div className="billing-grand-item-label">Billable</div>
                        <div className="billing-grand-item-value">${grandTotalBillable.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                      </div>
                      <div className="billing-grand-item">
                        <div className="billing-grand-item-label">Margin</div>
                        <div className="billing-grand-item-value green">${grandMargin.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* INCIDENTS */}
            {!loading && activeNav === 'incidents' && (
              <div className="table-card">
                <table>
                  <thead><tr>{['Title', 'Site', 'Severity', 'Status', 'Date', ''].map(h => <th key={h}>{h}</th>)}</tr></thead>
                  <tbody>
                    {incidents.length === 0 && <tr><td colSpan={6}><div className="empty-state"><div className="empty-icon">◬</div><div className="empty-text">No incidents logged</div></div></td></tr>}
                    {incidents.map(incident => (
                      <tr key={incident.id}>
                        <td className="td-primary">{incident.title}</td>
                        <td className="td-muted">{incident.sites?.name || '—'}</td>
                        <td><span className="badge" style={severityColors[incident.severity]}>{incident.severity}</span></td>
                        <td><span className="badge" style={{ background: '#fff5f0', color: '#ea580c' }}>{incident.status}</span></td>
                        <td className="td-mono">{new Date(incident.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                        <td><div className="row-actions"><button className="btn-edit" onClick={() => setEditingIncident(incident)}>Edit</button><button className="btn-delete" onClick={() => deleteIncident(incident.id)}>Delete</button></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ADD MODALS */}
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
              <div className="modal-actions"><button className="btn-secondary" onClick={() => setShowAddGuard(false)}>Cancel</button><button className="btn-primary" onClick={addGuard}>Add Guard</button></div>
            </div>
          </div>
        )}

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
              <div className="modal-actions"><button className="btn-secondary" onClick={() => setShowAddSite(false)}>Cancel</button><button className="btn-primary" onClick={addSite}>Add Site</button></div>
            </div>
          </div>
        )}

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
                  <option value="day">Day</option><option value="swing">Swing</option><option value="night">Night</option>
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
              <div className="modal-actions"><button className="btn-secondary" onClick={() => setShowAddShift(false)}>Cancel</button><button className="btn-primary" onClick={addShift}>Schedule Shift</button></div>
            </div>
          </div>
        )}

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
                    <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
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
              <div className="modal-actions"><button className="btn-secondary" onClick={() => setShowAddIncident(false)}>Cancel</button><button className="btn-primary" onClick={addIncident}>Log Incident</button></div>
            </div>
          </div>
        )}

        {showAddPostOrder && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAddPostOrder(false)}>
            <div className="modal-box">
              <div className="modal-title">Add Post Order</div>
              <div className="modal-sub">Add instructions for guards at {selectedSite?.name}</div>
              <div className="field-wrap"><div className="field-label">Title *</div><input placeholder="e.g. Access Control Procedures" value={postOrderForm.title} onChange={e => setPostOrderForm({...postOrderForm, title: e.target.value})} /></div>
              <div className="field-wrap"><div className="field-label">Category</div>
                <select value={postOrderForm.category} onChange={e => setPostOrderForm({...postOrderForm, category: e.target.value})}>
                  <option value="general">General</option>
                  <option value="access">Access Control</option>
                  <option value="emergency">Emergency</option>
                  <option value="patrol">Patrol</option>
                  <option value="reporting">Reporting</option>
                </select>
              </div>
              <div className="field-wrap"><div className="field-label">Instructions *</div><textarea style={{ height: 140, resize: 'vertical' }} placeholder="Enter detailed instructions for guards..." value={postOrderForm.content} onChange={e => setPostOrderForm({...postOrderForm, content: e.target.value})} /></div>
              <div className="modal-actions"><button className="btn-secondary" onClick={() => setShowAddPostOrder(false)}>Cancel</button><button className="btn-primary" onClick={addPostOrder}>Add Post Order</button></div>
            </div>
          </div>
        )}

        {showAddReport && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAddReport(false)}>
            <div className="modal-box">
              <div className="modal-title">Submit Activity Report</div>
              <div className="modal-sub">End of shift report — summarize what happened</div>
              <div className="field-wrap"><div className="field-label">Shift *</div>
                <select value={reportForm.shift_id} onChange={e => setReportForm({...reportForm, shift_id: e.target.value})}>
                  <option value="">Select shift</option>
                  {shifts.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.guards?.name} — {s.sites?.name} ({new Date(s.start_time).toLocaleDateString([], { month: 'short', day: 'numeric' })})
                    </option>
                  ))}
                </select>
              </div>
              <div className="field-wrap"><div className="field-label">Activity Summary *</div>
                <textarea style={{ height: 100, resize: 'vertical' }} placeholder="Describe all activity during the shift..." value={reportForm.summary} onChange={e => setReportForm({...reportForm, summary: e.target.value})} />
              </div>
              <div className="field-wrap"><div className="field-label">Additional Observations</div>
                <textarea style={{ height: 80, resize: 'vertical' }} placeholder="Any other observations, maintenance issues, concerns..." value={reportForm.observations} onChange={e => setReportForm({...reportForm, observations: e.target.value})} />
              </div>
              <div className="modal-actions"><button className="btn-secondary" onClick={() => setShowAddReport(false)}>Cancel</button><button className="btn-primary" onClick={addReport}>Submit Report</button></div>
            </div>
          </div>
        )}

        {viewingReport && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setViewingReport(null)}>
            <div className="modal-box" style={{ width: 600 }}>
              <div className="modal-title">Activity Report</div>
              <div style={{ display: 'flex', gap: 20, marginBottom: 24, flexWrap: 'wrap' }}>
                <div style={{ fontSize: 12, color: '#a8a29e' }}>Guard: <strong style={{ color: '#78716c' }}>{viewingReport.guards?.name || '—'}</strong></div>
                <div style={{ fontSize: 12, color: '#a8a29e' }}>Site: <strong style={{ color: '#78716c' }}>{viewingReport.sites?.name || '—'}</strong></div>
                <div style={{ fontSize: 12, color: '#a8a29e' }}>Submitted: <strong style={{ color: '#78716c' }}>{new Date(viewingReport.created_at).toLocaleString()}</strong></div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#a8a29e', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Activity Summary</div>
                <div style={{ fontSize: 14, color: '#44403c', lineHeight: 1.7, whiteSpace: 'pre-wrap', background: '#fafaf9', border: '1px solid #f0ede8', borderRadius: 8, padding: '14px 16px' }}>{viewingReport.summary}</div>
              </div>
              {viewingReport.observations && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#a8a29e', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Additional Observations</div>
                  <div style={{ fontSize: 14, color: '#44403c', lineHeight: 1.7, whiteSpace: 'pre-wrap', background: '#fafaf9', border: '1px solid #f0ede8', borderRadius: 8, padding: '14px 16px' }}>{viewingReport.observations}</div>
                </div>
              )}
              <div className="modal-actions"><button className="btn-secondary" onClick={() => setViewingReport(null)}>Close</button></div>
            </div>
          </div>
        )}

        {editingGuard && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setEditingGuard(null)}>
            <div className="modal-box">
              <div className="modal-title">Edit Guard</div>
              <div className="modal-sub">Update guard information</div>
              <div className="field-wrap"><div className="field-label">Full Name *</div><input value={editingGuard.name} onChange={e => setEditingGuard({...editingGuard, name: e.target.value})} /></div>
              <div className="field-wrap"><div className="field-label">Email</div><input value={editingGuard.email || ''} onChange={e => setEditingGuard({...editingGuard, email: e.target.value})} /></div>
              <div className="field-wrap"><div className="field-label">Phone</div><input value={editingGuard.phone || ''} onChange={e => setEditingGuard({...editingGuard, phone: e.target.value})} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="field-wrap"><div className="field-label">License #</div><input value={editingGuard.license_number || ''} onChange={e => setEditingGuard({...editingGuard, license_number: e.target.value})} /></div>
                <div className="field-wrap"><div className="field-label">License Expiry</div><input type="date" value={editingGuard.license_expiry || ''} onChange={e => setEditingGuard({...editingGuard, license_expiry: e.target.value})} /></div>
              </div>
              <div className="modal-actions"><button className="btn-secondary" onClick={() => setEditingGuard(null)}>Cancel</button><button className="btn-primary" onClick={saveGuard}>Save Changes</button></div>
            </div>
          </div>
        )}

        {editingSite && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setEditingSite(null)}>
            <div className="modal-box">
              <div className="modal-title">Edit Site</div>
              <div className="modal-sub">Update site information</div>
              <div className="field-wrap"><div className="field-label">Site Name *</div><input value={editingSite.name} onChange={e => setEditingSite({...editingSite, name: e.target.value})} /></div>
              <div className="field-wrap"><div className="field-label">Address</div><input value={editingSite.address || ''} onChange={e => setEditingSite({...editingSite, address: e.target.value})} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="field-wrap"><div className="field-label">Contact Name</div><input value={editingSite.contact_name || ''} onChange={e => setEditingSite({...editingSite, contact_name: e.target.value})} /></div>
                <div className="field-wrap"><div className="field-label">Contact Phone</div><input value={editingSite.contact_phone || ''} onChange={e => setEditingSite({...editingSite, contact_phone: e.target.value})} /></div>
              </div>
              <div className="modal-actions"><button className="btn-secondary" onClick={() => setEditingSite(null)}>Cancel</button><button className="btn-primary" onClick={saveSite}>Save Changes</button></div>
            </div>
          </div>
        )}

        {editingShift && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setEditingShift(null)}>
            <div className="modal-box">
              <div className="modal-title">Edit Shift</div>
              <div className="modal-sub">Update shift details</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="field-wrap"><div className="field-label">Guard</div>
                  <select value={editingShift.guard_id} onChange={e => setEditingShift({...editingShift, guard_id: e.target.value})}>
                    {guards.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>
                <div className="field-wrap"><div className="field-label">Site</div>
                  <select value={editingShift.site_id} onChange={e => setEditingShift({...editingShift, site_id: e.target.value})}>
                    {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="field-wrap"><div className="field-label">Shift Type</div>
                <select value={editingShift.shift_type} onChange={e => setEditingShift({...editingShift, shift_type: e.target.value})}>
                  <option value="day">Day</option><option value="swing">Swing</option><option value="night">Night</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="field-wrap"><div className="field-label">Start Time</div><input type="datetime-local" value={editingShift.start_time?.slice(0,16)} onChange={e => setEditingShift({...editingShift, start_time: e.target.value})} /></div>
                <div className="field-wrap"><div className="field-label">End Time</div><input type="datetime-local" value={editingShift.end_time?.slice(0,16)} onChange={e => setEditingShift({...editingShift, end_time: e.target.value})} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="field-wrap"><div className="field-label">Pay Rate</div><input value={editingShift.pay_rate} onChange={e => setEditingShift({...editingShift, pay_rate: parseFloat(e.target.value)})} /></div>
                <div className="field-wrap"><div className="field-label">Bill Rate</div><input value={editingShift.bill_rate} onChange={e => setEditingShift({...editingShift, bill_rate: parseFloat(e.target.value)})} /></div>
              </div>
              <div className="modal-actions"><button className="btn-secondary" onClick={() => setEditingShift(null)}>Cancel</button><button className="btn-primary" onClick={saveShift}>Save Changes</button></div>
            </div>
          </div>
        )}

        {editingIncident && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setEditingIncident(null)}>
            <div className="modal-box">
              <div className="modal-title">Edit Incident</div>
              <div className="modal-sub">Update incident details</div>
              <div className="field-wrap"><div className="field-label">Title *</div><input value={editingIncident.title} onChange={e => setEditingIncident({...editingIncident, title: e.target.value})} /></div>
              <div className="field-wrap"><div className="field-label">Description</div><textarea style={{ height: 80, resize: 'none' }} value={editingIncident.description || ''} onChange={e => setEditingIncident({...editingIncident, description: e.target.value})} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="field-wrap"><div className="field-label">Severity</div>
                  <select value={editingIncident.severity} onChange={e => setEditingIncident({...editingIncident, severity: e.target.value})}>
                    <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                  </select>
                </div>
                <div className="field-wrap"><div className="field-label">Status</div>
                  <select value={editingIncident.status} onChange={e => setEditingIncident({...editingIncident, status: e.target.value})}>
                    <option value="open">Open</option><option value="resolved">Resolved</option><option value="closed">Closed</option>
                  </select>
                </div>
              </div>
              <div className="modal-actions"><button className="btn-secondary" onClick={() => setEditingIncident(null)}>Cancel</button><button className="btn-primary" onClick={saveIncident}>Save Changes</button></div>
            </div>
          </div>
        )}

        {editingPostOrder && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setEditingPostOrder(null)}>
            <div className="modal-box">
              <div className="modal-title">Edit Post Order</div>
              <div className="modal-sub">Update instructions for guards</div>
              <div className="field-wrap"><div className="field-label">Title *</div><input value={editingPostOrder.title} onChange={e => setEditingPostOrder({...editingPostOrder, title: e.target.value})} /></div>
              <div className="field-wrap"><div className="field-label">Category</div>
                <select value={editingPostOrder.category} onChange={e => setEditingPostOrder({...editingPostOrder, category: e.target.value})}>
                  <option value="general">General</option>
                  <option value="access">Access Control</option>
                  <option value="emergency">Emergency</option>
                  <option value="patrol">Patrol</option>
                  <option value="reporting">Reporting</option>
                </select>
              </div>
              <div className="field-wrap"><div className="field-label">Instructions *</div><textarea style={{ height: 140, resize: 'vertical' }} value={editingPostOrder.content} onChange={e => setEditingPostOrder({...editingPostOrder, content: e.target.value})} /></div>
              <div className="modal-actions"><button className="btn-secondary" onClick={() => setEditingPostOrder(null)}>Cancel</button><button className="btn-primary" onClick={savePostOrder}>Save Changes</button></div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
