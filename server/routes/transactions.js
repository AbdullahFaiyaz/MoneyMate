const express = require('express');
const router = express.Router();
const {
    getTransactions,
    addTransaction,
    deleteTransaction,
    updateTransaction,
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getTransactions).post(protect, addTransaction);
router
    .route('/:id')
    .delete(protect, deleteTransaction)
    .put(protect, updateTransaction);

// Recurring Support Logic could be added here or in a separate scheduler
// For FR-5: "Users shall be able to view recurring transactions automatically added monthly."
// Ideally, a background job (cron) runs daily to check recurring transactions and 'instantiate' them if due.
// For now, we will store them as isRecurring=true. The frontend can just filter/show them.
// Actual instantiation requires a cron job or a specialized check on login.

module.exports = router;
