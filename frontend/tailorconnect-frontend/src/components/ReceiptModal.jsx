import React, { useState } from 'react'
import {
  downloadReceiptPdf,
  printReceiptFormatted,
  shareReceiptWhatsApp,
  shareReceiptEmail,
  copyReceiptLink
} from '../utils/receiptPdf'

export default function ReceiptModal({ receipt, onClose }) {
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)

  if (!receipt) return null

  const handleDownloadPdf = async () => {
    try {
      setDownloading(true)
      downloadReceiptPdf(receipt)
      setTimeout(() => setDownloading(false), 800)
    } catch (err) {
      console.error('Failed to download PDF:', err)
      setDownloading(false)
      // Fallback to print
      window.print()
    }
  }

  const handleCopyLink = async () => {
    try {
      await copyReceiptLink(receipt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch (e) {
      console.error(e)
    }
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Receipt ${receipt.id} - TailorConnect`,
          text: `TailorConnect Official Receipt for ${receipt.title} (₹${receipt.amount}.00)`,
          url: `${window.location.origin}/tracking/${receipt.referenceId || receipt.id}`
        })
      } catch (err) {
        // User cancelled or not supported
      }
    } else {
      handleCopyLink()
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px',
        animation: 'tcFadeIn 0.2s ease-out'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: 520,
          width: '100%',
          backgroundColor: '#FFFFFF',
          borderRadius: 14,
          boxShadow: '0 20px 40px -15px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.06)',
          padding: 24,
          position: 'relative',
          overflow: 'hidden',
          fontFamily: "'Outfit', 'Inter', system-ui, sans-serif"
        }}
      >
        {/* Top Decorative Border */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: 'linear-gradient(90deg, #0F5C5E 0%, #C9A66B 100%)'
          }}
        />

        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                backgroundColor: 'rgba(15, 92, 94, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18
              }}
            >
              🧾
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0F5C5E', margin: 0 }}>
                Official Payment Receipt
              </h2>
              <div style={{ fontSize: 11, color: '#166534', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                <span>✓ Verified & Escrow Settled</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              background: '#F3F4F6',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              color: '#4B5563',
              cursor: 'pointer',
              transition: 'background 0.15s'
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = '#E5E7EB')}
            onMouseOut={(e) => (e.currentTarget.style.background = '#F3F4F6')}
          >
            ✕
          </button>
        </div>

        {/* Receipt Content Card */}
        <div
          style={{
            background: '#F8F9FA',
            padding: '16px 18px',
            borderRadius: 10,
            border: '1px solid #E5E7EB',
            fontSize: 13,
            marginBottom: 16
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
            <span style={{ color: '#6B7280', fontWeight: 500 }}>Receipt ID:</span>
            <span style={{ color: '#0F5C5E', fontWeight: 700, letterSpacing: '0.02em' }}>{receipt.id}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
            <span style={{ color: '#6B7280', fontWeight: 500 }}>Transaction ID:</span>
            <span style={{ fontSize: 11.5, fontFamily: 'monospace', color: '#374151', fontWeight: 600 }}>
              {receipt.transactionId}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
            <span style={{ color: '#6B7280', fontWeight: 500 }}>Service / Order:</span>
            <span style={{ fontWeight: 600, color: '#1F2937', textAlign: 'right', maxWidth: '60%' }}>
              {receipt.title}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
            <span style={{ color: '#6B7280', fontWeight: 500 }}>Tailor Boutique:</span>
            <span style={{ fontWeight: 600, color: '#1F2937' }}>{receipt.tailorName}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
            <span style={{ color: '#6B7280', fontWeight: 500 }}>Payment Method:</span>
            <span style={{ color: '#374151' }}>{receipt.method}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
            <span style={{ color: '#6B7280', fontWeight: 500 }}>Date & Time:</span>
            <span style={{ color: '#374151' }}>{receipt.date}</span>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '2px dashed #D1D5DB',
              marginTop: 10,
              paddingTop: 10,
              fontSize: 16,
              fontWeight: 800,
              color: '#0F5C5E'
            }}
          >
            <span>Total Paid:</span>
            <span style={{ fontSize: 19, color: '#0F5C5E' }}>₹{Number(receipt.amount).toLocaleString()}.00</span>
          </div>
        </div>

        {/* Share Section */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.04em' }}>
            Share Receipt
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {/* WhatsApp */}
            <button
              type="button"
              onClick={() => shareReceiptWhatsApp(receipt)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '8px 10px',
                borderRadius: 7,
                border: '1px solid #BBF7D0',
                background: '#F0FDF4',
                color: '#166534',
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#DCFCE7'
                e.currentTarget.style.borderColor = '#86EFAC'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#F0FDF4'
                e.currentTarget.style.borderColor = '#BBF7D0'
              }}
            >
              <span style={{ fontSize: 15 }}>💬</span> WhatsApp
            </button>

            {/* Email */}
            <button
              type="button"
              onClick={() => shareReceiptEmail(receipt)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '8px 10px',
                borderRadius: 7,
                border: '1px solid #BFDBFE',
                background: '#EFF6FF',
                color: '#1E40AF',
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#DBEAFE'
                e.currentTarget.style.borderColor = '#93C5FD'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#EFF6FF'
                e.currentTarget.style.borderColor = '#BFDBFE'
              }}
            >
              <span style={{ fontSize: 15 }}>✉️</span> Email
            </button>

            {/* Copy / Link */}
            <button
              type="button"
              onClick={handleCopyLink}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '8px 10px',
                borderRadius: 7,
                border: copied ? '1px solid #86EFAC' : '1px solid #E5E7EB',
                background: copied ? '#DCFCE7' : '#F9FAFB',
                color: copied ? '#15803D' : '#374151',
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
              onMouseOver={(e) => {
                if (!copied) e.currentTarget.style.background = '#F3F4F6'
              }}
              onMouseOut={(e) => {
                if (!copied) e.currentTarget.style.background = '#F9FAFB'
              }}
            >
              <span style={{ fontSize: 14 }}>{copied ? '✓' : '🔗'}</span>
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>
        </div>

        {/* Modal Actions */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', alignItems: 'center', borderTop: '1px solid #F3F4F6', paddingTop: 14 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '9px 16px',
              borderRadius: 8,
              border: '1.5px solid #D1D5DB',
              background: '#FFFFFF',
              color: '#374151',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.15s'
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = '#F9FAFB')}
            onMouseOut={(e) => (e.currentTarget.style.background = '#FFFFFF')}
          >
            Close
          </button>

          <button
            type="button"
            onClick={() => printReceiptFormatted(receipt)}
            style={{
              padding: '9px 14px',
              borderRadius: 8,
              border: '1.5px solid #0F5C5E',
              background: '#FFFFFF',
              color: '#0F5C5E',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.15s'
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = '#F0FDFA')}
            onMouseOut={(e) => (e.currentTarget.style.background = '#FFFFFF')}
          >
            <span>🖨️</span> Print
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={downloading}
            style={{
              padding: '9px 18px',
              borderRadius: 8,
              border: 'none',
              background: downloading ? '#0A4547' : '#0F5C5E',
              color: '#FFFFFF',
              fontSize: 13,
              fontWeight: 600,
              cursor: downloading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 2px 6px rgba(15, 92, 94, 0.25)',
              transition: 'all 0.15s'
            }}
            onMouseOver={(e) => {
              if (!downloading) e.currentTarget.style.background = '#0A4547'
            }}
            onMouseOut={(e) => {
              if (!downloading) e.currentTarget.style.background = '#0F5C5E'
            }}
          >
            <span>📥</span> {downloading ? 'Downloading...' : 'Download PDF'}
          </button>
        </div>
      </div>
    </div>
  )
}
