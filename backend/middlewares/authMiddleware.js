const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Adjust the path if necessary

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']; // Extract token from 'Authorization' header

    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }

    jwt.verify(token.split(" ")[1], process.env.JWT_SECRET, (err, decoded) => {  // Assuming the format "Bearer <token>"
        if (err) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        
        req.userId = decoded.id; // Attach the user ID to the request object for use in other middlewares or route handlers
        next(); // Proceed to the next middleware or route handler
    });
};

// Middleware to check if the user is an admin
const isAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId); // Find the user by the ID attached to the request

        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin privileges required' });
        }

        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        console.error('Error checking admin status:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    verifyToken,
    isAdmin
};
