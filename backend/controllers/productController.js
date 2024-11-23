
// const Product = require('../models/Product');
// const path = require('path');

// // Create a new product
// exports.createProduct = async (req, res) => {
//   const { name, description, price, category } = req.body;
//   let imageUrl;

//   if (req.file) {
//     imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
//   } else {
//     return res.status(400).json({ message: 'Image file is required' });
//   }

//   try {
//     const newProduct = new Product({ name, description, price, category, imageUrl });
//     await newProduct.save();

//     res.status(201).json({ message: 'Product created successfully', product: newProduct });
//   } catch (error) {
//     console.error('Error in creating product:', error);
//     res.status(500).json({ message: 'Server error', error });
//   }
// };

// // Get all products
// exports.getAllProducts = async (req, res) => {
//   try {
//     const products = await Product.find();
//     res.json(products);
//   } catch (error) {
//     res.status(400).json({ message: 'Server error', error });
//   }
// };

// // Update a product
// // Update a product
// exports.updateProduct = async (req, res) => {
//   const { name, description, price, category } = req.body;
//   const productId = req.params.id;

//   try {
//     const product = await Product.findById(productId);
//     if (!product) {
//       return res.status(404).json({ message: 'Product not found.' });
//     }

//     // Update fields
//     product.name = name;
//     product.description = description;
//     product.price = price;
//     product.category = category;

//     // Handle image update if a new file is uploaded
//     if (req.file) {
//       product.imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
//     }

//     await product.save(); // Save changes to the database
//     res.json({ message: 'Product updated successfully', product });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };


// // Delete a product
// exports.deleteProduct = async (req, res) => {
//   const { id } = req.params;
//   try {
//     await Product.findByIdAndDelete(id);
//     res.json({ message: 'Product deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error });
//   }
// };
const Product = require('../models/Product');
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");
// Create a new product
exports.createProduct = async (req, res) => {
  const { name, description, price, category } = req.body;

  // Ensure that files were uploaded
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'At least one image file is required' });
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];

  // Upload images to Cloudinary
  const uploadToCloudinary = (file) => {
    return new Promise((resolve, reject) => {
      if (!allowedTypes.includes(file.mimetype)) {
        reject(new Error("Invalid file type. Only JPEG, PNG, and GIF are allowed."));
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "products" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  };

  let imageUploads;
  try {
    imageUploads = await Promise.all(req.files.map((file) => uploadToCloudinary(file)));
    console.log('Uploaded images:', imageUploads);
  } catch (uploadError) {
    return res.status(400).json({ message: 'Error uploading images', error: uploadError });
  }

  const images = imageUploads.map((result) => ({
    public_id: result.public_id,
    url: result.secure_url,
  }));

  console.log('Images array:', images);  // Log images array to verify it

  try {
    const newProduct = new Product({
      name,
      description,
      price,
      category,
      images,  // Ensure the images field is passed correctly
    });

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

exports.deleteProducts = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Invalid request. Provide an array of product IDs.' });
    }

    // Fetch products to get their image public IDs
    const products = await Product.find({ _id: { $in: ids } });

    // Collect all image public IDs from the products
    const imagePublicIds = products.flatMap((product) => product.images.map((img) => img.public_id));

    // Delete images from Cloudinary
    const cloudinaryDeletions = imagePublicIds.map((publicId) =>
      cloudinary.uploader.destroy(publicId)
    );
    await Promise.all(cloudinaryDeletions);

    // Delete the products from the database
    await Product.deleteMany({ _id: { $in: ids } });

    res.status(200).json({ message: 'Products and their images deleted successfully.' });
  } catch (error) {
    console.error('Error in bulk delete:', error);
    res.status(500).json({ message: 'Server error during bulk delete.', error });
  }
};