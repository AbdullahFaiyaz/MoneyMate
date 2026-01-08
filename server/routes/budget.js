const express = require('express');
const router = express.Router();
const { getBudget, setBudget, updateBudget, deleteBudget } = require('../controllers/budgetController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getBudget).post(protect, setBudget);
router.route('/:id').put(protect, updateBudget).delete(protect, deleteBudget);

module.exports = router;
