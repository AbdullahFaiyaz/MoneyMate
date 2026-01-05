const express = require('express');
const router = express.Router();
const { getGamificationStats, checkMilestones } = require('../controllers/gamificationController');
const { protect } = require('../middleware/authMiddleware');

router.get('/stats', protect, getGamificationStats);
router.post('/check', protect, checkMilestones);

module.exports = router;
