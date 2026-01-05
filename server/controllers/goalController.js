const Goal = require('../models/Goal');

// @desc    Get all goals
// @route   GET /api/goals
// @access  Private
const getGoals = async (req, res) => {
    try {
        const goals = await Goal.find({ user: req.user.id });

        res.status(200).json({
            data: goals,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: 'Server Error',
        });
    }
};

// @desc    Add goal
// @route   POST /api/goals
// @access  Private
const addGoal = async (req, res) => {
    try {
        const { name, targetAmount, deadline } = req.body;

        const goal = await Goal.create({
            user: req.user.id,
            name,
            targetAmount,
            deadline,
        });

        res.status(201).json({
            data: goal,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: 'Server Error',
        });
    }
};

// @desc    Update goal (e.g., add to currentAmount)
// @route   PUT /api/goals/:id
// @access  Private
const updateGoal = async (req, res) => {
    try {
        let goal = await Goal.findById(req.params.id);

        if (!goal) {
            return res.status(404).json({ success: false, error: 'Goal not found' });
        }

        if (goal.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: 'Not authorized' });
        }

        goal = await Goal.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({ data: goal });
    } catch (err) {
        return res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Delete goal
// @route   DELETE /api/goals/:id
// @access  Private
const deleteGoal = async (req, res) => {
    try {
        const goal = await Goal.findById(req.params.id);

        if (!goal) {
            return res.status(404).json({ success: false, error: 'Goal not found' });
        }

        // Check for user
        if (goal.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: 'Not authorized' });
        }

        await goal.deleteOne();

        res.status(200).json({ id: req.params.id });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: 'Server Error' });
    }
};

module.exports = {
    getGoals,
    addGoal,
    updateGoal,
    deleteGoal,
};
