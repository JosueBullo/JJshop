const Product = require('../models/Product');
const path = require('path');

// Create a new product
exports.createProduct = async (req, res) => {
  const { name, description, price, category } = req.body;
  let imageUrl;

  if (req.file) {
    imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  } else {
    return res.status(400).json({ message: 'Image file is required' });
  }

  try {
    const newProduct = new Product({ name, description, price, category, imageUrl });
    await newProduct.save();

    res.status(201).json({ message: 'Product created successfully', product: newProduct });
  } catch (error) {
    console.error('Error in creating product:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(400).json({ message: 'Server error', error });
  }
};

// Update a product
// Update a product
exports.updateProduct = async (req, res) => {
  const { name, description, price, category } = req.body;
  const productId = req.params.id;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // Update fields
    product.name = name;
    product.description = description;
    product.price = price;
    product.category = category;

    // Handle image update if a new file is uploaded
    if (req.file) {
      product.imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    await product.save(); // Save changes to the database
    res.json({ message: 'Product updated successfully', product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Delete a product
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    await Product.findByIdAndDelete(id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
