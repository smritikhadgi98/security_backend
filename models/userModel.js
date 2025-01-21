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

});

const User = mongoose.model('User', userSchema);
module.exports = User;
