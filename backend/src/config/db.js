import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

let mongoServer = null

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return
  }
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.warn('[Database] ⚠️ MONGODB_URI is not set in Environment Variables. Falling back to local/in-memory.')
  }
  const targetUri = uri || 'mongodb://127.0.0.1:27017/tailorconnect'
  try {
    await mongoose.connect(targetUri, { serverSelectionTimeoutMS: 5000 })
    console.log('[Database] ✅ MongoDB Connected successfully:', targetUri.replace(/\/\/.*@/, '//<credentials>@'))
  } catch (err) {
    console.warn('[Database] Primary MongoDB connection failed:', err.message)
    console.warn('[Database] Attempting In-Memory MongoDB server fallback...')
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server')
      try {
        mongoServer = await MongoMemoryServer.create()
      } catch {
        mongoServer = await MongoMemoryServer.create({ instance: { dbName: 'tailorconnect_fallback' } })
      }
      const memUri = mongoServer.getUri()
      await mongoose.connect(memUri)
      console.log('[Database] ✅ In-Memory MongoDB Connected:', memUri)
    } catch (memErr) {
      console.error('[Database] ❌ Failed to start In-Memory MongoDB:', memErr.message)
      console.error('[Database] 👉 Please provide a valid MONGODB_URI (e.g. MongoDB Atlas) in your Render Environment Variables!')
      throw err
    }
  }
}

export const disconnectDB = async () => {
  await mongoose.disconnect()
  if (mongoServer) {
    await mongoServer.stop()
  }
}
