const Booking = require('../models/Booking');
const TherapistKyc = require('../models/TherapistKyc');
const TherapistSlot = require('../models/TherapistSlot');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const Referral = require('../models/Referral');
const walletService = require('../services/walletService');
const paymentService = require('../services/paymentService');
const notificationService = require('../services/notificationService');
const { startOfDay, addDays } = require('date-fns');
const User = require('../models/User');

// Get therapist bookings
exports.getBookings = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = { therapistId: req.user._id };

        if (status) {
            filter.status = status;
        }

        const bookings = await Booking.find(filter)
            .populate('userId', 'name phone')
            .populate('serviceId', 'title price duration')
            .sort({ bookingDateTime: -1 });

        res.status(200).json({
            success: true,
            count: bookings.length,
            bookings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
// Update booking status
exports.updateBookingStatus = async (req, res) => {
    try {
        const { status, location } = req.body;
        const { id } = req.params;

        const booking = await Booking.findOne({
            _id: id,
            therapistId: req.user._id
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Normalize status before save
        booking.status = (status === 'completed') ? 'awaiting_payment' : status;
        if (status === 'completed') {
            booking.paymentStatus = 'pending';
        }
        if (status === 'on_the_way' && location && typeof location.lat === 'number' && typeof location.lng === 'number') {
            booking.therapistLocation = {
                latitude: location.lat,
                longitude: location.lng,
                updatedAt: new Date()
            };
        }
        await booking.save();

        // Send notifications based on status
        if (status === 'on_the_way') {
            await notificationService.notifyTherapistOnTheWay(booking);
        } else if (status === 'completed') {
            await paymentService.initiatePayment(
                booking._id,
                booking.userId,
                booking.amount,
                req.headers.origin
            );
            const payLink = `${process.env.FRONTEND_URL}/dashboard`;
            await notificationService.notifyServiceCompleted(booking, payLink);
        }

        res.status(200).json({
            success: true,
            booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Live location updates while on_the_way or in_progress
exports.updateTherapistLocation = async (req, res) => {
    try {
        const { lat, lng } = req.body;
        const { id } = req.params;

        if (typeof lat !== 'number' || typeof lng !== 'number') {
            return res.status(400).json({ success: false, message: 'Invalid coordinates' });
        }

        const booking = await Booking.findOne({ _id: id, therapistId: req.user._id });
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        if (!['on_the_way', 'in_progress'].includes(booking.status)) {
            return res.status(400).json({ success: false, message: 'Location updates allowed only on the way or in progress' });
        }

        booking.therapistLocation = { latitude: lat, longitude: lng, updatedAt: new Date() };
        await booking.save();

        res.status(200).json({ success: true, location: booking.therapistLocation });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// Submit KYC
exports.submitKyc = async (req, res) => {
    try {
        const { idType, idNumber, idProofUrl, certificateUrl, permanentAddress, presentAddress, reference } = req.body;

        // Check if KYC already exists
        let kyc = await TherapistKyc.findOne({ therapistId: req.user._id });

        if (kyc) {
            // Update existing KYC
            kyc.idType = idType;
            kyc.idProofUrl = idProofUrl;
            kyc.certificateUrl = certificateUrl;
            kyc.idNumber = idNumber || '';
            kyc.permanentAddress = permanentAddress;
            kyc.presentAddress = presentAddress;
            kyc.reference = reference;
            kyc.approvalStatus = 'pending';
            kyc.rejectionReason = null;
            await kyc.save();
        } else {
            // Create new KYC
            kyc = await TherapistKyc.create({
                therapistId: req.user._id,
                idType,
                idNumber: idNumber || '',
                idProofUrl,
                certificateUrl,
                permanentAddress,
                presentAddress,
                reference
            });
        }

        res.status(201).json({
            success: true,
            message: 'KYC submitted successfully',
            kyc
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get KYC status
exports.getKycStatus = async (req, res) => {
    try {
        const kyc = await TherapistKyc.findOne({ therapistId: req.user._id });

        res.status(200).json({
            success: true,
            kyc
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
// Get wallet
exports.getWallet = async (req, res) => {
    try {
        const wallet = await walletService.getBalance(req.user._id);

        res.status(200).json({
            success: true,
            wallet
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get transactions
exports.getTransactions = async (req, res) => {
    try {
        const { limit = 50 } = req.query;
        const transactions = await walletService.getTransactions(req.user._id, parseInt(limit));

        res.status(200).json({
            success: true,
            count: transactions.length,
            transactions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Create slots (bulk)
exports.createSlots = async (req, res) => {
    try {
        const therapistId = req.user._id;
        const { slots = [] } = req.body;

        if (!Array.isArray(slots) || slots.length === 0) {
            return res.status(400).json({ success: false, message: 'Slots array required' });
        }

        const toMinutes = (val) => {
            const [h, m] = String(val).split(':').map(Number);
            return h * 60 + m;
        };
        const toHHMM = (mins) => {
            const h = Math.floor(mins / 60);
            const m = mins % 60;
            return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        };

        const createdSlots = [];
        for (const slot of slots) {
            const slotDate = slot.slotDate ? new Date(slot.slotDate) : null;
            const startTime = slot.startTime || slot.slotTime;
            const endTime = slot.endTime || (startTime ? toHHMM(toMinutes(startTime) + 60) : null);
            if (!slotDate || !startTime) continue;

            const existing = await TherapistSlot.findOne({
                therapistId,
                slotDate,
                slotTime: startTime
            });
            if (existing) continue;

            const newSlot = await TherapistSlot.create({
                therapistId,
                slotDate,
                slotTime: startTime,
                startTime,
                endTime,
                status: slot.status || 'available'
            });
            createdSlots.push(newSlot);
        }

        return res.status(201).json({
            success: true,
            message: `${createdSlots.length} slots created`,
            slots: createdSlots
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Get slots
exports.getSlots = async (req, res) => {
    try {
        const { startDate, endDate, date } = req.query;

        const filter = { therapistId: req.user._id };

        if (date) {
            const d = new Date(date);
            const start = startOfDay(d);
            const end = addDays(start, 1);
            filter.slotDate = { $gte: start, $lt: end };
        } else if (startDate && endDate) {
            const start = startOfDay(new Date(startDate));
            const end = addDays(startOfDay(new Date(endDate)), 1);
            filter.slotDate = { $gte: start, $lt: end };
        }

        const slots = await TherapistSlot.find(filter).sort({ slotDate: 1, slotTime: 1 });

        res.status(200).json({
            success: true,
            count: slots.length,
            slots
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Withdraw request
exports.withdraw = async (req, res) => {
    try {
        const { amount, bankDetails } = req.body;

        const result = await walletService.processWithdrawal(req.user._id, amount, bankDetails);

        res.status(200).json({
            success: true,
            message: 'Withdrawal request processed',
            wallet: result.wallet,
            transaction: result.transaction
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
// Stats for therapist
exports.getStats = async (req, res) => {
    try {
        const kyc = await TherapistKyc.findOne({ therapistId: req.user._id });
        const wallet = await Wallet.findOne({ therapistId: req.user._id });
        const pendingJobs = await Booking.countDocuments({ therapistId: req.user._id, status: { $in: ['booked', 'awaiting_payment'] } });
        const completedJobs = await Booking.countDocuments({ therapistId: req.user._id, status: 'completed' });
        const totalReviews = 0;
        const avgRating = 0;

        res.status(200).json({
            success: true,
            stats: {
                walletBalance: wallet?.balance || 0,
                pendingJobs,
                completedJobs,
                totalReviews,
                avgRating,
                kycApproved: kyc?.approvalStatus === 'approved'
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// Profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Referral info for therapist
exports.getReferralInfo = async (req, res) => {
    try {
        let ref = await Referral.findOne({ referrerId: req.user._id });
        if (!ref) {
            const user = await User.findById(req.user._id);
            const code = Referral.generateReferralCode(user?.name || 'USR');
            ref = await Referral.create({ referrerId: req.user._id, referralCode: code });
        }
        const info = {
            referralCode: ref.referralCode,
            totalReferrals: ref.totalReferrals || (Array.isArray(ref.referredUsers) ? ref.referredUsers.length : 0),
            totalEarnings: ref.totalEarnings || 0,
            rewardAmount: ref.rewardAmount || 50
        };
        res.status(200).json({ success: true, referral: info });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getReferralUsers = async (req, res) => {
    try {
        const ref = await Referral.findOne({ referrerId: req.user._id }).populate('referredUsers.userId', 'name phone');
        const list = ref?.referredUsers || [];
        res.status(200).json({ success: true, count: list.length, users: list });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { name, email, phone, profileImage } = req.body;
        const update = {};
        if (name !== undefined) update.name = name;
        if (email !== undefined) update.email = email;
        if (phone !== undefined) update.phone = phone;
        if (profileImage !== undefined) update.profileImage = profileImage;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            update,
            { new: true, runValidators: true }
        ).select('-password');

        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get notifications
exports.getNotifications = async (req, res) => {
    try {
        const Notification = require('../models/Notification');
        const { limit = 50, seen } = req.query;

        const filter = { userId: req.user._id, type: 'inapp' };
        if (seen !== undefined) {
            filter.seen = seen === 'true';
        }

        const notifications = await Notification.find(filter)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        const unseenCount = await Notification.countDocuments({
            userId: req.user._id,
            type: 'inapp',
            seen: false
        });

        res.status(200).json({
            success: true,
            count: notifications.length,
            unseenCount,
            notifications
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Mark notification as read
exports.markNotificationRead = async (req, res) => {
    try {
        const Notification = require('../models/Notification');
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { seen: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        res.status(200).json({
            success: true,
            notification
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
