const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { otpLimiter, loginLimiter } = require('../middleware/rateLimiter');
const validateRequest = require('../middleware/validator');

// Strict Indian mobile validation for general users: starts 6-9, 10 digits, not all digits same
const isValidIndianMobile = (v) => /^[6-9]\d{9}$/.test(v) && !/(\d)\1{9}/.test(v);
// Admin mobile validation: starts 6-9, 10 digits (allows repeated digits to support test numbers)
const isValidAdminMobile = (v) => /^[6-9]\d{9}$/.test(v);

// Send OTP
router.post('/send-otp',
    otpLimiter,
    [
        body('phone').custom(isValidIndianMobile).withMessage('Please provide a valid 10-digit mobile number')
    ],
    validateRequest,
    authController.sendOTP
);

// Verify OTP
router.post('/verify-otp',
    [
        body('phone').custom(isValidIndianMobile).withMessage('Please provide a valid 10-digit mobile number'),
        body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
        body('name').optional().trim().notEmpty(),
        body('role').optional().isIn(['user', 'therapist']).withMessage('Invalid role')
    ],
    validateRequest,
    authController.verifyOTP
);

// Firebase phone auth verify (user/therapist)
router.post('/firebase/verify',
    [
        body('idToken').notEmpty().withMessage('idToken is required'),
        body('role').optional().isIn(['user', 'therapist']).withMessage('Invalid role')
    ],
    validateRequest,
    authController.verifyFirebaseOTP
);

// Login with password
router.post('/login',
    loginLimiter,
    [
        body('phone').custom(isValidIndianMobile).withMessage('Please provide a valid 10-digit mobile number'),
        body('password').notEmpty().withMessage('Password is required')
    ],
    validateRequest,
    authController.login
);

router.post('/register',
    [
        body('name').trim().notEmpty().withMessage('Name is required'),
        body('phone').custom(isValidIndianMobile).withMessage('Please provide a valid 10-digit mobile number'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
        body('email').optional().isEmail().withMessage('Please provide a valid email'),
        body('role').optional().isIn(['user', 'therapist']).withMessage('Invalid role')
    ],
    validateRequest,
    authController.register
);

// Explicit user registration
router.post('/register/user',
    [
        body('name').trim().notEmpty().withMessage('Name is required'),
        body('phone').custom(isValidIndianMobile).withMessage('Please provide a valid 10-digit mobile number'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
        body('email').optional().isEmail().withMessage('Please provide a valid email')
    ],
    validateRequest,
    (req, res, next) => { req.body.role = 'user'; next(); },
    authController.register
);

// Explicit therapist registration
router.post('/register/therapist',
    [
        body('name').trim().notEmpty().withMessage('Name is required'),
        body('phone').custom(isValidIndianMobile).withMessage('Please provide a valid 10-digit mobile number'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
        body('email').optional().isEmail().withMessage('Please provide a valid email')
    ],
    validateRequest,
    (req, res, next) => { req.body.role = 'therapist'; next(); },
    authController.register
);

// Explicit admin registration (secured)
router.post('/register/admin',
    [
        body('name').trim().notEmpty().withMessage('Name is required'),
        body('phone').custom(isValidAdminMobile).withMessage('Please provide a valid 10-digit mobile number'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
        body('email').optional().isEmail().withMessage('Please provide a valid email'),
        body('adminSecret').optional().isString()
    ],
    validateRequest,
    (req, res, next) => { req.body.role = 'admin'; next(); },
    authController.register
);

// Refresh token
router.post('/refresh-token',
    [
        body('refreshToken').notEmpty().withMessage('Refresh token is required')
    ],
    validateRequest,
    authController.refreshToken
);

// Admin OTP routes
router.post('/admin/send-otp',
    [
        body('email').optional().isEmail().withMessage('Please provide a valid email'),
        body('phone').optional().custom(isValidAdminMobile).withMessage('Please provide a valid 10-digit mobile number')
    ],
    validateRequest,
    authController.sendAdminOTP
);

router.post('/admin/verify-otp',
    [
        body('email').optional().isEmail().withMessage('Please provide a valid email'),
        body('phone').optional().custom(isValidAdminMobile).withMessage('Please provide a valid 10-digit mobile number'),
        body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
    ],
    validateRequest,
    authController.verifyAdminOTP
);

// Admin firebase phone verify
router.post('/admin/firebase/verify',
    [body('idToken').notEmpty().withMessage('idToken is required')],
    validateRequest,
    (req, res, next) => { req.body.role = 'admin'; next(); },
    authController.verifyFirebaseOTP
);

// Logout
router.post('/logout', authController.logout);

module.exports = router;
