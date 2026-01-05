import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { Link } from 'react-router-dom';

const GoalsBudget = () => {
    const { user } = useContext(AuthContext);
    const [budget, setBudget] = useState(0);
    const [goals, setGoals] = useState([]);
    const [goalName, setGoalName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [deadline, setDeadline] = useState('');
    const [message, setMessage] = useState('');
    const [editingGoalId, setEditingGoalId] = useState(null);
    const [addAmount, setAddAmount] = useState({}); // To track input for each goal's "Add Funds"

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const budgetRes = await axios.get('/api/budget');
            if (budgetRes.data.data) {
                setBudget(budgetRes.data.data.amount);
            }

            const goalsRes = await axios.get('/api/goals');
            setGoals(goalsRes.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    const updateBudget = async (e) => {
        e.preventDefault();
        try {
            const date = new Date();
            await axios.post('/api/budget', {
                amount: parseFloat(budget),
                month: date.getMonth() + 1,
                year: date.getFullYear(),
            });
            setMessage('Budget updated!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error(err);
            setMessage('Error updating budget');
        }
    };

    const handleSubmitGoal = async (e) => {
        e.preventDefault();
        try {
            if (editingGoalId) {
                // Update existing goal
                const res = await axios.put(`/api/goals/${editingGoalId}`, {
                    name: goalName,
                    targetAmount: parseFloat(targetAmount),
                    deadline,
                });
                setGoals(goals.map(g => g._id === editingGoalId ? res.data.data : g));
                setMessage('Goal updated successfully!');
            } else {
                // Add new goal
                const res = await axios.post('/api/goals', {
                    name: goalName,
                    targetAmount: parseFloat(targetAmount),
                    deadline,
                });
                setGoals([...goals, res.data.data]);
                setMessage('Goal added successfully!');
            }
            resetForm();
        } catch (err) {
            console.error(err);
            setMessage(editingGoalId ? 'Error updating goal' : 'Error adding goal');
        }
    };

    const deleteGoal = async (id) => {
        if (!window.confirm('Are you sure you want to delete this goal?')) return;
        try {
            await axios.delete(`/api/goals/${id}`);
            setGoals(goals.filter(g => g._id !== id));
            setMessage('Goal deleted');
        } catch (err) {
            console.error(err);
            setMessage('Error deleting goal');
        }
    };

    const updateProgress = async (id, currentTotal, amountToAdd) => {
        try {
            const added = parseFloat(amountToAdd);
            if (isNaN(added)) {
                setMessage('Please enter a valid amount');
                return;
            }

            const newAmount = currentTotal + added;
            const res = await axios.put(`/api/goals/${id}`, {
                currentAmount: newAmount
            });
            setGoals(goals.map(g => g._id === id ? res.data.data : g));
            setAddAmount({ ...addAmount, [id]: '' });

            // Check if goal reached
            const goal = goals.find(g => g._id === id);
            if (goal && newAmount >= goal.targetAmount && currentTotal < goal.targetAmount) {
                setMessage(`🎉 Congratulations! You reached your goal: ${goal.name}!`);
            } else {
                setMessage('Progress updated!');
            }
        } catch (err) {
            console.error(err);
            setMessage('Error updating progress');
        }
    };

    const getProgressColor = (percent) => {
        if (percent >= 100) return '#10b981'; // Green/Success
        if (percent >= 75) return '#3b82f6'; // Blue
        if (percent >= 50) return '#f59e0b'; // Orange/Yellow
        return '#ef4444'; // Red
    };

    const startEditing = (goal) => {
        setEditingGoalId(goal._id);
        setGoalName(goal.name);
        setTargetAmount(goal.targetAmount);
        setDeadline(goal.deadline ? goal.deadline.split('T')[0] : '');
        window.scrollTo(0, 0);
    };

    const resetForm = () => {
        setEditingGoalId(null);
        setGoalName('');
        setTargetAmount('');
        setDeadline('');
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0' }}>
            <h2>Manage Budget & Goals</h2>
            {message && <div style={{ marginBottom: '1rem', color: 'var(--success)' }}>{message}</div>}

            <div className="card">
                <h3>Monthly Budget</h3>
                <form onSubmit={updateBudget} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                    <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
                        <label>Budget Amount ($)</label>
                        <input
                            type="number"
                            value={budget}
                            onChange={(e) => setBudget(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" style={{ backgroundColor: 'var(--secondary-color)', color: '#333' }}>Update Budget</button>
                </form>
            </div>

            <div className="card">
                <h3>{editingGoalId ? 'Edit Goal' : 'Create Savings Goal'}</h3>
                <form onSubmit={handleSubmitGoal} style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label>Goal Name</label>
                            <input type="text" value={goalName} onChange={(e) => setGoalName(e.target.value)} placeholder="New Car" required />
                        </div>
                        <div className="form-group">
                            <label>Target Amount</label>
                            <input type="number" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} placeholder="5000" required />
                        </div>
                        <div className="form-group">
                            <label>Deadline</label>
                            <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button type="submit" style={{ backgroundColor: 'var(--primary-color)', color: 'white' }}>
                            {editingGoalId ? 'Update Goal' : 'Add Goal'}
                        </button>
                        {editingGoalId && (
                            <button type="button" onClick={resetForm} style={{ backgroundColor: '#666', color: 'white' }}>
                                Cancel
                            </button>
                        )}
                    </div>
                </form>

                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {goals.map(g => {
                        const rawPercent = Math.round((g.currentAmount / (g.targetAmount || 1)) * 100);
                        const percent = Math.min(100, Math.max(0, rawPercent));
                        const isCompleted = rawPercent >= 100;

                        return (
                            <li key={g._id} style={{ padding: '1.5rem', border: '1px solid #eee', borderRadius: '12px', marginBottom: '1rem', backgroundColor: '#f9f9f9', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <div>
                                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            {g.name}
                                            {isCompleted && (
                                                <span style={{ fontSize: '0.8rem', backgroundColor: '#10b981', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '10px' }}>Completed</span>
                                            )}
                                        </h4>
                                        <div style={{ fontSize: '0.9rem', color: '#666' }}>
                                            Target: <strong>${g.targetAmount}</strong> |
                                            Current: <strong>${g.currentAmount}</strong>
                                            {g.deadline && <span> | By: {new Date(g.deadline).toLocaleDateString()}</span>}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={() => startEditing(g)} style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', backgroundColor: '#e2e8f0', color: '#333' }}>Edit</button>
                                        <button onClick={() => deleteGoal(g._id)} style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', backgroundColor: '#fee2e2', color: '#dc2626' }}>Delete</button>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                                        <span>Progress</span>
                                        <span style={{ fontWeight: 'bold', color: getProgressColor(percent) }}>
                                            {percent}%
                                        </span>
                                    </div>
                                    <div style={{ height: '12px', backgroundColor: '#e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                                        <div style={{
                                            width: `${percent}%`,
                                            height: '100%',
                                            backgroundColor: getProgressColor(percent),
                                            transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                                            borderRadius: '6px'
                                        }}></div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                                    <input
                                        type="number"
                                        placeholder="Add amount..."
                                        value={addAmount[g._id] || ''}
                                        onChange={(e) => setAddAmount({ ...addAmount, [g._id]: e.target.value })}
                                        style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd', width: '150px' }}
                                    />
                                    <button
                                        onClick={() => updateProgress(g._id, g.currentAmount, addAmount[g._id])}
                                        disabled={!addAmount[g._id]}
                                        style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--success)', color: 'white', opacity: addAmount[g._id] ? 1 : 0.6 }}
                                    >
                                        Add Funds
                                    </button>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
};

export default GoalsBudget;
