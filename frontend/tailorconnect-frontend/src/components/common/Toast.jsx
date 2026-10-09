import React, { useEffect } from 'react'

export default function Toast({ message, type = 'info', onClose, duration = 4000 }) {
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => {
      onClose && onClose()
    }, duration)
    return () => clearTimeout(timer)
  }, [message, duration, onClose])

  if (!message) return null

  const bgMap = {
    success: '#EDFAF3',
    danger: '#FEF3F3',
    warning: '#FDF6EC',
    info: '#EEF6F8'
  }
  const borderMap = {
    success: '#A7E0C4',
    danger: '#F5C0C0',
    warning: '#F0D09A',
    info: '#A8D4DB'
  }
  const textMap = {
    success: '#246040',
    danger: '#8B2020',
    warning: '#7A5620',
    info: '#1D4E57'
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        backgroundColor: bgMap[type] || bgMap.info,
        border: `1px solid ${borderMap[type] || borderMap.info}`,
        color: textMap[type] || textMap.info,
        padding: '14px 20px',
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(15,92,94,0.12)',
        fontWeight: 600,
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        animation: 'slideUp 0.25s ease-out'
      }}
    >
      <span>{type === 'success' ? '✓' : type === 'danger' ? '⚠️' : 'ℹ️'}</span>
      <span>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', marginLeft: '12px', fontSize: '16px' }}>
        ✕
      </button>
    </div>
  )
}
