'use client'

import { useState } from 'react'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const guards = [
  { name: 'Marcus Thompson', initials: 'MT', color: '#3b82f6', cert: 'Armed · Lvl 3' },
  { name: 'Sarah Chen',      initials: 'SC', color: '#a855f7', cert: 'Unarmed · Lvl 2' },
  { name: 'James Okafor',    initials: 'JO', color: '#22c55e', cert: 'Armed · Lvl 3' },
  { name: 'Priya Nair',      initials: 'PN', color: '#f59e0b', cert: 'Unarmed · Lvl 2' },
  { name: 'David Washington',initials: 'DW', color: '#ef4444', cert: 'Armed · Lvl 3' },
  { name: 'Elena Vasquez',   initials: 'EV', color: '#06b6d4', cert: 'Unarmed · Lvl 1' },
  { name: 'Kevin Park',      initials: 'KP', color: '#ec4899', cert: 'Armed · Lvl 2' },
  { name: 'Amara Diallo',    initials: 'AD', color: '#84cc16', cert: 'Unarmed · Lvl 2' },
]

const shiftData = [
  [{site:'Riverside Mall',type:'day',time:'06–14'},{site:'Riverside Mall',type:'day',time:'06–14'},{site:'Riverside Mall',type:'day',time:'06–14'},{site:'Riverside Mall',type:'day',time:'06–14'},null,null,null],
  [{site:'Harborview Apt',type:'night',time:'22–06'},{site:'Harborview Apt',type:'night',time:'22–06'},null,{site:'Harborview Apt',type:'night',time:'22–06'},{site:'Harborview Apt',type:'night',time:'22–06'},null,null],
  [null,{site:'Metro Hub',type:'day',time:'06–14'},{site:'Metro Hub',type:'day',time:'06–14'},{site:'Metro Hub',type:'day',time:'06–14'},{site:'Metro Hub',type:'day',time:'06–14'},{site:'Metro Hub',type:'day',time:'06–14'},null],
  [{site:'First Natl Bank',type:'swing',time:'09–17'},{site:'First Natl Bank',type:'swing',time:'09–17'},{site:'First Natl Bank',type:'swing',time:'09–17'},{site:'First Natl Bank',type:'swing',time:'09–17'},{site:'First Natl Bank',type:'swing',time:'09–17'},null,null],
  [{site:'Riverside Mall',type:'night',time:'22–06'},{site:'Riverside Mall',type:'night',time:'22–06'},{site:'Riverside Mall',type:'night',time:'22–06'},{site:'Riverside Mall',type:'night',time:'22–06'},null,null,null],
  [null,null,{site:'Westfield Park',type:'day',time:'08–16'},{site:'Westfield Park',type:'day',time:'08–16'},{site:'Westfield Park',type:'day',time:'08–16'},null,null],
  [{site:'Metro Hub',type:'swing',time:'14–22'},{site:'Metro Hub',type:'swing',time:'14–22'},null,{site:'Metro Hub',type:'swing',time:'14–22'},{site:'Metro Hub',type:'swing',time:'14–22'},{site:'Metro Hub',type:'swing',time:'14–22'},null],
  [null,null,{site:'Harborview Apt',type:'night',time:'22–06'},{site:'Harborview Apt',type:'night',time:'22–06'},{site:'Harborview Apt',type:'night',time:'22–06'},{site:'Harborview Apt',type:'night',time:'22–06'},{site:'Harborview Apt',type:'night',time:'22–06'}],
]

const shiftColors: Record<string, string> = {
  day:   'bg-blue-500/20 text-blue-300',
  night: 'bg-purple-500/20 text-purple-300',
  swing: 'bg-amber-500/20 text-amber-300',
}

export default function Home() {
  const [weekOffset, setWeekOffset] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)

  const baseDate = new Date(2026, 2, 10)
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(baseDate)
    d.setDate(baseDate.getDate() + i + weekOffset * 7)
    return d
  })

  const today = new Date(2026, 2, 12)

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December']
  const weekLabel = `${monthNames[dates[0].getMonth()]} ${dates[0].getDate()} – ${dates[6].getDate()}, ${dates[6].getFullYear()}`

  return (
    <div className="flex h-screen bg-[#0d0f12] text-[#e8eaed] font-sans overflow-hidden">

      {/* Sidebar */}
      <aside className="w-52 min-w-52 bg-[#13161b] border-r border-white/[0.07] flex flex-col">
        <div className="px-5 py-4 border-b border-white/[0.07] flex items-center gap-2.5">
          <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight">Sentinel</div>
            <div className="text-[10px] text-white/30 uppercase tracking-widest font-mono">Operations</div>
          </div>
        </div>

        <nav className="p-2.5 flex-1">
          {[
            { label: 'Schedule', active: true },
            { label: 'Guards', badge: '3' },
            { label: 'Sites' },
            { label: 'Live dispatch' },
            { label: 'Incident reports' },
            { label: 'Billing' },
          ].map(item => (
            <div key={item.label} className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md cursor-pointer text-[13px] mb-0.5 ${item.active ? 'bg-blue-500/15 text-blue-400' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}>
              {item.label}
              {item.badge && <span className="ml-auto bg-red-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full font-mono">{item.badge}</span>}
            </div>
          ))}
        </nav>

        <div className="p-2.5 border-t border-white/[0.07]">
          <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-md hover:bg-white/5 cursor-pointer">
            <div className="w-7 h-7 rounded-full bg-blue-700 flex items-center justify-center text-[11px] font-semibold">JM</div>
            <div>
              <div className="text-[13px] font-medium">James Miller</div>
              <div className="text-[11px] text-white/30">Operations manager</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <div className="h-14 border-b border-white/[0.07] flex items-center px-6 gap-4 shrink-0">
          <div>
            <div className="text-base font-semibold tracking-tight">Weekly schedule</div>
            <div className="text-[11px] text-white/30 font-mono">{weekLabel}</div>
          </div>
          <div className="flex-1" />
          <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-[13px] font-medium border border-white/10 text-white/60 hover:bg-white/5 hover:text-white" onClick={() => setModalOpen(true)}>
            + Add shift
          </button>
          <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-[13px] font-medium bg-blue-500 text-white hover:bg-blue-600" onClick={() => setModalOpen(true)}>
            + New shift
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Guards on duty', value: '24', delta: '↑ 2 vs last week', up: true },
              { label: 'Open shifts', value: '3', delta: 'Need coverage today', warn: true },
              { label: 'Sites covered', value: '18/21', delta: '↓ 3 gaps this week', down: true },
              { label: 'Overtime hours', value: '14h', delta: '↑ 6h over budget', down: true },
            ].map(s => (
              <div key={s.label} className="bg-[#13161b] border border-white/[0.07] rounded-xl p-4">
                <div className="text-[11px] text-white/30 uppercase tracking-widest font-mono mb-2">{s.label}</div>
                <div className={`text-2xl font-semibold tracking-tight mb-1.5 ${s.warn ? 'text-amber-400' : s.down ? 'text-red-400' : ''}`}>{s.value}</div>
                <div className={`text-xs ${s.up ? 'text-green-400' : s.down ? 'text-red-400' : 'text-white/30'}`}>{s.delta}</div>
              </div>
            ))}
          </div>

          {/* Alerts */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-[#13161b] border border-white/[0.07] border-l-2 border-l-red-500 rounded-xl p-3.5 flex items-start gap-3">
              <div className="w-8 h-8 bg-red-500/15 rounded-lg flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </div>
              <div className="flex-1">
                <div className="text-[13px] font-medium mb-0.5">Callout — Friday night shift</div>
                <div className="text-[12px] text-white/50">D. Washington called out for Riverside Mall 22:00–06:00.</div>
              </div>
              <div className="text-[12px] text-blue-400 cursor-pointer shrink-0">Assign cover →</div>
            </div>
            <div className="bg-[#13161b] border border-white/[0.07] border-l-2 border-l-amber-500 rounded-xl p-3.5 flex items-start gap-3">
              <div className="w-8 h-8 bg-amber-500/15 rounded-lg flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
              <div className="flex-1">
                <div className="text-[13px] font-medium mb-0.5">License expiring — R. Okafor</div>
                <div className="text-[12px] text-white/50">Guard license expires in 8 days. Renewal required.</div>
              </div>
              <div className="text-[12px] text-blue-400 cursor-pointer shrink-0">View →</div>
            </div>
          </div>

          {/* Week nav */}
          <div className="flex items-center gap-3 mb-4">
            <button className="px-2.5 py-1.5 rounded-md border border-white/10 text-white/50 hover:bg-white/5 hover:text-white text-sm" onClick={() => setWeekOffset(w => w - 1)}>←</button>
            <div>
              <div className="text-[15px] font-semibold tracking-tight">{weekLabel}</div>
            </div>
            <button className="px-2.5 py-1.5 rounded-md border border-white/10 text-white/50 hover:bg-white/5 hover:text-white text-sm" onClick={() => setWeekOffset(w => w + 1)}>→</button>
            <button className="px-2.5 py-1.5 rounded-md border border-white/10 text-white/50 hover:bg-white/5 hover:text-white text-xs" onClick={() => setWeekOffset(0)}>Today</button>
          </div>

          {/* Schedule grid */}
          <div className="bg-[#13161b] border border-white/[0.07] rounded-xl overflow-hidden mb-6">
            {/* Header */}
            <div className="grid border-b border-white/[0.07]" style={{gridTemplateColumns:'160px repeat(7, 1fr)'}}>
              <div className="px-3 py-2.5 text-[11px] text-white/30 font-mono">Guard</div>
              {dates.map((d, i) => {
                const isToday = d.toDateString() === today.toDateString()
                return (
                  <div key={i} className={`px-3 py-2.5 text-center border-l border-white/[0.07] ${isToday ? 'bg-blue-500/10' : ''}`}>
                    <div className={`text-lg font-semibold tracking-tight ${isToday ? 'text-blue-400' : ''}`}>{d.getDate()}</div>
                    <div className="text-[11px] text-white/30 font-mono">{DAYS[i]}</div>
                  </div>
                )
              })}
            </div>

            {/* Guard rows */}
            {guards.map((g, gi) => (
              <div key={gi} className="grid border-b border-white/[0.07] last:border-b-0 min-h-[60px]" style={{gridTemplateColumns:'160px repeat(7, 1fr)'}}>
                <div className="px-3 py-2.5 flex flex-col justify-center gap-1 border-r border-white/[0.07]">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold text-white shrink-0" style={{background: g.color}}>{g.initials}</div>
                    <div className="text-[12.5px] font-medium truncate">{g.name.split(' ')[0]} {g.name.split(' ')[1][0]}.</div>
                  </div>
                  <div className="text-[10px] text-white/30 font-mono flex items-center gap-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${g.cert.includes('Armed') && !g.cert.includes('Un') ? 'bg-red-400' : 'bg-green-400'}`} />
                    {g.cert}
                  </div>
                </div>
                {Array.from({length: 7}, (_, di) => {
                  const shift = weekOffset === 0 ? shiftData[gi][di] : null
                  return (
                    <div key={di} className="border-l border-white/[0.07] p-1.5 flex items-center justify-center cursor-pointer hover:bg-white/[0.03]" onClick={() => setModalOpen(true)}>
                      {shift ? (
                        <div className={`w-full rounded-md px-2 py-1.5 ${shiftColors[shift.type]}`}>
                          <div className="text-[11.5px] font-medium leading-tight">{shift.site}</div>
                          <div className="text-[10px] opacity-75 font-mono">{shift.time}</div>
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-dashed border-white/20 flex items-center justify-center text-white/20 hover:border-blue-400 hover:text-blue-400 text-base leading-none">+</div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>

          {/* Bottom panels */}
          <div className="grid grid-cols-[1fr_300px] gap-4">
            {/* Sites */}
            <div className="bg-[#13161b] border border-white/[0.07] rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-white/[0.07] flex items-center gap-2">
                <div className="text-[13.5px] font-semibold">Site coverage</div>
                <div className="text-[11px] text-white/30 font-mono bg-white/5 px-2 py-0.5 rounded-full">21 sites</div>
              </div>
              {[
                { name: 'Riverside Mall', meta: '4 guards · 24/7', status: 'Gap Friday', type: 'gap' },
                { name: 'Harborview Apartments', meta: '2 guards · nights', status: 'Covered', type: 'covered' },
                { name: 'Metro Distribution Hub', meta: '6 guards · 3 shifts', status: 'Covered', type: 'covered' },
                { name: 'First National Bank', meta: '3 guards · business hrs', status: 'Covered', type: 'covered' },
                { name: 'Westfield Office Park', meta: '2 guards · weekdays', status: 'Partial Sat', type: 'partial' },
              ].map(site => (
                <div key={site.name} className="px-4 py-3 border-b border-white/[0.07] last:border-b-0 flex items-center gap-3 hover:bg-white/[0.03] cursor-pointer">
                  <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-white/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                  </div>
                  <div>
                    <div className="text-[13px] font-medium">{site.name}</div>
                    <div className="text-[11px] text-white/30 font-mono">{site.meta}</div>
                  </div>
                  <div className={`ml-auto text-[11px] font-medium px-2.5 py-1 rounded-full ${site.type === 'covered' ? 'bg-green-500/15 text-green-400' : site.type === 'gap' ? 'bg-red-500/15 text-red-400' : 'bg-amber-500/15 text-amber-400'}`}>{site.status}</div>
                </div>
              ))}
            </div>

            {/* Open shifts */}
            <div className="bg-[#13161b] border border-white/[0.07] rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-white/[0.07] flex items-center gap-2">
                <div className="text-[13.5px] font-semibold">Open shifts</div>
                <div className="text-[11px] text-white/30 font-mono bg-white/5 px-2 py-0.5 rounded-full">3 unfilled</div>
              </div>
              {[
                { site: 'Riverside Mall', time: 'Fri 22:00–06:00', cert: 'Night cert required', urgent: true },
                { site: 'Westfield Office Park', time: 'Sat 08:00–16:00', cert: 'Any certification', urgent: false },
                { site: 'Metro Distribution Hub', time: 'Sun 06:00–14:00', cert: 'Firearms cert required', urgent: false },
              ].map(s => (
                <div key={s.site + s.time} className="px-4 py-3 border-b border-white/[0.07] last:border-b-0 hover:bg-white/[0.03] cursor-pointer">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="text-[13px] font-medium">{s.site}</div>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full font-mono ${s.urgent ? 'bg-red-500/15 text-red-400' : 'bg-amber-500/15 text-amber-400'}`}>{s.urgent ? 'Urgent' : 'Open'}</span>
                  </div>
                  <div className="text-[11.5px] text-white/40">{s.time} · {s.cert}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={e => { if (e.target === e.currentTarget) setModalOpen(false) }}>
          <div className="bg-[#13161b] border border-white/10 rounded-2xl w-[480px] max-w-[90vw] overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.07] flex items-center gap-2.5">
              <div className="text-[15px] font-semibold">Add shift</div>
              <button className="ml-auto text-white/30 hover:text-white" onClick={() => setModalOpen(false)}>✕</button>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] text-white/50 font-medium">Guard</label>
                  <select className="bg-[#1a1e25] border border-white/10 rounded-lg text-[13px] px-3 py-2 text-white outline-none">
                    <option>Select guard...</option>
                    {guards.map(g => <option key={g.name}>{g.name}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] text-white/50 font-medium">Site</label>
                  <select className="bg-[#1a1e25] border border-white/10 rounded-lg text-[13px] px-3 py-2 text-white outline-none">
                    <option>Select site...</option>
                    {['Riverside Mall','Harborview Apartments','Metro Distribution Hub','First National Bank','Westfield Office Park'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] text-white/50 font-medium">Date</label>
                  <input type="date" defaultValue="2026-03-12" className="bg-[#1a1e25] border border-white/10 rounded-lg text-[13px] px-3 py-2 text-white outline-none" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] text-white/50 font-medium">Shift type</label>
                  <select className="bg-[#1a1e25] border border-white/10 rounded-lg text-[13px] px-3 py-2 text-white outline-none">
                    <option>Day (06:00–14:00)</option>
                    <option>Swing (14:00–22:00)</option>
                    <option>Night (22:00–06:00)</option>
                    <option>Custom hours</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] text-white/50 font-medium">Pay rate ($/hr)</label>
                  <input type="number" defaultValue="18.50" step="0.50" className="bg-[#1a1e25] border border-white/10 rounded-lg text-[13px] px-3 py-2 text-white outline-none" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] text-white/50 font-medium">Bill rate ($/hr)</label>
                  <input type="number" defaultValue="28.00" step="0.50" className="bg-[#1a1e25] border border-white/10 rounded-lg text-[13px] px-3 py-2 text-white outline-none" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] text-white/50 font-medium">Post orders / notes</label>
                <textarea rows={2} placeholder="Patrol routes, access codes, special instructions..." className="bg-[#1a1e25] border border-white/10 rounded-lg text-[13px] px-3 py-2 text-white outline-none resize-none placeholder:text-white/20" />
              </div>
            </div>
            <div className="px-5 py-3.5 border-t border-white/[0.07] flex justify-end gap-2">
              <button className="px-4 py-2 rounded-lg text-[13px] font-medium border border-white/10 text-white/50 hover:bg-white/5" onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="px-4 py-2 rounded-lg text-[13px] font-medium bg-blue-500 text-white hover:bg-blue-600" onClick={() => setModalOpen(false)}>Save shift</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}