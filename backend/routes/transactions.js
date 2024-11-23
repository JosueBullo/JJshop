const express = require('express');
const router = express.Router();
const { createTransaction, getUserTransactions,  getAllTransactions, updateTransactionStatus } = require('../controllers/transactionController');  // Adjust path if necessary
const { verifyToken } = require('../middlewares/authMiddleware');  // Include the verifyToken middleware

// POST /api/transactions/purchase - Create a new transaction (protected route)
router.post('/purchase', verifyToken, createTransaction);

// GET /api/transactions/:userId - Get user's transaction history (protected route)
router.get('/:userId', verifyToken, getUserTransactions);

// PATCH /api/transactions/:transactionId/status - Update transaction status
router.patch('/:transactionId/status', verifyToken, updateTransactionStatus);


// Adjust route to fetch all transactions (admin route)
router.get('/', getAllTransactions);  // For fetching all transactions for admin

// Existing route for fetching user transactions
router.get('/:userId', getUserTransactions); 

module.exports = router;
