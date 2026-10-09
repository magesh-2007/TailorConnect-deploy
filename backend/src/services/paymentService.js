import crypto from 'crypto'
import Payment from '../models/Payment.js'
import Order from '../models/Order.js'

export class PaymentService {
  static async createOrderPayment({ userId, userName, userType, orderId, amount, paymentMethod = 'UPI' }) {
    const order = await Order.findById(orderId)
    if (!order) {
      throw new Error('Order not found.')
    }

    // Check idempotency: If payment already SUCCESS for this order, prevent duplicate payment
    const existingSuccess = await Payment.findOne({ orderId, status: 'SUCCESS' })
    if (existingSuccess) {
      throw new Error('Payment has already been completed for this order.')
    }

    const timestamp = Date.now()
    const paymentNumber = `PAY-ORD-${Math.floor(1000 + Math.random() * 9000)}`
    const transactionId = `TXN-TC-${timestamp}-${Math.floor(1000 + Math.random() * 9000)}`

    // Razorpay / Stripe gateway order reference string
    const gatewayOrderId = `order_${crypto.randomBytes(8).toString('hex')}`

    const platformFee = Math.round(amount * 0.05) || 50
    const gst = Math.round(amount * 0.18) || 0

    const payment = await Payment.create({
      paymentNumber,
      userId,
      userName: userName || 'Customer',
      userType: userType || 'Customer',
      type: 'Order',
      orderId: order._id,
      orderNumber: order.orderNumber,
      tailorId: order.tailorId,
      amount,
      platformFee,
      gst,
      paymentMethod,
      transactionId,
      status: 'SUCCESS',
      paidAt: new Date()
    })

    // Update order status transaction-safely
    order.paymentStatus = 'SUCCESS'
    order.paymentId = transactionId
    if (order.orderStatus === 'REQUEST_RECEIVED') {
      order.orderStatus = 'ACCEPTED'
      order.progress = Math.max(order.progress || 0, 20)
    }
    await order.save()

    return {
      payment,
      gatewayOrderId,
      signature: crypto.createHmac('sha256', process.env.JWT_SECRET || 'secret').update(`${gatewayOrderId}|${transactionId}`).digest('hex')
    }
  }

  static verifySignature(orderId, paymentId, signature) {
    const expected = crypto.createHmac('sha256', process.env.JWT_SECRET || 'secret').update(`${orderId}|${paymentId}`).digest('hex')
    return expected === signature
  }
}

export default PaymentService
