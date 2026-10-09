import PDFDocument from 'pdfkit'

/**
 * Generate official payment receipt PDF and stream to response
 */
export const generateReceiptPdf = (payment, res) => {
  const doc = new PDFDocument({ margin: 50, size: 'A4' })

  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader(
    'Content-Disposition',
    `inline; filename="receipt-${payment.id || payment.transactionId}.pdf"`
  )

  doc.pipe(res)

  // Header Banner
  doc.rect(0, 0, 595.28, 80).fill('#E91E63')
  doc.fillColor('#FFFFFF')
  doc.fontSize(22).font('Helvetica-Bold').text('TAILORCONNECT ESCROW INVOICE', 50, 25)
  doc.fontSize(11).font('Helvetica').text('Tailoring Services & Fashion Learning Platform', 50, 50)

  doc.moveDown(3)
  doc.fillColor('#333333')

  // Receipt meta
  const startY = 110
  doc.fontSize(10).font('Helvetica-Bold').text('RECEIPT DETAILS', 50, startY)
  doc.font('Helvetica')
  doc.text(`Receipt Reference: #${payment.paymentNumber || payment.id || 'PAY-REF'}`, 50, startY + 16)
  doc.text(`Transaction ID: ${payment.transactionId}`, 50, startY + 30)
  doc.text(`Payment Date: ${new Date(payment.paidAt || Date.now()).toLocaleString()}`, 50, startY + 44)
  doc.text(`Payment Status: ${payment.status || 'SUCCESSFUL'}`, 50, startY + 58)

  doc.fontSize(10).font('Helvetica-Bold').text('BILLED TO', 350, startY)
  doc.font('Helvetica')
  doc.text(`Name: ${payment.userName || 'Valued Customer'}`, 350, startY + 16)
  doc.text(`User Type: ${payment.userType || 'Customer'}`, 350, startY + 30)
  doc.text(`Payment Method: ${payment.paymentMethod || 'UPI / Online'}`, 350, startY + 44)

  // Divider
  doc.moveTo(50, 195).lineTo(545, 195).strokeColor('#E0E0E0').stroke()

  // Table header
  doc.rect(50, 210, 495, 24).fill('#FCE4EC')
  doc.fillColor('#C2185B').font('Helvetica-Bold').fontSize(10)
  doc.text('ITEM / SERVICE DESCRIPTION', 60, 217)
  doc.text('STUDIO / TAILOR', 320, 217)
  doc.text('AMOUNT (INR)', 450, 217, { align: 'right' })

  // Table row
  doc.fillColor('#333333').font('Helvetica').fontSize(10)
  doc.text(payment.title || 'Customized Dress Tailoring Service', 60, 245)
  doc.text(payment.tailorName || 'Tailor Boutique Studio', 320, 245)
  doc.text(`₹${Number(payment.amount || 0).toLocaleString()}`, 450, 245, { align: 'right' })

  // Summary box
  const summaryY = 290
  doc.moveTo(50, summaryY).lineTo(545, summaryY).strokeColor('#E0E0E0').stroke()

  doc.font('Helvetica').fontSize(10)
  doc.text('Platform Escrow Fee:', 350, summaryY + 15)
  doc.text(`₹${payment.platformFee || 50}`, 450, summaryY + 15, { align: 'right' })

  doc.text('GST (5%):', 350, summaryY + 30)
  doc.text(`₹${payment.gst || Math.round((payment.amount || 0) * 0.05)}`, 450, summaryY + 30, { align: 'right' })

  doc.font('Helvetica-Bold').fontSize(12).fillColor('#E91E63')
  const total = (Number(payment.amount || 0) + Number(payment.platformFee || 50) + Number(payment.gst || Math.round((payment.amount || 0) * 0.05)))
  doc.text('Total Paid:', 350, summaryY + 50)
  doc.text(`₹${total.toLocaleString()}`, 450, summaryY + 50, { align: 'right' })

  // Escrow guarantee note
  doc.rect(50, 390, 495, 55).fill('#F9F9F9').strokeColor('#E0E0E0').stroke()
  doc.fillColor('#2E7D32').font('Helvetica-Bold').fontSize(10)
  doc.text('✓ 100% SECURE ESCROW PROTECTION GUARANTEED', 65, 402)
  doc.fillColor('#666666').font('Helvetica').fontSize(9)
  doc.text('Funds remain in platform escrow and are released to the tailor upon customer approval of stitching delivery.', 65, 418)

  // Footer
  doc.fillColor('#999999').fontSize(8)
  doc.text('TailorConnect Marketplace • Automated Tax Invoice • For customer support email support@tailorconnect.com', 50, 750, { align: 'center', width: 495 })

  doc.end()
}

/**
 * Generate official landscape certificate of completion PDF and stream to response
 * Designed to match official TailorConnect certificate layout
 */
export const generateCertificatePdf = (cert, res) => {
  const doc = new PDFDocument({
    layout: 'landscape',
    size: 'A4',
    margin: 30
  })

  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader(
    'Content-Disposition',
    `inline; filename="certificate-${cert.certificateId || cert.id}.pdf"`
  )

  doc.pipe(res)

  const W = 841.89
  const H = 595.28

  // 1. Parchment Background
  doc.rect(0, 0, W, H).fill('#FAF7F2')

  // 2. Corner Navy Polygons (Top-Left & Bottom-Right)
  doc.polygon([0, 0], [120, 0], [0, 120]).fill('#0F172A')
  doc.polygon([0, 0], [130, 0], [0, 130]).strokeColor('#C5A059').lineWidth(2).stroke()

  doc.polygon([W, H], [W - 120, H], [W, H - 120]).fill('#0F172A')
  doc.polygon([W, H], [W - 130, H], [W, H - 130]).strokeColor('#C5A059').lineWidth(2).stroke()

  // 3. Double Gold Border
  doc.rect(25, 25, W - 50, H - 50).lineWidth(3).strokeColor('#C5A059').stroke()
  doc.rect(32, 32, W - 64, H - 64).lineWidth(1).strokeColor('#D4AF37').stroke()

  // 4. Header: Brand Logo & Title
  doc.fillColor('#0F172A').font('Helvetica-Bold').fontSize(22)
  doc.text('TailorConnect', 0, 48, { align: 'center' })
  doc.fillColor('#C5A059').font('Helvetica-Bold').fontSize(22).text('Connect', W / 2 + 35, 48)

  doc.fillColor('#666666').font('Helvetica').fontSize(9)
  doc.text('Custom Dresses | Learn Tailoring | Build Your Fashion Future', 0, 74, { align: 'center' })

  // Top Right Cursive Slogan
  doc.fillColor('#C5A059').font('Helvetica-Oblique').fontSize(11)
  doc.text('Stitching Skills Building Dreams ♡', W - 260, 48, { width: 220, align: 'right' })

  // 5. Left Ribbon Medal / Certified Seal
  const cx = 110
  const cy = 180
  doc.circle(cx, cy, 42).fillColor('#C5A059').fill()
  doc.circle(cx, cy, 36).fillColor('#0F172A').fill()
  doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(8)
  doc.text('CERTIFIED', cx - 30, cy - 16, { width: 60, align: 'center' })
  doc.text('TAILORING', cx - 30, cy - 4, { width: 60, align: 'center' })
  doc.text('PROFESSIONAL', cx - 35, cy + 8, { width: 70, align: 'center' })

  // 6. Top Right Verification Box
  const boxX = W - 240
  const boxY = 110
  doc.rect(boxX, boxY, 200, 115).fillColor('#FFFFFF').fillAndStroke('#C5A059')
  doc.fillColor('#0F172A').font('Helvetica').fontSize(8.5)

  doc.text(`Certificate ID`, boxX + 10, boxY + 12)
  doc.font('Helvetica-Bold').text(`:  ${cert.certificateId || cert.id}`, boxX + 85, boxY + 12)

  doc.font('Helvetica').text(`Verification Code`, boxX + 10, boxY + 28)
  doc.font('Helvetica-Bold').text(`:  ${cert.verificationCode || 'TC-7F3K9D2A'}`, boxX + 85, boxY + 28)

  doc.font('Helvetica').text(`Completion Date`, boxX + 10, boxY + 44)
  doc.font('Helvetica-Bold').text(`:  ${cert.completionDate || '2026-08-28'}`, boxX + 85, boxY + 44)

  doc.font('Helvetica').text(`Course Duration`, boxX + 10, boxY + 60)
  doc.font('Helvetica-Bold').text(`:  ${cert.duration || '15 Days'}`, boxX + 85, boxY + 60)

  doc.font('Helvetica').text(`Grade`, boxX + 10, boxY + 76)
  doc.font('Helvetica-Bold').text(`:  ${cert.grade || 'A+ (94%)'}`, boxX + 85, boxY + 76)

  doc.fillColor('#0F5C5E').font('Helvetica').fontSize(8)
  doc.text('Scan to verify: www.tailorconnect.com/verify', boxX + 10, boxY + 96)

  // 7. Certificate Title
  doc.fillColor('#0F172A').font('Helvetica-Bold').fontSize(28)
  doc.text('CERTIFICATE', 0, 115, { align: 'center' })

  doc.fillColor('#C5A059').font('Helvetica-Bold').fontSize(20)
  doc.text('OF COMPLETION', 0, 148, { align: 'center' })

  doc.fillColor('#666666').font('Helvetica').fontSize(11)
  doc.text('THIS IS TO CERTIFY THAT', 0, 190, { align: 'center' })

  // 8. Student Name
  doc.fillColor('#0F172A').font('Helvetica-Bold').fontSize(32)
  doc.text(cert.studentName || 'Priya S', 0, 218, { align: 'center' })
  doc.moveTo(260, 258).lineTo(W - 260, 258).strokeColor('#C5A059').lineWidth(1.5).stroke()

  // 9. Course Description
  doc.fillColor('#666666').font('Helvetica').fontSize(11)
  doc.text('has successfully completed the course', 0, 275, { align: 'center' })

  doc.fillColor('#0F172A').font('Helvetica-Bold').fontSize(22)
  doc.text(cert.courseName || 'Advanced Aari Embroidery', 0, 298, { align: 'center' })

  doc.fillColor('#555555').font('Helvetica').fontSize(10.5)
  doc.text(
    'offered by TailorConnect and has demonstrated the required skills and knowledge in the field of fashion and tailoring.',
    120,
    332,
    { align: 'center', width: W - 240 }
  )

  // 10. Skill Badges Row
  const skillY = 378
  const skillWidth = 130
  const skillStartX = (W - (skillWidth * 4 + 30)) / 2

  const skills = [
    'Aari Embroidery',
    'Advanced Techniques',
    'Fashion Design Skills',
    'Lifelong Learning'
  ]

  skills.forEach((s, idx) => {
    const sx = skillStartX + idx * (skillWidth + 10)
    doc.fillColor('#0F172A').font('Helvetica-Bold').fontSize(9)
    doc.text(s, sx, skillY, { width: skillWidth, align: 'center' })

    if (idx < 3) {
      doc.moveTo(sx + skillWidth + 5, skillY - 4).lineTo(sx + skillWidth + 5, skillY + 16).strokeColor('#C5A059').lineWidth(0.8).stroke()
    }
  })

  // 11. Signatures & Footer Motto
  const sigY = 475

  // Left Signature: Instructor
  doc.moveTo(90, sigY).lineTo(260, sigY).strokeColor('#0F172A').lineWidth(1).stroke()
  doc.fillColor('#0F172A').font('Helvetica-Bold').fontSize(11)
  doc.text(cert.tailorName || 'Anitha R', 90, sigY + 8, { width: 170, align: 'center' })
  doc.fillColor('#666666').font('Helvetica').fontSize(9)
  doc.text('Course Instructor', 90, sigY + 22, { width: 170, align: 'center' })
  doc.text(cert.shopName || 'TailorConnect Academy', 90, sigY + 34, { width: 170, align: 'center' })

  // Center Motto
  doc.fillColor('#C5A059').font('Helvetica-Oblique').fontSize(16)
  doc.text('Learn • Create • Grow', 0, sigY + 10, { align: 'center' })

  // Right Signature: CEO
  doc.moveTo(W - 260, sigY).lineTo(W - 90, sigY).strokeColor('#0F172A').lineWidth(1).stroke()
  doc.fillColor('#0F172A').font('Helvetica-Bold').fontSize(11)
  doc.text('Ragul K', W - 260, sigY + 8, { width: 170, align: 'center' })
  doc.fillColor('#666666').font('Helvetica').fontSize(9)
  doc.text('CEO & Founder', W - 260, sigY + 22, { width: 170, align: 'center' })
  doc.text('TailorConnect Platform', W - 260, sigY + 34, { width: 170, align: 'center' })

  doc.end()
}
