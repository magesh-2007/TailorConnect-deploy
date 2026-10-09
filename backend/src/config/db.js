import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

let mongoServer = null

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return
  }
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tailorconnect'
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 })
    console.log('[Database] MongoDB Connected:', uri)
  } catch (err) {
    if (err.code === 'ECONNREFUSED' || err.message?.includes('ECONNREFUSED') || err.name === 'MongooseServerSelectionError') {
      console.warn('[Database] Local MongoDB unavailable. Starting in-memory MongoDB server...')
      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server')
        try {
          mongoServer = await MongoMemoryServer.create()
        } catch {
          mongoServer = await MongoMemoryServer.create({ instance: { dbName: 'tailorconnect_fallback' } })
        }
        const memUri = mongoServer.getUri()
        await mongoose.connect(memUri)
        console.log('[Database] In-Memory MongoDB Connected:', memUri)
      } catch (memErr) {
        console.error('[Database] Failed to start MongoMemoryServer:', memErr.message)
        throw err
      }
    } else {
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
