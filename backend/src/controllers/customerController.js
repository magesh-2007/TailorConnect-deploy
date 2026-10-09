import User from '../models/User.js'
import { sendSuccess, sendError } from '../utils/response.js'

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
    if (!user) return sendError(res, 'Customer profile not found.', 404)

    const { password, ...userData } = user.toObject()
    return sendSuccess(res, 'Customer profile.', {
      profile: {
        ...userData,
        id: user._id,
        role: 'customer',
        profileImage: user.profileImage,
        isActive: user.isActive,
        isVerified: user.isVerified
      }
    })
  } catch (err) {
    next(err)
  }
}

export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address, location, age, profileImage } = req.body

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        ...(name?.trim() && { name: name.trim() }),
        ...(phone?.trim() && { phone: phone.trim() }),
        ...(address?.trim() && { address: address.trim() }),
        ...(location?.trim() && { location: location.trim() }),
        ...(age && { age: Number(age) }),
        ...(profileImage && { profileImage })
      },
      { new: true }
    )

    const { password, ...userData } = user.toObject()
    return sendSuccess(res, 'Customer profile updated successfully.', {
      profile: { ...userData, id: user._id, role: 'customer', profileImage: user.profileImage }
    })
  } catch (err) {
    next(err)
  }
}

export const getRecommendations = async (req, res, next) => {
  try {
    const userLocation = req.user?.location || 'Chennai'
    const User = (await import('../models/User.js')).default
    const TailorProfile = (await import('../models/TailorProfile.js')).default
    const Portfolio = (await import('../models/Portfolio.js')).default

    const recommendedTailorUsers = await User.find({
      role: 'TAILOR',
      isActive: { $ne: false }
    }).limit(10)

    const tailorUserIds = recommendedTailorUsers.map(u => u._id)
    const profiles = await TailorProfile.find({ userId: { $in: tailorUserIds } })
    const portfolioItems = await Portfolio.find({ tailorId: { $in: tailorUserIds } }).limit(8)

    const profileMap = new Map(profiles.map(p => [p.userId.toString(), p.toObject()]))

    const tailors = recommendedTailorUsers.map(u => {
      const p = profileMap.get(u._id.toString()) || {}
      return {
        ...u.toObject(),
        ...p,
        id: u._id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        profileImage: u.profileImage,
        rating: p.rating || 4.8,
        shopName: p.shopName || `${u.name}'s Studio`,
        verificationStatus: p.verificationStatus || 'VERIFIED'
      }
    })

    return sendSuccess(res, 'Recommendations retrieved.', {
      tailors,
      designs: portfolioItems.map(item => item.toObject())
    })
  } catch (err) {
    next(err)
  }
}

