import React, { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/Button'

export default function StudentCertificates() {
  const { user } = useAuth()
  const [selectedCert, setSelectedCert] = useState(null)
  const [shareMsg, setShareMsg] = useState('')
  const [linkCopied, setLinkCopied] = useState(false)
  const certRef = useRef(null)

  const certificates = [
    {
      id: 'TC-CERT-2026-881',
      courseName: 'Aari Embroidery & Maggam Work Masterclass',
      studentName: user?.name || 'Meena Sundaram',
      instructorName: 'Lakshmi Devi',
      shopName: 'Lakshmi Stitches & Bridal Studio',
      issuedOn: '2026-08-28',
      duration: '20 Days (45 Practical Hours)',
      grade: 'Grade A+ (96% Assessment Score)',
      verificationUrl: 'https://tailorconnect.com/verify/TC-CERT-2026-881'
    },
    {
      id: 'TC-CERT-2026-412',
      courseName: 'Fabric Drafting & Precision Pattern Cutting',
      studentName: user?.name || 'Meena Sundaram',
      instructorName: 'Mrs. Radha Raman',
      shopName: 'Vintage Needle Heritage Tailors',
      issuedOn: '2026-07-15',
      duration: '15 Days (30 Practical Hours)',
      grade: 'Grade A (92% Assessment Score)',
      verificationUrl: 'https://tailorconnect.com/verify/TC-CERT-2026-412'
    }
  ]

  // ── PDF Download using browser print ─────────────────────────────────────
  const handleDownloadPDF = (cert) => {
    const printWindow = window.open('', '_blank', 'width=1100,height=800')
    const certId = cert.id || 'TC-2025-0458'
    const vCode = cert.verificationCode || '7F3K9D2A'
    const compDate = cert.issuedOn || '15 Apr 2025'
    const duration = cert.duration || '4 Weeks'
    const grade = cert.grade || 'A+ (92%)'

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Certificate - ${certId}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,400&family=Great+Vibes&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
          
          @page {
            size: A4 landscape;
            margin: 0;
          }
          * { box-sizing: border-box; }
          body { 
            font-family: 'Plus Jakarta Sans', sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: #FAF7F2; 
            color: #0F172A;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .cert-wrapper {
            position: relative;
            background: #FAF7F2;
            width: 100%;
            max-width: 1000px;
            margin: 0 auto;
            border: 2px solid #C5A059;
            padding: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.08);
            overflow: hidden;
          }
          .cert-inner-frame {
            border: 1px solid #D4AF37;
            padding: 30px 40px;
            position: relative;
            background: radial-gradient(circle at center, #FFFFFF 0%, #FAF7F2 100%);
          }
          /* Corner geometric accents */
          .corner-tl {
            position: absolute; top: 0; left: 0; width: 0; height: 0;
            border-top: 110px solid #0F172A; border-right: 110px solid transparent;
            z-index: 2;
          }
          .corner-tl-gold {
            position: absolute; top: 0; left: 0; width: 0; height: 0;
            border-top: 120px solid #C5A059; border-right: 120px solid transparent;
            z-index: 1;
          }
          .corner-br {
            position: absolute; bottom: 0; right: 0; width: 0; height: 0;
            border-bottom: 110px solid #0F172A; border-left: 110px solid transparent;
            z-index: 2;
          }
          .corner-br-gold {
            position: absolute; bottom: 0; right: 0; width: 0; height: 0;
            border-bottom: 120px solid #C5A059; border-left: 120px solid transparent;
            z-index: 1;
          }

          /* Header */
          .header-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 10px;
            position: relative;
            z-index: 5;
          }
          .brand-logo {
            text-align: center;
            flex: 1;
            margin-left: 100px;
          }
          .brand-title {
            font-family: 'Playfair Display', serif;
            font-size: 28px;
            font-weight: 800;
            color: #0F172A;
            letter-spacing: -0.5px;
          }
          .brand-title span { color: #C5A059; }
          .brand-tagline {
            font-size: 10px;
            font-weight: 600;
            letter-spacing: 1.5px;
            color: #64748B;
            text-transform: uppercase;
            margin-top: 2px;
          }
          .top-cursive-quote {
            font-family: 'Great Vibes', cursive;
            font-size: 22px;
            color: #475569;
            transform: rotate(-3deg);
            text-align: right;
            line-height: 1.2;
          }

          /* Verification Card */
          .verif-card {
            border: 1px solid #CBD5E1;
            border-radius: 8px;
            padding: 10px 14px;
            background: rgba(255,255,255,0.85);
            font-size: 11px;
            width: 220px;
            margin-left: auto;
          }
          .verif-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 3px;
            color: #334155;
          }
          .verif-label { font-weight: 500; color: #64748B; }
          .verif-val { font-weight: 700; color: #0F172A; font-family: monospace; }
          
          .qr-section {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-top: 8px;
            padding-top: 6px;
            border-top: 1px dashed #E2E8F0;
          }
          .qr-code-img {
            width: 48px;
            height: 48px;
            border: 1px solid #CBD5E1;
            padding: 2px;
            background: #fff;
          }
          .qr-text {
            font-size: 9px;
            color: #64748B;
            line-height: 1.3;
          }
          .qr-text strong { color: #0F172A; display: block; }
          .qr-link { color: #C5A059; font-weight: 600; font-size: 8.5px; text-decoration: none; }

          /* Certificate Main Title */
          .cert-title-container {
            text-align: center;
            margin: 15px 0 10px 0;
            position: relative;
            z-index: 5;
          }
          .main-title {
            font-family: 'Playfair Display', serif;
            font-size: 38px;
            font-weight: 800;
            color: #0F172A;
            letter-spacing: 2px;
            margin: 0;
          }
          .sub-title-wrap {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 16px;
            margin-top: 4px;
          }
          .gold-line {
            height: 1.5px;
            width: 100px;
            background: linear-gradient(90deg, transparent, #C5A059, transparent);
          }
          .sub-title {
            font-family: 'Playfair Display', serif;
            font-size: 16px;
            font-weight: 700;
            color: #C5A059;
            letter-spacing: 6px;
            text-transform: uppercase;
          }

          /* Certification Statement */
          .cert-body {
            text-align: center;
            position: relative;
            z-index: 5;
            margin-top: 15px;
          }
          .certify-lead {
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 3px;
            color: #475569;
            text-transform: uppercase;
            margin-bottom: 8px;
          }
          .recipient-name {
            font-family: 'Great Vibes', cursive;
            font-size: 52px;
            color: #0F172A;
            margin: 4px 0 10px 0;
            line-height: 1;
            padding-bottom: 4px;
            border-bottom: 1px solid rgba(197, 160, 89, 0.4);
            display: inline-block;
            min-width: 320px;
          }
          .completion-lead {
            font-size: 12px;
            color: #64748B;
            margin-bottom: 6px;
          }
          .course-title {
            font-family: 'Playfair Display', serif;
            font-size: 24px;
            font-weight: 800;
            color: #0F172A;
            margin: 4px 0 8px 0;
          }
          .course-desc {
            font-size: 11.5px;
            color: #475569;
            max-width: 580px;
            margin: 0 auto 20px auto;
            line-height: 1.5;
          }

          /* 4 Feature Badges */
          .feature-grid {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 24px;
            margin: 20px 0 25px 0;
          }
          .feature-item {
            text-align: center;
            flex: 1;
            max-width: 110px;
          }
          .feature-icon-circle {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: 1px solid #C5A059;
            background: #FFFDF9;
            margin: 0 auto 6px auto;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            color: #C5A059;
            box-shadow: 0 2px 6px rgba(197,160,89,0.15);
          }
          .feature-label {
            font-size: 10px;
            font-weight: 700;
            color: #334155;
            line-height: 1.2;
          }
          .feature-divider {
            width: 1px;
            height: 30px;
            background: #E2E8F0;
          }

          /* Left Gold Ribbon Ribbon Seal */
          .seal-container {
            position: absolute;
            top: 140px;
            left: 35px;
            z-index: 6;
            text-align: center;
          }
          .seal-badge {
            width: 115px;
            height: 115px;
            background: radial-gradient(circle, #DFB96C 0%, #C5A059 70%, #9A7B38 100%);
            border-radius: 50%;
            padding: 6px;
            box-shadow: 0 6px 16px rgba(0,0,0,0.25);
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .seal-inner-circle {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: #0F172A;
            border: 2px dashed #DFB96C;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #DFB96C;
            padding: 6px;
            text-align: center;
          }
          .seal-crown { font-size: 14px; margin-bottom: 2px; }
          .seal-text {
            font-size: 7.5px;
            font-weight: 800;
            letter-spacing: 0.8px;
            text-transform: uppercase;
            line-height: 1.1;
            color: #FFFDF9;
          }
          .seal-stars { font-size: 8px; color: #DFB96C; margin-top: 3px; letter-spacing: 1px; }

          .seal-ribbon-wrap {
            display: flex;
            justify-content: center;
            gap: 6px;
            margin-top: -12px;
          }
          .seal-ribbon {
            width: 22px;
            height: 45px;
            background: #0F172A;
            border-bottom: 3px solid #C5A059;
            clip-path: polygon(0 0, 100% 0, 100% 85%, 50% 100%, 0 85%);
          }

          /* Signatures Footer */
          .footer-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: 15px;
            padding-top: 10px;
            position: relative;
            z-index: 5;
          }
          .sig-box {
            text-align: center;
            width: 190px;
          }
          .sig-script {
            font-family: 'Great Vibes', cursive;
            font-size: 26px;
            color: #0F172A;
            margin-bottom: 2px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .sig-line {
            height: 1px;
            background: #CBD5E1;
            margin-bottom: 6px;
          }
          .sig-name {
            font-size: 12px;
            font-weight: 800;
            color: #0F172A;
          }
          .sig-title {
            font-size: 10px;
            color: #64748B;
            font-weight: 500;
          }
          
          .center-motto {
            text-align: center;
          }
          .motto-text {
            font-family: 'Great Vibes', cursive;
            font-size: 24px;
            color: #C5A059;
            margin-bottom: 4px;
          }
          .motto-flourish {
            font-size: 12px;
            color: #C5A059;
            letter-spacing: 4px;
          }
        </style>
      </head>
      <body>
        <div class="cert-wrapper">
          <div class="corner-tl-gold"></div>
          <div class="corner-tl"></div>
          <div class="corner-br-gold"></div>
          <div class="corner-br"></div>

          <div class="cert-inner-frame">

            <!-- SEAL BADGE LEFT -->
            <div class="seal-container">
              <div class="seal-badge">
                <div class="seal-inner-circle">
                  <div class="seal-crown">👑</div>
                  <div class="seal-text">CERTIFIED<br/>TAILORING<br/>PROFESSIONAL</div>
                  <div class="seal-stars">★★★★★</div>
                </div>
              </div>
              <div class="seal-ribbon-wrap">
                <div class="seal-ribbon"></div>
                <div class="seal-ribbon"></div>
              </div>
            </div>

            <!-- HEADER ROW -->
            <div class="header-row">
              <div class="brand-logo">
                <div class="brand-title">Tailor<span>Connect</span></div>
                <div class="brand-tagline">Custom Dresses | Learn Tailoring | Build Your Fashion Future</div>
              </div>

              <div>
                <div class="top-cursive-quote">Stitching Skills<br/>Building Dreams ♡</div>
                <div class="verif-card" style="margin-top:8px">
                  <div class="verif-row"><span class="verif-label">Certificate ID</span><span class="verif-val">: ${certId}</span></div>
                  <div class="verif-row"><span class="verif-label">Verification Code</span><span class="verif-val">: ${vCode}</span></div>
                  <div class="verif-row"><span class="verif-label">Completion Date</span><span class="verif-val">: ${compDate}</span></div>
                  <div class="verif-row"><span class="verif-label">Course Duration</span><span class="verif-val">: ${duration}</span></div>
                  <div class="verif-row"><span class="verif-label">Grade</span><span class="verif-val">: ${grade}</span></div>
                  <div class="qr-section">
                    <img class="qr-code-img" src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://tailorconnect.com/verify/${certId}" alt="QR Code" />
                    <div class="qr-text">
                      <strong>Scan to verify</strong>
                      this certificate
                      <div class="qr-link">www.tailorconnect.com/verify</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- CERTIFICATE TITLE -->
            <div class="cert-title-container">
              <h1 class="main-title">CERTIFICATE</h1>
              <div class="sub-title-wrap">
                <div class="gold-line"></div>
                <div class="sub-title">OF COMPLETION</div>
                <div class="gold-line"></div>
              </div>
            </div>

            <!-- BODY CONTENT -->
            <div class="cert-body">
              <div class="certify-lead">THIS IS TO CERTIFY THAT</div>
              <div class="recipient-name">${cert.studentName}</div>
              <div class="completion-lead">has successfully completed the course</div>
              <div class="course-title">${cert.courseName}</div>
              <div class="course-desc">
                offered by TailorConnect and has demonstrated the required skills and knowledge in the field of fashion and tailoring.
              </div>
            </div>

            <!-- 4 SKILL BADGES -->
            <div class="feature-grid">
              <div class="feature-item">
                <div class="feature-icon-circle">🪡</div>
                <div class="feature-label">Aari<br/>Embroidery</div>
              </div>
              <div class="feature-divider"></div>
              <div class="feature-item">
                <div class="feature-icon-circle">✂️</div>
                <div class="feature-label">Advanced<br/>Techniques</div>
              </div>
              <div class="feature-divider"></div>
              <div class="feature-item">
                <div class="feature-icon-circle">🏅</div>
                <div class="feature-label">Fashion<br/>Design Skills</div>
              </div>
              <div class="feature-divider"></div>
              <div class="feature-item">
                <div class="feature-icon-circle">🎓</div>
                <div class="feature-label">Lifelong<br/>Learning</div>
              </div>
            </div>

            <!-- FOOTER SIGNATURES -->
            <div class="footer-row">
              <div class="sig-box">
                <div class="sig-script">Anitha R</div>
                <div class="sig-line"></div>
                <div class="sig-name">${cert.instructorName || 'Anitha R'}</div>
                <div class="sig-title">Course Instructor</div>
                <div class="sig-title" style="font-size:9px">TailorConnect</div>
              </div>

              <div class="center-motto">
                <div class="motto-text">Learn • Create • Grow</div>
                <div class="motto-flourish">꧁ ༺ 𑁍 ༻ ꧂</div>
              </div>

              <div class="sig-box">
                <div class="sig-script">Ragul K</div>
                <div class="sig-line"></div>
                <div class="sig-name">Ragul K</div>
                <div class="sig-title">CEO & Founder</div>
                <div class="sig-title" style="font-size:9px">TailorConnect</div>
              </div>
            </div>

          </div>
        </div>
        <script>window.onload = function() { window.print(); setTimeout(() => window.close(), 1000); }</script>
      </body>
      </html>
    `)
    printWindow.document.close()
  }

  // ── Copy verification link ────────────────────────────────────────────────
  const handleCopyLink = (cert) => {
    const url = cert.verificationUrl || `https://tailorconnect.com/verify/${cert.id}`
    navigator.clipboard.writeText(url).then(() => {
      setLinkCopied(cert.id)
      setTimeout(() => setLinkCopied(false), 2500)
    }).catch(() => {
      const el = document.createElement('textarea')
      el.value = url
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setLinkCopied(cert.id)
      setTimeout(() => setLinkCopied(false), 2500)
    })
  }

  // ── WhatsApp Share ────────────────────────────────────────────────────────
  const handleWhatsApp = (cert) => {
    const url = cert.verificationUrl || `https://tailorconnect.com/verify/${cert.id}`
    const msg = encodeURIComponent(
      `I just earned my official certificate from TailorConnect!\n\nCourse: ${cert.courseName}\nRecipient: ${cert.studentName}\nGrade: ${cert.grade || 'A+ (92%)'}\n\nVerify here: ${url}`
    )
    window.open(`https://wa.me/?text=${msg}`, '_blank')
  }

  // ── SMS Share ─────────────────────────────────────────────────────────────
  const handleSMS = (cert) => {
    const url = cert.verificationUrl || `https://tailorconnect.com/verify/${cert.id}`
    const msg = encodeURIComponent(
      `TailorConnect Certificate | ${cert.courseName} | ${cert.studentName} | Verify: ${url}`
    )
    window.open(`sms:?body=${msg}`, '_self')
  }

  // ── Email Share ───────────────────────────────────────────────────────────
  const handleEmail = (cert) => {
    const url = cert.verificationUrl || `https://tailorconnect.com/verify/${cert.id}`
    const subject = encodeURIComponent(`TailorConnect Certificate — ${cert.courseName}`)
    const body = encodeURIComponent(
      `Dear Recipient,\n\nI am pleased to share my TailorConnect certificate:\n\nCourse: ${cert.courseName}\nRecipient: ${cert.studentName}\nInstructor: ${cert.instructorName}\nGrade: ${cert.grade || 'A+'}\n\nVerification Link: ${url}\n\nCertificate ID: ${cert.id}\n\nWith regards,\n${cert.studentName}`
    )
    window.open(`mailto:?subject=${subject}&body=${body}`, '_self')
  }

  return (
    <DashboardLayout role="student">
      <div className="page-header">
        <div>
          <h1>Verified Tailoring Certificates & Credentials</h1>
          <p>Official course completion credentials accredited by certified master artisans and TailorConnect Academy.</p>
        </div>
        <Link to="/student/courses">
          <Button variant="outline">Browse More Courses</Button>
        </Link>
      </div>

      {linkCopied && (
        <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', padding: '10px 18px', borderRadius: 8, marginBottom: 16, fontSize: 13, fontWeight: 600 }}>
          ✅ Verification link copied to clipboard!
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24, marginBottom: 30 }}>
        {certificates.map((cert) => (
          <div key={cert.id} className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <span className="sidebar-role-badge" style={{ fontSize: 11, background: '#FEF3C7', color: '#92400E', border: '1px solid #FCD34D' }}>Accredited Certificate</span>
                <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text-muted)' }}>{cert.id}</span>
              </div>

              <h3 style={{ fontSize: 17, color: 'var(--text-main)', marginBottom: 8 }}>{cert.courseName}</h3>

              <div style={{ background: '#FAF7F2', padding: 14, borderRadius: 8, border: '1px solid #E5E0D8', fontSize: 12.5, marginBottom: 16 }}>
                <div style={{ marginBottom: 4 }}>Recipient: <strong>{cert.studentName}</strong></div>
                <div style={{ marginBottom: 4 }}>Master Instructor: <strong>{cert.instructorName}</strong> ({cert.shopName})</div>
                <div style={{ marginBottom: 4 }}>Performance: <strong style={{ color: '#0F5C5E' }}>{cert.grade}</strong></div>
                <div>Issued On: <strong>{cert.issuedOn}</strong></div>
              </div>

              {/* Verification link */}
              <div style={{ background: '#F0FDF9', border: '1px solid #BBF7D0', borderRadius: 8, padding: '8px 12px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, color: '#065F46', fontWeight: 600 }}>🔗 Verify:</span>
                <a href={cert.verificationUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: '#0284C7', wordBreak: 'break-all', flex: 1 }}>{cert.verificationUrl}</a>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button variant="primary" size="sm" style={{ flex: 1 }} onClick={() => setSelectedCert(cert)}>
                  🏆 View Certificate
                </Button>
                <Button variant="outline" size="sm" style={{ flex: 1 }} onClick={() => handleDownloadPDF(cert)}>
                  📥 PDF
                </Button>
                <button onClick={() => handleCopyLink(cert)} style={{ flex: 1, padding: '7px 10px', borderRadius: 7, border: '1.5px solid #E5E7EB', background: linkCopied === cert.id ? '#ECFDF5' : '#fff', color: linkCopied === cert.id ? '#065F46' : '#374151', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                  {linkCopied === cert.id ? '✅ Copied!' : '🔗 Copy'}
                </button>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => handleWhatsApp(cert)} style={{ flex: 1, padding: '7px 10px', borderRadius: 7, border: 'none', background: '#25D366', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                  <span>📱</span> WhatsApp
                </button>
                <button onClick={() => handleSMS(cert)} style={{ flex: 1, padding: '7px 10px', borderRadius: 7, border: 'none', background: '#3B82F6', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                  <span>💬</span> SMS
                </button>
                <button onClick={() => handleEmail(cert)} style={{ flex: 1, padding: '7px 10px', borderRadius: 7, border: 'none', background: '#EA580C', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                  <span>✉️</span> Email
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CERTIFICATE PREVIEW MODAL */}
      {selectedCert && (
        <div className="modal-backdrop" onClick={() => setSelectedCert(null)}>
          <div
            className="modal-dialog"
            style={{ maxWidth: 960, width: '95%', padding: 0, background: 'transparent', border: 'none', boxShadow: 'none' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ position: 'relative', background: '#FAF7F2', borderRadius: 12, border: '2px solid #C5A059', padding: 12, overflow: 'hidden' }}>
              <button type="button" className="modal-close-btn" style={{ position: 'absolute', top: 18, right: 18, zIndex: 10, background: '#0F172A', color: '#fff', width: 32, height: 32, borderRadius: '50%', border: 'none', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => setSelectedCert(null)}>✕</button>

              <div style={{ border: '1px solid #D4AF37', padding: '24px 30px', position: 'relative', background: 'radial-gradient(circle at center, #FFFFFF 0%, #FAF7F2 100%)' }}>
                
                {/* Corner Accents */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: 0, height: 0, borderTop: '90px solid #C5A059', borderRight: '90px solid transparent', zIndex: 1 }} />
                <div style={{ position: 'absolute', top: 0, left: 0, width: 0, height: 0, borderTop: '80px solid #0F172A', borderRight: '80px solid transparent', zIndex: 2 }} />
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: 0, height: 0, borderBottom: '90px solid #C5A059', borderLeft: '90px solid transparent', zIndex: 1 }} />
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: 0, height: 0, borderBottom: '80px solid #0F172A', borderLeft: '80px solid transparent', zIndex: 2 }} />

                {/* Left Ribbon Seal */}
                <div style={{ position: 'absolute', top: 120, left: 24, zIndex: 6, textAlign: 'center' }}>
                  <div style={{ width: 100, height: 100, background: 'radial-gradient(circle, #DFB96C 0%, #C5A059 70%, #9A7B38 100%)', borderRadius: '50%', padding: 5, boxShadow: '0 4px 12px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#0F172A', border: '1.5px dashed #DFB96C', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#DFB96C', padding: 4 }}>
                      <div style={{ fontSize: 12 }}>👑</div>
                      <div style={{ fontSize: 7, fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase', lineHeight: 1.1, color: '#FFFDF9' }}>CERTIFIED<br/>TAILORING<br/>PROFESSIONAL</div>
                      <div style={{ fontSize: 7, color: '#DFB96C', marginTop: 2, letterSpacing: 1 }}>★★★★★</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginTop: -10 }}>
                    <div style={{ width: 18, height: 36, background: '#0F172A', borderBottom: '2.5px solid #C5A059', clipPath: 'polygon(0 0, 100% 0, 100% 85%, 50% 100%, 0 85%)' }} />
                    <div style={{ width: 18, height: 36, background: '#0F172A', borderBottom: '2.5px solid #C5A059', clipPath: 'polygon(0 0, 100% 0, 100% 85%, 50% 100%, 0 85%)' }} />
                  </div>
                </div>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, position: 'relative', zIndex: 5 }}>
                  <div style={{ textAlign: 'center', flex: 1, marginLeft: 80 }}>
                    <div style={{ fontFamily: 'Georgia, serif', fontSize: 24, fontWeight: 800, color: '#0F172A' }}>Tailor<span style={{ color: '#C5A059' }}>Connect</span></div>
                    <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '1px', color: '#64748B', textTransform: 'uppercase', marginTop: 2 }}>Custom Dresses | Learn Tailoring | Build Your Fashion Future</div>
                  </div>

                  <div>
                    <div style={{ fontFamily: 'cursive', fontSize: 18, color: '#475569', textAlign: 'right', transform: 'rotate(-2deg)', marginBottom: 6 }}>Stitching Skills<br/>Building Dreams ♡</div>
                    <div style={{ border: '1px solid #CBD5E1', borderRadius: 8, padding: '8px 12px', background: 'rgba(255,255,255,0.9)', fontSize: 10.5, width: 210 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}><span style={{ color: '#64748B' }}>Certificate ID</span><span style={{ fontWeight: 700, fontFamily: 'monospace' }}>: {selectedCert.id}</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}><span style={{ color: '#64748B' }}>Verification Code</span><span style={{ fontWeight: 700, fontFamily: 'monospace' }}>: 7F3K9D2A</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}><span style={{ color: '#64748B' }}>Completion Date</span><span style={{ fontWeight: 700 }}>: {selectedCert.issuedOn}</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}><span style={{ color: '#64748B' }}>Course Duration</span><span style={{ fontWeight: 700 }}>: {selectedCert.duration || '4 Weeks'}</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748B' }}>Grade</span><span style={{ fontWeight: 700 }}>: {selectedCert.grade || 'A+ (92%)'}</span></div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, paddingTop: 6, borderTop: '1px dashed #E2E8F0' }}>
                        <img style={{ width: 42, height: 42, border: '1px solid #CBD5E1', padding: 2, background: '#fff' }} src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://tailorconnect.com/verify/${selectedCert.id}`} alt="QR Code" />
                        <div style={{ fontSize: 8.5, color: '#64748B' }}>
                          <strong style={{ color: '#0F172A', display: 'block' }}>Scan to verify</strong>
                          this certificate
                          <div style={{ color: '#C5A059', fontWeight: 600, fontSize: 8 }}>www.tailorconnect.com/verify</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Title */}
                <div style={{ textAlign: 'center', margin: '10px 0', position: 'relative', zIndex: 5 }}>
                  <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 32, fontWeight: 800, color: '#0F172A', letterSpacing: 2, margin: 0 }}>CERTIFICATE</h1>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 4 }}>
                    <div style={{ height: 1.5, width: 80, background: 'linear-gradient(90deg, transparent, #C5A059, transparent)' }} />
                    <div style={{ fontFamily: 'Georgia, serif', fontSize: 13, fontWeight: 700, color: '#C5A059', letterSpacing: 4, textTransform: 'uppercase' }}>OF COMPLETION</div>
                    <div style={{ height: 1.5, width: 80, background: 'linear-gradient(90deg, transparent, #C5A059, transparent)' }} />
                  </div>
                </div>

                {/* Body */}
                <div style={{ textAlign: 'center', position: 'relative', zIndex: 5, marginTop: 10 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: '#475569', textTransform: 'uppercase', marginBottom: 6 }}>THIS IS TO CERTIFY THAT</div>
                  <div style={{ fontFamily: 'cursive', fontSize: 44, color: '#0F172A', margin: '2px 0 8px 0', borderBottom: '1px solid rgba(197, 160, 89, 0.4)', display: 'inline-block', paddingBottom: 2, minWidth: 280 }}>
                    {selectedCert.studentName}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748B', marginBottom: 4 }}>has successfully completed the course</div>
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 800, color: '#0F172A', margin: '2px 0 6px 0' }}>{selectedCert.courseName}</div>
                  <div style={{ fontSize: 10.5, color: '#475569', maxWidth: 520, margin: '0 auto 16px auto', lineHeight: 1.4 }}>
                    offered by TailorConnect and has demonstrated the required skills and knowledge in the field of fashion and tailoring.
                  </div>
                </div>

                {/* 4 Skill Badges */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20, margin: '14px 0 18px 0' }}>
                  <div style={{ textAlign: 'center', flex: 1, maxWidth: 90 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', border: '1px solid #C5A059', background: '#FFFDF9', margin: '0 auto 4px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, color: '#C5A059' }}>🪡</div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: '#334155', lineHeight: 1.2 }}>Aari<br/>Embroidery</div>
                  </div>
                  <div style={{ width: 1, height: 26, background: '#E2E8F0' }} />
                  <div style={{ textAlign: 'center', flex: 1, maxWidth: 90 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', border: '1px solid #C5A059', background: '#FFFDF9', margin: '0 auto 4px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, color: '#C5A059' }}>✂️</div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: '#334155', lineHeight: 1.2 }}>Advanced<br/>Techniques</div>
                  </div>
                  <div style={{ width: 1, height: 26, background: '#E2E8F0' }} />
                  <div style={{ textAlign: 'center', flex: 1, maxWidth: 90 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', border: '1px solid #C5A059', background: '#FFFDF9', margin: '0 auto 4px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, color: '#C5A059' }}>🏅</div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: '#334155', lineHeight: 1.2 }}>Fashion<br/>Design Skills</div>
                  </div>
                  <div style={{ width: 1, height: 26, background: '#E2E8F0' }} />
                  <div style={{ textAlign: 'center', flex: 1, maxWidth: 90 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', border: '1px solid #C5A059', background: '#FFFDF9', margin: '0 auto 4px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, color: '#C5A059' }}>🎓</div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: '#334155', lineHeight: 1.2 }}>Lifelong<br/>Learning</div>
                  </div>
                </div>

                {/* Footer Signatures */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 10, relative: 'relative', zIndex: 5 }}>
                  <div style={{ textAlign: 'center', width: 160 }}>
                    <div style={{ fontFamily: 'cursive', fontSize: 22, color: '#0F172A', marginBottom: 2 }}>Anitha R</div>
                    <div style={{ height: 1, background: '#CBD5E1', marginBottom: 4 }} />
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#0F172A' }}>{selectedCert.instructorName || 'Anitha R'}</div>
                    <div style={{ fontSize: 9.5, color: '#64748B' }}>Course Instructor</div>
                    <div style={{ fontSize: 8.5, color: '#94A3B8' }}>TailorConnect</div>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'cursive', fontSize: 20, color: '#C5A059', marginBottom: 2 }}>Learn • Create • Grow</div>
                    <div style={{ fontSize: 10, color: '#C5A059', letterSpacing: 3 }}>꧁ ༺ 𑁍 ༻ ꧂</div>
                  </div>

                  <div style={{ textAlign: 'center', width: 160 }}>
                    <div style={{ fontFamily: 'cursive', fontSize: 22, color: '#0F172A', marginBottom: 2 }}>Ragul K</div>
                    <div style={{ height: 1, background: '#CBD5E1', marginBottom: 4 }} />
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#0F172A' }}>Ragul K</div>
                    <div style={{ fontSize: 9.5, color: '#64748B' }}>CEO & Founder</div>
                    <div style={{ fontSize: 8.5, color: '#94A3B8' }}>TailorConnect</div>
                  </div>
                </div>

              </div>

              {/* Action buttons in modal */}
              <div style={{ padding: '16px 20px', background: '#FFFFFF', borderTop: '1px solid #E2E8F0', display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button variant="primary" onClick={() => handleDownloadPDF(selectedCert)}>📥 Download PDF</Button>
                <button onClick={() => handleCopyLink(selectedCert)} style={{ padding: '9px 16px', borderRadius: 8, border: '1.5px solid #E5E7EB', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  🔗 Copy Link
                </button>
                <button onClick={() => handleWhatsApp(selectedCert)} style={{ padding: '9px 16px', borderRadius: 8, border: 'none', background: '#25D366', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>📱 WhatsApp</button>
                <button onClick={() => handleSMS(selectedCert)} style={{ padding: '9px 16px', borderRadius: 8, border: 'none', background: '#3B82F6', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>💬 SMS</button>
                <button onClick={() => handleEmail(selectedCert)} style={{ padding: '9px 16px', borderRadius: 8, border: 'none', background: '#EA580C', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>✉️ Email</button>
                <Button variant="outline" onClick={() => setSelectedCert(null)}>Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

