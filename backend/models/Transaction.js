const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to User model
    required: true,
  },
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', // Reference to Product model
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
    },
  ],
  paymentMethod: {
    type: String,
    required: true,
    enum: ['credit-card', 'paypal', 'bank-transfer'], // Ensure valid payment methods
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  purchaseDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Transaction', TransactionSchema);
