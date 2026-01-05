import { useState, useEffect } from 'react';
import axios from 'axios';
import { useCurrency } from '../context/CurrencyContext';
import { MdAdd, MdDelete, MdEdit, MdPayment, MdClose } from 'react-icons/md';

const Debts = () => {
    const { formatAmount, convert } = useCurrency();
    const [debts, setDebts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form state
    const [showForm, setShowForm] = useState(false);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('owed');
    const [dueDate, setDueDate] = useState('');
    const [editId, setEditId] = useState(null);

    // Repayment state
    const [showRepaymentModal, setShowRepaymentModal] = useState(false);
    const [selectedDebt, setSelectedDebt] = useState(null);
    const [repaymentAmount, setRepaymentAmount] = useState('');
    const [repaymentNote, setRepaymentNote] = useState('');

    useEffect(() => {
        fetchDebts();
    }, []);

    const fetchDebts = async () => {
        try {
            const res = await axios.get('/api/debts');
            setDebts(res.data.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const debtData = { description, amount: parseFloat(amount), type, dueDate: dueDate || null };

            if (editId) {
                await axios.put(`/api/debts/${editId}`, debtData);
            } else {
                await axios.post('/api/debts', debtData);
            }

            fetchDebts();
            resetForm();
        } catch (err) {
            console.error(err);
            alert('Error saving debt');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this debt?')) return;
        try {
            await axios.delete(`/api/debts/${id}`);
            fetchDebts();
        } catch (err) {
            console.error(err);
        }
    };

    const handleEdit = (debt) => {
        setEditId(debt._id);
        setDescription(debt.description);
        setAmount(debt.amount);
        setType(debt.type);
        setDueDate(debt.dueDate ? new Date(debt.dueDate).toISOString().split('T')[0] : '');
        setShowForm(true);
    };

    const handleAddRepayment = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`/api/debts/${selectedDebt._id}/repayment`, {
                amount: parseFloat(repaymentAmount),
                note: repaymentNote
            });
            fetchDebts();
            setShowRepaymentModal(false);
            setRepaymentAmount('');
            setRepaymentNote('');
            setSelectedDebt(null);
        } catch (err) {
            console.error(err);
            alert('Error adding repayment');
        }
    };

    const resetForm = () => {
        setShowForm(false);
        setEditId(null);
        setDescription('');
        setAmount('');
        setType('owed');
        setDueDate('');
    };

    const owedDebts = debts.filter(d => d.type === 'owed');
    const owingDebts = debts.filter(d => d.type === 'owing');

    if (loading) return <div>Loading...</div>;

    return (
        <div className="container" style={{ padding: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>Debts & Loans</h2>
                <button onClick={() => setShowForm(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MdAdd /> Add Debt/Loan
                </button>
            </div>

            {/* Add/Edit Form */}
            {showForm && (
                <div className="card animate-fade-in" style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <h3>{editId ? 'Edit' : 'Add'} Debt/Loan</h3>
                        <button onClick={resetForm} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem' }}>
                            <MdClose />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="form-row">
                        <div className="form-group" style={{ flex: '1 1 300px' }}>
                            <label>Description</label>
                            <input
                                type="text"
                                placeholder="e.g., Rent advance, Friend loan"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group" style={{ flex: '1 1 150px' }}>
                            <label>Amount</label>
                            <input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group" style={{ flex: '1 1 150px' }}>
                            <label>Type</label>
                            <select value={type} onChange={(e) => setType(e.target.value)}>
                                <option value="owed">I Owe (Liability)</option>
                                <option value="owing">Owed to Me (Receivable)</option>
                            </select>
                        </div>
                        <div className="form-group" style={{ flex: '1 1 150px' }}>
                            <label>Due Date (Optional)</label>
                            <input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                            />
                        </div>
                        <div style={{ flex: '1 1 100%', display: 'flex', gap: '1rem' }}>
                            <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                                {editId ? 'Update' : 'Add'} Debt
                            </button>
                            {editId && (
                                <button type="button" onClick={resetForm} style={{ flex: 1, background: 'var(--text-secondary)' }}>
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            )}

            {/* Repayment Modal */}
            {showRepaymentModal && selectedDebt && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="card" style={{ width: '400px', maxWidth: '90%' }}>
                        <h3>Add Repayment</h3>
                        <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                            {selectedDebt.description} - Remaining: {formatAmount(selectedDebt.remainingBalance)}
                        </p>
                        <form onSubmit={handleAddRepayment}>
                            <div className="form-group">
                                <label>Repayment Amount</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={repaymentAmount}
                                    onChange={(e) => setRepaymentAmount(e.target.value)}
                                    max={selectedDebt.remainingBalance}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Note (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="Payment details"
                                    value={repaymentNote}
                                    onChange={(e) => setRepaymentNote(e.target.value)}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Add Payment</button>
                                <button type="button" onClick={() => { setShowRepaymentModal(false); setSelectedDebt(null); }} style={{ flex: 1, background: 'var(--text-secondary)' }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Debts Lists */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                {/* Money I Owe */}
                <div className="card" style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    <h3 style={{ color: 'var(--danger)', marginBottom: '1.5rem' }}>💸 Money I Owe</h3>
                    {owedDebts.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)' }}>No liabilities</p>
                    ) : (
                        owedDebts.map(debt => (
                            <DebtCard key={debt._id} debt={debt} onEdit={handleEdit} onDelete={handleDelete} onRepay={(d) => { setSelectedDebt(d); setShowRepaymentModal(true); }} formatAmount={formatAmount} />
                        ))
                    )}
                </div>

                {/* Money Owed to Me */}
                <div className="card" style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <h3 style={{ color: 'var(--success)', marginBottom: '1.5rem' }}>💰 Money Owed to Me</h3>
                    {owingDebts.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)' }}>No receivables</p>
                    ) : (
                        owingDebts.map(debt => (
                            <DebtCard key={debt._id} debt={debt} onEdit={handleEdit} onDelete={handleDelete} onRepay={(d) => { setSelectedDebt(d); setShowRepaymentModal(true); }} formatAmount={formatAmount} />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

const DebtCard = ({ debt, onEdit, onDelete, onRepay, formatAmount }) => {
    const isPaid = debt.remainingBalance <= 0;
    const isOverdue = debt.dueDate && new Date(debt.dueDate) < new Date() && !isPaid;

    return (
        <div style={{
            padding: '1rem',
            background: isPaid ? 'rgba(16, 185, 129, 0.1)' : 'var(--card-bg)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1rem',
            border: isPaid ? '2px solid var(--success)' : (isOverdue ? '2px solid var(--danger)' : '1px solid var(--glass-border)'),
            position: 'relative'
        }}>
            {isPaid && (
                <div style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    background: 'var(--success)',
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                }}>
                    ✓ PAID
                </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                <div style={{ flex: 1, paddingRight: isPaid ? '4rem' : '0' }}>
                    <strong>{debt.description}</strong>
                    {isOverdue && <span style={{ marginLeft: '0.5rem', color: 'var(--danger)', fontSize: '0.9rem' }}>⚠ Overdue</span>}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {!isPaid && (
                        <button onClick={() => onRepay(debt)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-color)' }} title="Add Payment">
                            <MdPayment />
                        </button>
                    )}
                    <button onClick={() => onEdit(debt)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }} title="Edit">
                        <MdEdit />
                    </button>
                    <button onClick={() => onDelete(debt._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }} title="Delete">
                        <MdDelete />
                    </button>
                </div>
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Original: {formatAmount(debt.amount)} | Remaining: <strong style={{ color: isPaid ? 'var(--success)' : 'inherit' }}>{formatAmount(debt.remainingBalance)}</strong>
            </div>
            {debt.dueDate && (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Due: {new Date(debt.dueDate).toLocaleDateString()}
                </div>
            )}
            {debt.repayments && debt.repayments.length > 0 && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: isPaid ? 'var(--success)' : 'var(--text-secondary)' }}>
                    {debt.repayments.length} payment(s) made
                    {isPaid && ' - Fully settled!'}
                </div>
            )}
        </div>
    );
};

export default Debts;
