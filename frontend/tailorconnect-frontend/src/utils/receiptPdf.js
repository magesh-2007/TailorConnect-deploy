import { jsPDF } from 'jspdf'

/**
 * Generate and download a branded, professional PDF receipt for TailorConnect payments.
 * @param {Object} receipt - Payment receipt details object
 */
export const downloadReceiptPdf = (receipt) => {
  if (!receipt) return

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  const primaryNavy = [15, 92, 94]    // #0F5C5E
  const accentGold  = [201, 166, 107]  // #C9A66B
  const textDark    = [31, 41, 55]     // #1F2937
  const textMuted   = [107, 114, 128]  // #6B7280
  const bgLight     = [248, 245, 239]  // #F8F5EF

  // ── Header Banner ──
  doc.setFillColor(...primaryNavy)
  doc.rect(0, 0, 210, 36, 'F')

  // Gold accent stripe
  doc.setFillColor(...accentGold)
  doc.rect(0, 36, 210, 2.5, 'F')

  // Brand Name
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.text('TailorConnect', 18, 18)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)
  doc.setTextColor(221, 235, 231)
  doc.text('Tailoring Services & Fashion Learning Platform · Tamil Nadu, India', 18, 26)

  // Invoice tag right-aligned
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(...accentGold)
  doc.text('OFFICIAL TAX INVOICE', 192, 18, { align: 'right' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(255, 255, 255)
  doc.text('Status: COMPLETED & VERIFIED', 192, 26, { align: 'right' })

  // ── Receipt Metadata Grid ──
  let y = 48
  doc.setFillColor(...bgLight)
  doc.roundedRect(15, y, 180, 28, 2, 2, 'F')
  doc.setDrawColor(229, 225, 216)
  doc.roundedRect(15, y, 180, 28, 2, 2, 'S')

  doc.setFontSize(8.5)
  doc.setTextColor(...textMuted)
  doc.setFont('helvetica', 'bold')
  doc.text('RECEIPT NUMBER', 22, y + 8)
  doc.text('TRANSACTION ID', 75, y + 8)
  doc.text('PAYMENT DATE', 135, y + 8)

  doc.setFontSize(10)
  doc.setTextColor(...primaryNavy)
  doc.text(String(receipt.id || 'N/A'), 22, y + 15)

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...textDark)
  doc.setFontSize(8.5)
  doc.text(String(receipt.transactionId || 'N/A'), 75, y + 15)
  doc.text(String(receipt.date || new Date().toLocaleDateString()), 135, y + 15)

  doc.setFontSize(8)
  doc.setTextColor(...textMuted)
  doc.text(`Payment Mode: ${receipt.method || 'Online'}`, 22, y + 23)
  doc.text(`Reference: ${receipt.referenceId || receipt.orderId || 'Direct'}`, 75, y + 23)
  doc.text('Escrow: 256-bit Encrypted', 135, y + 23)

  // ── Parties Section ──
  y = 85
  // Billed To
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9.5)
  doc.setTextColor(...primaryNavy)
  doc.text('CUSTOMER DETAILS', 18, y)
  doc.setDrawColor(...accentGold)
  doc.setLineWidth(0.4)
  doc.line(18, y + 2, 95, y + 2)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...textDark)
  doc.text(`Name: ${receipt.userName || 'Priya Sharma'}`, 18, y + 8)
  doc.text(`User ID: ${receipt.userId || 'USR-CUST-101'}`, 18, y + 14)
  doc.text(`Type: ${receipt.userType || 'Customer'}`, 18, y + 20)

  // Tailor Boutique
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9.5)
  doc.setTextColor(...primaryNavy)
  doc.text('SERVICE PROVIDER / TAILOR', 115, y)
  doc.setDrawColor(...accentGold)
  doc.line(115, y + 2, 192, y + 2)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...textDark)
  doc.text(`Boutique: ${receipt.tailorName || 'TailorConnect Partner'}`, 115, y + 8)
  doc.text(`Tailor ID: ${receipt.tailorId || 'Verified Tailor'}`, 115, y + 14)
  doc.text('Location: Tamil Nadu, India', 115, y + 20)

  // ── Items Table ──
  y = 118
  doc.setFillColor(...primaryNavy)
  doc.rect(15, y, 180, 8, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.text('DESCRIPTION / ORDER DETAILS', 20, y + 5.5)
  doc.text('QTY', 120, y + 5.5, { align: 'center' })
  doc.text('RATE (INR)', 150, y + 5.5, { align: 'right' })
  doc.text('AMOUNT (INR)', 190, y + 5.5, { align: 'right' })

  // Table row
  y = 126
  doc.setFillColor(255, 255, 255)
  doc.rect(15, y, 180, 14, 'F')
  doc.setDrawColor(229, 225, 216)
  doc.rect(15, y, 180, 14, 'S')

  doc.setTextColor(...textDark)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text(String(receipt.title || 'Custom Garment Stitching Service'), 20, y + 6)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...textMuted)
  doc.text(`Order Ref: ${receipt.referenceId || receipt.id} · Professional Stitching & Finishing`, 20, y + 10.5)

  doc.setTextColor(...textDark)
  doc.setFontSize(9)
  doc.text('1', 120, y + 7, { align: 'center' })
  doc.text(`Rs. ${Number(receipt.amount || 0).toFixed(2)}`, 150, y + 7, { align: 'right' })
  doc.text(`Rs. ${Number(receipt.amount || 0).toFixed(2)}`, 190, y + 7, { align: 'right' })

  // ── Calculation Summary ──
  y = 148
  const subtotal = Number(receipt.amount || 0)
  const gst = 0
  const total = subtotal

  doc.setFontSize(8.5)
  doc.setTextColor(...textMuted)
  doc.text('Subtotal:', 140, y)
  doc.setTextColor(...textDark)
  doc.text(`Rs. ${subtotal.toFixed(2)}`, 190, y, { align: 'right' })

  y += 6
  doc.setTextColor(...textMuted)
  doc.text('Platform & Escrow Fee:', 140, y)
  doc.setTextColor(22, 101, 52) // Green for Free
  doc.text('Rs. 0.00 (Waived)', 190, y, { align: 'right' })

  y += 6
  doc.setTextColor(...textMuted)
  doc.text('Taxes & GST (Included):', 140, y)
  doc.setTextColor(...textDark)
  doc.text(`Rs. ${gst.toFixed(2)}`, 190, y, { align: 'right' })

  // Total Box
  y += 6
  doc.setFillColor(...bgLight)
  doc.roundedRect(130, y, 65, 12, 1.5, 1.5, 'F')
  doc.setDrawColor(...accentGold)
  doc.roundedRect(130, y, 65, 12, 1.5, 1.5, 'S')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...primaryNavy)
  doc.text('TOTAL PAID:', 135, y + 8)
  doc.setFontSize(11)
  doc.text(`Rs. ${total.toFixed(2)}`, 190, y + 8, { align: 'right' })

  // ── Security & Verification Badge ──
  y = 185
  doc.setFillColor(240, 253, 244) // Light green #F0FDF4
  doc.roundedRect(15, y, 180, 20, 2, 2, 'F')
  doc.setDrawColor(187, 247, 208)
  doc.roundedRect(15, y, 180, 20, 2, 2, 'S')

  doc.setTextColor(22, 101, 52)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('SECURITY & ESCROW VERIFIED PAYMENT', 22, y + 7)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(21, 128, 61)
  doc.text(
    `This payment is secured via TailorConnect Escrow System. Advance payment is safely held until order handover and customer fitting satisfaction.`,
    22,
    y + 13,
    { maxWidth: 165 }
  )

  // ── Footer ──
  doc.setDrawColor(229, 225, 216)
  doc.line(15, 270, 195, 270)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...textMuted)
  doc.text(
    'This is a system-generated electronic invoice from TailorConnect. No physical signature is required.',
    105,
    275,
    { align: 'center' }
  )
  doc.text(
    'Support: support@tailorconnect.com · www.tailorconnect.com · Tamil Nadu, India',
    105,
    280,
    { align: 'center' }
  )

  // Trigger browser download
  const filename = `TailorConnect_Receipt_${receipt.id || receipt.transactionId || 'Invoice'}.pdf`
  doc.save(filename)
}

/**
 * Open printable formatted version in clean print preview window
 */
export const printReceiptFormatted = (receipt) => {
  if (!receipt) return

  const printWindow = window.open('', '_blank', 'width=800,height=900')
  if (!printWindow) {
    window.print()
    return
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Payment Receipt - ${receipt.id}</title>
      <meta charset="utf-8" />
      <style>
        body { font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 30px; color: #1F2937; background: #fff; }
        .receipt-container { max-width: 650px; margin: 0 auto; border: 1.5px solid #E5E1D8; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
        .header { background: #0F5C5E; color: #fff; padding: 24px 30px; display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #C9A66B; }
        .brand { font-size: 24px; font-weight: 700; }
        .brand span { color: #C9A66B; }
        .tag { background: rgba(201,166,107,0.25); border: 1px solid #C9A66B; color: #F5EDD9; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
        .content { padding: 28px 30px; background: #FCFBF7; }
        .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; background: #fff; border: 1px solid #E5E1D8; border-radius: 8px; padding: 16px; margin-bottom: 22px; }
        .meta-item { font-size: 13px; }
        .meta-label { color: #6B7280; font-size: 11.5px; text-transform: uppercase; font-weight: 600; margin-bottom: 3px; }
        .meta-val { font-weight: 600; color: #0F5C5E; }
        .table-box { background: #fff; border: 1px solid #E5E1D8; border-radius: 8px; overflow: hidden; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th { background: #0F5C5E; color: #fff; text-align: left; padding: 10px 16px; font-size: 12px; }
        td { padding: 12px 16px; border-bottom: 1px solid #F3F4F6; }
        .total-row { background: #F8F5EF; font-weight: 700; font-size: 15px; color: #0F5C5E; }
        .badge { display: inline-block; background: #DCFCE7; color: #166534; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
        .footer { text-align: center; font-size: 11px; color: #9CA3AF; margin-top: 24px; line-height: 1.5; }
        @media print {
          body { padding: 0; }
          .receipt-container { border: none; box-shadow: none; }
        }
      </style>
    </head>
    <body>
      <div class="receipt-container">
        <div class="header">
          <div>
            <div class="brand">Tailor<span>Connect</span></div>
            <div style="font-size: 11px; color: #DDEBE7; margin-top: 4px;">Verified Tailoring & Fashion Services</div>
          </div>
          <div class="tag">✓ Verified Payment</div>
        </div>
        <div class="content">
          <div class="meta-grid">
            <div class="meta-item">
              <div class="meta-label">Receipt ID</div>
              <div class="meta-val">${receipt.id}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Transaction ID</div>
              <div class="meta-val" style="font-family: monospace; font-size: 12px;">${receipt.transactionId}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Billed To</div>
              <div class="meta-val">${receipt.userName || 'Priya Sharma'}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Date & Time</div>
              <div class="meta-val">${receipt.date}</div>
            </div>
          </div>

          <div class="table-box">
            <table>
              <thead>
                <tr>
                  <th>Item / Service</th>
                  <th>Tailor Boutique</th>
                  <th>Payment Method</th>
                  <th style="text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>${receipt.title}</strong><div style="font-size: 11px; color: #6B7280;">Ref: ${receipt.referenceId || receipt.id}</div></td>
                  <td>${receipt.tailorName}</td>
                  <td>${receipt.method}</td>
                  <td style="text-align: right; font-weight: 700;">₹${Number(receipt.amount).toLocaleString()}.00</td>
                </tr>
                <tr class="total-row">
                  <td colspan="3" style="text-align: right;">TOTAL PAID:</td>
                  <td style="text-align: right; color: #0F5C5E; font-size: 17px;">₹${Number(receipt.amount).toLocaleString()}.00</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8px; padding: 12px 16px; font-size: 12px; color: #166534; display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 18px;">🛡️</span>
            <div><strong>256-Bit Escrow Security:</strong> Funds are verified and credited to the registered tailoring boutique ledger.</div>
          </div>

          <div class="footer">
            Official System-Generated Tax Invoice · TailorConnect Platform<br/>
            Tamil Nadu, India · support@tailorconnect.com
          </div>
        </div>
      </div>
      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `
  printWindow.document.open()
  printWindow.document.write(html)
  printWindow.document.close()
}

/**
 * Generate formatted share text
 */
export const buildReceiptShareText = (receipt) => {
  if (!receipt) return ''
  const trackingUrl = `${window.location.origin}/tracking/${receipt.referenceId || receipt.id}`
  return `🧾 *TailorConnect Official Payment Receipt*
━━━━━━━━━━━━━━━━━━━━
• *Receipt ID:* ${receipt.id}
• *Transaction ID:* ${receipt.transactionId}
• *Service / Order:* ${receipt.title}
• *Tailor Boutique:* ${receipt.tailorName}
• *Payment Method:* ${receipt.method}
• *Date & Time:* ${receipt.date}
• *Total Paid:* ₹${receipt.amount}.00
━━━━━━━━━━━━━━━━━━━━
✓ Status: Verified & Successful (Held in Safe Escrow)
🔗 Track Order: ${trackingUrl}`
}

/**
 * Share via WhatsApp
 */
export const shareReceiptWhatsApp = (receipt) => {
  const text = buildReceiptShareText(receipt)
  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`
  window.open(url, '_blank')
}

/**
 * Share via Email
 */
export const shareReceiptEmail = (receipt) => {
  const subject = `Payment Receipt - ${receipt.id} (${receipt.title})`
  const body = buildReceiptShareText(receipt)
  window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

/**
 * Copy Receipt details / link to clipboard
 */
export const copyReceiptLink = async (receipt) => {
  const text = buildReceiptShareText(receipt)
  if (navigator.clipboard && navigator.clipboard.writeText) {
    await navigator.clipboard.writeText(text)
    return true
  }
  // Fallback
  const textArea = document.createElement('textarea')
  textArea.value = text
  document.body.appendChild(textArea)
  textArea.select()
  document.execCommand('copy')
  document.body.removeChild(textArea)
  return true
}
