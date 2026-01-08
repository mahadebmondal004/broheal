const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Register = require('../models/Register');
const otpService = require('../services/otpService');
const smsService = require('../services/smsService');
const emailService = require('../services/emailService');
const { verifyIdToken } = require('../services/firebaseAdmin');
const Setting = require('../models/Setting');

// Send OTP
exports.sendOTP = async (req, res) => {
    try {
        const { phone } = req.body;

        // Generate and send OTP
        const otp = await otpService.createOTP(phone);

        const smsStatus = await smsService.sendOTP(phone, otp);
        if (!smsStatus?.success) {
            console.error('SMS send failed:', smsStatus?.error || smsStatus?.details);
        }

        res.status(200).json({
            success: true,
            message: 'OTP sent successfully',
            // In development, include OTP in response
            ...(process.env.NODE_ENV === 'development' && { otp, sms: smsStatus })
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Verify OTP and login/register
exports.verifyOTP = async (req, res) => {
    try {
        const { phone, otp, name, role = 'user' } = req.body;

        // Verify OTP
        const verification = await otpService.verifyOTP(phone, otp);

        if (!verification.success) {
            return res.status(400).json(verification);
        }

        // Check if user exists
        let user = await User.findOne({ phone });

        if (!user) {
            user = await User.create({ name: name || 'User', phone, role, whatsappVerified: true });
            try {
                await Register.create({ name: user.name, phone: user.phone, email: user.email || null, role: user.role, source: 'otp', userId: user._id });
            } catch { }
        } else {
            user.whatsappVerified = true;
            if (name && typeof name === 'string' && name.trim()) {
                const trimmed = name.trim();
                if (!user.name || user.name === 'User' || user.name !== trimmed) {
                    user.name = trimmed;
                }
            }
            await user.save();
        }

        // Generate tokens
        const accessToken = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        const refreshToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
        );

        res.status(200).json({
            success: true,
            message: 'Login successful',
            user: {
                _id: user._id,
                name: user.name,
                phone: user.phone,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage
            },
            accessToken,
            refreshToken
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Password-based login (fallback)
exports.login = async (req, res) => {
    try {
        const { phone, password } = req.body;

        const user = await User.findOne({ phone });

        if (!user || !user.password) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        if (user.status !== 'active') {
            return res.status(403).json({
                success: false,
                message: 'Account is inactive or suspended'
            });
        }

        // Generate tokens
        const accessToken = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        const refreshToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
        );

        res.status(200).json({
            success: true,
            message: 'Login successful',
            user: {
                _id: user._id,
                name: user.name,
                phone: user.phone,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage
            },
            accessToken,
            refreshToken
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Public registration with phone/password
exports.register = async (req, res) => {
    try {
        const { name, phone, password, email, role = 'user', adminSecret } = req.body;

        const existing = await User.findOne({ phone });
        if (existing) {
            return res.status(409).json({ success: false, message: 'Phone already registered' });
        }

        if (role === 'admin') {
            const allowedPhone = (process.env.ADMIN_ALLOWED_ADMIN_PHONE || '').replace(/\D/g, '').slice(-10);
            const hasSecret = process.env.ADMIN_REGISTRATION_SECRET && adminSecret === process.env.ADMIN_REGISTRATION_SECRET;
            const normalized = String(phone).replace(/\D/g, '').slice(-10);
            if (!(hasSecret || (allowedPhone && normalized === allowedPhone))) {
                return res.status(403).json({ success: false, message: 'Admin registration not permitted' });
            }
        }

        const user = new User({ name, phone, password, email: email || undefined, role });
        await user.save();
        try {
            await Register.create({ name: user.name, phone: user.phone, email: user.email || null, role: user.role, source: 'password', userId: user._id });
        } catch { }

        // Auto-login only for user role on first registration
        if (user.role === 'user') {
            const accessToken = jwt.sign(
                { userId: user._id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN }
            );

            const refreshToken = jwt.sign(
                { userId: user._id },
                process.env.JWT_REFRESH_SECRET,
                { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
            );

            return res.status(201).json({
                success: true,
                message: 'Registration successful',
                user: {
                    _id: user._id,
                    name: user.name,
                    phone: user.phone,
                    email: user.email,
                    role: user.role,
                    profileImage: user.profileImage
                },
                accessToken,
                refreshToken
            });
        }

        return res.status(201).json({ success: true, message: 'Registration successful. Please login.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Refresh token
exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token required'
            });
        }

        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token'
            });
        }

        // Generate new access token
        const accessToken = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );


        res.status(200).json({
            success: true,
            accessToken
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid refresh token'
        });
    }
};

// Send Admin OTP (Email ONLY)
exports.sendAdminOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const allowedAdminEmail = 'mahadebmondal004@gmail.com';

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Admin Email is required'
            });
        }

        if (email.toLowerCase() !== allowedAdminEmail.toLowerCase()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied: Invalid Admin Email'
            });
        }

        // Check if admin user exists
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Admin account not found'
            });
        }

        // Verify user has admin role
        if (user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin credentials required.'
            });
        }

        // Check if account is active
        if (user.status !== 'active') {
            return res.status(403).json({
                success: false,
                message: 'Account is inactive or suspended'
            });
        }

        // Generate and store OTP
        const otp = await otpService.createOTP(null, email);

        // Send OTP via Email
        try {
            await emailService.sendOTP(email, otp);
        } catch (mailError) {
            console.error('Email sending failed:', mailError);
        }

        res.status(200).json({
            success: true,
            message: 'OTP sent to admin email',
            ...(process.env.NODE_ENV === 'development' && { otp })
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Verify Admin OTP (Email ONLY)
exports.verifyAdminOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const allowedAdminEmail = 'mahadebmondal004@gmail.com';

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Admin Email is required'
            });
        }

        if (email.toLowerCase() !== allowedAdminEmail.toLowerCase()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied: Invalid Admin Email'
            });
        }

        // Verify OTP
        const verification = await otpService.verifyOTP(null, otp, email);

        if (!verification.success) {
            return res.status(400).json(verification);
        }

        // Find admin user
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user || user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access denied'
            });
        }

        if (user.status !== 'active') {
            return res.status(403).json({
                success: false,
                message: 'Account is inactive or suspended'
            });
        }

        // Generate tokens
        const accessToken = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        const refreshToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
        );

        res.status(200).json({
            success: true,
            message: 'Admin login successful',
            user: {
                _id: user._id,
                name: user.name,
                phone: user.phone,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage
            },
            accessToken,
            refreshToken
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Logout
exports.logout = async (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    });
};

// Firebase Phone OTP verify and login
exports.verifyFirebaseOTP = async (req, res) => {
    try {
        const { idToken, role = 'user', name } = req.body;

        if (!idToken) {
            return res.status(400).json({ success: false, message: 'idToken is required' });
        }

        // Check settings toggle
        const settings = await Setting.find({ key: { $in: ['firebase_phone_otp_enabled', 'firebase_phone_otp_user', 'firebase_phone_otp_therapist', 'firebase_phone_otp_admin'] } });
        const map = Object.fromEntries(settings.map(s => [s.key, s.value]));
        const enabled = map['firebase_phone_otp_enabled'] !== 'false';
        const roleAllowed = (role === 'user' && map['firebase_phone_otp_user'] !== 'false')
            || (role === 'therapist' && map['firebase_phone_otp_therapist'] !== 'false')
            || (role === 'admin' && map['firebase_phone_otp_admin'] !== 'false');
        if (!enabled || !roleAllowed) {
            return res.status(403).json({ success: false, message: 'Firebase OTP login disabled' });
        }

        // Verify Firebase ID token
        const decoded = await verifyIdToken(idToken);
        const phone = decoded.phone_number || decoded.phoneNumber || decoded.phone || null;
        if (!phone) {
            return res.status(400).json({ success: false, message: 'Phone number missing in token' });
        }

        // Normalize Indian format: keep last 10 digits
        const match = (phone.match(/[0-9]{10}$/) || [])[0];
        const normalizedPhone = match || phone.replace(/\D/g, '');

        // Find or create user
        let user = await User.findOne({ phone: normalizedPhone });
        if (!user) {
            user = await User.create({ name: name || 'User', phone: normalizedPhone, role, whatsappVerified: true, status: 'active' });
            try {
                await Register.create({ name: user.name, phone: user.phone, email: user.email || null, role: user.role, source: 'firebase', userId: user._id, metadata: { firebaseUid: decoded.user_id || null } });
            } catch { }
        } else {
            if (user.status !== 'active') {
                return res.status(403).json({ success: false, message: 'Account is inactive or suspended' });
            }
            if (role && user.role !== role) {
                user.role = role;
            }
            if (name && (!user.name || user.name === 'User')) user.name = name;
            user.whatsappVerified = true;
            await user.save();
        }

        // Issue tokens
        const accessToken = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
        const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN });

        res.status(200).json({
            success: true,
            message: 'Login successful',
            user: { _id: user._id, name: user.name, phone: user.phone, email: user.email, role: user.role, profileImage: user.profileImage },
            accessToken,
            refreshToken
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
