const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

router.get('/settings', publicController.getPublicSettings);
router.get('/services', publicController.getPublicServices);
router.get('/reviews', publicController.getPublicReviews);
router.get('/categories', publicController.getPublicCategories);

module.exports = router;
