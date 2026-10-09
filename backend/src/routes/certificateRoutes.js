import express from 'express'
import {
  getStudentCertificates,
  getCertificateById,
  downloadCertificate,
  verifyCertificate
} from '../controllers/certificateController.js'
import { authenticateUser } from '../middleware/auth.js'

const router = express.Router()

router.get('/verify/:code', verifyCertificate)
router.get('/my', authenticateUser, getStudentCertificates)
router.get('/:id', getCertificateById)
router.get('/:id/download', downloadCertificate)

export default router
