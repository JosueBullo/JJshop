const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Product = require('../models/Product');

// Controller function to create a transaction
async function createTransaction(req, res) {
    try {
      const { products, paymentMethod, userId } = req.body;
      const token = req.headers['authorization']?.split(' ')[1];  // Extract token from header
  
      if (!token) {
        return res.status(400).json({ message: 'Authorization token required' });
      }
  
      // Check if products, paymentMethod, and userId are provided
      if (!products || products.length === 0) {
        return res.status(400).json({ message: 'At least one product is required' });
      }
  
      if (!paymentMethod) {
        return res.status(400).json({ message: 'Payment method is required' });
      }
  
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }
  
      // Find the user by userId
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Calculate the total amount for the transaction
      let totalAmount = 0;
      for (const item of products) {
        // Check if each productId and quantity are provided
        if (!item.product || !item.quantity) {
          return res.status(400).json({ message: 'Each product requires a productId and quantity' });
        }
  
        // Find the product by productId
        const product = await Product.findById(item.product);
        if (!product) {
          return res.status(404).json({ message: `Product not found: ${item.product}` });
        }
  
        // Add the price of the product multiplied by the quantity to the totalAmount
        totalAmount += product.price * item.quantity;
      }
  
      // Create the transaction
      const transaction = new Transaction({
        user: userId,
        products: products.map(item => ({
          product: item.product,  // Product ID reference
          quantity: item.quantity,  // Product quantity
        })),
        paymentMethod,  // Payment method
        totalAmount,  // Total amount calculated
      });
  
      // Save the transaction
      await transaction.save();
  
      // Optionally, update the user's transaction history (if you track transactions per user)
      await User.findByIdAndUpdate(userId, {
        $push: { transactions: transaction._id },
      });
  
      // Return success response with transaction data
      res.status(201).json({
        message: 'Transaction created successfully',
        transaction,
      });
    } catch (error) {
      console.error('Error creating transaction:', error.message);
      res.status(500).json({
        message: 'Error processing transaction',
        error: error.message,
      });
    }
  }
// Controller function to get user transactions
async function getUserTransactions(req, res) {
    try {
        const { userId } = req.params;

        // Validate userId
        if (!userId) {
            return res.status(400).json({ message: 'Missing user ID' });
        }

        // Get user transactions
        const user = await User.findById(userId).populate('transactions');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user.transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error.message);
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    createTransaction,
    getUserTransactions,
};
