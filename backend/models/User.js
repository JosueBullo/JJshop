const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    verificationToken: { type: String }, // Add a token field for email verification
    isVerified: { type: Boolean, default: false } // Track if email is verified
});

module.exports = mongoose.model('User', UserSchema);
