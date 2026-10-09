import React from 'react'

export default function Drawer({ isOpen, onClose, title, children, width = '420px' }) {
  if (!isOpen) return null

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 92, 94, 0.4)',
          backdropFilter: 'blur(3px)',
          transition: 'opacity 0.2s'
        }}
      />
      {/* Drawer Content */}
      <div
        style={{
          position: 'relative',
          width,
          maxWidth: '100vw',
          height: '100%',
          backgroundColor: '#FFFFFF',
          boxShadow: '-8px 0 32px rgba(15, 92, 94, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1001,
          animation: 'slideInRight 0.25s ease-out'
        }}
      >
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #E3E8E6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 700, color: '#0F5C5E' }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer', color: '#667085' }}
          >
            ✕
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
