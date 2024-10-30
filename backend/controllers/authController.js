// controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendMail = require('../config/mailer');
const crypto = require('crypto');


// Register function


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

// Register function with email verification
exports.register = async (req, res) => {
    const { username, email, password, role } = req.body;

    console.log("Request body:", req.body); // Debug log

    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        // Generate a verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');

        // Create a new user with hashed password and verification token
        user = new User({
            username,
            email,
            password: await bcrypt.hash(password, 10),
            role,
            verificationToken,
        });
        await user.save();

        // Send a verification email
        const subject = 'Welcome to YourApp! Please Verify Your Email';
        const verificationUrl = `http://localhost:5000/api/auth/verify-email?token=${verificationToken}`;
        const message = `Hello ${username},\n\nThank you for registering with us! Please verify your email by clicking the link below:\n${verificationUrl}\n\nBest Regards,\nYourApp Team`;

        await sendMail(email, subject, message);

        res.status(201).json({ message: 'User registered successfully. Verification email sent.' });
    } catch (err) {
        console.error("Error during registration:", err); // Debug log
        res.status(500).json({ message: 'Server error' });
    }
};

// Verification route function (additional route to add in your controller)
exports.verifyEmail = async (req, res) => {
    const { token } = req.query;

    try {
        const user = await User.findOne({ verificationToken: token });
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // Verify the user
        user.isVerified = true;
        user.verificationToken = null; // Clear the token after verification
        await user.save();

        res.status(200).json({ message: 'Email verified successfully!' });
    } catch (err) {
        console.error("Error during email verification:", err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Login function

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        // Check if the email has been accepted
        if (!user.isEmailAccepted) {
            return res.status(403).json({ message: 'Your email is not yet accepted. Please check your inbox.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        // Sign token including the role
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, role: user.role, message: 'Login successful!' });
    } catch (err) {
        console.error(err); // Log the error for debugging
        res.status(500).json({ message: 'Server error' });
    }
};
