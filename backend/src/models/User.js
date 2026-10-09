import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true, lowercase: true, trim: true },
    username: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    password: { type: String },
    role: {
      type: String,
      enum: ['CUSTOMER', 'TAILOR', 'STUDENT', 'ADMIN', 'EMPLOYEE'],
      default: 'CUSTOMER',
      uppercase: true
    },
    phone: { type: String, default: '' },
    age: { type: Number },
    address: { type: String, default: '' },
    location: { type: String, default: 'Chennai' },
    profileImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    googleId: { type: String, unique: true, sparse: true },
    // Real Email Verification using OTP
    emailVerified: { type: Boolean, default: false },
    emailVerifiedAt: { type: Date },
    emailOtpHash: { type: String, select: false },
    emailOtpExpiresAt: { type: Date, select: false },
    emailOtpAttempts: { type: Number, default: 0, select: false },
    emailOtpLastSentAt: { type: Date, select: false }
  },
  { timestamps: true }
)

// Virtual: snake_case aliases for backward compat in controllers
userSchema.virtual('profile_image').get(function () { return this.profileImage })
userSchema.virtual('is_active').get(function () { return this.isActive })
userSchema.virtual('is_verified').get(function () { return this.isVerified })
userSchema.virtual('email_verified').get(function () { return this.emailVerified })
userSchema.virtual('google_id').get(function () { return this.googleId })
userSchema.virtual('created_at').get(function () { return this.createdAt })
userSchema.virtual('updated_at').get(function () { return this.updatedAt })

userSchema.set('toJSON', { virtuals: true })
userSchema.set('toObject', { virtuals: true })

export default mongoose.model('User', userSchema)
