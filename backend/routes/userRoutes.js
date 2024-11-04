const express = require('express');
const UserController = require('../controllers/userController');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

// Get all users (only admin can access)
router.get('/', verifyToken, isAdmin, UserController.getAllUsers);

// Create a new user (only admin can access)
router.post('/', verifyToken, isAdmin, UserController.createUser);

// Update a user (only admin can access)
router.put('/:id', verifyToken, isAdmin, UserController.updateUser);

// Delete a user (only admin can access)
router.delete('/:id', verifyToken, isAdmin, UserController.deleteUser);

module.exports = router;
