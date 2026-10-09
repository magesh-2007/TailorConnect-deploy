import React from 'react'

const STITCHING_STEPS = [
  { status: 'REQUEST_RECEIVED', label: 'Order Placed', icon: '📝' },
  { status: 'ACCEPTED', label: 'Tailor Accepted', icon: '🤝' },
  { status: 'MEASUREMENT_VERIFIED', label: 'Measurements Confirmed', icon: '📏' },
  { status: 'DESIGN_CONFIRMED', label: 'Design Finalized', icon: '🎨' },
  { status: 'CUTTING', label: 'Fabric Cutting', icon: '✂️' },
  { status: 'STITCHING_STARTED', label: 'Stitching In Progress', icon: '🪡' },
  { status: 'EMBROIDERY', label: 'Aari Embroidery', icon: '✨' },
  { status: 'FINISHING', label: 'Finishing & Pressing', icon: '👔' },
  { status: 'QUALITY_CHECK', label: 'Quality Check', icon: '🔎' },
  { status: 'READY', label: 'Ready for Delivery', icon: '📦' },
  { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: '🚚' },
  { status: 'DELIVERED', label: 'Delivered', icon: '🎉' },
  { status: 'COMPLETED', label: 'Completed', icon: '⭐' }
]

export default function Timeline({ currentStatus = 'REQUEST_RECEIVED', progress = 10 }) {
  const currentIndex = STITCHING_STEPS.findIndex(s => s.status === currentStatus)
  const activeIndex = currentIndex >= 0 ? currentIndex : 0

  return (
    <div style={{ padding: '16px 0' }}>
      {/* Progress percentage bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#667085' }}>Live Stitching Progress</span>
        <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F5C5E' }}>{progress}% Complete</span>
      </div>
      <div style={{ height: '8px', backgroundColor: '#E3E8E6', borderRadius: '4px', overflow: 'hidden', marginBottom: '24px' }}>
        <div style={{ height: '100%', width: `${progress}%`, backgroundColor: '#0F5C5E', transition: 'width 0.4s ease' }} />
      </div>

      {/* Stepper Node List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {STITCHING_STEPS.map((step, idx) => {
          const isDone = idx < activeIndex
          const isCurrent = idx === activeIndex

          return (
            <div key={step.status} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              {/* Node Icon Circle */}
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  fontWeight: 700,
                  backgroundColor: isDone ? '#EDFAF3' : isCurrent ? '#0F5C5E' : '#FCFBF7',
                  color: isDone ? '#246040' : isCurrent ? '#FFFFFF' : '#9CA3AF',
                  border: isDone ? '2px solid #A7E0C4' : isCurrent ? '2px solid #0F5C5E' : '2px solid #E3E8E6',
                  boxShadow: isCurrent ? '0 0 0 4px rgba(15,92,94,0.15)' : 'none'
                }}
              >
                {isDone ? '✓' : step.icon}
              </div>

              {/* Node Details */}
              <div style={{ flex: 1, paddingTop: '4px' }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: isCurrent ? 700 : isDone ? 600 : 500,
                  color: isCurrent ? '#0F5C5E' : isDone ? '#263238' : '#9CA3AF'
                }}>
                  {step.label}
                  {isCurrent && <span style={{ marginLeft: '8px', fontSize: '11px', backgroundColor: '#DDEBE7', color: '#0F5C5E', padding: '2px 8px', borderRadius: '10px' }}>Active</span>}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
