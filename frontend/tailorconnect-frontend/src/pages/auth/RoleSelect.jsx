import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/Button'
import Logo from '../../components/Logo'

const ROLES = [
  {
    role: 'customer',
    icon: '👗',
    badge: 'Customer Portal',
    title: 'Customer',
    desc: 'Request custom dress stitching, upload designs, compare tailor quotations, and track production lifecycle.',
    demoEmail: 'customer@tailorconnect.com',
    demoPass: 'customer123',
    demoName: 'Priya Sharma',
    features: ['Custom Dress Orders', 'Quotation Comparison', 'Live Production Tracking', 'Tailor Chat']
  },
  {
    role: 'tailor',
    icon: '🧵',
    badge: 'Tailor Studio',
    title: 'Tailor / Boutique',
    desc: 'Manage custom orders, capacity & workload, submit quotes, configure services, and host tailoring courses.',
    demoEmail: 'tailor@tailorconnect.com',
    demoPass: 'tailor123',
    demoName: 'Lakshmi Devi (Lakshmi Stitches)',
    features: ['Production Queue', 'Capacity Management', 'Service Catalog', 'Course Studio']
  },
  {
    role: 'student',
    icon: '📚',
    badge: 'Student Academy',
    title: 'Fashion Student',
    desc: 'Enroll in verified tailoring & Aari embroidery masterclasses, complete assignments, and earn certificates.',
    demoEmail: 'student@tailorconnect.com',
    demoPass: 'student123',
    demoName: 'Meena Sundaram',
    features: ['Video Lessons', 'Needlework Practice', 'Interactive Quizzes', 'Verified Certificates']
  },
  {
    role: 'admin',
    icon: '🛠️',
    badge: 'Admin Console',
    title: 'Platform Admin',
    desc: 'Verify artisan credentials, supervise order SLAs, resolve disputes, review courses, and monitor platform health.',
    demoEmail: 'admin@tailorconnect.com',
    demoPass: 'admin123',
    demoName: 'Platform Administrator',
    features: ['Tailor Verification', 'Dispute Resolution', 'Order Supervision', 'Revenue Reports']
  }
]

export default function RoleSelect() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [selectedRole, setSelectedRole] = useState('customer')
  const [form, setForm] = useState({ identifier: 'customer@tailorconnect.com', password: 'customer123', remember: true })
  const [error, setError] = useState('')
  const [loadingRole, setLoadingRole] = useState(null)

  const handleQuickLogin = async (r) => {
    setLoadingRole(r.role)
    setError('')
    const result = await login({
      identifier: r.demoEmail,
      password: r.demoPass
    })
    setLoadingRole(null)

    if (result.success) {
      const dbRole = (result.user?.role || r.role).toLowerCase()
      navigate(`/${dbRole}/dashboard`)
    } else {
      setError(result.error || 'Failed to log in.')
    }
  }

  const handleRoleTabChange = (roleKey) => {
    setSelectedRole(roleKey)
    const rConfig = ROLES.find((r) => r.role === roleKey)
    if (rConfig) {
      setForm({
        identifier: rConfig.demoEmail,
        password: rConfig.demoPass,
        remember: true
      })
    }
    setError('')
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    if (!form.identifier || !form.password) {
      setError('Please provide your login credentials.')
      return
    }

    setLoadingRole(selectedRole)
    setError('')
    const result = await login({
      identifier: form.identifier,
      password: form.password
    })
    setLoadingRole(null)

    if (result.success) {
      const dbRole = (result.user?.role || selectedRole).toLowerCase()
      navigate(`/${dbRole}/dashboard`)
    } else {
      setError(result.error || 'Invalid credentials. Please verify your details.')
    }
  }

  return (
    <div className="auth-wrapper" style={{ minHeight: '100vh', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* BRAND HEADER */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <Logo size={42} />
        <h1 style={{ fontSize: 26, fontWeight: 700, marginTop: 12, color: 'var(--text-main)' }}>
          Tailor<span style={{ color: 'var(--primary)' }}>Connect</span> Platform
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 520, margin: '6px auto 0 auto' }}>
          Professional Tailoring Services, Custom Orders, Artisan Marketplace & Learning Platform
        </p>
      </div>

      {/* 4 ROLE SELECTION CARDS */}
      <div style={{ maxWidth: 1120, width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20, marginBottom: 36 }}>
        {ROLES.map((r) => {
          const isSelected = selectedRole === r.role

          return (
            <div
              key={r.role}
              className="card"
              style={{
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                backgroundColor: isSelected ? 'var(--bg-card)' : 'var(--bg-card)',
                boxShadow: isSelected ? '0 4px 16px rgba(233, 30, 99, 0.12)' : 'var(--shadow-xs)',
                cursor: 'pointer',
                position: 'relative'
              }}
              onClick={() => handleRoleTabChange(r.role)}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 28 }}>{r.icon}</span>
                  <span className="sidebar-role-badge">{r.badge}</span>
                </div>

                <h3 style={{ fontSize: 17, color: 'var(--text-main)', marginBottom: 6 }}>{r.title}</h3>
                <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: 14 }}>
                  {r.desc}
                </p>

                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 12, marginBottom: 16 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                    Included Features
                  </span>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                    {r.features.map((feat, fIdx) => (
                      <li key={fIdx} style={{ fontSize: 12, color: 'var(--text-main)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ color: 'var(--primary)', fontWeight: 700 }}>✓</span> {feat}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <Button
                  variant={isSelected ? 'primary' : 'outline'}
                  size="sm"
                  block
                  onClick={(e) => {
                    e.stopPropagation()
                    handleQuickLogin(r)
                  }}
                  disabled={loadingRole === r.role}
                >
                  {loadingRole === r.role ? 'Authenticating...' : `1-Click Demo Login as ${r.title}`}
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      {/* DIRECT LOGIN FORM CONTAINER */}
      <div className="auth-card" style={{ maxWidth: 520, width: '100%' }}>
        <div className="auth-header">
          <h2 className="auth-title">Sign In to Your Workspace</h2>
          <p className="auth-subtitle">
            Logging in as <strong style={{ color: 'var(--primary)' }}>{ROLES.find(r => r.role === selectedRole)?.title}</strong>
          </p>
        </div>

        {/* ROLE TABS */}
        <div className="auth-role-pills">
          {ROLES.map((r) => (
            <button
              key={r.role}
              type="button"
              className={`auth-role-pill ${selectedRole === r.role ? 'active' : ''}`}
              onClick={() => handleRoleTabChange(r.role)}
            >
              {r.icon} {r.title}
            </button>
          ))}
        </div>

        {error && (
          <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger-border)', padding: '10px 14px', borderRadius: 6, fontSize: 13, marginBottom: 16 }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label className="form-label">Email or Phone Number <span className="required">*</span></label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. name@tailorconnect.com or phone"
              value={form.identifier}
              onChange={(e) => setForm({ ...form, identifier: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <label className="form-label" style={{ margin: 0 }}>Password <span className="required">*</span></label>
              <span style={{ fontSize: 12, color: 'var(--primary)', cursor: 'pointer' }} onClick={() => alert('Password reset link sent to demo registered email.')}>
                Forgot password?
              </span>
            </div>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={form.remember}
                onChange={(e) => setForm({ ...form, remember: e.target.checked })}
              />
              Remember me on this device
            </label>
          </div>

          <Button type="submit" variant="primary" block size="lg" disabled={loadingRole !== null}>
            {loadingRole ? 'Signing In...' : `Login as ${ROLES.find(r => r.role === selectedRole)?.title}`}
          </Button>
        </form>

        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-light)', textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to={`/register/${selectedRole}`} style={{ fontWeight: 600, color: 'var(--primary)' }}>
            Register as {ROLES.find(r => r.role === selectedRole)?.title} →
          </Link>
        </div>
      </div>
    </div>
  )
}
