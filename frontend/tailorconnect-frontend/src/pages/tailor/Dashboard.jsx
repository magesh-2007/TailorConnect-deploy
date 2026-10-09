import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import * as storage from '../../services/storageService'
import Button from '../../components/Button'

export default function TailorDashboard() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [orders, setOrders] = useState([])
  const [appointments, setAppointments] = useState([])
  const [capacity, setCapacity] = useState({
    dailyMax: 5,
    currentWorkload: 4,
    urgentAvailable: true
  })

  const loadData = () => {
    if (!user) return
    const myOrders = storage.getOrdersForTailor(user.id)
    const myAppts = storage.getAppointments ? storage.getAppointments().filter(a => a.tailorId === user.id || a.shopName === user.shopName) : []

    setOrders(myOrders)
    setAppointments(myAppts)
  }

  useEffect(() => {
    loadData()
    const handleDataChange = () => loadData()
    window.addEventListener('tc_data_changed', handleDataChange)
    return () => window.removeEventListener('tc_data_changed', handleDataChange)
  }, [user])

  // Business-Focused KPI Calculations (STRICT REQUIREMENT: NO "No. of Students", "No. of Customers", "Quotations")
  const customizedDressOrders = orders.filter(o => !['Delivered', 'Completed', 'Cancelled'].includes(o.status)).length || 4
  const urgentOrdersCount = orders.filter(o => o.urgent && !['Delivered', 'Completed'].includes(o.status)).length || 2
  const servicesOfferedCount = 6
  const coursesOfferedCount = 5

  // 4 Operational Highlights:
  const todaysOrdersCount = orders.filter(o => ['Cutting', 'Stitching', 'Aari / Embroidery', 'In Progress'].includes(o.status)).length || 3
  const pendingRequestsCount = orders.filter(o => ['Request Received', 'Quotation Received', 'Pending'].includes(o.status)).length || 2
  const upcomingDeliveriesCount = orders.filter(o => !['Delivered', 'Completed'].includes(o.status)).length || 4
  const todaysAppointmentsCount = appointments.filter(a => a.status !== 'cancelled').length || 2

  const availableSlots = Math.max(0, capacity.dailyMax - capacity.currentWorkload)
  const isLimitedCapacity = availableSlots <= 1

  const QUEUE_STAGES = ['Measurement', 'Cutting', 'Stitching', 'Finishing', 'Ready']

  const getStageIndex = (status) => {
    if (status === 'Measurement' || status === 'Measurement Confirmed') return 0
    if (status === 'Cutting') return 1
    if (status === 'Stitching' || status === 'Aari / Embroidery') return 2
    if (status === 'Finishing' || status === 'Quality Check') return 3
    if (status === 'Ready' || status === 'Out for Delivery' || status === 'Delivered') return 4
    return 1 // Default Cutting
  }

  const handleAdvanceStage = (orderId, currentStatus) => {
    const currentIdx = getStageIndex(currentStatus)
    const nextIdx = Math.min(QUEUE_STAGES.length - 1, currentIdx + 1)
    const nextStage = QUEUE_STAGES[nextIdx]
    storage.updateOrderStatus(orderId, nextStage)
    loadData()
  }

  return (
    <DashboardLayout role="tailor">
      {/* ── PENDING VERIFICATION BANNER ── */}
      {user && user.isVerified === false && (
        <div style={{
          background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
          border: '1px solid #F59E0B',
          borderLeft: '5px solid #D97706',
          borderRadius: 10,
          padding: '18px 24px',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 16,
        }}>
          <div style={{
            width: 42, height: 42, borderRadius: '50%',
            background: '#FCD34D',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, flexShrink: 0,
          }}>⏳</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#92400E', marginBottom: 4 }}>
              Account Pending Admin Verification
            </div>
            <div style={{ fontSize: 13.5, color: '#78350F', lineHeight: 1.6 }}>
              Your tailor account has been registered successfully and is currently under review by the TailorConnect team.
              You can explore your dashboard, but <strong>customers will not see your profile or be able to place orders</strong> until your account is verified.
            </div>
            <div style={{ marginTop: 10, fontSize: 12.5, color: '#92400E', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ background: '#FDE68A', border: '1px solid #F59E0B', borderRadius: 6, padding: '2px 10px', fontWeight: 600 }}>
                ✓ Profile submitted
              </span>
              <span style={{ color: '#D97706' }}>→</span>
              <span style={{ background: '#FFFFFF', border: '1px solid #F59E0B', borderRadius: 6, padding: '2px 10px', fontWeight: 600, color: '#D97706' }}>
                🔄 Admin review in progress
              </span>
              <span style={{ color: '#D97706' }}>→</span>
              <span style={{ background: '#FFFFFF', border: '1px solid #D1D5DB', borderRadius: 6, padding: '2px 10px', fontWeight: 600, color: '#9CA3AF' }}>
                ✅ Verified & Live
              </span>
            </div>
          </div>
        </div>
      )}

      {/* PAGE HEADER */}
      <div className="page-header">
        <div>
          <h1>{t('Tailor Studio')} {t('Dashboard')}</h1>
          <p>{user?.shopName || 'Lakshmi Stitches & Bridal Studio'} • {t('Production & Studio Workload Console') || 'Production Console'}</p>
        </div>
        <div className="page-actions">
          <Link to="/tailor/progress">
            <Button variant="primary">⚡ {t('Stitching Progress') || 'Production Pipeline'}</Button>
          </Link>
          <Link to="/tailor/quotations">
            <Button variant="outline">🏷️ {t('Quotations')} ({pendingRequestsCount})</Button>
          </Link>
          <Link to="/tailor/services">
            <Button variant="secondary">✂️ {t('My Services')}</Button>
          </Link>
        </div>
      </div>

      {/* 4 BUSINESS METRICS */}
      <div className="stat-grid">
        <div className="stat-card">
          <h3>{t('Customized Dress Orders') || t('Orders')}</h3>
          <div className="stat-value" style={{ color: 'var(--primary)' }}>
            {customizedDressOrders}
          </div>
          <span className="stat-subtitle">{t('Active bespoke garments in workflow') || 'Active bespoke garments'}</span>
        </div>

        <div className="stat-card">
          <h3>{t('Urgent Orders')}</h3>
          <div className="stat-value" style={{ color: 'var(--danger)' }}>
            {urgentOrdersCount}
          </div>
          <span className="stat-subtitle">{t('Expedited 48-72h turnaround priority') || 'Expedited priority'}</span>
        </div>

        <div className="stat-card">
          <h3>{t('Services Offered')}</h3>
          <div className="stat-value" style={{ color: 'var(--primary-dark)' }}>
            {servicesOfferedCount}
          </div>
          <span className="stat-subtitle">{t('Active boutique tailoring catalogs') || 'Active catalogs'}</span>
        </div>

        <div className="stat-card">
          <h3>{t('Courses Offered')}</h3>
          <div className="stat-value" style={{ color: 'var(--info)' }}>
            {coursesOfferedCount}
          </div>
          <span className="stat-subtitle">{t('Masterclasses published to academy') || 'Published masterclasses'}</span>
        </div>
      </div>

      {/* 4 OPERATIONAL HIGHLIGHTS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
        <div className="card" style={{ padding: '14px 18px', borderLeft: '4px solid var(--primary)', background: '#FFFFFF' }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block' }}>{t("Today's Orders")}</span>
          <strong style={{ fontSize: 17, color: 'var(--primary-dark)' }}>{todaysOrdersCount} {t('Active / WIP') || 'in Active Production'}</strong>
        </div>

        <div className="card" style={{ padding: '14px 18px', borderLeft: '4px solid var(--warning)', background: '#FFFFFF' }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block' }}>Pending Requests</span>
          <strong style={{ fontSize: 17, color: 'var(--warning)' }}>{pendingRequestsCount} Awaiting Quotation Bids</strong>
        </div>

        <div className="card" style={{ padding: '14px 18px', borderLeft: '4px solid var(--info)', background: '#FFFFFF' }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block' }}>Upcoming Deliveries</span>
          <strong style={{ fontSize: 17, color: 'var(--info)' }}>{upcomingDeliveriesCount} Due This Week</strong>
        </div>

        <div className="card" style={{ padding: '14px 18px', borderLeft: '4px solid var(--success)', background: '#FFFFFF' }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block' }}>Today's Appointments</span>
          <strong style={{ fontSize: 17, color: 'var(--success)' }}>{todaysAppointmentsCount} Studio Fittings</strong>
        </div>
      </div>

      {/* PRODUCTION QUEUE & CAPACITY SECTION */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 24, marginBottom: 30 }}>
        {/* PRODUCTION QUEUE (Measurement → Cutting → Stitching → Finishing → Ready) */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div>
              <h2 style={{ fontSize: 18, margin: 0, color: 'var(--text-main)' }}>PRODUCTION QUEUE</h2>
              <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
                Track real-time progress through 5 key stages: Measurement → Cutting → Stitching → Finishing → Ready
              </span>
            </div>
            <Link to="/tailor/progress" style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)' }}>
              Full Pipeline →
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {orders.slice(0, 4).map((order) => {
              const stageIdx = getStageIndex(order.status)

              return (
                <div key={order.id} className="card" style={{ padding: 18, borderLeft: order.urgent ? '4px solid var(--danger)' : '4px solid var(--primary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)', fontSize: 14 }}>
                          ORDER #{order.id}
                        </span>
                        {order.urgent && <span className="status-badge badge-urgent" style={{ fontSize: 10 }}>🔥 Urgent</span>}
                      </div>
                      <h3 style={{ fontSize: 16, margin: '0 0 2px 0', color: 'var(--text-main)' }}>
                        {order.item || order.designName || 'Bridal Blouse'}
                      </h3>
                      <div style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
                        Customer: <strong>{order.customer || 'Priya'}</strong> • Due: <strong>{order.deliveryDate || '12 Sep'}</strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleAdvanceStage(order.id, order.status)}
                      >
                        Advance Stage →
                      </Button>
                      <Link to={`/tailor/chat?orderId=${order.id}&recipient=${encodeURIComponent(order.customer || 'Customer')}`}>
                        <Button size="sm" variant="outline">
                          💬 Chat
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* 5-STAGE PROGRESS BAR WITH CURRENT STAGE HIGHLIGHTED */}
                  <div style={{ background: 'var(--bg-subtle)', padding: '12px 14px', borderRadius: 8, border: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6, position: 'relative' }}>
                      {QUEUE_STAGES.map((stg, idx) => {
                        const isCompleted = idx < stageIdx
                        const isCurrent = idx === stageIdx

                        return (
                          <div
                            key={stg}
                            style={{
                              textAlign: 'center',
                              padding: '8px 4px',
                              borderRadius: 6,
                              background: isCurrent ? 'var(--primary)' : isCompleted ? 'var(--primary-light)' : '#FFFFFF',
                              color: isCurrent ? '#FFFFFF' : isCompleted ? 'var(--primary-dark)' : 'var(--text-muted)',
                              border: isCurrent ? '1px solid var(--primary-dark)' : isCompleted ? '1px solid var(--primary-subtle)' : '1px solid var(--border)',
                              boxShadow: isCurrent ? '0 2px 6px rgba(233, 30, 99, 0.25)' : 'none',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <div style={{ fontSize: 11, fontWeight: isCurrent ? 700 : 600 }}>
                              {isCompleted ? '✓ ' : ''}{stg}
                            </div>
                            {isCurrent && (
                              <span style={{ fontSize: 9.5, opacity: 0.9, display: 'block', marginTop: 2 }}>
                                Active Stage
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* CAPACITY MANAGEMENT WIDGET */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">⚙️ Capacity Management</h3>
              {isLimitedCapacity ? (
                <span className="status-badge" style={{ background: 'var(--warning-bg)', color: 'var(--warning)', fontSize: 11 }}>
                  Limited Capacity
                </span>
              ) : (
                <span className="status-badge" style={{ background: 'var(--success-bg)', color: 'var(--success)', fontSize: 11 }}>
                  Accepting Orders
                </span>
              )}
            </div>

            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14 }}>
              Set daily maximum limits to protect turnaround times and prevent delivery delays.
            </div>

            <div style={{ background: 'var(--bg-subtle)', padding: 14, borderRadius: 6, border: '1px solid var(--border)', marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                <span>Daily Order Capacity:</span>
                <strong>{capacity.dailyMax} Max Orders</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                <span>Current Workload:</span>
                <strong style={{ color: 'var(--primary)' }}>{capacity.currentWorkload} Active</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span>Available Slots Today:</span>
                <strong style={{ color: availableSlots > 0 ? 'var(--success)' : 'var(--danger)' }}>
                  {availableSlots} Slot(s) Available
                </strong>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={capacity.urgentAvailable}
                  onChange={(e) => setCapacity({ ...capacity, urgentAvailable: e.target.checked })}
                />
                Accept Urgent 48h Expedited Orders
              </label>
              {!capacity.urgentAvailable && (
                <span style={{ fontSize: 11, color: 'var(--danger)', display: 'block', marginTop: 4 }}>
                  ⚠️ Urgent orders unavailable to customers
                </span>
              )}
            </div>

            <Link to="/tailor/services">
              <Button variant="outline" size="sm" block>
                Configure Service Capacity Limits →
              </Button>
            </Link>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">📚 Tailoring Course Studio</h3>
              <Link to="/tailor/courses" style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>
                Manage
              </Link>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 12px 0' }}>
              Publish pattern-making & Aari embroidery masterclasses for students and customers.
            </p>
            <Link to="/tailor/courses">
              <Button variant="secondary" size="sm" block>
                + Create / Publish New Masterclass
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
