const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: [true, 'Please add a category name'],
        trim: true,
    },
    type: {
        type: String,
        enum: ['income', 'expense'],
        default: 'expense',
    },
    color: {
        type: String, // e.g., hex code
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Ensure unique category names per user
CategorySchema.index({ user: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Category', CategorySchema);
