const Booking = require('../models/Booking');
const Chat = require('../models/Chat');
const paymentService = require('../services/paymentService');
const walletService = require('../services/walletService');
const notificationService = require('../services/notificationService');

// Initiate payment
exports.initiatePayment = async (req, res) => {
    try {
        const { bookingId } = req.body;

        // Get booking
        let booking = await Booking.findOne({
            _id: bookingId,
            userId: req.user._id,
            paymentStatus: 'pending',
            status: { $in: ['awaiting_payment', 'completed', 'booked'] }
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found or not eligible for payment'
            });
        }

        // If booking was "booked", move to awaiting_payment before initiating
        if (booking.status === 'booked') {
            try {
                booking = await Booking.findByIdAndUpdate(
                    bookingId,
                    { status: 'awaiting_payment' },
                    { new: true }
                );
            } catch {}
        }

        // Initiate payment
        const paymentData = await paymentService.initiatePayment(
            bookingId,
            req.user._id,
            booking.amount,
            req.headers.origin
        );

        res.status(200).json({
            success: true,
            ...paymentData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Payment callback (from gateway)
exports.paymentCallback = async (req, res) => {
    try {
        const params = req.method === 'GET' ? req.query : req.body;
        const queryOrderId = req.query?.orderId;

        // Verify payment
        const verification = await paymentService.verifyPayment(params);

        const fallbackOrderId = verification.orderId || params.razorpay_order_id || params.orderId || queryOrderId;

        if (!verification.success) {
            // Fallback: check order payments if signature verification failed
            const ensure = await paymentService.ensureOrderCaptured(fallbackOrderId);
            if (ensure.success) {
                const txn = await paymentService.updateTransaction(fallbackOrderId, 'success', { razorpay_payment_id: ensure.transactionId });
                const bookingPrev = await Booking.findById(txn.bookingId);
                const walletUpdate = await walletService.creditWallet(bookingPrev.therapistId, bookingPrev._id, bookingPrev.amount);
                const booking = await Booking.findByIdAndUpdate(
                    txn.bookingId,
                    { paymentStatus: 'success', status: 'completed', paymentTransactionId: ensure.transactionId, commission: walletUpdate.commission },
                    { new: true }
                );
                try { await Chat.findOneAndUpdate({ bookingId: booking._id }, { status: 'closed' }); } catch {}
                await notificationService.notifyPaymentSuccess(booking);

                const orderId = fallbackOrderId || 'unknown';
                if (params.razorpay_order_id || params.razorpay_payment_id || params.razorpay_signature) {
                    return res.status(200).json({ success: true, orderId });
                }
                return res.redirect(`${process.env.FRONTEND_URL}/payment/success/${orderId}`);
            }

            try {
                const txn = await paymentService.updateTransaction(fallbackOrderId, 'failed', params);
                try {
                    await Booking.findByIdAndUpdate(txn.bookingId, { paymentStatus: 'failed', status: 'awaiting_payment' });
                } catch {}
            } catch {}

            const orderId = fallbackOrderId || 'unknown';

            // If called via XHR (Razorpay Checkout handler), return JSON
            if (params.razorpay_order_id || params.razorpay_payment_id || params.razorpay_signature) {
                return res.status(400).json({ success: false, orderId, message: verification.message || 'Payment failed' });
            }

            const reason = encodeURIComponent(verification.message || 'Payment failed');
            const code = encodeURIComponent('');
            return res.redirect(`${process.env.FRONTEND_URL}/payment/failure/${orderId}?reason=${reason}&code=${code}`);
        }

        // Update transaction
        const transaction = await paymentService.updateTransaction(
            fallbackOrderId,
            'success',
            params
        );

        // Update booking
        const bookingPrev = await Booking.findById(transaction.bookingId);
        const walletUpdate = await walletService.creditWallet(
            bookingPrev.therapistId,
            bookingPrev._id,
            bookingPrev.amount
        );
        const booking = await Booking.findByIdAndUpdate(
            transaction.bookingId,
            { paymentStatus: 'success', status: 'completed', paymentTransactionId: verification.transactionId, commission: walletUpdate.commission },
            { new: true }
        );
        try { await Chat.findOneAndUpdate({ bookingId: booking._id }, { status: 'closed' }); } catch {}

        // Send notifications
        await notificationService.notifyPaymentSuccess(booking);

        const orderId = fallbackOrderId || 'unknown';
        // If called via XHR (Razorpay Checkout handler), return JSON
        if (params.razorpay_order_id || params.razorpay_payment_id || params.razorpay_signature) {
            return res.status(200).json({ success: true, orderId });
        }
        return res.redirect(`${process.env.FRONTEND_URL}/payment/success/${orderId}`);
    } catch (error) {
        const orderId = req.query?.orderId || req.body?.razorpay_order_id || 'unknown';
        const reason = encodeURIComponent(error?.message || 'Unhandled error');
        const code = encodeURIComponent('');
        res.redirect(`${process.env.FRONTEND_URL}/payment/failure/${orderId}?reason=${reason}&code=${code}`);
    }
};

// Verify payment status
exports.verifyPayment = async (req, res) => {
    try {
        const { orderId } = req.params;

        const Transaction = require('../models/Transaction');
        let transaction = await Transaction.findOne({ gatewayOrderId: orderId })
            .populate('bookingId');

        if (!transaction) {
            const bookingByOrder = await Booking.findOne({ paymentOrderId: orderId });
            if (!bookingByOrder) {
                return res.status(404).json({ success: false, message: 'Transaction not found' });
            }
            const ensure = await paymentService.ensureOrderCaptured(orderId);
            if (!ensure.success) {
                return res.status(400).json({ success: false, message: 'Payment not captured yet' });
            }
            transaction = await Transaction.findOneAndUpdate(
                { gatewayOrderId: orderId },
                {
                    bookingId: bookingByOrder._id,
                    userId: bookingByOrder.userId,
                    therapistId: bookingByOrder.therapistId,
                    transactionType: 'payment',
                    amount: bookingByOrder.amount,
                    paymentMode: 'razorpay',
                    status: 'success',
                    gatewayOrderId: orderId,
                    gatewayTransactionId: ensure.transactionId,
                    gatewayResponse: { reconciled: true }
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            ).populate('bookingId');

            const walletUpdate = await walletService.creditWallet(bookingByOrder.therapistId, bookingByOrder._id, bookingByOrder.amount);
            const booking = await Booking.findByIdAndUpdate(
                bookingByOrder._id,
                { paymentStatus: 'success', status: 'completed', paymentTransactionId: ensure.transactionId, commission: walletUpdate.commission },
                { new: true }
            );
            try { await Chat.findOneAndUpdate({ bookingId: booking._id }, { status: 'closed' }); } catch {}
        }

        // Reconcile pending Razorpay orders by checking captured payments
        if (transaction.paymentMode === 'razorpay' && transaction.status !== 'success') {
            const ensure = await paymentService.ensureOrderCaptured(orderId);
            if (ensure.success) {
                transaction.status = 'success';
                transaction.gatewayTransactionId = ensure.transactionId;
                await transaction.save();

                if (transaction.bookingId) {
                    const bookingPrev = await Booking.findById(transaction.bookingId._id);
                    const walletUpdate = await walletService.creditWallet(bookingPrev.therapistId, bookingPrev._id, bookingPrev.amount);
                    const booking = await Booking.findByIdAndUpdate(
                        transaction.bookingId._id,
                        { paymentStatus: 'success', status: 'completed', paymentTransactionId: ensure.transactionId, commission: walletUpdate.commission },
                        { new: true }
                    );
                    try { await Chat.findOneAndUpdate({ bookingId: booking._id }, { status: 'closed' }); } catch {}
                    await notificationService.notifyPaymentSuccess(booking);
                }
            }
        }

        res.status(200).json({
            success: true,
            transaction: {
                orderId: transaction.gatewayOrderId,
                transactionId: transaction.gatewayTransactionId,
                status: transaction.status,
                amount: transaction.amount,
                bookingId: transaction.bookingId?._id
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
