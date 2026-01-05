const Transaction = require('../models/Transaction');

const getAllTransactions = async (userId, filters = {}) => {
    const query = { user: userId };

    if (filters.startDate || filters.endDate) {
        query.date = {};
        if (filters.startDate) query.date.$gte = new Date(filters.startDate);
        if (filters.endDate) query.date.$lte = new Date(filters.endDate);
    }

    if (filters.category && filters.category !== 'All') {
        query.category = filters.category;
    }

    return await Transaction.find(query).sort({ date: -1 });
};

const createTransaction = async (transactionData) => {
    return await Transaction.create(transactionData);
};

const getTransactionById = async (id) => {
    return await Transaction.findById(id);
};

const updateTransaction = async (id, transactionData) => {
    return await Transaction.findByIdAndUpdate(id, transactionData, {
        new: true,
        runValidators: true,
    });
};

const deleteTransaction = async (id) => {
    return await Transaction.findByIdAndDelete(id);
};

module.exports = {
    getAllTransactions,
    createTransaction,
    getTransactionById,
    updateTransaction,
    deleteTransaction,
};
