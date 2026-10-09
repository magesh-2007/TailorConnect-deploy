import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import api from '../../services/api'

const SERVICE_CATEGORIES = [
  { title: 'Bridal Blouse', icon: '👗', color: '#DDEBE7', specialist: 'Bridal Blouse' },
  { title: 'Aari & Embroidery', icon: '🧵', color: '#F0F7EF', specialist: 'Aari' },
  { title: 'Designer Blouse', icon: '✂️', color: '#FFF8F0', specialist: 'Designer Blouse' },
  { title: 'Saree Alteration', icon: '📌', color: '#F5F0FB', specialist: 'Saree' },
  { title: 'Kids Wear', icon: '👶', color: '#F0F9FF', specialist: 'Kids' },
  { title: 'Lehenga / Party Wear', icon: '🎀', color: '#FFF0F5', specialist: 'Lehenga' },
  { title: 'Custom Stitching', icon: '🪡', color: '#F5FBF0', specialist: 'Custom' },
  { title: 'Alterations', icon: '🔧', color: '#F0F4FB', specialist: 'Alteration' },
]

export default function CustomerDashboard() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()

  const [orders, setOrders] = useState([])
  const [appointments, setAppointments] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    Promise.allSettled([
      api.get('/orders/my'),
      api.get('/orders'),
      api.get('/appointments/my'),
      api.get('/notifications'),
    ]).then(([ordersRes, ordersRes2, apptRes, notifRes]) => {
      const ordersData =
        ordersRes.status === 'fulfilled'
          ? (ordersRes.value.data?.data?.orders || ordersRes.value.data?.orders || [])
          : ordersRes2.status === 'fulfilled'
          ? (ordersRes2.value.data?.data?.orders || ordersRes2.value.data?.orders || [])
          : []
      setOrders(ordersData)

      if (apptRes.status === 'fulfilled') {
        const apptData = apptRes.value.data?.data?.appointments || apptRes.value.data?.appointments || []
        setAppointments(apptData.slice(0, 3))
      }
      if (notifRes.status === 'fulfilled') {
        const notifData = notifRes.value.data?.data?.notifications || notifRes.value.data?.notifications || []
        setNotifications(notifData.slice(0, 5))
      }
    }).finally(() => setLoading(false))
  }, [user])

  const activeOrders = orders.filter(o =>
    !['COMPLETED', 'DELIVERED', 'CANCELLED', 'REJECTED'].includes(o.orderStatus)
  )
  const completedOrders = orders.filter(o => ['COMPLETED', 'DELIVERED'].includes(o.orderStatus))
  const unreadNotifCount = notifications.filter(n => !n.isRead).length

  const handleCategoryClick = (specialist) => {
    navigate(`/customer/tailors?specialist=${encodeURIComponent(specialist)}`)
  }

  const statCards = [
    {
      title: 'Active Requests',
      value: loading ? '—' : activeOrders.length,
      subtitle: 'In stitching or production',
      color: '#0F5C5E', bg: '#DDEBE7', icon: '✂️',
      link: '/customer/orders',
    },
    {
      title: 'Completed Orders',
      value: loading ? '—' : completedOrders.length,
      subtitle: 'Successfully delivered',
      color: '#3F7D5A', bg: '#ECFDF5', icon: '✅',
      link: '/customer/orders',
    },
    {
      title: 'Appointments',
      value: loading ? '—' : appointments.length,
      subtitle: 'Upcoming tailor visits',
      color: '#7C5CBF', bg: '#F3EEFF', icon: '📅',
      link: '/customer/appointments',
    },
    {
      title: 'Notifications',
      value: loading ? '—' : unreadNotifCount,
      subtitle: `${notifications.length} total alerts`,
      color: '#B45353', bg: '#FEF2F2', icon: '🔔',
      link: '/customer/notifications',
    },
  ]

  return (
    <DashboardLayout role="customer">
      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <h1 style={{ color: '#0F5C5E' }}>
            {t('Welcome back,')} {user?.name?.split(' ')[0] || 'there'} 👋
          </h1>
          <p>{t('Manage your tailoring requests, track deliveries, and discover new tailors.')}</p>
        </div>
        <div className="page-actions">
          <Link to="/customer/create-order">
            <button style={btnPrimary}>{t('+ New Tailoring Request')}</button>
          </Link>
          <Link to="/customer/tailors">
            <button style={btnOutline}>{t('🔍 Find Tailors')}</button>
          </Link>
        </div>
      </div>

      {/* ── KPI Stat Cards ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16, marginBottom: 28,
      }}>
        {statCards.map(card => (
          <Link
            key={card.title}
            to={card.link}
            style={{ textDecoration: 'none' }}
          >
            <div
              style={{
                background: '#FFFFFF', border: '1.5px solid #E3E8E6',
                borderRadius: 12, padding: '18px 20px',
                cursor: 'pointer', transition: 'all 0.2s',
                display: 'flex', flexDirection: 'column', gap: 8,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#0F5C5E'
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(15,92,94,0.1)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#E3E8E6'
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: card.bg, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 18,
                }}>
                  {card.icon}
                </div>
                <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600 }}>{t('View')} →</span>
              </div>
              <div style={{ fontSize: 30, fontWeight: 800, color: card.color, fontFamily: "'Outfit', sans-serif", lineHeight: 1 }}>
                {card.value}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1F2937' }}>{t(card.title)}</div>
              <div style={{ fontSize: 12, color: '#9CA3AF' }}>{t(card.subtitle)}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* ── AI Chatbot Banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0F5C5E 0%, #164E63 100%)',
        borderRadius: 16,
        padding: '18px 24px',
        color: '#FFFFFF',
        marginBottom: 28,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        boxShadow: '0 8px 24px rgba(15,92,94,0.18)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, maxWidth: 650 }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: 'rgba(255,255,255,0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            flexShrink: 0,
            border: '1.5px solid rgba(255,255,255,0.4)',
          }}>
            🤖
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, color: '#FFFFFF', fontFamily: "'Outfit', sans-serif" }}>
                TailorBot AI Chatbot
              </h2>
              <span style={{ fontSize: 10.5, fontWeight: 700, background: '#10B981', color: '#FFFFFF', padding: '2px 8px', borderRadius: 999 }}>
                24/7 ACTIVE
              </span>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: '#E2E8F0', lineHeight: 1.5 }}>
              Ask in Tamil or English! Get blouse design ideas, stitching rates, find top tailors near you in Chennai, Madurai & Coimbatore, and track your orders instantly.
            </p>
          </div>
        </div>

        <Link to="/customer/chatbot" style={{ textDecoration: 'none' }}>
          <button
            type="button"
            style={{
              padding: '10px 20px',
              borderRadius: 10,
              background: '#FFFFFF',
              color: '#0F5C5E',
              border: 'none',
              fontWeight: 800,
              fontSize: 13.5,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              transition: 'all 0.18s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.18)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
            }}
          >
            <span>Ask Chatbot</span>
            <span>→</span>
          </button>
        </Link>
      </div>

      {/* ── Appointments Preview ── */}
      {appointments.length > 0 && (
        <div style={{ background: '#FFFFFF', border: '1.5px solid #E3E8E6', borderRadius: 14, overflow: 'hidden', marginBottom: 28 }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #E8EFF7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0F5C5E', margin: 0 }}>{t('📅 Upcoming Appointments')}</h2>
            <Link to="/customer/appointments" style={{ fontSize: 12.5, fontWeight: 600, color: '#0F5C5E' }}>{t('View All →')}</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 1, background: '#E8EFF7' }}>
            {appointments.map(appt => (
              <div key={appt._id} style={{ background: '#FFFFFF', padding: '14px 18px' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0F5C5E', marginBottom: 4 }}>
                  {appt.purpose || appt.title || 'Tailor Appointment'}
                </div>
                <div style={{ fontSize: 12, color: '#667085' }}>
                  📅 {formatDate(appt.date || appt.appointmentDate)} &nbsp;•&nbsp; ⏰ {appt.time || appt.appointmentTime || '—'}
                </div>
                <div style={{ fontSize: 11.5, color: '#9CA3AF', marginTop: 4 }}>
                  {appt.tailorId?.name || appt.tailorName || 'Tailor'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Service Categories ── */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div>
            <h2 style={{ fontSize: 18, color: '#0F5C5E', margin: 0, fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>
              {t('Explore Tailoring Services')}
            </h2>
            <p style={{ fontSize: 13, color: '#667085', margin: '3px 0 0' }}>
              {t('Click a category to find specialized tailors near you')}
            </p>
          </div>
          <Link to="/customer/tailors" style={{ fontSize: 13, fontWeight: 600, color: '#0F5C5E' }}>
            {t('Browse All →')}
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
          {SERVICE_CATEGORIES.map(cat => (
            <button
              key={cat.title}
              onClick={() => handleCategoryClick(cat.specialist)}
              style={{
                background: cat.color, border: '1.5px solid #E3E8E6',
                borderRadius: 12, padding: '16px', textAlign: 'left',
                cursor: 'pointer', transition: 'all 0.2s', display: 'block', width: '100%',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#0F5C5E'
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 6px 18px rgba(15,92,94,0.12)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#E3E8E6'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div style={{ fontSize: 26, marginBottom: 8 }}>{cat.icon}</div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0F5C5E', margin: '0 0 4px' }}>{t(cat.title)}</h3>
              <div style={{ fontSize: 12, color: '#0F5C5E', fontWeight: 600 }}>{t('Find Tailors →')}</div>
            </button>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(d) {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return d
  }
}

function StatusBadge({ status }) {
  const map = {
    REQUEST_RECEIVED:  { label: 'Pending',      bg: '#FFFBEB', color: '#92400E' },
    ACCEPTED:          { label: 'Accepted',      bg: '#ECFDF5', color: '#065F46' },
    STITCHING_STARTED: { label: 'Stitching',     bg: '#EFF6FF', color: '#1E40AF' },
    IN_PROGRESS:       { label: 'In Progress',   bg: '#EFF6FF', color: '#1E40AF' },
    READY:             { label: 'Ready',          bg: '#ECFDF5', color: '#065F46' },
    OUT_FOR_DELIVERY:  { label: 'Out for Delivery', bg: '#DDEBE7', color: '#0F5C5E' },
    DELIVERED:         { label: 'Delivered',     bg: '#ECFDF5', color: '#065F46' },
    COMPLETED:         { label: 'Completed',     bg: '#ECFDF5', color: '#065F46' },
    REJECTED:          { label: 'Rejected',      bg: '#FEF2F2', color: '#991B1B' },
    CANCELLED:         { label: 'Cancelled',     bg: '#F1F5F9', color: '#475569' },
  }
  const s = map[status] || { label: status || 'Unknown', bg: '#F1F5F9', color: '#475569' }
  return (
    <span style={{
      display: 'inline-block', padding: '3px 9px', borderRadius: 999,
      fontSize: 11, fontWeight: 700, background: s.bg, color: s.color,
      whiteSpace: 'nowrap', flexShrink: 0,
    }}>
      {s.label}
    </span>
  )
}

function EmptyState({ icon, title, subtitle, action, compact }) {
  return (
    <div style={{ padding: compact ? '16px 0' : '32px', textAlign: 'center' }}>
      <div style={{ fontSize: compact ? 28 : 36, marginBottom: 8 }}>{icon}</div>
      <h3 style={{ fontSize: compact ? 13 : 15, fontWeight: 700, color: '#0F5C5E', margin: '0 0 4px' }}>{title}</h3>
      <p style={{ fontSize: 12.5, color: '#9CA3AF', margin: '0 0 14px' }}>{subtitle}</p>
      {action && (
        <Link to={action.to} style={{ textDecoration: 'none' }}>
          <button style={{ ...btnPrimary, fontSize: 13 }}>{action.label}</button>
        </Link>
      )}
    </div>
  )
}

function LoadingSpinner() {
  return (
    <span style={{
      width: 20, height: 20, borderRadius: '50%',
      border: '2px solid #E3E8E6', borderTopColor: '#0F5C5E',
      animation: 'spin 0.8s linear infinite', display: 'inline-block',
    }} />
  )
}

const btnPrimary = {
  background: '#0F5C5E', color: '#FFFFFF', border: 'none',
  padding: '9px 20px', borderRadius: 8, fontSize: 13.5, fontWeight: 600,
  cursor: 'pointer', transition: 'all 0.18s', display: 'inline-flex', alignItems: 'center', gap: 6,
}

const btnOutline = {
  background: 'transparent', color: '#0F5C5E',
  border: '1.5px solid #0F5C5E',
  padding: '8px 18px', borderRadius: 8, fontSize: 13.5, fontWeight: 600,
  cursor: 'pointer', transition: 'all 0.18s', display: 'inline-flex', alignItems: 'center', gap: 6,
}
