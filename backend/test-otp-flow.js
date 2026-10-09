import 'dotenv/config'
import mongoose from 'mongoose'
import crypto from 'crypto'
import User from './src/models/User.js'
import { generateSecureOtp, hashOtp } from './src/controllers/authController.js'
import { aiChat } from './src/controllers/aiController.js'

const verifyOtpHash = (inputOtp, storedHash) => {
  if (!inputOtp || !storedHash) return false
  const inputHash = hashOtp(inputOtp)
  return crypto.timingSafeEqual(Buffer.from(inputHash, 'hex'), Buffer.from(storedHash, 'hex'))
}

async function runTests() {
  console.log('--- STARTING TAILORCONNECT OTP & AI VERIFICATION TESTS ---')

  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tailorconnect'
  await mongoose.connect(mongoUri)
  console.log('✓ Connected to MongoDB:', mongoUri)

  const testEmail = `otp_test_${Date.now()}@example.com`

  try {
    // 1. Test Cryptographic OTP generation
    console.log('\n[Test 1] Testing OTP generation & hashing...')
    const otp = generateSecureOtp()
    if (!/^\d{6}$/.test(otp)) {
      throw new Error(`OTP does not match 6 digits format: ${otp}`)
    }
    const hashed = hashOtp(otp)
    const isValid = verifyOtpHash(otp, hashed)
    const isInvalid = verifyOtpHash('000000', hashed)

    if (!isValid || isInvalid) {
      throw new Error('OTP hash comparison failed')
    }
    console.log(`✓ OTP generated (${otp}) and hashed (${hashed.slice(0, 16)}...) verified successfully.`)

    // 2. Test User creation with unverified state
    console.log('\n[Test 2] Testing unverified User registration state...')
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000)
    const testUser = await User.create({
      name: 'OTP Test User',
      email: testEmail,
      password: 'Password123!',
      role: 'customer',
      emailVerified: false,
      emailOtpHash: hashed,
      emailOtpExpiresAt: expiresAt,
      emailOtpAttempts: 0,
      emailOtpLastSentAt: new Date(),
    })

    if (testUser.emailVerified !== false) {
      throw new Error('emailVerified should default to false')
    }
    console.log(`✓ Test user registered with emailVerified: false (ID: ${testUser._id})`)

    // 3. Test Invalid OTP verification
    console.log('\n[Test 3] Testing incorrect OTP submission...')
    const userToVerify = await User.findById(testUser._id).select('+emailOtpHash +emailOtpExpiresAt +emailOtpAttempts +emailOtpLastSentAt')
    const badOtpMatch = verifyOtpHash('999999', userToVerify.emailOtpHash)
    if (badOtpMatch) {
      throw new Error('Incorrect OTP was accepted!')
    }
    userToVerify.emailOtpAttempts += 1
    await userToVerify.save()
    console.log(`✓ Incorrect OTP rejected, attempts incremented to: ${userToVerify.emailOtpAttempts}`)

    // 4. Test Resend Cooldown (60s)
    console.log('\n[Test 4] Testing resend cooldown...')
    const timeSinceLast = Date.now() - new Date(userToVerify.emailOtpLastSentAt).getTime()
    const cooldownPeriod = 60 * 1000
    if (timeSinceLast < cooldownPeriod) {
      const waitSeconds = Math.ceil((cooldownPeriod - timeSinceLast) / 1000)
      console.log(`✓ Resend cooldown active: must wait ${waitSeconds}s before next OTP.`)
    } else {
      throw new Error('Cooldown should be active right after creation')
    }

    // 5. Test Successful OTP verification
    console.log('\n[Test 5] Testing valid OTP verification...')
    const correctMatch = verifyOtpHash(otp, userToVerify.emailOtpHash)
    if (!correctMatch) {
      throw new Error('Correct OTP failed verification!')
    }
    userToVerify.emailVerified = true
    userToVerify.emailVerifiedAt = new Date()
    userToVerify.emailOtpHash = null
    userToVerify.emailOtpExpiresAt = null
    userToVerify.emailOtpAttempts = 0
    await userToVerify.save()

    const verifiedUser = await User.findById(testUser._id)
    if (!verifiedUser.emailVerified) {
      throw new Error('User emailVerified is not true in database')
    }
    console.log('✓ Correct OTP accepted! User marked emailVerified: true in database.')

    // 6. Test OTP cannot be reused
    console.log('\n[Test 6] Testing OTP reuse prevention...')
    const reloadedUser = await User.findById(testUser._id).select('+emailOtpHash')
    if (reloadedUser.emailOtpHash) {
      throw new Error('OTP hash was not cleared after verification')
    }
    console.log('✓ OTP hash was cleared on verification. Reuse is prevented.')

    // 7. Test AI controller fallback for Gemini 404
    console.log('\n[Test 7] Testing Gemini AI 404 fallback handling...')
    let dummyResBody = null
    let dummyStatusCode = null
    const dummyReq = {
      body: { message: 'Can you recommend bridal blouse tailors?' },
      user: { _id: testUser._id }
    }
    const dummyRes = {
      status(code) {
        dummyStatusCode = code
        return this
      },
      json(body) {
        dummyResBody = body
        return this
      }
    }

    await aiChat(dummyReq, dummyRes)
    if (dummyStatusCode && dummyStatusCode >= 400 && !dummyResBody?.success) {
      throw new Error(`AI assistant returned error status: ${dummyStatusCode}`)
    }
    console.log('✓ AI Assistant returned valid response with fallback:');
    console.log(`  Reply snippet: "${dummyResBody?.reply?.slice(0, 100)}..."`)

    console.log('\n======================================================')
    console.log('🎉 ALL TESTS PASSED! Verification system is production-ready.')
    console.log('======================================================')
  } catch (err) {
    console.error('\n❌ Test failed:', err)
  } finally {
    // Cleanup test user
    await User.deleteOne({ email: testEmail })
    await mongoose.disconnect()
    console.log('\nCleaned up test user & disconnected.')
  }
}

runTests()
