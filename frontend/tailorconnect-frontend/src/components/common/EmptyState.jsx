import React from 'react'

export default function EmptyState({ icon = '🧶', title = 'No items found', description = 'There is no data to display right now.', actionText, onAction }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E3E8E6', margin: '20px 0' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>{icon}</div>
      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: 700, color: '#0F5C5E', margin: '0 0 8px 0' }}>
        {title}
      </h3>
      <p style={{ color: '#667085', fontSize: '14px', maxWidth: '400px', margin: '0 auto 20px auto' }}>
        {description}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          style={{
            backgroundColor: '#0F5C5E',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '10px',
            padding: '10px 22px',
            fontWeight: 700,
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          {actionText}
        </button>
      )}
    </div>
  )
}
