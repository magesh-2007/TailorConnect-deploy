import React from 'react'

export default function ConfirmDialog({ isOpen, title = 'Are you sure?', message = 'This action cannot be undone.', confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, onCancel, isDanger = false }) {
  if (!isOpen) return null

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={onCancel} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 92, 94, 0.4)', backdropFilter: 'blur(3px)' }} />
      <div style={{ position: 'relative', zIndex: 10000, width: '100%', maxWidth: '420px', backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '24px', boxShadow: '0 16px 40px rgba(15, 92, 94, 0.15)', border: '1px solid #E3E8E6' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 700, color: isDanger ? '#8B2020' : '#0F5C5E', marginTop: 0 }}>
          {title}
        </h3>
        <p style={{ color: '#667085', fontSize: '14px', marginBottom: '24px' }}>
          {message}
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button onClick={onCancel} style={{ padding: '9px 18px', borderRadius: '8px', border: '1px solid #C8D5D2', backgroundColor: '#FFFFFF', color: '#263238', fontWeight: 600, cursor: 'pointer' }}>
            {cancelText}
          </button>
          <button onClick={onConfirm} style={{ padding: '9px 18px', borderRadius: '8px', border: 'none', backgroundColor: isDanger ? '#B45353' : '#0F5C5E', color: '#FFFFFF', fontWeight: 700, cursor: 'pointer' }}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
