import express from 'express'
import {
  getMeasurementProfiles,
  createMeasurementProfile,
  updateMeasurementProfile,
  deleteMeasurementProfile
} from '../controllers/measurementController.js'
import { authenticateUser } from '../middleware/auth.js'

const router = express.Router()

router.use(authenticateUser)

router.get('/', getMeasurementProfiles)
router.post('/', createMeasurementProfile)
router.put('/:id', updateMeasurementProfile)
router.delete('/:id', deleteMeasurementProfile)

export default router
