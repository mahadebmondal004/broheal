const mongoose = require('mongoose');

const registerSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, index: true },
    email: { type: String, trim: true, lowercase: true, default: null },
    role: { type: String, enum: ['user', 'therapist', 'admin'], default: 'user', required: true },
    source: { type: String, enum: ['password', 'otp', 'firebase'], default: 'password' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

registerSchema.index({ phone: 1, role: 1, createdAt: -1 });

module.exports = mongoose.model('Register', registerSchema);
