import axios from 'axios';

const BASE_URL = 'https://open.er-api.com/v6/latest';

const getLatestRates = async (baseCurrency = 'USD') => {
    try {
        const response = await axios.get(`${BASE_URL}/${baseCurrency}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching exchange rates:', error);
        throw error;
    }
};

const currencyService = {
    getLatestRates,
};

export default currencyService;
