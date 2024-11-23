const mongoose = require('mongoose');

// models/User.js
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    googleId: { type: String, unique: true, sparse: true },
    transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }], // Array of transactions
    profileImage: { type: String } // Field for storing profile image URL
  });
  
module.exports = mongoose.model('User', UserSchema);
  