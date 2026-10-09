import mongoose from 'mongoose'

const complaintSchema = new mongoose.Schema(
  {
    ticketNumber: { type: String, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    userRole: { type: String, default: 'CUSTOMER' },
    targetType: { type: String, enum: ['TAILOR', 'ORDER', 'PAYMENT', 'COURSE', 'REVIEW', 'OTHER'], default: 'ORDER' },
    targetId: { type: String },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], default: 'MEDIUM' },
    status: {
      type: String,
      enum: ['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED', 'CLOSED'],
      default: 'OPEN'
    },
    assignedTo: { type: String, default: 'Support Team' },
    resolutionNotes: { type: String, default: '' }
  },
  { timestamps: true }
)

complaintSchema.set('toJSON', { virtuals: true })
complaintSchema.set('toObject', { virtuals: true })

export default mongoose.model('Complaint', complaintSchema)
