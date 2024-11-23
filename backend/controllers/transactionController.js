const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Product = require('../models/Product');

// Controller function to create a transaction
async function createTransaction(req, res) {
  try {
    const { products, paymentMethod, userId } = req.body;
    const token = req.headers['authorization']?.split(' ')[1]; // Extract token from header

    if (!token) {
      return res.status(401).json({ message: 'Authorization token required' });
    }

    // Validate input fields
    if (!products || products.length === 0) {
      return res.status(400).json({ message: 'At least one product is required' });
    }
    if (!paymentMethod) {
      return res.status(400).json({ message: 'Payment method is required' });
    }
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Validate the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate total amount and prepare product details
    let totalAmount = 0;
    const transactionProducts = [];

    for (const item of products) {
      if (!item.product || !item.quantity) {
        return res.status(400).json({ message: 'Each product must include a product ID and quantity' });
      }

      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.product}` });
      }

      totalAmount += product.price * item.quantity;
      transactionProducts.push({
        product: product._id,
        name: product.name,
        category: product.category,
        price: product.price,
        images: product.images,
        quantity: item.quantity,
      });
    }

    // Create and save the transaction
    const transaction = new Transaction({
      user: userId,
      products: transactionProducts,
      paymentMethod,
      totalAmount,
    });
    await transaction.save();

    // Update user's transaction history
    user.transactions.push(transaction._id);
    await user.save();

    res.status(201).json({
      message: 'Transaction created successfully',
      transaction,
    });
  } catch (error) {
    console.error('Error creating transaction:', error.message);
    res.status(500).json({ message: 'Error processing transaction', error: error.message });
  }
}

// Controller function to get user transactions
async function getUserTransactions(req, res) {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const user = await User.findById(userId).populate({
      path: 'transactions',
      populate: {
        path: 'products.product',
        select: 'name category price images',
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user.transactions);
  } catch (error) {
    console.error('Error fetching user transactions:', error.message);
    res.status(500).json({ message: 'Error fetching user transactions', error: error.message });
  }
}

// Controller function to update transaction status
async function updateTransactionStatus(req, res) {
  try {
    const { transactionId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const validStatuses = ['Pending', 'Processing', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const transaction = await Transaction.findByIdAndUpdate(
      transactionId,
      { status },
      { new: true }
    ).populate('products.product', 'name category price images');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.status(200).json({
      message: 'Transaction status updated successfully',
      transaction,
    });
  } catch (error) {
    console.error('Error updating transaction status:', error.message);
    res.status(500).json({ message: 'Error updating transaction status', error: error.message });
  }
}

// Controller function to get all transactions with details
async function getAllTransactions(req, res) {
  try {
    const transactions = await Transaction.find()
      .populate('user', 'name email')
      .populate('products.product', 'name category price images');

    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching all transactions:', error.message);
    res.status(500).json({ message: 'Error fetching transactions', error: error.message });
  }
}

module.exports = {
  createTransaction,
  getUserTransactions,
  updateTransactionStatus,
  getAllTransactions,
};
