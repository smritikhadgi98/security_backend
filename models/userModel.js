const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },

    // Email verification OTP fields
    verificationOTP: {
        type: String,
        default: null
    },
    otpExpires: {
        type: Date,
        default: null
    },

    // Login OTP fields
    loginOTP: {
        type: String,
        default: null
    },
    loginOTPExpires: {
        type: Date,
        default: null
    },

    // Reset password OTP fields
    resetPasswordOTP: {
        type: String,
        default: null
    },
    resetPasswordExpires: {
        type: Date,
        default: null
    },

    profilePicture: {
        type: String,
    },

    // Fields for failed login attempts and account lockout
    failedLoginAttempts: {
        type: Number,
        default: 0
    },
    lockoutTime: {
        type: Date,
        default: null
    },

    passwordHistory:{
        type: [String],
        default:[],
    }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
