const express = require('express');
const router = express.Router();
const { getPlants, getPlantData, addOrUpdatePlantData } = require('../controllers/dataController');
const { protect, admin } = require('../middleware/authMiddleware');

// @route GET /api/data/plants - Get all plant names
router.get('/plants', protect, getPlants);

// @route GET /api/data/:plantId/:year - Get data for a specific plant and year
router.get('/:plantId/:year', protect, getPlantData);

// @route POST /api/data - Add or update data for a plant
router.post('/', protect, admin, addOrUpdatePlantData);

module.exports = router;