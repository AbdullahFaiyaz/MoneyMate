import { useState, useEffect, useContext } from 'react';
import transactionService from '../services/transactionService';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const useDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Calculate current month range
                const date = new Date();
                const startDate = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
                const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString();

                const transData = await transactionService.getTransactions({ startDate, endDate });
                setTransactions(transData.data);


            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((acc, curr) => acc + curr.amount, 0);

    const totalExpense = transactions
        .filter(t => t.type !== 'income')
        .reduce((acc, curr) => acc + curr.amount, 0);

    const balance = totalIncome - totalExpense;

    return {
        user,
        transactions,

        loading,
        totalIncome,
        totalExpense,
        balance,
        logout,
    };
};

export default useDashboard;
