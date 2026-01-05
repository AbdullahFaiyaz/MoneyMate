import axios from 'axios';

const API_URL = '/api/auth';

const register = async (userData) => {
    const response = await axios.post(`${API_URL}/register`, userData);
    return response.data;
};

const login = async (userData) => {
    const response = await axios.post(`${API_URL}/login`, userData);
    return response.data;
};

const getMe = async () => {
    const response = await axios.get(`${API_URL}/me`);
    return response.data;
};

const forgotPassword = async (email) => {
    const response = await axios.post(`${API_URL}/forgotpassword`, { email });
    return response.data;
};

const verifyOTP = async (email, otp) => {
    const response = await axios.post(`${API_URL}/verifyotp`, { email, otp });
    return response.data;
};

const resetPassword = async (email, otp, password) => {
    const response = await axios.put(`${API_URL}/resetpassword`, { email, otp, password });
    return response.data;
};

const authService = {
    register,
    login,
    getMe,
    forgotPassword,
    verifyOTP,
    resetPassword,
};

export default authService;
