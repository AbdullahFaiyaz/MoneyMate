const Budget = require('../models/Budget');

// @desc    Get budget for a specific month/year
// @route   GET /api/budget?month=1&year=2023
// @access  Private
const getBudget = async (req, res) => {
    try {
        const { month, year } = req.query;

        // Default to current date if not provided
        const currentDate = new Date();
        const qMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
        const qYear = year ? parseInt(year) : currentDate.getFullYear();

        const budget = await Budget.findOne({
            user: req.user.id,
            month: qMonth,
            year: qYear,
        });

        if (!budget) {
            return res.status(200).json({ data: null });
        }

        res.status(200).json({
            data: budget,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: 'Server Error',
        });
    }
};

// @desc    Set or Update budget
// @route   POST /api/budget
// @access  Private
const setBudget = async (req, res) => {
    try {
        const { amount, month, year } = req.body;

        // Check if budget exists
        let budget = await Budget.findOne({
            user: req.user.id,
            month,
            year,
        });

        if (budget) {
            budget.amount = amount;
            await budget.save();
            return res.status(200).json({ data: budget });
        }

        budget = await Budget.create({
            user: req.user.id,
            amount,
            month,
            year,
        });

        res.status(201).json({
            data: budget,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            error: 'Server Error',
        });
    }
};

module.exports = {
    getBudget,
    setBudget,
};
