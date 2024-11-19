const express = require('express');
const router = express.Router();
const { createTransaction, getUserTransactions } = require('../controllers/transactionController');  // Adjust path if necessary
const { verifyToken } = require('../middlewares/authMiddleware');  // Include the verifyToken middleware

// POST /api/transactions/purchase - Create a new transaction (protected route)
router.post('/purchase', verifyToken, createTransaction);

// GET /api/transactions/:userId - Get user's transaction history (protected route)
router.get('/:userId', verifyToken, getUserTransactions);

module.exports = router;
