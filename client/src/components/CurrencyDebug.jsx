import { useCurrency } from '../context/CurrencyContext';

const CurrencyDebug = () => {
    const { currency, rates, convert, convertAmount, loading } = useCurrency();

    if (loading) return <div style={{ padding: '1rem', background: '#333', borderRadius: '8px', margin: '1rem 0' }}>Loading rates...</div>;

    const testAmount = 100; // 100 USD

    return (
        <div style={{
            padding: '1.5rem',
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '12px',
            margin: '1rem 0',
            fontSize: '0.9rem'
        }}>
            <h4 style={{ margin: '0 0 1rem 0', color: 'var(--primary-color)' }}>🔍 Currency Conversion Debug</h4>

            <div style={{ display: 'grid', gap: '0.5rem' }}>
                <div>
                    <strong>Selected Currency:</strong> {currency}
                </div>
                <div>
                    <strong>Available Currencies:</strong> {Object.keys(rates).length}
                </div>
                <div>
                    <strong>Test Conversion (100 USD):</strong>
                    <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                        <li>To {currency}: {convert(testAmount, 'USD')} (using convert)</li>
                        <li>To {currency}: {convertAmount(testAmount, 'USD', currency)} (using convertAmount)</li>
                        <li>To EUR: {convertAmount(testAmount, 'USD', 'EUR')}</li>
                        <li>To GBP: {convertAmount(testAmount, 'USD', 'GBP')}</li>
                        <li>To BDT: {convertAmount(testAmount, 'USD', 'BDT')}</li>
                    </ul>
                </div>
                <div>
                    <strong>Current Rates (sample):</strong>
                    <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                        <li>USD: {rates.USD || 'N/A'}</li>
                        <li>EUR: {rates.EUR || 'N/A'}</li>
                        <li>GBP: {rates.GBP || 'N/A'}</li>
                        <li>BDT: {rates.BDT || 'N/A'}</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default CurrencyDebug;
