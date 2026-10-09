import express from 'express'
import {
  getDashboardStats,
  getAllUsers,
  getCustomers,
  getTailors,
  getStudents,
  getEmployees,
  getAllOrders,
  getAllCourses,
  getAllPayments,
  getAllOffers,
  getAllAppointments,
  getAllQuotations,
  getAllComplaints,
  getReports,
  getAdminNotifications,
  getAllReviews,
  getAuditLogs,
  verifyTailor,
  toggleUserStatus,
  createEmployee,
  deleteUser
} from '../controllers/adminController.js'
import { authenticateUser, requireRole } from '../middleware/auth.js'

const router = express.Router()

// ─── ALL admin routes require a valid JWT with role === ADMIN ─────────────────
// This is enforced at the backend level — the frontend alone is NOT sufficient.
// Any request that does not carry a valid ADMIN JWT will be rejected with 403.
router.use(authenticateUser, requireRole('ADMIN'))

// ── Dashboard ─────────────────────────────────────────────────────────────────
router.get('/dashboard', getDashboardStats)

// ── User management ───────────────────────────────────────────────────────────
router.get('/users',     getAllUsers)
router.get('/customers', getCustomers)
router.get('/tailors',   getTailors)
router.get('/students',  getStudents)
router.get('/employees', getEmployees)

// ── Orders & Requests ─────────────────────────────────────────────────────────
router.get('/orders',       getAllOrders)
router.get('/requests',     getAllOrders)      // Alias: /requests → same as /orders
router.get('/quotations',   getAllQuotations)
router.get('/appointments', getAllAppointments)
router.get('/complaints',   getAllComplaints)

// ── Payments & Revenue ────────────────────────────────────────────────────────
router.get('/payments', getAllPayments)

// ── Courses & Offers ──────────────────────────────────────────────────────────
router.get('/courses', getAllCourses)
router.get('/offers',  getAllOffers)

// ── Reviews ───────────────────────────────────────────────────────────────────
router.get('/reviews', getAllReviews)

// ── Reports & Analytics ───────────────────────────────────────────────────────
router.get('/reports', getReports)
router.get('/audit-logs', getAuditLogs)

// ── Notifications ─────────────────────────────────────────────────────────────
router.get('/notifications', getAdminNotifications)

// ── Mutations ─────────────────────────────────────────────────────────────────
router.post('/employees',            createEmployee)    // Admin creates employee accounts
router.patch('/tailors/:id/verify',  verifyTailor)
router.patch('/users/:id/status',    toggleUserStatus)
router.delete('/users/:id',          deleteUser)

export default router
