import Certificate from '../models/Certificate.js'
import { sendSuccess, sendError } from '../utils/response.js'
import { generateCertificatePdf } from '../services/pdfService.js'

export const getStudentCertificates = async (req, res, next) => {
  try {
    const certs = await Certificate.find({ studentId: req.user._id }).sort({ createdAt: -1 })
    return sendSuccess(res, 'Student certificates.', { certificates: certs.map((c) => c.toObject()) })
  } catch (err) {
    next(err)
  }
}

export const getCertificateById = async (req, res, next) => {
  try {
    const { id } = req.params
    const isObjectId = /^[a-f\d]{24}$/i.test(id)
    const filter = isObjectId ? { _id: id } : { certificateId: id }

    const cert = await Certificate.findOne(filter).catch(() => null)
    if (!cert) return sendError(res, 'Certificate not found.', 404)
    return sendSuccess(res, 'Certificate details.', { certificate: cert.toObject() })
  } catch (err) {
    next(err)
  }
}

export const downloadCertificate = async (req, res, next) => {
  try {
    const { id } = req.params
    const isObjectId = /^[a-f\d]{24}$/i.test(id)
    const filter = isObjectId ? { _id: id } : { certificateId: id }

    const cert = await Certificate.findOne(filter).catch(() => null)
    if (!cert) return sendError(res, 'Certificate not found.', 404)

    const obj = cert.toObject()
    const mapped = {
      ...obj,
      certificateId: obj.certificateId,
      studentName: obj.studentName,
      studentEmail: obj.studentEmail,
      courseName: obj.courseName,
      tailorName: obj.tailorName,
      shopName: obj.shopName,
      completionDate: obj.completionDate,
      verificationCode: obj.verificationCode
    }
    generateCertificatePdf(mapped, res)
  } catch (err) {
    next(err)
  }
}

export const verifyCertificate = async (req, res, next) => {
  try {
    const { code } = req.params
    if (!code) {
      return sendError(res, 'Certificate ID or verification code is required.', 400)
    }

    const cert = await Certificate.findOne({
      $or: [
        { certificateId: code },
        { verificationCode: code },
        { _id: /^[a-f\d]{24}$/i.test(code) ? code : null }
      ]
    })

    if (!cert) {
      return sendSuccess(res, 'Certificate verification result.', {
        verified: false,
        status: 'INVALID',
        message: 'No valid certificate found matching the provided code.'
      })
    }

    return sendSuccess(res, 'Certificate verified successfully.', {
      verified: true,
      status: 'VALID',
      certificate: {
        certificateId: cert.certificateId,
        studentName: cert.studentName,
        courseName: cert.courseName,
        tailorName: cert.tailorName || 'Master Tailor',
        shopName: cert.shopName || 'TailorConnect Academy',
        completionDate: cert.completionDate,
        duration: cert.duration || '15 Days',
        grade: cert.grade || 'Certified Professional Distinction',
        verificationCode: cert.verificationCode || cert.certificateId
      }
    })
  } catch (err) {
    next(err)
  }
}

