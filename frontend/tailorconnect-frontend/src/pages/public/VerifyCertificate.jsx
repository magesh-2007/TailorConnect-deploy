import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import axios from 'axios'
import Logo from '../../components/Logo'
import { API_URL as API_BASE } from '../../services/api'

export default function VerifyCertificate() {
  const { certificateId } = useParams()
  const [searchParams] = useSearchParams()
  const queryCode = searchParams.get('code')

  const [inputCode, setInputCode] = useState(certificateId || queryCode || '')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const handleVerify = async (codeToVerify) => {
    const code = codeToVerify || inputCode
    if (!code.trim()) return

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await axios.get(`${API_BASE}/certificates/verify/${encodeURIComponent(code.trim())}`)
      if (res.data?.success) {
        setResult(res.data.data)
      } else {
        setError('Unable to verify certificate.')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Certificate verification failed. Code not found.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const code = certificateId || queryCode
    if (code) {
      setInputCode(code)
      handleVerify(code)
    }
  }, [certificateId, queryCode])

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FCFBF7', color: '#263238', fontFamily: 'var(--font-body)' }}>
      {/* Top Header */}
      <header style={{ borderBottom: '1px solid #E3E8E6', backgroundColor: '#FFFFFF', padding: '16px 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/home" style={{ textDecoration: 'none' }}>
            <Logo size="md" />
          </Link>
          <Link to="/login" style={{ fontSize: '14px', fontWeight: 600, color: '#0F5C5E', textDecoration: 'none' }}>
            Log In →
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '800px', margin: '48px auto', padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', padding: '8px 16px', borderRadius: '20px', backgroundColor: '#DDEBE7', color: '#0F5C5E', fontWeight: 600, fontSize: '13px', marginBottom: '12px' }}>
            Official Verification Portal
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '32px', fontWeight: 800, color: '#0F5C5E', marginBottom: '8px' }}>
            Verify Certificate Authenticity
          </h1>
          <p style={{ color: '#667085', fontSize: '15px' }}>
            Enter a certificate ID or verification code to validate credentials issued by TailorConnect Academy.
          </p>
        </div>

        {/* Input Form Card */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E3E8E6', padding: '28px', boxShadow: '0 4px 16px rgba(15,92,94,0.06)', marginBottom: '32px' }}>
          <form onSubmit={(e) => { e.preventDefault(); handleVerify(); }} style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              placeholder="e.g. TC-CERT-2026-881"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              style={{
                flex: 1,
                padding: '14px 18px',
                borderRadius: '10px',
                border: '1px solid #C8D5D2',
                fontSize: '15px',
                outline: 'none',
                fontFamily: 'monospace'
              }}
            />
            <button
              type="submit"
              disabled={loading || !inputCode.trim()}
              style={{
                backgroundColor: '#0F5C5E',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                padding: '0 28px',
                fontWeight: 700,
                fontSize: '15px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Verifying...' : 'Verify Now'}
            </button>
          </form>
        </div>

        {/* Error State */}
        {error && (
          <div style={{ backgroundColor: '#FEF3F3', border: '1px solid #F5C0C0', borderRadius: '12px', padding: '16px 20px', color: '#8B2020', fontWeight: 600, textAlign: 'center', marginBottom: '24px' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Result Certificate Card */}
        {result && result.verified && result.certificate && (
          <div style={{
            position: 'relative',
            backgroundColor: '#FAF7F2',
            borderRadius: '16px',
            border: '2px solid #C5A059',
            padding: '12px',
            boxShadow: '0 12px 36px rgba(15,23,42,0.12)',
            overflow: 'hidden'
          }}>
            <div style={{ border: '1px solid #D4AF37', borderRadius: '10px', padding: '30px', position: 'relative', background: 'radial-gradient(circle at center, #FFFFFF 0%, #FAF7F2 100%)' }}>
              
              {/* Corner Geometric Accents */}
              <div style={{ position: 'absolute', top: 0, left: 0, width: 0, height: 0, borderTop: '90px solid #C5A059', borderRight: '90px solid transparent', zIndex: 1 }} />
              <div style={{ position: 'absolute', top: 0, left: 0, width: 0, height: 0, borderTop: '80px solid #0F172A', borderRight: '80px solid transparent', zIndex: 2 }} />
              <div style={{ position: 'absolute', bottom: 0, right: 0, width: 0, height: 0, borderBottom: '90px solid #C5A059', borderLeft: '90px solid transparent', zIndex: 1 }} />
              <div style={{ position: 'absolute', bottom: 0, right: 0, width: 0, height: 0, borderBottom: '80px solid #0F172A', borderLeft: '80px solid transparent', zIndex: 2 }} />

              {/* Verified Badge Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', position: 'relative', zIndex: 5 }}>
                <div>
                  <span style={{ backgroundColor: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    ✓ OFFICIAL & ACCREDITED CERTIFICATE
                  </span>
                </div>
                <div style={{ border: '1px solid #CBD5E1', borderRadius: '8px', padding: '8px 12px', background: 'rgba(255,255,255,0.9)', fontSize: '11px', width: '200px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}><span style={{ color: '#64748B' }}>Cert ID</span><span style={{ fontWeight: 700, fontFamily: 'monospace', color: '#0F172A' }}>: {result.certificate.certificateId || result.certificate.id}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}><span style={{ color: '#64748B' }}>Verification</span><span style={{ fontWeight: 700, color: '#059669' }}>: VALID ✔</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748B' }}>Issued</span><span style={{ fontWeight: 700 }}>: {result.certificate.completionDate || result.certificate.issuedOn || '15 Apr 2025'}</span></div>
                </div>
              </div>

              {/* Certificate Title */}
              <div style={{ textAlign: 'center', margin: '20px 0 10px 0', position: 'relative', zIndex: 5 }}>
                <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '30px', fontWeight: 800, color: '#0F172A', letterSpacing: '2px', margin: 0 }}>CERTIFICATE</h1>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '4px' }}>
                  <div style={{ height: '1.5px', width: '70px', background: 'linear-gradient(90deg, transparent, #C5A059, transparent)' }} />
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: '13px', fontWeight: 700, color: '#C5A059', letterSpacing: '4px', textTransform: 'uppercase' }}>OF COMPLETION</div>
                  <div style={{ height: '1.5px', width: '70px', background: 'linear-gradient(90deg, transparent, #C5A059, transparent)' }} />
                </div>
              </div>

              {/* Body */}
              <div style={{ textAlign: 'center', position: 'relative', zIndex: 5 }}>
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2px', color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>THIS IS TO CERTIFY THAT</div>
                <div style={{ fontFamily: 'cursive', fontSize: '42px', color: '#0F172A', margin: '4px 0 10px 0', borderBottom: '1px solid rgba(197, 160, 89, 0.4)', display: 'inline-block', paddingBottom: '2px', minWidth: '260px' }}>
                  {result.certificate.studentName}
                </div>
                <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '4px' }}>has successfully completed the course</div>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: '4px 0 8px 0' }}>{result.certificate.courseName}</div>
                <div style={{ fontSize: '11px', color: '#475569', maxWidth: '500px', margin: '0 auto 18px auto', lineHeight: '1.4' }}>
                  offered by TailorConnect and has demonstrated the required skills and knowledge in the field of fashion and tailoring.
                </div>
              </div>

              {/* 4 Skill Badges */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', margin: '14px 0 20px 0' }}>
                <div style={{ textAlign: 'center', flex: 1, maxWidth: '85px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #C5A059', background: '#FFFDF9', margin: '0 auto 4px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: '#C5A059' }}>🪡</div>
                  <div style={{ fontSize: '8.5px', fontWeight: 700, color: '#334155', lineHeight: '1.2' }}>Aari<br/>Embroidery</div>
                </div>
                <div style={{ width: '1px', height: '24px', background: '#E2E8F0' }} />
                <div style={{ textAlign: 'center', flex: 1, maxWidth: '85px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #C5A059', background: '#FFFDF9', margin: '0 auto 4px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: '#C5A059' }}>✂️</div>
                  <div style={{ fontSize: '8.5px', fontWeight: 700, color: '#334155', lineHeight: '1.2' }}>Advanced<br/>Techniques</div>
                </div>
                <div style={{ width: '1px', height: '24px', background: '#E2E8F0' }} />
                <div style={{ textAlign: 'center', flex: 1, maxWidth: '85px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #C5A059', background: '#FFFDF9', margin: '0 auto 4px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: '#C5A059' }}>🏅</div>
                  <div style={{ fontSize: '8.5px', fontWeight: 700, color: '#334155', lineHeight: '1.2' }}>Fashion<br/>Design Skills</div>
                </div>
                <div style={{ width: '1px', height: '24px', background: '#E2E8F0' }} />
                <div style={{ textAlign: 'center', flex: 1, maxWidth: '85px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #C5A059', background: '#FFFDF9', margin: '0 auto 4px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: '#C5A059' }}>🎓</div>
                  <div style={{ fontSize: '8.5px', fontWeight: 700, color: '#334155', lineHeight: '1.2' }}>Lifelong<br/>Learning</div>
                </div>
              </div>

              {/* Footer Signatures */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '16px', position: 'relative', zIndex: 5 }}>
                <div style={{ textAlign: 'center', width: '150px' }}>
                  <div style={{ fontFamily: 'cursive', fontSize: '20px', color: '#0F172A', marginBottom: '2px' }}>Anitha R</div>
                  <div style={{ height: '1px', background: '#CBD5E1', marginBottom: '4px' }} />
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#0F172A' }}>{result.certificate.tailorName || 'Anitha R'}</div>
                  <div style={{ fontSize: '9px', color: '#64748B' }}>Master Instructor</div>
                  <div style={{ fontSize: '8px', color: '#94A3B8' }}>{result.certificate.shopName || 'TailorConnect'}</div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'cursive', fontSize: '18px', color: '#C5A059', marginBottom: '2px' }}>Learn • Create • Grow</div>
                  <div style={{ fontSize: '9px', color: '#C5A059', letterSpacing: '3px' }}>꧁ ༺ 𑁍 ༻ ꧂</div>
                </div>

                <div style={{ textAlign: 'center', width: '150px' }}>
                  <div style={{ fontFamily: 'cursive', fontSize: '20px', color: '#0F172A', marginBottom: '2px' }}>Ragul K</div>
                  <div style={{ height: '1px', background: '#CBD5E1', marginBottom: '4px' }} />
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#0F172A' }}>Ragul K</div>
                  <div style={{ fontSize: '9px', color: '#64748B' }}>CEO & Founder</div>
                  <div style={{ fontSize: '8px', color: '#94A3B8' }}>TailorConnect</div>
                </div>
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  )
}
