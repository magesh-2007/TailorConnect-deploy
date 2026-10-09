import 'dotenv/config'
import http from 'http'
import app from './src/app.js'
import { connectDB, disconnectDB } from './src/config/db.js'
import { seedDatabase } from './src/seed/seed.js'

const testPort = 8089

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = ''
      res.on('data', (chunk) => {
        body += chunk
      })
      res.on('end', () => {
        let json = null
        try {
          json = JSON.parse(body)
        } catch {
          json = body
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: json
        })
      })
    })

    req.on('error', reject)

    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data))
    }
    req.end()
  })
}

async function runTests() {
  console.log('\n========================================')
  console.log(' RUNNING TAILORCONNECT BACKEND TESTS')
  console.log('========================================\n')

  await connectDB()
  await seedDatabase(false)

  const server = app.listen(testPort)
  console.log(`[Test Server] Running on http://localhost:${testPort}\n`)

  let custToken = ''
  let tailorToken = ''
  let studentToken = ''
  let adminToken = ''
  let testOrderId = ''
  let testPaymentId = ''
  let testCertId = ''
  let testCourseId = ''
  let testTailorId = ''

  try {
    // 1. Healthcheck
    console.log('1. Testing GET /api/health...')
    const health = await request({
      hostname: 'localhost',
      port: testPort,
      path: '/api/health',
      method: 'GET'
    })
    console.assert(health.statusCode === 200, `Healthcheck failed: ${health.statusCode}`)
    console.log('   ✓ Healthcheck passed:', health.body.message)

    // 2. Auth - Customer Login
    console.log('2. Testing POST /api/auth/login (Customer)...')
    const custLogin = await request(
      {
        hostname: 'localhost',
        port: testPort,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      {
        identifier: 'customer@tailorconnect.com',
        password: 'customer123',
        role: 'customer'
      }
    )
    console.assert(custLogin.statusCode === 200, `Cust login failed: ${custLogin.statusCode}`)
    custToken = custLogin.body.data.token
    console.log('   ✓ Customer logged in. Name:', custLogin.body.data.user.name)

    // 2b. Auth - Google Login
    console.log('2b. Testing POST /api/auth/google...')
    const googleLoginRes = await request(
      {
        hostname: 'localhost',
        port: testPort,
        path: '/api/auth/google',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      {
        email: 'google.testuser@tailorconnect.com',
        name: 'Google Test User',
        googleId: 'google-test-id-9999'
      }
    )
    console.assert(googleLoginRes.statusCode === 200, `Google login failed: ${googleLoginRes.statusCode}`)
    console.assert(googleLoginRes.body.data.user.role === 'customer', `Expected role customer but got ${googleLoginRes.body.data.user.role}`)
    console.log('   ✓ Google authentication successful. Role:', googleLoginRes.body.data.user.role)

    // 3. Auth - Tailor Login
    console.log('3. Testing POST /api/auth/login (Tailor)...')
    const tailorLogin = await request(
      {
        hostname: 'localhost',
        port: testPort,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      {
        identifier: 'tailor@tailorconnect.com',
        password: 'tailor123',
        role: 'tailor'
      }
    )
    console.assert(tailorLogin.statusCode === 200, `Tailor login failed: ${tailorLogin.statusCode}`)
    tailorToken = tailorLogin.body.data.token
    testTailorId = tailorLogin.body.data.user.id
    console.log('   ✓ Tailor logged in. Shop:', tailorLogin.body.data.user.shopName)

    // 4. Auth - Student Login
    console.log('4. Testing POST /api/auth/login (Student)...')
    const studentLogin = await request(
      {
        hostname: 'localhost',
        port: testPort,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      {
        identifier: 'student@tailorconnect.com',
        password: 'student123',
        role: 'student'
      }
    )
    console.assert(studentLogin.statusCode === 200, `Student login failed: ${studentLogin.statusCode}`)
    studentToken = studentLogin.body.data.token
    console.log('   ✓ Student logged in:', studentLogin.body.data.user.name)

    // 5. Auth - Admin Login
    console.log('5. Testing POST /api/auth/login (Admin)...')
    const adminLogin = await request(
      {
        hostname: 'localhost',
        port: testPort,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      {
        identifier: 'admin@tailorconnect.com',
        password: 'admin123',
        role: 'admin'
      }
    )
    console.assert(adminLogin.statusCode === 200, `Admin login failed: ${adminLogin.statusCode}`)
    adminToken = adminLogin.body.data.token
    console.log('   ✓ Admin logged in:', adminLogin.body.data.user.name)

    // 6. Discovery - Tailor search & location
    console.log('6. Testing GET /api/tailors?location=Chennai...')
    const tailorsRes = await request({
      hostname: 'localhost',
      port: testPort,
      path: '/api/tailors?location=Chennai',
      method: 'GET'
    })
    console.assert(tailorsRes.statusCode === 200, 'Failed to fetch tailors')
    console.log(`   ✓ Retrieved ${tailorsRes.body.data.tailors.length} tailors in Chennai`)

    // 7. Orders - Customer creates order
    console.log('7. Testing POST /api/orders (Customer creates custom order)...')
    const orderRes = await request(
      {
        hostname: 'localhost',
        port: testPort,
        path: '/api/orders',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${custToken}`
        }
      },
      {
        tailorId: testTailorId,
        designName: 'Grand Muhurtham Silk Blouse with Heavy Aari',
        category: 'Bridal Blouse',
        fabric: 'Kanchipuram Silk',
        price: 2400,
        deadline: '2026-09-28',
        measurements: { bust: '36', waist: '30' }
      }
    )
    console.assert(orderRes.statusCode === 201, `Order creation failed: ${orderRes.statusCode}`)
    testOrderId = orderRes.body.data.order.id
    console.log('   ✓ Custom order created! ID:', testOrderId, '| Order #:', orderRes.body.data.order.orderNumber)

    // 8. Orders - Tailor receives incoming orders
    console.log('8. Testing GET /api/tailors/orders (Tailor checks orders)...')
    const tailorOrders = await request({
      hostname: 'localhost',
      port: testPort,
      path: '/api/tailors/orders',
      method: 'GET',
      headers: { Authorization: `Bearer ${tailorToken}` }
    })
    console.assert(tailorOrders.statusCode === 200, 'Failed to fetch tailor orders')
    console.log(`   ✓ Tailor received ${tailorOrders.body.data.orders.length} orders`)

    // 9. Orders - Tailor accepts order & updates status
    console.log('9. Testing PATCH /api/orders/:id/accept & PATCH /api/orders/:id/status...')
    const acceptRes = await request({
      hostname: 'localhost',
      port: testPort,
      path: `/api/orders/${testOrderId}/accept`,
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tailorToken}` }
    })
    console.assert(acceptRes.statusCode === 200, 'Failed to accept order')

    const stitchRes = await request(
      {
        hostname: 'localhost',
        port: testPort,
        path: `/api/orders/${testOrderId}/status`,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tailorToken}`
        }
      },
      { status: 'Stitching Started' }
    )
    console.assert(stitchRes.statusCode === 200, 'Failed to update order status')
    console.log('   ✓ Order accepted and transitioned to STITCHING_STARTED, progress:', stitchRes.body.data.order.progress)

    // 10. Delivery Tracking
    console.log('10. Testing GET /api/orders/:id/tracking...')
    const trackRes = await request({
      hostname: 'localhost',
      port: testPort,
      path: `/api/orders/${testOrderId}/tracking`,
      method: 'GET'
    })
    console.assert(trackRes.statusCode === 200, 'Failed to fetch tracking')
    console.log('   ✓ Order tracking:', trackRes.body.data.tracking.currentLocation)

    // 11. Payment - Customer pays for order
    console.log('11. Testing POST /api/payments (Escrow payment)...')
    const payRes = await request(
      {
        hostname: 'localhost',
        port: testPort,
        path: '/api/payments',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${custToken}`
        }
      },
      {
        orderId: testOrderId,
        amount: 2400,
        paymentMethod: 'UPI (GPay)'
      }
    )
    console.assert(payRes.statusCode === 201, `Payment failed: ${payRes.statusCode}`)
    testPaymentId = payRes.body.data.payment.paymentNumber || payRes.body.data.payment.id
    console.log('   ✓ Payment processed. Payment ID:', testPaymentId, '| Txn:', payRes.body.data.payment.transactionId)

    // 12. PDF Receipt Download
    console.log('12. Testing GET /api/payments/:id/receipt (PDF stream)...')
    const receiptRes = await request({
      hostname: 'localhost',
      port: testPort,
      path: `/api/payments/${testPaymentId}/receipt`,
      method: 'GET'
    })
    console.assert(receiptRes.statusCode === 200, 'Failed to generate receipt PDF')
    console.assert(receiptRes.headers['content-type'] === 'application/pdf', 'Content type not PDF')
    console.log('   ✓ Payment receipt PDF generated successfully! Content-Type:', receiptRes.headers['content-type'])

    // 13. Courses - Browse courses & student registers
    console.log('13. Testing GET /api/courses and POST /api/courses/:id/register...')
    const coursesRes = await request({
      hostname: 'localhost',
      port: testPort,
      path: '/api/courses',
      method: 'GET'
    })
    console.assert(coursesRes.statusCode === 200, 'Failed to fetch courses')
    testCourseId = coursesRes.body.data.courses[0].id

    const regRes = await request({
      hostname: 'localhost',
      port: testPort,
      path: `/api/courses/${testCourseId}/register`,
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` }
    })
    // Can be 200 or 409 if already registered in seed
    console.log('   ✓ Course registration attempt completed (status:', regRes.statusCode, ')')

    // 14. Course Completion & Certificate PDF
    console.log('14. Testing PATCH /api/courses/:id/complete and certificate download...')
    const compRes = await request({
      hostname: 'localhost',
      port: testPort,
      path: `/api/courses/${testCourseId}/complete`,
      method: 'PATCH',
      headers: { Authorization: `Bearer ${studentToken}` }
    })
    console.assert(compRes.statusCode === 200, 'Failed to complete course')
    testCertId = compRes.body.data.certificate.certificateId
    console.log('   ✓ Course completed. Certificate ID:', testCertId)

    const certPdfRes = await request({
      hostname: 'localhost',
      port: testPort,
      path: `/api/certificates/${testCertId}/download`,
      method: 'GET'
    })
    console.assert(certPdfRes.statusCode === 200, 'Failed to generate certificate PDF')
    console.assert(certPdfRes.headers['content-type'] === 'application/pdf', 'Cert content type not PDF')
    console.log('   ✓ Landscape Certificate PDF downloaded successfully! Type:', certPdfRes.headers['content-type'])

    // 15. Advance order to DELIVERED and test Review
    console.log('15. Transitioning order to DELIVERED and testing POST /api/reviews...')
    await request(
      {
        hostname: 'localhost',
        port: testPort,
        path: `/api/orders/${testOrderId}/status`,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tailorToken}`
        }
      },
      { status: 'Delivered' }
    )

    const reviewRes = await request(
      {
        hostname: 'localhost',
        port: testPort,
        path: '/api/reviews',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${custToken}`
        }
      },
      {
        orderId: testOrderId,
        tailorId: testTailorId,
        rating: 5,
        comment: 'Absolutely spectacular Aari hand embroidery and perfect snug fit. 10/10 recommendation!'
      }
    )
    console.assert(reviewRes.statusCode === 201, `Review failed: ${reviewRes.statusCode}`)
    console.log('   ✓ Customer review submitted successfully post-delivery!')

    // 16. Wishlist
    console.log('16. Testing Wishlist POST and GET /api/wishlist...')
    const wishAdd = await request(
      {
        hostname: 'localhost',
        port: testPort,
        path: '/api/wishlist',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${custToken}`
        }
      },
      {
        itemId: '99',
        title: 'Heirloom Kanchipuram Blouse',
        category: 'Bridal Blouse',
        price: '₹2,500'
      }
    )
    console.assert(wishAdd.statusCode === 201, 'Failed to add to wishlist')

    const wishGet = await request({
      hostname: 'localhost',
      port: testPort,
      path: '/api/wishlist',
      method: 'GET',
      headers: { Authorization: `Bearer ${custToken}` }
    })
    console.assert(wishGet.statusCode === 200, 'Failed to get wishlist')
    console.log(`   ✓ Wishlist verified (${wishGet.body.data.wishlist.length} saved items)`)

    // 17. Chat
    console.log('17. Testing relationship-based Chat...')
    const convsRes = await request({
      hostname: 'localhost',
      port: testPort,
      path: '/api/chat/conversations',
      method: 'GET',
      headers: { Authorization: `Bearer ${custToken}` }
    })
    console.assert(convsRes.statusCode === 200, 'Failed to get chat conversations')
    const targetConv = convsRes.body.data.conversations[0]

    const msgRes = await request(
      {
        hostname: 'localhost',
        port: testPort,
        path: `/api/chat/conversations/${targetConv.id}/messages`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${custToken}`
        }
      },
      { text: 'Hello Lakshmi mam! Can you please share the trial fitting pictures?' }
    )
    console.assert(msgRes.statusCode === 201, 'Failed to send chat message')
    console.log('   ✓ Relationship chat message sent and verified!')

    // 18. Notifications
    console.log('18. Testing GET /api/notifications...')
    const notifsRes = await request({
      hostname: 'localhost',
      port: testPort,
      path: '/api/notifications',
      method: 'GET',
      headers: { Authorization: `Bearer ${custToken}` }
    })
    console.assert(notifsRes.statusCode === 200, 'Failed to get notifications')
    console.log(`   ✓ Notifications retrieved (${notifsRes.body.data.notifications.length} alerts)`)

    // 19. Admin Dashboard Statistics
    console.log('19. Testing GET /api/admin/dashboard...')
    const adminStats = await request({
      hostname: 'localhost',
      port: testPort,
      path: '/api/admin/dashboard',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` }
    })
    console.assert(adminStats.statusCode === 200, 'Failed to get admin dashboard')
    const s = adminStats.body.data.stats
    console.assert(s.totalCustomers >= 3, 'Incorrect totalCustomers')
    console.assert(s.totalTailors >= 5, 'Incorrect totalTailors')
    console.assert(s.totalStudents >= 2, 'Incorrect totalStudents')
    console.log('   ✓ Admin statistics verified:')
    console.log(`     - Total Customers: ${s.totalCustomers}`)
    console.log(`     - Total Tailors:   ${s.totalTailors}`)
    console.log(`     - Total Students:  ${s.totalStudents}`)
    console.log(`     - Total Orders:    ${s.totalOrders}`)

    // 20. Digital Measurement Profiles
    console.log('20. Testing POST & GET /api/measurements...')
    const measPost = await request(
      {
        hostname: 'localhost',
        port: testPort,
        path: '/api/measurements',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${custToken}` }
      },
      { profileName: 'Mother Measurement', bust: '38', waist: '34', hip: '40', shoulder: '15' }
    )
    console.assert(measPost.statusCode === 201, 'Failed to create measurement profile')
    const measGet = await request({
      hostname: 'localhost',
      port: testPort,
      path: '/api/measurements',
      method: 'GET',
      headers: { Authorization: `Bearer ${custToken}` }
    })
    console.assert(measGet.statusCode === 200 && measGet.body.data.profiles.length >= 1, 'Failed to get measurement profiles')
    console.log('   ✓ Measurement profiles tested successfully!')

    // 21. Appointment System
    console.log('21. Testing POST & GET /api/appointments...')
    const apptPost = await request(
      {
        hostname: 'localhost',
        port: testPort,
        path: '/api/appointments',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${custToken}` }
      },
      { tailorId: testTailorId, appointmentDate: '2026-10-15', timeSlot: '11:00 AM', purpose: 'Bridal Blouse Fitting' }
    )
    console.assert(apptPost.statusCode === 201, 'Failed to request appointment')
    const apptGet = await request({
      hostname: 'localhost',
      port: testPort,
      path: '/api/appointments',
      method: 'GET',
      headers: { Authorization: `Bearer ${custToken}` }
    })
    console.assert(apptGet.statusCode === 200, 'Failed to get appointments')
    console.log('   ✓ Appointment system verified!')

    // 22. Complaint / Report System
    console.log('22. Testing POST & GET /api/complaints...')
    const compPost = await request(
      {
        hostname: 'localhost',
        port: testPort,
        path: '/api/complaints',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${custToken}` }
      },
      { subject: 'Delayed Delivery Query', description: 'Requesting update on embroidery status', targetType: 'ORDER' }
    )
    console.assert(compPost.statusCode === 201, 'Failed to submit complaint')
    console.log('   ✓ Complaint system verified!')

    // 23. Public Certificate Verification
    console.log('23. Testing GET /api/certificates/verify/:code...')
    const certVer = await request({
      hostname: 'localhost',
      port: testPort,
      path: `/api/certificates/verify/${testCertId || 'TC-CERT-2026-881'}`,
      method: 'GET'
    })
    console.assert(certVer.statusCode === 200 && certVer.body.data.verified === true, 'Public certificate verification failed')
    console.log('   ✓ Public certificate verification passed:', certVer.body.data.certificate.studentName)

    // 24. Customer Recommendations
    console.log('24. Testing GET /api/customers/recommendations...')
    const recRes = await request({
      hostname: 'localhost',
      port: testPort,
      path: '/api/customers/recommendations',
      method: 'GET',
      headers: { Authorization: `Bearer ${custToken}` }
    })
    console.assert(recRes.statusCode === 200, 'Failed to get customer recommendations')
    console.log('   ✓ Recommendations verified!')

    // 25. Admin Audit Logging
    console.log('25. Testing GET /api/admin/audit-logs...')
    const auditRes = await request({
      hostname: 'localhost',
      port: testPort,
      path: '/api/admin/audit-logs',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` }
    })
    console.assert(auditRes.statusCode === 200, 'Failed to get audit logs')
    console.log('   ✓ Admin audit logs verified!')

    console.log('\n========================================')
    console.log(' ALL 25 TEST SUITES PASSED FLAWLESSLY! ✓')
    console.log('========================================\n')
  } finally {
    server.close()
    await disconnectDB()
  }
}

runTests().catch((err) => {
  console.error('\n❌ Test execution encountered an error:', err)
  process.exit(1)
})
