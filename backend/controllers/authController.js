const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendMail = require('../config/mailer');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library'); // Import Google Auth Library

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID); // Initialize Google OAuth Client

// Register function
exports.register = async (req, res) => {
    const { username, email, password, role } = req.body;

    console.log("Request body:", req.body); // Debug log

    try {
        // Check if the user already exists
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        // Create a new user with a hashed password
        user = new User({
            username,
            email,
            password: await bcrypt.hash(password, 10),
            role
        });

        // Save the new user
        await user.save();

        // Send a success response
        res.status(201).json({ message: 'User registered successfully.' });
    } catch (err) {
        console.error("Error during registration:", err); // Debug log
        res.status(500).json({ message: 'Server error' });
    }
};

// Login function
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Validate password
        if (password) {
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }
        }

        // Generate a JWT token
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Send the response with token, role, and userId
        res.json({
            token,
            role: user.role,
            userId: user._id, // Ensure userId is included in the response
            message: 'Login successful!',
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Google login function
exports.googleLogin = async (req, res) => {
    const { tokenId } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken: tokenId,
            audience: process.env.GOOGLE_CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        });
        const { email, name, sub: googleId } = ticket.getPayload(); // Get user info from the token

        // Check if the user already exists
        let user = await User.findOne({ email });
        if (!user) {
            // If user doesn't exist, create a new one
            user = new User({
                username: name,
                email,
                googleId, // Store Google ID for reference
                role: 'user', // Default role for Google login
            });
            await user.save(); // Save the user to the database
        }

        // Sign token for the existing or newly created user
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Respond with token, role, userId, and a success message
        res.json({ 
            token, 
            role: user.role, 
            userId: user._id, // Include userId in the response 
            message: 'Google login successful!' 
        });
    } catch (err) {
        console.error(err); // Log the error for debugging
        res.status(500).json({ message: 'Server error' });
    }
};

// Email sending function
exports.sendEmail = async (req, res) => {
    const { email, subject, message } = req.body;

    try {
        await sendMail(email, subject, message);
        res.status(200).json({ success: true, message: 'Email sent successfully!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to send email' });
    }
};
