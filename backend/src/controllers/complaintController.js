import Complaint from '../models/Complaint.js'
import { sendSuccess, sendError } from '../utils/response.js'

export const getComplaints = async (req, res, next) => {
  try {
    const filter = {}
    if (req.user.role !== 'ADMIN') {
      filter.userId = req.user._id
    }
    const complaints = await Complaint.find(filter).sort({ createdAt: -1 })
    return sendSuccess(res, 'Complaints retrieved.', { complaints })
  } catch (err) {
    next(err)
  }
}

export const createComplaint = async (req, res, next) => {
  try {
    const { targetType, targetId, subject, description, priority } = req.body
    if (!subject || !description) {
      return sendError(res, 'Subject and description are required.', 400)
    }

    const ticketNumber = `TC-TKT-${Math.floor(100000 + Math.random() * 900000)}`

    const complaint = await Complaint.create({
      ticketNumber,
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      targetType: targetType || 'ORDER',
      targetId: targetId || '',
      subject,
      description,
      priority: priority || 'MEDIUM',
      status: 'OPEN'
    })

    return sendSuccess(res, 'Complaint submitted successfully.', { complaint }, 201)
  } catch (err) {
    next(err)
  }
}

export const updateComplaintStatus = async (req, res, next) => {
  try {
    const { id } = req.params
    const { status, resolutionNotes, assignedTo } = req.body

    const complaint = await Complaint.findById(id)
    if (!complaint) {
      return sendError(res, 'Complaint ticket not found.', 404)
    }

    if (status) complaint.status = status
    if (resolutionNotes !== undefined) complaint.resolutionNotes = resolutionNotes
    if (assignedTo) complaint.assignedTo = assignedTo
    await complaint.save()

    return sendSuccess(res, 'Complaint ticket updated.', { complaint })
  } catch (err) {
    next(err)
  }
}
