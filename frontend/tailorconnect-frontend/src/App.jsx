import React from 'react'
import { Routes, Route } from 'react-router-dom'

import ProtectedRoute from './components/ProtectedRoute'
import ThemeSettingsWidget from './components/ThemeSettingsWidget'

import Splash from './pages/Splash'
import Home from './pages/Home'
import RoleLogin from './pages/auth/RoleLogin'
import RoleRegister from './pages/auth/RoleRegister'
import ForgotPassword from './pages/auth/ForgotPassword'
import VerifyEmail from './pages/auth/VerifyEmail'
import NotFound from './pages/NotFound'
import AdminLogin from './pages/admin/Login'

import Payment from './pages/shared/Payment'

// Customer
import CustomerDashboard from './pages/customer/Dashboard'
import FindTailors from './pages/customer/FindTailors'
import TailorProfile from './pages/customer/TailorProfile'
import CreateOrder from './pages/customer/CreateOrder'
import CustomerOrders from './pages/customer/Orders'
import CustomerQuotations from './pages/customer/Quotations'
import CustomerAppointments from './pages/customer/Appointments'
import CustomerPayments from './pages/customer/Payments'
import OrderTracking from './pages/customer/OrderTracking'
import Wishlist from './pages/customer/Wishlist'
import CustomerChat from './pages/customer/Chat'
import CustomerNotifications from './pages/customer/Notifications'
import CustomerReviews from './pages/customer/Reviews'
import CustomerProfile from './pages/customer/Profile'
import CustomerSettings from './pages/customer/Settings'
import CustomerChatbot from './pages/customer/Chatbot'

// Tailor
import TailorDashboard from './pages/tailor/Dashboard'
import IncomingOrders from './pages/tailor/IncomingOrders'
import StitchingProgress from './pages/tailor/StitchingProgress'
import TailorServices from './pages/tailor/Services'
import TailorCourses from './pages/tailor/Courses'
import TailorQuotations from './pages/tailor/Quotations'
import TailorAppointments from './pages/tailor/Appointments'
import TailorOffers from './pages/tailor/Offers'
import TailorPortfolio from './pages/tailor/Portfolio'
import TailorPayments from './pages/tailor/Payments'
import TailorCustomers from './pages/tailor/Customers'
import TailorChat from './pages/tailor/Chat'
import TailorNotifications from './pages/tailor/Notifications'
import TailorReviews from './pages/tailor/Reviews'
import TailorProfileSettings from './pages/tailor/Profile'
import TailorSettings from './pages/tailor/Settings'

// Student
import StudentDashboard from './pages/student/Dashboard'
import Courses from './pages/student/Courses'
import StudentMyCourses from './pages/student/MyCourses'
import CourseDetail from './pages/student/CourseDetail'
import StudentLessons from './pages/student/Lessons'
import StudentAssignments from './pages/student/Assignments'
import StudentCertificates from './pages/student/Certificates'
import StudentProgress from './pages/student/Progress'
import StudentChat from './pages/student/Chat'
import StudentNotifications from './pages/student/Notifications'
import StudentProfile from './pages/student/Profile'
import StudentSettings from './pages/student/Settings'

// Admin
import AdminDashboard from './pages/admin/Dashboard'
import Users from './pages/admin/Users'
import AdminCustomers from './pages/admin/Customers'
import AdminTailorsList from './pages/admin/TailorsList'
import AdminStudentsList from './pages/admin/StudentsList'
import AdminEmployees from './pages/admin/Employees'
import TailorVerification from './pages/admin/TailorVerification'
import OrderManagement from './pages/admin/OrderManagement'
import AdminOrderAssignment from './pages/admin/OrderAssignment'
import AdminPayments from './pages/admin/Payments'
import AdminCourses from './pages/admin/Courses'
import CourseApproval from './pages/admin/CourseApproval'
import AdminAppointments from './pages/admin/Appointments'
import AdminOffers from './pages/admin/Offers'
import Complaints from './pages/admin/Complaints'
import AdminReviews from './pages/admin/Reviews'
import Reports from './pages/admin/Reports'
import AdminNotifications from './pages/admin/Notifications'
import AdminSettings from './pages/admin/Settings'

// Employee
import EmployeeDashboard from './pages/employee/Dashboard'
import EmployeeOrders from './pages/employee/Orders'
import EmployeeProfile from './pages/employee/Profile'
import EmployeeSettings from './pages/employee/Settings'

import VerifyCertificate from './pages/public/VerifyCertificate'

export default function App() {
  return (
    <>
    <Routes>
      {/* Root → Landing page */}
      <Route path="/" element={<Home />} />
      {/* Home / Landing page */}
      <Route path="/home" element={<Home />} />
      {/* Splash screen */}
      <Route path="/splash" element={<Splash />} />
      {/* Public Certificate Verification */}
      <Route path="/verify-certificate" element={<VerifyCertificate />} />
      <Route path="/verify-certificate/:certificateId" element={<VerifyCertificate />} />
      {/* Auth */}
      <Route path="/login" element={<RoleLogin />} />
      <Route path="/login/:role" element={<RoleLogin />} />
      <Route path="/register" element={<RoleRegister />} />
      <Route path="/register/:role" element={<RoleRegister />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      {/* Admin dedicated login */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Shared */}
      <Route path="/payment" element={<Payment />} />
      <Route path="/tracking/:id" element={<OrderTracking />} />
      <Route path="/orders" element={<ProtectedRoute role="customer"><CustomerOrders /></ProtectedRoute>} />
      <Route path="/courses" element={<ProtectedRoute role="student"><Courses /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute role="customer"><CustomerProfile /></ProtectedRoute>} />

      {/* Customer Routes */}
      <Route path="/customer/dashboard" element={<ProtectedRoute role="customer"><CustomerDashboard /></ProtectedRoute>} />
      <Route path="/customer/tailors" element={<ProtectedRoute role="customer"><FindTailors /></ProtectedRoute>} />
      <Route path="/customer/tailors/:id" element={<ProtectedRoute role="customer"><TailorProfile /></ProtectedRoute>} />
      <Route path="/customer/create-order" element={<ProtectedRoute role="customer"><CreateOrder /></ProtectedRoute>} />
      <Route path="/customer/orders" element={<ProtectedRoute role="customer"><CustomerOrders /></ProtectedRoute>} />
      <Route path="/customer/quotations" element={<ProtectedRoute role="customer"><CustomerQuotations /></ProtectedRoute>} />
      <Route path="/customer/appointments" element={<ProtectedRoute role="customer"><CustomerAppointments /></ProtectedRoute>} />
      <Route path="/customer/payments" element={<ProtectedRoute role="customer"><CustomerPayments /></ProtectedRoute>} />
      <Route path="/customer/tracking" element={<ProtectedRoute role="customer"><OrderTracking /></ProtectedRoute>} />
      <Route path="/customer/wishlist" element={<ProtectedRoute role="customer"><Wishlist /></ProtectedRoute>} />
      <Route path="/customer/chat" element={<ProtectedRoute role="customer"><CustomerChat /></ProtectedRoute>} />
      <Route path="/customer/notifications" element={<ProtectedRoute role="customer"><CustomerNotifications /></ProtectedRoute>} />
      <Route path="/customer/reviews" element={<ProtectedRoute role="customer"><CustomerReviews /></ProtectedRoute>} />
      <Route path="/customer/profile" element={<ProtectedRoute role="customer"><CustomerProfile /></ProtectedRoute>} />
      <Route path="/customer/settings" element={<ProtectedRoute role="customer"><CustomerSettings /></ProtectedRoute>} />
      <Route path="/customer/chatbot"  element={<ProtectedRoute role="customer"><CustomerChatbot /></ProtectedRoute>} />
      <Route path="/customer/ai"       element={<ProtectedRoute role="customer"><CustomerChatbot /></ProtectedRoute>} />

      {/* Tailor Routes */}
      <Route path="/tailor/dashboard" element={<ProtectedRoute role="tailor"><TailorDashboard /></ProtectedRoute>} />
      <Route path="/tailor/orders" element={<ProtectedRoute role="tailor"><IncomingOrders /></ProtectedRoute>} />
      <Route path="/tailor/progress" element={<ProtectedRoute role="tailor"><StitchingProgress /></ProtectedRoute>} />
      <Route path="/tailor/services" element={<ProtectedRoute role="tailor"><TailorServices /></ProtectedRoute>} />
      <Route path="/tailor/courses" element={<ProtectedRoute role="tailor"><TailorCourses /></ProtectedRoute>} />
      <Route path="/tailor/quotations" element={<ProtectedRoute role="tailor"><TailorQuotations /></ProtectedRoute>} />
      <Route path="/tailor/appointments" element={<ProtectedRoute role="tailor"><TailorAppointments /></ProtectedRoute>} />
      <Route path="/tailor/offers" element={<ProtectedRoute role="tailor"><TailorOffers /></ProtectedRoute>} />
      <Route path="/tailor/portfolio" element={<ProtectedRoute role="tailor"><TailorPortfolio /></ProtectedRoute>} />
      <Route path="/tailor/payments" element={<ProtectedRoute role="tailor"><TailorPayments /></ProtectedRoute>} />
      <Route path="/tailor/customers" element={<ProtectedRoute role="tailor"><TailorCustomers /></ProtectedRoute>} />
      <Route path="/tailor/chat" element={<ProtectedRoute role="tailor"><TailorChat /></ProtectedRoute>} />
      <Route path="/tailor/notifications" element={<ProtectedRoute role="tailor"><TailorNotifications /></ProtectedRoute>} />
      <Route path="/tailor/reviews" element={<ProtectedRoute role="tailor"><TailorReviews /></ProtectedRoute>} />
      <Route path="/tailor/profile" element={<ProtectedRoute role="tailor"><TailorProfileSettings /></ProtectedRoute>} />
      <Route path="/tailor/settings" element={<ProtectedRoute role="tailor"><TailorSettings /></ProtectedRoute>} />

      {/* Student Routes */}
      <Route path="/student/dashboard" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/courses" element={<ProtectedRoute role="student"><Courses /></ProtectedRoute>} />
      <Route path="/student/my-courses" element={<ProtectedRoute role="student"><StudentMyCourses /></ProtectedRoute>} />
      <Route path="/student/courses/:id" element={<ProtectedRoute role="student"><CourseDetail /></ProtectedRoute>} />
      <Route path="/student/lessons" element={<ProtectedRoute role="student"><StudentLessons /></ProtectedRoute>} />
      <Route path="/student/assignments" element={<ProtectedRoute role="student"><StudentAssignments /></ProtectedRoute>} />
      <Route path="/student/certificates" element={<ProtectedRoute role="student"><StudentCertificates /></ProtectedRoute>} />
      <Route path="/student/progress" element={<ProtectedRoute role="student"><StudentProgress /></ProtectedRoute>} />
      <Route path="/student/chat" element={<ProtectedRoute role="student"><StudentChat /></ProtectedRoute>} />
      <Route path="/student/notifications" element={<ProtectedRoute role="student"><StudentNotifications /></ProtectedRoute>} />
      <Route path="/student/profile" element={<ProtectedRoute role="student"><StudentProfile /></ProtectedRoute>} />
      <Route path="/student/settings" element={<ProtectedRoute role="student"><StudentSettings /></ProtectedRoute>} />

      {/* Admin Routes — all protected by ProtectedRoute role="admin" */}
      <Route path="/admin/dashboard"         element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
      {/* User management */}
      <Route path="/admin/users"             element={<ProtectedRoute role="admin"><Users /></ProtectedRoute>} />
      <Route path="/admin/customers"         element={<ProtectedRoute role="admin"><AdminCustomers /></ProtectedRoute>} />
      <Route path="/admin/tailors"           element={<ProtectedRoute role="admin"><AdminTailorsList /></ProtectedRoute>} />
      <Route path="/admin/tailors-list"      element={<ProtectedRoute role="admin"><AdminTailorsList /></ProtectedRoute>} />
      <Route path="/admin/students"          element={<ProtectedRoute role="admin"><AdminStudentsList /></ProtectedRoute>} />
      <Route path="/admin/students-list"     element={<ProtectedRoute role="admin"><AdminStudentsList /></ProtectedRoute>} />
      <Route path="/admin/employees"         element={<ProtectedRoute role="admin"><AdminEmployees /></ProtectedRoute>} />
      {/* Tailor verification (separate from tailors list) */}
      <Route path="/admin/tailor-verification" element={<ProtectedRoute role="admin"><TailorVerification /></ProtectedRoute>} />
      {/* Orders & Requests */}
      <Route path="/admin/requests"          element={<ProtectedRoute role="admin"><OrderManagement /></ProtectedRoute>} />
      <Route path="/admin/orders"            element={<ProtectedRoute role="admin"><OrderManagement /></ProtectedRoute>} />
      <Route path="/admin/order-assignment"  element={<ProtectedRoute role="admin"><AdminOrderAssignment /></ProtectedRoute>} />
      <Route path="/admin/appointments"      element={<ProtectedRoute role="admin"><AdminAppointments /></ProtectedRoute>} />
      {/* Financial */}
      <Route path="/admin/payments"          element={<ProtectedRoute role="admin"><AdminPayments /></ProtectedRoute>} />
      {/* Content */}
      <Route path="/admin/courses"           element={<ProtectedRoute role="admin"><AdminCourses /></ProtectedRoute>} />
      <Route path="/admin/course-approval"   element={<ProtectedRoute role="admin"><CourseApproval /></ProtectedRoute>} />
      <Route path="/admin/offers"            element={<ProtectedRoute role="admin"><AdminOffers /></ProtectedRoute>} />
      {/* Support */}
      <Route path="/admin/complaints"        element={<ProtectedRoute role="admin"><Complaints /></ProtectedRoute>} />
      <Route path="/admin/reviews"           element={<ProtectedRoute role="admin"><AdminReviews /></ProtectedRoute>} />
      {/* Analytics */}
      <Route path="/admin/reports"           element={<ProtectedRoute role="admin"><Reports /></ProtectedRoute>} />
      <Route path="/admin/analytics"         element={<ProtectedRoute role="admin"><Reports /></ProtectedRoute>} />
      <Route path="/admin/notifications"     element={<ProtectedRoute role="admin"><AdminNotifications /></ProtectedRoute>} />
      <Route path="/admin/settings"          element={<ProtectedRoute role="admin"><AdminSettings /></ProtectedRoute>} />

      {/* Employee Routes */}
      <Route path="/employee/dashboard" element={<ProtectedRoute role="employee"><EmployeeDashboard /></ProtectedRoute>} />
      <Route path="/employee/orders"    element={<ProtectedRoute role="employee"><EmployeeOrders /></ProtectedRoute>} />
      <Route path="/employee/profile"   element={<ProtectedRoute role="employee"><EmployeeProfile /></ProtectedRoute>} />
      <Route path="/employee/settings"  element={<ProtectedRoute role="employee"><EmployeeSettings /></ProtectedRoute>} />

      {/* Fallback 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
    <ThemeSettingsWidget />
    </>
  )
}
