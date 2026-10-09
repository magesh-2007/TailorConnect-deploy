import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * ProtectedRoute
 *
 * Guards a route by:
 * 1. Requiring the user to be authenticated (valid JWT in localStorage, verified by /api/auth/me).
 * 2. Optionally requiring a specific role (case-insensitive).
 *
 * Security behaviour:
 * - Not authenticated + admin route  → redirect to /admin/login
 * - Not authenticated + other route  → redirect to /login
 * - Wrong role on admin route        → show UnauthorizedAccess component (no redirect to their dashboard)
 * - Wrong role on non-admin route    → redirect to their own dashboard
 *
 * NOTE: Backend API routes *also* enforce ADMIN role via JWT middleware.
 * This component is a supplementary frontend guard.
 */

function UnauthorizedAccess({ user }) {
  const dashboardPath = user?.role ? `/${user.role.toLowerCase()}/dashboard` : '/login'
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0F1C2E 0%, #0F5C5E 60%, #0A4547 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', sans-serif",
      padding: 24,
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: 18,
        padding: '48px 40px',
        maxWidth: 480,
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 24px 80px rgba(0,0,0,0.35)',
      }}>
        {/* Shield Icon */}
        <div style={{
          width: 72, height: 72,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #FEF2F2, #FECACA)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
          fontSize: 32,
        }}>🚫</div>

        <h1 style={{
          fontSize: 24, fontWeight: 800,
          color: '#991B1B', margin: '0 0 10px',
          fontFamily: "'Outfit', sans-serif",
        }}>Unauthorized Access</h1>

        <p style={{
          fontSize: 14.5, color: '#6B7280',
          lineHeight: 1.6, margin: '0 0 8px',
        }}>
          You do not have permission to access the Admin Dashboard.
        </p>

        <p style={{
          fontSize: 13.5, color: '#9CA3AF',
          lineHeight: 1.6, margin: '0 0 28px',
        }}>
          Your account role is{' '}
          <strong style={{ color: '#374151', textTransform: 'uppercase' }}>
            {user?.role || 'Unknown'}
          </strong>
          . Only platform administrators may access this area.
        </p>

        {/* Security notice */}
        <div style={{
          background: '#FFF7ED',
          border: '1px solid #FED7AA',
          borderRadius: 9,
          padding: '10px 14px',
          marginBottom: 24,
          fontSize: 12.5,
          color: '#92400E',
          lineHeight: 1.5,
          textAlign: 'left',
        }}>
          🔒 This access attempt has been blocked. Admin routes are protected by both
          frontend guards and backend JWT verification. Unauthorized access is logged.
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <a
            href={dashboardPath}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '10px 20px',
              background: '#0F5C5E',
              color: '#FFFFFF',
              borderRadius: 8,
              textDecoration: 'none',
              fontSize: 14, fontWeight: 600,
              transition: 'background 0.18s',
            }}
          >
            ← Go to My Dashboard
          </a>
          <a
            href="/login"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '10px 20px',
              background: 'transparent',
              color: '#6B7280',
              border: '1.5px solid #E5E7EB',
              borderRadius: 8,
              textDecoration: 'none',
              fontSize: 14, fontWeight: 600,
            }}
          >
            Sign Out
          </a>
        </div>
      </div>
    </div>
  )
}

export default function ProtectedRoute({ role, children }) {
  const { user } = useAuth()
  const location = useLocation()

  const isAdminRoute = location.pathname.startsWith('/admin')

  if (!user) {
    // Unauthenticated — send to appropriate login page
    if (isAdminRoute) {
      return <Navigate to="/admin/login" replace />
    }
    return <Navigate to="/login" replace />
  }

  if (role && user.role?.toLowerCase() !== role?.toLowerCase()) {
    // Platform administrators have universal access to view and use all portals
    if (user.role?.toLowerCase() === 'admin') {
      return children
    }

    // Authenticated but wrong role
    if (isAdminRoute) {
      return <UnauthorizedAccess user={user} />
    }
    // For other non-admin routes, redirect to their actual dashboard
    return <Navigate to={`/${user.role?.toLowerCase()}/dashboard`} replace />
  }

  return children
}
