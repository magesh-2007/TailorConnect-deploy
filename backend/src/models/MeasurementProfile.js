import mongoose from 'mongoose'

const measurementProfileSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    profileName: { type: String, required: true, default: 'Personal' },
    bust: { type: String, default: '36' },
    waist: { type: String, default: '30' },
    hip: { type: String, default: '38' },
    shoulder: { type: String, default: '14.5' },
    sleeveLength: { type: String, default: '11.0' },
    armhole: { type: String, default: '16.5' },
    neck: { type: String, default: '7.0' },
    dressLength: { type: String, default: '15.0' },
    chest: { type: String, default: '36' },
    inseam: { type: String, default: '30' },
    notes: { type: String, default: '' },
    isDefault: { type: Boolean, default: false }
  },
  { timestamps: true }
)

measurementProfileSchema.virtual('customer_id').get(function () { return this.customerId })
measurementProfileSchema.virtual('profile_name').get(function () { return this.profileName })

measurementProfileSchema.set('toJSON', { virtuals: true })
measurementProfileSchema.set('toObject', { virtuals: true })

export default mongoose.model('MeasurementProfile', measurementProfileSchema)
