'use client'

import { useState, useEffect } from 'react'

function WatchpostLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
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
  )
}

export default function Landing() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; background: #080b12; color: #e2e8f0; -webkit-font-smoothing: antialiased; overflow-x: hidden; }

        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          padding: 0 24px; height: 60px;
          display: flex; align-items: center; justify-content: space-between;
          transition: all 0.3s ease;
        }
        .nav.scrolled {
          background: rgba(8,11,18,0.92);
          backdrop-filter: blur(16px);
        }
        .nav-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .nav-logo-text { font-size: 16px; font-weight: 800; color: #f1f5f9; letter-spacing: -0.4px; }
        .nav-desktop { display: flex; align-items: center; gap: 28px; }
        .nav-link { font-size: 13.5px; color: #64748b; text-decoration: none; font-weight: 500; transition: color 0.2s; }
        .nav-link:hover { color: #e2e8f0; }
        .nav-signin { font-size: 13px; color: #94a3b8; text-decoration: none; font-weight: 500; }
        .nav-cta {
          background: #f97316; color: #fff; border: none;
          padding: 8px 18px; border-radius: 7px;
          font-size: 13px; font-weight: 700;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer; text-decoration: none; display: inline-block;
          box-shadow: 0 0 20px rgba(249,115,22,0.35);
          transition: all 0.2s;
        }
        .nav-cta:hover { background: #ea580c; transform: translateY(-1px); }
        .nav-hamburger {
          display: none; flex-direction: column; gap: 5px;
          background: transparent; border: none; cursor: pointer; padding: 4px;
        }
        .nav-hamburger span { display: block; width: 22px; height: 2px; background: #94a3b8; border-radius: 2px; transition: all 0.2s; }
        .mobile-menu {
          display: none; position: fixed; top: 60px; left: 0; right: 0; z-index: 99;
          background: rgba(8,11,18,0.98); backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          padding: 20px 24px; flex-direction: column; gap: 16px;
        }
        .mobile-menu.open { display: flex; }
        .mobile-menu a { font-size: 15px; color: #94a3b8; text-decoration: none; font-weight: 500; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .mobile-menu-cta {
          background: #f97316; color: #fff !important; border-radius: 8px;
          padding: 12px 20px !important; text-align: center; font-weight: 700 !important;
          border-bottom: none !important; margin-top: 4px;
        }

        @media (max-width: 768px) {
          .nav-desktop { display: none; }
          .nav-hamburger { display: flex; }
        }

        .hero {
          min-height: 100vh;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 100px 20px 60px;
          position: relative; overflow: hidden; text-align: center;
        }
        .hero-bg { position: absolute; inset: 0; pointer-events: none; }
        .hero-glow {
          position: absolute; top: -100px; left: 50%; transform: translateX(-50%);
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(249,115,22,0.07) 0%, transparent 65%);
        }
        .hero-grid {
          position: absolute; inset: 0;
          background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%);
        }

        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(249,115,22,0.1); border: 1px solid rgba(249,115,22,0.25);
          padding: 6px 14px; border-radius: 20px;
          font-size: 12px; font-weight: 600; color: #fb923c;
          margin-bottom: 24px;
        }
        .hero-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #f97316; box-shadow: 0 0 8px #f97316; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }

        .hero-headline {
          font-family: 'Instrument Serif', serif;
          font-size: clamp(38px, 8vw, 88px);
          font-weight: 400; line-height: 1.05;
          letter-spacing: -2px; color: #f8fafc;
          margin-bottom: 20px; max-width: 820px;
        }
        .hero-headline em { font-style: italic; color: #f97316; }

        .hero-sub {
          font-size: clamp(15px, 3vw, 18px); color: #64748b;
          max-width: 480px; line-height: 1.65; margin-bottom: 36px; padding: 0 8px;
        }

        .hero-actions {
          display: flex; align-items: center; gap: 12px; margin-bottom: 20px;
          flex-wrap: wrap; justify-content: center;
        }
        .btn-primary {
          background: linear-gradient(135deg, #f97316, #ea580c);
          color: #fff; border: none; border-radius: 9px;
          padding: 13px 24px; font-size: 15px; font-weight: 700;
          font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer;
          box-shadow: 0 0 32px rgba(249,115,22,0.4);
          transition: all 0.2s; text-decoration: none; display: inline-block;
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 0 44px rgba(249,115,22,0.5); }
        .btn-ghost {
          color: #94a3b8; font-size: 14px; font-weight: 500;
          background: transparent; border: none; cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        .hero-proof {
          display: flex; align-items: center; gap: 16px;
          font-size: 12px; color: #475569; flex-wrap: wrap; justify-content: center;
        }
        .hero-proof-sep { width: 1px; height: 12px; background: #1e293b; }

        .mockup-wrap { width: 100%; max-width: 900px; margin: 48px auto 0; position: relative; }
        .mockup-glow {
          position: absolute; bottom: -40px; left: 50%; transform: translateX(-50%);
          width: 80%; height: 150px;
          background: radial-gradient(ellipse, rgba(249,115,22,0.1) 0%, transparent 70%);
          filter: blur(20px); pointer-events: none;
        }
        .mockup-frame {
          background: #0e1117; border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px; overflow: hidden;
          box-shadow: 0 40px 120px rgba(0,0,0,0.6);
        }
        .mockup-bar {
          background: #141820; padding: 10px 14px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex; align-items: center; gap: 6px;
        }
        .mockup-dot { width: 9px; height: 9px; border-radius: 50%; }
        .mockup-url {
          flex: 1; background: rgba(255,255,255,0.04); border-radius: 5px;
          padding: 3px 10px; font-size: 10px; color: #475569;
          font-family: 'JetBrains Mono', monospace; margin: 0 10px; text-align: center;
        }
        .mockup-body { display: flex; height: 320px; }
        .mockup-sidebar {
          width: 150px; background: #141820;
          border-right: 1px solid rgba(255,255,255,0.06);
          padding: 12px 10px; flex-shrink: 0;
        }
        @media (max-width: 500px) { .mockup-sidebar { width: 110px; } }
        .mockup-logo-row { display: flex; align-items: center; gap: 6px; padding: 0 4px; margin-bottom: 16px; }
        .mockup-logo-name { font-size: 11px; font-weight: 800; color: #f1f5f9; }
        .mockup-nav-group { margin-bottom: 12px; }
        .mockup-nav-label { font-size: 7px; font-weight: 700; color: #334155; text-transform: uppercase; letter-spacing: 1px; padding: 0 5px; margin-bottom: 3px; }
        .mockup-nav-item { padding: 5px 7px; border-radius: 4px; font-size: 10px; color: #475569; margin-bottom: 1px; }
        .mockup-nav-item.active { background: rgba(249,115,22,0.12); color: #f97316; font-weight: 600; }
        .mockup-main { flex: 1; padding: 12px 16px; overflow: hidden; min-width: 0; }
        .mockup-topbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .mockup-title { font-size: 12px; font-weight: 700; color: #f1f5f9; }
        .mockup-btn { background: #f97316; color: #fff; border: none; border-radius: 4px; padding: 4px 8px; font-size: 9px; font-weight: 700; white-space: nowrap; }
        .mockup-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 6px; margin-bottom: 10px; }
        .mockup-stat { background: #1a1f2e; border: 1px solid rgba(255,255,255,0.06); border-radius: 6px; padding: 8px 9px; }
        .mockup-stat-label { font-size: 7px; color: #475569; text-transform: uppercase; margin-bottom: 3px; }
        .mockup-stat-val { font-size: 16px; font-weight: 800; color: #f1f5f9; font-family: 'JetBrains Mono', monospace; }
        .mockup-stat.accent .mockup-stat-val { color: #f97316; }
        .mockup-table { background: #141820; border: 1px solid rgba(255,255,255,0.06); border-radius: 6px; overflow: hidden; }
        .mockup-table-row { display: flex; border-bottom: 1px solid rgba(255,255,255,0.04); }
        .mockup-table-row:last-child { border-bottom: none; }
        .mockup-table-head { background: rgba(255,255,255,0.02); }
        .mockup-cell { flex: 1; padding: 6px 9px; font-size: 8px; color: #475569; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .mockup-table-head .mockup-cell { color: #334155; text-transform: uppercase; font-weight: 700; }
        .mockup-cell.name { color: #e2e8f0; font-weight: 600; }
        .mockup-pill { display: inline-block; padding: 1px 5px; border-radius: 8px; font-size: 7px; font-weight: 600; }

        /* SECTIONS */
        .section-inner { max-width: 1100px; margin: 0 auto; padding: 80px 20px; }
        .section-tag {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 11px; font-weight: 700; color: #f97316;
          text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 14px;
        }
        .section-tag-line { width: 20px; height: 1px; background: #f97316; }
        .section-title {
          font-family: 'Instrument Serif', serif;
          font-size: clamp(28px, 5vw, 52px);
          font-weight: 400; color: #f8fafc;
          letter-spacing: -1.5px; line-height: 1.1; margin-bottom: 14px;
        }
        .section-title em { font-style: italic; color: #f97316; }
        .section-sub { font-size: 16px; color: #475569; max-width: 520px; line-height: 1.65; }

        /* PROBLEM */
        .problem-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: start; margin-top: 48px; }
        @media (max-width: 768px) { .problem-grid { grid-template-columns: 1fr; gap: 36px; } }
        .problem-list { display: flex; flex-direction: column; }
        .problem-item { display: flex; align-items: flex-start; gap: 14px; padding: 18px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .problem-item:last-child { border-bottom: none; }
        .problem-x { width: 26px; height: 26px; border-radius: 50%; background: rgba(248,113,113,0.1); border: 1px solid rgba(248,113,113,0.2); display: flex; align-items: center; justify-content: center; font-size: 11px; color: #f87171; flex-shrink: 0; margin-top: 2px; }
        .problem-text { font-size: 14px; color: #94a3b8; line-height: 1.5; }
        .problem-text strong { color: #e2e8f0; font-weight: 600; }
        .pain-card { background: #0e1117; border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 24px; position: relative; overflow: hidden; }
        .pain-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, rgba(249,115,22,0.4), transparent); }
        .pain-card-title { font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; }
        .pain-quotes { display: flex; flex-direction: column; gap: 12px; }
        .pain-quote { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 14px 16px; }
        .pain-quote-text { font-size: 13px; color: #94a3b8; line-height: 1.6; font-style: italic; margin-bottom: 6px; }
        .pain-quote-role { font-size: 11px; color: #475569; font-style: normal; }

        /* FEATURES */
        .features-section { background: #080b12; }
        .features-header { text-align: center; margin-bottom: 48px; }
        .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; background: rgba(255,255,255,0.05); border-radius: 14px; overflow: hidden; }
        @media (max-width: 768px) { .features-grid { grid-template-columns: 1fr; } }
        .feature-card { background: #0e1117; padding: 28px 24px; transition: background 0.2s; }
        .feature-card:hover { background: #111827; }
        .feature-icon { width: 40px; height: 40px; border-radius: 9px; display: flex; align-items: center; justify-content: center; font-size: 18px; margin-bottom: 16px; background: rgba(249,115,22,0.1); border: 1px solid rgba(249,115,22,0.2); }
        .feature-title { font-size: 15px; font-weight: 700; color: #f1f5f9; margin-bottom: 8px; }
        .feature-desc { font-size: 13.5px; color: #475569; line-height: 1.65; }

        /* HOW IT WORKS */
        .how-section { background: #080b12; }
        .how-inner { max-width: 800px; margin: 0 auto; padding: 80px 20px; }
        .how-steps { display: flex; flex-direction: column; }
        .how-step { display: grid; grid-template-columns: 64px 1fr; gap: 24px; padding: 32px 0; border-bottom: 1px solid rgba(255,255,255,0.05); align-items: start; }
        .how-step:last-child { border-bottom: none; }
        .how-step-num { font-family: 'Instrument Serif', serif; font-size: 48px; font-weight: 400; color: rgba(249,115,22,0.2); line-height: 1; }
        .how-step-title { font-size: 17px; font-weight: 700; color: #f1f5f9; margin-bottom: 8px; }
        .how-step-desc { font-size: 14px; color: #475569; line-height: 1.65; }

        /* PRICING */
        .pricing-section { padding: 80px 20px; text-align: center; }
        .pricing-header { margin-bottom: 48px; }
        .pricing-card { background: #0e1117; border: 1px solid rgba(249,115,22,0.2); border-radius: 18px; padding: 40px 32px; max-width: 480px; margin: 0 auto; position: relative; overflow: hidden; box-shadow: 0 0 60px rgba(249,115,22,0.05); }
        .pricing-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(249,115,22,0.6), transparent); }
        .pricing-badge { display: inline-block; background: rgba(249,115,22,0.1); border: 1px solid rgba(249,115,22,0.25); color: #f97316; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; margin-bottom: 20px; }
        .pricing-price { font-family: 'Instrument Serif', serif; font-size: 64px; color: #f8fafc; letter-spacing: -3px; line-height: 1; margin-bottom: 6px; }
        .pricing-price sup { font-size: 28px; letter-spacing: 0; vertical-align: super; }
        .pricing-period { font-size: 13px; color: #475569; margin-bottom: 28px; }
        .pricing-features { text-align: left; margin-bottom: 28px; display: flex; flex-direction: column; gap: 10px; }
        .pricing-feature { display: flex; align-items: center; gap: 10px; font-size: 13.5px; color: #94a3b8; }
        .pricing-feature-check { color: #4ade80; flex-shrink: 0; }
        .btn-pricing { width: 100%; background: linear-gradient(135deg, #f97316, #ea580c); color: #fff; border: none; border-radius: 9px; padding: 14px; font-size: 15px; font-weight: 700; font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; box-shadow: 0 0 32px rgba(249,115,22,0.35); transition: all 0.2s; text-decoration: none; display: block; }
        .btn-pricing:hover { transform: translateY(-2px); }
        .pricing-note { font-size: 12px; color: #334155; margin-top: 14px; }

        /* CTA */
        .cta-section { padding: 100px 20px; text-align: center; position: relative; overflow: hidden; }
        .cta-glow { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); width: 500px; height: 300px; background: radial-gradient(ellipse, rgba(249,115,22,0.07) 0%, transparent 70%); pointer-events: none; }
        .cta-title { font-family: 'Instrument Serif', serif; font-size: clamp(30px, 6vw, 60px); font-weight: 400; color: #f8fafc; letter-spacing: -2px; line-height: 1.1; margin-bottom: 16px; position: relative; }
        .cta-title em { font-style: italic; color: #f97316; }
        .cta-sub { font-size: 16px; color: #475569; margin-bottom: 36px; position: relative; }

        /* FOOTER */
        footer { padding: 32px 20px; border-top: 1px solid rgba(255,255,255,0.06); }
        .footer-inner { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
        .footer-logo { display: flex; align-items: center; gap: 8px; }
        .footer-logo-text { font-size: 14px; font-weight: 800; color: #475569; }
        .footer-copy { font-size: 12px; color: #1e293b; }
        .footer-links { display: flex; gap: 20px; }
        .footer-link { font-size: 12px; color: #334155; text-decoration: none; }
        .footer-link:hover { color: #64748b; }

        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      {/* NAV */}
      <nav className={`nav${scrolled ? ' scrolled' : ''}`}>
        <a href="#" className="nav-logo">
          <WatchpostLogo size={28} />
          <span className="nav-logo-text">Watchpost</span>
        </a>
        <div className="nav-desktop">
          <a href="#features" className="nav-link">Features</a>
          <a href="#how-it-works" className="nav-link">How it works</a>
          <a href="#pricing" className="nav-link">Pricing</a>
          <a href="/login" className="nav-signin">Sign in</a>
          <a href="/signup" className="nav-cta">Get Started</a>
        </div>
        <button className="nav-hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          <span />
          <span />
          <span />
        </button>
      </nav>

      {/* MOBILE MENU */}
      <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
        <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
        <a href="#how-it-works" onClick={() => setMenuOpen(false)}>How it works</a>
        <a href="#pricing" onClick={() => setMenuOpen(false)}>Pricing</a>
        <a href="/login" onClick={() => setMenuOpen(false)}>Sign in</a>
        <a href="/signup" className="mobile-menu-cta" onClick={() => setMenuOpen(false)}>Get Started →</a>
      </div>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-glow" />
          <div className="hero-grid" />
        </div>

        <h1 className="hero-headline">
          Run your security<br />operation <em>with confidence.</em>
        </h1>

        <p className="hero-sub">
          Watchpost gives security companies a modern platform to manage guards, sites, shifts, incidents, and billing — all in one place.
        </p>

        <div className="hero-actions">
          <a href="/signup" className="btn-primary">Get Started Free →</a>
          <button className="btn-ghost" onClick={() => document.getElementById('features')?.scrollIntoView()}>
            See features ↓
          </button>
        </div>

        <div className="hero-proof">
          <span>✓ No setup fee</span>
          <div className="hero-proof-sep" />
          <span>✓ Live in one day</span>
          <div className="hero-proof-sep" />
          <span>✓ Cancel anytime</span>
        </div>

        {/* Mockup */}
        <div className="mockup-wrap">
          <div className="mockup-glow" />
          <div className="mockup-frame">
            <div className="mockup-bar">
              <div className="mockup-dot" style={{background:'#ff5f56'}} />
              <div className="mockup-dot" style={{background:'#ffbd2e'}} />
              <div className="mockup-dot" style={{background:'#27c93f'}} />
              <div className="mockup-url">app.usewatchpost.com/dashboard</div>
            </div>
            <div className="mockup-body">
              <div className="mockup-sidebar">
                <div className="mockup-logo-row">
                  <WatchpostLogo size={18} />
                  <div className="mockup-logo-name">Watchpost</div>
                </div>
                <div className="mockup-nav-group">
                  <div className="mockup-nav-label">Overview</div>
                  <div className="mockup-nav-item active">▣ Dashboard</div>
                </div>
                <div className="mockup-nav-group">
                  <div className="mockup-nav-label">Operations</div>
                  <div className="mockup-nav-item">⊟ Schedule</div>
                  <div className="mockup-nav-item">⊕ Guards</div>
                  <div className="mockup-nav-item">⊠ Sites</div>
                </div>
                <div className="mockup-nav-group">
                  <div className="mockup-nav-label">Reporting</div>
                  <div className="mockup-nav-item">◈ Reports</div>
                  <div className="mockup-nav-item">◆ Billing</div>
                </div>
              </div>
              <div className="mockup-main">
                <div className="mockup-topbar">
                  <div className="mockup-title">Dashboard</div>
                  <div className="mockup-btn">+ Add Shift</div>
                </div>
                <div className="mockup-stats">
                  <div className="mockup-stat"><div className="mockup-stat-label">Guards</div><div className="mockup-stat-val">24</div></div>
                  <div className="mockup-stat"><div className="mockup-stat-label">Sites</div><div className="mockup-stat-val">8</div></div>
                  <div className="mockup-stat accent"><div className="mockup-stat-label">Incidents</div><div className="mockup-stat-val">3</div></div>
                  <div className="mockup-stat"><div className="mockup-stat-label">Expiring</div><div className="mockup-stat-val">2</div></div>
                </div>
                <div className="mockup-table">
                  <div className="mockup-table-row mockup-table-head">
                    <div className="mockup-cell">Guard</div>
                    <div className="mockup-cell">Site</div>
                    <div className="mockup-cell">Type</div>
                    <div className="mockup-cell">Status</div>
                  </div>
                  {[
                    { name: 'Marcus T.', site: 'Riverside Mall', type: 'day', color: '#f97316' },
                    { name: 'Sarah C.', site: 'Harbor View', type: 'night', color: '#a78bfa' },
                    { name: 'James O.', site: 'Metro Hub', type: 'swing', color: '#facc15' },
                    { name: 'Priya N.', site: 'First Natl', type: 'day', color: '#f97316' },
                  ].map((r, i) => (
                    <div key={i} className="mockup-table-row">
                      <div className="mockup-cell name">{r.name}</div>
                      <div className="mockup-cell">{r.site}</div>
                      <div className="mockup-cell"><span className="mockup-pill" style={{background:`${r.color}18`,color:r.color}}>{r.type}</span></div>
                      <div className="mockup-cell"><span className="mockup-pill" style={{background:'rgba(74,222,128,0.1)',color:'#4ade80'}}>active</span></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section style={{background:'#080b12'}}>
        <div className="section-inner">
          <div className="section-tag"><div className="section-tag-line" />The Problem</div>
          <h2 className="section-title">Security software has been<br /><em>stuck in 2012.</em></h2>
          <p className="section-sub">Most tools were built over a decade ago. They're slow, clunky, and designed for desktop workflows that don't match how your team operates.</p>
          <div className="problem-grid">
            <div className="problem-list">
              {[
                { text: <><strong>Too complex to onboard</strong> — managers spend days configuring software instead of running their operation</> },
                { text: <><strong>Slow and unreliable</strong> — guards and dispatchers waiting for screens to load in time-sensitive situations</> },
                { text: <><strong>Not built for mobile</strong> — guards in the field forced to use desktop-designed interfaces on their phones</> },
                { text: <><strong>Billing is still manual</strong> — hours tracked in the software, invoices still built in Excel</> },
              ].map((item, i) => (
                <div key={i} className="problem-item">
                  <div className="problem-x">✕</div>
                  <div className="problem-text">{item.text}</div>
                </div>
              ))}
            </div>
            <div className="pain-card">
              <div className="pain-card-title">What security managers say</div>
              <div className="pain-quotes">
                {[
                  { text: 'We were spending more time managing our software than managing our guards. The admin burden was killing us.', role: 'Operations Manager, 50-guard company' },
                  { text: "Billing used to take half a day every week. We'd pull data from one system and manually calculate everything in a spreadsheet.", role: 'Owner, Security Services Firm' },
                  { text: 'Our guards hated the mobile experience. Half of them were just texting me updates instead of using the system.', role: 'Director of Field Operations' },
                ].map((q, i) => (
                  <div key={i} className="pain-quote">
                    <div className="pain-quote-text">"{q.text}"</div>
                    <div className="pain-quote-role">— {q.role}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features-section" id="features">
        <div className="section-inner">
          <div className="features-header">
            <div className="section-tag" style={{justifyContent:'center'}}><div className="section-tag-line" />Features<div className="section-tag-line" /></div>
            <h2 className="section-title" style={{textAlign:'center',margin:'0 auto 14px'}}>Everything you need.<br /><em>Nothing you don't.</em></h2>
            <p className="section-sub" style={{textAlign:'center',margin:'0 auto'}}>Built specifically for private security companies.</p>
          </div>
          <div className="features-grid">
            {[
              { icon: '👮', title: 'Guard Management', desc: 'Full profiles with license tracking, certification management, and automatic expiry alerts.' },
              { icon: '📍', title: 'Post Orders', desc: 'Attach specific instructions to every client site. Guards see exactly what they need before every shift.' },
              { icon: '📅', title: 'Shift Scheduling', desc: 'Assign guards to sites across day, swing, and night shifts. See full coverage at a glance.' },
              { icon: '⚠️', title: 'Incident Reports', desc: 'Log incidents in seconds with severity, site, and guard assignment. Full audit trail for clients.' },
              { icon: '📋', title: 'Daily Activity Reports', desc: 'Guards submit end-of-shift reports directly in the app. Managers review. Clients get documentation.' },
              { icon: '💰', title: 'Billing & Payroll', desc: 'Automatic calculation of billable hours and payroll cost per site. See your gross margin in real time.' },
            ].map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <div className="feature-title">{f.title}</div>
                <div className="feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-section" id="how-it-works">
        <div className="how-inner">
          <div style={{textAlign:'center', marginBottom:48}}>
            <div className="section-tag" style={{justifyContent:'center'}}><div className="section-tag-line" />How It Works<div className="section-tag-line" /></div>
            <h2 className="section-title" style={{textAlign:'center',margin:'0 auto 14px'}}>Up and running<br /><em>in one day.</em></h2>
          </div>
          <div className="how-steps">
            {[
              { num: '01', title: 'Add your guards and sites', desc: 'Import your roster and set up your client sites. Add post orders for each location. Takes about an hour for most companies.' },
              { num: '02', title: 'Start scheduling shifts', desc: 'Assign guards to sites with a few clicks. Watchpost tracks coverage and shows you exactly who is working where.' },
              { num: '03', title: 'Guards log reports from the field', desc: 'At the end of each shift, guards submit their daily activity report directly in Watchpost. Incidents get logged in real time.' },
              { num: '04', title: 'Billing runs itself', desc: 'At the end of the week or month, pull your billing report. Hours, rates, and margins calculated automatically.' },
            ].map((step, i) => (
              <div key={i} className="how-step">
                <div className="how-step-num">{step.num}</div>
                <div>
                  <div className="how-step-title">{step.title}</div>
                  <div className="how-step-desc">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="pricing-section" id="pricing">
        <div className="pricing-header">
          <div className="section-tag" style={{justifyContent:'center'}}><div className="section-tag-line" />Pricing<div className="section-tag-line" /></div>
          <h2 className="section-title" style={{textAlign:'center',margin:'0 auto 14px'}}>One plan.<br /><em>Everything included.</em></h2>
          <p className="section-sub" style={{textAlign:'center',margin:'0 auto'}}>No per-guard fees. No module unlocks. No surprises.</p>
        </div>
        <div className="pricing-card">
          <div className="pricing-badge">All features included</div>
         <div className="pricing-price"><sup>$</sup>75</div>
<div className="pricing-period">per month · unlimited guards · unlimited sites</div>
          <div className="pricing-features">
            {['Unlimited guards and sites','Full shift scheduling','Post orders per site','Daily activity reports','Incident management','Billing & payroll reports','License expiry tracking','QR patrol checkpoints','Priority support','Free onboarding call'].map((f,i) => (
              <div key={i} className="pricing-feature"><span className="pricing-feature-check">✓</span>{f}</div>
            ))}
          </div>
          <a href="/signup" className="btn-pricing">Get Started Free →</a>
          <div className="pricing-note">No credit card required to get started</div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-glow" />
        <h2 className="cta-title">Ready to run a tighter<br /><em>security operation?</em></h2>
        <p className="cta-sub">Join security companies modernizing how they manage their workforce.</p>
        <a href="/signup" className="btn-primary" style={{display:'inline-block'}}>Get Started Free →</a>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-inner">
          <div className="footer-logo">
            <WatchpostLogo size={20} />
            <span className="footer-logo-text">Watchpost</span>
          </div>
          <div className="footer-copy">© 2026 Watchpost. Built for security companies.</div>
          <div className="footer-links">
            <a href="/login" className="footer-link">Sign in</a>
            <a href="/signup" className="footer-link">Get started</a>
          </div>
        </div>
      </footer>
    </>
  )
}
