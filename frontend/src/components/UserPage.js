import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // Use named import
import './UserPage.css';

const UserPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activePage, setActivePage] = useState('Products');
    const [showTransaction, setShowTransaction] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [transactionStep, setTransactionStep] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState('credit-card');
    const [quantity, setQuantity] = useState(1);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                // Decode token to get the userId if not stored separately
                const decodedToken = jwtDecode(token); 
                setUserId(decodedToken.userId); // Extract userId from the decoded token
            } catch (error) {
                console.error('Error decoding token:', error);
            }
        }

        // Fetch products from the backend
        const fetchProducts = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/products');
                setProducts(response.data);
            } catch (err) {
                setError(err.response ? err.response.data : 'Error fetching products');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []); // Empty dependency ensures this runs only once after initial render

    // Handle purchase flow
    const handlePurchase = (product) => {
        setSelectedProduct(product);
        setShowTransaction(true);
        setTransactionStep(1); // Reset to the first step in the transaction
        setQuantity(1); // Reset quantity to 1 when starting a new purchase
    };

    // Close transaction modal
    const closeTransaction = () => {
        setShowTransaction(false);
        setSelectedProduct(null);
        setTransactionStep(1);
    };

    const proceedToConfirmation = async () => {
        try {
            const token = localStorage.getItem('token');  // Get token from localStorage
            const userId = localStorage.getItem('userId');  // Get userId from localStorage
    
            if (!token) {
                throw new Error('You must be logged in to make a purchase');
            }
    
            // Check if selectedProduct and quantity are available
            if (!selectedProduct || !selectedProduct._id || !quantity) {
                throw new Error('Product and quantity are required');
            }
    
            // Correctly structure the product list for the backend with selected quantity
            const productList = [{ product: selectedProduct._id, quantity }];
    
            // Ensure that paymentMethod is selected
            if (!paymentMethod) {
                throw new Error('Payment method is required');
            }
    
            // Send the correct payload to the backend
            const response = await axios.post('http://localhost:5000/api/transactions/purchase', {
                products: productList,  // Send the array of products
                paymentMethod,  // Payment method
                userId,  // User ID
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`  // Pass token in the header
                }
            });
    
            // Handle successful transaction creation
            setTransactionStep(2);  // Move to confirmation step
            console.log('Transaction successful:', response.data);
        } catch (error) {
            // Log error and display it to the user
            console.error('Error during transaction:', error.message);
            setError('Error during transaction: ' + (error.response ? error.response.data.message : error.message));
        }
    };
    

    if (loading) return <div className="loading">Loading products...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="dashboard">
            <nav className="sidebar">
                <h2>Shop Dashboard</h2>
                <ul>
                    <li 
                        onClick={() => setActivePage('Products')}
                        className={activePage === 'Products' ? 'active' : ''}
                    >
                        Products
                    </li>
                    <li 
                        onClick={() => setActivePage('Orders')}
                        className={activePage === 'Orders' ? 'active' : ''}
                    >
                        Orders
                    </li>
                    <li 
                        onClick={() => setActivePage('Profile')}
                        className={activePage === 'Profile' ? 'active' : ''}
                    >
                        Profile
                    </li>
                    <li 
                        onClick={() => setActivePage('Settings')}
                        className={activePage === 'Settings' ? 'active' : ''}
                    >
                        Settings
                    </li>
                </ul>
            </nav>
            <div className="main-content">
                <header className="dashboard-header">
                    <h1>Welcome to Our Shop</h1>
                    <p>Explore our collection</p>
                </header>
                <div className="product-list">
                    {activePage === 'Products' ? (
                        products.map((product) => (
                            <div className="product-card" key={product._id}>
                                <img src={product.imageUrl} alt={product.name} className="product-image" />
                                <div className="product-info">
                                    <h3 className="product-name">{product.name}</h3>
                                    <p className="product-description">{product.description}</p>
                                    <p className="product-price">Price: ${product.price}</p>
                                    <button className="purchase" onClick={() => handlePurchase(product)}>
                                        Purchase
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="welcome-message">Select a menu item to see the content.</div>
                    )}
                </div>

                {/* Transaction Modal */}
                {showTransaction && (
                    <div className="transaction-modal">
                        <div className="transaction-content">
                            {transactionStep === 1 ? (
                                <>
                                    <h2>Order Details</h2>
                                    <p><strong>Product:</strong> {selectedProduct?.name}</p>
                                    <p><strong>Price:</strong> ${selectedProduct?.price}</p>
                                    <p><strong>Total:</strong> ${selectedProduct?.price * quantity}</p>
                                    
                                    {/* Quantity Selector */}
                                    <div className="quantity-selector">
                                        <label htmlFor="quantity">Quantity:</label>
                                        <input
                                            type="number"
                                            id="quantity"
                                            value={quantity}
                                            onChange={(e) => setQuantity(Number(e.target.value))}
                                            min="1"
                                            max="100" // You can adjust the max value as needed
                                        />
                                    </div>

                                    <div className="payment-options">
                                        <h3>Payment Options</h3>
                                        <select
                                            className="payment-select"
                                            value={paymentMethod}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        >
                                            <option value="credit-card">Credit Card</option>
                                            <option value="paypal">PayPal</option>
                                            <option value="bank-transfer">Bank Transfer</option>
                                        </select>
                                    </div>
                                    <button onClick={proceedToConfirmation}>Confirm Purchase</button>
                                    <button onClick={closeTransaction} style={{ marginTop: '10px' }}>Cancel</button>
                                </>
                            ) : (
                                <>
                                    <h2>Thank you for your purchase!</h2>
                                    <p>Your order for <strong>{selectedProduct?.name}</strong> has been successfully placed.</p>
                                    <button onClick={closeTransaction}>Close</button>
                                </>
                            )}
                        </div>
                    </div>  
                )}
            </div>
        </div>
    );
};

export default UserPage;
