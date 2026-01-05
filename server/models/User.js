const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    resetOTP: String,
    resetOTPExpire: Date,
    date: {
        type: Date,
        default: Date.now,
    },

});

// Encrypt password using bcrypt
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password OTP
UserSchema.methods.getResetOTP = function () {
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP and set to resetOTP field
    this.resetOTP = crypto
        .createHash('sha256')
        .update(otp)
        .digest('hex');

    // Set expire
    this.resetOTPExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    return otp;
};

module.exports = mongoose.model('User', UserSchema);
