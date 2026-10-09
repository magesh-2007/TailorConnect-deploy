import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout'
import { useAuth } from '../../context/AuthContext'
import * as storage from '../../services/storageService'
import Button from '../../components/Button'
import Modal from '../../components/Modal'

export default function CustomerQuotations() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const highlightId = searchParams.get('highlight')

  const [quotations, setQuotations] = useState([])
  const [selectedQuote, setSelectedQuote] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')

  const loadQuotations = () => {
    const raw = localStorage.getItem('tc_quotations_data')
    if (raw) {
      setQuotations(JSON.parse(raw))
    } else {
      const defaultQuotes = [
        {
          id: 'QT-501',
          requestId: 'REQ-1002',
          customerId: user?.id || 'user-cust-1',
          customerName: user?.name || 'Priya Sharma',
          tailorId: 'user-tailor-1',
          tailor: 'Lakshmi Devi',
          shopName: 'Lakshmi Stitches & Bridal Studio',
          rating: 4.9,
          experience: '8 yrs',
          price: 1800,
          stitchingCost: 1400,
          materialCost: 300,
          additionalCharges: 100,
          estimatedDays: 7,
          deliveryDate: '2026-09-08',
          urgentSupport: 'Yes – Express Turnaround Included',
          message: 'Can start cutting and Aari frame work immediately with gold zari thread, inner silk lining, and 1.5-inch alteration margin.',
          dressItem: 'Silk Bridal Blouse (Aari Needlework)',
          fabric: 'Kanchipuram Pure Silk',
          status: 'pending'
        },
        {
          id: 'QT-502',
          requestId: 'REQ-1002',
          customerId: user?.id || 'user-cust-1',
          customerName: user?.name || 'Priya Sharma',
          tailorId: 'user-tailor-2',
          tailor: 'Mrs. Radha Raman',
          shopName: 'Vintage Needle Heritage Tailors',
          rating: 4.9,
          experience: '12 yrs',
          price: 2100,
          stitchingCost: 1700,
          materialCost: 400,
          additionalCharges: 0,
          estimatedDays: 9,
          deliveryDate: '2026-09-10',
          urgentSupport: 'Yes – Handcrafted Master Studio',
          message: 'Heirloom Maggam hand embroidery with antique gold bullion wire and pearl drop beads. 2 live trial fittings included.',
          dressItem: 'Silk Bridal Blouse (Maggam Work)',
          fabric: 'Raw Silk',
          status: 'pending'
        },
        {
          id: 'QT-503',
          requestId: 'REQ-1002',
          customerId: user?.id || 'user-cust-1',
          customerName: user?.name || 'Priya Sharma',
          tailorId: 'user-tailor-3',
          tailor: 'Suresh Kumar',
          shopName: 'Royal Threads & Embroidery Studio',
          rating: 4.7,
          experience: '6 yrs',
          price: 1500,
          stitchingCost: 1250,
          materialCost: 200,
          additionalCharges: 50,
          estimatedDays: 10,
          deliveryDate: '2026-09-12',
          urgentSupport: 'Standard Turnaround',
          message: 'Affordable pricing with clean piping, reinforced interlock stitch, and free doorstep pick-up & delivery.',
          dressItem: 'Silk Bridal Blouse (Zardosi Embroidery)',
          fabric: 'Pure Silk',
          status: 'pending'
        }
      ]
      localStorage.setItem('tc_quotations_data', JSON.stringify(defaultQuotes))
      setQuotations(defaultQuotes)
    }
  }

  useEffect(() => {
    loadQuotations()
    const handleDataChange = () => loadQuotations()
    window.addEventListener('tc_data_changed', handleDataChange)
    return () => window.removeEventListener('tc_data_changed', handleDataChange)
  }, [user])

  const handleAccept = (quote) => {
    // 1. Create a confirmed order in storage
    const newOrder = storage.createOrder({
      customer: user?.name || 'Priya Sharma',
      customerId: user?.id || 'user-cust-1',
      customerEmail: user?.email || 'customer@tailorconnect.com',
      customerPhone: user?.phone || '9876543210',
      customerAddress: user?.address || '12, Anna Nagar, Chennai',
      tailor: quote.tailor,
      tailorId: quote.tailorId,
      tailorShop: quote.shopName,
      item: quote.dressItem,
      category: 'Bridal Blouse',
      fabric: quote.fabric || 'Pure Silk',
      amount: quote.price,
      deliveryDate: quote.deliveryDate,
      urgent: quote.urgentSupport.includes('Yes'),
      status: 'Tailor Confirmed'
    })

    // 2. Mark this quote as accepted
    const updatedQuotes = quotations.map(q => {
      if (q.id === quote.id) return { ...q, status: 'accepted' }
      if (q.requestId === quote.requestId) return { ...q, status: 'rejected' }
      return q
    })
    setQuotations(updatedQuotes)
    localStorage.setItem('tc_quotations_data', JSON.stringify(updatedQuotes))

    // 3. Navigate directly to Payment page
    navigate(`/payment?orderId=${newOrder.id}&amount=${quote.price}&tailor=${encodeURIComponent(quote.tailor)}&item=${encodeURIComponent(quote.dressItem)}`)
  }

  const handleReject = (quoteId) => {
    const updatedQuotes = quotations.map(q => q.id === quoteId ? { ...q, status: 'rejected' } : q)
    setQuotations(updatedQuotes)
    localStorage.setItem('tc_quotations_data', JSON.stringify(updatedQuotes))
  }

  const filtered = quotations.filter(q => {
    if (filterStatus === 'all') return true
    return q.status === filterStatus
  })

  return (
    <DashboardLayout role="customer">
      <div className="page-header">
        <div>
          <h1>Tailor Quotations & Offers Comparison</h1>
          <p>Compare competitive price bids, turnaround timelines, and material inclusions from verified master tailors.</p>
        </div>
        <Link to="/customer/create-order">
          <Button variant="primary">+ Request New Custom Dress</Button>
        </Link>
      </div>

      {/* SIDE-BY-SIDE COMPARISON BADGES */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {quotations.map((q) => {
          let badge = null
          if (q.price === Math.min(...quotations.map(x => x.price))) {
            badge = { label: '🏷️ Lowest Price', bg: '#EDFAF3', text: '#246040', border: '#A7E0C4' }
          } else if (q.estimatedDays === Math.min(...quotations.map(x => x.estimatedDays))) {
            badge = { label: '⚡ Fastest Delivery', bg: '#EEF6F8', text: '#1D4E57', border: '#A8D4DB' }
          } else if (q.rating === Math.max(...quotations.map(x => x.rating))) {
            badge = { label: '⭐ Highest Rated', bg: '#FDF6EC', text: '#7A5620', border: '#F0D09A' }
          } else {
            badge = { label: '💎 Best Value', bg: '#DDEBE7', text: '#0F5C5E', border: '#C8D5D2' }
          }

          return (
            <div
              key={q.id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                border: `2px solid ${badge.border}`,
                padding: '20px',
                boxShadow: '0 4px 12px rgba(15,92,94,0.06)'
              }}
            >
              <div style={{ display: 'inline-block', backgroundColor: badge.bg, color: badge.text, padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, marginBottom: '12px' }}>
                {badge.label}
              </div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 700, color: '#0F5C5E' }}>
                {q.shopName}
              </h3>
              <div style={{ fontSize: '13px', color: '#667085', marginBottom: '12px' }}>
                by {q.tailor} • ⭐ {q.rating}
              </div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F5C5E', marginBottom: '4px' }}>
                ₹{q.price}
              </div>
              <div style={{ fontSize: '12px', color: '#667085', marginBottom: '16px' }}>
                ⏱️ Delivery: <strong>{q.estimatedDays} Days</strong> ({q.deliveryDate})
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button size="sm" variant="primary" onClick={() => handleAccept(q)}>
                  Accept & Pay
                </Button>
                <Button size="sm" variant="outline" onClick={() => setSelectedQuote(q)}>
                  Details
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      {/* FILTER TABS */}
      <div className="card" style={{ marginBottom: 20, padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {['all', 'pending', 'accepted', 'rejected'].map(st => (
            <button
              key={st}
              type="button"
              className={`btn btn-sm ${filterStatus === st ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilterStatus(st)}
              style={{ textTransform: 'capitalize' }}
            >
              {st === 'all' ? `All Quotations (${quotations.length})` : `${st} (${quotations.filter(q => q.status === st).length})`}
            </button>
          ))}
        </div>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Showing <strong>{filtered.length}</strong> quotation offers
        </span>
      </div>

      {/* PROFESSIONAL COMPARISON TABLE */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Tailor</th>
                <th>Rating</th>
                <th>Experience</th>
                <th>Quoted Price</th>
                <th>Estimated Days</th>
                <th>Delivery Date</th>
                <th>Urgent Support</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ padding: 36, textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No quotations found in this filter category.
                  </td>
                </tr>
              ) : (
                filtered.map((quote) => (
                  <tr 
                    key={quote.id}
                    style={{
                      backgroundColor: highlightId === quote.id ? 'var(--bg-hover)' : undefined
                    }}
                  >
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{quote.tailor}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{quote.shopName}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Item: {quote.dressItem}</div>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--primary-dark)' }}>⭐ {quote.rating}</strong>
                    </td>
                    <td>
                      {quote.experience || '8 yrs'}
                    </td>
                    <td>
                      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--primary)' }}>₹{quote.price}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Stitching: ₹{quote.stitchingCost || quote.price - 200}</div>
                    </td>
                    <td>
                      <strong>{quote.estimatedDays} Days</strong>
                    </td>
                    <td>
                      {quote.deliveryDate}
                    </td>
                    <td>
                      <span className="sidebar-role-badge" style={{ fontSize: 11 }}>
                        {quote.urgentSupport}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedQuote(quote)}
                        >
                          View
                        </Button>
                        <Link to={`/customer/chat?recipient=${encodeURIComponent(quote.tailor)}&quoteId=${quote.id}`}>
                          <Button size="sm" variant="secondary">
                            Chat
                          </Button>
                        </Link>
                        {quote.status === 'pending' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="primary"
                              onClick={() => handleAccept(quote)}
                            >
                              Accept
                            </Button>
                            <Button 
                              size="sm" 
                              variant="danger"
                              onClick={() => handleReject(quote.id)}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {quote.status === 'accepted' && (
                          <span className="status-badge" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
                            ✓ Accepted
                          </span>
                        )}
                        {quote.status === 'rejected' && (
                          <span className="status-badge" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>
                            ✕ Rejected
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ITEMIZED QUOTATION BREAKDOWN MODAL */}
      {selectedQuote && (
        <Modal 
          title={`Quotation Breakdown – #${selectedQuote.id}`} 
          onClose={() => setSelectedQuote(null)}
          maxWidth={580}
          footer={
            selectedQuote.status === 'pending' ? (
              <>
                <Button variant="outline" size="sm" onClick={() => setSelectedQuote(null)}>Close</Button>
                <Button variant="primary" size="sm" onClick={() => {
                  setSelectedQuote(null)
                  handleAccept(selectedQuote)
                }}>
                  Accept Offer & Proceed to Payment →
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setSelectedQuote(null)}>Close</Button>
            )
          }
        >
          <div>
            <div style={{ background: 'var(--bg-page)', padding: 14, borderRadius: 6, border: '1px solid var(--border)', marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Master Tailor:</span>
                <strong style={{ fontSize: 13 }}>{selectedQuote.tailor} ({selectedQuote.shopName})</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Dress Item:</span>
                <strong style={{ fontSize: 13 }}>{selectedQuote.dressItem}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Delivery Deadline:</span>
                <strong style={{ fontSize: 13, color: 'var(--primary)' }}>{selectedQuote.deliveryDate} ({selectedQuote.estimatedDays} Days)</strong>
              </div>
            </div>

            <h4 style={{ fontSize: 14, marginBottom: 10 }}>Cost Breakdown:</h4>
            <div style={{ border: '1px solid var(--border-light)', borderRadius: 6, padding: 14, marginBottom: 16, background: '#FFFFFF' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                <span>Stitching & Pattern Cutting:</span>
                <strong>₹{selectedQuote.stitchingCost || selectedQuote.price - 200}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                <span>Material & Lining / Zari Thread:</span>
                <strong>₹{selectedQuote.materialCost || 200}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                <span>Additional Detailing & Alteration Margin:</span>
                <strong>₹{selectedQuote.additionalCharges || 0}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 700, paddingTop: 8, borderTop: '1px solid var(--border-light)', color: 'var(--primary)' }}>
                <span>Total Quoted Amount:</span>
                <span>₹{selectedQuote.price}</span>
              </div>
            </div>

            <h4 style={{ fontSize: 14, marginBottom: 6 }}>Tailor Note:</h4>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', background: 'var(--bg-subtle)', padding: 12, borderRadius: 6, border: '1px solid var(--border-light)' }}>
              "{selectedQuote.message}"
            </p>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  )
}
