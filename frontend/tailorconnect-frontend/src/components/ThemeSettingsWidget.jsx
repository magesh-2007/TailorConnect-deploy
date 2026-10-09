import React, { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'

export default function ThemeSettingsWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const { themeMode, toggleTheme, setThemeMode, primaryColor, setColor, resetTheme, presetColors } = useTheme()
  const { lang, setLang, t } = useLanguage()
  const { user, switchRole } = useAuth()

  const isDark = themeMode === 'dark'

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 9990,
          width: 52,
          height: 52,
          borderRadius: '50%',
          backgroundColor: primaryColor || '#0F5C5E',
          color: '#FFFFFF',
          border: '3px solid #FFFFFF',
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 22,
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isOpen ? 'rotate(90deg) scale(1.05)' : 'scale(1)',
        }}
        title="Change Language, Theme (Dark/Light) & Any Color"
        aria-label="Theme & Language Settings"
      >
        {isOpen ? '✕' : '🎨'}
      </button>

      {/* Floating Settings Drawer / Modal */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: 86,
            right: 24,
            zIndex: 9991,
            width: 330,
            backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
            color: isDark ? '#F8FAFC' : '#1E293B',
            borderRadius: 18,
            boxShadow: '0 16px 40px rgba(0,0,0,0.3)',
            border: isDark ? '1px solid #334155' : '1.5px solid #E2E8F0',
            padding: 20,
            fontFamily: 'system-ui, -apple-system, sans-serif',
            animation: 'slideUpFade 0.2s ease-out',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottom: isDark ? '1px solid #334155' : '1px solid #F1F5F9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>🎨</span>
              <strong style={{ fontSize: 15, fontWeight: 700 }}>
                {t('settings') || 'Personalize App'}
              </strong>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: isDark ? '#94A3B8' : '#64748B',
                fontSize: 16,
                cursor: 'pointer',
                padding: '2px 6px',
              }}
            >
              ✕
            </button>
          </div>

          {/* 1. Language Section */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: isDark ? '#94A3B8' : '#64748B', marginBottom: 8, textTransform: 'uppercase' }}>
              🌐 {t('language') || 'Language'}
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
              {[
                { code: 'en', label: 'English' },
                { code: 'ta', label: 'தமிழ் (Tamil)' },
                { code: 'hi', label: 'हिंदी (Hindi)' },
                { code: 'tanglish', label: 'Tanglish' },
              ].map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => setLang(item.code)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: lang === item.code ? `2px solid ${primaryColor}` : isDark ? '1px solid #334155' : '1px solid #E2E8F0',
                    backgroundColor: lang === item.code ? (isDark ? '#334155' : '#F0FDF4') : isDark ? '#0F172A' : '#F8FAFC',
                    color: lang === item.code ? primaryColor : isDark ? '#CBD5E1' : '#475569',
                    transition: 'all 0.15s',
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Theme Mode Section (Dark / Light) */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: isDark ? '#94A3B8' : '#64748B', marginBottom: 8, textTransform: 'uppercase' }}>
              🌓 {t('theme') || 'Theme Mode'}
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={() => setThemeMode('light')}
                style={{
                  flex: 1,
                  padding: '9px 12px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: !isDark ? `2px solid ${primaryColor}` : '1px solid #334155',
                  backgroundColor: !isDark ? '#F1F5F9' : '#0F172A',
                  color: !isDark ? '#0F172A' : '#94A3B8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <span>☀️</span> {t('lightMode') || 'Light'}
              </button>
              <button
                type="button"
                onClick={() => setThemeMode('dark')}
                style={{
                  flex: 1,
                  padding: '9px 12px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: isDark ? `2px solid ${primaryColor}` : '1px solid #E2E8F0',
                  backgroundColor: isDark ? '#334155' : '#F8FAFC',
                  color: isDark ? '#F8FAFC' : '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <span>🌙</span> {t('darkMode') || 'Dark'}
              </button>
            </div>
          </div>

          {/* 3. Theme Color Swatches & ANY Color Picker */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: isDark ? '#94A3B8' : '#64748B', textTransform: 'uppercase' }}>
                🎨 {t('themeColor') || 'Accent Color (Any Color)'}
              </label>
              <span style={{ fontSize: 11, fontFamily: 'monospace', color: primaryColor, fontWeight: 700 }}>
                {primaryColor}
              </span>
            </div>

            {/* Presets */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              {presetColors.map((color) => {
                const isSelected = primaryColor?.toLowerCase() === color.hex?.toLowerCase()
                return (
                  <button
                    key={color.hex}
                    type="button"
                    onClick={() => setColor(color.hex)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      backgroundColor: color.hex,
                      border: isSelected ? '3px solid #FFFFFF' : '2px solid transparent',
                      boxShadow: isSelected ? `0 0 0 2px ${color.hex}` : 'none',
                      cursor: 'pointer',
                      outline: 'none',
                      transition: 'transform 0.15s',
                      transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                    }}
                    title={color.name}
                  />
                )
              })}
            </div>

            {/* ANY Color Input Picker */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 12px',
                borderRadius: 10,
                backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
              }}
            >
              <input
                type="color"
                value={primaryColor || '#0F5C5E'}
                onChange={(e) => setColor(e.target.value)}
                style={{
                  width: 34,
                  height: 34,
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  backgroundColor: 'transparent',
                }}
                id="custom-color-picker"
              />
              <div style={{ flex: 1 }}>
                <span style={{ display: 'block', fontSize: 12, fontWeight: 600 }}>
                  {t('customColor') || 'Pick Any Custom Color'}
                </span>
                <span style={{ fontSize: 11, color: isDark ? '#94A3B8' : '#64748B' }}>
                  Click palette to pick any color
                </span>
              </div>
            </div>
          </div>

          {/* 4. Quick Role Switcher (Switch to Customer instantly) */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: isDark ? '#94A3B8' : '#64748B', marginBottom: 8, textTransform: 'uppercase' }}>
              👤 Switch Account / Role
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
              <button
                type="button"
                onClick={() => { switchRole('customer'); setIsOpen(false); }}
                style={{
                  padding: '7px 8px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                  border: user?.role?.toLowerCase() === 'customer' ? '2px solid #0284C7' : '1px solid #BAE6FD',
                  backgroundColor: '#E0F2FE', color: '#0369A1'
                }}
              >
                👤 Customer {user?.role?.toLowerCase() === 'customer' && '✓'}
              </button>
              <button
                type="button"
                onClick={() => { switchRole('tailor'); setIsOpen(false); }}
                style={{
                  padding: '7px 8px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                  border: user?.role?.toLowerCase() === 'tailor' ? '2px solid #D97706' : '1px solid #FDE68A',
                  backgroundColor: '#FEF3C7', color: '#92400E'
                }}
              >
                ✂️ Tailor {user?.role?.toLowerCase() === 'tailor' && '✓'}
              </button>
              <button
                type="button"
                onClick={() => { switchRole('student'); setIsOpen(false); }}
                style={{
                  padding: '7px 8px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                  border: user?.role?.toLowerCase() === 'student' ? '2px solid #059669' : '1px solid #A7F3D0',
                  backgroundColor: '#ECFDF5', color: '#065F46'
                }}
              >
                🎓 Student {user?.role?.toLowerCase() === 'student' && '✓'}
              </button>
              <button
                type="button"
                onClick={() => { switchRole('admin'); setIsOpen(false); }}
                style={{
                  padding: '7px 8px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                  border: user?.role?.toLowerCase() === 'admin' ? '2px solid #9333EA' : '1px solid #E9D5FF',
                  backgroundColor: '#F3E8FF', color: '#6B21A8'
                }}
              >
                👑 Admin {user?.role?.toLowerCase() === 'admin' && '✓'}
              </button>
            </div>
          </div>

          {/* Footer Reset */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8, borderTop: isDark ? '1px solid #334155' : '1px solid #F1F5F9' }}>
            <button
              type="button"
              onClick={resetTheme}
              style={{
                background: 'none',
                border: 'none',
                color: isDark ? '#94A3B8' : '#64748B',
                fontSize: 12,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Reset to Default Teal
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUpFade {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  )
}
