const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getDebts,
    addDebt,
    addRepayment,
    updateDebt,
    deleteDebt,
} = require('../controllers/debtController');

router.route('/').get(protect, getDebts).post(protect, addDebt);
router.post('/:id/repayment', protect, addRepayment);
router.route('/:id').put(protect, updateDebt).delete(protect, deleteDebt);

module.exports = router;
