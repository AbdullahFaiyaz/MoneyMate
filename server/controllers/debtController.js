const Debt = require('../models/Debt');

// @desc    Get all debts
// @route   GET /api/debts
// @access  Private
const getDebts = async (req, res) => {
    try {
        const debts = await Debt.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: debts });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Add debt
// @route   POST /api/debts
// @access  Private
const addDebt = async (req, res) => {
    try {
        const { description, amount, type, dueDate } = req.body;

        const debt = await Debt.create({
            user: req.user.id,
            description,
            amount,
            type,
            dueDate,
        });

        res.status(201).json({ success: true, data: debt });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Add repayment to debt
// @route   POST /api/debts/:id/repayment
// @access  Private
const addRepayment = async (req, res) => {
    try {
        const debt = await Debt.findById(req.params.id);

        if (!debt) {
            return res.status(404).json({ success: false, error: 'Debt not found' });
        }

        if (debt.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: 'Not authorized' });
        }

        const { amount, note } = req.body;

        debt.repayments.push({
            amount: parseFloat(amount),
            note: note || '',
            date: new Date(),
        });

        await debt.save();

        res.status(200).json({ success: true, data: debt });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Update debt
// @route   PUT /api/debts/:id
// @access  Private
const updateDebt = async (req, res) => {
    try {
        let debt = await Debt.findById(req.params.id);

        if (!debt) {
            return res.status(404).json({ success: false, error: 'Debt not found' });
        }

        if (debt.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: 'Not authorized' });
        }

        debt = await Debt.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({ success: true, data: debt });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Delete debt
// @route   DELETE /api/debts/:id
// @access  Private
const deleteDebt = async (req, res) => {
    try {
        const debt = await Debt.findById(req.params.id);

        if (!debt) {
            return res.status(404).json({ success: false, error: 'Debt not found' });
        }

        if (debt.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: 'Not authorized' });
        }

        await debt.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

module.exports = {
    getDebts,
    addDebt,
    addRepayment,
    updateDebt,
    deleteDebt,
};
