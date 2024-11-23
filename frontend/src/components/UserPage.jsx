import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { Link } from 'react-router-dom';
import {
    Button, CircularProgress, Select, MenuItem, TextField, Card, CardContent,
    Typography, Grid, Box, Modal, AppBar, Toolbar, Menu, IconButton
} from '@mui/material';
import { AccountCircle } from '@mui/icons-material';
import './UserPage.css';

const UserPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showTransaction, setShowTransaction] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [transactionStep, setTransactionStep] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState('credit-card');
    const [quantity, setQuantity] = useState(1);
    const [userId, setUserId] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [orderHistory, setOrderHistory] = useState([]);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [profileData, setProfileData] = useState({ name: '', email: '' });
    
    // Filter states
    const [categoryFilter, setCategoryFilter] = useState('');
    const [priceFilter, setPriceFilter] = useState([0, 10000000]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                const isGoogleToken = decodedToken.iss?.includes('accounts.google.com');
                if (isGoogleToken) {
                    setUserId(decodedToken.sub);
                } else {
                    setUserId(decodedToken.userId);
                }
            } catch (error) {
                console.error('Error decoding token:', error);
            }
        }

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
    }, []);

    // Extract unique categories from products
    const categories = [...new Set(products.map(product => product.category))];

    // Filter products based on category and price
    const filteredProducts = products.filter(product => {
        const isCategoryMatch = categoryFilter ? product.category === categoryFilter : true;
        const isPriceMatch = product.price >= priceFilter[0] && product.price <= priceFilter[1];
        return isCategoryMatch && isPriceMatch;
    });

    const handlePurchase = (product) => {
        setSelectedProduct(product);
        setShowTransaction(true);
        setTransactionStep(1);
        setQuantity(1);
    };

    const closeTransaction = () => {
        setShowTransaction(false);
        setSelectedProduct(null);
        setTransactionStep(1);
    };

    const proceedToConfirmation = async () => {
        try {
            const token = localStorage.getItem('token');
            const savedUserId = localStorage.getItem('userId');
    
            if (!token) {
                throw new Error('You must be logged in to make a purchase');
            }
    
            const finalUserId = userId || savedUserId;
            if (!finalUserId) {
                throw new Error('User ID is required');
            }
    
            if (!selectedProduct || !selectedProduct._id || !quantity) {
                throw new Error('Product and quantity are required');
            }
    
            const productList = [
                {
                    product: selectedProduct._id,
                    quantity,
                    name: selectedProduct.name, // Include product name
                    imageUrl: selectedProduct.images?.[0]?.url || '/default-placeholder.png', // Include product image URL
                },
            ];
    
            if (!paymentMethod) {
                throw new Error('Payment method is required');
            }
    
            const totalAmount = selectedProduct.price * quantity; // Calculate total amount
    
            const response = await axios.post(
                'http://localhost:5000/api/transactions/purchase',
                {
                    products: productList,
                    paymentMethod,
                    userId: finalUserId, // Ensure userId is sent
                    totalAmount, // Include totalAmount in the request
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
    
            setTransactionStep(2); // Proceed to confirmation step
            console.log('Transaction successful:', response.data);
        } catch (error) {
            console.error('Error during transaction:', error.message);
            setError(
                'Error during transaction: ' +
                    (error.response ? error.response.data.message : error.message)
            );
        }
    };

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    if (loading) return <CircularProgress />;
    if (error) return <div className="error">{error}</div>;

    return (
        <div sx={{ padding: 4 }}>
            {/* Navbar */}
            <AppBar position="sticky">
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        User Page
                    </Typography>
                    <IconButton
                        edge="end"
                        color="inherit"
                        onClick={handleMenuClick}
                        aria-label="account"
                    >
                        <AccountCircle />
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                    >
                        <MenuItem component={Link} to="/user/transactions">Order History</MenuItem>
                        <MenuItem component={Link} to="/update-profile">Update Profile</MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>

          
    <Box
      sx={{
        marginTop: 4,
        padding: 3,
        backgroundColor: '#ffffff',
        borderRadius: 2,
        boxShadow: 3,
        marginBottom: 4,
        width: '100%',
      }}
    >
      <Typography variant="h6" gutterBottom align="center" sx={{ color: '#333' }}>
        Filter Products
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <Grid container spacing={2} justifyContent="center">
          {/* Category Filter */}
          <Grid item xs={12} sm={6} md={4}>
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              fullWidth
              variant="outlined"
              sx={{
                backgroundColor: '#f5f5f5',
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                  paddingRight: 2,
                },
              }}
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((category, index) => (
                <MenuItem key={index} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </Grid>

          {/* Min Price Filter */}
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Min Price"
              type="number"
              value={priceFilter[0]}
              onChange={(e) => setPriceFilter([Number(e.target.value), priceFilter[1]])}
              fullWidth
              variant="outlined"
              sx={{
                backgroundColor: '#f5f5f5',
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                  paddingRight: 2,
                },
              }}
            />
          </Grid>

          {/* Max Price Filter */}
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Max Price"
              type="number"
              value={priceFilter[1]}
              onChange={(e) => setPriceFilter([priceFilter[0], Number(e.target.value)])}
              fullWidth
              variant="outlined"
              sx={{
                backgroundColor: '#f5f5f5',
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                  paddingRight: 2,
                },
              }}
            />
          </Grid>
        </Grid>

        {/* Apply Filter Button */}
        <Button
          variant="contained"
          sx={{
            marginTop: 2,
            backgroundColor: '#1976d2',
            color: '#fff',
            '&:hover': {
              backgroundColor: '#1565c0',
            },
            padding: '8px 24px',
          }}
          onClick={() => {
            // Logic to apply the filter can be placed here
          }}
        >
          Apply Filters
        </Button>
      </Box>
    </Box>
  




            {/* Products */}
            <Typography variant="h4" gutterBottom align="center" sx={{ marginTop: 4 }}>
                Available Products
            </Typography>

            <Grid container spacing={4} justifyContent="center">
                {filteredProducts.map((product) => (
                    <Grid item xs={12} sm={6} md={4} key={product._id}>
                        <Card sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            padding: 2,
                            borderRadius: 2,
                            boxShadow: 3,
                            transition: 'transform 0.3s ease',
                            '&:hover': {
                                transform: 'scale(1.05)',
                            }
                        }}>
                            <img
                                src={product?.images?.[0]?.url || '/default-placeholder.png'}
                                alt={product?.name}
                                style={{
                                    width: '100%',
                                    height: 150,
                                    objectFit: 'cover',
                                    borderRadius: 8,
                                }}
                            />
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {product.name}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    {product.description}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    {product.category}
                                </Typography>
                                <Typography variant="h6" color="primary">
                                    ₱{product.price.toFixed(2)}
                                </Typography>
                            </CardContent>
                            <Button variant="contained" color="primary" onClick={() => handlePurchase(product)}>
                                Buy Now
                            </Button>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Transaction Modal */}
            <Modal
                open={showTransaction}
                onClose={closeTransaction}
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                }}
            >
                <Box sx={{
                    backgroundColor: '#f5f5f5',
                    padding: 4,
                    borderRadius: 2,
                    maxWidth: 400,
                    width: '100%',
                    boxShadow: 3,
                }}>
                    {transactionStep === 1 ? (
                        <>
                            <Typography variant="h6" gutterBottom>Order Details</Typography>
                            <Box display="flex" justifyContent="space-between" mb={2}>
                                <Box display="flex">
                                    <img
                                        src={selectedProduct?.images?.[0]?.url || '/default-placeholder.png'}
                                        alt={selectedProduct?.name}
                                        style={{
                                            width: 50,
                                            height: 50,
                                            objectFit: 'cover',
                                            marginRight: 10,
                                        }}
                                    />
                                    <Typography variant="body1">{selectedProduct?.name}</Typography>
                                </Box>
                                <Typography variant="body2">Price: ₱{selectedProduct?.price}</Typography>
                            </Box>

                            <TextField
                                label="Quantity"
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(Number(e.target.value))}
                                InputProps={{ inputProps: { min: 1, max: 100 } }}
                                fullWidth
                                sx={{ marginBottom: 2 }}
                            />

                            <Typography variant="body2">Total Price: ₱{(selectedProduct?.price * quantity).toFixed(2)}</Typography>

                            <Typography variant="body1" gutterBottom>Payment Method</Typography>
                            <Select
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                fullWidth
                                sx={{ marginBottom: 2 }}
                            >
                                <MenuItem value="credit-card">Credit Card</MenuItem>
                                <MenuItem value="paypal">PayPal</MenuItem>
                                <MenuItem value="bank-transfer">Bank Transfer</MenuItem>
                            </Select>

                            <Box display="flex" justifyContent="space-between">
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={proceedToConfirmation}
                                >
                                    Confirm Purchase
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    onClick={closeTransaction}
                                >
                                    Cancel
                                </Button>
                            </Box>
                        </>
                    ) : (
                        <>
                            <Typography variant="h6" gutterBottom>Thank you for your purchase!</Typography>
                            <Typography>Your order for <strong>{selectedProduct?.name}</strong> has been successfully placed.</Typography>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={closeTransaction}
                                sx={{ marginTop: 2 }}
                            >
                                Close
                            </Button>
                        </>
                    )}
                </Box>
            </Modal>

            
            
        </div>
    );
};

export default UserPage;
