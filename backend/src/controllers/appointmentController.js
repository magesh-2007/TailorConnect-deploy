import Appointment from '../models/Appointment.js'
import TailorProfile from '../models/TailorProfile.js'
import User from '../models/User.js'
import Notification from '../models/Notification.js'
import { sendSuccess, sendError } from '../utils/response.js'
import { emitNotification } from '../services/socketService.js'

export const getAppointments = async (req, res, next) => {
  try {
    const filter = {}
    if (req.user.role === 'CUSTOMER') {
      filter.customerId = req.user._id
    } else if (req.user.role === 'TAILOR') {
      filter.tailorId = req.user._id
    }
    const appointments = await Appointment.find(filter).sort({ appointmentDate: 1, timeSlot: 1 })
    return sendSuccess(res, 'Appointments retrieved.', { appointments })
  } catch (err) {
    next(err)
  }
}

export const createAppointment = async (req, res, next) => {
  try {
    const { tailorId, appointmentDate, timeSlot, purpose, meetingType, notes } = req.body
    if (!tailorId || !appointmentDate || !timeSlot) {
      return sendError(res, 'Tailor, date, and time slot are required.', 400)
    }

    const tailorUser = await User.findById(tailorId)
    if (!tailorUser) {
      return sendError(res, 'Tailor not found.', 404)
    }
    const tailorProfile = await TailorProfile.findOne({ userId: tailorId })

    // Prevent double booking on the same date/timeSlot for this tailor
    const existing = await Appointment.findOne({
      tailorId,
      appointmentDate,
      timeSlot,
      status: { $in: ['REQUESTED', 'CONFIRMED'] }
    })
    if (existing) {
      return sendError(res, 'Tailor already has a confirmed appointment at this date and time slot.', 400)
    }

    const appointment = await Appointment.create({
      customerId: req.user._id,
      customerName: req.user.name,
      customerPhone: req.user.phone || '',
      tailorId,
      tailorName: tailorUser.name,
      shopName: tailorProfile?.shopName || 'Tailor Studio',
      appointmentDate,
      timeSlot,
      purpose: purpose || 'Fitting & Consultation',
      meetingType: meetingType || 'IN_STORE',
      notes: notes || ''
    })

    // Create notification for tailor
    const notif = await Notification.create({
      userId: tailorId,
      type: 'APPOINTMENT_REQUESTED',
      title: 'New Appointment Request',
      message: `${req.user.name} requested an appointment on ${appointmentDate} at ${timeSlot}.`,
      relatedId: appointment._id.toString()
    })
    emitNotification(tailorId, notif)

    return sendSuccess(res, 'Appointment requested successfully.', { appointment }, 201)
  } catch (err) {
    next(err)
  }
}

export const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { id } = req.params
    const { status, notes } = req.body

    const appointment = await Appointment.findById(id)
    if (!appointment) {
      return sendError(res, 'Appointment not found.', 404)
    }

    if (status) appointment.status = status
    if (notes) appointment.notes = notes
    await appointment.save()

    // Notify customer
    const notif = await Notification.create({
      userId: appointment.customerId,
      type: 'APPOINTMENT_UPDATED',
      title: 'Appointment Status Updated',
      message: `Your appointment with ${appointment.shopName} is now ${appointment.status}.`,
      relatedId: appointment._id.toString()
    })
    emitNotification(appointment.customerId, notif)

    return sendSuccess(res, 'Appointment status updated.', { appointment })
  } catch (err) {
    next(err)
  }
}
