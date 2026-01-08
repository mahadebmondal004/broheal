const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const Setting = require('../models/Setting');

class WalletService {
    async getDefaultCommissionPercentage() {
        const setting = await Setting.findOne({ key: 'commission_percentage' });
        const envVal = parseFloat(process.env.COMMISSION_PERCENTAGE);
        const val = setting != null ? Number(setting.value) : envVal;
        return Number.isFinite(val) ? val : 10;
    }

    async getCommissionPercentageForBooking(bookingId) {
        const Booking = require('../models/Booking');
        const Zone = require('../models/Zone');
        const booking = await Booking.findById(bookingId);
        if (!booking) return await this.getDefaultCommissionPercentage();
        const lat = booking.address?.latitude;
        const lng = booking.address?.longitude;
        if (typeof lat === 'number' && typeof lng === 'number') {
            try {
                const point = { type: 'Point', coordinates: [lng, lat] };
                const zone = await Zone.findOne({ geometry: { $geoIntersects: { $geometry: point } }, status: 'active' });
                if (zone?.commissionPercentage != null) return zone.commissionPercentage;
            } catch {}
        }
        if (booking.address?.pincode) {
            const zone = await Zone.findOne({ pincodes: booking.address.pincode, status: 'active' });
            if (zone?.commissionPercentage != null) return zone.commissionPercentage;
        }
        if (booking.address?.city) {
            const zone = await Zone.findOne({ city: booking.address.city, status: 'active' });
            if (zone?.commissionPercentage != null) return zone.commissionPercentage;
        }
        return await this.getDefaultCommissionPercentage();
    }

    async calculateCommission(amount, commissionPercentage) {
        const pct = typeof commissionPercentage === 'number' ? commissionPercentage : await this.getDefaultCommissionPercentage();
        const commission = (amount * pct) / 100;
        const therapistAmount = amount - commission;
        return { totalAmount: amount, commission, therapistAmount };
    }

    // Credit wallet after successful payment
    async creditWallet(therapistId, bookingId, amount) {
        try {
            const commissionPercentage = await this.getCommissionPercentageForBooking(bookingId);
            const { commission, therapistAmount } = await this.calculateCommission(amount, commissionPercentage);

            // Find or create wallet
            let wallet = await Wallet.findOne({ therapistId });

            if (!wallet) {
                wallet = await Wallet.create({
                    therapistId,
                    balance: 0,
                    totalEarned: 0,
                    totalWithdrawn: 0
                });
            }

            // Update wallet
            wallet.balance += therapistAmount;
            wallet.totalEarned += therapistAmount;
            wallet.lastUpdated = new Date();
            await wallet.save();

            // Create wallet credit transaction
            await Transaction.create({
                bookingId,
                userId: therapistId,
                therapistId,
                transactionType: 'wallet_credit',
                amount: therapistAmount,
                status: 'success',
                paymentMode: 'wallet'
            });

            // Create commission transaction
            await Transaction.create({
                bookingId,
                userId: therapistId,
                therapistId,
                transactionType: 'commission',
                amount: commission,
                status: 'success',
                paymentMode: 'wallet'
            });

            return {
                success: true,
                wallet,
                creditedAmount: therapistAmount,
                commission,
                commissionPercentage
            };
        } catch (error) {
            console.error('Wallet Credit Error:', error.message);
            throw error;
        }
    }

    // Process withdrawal request
    async processWithdrawal(therapistId, amount, bankDetails) {
        try {
            const wallet = await Wallet.findOne({ therapistId });

            if (!wallet) {
                throw new Error('Wallet not found');
            }

            if (wallet.balance < amount) {
                throw new Error('Insufficient balance');
            }

            // Deduct from wallet
            wallet.balance -= amount;
            wallet.totalWithdrawn += amount;
            wallet.lastUpdated = new Date();
            await wallet.save();

            // Create withdrawal transaction
            const transaction = await Transaction.create({
                userId: therapistId,
                therapistId,
                transactionType: 'withdrawal',
                amount,
                status: 'success',
                gatewayResponse: { bankDetails }
            });

            return {
                success: true,
                wallet,
                transaction
            };
        } catch (error) {
            console.error('Withdrawal Error:', error.message);
            throw error;
        }
    }

    // Get wallet balance
    async getBalance(therapistId) {
        let wallet = await Wallet.findOne({ therapistId });

        if (!wallet) {
            wallet = await Wallet.create({
                therapistId,
                balance: 0,
                totalEarned: 0,
                totalWithdrawn: 0
            });
        }

        return wallet;
    }

    // Get transaction history
    async getTransactions(therapistId, limit = 50) {
        const transactions = await Transaction.find({ therapistId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('bookingId', 'bookingDateTime status');

        return transactions;
    }
}

module.exports = new WalletService();
