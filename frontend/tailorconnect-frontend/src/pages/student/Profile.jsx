import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout'
import { useAuth } from '../../context/AuthContext'
import * as storage from '../../services/storageService'
import Button from '../../components/Button'
import { downloadReceiptPdf, printReceiptFormatted } from '../../utils/receiptPdf'

export default function StudentProfile() {
  const { user, updateProfile } = useAuth()
  const [courses, setCourses] = useState([])
  const [certificates, setCertificates] = useState([])
  const [payments, setPayments] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [selectedReceipt, setSelectedReceipt] = useState(null)

  const [form, setForm] = useState({
    name: user?.name || '',
    age: user?.age || 22,
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || 'Madurai',
    address: user?.address || '',
    avatar: user?.avatar || 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&auto=format&fit=crop&q=80'
  })

  const loadData = () => {
    if (!user) return
    const allCourses = storage.getOffers().filter((o) => o.type === 'Course' || o.targetAudience === 'Student')
    const userCerts = storage.getCertificatesForStudent(user.id)
    const userPayments = storage.getPaymentsForUser(user.id)
    setCourses(allCourses)
    setCertificates(userCerts)
    setPayments(userPayments)
  }

  useEffect(() => {
    loadData()
    if (user) {
      setForm({
        name: user.name || '',
        age: user.age || 22,
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || 'Madurai',
        address: user.address || '',
        avatar: user.avatar || 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&auto=format&fit=crop&q=80'
      })
    }
  }, [user])

  const handleSave = (e) => {
    e.preventDefault()
    updateProfile(form)
    setIsEditing(false)
    setSuccessMsg('Student profile updated successfully!')
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  const enrolledCourses = courses.filter((c) => c.registeredUserIds?.includes(user?.id))
  const completedCourseIds = certificates.map((cert) => cert.courseId)
  const currentLearning = enrolledCourses.filter((c) => !completedCourseIds.includes(c.id))
  const completedCourses = enrolledCourses.filter((c) => completedCourseIds.includes(c.id))

  return (
    <DashboardLayout role="student">
      <div className="page-header">
        <div>
          <h1>Student Learning Profile</h1>
          <p>Manage learning credentials, view enrolled/completed courses, certificates, and payment invoices.</p>
        </div>
        <Button onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? 'Cancel Edit' : 'Edit Profile'}
        </Button>
      </div>

      {successMsg && (
        <div style={{ background: '#E8F5E9', border: '1px solid #C8E6C9', color: '#2E7D32', padding: '12px 16px', borderRadius: 8, marginBottom: 16 }}>
          ✅ {successMsg}
        </div>
      )}

      {/* STUDENT HERO CARD */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ height: 120, background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))' }} />
        <div className="card-body" style={{ marginTop: -40, position: 'relative' }}>
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <img
              src={form.avatar}
              alt={form.name}
              style={{
                width: 90,
                height: 90,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '4px solid var(--white)',
                boxShadow: 'var(--shadow-md)'
              }}
            />
            <div style={{ flex: 1, minWidth: 240 }}>
              <h2 style={{ fontSize: 22, margin: '0 0 4px 0' }}>{form.name}</h2>
              <p className="muted" style={{ margin: '0 0 8px 0' }}>
                📍 {form.location}, Tamil Nadu • 🎂 Age: {form.age}
              </p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span className="tag">📚 Enrolled Student</span>
                <span className="tag">🏆 {certificates.length} Certificates</span>
                <span className="tag">📞 {form.phone}</span>
                <span className="tag">✉️ {form.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* EDIT FORM / VIEW DETAILS */}
      {isEditing ? (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-body">
            <h3 style={{ marginBottom: 16 }}>Edit Personal Details</h3>
            <form onSubmit={handleSave}>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    className="form-control"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Age</label>
                  <input
                    type="number"
                    className="form-control"
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    className="form-control"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City / Location</label>
                  <input
                    className="form-control"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Profile Photo URL</label>
                  <input
                    className="form-control"
                    value={form.avatar}
                    onChange={(e) => setForm({ ...form, avatar: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Address</label>
                <input
                  className="form-control"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
                <Button variant="outline" type="button" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-body">
            <h3 style={{ marginBottom: 12 }}>Personal & Contact Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, fontSize: 13.5 }}>
              <div><strong>📍 Address:</strong> {form.address || 'Madurai, Tamil Nadu'}</div>
              <div><strong>📞 Phone:</strong> {form.phone}</div>
              <div><strong>✉️ Email:</strong> {form.email}</div>
              <div><strong>🏙️ Location:</strong> {form.location}</div>
            </div>
          </div>
        </div>
      )}

      {/* COURSES STATUS OVERVIEW (SECTION 36) */}
      <div className="section-title">📚 Course Status Overview</div>
      <div className="card-grid" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-body">
            <h4 style={{ margin: '0 0 8px 0', color: 'var(--primary-dark)' }}>Current In-Progress Courses ({currentLearning.length})</h4>
            {currentLearning.length === 0 ? <p className="muted">No active courses in progress.</p> : (
              <ul style={{ paddingLeft: 16, listStyle: 'disc', fontSize: 13 }}>
                {currentLearning.map((c) => (
                  <li key={c.id} style={{ marginBottom: 6 }}>
                    <strong>{c.name}</strong> (by {c.trainerName})
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <h4 style={{ margin: '0 0 8px 0', color: 'var(--success)' }}>Completed Courses ({completedCourses.length})</h4>
            {completedCourses.length === 0 ? <p className="muted">No courses completed yet.</p> : (
              <ul style={{ paddingLeft: 16, listStyle: 'disc', fontSize: 13 }}>
                {completedCourses.map((c) => (
                  <li key={c.id} style={{ marginBottom: 6 }}>
                    <strong>{c.name}</strong> – Certificate Issued ✓
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* CERTIFICATES SECTION WITH DOWNLOAD BUTTON (SECTION 36) */}
      <div className="section-title">🏆 Download Earned Certificates ({certificates.length})</div>
      {certificates.length === 0 ? (
        <p className="muted">No certificates earned yet. Complete all lessons in a course to earn an official certificate!</p>
      ) : (
        <div className="card-grid" style={{ marginBottom: 24 }}>
          {certificates.map((cert) => (
            <div className="card" key={cert.id}>
              <div className="card-body" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 36 }}>📜 🏆</div>
                <h4 style={{ margin: '6px 0 2px 0' }}>{cert.courseName}</h4>
                <p className="muted" style={{ margin: '0 0 10px 0', fontSize: 12 }}>
                  Issued: {cert.issuedOn} • Instructor: {cert.tailorName}
                </p>
                <Link to="/student/certificates">
                  <Button size="sm" block>📄 Download Certificate PDF</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PAYMENT RECEIPTS (SECTION 16 & 36) */}
      <div className="section-title">💳 Course Payment Receipts & Invoices</div>
      {payments.length === 0 ? (
        <p className="muted">No payment history found.</p>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Receipt ID</th>
                <th>Course / Item</th>
                <th>Instructor / Boutique</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id}>
                  <td><strong>{p.id}</strong></td>
                  <td>{p.title}</td>
                  <td>{p.tailorName}</td>
                  <td><strong>₹{p.amount}</strong></td>
                  <td>{p.date}</td>
                  <td><span className="badge badge-successful">{p.status}</span></td>
                  <td>
                    <Button variant="outline" size="sm" onClick={() => setSelectedReceipt(p)}>
                      📄 Download Payment Receipt
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* RECEIPT PREVIEW MODAL */}
      {selectedReceipt && (
        <div className="modal-overlay" onClick={() => setSelectedReceipt(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3>Course Fee Receipt</h3>
              <button className="modal-close-btn" onClick={() => setSelectedReceipt(null)}>✕</button>
            </div>

            <div className="receipt-box printable-area">
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>
                  TailorConnect Learning Receipt
                </div>
                <p className="muted" style={{ margin: 0, fontSize: 12 }}>Official Course Enrollment Invoice</p>
              </div>

              <div className="receipt-item-row">
                <span><strong>Receipt ID:</strong></span>
                <span>{selectedReceipt.id}</span>
              </div>
              <div className="receipt-item-row">
                <span><strong>Transaction Ref:</strong></span>
                <span style={{ fontSize: 12 }}>{selectedReceipt.transactionId}</span>
              </div>
              <div className="receipt-item-row">
                <span><strong>Student Name:</strong></span>
                <span>{selectedReceipt.userName}</span>
              </div>
              <div className="receipt-item-row">
                <span><strong>Course / Masterclass:</strong></span>
                <span>{selectedReceipt.title}</span>
              </div>
              <div className="receipt-item-row">
                <span><strong>Instructor / Studio:</strong></span>
                <span>{selectedReceipt.tailorName}</span>
              </div>
              <div className="receipt-item-row">
                <span><strong>Payment Date:</strong></span>
                <span>{selectedReceipt.date}</span>
              </div>
              <div className="receipt-item-row">
                <span><strong>Status:</strong></span>
                <span style={{ color: 'var(--success)', fontWeight: 800 }}>✓ PAID</span>
              </div>

              <div className="receipt-total" style={{ borderTop: '2px solid var(--primary)', marginTop: 12 }}>
                <span>Total Fee Paid:</span>
                <span>₹{selectedReceipt.amount}.00</span>
              </div>
            </div>

            <div className="no-print" style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <Button variant="outline" onClick={() => setSelectedReceipt(null)}>Close</Button>
              <Button onClick={() => downloadReceiptPdf(selectedReceipt)}>📥 Download PDF</Button>
              <Button onClick={() => printReceiptFormatted(selectedReceipt)}>🖨️ Print</Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
