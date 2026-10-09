import Offer from '../models/Offer.js'
import User from '../models/User.js'
import TailorProfile from '../models/TailorProfile.js'
import { sendSuccess, sendError } from '../utils/response.js'

const formatOffer = (o) => {
  const obj = o.toObject ? o.toObject() : { ...o }
  return {
    ...obj,
    id: obj._id,
    tailorId: obj.tailorId,
    targetAudience: obj.targetAudience,
    durationDays: obj.durationDays,
    startDate: obj.startDate,
    endDate: obj.endDate,
    startTime: obj.startTime,
    endTime: obj.endTime,
    maxRegistrations: obj.maxRegistrations,
    currentRegistrations: obj.currentRegistrations,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
    remainingSeats: Math.max(0, (obj.maxRegistrations || 0) - (obj.currentRegistrations || 0)),
    name: obj.title
  }
}

export const getOffers = async (req, res, next) => {
  try {
    const { targetAudience, status, category, tailorId, page = 1, limit = 20 } = req.query
    const skip = (Number(page) - 1) * Number(limit)

    const filter = {}
    if (status) filter.status = status
    if (tailorId) filter.tailorId = tailorId
    if (targetAudience && targetAudience !== 'All') filter.targetAudience = targetAudience
    if (category && category !== 'All') filter.category = new RegExp(category, 'i')

    const [offers, total] = await Promise.all([
      Offer.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Offer.countDocuments(filter)
    ])

    const trainerIds = [...new Set(offers.map((o) => o.tailorId.toString()))]
    const trainers = await User.find({ _id: { $in: trainerIds } })
    const trainerProfiles = await TailorProfile.find({ userId: { $in: trainerIds } })
    const trainerMap = Object.fromEntries(trainers.map((u) => [u._id.toString(), u]))
    const profileMap = Object.fromEntries(trainerProfiles.map((p) => [p.userId.toString(), p]))

    const formatted = offers.map((o) => {
      const json = formatOffer(o)
      const t = trainerMap[o.tailorId.toString()]
      const tp = profileMap[o.tailorId.toString()]
      json.trainerName = t?.name || ''
      json.shopName = tp?.shopName || `${t?.name || ''}'s Studio`
      return json
    })

    return sendSuccess(res, 'Offers retrieved.', {
      offers: formatted,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    })
  } catch (err) {
    next(err)
  }
}

export const getMyOffers = async (req, res, next) => {
  try {
    const offers = await Offer.find({ tailorId: req.user._id }).sort({ createdAt: -1 })
    return sendSuccess(res, 'Tailor offers.', { offers: offers.map(formatOffer) })
  } catch (err) {
    next(err)
  }
}

export const getOfferById = async (req, res, next) => {
  try {
    const { id } = req.params
    const offer = await Offer.findById(id).catch(() => null)
    if (!offer) return sendError(res, 'Offer not found.', 404)

    const [trainer, trainerProfile] = await Promise.all([
      User.findById(offer.tailorId),
      TailorProfile.findOne({ userId: offer.tailorId })
    ])

    const json = formatOffer(offer)
    json.trainerName = trainer?.name || ''
    json.shopName = trainerProfile?.shopName

    return sendSuccess(res, 'Offer details.', { offer: json })
  } catch (err) {
    next(err)
  }
}

export const createOffer = async (req, res, next) => {
  try {
    const {
      title, name, category, description, targetAudience, mode, duration, durationDays,
      startDate, endDate, days, availableDays, startTime, endTime, location,
      price, maxRegistrations, maxCapacity, image, requirements, content, whatWillBeTaught
    } = req.body

    const offerTitle = (title || name || '').trim()
    if (!offerTitle) return sendError(res, 'Offer title is required.', 400)

    const offer = await Offer.create({
      tailorId: req.user._id,
      title: offerTitle,
      category: category || 'Bridal Blouse',
      description: description || '',
      targetAudience: (targetAudience || 'STUDENT').toUpperCase(),
      mode: (mode || 'OFFLINE').toUpperCase(),
      duration: duration || `${durationDays || 15} Days`,
      durationDays: Number(durationDays) || 15,
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      days: days || availableDays || 'Monday to Friday',
      startTime: startTime || '10:00 AM',
      endTime: endTime || '12:00 PM',
      location: location || 'Chennai',
      price: Number(price) || 999,
      maxRegistrations: Number(maxRegistrations || maxCapacity) || 20,
      image: image || 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&auto=format&fit=crop&q=80',
      requirements: requirements || 'None',
      content: content || whatWillBeTaught || 'Professional Tailoring Curriculum'
    })

    return sendSuccess(res, 'Offer created successfully.', { offer: formatOffer(offer) }, 201)
  } catch (err) {
    next(err)
  }
}

export const updateOffer = async (req, res, next) => {
  try {
    const { id } = req.params
    const offer = await Offer.findOne({ _id: id, tailorId: req.user._id }).catch(() => null)
    if (!offer) return sendError(res, 'Offer not found or unauthorized.', 404)

    const b = req.body
    const newCurrent = b.current_registrations !== undefined ? Number(b.current_registrations) : offer.currentRegistrations
    const newMax = b.max_registrations !== undefined ? Number(b.max_registrations) : offer.maxRegistrations
    const autoStatus = newCurrent >= newMax ? 'FULL' : (b.status || offer.status)

    Object.assign(offer, {
      ...(b.title && { title: b.title }),
      ...(b.category && { category: b.category }),
      ...(b.description !== undefined && { description: b.description }),
      ...(b.target_audience && { targetAudience: b.target_audience }),
      ...(b.mode && { mode: b.mode }),
      ...(b.duration && { duration: b.duration }),
      ...(b.duration_days && { durationDays: Number(b.duration_days) }),
      ...(b.start_date && { startDate: b.start_date }),
      ...(b.end_date && { endDate: b.end_date }),
      ...(b.days && { days: b.days }),
      ...(b.start_time && { startTime: b.start_time }),
      ...(b.end_time && { endTime: b.end_time }),
      ...(b.location && { location: b.location }),
      ...(b.price && { price: Number(b.price) }),
      ...(b.max_registrations && { maxRegistrations: Number(b.max_registrations) }),
      ...(b.current_registrations !== undefined && { currentRegistrations: Number(b.current_registrations) }),
      ...(b.image && { image: b.image }),
      ...(b.requirements && { requirements: b.requirements }),
      ...(b.content && { content: b.content }),
      status: autoStatus
    })
    await offer.save()

    return sendSuccess(res, 'Offer updated successfully.', { offer: formatOffer(offer) })
  } catch (err) {
    next(err)
  }
}

export const deleteOffer = async (req, res, next) => {
  try {
    const { id } = req.params
    const offer = await Offer.findOneAndDelete({ _id: id, tailorId: req.user._id }).catch(() => null)
    if (!offer) return sendError(res, 'Offer not found or unauthorized.', 404)
    return sendSuccess(res, 'Offer deleted successfully.')
  } catch (err) {
    next(err)
  }
}

export const updateOfferStatus = async (req, res, next) => {
  try {
    const { id } = req.params
    const { status } = req.body
    const offer = await Offer.findOne({ _id: id, tailorId: req.user._id }).catch(() => null)
    if (!offer) return sendError(res, 'Offer not found or unauthorized.', 404)

    const newStatus = status || (offer.status === 'ACTIVE' ? 'CLOSED' : 'ACTIVE')
    offer.status = newStatus
    await offer.save()

    return sendSuccess(res, 'Offer status updated.', { offer: formatOffer(offer) })
  } catch (err) {
    next(err)
  }
}
