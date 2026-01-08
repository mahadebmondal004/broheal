const Setting = require('../models/Setting');
const Service = require('../models/Service');
const Review = require('../models/Review');
let Category;
try { Category = require('../models/Category'); } catch {}

// Get public settings (no auth required)
exports.getPublicSettings = async (req, res) => {
    try {
        const settings = await Setting.find({
            isPublic: true
        }).select('key value type');

        res.status(200).json({
            success: true,
            settings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getPublicServices = async (req, res) => {
    try {
        const { category, search } = req.query;
        const filter = { status: 'active' };
        if (category) filter.category = category;
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        const services = await Service.find(filter).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: services.length,
            services
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get recent public reviews and aggregate rating
exports.getPublicReviews = async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit || '12', 10), 50);

        const reviews = await Review.find({})
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('userId', 'name')
            .populate('therapistId', 'name')
            .lean();

        const mapped = reviews.map(r => ({
            id: String(r._id),
            rating: r.rating,
            text: r.review,
            userName: r.userId?.name || 'User',
            therapistName: r.therapistId?.name || 'Therapist',
            createdAt: r.createdAt
        }));

        const agg = await Review.aggregate([
            { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }
        ]);

        const avgRating = agg[0]?.avg ? Math.round(agg[0].avg * 10) / 10 : 0;
        const total = agg[0]?.count || 0;

        res.status(200).json({ success: true, reviews: mapped, avgRating, total });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Public categories (active only)
exports.getPublicCategories = async (req, res) => {
    try {
        if (!Category) {
            return res.status(200).json({ success: true, count: 0, categories: [] })
        }
        const categories = await Category.find({ status: 'active' }).sort({ displayOrder: 1, name: 1 })
        res.status(200).json({ success: true, count: categories.length, categories })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}
