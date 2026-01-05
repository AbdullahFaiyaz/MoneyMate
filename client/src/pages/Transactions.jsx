import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { useCurrency } from '../context/CurrencyContext';
import CurrencySelector from '../components/CurrencySelector';
import CategoryManager from '../components/CategoryManager';
import ReportModal from '../components/ReportModal';

const Transactions = () => {
    const { user } = useContext(AuthContext);
    const { currency, convert, formatAmount, convertAmount } = useCurrency();
    const [transactions, setTransactions] = useState([]);
    const [text, setText] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('expense');
    const [category, setCategory] = useState('');
    const [notes, setNotes] = useState('');
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurrenceInterval, setRecurrenceInterval] = useState('monthly');
    const [loading, setLoading] = useState(true);
    const [editId, setEditId] = useState(null);
    const [showCategoryManager, setShowCategoryManager] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [savedCategories, setSavedCategories] = useState([]);

    // Split Expense State
    const [isSplitExpense, setIsSplitExpense] = useState(false);
    const [numberOfPeople, setNumberOfPeople] = useState(2);
    const [totalAmount, setTotalAmount] = useState('');

    // Filter State
    const [filterCategory, setFilterCategory] = useState('All');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');

    useEffect(() => {
        fetchTransactions();
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await axios.get('/api/categories');
            setSavedCategories(res.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchTransactions = async () => {
        try {
            const params = {};
            if (filterCategory !== 'All') params.category = filterCategory;
            if (filterStartDate) params.startDate = filterStartDate;
            if (filterEndDate) params.endDate = filterEndDate;

            const res = await axios.get('/api/transactions', { params });
            setTransactions(res.data.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleApplyFilters = (e) => {
        e.preventDefault();
        fetchTransactions();
    };

    const handleClearFilters = () => {
        setFilterCategory('All');
        setFilterStartDate('');
        setFilterEndDate('');
        // Trigger fetch directly or let useEffect handle it if we add deps? 
        // Better to trigger explicit fetch to avoid double mounting issues
        // We'll just call fetch with empty params manually for immediate feedback
        axios.get('/api/transactions').then(res => setTransactions(res.data.data));
    };

    const handleEdit = (transaction) => {
        setEditId(transaction._id);
        setText(transaction.text);
        // transaction.amount is stored in USD (or base currency), convert to current view currency for editing
        setAmount(convert(transaction.amount));
        setType(transaction.type);
        setCategory(transaction.category);
        setNotes(transaction.notes || '');
        setIsRecurring(transaction.isRecurring || false);
        setRecurrenceInterval(transaction.recurrenceInterval || 'monthly');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditId(null);
        setText('');
        setAmount('');
        setCategory('');
        setNotes('');
        setIsRecurring(false);
        setRecurrenceInterval('monthly');
        setType('expense');
        setIsSplitExpense(false);
        setNumberOfPeople(2);
        setTotalAmount('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Calculate the actual amount to save (split if needed)
            let finalAmount = parseFloat(amount);
            if (isSplitExpense && type === 'expense') {
                finalAmount = parseFloat(totalAmount) / numberOfPeople;
            }
            const amountInUSD = convertAmount(finalAmount, currency, 'USD');
            // Add split info to notes if applicable
            let finalNotes = notes;
            if (isSplitExpense && type === 'expense') {
                const splitInfo = `Split expense (1/${numberOfPeople} of ${formatAmount(convertAmount(parseFloat(totalAmount), currency, 'USD'))})`;
                finalNotes = notes ? `${notes} | ${splitInfo}` : splitInfo;
            }

            const transactionData = {
                text,
                amount: amountInUSD,
                type,
                category: category || 'General',
                notes: finalNotes,
                isRecurring,
                recurrenceInterval: isRecurring ? recurrenceInterval : null
            };

            if (editId) {
                const res = await axios.put(`/api/transactions/${editId}`, transactionData);
                setTransactions(transactions.map(t => t._id === editId ? res.data.data : t));
                cancelEdit(); // Reset form/mode
            } else {
                const res = await axios.post('/api/transactions', transactionData);
                setTransactions([res.data.data, ...transactions]);
                setText('');
                setAmount('');
                setCategory('');
                setNotes('');
                setIsRecurring(false);
                setRecurrenceInterval('monthly');
                setIsSplitExpense(false);
                setNumberOfPeople(2);
                setTotalAmount('');
            }
        } catch (err) {
            console.error(err);
            alert(editId ? 'Error updating transaction' : 'Error adding transaction');
        }
    };

    const deleteTransaction = async (id) => {
        if (!window.confirm('Are you sure you want to delete this?')) return;
        try {
            await axios.delete(`/api/transactions/${id}`);
            setTransactions(transactions.filter(t => t._id !== id));
            if (editId === id) cancelEdit();
        } catch (err) {
            console.error(err);
        }
    };

    const exportCSV = () => {
        const headers = ['Date', 'Description', 'Type', 'Category', `Amount (${currency})`];
        const csvContent = [
            headers.join(','),
            ...transactions.map(t => [
                new Date(t.date).toLocaleDateString(),
                `"${t.text}"`,
                t.type,
                t.category,
                convert(t.amount).toFixed(2)
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'moneymate_transactions.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const defaultCategories = ['Food', 'Rent', 'Utilities', 'Entertainment', 'Salary', 'Groceries', 'Transport'];
    const allCategories = [...new Set([...defaultCategories, ...savedCategories.map(c => c.name)])];

    return (
        <div className="container" style={{ padding: 0 }}>
            {showCategoryManager && (
                <CategoryManager
                    onClose={() => setShowCategoryManager(false)}
                    onUpdate={() => { fetchCategories(); fetchTransactions(); }}
                />
            )}
            {showReportModal && (
                <ReportModal onClose={() => setShowReportModal(false)} />
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div></div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <CurrencySelector />
                    <button onClick={() => setShowReportModal(true)} className="btn-primary" style={{ padding: '0.5rem 1rem', background: 'var(--secondary-color)' }}>Reports</button>
                    <button onClick={exportCSV} className="btn-primary" style={{ padding: '0.5rem 1rem' }}>Export All</button>
                </div>
            </div>
            <h2>Transactions</h2>

            <div className="card animate-fade-in" style={{ padding: '2.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.5rem', border: 'none' }}>
                        {editId ? 'Edit Transaction' : 'Add New Transaction'}
                    </h3>
                    <div className="badge" style={{ background: 'var(--primary-glow)', color: 'white', padding: '0.5rem 1rem' }}>
                        Input Currency: <strong>{currency}</strong>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="form-row">
                    <div className="form-group" style={{ flex: '1 1 300px' }}>
                        <label>Description</label>
                        <input
                            type="text"
                            placeholder="What did you spend on?"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group" style={{ flex: '1 1 150px' }}>
                        <label>Amount ({currency})</label>
                        <input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                        />
                        {amount && currency !== 'USD' && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                                ≈ {formatAmount(convertAmount(parseFloat(amount), currency, 'USD'), 'USD')}
                            </div>
                        )}
                    </div>
                    <div className="form-group" style={{ flex: '1 1 150px' }}>
                        <label>Type</label>
                        <select value={type} onChange={(e) => setType(e.target.value)}>
                            <option value="expense">Expense</option>
                            <option value="income">Income</option>
                            <option value="goal">Goal</option>
                        </select>
                    </div>
                    <div className="form-group" style={{ flex: '1 1 150px' }}>
                        <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                            Category
                            <button
                                type="button"
                                onClick={() => setShowCategoryManager(true)}
                                style={{ fontSize: '0.7rem', background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', textDecoration: 'underline' }}
                            >
                                Manage
                            </button>
                        </label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option value="">Select Category...</option>
                            {allCategories.map((cat, idx) => (
                                <option key={idx} value={cat}>{cat}</option>
                            ))}
                            <option value="General">General</option>
                        </select>
                    </div>
                    <div className="form-group" style={{ flex: '1 1 100%' }}>
                        <label>Notes (Optional)</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add details (e.g., 'Who was with me?', 'Why?')"
                            rows="2"
                            style={{
                                width: '100%',
                                padding: '0.875rem 1rem',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                color: 'var(--text-primary)',
                                borderRadius: 'var(--radius-md)',
                                resize: 'vertical'
                            }}
                        ></textarea>
                    </div>
                    <div style={{ flex: '1 1 100%', display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.02)', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input
                                type="checkbox"
                                id="recurring"
                                checked={isRecurring}
                                onChange={(e) => setIsRecurring(e.target.checked)}
                                style={{ width: 'auto', margin: 0 }}
                            />
                            <label htmlFor="recurring" style={{ margin: 0, cursor: 'pointer' }}>Recurring?</label>
                        </div>
                        {isRecurring && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <label style={{ margin: 0 }}>Every:</label>
                                <select
                                    value={recurrenceInterval}
                                    onChange={(e) => setRecurrenceInterval(e.target.value)}
                                    style={{ padding: '0.5rem', background: 'var(--bg-primary)', border: '1px solid #444' }}
                                >
                                    <option value="daily">Day</option>
                                    <option value="weekly">Week</option>
                                    <option value="monthly">Month</option>
                                    <option value="yearly">Year</option>
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Split Expense Section - Only for expenses */}
                    {type === 'expense' && !editId && (
                        <div style={{ flex: '1 1 100%', background: 'rgba(99, 102, 241, 0.05)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary-glow)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: isSplitExpense ? '1rem' : '0' }}>
                                <input
                                    type="checkbox"
                                    id="splitExpense"
                                    checked={isSplitExpense}
                                    onChange={(e) => {
                                        setIsSplitExpense(e.target.checked);
                                        if (!e.target.checked) {
                                            setTotalAmount('');
                                            setNumberOfPeople(2);
                                        }
                                    }}
                                    style={{ width: 'auto', margin: 0 }}
                                />
                                <label htmlFor="splitExpense" style={{ margin: 0, cursor: 'pointer', fontWeight: '600' }}>
                                    💰 Split with Friends
                                </label>
                            </div>

                            {isSplitExpense && (
                                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                                    <div style={{ flex: '1 1 200px' }}>
                                        <label style={{ fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>Total Amount ({currency})</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="100.00"
                                            value={totalAmount}
                                            onChange={(e) => setTotalAmount(e.target.value)}
                                            required={isSplitExpense}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                background: 'rgba(255, 255, 255, 0.1)',
                                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                                borderRadius: 'var(--radius-md)',
                                                color: 'var(--text-primary)'
                                            }}
                                        />
                                    </div>
                                    <div style={{ flex: '1 1 150px' }}>
                                        <label style={{ fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>Number of People</label>
                                        <input
                                            type="number"
                                            min="2"
                                            placeholder="2"
                                            value={numberOfPeople}
                                            onChange={(e) => setNumberOfPeople(parseInt(e.target.value) || 2)}
                                            required={isSplitExpense}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                background: 'rgba(255, 255, 255, 0.1)',
                                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                                borderRadius: 'var(--radius-md)',
                                                color: 'var(--text-primary)'
                                            }}
                                        />
                                    </div>
                                    {totalAmount && numberOfPeople >= 2 && (
                                        <div style={{ flex: '1 1 100%', padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid var(--success)' }}>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Split Calculation:</div>
                                            <div style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--success)', marginTop: '0.25rem' }}>
                                                Total: {formatAmount(parseFloat(totalAmount))} | Your share: {formatAmount(parseFloat(totalAmount) / numberOfPeople)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    <div style={{ flex: '1 1 100%', marginTop: '2.5rem', display: 'flex', gap: '1rem' }}>
                        <button type="submit" className="btn-primary" style={{ flex: 1, padding: '1rem', fontWeight: '700', letterSpacing: '1px' }}>
                            {editId ? 'Update Transaction' : 'Add Transaction'}
                        </button>
                        {editId && (
                            <button
                                type="button"
                                onClick={cancelEdit}
                                style={{
                                    padding: '1rem',
                                    background: 'var(--text-secondary)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 'var(--radius-md)',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div >

            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h3>History</h3>
                    <form onSubmit={handleApplyFilters} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #444', background: '#222', color: 'white' }}
                        >
                            <option value="All">All Categories</option>
                            {allCategories.map((cat, idx) => (
                                <option key={idx} value={cat}>{cat}</option>
                            ))}
                        </select>
                        <input
                            type="date"
                            value={filterStartDate}
                            onChange={(e) => setFilterStartDate(e.target.value)}
                            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #444', background: '#222', color: 'white' }}
                        />
                        <span style={{ color: '#aaa' }}>-</span>
                        <input
                            type="date"
                            value={filterEndDate}
                            onChange={(e) => setFilterEndDate(e.target.value)}
                            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #444', background: '#222', color: 'white' }}
                        />
                        <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Apply</button>
                        <button type="button" onClick={handleClearFilters} style={{ background: 'none', border: '1px solid #555', color: '#ccc', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Clear</button>
                    </form>
                </div>
                {loading ? <p>Loading...</p> : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {transactions.map(t => (
                            <div key={t._id} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '1.25rem',
                                background: 'rgba(255,255,255,0.03)',
                                borderRadius: 'var(--radius-md)',
                                border: editId === t._id ? '1px solid var(--primary-color)' : '1px solid rgba(255,255,255,0.05)',
                                transition: 'all 0.2s'
                            }}>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{t.text}</h4>
                                    {t.notes && (
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem', fontStyle: 'italic' }}>
                                            "{t.notes}"
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                                        <span className="badge" style={{ fontSize: '0.7rem', opacity: 0.8 }}>{t.category}</span>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(t.date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                    <span style={{
                                        color: t.type === 'income' ? 'var(--secondary-color)' : 'var(--danger)',
                                        fontSize: '1.25rem',
                                        fontWeight: '700',
                                        textShadow: t.type === 'income' ? '0 0 10px var(--secondary-glow)' : 'none'
                                    }}>
                                        {t.type === 'income' ? '+' : '-'}{formatAmount(convert(t.amount))}
                                    </span>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => handleEdit(t)}
                                            style={{
                                                background: 'rgba(99, 102, 241, 0.1)',
                                                color: 'var(--primary-color)',
                                                padding: '0.5rem',
                                                borderRadius: '50%',
                                                width: '32px',
                                                height: '32px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'all 0.2s',
                                                border: 'none',
                                                cursor: 'pointer'
                                            }}
                                            title="Edit Transaction"
                                        >
                                            ✎
                                        </button>
                                        <button
                                            onClick={() => deleteTransaction(t._id)}
                                            className="btn-danger-small"
                                            style={{
                                                background: 'rgba(239, 68, 68, 0.1)',
                                                color: 'var(--danger)',
                                                padding: '0.5rem',
                                                borderRadius: '50%',
                                                width: '32px',
                                                height: '32px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'all 0.2s',
                                                border: 'none',
                                                cursor: 'pointer'
                                            }}
                                            title="Delete Transaction"
                                        >
                                            &times;
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div >
    );
};

export default Transactions;
