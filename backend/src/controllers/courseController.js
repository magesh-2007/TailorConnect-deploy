import Course from '../models/Course.js'
import CourseRegistration from '../models/CourseRegistration.js'
import Certificate from '../models/Certificate.js'
import User from '../models/User.js'
import TailorProfile from '../models/TailorProfile.js'
import Notification from '../models/Notification.js'
import { sendSuccess, sendError } from '../utils/response.js'
import { emitNotification } from '../services/socketService.js'

const formatCourse = (c) => {
  const obj = c.toObject ? c.toObject() : { ...c }
  return {
    ...obj,
    id: obj._id,
    tailorId: obj.tailorId,
    durationDays: obj.durationDays,
    startDate: obj.startDate,
    endDate: obj.endDate,
    startTime: obj.startTime,
    endTime: obj.endTime,
    registeredCount: obj.registeredCount,
    courseContent: obj.courseContent,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
    remainingSeats: Math.max(0, (obj.capacity || 0) - (obj.registeredCount || 0)),
    name: obj.title,
    type: 'Course',
    targetAudience: 'Student',
    registeredStudents: obj.registeredCount,
    maxCapacity: obj.capacity
  }
}

export const getCourses = async (req, res, next) => {
  try {
    const { q, category, location, status, tailorId, page = 1, limit = 20 } = req.query
    const skip = (Number(page) - 1) * Number(limit)

    const filter = { status: status || 'ACTIVE' }
    if (category && category !== 'All') filter.category = new RegExp(category, 'i')
    if (location && location !== 'All') filter.location = new RegExp(location, 'i')
    if (tailorId) filter.tailorId = tailorId
    if (q) filter.$or = [
      { title: new RegExp(q, 'i') },
      { description: new RegExp(q, 'i') },
      { category: new RegExp(q, 'i') }
    ]

    const [courses, total] = await Promise.all([
      Course.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Course.countDocuments(filter)
    ])

    const trainerIds = [...new Set(courses.map((c) => c.tailorId.toString()))]
    const trainers = await User.find({ _id: { $in: trainerIds } })
    const trainerProfiles = await TailorProfile.find({ userId: { $in: trainerIds } })
    const trainerMap = Object.fromEntries(trainers.map((u) => [u._id.toString(), u]))
    const profileMap = Object.fromEntries(trainerProfiles.map((p) => [p.userId.toString(), p]))

    const formatted = courses.map((c) => {
      const json = formatCourse(c)
      const t = trainerMap[c.tailorId.toString()]
      const tp = profileMap[c.tailorId.toString()]
      json.trainerName = t?.name || ''
      json.shopName = tp?.shopName || `${t?.name || ''}'s Studio`
      return json
    })

    return sendSuccess(res, 'Courses retrieved successfully.', {
      courses: formatted,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    })
  } catch (err) {
    next(err)
  }
}

export const getCourseById = async (req, res, next) => {
  try {
    const { id } = req.params
    const course = await Course.findById(id).catch(() => null)
    if (!course) return sendError(res, 'Course not found.', 404)

    const [trainer, trainerProfile] = await Promise.all([
      User.findById(course.tailorId),
      TailorProfile.findOne({ userId: course.tailorId })
    ])

    const json = formatCourse(course)
    json.trainerName = trainer?.name || ''
    json.shopName = trainerProfile?.shopName || `${trainer?.name || ''}'s Studio`
    json.contactInfo = `Phone: ${trainer?.phone || '9876543211'} | Email: ${trainer?.email || ''}`

    return sendSuccess(res, 'Course details.', { course: json })
  } catch (err) {
    next(err)
  }
}

export const createCourse = async (req, res, next) => {
  try {
    const {
      title, name, category, description, duration, durationDays, mode, location,
      startDate, endDate, days, availableDays, startTime, endTime, availableTime,
      price, capacity, maxCapacity, image, requirements, courseContent, whatWillBeTaught
    } = req.body

    const courseTitle = (title || name || '').trim()
    if (!courseTitle) return sendError(res, 'Course title is required.', 400)

    const course = await Course.create({
      tailorId: req.user._id,
      title: courseTitle,
      category: category || 'Bridal Blouse',
      description: description || '',
      duration: duration || `${durationDays || 15} Days`,
      durationDays: Number(durationDays) || 15,
      mode: (mode || 'OFFLINE').toUpperCase(),
      location: location || 'Chennai',
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      days: days || availableDays || 'Monday to Friday',
      startTime: startTime || '10:00 AM',
      endTime: endTime || '12:00 PM',
      price: Number(price) || 999,
      capacity: Number(capacity || maxCapacity) || 20,
      image: image || 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&auto=format&fit=crop&q=80',
      requirements: requirements || 'None',
      courseContent: courseContent || whatWillBeTaught || 'Professional Stitching Techniques'
    })

    return sendSuccess(res, 'Course created successfully.', { course: formatCourse(course) }, 201)
  } catch (err) {
    next(err)
  }
}

export const updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params
    const course = await Course.findOne({ _id: id, tailorId: req.user._id }).catch(() => null)
    if (!course) return sendError(res, 'Course not found or unauthorized.', 404)

    const b = req.body
    const newRegistered = b.registered_count !== undefined ? Number(b.registered_count) : course.registeredCount
    const newCapacity = b.capacity !== undefined ? Number(b.capacity) : course.capacity
    const autoStatus = newRegistered >= newCapacity ? 'CLOSED' : (b.status || course.status)

    Object.assign(course, {
      ...(b.title && { title: b.title }),
      ...(b.category && { category: b.category }),
      ...(b.description !== undefined && { description: b.description }),
      status: autoStatus,
      ...(b.duration && { duration: b.duration }),
      ...(b.duration_days && { durationDays: Number(b.duration_days) }),
      ...(b.mode && { mode: b.mode.toUpperCase() }),
      ...(b.location && { location: b.location }),
      ...(b.start_date && { startDate: b.start_date }),
      ...(b.end_date && { endDate: b.end_date }),
      ...(b.days && { days: b.days }),
      ...(b.start_time && { startTime: b.start_time }),
      ...(b.end_time && { endTime: b.end_time }),
      ...(b.price && { price: Number(b.price) }),
      ...(b.capacity && { capacity: Number(b.capacity) }),
      ...(b.image && { image: b.image }),
      ...(b.requirements && { requirements: b.requirements }),
      ...(b.course_content && { courseContent: b.course_content })
    })
    await course.save()

    return sendSuccess(res, 'Course updated successfully.', { course: formatCourse(course) })
  } catch (err) {
    next(err)
  }
}

export const registerForCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params
    const { paymentId, amount } = req.body || {}
    const course = await Course.findById(courseId).catch(() => null)
    if (!course) return sendError(res, 'Course not found.', 404)

    if (course.status !== 'ACTIVE') return sendError(res, 'This course is currently closed for registrations.', 400)
    if (course.registeredCount >= course.capacity) {
      course.status = 'CLOSED'
      await course.save()
      return sendError(res, 'Course is already at maximum capacity.', 400)
    }

    const existing = await CourseRegistration.findOne({ studentId: req.user._id, courseId })
    if (existing) return sendError(res, 'You are already registered for this course.', 409)

    const paidAmount = Number(amount || course.price || 0)

    const reg = await CourseRegistration.create({
      studentId: req.user._id,
      courseId,
      tailorId: course.tailorId,
      paymentId: paymentId || `PAY-CRS-${Date.now().toString().slice(-6)}`,
      amountPaid: paidAmount,
      status: 'REGISTERED'
    })

    const newCount = course.registeredCount + 1
    const newStatus = newCount >= course.capacity ? 'CLOSED' : 'ACTIVE'
    course.registeredCount = newCount
    course.status = newStatus
    await course.save()

    // Credit revenue amount directly to the respective tailor's account balance
    const tailorProfile = await TailorProfile.findOne({ userId: course.tailorId })
    if (tailorProfile) {
      tailorProfile.totalEarnings = (tailorProfile.totalEarnings || 0) + paidAmount
      await tailorProfile.save()
    }

    // Notify student
    const sn = await Notification.create({
      userId: req.user._id,
      type: 'COURSE_REGISTERED',
      title: 'Course Registration & Payment Confirmed 🎓',
      message: `You have successfully enrolled in "${course.title}" for ₹${paidAmount}. Full video lesson access is unlocked!`,
      relatedId: courseId
    })
    emitNotification(req.user._id.toString(), sn.toObject())

    // Notify tailor
    const tn = await Notification.create({
      userId: course.tailorId,
      type: 'COURSE_REGISTERED',
      title: 'New Student Enrollment & Payment Credited 💰',
      message: `${req.user.name} registered for "${course.title}". ₹${paidAmount} credited to your account! (${newCount}/${course.capacity} seats filled).`,
      relatedId: courseId
    })
    emitNotification(course.tailorId.toString(), tn.toObject())

    return sendSuccess(res, 'Course registration and payment successful.', {
      registration: reg.toObject(),
      course: formatCourse(course),
      creditedAmount: paidAmount
    })
  } catch (err) {
    next(err)
  }
}

export const completeCourse = async (req, res, next) => {
  try {
    const { courseId, studentId } = req.params
    const targetStudentId = studentId || req.user._id

    const course = await Course.findById(courseId).catch(() => null)
    if (!course) return sendError(res, 'Course not found.', 404)

    const student = await User.findById(targetStudentId)
    if (!student) return sendError(res, 'Student not found.', 404)

    const trainer = await User.findById(course.tailorId)
    const trainerProfile = await TailorProfile.findOne({ userId: course.tailorId })

    // Upsert registration
    let reg = await CourseRegistration.findOne({ studentId: student._id, courseId })
    if (reg) {
      reg.status = 'COMPLETED'
      reg.completedAt = new Date()
      await reg.save()
    } else {
      reg = await CourseRegistration.create({
        studentId: student._id,
        courseId,
        tailorId: course.tailorId,
        status: 'COMPLETED',
        completedAt: new Date()
      })
    }

    // Upsert certificate
    let cert = await Certificate.findOne({ studentId: student._id, courseId })
    if (!cert) {
      const certId = `TC-CERT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`
      const verCode = `TC-CERT-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
      cert = await Certificate.create({
        certificateId: certId,
        studentId: student._id,
        studentName: student.name,
        studentEmail: student.email,
        courseId,
        courseName: course.title,
        tailorId: course.tailorId,
        tailorName: trainer?.name || 'Master Tailor',
        shopName: trainerProfile?.shopName || 'TailorConnect Academy',
        duration: course.duration || `${course.durationDays || 15} Days`,
        completionDate: new Date().toISOString().split('T')[0],
        verificationCode: verCode
      })
    }

    const sn = await Notification.create({
      userId: student._id,
      type: 'CERTIFICATE_GENERATED',
      title: 'Course Completed – Certificate Earned! 🏆',
      message: `Your certificate for "${course.title}" is now available. Certificate ID: ${cert.certificateId}.`,
      relatedId: cert._id.toString()
    })
    emitNotification(student._id.toString(), sn.toObject())

    return sendSuccess(res, 'Course marked as completed and certificate generated.', {
      registration: reg.toObject(),
      certificate: cert.toObject()
    })
  } catch (err) {
    next(err)
  }
}

export const getCourseStudents = async (req, res, next) => {
  try {
    const { courseId } = req.params
    const registrations = await CourseRegistration.find({ courseId })
    const studentIds = registrations.map((r) => r.studentId)
    const students = await User.find({ _id: { $in: studentIds } })
    const studentMap = Object.fromEntries(students.map((u) => [u._id.toString(), u]))

    const result = registrations.map((r) => {
      const s = studentMap[r.studentId.toString()]
      return {
        ...r.toObject(),
        name: s?.name,
        email: s?.email,
        phone: s?.phone,
        location: s?.location
      }
    })

    return sendSuccess(res, 'Course enrolled students list.', { students: result })
  } catch (err) {
    next(err)
  }
}
