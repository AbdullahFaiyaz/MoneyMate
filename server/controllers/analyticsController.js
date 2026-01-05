const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');

// @desc    Get spending insights
// @route   GET /api/analytics
// @access  Private
const getAnalytics = async (req, res) => {
    try {
        const userId = req.user.id;
        const now = new Date();
        const currentMonth = now.getMonth(); // 0-indexed
        const currentYear = now.getFullYear();

        // 1. Get Current Month Transactions
        const startCurrent = new Date(currentYear, currentMonth, 1);
        const endCurrent = new Date(currentYear, currentMonth + 1, 0);

        const currentTxns = await Transaction.find({
            user: userId,
            type: 'expense',
            date: { $gte: startCurrent, $lte: endCurrent }
        });

        const currentTotal = currentTxns.reduce((acc, t) => acc + t.amount, 0);

        // 2. Get Previous Month Transactions
        const startPrev = new Date(currentYear, currentMonth - 1, 1);
        const endPrev = new Date(currentYear, currentMonth, 0);

        const prevTxns = await Transaction.find({
            user: userId,
            type: 'expense',
            date: { $gte: startPrev, $lte: endPrev }
        });

        const prevTotal = prevTxns.reduce((acc, t) => acc + t.amount, 0);

        // 3. Calculate Percentage Change
        let percentageChange = 0;
        let changeDirection = 'stable';

        if (prevTotal > 0) {
            percentageChange = ((currentTotal - prevTotal) / prevTotal) * 100;
            changeDirection = percentageChange > 0 ? 'increased' : 'decreased';
        } else if (currentTotal > 0) {
            percentageChange = 100; // From 0 to something is technically infinite increase, treat as 100% new spending
            changeDirection = 'increased';
        }

        // 4. Top Spending Category
        const categoryMap = {};
        currentTxns.forEach(t => {
            if (!categoryMap[t.category]) categoryMap[t.category] = 0;
            categoryMap[t.category] += t.amount;
        });

        let topCategory = null;
        let topCategoryAmount = 0;
        let topCategoryPercent = 0;

        for (const [cat, amount] of Object.entries(categoryMap)) {
            if (amount > topCategoryAmount) {
                topCategoryAmount = amount;
                topCategory = cat;
            }
        }

        if (currentTotal > 0) {
            topCategoryPercent = Math.round((topCategoryAmount / currentTotal) * 100);
        }

        // 5. Budget Check
        // Note: Budget model uses 1-12 for months
        const budget = await Budget.findOne({
            user: userId,
            month: currentMonth + 1,
            year: currentYear
        });

        let budgetInsight = null;
        if (budget) {
            if (currentTotal > budget.amount) {
                budgetInsight = {
                    status: 'exceeded',
                    diff: currentTotal - budget.amount
                };
            } else if (currentTotal > (budget.amount * 0.9)) {
                budgetInsight = {
                    status: 'close',
                    remaining: budget.amount - currentTotal
                };
            }
        }

        const insights = {
            comparison: {
                currentTotal,
                prevTotal,
                percentageChange: Math.abs(Math.round(percentageChange)),
                direction: changeDirection
            },
            topCategory: topCategory ? {
                name: topCategory,
                percent: topCategoryPercent
            } : null,
            budget: budgetInsight
        };

        res.status(200).json({ success: true, data: insights });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

module.exports = {
    getAnalytics
};
