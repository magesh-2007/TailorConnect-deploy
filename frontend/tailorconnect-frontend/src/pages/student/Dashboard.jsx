import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import Button from '../../components/Button'
import ProgressBar from '../../components/ProgressBar'

export default function StudentDashboard() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [courses, setCourses] = useState([])
  const [certificates, setCertificates] = useState([])
  const [assignments, setAssignments] = useState([])

  const loadData = () => {
    const rawCourses = localStorage.getItem('tc_tailor_courses_data')
    let courseList = []
    if (rawCourses) {
      courseList = JSON.parse(rawCourses)
    } else {
      courseList = [
        {
          id: 'CRS-101',
          title: 'Basic Tailoring & Pattern Making',
          trainerName: 'Lakshmi Devi',
          duration: '15 Days',
          progress: 75,
          lessonsCount: 14,
          completedLessons: 10,
          image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=500&auto=format&fit=crop&q=80'
        },
        {
          id: 'CRS-103',
          title: 'Aari Embroidery & Maggam Work Masterclass',
          trainerName: 'Mrs. Radha Raman',
          duration: '20 Days',
          progress: 40,
          lessonsCount: 18,
          completedLessons: 7,
          image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=500&auto=format&fit=crop&q=80'
        },
        {
          id: 'CRS-102',
          title: 'Blouse Stitching & Perfect Fitting',
          trainerName: 'Lakshmi Devi',
          duration: '10 Days',
          progress: 15,
          lessonsCount: 14,
          completedLessons: 2,
          image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&auto=format&fit=crop&q=80'
        }
      ]
    }

    const defaultCerts = [
      {
        id: 'TC-CERT-2026-881',
        courseName: 'Fabric Drafting & Precision Pattern Cutting',
        studentName: user?.name || 'Meena Sundaram',
        tailorName: 'Lakshmi Devi (Master Artisan)',
        issuedOn: '2026-07-28',
        duration: '30 Days'
      }
    ]

    setCourses(courseList.slice(0, 3).map((c, i) => ({
      ...c,
      instructor: c.trainerName || 'Lakshmi Devi',
      progress: c.progress || (i === 0 ? 75 : i === 1 ? 40 : 15),
      completedLessons: c.completedLessons || (i === 0 ? 10 : i === 1 ? 7 : 2),
      lessonsCount: c.lessonsCount || 14
    })))
    setCertificates(defaultCerts)
    setAssignments([
      { id: 1, title: 'Draft a floral peacock neck pattern with gold zari', course: 'Aari Embroidery Masterclass', dueDate: '2026-09-06', status: 'Pending' },
      { id: 2, title: 'Sew 4-dart bodice trial fitting on muslin', course: 'Basic Tailoring', dueDate: '2026-08-30', status: 'Submitted' }
    ])
  }

  useEffect(() => {
    loadData()
  }, [])

  const enrolledCount = courses.length || 3
  const completedCount = certificates.length || 1
  const pendingAssignmentsCount = assignments.filter(a => a.status === 'Pending').length || 1
  const certsCount = certificates.length || 1

  return (
    <DashboardLayout role="student">
      {/* PAGE HEADER */}
      <div className="page-header">
        <div>
          <h1>{t('Welcome,')} {user?.name || t('Students')} 🎓</h1>
          <p>{t('Track your tailoring masterclasses, practice needlework lessons, submit assignments, and earn verified certificates.')}</p>
        </div>
        <div className="page-actions">
          <Link to="/student/courses">
            <Button variant="primary">{t('🔍 Browse All Courses')}</Button>
          </Link>
          <Link to="/student/lessons">
            <Button variant="outline">🎥 {t('Lessons')}</Button>
          </Link>
        </div>
      </div>

      {/* 4 SPECIFIED STUDENT KPIS */}
      <div className="stat-grid">
        <div className="stat-card">
          <h3>{t('Enrolled Courses')}</h3>
          <div className="stat-value" style={{ color: 'var(--primary)' }}>
            {enrolledCount}
          </div>
          <span className="stat-subtitle">{t('Active learning curriculums') || 'Curriculums'}</span>
        </div>

        <div className="stat-card">
          <h3>{t('Completed Certificates') || t('Completed Orders')}</h3>
          <div className="stat-value" style={{ color: 'var(--success)' }}>
            {completedCount}
          </div>
          <span className="stat-subtitle">{t('Successfully delivered') || 'Finished'}</span>
        </div>

        <div className="stat-card">
          <h3>{t('Pending Assignments')}</h3>
          <div className="stat-value" style={{ color: 'var(--warning)' }}>
            {pendingAssignmentsCount}
          </div>
          <span className="stat-subtitle">{t('Practical stitch tasks due') || 'Tasks due'}</span>
        </div>

        <div className="stat-card">
          <h3>{t('Certificates')}</h3>
          <div className="stat-value" style={{ color: 'var(--primary-dark)' }}>
            {certsCount}
          </div>
          <span className="stat-subtitle">{t('Accredited boutique credentials') || 'Credentials'}</span>
        </div>
      </div>

      {/* ENROLLED COURSES SECTION */}
      <div style={{ marginBottom: 16 }} className="flex-between">
        <div>
          <h2 style={{ fontSize: 18, margin: 0 }}>{t('My Courses')}</h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
            {t('Resume Learning')}
          </p>
        </div>
        <Link to="/student/my-courses" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: 13 }}>
          {t('View All →')}
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 30 }}>
        {courses.map((course) => (
          <div
            key={course.id}
            className="card"
            style={{
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
                <img
                  src={course.image}
                  alt={course.title}
                  style={{ width: 80, height: 80, borderRadius: 6, objectFit: 'cover', border: '1px solid var(--border)' }}
                />
                <div>
                  <span className="sidebar-role-badge" style={{ fontSize: 10, marginBottom: 4, display: 'inline-block' }}>
                    {course.duration}
                  </span>
                  <h3 style={{ fontSize: 16, margin: '0 0 4px 0', color: 'var(--text-main)' }}>
                    {course.title}
                  </h3>
                  <div style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
                    Instructor: <strong>{course.instructor}</strong>
                  </div>
                </div>
              </div>

              <div style={{ background: 'var(--bg-subtle)', padding: 12, borderRadius: 6, border: '1px solid var(--border-light)', marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                  <span>Completed Lessons:</span>
                  <strong>{course.completedLessons} / {course.lessonsCount} Modules</strong>
                </div>
                <ProgressBar value={course.progress} height={7} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <Link to={`/student/lessons?courseId=${course.id}`} style={{ flex: 1 }}>
                <Button variant="primary" size="sm" block>
                  Continue Lesson →
                </Button>
              </Link>
              <Link to={`/student/assignments?courseId=${course.id}`}>
                <Button variant="outline" size="sm">
                  Tasks
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* RECENT ASSIGNMENTS & CERTIFICATE SHORTCUT */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)', gap: 24 }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📝 Pending Practical Tasks</h3>
            <Link to="/student/assignments" style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>
              View All
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {assignments.map(assn => (
              <div key={assn.id} style={{ padding: 12, background: 'var(--bg-page)', border: '1px solid var(--border-light)', borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>{assn.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{assn.course} • Due: {assn.dueDate}</div>
                </div>
                <Link to="/student/assignments">
                  <Button size="sm" variant={assn.status === 'Pending' ? 'primary' : 'outline'}>
                    {assn.status === 'Pending' ? 'Submit Photo' : 'Review'}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🏆 Verified Credentials</h3>
            <Link to="/student/certificates" style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>
              Certificates
            </Link>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 14px 0' }}>
            Download and share your accredited certificate upon finishing video lessons and passing course quizzes.
          </p>
          <Link to="/student/certificates">
            <Button variant="secondary" size="sm" block>
              View Issued Certificate →
            </Button>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  )
}
