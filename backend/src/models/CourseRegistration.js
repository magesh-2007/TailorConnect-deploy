import mongoose from 'mongoose'

const courseRegistrationSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    tailorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    paymentId: { type: String },
    amountPaid: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['REGISTERED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      default: 'REGISTERED'
    },
    registeredAt: { type: Date, default: Date.now },
    completedAt: { type: Date }
  },
  { timestamps: true }
)

courseRegistrationSchema.index({ studentId: 1, courseId: 1 }, { unique: true })

courseRegistrationSchema.virtual('student_id').get(function () { return this.studentId })
courseRegistrationSchema.virtual('course_id').get(function () { return this.courseId })
courseRegistrationSchema.virtual('tailor_id').get(function () { return this.tailorId })
courseRegistrationSchema.virtual('payment_id').get(function () { return this.paymentId })
courseRegistrationSchema.virtual('registered_at').get(function () { return this.registeredAt })
courseRegistrationSchema.virtual('completed_at').get(function () { return this.completedAt })
courseRegistrationSchema.virtual('created_at').get(function () { return this.createdAt })
courseRegistrationSchema.virtual('updated_at').get(function () { return this.updatedAt })

courseRegistrationSchema.set('toJSON', { virtuals: true })
courseRegistrationSchema.set('toObject', { virtuals: true })

export default mongoose.model('CourseRegistration', courseRegistrationSchema)
