const express = require('express');
const authController = require('../controllers/authController'); 

const router = express.Router();

// Register new user
router.post('/register', authController.register);

// Send verification email
router.post('/send-email', authController.sendEmail);

// Verify email address


// Login user
router.post('/login', authController.login);
// Google login route
router.post('/google', authController.googleLogin); // Add this line for Google login


module.exports = router;
