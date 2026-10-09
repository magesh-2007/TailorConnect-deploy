import 'dotenv/config'
import http from 'http'
import { Server as SocketIOServer } from 'socket.io'

import app from './app.js'
import { connectDB } from './config/db.js'
import { initSocket } from './services/socketService.js'
import { checkApproachingDeadlines } from './utils/deadlineReminder.js'

const PORT = process.env.PORT || 5000

const server = http.createServer(app)

// ── Setup Socket.IO ───────────────────────────────────────────────────────────
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH']
  }
})

initSocket(io)

// ── Handle server-level errors BEFORE calling listen() ───────────────────────
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n[Server] ❌ Port ${PORT} is already in use.`)
    console.error('[Server] Another backend instance is probably still running.')
    console.error('[Server]')
    console.error('[Server] ── How to fix ──────────────────────────────────────')
    console.error(`[Server] 1. Find the process holding port ${PORT}:`)
    console.error(`[Server]    netstat -ano | findstr :${PORT}`)
    console.error('[Server] 2. Kill it (replace <PID> with the number from above):')
    console.error('[Server]    taskkill /PID <PID> /F')
    console.error('[Server] 3. Then run: npm run dev')
    console.error('[Server] ────────────────────────────────────────────────────\n')
  } else {
    console.error('[Server] Unexpected server error:', err.message || err)
  }

  process.exit(1)
})

// ── Start Server ──────────────────────────────────────────────────────────────
const startServer = async () => {
  try {
    await connectDB()

    // If database is empty, automatically seed authentic data
    const { default: User } = await import('./models/User.js')
    const count = await User.countDocuments()

    if (count === 0) {
      console.log('[Server] Database is empty. Running initial seed...')

      const { seedDatabase } = await import('./seed/seed.js')
      await seedDatabase(false, true)
    }

    server.listen(PORT, () => {
      console.log(
        `\n======================================================`
      )
      console.log(
        `🚀 TailorConnect Web App: http://localhost:5173`
      )
      console.log(
        `⚙️  Backend API Server:   http://localhost:${PORT}`
      )
      console.log(
        `📖 Swagger API Docs:     http://localhost:${PORT}/api/docs`
      )
      console.log(
        `======================================================\n`
      )
    })

    // Run approaching deadline check on boot and every hour
    checkApproachingDeadlines()
    setInterval(checkApproachingDeadlines, 60 * 60 * 1000)

  } catch (err) {
    const isConnRefused =
      err.message?.includes('ECONNREFUSED') ||
      err.code === 'ECONNREFUSED'

    if (isConnRefused) {
      console.error('[Server] ❌ Cannot connect to MongoDB!')
      console.error(
        '[Server] Make sure MongoDB is running and MONGODB_URI in .env is correct.'
      )
      console.error(
        `[Server] Current MONGODB_URI: ${process.env.MONGODB_URI ||
        'mongodb://127.0.0.1:27017/tailorconnect'
        }`
      )
    } else {
      console.error(
        '[Server] Fatal startup error:',
        err.message || err
      )
    }

    process.exit(1)
  }
}

startServer()

export { server, io }