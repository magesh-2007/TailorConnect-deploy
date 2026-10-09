import React, { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout'
import Button from '../../components/Button'
import ProgressBar from '../../components/ProgressBar'

const LESSON_MODULES = [
  {
    id: 1,
    title: '1. Machine Setup, Tension & Threading Essentials',
    duration: '14 min',
    completed: true,
    youtubeId: 'w_nxF5gqBy4',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    poster: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80',
    description: 'Learn needle calibration, upper & bobbin thread tension balance (dial 4), foot pressure, and oiling rituals.'
  },
  {
    id: 2,
    title: '2. Standard Body Measurements & Drafting Geometry',
    duration: '18 min',
    completed: true,
    youtubeId: '35uEpQC3qGI',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    poster: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&auto=format&fit=crop&q=80',
    description: 'Accurate bust, underbust, apex-to-apex, and back neck depth mapping for zero-armhole gaping.'
  },
  {
    id: 3,
    title: '3. Precision Bodice Cutting on Muslin Fabric',
    duration: '22 min',
    completed: true,
    youtubeId: '_VX_I-0lQvM',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    poster: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80',
    description: 'Fabric grain alignment, 1.5-inch seam allowance chalking, and clean rotary/shears cutting.'
  },
  {
    id: 4,
    title: '4. Sewing 4-Dart Front Bodice & Armhole Curves',
    duration: '26 min',
    completed: false,
    youtubeId: '3RCh2Tq8RN0',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    poster: 'https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?w=800&auto=format&fit=crop&q=80',
    description: 'Sewing center-bust, waist, armhole and side darts with locked stitch ends and smooth curvature.'
  },
  {
    id: 5,
    title: '5. Deep U-Neck Piping & Potli Button Finishing',
    duration: '20 min',
    completed: false,
    youtubeId: 'w_nxF5gqBy4',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    poster: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop&q=80',
    description: '45-degree bias strip cutting, thread cord insertion, and handmade potli button spacing.'
  },
  {
    id: 6,
    title: '6. Elbow Sleeve Attachment & Underarm Alignment',
    duration: '19 min',
    completed: false,
    youtubeId: '35uEpQC3qGI',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    poster: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80',
    description: 'Matching armhole crown notches, easing excess ease, and reinforcing high-stress seam joints.'
  },
  {
    id: 7,
    title: '7. Final Fitting Adjustments & Side Margin Seams',
    duration: '15 min',
    completed: false,
    youtubeId: '_VX_I-0lQvM',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    poster: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&auto=format&fit=crop&q=80',
    description: '3-tier margin stitching for body expansion, hook-and-eye placket attachment, and hem pressing.'
  }
]

export default function StudentLessons() {
  const [modules, setModules] = useState(LESSON_MODULES)
  const [activeLessonId, setActiveLessonId] = useState(4)
  const [isPlaying, setIsPlaying] = useState(false)
  const [videoMode, setVideoMode] = useState('youtube') // 'youtube' | 'html5'
  const [tab, setTab] = useState('notes') // 'notes' | 'downloads'
  const [notification, setNotification] = useState('')
  const videoRef = useRef(null)

  const activeLesson = modules.find(m => m.id === activeLessonId) || modules[0]
  const completedCount = modules.filter(m => m.completed).length
  const progressPercent = Math.round((completedCount / modules.length) * 100)

  const handleSelectLesson = (lessonId) => {
    setActiveLessonId(lessonId)
    setIsPlaying(true) // Start playing automatically when switching lessons
  }

  const handleStartPlaying = () => {
    setIsPlaying(true)
  }

  const handleMarkComplete = (id) => {
    const updated = modules.map(m => m.id === id ? { ...m, completed: true } : m)
    setModules(updated)
    setNotification(`Lesson "${activeLesson.title}" marked as complete!`)
    
    // Auto advance to next lesson if available
    const nextIdx = modules.findIndex(m => m.id === id) + 1
    if (nextIdx < modules.length) {
      setActiveLessonId(modules[nextIdx].id)
      setIsPlaying(true)
    }
    setTimeout(() => setNotification(''), 3500)
  }

  return (
    <DashboardLayout role="student">
      <style>{`
        @keyframes tcPulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(15, 92, 94, 0.7); }
          70% { transform: scale(1.08); box-shadow: 0 0 0 16px rgba(15, 92, 94, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(15, 92, 94, 0); }
        }
        .tc-play-btn {
          animation: tcPulse 2s infinite;
          transition: transform 0.2s, background-color 0.2s;
        }
        .tc-play-btn:hover {
          transform: scale(1.15) !important;
          background-color: #0A4547 !important;
        }
        .tc-lesson-item {
          transition: background-color 0.15s, border-color 0.15s, transform 0.12s;
        }
        .tc-lesson-item:hover {
          transform: translateX(2px);
        }
      `}</style>

      <div className="page-header">
        <div>
          <h1>Aari Embroidery & Blouse Stitching Masterclass</h1>
          <p>Instructor: <strong>Lakshmi Devi</strong> • Curriculum Progress: <strong>{completedCount}/{modules.length} Completed ({progressPercent}%)</strong></p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/student/assignments">
            <Button variant="outline">📝 Practical Assignments</Button>
          </Link>
          <Link to="/student/quizzes">
            <Button variant="secondary">❓ Course Quiz</Button>
          </Link>
        </div>
      </div>

      {notification && (
        <div style={{ background: '#DCFCE7', color: '#166534', border: '1px solid #BBF7D0', padding: '12px 18px', borderRadius: 8, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
          <span>✅</span> {notification}
        </div>
      )}

      {/* LESSON PLAYER & PLAYLIST GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 24, marginBottom: 30 }}>
        {/* MAIN VIDEO & LECTURE NOTES */}
        <div>
          <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 20, borderRadius: 12, border: '1px solid var(--border)' }}>
            
            {/* Top Player Control Bar */}
            <div style={{ padding: '8px 16px', background: '#0F172A', color: '#94A3B8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: isPlaying ? '#22C55E' : '#EAB308' }} />
                <span style={{ color: '#F8FAFC', fontWeight: 600 }}>
                  {isPlaying ? '● NOW PLAYING' : 'READY TO PLAY'}
                </span>
                <span>• Module {activeLesson.id} of {modules.length}</span>
              </div>
              
              {/* Player Mode Switcher */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11, color: '#64748B' }}>Source:</span>
                <button
                  type="button"
                  onClick={() => setVideoMode('youtube')}
                  style={{
                    background: videoMode === 'youtube' ? 'var(--primary)' : '#1E293B',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 4,
                    padding: '3px 8px',
                    fontSize: 11,
                    cursor: 'pointer',
                    fontWeight: videoMode === 'youtube' ? 700 : 400
                  }}
                >
                  📺 YouTube Masterclass
                </button>
                <button
                  type="button"
                  onClick={() => setVideoMode('html5')}
                  style={{
                    background: videoMode === 'html5' ? 'var(--primary)' : '#1E293B',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 4,
                    padding: '3px 8px',
                    fontSize: 11,
                    cursor: 'pointer',
                    fontWeight: videoMode === 'html5' ? 700 : 400
                  }}
                >
                  🎬 Direct Video (MP4)
                </button>
              </div>
            </div>

            {/* VIDEO PLAYER CONTAINER */}
            <div
              style={{
                position: 'relative',
                background: '#0F172A',
                width: '100%',
                height: 420,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}
            >
              {!isPlaying ? (
                /* PREVIEW POSTER / READY SCREEN */
                <div
                  onClick={handleStartPlaying}
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    backgroundImage: `linear-gradient(to top, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.5) 60%, rgba(15, 23, 42, 0.75) 100%), url(${activeLesson.poster})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    padding: 24,
                    textAlign: 'center',
                    userSelect: 'none'
                  }}
                >
                  {/* Big Animated Play Button */}
                  <div
                    className="tc-play-btn"
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: '50%',
                      background: 'var(--primary)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 28,
                      marginBottom: 16,
                      paddingLeft: 4,
                      boxShadow: '0 8px 24px rgba(15, 92, 94, 0.4)'
                    }}
                  >
                    ▶
                  </div>

                  <span style={{ background: 'rgba(201, 166, 107, 0.25)', border: '1px solid #C9A66B', color: '#F5EDD9', padding: '3px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 10, letterSpacing: '0.04em' }}>
                    Click To Watch Masterclass
                  </span>

                  <h3 style={{ color: '#FFFFFF', fontSize: 19, margin: '0 0 8px 0', maxWidth: 540, lineHeight: 1.35, textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>
                    {activeLesson.title}
                  </h3>

                  <div style={{ display: 'flex', gap: 14, fontSize: 12.5, color: '#CBD5E1', alignItems: 'center' }}>
                    <span>⏱️ Duration: <strong>{activeLesson.duration}</strong></span>
                    <span>•</span>
                    <span>📹 HD 1080p Masterclass</span>
                    <span>•</span>
                    <span>🔊 Tamil / English Audio</span>
                  </div>
                </div>
              ) : videoMode === 'youtube' ? (
                /* YOUTUBE EMBED PLAYER */
                <iframe
                  key={`yt-${activeLesson.id}`}
                  src={`https://www.youtube.com/embed/${activeLesson.youtubeId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`}
                  title={activeLesson.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    display: 'block'
                  }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                /* HTML5 DIRECT VIDEO PLAYER */
                <video
                  ref={videoRef}
                  key={`mp4-${activeLesson.id}`}
                  src={activeLesson.videoUrl}
                  poster={activeLesson.poster}
                  controls
                  autoPlay
                  playsInline
                  onEnded={() => handleMarkComplete(activeLesson.id)}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    backgroundColor: '#000000'
                  }}
                >
                  Your browser does not support HTML5 video playback.
                </video>
              )}
            </div>

            {/* PLAYER FOOTER BAR */}
            <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', background: 'var(--bg-card)' }}>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: 'var(--primary-dark)' }}>
                  {activeLesson.title}
                </h2>
                <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 4 }}>
                  Module {activeLesson.id} of {modules.length} • {activeLesson.duration} • Trainer: <strong>Lakshmi Devi</strong>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                {isPlaying && (
                  <button
                    type="button"
                    onClick={() => setIsPlaying(false)}
                    style={{
                      background: 'transparent',
                      border: '1px solid var(--border)',
                      borderRadius: 6,
                      padding: '8px 12px',
                      fontSize: 12.5,
                      color: 'var(--text-secondary)',
                      cursor: 'pointer'
                    }}
                  >
                    ⏹ Reset Screen
                  </button>
                )}
                <Button
                  variant={activeLesson.completed ? 'secondary' : 'primary'}
                  onClick={() => handleMarkComplete(activeLesson.id)}
                >
                  {activeLesson.completed ? '✓ Lesson Completed' : 'Mark Lesson Complete'}
                </Button>
              </div>
            </div>
          </div>

          {/* LESSON TRANSCRIPT & PATTERN DOWNLOADS */}
          <div className="card">
            <div style={{ display: 'flex', gap: 12, borderBottom: '1px solid var(--border-light)', paddingBottom: 12, marginBottom: 16 }}>
              <button
                type="button"
                className={`btn btn-sm ${tab === 'notes' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setTab('notes')}
              >
                📖 Lesson Notes & Steps
              </button>
              <button
                type="button"
                className={`btn btn-sm ${tab === 'downloads' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setTab('downloads')}
              >
                📥 Pattern PDF Downloads
              </button>
            </div>

            {tab === 'notes' ? (
              <div style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--text-main)' }}>
                <h4 style={{ marginBottom: 6, color: 'var(--primary-dark)' }}>Key Steps for this Technique:</h4>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 12 }}>
                  {activeLesson.description}
                </p>
                <ul style={{ paddingLeft: 20, marginBottom: 14 }}>
                  <li>Maintain thread tension at dial level 4 for smooth double-stitch feed.</li>
                  <li>Ensure the armhole notch lines up with the side seam to prevent shoulder puckering.</li>
                  <li>Press open all seam allowances with a warm iron before attaching neck piping.</li>
                </ul>
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '12px 16px', borderRadius: 8, fontSize: 13, color: '#475569' }}>
                  💡 <strong>Student Assignment:</strong> After practicing this lesson technique on your fabric swatch, upload a photo on the <Link to="/student/assignments" style={{ color: 'var(--primary)', fontWeight: 600 }}>Practical Assignments</Link> tab to receive feedback and certification credit from Master Lakshmi Devi.
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ padding: 12, background: 'var(--bg-subtle)', borderRadius: 6, border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>Standard Bodice Pattern (Size 36)</strong>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>PDF • 1.4 MB • Printable 1:1 Scale</div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => alert('Downloading Bodice Pattern PDF (Size 36)...')}>Download</Button>
                </div>
                <div style={{ padding: 12, background: 'var(--bg-subtle)', borderRadius: 6, border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>Peacock Motif Aari Trace Stencil</strong>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>PDF • 850 KB • Carbon Tracing Ready</div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => alert('Downloading Peacock Motif Aari Trace Stencil PDF...')}>Download</Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SIDE PLAYLIST */}
        <div className="card" style={{ padding: 18, height: 'fit-content' }}>
          <div style={{ marginBottom: 14 }}>
            <h3 style={{ fontSize: 15, margin: '0 0 6px 0', color: 'var(--primary-dark)' }}>Course Syllabus Playlist</h3>
            <ProgressBar value={progressPercent} height={6} showLabel />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {modules.map((m) => {
              const isCurrent = m.id === activeLessonId

              return (
                <div
                  key={m.id}
                  className="tc-lesson-item"
                  style={{
                    padding: 12,
                    borderRadius: 8,
                    border: isCurrent ? '1.5px solid var(--primary)' : '1px solid var(--border-light)',
                    background: isCurrent ? 'rgba(15, 92, 94, 0.08)' : m.completed ? 'var(--bg-card)' : 'var(--bg-subtle)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                  onClick={() => handleSelectLesson(m.id)}
                >
                  <div style={{ fontSize: 13, flex: 1, paddingRight: 10 }}>
                    <div style={{ fontWeight: isCurrent ? 700 : 500, color: isCurrent ? 'var(--primary-dark)' : 'var(--text-main)', marginBottom: 2 }}>
                      {m.title}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{m.duration}</span>
                      {isCurrent && isPlaying && (
                        <span style={{ fontSize: 10.5, color: '#0F5C5E', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
                          <span>▶</span> Playing
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    {m.completed ? (
                      <span style={{ color: '#166534', fontWeight: 800, fontSize: 15, background: '#DCFCE7', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        ✓
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>○</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div style={{ marginTop: 20, paddingTop: 14, borderTop: '1px solid var(--border-light)' }}>
            <Link to="/student/quizzes">
              <Button variant="primary" size="sm" block>
                Take Course Completion Quiz →
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
