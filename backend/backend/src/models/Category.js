const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    image: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    displayOrder: {
        type: Number,
        default: 0
    }
}, { timestamps: true })

categorySchema.index({ status: 1, displayOrder: 1 })

module.exports = mongoose.model('Category', categorySchema)
