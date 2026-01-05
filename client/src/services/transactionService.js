import axios from 'axios';

const API_URL = '/api/transactions';

const getTransactions = async (params) => {
    const response = await axios.get(API_URL, { params });
    return response.data;
};

const addTransaction = async (transactionData) => {
    const response = await axios.post(API_URL, transactionData);
    return response.data;
};

const deleteTransaction = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
};

const updateTransaction = async (id, transactionData) => {
    const response = await axios.put(`${API_URL}/${id}`, transactionData);
    return response.data;
};

const transactionService = {
    getTransactions,
    addTransaction,
    deleteTransaction,
    updateTransaction,
};

export default transactionService;
