
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import path from 'path'
import { fileURLToPath } from 'url'

import { setupSwagger } from './config/swagger.js'
import { errorHandler, notFound } from './middleware/errorHandler.js'
import { apiRateLimiter } from './middleware/rateLimiter.js'

// Routes
import authRoutes from './routes/authRoutes.js'
import tailorRoutes from './routes/tailorRoutes.js'
import customerRoutes from './routes/customerRoutes.js'
import studentRoutes from './routes/studentRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import courseRoutes from './routes/courseRoutes.js'
import offerRoutes from './routes/offerRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'
import certificateRoutes from './routes/certificateRoutes.js'
import chatRoutes from './routes/chatRoutes.js'
import reviewRoutes from './routes/reviewRoutes.js'
import wishlistRoutes from './routes/wishlistRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'
import uploadRoutes from './routes/uploadRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import employeeRoutes from './routes/employeeRoutes.js'
import aiRoutes from './routes/aiRoutes.js'
import measurementRoutes from './routes/measurementRoutes.js'
import appointmentRoutes from './routes/appointmentRoutes.js'
import complaintRoutes from './routes/complaintRoutes.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// Security & General Middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
)

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL
].filter(Boolean)

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true)
      // Allow matching origins, preview/prod vercel URLs, onrender URLs
      return callback(null, origin)
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
)

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Serve static uploaded assets
const uploadPath = path.join(__dirname, '../uploads')
app.use('/uploads', express.static(uploadPath))

// Swagger API Documentation
setupSwagger(app)

// General rate limiting
app.use('/api', apiRateLimiter)

// Root URL redirect / welcome page
app.get('/', (req, res) => {
  if (req.accepts('html')) {
    return res.redirect('http://localhost:5173')
  }
  return res.json({
    success: true,
    message: 'TailorConnect API is running. Open the Web App at http://localhost:5173',
    frontendUrl: 'http://localhost:5173',
    docs: 'http://localhost:5000/api/docs'
  })
})

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'TailorConnect API is online and fully operational',
    timestamp: new Date().toISOString()
  })
})

// Route Mounting
app.use('/api/auth', authRoutes)
app.use('/api/tailors', tailorRoutes)
app.use('/api/customers', customerRoutes)
app.use('/api/students', studentRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/courses', courseRoutes)
app.use('/api/offers', offerRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/certificates', certificateRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/wishlist', wishlistRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/employees', employeeRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/measurements', measurementRoutes)
app.use('/api/appointments', appointmentRoutes)
app.use('/api/complaints', complaintRoutes)

// Error Handling
app.use(notFound)
app.use(errorHandler)

export default app
