// // Import necessary packages
// const express = require('express');
// const mongoose = require('mongoose');
// const dotenv = require('dotenv');
// const cors = require('cors'); // Import CORS
// const multer = require('multer'); // Import multer for file uploads
// const path = require('path');

// // Import routes
// const authRoutes = require('./routes/auth');
// const productRoutes = require('./routes/productRoutes'); // Ensure the path is correct
// const productController = require('./controllers/productController'); // Import your product controller
// const userRoutes = require('./routes/userRoutes'); // Import user routes
// //const usersController = require('./controllers/userController'); // Import the controller
// const transactionRoutes = require('./routes/transactions'); // Import transaction routes

// // Load environment variables from .env file
// dotenv.config();

// // Initialize Express application
// const app = express();

// // Use CORS middleware to allow cross-origin requests
// app.use(cors());

// // Middleware for parsing JSON bodies
// app.use(express.json());

// // Middleware for handling file uploads
// const upload = multer({ dest: 'uploads/' }); // Define your upload folder

// // Connect to MongoDB
// mongoose.connect(process.env.MONGO_URI, { 
//     useNewUrlParser: true, 
//     useUnifiedTopology: true 
// })
// .then(() => console.log('MongoDB connected'))
// .catch(err => {
//     console.error('MongoDB connection error:', err.message);
//     process.exit(1); // Exit the process with a failure
// });

// // Serve static files from the 'uploads' folder
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // Set up authentication routes
// app.use('/api/auth', authRoutes); 

// // Set up product routes
// app.use('/api/products', productRoutes); 

// // Set up user routes
// app.use('/api/users', userRoutes); // Set up user routes

// // Set up transaction routes
// app.use('/api/transactions', transactionRoutes);

// // Define the route for creating products with image upload
// app.post('/api/products', upload.single('image'), productController.createProduct);

// // Test route
// app.get('/test', (req, res) => {
//     res.send('Server is working!');
// });

// // Error handling middleware
// app.use((err, req, res, next) => {
//     console.error(err.stack); // Log the error stack
//     res.status(500).json({ message: 'Something went wrong!' });
// });

// // Set the port and start the server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });
// Import necessary packages
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors'); // Import CORS
const multer = require('multer'); // Import multer for file uploads
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/productRoutes'); // Ensure the path is correct
const productController = require('./controllers/productController'); // Import your product controller
const userRoutes = require('./routes/userRoutes'); // Import user routes
const transactionRoutes = require('./routes/transactions'); // Import transaction routes

// Load environment variables from .env file
dotenv.config();

// Initialize Express application
const app = express();

// Use CORS middleware to allow cross-origin requests
app.use(cors());

// Middleware for parsing JSON bodies
app.use(express.json());

// Middleware for handling file uploads
const upload = multer({
    storage: multer.memoryStorage(), // Use memory storage
}); // Define your upload folder

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
})
.then(() => console.log('MongoDB connected'))
.catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1); // Exit the process with a failure
});



// Set up authentication routes
app.use('/api/auth', authRoutes); 

// Set up product routes
app.use('/api/products', productRoutes); 

// Set up user routes
app.use('/api/users', userRoutes); // Set up user routes

// Set up transaction routes
app.use('/api/transactions', transactionRoutes);

// Define the route for updating products with image upload (handling multiple images)
app.put('/api/products/:id', upload.array('images', 5), productController.updateProduct); // Handle product update

// Test route
app.get('/test', (req, res) => {
    res.send('Server is working!');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack); // Log the error stack
    res.status(500).json({ message: 'Something went wrong!' });
});

// Set the port and start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
