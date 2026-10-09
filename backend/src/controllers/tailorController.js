import User from '../models/User.js'
import TailorProfile from '../models/TailorProfile.js'
import Portfolio from '../models/Portfolio.js'
import Review from '../models/Review.js'
import Course from '../models/Course.js'
import Offer from '../models/Offer.js'
import { sendSuccess, sendError } from '../utils/response.js'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatTailor = (user, profile) => {
  const u = user.toObject ? user.toObject() : { ...user }
  const base = {
    ...u,
    id: u._id,
    profileImage: u.profileImage,
    isActive: u.isActive,
    isVerified: u.isVerified,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
    role: 'tailor',
    verified: true,
    rating: 4.8,
    reviewsCount: 0
  }
  if (profile) {
    const p = profile.toObject ? profile.toObject() : { ...profile }
    Object.assign(base, {
      shopName: p.shopName,
      shopLocation: p.shopLocation,
      specialist: p.specialist,
      experience: p.experience,
      about: p.about,
      services: p.services,
      rating: parseFloat(p.rating),
      reviewsCount: p.reviewCount,
      verified: p.verificationStatus === 'VERIFIED',
      dailyCapacity: p.dailyCapacity,
      urgentAvailable: p.urgentAvailable,
      coverImage: p.coverImage,
      avatar: p.avatar || u.profileImage
    })
  }
  return base
}

// ─── Controllers ─────────────────────────────────────────────────────────────

export const getTailors = async (req, res, next) => {
  try {
    const { q, location, specialist, page = 1, limit = 20 } = req.query
    const skip = (Number(page) - 1) * Number(limit)

    const filter = { role: 'TAILOR', isActive: true }
    if (location && location !== 'All') filter.location = new RegExp(location, 'i')
    if (q) filter.$or = [{ name: new RegExp(q, 'i') }, { location: new RegExp(q, 'i') }]

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      User.countDocuments(filter)
    ])

    const userIds = users.map((u) => u._id)
    const profiles = await TailorProfile.find({ userId: { $in: userIds } })
    const profileMap = Object.fromEntries(profiles.map((p) => [p.userId.toString(), p]))

    let formatted = users.map((u) => formatTailor(u, profileMap[u._id.toString()] || null))

    if (specialist && specialist !== 'All') {
      formatted = formatted.filter(
        (t) =>
          t.specialist?.toLowerCase().includes(specialist.toLowerCase()) ||
          t.services?.some((s) => s.toLowerCase().includes(specialist.toLowerCase()))
      )
    }

    return sendSuccess(res, 'Tailors retrieved successfully.', {
      tailors: formatted,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    })
  } catch (err) {
    next(err)
  }
}

export const getTailorById = async (req, res, next) => {
  try {
    const { id } = req.params

    let user = await User.findOne({ _id: id, role: 'TAILOR' }).catch(() => null)
    if (!user) {
      const p = await TailorProfile.findById(id).catch(() => null)
      if (p) {
        user = await User.findById(p.userId).catch(() => null)
      }
    }
    if (!user) return sendError(res, 'Tailor not found.', 404)

    const [profile, portfolio, reviews, courses, offers] = await Promise.all([
      TailorProfile.findOne({ userId: user._id }),
      Portfolio.find({ tailorId: user._id }).sort({ createdAt: -1 }),
      Review.find({ tailorId: user._id }).sort({ createdAt: -1 }),
      Course.find({ tailorId: user._id }).sort({ createdAt: -1 }),
      Offer.find({ tailorId: user._id }).sort({ createdAt: -1 })
    ])

    const json = formatTailor(user, profile)
    json.portfolio = portfolio.map((p) => p.toObject())
    json.reviews = reviews.map((r) => r.toObject())
    json.courses = courses.map((c) => (c.toObject ? c.toObject() : c))
    json.offers = offers.map((o) => (o.toObject ? o.toObject() : o))

    return sendSuccess(res, 'Tailor profile details.', { tailor: json })
  } catch (err) {
    next(err)
  }
}

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
    if (!user) return sendError(res, 'Tailor not found.', 404)
    const profile = await TailorProfile.findOne({ userId: user._id })
    const json = formatTailor(user, profile)
    return sendSuccess(res, 'Tailor profile.', { profile: json })
  } catch (err) {
    next(err)
  }
}

export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address, location, shopName, shopLocation, specialist, experience, about, services, dailyCapacity, urgentAvailable } = req.body

    await User.findByIdAndUpdate(req.user._id, {
      ...(name && { name }),
      ...(phone && { phone }),
      ...(address && { address }),
      ...(location && { location })
    })

    const servicesArr = services
      ? Array.isArray(services) ? services : services.split(',').map((s) => s.trim())
      : undefined

    const profileUpdate = {}
    if (shopName) profileUpdate.shopName = shopName
    if (shopLocation) profileUpdate.shopLocation = shopLocation
    if (specialist) profileUpdate.specialist = specialist
    if (experience) profileUpdate.experience = experience
    if (about) profileUpdate.about = about
    if (servicesArr) profileUpdate.services = servicesArr
    if (dailyCapacity !== undefined) profileUpdate.dailyCapacity = Number(dailyCapacity)
    if (urgentAvailable !== undefined) profileUpdate.urgentAvailable = Boolean(urgentAvailable)

    await TailorProfile.findOneAndUpdate(
      { userId: req.user._id },
      profileUpdate,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )

    const user = await User.findById(req.user._id)
    const profile = await TailorProfile.findOne({ userId: req.user._id })
    const json = formatTailor(user, profile)

    return sendSuccess(res, 'Tailor profile updated successfully.', { profile: json })
  } catch (err) {
    next(err)
  }
}

// ── Portfolio CRUD ─────────────────────────────────────────────────────────

export const getPortfolio = async (req, res, next) => {
  try {
    const tailorId = req.params.tailorId || req.user?._id
    const portfolio = await Portfolio.find({ tailorId }).sort({ createdAt: -1 })
    return sendSuccess(res, 'Portfolio items.', { portfolio: portfolio.map((p) => p.toObject()) })
  } catch (err) {
    next(err)
  }
}

export const createPortfolio = async (req, res, next) => {
  try {
    const { title, category, fabric, description, image } = req.body
    if (!title || !category || !image) {
      return sendError(res, 'Title, category, and image are required.', 400)
    }

    const item = await Portfolio.create({
      tailorId: req.user._id,
      title,
      category,
      fabric: fabric || 'Pure Silk',
      description: description || null,
      image
    })

    return sendSuccess(res, 'Portfolio item created.', { item: item.toObject() }, 201)
  } catch (err) {
    next(err)
  }
}

export const updatePortfolio = async (req, res, next) => {
  try {
    const { id } = req.params
    const { title, category, fabric, description, image } = req.body

    const item = await Portfolio.findOneAndUpdate(
      { _id: id, tailorId: req.user._id },
      {
        ...(title && { title }),
        ...(category && { category }),
        ...(fabric && { fabric }),
        ...(description !== undefined && { description }),
        ...(image && { image })
      },
      { new: true }
    ).catch(() => null)

    if (!item) return sendError(res, 'Portfolio item not found or unauthorized.', 404)

    return sendSuccess(res, 'Portfolio item updated.', { item: item.toObject() })
  } catch (err) {
    next(err)
  }
}

export const deletePortfolio = async (req, res, next) => {
  try {
    const { id } = req.params
    const item = await Portfolio.findOneAndDelete({ _id: id, tailorId: req.user._id }).catch(() => null)
    if (!item) return sendError(res, 'Portfolio item not found or unauthorized.', 404)
    return sendSuccess(res, 'Portfolio item deleted successfully.')
  } catch (err) {
    next(err)
  }
}
