import express from 'express'
import {
  getAppointments,
  createAppointment,
  updateAppointmentStatus
} from '../controllers/appointmentController.js'
import { authenticateUser } from '../middleware/auth.js'

const router = express.Router()

router.use(authenticateUser)

router.get('/', getAppointments)
router.post('/', createAppointment)
router.patch('/:id/status', updateAppointmentStatus)

export default router
