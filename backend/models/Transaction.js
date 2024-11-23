const mongoose = require('mongoose');

// Define the Transaction schema
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
      name: { // Product name
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      category: {
        type: String,
        required: true, // Include category for each product
      },
      price: { // Product price
        type: Number,
        required: true,
      },
      images: [ // Include product images
        {
          public_id: {
            type: String,
            required: true,
          },
          url: {
            type: String,
            required: true,
          },
        },
      ],
    },
  ],
  paymentMethod: {
    type: String,
    required: true,
    enum: ['credit-card', 'paypal', 'bank-transfer'], // Ensure valid payment methods
  },
  totalAmount: {
    type: Number,
    default: 0,
  },
  purchaseDate: {
    type: Date,
    default: Date.now,
  },
});

// Export the Transaction model
module.exports = mongoose.model('Transaction', TransactionSchema);
