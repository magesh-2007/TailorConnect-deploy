import React, { useEffect, useState } from 'react'
import DashboardLayout from '../../layouts/DashboardLayout'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/Button'
import StatusBadge from '../../components/StatusBadge'
import Modal from '../../components/Modal'

const DEFAULT_COURSES = [
  {
    id: 'CRS-101',
    title: 'Basic Tailoring & Machine Mastery',
    duration: '15 Days',
    fee: 1499,
    level: 'Beginner',
    mode: 'Online & Live Demos',
    maxStudents: 35,
    enrolledCount: 28,
    status: 'Published',
    description: 'Learn foundational sewing machine operation, straight seams, neck pipings, and basic bodice patterns.',
    lessonsCount: 12,
    videosCount: 8,
    assignmentsCount: 4,
    quizzesCount: 2,
    image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'CRS-102',
    title: 'Blouse Stitching & Perfect Fitting',
    duration: '10 Days',
    fee: 1999,
    level: 'Intermediate',
    mode: 'Online Masterclass',
    maxStudents: 25,
    enrolledCount: 22,
    status: 'Published',
    description: 'Master 4-dart, princess cut, and padded bridal blouses with zero shoulder droop guarantee.',
    lessonsCount: 14,
    videosCount: 10,
    assignmentsCount: 5,
    quizzesCount: 3,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'CRS-103',
    title: 'Aari Embroidery & Maggam Needlework',
    duration: '20 Days',
    fee: 2999,
    level: 'All Levels',
    mode: 'Studio Practical + Online',
    maxStudents: 20,
    enrolledCount: 19,
    status: 'Published',
    description: 'Complete hands-on Aari chain stitch, zari cord, zardosi, cutwork, and peacock motif embroidery.',
    lessonsCount: 18,
    videosCount: 14,
    assignmentsCount: 6,
    quizzesCount: 4,
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'CRS-104',
    title: 'Traditional Saree Draping & Styling',
    duration: '5 Days',
    fee: 799,
    level: 'Beginner',
    mode: 'Online Video Sessions',
    maxStudents: 50,
    enrolledCount: 45,
    status: 'Published',
    description: 'Master 10+ regional Indian drape styles including South Indian bridal, Nauvari, and contemporary pleats.',
    lessonsCount: 6,
    videosCount: 6,
    assignmentsCount: 2,
    quizzesCount: 1,
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'CRS-105',
    title: 'Advanced Dress Designing & Couture',
    duration: '30 Days',
    fee: 4999,
    level: 'Advanced',
    mode: 'Hybrid Master Studio',
    maxStudents: 15,
    enrolledCount: 11,
    status: 'Published',
    description: 'Can-can flared lehengas, party wear reception gowns, drape neck patterns, and fabric grading.',
    lessonsCount: 24,
    videosCount: 18,
    assignmentsCount: 8,
    quizzesCount: 5,
    image: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=500&auto=format&fit=crop&q=80'
  }
]

export default function TailorCourses() {
  const { user } = useAuth()
  const [courses, setCourses] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)
  const [notification, setNotification] = useState('')

  // Form states
  const [title, setTitle] = useState('')
  const [duration, setDuration] = useState('15 Days')
  const [fee, setFee] = useState('1499')
  const [level, setLevel] = useState('Beginner')
  const [mode, setMode] = useState('Online & Live Demos')
  const [maxStudents, setMaxStudents] = useState('30')
  const [description, setDescription] = useState('')
  const [lessonsCount, setLessonsCount] = useState('10')
  const [videosCount, setVideosCount] = useState('8')
  const [assignmentsCount, setAssignmentsCount] = useState('4')
  const [quizzesCount, setQuizzesCount] = useState('2')
  const [image, setImage] = useState('https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=500&auto=format&fit=crop&q=80')

  const loadCourses = () => {
    const raw = localStorage.getItem('tc_tailor_courses_data')
    if (raw) {
      setCourses(JSON.parse(raw))
    } else {
      setCourses(DEFAULT_COURSES)
      localStorage.setItem('tc_tailor_courses_data', JSON.stringify(DEFAULT_COURSES))
    }
  }

  useEffect(() => {
    loadCourses()
  }, [])

  const openAddModal = () => {
    setEditingCourse(null)
    setTitle('')
    setDuration('15 Days')
    setFee('1499')
    setLevel('Beginner')
    setMode('Online & Live Demos')
    setMaxStudents('30')
    setDescription('')
    setLessonsCount('10')
    setVideosCount('8')
    setAssignmentsCount('4')
    setQuizzesCount('2')
    setImage('https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=500&auto=format&fit=crop&q=80')
    setModalOpen(true)
  }

  const openEditModal = (c) => {
    setEditingCourse(c)
    setTitle(c.title)
    setDuration(c.duration)
    setFee(String(c.fee))
    setLevel(c.level)
    setMode(c.mode)
    setMaxStudents(String(c.maxStudents))
    setDescription(c.description)
    setLessonsCount(String(c.lessonsCount))
    setVideosCount(String(c.videosCount))
    setAssignmentsCount(String(c.assignmentsCount))
    setQuizzesCount(String(c.quizzesCount))
    setImage(c.image)
    setModalOpen(true)
  }

  const handleSaveCourse = (e) => {
    e.preventDefault()
    if (!title || !fee) return

    let updated = []
    if (editingCourse) {
      updated = courses.map(c => c.id === editingCourse.id ? {
        ...c,
        title,
        duration,
        fee: Number(fee),
        level,
        mode,
        maxStudents: Number(maxStudents),
        description,
        lessonsCount: Number(lessonsCount),
        videosCount: Number(videosCount),
        assignmentsCount: Number(assignmentsCount),
        quizzesCount: Number(quizzesCount),
        image
      } : c)
      setNotification(`Course "${title}" updated successfully!`)
    } else {
      const newCrs = {
        id: `CRS-${Date.now().toString().slice(-4)}`,
        title,
        duration,
        fee: Number(fee),
        level,
        mode,
        maxStudents: Number(maxStudents),
        enrolledCount: 0,
        description,
        lessonsCount: Number(lessonsCount),
        videosCount: Number(videosCount),
        assignmentsCount: Number(assignmentsCount),
        quizzesCount: Number(quizzesCount),
        image,
        trainerName: user?.name || 'Lakshmi Devi',
        shopName: user?.shopName || 'Lakshmi Stitches Studio',
        status: 'Published'
      }
      updated = [newCrs, ...courses]
      setNotification(`New course "${title}" published to marketplace!`)
    }

    setCourses(updated)
    localStorage.setItem('tc_tailor_courses_data', JSON.stringify(updated))
    setModalOpen(false)
    setTimeout(() => setNotification(''), 3000)
  }

  const togglePublish = (id) => {
    const updated = courses.map(c => {
      if (c.id === id) {
        const nextStatus = c.status === 'Published' ? 'Unpublished' : 'Published'
        return { ...c, status: nextStatus }
      }
      return c
    })
    setCourses(updated)
    localStorage.setItem('tc_tailor_courses_data', JSON.stringify(updated))
  }

  // Content builder state
  const [contentModalOpen, setContentModalOpen] = useState(false)
  const [activeCourseForContent, setActiveCourseForContent] = useState(null)
  const [contentType, setContentType] = useState('lesson') // 'lesson' | 'video' | 'quiz' | 'assignment'
  const [newLessonTitle, setNewLessonTitle] = useState('')
  const [newLessonVideo, setNewLessonVideo] = useState('')
  const [newLessonDuration, setNewLessonDuration] = useState('15 min')

  // Video File Upload states
  const [videoSourceType, setVideoSourceType] = useState('file') // 'file' | 'url'
  const [selectedVideoFile, setSelectedVideoFile] = useState(null)
  const [videoFileName, setVideoFileName] = useState('')
  const [videoFileSize, setVideoFileSize] = useState('')
  const [videoFilePreview, setVideoFilePreview] = useState('')

  const [newQuizQuestion, setNewQuizQuestion] = useState('')
  const [newQuizOptions, setNewQuizOptions] = useState(['', '', '', ''])
  const [newQuizCorrect, setNewQuizCorrect] = useState(0)
  const [newAssignmentTitle, setNewAssignmentTitle] = useState('')
  const [newAssignmentDesc, setNewAssignmentDesc] = useState('')

  const handleVideoFileChange = (e) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    setSelectedVideoFile(file)
    setVideoFileName(file.name)
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1)
    setVideoFileSize(`${sizeMb} MB`)
    const objectUrl = URL.createObjectURL(file)
    setVideoFilePreview(objectUrl)
    setNewLessonVideo(objectUrl)
    if (!newLessonTitle) {
      const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
      setNewLessonTitle(cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1))
    }
  }

  const openContentModal = (course, type = 'lesson') => {
    setActiveCourseForContent(course)
    setContentType(type)
    setNewLessonTitle('')
    setNewLessonVideo('https://www.w3schools.com/html/mov_bbb.mp4')
    setNewLessonDuration('15 min')
    setVideoSourceType('file')
    setSelectedVideoFile(null)
    setVideoFileName('')
    setVideoFileSize('')
    setVideoFilePreview('')
    setNewQuizQuestion('')
    setNewQuizOptions(['Option A', 'Option B', 'Option C', 'Option D'])
    setNewQuizCorrect(0)
    setNewAssignmentTitle('')
    setNewAssignmentDesc('')
    setContentModalOpen(true)
  }

  const handleSaveContentItem = (e) => {
    e.preventDefault()
    if (!activeCourseForContent) return

    const updated = courses.map(c => {
      if (c.id === activeCourseForContent.id) {
        if (contentType === 'lesson') {
          return { ...c, lessonsCount: (c.lessonsCount || 0) + 1 }
        } else if (contentType === 'video') {
          return { ...c, videosCount: (c.videosCount || 0) + 1 }
        } else if (contentType === 'quiz') {
          return { ...c, quizzesCount: (c.quizzesCount || 0) + 1 }
        } else if (contentType === 'assignment') {
          return { ...c, assignmentsCount: (c.assignmentsCount || 0) + 1 }
        }
      }
      return c
    })

    setCourses(updated)
    localStorage.setItem('tc_tailor_courses_data', JSON.stringify(updated))
    setContentModalOpen(false)
    setNotification(`New ${contentType} successfully added to "${activeCourseForContent.title}"!`)
    setTimeout(() => setNotification(''), 3000)
  }

  const handleDeleteCourse = (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      const updated = courses.filter(c => c.id !== id)
      setCourses(updated)
      localStorage.setItem('tc_tailor_courses_data', JSON.stringify(updated))
      setNotification('Course removed from academy catalog.')
      setTimeout(() => setNotification(''), 3000)
    }
  }

  return (
    <DashboardLayout role="tailor">
      <div className="page-header">
        <div>
          <h1>Tailoring Academy & Course Management</h1>
          <p>Create and host professional stitching, Aari needlework, and blouse designing masterclasses for fashion students and customers.</p>
        </div>
        <Button variant="primary" onClick={openAddModal}>
          + Create New Course
        </Button>
      </div>

      {notification && (
        <div style={{ background: 'var(--success-bg)', color: 'var(--success)', border: '1px solid var(--success-border)', padding: '10px 16px', borderRadius: 6, marginBottom: 20 }}>
          ✅ {notification}
        </div>
      )}

      {/* COURSES LIST */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
        {courses.map((course) => {
          const isPublished = course.status === 'Published'

          return (
            <div
              key={course.id}
              className="card"
              style={{
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                opacity: isPublished ? 1 : 0.7
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span className="sidebar-role-badge" style={{ fontSize: 11 }}>{course.level} • {course.duration}</span>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={() => togglePublish(course.id)}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
                      title="Click to toggle status"
                    >
                      <StatusBadge status={course.status} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCourse(course.id)}
                      style={{ border: 'none', background: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: 13, padding: '2px 4px' }}
                      title="Delete Course"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
                  <img
                    src={course.image}
                    alt={course.title}
                    style={{ width: 80, height: 80, borderRadius: 6, objectFit: 'cover', border: '1px solid var(--border)' }}
                  />
                  <div>
                    <h3 style={{ fontSize: 16, margin: '0 0 4px 0', color: 'var(--text-main)' }}>{course.title}</h3>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary)' }}>
                      ₹{course.fee}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      Enrolled: <strong>{course.enrolledCount || 0} / {course.maxStudents} Students</strong>
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: '0 0 14px 0', lineHeight: 1.45 }}>
                  {course.description}
                </p>

                {/* CURRICULUM METRICS */}
                <div style={{ background: 'var(--bg-subtle)', padding: 10, borderRadius: 6, border: '1px solid var(--border-light)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, textAlign: 'center', fontSize: 11, marginBottom: 14 }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: 13 }}>{course.lessonsCount}</strong>
                    <span>Lessons</span>
                  </div>
                  <div>
                    <strong style={{ display: 'block', fontSize: 13 }}>{course.videosCount}</strong>
                    <span>Videos</span>
                  </div>
                  <div>
                    <strong style={{ display: 'block', fontSize: 13 }}>{course.assignmentsCount}</strong>
                    <span>Tasks</span>
                  </div>
                </div>

                {/* ADD CURRICULUM CONTENT BUTTONS */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 14 }}>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: 11, padding: '4px 2px' }}
                    onClick={() => openContentModal(course, 'lesson')}
                  >
                    + Lesson
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: 11, padding: '4px 2px' }}
                    onClick={() => openContentModal(course, 'video')}
                  >
                    + Video
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: 11, padding: '4px 2px' }}
                    onClick={() => openContentModal(course, 'assignment')}
                  >
                    + Task
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, borderTop: '1px solid var(--border-light)', paddingTop: 12 }}>
                <Button variant="outline" size="sm" style={{ flex: 1 }} onClick={() => openEditModal(course)}>
                  Edit Course
                </Button>
                <Button
                  variant={isPublished ? 'secondary' : 'primary'}
                  size="sm"
                  style={{ flex: 1 }}
                  onClick={() => togglePublish(course.id)}
                >
                  {isPublished ? 'Unpublish' : 'Publish'}
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      {/* CREATE / EDIT COURSE MODAL */}
      {modalOpen && (
        <Modal
          title={editingCourse ? `Edit Course: ${editingCourse.title}` : 'Create New Tailoring Masterclass'}
          onClose={() => setModalOpen(false)}
          maxWidth={640}
        >
          <form onSubmit={handleSaveCourse}>
            <div className="form-group">
              <label className="form-label">Course Title <span className="required">*</span></label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Aari Embroidery & Zari Work Masterclass"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Duration</label>
                <select className="form-control" value={duration} onChange={(e) => setDuration(e.target.value)}>
                  <option value="5 Days">5 Days (Fast-Track)</option>
                  <option value="10 Days">10 Days</option>
                  <option value="15 Days">15 Days (Standard)</option>
                  <option value="20 Days">20 Days (Intensive)</option>
                  <option value="30 Days">30 Days (Comprehensive)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Enrollment Fee (₹) <span className="required">*</span></label>
                <input
                  type="number"
                  className="form-control"
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Difficulty Level</label>
                <select className="form-control" value={level} onChange={(e) => setLevel(e.target.value)}>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="All Levels">All Levels</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Max Student Capacity</label>
                <input
                  type="number"
                  className="form-control"
                  value={maxStudents}
                  onChange={(e) => setMaxStudents(e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">No. of Lessons</label>
                <input type="number" className="form-control" value={lessonsCount} onChange={(e) => setLessonsCount(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Video Modules</label>
                <input type="number" className="form-control" value={videosCount} onChange={(e) => setVideosCount(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Assignments</label>
                <input type="number" className="form-control" value={assignmentsCount} onChange={(e) => setAssignmentsCount(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Quizzes</label>
                <input type="number" className="form-control" value={quizzesCount} onChange={(e) => setQuizzesCount(e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Curriculum Description</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Outline the needlework techniques, pattern drafting, and practical assignments..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
              <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary" size="sm">
                {editingCourse ? 'Save Curriculum' : 'Publish Course'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ADD LESSON / VIDEO / QUIZ / ASSIGNMENT CONTENT MODAL */}
      {contentModalOpen && activeCourseForContent && (
        <Modal
          title={`Add ${contentType.toUpperCase()} to "${activeCourseForContent.title}"`}
          onClose={() => setContentModalOpen(false)}
          maxWidth={540}
        >
          <form onSubmit={handleSaveContentItem}>
            {/* CONTENT TYPE SELECTOR */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
              {['lesson', 'video', 'assignment'].map(t => (
                <button
                  key={t}
                  type="button"
                  className={`btn btn-sm ${contentType === t ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setContentType(t)}
                  style={{ textTransform: 'capitalize' }}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* LESSON OR VIDEO FORM */}
            {(contentType === 'lesson' || contentType === 'video') && (
              <>
                <div className="form-group">
                  <label className="form-label">Module Title <span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Princess Cut Bodice Drafting & Armhole Seam"
                    value={newLessonTitle}
                    onChange={(e) => setNewLessonTitle(e.target.value)}
                    required
                  />
                </div>

                {/* VIDEO INPUT METHOD TABS */}
                <div style={{ marginBottom: 16 }}>
                  <div className="flex-between" style={{ marginBottom: 8 }}>
                    <label className="form-label" style={{ margin: 0 }}>Video Source</label>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        type="button"
                        className={`btn btn-sm ${videoSourceType === 'file' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setVideoSourceType('file')}
                        style={{ fontSize: 11.5, padding: '4px 10px' }}
                      >
                        📁 Local Video File
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm ${videoSourceType === 'url' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setVideoSourceType('url')}
                        style={{ fontSize: 11.5, padding: '4px 10px' }}
                      >
                        🔗 Video URL
                      </button>
                    </div>
                  </div>

                  {videoSourceType === 'file' ? (
                    <div style={{
                      border: '2px dashed var(--primary)',
                      borderRadius: 10,
                      padding: '16px 14px',
                      textAlign: 'center',
                      background: 'var(--primary-subtle, #F0FDF4)',
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}>
                      <input
                        type="file"
                        accept="video/mp4,video/mov,video/webm,video/mkv,video/*"
                        id="course-video-file-picker"
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                        onChange={handleVideoFileChange}
                      />
                      {selectedVideoFile ? (
                        <div>
                          <span style={{ fontSize: 28 }}>🎥</span>
                          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--primary-dark)', marginTop: 4 }}>
                            {videoFileName}
                          </div>
                          <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 2 }}>
                            Size: {videoFileSize} • Ready for HD Masterclass streaming
                          </div>
                          <span className="btn btn-sm btn-outline" style={{ marginTop: 8, fontSize: 11, pointerEvents: 'none' }}>
                            🔄 Choose Different File
                          </span>
                        </div>
                      ) : (
                        <div>
                          <span style={{ fontSize: 30 }}>📁</span>
                          <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--primary-dark)', marginTop: 4 }}>
                            Click or Drag Video File Here to Add
                          </div>
                          <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 2 }}>
                            Supports MP4, MOV, WEBM, MKV video files directly from your computer
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="https://www.w3schools.com/html/mov_bbb.mp4"
                        value={newLessonVideo}
                        onChange={(e) => setNewLessonVideo(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Duration (Minutes)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. 15 min"
                      value={newLessonDuration}
                      onChange={(e) => setNewLessonDuration(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">HD Stream Link / File Status</label>
                    <input
                      type="text"
                      className="form-control"
                      value={selectedVideoFile ? `Local File: ${videoFileName}` : newLessonVideo}
                      readOnly
                      style={{ background: '#F9FAFB' }}
                    />
                  </div>
                </div>
              </>
            )}

            {/* ASSIGNMENT FORM */}
            {contentType === 'assignment' && (
              <>
                <div className="form-group">
                  <label className="form-label">Assignment Task Title <span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Submit Muslin Bodice Sample & Neck Piping Photo"
                    value={newAssignmentTitle}
                    onChange={(e) => setNewAssignmentTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Instructions & Grading Criteria</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Draft on muslin fabric, attach potli buttons, steam press, and upload 2 clear photos..."
                    value={newAssignmentDesc}
                    onChange={(e) => setNewAssignmentDesc(e.target.value)}
                    required
                  />
                </div>
              </>
            )}



            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
              <Button variant="outline" size="sm" onClick={() => setContentModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Save & Add {contentType.toUpperCase()}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </DashboardLayout>
  )
}
