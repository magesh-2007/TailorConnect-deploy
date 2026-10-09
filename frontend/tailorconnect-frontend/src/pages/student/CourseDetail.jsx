import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout'
import { useAuth } from '../../context/AuthContext'
import * as storage from '../../services/storageService'
import ProgressBar from '../../components/ProgressBar'
import Button from '../../components/Button'
import { LoadingState, ErrorState } from '../../components/States'

const DEFAULT_LESSONS = [
  { id: 1, title: 'Lesson 1: Introduction to Needle Types & Tool Setup', duration: '20 min', video: 'Aari Needle Numbers 14 & 24 Handling' },
  { id: 2, title: 'Lesson 2: Zari Thread Winding & Basic Chain Stitch', duration: '35 min', video: 'Smooth Chain Stitch on Raw Silk Fabric' },
  { id: 3, title: 'Lesson 3: Stone Chain, Pearl Stringing & Sugar Beads', duration: '45 min', video: 'Fixing Stone Chains with Fabric Glue and Anchor Locking' },
  { id: 4, title: 'Lesson 4: Traditional Peacock Motif & Neckline Border Finish', duration: '50 min', video: 'Bridal Back Neck Layout and Final Knotting' },
]

export default function CourseDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [course, setCourse]                   = useState(null)
  const [loading, setLoading]                 = useState(true)
  const [activeLesson, setActiveLesson]       = useState(null)
  const [completedLessonIds, setCompleted]    = useState([1])
  const [certificateEarned, setCertificate]   = useState(null)
  const [registerSuccess, setRegisterSuccess] = useState('')
  const [showSampleVideo, setShowSampleVideo] = useState(false)

  const loadData = () => {
    const c = storage.getOfferById(id)
    if (c) {
      setCourse(c)
      const existingCerts = storage.getCertificatesForStudent(user?.id)
      const earned = existingCerts.find(cert => cert.courseId === c.id)
      if (earned) {
        setCertificate(earned)
        setCompleted([1, 2, 3, 4])
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
    const handleChange = () => loadData()
    window.addEventListener('tc_data_changed', handleChange)
    return () => window.removeEventListener('tc_data_changed', handleChange)
  }, [id, user])

  if (loading) return <DashboardLayout role="student"><LoadingState /></DashboardLayout>
  if (!course)  return <DashboardLayout role="student"><ErrorState message="Course not found." /></DashboardLayout>

  const isEnrolled    = course.registeredUserIds?.includes(user?.id)
  const progressPercent = Math.round((completedLessonIds.length / DEFAULT_LESSONS.length) * 100)

  /* ── Enroll: go to payment page ─────────────────────────────────────────── */
  const handleEnroll = () => {
    // Build query params for the payment page
    const params = new URLSearchParams({
      courseId:  course.id,
      courseName: course.name,
      tailor:    course.trainerName || 'TailorConnect',
      item:      course.name,
      amount:    course.price || 500,
      type:      'course',                           // signal to Payment.jsx
      returnTo:  `/student/courses/${course.id}`,   // after payment success
    })
    navigate(`/payment?${params.toString()}`)
  }

  const handleCompleteLesson = (lessonId) => {
    if (!completedLessonIds.includes(lessonId)) {
      const next = [...completedLessonIds, lessonId]
      setCompleted(next)
      if (next.length === DEFAULT_LESSONS.length) {
        const res = storage.completeCourseForStudent(course.id, user)
        if (res.success) setCertificate(res.certificate)
      }
    }
  }

  return (
    <DashboardLayout role="student">
      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <h1>{course.name}</h1>
          <p>Taught by <strong>{course.trainerName}</strong> ({course.shopName}) • ⏱️ {course.durationDays} Days</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="outline" onClick={() => setShowSampleVideo(true)}>
            🎬 Watch Sample Video
          </Button>
          <Link to="/student/courses">
            <Button variant="outline">← Back to Courses</Button>
          </Link>
        </div>
      </div>

      {/* ── Sample Video Preview Modal ── */}
      {showSampleVideo && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
          zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20
        }}>
          <div style={{
            background: '#fff', borderRadius: 16, maxWidth: 680, width: '100%',
            overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
          }}>
            <div style={{ padding: '16px 20px', background: 'var(--bg-sidebar)', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>🎬 Free Sample Video: {course.name}</div>
              <button onClick={() => setShowSampleVideo(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: 12, overflow: 'hidden', background: '#000', marginBottom: 16 }}>
                <iframe
                  src={course.sampleVideoUrl || 'https://www.youtube.com/embed/3RCh2Tq8RN0'}
                  title={course.sampleVideoTitle || course.name}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <h4 style={{ margin: '0 0 6px', color: 'var(--primary-dark)' }}>{course.sampleVideoTitle || 'Hands-on Sewing & Needlework Masterclass Preview'}</h4>
              <p style={{ margin: '0 0 16px', fontSize: 13, color: '#4B5563', lineHeight: 1.5 }}>
                Watch Master Trainer <strong>{course.trainerName}</strong> demonstrate real-time needle techniques, fabric handling, and drafting. Enroll today to unlock all full-length modules and earn your completion certificate!
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <Button variant="outline" onClick={() => setShowSampleVideo(false)}>Close Preview</Button>
                <Button onClick={() => { setShowSampleVideo(false); handleEnroll() }}>Enroll Now →</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {registerSuccess && (
        <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', padding: '12px 16px', borderRadius: 8, marginBottom: 16 }}>
          ✅ {registerSuccess}
        </div>
      )}

      {/* ── Certificate Banner ── */}
      {certificateEarned && (
        <div style={{ background: '#ECFDF5', border: '2px solid #6EE7B7', borderRadius: 12, padding: 20, marginBottom: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 6 }}>🏆 🎉</div>
          <h2 style={{ color: '#065F46', margin: '0 0 6px' }}>Course Completed Successfully!</h2>
          <p style={{ margin: '0 0 14px', fontSize: 14 }}>
            Congratulations <strong>{user?.name}</strong>! Your official certificate (ID: <strong>{certificateEarned.id}</strong>) is ready.
          </p>
          <Link to="/student/certificates">
            <Button>View & Download Certificate 📜</Button>
          </Link>
        </div>
      )}

      {/* ── Course Hero + Progress ── */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ position: 'relative' }}>
          <img src={course.image} alt={course.name} className="image-card-img" style={{ height: 220 }} />
          <span className="tag" style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(255,255,255,0.92)' }}>
            {course.category} • {course.mode}
          </span>
        </div>

        <div className="card-body">
          <div className="flex-between" style={{ marginBottom: 8 }}>
            <h3 style={{ margin: 0 }}>Learning Progress</h3>
            <span style={{ fontWeight: 800, color: 'var(--primary-dark)' }}>{progressPercent}% Completed</span>
          </div>
          <ProgressBar value={progressPercent} />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginTop: 16, fontSize: 13 }}>
            <div><strong>Location:</strong> {course.location}</div>
            <div><strong>Schedule:</strong> {course.availableDays} ({course.availableTime})</div>
            <div><strong>Course Fee:</strong> <span style={{ fontWeight: 800, fontSize: 16, color: '#0F5C5E' }}>₹{course.price}</span></div>
            <div><strong>Batch Size:</strong> {course.registeredStudents || 0} / {course.maxCapacity} Students</div>
          </div>

          {/* ── Enroll / Payment Button ── */}
          {!isEnrolled && !certificateEarned && (
            <div style={{ marginTop: 20, borderTop: '1px solid var(--border-light)', paddingTop: 16 }}>
              <div style={{ background: 'linear-gradient(135deg, #FFF7ED, #FFEDD5)', border: '1.5px solid #FED7AA', borderRadius: 10, padding: '14px 18px', marginBottom: 16, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 22 }}>💳</span>
                <div style={{ fontSize: 13 }}>
                  <strong style={{ color: '#92400E' }}>One-time Course Enrollment Fee</strong>
                  <div style={{ color: '#B45309', marginTop: 3 }}>
                    Pay <strong>₹{course.price}</strong> to unlock all {DEFAULT_LESSONS.length} lessons, get a verified certificate upon completion, and access lifetime course materials.
                  </div>
                </div>
              </div>
              <Button size="lg" block onClick={handleEnroll}>
                🎓 Enroll & Pay ₹{course.price} →
              </Button>
            </div>
          )}

          {isEnrolled && (
            <div style={{ marginTop: 16, background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#065F46', fontWeight: 600 }}>
              ✅ You are enrolled! Start watching lessons below.
            </div>
          )}
        </div>
      </div>

      {/* ── Lessons ── */}
      <div className="section-title">📚 Course Lessons & Practical Modules</div>
      <div className="card" style={{ marginBottom: 24 }}>
        {DEFAULT_LESSONS.map(lesson => {
          const isDone = completedLessonIds.includes(lesson.id)
          return (
            <div
              key={lesson.id}
              className="flex-between"
              style={{
                padding: '14px 18px',
                borderBottom: '1px solid var(--border-light)',
                cursor: 'pointer',
                background: activeLesson?.id === lesson.id ? 'var(--primary-light)' : 'transparent',
                transition: 'background 0.15s',
              }}
              onClick={() => isEnrolled ? setActiveLesson(lesson) : handleEnroll()}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 18 }}>{isDone ? '✅' : isEnrolled ? '▶️' : '🔒'}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: isEnrolled ? 'inherit' : '#9CA3AF' }}>
                    {lesson.title}
                  </div>
                  <div className="muted" style={{ fontSize: 12 }}>
                    {isEnrolled ? `Topic: ${lesson.video}` : 'Enroll to unlock this lesson'}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="muted" style={{ fontSize: 12.5 }}>⏱️ {lesson.duration}</span>
                {isEnrolled && !isDone && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={e => { e.stopPropagation(); handleCompleteLesson(lesson.id) }}
                  >
                    Mark Done
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Active Lesson Viewer ── */}
      {activeLesson && isEnrolled && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-body">
            <h3 style={{ marginTop: 0 }}>Now Playing: {activeLesson.title}</h3>
            <p className="muted" style={{ margin: '0 0 14px' }}>
              Module: {activeLesson.video} • Master Trainer: {course.trainerName}
            </p>
            <div style={{
              background: 'linear-gradient(135deg, #111, #333)',
              height: 280, borderRadius: 10,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              color: '#fff', gap: 10,
            }}>
              <div style={{ fontSize: 42 }}>🧵 ▶️</div>
              <div style={{ fontWeight: 600 }}>TailorConnect Video Masterclass Player</div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>Streaming HD Aari needlework demonstration</div>
            </div>
            <div className="flex-between" style={{ marginTop: 16 }}>
              <span className="muted">Lesson duration: {activeLesson.duration}</span>
              <Button
                variant={completedLessonIds.includes(activeLesson.id) ? 'secondary' : 'primary'}
                onClick={() => handleCompleteLesson(activeLesson.id)}
              >
                {completedLessonIds.includes(activeLesson.id) ? '✓ Completed' : 'Mark Lesson as Complete'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Course Info Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
        <div className="card">
          <div className="card-body">
            <h4 style={{ marginTop: 0, color: 'var(--primary-dark)' }}>🧵 What Will Be Taught</h4>
            <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6 }}>
              {course.whatWillBeTaught || 'Needle handling, chain stitch, stone fixing, peacock motif, and pattern cutting.'}
            </p>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <h4 style={{ marginTop: 0, color: 'var(--primary-dark)' }}>🏆 What You Will Receive</h4>
            <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6 }}>
              {course.whatWillBeReceived || 'Verified Certificate of Completion, Stencil patterns, and complete tool kit.'}
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
