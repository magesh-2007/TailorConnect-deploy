import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout'
import api from '../../services/api'
import { useLanguage } from '../../context/LanguageContext'
import { useAuth } from '../../context/AuthContext'

// ── Tiny helpers ──────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, color = 'var(--primary)', icon }) => (
  <div className="stat-card" style={{ position: 'relative', overflow: 'hidden' }}>
    {icon && (
      <span style={{ position: 'absolute', top: 12, right: 14, fontSize: 22, opacity: 0.18 }}>
        {icon}
      </span>
    )}
    <h3>{label}</h3>
    <div className="stat-value" style={{ color }}>
      {value ?? <span style={{ color: 'var(--text-muted)', fontSize: 18 }}>—</span>}
    </div>
    {sub && <span className="stat-subtitle">{sub}</span>}
  </div>
)

const roleBadgeStyle = (role) => {
  const map = {
    admin:    { background: '#7c3aed22', color: '#7c3aed' },
    tailor:   { background: '#0369a122', color: '#0369a1' },
    customer: { background: '#15803d22', color: '#15803d' },
    student:  { background: '#b4530022', color: '#b45300' },
    employee: { background: '#1d4ed822', color: '#1d4ed8' }
  }
  const key = (role || '').toLowerCase()
  return { ...map[key], padding: '2px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }
}

const orderStatusColor = (status = '') => {
  const s = status.toUpperCase()
  if (s === 'DELIVERED') return 'var(--success)'
  if (['ACCEPTED', 'IN_PROGRESS', 'STITCHING_STARTED'].includes(s)) return 'var(--primary)'
  if (s === 'REQUEST_RECEIVED') return 'var(--warning)'
  if (['CANCELLED', 'REJECTED'].includes(s)) return 'var(--danger)'
  return 'var(--text-secondary)'
}

export default function AdminDashboard() {
  const { t } = useLanguage()
  const { switchRole } = useAuth()
  const [stats, setStats] = useState(null)
  const [recentUsers, setRecentUsers] = useState([])
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/admin/dashboard')
        const data = res.data?.data || {}
        setStats(data.stats || null)
        setRecentUsers(data.recentUsers || [])
        setRecentOrders(data.recentOrders || [])
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard. Check your connection.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // ── Bar chart data from real stats ───────────────────────────────────────────
  const roleBreakdown = stats ? [
    { role: t('Customers'), count: stats.totalCustomers, color: 'var(--primary)' },
    { role: t('Tailors'),   count: stats.totalTailors,   color: '#9C27B0' },
    { role: t('Students'),  count: stats.totalStudents,  color: '#0288D1' },
    { role: t('Employees'), count: stats.totalEmployees, color: '#F57C00' }
  ] : []

  const maxRole = Math.max(...roleBreakdown.map(r => r.count), 1)

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ fontSize: 38, marginBottom: 14 }}>⏳</div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading Admin Dashboard from MongoDB…</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="admin">
      <div className="page-header">
        <div>
          <h1>{t('Platform Governance & Analytics Console')}</h1>
          <p>{t('Real-time data from MongoDB · All statistics pulled live from the backend.')}</p>
        </div>
        <div className="page-actions">
          <Link to="/admin/tailor-verification">
            <button className="btn btn-primary" style={{ fontSize: 13 }}>
              ✅ {t('Verify Tailors')} ({stats?.pendingVerification ?? 0})
            </button>
          </Link>
          <Link to="/admin/orders">
            <button className="btn btn-outline" style={{ fontSize: 13 }}>
              📦 {t('View Orders')} ({stats?.totalOrders ?? 0})
            </button>
          </Link>
        </div>
      </div>

      {/* ── Switch to Customer Banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)',
        border: '1.5px solid #38BDF8',
        borderRadius: 12,
        padding: '14px 20px',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 26 }}>👗</span>
          <div>
            <strong style={{ color: '#0369A1', fontSize: 14 }}>
              Looking for the Customer Portal?
            </strong>
            <p style={{ margin: 0, fontSize: 12.5, color: '#0284C7' }}>
              Switch directly to Customer Dashboard to find tailors, view tailor profiles, and book stitching services.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => switchRole('customer')}
          style={{
            padding: '9px 18px',
            backgroundColor: '#0284C7',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(2,132,199,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <span>👤</span>
          <span>Open Customer Dashboard →</span>
        </button>
      </div>

      {error && (
        <div style={{ background: 'var(--danger-bg, #fee)', color: 'var(--danger)', border: '1px solid var(--danger-border, #fca)', padding: '12px 18px', borderRadius: 8, marginBottom: 20 }}>
          ⚠️ {error}
        </div>
      )}

      {/* ── PRIMARY STATS GRID ───────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard label={t('Total Users')}          value={stats?.totalUsers}           sub={t('All platform accounts')}       color="var(--primary)"  icon="👥" />
        <StatCard label={t('Customers')}            value={stats?.totalCustomers}       sub={t('Registered customers')}        color="#15803d"         icon="👗" />
        <StatCard label={t('Tailors')}              value={stats?.totalTailors}         sub={t('Registered tailors')}          color="#9C27B0"         icon="🧵" />
        <StatCard label={t('Students')}             value={stats?.totalStudents}        sub={t('Learning platform')}           color="#0288D1"         icon="📚" />
        <StatCard label={t('Employees')}            value={stats?.totalEmployees}       sub={t('Staff accounts')}              color="#F57C00"         icon="🏢" />
        <StatCard label={t('Verified Tailors')}     value={stats?.verifiedTailors}      sub={t('Accredited boutiques')}        color="var(--success)"  icon="✅" />
        <StatCard label={t('Pending Verification')} value={stats?.pendingVerification}  sub={t('Awaiting approval')}           color="var(--warning)"  icon="⏳" />
        <StatCard label={t('Total Orders')}         value={stats?.totalOrders}          sub={t('All orders placed')}           color="var(--primary)"  icon="📦" />
        <StatCard label={t('Active Orders')}        value={stats?.activeOrders}         sub={t('In production queue')}         color="var(--text-main)"icon="⚡" />
        <StatCard label={t('Completed Orders')}     value={stats?.completedOrders}      sub={t('Successfully delivered')}      color="var(--success)"  icon="🎉" />
        <StatCard label={t('Total Courses')}        value={stats?.totalCourses}         sub={t('Learning catalogue')}          color="#1d4ed8"         icon="🎓" />
      </div>

      {/* ── CHARTS ROW ───────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20, marginBottom: 28 }}>

        {/* User Distribution by Role */}
        <div className="card" style={{ padding: 22 }}>
          <div className="flex-between" style={{ marginBottom: 14 }}>
            <div>
              <h3 style={{ fontSize: 16, margin: 0 }}>👥 {t('User Distribution by Role')}</h3>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{t('Live counts from MongoDB')}</span>
            </div>
            <Link to="/admin/users" style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>
              {t('All Users')} →
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 8 }}>
            {roleBreakdown.map(r => (
              <div key={r.role}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                  <span style={{ fontWeight: 500 }}>{r.role}</span>
                  <strong style={{ color: r.color }}>{r.count}</strong>
                </div>
                <div style={{ width: '100%', height: 10, background: 'var(--bg-subtle)', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.round((r.count / maxRole) * 100)}%`,
                    height: '100%',
                    background: r.color,
                    borderRadius: 999,
                    transition: 'width 0.6s ease'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Status Overview */}
        <div className="card" style={{ padding: 22 }}>
          <div style={{ marginBottom: 14 }}>
            <h3 style={{ fontSize: 16, margin: 0 }}>📦 {t('Order Status Overview')}</h3>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{t('Real-time order pipeline')}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { label: t('Total Orders'),   value: stats?.totalOrders,     color: 'var(--primary)',  icon: '📦' },
              { label: t('Active / WIP'),   value: stats?.activeOrders,    color: 'var(--warning)',  icon: '⚡' },
              { label: t('Completed'),      value: stats?.completedOrders, color: 'var(--success)',  icon: '✅' },
              { label: t('Courses'),        value: stats?.totalCourses,    color: '#1d4ed8',         icon: '🎓' }
            ].map(item => (
              <div key={item.label} style={{
                background: 'var(--bg-subtle)',
                borderRadius: 10,
                padding: '14px 16px',
                border: '1px solid var(--border-light)'
              }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{item.icon}</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: item.color }}>{item.value ?? '—'}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RECENT USERS ─────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: 20, marginBottom: 28 }}>
        <div className="card" style={{ padding: 22 }}>
          <div className="flex-between" style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, margin: 0 }}>🆕 {t('Recent Users')}</h3>
            <Link to="/admin/users" style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>
              {t('All Users')} →
            </Link>
          </div>
          {recentUsers.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{t('No users found.') || 'No users found.'}</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recentUsers.map(u => (
                <div key={u._id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <img
                    src={u.profileImage}
                    alt={u.name}
                    style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {u.name}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.email}</div>
                  </div>
                  <span style={roleBadgeStyle(u.role)}>{u.role}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── RECENT ORDERS ──────────────────────────────────────────────────── */}
        <div className="card" style={{ padding: 22 }}>
          <div className="flex-between" style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, margin: 0 }}>🧾 {t('Recent Tailoring Orders')}</h3>
            <Link to="/admin/orders" style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>
              {t('Orders')} →
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{t('No orders found.') || 'No orders found.'}</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recentOrders.map(o => (
                <div key={o._id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 8,
                    background: 'var(--bg-subtle)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, border: '1px solid var(--border-light)'
                  }}>🪡</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {o.designName}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      #{o.orderNumber} · {o.customerId?.name || 'Customer'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>
                      ₹{(o.price || 0).toLocaleString()}
                    </div>
                    <div style={{ fontSize: 11, color: orderStatusColor(o.orderStatus), fontWeight: 600 }}>
                      {(o.orderStatus || '').replace(/_/g, ' ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
