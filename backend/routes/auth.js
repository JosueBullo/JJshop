const express = require('express');
const { register, login } = require('../controllers/authController');
const router = express.Router();
const { sendEmail } = require('../controllers/authController');
const authController = require('../controllers/authController'); 

// Register route
router.post('/register', register);
router.post('/send-email', sendEmail);
router.get('/verify-email', authController.verifyEmail);
// Login route
router.post('/login', login);


module.exports = router;
