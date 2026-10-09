import mongoose from 'mongoose'

const auditLogSchema = new mongoose.Schema(
  {
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    performerName: { type: String, required: true },
    performerRole: { type: String, required: true },
    action: { type: String, required: true },
    entity: { type: String, required: true },
    entityId: { type: String },
    details: { type: String, default: '' },
    ipAddress: { type: String, default: '127.0.0.1' },
    result: { type: String, enum: ['SUCCESS', 'FAILURE', 'WARNING'], default: 'SUCCESS' }
  },
  { timestamps: true }
)

auditLogSchema.set('toJSON', { virtuals: true })
auditLogSchema.set('toObject', { virtuals: true })

export default mongoose.model('AuditLog', auditLogSchema)
