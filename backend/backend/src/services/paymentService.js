const axios = require('axios');
const crypto = require('crypto');
const Setting = require('../models/Setting');
const Transaction = require('../models/Transaction');
const Booking = require('../models/Booking');

class PaymentService {
    constructor() {
        this.razorpayKeyId = process.env.RAZORPAY_KEY_ID;
        this.razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
        this.callbackUrl = process.env.RAZORPAY_CALLBACK_URL || `${process.env.BACKEND_URL || ''}/api/payment/callback`;
    }

    // Get Razorpay settings from database (admin-configurable) or env
    async getSettings() {
        const settings = await Setting.find({
            key: { $in: ['razorpay_key_id', 'razorpay_key_secret', 'razorpay_enabled'] }
        });

        const config = {};
        settings.forEach(setting => {
            config[setting.key] = setting.value;
        });

        return {
            keyId: config.razorpay_key_id || this.razorpayKeyId,
            keySecret: config.razorpay_key_secret || this.razorpayKeySecret,
            enabled: config.razorpay_enabled !== false
        };
    }

    // Initiate Razorpay payment
    async initiatePayment(bookingId, userId, amount, clientOrigin) {
        try {
            const config = await this.getSettings();

            if (!config.enabled || !config.keyId || !config.keySecret) {
                throw new Error('Payment gateway not configured');
            }

            const receipt = `BRO${Date.now()}${Math.floor(Math.random() * 1000)}`;

            // Create transaction record (pending, order id will be updated after Razorpay order creation)
            const transaction = await Transaction.create({
                bookingId,
                userId,
                transactionType: 'payment',
                amount,
                paymentMode: 'razorpay',
                status: 'pending',
                gatewayOrderId: receipt
            });

            // Create Razorpay order
            const orderPayload = {
                amount: Math.round(Number(amount) * 100), // in paise
                currency: 'INR',
                receipt,
                payment_capture: 1
            };

            const auth = Buffer.from(`${config.keyId}:${config.keySecret}`).toString('base64');
            const orderRes = await axios.post('https://api.razorpay.com/v1/orders', orderPayload, {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/json'
                }
            });

            const order = orderRes.data; // { id, amount, currency, receipt, status }

            // Update transaction and booking with Razorpay order id
            transaction.gatewayOrderId = order.id;
            await transaction.save();

            try {
                await Booking.findByIdAndUpdate(bookingId, {
                    paymentOrderId: order.id,
                    paymentMode: 'razorpay'
                });
            } catch {}

            return {
                success: true,
                orderId: order.id,
                transactionId: transaction._id,
                amount: amount,
                currency: 'INR',
                keyId: config.keyId
            };
        } catch (error) {
            console.error('Payment Initiation Error:', error.message);
            throw error;
        }
    }

    // Verify Razorpay signature
    async verifyPayment(params) {
        try {
            const config = await this.getSettings();

            const orderId = params.razorpay_order_id || params.orderId || params.order_id;
            const paymentId = params.razorpay_payment_id || params.paymentId || params.payment_id;
            const signature = params.razorpay_signature || params.signature;

            if (!orderId || !paymentId || !signature) {
                return {
                    success: false,
                    orderId,
                    message: 'Missing Razorpay verification fields'
                };
            }

            const payload = `${orderId}|${paymentId}`;
            const expectedSignature = crypto.createHmac('sha256', config.keySecret)
                .update(payload)
                .digest('hex');

            if (process.env.NODE_ENV !== 'production') {
                console.log('[Razorpay Verify] orderId:', orderId);
                console.log('[Razorpay Verify] paymentId:', paymentId);
                console.log('[Razorpay Verify] match:', expectedSignature === signature);
            }

            const ok = expectedSignature === signature;
            if (!ok) {
                try {
                    const auth = Buffer.from(`${config.keyId}:${config.keySecret}`).toString('base64');
                    const payRes = await axios.get(`https://api.razorpay.com/v1/payments/${paymentId}`, {
                        headers: { 'Authorization': `Basic ${auth}` }
                    });
                    const pay = payRes.data;
                    if (pay && pay.status === 'captured' && pay.order_id === orderId) {
                        return { success: true, orderId, transactionId: paymentId };
                    }
                } catch (e) {}
                return {
                    success: false,
                    orderId,
                    message: 'Invalid signature'
                };
            }

            return {
                success: true,
                orderId,
                transactionId: paymentId
            };
        } catch (error) {
            console.error('Payment Verification Error:', error.message);
            throw error;
        }
    }

    // Update transaction status
    async updateTransaction(orderId, status, gatewayResponse) {
        try {
            const transaction = await Transaction.findOne({ gatewayOrderId: orderId });

            if (!transaction) {
                throw new Error('Transaction not found');
            }

            transaction.status = status;
            transaction.gatewayTransactionId = gatewayResponse.razorpay_payment_id || gatewayResponse.transactionId || gatewayResponse.TXNID || null;
            transaction.gatewayResponse = gatewayResponse;

            await transaction.save();

            return transaction;
        } catch (error) {
            console.error('Transaction Update Error:', error.message);
            throw error;
        }
    }

    // Ensure order has a captured payment
    async ensureOrderCaptured(orderId) {
        try {
            const config = await this.getSettings();
            const auth = Buffer.from(`${config.keyId}:${config.keySecret}`).toString('base64');
            for (let i = 0; i < 5; i++) {
                const res = await axios.get(`https://api.razorpay.com/v1/orders/${orderId}/payments`, {
                    headers: { 'Authorization': `Basic ${auth}` }
                });
                const payments = res.data && Array.isArray(res.data.items) ? res.data.items : [];
                const captured = payments.find(p => p.status === 'captured');
                if (captured) {
                    return { success: true, transactionId: captured.id, payment: captured };
                }
                await new Promise(r => setTimeout(r, 800));
            }
            return { success: false };
        } catch (error) {
            console.error('Razorpay Order Payments Error:', error.message);
            return { success: false };
        }
    }
}

module.exports = new PaymentService();
