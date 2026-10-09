import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import TailorProfile from '../models/TailorProfile.js'
import Order from '../models/Order.js'
import Course from '../models/Course.js'
import Payment from '../models/Payment.js'
import Offer from '../models/Offer.js'
import Review from '../models/Review.js'
import AuditLog from '../models/AuditLog.js'
import { sendSuccess, sendError } from '../utils/response.js'

// ─── GET /api/admin/dashboard ────────────────────────────────────────────────
export const getDashboardStats = async (req, res, next) => {
  try {
    const [totalCustomers, totalTailors, totalStudents, totalEmployees] = await Promise.all([
      User.countDocuments({ role: 'CUSTOMER' }),
      User.countDocuments({ role: 'TAILOR' }),
      User.countDocuments({ role: 'STUDENT' }),
      User.countDocuments({ role: 'EMPLOYEE' })
    ])

    const [verifiedTailors, pendingVerification] = await Promise.all([
      TailorProfile.countDocuments({ verificationStatus: 'VERIFIED' }),
      TailorProfile.countDocuments({ verificationStatus: 'PENDING' })
    ])

    const [totalOrders, activeOrders, completedOrders, totalCourses] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({
        orderStatus: { $in: ['REQUEST_RECEIVED', 'ACCEPTED', 'STITCHING_STARTED', 'IN_PROGRESS', 'READY', 'OUT_FOR_DELIVERY'] }
      }),
      Order.countDocuments({ orderStatus: 'DELIVERED' }),
      Course.countDocuments()
    ])

    // Recent 5 users
    const recentUsers = await User.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select('-password')

    // Recent 5 orders
    const recentOrders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('customerId', 'name email')
      .populate('tailorId', 'name')

    const totalUsers = totalCustomers + totalTailors + totalStudents + totalEmployees

    return sendSuccess(res, 'Admin dashboard statistics retrieved.', {
      stats: {
        totalCustomers,
        totalTailors,
        totalStudents,
        totalEmployees,
        totalUsers,
        verifiedTailors,
        pendingVerification,
        totalOrders,
        activeOrders,
        completedOrders,
        totalCourses
      },
      recentUsers: recentUsers.map(u => u.toObject()),
      recentOrders: recentOrders.map(o => o.toObject())
    })
  } catch (err) {
    next(err)
  }
}

// ─── GET /api/admin/users ─────────────────────────────────────────────────────
export const getAllUsers = async (req, res, next) => {
  try {
    const { q, role, page = 1, limit = 50 } = req.query
    const filter = {}

    if (role && role !== 'ALL') filter.role = role.toUpperCase()
    if (q) filter.$or = [
      { name: new RegExp(q, 'i') },
      { email: new RegExp(q, 'i') },
      { location: new RegExp(q, 'i') },
      { username: new RegExp(q, 'i') }
    ]

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip((page - 1) * Number(limit))
        .limit(Number(limit)),
      User.countDocuments(filter)
    ])

    return sendSuccess(res, 'All users retrieved.', {
      users: users.map(u => u.toObject()),
      total,
      page: Number(page)
    })
  } catch (err) {
    next(err)
  }
}

// ─── GET /api/admin/customers ─────────────────────────────────────────────────
export const getCustomers = async (req, res, next) => {
  try {
    const { q } = req.query
    const filter = { role: 'CUSTOMER' }
    if (q) filter.$or = [
      { name: new RegExp(q, 'i') },
      { email: new RegExp(q, 'i') },
      { location: new RegExp(q, 'i') }
    ]
    const customers = await User.find(filter).select('-password').sort({ createdAt: -1 })
    return sendSuccess(res, 'Customers list.', { customers: customers.map(u => u.toObject()) })
  } catch (err) {
    next(err)
  }
}

// ─── GET /api/admin/tailors ───────────────────────────────────────────────────
export const getTailors = async (req, res, next) => {
  try {
    const { q } = req.query
    const filter = { role: 'TAILOR' }
    if (q) filter.$or = [
      { name: new RegExp(q, 'i') },
      { email: new RegExp(q, 'i') },
      { location: new RegExp(q, 'i') }
    ]
    const users = await User.find(filter).select('-password').sort({ createdAt: -1 })
    const userIds = users.map(u => u._id)
    const profiles = await TailorProfile.find({ userId: { $in: userIds } })
    const profileMap = Object.fromEntries(profiles.map(p => [p.userId.toString(), p]))

    const enriched = users.map(u => {
      const p = profileMap[u._id.toString()]
      return {
        ...u.toObject(),
        id: u._id,
        tailorProfile: p ? p.toObject() : null,
        verified: p?.verificationStatus === 'VERIFIED',
        verificationStatus: p?.verificationStatus || 'PENDING',
        shopName: p?.shopName,
        specialist: p?.specialist,
        experience: p?.experience,
        about: p?.about,
        rating: p?.rating || 4.8
      }
    })

    return sendSuccess(res, 'Tailors list.', { tailors: enriched })
  } catch (err) {
    next(err)
  }
}

// ─── GET /api/admin/students ──────────────────────────────────────────────────
export const getStudents = async (req, res, next) => {
  try {
    const { q } = req.query
    const filter = { role: 'STUDENT' }
    if (q) filter.$or = [
      { name: new RegExp(q, 'i') },
      { email: new RegExp(q, 'i') },
      { location: new RegExp(q, 'i') }
    ]
    const students = await User.find(filter).select('-password').sort({ createdAt: -1 })
    return sendSuccess(res, 'Students list.', { students: students.map(u => u.toObject()) })
  } catch (err) {
    next(err)
  }
}

// ─── GET /api/admin/employees ─────────────────────────────────────────────────
export const getEmployees = async (req, res, next) => {
  try {
    const { q } = req.query
    const filter = { role: 'EMPLOYEE' }
    if (q) filter.$or = [
      { name: new RegExp(q, 'i') },
      { email: new RegExp(q, 'i') },
      { location: new RegExp(q, 'i') }
    ]
    const employees = await User.find(filter).select('-password').sort({ createdAt: -1 })
    return sendSuccess(res, 'Employees list.', { employees: employees.map(u => u.toObject()) })
  } catch (err) {
    next(err)
  }
}

// ─── GET /api/admin/orders ────────────────────────────────────────────────────
export const getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query
    const filter = {}
    if (status && status !== 'ALL') filter.orderStatus = status.toUpperCase()

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('customerId', 'name email profileImage location')
        .populate('tailorId', 'name email profileImage')
        .sort({ createdAt: -1 })
        .skip((page - 1) * Number(limit))
        .limit(Number(limit)),
      Order.countDocuments(filter)
    ])

    return sendSuccess(res, 'All orders retrieved.', {
      orders: orders.map(o => o.toObject()),
      total,
      page: Number(page)
    })
  } catch (err) {
    next(err)
  }
}

// ─── GET /api/admin/courses ───────────────────────────────────────────────────
export const getAllCourses = async (req, res, next) => {
  try {
    const { status, q } = req.query
    const filter = {}
    if (status && status !== 'ALL') filter.status = status.toUpperCase()
    if (q) filter.$or = [
      { title: new RegExp(q, 'i') },
      { category: new RegExp(q, 'i') },
      { location: new RegExp(q, 'i') }
    ]

    const courses = await Course.find(filter)
      .populate('tailorId', 'name email profileImage')
      .sort({ createdAt: -1 })

    return sendSuccess(res, 'All courses retrieved.', {
      courses: courses.map(c => c.toObject()),
      total: courses.length
    })
  } catch (err) {
    next(err)
  }
}

// ─── PATCH /api/admin/tailors/:id/verify ─────────────────────────────────────
export const verifyTailor = async (req, res, next) => {
  try {
    const { id } = req.params
    const { verified, status } = req.body

    const isVerified = verified !== undefined ? Boolean(verified) : status === 'VERIFIED'
    const newStatus = isVerified ? 'VERIFIED' : 'REJECTED'

    let profile = await TailorProfile.findById(id).catch(() => null)
    if (!profile) profile = await TailorProfile.findOne({ userId: id })

    if (!profile) {
      const user = await User.findOne({ _id: id, role: 'TAILOR' }).catch(() => null)
      if (!user) return sendError(res, 'Tailor profile not found.', 404)

      profile = await TailorProfile.create({
        userId: user._id,
        shopName: `${user.name}'s Studio`,
        verificationStatus: newStatus
      })
    } else {
      profile.verificationStatus = newStatus
      await profile.save()
    }

    await User.findByIdAndUpdate(profile.userId, { isVerified })

    return sendSuccess(res, `Tailor verification updated to ${newStatus}.`, { profile: profile.toObject() })
  } catch (err) {
    next(err)
  }
}

// ─── PATCH /api/admin/users/:id/status ───────────────────────────────────────
export const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params
    const user = await User.findById(id).catch(() => null)
    if (!user) return sendError(res, 'User not found.', 404)

    user.isActive = !user.isActive
    await user.save()

    return sendSuccess(res, `User account ${user.isActive ? 'activated' : 'deactivated'} successfully.`, {
      user: { ...user.toObject(), password: undefined }
    })
  } catch (err) {
    next(err)
  }
}

// ─── POST /api/admin/employees ────────────────────────────────────────────────
// Only admins can create EMPLOYEE accounts. Never exposed publicly.
export const createEmployee = async (req, res, next) => {
  try {
    const { name, email, password, phone, address, location, department } = req.body

    if (!name || !email || !password) {
      return sendError(res, 'Name, email, and password are required to create an employee.', 400)
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() })
    if (existing) {
      return sendError(res, 'An account with this email already exists.', 409)
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '_')

    const employee = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      username,
      password: hashedPassword,
      role: 'EMPLOYEE',
      phone: phone || '',
      address: address || '',
      location: location || 'Chennai',
      isVerified: true,
      isActive: true,
      // Store department in a virtual-friendly way via address field or use a future field
    })

    const { password: _pw, ...safeEmployee } = employee.toObject()
    return sendSuccess(res, 'Employee account created successfully.', { user: safeEmployee }, 201)
  } catch (err) {
    next(err)
  }
}

// ─── DELETE /api/admin/users/:id ──────────────────────────────────────────────
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params
    const user = await User.findById(id).catch(() => null)
    if (!user) return sendError(res, 'User not found.', 404)
    if ((user.role || '').toUpperCase() === 'ADMIN') {
      return sendError(res, 'Admin accounts cannot be deleted through this endpoint.', 403)
    }
    await User.findByIdAndDelete(id)
    return sendSuccess(res, 'User deleted successfully.')
  } catch (err) {
    next(err)
  }
}

// ─── GET /api/admin/payments ──────────────────────────────────────────────────
export const getAllPayments = async (req, res, next) => {
  try {
    const { status, type, page = 1, limit = 20 } = req.query
    const filter = {}
    if (status && status !== 'ALL') filter.status = status.toUpperCase()
    if (type && type !== 'ALL') filter.type = type

    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .populate('userId', 'name email profileImage')
        .populate('orderId', 'orderNumber designName')
        .populate('courseId', 'title')
        .sort({ createdAt: -1 })
        .skip((page - 1) * Number(limit))
        .limit(Number(limit)),
      Payment.countDocuments(filter)
    ])

    // Aggregate totals
    const [totalRevenue, pendingPayments] = await Promise.all([
      Payment.aggregate([{ $match: { status: 'SUCCESS' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Payment.countDocuments({ status: 'PENDING' })
    ])

    return sendSuccess(res, 'All payments retrieved.', {
      payments: payments.map(p => p.toObject()),
      total,
      page: Number(page),
      totalRevenue: totalRevenue[0]?.total || 0,
      pendingPayments
    })
  } catch (err) {
    next(err)
  }
}

// ─── GET /api/admin/offers ────────────────────────────────────────────────────
export const getAllOffers = async (req, res, next) => {
  try {
    const { status, q } = req.query
    const filter = {}
    if (status && status !== 'ALL') filter.status = status.toUpperCase()
    if (q) filter.$or = [
      { title: new RegExp(q, 'i') },
      { category: new RegExp(q, 'i') },
      { location: new RegExp(q, 'i') }
    ]

    const offers = await Offer.find(filter)
      .populate('tailorId', 'name email profileImage')
      .sort({ createdAt: -1 })

    return sendSuccess(res, 'All offers retrieved.', {
      offers: offers.map(o => o.toObject()),
      total: offers.length
    })
  } catch (err) {
    next(err)
  }
}

// ─── GET /api/admin/appointments ──────────────────────────────────────────────
// Appointments are modelled as Orders with relevant statuses
export const getAllAppointments = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query
    const filter = {}
    if (status && status !== 'ALL') filter.orderStatus = status.toUpperCase()

    const [appointments, total] = await Promise.all([
      Order.find(filter)
        .populate('customerId', 'name email profileImage location')
        .populate('tailorId', 'name email profileImage')
        .sort({ createdAt: -1 })
        .skip((page - 1) * Number(limit))
        .limit(Number(limit)),
      Order.countDocuments(filter)
    ])

    return sendSuccess(res, 'All appointments retrieved.', {
      appointments: appointments.map(o => o.toObject()),
      total,
      page: Number(page)
    })
  } catch (err) {
    next(err)
  }
}

// ─── GET /api/admin/quotations ────────────────────────────────────────────────
// Quotations are orders in REQUEST_RECEIVED status awaiting acceptance
export const getAllQuotations = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query
    const filter = status && status !== 'ALL'
      ? { orderStatus: status.toUpperCase() }
      : { orderStatus: { $in: ['REQUEST_RECEIVED', 'ACCEPTED', 'REJECTED'] } }

    const [quotations, total] = await Promise.all([
      Order.find(filter)
        .populate('customerId', 'name email profileImage location')
        .populate('tailorId', 'name email profileImage')
        .sort({ createdAt: -1 })
        .skip((page - 1) * Number(limit))
        .limit(Number(limit)),
      Order.countDocuments(filter)
    ])

    return sendSuccess(res, 'All quotations retrieved.', {
      quotations: quotations.map(o => o.toObject()),
      total,
      page: Number(page)
    })
  } catch (err) {
    next(err)
  }
}

// ─── GET /api/admin/complaints ────────────────────────────────────────────────
// Complaints are orders that were cancelled or rejected — serving as proxy until a Complaint model exists
export const getAllComplaints = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const filter = { orderStatus: { $in: ['CANCELLED', 'REJECTED'] } }

    const [complaints, total] = await Promise.all([
      Order.find(filter)
        .populate('customerId', 'name email profileImage location')
        .populate('tailorId', 'name email profileImage')
        .sort({ createdAt: -1 })
        .skip((page - 1) * Number(limit))
        .limit(Number(limit)),
      Order.countDocuments(filter)
    ])

    return sendSuccess(res, 'All complaints/disputes retrieved.', {
      complaints: complaints.map(o => o.toObject()),
      total,
      page: Number(page)
    })
  } catch (err) {
    next(err)
  }
}

// ─── GET /api/admin/reports ────────────────────────────────────────────────────
// Aggregated analytics & reports data
export const getReports = async (req, res, next) => {
  try {
    // User growth by month (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const [
      userGrowth,
      orderRevenue,
      topTailors,
      totalReviews,
      avgRating,
      courseStats
    ] = await Promise.all([
      // Users per month
      User.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      // Revenue per month
      Payment.aggregate([
        { $match: { status: 'SUCCESS', createdAt: { $gte: sixMonthsAgo } } },
        { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, revenue: { $sum: '$amount' } } },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      // Top 5 tailors by order count
      Order.aggregate([
        { $group: { _id: '$tailorId', orderCount: { $sum: 1 }, revenue: { $sum: '$price' } } },
        { $sort: { orderCount: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'tailor' } },
        { $unwind: { path: '$tailor', preserveNullAndEmptyArrays: true } },
        { $project: { name: '$tailor.name', email: '$tailor.email', orderCount: 1, revenue: 1 } }
      ]),
      // Total reviews
      Review.countDocuments(),
      // Average rating
      Review.aggregate([{ $group: { _id: null, avg: { $avg: '$rating' } } }]),
      // Course registrations
      Course.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])
    ])

    // Totals
    const [totalOrders, totalRevenueFull, totalUsers, totalCourses] = await Promise.all([
      Order.countDocuments(),
      Payment.aggregate([{ $match: { status: 'SUCCESS' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      User.countDocuments(),
      Course.countDocuments()
    ])

    return sendSuccess(res, 'Admin reports and analytics retrieved.', {
      userGrowth,
      orderRevenue,
      topTailors,
      totalReviews,
      avgRating: avgRating[0]?.avg || 0,
      courseStats,
      summary: {
        totalOrders,
        totalRevenue: totalRevenueFull[0]?.total || 0,
        totalUsers,
        totalCourses
      }
    })
  } catch (err) {
    next(err)
  }
}

// ─── GET /api/admin/notifications ─────────────────────────────────────────────
// Admin-side notifications: recent activity feed
export const getAdminNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query

    // Recent registrations
    const recentUsers = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(5)

    // Recent orders
    const recentOrders = await Order.find({})
      .populate('customerId', 'name')
      .populate('tailorId', 'name')
      .sort({ createdAt: -1 })
      .limit(5)

    // Recent payments
    const recentPayments = await Payment.find({ status: 'SUCCESS' })
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .limit(5)

    // Build notification feed
    const feed = [
      ...recentUsers.map(u => ({
        id: u._id,
        type: 'NEW_USER',
        message: `New ${u.role} registered: ${u.name}`,
        time: u.createdAt,
        icon: '👤'
      })),
      ...recentOrders.map(o => ({
        id: o._id,
        type: 'NEW_ORDER',
        message: `Order #${o.orderNumber} placed by ${o.customerId?.name || 'Customer'}`,
        time: o.createdAt,
        icon: '📦'
      })),
      ...recentPayments.map(p => ({
        id: p._id,
        type: 'PAYMENT',
        message: `Payment of ₹${p.amount} received from ${p.userId?.name || 'User'}`,
        time: p.createdAt,
        icon: '💳'
      }))
    ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, Number(limit))

    return sendSuccess(res, 'Admin notifications retrieved.', {
      notifications: feed,
      total: feed.length
    })
  } catch (err) {
    next(err)
  }
}

// ─── GET /api/admin/reviews ────────────────────────────────────────────────────
export const getAllReviews = async (req, res, next) => {
  try {
    const { rating, page = 1, limit = 20 } = req.query
    const filter = {}
    if (rating) filter.rating = Number(rating)

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate('customerId', 'name email profileImage')
        .populate('tailorId', 'name email profileImage')
        .sort({ createdAt: -1 })
        .skip((page - 1) * Number(limit))
        .limit(Number(limit)),
      Review.countDocuments(filter)
    ])

    return sendSuccess(res, 'All reviews retrieved.', {
      reviews: reviews.map(r => r.toObject()),
      total,
      page: Number(page)
    })
  } catch (err) {
    next(err)
  }
}

// ─── GET /api/admin/audit-logs ────────────────────────────────────────────────
export const getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query
    const [logs, total] = await Promise.all([
      AuditLog.find({})
        .sort({ createdAt: -1 })
        .skip((page - 1) * Number(limit))
        .limit(Number(limit)),
      AuditLog.countDocuments()
    ])
    return sendSuccess(res, 'Audit logs retrieved.', { logs: logs.map(l => l.toObject()), total, page: Number(page) })
  } catch (err) {
    next(err)
  }
}

