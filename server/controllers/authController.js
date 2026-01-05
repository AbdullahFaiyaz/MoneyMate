const authService = require('../services/authService');
const { validationResult } = require('express-validator');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const result = await authService.registerUser(req.body);
        res.status(201).json(result);
    } catch (error) {
        console.error(error.message);
        res.status(400).json({ message: error.message });
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        const result = await authService.loginUser(email, password);
        res.json(result);
    } catch (error) {
        console.error(error.message);
        res.status(401).json({ message: error.message });
    }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const user = await authService.getUserById(req.user.id);
        res.status(200).json(user);
    } catch (error) {
        res.status(500).send('Server Error');
    }
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    console.log('Forgot Password request received for email:', email);

    try {
        const result = await authService.forgotPassword(email);
        console.log('AuthService forgotPassword result:', result);
        res.status(200).json(result);
    } catch (error) {
        console.error('AuthService forgotPassword error:', error.message);
        res.status(404).json({ message: error.message });
    }
};

// @desc    Verify OTP
// @route   POST /api/auth/verifyotp
// @access  Public
const verifyOTP = async (req, res) => {
    const { email, otp } = req.body;

    try {
        await authService.verifyOTP(email, otp);
        res.status(200).json({ success: true, message: 'OTP verified' });
    } catch (error) {
        console.error(error.message);
        res.status(400).json({ message: error.message });
    }
};

// @desc    Reset password
// @route   PUT /api/auth/resetpassword
// @access  Public
const resetPassword = async (req, res) => {
    const { email, otp, password } = req.body;

    try {
        const result = await authService.resetPassword(email, otp, password);
        res.status(200).json(result);
    } catch (error) {
        console.error(error.message);
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
    forgotPassword,
    verifyOTP,
    resetPassword,
};
