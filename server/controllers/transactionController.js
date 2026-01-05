const transactionService = require('../services/transactionService');
const Budget = require('../models/Budget');
const Notification = require('../models/Notification');
const sendEmail = require('../utils/sendEmail');
const User = require('../models/User');

// @desc    Get all transactions
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res) => {
    try {
        const { startDate, endDate, category } = req.query;
        const transactions = await transactionService.getAllTransactions(req.user.id, { startDate, endDate, category });

        res.status(200).json({
            count: transactions.length,
            data: transactions,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: 'Server Error',
        });
    }
};

// @desc    Add transaction
// @route   POST /api/transactions
// @access  Private
const addTransaction = async (req, res) => {
    try {
        req.body.user = req.user.id;
        const transactionData = {
            user: req.user.id,
            ...req.body
        };

        // Initialize nextRunDate if recurring
        if (req.body.isRecurring && req.body.recurrenceInterval) {
            let nextDate = new Date();
            const interval = req.body.recurrenceInterval.toLowerCase();

            if (interval === 'daily') {
                nextDate.setDate(nextDate.getDate() + 1);
            } else if (interval === 'weekly') {
                nextDate.setDate(nextDate.getDate() + 7);
            } else if (interval === 'monthly') {
                nextDate.setMonth(nextDate.getMonth() + 1);
            } else if (interval === 'yearly') {
                nextDate.setFullYear(nextDate.getFullYear() + 1);
            }
            transactionData.nextRunDate = nextDate;
        }

        const transaction = await transactionService.createTransaction(transactionData);

        // --- Budget Alert Logic ---
        if (req.body.type === 'expense') {
            const now = new Date();
            const currentMonth = now.getMonth() + 1;
            const currentYear = now.getFullYear();

            const budget = await Budget.findOne({ user: req.user.id, month: currentMonth, year: currentYear });

            if (budget) {
                // Calculate total expenses including this one
                const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
                const endOfMonth = new Date(currentYear, currentMonth, 0);

                // We need to query manually here or trust the service. 
                // Let's rely on a quick aggregate for speed/accuracy.
                // Or reutilize transactionService if it had a filtered sum method.
                // Doing manual find for now as it matches existing patterns in this project.
                const Transaction = require('../models/Transaction'); // Require locally if not top level to avoid circular issues, though top level is fine

                const expenses = await Transaction.find({
                    user: req.user.id,
                    type: 'expense',
                    date: { $gte: startOfMonth, $lte: endOfMonth }
                });

                const totalExpense = expenses.reduce((acc, t) => acc + t.amount, 0);
                const budgetAmount = budget.amount;
                const ratio = totalExpense / budgetAmount;

                // Check Thresholds
                let alertMessage = null;
                let alertType = 'general';

                // 100% Exceeded
                if (totalExpense > budgetAmount) {
                    // Check if we already notified for > 100% recently? 
                    // For simplicity, we alert every time they exceed it further (or we could check last notification)
                    alertMessage = `Alert: You have exceeded your monthly budget of ${budgetAmount}! Current: ${totalExpense}`;
                    alertType = 'budget_exceeded';
                }
                // 80% Warning (Only if they were below 80% before this tx, effectively crossing the line)
                else if (totalExpense >= budgetAmount * 0.8 && (totalExpense - req.body.amount) < budgetAmount * 0.8) {
                    alertMessage = `Warning: You have used ${Math.floor(ratio * 100)}% of your monthly budget.`;
                    alertType = 'budget_warning';
                }

                if (alertMessage) {
                    // Create Notification
                    await Notification.create({
                        user: req.user.id,
                        message: alertMessage,
                        type: alertType
                    });

                    // Send Email (Fire and forget, don't await blocking)
                    try {
                        const user = await User.findById(req.user.id);
                        if (user && user.email) {
                            sendEmail({
                                email: user.email,
                                subject: 'MoneyMate Budget Alert',
                                message: alertMessage
                            }).catch(err => console.error("Email send error:", err.message));
                        }
                    } catch (e) {
                        console.error("User fetch fail for email", e);
                    }
                }
            }
        }

        res.status(201).json({
            success: true,
            data: transaction,
        });
    } catch (err) {
        console.error('Error adding transaction:', err);
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map((val) => val.message);
            return res.status(400).json({
                success: false,
                error: messages,
            });
        }
        return res.status(500).json({
            success: false,
            error: 'Server Error',
        });
    }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res) => {
    try {
        const transaction = await transactionService.getTransactionById(req.params.id);

        if (!transaction) {
            return res.status(404).json({
                success: false,
                error: 'No transaction found',
            });
        }

        if (transaction.user.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                error: 'Not authorized',
            });
        }

        await transaction.deleteOne();

        res.status(200).json({
            success: true,
            data: {},
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: 'Server Error',
        });
    }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res) => {
    try {
        let transaction = await transactionService.getTransactionById(req.params.id);

        if (!transaction) {
            return res.status(404).json({
                success: false,
                error: 'No transaction found',
            });
        }

        if (transaction.user.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                error: 'Not authorized',
            });
        }

        transaction = await transactionService.updateTransaction(req.params.id, req.body);

        res.status(200).json({
            success: true,
            data: transaction,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: 'Server Error',
        });
    }
};

module.exports = {
    getTransactions,
    addTransaction,
    deleteTransaction,
    updateTransaction,
};
