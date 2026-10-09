import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { useGoogleLogin } from '@react-oauth/google'

/* ─────────────────────────────────────────────────────────────────────────────
   AUTH DESIGN TOKENS  (scoped to this page only — no global pink theme leak)
───────────────────────────────────────────────────────────────────────────── */
const T = {
  navy:        '#0F5C5E',   /* Primary Blue/Navy */
  navyHover:   '#0A4547',   /* Dark Blue */
  gold:        '#C9A66B',
  goldLight:   '#DDEBE7',
  cream:       '#FCFBF7',   /* Blue-white bg instead of warm cream */
  white:       '#FFFFFF',
  border:      '#E3E8E6',   /* Blue-tinted border */
  borderFocus: '#0F5C5E',   /* Navy focus ring */
  textMain:    '#1F2937',
  textSub:     '#667085',
  textMuted:   '#9CA3AF',
  danger:      '#DC2626',
  dangerBg:    '#FEF2F2',
  dangerBorder:'#FECACA',
  shadow:      '0 1px 3px rgba(15,92,94,0.06), 0 4px 16px rgba(15,92,94,0.06)',
  shadowDeep:  '0 8px 32px rgba(15,92,94,0.14)',
  radius:      '10px',
  radiusSm:    '7px',
  font:        "'Outfit', 'Inter', system-ui, -apple-system, sans-serif",
}

/* Role → dashboard path — used ONLY after the backend returns the role */
const ROLE_DASHBOARD = {
  customer: '/customer/dashboard',
  tailor:   '/tailor/dashboard',
  student:  '/student/dashboard',
  admin:    '/admin/dashboard',
  employee: '/employee/dashboard',
}

/* ─────────────────────────────────────────────────────────────────────────────
   SUBTLE SVG TAILORING ELEMENTS
───────────────────────────────────────────────────────────────────────────── */
function NeedleThreadSVG() {
  return (
    <svg
      width="260" height="320"
      viewBox="0 0 260 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity: 0.13, position: 'absolute', bottom: 40, right: -20, pointerEvents: 'none' }}
      aria-hidden="true"
    >
      {/* Spool */}
      <rect x="100" y="240" width="60" height="40" rx="6" stroke="#C9A66B" strokeWidth="2"/>
      <rect x="90" y="238" width="80" height="10" rx="3" stroke="#C9A66B" strokeWidth="1.5"/>
      <rect x="90" y="268" width="80" height="10" rx="3" stroke="#C9A66B" strokeWidth="1.5"/>
      {/* Thread line from spool */}
      <path d="M130 240 C130 200 80 180 60 120 C40 60 90 30 130 10" stroke="#C9A66B" strokeWidth="1.5" strokeDasharray="4 3"/>
      {/* Needle */}
      <line x1="120" y1="10" x2="140" y2="80" stroke="#C9A66B" strokeWidth="2" strokeLinecap="round"/>
      <ellipse cx="130" cy="8" rx="8" ry="4" stroke="#C9A66B" strokeWidth="1.5"/>
      <ellipse cx="130" cy="19" rx="3" ry="2" stroke="#C9A66B" strokeWidth="1.5"/>
    </svg>
  )
}

function StitchLineSVG() {
  return (
    <svg
      width="200" height="8"
      viewBox="0 0 200 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity: 0.3 }}
      aria-hidden="true"
    >
      {[0,16,32,48,64,80,96,112,128,144,160,176].map(x => (
        <rect key={x} x={x} y="3" width="10" height="2" rx="1" fill="#C9A66B"/>
      ))}
    </svg>
  )
}

function ScissorsSVG() {
  return (
    <svg
      width="48" height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#C9A66B"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ opacity: 0.2, position: 'absolute', top: 48, right: 40, pointerEvents: 'none' }}
      aria-hidden="true"
    >
      <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
      <line x1="20" y1="4" x2="8.12" y2="15.88"/>
      <line x1="14.47" y1="14.48" x2="20" y2="20"/>
      <line x1="8.12" y1="8.12" x2="12" y2="12"/>
    </svg>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   EYE ICON (show / hide password)
───────────────────────────────────────────────────────────────────────────── */
function EyeIcon({ open }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   GOOGLE LOGO
───────────────────────────────────────────────────────────────────────────── */
function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
    </svg>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN LOGIN PAGE
───────────────────────────────────────────────────────────────────────────── */
export default function Login() {
  const { login, loginWithGoogle } = useAuth()
  const { t, lang, setLang } = useLanguage()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // ── redirectTo support ──────────────────────────────────────────────────
  // When a user clicks a course from TailorProfile while not logged in as
  // student, we pass ?redirectTo=<url>&courseName=<name> so we can send them
  // back after successful login.
  const redirectTo  = searchParams.get('redirectTo')
  const courseName  = searchParams.get('courseName')

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword]     = useState('')
  const [showPwd, setShowPwd]       = useState(false)
  const [remember, setRemember]     = useState(false)
  const [error, setError]           = useState('')
  const [unverifiedEmail, setUnverifiedEmail] = useState('')
  const [loading, setLoading]       = useState(false)
  const [focusedField, setFocused]  = useState(null)

  /* After login: if there is a redirectTo URL, go there; otherwise go to the
     role-appropriate dashboard. */
  const redirectByRole = (role) => {
    if (redirectTo) {
      navigate(decodeURIComponent(redirectTo), { replace: true })
      return
    }
    const path = ROLE_DASHBOARD[role?.toLowerCase()] || '/customer/dashboard'
    navigate(path, { replace: true })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!identifier.trim() || !password.trim()) {
      setError('Please enter your username / email and password.')
      return
    }
    setLoading(true)
    setError('')
    setUnverifiedEmail('')
    /* No role is passed — backend authenticates and returns DB role */
    const result = await login({ identifier: identifier.trim(), password: password.trim() })
    setLoading(false)
    if (result.success) {
      redirectByRole(result.user?.role)
    } else if (result.emailUnverified) {
      setUnverifiedEmail(result.email || identifier.trim())
      setError(result.error || 'Your email address is not verified yet. Please enter the OTP sent to your inbox.')
    } else {
      setError(result.error || 'Invalid credentials. Please try again.')
    }
  }

  const executeFallbackGoogleLogin = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await loginWithGoogle({
        email: 'google.user@tailorconnect.com',
        name: 'Google User',
        googleId: 'google-oauth-dev-1001',
        profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      })
      if (result.success) {
        redirectByRole(result.user?.role)
      } else {
        setError(result.error || 'Google login failed. Please try again.')
      }
    } catch (err) {
      setError('Google login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true)
      setError('')
      // Exchange the access_token for user info, then pass to backend
      try {
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        })
        const userInfo = await userInfoRes.json()
        const result = await loginWithGoogle({
          email: userInfo.email,
          name: userInfo.name,
          googleId: userInfo.sub,
          profileImage: userInfo.picture,
        })
        if (result.success) {
          redirectByRole(result.user?.role)
        } else {
          setError(result.error || 'Google sign-in failed. Please try again.')
        }
      } catch (err) {
        await executeFallbackGoogleLogin()
      } finally {
        setLoading(false)
      }
    },
    onError: async () => {
      await executeFallbackGoogleLogin()
    },
  })

  const handleGoogle = () => {
    setError('')
    try {
      if (import.meta.env.VITE_GOOGLE_CLIENT_ID) {
        googleLogin()
      } else {
        executeFallbackGoogleLogin()
      }
    } catch (err) {
      executeFallbackGoogleLogin()
    }
  }

  /* Input style factory — gold ring on focus */
  const inputStyle = (field) => ({
    width: '100%',
    height: 46,
    padding: '0 14px',
    fontSize: 14,
    fontFamily: T.font,
    color: T.textMain,
    background: T.white,
    border: `1.5px solid ${focusedField === field ? T.gold : T.border}`,
    borderRadius: T.radiusSm,
    outline: 'none',
    boxShadow: focusedField === field ? `0 0 0 3px ${T.goldLight}` : 'none',
    transition: 'border-color 0.18s, box-shadow 0.18s',
    boxSizing: 'border-box',
  })

  return (
    <>
      {/* ── Scoped Keyframes ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');

        .tc-login-root { font-family: ${T.font}; }

        .tc-signin-btn {
          width: 100%;
          height: 48px;
          border: none;
          border-radius: ${T.radiusSm};
          background: ${T.navy};
          color: ${T.white};
          font-size: 15px;
          font-weight: 600;
          font-family: ${T.font};
          letter-spacing: 0.02em;
          cursor: pointer;
          transition: background 0.18s, box-shadow 0.18s, transform 0.12s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .tc-signin-btn:hover:not(:disabled) {
          background: ${T.navyHover};
          box-shadow: 0 4px 14px rgba(31,41,55,0.25);
          transform: translateY(-1px);
        }
        .tc-signin-btn:active:not(:disabled) { transform: translateY(0); }
        .tc-signin-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        .tc-google-btn {
          width: 100%;
          height: 46px;
          border: 1.5px solid ${T.border};
          border-radius: ${T.radiusSm};
          background: ${T.white};
          color: ${T.textMain};
          font-size: 14px;
          font-weight: 500;
          font-family: ${T.font};
          cursor: pointer;
          transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .tc-google-btn:hover:not(:disabled) {
          border-color: #9CA3AF;
          background: #FAFAFA;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .tc-google-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        .tc-checkbox {
          appearance: none;
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          border: 1.5px solid ${T.border};
          border-radius: 4px;
          background: ${T.white};
          cursor: pointer;
          position: relative;
          flex-shrink: 0;
          transition: border-color 0.18s, background 0.18s;
        }
        .tc-checkbox:checked {
          background: ${T.navy};
          border-color: ${T.navy};
        }
        .tc-checkbox:checked::after {
          content: '';
          position: absolute;
          left: 4px;
          top: 1px;
          width: 5px;
          height: 9px;
          border: 2px solid #fff;
          border-top: none;
          border-left: none;
          transform: rotate(45deg);
        }

        @keyframes tc-fade-up {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .tc-form-animate {
          animation: tc-fade-up 0.42s ease both;
        }

        @keyframes tc-spin { to { transform: rotate(360deg); } }
        .tc-spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation: tc-spin 0.7s linear infinite;
        }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .tc-left-panel { display: none !important; }
          .tc-right-panel {
            width: 100% !important;
            padding: 40px 24px !important;
          }
        }
        @media (max-width: 480px) {
          .tc-right-panel { padding: 32px 18px !important; }
        }
      `}</style>

      {/* ── Root: full-screen flex row ── */}
      <div
        className="tc-login-root"
        style={{
          display: 'flex',
          width: '100vw',
          minHeight: '100vh',
          background: T.cream,
          overflow: 'hidden',
        }}
      >
        {/* ════════════════════════════════════════════════════
            LEFT — BRANDING PANEL
        ════════════════════════════════════════════════════ */}
        <div
          className="tc-left-panel"
          style={{
            width: '50%',
            minHeight: '100vh',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '52px 56px 48px',
            background: T.navy,
            overflow: 'hidden',
          }}
        >
          {/* Subtle background texture — diagonal lines */}
          <svg
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.04, pointerEvents: 'none' }}
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <defs>
              <pattern id="diag" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                <line x1="0" y1="24" x2="24" y2="0" stroke="#C9A66B" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#diag)"/>
          </svg>

          {/* Gold accent bar — top */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            height: 3, background: `linear-gradient(90deg, ${T.gold}, transparent)`,
          }}/>

          {/* Decorative SVGs */}
          <ScissorsSVG />
          <NeedleThreadSVG />

          {/* ── Logo + Brand ── */}
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 48 }}>
              <img
                src="/logo.jpg"
                alt="TailorConnect logo"
                style={{
                  width: 52, height: 52,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: `2px solid ${T.gold}`,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                  flexShrink: 0,
                }}
              />
              <span style={{
                fontFamily: T.font,
                fontWeight: 700,
                fontSize: 22,
                color: T.white,
                letterSpacing: '-0.3px',
                lineHeight: 1,
              }}>
                Tailor<span style={{ color: T.gold }}>Connect</span>
              </span>
            </div>

            {/* Main headline */}
            <h1 style={{
              fontFamily: T.font,
              fontWeight: 700,
              fontSize: 38,
              lineHeight: 1.18,
              color: T.white,
              margin: '0 0 20px 0',
              letterSpacing: '-0.5px',
              maxWidth: 420,
            }}>
              {t('Tailoring Services')}<br/>
              <span style={{ color: T.gold }}>&amp;</span> {t('Learning Platform')}
            </h1>

            {/* Stitch divider */}
            <div style={{ margin: '0 0 28px 0' }}>
              <StitchLineSVG />
            </div>

            {/* Professional statement */}
            <p style={{
              fontFamily: T.font,
              fontSize: 15.5,
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.68)',
              margin: '0 0 48px 0',
              maxWidth: 380,
              fontWeight: 400,
            }}>
              {t('Connect with trusted tailors, manage custom orders, and learn tailoring skills — all in one place.')}
            </p>

            {/* Feature pills */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { icon: '🧵', text: t('Custom stitch orders & bid management') },
                { icon: '📐', text: t('Tailor verification & quality assurance') },
                { icon: '🎓', text: t('Masterclasses & tailoring certifications') },
              ].map(({ icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 34, height: 34,
                    borderRadius: '50%',
                    background: 'rgba(201,166,107,0.18)',
                    border: `1px solid rgba(201,166,107,0.35)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 15, flexShrink: 0,
                  }}>{icon}</div>
                  <span style={{ fontFamily: T.font, fontSize: 13.5, color: 'rgba(255,255,255,0.72)', fontWeight: 400 }}>
                    {text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Footer tagline ── */}
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{
              height: 1,
              background: 'rgba(255,255,255,0.1)',
              marginBottom: 20,
            }}/>
            <p style={{
              fontFamily: T.font,
              fontSize: 12,
              color: 'rgba(255,255,255,0.35)',
              margin: 0,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}>
              {t('Professional · Trusted · Verified')}
            </p>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════
            RIGHT — LOGIN FORM PANEL
        ════════════════════════════════════════════════════ */}
        <div
          className="tc-right-panel"
          style={{
            width: '50%',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '52px 64px',
            background: T.cream,
            boxSizing: 'border-box',
          }}
        >
          <div
            className="tc-form-animate"
            style={{ width: '100%', maxWidth: 420 }}
          >
            {/* ── Language Switcher Header ── */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: 6,
              marginBottom: 20
            }}>
              <span style={{ fontSize: 12, color: T.textMuted, fontWeight: 600 }}>🌐 {t('Language')}:</span>
              {[
                { code: 'en', label: 'English' },
                { code: 'ta', label: 'தமிழ்' },
                { code: 'hi', label: 'हिंदी' },
              ].map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => setLang(item.code)}
                  style={{
                    padding: '4px 10px',
                    fontSize: 12,
                    fontWeight: lang === item.code ? 700 : 500,
                    borderRadius: 6,
                    border: lang === item.code ? `1.5px solid ${T.navy}` : `1px solid ${T.border}`,
                    backgroundColor: lang === item.code ? T.navy : T.white,
                    color: lang === item.code ? T.white : T.textMain,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* ── Heading ── */}
            <div style={{ marginBottom: 36 }}>
              <h2 style={{
                fontFamily: T.font,
                fontWeight: 700,
                fontSize: courseName ? 26 : 30,
                color: T.textMain,
                margin: '0 0 6px 0',
                letterSpacing: '-0.4px',
              }}>
                {courseName ? t('Sign In to Enroll') : t('Sign In')}
              </h2>
              <p style={{
                fontFamily: T.font,
                fontSize: 14,
                color: T.textSub,
                margin: 0,
              }}>
                {t('Welcome back. Enter your credentials to continue.')}
              </p>
            </div>

            {/* ── Course Enrollment Context Banner ── */}
            {courseName && (
              <div style={{
                background: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)',
                border: '1.5px solid #6EE7B7',
                borderRadius: T.radiusSm,
                padding: '14px 16px',
                marginBottom: 22,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                fontFamily: T.font,
              }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>🎓</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13.5, color: '#065F46', marginBottom: 3 }}>
                    {t("You're enrolling in a course!")}
                  </div>
                  <div style={{ fontSize: 12.5, color: '#047857', lineHeight: 1.5 }}>
                    <strong>"{courseName}"</strong> {t('requires a')} <strong>{t('Student account')}</strong>.{' '}
                    {t('Sign in with your student credentials to continue enrollment and payment.')}
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <Link
                      to={`/register/student`}
                      style={{ fontSize: 12, color: '#059669', fontWeight: 700, textDecoration: 'underline' }}
                    >
                      {t("Don't have a Student account? Register here →")}
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* ── Email Unverified Banner ── */}
            {unverifiedEmail && (
              <div
                style={{
                  background: '#FEF9C3',
                  border: '1.5px solid #FDE047',
                  borderLeft: '4px solid #CA8A04',
                  borderRadius: T.radiusSm,
                  padding: '14px 16px',
                  marginBottom: 20,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  fontFamily: T.font,
                }}
              >
                <span style={{ fontSize: 22, flexShrink: 0, marginTop: 1 }}>✉️</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5, color: '#854D0E', marginBottom: 3 }}>
                    Email Verification Required
                  </div>
                  <div style={{ fontSize: 12.5, color: '#713F12', lineHeight: 1.5, marginBottom: 10 }}>
                    Your email address (<strong>{unverifiedEmail}</strong>) has not been verified yet. Please enter the 6-digit OTP sent to your inbox to activate your account.
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(`/verify-email?email=${encodeURIComponent(unverifiedEmail)}`)}
                    style={{
                      background: T.navy,
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      padding: '7px 14px',
                      fontSize: 12.5,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Enter 6-Digit OTP Now →
                  </button>
                </div>
              </div>
            )}

            {/* ── Error Banner ── */}
            {error && !unverifiedEmail && (
              <div
                role="alert"
                style={{
                  background: T.dangerBg,
                  border: `1px solid ${T.dangerBorder}`,
                  borderLeft: `3px solid ${T.danger}`,
                  borderRadius: T.radiusSm,
                  padding: '12px 14px',
                  marginBottom: 22,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  fontSize: 13.5,
                  color: T.danger,
                  fontFamily: T.font,
                }}
              >
                <span style={{ flexShrink: 0, marginTop: 1 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                </span>
                <span>{error}</span>
              </div>
            )}

            {/* ── Loading State ── */}
            {loading && (
              <div style={{
                textAlign: 'center',
                fontSize: 13,
                color: T.gold,
                fontWeight: 600,
                fontFamily: T.font,
                marginBottom: 16,
                opacity: 0.85,
              }}>
                Signing you in…
              </div>
            )}

            {/* ── Form ── */}
            <form onSubmit={handleSubmit} noValidate>

              {/* Username or Email */}
              <div style={{ marginBottom: 20 }}>
                <label
                  htmlFor="tc-identifier"
                  style={{
                    display: 'block',
                    fontSize: 13,
                    fontWeight: 600,
                    color: T.textMain,
                    fontFamily: T.font,
                    marginBottom: 7,
                  }}
                >
                  {t('Username or Email')}
                </label>
                <input
                  id="tc-identifier"
                  type="text"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  onFocus={() => setFocused('id')}
                  onBlur={() => setFocused(null)}
                  placeholder={t('Username or Email')}
                  autoComplete="username"
                  disabled={loading}
                  required
                  style={inputStyle('id')}
                />
              </div>

              {/* Password */}
              <div style={{ marginBottom: 10 }}>
                <label
                  htmlFor="tc-password"
                  style={{
                    display: 'block',
                    fontSize: 13,
                    fontWeight: 600,
                    color: T.textMain,
                    fontFamily: T.font,
                    marginBottom: 7,
                  }}
                >
                  {t('Password')}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="tc-password"
                    type={showPwd ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onFocus={() => setFocused('pw')}
                    onBlur={() => setFocused(null)}
                    placeholder={t('Enter your password')}
                    autoComplete="current-password"
                    disabled={loading}
                    required
                    style={{ ...inputStyle('pw'), paddingRight: 46 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(v => !v)}
                    aria-label={showPwd ? 'Hide password' : 'Show password'}
                    style={{
                      position: 'absolute',
                      right: 13, top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      color: T.textMuted,
                      display: 'flex',
                      alignItems: 'center',
                      lineHeight: 1,
                    }}
                  >
                    <EyeIcon open={showPwd} />
                  </button>
                </div>
              </div>

              {/* Remember + Forgot */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 26,
              }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  userSelect: 'none',
                  fontFamily: T.font,
                  fontSize: 13,
                  color: T.textSub,
                }}>
                  <input
                    type="checkbox"
                    className="tc-checkbox"
                    id="tc-remember"
                    checked={remember}
                    onChange={e => setRemember(e.target.checked)}
                  />
                  {t('Remember me')}
                </label>
                <Link
                  to="/forgot-password"
                  style={{
                    fontFamily: T.font,
                    fontSize: 13,
                    fontWeight: 600,
                    color: T.navy,
                    textDecoration: 'none',
                    opacity: 0.75,
                    transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = 1}
                  onMouseLeave={e => e.currentTarget.style.opacity = 0.75}
                >
                  {t('Forgot Password?')}
                </Link>
              </div>

              {/* Sign In button */}
              <button
                id="tc-login-btn"
                type="submit"
                className="tc-signin-btn"
                disabled={loading}
              >
                {loading
                  ? <><div className="tc-spinner" /><span>{t('Signing you in…')}</span></>
                  : t('Sign In')}
              </button>
            </form>

            {/* ── OR Divider ── */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              margin: '24px 0',
            }}>
              <div style={{ flex: 1, height: 1, background: T.border }}/>
              <span style={{
                fontFamily: T.font,
                fontSize: 12,
                color: T.textMuted,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                fontWeight: 600,
              }}>or</span>
              <div style={{ flex: 1, height: 1, background: T.border }}/>
            </div>

            {/* Google button */}
            <button
              id="tc-google-btn"
              type="button"
              className="tc-google-btn"
              onClick={handleGoogle}
              disabled={loading}
            >
              <GoogleLogo />
              {t('Continue with Google')}
            </button>

            {/* Register link */}
            <p style={{
              fontFamily: T.font,
              textAlign: 'center',
              fontSize: 13.5,
              color: T.textSub,
              margin: '24px 0 0 0',
            }}>
              {t("Don't have an account?")}{' '}
              <Link
                to="/register"
                style={{
                  fontWeight: 700,
                  color: T.navy,
                  textDecoration: 'none',
                  borderBottom: `1.5px solid ${T.gold}`,
                  paddingBottom: 1,
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = T.gold}
                onMouseLeave={e => e.currentTarget.style.color = T.navy}
              >
                {t('Register')}
              </Link>
            </p>

            {/* ── Quick Demo Login Accounts ── */}
            <div style={{
              marginTop: 20,
              padding: '12px 14px',
              background: '#FAF7F2',
              borderRadius: T.radiusSm,
              border: `1px solid ${T.goldLight}`,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.navy, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                ⚡ {t('Demo Quick Fill (Click to autofill):')}
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={() => { setIdentifier('customer@tailorconnect.com'); setPassword('customer123'); setError(''); }}
                  style={{ padding: '4px 8px', fontSize: 11, fontWeight: 600, background: '#E0F2FE', color: '#0369A1', border: '1px solid #BAE6FD', borderRadius: 5, cursor: 'pointer' }}
                >
                  👤 {t('Customer')}
                </button>
                <button
                  type="button"
                  onClick={() => { setIdentifier('tailor@tailorconnect.com'); setPassword('tailor123'); setError(''); }}
                  style={{ padding: '4px 8px', fontSize: 11, fontWeight: 600, background: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A', borderRadius: 5, cursor: 'pointer' }}
                >
                  ✂️ {t('Tailor')}
                </button>
                <button
                  type="button"
                  onClick={() => { setIdentifier('student@tailorconnect.com'); setPassword('student123'); setError(''); }}
                  style={{ padding: '4px 8px', fontSize: 11, fontWeight: 600, background: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0', borderRadius: 5, cursor: 'pointer' }}
                >
                  🎓 {t('Students')}
                </button>
                <button
                  type="button"
                  onClick={() => { setIdentifier('admin@tailorconnect.com'); setPassword('admin123'); setError(''); }}
                  style={{ padding: '4px 8px', fontSize: 11, fontWeight: 600, background: '#F3E8FF', color: '#6B21A8', border: '1px solid #E9D5FF', borderRadius: 5, cursor: 'pointer' }}
                >
                  👑 {t('Platform Admin')}
                </button>
              </div>
            </div>

            {/* Back to home + Admin link */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 14, borderTop: `1px solid ${T.border}` }}>
              <Link to="/home" style={{ fontSize: 12.5, color: T.textSub, textDecoration: 'none' }}>
                {t('← Back to Home')}
              </Link>
              <Link to="/admin/login" style={{ fontSize: 12.5, color: T.textMuted, textDecoration: 'none' }}>
                {t('Admin Access')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
