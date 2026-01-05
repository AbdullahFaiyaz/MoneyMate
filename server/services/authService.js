const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

const registerUser = async (userData) => {
    const { name, email, password } = userData;

    let user = await User.findOne({ email });
    if (user) {
        throw new Error('User already exists');
    }

    user = new User({
        name,
        email,
        password,
    });

    await user.save();

    // Send Welcome Email
    try {
        await sendEmail({
            email: user.email,
            subject: 'Welcome to Moneymate!',
            message: `Hi ${user.name}, welcome to Moneymate! We're excited to help you take control of your finances. Start tracking your transactions and setting goals today!`
        });
    } catch (err) {
        console.error('Welcome Email Failed:', err.message);
        // Don't throw error here, registration was successful
    }

    return {
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
    };
};

const loginUser = async (email, password) => {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        return {
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
        };
    } else {
        throw new Error('Invalid email or password');
    }
};

const getUserById = async (id) => {
    return await User.findById(id).select('-password');
};

const forgotPassword = async (email) => {
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error('User not found with that email address');
    }

    // Get reset OTP
    const otp = user.getResetOTP();
    await user.save({ validateBeforeSave: false });

    try {
        await sendEmail({
            email: user.email,
            subject: 'Moneymate Password Recovery OTP',
            otp,
        });
        return {
            success: true,
            message: 'OTP sent successfully to your email!'
        };
    } catch (err) {
        console.error('Nodemailer Error:', err);

        // Simulation mode for development
        if (process.env.NODE_ENV === 'development') {
            console.warn('⚠️  EMAIL SIMULATION MODE: Nodemailer failed, but displaying OTP for development.');
            console.warn(`🔑  OTP for ${email}: ${otp}`);
            return {
                success: true,
                message: 'Simulation Mode: Email service failed, but OTP generated',
                simulated: true,
                devOTP: otp
            };
        }

        user.resetOTP = undefined;
        user.resetOTPExpire = undefined;
        await user.save({ validateBeforeSave: false });
        throw new Error('Email service failed. Please try again later or check server configuration.');
    }
};

const verifyOTP = async (email, otp) => {
    if (!email || !otp) {
        throw new Error('Email and OTP are required');
    }

    // Hash provided OTP to match stored hash
    const hashedOTP = crypto
        .createHash('sha256')
        .update(otp.toString())
        .digest('hex');

    const user = await User.findOne({
        email,
        resetOTP: hashedOTP,
        resetOTPExpire: { $gt: Date.now() },
    });

    if (!user) {
        throw new Error('Invalid OTP or the code has expired. Please request a new one.');
    }

    return true;
};

const resetPassword = async (email, otp, password) => {
    if (!email || !otp || !password) {
        throw new Error('All fields are required');
    }

    const hashedOTP = crypto
        .createHash('sha256')
        .update(otp.toString())
        .digest('hex');

    const user = await User.findOne({
        email,
        resetOTP: hashedOTP,
        resetOTPExpire: { $gt: Date.now() },
    });

    if (!user) {
        throw new Error('Session expired or invalid. Please restart the recovery process.');
    }

    // Set new password (pre-save hook will hash it)
    user.password = password;

    // Clear reset fields
    user.resetOTP = undefined;
    user.resetOTPExpire = undefined;

    await user.save();

    return {
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
    };
};

module.exports = {
    registerUser,
    loginUser,
    getUserById,
    forgotPassword,
    verifyOTP,
    resetPassword,
};
