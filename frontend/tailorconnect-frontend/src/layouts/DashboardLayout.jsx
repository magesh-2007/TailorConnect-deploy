import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import ChatbotWidget from '../components/ChatbotWidget'

const LINKS = {
  customer: [
    { to: '/customer/dashboard',     label: 'Dashboard',          icon: '📊', end: true },
    { to: '/customer/tailors',       label: 'Find Tailors',       icon: '🔍' },
    { to: '/customer/orders',        label: 'Tailoring Requests', icon: '✂️' },
    { to: '/customer/appointments',  label: 'Appointments',       icon: '📅' },
    { to: '/customer/payments',      label: 'Payments & Invoices',icon: '💳' },
    { to: '/customer/wishlist',      label: 'Wishlist',           icon: '❤️' },
    { to: '/customer/chatbot',       label: 'Chatbot',            icon: '🤖' },
    { to: '/customer/chat',          label: 'Messages',           icon: '💬' },
    { to: '/customer/notifications', label: 'Notifications',      icon: '🔔' },
    { to: '/customer/profile',       label: 'Profile',            icon: '👤' },
    { to: '/customer/settings',      label: 'Settings',           icon: '⚙️' },
  ],
  tailor: [
    { to: '/tailor/dashboard', label: 'Dashboard', icon: '📊', end: true },
    { to: '/tailor/orders', label: 'Incoming Requests', icon: '📥' },
    { to: '/tailor/quotations', label: 'Quotations', icon: '🏷️' },
    { to: '/tailor/progress', label: 'Stitching Progress', icon: '🧵' },
    { to: '/tailor/offers', label: 'Offers & Discounts', icon: '🎁' },
    { to: '/tailor/services', label: 'My Services', icon: '✂️' },
    { to: '/tailor/courses', label: 'My Courses', icon: '📚' },
    { to: '/tailor/appointments', label: 'Appointments', icon: '📅' },
    { to: '/tailor/portfolio', label: 'Portfolio', icon: '🖼️' },
    { to: '/tailor/payments', label: 'Payments', icon: '💳' },
    { to: '/tailor/customers', label: 'Customers', icon: '👥' },
    { to: '/tailor/chat', label: 'Messages', icon: '💬' },
    { to: '/tailor/notifications', label: 'Notifications', icon: '🔔' },
    { to: '/tailor/reviews', label: 'Reviews', icon: '⭐' },
    { to: '/tailor/profile', label: 'Profile', icon: '👤' },
    { to: '/tailor/settings', label: 'Settings', icon: '⚙️' },
  ],
  student: [
    { to: '/student/dashboard', label: 'Dashboard', icon: '📊', end: true },
    { to: '/student/courses', label: 'Browse Courses', icon: '🔍' },
    { to: '/student/my-courses', label: 'My Courses', icon: '📚' },
    { to: '/student/lessons', label: 'Lessons', icon: '🎥' },
    { to: '/student/assignments', label: 'Assignments', icon: '📝' },
    { to: '/student/certificates', label: 'Certificates', icon: '🏆' },
    { to: '/student/progress', label: 'Progress', icon: '📈' },
    { to: '/student/chat', label: 'Messages', icon: '💬' },
    { to: '/student/notifications', label: 'Notifications', icon: '🔔' },
    { to: '/student/profile', label: 'Profile', icon: '👤' },
    { to: '/student/settings', label: 'Settings', icon: '⚙️' },
  ],
  admin: [
    { to: '/admin/dashboard',           label: 'Dashboard',             icon: '📊', end: true },
    { to: '/admin/users',               label: 'Users',                 icon: '👥' },
    { to: '/admin/customers',           label: 'Customers',             icon: '👗' },
    { to: '/admin/tailors',             label: 'Tailors',               icon: '🧵' },
    { to: '/admin/students',            label: 'Students',              icon: '🎓' },
    { to: '/admin/employees',           label: 'Employees',             icon: '🏢' },
    { to: '/admin/tailor-verification', label: 'Tailor Verification',   icon: '✅' },
    { to: '/admin/requests',            label: 'Tailoring Requests',    icon: '📦' },
    { to: '/admin/appointments',        label: 'Appointments',          icon: '📅' },
    { to: '/admin/payments',            label: 'Payments & Invoices',   icon: '💳' },
    { to: '/admin/courses',             label: 'Courses',               icon: '📚' },
    { to: '/admin/offers',              label: 'Offers',                icon: '🎁' },
    { to: '/admin/complaints',          label: 'Complaints',            icon: '⚠️' },
    { to: '/admin/notifications',       label: 'Notifications',         icon: '🔔' },
    { to: '/admin/reports',             label: 'Reports & Analytics',   icon: '📈' },
    { to: '/admin/settings',            label: 'Settings',              icon: '⚙️' },
  ],
  employee: [
    { to: '/employee/dashboard', label: 'Dashboard', icon: '📊', end: true },
    { to: '/employee/orders',    label: 'Orders',     icon: '📦' },
    { to: '/employee/profile',   label: 'Profile',    icon: '👤' },
    { to: '/employee/settings',  label: 'Settings',   icon: '⚙️' },
  ],
}

const TITLES = {
  customer: 'Customer Portal',
  tailor:   'Tailor Studio',
  student:  'Student Learning',
  admin:    'Admin Console',
  employee: 'Employee Portal',
}

export default function DashboardLayout({ role = 'customer', children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  // Close sidebar on route change on mobile
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  return (
    <div className="app-shell">
      {/* Mobile Backdrop */}
      <div 
        className={`sidebar-backdrop ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      <Sidebar 
        role={role}
        title={TITLES[role] || 'TailorConnect'} 
        links={LINKS[role] || []} 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="app-main">
        <Navbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        <main className="app-content">{children}</main>
        {role === 'customer' && <ChatbotWidget />}
      </div>
    </div>
  )
}
