import MeasurementProfile from '../models/MeasurementProfile.js'
import { sendSuccess, sendError } from '../utils/response.js'

export const getMeasurementProfiles = async (req, res, next) => {
  try {
    const profiles = await MeasurementProfile.find({ customerId: req.user._id }).sort({ isDefault: -1, createdAt: -1 })
    return sendSuccess(res, 'Measurement profiles retrieved.', { profiles })
  } catch (err) {
    next(err)
  }
}

export const createMeasurementProfile = async (req, res, next) => {
  try {
    const { profileName, bust, waist, hip, shoulder, sleeveLength, armhole, neck, dressLength, chest, inseam, notes, isDefault } = req.body
    if (!profileName) {
      return sendError(res, 'Profile name is required.', 400)
    }

    if (isDefault) {
      await MeasurementProfile.updateMany({ customerId: req.user._id }, { isDefault: false })
    }

    const profile = await MeasurementProfile.create({
      customerId: req.user._id,
      profileName,
      bust: bust || '36',
      waist: waist || '30',
      hip: hip || '38',
      shoulder: shoulder || '14.5',
      sleeveLength: sleeveLength || '11.0',
      armhole: armhole || '16.5',
      neck: neck || '7.0',
      dressLength: dressLength || '15.0',
      chest: chest || '36',
      inseam: inseam || '30',
      notes: notes || '',
      isDefault: Boolean(isDefault)
    })

    return sendSuccess(res, 'Measurement profile created.', { profile }, 201)
  } catch (err) {
    next(err)
  }
}

export const updateMeasurementProfile = async (req, res, next) => {
  try {
    const { id } = req.params
    const profile = await MeasurementProfile.findOne({ _id: id, customerId: req.user._id })
    if (!profile) {
      return sendError(res, 'Measurement profile not found.', 404)
    }

    if (req.body.isDefault) {
      await MeasurementProfile.updateMany({ customerId: req.user._id }, { isDefault: false })
    }

    Object.assign(profile, req.body)
    await profile.save()

    return sendSuccess(res, 'Measurement profile updated.', { profile })
  } catch (err) {
    next(err)
  }
}

export const deleteMeasurementProfile = async (req, res, next) => {
  try {
    const { id } = req.params
    const profile = await MeasurementProfile.findOneAndDelete({ _id: id, customerId: req.user._id })
    if (!profile) {
      return sendError(res, 'Measurement profile not found.', 404)
    }
    return sendSuccess(res, 'Measurement profile deleted.')
  } catch (err) {
    next(err)
  }
}
