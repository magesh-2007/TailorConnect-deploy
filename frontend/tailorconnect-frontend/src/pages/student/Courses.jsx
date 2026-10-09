import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout'
import { useAuth } from '../../context/AuthContext'
import * as storage from '../../services/storageService'
import Button from '../../components/Button'
import { LoadingState, EmptyState } from '../../components/States'

export default function Courses() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [modeFilter, setModeFilter] = useState('All')
  const [registerSuccess, setRegisterSuccess] = useState('')
  const [registerError, setRegisterError] = useState('')

  const loadData = () => {
    try {
      const allOffers = storage.getOffers ? storage.getOffers() : []
      const studentCourses = allOffers.filter(
        (o) => o.type === 'Course' || o.targetAudience === 'Student'
      )
      
      if (studentCourses.length > 0) {
        setCourses(studentCourses)
      } else {
        // Fallback default courses if none exist
        const defaults = [
          {
            id: 'OFF-101',
            name: 'Aari Embroidery & Maggam Needlework Masterclass',
            type: 'Course',
            targetAudience: 'Student',
            category: 'Aari Blouse',
            description: 'Comprehensive hands-on training on Aari needle handling, chain stitch, zari winding, pearl stringing, and heavy bridal neckline motifs.',
            mode: 'Offline',
            durationDays: 15,
            availableDays: 'Monday to Friday',
            availableTime: '10:00 AM – 12:00 PM',
            location: '45, Gandhi Road, T.Nagar, Chennai',
            shopName: 'Lakshmi Stitches & Bridal Studio',
            trainerName: 'Lakshmi Devi',
            tailorId: 'user-tailor-1',
            price: 1499,
            maxCapacity: 20,
            registeredStudents: 12,
            status: 'Active',
            image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&auto=format&fit=crop&q=80',
            registeredUserIds: ['user-student-1']
          },
          {
            id: 'OFF-103',
            name: 'Fundamentals of Tailoring & Pattern Cutting',
            type: 'Course',
            targetAudience: 'Student',
            category: 'Custom Dress',
            description: 'Learn foundational body measurements, dart drafting, seam allowances, and cutting layout optimization to reduce fabric waste.',
            mode: 'Online',
            durationDays: 30,
            availableDays: 'Tuesday, Thursday, Saturday',
            availableTime: '04:00 PM – 06:00 PM',
            location: 'Online Live Video Sessions',
            shopName: 'Modern Stitch Fashion Lab',
            trainerName: 'Anandhi Nathan',
            tailorId: 'user-tailor-4',
            price: 799,
            maxCapacity: 25,
            registeredStudents: 21,
            status: 'Active',
            image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80',
            registeredUserIds: ['user-student-1', 'user-student-2']
          },
          {
            id: 'OFF-104',
            name: 'Antique Maggam Work & Zari Designing Workshop',
            type: 'Course',
            targetAudience: 'Student',
            category: 'Embroidery',
            description: 'Intensive 10-day workshop on heritage South Indian Maggam frame mounting, antique metal wire threading, and traditional temple borders.',
            mode: 'Offline',
            durationDays: 10,
            availableDays: 'Daily',
            availableTime: '11:00 AM – 02:00 PM',
            location: '88, West Masi Street, Madurai',
            shopName: 'Vintage Needle Heritage Tailors',
            trainerName: 'Mrs. Radha Raman',
            tailorId: 'user-tailor-2',
            price: 1899,
            maxCapacity: 15,
            registeredStudents: 15,
            status: 'Closed',
            image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80',
            registeredUserIds: []
          }
        ]
        setCourses(defaults)
      }
    } catch (err) {
      console.error('Error loading courses:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    const handleDataChange = () => loadData()
    window.addEventListener('tc_data_changed', handleDataChange)
    return () => window.removeEventListener('tc_data_changed', handleDataChange)
  }, [])

  const handleRegister = (course) => {
    if (!user) {
      navigate('/login/student?redirectTo=' + encodeURIComponent('/student/courses'))
      return
    }
    const targetCourse = typeof course === 'object' ? course : courses.find(c => c.id === course)
    if (!targetCourse) return

    const isEnrolled = targetCourse.registeredUserIds?.includes(user?.id)
    if (isEnrolled) {
      navigate(`/student/courses/${targetCourse.id}`)
      return
    }

    // Redirect to Payment Gateway System
    const params = new URLSearchParams({
      courseId:   targetCourse.id,
      courseName: targetCourse.name,
      tailor:     targetCourse.trainerName || targetCourse.shopName || 'TailorConnect',
      item:       targetCourse.name,
      amount:     targetCourse.price || 500,
      type:       'course',
      returnTo:   `/student/courses/${targetCourse.id}`,
    })
    navigate(`/payment?${params.toString()}`)
  }

  // Quick Direct Enroll (Instant Demo / Free Enrollment option)
  const handleQuickEnroll = (course) => {
    if (!user) {
      navigate('/login/student?redirectTo=' + encodeURIComponent('/student/courses'))
      return
    }
    try {
      if (storage.registerForCourse) {
        const res = storage.registerForCourse(course.id, user)
        if (res && res.success === false) {
          setRegisterError(res.error || 'Failed to enroll in course.')
          setTimeout(() => setRegisterError(''), 4000)
          return
        }
      }
      setRegisterSuccess(`🎉 You have successfully enrolled in "${course.name}"! Full syllabus & video lesson access unlocked.`)
      loadData()
      setTimeout(() => setRegisterSuccess(''), 5000)
    } catch (err) {
      setRegisterError(err.message || 'Error enrolling in course.')
      setTimeout(() => setRegisterError(''), 4000)
    }
  }

  const categories = ['All', 'Aari Blouse', 'Bridal Blouse', 'Embroidery', 'Custom Dress']

  const filteredCourses = courses.filter((c) => {
    const term = search.toLowerCase()
    const matchesSearch =
      !search ||
      c.name.toLowerCase().includes(term) ||
      (c.category && c.category.toLowerCase().includes(term)) ||
      (c.trainerName && c.trainerName.toLowerCase().includes(term)) ||
      (c.description && c.description.toLowerCase().includes(term))

    const matchesCat = categoryFilter === 'All' || c.category === categoryFilter
    const matchesMode = modeFilter === 'All' || c.mode === modeFilter

    return matchesSearch && matchesCat && matchesMode
  })

  return (
    <DashboardLayout role="student">
      <div className="page-header">
        <div>
          <h1>Tailoring & Embroidery Masterclasses</h1>
          <p>Learn specialized South Indian Aari needlework, bridal stitching, and drafting patterns from master tailors.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/student/my-courses">
            <Button variant="outline">📚 My Enrolled Courses</Button>
          </Link>
          <Link to="/student/lessons">
            <Button variant="secondary">▶ Watch Active Lessons</Button>
          </Link>
        </div>
      </div>

      {registerSuccess && (
        <div style={{ background: '#DCFCE7', border: '1px solid #BBF7D0', color: '#166534', padding: '12px 18px', borderRadius: 8, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
          <span>✅</span> {registerSuccess}
        </div>
      )}

      {registerError && (
        <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', color: '#991B1B', padding: '12px 18px', borderRadius: 8, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
          <span>⚠️</span> {registerError}
        </div>
      )}

      {/* SEARCH AND FILTERS */}
      <div className="card" style={{ marginBottom: 24, padding: 16 }}>
        <div className="form-row" style={{ alignItems: 'flex-end', display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <div className="form-group" style={{ marginBottom: 0, flex: 2, minWidth: 260 }}>
            <label style={{ fontWeight: 600, fontSize: 13, marginBottom: 6, display: 'block' }}>
              Search Masterclasses (e.g. Aari, Zari, Pattern Cutting)
            </label>
            <input
              className="form-control"
              placeholder="Search by course title or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', height: 40, padding: '0 12px', borderRadius: 6, border: '1px solid var(--border)' }}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0, minWidth: 160 }}>
            <label style={{ fontWeight: 600, fontSize: 13, marginBottom: 6, display: 'block' }}>Category</label>
            <select
              className="form-control"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ width: '100%', height: 40, padding: '0 12px', borderRadius: 6, border: '1px solid var(--border)' }}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0, minWidth: 160 }}>
            <label style={{ fontWeight: 600, fontSize: 13, marginBottom: 6, display: 'block' }}>Delivery Mode</label>
            <select
              className="form-control"
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              style={{ width: '100%', height: 40, padding: '0 12px', borderRadius: 6, border: '1px solid var(--border)' }}
            >
              <option value="All">All Modes</option>
              <option value="Offline">Offline (Studio Workshop)</option>
              <option value="Online">Online (Live Video)</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Discovering tailoring masterclasses..." />
      ) : filteredCourses.length === 0 ? (
        <EmptyState message="No courses match your search criteria. Try modifying your search keywords." />
      ) : (
        <div className="card-grid-wide" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {filteredCourses.map((c) => {
            const isEnrolled = c.registeredUserIds?.includes(user?.id)
            const remainingSeats = Math.max(0, (c.maxCapacity || 20) - (c.registeredStudents || 0))
            const isFull = remainingSeats === 0 || c.status === 'Closed'

            return (
              <div className="card" key={c.id} style={{ display: 'flex', flexDirection: 'column', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
                <div style={{ position: 'relative', height: 180, overflow: 'hidden' }}>
                  <img
                    src={c.image || 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&auto=format&fit=crop&q=80'}
                    alt={c.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <span
                    className={`badge ${c.status === 'Active' ? 'badge-active' : 'badge-closed'}`}
                    style={{ position: 'absolute', top: 10, right: 10, padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}
                  >
                    {c.status === 'Active' ? (isFull ? 'Seats Full' : 'Enrollment Open') : 'Closed'}
                  </span>
                  <span
                    className="tag"
                    style={{
                      position: 'absolute',
                      bottom: 10,
                      left: 10,
                      background: 'rgba(255,255,255,0.92)',
                      padding: '3px 8px',
                      borderRadius: 4,
                      fontSize: 11.5,
                      fontWeight: 600,
                      color: 'var(--primary-dark)'
                    }}
                  >
                    {c.category} • {c.mode}
                  </span>
                </div>

                <div className="card-body" style={{ padding: 16, display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 4px 0', color: 'var(--primary-dark)' }}>
                    {c.name}
                  </h3>
                  <p className="muted" style={{ margin: '0 0 10px 0', fontSize: 12.5 }}>
                    Trainer: <strong>{c.trainerName}</strong> ({c.shopName})
                  </p>

                  <div style={{ background: '#FFF8FA', padding: '10px 14px', borderRadius: 8, marginBottom: 12, border: '1px solid #FFE4E6' }}>
                    <div className="flex-between" style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, color: 'var(--primary-dark)' }}>
                      <span>Fee: ₹{c.price}</span>
                      <span>⏱️ {c.durationDays} Days</span>
                    </div>
                    <div style={{ fontSize: 12, marginTop: 4, color: isFull ? 'var(--danger)' : '#4B5563' }}>
                      👥 <strong>{c.registeredStudents || 0} Students Registered</strong> ({remainingSeats} seats left)
                    </div>
                  </div>

                  <p style={{ fontSize: 12, color: 'var(--text-main)', margin: '0 0 12px 0', lineHeight: 1.5 }}>
                    <strong>Schedule:</strong> {c.availableDays} ({c.availableTime})<br />
                    <strong>Location:</strong> {c.location}
                  </p>

                  <div style={{ marginTop: 'auto', display: 'flex', gap: 8, flexDirection: 'column' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Link to={`/student/courses/${c.id}`} style={{ flex: 1 }}>
                        <Button variant="outline" size="sm" block>
                          📖 Syllabus & Details
                        </Button>
                      </Link>

                      {isEnrolled ? (
                        <Link to="/student/lessons" style={{ flex: 1 }}>
                          <Button variant="secondary" size="sm" block>
                            ▶ Watch Lessons
                          </Button>
                        </Link>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          style={{ flex: 1 }}
                          disabled={isFull}
                          onClick={() => handleRegister(c)}
                        >
                          {isFull ? 'Capacity Full' : '💳 Enroll & Pay'}
                        </Button>
                      )}
                    </div>

                    {!isEnrolled && !isFull && (
                      <button
                        type="button"
                        onClick={() => handleQuickEnroll(c)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--primary)',
                          fontSize: 11.5,
                          textDecoration: 'underline',
                          cursor: 'pointer',
                          padding: '2px 0',
                          textAlign: 'center'
                        }}
                      >
                        ⚡ Instant Free Demo Enrollment
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </DashboardLayout>
  )
}
