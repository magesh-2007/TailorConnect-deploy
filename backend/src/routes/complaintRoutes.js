import express from 'express'
import {
  getComplaints,
  createComplaint,
  updateComplaintStatus
} from '../controllers/complaintController.js'
import { authenticateUser } from '../middleware/auth.js'

const router = express.Router()

router.use(authenticateUser)

router.get('/', getComplaints)
router.post('/', createComplaint)
router.patch('/:id', updateComplaintStatus)

export default router
