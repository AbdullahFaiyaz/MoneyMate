import { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';
import currencyService from '../services/currencyService';

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
    const [currency, setCurrency] = useState(localStorage.getItem('preferredCurrency') || 'USD');
    const [rates, setRates] = useState({});
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [error, setError] = useState(null);

    const fetchRates = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('Fetching latest exchange rates...');
            const data = await currencyService.getLatestRates('USD');
            setRates(data.rates);
            setLastUpdated(new Date());
            console.log('Exchange rates updated successfully');
        } catch (err) {
            console.error('Failed to fetch rates', err);
            setError('Could not update exchange rates. Using local fallback.');

            // Fallback rates if API fails
            if (Object.keys(rates).length === 0) {
                setRates({
                    USD: 1,
                    EUR: 0.92,
                    GBP: 0.79,
                    INR: 83.3,
                    BDT: 110.0,
                    JPY: 151.4
                });
            }
        } finally {
            setLoading(false);
        }
    }, [rates]);

    useEffect(() => {
        fetchRates();

        // Auto-refresh every 30 minutes for "realtime" feel
        const interval = setInterval(fetchRates, 30 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const changeCurrency = useCallback((newCurrency) => {
        setCurrency(newCurrency);
        localStorage.setItem('preferredCurrency', newCurrency);
    }, []);

    // Convert amount from any source currency to any target currency
    const convertAmount = useCallback((amount, from = 'USD', to = currency) => {
        if (!amount && amount !== 0) return 0;
        if (!rates || Object.keys(rates).length === 0) return amount;
        const targetRate = rates[to];
        const sourceRate = rates[from];
        if (!targetRate || !sourceRate) return amount;
        const converted = (amount / sourceRate) * targetRate;
        return Number(converted.toFixed(2));
    }, [currency, rates]);

    // Backward compatible convert: assumes conversion from USD to selected currency
    const convert = useCallback((amount, from = 'USD') => {
        return convertAmount(amount, from, currency);
    }, [convertAmount, currency]);

    const formatAmount = useCallback((amount, code = currency) => {
        try {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: code,
            }).format(amount);
        } catch (e) {
            return `${code} ${amount.toLocaleString()}`;
        }
    }, [currency]);

    const value = useMemo(() => ({
        currency,
        rates,
        loading,
        lastUpdated,
        error,
        changeCurrency,
        convert,
        convertAmount,
        formatAmount,
        refreshRates: fetchRates,
        availableCurrencies: Object.keys(rates)
    }), [currency, rates, loading, lastUpdated, error, changeCurrency, convert, convertAmount, formatAmount, fetchRates]);

    return (
        <CurrencyContext.Provider value={value}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => useContext(CurrencyContext);

export default CurrencyContext;
