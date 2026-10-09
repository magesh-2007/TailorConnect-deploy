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

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
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
  </React.StrictMode>,
)
