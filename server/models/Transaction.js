const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    text: {
        type: String,
        required: [true, 'Please add a text description'],
    },
    amount: {
        type: Number,
        required: [true, 'Please add a positive or negative number'],
    },
    notes: {
        type: String,
        trim: true,
        maxlength: [500, 'Note can not be more than 500 characters']
    },
    type: {
        type: String,
        enum: ['income', 'expense'],
        required: true,
    },
    category: {
        type: String,
        required: true,
        default: 'General',
    },
    date: {
        type: Date,
        default: Date.now,
    },
    isRecurring: {
        type: Boolean,
        default: false,
    },
    recurrenceInterval: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'yearly'],
        required: function () {
            return this.isRecurring === true;
        }
    },
    nextRunDate: {
        type: Date
    }
});

module.exports = mongoose.model('Transaction', TransactionSchema);
