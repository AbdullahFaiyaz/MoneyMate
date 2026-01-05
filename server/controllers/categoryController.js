const Category = require('../models/Category');
const Transaction = require('../models/Transaction');

// @desc    Get all categories for user
// @route   GET /api/categories
// @access  Private
const getCategories = async (req, res) => {
    try {
        const categories = await Category.find({ user: req.user.id }).sort({ name: 1 });
        res.status(200).json({
            success: true,
            count: categories.length,
            data: categories,
        });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Add new category
// @route   POST /api/categories
// @access  Private
const addCategory = async (req, res) => {
    try {
        const { name, type, color } = req.body;

        const category = await Category.create({
            user: req.user.id,
            name,
            type,
            color
        });

        res.status(201).json({
            success: true,
            data: category,
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ success: false, error: 'Category already exists' });
        }
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ success: false, error: messages });
        }
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Rename category
// @route   PUT /api/categories/:id
// @access  Private
const updateCategory = async (req, res) => {
    try {
        const { name, type, color } = req.body;
        let category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ success: false, error: 'Category not found' });
        }

        if (category.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: 'Not authorized' });
        }

        const oldName = category.name;

        category = await Category.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        // Update all associated transactions
        if (name && name !== oldName) {
            await Transaction.updateMany(
                { user: req.user.id, category: oldName },
                { category: name }
            );
        }

        res.status(200).json({
            success: true,
            data: category,
        });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private
const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ success: false, error: 'Category not found' });
        }

        if (category.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: 'Not authorized' });
        }

        const categoryName = category.name;

        await category.deleteOne();

        // Move transactions to General
        await Transaction.updateMany(
            { user: req.user.id, category: categoryName },
            { category: 'General' }
        );

        res.status(200).json({
            success: true,
            data: {},
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

module.exports = {
    getCategories,
    addCategory,
    updateCategory,
    deleteCategory,
};
