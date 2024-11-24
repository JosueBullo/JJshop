// src/components/AdminLayout.js
import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom'; // Import Link, Outlet, and useNavigate for navigation
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Import FontAwesome component
import { faSignOutAlt, faClipboard, faBoxOpen, faShoppingCart, faUsers, faComments } from '@fortawesome/free-solid-svg-icons'; // Import comment icon
import './LayoutAdmin.css'; // Import the styles

const LayoutAdmin = () => {
    const navigate = useNavigate(); // useNavigate hook for programmatic navigation

    const handleLogout = () => {
        // Clear authentication tokens and user ID from localStorage
        localStorage.removeItem('authToken'); // Example of clearing a token
        localStorage.removeItem('userId'); // Clear the user ID as well
        navigate('/login'); // Redirect to the login page after logging out
    };

    return (
        <div className="admin-layout">
            <nav className="navbar">
                <div className="navbar-brand">
                    <button onClick={handleLogout} className="navbar-item">
                        <FontAwesomeIcon icon={faSignOutAlt} /> Logout
                    </button>
                </div>
                <div className="navbar-menu">
                    <Link to="/admin/sales-chart" className="navbar-item">
                        <FontAwesomeIcon icon={faClipboard} /> Dashboard
                    </Link>
                    <Link to="/admin/products" className="navbar-item">
                        <FontAwesomeIcon icon={faBoxOpen} /> Manage Products
                    </Link>
                    <Link to="/admin/orders" className="navbar-item">
                        <FontAwesomeIcon icon={faShoppingCart} /> Manage Orders
                    </Link>
                    <Link to="/admin/users" className="navbar-item">
                        <FontAwesomeIcon icon={faUsers} /> Manage Users
                    </Link>
                    {/* Add the new Feedback page link */}
                    <Link to="/admin/feedback" className="navbar-item">
                        <FontAwesomeIcon icon={faComments} /> Feedback
                    </Link>
                </div>
            </nav>
            <div className="content">
                <Outlet /> {/* Render the matched child route here */}
            </div>
        </div>
    );
};

export default LayoutAdmin;
