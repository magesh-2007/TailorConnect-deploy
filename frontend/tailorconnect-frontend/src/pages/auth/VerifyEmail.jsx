import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

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
  success:    '#166534',
  successBg:  '#F0FDF4',
  successBdr: '#BBF7D0',
  radiusSm:   '8px',
  radius:     '12px',
  font:       "'Outfit', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
}

const ROLE_DASHBOARD = {
  customer: '/customer/dashboard',
  tailor:   '/tailor/dashboard',
  student:  '/student/dashboard',
  admin:    '/admin/dashboard',
  employee: '/employee/dashboard',
}

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const initialEmail = searchParams.get('email') || ''

  const { verifyEmailOtp, resendEmailOtp } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState(initialEmail)
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [cooldown, setCooldown] = useState(60)
  const [canResend, setCanResend] = useState(false)

  const inputRefs = useRef([])

  // Resend cooldown countdown timer
  useEffect(() => {
    let timer
    if (cooldown > 0) {
      setCanResend(false)
      timer = setInterval(() => {
        setCooldown(prev => {
          if (prev <= 1) {
            setCanResend(true)
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      setCanResend(true)
    }
    return () => clearInterval(timer)
  }, [cooldown])

  // Handle single-digit input change with automatic advance
  const handleDigitChange = (index, value) => {
    // Only accept numeric digits
    const cleaned = value.replace(/\D/g, '')

    // Handle full paste of 6 digits
    if (cleaned.length >= 6) {
      const nextDigits = cleaned.slice(0, 6).split('')
      setOtpDigits(nextDigits)
      inputRefs.current[5]?.focus()
      return
    }

    const nextDigits = [...otpDigits]
    nextDigits[index] = cleaned.slice(-1) // Take the last entered character
    setOtpDigits(nextDigits)
    setError('')

    // Auto-advance focus to next digit box
    if (cleaned && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  // Handle backspace navigation between boxes
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'Enter') {
      handleVerify()
    }
  }

  const maskEmail = (str) => {
    if (!str || !str.includes('@')) return str
    const [namePart, domain] = str.split('@')
    if (namePart.length <= 2) return `${namePart}***@${domain}`
    return `${namePart.slice(0, 2)}****${namePart.slice(-1)}@${domain}`
  }

  const handleVerify = async (e) => {
    if (e) e.preventDefault()
    if (!email.trim()) {
      setError('Please provide your registered email address.')
      return
    }

    const code = otpDigits.join('').trim()
    if (code.length !== 6) {
      setError('Please enter the complete 6-digit verification code.')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    const res = await verifyEmailOtp(email.trim(), code)
    setLoading(false)

    if (res.success) {
      setSuccess('Email verified successfully! Logging you in...')
      setTimeout(() => {
        const path =
          ROLE_DASHBOARD[res.user?.role?.toLowerCase()] ||
          '/customer/dashboard'
        navigate(path, { replace: true })
      }, 1200)
    } else {
      setError(res.error || 'Verification failed. Please check your code.')
    }
  }

  const handleResend = async () => {
    if (!canResend || loading) return
    if (!email.trim()) {
      setError('Please enter your email address to resend OTP.')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    const res = await resendEmailOtp(email.trim())
    setLoading(false)

    if (res.success) {
      setCooldown(res.cooldown || 60)
      setCanResend(false)
      setOtpDigits(['', '', '', '', '', ''])
      setSuccess('A new verification code has been sent to your email!')
      inputRefs.current[0]?.focus()
      setTimeout(() => setSuccess(''), 5000)
    } else {
      if (res.cooldownRemaining) {
        setCooldown(res.cooldownRemaining)
        setCanResend(false)
      }
      setError(res.error || 'Failed to resend code. Please try again.')
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: T.cream,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px 20px',
        fontFamily: T.font,
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          background: T.white,
          border: `1px solid ${T.border}`,
          borderRadius: 16,
          boxShadow: '0 8px 30px rgba(31,41,55,0.08)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ background: T.navy, padding: '28px 32px 24px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <img
              src="/logo.jpg"
              alt="TailorConnect"
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                objectFit: 'cover',
                border: `2px solid ${T.gold}`,
              }}
            />
            <span style={{ fontWeight: 800, fontSize: 19, color: T.white }}>
              Tailor<span style={{ color: T.gold }}>Connect</span>
            </span>
          </div>
          <h1 style={{ fontSize: 21, fontWeight: 700, color: T.white, margin: '0 0 6px' }}>
            Verify Your Email
          </h1>
          <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.7)', margin: 0 }}>
            Enter the 6-digit code sent to your email
          </p>
        </div>

        {/* Content */}
        <div style={{ padding: '28px 32px 32px' }}>
          {/* Target Email Notice */}
          <div
            style={{
              background: '#F0FDF4',
              border: `1px solid ${T.successBdr}`,
              borderRadius: T.radiusSm,
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 22,
            }}
          >
            <span style={{ fontSize: 24 }}>✉️</span>
            <div>
              <div style={{ fontSize: 12, color: '#166534', fontWeight: 600 }}>Code sent to:</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.textMain }}>
                {maskEmail(email) || 'Your email address'}
              </div>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div
              style={{
                background: T.dangerBg,
                border: `1px solid ${T.dangerBdr}`,
                borderRadius: T.radiusSm,
                padding: '11px 14px',
                fontSize: 13,
                color: T.danger,
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Success Banner */}
          {success && (
            <div
              style={{
                background: T.successBg,
                border: `1px solid ${T.successBdr}`,
                borderRadius: T.radiusSm,
                padding: '11px 14px',
                fontSize: 13,
                color: T.success,
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span>✅</span>
              <span>{success}</span>
            </div>
          )}

          {/* Email Input (If not set from URL) */}
          {!initialEmail && (
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: T.textMain, marginBottom: 6 }}>
                Registered Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                style={{
                  width: '100%',
                  height: 42,
                  padding: '0 12px',
                  borderRadius: T.radiusSm,
                  border: `1.5px solid ${T.border}`,
                  fontSize: 13.5,
                  boxSizing: 'border-box',
                }}
              />
            </div>
          )}

          {/* 6-Digit Code Inputs */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: T.textMain, marginBottom: 10, textAlign: 'center' }}>
              Enter 6-Digit OTP Code
            </label>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              {otpDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={el => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleDigitChange(index, e.target.value)}
                  onKeyDown={e => handleKeyDown(index, e)}
                  style={{
                    width: 48,
                    height: 54,
                    textAlign: 'center',
                    fontSize: 22,
                    fontWeight: 700,
                    fontFamily: "'Courier New', Courier, monospace",
                    color: T.navy,
                    background: digit ? '#F0FDF4' : T.white,
                    border: `2px solid ${digit ? T.gold : T.border}`,
                    borderRadius: 10,
                    outline: 'none',
                    boxShadow: digit ? `0 0 0 3px ${T.goldLight}` : 'none',
                    transition: 'all 0.16s',
                  }}
                />
              ))}
            </div>
            <p style={{ textAlign: 'center', fontSize: 12, color: T.textMuted, marginTop: 8 }}>
              Code expires in 5 minutes
            </p>
          </div>

          {/* Verify Button */}
          <button
            type="button"
            onClick={handleVerify}
            disabled={loading || otpDigits.join('').length !== 6}
            style={{
              width: '100%',
              height: 46,
              border: 'none',
              borderRadius: T.radiusSm,
              background: otpDigits.join('').length === 6 ? T.navy : '#9CA3AF',
              color: T.white,
              fontSize: 14,
              fontWeight: 700,
              cursor: otpDigits.join('').length === 6 && !loading ? 'pointer' : 'default',
              transition: 'all 0.18s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              marginBottom: 16,
            }}
          >
            {loading ? 'Verifying Code...' : 'Verify Email Address →'}
          </button>

          {/* Resend OTP Section */}
          <div style={{ textAlign: 'center', borderTop: `1px solid ${T.border}`, paddingTop: 16 }}>
            <span style={{ fontSize: 13, color: T.textSub }}>Didn't receive the email? </span>
            {canResend ? (
              <button
                type="button"
                onClick={handleResend}
                disabled={loading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: T.navy,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 0,
                }}
              >
                Resend Code
              </button>
            ) : (
              <span style={{ fontSize: 13, fontWeight: 600, color: T.textMuted }}>
                Resend in {cooldown}s
              </span>
            )}
          </div>

          {/* Back to Login / Register */}
          <div style={{ textAlign: 'center', marginTop: 14 }}>
            <Link
              to="/login"
              style={{ fontSize: 12.5, color: T.textSub, textDecoration: 'none' }}
            >
              ← Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
