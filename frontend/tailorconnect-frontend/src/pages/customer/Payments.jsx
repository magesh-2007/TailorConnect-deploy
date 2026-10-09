import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout'
import { useAuth } from '../../context/AuthContext'
import * as storage from '../../services/storageService'
import Button from '../../components/Button'
import ReceiptModal from '../../components/ReceiptModal'

export default function CustomerPayments() {
  const { user } = useAuth()
  const [payments, setPayments] = useState([])
  const [selectedReceipt, setSelectedReceipt] = useState(null)

  const loadData = () => {
    if (!user) return
    const myPayments = storage.getPaymentsForUser ? storage.getPaymentsForUser(user.id) : []
    
    if (myPayments.length > 0) {
      setPayments(myPayments)
    } else {
      // Seed default transactions
      const defaultPays = [
        {
          id: 'PAY-ORD-1001',
          transactionId: 'TXN-TC-20260820-9921',
          userId: user.id,
          userName: user.name || 'Priya Sharma',
          userType: 'Customer',
          type: 'Order',
          referenceId: 'ORD-1001',
          title: 'Silk Bridal Blouse (Aari Embroidery)',
          tailorId: 'user-tailor-1',
          tailorName: 'Lakshmi Devi (Lakshmi Stitches)',
          amount: 1800,
          date: '2026-08-20, 11:30 AM',
          status: 'Successful',
          method: 'UPI (GPay)'
        },
        {
          id: 'PAY-ORD-1003',
          transactionId: 'TXN-TC-20260801-4412',
          userId: user.id,
          userName: user.name || 'Priya Sharma',
          userType: 'Customer',
          type: 'Order',
          referenceId: 'ORD-1003',
          title: 'Designer Kurti & Palazzo Set',
          tailorId: 'user-tailor-4',
          tailorName: 'Anandhi Nathan (Modern Stitch)',
          amount: 1450,
          date: '2026-08-01, 04:15 PM',
          status: 'Successful',
          method: 'Card (•••• 8821)'
        }
      ]
      setPayments(defaultPays)
    }
  }

  useEffect(() => {
    loadData()
    const handleDataChange = () => loadData()
    window.addEventListener('tc_data_changed', handleDataChange)
    return () => window.removeEventListener('tc_data_changed', handleDataChange)
  }, [user])

  const totalSpent = payments.reduce((acc, p) => acc + Number(p.amount || 0), 0)

  return (
    <DashboardLayout role="customer">
      <div className="page-header">
        <div>
          <h1>Payments & Billing Receipts</h1>
          <p>View transaction ledger, download GST invoices, and verify advance stitching payments.</p>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <h3>Total Paid</h3>
          <div className="stat-value" style={{ color: 'var(--primary)' }}>₹{totalSpent}</div>
          <span className="stat-subtitle">Across all custom stitching orders</span>
        </div>
        <div className="stat-card">
          <h3>Total Transactions</h3>
          <div className="stat-value">{payments.length}</div>
          <span className="stat-subtitle">All 100% verified & secure</span>
        </div>
        <div className="stat-card">
          <h3>Payment Methods Used</h3>
          <div className="stat-value" style={{ fontSize: 18, color: 'var(--primary-dark)', marginTop: 6 }}>UPI, Card</div>
          <span className="stat-subtitle">Bank grade 256-bit encryption</span>
        </div>
        <div className="stat-card">
          <h3>Pending Invoices</h3>
          <div className="stat-value" style={{ color: 'var(--success)' }}>0</div>
          <span className="stat-subtitle">All active orders fully settled</span>
        </div>
      </div>

      {/* PAYMENTS TABLE */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--primary-light)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '14px 16px', fontSize: 13, color: 'var(--primary-dark)' }}>Payment ID</th>
                <th style={{ padding: '14px 16px', fontSize: 13, color: 'var(--primary-dark)' }}>Order / Ref ID</th>
                <th style={{ padding: '14px 16px', fontSize: 13, color: 'var(--primary-dark)' }}>Item & Tailor</th>
                <th style={{ padding: '14px 16px', fontSize: 13, color: 'var(--primary-dark)' }}>Amount</th>
                <th style={{ padding: '14px 16px', fontSize: 13, color: 'var(--primary-dark)' }}>Date</th>
                <th style={{ padding: '14px 16px', fontSize: 13, color: 'var(--primary-dark)' }}>Method</th>
                <th style={{ padding: '14px 16px', fontSize: 13, color: 'var(--primary-dark)' }}>Status</th>
                <th style={{ padding: '14px 16px', fontSize: 13, color: 'var(--primary-dark)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ padding: 28, textAlign: 'center', color: 'var(--text-muted)' }}>
                    No payment records found.
                  </td>
                </tr>
              ) : (
                payments.map(pay => (
                  <tr key={pay.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--primary)', fontSize: 13 }}>
                      {pay.id}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 13 }}>
                      <Link to={`/tracking/${pay.referenceId}`} style={{ color: 'var(--primary)', fontWeight: 600 }}>
                        {pay.referenceId}
                      </Link>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 13 }}>
                      <strong>{pay.title}</strong>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{pay.tailorName}</div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 700, color: 'var(--primary-dark)' }}>
                      ₹{pay.amount}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 12.5 }}>
                      {pay.date}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 12.5 }}>
                      {pay.method}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 13 }}>
                      <span className="badge badge-active">✓ {pay.status}</span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <Button size="sm" variant="outline" onClick={() => setSelectedReceipt(pay)}>
                        Receipt
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECEIPT MODAL */}
      <ReceiptModal
        receipt={selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
      />
    </DashboardLayout>
  )
}
