import { useRef, useMemo } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, DoughnutController } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
import useDashboard from '../hooks/useDashboard';
import CurrencySelector from '../components/CurrencySelector';
import SpendingInsights from '../components/SpendingInsights';
import { useCurrency } from '../context/CurrencyContext';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, DoughnutController);

// Custom plugin to show text in center of doughnut
const centerTextPlugin = {
    id: 'centerText',
    afterDraw: (chart) => {
        if (chart.config.options.elements.center) {
            const ctx = chart.ctx;
            const centerConfig = chart.config.options.elements.center;
            const fontStyle = centerConfig.fontStyle || 'Arial';
            const txt = centerConfig.text;
            const color = centerConfig.color || '#000';
            const maxFontSize = centerConfig.maxFontSize || 75;
            const sidePadding = centerConfig.sidePadding || 20;
            const sidePaddingCalculation = (sidePadding / 100) * (chart.innerRadius * 2);

            ctx.font = "30px " + fontStyle;

            const stringWidth = ctx.measureText(txt).width;
            const elementWidth = (chart.innerRadius * 2) - sidePaddingCalculation;

            const widthRatio = elementWidth / stringWidth;
            const newFontSize = Math.floor(30 * widthRatio);
            const fontSizeToUse = Math.min(newFontSize, maxFontSize);

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
            const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
            ctx.font = fontSizeToUse + "px " + fontStyle;
            ctx.fillStyle = color;

            ctx.fillText(txt, centerX, centerY);
        }
    }
};

// Plugin for shadow/glow effect
const shadowPlugin = {
    id: 'shadow',
    beforeDraw: (chart) => {
        const { ctx } = chart;
        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 4;
    },
    afterDraw: (chart) => {
        chart.ctx.restore();
    }
};

const Dashboard = () => {
    const { currency, convert, formatAmount } = useCurrency();
    const {
        user,
        transactions,
        loading,
        totalIncome,
        totalExpense,
        balance
    } = useDashboard();

    const chartRef = useRef(null);

    const chartData = useMemo(() => {
        return {
            labels: ['Income', 'Expense'],
            datasets: [
                {
                    data: [convert(totalIncome), convert(totalExpense)],
                    backgroundColor: [
                        'rgba(16, 185, 129, 0.8)', // Modern Green
                        'rgba(239, 68, 68, 0.8)',  // Modern Red
                    ],
                    borderColor: [
                        '#10b981',
                        '#ef4444',
                    ],
                    borderWidth: 2,
                    hoverOffset: 15,
                    borderRadius: 10,
                    spacing: 8,
                },
            ],
        };
    }, [totalIncome, totalExpense, convert]);

    const chartOptions = {
        responsive: true,
        cutout: '75%',
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 20,
                    usePointStyle: true,
                    color: 'var(--text-primary)',
                    font: {
                        size: 14,
                        family: 'Poppins'
                    }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                titleFont: { size: 14 },
                bodyFont: { size: 13 },
                displayColors: true,
                cornerRadius: 8,
            }
        },
        elements: {
            center: {
                text: formatAmount(convert(balance)),
                color: 'var(--text-primary)',
                fontStyle: 'Poppins',
                sidePadding: 20
            }
        },
        animation: {
            animateRotate: true,
            animateScale: true,
            duration: 2000,
            easing: 'easeOutElastic'
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div style={{ paddingBottom: '2rem' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1>Welcome, {user && user.name}</h1>

                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <CurrencySelector />
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div className="card" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', boxShadow: '0 8px 32px 0 rgba(16, 185, 129, 0.1)' }}>
                    <h3 style={{ color: '#10b981', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Income</h3>
                    <p style={{ fontSize: '1.75rem', color: '#10b981', fontWeight: '700', marginTop: '0.5rem' }}>{formatAmount(convert(totalIncome))}</p>
                </div>
                <div className="card" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', boxShadow: '0 8px 32px 0 rgba(239, 68, 68, 0.1)' }}>
                    <h3 style={{ color: '#ef4444', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Expenses</h3>
                    <p style={{ fontSize: '1.75rem', color: '#ef4444', fontWeight: '700', marginTop: '0.5rem' }}>{formatAmount(convert(totalExpense))}</p>
                </div>
                <div className="card" style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', boxShadow: '0 8px 32px 0 rgba(99, 102, 241, 0.1)' }}>
                    <h3 style={{ color: '#6366f1', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Balance</h3>
                    <p style={{ fontSize: '1.75rem', color: '#6366f1', fontWeight: '800', marginTop: '0.5rem' }}>{formatAmount(convert(balance))}</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <h3>Spending Overview ({currency})</h3>
                    <div style={{ flex: 1, maxHeight: '350px', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', marginTop: '1rem' }}>
                        <Doughnut
                            ref={chartRef}
                            data={chartData}
                            options={chartOptions}
                            plugins={[centerTextPlugin, shadowPlugin]}
                        />
                    </div>
                </div>

                <div className="card">
                    <h3>Recent Transactions</h3>
                    {transactions.length === 0 ? <p>No transactions yet.</p> : transactions.slice(0, 5).map(t => (
                        <div key={t._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--text-secondary)', opacity: 0.8 }}>
                            <div>
                                <strong>{t.text}</strong>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(t.date).toLocaleDateString()}</div>
                            </div>
                            <span style={{ color: t.type === 'income' ? '#2ecc71' : '#e74c3c' }}>
                                {t.type === 'income' ? '+' : '-'}{formatAmount(convert(t.amount))}
                            </span>
                        </div>
                    ))}
                    <div style={{ marginTop: '1.5rem' }}>
                        <Link to="/transactions" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>View Full History</Link>
                    </div>
                </div>
            </div>

            <SpendingInsights />

        </div>
    );
};

export default Dashboard;
