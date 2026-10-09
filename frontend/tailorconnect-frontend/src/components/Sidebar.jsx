import React from 'react'
import { NavLink, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'

const LABEL_KEY_MAP = {
  'Dashboard': 'dashboard',
  'Find Tailors': 'findTailors',
  'Tailors': 'tailors',
  'Tailoring Requests': 'tailoringRequests',
  'Incoming Requests': 'incomingRequests',
  'Appointments': 'appointments',
  'Payments & Invoices': 'payments',
  'Payments': 'payments',
  'Wishlist': 'wishlist',
  'Chatbot': 'chatbot',
  'AI Chatbot': 'chatbot',
  'Stitch AI': 'chatbot',
  'Messages': 'chat',
  'Notifications': 'notifications',
  'Profile': 'profile',
  'Settings': 'settings',
  'Quotations': 'quotations',
  'Stitching Progress': 'stitchingProgress',
  'Offers & Discounts': 'offers',
  'Offers': 'offers',
  'My Services': 'myServices',
  'My Courses': 'myCourses',
  'Browse Courses': 'browseCourses',
  'Courses': 'courses',
  'Portfolio': 'portfolio',
  'Reviews': 'reviews',
  'Customers': 'customers',
  'Users': 'users',
  'Students': 'students',
  'Employees': 'employees',
  'Tailor Verification': 'tailorVerification',
  'Complaints': 'complaints',
  'Reports & Analytics': 'reports',
  'Lessons': 'lessons',
  'Assignments': 'assignments',
  'Certificates': 'certificates',
  'Progress': 'progress',
  'Orders': 'orders',
}

const ROLE_TITLES = {
  customer: 'Customer Portal',
  tailor:   'Tailor Studio',
  student:  'Student Learning',
  admin:    'Admin Console',
  employee: 'Employee Portal',
}

export default function Sidebar({ role = 'customer', title, links = [], isOpen = false, onClose }) {
  const { logout } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const rawTitle = title || ROLE_TITLES[role] || 'TailorConnect'
  const displayTitle = t(rawTitle) || rawTitle

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`} role="navigation" aria-label="Main navigation">
      {/* ── Header: Logo + Brand ── */}
      <div className="sidebar-header">
        <Link
          to={`/${role}/dashboard`}
          className="sidebar-brand"
          onClick={onClose}
          style={{ textDecoration: 'none' }}
        >
          <img
            src="/logo.jpg"
            alt="TailorConnect"
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              objectFit: 'cover',
              border: '1.5px solid #C9A66B',
              flexShrink: 0,
            }}
          />
          <span className="sidebar-brand-text">
            Tailor<span>Connect</span>
          </span>
        </Link>

        <button
          type="button"
          className="sidebar-close-btn"
          onClick={onClose}
          aria-label="Close navigation"
        >
          ✕
        </button>
      </div>

      {/* ── Role Badge ── */}
      <div style={{ padding: '10px 14px 6px' }}>
        <span className="sidebar-role-badge">{displayTitle}</span>
      </div>

      {/* ── Navigation Links ── */}
      <nav className="sidebar-nav">
        {links.map((link) => {
          const key = LABEL_KEY_MAP[link.label]
          const translatedLabel = t(link.label) || (key ? t(key) : link.label)
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={onClose}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              <span className="sidebar-icon" aria-hidden="true">{link.icon}</span>
              <span className="sidebar-label">{translatedLabel}</span>
              {link.badge && <span className="sidebar-badge">{link.badge}</span>}
            </NavLink>
          )
        })}

        {/* ── Logout ── */}
        <div className="sidebar-footer" style={{ marginTop: 'auto', paddingTop: 12 }}>
          <div
            style={{
              height: 1,
              background: 'rgba(255,255,255,0.08)',
              marginBottom: 10,
              marginLeft: -10,
              marginRight: -10,
            }}
          />
          <button
            type="button"
            onClick={handleLogout}
            className="sidebar-link"
            style={{
              background: 'transparent',
              border: 'none',
              width: '100%',
              cursor: 'pointer',
              textAlign: 'left',
              color: 'rgba(255,255,255,0.5)',
              transition: 'all 0.18s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#FFFFFF'
              e.currentTarget.style.background = 'rgba(180,83,83,0.15)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'rgba(255,255,255,0.5)'
              e.currentTarget.style.background = 'transparent'
            }}
          >
            <span className="sidebar-icon" aria-hidden="true">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </span>
            <span className="sidebar-label">{t('Sign Out') || t('logout') || 'Logout'}</span>
          </button>
        </div>
      </nav>
    </aside>
  )
}
