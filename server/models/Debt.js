const mongoose = require('mongoose');

const DebtSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
    },
    amount: {
        type: Number,
        required: [true, 'Please add an amount'],
    },
    type: {
        type: String,
        enum: ['owed', 'owing'], // owed = money you owe, owing = money owed to you
        required: true,
    },
    dueDate: {
        type: Date,
        required: false,
    },
    repayments: [
        {
            amount: {
                type: Number,
                required: true,
            },
            date: {
                type: Date,
                default: Date.now,
            },
            note: String,
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Virtual field for remaining balance
DebtSchema.virtual('remainingBalance').get(function () {
    const totalRepaid = this.repayments.reduce((sum, repayment) => sum + repayment.amount, 0);
    return this.amount - totalRepaid;
});

// Ensure virtuals are included in JSON
DebtSchema.set('toJSON', { virtuals: true });
DebtSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Debt', DebtSchema);
