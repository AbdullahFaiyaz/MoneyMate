import { useState, useEffect } from 'react';
import axios from 'axios';
import { useCurrency } from '../context/CurrencyContext';

const SpendingInsights = () => {
    const { formatAmount, convert } = useCurrency();
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInsights = async () => {
            try {
                const res = await axios.get('/api/analytics');
                setInsights(res.data.data);
            } catch (err) {
                console.error("Failed to fetch insights");
            } finally {
                setLoading(false);
            }
        };

        fetchInsights();
    }, []);

    if (loading) return null; // Or a skeleton loader
    if (!insights) return null;

    return (
        <div className="card animate-fade-in" style={{ marginTop: '2rem', border: '1px solid var(--primary-glow)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>🧠</span> Smart Insights
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>

                {/* 1. Comparison Card */}
                <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Monthly Trend</div>
                    <div style={{ fontSize: '1.1rem', lineHeight: '1.5' }}>
                        {insights.comparison.direction === 'increased' ? '📈' : '📉'} Your expenses
                        <strong style={{ color: insights.comparison.direction === 'increased' ? 'var(--danger)' : 'var(--success)' }}>
                            {' '}{insights.comparison.direction}{' '}
                        </strong>
                        by <strong>{insights.comparison.percentageChange}%</strong> compared to last month.
                    </div>
                </div>

                {/* 2. Top Category Card */}
                {insights.topCategory && (
                    <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Top Category</div>
                        <div style={{ fontSize: '1.1rem', lineHeight: '1.5' }}>
                            🍟 <strong>{insights.topCategory.name}</strong> is your highest spending category, making up
                            <strong> {insights.topCategory.percent}%</strong> of your total expenses.
                        </div>
                    </div>
                )}

                {/* 3. Budget Status Card */}
                {insights.budget ? (
                    <div style={{ padding: '1.25rem', background: insights.budget.status === 'exceeded' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(251, 191, 36, 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
                        <div style={{ color: insights.budget.status === 'exceeded' ? 'var(--danger)' : '#f59e0b', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Budget Alert</div>
                        <div style={{ fontSize: '1.1rem', lineHeight: '1.5' }}>
                            {insights.budget.status === 'exceeded'
                                ? `⚠️ You have overspent your monthly budget by ${formatAmount(convert(insights.budget.diff))}!`
                                : `⚠️ Careful! You only have ${formatAmount(convert(insights.budget.remaining))} remaining in your budget.`}
                        </div>
                    </div>
                ) : (
                    <div style={{ padding: '1.25rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
                        <div style={{ color: 'var(--success)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Budget Status</div>
                        <div style={{ fontSize: '1.1rem', lineHeight: '1.5' }}>
                            ✅ You are currently within your budget. Keep it up!
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default SpendingInsights;
