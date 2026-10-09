import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

/* ─── Design tokens (same palette as Login) ─────────────────────────────── */
const T = {
  navy:       '#1F2937',
  navyHover:  '#111827',
  gold:       '#C9A66B',
  goldLight:  '#F5EDD9',
  cream:      '#F8F5EF',
  white:      '#FFFFFF',
  border:     '#E5E1D8',
  textMain:   '#1F2937',
  textSub:    '#6B7280',
  textMuted:  '#9CA3AF',
  danger:     '#DC2626',
  dangerBg:   '#FEF2F2',
  dangerBdr:  '#FECACA',
  radiusSm:   '7px',
  radius:     '10px',
  font:       "'Outfit', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
}

/* Public registration — ADMIN and EMPLOYEE are blocked on the backend */
const ROLE_CONFIG = {
  customer: { label: 'Customer',              icon: '👗', desc: 'Order custom garments' },
  tailor:   { label: 'Tailor / Studio',       icon: '🧵', desc: 'List your tailoring services' },
  student:  { label: 'Fashion Student',       icon: '📚', desc: 'Enroll in tailoring courses' },
}

const ROLE_DASHBOARD = {
  customer: '/customer/dashboard',
  tailor:   '/tailor/dashboard',
  student:  '/student/dashboard',
}

function StitchDivider() {
  return (
    <svg width="160" height="6" viewBox="0 0 160 6" fill="none" aria-hidden="true" style={{ opacity: 0.25 }}>
      {[0,14,28,42,56,70,84,98,112,126,140].map(x => (
        <rect key={x} x={x} y="2" width="9" height="2" rx="1" fill="#C9A66B"/>
      ))}
    </svg>
  )
}

export default function Register() {
  const { role: urlRole } = useParams()
  const { register }      = useAuth()
  const navigate          = useNavigate()

  const [currentRole, setCurrentRole] = useState(
    urlRole && ROLE_CONFIG[urlRole] ? urlRole : 'customer'
  )
  useEffect(() => {
    if (urlRole && ROLE_CONFIG[urlRole]) {
      setCurrentRole(urlRole)
      setError('')
    }
  }, [urlRole])

  const config = ROLE_CONFIG[currentRole] || ROLE_CONFIG.customer

  /* Common fields */
  const [name,            setName]            = useState('')
  const [email,           setEmail]           = useState('')
  const [phone,           setPhone]           = useState('')
  const [password,        setPassword]        = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPwd,         setShowPwd]         = useState(false)
  const [focusedField,    setFocused]         = useState(null)

  /* Customer-specific */
  const [address,         setAddress]         = useState('')
  const [preferredStyle,  setPreferred]       = useState('Bridal & Ethnic Wear')

  /* Tailor-specific */
  const [shopName,        setShopName]        = useState('')
  const [experience,      setExperience]      = useState('5 yrs')
  const [specialist,      setSpecialist]      = useState('Bridal Blouse & Aari Work Specialist')
  const [location,        setLocation]        = useState('Chennai')
  const [dailyCapacity,   setDailyCapacity]   = useState('5')
  const [urgentSupport,   setUrgentSupport]   = useState(true)

  /* Student-specific */
  const [skillLevel,      setSkillLevel]      = useState('Beginner')
  const [learningGoals,   setLearningGoals]   = useState('Aari Embroidery & Blouse Stitching')

  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const inputStyle = (f) => ({
    width: '100%', height: 42, padding: '0 12px',
    fontSize: 13.5, fontFamily: T.font, color: T.textMain,
    background: T.white,
    border: `1.5px solid ${focusedField === f ? T.gold : T.border}`,
    borderRadius: T.radiusSm, outline: 'none',
    boxShadow: focusedField === f ? `0 0 0 3px ${T.goldLight}` : 'none',
    transition: 'border-color 0.18s, box-shadow 0.18s', boxSizing: 'border-box',
  })

  const labelStyle = {
    display: 'block', fontSize: 12.5, fontWeight: 600,
    color: T.textMain, fontFamily: T.font, marginBottom: 5,
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name || !email || !password) { setError('Please fill all required fields.'); return }
    if (password !== confirmPassword)  { setError('Passwords do not match.'); return }

    setLoading(true)
    let payload = { name, email, phone, password }
    if (currentRole === 'customer') payload = { ...payload, address, preferredStyle }
    else if (currentRole === 'tailor')
      payload = { ...payload, shopName, experience, specialist, location,
                  dailyCapacity: Number(dailyCapacity), urgentSupport }
    else if (currentRole === 'student')
      payload = { ...payload, skillLevel, learningGoals }

    const result = await register(currentRole, payload)
    setLoading(false)
    if (result.success) {
      if (result.requiresVerification) {
        navigate(`/verify-email?email=${encodeURIComponent(result.email || email.trim())}&role=${currentRole}`)
        return
      }
      const path =
        ROLE_DASHBOARD[result.user?.role?.toLowerCase()] ||
        ROLE_DASHBOARD[currentRole] || '/customer/dashboard'
      navigate(path, { replace: true })
    } else {
      setError(result.error || 'Registration failed. Please check your details.')
    }
  }

  const sectionBox = {
    background: '#FDFAF5',
    border: `1px solid ${T.border}`,
    borderRadius: T.radius,
    padding: '16px 18px',
    marginBottom: 20,
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
        .tc-reg-root { font-family: ${T.font}; }
        .tc-reg-submit-btn {
          width: 100%; height: 46px; border: none;
          border-radius: ${T.radiusSm};
          background: ${T.navy}; color: #fff;
          font-size: 14px; font-weight: 600; font-family: ${T.font};
          cursor: pointer;
          transition: background 0.18s, box-shadow 0.18s, transform 0.12s;
        }
        .tc-reg-submit-btn:hover:not(:disabled) {
          background: ${T.navyHover};
          box-shadow: 0 4px 14px rgba(31,41,55,0.22);
          transform: translateY(-1px);
        }
        .tc-reg-submit-btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .tc-role-tab {
          flex: 1; padding: 10px 6px;
          border: 1.5px solid transparent;
          border-radius: ${T.radiusSm};
          background: transparent;
          font-family: ${T.font}; font-size: 12px; font-weight: 500;
          color: ${T.textSub};
          cursor: pointer;
          transition: all 0.16s;
          display: flex; flex-direction: column;
          align-items: center; gap: 4px;
        }
        .tc-role-tab.active {
          background: ${T.white};
          border-color: ${T.gold};
          color: ${T.navy};
          font-weight: 700;
          box-shadow: 0 2px 8px rgba(201,166,107,0.15);
        }
        .tc-role-tab:hover:not(.active) {
          background: rgba(255,255,255,0.5);
          color: ${T.textMain};
        }
        .tc-reg-select {
          width: 100%; height: 42px; padding: 0 12px;
          font-size: 13.5px; font-family: ${T.font};
          color: ${T.textMain}; background: ${T.white};
          border: 1.5px solid ${T.border}; border-radius: ${T.radiusSm};
          outline: none; cursor: pointer;
          transition: border-color 0.18s; box-sizing: border-box;
          appearance: none; -webkit-appearance: none;
        }
        .tc-reg-select:focus { border-color: ${T.gold}; box-shadow: 0 0 0 3px ${T.goldLight}; }
        .tc-reg-checkbox {
          appearance: none; -webkit-appearance: none;
          width: 15px; height: 15px;
          border: 1.5px solid ${T.border}; border-radius: 3px;
          background: ${T.white}; cursor: pointer; position: relative;
          flex-shrink: 0; transition: border-color 0.18s, background 0.18s;
        }
        .tc-reg-checkbox:checked { background: ${T.navy}; border-color: ${T.navy}; }
        .tc-reg-checkbox:checked::after {
          content: ''; position: absolute;
          left: 3px; top: 1px; width: 5px; height: 8px;
          border: 2px solid #fff; border-top: none; border-left: none;
          transform: rotate(45deg);
        }
        @keyframes tc-reg-fade { from { opacity:0; transform: translateY(10px); } to { opacity:1; transform: translateY(0); } }
        .tc-reg-animate { animation: tc-reg-fade 0.38s ease both; }
        @media (max-width: 640px) {
          .tc-reg-two-col { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div
        className="tc-reg-root"
        style={{
          minHeight: '100vh',
          background: T.cream,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '40px 20px 60px',
          boxSizing: 'border-box',
        }}
      >
        <div
          className="tc-reg-animate"
          style={{
            width: '100%', maxWidth: 560,
            background: T.white,
            border: `1px solid ${T.border}`,
            borderRadius: 14,
            boxShadow: '0 4px 24px rgba(31,41,55,0.08)',
            overflow: 'hidden',
          }}
        >
          {/* ── Header bar ── */}
          <div style={{
            background: T.navy,
            padding: '28px 32px 24px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              <img
                src="/logo.jpg"
                alt="TailorConnect"
                style={{
                  width: 38, height: 38,
                  borderRadius: '50%', objectFit: 'cover',
                  border: `2px solid ${T.gold}`,
                }}
              />
              <span style={{
                fontFamily: T.font, fontWeight: 700, fontSize: 18,
                color: T.white, letterSpacing: '-0.2px',
              }}>
                Tailor<span style={{ color: T.gold }}>Connect</span>
              </span>
            </div>
            <h1 style={{
              fontFamily: T.font, fontWeight: 700, fontSize: 22,
              color: T.white, margin: '0 0 4px', letterSpacing: '-0.3px',
            }}>
              Create Account
            </h1>
            <p style={{
              fontFamily: T.font, fontSize: 13.5, color: 'rgba(255,255,255,0.6)',
              margin: '0 0 16px',
            }}>
              {config.desc}
            </p>
            <StitchDivider />
          </div>

          {/* ── Form body ── */}
          <div style={{ padding: '28px 32px 32px' }}>

            {/* ── Role selector tabs (Customer / Tailor / Student only) ── */}
            <div style={{
              display: 'flex', gap: 6,
              background: '#F3EFE7',
              border: `1px solid ${T.border}`,
              borderRadius: T.radius,
              padding: 4, marginBottom: 24,
            }}>
              {Object.entries(ROLE_CONFIG).map(([rKey, rVal]) => (
                <button
                  key={rKey}
                  type="button"
                  className={`tc-role-tab${currentRole === rKey ? ' active' : ''}`}
                  onClick={() => { setCurrentRole(rKey); setError('') }}
                  aria-pressed={currentRole === rKey}
                >
                  <span style={{ fontSize: 18 }}>{rVal.icon}</span>
                  <span>{rVal.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>

            {/* Error */}
            {error && (
              <div role="alert" style={{
                background: T.dangerBg, border: `1px solid ${T.dangerBdr}`,
                borderLeft: `3px solid ${T.danger}`,
                borderRadius: T.radiusSm, padding: '10px 14px',
                marginBottom: 20, fontSize: 13.5, color: T.danger, fontFamily: T.font,
              }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>

              {/* ── Common fields ── */}
              <div className="tc-reg-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={labelStyle}>Full Name <span style={{ color: T.danger }}>*</span></label>
                  <input id="reg-name" type="text" placeholder="Your full name" required
                    value={name} onChange={e => setName(e.target.value)}
                    onFocus={() => setFocused('name')} onBlur={() => setFocused(null)}
                    style={inputStyle('name')}/>
                </div>
                <div>
                  <label style={labelStyle}>Phone <span style={{ color: T.danger }}>*</span></label>
                  <input id="reg-phone" type="tel" placeholder="Mobile number" required
                    value={phone} onChange={e => setPhone(e.target.value)}
                    onFocus={() => setFocused('phone')} onBlur={() => setFocused(null)}
                    style={inputStyle('phone')}/>
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Email Address <span style={{ color: T.danger }}>*</span></label>
                <input id="reg-email" type="email" placeholder="Your email address" required
                  value={email} onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                  style={inputStyle('email')}/>
              </div>

              {/* ── Tailor-specific fields ── */}
              {currentRole === 'tailor' && (
                <div style={sectionBox}>
                  <p style={{ fontSize: 11.5, fontWeight: 700, color: T.gold, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 12px', fontFamily: T.font }}>
                    🧵 Studio Information
                  </p>
                  <div className="tc-reg-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                    <div>
                      <label style={labelStyle}>Shop / Studio Name <span style={{ color: T.danger }}>*</span></label>
                      <input type="text" placeholder="Studio name" value={shopName}
                        onChange={e => setShopName(e.target.value)} required
                        onFocus={() => setFocused('shop')} onBlur={() => setFocused(null)}
                        style={inputStyle('shop')}/>
                    </div>
                    <div>
                      <label style={labelStyle}>Experience <span style={{ color: T.danger }}>*</span></label>
                      <select className="tc-reg-select" value={experience} onChange={e => setExperience(e.target.value)}>
                        <option value="2 yrs">2 Years</option>
                        <option value="5 yrs">5 Years</option>
                        <option value="8 yrs">8 Years</option>
                        <option value="12+ yrs">12+ Years (Master)</option>
                      </select>
                    </div>
                  </div>
                  <div className="tc-reg-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                    <div>
                      <label style={labelStyle}>Specialization</label>
                      <input type="text" placeholder="e.g. Aari Blouse" value={specialist}
                        onChange={e => setSpecialist(e.target.value)}
                        onFocus={() => setFocused('spec')} onBlur={() => setFocused(null)}
                        style={inputStyle('spec')}/>
                    </div>
                    <div>
                      <label style={labelStyle}>City</label>
                      <select className="tc-reg-select" value={location} onChange={e => setLocation(e.target.value)}>
                        {['Chennai','Madurai','Coimbatore','Trichy','Salem'].map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Daily Capacity (slots)</label>
                      <input type="number" min="1" max="30" value={dailyCapacity}
                        onChange={e => setDailyCapacity(e.target.value)}
                        onFocus={() => setFocused('cap')} onBlur={() => setFocused(null)}
                        style={inputStyle('cap')}/>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', fontSize: 13, color: T.textSub, fontFamily: T.font, paddingTop: 20 }}>
                      <input type="checkbox" className="tc-reg-checkbox" checked={urgentSupport} onChange={e => setUrgentSupport(e.target.checked)}/>
                      Accept Urgent 48h Orders
                    </label>
                  </div>
                </div>
              )}

              {/* ── Customer-specific fields ── */}
              {currentRole === 'customer' && (
                <div style={sectionBox}>
                  <p style={{ fontSize: 11.5, fontWeight: 700, color: T.gold, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 12px', fontFamily: T.font }}>
                    👗 Preferences
                  </p>
                  <div style={{ marginBottom: 12 }}>
                    <label style={labelStyle}>Delivery Address</label>
                    <input type="text" placeholder="Your delivery address" value={address}
                      onChange={e => setAddress(e.target.value)}
                      onFocus={() => setFocused('addr')} onBlur={() => setFocused(null)}
                      style={inputStyle('addr')}/>
                  </div>
                  <div>
                    <label style={labelStyle}>Primary Garment Style</label>
                    <select className="tc-reg-select" value={preferredStyle} onChange={e => setPreferred(e.target.value)}>
                      <option value="Bridal & Ethnic Wear">Bridal &amp; Ethnic Wear</option>
                      <option value="Casual & Festive Kurtis">Casual &amp; Festive Kurtis</option>
                      <option value="Western & Indo-Western Gowns">Western &amp; Indo-Western Gowns</option>
                      <option value="Kids Ethnic Sets">Kids Ethnic Sets</option>
                    </select>
                  </div>
                </div>
              )}

              {/* ── Student-specific fields ── */}
              {currentRole === 'student' && (
                <div style={sectionBox}>
                  <p style={{ fontSize: 11.5, fontWeight: 700, color: T.gold, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 12px', fontFamily: T.font }}>
                    🎓 Learning Preferences
                  </p>
                  <div className="tc-reg-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={labelStyle}>Skill Level</label>
                      <select className="tc-reg-select" value={skillLevel} onChange={e => setSkillLevel(e.target.value)}>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Learning Focus</label>
                      <input type="text" placeholder="e.g. Aari Embroidery" value={learningGoals}
                        onChange={e => setLearningGoals(e.target.value)}
                        onFocus={() => setFocused('lg')} onBlur={() => setFocused(null)}
                        style={inputStyle('lg')}/>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Passwords ── */}
              <div className="tc-reg-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 22 }}>
                <div>
                  <label style={labelStyle}>Password <span style={{ color: T.danger }}>*</span></label>
                  <div style={{ position: 'relative' }}>
                    <input id="reg-pwd" type={showPwd ? 'text' : 'password'} placeholder="Create password" required
                      value={password} onChange={e => setPassword(e.target.value)}
                      onFocus={() => setFocused('pwd')} onBlur={() => setFocused(null)}
                      style={{ ...inputStyle('pwd'), paddingRight: 40 }}/>
                    <button type="button" onClick={() => setShowPwd(v => !v)} aria-label="Toggle password"
                      style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: T.textMuted, display: 'flex', alignItems: 'center' }}>
                      {showPwd
                        ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>}
                    </button>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Confirm Password <span style={{ color: T.danger }}>*</span></label>
                  <input id="reg-confirm-pwd" type="password" placeholder="Repeat password" required
                    value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    onFocus={() => setFocused('cpwd')} onBlur={() => setFocused(null)}
                    style={inputStyle('cpwd')}/>
                </div>
              </div>

              <button
                id="reg-submit-btn"
                type="submit"
                className="tc-reg-submit-btn"
                disabled={loading}
              >
                {loading ? 'Creating Account…' : `Register as ${config.label}`}
              </button>
            </form>

            {/* Footer */}
            <div style={{
              marginTop: 22, paddingTop: 18,
              borderTop: `1px solid ${T.border}`,
              display: 'flex', justifyContent: 'space-between',
              fontSize: 13, fontFamily: T.font,
            }}>
              <Link to="/" style={{ color: T.textSub, textDecoration: 'none' }}>
                ← Back to Login
              </Link>
              <Link to="/login" style={{ fontWeight: 700, color: T.navy, textDecoration: 'none', borderBottom: `1.5px solid ${T.gold}`, paddingBottom: 1 }}>
                Sign In →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
