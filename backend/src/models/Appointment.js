import mongoose from 'mongoose'

const appointmentSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, default: '' },
    tailorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tailorName: { type: String, required: true },
    shopName: { type: String, default: '' },
    appointmentDate: { type: String, required: true },
    timeSlot: { type: String, required: true },
    purpose: { type: String, default: 'Bridal Blouse Measurement & Consultation' },
    meetingType: { type: String, enum: ['IN_STORE', 'HOME_VISIT', 'VIRTUAL'], default: 'IN_STORE' },
    notes: { type: String, default: '' },
    status: {
      type: String,
      enum: ['REQUESTED', 'CONFIRMED', 'RESCHEDULED', 'COMPLETED', 'CANCELLED'],
      default: 'REQUESTED'
    }
  },
  { timestamps: true }
)

appointmentSchema.virtual('customer_id').get(function () { return this.customerId })
appointmentSchema.virtual('tailor_id').get(function () { return this.tailorId })

appointmentSchema.set('toJSON', { virtuals: true })
appointmentSchema.set('toObject', { virtuals: true })

export default mongoose.model('Appointment', appointmentSchema)
