const User = require('../models/User');
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

// @desc    Get user gamification stats
// @route   GET /api/gamification/stats
// @access  Private
const getGamificationStats = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('savingsStreak badges');
        res.status(200).json({ data: user });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Check and update streaks (Simplified logic: Call this often, e.g., on dashboard load)
// @route   POST /api/gamification/check
// @access  Private
const checkMilestones = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const now = new Date();
        // Use current month index (0-11) + 1 for Budget model which likely uses 1-12
        let checkMonth = now.getMonth() + 1;
        let checkYear = now.getFullYear();

        // --- 1. Calculate Streak (Backwards from Current Month) ---
        let streak = 0;
        // We check up to 12 months back for performance
        for (let i = 0; i < 12; i++) {
            // Find budget for this specific month
            const budget = await Budget.findOne({
                user: req.user.id,
                month: checkMonth,
                year: checkYear
            });

            if (!budget) {
                // If no budget set for a month, streak breaks (or we could skip, but strict is better)
                break;
            }

            // Calculate total expenses for this month
            const startOfMonth = new Date(checkYear, checkMonth - 1, 1);
            const endOfMonth = new Date(checkYear, checkMonth, 0);

            const transactions = await Transaction.find({
                user: req.user.id,
                date: { $gte: startOfMonth, $lte: endOfMonth },
                type: 'expense'
            });

            const monthlyExpenses = transactions.reduce((acc, t) => acc + t.amount, 0);

            if (monthlyExpenses <= budget.amount) {
                streak++;
            } else {
                break; // Over budget breaks streak
            }

            // Move to previous month
            checkMonth--;
            if (checkMonth === 0) {
                checkMonth = 12;
                checkYear--;
            }
        }

        user.savingsStreak = streak;

        // --- 2. badge Logic ---
        const newBadges = [];
        const currentRefDate = new Date();
        const startOfCurrentMonth = new Date(currentRefDate.getFullYear(), currentRefDate.getMonth(), 1);
        const endOfCurrentMonth = new Date(currentRefDate.getFullYear(), currentRefDate.getMonth() + 1, 0);

        // Get current month totals
        const currentMonthTxns = await Transaction.find({
            user: req.user.id,
            date: { $gte: startOfCurrentMonth, $lte: endOfCurrentMonth }
        });

        const income = currentMonthTxns.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        const expense = currentMonthTxns.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

        // Badge: Good Saver (Income > Expenses)
        if (income > 0 && expense > 0 && income > expense) {
            if (!user.badges.find(b => b.name === 'Good Saver')) {
                const badge = { name: 'Good Saver', icon: '💰', dateEarned: new Date() };
                user.badges.push(badge);
                newBadges.push(badge);
            }
        }

        // Badge: Frugal Living (Expenses < 50% of Income)
        if (income > 0 && expense > 0 && expense < (income * 0.5)) {
            if (!user.badges.find(b => b.name === 'Frugal Living')) {
                const badge = { name: 'Frugal Living', icon: '🥗', dateEarned: new Date() };
                user.badges.push(badge);
                newBadges.push(badge);
            }
        }

        // Badge: Budget Master (Streak >= 3)
        if (streak >= 3) {
            if (!user.badges.find(b => b.name === 'Budget Master')) {
                const badge = { name: 'Budget Master', icon: '👑', dateEarned: new Date() };
                user.badges.push(badge);
                newBadges.push(badge);
            }
        }

        // Badge: Big Spender (Single Transaction > 500) - Just for fun
        const bigSpenderTxn = currentMonthTxns.find(t => t.type === 'expense' && t.amount > 500);
        if (bigSpenderTxn) {
            if (!user.badges.find(b => b.name === 'Big Spender')) {
                const badge = { name: 'Big Spender', icon: '💸', dateEarned: new Date() };
                user.badges.push(badge);
                newBadges.push(badge);
            }
        }

        await user.save();

        res.status(200).json({
            message: newBadges.length > 0 ? `New Badge(s) Earned: ${newBadges.map(b => b.name).join(', ')}` : 'Milestones checked',
            streak,
            newBadges
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

module.exports = {
    getGamificationStats,
    checkMilestones
};
