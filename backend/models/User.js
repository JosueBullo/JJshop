const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Password is optional for Google login
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    googleId: { type: String, unique: true, sparse: true }, // Unique Google ID for users logging in with Google
});

module.exports = mongoose.model('User', UserSchema);
