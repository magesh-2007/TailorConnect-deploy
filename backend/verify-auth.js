/**
 * TailorConnect – 5-Role Authentication & Authorization Verification
 *
 * Tests performed per role:
 *   [1] Login via POST /api/auth/login → HTTP 200 + token
 *   [2] JWT payload contains correct role claim
 *   [3] GET /api/auth/me with token → HTTP 200
 *   [4] Own protected API endpoint → HTTP 200
 *
 * Cross-role blocking tests:
 *   Customer, Tailor, Student, Employee → /admin/dashboard → 403
 *   No token → /admin/dashboard → 401
 *   Tailor → /customers/profile → 403
 *   Student → /tailors/profile → 403
 *   Customer → /employees/dashboard → 403
 *
 * Usage: node verify-auth.js
 * Run AFTER the server is running (npm run dev or node src/server.js)
 */

import http from 'node:http'

const BASE_HOST = 'localhost'
const BASE_PORT = 5000
const BASE_PATH = '/api'

// ── 5 Test Accounts ──────────────────────────────────────────────────────────
const ROLES = [
  {
    role: 'ADMIN',
    email: 'admin@tailorconnect.com',
    password: 'admin123',
    ownPath: '/admin/dashboard',
    label: 'Platform Admin'
  },
  {
    role: 'TAILOR',
    email: 'tailor@tailorconnect.com',
    password: 'tailor123',
    ownPath: '/tailors/profile',
    label: 'Tailor'
  },
  {
    role: 'CUSTOMER',
    email: 'customer@tailorconnect.com',
    password: 'customer123',
    ownPath: '/customers/profile',
    label: 'Customer'
  },
  {
    role: 'STUDENT',
    email: 'student@tailorconnect.com',
    password: 'student123',
    ownPath: '/students/profile',
    label: 'Student'
  },
  {
    role: 'EMPLOYEE',
    email: 'employee@tailorconnect.com',
    password: 'employee123',
    ownPath: '/employees/dashboard',
    label: 'Employee'
  }
]

// ── HTTP helper ───────────────────────────────────────────────────────────────
function apiRequest(method, apiPath, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : null
    const options = {
      hostname: BASE_HOST,
      port: BASE_PORT,
      path: BASE_PATH + apiPath,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    }

    const req = http.request(options, (res) => {
      let raw = ''
      res.on('data', (chunk) => { raw += chunk })
      res.on('end', () => {
        let parsed
        try { parsed = JSON.parse(raw) } catch { parsed = raw }
        resolve({ status: res.statusCode, body: parsed })
      })
    })

    req.on('error', reject)
    req.setTimeout(10000, () => { req.destroy(new Error('Request timed out')) })
    if (postData) req.write(postData)
    req.end()
  })
}

// ── Decode JWT payload (no verification, just inspect) ────────────────────────
function decodeJwtPayload(token) {
  try {
    const part = token.split('.')[1]
    // Pad for base64 decode
    const padded = part + '=='.slice(0, (4 - part.length % 4) % 4)
    return JSON.parse(Buffer.from(padded, 'base64').toString('utf8'))
  } catch {
    return null
  }
}

// ── Test one role ─────────────────────────────────────────────────────────────
async function testRole({ role, email, password, ownPath }) {
  const hr = '─'.repeat(65)
  console.log(`\n${hr}`)
  console.log(`  Role: ${role.padEnd(10)}| Email: ${email}`)
  console.log(hr)

  const result = { role, login: false, jwtRole: false, me: false, ownRoute: false, token: null }

  // ── [1] Login ──────────────────────────────────────────────────────────────
  let loginRes
  try {
    loginRes = await apiRequest('POST', '/auth/login', { identifier: email, password, role })
  } catch (err) {
    console.log(`  [1] Login          : ❌ NETWORK ERROR – ${err.message}`)
    return result
  }

  const token = loginRes.body?.data?.token
  const userData = loginRes.body?.data?.user

  if (loginRes.status === 200 && token) {
    result.login = true
    result.token = token
    console.log(`  [1] Login          : ✅ PASSED  (HTTP ${loginRes.status})`)
    console.log(`       User           : ${userData?.name}  (id: ${userData?.id || userData?._id})`)
  } else {
    console.log(`  [1] Login          : ❌ FAILED  (HTTP ${loginRes.status})`)
    console.log(`       Reason         : ${loginRes.body?.message || JSON.stringify(loginRes.body)}`)
    return result
  }

  // ── [2] JWT role claim ─────────────────────────────────────────────────────
  const payload = decodeJwtPayload(token)
  if (payload) {
    const claimedRole = (payload.role || '').toUpperCase()
    result.jwtRole = claimedRole === role
    const icon = result.jwtRole ? '✅' : '❌'
    console.log(`  [2] JWT role claim : ${icon} ${result.jwtRole ? 'PASSED' : 'FAILED'}  (claim="${claimedRole}", expected="${role}")`)
    console.log(`       JWT exp        : ${new Date(payload.exp * 1000).toISOString()}`)
  } else {
    console.log(`  [2] JWT role claim : ❌ FAILED  (could not decode token)`)
  }

  // ── [3] GET /auth/me ───────────────────────────────────────────────────────
  const meRes = await apiRequest('GET', '/auth/me', null, token)
  result.me = meRes.status === 200
  console.log(`  [3] GET /auth/me   : ${result.me ? '✅ PASSED' : '❌ FAILED'}  (HTTP ${meRes.status})`)
  if (result.me) {
    const u = meRes.body?.data?.user
    console.log(`       Returned as   : ${u?.email}  role=${u?.role}`)
  }

  // ── [4] Own protected route ────────────────────────────────────────────────
  const ownRes = await apiRequest('GET', ownPath, null, token)
  result.ownRoute = ownRes.status === 200
  console.log(`  [4] Own API route  : ${result.ownRoute ? '✅ PASSED' : '❌ FAILED'}  (GET ${ownPath}, HTTP ${ownRes.status})`)

  return result
}

// ── Cross-role blocking ───────────────────────────────────────────────────────
async function testCrossRoleBlocking(tokens) {
  const hr = '─'.repeat(65)
  console.log(`\n${hr}`)
  console.log('  Cross-Role Authorization Blocking Tests')
  console.log(hr)

  const cases = [
    // [requestingRole, path, expectedStatus, description]
    ['CUSTOMER', '/admin/dashboard',     403, 'Customer MUST NOT access Admin Dashboard'],
    ['STUDENT',  '/admin/dashboard',     403, 'Student  MUST NOT access Admin Dashboard'],
    ['TAILOR',   '/admin/dashboard',     403, 'Tailor   MUST NOT access Admin Dashboard'],
    ['EMPLOYEE', '/admin/dashboard',     403, 'Employee MUST NOT access Admin Dashboard'],
    ['TAILOR',   '/customers/profile',   403, 'Tailor   MUST NOT access Customer APIs'],
    ['STUDENT',  '/tailors/profile',     403, 'Student  MUST NOT access Tailor APIs'],
    ['CUSTOMER', '/employees/dashboard', 403, 'Customer MUST NOT access Employee APIs'],
    [null,       '/admin/dashboard',     401, 'No token MUST NOT access any protected API'],
  ]

  let allBlocked = true
  for (const [roleKey, path, expectedStatus, desc] of cases) {
    const token = roleKey ? tokens[roleKey] : null
    if (roleKey && !token) {
      console.log(`  ⚠️  Skipped (no token for ${roleKey}): ${desc}`)
      continue
    }
    const res = await apiRequest('GET', path, null, token)
    const blocked = res.status === expectedStatus
    if (!blocked) allBlocked = false
    const icon = blocked ? '✅' : '❌'
    console.log(`  ${icon} ${blocked ? 'BLOCKED' : 'NOT BLOCKED'} (HTTP ${res.status}) – ${desc}`)
  }

  return allBlocked
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const eq = '='.repeat(65)
  console.log(`\n${eq}`)
  console.log('  TailorConnect – 5-Role Authentication Verification')
  console.log(`  ${new Date().toISOString()}`)
  console.log(eq)

  // First: health check
  try {
    const health = await apiRequest('GET', '/health')
    if (health.status === 200) {
      console.log(`\n  ✅ Backend health check passed (HTTP ${health.status})`)
    } else {
      console.log(`\n  ⚠️  Backend returned HTTP ${health.status} on health check`)
    }
  } catch (err) {
    console.log(`\n  ❌ Cannot reach backend: ${err.message}`)
    console.log('     Make sure the server is running on http://localhost:5000')
    process.exit(1)
  }

  const tokens = {}
  const results = []

  // Test each role
  for (const roleConfig of ROLES) {
    const result = await testRole(roleConfig)
    results.push(result)
    if (result.token) tokens[roleConfig.role] = result.token
  }

  // Cross-role blocking
  const allBlocked = await testCrossRoleBlocking(tokens)

  // ── Final Summary ─────────────────────────────────────────────────────────
  console.log(`\n${eq}`)
  console.log('  FINAL SUMMARY')
  console.log(eq)
  console.log('')
  console.log('  Role        Login  JWT    /me    OwnAPI  Overall')
  console.log('  ' + '─'.repeat(57))

  let allPassed = true
  for (const r of results) {
    const cols = [
      r.login    ? '✅' : '❌',
      r.jwtRole  ? '✅' : '❌',
      r.me       ? '✅' : '❌',
      r.ownRoute ? '✅' : '❌'
    ]
    const overall = r.login && r.jwtRole && r.me && r.ownRoute
    if (!overall) allPassed = false
    console.log(`  ${r.role.padEnd(12)}${cols.join('      ')}   ${overall ? '✅ PASS' : '❌ FAIL'}`)
  }

  console.log('')
  console.log(`  Cross-role blocking : ${allBlocked ? '✅ ALL BLOCKED' : '❌ SOME NOT BLOCKED'}`)
  console.log('')
  console.log(`  ${'─'.repeat(55)}`)
  console.log(`  Overall Result : ${allPassed && allBlocked ? '✅  ALL TESTS PASSED' : '❌  SOME TESTS FAILED'}`)
  console.log(`  ${'─'.repeat(55)}`)
  console.log('')
}

main().catch((err) => {
  console.error('Verification script error:', err)
  process.exit(1)
})
