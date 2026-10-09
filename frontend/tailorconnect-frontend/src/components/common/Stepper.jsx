import React from 'react'

export default function Stepper({ steps = [], currentStep = 0, onStepClick }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '32px', overflowX: 'auto', paddingBottom: '8px' }}>
      {steps.map((step, idx) => {
        const isDone = idx < currentStep
        const isCurrent = idx === currentStep

        return (
          <React.Fragment key={idx}>
            <div
              onClick={() => isDone && onStepClick && onStepClick(idx)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: isDone ? 'pointer' : 'default',
                opacity: isDone || isCurrent ? 1 : 0.5
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: isDone ? '#246040' : isCurrent ? '#0F5C5E' : '#FFFFFF',
                  color: isDone || isCurrent ? '#FFFFFF' : '#667085',
                  border: isDone ? '1px solid #A7E0C4' : isCurrent ? '2px solid #0F5C5E' : '1px solid #C8D5D2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '13px'
                }}
              >
                {isDone ? '✓' : idx + 1}
              </div>
              <span style={{ fontSize: '13px', fontWeight: isCurrent ? 700 : 500, color: isCurrent ? '#0F5C5E' : '#263238', whiteSpace: 'nowrap' }}>
                {step}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div style={{ flex: 1, minWidth: '20px', height: '2px', backgroundColor: idx < currentStep ? '#0F5C5E' : '#E3E8E6' }} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}
