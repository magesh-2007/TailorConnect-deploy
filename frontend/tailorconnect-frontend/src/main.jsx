import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { LanguageProvider } from './context/LanguageContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import './index.css'

// ── Restore saved theme & font on startup ──────────────────────
;(function restoreSettings() {
  try {
    const raw = localStorage.getItem('tc_customer_settings')
    if (!raw) return
    const s = JSON.parse(raw)
    if (s.fontFamily) {
      document.body.style.fontFamily = s.fontFamily
      const fontName = s.fontFamily.replace(/'/g, '').split(',')[0].trim()
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.id = 'tc-dynamic-font'
      link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@400;500;600;700;800&display=swap`
      document.head.appendChild(link)
    }
    if (s.fontSize) document.body.style.fontSize = s.fontSize
  } catch (_) {}
})()

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '70129355960-akrov4hc7cmk8qu3mfj1rkehmf11dcbh.apps.googleusercontent.com'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, errorInfo) {
    console.error('App ErrorBoundary caught error:', error, errorInfo)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 32, textAlign: 'center', fontFamily: 'sans-serif' }}>
          <h2>Something went wrong</h2>
          <p style={{ color: '#666' }}>{this.state.error?.message || 'Unexpected application error'}</p>
          <button
            onClick={() => { localStorage.clear(); window.location.href = '/' }}
            style={{ padding: '8px 16px', background: '#0F5C5E', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
          >
            Reset and Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <BrowserRouter>
          <ThemeProvider>
            <LanguageProvider>
              <AuthProvider>
                <App />
              </AuthProvider>
            </LanguageProvider>
          </ThemeProvider>
        </BrowserRouter>
      </GoogleOAuthProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
