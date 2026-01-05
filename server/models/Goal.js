const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    targetAmount: {
        type: Number,
        required: true,
    },
    currentAmount: {
        type: Number,
        default: 0,
    },
    deadline: {
        type: Date,
    },
    status: {
        type: String,
        enum: ['In Progress', 'Achieved'],
        default: 'In Progress',
    },
});

module.exports = mongoose.model('Goal', GoalSchema);
