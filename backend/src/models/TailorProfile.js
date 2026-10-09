import mongoose from 'mongoose'

const tailorProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    shopName: { type: String, required: true },
    shopLocation: { type: String, default: 'Chennai' },
    specialist: { type: String, default: 'Bridal Blouse & Aari Work Specialist' },
    experience: { type: String, default: '5 yrs' },
    about: { type: String, default: 'Experienced custom tailoring and designer embroidery studio.' },
    services: { type: [String], default: ['Aari Blouse Stitching', 'Bridal Blouse Designing', 'Silk Saree Kuchu', 'Custom Fit Alteration'] },
    rating: { type: Number, default: 4.8 },
    reviewCount: { type: Number, default: 0 },
    verificationStatus: { type: String, enum: ['PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'SUSPENDED'], default: 'VERIFIED' },
    dailyCapacity: { type: Number, default: 5 },
    urgentAvailable: { type: Boolean, default: true },
    avatar: { type: String },
    coverImage: { type: String },
    locationCoords: {
      lat: { type: Number, default: 13.0827 },
      lng: { type: Number, default: 80.2707 }
    },
    startingPrice: { type: Number, default: 1200 },
    estimatedDeliveryTime: { type: String, default: '3-5 Days' },
    completedOrders: { type: Number, default: 48 },
    totalEarnings: { type: Number, default: 0 },
    responseTime: { type: String, default: '< 30 mins' },
    satisfactionRate: { type: Number, default: 98 }
  },
  { timestamps: true }
)

// Snake_case virtuals for controller compatibility
tailorProfileSchema.virtual('user_id').get(function () { return this.userId })
tailorProfileSchema.virtual('shop_name').get(function () { return this.shopName })
tailorProfileSchema.virtual('shop_location').get(function () { return this.shopLocation })
tailorProfileSchema.virtual('review_count').get(function () { return this.reviewCount })
tailorProfileSchema.virtual('verification_status').get(function () { return this.verificationStatus })
tailorProfileSchema.virtual('daily_capacity').get(function () { return this.dailyCapacity })
tailorProfileSchema.virtual('urgent_available').get(function () { return this.urgentAvailable })
tailorProfileSchema.virtual('cover_image').get(function () { return this.coverImage })
tailorProfileSchema.virtual('created_at').get(function () { return this.createdAt })
tailorProfileSchema.virtual('updated_at').get(function () { return this.updatedAt })

tailorProfileSchema.set('toJSON', { virtuals: true })
tailorProfileSchema.set('toObject', { virtuals: true })

export default mongoose.model('TailorProfile', tailorProfileSchema)
