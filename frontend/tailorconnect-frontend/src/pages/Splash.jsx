import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ROLE_DASHBOARD = {
  customer: '/customer/dashboard',
  tailor:   '/tailor/dashboard',
  student:  '/student/dashboard',
  admin:    '/admin/dashboard',
  employee: '/employee/dashboard',
}

export default function Splash() {
  const { user, loading, switchRole } = useAuth()
  const navigate = useNavigate()
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    if (loading) return
    const timer = setTimeout(async () => {
      setFadeOut(true)
      setTimeout(async () => {
        // If user is currently Admin, or no user is logged in, open Customer Dashboard
        if (!user || user.role?.toLowerCase() === 'admin') {
          if (switchRole) {
            await switchRole('customer')
          }
          navigate('/customer/dashboard', { replace: true })
          return
        }

        if (user?.role) {
          const dest = ROLE_DASHBOARD[user.role.toLowerCase()]
          navigate(dest || '/customer/dashboard', { replace: true })
        } else {
          navigate('/customer/dashboard', { replace: true })
        }
      }, 400)
    }, 1200)
    return () => clearTimeout(timer)
  }, [loading, user, navigate, switchRole])

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#FCFBF7',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 9999,
      opacity: fadeOut ? 0 : 1,
      transition: 'opacity 0.5s ease',
      fontFamily: "'Outfit', 'Inter', sans-serif",
    }}>
      {/* Subtle background texture */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0, opacity: 0.03,
        backgroundImage: 'radial-gradient(circle at 1px 1px, #0F5C5E 1px, transparent 0)',
        backgroundSize: '28px 28px',
        pointerEvents: 'none',
      }} />

      {/* Logo Mark */}
      <div style={{ marginBottom: 28, animation: 'splashLogoIn 0.65s ease forwards', position: 'relative', zIndex: 1 }}>
        <SplashLogo />
      </div>

      {/* Brand Name */}
      <div style={{ textAlign: 'center', animation: 'splashTextIn 0.7s ease 0.2s both', position: 'relative', zIndex: 1 }}>
        <h1 style={{
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 800, fontSize: 38,
          color: '#0F5C5E',
          letterSpacing: '-0.03em',
          margin: 0, lineHeight: 1.1,
        }}>
          Tailor<span style={{ color: '#C9A66B' }}>Connect</span>
        </h1>
        <p style={{
          marginTop: 10, fontSize: 14.5,
          color: '#667085', fontWeight: 400, letterSpacing: '0.02em',
        }}>
          Premium Tailoring Services &amp; Learning Platform
        </p>
      </div>

      {/* Stitch line */}
      <div style={{ marginTop: 36, animation: 'splashTextIn 0.8s ease 0.4s both', position: 'relative', zIndex: 1 }}>
        <StitchLine />
      </div>

      {/* Loading dots */}
      <div style={{
        display: 'flex', gap: 8, marginTop: 28,
        animation: 'splashTextIn 0.8s ease 0.55s both',
        position: 'relative', zIndex: 1,
      }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{
            width: 7, height: 7, borderRadius: '50%',
            backgroundColor: '#0F5C5E',
            animation: `dotBounce 1.2s ease ${i * 0.18}s infinite`,
            opacity: 0.65,
          }} />
        ))}
      </div>

      <style>{`
        @keyframes splashLogoIn {
          from { opacity: 0; transform: scale(0.7) translateY(20px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes splashTextIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes dotBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.65; }
          40%            { transform: translateY(-10px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

function SplashLogo() {
  return (
    <svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer ring */}
      <circle cx="48" cy="48" r="46" fill="#0F5C5E" />
      <circle cx="48" cy="48" r="43" fill="none" stroke="rgba(201,166,107,0.3)" strokeWidth="1.5" />

      {/* Needle body */}
      <line x1="48" y1="20" x2="48" y2="65" stroke="white" strokeWidth="2.8" strokeLinecap="round" />
      {/* Needle eye */}
      <ellipse cx="48" cy="18" rx="5.5" ry="3.2" stroke="#C9A66B" strokeWidth="2" fill="none" />
      <ellipse cx="48" cy="24" rx="2" ry="1.5" stroke="white" strokeWidth="1.5" fill="none" />

      {/* Thread curve — elegant S-curve */}
      <path d="M34 52 Q41 44 48 52 Q55 60 62 52" stroke="#C9A66B" strokeWidth="2.2" strokeLinecap="round" fill="none" />

      {/* Thread tail */}
      <path d="M48 65 C43 72 37 76 40 83" stroke="#C9A66B" strokeWidth="1.8" strokeDasharray="3 2.5" strokeLinecap="round" fill="none" />

      {/* Champagne dot accent */}
      <circle cx="65" cy="30" r="4" fill="#C9A66B" opacity="0.9" />
      <circle cx="65" cy="30" r="6.5" fill="none" stroke="#C9A66B" strokeWidth="1" opacity="0.3" />
    </svg>
  )
}

function StitchLine() {
  return (
    <svg width="160" height="8" viewBox="0 0 160 8" fill="none" xmlns="http://www.w3.org/2000/svg">
      {[0, 16, 32, 48, 64, 80, 96, 112, 128, 144].map((x) => (
        <rect key={x} x={x} y="3" width="10" height="2" rx="1" fill="#C9A66B" opacity="0.45" />
      ))}
    </svg>
  )
}
