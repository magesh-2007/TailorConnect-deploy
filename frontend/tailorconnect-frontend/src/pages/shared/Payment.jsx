import React, { useState } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout'
import { useAuth } from '../../context/AuthContext'
import * as storage from '../../services/storageService'
import Button from '../../components/Button'
import StatusBadge from '../../components/StatusBadge'

export default function Payment() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // ── Params ────────────────────────────────────────────────────────────────
  const paymentType = searchParams.get('type') || 'order'      // 'order' | 'course'
  const isCourse    = paymentType === 'course'

  // Order fields
  const orderId   = searchParams.get('orderId') || 'ORD-101'
  const tailor    = searchParams.get('tailor')  || 'Lakshmi Devi (Lakshmi Stitches)'
  const item      = searchParams.get('item')    || 'Silk Bridal Blouse with Aari Work'
  const rawAmount = Number(searchParams.get('amount')) || (isCourse ? 500 : 1800)

  // Course fields
  const courseId   = searchParams.get('courseId')   || ''
  const courseName = searchParams.get('courseName') || item
  const returnTo   = searchParams.get('returnTo')   || (isCourse ? '/student/dashboard' : `/tracking/${orderId}`)

  // Derived fees
  const platformFee  = isCourse ? 0 : 50
  const gst          = Math.round(rawAmount * 0.05)
  const totalPayable = rawAmount + platformFee + gst

  const [paymentMethod, setPaymentMethod] = useState('upi')
  const [upiApp, setUpiApp]               = useState('gpay')
  const [upiId, setUpiId]                 = useState('student@okaxis')
  const [cardNumber, setCardNumber]       = useState('4532 •••• •••• 8921')
  const [cardExpiry, setCardExpiry]       = useState('08/29')
  const [cardCvv, setCardCvv]             = useState('•••')
  const [bank, setBank]                   = useState('HDFC Bank')
  const [processing, setProcessing]       = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [generatedPaymentId, setPaymentId]  = useState('')

  const handlePayNow = (e) => {
    e.preventDefault()
    setProcessing(true)

    setTimeout(() => {
      const pId = `PAY-${Date.now().toString().slice(-6)}`
      setPaymentId(pId)

      // ── Record payment ──────────────────────────────────────────────────
      if (storage.createPayment) {
        storage.createPayment({
          paymentId:   pId,
          orderId:     isCourse ? `COURSE-${courseId}` : orderId,
          customer:    user?.name || 'Student User',
          tailor,
          item:        isCourse ? courseName : item,
          amount:      totalPayable,
          platformFee,
          type:        paymentType,
          status:      'Paid',
          date:        new Date().toISOString().split('T')[0],
        })
      }

      if (isCourse) {
        // ── Course: register student into the course ────────────────────
        if (courseId && user) {
          storage.registerForCourse?.(courseId, user)
        }
      } else {
        // ── Order: move order to Fabric / Cutting stage ─────────────────
        storage.updateOrderStatus(orderId, 'Fabric')
      }

      setProcessing(false)
      setPaymentSuccess(true)
    }, 1400)
  }

  return (
    <DashboardLayout role={user?.role || 'student'}>
      <div className="page-header">
        <div>
          <h1>{isCourse ? '🎓 Course Enrollment Payment' : 'Secure Escrow Payment Gateway'}</h1>
          <p>
            {isCourse
              ? 'Complete your payment to unlock all course lessons and receive a verified certificate.'
              : 'Your funds are held securely in platform escrow and released to the tailor upon verified delivery.'}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 880, margin: '0 auto' }}>
        {!paymentSuccess ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: 24 }}>

            {/* ── Payment Method Form ─────────────────────────────────── */}
            <div className="card" style={{ padding: 24 }}>
              <h2 style={{ fontSize: 17, marginBottom: 16 }}>Select Payment Method</h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
                {[
                  { key: 'upi',        label: '📱 UPI' },
                  { key: 'card',       label: '💳 Card' },
                  { key: 'netbanking', label: '🏦 Net Banking' },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    className={`btn btn-sm ${paymentMethod === key ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setPaymentMethod(key)}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <form onSubmit={handlePayNow}>
                {/* UPI */}
                {paymentMethod === 'upi' && (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
                      {['gpay', 'phonepe', 'paytm'].map(app => (
                        <div
                          key={app}
                          onClick={() => setUpiApp(app)}
                          style={{
                            padding: 10, borderRadius: 6, textAlign: 'center',
                            border: upiApp === app ? '2px solid var(--primary)' : '1px solid var(--border)',
                            background: upiApp === app ? 'var(--bg-hover)' : 'var(--bg-card)',
                            cursor: 'pointer', fontSize: 12, fontWeight: 600, textTransform: 'uppercase',
                          }}
                        >
                          {app === 'gpay' ? 'Google Pay' : app === 'phonepe' ? 'PhonePe' : 'Paytm UPI'}
                        </div>
                      ))}
                    </div>
                    <div className="form-group">
                      <label className="form-label">UPI ID / VPA <span className="required">*</span></label>
                      <input type="text" className="form-control" placeholder="yourname@okhdfcbank" value={upiId} onChange={e => setUpiId(e.target.value)} required />
                    </div>
                  </div>
                )}

                {/* Card */}
                {paymentMethod === 'card' && (
                  <div>
                    <div className="form-group">
                      <label className="form-label">Card Number <span className="required">*</span></label>
                      <input type="text" className="form-control" value={cardNumber} onChange={e => setCardNumber(e.target.value)} required />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Expiry (MM/YY) <span className="required">*</span></label>
                        <input type="text" className="form-control" value={cardExpiry} onChange={e => setCardExpiry(e.target.value)} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">CVV <span className="required">*</span></label>
                        <input type="password" maxLength="4" className="form-control" value={cardCvv} onChange={e => setCardCvv(e.target.value)} required />
                      </div>
                    </div>
                  </div>
                )}

                {/* Net Banking */}
                {paymentMethod === 'netbanking' && (
                  <div className="form-group">
                    <label className="form-label">Select Bank <span className="required">*</span></label>
                    <select className="form-control" value={bank} onChange={e => setBank(e.target.value)}>
                      {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank'].map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div style={{ background: 'var(--bg-subtle)', padding: 12, borderRadius: 6, border: '1px solid var(--border-light)', marginBottom: 20, fontSize: 12, color: 'var(--text-secondary)' }}>
                  🔒 256-Bit SSL Encrypted • {isCourse ? 'Instant course access upon payment' : '100% money back guarantee if stitching fails fitting criteria'}
                </div>

                <Button type="submit" variant="primary" block size="lg" disabled={processing}>
                  {processing
                    ? 'Processing Payment...'
                    : `${isCourse ? '🎓 Enroll &' : ''} Pay ₹${totalPayable.toLocaleString()} →`}
                </Button>
              </form>
            </div>

            {/* ── Order / Course Summary ──────────────────────────────── */}
            <div className="card" style={{ padding: 22, height: 'fit-content' }}>
              <h3 style={{ fontSize: 16, marginBottom: 14 }}>
                {isCourse ? 'Enrollment Summary' : 'Order Summary'}
              </h3>

              {isCourse ? (
                /* Course Summary */
                <div style={{ marginBottom: 16, fontSize: 13 }}>
                  <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, padding: '10px 14px', marginBottom: 12 }}>
                    <div style={{ fontWeight: 700, color: '#166534', marginBottom: 4 }}>🎓 {courseName}</div>
                    <div style={{ color: '#15803D', fontSize: 12 }}>Trainer: {tailor}</div>
                  </div>
                  <div style={{ color: '#6B7280', lineHeight: 1.6, fontSize: 12.5 }}>
                    ✅ Lifetime access to all lessons<br />
                    ✅ Verified certificate upon completion<br />
                    ✅ Downloadable PDF certificate<br />
                    ✅ Course materials & stencil patterns
                  </div>
                </div>
              ) : (
                /* Order Summary */
                <div style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>
                  <div><strong>Order Ref:</strong> #{orderId}</div>
                  <div><strong>Garment:</strong> {item}</div>
                  <div><strong>Master Tailor:</strong> {tailor}</div>
                </div>
              )}

              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 12, fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {isCourse ? 'Course Fee:' : 'Stitching & Material:'}
                  </span>
                  <strong>₹{rawAmount}</strong>
                </div>
                {!isCourse && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Platform Escrow Fee:</span>
                    <strong>₹{platformFee}</strong>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>GST (5%):</span>
                  <strong>₹{gst}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 700, color: 'var(--primary)', paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                  <span>Total Payable:</span>
                  <span>₹{totalPayable.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

        ) : (
          /* ── Payment Success Screen ────────────────────────────────────── */
          <div className="card" style={{ padding: 36, textAlign: 'center' }}>
            {/* Success animation ring */}
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'linear-gradient(135deg, #D1FAE5, #A7F3D0)',
              border: '3px solid #34D399',
              color: '#065F46', fontSize: 36,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 0 0 8px rgba(52,211,153,0.12)',
              animation: 'pulse 1.5s ease infinite',
            }}>
              ✓
            </div>

            <h2 style={{ fontSize: 26, color: '#111827', marginBottom: 6 }}>
              {isCourse ? '🎉 Enrollment Successful!' : 'Payment Successful & Escrow Secured!'}
            </h2>

            <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 28, maxWidth: 480, margin: '0 auto 28px' }}>
              {isCourse
                ? <>Payment <strong>#{generatedPaymentId}</strong> of <strong>₹{totalPayable}</strong> confirmed. You are now enrolled in <strong>"{courseName}"</strong>. Start learning right away!</>
                : <>Payment <strong>#{generatedPaymentId}</strong> of <strong>₹{totalPayable}</strong> secured in escrow. Tailor studio has received confirmation to begin fabric cutting.</>
              }
            </p>

            {/* Receipt */}
            <div style={{
              background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 10,
              padding: 20, maxWidth: 480, margin: '0 auto 28px', textAlign: 'left', fontSize: 13,
            }}>
              {[
                ['Payment ID', generatedPaymentId],
                isCourse ? ['Course', courseName] : ['Order ID', `#${orderId}`],
                ['Student / Customer', user?.name || 'User'],
                isCourse ? ['Trainer', tailor] : ['Tailor Studio', tailor],
                ['Amount Paid', `₹${totalPayable}`],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: '#6B7280' }}>{label}:</span>
                  <strong>{value}</strong>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6B7280' }}>Status:</span>
                <StatusBadge status="Paid" />
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              {isCourse ? (
                <>
                  <Button variant="primary" size="lg" onClick={() => navigate(returnTo)}>
                    🎓 Start Learning Now →
                  </Button>
                  <Link to="/student/dashboard">
                    <Button variant="outline" size="lg">Go to Dashboard</Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to={`/tracking/${orderId}`}>
                    <Button variant="primary" size="lg">Track 10-Stage Production Live →</Button>
                  </Link>
                  <Link to="/customer/dashboard">
                    <Button variant="outline" size="lg">Return to Dashboard</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
