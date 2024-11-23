/*const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Create a new product
router.post('/', productController.createProduct);

// Get all products
router.get('/', productController.getAllProducts);

// Update a product
router.put('/:id', productController.updateProduct);

// Delete a product
router.delete('/:id', productController.deleteProduct);

module.exports = router;*/



// const express = require('express');
// const router = express.Router();
// const { createProduct, getAllProducts, updateProduct, deleteProduct } = require('../controllers/productController');
// const multer = require('multer');
// const upload = multer({ dest: 'uploads/' }); // Set up multer for file uploads

// // Define routes
// router.post('/', upload.single('image'), createProduct); // Correct POST route with file upload middleware
// router.get('/', getAllProducts);
// //router.put('/:id', updateProduct);
// router.put('/:id', upload.single('image'), updateProduct);
// router.delete('/:id', deleteProduct);
// router.put('/products/:id', updateProduct);


// module.exports = router;

const express = require('express');
const router = express.Router();
const { createProduct, getAllProducts, updateProduct, deleteProduct, deleteProducts } = require('../controllers/productController');
const multer = require('multer');
const upload = multer({storage: multer.memoryStorage() }); // Set up multer for file uploads
const streamifier = require("streamifier");// Define routes
// POST: Create a new product (with multiple images)
router.post('/', upload.array('images', 5), createProduct); // Use 'images' as the field name, allowing up to 5 files

// GET: Get all products
router.get('/', getAllProducts);

// PUT: Update a product (with optional new images)
router.put('/:id', upload.array('images', 5), updateProduct); // Allow updating the product and adding new images

// DELETE: Delete a product
router.delete('/:id', deleteProduct);
// Bulk delete route
router.post('/bulk-delete', deleteProducts);
module.exports = router;



