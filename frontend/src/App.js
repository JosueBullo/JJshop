import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google'; // Import GoogleOAuthProvider
import HomePage from './components/HomePage'; // Import HomePage component
import LayoutAdmin from './components/LayoutAdmin'; // Import AdminLayout for admin routes
import AdminPage from './components/AdminDashboard'; // Import AdminPage for admin overview
import AdminProductPage from './components/AdminProductPage'; // Import AdminProductPage for managing products
import Register from './components/Register'; // Import Register component
import Login from './components/Login'; // Import Login component
import UserPage from './components/UserPage'; // Import UserPage component
import UserTransactionHistory from './components/UserTransactionHistory'; // Import UserTransactionHistory component
import AdminUsers from './components/AdminUsers'; // Import UserTable for user management
import UpdateProfile from './components/UserUpdateProfile'; // Import UpdateProfile component
import AdminTransactionsPage from './components/AdminTransactionsPage'; // Import AdminTransactionsPage component
import SalesChartPage from './components/SalesChartPage'; // Import AdminTransactionsPage component


const App = () => {
    return (
        <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}> {/* Wrap app in GoogleOAuthProvider */}
            <Router>
                <Routes>
                    <Route path="/" element={<HomePage />} /> {/* Set HomePage as the default route */}
                    <Route path="/admin/*" element={<LayoutAdmin />}> {/* Admin layout for nested routes */}
                        <Route path="sales-chart" element={<SalesChartPage />} /> {/* Admin main page */}
                        <Route path="products" element={<AdminProductPage />} /> {/* Manage products page */}
                        <Route path="users" element={<AdminUsers />} /> {/* Manage users page */}
                        <Route path="orders" element={<AdminTransactionsPage />} /> {/* Manage orders page */}
                        

                        {/* Add other admin routes here */}
                    </Route>
                    <Route path="/register" element={<Register />} /> {/* Register route */}
                    <Route path="/login" element={<Login />} /> {/* Login route */}
                    <Route path="/user" element={<UserPage />} /> {/* User page route */}
                    <Route path="/user/transactions" element={<UserTransactionHistory />} /> {/* User transaction history route */}
                    <Route path="/user/update" element={<UpdateProfile />} /> {/* Update user profile route */}
                </Routes>
            </Router>
        </GoogleOAuthProvider>
    );
};

export default App;
