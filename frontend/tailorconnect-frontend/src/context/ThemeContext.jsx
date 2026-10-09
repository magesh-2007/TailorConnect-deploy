import React, { createContext, useContext, useState, useEffect } from 'react'

export const PRESET_COLORS = [
  { name: 'Deep Teal (Default)', hex: '#0F5C5E' },
  { name: 'Royal Purple',        hex: '#7C3AED' },
  { name: 'Crimson Ruby',        hex: '#E11D48' },
  { name: 'Ocean Sapphire',      hex: '#2563EB' },
  { name: 'Emerald Green',       hex: '#059669' },
  { name: 'Sunset Orange',       hex: '#EA580C' },
  { name: 'Golden Amber',        hex: '#D97706' },
  { name: 'Rose Pink',           hex: '#DB2777' },
  { name: 'Indigo Night',        hex: '#4F46E5' },
  { name: 'Slate Gray',          hex: '#475569' },
]

const ThemeContext = createContext()

function hexToRgba(hex, alpha = 1) {
  const cleanHex = hex.replace('#', '')
  const num = parseInt(cleanHex, 16)
  const r = (num >> 16) & 255
  const g = (num >> 8) & 255
  const b = num & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function adjustBrightness(hex, percent) {
  const cleanHex = hex.replace('#', '')
  const num = parseInt(cleanHex, 16)
  let r = (num >> 16) + Math.round(2.55 * percent)
  let g = ((num >> 8) & 0x00ff) + Math.round(2.55 * percent)
  let b = (num & 0x0000ff) + Math.round(2.55 * percent)
  r = Math.min(255, Math.max(0, r))
  g = Math.min(255, Math.max(0, g))
  b = Math.min(255, Math.max(0, b))
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

export function ThemeProvider({ children }) {
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('tc_theme_mode') || 'light'
  })

  const [primaryColor, setPrimaryColor] = useState(() => {
    return localStorage.getItem('tc_theme_color') || '#0F5C5E'
  })

  // Apply theme & color to root document
  useEffect(() => {
    const root = document.documentElement
    localStorage.setItem('tc_theme_mode', themeMode)
    localStorage.setItem('tc_theme_color', primaryColor)

    // Set data-theme on html
    root.setAttribute('data-theme', themeMode)
    if (themeMode === 'dark') {
      document.body.classList.add('dark-mode')
      root.style.setProperty('--bg-page', '#0F172A')
      root.style.setProperty('--bg-card', '#1E293B')
      root.style.setProperty('--bg-surface', '#1E293B')
      root.style.setProperty('--bg-subtle', '#334155')
      root.style.setProperty('--bg-hover', '#2A374A')
      root.style.setProperty('--text-primary', '#F8FAFC')
      root.style.setProperty('--text-main', '#F8FAFC')
      root.style.setProperty('--text-secondary', '#94A3B8')
      root.style.setProperty('--border', '#334155')
      root.style.setProperty('--border-light', '#1E293B')
      root.style.setProperty('--border-strong', '#475569')
    } else {
      document.body.classList.remove('dark-mode')
      root.style.setProperty('--bg-page', '#FCFBF7')
      root.style.setProperty('--bg-card', '#FFFFFF')
      root.style.setProperty('--bg-surface', '#FFFFFF')
      root.style.setProperty('--bg-subtle', '#F2F6F5')
      root.style.setProperty('--bg-hover', '#E8F0EF')
      root.style.setProperty('--text-primary', '#263238')
      root.style.setProperty('--text-main', '#263238')
      root.style.setProperty('--text-secondary', '#667085')
      root.style.setProperty('--border', '#E3E8E6')
      root.style.setProperty('--border-light', '#EDF1EF')
      root.style.setProperty('--border-strong', '#C8D5D2')
    }

    // Apply primary color
    if (primaryColor && primaryColor.startsWith('#')) {
      const hover = adjustBrightness(primaryColor, -12)
      const dark = adjustBrightness(primaryColor, -20)
      const light = adjustBrightness(primaryColor, 15)
      const subtle = hexToRgba(primaryColor, 0.14)

      root.style.setProperty('--primary', primaryColor)
      root.style.setProperty('--primary-hover', hover)
      root.style.setProperty('--primary-dark', dark)
      root.style.setProperty('--primary-light', light)
      root.style.setProperty('--primary-subtle', subtle)
      root.style.setProperty('--bg-sidebar', primaryColor)
      root.style.setProperty('--bg-sidebar-hover', hover)
      root.style.setProperty('--bg-sidebar-active', dark)
      root.style.setProperty('--border-focus', primaryColor)
      root.style.setProperty('--text-navy', primaryColor)
    }
  }, [themeMode, primaryColor])

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  const setColor = (hex) => {
    if (hex && hex.startsWith('#')) {
      setPrimaryColor(hex)
    }
  }

  const resetTheme = () => {
    setThemeMode('light')
    setPrimaryColor('#0F5C5E')
  }

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        setThemeMode,
        toggleTheme,
        primaryColor,
        setColor,
        resetTheme,
        presetColors: PRESET_COLORS,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    return {
      themeMode: 'light',
      setThemeMode: () => {},
      toggleTheme: () => {},
      primaryColor: '#0F5C5E',
      setColor: () => {},
      resetTheme: () => {},
      presetColors: PRESET_COLORS,
    }
  }
  return context
}
